import { getSupabaseClient } from './supabase/server';
import { getClientPrimaryLocation, getLocationIdBySlug } from './utils';
import { getClientData } from './client';

export interface BlogTopic {
  id: number;
  topic_number: number;
  name: string;
  slug: string;
  description?: string;
  postCount?: number;
  image_url?: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  topic_number: number;
  subtopic_number?: number;
  content_summary?: string;
  content_sections?: Record<string, unknown>;
  published_at?: string;
  created_at: string;
  image_url?: string;
  meta_title?: string;
  meta_description?: string;
  ld_json?: Record<string, unknown>;
  blog_category?: string;
  related_links?: string[] | { url: string }[];
}

/**
 * Generate a consistent slug by removing template variables and converting to lowercase with hyphens
 */
export function generateSlug(text: string): string {
  return text
    // Remove template variables like {client_name} or {agency_name}
    .replace(/\{[^}]+\}/g, '')
    // Replace spaces with hyphens
    .replace(/\s+/g, '-')
    // Remove special characters except hyphens
    .replace(/[^a-zA-Z0-9-]/g, '')
    // Remove multiple consecutive hyphens
    .replace(/-+/g, '-')
    // Remove leading/trailing hyphens
    .replace(/^-+|-+$/g, '')
    // Convert to lowercase
    .toLowerCase();
}

/**
 * Replace template variables in text with actual values
 * Supports both snake_case ({client_name}) and camelCase ({agencyName}) formats
 * No hardcoded fallbacks - returns empty string if data not provided
 */
export function replaceTemplateVariables(text: string, clientData?: { agency_name?: string; city?: string; state?: string }): string {
  if (!text) return '';

  let result = text;

  const agencyName = clientData?.agency_name || '';
  const city = clientData?.city ?
    clientData.city.charAt(0).toUpperCase() + clientData.city.slice(1).toLowerCase() : '';
  const state = clientData?.state ? clientData.state.toUpperCase() : '';

  // Replace snake_case variables (legacy format in database)
  result = result.replace(/\{client_name\}/g, agencyName);
  result = result.replace(/\{agency_name\}/g, agencyName);
  result = result.replace(/\{client_city\}/g, city);
  result = result.replace(/\{client_state\}/g, state);

  // Replace camelCase variables (new standard format)
  result = result.replace(/\{agencyName\}/g, agencyName);
  result = result.replace(/\{city\}/g, city);
  result = result.replace(/\{state\}/g, state);

  return result;
}

/**
 * Fetch all blog topics from the database
 */
export async function getAllTopics(locationSlug?: string, clientData?: { agency_name?: string; city?: string; state?: string }): Promise<BlogTopic[]> {
  const supabase = await getSupabaseClient();
  const clientId = process.env.NEXT_PUBLIC_CLIENT_ID;
  const clientDataMain = clientData || await getClientData();


  const { data: topics, error } = await supabase
    .from('client_static_topics_images')
    .select('id, topic_number, topic_name, image_url')
    .order('topic_number', { ascending: true });

  if (error) {
    console.error('Error fetching topics:', error);
    return [];
  }

  if (!topics) return [];

  
  let finalLocationId = null;
  if(locationSlug){
    finalLocationId = await getLocationIdBySlug(locationSlug);
  }else{
    const primaryLocation = await getClientPrimaryLocation();
    finalLocationId = primaryLocation?.id;
  }

  // Generate slugs and get post counts
  const topicsWithMetadata = await Promise.all(
    topics.map(async (topic: { id: number; topic_number: number; topic_name: string; image_url?: string }) => {
      // Replace template variables in name
      const processedName = replaceTemplateVariables(topic.topic_name, clientDataMain);
      const slug = generateSlug(processedName);
      // Get post count for this topic, filtered by location_id if provided
      const supabaseClient = await getSupabaseClient();
      let postsQuery = supabaseClient
        .from('client_blogs_content')
        .select('id')
        .eq('client_id', clientId)
        .eq('topic_number', topic.topic_number)
        .eq('published', true);

      // Filter by location_id if locationSlug was provided
      if (finalLocationId) {
        postsQuery = postsQuery.eq('location_id', finalLocationId);
      }

      const { data: posts, error: postsError } = await postsQuery;
      const postCount = postsError ? 0 : (posts?.length || 0);

      return {
        id: topic.id,
        topic_number: topic.topic_number,
        name: processedName,
        slug,
        description: replaceTemplateVariables(topic.topic_name || '', clientDataMain),
        postCount,
        image_url: topic.image_url,
      };
    })
  );

  return topicsWithMetadata;
}

