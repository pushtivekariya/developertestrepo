# Remove Policy Categories

## Summary

Remove dynamic policy categories from the system. Use simplified `/policies/[slug]` route for all policies (no "all" segment needed without categories). Keep `policy_type` column in database (needed by non-template client site).

---

## Decisions Confirmed

1. **Admin UI for categories**: Remove entirely
2. **Database `policy_type` column**: Do NOT touch (needed by other client)
3. **Inline links format**: Use `/policies/{slug}` format
4. **Scope**: Only update Larson Group entries for inline links

---

## Files to Read

### template-coverage-creatives
- `app/(global)/policies/[category]/page.tsx`
- `app/(global)/policies/[category]/[slug]/page.tsx`
- `app/(global)/policies/all/[slug]/page.tsx`
- `app/(global)/policies/[slug]/page.tsx`
- `app/(location)/locations/[slug]/policies/[category]/page.tsx`
- `app/(location)/locations/[slug]/policies/[category]/[policy]/page.tsx`
- `app/(location)/locations/[slug]/policies/all/[policy]/page.tsx`
- `app/(location)/locations/[slug]/policies/[policy]/page.tsx`
- `lib/policy-categories.ts`
- `components/policies/PolicyPageTemplate.tsx`
- `components/policies/PolicyCategoryTemplate.tsx`
- `components/location/LocationFeaturedPolicies.tsx`
- `app/sitemap.xml/route.ts`

### coverage-nextjs
- `pages/api/client-policy-categories/index.ts`
- `pages/api/client-policy-categories/[id].ts`
- `pages/api/client-policy-pages/bulk-assign-category.ts`
- `components/admin/policy-categories/PolicyCategoriesManager.tsx`
- `components/shared/policy-categories/PolicySelector.tsx`
- `hooks/usePolicyCategories.ts`
- `types/policyCategories.ts`

---

## Files to Edit/Remove

### template-coverage-creatives

| Action | File | Reason |
|--------|------|--------|
| REMOVE | `app/(global)/policies/[category]/` folder | Category listing + policy pages |
| REMOVE | `app/(global)/policies/all/` folder | Redundant "all" route |
| REMOVE | `app/(location)/locations/[slug]/policies/[category]/` folder | Location category routes |
| REMOVE | `app/(location)/locations/[slug]/policies/all/` folder | Redundant "all" route |
| KEEP | `app/(global)/policies/[slug]/page.tsx` | **Primary policy route** |
| KEEP | `app/(location)/locations/[slug]/policies/[policy]/page.tsx` | **Primary location policy route** |
| EDIT | `lib/policy-categories.ts` | Remove category functions, keep policy functions |
| EDIT | `components/policies/PolicyPageTemplate.tsx` | Remove categorySlug references |
| REMOVE | `components/policies/PolicyCategoryTemplate.tsx` | No longer needed |
| EDIT | `components/location/LocationFeaturedPolicies.tsx` | Update links to `/policies/{slug}` format |
| EDIT | `app/sitemap.xml/route.ts` | Remove category routes, update to `/policies/{slug}` |
| EDIT | `app/(global)/policies/page.tsx` | Remove category listings |
| EDIT | `app/(location)/locations/[slug]/policies/page.tsx` | Remove category listings |
| EDIT | `components/layout/Footer.tsx` | Remove category links if present |

### coverage-nextjs

