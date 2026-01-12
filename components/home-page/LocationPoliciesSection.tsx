import React from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Divider } from '@/components/ui/Divider';
import { Badge } from '@/components/ui/Badge';
import { isMultiLocation } from '@/lib/website';
import type { LocationPoliciesSectionSettings } from '@/lib/types/theme';
import { DEFAULT_THEME } from '@/lib/theme/defaults';

interface PolicyPage {
  id: string;
  title: string;
  slug: string;
  content_summary: string;
}

interface Location {
  id: string;
  location_name: string;
  city: string;
  state: string;
  location_slug: string;
}

async function getPolicyPages(): Promise<PolicyPage[]> {
  const clientId = process.env.NEXT_PUBLIC_CLIENT_ID;
  if (!clientId) return [];

  const { data, error } = await supabase
    .from('client_policy_pages')
    .select('id, slug, title, content_summary')
    .eq('client_id', clientId)
    .eq('published', true)
    .limit(5);

  if (error) {
    console.error('Error fetching policy pages:', error);
    return [];
  }

  return data || [];
}

async function getLocations(): Promise<Location[]> {
  const clientId = process.env.NEXT_PUBLIC_CLIENT_ID;
  if (!clientId) return [];

  const { data, error } = await supabase
    .from('client_locations')
    .select('id, location_name, city, state, location_slug')
    .eq('client_id', clientId)
    .eq('is_active', true);

  if (error) {
    console.error('Error fetching locations:', error);
    return [];
  }

  return data || [];
}

async function getSectionSettings(): Promise<LocationPoliciesSectionSettings> {
  const clientId = process.env.NEXT_PUBLIC_CLIENT_ID;
  if (!clientId) return DEFAULT_THEME.location_policies_section_settings!;

  const { data, error } = await supabase
    .from('client_theme_settings')
    .select('location_policies_section_settings')
    .eq('client_id', clientId)
    .maybeSingle();

  if (error || !data?.location_policies_section_settings) {
    return DEFAULT_THEME.location_policies_section_settings!;
  }

  return data.location_policies_section_settings;
}

