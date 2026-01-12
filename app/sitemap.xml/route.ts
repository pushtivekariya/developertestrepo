import { NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/supabase/server'
import { generateSlug, replaceTemplateVariables } from '@/lib/blog'
import { getClientData } from '@/lib/client'
import { getAllWebsites, isMultiLocation } from '@/lib/website'

export const dynamic = 'force-dynamic';

// Change frequency values for sitemap
const changeFrequency = {
  weekly: 'weekly' as const,
  monthly: 'monthly' as const,
  yearly: 'yearly' as const,
}

// Helper function to dynamically generate topics from database
async function getTopics() {
  const clientId = process.env.NEXT_PUBLIC_CLIENT_ID!;
  const supabase = await getSupabaseClient();
  
  // Get client data for template variable replacement
  const { data: clientData } = await supabase
    .from('clients')
    .select('agency_name, city')
    .eq('id', clientId)
    .single();

  // Fetch topic data from client_static_topics_images
  const { data: topicImages } = await supabase
    .from('client_static_topics_images')
    .select('topic_number, topic_name, image_url')
    .order('topic_number');

  // Process topics with proper template variable replacement
  const topics = topicImages?.map((topic: { topic_number: number; topic_name: string; image_url?: string }) => {
    // Replace all template variables in topic name using the utility function
    const finalTopicName = replaceTemplateVariables(topic.topic_name, {
      agency_name:  clientData?.agency_name || "",
      city: clientData?.city || ""
    });
    
    // Create slug from the processed topic name (same logic as blog pages)
    const slug = generateSlug(finalTopicName);

    return {
      slug: slug,
      number: topic.topic_number
    };
  }) || [];

  return topics;
}

// Helper function to format date for sitemap
const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

export async function GET() {
  // Get client data for dynamic BASE_URL
  const clientData = await getClientData();
  const BASE_URL = clientData?.client_website?.canonical_url?.replace(/\/+$/, '') || '';
  
  if (!BASE_URL) {
    throw new Error('Missing canonical_url for sitemap generation');
  }
  
  // Get location URLs if multi-location
  const multiLocation = await isMultiLocation();

  // For multi-location clients, only include home and privacy as global routes
  // All other pages should use location-specific routes
  const mainPages = multiLocation ? [
    {
      url: `${BASE_URL}`,
      lastModified: new Date(),
      changeFrequency: changeFrequency.weekly,
      priority: 1,
    },
    {
      url: `${BASE_URL}/privacy`,
      lastModified: new Date(),
      changeFrequency: changeFrequency.yearly,
      priority: 0.3,
    }
  ] : [
    {
      url: `${BASE_URL}`,
      lastModified: new Date(),
      changeFrequency: changeFrequency.weekly,
      priority: 1,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: changeFrequency.monthly,
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/contact`,
      lastModified: new Date(),
      changeFrequency: changeFrequency.monthly,
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/policies`,
      lastModified: new Date(),
      changeFrequency: changeFrequency.monthly,
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/faq`,
      lastModified: new Date(),
      changeFrequency: changeFrequency.monthly,
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: changeFrequency.weekly,
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/glossary`,
      lastModified: new Date(),
      changeFrequency: changeFrequency.monthly,
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/our-team`,
      lastModified: new Date(),
      changeFrequency: changeFrequency.monthly,
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/privacy`,
      lastModified: new Date(),
      changeFrequency: changeFrequency.yearly,
      priority: 0.3,
    }
  ];
  const locationUrls: Array<{
    url: string;
    lastModified: Date;
    changeFrequency: string;
    priority: number;
  }> = [];

  if (multiLocation) {
    const websites = await getAllWebsites();
    for (const website of websites) {
      locationUrls.push({
        url: `${BASE_URL}/locations/${website.location_slug}`,
        lastModified: new Date(),
        changeFrequency: changeFrequency.monthly,
        priority: 0.8,
      });
      // Add location sub-pages
      for (const subpage of ['about', 'contact', 'policies', 'blog', 'our-team']) {
        locationUrls.push({
          url: `${BASE_URL}/locations/${website.location_slug}/${subpage}`,
          lastModified: new Date(),
          changeFrequency: changeFrequency.monthly,
          priority: 0.7,
        });
      }
    }
  }

  // Fetch dynamic content from database
  const clientId = process.env.NEXT_PUBLIC_CLIENT_ID;
  
  try {
    const supabase = await getSupabaseClient();
    
    // 1. Fetch blog posts
    const { data: blogPosts } = await supabase
      .from('client_blogs_content')
      .select('slug, topic_number, published_at, created_at')
      .eq('client_id', clientId)
      .eq('published', true)
      .order('published_at', { ascending: false });

    // 2. Fetch policy pages (include location_id for multi-location filtering)
    const { data: policyPages } = await supabase
      .from('client_policy_pages')
      .select('slug, updated_at, created_at, location_id')
      .eq('client_id', clientId)
      .eq('published', true);

    // Generate dynamic URLs
    const dynamicUrls: Array<{
      url: string;
      lastModified: Date;
      changeFrequency: string;
      priority: number;
    }> = [];


    const TOPICS = await getTopics();

    // Add blog post URLs (only for single-location clients - multi-location uses location blog routes)
    if (!multiLocation && blogPosts) {
      for (const post of blogPosts) {
        const topic = TOPICS.find(t => t.number === post.topic_number);
        if (topic) {
          dynamicUrls.push({
            url: `${BASE_URL}/blog/${topic.slug}/${post.slug}`,
            lastModified: new Date(post.published_at || post.created_at),
            changeFrequency: changeFrequency.weekly,
            priority: 0.7,
          });
        }
      }
    }

    // Add blog topic category URLs (only for single-location clients)
    if (!multiLocation) {
      for (const topic of TOPICS) {
        dynamicUrls.push({
          url: `${BASE_URL}/blog/${topic.slug}`,
          lastModified: new Date(),
          changeFrequency: changeFrequency.weekly,
          priority: 0.6,
        });
      }
    }

    // Add policy page URLs (location-specific for multi-location, global for single-location)
    if (policyPages) {
      if (multiLocation) {
        // For multi-location clients, generate location-specific policy URLs
        const websites = await getAllWebsites();
        for (const website of websites) {
          // Filter policies for this location
          const locationPolicies = policyPages.filter((p: any) => p.location_id === website.id);
          for (const policy of locationPolicies) {
            dynamicUrls.push({
              url: `${BASE_URL}/locations/${website.location_slug}/policies/${policy.slug}`,
              lastModified: new Date(policy.updated_at || policy.created_at),
              changeFrequency: changeFrequency.monthly,
              priority: 0.8,
            });
          }
        }
      } else {
        // For single-location clients, use global policy URLs
        for (const policy of policyPages) {
          dynamicUrls.push({
            url: `${BASE_URL}/policies/${policy.slug}`,
            lastModified: new Date(policy.updated_at || policy.created_at),
            changeFrequency: changeFrequency.monthly,
            priority: 0.8,
          });
        }
      }
    }


    // Add glossary term URLs from client_insurance_glossary_pages (location-specific pages)
    const { data: glossaryPages } = await supabase
      .from('client_insurance_glossary_pages')
      .select('slug, location_id, updated_at, created_at')
      .eq('client_id', clientId)
      .eq('published', true);

    if (glossaryPages) {
      if (multiLocation) {
        // For multi-location clients, generate location-specific glossary URLs
        const websites = await getAllWebsites();
        for (const website of websites) {
          // Filter glossary pages for this location
          const locationGlossary = glossaryPages.filter((g: any) => g.location_id === website.id);
          locationGlossary.forEach((term: any) => {
            dynamicUrls.push({
              url: `${BASE_URL}/locations/${website.location_slug}/glossary/${term.slug}`,
              lastModified: new Date(term.updated_at || term.created_at),
              changeFrequency: changeFrequency.monthly,
              priority: 0.5,
            });
          });
        }
      } else {
        // For single-location clients, use global glossary URLs
        glossaryPages.forEach((term: any) => {
          dynamicUrls.push({
            url: `${BASE_URL}/glossary/${term.slug}`,
            lastModified: new Date(term.updated_at || term.created_at),
            changeFrequency: changeFrequency.monthly,
            priority: 0.5,
          });
        });
      }
    }

    // Add team member URLs (only for single-location clients)
    if (!multiLocation) {
      const { data: teamMembers } = await supabase
        .from('client_staff')
        .select('first_name, last_name')
        .eq('active', true)
        .eq('client_id', clientId);

      if (teamMembers) {
        teamMembers.forEach(member => {
          const slug = `${member.first_name.toLowerCase()}-${member.last_name.toLowerCase().replace(/'/g, '')}`;
          dynamicUrls.push({
            url: `${BASE_URL}/our-team/${slug}`,
            lastModified: new Date(),
            changeFrequency: changeFrequency.yearly,
            priority: 0.6,
          });
        });
      }
    }

    // Combine all URLs (including location URLs if multi-location)
    const allUrls = [...mainPages, ...locationUrls, ...dynamicUrls];
    
    // Generate XML sitemap
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls.map(url => `  <url>
    <loc>${url.url}</loc>
    <lastmod>${formatDate(url.lastModified)}</lastmod>
    <changefreq>${url.changeFrequency}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

    return new NextResponse(sitemap, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600', // Cache for 1 hour
      },
    });
    
  } catch (error) {
    console.error('Error generating dynamic sitemap:', error);
    
    // Return static pages if dynamic fetching fails
    const staticUrls = [...mainPages, ...locationUrls];
    const fallbackSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticUrls.map(url => `  <url>
    <loc>${url.url}</loc>
    <lastmod>${formatDate(url.lastModified)}</lastmod>
    <changefreq>${url.changeFrequency}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

    return new NextResponse(fallbackSitemap, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=300, s-maxage=300', // Shorter cache on error
      },
    });
  }
}
