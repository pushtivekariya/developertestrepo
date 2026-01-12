import React from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Divider } from '@/components/ui/Divider';
import { Badge } from '@/components/ui/Badge';
import { isMultiLocation } from '@/lib/website';
import type { LocationPoliciesSectionSettings } from '@/lib/types/theme';
import { DEFAULT_THEME } from '@/lib/theme/defaults';

interface Location {
  id: string;
  location_name: string;
  city: string;
  state: string;
  location_slug: string;
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

const InsuranceCareersSection = async () => {
  const [multiLocation, settings, locations] = await Promise.all([
    isMultiLocation(),
    getSectionSettings(),
    getLocations()
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

  // Build dynamic heading with city names
  const cityNames = locations.map(loc => loc.city);
  const headingText = cityNames.length > 0 
    ? `Insurance Careers in ${cityNames.join(', ')}`
    : 'Insurance Careers';

  if (multiLocation) {
    // Multi-location: Show location cards
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
              <span>Join Our Team</span>
            </Badge>
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-6 relative" style={headingStyle}>
              {headingText}
              <div className="h-1 w-24 rounded mx-auto mt-3 opacity-60" style={accentLineStyle}></div>
            </h2>
            <p className="text-lg md:text-xl max-w-3xl mx-auto leading-relaxed mb-12" style={subheadingStyle}>
              Start your career in insurance with us.
            </p>
          </div>
          
          <div className={`grid grid-cols-1 md:grid-cols-2 ${lgGridCols} gap-6 justify-items-center ${gridContainerWidth}`}>
            {locations.map((location) => (
              <Link 
                href={`/locations/${location.location_slug}/apply`} 
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
                    <span 
                      className="inline-flex items-center gap-2 font-bold py-3 px-8 rounded-full text-base transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 hover:opacity-80"
                      style={buttonStyle}
                    >
                      Apply Now
                      <img src="/Images/icons/arrow-right.svg" alt="Arrow Right" className="h-[18px] w-[18px]" />
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
    // Single-location: Show single card
    const location = locations[0];
    const singleLocationHeading = location 
      ? `Insurance Careers in ${location.city}`
      : 'Insurance Careers';

    return (
      <section className="py-16 relative" style={sectionStyle}>
        <Divider position="top" />
        
        <div className="container mx-auto px-4 max-w-screen-xl">
          <div className="text-center mb-12 animation-fade-up">
            <Badge className="mb-4" style={badgeStyle}>
              <span>Join Our Team</span>
            </Badge>
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-6 relative" style={headingStyle}>
              {singleLocationHeading}
              <div className="h-1 w-24 rounded mx-auto mt-3 opacity-60" style={accentLineStyle}></div>
            </h2>
            <p className="text-lg md:text-xl max-w-3xl mx-auto leading-relaxed mb-12" style={subheadingStyle}>
              Start your career in insurance with us.
            </p>
          </div>
          
          <div className="flex justify-center">
            <Link 
              href="/apply" 
              className="block w-full max-w-md transform hover:-translate-y-1 transition-all duration-300"
            >
              <div 
                className="rounded-xl shadow-lg border p-8 hover:shadow-xl transition-all duration-300 flex flex-col h-full cursor-pointer"
                style={cardStyle}
              >
                <h3 className="text-2xl font-heading font-bold mb-3 text-center" style={cardHeadingStyle}>
                  {location?.location_name || 'Our Agency'}
                </h3>
                <div className="h-1 w-16 rounded mx-auto mb-4 opacity-60" style={accentLineStyle}></div>
                <p className="mb-6 text-center flex-grow" style={cardBodyStyle}>
                  {location ? `${location.city}, ${location.state}` : 'Join our team'}
                </p>
                <div className="text-center mt-auto">
                  <span 
                    className="inline-flex items-center gap-2 font-bold py-3 px-8 rounded-full text-base transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 hover:opacity-80"
                    style={buttonStyle}
                  >
                    Apply Now
                    <img src="/Images/icons/arrow-right.svg" alt="Arrow Right" className="h-[18px] w-[18px]" />
                  </span>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>
    );
  }
};

export default InsuranceCareersSection;
