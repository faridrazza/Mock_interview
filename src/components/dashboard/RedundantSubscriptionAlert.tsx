// import React from 'react';
// import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
// import { Button } from '@/components/ui/button';
// import { AlertCircle } from 'lucide-react';

// interface RedundantSubscriptionAlertProps {
//   message: string;
//   resumeSubscriptionId?: string;
//   onCancelled: () => void;
// }

// export const RedundantSubscriptionAlert: React.FC<RedundantSubscriptionAlertProps> = ({
//   message,
//   resumeSubscriptionId,
//   onCancelled
// }) => {
//   const handleCancel = () => {
//     // Since payment system is disabled, just call the callback
//     onCancelled();
//   };

//   return (
//     <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-900/20">
//       <AlertCircle className="h-4 w-4 text-amber-600" />
//       <AlertTitle>Subscription Notice</AlertTitle>
//       <AlertDescription className="mt-2">
//         <p className="text-sm text-amber-700 dark:text-amber-400 mb-3">
//           {message}
//         </p>
//         <p className="text-sm text-green-600 dark:text-green-400 mb-3">
//           Note: Payment system is currently disabled. All features are available for free.
//         </p>
//         <Button 
//           variant="outline" 
//           size="sm" 
//           onClick={handleCancel}
//           className="border-amber-300 hover:bg-amber-100"
//         >
//           Acknowledge
//         </Button>
//       </AlertDescription>
//     </Alert>
//   );
// }; 