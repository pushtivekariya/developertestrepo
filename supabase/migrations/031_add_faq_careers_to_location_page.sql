-- Migration: Add faq_section and careers_section columns to client_location_page
-- Purpose: Store FAQ and Careers section configuration for location landing pages
-- DO NOT APPLY without explicit approval

ALTER TABLE client_location_page
ADD COLUMN IF NOT EXISTS faq_section JSONB DEFAULT NULL;

ALTER TABLE client_location_page
ADD COLUMN IF NOT EXISTS careers_section JSONB DEFAULT NULL;

-- Add comments for documentation
COMMENT ON COLUMN client_location_page.faq_section IS 'JSONB settings for FAQ section: tagline (string), subtitle (string), description (string), questions (array of {question, answer}), show_section (boolean)';

COMMENT ON COLUMN client_location_page.careers_section IS 'JSONB settings for Careers section: heading (string), description (string), button_text (string), show_section (boolean)';

-- Example faq_section structure:
-- {
--   "tagline": "Common Questions",
--   "subtitle": "Questions We Often Hear",
--   "description": "Quick answers to help you understand your coverage options.",
--   "questions": [
--     { "question": "What types of insurance do you offer?", "answer": "We offer auto, home, life, and business insurance." }
--   ],
--   "show_section": true
-- }

-- Example careers_section structure:
-- {
--   "heading": "Join Our Team",
--   "description": "Start your career in insurance with us.",
--   "button_text": "Apply Now",
--   "show_section": true
-- }
