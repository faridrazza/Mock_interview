import { supabase } from '@/integrations/supabase/client';

// Simplified PayPal utilities since payment system is removed
export const logPayPalDiagnostics = () => {
  console.log('PayPal payment system has been disabled');
};

export const fetchPayPalPlanId = async (planType: string) => {
  console.log('PayPal payment system has been disabled');
  throw new Error('Payment system is currently disabled');
};

export const manuallyAssociateSubscription = async (subscriptionId: string) => {
  console.log('PayPal payment system has been disabled');
  return {
    success: false,
    message: 'Payment system is currently disabled'
  };
}; 