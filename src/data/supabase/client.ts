import { createClient } from "@supabase/supabase-js";

import log from "@/lib/logger";

import type { Database } from "./types";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "";

// Check if Supabase is properly configured
/**
 * Boolean indicating whether Supabase is properly configured
 *
 * Checks if both EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY
 * environment variables are set and non-empty.
 */
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

if (!isSupabaseConfigured) {
  log.warn("Supabase not configured - missing environment variables");
  log.debug("EXPO_PUBLIC_SUPABASE_URL:", supabaseUrl ? "set" : "missing");
  log.debug(
    "EXPO_PUBLIC_SUPABASE_ANON_KEY:",
    supabaseAnonKey ? "set" : "missing"
  );
} else {
  log.info("Supabase configured successfully");
}

/**
 * Typed Supabase client instance
 * Provides full TypeScript support for all database operations
 * Returns null if Supabase is not configured
 */
export const supabase = isSupabaseConfigured
  ? createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    })
  : null;
