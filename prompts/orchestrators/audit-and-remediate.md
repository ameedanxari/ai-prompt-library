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

_Audited: <date>_

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
- **Blocks:** <which other gaps this blocks, or `none`>
- **Blocked by:** <which gaps must close first, or `none`>
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

**Produce:** atomic remediation tasks. Each task MUST name:
- An exact **existing** file path (create-new is allowed only if the
  audit identified a missing file).
- The precise change to make (new function, refactored signature, new
  import, config value, migration, etc.).
- Concrete acceptance criteria — what does "fixed" look like, verifiable.
- The test that will prove the fix, by exact path (create-new OK).
- Estimated LOC delta.
- Dependencies on other remediation tasks (by gap + task id).

```markdown
# Remediation — <Gap Slug>

_Closes gap:_ G1 · ios-xcode-target-setup

## R1 · Generate Xcode project targets for Customer and Business apps
- **Change type:** create-new | modify-existing | delete | refactor
- **File:** `ios/MenuMaker.xcodeproj/project.pbxproj` (modify) + `ios/create_targets.sh` (create)
- **Precise change:** Add two new app targets ("MenuMaker-Customer" and
  "MenuMaker-Business") with distinct bundle IDs, shared code linked via
  a "MenuMakerCore" static library target. Script provisions the pbxproj
  additions.
- **Acceptance:**
  - `xcodebuild -scheme MenuMaker-Customer -destination 'generic/platform=iOS' build` succeeds
  - `xcodebuild -scheme MenuMaker-Business -destination 'generic/platform=iOS' build` succeeds
  - Both targets include every file under `ios/MenuMaker/Core/` and
    `ios/MenuMaker/Shared/`
- **Test:** `ios/MenuMaker.xcodeproj/ci-smoke-build.sh` (new) — runs both
  xcodebuild commands, exits non-zero on any failure.
- **Estimated LOC delta:** +120 / -20
- **Depends on:** none
```

### Hard stop conditions

Do not declare the remediation ready if any of these are true:
- The file path is generic or does not exist (for `modify-existing`) in
  the repo at the time of writing.
- Acceptance criteria are not independently verifiable.
- No test is named (every remediation must ship a test, even if the test
  is manual with a precise script).
- A task references a module path that does not exist on disk.

**Write to:** `prompts/outputs/current/remediation-<gap-slug>.md`.

**After every gap has a remediation file, continue to Step 4.**

---

## STEP 4 — Validate

Run the instantiation validator, which will scan every `remediation-*.md`
and every other file under `prompts/outputs/current/`:

```bash
bash scripts/validate-instantiation.sh
```

Report the validator's output to the user, then print a one-line summary:
- Number of components audited
- Number of gaps identified (by severity)
- Number of remediation tasks total
- Number of files under `prompts/outputs/current/`

That is the end of the flow.

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
