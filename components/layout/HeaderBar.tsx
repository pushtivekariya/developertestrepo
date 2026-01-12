'use client';

import React, { useState, useEffect, useCallback, useRef, useLayoutEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Phone, Search, MapPin, ArrowUpRight, X } from 'lucide-react';
import { gsap } from 'gsap';
import SearchBar from 'components/search/SearchBar';
import { normalizePhoneNumber } from '@/lib/utils';
import type { NavbarSettings, CtaSettings } from '@/lib/types/theme';

interface NavCardLink {
  label: string;
  href: string;
}

interface NavCard {
  label: string;
  bgColor: string;
  textColor: string;
  links: NavCardLink[];
}

interface LocationItem {
  id: string;
  location_slug: string;
  city: string;
  state: string;
}

interface HeaderBarProps {
  websiteName?: string;
  phone?: string;
  locationPrefix?: string; // optional, used for location-aware routing
  logoUrl?: string | null;
  showSiteName?: boolean;
  features?: {
    show_blog?: boolean;
    show_glossary?: boolean;
    show_faq_page?: boolean;
    show_careers_page?: boolean;
    multi_location?: boolean;
  };
  navbarSettings?: NavbarSettings;
  ctaSettings?: CtaSettings;
  locations?: LocationItem[];
}

const HeaderBar: React.FC<HeaderBarProps> = ({ websiteName, phone, locationPrefix, logoUrl, showSiteName = true, features, navbarSettings, ctaSettings, locations }) => {
  // Feature flags with defaults (show all if no features provided)
  const showBlog = features?.show_blog ?? true;
  const showGlossary = features?.show_glossary ?? true;
  const showFaq = features?.show_faq_page ?? true;
  const showCareers = features?.show_careers_page ?? true;
  const isMultiLocation = features?.multi_location ?? false;
  
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [isHamburgerOpen, setIsHamburgerOpen] = useState<boolean>(false);
  const [isSearchVisible, setIsSearchVisible] = useState<boolean>(false);
  
  // Ref for GSAP card animations
  const cardsRef = useRef<HTMLDivElement[]>([]);

  // Debounce function to improve scroll performance
  const debounce = (fn: Function, delay: number) => {
    let timer: NodeJS.Timeout;
    return function (...args: any[]) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), delay);
    };
  };

  // Animate cards when dropdown opens
  useLayoutEffect(() => {
    if (isExpanded && cardsRef.current.length > 0) {
      // Animate cards sliding in with stagger
      gsap.fromTo(
        cardsRef.current,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.3, ease: 'power2.out', stagger: 0.05 }
      );
    }
  }, [isExpanded]);

  // Scroll handler
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsScrolled(window.scrollY > 10);
    }
    
    const handleScroll = debounce(() => {
      setIsScrolled(window.scrollY > 10);
    }, 100);

    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, []);

  // Toggle menu expansion
  const toggleMenu = useCallback(() => {
    if (!isExpanded) {
      setIsHamburgerOpen(true);
      setIsExpanded(true);
    } else {
      setIsHamburgerOpen(false);
      setIsExpanded(false);
    }
  }, [isExpanded]);

  const toggleSearch = useCallback(() => {
    setIsSearchVisible(!isSearchVisible);
    if (isExpanded) {
      toggleMenu();
    }
  }, [isSearchVisible, isExpanded, toggleMenu]);

  // Handle navigation item click - closes menu
  const handleNavClick = useCallback(() => {
    if (isExpanded) {
      toggleMenu();
    }
  }, [isExpanded, toggleMenu]);

  // Set card ref helper
  const setCardRef = (i: number) => (el: HTMLDivElement | null) => {
    if (el) cardsRef.current[i] = el;
  };

  // Build nav cards based on route context
  // All cards use the same contrasting background (like search card)
  const cardBg = 'var(--color-background-alt)';
  const cardText = 'var(--color-text-primary)';

  const buildNavCards = useCallback((): NavCard[] => {
    if (isMultiLocation && !locationPrefix && locations && locations.length > 0) {
      // Home route: Each location as its own card
      return locations.map((location) => ({
        label: `${location.city}, ${location.state}`,
        bgColor: cardBg,
        textColor: cardText,
        links: [
          { label: 'Visit Location', href: `/locations/${location.location_slug}` }
        ]
      }));
    }

    // Location route: Nav cards (Company, Resources)
    const cards: NavCard[] = [];

    // Card 1: Company
    const companyLinks: NavCardLink[] = [];
    companyLinks.push({ label: 'Policies', href: locationPrefix ? `${locationPrefix}/policies` : '/policies' });
    companyLinks.push({ label: 'About', href: locationPrefix ? `${locationPrefix}/about` : '/about' });
    companyLinks.push({ label: 'Our Team', href: locationPrefix ? `${locationPrefix}/our-team` : '/our-team' });
    companyLinks.push({ label: 'Contact', href: locationPrefix ? `${locationPrefix}/contact` : '/contact' });
    cards.push({
      label: 'Company',
      bgColor: cardBg,
      textColor: cardText,
      links: companyLinks
    });

    // Card 2: Resources
    const resourceLinks: NavCardLink[] = [];
    if (showCareers) {
      resourceLinks.push({ label: 'Apply', href: locationPrefix ? `${locationPrefix}/apply` : '/apply' });
    }
    if (showBlog) {
      resourceLinks.push({ label: 'Blog', href: locationPrefix ? `${locationPrefix}/blog` : '/blog' });
    }
    if (showGlossary) {
      resourceLinks.push({ label: 'Glossary', href: locationPrefix ? `${locationPrefix}/glossary` : '/glossary' });
    }
    if (showFaq) {
      resourceLinks.push({ label: 'FAQ', href: locationPrefix ? `${locationPrefix}/faq` : '/faq' });
    }
    if (resourceLinks.length > 0) {
      cards.push({
        label: 'Resources',
        bgColor: cardBg,
        textColor: cardText,
        links: resourceLinks
      });
    }

    return cards;
  }, [isMultiLocation, locationPrefix, locations, showBlog, showGlossary, showFaq, showCareers]);

  const navCards = buildNavCards();
  return (
    <header 
      className={`header ${isScrolled ? 'header-scrolled' : ''}`} 
      role="banner"
    >
      <div className="card-nav-container">
        <nav
          className="card-nav"
          role="navigation"
        >
          {/* Top Bar - Fixed Height */}
          <div className="card-nav-top">
            {/* Logo */}
            <div className="flex items-center">
              <Link href={locationPrefix || '/'} className="flex items-center gap-3">
                {logoUrl ? (
                  <Image
                    src={logoUrl}
                    alt={websiteName || "Logo"}
                    width={120}
                    height={40}
                    className="h-8 w-auto object-contain"
                    priority
                  />
                ) : (
                  <div className="h-8 w-8 bg-primary rounded flex items-center justify-center">
                    <span className="text-primary-foreground font-bold text-sm">
                      {(websiteName || "").charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                {showSiteName && websiteName && (
                  <span className="hidden md:inline font-medium font-heading text-lg" style={{ color: 'var(--navbar-agency-name-color)' }}>
                    {websiteName}
                  </span>
                )}
              </Link>
            </div>

            {/* Right side: CTA Button + Hamburger */}
            <div className="flex items-center gap-3">
              <Link 
                href={`tel:${normalizePhoneNumber(navbarSettings?.phone || phone)}`} 
                className="inline-flex items-center px-4 py-1.5 text-sm md:text-base transition-colors duration-300 font-medium whitespace-nowrap cta-button"
                style={{
                  backgroundColor: 'var(--cta-bg-color)',
                  color: 'var(--cta-text-color)',
                  borderRadius: 'var(--cta-border-radius)',
                  borderWidth: 'var(--cta-border-width)',
                  borderColor: 'var(--cta-border-color)',
                  borderStyle: ctaSettings?.border_width ? 'solid' : 'none',
                }}
              >
                {(navbarSettings?.show_icon ?? true) && <Phone size={16} className="mr-1.5" />}
                <span className="hidden md:inline">{navbarSettings?.text ?? 'Call Today'}</span>
                <span className="md:hidden">Call</span>
              </Link>

              {/* Hamburger Menu */}
              <div
                className={`hamburger-menu ${isHamburgerOpen ? 'open' : ''} group`}
                onClick={toggleMenu}
                role="button"
                aria-label={isExpanded ? 'Close menu' : 'Open menu'}
                tabIndex={0}
                style={{ color: 'var(--navbar-text-color)' }}
              >
                <div
                  className={`hamburger-line ${isHamburgerOpen ? 'translate-y-[4px] rotate-45' : ''} group-hover:opacity-75`}
                />
                <div
                  className={`hamburger-line ${isHamburgerOpen ? '-translate-y-[4px] -rotate-45' : ''} group-hover:opacity-75`}
                />
              </div>
            </div>
          </div>

          {/* Dropdown Panel - Pops out below header */}
          {isExpanded && (
            <div className="card-nav-dropdown animate-fade-in">
              <div className="card-nav-dropdown-content">
                {/* Nav Cards */}
                {navCards.map((card, idx) => (
                  <div
                    key={`${card.label}-${idx}`}
                    className="nav-card"
                    ref={setCardRef(idx)}
                    style={{ backgroundColor: card.bgColor, color: card.textColor }}
                  >
                    <div className="nav-card-label flex items-center gap-2">
                      {isMultiLocation && !locationPrefix && <MapPin size={16} />}
                      {card.label}
                    </div>
                    <div className="nav-card-links">
                      {card.links.map((link, i) => (
                        <Link
                          key={`${link.label}-${i}`}
                          className="nav-card-link"
                          href={link.href}
                          onClick={handleNavClick}
                        >
                          <ArrowUpRight size={14} aria-hidden="true" />
                          {link.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}

                {/* Search Card */}
                <div
                  className="nav-card"
                  ref={setCardRef(navCards.length)}
                  style={{ backgroundColor: 'var(--color-background-alt)', color: 'var(--color-text-primary)' }}
                >
                  <div className="nav-card-label flex items-center gap-2">
                    <Search size={16} />
                    Search
                  </div>
                  <div className="nav-card-links">
                    <button
                      className="nav-card-link w-full text-left"
                      onClick={toggleSearch}
                    >
                      <ArrowUpRight size={14} aria-hidden="true" />
                      Search Site
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </nav>
      </div>

      {/* Search Overlay */}
      {isSearchVisible && (
        <div className="fixed inset-0 bg-white z-50 p-4 animate-fade-in" role="dialog" aria-label="Search">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-primary">Search</h3>
            <button 
              onClick={toggleSearch}
              className="text-primary"
              aria-label="Close search"
            >
              <X size={24} />
            </button>
          </div>
          <SearchBar 
            variant="fullwidth" 
            placeholder="Search for insurance, policies, etc..."
            onClose={toggleSearch}
          />
        </div>
      )}
    </header>
  );
};

export default HeaderBar;
