
import { supabase } from "@/lib/supabase";

/**
 * Validates a PayPal plan ID
 * @param planId The PayPal plan ID to validate
 * @returns True if the plan ID appears to be valid, false otherwise
 */
export const validatePlanId = (planId: string | null | undefined): boolean => {
  if (!planId) return false;
  
  // Plan IDs should start with P- and be followed by alphanumeric characters
  return /^P-[A-Z0-9]+$/i.test(planId);
};

/**
 * Verifies a PayPal plan exists by checking with our backend
 * @param planId The PayPal plan ID to verify
 * @returns Promise resolving to a boolean indicating if the plan exists
 */
export const verifyPlanExists = async (planId: string): Promise<boolean> => {
  try {
    // For now, just do basic validation
    // In a real implementation, you would call PayPal API to verify
    return validatePlanId(planId);
  } catch (error) {
    console.error("Error verifying plan:", error);
    return false;
  }
};

/**
 * Maps a PayPal plan ID to a subscription tier
 * @param planId The PayPal plan ID
 * @returns The corresponding subscription tier or null if not found
 */
export const getPlanTypeFromPlanId = async (planId: string): Promise<string | null> => {
  if (!planId) return null;
  
  try {
    // Get the Supabase URL from environment or use default
    const supabaseProjectUrl = import.meta.env.VITE_SUPABASE_URL || 
                             'https://lfpmxqcqygujcftysbtu.supabase.co';
    
    // Get auth token
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData?.session?.access_token || 
                  import.meta.env.VITE_SUPABASE_ANON_KEY || '';
    
    // Call the edge function to get the plan type
    const response = await fetch(`${supabaseProjectUrl}/functions/v1/get-plan-type`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        plan_id: planId
      })
    });
    
    if (!response.ok) {
      console.error(`Error fetching plan type: ${response.status}`);
      
      // Fallback method - try to determine plan type from plan ID
      if (planId.includes('GOLD')) return 'gold';
      if (planId.includes('DIAMOND')) return 'diamond';
      
      return null;
    }
    
    const data = await response.json();
    
    if (data && data.planType) {
      return data.planType;
    }
    
    return null;
  } catch (error) {
    console.error("Error determining plan type from plan ID:", error);
    return null;
  }
};

/**
 * Fetches a PayPal plan ID from the backend for the specified plan type and billing cycle
 * @param planType The plan type (bronze, gold, diamond)
 * @param billingCycle The billing cycle (monthly, yearly)
 * @param userId The user ID
 * @returns Promise resolving to the plan ID or null if not found
 */
