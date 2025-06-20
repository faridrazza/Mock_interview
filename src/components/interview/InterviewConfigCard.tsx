import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play } from 'lucide-react';
import JobRoleSelector from './JobRoleSelector';
import ExperienceLevelSelector, { mapYearsToExperienceLevel } from './ExperienceLevelSelector';
import { InterviewConfiguration } from '@/types/interview';

interface InterviewConfigCardProps {
  interviewConfig: {
    jobRole: string;
    experienceLevel: 'fresher' | 'intermediate' | 'senior';
    yearsOfExperience: number;
  };
  setInterviewConfig: React.Dispatch<React.SetStateAction<InterviewConfiguration>>;
  uiExperienceLevel: 'fresher' | 'experienced';
  setUiExperienceLevel: React.Dispatch<React.SetStateAction<'fresher' | 'experienced'>>;
  handleStartInterview: () => void;
  disabled?: boolean;
}

const InterviewConfigCard = ({
  interviewConfig,
  setInterviewConfig,
  uiExperienceLevel,
  setUiExperienceLevel,
  handleStartInterview,
  disabled = false
}: InterviewConfigCardProps) => {

  const handleJobRoleChange = (jobRole: string) => {
    setInterviewConfig({...interviewConfig, jobRole});
  };

  const handleExperienceLevelChange = (value: 'fresher' | 'experienced') => {
    setUiExperienceLevel(value);
    
    if (value === 'fresher') {
      setInterviewConfig({
        ...interviewConfig, 
        experienceLevel: 'fresher',
        yearsOfExperience: 0
      });
    } else {
      // Initialize with 0 to allow the user to enter their own value
      const years = 0;
      setInterviewConfig({
        ...interviewConfig,
        yearsOfExperience: years,
        experienceLevel: 'fresher' // Default to fresher until user sets experience
      });
    }
  };

  const handleYearsChange = (years: number) => {
    setInterviewConfig({
      ...interviewConfig, 
      yearsOfExperience: years,
      experienceLevel: mapYearsToExperienceLevel(years)
    });
  };

  return (
    <Card className="border-neutral-200 dark:border-neutral-800 shadow-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Interview Setup</CardTitle>
        <CardDescription>
          Configure your interview session to get the most relevant questions for your target role
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-8">
        <JobRoleSelector 
          jobRole={interviewConfig.jobRole} 
          onJobRoleChange={handleJobRoleChange} 
        />

        <ExperienceLevelSelector 
          uiExperienceLevel={uiExperienceLevel}
          onExperienceLevelChange={handleExperienceLevelChange}
          yearsOfExperience={interviewConfig.yearsOfExperience}
          onYearsChange={handleYearsChange}
          experienceLevel={interviewConfig.experienceLevel}
        />
      </CardContent>
      
      <CardFooter>
        <Button 
          className="w-full gap-2 bg-gradient-to-r from-brand-500 to-purple-600 hover:from-brand-600 hover:to-purple-700"
          onClick={handleStartInterview}
          size="lg"
          disabled={disabled}
        >
          <Play size={18} />
          Start Interview
        </Button>
      </CardFooter>
    </Card>
  );
};

export default InterviewConfigCard;
