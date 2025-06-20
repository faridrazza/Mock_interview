
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

console.log('Hello from cancel-subscription edge function!');

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { subscription_id, user_id, is_redundant = false } = await req.json();
    
    if (!subscription_id) {
      return new Response(
        JSON.stringify({
          status: 'error',
          error: 'Missing subscription_id',
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
    
    // Create a Supabase client with the Supabase URL and service role key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        }
      }
    );
    
    console.log(`Cancelling subscription ${subscription_id}`);
    
    // First, get the subscription details from the database
    const { data: subscriptionData, error: subscriptionError } = await supabaseAdmin
      .from('subscriptions')
      .select('*')
      .eq('payment_provider_subscription_id', subscription_id)
      .single();
    
    if (subscriptionError || !subscriptionData) {
      return new Response(
        JSON.stringify({
          status: 'error',
          error: subscriptionError?.message || 'Subscription not found',
        }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
    
    console.log('Found subscription in database:', subscriptionData);
    
    // If we're handling a redundant subscription cancellation, we might skip PayPal cancellation
    // if the subscription has already been replaced by another one
    let paypalCancellationRequired = true;
    
    // For redundant subscriptions, check the profile to see if the subscription type is still active
    if (is_redundant) {
      // Get the user's profile to check subscription status
      const { data: profileData, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('id', subscriptionData.user_id)
        .single();
      
      if (!profileError && profileData) {
        // If this is a resume subscription and the interview subscription includes resume features
        if (subscriptionData.subscription_type === 'resume') {
          const interviewTier = profileData.subscription_tier;
          
          // If the interview tier includes resume features, mark as redundant
          if (['gold', 'diamond', 'megastar'].includes(interviewTier)) {
            console.log(`Redundant subscription detected: ${subscriptionData.plan_type} vs ${interviewTier}`);
          }
        }
      }
    }
    
    // Cancel the subscription with PayPal if required
    if (paypalCancellationRequired) {
      // Prepare the API call to PayPal
      const paypalApiUrl = Deno.env.get('PAYPAL_API_URL') || 'https://api-m.sandbox.paypal.com';
      const clientId = Deno.env.get('PAYPAL_CLIENT_ID') || '';
      const clientSecret = Deno.env.get('PAYPAL_SECRET_KEY') || '';
      
      console.log('Preparing to call PayPal API...');
      
      // Get an access token from PayPal
      const tokenResponse = await fetch(`${paypalApiUrl}/v1/oauth2/token`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: 'grant_type=client_credentials'
      });
      
      if (!tokenResponse.ok) {
        const tokenError = await tokenResponse.text();
        console.error('Failed to get PayPal access token:', tokenError);
        return new Response(
          JSON.stringify({
            status: 'error',
            error: 'Failed to authenticate with PayPal API',
          }),
          {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
      
      const tokenData = await tokenResponse.json();
      const accessToken = tokenData.access_token;
      
      console.log('Received PayPal access token');
      
      // Call the PayPal API to cancel the subscription
      const cancelResponse = await fetch(
        `${paypalApiUrl}/v1/billing/subscriptions/${subscription_id}/cancel`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            reason: 'Canceled by user'
          })
        }
      );
      
      if (!cancelResponse.ok) {
        const cancelError = await cancelResponse.text();
        console.error('Failed to cancel PayPal subscription:', cancelError);
        
        // If it's a 404, the subscription might have already been cancelled or doesn't exist in PayPal
        if (cancelResponse.status === 404) {
          console.log('Subscription not found in PayPal, but will proceed to update database');
        } else {
          return new Response(
            JSON.stringify({
              status: 'error',
              error: 'Failed to cancel subscription with PayPal',
              details: cancelError
            }),
            {
              status: 500,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          );
        }
      } else {
        console.log('Successfully cancelled subscription with PayPal');
      }
    } else {
      console.log('Skipping PayPal cancellation for redundant subscription');
    }
    
    // Update the subscription in the database
    const { error: updateError } = await supabaseAdmin
      .from('subscriptions')
      .update({ 
        payment_status: 'canceled',
        end_date: new Date().toISOString()
      })
      .eq('payment_provider_subscription_id', subscription_id);
    
    if (updateError) {
      console.error('Failed to update subscription in database:', updateError);
      return new Response(
        JSON.stringify({
          status: 'error',
          error: 'Failed to update subscription status',
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
    
    console.log('Successfully updated subscription in database');
    
    // Update the user's profile if needed
    if (subscriptionData.subscription_type === 'resume') {
      // Update resume_subscription_tier and resume_subscription_status
      const { error: profileUpdateError } = await supabaseAdmin
        .from('profiles')
        .update({
          resume_subscription_tier: 'free',
          resume_subscription_status: 'canceled'
        })
        .eq('id', subscriptionData.user_id);
      
      if (profileUpdateError) {
        console.error('Failed to update profile:', profileUpdateError);
      } else {
        console.log('Successfully updated profile resume subscription status');
      }
    } else {
      // Update subscription_tier and subscription_status
      const { error: profileUpdateError } = await supabaseAdmin
        .from('profiles')
        .update({
          subscription_tier: 'free',
          subscription_status: 'canceled'
        })
        .eq('id', subscriptionData.user_id);
      
      if (profileUpdateError) {
        console.error('Failed to update profile:', profileUpdateError);
      } else {
        console.log('Successfully updated profile subscription status');
      }
    }
    
    return new Response(
      JSON.stringify({
        status: 'success',
        message: 'Subscription cancelled successfully',
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (err) {
    console.error('Error in cancel-subscription function:', err);
    
    return new Response(
      JSON.stringify({
        status: 'error',
        error: err.message || 'An unexpected error occurred',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
