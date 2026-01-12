-- Migration: Add popup_settings JSONB column to client_theme_settings
-- Purpose: Store popup/modal styling settings as JSONB for flexibility
-- Each section (popup, header, footer, etc.) can have its own border/button settings

ALTER TABLE public.client_theme_settings
ADD COLUMN popup_settings jsonb null default '{
  "bg_color": "#FFFFFF",
  "overlay_color": "#000000",
  "overlay_opacity": 0.50,
  "border": {
    "color": "#A7D8DE",
    "width": 1,
    "radius": 16,
    "style": "solid"
  },
  "button": {
    "bg_color": null,
    "text_color": null,
    "border_color": null,
    "border_width": 0,
    "border_radius": 9999
  }
}'::jsonb;
