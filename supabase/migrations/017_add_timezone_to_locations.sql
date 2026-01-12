-- Migration: Add timezone column to client_locations
-- Purpose: Store IANA timezone identifier for each location
-- Used for: Business hours display with timezone context, LD-JSON schemas
-- Date: 2024-12-05

-- Add timezone column with default for US Central Time
ALTER TABLE client_locations
ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'America/Chicago';

-- Add comment for documentation
COMMENT ON COLUMN client_locations.timezone IS 
'IANA timezone identifier (e.g., America/Chicago, America/New_York, America/Los_Angeles). Used for business hours display and LD-JSON openingHoursSpecification.';

-- Common US timezone values for reference:
-- America/New_York    - Eastern (NYC, Miami, Atlanta)
-- America/Chicago     - Central (Houston, Dallas, Chicago, Galveston)
-- America/Denver      - Mountain (Denver, Phoenix)
-- America/Los_Angeles - Pacific (LA, San Francisco, Seattle)
