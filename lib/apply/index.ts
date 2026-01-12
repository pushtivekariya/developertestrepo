/**
 * Job Application Settings Utility
 * 
 * Fetches job application page settings by client_id.
 * Falls back to DEFAULT_JOB_APPLICATION_SETTINGS if:
 * - No client_id in environment
 * - No record configured in database
 * - Database error
 */

import { cache } from 'react';
import { getSupabaseClient } from '@/lib/supabase/server';
import { DEFAULT_JOB_APPLICATION_SETTINGS, type JobApplicationSettings } from './defaults';

/**
 * Fetch job application settings for the current client
 * 
 * @param locationId - Optional location ID for multi-location clients
 * @returns JobApplicationSettings - either from database or defaults
 */
export const getJobApplicationSettings = cache(async (locationId?: string): Promise<JobApplicationSettings & { agency_name?: string }> => {
  const clientId = process.env.NEXT_PUBLIC_CLIENT_ID;

  if (!clientId) {
    console.warn('[JobApplication] No NEXT_PUBLIC_CLIENT_ID set, using default settings');
    return DEFAULT_JOB_APPLICATION_SETTINGS;
  }

  try {
    const supabase = await getSupabaseClient();
    
    let query = supabase
      .from('client_job_application_pages')
      .select('*, clients!inner(agency_name)')
      .eq('client_id', clientId);

    if (locationId) {
      query = query.eq('location_id', locationId);
    }

    const { data, error } = await query.single();

    if (error) {
      // PGRST116 = no rows returned (not configured)
      if (error.code === 'PGRST116') {
        console.info('[JobApplication] No settings configured for client, using defaults');
      } else {
        console.error('[JobApplication] Error fetching settings:', error.message);
      }
      return DEFAULT_JOB_APPLICATION_SETTINGS;
    }

    if (!data) {
      console.info('[JobApplication] No data returned, using defaults');
      return DEFAULT_JOB_APPLICATION_SETTINGS;
    }

    // Merge database values with defaults for any missing fields
    return {
      hero_section: data.hero_section || DEFAULT_JOB_APPLICATION_SETTINGS.hero_section,
      form_section: data.form_section || DEFAULT_JOB_APPLICATION_SETTINGS.form_section,
      form_fields: (data.form_fields && data.form_fields.length > 0) 
        ? data.form_fields 
        : DEFAULT_JOB_APPLICATION_SETTINGS.form_fields,
      form_title: data.form_title || DEFAULT_JOB_APPLICATION_SETTINGS.form_title,
      success_message: data.success_message || DEFAULT_JOB_APPLICATION_SETTINGS.success_message,
      is_enabled: data.is_enabled !== false,
      agency_name: data.clients?.agency_name,
    };
  } catch (err) {
    console.error('[JobApplication] Unexpected error fetching settings:', err);
    return DEFAULT_JOB_APPLICATION_SETTINGS;
  }
});

// Re-export types and defaults for convenience
export { DEFAULT_JOB_APPLICATION_SETTINGS } from './defaults';
export type { JobApplicationSettings, FormField } from './defaults';
