-- Migration: Create client_business_info table
-- Phase 6: Business-specific content that varies by client
-- DO NOT APPLY - Migration file only

CREATE TABLE IF NOT EXISTS client_business_info (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  
  -- Business history
  founding_year INTEGER,                    -- e.g., 1967
  years_in_business_text TEXT,              -- e.g., "over 55 years"
  
  -- Branding
  slogan TEXT,                              -- e.g., "Your Trusted Insurance Partner"
  tagline TEXT,                             -- Short tagline for headers
  
  -- Regional descriptors (template variables supported)
  regional_descriptor TEXT,                 -- e.g., "{state} Gulf Coast" or "Greater {city} Area"
  service_area_description TEXT,            -- e.g., "{city} and surrounding communities"
  
  -- About content (template variables supported)
  about_short TEXT,                         -- Short about text for snippets/meta descriptions
  about_long TEXT,                          -- Full about page content
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  -- One business info record per client
  UNIQUE(client_id)
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_client_business_info_client 
ON client_business_info(client_id);

-- Enable RLS
ALTER TABLE client_business_info ENABLE ROW LEVEL SECURITY;

-- Public read access policy
CREATE POLICY "Public read access" ON client_business_info
FOR SELECT USING (true);

-- Comments
COMMENT ON TABLE client_business_info IS 'Business-specific content per client: founding year, slogan, regional descriptors, about content';
COMMENT ON COLUMN client_business_info.founding_year IS 'Year the business was founded';
COMMENT ON COLUMN client_business_info.years_in_business_text IS 'Human-readable years in business text, e.g. "over 55 years"';
COMMENT ON COLUMN client_business_info.slogan IS 'Business slogan with template variable support';
COMMENT ON COLUMN client_business_info.regional_descriptor IS 'Regional descriptor like "{state} Gulf Coast" for use in content';
COMMENT ON COLUMN client_business_info.about_short IS 'Short about text for meta descriptions and snippets';
COMMENT ON COLUMN client_business_info.about_long IS 'Full about page content';
