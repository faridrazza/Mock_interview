import { Resume, ResumeContent } from '@/types/resume';

/**
 * Returns the appropriate Tailwind color class based on the ATS score
 */
export const getScoreColorClass = (score: number): string => {
  if (score >= 80) {
    return 'bg-green-500';
  } else if (score >= 60) {
    return 'bg-yellow-500';
  } else if (score >= 40) {
    return 'bg-orange-500';
  } else {
    return 'bg-red-500';
  }
};

/**
 * Creates a simple hash of resume content for change detection
 */
export const createResumeContentHash = (content: ResumeContent, jobDescription: string = ''): string => {
  // Create a normalized representation that excludes the ats_analysis field to avoid circular hashing
  const { ats_analysis, ...contentForHashing } = content;
  
  const normalizedContent = JSON.stringify({
    content: contentForHashing,
    jobDescription: jobDescription.trim().toLowerCase()
  }, Object.keys(contentForHashing).sort()); // Sort keys for consistency
  
  // Simple hash function
  let hash = 0;
  for (let i = 0; i < normalizedContent.length; i++) {
    const char = normalizedContent.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36);
};

/**
 * Checks if resume content has changed since last ATS analysis
 */
export const hasContentChangedSinceAnalysis = (
  content: ResumeContent, 
  jobDescription: string = ''
): boolean => {
  if (!content.ats_analysis || !content.ats_analysis.content_hash) {
    return true; // No previous analysis, so consider it changed
  }
  
  const currentHash = createResumeContentHash(content, jobDescription);
  return currentHash !== content.ats_analysis.content_hash;
};

/**
 * Checks if ATS analysis is recent (within specified minutes)
 */
export const isAnalysisRecent = (content: ResumeContent, withinMinutes: number = 5): boolean => {
  if (!content.ats_analysis?.analyzed_at) {
    return false;
  }
  
  const analysisTime = new Date(content.ats_analysis.analyzed_at).getTime();
  const cutoffTime = Date.now() - (withinMinutes * 60 * 1000);
  
  return analysisTime > cutoffTime;
};

/**
 * Determines if ATS re-analysis should be suggested to the user
 */
export const shouldSuggestReAnalysis = (
  content: ResumeContent, 
  jobDescription: string = ''
): { shouldSuggest: boolean; reason: string } => {
  // If no analysis exists, suggest it
  if (!content.ats_analysis) {
    return { shouldSuggest: true, reason: 'No ATS analysis available' };
  }
  
  // If content has changed, suggest re-analysis
  if (hasContentChangedSinceAnalysis(content, jobDescription)) {
    return { shouldSuggest: true, reason: 'Content has changed since last analysis' };
  }
  
  // If analysis is very old (more than 30 days), suggest re-analysis
  if (content.ats_analysis.analyzed_at) {
    const daysSinceAnalysis = (Date.now() - new Date(content.ats_analysis.analyzed_at).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceAnalysis > 30) {
      return { shouldSuggest: true, reason: 'Analysis is over 30 days old' };
    }
  }
  
  return { shouldSuggest: false, reason: 'Analysis is current' };
};

/**
 * Returns descriptive text based on ATS score
 */
export const getScoreDescription = (score: number): string => {
  if (score >= 80) {
    return 'Excellent';
  } else if (score >= 60) {
    return 'Good';
  } else if (score >= 40) {
    return 'Fair';
  } else {
    return 'Poor';
  }
};

/**
 * Returns recommendations based on ATS score
 */
export const getScoreRecommendations = (score: number): string[] => {
  if (score >= 80) {
    return [
      'Your resume is well-optimized for ATS systems.',
      'Continue to tailor keywords for specific job applications.'
    ];
  } else if (score >= 60) {
    return [
      'Consider adding more industry-specific keywords.',
      'Make sure your achievements are quantifiable.',
      'Check for any formatting inconsistencies.'
    ];
  } else {
    return [
      'Add more relevant keywords from the job description.',
      'Use standard section headings (Experience, Education, Skills).',
      'Remove any images, charts, or complex formatting.',
      'Ensure your work experience highlights relevant skills.',
      'Quantify your achievements with numbers and metrics.'
    ];
  }
};
