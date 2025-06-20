import React from 'react';
import { ResumeTemplateProps } from './TemplateInterface';
import MinimalTemplate from './MinimalTemplate';

// This is a placeholder template that uses MinimalTemplate until fully implemented
const CleanAccentTemplate: React.FC<ResumeTemplateProps> = (props) => {
  return <MinimalTemplate {...props} />;
};

export default CleanAccentTemplate; 