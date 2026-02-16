// ---------------------------------------------------------------
// Database types – mirrors the Supabase schema for vehicles & bookings.
// Generated manually; replace with `supabase gen types` once the
// remote project is connected.
// ---------------------------------------------------------------

export type BookingStatus = 'pending' | 'approved' | 'declined';

// ------ Row types (what you read) ------

export interface Vehicle {
  id: string;
  slug: string;
  name: string;
  headline: string;
  description: string;
  daily_price_cents: number;
  images: string[];
  experience_tags: string[];
  rental_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Booking {
  id: string;
  confirmation_code: string;
  vehicle_id: string;
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  start_date: string;
  end_date: string;
  status: BookingStatus;
  admin_notes: string | null;
  terms_accepted: boolean;
  created_at: string;
  updated_at: string;
}

// ------ Insert types (what you write) ------

export type VehicleInsert = Omit<Vehicle, 'id' | 'created_at' | 'updated_at'>;

export type BookingInsert = Omit<
  Booking,
  'id' | 'confirmation_code' | 'created_at' | 'updated_at'
>;

// ------ Update types (partial writes) ------

export type VehicleUpdate = Partial<VehicleInsert>;

export type BookingUpdate = Partial<
  Omit<Booking, 'id' | 'created_at' | 'updated_at'>
>;

// ------ Supabase generic Database type ------

export interface Database {
  public: {
    Tables: {
      vehicles: {
        Row: Vehicle;
        Insert: VehicleInsert;
        Update: VehicleUpdate;
      };
      bookings: {
        Row: Booking;
        Insert: BookingInsert;
        Update: BookingUpdate;
      };
    };
  };
}
