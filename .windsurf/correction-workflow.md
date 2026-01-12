

# Issue Identification + Correction Workflow

Use this workflow whenever diagnosing, confirming, or correcting issues (bugs, regressions, data mismatches, auth failures, broken UI, incorrect outputs). These are **hard constraints**.

---

## 0. Choose the correct architecture context

Determine ownership before any work.

### Projects

**coverage-nextjs**

* Internal system of record.
* Owns:

  * Admin dashboards
  * Client and team management
  * APIs, webhooks, cron jobs
  * Billing, Stripe, Supabase logic
  * Client site provisioning and configuration

**template-coverage-creatives**

* Client-facing website template only.
* Owns:

  * UI presentation
  * Layouts, sections, routing
* Fully controlled by `coverage-nextjs`

### Rules

* Business logic and control → **coverage-nextjs**
* Public site UI → **template-coverage-creatives**
* Never mix responsibilities.

---

## 1. Intake and reconfirm (no code)

When given a list of issues, the assistant must **reconfirm each one** before proposing any fix.

For each issue, output:

1. Issue statement (1–2 lines)
2. Current behavior
3. Expected behavior
4. Where it likely lives:

   * project
   * route/page/component
   * function/handler
5. Confidence level:

   * confirmed / likely / unclear

Hard rule: if unclear, explicitly state what is missing (logs, repro steps, payloads, screenshots), but still outline best-effort investigation steps.

---

## 2. Reproduction first (mandatory)

For each issue, the assistant must define:

1. Minimal repro path:

   * exact page/action
   * inputs
   * user role
   * environment (local/stage/prod)
2. Proof artifact to confirm:

   * console error
   * network request + response
   * server logs
   * DB row before/after
   * screenshot

Hard rule: no fix proposal without a repro path.

---

## 3. Auth patterns (locked – do not create new auth routes)

### Role system (fixed)

* `admin`
* `admin_team_member`
* `client`
* `team_member`
* `advertising`

### Authentication flow (fixed)

* Supabase email/password login
* Session in cookies via `AuthContext`
* API routes use existing `withAuth`:

  * Cookies first
  * `Authorization` header fallback
* Role resolved from `profiles`
* Team permissions from `client_team_members`

### Hard rules

* Never create new auth routes
* Never invent role logic
* Always reuse `withAuth`
* Always resolve permissions from existing tables
* If auth does not fit, stop and escalate.

---

## 4. Trace the failure end-to-end (mandatory)

Before touching code, the assistant must trace:

* UI field or trigger
* Network payload
* API handler
* Query/mutation
* DB table and column
* Returned output back to UI

Hard rule: never guess schema, routes, or payload shapes.

---

## 5. Classify the issue type

Each issue must be classified:

* UI rendering/state bug
* API contract mismatch
* Auth/permission failure
* RLS/service role misuse
* DB schema mismatch
* Data mapping/column alignment bug
* Integration/third-party API bug
* Race condition/timing
* Regression from prior change

This determines investigation order.

---

## 6. Validate the outlined solution (mandatory)

If an outlined or proposed solution is provided, the assistant must evaluate it:

1. Does it address the actual failure point?
2. Does it preserve locked auth patterns?
3. Does it use an allowed Supabase pattern?
4. Does it follow existing routing conventions?
5. Does it require schema changes, and are they justified?
6. Does it introduce new risk?
7. Is there a simpler fix?

For each issue, output:

* Proposed solution verdict: correct / partially correct / wrong / unverified
* Why
* What must change in the solution.

---

## 7. Supabase usage patterns (consolidated)

The assistant must choose one existing pattern only:

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

## 8. Locate existing working patterns

The assistant must:

1. Find the closest existing feature that works.
2. Compare:

   * route structure
   * auth usage
   * payload shape
   * query shape
   * error handling
3. Identify deviations causing the issue.

Hard rule: do not invent new structure when a working reference exists.

---

## 9. Plan the fix (required)

Before implementation, the assistant must create:

```
/docs/working-on/fix-<issue-key>.md
```

The plan must include:

1. Issue summary and repro steps
2. Suspected root cause(s)
3. Evidence to collect
4. Files to read
5. Files to edit
6. Routes affected
7. Types reused or edited
8. Tables touched
9. Schema changes (yes/no)
10. Supabase access pattern
11. Auth and permission checks
12. Test plan (commands + expected result)
13. Rollback plan

No implementation before this file exists.

---

## 10. Checklist and approval gate

The assistant must:

1. Convert the plan into a checklist in the same file.
2. Each item is a single action.
3. Backend artifacts labeled:

   * **Create only – do not apply/deploy**
4. Present checklist.
5. Wait for approval.

No approval, no work.

---

## 11. Fix sequencing rules

### If UI + backend involved:

1. Confirm repro in UI
2. Stage backend artifacts
3. Fix UI and wiring
4. Validate, then apply/deploy

### If backend-only:

* Stage first, apply only after validation.

---

## 12. Backend artifact staging (Supabase)

All artifacts live under `/supabase`.

### Migrations

* `/supabase/migrations`
* Create only
* Production-safe
* No placeholders
* Do not apply

### Edge Functions

* `/supabase/functions`
* Write only
* Do not deploy

### Assistant instructions

* Stored under `/supabase`
* Draft only
* Do not publish

---

## 13. Root-cause proof requirement

A fix is valid only if tied to proof:

* failing request now passes
* error log eliminated
* DB write corrected
* output matches expected behavior

Hard rule: no “seems fixed” without evidence.

---

## 14. Verification

The assistant must:

1. Lint, typecheck, build
2. Verify routes and exports
3. Confirm auth behavior
4. Validate DB writes
5. Validate UI vs repro
6. Update tests if applicable

---

## 15. Final report

The assistant must update the same `.md` file with:

* Issues addressed
* Root causes
* Proof artifacts
* Files changed
* Routes touched
* Types reused/modified
* Tables and columns
* Migrations created (not applied)
* Edge functions created (not deployed)
* Assistant instruction drafts
* Commands run and results
* Anything pending or blocked

---
