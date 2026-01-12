# O'Donohoe Template Migration Plan

**Last Updated**: 2026-01-09  
**Status**: SCRIPTS CLEANED - AWAITING FINAL REVIEW

---

## Feature Summary

- **What it does**: Migrate O'Donohoe Next.js site to use the template-coverage-creatives framework
- **Where it lives**: **FORKED** template-coverage-creatives repo + Supabase database
- **What data it touches**: Multiple client_* tables in Supabase for O'Donohoe
- **URL Structure**: **PRESERVE** category-based policy routing (`/policies/[category]/[slug]`) for SEO
- **Deployment**: **SEPARATE FORK** deployed independently from main template

---

## Verified Identifiers (from database)

```
Client ID:   54479ee2-bc32-423e-865b-210572e8a0b0
Website ID:  450504ff-ca72-48c1-a181-0b1e0c6c37b6
Location ID: 27941345-981b-4325-b239-a3204c76dd86
Supabase Project: bxpxxyxctdsyucqpwxrz
```

---

## Fork Strategy (SEO Preservation)

### Why Fork?

The main template uses flat policy URLs (`/policies/[slug]`), but O'Donohoe has **established SEO rankings** with category-based URLs.

**Current O'Donohoe URLs** (MUST preserve exactly):
```
/policies/business-commercial-insurance/[slug]   (15 policies)
/policies/personal-insurance/[slug]              (17 policies)
/policies/optional-niche-insurance/[slug]        (10 policies)
```

**Template URLs** (incompatible):
```
/policies/[slug]
```

**SEO Impact of URL Change:**
- ❌ Loss of existing Google rankings
- ❌ Broken backlinks (404s)
- ❌ 3-6 month recovery period even with 301 redirects
- ❌ ~10-15% ranking loss even with proper redirects

### Fork Approach

1. **Create fork**: New repo from `template-coverage-creatives`
2. **Modify routing**: Change `app/(global)/policies/[slug]/` → `app/(global)/policies/[category]/[slug]/`
3. **Deploy separately**: Independent deployment for O'Donohoe only
4. **Maintain independently**: O'Donohoe-specific routing stays in fork

### Verified: Database `policy_type` Values Match URL Categories

| policy_type value | Count | URL Category |
|-------------------|-------|--------------|
| `business-commercial-insurance` | 15 | `/policies/business-commercial-insurance/` |
| `personal-insurance` | 17 | `/policies/personal-insurance/` |
| `optional-niche-insurance` | 10 | `/policies/optional-niche-insurance/` |

**Total: 42 policies** - All have correct `policy_type` values that match the URL structure.

---

## Architecture Context

Per workflow rules:
- **template-coverage-creatives** owns: UI presentation, layouts, sections, routing
- **coverage-nextjs** owns: Admin dashboards, APIs, client provisioning
- This migration is primarily **database data population** + **template routing modification**

---

## Current Database State (Verified 2026-01-09)

### O'Donohoe `client_websites` - Current Values

| Field | Current Value | Needs Migration? |
|-------|---------------|------------------|
| `latitude` | `null` | ✅ YES |
| `longitude` | `null` | ✅ YES |
| `phone` | `null` | ✅ YES |
| `secondary_phone` | `null` | ✅ YES |
| `sms_phone` | `null` | ✅ YES |
| `email` | `null` | ✅ YES |
| `service_areas` | `[]` (empty) | ✅ YES |
| `social_links` | `{}` (empty) | ✅ YES |
| `business_hours` | `{}` (empty) | ❌ NO - in client_locations |
| `google_tag_id` | `null` | ✅ YES |
| `google_analytics_id` | `null` | ✅ YES |
| `google_ads_id` | `null` | ✅ YES |
| `callrail_swap_script` | `null` | ✅ YES |
| `badges` | `[]` (empty) | ✅ YES |
| `tagline` | `null` | ✅ YES |
| `og_image_url` | `null` | ✅ YES |
| `twitter_image_url` | `null` | ✅ YES |
| `form_placeholders` | `{}` (empty) | ✅ YES |
| `faqs` | `{}` (empty) | ✅ YES |
| `features` | See below | ✅ YES (partial update) |

### Current `features` JSONB (needs update)

```json
{
  "show_blog": true,
  "show_faq_page": true,
  "show_glossary": true,
  "multi_location": false,
  "show_careers_page": true,
  "show_social_links": true,
  "show_agent_network": false,      // CHANGE TO: true
  "show_regional_text": false,      // CHANGE TO: true
  "show_business_hours": true,
  "show_about_description": false   // CHANGE TO: true
}
```

### Other Tables Status

| Table | Status | Notes |
|-------|--------|-------|
| `clients` | ✅ Complete | agency_name, address, city, state, zip populated |
| `client_locations` | ✅ Complete | Has business_hours (09:00-17:00 M-F) |
| `client_theme_settings` | ❌ NO RECORD | Needs INSERT |
| `client_home_page` | ✅ Complete | Hero, intro, services, CTA populated |
| `client_policy_pages` | ✅ Complete | 42 policies with correct policy_type values |
| `client_blogs_content` | ✅ Complete | 13 blog posts |
| `client_team_members` | ✅ Complete | 1 team member |
| `client_page_metadata` | ❌ NO RECORDS | Needs INSERT |
| `client_business_info` | ❌ NO RECORD | Needs INSERT |

