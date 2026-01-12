/**
 * Theme Settings Types
 * Phase 7: Dynamic Theming System
 * 
 * Theme is tied to client_id (agency) and shared across all locations.
 */

export interface ThemeSettings {
  id: string;
  client_id: string;
  
  // Primary colors (main brand color)
  color_primary: string;
  color_primary_foreground: string;
  
  // Accent colors (CTAs, hover states, highlights)
  color_accent: string;
  color_accent_foreground: string;
  
  // Secondary colors (badges, icons, subtle backgrounds)
  color_secondary: string;
  color_secondary_foreground: string;
  
  // Background colors
  color_background: string;
  color_background_alt: string;
  
  // Text colors
  color_text_primary: string;
  color_text_body: string;
  color_text_muted: string;
  
  // Divider settings
  divider_color: string;
  divider_thickness: number;
  divider_style: 'solid' | 'dashed' | 'dotted';
  
  // Typography settings
  font_heading: string;
  font_body: string;
  font_accent: string;
  heading_size_multiplier: number;
  body_size_multiplier: number;
  heading_weight: '400' | '500' | '600' | '700' | '800';
  body_weight: '300' | '400' | '500' | '600';
  
  // Section-specific overrides
  section_overrides: SectionOverrides;
  
  // Popup settings (JSONB)
  popup_settings?: PopupSettings;
  
  // Navbar settings (JSONB) - header/navigation bar styling
  navbar_settings?: NavbarSettings;
  
  // CTA settings (JSONB) - call-to-action button styling
  cta_settings?: CtaSettings;
  
  // Card styling settings (JSONB)
  card_settings?: CardSettings;
  
  // Hero divider settings (JSONB) - solid divider or trust badge divider
  hero_divider_settings?: HeroDividerSettings;
  
  // Location/Policies section settings (JSONB) - colors for the locations/policies section
  location_policies_section_settings?: LocationPoliciesSectionSettings;
  
  // Logo and favicon settings
  fav_icon_url?: string | null;
  website_logo_url?: string | null;
  show_client_site_name?: boolean;
  
  // Timestamps
  created_at: string;
  updated_at: string;
}

/**
 * Optional per-section theme overrides
 */
export interface SectionOverrides {
  hero?: SectionOverride;
  footer?: SectionOverride;
  cta?: SectionOverride;
  header?: SectionOverride;
  [key: string]: SectionOverride | undefined;
}

export interface SectionOverride {
  background?: string;
  text?: string;
  text_secondary?: string;
  badge_bg?: string;
  badge_text?: string;
  heading_bold?: boolean;
  heading_size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

/**
 * Popup section settings (JSONB in database)
 */
export interface PopupBorderSettings {
  color: string;
  width: number;
  radius: number;
  style: 'solid' | 'dashed' | 'dotted';
}

export interface PopupButtonSettings {
  bg_color: string | null;
  text_color: string | null;
  border_color: string | null;
  border_width: number;
  border_radius: number;
}

export interface PopupSettings {
  bg_color: string;
  overlay_color: string;
  overlay_opacity: number;
  border: PopupBorderSettings;
  button: PopupButtonSettings;
}

/**
 * Navbar settings (JSONB in database)
 * Controls header/navigation bar appearance
 */
export interface NavbarSettings {
  bg_color: string | null;
  bg_opacity: number;
  height: number | null;
  text_color: string | null;
  text_hover_color: string | null;
  agency_name_color: string | null;
  phone: string | null;
  text: string;
  show_icon: boolean;
}

/**
 * CTA button settings (JSONB in database)
 * Controls call-to-action button appearance and content
 */
export interface CtaSettings {
  bg_color: string | null;
  text_color: string | null;
  hover_bg_color: string | null;
  border_color: string | null;
  border_width: number;
  border_radius: number;
}

/**
 * Card styling settings (JSONB in database)
 */
export interface CardSettings {
  background: string;      // Card background color (default: #FFFFFF)
  border: string;          // Card border color (default: #e2e8f0)
  badge_bg: string;        // Badge background color (default: #64748b)
  badge_text: string;      // Badge text color (default: #FFFFFF)
  badge_opacity: number;   // Badge background opacity 0-1 (default: 0.2)
  text_primary: string;    // Card heading text (default: #1e293b)
  text_secondary: string;  // Card body text (default: #475569)
}

/**
 * Trust Badge for Hero Divider
 */
export interface TrustBadge {
  id: string;              // Unique identifier (e.g., 'licensed', 'reviews')
  icon: string;            // Lucide icon name (e.g., 'ShieldCheck', 'Star')
  text: string;            // Badge text (e.g., "Licensed & Insured")
  enabled: boolean;        // Whether to show this badge
}

/**
 * Hero Divider Settings (JSONB in database)
 * Controls the divider between hero and intro sections
 */
export interface HeroDividerSettings {
  type: 'solid' | 'trust_badges';
  badges: TrustBadge[];
  badge_bg_color: string | null;      // Badge background color
  badge_text_color: string | null;    // Badge text color
  badge_icon_color: string | null;    // Badge icon color
  divider_bg_color: string | null;    // Divider strip background
  badge_size: 'sm' | 'md' | 'lg';     // Controls icon and text size
  badge_spacing: 'compact' | 'normal' | 'spacious';
  divider_padding: 'sm' | 'md' | 'lg'; // Vertical padding of the divider strip
}

/**
 * Location/Policies Section Settings (JSONB in database)
 * Controls colors for the section showing locations (multi) or policies (single)
 */
export interface LocationPoliciesSectionSettings {
  // Section background
  section_bg_color: string | null;
  
