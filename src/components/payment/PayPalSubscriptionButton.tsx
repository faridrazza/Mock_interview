import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';

// Add PayPal SDK type definition
declare global {
  interface Window {
    paypal?: any;
  }
}

interface PayPalSubscriptionButtonProps {
  planId: string;
  planType?: string;
  userId: string;
  onSuccess: (subscriptionId: string) => void;
  onError: (error: Error) => void;
  onCancel?: () => void;
}

const PayPalSubscriptionButton: React.FC<PayPalSubscriptionButtonProps> = ({
  planId,
  planType,
  userId,
  onSuccess,
  onError,
  onCancel
}) => {
  const paypalContainerRef = useRef<HTMLDivElement>(null);
  const [sdkReady, setSdkReady] = useState(false);
  const [buttonRendered, setButtonRendered] = useState(false);
  const [hasError, setHasError] = useState(false);
  const buttonInstanceRef = useRef<any>(null);
  const cleanupInProgress = useRef(false);
  const sdkFullyInitialized = useRef(false);

  // Log the plan ID and type for debugging
  useEffect(() => {
    console.log("PayPal Button Component - Plan ID:", planId, "Plan Type:", planType, "User ID:", userId);
    if (!planId) {
      console.warn("PayPal Button - No plan ID provided");
      onError(new Error("No subscription plan ID provided"));
    } else if (!planId.startsWith("P-")) {
      console.warn("PayPal Button - Plan ID format may be incorrect. Expected format like P-xxxxxxxx but got:", planId);
    }
  }, [planId, planType, userId, onError]);

  useEffect(() => {
    // Enhanced PayPal SDK check function
    const checkPayPalSDKFullyInitialized = () => {
      return window.paypal && 
             typeof window.paypal === 'object' && 
             window.paypal.Buttons && 
             typeof window.paypal.Buttons === 'function';
    };

    // Check if PayPal SDK is loaded
    if (checkPayPalSDKFullyInitialized()) {
      console.log("PayPal SDK detected and fully initialized");
      sdkFullyInitialized.current = true;
      setSdkReady(true);
    } else {
      console.log("PayPal SDK not yet fully loaded...");
      
      // Set up an event listener for when PayPal SDK loads
      const checkInterval = setInterval(() => {
        if (checkPayPalSDKFullyInitialized()) {
          console.log("PayPal SDK fully initialized");
          clearInterval(checkInterval);
          sdkFullyInitialized.current = true;
          setSdkReady(true);
        }
      }, 100);

      // Clean up the interval
      return () => {
        clearInterval(checkInterval);
      };
    }
  }, []);
  
  useEffect(() => {
    // Reset button state if planId changes
    if (planId && buttonRendered) {
      console.log("Plan ID changed, resetting button");
      setButtonRendered(false);
      setHasError(false);
      if (buttonInstanceRef.current && typeof buttonInstanceRef.current.close === 'function') {
        try {
          buttonInstanceRef.current.close();
        } catch (err) {
          console.log("Error closing previous button:", err);
        }
        buttonInstanceRef.current = null;
      }
    }
  }, [planId]);

  // Function to retry rendering the button after an error
  const handleRetry = () => {
    setHasError(false);
    setButtonRendered(false);
    if (buttonInstanceRef.current && typeof buttonInstanceRef.current.close === 'function') {
      try {
        buttonInstanceRef.current.close();
      } catch (err) {
        console.log("Error closing button on retry:", err);
      }
      buttonInstanceRef.current = null;
    }
  };

  useEffect(() => {
    // Function to render PayPal button
    const renderButton = () => {
      // Skip if cleanup is in progress
      if (cleanupInProgress.current) {
        console.log("Cleanup in progress, skipping render");
        return;
      }

      // Only render button if we have a planId, PayPal SDK is ready, and container exists
      if (!planId || !sdkReady || !paypalContainerRef.current || buttonRendered || hasError || !sdkFullyInitialized.current) {
        console.log("Skipping button render:", { 
          hasPlanId: !!planId, 
          isSdkReady: sdkReady, 
          hasContainer: !!paypalContainerRef.current, 
          isButtonRendered: buttonRendered,
          hasError: hasError,
          isSDKFullyInitialized: sdkFullyInitialized.current
        });
        return;
      }

      // Add a small delay to ensure PayPal SDK is fully initialized
      setTimeout(() => {
        if (cleanupInProgress.current) return;

        console.log("Rendering PayPal button for plan:", planId, "Plan Type:", planType, "User ID:", userId);
        
        try {
          // Clear any existing elements in the container
          if (paypalContainerRef.current) {
            paypalContainerRef.current.innerHTML = '';
          }
          
          // Create the PayPal button
          buttonInstanceRef.current = window.paypal.Buttons({
            style: {
              shape: 'rect',
              color: 'gold',
              layout: 'vertical',
              label: 'subscribe'
            },
            
            createSubscription: (data: any, actions: any) => {
              console.log("Creating subscription for plan:", planId, "Plan Type:", planType, "User ID:", userId);
              if (!planId) {
                console.error("Cannot create subscription: No plan ID provided");
                onError(new Error("No subscription plan ID provided"));
                setHasError(true);
                return Promise.reject("No plan ID provided");
              }
              
              // Validate plan ID format
              if (!planId.startsWith("P-")) {
                console.warn("Plan ID format may be incorrect, but attempting to create subscription anyway:", planId);
              }
              
              return actions.subscription.create({
                plan_id: planId,
                custom_id: `${planType}:${userId}` // Store both plan type and user ID in custom_id
              }).catch((error: any) => {
                console.error("PayPal subscription creation error:", error);
                // Check if it's a resource not found error, which indicates an invalid plan ID
                if (error && error.message && error.message.includes("RESOURCE_NOT_FOUND")) {
                  console.error("Plan ID may be invalid or inaccessible:", planId);
                  setHasError(true);
                  onError(new Error(`Please refresh and try again.`));
                } else {
                  setHasError(true);
                  onError(new Error(`Failed to create subscription: ${error.message || JSON.stringify(error)}`));
                }
                throw error;
              });
            },
            
            onApprove: (data: any, actions: any) => {
              console.log("Subscription approved:", data);
              console.log("Plan type for this subscription:", planType);
              console.log("User ID for this subscription:", userId);
              
              // Only call onSuccess if we actually have a subscription ID
              if (data && data.subscriptionID) {
                // Store the confirmed subscription ID in session storage
                // This will be used by the Dashboard component to verify the subscription was completed
                sessionStorage.setItem('confirmedSubscriptionId', data.subscriptionID);
                
                // Also store plan type for the thank you page
                if (planType) {
                  sessionStorage.setItem('confirmedPlanType', planType);
                }
                
                onSuccess(data.subscriptionID);
              } else {
                console.error("PayPal approval missing subscription ID:", data);
                onError(new Error("Payment approved but no subscription ID was returned"));
              }
            },
            
            onCancel: () => {
              console.log("Subscription cancelled by user");
              setHasError(false); // Reset error state in case user wants to try again
              if (onCancel) {
                onCancel();
              }
            },
            
            onError: (err: Error) => {
              console.error("PayPal error:", err);
              setHasError(true);
              onError(err);
            }
          });
          
          // Render the button if the container still exists
          if (paypalContainerRef.current && !cleanupInProgress.current) {
            buttonInstanceRef.current.render(paypalContainerRef.current);
            setButtonRendered(true);
            console.log("PayPal button rendered successfully");
          }
        } catch (error) {
          console.error("Error rendering PayPal button:", error);
          setHasError(true);
          onError(error instanceof Error ? error : new Error(String(error)));
        }
      }, 200); // Small delay to ensure SDK is fully initialized
    };

    renderButton();
  }, [planId, planType, userId, sdkReady, buttonRendered, hasError, onSuccess, onError, onCancel]);

  // Clean up when component unmounts
  useEffect(() => {
    return () => {
      cleanupInProgress.current = true;
      console.log("Cleaning up PayPal button...");
      
      // Clean up button instance if it exists
      if (buttonInstanceRef.current && typeof buttonInstanceRef.current.close === 'function') {
        try {
          buttonInstanceRef.current.close();
        } catch (err) {
          console.log("Error closing button on unmount:", err);
        }
        buttonInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div 
      className="paypal-button-container border border-gray-200 dark:border-gray-700 rounded-md p-4 min-h-[150px] flex flex-col items-center justify-center"
      style={{ minHeight: '200px' }}
    >
      {!sdkReady && <p>Loading payment options...</p>}
      
      {hasError && (
        <div className="flex flex-col items-center space-y-4 text-center">
          <AlertCircle className="h-10 w-10 text-red-500" />
          <p className="text-red-500">There was an error loading the payment options.</p>
          <p className="text-sm text-muted-foreground mb-2">
            This could be due to an invalid plan ID or connection issue.
          </p>
          <Button 
            variant="outline" 
            onClick={handleRetry}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Retry
          </Button>
        </div>
      )}
      
      <div 
        ref={paypalContainerRef} 
        style={{ width: '100%', minHeight: '150px', display: hasError ? 'none' : 'block' }}
        data-paypal-button="true"
      />
    </div>
  );
};

export default PayPalSubscriptionButton;
