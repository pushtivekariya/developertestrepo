import React from 'react';
import TeamMemberTemplate from 'components/our-team/TeamMemberTemplate';
import { getTeamMemberBySlug, getTeamMembers } from 'lib/team';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getClientData } from '@/lib/client';
import { getWebsiteBySlug, isMultiLocation, getAllWebsites } from '@/lib/website';
import { getSchemaDefaults, buildPageUrl } from '@/lib/structured-data';
import { getLocationIdBySlug } from '@/lib/utils';

interface PageProps {
  params: Promise<{ slug: string; memberSlug: string }>;
}

export async function generateStaticParams() {
  const multiLocation = await isMultiLocation();
  if (!multiLocation) return [];

  const websites = await getAllWebsites();
  const params: { slug: string; memberSlug: string }[] = [];

  for (const website of (websites || [])) {
    if (!website?.location_slug || typeof website.location_slug !== 'string') continue;
    const locationId = await getLocationIdBySlug(website.location_slug);
    const teamMembers = await getTeamMembers(locationId);
    
    for (const member of teamMembers) {
      params.push({
        slug: website.location_slug,
        memberSlug: member.slug,
      });
    }
  }

  return params;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, memberSlug } = await params;
  const multiLocation = await isMultiLocation();
  if (!multiLocation) return {};

  const locationId = await getLocationIdBySlug(slug);
  const [teamMember, clientData, websiteData] = await Promise.all([
    getTeamMemberBySlug(memberSlug, locationId),
    getClientData(),
    getWebsiteBySlug(slug),
  ]);

  const { agencyName, canonicalUrl } = getSchemaDefaults(clientData);

  if (!teamMember || !websiteData) {
    return {
      title: "Team member not found",
      description: "Team member not found",
      metadataBase: new URL(canonicalUrl),
      alternates: {
        canonical: `/locations/${slug}/our-team/${memberSlug}`
      },
      robots: {
        index: false,
        follow: true,
      },
      openGraph: {
        title: "Team member not found",
        description: "Team member not found",
        url: `/locations/${slug}/our-team/${memberSlug}`,
        siteName: agencyName,
        locale: 'en_US',
        type: 'website',
      },
      twitter: {
        card: "summary_large_image",
        title: "Team member not found",
        description: "Team member not found",
      }
    };
  }
  
  const title = `${teamMember.name} - Insurance Agent`;
  const description = `Meet ${teamMember.name}, ${teamMember.position} at ${agencyName}. ${teamMember.excerpt || ''}`;

  return {
    title,
    description,
    metadataBase: new URL(canonicalUrl),
    alternates: {
      canonical: `/locations/${slug}/our-team/${teamMember.slug}`
    },
    robots: {
      index: true,
      follow: true,
      nocache: false,
    },
    openGraph: {
      title,
      description,
      url: `/locations/${slug}/our-team/${teamMember.slug}`,
      siteName: agencyName,
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    }
  };
}

export default async function LocationTeamMemberPage({ params }: PageProps) {
  const { slug, memberSlug } = await params;

  // Only show for multi-location clients
  const multiLocation = await isMultiLocation();
  if (!multiLocation) {
    notFound();
  }

  const locationId = await getLocationIdBySlug(slug);
  
  // Find the team member data using the slug from the route
  const teamMember = await getTeamMemberBySlug(memberSlug, locationId);
  
  if (!teamMember) {
    notFound();
  }

  // Enhanced structured data for this team member with more specific Person schema
  const clientData = await getClientData();
  const { agencyName, canonicalUrl } = getSchemaDefaults(clientData);
  const pageUrl = buildPageUrl(canonicalUrl, `/locations/${slug}/our-team/${teamMember.slug}`);

  const ldJsonSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": teamMember.name,
    "jobTitle": teamMember.position,
    "description": teamMember.excerpt || '',
    "url": pageUrl,
    "image": teamMember.imagePath ? `${canonicalUrl}${teamMember.imagePath}` : undefined,
    "worksFor": {
      "@type": "Organization",
      "name": agencyName,
      "url": canonicalUrl
    },
    "telephone": teamMember.phone,
    "knowsAbout": teamMember.specialties || ["Insurance", "Risk Management", "Commercial Insurance"],
    "alumniOf": "Insurance Industry Professional"
  };
  
  // Get paragraphs from description, sorted by key
  const paragraphs = teamMember.description 
    ? Object.keys(teamMember.description)
        .sort()
        .map(key => teamMember.description![key])
        .filter((p): p is string => p !== undefined && p !== null && p !== '')
    : [];

  return (
    <TeamMemberTemplate
      teamMember={teamMember}
      basePath={`/locations/${slug}/our-team`}
    >
      {paragraphs.length > 0 ? (
        paragraphs.map((paragraph, index) => (
          <p key={index} className="mb-4 last:mb-0">
            {paragraph || ''}
          </p>
        ))
      ) : teamMember.excerpt ? (
        <p className="mb-4">{teamMember.excerpt}</p>
      ) : null}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ldJsonSchema) }}
      />
    </TeamMemberTemplate>
  );
}

export const revalidate = 3600;
