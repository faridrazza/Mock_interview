
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  try {
    const requestId = crypto.randomUUID();
    console.log(`[${requestId}] Starting expired subscriptions check`);

    const now = new Date().toISOString();
    
    // Find all canceled subscriptions with end_date before now
    const { data: expiredSubscriptions, error: fetchError } = await supabase
      .from("subscriptions")
      .select("id, user_id, payment_provider_subscription_id, plan_type, end_date")
      .eq("payment_status", "canceled")
      .lt("end_date", now)
      .is("payment_status", "canceled"); // Double check status
    
    if (fetchError) {
      console.error(`[${requestId}] Error fetching expired subscriptions:`, fetchError);
      throw fetchError;
    }
    
    console.log(`[${requestId}] Found ${expiredSubscriptions?.length || 0} expired subscriptions to process`);
    
    const results = [];
    
    // Process each expired subscription
    if (expiredSubscriptions && expiredSubscriptions.length > 0) {
      for (const subscription of expiredSubscriptions) {
        try {
          console.log(`[${requestId}] Processing expired subscription: ${subscription.id} for user ${subscription.user_id}`);
          
          // Update subscription status to expired
          const { error: updateSubError } = await supabase
            .from("subscriptions")
            .update({
              payment_status: "expired"
            })
            .eq("id", subscription.id);
          
          if (updateSubError) {
            console.error(`[${requestId}] Error updating subscription:`, updateSubError);
            results.push({
              subscription_id: subscription.id,
              success: false,
              error: updateSubError.message
            });
            continue;
          }
          
          // Downgrade user profile to bronze tier
          const { error: updateProfileError } = await supabase
            .from("profiles")
            .update({
              subscription_tier: "bronze",
              subscription_status: "expired"
            })
            .eq("id", subscription.user_id);
          
          if (updateProfileError) {
            console.error(`[${requestId}] Error updating user profile:`, updateProfileError);
            results.push({
              subscription_id: subscription.id,
              success: false,
              error: updateProfileError.message
            });
            continue;
          }
          
          console.log(`[${requestId}] Successfully expired subscription ${subscription.id} and downgraded user ${subscription.user_id} to bronze`);
          
          results.push({
            subscription_id: subscription.id,
            success: true
          });
        } catch (err) {
          console.error(`[${requestId}] Error processing subscription ${subscription.id}:`, err);
          results.push({
            subscription_id: subscription.id,
            success: false,
            error: err.message
          });
        }
      }
    }
    
    return new Response(
      JSON.stringify({ 
        success: true,
        processed: expiredSubscriptions?.length || 0,
        results,
        timestamp: new Date().toISOString()
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error(`Error checking expired subscriptions:`, error);
    
    return new Response(
      JSON.stringify({ 
        success: false,
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
