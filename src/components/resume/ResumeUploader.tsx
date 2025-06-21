import React, { useState, useRef } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Upload, FileText, X, Check } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { Resume, ResumeContent } from '@/types/resume';
import { createResume } from '@/lib/resume';

interface ResumeUploaderProps {
  onUploadComplete?: (resume: Resume) => void;
  onSuccess?: (content: ResumeContent, originalText: string) => void;
  onError?: (error: string) => void;
  onCancel?: () => void;
}

const ResumeUploader: React.FC<ResumeUploaderProps> = ({ 
  onSuccess,
  onError,
  onCancel,
  onUploadComplete
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [parsedResume, setParsedResume] = useState<ResumeContent | null>(null);
  const [resumeTitle, setResumeTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      await handleFileSelection(droppedFile);
    }
  };

  const handleFileSelection = async (selectedFile: File) => {
    const fileExtension = selectedFile.name.split('.').pop()?.toLowerCase();
    
    // Check if file type is supported
    if (!['pdf', 'docx', 'doc'].includes(fileExtension || '')) {
      setErrorMessage('File format not supported. Please upload a PDF or Word document.');
      return;
    }
    
    // Reset previous state
    setErrorMessage(null);
    setFile(selectedFile);
    
    // Automatically set title from filename (without extension)
    const fileName = selectedFile.name.split('.')[0];
    setResumeTitle(fileName.replace(/[_-]/g, ' ') + ' Resume');
    
    // Start processing the file
    await parseResumeFile(selectedFile);
  };

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await handleFileSelection(e.target.files[0]);
    }
  };

  const parseResumeFile = async (selectedFile: File) => {
    try {
      setIsParsing(true);
      
      const formData = new FormData();
      formData.append('file', selectedFile);
      
      // If job description is provided, add it to the form data
      if (jobDescription.trim()) {
        formData.append('jobDescription', jobDescription.trim());
        console.log("Job description added to request for ATS optimization");
      }
      
            // Use AWS Lambda function for resume parsing
      const lambdaEndpoint = 'https://apb59k8zqg.execute-api.us-east-1.amazonaws.com/prod/parse-resume';
      
      const response = await fetch(lambdaEndpoint, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Network error' }));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      const error = null;
      
      if (error) {
        throw new Error(error.message || 'Failed to parse resume');
      }
      
      if (!data || !data.parsedResume) {
        throw new Error('No parsed data returned');
      }
      
      setParsedResume(data.parsedResume);
      
      // If onSuccess callback is provided, call it directly
      if (onSuccess && data.originalText) {
        onSuccess(data.parsedResume, data.originalText);
      }
      
    } catch (error) {
      console.error('Error parsing resume:', error);
      setErrorMessage('Failed to parse resume. Please try a different file or format.');
      
      // If onError callback is provided, call it directly
      if (onError) {
        onError('Failed to parse resume. Please try a different file or format.');
      }
      
      toast({
        title: 'Parsing Error',
        description: 'There was a problem extracting information from your resume.',
        variant: 'destructive',
      });
    } finally {
      setIsParsing(false);
    }
  };

  const handleCreateResume = async () => {
    if (!parsedResume) return;
    
    try {
      setIsUploading(true);
      setErrorMessage(null);
      
      if (!resumeTitle.trim()) {
        setErrorMessage('Please provide a title for your resume.');
        return;
      }
      
      // Create the resume using the parsed content
      const resume = await createResume(
        resumeTitle,
        parsedResume,
        jobDescription.trim() || undefined
      );
      
      toast({
        title: 'Resume created',
        description: 'Your resume has been successfully uploaded and processed.',
      });
      
      // Pass the created resume back to the parent component
      if (onUploadComplete) {
        onUploadComplete(resume);
      }
      
    } catch (error) {
      console.error('Error creating resume:', error);
      setErrorMessage('Failed to create resume. Please try again.');
      
      // If onError callback is provided, call it
      if (onError) {
        onError('Failed to create resume. Please try again.');
      }
      
      toast({
        title: 'Error creating resume',
        description: 'There was an error saving your resume. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  const handleUploadComplete = (resume: Resume) => {
    if (onUploadComplete) {
      onUploadComplete(resume);
    }
  };

  return (
    <div className="space-y-6">
      {!parsedResume ? (
        <Card>
          <CardHeader>
            <CardTitle>Upload Resume</CardTitle>
            <CardDescription>
              Upload your existing resume to automatically populate the fields
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-12 flex flex-col items-center justify-center transition-colors ${
                isDragging
                  ? 'border-primary bg-primary/5'
                  : 'border-muted-foreground/25 hover:border-primary/50'
              }`}
            >
              {isParsing ? (
                <div className="flex flex-col items-center space-y-4">
                  <Loader2 className="h-12 w-12 text-muted-foreground animate-spin" />
                  <p className="text-sm text-muted-foreground">
                    Analyzing your resume...
                  </p>
                </div>
              ) : file ? (
                <div className="flex flex-col items-center space-y-4">
                  <FileText className="h-12 w-12 text-primary" />
                  <div className="text-center">
                    <p className="font-medium">{file.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(file.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setFile(null)}
                    className="text-destructive"
                  >
                    <X className="h-4 w-4 mr-1" /> Remove
                  </Button>
                </div>
              ) : (
                <>
                  <Upload className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">
                    Drag and drop your resume
                  </h3>
                  <p className="text-sm text-muted-foreground text-center mb-4">
                    Upload your resume in PDF or Word (docx, doc) format
                  </p>
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    variant="secondary"
                  >
                    Select File
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept=".pdf,.docx,.doc"
                    onChange={handleFileInputChange}
                  />
                </>
              )}
            </div>
            
            {errorMessage && (
              <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 text-destructive rounded-md text-sm">
                {errorMessage}
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button
              disabled={!file || isParsing}
              onClick={() => parseResumeFile(file!)}
            >
              {isParsing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Parsing...
                </>
              ) : (
                'Parse Resume'
              )}
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Resume Detected</CardTitle>
            <CardDescription>
              We've analyzed your resume. Review the information below and make any necessary edits before saving.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Resume Title</Label>
              <Input
                id="title"
                value={resumeTitle}
                onChange={(e) => setResumeTitle(e.target.value)}
                placeholder="e.g., Software Engineer Resume"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="jobDescription">
                Job Description (Optional)
              </Label>
              <Input
                id="jobDescription"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the job description to tailor your resume"
              />
              <p className="text-xs text-muted-foreground">
                Adding a job description helps our AI tailor your resume for better ATS compatibility.
              </p>
            </div>
            
            <div className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Check className="h-5 w-5 text-green-500" />
                <p className="font-medium">Resume Information Detected</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <div>
                  <span className="font-medium">Name:</span> {parsedResume.contactInfo.name}
                </div>
                <div>
                  <span className="font-medium">Email:</span> {parsedResume.contactInfo.email}
                </div>
                {parsedResume.contactInfo.phone && (
                  <div>
                    <span className="font-medium">Phone:</span> {parsedResume.contactInfo.phone}
                  </div>
                )}
                {parsedResume.contactInfo.location && (
                  <div>
                    <span className="font-medium">Location:</span> {parsedResume.contactInfo.location}
                  </div>
                )}
              </div>
              
              <div className="space-y-1">
                <p className="font-medium text-sm">Resume Sections Found:</p>
                <ul className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm list-disc list-inside">
                  {parsedResume.summary && <li>Professional Summary</li>}
                  {parsedResume.experience?.length > 0 && <li>Work Experience ({parsedResume.experience.length} entries)</li>}
                  {parsedResume.education?.length > 0 && <li>Education ({parsedResume.education.length} entries)</li>}
                  {parsedResume.skills?.length > 0 && <li>Skills ({parsedResume.skills.length} skills)</li>}
                  {parsedResume.certifications?.length > 0 && <li>Certifications ({parsedResume.certifications.length} entries)</li>}
                  {parsedResume.projects?.length > 0 && <li>Projects ({parsedResume.projects.length} entries)</li>}
                </ul>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => {
              setParsedResume(null);
              setFile(null);
            }}>
              Start Over
            </Button>
            <Button 
              onClick={handleCreateResume}
              disabled={isUploading || !resumeTitle.trim()}
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Resume'
              )}
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
};

export default ResumeUploader;