/**
 * Find a topic by slug
 */
export async function getTopicBySlug(slug: string): Promise<BlogTopic | null> {
  const topics = await getAllTopics();
  return topics.find(topic => topic.slug === slug) || null;
}

/**
 * Find a topic by topic number
 */
export async function getTopicByNumber(topicNumber: number): Promise<BlogTopic | null> {
  const topics = await getAllTopics();
  return topics.find(topic => topic.topic_number === topicNumber) || null;
}

/**
 * Fetch posts for a specific topic
 */
export async function getPostsByTopic(topicNumber: number, locationId?: string | null): Promise<BlogPost[]> {
  const clientId = process.env.NEXT_PUBLIC_CLIENT_ID;
  const supabase = await getSupabaseClient();
  let query = supabase
    .from('client_blogs_content')
    .select('id, title, slug, topic_number, subtopic_number, content_summary, content_sections, published_at, created_at, image_url, meta_title, meta_description, ld_json, blog_category')
    .eq('client_id', clientId)
    .eq('topic_number', topicNumber)
    .eq('published', true);

  // Filter by location_id if provided
  if (locationId) {
    query = query.eq('location_id', locationId);
  }

  const { data: posts, error } = await query
    .order('subtopic_number', { ascending: true })
    .order('published_at', { ascending: false });

  if (error) {
    console.error('Error fetching posts:', error);
    return [];
  }

  return posts || [];
}

/**
 * Fetch a single post by slug
 */
export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const clientId = process.env.NEXT_PUBLIC_CLIENT_ID;
  const supabase = await getSupabaseClient();
  const { data: post, error } = await supabase
    .from('client_blogs_content')
    .select('id, title, slug, topic_number, subtopic_number, content_summary, content_sections, published_at, created_at, image_url, meta_title, meta_description, ld_json, blog_category')
    .eq('client_id', clientId)
    .eq('slug', slug)
    .eq('published', true)
    .single();

  if (error) {
    console.error('Error fetching post:', error);
    return null;
  }

  return post;
}

export interface RelatedPost {
  id: string;
  title: string;
  slug: string;
  topic_number: number;
  image_url?: string;
}

export interface ClientData {
  agency_name: string;
  city: string;
  state: string;
  name: string;
  canonical_url?: string;
}

export interface TopicWithSlug {
  id: number;
  number: number;
  name: string;
  slug: string;
  description: string;
  image_url?: string;
}

/**
 * Fetch topics with client data for template variable replacement
 * Used by blog pages that need both topics and client data together
 */
