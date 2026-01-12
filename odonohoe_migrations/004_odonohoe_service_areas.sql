-- Migration: Populate O'Donohoe service areas
-- Phase: 1
-- Client ID: 54479ee2-bc32-423e-865b-210572e8a0b0

UPDATE client_websites
SET service_areas = '[
  "Galveston",
  "Texas City",
  "League City",
  "Dickinson",
  "La Marque",
  "Santa Fe",
  "Friendswood",
  "Clear Lake"
]'::jsonb
WHERE client_id = '54479ee2-bc32-423e-865b-210572e8a0b0';
