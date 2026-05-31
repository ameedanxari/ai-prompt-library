# Revise Outputs Orchestrator

Implements the **generate → review → identify gaps → fix → repeat**
discipline from the library's founding vision. Runs AFTER a planning
engine (drill-down or audit-and-remediate) writes its outputs, BEFORE
control hands off to the executor.

## Why this exists

Both planning engines can produce outputs that *look* fine to their own
validator but are thin or internally inconsistent — e.g. an epic that
maps to zero features, a feature with no tasks, a gap whose remediation
forgot to include the test, or a baseline epic that survived Step 1 but
got dropped during Step 2 expansion. This orchestrator finds those
regressions and either fixes them in place or flags them as a stop.

It does NOT re-plan the project. It is a **self-check** on what the
engine just wrote.

## When to run

Automatically inserted by the entry point between engine completion and
executor invocation:

- After `drill-down-engine.md` Step 3 writes every `tasks-*.md`.
- After `audit-and-remediate.md` Step 3 writes every `remediation-*.md`.

The user never invokes this directly.

## Check applicability by engine

Not every check applies to every engine. But the checks that DO apply
are mandatory — the agent cannot silently drop them. Use this table:

| Check | Drill-down (greenfield) | Audit-and-remediate (gap-closure) |
|---|---|---|
| C1 — Epic→feature | Applies | Skip |
| C2 — Feature→task | Applies | Skip |
| C3 — Gap→remediation | Skip | Applies |
| C4 — Task atomicity | Applies | Applies |
| C5 — Baseline coverage | Applies | **Applies** (to gaps whose slug matches a baseline topic — see C5 for keyword table) |
| C6 — External-services manifest | Applies | Applies |
| C7 — User-story linkage | Applies | Applies |
| C8 — Platform coverage | Applies | Applies |
| C9 — Regression against prior pass | Applies if prior revise-report exists | Applies if prior revise-report exists |
| C10 — UI design quality | Applies when UI tasks exist | Applies when UI remediation exists |
| C11 — Phase coverage + ordering | Applies | Applies |
| C12 — Product-vision schema | Applies | Skip |
| C13 — Architecture schema | Applies | Skip |
| C14 — UX-flows schema | Applies when UI tasks exist | Skip |
| C15 — Release-plan schema | Applies | Skip |
| C16 — Store-submission schema | Applies (one-liner ok for non-mobile) | Skip |

`checks_run` in the report's frontmatter MUST list every check row
marked "Applies" for the active engine. A revise report that omits an
applicable check is itself a defect — treat as `executor_gate: fail`.

## Checks (in order)

### C1 — Epic-to-feature coverage (greenfield only)

- Every epic in `epics.md` MUST have exactly one `features-<epic>.md`.
- Every baseline epic that wasn't excluded by `MY_PROJECT.md` Restrict
  MUST be present in `epics.md`.
- Missing expansion → regenerate that epic's features file via
  `drill-down-engine.md` Step 2 with only that epic in context.

### C2 — Feature-to-task coverage (greenfield only)

- Every feature in every `features-*.md` MUST have exactly one
  `tasks-<feature>.md`.
- Each `tasks-*.md` MUST contain ≥1 task.
- Missing expansion → regenerate via `drill-down-engine.md` Step 3
  with only that feature in context.

### C3 — Gap-to-remediation coverage (gap-closure only)

- Every gap in `gap-list.md` MUST have exactly one
  `remediation-<gap>.md`.
- Each `remediation-*.md` MUST contain ≥1 task.
- Missing expansion → regenerate via `audit-and-remediate.md` Step 3
  with only that gap in context.

### C4 — Task atomicity (both modes)

Parse every `tasks-*.md` (greenfield) or `remediation-*.md` (gap-
closure) and verify each task meets the schema. If any task fails:

- **File:** exactly one path, no trailing slash, no "multiple files".
- **Precise change:** concrete delta (not a category of work).
- **Acceptance:** ≥3 bullets, none tautological.
- **Test:** named path or named command.
- **Closes user story:** present (see `closes_user_story` task field).
- **Depends on:** justified with a Reason line if not `none`.
- UI-heavy tasks must include design-system/source-map evidence, token
  mapping, responsive behavior, accessibility checks, and state coverage.

