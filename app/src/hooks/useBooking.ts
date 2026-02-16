import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase, supabaseConfigured } from '../lib/supabase';
import type { Booking } from '../types/database';

// ---------------------------------------------------------------
// Booking hooks — create bookings, look up by code, look up by email.
// All hooks fall back to demo mode when Supabase is not configured.
// ---------------------------------------------------------------

// ---------- Types ----------

export interface CreateBookingInput {
  vehicle_id: string;
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  start_date: string;
  end_date: string;
  terms_accepted: boolean;
}

// ---------- Helpers ----------

/** Generate a random 8-char uppercase alphanumeric code for demo mode. */
function generateDemoCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no ambiguous 0/O/1/I
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

/** Build a mock booking object for demo mode. */
function buildMockBooking(input: CreateBookingInput): Booking {
  const now = new Date().toISOString();
  return {
    id: `demo-${Date.now()}`,
    confirmation_code: generateDemoCode(),
    vehicle_id: input.vehicle_id,
    guest_name: input.guest_name,
    guest_email: input.guest_email,
    guest_phone: input.guest_phone,
    start_date: input.start_date,
    end_date: input.end_date,
    status: 'pending',
    admin_notes: null,
    terms_accepted: input.terms_accepted,
    created_at: now,
    updated_at: now,
  };
}

// ---------- Create Booking ----------

async function createBooking(input: CreateBookingInput): Promise<Booking> {
  if (!supabaseConfigured || !supabase) {
    // Simulate a small network delay for realism
    await new Promise((r) => setTimeout(r, 800));
    return buildMockBooking(input);
  }

  const { data, error } = await supabase
    .from('bookings')
    .insert({
      vehicle_id: input.vehicle_id,
      guest_name: input.guest_name,
      guest_email: input.guest_email,
      guest_phone: input.guest_phone,
      start_date: input.start_date,
      end_date: input.end_date,
      status: 'pending',
      admin_notes: null,
      terms_accepted: input.terms_accepted,
    })
    .select()
    .single();

  if (error) throw error;
  return data as Booking;
}

export function useCreateBooking() {
  return useMutation<Booking, Error, CreateBookingInput>({
    mutationFn: createBooking,
  });
}

// ---------- Booking Status by Code ----------

interface BookingWithVehicle extends Booking {
  vehicle_name?: string;
}

async function fetchBookingByCode(
  code: string,
): Promise<BookingWithVehicle | null> {
  if (!supabaseConfigured || !supabase) {
    // Demo mode: return a mock pending booking so the UI is testable
    await new Promise((r) => setTimeout(r, 400));
    const now = new Date().toISOString();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfter = new Date();
    dayAfter.setDate(dayAfter.getDate() + 3);
    return {
      id: 'demo-status',
      confirmation_code: code.toUpperCase(),
      vehicle_id: 'seed-001',
      guest_name: 'Demo Guest',
      guest_email: 'demo@example.com',
      guest_phone: '(555) 123-4567',
      start_date: tomorrow.toISOString().split('T')[0],
      end_date: dayAfter.toISOString().split('T')[0],
      status: 'pending',
      admin_notes: null,
      terms_accepted: true,
      created_at: now,
      updated_at: now,
      vehicle_name: 'Rolls-Royce Ghost',
    };
  }

  const { data, error } = await supabase
    .from('bookings')
    .select('*, vehicles(name)')
    .ilike('confirmation_code', code)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // no rows
    throw error;
  }

  const row = data as Booking & { vehicles?: { name: string } };
  return {
    ...row,
    vehicle_name: row.vehicles?.name,
  };
}

export function useBookingStatus(code: string) {
  return useQuery<BookingWithVehicle | null, Error>({
    queryKey: ['booking', 'code', code.toUpperCase()],
    queryFn: () => fetchBookingByCode(code),
    enabled: code.length >= 8,
  });
}

// ---------- Bookings by Email ----------

async function fetchBookingsByEmail(
  email: string,
): Promise<BookingWithVehicle[]> {
  if (!supabaseConfigured || !supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from('bookings')
    .select('*, vehicles(name)')
    .ilike('guest_email', email)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return ((data as (Booking & { vehicles?: { name: string } })[]) ?? []).map(
    (row) => ({
      ...row,
      vehicle_name: row.vehicles?.name,
    }),
  );
}

export function useBookingsByEmail(email: string) {
  return useQuery<BookingWithVehicle[], Error>({
    queryKey: ['booking', 'email', email.toLowerCase()],
    queryFn: () => fetchBookingsByEmail(email),
    enabled: email.includes('@') && email.includes('.'),
  });
}
