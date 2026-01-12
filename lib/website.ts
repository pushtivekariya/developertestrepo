/**
 * Website data fetching utilities
 * Phase 1: Centralized fetching for client_websites with location joins
 * Phase 2: Feature flags, FAQs, badges utilities
 */

import { cache } from 'react';
import { getSupabaseClient } from './supabase/server';
import type { WebsiteData, WebsiteFeatures, Badge } from './types/website';
import { getClientPrimaryLocation } from './utils';

const clientId = process.env.NEXT_PUBLIC_CLIENT_ID;

/**
 * Get website data with joined location address
 * For single-location clients or default website
 */
export const getWebsiteData = cache(async (): Promise<WebsiteData | null> => {
  if (!clientId) return null;
  const supabase = await getSupabaseClient();

  const primaryLocationId = (await getClientPrimaryLocation())?.id;
  // First, try to fetch website data matching the primary location ID
  if (primaryLocationId) {
    const { data, error } = await supabase
      .from('client_websites')
      .select(`
        *,
        client_locations (
          location_name,
          address_line_1,
          address_line_2,
          city,
          state,
          zip
        )
      `)
      .eq('client_id', clientId)
      .eq('location_id', primaryLocationId)
      .maybeSingle();
    if (data && !error) {
      return data as WebsiteData;
    }
  }

  // If no data found for primary location, try location_id null
  const { data, error } = await supabase
    .from('client_websites')
    .select(`
      *,
      client_locations (
        location_name,
        address_line_1,
        address_line_2,
        city,
        state,
        zip
      )
    `)
    .eq('client_id', clientId)
    .is('location_id', null)
    .maybeSingle();
  if (error || !data) {
    console.error('Error fetching website data: No website found for primary location or location_id null', error);
    return null;
  }

  return data as WebsiteData;
});

/**
 * Get website by slug (for multi-location routing)
 * Used for /locations/[slug]/ routes
 */
export const getWebsiteBySlug = cache(async (slug: string): Promise<any | null> => {
  if (!clientId) return null;
  const supabase = await getSupabaseClient();

  // First, fetch the location data by slug
  const { data, error } = await supabase
    .from('client_locations')
    .select("*")
    .eq('client_id', clientId)
    .eq('location_slug', slug)
    .maybeSingle();

  if (error || !data) {
    console.error('Error fetching website by slug:', error);
    return null;
  }

  const locationId = data.id;

  // Try to fetch website data matching the location_id
  const { data: websiteData, error: websiteError } = await supabase
    .from('client_websites')
    .select("*")
    .eq('client_id', clientId)
    .eq('location_id', locationId)
    .single();

  // If no match found, fetch the oldest record from client_websites
  let finalWebsiteData = websiteData;
  if (websiteError || !websiteData) {
    const { data: oldestWebsiteData, error: oldestError } = await supabase
      .from('client_websites')
      .select("*")
      .eq('client_id', clientId)
      .order('created_at', { ascending: true })
      .limit(1)
      .single();

    if (oldestError || !oldestWebsiteData) {
      console.error('Error fetching oldest website data:', oldestError);
      return null;
    }

    finalWebsiteData = oldestWebsiteData;
  }

  const finalData = {
    ...finalWebsiteData,
    client_locations: data
  }
  return finalData as any;
});

/**
 * Get all websites for client (multi-location)
 * Used for /locations/ hub page listing all offices
 */
export const getAllWebsites = cache(async (): Promise<any> => {
  if (!clientId) return { website: null, locations: [] };
  const supabase = await getSupabaseClient();

  // Fetch website and locations in parallel
  const websiteResult = await supabase
  .from('client_locations')
  .select('*')
  .eq('client_id', clientId)
  .eq('is_active', true);

  if (websiteResult.error) {
    console.error('Error fetching website:', websiteResult.error);
  }

  return websiteResult.data || [];
});

/**
 * Check if client has multiple locations
 */
export const isMultiLocation = cache(async (): Promise<boolean> => {
  const websites = await getAllWebsites();
  return websites?.length > 1;
});

// === Phase 2: Feature Flags, FAQs, Badges Utilities ===

/**
 * Get feature flags only
 * Returns default values if features not set
 * If slug is provided, fetches features for that specific location
 */
export const getFeatures = cache(async (slug?: string): Promise<WebsiteFeatures | null> => {
  if (slug) {
    const website = await getWebsiteBySlug(slug);
    return website?.features || null;
  }
  const website = await getWebsiteData();
  return website?.features || null;
});

/**
 * Get FAQs only
 */
export const getFAQs = cache(async (locationId?: string | null): Promise<any | null> => {
  if (!clientId) return null;
  const supabase = await getSupabaseClient();

  let query = supabase
    .from('client_faq_page')
    .select(`hero_section, faq_section`)
    .eq('client_id', clientId);

  // If locationId is provided, filter by it; otherwise get global (location_id IS NULL)
  if (locationId) {
    query = query.eq('location_id', locationId);
  } else {
    query = query.is('location_id', null);
  }

  const { data, error } = await query.single();

  if (error || !data) {
    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching FAQ data:', error);
    }
    return null;
  }

  return data as any;
});

/**
 * Get badges only
 */
export const getBadges = cache(async (): Promise<Badge[]> => {
  const website = await getWebsiteData();
  return website?.badges || [];
});

/**
 * Check if a specific feature is enabled
 * Returns false if feature not found or features not set
 */
export const isFeatureEnabled = cache(async (feature: keyof WebsiteFeatures): Promise<boolean> => {
  const features = await getFeatures();
  return features?.[feature] ?? false;
});
