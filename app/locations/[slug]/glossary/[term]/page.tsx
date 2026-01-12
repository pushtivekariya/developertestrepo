import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import RelatedPolicyPages from '@/components/glossary/RelatedPolicyPages';
import InsuranceCTA from '@/components/common/InsuranceCTA';
import Breadcrumb from '@/components/common/Breadcrumb';
import { Divider } from '@/components/ui/Divider';
import { getClientData } from '@/lib/client';
import { getWebsiteBySlug, isMultiLocation } from '@/lib/website';
import { validateAndGetRelatedPolicies } from '@/lib/services/glossary';
import { injectClientData, formatGlossaryContent } from '@/lib/utils/content-formatters';
import { getSupabaseClient } from '@/lib/supabase/server';
import { getSchemaDefaults, buildPageUrl } from '@/lib/structured-data';

interface PageProps {
  params: Promise<{ slug: string; term: string }>;
}

export async function generateStaticParams() {
  const multiLocation = await isMultiLocation();
  if (!multiLocation) return [];

  // Return empty for now - terms would need to be fetched
  return [];
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, term: termSlug } = await params;
  const multiLocation = await isMultiLocation();
  if (!multiLocation) return {};

  const supabase = await getSupabaseClient();
  const clientId = process.env.NEXT_PUBLIC_CLIENT_ID;

  const [websiteData, clientData] = await Promise.all([
    getWebsiteBySlug(slug),
    getClientData(),
  ]);

  if (!websiteData) return {};

  const locationId = websiteData.client_locations?.id;
  const { data: term } = await supabase
    .from('client_insurance_glossary_pages')
    .select('id, slug, term, head, body')
    .eq('client_id', clientId)
    .eq('location_id', locationId)
    .eq('slug', termSlug)
    .eq('published', true)
    .single();

  const locationName = websiteData.client_locations?.location_name || '';
  const agencyName = clientData?.agency_name || '';
  const canonicalUrl = clientData?.client_website?.canonical_url || '';
  const injectedHead =
    clientData && term ? injectClientData(term.head, clientData as any) : term?.head || '';
  const plainTextDescription = (injectedHead || term?.term || 'Insurance term definition')
    .replace(/\n/g, ' ')
    .substring(0, 160);

  return {
    title: term ? `${term.term} | ${locationName}` : 'Term Not Found',
    description: term ? plainTextDescription : 'The requested insurance term could not be found.',
    metadataBase: canonicalUrl ? new URL(canonicalUrl) : undefined,
    alternates: {
      canonical: `/locations/${slug}/glossary/${termSlug}`,
    },
    robots: {
      index: true,
      follow: true,
      nocache: false,
    },
    openGraph: {
      title: term ? `${term.term} | ${locationName}` : 'Term Not Found',
      description: term ? plainTextDescription : 'The requested insurance term could not be found.',
      url: `/locations/${slug}/glossary/${termSlug}`,
      siteName: agencyName,
      locale: 'en_US',
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: term ? `${term.term} | ${locationName}` : 'Term Not Found',
      description: term ? plainTextDescription : 'The requested insurance term could not be found.',
    },
  };
}

