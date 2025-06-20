
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const anonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";

// Initialize Supabase client with service role key for admin privileges
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  try {
    // First, check if pg_cron and pg_net extensions are enabled
    const { data: extensions, error: extensionsError } = await supabase.rpc('get_installed_extensions');
    
    if (extensionsError) {
      return new Response(
        JSON.stringify({ 
          error: "Failed to check installed extensions",
          details: extensionsError.message
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Check if required extensions are installed
    const pgCronInstalled = extensions.some((ext: any) => ext.name === 'pg_cron');
    const pgNetInstalled = extensions.some((ext: any) => ext.name === 'pg_net');

    if (!pgCronInstalled || !pgNetInstalled) {
      return new Response(
        JSON.stringify({ 
          error: "Required extensions not installed",
          details: `pg_cron: ${pgCronInstalled}, pg_net: ${pgNetInstalled}`,
          message: "Please enable pg_cron and pg_net extensions in your Supabase project."
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Set up cron job to check expired subscriptions
    const cronJobName = 'check-expired-subscriptions';
    const cronSchedule = '0 0 * * *'; // Run at midnight daily
    const functionUrl = `${supabaseUrl}/functions/v1/check-expired-subscriptions`;

    // Create the SQL to set up the cron job
    // First check if job already exists
    const { data: existingJobs, error: jobsError } = await supabase.rpc(
      'check_if_cron_job_exists',
      { job_name: cronJobName }
    );

    if (jobsError) {
      return new Response(
        JSON.stringify({ 
          error: "Failed to check if cron job exists",
          details: jobsError.message
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    let jobAction;
    if (existingJobs && existingJobs.exists) {
      // Update existing job
      const { data, error } = await supabase.rpc(
        'update_cron_job',
        { 
          job_name: cronJobName,
          job_schedule: cronSchedule,
          job_command: `
            select
              net.http_post(
                url:='${functionUrl}',
                headers:='{"Content-Type": "application/json", "Authorization": "Bearer ${anonKey}"}'::jsonb,
                body:='{}'::jsonb
              ) as request_id;
          `
        }
      );

      if (error) {
        return new Response(
          JSON.stringify({ 
            error: "Failed to update cron job",
            details: error.message
          }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      jobAction = 'updated';
    } else {
      // Create new job
      const { data, error } = await supabase.rpc(
        'create_cron_job',
        { 
          job_name: cronJobName,
          job_schedule: cronSchedule,
          job_command: `
            select
              net.http_post(
                url:='${functionUrl}',
                headers:='{"Content-Type": "application/json", "Authorization": "Bearer ${anonKey}"}'::jsonb,
                body:='{}'::jsonb
              ) as request_id;
          `
        }
      );

      if (error) {
        return new Response(
          JSON.stringify({ 
            error: "Failed to create cron job",
            details: error.message
          }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      jobAction = 'created';
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: `Cron job successfully ${jobAction}`,
        details: {
          name: cronJobName,
          schedule: cronSchedule,
          function: "check-expired-subscriptions"
        }
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ 
        error: error.message || "An unexpected error occurred",
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
