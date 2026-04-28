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

**(a) Feature epics** — the user's brief turned into a variable number of epics based strictly on the project's actual size and needs. Each epic covers a primary user
capability. Examples: for a music app → "Playback engine", "Library &
playlists", "Discovery & recommendations"; for a marketplace → "Product
catalog", "Checkout", "Order fulfilment". Do NOT artificially invent epics just to hit a specific count.

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

### Brief-keyword coverage (MANDATORY companion file)

Distinctive terms from the user's brief must be traceable into the
epics. Field tests have repeatedly shown weak models summarising away
specific requirements — "liquid glass", "on-device AI/ML", "sensitive
content detection", "tinder-like swipe" all surface in briefs and then
silently disappear from the generated plan.

Write `prompts/outputs/current/brief-keywords.md` alongside `epics.md`:

```markdown
# Brief Keywords

_Distinctive terms extracted from MY_PROJECT.md (or the user's prompt).
Each must be either covered by a specific epic/feature OR explicitly
scoped out with a reason._

## Keywords

| Keyword / phrase | Status | Covered by / reason |
|---|---|---|
| liquid glass | covered | B5 Theming & Whitelabel — will cite UIVisualEffectView / tonalElevation |
| tinder-like swipe | covered | Feature epic "Swipe-based review interface" |
| on-device AI/ML | covered | Feature epic "Media scanner & analyzer" — no network access |
| sensitive content detection | covered | Smart grouping & filters — flag documents/ID cards |
| Face ID / biometric | covered | B1 Identity, auth & onboarding |
| multi-language (English, Arabic, Hindi, Tamil, Urdu) | covered | B4 Localization & RTL |
| offline-first | out-of-scope | User said "local-only processing" — covered by privacy epic, no separate offline-sync needed |
```

