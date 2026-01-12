# Location Landing Page - Template

## Overview

The location landing page displays at `/locations/[slug]` for multi-location clients. Single-location clients receive a 404.

---

## Route Structure

```
app/(location)/locations/
├── page.tsx              # Locations index (lists all locations)
└── [slug]/
    ├── page.tsx          # Location landing page ← THIS FILE
    ├── about/page.tsx    # Location-specific about
    ├── policies/page.tsx # Location-specific policies
    ├── blog/page.tsx     # Location-specific blog
    └── contact/page.tsx  # Location-specific contact
```

---

## Data Sources

| Source | Table | Data |
|--------|-------|------|
| Location info | `client_locations` | address, phone, email, city, state |
| Website config | `client_websites` | business_hours, meta info |
| **Page content** | `client_location_page` | hero, intro, services, reviews, cta, SEO |

---

## How It Works

### 1. Multi-Location Check
```typescript
const multiLocation = await isMultiLocation();
if (!multiLocation) {
  notFound(); // Single-location clients get 404
}
```

### 2. Fetch Data
```typescript
const website = await getWebsiteBySlug(slug);        // From client_locations + client_websites
const pageData = await getLocationPageData(locationId); // From client_location_page
```

### 3. Render with Fallbacks
- If `pageData.hero_section.heading` exists → use it
- Otherwise → fall back to `locationName`

---

## JSONB Sections

| Section | Fields | Notes |
|---------|--------|-------|
| `hero_section` | heading, subheading | Falls back to location name |
| `intro_section` | heading, content | Only renders if content exists |
| `services_section` | heading, description | Preview/highlights |
| `reviews_section` | heading, reviews[] | Array of {name, text, rating} |
| `cta_section` | heading, buttonText, buttonLink | Only renders if heading exists |

---

## Navigation

When on a location page, the nav links are prefixed:

| Nav Item | Route |
|----------|-------|
| Home | `/locations/[slug]` |
| About | `/locations/[slug]/about` |
| Policies | `/locations/[slug]/policies` |
| Contact | `/locations/[slug]/contact` |
| Locations | `/locations` (global) |

This is handled by `LocationProvider` and the custom `Link` component.

---

## Files

| File | Purpose |
|------|---------|
| `app/(location)/locations/[slug]/page.tsx` | Main landing page |
| `lib/website.ts` | `getWebsiteBySlug()`, `isMultiLocation()` |
| `components/location/LocationProvider.tsx` | Location context |
| `components/location/Link.tsx` | Location-aware links |

---

## SEO

Meta title/description priority:
1. `client_location_page.meta_title` / `meta_description`
2. `client_websites.meta_title` / `meta_description`
3. Auto-generated: `{locationName} | {agencyName}`
