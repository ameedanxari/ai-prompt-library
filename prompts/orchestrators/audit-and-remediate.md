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
   material" or "Reference material" with completion estimates
   (e.g. "95% complete"), OR the user's prompt mentions "review",
   "audit", "fix gaps", "finish", "productionize", "test coverage",
   "deploy-ready", "production readiness", or similar.
3. The user is NOT asking for a single-file edit (trivial mode).

If the project is empty or the user is asking to build something new,
use `drill-down-engine.md` instead.

## Output artifacts

All written to `prompts/outputs/current/`:

| File | Purpose |
|---|---|
| `project-context.md` | Produced by `external-input-handler.md` (already ran). |
| `source-ledger.md` | Produced when research/fan-out policy triggers apply. Required before source-backed regulated/cloud/security claims. |
| `audit-report.md` | What exists, what works, what is broken, per component. |
| `gap-list.md` | Ordered list of gaps. Each gap is a concrete, measurable deficiency. |
| `remediation-<gap-slug>.md` | Atomic tasks per gap. Each task names a real existing file + precise change. |

## Context-isolation rules

Same as the drill-down engine:
- Each step runs in its own fresh context.
- Never load the entire codebase at once.
- Per-component audits load only that component's top-level files.
- Remediation expansion loads only the single gap + the modules that
  directly apply to that gap.

## Resumption & State Detection

Before starting or continuing work, you **MUST** read the contents of `prompts/outputs/current/` to determine the current state of the audit:

1. **If research/fan-out triggers apply and `source-ledger.md` is missing or stale:** Run the research/fan-out policy before making source-backed compliance, cloud, security, or AI claims.
2. **If `audit-report.md` is missing:** The audit has not started. Start with **Step 1 (Component Audit)**.
3. **If `audit-report.md` exists but `gap-list.md` is missing:** Step 1 is complete. Proceed to **Step 2 (Gap List)**.
4. **If `gap-list.md` exists but some `remediation-*.md` are missing:** Step 2 is complete. Proceed to **Step 3 (Implementation Prompts)**.
5. **If all `remediation-*.md` exist but `revise-report.md` is missing or outdated:** Step 3 is complete. Proceed to **Step 4 (Validate)** and then **Step 4.5 (Revise)**.

Rely on the files on disk, NOT your context history, to decide which step to execute.

### Resumption Checkpoint Manifest

Every `⏸ CHECKPOINT` in this engine writes (or updates) the canonical state manifest at `prompts/outputs/current/resumption-checkpoint.md`. This file enables **selective context loading** — a new chat session only loads the files listed in `re_load_files` instead of re-reading all outputs, cutting resumption token cost by ~85%.

The entry point (`ai-agent-entry-point.md`) parses this file on `"Continue"` / `"Continue where you left off"` to route directly to the correct phase and step. See the checkpoint-write instructions at each `⏸ CHECKPOINT` block below for the exact YAML frontmatter to emit.

### The "New Chat" Recommendation
To ensure maximum attention to detail and prevent context overflow, it is **recommended** to start a **NEW CHAT** for each major transition:
- After the Audit Report (Step 1) is generated.
- Before starting remediation expansion (Step 3).
- Before handoff to the executor.

If you start a new chat, paste this exactly:
**Continue where you left off. Read .ai-prompts/prompts/orchestrators/ai-agent-entry-point.md first.**

**Mandatory Re-load on Continuity:** If you continue in the same chat instead of a new one, you **MUST** re-load `project-context.md`, `audit-report.md`, and `gap-list.md` from disk before starting remediation. If the chat history is long, ask the user: *"I see we are continuing in this chat. To ensure maximum precision, should I restart in a fresh chat, or would you like me to re-load all context from disk and continue here?"*

---

## STEP 1 — Component audit (runs once, per-component)

**Load (per component):**
- The component's root directory listing (e.g. `ls ios/`,
  `ls backend/src/`).
- At most 5–10 key files per component (entry points, route tables,
  config, top-level manifests, build files).
- `project-context.md`.
- `source-ledger.md` if it exists, only for interpreting regulated,
  cloud-provider, security, AI, or current-best-practice requirements.

