import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import PolicyPageTemplate from '@/components/policies/PolicyPageTemplate';
import { getClientData } from '@/lib/client';
import { getWebsiteBySlug, isMultiLocation, getAllWebsites } from '@/lib/website';
import { getSchemaDefaults, buildPageUrl } from '@/lib/structured-data';
import { getAllPolicies } from '@/lib/policy-categories';
import { supabase } from '@/lib/supabase';
import { validateRelatedPolicies } from '@/lib/policy-validation';

interface PageProps {
  params: Promise<{ slug: string; policy: string }>;
}

/**
 * Get a single policy by slug for a specific location (no category filter)
 */
async function getPolicyBySlugForLocation(policySlug: string, locationId: string) {
  const clientId = process.env.NEXT_PUBLIC_CLIENT_ID;
  if (!clientId) return null;

  const { data, error } = await supabase
    .from('client_policy_pages')
    .select('*')
    .eq('client_id', clientId)
    .eq('slug', policySlug)
    .eq('location_id', locationId)
    .eq('published', true)
    .single();

  if (error) {
    if (error.code !== 'PGRST116') {
      console.error('Error fetching policy by slug:', error);
    }
    return null;
  }

  return data;
}

export async function generateStaticParams() {
  const multiLocation = await isMultiLocation();
  if (!multiLocation) return [];

  const websites = await getAllWebsites();
  const params: { slug: string; policy: string }[] = [];

  for (const website of websites) {
    const locationId = website.id;
    if (!locationId) continue;

    const policies = await getAllPolicies(locationId);
    for (const policy of policies) {
      params.push({
        slug: website.location_slug,
        policy: policy.slug,
      });
    }
  }

  return params;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, policy: policySlug } = await params;

  const multiLocation = await isMultiLocation();
  if (!multiLocation) return {};

  const [websiteData, clientData] = await Promise.all([
    getWebsiteBySlug(slug),
    getClientData(),
  ]);

  if (!websiteData) return {};

  const locationId = websiteData.client_locations?.id;
  if (!locationId) return {};

  const policy = await getPolicyBySlugForLocation(policySlug, locationId);
  if (!policy) {
    return {
      title: 'Policy Not Found',
      description: 'The requested policy page could not be found.',
    };
  }

  const { agencyName, canonicalUrl } = getSchemaDefaults(clientData);
  const locationName = websiteData.client_locations?.location_name || '';

  const title = policy.meta_title || `${policy.title} | ${locationName}`;
  const description = policy.hero_section?.subtitle || policy.content_summary || 
    `Learn about ${policy.title} from ${agencyName} at ${locationName}.`;

  // Use absolute title to prevent layout template from appending agency name again
  // (database meta_title already includes agency name)
  return {
    title: {
      absolute: title,
    },
    description,
    keywords: policy.keywords || [],
    metadataBase: new URL(canonicalUrl),
    alternates: {
      canonical: `/locations/${slug}/policies/${policySlug}`,
    },
    robots: {
      index: true,
      follow: true,
      nocache: false,
    },
    openGraph: {
      title,
      description,
      url: `/locations/${slug}/policies/${policySlug}`,
      siteName: agencyName,
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    other: {
      'X-Robots-Tag': 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1',
    },
  };
}

