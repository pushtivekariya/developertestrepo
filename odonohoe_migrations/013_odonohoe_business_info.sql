-- Migration: Populate O'Donohoe business info
-- Phase 6: Business-specific content
-- Client ID: 54479ee2-bc32-423e-865b-210572e8a0b0
-- DO NOT APPLY - Migration file only
--
-- VERIFIED SCHEMA (2026-01-09):
-- Columns: id, client_id, founding_year, slogan, tagline, service_area_description, about_short, about_long, created_at, updated_at
-- NOTE: years_in_business_text and regional_descriptor columns DO NOT EXIST

INSERT INTO client_business_info (
  client_id,
  founding_year,
  slogan,
  tagline,
  service_area_description,
  about_short,
  about_long
) VALUES (
  '54479ee2-bc32-423e-865b-210572e8a0b0',
  1967,
  'Serving Galveston, Texas with Trusted Insurance Solutions Since 1967',
  'Galveston''s Trusted Insurance Partner',
  'Galveston and the surrounding coastal communities',
  'Discover The O''Donohoe Agency in Galveston, Texas—providing personalized auto, home, life, and business insurance with over 55 years of trusted local service.',
  'For over 55 years, The O''Donohoe Agency has been the trusted insurance partner for families and businesses across the Texas Gulf Coast. As an independent agency, we represent multiple carriers to find you the best coverage at competitive rates. Our experienced team takes pride in providing personalized service and building lasting relationships with our clients.'
)
ON CONFLICT (client_id) DO UPDATE SET
  founding_year = EXCLUDED.founding_year,
  slogan = EXCLUDED.slogan,
  tagline = EXCLUDED.tagline,
  service_area_description = EXCLUDED.service_area_description,
  about_short = EXCLUDED.about_short,
  about_long = EXCLUDED.about_long,
  updated_at = now();
