import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

/**
 * DEPRECATED: This function is deprecated in favor of the client-side PayPal SDK approach using get-paypal-plan-id.
 * Please update your application to use the new approach for better reliability and user experience.
 */

const PAYPAL_CLIENT_ID = Deno.env.get("PAYPAL_CLIENT_ID") || "";
const PAYPAL_SECRET_KEY = Deno.env.get("PAYPAL_SECRET_KEY") || "";
const PAYPAL_API_URL = Deno.env.get("PAYPAL_API_URL") || "https://api-m.sandbox.paypal.com"; // Use sandbox for testing

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
    console.log(`[${requestId}] [DEPRECATED] Starting PayPal subscription creation - this endpoint is deprecated`);

    // Parse request body
    const { plan_type, billing_cycle, price, user_email, user_id } = await req.json();
    
    // Log deprecation warning
    console.warn(`[${requestId}] DEPRECATION WARNING: The create-paypal-subscription function is deprecated. 
      Please use the client-side PayPal SDK approach with the get-paypal-plan-id function instead.`);
    
    return new Response(
      JSON.stringify({ 
        error: "This endpoint is deprecated",
        message: "Please use the client-side PayPal SDK approach with the get-paypal-plan-id function",
        requestId
      }),
      {
        status: 410, // Gone status code
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
    
    if (!plan_type || !billing_cycle || !price || !user_email || !user_id) {
      console.error(`[${requestId}] Missing required parameters`);
      return new Response(
        JSON.stringify({ error: "Missing required parameters" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Verify PayPal API credentials are available
    if (!PAYPAL_CLIENT_ID || !PAYPAL_SECRET_KEY) {
      console.error(`[${requestId}] Missing PayPal API credentials`);
      return new Response(
        JSON.stringify({ error: "PayPal API credentials not configured" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Get PayPal access token
    console.log(`[${requestId}] Requesting PayPal access token`);
    const tokenResponse = await fetch(`${PAYPAL_API_URL}/v1/oauth2/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": `Basic ${btoa(`${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET_KEY}`)}`,
      },
      body: "grant_type=client_credentials",
    });

    const tokenData = await tokenResponse.json();
    
    if (!tokenResponse.ok) {
      console.error(`[${requestId}] Failed to get PayPal access token:`, tokenData);
      return new Response(
        JSON.stringify({ 
          error: "Failed to authenticate with PayPal", 
          details: tokenData.error_description || "Authentication error",
          requestId 
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const accessToken = tokenData.access_token;
    console.log(`[${requestId}] Successfully obtained PayPal access token`);
    
    // Define subscription attributes based on plan type and billing cycle
    const planName = plan_type.charAt(0).toUpperCase() + plan_type.slice(1);
    const billingCycleUnit = billing_cycle === "yearly" ? "YEAR" : "MONTH";
    const billingCycleCount = 1;
    
    // Create product if it doesn't exist
    console.log(`[${requestId}] Creating product in PayPal`);
    const productResponse = await fetch(`${PAYPAL_API_URL}/v1/catalogs/products`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`,
        "PayPal-Request-Id": `product-${requestId}`,
      },
      body: JSON.stringify({
        name: `Mockinterview4u ${planName} Plan ${billing_cycle === "yearly" ? "Annual" : "Monthly"}`,
        description: `Mockinterview4u ${planName} subscription plan with ${billing_cycle} billing cycle`,
        type: "SERVICE",
        category: "SOFTWARE",
      }),
    });

    const productData = await productResponse.json();
    
    if (!productResponse.ok) {
      console.error(`[${requestId}] Failed to create product:`, productData);
      return new Response(
        JSON.stringify({ 
          error: "Failed to create subscription product", 
          details: productData.message || "Product creation failed",
          requestId 
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log(`[${requestId}] Successfully created product: ${productData.id}`);

    // Create plan
    console.log(`[${requestId}] Creating billing plan in PayPal`);
    const planResponse = await fetch(`${PAYPAL_API_URL}/v1/billing/plans`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`,
        "PayPal-Request-Id": `plan-${requestId}`,
        "Prefer": "return=representation",
      },
      body: JSON.stringify({
        product_id: productData.id,
        name: `${planName} ${billing_cycle === "yearly" ? "Annual" : "Monthly"} Plan`,
        status: "ACTIVE",
        billing_cycles: [
          {
            frequency: {
              interval_unit: billingCycleUnit,
              interval_count: billingCycleCount,
            },
            tenure_type: "REGULAR",
            sequence: 1,
            total_cycles: 0, // Ongoing subscription
            pricing_scheme: {
              fixed_price: {
                value: price,
                currency_code: "USD",
              },
            },
          },
        ],
        payment_preferences: {
          auto_bill_outstanding: true,
          setup_fee: {
            value: "0",
            currency_code: "USD",
          },
          setup_fee_failure_action: "CONTINUE",
          payment_failure_threshold: 3,
        },
      }),
    });

    const planData = await planResponse.json();
    
    if (!planResponse.ok) {
      console.error(`[${requestId}] Failed to create billing plan:`, planData);
      return new Response(
        JSON.stringify({ 
          error: "Failed to create billing plan", 
          details: planData.message || "Plan creation failed",
          requestId 
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log(`[${requestId}] Successfully created billing plan: ${planData.id}`);

    // Get the correct return URL for the environment
    let baseUrl;
    const origin = req.headers.get("origin") || "";
    
    // Determine which environment we're in
    if (origin.includes('localhost')) {
      // Local development
      baseUrl = origin;
    } else if (origin.includes('lovable.app')) {
      // Lovable preview environment
      baseUrl = origin;
    } else {
      // Production environment
      baseUrl = Deno.env.get("APP_HOST") || "https://interviewmaster.ai";
    }
    
    console.log(`[${requestId}] Using base URL for return URLs: ${baseUrl}`);

    // Create subscription
    console.log(`[${requestId}] Subscription request payload:`, JSON.stringify({
      plan_id: planData.id,
      subscriber: { name: { given_name: "Subscriber", surname: "User" }, email_address: user_email },
      application_context: {
        brand_name: "Mockinterview4u",
        locale: "en-US",
        shipping_preference: "NO_SHIPPING",
        user_action: "SUBSCRIBE_NOW",
        return_url: `${baseUrl}/dashboard?tab=subscription&success=true&subscription_id={subscription_id}`,
        cancel_url: `${baseUrl}/dashboard?tab=subscription&success=false`
      },
      custom_id: user_id
    }));

    console.log(`[${requestId}] Creating subscription in PayPal`);
    const subscriptionResponse = await fetch(`${PAYPAL_API_URL}/v1/billing/subscriptions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`,
        "PayPal-Request-Id": `subscription-${requestId}`,
      },
      body: JSON.stringify({
        plan_id: planData.id,
        subscriber: {
          name: {
            given_name: "Subscriber",
            surname: "User"
          },
          email_address: user_email
        },
        application_context: {
          brand_name: "Mockinterview4u",
          locale: "en-US",
          shipping_preference: "NO_SHIPPING",
          user_action: "SUBSCRIBE_NOW",
          return_url: `${baseUrl}/dashboard?tab=subscription&success=true&subscription_id={subscription_id}`,
          cancel_url: `${baseUrl}/dashboard?tab=subscription&success=false`
        },
        custom_id: user_id
      }),
    });

    // Log full response details for debugging
    const responseStatus = subscriptionResponse.status;
    const responseStatusText = subscriptionResponse.statusText;
    console.log(`[${requestId}] Subscription creation response status: ${responseStatus} ${responseStatusText}`);

    const subscriptionData = await subscriptionResponse.json();
    
    if (!subscriptionResponse.ok) {
      console.error(`[${requestId}] Failed to create subscription:`, {
        status: responseStatus,
        statusText: responseStatusText,
        data: subscriptionData
      });
      
      return new Response(
        JSON.stringify({
          error: "Failed to create subscription", 
          details: subscriptionData.message || "Subscription creation failed",
          requestId
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log(`[${requestId}] Successfully created subscription: ${subscriptionData.id}`);

    // Extract approval URL for redirecting user
    const approvalUrl = subscriptionData.links.find(
      (link: any) => link.rel === "approve"
    )?.href;

    if (!approvalUrl) {
      console.error(`[${requestId}] No approval URL found in subscription response`);
      return new Response(
        JSON.stringify({ 
          error: "Failed to get subscription approval URL",
          requestId 
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Return approval URL and subscription ID
    console.log(`[${requestId}] Returning subscription data with approval URL: ${approvalUrl}`);
    return new Response(
      JSON.stringify({
        subscriptionId: subscriptionData.id,
        approvalUrl,
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
        note: "This endpoint is deprecated. Please use the client-side PayPal SDK approach with the get-paypal-plan-id function",
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
