import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

// ---------------------------------------------------------------
// Supabase is optional for local development.  When env vars are
// missing or still contain the placeholder values from .env.example,
// `supabase` will be null and the app runs in "demo mode" with
// hardcoded seed data.
// ---------------------------------------------------------------

function isConfigured(url: string, key: string): boolean {
  if (!url || !key) return false;
  if (url === 'your-project-url' || key === 'your-anon-key') return false;
  return true;
}

export const supabaseConfigured = isConfigured(supabaseUrl, supabaseAnonKey);

export const supabase: SupabaseClient<Database> | null = supabaseConfigured
  ? createClient<Database>(supabaseUrl, supabaseAnonKey)
  : null;
