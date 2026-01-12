import React from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { getClientData } from '@/lib/client';
import { isMultiLocation } from '@/lib/website';
import { Divider } from '@/components/ui/Divider';

interface CTASectionStyles {
  gradient?: {
    startColor?: string | null;
    endColor?: string | null;
    direction?: string;
  };
  card?: {
    backgroundMode?: 'transparent' | 'solid';
    backgroundColor?: string | null;
    backgroundOpacity?: number;
    borderColor?: string | null;
    hoverBackgroundColor?: string | null;
  };
  typography?: {
    headingColor?: string | null;
    bodyColor?: string | null;
  };
  iconContainer?: {
    backgroundColor?: string | null;
    backgroundOpacity?: number;
  };
  button?: {
    backgroundColor?: string | null;
    textColor?: string | null;
    hoverBackgroundColor?: string | null;
  };
}

interface CTAContent {
  subtitle?: { content: string };
  description?: { content: string };
  styles?: CTASectionStyles;
}

interface Location {
  id: string;
  location_name: string;
  city: string;
  state: string;
  location_slug: string;
}

async function getCTASection(): Promise<CTAContent | null> {
  const clientId = process.env.NEXT_PUBLIC_CLIENT_ID;
  if (!clientId) return null;

  const query = supabase
    .from('client_home_page')
    .select('cta_section')
    .eq('client_id', clientId);

  const { data, error } = await query.maybeSingle();

  if (error) {
    console.error('Error fetching CTA section:', error);
    return null;
  }

  return data?.cta_section || null;
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

const GRADIENT_MAP: Record<string, string> = {
  'to-r': 'to right',
  'to-l': 'to left',
  'to-t': 'to top',
  'to-b': 'to bottom',
  'to-br': 'to bottom right',
  'to-bl': 'to bottom left',
  'to-tr': 'to top right',
  'to-tl': 'to top left',
};

const HomeCTA = async () => {
  const [ctaContent, clientData, multiLocation, locations] = await Promise.all([
    getCTASection(),
    getClientData(),
    isMultiLocation(),
    getLocations()
  ]);

  const subtitle = ctaContent?.subtitle?.content || 'Ready to Get Started?';
  const description = ctaContent?.description?.content || 'Contact us today to learn how we can help protect what matters most.';
  const city = clientData?.city;
  const state = clientData?.state;
  const styles = ctaContent?.styles;

  // Build dynamic styles
  const gradientDirection = GRADIENT_MAP[styles?.gradient?.direction || 'to-r'] || 'to right';
  const gradientStart = styles?.gradient?.startColor || 'var(--color-background-alt)';
  const gradientEnd = styles?.gradient?.endColor || 'var(--color-primary-80)';
  
  const sectionStyle: React.CSSProperties = {
    background: `linear-gradient(${gradientDirection}, ${gradientStart}, ${gradientEnd})`,
  };

  // Card styles
  const cardBgMode = styles?.card?.backgroundMode || 'transparent';
  const cardBgColor = styles?.card?.backgroundColor || '#ffffff';
  const cardBgOpacity = styles?.card?.backgroundOpacity ?? 10;
  const cardBorderColor = styles?.card?.borderColor || 'rgba(255, 255, 255, 0.2)';
  
  const cardStyle: React.CSSProperties = cardBgMode === 'solid' 
    ? {
        backgroundColor: cardBgColor,
        borderColor: cardBorderColor,
      }
    : {
        backgroundColor: `color-mix(in srgb, ${cardBgColor} ${cardBgOpacity}%, transparent)`,
        borderColor: cardBorderColor,
      };

  // Typography styles
  const headingColor = styles?.typography?.headingColor || 'inherit';
  const bodyColor = styles?.typography?.bodyColor || 'inherit';

  // Icon container styles
  const iconBgColor = styles?.iconContainer?.backgroundColor || '#ffffff';
  const iconBgOpacity = styles?.iconContainer?.backgroundOpacity ?? 15;
  const iconContainerStyle: React.CSSProperties = {
    backgroundColor: `color-mix(in srgb, ${iconBgColor} ${iconBgOpacity}%, transparent)`,
  };

  // Button styles
  const buttonBgColor = styles?.button?.backgroundColor || '#ffffff';
  const buttonTextColor = styles?.button?.textColor || 'var(--color-primary)';
  const buttonHoverBgColor = styles?.button?.hoverBackgroundColor || null;
  const buttonStyle: React.CSSProperties = {
    backgroundColor: buttonBgColor,
    color: buttonTextColor,
  };

  // Card hover color
  const cardHoverBgColor = styles?.card?.hoverBackgroundColor || null;

  // CSS custom properties for hover states (injected via style tag)
  const customStyles = `
    .cta-card:hover {
      ${cardHoverBgColor ? `background-color: ${cardHoverBgColor} !important;` : ''}
    }
    .cta-button:hover {
      ${buttonHoverBgColor ? `background-color: ${buttonHoverBgColor} !important;` : 'opacity: 0.9;'}
    }
  `;

  // Determine grid columns based on location count
  const locationCount = locations.length;
  const gridCols = locationCount === 1 
    ? 'grid-cols-1 max-w-md' 
    : locationCount === 2 
      ? 'grid-cols-1 md:grid-cols-2 max-w-4xl' 
      : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 max-w-6xl';

  return (
    <section className="py-16 text-primary-foreground relative" style={sectionStyle}>
      <style dangerouslySetInnerHTML={{ __html: customStyles }} />
      <Divider position="top" />
      
      <div className="container mx-auto px-4 max-w-screen-xl relative z-10">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
            {subtitle}
          </h2>
          <p className="text-primary-foreground/90 max-w-2xl mx-auto text-lg">
            {description}
          </p>
        </div>
        
        {multiLocation && locations.length > 0 ? (
          // Multi-location: Show location cards linking to contact pages
          <div className={`grid ${gridCols} gap-8 mx-auto`}>
            {locations.map((location) => (
              <Link
                key={location.id}
                href={`/locations/${location.location_slug}/contact`}
                className="block"
              >
                <div 
                  className="cta-card backdrop-blur-sm rounded-lg p-8 text-center border transition-all shadow-lg transform hover:-translate-y-1 duration-300 h-full"
                  style={cardStyle}
                >
                  <div className="rounded-full p-4 inline-flex mb-4" style={iconContainerStyle}>
                    <img src="/Images/icons/map-pin.svg" alt="Location" width={32} height={32} />
                  </div>
                  <h3 className="text-2xl font-bold mb-3" style={{ color: headingColor }}>
                    {location.location_name}
                  </h3>
                  <p className="mb-5" style={{ color: bodyColor, opacity: 0.8 }}>
                    {location.city}, {location.state}
                  </p>
                  <span 
                    className="cta-button inline-flex items-center justify-center font-bold rounded-full py-3 px-6 transition-colors"
                    style={buttonStyle}
                  >
                    Contact Us
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          // Single-location: Show single contact card
          <div className="grid grid-cols-1 max-w-md mx-auto">
            <Link href="/contact" className="block">
              <div 
                className="cta-card backdrop-blur-sm rounded-lg p-8 text-center border transition-all shadow-lg transform hover:-translate-y-1 duration-300"
                style={cardStyle}
              >
                <div className="rounded-full p-4 inline-flex mb-4" style={iconContainerStyle}>
                  <img src="/Images/icons/map-pin.svg" alt="Location" width={32} height={32} />
                </div>
                <h3 className="text-2xl font-bold mb-3" style={{ color: headingColor }}>
                  {clientData?.agency_name || 'Our Office'}
                </h3>
                <p className="mb-5" style={{ color: bodyColor, opacity: 0.8 }}>
                  {city && state ? `${city}, ${state}` : 'Get in touch with us'}
                </p>
                <span 
                  className="cta-button inline-flex items-center justify-center font-bold rounded-full py-3 px-6 transition-colors"
                  style={buttonStyle}
                >
                  Contact Us
                </span>
              </div>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default HomeCTA;
