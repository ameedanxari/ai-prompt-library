# Audit & Remediate Orchestrator

For **existing projects** where the code is already partially or mostly
built, and the user asks to "review", "audit", "finish", "fix gaps",
"productionize", "write tests", or similar. This is a different flow from
the greenfield drill-down engine.

## When to use (mode selection)

Use this orchestrator — NOT `drill-down-engine.md` — when ALL of these
are true:

1. The project has substantial source directories on disk (`src/`,
   `backend/`, `frontend/`, `android/`, `ios/`, etc.) with non-trivial
   content (more than a few files).
2. `MY_PROJECT.md` mentions the existing codebase under "External
   material" with completion estimates (e.g. "95% complete"), OR the
   user's prompt mentions "review", "audit", "fix gaps", "finish",
   "productionize", "test coverage", "deploy-ready", "production
   readiness", or similar.
3. The user is NOT asking for a single-file edit (trivial mode).

If the project is empty or the user is asking to build something new,
use `drill-down-engine.md` instead.

## Output artifacts

All written to `prompts/outputs/current/`:

| File | Purpose |
|---|---|
| `project-context.md` | Produced by `external-input-handler.md` (already ran). |
| `audit-report.md` | What exists, what works, what is broken, per component. |
| `gap-list.md` | Ordered list of gaps. Each gap is a concrete, measurable deficiency. |
| `remediation-<gap-slug>.md` | Atomic tasks per gap. Each task names a real existing file + precise change. |

## Context-isolation rules

Same as the drill-down engine:
- Each step runs in its own fresh context.
- Never load the entire codebase at once.
- Per-component audits load only that component's top-level files.
- Remediation expansion loads only the single gap + ≤1 module.

---

## STEP 1 — Component audit (runs once, per-component)

**Load (per component):**
- The component's root directory listing (e.g. `ls ios/`,
  `ls backend/src/`).
- At most 5–10 key files per component (entry points, route tables,
  config, top-level manifests, build files).
- `project-context.md`.

**Do NOT load:** the full source tree, test output history, git log.

**Produce:** one `audit-report.md` with these sections:

```markdown
# Audit Report

_Audited: <today's ISO date — obtain via `date +%Y-%m-%d`, do not guess>_

## Components

### <component path, e.g. backend/>
- **Completion:** <percentage, best estimate>
- **What works:**
  - <bullet, observable fact — not wishful>
- **What is broken or missing:**
  - <bullet, concrete defect or absence>
- **Key files reviewed:**
  - <path> — <one-line finding>
- **Risks for production:**
  - <bullet>

### <next component>
...

## Cross-cutting concerns

### Test coverage
- **Unit tests:** <status per component>
- **Integration tests:** <status>
- **E2E / UI tests:** <status>

### CI/CD
- <status of pipeline, deployments, rollback>

### Observability
- <logging, metrics, alerting, tracing status>

### Security
- <secrets management, authN/authZ posture, known issues>

### Documentation
- <state of user/developer docs>

## Open questions
- <decisions the user must make before remediation can proceed>
```

**Size target:** ≤ 300 lines. Dense and factual. No prose.

**Write to:** `prompts/outputs/current/audit-report.md`.

**After writing — continue immediately to Step 2.**

---

## STEP 2 — Gap list

**Load:** `audit-report.md` + `project-context.md`. Nothing else.

**Produce:** an ordered list of gaps, each with a slug, severity, and a
one-line description. Gap granularity: one gap = one cohesive remediation
effort (roughly equivalent to one epic in the greenfield engine).

```markdown
# Gap List

_Ordered by severity, then by dependency._

## G1 · <slug: ios-xcode-target-setup>
- **Severity:** critical | high | medium | low
- **Description:** <one sentence>
- **Blocks:** <list of gap ids, or `none`>
- **Blocked by:** <list of gap ids, or `none`>
- **Reason (required if Blocked by is not `none`):** <one line — what
  concrete artifact or change from the blocking gap does this gap need
  before it can start? If you cannot name an artifact, the dependency is
  spurious — remove it.>
- **Component:** <path>

## G2 · <next gap>
...
```

