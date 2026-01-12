import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Calendar } from 'lucide-react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ContentRenderer from 'components/blog/ContentRenderer';
import { getTopicsWithClientData, getPostBySlugWithFallback, getRelatedPosts } from 'lib/blog';
import { getClientData } from '@/lib/client';
import { getWebsiteBySlug, isMultiLocation } from '@/lib/website';
import { getSchemaDefaults, buildPageUrl } from '@/lib/structured-data';
import { Divider } from '@/components/ui/Divider';
import { getSupabaseClient } from 'lib/supabase/server';

interface PageProps {
  params: Promise<{ slug: string; topic: string; postSlug: string }>;
}

export async function generateStaticParams() {
  const multiLocation = await isMultiLocation();
  if (!multiLocation) return [];

  // For now, return empty - posts would need to be fetched per topic
  // This could be enhanced to pre-generate all post pages
  return [];
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, topic, postSlug } = await params;
  const multiLocation = await isMultiLocation();
  if (!multiLocation) return {};

  const [websiteData, postData, topicsData] = await Promise.all([
    getWebsiteBySlug(slug),
    getPostBySlugWithFallback(postSlug),
    getTopicsWithClientData(),
  ]);

  if (!websiteData) return {};

  const locationName = websiteData.client_locations?.location_name || '';
  const { agencyName, canonicalUrl } = getSchemaDefaults(topicsData.clientData);

  if (!postData) {
    return {
      title: `Post Not Found | ${locationName}`,
      description: 'The requested blog post could not be found.',
      metadataBase: new URL(canonicalUrl),
    };
  }

  return {
    title: postData.meta_title || postData.title,
    description: postData.meta_description || postData.content_summary,
    metadataBase: new URL(canonicalUrl),
    alternates: {
      canonical: `/locations/${slug}/blog/${topic}/${postSlug}`,
    },
    robots: {
      index: true,
      follow: true,
      nocache: false,
    },
    openGraph: {
      title: postData.meta_title || postData.title,
      description: postData.meta_description || postData.content_summary,
      url: `/locations/${slug}/blog/${topic}/${postSlug}`,
      siteName: agencyName,
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: postData.meta_title || postData.title,
      description: postData.meta_description || postData.content_summary,
    },
  };
}

