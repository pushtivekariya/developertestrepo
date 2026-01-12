-- Migration: Populate O'Donohoe theme settings
-- Phase 6: Theme configuration
-- Client ID: 54479ee2-bc32-423e-865b-210572e8a0b0
-- DO NOT APPLY - Migration file only
--
-- VERIFIED SCHEMA (2026-01-09):
-- Colors extracted from odonohoe-nextjs/styles/globals.css
-- Fonts extracted from odonohoe-nextjs/tailwind.config.ts

INSERT INTO client_theme_settings (
  client_id,
  color_primary,
  color_primary_foreground,
  color_secondary,
  color_secondary_foreground,
  color_accent,
  color_accent_foreground,
  color_background,
  color_background_alt,
  color_text_primary,
  color_text_body,
  color_text_muted,
  divider_color,
  divider_thickness,
  divider_style,
  font_heading,
  font_body,
  font_accent,
  heading_weight,
  body_weight
) VALUES (
  '54479ee2-bc32-423e-865b-210572e8a0b0',
  '203 80% 28%',           -- primary: navy blue (#004080 equivalent)
  '0 0% 98%',              -- primary-foreground: white
  '196 20% 95%',           -- secondary: light gray-blue
  '203 80% 16%',           -- secondary-foreground: dark navy
  '42 55% 80%',            -- accent: sand/gold
  '203 80% 16%',           -- accent-foreground: dark navy
  '194 60% 98%',           -- background: very light blue
  '0 0% 100%',             -- background-alt: white (for cards)
  '203 80% 16%',           -- text-primary: dark navy (foreground)
  '203 80% 16%',           -- text-body: dark navy
  '203 30% 40%',           -- text-muted: muted navy
  '196 20% 88%',           -- divider-color: border color
  1,                       -- divider-thickness
  'solid',                 -- divider-style
  'Playfair Display',      -- font-heading
  'Inter',                 -- font-body
  'Caveat',                -- font-accent
  '700',                   -- heading-weight: bold
  '400'                    -- body-weight: normal
)
ON CONFLICT (client_id) DO UPDATE SET
  color_primary = EXCLUDED.color_primary,
  color_primary_foreground = EXCLUDED.color_primary_foreground,
  color_secondary = EXCLUDED.color_secondary,
  color_secondary_foreground = EXCLUDED.color_secondary_foreground,
  color_accent = EXCLUDED.color_accent,
  color_accent_foreground = EXCLUDED.color_accent_foreground,
  color_background = EXCLUDED.color_background,
  color_background_alt = EXCLUDED.color_background_alt,
  color_text_primary = EXCLUDED.color_text_primary,
  color_text_body = EXCLUDED.color_text_body,
  color_text_muted = EXCLUDED.color_text_muted,
  divider_color = EXCLUDED.divider_color,
  divider_thickness = EXCLUDED.divider_thickness,
  divider_style = EXCLUDED.divider_style,
  font_heading = EXCLUDED.font_heading,
  font_body = EXCLUDED.font_body,
  font_accent = EXCLUDED.font_accent,
  heading_weight = EXCLUDED.heading_weight,
  body_weight = EXCLUDED.body_weight,
  updated_at = now();
