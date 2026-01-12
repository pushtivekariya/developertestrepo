# New Feature Implementation Workflow

Use this workflow whenever you implement a new feature or endpoint.
These are **hard constraints**.

---

## 0. Choose the correct architecture context

Determine ownership before any work.

### Projects

**coverage-nextjs**

* Internal system of record.
* Owns:

  * Admin dashboards.
  * Client and team management.
  * APIs, webhooks, cron jobs.
  * Billing, Stripe, Supabase logic.
  * Client site provisioning and configuration.

**template-coverage-creatives**

* Client-facing website template only.
* Owns:

  * UI presentation.
  * Layouts, sections, routing.
* Fully controlled by `coverage-nextjs`.

### Rules

* Business logic and control → **coverage-nextjs**
* Public site UI → **template-coverage-creatives**
* Never mix responsibilities.

---

## 1. Understand and scope (no code)

1. Restate the feature in 3–5 bullets:

   * What it does.
   * Where it lives.
   * What data it touches.

2. Identify touchpoints:

   * Routes or handlers.
   * Types.
   * Auth path.
   * DB tables or columns.
   * Schema changes (yes/no).

No file edits yet.

---

## 2. Auth patterns (locked – do not create new auth routes)

### Role system (fixed)

* `admin`
* `admin_team_member`
* `client`
* `team_member`
* `advertising`

### Authentication flow (fixed)

* Supabase email/password login
* Session in cookies via `AuthContext`
* API routes use existing `withAuth`

  * Cookies first
  * `Authorization` header fallback
* Role resolved from `profiles`
* Team permissions from `client_team_members`

### Hard rules

* Never create new auth routes
* Never invent role logic
* Always reuse `withAuth`
* Always resolve permissions from existing tables
* If auth does not fit, stop and escalate

---

## 3. Supabase usage patterns (consolidated)

Choose one existing pattern only.

### Pattern 1 – Client-side (browser)

* `createBrowserClient`
* `getSupabaseClient()` singleton
* RLS enforced
* No secrets

### Pattern 2 – Server-side with user context

* `createServerClient`
* Per-request
* Cookie-based session
* RLS enforced

### Pattern 3 – Server-side admin/service role

* `createClient`
* `SUPABASE_SERVICE_ROLE_KEY`
* Bypasses RLS
* Admin, cron, provisioning only

No new patterns allowed.

---

## 4. Verify schema routing end-to-end (mandatory)

Before implementation:

1. Trace the full data path:

   * UI field
   * Payload
   * API handler
   * DB query
   * DB column

2. Verify:

   * Table names
   * Column names
   * Types
   * RLS behavior

Never guess schema.

---

## 5. Locate existing routes, handlers, and patterns

1. Find the closest existing feature.
2. Reuse its routing, structure, and auth.
3. Do not invent new routing conventions.

---

## 6. Reuse existing types first

1. Search for existing types/DTOs.
2. Extend or reuse.
3. Only create new types if none exist.
4. Keep them colocated with related types.

No duplicates.

---

## 7. Check imports and module structure

1. Identify existing helpers.
2. Prefer reuse.
3. New dependencies require justification.

---

## 8. Plan the change (required, before implementation)

1. Create a **markdown plan file** at:

```
/docs/working-on/<feature-name>.md
```

2. The plan **must** include:

   1. Files to read.
   2. Files to edit.
   3. Routes affected.
   4. Types reused or created.
   5. Tables touched.
   6. Schema changes.
   7. Supabase access pattern.
   8. Auth and permission checks.
   9. Tests and commands.

No implementation before this file exists.

---

## 9. Checklist and confirmation gate

1. Convert the plan into a checklist **inside the same .md file**.
2. Each item is a single action.
3. Backend artifacts must be labeled:

   * **Create only – do not apply/deploy**
4. Present checklist.
5. Wait for approval.

No approval, no work.

---

## 10. UI-first rule (critical)

If the feature involves:

* DB migrations
* Edge Functions
* Assistant instructions

Order is fixed:

1. UI completed first
2. Backend artifacts created but staged
3. Nothing applied or deployed

---

## 11. Backend artifact staging (Supabase)

All backend artifacts live under `/supabase`.

### Migrations

* `/supabase/migrations`
* Create files only
* Production-safe
* No placeholders
* Do not apply

### Edge Functions

* `/supabase/functions`
* Write code only
* Do not deploy

### Assistant instructions

* Stored under `/supabase`
* Draft only
* Do not publish

---

## 12. Post-UI review gate (mandatory)

After UI completion:

1. Revalidate schema
2. Revalidate edge payloads
3. Revalidate assistant outputs

Only then:

* Apply migrations
* Deploy functions
* Publish assistant updates

---

## 13. Implementation phase (strict)

1. Follow the approved checklist exactly.
2. Reuse existing logic.
3. **No placeholders**
4. **No hardcoded mock data**
5. No silent scope changes.

Scope change requires re-approval and plan update.

---

## 14. Verification

1. Lint, typecheck, build.
2. Verify routes and exports.
3. Confirm auth behavior.
4. Validate DB writes.
5. Update tests if applicable.

---

## 15. Final report

Update the same `.md` file with:

* Files changed
* Routes touched
* Types reused/created
* Tables and columns
* Migrations created (not applied)
* Edge functions created (not deployed)
* Assistant instructions drafted (not published)
* Commands run and results

Anything pending or blocked must be stated explicitly.

---
