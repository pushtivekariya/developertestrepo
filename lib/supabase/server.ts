/**
 * Supabase server-side functions
 * 
 * Usage:
 * - Server Components: import { getSupabaseClient } from '@/lib/supabase/server'
 * - API Routes: import { createClientForRouteHandler } from '@/lib/supabase/server'
 * - Build-time functions: import { getSupabaseClientForBuildTime } from '@/lib/supabase/server'
 */


import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';

// Check for required environment variables at build time
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(`
    Missing required environment variables for Supabase.
    Please check your .env file and ensure the following are set:
    - NEXT_PUBLIC_SUPABASE_URL
    - NEXT_PUBLIC_SUPABASE_ANON_KEY
  `);
}

// Singleton instance - created once and reused throughout the app
// Note: In Next.js App Router, server components run per request, so this is effectively
// a singleton per request execution context
let serverInstance: ReturnType<typeof createServerClient> | null = null;

/**
 * Get or create the Supabase client instance for Server Components
 * This uses @supabase/ssr for proper cookie handling
 * Creates a singleton instance that's reused within the same request context
 * Falls back to build-time client if cookies are not available (e.g., during generateStaticParams)
 */
export async function getSupabaseClient() {
  // Return cached instance if it exists
  if (serverInstance) {
    return serverInstance;
  }

  // Try to get cookies, but fall back to build-time client if not available
  // This handles cases where functions are called during generateStaticParams
  try {
    // Dynamically import cookies to avoid issues when this module is imported
    // in contexts where next/headers is not available (e.g., build time)
    const { cookies } = await import('next/headers');

    // Check if we can access cookies - this will throw if called outside request scope
    let cookieStore;
    try {
      cookieStore = await cookies();
    } catch {
      // cookies() was called outside request scope (e.g., during generateStaticParams)
      // Fall back to build-time client
      return getSupabaseClientForBuildTime();
    }

    serverInstance = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    });

    return serverInstance;
  } catch {
    // If anything else fails, fall back to build-time client
    return getSupabaseClientForBuildTime();
  }
}


/**
 * Create a Supabase client for use in API Routes
 * This uses @supabase/ssr for proper cookie handling
 */
export function createClientForRouteHandler(
  request: NextRequest,
  response: NextResponse
) {
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          request.cookies.set(name, value);
          response.cookies.set(name, value, options);
        });
      },
    },
  });
}

/**
 * Create a Supabase client for use in build-time functions like generateStaticParams
 * This client doesn't use cookies and should only be used for public data access
 * Use this in contexts where cookies() is not available (build time, not request time)
 */
export function getSupabaseClientForBuildTime() {
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return [];
      },
      setAll() {
        // No-op: cookies cannot be set at build time
      },
    },
  });
}

