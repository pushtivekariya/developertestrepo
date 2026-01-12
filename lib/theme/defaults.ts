/**
 * Default Theme Values
 * Phase 7: Dynamic Theming System
 * 
 * These are neutral defaults. Client-specific branding is applied via database.
 * Used as fallback when no theme is configured in the database.
 */

import type { ThemeSettings } from '@/lib/types/theme';

/**
 * Neutral default theme
 * Uses standard web colors - client branding applied via database
 */
export const DEFAULT_THEME: ThemeSettings = {
  id: 'default',
  client_id: '',
  
  // Primary colors (neutral dark blue)
  color_primary: '#1e3a5f',
  color_primary_foreground: '#FFFFFF',
  
  // Accent colors (neutral blue for buttons)
  color_accent: '#2563eb',
  color_accent_foreground: '#FFFFFF',
  
  // Secondary colors (neutral gray-blue)
  color_secondary: '#64748b',
  color_secondary_foreground: '#FFFFFF',
  
  // Background colors (white/light gray)
  color_background: '#FFFFFF',
  color_background_alt: '#f8fafc',
  
  // Text colors
  color_text_primary: '#1e293b',      // slate-800 for headings
  color_text_body: '#475569',         // slate-600 for body
  color_text_muted: '#94a3b8',        // slate-400 for captions
  
  // Divider settings
  divider_color: '#e2e8f0',           // slate-200
  divider_thickness: 1,               // 1px solid line
  divider_style: 'solid',
  
  // Typography
  font_heading: 'Playfair Display',
  font_body: 'Inter',
  font_accent: 'Caveat',
  heading_size_multiplier: 1.0,
  body_size_multiplier: 1.0,
  heading_weight: '700',
  body_weight: '400',
  
  // No section overrides by default
  section_overrides: {},
  
  // Popup settings
  popup_settings: {
    bg_color: '#FFFFFF',
    overlay_color: '#000000',
    overlay_opacity: 0.5,
    border: {
      color: '#e2e8f0',
      width: 1,
      radius: 16,
      style: 'solid',
    },
    button: {
      bg_color: null,
      text_color: null,
      border_color: null,
      border_width: 0,
      border_radius: 9999,
    },
  },
  
  // Navbar settings
  navbar_settings: {
    bg_color: null,
    bg_opacity: 0.9,
    height: null,
    text_color: null,
    text_hover_color: null,
    agency_name_color: null,
    phone: null,
    text: 'Call Today',
    show_icon: true,
  },
  
  // CTA settings
  cta_settings: {
    bg_color: null,
    text_color: null,
    hover_bg_color: null,
    border_color: null,
    border_width: 0,
    border_radius: 9999,
  },
  
  // Card styling settings
  card_settings: {
    background: '#FFFFFF',
    border: '#e2e8f0',
    badge_bg: '#64748b',
    badge_text: '#FFFFFF',
    badge_opacity: 0.2,
    text_primary: '#1e293b',
    text_secondary: '#475569',
  },
  
  // Hero divider settings (default to solid divider)
  hero_divider_settings: {
    type: 'solid',
    badges: [
      { id: 'licensed', icon: 'ShieldCheck', text: 'Licensed & Insured', enabled: false },
      { id: 'reviews', icon: 'Star', text: '5-Star Reviews', enabled: false },
      { id: 'bbb', icon: 'Award', text: 'A+ BBB Rating', enabled: false },
      { id: 'trusted', icon: 'Clock', text: 'Trusted Since 2005', enabled: false },
      { id: 'customers', icon: 'Users', text: '10,000+ Customers', enabled: false },
      { id: 'guarantee', icon: 'ThumbsUp', text: 'Satisfaction Guaranteed', enabled: false },
      { id: 'local', icon: 'CheckCircle', text: 'Locally Owned', enabled: false },
      { id: 'family', icon: 'Heart', text: 'Family Owned', enabled: false },
    ],
    badge_bg_color: null,
    badge_text_color: null,
    badge_icon_color: null,
    divider_bg_color: null,
    badge_size: 'md',
    badge_spacing: 'normal',
    divider_padding: 'md',
  },
  
  // Location/Policies section settings (all null = use theme defaults)
  location_policies_section_settings: {
    section_bg_color: null,
    badge_bg_color: null,
    badge_text_color: null,
    heading_color: null,
    subheading_color: null,
    card_bg_color: null,
    card_border_color: null,
    card_heading_color: null,
    card_body_color: null,
    accent_line_color: null,
    button_bg_color: null,
    button_text_color: null,
    link_color: null,
  },
  
  // Logo and favicon settings (defaults to null)
  fav_icon_url: null,
  website_logo_url: null,
  show_client_site_name: true,
  
  // Timestamps
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

/**
 * Color name mapping for reference
 * Maps semantic names to their hex values
 */
export const COLOR_MAP = {
  navy: '#004080',
  coral: '#F76C5E',
  ocean: '#A7D8DE',
  sand: '#FAF3E0',
  driftwood: '#5C4B51',
} as const;

/**
 * Tailwind class to CSS variable mapping
 * Used for component migration
 */
export const CLASS_TO_VAR_MAP = {
  // Text colors
  'text-navy': 'text-primary',
  'text-coral': 'text-accent',
  'text-ocean': 'text-secondary',
  'text-driftwood': 'text-body',
  
  // Background colors
  'bg-navy': 'bg-primary',
  'bg-coral': 'bg-accent',
  'bg-ocean': 'bg-secondary',
  'bg-sand': 'bg-background',
  
  // Hover states
  'hover:text-coral': 'hover:text-accent',
  'hover:bg-coral': 'hover:bg-accent',
  'hover:bg-ocean': 'hover:bg-secondary',
} as const;
