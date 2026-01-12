-- Migration: Add location_policies_section_settings column to client_theme_settings
-- Purpose: Allow admins to customize colors for the Location/Policies section on the home page
-- DO NOT APPLY without explicit approval

ALTER TABLE client_theme_settings
ADD COLUMN IF NOT EXISTS location_policies_section_settings JSONB DEFAULT NULL;

-- Add comment for documentation
COMMENT ON COLUMN client_theme_settings.location_policies_section_settings IS 'JSONB settings for Location/Policies section: section bg, badge colors, heading colors, card colors, accent line, button colors, link colors';
