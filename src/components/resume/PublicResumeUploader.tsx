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
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Upload, FileText, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { ResumeContent } from '@/types/resume';

interface PublicResumeUploaderProps {
  onSuccess: (content: ResumeContent, originalText: string, jobDescription?: string) => void;
  onError?: (error: string) => void;
}

const PublicResumeUploader: React.FC<PublicResumeUploaderProps> = ({ 
  onSuccess,
  onError
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);
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
      if (onError) onError('File format not supported. Please upload a PDF or Word document.');
      return;
    }
    
    // Reset previous state
    setErrorMessage(null);
    setFile(selectedFile);
  };

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await handleFileSelection(e.target.files[0]);
    }
  };

  const parseResumeFile = async () => {
    if (!file) {
      setErrorMessage('Please select a file to upload.');
      return;
    }
    
    try {
      setIsParsing(true);
      
      const formData = new FormData();
      formData.append('file', file);
      
      // If job description is provided, add it to the form data
      if (jobDescription.trim()) {
        formData.append('jobDescription', jobDescription.trim());
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
      
      // If onSuccess callback is provided, call it with the parsed resume and original text
      if (data.originalText) {
        onSuccess(data.parsedResume, data.originalText, jobDescription.trim() || undefined);
      } else {
        throw new Error('No original text content returned');
      }
      
    } catch (error: any) {
      console.error('Error parsing resume:', error);
      setErrorMessage('Failed to parse resume. Please try a different file or format.');
      
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

  return (
    <Card className="w-full">
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="text-lg sm:text-xl">Upload Your Resume</CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          Get an instant ATS compatibility score and optimization recommendations
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0 space-y-4 sm:space-y-6">
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-6 sm:p-12 flex flex-col items-center justify-center transition-colors ${
            isDragging
              ? 'border-primary bg-primary/5'
              : 'border-muted-foreground/25 hover:border-primary/50'
          }`}
        >
          {file ? (
            <div className="flex flex-col items-center space-y-3 sm:space-y-4">
              <FileText className="h-10 w-10 sm:h-12 sm:w-12 text-primary" />
              <div className="text-center">
                <p className="font-medium text-sm sm:text-base">{file.name}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {(file.size / 1024).toFixed(2)} KB
                </p>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setFile(null)}
                className="text-destructive text-xs sm:text-sm"
              >
                <X className="h-3 w-3 sm:h-4 sm:w-4 mr-1" /> Remove
              </Button>
            </div>
          ) : (
            <>
              <Upload className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mb-3 sm:mb-4" />
              <h3 className="text-base sm:text-lg font-medium mb-2">
                Drag and drop your resume
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground text-center mb-3 sm:mb-4">
                Upload your resume in PDF or Word (docx, doc) format
              </p>
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="secondary"
                size="sm"
                className="sm:text-sm sm:py-2 sm:px-4"
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
        
        <div className="space-y-2">
          <Label htmlFor="jobDescription" className="text-sm sm:text-base">
            Job Description (Optional but Recommended)
          </Label>
          <Textarea
            id="jobDescription"
            placeholder="Paste the job description here to optimize your resume for this specific position..."
            className="h-24 sm:h-32 text-xs sm:text-sm"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
          />
          <p className="text-[10px] sm:text-xs text-muted-foreground">
            Adding a job description helps our AI tailor your resume for better ATS compatibility.
          </p>
        </div>
        
        {errorMessage && (
          <div className="p-2 sm:p-3 bg-destructive/10 border border-destructive/20 text-destructive rounded-md text-xs sm:text-sm">
            {errorMessage}
          </div>
        )}
      </CardContent>
      
      <CardFooter className="p-4 sm:p-6 pt-0 sm:pt-0">
        <Button
          className="w-full text-sm"
          onClick={parseResumeFile}
          disabled={!file || isParsing}
        >
          {isParsing ? (
            <>
              <Loader2 className="mr-2 h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
              Analyzing Resume...
            </>
          ) : (
            'Check ATS Compatibility'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PublicResumeUploader;