| Action | File | Reason |
|--------|------|--------|
| REMOVE | `pages/api/client-policy-categories/index.ts` | API no longer needed |
| REMOVE | `pages/api/client-policy-categories/[id].ts` | API no longer needed |
| REMOVE | `pages/api/client-policy-pages/bulk-assign-category.ts` | Bulk assign no longer needed |
| REMOVE | `components/admin/policy-categories/PolicyCategoriesManager.tsx` | Admin UI no longer needed |
| REMOVE | `components/shared/policy-categories/CategoryCard.tsx` | Category UI |
| REMOVE | `components/shared/policy-categories/CategoryList.tsx` | Category UI |
| REMOVE | `components/shared/policy-categories/CategoryForm.tsx` | Category UI |
| REMOVE | `components/shared/policy-categories/BulkAssignModal.tsx` | Category assignment UI |
| REMOVE | `components/shared/policy-categories/ViewCategoryPoliciesModal.tsx` | Category UI |
| KEEP | `components/shared/policy-categories/PolicySelector.tsx` | Policy selection (not category-specific) |
| EDIT | `components/shared/policy-categories/index.ts` | Remove category exports, keep PolicySelector |
| REMOVE | `components/client/policy-pages/PolicyPagesManager.tsx` | Client category management UI |
| REMOVE | `components/client/policy-pages/index.ts` | Exports PolicyPagesManager |
| EDIT | `components/admin/client-websites-dashboard/.../WebsiteTabs.tsx` | Remove PolicyCategoriesManager import |
| REMOVE | `hooks/usePolicyCategories.ts` | Hook no longer needed |
| REMOVE | `hooks/useBulkCategoryAssign.ts` | Hook no longer needed |
| REMOVE | `types/policyCategories.ts` | Types no longer needed |
| EDIT | `components/admin/client-websites-dashboard/.../PoliciesCardsSection.tsx` | Remove category_id references |
| EDIT | `hooks/usePolicyPages.ts` | Remove category_id references |
| EDIT | `pages/api/client-policy-pages/update.ts` | Remove category_id handling |
| EDIT | `pages/api/client-policy-pages/index.ts` | Remove category_id handling |
| EDIT | `pages/client/policy-pages.tsx` | Remove/update if references PolicyPagesManager |

### Database

| Action | Item | Reason |
|--------|------|--------|
| NO CHANGE | `client_policy_categories` table | Keep for now, can deprecate later |
| NO CHANGE | `client_policy_pages.category_id` column | Keep for non-template client |
| UPDATE | Larson Group `content_sections` | Update inline links to `/policies/{slug}` |

---

## Routes Affected

### template-coverage-creatives

**Remove:**
- `/policies/[category]` → category listing
- `/policies/[category]/[slug]` → category policy page
- `/policies/all/[slug]` → redundant "all" route
- `/locations/[slug]/policies/[category]` → location category listing
- `/locations/[slug]/policies/[category]/[policy]` → location category policy
- `/locations/[slug]/policies/all/[policy]` → redundant "all" route

**Keep (Primary Routes):**
- `/policies/[slug]` → policy page
- `/locations/[slug]/policies/[policy]` → location policy page

---

## Supabase Access Pattern

- Pattern 3 (Service role) for database content update
- No schema changes

---

## Auth and Permission Checks

- No auth changes needed
- Admin API routes being removed don't affect auth flow

---

## Tests and Commands

```bash
# After changes
npm run build  # template-coverage-creatives
npm run build  # coverage-nextjs
```

---

## Checklist

### Phase 1: Update Larson Group inline links (Database)

- [ ] 1.1 Update `content_sections` to use `/policies/{slug}` format for Larson Group

### Phase 2: template-coverage-creatives route migration

**Note**: The `[slug]` route files are currently empty. Must copy content from `all/[slug]` before removing.

- [ ] 2.1 Remove `app/(global)/policies/[category]/` folder
- [ ] 2.2 Copy content from `app/(global)/policies/all/[slug]/page.tsx` → `app/(global)/policies/[slug]/page.tsx`
  - Update all `/policies/all/` references to `/policies/`
  - Update canonical URLs
- [ ] 2.3 Remove `app/(global)/policies/all/` folder (after 2.2)
- [ ] 2.4 Remove `app/(location)/locations/[slug]/policies/[category]/` folder
- [ ] 2.5 Copy content from `app/(location)/.../policies/all/[policy]/page.tsx` → `app/(location)/.../policies/[policy]/page.tsx`
  - Update all `/policies/all/` references to `/policies/`
  - Update canonical URLs
