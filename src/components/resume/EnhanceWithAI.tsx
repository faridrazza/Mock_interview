import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles, Check, X, RefreshCw } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { ResumeContent, ResumeSection, ExperienceEntry } from '@/types/resume';

interface EnhanceWithAIProps {
  sectionType: ResumeSection;
  sectionData: any;
  jobDescription?: string;
  targetRole?: string;
  onAccept: (enhancedData: any) => void;
  onCancel: () => void;
}

const EnhanceWithAI: React.FC<EnhanceWithAIProps> = ({
  sectionType,
  sectionData,
  jobDescription,
  targetRole,
  onAccept,
  onCancel
}) => {
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [enhancedData, setEnhancedData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Helper function to validate experience entries
  const validateExperienceEntries = (experiences: any): ExperienceEntry[] => {
    if (!Array.isArray(experiences)) {
      console.error('Experience data is not an array:', experiences);
      return [];
    }

    return experiences.map(exp => {
      // Ensure each experience entry has all required fields with correct types
      return {
        company: exp.company || '',
        position: exp.position || '',
        startDate: exp.startDate || '',
        endDate: exp.endDate || '',
        location: exp.location || '',
        description: exp.description || '',
        achievements: Array.isArray(exp.achievements) ? exp.achievements : [],
        ...(exp.current !== undefined ? { current: !!exp.current } : {})
      };
    });
  };

  // Helper function to validate skills array
  const validateSkills = (skills: any): string[] => {
    if (!Array.isArray(skills)) {
      console.error('Skills data is not an array:', skills);
      return [];
    }
    
    // Ensure each skill is a string
    return skills.map(skill => String(skill));
  };

  const enhanceWithAI = async (regenerate: boolean = false) => {
    try {
      if (regenerate) {
        setIsRegenerating(true);
      } else {
        setIsEnhancing(true);
      }
      setError(null);

      let formattedData;
      
      // Format the data based on the section type
      switch (sectionType) {
        case 'summary':
          formattedData = sectionData || '';
          break;
        case 'experience':
          formattedData = Array.isArray(sectionData) ? sectionData : [];
          break;
        case 'skills':
          formattedData = Array.isArray(sectionData) ? sectionData : [];
          break;
        case 'projects':
          console.log("Projects sectionData:", sectionData);
          formattedData = Array.isArray(sectionData) ? sectionData : [];
          console.log("Formatted projects data:", formattedData);
          break;
        default:
          throw new Error(`AI enhancement not supported for ${sectionType} section yet.`);
      }
      
      console.log(`Sending ${sectionType} data to enhance-resume:`, { 
        sectionType,
        dataLength: typeof formattedData === 'string' ? formattedData.length : formattedData.length,
        jobDescription: jobDescription ? "Provided" : "Not provided",
        targetRole: targetRole || "Not provided"
      });
      
      // Use AWS Lambda enhance-resume function
      const { lambdaApi } = await import('@/config/aws-lambda');
      const data = await lambdaApi.enhanceResume({
          resumeContent: formattedData,
          sectionType,
          jobDescription,
          targetRole
      });

      console.log(`Received enhanced ${sectionType} data:`, data);

      if (!data || !data.enhanced) {
        throw new Error('No enhanced content returned');
      }

      // Process and validate the enhanced data based on section type
      let validatedData;
      switch (sectionType) {
        case 'summary':
          validatedData = String(data.enhanced || '');
          break;
        case 'experience':
          validatedData = validateExperienceEntries(data.enhanced);
          break;
        case 'skills':
          validatedData = validateSkills(data.enhanced);
          break;
        case 'projects':
          // Make sure this is treated as a projects array
          console.log("Projects data from API:", data.enhanced);
          if (Array.isArray(data.enhanced)) {
            validatedData = data.enhanced.map(project => ({
              name: project.name || '',
              description: project.description || '',
              startDate: project.startDate || '',
              endDate: project.endDate || '',
              url: project.url || '',
              technologies: Array.isArray(project.technologies) ? project.technologies : [],
              achievements: Array.isArray(project.achievements) ? project.achievements : []
            }));
            console.log("Validated projects data:", validatedData);
          } else {
            console.error("API returned non-array data for projects:", data.enhanced);
            validatedData = [];
          }
          break;
        default:
          validatedData = data.enhanced;
      }

      setEnhancedData(validatedData);
      
      if (!regenerate) {
        toast({
          title: 'AI Enhancement Ready',
          description: 'Review the AI-enhanced content and apply it if you like it.',
        });
      } else {
        toast({
          title: 'New AI Suggestion Generated',
          description: 'A new variation has been created for your review.',
        });
      }
    } catch (error: any) {
      console.error('Error enhancing resume:', error);
      setError(error.message || 'An error occurred while enhancing your resume section');
      toast({
        title: 'Enhancement Failed',
        description: error.message || 'Failed to enhance your resume with AI',
        variant: 'destructive',
      });
    } finally {
      setIsEnhancing(false);
      setIsRegenerating(false);
    }
  };

  const renderContentComparison = () => {
    switch (sectionType) {
      case 'summary':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium mb-2">Original Summary</p>
              <div className="bg-muted rounded-md p-3 text-sm h-40 overflow-y-auto whitespace-pre-wrap">
                {sectionData || 'No summary provided'}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium mb-2">AI-Enhanced Summary</p>
              <div className="bg-primary/5 border border-primary/20 rounded-md p-3 text-sm h-40 overflow-y-auto whitespace-pre-wrap">
                {enhancedData || 'AI enhancement failed'}
              </div>
            </div>
          </div>
        );
      case 'skills':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium mb-2">Original Skills</p>
              <div className="bg-muted rounded-md p-3 text-sm h-40 overflow-y-auto">
                <ul className="space-y-1">
                  {Array.isArray(sectionData) && sectionData.length > 0 ? (
                    sectionData.map((skill, index) => (
                      <li key={index}>{skill}</li>
                    ))
                  ) : (
                    <li className="text-muted-foreground">No skills provided</li>
                  )}
                </ul>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium mb-2">AI-Enhanced Skills</p>
              <div className="bg-primary/5 border border-primary/20 rounded-md p-3 text-sm h-40 overflow-y-auto">
                <ul className="space-y-1">
                  {Array.isArray(enhancedData) && enhancedData.length > 0 ? (
                    enhancedData.map((skill, index) => (
                      <li key={index}>{skill}</li>
                    ))
                  ) : (
                    <li className="text-muted-foreground">AI enhancement failed</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        );
      case 'projects':
        // For projects, show a similar layout to experience
        return (
          <div className="space-y-4">
            <p className="text-sm font-medium">AI has enhanced your project descriptions:</p>
            <div className="bg-primary/5 border border-primary/20 rounded-md p-3 text-sm max-h-60 overflow-y-auto">
              <ul className="space-y-3">
                {Array.isArray(enhancedData) && enhancedData.length > 0 ? (
                  enhancedData.map((project, index) => (
                    <li key={index} className="border-b pb-2 last:border-0 last:pb-0">
                      <p className="font-medium">{project.name}</p>
                      {project.startDate && (
                        <p className="text-xs text-muted-foreground">{project.startDate} - {project.endDate || 'Present'}</p>
                      )}
                      <p className="mt-1">{project.description}</p>
                      {Array.isArray(project.technologies) && project.technologies.length > 0 && (
                        <p className="mt-1 text-xs">
                          <span className="font-medium">Technologies:</span> {project.technologies.join(', ')}
                        </p>
                      )}
                      {Array.isArray(project.achievements) && project.achievements.length > 0 && (
                        <ul className="mt-1 list-disc list-inside text-xs">
                          {project.achievements.map((achievement, i) => (
                            <li key={i}>{achievement}</li>
                          ))}
                        </ul>
                      )}
                    </li>
                  ))
                ) : (
                  <li className="text-muted-foreground">AI enhancement failed</li>
                )}
              </ul>
            </div>
          </div>
        );
      case 'experience':
        // For experience, we need to show a more complex comparison
        return (
          <div className="space-y-4">
            <p className="text-sm font-medium">AI has enhanced your experience descriptions:</p>
            <div className="bg-primary/5 border border-primary/20 rounded-md p-3 text-sm max-h-60 overflow-y-auto">
              <ul className="space-y-3">
                {Array.isArray(enhancedData) && enhancedData.length > 0 ? (
                  enhancedData.map((exp, index) => (
                    <li key={index} className="border-b pb-2 last:border-0 last:pb-0">
                      <p className="font-medium">{exp.position} at {exp.company}</p>
                      <p className="text-xs text-muted-foreground">{exp.startDate} - {exp.endDate || 'Present'}</p>
                      <p className="mt-1">{exp.description}</p>
                      {Array.isArray(exp.achievements) && exp.achievements.length > 0 && (
                        <ul className="mt-1 list-disc list-inside text-xs">
                          {exp.achievements.map((achievement, i) => (
                            <li key={i}>{achievement}</li>
                          ))}
                        </ul>
                      )}
                    </li>
                  ))
                ) : (
                  <li className="text-muted-foreground">AI enhancement failed</li>
                )}
              </ul>
            </div>
          </div>
        );
      default:
        return (
          <div className="bg-muted p-4 rounded-md text-center">
            AI enhancement not available for this section type.
          </div>
        );
    }
  };

  const promptExplanation = () => {
    switch (sectionType) {
      case 'summary':
        return `Our AI will enhance your professional summary to be concise, impactful, and ATS-friendly${jobDescription ? ', specifically tailored to match keywords in your target job description' : ''}.`;
      case 'experience':
        return `Our AI will improve your work experience descriptions to highlight relevant accomplishments and skills${jobDescription ? ', using keywords from your job description to increase ATS compatibility' : ''}.`;
      case 'projects':
        return `Our AI will enhance your project descriptions to emphasize technical details, skills utilized, and measurable outcomes${jobDescription ? ', using keywords from your job description to increase ATS compatibility' : ''}.`;
      case 'skills':
        return `Our AI will organize and enhance your skills list to be more relevant${jobDescription ? ' and aligned with key requirements in your target job' : ''}, improving ATS compatibility.`;
      default:
        return 'Our AI will enhance this section of your resume.';
    }
  };

  return (
    <Card className="mb-6">
      <CardContent className="pt-6 space-y-4">
        {error ? (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900 text-red-800 dark:text-red-300 p-4 rounded-md">
            <p>{error}</p>
          </div>
        ) : isEnhancing ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
            <p className="text-center max-w-md">
              Our AI is analyzing your {sectionType === 'summary' ? 'summary' : sectionType === 'skills' ? 'skills' : 'experience'} 
              {jobDescription ? ' and comparing it with the job description ' : ' '} 
              to create ATS-optimized content...
            </p>
          </div>
        ) : enhancedData ? (
          <>
            {renderContentComparison()}
            
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={onCancel} 
                  className="gap-1"
                >
                  <X className="h-4 w-4" />
                  <span>Discard</span>
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => enhanceWithAI(true)} 
                  disabled={isRegenerating}
                  className="gap-1"
                >
                  {isRegenerating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                  <span>Regenerate</span>
                </Button>
              </div>
              <Button 
                size="sm" 
                onClick={() => onAccept(enhancedData)}
                className="gap-1"
              >
                <Check className="h-4 w-4" />
                <span>Apply Changes</span>
              </Button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-4 py-6">
            <div className="bg-primary/10 p-3 rounded-full">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <div className="text-center space-y-2 max-w-md">
              <h3 className="text-lg font-medium">Enhance with AI</h3>
              <p className="text-sm text-muted-foreground">
                {promptExplanation()}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Using AI enhancements can significantly improve your resume's ATS compatibility score by adding relevant keywords and optimizing content.
              </p>
            </div>
            <Button 
              onClick={() => enhanceWithAI()}
              disabled={isEnhancing}
              className="gap-2"
            >
              {isEnhancing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              Enhance with AI
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EnhanceWithAI;
