import React, { useEffect, useState, useRef } from 'react';
import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Loader2, AlertCircle } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useLocation, useNavigate } from 'react-router-dom';
import PayPalSubscriptionButton from '../payment/PayPalSubscriptionButton';
import { usePayPal } from '../payment/PayPalProvider';
import { fetchPayPalPlanId } from '@/utils/paypalUtils';
import { hasRedundantSubscriptions, getRedundancyMessage } from '@/utils/subscriptionRedundancyUtils';

interface PaymentDialogProps {
  plan: {
    id: string;
    name: string;
    price: string;
    period: 'monthly' | 'yearly';
    features: string[];
    category?: 'interview' | 'resume'; // Add category for plan type
  };
  onSuccess: () => void;
  onCancel: () => void;
}

const PaymentDialog = ({ plan, onSuccess, onCancel }: PaymentDialogProps) => {
  const { user, profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const { isPayPalReady, error: paypalError } = usePayPal();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [requestId, setRequestId] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [planId, setPlanId] = useState<string | null>(null);
  const dialogContentRef = useRef<HTMLDivElement>(null);
  const [selectedPlanType, setSelectedPlanType] = useState<string>('');
  const [existingSubscriptionId, setExistingSubscriptionId] = useState<string | null>(null);
  const [isUpgradingFromExisting, setIsUpgradingFromExisting] = useState(false);
  const [potentialRedundancy, setPotentialRedundancy] = useState<{
    detected: boolean;
    message: string | null;
  }>({ detected: false, message: null });

  // Determine if plan is a resume plan
  const isResumePlan = plan.id.startsWith('resume_') || plan.category === 'resume';

  // Parse URL parameters on mount to check for returning from PayPal
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const success = searchParams.get('success');
    const subscriptionId = searchParams.get('subscription_id');
    
    if (success === 'true' && subscriptionId) {
      toast({
        title: "Payment Initiated",
        description: "Processing your subscription. This may take a moment.",
      });
      
      // We have a subscription ID from PayPal, verify it
      verifySubscription(subscriptionId);
      
      navigate('/dashboard?tab=subscription', { replace: true });
    } else if (success === 'false') {
      toast({
        variant: "destructive",
        title: "Payment Cancelled",
        description: "You've cancelled the payment process. You can try again when you're ready.",
      });
      
      // If the user was upgrading from an existing plan, we need to restore the old subscription
      if (isUpgradingFromExisting) {
        restoreExistingSubscription();
      }
      
      navigate('/dashboard?tab=subscription', { replace: true });
    }
  }, [location.search, navigate, toast, isUpgradingFromExisting]);
  
  // Check for potential redundant subscriptions when component mounts
  useEffect(() => {
    const checkPotentialRedundancy = () => {
      if (!profile) return;
      
      // If this is a resume plan, check if the user already has an interview plan that includes resume features
      if (isResumePlan) {
        const interviewTier = profile.subscription_tier;
        const wouldBeRedundant = ['gold', 'diamond', 'megastar'].includes(interviewTier);
        
        if (wouldBeRedundant) {
          setPotentialRedundancy({
            detected: true,
            message: `Your current ${interviewTier} plan already includes resume features. Subscribing to a separate resume plan would result in paying twice for the same features.`
          });
        }
      } 
      // If this is an interview plan that includes resume features, check if the user already has a resume plan
      else if (['gold', 'diamond', 'megastar'].includes(plan.id)) {
        const resumeTier = profile.resume_subscription_tier;
        const hasResumePlan = resumeTier !== 'free';
        
        if (hasResumePlan) {
          setPotentialRedundancy({
            detected: true,
            message: `You already have a ${resumeTier === 'resume_basic' ? 'Resume Basic' : 'Resume Premium'} plan. This ${plan.name} plan includes resume features, so you won't need both subscriptions.`
          });
        }
      }
    };
    
    checkPotentialRedundancy();
  }, [profile, plan, isResumePlan]);
  
  // Check for existing subscription when component mounts
  useEffect(() => {
    const checkExistingSubscription = async () => {
      if (!user) return;
      
      try {
        // Get the appropriate subscription type based on the plan category
        const subscriptionType = isResumePlan ? 'resume_subscription' : 'subscription';
        
        // Check if this is explicitly marked as an upgrade from SubscriptionSettings
        const isUpgradeFromSession = sessionStorage.getItem('isUpgradingSubscription');
        
        if (isUpgradeFromSession === 'true') {
          console.log('This subscription operation is explicitly marked as an upgrade');
          setIsUpgradingFromExisting(true);
          // Clean up the session storage item
          sessionStorage.removeItem('isUpgradingSubscription');
          return; // Skip the database check since we know it's an upgrade
        }
        
        const { data, error } = await supabase
          .from('subscriptions')
          .select('payment_provider_subscription_id, payment_status, plan_type')
          .eq('user_id', user.id)
          .in('payment_status', ['active', 'suspended'])
          .maybeSingle();
        
        if (error) {
          console.error('Error checking existing subscription:', error);
          return;
        }
        
        if (data && data.payment_provider_subscription_id) {
          console.log('Found existing subscription:', data.payment_provider_subscription_id, 'Status:', data.payment_status);
          setExistingSubscriptionId(data.payment_provider_subscription_id);
          setIsUpgradingFromExisting(true);
        }
      } catch (err) {
        console.error('Failed to check for existing subscription:', err);
      }
    };
    
    checkExistingSubscription();
  }, [user, isResumePlan, supabase]);

  // Function to restore the existing subscription in case of canceled upgrade
  const restoreExistingSubscription = async () => {
    if (!existingSubscriptionId || !user?.id) return;
    
    try {
      // Update the subscription status back to active in the database
      const { error: updateError } = await supabase
        .from('subscriptions')
        .update({ payment_status: 'active' })
        .eq('payment_provider_subscription_id', existingSubscriptionId)
        .eq('user_id', user.id);
      
      if (updateError) {
        console.error('Error restoring subscription:', updateError);
        return;
      }
      
      // Update the profile subscription status
      await refreshProfile();
      
      toast({
        title: "Previous Subscription Restored",
        description: "Your previous subscription has been restored.",
      });
    } catch (err) {
      console.error('Error restoring subscription:', err);
    }
  };
  
  // Function to redirect to thank you page
  const redirectToThankYou = (subscriptionId: string) => {
    // Close the dialog
    onSuccess();
    
    // Navigate to the thank you page with subscription details
    navigate(`/thank-you?plan=${encodeURIComponent(plan.name)}&subscription_id=${subscriptionId}`);
  };
  
  const verifySubscription = async (subscriptionId?: string) => {
    setVerifying(true);
    
    try {
      // Only show verification toast once at the beginning
      toast({
        title: "Verifying subscription...",
        description: "Please wait while we confirm your payment.",
      });
      
      // If we have a PayPal subscription ID, we should link it to the user
      if (subscriptionId) {
        // Call the server to verify the subscription with PayPal
        // and link it to the user's account
        const supabaseProjectUrl = import.meta.env.VITE_SUPABASE_URL || 
                                'https://lfpmxqcqygujcftysbtu.supabase.co';
        
        // Get auth token
        const { data: sessionData } = await supabase.auth.getSession();
        const token = sessionData?.session?.access_token || '';
        
        const response = await fetch(`${supabaseProjectUrl}/functions/v1/paypal-webhook`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            action: 'force_link',
            subscription_id: subscriptionId,
            user_id: user?.id,
            plan_type: selectedPlanType,
            is_upgrade: isUpgradingFromExisting,
            is_resume_plan: isResumePlan,
            is_new_subscription: true
          })
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error("Error verifying subscription with server:", errorText);
          throw new Error("Could not verify subscription with PayPal");
        }
        
        const result = await response.json();
        
        if (!result.success) {
          // If upgrade failed, restore the previous subscription
          if (isUpgradingFromExisting) {
            await restoreExistingSubscription();
          }
          throw new Error(result.error || "Failed to verify subscription");
        }
        
        // Store confirmed subscription ID in session storage for Dashboard component to use
        if (subscriptionId) {
          sessionStorage.setItem('confirmedSubscriptionId', subscriptionId);
        }
        
        // If we successfully verified with the server, refresh the profile and show success
        await refreshProfile();
        
        // For upgrades, we need to check if the profile has been updated to the new plan
        const expectedTierField = isResumePlan ? 'resume_subscription_tier' : 'subscription_tier';
        
        if (profile && 
            ((isResumePlan && profile.resume_subscription_tier === selectedPlanType) || 
             (!isResumePlan && profile.subscription_tier === selectedPlanType))) {
          toast({
            title: "Subscription Confirmed!",
            description: `You are now subscribed to the ${plan.name} plan.`,
          });
          // Redirect to thank you page instead of just closing the dialog
          redirectToThankYou(subscriptionId);
          return;
        }
      }
      
      // We need to wait a moment for webhook processing to complete before checking again
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Only refresh once after waiting, to prevent multiple API calls
      await refreshProfile();
      
      // Additional check for the current subscription in a pending_upgrade state
      if (isUpgradingFromExisting) {
        try {
          // Check if our original subscription is now in pending_upgrade status
          const { data, error } = await supabase
            .from('subscriptions')
            .select('payment_status')
            .eq('payment_provider_subscription_id', existingSubscriptionId)
            .maybeSingle();
          
          if (!error && data && data.payment_status === 'pending_upgrade') {
            console.log('Original subscription is in pending_upgrade state, upgrade is in progress');
            
            // Since we know the upgrade is in progress, we can inform the user
            toast({
              title: "Upgrade In Progress",
              description: "Your upgrade is being processed. This may take a few moments to complete.",
            });
            // Close dialog immediately when we detect upgrade in progress
            onSuccess();
            return;
          }
        } catch (err) {
          console.error('Error checking subscription status:', err);
        }
      }
      
      // Check if the profile shows the expected plan or if we have any subscription
      if (profile && 
          ((isResumePlan && profile.resume_subscription_tier === selectedPlanType) || 
           (!isResumePlan && profile.subscription_tier === selectedPlanType) || 
           profile.subscription_status === 'active')) {
        toast({
          title: "Subscription Confirmed!",
          description: `You are now subscribed to the ${plan.name} plan.`,
        });
        // Redirect to thank you page instead of just closing the dialog
        redirectToThankYou(subscriptionId || '');
        return;
      }
      
      // If we still don't have confirmation, check just once more instead of multiple intervals
      // Wait a bit longer for webhook processing
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Final profile refresh
      await refreshProfile();
      
      // Check if new subscription is active
      let newSubscriptionActive = false;
      if (subscriptionId) {
        try {
          const { data, error } = await supabase
            .from('subscriptions')
            .select('payment_status')
            .eq('payment_provider_subscription_id', subscriptionId)
            .maybeSingle();
          
          if (!error && data && data.payment_status === 'active') {
            newSubscriptionActive = true;
          }
        } catch (err) {
          console.error('Error checking new subscription status:', err);
        }
      }
      
      if (profile && 
          ((isResumePlan && profile.resume_subscription_tier === selectedPlanType) || 
           (!isResumePlan && profile.subscription_tier === selectedPlanType) || 
           newSubscriptionActive || profile.subscription_status === 'active')) {
        toast({
          title: "Subscription Confirmed!",
          description: `You have successfully subscribed to the ${plan.name} plan.`,
        });
        // Redirect to thank you page instead of just closing the dialog
        redirectToThankYou(subscriptionId || '');
      } else {
        // If it was an upgrade, restore the previous subscription
        if (isUpgradingFromExisting) {
          await restoreExistingSubscription();
        }
        
        toast({
          variant: "destructive",
          title: "Subscription Not Confirmed",
          description: "We couldn't confirm your subscription. Please try again or contact support."
        });
        onCancel();
      }
    } catch (err) {
      console.error("Error verifying subscription:", err);
      
      // If it was an upgrade, restore the previous subscription
      if (isUpgradingFromExisting) {
        await restoreExistingSubscription();
      }
      
      toast({
        variant: "destructive",
        title: "Verification Issue",
        description: "We couldn't verify your subscription status. Please try again or contact support."
      });
      onCancel();
    } finally {
      setVerifying(false);
    }
  };

  useEffect(() => {
    const getPlanId = async () => {
      if (!user) {
        setError("You must be logged in to subscribe");
        return;
      }
      
      setIsLoading(true);
      setError(null);
      
      try {
        let planType = '';
        
        // Handle different plan types
        if (plan.id === "resume_basic" || plan.id === "resume_premium") {
          // Use the plan ID directly for resume plans
          planType = plan.id;
        } else if (plan.id === "diamond_yearly") {
          planType = "megastar";
        } else {
          planType = plan.id;
        }
        
        const billingCycle = plan.period;
        
        setSelectedPlanType(planType);
        
        console.log("Fetching plan ID for:", planType, billingCycle, "with user ID:", user.id);
        
        const paypalPlanId = await fetchPayPalPlanId(planType, billingCycle, user.id);
        
        if (!paypalPlanId) {
          setError("Failed to get a valid plan ID from the server. Please try again later.");
          return;
        }
        
        setPlanId(paypalPlanId);
      } catch (err: any) {
        console.error("Exception fetching plan details:", err);
        setError(err.message || "An unexpected error occurred");
      } finally {
        setIsLoading(false);
      }
    };
    
    getPlanId();
  }, [user, plan]);

  useEffect(() => {
    if (paypalError) {
      setError(`PayPal configuration error: ${paypalError}`);
    }
  }, [paypalError]);

  return (
    <DialogContent 
      className="sm:max-w-md max-h-[80vh] overflow-y-auto" 
      ref={dialogContentRef}
    >
      <DialogHeader>
        <DialogTitle>Subscribe to {plan.name}</DialogTitle>
        <DialogDescription>
          {isResumePlan 
            ? 'Complete your subscription to unlock resume creation and download capabilities.'
            : 'Complete your subscription with PayPal to get immediate access.'}
        </DialogDescription>
      </DialogHeader>
      
      <div className="space-y-4 py-4">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4 flex gap-3 items-start">
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-red-800 dark:text-red-300">Payment Error</h4>
              <p className="text-sm text-red-700 dark:text-red-400 mt-1">{error}</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2" 
                onClick={onCancel}
              >
                Try Again
              </Button>
            </div>
          </div>
        )}
        
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-6">
            <Loader2 className="h-10 w-10 text-brand-500 animate-spin mb-4" />
            <p className="text-center text-muted-foreground">Preparing your subscription...</p>
          </div>
        )}
        
        {verifying && (
          <div className="flex flex-col items-center justify-center py-6">
            <Loader2 className="h-10 w-10 text-brand-500 animate-spin mb-4" />
            <p className="text-center text-muted-foreground">Verifying your subscription...</p>
            <p className="text-center text-muted-foreground text-sm mt-2">This may take a moment</p>
          </div>
        )}
        
        {!isLoading && !verifying && !error && planId && (
          <div className="mt-4 min-h-[200px]">
            <h4 className="text-sm font-medium mb-3">Complete your subscription with PayPal:</h4>
            {!isPayPalReady ? (
              <div className="flex flex-col items-center justify-center py-6">
                <Loader2 className="h-10 w-10 text-brand-500 animate-spin mb-4" />
                <p className="text-center text-muted-foreground">Loading payment options...</p>
              </div>
            ) : (
              <PayPalSubscriptionButton 
                planId={planId}
                planType={selectedPlanType}
                userId={user?.id || ''}
                onSuccess={(subscriptionId) => {
                  console.log("Subscription created:", subscriptionId);
                  console.log("Selected plan type:", selectedPlanType);
                  console.log("User ID:", user?.id);
                  setRequestId(subscriptionId);
                  verifySubscription(subscriptionId);
                }}
                onError={(error) => {
                  console.error("PayPal subscription error:", error);
                  setError("Failed to create subscription: " + (error.message || "Unknown error"));
                  
                  if (error.message && error.message.includes("RESOURCE_NOT_FOUND")) {
                    console.error("Plan ID may be invalid or inaccessible:", planId);
                    setError(`Please refresh and try again.`);
                  }
                  
                  // If it was an upgrade, restore the previous subscription
                  if (isUpgradingFromExisting) {
                    restoreExistingSubscription();
                  }
                }}
                onCancel={() => {
                  // If it was an upgrade, restore the previous subscription
                  if (isUpgradingFromExisting) {
                    restoreExistingSubscription();
                  }
                  
                  toast({
                    variant: "destructive",
                    title: "Payment Cancelled",
                    description: "You've cancelled the payment process. You can try again when you're ready.",
                  });
                }}
              />
            )}
          </div>
        )}
        
        {!isLoading && !verifying && !error && (
          <>
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium">{plan.name} Plan</h3>
                <p className="text-muted-foreground text-sm">
                  {plan.period === 'yearly' ? 'Annual' : 'Monthly'} subscription
                </p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold">${plan.price}</span>
                <span className="text-muted-foreground">/{plan.period}</span>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h4 className="text-sm font-medium mb-2">Plan Features:</h4>
              <ul className="space-y-2">
                {plan.features.slice(0, 4).map((feature, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <Separator />
            
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Payment Information:</h4>
              <div className="flex items-center justify-between text-sm">
                <span>Payment method:</span>
                <Badge variant="outline" className="flex items-center gap-1">
                  <img src="https://www.paypalobjects.com/webstatic/mktg/logo/pp_cc_mark_37x23.jpg" 
                       alt="PayPal" className="h-4" />
                  PayPal
                </Badge>
              </div>
              
              <p className="text-xs text-muted-foreground">
                By subscribing, you authorize us to charge your PayPal account now and at the beginning of each billing period.
              </p>
            </div>
          </>
        )}
      </div>

      <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-between sm:space-x-2">
        <Button 
          variant="outline" 
          onClick={onCancel}
          disabled={isLoading || verifying}
        >
          Cancel
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};

export default PaymentDialog;
