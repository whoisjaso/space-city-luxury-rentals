import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, supabaseConfigured } from '../lib/supabase';
import { SEED_VEHICLES } from './useVehicles';
import type { Booking, BookingStatus } from '../types/database';

// ---------------------------------------------------------------
// Admin booking hooks — fetch, filter, and update booking status.
// All hooks fall back to demo mode with local state when
// Supabase is not configured.
// ---------------------------------------------------------------

// ---------- Types ----------

export interface BookingWithVehicle extends Booking {
  vehicle_name: string;
  vehicle_slug: string;
}

export interface AdminStats {
  totalBookings: number;
  pendingBookings: number;
  activeVehicles: number;
}

interface UpdateBookingStatusInput {
  id: string;
  status: BookingStatus;
  admin_notes?: string | null;
}

// ---------- Demo mode state ----------

const now = new Date().toISOString();
const yesterday = new Date(Date.now() - 86400000).toISOString();
const twoDaysAgo = new Date(Date.now() - 172800000).toISOString();
const threeDaysAgo = new Date(Date.now() - 259200000).toISOString();

function futureDate(daysFromNow: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString().split('T')[0];
}

let demoBookings: BookingWithVehicle[] = [
  {
    id: 'demo-b1',
    confirmation_code: 'SCR4X7KP',
    vehicle_id: 'seed-001',
    guest_name: 'Marcus Johnson',
    guest_email: 'marcus@example.com',
    guest_phone: '(713) 555-0142',
    start_date: futureDate(3),
    end_date: futureDate(5),
    status: 'pending',
    admin_notes: null,
    terms_accepted: true,
    created_at: now,
    updated_at: now,
    vehicle_name: 'Rolls-Royce Ghost',
    vehicle_slug: 'rolls-royce-ghost',
  },
  {
    id: 'demo-b2',
    confirmation_code: 'SCWL82NF',
    vehicle_id: 'seed-002',
    guest_name: 'Tiffany Williams',
    guest_email: 'tiffany@example.com',
    guest_phone: '(281) 555-0198',
    start_date: futureDate(7),
    end_date: futureDate(9),
    status: 'pending',
    admin_notes: null,
    terms_accepted: true,
    created_at: yesterday,
    updated_at: yesterday,
    vehicle_name: 'Lamborghini Huracan',
    vehicle_slug: 'lamborghini-huracan',
  },
  {
    id: 'demo-b3',
    confirmation_code: 'SCJD6Y3M',
    vehicle_id: 'seed-004',
    guest_name: 'Derek Thompson',
    guest_email: 'derek@example.com',
    guest_phone: '(832) 555-0267',
    start_date: futureDate(1),
    end_date: futureDate(2),
    status: 'approved',
    admin_notes: 'Confirmed. Pickup at the downtown location. Welcome!',
    terms_accepted: true,
    created_at: twoDaysAgo,
    updated_at: yesterday,
    vehicle_name: 'Mercedes-Maybach S-Class',
    vehicle_slug: 'mercedes-maybach-s-class',
  },
  {
    id: 'demo-b4',
    confirmation_code: 'SCRT59BH',
    vehicle_id: 'seed-003',
    guest_name: 'Jasmine Carter',
    guest_email: 'jasmine@example.com',
    guest_phone: '(346) 555-0321',
    start_date: futureDate(10),
    end_date: futureDate(12),
    status: 'declined',
    admin_notes: 'Vehicle unavailable for those dates. Please try a different weekend.',
    terms_accepted: true,
    created_at: threeDaysAgo,
    updated_at: twoDaysAgo,
    vehicle_name: 'Dodge Hellcat Widebody',
    vehicle_slug: 'dodge-hellcat-widebody',
  },
  {
    id: 'demo-b5',
    confirmation_code: 'SCPN27QV',
    vehicle_id: 'seed-006',
    guest_name: 'Andre Mitchell',
    guest_email: 'andre@example.com',
    guest_phone: '(713) 555-0489',
    start_date: futureDate(5),
    end_date: futureDate(7),
    status: 'pending',
    admin_notes: null,
    terms_accepted: true,
    created_at: yesterday,
    updated_at: yesterday,
    vehicle_name: 'Chevrolet Corvette C8',
    vehicle_slug: 'chevrolet-corvette-c8',
  },
];

// ---------- Fetch all bookings (with optional status filter) ----------

async function fetchAdminBookings(
  statusFilter?: BookingStatus,
): Promise<BookingWithVehicle[]> {
  if (!supabaseConfigured || !supabase) {
    await new Promise((r) => setTimeout(r, 300));
    let filtered = [...demoBookings];
    if (statusFilter) {
      filtered = filtered.filter((b) => b.status === statusFilter);
    }
    // Sort newest first
    return filtered.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
  }

  let query = supabase
    .from('bookings')
    .select('*, vehicles(name, slug)')
    .order('created_at', { ascending: false });

  if (statusFilter) {
    query = query.eq('status', statusFilter);
  }

  const { data, error } = await query;
  if (error) throw error;

  return (
    (data as (Booking & { vehicles?: { name: string; slug: string } })[]) ?? []
  ).map((row) => ({
    ...row,
    vehicle_name: row.vehicles?.name ?? 'Unknown Vehicle',
    vehicle_slug: row.vehicles?.slug ?? '',
  }));
}