Any failure triggers `scripts/validate-instantiation.sh` — if it exits
non-zero, stop here and report. Do NOT proceed to C5 with invalid tasks.
The same task skeleton is also represented in `task-contract.json`, so
`scripts/validate-task-contract.sh` blocks missing or malformed task-card
fields before executor handoff.

### C5 — Baseline coverage (BOTH engines — greenfield AND gap-closure)

Run for every run, both modes. Load
`prompts/orchestrators/baseline-task-shapes.md` as the single source of
truth for per-topic rules.

First run `scripts/validate-baseline-task-coverage.sh <target-dir>`.
It writes `baseline-task-coverage.md` and fails when a scoped or
detected baseline topic is missing mechanically checkable coverage
markers. The report records whether each topic came from `epics.md`,
`brief-keywords.md`, or plan-file keyword detection, and it honors
brief-keyword `out-of-scope` rows so incidental mentions do not become
false baseline requirements. Use the report as the concrete C5 issue
list before applying any semantic review below.

**Greenfield (drill-down) scope:** evaluate each baseline epic's
`tasks-<feature>.md` against the rules for its topic. For an epic
marked `category: baseline` in `epics.md`, the tasks must satisfy the
matching section in `baseline-task-shapes.md`.

**Gap-closure (audit-and-remediate) scope:** inspect each
`remediation-<gap-slug>.md`. Classify the gap's slug against the 12
baseline topics — if the slug matches a baseline topic, the
remediation's tasks MUST satisfy that topic's rules. Matching is
substring-based and non-strict; apply common sense:

| Baseline topic | Gap-slug keywords (any match triggers C5 check) |
|---|---|
| App Store Release Prep | `app-store`, `appstore`, `play-store`, `playstore`, `store-prep`, `store-listing`, `screenshots`, `app-icon`, `signing`, `provisioning`, `fastlane` |
| Localization & RTL | `localization`, `i18n`, `translation`, `locale`, `rtl`, `multi-language` |
| Theming & Whitelabel | `theme`, `theming`, `whitelabel`, `white-label`, `dark-mode`, `design-token` |
| Accessibility | `accessibility`, `a11y`, `wcag`, `screen-reader` |
| Onboarding & consent | `onboarding`, `first-run`, `consent`, `permission-education`, `privacy-intro` |
| Account identity | `auth`, `authentication`, `signup`, `signin`, `login`, `oauth`, `sso`, `biometric`, `password-reset`, `session-refresh`, `signout` |
| Admin & RBAC | `admin`, `rbac`, `permission`, `role-based` |
| Observability | `observability`, `monitoring`, `logging`, `metrics`, `tracing`, `sentry`, `error-tracking`, `crash-reporting` |
| Testing & QA | `test-coverage`, `integration-test`, `e2e`, `unit-test`, `ui-test`, `property-test`, `chaos` |
| CI/CD & Release | `ci-cd`, `cicd`, `pipeline`, `deployment-pipeline`, `release` |
| Infrastructure as Code | `infrastructure`, `terraform`, `iac`, `rds`, `elasticache`, `ecs`, `kubernetes`, `load-balancer`, `cloudfront` |
| Settings, debug menu & dev UX | `settings`, `debug-menu`, `dev-ux`, `setup-script` |
| Privacy, PII & compliance | `privacy`, `pii`, `gdpr`, `ccpa`, `hipaa`, `consent`, `data-export`, `data-deletion`, `age-gate` |

When a remediation's slug matches a topic, run the topic's rules from
`baseline-task-shapes.md`. Flag violations specifically:

**Common collapse violation — screenshots.** If the rule is "per
locale × per device class" and the remediation has a single task
"Create <platform> app screenshots", that is a violation. Expected:
`MY_PROJECT.md` locale list × required device classes tasks. For
iOS: iPhone 6.7" + iPhone 6.5" + iPhone 5.5" + iPad Pro 12.9" + iPad
Pro 11" as the common five. For Android: phone + 7" tablet + 10"
tablet.

**Common collapse violation — localization.** If the rule is "one
task per locale" and the remediation has a single task "Translate
strings", that is a violation. Expected: N tasks for N locales. If no
locale is specified in `MY_PROJECT.md` or reference material, N is 1
and the locale is the user's current locale.

