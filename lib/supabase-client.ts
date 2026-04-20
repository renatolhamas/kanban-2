import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  if (process.env.NODE_ENV === "production") {
    console.warn(
      "[CONFIG WARNING] Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY. This is okay during build but will fail at runtime.",
    );
  }
}

// Initialize the static anonymous client
export const supabase = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseAnonKey || "placeholder-key",
);

// Cache for authenticated clients to prevent multiple instances
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const clientCache: Record<string, SupabaseClient<any, any, any>> = {};

/**
 * Factory and instance manager for Supabase client with auth injection.
 * Injected tokens enable Row Level Security (RLS) policies
 * that verify auth.jwt() claims like tenant_id.
 */
export function getSupabaseClient(token?: string | null) {
  // If no token, use the default anonymous client
  if (!token) return supabase;

  // Use the token as a cache key
  if (clientCache[token]) {
    return clientCache[token];
  }

  // Create a new client and cache it
  const client = createClient(
    supabaseUrl || "https://placeholder.supabase.co",
    supabaseAnonKey || "placeholder-key",
    {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    }
  );

  clientCache[token] = client;
  return client;
}
