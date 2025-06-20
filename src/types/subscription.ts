export type SubscriptionTier = 'bronze' | 'gold' | 'diamond' | 'megastar' | 'free' | 'resume_basic' | 'resume_premium' | 'no_interviews';
export type SubscriptionStatus = 'active' | 'expired' | 'canceled' | 'trial' | 'payment_failed' | 'suspended';

export interface SubscriptionLimits {
  standardInterviews: number;
  advancedInterviews: number;
  resumeDownloads: number;  // -1 means enabled/unlimited
  maxResumes: number;       // -1 means unlimited
  isUnlimited: boolean;
}

export interface SubscriptionFeatures {
  includesResume: boolean;
  includesInterviews: boolean;
  isInterviewUnlimited: boolean;
  maxResumeCount: number; // -1 means unlimited
}

export interface SubscriptionUsage {
  standardInterviewsUsed: number;
  advancedInterviewsUsed: number;
  standardInterviewsRemaining: number;
  advancedInterviewsRemaining: number;
  resumesUsed?: number;
  resumesRemaining?: number;
  currentPeriodStart: Date | null;
  currentPeriodEnd: Date | null;
  nextReset: Date | null;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan_type: SubscriptionTier;
  payment_status: string;
  start_date: string;
  end_date: string | null;
  payment_provider_subscription_id: string | null;
}

export const SUBSCRIPTION_LIMITS: Record<SubscriptionTier, SubscriptionLimits> = {
  bronze: {
    standardInterviews: 1,
    advancedInterviews: 1,
    resumeDownloads: 0,
    maxResumes: 3,
    isUnlimited: false
  },
  free: {
    standardInterviews: 1,
    advancedInterviews: 1,
    resumeDownloads: 0,
    maxResumes: 1,
    isUnlimited: false
  },
  gold: {
    standardInterviews: 30,
    advancedInterviews: 21,
    resumeDownloads: -1, // Enable resume downloads for Gold
    maxResumes: 15,      // Allow 15 resumes per month for Gold
    isUnlimited: false
  },
  diamond: {
    standardInterviews: 0,
    advancedInterviews: 0,
    resumeDownloads: -1, // Enable resume downloads for Diamond
    maxResumes: 50,      // Allow 50 resumes per month for Diamond
    isUnlimited: true
  },
  megastar: {
    standardInterviews: 0,
    advancedInterviews: 0,
    resumeDownloads: -1, // Enable resume downloads for Megastar
    maxResumes: -1,      // Unlimited resumes for Megastar (yearly Diamond)
    isUnlimited: true
  },
  resume_basic: {
    standardInterviews: 0,
    advancedInterviews: 0,
    resumeDownloads: -1,
    maxResumes: 15,
    isUnlimited: false
  },
  resume_premium: {
    standardInterviews: 0,
    advancedInterviews: 0,
    resumeDownloads: -1,
    maxResumes: 50,
    isUnlimited: false
  },
  no_interviews: {
    standardInterviews: 0,
    advancedInterviews: 0,
    resumeDownloads: -1,
    maxResumes: 0,       // This will be overridden by the actual plan's maxResumes
    isUnlimited: false
  }
};

// Add a mapping of which subscription tiers include which features
export const SUBSCRIPTION_FEATURES: Record<SubscriptionTier, SubscriptionFeatures> = {
  free: {
    includesResume: false,
    includesInterviews: true,
    isInterviewUnlimited: false,
    maxResumeCount: 1
  },
  bronze: {
    includesResume: false,
    includesInterviews: true,
    isInterviewUnlimited: false,
    maxResumeCount: 3
  },
  gold: {
    includesResume: true,
    includesInterviews: true,
    isInterviewUnlimited: false,
    maxResumeCount: 15
  },
  diamond: {
    includesResume: true,
    includesInterviews: true,
    isInterviewUnlimited: true,
    maxResumeCount: 50
  },
  megastar: {
    includesResume: true,
    includesInterviews: true,
    isInterviewUnlimited: true,
    maxResumeCount: -1
  },
  resume_basic: {
    includesResume: true,
    includesInterviews: false,
    isInterviewUnlimited: false,
    maxResumeCount: 15
  },
  resume_premium: {
    includesResume: true,
    includesInterviews: false,
    isInterviewUnlimited: false,
    maxResumeCount: 50
  },
  no_interviews: {
    includesResume: true,
    includesInterviews: false,
    isInterviewUnlimited: false,
    maxResumeCount: 0    // This will be overridden by the actual plan's maxResumeCount
  }
};

export const Constants = {
  public: {
    Enums: {
      subscription_status: ["active", "expired", "canceled", "trial", "payment_failed", "suspended"],
      subscription_tier: ["bronze", "gold", "diamond", "free", "megastar", "resume_basic", "resume_premium", "no_interviews"],
    },
  },
} as const 
