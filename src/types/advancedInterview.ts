
import { InterviewMessage } from './interview';

export interface CompanyInterviewQuestion {
  id?: string;
  questionText: string;
  references: string[];
  year: string;
  category: 'Technical' | 'Behavioral' | 'System Design' | 'Problem Solving' | 'Leadership';
}

export interface InterviewSuggestion {
  title: string;
  description: string;
}

export interface AdvancedInterviewConfiguration {
  jobRole: string;
  companyName: string;
  questions: CompanyInterviewQuestion[];
  suggestions: InterviewSuggestion[];
}

export interface AdvancedInterviewSession {
  id: string;
  userId: string;
  configuration: AdvancedInterviewConfiguration;
  messages: InterviewMessage[];
  startTime: Date;
  endTime?: Date;
  status: 'active' | 'completed' | 'cancelled';
  feedback?: InterviewFeedback;
}

export interface InterviewFeedback {
  overallScore: number;
  strengths: string[];
  improvements: string[];
  technicalAccuracy: number;
  communicationClarity: number;
  confidence: number;
  detailedFeedback: string;
}
