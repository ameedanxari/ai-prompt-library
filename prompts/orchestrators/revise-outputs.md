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

Any failure triggers `scripts/validate-instantiation.sh` — if it exits
non-zero, stop here and report. Do NOT proceed to C5 with invalid tasks.

### C5 — Baseline coverage (BOTH engines — greenfield AND gap-closure)

Run for every run, both modes. Load
`prompts/orchestrators/baseline-task-shapes.md` as the single source of
truth for per-topic rules.

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
| Identity, auth & onboarding | `auth`, `authentication`, `signup`, `signin`, `login`, `onboarding`, `oauth`, `sso`, `biometric`, `password-reset` |
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
strings", that is a violation. Expected: N tasks for N locales.

**Common collapse violation — platform.** If a baseline task is
platform-specific (e.g. biometric auth) and the remediation has one
task covering multiple platforms, that is a violation.

If any baseline topic is under-covered, surface it with a
`remaining_issues` entry AND regenerate the affected remediation /
tasks file via the originating engine's Step 3, scoped to just that
gap/feature, with the specific rule cited in the regeneration prompt.

### C6 — External services manifest

- `external-accounts.md` MUST exist.
- Every task that references a third-party service (by name in its
  Precise change, e.g. "Stripe", "Firebase", "Sentry", "Twilio",
  "AWS S3", etc.) MUST have that service appear in
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