export default async function LocationPolicyPage({ params }: PageProps) {
  const { slug, policy: policySlug } = await params;

  const multiLocation = await isMultiLocation();
  if (!multiLocation) {
    notFound();
  }

  const websiteData = await getWebsiteBySlug(slug);
  if (!websiteData) {
    notFound();
  }

  const locationId = websiteData.client_locations?.id;
  if (!locationId) {
    notFound();
  }

  const [policy, clientData] = await Promise.all([
    getPolicyBySlugForLocation(policySlug, locationId),
    getClientData(),
  ]);

  if (!policy) {
    notFound();
  }

  const locationName = websiteData.client_locations?.location_name || '';
  const locationCity = websiteData.client_locations?.city || '';
  const locationState = websiteData.client_locations?.state || '';
  const locationAddress = websiteData.client_locations?.address_line_1 || '';
  const locationZip = websiteData.client_locations?.zip || '';
  const { agencyName, canonicalUrl } = getSchemaDefaults(clientData);
  
  const pageUrl = buildPageUrl(canonicalUrl, `/locations/${slug}/policies/${policy.slug}`);
  const homeUrl = buildPageUrl(canonicalUrl, '/');
  const policiesUrl = buildPageUrl(canonicalUrl, `/locations/${slug}/policies`);

  // Build areaServed dynamically from service_areas
  const serviceAreas = websiteData.client_locations?.service_areas || websiteData?.service_areas || [];
  const areaServed = serviceAreas.map((areaName: string) => ({
    '@type': 'City',
    'name': areaName,
  }));

  // Build about entities from policy's about_topics
  const aboutEntities = (policy.about_topics || []).map((topic: string) => ({
    '@type': 'Thing',
    'name': topic,
  }));

  // Build LD-JSON schema (always generated on frontend, never from database)
  const agencyId = `${canonicalUrl}/#insurance-agency`;
  const ldJsonSchema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'InsuranceAgency',
        '@id': agencyId,
        'name': agencyName,
        'url': pageUrl,
        'address': {
          '@type': 'PostalAddress',
          ...(locationAddress ? { 'streetAddress': locationAddress } : {}),
          'addressLocality': locationCity,
          'addressRegion': locationState,
          ...(locationZip ? { 'postalCode': locationZip } : {}),
          'addressCountry': 'US',
        },
        'areaServed': areaServed,
      },
      {
        '@type': 'Service',
        'serviceType': 'Insurance',
        'name': policy.title,
        'description': policy.content_summary || policy.description || '',
        'url': pageUrl,
        'provider': {
          '@id': agencyId,
        },
        'areaServed': areaServed,
        ...(aboutEntities.length > 0 ? { 'about': aboutEntities } : {}),
      },
      ...(policy.faqs && policy.faqs.length > 0 ? [{
        '@type': 'FAQPage',
        'mainEntity': policy.faqs.map((faq: any) => ({
          '@type': 'Question',
          'name': faq.question,
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': faq.answer,
          },
        })),
      }] : []),
    ],
  };

  // Build breadcrumb schema
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': [
      {
        '@type': 'ListItem',
        'position': 1,
        'name': 'Home',
        'item': homeUrl,
      },
      {
        '@type': 'ListItem',
        'position': 2,
        'name': `${locationName} Policies`,
        'item': policiesUrl,
      },
      {
        '@type': 'ListItem',
        'position': 3,
        'name': policy.title,
        'item': pageUrl,
      },
    ],
  };

  // Validate and filter related policies (only show published)
  const clientId = process.env.NEXT_PUBLIC_CLIENT_ID!;
  const validatedRelatedPolicies = locationId 
    ? await validateRelatedPolicies(policy.related_policies, clientId, locationId)
    : [];

  // Add basePath for URL construction
  const relatedPolicies = validatedRelatedPolicies.map((p: any) => ({
    ...p,
    basePath: `/locations/${slug}/policies`,
  }));

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ldJsonSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <PolicyPageTemplate
        heroSection={{
          heading: policy.hero_section?.heading || policy.title || '',
          subheading: policy.hero_section?.subheading || '',
        }}
        relatedPolicies={relatedPolicies}
        relatedTerms={policy.related_terms || []}
        canonicalUrl={`/locations/${slug}/policies/${policySlug}`}
        contentSections={policy.content_sections}
        faqs={policy.faqs || []}
        youtubeUrl={policy.youtube_url}
      >
        {null}
      </PolicyPageTemplate>
    </>
  );
}

export const revalidate = 3600;