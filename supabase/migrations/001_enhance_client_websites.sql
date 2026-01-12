-- Migration: Enhance client_websites with location data and FK to client_locations
-- Phase: 1
-- Date: 2024-12-01

-- Add FK reference to client_locations (for address info)
ALTER TABLE client_websites 
ADD COLUMN IF NOT EXISTS location_id UUID REFERENCES client_locations(id);

-- Add URL slug for routing (/locations/houston-tx/)
-- NULL allowed for single-location clients (enables future expansion)
ALTER TABLE client_websites 
ADD COLUMN IF NOT EXISTS slug TEXT;

-- Add geo coordinates
ALTER TABLE client_websites 
ADD COLUMN IF NOT EXISTS latitude NUMERIC(10, 7);

ALTER TABLE client_websites 
ADD COLUMN IF NOT EXISTS longitude NUMERIC(10, 7);

-- Add contact information
ALTER TABLE client_websites 
ADD COLUMN IF NOT EXISTS phone TEXT;

ALTER TABLE client_websites 
ADD COLUMN IF NOT EXISTS secondary_phone TEXT;

ALTER TABLE client_websites 
ADD COLUMN IF NOT EXISTS sms_phone TEXT;

ALTER TABLE client_websites 
ADD COLUMN IF NOT EXISTS sms_default_message TEXT;

ALTER TABLE client_websites 
ADD COLUMN IF NOT EXISTS email TEXT;

-- Add service radius for LD-JSON (meters)
ALTER TABLE client_websites 
ADD COLUMN IF NOT EXISTS service_radius_meters INTEGER DEFAULT 25000;

-- Add JSONB columns for structured data
ALTER TABLE client_websites 
ADD COLUMN IF NOT EXISTS business_hours JSONB DEFAULT '{}'::jsonb;

ALTER TABLE client_websites 
ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '{}'::jsonb;

ALTER TABLE client_websites 
ADD COLUMN IF NOT EXISTS service_areas JSONB DEFAULT '[]'::jsonb;

-- Add SEO metadata (page-level)
ALTER TABLE client_websites 
ADD COLUMN IF NOT EXISTS meta_title TEXT;

ALTER TABLE client_websites 
ADD COLUMN IF NOT EXISTS meta_description TEXT;

-- Create unique constraint on slug per client
ALTER TABLE client_websites 
ADD CONSTRAINT client_websites_client_slug_unique 
UNIQUE (client_id, slug);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_client_websites_slug 
ON client_websites (client_id, slug);

CREATE INDEX IF NOT EXISTS idx_client_websites_location 
ON client_websites (location_id);

-- Add comments for documentation
COMMENT ON COLUMN client_websites.location_id IS 'FK to client_locations for physical address info';
COMMENT ON COLUMN client_websites.slug IS 'URL slug for multi-location routing (e.g., houston-tx). NULL for single-location clients.';
COMMENT ON COLUMN client_websites.business_hours IS 'JSON object with days as keys, open/close times or closed flag';
COMMENT ON COLUMN client_websites.social_links IS 'JSON object with platform names as keys, URLs as values';
COMMENT ON COLUMN client_websites.service_areas IS 'JSON array of city names served by this location';
