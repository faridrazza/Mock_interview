import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import ResumeUploader from '@/components/resume/ResumeUploader';
import { Resume, ResumeContent } from '@/types/resume';
import { supabase } from '@/lib/supabase';

const ResumeBuilderUpload = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [resumeTitle, setResumeTitle] = useState('');
  const [parsedContent, setParsedContent] = useState<ResumeContent | null>(null);
  const [originalText, setOriginalText] = useState<string>('');
  const [jobDescription, setJobDescription] = useState<string>('');
  const [targetRole, setTargetRole] = useState<string>('');
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleUploadSuccess = (content: ResumeContent, originalText: string) => {
    setParsedContent(content);
    setOriginalText(originalText);
    // Generate resume title from name if available
    if (content.contactInfo && content.contactInfo.name) {
      setResumeTitle(`${content.contactInfo.name}'s Resume`);
    } else {
      setResumeTitle('Uploaded Resume');
    }
    
    // Set target role from parsed content if available
    if (content.experience && content.experience.length > 0) {
      setTargetRole(content.experience[0].position);
    }
  };

  const handleUploadError = (error: string) => {
    toast({
      variant: "destructive",
      title: "Upload failed",
      description: error
    });
  };

  const handleCreateResume = async () => {
    if (!parsedContent) return;
    
    try {
      setIsCreating(true);
      
      // Get authentication token for AWS Lambda
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;
      
      if (!accessToken) {
        throw new Error('Authentication required. Please sign in again.');
      }
      
      // Use AWS Lambda function for creating resume instead of direct Supabase call
      const { lambdaApi } = await import('@/config/aws-lambda');
      
      const data = await lambdaApi.createResume({
        title: resumeTitle,
        content: parsedContent,
        originalText: originalText, // Use the original text from the parsed content
        jobDescription: jobDescription.trim() || undefined,
        selectedTemplate: 'standard', // Default template for dashboard uploads
        atsScore: undefined // No ATS score for dashboard uploads
      }, accessToken);
      
      if (!data) {
        throw new Error('Failed to create resume');
      }
      
      toast({
        title: "Resume created",
        description: "Your resume has been created and is ready for editing",
      });
      
      // Navigate to the resume editor
      navigate(`/dashboard/resume-editor/${data.id}`);
    } catch (error: any) {
      console.error('Error creating resume:', error);
      toast({
        variant: "destructive",
        title: "Failed to create resume",
        description: error.message || "An error occurred while creating your resume"
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="container max-w-3xl mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">Upload Your Resume</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>Resume Upload</CardTitle>
            <CardDescription>
              Upload your existing resume to get started quickly. 
              Our AI will extract the content and format it for ATS compatibility.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!parsedContent ? (
              <ResumeUploader 
                onSuccess={handleUploadSuccess} 
                onError={handleUploadError}
                onCancel={() => navigate('/dashboard?tab=resumes')}
              />
            ) : (
              <div className="space-y-6">
                <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-5 w-5" 
                    viewBox="0 0 20 20" 
                    fill="currentColor"
                  >
                    <path 
                      fillRule="evenodd" 
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" 
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="font-medium">Resume successfully processed!</span>
                </div>
                
                <div className="p-4 border rounded-lg bg-muted/20">
                  <h3 className="font-medium mb-2">Resume Content Preview</h3>
                  
                  <div className="space-y-3">
                    {/* Contact Info */}
                    {parsedContent.contactInfo && (
                      <div>
                        <p className="font-medium">{parsedContent.contactInfo.name}</p>
                        <p className="text-sm text-muted-foreground">{parsedContent.contactInfo.email} • {parsedContent.contactInfo.phone || 'No phone'}</p>
                        {parsedContent.contactInfo.location && (
                          <p className="text-sm text-muted-foreground">{parsedContent.contactInfo.location}</p>
                        )}
                      </div>
                    )}
                    
                    {/* Experience */}
                    {parsedContent.experience && parsedContent.experience.length > 0 && (
                      <div>
                        <p className="text-sm font-medium">Experience: {parsedContent.experience.length} entries</p>
                        <p className="text-xs text-muted-foreground truncate">
                          Latest: {parsedContent.experience[0].position} at {parsedContent.experience[0].company}
                        </p>
                      </div>
                    )}
                    
                    {/* Education */}
                    {parsedContent.education && parsedContent.education.length > 0 && (
                      <div>
                        <p className="text-sm font-medium">Education: {parsedContent.education.length} entries</p>
                        <p className="text-xs text-muted-foreground truncate">
                          Latest: {parsedContent.education[0].degree} at {parsedContent.education[0].institution}
                        </p>
                      </div>
                    )}
                    
                    {/* Skills */}
                    {parsedContent.skills && parsedContent.skills.length > 0 && (
                      <div>
                        <p className="text-sm font-medium">Skills: {parsedContent.skills.length} skills</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {parsedContent.skills.slice(0, 5).join(', ')}{parsedContent.skills.length > 5 ? ', ...' : ''}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="resumeTitle">Resume Title</Label>
                    <Input
                      id="resumeTitle"
                      value={resumeTitle}
                      onChange={(e) => setResumeTitle(e.target.value)}
                      placeholder="Enter a title for your resume"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="targetRole">Target Role</Label>
                    <Input
                      id="targetRole"
                      value={targetRole}
                      onChange={(e) => setTargetRole(e.target.value)}
                      placeholder="e.g., Software Engineer, Product Manager, Data Scientist"
                    />
                    <p className="text-xs text-muted-foreground">
                      Specify the role you're targeting to help our AI optimize your resume
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="jobDescription">Job Description</Label>
                    <Textarea
                      id="jobDescription"
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      placeholder="Paste the job description here to tailor your resume for ATS optimization"
                      className="h-32 resize-none"
                    />
                    <p className="text-xs text-muted-foreground">
                      Adding a job description helps our AI tailor your resume with relevant keywords for better ATS compatibility
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
          {parsedContent && (
            <CardFooter className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={() => {
                  setParsedContent(null);
                  setOriginalText('');
                  setJobDescription('');
                  setTargetRole('');
                }}
              >
                Upload Different Resume
              </Button>
              <Button 
                onClick={handleCreateResume}
                disabled={isCreating || !resumeTitle.trim()}
              >
                {isCreating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Resume'
                )}
              </Button>
            </CardFooter>
          )}
        </Card>

        <div className="mt-6 flex justify-center">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/dashboard?tab=resumes')}
          >
            Back to Resumes
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ResumeBuilderUpload;
