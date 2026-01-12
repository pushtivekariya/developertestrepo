# Home Page Component Mapping: Admin UI → Database → Template

This document maps every home page component between the Admin UI (coverage-nextjs) and the Template (template-coverage-creatives).

---

## Home Page Structure

**Template File:** `app/(home)/page.tsx`

**Render Order:**
1. HeroSection
2. IntroSection
3. LocationPoliciesSection
4. Testimonials (TestimonialsWrapper)
5. HomeCTA
6. FAQPreview (FAQPreviewWrapper)
7. InsuranceCareersSection

---

## 1. HeroSection

### Admin UI
- **Editor File:** `coverage-nextjs/components/admin/client-websites-dashboard/client-website-tabs/org-cards/homePage/HeroSection.tsx`
- **Fields:**
  - `mainHeading` → Main Heading text
  - `subHeading` → Sub Heading text
  - `mainHeadingColor` → Main Heading Color
  - `subHeadingColor` → Sub Heading Color
  - `description` → Description text
  - `backgroundMediaType` → 'image' | 'video'
  - `backgroundImage` → Background Image URL
  - `backgroundVideo` → Background Video URL
  - `overlayColor` → Overlay Color
  - `overlayOpacity` → Overlay Opacity (0-100)

### Database
- **Table:** `client_home_page`
- **Column:** `hero_section` (JSONB)
- **Structure:**
```json
{
  "title": { "type": "heading", "tag": "h1", "content": "...", "color": "..." },
  "subtitle": { "type": "heading", "tag": "h2", "content": "...", "color": "..." },
  "description": { "type": "text", "content": "..." },
  "background_image": { "type": "image", "url": "..." },
  "background_video": { "type": "video", "url": "..." },
  "background_media_type": "image" | "video",
  "overlay": { "color": "...", "opacity": 0-100 }
}
```

### Template Component
- **File:** `template-coverage-creatives/components/home-page/HeroSection.tsx`
- **Data Fetch:** `getHeroSection()` → `client_home_page.hero_section`
- **Background:** No hardcoded background color - uses background media

### Save Handler
- **Function:** `handleSaveHero()` in `HomePage.tsx`
- **Target:** `client_home_page.hero_section`

---

## 2. IntroSection

### Admin UI
- **Editor File:** `coverage-nextjs/components/admin/client-websites-dashboard/client-website-tabs/org-cards/homePage/IntroSection.tsx`
- **Fields:**
  - `tag` → Tagline
  - `heading` → Heading
  - `paragraphs[]` → Description Paragraphs
  - `imageTag` → Image Caption
  - `imageUrl` → Intro Section Image
  - `aspectRatio` → Image Aspect Ratio ('4:3' | '1:1' | '16:9')

### Database
- **Table:** `client_home_page`
- **Column:** `intro_section` (JSONB)
- **Structure:**
```json
{
  "image": { "type": "image", "url": "..." },
  "image_tag": { "type": "text", "content": "..." },
  "tagline": { "type": "text", "content": "..." },
  "title": { "type": "heading", "tag": "h2", "content": "..." },
  "description": {
    "type": "paragraphs",
    "paragraphs": {
      "paragraph_1": { "type": "paragraph", "content": "..." },
      "paragraph_2": { "type": "paragraph", "content": "..." }
    }
  }
}
```
- **Aspect Ratio:** `client_theme_settings.intro_section_aspect_ratio`

### Template Component
- **File:** `template-coverage-creatives/components/home-page/IntroSection.tsx`
- **Data Fetch:** `getIntroSection()` → `client_home_page.intro_section`
- **Background:** `bg-theme-bg` → CSS var `--color-background` → `client_theme_settings.color_background`

### Save Handler
- **Function:** `handleSaveIntro()` in `HomePage.tsx`
- **Target:** `client_home_page.intro_section` + `client_theme_settings.intro_section_aspect_ratio`

---

## 3. LocationPoliciesSection

### Admin UI
- **Editor File:** `coverage-nextjs/components/admin/client-websites-dashboard/client-website-tabs/org-cards/homePage/LocationPoliciesSectionEditor.tsx`
- **Fields:**
  - `section_bg_color` → Section Background
  - `badge_bg_color` → Badge Background
  - `badge_text_color` → Badge Text
  - `heading_color` → Heading Color
  - `subheading_color` → Subheading Color
  - `card_bg_color` → Card Background
  - `card_border_color` → Card Border
  - `card_heading_color` → Card Heading
  - `card_body_color` → Card Body
  - `accent_line_color` → Accent Line
  - `link_color` → Link Color
  - `button_bg_color` → Button Background
  - `button_text_color` → Button Text

