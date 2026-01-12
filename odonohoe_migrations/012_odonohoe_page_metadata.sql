-- Migration: Populate O'Donohoe page metadata
-- Phase: 4.6
-- Client ID: 54479ee2-bc32-423e-865b-210572e8a0b0
-- Depends on: supabase/migrations/006_client_page_metadata.sql

INSERT INTO client_page_metadata (
  client_id, 
  location_id,
  page_key, 
  meta_title, 
  meta_description, 
  hero_heading, 
  hero_subheading
)
VALUES
  -- Home page
  (
    '54479ee2-bc32-423e-865b-210572e8a0b0',
    NULL,
    'home',
    '{agencyName} | {city}''s Trusted Insurance Partner Since 1967',
    'Discover {agencyName} in {city}, {state}—providing personalized auto, home, life, and business insurance with over 50 years of trusted local service.',
    NULL,
    NULL
  ),
  -- About page
  (
    '54479ee2-bc32-423e-865b-210572e8a0b0',
    NULL,
    'about',
    'About {agencyName} | Trusted Insurance Agency in {city}, {state}',
    'Learn about {agencyName}, serving {city} and the Texas Gulf Coast since 1967 with personalized auto, home, life, and business insurance solutions.',
    'About Us',
    'Serving {city} and the Texas Gulf Coast since 1967'
  ),
  -- Contact page
  (
    '54479ee2-bc32-423e-865b-210572e8a0b0',
    NULL,
    'contact',
    'Contact {agencyName} | Insurance Agency in {city}, {state}',
    'Get in touch with {agencyName}, your trusted insurance agency in {city}, {state}. Contact us today to learn more about our insurance services.',
    'Contact Us',
    'We''re here to help with all your insurance needs'
  ),
  -- Blog hub
  (
    '54479ee2-bc32-423e-865b-210572e8a0b0',
    NULL,
    'blog',
    'Insurance Blog | {agencyName}',
    'Stay informed with the latest insurance tips, industry updates, and helpful guides from {agencyName} in {city}, {state}.',
    'Insurance Blog',
    'Tips, guides, and industry updates for {city} residents'
  ),
  -- Policies hub
  (
    '54479ee2-bc32-423e-865b-210572e8a0b0',
    NULL,
    'policies',
    'Insurance Policies | {agencyName}',
    'Explore our insurance policies including personal, business, and niche insurance options from {agencyName} in {city}, {state}.',
    'Our Insurance Policies',
    'Comprehensive coverage options for individuals and businesses'
  ),
  -- Glossary
  (
    '54479ee2-bc32-423e-865b-210572e8a0b0',
    NULL,
    'glossary',
    'Insurance Glossary | {agencyName}',
    'Learn insurance terminology with our comprehensive glossary. {agencyName} helps {city} residents understand their coverage.',
    'Insurance Glossary',
    'Understanding insurance terminology made simple'
  ),
  -- FAQ
  (
    '54479ee2-bc32-423e-865b-210572e8a0b0',
    NULL,
    'faq',
    'Frequently Asked Questions | {agencyName}',
    'Find answers to common insurance questions from {agencyName} in {city}, {state}.',
    'Frequently Asked Questions',
    'Answers to your most common insurance questions'
  ),
  -- Our Team
  (
    '54479ee2-bc32-423e-865b-210572e8a0b0',
    NULL,
    'our-team',
    'Our Team | {agencyName}',
    'Meet the experienced insurance professionals at {agencyName} serving {city}, {state} and the Texas Gulf Coast.',
    'Our Team',
    'Experienced professionals dedicated to your insurance needs'
  ),
  -- Locations hub (for future multi-location)
  (
    '54479ee2-bc32-423e-865b-210572e8a0b0',
    NULL,
    'locations',
    'Our Locations | {agencyName}',
    'Find {agencyName} offices near you. We serve multiple locations with personalized insurance solutions.',
    'Our Locations',
    'Find a {agencyName} location near you'
  )
ON CONFLICT (client_id, location_id, page_key) DO UPDATE SET
  meta_title = EXCLUDED.meta_title,
  meta_description = EXCLUDED.meta_description,
  hero_heading = EXCLUDED.hero_heading,
  hero_subheading = EXCLUDED.hero_subheading,
  updated_at = now();
