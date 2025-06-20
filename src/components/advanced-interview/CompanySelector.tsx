
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface CompanySelectorProps {
  companyName: string;
  onCompanyNameChange: (company: string) => void;
}

const CompanySelector: React.FC<CompanySelectorProps> = ({ 
  companyName, 
  onCompanyNameChange 
}) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="company-name">Target Company</Label>
      <Input
        id="company-name"
        placeholder="Enter company name (e.g., Amazon, Google, Microsoft)"
        value={companyName}
        onChange={(e) => onCompanyNameChange(e.target.value)}
        className="w-full"
      />
      {companyName && (
        <p className="text-sm text-muted-foreground">
          Preparing for an interview at <span className="font-medium">{companyName}</span>
        </p>
      )}
    </div>
  );
};

export default CompanySelector;
