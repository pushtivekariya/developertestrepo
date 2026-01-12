-- Migration: Add OG and Twitter image URL columns to client_websites
-- Phase: 4.5
-- Date: 2024-12-01
-- Purpose: Support per-client social sharing images (OpenGraph & Twitter Cards)

-- Add OpenGraph image URL column
ALTER TABLE client_websites 
ADD COLUMN IF NOT EXISTS og_image_url TEXT;

-- Add Twitter card image URL column
ALTER TABLE client_websites 
ADD COLUMN IF NOT EXISTS twitter_image_url TEXT;

-- Add comments for documentation
COMMENT ON COLUMN client_websites.og_image_url IS 'OpenGraph image URL for social sharing (1200x630 recommended)';
COMMENT ON COLUMN client_websites.twitter_image_url IS 'Twitter card image URL (1200x600 recommended)';
