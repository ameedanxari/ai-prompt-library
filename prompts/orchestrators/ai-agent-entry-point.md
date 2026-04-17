# AI Agent Entry Point

Minimal, low-context entry for any user request. Maximum files auto-loaded
at startup: **2** (this file + `drill-down-engine.md`).

## Startup sequence (total: 2 file reads)

1. **Read this file.**
2. **Read `prompts/orchestrators/drill-down-engine.md`.**

That is the entire auto-load list. Nothing else loads automatically —
not safeguards, not stage files, not modules, not templates, not router
orchestrators. All of those are opt-in, on demand, one at a time.

## Routing

After the two startup reads:

### A. External input check (one file read, conditional)

Is there user-provided external material? Check for any of:
- Non-empty `working_copy/` or `prompts/working_copy/`
- Attached spec / PRD / RFC
- Existing source code the user wants to extend

If yes:
1. Read `prompts/orchestrators/external-input-handler.md` (file #3).
2. Run it to produce `prompts/outputs/current/project-context.md`.
3. Return here.

If no, continue to step B.

### B. Context precedence

Does `prompts/outputs/current/project-context.md` exist?
- **Yes:** load it before Step 1 of the engine. It takes precedence over any
  template defaults.
- **No:** skip.

### C. Route to the engine

Execute `drill-down-engine.md`:
- Step 1 — Seed → `prompts/outputs/current/epics.md`
- Step 2 — Expand epics (one context per epic) → `features-<epic>.md`
- Step 3 — Expand features to atomic tasks (one context per feature) →
  `tasks-<feature>.md`

After Step 3, run `bash scripts/validate-instantiation.sh` to confirm no
task output references `.ai-prompts/prompts/` or contains unreplaced
placeholders.

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