**Common collapse violation — platform.** If a baseline task is
platform-specific (e.g. biometric auth) and the remediation has one
task covering multiple platforms, that is a violation.

If any baseline topic is under-covered, surface it with a
`remaining_issues` entry AND regenerate the affected remediation /
tasks file via the originating engine's Step 3, scoped to just that
gap/feature, with the specific rule cited in the regeneration prompt.
Keep `baseline-task-coverage.md` current by rerunning
`scripts/validate-baseline-task-coverage.sh <target-dir>` after each
regeneration.

### C10 — UI design quality (conditional, both modes)

Run when any task/remediation file is UI-heavy: screen, dashboard,
chart, graph, component, Tailwind, frontend, mobile app screen, web app
screen, visual design, or design-system work.

Required checks:
- UI task includes a UI reference source map, existing-style source map,
  screen-fidelity matrix reference, or explicit statement that existing
  product style is authoritative.
- Any UI task that names `ui-reference-source-map.md` or the UI reference
  source map cites concrete `REF-*` or `MAP-*` rows from that artifact.
- Greenfield UI-heavy plans without `project-context.md` Design Context
  include `ui-reference-source-map.md` with the required schema columns:
  Row ID, Evidence Row, Reference Category, Observed Pattern, Product
  Decision, Non-copy Boundary, Components Affected, Tokens Affected,
  States Affected, Responsive Notes, Accessibility Notes.
- Existing-product UI plans whose `project-context.md` Design Context says
  `Reference/research needs` is anything other than none include
  `ui-reference-source-map.md` for those named gaps. Existing theme authority
  preserves style precedence, but it does not waive explicitly recorded
  Mobbin/Figma/product-reference needs.
- The source map includes a Reference Evidence table with source type,
  product/file, flow/screen, URL/path/availability, inspected date, and
  evidence quality. Generic reference categories alone are not enough;
  if Mobbin/Figma/product research was unavailable, the map must say so
  explicitly and name fallback sources.
- Component inventory and token mapping are present for screen-level UI.
- State matrix covers default, loading, empty, error, disabled, and success.
- Dashboard/chart tasks define KPI, filter, chart/table region,
  tooltip/legend behavior where applicable, plus loading/empty/error states.
- Tailwind tasks derive styles from tokens, `@theme` variables, CSS
  variables, or the existing Tailwind config. Hardcoded one-off colors or
  spacing are violations.
- Design-system foundation tasks that create or materially change design
  tokens, theme primitives, component systems, component catalogs, or
  reusable component libraries include `docs/design-system/review/index.html`
  as a static HTML review artifact. The artifact must show token swatches,
  component gallery, state matrix, responsive previews, accessibility notes,
  and the Mobbin/Figma/product/platform reference URLs or paths that led to
  the design choices.
- Those design-system foundation tasks require the executor checkpoint to
  present the HTML artifact path plus reference evidence links/paths and ask
  the user for visual-review feedback before dependent screen-level work.
- Existing-product UI remediation preserves the audited theme unless the
  task explicitly cites redesign, rebrand, or migration approval.
- Mobile cleanup/storage/memory tasks include an OS capability matrix with
  iOS support, Android support, required permissions, OS API, fallback
  behavior, user-facing copy constraint, and store-policy risk.

Any C10 failure must be regenerated through the originating engine. Do not
offer an "accept the design shortcut" option. The library cannot proceed to
execution with generic "make it beautiful" guidance, missing design
research, missing chart states, or unrelated redesign drift.

### C11 — Phase coverage + ordering (both modes)

Run `scripts/validate-phase-order.sh <target-dir>`. It reads
`task-contract.json`, writes `phase-order-report.md`, and verifies the
invariants that make the plan executable in delivery order rather than
alphabetical order:

1. **Every task carries a `Phase:` field.** Missing Phase fields are
   listed in `phase-order-report.md`. Regenerate the offending task via
   Step 3.7 with explicit Phase guidance.

2. **`Phase:` values are within the enum.** Anything other than
   `foundation`, `mvp`, `expand`, `polish` is a schema violation.
   The build-delivery-order script normalises case but does not
   accept arbitrary values.

