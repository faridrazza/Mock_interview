// AWS Lambda Configuration for MockInterview4u Hackathon
// This file configures the frontend to use AWS Lambda functions instead of Supabase

export interface LambdaConfig {
  baseUrl: string;
  endpoints: {
    generateQuestion: string;
    generateFeedback: string;
    textToSpeech: string;
    speechToText: string;
    advancedInterview: string;
    generateCompanyQuestions: string;
    enhanceResume: string;
    atsAnalysis: string;
    createResume: string;
  };
  timeout: number;
  retryAttempts: number;
}

// Debug environment variables
console.log('🔍 DEBUG Environment Variables:');
console.log('MODE:', import.meta.env.MODE);
console.log('VITE_HACKATHON_MODE:', import.meta.env.VITE_HACKATHON_MODE);
console.log('VITE_LAMBDA_BASE_URL:', import.meta.env.VITE_LAMBDA_BASE_URL);
console.log('VITE_USE_LAMBDA:', import.meta.env.VITE_USE_LAMBDA);

// Environment-based configuration
const isDevelopment = import.meta.env.MODE === 'development';
const isHackathonDemo = import.meta.env.VITE_HACKATHON_MODE === 'true';

// Lambda base URL (will be updated after deployment)
const LAMBDA_BASE_URL = import.meta.env.VITE_LAMBDA_BASE_URL || 
  'https://apb59k8zqg.execute-api.us-east-1.amazonaws.com/prod';

// Fallback to Supabase in development unless hackathon mode is enabled
const USE_LAMBDA = isHackathonDemo || import.meta.env.VITE_USE_LAMBDA === 'true';

console.log('🔍 DEBUG Computed Values:');
console.log('isDevelopment:', isDevelopment);
console.log('isHackathonDemo:', isHackathonDemo);
console.log('LAMBDA_BASE_URL:', LAMBDA_BASE_URL);
console.log('USE_LAMBDA:', USE_LAMBDA);

export const lambdaConfig: LambdaConfig = {
  baseUrl: LAMBDA_BASE_URL,
  endpoints: {
    generateQuestion: '/generate-interview-question',
    generateFeedback: '/generate-interview-feedback',
    textToSpeech: '/text-to-speech',
    speechToText: '/speech-to-text',
    advancedInterview: '/advanced-interview-ai',
    generateCompanyQuestions: '/generate-company-questions',
    enhanceResume: '/enhance-resume',
    atsAnalysis: '/ats-analysis',
    createResume: '/create-resume',
  },
  timeout: 60000, // 60 seconds (increased for Transcribe processing)
  retryAttempts: 2,
};

/**
 * AWS Lambda API client for interview functions
 */
export class LambdaApiClient {
  private config: LambdaConfig;

  constructor(config: LambdaConfig = lambdaConfig) {
    this.config = config;
  }

  /**
   * Generate interview question using AWS Lambda
   */
  async generateInterviewQuestion(payload: {
    jobRole: string;
    experienceLevel: string;
    yearsOfExperience: number;
    conversationHistory?: Array<{ role: string; content: string }>;
    difficulty?: string;
    categories?: string[];
  }) {
    return this.makeRequest(this.config.endpoints.generateQuestion, payload);
  }

  /**
   * Generate interview feedback using AWS Lambda
   */
  async generateInterviewFeedback(payload: {
    jobRole: string;
    experienceLevel: string;
    conversation: Array<{ role: string; content: string }>;
    yearsOfExperience?: number;
    companyName?: string; // Add company name for Advanced AI feedback
  }) {
    return this.makeRequest(this.config.endpoints.generateFeedback, payload);
  }

  /**
   * Convert text to speech using Amazon Polly
   */
  async textToSpeech(payload: {
    text: string;
    voice?: string;
    speed?: number;
    generateLipSync?: boolean;
  }) {
    return this.makeRequest(this.config.endpoints.textToSpeech, payload);
  }

  /**
   * Convert speech to text using Amazon Transcribe
   */
  async speechToText(payload: {
    audio: string; // base64 encoded audio
  }) {
    return this.makeRequest(this.config.endpoints.speechToText, payload);
  }

  /**
   * Advanced interview AI conversation
   */
  async advancedInterview(payload: {
    jobRole: string;
    companyName: string;
    questions?: any[];
    conversationHistory?: Array<{ role: string; content: string }>;
  }) {
    return this.makeRequest(this.config.endpoints.advancedInterview, payload);
  }

  /**
   * Generate company-specific interview questions
   */
  async generateCompanyQuestions(payload: {
    jobRole: string;
    companyName: string;
  }) {
    return this.makeRequest(this.config.endpoints.generateCompanyQuestions, payload);
  }

  /**
   * Enhance resume content using AI
   */
  async enhanceResume(payload: {
    resumeContent: any;
    sectionType: string;
    jobDescription?: string;
    targetRole?: string;
    improvement_suggestions?: string[];
    missing_keywords?: string[];
  }) {
    return this.makeRequest(this.config.endpoints.enhanceResume, payload);
  }