If the codebase is large or spans distinct specialist surfaces, use the
fan-out policy for read-only component discovery (for example backend,
frontend, infrastructure, data/security, compliance). Merge findings
into the single `audit-report.md`; do not let workers produce competing
plans.

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

### Design system and UI theme
- **Existing theme authority:** <yes | no | unknown> — <evidence from code/design files>
- **Tokens and styling:** <token files, Tailwind setup, CSS variables, native theme files, or unknown>
- **Component library:** <existing primitives/components and paths, or unknown>
- **UI risks:** <screens/components that drift from the existing style, missing states, missing accessibility, or none observed>

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

### ⏸ CHECKPOINT — Gap review

After writing `gap-list.md`, **write the resumption checkpoint** and then **STOP and present the gaps to the user**.

**Write `prompts/outputs/current/resumption-checkpoint.md`:**
```yaml
---
phase: planning
engine: audit-and-remediate
step: "Step 2 — Gap list"
last_completed: "gap-list.md"
next_action: "Generate implementation prompts for each gap (Step 3)"
re_load_files:
  - prompts/outputs/current/audit-report.md
  - prompts/outputs/current/gap-list.md
updated_at: <current ISO 8601 timestamp>
---
```

Show:

1. Components audited.
2. Gap count by severity.
3. Ordered gap list with each slug and one-line description.
4. What comes next: remediation prompts will be generated for every gap.
5. The line: "Audit progress: Step 2 of 5 complete. Say **Continue**
   to expand these gaps into remediation prompts, or give feedback to
   adjust."

Wait for the user to say `Continue`. If feedback is given, update
`gap-list.md` before advancing.

---

## STEP 3 — Generate implementation prompts (per gap)

For each gap `G<n>` in the gap list, start a **fresh context** containing
only:
- The single gap block from `gap-list.md`.
- The slice of `audit-report.md` for the affected component(s).
- `project-context.md`.
- `source-ledger.md` if it exists and the gap touches researched
  cloud, regulatory, security, AI, or current-best-practice claims.
- **One or more modules** from `.ai-prompts/prompts/modules/` chosen via
  `.ai-prompts/prompts/orchestrators/module-selection-index.md` based on gap intent
  (consult the "Ops / Readiness" section for production-readiness gaps).
  **You MUST load every directly relevant module.** They provide the
  concrete patterns and best practices needed to fix the gap correctly.
  If the needed module set is broad because the gap combines unrelated
  concerns, split the gap/remediation rather than loading the catalog.
  For UI gaps, load the design-research/design-system modules that match
  the gap. Existing product UI remediation must preserve the audited
  theme, tokens, component library, density, typography, and navigation
  unless the gap or user request explicitly says redesign/rebrand.
- If the gap maps to a baseline topic (auth, admin/RBAC, observability,
  localization, theming, accessibility, testing, CI/CD, IaC, app-store
  prep, settings/debug, privacy/PII), ALSO load
  `.ai-prompts/prompts/orchestrators/baseline-task-shapes.md` for the per-topic
  rules.

**Produce:** a verbose, self-contained implementation prompt.
This prompt must contain enough detail that an AI could fix the gap
without seeing the original audit report.

The output MUST NOT contain template filenames or placeholder tokens.

### Prompt file structure

Adapt the sections to the specific remediation, but follow this general
structure:

