-- Migration: Populate O'Donohoe certification badges
-- Phase: 2
-- Client ID: 54479ee2-bc32-423e-865b-210572e8a0b0

UPDATE client_websites
SET badges = '[
  { "name": "Trusted Choice", "icon_class": "trusted-choice" },
  { "name": "Independent Agent", "icon_class": "independent-agent" },
  { "name": "TWIA Partner", "icon_class": "twia-partner" }
]'::jsonb
WHERE client_id = '54479ee2-bc32-423e-865b-210572e8a0b0';
