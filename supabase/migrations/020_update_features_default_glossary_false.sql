-- Migration: Update features JSONB default - set show_glossary to false
-- Description: Changes the default value for show_glossary from true to false
-- The glossary is a shared resource controlled by feature flag
-- Date: 2025-12-07

-- Update the default value for the features column
-- This changes show_glossary default from true to false
ALTER TABLE client_websites 
ALTER COLUMN features SET DEFAULT '{
  "show_blog": true,
  "show_glossary": false,
  "show_faq_page": true,
  "show_careers_page": true,
  "show_social_links": true,
  "show_business_hours": true,
  "multi_location": false
}'::jsonb;

-- Update existing records that have show_glossary = true to false
-- Only if they haven't been explicitly configured (optional - comment out if you want to preserve existing settings)
-- UPDATE client_websites 
-- SET features = jsonb_set(features, '{show_glossary}', 'false')
-- WHERE features->>'show_glossary' = 'true';

COMMENT ON COLUMN client_websites.features IS 'Feature flags JSONB - show_glossary defaults to false (shared resource)';
