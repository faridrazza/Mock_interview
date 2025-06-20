
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const supabaseUrl = Deno.env.get('SUPABASE_URL') as string;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { session, userId } = await req.json();

    if (!session || !userId) {
      return new Response(
        JSON.stringify({ error: "Session data and userId are required" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log("Saving interview session:", { 
      userId,
      jobRole: session.jobRole,
      companyName: session.companyName,
      status: session.status || 'active'
    });

    // Save interview session to database
    const { data, error } = await supabase
      .from('advanced_interview_sessions')
      .insert({
        user_id: userId,
        job_role: session.jobRole,
        company_name: session.companyName,
        questions: session.questions,
        suggestions: session.suggestions,
        messages: session.messages || [],
        start_time: session.startTime || new Date().toISOString(),
        status: session.status || 'active'
      })
      .select();

    if (error) {
      console.error("Error saving interview session:", error);
      throw new Error(`Database error: ${error.message}`);
    }

    return new Response(
      JSON.stringify({ success: true, sessionId: data[0].id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("Error in save-interview-session function:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to save interview session" }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
