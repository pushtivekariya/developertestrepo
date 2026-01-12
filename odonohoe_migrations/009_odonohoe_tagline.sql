-- Migration: Populate O'Donohoe tagline
-- Phase: 2
-- Client ID: 54479ee2-bc32-423e-865b-210572e8a0b0

UPDATE client_websites
SET tagline = 'Your local insurance partner providing peace of mind on island time since 1967.'
WHERE client_id = '54479ee2-bc32-423e-865b-210572e8a0b0';
