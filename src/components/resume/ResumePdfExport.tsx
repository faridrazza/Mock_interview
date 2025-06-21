
import React, { useState, useEffect } from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { Loader2, Download, LockIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ResumeContent, ResumeTemplate } from '@/types/resume';
import { getPDFTemplateByName } from './pdf-templates';
import StandardResumePDF from './pdf-templates/StandardResumePDF';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { canDownloadResume } from '@/utils/subscriptionUtils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface ResumePdfExportProps {
  resumeContent: ResumeContent;
  title: string;
  template_id?: ResumeTemplate;
}

const ResumePdfExport: React.FC<ResumePdfExportProps> = ({ 
  resumeContent, 
  title, 
  template_id = 'standard' 
}) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [errorOccurred, setErrorOccurred] = useState(false);
  const [isCheckingSubscription, setIsCheckingSubscription] = useState(true);
  const [showSubscriptionDialog, setShowSubscriptionDialog] = useState(false);
  const [canDownloadPDF, setCanDownloadPDF] = useState(false);
  const [activeSubscriptionType, setActiveSubscriptionType] = useState<'interview' | 'resume' | null>(null);
  
  // Get the appropriate PDF template component
  const PDFTemplate = getPDFTemplateByName(template_id);
  
  // Create a filename using the title
  const filename = `${title.replace(/\s+/g, '_') || 'Resume'}.pdf`;

  // Check subscription status on component mount
  useEffect(() => {
    const checkSubscription = async () => {
      if (!user) {
        setIsCheckingSubscription(false);
        return;
      }

      try {
        // Check subscription tiers - main tier (interview plans) and resume-specific tier
        const tier = profile?.subscription_tier || 'free';
        const resumeTier = profile?.resume_subscription_tier || 'free';
        
        // First check if the interview plan allows downloads (Gold, Diamond, Megastar)
        const canDownloadWithInterviewPlan = await canDownloadResume(user.id, tier);
        if (canDownloadWithInterviewPlan) {
          setCanDownloadPDF(true);
          setActiveSubscriptionType('interview');
          setIsCheckingSubscription(false);
          return;
        }
        
        // If interview plan doesn't allow downloads, check resume-specific plan
        const canDownloadWithResumePlan = await canDownloadResume(user.id, resumeTier);
        if (canDownloadWithResumePlan) {
          setCanDownloadPDF(true);
          setActiveSubscriptionType('resume');
          setIsCheckingSubscription(false);
          return;
        }
        
        // No plans allow downloads
        setCanDownloadPDF(false);
      } catch (error) {
        console.error('Error checking subscription:', error);
        // Default to false on error to be safe
        setCanDownloadPDF(false);
      } finally {
        setIsCheckingSubscription(false);
      }
    };

    checkSubscription();
  }, [user, profile]);

  // Handle export errors with fallback to standard template
  const handleError = (error: Error) => {
    console.error('PDF Generation Error:', error);
    setErrorOccurred(true);
    toast({
      title: 'Error generating PDF',
      description: 'There was an issue with this template. Try using a different template.',
      variant: 'destructive',
    });
  };
  
  const handleAuthError = () => {
    toast({
      title: 'Authentication required',
      description: 'Please sign in to download your resume',
      variant: 'destructive',
    });
    navigate('/auth');
  };
  
  // Handle download button click when subscription is required
  const handleSubscriptionRequired = () => {
    setShowSubscriptionDialog(true);
  };
  
  // Navigate to subscription settings
  const handleNavigateToPlans = () => {
    setShowSubscriptionDialog(false);
    // Update to direct users to either interview or resume plans tab
    // based on whether they might already have an interview plan
    const hasInterviewPlan = ['gold', 'diamond', 'megastar'].includes(profile?.subscription_tier || '');
          navigate('/dashboard?tab=overview', {
      state: { showResumePlans: !hasInterviewPlan }
    });
  };
  
  // Prepare safe resumeContent with all required properties
  const safeResumeContent = {
    ...resumeContent,
    experience: resumeContent.experience || [],
    education: resumeContent.education || [],
    skills: resumeContent.skills || [],
    certifications: resumeContent.certifications || [],
    projects: resumeContent.projects || [],
    customSections: resumeContent.customSections || [],
    sectionOrder: resumeContent.sectionOrder || [
      'contactInfo',
      'summary',
      'experience',
      'education',
      'skills',
      'certifications',
      'projects',
      'customSections'
    ]
  };
  
  // If an error occurred with this template, show error message with fallback option
  if (errorOccurred) {
    // Only show download if user has permission, otherwise show upgrade button
    return (
      <div className="w-full">
        {isCheckingSubscription ? (
          <Button disabled className="w-full gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Checking subscription...
          </Button>
        ) : !user ? (
          <Button onClick={handleAuthError} className="w-full gap-2">
            <Download className="h-4 w-4" />
            Sign in to download
          </Button>
        ) : canDownloadPDF ? (
          <PDFDownloadLink
            document={
              <StandardResumePDF
                content={safeResumeContent}
                accentColor={resumeContent.design?.accentColor || '#333333'}
                fontSize={resumeContent.design?.fontSize || 'small'}
                spacing={resumeContent.design?.spacing || 'normal'}
              />
            }
            fileName={filename}
          >
            {({ loading, error }) => (
              <Button 
                disabled={loading}
                className="w-full gap-2"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    Try with Standard Template
                  </>
                )}
              </Button>
            )}
          </PDFDownloadLink>
        ) : (
          <Button onClick={handleSubscriptionRequired} className="w-full gap-2">
            <LockIcon className="h-4 w-4" />
            Upgrade to Download
          </Button>
        )}
        
        {/* Subscription Required Dialog */}
        <Dialog open={showSubscriptionDialog} onOpenChange={setShowSubscriptionDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Subscription Required</DialogTitle>
              <DialogDescription>
                You need a resume subscription to download your resume. Your work is saved and will be available once you subscribe.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
                <LockIcon className="h-5 w-5 text-amber-500" />
                <p className="text-sm">
                  Resume downloads are available with our resume subscription plans starting at just $2/month.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowSubscriptionDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleNavigateToPlans}>
                View Resume Plans
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }
  
  return (
    <div className="w-full">
      {isCheckingSubscription ? (
        <Button disabled className="w-full gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          Checking subscription...
        </Button>
      ) : !user ? (
        <Button onClick={handleAuthError} className="w-full gap-2">
          <Download className="h-4 w-4" />
          Sign in to download
        </Button>
      ) : canDownloadPDF ? (
        <PDFDownloadLink
          document={
            <PDFTemplate
              content={safeResumeContent}
              accentColor={resumeContent.design?.accentColor || '#333333'}
              fontSize={resumeContent.design?.fontSize || 'small'}
              spacing={resumeContent.design?.spacing || 'normal'}
            />
          }
          fileName={filename}
        >
          {({ loading, error, blob, url }) => {
            // Handle any errors during PDF generation
            if (error && !errorOccurred) {
              handleError(error);
            }
            
            return (
              <Button 
                disabled={loading}
                className="w-full gap-2"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    Export to PDF
                  </>
                )}
              </Button>
            );
          }}
        </PDFDownloadLink>
      ) : (
        <Button onClick={handleSubscriptionRequired} className="w-full gap-2">
          <LockIcon className="h-4 w-4" />
          Upgrade to Download
        </Button>
      )}
      
      {/* Subscription Required Dialog */}
      <Dialog open={showSubscriptionDialog} onOpenChange={setShowSubscriptionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Subscription Required</DialogTitle>
            <DialogDescription>
              You need a subscription with resume features to download your resume. Your work is saved and will be available once you subscribe.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
              <LockIcon className="h-5 w-5 text-amber-500" />
              <p className="text-sm">
                Resume downloads are available with our Gold, Diamond, and dedicated resume subscription plans.
              </p>
            </div>
            
            {/* Add explanation about plan options */}
            <div className="mt-3 text-sm">
              <p><strong>Available options:</strong></p>
              <ul className="list-disc pl-5 mt-2 space-y-1 text-muted-foreground">
                <li>Gold plan ($9.00/mo): Includes 15 resume downloads + interview features</li>
                <li>Diamond plan ($18.00/mo): Includes 50 resume downloads + interview features</li>
                <li>Resume Basic plan ($2.00/mo): Includes 15 resume downloads only</li>
                <li>Resume Premium plan ($6.00/mo): Includes 50 resume downloads only</li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSubscriptionDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleNavigateToPlans}>
              View Plans
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ResumePdfExport;

