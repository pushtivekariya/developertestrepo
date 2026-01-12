/**
 * Theme Fetching Utility
 * Phase 7: Dynamic Theming System
 * 
 * Fetches theme settings by client_id (agency).
 * Theme is shared across all locations - no location filtering needed.
 */

import { cache } from 'react';
import { supabase } from '@/lib/supabase';
import type { ThemeSettings } from '@/lib/types/theme';
import { DEFAULT_THEME } from './defaults';

/**
 * Fetch theme settings for the current client (agency)
 * 
 * Theme is tied to client_id and shared across all locations.
 * Falls back to DEFAULT_THEME if:
 * - No client_id in environment
 * - No theme configured in database
 * - Database error
 * 
 * @returns ThemeSettings - either from database or defaults
 */
export const getThemeSettings = cache(async (): Promise<ThemeSettings> => {
  const clientId = process.env.NEXT_PUBLIC_CLIENT_ID;
  
  if (!clientId) {
    console.warn('[Theme] No NEXT_PUBLIC_CLIENT_ID set, using default theme');
    return DEFAULT_THEME;
  }

  try {
    const { data, error } = await supabase
      .from('client_theme_settings')
      .select('*')
      .eq('client_id', clientId)
      .single();

    if (error) {
      // PGRST116 = no rows returned (theme not configured)
      if (error.code === 'PGRST116') {
        console.info('[Theme] No theme configured for client, using defaults');
      } else {
        console.error('[Theme] Error fetching theme:', error.message);
      }
      return DEFAULT_THEME;
    }

    if (!data) {
      console.info('[Theme] No theme data returned, using defaults');
      return DEFAULT_THEME;
    }

    return data as ThemeSettings;
  } catch (err) {
    console.error('[Theme] Unexpected error fetching theme:', err);
    return DEFAULT_THEME;
  }
});

/**
 * Convert theme settings to CSS custom properties object
 * Used by ThemeProvider to inject styles
 */
