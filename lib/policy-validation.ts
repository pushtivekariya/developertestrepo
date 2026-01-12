import { cache } from 'react';
import { getSupabaseClient } from '@/lib/supabase/server';

interface RelatedPolicy {
  slug: string;
  title: string;
}

/**
 * Validates and filters related policies to only include published pages
 * Prevents broken links when policies are unpublished or removed
 * 
 * @param relatedPolicies - Array of related policy objects from database
 * @param clientId - Client ID for filtering
 * @param locationId - Location ID for filtering
 * @returns Filtered array containing only published policies
 */
export const validateRelatedPolicies = cache(
  async (
    relatedPolicies: RelatedPolicy[] | null,
    clientId: string,
    locationId: string
  ): Promise<RelatedPolicy[]> => {
    // Early return if no related policies
    if (!relatedPolicies || relatedPolicies.length === 0) {
      return [];
    }

    try {
      const supabase = await getSupabaseClient();
      
      // Get all published policy slugs for this location
      const { data: publishedPolicies, error } = await supabase
        .from('client_policy_pages')
        .select('slug')
        .eq('client_id', clientId)
        .eq('location_id', locationId)
        .eq('published', true);

      if (error) {
        console.error('[validateRelatedPolicies] Error fetching published policies:', error);
        // On error, return empty array to prevent broken links
        return [];
      }

      if (!publishedPolicies || publishedPolicies.length === 0) {
        return [];
      }

      // Create a Set of published slugs for O(1) lookup
      const publishedSlugs = new Set(publishedPolicies.map(p => p.slug));

      // Filter related policies to only include published ones
      // Handle both exact matches and base slug matches (e.g., "umbrella-insurance" matches "umbrella-insurance-Woodstock-GA")
      const validatedPolicies = relatedPolicies
        .map(rp => {
          // First try exact match
          if (publishedSlugs.has(rp.slug)) {
            return rp;
          }
          
          // Try to find a published slug that starts with the base slug
          // This handles cases where related_policies stores "umbrella-insurance" 
          // but actual slug is "umbrella-insurance-Woodstock-GA"
          const matchingSlug = publishedPolicies.find(p => 
            p.slug.startsWith(rp.slug + '-') || p.slug === rp.slug
          );
          
          if (matchingSlug) {
            return { ...rp, slug: matchingSlug.slug };
          }
          
          return null;
        })
        .filter((rp): rp is RelatedPolicy => rp !== null);

      // Log if any links were filtered out (for monitoring)
      if (validatedPolicies.length < relatedPolicies.length) {
        const validatedSlugs = new Set(validatedPolicies.map(p => p.slug));
        const filtered = relatedPolicies.filter(rp => 
          !validatedSlugs.has(rp.slug) && !publishedPolicies.some(p => p.slug.startsWith(rp.slug + '-'))
        );
        if (filtered.length > 0) {
          console.warn(
            `[validateRelatedPolicies] Filtered ${filtered.length} unpublished related policies:`,
            filtered.map(p => p.slug).join(', ')
          );
        }
      }

      return validatedPolicies;
      
    } catch (error) {
      console.error('[validateRelatedPolicies] Unexpected error:', error);
      // On error, return empty array to prevent broken links
      return [];
    }
  }
);
