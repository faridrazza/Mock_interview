import React from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { InterviewFeedback as InterviewFeedbackType } from '@/types/interview';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, AlertCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface FeedbackCardProps {
  label: string;
  score: number;
  colorClass: string;
}

const FeedbackScoreCard = ({ label, score, colorClass }: FeedbackCardProps) => {
  return (
    <div className="bg-white dark:bg-neutral-800 rounded-lg p-4 shadow-sm">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-medium">{label}</h3>
        <Badge className={colorClass}>
          {score}/10
        </Badge>
      </div>
      <Progress value={score * 10} className="h-2" />
    </div>
  );
};

interface InterviewFeedbackProps {
  feedback: InterviewFeedbackType | null;
  isLoading: boolean;
  onGenerateFeedback: () => void;
  error?: string | null;
}

const InterviewFeedback = ({ feedback, isLoading, onGenerateFeedback, error }: InterviewFeedbackProps) => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className="gap-2"
          onClick={() => {
            if (!feedback && !isLoading) {
              onGenerateFeedback();
            }
          }}
        >
          <MessageSquare size={16} />
          Feedback
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle>Interview Feedback</SheetTitle>
          <SheetDescription>
            Performance assessment and improvement recommendations
          </SheetDescription>
        </SheetHeader>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-500"></div>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Analyzing your interview responses...
            </p>
          </div>
        ) : error ? (
          <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg space-y-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium text-red-600 dark:text-red-400">Feedback generation failed</h3>
                <p className="text-sm text-red-700 dark:text-red-300 mt-1">{error}</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              onClick={onGenerateFeedback}
              className="w-full"
            >
              Try Again
            </Button>
          </div>
        ) : feedback ? (
          <div className="space-y-6">
            {/* Overall score section */}
            <div className="bg-gradient-to-r from-brand-500 to-purple-600 rounded-lg p-6 text-white">
              <h2 className="text-xl font-bold mb-2">Overall Score</h2>
              <div className="flex items-end gap-2">
                <span className="text-4xl font-bold">{feedback.overallScore}</span>
                <span className="text-xl">/10</span>
              </div>
            </div>
            
            {/* Score breakdown */}
            <div className="space-y-3">
              <h3 className="text-lg font-medium mb-2">Performance Breakdown</h3>
              
              <FeedbackScoreCard 
                label="Technical Accuracy" 
                score={feedback.technicalAccuracy} 
                colorClass={feedback.technicalAccuracy >= 8 ? "bg-green-500" : feedback.technicalAccuracy >= 5 ? "bg-yellow-500" : "bg-red-500"}
              />
              
              <FeedbackScoreCard 
                label="Communication Clarity" 
                score={feedback.communicationClarity} 
                colorClass={feedback.communicationClarity >= 8 ? "bg-green-500" : feedback.communicationClarity >= 5 ? "bg-yellow-500" : "bg-red-500"}
              />
              
              <FeedbackScoreCard 
                label="Confidence" 
                score={feedback.confidence} 
                colorClass={feedback.confidence >= 8 ? "bg-green-500" : feedback.confidence >= 5 ? "bg-yellow-500" : "bg-red-500"}
              />
            </div>
            
            {/* Strengths section */}
            <div>
              <h3 className="text-lg font-medium mb-3">Strengths</h3>
              <ul className="space-y-2">
                {feedback.strengths.map((strength, index) => (
                  <li key={index} className="flex gap-2 items-start">
                    <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 rounded-full p-1 mt-0.5">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    <span className="text-sm">{strength}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Areas for improvement */}
            <div>
              <h3 className="text-lg font-medium mb-3">Areas for Improvement</h3>
              <ul className="space-y-2">
                {feedback.improvements.map((improvement, index) => (
                  <li key={index} className="flex gap-2 items-start">
                    <span className="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-100 rounded-full p-1 mt-0.5">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </span>
                    <span className="text-sm">{improvement}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Detailed feedback */}
            <div>
              <h3 className="text-lg font-medium mb-3">Detailed Feedback</h3>
              <div className="bg-neutral-50 dark:bg-neutral-800 p-4 rounded-lg text-sm">
                <p className="whitespace-pre-line">{feedback.detailedFeedback}</p>
              </div>
            </div>
            
            {feedback.experienceLevelMatch !== undefined && (
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-3">Experience Level Assessment</h3>
                <div className="flex items-center mb-3">
                  <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2.5">
                    <div 
                      className="bg-brand-600 h-2.5 rounded-full" 
                      style={{ width: `${feedback.experienceLevelMatch * 10}%` }}
                    ></div>
                  </div>
                  <span className="ml-3 font-medium">{feedback.experienceLevelMatch}/10</span>
                </div>
                {feedback.experienceAssessment && (
                  <div className="bg-neutral-50 dark:bg-neutral-800 p-4 rounded-lg text-sm mt-2">
                    <p className="whitespace-pre-line">{feedback.experienceAssessment}</p>
                  </div>
                )}
              </div>
            )}
            
            {feedback.hiringRecommendation && (
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-3">Hiring Recommendation</h3>
                <div className={`
                  p-3 rounded-lg font-medium text-center
                  ${feedback.hiringRecommendation === 'Highly Recommend' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : ''}
                  ${feedback.hiringRecommendation === 'Recommend' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' : ''}
                  ${feedback.hiringRecommendation === 'Consider' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' : ''}
                  ${feedback.hiringRecommendation === 'Do Not Recommend' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' : ''}
                `}>
                  {feedback.hiringRecommendation}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <p className="text-center text-neutral-500 dark:text-neutral-400">
              Click the button below to generate feedback for your interview performance.
            </p>
            <Button onClick={onGenerateFeedback}>Generate Feedback</Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default InterviewFeedback;