export function themeToCssVars(theme: ThemeSettings): Record<string, string> {
  return {
    // Colors
    '--color-primary': theme.color_primary,
    '--color-primary-foreground': theme.color_primary_foreground,
    '--color-accent': theme.color_accent,
    '--color-accent-foreground': theme.color_accent_foreground,
    '--color-secondary': theme.color_secondary,
    '--color-secondary-foreground': theme.color_secondary_foreground,
    '--color-background': theme.color_background,
    '--color-background-alt': theme.color_background_alt,
    '--color-text-primary': theme.color_text_primary,
    '--color-text-body': theme.color_text_body,
    '--color-text-muted': theme.color_text_muted,
    
    // Divider
    '--divider-color': theme.divider_color,
    '--divider-thickness': `${theme.divider_thickness}px`,
    '--divider-style': theme.divider_style,
    
    // Typography
    '--font-heading': `'${theme.font_heading}', serif`,
    '--font-body': `'${theme.font_body}', sans-serif`,
    '--font-accent': `'${theme.font_accent}', cursive`,
    '--heading-weight': theme.heading_weight,
    '--body-weight': theme.body_weight,
    '--heading-size-multiplier': String(theme.heading_size_multiplier),
    '--body-size-multiplier': String(theme.body_size_multiplier),
    
    // Popup (falls back to DEFAULT_THEME.popup_settings via getThemeSettings)
    '--popup-bg-color': theme.popup_settings?.bg_color ?? DEFAULT_THEME.popup_settings!.bg_color,
    '--popup-overlay-color': theme.popup_settings?.overlay_color ?? DEFAULT_THEME.popup_settings!.overlay_color,
    '--popup-overlay-opacity': String(theme.popup_settings?.overlay_opacity ?? DEFAULT_THEME.popup_settings!.overlay_opacity),
    '--popup-border-color': theme.popup_settings?.border?.color ?? DEFAULT_THEME.popup_settings!.border.color,
    '--popup-border-width': `${theme.popup_settings?.border?.width ?? DEFAULT_THEME.popup_settings!.border.width}px`,
    '--popup-border-radius': `${theme.popup_settings?.border?.radius ?? DEFAULT_THEME.popup_settings!.border.radius}px`,
    '--popup-border-style': theme.popup_settings?.border?.style ?? DEFAULT_THEME.popup_settings!.border.style,
    '--popup-button-bg-color': theme.popup_settings?.button?.bg_color ?? theme.color_primary,
    '--popup-button-text-color': theme.popup_settings?.button?.text_color ?? theme.color_primary_foreground,
    '--popup-button-border-color': theme.popup_settings?.button?.border_color ?? theme.color_secondary,
    '--popup-button-border-width': `${theme.popup_settings?.button?.border_width ?? DEFAULT_THEME.popup_settings!.button.border_width}px`,
    '--popup-button-border-radius': `${theme.popup_settings?.button?.border_radius ?? DEFAULT_THEME.popup_settings!.button.border_radius}px`,
    
    // Navbar settings (from navbar_settings column)
    '--navbar-height': theme.navbar_settings?.height ? `${theme.navbar_settings.height}px` : 'auto',
    '--navbar-bg-color': theme.navbar_settings?.bg_color ?? '#FFFFFF',
    '--navbar-bg-opacity': String(theme.navbar_settings?.bg_opacity ?? DEFAULT_THEME.navbar_settings!.bg_opacity),
    '--navbar-text-color': theme.navbar_settings?.text_color ?? theme.color_primary,
    '--navbar-text-hover-color': theme.navbar_settings?.text_hover_color ?? theme.color_accent,
    '--navbar-agency-name-color': theme.navbar_settings?.agency_name_color ?? theme.color_primary,
    
    // CTA settings (from cta_settings column)
    '--cta-bg-color': theme.cta_settings?.bg_color ?? `${theme.color_secondary}4D`, // 30% opacity
    '--cta-text-color': theme.cta_settings?.text_color ?? theme.color_primary,
    '--cta-hover-bg-color': theme.cta_settings?.hover_bg_color ?? `${theme.color_secondary}80`, // 50% opacity
    '--cta-border-color': theme.cta_settings?.border_color ?? 'transparent',
    '--cta-border-width': `${theme.cta_settings?.border_width ?? DEFAULT_THEME.cta_settings!.border_width}px`,
    '--cta-border-radius': `${theme.cta_settings?.border_radius ?? DEFAULT_THEME.cta_settings!.border_radius}px`,
    
    // Card settings
    '--color-card-bg': theme.card_settings?.background ?? DEFAULT_THEME.card_settings!.background,
    '--color-card-border': theme.card_settings?.border ?? DEFAULT_THEME.card_settings!.border,
    '--color-card-badge-bg': theme.card_settings?.badge_bg ?? DEFAULT_THEME.card_settings!.badge_bg,
    '--color-card-badge-text': theme.card_settings?.badge_text ?? DEFAULT_THEME.card_settings!.badge_text,
    '--color-card-badge-opacity': String(theme.card_settings?.badge_opacity ?? DEFAULT_THEME.card_settings!.badge_opacity),
    '--color-card-text-primary': theme.card_settings?.text_primary ?? DEFAULT_THEME.card_settings!.text_primary,
    '--color-card-text-secondary': theme.card_settings?.text_secondary ?? DEFAULT_THEME.card_settings!.text_secondary,
    
    // Footer section overrides (falls back to global colors if not set)
    '--footer-bg': theme.section_overrides?.footer?.background ?? theme.color_background,
    '--footer-text': theme.section_overrides?.footer?.text ?? theme.color_text_primary,
    '--footer-text-secondary': theme.section_overrides?.footer?.text_secondary ?? theme.color_text_body,
    '--footer-badge-bg': theme.section_overrides?.footer?.badge_bg ?? theme.color_secondary,
    '--footer-badge-text': theme.section_overrides?.footer?.badge_text ?? theme.color_primary,
    
    // Hero section overrides (falls back to global colors if not set)
    '--hero-bg': theme.section_overrides?.hero?.background ?? theme.color_background_alt,
    '--hero-text': theme.section_overrides?.hero?.text ?? theme.color_text_primary,
    '--hero-text-secondary': theme.section_overrides?.hero?.text_secondary ?? theme.color_text_muted,
    
    // Trust badge divider settings
    '--trust-badge-bg': theme.hero_divider_settings?.badge_bg_color ?? theme.color_secondary,
    '--trust-badge-text': theme.hero_divider_settings?.badge_text_color ?? theme.color_text_primary,
    '--trust-badge-icon': theme.hero_divider_settings?.badge_icon_color ?? theme.color_accent,
    '--trust-divider-bg': theme.hero_divider_settings?.divider_bg_color ?? theme.color_background_alt,
    
    // Location/Policies section settings
    '--loc-section-bg': theme.location_policies_section_settings?.section_bg_color ?? theme.color_background_alt,
    '--loc-badge-bg': theme.location_policies_section_settings?.badge_bg_color ?? theme.color_secondary,
    '--loc-badge-text': theme.location_policies_section_settings?.badge_text_color ?? theme.color_secondary_foreground,
    '--loc-heading': theme.location_policies_section_settings?.heading_color ?? theme.color_primary,
    '--loc-subheading': theme.location_policies_section_settings?.subheading_color ?? theme.color_text_body,
    '--loc-card-bg': theme.location_policies_section_settings?.card_bg_color ?? theme.color_background,
    '--loc-card-border': theme.location_policies_section_settings?.card_border_color ?? '#e2e8f0',
    '--loc-card-heading': theme.location_policies_section_settings?.card_heading_color ?? theme.color_primary,
    '--loc-card-body': theme.location_policies_section_settings?.card_body_color ?? theme.color_text_body,
    '--loc-accent-line': theme.location_policies_section_settings?.accent_line_color ?? theme.color_accent,
    '--loc-button-bg': theme.location_policies_section_settings?.button_bg_color ?? theme.color_accent,
    '--loc-button-text': theme.location_policies_section_settings?.button_text_color ?? theme.color_accent_foreground,
    '--loc-link': theme.location_policies_section_settings?.link_color ?? theme.color_primary,
  };
}

// Re-export types and defaults for convenience
export { DEFAULT_THEME } from './defaults';
export type { ThemeSettings } from '@/lib/types/theme';
