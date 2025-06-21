import { supabase } from '@/integrations/supabase/client';
import { SUBSCRIPTION_LIMITS, SubscriptionLimits, SubscriptionTier, SubscriptionUsage } from '@/types/subscription';

// Cache for subscription usage data to prevent excessive DB calls
interface UsageCache {
  [key: string]: {
    data: SubscriptionUsage;
    timestamp: number;
    tier: SubscriptionTier; // Add tier to cache key to invalidate when tier changes
  }
}
const usageCache: UsageCache = {};

// Cache expiration time in ms (5 minutes)
const CACHE_EXPIRY = 5 * 60 * 1000;

/**
 * Get the date range for the current subscription period
 * This is used to accurately count interviews within the current billing cycle
 */
export const getSubscriptionPeriodRange = async (userId: string): Promise<{ startDate: string, endDate: string }> => {
  // Get the active subscription to determine the billing cycle
  const subscription = await getActiveSubscription(userId);
  
  if (subscription && subscription.start_date) {
    // If we have an active subscription, use its start and end dates for the period
    const startDate = new Date(subscription.start_date);
    
    let endDate: Date;
    if (subscription.end_date) {
      // If there's an end date, use it
      endDate = new Date(subscription.end_date);
    } else {
      // Otherwise, calculate an end date (1 month from start date)
      endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + 1);
      endDate.setSeconds(endDate.getSeconds() - 1); // End right before the next period starts
    }
    
    return {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    };
  } else {
    // Fallback to calendar month for users without active subscriptions
    return getCurrentMonthRange();
  }
};

/**
 * Get the current month's date range (start and end)
 * This is used as a fallback when there's no subscription data
 */
export const getCurrentMonthRange = (): { startDate: string, endDate: string } => {
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  
  return {
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString()
  };
};

/**
 * Get the limits for a specific subscription tier
 */
export const getSubscriptionLimits = (tier: SubscriptionTier): SubscriptionLimits => {
  return SUBSCRIPTION_LIMITS[tier] || SUBSCRIPTION_LIMITS.free;
};

/**
 * Force refresh the usage data cache for a user
 */
export const invalidateUsageCache = (userId: string): void => {
  delete usageCache[userId];
};

/**
 * Fetch the active subscription details for a user
 * @param userId The user ID
 * @param subscriptionType Optional parameter to filter by subscription type (interview or resume)
 */
export const getActiveSubscription = async (userId: string, subscriptionType?: 'interview' | 'resume') => {
  try {
    // Initialize the query
    let query = supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('payment_status', 'active');
    
    // Add subscription_type filter if provided
    if (subscriptionType) {
      query = query.eq('subscription_type', subscriptionType);
    }
    
    // Complete the query
    const { data, error } = await query
      .order('start_date', { ascending: false })
      .limit(1);
      
    if (error) {
      console.error('Error fetching active subscription:', error);
      return null;
    }
    
    // Return the first item if available
    if (data && data.length > 0) {
      return data[0];
    }
    
    return null;
  } catch (error) {
    console.error('Exception fetching active subscription:', error);
    return null;
  }
};

/**
 * Check if a user has reached their interview limits for the current period
 */
