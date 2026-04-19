# AI Agent Entry Point

Minimal, low-context entry for any user request. Maximum files auto-loaded
at startup: **2** (this file + `drill-down-engine.md`).

## Startup sequence (total: 2 file reads)

1. **Read this file.**
2. **Read `prompts/orchestrators/drill-down-engine.md`.**

That is the entire auto-load list at startup. If step D below routes to
gap-closure mode, you will also read `audit-and-remediate.md` (one more
file). Nothing else loads automatically — not safeguards, not stage
files, not modules, not templates, not router orchestrators. All of
those are opt-in, on demand, one at a time.

## Routing

After the two startup reads, execute these checks **in order** and do NOT
stop between them. Each step flows into the next without user confirmation.

### A. Stale-integration check (run FIRST — before anything else)

If the user asked to "reset", "re-integrate", "start fresh", or "clean up",
OR if you detect any of these pre-existing integration artifacts at the
project root, the project has stale state from an older library version:

- `NEXT_ACTION.md`, `PROJECT_STATE.md`, `DEVELOPMENT_LOG.md`,
  `EXECUTION_PROGRESS.md`, `IMPLEMENTATION_STATUS.md`,
  `IMPLEMENTATION_SUMMARY.md`, `PRODUCTION_COMPLETION_REPORT.md`,
  `QUICK_STATUS.md`, `COMPLETED_FEATURES.md`, `ARCHITECTURE_DECISIONS.md`,
  `KNOWN_ISSUES.md`
- A root `AGENTS.md` that references deleted orchestrators (e.g.
  `execution-orchestrator.md`, `auto-request-router.md`,
  `stage-pipeline-orchestrator.md`, `quality-gate-orchestrator.md`,
  `task-generation-orchestrator.md`)
- `.kiro/steering/` or `.cursor/rules/` that mentions "10-stage pipeline",
  "stage-01-intake", or "COVE" (all deprecated)

If any of the above is present, run the reset script first:

```bash
bash .ai-prompts/scripts/reset-integration.sh --yes
```

Then continue to step B. Do not stop to ask the user — they already asked
for reset or the stale state is unambiguous.

### B. External input check

Is there user-provided external material? Check for any of:
- Non-empty `working_copy/` or `prompts/working_copy/`
- Attached spec / PRD / RFC
- Existing source code the user wants to extend (e.g. `src/`, `backend/`,
  `frontend/`, `android/`, `ios/` with non-trivial content)
- `MY_PROJECT.md` lists external material under "External material"

If yes:
1. Read `prompts/orchestrators/external-input-handler.md` (file #3).
2. Execute it to produce `prompts/outputs/current/project-context.md`.
3. The handler itself continues to step C when it finishes — do not wait.

If no, continue directly to step C.

### C. Context precedence

Does `prompts/outputs/current/project-context.md` exist?
- **Yes:** load it before Step 1 of the engine. It takes precedence over any
  template defaults.
- **No:** skip.

### D. Mode selection — greenfield vs. gap-closure vs. trivial

Decide ONE of three modes based on the user's ask and the project state.

#### Mode 1 — Trivial (skip the engine entirely)

Use when the user's ask is a single-file edit or a one-line change:
"rename X", "fix typo", "tweak copy in file Y", "change the color".
Just do the work directly. Do not run either engine.

#### Mode 2 — Gap-closure (existing-project audit + remediation)

Use when ALL of these are true:
- Project has real source directories (`src/`, `backend/`, `frontend/`,
  `android/`, `ios/`, or similar) with non-trivial content (more than a
  few files).
- User's prompt OR `MY_PROJECT.md` indicates existing-work:
  - Prompt contains any of: "review", "audit", "fix gaps",
    "productionize", "production-ready", "finish", "complete",
    "test coverage", "deploy-ready", "functional completeness", "QA".
  - OR `MY_PROJECT.md` "External material" section lists source
    directories with completion percentages (e.g. "95% complete",
    "85% complete").

Route to `prompts/orchestrators/audit-and-remediate.md` and follow its
4-step flow (Component audit → Gap list → Remediation tasks → Validate).

#### Mode 3 — Greenfield (drill-down engine)

Use when the project is empty of meaningful source OR the user's brief
describes something new to build. This is the default when neither
Mode 1 nor Mode 2 applies.

Route to `drill-down-engine.md` and follow its 3-step flow
(Seed → Features → Tasks → Validate).

**Do NOT let an IDE's native spec-kit workflow (e.g. `.kiro/specs/`,
`.cursor/plans/`) override the mode selection above.** Our outputs are
richer and verifiable. If the IDE tries to produce its own spec files,
ignore that and write to `prompts/outputs/current/` per the engine's
rules.

