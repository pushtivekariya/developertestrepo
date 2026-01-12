# SEO, ISR & Next.js Analysis Report

**Repository:** `template-coverage-creatives`  
**Analysis Date:** December 21, 2025  
**Analyst:** Jarvis

---

## Executive Summary

This document outlines all SEO, ISR (Incremental Static Regeneration), and Next.js optimization findings for the multitenant website template. The analysis covers LD-JSON structured data, metadata generation, caching strategies, sitemap/robots configuration, and general SEO best practices.

**Total Issues Found:** 18  
- 🔴 Critical: 4  
- 🟠 High Priority: 6  
- 🟡 Medium Priority: 5  
- 🟢 Low Priority: 3

---

## Table of Contents

1. [Project Structure Overview](#1-project-structure-overview)
2. [LD-JSON Structured Data Issues](#2-ld-json-structured-data-issues)
3. [ISR/SSG Configuration Issues](#3-isrssg-configuration-issues)
4. [Metadata Generation Issues](#4-metadata-generation-issues)
5. [Sitemap & Robots.txt Issues](#5-sitemap--robotstxt-issues)
6. [Additional SEO Observations](#6-additional-seo-observations)
7. [Issue Summary Table](#7-issue-summary-table)
8. [Recommended Fix Priority](#8-recommended-fix-priority)

---

## 1. Project Structure Overview

### Current Architecture

- **Framework:** Next.js App Router (v15.3.0+)
- **Route Groups:** 
  - `(global)` - Main site pages
  - `(location)` - Multi-location support
- **Database:** Supabase (PostgreSQL)
- **Styling:** TailwindCSS with theme variables
- **ISR Strategy:** 1-hour revalidation (`revalidate = 3600`)

### Strengths ✅

| Area | Implementation |
|------|----------------|
| Route Organization | Clean separation via route groups |
| Database Integration | Proper client/location filtering |
| Theme System | Dynamic CSS variables from database |
| Multi-tenancy | NEXT_PUBLIC_CLIENT_ID-based isolation |

---

## 2. LD-JSON Structured Data Issues

### 2.1 Schema Types by Page

| Page Type | Schema Types Used | Status |
|-----------|-------------------|--------|
| Root Layout | `InsuranceAgency` | ✅ Good |
| Policy Pages | `@graph` with `InsuranceAgency`, `Service`, `FAQPage` + `BreadcrumbList` | ✅ Good |
| Blog Posts | Database-driven + `BreadcrumbList` | ⚠️ Fallback issue |
| Blog Topic Pages | `Blog` + `BreadcrumbList` | ⚠️ Hardcoded hours |
| Glossary Terms | `DefinedTerm` + `BreadcrumbList` | ✅ Good |
| FAQ Page | `FAQPage` | ✅ Good |
| About Page | `AboutPage` with `Organization` | ✅ Good |
| Contact Page | `InsuranceAgency` with `ContactPoint` | ⚠️ Hardcoded hours |
| Team Members | `Person` | 🔴 Rendering bug |
| Team Index | `AboutPage` with `ProfessionalService` | 🔴 Rendering bug |
| Search Page | `InsuranceAgency` | ⚠️ Hardcoded hours |
| 404 Page | `WebPage` with breadcrumb | 🔴 Rendering bug |

### 2.2 Critical Issues

#### 🔴 Issue #1: LD-JSON Renders as Visible Text (CRITICAL)

**Affected Files:**
- `app/(global)/our-team/[slug]/page.tsx` (lines 137-139)
- `app/(location)/locations/[slug]/our-team/[memberSlug]/page.tsx` (lines 175-177)
- `components/our-team/TeamMembers.tsx` (lines 155-157)
- `app/404/page.tsx` (lines 102-106)

**Problem:**
```tsx
// INCORRECT - renders JSON as visible text
<script type="application/ld+json">
  {JSON.stringify(ldJsonSchema)}
</script>
```

**Should Be:**
```tsx
// CORRECT - renders as structured data
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{ __html: JSON.stringify(ldJsonSchema) }}
/>
```

**Impact:** Google will not parse structured data; JSON appears as visible text on page.

---

#### 🟠 Issue #2: Blog Post Fallback Uses Wrong Schema Type

**File:** `app/(global)/blog/[topic]/[slug]/page.tsx` (lines 85-109)

**Problem:** When `postData.ld_json` is null, the fallback schema uses `@type: "Blog"` instead of `@type: "BlogPosting"`.

**Current:**
```tsx
const ldJsonSchema = postData.ld_json || {
  "@context": "https://schema.org",
  "@type": "Blog",  // ❌ Wrong for individual posts
  ...
};
```

**Should Be:**
```tsx
const ldJsonSchema = postData.ld_json || {
  "@context": "https://schema.org",
  "@type": "BlogPosting",  // ✅ Correct for individual posts
  "headline": postData.title,
  "datePublished": postData.published_at,
  ...
};
```

**Impact:** Incorrect semantic markup; Google may not recognize individual blog posts properly.

---

#### 🟠 Issue #3: Hardcoded Business Hours in LD-JSON

**Affected Files:**
- `app/(global)/contact/page.tsx` (line 66)
- `app/(global)/blog/[topic]/page.tsx` (lines 70-72)
- `app/search/page.tsx` (lines 73-75)

**Problem:**
```tsx
"openingHours": "Mo-Fr 08:00-17:00"  // Hardcoded
```

**Should Use:** Dynamic `business_hours` from `websiteData` via `buildOpeningHoursSpec()` utility.

**Impact:** Incorrect business hours displayed in Google Knowledge Panel.

---

#### 🟠 Issue #4: Relative URLs in LD-JSON Schemas

**Affected Files:**
- `app/(global)/blog/page.tsx` (line 53): `"url": "/blog"`
- `app/(global)/glossary/page.tsx` (line 85): `"url": "/glossary"`
- `app/search/page.tsx` (line 52): `"url": '/search'`

**Problem:** Schema.org requires absolute URLs for proper validation.

**Should Be:**
```tsx
"url": buildPageUrl(canonicalUrl, '/blog')
```

**Impact:** Schema validation warnings; may affect rich snippet eligibility.

---

#### 🟡 Issue #5: Missing LD-JSON on Policies Index Page

**File:** `app/(global)/policies/page.tsx`

**Problem:** No structured data schema present. Should have `ItemList` or `CollectionPage` schema.

---

#### 🟡 Issue #6: Missing LD-JSON on Home Page

**File:** `app/(global)/page.tsx`

**Problem:** Relies entirely on root layout schema. Could benefit from `WebSite` schema with `SearchAction` for sitelinks search box.

---

#### 🟡 Issue #7: Team Index Page Missing LD-JSON

**File:** `app/(global)/our-team/page.tsx`

**Problem:** No structured data. The `TeamMembers` component has LD-JSON but it has the rendering bug (Issue #1).

---

## 3. ISR/SSG Configuration Issues

### 3.1 Revalidation Status by Page

| Page | Has `revalidate` | Value | Has `generateStaticParams` |
|------|------------------|-------|---------------------------|
| Home | ❌ No | - | N/A |
| About | ❌ No | - | N/A |
| Contact | ❌ No | - | N/A |
| FAQ | ❌ No | - | N/A |
| Privacy | ❌ No | - | N/A |
| Blog Index | ❌ No | - | N/A |
| Blog Topic | ✅ Yes | 3600 | ❌ No |
| Blog Post | ✅ Yes | 3600 | ❌ No |
| Policies Index | ✅ Yes | 3600 | N/A |
| Policy Category | ✅ Yes | 3600 | ✅ Yes |
| Policy Page | ✅ Yes | 3600 | ✅ Yes |
| Glossary Index | ❌ No (`force-dynamic`) | - | N/A |
| Glossary Term | ✅ Yes | 3600 | ✅ Yes |
| Team Index | ✅ Yes | 3600 | N/A |
| Team Member | ❌ No | - | ✅ Yes |

### 3.2 Issues

#### 🟠 Issue #8: Missing `revalidate` on Multiple Pages

**Affected Files:**
- `app/(global)/page.tsx` (home)
- `app/(global)/about/page.tsx`
- `app/(global)/contact/page.tsx`
- `app/(global)/faq/page.tsx`
- `app/(global)/privacy/page.tsx`
- `app/(global)/blog/page.tsx`
- `app/(global)/our-team/[slug]/page.tsx`

**Problem:** Without `revalidate`, these pages will be statically generated at build time but never revalidated. Database changes won't reflect until next deployment.

**Recommendation:** Add `export const revalidate = 3600;` for consistency.

---

#### 🟠 Issue #9: Glossary Index Uses `force-dynamic`

**File:** `app/(global)/glossary/page.tsx` (line 8)

**Problem:**
```tsx
export const dynamic = 'force-dynamic';
```

This disables all caching, causing every request to hit the database. Inconsistent with other index pages.

**Recommendation:** Remove `force-dynamic` and add `revalidate = 3600` for consistency.

---

#### 🟡 Issue #10: Missing `generateStaticParams` on Blog Routes

**Affected Files:**
- `app/(global)/blog/[topic]/page.tsx`
- `app/(global)/blog/[topic]/[slug]/page.tsx`

**Problem:** Dynamic blog routes don't pre-generate at build time. First visitor to new content will experience slower load.

**Note:** This may be intentional for frequently updated content, but should be documented.

---

## 4. Metadata Generation Issues

### 4.1 Strengths ✅

- Comprehensive `generateMetadata` on all pages
- Proper `metadataBase` configuration
- Canonical URLs set correctly
- OpenGraph and Twitter card metadata present
- Database-driven metadata via `getPageMetadata()` with template variable interpolation

### 4.2 Issues

#### 🟡 Issue #11: Missing OG Images in Dynamic Page Metadata

**Affected Files:**
- `app/(global)/blog/[topic]/[slug]/page.tsx` - No `images` in OpenGraph
- `app/(global)/policies/[category]/[slug]/page.tsx` - No `images` in OpenGraph
- `app/(global)/our-team/[slug]/page.tsx` - No `images` in OpenGraph

**Problem:** OpenGraph metadata doesn't include `images` array, so social shares may not display images.

**Recommendation:** Add `images` array using post/policy featured image or team member photo.

---

#### 🟢 Issue #12: Inconsistent Twitter Metadata

**Problem:** Some pages have `twitter.images`, others don't. Should be consistent across all pages.

---

## 5. Sitemap & Robots.txt Issues

### 5.1 Sitemap Analysis

**File:** `app/sitemap.xml/route.ts`

#### Strengths ✅
- Dynamic generation from database
- Includes all content types (blogs, policies, glossary, team)
- Multi-location support
- Proper `changefreq` and `priority` values
- Fallback sitemap on error

#### Issues

##### 🟢 Issue #13: Sitemap Uses `force-dynamic`

**Line 8:** `export const dynamic = 'force-dynamic';`

**Problem:** Every sitemap request hits the database. Consider longer cache duration for production.

**Current Cache:** 1 hour (`max-age=3600`)

**Recommendation:** For production, consider 6-24 hour cache since content doesn't change that frequently.

---

##### 🟡 Issue #14: Sitemap Policy URL Structure Mismatch

**Problem:** Sitemap adds policies as `/policies/all/${policy.slug}` (line 235), but the actual route structure supports `/policies/${category}/${slug}`.

**Current:**
```tsx
dynamicUrls.push({
  url: `${BASE_URL}/policies/all/${policy.slug}`,
  ...
});
```

**Impact:** Category-specific policy URLs may not be in sitemap.

---

### 5.2 Robots.txt Analysis

**File:** `app/robots.txt/route.ts`

#### 🟢 Issue #15: Aggressive Crawl-Delay

**Line 25:** `Crawl-delay: 10`

**Problem:** 10-second crawl delay is quite aggressive and may slow indexing. Most modern crawlers (Googlebot) ignore this directive anyway.

**Recommendation:** Consider reducing to 1-2 seconds or removing entirely.

---

## 6. Additional SEO Observations

### 6.1 Strengths ✅

| Feature | Status |
|---------|--------|
| `llms.txt` endpoint | ✅ Present for AI crawlers |
| Security headers | ✅ Configured in `next.config.js` |
| `X-Robots-Tag` header | ✅ Rich snippet directives |
| Geo meta tags | ✅ Local SEO support |
| Dynamic favicon | ✅ Theme-based |
| Trailing slash handling | ✅ Configured as `false` |
| Image optimization | ✅ WebP format, responsive sizes |

### 6.2 Additional Issues

#### 🟠 Issue #16: ESLint Disabled During Builds

**File:** `next.config.js` (line 13)

```js
eslint: {
  ignoreDuringBuilds: true,
}
```

**Problem:** May hide SEO-related issues like missing alt text, accessibility problems.

**Recommendation:** Enable ESLint in production builds.

---

#### 🟡 Issue #17: Newsletter Form Non-Functional

**File:** `app/(global)/blog/page.tsx` (lines 105-118)

**Problem:** Newsletter signup form has no action handler. Form submission does nothing.

```tsx
<form className="max-w-md mx-auto flex">
  {/* No onSubmit, no action */}
</form>
```

**Impact:** Poor user experience; potential trust issue.

---

#### 🟢 Issue #18: 404 Page Has Canonical to /404

**File:** `app/404/page.tsx` (line 19)

```tsx
alternates: {
  canonical: '/404'
}
```

**Problem:** 404 pages typically shouldn't have canonical URLs as they're error pages.

**Recommendation:** Remove canonical or set to homepage.

---

## 7. Issue Summary Table

| # | Severity | Issue | File(s) | Impact |
|---|----------|-------|---------|--------|
| 1 | 🔴 Critical | LD-JSON renders as visible text | 4 files | Structured data broken |
| 2 | 🟠 High | Blog fallback uses wrong schema type | blog/[topic]/[slug]/page.tsx | Incorrect semantics |
| 3 | 🟠 High | Hardcoded business hours in LD-JSON | 3 files | Wrong info in Knowledge Panel |
| 4 | 🟠 High | Relative URLs in LD-JSON | 3 files | Schema validation warnings |
| 5 | 🟡 Medium | Missing LD-JSON on policies index | policies/page.tsx | No structured data |
| 6 | 🟡 Medium | Missing LD-JSON on home page | page.tsx | No WebSite schema |
| 7 | 🟡 Medium | Team index missing LD-JSON | our-team/page.tsx | No structured data |
| 8 | 🟠 High | Missing `revalidate` on 7 pages | Multiple | Stale content |
| 9 | 🟠 High | Glossary uses `force-dynamic` | glossary/page.tsx | No caching |
| 10 | 🟡 Medium | Missing `generateStaticParams` on blog | 2 files | Slower first load |
| 11 | 🟡 Medium | Missing OG images in metadata | 3 files | No social images |
| 12 | 🟢 Low | Inconsistent Twitter metadata | Multiple | Minor inconsistency |
| 13 | 🟢 Low | Sitemap uses `force-dynamic` | sitemap.xml/route.ts | Extra DB calls |
| 14 | 🟡 Medium | Sitemap policy URL mismatch | sitemap.xml/route.ts | Missing URLs |
| 15 | 🟢 Low | Aggressive crawl-delay | robots.txt/route.ts | Slower indexing |
| 16 | 🟠 High | ESLint disabled in builds | next.config.js | Hidden issues |
| 17 | 🟡 Medium | Newsletter form non-functional | blog/page.tsx | UX issue |
| 18 | 🟢 Low | 404 has canonical URL | 404/page.tsx | Minor SEO issue |

---

## 8. Recommended Fix Priority

### Phase 1: Critical Fixes (Immediate)

1. **Issue #1** - Fix LD-JSON rendering bug (4 files)
   - Change `<script>{JSON.stringify()}</script>` to `dangerouslySetInnerHTML`

### Phase 2: High Priority (This Week)

2. **Issue #8** - Add `revalidate = 3600` to 7 pages
3. **Issue #9** - Remove `force-dynamic` from glossary index
4. **Issue #2** - Fix blog post fallback schema type
5. **Issue #3** - Use dynamic business hours in LD-JSON
6. **Issue #4** - Convert relative URLs to absolute in LD-JSON
7. **Issue #16** - Enable ESLint in production builds

### Phase 3: Medium Priority (Next Sprint)

8. **Issue #5, #6, #7** - Add missing LD-JSON schemas
9. **Issue #11** - Add OG images to dynamic page metadata
10. **Issue #14** - Fix sitemap policy URL structure
11. **Issue #17** - Implement newsletter form or remove it

### Phase 4: Low Priority (Backlog)

12. **Issue #10** - Consider adding `generateStaticParams` to blog routes
13. **Issue #12, #13, #15, #18** - Minor optimizations

---

## Appendix: Files Reviewed

### App Router Pages
- `app/layout.tsx`
- `app/(global)/page.tsx`
- `app/(global)/about/page.tsx`
- `app/(global)/contact/page.tsx`
- `app/(global)/faq/page.tsx`
- `app/(global)/privacy/page.tsx`
- `app/(global)/blog/page.tsx`
- `app/(global)/blog/[topic]/page.tsx`
- `app/(global)/blog/[topic]/[slug]/page.tsx`
- `app/(global)/policies/page.tsx`
- `app/(global)/policies/[category]/page.tsx`
- `app/(global)/policies/[category]/[slug]/page.tsx`
- `app/(global)/policies/all/[slug]/page.tsx`
- `app/(global)/glossary/page.tsx`
- `app/(global)/glossary/[slug]/page.tsx`
- `app/(global)/our-team/page.tsx`
- `app/(global)/our-team/[slug]/page.tsx`
- `app/404/page.tsx`
- `app/search/page.tsx`
- `app/sitemap.xml/route.ts`
- `app/robots.txt/route.ts`
- `app/llms.txt/route.ts`

### Components
- `components/policies/PolicyPageTemplate.tsx`
- `components/our-team/TeamMembers.tsx`

### Library Files
- `lib/structured-data.ts`
- `lib/page-metadata.ts`

### Configuration
- `next.config.js`

---

*End of Analysis Report*