### Database
- **Table:** `client_theme_settings`
- **Column:** `location_policies_section_settings` (JSONB)
- **Structure:**
```json
{
  "section_bg_color": "#354ab6" | null,
  "badge_bg_color": "..." | null,
  "badge_text_color": "..." | null,
  "heading_color": "..." | null,
  "subheading_color": "..." | null,
  "card_bg_color": "..." | null,
  "card_border_color": "..." | null,
  "card_heading_color": "..." | null,
  "card_body_color": "..." | null,
  "accent_line_color": "..." | null,
  "link_color": "..." | null,
  "button_bg_color": "..." | null,
  "button_text_color": "..." | null
}
```

### CSS Variables (lib/theme/index.ts:152-165)
```typescript
'--loc-section-bg': theme.location_policies_section_settings?.section_bg_color ?? theme.color_background_alt,
'--loc-badge-bg': theme.location_policies_section_settings?.badge_bg_color ?? theme.color_secondary,
'--loc-badge-text': theme.location_policies_section_settings?.badge_text_color ?? theme.color_secondary_foreground,
'--loc-heading': theme.location_policies_section_settings?.heading_color ?? theme.color_primary,
'--loc-subheading': theme.location_policies_section_settings?.subheading_color ?? theme.color_text_body,
'--loc-card-bg': theme.location_policies_section_settings?.card_bg_color ?? theme.color_background,
'--loc-card-border': theme.location_policies_section_settings?.card_border_color ?? '#e2e8f0',
'--loc-card-heading': theme.location_policies_section_settings?.card_heading_color ?? theme.color_primary,
'--loc-card-body': theme.location_policies_section_settings?.card_body_color ?? theme.color_text_body,
'--loc-accent-line': theme.location_policies_section_settings?.accent_line_color ?? theme.color_accent,
'--loc-button-bg': theme.location_policies_section_settings?.button_bg_color ?? theme.color_accent,
'--loc-button-text': theme.location_policies_section_settings?.button_text_color ?? theme.color_accent_foreground,
'--loc-link': theme.location_policies_section_settings?.link_color ?? theme.color_primary,
```

### Template Component
- **File:** `template-coverage-creatives/components/home-page/LocationPoliciesSection.tsx`
- **Data Fetch:** `getSectionSettings()` → `client_theme_settings.location_policies_section_settings`
- **Background Logic (line 86-88):**
```typescript
const sectionStyle = {
  backgroundColor: settings.section_bg_color || 'var(--loc-section-bg)',
};
```
- **ISSUE:** If `settings.section_bg_color` has a value in DB (e.g., `#354ab6`), it uses that directly, bypassing the CSS variable fallback.

### Save Handler
- **Function:** `handleSaveLocationPoliciesSettings()` in `HomePage.tsx:471-494`
- **Target:** `client_theme_settings.location_policies_section_settings`

---

## 4. Testimonials (TestimonialsWrapper)

### Admin UI
- **Editor File:** `coverage-nextjs/components/admin/client-websites-dashboard/client-website-tabs/org-cards/homePage/TestimonialsSection.tsx`
- **Fields:**
  - `tag` → Tag
  - `heading` → Heading
  - `subheading` → Subheading
  - `testimonials[]` → Array of { name, rating, reviewText }
  - `buttonLink1Text` → View Reviews Button Text
  - `buttonLink1Url` → View Reviews Button URL
  - `buttonLink2Text` → Google Reviews Button Text
  - `buttonLink2Url` → Google Reviews Button URL
  - `buttonLink2Description` → Google Reviews Description

### Database
- **Table:** `client_home_page`
- **Column:** `testimonials_section` (JSONB)
- **Structure:**
```json
{
  "tagline": { "type": "tagline", "content": "..." },
  "subtitle": { "tag": "h2", "type": "heading", "content": "..." },
  "description": { "type": "text", "content": "..." },
  "button_link_1": { "url": "...", "text": "...", "type": "button_link" },
  "button_link_2": { "url": "...", "text": "...", "type": "button_link", "content": "..." }
}
```
- **Reviews Source:** `client_locations.google_reviews` (aggregated from all locations)

### Template Component
- **Wrapper:** `template-coverage-creatives/components/home-page/TestimonialsWrapper.tsx`
- **Renderer:** `template-coverage-creatives/components/home-page/Testimonials.tsx`
- **Data Fetch:** 
  - Header: `client_home_page.testimonials_section`
  - Reviews: `client_locations.google_reviews` (all locations)
- **Background (line 90):** `bg-theme-bg` → CSS var `--color-background` → `client_theme_settings.color_background`

### Save Handler
- **Function:** `handleSaveTestimonials()` in `HomePage.tsx`
- **Target:** `client_home_page.testimonials_section`

