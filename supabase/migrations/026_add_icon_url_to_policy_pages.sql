-- Add icon_url column to client_policy_pages
ALTER TABLE client_policy_pages ADD COLUMN IF NOT EXISTS icon_url TEXT;

-- Backfill icon_url from client_website_icon_list based on title match
UPDATE client_policy_pages p
SET icon_url = i.icon_url
FROM client_website_icon_list i
WHERE LOWER(p.title) = LOWER(i.title)
AND i."className" = 'h-10 w-10 text-[#004080]'
AND p.icon_url IS NULL;
