
import React, { useEffect, useState, createContext, useContext } from 'react';
import { supabase } from '../../lib/supabase';
import { logPayPalDiagnostics } from '../../utils/paypalUtils';

// Create a context for PayPal availability
export const PayPalContext = createContext<{
  isPayPalReady: boolean;
  error: string | null;
}>({
  isPayPalReady: false,
  error: null
});

// Hook to consume the PayPal context
export const usePayPal = () => useContext(PayPalContext);

interface PayPalProviderProps {
  children: React.ReactNode;
}

export const PayPalProvider: React.FC<PayPalProviderProps> = ({ children }) => {
  const [isPayPalReady, setIsPayPalReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPayPalScript = async () => {
      try {
        // Check if the script already exists
        const existingScript = document.querySelector('script[data-ppjs=true]');
        if (existingScript) {
          console.log('PayPal script already exists, not loading again');
          setIsPayPalReady(true);
          return;
        }

        // Fetch client ID from our backend
        let clientId: string;
        try {
          // Get the Supabase URL from environment or use default
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
          
          if (!response.ok) {
            const errorText = await response.text();
            console.error(`Error fetching client ID: ${response.status}`, errorText);
            throw new Error(`Failed to get PayPal client ID: ${errorText}`);
          }
          
          const data = await response.json();
          console.log("Client ID response:", data);
          
          if (data && data.clientId) {
            clientId = data.clientId;
            console.log("Using PayPal client ID from server:", clientId);
          } else {
            // For sandbox testing as fallback
            clientId = 'test';
            console.log('Using PayPal sandbox client ID (test) for development');
          }
        } catch (err) {
          console.error("Error fetching client ID:", err);
          clientId = 'test';
          console.log('Using PayPal sandbox client ID (test) after error');
        }

        // Create and append the script
        const script = document.createElement('script');
        script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&vault=true&intent=subscription`;
        script.setAttribute('data-ppjs', 'true');
        script.setAttribute('data-namespace', 'paypal');
        script.async = true;
        script.onload = () => {
          console.log('PayPal SDK loaded successfully');
          setIsPayPalReady(true);
        };
        script.onerror = (e) => {
          console.error('PayPal SDK failed to load', e);
          setError('Failed to load payment system. Please try again later.');
          
          // Run diagnostics to help identify issues
          logPayPalDiagnostics();
        };

        document.head.appendChild(script);
      } catch (err) {
        console.error('Error setting up PayPal:', err);
        setError(`Payment system configuration error: ${err instanceof Error ? err.message : String(err)}`);
        
        // Run diagnostics to help identify issues
        logPayPalDiagnostics();
      }
    };

    loadPayPalScript();

    // Cleanup
    return () => {
      const script = document.querySelector('script[data-ppjs=true]');
      if (script) {
        script.remove();
      }
    };
  }, []);

  return (
    <PayPalContext.Provider value={{ isPayPalReady, error }}>
      {children}
    </PayPalContext.Provider>
  );
};

export default PayPalProvider;
