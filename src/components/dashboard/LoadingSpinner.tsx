
import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingSpinner = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-900">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-brand-500" />
        <p className="text-lg font-medium text-neutral-700 dark:text-neutral-200">Loading your dashboard...</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;
