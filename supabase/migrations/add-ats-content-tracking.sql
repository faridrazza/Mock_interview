-- Add fields to track content changes and prevent unnecessary ATS re-analysis
-- This migration improves ATS score consistency by tracking when content was last analyzed

-- Add comment to document the improvement
COMMENT ON DATABASE postgres IS 'Added ATS content tracking fields to prevent score fluctuations on unchanged content';

-- The content_hash and analyzed_at fields are now stored within the JSON content field
-- as part of the ats_analysis object. No schema changes needed as we're using the 
-- existing flexible JSON structure.

-- However, we can add an index to improve query performance on the ats_score field
-- since it's used frequently for filtering and sorting resumes

CREATE INDEX IF NOT EXISTS idx_user_resumes_ats_score ON user_resumes(ats_score) WHERE ats_score IS NOT NULL;

-- Add an index on updated_at for tracking when resumes were last modified
CREATE INDEX IF NOT EXISTS idx_user_resumes_updated_at ON user_resumes(updated_at);

-- Add an index on user_id + updated_at for user's resume history
CREATE INDEX IF NOT EXISTS idx_user_resumes_user_updated ON user_resumes(user_id, updated_at);

-- Update the comment on the content column to document the new ats_analysis structure
COMMENT ON COLUMN user_resumes.content IS 'Resume content in JSON format. The ats_analysis object includes content_hash and analyzed_at fields for preventing unnecessary re-analysis of unchanged content.';

-- Update the comment on ats_score to clarify its relationship with content analysis
COMMENT ON COLUMN user_resumes.ats_score IS 'ATS compatibility score (0-100). Updated when ats_analysis is performed on the content.'; 