export async function getTopicsWithClientData(): Promise<{ topics: TopicWithSlug[]; clientData: ClientData }> {
  const supabase = await getSupabaseClient();

  // Get client data for template variable replacement
  const { data: clientData, error: clientError } = await supabase
    .from('clients')
    .select('agency_name, city, state, website_url')
    .eq('id', process.env.NEXT_PUBLIC_CLIENT_ID!)
    .single();

  if (clientError) {
    console.error('Client data error:', clientError);
  }

  // No hardcoded fallbacks - data must come from database
  const resolvedClientData: ClientData = {
    agency_name: clientData?.agency_name || '',
    city: clientData?.city || '',
    state: clientData?.state || '',
    name: clientData?.agency_name || '',
    canonical_url: clientData?.website_url || ''
  };

  // Fetch topic data from client_static_topics_images
  const { data: topicImages, error: topicError } = await supabase
    .from('client_static_topics_images')
    .select('topic_number, topic_name, image_url')
    .order('topic_number');

  if (topicError) {
    console.error('Topic data error:', topicError);
    return { topics: [], clientData: resolvedClientData };
  }

  // Process topics with proper template variable replacement
  const topics: TopicWithSlug[] = topicImages?.map((topic: { topic_number: number; topic_name: string; image_url?: string }) => {
    const finalTopicName = replaceTemplateVariables(topic.topic_name, {
      agency_name: resolvedClientData.agency_name,
      city: resolvedClientData.city
    });

    const slug = generateSlug(finalTopicName);

    return {
      id: topic.topic_number,
      number: topic.topic_number,
      name: finalTopicName,
      slug: slug,
      description: `Learn about ${finalTopicName.toLowerCase()} with expert guidance.`,
      image_url: topic.image_url
    };
  }) || [];

  return { topics, clientData: resolvedClientData };
}

/**
 * Fetch a single post by slug with fallback for slugs ending with ?
 */
export async function getPostBySlugWithFallback(slug: string): Promise<BlogPost | null> {
  const clientId = process.env.NEXT_PUBLIC_CLIENT_ID;
  const supabase = await getSupabaseClient();

  // First try exact match
  let { data: post } = await supabase
    .from('client_blogs_content')
    .select('id, title, slug, topic_number, subtopic_number, content_summary, content_sections, published_at, created_at, image_url, meta_title, meta_description, ld_json, related_links')
    .eq('client_id', clientId)
    .eq('slug', slug)
    .eq('published', true)
    .single();

  // If not found and slug doesn't end with ?, try with ?
  if (!post && !slug.endsWith('?')) {
    const { data: postWithQuestion } = await supabase
      .from('client_blogs_content')
      .select('id, title, slug, topic_number, subtopic_number, content_summary, content_sections, published_at, created_at, image_url, meta_title, meta_description, ld_json, related_links')
      .eq('client_id', clientId)
      .eq('slug', slug + '?')
      .eq('published', true)
      .single();

    post = postWithQuestion;
  }

  return post || null;
}

/**
 * Get related posts for a given post (same topic, excluding current post)
 */
export async function getRelatedPosts(postId: string, topicNumber: number, limit: number = 3): Promise<RelatedPost[]> {
  const clientId = process.env.NEXT_PUBLIC_CLIENT_ID;
  const supabase = await getSupabaseClient();
  const { data: posts, error } = await supabase
    .from('client_blogs_content')
    .select('id, title, slug, topic_number, image_url')
    .eq('client_id', clientId)
    .eq('topic_number', topicNumber)
    .eq('published', true)
    .neq('id', postId)
    .limit(limit);

  if (error) {
    console.error('Error fetching related posts:', error);
    return [];
  }

  return posts || [];
}

/**
 * Generate static params for all topics
 */
export async function generateTopicStaticParams(): Promise<{ topic: string }[]> {
  const topics = await getAllTopics();
  return topics.map(topic => ({ topic: topic.slug }));
}

/**
 * Generate static params for all posts
 */
export async function generatePostStaticParams(): Promise<{ topic: string; slug: string }[]> {
  const clientId = process.env.NEXT_PUBLIC_CLIENT_ID;
  const supabase = await getSupabaseClient();
  const { data: posts, error } = await supabase
    .from('client_blogs_content')
    .select('slug, topic_number')
    .eq('client_id', clientId)
    .eq('published', true);

  if (error || !posts) {
    console.error('Error fetching posts for static params:', error);
    return [];
  }

  const topics = await getAllTopics();
  const topicsMap = new Map(topics.map(t => [t.topic_number, t.slug]));

  return posts
    .map(post => {
      const topicSlug = topicsMap.get(post.topic_number);
      if (!topicSlug) return null;

      return {
        topic: topicSlug,
        slug: post.slug
      };
    })
    .filter(Boolean) as { topic: string; slug: string }[];
} 