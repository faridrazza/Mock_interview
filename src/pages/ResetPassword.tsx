
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { updatePassword } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, ArrowLeft, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchParams] = useSearchParams();
  const [resetError, setResetError] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);
  const [validToken, setValidToken] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkSession = async () => {
      try {
        setIsValidating(true);
        // Verify if we have a recovery token in the URL
        // Supabase automatically handles session creation from the URL
        const { data, error } = await supabase.auth.getSession();
        
        // If we have a session and are on the reset-password page, then we have a valid recovery flow
        if (data?.session && window.location.pathname.includes('reset-password')) {
          console.log('Valid recovery session detected');
          setValidToken(true);
        } else if (searchParams.has('error_description')) {
          // Handle error from Supabase
          const errorMsg = searchParams.get('error_description') || 'Invalid or expired reset link';
          setResetError(errorMsg);
          setValidToken(false);
        } else if (error || (!data?.session && searchParams.has('type'))) {
          console.error('Error validating recovery token:', error);
          setResetError('This password reset link is invalid or has expired.');
          setValidToken(false);
        } else {
          // No session and no recovery-related parameters - user probably navigated here directly
          setResetError('No valid password reset request detected.');
          setValidToken(false);
        }
      } catch (err) {
        console.error('Error checking recovery token:', err);
        setResetError('An error occurred while validating your reset link.');
        setValidToken(false);
      } finally {
        setIsValidating(false);
      }
    };

    checkSession();
  }, [searchParams]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (password !== confirmPassword) {
      setResetError("Passwords don't match");
      return;
    }
    
    if (password.length < 6) {
      setResetError("Password must be at least 6 characters");
      return;
    }
    
    setResetError('');
    setIsSubmitting(true);
    
    try {
      await updatePassword(password);
      setResetSuccess(true);
      
      toast({
        title: "Password updated",
        description: "Your password has been successfully reset.",
      });
      
      // Redirect after a short delay to allow the user to see the success message
      setTimeout(() => {
        navigate('/auth');
      }, 3000);
    } catch (error: any) {
      setResetError(error.message || "Failed to reset password");
      toast({
        title: "Password reset failed",
        description: error.message || "An error occurred while resetting your password.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render loading state while validating token
  if (isValidating) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-brand-50 to-purple-50 dark:from-neutral-900 dark:to-brand-950">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-brand-500" />
          <p className="text-lg font-medium text-neutral-700 dark:text-neutral-200">Validating reset link...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-brand-50 to-purple-50 dark:from-neutral-900 dark:to-brand-950">
      <Button 
        variant="ghost" 
        className="absolute top-4 left-4 gap-2"
        onClick={() => navigate('/')}
      >
        <ArrowLeft size={16} />
        Back to Home
      </Button>

      <div className="w-full max-w-md">
        <Card className="border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden bg-white/90 dark:bg-neutral-800/90 backdrop-blur-sm">
          <CardHeader className="text-center relative z-10 pb-6">
            <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-r from-brand-500/20 via-purple-500/20 to-pink-500/20 -z-10"></div>
            <CardTitle className="text-2xl font-bold mt-6">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-500 to-purple-600">
                Reset Your Password
              </span>
            </CardTitle>
            <CardDescription className="text-neutral-600 dark:text-neutral-300">
              {validToken ? "Please enter your new password below" : "Password Reset Link"}
            </CardDescription>
          </CardHeader>
          
          {resetSuccess ? (
            <CardContent className="space-y-4 pt-4">
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
                <h3 className="text-xl font-semibold text-neutral-800 dark:text-neutral-100">Password Reset Successful!</h3>
                <p className="text-neutral-600 dark:text-neutral-300 mt-2">
                  Your password has been updated successfully.
                </p>
                <p className="text-neutral-500 dark:text-neutral-400 mt-1">
                  Redirecting you to login page...
                </p>
              </div>
            </CardContent>
          ) : !validToken ? (
            <CardContent className="space-y-4 pt-4">
              <div className="bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 px-4 py-6 rounded-md flex flex-col items-center text-center">
                <AlertCircle className="h-12 w-12 mb-2 flex-shrink-0" />
                <h3 className="text-lg font-semibold">Invalid reset link</h3>
                <p className="mt-1">{resetError || 'This password reset link is invalid or has expired.'}</p>
                <p className="mt-3">Please request a new one.</p>
                <Button 
                  className="mt-4 bg-gradient-to-r from-brand-500 to-purple-600 hover:from-brand-600 hover:to-purple-700 text-white rounded-full"
                  onClick={() => navigate('/auth')}
                >
                  Return to Login
                </Button>
              </div>
            </CardContent>
          ) : (
            <form onSubmit={handleResetPassword}>
              <CardContent className="space-y-5 pt-6">
                {resetError && (
                  <div className="bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 px-4 py-3 rounded-md flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                    <span>{resetError}</span>
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-neutral-700 dark:text-neutral-300 flex items-center gap-2">
                    <Lock size={16} className="text-neutral-500" />
                    New Password
                  </Label>
                  <Input 
                    id="password" 
                    type="password" 
                    placeholder="••••••••" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 focus-visible:ring-brand-500"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-neutral-700 dark:text-neutral-300 flex items-center gap-2">
                    <Lock size={16} className="text-neutral-500" />
                    Confirm Password
                  </Label>
                  <Input 
                    id="confirmPassword" 
                    type="password" 
                    placeholder="••••••••" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 focus-visible:ring-brand-500"
                    required
                  />
                </div>
              </CardContent>
              
              <CardFooter className="flex flex-col">
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-brand-500 to-purple-600 hover:from-brand-600 hover:to-purple-700 text-white rounded-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Resetting Password...
                    </>
                  ) : 'Reset Password'}
                </Button>
              </CardFooter>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ResetPassword;
