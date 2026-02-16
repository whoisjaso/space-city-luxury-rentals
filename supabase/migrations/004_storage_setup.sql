-- ---------------------------------------------------------------
-- 004: Storage bucket for vehicle images
-- Creates the vehicle-images bucket with public read access.
-- Admin (authenticated) can upload and delete images.
-- ---------------------------------------------------------------

-- Create vehicle-images bucket with public read
INSERT INTO storage.buckets (id, name, public)
VALUES ('vehicle-images', 'vehicle-images', true);

-- Anyone can view vehicle images (public bucket)
CREATE POLICY "Public read vehicle images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'vehicle-images');

-- Authenticated admin can upload vehicle images
CREATE POLICY "Admin can upload vehicle images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'vehicle-images' AND auth.role() = 'authenticated');

-- Authenticated admin can delete vehicle images
CREATE POLICY "Admin can delete vehicle images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'vehicle-images' AND auth.role() = 'authenticated');
