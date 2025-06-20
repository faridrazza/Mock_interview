
import React from 'react';
import { Menu, ChevronDown, ChevronUp, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { ResumeContent, ResumeSection } from '@/types/resume';
import { Separator } from '@/components/ui/separator';

interface SectionEditorSidebarProps {
  resumeData: ResumeContent;
  activeSectionId: ResumeSection;
  onSectionChange: (section: ResumeSection) => void;
  onSectionOrderChange: (sectionId: ResumeSection, direction: 'up' | 'down') => void;
}

// Map section IDs to display names
const sectionDisplayNames: Record<ResumeSection, string> = {
  contactInfo: 'Contact Information',
  summary: 'Professional Summary',
  experience: 'Work Experience',
  education: 'Education',
  skills: 'Skills',
  certifications: 'Certifications',
  projects: 'Projects',
  customSections: 'Custom Sections'
};

// Default section order if none is specified in resumeData
const defaultSectionOrder: ResumeSection[] = [
  'contactInfo',
  'summary',
  'experience',
  'education',
  'skills',
  'certifications',
  'projects',
  'customSections'
];

const SectionEditorSidebar: React.FC<SectionEditorSidebarProps> = ({
  resumeData,
  activeSectionId,
  onSectionChange,
  onSectionOrderChange
}) => {
  // Use section order from resumeData if available, otherwise use default
  const sectionOrder = resumeData.sectionOrder || defaultSectionOrder;
  
  // Filter out custom sections if they're empty
  const filteredSections = sectionOrder.filter(section => {
    if (section === 'customSections') {
      return resumeData.customSections && resumeData.customSections.length > 0;
    }
    if (section === 'certifications') {
      return resumeData.certifications && resumeData.certifications.length > 0;
    }
    if (section === 'projects') {
      return resumeData.projects && resumeData.projects.length > 0;
    }
    return true;
  });

  // Check if a section is first or last to disable up/down buttons
  const isFirstSection = (section: ResumeSection) => filteredSections.indexOf(section) === 0;
  const isLastSection = (section: ResumeSection) => filteredSections.indexOf(section) === filteredSections.length - 1;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Resume Sections</h3>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <Menu className="h-4 w-4" />
          <span className="sr-only">Menu</span>
        </Button>
      </div>
      
      <p className="text-sm text-muted-foreground">
        Click on a section to edit its content. Drag sections to reorder them in your resume.
      </p>
      
      <Separator />
      
      <div className="space-y-2">
        {filteredSections.map((sectionId) => (
          <Card 
            key={sectionId}
            className={`${
              activeSectionId === sectionId 
                ? 'border-primary bg-primary/5'
                : 'border-neutral-200 dark:border-neutral-700'
            } transition-all hover:shadow-sm`}
          >
            <CardHeader className="p-3">
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  className="p-0 h-auto flex items-center justify-start hover:bg-transparent"
                  onClick={() => onSectionChange(sectionId)}
                >
                  <span className="font-medium text-sm">
                    {sectionDisplayNames[sectionId]}
                  </span>
                </Button>
                
                <div className="flex items-center">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="h-7 w-7 p-0"
                    disabled={isFirstSection(sectionId)}
                    onClick={() => onSectionOrderChange(sectionId, 'up')}
                  >
                    <ChevronUp className="h-4 w-4" />
                    <span className="sr-only">Move up</span>
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="h-7 w-7 p-0"
                    disabled={isLastSection(sectionId)}
                    onClick={() => onSectionOrderChange(sectionId, 'down')}
                  >
                    <ChevronDown className="h-4 w-4" />
                    <span className="sr-only">Move down</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={() => onSectionChange(sectionId)}
                  >
                    <Pencil className="h-4 w-4" />
                    <span className="sr-only">Edit section</span>
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SectionEditorSidebar;
