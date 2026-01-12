# Routing Architecture Update Plan

**Created:** December 5, 2025  
**Updated:** December 5, 2025 (Full Review Complete)  
**Status:** FINAL APPROACH DETERMINED

---

## Executive Summary

When transitioning a client from single-location to multi-location, existing content URLs become invalid. This document analyzes all affected areas and presents the solution.

### Key Findings

1. **AI Assistants are fine** - They only output content and slugs, no URLs
2. **Edge Functions build URLs** - They embed URLs into LD-JSON at generation time
3. **Frontend already has fallback logic** - Pages build fresh LD-JSON if stored version is missing
4. **Location data is always available** - `client_locations` has all needed data (city, state, service_areas, location_slug)

### The Solution

**Don't store URLs in LD-JSON. Always build LD-JSON fresh at render time.**

The frontend already has all the data needed:
- Content pieces from database (title, description, faqs)
- Location data from `client_locations` (city, state, service_areas, address)
- Multi-location status via `isMultiLocation()`
- URL building via `buildPageUrl()`

---

## Current Architecture

### Content Generation Flow

```
1. Edge Function receives request
         ↓
2. Fetches location data (city, state, service_areas)
         ↓
3. Sends payload to AI Assistant:
   - location_city, location_state, service_areas
   - agency_name, topic/policy info
         ↓
4. AI Assistant returns JSON:
   - title, slug, content_sections, faqs
   - related_policies (with slugs only)
   - NO URLs, NO LD-JSON
         ↓
5. Edge Function BUILDS:
   - Full URL via buildContentUrl()
   - LD-JSON schema via buildLdJson()
         ↓
6. Edge Function STORES to database:
   - Content + location_id + ld_json (with URL embedded)
```

### What AI Assistants Output (NO URLs)

| Assistant | Output Fields | URL Handling |
|-----------|--------------|--------------|
| Policy Page Assistant | title, slug, content_sections, faqs, related_policies | Outputs slugs only |
| Static Blog Assistant | title, slug, content_sections, related_links | Outputs slugs/URLs for links |
| YT Script Assistant | script content | No URLs |

### What Edge Functions Do (BUILDS URLs)

| Edge Function | URL Builder | Stores URL? |
|---------------|-------------|-------------|
| generate-policy-pages | `buildContentUrl()` | YES in ld_json |
| generate-policy-pages-2 | `buildContentUrl()` | YES in ld_json |
| generate-static-blog | `buildBlogUrl()` | YES in ld_json |
| generate-yt-script | None | No |

### How URLs Are Built

| Component | URL Building Method | Stored in DB? |
|-----------|---------------------|---------------|
| Frontend Pages | Built at render time from slugs | No |
| Sitemap | Built at runtime, checks `isMultiLocation()` | No |
| LD-JSON (edge functions) | Built at content generation | **YES** |
| Breadcrumb schemas | Built at render time | No |
| Related Posts links | Built from slugs at render time | No |
| Related Policy links | Built from slugs at render time | No |

### Key Finding

**Most links are built dynamically at render time** - this is good. The frontend doesn't rely on stored URLs for navigation.

**BUT: LD-JSON schemas store full URLs** - this is the problem area.

---

## What Breaks When Going Multi-Location

### 1. LD-JSON URLs in Database

**Tables Affected:**
- `client_policy_pages.ld_json` - Contains full URLs like `https://example.com/policies/auto/coverage`
- `client_blogs_content.ld_json` - Contains full URLs like `https://example.com/blog/topic/post`

**The Problem:**
When a second location is added, these should become:
- `https://example.com/locations/houston-tx/policies/auto/coverage`

But they remain as the old single-location URLs.

### 2. Content Without location_id

**Tables Affected:**
- `client_policy_pages` - May have NULL `location_id`
- `client_blogs_content` - May have NULL `location_id`
- `client_insurance_glossary` - Doesn't have `location_id` column yet
- `client_static_blog_list` - Doesn't have `location_id` column yet

**The Problem:**
Content created before multi-location support doesn't know which location it belongs to.

### 3. Feature Flags Not Synced

**Existing Trigger (Migration 003):**
- When a NEW location is added, only THAT location's website gets `multi_location: true`
- The FIRST location's website still has `multi_location: false`

**The Problem:**
Navigation shows "Locations" link inconsistently across location websites.

---

## Files That Handle Routing

### Frontend Routes (35 total pages)

**Global Routes (app/(global)/):**
- `/` - Home
- `/about`
- `/apply`
- `/blog` → `/blog/[topic]` → `/blog/[topic]/[slug]`
- `/contact`
- `/faq`
- `/glossary` → `/glossary/[slug]`
- `/locations`
- `/our-team` → `/our-team/[slug]`
- `/policies` → `/policies/[category]` → `/policies/[category]/[slug]`
- `/privacy`

