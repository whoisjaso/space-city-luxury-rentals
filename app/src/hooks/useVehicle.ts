import { useQuery } from '@tanstack/react-query';
import { supabase, supabaseConfigured } from '../lib/supabase';
import { SEED_VEHICLES } from './useVehicles';
import type { Vehicle } from '../types/database';

// ---------------------------------------------------------------
// Fetch a single vehicle by slug from Supabase, or fall back to
// seed data when Supabase is not configured (demo mode).
// ---------------------------------------------------------------

async function fetchVehicle(slug: string): Promise<Vehicle | null> {
  if (!supabaseConfigured || !supabase) {
    return SEED_VEHICLES.find((v) => v.slug === slug) ?? null;
  }

  const { data, error } = await supabase
    .from('vehicles')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) {
    // PGRST116 = "No rows found" — not a real error, just missing
    if (error.code === 'PGRST116') return null;
    throw error;
  }

  return data as Vehicle;
}

export function useVehicle(slug: string) {
  return useQuery<Vehicle | null, Error>({
    queryKey: ['vehicle', slug],
    queryFn: () => fetchVehicle(slug),
    enabled: !!slug,
  });
}
