import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ResumeSection, ResumeContent, ExperienceEntry } from '@/types/resume';
import ResumeSectionEditor from './ResumeSectionEditor';
import EnhanceWithAI from './EnhanceWithAI';

interface ResumeSectionEditWithAIProps {
  sectionType: ResumeSection;
  resumeData: ResumeContent;
  jobDescription?: string;
  targetRole?: string;
  onChange: (sectionType: ResumeSection, newData: any) => void;
}

const ResumeSectionEditWithAI: React.FC<ResumeSectionEditWithAIProps> = ({
  sectionType,
  resumeData,
  jobDescription,
  targetRole,
  onChange,
}) => {
  const [showAIEnhancement, setShowAIEnhancement] = useState(false);

  // Get the section data based on section type
  const getSectionData = () => {
    switch (sectionType) {
      case 'contactInfo':
        return resumeData.contactInfo;
      case 'summary':
        return resumeData.summary || '';
      case 'experience':
        // Ensure experience is properly formatted as an array of ExperienceEntry objects
        const experience = resumeData.experience || [];
        return Array.isArray(experience) ? experience.map(exp => ({
          company: exp.company || '',
          position: exp.position || '',
          startDate: exp.startDate || '',
          endDate: exp.endDate || '',
          location: exp.location || '',
          description: exp.description || '',
          achievements: Array.isArray(exp.achievements) ? exp.achievements : [],
        })) : [];
      case 'education':
        return resumeData.education || [];
      case 'skills':
        // Ensure skills is an array of strings
        const skills = resumeData.skills || [];
        return Array.isArray(skills) ? skills.map(skill => String(skill)) : [];
      case 'certifications':
        return resumeData.certifications || [];
      case 'projects':
        // Ensure projects are properly formatted
        const projects = resumeData.projects || [];
        return Array.isArray(projects) ? projects.map(project => ({
          name: project.name || '',
          description: project.description || '',
          startDate: project.startDate || '',
          endDate: project.endDate || '',
          url: project.url || '',
          technologies: Array.isArray(project.technologies) ? project.technologies : [],
          achievements: Array.isArray(project.achievements) ? project.achievements : [],
        })) : [];
      default:
        return null;
    }
  };

  // Check if AI enhancement is supported for this section
  const isAIEnhancementSupported = () => {
    // Now supporting summary, experience, and projects sections (removed skills)
    return ['summary', 'experience', 'projects'].includes(sectionType);
  };

  // Handle AI-enhanced content
  const handleApplyEnhancement = (enhancedData: any) => {
    onChange(sectionType, enhancedData);
    setShowAIEnhancement(false);
  };

  // Handle canceling AI enhancement
  const handleCancelEnhancement = () => {
    setShowAIEnhancement(false);
  };

  // Get the appropriate button text based on section type
  const getEnhanceButtonText = () => {
    switch (sectionType) {
      case 'experience':
        return 'Enhance Descriptions with AI';
      case 'projects':
        return 'Enhance Projects with AI';
      default:
        return 'Enhance with AI';
    }
  };

  return (
    <div className="space-y-6">
      {showAIEnhancement ? (
        <EnhanceWithAI
          sectionType={sectionType}
          sectionData={getSectionData()}
          jobDescription={jobDescription}
          targetRole={targetRole}
          onAccept={handleApplyEnhancement}
          onCancel={handleCancelEnhancement}
        />
      ) : (
        <>
          {isAIEnhancementSupported() && (
            <div className="flex justify-end mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAIEnhancement(true)}
                className="gap-2"
              >
                <Sparkles className="h-4 w-4" />
                {getEnhanceButtonText()}
              </Button>
            </div>
          )}

          <ResumeSectionEditor
            sectionType={sectionType}
            resumeData={resumeData}
            onChange={onChange}
          />
        </>
      )}
    </div>
  );
};

export default ResumeSectionEditWithAI;
