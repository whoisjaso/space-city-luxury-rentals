-- Migration: Add Stripe payment fields to bookings and create payment_events table
-- This supports the pre-authorization + capture payment flow.

-- Add payment columns to bookings
ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS stripe_payment_intent_id text,
  ADD COLUMN IF NOT EXISTS payment_status text NOT NULL DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS total_amount_cents integer,
  ADD COLUMN IF NOT EXISTS security_deposit_cents integer NOT NULL DEFAULT 50000,
  ADD COLUMN IF NOT EXISTS captured_amount_cents integer,
  ADD COLUMN IF NOT EXISTS refunded_amount_cents integer DEFAULT 0;

-- Add check constraint for payment_status
ALTER TABLE bookings
  ADD CONSTRAINT bookings_payment_status_check
  CHECK (payment_status IN ('none', 'authorized', 'captured', 'cancelled', 'refunded', 'partially_refunded'));

-- Add new booking statuses (completed, cancelled) to existing check if exists
-- If there's no existing check, this is a no-op in practice since status is text
DO $$
BEGIN
  -- Try to drop the old constraint if it exists
  ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_status_check;
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;

-- Payment audit log
CREATE TABLE IF NOT EXISTS payment_events (
  id             uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id     uuid        NOT NULL REFERENCES bookings(id),
  event_type     text        NOT NULL
    CHECK (event_type IN ('authorized', 'captured', 'cancelled', 'refunded', 'partial_refund', 'failed')),
  amount_cents   integer,
  stripe_event_id text,
  metadata       jsonb       DEFAULT '{}',
  created_at     timestamptz NOT NULL DEFAULT now()
);

-- RLS for payment_events
ALTER TABLE payment_events ENABLE ROW LEVEL SECURITY;

-- Authenticated users (admin) can view payment events
CREATE POLICY "Admin can view payment events"
  ON payment_events FOR SELECT
  USING (auth.role() = 'authenticated');

-- Service role can insert payment events (Edge Functions)
CREATE POLICY "Service role can insert payment events"
  ON payment_events FOR INSERT
  WITH CHECK (true);

-- Index for looking up payment events by booking
CREATE INDEX IF NOT EXISTS idx_payment_events_booking_id
  ON payment_events(booking_id);

-- Index for looking up bookings by payment intent
CREATE INDEX IF NOT EXISTS idx_bookings_stripe_pi
  ON bookings(stripe_payment_intent_id)
  WHERE stripe_payment_intent_id IS NOT NULL;