```markdown
# Remediation Prompt — <Gap Name>

_Closes gap:_ G1 · <slug>

## Context
<Summary of the gap from the audit and what needs fixing.>

## What to build
<One-paragraph summary of the end-to-end fix.>

## Implementation guidance

<The core of the prompt. Dissolve the loaded module into concrete
instructions for the project. Include:>

### <Subsection per major concern>
- Algorithms, configuration patterns, thresholds (from module)
- Code patterns adapted to the project's language/framework
- Exact file paths to modify (must exist in repo) or create
- Precise changes (concrete deltas, not "fix the bug")

### Testing approach
- What to test and how
- Concrete acceptance criteria
- Exact commands to run

### UI design constraints
Include this section for UI remediation only:
- Current style source: files/components/tokens inspected in the audit.
- Existing theme authority: yes unless redesign/rebrand is explicit.
- UI reference source map: existing product source paths first; external
  references only for missing patterns and only with a non-copy boundary.
  If `project-context.md` records non-none `Reference/research needs`, the
  remediation must include or create `ui-reference-source-map.md` with
  inspected Mobbin/Figma/product/platform evidence, or a
  `research-unavailable` row with the concrete reason and fallback sources.
- Component inventory and token mapping.
- Design-system review artifact: if remediation creates or materially
  changes tokens, theme primitives, component catalog, or a reusable
  component library, create or update
  `docs/design-system/review/index.html` and include linked
  Mobbin/Figma/product/platform reference URLs or paths that led to the
  design choices.
- State matrix: default, loading, empty, error, disabled, success.
- Responsive, accessibility, and screenshot/visual QA checks.

### What NOT to do
- Common mistakes the module warns about
- Things to avoid touching
- For existing UI, do not introduce unrelated colors, typography, spacing,
  navigation patterns, component libraries, or Tailwind conventions without
  an explicit redesign or migration decision.
```

**Example — remediating a missing Xcode target:**

```markdown
# Remediation Prompt — MenuMaker Customer Target

_Closes gap:_ G1 · ios-xcode-target-setup

## Context
The iOS project currently lacks a dedicated target for the Customer app,
violating the multi-app architecture. This must be added to the Xcode
project so it can be built and deployed independently.

## What to build
Add a `MenuMaker-Customer` target to `project.pbxproj` linked to the
shared core and containing the customer-specific source files.

## Implementation guidance

### Target Configuration
- **File:** `ios/MenuMaker.xcodeproj/project.pbxproj` (modify existing)
- **Precise change:** In the `PBXProject` `targets` array, add one new
  `PBXNativeTarget` with name `MenuMaker-Customer`, product type
  `com.apple.product-type.application`, bundle identifier
  `com.creatrixe.MenuMaker.customer`.
- Link the `MenuMakerCore` static library target (create if absent)
  and add all source files currently under `ios/MenuMaker/Customer/`
  to the new target's `PBXSourcesBuildPhase`.

### Testing approach
Run the following commands to verify:
- `xcodebuild -scheme MenuMaker-Customer -destination 'generic/platform=iOS' -configuration Debug build` must exit 0.
- `plutil -extract CFBundleIdentifier raw ios/MenuMaker-Customer/Info.plist` must print `com.creatrixe.MenuMaker.customer`.

### Dependencies
- **Depends on:** none
```

### Hard stop conditions

Do not declare the remediation prompt ready if any of these are true:
- The prompt does not specify which files to touch.
- For modify-existing changes, the named files do not exist in the
  repo at the time of writing.
- Any acceptance bullet is `tests pass`, `it works`, `no errors`,
  `functional`, `successful`, or similar tautology.
- The precise change is a category of work, not a concrete delta.
- The prompt is under 50 lines — it's almost certainly too thin to
  prevent hallucination.
- A prompt contains no implementation guidance from the loaded module
  (no patterns, no formulas, no code examples).
- A prompt references a module path that does not exist on disk.

**Write to:** `prompts/outputs/current/remediation-<gap-slug>.md`.

**After every gap has a remediation file, continue to Step 3.5.**

---

## STEP 3.5 — External services manifest

Scan every `remediation-*.md` for tasks that add, modify, or touch a
third-party service or required release/distribution account (payment
processors, auth providers, email/SMS, analytics, error tracking,
object storage, push notification services, map providers, translation
services, Apple Developer Program, Google Play Console, etc.).

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

