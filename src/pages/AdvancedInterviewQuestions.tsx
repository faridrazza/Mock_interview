
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, ArrowLeft, FileDown } from 'lucide-react';
import QuestionsTable from '@/components/advanced-interview/QuestionsTable';
import PdfExport from '@/components/advanced-interview/PdfExport';
import { CompanyInterviewQuestion, InterviewSuggestion, AdvancedInterviewConfiguration } from '@/types/advancedInterview';
import { useToast } from '@/hooks/use-toast';

const AdvancedInterviewQuestions = () => {
  const [config, setConfig] = useState<AdvancedInterviewConfiguration | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  useEffect(() => {
    // Get interview configuration from location state
    if (location.state?.interviewConfig) {
      setConfig(location.state.interviewConfig);
    } else {
      // Try to get from session storage as fallback
      const savedConfig = sessionStorage.getItem('advancedInterviewConfig');
      if (savedConfig) {
        try {
          setConfig(JSON.parse(savedConfig));
        } catch (error) {
          console.error('Error parsing saved config:', error);
          toast({
            title: 'Error loading interview data',
            description: 'Could not load the interview questions. Please try again.',
            variant: 'destructive',
          });
          // Navigate back to config page after short delay
          setTimeout(() => navigate('/advanced-interview/config'), 1500);
        }
      } else {
        // No data available, redirect back to config
        toast({
          title: 'No interview data',
          description: 'No interview questions found. Please generate new questions.',
          variant: 'destructive',
        });
        navigate('/advanced-interview/config');
      }
    }
  }, [location, navigate, toast]);

  const handleStartInterview = () => {
    if (config) {
      sessionStorage.setItem('advancedInterviewConfig', JSON.stringify(config));
      navigate('/advanced-interview/session');
    }
  };

  const handleBackToConfig = () => {
    navigate('/advanced-interview/config');
  };

  if (!config) {
    return (
      <div className="container max-w-4xl py-8 text-center">
        <p>Loading interview questions...</p>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-8">
      <Button 
        variant="outline" 
        className="mb-6" 
        onClick={handleBackToConfig}
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Setup
      </Button>
      
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-3xl font-bold">
            {config.companyName} {config.jobRole} Interview
          </h1>
          <div className="flex space-x-3">
            <PdfExport 
              jobRole={config.jobRole}
              companyName={config.companyName}
              questions={config.questions}
              suggestions={config.suggestions}
            />
            
            <Button 
              onClick={handleStartInterview} 
              className="gap-2 bg-brand-500 hover:bg-brand-600"
            >
              <Play size={16} />
              Take Interview
            </Button>
          </div>
        </div>
        
        <QuestionsTable 
          questions={config.questions} 
          suggestions={config.suggestions} 
        />
      </div>
    </div>
  );
};

export default AdvancedInterviewQuestions;
