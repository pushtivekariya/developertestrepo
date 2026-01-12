-- Migration: Enhance client_websites for analytics and features
-- Date: 2024-12-01
-- Phase: 2

-- Add Google Ads tracking ID
ALTER TABLE client_websites 
ADD COLUMN IF NOT EXISTS google_ads_id TEXT;

-- Add CallRail tracking
ALTER TABLE client_websites 
ADD COLUMN IF NOT EXISTS callrail_company_id TEXT;

ALTER TABLE client_websites 
ADD COLUMN IF NOT EXISTS callrail_swap_script TEXT;

-- Add feature flags JSONB
ALTER TABLE client_websites 
ADD COLUMN IF NOT EXISTS features JSONB DEFAULT '{
  "show_blog": true,
  "show_glossary": true,
  "show_faq_page": true,
  "show_careers_page": true,
  "show_social_links": true,
  "show_business_hours": true,
  "show_agent_network": false,
  "show_about_description": false,
  "show_regional_text": false,
  "multi_location": false
}'::jsonb;

-- Add FAQs JSONB for dedicated FAQ page
ALTER TABLE client_websites 
ADD COLUMN IF NOT EXISTS faqs JSONB DEFAULT '{}'::jsonb;

-- Add badges JSONB for certifications
ALTER TABLE client_websites 
ADD COLUMN IF NOT EXISTS badges JSONB DEFAULT '[]'::jsonb;

-- Add tagline for footer/branding
ALTER TABLE client_websites 
ADD COLUMN IF NOT EXISTS tagline TEXT;

-- Add comments for documentation
COMMENT ON COLUMN client_websites.google_ads_id IS 'Google Ads conversion tracking ID (AW-XXXXXXXXX)';
COMMENT ON COLUMN client_websites.callrail_company_id IS 'CallRail company ID for dynamic number insertion';
COMMENT ON COLUMN client_websites.callrail_swap_script IS 'Full CallRail swap.js script URL';
COMMENT ON COLUMN client_websites.features IS 'Feature flags controlling which sections/pages are shown';
COMMENT ON COLUMN client_websites.faqs IS 'FAQ content for dedicated FAQ page, structured by category';
COMMENT ON COLUMN client_websites.badges IS 'Certification badges like Trusted Choice, TWIA Partner';
COMMENT ON COLUMN client_websites.tagline IS 'Agency tagline for footer and branding (e.g., Your local insurance partner since 1967)';
