
import React from 'react';
import { Palette, Type, Maximize, Minimize } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ResumeDesign, ResumeTemplate } from '@/types/resume';

const FONT_FAMILIES = [
  { name: 'Default', value: 'Inter, sans-serif' },
  { name: 'Serif', value: 'Georgia, serif' },
  { name: 'Modern', value: 'system-ui, sans-serif' },
  { name: 'Monospace', value: 'monospace' }
];

const COLOR_PRESETS = [
  { name: 'Blue', value: '#2563eb' },
  { name: 'Green', value: '#10b981' },
  { name: 'Purple', value: '#8b5cf6' },
  { name: 'Red', value: '#ef4444' },
  { name: 'Gray', value: '#6b7280' },
  { name: 'Black', value: '#000000' },
];

interface DesignCustomizerProps {
  design: ResumeDesign;
  template: ResumeTemplate;
  onDesignChange: (design: ResumeDesign) => void;
  onTemplateChange: (template: ResumeTemplate) => void;
}

const DesignCustomizer: React.FC<DesignCustomizerProps> = ({ 
  design, 
  template,
  onDesignChange, 
  onTemplateChange 
}) => {
  // Default design values
  const currentDesign = {
    accentColor: design?.accentColor || '#2563eb',
    fontFamily: design?.fontFamily || 'Inter, sans-serif',
    fontSize: design?.fontSize || 'small',
    spacing: design?.spacing || 'normal',
    margins: design?.margins || 'normal',
  };

  const handleColorChange = (color: string) => {
    onDesignChange({ ...currentDesign, accentColor: color });
  };

  const handleFontFamilyChange = (fontFamily: string) => {
    onDesignChange({ ...currentDesign, fontFamily });
  };

  const handleFontSizeChange = (value: number[]) => {
    const sizeMappings = ['small', 'medium', 'large'];
    const fontSize = sizeMappings[value[0]] as 'small' | 'medium' | 'large';
    onDesignChange({ ...currentDesign, fontSize });
  };

  const handleSpacingChange = (value: number[]) => {
    const spacingMappings = ['compact', 'normal', 'spacious'];
    const spacing = spacingMappings[value[0]] as 'compact' | 'normal' | 'spacious';
    onDesignChange({ ...currentDesign, spacing });
  };

  const handleMarginsChange = (value: number[]) => {
    const marginMappings = ['narrow', 'normal', 'wide'];
    const margins = marginMappings[value[0]] as 'narrow' | 'normal' | 'wide';
    onDesignChange({ ...currentDesign, margins });
  };

  // Map size/spacing string values to slider values
  const getSizeValue = () => {
    return currentDesign.fontSize === 'small' ? 0 : currentDesign.fontSize === 'medium' ? 1 : 2;
  };

  const getSpacingValue = () => {
    return currentDesign.spacing === 'compact' ? 0 : currentDesign.spacing === 'normal' ? 1 : 2;
  };

  const getMarginsValue = () => {
    return currentDesign.margins === 'narrow' ? 0 : currentDesign.margins === 'normal' ? 1 : 2;
  };

  return (
    <div className="p-4 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700">
      <Tabs defaultValue="colors">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="colors">
            <Palette className="h-4 w-4 mr-2" />
            Colors
          </TabsTrigger>
          <TabsTrigger value="typography">
            <Type className="h-4 w-4 mr-2" />
            Typography
          </TabsTrigger>
          <TabsTrigger value="layout">
            <Maximize className="h-4 w-4 mr-2" />
            Layout
          </TabsTrigger>
        </TabsList>

        <TabsContent value="colors" className="space-y-4">
          <div className="space-y-2">
            <Label>Accent Color</Label>
            <div className="grid grid-cols-6 gap-2">
              {COLOR_PRESETS.map((color) => (
                <button
                  key={color.value}
                  className="w-full aspect-square rounded-full border border-neutral-200 dark:border-neutral-700"
                  style={{ backgroundColor: color.value }}
                  onClick={() => handleColorChange(color.value)}
                  aria-label={`Set ${color.name} as accent color`}
                >
                  {color.value === currentDesign.accentColor && (
                    <div className="flex items-center justify-center h-full">
                      <div className="h-2 w-2 bg-white dark:bg-neutral-200 rounded-full shadow-sm" />
                    </div>
                  )}
                </button>
              ))}
            </div>
            <div className="mt-2">
              <input
                type="color"
                value={currentDesign.accentColor}
                onChange={(e) => handleColorChange(e.target.value)}
                className="w-full h-8 rounded cursor-pointer"
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="typography" className="space-y-4">
          <div className="space-y-2">
            <Label>Font</Label>
            <div className="grid grid-cols-2 gap-2">
              {FONT_FAMILIES.map((font) => (
                <button
                  key={font.value}
                  className={`py-2 px-3 rounded-md text-sm transition-all ${
                    currentDesign.fontFamily === font.value
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted hover:bg-muted/80'
                  }`}
                  style={{ fontFamily: font.value }}
                  onClick={() => handleFontFamilyChange(font.value)}
                >
                  {font.name}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label>Font Size</Label>
              <span className="text-xs text-muted-foreground capitalize">
                {currentDesign.fontSize}
              </span>
            </div>
            <Slider
              value={[getSizeValue()]}
              min={0}
              max={2}
              step={1}
              onValueChange={handleFontSizeChange}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Small</span>
              <span>Medium</span>
              <span>Large</span>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="layout" className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label>Line Spacing</Label>
              <span className="text-xs text-muted-foreground capitalize">
                {currentDesign.spacing}
              </span>
            </div>
            <Slider
              value={[getSpacingValue()]}
              min={0}
              max={2}
              step={1}
              onValueChange={handleSpacingChange}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Compact</span>
              <span>Normal</span>
              <span>Spacious</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label>Margins</Label>
              <span className="text-xs text-muted-foreground capitalize">
                {currentDesign.margins}
              </span>
            </div>
            <Slider
              value={[getMarginsValue()]}
              min={0}
              max={2}
              step={1}
              onValueChange={handleMarginsChange}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Narrow</span>
              <span>Normal</span>
              <span>Wide</span>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DesignCustomizer;
