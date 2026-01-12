/**
 * Supabase client exports
 * 
 * Usage:
 * - Client Components: import { supabase } from '@/lib/supabase'
 * - Server Components: import { getSupabaseClient } from '@/lib/supabase/server'
 * - API Routes: import { createClientForRouteHandler } from '@/lib/supabase/server'
 * - Build-time functions: import { getSupabaseClientForBuildTime } from '@/lib/supabase/server'
 * 
 * IMPORTANT: Server functions must be imported directly from '@/lib/supabase/server'
 * to avoid importing 'next/headers' in client/pages contexts.
 */

// Re-export client-side functions only
// Server functions must be imported directly from '@/lib/supabase/server'
export { getSupabaseClient as getBrowserClient, supabase } from './client';

