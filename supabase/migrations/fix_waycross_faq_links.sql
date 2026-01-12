-- Fix Waycross FAQ links missing -Waycross-GA suffix
-- Affected policies: Auto Insurance, Boat & Watercraft, Motorcycle Insurance, Pet Insurance
-- Location ID: f455ea0b-e6c9-4166-89e0-4a9879a27213

-- Update all FAQ links in Waycross policies to include the -Waycross-GA suffix
UPDATE client_policy_pages
SET faqs = REPLACE(
  REPLACE(
    REPLACE(
      REPLACE(
        REPLACE(
          faqs::text,
          'href=\"umbrella-insurance\"', 'href=\"umbrella-insurance-Waycross-GA\"'
        ),
        'href=\"classic-car-insurance\"', 'href=\"classic-car-insurance-Waycross-GA\"'
      ),
      'href=\"auto-insurance\"', 'href=\"auto-insurance-Waycross-GA\"'
    ),
    'href=\"renters-insurance\"', 'href=\"renters-insurance-Waycross-GA\"'
  ),
  'href=\"homeowners-insurance\"', 'href=\"homeowners-insurance-Waycross-GA\"'
)::jsonb
WHERE location_id = 'f455ea0b-e6c9-4166-89e0-4a9879a27213'
AND faqs IS NOT NULL;
