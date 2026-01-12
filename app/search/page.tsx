import React, { Suspense } from 'react';
import SearchBar from 'components/search/SearchBar';
import SearchResults from 'components/search/SearchResults';
import SearchHeader from 'components/search/SearchHeader';
import { Metadata } from 'next';
import { getClientData } from '@/lib/client';
import { getWebsiteData } from '@/lib/website';
import { getSchemaDefaults, buildPageUrl, buildOpeningHoursSpec } from '@/lib/structured-data';

export async function generateMetadata(): Promise<Metadata> {
  const clientData = await getClientData();
  const agencyName = clientData?.agency_name || "";
  const url = clientData?.client_website?.canonical_url || "";

  return {
    title: `Search | ${agencyName}`,
    description: `Search for insurance information, policies, and resources on ${agencyName} website.`,
    metadataBase: new URL(url),
    alternates: {
      canonical: '/search'
    },
    robots: {
      index: false,
      follow: false,
      nocache: true,
    },
    openGraph: {
      title: `Search | ${agencyName}`,
      description: `Search for insurance information, policies, and resources on ${agencyName} website.`,
      url: '/search',
      siteName: agencyName,
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: "summary_large_image",
      title: `Search | ${agencyName}`,
      description: `Find insurance policies, resources, and information on ${agencyName} website with our search tool.`,
    }
  };
}

const buildLdJsonSchema = (clientData: any, websiteData: any) => {
  const { agencyName, canonicalUrl, city, state, address, zip, email } = getSchemaDefaults(clientData);

  return {
    "@context": "https://schema.org",
    "@type": "InsuranceAgency",
    "name": agencyName,
    "url": buildPageUrl(canonicalUrl, '/search'),
    "logo": "/logo.png",
    "image": "/office.jpg",
    "description": `${agencyName} is a trusted independent insurance provider serving ${city}, ${state}. We specialize in auto, home, life, flood, and business insurance with personalized service and competitive rates.`,
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
        "latitude": websiteData.latitude,
        "longitude": websiteData.longitude
      }
    } : {}),
    "telephone": websiteData?.phone || clientData?.phone,
    "email": websiteData?.email || email,
    ...(websiteData?.business_hours ? { "openingHoursSpecification": buildOpeningHoursSpec(websiteData.business_hours) } : {}),
    "sameAs": Object.values(websiteData?.social_links || {}).filter(Boolean)
  };
};

export default async function SearchPage() {
  const [clientData, websiteData] = await Promise.all([
    getClientData(),
    getWebsiteData(),
  ]);

  return (
    <main className="flex-grow">
      <section className="py-12 bg-theme-bg-alt relative w-full">
        <div className="container mx-auto px-4 py-4 max-w-screen-lg">
          <SearchHeader />
          <div className="max-w-2xl mx-auto">
            <SearchBar variant="fullwidth" placeholder="Search for insurance information, policies, etc..." />
          </div>
        </div>
      </section>

      <section className="py-8 bg-white">
        <div className="container mx-auto px-4 max-w-screen-lg">
          <Suspense fallback={<div className="text-center py-8">Loading search results...</div>}>
            <SearchResults />
          </Suspense>
        </div>
      </section>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildLdJsonSchema(clientData, websiteData)) }}
      />
    </main>
  );
};