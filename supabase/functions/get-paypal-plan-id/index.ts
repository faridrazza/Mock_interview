import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const PAYPAL_CLIENT_ID = Deno.env.get("PAYPAL_CLIENT_ID") || "";
const PAYPAL_SECRET_KEY = Deno.env.get("PAYPAL_SECRET_KEY") || "";
const PAYPAL_API_URL = Deno.env.get("PAYPAL_API_URL") || "https://api-m.sandbox.paypal.com";

// PayPal Plan IDs - these should match exactly what's in your PayPal dashboard
const PAYPAL_BRONZE_MONTHLY_PLAN_ID = Deno.env.get("PAYPAL_BRONZE_MONTHLY_PLAN_ID") || "";
const PAYPAL_GOLD_MONTHLY_PLAN_ID = Deno.env.get("PAYPAL_GOLD_MONTHLY_PLAN_ID") || "";
const PAYPAL_DIAMOND_MONTHLY_PLAN_ID = Deno.env.get("PAYPAL_DIAMOND_MONTHLY_PLAN_ID") || "";
const PAYPAL_BRONZE_YEARLY_PLAN_ID = Deno.env.get("PAYPAL_BRONZE_YEARLY_PLAN_ID") || "";
const PAYPAL_GOLD_YEARLY_PLAN_ID = Deno.env.get("PAYPAL_GOLD_YEARLY_PLAN_ID") || "";
const PAYPAL_DIAMOND_YEARLY_PLAN_ID = Deno.env.get("PAYPAL_DIAMOND_YEARLY_PLAN_ID") || "";
// Resume plan IDs
const PAYPAL_RESUME_BASIC_PLAN_ID = Deno.env.get("PAYPAL_RESUME_BASIC_PLAN_ID") || "";
const PAYPAL_RESUME_PREMIUM_PLAN_ID = Deno.env.get("PAYPAL_RESUME_PREMIUM_PLAN_ID") || "";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Verify a PayPal plan exists via API if possible
const verifyPlanExists = async (planId: string): Promise<boolean> => {
  if (!planId || !planId.startsWith("P-")) return false;
  
  // If no API credentials, do basic validation only
  if (!PAYPAL_CLIENT_ID || !PAYPAL_SECRET_KEY) {
    console.log("No PayPal API credentials, skipping API validation");
    return true;
  }
  
  try {
    // Get access token
    const tokenResponse = await fetch(`${PAYPAL_API_URL}/v1/oauth2/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": `Basic ${btoa(`${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET_KEY}`)}`
      },
      body: "grant_type=client_credentials"
    });
    
    if (!tokenResponse.ok) {
      console.error("Failed to get PayPal access token:", await tokenResponse.text());
      return false;
    }
    
    const { access_token } = await tokenResponse.json();
    
    // Check if plan exists
    const planResponse = await fetch(`${PAYPAL_API_URL}/v1/billing/plans/${planId}`, {
      headers: {
        "Authorization": `Bearer ${access_token}`,
        "Content-Type": "application/json"
      }
    });
    
    if (!planResponse.ok) {
      console.error("Plan ID verification failed:", await planResponse.text());
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error verifying plan:", error);
    return false;
  }
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
    console.log(`[${requestId}] Starting PayPal plan ID request`);

    // Parse request body
    const { plan_type, billing_cycle, user_id } = await req.json();
    
    console.log(`[${requestId}] Received request:`, { plan_type, billing_cycle, user_id });
    
    if (!plan_type || !billing_cycle || !user_id) {
      console.error(`[${requestId}] Missing required parameters`);
      return new Response(
        JSON.stringify({ error: "Missing required parameters" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Get the appropriate plan ID based on the plan type and billing cycle
    let planId = "";
    let envVarName = "";
    
    if (billing_cycle === "yearly") {
      switch (plan_type.toLowerCase()) {
        case "bronze":
          planId = PAYPAL_BRONZE_YEARLY_PLAN_ID;
          envVarName = "PAYPAL_BRONZE_YEARLY_PLAN_ID";
          break;
        case "gold":
          planId = PAYPAL_GOLD_YEARLY_PLAN_ID;
          envVarName = "PAYPAL_GOLD_YEARLY_PLAN_ID";
          break;
        case "diamond":
        case "megastar": // Added megastar to use the diamond yearly plan
          planId = PAYPAL_DIAMOND_YEARLY_PLAN_ID;
          envVarName = "PAYPAL_DIAMOND_YEARLY_PLAN_ID";
          break;
        // Resume plans currently don't have yearly options, but we can add them in the future
        case "resume_basic":
          planId = PAYPAL_RESUME_BASIC_PLAN_ID;
          envVarName = "PAYPAL_RESUME_BASIC_PLAN_ID";
          break;
        case "resume_premium":
          planId = PAYPAL_RESUME_PREMIUM_PLAN_ID;
          envVarName = "PAYPAL_RESUME_PREMIUM_PLAN_ID";
          break;
        default:
          planId = "";
      }
    } else {
      // Default to monthly
      switch (plan_type.toLowerCase()) {
        case "bronze":
          planId = PAYPAL_BRONZE_MONTHLY_PLAN_ID;
          envVarName = "PAYPAL_BRONZE_MONTHLY_PLAN_ID";
          break;
        case "gold":
          planId = PAYPAL_GOLD_MONTHLY_PLAN_ID;
          envVarName = "PAYPAL_GOLD_MONTHLY_PLAN_ID";
          break;
        case "diamond":
          planId = PAYPAL_DIAMOND_MONTHLY_PLAN_ID;
          envVarName = "PAYPAL_DIAMOND_MONTHLY_PLAN_ID";
          break;
        case "resume_basic":
          planId = PAYPAL_RESUME_BASIC_PLAN_ID;
          envVarName = "PAYPAL_RESUME_BASIC_PLAN_ID";
          break;
        case "resume_premium":
          planId = PAYPAL_RESUME_PREMIUM_PLAN_ID;
          envVarName = "PAYPAL_RESUME_PREMIUM_PLAN_ID";
          break;
        default:
          planId = "";
      }
    }
    
    if (!planId) {
      console.error(`[${requestId}] Plan ID not found for plan_type: ${plan_type}, billing_cycle: ${billing_cycle}`);
      
      // Check if the environment variable exists but is empty
      const envVarExists = Deno.env.get(envVarName) !== undefined;
      let errorMessage = "";
      
      if (envVarExists) {
        errorMessage = `Plan ID environment variable ${envVarName} exists but is empty. Please set a valid PayPal plan ID.`;
      } else {
        errorMessage = `Plan ID environment variable ${envVarName} is not defined. Please create the plan in PayPal and set the environment variable.`;
      }
      
      return new Response(
        JSON.stringify({
          error: errorMessage,
          requestId,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    
    // Validate plan ID format
    if (!planId.startsWith("P-")) {
      console.warn(`[${requestId}] Plan ID format may be incorrect. Expected format like P-xxxxxxxx but got: ${planId}`);
    }
    
    // Verify plan exists via PayPal API if possible
    const planExists = await verifyPlanExists(planId);
    if (!planExists) {
      console.error(`[${requestId}] Plan ID ${planId} does not exist in PayPal or cannot be verified`);
      return new Response(
        JSON.stringify({
          error: `The plan ID ${planId} does not exist in your PayPal account or cannot be verified. Please check that the plan is active in your PayPal dashboard.`,
          requestId,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    
    console.log(`[${requestId}] Found plan ID: ${planId}`);

    // Return the plan ID
    return new Response(
      JSON.stringify({
        planId,
        requestId,
      }),
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
