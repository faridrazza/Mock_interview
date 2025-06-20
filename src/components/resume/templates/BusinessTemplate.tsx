import React from 'react';
import { ResumeTemplateProps } from './TemplateInterface';
import ProfessionalTemplate from './ProfessionalTemplate';

// This is a placeholder template that uses ProfessionalTemplate until fully implemented
const BusinessTemplate: React.FC<ResumeTemplateProps> = (props) => {
  return <ProfessionalTemplate {...props} />;
};

export default BusinessTemplate; 