Severity rules:
- `critical` — product cannot launch / cannot serve traffic safely.
- `high` — major functionality missing or broken for a primary user role.
- `medium` — partial functionality gap or test/ops gap affecting
  confidence.
- `low` — polish, docs, nice-to-have.

Dependency rules (strict — prevents invented ordering):
- `Blocked by: GN` is valid ONLY if this gap's remediation tasks would
  literally fail without GN's code-level changes in place (shared module,
  migration, API endpoint, config, etc.).
- Shared high-level themes (e.g. "both are infrastructure work") are NOT
  a dependency. Platform independence (iOS build does not need AWS ALB)
  must be respected.
- If uncertain, set `Blocked by: none`. Do not invent ordering to make
  the gap list look hierarchical.

**Write to:** `prompts/outputs/current/gap-list.md`.

**After writing — continue immediately to Step 3.** Expand every gap.
Do not ask the user to pick a subset.

---

## STEP 3 — Remediation tasks (per gap, fresh context each)

For each gap `G<n>` in the gap list, start a **fresh context** containing
only:
- The single gap block from `gap-list.md`.
- The slice of `audit-report.md` for the affected component(s).
- `project-context.md`.
- At most one module from `prompts/modules/` chosen via
  `prompts/orchestrators/module-selection-index.md` based on gap intent
  (consult the "Ops / Readiness" section for production-readiness gaps).
- If the gap maps to a baseline topic (auth, admin/RBAC, observability,
  localization, theming, accessibility, testing, CI/CD, IaC, app-store
  prep, settings/debug, privacy/PII), ALSO load
  `prompts/orchestrators/baseline-task-shapes.md` for the per-topic
  rules. They override any weaker defaults.

**Produce:** atomic remediation tasks. Each task MUST name:
- **Closes user story** — one line phrased as
  `As a <role>, I want <outcome>, so that <value>`. Must trace back to
  a user-visible behaviour in the audit (or to a baseline concern like
  "As an operator, I want error alerts, so that I can respond to
  production incidents"). An orphan task is a schema violation.
- **Exactly ONE** file path. Not a directory (no trailing `/`). Not a
  group like "multiple files" or "several test files". If the change
  really spans N files, emit N tasks — one per file.
- For `modify-existing` change types, the file path MUST exist in the
  repo at the time of writing.
- The precise change to make — a concrete delta, not a category of
  work. Good: "Add `socket.io` dependency to the `dependencies` object
  in `backend/package.json`, version `^4.7.0`." Bad: "Review test
  failures and fix assertion errors." If you cannot state the delta in
  one or two sentences of concrete terms, split the task.
- Concrete acceptance criteria — each bullet must be independently
  verifiable by running a command or reading a file. Forbidden bullets:
  "tests pass", "it works", "no errors", "functional", "successful".
- The test that will prove the fix, by exact path (create-new OK). If
  the test is an existing command (e.g. `npm test`), state the command
  AND the specific test name(s) that will assert the fix.
- Estimated LOC delta.
- Dependencies on other remediation tasks, with a one-line reason (see
  dependency rules below).

```markdown
# Remediation — <Gap Slug>

_Closes gap:_ G1 · ios-xcode-target-setup

## R1 · Add MenuMaker-Customer app target to the Xcode project
- **Closes user story:** As a Customer using an iPhone, I want a
  dedicated customer app on my device, so that I only see customer
  features and can install it from the App Store.
- **Change type:** modify-existing
- **File:** `ios/MenuMaker.xcodeproj/project.pbxproj`
- **Precise change:** In the `PBXProject` `targets` array, add one new
  `PBXNativeTarget` with name `MenuMaker-Customer`, product type
  `com.apple.product-type.application`, bundle identifier
  `com.creatrixe.MenuMaker.customer`. Link the `MenuMakerCore` static
  library target (create in R0 if absent) and add all source files
  currently under `ios/MenuMaker/Customer/` to the new target's
  `PBXSourcesBuildPhase`.
- **Acceptance:**
  - `xcodebuild -scheme MenuMaker-Customer -destination 'generic/platform=iOS' -configuration Debug build` exits 0.
  - `plutil -extract CFBundleIdentifier raw ios/MenuMaker-Customer/Info.plist` prints `com.creatrixe.MenuMaker.customer`.
  - `grep -c "MenuMaker-Customer" ios/MenuMaker.xcodeproj/project.pbxproj` is ≥ 4 (target definition + build phases).
- **Test:** `ios/scripts/ci-customer-build.sh` (new) — exec the xcodebuild
  command above; exit non-zero on failure.
- **Estimated LOC delta:** +120 / -0
- **Depends on:** none

## R2 · Add MenuMaker-Business app target to the Xcode project
- **Change type:** modify-existing
- **File:** `ios/MenuMaker.xcodeproj/project.pbxproj`
- **Precise change:** Same pattern as R1, name `MenuMaker-Business`,
  bundle id `com.creatrixe.MenuMaker.business`, source files under
  `ios/MenuMaker/Business/`.
- **Acceptance:**
  - `xcodebuild -scheme MenuMaker-Business -destination 'generic/platform=iOS' -configuration Debug build` exits 0.
  - `plutil -extract CFBundleIdentifier raw ios/MenuMaker-Business/Info.plist` prints `com.creatrixe.MenuMaker.business`.
- **Test:** `ios/scripts/ci-business-build.sh` (new).
- **Estimated LOC delta:** +120 / -0
- **Depends on:** none
  _(Independent of R1 — different target; both write to the same file but
  non-overlapping sections.)_
```

### Dependency rules (same as the gap list)

- `Depends on: RN` is valid ONLY if this task's acceptance cannot be met
  without RN's code change in place (shared symbol, migration, new
  config key, etc.).
