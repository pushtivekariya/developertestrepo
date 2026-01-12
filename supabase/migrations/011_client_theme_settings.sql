-- Migration: Create client_theme_settings table
-- Phase: 7 - Dynamic Theming System
-- Date: 2024-12-01
-- Purpose: Store theme configuration per client (agency). Shared across all locations.
-- DO NOT APPLY - Migration file only (will be applied when template is deployed)

CREATE TABLE IF NOT EXISTS client_theme_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  
  -- ============================================
  -- PRIMARY COLORS (main brand color)
  -- ============================================
  color_primary TEXT DEFAULT '#004080',        -- navy equivalent (headings, links)
  color_primary_foreground TEXT DEFAULT '#FFFFFF',
  
  -- ============================================
  -- ACCENT COLORS (CTAs, hover states, highlights)
  -- ============================================
  color_accent TEXT DEFAULT '#F76C5E',         -- coral equivalent
  color_accent_foreground TEXT DEFAULT '#FFFFFF',
  
  -- ============================================
  -- SECONDARY COLORS (badges, icons, subtle backgrounds)
  -- ============================================
  color_secondary TEXT DEFAULT '#A7D8DE',      -- ocean equivalent
  color_secondary_foreground TEXT DEFAULT '#004080',
  
  -- ============================================
  -- BACKGROUND COLORS
  -- ============================================
  color_background TEXT DEFAULT '#FAF3E0',     -- sand equivalent (section backgrounds)
  color_background_alt TEXT DEFAULT '#FFFFFF', -- card/content backgrounds
  
  -- ============================================
  -- TEXT COLORS
  -- ============================================
  color_text_primary TEXT DEFAULT '#004080',   -- headings (matches primary)
  color_text_body TEXT DEFAULT '#5C4B51',      -- driftwood equivalent (paragraphs)
  color_text_muted TEXT DEFAULT '#6B7280',     -- subtle text, captions
  
  -- ============================================
  -- DIVIDER SETTINGS (replaces RopeDivider)
  -- ============================================
  divider_color TEXT DEFAULT '#A7D8DE',        -- ocean by default
  divider_thickness INTEGER DEFAULT 4          -- pixels (1-50 range)
    CHECK (divider_thickness >= 1 AND divider_thickness <= 50),
  divider_style TEXT DEFAULT 'solid'           -- solid, dashed, dotted
    CHECK (divider_style IN ('solid', 'dashed', 'dotted')),
  
  -- ============================================
  -- TYPOGRAPHY SETTINGS
  -- ============================================
  font_heading TEXT DEFAULT 'Playfair Display',
  font_body TEXT DEFAULT 'Inter',
  font_accent TEXT DEFAULT 'Caveat',           -- decorative/handwritten
  
  -- Font Size Multipliers (1.0 = default, 0.9 = 90%, 1.1 = 110%)
  heading_size_multiplier DECIMAL(3,2) DEFAULT 1.0
    CHECK (heading_size_multiplier >= 0.5 AND heading_size_multiplier <= 2.0),
  body_size_multiplier DECIMAL(3,2) DEFAULT 1.0
    CHECK (body_size_multiplier >= 0.5 AND body_size_multiplier <= 2.0),
  
  -- Font Weight Overrides
  heading_weight TEXT DEFAULT '700'            -- 400, 500, 600, 700, 800
    CHECK (heading_weight IN ('400', '500', '600', '700', '800')),
  body_weight TEXT DEFAULT '400'
    CHECK (body_weight IN ('300', '400', '500', '600')),
  
  -- ============================================
  -- SECTION-SPECIFIC OVERRIDES (optional flexibility)
  -- ============================================
  section_overrides JSONB DEFAULT '{}'::jsonb,
  
  -- ============================================
  -- TIMESTAMPS
  -- ============================================
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure one theme per client (agency-wide)
  UNIQUE(client_id)
);

-- Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_client_theme_settings_client_id 
ON client_theme_settings(client_id);

-- Enable RLS
ALTER TABLE client_theme_settings ENABLE ROW LEVEL SECURITY;

-- Public read access (themes are not sensitive)
CREATE POLICY "Public read access for theme settings"
ON client_theme_settings FOR SELECT
USING (true);

-- Authenticated users can manage theme settings
CREATE POLICY "Authenticated users can manage theme settings"
ON client_theme_settings FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Add comments for documentation
COMMENT ON TABLE client_theme_settings IS 'Theme configuration per client (agency). Shared across all locations.';
COMMENT ON COLUMN client_theme_settings.client_id IS 'FK to clients table. One theme per agency, inherited by all locations.';
COMMENT ON COLUMN client_theme_settings.color_primary IS 'Primary brand color for headings, links, and key UI elements. Default: navy #004080';
COMMENT ON COLUMN client_theme_settings.color_accent IS 'Accent color for CTAs, buttons, and hover states. Default: coral #F76C5E';
COMMENT ON COLUMN client_theme_settings.color_secondary IS 'Secondary color for badges, icons, and subtle backgrounds. Default: ocean #A7D8DE';
COMMENT ON COLUMN client_theme_settings.color_background IS 'Main background color for sections. Default: sand #FAF3E0';
COMMENT ON COLUMN client_theme_settings.color_text_body IS 'Body text color for paragraphs. Default: driftwood #5C4B51';
COMMENT ON COLUMN client_theme_settings.divider_color IS 'Solid divider color. Replaces rope image divider.';
COMMENT ON COLUMN client_theme_settings.divider_thickness IS 'Divider height in pixels (1-50). Replaces rope image divider.';
COMMENT ON COLUMN client_theme_settings.divider_style IS 'Divider border style: solid, dashed, or dotted.';
COMMENT ON COLUMN client_theme_settings.section_overrides IS 'Optional per-section overrides: { "hero": {...}, "footer": {...} }';

-- Example section_overrides structure:
-- {
--   "hero": { "heading_bold": true, "heading_size": "xl" },
--   "footer": { "background": "#1a1a1a", "text": "#ffffff" },
--   "cta": { "background": "#F76C5E", "text": "#ffffff" }
-- }
