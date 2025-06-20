# Resume Template System

This module provides a flexible system for displaying and exporting resumes in multiple templates.

## Architecture

### Template Structure

The template system consists of:

1. **TemplateInterface.ts**: Defines common interfaces used by all templates
2. **Individual Template Components**: Ready-to-use templates in different styles
3. **Template Index**: Exports all templates and provides helper functions
4. **ResumeTemplatePreview**: UI component for displaying and switching between templates

### Template Styles

We provide five distinct templates:

1. **Standard**: Clean and professional format with balanced layout
2. **Modern**: Contemporary design with categorized skills and highlighted metrics
3. **Professional**: Traditional business-style resume with formal layout
4. **Minimal**: Elegant two-column design with sidebar for skills and education
5. **Creative**: Bold, colorful design with modern styling and visual elements

### Customization Options

Each template supports:

- Font size adjustment (small, medium, large)
- Spacing control (compact, normal, spacious)
- Accent color selection
- ATS-friendly formatting

## Usage

```tsx
import { ResumeTemplatePreview } from '@/components/resume';
import { useState } from 'react';
import { ResumeTemplate } from '@/types/resume';

const ResumeEditor = ({ resumeContent }) => {
  const [selectedTemplate, setSelectedTemplate] = useState<ResumeTemplate>('standard');
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [spacing, setSpacing] = useState<'compact' | 'normal' | 'spacious'>('normal');
  const [accentColor, setAccentColor] = useState('#333333');

  return (
    <ResumeTemplatePreview
      resumeContent={resumeContent}
      selectedTemplate={selectedTemplate}
      onTemplateChange={setSelectedTemplate}
      fontSize={fontSize}
      spacing={spacing}
      accentColor={accentColor}
      onFontSizeChange={setFontSize}
      onSpacingChange={setSpacing}
      onColorChange={setAccentColor}
    />
  );
};
```

## Integration with PDF Export

All templates can be used with the PDF Export functionality to create professionally formatted resume PDFs.

To export a resume with a specific template:

```tsx
import { ResumePdfExport } from '@/components/resume';

// In component
<ResumePdfExport
  resumeContent={resumeContent}
  title={`${resumeContent.contactInfo.name} - Resume`}
  templateName={selectedTemplate}
  fontSize={fontSize}
  spacing={spacing}
  accentColor={accentColor}
/>
```

## ATS Compatibility

All templates are designed with ATS (Applicant Tracking System) compatibility in mind:

- Clean, structured formatting
- Proper heading hierarchy
- Semantic text organization
- Appropriate text formatting (bold, italic)
- Optimized bullet points and lists
- No complex layouts that could confuse ATS parsers

This ensures resumes will be properly parsed by automated systems while still looking professionally designed. 