export function useAdminBookings(statusFilter?: BookingStatus) {
  return useQuery<BookingWithVehicle[], Error>({
    queryKey: ['admin', 'bookings', statusFilter ?? 'all'],
    queryFn: () => fetchAdminBookings(statusFilter),
  });
}

// ---------- Fetch dashboard stats ----------

async function fetchAdminStats(): Promise<AdminStats> {
  if (!supabaseConfigured || !supabase) {
    await new Promise((r) => setTimeout(r, 200));
    return {
      totalBookings: demoBookings.length,
      pendingBookings: demoBookings.filter((b) => b.status === 'pending').length,
      activeVehicles: SEED_VEHICLES.filter((v) => v.is_active).length,
    };
  }

  // Fetch counts in parallel
  const [bookingsRes, pendingRes, vehiclesRes] = await Promise.all([
    supabase.from('bookings').select('id', { count: 'exact', head: true }),
    supabase
      .from('bookings')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending'),
    supabase
      .from('vehicles')
      .select('id', { count: 'exact', head: true })
      .eq('is_active', true),
  ]);

  if (bookingsRes.error) throw bookingsRes.error;
  if (pendingRes.error) throw pendingRes.error;
  if (vehiclesRes.error) throw vehiclesRes.error;

  return {
    totalBookings: bookingsRes.count ?? 0,
    pendingBookings: pendingRes.count ?? 0,
    activeVehicles: vehiclesRes.count ?? 0,
  };
}

export function useAdminStats() {
  return useQuery<AdminStats, Error>({
    queryKey: ['admin', 'stats'],
    queryFn: fetchAdminStats,
  });
}

// ---------- Update booking status (approve / decline) ----------

async function updateBookingStatus({
  id,
  status,
  admin_notes,
}: UpdateBookingStatusInput): Promise<BookingWithVehicle> {
  if (!supabaseConfigured || !supabase) {
    await new Promise((r) => setTimeout(r, 400));
    const idx = demoBookings.findIndex((b) => b.id === id);
    if (idx === -1) throw new Error('Booking not found');
    const updated: BookingWithVehicle = {
      ...demoBookings[idx],
      status,
      admin_notes: admin_notes ?? demoBookings[idx].admin_notes,
      updated_at: new Date().toISOString(),
    };
    demoBookings[idx] = updated;
    return updated;
  }

  const updates: { status: BookingStatus; admin_notes?: string | null } = { status };
  if (admin_notes !== undefined) {
    updates.admin_notes = admin_notes;
  }

  const { data, error } = await supabase
    .from('bookings')
    .update(updates)
    .eq('id', id)
    .select('*, vehicles(name, slug)')
    .single();

  if (error) throw error;

  const row = data as Booking & { vehicles?: { name: string; slug: string } };
  return {
    ...row,
    vehicle_name: row.vehicles?.name ?? 'Unknown Vehicle',
    vehicle_slug: row.vehicles?.slug ?? '',
  };
}

export function useUpdateBookingStatus() {
  const queryClient = useQueryClient();

  return useMutation<
    BookingWithVehicle,
    Error,
    UpdateBookingStatusInput,
    { previousAll: BookingWithVehicle[] | undefined }
  >({
    mutationFn: updateBookingStatus,
    onMutate: async (variables) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['admin', 'bookings'] });
      await queryClient.cancelQueries({ queryKey: ['admin', 'stats'] });

      // Snapshot previous values for all booking query keys
      const previousAll = queryClient.getQueryData<BookingWithVehicle[]>([
        'admin',
        'bookings',
        'all',
      ]);

      // Optimistic update: patch the booking in all cached queries
      queryClient.setQueriesData<BookingWithVehicle[]>(
        { queryKey: ['admin', 'bookings'] },
        (old) => {
          if (!old) return old;
          return old.map((b) =>
            b.id === variables.id
              ? {
                  ...b,
                  status: variables.status,
                  admin_notes:
                    variables.admin_notes !== undefined
                      ? variables.admin_notes
                      : b.admin_notes,
                  updated_at: new Date().toISOString(),
                }
              : b,
          );
        },
      );

      return { previousAll };
    },
    onError: (_err, _variables, context) => {
      // Rollback on error
      if (context?.previousAll) {
        queryClient.setQueryData(
          ['admin', 'bookings', 'all'],
          context.previousAll,
        );
      }
    },
    onSettled: () => {
      // Always refetch after success or error
      queryClient.invalidateQueries({ queryKey: ['admin', 'bookings'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
      // Also invalidate guest-facing booking queries so status pages update
      queryClient.invalidateQueries({ queryKey: ['booking'] });
    },
  });
}