---

## Migration Scripts - FINAL STATUS (Updated 2026-01-09)

### Scripts DELETED (no longer in folder)
- ~~`002_odonohoe_business_hours.sql`~~ - DELETED (business_hours already in client_locations)
- ~~`007_odonohoe_faqs.sql`~~ - DELETED (use 015 instead)
- ~~`011_odonohoe_policy_categories.sql`~~ - DELETED (table not used)

### Scripts UPDATED
- `013_odonohoe_business_info.sql` - FIXED: Removed non-existent columns (`years_in_business_text`, `regional_descriptor`)

### Scripts CREATED
- `016_odonohoe_theme_settings.sql` - NEW: Theme colors extracted from O'Donohoe's globals.css

### Current Scripts in `odonohoe_migrations/` (13 total)

| Script | Target Table | Schema Verified | Ready to Apply |
|--------|--------------|-----------------|----------------|
| `001_odonohoe_location_data.sql` | client_websites | ✅ | ✅ |
| `003_odonohoe_social_links.sql` | client_websites | ✅ | ✅ |
| `004_odonohoe_service_areas.sql` | client_websites | ✅ | ✅ |
| `005_odonohoe_analytics_ids.sql` | client_websites | ✅ | ✅ |
| `006_odonohoe_features.sql` | client_websites | ✅ | ✅ |
| `008_odonohoe_badges.sql` | client_websites | ✅ | ✅ |
| `009_odonohoe_tagline.sql` | client_websites | ✅ | ✅ |
| `010_odonohoe_social_images.sql` | client_websites | ✅ | ✅ |
| `012_odonohoe_page_metadata.sql` | client_page_metadata | ✅ | ✅ |
| `013_odonohoe_business_info.sql` | client_business_info | ✅ FIXED | ✅ |
| `014_odonohoe_form_placeholders.sql` | client_websites | ✅ | ✅ |
| `015_odonohoe_faqs_content.sql` | client_websites | ✅ | ✅ |
| `016_odonohoe_theme_settings.sql` | client_theme_settings | ✅ | ✅ |

---

## Schema Verification (Completed 2026-01-09)

### `client_business_info` - VERIFIED

**Actual columns in database:**
```
id, client_id, founding_year, slogan, tagline, service_area_description, 
about_short, about_long, created_at, updated_at
```

**Columns that DO NOT EXIST (removed from script 013):**
- ~~`years_in_business_text`~~ - DOES NOT EXIST
- ~~`regional_descriptor`~~ - DOES NOT EXIST

**Script 013 has been FIXED** to only use existing columns.

### `client_theme_settings` - VERIFIED

**Columns used in script 016 (all verified to exist):**
```
client_id, color_primary, color_primary_foreground, color_secondary, 
color_secondary_foreground, color_accent, color_accent_foreground,
color_background, color_background_alt, color_text_primary, color_text_body,
color_text_muted, divider_color, divider_thickness, divider_style,
font_heading, font_body, font_accent, heading_weight, body_weight
```

### Tables NOT Used (Confirmed)

- **`client_policy_categories`** - NOT USED. Policy categories come from `policy_type` column on `client_policy_pages`
- **`client_faq_page`** - NOT USED. FAQs stored in `client_websites.faqs` JSONB column

---

## Touchpoints

### Routes/Handlers (Fork Modifications)
- `app/(global)/policies/[slug]/` → `app/(global)/policies/[category]/[slug]/`
- `app/(global)/policies/page.tsx` → `app/(global)/policies/[category]/page.tsx`
- Sitemap generation for category-based URLs
- No API changes needed (template is read-only from DB)

### Types
- Reuse existing template types
- No new types needed

### Auth Path
- N/A - Template is public-facing, no auth required

### DB Tables to Modify
- `client_websites` - UPDATE existing record (analytics, service_areas, features, FAQs)
- `client_theme_settings` - INSERT new record
- `client_page_metadata` - INSERT new records
- `client_business_info` - INSERT new record (verify schema first)

### Schema Changes Required
- **NONE** - All required tables exist, just need data population

---

## Supabase Access Pattern

- **Pattern 2 - Server-side with user context** for template data fetching
- RLS enforced via client_id filtering
- No service role access needed

---

## Files to Read

### Template (template-coverage-creatives)
- [x] `app/layout.tsx` - Root layout with theme provider
- [x] `app/(home)/page.tsx` - Homepage structure
- [x] `lib/client.ts` - Client data fetching
- [x] `lib/website.ts` - Website data fetching
- [x] `lib/theme/` - Theme system
- [ ] `app/(global)/policies/[slug]/page.tsx` - Current policy routing
- [ ] `components/policies/` - Policy components

### O'Donohoe Current (odonohoe-nextjs)
- [x] `app/layout.tsx` - Hardcoded values to extract
- [x] `app/page.tsx` - Homepage structure
- [x] `app/policies/` - Category-based routing structure
- [ ] `tailwind.config.ts` - Theme colors to extract

