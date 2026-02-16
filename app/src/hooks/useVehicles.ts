import { useQuery } from '@tanstack/react-query';
import { supabase, supabaseConfigured } from '../lib/supabase';
import type { Vehicle } from '../types/database';

// ---------------------------------------------------------------
// Fallback seed data — used when Supabase is not configured.
// Mirrors the 6 vehicles from the plan: 4 from exhibitionsConfig
// plus Range Rover Sport and Corvette C8.
// ---------------------------------------------------------------

const now = new Date().toISOString();

const SEED_VEHICLES: Vehicle[] = [
  {
    id: 'seed-001',
    slug: 'rolls-royce-ghost',
    name: 'Rolls-Royce Ghost',
    headline: 'Move in Silence. Let the Car Do the Talking.',
    description:
      'The Rolls-Royce Ghost is the ultimate expression of restrained power. Whisper-quiet V12, bespoke interior, and the kind of presence that makes people wonder who just arrived.',
    daily_price_cents: 120000,
    images: ['/images/fleet-rollsroyce.jpg'],
    experience_tags: ['Boss Move', 'Wedding Day', 'Statement'],
    rental_count: 0,
    is_active: true,
    created_at: now,
    updated_at: now,
  },
  {
    id: 'seed-002',
    slug: 'lamborghini-huracan',
    name: 'Lamborghini Huracan',
    headline: 'Make an Entrance They Won\'t Forget.',
    description:
      'The Huracan is for when you want every single person to know you have arrived. Screaming V10, scissor doors, and a paint color that demands photographs.',
    daily_price_cents: 95000,
    images: ['/images/fleet-lamborghini.jpg'],
    experience_tags: ['Content Ready', 'Date Night', 'Statement'],
    rental_count: 0,
    is_active: true,
    created_at: now,
    updated_at: now,
  },
  {
    id: 'seed-003',
    slug: 'dodge-hellcat-widebody',
    name: 'Dodge Hellcat Widebody',
    headline: 'For When Subtle Isn\'t the Point.',
    description:
      'The Hellcat Widebody is raw American muscle at its finest. 717 horsepower, wide-body fender flares, and a supercharger whine that announces your arrival from blocks away.',
    daily_price_cents: 45000,
    images: ['/images/fleet-hellcat.jpg'],
    experience_tags: ['Weekend Takeover', 'Content Ready', 'Statement'],
    rental_count: 0,
    is_active: true,
    created_at: now,
    updated_at: now,
  },
  {
    id: 'seed-004',
    slug: 'mercedes-maybach-s-class',
    name: 'Mercedes-Maybach S-Class',
    headline: 'Executive Presence. Absolute Comfort.',
    description:
      'The Maybach S-Class is where business meets luxury. Rear executive seating, champagne cooler, and a ride so smooth you could close a deal mid-commute.',
    daily_price_cents: 80000,
    images: ['/images/fleet-maybach.jpg'],
    experience_tags: ['Boss Move', 'Date Night', 'Wedding Day'],
    rental_count: 0,
    is_active: true,
    created_at: now,
    updated_at: now,
  },
  {
    id: 'seed-005',
    slug: 'range-rover-sport',
    name: 'Range Rover Sport',
    headline: 'Command Every Road. Own Every Room.',
    description:
      'The Range Rover Sport blends commanding presence with athletic performance. Whether it\'s a night out or a weekend escape, this is how you travel in elevated style.',
    daily_price_cents: 55000,
    images: ['/images/fleet-rangerover.jpg'],
    experience_tags: ['Weekend Takeover', 'Boss Move', 'Date Night'],
    rental_count: 0,
    is_active: true,
    created_at: now,
    updated_at: now,
  },
  {
    id: 'seed-006',
    slug: 'chevrolet-corvette-c8',
    name: 'Chevrolet Corvette C8',
    headline: 'Mid-Engine. Maximum Impact.',
    description:
      'The C8 Corvette rewrote the rules. Mid-engine layout, supercar looks, and a price point that lets you experience exotic performance without the exotic price tag.',
    daily_price_cents: 35000,
    images: ['/images/fleet-corvette.jpg'],
    experience_tags: ['Content Ready', 'Date Night', 'Weekend Takeover'],
    rental_count: 0,
    is_active: true,
    created_at: now,
    updated_at: now,
  },
];

// ---------------------------------------------------------------
// Fetch active vehicles from Supabase, fall back to seed data.
// ---------------------------------------------------------------

async function fetchVehicles(): Promise<Vehicle[]> {
  if (!supabaseConfigured || !supabase) {
    return SEED_VEHICLES;
  }

  const { data, error } = await supabase
    .from('vehicles')
    .select('*')
    .eq('is_active', true)
    .order('created_at');

  if (error) throw error;
  return (data as Vehicle[]) ?? [];
}

export function useVehicles() {
  return useQuery<Vehicle[], Error>({
    queryKey: ['vehicles'],
    queryFn: fetchVehicles,
  });
}
