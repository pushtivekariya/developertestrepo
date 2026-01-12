# Fix Section Background Colors

## Problem Statement

The "Section Background Colors" card in the Branding tab (coverage-nextjs admin) sets:
- `color_background` (Primary Section Background)
- `color_background_alt` (Alternate Section Background)

These values are correctly saved to `client_theme_settings` and converted to CSS variables:
- `--color-background`
- `--color-background-alt`

**Issues:**
1. The navbar incorrectly consumes `--color-background` via `--card-nav-bg`
2. Section components use hardcoded `bg-white` instead of `bg-theme-bg`
3. Some sections use opacity-modified backgrounds (`bg-theme-bg/30`) instead of solid colors

---

## Files to Read

- [x] `styles/globals.css` - CSS variable definitions
- [x] `tailwind.config.ts` - Tailwind theme mappings
- [x] `components/home-page/FAQPreview.tsx` - Uses `bg-white`
- [x] `components/home-page/IntroSection.tsx` - Uses `bg-theme-bg/80`
- [x] `components/home-page/Testimonials.tsx` - Uses `bg-theme-bg/30`
- [x] `components/home-page/GoogleReviews.tsx` - Uses `bg-theme-bg/30`
- [x] `components/home-page/LocationPoliciesSection.tsx` - Uses inline style with CSS var
- [x] `components/home-page/InsuranceCareersSection.tsx` - Uses inline style with CSS var

---

## Files to Edit

1. `styles/globals.css` (line 42)
   - Change `--card-nav-bg: var(--color-background)` to `--card-nav-bg: var(--navbar-bg-color)`

2. `components/home-page/FAQPreview.tsx` (line 51)
   - Change `bg-white` to `bg-theme-bg`

3. `components/home-page/IntroSection.tsx` (line 148)
   - Change `bg-theme-bg/80` to `bg-theme-bg`

4. `components/home-page/Testimonials.tsx` (line 90)
   - Change `bg-theme-bg/30` to `bg-theme-bg-alt`

5. `components/home-page/GoogleReviews.tsx` (line 93)
   - Change `bg-theme-bg/30` to `bg-theme-bg-alt`

---

## Routes Affected

None - this is CSS/styling only.

---

## Types Reused or Created

None.

---

## Tables Touched

None (read-only consumption of existing `client_theme_settings`).

---

## Schema Changes

**No.**

---

## Supabase Access Pattern

N/A - no Supabase changes.

---

## Auth and Permission Checks

N/A.

---

## Tests and Commands

```bash
npm run build
npm run dev
```

Manual verification:
1. Go to admin → Client Website → Branding tab
2. Change "Primary Section Background" color
3. Verify navbar does NOT change
4. Verify FAQ section background changes
5. Verify Intro section background changes
6. Change "Alternate Section Background" color
7. Verify Testimonials section background changes
8. Verify Google Reviews section background changes

---

## Section Background Pattern (Alternating)

Based on actual home page order in `app/(home)/page.tsx`:

| Order | Section | Current | Should Be |
|-------|---------|---------|-----------|
| 1 | HeroSection | overlay | N/A (has own overlay) |
| 2 | IntroSection | `bg-theme-bg/80` | Primary (`bg-theme-bg`) |
| 3 | LocationPoliciesSection | `--loc-section-bg` | Alternate (correct, has override) |
| 4 | Testimonials | `bg-theme-bg/30` | Primary (`bg-theme-bg`) |
| 5 | HomeCTA | gradient | N/A (has own gradient) |
| 6 | FAQPreview | `bg-white` | Alternate (`bg-theme-bg-alt`) |
| 7 | InsuranceCareersSection | `--loc-section-bg` | Primary (`bg-theme-bg`) |

Note: GoogleReviews is inside TestimonialsWrapper, need to verify if it renders separately.

---

## Checklist (Home Page Only)

- [x] 1. Edit `styles/globals.css:42` - change `--card-nav-bg` from `var(--color-background)` to `var(--navbar-bg-color)`
- [x] 2. Edit `components/home-page/IntroSection.tsx:148` - change `bg-theme-bg/80` to `bg-theme-bg`
- [x] 3. Edit `components/home-page/Testimonials.tsx:90` - change `bg-theme-bg/30` to `bg-theme-bg`
- [x] 4. Edit `components/home-page/FAQPreview.tsx:51` - change `bg-white` to `bg-theme-bg-alt`
- [x] 5. Edit `components/home-page/InsuranceCareersSection.tsx:62` - change `var(--loc-section-bg)` to `var(--color-background)`
- [x] 6. Edit `components/home-page/HomeCTA.tsx:114` - change gradient start fallback from `var(--color-primary)` to `var(--color-background-alt)`
- [x] 7. Run `npm run build` to verify no errors
- [ ] 8. Manual verification in browser

---

## Completion Status

**Date:** 2026-01-08

**Files Changed:**
1. `styles/globals.css` - Navbar now uses `--navbar-bg-color` instead of `--color-background`
2. `components/home-page/IntroSection.tsx` - Uses `bg-theme-bg` (Primary)
3. `components/home-page/Testimonials.tsx` - Uses `bg-theme-bg` (Primary)
4. `components/home-page/FAQPreview.tsx` - Uses `bg-theme-bg-alt` (Alternate)
5. `components/home-page/InsuranceCareersSection.tsx` - Uses `var(--color-background)` (Primary)
6. `components/home-page/HomeCTA.tsx` - Gradient start fallback uses `var(--color-background-alt)` (Alternate)

**Build Status:** ✅ Passed
