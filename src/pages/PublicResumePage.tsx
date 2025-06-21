import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  ArrowRight, 
  Sparkles, 
  Loader2, 
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Target,
  Zap,
  Briefcase,
  Building,
  TrendingUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import ATSScoreIndicator from '@/components/resume/ATSScoreIndicator';
import { ResumeContent, ATSAnalysis } from '@/types/resume';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import PublicResumeUploader from '@/components/resume/PublicResumeUploader';
import ResumeTemplatePreview from '@/components/resume/ResumeTemplatePreview';
import Navbar from '@/components/layout/Navbar';

// New anonymous ATS analysis function (migrated to AWS Lambda)
const analyzeResumeATS = async (resumeContent: ResumeContent, jobDescription?: string): Promise<ATSAnalysis> => {
  try {
    // Use AWS Lambda function for ATS analysis
    const { lambdaApi } = await import('@/config/aws-lambda');
    
    const data = await lambdaApi.atsAnalysis({
      resumeContent,
      jobDescription: jobDescription || '',
      // No resumeId for anonymous analysis
      forceReAnalysis: true, // Always analyze for public uploads
      templateId: 'raw', // Mark as raw/original content
      isPublicUpload: true // This is a public upload - baseline score
  });
  
  if (!data || typeof data.score === 'undefined') {
    throw new Error('No analysis results returned');
  }
  
  return {
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
  };
  } catch (error: any) {
    console.error('AWS Lambda ATS analysis error:', error);
    throw new Error(error.message || 'Failed to analyze resume');
  }
};

// Template options for the comparison view
const templateOptions = [
  { id: 'standard', name: 'Standard' },
  { id: 'professional', name: 'Professional' },
  { id: 'executive', name: 'Executive' },
  { id: 'modernphoto', name: 'Modern Photo' },
  { id: 'minimal', name: 'Minimal' }
];

