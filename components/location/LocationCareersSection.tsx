import React from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Divider } from '@/components/ui/Divider';
import { Badge } from '@/components/ui/Badge';
import type { LocationPoliciesSectionSettings } from '@/lib/types/theme';
import { DEFAULT_THEME } from '@/lib/theme/defaults';

interface CareersSection {
  heading?: string;
  description?: string;
  button_text?: string;
  show_section?: boolean;
}

interface LocationCareersSectionProps {
  careersSection: CareersSection | null;
  locationName: string;
  locationSlug: string;
  city: string;
  state: string;
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

const LocationCareersSection = async ({ 
  careersSection, 
  locationName, 
  locationSlug,
  city, 
  state 
}: LocationCareersSectionProps) => {
  // Don't render if no data
  if (!careersSection) {
    return null;
  }

  const settings = await getSectionSettings();

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

  const heading = careersSection.heading || `Insurance Careers in ${city}`;
  const description = careersSection.description || 'Start your career in insurance with us.';
  const buttonText = careersSection.button_text || 'Apply Now';

  return (
    <section className="py-16 relative" style={sectionStyle}>
      <Divider position="top" />
      
      <div className="container mx-auto px-4 max-w-screen-xl">
        <div className="text-center mb-12 animation-fade-up">
          <Badge className="mb-4" style={badgeStyle}>
            <span>Join Our Team</span>
          </Badge>
          <h2 className="text-3xl md:text-4xl font-heading font-bold mb-6 relative" style={headingStyle}>
            {heading}
            <div className="h-1 w-24 rounded mx-auto mt-3 opacity-60" style={accentLineStyle}></div>
          </h2>
          <p className="text-lg md:text-xl max-w-3xl mx-auto leading-relaxed mb-12" style={subheadingStyle}>
            {description}
          </p>
        </div>
        
        <div className="flex justify-center">
          <Link 
            href={`/locations/${locationSlug}/apply`}
            className="block w-full max-w-md transform hover:-translate-y-1 transition-all duration-300"
          >
            <div 
              className="rounded-xl shadow-lg border p-8 hover:shadow-xl transition-all duration-300 flex flex-col h-full cursor-pointer"
              style={cardStyle}
            >
              <h3 className="text-2xl font-heading font-bold mb-3 text-center" style={cardHeadingStyle}>
                {locationName}
              </h3>
              <div className="h-1 w-16 rounded mx-auto mb-4 opacity-60" style={accentLineStyle}></div>
              <p className="mb-6 text-center flex-grow" style={cardBodyStyle}>
                {city}, {state}
              </p>
              <div className="text-center mt-auto">
                <span 
                  className="inline-flex items-center gap-2 font-bold py-3 px-8 rounded-full text-base transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 hover:opacity-80"
                  style={buttonStyle}
                >
                  {buttonText}
                  <img src="/Images/icons/arrow-right.svg" alt="Arrow Right" className="h-[18px] w-[18px]" />
                </span>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default LocationCareersSection;