export const getSubscriptionUsage = async (userId: string, tier: SubscriptionTier, forceRefresh = false): Promise<SubscriptionUsage> => {
  // Check cache first
  const cacheKey = userId;
  const cachedData = usageCache[cacheKey];
  const now = Date.now();
  
  // Force refresh if tier changed or cache expired or force refresh requested
  const tierChanged = cachedData && cachedData.tier !== tier;
  if (forceRefresh || tierChanged || !cachedData || (now - cachedData.timestamp >= CACHE_EXPIRY)) {
    console.log('Refreshing subscription usage data');
    // Continue with actual data fetching
  } else {
    console.log('Using cached subscription usage data');
    return cachedData.data;
  }
  
  // For unlimited plans, we don't need to check usage
  const limits = getSubscriptionLimits(tier);
  
  try {
    // Get the subscription period range - this is now based on subscription dates
    const { startDate, endDate } = await getSubscriptionPeriodRange(userId);
    
    // Get standard interviews used in the current period
    const { count: standardCount, error: standardError } = await supabase
      .from('interviews')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('start_time', startDate)
      .lte('start_time', endDate);
      
    if (standardError) {
      console.error('Error fetching standard interview count:', standardError);
      throw standardError;
    }
    
    // Get advanced interviews used in the current period
    const { count: advancedCount, error: advancedError } = await supabase
      .from('advanced_interview_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'completed')
      .gte('created_at', startDate)
      .lte('created_at', endDate);
      
    if (advancedError) {
      console.error('Error fetching advanced interview count:', advancedError);
      throw advancedError;
    }
    
    // Get resumes created count within the current billing period
    const { count: resumesCount, error: resumesError } = await supabase
      .from('user_resumes')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', startDate)  // Count only resumes created in current billing period
      .lte('created_at', endDate);   // End date of current billing period
      
    if (resumesError) {
      console.error('Error fetching resumes count:', resumesError);
      throw resumesError;
    }
    
    // Get the active subscription for resumeUsage check
    const activeSubscription = await getActiveSubscription(
      userId, 
      tier.startsWith('resume_') ? 'resume' : 'interview'
    );
    
    // We're now using the current billing period for resume counting
    let resumesUsed = resumesCount || 0;
    
    const standardInterviewsUsed = standardCount || 0;
    const advancedInterviewsUsed = advancedCount || 0;
    
    // Calculate remaining interviews
    const standardInterviewsRemaining = limits.isUnlimited 
      ? -1  // -1 represents unlimited
      : Math.max(0, limits.standardInterviews - standardInterviewsUsed);
      
    const advancedInterviewsRemaining = limits.isUnlimited 
      ? -1  // -1 represents unlimited
      : Math.max(0, limits.advancedInterviews - advancedInterviewsUsed);
      
    // Calculate remaining resumes
    const resumesRemaining = limits.maxResumes < 0
      ? -1  // -1 represents unlimited
      : Math.max(0, limits.maxResumes - resumesUsed);
    
    // Determine next reset or renewal date
    let nextResetDate: Date | null = null;
    
    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);
    
    if (activeSubscription && activeSubscription.end_date) {
      // If there's an active subscription with an end date, use that as the next renewal
      nextResetDate = new Date(activeSubscription.end_date);
    }
    
    const usageData = {
      standardInterviewsUsed,
      advancedInterviewsUsed,
      standardInterviewsRemaining,
      advancedInterviewsRemaining,
      resumesUsed,
      resumesRemaining,
      currentPeriodStart: startDateObj,
      currentPeriodEnd: endDateObj,
      nextReset: nextResetDate
    };
    
    // Cache the result with the tier
    usageCache[cacheKey] = {
      data: usageData,
      timestamp: now,
      tier: tier
    };
    
    return usageData;
  } catch (error) {
    console.error('Error in getSubscriptionUsage:', error);
    // Return default usage in case of error
    const defaultUsage = {
      standardInterviewsUsed: 0,
      advancedInterviewsUsed: 0,
      standardInterviewsRemaining: limits.isUnlimited ? -1 : limits.standardInterviews,
      advancedInterviewsRemaining: limits.isUnlimited ? -1 : limits.advancedInterviews,
      resumesUsed: 0,
      resumesRemaining: limits.maxResumes < 0 ? -1 : limits.maxResumes,
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(),
      nextReset: null
    };
    
    // Don't cache error results
    return defaultUsage;
  }
};

/**
 * Get the correct tier to use for interview features
 * This ensures resume-only subscribers have no interview access
 */
export const getEffectiveInterviewTier = async (userId: string, currentTier: SubscriptionTier): Promise<SubscriptionTier> => {
  // If it's already a known interview tier, return it as is
  if (['free', 'bronze', 'gold', 'diamond', 'megastar'].includes(currentTier)) {
    return currentTier;
  }
  
  // For resume-specific tiers, check if user has any interview plan
  const interviewSubscription = await getActiveSubscription(userId, 'interview');
  
  // If they have an active interview subscription, use that
  if (interviewSubscription && interviewSubscription.payment_status === 'active') {
    return interviewSubscription.plan_type as SubscriptionTier;
  }
  
  // For resume-only subscribers, return 'no_interviews' tier to disable interview access
  // This ensures resume-only plans cannot access interview features
  return 'no_interviews';
};

/**
 * Check if user can start a standard interview
 */
export const canStartStandardInterview = async (userId: string, tier: SubscriptionTier): Promise<boolean> => {
  // Get the correct tier for interview permissions
  const interviewTier = await getEffectiveInterviewTier(userId, tier);
  
  // Get the active subscription to check status
  const interviewSubscription = await getActiveSubscription(userId, 'interview');
  
  // If subscription is suspended, don't allow new interviews
  if (interviewSubscription && interviewSubscription.payment_status === 'suspended') {
    return false;
  }
  
  const limits = getSubscriptionLimits(interviewTier);
  
  // If plan has unlimited interviews, allow
  if (limits.isUnlimited) {
    return true;
  }
  
  // Use the correct tier for usage check
  const usage = await getSubscriptionUsage(userId, interviewTier);
  return usage.standardInterviewsRemaining > 0;
};

