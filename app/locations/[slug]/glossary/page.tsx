import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getSupabaseClient } from '@/lib/supabase/server';
import { injectClientData, stripHtmlTags } from '@/lib/utils/content-formatters';
import { getClientData } from '@/lib/client';
import { getWebsiteBySlug, isMultiLocation, getAllWebsites } from '@/lib/website';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const dynamic = 'force-dynamic';

export async function generateStaticParams() {
  const multiLocation = await isMultiLocation();
  if (!multiLocation) return [];

  const websites = await getAllWebsites();
  return websites.map((website) => ({ slug: website.location_slug }));
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
  const canonicalUrl = clientData?.client_website?.canonical_url || '';
  const city = websiteData.client_locations?.city || '';
  const state = websiteData.client_locations?.state || '';

  return {
    title: `Insurance Glossary | ${locationName}`,
    description: `Comprehensive insurance glossary with definitions of key terms and concepts from ${agencyName} in ${city}, ${state}.`,
    metadataBase: new URL(canonicalUrl),
    alternates: {
      canonical: `/locations/${slug}/glossary`,
    },
    robots: {
      index: true,
      follow: true,
      nocache: false,
    },
    openGraph: {
      title: `Insurance Glossary | ${locationName}`,
      description: `Comprehensive insurance glossary with definitions of key terms and concepts from ${agencyName} in ${city}, ${state}.`,
      url: `/locations/${slug}/glossary`,
      siteName: agencyName,
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `Insurance Glossary | ${locationName}`,
      description: `Comprehensive insurance glossary with definitions of key terms and concepts from ${agencyName} in ${city}, ${state}.`,
    },
  };
}

interface GlossaryTerm {
  id: string;
  slug: string;
  term: string;
  category: string | null;
  head: string;
  body: string | null;
  links: any;
  created_at: string;
  updated_at: string;
}

async function getGlossaryTerms(clientId: string, locationId: string): Promise<GlossaryTerm[]> {
  try {
    const supabase = await getSupabaseClient();
    const { data, error } = await supabase
      .from('client_insurance_glossary_pages')
      .select('*')
      .eq('client_id', clientId)
      .eq('location_id', locationId)
      .eq('published', true)
      .order('term', { ascending: true });

    if (error) {
      console.error('Error fetching glossary terms:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getGlossaryTerms:', error);
    return [];
  }
}

function generateLdJsonSchema(clientData: any, locationName: string) {
  const agencyName = clientData?.agency_name || '';

  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: `Insurance Glossary | ${locationName}`,
    description: 'Comprehensive insurance glossary with definitions of key terms and concepts',
    url: '/glossary',
    publisher: {
      '@type': 'Organization',
      name: agencyName || 'Insurance Agency',
      logo: {
        '@type': 'ImageObject',
        url: '/Images/logo.png',
      },
    },
  };
}

export default async function LocationGlossaryPage({ params }: PageProps) {
  const { slug } = await params;

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

  const clientId = process.env.NEXT_PUBLIC_CLIENT_ID;
  const locationId = websiteData.client_locations?.id;
  const locationName = websiteData.client_locations?.location_name || '';

  const terms = clientId && locationId ? await getGlossaryTerms(clientId, locationId) : [];

  // Inject client data into each term's head content
  const processedTerms = terms.map((term) => ({
    ...term,
    head: injectClientData(term.head, clientData as any),
    body: injectClientData(term.body || '', clientData as any),
  }));

  // Group terms by category and sort them alphabetically
  const termsByCategory = processedTerms
    .sort((a, b) => a.term.localeCompare(b.term, 'en', { sensitivity: 'base' }))
    .reduce(
      (acc, term) => {
        const category = term.category || 'General';
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push(term);
        return acc;
      },
      {} as Record<string, GlossaryTerm[]>
    );

  // Sort categories alphabetically
  const sortedCategories = Object.keys(termsByCategory).sort((a, b) => a.localeCompare(b));

  // Get all unique first letters for alphabetical navigation
  const firstLetters = [
    ...new Set(processedTerms.map((term) => term.term.charAt(0).toUpperCase())),
  ].sort();

  return (
    <main className="flex-grow">
      {/* Glossary Hero */}
      <section className="py-20 relative w-full" style={{ backgroundColor: 'var(--hero-bg)' }}>
        <div className="container mx-auto px-4 py-4 max-w-screen-2xl">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold mb-6 text-center" style={{ color: 'var(--hero-text)' }}>
            Insurance Glossary
          </h1>
          <p className="text-theme-body text-lg md:text-xl lg:text-2xl text-center max-w-3xl mx-auto">
            Understanding insurance terms made simple - {locationName}
          </p>
        </div>
      </section>

      {/* Alphabetical Navigation */}
      {firstLetters.length > 0 && (
        <section className="py-8 bg-white border-b border-gray-200">
          <div className="container mx-auto px-4 max-w-screen-xl">
            <div className="flex flex-wrap justify-center gap-2">
              {firstLetters.map((letter) => (
                <a
                  key={letter}
                  href={`#letter-${letter}`}
                  className="w-10 h-10 flex items-center justify-center bg-secondary/10 hover:bg-secondary/20 text-primary font-semibold rounded-lg transition-colors"
                >
                  {letter}
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Terms by Category */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-screen-xl">
          {sortedCategories.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-theme-body text-lg">No glossary terms available at this time.</p>
            </div>
          ) : (
            sortedCategories.map((category) => (
              <div key={category} className="mb-12">
                <h2 className="text-3xl font-heading font-bold text-primary mb-8 border-b-2 border-secondary/20 pb-2">
                  {category}
                </h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {termsByCategory[category].map((term) => (
                    <Link
                      key={term.id}
                      href={`/locations/${slug}/glossary/${term.slug}`}
                      className="block p-4 bg-white rounded-lg border border-gray-200 hover:border-secondary/50 hover:shadow-md transition-all group"
                    >
                      <h4 className="font-semibold text-primary group-hover:text-secondary transition-colors mb-2">
                        {term.term}
                      </h4>
                      <p className="text-sm text-theme-body line-clamp-3">
                        {stripHtmlTags(term.body || term.head).substring(0, 120)}...
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-theme-bg-alt">
        <div className="container mx-auto px-4 max-w-screen-xl text-center">
          <h2 className="text-3xl font-heading font-bold text-primary mb-4">
            Need Help Understanding Your Coverage?
          </h2>
          <p className="text-theme-body mb-8 max-w-2xl mx-auto">
            Our experienced team at {locationName} is here to help explain your insurance options
            and find the right coverage for your needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href={`/locations/${slug}/contact`}
              className="inline-block bg-accent hover:bg-accent/80 text-accent-foreground font-bold py-3 px-8 rounded-lg transition duration-300"
            >
              Contact Us Today
            </Link>
            <Link
              href={`/locations/${slug}/policies`}
              className="inline-block border-2 border-accent text-accent hover:bg-accent hover:text-accent-foreground font-bold py-3 px-8 rounded-lg transition duration-300"
            >
              View Our Policies
            </Link>
          </div>
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateLdJsonSchema(clientData, locationName)),
        }}
      />
    </main>
  );
}

export const revalidate = 3600;
