import React from 'react';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { Divider } from '@/components/ui/Divider';
import { TrustBadgeDivider } from '@/components/ui/TrustBadgeDivider';
import { BadgeSmall } from '@/components/ui/Badge';
import type { HeroDividerSettings } from '@/lib/types/theme';
import { DEFAULT_THEME } from '@/lib/theme/defaults';

interface ContentBlock {
  tag?: string;
  type?: string;
  content: string;
}

interface ImageBlock {
  url: string;
  type?: string;
}

interface ParagraphBlock {
  type: string;
  content: string;
}

interface IntroDescription {
  type: string;
  paragraphs: {
    paragraph_1?: ParagraphBlock;
    paragraph_2?: ParagraphBlock;
    [key: string]: ParagraphBlock | undefined;
  };
}

interface IntroContent {
  image: ImageBlock;
  title: ContentBlock;
  tagline: ContentBlock;
  image_tag: ContentBlock;
  description: IntroDescription;
}

interface ClientHomePageData {
  intro_section?: IntroContent;
}

interface ThemeSettings {
  intro_section_aspect_ratio?: string;
  hero_divider_settings?: HeroDividerSettings;
}

async function getIntroSection(): Promise<IntroContent | null> {
  const clientId = process.env.NEXT_PUBLIC_CLIENT_ID;

  if (!clientId) {
    console.error('NEXT_PUBLIC_CLIENT_ID is not set');
    return null;
  }

  const query = supabase
    .from('client_home_page')
    .select('intro_section')
    .eq('client_id', clientId);

  const { data, error } = await query.maybeSingle();

  if (error) {
    console.error('Error fetching intro section:', error);
    return null;
  }

  const introData = (data as ClientHomePageData | null)?.intro_section;

  return introData;
}

async function getThemeData(): Promise<{ aspectRatio: string; heroDividerSettings: HeroDividerSettings }> {
  const clientId = process.env.NEXT_PUBLIC_CLIENT_ID;

  if (!clientId) {
    return { 
      aspectRatio: '4:3', 
      heroDividerSettings: DEFAULT_THEME.hero_divider_settings! 
    };
  }

  const { data, error } = await supabase
    .from('client_theme_settings')
    .select('intro_section_aspect_ratio, hero_divider_settings')
    .eq('client_id', clientId)
    .maybeSingle();

  if (error || !data) {
    return { 
      aspectRatio: '4:3', 
      heroDividerSettings: DEFAULT_THEME.hero_divider_settings! 
    };
  }

  const themeData = data as ThemeSettings;
  return {
    aspectRatio: themeData.intro_section_aspect_ratio || '4:3',
    heroDividerSettings: themeData.hero_divider_settings || DEFAULT_THEME.hero_divider_settings!,
  };
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

const IntroSection = async () => {
  const [introContent, themeData] = await Promise.all([
    getIntroSection(),
    getThemeData()
  ]);

  if (!introContent) {
    return null;
  }

  const { aspectRatio, heroDividerSettings } = themeData;

  // Get paragraphs in order
  const paragraphs = Object.keys(introContent?.description?.paragraphs || {})
    .sort()
    .map(key => introContent?.description?.paragraphs?.[key])
    .filter((p): p is ParagraphBlock => p !== undefined);

  const imageClasses = getAspectRatioClasses(aspectRatio);

  // Determine which divider to render
  const renderDivider = () => {
    if (heroDividerSettings.type === 'trust_badges') {
      return <TrustBadgeDivider settings={heroDividerSettings} />;
    }
    return <Divider position="top" />;
  };

  return (
    <section className="py-20 bg-theme-bg relative w-full">
      {renderDivider()}
      
      <div className="container mx-auto px-4 py-4 max-w-screen-2xl">
        <div className={introContent?.image?.url ? "grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16 xl:gap-24 items-center" : ""}>
          {/* Left Column - Image */}
          {introContent?.image?.url && (
            <div className={`relative rounded-2xl overflow-hidden shadow-lg ${imageClasses} animate-fade-in-right`}>
              <Image 
                src={introContent.image.url} 
                alt="Agency introduction image" 
                fill
                className="object-cover"
              />
              {/* Semi-transparent overlay */}
              <div className="absolute inset-0 bg-theme-bg/20"></div>
              <div className="absolute bottom-4 left-4 md:bottom-6 md:left-6 lg:bottom-8 lg:left-8 bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2 shadow-md">
                <p className="text-primary font-medium text-base lg:text-lg xl:text-xl">{introContent?.image_tag?.content || ''}</p>
              </div>
            </div>
          )}
          
          {/* Right Column - About Content */}
          <div className="animate-fade-in-left">
            <BadgeSmall className="mb-4 text-sm md:text-base lg:text-lg">
              {introContent?.tagline?.content || ''}
            </BadgeSmall>
            
            <h2 className="section-title text-3xl md:text-4xl lg:text-5xl mb-6">{introContent?.title?.content || ''}</h2>
            
            {paragraphs?.map((paragraph, index) => (
              <p key={index} className={`text-theme-body text-base md:text-lg lg:text-xl leading-relaxed ${index === paragraphs?.length - 1 ? 'mb-8' : 'mb-6'}`}>
                {paragraph?.content || ''}
              </p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default IntroSection;
