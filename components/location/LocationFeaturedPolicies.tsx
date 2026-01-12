import React from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

interface PoliciesSection {
  heading?: string;
  subheading?: string;
  featured_policy_ids?: string[];
  show_section?: boolean;
}

interface PolicyPage {
  id: string;
  title: string;
  slug: string;
  icon_url: string | null;
  content_summary: string;
}

interface LocationFeaturedPoliciesProps {
  locationId: string;
  locationSlug: string;
}

// Default policy slugs to show if none selected
const DEFAULT_POLICY_SLUGS = ['home', 'auto', 'condo', 'boat'];

async function getPoliciesSection(locationId: string): Promise<PoliciesSection | null> {
  const clientId = process.env.NEXT_PUBLIC_CLIENT_ID;
  if (!clientId || !locationId) return null;

  const { data, error } = await supabase
    .from('client_location_page')
    .select('policies_section')
    .eq('client_id', clientId)
    .eq('location_id', locationId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching policies section:', error);
    return null;
  }

  return data?.policies_section || null;
}

async function getFeaturedPolicies(
  locationId: string,
  featuredIds: string[] | undefined
): Promise<PolicyPage[]> {
  const clientId = process.env.NEXT_PUBLIC_CLIENT_ID;
  if (!clientId || !locationId) return [];

  // If specific policies are selected, fetch those
  if (featuredIds && featuredIds.length > 0) {
    const { data, error } = await supabase
      .from('client_policy_pages')
      .select('id, title, slug, icon_url, content_summary')
      .eq('client_id', clientId)
      .eq('location_id', locationId)
      .in('id', featuredIds)
      .eq('published', true);

    if (error) {
      console.error('Error fetching featured policies:', error);
      return [];
    }

    // Sort by the order in featuredIds
    const sortedData = featuredIds
      .map((id) => data?.find((p) => p.id === id))
      .filter((p): p is PolicyPage => p !== undefined);

    return sortedData;
  }

  // Fallback: fetch policies matching default slugs
  const { data, error } = await supabase
    .from('client_policy_pages')
    .select('id, title, slug, icon_url, content_summary')
    .eq('client_id', clientId)
    .eq('location_id', locationId)
    .eq('published', true);

  if (error) {
    console.error('Error fetching default policies:', error);
    return [];
  }

  // Filter to default slugs and limit to 4
  const defaultPolicies = (data || [])
    .filter((p) =>
      DEFAULT_POLICY_SLUGS.some((defaultSlug) =>
        p.slug.toLowerCase().includes(defaultSlug)
      )
    )
    .slice(0, 4);

  // If no defaults found, return first 4 policies
  if (defaultPolicies.length === 0) {
    return (data || []).slice(0, 4);
  }

  return defaultPolicies;
}

const LocationFeaturedPolicies = async ({
  locationId,
  locationSlug,
}: LocationFeaturedPoliciesProps) => {
  const policiesSection = await getPoliciesSection(locationId);

  // Don't render if section is explicitly hidden
  if (policiesSection?.show_section === false) {
    return null;
  }

  const policies = await getFeaturedPolicies(locationId, policiesSection?.featured_policy_ids);

  // Don't render if no policies
  if (policies.length === 0) {
    return null;
  }

  const heading = policiesSection?.heading || 'Featured Insurance Policies';
  const subheading =
    policiesSection?.subheading ||
    'Explore coverage options available at this location';

  return (
    <section className="py-16 px-4" style={{ backgroundColor: 'var(--loc-section-bg)' }}>
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h2 
            className="text-2xl md:text-3xl font-heading font-bold mb-4"
            style={{ color: 'var(--loc-heading)' }}
          >
            {heading}
          </h2>
          <p 
            className="text-lg max-w-2xl mx-auto"
            style={{ color: 'var(--loc-subheading)' }}
          >
            {subheading}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {policies.map((policy) => {
            const policyUrl = `/locations/${locationSlug}/policies/${policy.slug}`;

            return (
              <Link
                key={policy.id}
                href={policyUrl}
                className="block transform hover:-translate-y-1 transition-all duration-300"
              >
                <div 
                  className="rounded-xl p-6 hover:shadow-lg transition-all duration-300 flex flex-col h-full"
                  style={{ 
                    backgroundColor: 'var(--loc-card-bg)', 
                    borderWidth: '1px', 
                    borderStyle: 'solid', 
                    borderColor: 'var(--loc-card-border)' 
                  }}
                >
                  {policy.icon_url && (
                    <div className="flex justify-center mb-4">
                      <img src={policy.icon_url} alt="" className="h-10 w-10" />
                    </div>
                  )}
                  <div className="min-h-[3.5rem] flex items-center justify-center">
                    <h3 
                      className="text-lg font-heading font-bold text-center"
                      style={{ color: 'var(--loc-card-heading)' }}
                    >
                      {policy.title}
                    </h3>
                  </div>
                  <div 
                    className="h-1 w-12 rounded mx-auto my-4 opacity-60"
                    style={{ backgroundColor: 'var(--loc-accent-line)' }}
                  ></div>
                  <p 
                    className="text-sm mb-4 text-center"
                    style={{ color: 'var(--loc-card-body)' }}
                  >
                    {policy.content_summary}
                  </p>
                  <div className="text-center mt-auto">
                    <span 
                      className="group inline-flex items-center gap-2 font-medium transition-colors"
                      style={{ color: 'var(--loc-link)' }}
                    >
                      Learn More
                      <img
                        src="/Images/icons/arrow-right.svg"
                        alt="Arrow Right"
                        className="h-4 w-4 transform group-hover:translate-x-1 transition-transform"
                      />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="mt-10 text-center">
          <Link
            href={`/locations/${locationSlug}/policies`}
            className="inline-flex items-center gap-2 font-bold rounded-full py-3 px-6 transition-colors"
            style={{ 
              backgroundColor: 'var(--loc-button-bg)', 
              color: 'var(--loc-button-text)' 
            }}
          >
            View All Policies
            <img
              src="/Images/icons/arrow-right.svg"
              alt="Arrow Right"
              className="h-4 w-4"
            />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default LocationFeaturedPolicies;
