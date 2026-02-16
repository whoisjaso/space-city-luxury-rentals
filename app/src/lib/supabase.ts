import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

// ---------------------------------------------------------------
// Supabase is optional for local development.  When env vars are
// missing or still contain the placeholder values from .env.example,
// `supabase` will be null and the app runs in "demo mode" with
// hardcoded seed data.
//
// Note: The Database generic is intentionally omitted from createClient.
// TypeScript 5.9 removed implicit index signatures on interfaces/types,
// which breaks @supabase/supabase-js GenericSchema constraint (it
// requires Row/Insert/Update to extend Record<string, unknown>).
// All hooks already use explicit type assertions on query results,
// so runtime type safety is preserved.
// ---------------------------------------------------------------

function isConfigured(url: string, key: string): boolean {
  if (!url || !key) return false;
  if (url === 'your-project-url' || key === 'your-anon-key') return false;
  return true;
}

export const supabaseConfigured = isConfigured(supabaseUrl, supabaseAnonKey);

export const supabase: SupabaseClient | null = supabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Returns true when the app should use local demo data instead of Supabase.
 * This happens when Supabase is not configured OR when the user logged in
 * with the demo admin credentials (no real Supabase auth session).
 */
export function isDemoMode(): boolean {
  if (!supabaseConfigured || !supabase) return true;
  if (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('demo-admin') === 'true') {
    return true;
  }
  return false;
}
