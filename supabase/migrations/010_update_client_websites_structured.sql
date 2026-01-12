-- Migration: Add form_placeholders and structured_data to client_websites
-- Phase 6: Additional fields for form customization and LD-JSON data
-- DO NOT APPLY - Migration file only

-- Add form_placeholders column for customizable form placeholder text
ALTER TABLE client_websites
ADD COLUMN IF NOT EXISTS form_placeholders JSONB DEFAULT '{}'::jsonb;

-- Add structured_data column for additional LD-JSON schema data
ALTER TABLE client_websites
ADD COLUMN IF NOT EXISTS structured_data JSONB DEFAULT '{}'::jsonb;

-- Comments
COMMENT ON COLUMN client_websites.form_placeholders IS 'Placeholder text for forms: { "city": "Enter city", "state": "TX", "zip": "77550" }';
COMMENT ON COLUMN client_websites.structured_data IS 'Additional structured data for LD-JSON schemas';
