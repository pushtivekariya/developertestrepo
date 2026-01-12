-- Migration: Populate O'Donohoe social image URLs
-- Phase: 4.5
-- Client ID: 54479ee2-bc32-423e-865b-210572e8a0b0
-- Depends on: supabase/migrations/004_add_social_image_urls.sql

-- Note: After uploading images to the social-images bucket, update the URLs below
-- Image naming convention: {client_id}/og-image.jpg and {client_id}/twitter-image.jpg
-- Or use the canonical URL if images are hosted on the client's domain

UPDATE client_websites
SET 
  og_image_url = 'https://odonohoeagency.com/og-image-1200x630.jpg',
  twitter_image_url = 'https://odonohoeagency.com/twitter-image-1200x600.jpg'
WHERE client_id = '54479ee2-bc32-423e-865b-210572e8a0b0';
