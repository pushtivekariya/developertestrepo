# Location Landing Page Component Mapping: Admin UI → Database → Template

This document maps every location landing page component between the Admin UI (coverage-nextjs) and the Template (template-coverage-creatives).

---

## Location Landing Page Structure

**Template File:** `app/locations/[slug]/page.tsx`

**Render Order:**
1. HeroSection (inline)
2. IntroSection (inline)
3. LocationFeaturedPolicies
4. TestimonialsCarousel
5. CTASection (inline)

---

## 1. HeroSection

### Admin UI
- **Editor File:** `coverage-nextjs/components/admin/client-websites-dashboard/client-website-tabs/location-cards/LocationLandingTab.tsx`
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
- **Table:** `client_location_page`
- **Column:** `hero_section` (JSONB)
- **Structure:**
```json
{
  "heading": "...",
  "subheading": "...",
  "description": { "type": "text", "content": "..." },
  "background_image": { "type": "image", "url": "..." },
  "background_video": { "type": "video", "url": "..." | null },
  "background_media_type": "image" | "video",
  "overlay": { "color": "..." | null, "opacity": 0-100 },
  "title": { "type": "heading", "tag": "h1", "content": "...", "color": "..." },
  "subtitle": { "type": "heading", "tag": "h2", "content": "...", "color": "..." }
}
```
- **Note:** Colors are stored in `title.color` and `subtitle.color` for backward compatibility

### Template Component
- **File:** `template-coverage-creatives/app/locations/[slug]/page.tsx` (inline, lines 359-445)
- **Data Fetch:** `getLocationPageData()` → `client_location_page.hero_section`
- **Fallback:** Falls back to `client_home_page.hero_section` via `getHomePageHeroSettings()` for background media and colors
- **Background Logic (lines 351-357):**
```typescript
const heroBackgroundImage = locationHero?.background_image?.url || heroSettings?.backgroundImage || null;
const heroBackgroundVideo = locationHero?.background_video?.url || heroSettings?.backgroundVideo || null;
const heroMediaType = locationHero?.background_media_type || heroSettings?.backgroundMediaType || 'image';
const heroOverlayOpacity = locationHero?.overlay?.opacity || heroSettings?.overlayOpacity;
const heroTitleColor = locationHero?.title?.color || heroSettings?.titleColor || 'var(--color-primary)';
const heroSubtitleColor = locationHero?.subtitle?.color || heroSettings?.subtitleColor || 'var(--color-text-muted)';
const heroOverlayColor = locationHero?.overlay?.color || heroSettings?.overlayColor || '#000000';
```

### Save Handler
- **Function:** `saveHeroSection()` in `LocationLandingTab.tsx:374-436`
- **Target:** `client_location_page.hero_section`
- **Storage Bucket:** `location-landing-page-images` (images), `location-landing-page-videos` (videos)

---

## 2. IntroSection

### Admin UI
- **Editor File:** `coverage-nextjs/components/admin/client-websites-dashboard/client-website-tabs/location-cards/LocationLandingTab.tsx`
- **Fields:**
  - `heading` → Heading
  - `content` → Content (paragraphs)
  - `imageUrl` → Intro Section Image
  - `imageTag` → Image Caption

### Database
- **Table:** `client_location_page`
- **Column:** `intro_section` (JSONB)
- **Structure:**
```json
{
  "heading": "...",
  "content": "...",
  "imageUrl": "...",
  "imageTag": "..."
}
```
- **Aspect Ratio:** `client_theme_settings.intro_section_aspect_ratio` (shared with home page)

### Template Component
- **File:** `template-coverage-creatives/app/locations/[slug]/page.tsx` (inline, lines 447-492)
- **Data Fetch:** `getLocationPageData()` → `client_location_page.intro_section`
- **Aspect Ratio Fetch:** `getIntroAspectRatio()` → `client_theme_settings.intro_section_aspect_ratio`
- **Background:** `bg-theme-bg/80` → CSS var `--color-background` with 80% opacity
- **Conditional Render:** Only renders if `heading`, `content`, or `imageUrl` exists

### Save Handler
- **Function:** `saveIntroSection()` in `LocationLandingTab.tsx:533-553`
- **Target:** `client_location_page.intro_section`
- **Storage Bucket:** `location-landing-page-images`

---

## 3. LocationFeaturedPolicies

### Admin UI
- **Editor File:** `coverage-nextjs/components/admin/client-websites-dashboard/client-website-tabs/location-cards/LocationLandingTab.tsx`
- **Fields:**
  - `show_section` → Show/Hide Toggle
  - `heading` → Section Heading
  - `subheading` → Section Subheading
  - `featured_policy_ids[]` → Selected Policy IDs (max 4)

