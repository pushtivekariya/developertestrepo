/**
 * Page Metadata Utilities
 * Phase 4.6: 100% Database-driven page metadata with template variable support
 * NO FALLBACKS - all metadata must come from database
 */

import { cache } from 'react';
import { getSupabaseClient } from './supabase/server';
import { interpolateTemplate, buildTemplateContext, TemplateContext } from './template-variables';
import { getClientData } from './client';
import { getWebsiteData } from './website';

export interface PageMetadata {
  meta_title: string;
  meta_description: string;
  og_image_url?: string;
  hero_heading?: string;
  hero_subheading?: string;
}

/**
 * Get page metadata from database with template variable interpolation
 * 100% database-driven - no fallbacks
 */
export const getPageMetadata = cache(async (
  pageKey: string,
  locationId?: string | null
): Promise<PageMetadata> => {
  const clientId = process.env.NEXT_PUBLIC_CLIENT_ID;
  
  // Get client and website data for template context
  const [clientData, websiteData] = await Promise.all([
    getClientData(),
    getWebsiteData(),
  ]);
  
  const context = buildTemplateContext(clientData, websiteData);
  
  // If no client ID, return empty metadata
  if (!clientId) {
    console.error('NEXT_PUBLIC_CLIENT_ID not set - cannot fetch page metadata');
    return {
      meta_title: '',
      meta_description: '',
    };
  }
  const supabase = await getSupabaseClient();

  // Query for page metadata
  let query = supabase
    .from('client_page_metadata')
    .select('*')
    .eq('client_id', clientId)
    .eq('page_key', pageKey);

  if (locationId) {
    query = query.eq('location_id', locationId);
  } else {
    query = query.is('location_id', null);
  }

  const { data, error } = await query.single();

  // If no metadata found, return empty (database must have the data)
  if (!data || error) {
    if (error && error.code !== 'PGRST116') {
      console.error(`Error fetching page metadata for '${pageKey}':`, error);
    }
    return {
      meta_title: '',
      meta_description: '',
    };
  }

  // Return database metadata with template interpolation
  return {
    meta_title: interpolateTemplate(data.meta_title, context),
    meta_description: interpolateTemplate(data.meta_description, context),
    og_image_url: data.og_image_url || undefined,
    hero_heading: interpolateTemplate(data.hero_heading, context) || undefined,
    hero_subheading: interpolateTemplate(data.hero_subheading, context) || undefined,
  };
});

/**
 * Get page metadata with custom template context
 * Use when you need to add extra variables like {categoryName} or {policyTitle}
 * 100% database-driven - no fallbacks
 */
export const getPageMetadataWithContext = cache(async (
  pageKey: string,
  extraContext: Partial<TemplateContext>,
  locationId?: string | null
): Promise<PageMetadata> => {
  const clientId = process.env.NEXT_PUBLIC_CLIENT_ID;
  
  // Get client and website data for template context
  const [clientData, websiteData] = await Promise.all([
    getClientData(),
    getWebsiteData(),
  ]);
  
  const context = { ...buildTemplateContext(clientData, websiteData), ...extraContext };
  
  // If no client ID, return empty metadata
  if (!clientId) {
    console.error('NEXT_PUBLIC_CLIENT_ID not set - cannot fetch page metadata');
    return {
      meta_title: '',
      meta_description: '',
    };
  }
  const supabase = await getSupabaseClient();

  // Query for page metadata
  let query = supabase
    .from('client_page_metadata')
    .select('*')
    .eq('client_id', clientId)
    .eq('page_key', pageKey);

  if (locationId) {
    query = query.eq('location_id', locationId);
  } else {
    query = query.is('location_id', null);
  }

  const { data, error } = await query.single();

  // If no metadata found, return empty (database must have the data)
  if (!data || error) {
    if (error && error.code !== 'PGRST116') {
      console.error(`Error fetching page metadata for '${pageKey}':`, error);
    }
    return {
      meta_title: '',
      meta_description: '',
    };
  }

  // Return database metadata with template interpolation
  return {
    meta_title: interpolateTemplate(data.meta_title, context),
    meta_description: interpolateTemplate(data.meta_description, context),
    og_image_url: data.og_image_url || undefined,
    hero_heading: interpolateTemplate(data.hero_heading, context) || undefined,
    hero_subheading: interpolateTemplate(data.hero_subheading, context) || undefined,
  };
});
