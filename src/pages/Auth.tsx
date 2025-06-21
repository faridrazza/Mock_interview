import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Mail, Lock, User, Loader2 } from 'lucide-react';
import { sendPasswordResetEmail } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

const Auth = () => {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') === 'signup' ? 'signup' : 'signin';
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [forgotPasswordSubmitting, setForgotPasswordSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const { signIn, signUp, signInWithGoogle, user, isLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Save redirect parameter to localStorage when it's present
  useEffect(() => {
    const redirectParam = searchParams.get('redirect');
    if (redirectParam === 'resume') {
      localStorage.setItem('authRedirectSource', 'resume');
    }
  }, [searchParams]);

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      console.log('User authenticated, redirecting to dashboard');
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // Check for pending resume data after successful authentication
  useEffect(() => {
    const handlePendingResumeData = async () => {
      // Only proceed if user is authenticated and we have pending resume data
      if (!user) return;
      
      const pendingResumeData = localStorage.getItem('pendingResume');
      const redirectParam = searchParams.get('redirect') || localStorage.getItem('authRedirectSource');
      
      // Clean up the stored redirect source
      localStorage.removeItem('authRedirectSource');
      
      // Check if we came from the resume page and have pending data
      if (redirectParam === 'resume' && pendingResumeData) {
        try {
          const resumeData = JSON.parse(pendingResumeData);
          
          // Get Supabase session for the access token instead of using Firebase's getIdToken
          const { data: sessionData } = await supabase.auth.getSession();
          const accessToken = sessionData?.session?.access_token;
          
          if (!accessToken) {
            throw new Error('Unable to get authentication token');
          }
          
          // Use AWS Lambda function instead of Supabase Edge Function, and include the ATS score explicitly
          const { lambdaApi } = await import('@/config/aws-lambda');
          
          const data = await lambdaApi.createResume({
              title: resumeData.content.contactInfo.name 
                ? `${resumeData.content.contactInfo.name}'s Resume` 
                : 'My Resume',
              content: resumeData.content,
              originalText: resumeData.originalText,
              jobDescription: resumeData.jobDescription,
              selectedTemplate: resumeData.selectedTemplate || 'standard',
              atsScore: resumeData.atsScore // Explicitly include the ATS score
          }, accessToken);
          
          if (!data) {
            throw new Error('Failed to create resume from pending data');
          }
          
          // Clear the pending data
          localStorage.removeItem('pendingResume');
          
          // Redirect to the resume editor page with the new resume ID
          navigate(`/dashboard/resume/${data.id}`);
          
          // Show success notification
          toast({
            title: "Resume created",
            description: "Your resume has been saved to your account.",
          });
          
        } catch (error) {
          console.error('Error processing pending resume data:', error);
          
          // Log more details about the error and resume data for debugging
          try {
            const resumeData = JSON.parse(localStorage.getItem('pendingResume') || '{}');
            console.error('Pending resume data that failed:', {
              hasContent: !!resumeData.content,
              hasTemplate: !!resumeData.selectedTemplate,
              templateValue: resumeData.selectedTemplate,
              error: error instanceof Error ? error.message : String(error)
            });
          } catch (e) {
            console.error('Error parsing pending resume data for debugging:', e);
          }
          
          // Still redirect to dashboard but show error
          toast({
            title: "Error saving resume",
            description: "There was a problem saving your resume. Please try again.",
            variant: "destructive",
          });
          navigate('/dashboard?tab=resumes');
        }
      } else {
        // Standard redirect to dashboard
        navigate('/dashboard');
      }
    };
    
    handlePendingResumeData();
  }, [user, navigate, searchParams, toast]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await signIn(email, password);
      // Navigation is handled by the useEffect above when user state changes
    } catch (error) {
      console.error('Sign in error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await signUp(email, password, fullName);
      // Don't navigate here - wait for email verification
      
      // Check if we came from the resume page
      const redirectParam = searchParams.get('redirect');
      if (redirectParam === 'resume') {
        toast({
          title: "Check your email",
          description: "Please verify your email address to continue editing your resume. Your resume data has been saved.",
        });
      } else {
        toast({
          title: "Account created",
          description: "Please check your email to verify your account.",
        });
      }
    } catch (error) {
      console.error('Sign up error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotPasswordSubmitting(true);
    
    try {
      await sendPasswordResetEmail(forgotPasswordEmail);
      toast({
        title: "Password reset email sent",
        description: "Check your email for a link to reset your password.",
      });
      setIsForgotPassword(false);
    } catch (error: any) {
      toast({
        title: "Password reset failed",
        description: error.message || "Failed to send password reset email.",
        variant: "destructive",
      });
    } finally {
      setForgotPasswordSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsGoogleLoading(true);
      await signInWithGoogle();
      // No need to handle redirect as it's handled by Supabase
    } catch (error) {
      console.error('Google sign in error:', error);
      setIsGoogleLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-brand-50 to-purple-50 dark:from-neutral-900 dark:to-brand-950">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-brand-500" />
          <p className="text-lg font-medium text-neutral-700 dark:text-neutral-200">Authenticating...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-brand-50 to-purple-50 dark:from-neutral-900 dark:to-brand-950">
      <Button 
        variant="ghost" 
        className="absolute top-4 left-4 gap-2 sm:flex hidden"
        onClick={() => navigate('/')}
      >
        <ArrowLeft size={16} />
        Back to Home
      </Button>
      
      {/* Mobile back button */}
      <Button 
        variant="ghost" 
        className="absolute top-6 left-6 sm:hidden p-3 z-50"
        onClick={() => navigate('/')}
      >
        <ArrowLeft size={18} />
      </Button>

      <div className="w-full max-w-md px-2 sm:px-0 mt-10 sm:mt-0">
        <Card className="border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden bg-white/90 dark:bg-neutral-800/90 backdrop-blur-sm">
          <CardHeader className="text-center relative z-10 pb-4 sm:pb-6 px-4 sm:px-6">
            <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-r from-brand-500/20 via-purple-500/20 to-pink-500/20 -z-10"></div>
            <CardTitle className="text-xl sm:text-2xl font-bold mt-6">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-500 to-purple-600">
                Interview Prep Pro
              </span>
            </CardTitle>
            <CardDescription className="text-neutral-600 dark:text-neutral-300 text-sm sm:text-base px-2 sm:px-4 max-w-xs sm:max-w-none mx-auto">
              {isForgotPassword 
                ? "Enter your email to reset your password" 
                : null}
            </CardDescription>
          </CardHeader>

          {isForgotPassword ? (
            <form onSubmit={handleForgotPassword}>
              <CardContent className="space-y-4 sm:space-y-5 pt-4 sm:pt-6 px-4 sm:px-6">
                <div className="space-y-2">
                  <Label htmlFor="forgotPasswordEmail" className="text-neutral-700 dark:text-neutral-300 flex items-center gap-2">
                    <Mail size={16} className="text-neutral-500" />
                    Email
                  </Label>
                  <Input 
                    id="forgotPasswordEmail" 
                    type="email" 
                    placeholder="your.email@example.com" 
                    value={forgotPasswordEmail}
                    onChange={(e) => setForgotPasswordEmail(e.target.value)}
                    className="border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 focus-visible:ring-brand-500"
                    required
                  />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col px-4 sm:px-6 pb-4 sm:pb-6">
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-brand-500 to-purple-600 hover:from-brand-600 hover:to-purple-700 text-white rounded-full"
                  disabled={forgotPasswordSubmitting}
                >
                  {forgotPasswordSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : 'Send Reset Link'}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="mt-4"
                  onClick={() => setIsForgotPassword(false)}
                >
                  Back to Sign In
                </Button>
              </CardFooter>
            </form>
          ) : (
            <Tabs defaultValue={initialTab} className="w-full">
              <div className="border-b border-neutral-200 dark:border-neutral-700 pt-3 sm:pt-0">
                <div className="flex">
                  <button
                    onClick={() => navigate('/auth')}
                    className={`flex-1 py-3 text-center font-medium text-base transition-colors ${
                      initialTab === 'signin' 
                        ? 'text-brand-600 dark:text-brand-400 border-b-2 border-brand-500' 
                        : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200'
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => navigate('/auth?tab=signup')}
                    className={`flex-1 py-3 text-center font-medium text-base transition-colors ${
                      initialTab === 'signup' 
                        ? 'text-brand-600 dark:text-brand-400 border-b-2 border-brand-500' 
                        : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200'
                    }`}
                  >
                    Sign Up
                  </button>
                </div>
              </div>
              
              {initialTab === 'signin' ? (
                <div>
                <form onSubmit={handleSignIn}>
                  <CardContent className="space-y-4 sm:space-y-5 pt-4 sm:pt-6 px-4 sm:px-6">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-neutral-700 dark:text-neutral-300 flex items-center gap-2 text-sm sm:text-base">
                        <Mail size={16} className="text-neutral-500" />
                        Email
                      </Label>
                      <Input 
                        id="email" 
                        type="email" 
                        placeholder="your.email@example.com" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 focus-visible:ring-brand-500 text-sm sm:text-base"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label htmlFor="password" className="text-neutral-700 dark:text-neutral-300 flex items-center gap-2 text-sm sm:text-base">
                          <Lock size={16} className="text-neutral-500" />
                          Password
                        </Label>
                      </div>
                      <Input 
                        id="password" 
                        type="password" 
                        placeholder="••••••••" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 focus-visible:ring-brand-500 text-sm sm:text-base"
                        required
                      />
                      <div className="text-right">
                        <Button 
                          type="button" 
                          variant="link" 
                          className="text-xs sm:text-sm text-brand-600 dark:text-brand-400 p-0 h-auto"
                          onClick={() => {
                            setForgotPasswordEmail(email);
                            setIsForgotPassword(true);
                          }}
                        >
                          Forgot password?
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex flex-col px-4 sm:px-6 pb-4 sm:pb-6">
                    <Button 
                      type="submit" 
                      className="w-full bg-gradient-to-r from-brand-500 to-purple-600 hover:from-brand-600 hover:to-purple-700 text-white rounded-full text-sm sm:text-base"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Signing in...
                        </>
                      ) : 'Sign In'}
                    </Button>
                    
                    {/* Google Sign In Button */}
                    <div className="relative my-4 flex items-center justify-center">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-neutral-300 dark:border-neutral-700"></div>
                      </div>
                      <div className="relative bg-white dark:bg-neutral-800 px-4 text-sm text-neutral-500 dark:text-neutral-400">
                        or continue with
                      </div>
                    </div>
                    
                    <Button 
                      type="button"
                      variant="outline"
                      className="w-full border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                      onClick={handleGoogleSignIn}
                      disabled={isGoogleLoading}
                    >
                      {isGoogleLoading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                          <path
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            fill="#4285F4"
                          />
                          <path
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            fill="#34A853"
                          />
                          <path
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            fill="#FBBC05"
                          />
                          <path
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            fill="#EA4335"
                          />
                        </svg>
                      )}
                      Sign in with Google
                    </Button>
                    
                    <p className="mt-4 text-xs sm:text-sm text-center text-neutral-500">
                      Don't have an account?{" "}
                      <button
                        type="button"
                        className="text-brand-600 hover:underline dark:text-brand-400"
                        onClick={() => navigate('/auth?tab=signup')}
                      >
                        Sign up
                      </button>
                    </p>
                  </CardFooter>
                </form>
                </div>
              ) : (
                <div>
                <form onSubmit={handleSignUp}>
                  <CardContent className="space-y-4 sm:space-y-5 pt-4 sm:pt-6 px-4 sm:px-6">
                    <div className="space-y-2">
                      <Label htmlFor="fullName" className="text-neutral-700 dark:text-neutral-300 flex items-center gap-2 text-sm sm:text-base">
                        <User size={16} className="text-neutral-500" />
                        Full Name
                      </Label>
                      <Input 
                        id="fullName" 
                        type="text" 
                        placeholder="John Doe" 
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 focus-visible:ring-brand-500 text-sm sm:text-base"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signupEmail" className="text-neutral-700 dark:text-neutral-300 flex items-center gap-2 text-sm sm:text-base">
                        <Mail size={16} className="text-neutral-500" />
                        Email
                      </Label>
                      <Input 
                        id="signupEmail" 
                        type="email" 
                        placeholder="your.email@example.com" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 focus-visible:ring-brand-500 text-sm sm:text-base"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signupPassword" className="text-neutral-700 dark:text-neutral-300 flex items-center gap-2 text-sm sm:text-base">
                        <Lock size={16} className="text-neutral-500" />
                        Password
                      </Label>
                      <Input 
                        id="signupPassword" 
                        type="password" 
                        placeholder="••••••••" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 focus-visible:ring-brand-500 text-sm sm:text-base"
                        required
                      />
                    </div>
                  </CardContent>
                  <CardFooter className="flex flex-col px-4 sm:px-6 pb-4 sm:pb-6">
                    <Button 
                      type="submit" 
                      className="w-full bg-gradient-to-r from-brand-500 to-purple-600 hover:from-brand-600 hover:to-purple-700 text-white rounded-full text-sm sm:text-base"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating Account...
                        </>
                      ) : 'Create Account'}
                    </Button>
                    
                    {/* Google Sign Up Button */}
                    <div className="relative my-4 flex items-center justify-center">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-neutral-300 dark:border-neutral-700"></div>
                      </div>
                      <div className="relative bg-white dark:bg-neutral-800 px-4 text-sm text-neutral-500 dark:text-neutral-400">
                        or continue with
                      </div>
                    </div>
                    
                    <Button 
                      type="button"
                      variant="outline"
                      className="w-full border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                      onClick={handleGoogleSignIn}
                      disabled={isGoogleLoading}
                    >
                      {isGoogleLoading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                          <path
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            fill="#4285F4"
                          />
                          <path
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            fill="#34A853"
                          />
                          <path
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            fill="#FBBC05"
                          />
                          <path
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            fill="#EA4335"
                          />
                        </svg>
                      )}
                      Sign up with Google
                    </Button>
                    
                    <p className="mt-4 text-xs sm:text-sm text-center text-neutral-500">
                      Already have an account?{" "}
                      <button
                        type="button"
                        className="text-brand-600 hover:underline dark:text-brand-400"
                        onClick={() => navigate('/auth')}
                      >
                        Sign in
                      </button>
                    </p>
                  </CardFooter>
                </form>
                </div>
              )}
            </Tabs>
          )}
          
          {!isForgotPassword && (
            <div className="px-4 sm:px-6 pb-4 sm:pb-6 pt-1 text-center">
              {/* Social login section removed */}
            </div>
          )}
        </Card>
        <div className="mt-4 sm:mt-6 text-center px-2">
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
            By signing up, you agree to our{" "}
            <Link to="/terms-and-conditions" className="text-brand-600 hover:underline dark:text-brand-400">Terms of Service</Link>
            {" "}and{" "}
            <Link to="/privacy-policy" className="text-brand-600 hover:underline dark:text-brand-400">Privacy Policy</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
