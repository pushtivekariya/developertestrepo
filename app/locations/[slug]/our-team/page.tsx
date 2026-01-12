import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import TeamPageTemplate from 'components/our-team/TeamPageTemplate';
import TeamMembers from 'components/our-team/TeamMembers';
import { getClientData } from '@/lib/client';
import { getWebsiteBySlug, isMultiLocation, getAllWebsites } from '@/lib/website';
import { getPageMetadata } from '@/lib/page-metadata';
import { getLocationIdBySlug } from '@/lib/utils';

interface PageProps {
  params: Promise<{ slug: string }>;
}

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
  const multiLocation = await isMultiLocation();
  if (!multiLocation) return {};

  const [websiteData, clientData] = await Promise.all([
    getWebsiteBySlug(slug),
    getClientData(),
  ]);

  if (!websiteData) return {};

  const locationName = websiteData.client_locations?.location_name || '';
  const agencyName = clientData?.agency_name || '';
  const pageMetadata = await getPageMetadata('our-team', websiteData.client_locations?.location_id);
  const canonicalUrl = clientData?.client_website?.canonical_url || '';

  return {
    title: pageMetadata.meta_title || `Our Insurance Team | ${agencyName}`,
    description: pageMetadata.meta_description || `Meet the dedicated insurance professionals at ${agencyName}, serving ${locationName} with personalized insurance solutions.`,
    metadataBase: new URL(canonicalUrl),
    alternates: {
      canonical: `/locations/${slug}/our-team`,
    },
    robots: {
      index: true,
      follow: true,
      nocache: false,
    },
    openGraph: {
      title: pageMetadata.meta_title || `Our Insurance Team | ${agencyName}`,
      description: pageMetadata.meta_description || `Meet the dedicated insurance professionals at ${agencyName}, serving ${locationName} with personalized insurance solutions.`,
      url: `/locations/${slug}/our-team`,
      siteName: agencyName,
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: "summary_large_image",
      title: pageMetadata.meta_title || `Our Insurance Team | ${agencyName}`,
      description: pageMetadata.meta_description || `Meet the dedicated insurance professionals at ${agencyName}, serving ${locationName} with personalized insurance solutions.`,
    }
  };
}

export default async function LocationTeamPage({ params }: PageProps) {
  const { slug } = await params;

  // Only show for multi-location clients
  const multiLocation = await isMultiLocation();
  if (!multiLocation) {
    notFound();
  }

  const websiteData = await getWebsiteBySlug(slug);

  if (!websiteData) {
    notFound();
  }

  const locationId = websiteData.client_locations?.location_id || await getLocationIdBySlug(slug);
  const pageMetadata = await getPageMetadata('our-team', locationId);
  const locationName = websiteData.client_locations?.location_name || '';

  return (
    <TeamPageTemplate
      heroSection={{
        heading: pageMetadata.hero_heading || "Meet Our Team",
        subheading: pageMetadata.hero_subheading || `Dedicated insurance professionals serving ${locationName} and the surrounding area.`,
      }}
    >
      <TeamMembers locationId={locationId} basePath={`/locations/${slug}/our-team`} />
    </TeamPageTemplate>
  );
}

export const revalidate = 3600;
