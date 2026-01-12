import React from 'react';
import { Metadata } from 'next';
import { LocationProvider } from '@/components/location/LocationProvider';
import { getWebsiteBySlug } from '@/lib/website';
import { getClientData } from '@/lib/client';
import { getSchemaDefaults } from '@/lib/structured-data';
import HeaderShell from "components/layout/HeaderShell";
import FooterShell from "components/layout/FooterShell";

interface LocationLayoutProps {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: LocationLayoutProps): Promise<Metadata> {
  const { slug } = await params;
  const [website, clientData] = await Promise.all([
    getWebsiteBySlug(slug),
    getClientData(),
  ]);

  if (!website) {
    return { title: 'Location Not Found' };
  }

  const { agencyName, canonicalUrl } = getSchemaDefaults(clientData);
  const location = website.client_locations;
  const locationName = location?.location_name || website.website_name || '';
  const city = location?.city || '';
  const state = location?.state || '';

  const title = `${locationName} | ${agencyName}`;
  const description = `Visit ${agencyName} in ${city}, ${state} for personalized auto, home, life, and business insurance solutions.`;

  // Location-specific keywords
  const keywords = [
    `insurance agent ${city} ${state}`,
    `auto insurance ${city}`,
    `home insurance ${city}`,
    `business insurance ${city}`,
    `life insurance ${city}`,
    `${city} insurance quotes`,
    agencyName,
    locationName,
  ];

  return {
    title: {
      default: title,
      template: `%s | ${agencyName}`,
    },
    description,
    metadataBase: new URL(canonicalUrl),
    alternates: {
      canonical: `/locations/${slug}`,
    },
    keywords,
    authors: [{ name: agencyName }],
    creator: agencyName,
    publisher: agencyName,
    openGraph: {
      title,
      description,
      url: `/locations/${slug}`,
      siteName: agencyName,
      locale: 'en_US',
      type: 'website',
      images: [
        {
          url: website?.og_image_url || '/og-image-1200x630.jpg',
          width: 1200,
          height: 630,
          alt: `${agencyName} - ${city}, ${state}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [website?.twitter_image_url || '/twitter-image-1200x600.jpg'],
    },
    robots: {
      index: true,
      follow: true,
      nocache: false,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    other: {
      'X-Robots-Tag': 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1',
      'geo.region': state,
      'geo.placename': city,
      ...(website?.latitude && website?.longitude ? {
        'geo.position': `${website.latitude};${website.longitude}`,
        'ICBM': `${website.latitude}, ${website.longitude}`,
      } : {}),
    },
  };
}

export default async function LocationLayout({ children, params }: LocationLayoutProps) {
  const { slug } = await params;
  const locationPrefix = `/locations/${slug}`;

  return (
    <LocationProvider locationPrefix={locationPrefix}>
      <HeaderShell locationPrefix={locationPrefix} />
      <main className="flex-grow">
        {children}
      </main>
      <FooterShell locationPrefix={locationPrefix} locationSlug={slug} />
    </LocationProvider>
  );
}


