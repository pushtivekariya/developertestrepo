-- Migration: Home Page Generation Support
-- Purpose: Add trigger column, location support, and database trigger for AI home page generation
-- Date: 2024-12-05

-- ============================================================
-- STEP 1: Add location_id to client_home_page
-- ============================================================
ALTER TABLE client_home_page
ADD COLUMN IF NOT EXISTS location_id UUID REFERENCES client_locations(id);

COMMENT ON COLUMN client_home_page.location_id IS 
'FK to client_locations. Required for multi-location support. Each location has its own home page content.';

-- Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_client_home_page_location 
ON client_home_page(client_id, location_id);

-- ============================================================
-- STEP 2: Add common_questions_section column
-- Note: Keeping faq_section for backward compatibility during transition
-- ============================================================
ALTER TABLE client_home_page
ADD COLUMN IF NOT EXISTS common_questions_section JSONB;

COMMENT ON COLUMN client_home_page.common_questions_section IS 
'AI-generated common questions section. Separate from FAQ page. Contains 3-5 standalone Q&As for home page context.';

-- ============================================================
-- STEP 3: Add generate_home_page trigger column to client_websites
-- ============================================================
ALTER TABLE client_websites
ADD COLUMN IF NOT EXISTS generate_home_page BOOLEAN NOT NULL DEFAULT false;

COMMENT ON COLUMN client_websites.generate_home_page IS 
'Trigger to generate home page content via OpenAI assistant. Set to true to trigger, auto-resets to false after completion.';

-- ============================================================
-- STEP 4: Create trigger function with prerequisite validation
-- ============================================================
CREATE OR REPLACE FUNCTION trigger_generate_home_page()
RETURNS TRIGGER AS $$
DECLARE
  business_info_complete BOOLEAN;
BEGIN
  -- Only trigger when generate_home_page changes from false/null to true
  IF NEW.generate_home_page = true AND (OLD.generate_home_page IS NULL OR OLD.generate_home_page = false) THEN
    
    -- Validate prerequisite: client_business_info must exist with required fields
    SELECT EXISTS (
      SELECT 1 FROM client_business_info 
      WHERE client_id = NEW.client_id 
      AND founding_year IS NOT NULL
      AND years_in_business_text IS NOT NULL
      AND regional_descriptor IS NOT NULL
    ) INTO business_info_complete;
    
    IF NOT business_info_complete THEN
      -- Reset trigger and block generation
      NEW.generate_home_page := false;
      RAISE NOTICE 'Home page generation blocked: client_business_info incomplete for client %', NEW.client_id;
      RETURN NEW;
    END IF;
    
    -- Prerequisites met - call edge function via pg_net
    PERFORM net.http_post(
      url := 'https://bxpxxyxctdsyucqpwxrz.supabase.co/functions/v1/generate-home-page',
      headers := json_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('supabase.service_role_key', true)
      )::jsonb,
      body := json_build_object(
        'client_id', NEW.client_id,
        'location_id', NEW.location_id,
        'generate_home_page', NEW.generate_home_page
      )::jsonb
    );
    
    RAISE NOTICE 'Triggered generate-home-page edge function for client %, location %', NEW.client_id, NEW.location_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- STEP 5: Create trigger on client_websites
-- ============================================================
DROP TRIGGER IF EXISTS trg_generate_home_page ON client_websites;

CREATE TRIGGER trg_generate_home_page
  BEFORE UPDATE ON client_websites
  FOR EACH ROW
  EXECUTE FUNCTION trigger_generate_home_page();

-- ============================================================
-- STEP 6: Add updated_at auto-update trigger for client_home_page
-- ============================================================
CREATE OR REPLACE FUNCTION update_client_home_page_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_client_home_page_updated_at ON client_home_page;

CREATE TRIGGER trg_update_client_home_page_updated_at
  BEFORE UPDATE ON client_home_page
  FOR EACH ROW
  EXECUTE FUNCTION update_client_home_page_updated_at();

-- ============================================================
-- NOTES
-- ============================================================
-- 1. pg_net extension must be enabled for net.http_post to work
-- 2. Edge function must be deployed before trigger will succeed
-- 3. Frontend should hide generate_home_page toggle until business_info exists
-- 4. faq_section column kept for backward compatibility, use common_questions_section for new data
