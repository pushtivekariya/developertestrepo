-- Migration: Drop client_policy_categories table
-- This table is no longer used after removing dynamic policy categories from the codebase.
-- Policy pages now use a simplified /policies/{slug} URL structure.

-- First, remove the foreign key constraint from client_policy_pages
ALTER TABLE client_policy_pages 
DROP CONSTRAINT IF EXISTS client_policy_pages_category_id_fkey;

-- Drop the category_id column from client_policy_pages (optional - keeping for now as it may have data)
-- ALTER TABLE client_policy_pages DROP COLUMN IF EXISTS category_id;

-- Drop the client_policy_categories table
DROP TABLE IF EXISTS client_policy_categories;

-- Note: The policy_type column in client_policy_pages is intentionally kept
-- as it may be used for other purposes (filtering, display, etc.)
