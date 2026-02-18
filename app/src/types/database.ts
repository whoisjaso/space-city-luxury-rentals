// ---------------------------------------------------------------
// Database types – mirrors the Supabase schema for vehicles & bookings.
// Generated manually; replace with `supabase gen types` once the
// remote project is connected.
// ---------------------------------------------------------------

export type BookingStatus = 'pending' | 'approved' | 'declined' | 'completed' | 'cancelled';

export type PaymentStatus =
  | 'none'
  | 'authorized'
  | 'captured'
  | 'cancelled'
  | 'refunded'
  | 'partially_refunded';

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
  // Payment fields
  stripe_payment_intent_id: string | null;
  payment_status: PaymentStatus;
  total_amount_cents: number | null;
  security_deposit_cents: number;
  captured_amount_cents: number | null;
  refunded_amount_cents: number;
  created_at: string;
  updated_at: string;
}

export interface PaymentEvent {
  id: string;
  booking_id: string;
  event_type: 'authorized' | 'captured' | 'cancelled' | 'refunded' | 'partial_refund' | 'failed';
  amount_cents: number | null;
  stripe_event_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
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
// Must include Tables (with Relationships), Views, and Functions to satisfy
// @supabase/supabase-js GenericSchema constraint.

export type Database = {
  public: {
    Tables: {
      vehicles: {
        Row: Vehicle;
        Insert: VehicleInsert;
        Update: VehicleUpdate;
        Relationships: [];
      };
      bookings: {
        Row: Booking;
        Insert: BookingInsert;
        Update: BookingUpdate;
        Relationships: [
          {
            foreignKeyName: 'bookings_vehicle_id_fkey';
            columns: ['vehicle_id'];
            isOneToOne: false;
            referencedRelation: 'vehicles';
            referencedColumns: ['id'];
          },
        ];
      };
      payment_events: {
        Row: PaymentEvent;
        Insert: Omit<PaymentEvent, 'id' | 'created_at'>;
        Update: Partial<Omit<PaymentEvent, 'id' | 'created_at'>>;
        Relationships: [
          {
            foreignKeyName: 'payment_events_booking_id_fkey';
            columns: ['booking_id'];
            isOneToOne: false;
            referencedRelation: 'bookings';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: Record<
      string,
      {
        Row: Record<string, unknown>;
        Relationships: [];
      }
    >;
    Functions: Record<
      string,
      {
        Args: Record<string, unknown>;
        Returns: unknown;
      }
    >;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
