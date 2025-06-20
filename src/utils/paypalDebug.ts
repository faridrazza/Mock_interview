/**
 * PayPal Integration Debug Helper
 */
export const debugPayPalIntegration = async () => {
  console.group('🔍 PayPal Integration Debug');
  
  // Check if PayPal SDK is loaded
  console.log('1. PayPal SDK loaded:', typeof window.paypal !== 'undefined');
  
  // Check SDK initialization parameters
  const paypalScript = document.querySelector('script[src*="paypal.com/sdk/js"]');
  console.log('2. PayPal script tag:', paypalScript ? '✅ Found' : '❌ Not found');
  if (paypalScript) {
    console.log('   Script src:', paypalScript.getAttribute('src'));
    console.log('   Environment:', paypalScript.getAttribute('src')?.includes('environment=sandbox') ? 'sandbox' : 'production');
  }
  
  // Check if we can call Edge Functions
  try {
    console.log('3. Testing Edge Function connectivity:');
    const response = await fetch('/functions/v1/get-paypal-plan-id', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        plan_type: 'gold',
        billing_cycle: 'monthly',
        user_id: 'test-user'
      })
    });
    
    console.log('   Response status:', response.status);
    const data = await response.json();
    console.log('   Response data:', data);
  } catch (err) {
    console.error('   Edge Function error:', err);
  }
  
  console.groupEnd();
};

// Call this in your component during testing
// debugPayPalIntegration(); 