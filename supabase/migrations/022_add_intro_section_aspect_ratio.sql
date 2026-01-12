-- Add intro_section_aspect_ratio column to client_theme_settings
-- This column controls the aspect ratio of the intro section image
-- Options: '4:3' (default), '1:1', '16:9'

ALTER TABLE client_theme_settings
ADD COLUMN intro_section_aspect_ratio TEXT DEFAULT '4:3' 
CHECK (intro_section_aspect_ratio IN ('4:3', '1:1', '16:9'));

COMMENT ON COLUMN client_theme_settings.intro_section_aspect_ratio IS 'Aspect ratio for intro section image: 4:3 (default), 1:1, or 16:9';
