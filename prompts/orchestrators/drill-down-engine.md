# Drill-Down Engine

A lightweight, context-isolated alternative to the stage-pipeline waterfall.
Replaces 10 sequential stages with 3 recursive, focused expansion steps.

## Purpose

Take a user brief and progressively refine it into atomic, executable tasks —
each step runs in **its own minimal context** so token usage stays flat as the
project grows. Each step loads only what it needs; nothing else.

## Core Principles

1. **Isolation over accumulation** — each step starts from a minimal context.
   Do NOT carry forward the entire prior-step artifact; load only the specific
   slice (epic, feature) that the current step is expanding.
2. **One template per expansion** — never load more than one module/template
   into a single expansion context.
3. **Dissolution over reference** — templates get dissolved into project-specific
   content. No template filenames, placeholders, or `.ai-prompts/prompts/...`
   paths may appear in output.
4. **Concrete over abstract** — every task names real files, real functions,
   real API shapes. Generic "implement auth" is rejected.

## Inputs

- **User brief** — freeform description of what to build (required).
- **External context** (optional) — designs, specs, existing code. When
  present, `external-input-handler.md` runs first and produces
  `prompts/outputs/current/project-context.md`; that file then takes
  precedence over any conflicting template content.

## Outputs (directory layout)

```
prompts/outputs/current/
├── project-context.md           (optional, from external-input-handler)
├── epics.md                     (Step 1)
├── features-<epic-slug>.md      (Step 2, one per epic)
└── tasks-<feature-slug>.md      (Step 3, one per feature)
```

---

## STEP 1 — Seed (runs once, in isolation)

**Load ONLY:**
- The user brief (`MY_PROJECT.md` or inline input)
- `project-context.md` if it exists

**Do NOT load:** stage files, modules, templates, orchestrators beyond this one.

### Produce two groups of epics

**(a) Feature epics** — the user's brief turned into 4–6 epics that capture
what makes this product *this product*. Each epic covers a primary user
capability. Examples: for a music app → "Playback engine", "Library &
playlists", "Discovery & recommendations"; for a marketplace → "Product
catalog", "Checkout", "Order fulfilment".

**(b) Production-readiness baseline epics** — a fixed set that MUST also be
emitted unless the user's `MY_PROJECT.md` **Restrict** section explicitly
lists them as excluded. This enforces the library's "assume maximum
completeness" vision: a weak model cannot forget production concerns
because the engine always surfaces them.

Emit each baseline epic below UNLESS `MY_PROJECT.md` **Restrict** names it:

| Baseline epic | Covers |
|---|---|
| Identity, auth & onboarding | Sign up / sign in / OAuth / password reset / email verification / biometric on mobile / first-run onboarding tour / consent capture. |
| Admin & RBAC | Admin portal, role-based permissions, impersonation / audit, account lifecycle, user management. |
| Observability | Structured logging, metrics, error tracking (e.g. Sentry), uptime / alerting, distributed tracing, log → AI feedback loop. |
| Localization & RTL | i18n framework, string extraction, RTL + LTR layouts, locale negotiation, date/number formatting, per-locale app store assets. |
| Theming & whitelabel | Design-token architecture, dark + light mode, brand swap without code changes, theme preview in debug menu. |
| Accessibility | WCAG 2.1 AA pass across web + mobile; screen-reader labels; keyboard nav; reduced-motion; minimum touch target sizes. |
| Testing & QA | Unit + integration + UI + E2E + visual regression; mocked + deterministic data; coverage thresholds; test data factories. |
| CI/CD & release | GitHub Actions (or equivalent) pipeline: lint → test → build → deploy; branch protection; semantic versioning; release notes. |
| Infrastructure as code | Terraform / Pulumi / similar; prefer free-tier / freemium managed services for MVP; staging + production environments. |
| App store release prep | For each mobile platform: icons, launch screens, screenshots per locale, store descriptions, privacy nutrition labels, TestFlight / Play internal track, signing + distribution. |
| Settings, debug menu & dev UX | User-facing settings; developer debug menu (API endpoint switch, feature flags, mock-data toggle, localization preview, theme preview); one-command dev setup script. |
| Privacy, PII & compliance | Consent flows, data export / deletion (GDPR / CCPA), age gating, restricted content controls, PII classification + minimization, cookie policy. |

