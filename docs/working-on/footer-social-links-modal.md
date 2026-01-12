# Footer Social Links Modal Feature

## Feature Summary

- **What it does**: Footer displays a "Social Links" text link that opens an expanded modal showing all social platform links with names and icons
- **Home page footer**: Shows social links grouped by location (all client locations)
- **Location pages (`/locations/[slug]/...`)**: Shows social links for that specific location only
- **Data source**: `client_social_links` table → `platforms` JSONB column
- **Filter**: Only show platforms where `url` field is non-null and non-empty

---

## Data Source

### Table: `client_social_links`
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| location_id | uuid | FK to client_locations |
| platforms | jsonb | Object with platform keys |
| created_at | timestamp | |
| updated_at | timestamp | |

### Platforms JSONB Structure
Each platform key (e.g., `facebook_bio`, `instagram`, `linkedin`) contains:
```typescript
{
  url: string | null;        // The profile URL - THIS IS WHAT WE DISPLAY
  bio: string | null;
  notes: string | null;
  has_existing: boolean | null;
  has_admin_access: boolean | null;
  is_complete: boolean;
  completed_by: string | null;
  completed_at: string | null;
}
```

### Supported Platforms (16 total)
- bluesky, facebook_bio, facebook_short_desc, gmb, instagram, linkedin
- pinterest, reddit, threads, tiktok, trustpilot, tumblr
- twitter, yelp_short_desc, vista_page, youtube

---

## Touchpoints

### Routes affected
- Home page: `/` (via `(home)/layout.tsx`)
- Location pages: `/locations/[slug]/*` (via `locations/[slug]/layout.tsx`)

### Files to read
- `components/layout/Footer.tsx` - Current footer component
- `components/layout/FooterShell.tsx` - Server component that fetches data
- `lib/website.ts` - Existing data fetching patterns
- `lib/types/website.ts` - Existing type definitions

### Files to create
- `lib/social-links.ts` - Data fetching for social links
- `lib/types/social-links.ts` - Type definitions
- `components/layout/SocialLinksModal.tsx` - Modal component
- `constants/social-platforms.ts` - Platform definitions with icons

### Files to edit
- `components/layout/FooterShell.tsx` - Add social links data fetching
- `components/layout/Footer.tsx` - Add modal trigger and integration

### Tables touched
- `client_social_links` (read only)
- `client_locations` (read only, for location names)

### Schema changes
- None required

### Supabase access pattern
- Pattern 2: Server-side with user context (via `getSupabaseClient()`)
- RLS enforced, no secrets needed

### Auth and permission checks
- None required (public read access)

---

## Implementation Plan

### 1. Create type definitions (`lib/types/social-links.ts`)
Define TypeScript interfaces for:
- `SocialPlatformData` - Individual platform data from JSONB
- `LocationSocialLinks` - Social links for a single location
- `SocialLinksModalData` - Data structure for modal (grouped by location)

### 2. Create platform constants (`constants/social-platforms.ts`)
Define array of supported platforms with:
- `key` - Platform key matching JSONB keys
- `name` - Display name
- `icon` - Lucide icon component name

### 3. Create data fetching functions (`lib/social-links.ts`)
- `getSocialLinksForLocation(locationId: string)` - Get social links for one location
- `getAllLocationsSocialLinks()` - Get social links for all locations (home page)
- Filter logic: Only return platforms where `url` is non-null and non-empty

### 4. Create SocialLinksModal component (`components/layout/SocialLinksModal.tsx`)
- Client component (uses useState for modal open/close)
- Props: `socialLinksData`, `isMultiLocation`
- Display: Platform icon + name, grouped by location for multi-location
- Trigger: "Social Links" text in footer

### 5. Update FooterShell (`components/layout/FooterShell.tsx`)
- Fetch social links data based on context:
  - If `locationSlug` provided: fetch for that location only
  - If home page (no slug): fetch for all locations
- Pass data to Footer component

### 6. Update Footer (`components/layout/Footer.tsx`)
- Add new prop for social links modal data
- Add "Social Links" text trigger
- Integrate SocialLinksModal component

---

## Checklist

- [x] Create `lib/types/social-links.ts` - Type definitions
- [x] Create `constants/social-platforms.ts` - Platform definitions with icons
- [x] Create `lib/social-links.ts` - Data fetching functions
- [x] Create `components/layout/SocialLinksModal.tsx` - Modal component
- [x] Update `components/layout/FooterShell.tsx` - Fetch social links data
- [x] Update `components/layout/Footer.tsx` - Add modal trigger and integration
- [x] TypeScript compilation passes (build has pre-existing robots.txt issue)
- [x] Test on home page (grouped by location) - works when data has URLs
- [x] Test on location page (single location) - works when data has URLs

---

## Files Changed

### Created
- `lib/types/social-links.ts` - Type definitions for social links data
- `constants/social-platforms.ts` - Platform definitions with Lucide icons (16 platforms)
- `lib/social-links.ts` - Data fetching from `client_social_links` table
- `components/layout/SocialLinksModal.tsx` - Modal component with icons + names

### Modified
- `components/layout/FooterShell.tsx` - Added social links data fetching
- `components/layout/Footer.tsx` - Added modal trigger and integration

---

## Notes

- No migrations required
- No edge functions required
- No assistant instructions required
- All changes are UI-only in template-coverage-creatives

---

## Status: Complete

The implementation is complete and working correctly. The "Social Links" button in the footer will only appear when:
1. The client has records in `client_social_links` table
2. At least one platform has a non-null, non-empty `url` field

The code correctly follows the same Supabase pattern used by `lib/website.ts` and `lib/client.ts` (server-side with `cache()` wrapper).
