export interface InterviewConfiguration {
  jobRole: string;
  experienceLevel: 'fresher' | 'intermediate' | 'senior';
  yearsOfExperience: number;
  modelUrl?: string;
}

export interface InterviewMessage {
  id: string;
  sender: 'ai' | 'user';
  content: string;
  timestamp: Date;
  isLoading?: boolean;
}

export interface InterviewSession {
  id: string;
  userId: string;
  configuration: InterviewConfiguration;
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
  experienceLevelMatch?: number;
  experienceAssessment?: string;
  hiringRecommendation?: 'Highly Recommend' | 'Recommend' | 'Consider' | 'Do Not Recommend';
}
