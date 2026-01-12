-- Migration: Update Larson Group inline policy links to use base slug format
-- Client ID: 3625bd9d-6232-4369-8239-394cffb27c03
-- 
-- This updates content_sections to replace:
--   /policies/all/{slug} -> {slug}
-- 
-- This allows the frontend routing to handle category resolution dynamically

UPDATE client_policy_pages
SET content_sections = REPLACE(
  content_sections::text,
  '/policies/all/',
  ''
)::jsonb
WHERE client_id = '3625bd9d-6232-4369-8239-394cffb27c03'
  AND content_sections::text LIKE '%/policies/all/%';
