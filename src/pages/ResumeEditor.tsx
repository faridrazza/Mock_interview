import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Loader2, Save, FileText, Sparkles, ChevronUp, ChevronDown } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { getResumeById, updateResume } from '@/lib/resume';
import { Resume, ResumeSection, ResumeContent } from '@/types/resume';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import ResumeSectionEditWithAI from '@/components/resume/ResumeSectionEditWithAI';
import ATSScoreIndicator from '@/components/resume/ATSScoreIndicator';

const ResumeEditor = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [resume, setResume] = useState<Resume | null>(null);
  const [resumeContent, setResumeContent] = useState<ResumeContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<ResumeSection>('contactInfo');
  const [error, setError] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isAnalyzingATS, setIsAnalyzingATS] = useState(false);
  const [isApplyingSuggestions, setIsApplyingSuggestions] = useState(false);
  
  // Define sections for the tabs
  const resumeSections: { id: ResumeSection; label: string }[] = [
    { id: 'contactInfo', label: 'Contact Info' },
    { id: 'summary', label: 'Summary' },
    { id: 'experience', label: 'Experience' },
    { id: 'education', label: 'Education' },
    { id: 'skills', label: 'Skills' },
    { id: 'certifications', label: 'Certifications' },
    { id: 'projects', label: 'Projects' },
  ];
  
  useEffect(() => {
    // Check if user is authenticated
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to edit your resume',
        variant: 'destructive',
      });
      navigate('/auth');
      return;
    }
    
    if (!id) {
      navigate('/dashboard?tab=resumes');
      return;
    }
    
    const fetchResume = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getResumeById(id);
        setResume(data);
        setResumeContent(data.content);
      } catch (error) {
        console.error('Error fetching resume:', error);
        setError('Failed to load resume. Please ensure you are signed in and have permission to access this resume.');
        toast({
          title: 'Error loading resume',
          description: 'There was an error loading your resume. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchResume();
  }, [id, navigate, toast, user]);
  
  // Handle section data change
  const handleSectionChange = (sectionType: ResumeSection, newData: any) => {
    if (!resumeContent) return;
    
    setResumeContent(prevContent => {
      if (!prevContent) return null;
      return {
        ...prevContent,
        [sectionType]: newData
      };
    });
    
    setHasUnsavedChanges(true);
  };
  
  // Handle save resume
  const handleSaveResume = async () => {
    if (!resume || !resumeContent) return;
    
    try {
      setSaving(true);
      
      const updatedResume = await updateResume(id!, {
        content: resumeContent,
        status: 'draft',
      });
      
      // Update the local state with the response
      setResume(updatedResume);
      
      toast({
        title: 'Resume saved',
        description: 'Your resume has been saved successfully.',
      });
      
      setHasUnsavedChanges(false);
    } catch (error: any) {
      console.error('Error saving resume:', error);
      toast({
        title: 'Error saving resume',
        description: 'There was an error saving your resume. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };
  
  // Analyze ATS compatibility
  const handleAnalyzeATS = async (forceReAnalysis: boolean = false) => {
    if (!resume || !resumeContent) return;
    
    try {
      setIsAnalyzingATS(true);
      
      // Check if we should skip analysis (unless forced)
      if (!forceReAnalysis && resumeContent.ats_analysis) {
        // If we have existing analysis and user didn't explicitly force re-analysis, 
        // show a confirmation before proceeding
        const hasRecentAnalysis = resumeContent.ats_analysis.analyzed_at && 
          new Date(resumeContent.ats_analysis.analyzed_at).getTime() > Date.now() - 60000; // Within last minute
        
        if (hasRecentAnalysis) {
          toast({
            title: 'Recent analysis found',
            description: 'This resume was analyzed recently. The score remains the same since no changes were made.',
          });
          setIsAnalyzingATS(false);
          return;
        }
      }
      
      // Use AWS Lambda function for ATS analysis
      const { lambdaApi } = await import('@/config/aws-lambda');
      
      const data = await lambdaApi.atsAnalysis({
        resumeContent,
        jobDescription: resume.job_description || '',
        resumeId: id, // Pass resume ID for caching
        forceReAnalysis, // Pass force flag
        templateId: resume.template_id, // Pass template for template-aware analysis
        isPublicUpload: false // This is not a public upload
      });
      
      if (!data || typeof data.score === 'undefined') {
        throw new Error('No analysis results returned');
      }
      
      // Store ATS analysis results in the content field instead of separate columns
      const updatedContent = {
        ...resumeContent,
        ats_analysis: {
          score: data.score,
          feedback: data.feedback,
          keyword_matches: data.keyword_matches || [],
          missing_keywords: data.missing_keywords || [],
          formatting_issues: data.formatting_issues || [],
          improvement_suggestions: data.improvement_suggestions || [],
          detailed_assessment: data.detailed_assessment || {},
          keyword_match_percentage: data.keyword_match_percentage || 0,
          content_hash: data.content_hash,
          analyzed_at: data.analyzed_at,
          from_cache: data.from_cache || false
        }
      };
      
      // Update only the content and ats_score fields
      const updatedResume = await updateResume(id!, {
        content: updatedContent,
        ats_score: data.score
      });
      
      // Update local state
      setResume(updatedResume);
      setResumeContent(updatedContent);
      
    } catch (error: any) {
      console.error('Error analyzing resume:', error);
      toast({
        title: 'Analysis failed',
        description: error.message || 'An error occurred during ATS analysis.',
        variant: 'destructive',
      });
    } finally {
      setIsAnalyzingATS(false);
    }
  };
  
  // Navigate to preview
  const handlePreview = () => {
    if (hasUnsavedChanges) {
      toast({
        title: 'Unsaved changes',
        description: 'Please save your changes before previewing.',
      });
      return;
    }
    navigate(`/dashboard/resume-preview/${id}`);
  };
  
  // Add a new function to handle applying ATS suggestions automatically
  const handleApplyATSSuggestions = async () => {
    if (!resume || !resumeContent || !resumeContent.ats_analysis) return;
    
    try {
      setIsApplyingSuggestions(true);
      
      // Get the current ATS analysis data
      const { improvement_suggestions, missing_keywords } = resumeContent.ats_analysis;
      
      if ((!improvement_suggestions || improvement_suggestions.length === 0) && 
          (!missing_keywords || missing_keywords.length === 0)) {
        toast({
          title: 'No suggestions to apply',
          description: 'There are no ATS suggestions or missing keywords to implement.',
        });
        setIsApplyingSuggestions(false);
        return;
      }
      
      // Use AWS Lambda enhance-resume function
      const { lambdaApi } = await import('@/config/aws-lambda');
      const data = await lambdaApi.enhanceResume({
        resumeContent: resumeContent,
        sectionType: 'all', // Special mode to enhance all sections
        jobDescription: resume.job_description || '',
        targetRole: resume.target_role || '',
        improvement_suggestions: improvement_suggestions || [],
        missing_keywords: missing_keywords || []
      });
      
      if (!data || !data.enhanced) {
        throw new Error('No enhanced content returned');
      }
      
      // Update the resume content with the AI-enhanced content
      const enhancedContent = data.enhanced;
      
      // Update the resume in the database
      const updatedResume = await updateResume(id!, {
        content: enhancedContent
      });
      
      // Update local state
      setResume(updatedResume);
      setResumeContent(enhancedContent);
      
      // Re-analyze to get the new ATS score
      handleAnalyzeATS();
      
      toast({
        title: 'ATS Suggestions Applied',
        description: 'Your resume has been improved based on ATS suggestions.',
      });
      
    } catch (error: any) {
      console.error('Error applying ATS suggestions:', error);
      toast({
        title: 'Failed to apply suggestions',
        description: error.message || 'An error occurred while applying ATS suggestions.',
        variant: 'destructive',
      });
    } finally {
      setIsApplyingSuggestions(false);
    }
  };
  
  // Add handleSectionReorder function after handleSectionChange
  const handleSectionReorder = (sectionType: ResumeSection, direction: 'up' | 'down') => {
    if (!resumeContent) return;
    
    // Get current section order or use default
    const currentOrder = resumeContent.sectionOrder || [
      'contactInfo',
      'summary',
      'experience',
      'education',
      'skills',
      'certifications',
      'projects',
      'customSections'
    ];
    
    // Find the current index of the section
    const currentIndex = currentOrder.indexOf(sectionType);
    if (currentIndex === -1) return; // Section not found in order
    
    // Calculate new index based on direction
    const newIndex = direction === 'up' ? 
      Math.max(0, currentIndex - 1) : 
      Math.min(currentOrder.length - 1, currentIndex + 1);
    
    // If the index didn't change (already at top/bottom), do nothing
    if (newIndex === currentIndex) return;
    
    // Create a new array with the reordered sections
    const newOrder = [...currentOrder];
    newOrder.splice(currentIndex, 1); // Remove from current position
    newOrder.splice(newIndex, 0, sectionType); // Insert at new position
    
    // Update the resume content with new section order
    setResumeContent(prevContent => {
      if (!prevContent) return null;
      return {
        ...prevContent,
        sectionOrder: newOrder
      };
    });
    
    setHasUnsavedChanges(true);
  };
  
  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }
  
  return (
    <DashboardLayout>
      <div className="container max-w-5xl mx-auto py-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold">{resume?.title || 'Resume Editor'}</h1>
            <p className="text-sm text-muted-foreground">
              {resume?.status === 'draft' ? 'Draft' : 'Completed'} • Last updated {resume ? new Date(resume?.updated_at || '').toLocaleDateString() : ''}
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={handlePreview}
              disabled={!resume || saving}
              className="gap-2"
            >
              <FileText className="h-4 w-4" />
              Preview
            </Button>
            <Button 
              onClick={handleSaveResume} 
              disabled={saving || !hasUnsavedChanges}
              className="gap-2"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save Changes
            </Button>
            <Button variant="outline" onClick={() => navigate('/dashboard?tab=resumes')}>
              Back to Resumes
            </Button>
          </div>
        </div>
        
        {error ? (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900 text-red-800 dark:text-red-300 p-4 rounded-md my-4">
            <p>{error}</p>
            <Button 
              variant="outline" 
              className="mt-2" 
              onClick={() => navigate('/dashboard?tab=resumes')}
            >
              Return to Resumes
            </Button>
          </div>
        ) : resumeContent ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm p-6 border border-neutral-200 dark:border-neutral-700">
                <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as ResumeSection)}>
                  <TabsList className="grid grid-cols-4 md:grid-cols-7 w-full mb-6">
                    {resumeSections.map((section) => (
                      <TabsTrigger key={section.id} value={section.id}>
                        {section.label}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  
                  {resumeSections.map((section) => (
                    <TabsContent key={section.id} value={section.id} className="mt-0">
                      <div className="mb-4">
                        <h2 className="text-xl font-semibold mb-1">{section.label}</h2>
                        <p className="text-sm text-muted-foreground mb-4">
                          {section.id === 'contactInfo' && 'Add your personal and contact information.'}
                          {section.id === 'summary' && 'Write a concise summary of your professional background.'}
                          {section.id === 'experience' && 'Add your work history starting with the most recent position.'}
                          {section.id === 'education' && 'List your educational background.'}
                          {section.id === 'skills' && 'Add your key skills and competencies.'}
                          {section.id === 'certifications' && 'List any professional certifications you have earned.'}
                          {section.id === 'projects' && 'Highlight relevant projects you have worked on.'}
                        </p>
                        <Separator className="mb-6" />
                      </div>
                      <ResumeSectionEditWithAI
                        sectionType={section.id} 
                        resumeData={resumeContent}
                        onChange={handleSectionChange}
                        jobDescription={resume?.job_description}
                        targetRole={resume?.target_role}
                      />
                    </TabsContent>
                  ))}
                </Tabs>
              </div>
            </div>
            
            <div>
              <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm p-6 border border-neutral-200 dark:border-neutral-700 space-y-6 sticky top-24">
                <div>
                  <h3 className="text-lg font-medium mb-4">Resume Overview</h3>
                  <ATSScoreIndicator 
                    score={resume?.ats_score} 
                    atsAnalysis={resumeContent?.ats_analysis} 
                    templateId={resume?.template_id}
                    previousScore={resumeContent?.ats_analysis?.from_cache ? undefined : resume?.ats_score}
                  />
                  
                    <div className="mt-2">
                      <Button 
                        size="sm" 
                        onClick={() => handleAnalyzeATS(true)} 
                        className="w-full flex items-center justify-center gap-2"
                        disabled={isAnalyzingATS}
                      >
                        {isAnalyzingATS ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Sparkles className="h-3.5 w-3.5" />
                        )}
                      {isAnalyzingATS ? "Analyzing..." : (resume?.ats_score !== undefined ? "Re-analyze ATS Compatibility" : "Analyze ATS Compatibility")}
                      </Button>
                      <p className="text-xs text-muted-foreground mt-1 text-center">
                      {resume?.ats_score !== undefined 
                        ? "Re-analyze your resume after making changes to improve your score" 
                        : "Get feedback on how well your resume will perform with ATS systems"}
                    </p>
                  </div>
                  
                  {resume?.ats_score !== undefined && resumeContent?.ats_analysis && (
                    <div className="mt-4 space-y-3">
                      <Separator />
                      
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">ATS Feedback</h4>
                        <div className="bg-muted p-3 rounded-md text-xs max-h-40 overflow-y-auto">
                          <p className="whitespace-pre-wrap">{resumeContent.ats_analysis.feedback}</p>
                        </div>
                      </div>
                      
                      {resumeContent.ats_analysis.keyword_matches && resumeContent.ats_analysis.keyword_matches.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium">Keyword Matches</h4>
                          <div className="flex flex-wrap gap-1">
                            {resumeContent.ats_analysis.keyword_matches.map((keyword, index) => (
                              <span key={index} className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-2 py-1 rounded-md text-xs">
                                {keyword}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {resumeContent.ats_analysis.missing_keywords && resumeContent.ats_analysis.missing_keywords.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium">Missing Keywords</h4>
                          <div className="flex flex-wrap gap-1">
                            {resumeContent.ats_analysis.missing_keywords.map((keyword, index) => (
                              <span key={index} className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 px-2 py-1 rounded-md text-xs">
                                {keyword}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {resumeContent.ats_analysis.improvement_suggestions && resumeContent.ats_analysis.improvement_suggestions.length > 0 && (
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <h4 className="text-sm font-medium">Suggestions</h4>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={handleApplyATSSuggestions}
                              disabled={isApplyingSuggestions}
                              className="h-6 text-xs gap-1"
                            >
                              {isApplyingSuggestions ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <Sparkles className="h-3 w-3" />
                              )}
                              {isApplyingSuggestions ? "Applying..." : "Apply with AI"}
                            </Button>
                          </div>
                          <ul className="list-disc list-inside text-xs space-y-1 bg-muted p-3 rounded-md">
                            {resumeContent.ats_analysis.improvement_suggestions.map((suggestion, index) => (
                              <li key={index}>{suggestion}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                <Separator />
                
                <div className="space-y-3">
                  <h4 className="text-sm font-medium">Section Order</h4>
                  <div className="space-y-2">
                    {resumeSections.filter(section => section.id !== 'contactInfo').map((section) => {
                      const isComplete = getSectionCompletionStatus(section.id, resumeContent);
                      
                      // Get current section order or use default
                      const currentOrder = resumeContent?.sectionOrder || [
                        'contactInfo',
                        'summary',
                        'experience',
                        'education',
                        'skills',
                        'certifications',
                        'projects',
                        'customSections'
                      ];
                      
                      // Find the current index of the section
                      const currentIndex = currentOrder.indexOf(section.id);
                      const isFirst = currentIndex <= 1; // 0 is contactInfo which we don't show, 1 is the first visible section
                      const isLast = currentIndex === currentOrder.length - 1;
                      
                      return (
                        <div key={section.id} className="flex items-center text-sm">
                          <div className="flex-1">
                            <span>{section.label}</span>
                          </div>
                          <div className="flex items-center gap-1 mr-2">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-6 w-6" 
                              onClick={() => handleSectionReorder(section.id, 'up')}
                              disabled={isFirst}
                            >
                              <ChevronUp className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-6 w-6" 
                              onClick={() => handleSectionReorder(section.id, 'down')}
                              disabled={isLast}
                            >
                              <ChevronDown className="h-4 w-4" />
                            </Button>
                          </div>
                          <span className={isComplete ? "text-green-600 dark:text-green-400" : "text-amber-500"}>
                            {isComplete ? "Complete" : "Incomplete"}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-3">
                  {resume?.job_description && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Job Description</h4>
                      <div className="text-xs bg-muted p-3 rounded-md max-h-60 overflow-y-auto">
                        <p className="whitespace-pre-wrap">{resume.job_description}</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex flex-col space-y-2">
                    <Button 
                      onClick={handleSaveResume} 
                      disabled={saving || !hasUnsavedChanges}
                      className="w-full gap-2"
                    >
                      {saving ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                      Save Changes
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={handlePreview}
                      disabled={!resume || saving}
                      className="w-full gap-2"
                    >
                      <FileText className="h-4 w-4" />
                      Preview Resume
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </DashboardLayout>
  );
};

// Helper function to check if a section is complete
const getSectionCompletionStatus = (sectionType: ResumeSection, content: ResumeContent | null): boolean => {
  if (!content) return false;
  
  switch (sectionType) {
    case 'contactInfo':
      return !!content.contactInfo.name && !!content.contactInfo.email;
    case 'summary':
      return !!content.summary && content.summary.length > 20;
    case 'experience':
      return content.experience.length > 0 && 
        content.experience.every(exp => 
          !!exp.company && !!exp.position && !!exp.startDate && !!exp.description
        );
    case 'education':
      return content.education.length > 0 && 
        content.education.every(edu => 
          !!edu.institution && !!edu.degree && !!edu.startDate
        );
    case 'skills':
      return content.skills.length > 0 && 
        content.skills.every(skill => !!skill && skill.trim() !== '');
    case 'certifications':
      if (!content.certifications || content.certifications.length === 0) return true; // Optional section
      return content.certifications.every(cert => 
        !!cert.name
      );
    case 'projects':
      if (!content.projects || content.projects.length === 0) return true; // Optional section
      return content.projects.every(project => 
        !!project.name && !!project.description
      );
    default:
      return false;
  }
};

export default ResumeEditor;
