-- Migration: Add llms_txt columns to clients table
-- Purpose: Store AI-generated base content for llms.txt (services section built dynamically on frontend)

ALTER TABLE clients
ADD COLUMN IF NOT EXISTS llms_txt TEXT,
ADD COLUMN IF NOT EXISTS generate_llms_txt BOOLEAN DEFAULT FALSE;

COMMENT ON COLUMN clients.llms_txt IS 'AI-generated base content for llms.txt (excludes services section which is built dynamically)';
COMMENT ON COLUMN clients.generate_llms_txt IS 'Trigger flag for n8n workflow to regenerate llms_txt';
