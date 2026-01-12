# Location Landing Page - FAQ & Careers Sections

## Feature Summary
- Add location-specific FAQ section to location landing pages
- Add location-specific Careers section to location landing pages
- Map color controls to home page section settings

## Touchpoints

### Routes/Handlers
- Template: `app/locations/[slug]/page.tsx`
- Admin UI: `components/admin/client-websites-dashboard/client-website-tabs/location-cards/LocationLandingTab.tsx`

### Types
- Reuse: `QuestionItem` from `org-cards/homePage/types.ts`
- Reuse: `LocationPoliciesSectionSettings` from `lib/types/theme.ts`
- **NEW:** Define `FaqSection` interface (flat structure)
- **NEW:** Define `CareersSection` interface

### Auth Path
- Admin UI uses existing auth via `LocationLandingTab`
- Template is public (no auth)

### DB Tables/Columns
- Table: `client_location_page`
- New columns needed: `faq_section` (JSONB), `careers_section` (JSONB)

### Schema Changes
- YES - Migration required to add columns

---

## Files to Read
1. [x] `template-coverage-creatives/components/home-page/FAQPreview.tsx` - FAQ component structure
2. [x] `template-coverage-creatives/components/home-page/FAQPreviewWrapper.tsx` - FAQ data fetching
3. [x] `template-coverage-creatives/components/home-page/InsuranceCareersSection.tsx` - Careers component structure
4. [x] `coverage-nextjs/components/admin/client-websites-dashboard/client-website-tabs/org-cards/homePage/CommonQuestionsSection.tsx` - FAQ Admin UI
5. [x] `coverage-nextjs/components/admin/client-websites-dashboard/client-website-tabs/location-cards/LocationLandingTab.tsx` - Location Admin UI

## Files to Edit
1. `coverage-nextjs/components/admin/client-websites-dashboard/client-website-tabs/location-cards/LocationLandingTab.tsx` - Add FAQ and Careers sections
2. `template-coverage-creatives/app/locations/[slug]/page.tsx` - Add FAQ and Careers components, update `LocationPageData` interface and select query

## Routes Affected
- `/locations/[slug]` - Location landing page template

## Types Reused
- `QuestionItem` from home page types
- `LocationPoliciesSectionSettings` for careers styling

## Tables Touched
- `client_location_page` - Add `faq_section` and `careers_section` columns
- `client_theme_settings` - Read `location_policies_section_settings` for careers styling

## Schema Changes
- Add `faq_section JSONB` to `client_location_page`
- Add `careers_section JSONB` to `client_location_page`

## Supabase Access Pattern
- Pattern 1 (Client-side browser) for Admin UI
- Pattern 3 (Service role) for template data fetching

## Auth and Permission Checks
- Admin UI: Existing auth in LocationLandingTab
- Template: Public access

---

## Type Definitions

### FaqSection (flat structure - matches Admin UI pattern)
```typescript
interface FaqSection {
  tagline: string;
  subtitle: string;
  description: string;
  questions: QuestionItem[];
  show_section?: boolean;
}

interface QuestionItem {
  question: string;
  answer: string;
}
```

### CareersSection
```typescript
interface CareersSection {
  heading?: string;
  description?: string;
  button_text?: string;
  show_section?: boolean;
}
```

---

## Implementation Checklist

### Phase 1: Migration (Create only - do not apply)
- [ ] Create migration file: `026_add_faq_careers_to_location_page.sql`

### Phase 2: Admin UI (coverage-nextjs)
- [ ] Add `FaqSection` and `CareersSection` interfaces to LocationLandingTab
- [ ] Add `LocationPageData` interface fields: `faq_section`, `careers_section`
- [ ] Add FAQ state: `faqSection`, `originalFaqSection`, `faqHasChanges`
- [ ] Add Careers state: `careersSection`, `originalCareersSection`, `careersHasChanges`
- [ ] Add FAQ section UI (tagline, subtitle, description, questions list with add/remove)
- [ ] Add Careers section UI (heading, description, button text, show toggle)
- [ ] Add save handlers for both sections
- [ ] Add color settings notes for both sections (reference theme settings)

### Phase 3: Template (template-coverage-creatives)
- [ ] Update `LocationPageData` interface to include `faq_section` and `careers_section`
- [ ] Update `getLocationPageData()` select query to fetch new columns
- [ ] Create `LocationFAQSection` component (adapts FAQPreview for flat structure)
- [ ] Create `LocationCareersSection` component (single card for current location, links to `/locations/[slug]/apply`)
- [ ] Add FAQ section to location landing page (after testimonials or before CTA)
- [ ] Add Careers section to location landing page
- [ ] Map FAQ colors to theme CSS variables (same as home page FAQ)
- [ ] Map Careers colors to `--loc-*` CSS variables (same as home page careers)

### Phase 4: Verification
- [ ] TypeScript compiles in both repos
- [ ] Verify end-to-end data flow (Admin saves → Template renders)
- [ ] Test with empty data (sections should not render if no content)

---

## Color Mapping

### FAQ Section
- Section background: `bg-theme-bg-alt` (from theme)
- Text: `text-primary`, `text-theme-body` (from theme)
- Cards: `border-card-border/30`, `bg-white` (from theme)

### Careers Section
- Uses `location_policies_section_settings` from `client_theme_settings`:
  - `--loc-section-bg`
  - `--loc-heading`
  - `--loc-subheading`
  - `--loc-card-bg`
  - `--loc-card-border`
  - `--loc-card-heading`
  - `--loc-card-body`
  - `--loc-accent-line`
  - `--loc-button-bg`
  - `--loc-button-text`

---

## Careers Section Behavior
- **Location landing page:** Shows ONE card for the current location only
- **Links to:** `/locations/[slug]/apply` (current location's apply page)
- **Styling:** Same as home page InsuranceCareersSection (uses `--loc-*` CSS variables)

---

## Status: AWAITING APPROVAL
