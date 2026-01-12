-- Migration: Populate O'Donohoe feature flags
-- Phase: 2
-- Client ID: 54479ee2-bc32-423e-865b-210572e8a0b0

UPDATE client_websites
SET features = '{
  "show_blog": true,
  "show_glossary": true,
  "show_faq_page": true,
  "show_careers_page": true,
  "show_social_links": true,
  "show_business_hours": true,
  "show_agent_network": true,
  "show_about_description": true,
  "show_regional_text": true,
  "multi_location": false
}'::jsonb
WHERE client_id = '54479ee2-bc32-423e-865b-210572e8a0b0';