### Migration Scripts
- [x] All 15 scripts in `odonohoe_migrations/`

---

## Files to Edit/Create

### Database Data Scripts (create only - do not apply)
1. Update `006_odonohoe_features.sql` - set `show_agent_network: true`
2. Delete `011_odonohoe_policy_categories.sql` - table not used
3. Update `013_odonohoe_business_info.sql` - verify schema, remove non-existent columns
4. Create `016_odonohoe_theme_settings.sql` - INSERT theme record

### Template Modifications (for O'Donohoe fork)
1. Create fork repo from `template-coverage-creatives`
2. Policy routing: `app/(global)/policies/[category]/[slug]/`
3. Policy category pages: `app/(global)/policies/[category]/page.tsx`
4. Update sitemap generation for category URLs
5. Update internal policy links to use category-based URLs

### Theme Settings
1. Extract colors from O'Donohoe's `tailwind.config.ts`
2. Create INSERT script for `client_theme_settings`

---

## Decisions Made

| Question | Decision |
|----------|----------|
| Schema Migrations | **NOT NEEDED** - Use existing structures (`policy_type` column, `client_websites.faqs`) |
| Business Hours | **SKIP SCRIPT 002** - Already populated in `client_locations` (09:00-17:00 M-F) |
| Feature Flags | **SET `show_agent_network: true`** - O'Donohoe is the only site with this feature |
| Theme Colors | **EXTRACT FROM tailwind.config.ts** - Will create script 016 |
| FAQ Approach | **USE `client_websites.faqs`** - Script 015 populates this JSONB column |

---

## Implementation Checklist

### Phase 1: Data Migration Scripts Cleanup ✅ COMPLETED
- [x] Delete `002_odonohoe_business_hours.sql` - DELETED
- [x] Delete `007_odonohoe_faqs.sql` - DELETED
- [x] Delete `011_odonohoe_policy_categories.sql` - DELETED
- [x] Update `013_odonohoe_business_info.sql` - FIXED (removed non-existent columns)
- [x] Extract theme colors from O'Donohoe's `styles/globals.css`
- [x] Create `016_odonohoe_theme_settings.sql` - CREATED

### Phase 2: Create O'Donohoe Fork (USER HANDLES MANUALLY)
- [ ] Create new repo from `template-coverage-creatives`
- [ ] Configure as separate deployment target

### Phase 3: Fork Routing Modifications (AFTER FORK CREATED)
- [ ] Create `app/(global)/policies/[category]/[slug]/` directory structure
- [ ] Create `app/(global)/policies/[category]/page.tsx` for category landing pages
- [ ] Modify policy page to accept category parameter
- [ ] Update policy fetching to filter by `policy_type` matching `[category]`
- [ ] Update sitemap generation for category URLs
- [ ] Update internal links to use category-based URLs

### Phase 4: Data Population (REQUIRES EXPLICIT APPROVAL)
Scripts to apply in order:
1. `001_odonohoe_location_data.sql` - lat/long, phones, email
2. `003_odonohoe_social_links.sql` - social media links
3. `004_odonohoe_service_areas.sql` - service areas array
4. `005_odonohoe_analytics_ids.sql` - GTM, GA, Google Ads, CallRail
5. `006_odonohoe_features.sql` - feature flags
6. `008_odonohoe_badges.sql` - certification badges
7. `009_odonohoe_tagline.sql` - tagline
8. `010_odonohoe_social_images.sql` - OG/Twitter images
9. `012_odonohoe_page_metadata.sql` - page SEO metadata
10. `013_odonohoe_business_info.sql` - business info
11. `014_odonohoe_form_placeholders.sql` - form placeholders
12. `015_odonohoe_faqs_content.sql` - FAQ content
13. `016_odonohoe_theme_settings.sql` - theme colors/fonts

### Phase 5: Deployment (AFTER DATA + FORK READY)
- [ ] Configure environment variables for O'Donohoe fork
- [ ] Deploy O'Donohoe-specific template build
- [ ] Verify all pages render correctly
- [ ] Test all routes match existing URL structure exactly

---

## Current Status

**Phase 1 COMPLETE** - All migration scripts cleaned, verified, and ready.

### What Was Done
1. ✅ Deleted 3 unused scripts (002, 007, 011)
2. ✅ Fixed script 013 (removed non-existent columns)
3. ✅ Created script 016 (theme settings from O'Donohoe's CSS)
4. ✅ Verified all 13 remaining scripts against actual database schema
5. ✅ Verified policy_type values match URL categories exactly

### What Remains
1. **Phase 2**: You create the fork repo (you said you'll handle manually)
2. **Phase 3**: I modify fork routing for category-based URLs
3. **Phase 4**: Apply data migrations (requires your explicit approval per script)
4. **Phase 5**: Deploy and verify

---

*Document created: 2026-01-09*
*Last updated: 2026-01-09*
*Status: PHASE 1 COMPLETE - AWAITING PHASE 2 (FORK CREATION)*
