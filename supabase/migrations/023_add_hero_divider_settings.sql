-- Migration: Add hero_divider_settings column to client_theme_settings
-- Purpose: Allow admins to choose between solid divider and trust badge divider below hero section
-- DO NOT APPLY without explicit approval

ALTER TABLE client_theme_settings
ADD COLUMN IF NOT EXISTS hero_divider_settings JSONB DEFAULT NULL;

-- Add comment for documentation
COMMENT ON COLUMN client_theme_settings.hero_divider_settings IS 'JSONB settings for hero section divider: type (solid/trust_badges), badges array, colors, and sizing';
