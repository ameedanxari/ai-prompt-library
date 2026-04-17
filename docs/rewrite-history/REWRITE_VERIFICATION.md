# Rewrite Verification

Generated: 2026-04-16

---

## Test-Suite Result

| Run | Test Files | Tests Failed | Tests Passed |
|---|---|---|---|
| Pre-rewrite baseline | 1 failed / 82 passed (83) | 4 | 848 |
| After Change 1 | 1 failed / 82 passed (83) | 4 | 848 |
| After Change 2 | 1 failed / 82 passed (83) | 4 | 848 |
| After Change 3 (final) | 1 failed / 82 passed (83) | 4 | 848 |
| After Change 4 | 1 failed / 82 passed (83) | 4 | 848 |
| After Change 5 | 1 failed / 82 passed (83) | 4 | 848 |

**Zero net regression.** The 4 failures are pre-existing Template Architecture
Guard assertions that were already failing before this work started (see
`DIAGNOSIS_REPORT.md` — baseline tests were never at 100%). No change in this
rewrite introduced new failures after Change 3 was repositioned (see note
below).

Note on Change 3: the initial pass prepended the INSTANTIATION RULES block
as the very first lines of each module file. This broke the property-test
assertion `expect(content).toMatch(/^# /)` and produced 16 new failures.
The fix was to inject the rules block **after** the H1 title instead of
before it. After re-running, failures returned to the 4-baseline.

---

## Change 1 — Strip Safeguard Bloat

**Moved to `docs/optional/`:**
- `PREVENTION_CHECKLIST.md`  (was at repo root)
- `COMMIT_GUIDELINES.md`     (was at repo root)
- `SAFEGUARDS.md`            (was at `docs/SAFEGUARDS.md`)

**Auto-loading references removed from:**
- `prompts/orchestrators/ai-agent-entry-point.md` — deleted the
  "🛡️ CRITICAL SAFEGUARDS - MANDATORY FIRST STEPS" block (25 lines) and
  replaced with a one-paragraph "Optional Safeguards" pointer.
- `prompts/orchestrators/auto-setup-orchestrator.md` — removed the automatic
  `validate-safeguards.sh` invocation and the three `test -f` existence
  checks for the moved files. Safeguard validation is now an explicit,
  on-demand command.

**Path fixups applied:**
- `scripts/validate-safeguards.sh` — updated `REQUIRED_FILES` to point at
  `docs/optional/` and updated the final "Recommended Actions" line.
- `package.json` — updated the `safeguard-recovery` script to restore from
  `docs/optional/`.

**New:** `docs/optional/README.md` documents the load-on-demand policy.

**Startup-cost impact:** the entry point alone went from **755 → 116 lines**
(-84.6%). Safeguard docs (484 lines) and the 25-line mandatory-assessment
block no longer load on any session unless explicitly requested. The
previously mandatory `npm test` pre-assessment and `validate-safeguards.sh`
sub-script are no longer fired automatically.

---

## Change 2 — Drill-Down Engine

**New file:** `prompts/orchestrators/drill-down-engine.md` (188 lines)

**Structure implemented:**
- **Step 1 — Seed:** runs once, loads ONLY user brief + optional
  `project-context.md`. Produces 5–7 epics with name, goal, acceptance,
  complexity. Target <500 tokens.
- **Step 2 — Expand each epic:** one fresh context per epic. Loads ONLY
  the single epic block + at most one module from `prompts/modules/`.
  Produces 6–10 features per epic with concrete data model and API
  contract.
- **Step 3 — Expand each feature:** one fresh context per feature. Loads
  ONLY the single feature block + at most one template. Dissolution rule
  enforced. Produces atomic tasks with exact file path, function
  signature, API shape, 3+ acceptance criteria, LOC estimate,
  dependencies.

**Validation gate:** Step 3 output is scanned for `.ai-prompts/prompts/`
strings and placeholder tokens; any match triggers regeneration.

Output directory established at `prompts/outputs/current/`.

---

## Change 3 — Template Instantiation Rules

**INSTANTIATION RULES header added to every module:** 266 files under
`prompts/modules/` (excluding READMEs). Each file now has a four-rule
HTML-comment block injected **after the H1 title** so markdown-structure
tests continue to pass. The four rules are:

1. All placeholders (`{{var}}`, `<TBD>`, `[project name]`, generic names)
   must be replaced with project-specific values.
2. The template filename must not appear in output.
3. No `.ai-prompts/prompts/` strings allowed in output.
4. Outputs must contain real data shapes, endpoints, paths, signatures.

**New validation script:** `scripts/validate-instantiation.sh` scans
`prompts/outputs/current/tasks-*.md` for forbidden patterns:
- `\.ai-prompts/prompts/`
- `\{\{[^}]+\}\}`
- `<TBD>`
- `\[project name\]`

Exits non-zero with the offending line numbers on any match. Intended to be
run after drill-down-engine Step 3.

---

## Change 4 — External-Input Handler

**New file:** `prompts/orchestrators/external-input-handler.md` (95 lines)

**Behavior:**
1. Triggered only when user-provided material exists (mockups in
   `working_copy/`, attached spec, or extending existing code).
2. Loads ONLY that material — no templates, stages, or modules.
3. Extracts to a single canonical file:
   `prompts/outputs/current/project-context.md` with sections:
   `Entities`, `Flows`, `Constraints`, `Tech Decisions`, `Open Questions`.
4. Hard size limit: ≤200 lines.

**Precedence rule:** whenever `project-context.md` exists, every
subsequent drill-down step must load it before any template and treat it
as authoritative in all conflicts. Templates are subordinate to project
context, never the reverse.

---

## Change 5 — Entry-Point Rewrite