- Sharing a file is NOT a dependency if the edits don't overlap. Two
  tasks editing different sections of `project.pbxproj` are independent.
- Provide a one-line reason in parentheses after `Depends on:` whenever
  it is not `none`.

### Hard stop conditions

Do not declare the remediation ready if any of these are true:
- The File: field ends with `/`, contains `(multiple files ...)`, or
  names more than one path.
- For `modify-existing`, the named file does not exist in the repo at
  the time of writing.
- Any acceptance bullet is `tests pass`, `it works`, `no errors`,
  `functional`, `successful`, or similar tautology.
- The precise change is a category of work, not a concrete delta.
- No test is named.
- A task references a module path that does not exist on disk.
- `Depends on: RN` lacks a one-line reason.
- `Closes user story` is missing, or does not use the
  `As a ... I want ... so that ...` form, or refers to a role / outcome
  absent from the audit / gap description.

**Write to:** `prompts/outputs/current/remediation-<gap-slug>.md`.

**After every gap has a remediation file, continue to Step 3.5.**

---

## STEP 3.5 — External services manifest

Scan every `remediation-*.md` for tasks that add, modify, or touch a
third-party service (payment processors, auth providers, email/SMS,
analytics, error tracking, object storage, push notification services,
map providers, translation services, etc.).

Aggregate into `prompts/outputs/current/external-accounts.md` using the
same schema as the drill-down engine's Step 2.5:

```markdown
## <Service name>
- **What it does in this project:** <one sentence>
- **Sign up at:** <URL>
- **Env vars needed:** `VAR_ONE`, `VAR_TWO`
- **Used by tasks:** G1.R4, G3.R2, G7.R1
- **How to get credentials:** <short instructions for a non-technical user>
- **Cost tier:** free | freemium | paid-only
- **Production note:** <what must change before real production use>
```

If the project's existing code already integrates a service but the
remediation only touches a missing configuration (e.g. adding Stripe
webhook signing), still include the service — mark it as "already
integrated, finalising configuration" under _What it does_.

