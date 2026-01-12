import { cache } from 'react';
import { getSupabaseClient } from './supabase/server';

const clientId = process.env.NEXT_PUBLIC_CLIENT_ID;

/**
 * FAQ Policy structure for aggregated FAQs (grouped by policy)
 */
export interface FAQPolicy {
  id: string;
  name: string;
  slug: string;
  faqs: Array<{
    question: string;
    answer: string;
  }>;
}

/**
 * Get aggregated FAQs from published policy pages
 * Groups FAQs by individual policy (not category)
 * 
 * @param locationId - Required. The location ID to filter policies by.
 * @returns Array of FAQ policies with their associated FAQs
 */
export const getAggregatedFAQs = cache(async (locationId: string): Promise<FAQPolicy[]> => {
  if (!clientId || !locationId) {
    console.warn('[getAggregatedFAQs] Missing clientId or locationId');
    return [];
  }

  const supabase = await getSupabaseClient();
  
  // Fetch all published policy pages with FAQs for this location
  const { data: policyPages, error } = await supabase
    .from('client_policy_pages')
    .select('title, slug, faqs')
    .eq('client_id', clientId)
    .eq('location_id', locationId)
    .eq('published', true)
    .not('faqs', 'is', null);

  if (error) {
    console.error('[getAggregatedFAQs] Error fetching policy pages:', error);
    return [];
  }

  if (!policyPages || policyPages.length === 0) {
    return [];
  }

  // Map each policy to its own FAQ entry and sort alphabetically by name
  const faqPolicies: FAQPolicy[] = policyPages
    .filter((page: { faqs?: Array<{ question: string; answer: string }> }) => page.faqs && Array.isArray(page.faqs) && page.faqs.length > 0)
    .map((page: { id: string; title: string; slug: string; faqs: Array<{ question: string; answer: string }> }) => ({
      id: page.slug || '',
      name: page.title || '',
      slug: page.slug || '',
      faqs: page.faqs,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return faqPolicies;
});

/**
 * Get all FAQs flattened (for LD-JSON generation)
 * 
 * @param policies - Array of FAQ policies
 * @returns Flat array of all FAQ items
 */
export function flattenFAQs(policies: FAQPolicy[]): Array<{ question: string; answer: string }> {
  return policies.flatMap(policy => policy.faqs);
}
