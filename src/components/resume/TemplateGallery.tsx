import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ResumeTemplate } from '@/types/resume';
import { getTemplateOptions } from '@/components/resume/templates';

interface TemplateGalleryProps {
  selectedTemplate: ResumeTemplate;
  onSelectTemplate: (template: ResumeTemplate) => void;
}

interface TemplateOption {
  id: ResumeTemplate;
  name: string;
  description: string;
  thumbnail: string; // This would be a path to a thumbnail image
}

// Template options - using helper function from templates/index.ts
const templateOptions = getTemplateOptions();

// Prepare template data with thumbnails
const templates: TemplateOption[] = templateOptions.map(option => ({
  id: option.value as ResumeTemplate,
  name: option.label,
  description: option.description,
  thumbnail: `/templates/${option.value}-thumb.png` // These would be placeholder images, replace as needed
}));

const TemplateGallery: React.FC<TemplateGalleryProps> = ({
  selectedTemplate,
  onSelectTemplate
}) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Resume Templates</h3>
      
      <p className="text-sm text-muted-foreground">
        Choose a template that best represents your professional style.
      </p>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
        {templates.map((template) => (
          <Card 
            key={template.id}
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedTemplate === template.id 
                ? 'border-primary ring-2 ring-primary/20' 
                : 'border-neutral-200 dark:border-neutral-700'
            }`}
            onClick={() => onSelectTemplate(template.id)}
          >
            <CardContent className="p-3 space-y-3">
              <div className="aspect-[8.5/11] bg-neutral-100 dark:bg-neutral-800 rounded-sm overflow-hidden">
                {/* Using a div with background as fallback for thumbnail */}
                <div 
                  className="w-full h-full"
                  style={{
                    backgroundImage: `url(${template.thumbnail})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundColor: 'rgba(0,0,0,0.1)'
                  }}
                />
              </div>
              <div>
                <h4 className="font-medium text-sm truncate">{template.name}</h4>
                <p className="text-xs text-muted-foreground line-clamp-2 h-8 overflow-hidden">{template.description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default TemplateGallery;
