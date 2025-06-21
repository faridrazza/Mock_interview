import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

interface Plan {
  id: string;
  name: string;
  price: string;
  period: 'monthly' | 'yearly';
  features: string[];
}

interface PaymentDialogProps {
  plan: Plan;
  onSuccess: () => void;
  onCancel: () => void;
}

const PaymentDialog: React.FC<PaymentDialogProps> = ({ plan, onSuccess, onCancel }) => {
  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-amber-500" />
          Payment System Disabled
        </DialogTitle>
        <DialogDescription>
          The payment system has been temporarily disabled. All features are currently available for free.
        </DialogDescription>
      </DialogHeader>
      
      <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-md">
        <div className="text-sm text-amber-700 dark:text-amber-400">
          <p><strong>Selected Plan:</strong> {plan.name}</p>
          <p><strong>Price:</strong> ${plan.price}/{plan.period}</p>
          <p className="mt-2 text-green-600 dark:text-green-400">
            Good news! All premium features are currently available for free while we update our payment system.
          </p>
        </div>
      </div>
      
      <div className="flex justify-end gap-2 mt-4">
        <Button variant="outline" onClick={onCancel}>
          Close
        </Button>
        <Button onClick={onSuccess}>
          Continue for Free
        </Button>
      </div>
    </DialogContent>
  );
};

export default PaymentDialog; 