const LocationPoliciesSection = async () => {
  const [multiLocation, settings] = await Promise.all([
    isMultiLocation(),
    getSectionSettings()
  ]);

  // Build inline styles from settings (null = use CSS variable defaults)
  const sectionStyle = {
    backgroundColor: settings.section_bg_color || 'var(--loc-section-bg)',
  };
  const badgeStyle = {
    backgroundColor: settings.badge_bg_color || 'var(--loc-badge-bg)',
    color: settings.badge_text_color || 'var(--loc-badge-text)',
  };
  const headingStyle = {
    color: settings.heading_color || 'var(--loc-heading)',
  };
  const subheadingStyle = {
    color: settings.subheading_color || 'var(--loc-subheading)',
  };
  const cardStyle = {
    backgroundColor: settings.card_bg_color || 'var(--loc-card-bg)',
    borderColor: settings.card_border_color || 'var(--loc-card-border)',
  };
  const cardHeadingStyle = {
    color: settings.card_heading_color || 'var(--loc-card-heading)',
  };
  const cardBodyStyle = {
    color: settings.card_body_color || 'var(--loc-card-body)',
  };
  const accentLineStyle = {
    backgroundColor: settings.accent_line_color || 'var(--loc-accent-line)',
  };
  const buttonStyle = {
    backgroundColor: settings.button_bg_color || 'var(--loc-button-bg)',
    color: settings.button_text_color || 'var(--loc-button-text)',
  };
  const linkStyle = {
    color: settings.link_color || 'var(--loc-link)',
  };

  if (multiLocation) {
    // Multi-location: Show location cards
    const locations = await getLocations();
    
    if (locations.length === 0) return null;

    const locationCount = locations.length;
    const lgGridCols =
      locationCount === 1
        ? 'lg:grid-cols-1'
        : locationCount === 2
          ? 'lg:grid-cols-2'
          : locationCount === 5
            ? 'lg:grid-cols-4'
            : 'lg:grid-cols-3';

    const gridContainerWidth = locationCount === 2 ? 'max-w-4xl mx-auto' : '';

    return (
      <section className="py-16 relative" style={sectionStyle}>
        <Divider position="top" />
        
        <div className="container mx-auto px-4 max-w-screen-xl">
          <div className="text-center mb-12 animation-fade-up">
            <Badge className="mb-4" style={badgeStyle}>
              <span>Insurance by Location</span>
            </Badge>
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-6 relative" style={headingStyle}>
              Find Coverage Near You
              <div className="h-1 w-24 rounded mx-auto mt-3 opacity-60" style={accentLineStyle}></div>
            </h2>
            <p className="text-lg md:text-xl max-w-3xl mx-auto leading-relaxed mb-12" style={subheadingStyle}>
              Explore insurance policies available at each of our locations.
            </p>
          </div>
          
          <div className={`grid grid-cols-1 md:grid-cols-2 ${lgGridCols} gap-6 justify-items-center ${gridContainerWidth}`}>
            {locations.map((location) => (
              <Link 
                href={`/locations/${location.location_slug}/policies`} 
                key={location.id}
                className="block w-full max-w-md transform hover:-translate-y-1 transition-all duration-300"
              >
                <div 
                  className="rounded-xl shadow-lg border p-8 hover:shadow-xl transition-all duration-300 flex flex-col h-full cursor-pointer"
                  style={cardStyle}
                >
                  <h3 className="text-2xl font-heading font-bold mb-3 text-center" style={cardHeadingStyle}>
                    {location.location_name}
                  </h3>
                  <div className="h-1 w-16 rounded mx-auto mb-4 opacity-60" style={accentLineStyle}></div>
                  <p className="mb-6 text-center flex-grow" style={cardBodyStyle}>
                    {location.city}, {location.state}
                  </p>
                  <div className="text-center mt-auto">
                    <span className="group inline-flex items-center gap-2 font-medium transition-colors" style={linkStyle}>
                      View Policies
                      <img src="/Images/icons/arrow-right.svg" alt="Arrow Right" className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          
        </div>
      </section>
    );
  } else {
    // Single-location: Show policy cards
    const policyPages = await getPolicyPages();
    
    if (policyPages.length === 0) return null;

    return (
      <section className="py-16 relative" style={sectionStyle}>
        <Divider position="top" />
        
        <div className="container mx-auto px-4 max-w-screen-xl">
          <div className="text-center mb-12 animation-fade-up">
            <Badge className="mb-4" style={badgeStyle}>
              <span>Our Services</span>
            </Badge>
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-6 relative" style={headingStyle}>
              Insurance Solutions For You
              <div className="h-1 w-24 rounded mx-auto mt-3 opacity-60" style={accentLineStyle}></div>
            </h2>
            <p className="text-lg md:text-xl max-w-3xl mx-auto leading-relaxed mb-12" style={subheadingStyle}>
              Explore our comprehensive insurance coverage options designed to protect what matters most.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {policyPages.map((policy) => (
              <Link 
                href={`/policies/${policy.slug}`} 
                key={policy.id}
                className="block transform hover:-translate-y-1 transition-all duration-300"
              >
                <div 
                  className="rounded-xl shadow-lg border p-8 hover:shadow-xl transition-all duration-300 flex flex-col h-full cursor-pointer"
                  style={cardStyle}
                >
                  <h3 className="text-xl font-heading font-bold mb-3 text-center" style={cardHeadingStyle}>
                    {policy.title}
                  </h3>
                  <div className="h-1 w-16 rounded mx-auto mb-4 opacity-60" style={accentLineStyle}></div>
                  <p className="text-sm mb-4 text-center" style={cardBodyStyle}>
                    {policy.content_summary}
                  </p>
                  <div className="text-center mt-auto">
                    <span className="group inline-flex items-center gap-2 font-medium transition-colors" style={linkStyle}>
                      Learn More
                      <img src="/Images/icons/arrow-right.svg" alt="Arrow Right" className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          
          <div className="mt-12 text-center">
            <Link 
              href="/policies" 
              className="inline-flex items-center gap-2 font-bold py-3 px-8 rounded-full text-base transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 hover:opacity-80"
              style={buttonStyle}
            >
              View All Policies
              <img src="/Images/icons/arrow-right.svg" alt="Arrow Right" className="h-[18px] w-[18px]" />
            </Link>
          </div>
        </div>
      </section>
    );
  }
};

export default LocationPoliciesSection;
