# AI Prompt Library — Steering

Auto-deployed to IDE steering directories (`.kiro/steering/`, `.cursor/rules/`,
`.windsurf/rules/`, `.vscode/ai-steering/`, `.ai-steering/`, `.continue/rules/`).
Loaded by the IDE at every session. Keep it short.

---

## The flow (for non-trivial requests)

1. Read `.ai-prompts/prompts/AGENTS.md`.
2. Read `.ai-prompts/prompts/orchestrators/ai-agent-entry-point.md`.
3. The entry point chooses one of four modes:
   - **Trivial** (single-file edit) → skip engines, just do the work.
   - **Execute** (a validated plan exists and user says fix/implement/
     do-the-work) → `executor.md`.
   - **Gap-closure** (existing codebase; user asks to review, audit,
     fix gaps, productionize, write tests, finish) →
     `audit-and-remediate.md`. Chains into Execute automatically when
     the plan passes validation and the user's ask implied execution.
   - **Greenfield** (new project) → `drill-down-engine.md`.
4. If external material exists (designs/specs/source code under
   `working_copy/`, `prompts/working_copy/`, or project has real
   `src/`/`backend/`/`frontend/`/`android/`/`ios/` directories), also
   read `.ai-prompts/prompts/orchestrators/external-input-handler.md`.
5. Follow the chosen engine end-to-end. Do NOT stop between steps.

## Progress-checklist guard — don't advance stages on memory

When an engine stage produces many files (Step 3 generates one
`tasks-<feature>.md` per declared feature; on a real project that's
often 100+), run the progress script between task files:

```bash
bash .ai-prompts/scripts/step3-progress.sh prompts/outputs/current
```

The script lists every declared feature with `- [x]` (tasks file on
disk) or `- [ ]` (still needed). Do NOT advance to the next stage
while any `- [ ]` remains. Do NOT track completion in memory — the
script is the source of truth.

## Finalize — the ONLY way to say "Step 3 is complete"

When you believe all `tasks-*.md` files are written, run this **exact
one command** before telling the user you are done:

```bash
bash .ai-prompts/scripts/finalize.sh prompts/outputs/current
```

It chains the mechanical auto-fixers, runs the Revise Gate, writes a
canonical `revise-report.md`, and prints `executor_gate: pass` or
`fail`. You are NOT allowed to declare the drill-down complete unless
the last line printed is `✅ executor_gate: pass`. If it prints `fail`,
open `revise-report.md`, regenerate each file listed in
`failing_files:` via the engine (one feature at a time, never
hand-edit), and re-run `finalize.sh`.

Never hand-write `revise-report.md` — it is machine-produced and
tamper-checked (`revised_at` freshness + non-empty check arrays).

## Mechanical helpers (called by finalize.sh, can also be run alone)

```bash
# Missing comma before "so that" in Closes-user-story lines.
# (Invoked automatically by finalize.sh.)
bash .ai-prompts/scripts/fix-user-stories.sh prompts/outputs/current

# App-store screenshot matrix (15+ capture tasks per platform).
# Generates tasks-screenshots-<platform>.md with 2 tooling tasks +
# N locales × M devices capture tasks pre-filled with the canonical
# schema. You only fill in the UITest class / method per frame.
bash .ai-prompts/scripts/scaffold-screenshot-captures.sh \
    --target prompts/outputs/current --platform ios --app-name <Name>
bash .ai-prompts/scripts/scaffold-screenshot-captures.sh \
    --target prompts/outputs/current --platform android --app-name <Name>
```

After running any helper, re-run `finalize.sh` to refresh the gate.

## Execute-signal guard — do not ask for preference

If the user's prompt contains any of these words (case-insensitive),
they have ALREADY authorised you to execute end-to-end:

> **fix · implement · execute · run · do the work · build · ship ·
> close the gaps · write the tests · make it pass · productionize ·
> deploy-ready · review AND fix · audit AND fix**

When you see any of those, **do not** produce a message that ends with
a menu like:

> _Would you like me to: A. Execute critical gaps, B. Execute all, C. …_

That menu pattern is **forbidden** once execute-signals are present. It
presents a decision the user already made. Instead, start executing —
if the preflight gate is already green, pick the first unblocked task
and begin the execution loop per `executor.md`.

You may stop execution and report to the user only when:
- A hard preflight / validator gate fails (mechanical block).
- A task returns a real-world blocker (missing credentials, missing
  upstream API, test environment unavailable) — log it in
  `execution-log.md` as `blocked` and move on to the next.
- The executor's own stop rules fire (3+ consecutive blockers, a
  broader regression, user interrupt).

Politeness is not grounds to stop. The user already gave consent.

## IDE-native spec kits

Do NOT use Kiro's `.kiro/specs/`, Cursor's `.cursor/plans/`, or any
other IDE-native spec workflow in place of the library's engines. Our
outputs are richer and verifiable. Write to `prompts/outputs/current/`
regardless of which IDE is running.

## Reset signal

If the user asks to "reset", "re-integrate", "start fresh", OR the project
root contains `NEXT_ACTION.md`, `PROJECT_STATE.md`,
`IMPLEMENTATION_STATUS.md`, `QUICK_STATUS.md`, or any stale `AGENTS.md`
referencing `execution-orchestrator.md` / `auto-request-router.md` /
`stage-pipeline-orchestrator.md`, run this first:

```bash
bash .ai-prompts/scripts/reset-integration.sh --yes
```

## Do NOT auto-load

- Any orchestrator under `.ai-prompts/prompts/orchestrators/` without 
  following the entry-point routing.
- `.ai-prompts/docs/optional/` — safeguard docs, on-demand only.
- The full module catalog — the engine loads one module at a time during expansion.

## Authority

`.ai-prompts/prompts/AGENTS.md` is the single source of truth. If anything
in this file drifts from it, `AGENTS.md` wins.
