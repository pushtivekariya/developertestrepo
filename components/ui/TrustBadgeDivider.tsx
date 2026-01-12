/**
 * Trust Badge Divider Component
 * Displays a row of trust/certification badges below the hero section
 * 
 * Uses dynamic Lucide icons based on badge configuration
 */

import { cn } from '@/lib/utils';
import type { HeroDividerSettings, TrustBadge } from '@/lib/types/theme';
import {
  ShieldCheck,
  Star,
  Award,
  Clock,
  Users,
  ThumbsUp,
  CheckCircle,
  Heart,
  LucideIcon,
} from 'lucide-react';

interface TrustBadgeDividerProps {
  settings: HeroDividerSettings;
  className?: string;
}

const ICON_MAP: Record<string, LucideIcon> = {
  ShieldCheck,
  Star,
  Award,
  Clock,
  Users,
  ThumbsUp,
  CheckCircle,
  Heart,
};

const SIZE_CLASSES = {
  sm: {
    icon: 'w-4 h-4',
    text: 'text-xs',
    badge: 'px-2 py-1 gap-1',
  },
  md: {
    icon: 'w-5 h-5',
    text: 'text-sm',
    badge: 'px-3 py-1.5 gap-1.5',
  },
  lg: {
    icon: 'w-6 h-6',
    text: 'text-base',
    badge: 'px-4 py-2 gap-2',
  },
};

const SPACING_CLASSES = {
  compact: 'gap-2',
  normal: 'gap-4',
  spacious: 'gap-6',
};

const PADDING_CLASSES = {
  sm: 'py-2',
  md: 'py-4',
  lg: 'py-6',
};

function BadgeItem({ 
  badge, 
  settings 
}: { 
  badge: TrustBadge; 
  settings: HeroDividerSettings;
}) {
  const IconComponent = ICON_MAP[badge.icon] || ShieldCheck;
  const sizeClasses = SIZE_CLASSES[settings.badge_size];

  return (
    <div
      className={cn(
        'flex items-center rounded-full',
        sizeClasses.badge
      )}
      style={{
        backgroundColor: settings.badge_bg_color 
          ? settings.badge_bg_color 
          : 'var(--trust-badge-bg, var(--color-secondary, #64748b))',
      }}
    >
      <IconComponent
        className={sizeClasses.icon}
        style={{
          color: settings.badge_icon_color 
            ? settings.badge_icon_color 
            : 'var(--trust-badge-icon, var(--color-accent, #2563eb))',
        }}
      />
      <span
        className={cn('font-medium whitespace-nowrap', sizeClasses.text)}
        style={{
          color: settings.badge_text_color 
            ? settings.badge_text_color 
            : 'var(--trust-badge-text, var(--color-text-primary, #1e293b))',
        }}
      >
        {badge.text}
      </span>
    </div>
  );
}

export function TrustBadgeDivider({ settings, className = '' }: TrustBadgeDividerProps) {
  const enabledBadges = settings.badges.filter(badge => badge.enabled);

  if (enabledBadges.length === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        'absolute left-0 right-0 top-0 z-10 w-full',
        PADDING_CLASSES[settings.divider_padding],
        className
      )}
      style={{
        backgroundColor: settings.divider_bg_color 
          ? settings.divider_bg_color 
          : 'var(--trust-divider-bg, var(--color-background-alt, #f8fafc))',
      }}
    >
      <div className="container mx-auto px-4">
        <div
          className={cn(
            'flex flex-wrap items-center justify-center',
            SPACING_CLASSES[settings.badge_spacing]
          )}
        >
          {enabledBadges.map((badge) => (
            <BadgeItem key={badge.id} badge={badge} settings={settings} />
          ))}
        </div>
      </div>
    </div>
  );
}
