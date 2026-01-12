-- Migration: Populate O'Donohoe location data
-- Phase: 1
-- Client ID: 54479ee2-bc32-423e-865b-210572e8a0b0

UPDATE client_websites
SET 
  latitude = 29.2733,
  longitude = -94.7977,
  phone = '(409) 744-1888',
  secondary_phone = '409-402-5197',
  sms_phone = '4093650065',
  sms_default_message = 'Hi! I''d like to get an insurance quote. Please contact me.',
  email = 'info@odonohoeagency.com',
  service_radius_meters = 25000
WHERE client_id = '54479ee2-bc32-423e-865b-210572e8a0b0';