**Location Routes (app/(location)/locations/[slug]/):**
- Same structure as global, prefixed with `/locations/[slug]/`
- 18 location-specific pages

### Edge Functions (Content Generators)

| Function | Stores Full URL? | Location |
|----------|------------------|----------|
| `generate-policy-pages` | YES in ld_json | `supabase/migrations/edge-functions/` |
| `generate-policy-pages-2` | YES in ld_json | `supabase/migrations/edge-functions/` |
| `generate-static-blog` | YES in ld_json | `supabase/migrations/edge-functions/` |
| `generate-yt-script` | No | `supabase/migrations/edge-functions/` |

### Supporting Files

| File | Purpose | Affected? |
|------|---------|-----------|
| `lib/structured-data.ts` | Builds LD-JSON helpers | No changes needed |
| `lib/website.ts` | `isMultiLocation()`, `getFeatures()` | No changes needed |
| `lib/blog.ts` | Blog data fetching | No changes needed |
| `lib/policy-categories.ts` | Policy data fetching | No changes needed |
| `app/sitemap.xml/route.ts` | Generates sitemap | Already handles multi-location |
| `app/robots.txt/route.ts` | Generates robots.txt | No changes needed |
| `components/layout/HeaderBar.tsx` | Navigation | Already updated with feature flags |
| `components/layout/HeaderShell.tsx` | Header wrapper | Already updated to pass features |

---

## Database Tables Affected

### Tables That Store URLs

| Table | Column | Contains URLs? |
|-------|--------|----------------|
| `client_policy_pages` | `ld_json` | YES - full URLs |
| `client_blogs_content` | `ld_json` | YES - full URLs |
| `client_websites` | `canonical_url` | Base URL only (OK) |

### Tables That Need location_id Support

| Table | Has location_id? | Status |
|-------|------------------|--------|
| `client_policy_pages` | YES | Existing |
| `client_blogs_content` | YES | Existing |
| `client_insurance_glossary` | NO | Migration 013 adds it |
| `client_static_blog_list` | NO | Migration 014 adds it |
| `client_locations` | N/A (is the location table) | OK |

---

## Final Solution: Build LD-JSON at Render Time

### Philosophy

**Store content components. Build LD-JSON fresh at render time.**

Instead of storing a complete LD-JSON blob with embedded URLs, the system will:
1. Store content pieces in separate columns (already done)
2. Build LD-JSON at page render using current location data
3. URLs are always correct because they're built from current state

### Why This Works

**Location data is always available:**
- Even single-location clients have a `client_locations` record
- That record has `location_slug`, `service_areas`, address, phone
- Content is linked via `location_id`
- Frontend can always look up location data

**Frontend already has fallback logic:**
```
Current code: policy.ld_json || { ...build fresh... }
```

The fallback already builds correct LD-JSON. We just need to make it ALWAYS use the fresh build.

### Implementation Options

#### Option A: Stop Storing ld_json in Edge Functions (Recommended)

**Edge Functions:**
- Remove `buildLdJson()` calls
- Don't store anything in `ld_json` column
- Frontend fallback will always be used

**Frontend:**
- No changes needed - fallback logic already works
- Fresh LD-JSON is built with:
  - Correct URL based on current route
  - Current location data (address, phone)
  - Data from content columns (title, description, faqs)

#### Option B: Always Build Fresh in Frontend

**Edge Functions:**
- No changes (can keep storing ld_json)

**Frontend:**
- Remove `policy.ld_json ||` check
- Always build LD-JSON from components
- Ignore stored ld_json entirely

### Recommended Approach: Option A

Stop storing `ld_json` in edge functions. This is cleaner because:
- No stale data sitting in database
- Frontend code already handles it
- Less data stored per record

---

## Implementation Plan

### Phase 1: Update Edge Functions (Remove ld_json Storage)

**Files to modify:**

| File | Change |
|------|--------|
| `generate-policy-pages/index.ts` | Remove `buildLdJson()` call, remove `ldjson` from insert |
| `generate-policy-pages-2/index.ts` | Same |
| `generate-static-blog/index.ts` | Remove `buildLdJson()` call, remove `ld_json` from insert |

**Keep these functions for reference** (or delete):
- `buildContentUrl()` - No longer needed
- `buildBlogUrl()` - No longer needed
- `buildLdJson()` - No longer needed

### Phase 2: New Migration for Multi-Location Flag Sync

**Create:** `016_sync_multi_location_flag.sql`

When a location is added/removed, update `multi_location` feature flag on ALL websites for that client.

