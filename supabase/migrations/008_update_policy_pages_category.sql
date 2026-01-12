-- Migration: Add category_id FK to client_policy_pages
-- Phase: 4.6
-- Date: 2024-12-01
-- Purpose: Link policy pages to dynamic categories instead of hardcoded policy_type strings

-- Add category_id FK (coexists with policy_type during migration period)
ALTER TABLE client_policy_pages
ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES client_policy_categories(id);

-- Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_client_policy_pages_category 
ON client_policy_pages(category_id);

-- Comments
COMMENT ON COLUMN client_policy_pages.category_id IS 'FK to client_policy_categories - replaces policy_type string';

-- Note: policy_type column is kept for backward compatibility during migration
-- Queries should transition to using category_id
-- After full migration, policy_type can be deprecated
