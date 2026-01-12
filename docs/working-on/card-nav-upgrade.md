# Card Nav Upgrade Implementation Plan

## Overview

Upgrade the HeaderBar component to use a card-style expansion pattern (inspired by React Bits CardNav) instead of traditional dropdowns and hamburger menus.

---

## Current State

### Files Involved
- `components/layout/HeaderBar.tsx` - Main navbar component
- `components/layout/HeaderShell.tsx` - Server component wrapper
- `styles/globals.css` - Header CSS styles
- `app/(home)/layout.tsx` - Home page layout (no locationPrefix)
- `app/locations/[slug]/layout.tsx` - Location page layout (with locationPrefix)

### Current Behavior
- **Home route (multi-location):** Shows Home link + Locations dropdown
- **Location route:** Shows full nav (Home, About, Policies, Our Team, Blog, Glossary, FAQ, Apply, Contact) with hamburger menu on mobile

---

## Intended State

### Home Route (multi-location, no locationPrefix)
- Top bar: Logo, Hamburger toggle, CTA phone button
- Expanded state: Each location as its own card (e.g., "Houston, TX" card, "Dallas, TX" card)
- Search card: Integrated as a card with search input

### Location Route (with locationPrefix)
- Top bar: Logo, Hamburger toggle, CTA phone button
- Expanded state: 3 cards
  - **Card 1 "Insurance":** Policies link
  - **Card 2 "Resources":** Blog, Glossary, FAQ links
  - **Card 3 "Company":** About, Our Team, Contact, Apply links
- Search card: Integrated as a 4th card with search input

---

## Technical Approach

### Animation (GSAP + Tailwind)
- GSAP timeline for container height animation
- GSAP staggered card reveal (slide up + fade in)
- Smooth reverse animation on close
- Physics-based easing for professional feel

### Theming
- All colors mapped to existing CSS custom properties
- New CSS variables for card-specific styling (if needed)
- No hardcoded colors

### Dependencies
- **Add:** `gsap` (for animations)
- Uses existing: React, Next.js, Lucide icons, Tailwind

---

## Files to Read
- [x] `components/layout/HeaderBar.tsx`
- [x] `components/layout/HeaderShell.tsx`
- [x] `styles/globals.css`
- [x] `app/(home)/layout.tsx`
- [x] `app/locations/[slug]/layout.tsx`
- [x] React Bits CardNav reference

## Files to Edit
- [ ] `components/layout/HeaderBar.tsx` - Major refactor
- [ ] `styles/globals.css` - Add card animation styles

## Files to Create
- [ ] None (all changes in existing files)

---

## Routes Affected
- All routes using HeaderShell (home and location layouts)

## Types Reused
- `NavbarSettings`, `CtaSettings` from `@/lib/types/theme`
- `LocationItem` interface (existing in HeaderBar)

## Types to Create
- `NavCard` interface for card configuration

## Tables Touched
- None (read-only, existing data)

## Schema Changes
- None

## Supabase Access Pattern
- No change (existing server-side reads via HeaderShell)

## Auth/Permissions
- None (public navbar)

---

## Implementation Checklist

### Phase 1: Dependencies & CSS Foundation
- [x] Add GSAP dependency to package.json
- [x] Add card container styles to globals.css
- [x] Add CSS variables for card colors (mapped to theme)

### Phase 2: HeaderBar Refactor
- [x] Create NavCard type interface
- [x] Add card expansion state management
- [x] Build card container component (replaces dropdown/mobile menu)
- [x] Implement location cards for home route
- [x] Implement nav cards for location route (Insurance, Resources, Company)
- [x] Implement search card with input field
- [x] Wire up hamburger toggle to card expansion
- [x] Maintain CTA phone button in top bar
- [x] Ensure responsive behavior (mobile/desktop unified)

### Phase 3: Testing & Verification
- [ ] Test home route card expansion (locations)
- [ ] Test location route card expansion (nav groups)
- [ ] Test search card functionality
- [ ] Test mobile responsiveness
- [ ] Test theme CSS variable integration
- [ ] Verify no regressions in existing functionality
- [ ] Lint and typecheck pass

---

## Clarity Questions - RESOLVED

1. **Card layout on desktop:** Horizontal (side by side) 
2. **Search card position:** Last card (far right) 
3. **Card max-width:** Normal card size (like CTA section, NOT 800px max) 
4. **Hamburger position:** Right side 

---

## Commands to Run
```bash
cd c:\Users\Andrew\Desktop\template-coverage-creatives
npm run lint
npm run build
```

---

## Status
**Awaiting user approval to begin implementation**

