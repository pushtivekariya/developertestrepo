import React from 'react';
import Image from "next/image";
import { supabase } from '@/lib/supabase';
import { isMultiLocation, getAllWebsites } from '@/lib/website';
import HeroCTAButton from './HeroCTAButton';

interface HeroContentBlock {
  tag?: string;
  type?: string;
  content: string;
  color?: string;
}

interface HeroImageBlock {
  url: string;
  type?: string;
  alt?: string;
}

interface HeroVideoBlock {
  url: string | null;
  type?: string;
}

interface HeroOverlay {
  color: string | null;
  opacity: number;
}

interface ClientHomePageData {
  hero_section?: {
    title?: HeroContentBlock;
    subtitle?: HeroContentBlock;
    description?: HeroContentBlock;
    background_image?: HeroImageBlock;
    background_video?: HeroVideoBlock;
    background_media_type?: 'image' | 'video';
    overlay?: HeroOverlay;
  };
}

async function getHeroSection(): Promise<any | null> {
  const clientId = process.env.NEXT_PUBLIC_CLIENT_ID;

  if (!clientId) {
    console.error('NEXT_PUBLIC_CLIENT_ID is not set');
    return null;
  }

  const query = supabase
    .from('client_home_page')
    .select('hero_section')
    .eq('client_id', clientId);

  const { data, error } = await query.maybeSingle();

  if (error) {
    console.error('Error fetching hero section:', error);
    return null;
  }

  const heroData = (data as ClientHomePageData | null)?.hero_section;
  
  return heroData;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const HeroSection = async ({ locationId }: { locationId?: string | null }) => {
  const [heroContent, multiLocation, locations] = await Promise.all([
    getHeroSection(),
    isMultiLocation(),
    getAllWebsites()
  ]);

  if (!heroContent) {
    return null;
  }

  const renderWithLineBreaks = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, index) => (
      <React.Fragment key={index}>
        {line}
        {index < lines.length - 1 && <br />}
      </React.Fragment>
    ));
  };

  return (
    <section 
      className="relative overflow-hidden w-full"
      style={{
        height: "50vh",
        minHeight: "600px"
      }}
      aria-label="Agency introduction and welcome"
      role="banner"
    >
      {/* Background media - Image or Video */}
      {heroContent?.background_media_type === 'video' && heroContent?.background_video?.url ? (
        <div className="absolute inset-0 z-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          >
            <source src={heroContent.background_video.url} type="video/mp4" />
          </video>
        </div>
      ) : heroContent?.background_image?.url ? (
        <div className="absolute inset-0 z-0">
          <Image
            src={heroContent.background_image.url}
            fill
            priority
            quality={90}
            sizes="100vw"
            style={{
              objectFit: 'cover',
              objectPosition: 'center',
            }}
            alt={heroContent?.background_image?.alt || "Hero background image"}
          />
        </div>
      ) : null}
      
      {/* Configurable overlay filter */}
      {(heroContent?.overlay?.opacity ?? 0) > 0 && (
        <div 
          className="absolute inset-0 z-[1]"
          style={{
            backgroundColor: heroContent?.overlay?.color || '#000000',
            opacity: (heroContent?.overlay?.opacity ?? 0) / 100
          }}
        />
      )}
      
      {/* Fallback overlay when no custom overlay is set */}
      {(heroContent?.overlay?.opacity ?? 0) === 0 && (
        <div className="absolute inset-0 bg-theme-bg/20 z-[1]"></div>
      )}
      
      {/* Hero text container with improved responsive positioning */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-10 px-4">
        <div className="w-full max-w-5xl mx-auto text-center animate-fade-in">
          <h1 className="mb-4 sm:mb-6">
            <span 
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight tracking-tight drop-shadow-xl"
              style={{ color: heroContent?.title?.color || 'var(--color-primary)' }}
            >
              {renderWithLineBreaks(heroContent?.title?.content || '')}
            </span>
          </h1>

          <h2 
            className="inline-block text-lg sm:text-xl md:text-2xl lg:text-3xl font-medium px-4 py-2 sm:px-6 sm:py-3 bg-white/40 backdrop-blur-sm rounded-xl shadow-md tracking-wide"
            style={{ color: heroContent?.subtitle?.color || 'var(--color-text-muted)' }}
          >
            {renderWithLineBreaks(heroContent?.subtitle?.content || '')}
          </h2>
          
          <p className="mt-6 text-base sm:text-lg md:text-xl px-4 py-2 bg-white/60 backdrop-blur-sm rounded-lg shadow-sm max-w-xl mx-auto text-theme-body">
            {renderWithLineBreaks(heroContent?.description?.content || '')}
          </p>
          
          <div className="mt-8">
            <HeroCTAButton 
              isMultiLocation={multiLocation} 
              locations={locations || []} 
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
