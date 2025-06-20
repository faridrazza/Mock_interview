
import React, { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Briefcase } from 'lucide-react';

// Job roles list
const JOB_ROLES = [
  "Software Engineer",
  "Data Scientist",
  "Product Manager",
  "UX Designer",
  "Marketing Specialist",
  "Sales Representative",
  "Customer Support",
  "HR Manager",
  "Financial Analyst",
  "Project Manager",
  "Business Analyst",
  "DevOps Engineer",
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer"
];

interface JobRoleSelectorProps {
  jobRole: string;
  onJobRoleChange: (jobRole: string) => void;
}

const JobRoleSelector = ({ jobRole, onJobRoleChange }: JobRoleSelectorProps) => {
  const [inputMode, setInputMode] = useState<'select' | 'manual'>(jobRole && !JOB_ROLES.includes(jobRole) ? 'manual' : 'select');
  const [searchInput, setSearchInput] = useState<string>('');

  // Filter job roles based on search input
  const filteredJobRoles = JOB_ROLES.filter(role => 
    role.toLowerCase().includes(searchInput.toLowerCase())
  );

  const handleRoleSelect = (value: string) => {
    onJobRoleChange(value);
    setInputMode('select');
  };

  const handleManualInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    onJobRoleChange(e.target.value);
    setInputMode('manual');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Briefcase className="h-5 w-5 text-brand-500" />
        <h3 className="text-lg font-medium">Job Role</h3>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="job-role">Select job role</Label>
        <Select 
          onValueChange={handleRoleSelect} 
          value={inputMode === 'select' ? jobRole : undefined}
        >
          <SelectTrigger id="job-role" className={inputMode === 'manual' ? 'opacity-50' : ''}>
            <SelectValue placeholder="Select a job role" />
          </SelectTrigger>
          <SelectContent>
            <div className="px-3 py-2">
              <Input 
                placeholder="Search job roles..." 
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="mb-2"
              />
            </div>
            {filteredJobRoles.map((role) => (
              <SelectItem key={role} value={role}>{role}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <Separator className="w-full" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-background px-2 text-xs text-muted-foreground">
            OR
          </span>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="manual-job-role">Enter job role manually</Label>
        <Input 
          id="manual-job-role"
          placeholder="e.g., Python Developer, Java, AI"
          value={inputMode === 'manual' ? jobRole : ''}
          onChange={handleManualInput}
          className={inputMode === 'select' ? 'opacity-50' : ''}
        />
      </div>
    </div>
  );
};

export default JobRoleSelector;