3. **MVP is non-empty.** For greenfield plans, `mvp_task_count`
   must be ≥ 1. A plan with zero MVP tasks has no walking skeleton
   and no demonstrable shippable surface — by definition the plan
   does not yet describe a product. Re-grade which features belong
   in MVP (see `baseline-task-shapes.md` § Phase enum). For
   audit-and-remediate (gap-closure) runs, this rule is relaxed —
   not every gap closure has an MVP feature.

4. **No mixed-phase task files.** The executor orders task files, so a
   file containing both foundation and mvp units is ambiguous. Split
   the file or align the phases.

5. **No phase inversions.** A `foundation` task that depends on an
   `mvp` task, or any reverse-direction edge, means either the Phase
   field is wrong on one side of the edge or the dependency is wrong.
   Fix by re-grading the Phase or removing the inverted edge. The
   executor cannot proceed with phase inversions.

6. **No cycles.** File-level and task-unit cycles must be empty.
   `phase-order-report.md` surfaces cycles next to the Phase context.

When any C11 invariant fails:

- Surface the specific tasks and the rule violated.
- Regenerate the offending tasks-*.md via Step 3 / Step 3.7, then
  re-run `bash .ai-prompts/scripts/validate-phase-order.sh prompts/outputs/current`.
- Do NOT proceed to the executor with a failing C11 — the executor
  reads `delivery-order.md` verbatim as its iteration order.

### C12 — Product-vision schema (greenfield only)

Verifies `prompts/outputs/current/product-vision.md` exists and
matches the schema declared in
`.ai-prompts/prompts/orchestrators/product-vision.md`. Required
sections (any missing → fail):

- **Identity** with one-liner, positioning, platforms.
- **Personas** — at least 1, at most 3. Each persona has role,
  goal, frustration, "what good looks like".
- **Success metrics** — at least 3 measurable metrics, each with
  a target value and a measurement source.
- **Non-goals** — at least 3 explicit exclusions.
- **Risks & assumptions** — at least 3 ranked risks, each with
  impact + mitigation.

Anti-pattern checks (see product-vision.md § Anti-patterns):
marketing copy without measurement, personas with no frustration,
empty risk register. Any anti-pattern fired → fail, regenerate
via the product-vision orchestrator.

### C13 — Architecture schema (greenfield only)

Verifies `prompts/outputs/current/architecture.md` exists and
matches the schema declared in
`.ai-prompts/prompts/orchestrators/architecture-blueprint.md`.
Required sections:

- **Layer map** with named layers and responsibilities.
- **Tech stack** table — every row must have a "Why this, not the
  alternative" rationale (not boilerplate).
- **Data flow** description with at least one diagram or
  structured walkthrough.
- **Domain entities** table aggregated from all `features-*.md`.
- **Performance budgets** — at least 3 budgets, each with a
  device class + measurement source.
- **Privacy & security posture** with explicit network-surface
  declaration.
- **ADRs** — at least 3, fewer than 13.

Cross-artifact consistency: the network-surface line in the
privacy posture must align with `external-accounts.md` (zero
external services ⇒ network surface = "none"; presence of
runtime third-party services ⇒ network surface explicitly names
those services).

### C14 — UX-flows schema (conditional, both modes)

Runs when any feature in `features-*.md` is UI-heavy OR when
`ui-reference-source-map.md` exists. Verifies
`prompts/outputs/current/ux-flows.md` exists and matches the
schema declared in
`.ai-prompts/prompts/orchestrators/ux-blueprint.md`. Required
sections:

- **Design principles** — 3–5 product-specific principles.
- **Screen map** — hierarchical tree or diagram.
- **Navigation rules** — push/modal/tab + back-stack + deep-link.
- **Per-screen specifications** — one subsection per leaf screen.
  Each MUST include the full state matrix (default, loading,
  empty, error, disabled, success) AND accessibility AC
  (VoiceOver/TalkBack, touch targets, dynamic type, reduced
  motion, contrast).
- **Cross-screen patterns** — at minimum, behaviour for empty
  first launch + permission revoked + offline + crash recovery.

Mechanical state-matrix check: every screen subsection must
contain the words `default`, `loading`, `empty`, `error`,
`disabled`, `success`. A screen missing any state is rejected.