```sql
-- When location count changes, sync multi_location flag across all client websites
```

### Phase 3: Verify Frontend (No Changes Expected)

**Pages that use ld_json fallback:**
- `app/(global)/policies/[category]/[slug]/page.tsx` ✓
- `app/(global)/blog/[topic]/[slug]/page.tsx` ✓
- `app/(location)/locations/[slug]/policies/[category]/[policySlug]/page.tsx` ✓
- `app/(location)/locations/[slug]/blog/[topic]/[postSlug]/page.tsx` ✓

All 4 pages have fallback logic that builds fresh LD-JSON. Once edge functions stop storing `ld_json`, the fallback will always be used.

### Phase 4: Apply Existing Migrations

Apply the 4 migrations already created:
- `012_add_service_areas_to_locations.sql`
- `013_add_location_support_glossary.sql`
- `014_add_location_support_blog_list.sql`
- `015_sync_location_count_trigger.sql`

### Phase 5: Backfill (If Needed)

If any existing content is missing `location_id`:
```sql
-- Set location_id on content that doesn't have it
UPDATE client_policy_pages 
SET location_id = (
  SELECT id FROM client_locations 
  WHERE client_locations.client_id = client_policy_pages.client_id 
  AND is_active = true 
  LIMIT 1
)
WHERE location_id IS NULL;

-- Same for blogs
UPDATE client_blogs_content 
SET location_id = (
  SELECT id FROM client_locations 
  WHERE client_locations.client_id = client_blogs_content.client_id 
  AND is_active = true 
  LIMIT 1
)
WHERE location_id IS NULL;
```

---

## Summary: What Changes vs What Stays

### NO Changes Needed

| Component | Reason |
|-----------|--------|
| AI Assistants | Already output slugs only, no URLs |
| Frontend route structure | Already correct |
| Sitemap | Already builds URLs dynamically |
| Navigation | Already updated with feature flags |
| Content columns | Already store all needed pieces |

### Changes Needed

| Component | Change |
|-----------|--------|
| Edge Functions (3 files) | Stop storing ld_json |
| Database Trigger | Sync multi_location flag on ALL websites |
| Migrations (4 files) | Apply when ready |

---

## Checklist

### Already Complete
- [x] Migration 012: Add `service_areas` to `client_locations`
- [x] Migration 013: Add `location_id` to `client_insurance_glossary`
- [x] Migration 014: Add `location_id` to `client_static_blog_list`
- [x] Migration 015: Sync `number_of_locations` trigger
- [x] HeaderBar updated with feature flags
- [x] HeaderShell passes features to HeaderBar
- [x] All multi-location route pages created

### To Do
- [x] Update `generate-policy-pages/index.ts` - Remove ld_json storage ✓
- [x] Update `generate-policy-pages-2/index.ts` - Remove ld_json storage ✓
- [x] Update `generate-static-blog/index.ts` - Remove ld_json storage ✓
- [x] Create Migration 016: Sync multi_location flag on all client websites ✓
- [ ] Apply migrations 012-016 (DO NOT APPLY YET)
- [ ] Run backfill script for any content missing location_id (DEFERRED)

---

## Appendix: Files Reference

### Edge Functions to Modify

**1. generate-policy-pages/index.ts**
```
Location: supabase/migrations/edge-functions/generate-policy-pages/index.ts

Remove:
- buildContentUrl() function call
- buildLdJson() function call
- 'ldjson' field from insert data
```

**2. generate-policy-pages-2/index.ts**
```
Location: supabase/migrations/edge-functions/generate-policy-pages-2/index.ts

Same changes as above
```

**3. generate-static-blog/index.ts**
```
Location: supabase/migrations/edge-functions/generate-static-blog/index.ts

Remove:
- buildBlogUrl() function call
- buildLdJson() function call
- 'ld_json' field from insert data
```

### AI Assistants (NO CHANGES)

| Assistant | Status |
|-----------|--------|
| Policy Page Assistant (v2) | ✓ Outputs slugs only |
| Static Blog Assistant (v2) | ✓ Outputs slugs only |
| YT Script Assistant | ✓ No URLs |

### Frontend Pages (NO CHANGES - Already Have Fallback)

| Page | Current Code |
|------|-------------|
| Global Policy | `policy.ld_json \|\| { fresh build }` |
| Global Blog | `postData.ld_json \|\| { fresh build }` |
| Location Policy | `policy.ld_json \|\| { fresh build }` |
| Location Blog | `postData.ld_json \|\| { fresh build }` |

All pages will automatically use fresh build once ld_json stops being stored.

---

*Document prepared by Jarvis - December 5, 2025*
