import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Loader2, Save, FileText, Sparkles, Palette, 
  LayoutTemplate, Settings, ArrowLeft, Eye
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { getResumeById, updateResume } from '@/lib/resume';
import { Resume, ResumeSection, ResumeContent, ResumeTemplate, ResumeDesign } from '@/types/resume';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';

// Import our new components
import DesignCustomizer from '@/components/resume/DesignCustomizer';
import SectionEditorSidebar from '@/components/resume/SectionEditorSidebar';
import ResumeSectionEditWithAI from '@/components/resume/ResumeSectionEditWithAI';
import TemplateGallery from '@/components/resume/TemplateGallery';

// Import template previews
import StandardTemplate from '@/components/resume/templates/StandardTemplate';
import ModernTemplate from '@/components/resume/templates/ModernTemplate';
import ProfessionalTemplate from '@/components/resume/templates/ProfessionalTemplate';
import MinimalTemplate from '@/components/resume/templates/MinimalTemplate';
import CreativeTemplate from '@/components/resume/templates/CreativeTemplate';
import ChronologicalTemplate from '@/components/resume/templates/ChronologicalTemplate';
import ExecutiveTemplate from '@/components/resume/templates/ExecutiveTemplate';
import TechnicalTemplate from '@/components/resume/templates/TechnicalTemplate';
import DataScientistTemplate from '@/components/resume/templates/DataScientistTemplate';
import ModernPhotoTemplate from '@/components/resume/templates/ModernPhotoTemplate';

// LocalStorage key prefix for resume draft data
const DRAFT_STORAGE_KEY_PREFIX = 'resume_draft_';

