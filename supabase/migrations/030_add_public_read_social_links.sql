-- Add public read policy for client_social_links
-- This allows the website footer to display social links without authentication
-- The social links are public-facing data (URLs to social media profiles)

CREATE POLICY "public_read_social_links" 
ON public.client_social_links
FOR SELECT
TO anon
USING (true);
