# Location Landing Page Enhancements Plan

## Overview

This document outlines the planned enhancements for the location landing page (`/locations/[slug]`) and home page in the template-coverage-creatives repo. The goal is to fix layout issues, match the home page hero formatting, and add alternating section colors.

---

## Scope (Simplified)

**In Scope:**
- Fix location landing page hero to match home page format (50vh, min-height 600px)
- Use home page hero background image as fallback for location pages
- Add alternating section backgrounds to home page
- Location landing page mimics home page alternating pattern
- Remove Quick Links section from location page
- Make CTA section always render with defaults

**Out of Scope (for now):**
- Section overrides (no location-specific or global section overrides)
- New database migrations for section overrides
- Admin UI changes for section overrides

---

## Current State Analysis

### Issues Identified

1. **CTA Section Gap Issue**
   - The CTA section appears "stuck" with a large gap below it
   - Page uses `min-h-screen flex flex-col` but content doesn't fill properly

2. **Hero Section Mismatch**
   - **Home page hero**: `height: 50vh`, `min-height: 600px`, supports background image
   - **Location page hero**: Only uses padding (`pt-16 pb-12`), no defined height, no background image

3. **Bland Visual Design**
   - All sections have similar white/light backgrounds
   - No visual hierarchy or alternating colors
   - Quick Links section is redundant (already in nav)

---

## Implementation Plan

### Phase 1: Home Page Alternating Section Backgrounds

**File**: `app/(global)/page.tsx` and related components

**Pattern**:
| Section | Background |
|---------|------------|
| Hero | Background image (existing) |
| Intro | `bg-white` |
| Policies | `bg-theme-bg/30` (alt) |
| Testimonials | `bg-white` |
| CTA | `bg-primary` |
| FAQ | `bg-theme-bg/30` (alt) |

### Phase 2: Location Landing Page Updates

**File**: `app/(location)/locations/[slug]/page.tsx`

#### 2.1 Fix Hero Section Formatting

**Current**:
```tsx
<section className="pt-16 pb-12 relative" style={{ backgroundColor: 'var(--hero-bg)' }}>
```

**Target** (match home page):
```tsx
<section 
  className="relative overflow-hidden w-full"
  style={{
    height: "50vh",
    minHeight: "600px"
  }}
>
  {/* Background image from home page hero as fallback */}
  <div className="absolute inset-0 z-0">
    <Image src={heroBackgroundImage} fill priority ... />
  </div>
  <div className="absolute inset-0 bg-theme-bg/20 z-[1]"></div>
  
  {/* Centered content */}
  <div className="absolute inset-0 flex flex-col items-center justify-center z-10 px-4">
    ...
  </div>
</section>
```

#### 2.2 Remove Quick Links Section

Remove the Quick Links grid (Policies, About, Blog, Contact cards) - already in nav menu.

#### 2.3 Fix CTA Section - Always Render with Defaults

**Current**: Conditional rendering based on DB data
**Target**: Always render with sensible defaults

```tsx
<section className="bg-primary py-16 px-4">
  <h2>
    {ctaSection?.heading || `Connect With Your ${locationName} Team`}
  </h2>
  <Link href={ctaSection?.buttonLink || "/contact"}>
    {ctaSection?.buttonText || "Contact Us Today"}
  </Link>
</section>
```

#### 2.4 Add Alternating Section Backgrounds (mimic home page)

| Section | Background |
|---------|------------|
| Hero | Background image (fallback to home page hero) |
| Intro | `bg-white` |
| Location Info | `bg-theme-bg/30` (alt) |
| Reviews | `bg-white` |
| CTA | `bg-primary` |

---

## Implementation Checklist

### Template (template-coverage-creatives)

#### Home Page
- [ ] Review current section backgrounds in home page components
- [ ] Add alternating backgrounds: white → alt → white → alt pattern
- [ ] Verify visual hierarchy

#### Location Landing Page
- [ ] Update hero section to match home page (50vh, min-height 600px)
- [ ] Fetch home page hero background image as fallback
- [ ] Add background image rendering with Next.js Image
- [ ] Add overlay for text readability
- [ ] Center hero content vertically
- [ ] Remove Quick Links section
- [ ] Make CTA section always render with defaults
- [ ] Add alternating section backgrounds (mimic home page pattern)
- [ ] Test responsive behavior

---

## Files to Modify

### Template Repo (template-coverage-creatives)

| File | Action |
|------|--------|
| `components/home-page/IntroSection.tsx` | Verify/add `bg-white` |
| `components/home-page/HomePoliciesSection.tsx` | Add `bg-theme-bg/30` |
| `components/home-page/TestimonialsWrapper.tsx` | Verify/add `bg-white` |
| `components/home-page/HomeCTA.tsx` | Verify `bg-primary` |
| `components/home-page/FAQPreviewWrapper.tsx` | Add `bg-theme-bg/30` |
| `app/(location)/locations/[slug]/page.tsx` | Major refactor |

---

## Data Flow for Hero Background Image

1. Location page fetches `client_home_page.hero_section.background_image`
2. Uses this as the hero background for location landing pages
3. No location-specific hero image override (for now)

---

## Next Steps

1. ✅ Plan approved
2. Implement home page alternating backgrounds
3. Implement location landing page changes
4. Test and verify
