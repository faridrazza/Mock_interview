import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface RedundantSubscriptionAlertProps {
  message: string;
  resumeSubscriptionId?: string;
  onCancelled?: () => void;
}

/**
 * Alert component that shows when a user has redundant subscriptions
 */
export const RedundantSubscriptionAlert = ({ 
  message, 
  resumeSubscriptionId, 
  onCancelled 
}: RedundantSubscriptionAlertProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isSubscriptionActive, setIsSubscriptionActive] = useState(false);
  const { toast } = useToast();
  const { refreshProfile } = useAuth();

  // Check if the subscription is actually active in the database
  useEffect(() => {
    const checkSubscriptionStatus = async () => {
      if (!resumeSubscriptionId) return;
      
      try {
        const { data, error } = await supabase
          .from('subscriptions')
          .select('payment_status')
          .eq('payment_provider_subscription_id', resumeSubscriptionId)
          .maybeSingle();
          
        if (!error && data) {
          setIsSubscriptionActive(data.payment_status === 'active');
        } else {
          setIsSubscriptionActive(false);
        }
      } catch (err) {
        console.error('Error checking subscription status:', err);
        setIsSubscriptionActive(false);
      }
    };
    
    checkSubscriptionStatus();
  }, [resumeSubscriptionId]);

  const handleCancelSubscription = async () => {
    if (!resumeSubscriptionId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Couldn't find the subscription to cancel."
      });
      return;
    }

    try {
      setIsCancelling(true);
      
      const { data, error } = await supabase.functions.invoke('cancel-subscription', {
        body: {
          subscription_id: resumeSubscriptionId,
          is_redundant: true // flag to indicate this is a redundant subscription
        }
      });
      
      if (error) {
        throw new Error(`Error calling cancel-subscription function: ${error.message}`);
      }
      
      if (data.status === "success") {
        toast({
          title: "Subscription Cancelled",
          description: "Your redundant resume subscription has been successfully cancelled."
        });
        
        // Refresh profile to update subscription status
        await refreshProfile();
        
        // Call the onCancelled callback if provided
        if (onCancelled) {
          onCancelled();
        }
        
        setIsDialogOpen(false);
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

  // If the subscription isn't active, don't show the cancel button
  const renderCancelButton = () => {
    if (!isSubscriptionActive) {
      return null; // Don't show cancel button for non-active subscriptions
    }
    
    return (
      <Button 
        variant="outline" 
        size="sm" 
        className="border-yellow-300 hover:bg-yellow-100 hover:text-yellow-900 dark:border-yellow-700 dark:hover:bg-yellow-900/30"
        onClick={() => setIsDialogOpen(true)}
      >
        Cancel Redundant Subscription
      </Button>
    );
  };

  return (
    <>
      <Alert variant="destructive" className="mb-6 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
        <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-500" />
        <AlertTitle className="text-yellow-800 dark:text-yellow-300">
          Duplicate Subscriptions Detected
        </AlertTitle>
        <AlertDescription className="text-yellow-700 dark:text-yellow-400">
          {message}
          <div className="mt-2">
            {renderCancelButton()}
          </div>
        </AlertDescription>
      </Alert>

      {/* Confirmation dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Redundant Subscription</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel your redundant resume subscription? 
              You will still have access to all resume features through your interview subscription.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 mt-4">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Keep Both Subscriptions
            </Button>
            <Button 
              variant="default" 
              onClick={handleCancelSubscription}
              disabled={isCancelling}
            >
              {isCancelling ? (
                <>
                  <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-t-transparent border-r-transparent border-white"></span>
                  Cancelling...
                </>
              ) : (
                'Cancel Redundant Subscription'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
