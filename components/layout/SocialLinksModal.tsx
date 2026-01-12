'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  CloudSun, 
  Facebook, 
  MapPin, 
  Instagram, 
  Linkedin, 
  Pin,
  MessageCircle,
  AtSign,
  Music,
  Star,
  BookOpen,
  Twitter,
  MessageSquare,
  Layout,
  Youtube,
  ExternalLink
} from 'lucide-react';
import type { SocialLinksModalData, SocialLinkDisplay } from '@/lib/types/social-links';

interface SocialLinksModalProps {
  isOpen: boolean;
  onClose: () => void;
  socialLinksData: SocialLinksModalData;
  isMultiLocation?: boolean;
}

const iconMap: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  CloudSun,
  Facebook,
  MapPin,
  Instagram,
  Linkedin,
  Pin,
  MessageCircle,
  AtSign,
  Music,
  Star,
  BookOpen,
  Twitter,
  MessageSquare,
  Layout,
  Youtube,
};

function getIcon(iconName: string): React.ComponentType<{ size?: number; className?: string }> {
  return iconMap[iconName] || ExternalLink;
}

const SocialLinksModal: React.FC<SocialLinksModalProps> = ({
  isOpen,
  onClose,
  socialLinksData,
  isMultiLocation = false,
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const hasLinks = socialLinksData.locations.some(loc => loc.links.length > 0);

  const popupContent = (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center animate-fade-in"
      style={{
        backgroundColor: `color-mix(in srgb, var(--popup-overlay-color) calc(var(--popup-overlay-opacity) * 100%), transparent)`,
      }}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="social-links-title"
    >
      <div 
        className="relative w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto"
        style={{
          backgroundColor: 'var(--popup-bg-color)',
          borderColor: 'var(--popup-border-color)',
          borderWidth: 'var(--popup-border-width)',
          borderStyle: 'var(--popup-border-style)' as React.CSSProperties['borderStyle'],
          borderRadius: 'var(--popup-border-radius)',
        }}
      >
        <div className="sticky top-0 flex items-center justify-between p-6 border-b" style={{ borderColor: 'var(--popup-border-color)', backgroundColor: 'var(--popup-bg-color)' }}>
          <div>
            <h2 id="social-links-title" className="text-2xl font-heading font-bold text-primary">
              Follow Us
            </h2>
            <p className="text-theme-body mt-1">Connect with us on social media</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Close popup"
          >
            <X size={24} className="text-primary" />
          </button>
        </div>

        <div className="p-6">
          {!hasLinks ? (
            <p className="text-theme-body text-center py-8">No social links available.</p>
          ) : (
            <div className="space-y-8">
              {socialLinksData.locations.map((location) => (
                <div key={location.locationId}>
                  {isMultiLocation && socialLinksData.locations.length > 1 && (
                    <h3 className="font-heading font-semibold text-primary text-lg mb-4 flex items-center gap-2">
                      <MapPin size={18} className="text-secondary" />
                      {location.locationName}
                    </h3>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {location.links.map((link) => {
                      const IconComponent = getIcon(link.iconName);
                      return (
                        <a
                          key={`${location.locationId}-${link.key}`}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-3 rounded-lg border border-secondary/30 hover:border-primary hover:shadow-md transition-all duration-200 group"
                        >
                          <div className="flex-shrink-0 p-2 rounded-full bg-secondary/20 group-hover:bg-secondary/30 transition-colors">
                            <IconComponent size={20} className="text-primary" />
                          </div>
                          <span className="font-medium text-primary group-hover:text-accent transition-colors">
                            {link.name}
                          </span>
                          <ExternalLink size={14} className="ml-auto text-secondary opacity-0 group-hover:opacity-100 transition-opacity" />
                        </a>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(popupContent, document.body);
};

export default SocialLinksModal;