Platform default: **web + Android + iOS** unless `MY_PROJECT.md`
**Platforms** is filled in. If it is, use only those platforms.

### Per-epic schema

Each epic entry has exactly:
- `name` — short, noun-phrase, unique
- `category` — `feature` | `baseline`
- `goal` — one sentence, starts with a verb
- `acceptance_criteria` — 2–4 bullets, each measurable/testable
- `complexity` — `S` (<1 week) | `M` (1–2 weeks) | `L` (2+ weeks)
- `applies_to` — list of platforms this epic spans (subset of the
  project's platforms)

### Output format

```markdown
# Epics

_Project platforms: web, android, ios_
_Feature epics: N · Baseline epics: M · Total: N+M_

## Feature epics

### 1. <Epic Name>
- **Category:** feature
- **Goal:** <one sentence>
- **Acceptance:**
  - <bullet>
- **Complexity:** <S|M|L>
- **Applies to:** web, android, ios

### 2. …

## Baseline epics

### B1. Identity, auth & onboarding
- **Category:** baseline
- **Goal:** …
- **Acceptance:**
  - <bullet>
- **Complexity:** <S|M|L>
- **Applies to:** web, android, ios

### B2. …
```

**Target size:** < 1,200 tokens (≈ 300 lines max). Baseline epics add
to the total, which is why this cap is higher than the original 500.
Each individual epic block should still stay under ~15 lines — no
feature creep inside an epic.

**Write to:** `prompts/outputs/current/epics.md`

**After writing — continue immediately to Step 2.** Do not stop, do not ask
the user for confirmation. The epics file you just wrote is Step 2's input.
Step 2 expands every epic — feature AND baseline — into features; do not
selectively skip baseline epics.

---

## STEP 2 — Expand each epic (one context per epic)

For each epic in Step 1's output, start a **fresh context** containing only:

- The single epic block (its name, goal, acceptance, complexity)
- `project-context.md` if it exists
- At most ONE module from `prompts/modules/` chosen via
  `prompts/orchestrators/module-selection-index.md` (intent → single module
  path). If no entry matches, skip module loading — do not guess.

**Do NOT load:** other epics, other modules, stage files, other templates.

**Produce:** 6–10 features per epic. Each feature has:
- `name` — noun-phrase, unique within the epic
- `description` — one-sentence purpose
- `data_model` — concrete entity/field list (real field names, types)
- `api_contract` — concrete endpoints: `METHOD /path → request/response shape`
  (omit if the feature has no API surface; note why)
- `dependencies` — other features this depends on (by name), or `none`
- `external_services` — third-party services this feature requires, if
  any. Each entry: service name + signup URL + env vars needed + brief
  role in the feature. Use `none` if the feature needs no external
  service. See Step 2.5 for how these roll up.

**Output format:**

```markdown
# Features — <Epic Name>

## <Feature Name>
**Description:** <one sentence>

**Data model:**
- `User { id: UUID, email: string, passwordHash: string, createdAt: Date }`
- `Session { id: UUID, userId: UUID, expiresAt: Date }`

**API contract:**
- `POST /auth/signup` → req `{email, password}` → res `{userId, token}`
- `POST /auth/login`  → req `{email, password}` → res `{token}`

**Dependencies:** none
```

**Write to:** `prompts/outputs/current/features-<epic-slug>.md`

**After each epic's features are written, continue to the next epic.** Once
all epics have been expanded (one `features-*.md` per epic), continue
immediately to Step 2.5 (roll-up) — do not stop.

---

## STEP 2.5 — Roll up external services manifest

After every `features-*.md` is written, scan each file's
`external_services` sections and aggregate them into one file:
`prompts/outputs/current/external-accounts.md`.

Dedupe by service name. Merge env var lists. Collect the feature names
that use each service. For each unique service write:

```markdown
## <Service name>

- **What it does in this project:** <one sentence, aggregated from
  feature descriptions>
- **Sign up at:** <URL>
- **Env vars needed:** `VAR_NAME_ONE`, `VAR_NAME_TWO`
- **Used by features:** <list of feature names>
- **How to get credentials:** <one short paragraph — enough for a
  non-technical user to follow. Mention dashboard navigation, free
  tier limits, whether a credit card is required.>
- **Cost tier:** free | freemium | paid-only
- **Production note:** <one line on what the user must upgrade or
  configure before production use — e.g. "Stripe requires business
  verification before accepting real payments.">
```

Add a top-of-file summary:

```markdown
# External Accounts Required

_You must create accounts and obtain credentials for each service below
before the app will function in <dev | staging | production>. Free-tier
accounts are sufficient for development unless noted otherwise._

Total services: N (F free, M freemium, P paid-only)

---
```

**Write to:** `prompts/outputs/current/external-accounts.md`.

If no feature declared an external service, write the file anyway with a
single line: "No external services required — the project runs with
local-only dependencies." The file must always exist so downstream
consumers (README generator, executor's env-var check, CI setup) can
rely on its presence.

**After writing, continue immediately to Step 3.**

---

## STEP 3 — Expand each feature to atomic tasks (one context per feature)

For each feature in Step 2's output, start a **fresh context** containing only:

- The single feature block (name, description, data model, API contract, deps)
- `project-context.md` if it exists
- At most ONE template from `prompts/modules/` or `prompts/templates/`
  selected by intent

**Do NOT load:** other features, other templates, epics, stage files.

**Dissolution rule:** read the selected template, extract the applicable
patterns, then **rewrite everything in project-specific terms**. The output
MUST NOT contain:
- Template filenames (e.g. `auth-oauth.md`)
- Placeholder tokens (`{{variable}}`, `<TBD>`, `[project name]`)
- Paths beginning with `.ai-prompts/prompts/` or referring to the template source
- Generic function names (`implement_auth`, `create_thing`)

**Produce:** atomic tasks — one task = one file × one function (or one focused
edit). Each task MUST name:
- `closes_user_story` — the user story this task closes, phrased as
  `As a <role>, I want <outcome>, so that <value>`. MUST trace back to
  an epic goal or a feature description. An orphan task (no user story)
  is a schema violation.

If the parent epic is a **baseline** epic (per Step 1's two-group
output), consult
`prompts/orchestrators/baseline-task-shapes.md` for extra schema rules
that apply to that topic (e.g. "one screenshot task per locale × per
device class" for App Store Release Prep). These rules are non-optional
— a weak model cannot substitute one omnibus task for the required
breakdown.

Each task has:

- `id` — short slug, unique within the feature
- `objective` — one sentence, imperative verb, names the concrete outcome
- `file_path` — exact absolute-from-repo path (e.g. `src/auth/signup.ts`)
- `function_signature` — exact signature
  (e.g. `async function signup(req: SignupReq): Promise<SignupRes>`)
- `api_shape` — when applicable, request + response JSON shapes with real field
  names and types
- `acceptance_criteria` — 3 or more bullets, each independently testable
- `estimated_loc` — range (e.g. `40–80`)
- `depends_on` — task ids, or `none`

**Output format:**

```markdown
# Tasks — <Feature Name>

## T1 · <objective>
- **Closes user story:** As a new user, I want to register with email
  and password, so that I can access the app under my own account.
- **File:** `src/auth/signup.ts`
- **Signature:** `async function signup(req: SignupReq): Promise<SignupRes>`
- **API shape:**
  - Request: `{ email: string, password: string }`
  - Response: `{ userId: string, token: string }`
- **Acceptance:**
  - Valid email+password returns 201 with token
  - Duplicate email returns 409
  - Password < 8 chars returns 400
  - Token decodes to userId via JWT verify
- **Estimated LOC:** 40–80
- **Depends on:** none
```

**Write to:** `prompts/outputs/current/tasks-<feature-slug>.md`

**After each feature's tasks are written, continue to the next feature.**
Only stop when every feature across every epic has a `tasks-*.md` file.

### Step 3 completion checkpoint

Before you claim Step 3 is finished, you MUST reconcile the two sides:

- **Every `## <Feature Name>` heading** in every `features-*.md` file
  → one `tasks-<slug>.md` file on disk, where `<slug>` is the feature
  name lowercased, non-alphanumerics stripped, whitespace → hyphen.

If the numbers do not match — e.g. 161 features declared, only 29
tasks files on disk — Step 3 is NOT complete. Resume the per-feature
loop for the missing ones. Do not advance to the Revise Gate with an
incomplete plan; Revise Gate will catch this (C2) but it is cheaper to
catch it here first.

The Revise Gate script (`bash scripts/revise.sh`) reports
`coverage_gap_count: N` in its output. If N > 0, generate the missing
N task files via this step before re-running the revise script.

### Dissolution: good vs. bad

**BAD — retains template reference and placeholders:**
```markdown
## T1 · Implement signup per auth-oauth.md
- **File:** `.ai-prompts/prompts/modules/feature-patterns/auth-oauth.md`
- **Signature:** `async function {{signupHandler}}(req, res)`
- **Acceptance:**
  - Follows the pattern described in the template
  - Uses the standard auth flow
  - Tests pass
- **LOC:** medium
```
Reasons this fails: (1) mentions the template filename; (2) points at
`.ai-prompts/prompts/...`; (3) uses a `{{placeholder}}`; (4) acceptance
criteria are not independently testable ("tests pass" is tautological);
(5) LOC is not a range.

**GOOD — dissolved into project-specific content:**
```markdown
## T1 · Signup endpoint handler
- **File:** `src/auth/signup.ts`
- **Signature:** `export async function signup(req: SignupReq): Promise<SignupRes>`
- **API shape:**
  - Request: `{ email: string, password: string }`
  - Response (201): `{ userId: string, token: string, expiresAt: string }`
  - Error (409): `{ error: "EMAIL_TAKEN" }`
- **Acceptance:**
  - Rejects password < 8 chars with HTTP 400
  - Duplicate email returns 409 without a timing side-channel
  - On success returns a JWT whose `sub` is the new user id
- **Estimated LOC:** 60–100
- **Depends on:** T0 (schema), T2 (password hash util)
```
Concrete paths, real signatures, checkable acceptance — no template trace.

### Stop conditions (before proceeding past Step 3)

Do **not** declare tasks ready if any of these are true:
- The output contains `.ai-prompts/prompts/` anywhere.
- Any placeholder pattern remains (`{{...}}`, `<TBD>`, `[project name]`).
- A task's `file_path` is a directory or does not look like a file path.
- A task lists fewer than 3 acceptance criteria.
- A task's `acceptance_criteria` all reduce to "tests pass" or "works".
- Two tasks in the same feature name the same file + same function.

If any stop condition trips, regenerate the offending task(s) before the
validation gate below.

---

## Revise Gate (MANDATORY — run one command, then act on the result)

After Step 3 writes the last `tasks-*.md`, you do NOT manually inspect
task files. You run exactly one shell command:

```bash
bash scripts/revise.sh prompts/outputs/current
```

This wraps the instantiation validator and always writes
`prompts/outputs/current/revise-report.md` with frontmatter that names
every failing file.

Exit codes:
- `0` → `executor_gate: pass`. All schema + coverage checks passed.
  Proceed to handoff.
- non-zero → `executor_gate: fail`. The report's `failing_files:` list
  names every file to regenerate. Pick ONE file at a time, regenerate
  it via Step 3 scoped to that single feature, then re-run
  `bash scripts/revise.sh prompts/outputs/current`. Repeat until
  exit 0.

Do NOT try to fix failures by reading each tasks file in sequence and
editing it. That path leads to loops where you search for files that
don't exist. The validator knows exactly what is wrong; the report
tells you which files and why. Regenerate from the engine, do not
hand-edit.

## Handing off to an implementer (only when revise gate passes)

Once validation and revise both pass, a task file is self-contained: a
weak model can open one `tasks-<feature>.md`, pick one task (`T1`, `T2`,
…), and implement it without reading any other file in this library.
That is the whole point — the expansion work happens here so the
implementation context stays tiny.

If the user's original prompt carried execute-signal words (see the
same list as `audit-and-remediate.md` Step 5), hand off IMMEDIATELY to
`prompts/orchestrators/executor.md`. Do not wait for confirmation.

## See also

- `prompts/orchestrators/ai-agent-entry-point.md` — the entry point that
  routes to this engine.
- `prompts/orchestrators/external-input-handler.md` — handles design / spec /
  code inputs upstream of Step 1.
- `prompts/orchestrators/module-selection-index.md` — intent → single
  module path mapping for Steps 2 and 3.
