import React, { useEffect } from 'react';

// This function should be called once at app initialization
export function suppressFragmentWarnings() {
  const originalConsoleError = console.error;
  
  console.error = function(...args) {
    if (
      args.length > 0 && 
      typeof args[0] === 'string' && 
      args[0].includes('Invalid prop `data-lov-id` supplied to `React.Fragment`')
    ) {
      // Don't log this specific warning
      return;
    }
    
    // For all other errors, use the original console.error
    return originalConsoleError.apply(console, args);
  };
}

// This component is maintained for backwards compatibility
export const SuppressFragmentWarnings: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>;
}; 