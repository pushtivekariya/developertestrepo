/**
 * SEO Blog Data Fetching Utilities
 * 
 * Functions for fetching SEO blog posts and groupings from Supabase.
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export function getSupabaseClient() {
  return createClient(supabaseUrl, supabaseAnonKey);
}

/**
 * Get all published blog groupings for a client
 */
export async function getBlogGroupings(clientId: string) {
  const supabase = getSupabaseClient();
  
  const { data, error } = await supabase
    .from('seo_blog_groupings')
    .select('*')
    .eq('client_id', clientId)
    .eq('published', true)
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('Error fetching blog groupings:', error);
    return [];
  }

  return data || [];
}

/**
 * Get a single blog grouping by slug
 */
export async function getBlogGroupingBySlug(clientId: string, slug: string) {
  const supabase = getSupabaseClient();
  
  const { data, error } = await supabase
    .from('seo_blog_groupings')
    .select('*')
    .eq('client_id', clientId)
    .eq('slug', slug)
    .eq('published', true)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Not found
    }
    console.error('Error fetching blog grouping:', error);
    return null;
  }

  return data;
}

/**
 * Get all published blog posts for a client
 */
export async function getAllBlogPosts(clientId: string) {
  const supabase = getSupabaseClient();
  
  const { data, error } = await supabase
    .from('seo_blog_posts')
    .select(`
      id,
      title,
      slug,
      meta_title,
      meta_description,
      hero_section,
      target_keyword,
      published_at,
      reading_time_minutes,
      grouping_id,
      seo_blog_groupings (
        id,
        slug,
        display_name,
        type
      )
    `)
    .eq('client_id', clientId)
    .eq('published', true)
    .order('published_at', { ascending: false });

  if (error) {
    console.error('Error fetching blog posts:', error);
    return [];
  }

  return data || [];
}

/**
 * Get blog posts by grouping
 */
export async function getBlogPostsByGrouping(clientId: string, groupingId: string) {
  const supabase = getSupabaseClient();
  
  const { data, error } = await supabase
    .from('seo_blog_posts')
    .select(`
      id,
      title,
      slug,
      meta_title,
      meta_description,
      hero_section,
      target_keyword,
      published_at,
      reading_time_minutes
    `)
    .eq('client_id', clientId)
    .eq('grouping_id', groupingId)
    .eq('published', true)
    .order('published_at', { ascending: false });

  if (error) {
    console.error('Error fetching blog posts by grouping:', error);
    return [];
  }

  return data || [];
}

/**
 * Get a single blog post by slug
 */
export async function getBlogPostBySlug(clientId: string, slug: string) {
  const supabase = getSupabaseClient();
  
  const { data, error } = await supabase
    .from('seo_blog_posts')
    .select(`
      *,
      seo_blog_groupings (
        id,
        slug,
        display_name,
        type
      )
    `)
    .eq('client_id', clientId)
    .eq('slug', slug)
    .eq('published', true)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Not found
    }
    console.error('Error fetching blog post:', error);
    return null;
  }

  return data;
}

/**
 * Get related blog posts (same grouping, excluding current)
 */
export async function getRelatedBlogPosts(
  clientId: string, 
  groupingId: string | null, 
  excludeSlug: string,
  limit: number = 3
) {
  const supabase = getSupabaseClient();
  
  let query = supabase
    .from('seo_blog_posts')
    .select(`
      id,
      title,
      slug,
      meta_description,
      hero_section,
      published_at,
      reading_time_minutes
    `)
    .eq('client_id', clientId)
    .eq('published', true)
    .neq('slug', excludeSlug)
    .limit(limit);

  if (groupingId) {
    query = query.eq('grouping_id', groupingId);
  }

  const { data, error } = await query.order('published_at', { ascending: false });

  if (error) {
    console.error('Error fetching related posts:', error);
    return [];
  }

  return data || [];
}

/**
 * Get all blog post slugs for static generation
 */
export async function getAllBlogPostSlugs(clientId: string) {
  const supabase = getSupabaseClient();
  
  const { data, error } = await supabase
    .from('seo_blog_posts')
    .select('slug, grouping_id, seo_blog_groupings(slug)')
    .eq('client_id', clientId)
    .eq('published', true);

  if (error) {
    console.error('Error fetching blog post slugs:', error);
    return [];
  }

  return data || [];
}

/**
 * Get all grouping slugs for static generation
 */
export async function getAllGroupingSlugs(clientId: string) {
  const supabase = getSupabaseClient();
  
  const { data, error } = await supabase
    .from('seo_blog_groupings')
    .select('slug')
    .eq('client_id', clientId)
    .eq('published', true);

  if (error) {
    console.error('Error fetching grouping slugs:', error);
    return [];
  }

  return data || [];
}
