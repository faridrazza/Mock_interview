
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    // Generate a unique request ID for tracking
    const requestId = crypto.randomUUID();
    console.log(`[${requestId}] Starting client config request`);

    // Parse request body
    const { config_key } = await req.json();

    if (!config_key) {
      console.error(`[${requestId}] Missing required parameter: config_key`);
      return new Response(
        JSON.stringify({ error: "Missing required parameter: config_key" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    let configValue = "";
    
    // Only allow specific config keys to be requested
    switch (config_key) {
      case "PAYPAL_CLIENT_ID":
        configValue = Deno.env.get("PAYPAL_CLIENT_ID") || "";
        
        // Check if the client ID is actually set
        if (!configValue) {
          console.error(`[${requestId}] PAYPAL_CLIENT_ID environment variable is not set`);
          return new Response(
            JSON.stringify({ 
              error: "PayPal client ID not configured", 
              details: "The PAYPAL_CLIENT_ID environment variable is not set in your Supabase project."
            }),
            {
              status: 500,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }
        
        // For sandbox testing - log the environment
        if (configValue === "test" || configValue.includes("sandbox")) {
          console.log(`[${requestId}] Using sandbox PayPal client ID`);
        } else {
          console.log(`[${requestId}] Using production PayPal client ID`);
        }
        
        break;
      default:
        console.error(`[${requestId}] Requested config key is not allowed: ${config_key}`);
        return new Response(
          JSON.stringify({ error: "Requested config key is not allowed" }),
          {
            status: 403,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
    }

    if (!configValue) {
      console.error(`[${requestId}] Config value not found for key: ${config_key}`);
      return new Response(
        JSON.stringify({ error: `Config value not found for key: ${config_key}` }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log(`[${requestId}] Successfully retrieved config for key: ${config_key}`);

    // Return the config value with appropriate casing for client use
    const response = config_key === "PAYPAL_CLIENT_ID" 
      ? { clientId: configValue } 
      : { value: configValue };

    return new Response(
      JSON.stringify(response),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    const errorId = crypto.randomUUID();
    console.error(`[${errorId}] Error processing request:`, error);
    return new Response(
      JSON.stringify({ 
        error: error.message || "An unexpected error occurred",
        errorId,
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
}); 
