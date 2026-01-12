-- Migration: Create social-images storage bucket for OG/Twitter images
-- Phase: 4.5
-- Date: 2024-12-01
-- Purpose: Store per-client social sharing images (OpenGraph & Twitter Cards)

-- Create the social-images bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'social-images',
  'social-images',
  true,
  512000,  -- 500KB limit (optimized for social platforms)
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policy for public read access
CREATE POLICY "Public read access for social images"
ON storage.objects FOR SELECT
USING (bucket_id = 'social-images');

-- Create RLS policy for authenticated uploads
CREATE POLICY "Authenticated users can upload social images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'social-images');

-- Create RLS policy for authenticated updates
CREATE POLICY "Authenticated users can update social images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'social-images');

-- Create RLS policy for authenticated deletes
CREATE POLICY "Authenticated users can delete social images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'social-images');
