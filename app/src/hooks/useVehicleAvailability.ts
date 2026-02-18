import { useQuery } from '@tanstack/react-query';
import { supabase, supabaseConfigured } from '../lib/supabase';

// ---------------------------------------------------------------
// useVehicleAvailability — fetches which vehicles are currently
// rented out (have an approved booking overlapping today).
// Returns a Set of vehicle IDs that are UNAVAILABLE.
// ---------------------------------------------------------------

function getTodayDateString(): string {
  // Use local date (not UTC) so midnight boundary matches the user's timezone
  return new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD
}

// Demo mode: simulate the Maybach (seed-004) as currently rented.
function getDemoUnavailableIds(): Set<string> {
  return new Set(['seed-004']);
}

async function fetchUnavailableVehicleIds(): Promise<Set<string>> {
  if (!supabaseConfigured || !supabase) {
    await new Promise((r) => setTimeout(r, 200));
    return getDemoUnavailableIds();
  }

  const today = getTodayDateString();

  const { data, error } = await supabase
    .from('bookings')
    .select('vehicle_id')
    .eq('status', 'approved')
    .lte('start_date', today)
    .gte('end_date', today);

  if (error) throw error;

  const ids = new Set<string>();
  for (const row of data ?? []) {
    ids.add((row as { vehicle_id: string }).vehicle_id);
  }
  return ids;
}

export function useVehicleAvailability() {
  return useQuery<Set<string>, Error>({
    queryKey: ['vehicle-availability'],
    queryFn: fetchUnavailableVehicleIds,
    staleTime: 2 * 60 * 1000,
    structuralSharing: false,
  });
}
