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

**Produce:** 5–7 epics. Each epic entry has exactly:
- `name` — short, noun-phrase, unique
- `goal` — one sentence, starts with a verb
- `acceptance_criteria` — 2–4 bullets, each measurable/testable
- `complexity` — `S` (<1 week) | `M` (1–2 weeks) | `L` (2+ weeks)

**Output format:**

```markdown
# Epics

## 1. <Epic Name>
- **Goal:** <one sentence>
- **Acceptance:**
  - <bullet>
  - <bullet>
- **Complexity:** <S|M|L>

## 2. <Epic Name>
...
```

**Target size:** < 500 tokens (≈ 125 lines max). If you exceed this, you're
writing features, not epics — collapse.

**Write to:** `prompts/outputs/current/epics.md`

**After writing — continue immediately to Step 2.** Do not stop, do not ask
the user for confirmation. The epics file you just wrote is Step 2's input.

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
immediately to Step 3 — do not stop, do not ask for confirmation.

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
edit). Each task has:

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
Then run the validation gate below — do not wait for the user to ask.

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

## Validation Gate (run after Step 3, before handing tasks to implementer)

Run `bash scripts/validate-instantiation.sh`. It scans every `tasks-*.md` in
`prompts/outputs/current/` for: `.ai-prompts/prompts/`, `{{...}}`, `<TBD>`,
and `[project name]`. Exit status:
- `0` → outputs are clean, proceed.
- non-zero → regenerate the offending file(s) from Step 3 before continuing.

## Handing off to an implementer

Once validation passes, a task file is self-contained: a weak model can open
one `tasks-<feature>.md`, pick one task (`T1`, `T2`, …), and implement it
without reading any other file in this library. That is the whole point —
the expansion work happens here so the implementation context stays tiny.

## See also

- `prompts/orchestrators/ai-agent-entry-point.md` — the entry point that
  routes to this engine.
- `prompts/orchestrators/external-input-handler.md` — handles design / spec /
  code inputs upstream of Step 1.
- `prompts/orchestrators/module-selection-index.md` — intent → single
  module path mapping for Steps 2 and 3.