### C15 — Release-plan schema (greenfield only)

Verifies `prompts/outputs/current/release-plan.md` exists and
matches the schema declared in
`.ai-prompts/prompts/orchestrators/release-plan.md`. Required
sections:

- **Stage map** — alpha, beta, ga, post-ga (or equivalent named
  stages if the plan justifies departing from the default).
- **Per-stage details** — every stage has task count, ship-gate
  checklist, known-issues list, rollback strategy.
- **Cross-stage release gates** — build-green, regression,
  external-accounts.
- **Risk register** distinct from product-vision risks.

Cross-artifact consistency: every task in `delivery-order.md`
must appear in exactly one stage's task list (or be explicitly
deferred to `post-ga`). A task in zero stages is "ghosted" —
the executor would build it but no stage owns it. A task in
multiple stages is double-counted.

Mechanical phase-vs-stage check: tasks tagged `polish` must not
appear in the Alpha stage; tasks tagged `foundation` should
typically be fully consumed by Alpha.

### C16 — Store-submission schema

Verifies `prompts/outputs/current/store-submission.md` exists.

**For mobile projects** (platforms includes `ios` or `android`):
required sections —

- **Per-platform listing metadata** with name, subtitle / short
  description, full description, keywords, categories, age rating.
- **Privacy disclosures** — iOS nutrition labels table AND/OR
  Android data safety table, depending on platforms.
- **Permission strings** — every requested permission has a
  user-facing string. Permissions explicitly NOT requested are
  also listed (negative-space declarations).
- **Asset checklist** — app icon spec, screenshot matrix
  (platform × locale × device class), preview video plan.
- **Monetisation** — free vs paid, paywall trigger if any.
- **Reviewer notes** for each store.
- **Compliance** — privacy policy URL, export compliance answer.

**For non-mobile projects** (web-only, backend, CLI, library):
a one-line file naming the actual distribution channel is
sufficient. Example:
`Distribution: direct download from <URL>. No app-store
submission required.`

Cross-artifact consistency:
- Privacy disclosures align with `architecture.md` § Privacy &
  security posture. If architecture declares "Network surface:
  none", every nutrition-label row defaults to "Not Collected".
  A contradiction is the #1 cause of App Store rejection.
- Every permission named here must have a matching task in
  `tasks-*.md` that wires the permission.
- Every screenshot in the asset matrix must have a corresponding
  capture task (see `baseline-task-shapes.md` § App Store Release
  Prep). The submission doc lists the matrix; the tasks
  implement individual screenshots.

### C6 — External services manifest

- `external-accounts.md` MUST exist.
- Every task that references a third-party service or required release
  account (by name in its
  Precise change, e.g. "Stripe", "Firebase", "Sentry", "Twilio",
  "AWS S3", "Apple Developer Program", "App Store Connect",
  "Google Play Console", etc.) MUST have that service/account appear in
  `external-accounts.md`.
- Missing entries → regenerate `external-accounts.md` via Step 2.5
  (drill-down) or Step 3.5 (audit-and-remediate).

### C7 — User-story linkage

- Every task MUST have a `closes_user_story` field.
- The referenced user story MUST trace back to either an epic goal
  (greenfield) or a gap description (gap-closure).
- Orphan tasks (no traceable user story) → regenerate with explicit
  user-story derivation.

### C8 — Platform coverage

For multi-platform projects (platforms in `MY_PROJECT.md` > 1), every
feature epic that applies to all platforms MUST have tasks on all
platforms. A feature marked `applies_to: web, android, ios` with tasks
only for web is a gap → regenerate the missing platform expansions.

### C9 — Regression check (only when re-revising)

If an older `revise-report.md` exists (a previous pass), compare its
findings with this pass's. Any check that was passing before but is
now failing is a regression — report prominently and do NOT allow the
executor to proceed.

## Output artifact: revise-report.md

Written to `prompts/outputs/current/revise-report.md`:

```markdown
---
revised_at: <ISO 8601 from `date +%Y-%m-%dT%H:%M:%SZ`>
engine: drill-down-engine | audit-and-remediate
checks_run: [C1, C2, C3, C4, C5, C6, C7, C8, C9]
checks_passed: [C1, C4, C7, ...]
checks_failed: [C2 (feature "Push notifications — android" has no tasks file), C5 (no app-store screenshot tasks), ...]
regenerations_performed: [features-push-notifications-android.md, remediation-screenshots.md]
remaining_issues: [C6: "Firebase" referenced in tasks but missing from external-accounts.md]
executor_gate: pass | fail
---

# Revise Report

## Checks run this pass
(brief per-check results)

## Regenerations performed
(list of files rewritten)

## Remaining issues
(items that could not be auto-fixed; user decision needed)
```

## Regeneration rules (MANDATORY — not optional)

**Every failed check triggers exactly one regeneration attempt.** You
do not ask the user whether to regenerate. You do not skip regeneration
because the user "might prefer the current shape." The library's
schema rules are not user preferences — they are invariants.

Correct flow when a check fails:

1. Immediately attempt the single regeneration described below for
   that check's class.
2. Re-run the same check against the regenerated file.
3. Record the attempt in `revise-report.md` under `regenerations_performed`.
4. Only if the regeneration **still fails** after its one attempt,
   record the residual problem in `remaining_issues` and set
   `executor_gate: fail`.

A revise report with `checks_failed` non-empty AND
`regenerations_performed: []` is itself a defect — it means the
orchestrator surfaced a failure without attempting the required fix.
Such a report must be rejected (treat as `executor_gate: fail` with a
note that the agent skipped the regeneration step).

### When a check identifies a missing expansion

1. Invoke the relevant engine step with a **narrow context** — only
   the single epic / feature / gap in question. Do NOT re-run the
   whole engine.
2. Write the regenerated file.
3. Re-run the check to confirm the regeneration closed the issue.
4. Log in `revise-report.md`.

### When a check identifies a schema violation

1. Do NOT silently edit the offending task. The planning agent made a
   judgment; overriding that judgment without replanning invites
   drift. Instead, re-invoke engine Step 3 for that feature/gap with
   the violation as context (e.g. "your previous attempt produced a
   task with a directory for File:; produce a new tasks file for
   <feature> that places each change in a single file").
2. Replace the old tasks/remediation file atomically.

When a check identifies a baseline-coverage gap:

1. Either regenerate the affected epic's features/tasks if it exists,
   or add the missing baseline epic to `epics.md` and regenerate
   downstream for that epic only.

## Stop conditions

Do not proceed to the executor if any of these remains true after one
regeneration attempt:

- `scripts/validate-instantiation.sh` still fails.
- A baseline topic has zero tasks after regeneration (indicates the
  engine cannot satisfy that topic — needs user decision).
- A regression from a prior revise pass is detected.

Report the stop to the user and surface the specific files + issues.

### How to surface remaining issues (no "accept the violation" option)

When `executor_gate: fail` after the allowed regeneration attempt:

- State what violated, which check, which rule.
- State that the library cannot proceed to execution with this plan.
- Offer ONLY these decisions to the user:
  - **A. Retry.** The user can re-run the flow; the engine may
    produce a different plan this time.
  - **B. Manual fix.** The user edits the remediation/tasks file
    themselves to add the missing breakdown, then the revise gate
    must pass before execution.
  - **C. Escalate.** The user files a library issue (the engine
    cannot produce a compliant plan for this case).

Do NOT offer an "accept the current collapsed plan as-is" option.
Baseline-task-shape rules are invariants, not preferences; once C5
fails, the executor must not run against the offending remediation.

The purpose of this strict stance: a weak model may be tempted to
present the violation as a trade-off ("full plan vs quick plan") to
avoid re-work. That defeats the library's purpose. The correct
response is always "regenerate or stop," never "ship the shortcut".

## Iteration cap

One pass of C1–C9, then at most one regeneration per failing check,
then a second pass to confirm. If a check is STILL failing after one
regeneration, surface it as `remaining_issues` and stop — further
iteration burns tokens without convergence.

## See also

- `drill-down-engine.md` — generates outputs this orchestrator revises.
- `audit-and-remediate.md` — generates outputs this orchestrator revises.
- `executor.md` — next step after revise passes.
- `scripts/validate-instantiation.sh` — underlying schema check.