/**
 * Check if user can start an advanced interview
 */
export const canStartAdvancedInterview = async (userId: string, tier: SubscriptionTier): Promise<boolean> => {
  // Get the correct tier for interview permissions
  const interviewTier = await getEffectiveInterviewTier(userId, tier);
  
  // Get the active subscription to check status
  const interviewSubscription = await getActiveSubscription(userId, 'interview');
  
  // If subscription is suspended, don't allow new interviews
  if (interviewSubscription && interviewSubscription.payment_status === 'suspended') {
    return false;
  }
  
  const limits = getSubscriptionLimits(interviewTier);
  
  // If plan has unlimited interviews, allow
  if (limits.isUnlimited) {
    return true;
  }
  
  // Use the correct tier for usage check
  const usage = await getSubscriptionUsage(userId, interviewTier);
  return usage.advancedInterviewsRemaining > 0;
};

/**
 * Check if user can download resumes
 * Updated to also allow Gold, Diamond, and Megastar plans to download resumes
 */
export const canDownloadResume = async (userId: string, tier: SubscriptionTier): Promise<boolean> => {
  // Get the active subscription to check status
  const subscription = await getActiveSubscription(userId);
  
  // If subscription is suspended, don't allow new downloads
  if (subscription && subscription.payment_status === 'suspended') {
    return false;
  }
  
  const limits = getSubscriptionLimits(tier);
  
  // If plan has unlimited downloads (resumeDownloads === -1), allow
  if (limits.resumeDownloads === -1) {
    return true;
  }
  
  // For plans with limited downloads (like free plan with 50 downloads), check usage
  if (limits.resumeDownloads > 0) {
    const usage = await getSubscriptionUsage(userId, tier);
    // For download limits, we would need to track downloads separately
    // For now, we'll allow downloads if the plan includes them
    return true;
  }
  
  // Check for resume-specific subscription tiers
  if (tier.startsWith('resume_')) {
    return true;
  }
  
  return false;
};

/**
 * Check if user can create more resumes
 * Updated to check limits for all tiers that can create resumes 
 */
export const canCreateResume = async (userId: string, tier: SubscriptionTier): Promise<boolean> => {
  // Determine which subscription type to check
  const subscriptionType = tier.startsWith('resume_') ? 'resume' : 'interview';
  
  // Get the active subscription to check status, filtering by the appropriate type
  const subscription = await getActiveSubscription(userId, subscriptionType);
  
  // If subscription is suspended, don't allow new resume creation over limits
  if (subscription && subscription.payment_status === 'suspended') {
    const usage = await getSubscriptionUsage(userId, tier);
    // Only block if they're at or over limit
    if (usage.resumesRemaining !== undefined && usage.resumesRemaining <= 0) {
      return false;
    }
  }
  
  const limits = getSubscriptionLimits(tier);
  
  // If plan has unlimited resumes, allow
  if (limits.maxResumes === -1) {
    return true;
  }
  
  const usage = await getSubscriptionUsage(userId, tier);
  return usage.resumesRemaining !== undefined && usage.resumesRemaining > 0;
};

/**
 * Gets comprehensive subscription status, checking both interview and resume subscriptions
 * @param userId The user ID
 * @returns Object containing subscription details for both interview and resume plans
 */
export const getComprehensiveSubscriptionStatus = async (userId: string) => {
  try {
    // Get all active subscriptions for the user
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .in('payment_status', ['active', 'suspended'])
      .order('start_date', { ascending: false });
      
    if (error) {
      console.error('Error fetching subscriptions:', error);
      return { hasInterviewPlan: false, hasResumePlan: false };
    }
    
    // Check if user has any active subscription
    const interviewPlan = data?.find(sub => 
      sub.subscription_type === 'interview' && sub.payment_status === 'active');
    
    const resumePlan = data?.find(sub => 
      sub.subscription_type === 'resume' && sub.payment_status === 'active');
    
    return {
      hasInterviewPlan: !!interviewPlan,
      hasResumePlan: !!resumePlan,
      interviewPlan,
      resumePlan,
      // Check if the interview plan includes resume features
      interviewPlanIncludesResume: interviewPlan ? 
        ['gold', 'diamond', 'megastar'].includes(interviewPlan.plan_type) : false
    };
  } catch (error) {
    console.error('Error in getComprehensiveSubscriptionStatus:', error);
    return { hasInterviewPlan: false, hasResumePlan: false };
  }
};