const ModernResumeEditor = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [resume, setResume] = useState<Resume | null>(null);
  const [resumeContent, setResumeContent] = useState<ResumeContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState<ResumeSection>('contactInfo');
  const [error, setError] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [activeEditorTab, setActiveEditorTab] = useState<'sections' | 'templates' | 'design'>('sections');
  
  // Get localStorage key for current resume
  const getDraftStorageKey = () => {
    if (!id || !user) return null;
    return `${DRAFT_STORAGE_KEY_PREFIX}${user.id}_${id}`;
  };

  // Save draft to localStorage - memoize with useCallback to avoid unnecessary re-creation
  const saveDraftToStorage = useCallback(() => {
    if (!resumeContent || !resume) return;
    
    const storageKey = getDraftStorageKey();
    if (!storageKey) return;
    
    try {
      const draftData = {
        resumeContent,
        templateId: resume.template_id,
        lastSaved: new Date().toISOString()
      };
      localStorage.setItem(storageKey, JSON.stringify(draftData));
    } catch (error) {
      console.error("Error saving draft to localStorage:", error);
    }
  }, [resumeContent, resume, id, user]);

  // Check for draft in localStorage
  const loadDraftFromStorage = useCallback(() => {
    if (!id) return null;
    
    const storageKey = getDraftStorageKey();
    if (!storageKey) return null;
    
    try {
      const draftJson = localStorage.getItem(storageKey);
      if (!draftJson) return null;
      
      const draft = JSON.parse(draftJson);
      return draft;
    } catch (error) {
      console.error("Error loading draft from localStorage:", error);
      return null;
    }
  }, [id, user]);
  
  // Handle tab visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      // Only save draft when switching away from tab
      if (document.visibilityState === 'hidden' && hasUnsavedChanges) {
        saveDraftToStorage();
      }
    };
    
    // Add event listener for visibility changes
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Set up periodic autosave
    const autosaveInterval = setInterval(() => {
      if (hasUnsavedChanges) {
        saveDraftToStorage();
      }
    }, 30000);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(autosaveInterval);
    };
  }, [hasUnsavedChanges, saveDraftToStorage]);

  // Handle window beforeunload event to warn user about unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        // Save draft before unloading
        saveDraftToStorage();
        
        // Standard way to show confirmation dialog when leaving page with unsaved changes
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasUnsavedChanges, saveDraftToStorage]);
  
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
        
        // Check for unsaved draft in localStorage
        const draft = loadDraftFromStorage();
        
        if (draft && draft.resumeContent) {
          // If we have a draft that's newer than the server data
          const draftDate = new Date(draft.lastSaved);
          const serverDate = new Date(data.updated_at);
          
          if (draftDate > serverDate) {
            // Draft is newer, restore it and notify user
            setResumeContent(draft.resumeContent);
            
            // Set templateId from draft if available
            if (draft.templateId) {
              setResume(prev => prev ? {...prev, template_id: draft.templateId} : prev);
            }
            
            setHasUnsavedChanges(true);
            
            toast({
              title: 'Unsaved changes restored',
              description: 'We\'ve restored your unsaved changes from your last session.',
            });
          } else {
            // Server data is newer
            setResumeContent(data.content);
          }
        } else {
          // No draft, use server data
          setResumeContent(data.content);
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
  
  // Handle section order change
  const handleSectionOrderChange = (sectionId: ResumeSection, direction: 'up' | 'down') => {
    if (!resumeContent) return;
    
    // Get current section order or use default
    const currentOrder = resumeContent.sectionOrder || [
      'contactInfo', 'summary', 'experience', 'education', 
      'skills', 'certifications', 'projects', 'customSections'
    ];
    
    const currentIndex = currentOrder.indexOf(sectionId);
    if (currentIndex === -1) return;
    
    const newOrder = [...currentOrder];
    
    if (direction === 'up' && currentIndex > 0) {
      // Swap with the previous item
      [newOrder[currentIndex - 1], newOrder[currentIndex]] = 
      [newOrder[currentIndex], newOrder[currentIndex - 1]];
    } else if (direction === 'down' && currentIndex < newOrder.length - 1) {
      // Swap with the next item
      [newOrder[currentIndex], newOrder[currentIndex + 1]] = 
      [newOrder[currentIndex + 1], newOrder[currentIndex]];
    }
    
    // Update section order
    setResumeContent(prevContent => {
      if (!prevContent) return null;
      return {
        ...prevContent,
        sectionOrder: newOrder
      };
    });
    
    setHasUnsavedChanges(true);
  };
  
  // Handle template change
  const handleTemplateChange = (templateId: ResumeTemplate) => {
    if (!resume) return;
    
    setHasUnsavedChanges(true);
    
    // Update template ID in resume
    setResume(prevResume => {
      if (!prevResume) return null;
      return {
        ...prevResume,
        template_id: templateId
      };
    });
  };
  
  // Handle design change
  const handleDesignChange = (design: ResumeDesign) => {
    if (!resumeContent) return;
    
    setResumeContent(prevContent => {
      if (!prevContent) return null;
      return {
        ...prevContent,
        design
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
        template_id: resume.template_id,
        status: 'draft',
      });
      
      // Update the local state with the response
      setResume(updatedResume);
      
      toast({
        title: 'Resume saved',
        description: 'Your resume has been saved successfully.',
      });
      
      setHasUnsavedChanges(false);
      
      // Clear draft from localStorage after successful save
      const storageKey = getDraftStorageKey();
      if (storageKey) {
        localStorage.removeItem(storageKey);
      }
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
  
  // Render the appropriate resume template
  const renderResumeTemplate = () => {
    if (!resumeContent) return null;
    
    const templateId = resume?.template_id || 'standard';
    const design = resumeContent.design || {};
    
    const templateProps = {
      content: resumeContent,
      fontSize: design.fontSize || 'small',
      spacing: design.spacing || 'compact',
      accentColor: design.accentColor || '#000000',
    };
    
    switch (templateId) {
      case 'modern':
        return <ModernTemplate {...templateProps} />;
      case 'professional':
        return <ProfessionalTemplate {...templateProps} />;
      case 'minimal':
        return <MinimalTemplate {...templateProps} />;
      case 'creative':
        return <CreativeTemplate {...templateProps} />;
      case 'chronological':
        return <ChronologicalTemplate {...templateProps} />;
      case 'executive':
        return <ExecutiveTemplate {...templateProps} />;
      case 'technical':
        return <TechnicalTemplate {...templateProps} />;
      case 'datascientist':
        return <DataScientistTemplate {...templateProps} />;
      case 'modernphoto':
        return <ModernPhotoTemplate {...templateProps} />;
      default:
        return <StandardTemplate {...templateProps} />;
    }
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
      <div className="container px-4 xl:px-0 py-6 max-w-[1600px]">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/dashboard?tab=resumes')}
              className="h-8 gap-1"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{resume?.title || 'Resume Editor'}</h1>
              <p className="text-sm text-muted-foreground">
                {resume?.status === 'draft' ? 'Draft' : 'Completed'} • Last updated {resume ? new Date(resume?.updated_at || '').toLocaleDateString() : ''}
              </p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={handlePreview}
              disabled={!resume || saving}
              className="gap-2"
            >
              <Eye className="h-4 w-4" />
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
          <div className="grid grid-cols-12 gap-6">
            {/* Left sidebar */}
            <div className="col-span-12 lg:col-span-3 space-y-6">
              <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm p-4 border border-neutral-200 dark:border-neutral-700">
                <Tabs value={activeEditorTab} onValueChange={(value) => setActiveEditorTab(value as any)}>
                  <TabsList className="grid grid-cols-3 mb-4">
                    <TabsTrigger value="sections" className="text-xs">
                      <Settings className="h-4 w-4 mr-1" />
                      Sections
                    </TabsTrigger>
                    <TabsTrigger value="templates" className="text-xs">
                      <LayoutTemplate className="h-4 w-4 mr-1" />
                      Templates
                    </TabsTrigger>
                    <TabsTrigger value="design" className="text-xs">
                      <Palette className="h-4 w-4 mr-1" />
                      Design
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="sections">
                    <SectionEditorSidebar
                      resumeData={resumeContent}
                      activeSectionId={activeSection}
                      onSectionChange={setActiveSection}
                      onSectionOrderChange={handleSectionOrderChange}
                    />
                  </TabsContent>
                  
                  <TabsContent value="templates">
                    <TemplateGallery
                      selectedTemplate={resume?.template_id as ResumeTemplate || 'standard'}
                      onSelectTemplate={handleTemplateChange}
                    />
                  </TabsContent>
                  
                  <TabsContent value="design">
                    <DesignCustomizer
                      design={resumeContent.design || {}}
                      template={resume?.template_id as ResumeTemplate || 'standard'}
                      onDesignChange={handleDesignChange}
                      onTemplateChange={handleTemplateChange}
                    />
                  </TabsContent>
                </Tabs>
              </div>
            </div>
            
            {/* Center panel - Section editor */}
            <div className="col-span-12 lg:col-span-5">
              <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm p-6 border border-neutral-200 dark:border-neutral-700">
                <h2 className="text-xl font-semibold mb-4">
                  {activeSection === 'contactInfo' && 'Contact Information'}
                  {activeSection === 'summary' && 'Professional Summary'}
                  {activeSection === 'experience' && 'Work Experience'}
                  {activeSection === 'education' && 'Education'}
                  {activeSection === 'skills' && 'Skills'}
                  {activeSection === 'certifications' && 'Certifications'}
                  {activeSection === 'projects' && 'Projects'}
                  {activeSection === 'customSections' && 'Custom Sections'}
                </h2>
                
                <Separator className="mb-6" />
                
                <ResumeSectionEditWithAI
                  sectionType={activeSection}
                  resumeData={resumeContent}
                  onChange={handleSectionChange}
                  jobDescription={resume?.job_description}
                  targetRole={resume?.target_role}
                />
              </div>
            </div>
            
            {/* Right panel - Resume preview */}
            <div className="col-span-12 lg:col-span-4">
              <div className="sticky top-24">
                <h3 className="text-lg font-semibold mb-3">Resume Preview</h3>
                              <div className="bg-white dark:bg-neutral-800 p-2 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-700 overflow-hidden">
                <div className="bg-white dark:bg-black aspect-[8.5/11] rounded shadow-lg transform scale-[0.98] origin-top overflow-hidden">
                  <div className="w-full h-full overflow-auto" style={{ zoom: '70%' }}>
                    {renderResumeTemplate()}
                  </div>
                </div>
                <div className="text-center mt-3 text-sm text-muted-foreground">
                  <Button
                    variant="link"
                    size="sm"
                    onClick={handlePreview}
                    className="h-auto p-0"
                  >
                    View Full-Size Preview
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

export default ModernResumeEditor;