export const fetchPayPalPlanId = async (
  planType: string,
  billingCycle: string,
  userId: string
): Promise<string | null> => {
  try {
    console.log(`Fetching PayPal plan ID for: ${planType}, ${billingCycle}, ${userId}`);
    
    // Get the Supabase URL from environment or use default
    const supabaseProjectUrl = import.meta.env.VITE_SUPABASE_URL || 
                             'https://lfpmxqcqygujcftysbtu.supabase.co';
    
    // Get auth token
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData?.session?.access_token || 
                  import.meta.env.VITE_SUPABASE_ANON_KEY || '';
    
    // Call the edge function to get the plan ID
    const response = await fetch(`${supabaseProjectUrl}/functions/v1/get-paypal-plan-id`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        plan_type: planType,
        billing_cycle: billingCycle,
        user_id: userId
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error fetching plan ID: ${response.status}`, errorText);
      return null;
    }
    
    const data = await response.json();
    console.log("Plan ID response:", data);
    
    if (!data || !data.planId) {
      console.error("No valid plan ID received");
      return null;
    }
    
    // Validate the plan ID format
    if (!validatePlanId(data.planId)) {
      console.warn(`Received plan ID has invalid format: ${data.planId}`);
    }
    
    return data.planId;
  } catch (error) {
    console.error("Error fetching PayPal plan ID:", error);
    return null;
  }
};

/**
 * Logs detailed diagnostics for PayPal configuration
 */
export const logPayPalDiagnostics = async () => {
  try {
    console.log("PayPal Diagnostics:");
    
    // Check if PayPal SDK is loaded
    console.log("PayPal SDK loaded:", typeof window.paypal !== 'undefined');
    
    // Log environment info
    console.log("Environment:", import.meta.env.MODE);
    
    // Check Supabase connection
    const { data, error } = await supabase.from('profiles').select('id').limit(1);
    console.log("Supabase connection:", error ? "ERROR" : "OK");
    
    // Check if the Edge Function is accessible
    try {
      // Get the Supabase URL from the current window location or environment
      const supabaseProjectUrl = import.meta.env.VITE_SUPABASE_URL || 
                               'https://lfpmxqcqygujcftysbtu.supabase.co';
      
      // Get auth token
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token || 
                    import.meta.env.VITE_SUPABASE_ANON_KEY || '';
      
      // We need to use the functions URL which is derived from the project URL
      const response = await fetch(`${supabaseProjectUrl}/functions/v1/get-paypal-plan-id`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          plan_type: 'test',
          billing_cycle: 'monthly',
          user_id: 'test'
        })
      });
      
      console.log("Edge Function accessible:", response.ok);
      if (!response.ok) {
        console.log("Edge Function error:", await response.text());
      } else {
        const data = await response.json();
        console.log("Edge Function response:", data);
      }
    } catch (e) {
      console.log("Edge Function error:", e);
    }
    
    // Test client-config function
    try {
      const supabaseProjectUrl = import.meta.env.VITE_SUPABASE_URL || 
                               'https://lfpmxqcqygujcftysbtu.supabase.co';
      
      // Get auth token
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token || 
                    import.meta.env.VITE_SUPABASE_ANON_KEY || '';
      
      const response = await fetch(`${supabaseProjectUrl}/functions/v1/get-client-config`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          config_key: 'PAYPAL_CLIENT_ID'
        })
      });
      
      console.log("Client config function accessible:", response.ok);
      if (!response.ok) {
        console.log("Client config function error:", await response.text());
      } else {
        const data = await response.json();
        console.log("Client config response:", data);
      }
    } catch (e) {
      console.log("Client config function error:", e);
    }
    
    // For debugging payment flow, check if the user has an active subscription
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData?.session?.user?.id;
      if (userId) {
        console.log("Current user ID:", userId);
        
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('subscription_tier, subscription_status')
          .eq('id', userId)
          .single();
          
        if (profileError) {
          console.log("Error getting profile:", profileError);
        } else {
          console.log("User subscription status:", profileData);
        }
        
        const { data: subscriptions, error: subsError } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', userId);
          
        if (subsError) {
          console.log("Error getting subscriptions:", subsError);
        } else {
          console.log("User subscriptions:", subscriptions);
        }
      } else {
        console.log("No user is logged in");
      }
    } catch (e) {
      console.log("Error checking user subscription:", e);
    }
  } catch (e) {
    console.error("Error running diagnostics:", e);
  }
};

/**
 * Attempts to link an existing PayPal subscription to a user
 * Call this when you know a subscription should exist but might not be linked to the correct user
 * 
 * @param paypalSubscriptionId The PayPal subscription ID to link
 * @param userId The user ID to link the subscription to
 * @returns Promise resolving to success status
 */
export const linkPayPalSubscriptionToUser = async (
  paypalSubscriptionId: string,
  userId: string
): Promise<boolean> => {
  try {
    console.log(`Attempting to link PayPal subscription ${paypalSubscriptionId} to user ${userId}`);
    
    // First check if the subscription exists in our system
    const { data: existingSub, error: checkError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('payment_provider_subscription_id', paypalSubscriptionId)
      .single();
      
    if (checkError) {
      // Subscription doesn't exist, we need to create it
      console.log("Subscription doesn't exist in our system yet");
      
      // Get the Supabase URL
      const supabaseProjectUrl = import.meta.env.VITE_SUPABASE_URL || 
                               'https://lfpmxqcqygujcftysbtu.supabase.co';
      
      // Get auth token
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token || 
                    import.meta.env.VITE_SUPABASE_ANON_KEY || '';
      
      // Call our webhook handler to force creation
      const response = await fetch(`${supabaseProjectUrl}/functions/v1/paypal-webhook`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          action: "force_link",
          subscription_id: paypalSubscriptionId,
          user_id: userId
        })
      });
      
      if (!response.ok) {
        console.error("Failed to force link subscription:", await response.text());
        return false;
      }
      
      const result = await response.json();
      console.log("Force link result:", result);
      
      return result.success === true;
    } else if (existingSub) {
      // Subscription exists, but might be linked to the wrong user
      if (existingSub.user_id === userId) {
        console.log("Subscription is already linked to this user");
        return true;
      }
      
      console.log(`Subscription exists but is linked to user ${existingSub.user_id} instead of ${userId}`);
      
      // Update the subscription to link to the correct user
      const { error: updateError } = await supabase
        .from('subscriptions')
        .update({ user_id: userId })
        .eq('payment_provider_subscription_id', paypalSubscriptionId);
        
      if (updateError) {
        console.error("Failed to update subscription user:", updateError);
        return false;
      }
      
      console.log("Successfully updated subscription user");
      return true;
    }
    
    return false;
  } catch (error) {
    console.error("Error linking PayPal subscription:", error);
    return false;
  }
};

/**
 * Attempts to manually associate the currently logged-in user with a PayPal subscription ID
 * Useful when webhook automation fails or during testing
 * 
 * @param paypalSubscriptionId The PayPal subscription ID to associate with the current user
 * @returns Promise resolving to success status and error message if any
 */
export const manuallyAssociateSubscription = async (
  paypalSubscriptionId: string
): Promise<{success: boolean, message: string}> => {
  try {
    if (!paypalSubscriptionId || typeof paypalSubscriptionId !== 'string') {
      return {
        success: false,
        message: "Please enter a valid PayPal subscription ID"
      };
    }
    
    // Get current user
    const { data: sessionData } = await supabase.auth.getSession();
    const currentUserId = sessionData?.session?.user?.id;
    
    if (!currentUserId) {
      return {
        success: false,
        message: "You must be logged in to associate a subscription"
      };
    }
    
    console.log(`Manually associating subscription ${paypalSubscriptionId} with user ${currentUserId}`);
    
    // First check if subscription exists in our system
    const { data: existingSub, error: checkError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('payment_provider_subscription_id', paypalSubscriptionId);
    
    if (!checkError && existingSub && existingSub.length > 0) {
      // Subscription exists, update it to point to current user
      const { error: updateError } = await supabase
        .from('subscriptions')
        .update({ 
          user_id: currentUserId,
          // Make sure plan_type is set correctly here
          plan_type: existingSub[0].plan_type
        })
        .eq('payment_provider_subscription_id', paypalSubscriptionId);
        
      if (updateError) {
        console.error("Failed to update subscription user:", updateError);
        return {
          success: false,
          message: "Failed to update subscription: " + updateError.message
        };
      }
      
      // Also update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          subscription_status: 'active',
          subscription_tier: existingSub[0].plan_type
        })
        .eq('id', currentUserId);
      
      if (profileError) {
        console.warn("Updated subscription but failed to update profile:", profileError);
      }
      
      return {
        success: true,
        message: "Successfully linked existing subscription to your account"
      };
    } else {
      // Subscription doesn't exist in our system, attempt to retrieve from PayPal
      const supabaseProjectUrl = import.meta.env.VITE_SUPABASE_URL || 
                               'https://lfpmxqcqygujcftysbtu.supabase.co';
      
      // Get auth token
      const token = sessionData?.session?.access_token || 
                    import.meta.env.VITE_SUPABASE_ANON_KEY || '';
      
      // Call our webhook handler to force creation with specified user ID
      const response = await fetch(`${supabaseProjectUrl}/functions/v1/paypal-webhook`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          action: "force_link",
          subscription_id: paypalSubscriptionId,
          user_id: currentUserId,
          override_user: true  // Important: ensures we use the specified user ID
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Failed to retrieve and link subscription:", errorText);
        return {
          success: false,
          message: "Failed to retrieve subscription from PayPal: " + errorText
        };
      }
      
      const result = await response.json();
      console.log("Force link result:", result);
      
      if (result.success) {
        return {
          success: true,
          message: "Successfully retrieved and linked subscription to your account"
        };
      } else {
        return {
          success: false,
          message: result.error || "Unknown error linking subscription"
        };
      }
    }
  } catch (error) {
    console.error("Error in manual subscription association:", error);
    return {
      success: false,
      message: "An unexpected error occurred: " + (error instanceof Error ? error.message : String(error))
    };
  }
};
