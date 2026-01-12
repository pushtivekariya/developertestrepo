'use client';

import Link from 'next/link';
import { Phone, MapPin } from 'lucide-react';
import { useState, useEffect } from 'react';
import { formatPhoneNumber, normalizePhoneNumber } from '@/lib/utils';
import { Divider } from '@/components/ui/Divider';
import SocialLinksModal from '@/components/layout/SocialLinksModal';
import type { SocialLinksModalData } from '@/lib/types/social-links';


interface Location {
  id: string;
  location_name: string;
  address_line_1?: string;
  address_line_2?: string;
  city: string;
  state: string;
  zip: string;
  phone?: string;
  location_slug: string;
}

interface FooterProps {
  agencyName?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  phone?: string;
  address?: string;
  locationPrefix?: string;
  locationName?: string;
  socialLinks?: {
    facebook?: string;
    instagram?: string;
    linkedin?: string;
    youtube?: string;
  };
  badges?: Array<{ name: string; icon_class: string }>;
  tagline?: string;
  isMultiLocation?: boolean;
  footerLogoUrl?: string | null;
  allLocations?: Location[];
  socialLinksModalData?: SocialLinksModalData;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function Footer ({ agencyName, city, state, postalCode, phone, address, socialLinks, badges, tagline, locationPrefix, locationName, isMultiLocation, footerLogoUrl, allLocations, socialLinksModalData }: FooterProps) {
  // Use state to handle values that would cause hydration mismatch
  const [currentYear, setCurrentYear] = useState('');
  const [isSocialLinksModalOpen, setIsSocialLinksModalOpen] = useState(false);
  
  // Only update on client-side to prevent hydration errors
  useEffect(() => {
    setCurrentYear(new Date().getFullYear().toString());
  }, []);
  
  const formattedPhone = formatPhoneNumber(phone);
  const normalizedPhone = normalizePhoneNumber(phone);
  const phoneHref = normalizedPhone ? `tel:${normalizedPhone}` : undefined;

  const showLocationDepedentPage = isMultiLocation ? locationPrefix : true;
  const showCorePage = isMultiLocation ? locationPrefix : true;

  return (
    <footer className="relative" style={{ backgroundColor: 'var(--footer-bg)', color: 'var(--footer-text-secondary)' }}>
      <Divider position="top" />
      
      <div className="container mx-auto px-4 py-16 pt-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 items-start">
          {/* Column 1 - Logo and About */}
          <div className="md:col-span-1">
            {footerLogoUrl && (
              <img 
                src={footerLogoUrl} 
                alt={`${agencyName || 'Company'} logo`}
                className="h-24 w-auto block"
              />
            )}
            {tagline && (
              <p className="mb-6 mt-4" style={{ color: 'var(--footer-text)', opacity: 0.8 }}>{tagline}</p>
            )}
            {badges && badges.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {badges.map((badge, idx) => (
                  <div 
                    key={idx} 
                    className="rounded px-2 py-1 text-xs"
                    style={{
                      backgroundColor: 'color-mix(in srgb, var(--footer-badge-bg) 20%, transparent)',
                      color: 'var(--footer-badge-text)',
                    }}
                  >
                    {badge.name}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Column 2 - Quick Links */}
          <div>
            <h3 className="font-heading font-bold text-lg mb-4" style={{ color: 'var(--footer-text)' }}>Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link href={locationPrefix || '/'} className="text-primary/80 hover:text-accent transition-colors link-underline">Home</Link>
              </li>
              {showCorePage && (
                <li>
                  <Link href={locationPrefix ? `${locationPrefix}/about` : '/about'} className="text-primary/80 hover:text-accent transition-colors link-underline">About Us</Link>
                </li>
              )}
              {showLocationDepedentPage && (
                <li>
                  <Link href={locationPrefix ? `${locationPrefix}/policies` : '/policies'} className="text-primary/80 hover:text-accent transition-colors link-underline">Policies</Link>
                </li>
              )}
              {showCorePage && (
                <li>
                  <Link href={locationPrefix ? `${locationPrefix}/faq` : '/faq'} className="text-primary/80 hover:text-accent transition-colors link-underline">FAQs</Link>
                </li>
              )}
              {showLocationDepedentPage && (
                <li>
                  <Link href={locationPrefix ? `${locationPrefix}/blog` : '/blog'} className="text-primary/80 hover:text-accent transition-colors link-underline">Blog</Link>
                </li>
              )}
              {false && <li>
                <Link href='/glossary' className="text-primary/80 hover:text-accent transition-colors link-underline">Insurance Glossary</Link>
              </li>}
              {showCorePage && <li>
                <Link href={locationPrefix ? `${locationPrefix}/contact` : '/contact'} className="text-primary/80 hover:text-accent transition-colors link-underline">Contact</Link>
              </li>}
              {socialLinksModalData && socialLinksModalData.locations.length > 0 && (
                <li>
                  <button
                    onClick={() => setIsSocialLinksModalOpen(true)}
                    className="text-primary/80 hover:text-accent transition-colors link-underline cursor-pointer"
                  >
                    Social Links
                  </button>
                </li>
              )}
            </ul>
          </div>
          
          {/* Column 3 - Policies */}
          {showLocationDepedentPage && (
          <div>
            <h3 className="font-heading font-bold text-lg mb-4" style={{ color: 'var(--footer-text)' }}>Our Policies</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href={locationPrefix ? `${locationPrefix}/policies` : '/policies'}
                  className="text-primary/80 hover:text-accent transition-colors link-underline"
                >
                  View All Policies
                </Link>
              </li>
            </ul>
          </div>
          )}
          
          {/* Column 4 - Contact */}
          <div>
            <h3 className="font-heading font-bold text-lg mb-4" style={{ color: 'var(--footer-text)' }}>Contact Us</h3>
            {isMultiLocation && allLocations && allLocations.length > 0 ? (
              <div className="space-y-6">
                {allLocations.map((location) => {
                  const locAddress = location.address_line_1 || '';
                  const locPhone = formatPhoneNumber(location.phone);
                  const locPhoneHref = location.phone ? `tel:${normalizePhoneNumber(location.phone)}` : undefined;
                  
                  return (
                    <div key={location.id} className="space-y-2">
                      <h4 className="font-semibold" style={{ color: 'var(--footer-text)' }}>{location.location_name}</h4>
                      <ul className="space-y-2">
                        <li className="flex items-start">
                          <MapPin size={16} className="text-secondary mt-1 mr-2 flex-shrink-0" />
                          <span className="text-primary/80 text-sm">
                            {locAddress}<br />
                            <span className="capitalize">{location.city}</span>, {location.state} {location.zip}
                          </span>
                        </li>
                        {location.phone && (
                          <li className="flex items-center">
                            <Phone size={16} className="text-secondary mr-2 flex-shrink-0" />
                            <a href={locPhoneHref} className="text-primary/80 hover:text-accent transition-colors text-sm">
                              {locPhone}
                            </a>
                          </li>
                        )}
                      </ul>
                    </div>
                  );
                })}
              </div>
            ) : (
              <ul className="space-y-4">
                <li className="flex items-start">
                  <MapPin size={18} className="text-secondary mt-1 mr-3 flex-shrink-0" />
                  <span className="text-primary/80">
                    {address || ''}<br />
                    <span className="capitalize">{city || ''}</span>, {state || ''} {postalCode || ''}
                  </span>
                </li>
                {!!phone && (
                  <li className="flex items-center">
                    <Phone size={18} className="text-secondary mr-3 flex-shrink-0" />
                    <a href={phoneHref} className="text-primary/80 hover:text-accent transition-colors">
                      {formattedPhone}
                    </a>
                  </li>
                )}
              </ul>
            )}
            
          </div>
        </div>
        
        
        <div className="mt-8 border-t border-primary/10 pt-8 text-sm text-primary/70">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <p>&copy; {currentYear || '2025'} <span className="capitalize">{agencyName || ""}</span>. All rights reserved.</p>
          </div>
        </div>
      </div>
    {socialLinksModalData && (
        <SocialLinksModal
          isOpen={isSocialLinksModalOpen}
          onClose={() => setIsSocialLinksModalOpen(false)}
          socialLinksData={socialLinksModalData}
          isMultiLocation={isMultiLocation}
        />
      )}
    </footer>
  );
};
