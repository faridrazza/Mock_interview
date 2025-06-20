import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';

// Add TypeScript declaration for Twitter pixel
declare global {
  interface Window {
    twq?: (command: string, eventId: string, parameters?: Record<string, any>) => void;
  }
}

const ThankYou = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { refreshProfile } = useAuth();
  
  // Parse query parameters to get subscription info
  const queryParams = new URLSearchParams(location.search);
  const planName = queryParams.get('plan') || 'premium';
  const subscriptionId = queryParams.get('subscription_id');
  
  // Verify if the user came from a subscription process
  useEffect(() => {
    const storedSubscriptionId = sessionStorage.getItem('confirmedSubscriptionId');
    
    // If no subscription ID in URL or session storage, redirect to dashboard
    if (!subscriptionId && !storedSubscriptionId) {
      navigate('/dashboard');
    }
    
    // Clean up session storage after verification
    return () => {
      sessionStorage.removeItem('confirmedSubscriptionId');
      sessionStorage.removeItem('confirmedPlanType');
      sessionStorage.removeItem('selectedPlan');
    };
  }, [subscriptionId, navigate]);
  
  // Refresh profile on page load to ensure subscription status is up to date
  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);
  
  // Twitter conversion tracking for purchases
  useEffect(() => {
    // Only trigger the Twitter event if we have a subscription ID (confirming a purchase)
    if (subscriptionId || sessionStorage.getItem('confirmedSubscriptionId')) {
      // Check if the Twitter tracking object exists (should be initialized in index.html)
      if (window.twq) {
        // Fire the Twitter conversion event
        window.twq('event', 'tw-pkxwx-pkxwy', {});
      }
    }
  }, [subscriptionId]);
  
  return (
    <div className="container max-w-3xl py-12 px-4 md:px-6 mx-auto">
      <Card className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20">
        <CardHeader className="pb-4">
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle className="text-2xl md:text-3xl text-center">Thank You for Your Subscription!</CardTitle>
          <CardDescription className="text-center text-base">
            Your subscription to the {planName} plan has been successfully processed.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {subscriptionId && (
            <div className="bg-white dark:bg-gray-800 p-4 rounded-md">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Subscription Reference</p>
              <p className="font-mono text-sm">{subscriptionId}</p>
            </div>
          )}
          
          <div className="space-y-2">
            <h3 className="text-lg font-medium">What's Next?</h3>
            <ul className="list-disc list-inside space-y-1 text-sm md:text-base">
              <li>Your account has been upgraded with your new subscription benefits</li>
              <li>You can now access all features included in your subscription plan</li>
              <li>Again thank you for your purchase and we hope you enjoy using our platform</li>
            </ul>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button 
            onClick={() => navigate('/dashboard?tab=subscription')}
            className="min-w-[200px]"
          >
            Return to Dashboard
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ThankYou; 