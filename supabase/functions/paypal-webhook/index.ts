import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};
const PAYPAL_API_URL = Deno.env.get('PAYPAL_API_URL') || 'https://api-m.sandbox.paypal.com';
// Enhanced function to verify PayPal webhook signatures with detailed logging
async function verifyPayPalWebhookSignature(requestBody, headers, requestId = 'webhook') {
  try {
    console.log(`[${requestId}] Starting PayPal signature verification process`);
    const webhookId = Deno.env.get('PAYPAL_WEBHOOK_ID');
    if (!webhookId) {
      console.warn(`[${requestId}] PAYPAL_WEBHOOK_ID environment variable not set, skipping verification`);
      return true // Allowing events without verification if webhook ID isn't set
      ;
    }
    // Enhanced cleaning to ensure only alphanumeric characters remain
    // This handles tabs, newlines, spaces, and any other non-alphanumeric characters
    const cleanWebhookId = webhookId.replace(/[^a-zA-Z0-9]/g, '');
    console.log(`[${requestId}] Original webhook ID: "${webhookId}" (${webhookId.length} chars)`);
    console.log(`[${requestId}] Cleaned webhook ID: "${cleanWebhookId}" (${cleanWebhookId.length} chars)`);
    // Create a case-insensitive header map to handle different header casing
    const headerMap = new Map();
    if (headers instanceof Headers) {
      // For Headers object, use forEach
      headers.forEach((value, key)=>{
        headerMap.set(key.toLowerCase(), value);
      });
    } else {
      // For record object, iterate through keys
      Object.keys(headers).forEach((key)=>{
        headerMap.set(key.toLowerCase(), headers[key]);
      });
    }
    // Log all received headers for debugging
    console.log(`[${requestId}] All received headers:`, Array.from(headerMap.keys()).map((k)=>`${k}: ${headerMap.get(k)?.substring(0, 20)}...`));
    // Get all required headers from the PayPal webhook request
    // Using various possible formats and case-insensitive matching
    const transmissionId = headerMap.get('paypal-transmission-id') || headerMap.get('paypal-transmission-id'.toLowerCase()) || headerMap.get('paypal_transmission_id') || headerMap.get('http_paypal_transmission_id');
    const transmissionTime = headerMap.get('paypal-transmission-time') || headerMap.get('paypal-transmission-time'.toLowerCase()) || headerMap.get('paypal_transmission_time') || headerMap.get('http_paypal_transmission_time');
    const certUrl = headerMap.get('paypal-cert-url') || headerMap.get('paypal-cert-url'.toLowerCase()) || headerMap.get('paypal_cert_url') || headerMap.get('http_paypal_cert_url');
    const authAlgo = headerMap.get('paypal-auth-algo') || headerMap.get('paypal-auth-algo'.toLowerCase()) || headerMap.get('paypal_auth_algo') || headerMap.get('http_paypal_auth_algo');
    const transmissionSig = headerMap.get('paypal-transmission-sig') || headerMap.get('paypal-transmission-sig'.toLowerCase()) || headerMap.get('paypal_transmission_sig') || headerMap.get('http_paypal_transmission_sig');
    console.log(`[${requestId}] Webhook verification headers:
      - Transmission ID: ${transmissionId ? 'Present' : 'Missing'}
      - Transmission Time: ${transmissionTime ? 'Present' : 'Missing'}
      - Cert URL: ${certUrl ? 'Present' : 'Missing'}
      - Auth Algo: ${authAlgo ? 'Present' : 'Missing'}
      - Transmission Signature: ${transmissionSig ? 'Present' : 'Missing'}`);
    if (!transmissionId || !transmissionTime || !transmissionSig) {
      console.warn(`[${requestId}] Missing required PayPal signature headers`);
      // Log available headers to help with debugging
      console.log(`[${requestId}] Received headers:`, Array.from(headerMap.keys()));
      if (Deno.env.get('PAYPAL_SKIP_SIGNATURE_VERIFY') === 'true') {
        console.warn(`[${requestId}] Skipping signature verification as PAYPAL_SKIP_SIGNATURE_VERIFY is set to true`);
        return true;
      }
      return false;
    }
    // Get PayPal access token for API calls
    const accessToken = await getPayPalAccessToken();
      if (!accessToken) {
      console.error(`[${requestId}] Failed to get PayPal access token for webhook verification`);
      return false;
      }
      // Call PayPal verification endpoint
      const verificationData = {
        transmission_id: transmissionId,
        transmission_time: transmissionTime,
        cert_url: certUrl,
        auth_algo: authAlgo,
        transmission_sig: transmissionSig,
        webhook_id: cleanWebhookId,
        webhook_event: JSON.parse(requestBody)
    };
      console.log(`[${requestId}] Calling PayPal to verify webhook signature with id: ${transmissionId}`);
    console.log(`[${requestId}] Using cleaned webhook ID for verification: "${cleanWebhookId}"`);
      const verificationResponse = await fetch(`${PAYPAL_API_URL}/v1/notifications/verify-webhook-signature`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(verificationData)
    });
      if (!verificationResponse.ok) {
      const errorText = await verificationResponse.text();
        console.error(`[${requestId}] PayPal signature verification API call failed: 
          Status: ${verificationResponse.status}
        Response: ${errorText}`);
      return false;
    }
    const verificationResult = await verificationResponse.json();
    const isVerified = verificationResult.verification_status === 'SUCCESS';
      if (isVerified) {
      console.log(`[${requestId}] PayPal webhook signature verified successfully: ${verificationResult.verification_status}`);
      } else {
      console.warn(`[${requestId}] PayPal webhook signature verification failed: ${verificationResult.verification_status}`);
      }
    return isVerified;
    } catch (error) {
    console.error(`[${requestId}] Error verifying PayPal webhook signature:`, error);
    return false;
    }
  }
