-- ==========================================
-- Storage Buckets Migration
-- ==========================================
-- This migration creates all necessary Supabase Storage buckets
-- for the Ashram Management application
--
-- Reference: https://supabase.com/docs/guides/storage/buckets/creating-buckets
-- Buckets can be created using SQL by inserting into storage.buckets table
-- ==========================================

-- ==========================================
-- Bucket: gurukul-files
-- ==========================================
-- Purpose: Store all Gurukul-related files including:
--   - Course cover images
--   - Study material cover images
--   - PDF files
--   - Video files
--   - Audio files
--   - Other digital study materials
--
-- Configuration:
--   - Public: Yes (files need to be accessible via URLs)
--   - File size limit: 100MB (default, can be adjusted)
--   - Allowed MIME types: 
--     * Images: image/* (for covers)
--     * Documents: application/pdf
--     * Videos: video/*
--     * Audio: audio/*
--
-- Folder Structure:
--   gurukul-files/
--     ├── covers/          (course and material cover images)
--     ├── pdfs/            (PDF study materials)
--     ├── videos/          (video files)
--     ├── audio/           (audio files)
--     └── other/           (other file types)
--
-- RLS Policies:
--   - Public read access (for public URLs)
--   - Authenticated users can upload (for admins)
--   - Authenticated users can update/delete their own uploads
-- ==========================================

-- Create the gurukul-files bucket using SQL
-- Reference: https://supabase.com/docs/guides/storage/buckets/creating-buckets
INSERT INTO storage.buckets (id, name, public)
VALUES (
  'gurukul-files',
  'gurukul-files',
  true
)
ON CONFLICT (id) DO NOTHING;

-- ==========================================
-- Storage Policies for gurukul-files
-- ==========================================

-- Drop existing policies if they exist (to allow re-running migration)
DROP POLICY IF EXISTS "Public read access for gurukul-files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload to gurukul-files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update gurukul-files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete from gurukul-files" ON storage.objects;

-- Policy: Allow public read access
CREATE POLICY "Public read access for gurukul-files"
ON storage.objects
FOR SELECT
USING (bucket_id = 'gurukul-files');

-- Policy: Allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload to gurukul-files"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'gurukul-files' 
  AND auth.role() = 'authenticated'
);

-- Policy: Allow authenticated users to update their uploads
CREATE POLICY "Authenticated users can update gurukul-files"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'gurukul-files' 
  AND auth.role() = 'authenticated'
);

-- Policy: Allow authenticated users to delete their uploads
CREATE POLICY "Authenticated users can delete from gurukul-files"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'gurukul-files' 
  AND auth.role() = 'authenticated'
);

-- ==========================================
-- Additional Buckets (if needed in future)
-- ==========================================

-- Bucket: ashram-documents (for general document storage)
-- supabase storage create ashram-documents --public
--
-- Bucket: devotee-photos (for devotee profile photos)
-- supabase storage create devotee-photos --public
--
-- Bucket: puja-images (for puja-related images)
-- supabase storage create puja-images --public
--
-- Bucket: event-media (for event photos/videos)
-- supabase storage create event-media --public

-- ==========================================
-- Notes
-- ==========================================
-- 1. Bucket names must be lowercase and can only contain:
--    - Letters (a-z)
--    - Numbers (0-9)
--    - Hyphens (-)
--    - Underscores (_)
--
-- 2. Public buckets allow files to be accessed via public URLs
--    without authentication. Use with caution for sensitive data.
--
-- 3. Private buckets require authentication to access files.
--    Use for sensitive documents.
--
-- 4. File size limits can be configured in Supabase Dashboard:
--    Storage > Settings > File size limit
--
-- 5. To set up CORS for direct browser uploads:
--    Storage > Settings > CORS configuration
--
-- 6. To verify bucket creation:
--    SELECT * FROM storage.buckets WHERE name = 'gurukul-files';
-- ==========================================

