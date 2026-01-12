-- Migration: Add service_areas column to client_locations
-- Description: Adds service_areas text[] column to store nearby cities for location-specific content generation
-- Date: 2025-12-05

-- Add service_areas column to client_locations table
ALTER TABLE client_locations 
ADD COLUMN IF NOT EXISTS service_areas text[] DEFAULT '{}';

-- Add comment for documentation
COMMENT ON COLUMN client_locations.service_areas IS 'Array of nearby cities/areas served by this location, used for content generation';