export default async function LocationGlossaryTermPage({ params }: PageProps) {
  const { slug, term: termSlug } = await params;

  // Only show for multi-location clients
  const multiLocation = await isMultiLocation();
  if (!multiLocation) {
    notFound();
  }

  const [websiteData, clientData] = await Promise.all([
    getWebsiteBySlug(slug),
    getClientData(),
  ]);

  if (!websiteData) {
    notFound();
  }

  const supabase = await getSupabaseClient();
  const clientId = process.env.NEXT_PUBLIC_CLIENT_ID;
  const locationId = websiteData.client_locations?.id;

  const { data: term } = await supabase
    .from('client_insurance_glossary_pages')
    .select('id, slug, term, head, body, related_policy_links, created_at, updated_at')
    .eq('client_id', clientId)
    .eq('location_id', locationId)
    .eq('slug', termSlug)
    .eq('published', true)
    .single();

  if (!term) {
    notFound();
  }
  
  // related_policy_links is already an array of {slug, title} from AI generation
  const relatedPolicyLinks = term.related_policy_links || [];
  // Validate against published policies for this location
  const relatedPolicyPages = await validateAndGetRelatedPolicies(clientId, locationId, relatedPolicyLinks, slug);

  // Process content with client data injection
  const injectedBody = injectClientData(term.body, clientData as any);
  const processedBody = formatGlossaryContent(injectedBody, term.term);

  const { agencyName, canonicalUrl } = getSchemaDefaults(clientData);
  const pageUrl = buildPageUrl(canonicalUrl, `/locations/${slug}/glossary/${term.slug}`);
  const glossaryUrl = buildPageUrl(canonicalUrl, `/locations/${slug}/glossary`);
  const homeUrl = buildPageUrl(canonicalUrl, `/locations/${slug}`);

  const ldJsonSchema = {
    '@context': 'https://schema.org',
    '@type': 'DefinedTerm',
    name: term.term,
    description:
      injectedBody
        .split('\n')
        .find((line) => line.trim())
        ?.substring(0, 200) || term.term,
    url: pageUrl,
    inDefinedTermSet: {
      '@type': 'DefinedTermSet',
      name: 'Insurance Glossary',
      url: glossaryUrl,
    },
    publisher: {
      '@type': 'Organization',
      name: agencyName,
      url: canonicalUrl,
      logo: {
        '@type': 'ImageObject',
        url: `${canonicalUrl}/Images/logo.png`,
      },
    },
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="py-20 relative w-full" style={{ backgroundColor: 'var(--hero-bg)' }}>
        <div className="container mx-auto px-4 py-4 max-w-screen-2xl">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold mb-6 text-center" style={{ color: 'var(--hero-text)' }}>
            {term.term}
          </h1>
        </div>
        <Divider position="bottom" />
      </section>

      {/* Breadcrumb */}
      <div className="container mx-auto px-4 max-w-4xl pt-6">
        <Breadcrumb
          items={[
            { label: 'Home', href: `/locations/${slug}` },
            { label: 'Glossary', href: `/locations/${slug}/glossary` },
            { label: term.term },
          ]}
        />
      </div>

      {/* Main Content */}
      <section className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto bg-card-bg rounded-xl shadow-lg p-8 border border-card-border">
          {processedBody && (
            <div 
              className="prose prose-lg max-w-none text-theme-body prose-headings:text-primary prose-headings:font-heading prose-h2:text-xl prose-h2:mt-6 prose-h2:mb-3 prose-h3:text-lg prose-h3:mt-5 prose-h3:mb-2 prose-p:leading-relaxed prose-p:mb-4 prose-a:text-accent prose-a:no-underline hover:prose-a:underline prose-strong:text-primary" 
              dangerouslySetInnerHTML={{ __html: processedBody }} 
            />
          )}

          {/* Related Policy Pages */}
          <div className="mt-12">
            <RelatedPolicyPages relatedPolicyPages={relatedPolicyPages} />
          </div>
        </div>
      </section>

      <InsuranceCTA
        title="Questions About Your Insurance?"
        description="Our team{agency_name} is here to help you understand your coverage options and find the right protection for your needs."
        primaryButtonText="Get a Quote"
        primaryButtonHref={`/locations/${slug}/contact`}
        secondaryButtonText="Browse All Terms"
        secondaryButtonHref={`/locations/${slug}/glossary`}
        agencyName={clientData?.agency_name ? ` at ${clientData.agency_name}` : ''}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ldJsonSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              {
                '@type': 'ListItem',
                position: 1,
                name: 'Home',
                item: homeUrl,
              },
              {
                '@type': 'ListItem',
                position: 2,
                name: 'Glossary',
                item: glossaryUrl,
              },
              {
                '@type': 'ListItem',
                position: 3,
                name: term.term,
                item: pageUrl,
              },
            ],
          }),
        }}
      />
    </main>
  );
}

export const dynamic = 'force-dynamic';
export const dynamicParams = true;
