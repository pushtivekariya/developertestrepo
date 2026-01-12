import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from '@/components/location/Link';
import { getClientData } from '@/lib/client';
import { getWebsiteBySlug, getAllWebsites, isMultiLocation } from '@/lib/website';
import { Divider } from '@/components/ui/Divider';
import { supabase } from '@/lib/supabase';
import { getSchemaDefaults, buildOpeningHoursSpec, buildPageUrl } from '@/lib/structured-data';
import TestimonialsCarousel from '@/components/location/TestimonialsCarousel';
import LocationFeaturedPolicies from '@/components/location/LocationFeaturedPolicies';
import LocationFAQSection from '@/components/location/LocationFAQSection';
import LocationCareersSection from '@/components/location/LocationCareersSection';

// Inline interfaces for location page JSONB sections
interface HeroImageBlock {
  url?: string;
  type?: string;
  alt?: string;
}

interface HeroVideoBlock {
  url?: string | null;
  type?: string;
}

interface HeroOverlay {
  color?: string | null;
  opacity?: number;
}

interface HeroContentBlock {
  tag?: string;
  type?: string;
  content?: string;
  color?: string;
}

interface HeroSection {
  heading?: string;
  subheading?: string;
  // Location-specific hero overrides (same structure as home page)
  background_image?: HeroImageBlock;
  background_video?: HeroVideoBlock;
  background_media_type?: 'image' | 'video';
  overlay?: HeroOverlay;
  title?: HeroContentBlock;
  subtitle?: HeroContentBlock;
}

interface IntroSection {
  content?: string;
  heading?: string;
  imageUrl?: string;
  imageTag?: string;
}

interface ServicesSection {
  heading?: string;
  description?: string;
}

interface GoogleReview {
  review_name: string;
  review_description: string;
}

interface Testimonial {
  name: string;
  review_text: string;
}

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

interface CtaSection {
  heading?: string;
  buttonLink?: string;
  buttonText?: string;
}

interface QuestionItem {
  question: string;
  answer: string;
}

interface FaqSection {
  tagline?: string;
  subtitle?: string;
  description?: string;
  questions?: QuestionItem[];
  show_section?: boolean;
}

interface CareersSection {
  heading?: string;
  description?: string;
  button_text?: string;
  show_section?: boolean;
}

