import { SubscriptionTier, SubscriptionStatus } from '@/types/subscription';

/**
 * Determines if a subscription tier already includes resume features
 * @param tier The subscription tier to check
 * @returns True if the tier includes resume features
 */
export const tierIncludesResumeFeatures = (tier: SubscriptionTier): boolean => {
  return ['gold', 'diamond', 'megastar'].includes(tier);
};

/**
 * Determines if a user's subscription combination has redundancy
 * @param interviewTier The user's interview subscription tier
 * @param resumeTier The user's resume-specific subscription tier
 * @param resumeStatus The status of the resume subscription
 * @returns True if the subscriptions are redundant (user is paying twice for same features)
 */
export const hasRedundantSubscriptions = (
  interviewTier: SubscriptionTier,
  resumeTier: SubscriptionTier,
  resumeStatus?: SubscriptionStatus
): boolean => {
  // If the user doesn't have a resume-specific plan, there's no redundancy
  if (!resumeTier || resumeTier === 'free') {
    return false;
  }
  
  // If the resume subscription is canceled, expired, or in a non-active state, don't consider it redundant
  if (resumeStatus && ['canceled', 'expired', 'payment_failed', 'suspended'].includes(resumeStatus)) {
    return false;
  }
  
  // If the user has a Gold, Diamond or Megastar plan, and also has a resume plan,
  // then there is redundancy since those plans already include resume features
  return tierIncludesResumeFeatures(interviewTier);
};

/**
 * Returns a user-friendly message explaining the redundancy
 * @param interviewTier The user's interview subscription tier
 * @param resumeTier The user's resume-specific subscription tier
 * @param resumeStatus The status of the resume subscription
 * @returns A message explaining the redundancy, or null if no redundancy
 */
export const getRedundancyMessage = (
  interviewTier: SubscriptionTier,
  resumeTier: SubscriptionTier,
  resumeStatus?: SubscriptionStatus
): string | null => {
  if (!hasRedundantSubscriptions(interviewTier, resumeTier, resumeStatus)) {
    return null;
  }

  let tierName = '';
  switch (interviewTier) {
    case 'gold':
      tierName = 'Gold';
      break;
    case 'diamond':
      tierName = 'Diamond';
      break;
    case 'megastar':
      tierName = 'Megastar';
      break;
    default:
      return null;
  }

  return `Your ${tierName} plan already includes resume features. You don't need to pay for a separate Resume ${resumeTier === 'resume_basic' ? 'Basic' : 'Premium'} plan.`;
};