async function getPayPalAccessToken() {
  const clientId = Deno.env.get('PAYPAL_CLIENT_ID');
  const clientSecret = Deno.env.get('PAYPAL_SECRET_KEY');
  const paypalBaseUrl = Deno.env.get('PAYPAL_API_URL') || 'https://api-m.sandbox.paypal.com';
  if (!clientId || !clientSecret) {
    throw new Error('PayPal API credentials are not set');
  }
  const response = await fetch(`${paypalBaseUrl}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${btoa(`${clientId}:${clientSecret}`)}`
    },
    body: 'grant_type=client_credentials'
  });
  if (!response.ok) {
    throw new Error(`Failed to get PayPal access token: ${await response.text()}`);
  }
  const data = await response.json();
  return data.access_token;
}
async function getSubscriptionDetails(subscriptionId) {
  try {
    const token = await getPayPalAccessToken();
    const paypalBaseUrl = Deno.env.get('PAYPAL_API_URL') || 'https://api-m.sandbox.paypal.com';
    const response = await fetch(`${paypalBaseUrl}/v1/billing/subscriptions/${subscriptionId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    if (!response.ok) {
      throw new Error(`Failed to get subscription details: ${await response.text()}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error getting subscription details:', error);
    throw error;
  }
}
function extractUserInfoFromCustomId(customId1) {
  try {
    if (!customId1) {
      return {
        userId: null,
        planType: null
      };
    }
    if (customId1.includes(':')) {
      const [planType, userId] = customId1.split(':');
      return {
        userId,
        planType
      };
    }
    return {
      userId: null,
      planType: customId1
    };
  } catch (error) {
    console.error('Error extracting user info from custom_id:', error);
    return {
      userId: null,
      planType: null
    };
  }
}
/**
 * Determines whether a subscription is for interviews or resumes
 */ function determineSubscriptionType(subscriptionDetails) {
  try {
    // Check custom_id first
    if (subscriptionDetails.custom_id) {
      const { planType } = extractUserInfoFromCustomId(subscriptionDetails.custom_id);
      if (planType && (planType.startsWith('resume_') || planType === 'resume_basic' || planType === 'resume_premium')) {
        return 'resume';
      }
    }
    // Check plan_type
    if (subscriptionDetails.plan_type && subscriptionDetails.plan_type.startsWith('resume_')) {
      return 'resume';
    }
    // Check plan_id for resume specific plans
    const planId = subscriptionDetails.plan_id || '';
    // Check against environment variables for resume plans
    const resumeBasicPlanId = Deno.env.get('PAYPAL_RESUME_BASIC_PLAN_ID');
    const resumePremiumPlanId = Deno.env.get('PAYPAL_RESUME_PREMIUM_PLAN_ID');
    if (planId === resumeBasicPlanId || planId === resumePremiumPlanId) {
      return 'resume';
    }
    // Check plan ID naming convention
    if (planId.includes('RESUME') || planId.toUpperCase().includes('RESUME') || planId.includes('resume_basic') || planId.includes('resume_premium')) {
      return 'resume';
    }
    // Default to interview subscription
    return 'interview';
  } catch (error) {
    console.error('Error determining subscription type:', error);
    return 'interview'; // Default to interview if there's an error
  }
}
async function determinePlanType(subscriptionDetails) {
  try {
    if (subscriptionDetails.custom_id) {
      const { planType } = extractUserInfoFromCustomId(subscriptionDetails.custom_id);
      if (planType) {
        console.log('Plan type found in custom_id:', planType);
        return planType;
      }
    }
    const planId = subscriptionDetails.plan_id || subscriptionDetails.id;
    if (!planId) {
      console.warn('No plan ID found in subscription details');
      return 'bronze';
    }
    const goldMonthlyPlanId = Deno.env.get('PAYPAL_GOLD_MONTHLY_PLAN_ID');
    const goldYearlyPlanId = Deno.env.get('PAYPAL_GOLD_YEARLY_PLAN_ID');
    const diamondMonthlyPlanId = Deno.env.get('PAYPAL_DIAMOND_MONTHLY_PLAN_ID');
    const diamondYearlyPlanId = Deno.env.get('PAYPAL_DIAMOND_YEARLY_PLAN_ID');
    const bronzeMonthlyPlanId = Deno.env.get('PAYPAL_BRONZE_MONTHLY_PLAN_ID');
    const bronzeYearlyPlanId = Deno.env.get('PAYPAL_BRONZE_YEARLY_PLAN_ID');
    if (planId === goldMonthlyPlanId || planId === goldYearlyPlanId) {
      return 'gold';
    } else if (planId === diamondMonthlyPlanId) {
      return 'diamond';
    } else if (planId === diamondYearlyPlanId) {
      return 'megastar';
    } else if (planId === bronzeMonthlyPlanId || planId === bronzeYearlyPlanId) {
      return 'bronze';
    }
    const upperPlanId = planId.toUpperCase();
    if (upperPlanId.includes('GOLD')) {
      return 'gold';
    } else if (upperPlanId.includes('DIAMOND') && (!customId || !customId.includes('megastar'))) {
      return 'diamond';
    } else if (upperPlanId.includes('BRONZE')) {
      return 'bronze';
    }
    console.warn('Could not determine plan type from subscription details', planId);
    return 'bronze';
  } catch (error) {
    console.error('Error determining plan type:', error);
    return 'bronze';
  }
}
async function determineUserId(subscriptionDetails) {
  try {
    if (subscriptionDetails.custom_id) {
      const { userId } = extractUserInfoFromCustomId(subscriptionDetails.custom_id);
      if (userId) {
        console.log('User ID found in custom_id:', userId);
        return userId;
      }
    }
    let subscriberEmail = null;
    if (subscriptionDetails.subscriber && subscriptionDetails.subscriber.email_address) {
      subscriberEmail = subscriptionDetails.subscriber.email_address;
    } else if (subscriptionDetails.resource && subscriptionDetails.resource.subscriber && subscriptionDetails.resource.subscriber.email_address) {
      subscriberEmail = subscriptionDetails.resource.subscriber.email_address;
    }
    if (!subscriberEmail) {
      console.log('No subscriber email found in subscription details');
      return null;
    }
    console.log('Looking for user with email:', subscriberEmail);
    return null;
  } catch (error) {
    console.error('Error determining user ID:', error);
    return null;
  }
}
function getSubscriptionEndDate(subscription) {
  if (subscription.billing_info && subscription.billing_info.next_billing_time) {
    return subscription.billing_info.next_billing_time;
  }
  if (subscription.billing_info && subscription.billing_info.cycle_executions && subscription.billing_info.cycle_executions.length > 0) {
    const currentCycle = subscription.billing_info.cycle_executions[0];
    if (currentCycle.cycles_completed < currentCycle.total_cycles && currentCycle.cycle_completed_date) {
      const lastCycleDate = new Date(currentCycle.cycle_completed_date);
      if (subscription.billing_info.cycle_executions[0].tenure_type === 'REGULAR') {
        lastCycleDate.setMonth(lastCycleDate.getMonth() + 1);
        return lastCycleDate.toISOString();
      } else if (subscription.plan_id && (subscription.plan_id.includes('YEAR') || subscription.plan_id.includes('YEARLY'))) {
        lastCycleDate.setFullYear(lastCycleDate.getFullYear() + 1);
        return lastCycleDate.toISOString();
      }
    }
  }
  const now = new Date();
  if (subscription.plan_id && (subscription.plan_id.includes('YEAR') || subscription.plan_id.includes('YEARLY'))) {
    now.setFullYear(now.getFullYear() + 1);
  } else {
    now.setMonth(now.getMonth() + 1);
  }
  return now.toISOString();
}
async function checkPayPalSubscriptionStatus(subscriptionId) {
  try {
    const subscriptionDetails = await getSubscriptionDetails(subscriptionId);
    console.log('PayPal subscription status:', subscriptionDetails.status);
    return {
      status: subscriptionDetails.status || 'OTHER',
      details: subscriptionDetails
    };
  } catch (error) {
    console.error('Error checking PayPal subscription status:', error);
    return {
      status: 'OTHER',
      details: null
    };
  }
}
// New helper function to cancel all existing active subscriptions for a user
async function cancelExistingActiveSubscriptions(userId, newSubscriptionId, supabaseAdmin, subscriptionType = 'interview', requestId = 'webhook', newPlanType = null) {
  try {
    console.log(`[${requestId}] Checking for other active subscriptions for user: ${userId} during ${subscriptionType} subscription process`);
    
    // Get all active subscriptions except the new one
    const { data: allActiveSubs, error: getActiveSubsError } = await supabaseAdmin
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .in('payment_status', ['active', 'pending_upgrade'])
      .neq('payment_provider_subscription_id', newSubscriptionId);
    
    if (getActiveSubsError) {
      console.error(`[${requestId}] Error finding active subscriptions:`, getActiveSubsError);
      return false;
    }
    
    if (!allActiveSubs || allActiveSubs.length === 0) {
      console.log(`[${requestId}] No other active subscriptions found for this user`);
      return true;
    }
    
    console.log(`[${requestId}] Found ${allActiveSubs.length} active/pending subscriptions to process`);
    
    // Determine which subscriptions to cancel based on the subscription type transition logic
    const subsToCancel = allActiveSubs.filter(sub => {
      // Determine if the subscription is for resume or interview
      const subType = determineSubscriptionTypeSafely(sub);
      
      // Case 1: Regular same-type cancellation (existing behavior)
      // During an interview subscription process, cancel interview subscriptions
      // During a resume subscription process, cancel resume subscriptions
      if (subType === subscriptionType) {
        return true;
      }
      
      // Case 2: Cross-type cancellation for interview -> resume
      // If we're activating a resume subscription, also cancel interview subscriptions
      // that include resume features (gold, diamond, megastar)
      if (subscriptionType === 'resume' && subType === 'interview' && 
          ['gold', 'diamond', 'megastar'].includes(sub.plan_type)) {
        console.log(`[${requestId}] Will cancel interview plan ${sub.plan_type} when activating resume plan`);
        return true;
      }
      
      // Case 3: Cross-type cancellation for resume -> interview
      // If we're activating an interview subscription that includes resume features,
      // also cancel any standalone resume subscriptions
      if (subscriptionType === 'interview' && subType === 'resume' && 
          newPlanType && ['gold', 'diamond', 'megastar'].includes(newPlanType)) {
        console.log(`[${requestId}] Will cancel resume plan when activating interview plan with resume features`);
        return true;
      }
      
      // Don't cancel in other cases
      return false;
    });
    
    console.log(`[${requestId}] After filtering, found ${subsToCancel.length} subscriptions to cancel`);
    
    // Track if all cancellations were successful
    let allCancelled = true;
    
    for (const sub of subsToCancel) {
      // If the subscription was already in pending_upgrade, it's now safe to mark as canceled
      // If it's active, mark as canceled
      const newStatus = 'canceled';
      
      console.log(`[${requestId}] Marking subscription ${sub.payment_provider_subscription_id} (plan: ${sub.plan_type}) as ${newStatus} in database`);
      
      const { error: cancelError } = await supabaseAdmin
        .from('subscriptions')
        .update({ payment_status: newStatus })
        .eq('id', sub.id);
        
      if (cancelError) {
        console.error(`[${requestId}] Error updating subscription ${sub.id}:`, cancelError);
        allCancelled = false;
      } else {
        console.log(`[${requestId}] Successfully marked subscription ${sub.id} as ${newStatus} in database`);
        
        // NEW CODE: Update profile table based on the type of subscription being canceled
        const subType = determineSubscriptionTypeSafely(sub);
        
        // If we're canceling a resume subscription, update the resume_subscription_status in profiles
        if (subType === 'resume') {
          console.log(`[${requestId}] Updating profile resume_subscription_status to canceled for user ${userId}`);
          const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .update({ resume_subscription_status: 'canceled' })
            .eq('id', userId);
            
          if (profileError) {
            console.error(`[${requestId}] Error updating profile resume_subscription_status:`, profileError);
          } else {
            console.log(`[${requestId}] Successfully updated profile resume_subscription_status to canceled`);
          }
        }
        // If we're canceling an interview subscription, update the subscription_status in profiles
        else if (subType === 'interview') {
          console.log(`[${requestId}] Updating profile subscription_status to canceled for user ${userId}`);
          const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .update({ subscription_status: 'canceled' })
            .eq('id', userId);
            
          if (profileError) {
            console.error(`[${requestId}] Error updating profile subscription_status:`, profileError);
          } else {
            console.log(`[${requestId}] Successfully updated profile subscription_status to canceled`);
          }
        }
        
        try {
          const accessToken = await getPayPalAccessToken();
          
          if (accessToken) {
            console.log(`[${requestId}] Canceling subscription ${sub.payment_provider_subscription_id} in PayPal`);
            
            const cancelResponse = await fetch(
              `${PAYPAL_API_URL}/v1/billing/subscriptions/${sub.payment_provider_subscription_id}/cancel`,
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${accessToken}`,
                },
                body: JSON.stringify({
                  reason: "User changed subscription plan"
                })
              }
            );
            
            if (cancelResponse.status === 204) {
              console.log(`[${requestId}] Successfully canceled subscription ${sub.payment_provider_subscription_id} in PayPal`);
            } else {
              console.error(`[${requestId}] Failed to cancel subscription ${sub.payment_provider_subscription_id} in PayPal:`, 
                cancelResponse.status, await cancelResponse.text());
              
              // Even if PayPal cancellation fails, we keep the database status as canceled
              // The cron job that syncs with PayPal will eventually fix any discrepancies
            }
          }
        } catch (error) {
          console.error(`[${requestId}] Error attempting to cancel subscription ${sub.payment_provider_subscription_id} in PayPal:`, error);
          // We don't revert the database status here to maintain consistency with our internal state
        }
      }
    }
    
    return allCancelled;
  } catch (error) {
    console.error(`[${requestId}] Error in cancelExistingActiveSubscriptions:`, error);
    return false;
  }
}

/**
 * Helper function to safely determine subscription type from a subscription record
 * This function is more robust than the standard determineSubscriptionType function
 * as it handles cases where subscription_type might not be set
 */
function determineSubscriptionTypeSafely(subscription) {
  // First, check the subscription_type field if it exists
  if (subscription.subscription_type) {
    return subscription.subscription_type;
  }
  
  // Otherwise, infer from plan_type
  const planType = subscription.plan_type || '';
  
  // Resume plans start with 'resume_' or exactly match specific resume plan names
  if (planType.startsWith('resume_') || 
      planType === 'resume_basic' || 
      planType === 'resume_premium') {
    return 'resume';
  }
  
  // Specific interview plan types
  if (['bronze', 'gold', 'diamond', 'megastar'].includes(planType)) {
    return 'interview';
  }
  
  // Default to 'interview' if we can't determine
  return 'interview';
}

// New helper function to mark existing active subscriptions as pending upgrade
async function markActiveSubscriptionsForUpgrade(userId, supabaseAdmin, requestId = 'webhook') {
  try {
    console.log(`[${requestId}] Marking active subscriptions as pending_upgrade for user: ${userId}`);
    const { data: activeSubs, error: getActiveSubsError } = await supabaseAdmin.from('subscriptions').select('*').eq('user_id', userId).eq('payment_status', 'active');
    if (getActiveSubsError) {
      console.error(`[${requestId}] Error finding active subscriptions:`, getActiveSubsError);
      return false;
    }
    if (!activeSubs || activeSubs.length === 0) {
      console.log(`[${requestId}] No active subscriptions found to mark for upgrade`);
      return true;
    }
    console.log(`[${requestId}] Found ${activeSubs.length} active subscriptions to mark for upgrade`);
    // Track if all updates were successful
    let allMarked = true;
    for (const sub of activeSubs){
      console.log(`[${requestId}] Marking subscription ${sub.payment_provider_subscription_id} as pending_upgrade`);
      const { error: updateError } = await supabaseAdmin.from('subscriptions').update({
        payment_status: 'pending_upgrade'
      }).eq('id', sub.id);
      if (updateError) {
        console.error(`[${requestId}] Error marking subscription ${sub.id} for upgrade:`, updateError);
        allMarked = false;
      } else {
        console.log(`[${requestId}] Successfully marked subscription ${sub.id} as pending_upgrade`);
      }
    }
    return allMarked;
  } catch (error) {
    console.error(`[${requestId}] Error in markActiveSubscriptionsForUpgrade:`, error);
    return false;
  }
}

// New helper function to restore subscriptions that were pending upgrade
async function restorePendingUpgradeSubscriptions(userId, supabaseAdmin, requestId = 'webhook') {
  try {
    console.log(`[${requestId}] Checking for subscriptions pending upgrade that need to be restored for user: ${userId}`);
    const { data: pendingUpgradeSubs, error: getPendingError } = await supabaseAdmin.from('subscriptions').select('*').eq('user_id', userId).eq('payment_status', 'pending_upgrade');
    if (getPendingError) {
      console.error(`[${requestId}] Error finding pending upgrade subscriptions:`, getPendingError);
      return false;
    }
    if (!pendingUpgradeSubs || pendingUpgradeSubs.length === 0) {
      console.log(`[${requestId}] No subscriptions pending upgrade found to restore`);
      return true;
    }
    console.log(`[${requestId}] Found ${pendingUpgradeSubs.length} subscriptions pending upgrade to restore`);
    // Track if all restorations were successful
    let allRestored = true;
    for (const sub of pendingUpgradeSubs){
      console.log(`[${requestId}] Restoring subscription ${sub.payment_provider_subscription_id} from pending_upgrade to active`);
      const { error: updateError } = await supabaseAdmin.from('subscriptions').update({
        payment_status: 'active'
      }).eq('id', sub.id);
      if (updateError) {
        console.error(`[${requestId}] Error restoring subscription ${sub.id}:`, updateError);
        allRestored = false;
      } else {
        console.log(`[${requestId}] Successfully restored subscription ${sub.id} to active status`);
        // Update the user's profile to reflect this subscription's plan
        const { error: profileError } = await supabaseAdmin.from('profiles').update({
            subscription_tier: sub.plan_type,
            subscription_status: 'active'
        }).eq('id', userId);
        if (profileError) {
          console.error(`[${requestId}] Error updating profile after restoration:`, profileError);
        } else {
          console.log(`[${requestId}] Successfully updated profile to tier ${sub.plan_type} after restoration`);
        }
      }
    }
    return allRestored;
  } catch (error) {
    console.error(`[${requestId}] Error in restorePendingUpgradeSubscriptions:`, error);
    return false;
  }
}

serve(async (req)=>{
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders
    });
  }
  try {
    const requestId = crypto.randomUUID();
    console.log(`[${requestId}] Received webhook or request`);
    // First get the raw body for signature verification
    const rawBody = await req.clone().text();
    let body;
    try {
      // Also parse it as JSON
      body = JSON.parse(rawBody);
    } catch (error) {
      console.error(`[${requestId}] Error parsing request body:`, error);
      return new Response(JSON.stringify({
        error: 'Invalid JSON payload'
      }), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
          status: 400 
      });
    }
    console.log(`[${requestId}] Request body:`, JSON.stringify(body));
    const supabaseAdmin = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '', {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        } 
    });
    // Determine if this is a manual action from frontend or PayPal webhook
    const isManualAction = body.action === 'force_link' || body.action === 'cancel' || body.action === 'sync_subscriptions';
    if (isManualAction) {
      console.log(`[${requestId}] Processing manual action: ${body.action} - signature verification skipped`);
    } else if (body.event_type) {
      console.log(`[${requestId}] Processing PayPal webhook event: ${body.event_type} - verifying signature`);
      // Pass the actual Headers object for signature verification
      const isSignatureValid = await verifyPayPalWebhookSignature(rawBody, req.headers, requestId);
      if (!isSignatureValid) {
        console.error(`[${requestId}] PayPal webhook signature verification failed - rejecting request`);
        return new Response(JSON.stringify({
          error: 'Invalid webhook signature'
        }), {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          },
            status: 401 
        });
          }
      console.log(`[${requestId}] PayPal webhook signature verification successful - processing event`);
    } else {
      console.warn(`[${requestId}] Request is neither a manual action nor a PayPal webhook event - cannot determine if verification is needed`);
    }
    if (body.action === 'force_link') {
      console.log(`[${requestId}] Processing force link request`);
      
      if (!body.subscription_id) {
        return new Response(
          JSON.stringify({ success: false, error: 'Missing subscription_id' }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400 
          }
        );
      }
      
      try {
        // First check the status directly with PayPal
        let { status: paypalStatus, details: subscriptionDetails } = 
          await checkPayPalSubscriptionStatus(body.subscription_id);
        console.log(`[${requestId}] PayPal subscription status:`, paypalStatus);
        
        // Get more details about the user's intent
        const isUpgrade = body.is_upgrade === true;
        const isNewSubscription = body.is_new_subscription === true;
        
        // Only proceed if the PayPal subscription is active
        if (paypalStatus !== 'ACTIVE') {
          console.log(`[${requestId}] Subscription ${body.subscription_id} is not active in PayPal (status: ${paypalStatus}), not activating in database`);
          
          // If this was an upgrade attempt that failed, restore the original subscription
          if (isUpgrade && body.user_id) {
            await restorePendingUpgradeSubscriptions(body.user_id, supabaseAdmin, requestId);
          }
          
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: `Subscription is not active with PayPal (status: ${paypalStatus})`,
              paypalStatus
            }),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 400 
            }
          );
        }
        
        if (!subscriptionDetails) {
          const details = await getSubscriptionDetails(body.subscription_id);
          subscriptionDetails = details;
        }
        
        console.log(`[${requestId}] Retrieved subscription details:`, JSON.stringify(subscriptionDetails));

        const planType = await determinePlanType(subscriptionDetails);
        console.log(`[${requestId}] Determined plan type:`, planType);
        
        // Determine subscription type (resume or interview)
        const subscriptionType = determineSubscriptionType(subscriptionDetails);
        console.log(`[${requestId}] Determined subscription type:`, subscriptionType);
        
        const endDate = getSubscriptionEndDate(subscriptionDetails);
        console.log(`[${requestId}] Determined end date:`, endDate);
        
        let userId = body.user_id;
        
        if (!userId) {
          const { userId: customUserId } = extractUserInfoFromCustomId(subscriptionDetails.custom_id || '');
          userId = customUserId;
          
          if (!userId) {
            const subscriberEmail = subscriptionDetails.subscriber?.email_address || 
                                   subscriptionDetails.resource?.subscriber?.email_address;
            
            if (subscriberEmail) {
              console.log(`[${requestId}] Looking for user with email:`, subscriberEmail);
              
              const { data: userData, error: userError } = await supabaseAdmin.auth
                .admin.listUsers();
              
              if (userError) {
                console.error(`[${requestId}] Error listing users:`, userError);
              } else if (userData) {
                const matchingUser = userData.users.find((user) => 
                  user.email && user.email.toLowerCase() === subscriberEmail.toLowerCase()
                );
                
                if (matchingUser) {
                  userId = matchingUser.id;
                  console.log(`[${requestId}] Found user with matching email:`, userId);
                } else {
                  console.log(`[${requestId}] No user found with email:`, subscriberEmail);
                }
              }
            }
          }
        }
        
        if (!userId) {
          return new Response(
            JSON.stringify({ success: false, error: 'Unable to determine user ID' }),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 400 
            }
          );
        }
        
        // If this is an upgrade, first mark existing subscriptions as pending upgrade
        if (isUpgrade) {
          console.log(`[${requestId}] This is an upgrade. Marking existing subscriptions as pending_upgrade.`);
          await markActiveSubscriptionsForUpgrade(userId, supabaseAdmin, requestId);
        }
        
        const { data: existingSub, error: subError } = await supabaseAdmin
          .from('subscriptions')
          .select('*')
          .eq('payment_provider_subscription_id', body.subscription_id)
          .maybeSingle();
        
        if (subError) {
          console.error(`[${requestId}] Error getting subscription:`, subError);
        }
        
        if (existingSub) {
          console.log(`[${requestId}] Subscription already exists, updating user_id to:`, userId);
          
          const { error: updateError } = await supabaseAdmin
            .from('subscriptions')
            .update({ 
              user_id: userId,
              plan_type: planType,
              payment_status: 'active',
              end_date: endDate,
              subscription_type: subscriptionType // Add subscription type
            })
            .eq('payment_provider_subscription_id', body.subscription_id);
            
          if (updateError) {
            console.error(`[${requestId}] Error updating subscription:`, updateError);
            
            // If this was an upgrade attempt that failed, restore the original subscription
            if (isUpgrade) {
              await restorePendingUpgradeSubscriptions(userId, supabaseAdmin, requestId);
            }
            
            throw updateError;
          }
          
          // If this is an upgrade and the new subscription is now active, cancel the old ones of the same type
          if (isUpgrade) {
            console.log(`[${requestId}] Upgrade successful. Canceling old ${subscriptionType} subscriptions.`);
            await cancelExistingActiveSubscriptions(userId, body.subscription_id, supabaseAdmin, subscriptionType, requestId, planType);
          }
        } else {
          console.log(`[${requestId}] Creating new subscription with plan_type:`, planType);
          
          const { error: insertError } = await supabaseAdmin
            .from('subscriptions')
            .insert({
              user_id: userId,
              payment_provider_subscription_id: body.subscription_id,
              plan_type: planType,
              payment_status: 'active',
              end_date: endDate,
              subscription_type: subscriptionType // Add subscription type
            });
            
          if (insertError) {
            console.error(`[${requestId}] Error creating subscription:`, insertError);
            
            // If this was an upgrade attempt that failed, restore the original subscription
            if (isUpgrade) {
              await restorePendingUpgradeSubscriptions(userId, supabaseAdmin, requestId);
            }
          } else {
            // If this is an upgrade and the new subscription is now active, cancel the old ones of the same type
            if (isUpgrade) {
              console.log(`[${requestId}] Upgrade successful. Canceling old ${subscriptionType} subscriptions.`);
              await cancelExistingActiveSubscriptions(userId, body.subscription_id, supabaseAdmin, subscriptionType, requestId, planType);
            }
            
            // Update profile based on subscription type
            if (subscriptionType === 'resume') {
              // For resume subscriptions, update resume-specific fields
              const { error: profileError } = await supabaseAdmin
                .from('profiles')
                .update({
                  resume_subscription_tier: planType,
                  resume_subscription_status: body.event_type === 'BILLING.SUBSCRIPTION.CANCELLED' ? 'canceled' : 
                                             body.event_type === 'BILLING.SUBSCRIPTION.EXPIRED' ? 'expired' : 'active'
                })
                .eq('id', userId);
                
              if (profileError) {
                console.error(`[${requestId}] Error updating resume profile:`, profileError);
              } else {
                console.log(`[${requestId}] Successfully updated resume subscription profile for user ${userId}`);
              }
            } else {
              // For interview subscriptions, update general subscription fields
              const { error: profileError } = await supabaseAdmin
                .from('profiles')
                .update({
                  subscription_tier: body.event_type === 'BILLING.SUBSCRIPTION.EXPIRED' ? 'bronze' : planType,
                  subscription_status: body.event_type === 'BILLING.SUBSCRIPTION.CANCELLED' ? 'canceled' : 
                                             body.event_type === 'BILLING.SUBSCRIPTION.EXPIRED' ? 'expired' : 'active'
                })
                .eq('id', userId);
                
              if (profileError) {
                console.error(`[${requestId}] Error updating profile:`, profileError);
              } else {
                console.log(`[${requestId}] Successfully updated interview subscription profile for user ${userId}`);
              }
            }
          }
        }
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            subscriptionId: body.subscription_id,
            userId: userId,
            planType: planType
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200 
          }
        );
      } catch (error) {
        console.error(`[${requestId}] Error in force_link:`, error);
        return new Response(
          JSON.stringify({ success: false, error: error.message }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500 
          }
        );
      }
    } else if (body.action === 'cancel') {
      return new Response(JSON.stringify({
        success: true
      }), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
          status: 200 
      });
    } else if (body.action === 'sync_subscriptions') {
      const userId = body.user_id;
      if (!userId) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Missing user_id'
        }), {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          },
            status: 400 
        });
          }
      try {
        // Get all subscriptions for the user
        const { data: userSubs, error: subsError } = await supabaseAdmin.from('subscriptions').select('*').eq('user_id', userId);
        if (subsError) {
          throw new Error(`Error fetching user subscriptions: ${subsError.message}`);
        }
        // Check each subscription with PayPal and update accordingly
        let activeSubs = 0;
        let updatedSubs = 0;
        for (const sub of userSubs || []){
          if (!sub.payment_provider_subscription_id) continue;
          try {
            const { status: paypalStatus } = await checkPayPalSubscriptionStatus(sub.payment_provider_subscription_id);
            console.log(`[${requestId}] Subscription ${sub.payment_provider_subscription_id} PayPal status: ${paypalStatus}`);
            const dbStatus = paypalStatus === 'ACTIVE' ? 'active' : paypalStatus === 'CANCELLED' ? 'canceled' : paypalStatus === 'EXPIRED' ? 'expired' : 'inactive';
            if (dbStatus !== sub.payment_status) {
              const { error: updateError } = await supabaseAdmin.from('subscriptions').update({
                payment_status: dbStatus
              }).eq('id', sub.id);
              if (updateError) {
                console.error(`[${requestId}] Error updating subscription status:`, updateError);
              } else {
                updatedSubs++;
                console.log(`[${requestId}] Updated subscription ${sub.payment_provider_subscription_id} status to ${dbStatus}`);
              }
            }
            if (dbStatus === 'active') activeSubs++;
          } catch (error) {
            console.error(`[${requestId}] Error checking subscription ${sub.payment_provider_subscription_id}:`, error);
          }
        }
        // Update profile status if needed based on active subscriptions
        if (activeSubs > 0) {
          // Find the highest tier among active subscriptions
          const { data: activeSubData, error: activeSubError } = await supabaseAdmin.from('subscriptions').select('*').eq('user_id', userId).eq('payment_status', 'active');
          if (activeSubError) {
            console.error(`[${requestId}] Error fetching active subscriptions:`, activeSubError);
          } else if (activeSubData && activeSubData.length > 0) {
            // Determine highest tier - priority order: megastar > diamond > gold > bronze > free
            const tierPriority = {
              'megastar': 5,
              'diamond': 4,
              'gold': 3,
              'bronze': 2,
              'free': 1,
              'resume_premium': 4,
              'resume_basic': 2
            };
            let highestInterviewTier = 'free';
            let highestInterviewPriority = 0;
            let highestResumeTier = 'free';
            let highestResumePriority = 0;
            // Group subscriptions by type
            const interviewSubs = activeSubData.filter((sub)=>!sub.subscription_type || sub.subscription_type === 'interview' || !sub.plan_type?.startsWith('resume_'));
            const resumeSubs = activeSubData.filter((sub)=>sub.subscription_type === 'resume' || sub.plan_type && sub.plan_type.startsWith('resume_'));
            // Find highest interview tier
            for (const sub of interviewSubs){
              const priority = tierPriority[sub.plan_type] || 0;
              if (priority > highestInterviewPriority) {
                highestInterviewPriority = priority;
                highestInterviewTier = sub.plan_type;
              }
            }
            // Find highest resume tier
            for (const sub of resumeSubs){
              const priority = tierPriority[sub.plan_type] || 0;
              if (priority > highestResumePriority) {
                highestResumePriority = priority;
                highestResumeTier = sub.plan_type;
              }
            }
            // Update profile fields based on subscription types
            const profileUpdates = {};
            // Only update interview fields if there are active interview subscriptions
            if (interviewSubs.length > 0) {
              profileUpdates.subscription_tier = highestInterviewTier;
              profileUpdates.subscription_status = 'active';
              console.log(`[${requestId}] Setting interview subscription to ${highestInterviewTier}`);
            }
            // Only update resume fields if there are active resume subscriptions
            if (resumeSubs.length > 0) {
              profileUpdates.resume_subscription_tier = highestResumeTier;
              profileUpdates.resume_subscription_status = 'active';
              console.log(`[${requestId}] Setting resume subscription to ${highestResumeTier}`);
            }
            // Only update if we have changes to make
            if (Object.keys(profileUpdates).length > 0) {
              const { error: profileUpdateError } = await supabaseAdmin.from('profiles').update(profileUpdates).eq('id', userId);
              if (profileUpdateError) {
                console.error(`[${requestId}] Error updating profile:`, profileUpdateError);
              } else {
                console.log(`[${requestId}] Successfully updated profile with subscription status`);
              }
            }
          }
        } else {
          // No active subscriptions, set profile to free/inactive
          const { error: profileUpdateError } = await supabaseAdmin.from('profiles').update({
              subscription_tier: 'free',
              subscription_status: 'expired',
              resume_subscription_tier: 'free',
              resume_subscription_status: 'expired'
          }).eq('id', userId);
          if (profileUpdateError) {
            console.error(`[${requestId}] Error updating profile to free tier:`, profileUpdateError);
          } else {
            console.log(`[${requestId}] Updated profile to free tier (no active subscriptions)`);
          }
        }
        return new Response(JSON.stringify({
            success: true, 
            message: `Synchronized ${userSubs?.length || 0} subscriptions, updated ${updatedSubs}, found ${activeSubs} active`,
            activeSubscriptions: activeSubs
        }), {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          },
            status: 200 
        });
      } catch (error) {
        console.error(`[${requestId}] Error in sync_subscriptions:`, error);
        return new Response(JSON.stringify({
          success: false,
          error: error.message
        }), {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          },
            status: 500 
        });
          }
      }
    if (body.event_type) {
      console.log(`[${requestId}] Processing webhook event:`, body.event_type);
      if (body.resource_type === 'subscription' && body.resource) {
        const subscription = body.resource;
        const subscriptionId = subscription.id;
        console.log(`[${requestId}] Processing subscription event for subscription ID:`, subscriptionId);
        let planType = await determinePlanType(subscription);
        let endDate = getSubscriptionEndDate(subscription);
        if (!planType || planType === 'bronze') {
          try {
            const subscriptionDetails = await getSubscriptionDetails(subscriptionId);
            planType = await determinePlanType(subscriptionDetails);
            endDate = getSubscriptionEndDate(subscriptionDetails);
            console.log(`[${requestId}] Plan type after fetching details:`, planType);
            console.log(`[${requestId}] End date after fetching details:`, endDate);
          } catch (error) {
            console.error(`[${requestId}] Error fetching subscription details:`, error);
          }
        }
        const { data: existingSub, error: getSubError } = await supabaseAdmin.from('subscriptions').select('*').eq('payment_provider_subscription_id', subscriptionId).maybeSingle();
        if (getSubError) {
          console.error(`[${requestId}] Error getting subscription:`, getSubError);
        }
        if (existingSub) {
          console.log(`[${requestId}] Found existing subscription for ID:`, subscriptionId);
          if (body.event_type === 'BILLING.SUBSCRIPTION.ACTIVATED' || body.event_type === 'BILLING.SUBSCRIPTION.CREATED') {
            // First check the subscription status in PayPal
            const { status: paypalStatus } = await checkPayPalSubscriptionStatus(subscriptionId);
            // Determine subscription type
            const subscriptionType = determineSubscriptionType(subscription);
            console.log(`[${requestId}] Determined subscription type: ${subscriptionType}`);
            
            // Only mark as active if PayPal says it's active
            if (paypalStatus === 'ACTIVE') {
              // Always update with latest info from PayPal
              const { error: updateError } = await supabaseAdmin
                .from('subscriptions')
                .update({ 
                  payment_status: 'active',
                  plan_type: planType,
                  end_date: endDate,
                  subscription_type: subscriptionType // Add subscription type
                })
                .eq('payment_provider_subscription_id', subscriptionId);
                
              if (updateError) {
                console.error(`[${requestId}] Error updating subscription:`, updateError);
              } else {
                if (existingSub.user_id) {
                  const userId = existingSub.user_id;
                  
                  // Check if there are any subscriptions in pending_upgrade state
                  // This indicates this activation is part of an upgrade process
                  const { data: pendingUpgradeSubs, error: pendingError } = await supabaseAdmin
                    .from('subscriptions')
                    .select('*')
                    .eq('user_id', userId)
                    .eq('payment_status', 'pending_upgrade');
                  
                  const isUpgrade = !pendingError && pendingUpgradeSubs && pendingUpgradeSubs.length > 0;
                  
                  // Check for any other active subscriptions of the same type before the cancellation
                  // This helps us determine if this is a brand new subscription or an upgrade replacement
                  const { data: activeSubsData, error: activeSubsError } = await supabaseAdmin
                    .from('subscriptions')
                    .select('id, plan_type, payment_status')
                    .eq('user_id', userId)
                    .in('payment_status', ['active', 'pending_upgrade'])
                    .neq('payment_provider_subscription_id', subscriptionId);
                  
                  const hasOtherActiveSubscriptions = !activeSubsError && 
                                                     activeSubsData && 
                                                     activeSubsData.length > 0;
                                                       
                  console.log(`[${requestId}] User has ${activeSubsData?.length || 0} other active/pending subscriptions before cancellation`);
                  
                  if (isUpgrade) {
                    console.log(`[${requestId}] This is an upgrade. Found ${pendingUpgradeSubs.length} subscriptions pending upgrade.`);
                    // Extra logging to understand what subscriptions we're about to cancel
                    for (const sub of pendingUpgradeSubs) {
                      console.log(`[${requestId}] Found pending upgrade subscription: ${sub.payment_provider_subscription_id} with plan ${sub.plan_type} and type ${sub.subscription_type || 'unknown'}`);
                    }
                    
                    // Cancel all subscriptions of the same type that were waiting for this upgrade to complete
                    await cancelExistingActiveSubscriptions(userId, subscriptionId, supabaseAdmin, subscriptionType, requestId, planType);
                  } else {
                    // Not an upgrade, just a regular activation
                    // Still cancel any other active subscriptions of the same type to maintain consistency
                    console.log(`[${requestId}] This is a regular activation. Canceling any other active ${subscriptionType} subscriptions.`);
                    await cancelExistingActiveSubscriptions(userId, subscriptionId, supabaseAdmin, subscriptionType, requestId, planType);
                  }
                  
                  // Update the profile's subscription tier and status based on subscription type
                  if (subscriptionType === 'resume') {
                    console.log(`[${requestId}] Updating resume subscription fields for user: ${userId}`);
                    const { error: profileError } = await supabaseAdmin
                      .from('profiles')
                      .update({
                        resume_subscription_tier: planType,
                        resume_subscription_status: 'active'
                      })
                      .eq('id', userId);
                      
                    if (profileError) {
                      console.error(`[${requestId}] Error updating resume profile:`, profileError);
                    } else {
                      console.log(`[${requestId}] Successfully updated resume subscription to ${planType} tier with active status`);
                    }
                  } else {
                    console.log(`[${requestId}] Updating interview subscription fields for user: ${userId}`);
                    const { error: profileError } = await supabaseAdmin
                      .from('profiles')
                      .update({
                        subscription_tier: planType,
                        subscription_status: 'active'
                      })
                      .eq('id', userId);
                      
                    if (profileError) {
                      console.error(`[${requestId}] Error updating profile:`, profileError);
                    } else {
                      console.log(`[${requestId}] Successfully updated profile to ${planType} tier with active status`);
                    }
                  }
                }
              }
            } else {
              console.log(`[${requestId}] Subscription ${subscriptionId} has PayPal status '${paypalStatus}', not marking as active in database`);
            }
          } else if (body.event_type === 'BILLING.SUBSCRIPTION.CANCELLED') {
            console.log(`[${requestId}] Processing cancellation event`);
            const statusChangeNote = subscription.status_change_note || '';
            const isUpgradeCancellation = statusChangeNote.includes('upgraded to a different plan');
            if (isUpgradeCancellation) {
              console.log(`[${requestId}] This cancellation is due to an upgrade, not updating profile status`);
              // Only update the subscription record, not the profile status
              const { data: subData, error: getSubError } = await supabaseAdmin.from('subscriptions').select('*').eq('payment_provider_subscription_id', subscriptionId).maybeSingle();
              if (getSubError) {
                console.error(`[${requestId}] Error finding subscription:`, getSubError);
              } else if (subData) {
                const { error: updateSubError } = await supabaseAdmin.from('subscriptions').update({
                  payment_status: 'canceled'
                }).eq('id', subData.id);
                if (updateSubError) {
                  console.error(`[${requestId}] Error updating subscription status:`, updateSubError);
                } else {
                  console.log(`[${requestId}] Successfully marked old subscription as canceled without affecting profile status`);
                }
              }
            } else {
              console.log(`[${requestId}] This is a regular cancellation, updating both subscription and profile`);
              const { error: updateError } = await supabaseAdmin.from('subscriptions').update({
                  payment_status: 'canceled',
                  end_date: endDate
              }).eq('payment_provider_subscription_id', subscriptionId);
              if (updateError) {
                console.error(`[${requestId}] Error updating subscription for cancellation:`, updateError);
              } else {
                if (existingSub.user_id) {
                  // Check if user has any other active subscriptions before updating profile
                  const { data: activeSubsData, error: activeSubsError } = await supabaseAdmin.from('subscriptions').select('id').eq('user_id', existingSub.user_id).eq('payment_status', 'active').neq('payment_provider_subscription_id', subscriptionId);
                  if (activeSubsError) {
                    console.error(`[${requestId}] Error checking for other active subscriptions:`, activeSubsError);
                  } else if (!activeSubsData || activeSubsData.length === 0) {
                    // Only update profile if this was the user's only active subscription
                    const subscriptionType = existingSub.subscription_type || determineSubscriptionType(subscription);
                    if (subscriptionType === 'resume') {
                      // For resume subscriptions, only update resume-specific fields
                      const { error: profileError } = await supabaseAdmin.from('profiles').update({
                          resume_subscription_status: 'canceled'
                      }).eq('id', existingSub.user_id);
                        if (profileError) {
                          console.error(`[${requestId}] Error updating resume profile for cancellation:`, profileError);
                        }
                      } else {
                        // For interview subscriptions, update general subscription fields
                      const { error: profileError } = await supabaseAdmin.from('profiles').update({
                            subscription_status: 'canceled'
                      }).eq('id', existingSub.user_id);
                          if (profileError) {
                            console.error(`[${requestId}] Error updating profile for cancellation:`, profileError);
                          }
                        }
                  } else {
                    console.log(`[${requestId}] User has ${activeSubsData.length} other active subscriptions, not updating profile status`);
                  }
                }
              }
            }
          } else if (body.event_type === 'BILLING.SUBSCRIPTION.EXPIRED') {
            const { error: updateError } = await supabaseAdmin.from('subscriptions').update({
              payment_status: 'expired'
            }).eq('payment_provider_subscription_id', subscriptionId);
            if (updateError) {
              console.error(`[${requestId}] Error updating subscription for expiration:`, updateError);
            } else {
              if (existingSub.user_id) {
                // Check if user has any other active subscriptions before updating profile
                const { data: activeSubsData, error: activeSubsError } = await supabaseAdmin.from('subscriptions').select('id').eq('user_id', existingSub.user_id).eq('payment_status', 'active');
                if (activeSubsError) {
                  console.error(`[${requestId}] Error checking for other active subscriptions:`, activeSubsError);
                } else if (!activeSubsData || activeSubsData.length === 0) {
                  // Only update profile if user has no other active subscriptions
                  const subscriptionType = existingSub.subscription_type || determineSubscriptionType(subscription);
                  if (subscriptionType === 'resume') {
                    // For resume subscriptions, only update resume-specific fields
                    const { error: profileError } = await supabaseAdmin.from('profiles').update({
                        resume_subscription_status: 'expired',
                        resume_subscription_tier: 'free'
                    }).eq('id', existingSub.user_id);
                    if (profileError) {
                      console.error(`[${requestId}] Error updating resume profile for expiration:`, profileError);
                    }
                  } else {
                    // For interview subscriptions, update general subscription fields
                    const { error: profileError } = await supabaseAdmin.from('profiles').update({
                        subscription_status: 'expired',
                        subscription_tier: 'bronze'
                    }).eq('id', existingSub.user_id);
                    if (profileError) {
                      console.error(`[${requestId}] Error updating profile for expiration:`, profileError);
                    }
                  }
                }
              }
            }
          } else if (body.event_type === 'BILLING.SUBSCRIPTION.PAYMENT.FAILED') {
            console.log(`[${requestId}] Processing payment failure event`);
            // Payment failed for this subscription - let's check if it's a new subscription that was part of an upgrade
            if (existingSub && existingSub.user_id) {
              const userId = existingSub.user_id;
              // Check if there are any subscriptions in pending_upgrade state
              const { data: pendingUpgradeSubs, error: pendingError } = await supabaseAdmin.from('subscriptions').select('*').eq('user_id', userId).eq('payment_status', 'pending_upgrade');
              if (!pendingError && pendingUpgradeSubs && pendingUpgradeSubs.length > 0) {
                console.log(`[${requestId}] Payment failed for upgrade. Restoring previous subscriptions.`);
                // Restore the old subscriptions that were pending upgrade
                await restorePendingUpgradeSubscriptions(userId, supabaseAdmin, requestId);
                // Mark this failed subscription appropriately
                const { error: updateError } = await supabaseAdmin.from('subscriptions').update({
                  payment_status: 'payment_failed'
                }).eq('payment_provider_subscription_id', subscriptionId);
                if (updateError) {
                  console.error(`[${requestId}] Error updating subscription status to payment_failed:`, updateError);
                }
              } else {
                // Just a regular payment failure, not part of an upgrade
                console.log(`[${requestId}] Regular payment failure, not part of an upgrade.`);
                // Update the subscription status to reflect payment failure
                const { error: updateError } = await supabaseAdmin.from('subscriptions').update({
                  payment_status: 'payment_failed'
                }).eq('payment_provider_subscription_id', subscriptionId);
                if (updateError) {
                  console.error(`[${requestId}] Error updating subscription status to payment_failed:`, updateError);
                } else {
                  // Check if user has any other active subscriptions
                  const { data: activeSubsData, error: activeSubsError } = await supabaseAdmin.from('subscriptions').select('id, plan_type').eq('user_id', userId).eq('payment_status', 'active');
                  if (activeSubsError) {
                    console.error(`[${requestId}] Error checking for other active subscriptions:`, activeSubsError);
                  } else if (!activeSubsData || activeSubsData.length === 0) {
                    // Only update profile if user has no other active subscriptions
                    const subscriptionType = existingSub.subscription_type || determineSubscriptionType(subscription);
                    if (subscriptionType === 'resume') {
                      // For resume subscriptions, only update resume-specific fields
                      const { error: profileError } = await supabaseAdmin.from('profiles').update({
                          resume_subscription_status: 'payment_failed'
                      }).eq('id', userId);
                        if (profileError) {
                          console.error(`[${requestId}] Error updating resume profile for payment failure:`, profileError);
                        }
                      } else {
                        // For interview subscriptions, update general subscription fields
                      const { error: profileError } = await supabaseAdmin.from('profiles').update({
                            subscription_status: 'payment_failed'
                      }).eq('id', userId);
                        if (profileError) {
                          console.error(`[${requestId}] Error updating profile for payment failure:`, profileError);
                        }
                      }
                  } else {
                    console.log(`[${requestId}] User has ${activeSubsData.length} other active subscriptions, not updating profile status`);
                  }
                }
              }
            }
          } else if (body.event_type === 'BILLING.SUBSCRIPTION.SUSPENDED') {
            // Log the suspension event
            console.log(`[${requestId}] Processing subscription suspended webhook for subscription ID: ${subscriptionId}`);
            // First, get the existing subscription to find associated user
            const { data: existingSub } = await supabaseAdmin.from('subscriptions').select('user_id, plan_type, subscription_type').eq('payment_provider_subscription_id', subscriptionId).maybeSingle();
            if (existingSub) {
              // Update subscription status to suspended
              const { error: updateError } = await supabaseAdmin.from('subscriptions').update({
                payment_status: 'suspended'
              }).eq('payment_provider_subscription_id', subscriptionId);
              if (updateError) {
                console.error(`[${requestId}] Error updating subscription to suspended:`, updateError);
              } else {
                console.log(`[${requestId}] Successfully marked subscription as suspended`);
              }
              // Update user profile subscription status to suspended
              if (existingSub.user_id) {
                const subscriptionType = existingSub.subscription_type || determineSubscriptionType(subscription);
                if (subscriptionType === 'resume') {
                  // For resume subscriptions, only update resume-specific fields
                  const { error: profileError } = await supabaseAdmin.from('profiles').update({
                    resume_subscription_status: 'suspended'
                  }).eq('id', existingSub.user_id);
                  if (profileError) {
                    console.error(`[${requestId}] Error updating resume profile subscription status:`, profileError);
                  } else {
                    console.log(`[${requestId}] Successfully updated resume subscription status to suspended for user: ${existingSub.user_id}`);
                  }
                } else {
                  // For interview subscriptions, update general subscription fields
                  const { error: profileError } = await supabaseAdmin.from('profiles').update({
                    subscription_status: 'suspended'
                  }).eq('id', existingSub.user_id);
                  if (profileError) {
                    console.error(`[${requestId}] Error updating profile subscription status:`, profileError);
                  } else {
                    console.log(`[${requestId}] Successfully updated profile status to suspended for user: ${existingSub.user_id}`);
                  }
                }
              }
            } else {
              console.error(`[${requestId}] Could not find subscription with ID ${subscriptionId} to mark as suspended`);
            }
          }
        } else {
          console.log(`[${requestId}] No existing subscription found for ID:`, subscriptionId);
          let userId = null;
          if (subscription.custom_id) {
            const { userId: extractedUserId } = extractUserInfoFromCustomId(subscription.custom_id);
            if (extractedUserId) {
              userId = extractedUserId;
              console.log(`[${requestId}] Found user ID in custom_id:`, userId);
            }
          }
          if (!userId) {
            let subscriberEmail = null;
            if (subscription.subscriber && subscription.subscriber.email_address) {
              subscriberEmail = subscription.subscriber.email_address;
            } else if (body.resource.subscriber && body.resource.subscriber.email_address) {
              subscriberEmail = body.resource.subscriber.email_address;
            }
            if (subscriberEmail) {
              console.log(`[${requestId}] Looking for user with email:`, subscriberEmail);
              const { data: userData, error: userError } = await supabaseAdmin.auth.admin.listUsers();
              if (userError) {
                console.error(`[${requestId}] Error listing users:`, userError);
              } else if (userData) {
                const matchingUser = userData.users.find((user)=>user.email && user.email.toLowerCase() === subscriberEmail.toLowerCase());
                if (matchingUser) {
                  userId = matchingUser.id;
                  console.log(`[${requestId}] Found user with matching email:`, userId);
                } else {
                  console.log(`[${requestId}] No user found with email:`, subscriberEmail);
                }
              }
            }
          }
          if (userId) {
            console.log(`[${requestId}] Creating new subscription for user:`, userId);
            // For new subscriptions via webhook, first verify with PayPal
            const { status: paypalStatus } = await checkPayPalSubscriptionStatus(subscriptionId);
            // Only create as active if PayPal says it's active
            const initialStatus = paypalStatus === 'ACTIVE' && body.event_type !== 'BILLING.SUBSCRIPTION.CANCELLED' ? 'active' : body.event_type === 'BILLING.SUBSCRIPTION.CANCELLED' ? 'canceled' : 'pending';
            const { error: insertError } = await supabaseAdmin.from('subscriptions').insert({
                user_id: userId,
                payment_provider_subscription_id: subscriptionId,
                plan_type: planType,
                payment_status: initialStatus,
                end_date: endDate,
                subscription_type: determineSubscriptionType(subscription) // Add subscription type
            });
            if (insertError) {
              console.error(`[${requestId}] Error creating subscription:`, insertError);
            } else {
              // Only proceed with other actions if the subscription is active
              if (initialStatus === 'active') {
                // Cancel any existing active subscriptions when a new one is created
                // First determine the subscription type based on plan type
                const subscriptionType = planType.startsWith('resume_') ? 'resume' : 'interview';
                console.log(`[${requestId}] Determined subscription type for new subscription: ${subscriptionType}`);
                // Pass the correct subscription type parameter followed by the requestId
                await cancelExistingActiveSubscriptions(userId, subscriptionId, supabaseAdmin, subscriptionType, requestId, planType);
                // Update profile based on subscription type
                if (subscriptionType === 'resume') {
                  // For resume subscriptions, update resume-specific fields
                  const { error: profileError } = await supabaseAdmin.from('profiles').update({
                      resume_subscription_tier: planType,
                    resume_subscription_status: body.event_type === 'BILLING.SUBSCRIPTION.CANCELLED' ? 'canceled' : body.event_type === 'BILLING.SUBSCRIPTION.EXPIRED' ? 'expired' : 'active'
                  }).eq('id', userId);
                  if (profileError) {
                    console.error(`[${requestId}] Error updating resume profile:`, profileError);
                  } else {
                    console.log(`[${requestId}] Successfully updated resume subscription profile for user ${userId}`);
                  }
                } else {
                  // For interview subscriptions, update general subscription fields
                  const { error: profileError } = await supabaseAdmin.from('profiles').update({
                      subscription_tier: body.event_type === 'BILLING.SUBSCRIPTION.EXPIRED' ? 'bronze' : planType,
                    subscription_status: body.event_type === 'BILLING.SUBSCRIPTION.CANCELLED' ? 'canceled' : body.event_type === 'BILLING.SUBSCRIPTION.EXPIRED' ? 'expired' : 'active'
                  }).eq('id', userId);
                  if (profileError) {
                    console.error(`[${requestId}] Error updating profile:`, profileError);
                  } else {
                    console.log(`[${requestId}] Successfully updated interview subscription profile for user ${userId}`);
                  }
                }
              } else {
                console.log(`[${requestId}] New subscription created with status: ${initialStatus} (PayPal status: ${paypalStatus})`);
              }
            }
          } else {
            console.error(`[${requestId}] Could not determine user ID for subscription:`, subscriptionId);
          }
        }
      }
      return new Response(JSON.stringify({
        success: true
      }), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
          status: 200 
      });
    }
    return new Response(JSON.stringify({
      error: 'Unrecognized request format'
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
        status: 400 
    });
  } catch (error) {
    const errorId = crypto.randomUUID();
    console.error(`[${errorId}] Error processing webhook request:`, error);
    return new Response(JSON.stringify({
        error: error.message || "An unexpected error occurred",
        errorId,
        timestamp: new Date().toISOString()
    }), {
        status: 500,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  }
});
