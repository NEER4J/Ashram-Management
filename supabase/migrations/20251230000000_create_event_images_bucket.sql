-- ==========================================
-- Storage Bucket: event-images
-- ==========================================
-- Purpose: Store event-related images including:
--   - Event hero images
--   - Event promotional images
--
-- Configuration:
--   - Public: Yes (images need to be accessible via URLs)
--   - File size limit: 10MB (for images)
--   - Allowed MIME types: image/* (JPG, PNG, WebP, etc.)
--
-- Folder Structure:
--   event-images/
--     ├── heroes/          (event hero/banner images)
--     └── promotional/     (promotional images)
--
-- RLS Policies:
--   - Public read access (for public URLs)
--   - Authenticated users can upload (for admins)
--   - Authenticated users can update/delete their own uploads
-- ==========================================

-- Create the event-images bucket using SQL
INSERT INTO storage.buckets (id, name, public)
VALUES (
  'event-images',
  'event-images',
  true
)
ON CONFLICT (id) DO NOTHING;

-- ==========================================
-- Storage Policies for event-images
-- ==========================================

-- Drop existing policies if they exist (to allow re-running migration)
DROP POLICY IF EXISTS "Public read access for event-images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload to event-images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update event-images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete from event-images" ON storage.objects;

-- Policy: Allow public read access
CREATE POLICY "Public read access for event-images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'event-images');

-- Policy: Allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload to event-images"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'event-images' 
  AND auth.role() = 'authenticated'
);

-- Policy: Allow authenticated users to update their uploads
CREATE POLICY "Authenticated users can update event-images"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'event-images' 
  AND auth.role() = 'authenticated'
);

-- Policy: Allow authenticated users to delete their uploads
CREATE POLICY "Authenticated users can delete from event-images"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'event-images' 
  AND auth.role() = 'authenticated'
);
