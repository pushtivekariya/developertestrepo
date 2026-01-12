import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import BlogTopics from 'components/blog/BlogTopics';
import { getClientData } from '@/lib/client';
import { getWebsiteBySlug, isMultiLocation, getAllWebsites } from '@/lib/website';
import { getPageMetadata } from '@/lib/page-metadata';
import { getAllTopics } from '@/lib/blog';
import { getSchemaDefaults } from '@/lib/structured-data';
import { Divider } from '@/components/ui/Divider';

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

  const agencyName = clientData?.agency_name || '';
  const pageMetadata = await getPageMetadata('blog', websiteData?.client_locations?.location_id);
  const canonicalUrl = clientData?.client_website?.canonical_url || '';

  return {
    title: pageMetadata.meta_title || `Insurance Blog | ${agencyName}`,
    description: pageMetadata.meta_description,
    metadataBase: new URL(canonicalUrl),
    alternates: {
      canonical: `/locations/${slug}/blog`,
    },
    robots: {
      index: true,
      follow: true,
      nocache: false,
    },
    openGraph: {
      title: pageMetadata.meta_title || `Insurance Blog | ${agencyName}`,
      description: pageMetadata.meta_description,
      url: `/locations/${slug}/blog`,
      siteName: agencyName,
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: pageMetadata.meta_title || `Insurance Blog | ${agencyName}`,
      description: pageMetadata.meta_description,
    },
  };
}

const buildLdJsonSchema = (clientData: any, websiteData: any, slug: string) => {
  const { agencyName, city, state } = getSchemaDefaults(clientData);
  const locationCity = websiteData?.client_locations?.city || city;

  return {
    "@context": "https://schema.org",
    "@type": "Blog",
    "name": `${agencyName} Insurance Blog`,
    "description": `Insurance tips, industry updates, and helpful guides for ${locationCity}${state ? `, ${state}` : ''} residents from ${agencyName}.`,
    "url": `/locations/${slug}/blog`,
    "publisher": {
      "@type": "Organization",
      "name": agencyName,
      "logo": {
        "@type": "ImageObject",
        "url": "/Images/logo.png"
      }
    }
  };
};

export default async function LocationBlogPage({ params }: PageProps) {
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
  const topics = await getAllTopics(slug, { agency_name: websiteData?.agency_name, city: websiteData?.client_locations?.city, state: websiteData?.client_locations?.state });

  if (!websiteData) {
    notFound();
  }

  const locationCity = websiteData?.client_locations?.city || clientData?.city || '';
  const locationState = websiteData?.client_locations?.state || clientData?.state || '';
  const agencyName = clientData?.agency_name || '';

  return (
    <main className="flex-grow">
      {/* Blog Hero */}
      <section className="py-20 relative w-full" style={{ backgroundColor: 'var(--hero-bg)' }}>
        <div className="container mx-auto px-4 py-4 max-w-screen-2xl">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold mb-6 text-center" style={{ color: 'var(--hero-text)' }}>
            {locationCity || ""}{locationState ? ` ${locationState},` : ""} Insurance Blog
          </h1>

          <div className="h-1 w-32 bg-accent/60 rounded mx-auto mt-2 mb-6" />

          <p className="text-theme-body text-lg md:text-xl lg:text-2xl text-center max-w-3xl mx-auto">
            Insights, tips, and updates from {agencyName}
          </p>
        </div>

        <Divider position="bottom" />
      </section>

      {/* Blog Topics */}
      <BlogTopics topics={topics} basePath={`/locations/${slug}/blog`} />

      {/* Newsletter Signup */}
      <section className="py-16 bg-theme-bg-alt">
        <div className="container mx-auto px-4 max-w-screen-xl text-center">
          <h2 className="text-3xl font-heading font-bold text-primary mb-4">
            Subscribe to Our Newsletter
          </h2>
          <p className="text-theme-body mb-8 max-w-2xl mx-auto">
            Get the latest insurance tips, industry news, and special offers delivered straight to your inbox.
          </p>
          <form className="max-w-md mx-auto flex">
            <input
              type="email"
              placeholder="Your email address"
              className="flex-grow px-4 py-3 rounded-l-lg border border-r-0 border-secondary focus:outline-none focus:ring-2 focus:ring-secondary"
              required
            />
            <button
              type="submit"
              className="bg-accent hover:bg-accent/80 text-accent-foreground font-bold py-3 px-6 rounded-r-lg transition duration-300"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildLdJsonSchema(clientData, websiteData, slug)) }}
      />
    </main>
  );
}

export const revalidate = 3600;
