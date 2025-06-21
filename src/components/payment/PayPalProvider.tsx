import React from 'react';
import { useToast } from '@/hooks/use-toast';
import { logPayPalDiagnostics } from '../../utils/paypalUtils';

interface PayPalProviderProps {
  children: React.ReactNode;
}

const PayPalProvider: React.FC<PayPalProviderProps> = ({ children }) => {
  const { toast } = useToast();

  React.useEffect(() => {
    // Log PayPal diagnostics on mount
    logPayPalDiagnostics();
  }, []);

  // Since PayPal is removed, just render children without PayPal context
  return <>{children}</>;
};

export default PayPalProvider;