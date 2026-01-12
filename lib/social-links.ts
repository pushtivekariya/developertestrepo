/**
 * Social links data fetching utilities
 * Fetches from client_social_links table and transforms for modal display
 */

import { supabase } from '@/lib/supabase';
import { SOCIAL_PLATFORMS } from '@/constants/social-platforms';
import type { 
  ClientSocialLinks, 
  SocialPlatformsData,
  LocationSocialLinksDisplay, 
  SocialLinksModalData,
  SocialLinkDisplay 
} from './types/social-links';

const clientId = process.env.NEXT_PUBLIC_CLIENT_ID;

/**
 * Transform platforms JSONB into array of displayable links
 * Only includes platforms where url is non-null and non-empty
 */
function transformPlatformsToLinks(platforms: SocialPlatformsData): SocialLinkDisplay[] {
  const links: SocialLinkDisplay[] = [];

  for (const platform of SOCIAL_PLATFORMS) {
    const platformData = platforms[platform.key];
    if (platformData && platformData.url && platformData.url.trim() !== '') {
      links.push({
        key: platform.key,
        name: platform.name,
        iconName: platform.iconName,
        url: platformData.url,
      });
    }
  }

  return links;
}

/**
 * Get social links for a specific location by location_id
 */
export async function getSocialLinksForLocationId(locationId: string): Promise<LocationSocialLinksDisplay | null> {
  if (!clientId || !locationId) return null;

  // Fetch social links for this location
  const { data: socialLinksData, error: socialError } = await supabase
    .from('client_social_links')
    .select('*')
    .eq('location_id', locationId)
    .maybeSingle();

  if (socialError || !socialLinksData) {
    return null;
  }

  // Fetch location name
  const { data: locationData, error: locationError } = await supabase
    .from('client_locations')
    .select('location_name')
    .eq('id', locationId)
    .single();

  if (locationError || !locationData) {
    return null;
  }

  const links = transformPlatformsToLinks(socialLinksData.platforms as SocialPlatformsData);

  // Only return if there are links to display
  if (links.length === 0) {
    return null;
  }

  return {
    locationId: locationId,
    locationName: locationData.location_name,
    links,
  };
}

/**
 * Get social links for a location by slug
 * Used for location pages (/locations/[slug]/...)
 */
export async function getSocialLinksForLocationSlug(slug: string): Promise<SocialLinksModalData | null> {
  if (!clientId || !slug) return null;

  // First get the location_id from the slug
  const { data: locationData, error: locationError } = await supabase
    .from('client_locations')
    .select('id, location_name')
    .eq('client_id', clientId)
    .eq('location_slug', slug)
    .single();

  if (locationError || !locationData) {
    return null;
  }

  // Fetch social links for this location
  const { data: socialLinksData, error: socialError } = await supabase
    .from('client_social_links')
    .select('*')
    .eq('location_id', locationData.id)
    .maybeSingle();

  if (socialError || !socialLinksData) {
    return { locations: [] };
  }

  const links = transformPlatformsToLinks(socialLinksData.platforms as SocialPlatformsData);

  // Only include if there are links
  if (links.length === 0) {
    return { locations: [] };
  }

  return {
    locations: [{
      locationId: locationData.id,
      locationName: locationData.location_name,
      links,
    }],
  };
}

/**
 * Get social links for all locations
 * Used for home page (grouped by location)
 */
export async function getAllLocationsSocialLinks(): Promise<SocialLinksModalData> {
  if (!clientId) {
    return { locations: [] };
  }

  // Fetch all active locations for this client
  const { data: locationsData, error: locationsError } = await supabase
    .from('client_locations')
    .select('id, location_name')
    .eq('client_id', clientId)
    .eq('is_active', true)
    .order('location_name');

  if (locationsError || !locationsData || locationsData.length === 0) {
    return { locations: [] };
  }

  const locationIds = locationsData.map(loc => loc.id);

  // Fetch social links for all these locations
  const { data: socialLinksData, error: socialError } = await supabase
    .from('client_social_links')
    .select('*')
    .in('location_id', locationIds);

  if (socialError || !socialLinksData) {
    return { locations: [] };
  }

  // Create a map of location_id to social links
  const socialLinksMap = new Map<string, ClientSocialLinks>();
  for (const sl of socialLinksData) {
    socialLinksMap.set(sl.location_id, sl as ClientSocialLinks);
  }

  // Build the result grouped by location
  const locations: LocationSocialLinksDisplay[] = [];

  for (const location of locationsData) {
    const socialLinks = socialLinksMap.get(location.id);
    if (!socialLinks) continue;

    const links = transformPlatformsToLinks(socialLinks.platforms as SocialPlatformsData);

    // Only include locations that have at least one link
    if (links.length > 0) {
      locations.push({
        locationId: location.id,
        locationName: location.location_name,
        links,
      });
    }
  }

  return { locations };
}
