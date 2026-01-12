-- Migration: Add location support to client_insurance_glossary
-- Description: Adds client_id and location_id columns for multi-location glossary filtering
-- Date: 2025-12-05

-- Add client_id column with foreign key reference
ALTER TABLE client_insurance_glossary 
ADD COLUMN IF NOT EXISTS client_id uuid REFERENCES clients(id);

-- Add location_id column with foreign key reference
ALTER TABLE client_insurance_glossary 
ADD COLUMN IF NOT EXISTS location_id uuid REFERENCES client_locations(id);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_client_insurance_glossary_client_id 
ON client_insurance_glossary(client_id);

CREATE INDEX IF NOT EXISTS idx_client_insurance_glossary_location_id 
ON client_insurance_glossary(location_id);

-- Add comments for documentation
COMMENT ON COLUMN client_insurance_glossary.client_id IS 'Foreign key to clients table for multi-tenant filtering';
COMMENT ON COLUMN client_insurance_glossary.location_id IS 'Foreign key to client_locations for location-specific glossary terms';
