import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Building, Calendar } from 'lucide-react';

// Experience level thresholds in years
export const EXPERIENCE_THRESHOLDS = {
  INTERMEDIATE: 3, // 0-2 years: fresher, 3-5: intermediate
  SENIOR: 6        // 6+ years: senior
};

// Map years of experience to the three-level classification
export const mapYearsToExperienceLevel = (years: number): 'fresher' | 'intermediate' | 'senior' => {
  if (years === 0) return 'fresher';
  if (years < EXPERIENCE_THRESHOLDS.INTERMEDIATE) return 'fresher';
  if (years < EXPERIENCE_THRESHOLDS.SENIOR) return 'intermediate';
  return 'senior';
};

interface ExperienceLevelSelectorProps {
  uiExperienceLevel: 'fresher' | 'experienced';
  onExperienceLevelChange: (level: 'fresher' | 'experienced') => void;
  yearsOfExperience: number;
  onYearsChange: (years: number) => void;
  experienceLevel: 'fresher' | 'intermediate' | 'senior';
}

const ExperienceLevelSelector = ({
  uiExperienceLevel,
  onExperienceLevelChange,
  yearsOfExperience,
  onYearsChange,
  experienceLevel
}: ExperienceLevelSelectorProps) => {

  const handleYearsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Handle empty input case
    if (value === '') {
      onYearsChange(0);
      return;
    }
    
    const years = parseInt(value);
    if (!isNaN(years) && years >= 0) {
      onYearsChange(years);
    }
  };

  // Get experience level badge display
  const getExperienceLevelBadge = () => {
    if (uiExperienceLevel === 'fresher') return null;

    const level = experienceLevel;
    let badgeClass = "text-xs font-medium mr-2 px-2.5 py-0.5 rounded ";
    let levelText = "";

    switch (level) {
      case 'fresher':
        badgeClass += "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
        levelText = "Entry Level";
        break;
      case 'intermediate':
        badgeClass += "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
        levelText = "Intermediate";
        break;
      case 'senior':
        badgeClass += "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
        levelText = "Senior";
        break;
    }

    return (
      <span className={badgeClass}>
        {levelText}
      </span>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Calendar className="h-5 w-5 text-brand-500" />
        <h3 className="text-lg font-medium">Experience Level</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div 
          className={`
            p-4 rounded-lg border cursor-pointer flex items-center gap-3
            ${uiExperienceLevel === 'fresher' 
              ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300' 
              : 'border-neutral-200 dark:border-neutral-700 hover:border-brand-300 dark:hover:border-brand-700'}
          `}
          onClick={() => onExperienceLevelChange('fresher')}
        >
          <div className="h-10 w-10 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center text-brand-600 dark:text-brand-400">
            <User size={20} />
          </div>
          <div>
            <p className="font-medium">Fresher</p>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">New to the industry</p>
          </div>
        </div>
        
        <div 
          className={`
            p-4 rounded-lg border cursor-pointer flex items-center gap-3
            ${uiExperienceLevel === 'experienced' 
              ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300' 
              : 'border-neutral-200 dark:border-neutral-700 hover:border-brand-300 dark:hover:border-brand-700'}
          `}
          onClick={() => onExperienceLevelChange('experienced')}
        >
          <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
            <Building size={20} />
          </div>
          <div>
            <p className="font-medium">Experienced</p>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">Professional experience</p>
          </div>
        </div>
      </div>
      
      {uiExperienceLevel === 'experienced' && (
        <div className="space-y-2 pt-2">
          <div className="flex items-center">
            <Label htmlFor="years-experience" className="mr-2">Years of experience</Label>
            {getExperienceLevelBadge()}
          </div>
          <Input 
            id="years-experience"
            type="number"
            min="0"
            value={yearsOfExperience === 0 ? '' : yearsOfExperience}
            onChange={handleYearsChange}
            placeholder="Enter years of experience"
          />
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            {yearsOfExperience > 0 && (
              <>
                {yearsOfExperience < EXPERIENCE_THRESHOLDS.INTERMEDIATE && 
                  "Entry level: 1-2 years experience"}
                {yearsOfExperience >= EXPERIENCE_THRESHOLDS.INTERMEDIATE && 
                 yearsOfExperience < EXPERIENCE_THRESHOLDS.SENIOR && 
                  "Intermediate level: 3-5 years experience"}
                {yearsOfExperience >= EXPERIENCE_THRESHOLDS.SENIOR && 
                  "Senior level: 6+ years experience"}
              </>
            )}
          </p>
        </div>
      )}
    </div>
  );
};

export default ExperienceLevelSelector;
