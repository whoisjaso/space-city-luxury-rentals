-- ---------------------------------------------------------------
-- 002: Create bookings table
-- Stores guest booking requests with status workflow.
-- Columns mirror app/src/types/database.ts Booking interface.
-- ---------------------------------------------------------------

CREATE TABLE bookings (
  id                uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  confirmation_code text        UNIQUE NOT NULL DEFAULT '',
  vehicle_id        uuid        NOT NULL REFERENCES vehicles(id),
  guest_name        text        NOT NULL,
  guest_email       text        NOT NULL,
  guest_phone       text        NOT NULL,
  start_date        date        NOT NULL,
  end_date          date        NOT NULL,
  status            text        NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'approved', 'declined')),
  admin_notes       text,
  terms_accepted    boolean     NOT NULL DEFAULT false,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

-- Reuse the update_updated_at() function from 001
CREATE TRIGGER bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Generate 8-char uppercase alphanumeric confirmation code on INSERT
CREATE OR REPLACE FUNCTION generate_confirmation_code()
RETURNS TRIGGER AS $$
BEGIN
  NEW.confirmation_code = upper(substr(md5(random()::text), 1, 8));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER bookings_confirmation_code
  BEFORE INSERT ON bookings
  FOR EACH ROW
  WHEN (NEW.confirmation_code IS NULL OR NEW.confirmation_code = '')
  EXECUTE FUNCTION generate_confirmation_code();