// Component for detailed assessment item
const DetailedAssessmentItem: React.FC<{
  title: string;
  score: number;
  maxScore: number;
  description?: string;
  improvementTips?: string[];
  isExpanded?: boolean;
  onToggle?: () => void;
}> = ({ title, score, maxScore, description, improvementTips, isExpanded, onToggle }) => {
  const percentage = (score / maxScore) * 100;
  const getScoreColor = () => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 60) return 'bg-blue-500';
    if (percentage >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getScoreBadgeColor = () => {
    if (percentage >= 80) return 'bg-green-100 text-green-800 border-green-200';
    if (percentage >= 60) return 'bg-blue-100 text-blue-800 border-blue-200';
    if (percentage >= 40) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  return (
    <div className="border border-neutral-200 dark:border-neutral-700 rounded-lg">
      <div 
        className="p-4 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800/50 flex items-center justify-between"
        onClick={onToggle}
      >
        <div className="flex items-center gap-3 flex-1">
          <h3 className="font-medium text-sm">{title}</h3>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className={`text-xs px-2 py-1 ${getScoreBadgeColor()}`}>
            {score}/{maxScore}
          </Badge>
          {onToggle && (isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />)}
        </div>
      </div>
      
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-neutral-100 dark:border-neutral-800 pt-4">
          {description && (
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
              {description}
            </p>
          )}
          
          {improvementTips && improvementTips.length > 0 && (
            <div>
              <p className="text-sm font-medium text-purple-700 dark:text-purple-400 mb-2">
                Improvement Tips:
              </p>
              <ul className="space-y-1">
                {improvementTips.map((tip, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                    <Target className="h-3 w-3 text-red-500 mt-0.5 flex-shrink-0" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Component for formatting issue card
const FormattingIssueCard: React.FC<{
  title: string;
  description: string;
  impact: string;
}> = ({ title, description, impact }) => (
  <div className="border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 bg-yellow-50 dark:bg-yellow-900/20">
    <h4 className="font-medium text-yellow-800 dark:text-yellow-300 mb-2">{title}</h4>
    <p className="text-sm text-neutral-700 dark:text-neutral-300 mb-2">{description}</p>
    <div className="flex items-start gap-2">
      <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
      <p className="text-xs text-yellow-700 dark:text-yellow-400">
        <span className="font-medium">Impact:</span> {impact}
      </p>
    </div>
  </div>
);

const PublicResumePage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [stage, setStage] = useState<'upload' | 'analysis' | 'comparison'>('upload');
  const [resumeContent, setResumeContent] = useState<ResumeContent | null>(null);
  const [originalText, setOriginalText] = useState<string>('');
  const [jobDescription, setJobDescription] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [atsAnalysis, setATSAnalysis] = useState<ATSAnalysis | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState(templateOptions[0].id);
  const [isSaving, setIsSaving] = useState(false);
  const [expandedAssessments, setExpandedAssessments] = useState<{ [key: string]: boolean }>({
    hardSkills: true, // Start with first one expanded
  });

  // Handle when resume is uploaded and parsed
  const handleResumeUploaded = (content: ResumeContent, originalTextContent: string, jobDesc?: string) => {
    setResumeContent(content);
    setOriginalText(originalTextContent);
    if (jobDesc) setJobDescription(jobDesc);
    
    // Move to analysis stage
    setStage('analysis');
    
    // Automatically start ATS analysis
    handleAnalyzeATS(content, jobDesc);
  };

  // Handle ATS analysis
  const handleAnalyzeATS = async (content: ResumeContent = resumeContent!, jobDesc: string = jobDescription) => {
    if (!content) return;
    
    try {
      setIsAnalyzing(true);
      const analysis = await analyzeResumeATS(content, jobDesc);
      
      // Update the resume content with the analysis results
      const updatedContent = {
        ...content,
        ats_analysis: analysis
      };
      
      setResumeContent(updatedContent);
      setATSAnalysis(analysis);
      
      // Show success toast
      toast({
        title: 'ATS Analysis Complete',
        description: `Your resume has an ATS compatibility score of ${analysis.score}%. See how our ATS-optimized templates can improve it!`,
      });
      
      // Move to comparison stage
      setStage('comparison');
    } catch (error: any) {
      console.error('Error analyzing resume:', error);
      toast({
        title: 'Analysis failed',
        description: error.message || 'An error occurred during ATS analysis.',
        variant: 'destructive',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Handle saving resume to account
  const handleSaveToAccount = async () => {
    if (!resumeContent) return;
    
    try {
      setIsSaving(true);
      
      if (!user) {
        // Save to localStorage before redirecting to auth (instead of sessionStorage)
        // Make sure we explicitly include the ATS score from the analysis
        localStorage.setItem('pendingResume', JSON.stringify({
          content: resumeContent,
          originalText,
          jobDescription,
          selectedTemplate,
          atsScore: atsAnalysis?.score // Explicitly save the ATS score
        }));
        
        // Redirect to auth page
        navigate('/auth?redirect=resume');
        return;
      }
      
      // If user is already logged in, directly create the resume using AWS Lambda
      const { data: userData } = await supabase.auth.getUser();
      const token = userData?.user?.id ? 
                 (await supabase.auth.getSession()).data.session?.access_token : '';
      
      // Use AWS Lambda function for creating resume
      const { lambdaApi } = await import('@/config/aws-lambda');
      
      const data = await lambdaApi.createResume({
          title: resumeContent.contactInfo.name ? `${resumeContent.contactInfo.name}'s Resume` : 'My Resume',
          content: resumeContent,
          originalText,
          jobDescription,
          selectedTemplate,
          atsScore: atsAnalysis?.score // Explicitly pass the ATS score
      }, token || undefined);
      
      if (!data) {
        throw new Error('Failed to save resume');
      }
      
      // Redirect to the resume editor page with the new resume ID
      navigate(`/dashboard/resume/${data.id}`);
      
      toast({
        title: 'Resume saved',
        description: 'Your resume has been saved to your account.',
      });
      
    } catch (error: any) {
      console.error('Error saving resume:', error);
      toast({
        title: 'Error saving resume',
        description: error.message || 'An error occurred while saving your resume.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Toggle expanded state for assessment items
  const toggleAssessment = (key: string) => {
    setExpandedAssessments(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Get detailed assessment data from the analysis
  const getDetailedAssessments = () => {
    if (!atsAnalysis) return [];
    
    const detailed = atsAnalysis.detailed_assessment;
    const score = atsAnalysis.score;
    
    // Use detailed assessment scores if available, otherwise fallback to calculated scores
    const hardSkillsScore = detailed?.hard_skills_score ?? Math.floor(score * 0.4);
    const jobTitleScore = detailed?.job_title_score ?? Math.floor(score * 0.15);
    const softSkillsScore = detailed?.soft_skills_score ?? Math.floor(score * 0.15);
    const achievementsScore = detailed?.achievements_score ?? Math.floor(score * 0.1);
    const educationScore = detailed?.education_score ?? Math.floor(score * 0.1);
    const formattingScore = detailed?.formatting_score ?? Math.floor(score * 0.05);
    const relevanceScore = detailed?.relevance_score ?? Math.floor(score * 0.05);
    
    return [
      {
        key: 'hardSkills',
        title: 'Hard Skills Match',
        score: hardSkillsScore,
        maxScore: 40,
        description: detailed?.hard_skills_feedback || 'Analysis of technical skills and their alignment with job requirements.',
        improvementTips: detailed?.hard_skills_tips || atsAnalysis.improvement_suggestions?.slice(0, 2) || []
      },
      {
        key: 'jobTitle',
        title: 'Job Title Match',
        score: jobTitleScore,
        maxScore: 15,
        description: detailed?.job_title_feedback || 'Evaluates how well your current position title and career progression align with the target job role and industry standards.',
        improvementTips: detailed?.job_title_tips || [
          'Consider using industry-standard job titles that match the target role',
          'Highlight relevant job titles from your experience that align with the position',
          'Include title progressions that show career growth'
        ]
      },
      {
        key: 'softSkills',
        title: 'Soft Skills Match',
        score: softSkillsScore,
        maxScore: 15,
        description: detailed?.soft_skills_feedback || 'Assesses the presence and demonstration of interpersonal skills, leadership abilities, communication, and teamwork capabilities.',
        improvementTips: detailed?.soft_skills_tips || [
          'Add specific examples of leadership, teamwork, or communication skills',
          'Include soft skills that are mentioned in the job description',
          'Quantify soft skill achievements where possible (e.g., "led team of 5")'
        ]
      },
      {
        key: 'achievements',
        title: 'Quantified Achievements',
        score: achievementsScore,
        maxScore: 10,
        description: detailed?.achievements_feedback || 'Reviews the presence of measurable results, metrics, percentages, and specific accomplishments that demonstrate impact.',
        improvementTips: detailed?.achievements_tips || [
          'Add specific numbers, percentages, or metrics to achievements',
          'Include time-bound results (e.g., "within 6 months")',
          'Quantify impact using dollars, percentages, or other relevant metrics'
        ]
      },
      {
        key: 'education',
        title: 'Education & Certifications',
        score: educationScore,
        maxScore: 10,
        description: detailed?.education_feedback || 'Evaluates educational background, relevant degrees, professional certifications, and ongoing learning initiatives.',
        improvementTips: detailed?.education_tips || [
          'Include relevant certifications mentioned in the job description',
          'Add completion dates for recent certifications',
          'Highlight education that directly relates to the target role'
        ]
      },
      {
        key: 'formatting',
        title: 'ATS Formatting',
        score: formattingScore,
        maxScore: 5,
        description: detailed?.formatting_feedback || 'Assesses technical formatting compatibility with ATS systems, including section structure, readability, and parsing efficiency.',
        improvementTips: detailed?.formatting_tips || atsAnalysis.formatting_issues?.map(issue => `Address ${issue.toLowerCase()}`) || [
          'Use standard section headings (Experience, Education, Skills)',
          'Ensure consistent formatting throughout the document',
          'Avoid complex tables, graphics, or unusual fonts'
        ]
      },
      {
        key: 'relevance',
        title: 'Overall Relevance',
        score: relevanceScore,
        maxScore: 5,
        description: detailed?.relevance_feedback || 'Measures general alignment with job requirements, industry standards, and appropriateness for the career level and target role.',
        improvementTips: detailed?.relevance_tips || [
          'Tailor content to better match the specific job requirements',
          'Emphasize experience most relevant to the target position',
          'Remove or de-emphasize less relevant experiences'
        ]
      }
    ];
  };

  // Render the appropriate stage
  const renderStage = () => {
    switch (stage) {
      case 'upload':
        return (
          <div className="max-w-3xl mx-auto">
            <PublicResumeUploader 
              onSuccess={handleResumeUploaded}
              onError={(error) => {
                toast({
                  title: 'Upload Error',
                  description: error,
                  variant: 'destructive',
                });
              }}
            />
          </div>
        );
        
      case 'analysis':
        return (
          <div className="max-w-3xl mx-auto text-center">
            <Card>
              <CardHeader>
                <CardTitle>Analyzing Your Resume</CardTitle>
                <CardDescription>
                  We're checking your resume for ATS compatibility and optimization opportunities
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-16 w-16 animate-spin text-primary mb-6" />
                <p className="text-lg">Processing your resume...</p>
                <p className="text-sm text-muted-foreground mt-2">
                  This should take just a few seconds
                </p>
              </CardContent>
            </Card>
          </div>
        );
        
      case 'comparison':
        const keywordMatchPercentage = atsAnalysis?.keyword_match_percentage ?? (atsAnalysis?.keyword_matches?.length ? Math.min(100, atsAnalysis.keyword_matches.length * 10) : 0);
        const detailedAssessments = getDetailedAssessments();
        
        return (
          <div className="max-w-7xl mx-auto space-y-6">
            {/* ATS Scan Results Section */}
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="h-5 w-5 text-orange-500" />
                  <CardTitle className="text-xl text-slate-700 dark:text-slate-200">ATS Scan Results</CardTitle>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4" />
                    <span>software engineer</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    <span>N/A</span>
                  </div>
                  <div className="ml-auto">
                    <Badge variant="destructive" className="bg-red-500 text-white">
                      {atsAnalysis?.score || 0}% Match Score
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Keyword Match Progress */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Keyword Match</span>
                    <span className="text-sm text-muted-foreground">{keywordMatchPercentage}%</span>
                  </div>
                  <Progress value={keywordMatchPercentage} className="h-2" />
                </div>
                
                {/* Keywords Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Matched Keywords */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-medium text-green-700 dark:text-green-400">Matched Keywords</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {atsAnalysis?.keyword_matches?.map((keyword, index) => (
                        <Badge key={index} variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          {keyword}
                        </Badge>
                      )) || []}
                    </div>
                  </div>
                  
                  {/* Missing Keywords */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <XCircle className="h-4 w-4 text-red-500" />
                      <span className="text-sm font-medium text-red-700 dark:text-red-400">Missing Keywords</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {atsAnalysis?.missing_keywords?.map((keyword, index) => (
                        <Badge key={index} variant="outline" className="bg-red-50 text-red-700 border-red-200">
                          {keyword}
                        </Badge>
                      )) || []}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Detailed Assessment Section */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-500" />
                  <CardTitle className="text-xl text-slate-700 dark:text-slate-200">Detailed Assessment</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {detailedAssessments.map((assessment) => (
                    <DetailedAssessmentItem
                      key={assessment.key}
                      title={assessment.title}
                      score={assessment.score}
                      maxScore={assessment.maxScore}
                      description={assessment.description}
                      improvementTips={assessment.improvementTips}
                      isExpanded={expandedAssessments[assessment.key]}
                      onToggle={() => toggleAssessment(assessment.key)}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Formatting Issues Section */}
            {atsAnalysis?.formatting_issues && atsAnalysis.formatting_issues.length > 0 && (
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-500" />
                    <CardTitle className="text-xl text-slate-700 dark:text-slate-200">Formatting Issues Detected</CardTitle>
                  </div>
                  <CardDescription>
                    These issues may prevent your resume from being properly parsed by ATS systems.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {atsAnalysis.formatting_issues.map((issue, index) => (
                      <FormattingIssueCard
                        key={index}
                        title={issue}
                        description={`Resume contains ${issue.toLowerCase()}`}
                        impact="Complex design elements can interfere with ATS text parsing and create extraction errors"
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Key Recommendations Section */}
            {atsAnalysis?.improvement_suggestions && atsAnalysis.improvement_suggestions.length > 0 && (
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-red-500" />
                    <CardTitle className="text-xl text-slate-700 dark:text-slate-200">Key Recommendations</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {atsAnalysis.improvement_suggestions.map((suggestion, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-full flex items-center justify-center font-semibold text-sm">
                          {index + 1}
                        </div>
                        <p className="text-sm text-slate-700 dark:text-slate-300 pt-1">{suggestion}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Original Resume Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Your Current Resume</CardTitle>
              </CardHeader>
              <CardContent>
                {atsAnalysis && (
                  <div className="mb-4 sm:mb-6">
                    <ATSScoreIndicator score={atsAnalysis.score} atsAnalysis={atsAnalysis} />
                  </div>
                )}
                
                <div className="mt-4 sm:mt-6">
                  <pre className="text-[10px] sm:text-xs bg-muted p-2 sm:p-4 rounded overflow-auto max-h-[300px] sm:max-h-[500px]">
                    {originalText}
                  </pre>
                </div>
              </CardContent>
            </Card>

            {/* ATS-Optimized Resume Section */}
            <Card>
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-lg sm:text-xl">ATS-Optimized Resume</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  See how your resume would look in our ATS-friendly templates
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
                <div className="mb-4">
                  <Tabs defaultValue={selectedTemplate} onValueChange={setSelectedTemplate}>
                    <TabsList className="grid grid-cols-5">
                      {templateOptions.map(template => (
                        <TabsTrigger key={template.id} value={template.id} className="text-[10px] sm:text-xs px-1 sm:px-2">
                          {template.name}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </Tabs>
                </div>
                
                <div className="bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-auto mx-4 sm:mx-8 p-4 max-h-[800px]">
                  {resumeContent && (
                    <div className="transform scale-[0.75] sm:scale-[0.85] origin-top-left w-[133%] sm:w-[118%] h-fit">
                      <ResumeTemplatePreview
                        template={selectedTemplate as any}
                        content={resumeContent}
                      />
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex flex-col sm:flex-row justify-between gap-3 p-4 sm:p-6">
                <Button variant="outline" onClick={() => setStage('upload')} className="w-full sm:w-auto order-2 sm:order-1">
                  Upload Different Resume
                </Button>
                <Button 
                  onClick={handleSaveToAccount} 
                  className="gap-2 w-full sm:w-auto order-1 sm:order-2"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                  {isSaving 
                    ? "Saving..." 
                    : (user ? 'Continue to Editor' : 'Create Account to Edit')
                  }
                </Button>
              </CardFooter>
            </Card>
            
            <div className="bg-muted rounded-lg p-3 sm:p-4">
              <h3 className="text-xs sm:text-sm font-medium mb-2">Why our templates perform better:</h3>
              <ul className="space-y-2 text-xs sm:text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Clean, professional formatting that ATS systems can easily parse</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Proper section hierarchy and information organization</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Compatible with all major ATS systems</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>No fancy design that can confuse ATS systems</span>
                </li>
              </ul>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <>
      <Navbar />
      <div className="container px-4 py-12 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            Resume ATS Checker
          </h1>
          <p className="text-lg text-muted-foreground mb-6">
            Upload your resume, get an instant ATS compatibility score, and see how to improve it
          </p>
          
          {/* Progress Steps */}
          <div className="bg-white dark:bg-neutral-800 rounded-lg p-6 mb-8 border border-neutral-200 dark:border-neutral-700">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-0">
              <div className="flex items-center">
                <div className={`rounded-full w-8 h-8 flex items-center justify-center ${
                  stage !== 'upload' ? 'bg-primary text-white' : 'bg-primary text-white'
                }`}>
                  {stage !== 'upload' ? <CheckCircle className="h-5 w-5" /> : '1'}
                </div>
                <span className="text-sm mx-2 font-medium">Upload Resume</span>
              </div>
              <div className="hidden sm:block h-px bg-neutral-300 dark:bg-neutral-600 flex-1 mx-4"></div>
              <div className="flex items-center">
                <div className={`rounded-full w-8 h-8 flex items-center justify-center ${
                  stage === 'comparison' ? 'bg-primary text-white' : (stage === 'analysis' ? 'bg-primary text-white' : 'bg-muted text-muted-foreground')
                }`}>
                  {stage === 'comparison' ? <CheckCircle className="h-5 w-5" /> : (stage === 'analysis' ? '2' : '2')}
                </div>
                <span className="text-sm mx-2 font-medium">Add Job Description</span>
              </div>
              <div className="hidden sm:block h-px bg-neutral-300 dark:bg-neutral-600 flex-1 mx-4"></div>
              <div className="flex items-center">
                <div className={`rounded-full w-8 h-8 flex items-center justify-center ${
                  stage === 'comparison' ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
                }`}>
                  {stage === 'comparison' ? <CheckCircle className="h-5 w-5" /> : '3'}
                </div>
                <span className="text-sm mx-2 font-medium">View Results</span>
              </div>
            </div>
            
            {stage === 'comparison' && (
              <div className="mt-4 text-center">
                <div className="flex items-center justify-center gap-2 text-sm text-green-600 dark:text-green-400">
                  <CheckCircle className="h-4 w-4" />
                  <span className="font-medium">Analysis Complete</span>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {renderStage()}
      </div>
    </>
  );
};

export default PublicResumePage;
