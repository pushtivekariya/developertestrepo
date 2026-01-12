import type { SocialPlatformDefinition } from '@/lib/types/social-links';

/**
 * All social platforms supported by the system
 * Keys match the JSONB keys in client_social_links.platforms
 * iconName corresponds to Lucide icon names
 */
export const SOCIAL_PLATFORMS: SocialPlatformDefinition[] = [
  { key: 'bluesky', name: 'Bluesky', iconName: 'CloudSun' },
  { key: 'facebook_bio', name: 'Facebook', iconName: 'Facebook' },
  { key: 'facebook_short_desc', name: 'Facebook Page', iconName: 'Facebook' },
  { key: 'gmb', name: 'Google Business Profile', iconName: 'MapPin' },
  { key: 'instagram', name: 'Instagram', iconName: 'Instagram' },
  { key: 'linkedin', name: 'LinkedIn', iconName: 'Linkedin' },
  { key: 'pinterest', name: 'Pinterest', iconName: 'Pin' },
  { key: 'reddit', name: 'Reddit', iconName: 'MessageCircle' },
  { key: 'threads', name: 'Threads', iconName: 'AtSign' },
  { key: 'tiktok', name: 'TikTok', iconName: 'Music' },
  { key: 'trustpilot', name: 'Trustpilot', iconName: 'Star' },
  { key: 'tumblr', name: 'Tumblr', iconName: 'BookOpen' },
  { key: 'twitter', name: 'X (Twitter)', iconName: 'Twitter' },
  { key: 'yelp_short_desc', name: 'Yelp', iconName: 'MessageSquare' },
  { key: 'vista_page', name: 'Vista Page', iconName: 'Layout' },
  { key: 'youtube', name: 'YouTube', iconName: 'Youtube' },
];

/**
 * Get platform definition by key
 */
export function getPlatformByKey(key: string): SocialPlatformDefinition | undefined {
  return SOCIAL_PLATFORMS.find(p => p.key === key);
}

/**
 * Get all platform keys
 */
export function getAllPlatformKeys(): string[] {
  return SOCIAL_PLATFORMS.map(p => p.key);
}