  // Badge (e.g., "Our Locations" / "Our Services")
  badge_bg_color: string | null;
  badge_text_color: string | null;
  
  // Section headings
  heading_color: string | null;
  subheading_color: string | null;
  
  // Cards
  card_bg_color: string | null;
  card_border_color: string | null;
  card_heading_color: string | null;
  card_body_color: string | null;
  
  // Accent line (decorative underlines)
  accent_line_color: string | null;
  
  // CTA Button ("View All Locations" / "View All Policies")
  button_bg_color: string | null;
  button_text_color: string | null;
  
  // Link text ("Visit Location", "Learn More")
  link_color: string | null;
}

/**
 * CSS variable names for theme injection
 */
export const THEME_CSS_VARS = {
  // Colors
  colorPrimary: '--color-primary',
  colorPrimaryForeground: '--color-primary-foreground',
  colorAccent: '--color-accent',
  colorAccentForeground: '--color-accent-foreground',
  colorSecondary: '--color-secondary',
  colorSecondaryForeground: '--color-secondary-foreground',
  colorBackground: '--color-background',
  colorBackgroundAlt: '--color-background-alt',
  colorTextPrimary: '--color-text-primary',
  colorTextBody: '--color-text-body',
  colorTextMuted: '--color-text-muted',
  
  // Divider
  dividerColor: '--divider-color',
  dividerThickness: '--divider-thickness',
  dividerStyle: '--divider-style',
  
  // Typography
  fontHeading: '--font-heading',
  fontBody: '--font-body',
  fontAccent: '--font-accent',
  headingWeight: '--heading-weight',
  bodyWeight: '--body-weight',
  headingSizeMultiplier: '--heading-size-multiplier',
  bodySizeMultiplier: '--body-size-multiplier',
  
  // Popup
  popupBgColor: '--popup-bg-color',
  popupOverlayColor: '--popup-overlay-color',
  popupOverlayOpacity: '--popup-overlay-opacity',
  popupBorderColor: '--popup-border-color',
  popupBorderWidth: '--popup-border-width',
  popupBorderRadius: '--popup-border-radius',
  popupBorderStyle: '--popup-border-style',
  popupButtonBgColor: '--popup-button-bg-color',
  popupButtonTextColor: '--popup-button-text-color',
  popupButtonBorderColor: '--popup-button-border-color',
  popupButtonBorderWidth: '--popup-button-border-width',
  popupButtonBorderRadius: '--popup-button-border-radius',
} as const;
