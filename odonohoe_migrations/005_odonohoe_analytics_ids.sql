-- Migration: Populate O'Donohoe analytics tracking IDs
-- Phase: 2
-- Client ID: 54479ee2-bc32-423e-865b-210572e8a0b0

UPDATE client_websites
SET 
  google_tag_id = 'GTM-53H4RV29',
  google_analytics_id = 'G-S7459R6TPN',
  google_ads_id = 'AW-17017942150',
  callrail_company_id = '236834426',
  callrail_swap_script = '//cdn.callrail.com/companies/236834426/aa6542c1cfc76abfe3ee/12/swap.js'
WHERE client_id = '54479ee2-bc32-423e-865b-210572e8a0b0';