---

## 5. HomeCTA

### Admin UI
- **Editor File:** `coverage-nextjs/components/admin/client-websites-dashboard/client-website-tabs/org-cards/homePage/CTASection.tsx`
- **Fields:**
  - `subtitle` → Subtitle (Heading)
  - `description` → Description
  - `styles.gradient.backgroundMode` → 'gradient' | 'solid'
  - `styles.gradient.startColor` → Start Color / Background Color
  - `styles.gradient.endColor` → End Color
  - `styles.gradient.direction` → Gradient Direction
  - `styles.card.*` → Card styling options
  - `styles.typography.*` → Typography options
  - `styles.iconContainer.*` → Icon container options
  - `styles.button.*` → Button styling options

### Database
- **Table:** `client_home_page`
- **Column:** `cta_section` (JSONB)
- **Structure:**
```json
{
  "subtitle": { "type": "heading", "tag": "h2", "content": "..." },
  "description": { "type": "text", "content": "..." },
  "styles": {
    "gradient": {
      "backgroundMode": "gradient" | "solid",
      "startColor": "#..." | null,
      "endColor": "#..." | null,
      "direction": "to-r" | "to-l" | "to-t" | "to-b" | "to-br" | "to-bl" | "to-tr" | "to-tl"
    },
    "card": { ... },
    "typography": { ... },
    "iconContainer": { ... },
    "button": { ... }
  }
}
```

### Template Component
- **File:** `template-coverage-creatives/components/home-page/HomeCTA.tsx`
- **Data Fetch:** `getCTASection()` → `client_home_page.cta_section`
- **Background Logic (line 113-118):**
```typescript
const gradientDirection = GRADIENT_MAP[styles?.gradient?.direction || 'to-r'] || 'to right';
const gradientStart = styles?.gradient?.startColor || 'var(--color-background-alt)';
const gradientEnd = styles?.gradient?.endColor || 'var(--color-primary-80)';

const sectionStyle: React.CSSProperties = {
  background: `linear-gradient(${gradientDirection}, ${gradientStart}, ${gradientEnd})`,
};
```
- **ISSUE:** If `styles.gradient.startColor` has a value in DB, it uses that directly, bypassing the CSS variable fallback.

### Save Handler
- **Function:** `handleSaveCTA()` in `HomePage.tsx:289-305`
- **Target:** `client_home_page.cta_section`

---

## 6. FAQPreview (FAQPreviewWrapper)

### Admin UI
- **Editor File:** `coverage-nextjs/components/admin/client-websites-dashboard/client-website-tabs/org-cards/homePage/CommonQuestionsSection.tsx`
- **Fields:**
  - `tagline` → Tagline
  - `subtitle` → Subtitle (Heading)
  - `description` → Description
  - `questions[]` → Array of { question, answer }

### Database
- **Table:** `client_home_page`
- **Column:** `common_questions_section` (JSONB)
- **Structure:**
```json
{
  "tagline": { "type": "text", "content": "..." },
  "subtitle": { "type": "heading", "tag": "h2", "content": "..." },
  "description": { "type": "text", "content": "..." },
  "questions": {
    "type": "list",
    "items": [
      { "question": "...", "answer": "..." }
    ]
  }
}
```

### Template Component
- **Wrapper:** `template-coverage-creatives/components/home-page/FAQPreviewWrapper.tsx`
- **Renderer:** `template-coverage-creatives/components/home-page/FAQPreview.tsx`
- **Data Fetch:** `getCommonQuestionsSection()` → `client_home_page.common_questions_section`
- **Background (line 51):** `bg-theme-bg-alt` → CSS var `--color-background-alt` → `client_theme_settings.color_background_alt`

### Save Handler
- **Function:** `handleSaveCommonQuestions()` in `HomePage.tsx:307-326`
- **Target:** `client_home_page.common_questions_section`

---

## 7. InsuranceCareersSection

### Admin UI
- **Editor File:** SAME AS LocationPoliciesSection - `LocationPoliciesSectionEditor.tsx`
- **Fields:** Same as LocationPoliciesSection (shared settings)

### Database
- **Table:** `client_theme_settings`
- **Column:** `location_policies_section_settings` (JSONB) - **SHARED with LocationPoliciesSection**

### Template Component
- **File:** `template-coverage-creatives/components/home-page/InsuranceCareersSection.tsx`
- **Data Fetch:** `getSectionSettings()` → `client_theme_settings.location_policies_section_settings`
- **Background Logic (line 61-63):**
```typescript
const sectionStyle = {
  backgroundColor: settings.section_bg_color || 'var(--loc-section-bg)',
};
```
- **ISSUE:** Same as LocationPoliciesSection - uses DB value directly if set, bypassing CSS variable.