### Database
- **Table:** `client_location_page`
- **Column:** `policies_section` (JSONB)
- **Structure:**
```json
{
  "heading": "Featured Insurance Policies",
  "subheading": "Explore coverage options available at this location",
  "featured_policy_ids": ["uuid-1", "uuid-2", "uuid-3", "uuid-4"],
  "show_section": true
}
```
- **Policy Data Source:** `client_policy_pages` (filtered by `location_id` and `published = true`)

### Template Component
- **File:** `template-coverage-creatives/components/location/LocationFeaturedPolicies.tsx`
- **Data Fetch:** 
  - Settings: `getPoliciesSection()` → `client_location_page.policies_section`
  - Policies: `getFeaturedPolicies()` → `client_policy_pages` (by `featured_policy_ids` or defaults)
- **Default Policies:** If no `featured_policy_ids`, shows policies matching slugs: `home`, `auto`, `condo`, `boat`
- **Background:** `bg-white` (hardcoded)
- **Conditional Render:** Hidden if `show_section === false` or no policies found

### Save Handler
- **Function:** `saveSection('policies_section', policiesSection)` in `LocationLandingTab.tsx:1078`
- **Target:** `client_location_page.policies_section`

---

## 4. TestimonialsCarousel

### Admin UI
- **Editor File:** `coverage-nextjs/components/admin/client-websites-dashboard/client-website-tabs/location-cards/LocationLandingTab.tsx`
- **Fields:** Read-only display (sourced from Review Posts tab)
- **Note:** Testimonials are managed in the Review Posts tab, not directly editable here

### Database
- **Table:** `client_locations`
- **Column:** `google_reviews` (JSONB array)
- **Structure:**
```json
[
  {
    "review_name": "Customer Name",
    "review_description": "Review text..."
  }
]
```

### Template Component
- **File:** `template-coverage-creatives/components/location/TestimonialsCarousel.tsx`
- **Data Fetch:** `website?.client_locations?.google_reviews` in page.tsx (lines 343-347)
- **Data Transform:**
```typescript
const testimonials: Testimonial[] = googleReviews.map(review => ({
  name: review.review_name,
  review_text: review.review_description,
}));
```
- **Background:** `bg-theme-bg/30` → CSS var `--color-background` with 30% opacity
- **Features:** Auto-rotate (6s), navigation arrows, dot indicators, 5-star rating display
- **Conditional Render:** Hidden if no testimonials

### Save Handler
- **N/A** - Read-only in LocationLandingTab, managed via Review Posts tab

---

## 5. CTASection

### Admin UI
- **Editor File:** `coverage-nextjs/components/admin/client-websites-dashboard/client-website-tabs/location-cards/LocationLandingTab.tsx`
- **Fields:**
  - `heading` → Heading
  - `buttonText` → Button Text
  - `buttonLink` → Button Link

### Database
- **Table:** `client_location_page`
- **Column:** `cta_section` (JSONB)
- **Structure:**
```json
{
  "heading": "Connect With Your [Location] Team",
  "buttonText": "Contact Us Today",
  "buttonLink": "/contact"
}
```

### Template Component
- **File:** `template-coverage-creatives/app/locations/[slug]/page.tsx` (inline, lines 507-520)
- **Data Fetch:** `getLocationPageData()` → `client_location_page.cta_section`
- **Background:** `bg-primary` → CSS var `--color-primary`
- **Default Values:**
  - Heading: `Connect With Your ${locationName} Team`
  - Button Text: `Contact Us Today`
  - Button Link: `/contact`

### Save Handler
- **Function:** `saveSection('cta_section', ctaSection)` in `LocationLandingTab.tsx:1123`
- **Target:** `client_location_page.cta_section`

---

## 6. SEO Settings

### Admin UI
- **Editor File:** `coverage-nextjs/components/admin/client-websites-dashboard/client-website-tabs/location-cards/LocationLandingTab.tsx`
- **Fields:**
  - `metaTitle` → Meta Title
  - `metaDescription` → Meta Description

### Database
- **Table:** `client_location_page`
- **Columns:** `meta_title`, `meta_description` (TEXT)

### Template Component
- **File:** `template-coverage-creatives/app/locations/[slug]/page.tsx`
- **Data Fetch:** `generateMetadata()` → `client_location_page.meta_title`, `client_location_page.meta_description`
- **Fallback Chain:**
  1. `pageData?.meta_title` / `pageData?.meta_description`
  2. `website.meta_title` / `website.meta_description`
  3. Default: `${locationName} | ${agencyName}` / `Visit ${agencyName} in ${city}, ${state}...`

