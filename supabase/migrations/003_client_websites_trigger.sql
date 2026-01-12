-- Migration: Auto-create client_websites when client_locations is inserted
-- Phase: 3
-- Date: 2024-12-01

-- Function to create client_websites record from client_locations
CREATE OR REPLACE FUNCTION create_website_for_location()
RETURNS TRIGGER AS $$
DECLARE
  location_count INTEGER;
  generated_slug TEXT;
BEGIN
  -- Count existing locations for this client
  SELECT COUNT(*) INTO location_count
  FROM client_locations
  WHERE client_id = NEW.client_id AND is_active = true;

  -- Generate slug from city-state (e.g., "houston-tx")
  generated_slug := LOWER(REGEXP_REPLACE(
    NEW.city || '-' || NEW.state,
    '[^a-zA-Z0-9-]', '-', 'g'
  ));

  -- Create client_websites record
  INSERT INTO client_websites (
    client_id,
    location_id,
    website_name,
    slug,
    is_active,
    service_radius_meters,
    business_hours,
    social_links,
    service_areas,
    features
  ) VALUES (
    NEW.client_id,
    NEW.id,
    NEW.location_name,
    generated_slug,
    true,
    25000,  -- default 25km radius
    '{}'::jsonb,
    '{}'::jsonb,
    '[]'::jsonb,
    jsonb_build_object(
      'show_blog', true,
      'show_glossary', true,
      'show_faq_page', true,
      'show_careers_page', true,
      'show_social_links', true,
      'show_business_hours', true,
      'show_agent_network', false,
      'show_about_description', false,
      'show_regional_text', false,
      'multi_location', location_count > 1
    )
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on client_locations insert
DROP TRIGGER IF EXISTS trg_create_website_for_location ON client_locations;
CREATE TRIGGER trg_create_website_for_location
AFTER INSERT ON client_locations
FOR EACH ROW
EXECUTE FUNCTION create_website_for_location();

-- Add comment for documentation
COMMENT ON FUNCTION create_website_for_location() IS 
  'Auto-creates client_websites record when client_locations is inserted. Generates slug from city-state.';