### Save Handler
- **Function:** `handleSaveLocationPoliciesSettings()` in `HomePage.tsx:471-494`
- **Target:** `client_theme_settings.location_policies_section_settings`

---

## Summary: Background Color Mapping

| Section | Expected Background | Admin UI Control | CSS Variable | DB Column | Current Issue |
|---------|---------------------|------------------|--------------|-----------|---------------|
| IntroSection | Primary | Branding → Primary Section Background | `--color-background` | `client_theme_settings.color_background` | ✅ Uses `bg-theme-bg` class |
| LocationPoliciesSection | Alternate | LocationPoliciesSectionEditor → Section Background | `--loc-section-bg` | `client_theme_settings.location_policies_section_settings.section_bg_color` | ❌ DB value `#354ab6` overrides CSS var |
| Testimonials | Primary | Branding → Primary Section Background | `--color-background` | `client_theme_settings.color_background` | ✅ Uses `bg-theme-bg` class |
| HomeCTA | Gradient (Alt start) | CTASection → Section Styling → Start Color | `--color-background-alt` | `client_home_page.cta_section.styles.gradient.startColor` | ❌ DB value overrides CSS var if set |
| FAQPreview | Alternate | Branding → Alternate Section Background | `--color-background-alt` | `client_theme_settings.color_background_alt` | ✅ Uses `bg-theme-bg-alt` class |
| InsuranceCareersSection | Primary | LocationPoliciesSectionEditor → Section Background (shared) | `--loc-section-bg` | `client_theme_settings.location_policies_section_settings.section_bg_color` | ❌ DB value `#354ab6` overrides CSS var |

---

## Root Cause Analysis

The sections that are NOT responding to global branding colors have **hardcoded values stored in the database** that take precedence over CSS variable fallbacks:

1. **LocationPoliciesSection** - `location_policies_section_settings.section_bg_color = '#354ab6'`
2. **InsuranceCareersSection** - Uses same settings as above
3. **HomeCTA** - `cta_section.styles.gradient.startColor` may have a value stored

The CSS variable fallback only kicks in when the database value is `null`.

---

## [DECISION REQUIRED]

**Options to fix:**

### Option A: Clear DB overrides
Set `section_bg_color` to `null` in `location_policies_section_settings` and `startColor` to `null` in `cta_section.styles.gradient` so CSS variables are used.

### Option B: Change template logic
Remove the DB value check and always use CSS variables:
```typescript
// Instead of:
backgroundColor: settings.section_bg_color || 'var(--loc-section-bg)',
// Use:
backgroundColor: 'var(--loc-section-bg)',
```
This would remove the ability to override per-section.

### Option C: Fix Admin UI ColorPicker
When user selects "Theme Default" in LocationPoliciesSectionEditor, ensure it saves `null` to the database. Currently it does this, but the existing data has hardcoded values.

**Recommended:** Option A (clear existing DB values) + verify Option C works correctly for future changes.

---

## Files Reference

### Admin UI (coverage-nextjs)
- `components/admin/client-websites-dashboard/client-website-tabs/org-cards/homePage/HomePage.tsx` - Main editor container
- `components/admin/client-websites-dashboard/client-website-tabs/org-cards/homePage/HeroSection.tsx`
- `components/admin/client-websites-dashboard/client-website-tabs/org-cards/homePage/IntroSection.tsx`
- `components/admin/client-websites-dashboard/client-website-tabs/org-cards/homePage/LocationPoliciesSectionEditor.tsx`
- `components/admin/client-websites-dashboard/client-website-tabs/org-cards/homePage/TestimonialsSection.tsx`
- `components/admin/client-websites-dashboard/client-website-tabs/org-cards/homePage/CTASection.tsx`
- `components/admin/client-websites-dashboard/client-website-tabs/org-cards/homePage/CommonQuestionsSection.tsx`

### Template (template-coverage-creatives)
- `app/(home)/page.tsx` - Home page layout
- `components/home-page/HeroSection.tsx`
- `components/home-page/IntroSection.tsx`
- `components/home-page/LocationPoliciesSection.tsx`
- `components/home-page/TestimonialsWrapper.tsx` + `Testimonials.tsx`
- `components/home-page/HomeCTA.tsx`
- `components/home-page/FAQPreviewWrapper.tsx` + `FAQPreview.tsx`
- `components/home-page/InsuranceCareersSection.tsx`
- `lib/theme/index.ts` - CSS variable definitions

### Database Tables
- `client_home_page` - Section content (hero, intro, testimonials, cta, common_questions)
- `client_theme_settings` - Theme colors and section styling overrides
- `client_locations` - Location data and google_reviews