### Save Handler
- **Function:** `saveSeoFields()` in `LocationLandingTab.tsx:440-472`
- **Target:** `client_location_page.meta_title`, `client_location_page.meta_description`

---

## Summary: Background Color Mapping

| Section | Background | CSS Variable | DB Source | Notes |
|---------|------------|--------------|-----------|-------|
| HeroSection | Media (image/video) + overlay | N/A | `client_location_page.hero_section` | Falls back to home page hero settings |
| IntroSection | Primary (80% opacity) | `--color-background` | `client_theme_settings.color_background` | Uses `bg-theme-bg/80` class |
| LocationFeaturedPolicies | White | N/A (hardcoded) | N/A | `bg-white` |
| TestimonialsCarousel | Primary (30% opacity) | `--color-background` | `client_theme_settings.color_background` | Uses `bg-theme-bg/30` class |
| CTASection | Primary | `--color-primary` | `client_theme_settings.color_primary` | Uses `bg-primary` class |

---

## Data Flow: Location Landing Page

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Admin UI (coverage-nextjs)                   │
│  LocationLandingTab.tsx                                              │
│  ├── Hero Section Editor                                             │
│  ├── Intro Section Editor                                            │
│  ├── Featured Policies Editor                                        │
│  ├── Testimonials (read-only from Review Posts)                      │
│  ├── CTA Section Editor                                              │
│  └── SEO Settings Editor                                             │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         Database (Supabase)                          │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │ client_location_page                                         │    │
│  │ ├── hero_section (JSONB)                                     │    │
│  │ ├── intro_section (JSONB)                                    │    │
│  │ ├── policies_section (JSONB)                                 │    │
│  │ ├── cta_section (JSONB)                                      │    │
│  │ ├── meta_title (TEXT)                                        │    │
│  │ └── meta_description (TEXT)                                  │    │
│  └─────────────────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │ client_locations                                             │    │
│  │ └── google_reviews (JSONB) → Testimonials                    │    │
│  └─────────────────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │ client_policy_pages                                          │    │
│  │ └── (filtered by location_id) → Featured Policies            │    │
│  └─────────────────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │ client_theme_settings                                        │    │
│  │ └── intro_section_aspect_ratio → Intro image sizing          │    │
│  └─────────────────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │ client_home_page                                             │    │
│  │ └── hero_section → Fallback for hero media/colors            │    │
│  └─────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    Template (template-coverage-creatives)            │
│  app/locations/[slug]/page.tsx                                       │
│  ├── HeroSection (inline)                                            │
│  ├── IntroSection (inline)                                           │
│  ├── LocationFeaturedPolicies (component)                            │
│  ├── TestimonialsCarousel (component)                                │
│  └── CTASection (inline)                                             │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Files Reference

### Admin UI (coverage-nextjs)
- `components/admin/client-websites-dashboard/client-website-tabs/location-cards/LocationLandingTab.tsx` - Main editor for all sections

### Template (template-coverage-creatives)
- `app/locations/[slug]/page.tsx` - Location landing page (Hero, Intro, CTA inline)
- `components/location/LocationFeaturedPolicies.tsx` - Featured policies grid
- `components/location/TestimonialsCarousel.tsx` - Testimonials carousel
- `components/location/Link.tsx` - Location-aware link component
- `components/location/LocationProvider.tsx` - Location context provider

### Database Tables
- `client_location_page` - Section content (hero, intro, policies, cta, SEO)
- `client_locations` - Location data and google_reviews
- `client_policy_pages` - Policy pages for featured policies selection
- `client_theme_settings` - Theme colors and intro_section_aspect_ratio
- `client_home_page` - Fallback hero settings

### Storage Buckets
- `location-landing-page-images` - Hero and intro section images
- `location-landing-page-videos` - Hero section videos

---

## Key Differences from Home Page

| Aspect | Home Page | Location Landing Page |
|--------|-----------|----------------------|
| **Database Table** | `client_home_page` | `client_location_page` |
| **Hero Content** | Agency-wide | Location-specific (with home fallback) |
| **Policies Section** | `LocationPoliciesSection` (all locations) | `LocationFeaturedPolicies` (single location) |
| **Testimonials Source** | All locations aggregated | Single location's `google_reviews` |
| **Testimonials Display** | Grid layout | Carousel with auto-rotate |
| **Admin Editor** | `org-cards/homePage/` folder | `location-cards/LocationLandingTab.tsx` |
| **URL Pattern** | `/` | `/locations/[slug]` |
