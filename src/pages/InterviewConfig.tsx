import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import InterviewConfigCard from '@/components/interview/InterviewConfigCard';
import { InterviewConfiguration } from '@/types/interview';
import { canStartStandardInterview, getSubscriptionUsage, getEffectiveInterviewTier } from '@/utils/subscriptionUtils';
import { AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { SubscriptionUsage } from '@/types/subscription';

const InterviewConfig = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [interviewConfig, setInterviewConfig] = useState<InterviewConfiguration>({
    jobRole: '',
    experienceLevel: 'fresher',
    yearsOfExperience: 0
  });

  // UI state for experience selection
  const [uiExperienceLevel, setUiExperienceLevel] = useState<'fresher' | 'experienced'>('fresher');
  const [isCheckingLimits, setIsCheckingLimits] = useState(false);
  const [usageData, setUsageData] = useState<SubscriptionUsage | null>(null);
  const [hasReachedLimit, setHasReachedLimit] = useState(false);

  useEffect(() => {
    const checkSubscriptionLimits = async () => {
      if (!user || !profile) return;
      
      try {
        setIsCheckingLimits(true);
        
        // Get the effective interview tier for this user (will be 'free' for resume-only users)
        const effectiveTier = await getEffectiveInterviewTier(user.id, profile.subscription_tier);
        
        // Get usage data based on the effective tier
        const usage = await getSubscriptionUsage(user.id, effectiveTier);
        setUsageData(usage);
        
        // Check if user has reached their standard interview limit
        const canStart = await canStartStandardInterview(user.id, profile.subscription_tier);
        setHasReachedLimit(!canStart);
      } catch (error) {
        console.error('Error checking subscription limits:', error);
      } finally {
        setIsCheckingLimits(false);
      }
    };
    
    checkSubscriptionLimits();
  }, [user, profile]);

  const handleStartInterview = async () => {
    // Check if user has reached their interview limit
    if (hasReachedLimit) {
      toast({
        title: "Interview limit reached",
        description: "You've reached your monthly standard interview limit. Please upgrade your plan for more interviews.",
        variant: "destructive"
      });
      return;
    }

    // Validate inputs
    if (!interviewConfig.jobRole) {
      toast({
        title: "Job role required",
        description: "Please select or enter a job role to continue",
        variant: "destructive"
      });
      return;
    }

    if (uiExperienceLevel === 'experienced' && 
        (interviewConfig.yearsOfExperience === undefined || interviewConfig.yearsOfExperience < 0)) {
      toast({
        title: "Years of experience required",
        description: "Please enter valid years of experience to continue",
        variant: "destructive"
      });
      return;
    }

    // Save config to session storage for the interview page to access
    sessionStorage.setItem('interviewConfig', JSON.stringify(interviewConfig));
    
    // Navigate to interview session
    navigate('/interview/session');
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 flex flex-col">
      <header className="bg-white dark:bg-neutral-800 shadow-sm py-4">
        <div className="container mx-auto px-4 flex items-center">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/dashboard')}
            className="mr-4"
          >
            <ArrowLeft size={16} className="mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-500 to-purple-600">
            {/* Configure Your Interview */}
          </h1>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-12 max-w-3xl">
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
              You've used all your standard interviews for this month ({usageData?.standardInterviewsUsed} of {usageData?.standardInterviewsUsed + (usageData?.standardInterviewsRemaining || 0)}).
              <div className="mt-4">
                <Button 
                  onClick={() => navigate('/dashboard?tab=overview')}
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
                  <span className="font-medium">Standard interviews: </span>
                  <span className="text-brand-600 dark:text-brand-400">
                    {usageData.standardInterviewsRemaining === -1 
                      ? 'Unlimited' 
                      : `${usageData.standardInterviewsRemaining} remaining of ${usageData.standardInterviewsUsed + usageData.standardInterviewsRemaining}`}
                  </span>
                </p>
              </div>
            )}
            
            <InterviewConfigCard 
              interviewConfig={interviewConfig}
              setInterviewConfig={setInterviewConfig}
              uiExperienceLevel={uiExperienceLevel}
              setUiExperienceLevel={setUiExperienceLevel}
              handleStartInterview={handleStartInterview}
              disabled={hasReachedLimit}
            />
          </>
        )}
      </main>
    </div>
  );
};

export default InterviewConfig;
