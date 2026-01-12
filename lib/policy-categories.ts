/**
 * Policy Utilities
 * Simplified: No category system, direct policy access
 */

import { cache } from 'react';
import { getSupabaseClient } from './supabase/server';
import { getClientPrimaryLocation } from './utils';

/**
 * Get ALL policies for a location
 */
export const getAllPolicies = cache(async (locationId?: string | null): Promise<any[]> => {
  const clientId = process.env.NEXT_PUBLIC_CLIENT_ID;
  if (!clientId) return [];
  const supabase = await getSupabaseClient();

  const resolvedLocationId = locationId ?? (await getClientPrimaryLocation())?.id;

  let query = supabase
    .from('client_policy_pages')
    .select('*')
    .eq('client_id', clientId)
    .eq('published', true);

  if (resolvedLocationId) {
    query = query.eq('location_id', resolvedLocationId);
  }

  const { data, error } = await query.order('title', { ascending: true });

  if (error) {
    console.error('Error fetching all policies:', error);
    return [];
  }

  return data || [];
});
