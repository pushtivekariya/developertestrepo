-- Migration: Create client_policy_categories table for dynamic policy categories
-- Phase: 4.6
-- Date: 2024-12-01
-- Purpose: Replace hardcoded policy category folders with database-driven categories

CREATE TABLE IF NOT EXISTS client_policy_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  
  -- Category identification
  slug TEXT NOT NULL,              -- URL slug: 'personal', 'commercial', 'specialty'
  display_name TEXT NOT NULL,      -- "Personal Insurance", "Business Coverage"
  
  -- Metadata (supports template variables)
  meta_title TEXT,
  meta_description TEXT,
  og_image_url TEXT,
  
  -- Page content
  hero_heading TEXT,
  hero_subheading TEXT,
  description TEXT,                -- Longer description for the category
  
  -- Display settings
  icon_url TEXT,                   -- Category icon
  sort_order INTEGER DEFAULT 0,
  published BOOLEAN DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  -- Unique constraint: one slug per client
  UNIQUE(client_id, slug)
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_client_policy_categories_lookup 
ON client_policy_categories(client_id, slug);

CREATE INDEX IF NOT EXISTS idx_client_policy_categories_list 
ON client_policy_categories(client_id, published, sort_order);

-- RLS
ALTER TABLE client_policy_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access for policy categories"
ON client_policy_categories FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can manage policy categories"
ON client_policy_categories FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Comments
COMMENT ON TABLE client_policy_categories IS 'Dynamic policy categories per client - replaces hardcoded category folders';
COMMENT ON COLUMN client_policy_categories.slug IS 'URL slug used in routes: /policies/{slug}/';
COMMENT ON COLUMN client_policy_categories.display_name IS 'Human-readable category name shown on pages';
COMMENT ON COLUMN client_policy_categories.meta_title IS 'SEO title - supports template variables like {agencyName}';
