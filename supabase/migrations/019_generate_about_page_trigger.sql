-- ============================================================
-- Migration: Add generate_about_page trigger column and function
-- ============================================================
-- This migration:
-- 1. Adds generate_about_page boolean column to client_websites
-- 2. Creates a trigger function that validates prerequisites before calling the edge function
-- 3. Creates a trigger on client_websites table
-- ============================================================

-- ============================================================
-- STEP 1: Add trigger column to client_websites
-- ============================================================
ALTER TABLE client_websites 
ADD COLUMN IF NOT EXISTS generate_about_page BOOLEAN NOT NULL DEFAULT false;

COMMENT ON COLUMN client_websites.generate_about_page IS 
'Trigger to generate about page content via OpenAI assistant. 
Requires client_business_info to have founding_year, years_in_business_text, and regional_descriptor populated.';

-- ============================================================
-- STEP 2: Create trigger function with validation
-- ============================================================
CREATE OR REPLACE FUNCTION trigger_generate_about_page()
RETURNS TRIGGER AS $$
DECLARE
  business_info_exists BOOLEAN;
  location_exists BOOLEAN;
BEGIN
  -- Only trigger when generate_about_page changes from false/null to true
  IF NEW.generate_about_page = true AND (OLD.generate_about_page IS NULL OR OLD.generate_about_page = false) THEN
    
    -- ============================================================
    -- Validation: Check if client_business_info has required fields
    -- ============================================================
    SELECT EXISTS (
      SELECT 1 FROM client_business_info 
      WHERE client_id = NEW.client_id 
      AND founding_year IS NOT NULL
      AND years_in_business_text IS NOT NULL
      AND regional_descriptor IS NOT NULL
    ) INTO business_info_exists;
    
    IF NOT business_info_exists THEN
      -- Reset trigger and skip - prerequisites not met
      NEW.generate_about_page := false;
      RAISE NOTICE 'About page generation blocked: client_business_info incomplete (requires founding_year, years_in_business_text, regional_descriptor)';
      RETURN NEW;
    END IF;
    
    -- ============================================================
    -- Validation: Check if location exists
    -- ============================================================
    SELECT EXISTS (
      SELECT 1 FROM client_locations 
      WHERE id = NEW.location_id
    ) INTO location_exists;
    
    IF NOT location_exists THEN
      -- Reset trigger and skip - location not found
      NEW.generate_about_page := false;
      RAISE NOTICE 'About page generation blocked: location_id not found in client_locations';
      RETURN NEW;
    END IF;
    
    -- ============================================================
    -- Call Edge Function via pg_net
    -- ============================================================
    PERFORM net.http_post(
      url := 'https://bxpxxyxctdsyucqpwxrz.supabase.co/functions/v1/generate-about-page',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.service_role_key', true)
      ),
      body := jsonb_build_object(
        'client_id', NEW.client_id,
        'location_id', NEW.location_id,
        'generate_about_page', NEW.generate_about_page
      )
    );
    
    RAISE NOTICE 'About page generation triggered for client_id: %, location_id: %', NEW.client_id, NEW.location_id;
    
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- STEP 3: Create trigger on client_websites table
-- ============================================================
DROP TRIGGER IF EXISTS on_generate_about_page ON client_websites;

CREATE TRIGGER on_generate_about_page
  BEFORE UPDATE OF generate_about_page
  ON client_websites
  FOR EACH ROW
  EXECUTE FUNCTION trigger_generate_about_page();

-- ============================================================
-- STEP 4: Grant necessary permissions
-- ============================================================
GRANT EXECUTE ON FUNCTION trigger_generate_about_page() TO service_role;

-- ============================================================
-- COMMENTS
-- ============================================================
COMMENT ON FUNCTION trigger_generate_about_page() IS 
'Validates prerequisites and triggers the generate-about-page edge function when generate_about_page is set to true.
Prerequisites:
- client_business_info must exist with founding_year, years_in_business_text, regional_descriptor
- location_id must exist in client_locations
If prerequisites are not met, the trigger resets generate_about_page to false.';

COMMENT ON TRIGGER on_generate_about_page ON client_websites IS 
'Triggers about page content generation when generate_about_page column is updated to true.';
