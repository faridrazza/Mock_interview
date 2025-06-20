import React from 'react';
import { ResumeContent, ResumeTemplate } from '@/types/resume';

// Import template components
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

interface ResumeTemplatePreviewProps {
  template: ResumeTemplate;
  content: ResumeContent;
}

const ResumeTemplatePreview: React.FC<ResumeTemplatePreviewProps> = ({
  template, 
  content 
}) => {
  // Get design settings from content or use defaults
  const fontSize = content.design?.fontSize || 'small';
  const spacing = content.design?.spacing || 'normal';
  const accentColor = content.design?.accentColor || '#000000';
  
  // Common props for all templates
  const templateProps = {
    content,
    fontSize,
    spacing,
    accentColor,
  };
  
  // Render appropriate template based on selected template
  switch (template) {
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
    case 'standard':
    default:
      return <StandardTemplate {...templateProps} />;
  }
};

export default ResumeTemplatePreview; 