import { ResumeTemplate } from '@/types/resume';
import StandardResumePDF from './StandardResumePDF';
import ModernResumePDF from './ModernResumePDF';
import ProfessionalResumePDF from './ProfessionalResumePDF';
import MinimalResumePDF from './MinimalResumePDF';
import CreativeResumePDF from './CreativeResumePDF';
import ChronologicalResumePDF from './ChronologicalResumePDF';
import ExecutiveResumePDF from './ExecutiveResumePDF';
import TechnicalResumePDF from './TechnicalResumePDF';
import DataScientistResumePDF from './DataScientistResumePDF';
import ModernPhotoResumePDF from './ModernPhotoResumePDF';
import { ResumePDFProps } from './PDFTemplateInterface';
import React from 'react';

export {
  StandardResumePDF,
  ModernResumePDF,
  ProfessionalResumePDF,
  MinimalResumePDF,
  CreativeResumePDF,
  ChronologicalResumePDF,
  ExecutiveResumePDF,
  TechnicalResumePDF,
  DataScientistResumePDF,
  ModernPhotoResumePDF
};

export type PDFTemplateComponent = React.FC<ResumePDFProps>;

// PDF template map for lookup
const pdfTemplateMap: Partial<Record<ResumeTemplate, PDFTemplateComponent>> = {
  standard: StandardResumePDF,
  modern: ModernResumePDF,
  professional: ProfessionalResumePDF,
  minimal: MinimalResumePDF,
  creative: CreativeResumePDF,
  chronological: ChronologicalResumePDF,
  executive: ExecutiveResumePDF,
  technical: TechnicalResumePDF,
  datascientist: DataScientistResumePDF,
  modernphoto: ModernPhotoResumePDF
  // Other templates will be added as they are implemented
};

// Helper to get PDF template component by template name
export const getPDFTemplateByName = (name: ResumeTemplate): PDFTemplateComponent => {
  return pdfTemplateMap[name] || StandardResumePDF;
};

const getPDFTemplateForType = (templateId: ResumeTemplate) => {
  switch (templateId) {
    case 'modern':
      return ModernResumePDF;
    case 'professional':
      return ProfessionalResumePDF;
    case 'minimal':
      return MinimalResumePDF;
    case 'creative':
      return CreativeResumePDF;
    case 'chronological':
      return ChronologicalResumePDF;
    case 'executive':
      return ExecutiveResumePDF;
    case 'technical':
      return TechnicalResumePDF;
    case 'datascientist':
      return DataScientistResumePDF;
    case 'modernphoto':
      return ModernPhotoResumePDF;
    case 'standard':
    default:
      return StandardResumePDF;
  }
}; 