For mobile apps, list Apple Developer Program and Google Play Console
when any task depends on signing, TestFlight, App Store Connect, Play
internal testing, Play Console Android Vitals, data safety, privacy
nutrition labels, or store metadata. These accounts must also remain
represented in app-store / Play release-prep tasks; the manifest is the
user's account checklist, not a replacement for those tasks.

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
bash .ai-prompts/scripts/validate-instantiation.sh
```

Report the validator's output, then print a one-line summary:
- Number of components audited
- Number of gaps identified (by severity)
- Number of remediation tasks total
- Number of files under `prompts/outputs/current/`

**After writing the summary, continue immediately to Step 4.5.**

---

## STEP 4.5 — Finalize / ready contract (MANDATORY — one shell command)

After Step 4 writes the last `remediation-*.md`, run exactly:

```bash
bash .ai-prompts/scripts/finalize.sh prompts/outputs/current
```

This is the single planning handoff command. It rebuilds
`task-schema-repair-report.md`, `path-ledger.md`,
`delivery-order.md`, `task-contract.json`, `task-graph.json`,
`phase-order-report.md`,
`baseline-task-coverage.md`, and
`user-review-checkpoints.md`, validates screenshot matrices when
screenshot task files exist, then runs the Revise Gate and writes
`revise-report.md`.

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
  scoped to that single gap, then re-run `bash .ai-prompts/scripts/finalize.sh
  prompts/outputs/current`. Repeat until exit 0.

Do NOT hand-edit individual tasks to patch symptoms. Regenerate via
the engine so the whole remediation stays coherent.

The check rationale (historical): schema violations and baseline-
coverage gaps routinely slip past the engine (e.g. collapsing `Hindi
(all device sizes)` into one task when the rule is per locale × per
device class). The finalize wrapper now writes
`baseline-task-coverage.md` via
`scripts/validate-baseline-task-coverage.sh`, runs specialized
contract validators, then invokes the full revise check set for
semantic review.

If `executor_gate: fail` persists after one regeneration cycle,
surface `remaining_issues` to the user and stop. Do not proceed to
Step 5. A weak model must not work around a failing revise gate by ignoring
it — the fail means the plan is not ready to execute.

**Only when the finalize command prints `executor_gate: pass`, continue
to Step 5.**

---

## STEP 5 — Planning hard stop

After the revise gate passes, **write the final planning checkpoint** and then stop for user review.

**Update `prompts/outputs/current/resumption-checkpoint.md`:**
```yaml
---
phase: planning
engine: audit-and-remediate
step: "Step 5 — Planning hard stop"
last_completed: "revise-report.md"
next_action: "User authorization required — say Execute to begin"
re_load_files:
  - prompts/outputs/current/revise-report.md
  - prompts/outputs/current/gap-list.md
  - prompts/outputs/current/task-schema-repair-report.md
  - prompts/outputs/current/path-ledger.md
  - prompts/outputs/current/delivery-order.md
  - prompts/outputs/current/task-contract.json
  - prompts/outputs/current/task-graph.json
  - prompts/outputs/current/phase-order-report.md
  - prompts/outputs/current/baseline-task-coverage.md
  - prompts/outputs/current/user-review-checkpoints.md
updated_at: <current ISO 8601 timestamp>
---
```

Present:

1. Components audited and gap count by severity.
2. Remediation files written.
3. External services / account checklist summary.
4. Revise result (`executor_gate: pass`).
5. The line: "Planning complete. Say **Execute** to start the executor,
   or give feedback to adjust the plan."

Do NOT auto-invoke `.ai-prompts/prompts/orchestrators/executor.md` from
execute-signal words in the original prompt. Planning output must be
reviewed first. Only read `executor.md` after the user explicitly says
`Execute` or `Continue` at this hard stop.

Do NOT emit a menu-of-options ("Would you like me to: A. execute, B.
review..."). The only next actions are user feedback on the plan or
explicit executor authorization.

---

## Coexistence with IDE-native spec kits

If the IDE (Kiro, Cursor, Windsurf, etc.) also has a native spec workflow
(`.kiro/specs/`, `.cursor/plans/`, etc.), **do not duplicate** the work.
Prefer this orchestrator's output format — it is richer and verifiable.
Leave the IDE's spec directory untouched unless the user explicitly asks
to mirror outputs there.

## See also

- `.ai-prompts/prompts/orchestrators/ai-agent-entry-point.md` — routing (mode selection).
- `.ai-prompts/prompts/orchestrators/drill-down-engine.md` — greenfield expansion (alternative to this flow).
- `.ai-prompts/prompts/orchestrators/external-input-handler.md` — runs first when external material exists.
- `.ai-prompts/prompts/orchestrators/module-selection-index.md` — intent → module lookup (see Ops / Readiness section).
