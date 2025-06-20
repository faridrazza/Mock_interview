import { ResumeContent, ResumeSection } from '@/types/resume';

/**
 * Calculates a content volume score based on the amount of content in a resume
 * Higher scores mean more content
 */
export const calculateContentVolume = (content: ResumeContent): number => {
  let volumeScore = 0;
  
  // Summary adds to volume
  if (content.summary) {
    volumeScore += Math.min(30, content.summary.length / 10);
  }
  
  // Experience section is usually the largest
  if (content.experience) {
    content.experience.forEach(exp => {
      volumeScore += 10; // Base score for each entry
      volumeScore += exp.achievements.length * 5; // Each bullet point adds weight
    });
  }
  
  // Education
  if (content.education) {
    volumeScore += content.education.length * 8;
  }
  
  // Skills (compact representation but still takes space)
  if (content.skills) {
    volumeScore += Math.min(20, content.skills.length * 2);
  }
  
  // Certifications
  if (content.certifications) {
    volumeScore += content.certifications.length * 5;
  }
  
  // Projects
  if (content.projects) {
    content.projects.forEach(project => {
      volumeScore += 8;
      if (project.achievements) {
        volumeScore += project.achievements.length * 3;
      }
      if (project.technologies) {
        volumeScore += Math.min(10, project.technologies.length);
      }
    });
  }
  
  // Custom sections
  if (content.customSections) {
    content.customSections.forEach(section => {
      volumeScore += 5;
      volumeScore += section.items.length * 6;
      
      section.items.forEach(item => {
        if (item.bullets) {
          volumeScore += item.bullets.length * 3;
        }
      });
    });
  }
  
  return volumeScore;
};

/**
 * Adjusts spacing based on content volume
 * Returns spacing multipliers for section, entry, and item spacing
 */
export const getDynamicSpacing = (
  contentVolume: number,
  spacingPreference: 'compact' | 'normal' | 'spacious' = 'normal'
): {
  sectionSpacing: number;
  entrySpacing: number;
  itemSpacing: number;
  lineHeight: number;
} => {
  // Base values from spacing preference
  let baseSectionSpacing = 0;
  let baseEntrySpacing = 0;
  let baseItemSpacing = 0;
  let baseLineHeight = 0;
  
  switch(spacingPreference) {
    case 'compact':
      baseSectionSpacing = 8;
      baseEntrySpacing = 4;
      baseItemSpacing = 2;
      baseLineHeight = 1.2;
      break;
    case 'normal':
      baseSectionSpacing = 10;
      baseEntrySpacing = 6;
      baseItemSpacing = 3;
      baseLineHeight = 1.4;
      break;
    case 'spacious':
      baseSectionSpacing = 14;
      baseEntrySpacing = 8;
      baseItemSpacing = 4;
      baseLineHeight = 1.6;
      break;
  }
  
  // Volume thresholds for adjustment
  const lowVolume = 80;    // Resume with minimal content
  const mediumVolume = 150; // Average resume
  const highVolume = 250;   // Very detailed resume
  
  // Calculate multipliers based on content volume
  let multiplier = 1.0;
  
  if (contentVolume <= lowVolume) {
    // For low content, increase spacing to fill page
    multiplier = 1.5;
  } else if (contentVolume <= mediumVolume) {
    // Linear scale between 1.5 and 1.0 for low to medium content
    multiplier = 1.5 - (0.5 * (contentVolume - lowVolume) / (mediumVolume - lowVolume));
  } else if (contentVolume <= highVolume) {
    // Linear scale between 1.0 and 0.7 for medium to high content
    multiplier = 1.0 - (0.3 * (contentVolume - mediumVolume) / (highVolume - mediumVolume));
  } else {
    // For very high content, use compact spacing
    multiplier = 0.7;
  }
  
  // Calculate actual spacing values
  return {
    sectionSpacing: Math.max(2, Math.round(baseSectionSpacing * multiplier)),
    entrySpacing: Math.max(1, Math.round(baseEntrySpacing * multiplier)),
    itemSpacing: Math.max(1, Math.round(baseItemSpacing * multiplier)),
    lineHeight: Math.max(1.1, baseLineHeight * (multiplier * 0.9 + 0.1)) // Less aggressive adjustment for line height
  };
}; 