If no remediation task introduces a new external service, write a
single-line file: "No new external services required for this
remediation pass." Preserve any prior `external-accounts.md` from the
greenfield generation — do not overwrite it.

**After writing, continue immediately to Step 4.**

---

## STEP 4 — Validate

Run the instantiation validator, which will scan every `remediation-*.md`
and every other file under `prompts/outputs/current/`:

```bash
bash scripts/validate-instantiation.sh
```

Report the validator's output, then print a one-line summary:
- Number of components audited
- Number of gaps identified (by severity)
- Number of remediation tasks total
- Number of files under `prompts/outputs/current/`

**After writing the summary, continue immediately to Step 4.5.**

---

## STEP 4.5 — Revise (MANDATORY — one shell command)

After Step 4 writes the last `remediation-*.md`, run exactly:

```bash
bash scripts/revise.sh prompts/outputs/current
```

**`revise-report.md` is a canonical machine-produced artifact.** Line 1
must be `---` (YAML frontmatter fence). A hand-written narrative report
under that filename is detected and rejected by the validator. Do not
produce one; let the script write it.

This produces `revise-report.md` with `executor_gate: pass|fail` and
a `failing_files:` list naming every remediation file that needs
regeneration.

Exit codes:
- `0` → `executor_gate: pass`. Continue to Step 5.
- non-zero → `executor_gate: fail`. Read the report's `failing_files:`
  list, regenerate each offending `remediation-<gap>.md` via Step 3
  scoped to that single gap, then re-run `bash scripts/revise.sh
  prompts/outputs/current`. Repeat until exit 0.

Do NOT hand-edit individual tasks to patch symptoms. Regenerate via
the engine so the whole remediation stays coherent.

The check rationale (historical): schema violations and baseline-
coverage gaps routinely slip past the engine (e.g. collapsing `Hindi
(all device sizes)` into one task when the rule is per locale × per
device class). The validator alone cannot catch these; the revise
script invokes the full C1–C8 check set (including baseline
coverage via `baseline-task-shapes.md`).

If `executor_gate: fail` persists after one regeneration cycle,
surface `remaining_issues` to the user and stop. Do not proceed to
Step 5. A weak model must not work around a failing revise gate by ignoring
it — the fail means the plan is not ready to execute.

**Only when `executor_gate: pass`, continue to Step 5.**

---

## STEP 5 — Chain to execution

The **execute-signal guard** lives in
`prompts/steering/library-context.md` — one canonical list of the words
that authorise end-to-end execution. Apply it here:

- If any execute-signal word is present in the user's original prompt,
  invoke `prompts/orchestrators/executor.md` immediately. The executor
  will run its own preflight gate against `prompts/outputs/current/`;
  you do not need to re-validate.
- If none are present and the ask was planning-oriented ("review",
  "audit", "analyze", "what are the gaps", "produce a plan"), stop
  here and report the summary.
- "Review AND fix" / "audit AND write tests" are plan-and-execute
  requests — chain to the executor.

Do NOT emit a menu-of-options ("Would you like me to: A. execute, B.
review…") — see the steering guard for why.

---

## Coexistence with IDE-native spec kits

If the IDE (Kiro, Cursor, Windsurf, etc.) also has a native spec workflow
(`.kiro/specs/`, `.cursor/plans/`, etc.), **do not duplicate** the work.
Prefer this orchestrator's output format — it is richer and verifiable.
Leave the IDE's spec directory untouched unless the user explicitly asks
to mirror outputs there.

## See also

- `prompts/orchestrators/ai-agent-entry-point.md` — routing (mode selection).
- `prompts/orchestrators/drill-down-engine.md` — greenfield expansion (alternative to this flow).
- `prompts/orchestrators/external-input-handler.md` — runs first when external material exists.
- `prompts/orchestrators/module-selection-index.md` — intent → module lookup (see Ops / Readiness section).