**How to pick keywords:** read MY_PROJECT.md Brief + Core features.
Extract every phrase that is specific enough to misinterpret. Skip
generic words ("app", "user"). Include technical terms ("WebSocket"),
product metaphors ("like Spotify"), aesthetic language ("liquid
glass"), and domain-specific concepts ("HIPAA", "PCI compliance").
Aim for 5–15 keywords.

**Status values:**
- `covered` — maps to a specific epic/feature. Name it in the
  "Covered by" column.
- `out-of-scope` — intentionally excluded; state the reason.

The validator checks this file exists and that every keyword row has
both Status and "Covered by / reason" non-empty.

### ⏸ CHECKPOINT — Epics review

After writing `epics.md` and `brief-keywords.md`, **STOP and present the
epics to the user**. Show:

1. The list of feature epics (names + one-line goals).
2. The list of baseline epics (names only — note which were included vs.
   restricted).
3. The brief-keywords coverage table.
4. The line: `"Planning progress: Step 1 of 3 complete. Say **Continue** to
   expand these epics into features, or give feedback to adjust."`

**Wait for the user to say "Continue" (or provide feedback).** If feedback
is given, regenerate `epics.md` incorporating the feedback, then present
again. When the user says "Continue", proceed to Step 2.

Step 2 expands every epic — feature AND baseline — into features; do not
selectively skip baseline epics.

---

## STEP 2 — Expand each epic (one context per epic)

For each epic in Step 1's output, start a **fresh context** containing only:

- The single epic block (its name, goal, acceptance, complexity)
- `project-context.md` if it exists
- **Exactly ONE module** from `prompts/modules/` chosen via
  `prompts/orchestrators/module-selection-index.md` (intent → single module
  path). **You MUST load a module** — it provides the patterns and best
  practices that inform how features are structured. If no entry matches
  (rare), note why but still produce high-quality features.

**Do NOT load:** other epics, other modules, stage files, other templates.

**Produce:** A variable number of features strictly governed by the epic's `Complexity` attribute (S, M, L). Do NOT artificially inflate the count to hit a quota.
- **Small (S) Epics:** 1 to 2 features max.
- **Medium (M) Epics:** 3 to 5 features max.
- **Large (L) Epics:** 4 to 6 features max.

Each feature has:
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
all epics have been expanded (one `features-*.md` per epic), you must run the external services roll-up before presenting the checkpoint.

### Roll up external services manifest (Final action of Step 2)

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

---

### ⏸ CHECKPOINT — Features review

After writing all `features-*.md` files AND `external-accounts.md`,
**STOP and present a summary to the user**. Show:

1. Number of feature files written, grouped by epic.
2. Total feature count across all epics.
3. External services summary (count + names, or "none required").
4. The line: `"Planning progress: Step 2 of 3 complete. N features across
   M epics are ready for task expansion. Say **Continue** to generate
   atomic task prompts, or give feedback to adjust."`

**Wait for the user to say "Continue".** When confirmed, proceed to
Step 3.

---

## STEP 3 — Generate implementation prompts (one per feature)

Each feature becomes a **verbose, self-contained implementation prompt**
— a file that any AI model can open in a fresh context and use to build
that feature end-to-end. This is the library's core deliverable.

### What a prompt file IS

The generated prompt file is **the actual input** that will be fed to
an AI to implement the feature. A user should be able to copy its
contents, paste them into any AI chat, and get a correct implementation.
The library's orchestration scaffolding automates this — the executor
reads the task list, picks the next prompt file, and feeds it to the
AI — but the result must be the same either way.

### One prompt = one atomic end-to-end use case

A prompt covers everything needed to deliver one cohesive use case:
writing the login API and securing it, building the contrast checker and
wiring it to the design tokens, etc. This may span multiple files and
classes. The constraint is **not** one-file-per-prompt but rather:
keep the prompt small enough that context limits don't degrade quality,
yet verbose enough that the AI cannot hallucinate the implementation.

### Module loading is MANDATORY

For each feature, start a **fresh context** containing:

- The single feature block (name, description, data model, API contract)
- `project-context.md` if it exists
- **Exactly ONE module** from `prompts/modules/` selected via
  `prompts/orchestrators/module-selection-index.md`. **You MUST load a
  module.** The module IS the source of the prompt's quality — it
  contains the patterns, code examples, security considerations, and
  testing approaches that make this library's output better than what
  an AI would hallucinate from scratch.

If the module-selection-index has no matching entry for this feature,
state why at the top of the prompt file — but this should be rare.
Most features map to at least one module. Do NOT skip module loading
as a shortcut.

Do NOT load from `prompts/templates/` (waterfall-era legacy).
Do NOT load other features, other modules, epics, or stage files.

### How to derive a prompt from a module

1. **Read the module.** Understand its patterns, interfaces, code
   examples, testing strategies, security considerations.
2. **Select the applicable parts.** Not everything in the module applies
   to every project. Pick the patterns relevant to this feature and
   this project's platform/stack.
3. **Rewrite in project-specific terms.** The module uses generic names
   and placeholder shapes. Replace them with the actual project's
   entities, file paths, technology choices, and architecture.
4. **Add project context.** Include the app name, platform, relevant
   constraints from `project-context.md`, and how this feature fits
   into the broader product.
5. **Produce a self-contained prompt.** The result must contain enough
   detail that an AI with zero prior knowledge of the project can
   implement the feature correctly.

The output MUST NOT contain template filenames, placeholder tokens
(`{{var}}`, `<TBD>`, `[project name]`), paths beginning with
`.ai-prompts/prompts/`, or generic function names like
`implement_auth`.

If the parent epic is a **baseline** epic, also consult
`prompts/orchestrators/baseline-task-shapes.md` for additional rules.

### Prompt file structure

Each prompt file follows this general structure. It is NOT a rigid
schema — adapt the sections to what the use case needs. The goal is
a verbose, unambiguous implementation guide, not a filled-in form.

```markdown
# Prompt — <Feature Name> for <Project Name>

## Context
<What the app is, what platform, how this feature fits in.>

## What to build
<One-paragraph summary of the end-to-end deliverable.>

## Implementation guidance

<The core of the prompt. This is where module content is dissolved
into project-specific instructions. Include:>

### <Subsection per major concern>
- Algorithms, formulas, thresholds (from the module)
- Code patterns adapted to the project's language/framework
- Data models with real field names for THIS project
- API contracts with real endpoints and shapes
- Security considerations specific to this feature
- Error handling and edge cases

### Testing approach
- What to test and how
- Known reference values for calibration
- Edge cases to cover

### What NOT to do
- Common mistakes the module warns about
- Project-specific constraints (e.g., no network calls for offline apps)
```

**Example — a prompt derived from the accessibility-compliance module:**

```markdown
# Prompt — Contrast Audit for ClearSpace AI

## Context

ClearSpace AI is a privacy-first Android/iOS storage cleaner. This
prompt covers implementing WCAG 2.1 AA contrast compliance for the
app's design token system. All processing is local — no network calls.

## What to build

A contrast checking system that validates all design token
foreground/background pairs meet WCAG AA ratios, with a test suite
that catches regressions when tokens change.

## Implementation guidance

### Contrast ratio calculation (WCAG 2.1)

Use the relative luminance formula:
- Linearize each sRGB channel: if C ≤ 0.04045, C_lin = C / 12.92;
  else C_lin = ((C + 0.055) / 1.055) ^ 2.4
- L = 0.2126 * R_lin + 0.7152 * G_lin + 0.0722 * B_lin
- Ratio = (L_lighter + 0.05) / (L_darker + 0.05)

### Thresholds
- Normal text (< 18sp or < 14sp bold): ratio ≥ 4.5 (AA)
- Large text (≥ 18sp or ≥ 14sp bold): ratio ≥ 3.0 (AA)
- UI components and graphical objects: ratio ≥ 3.0

### Android implementation (Kotlin)
Create `ContrastChecker` in the accessibility package with:
- `fun calculateContrastRatio(fg: Color, bg: Color): Double`
- `fun meetsAA(ratio: Double, isLargeText: Boolean): Boolean`

### Design token validation
Walk the app's `DesignTokens` and check each semantic pair:
surface/onSurface, primary/onPrimary, error/onError — both light
and dark themes.

### Testing approach
Parameterized test loading every token pair from both themes.
Reference values for calibration:
- Black on White = 21.0:1
- #757575 on White ≈ 4.6:1 (passes AA normal)
- #9E9E9E on White ≈ 3.2:1 (fails AA normal, passes AA large)

### What NOT to do
- Do not hardcode color values — read from the token source
- Do not skip dark mode — both themes must be validated
- Do not add network calls or analytics reporting
```

Notice: the prompt carries the WCAG formula, the threshold constants,
the testing calibration values, and the platform-specific patterns
directly from the `accessibility-compliance.md` module — but rewritten
for this specific project. That is the library's value: turning generic
best-practice modules into project-specific, executable prompts.

**Write to:** `prompts/outputs/current/tasks-<feature-slug>.md`

**After each feature's tasks are written, continue to the next feature
within the current epic.**

### Step 3 progress tracking (MANDATORY — run between every task file)

Step 3 generates one `tasks-<feature>.md` per declared feature. On a
real project that is 100+ files. Weak models routinely **lose track**
part-way through and advance to the next stage believing Step 3 is
done. To prevent this, the library ships a progress script that is
the single source of truth for "what still needs to be written":

```bash
bash scripts/step3-progress.sh prompts/outputs/current
```

Output: a markdown checklist, grouped by epic, with one line per
feature in the form `- [x] tasks-<slug>.md  (Feature Name)` or `- [ ]
tasks-<slug>.md  (Feature Name)`. Bottom line: `Progress: N / M (P%)`.

Exit codes:
- `0` → every declared feature has a matching tasks file. Step 3 is
  complete. Proceed to the Revise Gate.
- `1` → at least one feature is still unchecked. Step 3 is NOT
  complete. Go back to the `[ ]` entries and generate each.

**Required workflow during Step 3:**

1. Read the progress script once at the start to see the full list.
2. Pick the next `- [ ]` feature.
3. Read just that feature's block from its `features-<epic>.md`.
4. Write `tasks-<slug>.md` (use the exact slug the progress script
   expects — match the filename shown in the `- [ ]` line, do not
   invent a different slug).
5. Re-run the progress script. Confirm the item flipped to `- [x]`.
6. If unchanged, the slug you used doesn't match. Delete the file
   you just wrote and use the canonical name from the checklist.
7. **After completing all features for one epic**, present the
   checkpoint (see below).
8. Repeat until exit 0.

**Do NOT advance to the Revise Gate while the progress script exits 1.**
The Revise Gate will fail on coverage gaps and tell you the same
thing in longer form. Catching it here is cheaper.

**Do NOT generate multiple tasks files from memory in a single burst
without re-running the progress script.** That is the failure pattern
the library has observed across every field test: agent writes 20-30
files, loses track, skips ahead. The progress script exists to keep
you honest between writes.

### ⏸ CHECKPOINT — Task generation progress (after each epic)

After writing task files for all features in one epic, **STOP and
present progress to the user**. Show:

1. The epic just completed (name).
2. Number of task files written for this epic.
3. Overall progress from the progress script (`N / M (P%)`).
4. The line: `"Task generation progress: [epic name] complete.
   Overall: N / M task files written (P%). Say **Continue** to
   proceed to the next epic, or give feedback."`

**Wait for the user to say "Continue".** This checkpoint is what
prevents the rush-and-hallucinate failure mode. The model gets a
fresh context window for each epic's worth of tasks, ensuring
each task prompt receives the full attention it deserves.

### Self-contained prompt test (MANDATORY quality gate per prompt)

Each prompt file must pass the **copy-paste test**: if a user copies
its contents into a fresh AI chat with zero project context, the AI
must be able to implement the feature correctly. That is the entire
purpose of the planning phase.

**Before writing each prompt, ask yourself:** "Does this prompt contain
enough implementation detail — patterns, formulas, data shapes, testing
approaches — that an AI cannot hallucinate a wrong implementation?"

A prompt passes the self-contained test when it includes:
- **Context:** what the project is, what platform, how this feature fits
- **Concrete implementation guidance** derived from the loaded module
  (not vague instructions like "implement the feature")
- **Code patterns** adapted to the project's language and framework
- **Testing approach** with specific verification strategies
- **Constraints** (what NOT to do, edge cases, security considerations)
- **Enough verbosity** that the AI is guided, not left to guess.
  Typical prompt length: 150–400 lines. Under 50 lines is almost
  certainly too thin.

### Anti-patterns (DO NOT produce prompts like these)

**❌ BAD — hollow task card (the StorageCleaner failure)**
> ## T1 · Contrast Audit
> - **File:** `scripts/check-contrast-tokens.js`
> - **Signature:** `function checkContrastTokens(rootDir)`
> - **Precise change:** Add a token-level contrast verifier.
> - **Acceptance:**
>   - The file exists at the declared path.
>   - The implementation stores data locally.
>   - The named test command passes.

This is 15 lines. It contains zero module-derived content — no WCAG
formula, no thresholds, no testing calibration values. An AI receiving
this will hallucinate everything. This is what happens when the module
is not loaded.

**❌ BAD — generic instructions with no module content**
> ## What to build
> Implement contrast checking for the app's color system.
> Make sure it follows WCAG guidelines.
> Write tests to verify.

This is a restatement of the feature name, not an implementation guide.
"Follows WCAG guidelines" gives the AI nothing — which guidelines?
Which ratios? Which formula? The module has all of this; use it.

**❌ BAD — retains template references**
> Implement contrast checking per the patterns in
> `accessibility-compliance.md`. Use the `ContrastResult` interface
> from `.ai-prompts/prompts/modules/accessibility/`.

References to library paths and module filenames must not appear in
the output. The module's content should be dissolved INTO the prompt.

**✅ GOOD — verbose, module-derived, project-specific**

See the Contrast Audit example in "Prompt file structure" above.
It carries the WCAG formula, threshold constants, function signatures,
testing calibration values, and platform-specific patterns from the
module — all rewritten for the specific project.

### Stop conditions (before proceeding past Step 3)

Do **not** declare prompts ready if any of these are true:
- The output contains `.ai-prompts/prompts/` anywhere.
- Any placeholder pattern remains (`{{...}}`, `<TBD>`, `[project name]`).
- A prompt file is under 50 lines — it's almost certainly too thin to
  prevent hallucination.
- A prompt contains no implementation guidance from the loaded module
  (no patterns, no formulas, no code examples, no testing approaches).
- A prompt is a restatement of the feature name rather than a
  concrete implementation guide (e.g. "implement X" where X is the
  feature name).
- A prompt could describe any project — it's not specific to THIS
  project's entities, platform, or architecture.

If any stop condition trips, reload the module and regenerate the
prompt before the validation gate below.

---

## Revise Gate (MANDATORY — run one command, then act on the result)

After Step 3 writes the last `tasks-*.md`, you do NOT manually inspect
task files AND you do NOT hand-write `revise-report.md`. You run
exactly one shell command:

```bash
bash scripts/finalize.sh prompts/outputs/current
```

This wrapper:
1. Applies the mechanical auto-fixers (`fix-user-stories.sh`) so that
   trivial patterns like "missing comma before 'so that'" never block
   the gate.
2. Builds the canonical-paths ledger (`build-path-ledger.sh`) — emits
   `path-ledger.md` and refuses to pass if the plan declares the same
   path under two tasks or the same source-code basename under two
   directories of the same architectural role (the field-tested
   cause of duplicate-class builds).
3. Runs the Revise Gate (`revise.sh`), which wraps the instantiation
   validator and always writes
   `prompts/outputs/current/revise-report.md` with frontmatter that
   names every failing file.
4. Surfaces the gate verdict (`executor_gate: pass` or `fail`) and the
   next action. **You cannot declare the drill-down complete without
   running this and seeing `pass`.**

**`revise-report.md` is a canonical machine-produced artifact.** It
starts with a YAML frontmatter block (`---` on line 1) that the
validator and the executor both read. A hand-written narrative
markdown file named `revise-report.md` is detected by the validator
as "not the canonical form" and rejected. Do not produce one.

Exit codes:
- `0` → `executor_gate: pass`. All schema + coverage checks passed.
  Proceed to handoff.
- non-zero → `executor_gate: fail`. The report's `failing_files:` list
  names every file to regenerate. Pick ONE file at a time, regenerate
  it via Step 3 scoped to that single feature, then re-run
  `bash scripts/finalize.sh prompts/outputs/current`. Repeat until
  exit 0.

Do NOT try to fix failures by reading each tasks file in sequence and
editing it. That path leads to loops where you search for files that
don't exist. The validator knows exactly what is wrong; the report
tells you which files and why. Regenerate from the engine, do not
hand-edit.

## ⏸ HARD STOP — Planning complete

Once validation and revise both pass, the planning phase is **done**.
Each prompt file is self-contained: a user can copy its contents into
any AI chat and get a correct implementation. The orchestration
scaffolding automates this — the executor picks prompts from the task
list and feeds them to the AI — but the result is the same either way.

**STOP and present the planning summary to the user.** Show:

1. Total epics, features, and prompt files generated.
2. Revise gate result (`executor_gate: pass`).
3. The task list — every `tasks-*.md` file name with a `[ ]`
   checkbox (these will be ticked off during execution).
4. External accounts needed (from `external-accounts.md`), if any.
5. The line: `"✅ Planning phase complete. N implementation prompts
   are ready for execution. Say **Execute** to begin implementing
   one by one, or review the prompt files under
   prompts/outputs/current/ first."`

**Wait for the user to say "Execute" or "Continue".** Do NOT
automatically hand off to the executor. The user must explicitly
authorize the transition from planning to execution.

When the user confirms, read and follow
`prompts/orchestrators/executor.md`.

## See also

- `prompts/orchestrators/ai-agent-entry-point.md` — the entry point that
  routes to this engine.
- `prompts/orchestrators/external-input-handler.md` — handles design / spec /
  code inputs upstream of Step 1.
- `prompts/orchestrators/module-selection-index.md` — intent → single
  module path mapping for Steps 2 and 3.
