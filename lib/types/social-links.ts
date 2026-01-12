/**
 * Social Links types for client_social_links table
 * Used by Footer and SocialLinksModal components
 */

/**
 * Data stored for each social platform in the JSONB column
 */
export interface SocialPlatformData {
  url: string | null;
  bio: string | null;
  notes: string | null;
  has_existing: boolean | null;
  has_admin_access: boolean | null;
  is_complete: boolean;
  completed_by: string | null;
  completed_at: string | null;
}

/**
 * The platforms JSONB object structure
 * Key is platform_key (e.g., 'instagram', 'facebook_bio')
 */
export interface SocialPlatformsData {
  [platformKey: string]: SocialPlatformData;
}

/**
 * Full row from client_social_links table
 */
export interface ClientSocialLinks {
  id: string;
  location_id: string;
  platforms: SocialPlatformsData;
  created_at: string;
  updated_at: string;
}

/**
 * Platform definition for display purposes
 */
export interface SocialPlatformDefinition {
  key: string;
  name: string;
  iconName: string;
}

/**
 * A single platform link ready for display (filtered to only have URL)
 */
export interface SocialLinkDisplay {
  key: string;
  name: string;
  iconName: string;
  url: string;
}

/**
 * Social links for a single location (for modal display)
 */
export interface LocationSocialLinksDisplay {
  locationId: string;
  locationName: string;
  links: SocialLinkDisplay[];
}

/**
 * Data structure for the SocialLinksModal component
 */
export interface SocialLinksModalData {
  locations: LocationSocialLinksDisplay[];
}
