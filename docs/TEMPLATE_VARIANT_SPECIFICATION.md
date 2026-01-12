# Template Variant System Specification

> **For External Developers**: This document defines the exact structure, conventions, and contracts you must follow when creating a new template variant for the Coverage Creatives multi-tenant insurance website platform.

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Authentication](#authentication)
4. [Route Structure](#route-structure)
5. [Folder Structure](#folder-structure)
6. [Component Contracts](#component-contracts)
7. [Database Schema](#database-schema)
8. [Global Theme Settings](#global-theme-settings)
9. [CSS Variable System](#css-variable-system)
10. [Component Overrides](#component-overrides)
11. [Wrapper Pattern](#wrapper-pattern)
12. [Shell Component Props](#shell-component-props)
13. [Location Page Components](#location-page-components)
14. [Data Fetching Patterns](#data-fetching-patterns)
15. [Creating a New Variant](#creating-a-new-variant)
16. [Testing Your Variant](#testing-your-variant)
17. [Checklist for Submission](#checklist-for-submission)

---

## Overview

### What is a Template Variant?

A template variant is an alternative visual design for the same website functionality. All variants:

- **Share the same URL structure** (routes are identical)
- **Share the same data sources** (Supabase queries)
- **Share the same color control system** (CSS variables)
- **Differ only in visual layout and styling**

### What You Will Create

When building a new variant, you will create alternative implementations of specific UI components. You will NOT modify:

- Page routes (`/app/**`)
- Data fetching logic
- Business logic
- Shared utilities
- The theme/color system

---

## Architecture

### How Variants Work

```
┌─────────────────────────────────────────────────────────────────┐
│                        app/layout.tsx                           │
│                    (ThemeProvider wraps all)                    │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Shell Components                            │
│              (HeaderShell, FooterShell)                         │
│         Fetch data → Pass to variant component                  │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Variant Resolver                             │
│     Reads `template_variant` from theme settings                │
│     Dynamically imports correct variant component               │
└─────────────────────────────────────────────────────────────────┘
                                │
                    ┌───────────┼───────────┐
                    ▼           ▼           ▼
              ┌─────────┐ ┌─────────┐ ┌─────────┐
              │ coastal │ │ modern  │ │ minimal │
              │ variant │ │ variant │ │ variant │
              └─────────┘ └─────────┘ └─────────┘
```

### Key Principle: Shell + Variant Pattern

**Shell components** (server components) handle:
- Data fetching from Supabase
- Passing standardized props to variant components

**Variant components** (can be client or server) handle:
- Visual layout and styling
- Animations and interactions
- Responsive design

---

## Authentication

### No Authentication Required

The `template-coverage-creatives` repository is a **public-facing website template**. It has:

- **No user authentication**
- **No login/logout flows**
- **No protected routes**
- **No session management**

All pages are publicly accessible. Authentication is handled separately in `coverage-nextjs` (the admin system).

### What NOT to Add

**Do NOT add any of the following to your variant:**

- Auth providers or context
- Login/logout pages
- Protected route wrappers
- Session cookies or tokens
- User state management
- Role-based access control

If you need to test with different client configurations, use the `NEXT_PUBLIC_CLIENT_ID` environment variable — not authentication.

---

## Route Structure

### Overview

All routes are defined in the `/app/` directory and are **NOT part of your variant**. You only provide the components that render on these routes. The routing structure is fixed.

### Home Routes (Single Location or Default)

| Route | Description | Variant Components Used |
|-------|-------------|------------------------|
| `/` | Home page | HeroSection, IntroSection, LocationPoliciesSection, Testimonials, HomeCTA, FAQPreview, CareersSection |
| `/about` | About page | (shared component) |
| `/contact` | Contact page | (shared component) |
| `/policies` | Policies list | (shared component) |
| `/policies/[type]/[slug]` | Policy detail | PolicyPageTemplate |
| `/blog` | Blog list (if enabled) | (shared component) |
| `/blog/[slug]` | Blog post (if enabled) | (shared component) |
| `/glossary` | Glossary (if enabled) | (shared component) |
| `/glossary/[slug]` | Glossary term (if enabled) | (shared component) |
| `/faq` | FAQ page (if enabled) | (shared component) |
| `/apply` | Careers/Apply (if enabled) | (shared component) |

### Multi-Location Routes

When `multi_location` is enabled, location-specific routes are available:

| Route | Description | Variant Components Used |
|-------|-------------|------------------------|
| `/locations/[slug]` | Location landing page | LocationFeaturedPolicies, LocationCareersSection, LocationFAQSection |
| `/locations/[slug]/about` | Location about | (shared component) |
| `/locations/[slug]/contact` | Location contact | (shared component) |
| `/locations/[slug]/policies` | Location policies list | (shared component) |
| `/locations/[slug]/policies/[policy-slug]` | Location policy detail | PolicyPageTemplate |
| `/locations/[slug]/blog` | Location blog (if enabled) | (shared component) |
| `/locations/[slug]/faq` | Location FAQ (if enabled) | (shared component) |
| `/locations/[slug]/glossary` | Location glossary (if enabled) | (shared component) |
| `/locations/[slug]/apply` | Location careers (if enabled) | (shared component) |
| `/locations/[slug]/our-team` | Location team (if enabled) | (shared component) |

### Routing Rules for Variants

#### 1. Use the `locationPrefix` Prop

Header and Footer components receive a `locationPrefix` prop that contains the current location path prefix:

```typescript
// For home/single-location: locationPrefix = undefined or ""
// For multi-location: locationPrefix = "/locations/houston"

// Building links in your variant:
const policiesLink = locationPrefix ? `${locationPrefix}/policies` : '/policies';
const contactLink = locationPrefix ? `${locationPrefix}/contact` : '/contact';
```

#### 2. Never Hardcode Routes

Always use the prefix pattern. Never hardcode paths like `/locations/houston/policies`.

```typescript
// ✅ CORRECT
<Link href={`${locationPrefix}/policies`}>Policies</Link>

// ❌ WRONG
<Link href="/policies">Policies</Link>  // Breaks on location pages
<Link href="/locations/houston/policies">Policies</Link>  // Hardcoded
```

#### 3. Navigation Link Patterns

| Link | Pattern |
|------|---------|
| Home | `locationPrefix ? locationPrefix : '/'` |
| About | `${locationPrefix || ''}/about` |
| Policies | `${locationPrefix || ''}/policies` |
| Contact | `${locationPrefix || ''}/contact` |
| Blog | `${locationPrefix || ''}/blog` |
| FAQ | `${locationPrefix || ''}/faq` |
| Glossary | `${locationPrefix || ''}/glossary` |
| Careers | `${locationPrefix || ''}/apply` |

#### 4. Policy Links

Policy detail pages have a specific URL structure:

```typescript
// Single location or home:
`/policies/${policyType}/${policySlug}`
// e.g., /policies/personal-insurance/auto-insurance

// Multi-location:
`/locations/${locationSlug}/policies/${policySlug}`
// e.g., /locations/houston/policies/auto-insurance
```

---

## Folder Structure

### Required Structure for Each Variant

```
components/
├── variants/
│   ├── {variant-name}/              # Your variant folder (e.g., "modern")
│   │   ├── index.ts                 # Exports all variant components
│   │   ├── layout/
│   │   │   ├── Header.tsx           # Navigation/header component
│   │   │   └── Footer.tsx           # Footer component
│   │   ├── home/
│   │   │   ├── HeroSection.tsx      # Hero/banner section
│   │   │   ├── IntroSection.tsx     # Introduction/about section
│   │   │   ├── LocationPoliciesSection.tsx
│   │   │   ├── Testimonials.tsx     # Reviews/testimonials
│   │   │   ├── HomeCTA.tsx          # Call-to-action section
│   │   │   ├── FAQPreview.tsx       # FAQ preview section
│   │   │   └── CareersSection.tsx   # Careers/jobs section
│   │   ├── policies/
│   │   │   └── PolicyPageTemplate.tsx
│   │   ├── location/
│   │   │   ├── LocationHero.tsx     # Location page hero
│   │   │   └── LocationFeaturedPolicies.tsx
│   │   └── README.md                # Variant documentation
```

### Naming Convention

- **Variant folder name**: lowercase, hyphenated (e.g., `modern`, `bold-dark`, `minimal-clean`)
- **Component files**: PascalCase matching the component name
- **Must match exactly**: Component names must match the contracts below

---

## Component Contracts

Each variant component must accept specific props and render specific functionality. Below are the exact interfaces you must implement.

### Layout Components

#### `Header.tsx`

```typescript
interface HeaderProps {
  // Agency/website info
  websiteName?: string;
  phone?: string;
  logoUrl?: string | null;
  showSiteName?: boolean;
  
  // Routing context
  locationPrefix?: string;  // e.g., "/locations/houston" or undefined for home
  
  // Feature flags (what nav items to show)
  features?: {
    show_blog?: boolean;
    show_glossary?: boolean;
    show_faq_page?: boolean;
    show_careers_page?: boolean;
    multi_location?: boolean;
  };
  
  // Theme settings (colors are via CSS vars, these are structural)
  navbarSettings?: {
    bg_color: string | null;
    bg_opacity: number;
    height: number | null;
    text_color: string | null;
    text_hover_color: string | null;
    agency_name_color: string | null;
    phone: string | null;
    text: string;
    show_icon: boolean;
  };
  
  ctaSettings?: {
    bg_color: string | null;
    text_color: string | null;
    hover_bg_color: string | null;
    border_color: string | null;
    border_width: number;
    border_radius: number;
  };
  
  // For multi-location: list of all locations for picker
  locations?: Array<{
    id: string;
    location_slug: string;
    city: string;
    state: string;
  }>;
}

// Export requirement
export default function Header(props: HeaderProps): JSX.Element;
```

**Required Navigation Items** (conditionally shown based on `features`):
- Home (always)
- About (always)
- Policies (always)
- Blog (if `features.show_blog`)
- FAQ (if `features.show_faq_page`)
- Glossary (if `features.show_glossary`)
- Careers (if `features.show_careers_page`)
- Contact (always)

**Required Functionality**:
- Mobile-responsive menu
- Phone number display with click-to-call
- Logo display
- Scroll behavior (sticky/fixed as appropriate)

---

#### `Footer.tsx`

```typescript
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
  
  allLocations?: Array<{
    id: string;
    location_name: string;
    address_line_1?: string;
    city: string;
    state: string;
    zip: string;
    phone?: string;
    location_slug: string;
  }>;
  
  socialLinksModalData?: {
    locations: Array<{
      location_id: string;
      location_name: string;
      city: string;
      state: string;
      links: Array<{
        platform: string;
        url: string;
        display_name?: string;
      }>;
    }>;
  };
}

export default function Footer(props: FooterProps): JSX.Element;
```

**Required Sections**:
- Agency name and tagline
- Contact information (address, phone)
- Navigation links (same as header)
- Social media links
- Copyright notice with current year
- For multi-location: location list or selector

---

### Home Page Components

#### `HeroSection.tsx`

```typescript
// No props - fetches own data via getHeroSection()
// Must call the existing data fetcher

interface HeroContent {
  title?: { content: string; color?: string };
  subtitle?: { content: string; color?: string };
  description?: { content: string };
  background_image?: { url: string; alt?: string };
  background_video?: { url: string | null };
  background_media_type?: 'image' | 'video';
  overlay?: { color: string | null; opacity: number };
}

export default async function HeroSection(): Promise<JSX.Element | null>;
```

**Required Elements**:
- Background media (image or video)
- Title (h1)
- Subtitle (h2)
- Description paragraph
- CTA button (use `HeroCTAButton` component from `/components/home-page/HeroCTAButton.tsx`)
- Overlay support

**Data Fetching**: Use the existing pattern:
```typescript
import { supabase } from '@/lib/supabase';

async function getHeroSection() {
  const clientId = process.env.NEXT_PUBLIC_CLIENT_ID;
  const { data } = await supabase
    .from('client_home_page')
    .select('hero_section')
    .eq('client_id', clientId)
    .maybeSingle();
  return data?.hero_section;
}
```

---

#### `IntroSection.tsx`

```typescript
interface IntroContent {
  image: { url: string };
  title: { content: string };
  tagline: { content: string };
  image_tag: { content: string };
  description: {
    paragraphs: {
      [key: string]: { content: string };
    };
  };
}

export default async function IntroSection(): Promise<JSX.Element | null>;
```

**Required Elements**:
- Image with overlay tag
- Tagline badge
- Section title
- Multiple paragraphs
- Divider at top (use `<Divider position="top" />` or `<TrustBadgeDivider />`)

---

#### `LocationPoliciesSection.tsx`

```typescript
// Dual-mode component: shows locations (multi) or policies (single)

interface PolicyPage {
  id: string;
  title: string;
  slug: string;
  content_summary: string;
}

interface Location {
  id: string;
  location_name: string;
  city: string;
  state: string;
  location_slug: string;
}

export default async function LocationPoliciesSection(): Promise<JSX.Element | null>;
```

**Required Behavior**:
- Check `isMultiLocation()` to determine mode
- Multi-location mode: Display location cards linking to `/locations/{slug}/policies`
- Single-location mode: Display policy cards linking to `/policies/{slug}`
- Use CSS variable styles from `LocationPoliciesSectionSettings`

---

#### `Testimonials.tsx`

```typescript
interface Testimonial {
  id: string;
  author_name: string;
  author_title?: string;
  content: string;
  rating?: number;
  avatar_url?: string;
}

export default async function Testimonials(): Promise<JSX.Element | null>;
```

**Required Elements**:
- Testimonial cards with author info
- Star ratings if available
- Carousel or grid layout

---

#### `HomeCTA.tsx`

```typescript
interface CTAContent {
  subtitle?: { content: string };
  description?: { content: string };
  styles?: {
    gradient?: { startColor?: string; endColor?: string; direction?: string };
    card?: { backgroundColor?: string; backgroundOpacity?: number };
    button?: { backgroundColor?: string; textColor?: string };
  };
}

export default async function HomeCTA(): Promise<JSX.Element | null>;
```

**Required Behavior**:
- Multi-location: Show cards for each location linking to contact pages
- Single-location: Show single contact CTA
- Apply gradient and style settings from database

---

#### `FAQPreview.tsx`

```typescript
// Shows top 3-5 FAQs with link to full FAQ page

export default async function FAQPreview(): Promise<JSX.Element | null>;
```

---

#### `CareersSection.tsx`

```typescript
// Shows careers/jobs section if enabled

export default async function CareersSection(): Promise<JSX.Element | null>;
```

---

### Policy Page Components

#### `PolicyPageTemplate.tsx`

```typescript
interface PolicyPageTemplateProps {
  policy: {
    title: string;
    slug: string;
    meta_title?: string;
    meta_description?: string;
    hero_section?: object;
    content_sections?: object;
    faqs?: Array<{ question: string; answer: string }>;
    related_policies?: Array<{ title: string; slug: string }>;
    youtube_url?: string;
    ldjson?: object;
  };
  locationSlug?: string;
}

export default function PolicyPageTemplate(props: PolicyPageTemplateProps): JSX.Element;
```

---

## Database Schema

### Overview

All theme and content data is stored in Supabase. Variants do **not** define their own defaults — all theming is database-driven. Below are the key tables and columns you need to understand.

### `client_theme_settings` Table

This table stores all theme configuration per client (agency). One row per client, shared across all locations.

| Column | Type | Description |
|--------|------|-------------|
| `id` | `UUID` | Primary key |
| `client_id` | `UUID` | FK to `clients` table |
| `color_primary` | `TEXT` | Primary brand color (default: `#004080`) |
| `color_primary_foreground` | `TEXT` | Text on primary color (default: `#FFFFFF`) |
| `color_accent` | `TEXT` | CTA/button color (default: `#F76C5E`) |
| `color_accent_foreground` | `TEXT` | Text on accent color (default: `#FFFFFF`) |
| `color_secondary` | `TEXT` | Badges, subtle backgrounds (default: `#A7D8DE`) |
| `color_secondary_foreground` | `TEXT` | Text on secondary (default: `#004080`) |
| `color_background` | `TEXT` | Section backgrounds (default: `#FAF3E0`) |
| `color_background_alt` | `TEXT` | Card/content backgrounds (default: `#FFFFFF`) |
| `color_text_primary` | `TEXT` | Headings (default: `#004080`) |
| `color_text_body` | `TEXT` | Body text (default: `#5C4B51`) |
| `color_text_muted` | `TEXT` | Captions, hints (default: `#6B7280`) |
| `divider_color` | `TEXT` | Divider line color (default: `#A7D8DE`) |
| `divider_thickness` | `INTEGER` | Divider height 1-50px (default: `4`) |
| `divider_style` | `TEXT` | `solid`, `dashed`, `dotted` (default: `solid`) |
| `font_heading` | `TEXT` | Heading font family (default: `Playfair Display`) |
| `font_body` | `TEXT` | Body font family (default: `Inter`) |
| `font_accent` | `TEXT` | Decorative font (default: `Caveat`) |
| `heading_size_multiplier` | `NUMERIC` | 0.5-2.0 (default: `1.0`) |
| `body_size_multiplier` | `NUMERIC` | 0.5-2.0 (default: `1.0`) |
| `heading_weight` | `TEXT` | `400`-`800` (default: `700`) |
| `body_weight` | `TEXT` | `300`-`600` (default: `400`) |
| `section_overrides` | `JSONB` | Per-section color overrides |
| `fav_icon_url` | `TEXT` | Favicon URL |
| `website_logo_url` | `TEXT` | Logo URL |
| `show_client_site_name` | `BOOLEAN` | Show agency name in header |
| `popup_settings` | `JSONB` | Modal/popup styling |
| `navbar_settings` | `JSONB` | Header bar styling |
| `cta_settings` | `JSONB` | CTA button styling |
| `card_settings` | `JSONB` | Card styling |
| `hero_divider_settings` | `JSONB` | Hero divider (solid or trust badges) |
| `location_policies_section_settings` | `JSONB` | Location/Policies section colors |
| `intro_section_aspect_ratio` | `TEXT` | `1:1`, `4:3`, `16:9` (default: `4:3`) |

### JSONB Column Structures

#### `navbar_settings`
```json
{
  "bg_color": "#FFFFFF",
  "bg_opacity": 0.9,
  "height": null,
  "text_color": "#004080",
  "text_hover_color": "#F76C5E",
  "agency_name_color": "#004080",
  "phone": "(555) 123-4567",
  "text": "Call Today",
  "show_icon": true
}
```

#### `cta_settings`
```json
{
  "bg_color": "#F76C5E",
  "text_color": "#FFFFFF",
  "hover_bg_color": "#e55a4d",
  "border_color": null,
  "border_width": 0,
  "border_radius": 9999,
  "text": "Call Today",
  "phone": null,
  "show_icon": true
}
```

#### `card_settings`
```json
{
  "background": "#FFFFFF",
  "border": "#e2e8f0",
  "badge_bg": "#64748b",
  "badge_text": "#FFFFFF",
  "badge_opacity": 0.2,
  "text_primary": "#1e293b",
  "text_secondary": "#475569"
}
```

#### `hero_divider_settings`
```json
{
  "type": "solid",
  "badges": [
    { "id": "licensed", "icon": "ShieldCheck", "text": "Licensed & Insured", "enabled": true },
    { "id": "reviews", "icon": "Star", "text": "5-Star Reviews", "enabled": true }
  ],
  "badge_bg_color": "#A7D8DE",
  "badge_text_color": "#004080",
  "badge_icon_color": "#F76C5E",
  "divider_bg_color": "#FAF3E0",
  "badge_size": "md",
  "badge_spacing": "normal",
  "divider_padding": "md"
}
```

#### `location_policies_section_settings`
```json
{
  "section_bg_color": "#f8fafc",
  "badge_bg_color": "#64748b",
  "badge_text_color": "#FFFFFF",
  "heading_color": "#1e3a5f",
  "subheading_color": "#475569",
  "card_bg_color": "#FFFFFF",
  "card_border_color": "#e2e8f0",
  "card_heading_color": "#1e3a5f",
  "card_body_color": "#475569",
  "accent_line_color": "#2563eb",
  "button_bg_color": "#2563eb",
  "button_text_color": "#FFFFFF",
  "link_color": "#1e3a5f"
}
```

#### `section_overrides`
```json
{
  "hero": { "background": "#1a1a1a", "text": "#ffffff", "text_secondary": "#cccccc" },
  "footer": { "background": "#1e3a5f", "text": "#ffffff", "badge_bg": "#A7D8DE" },
  "cta": { "background": "#F76C5E", "text": "#ffffff" }
}
```

---

## Global Theme Settings

### How Theming Works

1. **Database** → Theme settings stored in `client_theme_settings` table
2. **Server** → `getThemeSettings()` fetches theme for current `client_id`
3. **Transform** → `themeToCssVars()` converts theme to CSS custom properties
4. **Inject** → `ThemeProvider` applies CSS vars to `:root` element
5. **Prevent FOUC** → `ThemeStyleTag` injects CSS in `<head>` before hydration

### Key Points for Variant Developers

- **Variants cannot define their own theme defaults** — all theming comes from the database
- **Always use CSS variables** — never hardcode colors
- **Missing CSS variables fall back to defaults** defined in `lib/theme/defaults.ts`
- **Components are controlled by feature flags** — not by missing CSS

### Theme Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    client_theme_settings                         │
│                    (Supabase Database)                           │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    getThemeSettings()                            │
│                    (lib/theme/index.ts)                          │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    themeToCssVars()                              │
│              Converts theme object to CSS vars                   │
└─────────────────────────────────────────────────────────────────┘
                                │
                    ┌───────────┴───────────┐
                    ▼                       ▼
┌─────────────────────────┐   ┌─────────────────────────┐
│    ThemeStyleTag        │   │    ThemeProvider        │
│  (SSR - prevents FOUC)  │   │  (Client - useEffect)   │
└─────────────────────────┘   └─────────────────────────┘
                    │                       │
                    └───────────┬───────────┘
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    :root CSS Variables                           │
│              --color-primary, --color-accent, etc.               │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Variant Components                            │
│              Use CSS vars via Tailwind or inline styles          │
└─────────────────────────────────────────────────────────────────┘
```

---

## CSS Variable System

### CRITICAL: All colors MUST use CSS variables

Your variant components must use the CSS variable system for all colors. This ensures the admin color controls work across all variants.

### Available CSS Variables

```css
/* Primary brand colors */
--color-primary
--color-primary-foreground

/* Accent colors (CTAs, highlights) */
--color-accent
--color-accent-foreground

/* Secondary colors (badges, subtle elements) */
--color-secondary
--color-secondary-foreground

/* Backgrounds */
--color-background
--color-background-alt

/* Text */
--color-text-primary      /* Headings */
--color-text-body         /* Body text */
--color-text-muted        /* Captions, hints */

/* Dividers */
--divider-color
--divider-thickness
--divider-style

/* Typography */
--font-heading
--font-body
--font-accent
--heading-weight
--body-weight

/* Navbar */
--navbar-bg-color
--navbar-bg-opacity
--navbar-text-color
--navbar-text-hover-color

/* CTA buttons */
--cta-bg-color
--cta-text-color
--cta-hover-bg-color
--cta-border-radius

/* Cards */
--color-card-bg
--color-card-border
--color-card-text-primary
--color-card-text-secondary

/* Footer */
--footer-bg
--footer-text
--footer-text-secondary

/* Location/Policies section */
--loc-section-bg
--loc-badge-bg
--loc-badge-text
--loc-heading
--loc-card-bg
--loc-button-bg
--loc-button-text
```

### Usage Examples

```tsx
// ✅ CORRECT - Uses CSS variables
<div className="bg-primary text-primary-foreground">
  <h1 style={{ color: 'var(--color-text-primary)' }}>Title</h1>
</div>

// ✅ CORRECT - Tailwind classes mapped to CSS vars
<button className="bg-accent text-accent-foreground rounded-full">
  Click Me
</button>

// ❌ WRONG - Hardcoded colors
<div style={{ backgroundColor: '#1e3a5f' }}>
  <h1 style={{ color: '#ffffff' }}>Title</h1>
</div>
```

### Tailwind Classes That Use CSS Variables

These Tailwind classes are pre-configured to use CSS variables:

| Class | Maps To |
|-------|---------|
| `bg-primary` | `var(--color-primary)` |
| `text-primary` | `var(--color-primary)` |
| `bg-accent` | `var(--color-accent)` |
| `text-accent` | `var(--color-accent)` |
| `bg-secondary` | `var(--color-secondary)` |
| `bg-theme-bg` | `var(--color-background)` |
| `bg-theme-bg-alt` | `var(--color-background-alt)` |
| `text-theme-text` | `var(--color-text-primary)` |
| `text-theme-body` | `var(--color-text-body)` |
| `text-theme-muted` | `var(--color-text-muted)` |

---

## Component Overrides

### How Component Visibility Works

Components are **not** controlled by whether they exist in your variant folder. Instead, visibility is controlled by **feature flags** stored in the database.

### Feature Flags

The `client_websites` table contains feature flags that control which components are shown:

| Flag | Controls |
|------|----------|
| `show_blog` | Blog page and blog nav item |
| `show_glossary` | Glossary page and glossary nav item |
| `show_faq_page` | FAQ page and FAQ nav item |
| `show_careers_page` | Careers/Apply page and nav item |

### How to Handle Feature Flags in Your Variant

Your variant components receive feature flags via props. Use them to conditionally render elements:

```typescript
// In Header.tsx
const showBlog = features?.show_blog ?? true;
const showGlossary = features?.show_glossary ?? true;
const showFaq = features?.show_faq_page ?? true;
const showCareers = features?.show_careers_page ?? true;

// Conditionally render nav items
{showBlog && <NavItem href="/blog">Blog</NavItem>}
{showGlossary && <NavItem href="/glossary">Glossary</NavItem>}
```

### CSS Fallbacks

If a CSS variable is not set in the database, it falls back to the default value defined in `lib/theme/defaults.ts`. Your variant should work correctly with default values.

---

## Wrapper Pattern

### Overview

Some components use a **Wrapper pattern** where:
1. A **Wrapper** component (server component) fetches data from Supabase
2. The **Presentation** component (can be client or server) receives data as props and renders UI

### Examples

#### FAQPreviewWrapper → FAQPreview

```typescript
// FAQPreviewWrapper.tsx (Server Component)
export default async function FAQPreviewWrapper() {
  const content = await getCommonQuestionsSection();
  if (!content) return null;
  return <FAQPreview faqContent={content} />;
}

// FAQPreview.tsx (Presentation Component)
export function FAQPreview({ faqContent }: FAQPreviewProps) {
  // Render UI with faqContent
}
```

#### TestimonialsWrapper → Testimonials

```typescript
// TestimonialsWrapper.tsx (Server Component)
export default async function TestimonialsWrapper() {
  const reviewsContent = await getTestimonialsSection();
  if (!reviewsContent) return null;
  return <Testimonials reviewsContent={reviewsContent} />;
}
```

### When to Use This Pattern

Use the Wrapper pattern when:
- Data needs to be fetched from multiple sources and combined
- Complex data transformation is needed before rendering
- You want to keep presentation components pure and testable

---

## Shell Component Props

### HeaderShell

The `HeaderShell` is a server component that fetches all data needed by the Header and passes it as props.

**Props received by HeaderShell:**
```typescript
interface HeaderShellProps {
  locationPrefix?: string;  // e.g., "/locations/houston" or undefined for home
}
```

**Data fetched by HeaderShell:**
- `getClientData()` → agency name, phone
- `getFeatures(slug)` → feature flags for current location
- `getThemeSettings()` → theme configuration
- `isMultiLocation()` → whether client has multiple locations
- `getAllWebsites()` → list of all locations (for location picker)

**Props passed to Header variant:**
```typescript
{
  websiteName,
  phone,
  locationPrefix,
  logoUrl,
  showSiteName,
  features,
  navbarSettings,
  ctaSettings,
  locations
}
```

### FooterShell

The `FooterShell` is a server component that fetches all data needed by the Footer.

**Props received by FooterShell:**
```typescript
interface FooterShellProps {
  locationPrefix?: string;   // e.g., "/locations/houston"
  locationSlug?: string;     // e.g., "houston"
}
```

**Data fetched by FooterShell:**
- `getClientData()` → agency info
- `getWebsiteData()` → website config, social links
- `getBadges()` → trust badges
- `isMultiLocation()` → multi-location flag
- `getThemeSettings()` → theme configuration
- `getAllWebsites()` → all locations
- `getSocialLinksForLocationSlug()` or `getAllLocationsSocialLinks()` → social links

**Props passed to Footer variant:**
```typescript
{
  agencyName,
  city,
  state,
  postalCode,
  phone,
  address,
  locationName,
  socialLinks,
  badges,
  tagline,
  locationPrefix,
  isMultiLocation,
  footerLogoUrl,
  allLocations,
  socialLinksModalData
}
```

---

## Location Page Components

### LocationFeaturedPolicies

Displays featured policy cards on location landing pages.

```typescript
interface LocationFeaturedPoliciesProps {
  locationId: string;      // UUID of the location
  locationSlug: string;    // URL slug (e.g., "houston")
}

export default async function LocationFeaturedPolicies(
  props: LocationFeaturedPoliciesProps
): Promise<JSX.Element | null>;
```

**Data Sources:**
- `client_location_page.policies_section` → heading, subheading, featured_policy_ids
- `client_policy_pages` → policy details (title, slug, icon_url, content_summary)

**Required Behavior:**
- Fetch policies section config for the location
- If `show_section` is false, return null
- Display policy cards with links to `/locations/{slug}/policies/{policy-slug}`
- Use `--loc-*` CSS variables for styling

---

### LocationCareersSection

Displays careers/apply section on location pages.

```typescript
interface LocationCareersSectionProps {
  careersSection: {
    heading?: string;
    description?: string;
    button_text?: string;
    show_section?: boolean;
  } | null;
  locationName: string;
  locationSlug: string;
  city: string;
  state: string;
}

export default async function LocationCareersSection(
  props: LocationCareersSectionProps
): Promise<JSX.Element | null>;
```

**Required Behavior:**
- If `careersSection` is null, return null
- Display heading, description, and apply button
- Link to `/locations/{slug}/apply`
- Use `--loc-*` CSS variables for styling

---

### LocationFAQSection

Displays FAQ accordion on location pages.

```typescript
interface LocationFAQSectionProps {
  faqSection: {
    tagline?: string;
    subtitle?: string;
    description?: string;
    questions?: Array<{ question: string; answer: string }>;
    show_section?: boolean;
  } | null;
}

// Client component (needs useState for accordion)
export default function LocationFAQSection(
  props: LocationFAQSectionProps
): JSX.Element | null;
```

**Required Behavior:**
- If `faqSection` is null, return null
- Display FAQ accordion with expand/collapse functionality
- Use theme CSS variables for styling

---

## Data Fetching Patterns

### Server Components (Recommended)

Most variant components should be async server components that fetch their own data:

```typescript
import { supabase } from '@/lib/supabase';

export default async function MySection() {
  const clientId = process.env.NEXT_PUBLIC_CLIENT_ID;
  
  const { data, error } = await supabase
    .from('table_name')
    .select('*')
    .eq('client_id', clientId)
    .maybeSingle();
    
  if (!data) return null;
  
  return <section>...</section>;
}
```

### Existing Data Fetchers (Use These)

Import and use existing data fetchers from `/lib/`:

```typescript
import { getClientData } from '@/lib/client';
import { isMultiLocation, getWebsiteData } from '@/lib/website';
import { getThemeSettings } from '@/lib/theme';
```

### Client Components

If you need interactivity, mark with `'use client'` and receive data via props:

```typescript
'use client';

interface MyComponentProps {
  data: SomeType;
}

export default function MyComponent({ data }: MyComponentProps) {
  const [state, setState] = useState();
  // ...
}
```

---

## Testing Your Variant

### What You Will Receive

Coverage Creatives will provide you with:

1. **Test Supabase credentials** (URL and anon key)
2. **Test client ID** pointing to a pre-configured test client
3. **Sample `.env.local`** file with all values filled in

### Local Testing Setup

1. **Clone the template repository** (provided by Coverage Creatives)

2. **Create `.env.local`** with the provided credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://[project-ref].supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=[anon-key]
   NEXT_PUBLIC_CLIENT_ID=[test-client-uuid]
   ```

3. **Place your variant** in `components/variants/{variant-name}/`

4. **Install dependencies and run**:
   ```bash
   npm install
   npm run dev
   ```

5. **Open** `http://localhost:3000` and verify all pages render correctly

### Test Client Configuration

The test client will have:

- **Agency Info**: Test Insurance Agency, (555) 123-4567, Test City, TX
- **Features Enabled**: Blog, Glossary, FAQ, Careers (all enabled for full testing)
- **Multi-Location**: 2 test locations (Downtown, Suburban) for multi-location testing
- **Theme Settings**: Sample colors and fonts configured
- **Sample Content**: Hero section, intro section, testimonials, FAQs, policy pages

### Testing Checklist

#### Pages
- [ ] Home page (all sections)
- [ ] About page
- [ ] Policies list page
- [ ] Individual policy page
- [ ] Contact page
- [ ] FAQ page
- [ ] Blog page (if enabled)
- [ ] Glossary page (if enabled)
- [ ] Careers/Apply page (if enabled)

#### Multi-Location (if applicable)
- [ ] Location landing page (`/locations/[slug]`)
- [ ] Location policies page (`/locations/[slug]/policies`)
- [ ] Location policy detail (`/locations/[slug]/policies/[policy-slug]`)
- [ ] Location contact page (`/locations/[slug]/contact`)
- [ ] Location about page (`/locations/[slug]/about`)

#### Theme System
- [ ] CSS variables are applied correctly
- [ ] Colors match theme settings from database
- [ ] Fonts load correctly
- [ ] No hardcoded colors in variant components

#### Responsive Design
- [ ] Mobile (< 768px)
- [ ] Tablet (768px - 1024px)
- [ ] Desktop (> 1024px)

#### Feature Flags
- [ ] Components hide when feature is disabled
- [ ] Navigation items hide when feature is disabled

#### Console
- [ ] No console errors
- [ ] No console warnings

---

## Creating a New Variant

### Step-by-Step Process

1. **Create variant folder**
   ```
   components/variants/{your-variant-name}/
   ```

2. **Create index.ts with all exports**
   ```typescript
   // components/variants/{your-variant-name}/index.ts
   
   export { default as Header } from './layout/Header';
   export { default as Footer } from './layout/Footer';
   export { default as HeroSection } from './home/HeroSection';
   export { default as IntroSection } from './home/IntroSection';
   export { default as LocationPoliciesSection } from './home/LocationPoliciesSection';
   export { default as Testimonials } from './home/Testimonials';
   export { default as HomeCTA } from './home/HomeCTA';
   export { default as FAQPreview } from './home/FAQPreview';
   export { default as CareersSection } from './home/CareersSection';
   export { default as PolicyPageTemplate } from './policies/PolicyPageTemplate';
   ```

3. **Implement each component following the contracts above**

4. **Create README.md documenting your variant**
   ```markdown
   # {Variant Name} Template
   
   ## Design Philosophy
   [Describe the visual style]
   
   ## Key Features
   - Feature 1
   - Feature 2
   
   ## Screenshots
   [Include screenshots of key pages]
   
   ## Dependencies
   [List any additional npm packages needed]
   ```

5. **Test with the existing theme system**
   - Verify all CSS variables are respected
   - Test with different color schemes
   - Test responsive behavior

---

## Checklist for Submission

Before submitting your variant, verify:

### Structure
- [ ] Folder is at `components/variants/{variant-name}/`
- [ ] `index.ts` exports all required components
- [ ] All component files follow naming convention
- [ ] README.md is included

### Components
- [ ] `Header.tsx` - Implements all required nav items and functionality
- [ ] `Footer.tsx` - Implements all required sections
- [ ] `HeroSection.tsx` - Supports image/video backgrounds, overlay
- [ ] `IntroSection.tsx` - Includes divider, image, content
- [ ] `LocationPoliciesSection.tsx` - Handles both multi/single location modes
- [ ] `Testimonials.tsx` - Displays testimonials with ratings
- [ ] `HomeCTA.tsx` - Handles both multi/single location modes
- [ ] `FAQPreview.tsx` - Shows FAQ preview with link
- [ ] `CareersSection.tsx` - Shows careers section
- [ ] `PolicyPageTemplate.tsx` - Full policy page layout
- [ ] `LocationFeaturedPolicies.tsx` - Location page featured policies
- [ ] `LocationCareersSection.tsx` - Location page careers section
- [ ] `LocationFAQSection.tsx` - Location page FAQ accordion

### Styling
- [ ] ALL colors use CSS variables (no hardcoded hex values)
- [ ] Responsive design works on mobile, tablet, desktop
- [ ] Animations are smooth and respect `prefers-reduced-motion`
- [ ] Dark mode considerations (if applicable)

### Functionality
- [ ] All links use correct routing patterns
- [ ] Multi-location logic is correctly implemented
- [ ] Data fetching uses existing patterns
- [ ] No console errors or warnings

### Code Quality
- [ ] TypeScript types are correct
- [ ] No `any` types
- [ ] ESLint passes with no errors
- [ ] Code is formatted consistently

---

## Questions?

Contact the Coverage Creatives team for clarification on any requirements.
