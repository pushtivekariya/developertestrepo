-- Migration: Create client_page_metadata table for customizable per-page metadata
-- Phase: 4.6
-- Date: 2024-12-01
-- Purpose: Store customizable meta titles, descriptions, and hero content per page per client

CREATE TABLE IF NOT EXISTS client_page_metadata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  location_id UUID REFERENCES client_locations(id) ON DELETE CASCADE,  -- NULL for shared/single-location
  page_key TEXT NOT NULL,  -- 'home', 'about', 'blog', 'contact', 'policies', 'faq', 'glossary', 'our-team'
  
  -- Metadata (supports template variables like {agencyName}, {city}, {state})
  meta_title TEXT,
  meta_description TEXT,
  og_image_url TEXT,
  
  -- Page content (supports template variables)
  hero_heading TEXT,
  hero_subheading TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  -- Unique constraint: one record per page per client (or per location)
  UNIQUE(client_id, location_id, page_key)
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_client_page_metadata_lookup 
ON client_page_metadata(client_id, location_id, page_key);

-- RLS
ALTER TABLE client_page_metadata ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access for page metadata"
ON client_page_metadata FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can manage page metadata"
ON client_page_metadata FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Comments
COMMENT ON TABLE client_page_metadata IS 'Per-page customizable metadata and hero content for each client/location';
COMMENT ON COLUMN client_page_metadata.page_key IS 'Page identifier: home, about, blog, contact, policies, faq, glossary, our-team, locations';
COMMENT ON COLUMN client_page_metadata.location_id IS 'NULL for single-location clients or shared pages; set for location-specific pages';
COMMENT ON COLUMN client_page_metadata.meta_title IS 'Page title - supports template variables like {agencyName}, {city}';
COMMENT ON COLUMN client_page_metadata.meta_description IS 'Meta description - supports template variables';
