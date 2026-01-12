-- Migration: Add policies_section column to client_location_page
-- Purpose: Store featured policies configuration for location landing pages
-- DO NOT APPLY without explicit approval

ALTER TABLE client_location_page
ADD COLUMN IF NOT EXISTS policies_section JSONB DEFAULT NULL;

-- Add comment for documentation
COMMENT ON COLUMN client_location_page.policies_section IS 'JSONB settings for Featured Policies section: heading, subheading, featured_policy_ids (array of UUIDs), show_section (boolean)';

-- Example structure:
-- {
--   "heading": "Featured Insurance Policies",
--   "subheading": "Explore coverage options available at this location",
--   "featured_policy_ids": ["uuid1", "uuid2", "uuid3", "uuid4"],
--   "show_section": true
-- }