interface LocationPageData {
  hero_section: HeroSection | null;
  intro_section: IntroSection | null;
  services_section: ServicesSection | null;
  faq_section: FaqSection | null;
  careers_section: CareersSection | null;
  cta_section: CtaSection | null;
  meta_title: string | null;
  meta_description: string | null;
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Fetch location page content from client_location_page table
async function getLocationPageData(locationId: string): Promise<LocationPageData | null> {
  const clientId = process.env.NEXT_PUBLIC_CLIENT_ID;
  if (!clientId || !locationId) return null;

  const { data, error } = await supabase
    .from('client_location_page')
    .select('hero_section, intro_section, services_section, faq_section, careers_section, cta_section, meta_title, meta_description')
    .eq('client_id', clientId)
    .eq('location_id', locationId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching location page data:', error);
    return null;
  }

  return data as LocationPageData | null;
}

// Fetch home page hero settings (full structure for fallback)
interface HomePageHeroSection {
  background_image?: HeroImageBlock;
  background_video?: HeroVideoBlock;
  background_media_type?: 'image' | 'video';
  overlay?: HeroOverlay;
  title?: HeroContentBlock;
  subtitle?: HeroContentBlock;
}

// Fetch intro section aspect ratio from theme settings
async function getIntroAspectRatio(): Promise<string> {
  const clientId = process.env.NEXT_PUBLIC_CLIENT_ID;
  if (!clientId) return '4:3';

  const { data, error } = await supabase
    .from('client_theme_settings')
    .select('intro_section_aspect_ratio')
    .eq('client_id', clientId)
    .maybeSingle();

  if (error || !data) return '4:3';
  return data.intro_section_aspect_ratio || '4:3';
}

function getAspectRatioClasses(aspectRatio: string): string {
  switch (aspectRatio) {
    case '1:1':
      return 'h-80 md:h-[400px] lg:h-[500px] xl:h-[600px]';
    case '16:9':
      return 'h-80 md:h-[450px] lg:h-[550px] xl:h-[650px]';
    case '4:3':
    default:
      return 'h-80 md:h-[500px] lg:h-[600px] xl:h-[700px]';
  }
}

// Fetch home page hero settings (background image, video, colors, overlay)
interface HomePageHeroSettings {
  backgroundImage: string | null;
  backgroundVideo: string | null;
  backgroundMediaType: 'image' | 'video' | null;
  titleColor: string | null;
  subtitleColor: string | null;
  overlayColor: string | null;
  overlayOpacity: number;
}

async function getHomePageHeroSettings(): Promise<HomePageHeroSettings | null> {
  const clientId = process.env.NEXT_PUBLIC_CLIENT_ID;

  const defaultSettings: HomePageHeroSettings = {
    backgroundImage: null,
    backgroundVideo: null,
    backgroundMediaType: null,
    titleColor: null,
    subtitleColor: null,
    overlayColor: null,
    overlayOpacity: 0,
  };

  if (!clientId) return defaultSettings;

  const { data, error } = await supabase
    .from('client_home_page')
    .select('hero_section')
    .eq('client_id', clientId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching home page hero:', error);
    return defaultSettings;
  }

  return {
    backgroundImage: data?.hero_section?.background_image?.url || null,
    backgroundVideo: data?.hero_section?.background_video?.url || null,
    backgroundMediaType: data?.hero_section?.background_media_type || null,
    titleColor: data?.hero_section?.title?.color || null,
    subtitleColor: data?.hero_section?.subtitle?.color || null,
    overlayColor: data?.hero_section?.overlay?.color || null,
    overlayOpacity: data?.hero_section?.overlay?.opacity ?? 0,
  };
}

// Fetch home page CTA styles for location landing page fallback
async function getHomePageCTAStyles(): Promise<CTASectionStyles | null> {
  const clientId = process.env.NEXT_PUBLIC_CLIENT_ID;
  if (!clientId) return null;

  const { data, error } = await supabase
    .from('client_home_page')
    .select('cta_section')
    .eq('client_id', clientId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching home page CTA styles:', error);
    return null;
  }

  return data?.cta_section?.styles || null;
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

export async function generateStaticParams() {
  const multiLocation = await isMultiLocation();
  if (!multiLocation) return [];
  
  const websites = await getAllWebsites();
  return (websites || [])
    .filter((website) => website?.location_slug && typeof website.location_slug === 'string')
    .map((website) => ({ slug: website.location_slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const [website, clientData] = await Promise.all([
    getWebsiteBySlug(slug),
    getClientData(),
  ]);

  if (!website) {
    return { title: 'Location Not Found' };
  }

  // Get location ID and fetch page data for SEO
  const locationId = website?.client_locations?.id;
  const pageData = locationId ? await getLocationPageData(locationId) : null;

  const canonicalUrl = clientData?.client_website?.canonical_url || '';
  const locationName = website?.client_locations?.location_name || website.website_name;
  const city = website?.client_locations?.city || '';
  const state = website?.client_locations?.state || '';
  
  // Use page data meta if available, otherwise fall back to defaults
  const title = pageData?.meta_title || website.meta_title || `${locationName} | ${clientData?.agency_name}`;
  const description = pageData?.meta_description || website.meta_description || 
    `Visit ${clientData?.agency_name} in ${city}, ${state} for personalized insurance solutions.`;

  return {
    title,
    description,
    metadataBase: new URL(canonicalUrl),
    alternates: {
      canonical: `/locations/${slug}`,
    },
  };
}

// Note: formatBusinessHours available if needed for display

// Generate LD-JSON structured data for location landing page
function generateLdJsonSchema(
  clientData: any,
  websiteData: any,
  locationSlug: string
) {
  const { agencyName, canonicalUrl } = getSchemaDefaults(clientData);
  const location = websiteData?.client_locations;
  const locationName = location?.location_name || websiteData?.website_name || '';
  
  // Build opening hours from business_hours JSONB
  const openingHoursSpec = buildOpeningHoursSpec(websiteData?.business_hours);
  
  // Build service areas
  const serviceAreas = websiteData?.service_areas?.map((area: string) => ({
    "@type": "City",
    "name": `${area}, ${location?.state || ''}`
  })) || [];

  const schema: Record<string, any> = {
    "@context": "https://schema.org",
    "@type": "InsuranceAgency",
    "name": `${agencyName} - ${locationName}`,
    "description": `${agencyName} insurance agency serving ${location?.city || ''}, ${location?.state || ''} and surrounding areas.`,
    "url": buildPageUrl(canonicalUrl, `/locations/${locationSlug}`),
    "address": {
      "@type": "PostalAddress",
      "streetAddress": location?.address_line_1 || '',
      "addressLocality": location?.city || '',
      "addressRegion": location?.state || '',
      "postalCode": location?.zip || '',
      "addressCountry": "US"
    },
    "telephone": location?.phone || websiteData?.phone || clientData?.phone || '',
  };

  // Add email if available
  if (location?.email) {
    schema.email = location.email;
  }

  // Add geo coordinates if available
  if (websiteData?.latitude && websiteData?.longitude) {
    schema.geo = {
      "@type": "GeoCoordinates",
      "latitude": String(websiteData.latitude),
      "longitude": String(websiteData.longitude)
    };
  }

  // Add opening hours if available
  if (openingHoursSpec.length > 0) {
    schema.openingHoursSpecification = openingHoursSpec;
  }

  // Add service areas if available
  if (serviceAreas.length > 0) {
    schema.areaServed = serviceAreas;
  }

  return schema;
}

export default async function LocationLandingPage({ params }: PageProps) {
  // Only allow location pages for multi-location clients
  const multiLocation = await isMultiLocation();
  if (!multiLocation) {
    notFound();
  }

  const { slug } = await params;
  const [website, clientData, heroSettings, introAspectRatio, ctaStyles] = await Promise.all([
    getWebsiteBySlug(slug),
    getClientData(),
    getHomePageHeroSettings(),
    getIntroAspectRatio(),
    getHomePageCTAStyles(),
  ]);

  if (!website) {
    notFound();
  }

  // Fetch location page content
  const locationId = website?.client_locations?.id;
  const pageData = locationId ? await getLocationPageData(locationId) : null;
  const agencyName = clientData?.agency_name || '';
  const locationName = website?.client_locations?.location_name || website.website_name;
  // Note: businessHours available via formatBusinessHours if needed for display

  const city = website?.client_locations?.city || '';
  const state = website?.client_locations?.state || '';
  
  // Feature flags from website
  const showCareersSection = website?.features?.show_careers_page ?? true;

  // Use page data if available, otherwise use defaults
  // Note: heroHeading available from pageData if needed
  const heroSubheading = pageData?.hero_section?.subheading || `Your trusted insurance partner in ${city}, ${state}`;
  const introSection = pageData?.intro_section;
  const ctaSection = pageData?.cta_section;
  
  // Fetch google_reviews from client_locations (source of truth from Review Posts)
  // Map to Testimonial format for the carousel component
  const googleReviews: GoogleReview[] = website?.client_locations?.google_reviews || [];
  const testimonials: Testimonial[] = googleReviews.map(review => ({
    name: review.review_name,
    review_text: review.review_description,
  }));

  // Hero section settings: use location-specific first, fallback to home page
  const locationHero = pageData?.hero_section;
  const heroBackgroundImage = locationHero?.background_image?.url || heroSettings?.backgroundImage || null;
  const heroBackgroundVideo = locationHero?.background_video?.url || heroSettings?.backgroundVideo || null;
  const heroMediaType = locationHero?.background_media_type || heroSettings?.backgroundMediaType || 'image';
  const heroOverlayOpacity = locationHero?.overlay?.opacity || heroSettings?.overlayOpacity;
  const heroTitleColor = locationHero?.title?.color || heroSettings?.titleColor || 'var(--color-primary)';
  const heroSubtitleColor = locationHero?.subtitle?.color || heroSettings?.subtitleColor || 'var(--color-text-muted)';
  const heroOverlayColor = locationHero?.overlay?.color || heroSettings?.overlayColor || '#000000';

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section - matches home page format */}
      <section 
        className="relative overflow-hidden w-full"
        style={{
          height: "50vh",
          minHeight: "600px"
        }}
        aria-label="Location introduction"
        role="banner"
      >
        {/* Background media - Image or Video (location-specific first, fallback to home page) */}
        {heroMediaType === 'video' && heroBackgroundVideo ? (
          <div className="absolute inset-0 z-0">
            <video
              autoPlay
              loop
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
            >
              <source src={heroBackgroundVideo} type="video/mp4" />
            </video>
          </div>
        ) : heroBackgroundImage ? (
          <div className="absolute inset-0 z-0">
            <Image
              src={heroBackgroundImage}
              fill
              priority
              quality={90}
              sizes="100vw"
              style={{
                objectFit: 'cover',
                objectPosition: 'center',
              }}
              alt="Location hero background"
            />
          </div>
        ) : null}
        
        {/* Configurable overlay filter (location-specific first, fallback to home page) */}
        {(heroOverlayOpacity ?? 0) > 0 && (
          <div 
            className="absolute inset-0 z-[1]"
            style={{
              backgroundColor: heroOverlayColor,
              opacity: (heroOverlayOpacity ?? 0) / 100
            }}
          />
        )}
        
        {/* Fallback overlay when no custom overlay is set */}
        {(heroOverlayOpacity ?? 0) === 0 && (
          <div className="absolute inset-0 bg-theme-bg/20 z-[1]"></div>
        )}
        
        {/* Hero content - centered */}
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 px-4">
          <div className="w-full max-w-5xl mx-auto text-center animate-fade-in">
            <h1 className="mb-4 sm:mb-6">
              <span 
                className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold leading-tight tracking-tight drop-shadow-xl block"
                style={{ color: heroTitleColor }}
              >
                {agencyName}
              </span>
              <span 
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight drop-shadow-xl block mt-2"
                style={{ color: heroTitleColor }}
              >
                {locationName}
              </span>
            </h1>

            <h2 
              className="inline-block text-base sm:text-lg md:text-xl lg:text-2xl font-medium px-4 py-2 sm:px-6 sm:py-3 bg-white/40 backdrop-blur-sm rounded-xl shadow-md tracking-wide max-w-2xl" 
              style={{ color: heroSubtitleColor }}
            >
              {heroSubheading}
            </h2>
          </div>
        </div>
        
        <Divider position="bottom" />
      </section>

      {/* Intro Section - if content exists */}
      {(introSection?.heading || introSection?.content || introSection?.imageUrl) && (
        <section className="py-20 bg-theme-bg relative w-full">
          <div className="container mx-auto px-4 py-4 max-w-screen-2xl">
            <div className={introSection?.imageUrl ? "grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16 xl:gap-24 items-center" : ""}>
              {/* Left Column - Image */}
              {introSection?.imageUrl && (
                <div className={`relative rounded-2xl overflow-hidden shadow-lg ${getAspectRatioClasses(introAspectRatio)} animate-fade-in-right`}>
                  <Image 
                    src={introSection.imageUrl} 
                    alt="Location introduction image" 
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-theme-bg/20"></div>
                  {introSection?.imageTag && (
                    <div className="absolute bottom-4 left-4 md:bottom-6 md:left-6 lg:bottom-8 lg:left-8 bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2 shadow-md">
                      <p className="text-primary font-medium text-base lg:text-lg xl:text-xl">{introSection.imageTag}</p>
                    </div>
                  )}
                </div>
              )}
              
              {/* Right Column - Content */}
              <div className={introSection?.imageUrl ? "animate-fade-in-left" : "max-w-4xl mx-auto text-center"}>
                {introSection?.heading && (
                  <h2 className={`text-2xl md:text-3xl lg:text-4xl font-heading font-bold text-primary mb-6 ${!introSection?.imageUrl ? 'text-center' : ''}`}>
                    {introSection.heading}
                  </h2>
                )}
                {introSection?.content && (
                  <div className="text-theme-body text-base md:text-lg lg:text-xl leading-relaxed">
                    {introSection.content.split('\n\n').map((paragraph, index) => (
                      paragraph.trim() ? (
                        <p key={index} className="mb-4 last:mb-0">
                          {paragraph.trim()}
                        </p>
                      ) : null
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Featured Policies Section */}
      {locationId && (
        <LocationFeaturedPolicies 
          locationId={locationId} 
          locationSlug={slug} 
        />
      )}

      {/* Testimonials Section - carousel format */}
      {testimonials && testimonials.length > 0 && (
        <TestimonialsCarousel testimonials={testimonials} />
      )}

      {/* CTA Section - uses home page CTA styles */}
      {(() => {
        // Build dynamic styles from home page CTA settings
        const gradientDirection = GRADIENT_MAP[ctaStyles?.gradient?.direction || 'to-r'] || 'to right';
        const gradientStart = ctaStyles?.gradient?.startColor || 'var(--color-background-alt)';
        const gradientEnd = ctaStyles?.gradient?.endColor || 'var(--color-primary-80)';
        
        const sectionStyle: React.CSSProperties = {
          background: `linear-gradient(${gradientDirection}, ${gradientStart}, ${gradientEnd})`,
        };

        // Card styles
        const cardBgMode = ctaStyles?.card?.backgroundMode || 'transparent';
        const cardBgColor = ctaStyles?.card?.backgroundColor || '#ffffff';
        const cardBgOpacity = ctaStyles?.card?.backgroundOpacity ?? 10;
        const cardBorderColor = ctaStyles?.card?.borderColor || 'rgba(255, 255, 255, 0.2)';
        
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
        const headingColor = ctaStyles?.typography?.headingColor || 'inherit';
        const bodyColor = ctaStyles?.typography?.bodyColor || 'inherit';

        // Icon container styles
        const iconBgColor = ctaStyles?.iconContainer?.backgroundColor || '#ffffff';
        const iconBgOpacity = ctaStyles?.iconContainer?.backgroundOpacity ?? 15;
        const iconContainerStyle: React.CSSProperties = {
          backgroundColor: `color-mix(in srgb, ${iconBgColor} ${iconBgOpacity}%, transparent)`,
        };

        // Button styles
        const buttonBgColor = ctaStyles?.button?.backgroundColor || '#ffffff';
        const buttonTextColor = ctaStyles?.button?.textColor || 'var(--color-primary)';
        const buttonStyle: React.CSSProperties = {
          backgroundColor: buttonBgColor,
          color: buttonTextColor,
        };

        return (
          <section className="py-16 px-4 text-primary-foreground relative" style={sectionStyle}>
            <Divider position="top" />
            <div className="container mx-auto max-w-6xl text-center relative z-10">
              <h2 
                className="text-3xl md:text-4xl font-heading font-bold mb-4"
                style={{ color: headingColor }}
              >
                {ctaSection?.heading || `Connect With Your ${locationName} Team`}
              </h2>
              <p 
                className="text-primary-foreground/90 max-w-2xl mx-auto text-lg mb-10"
                style={{ color: bodyColor, opacity: 0.9 }}
              >
                Contact us today to learn how we can help protect what matters most.
              </p>
              
              <div className="grid grid-cols-1 max-w-md mx-auto">
                <Link href={ctaSection?.buttonLink || "/contact"} className="block">
                  <div 
                    className="backdrop-blur-sm rounded-lg p-8 text-center border transition-all shadow-lg transform hover:-translate-y-1 duration-300"
                    style={cardStyle}
                  >
                    <div className="rounded-full p-4 inline-flex mb-4" style={iconContainerStyle}>
                      <img src="/Images/icons/map-pin.svg" alt="Location" width={32} height={32} />
                    </div>
                    <h3 className="text-2xl font-bold mb-3" style={{ color: headingColor }}>
                      {locationName}
                    </h3>
                    <p className="mb-5" style={{ color: bodyColor, opacity: 0.8 }}>
                      {city}, {state}
                    </p>
                    <span 
                      className="inline-flex items-center justify-center font-bold rounded-full py-3 px-6 transition-colors"
                      style={buttonStyle}
                    >
                      {ctaSection?.buttonText || "Contact Us"}
                    </span>
                  </div>
                </Link>
              </div>
            </div>
          </section>
        );
      })()}

      {/* FAQ Section */}
      <LocationFAQSection faqSection={pageData?.faq_section || {
        tagline: 'Common Questions',
        subtitle: 'Questions We Often Hear',
        description: 'Quick answers to help you understand your coverage options.',
        questions: []
      }} />

      {/* Careers Section - controlled by show_careers_page feature flag */}
      {showCareersSection && (
        <LocationCareersSection 
          careersSection={pageData?.careers_section || {
            heading: `Insurance Careers in ${city}`,
            description: 'Start your career in insurance with us.',
            button_text: 'Apply Now'
          }}
          locationName={locationName}
          locationSlug={slug}
          city={city}
          state={state}
        />
      )}

      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateLdJsonSchema(clientData, website, slug))
        }}
      />
    </div>
  );
}
