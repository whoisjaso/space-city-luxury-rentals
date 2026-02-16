-- ---------------------------------------------------------------
-- 001: Create vehicles table
-- Stores the luxury vehicle fleet inventory.
-- Columns mirror app/src/types/database.ts Vehicle interface.
-- ---------------------------------------------------------------

CREATE TABLE vehicles (
  id            uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  slug          text        UNIQUE NOT NULL,
  name          text        NOT NULL,
  headline      text        NOT NULL DEFAULT '',
  description   text        NOT NULL DEFAULT '',
  daily_price_cents integer NOT NULL,
  images        text[]      NOT NULL DEFAULT '{}',
  experience_tags text[]    NOT NULL DEFAULT '{}',
  rental_count  integer     NOT NULL DEFAULT 0,
  is_active     boolean     NOT NULL DEFAULT true,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

-- Auto-update updated_at on any row modification
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER vehicles_updated_at
  BEFORE UPDATE ON vehicles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
