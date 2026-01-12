-- Migration: Sync multi_location flag across all client websites
-- Description: When location count changes, update multi_location feature flag on ALL websites for that client
-- Date: 2025-12-05

-- Function to sync multi_location flag on all client websites
CREATE OR REPLACE FUNCTION sync_multi_location_flag()
RETURNS TRIGGER AS $$
DECLARE
  location_count INTEGER;
  is_multi BOOLEAN;
  target_client_id UUID;
BEGIN
  -- Get the client_id from either NEW or OLD record
  target_client_id := COALESCE(NEW.client_id, OLD.client_id);
  
  -- Count active locations for this client
  SELECT COUNT(*) INTO location_count
  FROM client_locations
  WHERE client_id = target_client_id AND is_active = true;
  
  -- Determine if multi-location
  is_multi := location_count > 1;
  
  -- Update ALL websites for this client to have the same multi_location flag
  UPDATE client_websites
  SET features = jsonb_set(
    COALESCE(features, '{}'::jsonb),
    '{multi_location}',
    to_jsonb(is_multi)
  )
  WHERE client_id = target_client_id;
  
  -- Log for debugging
  RAISE NOTICE 'Synced multi_location=% for client % (% active locations)', 
    is_multi, target_client_id, location_count;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger for INSERT, UPDATE, DELETE operations on client_locations
DROP TRIGGER IF EXISTS sync_multi_location_flag_trigger ON client_locations;

CREATE TRIGGER sync_multi_location_flag_trigger
AFTER INSERT OR UPDATE OR DELETE ON client_locations
FOR EACH ROW EXECUTE FUNCTION sync_multi_location_flag();

-- Add comment for documentation
COMMENT ON FUNCTION sync_multi_location_flag() IS 
  'Automatically updates multi_location feature flag on ALL client_websites when client_locations changes. Ensures consistent navigation across all location-specific sites.';