**File:** `prompts/orchestrators/ai-agent-entry-point.md` fully rewritten
(755 → 116 lines, -84.6%).

**Startup contract:**
- Maximum files auto-loaded at startup: **2** (entry-point + drill-down
  engine). Verified in-file.
- Conditional third read only when external material is present
  (`external-input-handler.md`).
- Zero defensive / safeguard files auto-loaded.
- Route target: `drill-down-engine.md` (stage pipeline replaced).
- `project-context.md` precedence enforced before Step 1.

**Explicit "do not auto-load" list** covers:
`docs/optional/`, `prompts/stages/**`, `stage-pipeline-orchestrator.md`,
`auto-setup-orchestrator.md`, other orchestrators, and the module
catalog.

---

## End-to-End Test Run: "A todo app with user auth and team workspaces"

### Step 1 — Seed

**Output:** `prompts/outputs/current/epics.md`

| Metric | Value | Target | Pass |
|---|---|---|---|
| Lines | 49 | — | — |
| Words | 311 | — | — |
| Approx tokens (words × 1.3) | ~404 | <500 | ✅ |
| Epics produced | 6 | 5–7 | ✅ |
| Per-epic fields present | name, goal, acceptance, complexity | all four | ✅ |

**Epics generated:** Identity & Auth, Todo Core, Team Workspaces,
Workspace Membership & Invitations, Activity & Notifications, Access &
Permissions.

### Step 3 — Sample atomic tasks

**Output:** `prompts/outputs/current/tasks-user-registration.md`
(feature: User Registration, under the Identity & Auth epic)

| Check | Result |
|---|---|
| Task count | 6 atomic tasks (T1–T6) |
| Per-task fields present | objective, file path, signature, API shape, 3+ acceptance, LOC, depends_on |
| Concrete file paths | ✅ (e.g. `src/auth/signup.ts`, `tests/auth/signup.test.ts`) |
| Concrete function signatures | ✅ (e.g. `async function signup(req: SignupReq): Promise<SignupRes>`) |
| Concrete API shapes | ✅ (real JSON field names and types for req/res/errors) |
| Real tech choices | ✅ (argon2id, jsonwebtoken HS256, Drizzle, Postgres) |

**Instantiation validator run:**
```
$ bash scripts/validate-instantiation.sh
✅ all task outputs are fully instantiated
```

**Manual grep confirmation:**
```
$ grep -cE '\.ai-prompts/prompts/|\{\{|<TBD>|\[project name\]' \
    prompts/outputs/current/tasks-user-registration.md
0
```

Sample task output contains **zero** template file references and
**zero** unreplaced placeholders. ✅

---

## Startup-Token Reduction

Diagnosis baseline pre-rewrite (from `DIAGNOSIS_REPORT.md`):
- Pre-Stage-01 overhead through the old entry chain: **2,366 lines ≈ 9,464 tokens**
- Strict-glob session-loadable content total: **13,331 lines ≈ 53,324 tokens**

New startup cost (entry-point auto-load budget only):
- `ai-agent-entry-point.md`: 116 lines
- `drill-down-engine.md`: 188 lines
- **Total auto-load: 304 lines ≈ 1,216 tokens**

**Startup reduction vs. old pre-Stage-01 chain: 87.2%**  (9,464 → 1,216)

This exceeds the Change 1 goal of >60% session startup reduction.

---

## Files Added / Modified / Moved

**Added:**
- `prompts/orchestrators/drill-down-engine.md`
- `prompts/orchestrators/external-input-handler.md`
- `scripts/validate-instantiation.sh`
- `docs/optional/README.md`
- `prompts/outputs/current/epics.md` (verification output)
- `prompts/outputs/current/tasks-user-registration.md` (verification output)

**Modified:**
- `prompts/orchestrators/ai-agent-entry-point.md` (rewritten, 755 → 116 lines)
- `prompts/orchestrators/auto-setup-orchestrator.md` (removed 3 safeguard blocks)
- `scripts/validate-safeguards.sh` (path updates)
- `package.json` (safeguard-recovery path update)
- All 266 files under `prompts/modules/` except READMEs (INSTANTIATION RULES header inserted after H1)

**Moved (via `git mv`):**
- `PREVENTION_CHECKLIST.md` → `docs/optional/PREVENTION_CHECKLIST.md`
- `COMMIT_GUIDELINES.md`    → `docs/optional/COMMIT_GUIDELINES.md`
- `docs/SAFEGUARDS.md`      → `docs/optional/SAFEGUARDS.md`

---

## Residual Items (not in task scope)

- Pre-existing Template Architecture Guard test failures (4) remain and
  are unrelated to this rewrite. Flagged in `DIAGNOSIS_REPORT.md`.
- Stage pipeline files under `prompts/stages/**` (36,622 lines) are now
  orphaned from the auto-load path but still present on disk. Removal
  was not part of this rewrite task; they can be retained for optional
  consultation or pruned in a follow-up.
- `prompts/orchestrators/stage-pipeline-orchestrator.md`,
  `auto-request-router.md`, and similar orchestrators are no longer
  referenced from the entry point but are kept in place for explicit
  opt-in usage.

---

## Summary

All five changes from `REWRITE_TASK.md` have been implemented, tested,
and verified:

1. ✅ Safeguard bloat stripped (auto-load eliminated, docs moved).
2. ✅ Drill-down engine created (3-step, context-isolated).
3. ✅ Template instantiation rules + validation script added.
4. ✅ External-input handler created (one-time extraction, precedence
   rule).
5. ✅ Entry point rewritten to 2-file auto-load budget.

Test suite: no regression (4 pre-existing failures retained; 848 tests
passing throughout). End-to-end test brief produced a <500-token Step 1
output and a Step 3 sample with zero template references.
