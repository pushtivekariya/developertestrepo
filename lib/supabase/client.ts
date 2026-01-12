import { createBrowserClient as createBrowserClientSSR } from '@supabase/ssr';

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

// Singleton instance for client-side usage
let clientInstance: ReturnType<typeof createBrowserClientSSR> | null = null;

/**
 * Get or create the Supabase client instance for Client Components
 * This uses @supabase/ssr for proper cookie handling in the browser
 * Instance is created once and reused throughout the app
 */
export function getSupabaseClient() {
  if (!clientInstance) {
    clientInstance = createBrowserClientSSR(supabaseUrl, supabaseAnonKey);
  }
  return clientInstance;
}

// Export the instance directly for convenience
export const supabase = getSupabaseClient();

