import { getSupabaseClient } from '@/lib/supabase/server';
import { RelatedPolicy } from '@/components/glossary/RelatedPolicyPages';

export interface GlossaryTerm {
  id: string;
  slug: string;
  term: string;
  head: string;
  body: string | null;
  links: string | null;
  created_at: string;
  updated_at: string;
  related_policy_pages: string[] | string | null;
}

export async function getGlossaryTerm(slug: string): Promise<GlossaryTerm | null> {
  try {
    const supabase = await getSupabaseClient();
    const { data, error } = await supabase
      .from('client_insurance_glossary')
      .select('id, slug, term, head, body, links, created_at, updated_at, related_policy_pages')
      .eq('slug', slug)
      .single();

    if (error) {
      console.error('Error fetching glossary term:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in getGlossaryTerm:', error);
    return null;
  }
}

export async function getRelatedPoliciesDetails(slugs: string[]): Promise<RelatedPolicy[]> {
  if (!slugs || slugs.length === 0) {
    return [];
  }

  return slugs.map((fullPath) => {
    const withoutProtocol = fullPath.replace(/^https?:\/\/[^/]+/i, '');
    const trimmed = withoutProtocol.replace(/^\/+/, '');
    const normalized = trimmed.startsWith('policies/')
      ? trimmed.slice('policies/'.length)
      : trimmed;
    return { slug: normalized };
  });
}

export function parseRelatedPolicyPages(relatedPolicyPages: string[] | string | null): string[] {
  let relatedPolicySlugs: string[] = [];
  if (relatedPolicyPages) {
    try {
      if (Array.isArray(relatedPolicyPages)) {
        relatedPolicySlugs = relatedPolicyPages;
      } else if (typeof relatedPolicyPages === 'string') {
        relatedPolicySlugs = JSON.parse(relatedPolicyPages);
      }
    } catch (e) {
      console.error('Failed to parse related_policy_pages:', e);
    }
  }
  return relatedPolicySlugs;
}

export interface RelatedPolicyLink {
  slug: string;
  title: string;
}

export async function validateAndGetRelatedPolicies(
  clientId: string | undefined,
  locationId: string | undefined,
  relatedPolicyLinks: RelatedPolicyLink[],
  locationSlug: string
): Promise<RelatedPolicy[]> {
  if (!clientId || !locationId || !relatedPolicyLinks || relatedPolicyLinks.length === 0) {
    return [];
  }

  try {
    const supabase = await getSupabaseClient();
    
    // Get all published policy slugs for this client/location
    const { data: publishedPolicies, error } = await supabase
      .from('client_policy_pages')
      .select('slug, title')
      .eq('client_id', clientId)
      .eq('location_id', locationId)
      .eq('published', true);

    if (error || !publishedPolicies) {
      console.error('Error fetching published policies:', error);
      return [];
    }

    const publishedSlugs = new Set(publishedPolicies.map(p => p.slug));

    // Filter related links to only include published policies
    return relatedPolicyLinks
      .filter(link => publishedSlugs.has(link.slug))
      .map(link => ({
        slug: `/locations/${locationSlug}/policies/${link.slug}`,
        title: link.title
      }));
  } catch (error) {
    console.error('Error in validateAndGetRelatedPolicies:', error);
    return [];
  }
}
