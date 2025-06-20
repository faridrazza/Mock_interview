import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle, ArrowLeft, AlertTriangle } from 'lucide-react';
import CompanySelector from '@/components/advanced-interview/CompanySelector';
import JobRoleSelector from '@/components/interview/JobRoleSelector';
import { CompanyInterviewQuestion, InterviewSuggestion, AdvancedInterviewConfiguration } from '@/types/advancedInterview';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from '@/contexts/AuthContext';
import { canStartAdvancedInterview, getSubscriptionUsage } from '@/utils/subscriptionUtils';
import { SubscriptionUsage } from '@/types/subscription';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useBackendConfig, lambdaApi } from '@/config/aws-lambda';

const AdvancedInterviewConfig = () => {
  const [jobRole, setJobRole] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingLimits, setIsCheckingLimits] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hasReachedLimit, setHasReachedLimit] = useState(false);
  const [usageData, setUsageData] = useState<SubscriptionUsage | null>(null);
  const { toast: uiToast } = useToast();
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  useEffect(() => {
    const checkSubscriptionLimits = async () => {
      if (!user || !profile) return;
      
      try {
        setIsCheckingLimits(true);
        const usage = await getSubscriptionUsage(user.id, profile.subscription_tier);
        setUsageData(usage);
        
        // Check if user has reached their advanced interview limit
        const canStart = await canStartAdvancedInterview(user.id, profile.subscription_tier);
        setHasReachedLimit(!canStart);
      } catch (error) {
        console.error('Error checking subscription limits:', error);
      } finally {
        setIsCheckingLimits(false);
      }
    };
    
    checkSubscriptionLimits();
  }, [user, profile]);

  const handleGenerateQuestions = async () => {
    // Check if user has reached their interview limit
    if (hasReachedLimit) {
      uiToast({
        title: "Interview limit reached",
        description: "You've reached your monthly advanced interview limit. Please upgrade your plan for more interviews.",
        variant: "destructive"
      });
      return;
    }

    if (!jobRole || !companyName) {
      uiToast({
        title: 'Missing information',
        description: 'Please select both a job role and company',
        variant: 'destructive',
      });
      return;
    }

    // Clear any previous error
    setErrorMessage(null);
    setIsLoading(true);
    
    try {
      // 🚀 AWS Lambda Hackathon: Using Lambda function for company questions generation
      const { useLambda } = useBackendConfig();
      
      let data: any, error: any;
      
      if (useLambda) {
        console.log('🚀 Using AWS Lambda for company questions generation');
        try {
          data = await lambdaApi.generateCompanyQuestions({
            jobRole,
            companyName
          });
          error = null;
        } catch (lambdaError) {
          console.error('Lambda company questions error, falling back to Supabase:', lambdaError);
          error = lambdaError;
          data = null;
        }
      }
      
      // Fallback to Supabase if Lambda fails or not enabled
      if (!useLambda || error) {
        console.log('Using Supabase fallback for company questions generation');
        const result = await supabase.functions.invoke('generate-company-questions', {
        body: { jobRole, companyName },
      });
        data = result.data;
        error = result.error;
      }

      if (error) {
        console.error("Supabase function error:", error);
        setErrorMessage(`Error: ${error.message}`);
        
        toast.error('Failed to generate questions', {
          description: `Error: ${error.message}`,
          duration: 5000
        });
        
        return;
      }

      if (data.error) {
        console.error("Edge function returned error:", data.error);
        setErrorMessage(`Error: ${data.error}`);
        
        toast.error('Failed to generate questions', {
          description: data.error,
          duration: 5000
        });
        
        return;
      }

      console.log('Generated questions:', data);
      
      // Ensure questions is an array
      const questionsArray = Array.isArray(data.questions) ? data.questions : [];
      if (questionsArray.length === 0) {
        setErrorMessage("No questions were generated. Please try again.");
        
        toast.error('No questions generated', {
          description: 'The AI was unable to generate any questions. Please try again.',
          duration: 5000
        });
        
        return;
      }
      
      const questionsWithIds = questionsArray.map((q: CompanyInterviewQuestion) => ({
        ...q,
        id: uuidv4()
      }));
      
      // Ensure suggestions is an array
      const suggestionsArray = Array.isArray(data.suggestions) ? data.suggestions : [];
      
      // Create the interview configuration
      const advancedInterviewConfig: AdvancedInterviewConfiguration = {
        jobRole,
        companyName,
        questions: questionsWithIds,
        suggestions: suggestionsArray
      };

      if (user) {
        await saveGeneratedQuestions(questionsWithIds, suggestionsArray);
      }

      // Store in session storage as backup
      sessionStorage.setItem('advancedInterviewConfig', JSON.stringify(advancedInterviewConfig));
      
      toast.success('Questions generated successfully', {
        description: `Created ${questionsWithIds.length} interview questions for ${jobRole} at ${companyName}`,
        duration: 3000
      });
      
      // Navigate to the questions page with the config data
      navigate('/advanced-interview/questions', { 
        state: { interviewConfig: advancedInterviewConfig } 
      });
      
    } catch (error: any) {
      console.error('Error generating questions:', error);
      setErrorMessage(error.message || 'An unexpected error occurred');
      
      toast.error('Failed to generate questions', {
        description: error.message || 'An unexpected error occurred',
        duration: 5000
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveGeneratedQuestions = async (questions: CompanyInterviewQuestion[], suggestions: InterviewSuggestion[]) => {
    try {
      // Make sure user is authenticated
      if (!user) {
        console.error('No user ID available for saving questions');
        return;
      }

      const { error } = await supabase.functions.invoke('save-interview-session', {
        body: { 
          session: {
            jobRole,
            companyName,
            questions,
            suggestions,
            status: 'created'
          }, 
          userId: user.id 
        },
      });

      if (error) {
        console.error('Error saving questions to database:', error);
      }
    } catch (err) {
      console.error('Failed to save questions to database:', err);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 flex flex-col">
      <header className="bg-white dark:bg-neutral-800 shadow-sm py-4">
        <div className="container mx-auto px-4 flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/dashboard')}
            className="text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-500 to-purple-600">
            {/* Advanced AI Interview */}
          </h1>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-12 max-w-3xl">
        <p className="text-muted-foreground mb-8">
          Prepare for your next interview with company-specific questions and AI-powered mock interviews.
        </p>
        
        <div className="space-y-8">
          {isCheckingLimits ? (
            <div className="text-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-brand-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-neutral-600 dark:text-neutral-300">Checking subscription status...</p>
            </div>
          ) : hasReachedLimit ? (
            <Alert variant="destructive" className="mb-6">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Interview Limit Reached</AlertTitle>
              <AlertDescription>
                You've used all your advanced interviews for this month ({usageData?.advancedInterviewsUsed} of {usageData?.advancedInterviewsUsed + (usageData?.advancedInterviewsRemaining || 0)}).
                <div className="mt-4">
                  <Button 
                    onClick={() => navigate('/dashboard?tab=subscription')}
                    variant="outline"
                  >
                    Upgrade Your Plan
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          ) : (
            <>
              {usageData && !profile?.subscription_tier.includes('diamond') && !profile?.subscription_tier.includes('megastar') && (
                <div className="mb-6 p-4 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
                  <p className="text-sm">
                    <span className="font-medium">Advanced interviews: </span>
                    <span className="text-brand-600 dark:text-brand-400">
                      {usageData.advancedInterviewsRemaining === -1 
                        ? 'Unlimited' 
                        : `${usageData.advancedInterviewsRemaining} remaining of ${usageData.advancedInterviewsUsed + usageData.advancedInterviewsRemaining}`}
                    </span>
                  </p>
                </div>
              )}
              
              <Card>
                <CardHeader>
                  <CardTitle>Interview Setup</CardTitle>
                  <CardDescription>
                    Select the job role and company to generate relevant interview questions
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <JobRoleSelector 
                    jobRole={jobRole} 
                    onJobRoleChange={setJobRole} 
                  />
                  
                  <CompanySelector 
                    companyName={companyName} 
                    onCompanyNameChange={setCompanyName} 
                  />
                  
                  {errorMessage && (
                    <div className="bg-destructive/15 p-4 rounded-md flex items-start gap-3 text-destructive">
                      <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Failed to generate questions</p>
                        <p className="text-sm mt-1">{errorMessage}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
                
                <CardFooter>
                  <Button 
                    onClick={handleGenerateQuestions} 
                    className="w-full gap-2 bg-gradient-to-r from-brand-500 to-purple-600 hover:from-brand-600 hover:to-purple-700"
                    disabled={isLoading || !companyName || !jobRole || hasReachedLimit}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Generating Questions...
                      </>
                    ) : (
                      'Generate Interview Questions'
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdvancedInterviewConfig;
