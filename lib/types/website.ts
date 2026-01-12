/**
 * Website configuration types for client_websites table
 * Phase 1: Enhanced schema with location data, contact info, and SEO
 * Phase 2: Feature flags, FAQs, badges, and analytics
 */

// === Phase 2: Feature Flags ===
export interface WebsiteFeatures {
  show_blog: boolean;
  show_glossary: boolean;
  show_faq_page: boolean;
  show_careers_page: boolean;
  show_social_links: boolean;
  show_business_hours: boolean;
  show_agent_network: boolean;
  show_about_description: boolean;
  show_regional_text: boolean;
  multi_location: boolean;
}

// === Phase 2: Badges ===
export interface Badge {
  name: string;
  icon_class: string;
}

// === Phase 2: FAQs ===
export interface FAQItem {
  question: string;
  answer: string;
}

export interface FAQCategory {
  id: string;
  name: string;
  icon: string;
  items: FAQItem[];
}

export interface FAQData {
  categories: FAQCategory[];
}

// === Phase 1: Business Hours ===
export interface BusinessHours {
  monday?: { open: string; close: string } | { closed: true };
  tuesday?: { open: string; close: string } | { closed: true };
  wednesday?: { open: string; close: string } | { closed: true };
  thursday?: { open: string; close: string } | { closed: true };
  friday?: { open: string; close: string } | { closed: true };
  saturday?: { open: string; close: string } | { closed: true };
  sunday?: { open: string; close: string } | { closed: true };
}

export interface SocialLinks {
  facebook?: string;
  instagram?: string;
  linkedin?: string;
  youtube?: string;
  twitter?: string;
}

export interface LocationData {
  id: string;
  client_id: string;
  location_name: string;
  address_line_1?: string;
  address_line_2?: string;
  city: string;
  state: string;
  zip: string;
  phone?: string;
  email?: string;
  location_slug?: string;
  sms_phone?: string;
  sms_default_message?: string;
  business_hours?: BusinessHours;
  is_active?: boolean;
}

/**
 * Combined website and locations data
 * website: single object (same for all locations)
 * locations: array of all client locations
 */
export interface ClientData {
  website: WebsiteData | null;
  locations: LocationData[];
}

export interface WebsiteData {
  id: string;
  client_id: string;
  location_id?: string;
  website_name: string;
  canonical_url?: string;
  slug?: string;
  
  // Geo coordinates
  latitude?: number;
  longitude?: number;
  
  // Contact information
  phone?: string;
  secondary_phone?: string;
  sms_phone?: string;
  sms_default_message?: string;
  email?: string;
  
  // Location data
  service_radius_meters: number;
  business_hours: BusinessHours;
  social_links: SocialLinks;
  service_areas: string[];
  
  // SEO metadata
  meta_title?: string;
  meta_description?: string;
  
  // Analytics (existing columns)
  google_tag_id?: string;
  google_analytics_id?: string;
  facebook_pixel_id?: string;
  
  // Phase 2: Additional analytics
  google_ads_id?: string;
  callrail_company_id?: string;
  callrail_swap_script?: string;
  
  // Phase 2: Feature flags, FAQs, badges, tagline
  features?: WebsiteFeatures;
  faqs?: FAQData;
  badges?: Badge[];
  tagline?: string;
  
  // Phase 4.5: Social sharing images
  og_image_url?: string;
  twitter_image_url?: string;
  
  // Status flags (existing columns)
  is_active?: boolean;
  status?: string;
  
  // Joined location data (when fetched with relation)
  client_locations?: LocationData;
}
