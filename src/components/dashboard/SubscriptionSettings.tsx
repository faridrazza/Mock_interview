import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, Check, Loader2, RefreshCw, FileText } from 'lucide-react';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import PaymentDialog from './PaymentDialog';
import { supabase } from '@/lib/supabase';
import { Input } from '@/components/ui/input';
import { manuallyAssociateSubscription } from '@/utils/paypalUtils';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useLocation } from 'react-router-dom';
import { hasRedundantSubscriptions, getRedundancyMessage } from '@/utils/subscriptionRedundancyUtils';
import { RedundantSubscriptionAlert } from './RedundantSubscriptionAlert';

interface Plan {
  id: string;
  name: string;
  price: string;
  period: 'monthly' | 'yearly';
  features: string[];
  isCurrent?: boolean;
  category?: 'interview' | 'resume';
}

interface SubscriptionSettingsProps {
  showResumePlans?: boolean;
}

const SubscriptionSettings = ({ showResumePlans = false }: SubscriptionSettingsProps) => {
  const { toast } = useToast();
  const {
    profile,
    refreshProfile,
    syncSubscriptions,
    isLoading: authLoading,
    user
  } = useAuth();
  
  const location = useLocation();
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [isManualLinkOpen, setIsManualLinkOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isLinking, setIsLinking] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [subscriptionId, setSubscriptionId] = useState('');
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [activeTab, setActiveTab] = useState<'interview' | 'resume'>('interview');
  const [redundantSubscriptionId, setRedundantSubscriptionId] = useState<string | null>(null);
  
  // Add ref to track the last time refreshProfile was called
  const lastRefreshTimeRef = useRef<number>(0);
  
  // Check if we should show resume plans tab from either prop or location state
  useEffect(() => {
    if (showResumePlans || (location.state && location.state.showResumePlans)) {
      setActiveTab('resume');
    }
  }, [location.state, showResumePlans]);
  
  // Helper function to safely call refreshProfile with debouncing
  const safeRefreshProfile = async () => {
    const now = Date.now();
    // Only refresh if at least 1500ms have passed since last refresh
    if (now - lastRefreshTimeRef.current >= 1500) {
      lastRefreshTimeRef.current = now;
      await refreshProfile();
    }
  };
  
  // Check for redundant subscriptions when component mounts or profile changes
  useEffect(() => {
    const checkRedundantSubscriptions = async () => {
      if (!profile || !user?.id) return;
      
      // Skip if profile isn't loaded yet
      if (!profile.subscription_tier || !profile.resume_subscription_tier) return;
      
      // Add a small delay before checking for redundancy to allow auto-cancellation to take effect
      setTimeout(async () => {
        // Check if the user has redundant subscriptions - pass the resume_subscription_status
        if (hasRedundantSubscriptions(
          profile.subscription_tier, 
          profile.resume_subscription_tier, 
          profile.resume_subscription_status
        )) {
          // Get the resume subscription ID
          try {
            // Query for any resume subscription for this user, regardless of status
            // This helps for debugging and for the UI to identify the subscription
            const { data, error } = await supabase
              .from('subscriptions')
              .select('payment_provider_subscription_id, payment_status')
              .eq('user_id', user.id)
              .eq('subscription_type', 'resume')
              .order('created_at', { ascending: false })
              .limit(1)
              .maybeSingle();
            
            if (!error && data?.payment_provider_subscription_id) {
              console.log('Found resume subscription with status:', data.payment_status);
              setRedundantSubscriptionId(data.payment_provider_subscription_id);
            } else {
              // Clear any previously set redundant subscription ID
              setRedundantSubscriptionId(null);
            }
          } catch (err) {
            console.error('Error fetching redundant subscription:', err);
          }
        } else {
          // Clear any previously set redundant subscription ID if no redundancy is detected
          setRedundantSubscriptionId(null);
        }
      }, 1500); // 1.5 second delay to allow for webhook processing
    };
    
    checkRedundantSubscriptions();
  }, [profile, user]);
  
  const handleRedundantSubscriptionCancelled = () => {
    // Clear the redundant subscription ID
    setRedundantSubscriptionId(null);
    
    // Refresh profile data
    safeRefreshProfile();
  };
  
  const handleSyncSubscriptions = async () => {
    try {
      setIsSyncing(true);
      await syncSubscriptions();
      // The syncSubscriptions function already calls refreshProfile internally
    } finally {
      setIsSyncing(false);
    }
  };
  
  if (!profile) {
    return <div className="p-6 text-center">
        <AlertCircle className="mx-auto h-10 w-10 text-yellow-500 mb-4" />
        <h3 className="text-lg font-medium">Unable to load subscription details</h3>
        <p className="text-sm text-muted-foreground mt-2">Please try again later.</p>
      </div>;
  }
  
  const tierMap = {
    'free': 'Free',
    'bronze': 'Bronze ($9.99/month)',
    'gold': 'Gold ($9.00/month)',
    'diamond': 'Diamond ($18.00/month)',
    'megastar': 'Megastar ($119.99/year)',
    'resume_basic': 'Resume Basic ($2.00/month)',
    'resume_premium': 'Resume Premium ($6.00/month)'
  };
  
  // Get the appropriate tier based on the active tab
  const currentTier = activeTab === 'interview' ? profile.subscription_tier : profile.resume_subscription_tier;
  const currentStatus = activeTab === 'interview' ? profile.subscription_status : profile.resume_subscription_status;
  const formattedTier = tierMap[currentTier as keyof typeof tierMap] || currentTier;
  
  // Interview plans
  const interviewPlans: Plan[] = [{
    id: "bronze",
    name: "Bronze",
    price: "Free",
    period: "monthly",
    features: ["One AI-Based Mock Interview", "One Advanced AI interview", "AI-Feedback & Scoring"],
    isCurrent: (profile.subscription_tier === 'bronze' || profile.subscription_tier === 'free') && 
               (profile.subscription_status === 'active' || profile.subscription_status === 'trial' || !profile.subscription_status),
    category: 'interview'
  }, {
    id: "gold",
    name: "Gold",
    price: "9.00",
    period: "monthly",
    features: [
      "30 Standard AI Interviews Per Month", 
      "21 Advanced AI Interviews with Real Company Questions", 
      "AI-Based Feedback & Scoring", 
      "Create up to 15 resumes & PDF Downloads",
      "ATS Resume Builder", // Added resume feature
      "Text-based AI Interviewer", 
      "Voice-based AI Interviewer for a Realistic Experience", 
      "Access to Role-Specific Interviews (Java, DevOps, Data Science, etc.)", 
      "Performance Analysis & Improvement Tips", 
      "Email Support for Queries", 
      "3D AI avatar Interaction", 
      "Judgment-free environment to practice interviews", 
      "Prepration suggestion"
    ],
    isCurrent: profile.subscription_tier === 'gold' && profile.subscription_status === 'active',
    category: 'interview'
  }, {
    id: "diamond",
    name: "Diamond",
    price: "18.00",
    period: "monthly",
    features: [
      "Unlimited Standard AI Interviews Per Month", 
      "Unlimited Advanced AI Interviews with Real Company Questions", 
      "Deatailed AI-Based Feedback & Scoring ", // Added resume feature
      "Create up to 50 resumes & PDF Downloads", 
      "ATS Resume Builder",
      "Text-based AI Interviewer", 
      "Voice-based AI Interviewer for a Realistic Experience", 
      "Access to Role-Specific Interviews (Java, DevOps, Data Science, etc.)", 
      "Performance Analysis & Improvement Tips", 
      "Email Support for Queries", 
      "3D AI avatar Interaction", 
      "Judgment-free environment to practice interviews", 
      "Prepration suggestion"
    ],
    isCurrent: profile.subscription_tier === 'diamond' && profile.subscription_status === 'active',
    category: 'interview'
  }, {
    id: "diamond_yearly",
    name: "Megastar",
    price: "59.00",
    period: "yearly",
    features: [
      "Unlimited Standard AI Interviews Per Month", 
      "Unlimited Advanced AI Interviews with Real Company Questions", 
      "Deatailed AI-Based Feedback & Scoring ", // Added resume feature
      "Unlimited resumes & PDF Downloads", 
      "ATS Resume Builder",
      "Text-based AI Interviewer", 
      "Voice-based AI Interviewer for a Realistic Experience", 
      "Access to Role-Specific Interviews (Java, DevOps, Data Science, etc.)", 
      "Performance Analysis & Improvement Tips", 
      "Email Support for Queries", 
      "3D AI avatar Interaction", 
      "Judgment-free environment to practice interviews", 
      "Prepration suggestion", 
      "Annual subscription with significant savings"
    ],
    isCurrent: profile.subscription_tier === 'megastar' && profile.subscription_status === 'active',
    category: 'interview'
  }];
  
  // Resume plans - keep these as separate dedicated plans
  const resumePlans: Plan[] = [{
    id: "resume_basic",
    name: "Resume Basic",
    price: "2.00",
    period: "monthly",
    features: ["Create up to 15 resumes", "Download all your resumes as PDF", "Unlimited editing and updates", "ATS Resume Builder", "ATS templates", "AI Integrated", "Email support"],
    isCurrent: profile.resume_subscription_tier === 'resume_basic',
    category: 'resume'
  }, {
    id: "resume_premium",
    name: "Resume Premium",
    price: "6.00",
    period: "monthly",
    features: ["Create up to 50 resumes", "Download all your resumes as PDF", "Unlimited editing and updates", "ATS Resume Builder", "ATS templates", "AI Integrated", "Email support"],
    isCurrent: profile.resume_subscription_tier === 'resume_premium',
    category: 'resume'
  }];
  
  // Update the Gold plan features for resumes tab to be more detailed
  const goldForResumes = interviewPlans
    .filter(plan => plan.id === "gold")
    .map(plan => ({
      ...plan,
      features: [
        "Create up to 15 resumes & PDF Downloads",
        "Unlimited editing and updates",
        "ATS templates",
        "ATS Resume Builder",
        "30 Standard AI Interviews Per Month",
        "21 Advanced AI Interviews with Real Company Questions",
        "AI-Based Feedback & Scoring",
        "Text-based AI Interviewer",
        "Voice-based AI Interviewer",
        "Access to Role-Specific Interviews",
        "AI Integrated",
        "Email support",
        "Plus all interview features"
      ],
      isCurrent: profile.subscription_tier === 'gold' && profile.subscription_status === 'active',
      category: 'resume' as 'interview' | 'resume'
    }));
    
  // Update the Diamond plan features for resumes tab to be more detailed
  const diamondForResumes = interviewPlans
    .filter(plan => plan.id === "diamond")
    .map(plan => ({
      ...plan,
      features: [
        "Create up to 50 resumes & PDF Downloads",
        "Unlimited editing and updates",
        "ATS templates",
        "ATS Resume Builder",
        "Unlimited Standard AI Interviews Per Month",
        "Unlimited Advanced AI Interviews with Real Company Questions",
        "AI-Based Feedback & Scoring",
        "Text-based AI Interviewer",
        "Voice-based AI Interviewer",
        "Access to Role-Specific Interviews",
        "AI Integrated",
        "Email support",
        "Plus all interview features"
      ],
      isCurrent: profile.subscription_tier === 'diamond' && profile.subscription_status === 'active',
      category: 'resume' as 'interview' | 'resume'
    }));
    
  // Update Megastar (Diamond yearly) to resume tab options with more detailed features
  const megastarForResumes = interviewPlans
    .filter(plan => plan.id === "diamond_yearly")
    .map(plan => ({
      ...plan,
      features: [
        "Unlimited resume creation & PDF downloads",
        "ATS templates",
        "ATS Resume Builder",
        "Unlimited Standard AI Interviews Per Month",
        "Unlimited Advanced AI Interviews with Real Company Questions",
        "Detailed AI-Based Feedback & Scoring",
        "Text-based AI Interviewer",
        "Voice-based AI Interviewer",
        "Access to Role-Specific Interviews",
        "AI Integrated",
        "Email support",
        "Plus all interview features"
      ],
      isCurrent: profile.subscription_tier === 'megastar' && profile.subscription_status === 'active',
      category: 'resume' as 'interview' | 'resume'
    }));
  
  // Add all interview plans that include resume features to the resume plans list
  resumePlans.push(...goldForResumes, ...diamondForResumes, ...megastarForResumes);
  
  const handleUpgradeSuccess = async (plan?: Plan) => {
    setIsUpgradeOpen(false);
    if (plan) {
      const planInfo = {
        id: plan.id,
        name: plan.name
      };
      sessionStorage.setItem('selectedPlan', JSON.stringify(planInfo));
    }

    // First try to sync subscriptions to ensure everything is up to date
    await syncSubscriptions();
    // The syncSubscriptions function already calls refreshProfile internally
    
    // Note: No need to navigate here as the PaymentDialog now handles redirection to thank-you page
  };
  
  const handleUpgrade = (plan: Plan) => {
    // Determine if this is an upgrade from an existing plan
    const isUpgradingFromExisting = 
      (currentStatus === 'active' || currentStatus === 'suspended') && 
      (currentTier !== 'free' && currentTier !== 'bronze');
    
    console.log('Upgrading to plan:', plan.id, 'Is upgrade:', isUpgradingFromExisting);
    
    // Store the upgrade status for the payment dialog
    sessionStorage.setItem('isUpgradingSubscription', 
      isUpgradingFromExisting ? 'true' : 'false');
    
    // Store the plan category to identify resume vs interview plans
    sessionStorage.setItem('planCategory', plan.category || 'interview');
    
    setSelectedPlan(plan);
    setIsUpgradeOpen(true);
  };
  
  // Show confirmation dialog instead of immediate cancellation
  const openCancelConfirmation = () => {
    setShowCancelConfirm(true);
  };
  
  const handleCancelSubscription = async () => {
    try {
      setIsCancelling(true);
      setShowCancelConfirm(false); // Close the confirmation dialog
      
      // Determine which subscription type to cancel based on active tab
      const subscriptionType = activeTab === 'resume' ? 'resume' : 'interview';
      
      const {
        data: subscriptions,
        error: fetchError
      } = await supabase
        .from('subscriptions')
        .select('payment_provider_subscription_id')
        .eq('user_id', profile.id)
        .eq('payment_status', 'active')
        .eq('subscription_type', subscriptionType)
        .maybeSingle();
      
      if (fetchError) {
        throw new Error(`Failed to fetch subscription: ${fetchError.message}`);
      }
      
      if (!subscriptions || !subscriptions.payment_provider_subscription_id) {
        throw new Error(`No active ${subscriptionType} subscription found`);
      }
      
      const subscriptionId = subscriptions.payment_provider_subscription_id;
      const {
        data,
        error
      } = await supabase.functions.invoke('cancel-subscription', {
        body: {
          subscription_id: subscriptionId,
          user_id: profile.id
        }
      });
      
      if (error) {
        throw new Error(`Error calling cancel-subscription function: ${error.message}`);
      }
      
      console.log("Cancellation response:", data);
      
      if (data.status === "success") {
        toast({
          title: "Subscription Cancelled",
          description: "Your subscription has been successfully cancelled."
        });
        await safeRefreshProfile();
      } else {
        throw new Error(data.error || "Failed to cancel subscription");
      }
    } catch (error: any) {
      console.error("Error cancelling subscription:", error);
      toast({
        variant: "destructive",
        title: "Cancellation Failed",
        description: error.message || "An unexpected error occurred while cancelling your subscription."
      });
    } finally {
      setIsCancelling(false);
    }
  };
  
  const handleManualLink = async () => {
    if (!subscriptionId) {
      toast({
        variant: "destructive",
        title: "Missing subscription ID",
        description: "Please enter a PayPal subscription ID"
      });
      return;
    }
    
    try {
      setIsLinking(true);
      const result = await manuallyAssociateSubscription(subscriptionId);
      
      if (result.success) {
        await safeRefreshProfile();
        toast({
          title: "Subscription Linked",
          description: result.message
        });
        setSubscriptionId('');
      } else {
        toast({
          variant: "destructive",
          title: "Failed to Link Subscription",
          description: result.message
        });
      }
    } catch (error: any) {
      console.error("Error linking subscription:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "An unexpected error occurred while linking the subscription."
      });
    } finally {
      setIsLinking(false);
    }
  };
  
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'trial':
        return 'secondary';
      case 'canceled':
        return 'destructive';
      case 'pending':
        return 'outline';
      case 'payment_failed':
        return 'warning';
      case 'suspended':
        return 'warning';
      default:
        return 'outline';
    }
  };
  
  const getStatusText = (status: string): string => {
    if (status === 'active') return 'Active';
    if (status === 'trial') return 'Trial';
    if (status === 'pending') return 'Pending';
    if (status === 'canceled') return 'Canceled';
    if (status === 'expired') return 'Expired';
    if (status === 'payment_failed') return 'Payment Failed';
    if (status === 'suspended') return 'Suspended';
    return 'Inactive';
  };
  
  return <div className="space-y-6">
      <h2 className="text-xl font-semibold">Subscription</h2>
      
      {/* Comment out the redundant subscription warning while keeping the detection logic intact */}
      {/* 
        {profile?.subscription_tier && 
         profile?.resume_subscription_tier && 
         hasRedundantSubscriptions(
           profile.subscription_tier, 
           profile.resume_subscription_tier,
           profile.resume_subscription_status
         ) && (
          <RedundantSubscriptionAlert 
            message={getRedundancyMessage(
              profile.subscription_tier, 
              profile.resume_subscription_tier, 
              profile.resume_subscription_status
            ) || 
              "You have overlapping subscriptions. Your interview plan already includes resume features."}
            resumeSubscriptionId={redundantSubscriptionId || undefined}
            onCancelled={handleRedundantSubscriptionCancelled}
          />
        )}
      */}
      
      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0 pb-2">
          <div>
            <CardTitle className="text-base sm:text-lg">Current Subscription</CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Manage your current subscription and billing settings
            </CardDescription>
          </div>
          
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-0">
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground">Current Plan</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="font-medium text-sm sm:text-base">{formattedTier}</span>
                <Badge variant={getStatusBadgeVariant(currentStatus)}>
                  {getStatusText(currentStatus)}
                </Badge>
              </div>
            </div>
            
            {currentStatus === 'active' && <Button variant="outline" size="sm" onClick={openCancelConfirmation} disabled={isCancelling} className="w-full sm:w-auto">
                {isCancelling ? <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Cancelling...
                  </> : 'Cancel Subscription'}
              </Button>}
          </div>
          
          {/* Cancellation Confirmation Dialog */}
          <Dialog open={showCancelConfirm} onOpenChange={setShowCancelConfirm}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Cancel Subscription</DialogTitle>
                <DialogDescription>
                  Are you sure you want to cancel your subscription?
                </DialogDescription>
              </DialogHeader>
              <div className="mt-4 space-y-3">
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-md p-3">
                  <div className="flex">
                    <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-500 mr-3 flex-shrink-0" />
                    <div className="text-sm text-amber-700 dark:text-amber-400">
                      <p>You will lose access to your current plan features.</p>
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter className="flex flex-row justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setShowCancelConfirm(false)}>
                  Keep Subscription
                </Button>
                <Button variant="destructive" onClick={handleCancelSubscription} disabled={isCancelling}>
                  {isCancelling ? <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Cancelling...
                  </> : 'Confirm Cancellation'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          {/* Payment failed alert */}
          {currentStatus === 'payment_failed' && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md p-4 mt-4">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-500 mr-3 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-300">Payment Failed</h3>
                  <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-400">
                    <p>Your last subscription payment failed. Please update your payment method in PayPal to ensure continued access to premium features.</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2 border-yellow-300 hover:bg-yellow-100 hover:text-yellow-900 dark:border-yellow-700 dark:hover:bg-yellow-900/30"
                      onClick={() => window.open('https://www.paypal.com/myaccount/billing/subscriptions', '_blank')}
                    >
                      Update Payment Method
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Suspended subscription alert */}
          {currentStatus === 'suspended' && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md p-4 mt-4">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-500 mr-3 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-300">Subscription Suspended</h3>
                  <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-400">
                    <p>Your subscription has been suspended due to payment issues. Please update your payment method in PayPal to reactivate your subscription and restore access to premium features.</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2 border-yellow-300 hover:bg-yellow-100 hover:text-yellow-900 dark:border-yellow-700 dark:hover:bg-yellow-900/30"
                      onClick={() => window.open('https://www.paypal.com/myaccount/billing/subscriptions', '_blank')}
                    >
                      Update Payment Method
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* For testing - show subscription linking feature in development or if needed */}
          {import.meta.env.DEV}
        </CardContent>
      </Card>
      
      {/* Plans section with tabs */}
      <Tabs defaultValue={activeTab} value={activeTab} onValueChange={(value) => setActiveTab(value as 'interview' | 'resume')}>
        <TabsList className="grid grid-cols-2 w-full max-w-md mb-4">
          <TabsTrigger 
            value="interview" 
            className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Interview Plans
          </TabsTrigger>
          <TabsTrigger 
            value="resume" 
            className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <FileText className="h-4 w-4" />
            Resume Plans
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="interview">
          <Card>
            <CardHeader>
              <CardTitle>Interview Plans</CardTitle>
              <CardDescription>
                Choose a plan for accessing AI mock interviews
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {interviewPlans.map(plan => {
                  // Special styling for Megastar plan to make it stand out
                  const isMegastar = plan.id === 'diamond_yearly';
                  const cardClassName = plan.isCurrent 
                    ? 'border-primary bg-primary/5' 
                    : isMegastar 
                      ? 'border-2 border-gradient-to-r from-yellow-400 to-orange-500 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300'
                      : '';
                  
                  return (
                  <Card key={plan.id} className={`border ${cardClassName} ${isMegastar ? 'relative overflow-hidden' : ''}`}>
                    <CardHeader className="pb-3">
                      {isMegastar && (
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500"></div>
                      )}
                      <CardTitle className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                        {plan.name}
                          {isMegastar && <span className="text-2xl">🌟</span>}
                        </div>
                        <div className="flex flex-col gap-1">
                        {plan.isCurrent && <Badge variant="outline" className="ml-2">Current</Badge>}
                          {isMegastar && !plan.isCurrent && (
                            <Badge className="ml-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0 animate-pulse">
                              🔥 BEST DEAL
                            </Badge>
                          )}
                        </div>
                      </CardTitle>
                        <div className="flex justify-between items-center">
                      <div>
                              <span className={`text-2xl font-bold ${isMegastar ? 'text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-orange-600' : ''}`}>
                                ${plan.price}
                              </span>
                        <span className="text-muted-foreground">/{plan.period}</span>
                              {isMegastar && (
                                <div className="text-sm font-semibold text-green-600 dark:text-green-400">
                                  Save $157/year! 💰
                                </div>
                              )}
                          </div>
                          {/* Add badge for plans that include resume features */}
                          {(['gold', 'diamond', 'diamond_yearly'].includes(plan.id)) && (
                              <Badge 
                                variant="secondary" 
                                className={`ml-2 whitespace-nowrap ${isMegastar ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0' : ''}`}
                              >
                                {isMegastar ? '⭐ Resume + Interview' : 'Resume + Interview'}
                            </Badge>
                          )}
                      </div>
                    </CardHeader>
                    <CardContent className="pb-3">
                      <ul className="space-y-2 text-sm">
                        {plan.features.map(feature => <li key={feature} className="flex items-start">
                            <Check className="h-4 w-4 mr-2 text-primary flex-shrink-0 mt-0.5" />
                            {feature.includes("Plus all interview features") ? (
                              <span className="font-semibold text-primary">{feature}</span>
                            ) : (
                              <span>{feature}</span>
                            )}
                          </li>)}
                      </ul>
                    </CardContent>
                    <CardFooter>
                      <Dialog open={isUpgradeOpen && selectedPlan?.id === plan.id} onOpenChange={setIsUpgradeOpen}>
                        <DialogTrigger asChild>
                          <Button className="w-full" variant={plan.isCurrent ? "outline" : "default"} disabled={plan.isCurrent && currentStatus === 'active'} onClick={() => handleUpgrade(plan)}>
                            {plan.isCurrent ? 'Current Plan' : 'Subscribe'}
                          </Button>
                        </DialogTrigger>
                        
                        {selectedPlan && <PaymentDialog plan={selectedPlan} onSuccess={() => handleUpgradeSuccess(selectedPlan)} onCancel={() => setIsUpgradeOpen(false)} />}
                      </Dialog>
                    </CardFooter>
                </Card>
                );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="resume">
          <Card>
            <CardHeader>
              <CardTitle>Resume Plans</CardTitle>
              <CardDescription>
                Choose a plan for creating and downloading professional resumes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {resumePlans.map(plan => {
                  // For resume plans, check both the resume_subscription_tier and subscription_tier
                  // This handles both dedicated resume plans and interview plans with resume features
                  const isCurrentResumePlan = 
                    plan.id.startsWith('resume_') 
                      ? (profile.resume_subscription_tier === plan.id && profile.resume_subscription_status === 'active')
                      : (profile.subscription_tier === plan.id && profile.subscription_status === 'active');
                  
                  // Special styling for Megastar plan to make it stand out
                  const isMegastar = plan.id === 'diamond_yearly';
                  const cardClassName = isCurrentResumePlan 
                    ? 'border-primary bg-primary/5' 
                    : isMegastar 
                      ? 'border-2 border-gradient-to-r from-yellow-400 to-orange-500 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300'
                      : '';
                  
                  return (
                    <Card key={plan.id} className={`border ${cardClassName} ${isMegastar ? 'relative overflow-hidden' : ''}`}>
                      <CardHeader className="pb-3">
                        {isMegastar && (
                          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500"></div>
                        )}
                        <CardTitle className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                          {plan.name}
                            {isMegastar && <span className="text-2xl">🌟</span>}
                          </div>
                          <div className="flex flex-col gap-1">
                          {isCurrentResumePlan && <Badge variant="outline" className="ml-2">Current</Badge>}
                            {isMegastar && !isCurrentResumePlan && (
                              <Badge className="ml-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0 animate-pulse">
                                🔥 BEST DEAL
                              </Badge>
                            )}
                          </div>
                        </CardTitle>
                        <div className="flex justify-between items-center">
                          <div>
                              <span className={`text-2xl font-bold ${isMegastar ? 'text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-orange-600' : ''}`}>
                                ${plan.price}
                              </span>
                            <span className="text-muted-foreground">/{plan.period}</span>
                              {isMegastar && (
                                <div className="text-sm font-semibold text-green-600 dark:text-green-400">
                                  Save $157/year! 💰
                                </div>
                              )}
                          </div>
                          {/* Add badge for plans that include interview features */}
                          {(['gold', 'diamond', 'diamond_yearly'].includes(plan.id)) && (
                              <Badge 
                                variant="secondary" 
                                className={`ml-2 whitespace-nowrap ${isMegastar ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0' : ''}`}
                              >
                                {isMegastar ? '⭐ Resume + Interview' : 'Resume + Interview'}
                            </Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="pb-3">
                        <ul className="space-y-2 text-sm">
                          {plan.features.map(feature => <li key={feature} className="flex items-start">
                              <Check className="h-4 w-4 mr-2 text-primary flex-shrink-0 mt-0.5" />
                              {feature.includes("Plus all interview features") ? (
                                <span className="font-semibold text-primary">{feature}</span>
                              ) : (
                                <span>{feature}</span>
                              )}
                            </li>)}
                        </ul>
                      </CardContent>
                      <CardFooter>
                        <Dialog open={isUpgradeOpen && selectedPlan?.id === plan.id} onOpenChange={setIsUpgradeOpen}>
                          <DialogTrigger asChild>
                            <Button 
                              className="w-full" 
                              variant={isCurrentResumePlan ? "outline" : "default"} 
                              disabled={isCurrentResumePlan && 
                                (plan.id.startsWith('resume_') 
                                  ? profile.resume_subscription_status === 'active' 
                                  : profile.subscription_status === 'active')} 
                              onClick={() => handleUpgrade(plan)}
                            >
                              {isCurrentResumePlan ? 'Current Plan' : 'Subscribe'}
                            </Button>
                          </DialogTrigger>
                          
                          {selectedPlan && <PaymentDialog plan={selectedPlan} onSuccess={() => handleUpgradeSuccess(selectedPlan)} onCancel={() => setIsUpgradeOpen(false)} />}
                        </Dialog>
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>;
};

export default SubscriptionSettings;