export default async function LocationBlogPostPage({ params }: PageProps) {
  const { slug, topic, postSlug } = await params;

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

  // Get topics and client data
  const { topics } = await getTopicsWithClientData();

  // Get the topic data
  const topicData = topics.find((t) => t.slug === topic);
  if (!topicData) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-primary mb-4">Topic not found</h1>
        <Link href={`/locations/${slug}/blog`} className="text-secondary hover:underline">
          Back to Blog
        </Link>
      </div>
    );
  }

  // Get the post data
  const postData = await getPostBySlugWithFallback(postSlug);
  if (!postData) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-primary mb-4">Post not found</h1>
        <Link href={`/locations/${slug}/blog/${topic}`} className="text-secondary hover:underline">
          Back to {topicData.name}
        </Link>
      </div>
    );
  }

  const locationName = websiteData.client_locations?.location_name || '';
  const { agencyName, canonicalUrl } = getSchemaDefaults(clientData);

  const homeUrl = buildPageUrl(canonicalUrl, `/locations/${slug}`);
  const blogUrl = buildPageUrl(canonicalUrl, `/locations/${slug}/blog`);
  const topicUrl = buildPageUrl(canonicalUrl, `/locations/${slug}/blog/${topicData.slug}`);
  const postUrl = buildPageUrl(canonicalUrl, `/locations/${slug}/blog/${topicData.slug}/${postSlug}`);

  const ldJsonSchema = postData.ld_json || {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: postData.title,
    description: postData.content_summary || postData.meta_description || '',
    url: postUrl,
    datePublished: postData.published_at || postData.created_at,
    author: {
      '@type': 'Organization',
      name: agencyName,
      url: canonicalUrl,
    },
    publisher: {
      '@type': 'Organization',
      name: agencyName,
      url: canonicalUrl,
      logo: {
        '@type': 'ImageObject',
        url: buildPageUrl(canonicalUrl, '/Images/logo.png'),
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': postUrl,
    },
  };

  // Get related posts from the same topic
  const relatedPosts = await getRelatedPosts(postData.id, postData.topic_number);

  const supabase = await getSupabaseClient();
  const clientId = process.env.NEXT_PUBLIC_CLIENT_ID!;

  // Get blog categories for related links
  let blogCategories: { [key: string]: string } = {};
  if (postData.related_links) {
    const blogSlugs = postData.related_links
      .map((l: any) => (typeof l === 'string' ? l : l?.url || ''))
      .filter((link: string) => link && !link.includes('-insurance/'));

    if (blogSlugs.length > 0) {
      const { data: blogPostData } = await supabase
        .from('client_blogs_content')
        .select('slug, topic_number')
        .eq('client_id', clientId)
        .in('slug', blogSlugs)
        .eq('published', true);

      if (blogPostData) {
        blogCategories = blogPostData.reduce((acc: { [key: string]: string }, item) => {
          const t = topics.find((tp) => tp.number === item.topic_number);
          if (t) acc[item.slug] = t.slug;
          return acc;
        }, {});
      }
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="relative py-20 border-b border-gray-100" style={{ backgroundColor: 'var(--hero-bg)' }}>
        <div className="container mx-auto px-4 max-w-4xl text-center">
          {/* Breadcrumbs */}
          <nav aria-label="Breadcrumb" className="mb-4 text-sm text-primary/80">
            <ol className="flex flex-wrap justify-center gap-1">
              <li className="flex items-center gap-1">
                <Link href={`/locations/${slug}/blog`} className="underline">
                  Blog
                </Link>
                <span>/</span>
              </li>
              <li className="flex items-center gap-1">
                <Link href={`/locations/${slug}/blog/${topicData.slug}`} className="underline">
                  {topicData.name}
                </Link>
                <span>/</span>
              </li>
              <li className="flex items-center gap-1" aria-current="page">
                <span className="truncate max-w-xs">{postData.title}</span>
              </li>
            </ol>
          </nav>

          <h1 className="text-4xl md:text-5xl font-heading font-bold mb-3 capitalize" style={{ color: 'var(--hero-text)' }}>
            {postData.title}
          </h1>
          <div className="h-1 w-32 bg-accent/60 rounded mx-auto mt-2 mb-4" />
          <div className="flex items-center justify-center text-primary-600">
            <time className="flex items-center" suppressHydrationWarning>
              <Calendar className="h-4 w-4 mr-2" />
              {new Date(postData.published_at || postData.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                timeZone: 'America/Chicago',
              })}
            </time>
            <span className="mx-2">•</span>
            <span>{locationName}</span>
          </div>
        </div>

        <Divider position="bottom" />
      </section>

      {/* Content Card */}
      <section className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8 mt-8">
          {/* Featured Image */}
          <div
            className="relative w-full aspect-square mb-8 rounded-lg overflow-hidden"
            style={{ maxWidth: 1024, maxHeight: 1024 }}
          >
            {postData.image_url ? (
              <Image
                src={postData.image_url}
                alt={postData.title}
                width={1024}
                height={1024}
                className="object-cover w-full h-full"
                priority={true}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-200 text-primary-400">
                <span>Featured Image: {postData.title}</span>
              </div>
            )}
          </div>

          {/* Post Content */}
          <div className="bg-theme-bg/40 rounded-xl shadow-lg p-8">
            <ContentRenderer sections={postData.content_sections} />
          </div>
        </div>
      </section>

      {/* Related Links */}
      {postData.related_links && postData.related_links.length > 0 && (
        <section className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8">
            <div className="flex flex-col items-center mb-6">
              <span className="text-2xl font-heading font-bold text-primary text-center">
                Related Resources
              </span>
              <div className="h-1 w-24 bg-accent/60 rounded mt-3" />
            </div>

            <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
              {postData.related_links.map((raw: any, index: number) => {
                const link: string =
                  typeof raw === 'string' ? raw : raw && typeof raw.url === 'string' ? raw.url : '';
                if (!link) return null;
                let linkUrl = '';
                let displayText = '';

                if (
                  link.toLowerCase().includes('personal-insurance/') ||
                  link.toLowerCase().includes('business-commercial-insurance/') ||
                  link.toLowerCase().includes('optional-niche-insurance/')
                ) {
                  linkUrl = `/locations/${slug}/policies/${link}`;
                  const parts = link.split('/');
                  const slugPart = parts.length > 1 ? parts[1] : link;
                  displayText = slugPart
                    .split('-')
                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(' ');
                } else {
                  const blogCategory = blogCategories[link];
                  if (blogCategory) {
                    linkUrl = `/locations/${slug}/blog/${blogCategory}/${link}`;
                    displayText = link
                      .split('-')
                      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                      .join(' ');
                  } else {
                    return null;
                  }
                }

                return (
                  <li key={index}>
                    <Link
                      href={linkUrl}
                      className="bg-theme-bg/40 rounded-xl p-4 text-center shadow-md border border-secondary hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 flex flex-col items-center justify-center h-full"
                    >
                      <span className="text-md font-heading font-semibold text-primary mb-2">
                        {displayText}
                      </span>
                      <div className="mt-2 flex items-center text-accent/90 font-medium text-sm">
                        <span>Learn More</span>
                        <Image
                          src="/Images/icons/arrow-right.svg"
                          alt="Arrow Right"
                          width={14}
                          height={14}
                          className="ml-1"
                        />
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
      )}

      {/* Related Posts */}
      {relatedPosts && relatedPosts.length > 0 && (
        <section className="container mx-auto px-4 py-12 mb-12">
          <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8">
            <div className="flex flex-col items-center mb-6">
              <span className="text-2xl font-heading font-bold text-primary text-center">
                Related Articles
              </span>
              <div className="h-1 w-24 bg-accent/60 rounded mt-3" />
            </div>

            <ul className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
              {relatedPosts.map((relatedPost) => (
                <li key={relatedPost.id}>
                  <Link
                    href={`/locations/${slug}/blog/${topicData.slug}/${relatedPost.slug}`}
                    className="bg-theme-bg/40 rounded-xl p-5 text-center shadow-md border border-secondary hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 flex flex-col items-center justify-center h-full"
                  >
                    <span className="text-md font-heading font-semibold text-primary mb-2">
                      {relatedPost.title}
                    </span>
                    <div className="mt-2 flex items-center text-accent/90 font-medium text-sm">
                      <span>Read More</span>
                      <Image
                        src="/Images/icons/arrow-right.svg"
                        alt="Arrow Right"
                        width={14}
                        height={14}
                        className="ml-1"
                      />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

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
                name: 'Blog',
                item: blogUrl,
              },
              {
                '@type': 'ListItem',
                position: 3,
                name: topicData.name,
                item: topicUrl,
              },
              {
                '@type': 'ListItem',
                position: 4,
                name: postData.title,
                item: postUrl,
              },
            ],
          }),
        }}
      />
    </main>
  );
}

export const revalidate = 3600;