- [ ] 2.6 Remove `app/(location)/locations/[slug]/policies/all/` folder (after 2.5)
- [ ] 2.7 Remove `components/policies/PolicyCategoryTemplate.tsx`

### Phase 3: template-coverage-creatives code cleanup

- [ ] 3.1 Edit `lib/policy-categories.ts` - remove category functions
- [ ] 3.2 Edit `components/policies/PolicyPageTemplate.tsx` - remove categorySlug
- [ ] 3.3 Edit `components/location/LocationFeaturedPolicies.tsx` - update links to `/policies/{slug}`
- [ ] 3.4 Edit `app/sitemap.xml/route.ts` - remove category routes, use `/policies/{slug}`
- [ ] 3.5 Edit `app/(global)/policies/page.tsx` - remove category listings
- [ ] 3.6 Edit `app/(location)/locations/[slug]/policies/page.tsx` - remove category listings
- [ ] 3.7 Edit `components/layout/Footer.tsx` - remove category links if present

### Phase 4: coverage-nextjs admin/client removal

- [ ] 4.1 Remove `pages/api/client-policy-categories/` folder
- [ ] 4.2 Remove `pages/api/client-policy-pages/bulk-assign-category.ts`
- [ ] 4.3 Remove `components/admin/policy-categories/` folder
- [ ] 4.4 Remove `components/shared/policy-categories/CategoryCard.tsx`
- [ ] 4.5 Remove `components/shared/policy-categories/CategoryList.tsx`
- [ ] 4.6 Remove `components/shared/policy-categories/CategoryForm.tsx`
- [ ] 4.7 Remove `components/shared/policy-categories/BulkAssignModal.tsx`
- [ ] 4.8 Remove `components/shared/policy-categories/ViewCategoryPoliciesModal.tsx`
- [ ] 4.9 Edit `components/shared/policy-categories/index.ts` - keep only PolicySelector export
- [ ] 4.10 Remove `components/client/policy-pages/PolicyPagesManager.tsx`
- [ ] 4.11 Remove `components/client/policy-pages/index.ts`
- [ ] 4.12 Edit `components/admin/client-websites-dashboard/.../WebsiteTabs.tsx` - remove PolicyCategoriesManager import
- [ ] 4.13 Remove `hooks/usePolicyCategories.ts`
- [ ] 4.14 Remove `hooks/useBulkCategoryAssign.ts`
- [ ] 4.15 Edit `types/policyCategories.ts` - keep `PolicyPage` and `PolicyPagesResponse`, remove category-specific types
- [ ] 4.16 Edit `components/shared/policy-categories/PolicySelector.tsx` - remove optional `categories` prop
**KEEP: `components/shared/policy-categories/PolicySelector.tsx` - used for policy selection, not categories**
**KEEP: `PolicyPage` type in `types/policyCategories.ts` - used by PolicySelector**

### Phase 5: coverage-nextjs code cleanup

- [ ] 5.1 Edit `components/admin/client-websites-dashboard/.../PoliciesCardsSection.tsx`
- [ ] 5.2 Edit `hooks/usePolicyPages.ts`
- [ ] 5.3 Edit `pages/api/client-policy-pages/update.ts`
- [ ] 5.4 Edit `pages/api/client-policy-pages/index.ts`
- [ ] 5.5 Edit `pages/client/policy-pages.tsx` - remove PolicyPagesManager reference

### Phase 6: Verification

- [ ] 6.1 Build template-coverage-creatives
- [ ] 6.2 Build coverage-nextjs
- [ ] 6.3 Test policy pages load correctly
- [ ] 6.4 Test inline links work

---

## Notes

- The `client_policy_categories` table and `category_id` column remain in database but are unused by template sites
- Non-template client site (O'Donohoe) may still use `policy_type` column
- AI assistant instructions already updated to use base slug format

---
