import React from 'react';
import { Metadata, Viewport } from 'next';
import "@/styles/globals.css";
import { Toaster } from "sonner";
import { getClientData } from '@/lib/client';
import { getSchemaDefaults, getClientServiceOfferings, buildOpeningHoursSpec, buildOfferCatalog } from '@/lib/structured-data';
import { getWebsiteData, isMultiLocation } from '@/lib/website';
import { getBusinessInfo } from '@/lib/business-info';
import { getThemeSettings } from '@/lib/theme';
import { ThemeProvider, ThemeStyleTag } from '@/lib/theme/ThemeProvider';

const GLOBAL_ROBOTS = {
  index: true,
  follow: true,
  googleBot: {
    index: true,
    follow: true,
    'max-video-preview': -1,
    'max-image-preview': 'large',
    'max-snippet': -1,
  },
  nocache: false,
} as const;

// Helper function to build icons with custom favicon support
function buildIcons(faviconUrl?: string | null) {
  const defaultFavicon = faviconUrl || '/favicon.ico';
  return {
    icon: [
      { url: defaultFavicon },
      ...(faviconUrl ? [] : [
        { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
        { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      ]),
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180' },
      { url: '/favicon-192x192.png', sizes: '192x192' },
    ],
  };
}

export async function generateMetadata(): Promise<Metadata> {
  const [clientData, websiteData, businessInfo, theme] = await Promise.all([
    getClientData(),
    getWebsiteData(),
    getBusinessInfo(),
    getThemeSettings(),
  ]);

  if (!clientData) {
    throw new Error('Failed to load client data for metadata');
  }

  const { agencyName, city, state, canonicalUrl } = getSchemaDefaults(clientData);
  const metadataBase = new URL(canonicalUrl || `https://${agencyName}.com`);

  const title = `${agencyName} | ${city}'s Trusted Insurance Partner`;
  const description = businessInfo?.about_short || `Discover ${agencyName} in ${city}, ${state}—providing personalized auto, home, life, and business insurance.`;
  // Generate dynamic keywords using service_areas from websiteData
  const serviceAreas = websiteData?.service_areas || [];
  const serviceAreaKeywords = serviceAreas.map(area => `${area} insurance`);
  
  const GLOBAL_ICONS = buildIcons(theme?.fav_icon_url);

  const GLOBAL_KEYWORDS = [
    `insurance agent ${city} ${state}`,
    `auto insurance ${city}`,
    `home insurance ${city}`,
    `business insurance ${state}`,
    `life insurance ${city}`,
    `${city} insurance quotes`,
    ...serviceAreaKeywords,
    `${agencyName}`,
  ];

  return {
    title,
    description,
    metadataBase,
    alternates: {
      canonical: canonicalUrl,
    },
    icons: GLOBAL_ICONS,
    keywords: GLOBAL_KEYWORDS,
    authors: [{ name: agencyName }],
    creator: agencyName,
    publisher: agencyName,
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: agencyName,
      locale: 'en_US',
      type: 'website',
      images: [
        {
          url: websiteData?.og_image_url || '/og-image-1200x630.jpg',
          width: 1200,
          height: 630,
          alt: `${agencyName} - ${city}, ${state}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [websiteData?.twitter_image_url || '/twitter-image-1200x600.jpg'],
    },
    robots: GLOBAL_ROBOTS,
    other: {
      "X-Robots-Tag": "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1",
      "geo.region": state,
      "geo.placename": city,
      ...(websiteData?.latitude && websiteData?.longitude ? {
        "geo.position": `${websiteData.latitude};${websiteData.longitude}`,
        "ICBM": `${websiteData.latitude}, ${websiteData.longitude}`,
      } : {}),
    },
  };
}

export const viewport: Viewport = {
  themeColor: 'var(--color-primary, #004080)',
  width: 'device-width',
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [clientData, websiteData, serviceOfferings, theme, multiLocation] = await Promise.all([
    getClientData(),
    getWebsiteData(),
    getClientServiceOfferings(),
    getThemeSettings(),
    isMultiLocation(),
  ]);
  const { agencyName, canonicalUrl, city, state, address, zip } = getSchemaDefaults(clientData);
  
  // Build opening hours from websiteData.business_hours (falls back to empty if not set)
  const openingHoursSpec = buildOpeningHoursSpec(websiteData?.business_hours);
  
  // Build telephone array dynamically
  const telephones = [
    websiteData?.phone || clientData?.phone,
    websiteData?.secondary_phone,
  ].filter(Boolean);
  
  // Build areaServed dynamically from service_areas
  const areaServed = websiteData?.service_areas?.map(areaName => ({
    "@type": "City",
    "name": `${areaName}, ${state}`
  })) || [];
  
  const ldJsonSchema = {
    "@context": "https://schema.org",
    "@type": "InsuranceAgency",
    "name": agencyName,
    "description": `Full-service insurance agency providing auto, home, life, and business insurance solutions in ${city}, ${state}`,
    "url": canonicalUrl,
    "telephone": telephones,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": address,
      "addressLocality": city,
      "addressRegion": state,
      "postalCode": zip,
      "addressCountry": "US"
    },
    ...(websiteData?.latitude && websiteData?.longitude ? {
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": String(websiteData.latitude),
        "longitude": String(websiteData.longitude)
      }
    } : {}),
    "areaServed": areaServed,
    ...(websiteData?.latitude && websiteData?.longitude ? {
      "serviceArea": {
        "@type": "GeoCircle",
        "geoMidpoint": {
          "@type": "GeoCoordinates",
          "latitude": String(websiteData.latitude),
          "longitude": String(websiteData.longitude)
        },
        "geoRadius": String(websiteData.service_radius_meters || 25000)
      }
    } : {}),
    "hasOfferCatalog": buildOfferCatalog(serviceOfferings),
    "openingHoursSpecification": openingHoursSpec
  };
  return (
    <html lang="en">
      <head>
        {/* Favicon - Dynamic from theme settings */}
        {theme?.fav_icon_url && (
          <link rel="icon" href={theme.fav_icon_url} />
        )}
        
        {/* Google Tag Manager - Dynamic */}
        {websiteData?.google_tag_id && (
          <script dangerouslySetInnerHTML={{ 
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${websiteData.google_tag_id}');` 
          }} />
        )}
        
        {/* Google Analytics - Dynamic */}
        {websiteData?.google_analytics_id && (
          <>
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${websiteData.google_analytics_id}`}></script>
            <script dangerouslySetInnerHTML={{
              __html: `
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', '${websiteData.google_analytics_id}');
  ${websiteData.google_ads_id ? `gtag('config', '${websiteData.google_ads_id}');` : ''}
              `
            }} />
          </>
        )}
        
        {/* CallRail Dynamic Number Insertion */}
        {websiteData?.callrail_swap_script && (
          <script type="text/javascript" src={websiteData.callrail_swap_script} async></script>
        )}
        
        {/* Structured data for local business SEO - Only for single-location clients */}
        {!multiLocation && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(ldJsonSchema)
            }}
          />
        )}
        
        {/* Theme CSS Variables - Prevents FOUC */}
        <ThemeStyleTag theme={theme} />
      </head>
      <body className="antialiased">
        {/* Google Tag Manager (noscript) - Dynamic */}
        {websiteData?.google_tag_id && (
          <noscript>
            <iframe 
              src={`https://www.googletagmanager.com/ns.html?id=${websiteData.google_tag_id}`} 
              height="0" 
              width="0" 
              style={{display:'none',visibility:'hidden'}}
            />
          </noscript>
        )}
        <ThemeProvider theme={theme}>
          <div className="min-h-screen flex flex-col">
            {children}
            <Toaster position="bottom-right" />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}