  /**
   * Analyze resume for ATS compatibility
   */
  async atsAnalysis(payload: {
    resumeContent: any;
    jobDescription?: string;
    resumeId?: string;
    forceReAnalysis?: boolean;
    templateId?: string;
    isPublicUpload?: boolean;
    isAutoAnalysis?: boolean;
  }) {
    return this.makeRequest(this.config.endpoints.atsAnalysis, payload);
  }

  /**
   * Create resume record (migrated from Supabase Edge Function)
   */
  async createResume(payload: {
    title: string;
    content: any;
    originalText?: string;
    jobDescription?: string;
    selectedTemplate?: string;
    atsScore?: number;
  }, authToken?: string) {
    // Use makeRequestWithAuth for authenticated requests
    return this.makeRequestWithAuth(this.config.endpoints.createResume, payload, authToken);
  }



  /**
   * Make HTTP request to Lambda function with error handling and retries
   */
  private async makeRequest(endpoint: string, payload: any, attempt: number = 1): Promise<any> {
    const url = `${this.config.baseUrl}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(this.config.timeout),
      });

      if (!response.ok) {
        throw new Error(`Lambda request failed: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Lambda request error (attempt ${attempt}):`, error);
      
      // Retry logic
      if (attempt < this.config.retryAttempts) {
        console.log(`Retrying Lambda request... (${attempt + 1}/${this.config.retryAttempts})`);
        await this.delay(1000 * attempt); // Exponential backoff
        return this.makeRequest(endpoint, payload, attempt + 1);
      }
      
      throw new Error(`Lambda request failed after ${this.config.retryAttempts} attempts: ${error.message}`);
    }
  }

  /**
   * Make HTTP request with authentication to Lambda function with error handling and retries
   */
  private async makeRequestWithAuth(endpoint: string, payload: any, authToken?: string, attempt: number = 1): Promise<any> {
    const url = `${this.config.baseUrl}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Add authorization header if token is provided
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(this.config.timeout),
      });

      if (!response.ok) {
        throw new Error(`Lambda request failed: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Lambda authenticated request error (attempt ${attempt}):`, error);
      
      // Retry logic
      if (attempt < this.config.retryAttempts) {
        console.log(`Retrying Lambda authenticated request... (${attempt + 1}/${this.config.retryAttempts})`);
        await this.delay(1000 * attempt); // Exponential backoff
        return this.makeRequestWithAuth(endpoint, payload, authToken, attempt + 1);
      }
      
      throw new Error(`Lambda authenticated request failed after ${this.config.retryAttempts} attempts: ${error.message}`);
    }
  }

  /**
   * Make HTTP request with FormData to Lambda function with error handling and retries
   */
  private async makeRequestWithFormData(endpoint: string, formData: FormData, attempt: number = 1): Promise<any> {
    const url = `${this.config.baseUrl}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
        signal: AbortSignal.timeout(this.config.timeout),
      });

      if (!response.ok) {
        throw new Error(`Lambda request failed: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Lambda FormData request error (attempt ${attempt}):`, error);
      
      // Retry logic
      if (attempt < this.config.retryAttempts) {
        console.log(`Retrying Lambda FormData request... (${attempt + 1}/${this.config.retryAttempts})`);
        await this.delay(1000 * attempt); // Exponential backoff
        return this.makeRequestWithFormData(endpoint, formData, attempt + 1);
      }
      
      throw new Error(`Lambda FormData request failed after ${this.config.retryAttempts} attempts: ${error.message}`);
    }
  }

  /**
   * Delay utility for retry logic
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Global instance
export const lambdaApi = new LambdaApiClient();

/**
 * Hook to determine which backend to use (Lambda vs Supabase)
 */
export const useBackendConfig = () => {
  return {
    useLambda: USE_LAMBDA,
    lambdaConfig,
    lambdaApi,
  };
};

/**
 * Migration utility to switch between Supabase and Lambda
 */
export const createMigrationWrapper = <T extends any[], R>(
  supabaseFunction: (...args: T) => Promise<R>,
  lambdaFunction: (...args: T) => Promise<R>
) => {
  return async (...args: T): Promise<R> => {
    if (USE_LAMBDA) {
      try {
        return await lambdaFunction(...args);
      } catch (error) {
        console.error('Lambda function failed, falling back to Supabase:', error);
        // Fallback to Supabase if Lambda fails (for smooth transition)
        return await supabaseFunction(...args);
      }
    }
    return await supabaseFunction(...args);
  };
};

// Logging for hackathon demonstration
if (isHackathonDemo) {
  console.log('🚀 AWS Lambda Hackathon Mode Enabled!');
  console.log('📡 Lambda Base URL:', LAMBDA_BASE_URL);
  console.log('⚡ Using AWS Lambda functions for AI processing');
} 