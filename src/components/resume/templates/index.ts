import { ResumeTemplate } from '@/types/resume';
import StandardTemplate from './StandardTemplate';
import ModernTemplate from './ModernTemplate';
import ProfessionalTemplate from './ProfessionalTemplate';
import MinimalTemplate from './MinimalTemplate';
import CreativeTemplate from './CreativeTemplate';
import ChronologicalTemplate from './ChronologicalTemplate';
import ExecutiveTemplate from './ExecutiveTemplate';
import TechnicalTemplate from './TechnicalTemplate';
import DataScientistTemplate from './DataScientistTemplate';
import ModernPhotoTemplate from './ModernPhotoTemplate';
import MinimalTwoColumnTemplate from './MinimalTwoColumnTemplate';
import CleanAccentTemplate from './CleanAccentTemplate';
import BusinessTemplate from './BusinessTemplate';
import { ResumeTemplateProps } from './TemplateInterface';
import React from 'react';

export {
  StandardTemplate,
  ModernTemplate,
  ProfessionalTemplate,
  MinimalTemplate,
  CreativeTemplate,
  ChronologicalTemplate,
  ExecutiveTemplate,
  TechnicalTemplate,
  DataScientistTemplate,
  ModernPhotoTemplate,
  MinimalTwoColumnTemplate,
  CleanAccentTemplate,
  BusinessTemplate
};

export type TemplateComponent = React.FC<ResumeTemplateProps>;

// Template map for easily getting a template by name
const templateMap: Partial<Record<ResumeTemplate, TemplateComponent>> = {
  standard: StandardTemplate,
  modern: ModernTemplate,
  professional: ProfessionalTemplate,
  minimal: MinimalTemplate,
  creative: CreativeTemplate,
  chronological: ChronologicalTemplate,
  executive: ExecutiveTemplate,
  technical: TechnicalTemplate,
  datascientist: DataScientistTemplate,
  modernphoto: ModernPhotoTemplate
  // Other templates will be added as they are implemented
};

// Helper function to get template component by name
export const getTemplateByName = (name: ResumeTemplate): TemplateComponent => {
  return templateMap[name] || StandardTemplate;
};

// Helper function to get template names and labels for selection UI
export const getTemplateOptions = () => {
  return [
    { value: 'standard', label: 'Standard', description: 'Clean and professional format with balanced layout' },
    { value: 'modern', label: 'Modern', description: 'Contemporary design with categorized skills and highlighted metrics' },
    { value: 'professional', label: 'Professional', description: 'Traditional business-style resume with formal layout' },
    { value: 'minimal', label: 'Minimal', description: 'Elegant two-column design with sidebar for skills and education' },
    { value: 'creative', label: 'Creative', description: 'Bold, colorful design with modern styling and visual elements' },
    { value: 'chronological', label: 'Chronological', description: 'ATS-optimized format highlighting work history in reverse chronological order' },
    { value: 'executive', label: 'Executive', description: 'Sophisticated design for senior professionals and executives' },
    { value: 'technical', label: 'Technical', description: 'Technical-focused format with emphasis on skills and projects' },
    { value: 'datascientist', label: 'Data Scientist', description: 'Modern technical resume with prominent skills and metrics for data professionals' },
    { value: 'modernphoto', label: 'Modern Photo', description: 'Professional resume with circular photo and two-column layout with progress bars' }
  ];
};

export type TemplateComponentType = typeof StandardTemplate; 