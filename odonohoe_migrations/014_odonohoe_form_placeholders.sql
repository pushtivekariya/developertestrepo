-- Migration: Populate O'Donohoe form placeholders
-- Phase 6: Form customization data
-- Client ID: 54479ee2-bc32-423e-865b-210572e8a0b0
-- DO NOT APPLY - Migration file only

UPDATE client_websites
SET form_placeholders = '{
  "city": "Galveston",
  "state": "TX",
  "zip": "77550",
  "phone": "(409) 555-1234",
  "email": "your.email@example.com"
}'::jsonb
WHERE client_id = '54479ee2-bc32-423e-865b-210572e8a0b0';