### E. Execute the chosen engine (no pausing)

Run the engine end-to-end. Do NOT stop between steps. Do NOT say
"Step 1 complete, shall I proceed?". Proceed.

The only valid stop points are:
- A hard stop condition in the engine trips (placeholder remains,
  acceptance criteria insufficient, file path doesn't exist for a
  remediation task, etc.) — report to user with the specific file.
- All outputs written → run validation (next step).

### F. Validate

After the engine's last step:

```bash
bash scripts/validate-instantiation.sh
```

Report the validator's output to the user, then list every file written
under `prompts/outputs/current/`. That is the end of the flow.

## What NOT to auto-load

| File / group | Load when |
|---|---|
| `docs/optional/` (PREVENTION_CHECKLIST, COMMIT_GUIDELINES, SAFEGUARDS) | User explicitly asks for safeguard / commit-policy / change-impact guidance |
| `prompts/stages/**` | Never. The stage pipeline is superseded by the drill-down engine. |
| `prompts/orchestrators/stage-pipeline-orchestrator.md` | Never auto-load |
| `prompts/orchestrators/auto-setup-orchestrator.md` | Only on first-run project setup |
| Other orchestrators under `prompts/orchestrators/` | Only when their specific capability is requested |
| Full module catalog `prompts/modules/**` | Never all at once. The drill-down engine loads at most one module per expansion context. |

## Rules of engagement

1. **Isolation first.** Each expansion step starts from a minimal context.
   Do not carry prior-step artifacts into the next context beyond the
   specific slice being expanded.
2. **Two-file startup budget.** If you find yourself loading a third file
   before routing, stop — you're back in waterfall mode.
3. **No defensive auto-loads.** Safeguard, impact-guard, and self-healing
   orchestrators run on explicit request only.
4. **Templates subordinate to project context.** If
   `project-context.md` exists, it wins every conflict with a template.
5. **Dissolve, don't reference.** Task outputs must contain concrete file
   paths, function signatures, and API shapes — never template filenames
   or `.ai-prompts/prompts/` paths.

## Example session (typical flow)

```
User: "A todo app with user auth and team workspaces"

Agent loads: ai-agent-entry-point.md, drill-down-engine.md   (2 files)
Agent checks: working_copy/ empty → skip external handler
Agent checks: project-context.md missing → skip precedence load
Agent runs: drill-down-engine Step 1 (seed)
  → writes prompts/outputs/current/epics.md (5–7 epics, <500 tokens)
Agent runs: Step 2 per epic (fresh context each)
  → writes features-<epic>.md per epic
Agent runs: Step 3 per feature (fresh context each)
  → writes tasks-<feature>.md per feature
Agent runs: bash scripts/validate-instantiation.sh
  → ✅ all task outputs are fully instantiated
```

## Example session (with external material)

```
User: "Here are Figma exports in working_copy/ — build this"

Agent loads: ai-agent-entry-point.md, drill-down-engine.md   (2 files)
Agent detects: working_copy/ has files → load external-input-handler.md
Agent runs: external-input-handler
  → writes prompts/outputs/current/project-context.md
Agent runs: drill-down-engine Step 1 loading project-context.md first
  → epics reflect real screen names, real entities from the mockups
Agent runs: Steps 2–3 per epic/feature (project-context.md loaded in each)
Agent runs: validate-instantiation.sh
```

## Scope

This entry point handles **any** user request: new projects, feature additions,
refactors, bug fixes. For atomic one-off tasks (e.g. "rename this variable"),
skip the engine entirely and do the work directly — the engine is for
generating spec-to-task expansions, not for trivial edits.
