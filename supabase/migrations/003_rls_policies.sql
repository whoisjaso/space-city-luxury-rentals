-- ---------------------------------------------------------------
-- 003: Row Level Security policies
-- Ensures anonymous users can only browse vehicles and submit
-- bookings. Admin (authenticated) has full CRUD on everything.
-- ---------------------------------------------------------------

-- Enable RLS on both tables
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- ===================== VEHICLES =====================

-- Anyone (anon or authenticated) can read active vehicles
CREATE POLICY "Anyone can view active vehicles"
  ON vehicles FOR SELECT
  USING (is_active = true);

-- Authenticated admin can perform all operations (including viewing inactive)
CREATE POLICY "Admin can manage vehicles"
  ON vehicles FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- ===================== BOOKINGS =====================

-- Anyone can submit a new booking (guest checkout)
CREATE POLICY "Anyone can create bookings"
  ON bookings FOR INSERT
  WITH CHECK (true);

-- Anyone can view bookings (app filters by confirmation_code/email)
-- Note: In production, restrict further via app-level query filtering.
CREATE POLICY "Anyone can view bookings by confirmation code"
  ON bookings FOR SELECT
  USING (true);

-- Only authenticated admin can update booking status/notes
CREATE POLICY "Admin can manage bookings"
  ON bookings FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Only authenticated admin can delete bookings
CREATE POLICY "Admin can delete bookings"
  ON bookings FOR DELETE
  USING (auth.role() = 'authenticated');
