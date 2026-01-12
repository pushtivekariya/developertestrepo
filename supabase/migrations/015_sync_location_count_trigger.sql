-- Migration: Sync location count trigger
-- Description: Automatically keeps clients.number_of_locations in sync when locations are added/removed/updated
-- Date: 2025-12-05

-- Create function to sync location count
CREATE OR REPLACE FUNCTION sync_location_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE clients
  SET number_of_locations = (
    SELECT COUNT(*)::text 
    FROM client_locations 
    WHERE client_id = COALESCE(NEW.client_id, OLD.client_id) 
    AND is_active = true
  )
  WHERE id = COALESCE(NEW.client_id, OLD.client_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for INSERT, UPDATE, DELETE operations
DROP TRIGGER IF EXISTS sync_location_count_trigger ON client_locations;

CREATE TRIGGER sync_location_count_trigger
AFTER INSERT OR UPDATE OR DELETE ON client_locations
FOR EACH ROW EXECUTE FUNCTION sync_location_count();

-- Add comment for documentation
COMMENT ON FUNCTION sync_location_count() IS 'Automatically updates clients.number_of_locations when client_locations changes';
