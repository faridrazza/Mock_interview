import React, { useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import OverviewTab from './OverviewTab';
import InterviewsTab from './InterviewsTab';
import ResumesTab from '@/components/resume/ResumesTab';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Briefcase, Building } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { invalidateUsageCache } from '@/utils/subscriptionUtils';

interface DashboardTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  showResumePlans?: boolean;
}

const DashboardTabs = ({ activeTab, setActiveTab, showResumePlans = false }: DashboardTabsProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Handle tab change to ensure data freshness
  const handleTabChange = (value: string) => {
    // If switching to resumes tab, invalidate the cache to ensure fresh data
    if (value === 'resumes' && user) {
      console.log('Tab changed to resumes, ensuring fresh data');
      invalidateUsageCache(user.id);
    }
    
    setActiveTab(value);
    
    // Update the URL to reflect the tab change while preserving existing query parameters
    const currentParams = new URLSearchParams(window.location.search);
    currentParams.set('tab', value);
    navigate(`/dashboard?${currentParams.toString()}`, { replace: true });
  };

  return (
    <Tabs defaultValue="overview" value={activeTab} onValueChange={handleTabChange} className="space-y-8">
      <div className="flex justify-between items-center overflow-x-auto">
        <TabsList className="bg-white dark:bg-neutral-800 p-1 shadow-sm w-full max-w-md mx-auto flex">
          <TabsTrigger 
            value="overview" 
            className="flex-1 text-xs sm:text-sm px-2 sm:px-4 data-[state=active]:bg-brand-50 dark:data-[state=active]:bg-brand-900/20 data-[state=active]:text-brand-600 dark:data-[state=active]:text-brand-400"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger 
            value="interviews" 
            className="flex-1 text-xs sm:text-sm px-2 sm:px-4 data-[state=active]:bg-brand-50 dark:data-[state=active]:bg-brand-900/20 data-[state=active]:text-brand-600 dark:data-[state=active]:text-brand-400"
          >
            Interviews
          </TabsTrigger>
          <TabsTrigger 
            value="resumes" 
            className="flex-1 text-xs sm:text-sm px-2 sm:px-4 data-[state=active]:bg-brand-50 dark:data-[state=active]:bg-brand-900/20 data-[state=active]:text-brand-600 dark:data-[state=active]:text-brand-400"
          >
            Resumes
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="overview">
        <OverviewTab />
      </TabsContent>

      <TabsContent value="interviews">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <Link to="/interview/config">
            <Button 
              variant="outline" 
              className="w-full h-auto py-4 sm:py-6 flex flex-col items-center justify-center gap-2 border-neutral-200 dark:border-neutral-800"
            >
              <Briefcase className="h-6 w-6 sm:h-8 sm:w-8 text-brand-500 dark:text-brand-400" />
              <div className="text-center">
                <h3 className="font-medium text-sm sm:text-base">Standard Interview</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">Practice with role-based questions</p>
              </div>
            </Button>
          </Link>
          
          <Link to="/advanced-interview/config">
            <Button 
              variant="outline" 
              className="w-full h-auto py-4 sm:py-6 flex flex-col items-center justify-center gap-2 border-neutral-200 dark:border-neutral-800"
            >
              <Building className="h-6 w-6 sm:h-8 sm:w-8 text-purple-500 dark:text-purple-400" />
              <div className="text-center">
                <h3 className="font-medium text-sm sm:text-base">Advanced Interview</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">Company-specific interview prep</p>
              </div>
            </Button>
          </Link>
        </div>
        
        <InterviewsTab />
      </TabsContent>

      <TabsContent value="resumes">
        <ResumesTab />
      </TabsContent>
    </Tabs>
  );
};

export default DashboardTabs;
