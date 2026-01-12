import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import BlogPosts from 'components/blog/BlogPosts';
import { getAllTopics, getPostsByTopic } from 'lib/blog';
import { getSchemaDefaults, buildPageUrl, buildOpeningHoursSpec } from '@/lib/structured-data';
import { getWebsiteBySlug, isMultiLocation, getAllWebsites } from '@/lib/website';
import { getClientData } from '@/lib/client';
import { getLocationIdBySlug } from '@/lib/utils';
import { Divider } from '@/components/ui/Divider';

interface PageProps {
  params: Promise<{ slug: string; topic: string }>;
}

export async function generateStaticParams() {
  const multiLocation = await isMultiLocation();
  if (!multiLocation) return [];

  const websites = await getAllWebsites();
  const topics = await getAllTopics();

  const params: { slug: string; topic: string }[] = [];
  for (const website of (websites || [])) {
    if (!website?.location_slug || typeof website.location_slug !== 'string') continue;
    for (const topic of topics) {
      params.push({
        slug: website.location_slug,
        topic: topic.slug,
      });
    }
  }

  return params;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, topic: topicSlug } = await params;
  const multiLocation = await isMultiLocation();
  if (!multiLocation) return {};

  const [topics, clientData, websiteData] = await Promise.all([
    getAllTopics(slug),
    getClientData(),
    getWebsiteBySlug(slug),
  ]);

  const topic = topics.find(t => t.slug === topicSlug) || null;
  if (!topic || !websiteData) {
    return {
      title: 'Topic Not Found',
      description: 'The requested topic could not be found.'
    };
  }

  const agencyName = clientData?.agency_name || '';
  const city = websiteData?.client_locations?.city || clientData?.city || '';
  const state = websiteData?.client_locations?.state || clientData?.state || '';
  const canonicalUrl = clientData?.client_website?.canonical_url || '';

  return {
    title: `${topic.name} | Blog`,
    description: `${topic.description} | Insurance articles by ${agencyName} in ${city}, ${state}`,
    metadataBase: new URL(canonicalUrl),
    alternates: {
      canonical: `/locations/${slug}/blog/${topic.slug}`
    },
    openGraph: {
      title: topic.name,
      description: `${topic.description} | Insurance articles by ${agencyName} in ${city}, ${state}`,
      url: `/locations/${slug}/blog/${topic.slug}`,
      siteName: agencyName,
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: topic.name,
      description: `${topic.description} | Insurance articles by ${agencyName} in ${city}, ${state}`,
    },
  };
}

export default async function LocationTopicPage({ params }: PageProps) {
  const { slug, topic: topicSlug } = await params;

  // Only show for multi-location clients
  const multiLocation = await isMultiLocation();
  if (!multiLocation) {
    notFound();
  }

  // Get topics and client data
  const [topics, clientData, websiteData] = await Promise.all([
    getAllTopics(slug),
    getClientData(),
    getWebsiteBySlug(slug),
  ]);

  const topic = topics.find(t => t.slug === topicSlug) || null;
  if (!topic || !websiteData) {
    return (
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-theme-body-600 mb-4">Topic Not Found</h1>
          <p className="text-gray-600">The requested topic could not be found.</p>
          <Link href={`/locations/${slug}/blog`} className="text-blue-600 hover:underline mt-4 inline-block">
            Back to Blog
          </Link>
        </div>
      </main>
    );
  }

  // Get location ID for filtering posts
  const locationId = await getLocationIdBySlug(slug);
  const posts = await getPostsByTopic(topic.topic_number, locationId);

  const { agencyName, canonicalUrl, city, state, address, zip, email, phone } = getSchemaDefaults(clientData);
  const pageUrl = buildPageUrl(canonicalUrl, `/locations/${slug}/blog`);
  const topicUrl = buildPageUrl(canonicalUrl, `/locations/${slug}/blog/${topic.slug}`);
  const homeUrl = buildPageUrl(canonicalUrl, '/');

  const ldJsonSchema = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "name": `${agencyName} Insurance Blog`,
    "description": `Insurance tips, industry updates, and helpful guides for ${city}, ${state}.`,
    "url": `/locations/${slug}/blog`,
    "publisher": {
      "@type": "Organization",
      "name": agencyName,
      "url": canonicalUrl,
      "telephone": [websiteData?.phone || phone, websiteData?.secondary_phone].filter(Boolean),
      "logo": {
        "@type": "ImageObject",
        "url": `${canonicalUrl}/Images/logo.png`
      }
    },
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
    "telephone": websiteData?.phone || phone,
    "email": websiteData?.email || email,
    ...(websiteData?.business_hours ? { "openingHoursSpecification": buildOpeningHoursSpec(websiteData.business_hours) } : {}),
    "sameAs": Object.values(websiteData?.social_links || {}).filter(Boolean)
  };

  if (!posts || posts.length === 0) {
    return (
      <main className="flex-grow">
        <section className="py-16 relative w-full" style={{ backgroundColor: 'var(--hero-bg)' }}>
          <div className="container mx-auto px-4 py-4 max-w-screen-2xl">
            <div className="mb-8">
              <Link href={`/locations/${slug}/blog`} className="text-blue-600 hover:underline mb-4 inline-flex items-center">
                <img src="/Images/icons/arrow-left.svg" alt="Arrow Left" className="h-4 w-4 mr-1" />
                Back to All Topics
              </Link>
              <h1 className="text-4xl md:text-5xl font-heading font-bold text-primary mt-4 mb-4">
                {topic.name}
              </h1>
              <div className="text-theme-body text-lg md:text-xl">
                {topic.description}
              </div>
              <p className="text-gray-600 mt-2">
                No articles available in this category yet.
              </p>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="flex-grow">
      {/* Topic Hero */}
      <section className="py-20 relative w-full" style={{ backgroundColor: 'var(--hero-bg)' }}>
        <div className="container mx-auto px-4 py-4 max-w-screen-2xl">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="mb-6 text-sm text-primary/80">
            <ol className="flex flex-wrap justify-center gap-1">
              <li className="flex items-center gap-1">
                <Link href={`/locations/${slug}/blog`} className="underline">Blog</Link>
                <span>/</span>
              </li>
              <li className="flex items-center gap-1" aria-current="page">
                <span>{topic.name}</span>
              </li>
            </ol>
          </nav>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-primary mb-6 text-center capitalize">
            {topic.name}
          </h1>

          <div className="h-1 w-32 bg-accent/60 rounded mx-auto mt-2 mb-6" />

          {topic.description && (
            <p className="text-theme-body text-lg md:text-xl lg:text-2xl text-center max-w-3xl mx-auto mb-4">
              {topic.description}
            </p>
          )}

          <p className="text-theme-body/80 text-center">
            {posts.length} {posts.length === 1 ? 'article' : 'articles'} in this category
          </p>
        </div>

        <Divider position="bottom" />
      </section>

      {/* Blog Posts */}
      <BlogPosts posts={posts} topic={topic} basePath={`/locations/${slug}/blog`} />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ldJsonSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": homeUrl
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": "Blog",
                "item": pageUrl
              },
              {
                "@type": "ListItem",
                "position": 3,
                "name": topic.name,
                "item": topicUrl
              }
            ]
          })
        }}
      />
    </main>
  );
}

export const revalidate = 3600;
