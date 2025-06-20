import React from 'react';
import { ResumeTemplateProps } from './TemplateInterface';
import MinimalTemplate from './MinimalTemplate';

// This is a placeholder template that uses MinimalTemplate until fully implemented
const MinimalTwoColumnTemplate: React.FC<ResumeTemplateProps> = (props) => {
  return <MinimalTemplate {...props} />;
};

export default MinimalTwoColumnTemplate; 