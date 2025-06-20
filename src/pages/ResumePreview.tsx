import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Loader2, Download, Edit, ArrowLeft } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getResumeById } from '@/lib/resume';
import { Resume, ResumeTemplate } from '@/types/resume';
import { useAuth } from '@/contexts/AuthContext';
import ATSScoreIndicator from '@/components/resume/ATSScoreIndicator';
import ResumePdfExport from '@/components/resume/ResumePdfExport';
import { getTemplateByName } from '@/components/resume/templates';
import { SuppressFragmentWarnings } from '@/utils/WarningSuppress';

const ResumePreview = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [resume, setResume] = useState<Resume | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [template, setTemplate] = useState<ResumeTemplate>('standard');
  
  useEffect(() => {
    // Check if user is authenticated
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to preview your resume',
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
        if (data.template_id) {
          setTemplate(data.template_id as ResumeTemplate);
        }
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

  const handleExportPDF = () => {
    // This function is no longer needed as we'll use ResumePdfExport component
  };
  
  const handleTemplateChange = (value: string) => {
    setTemplate(value as ResumeTemplate);
    // In a future phase, we'll add template saving functionality
    toast({
      title: 'Template selection saved',
      description: 'Template saving will be implemented in the next phase.',
    });
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
    <SuppressFragmentWarnings>
    <DashboardLayout>
      <div className="container max-w-5xl mx-auto py-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold">{resume?.title || 'Resume Preview'}</h1>
            <p className="text-sm text-muted-foreground">
              Preview Mode
            </p>
          </div>
          <div className="flex gap-4">
            <Button 
              variant="outline" 
              onClick={() => navigate(`/dashboard/resume/${id}`)}
              className="gap-2"
            >
              <Edit className="h-4 w-4" />
              Edit Resume
            </Button>
            <Button 
              onClick={() => navigate('/dashboard?tab=resumes')}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
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
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="md:col-span-3">
              <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-700 p-6 md:p-10 min-h-[800px] mb-6">
                {resume ? (
                  <div className="resume-preview">
                    {/* Use the template component that respects section order instead of hard-coded sections */}
                    {React.createElement(getTemplateByName(template), {
                      content: {
                        // Ensure all arrays exist to prevent "Cannot read properties of undefined (reading 'length')" errors
                        ...resume.content,
                        experience: resume.content.experience || [],
                        education: resume.content.education || [],
                        skills: resume.content.skills || [],
                        certifications: resume.content.certifications || [],
                        projects: resume.content.projects || [],
                        customSections: resume.content.customSections || [],
                        sectionOrder: resume.content.sectionOrder || [
                          'contactInfo',
                          'summary',
                          'experience',
                          'education',
                          'skills',
                          'certifications',
                          'projects',
                          'customSections'
                        ]
                      },
                      fontSize: resume.content.design?.fontSize || 'small',
                      spacing: resume.content.design?.spacing || 'normal',
                      accentColor: resume.content.design?.accentColor || '#333333'
                    })}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-80">
                    <p>Resume content not available</p>
                  </div>
                )}
              </div>
            </div>

            <div className="md:col-span-1">
              <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-700 p-6 space-y-6 sticky top-24">
                <div>
                  <h3 className="text-lg font-medium mb-4">Resume Settings</h3>
                </div>
                
                <div className="space-y-4 pt-4">
                  <h4 className="text-sm font-medium">Export Options</h4>
                  {resume && (
                    <ResumePdfExport
                      resumeContent={resume.content}
                      title={resume.title}
                      template_id={template}
                    />
                  )}
                </div>
                
                <div className="space-y-4 pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => navigate(`/dashboard/resume/${id}`)}
                    className="w-full gap-2"
                  >
                    <Edit className="h-4 w-4" />
                    Edit Resume
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
    </SuppressFragmentWarnings>
  );
};

export default ResumePreview;
