-- Migration: Populate O'Donohoe social links
-- Phase: 1
-- Client ID: 54479ee2-bc32-423e-865b-210572e8a0b0

UPDATE client_websites
SET social_links = '{
  "facebook": "https://www.facebook.com/theodonohoeagency",
  "instagram": "https://www.instagram.com/odonohoeagency/",
  "linkedin": "https://www.linkedin.com/company/the-odonohoe-agency",
  "youtube": "https://youtube.com/@theodonohoeagencygalveston?si=5kHTLQ9ao-p-aVc7"
}'::jsonb
WHERE client_id = '54479ee2-bc32-423e-865b-210572e8a0b0';
