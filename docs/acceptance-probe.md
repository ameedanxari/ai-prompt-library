# Acceptance probe — how to verify a v1.x release still works

This doc is for maintainers. The library's quality claim is:

> A low-end coding model (SWE 1.6-class) can take a one-paragraph
> brief and ship production software end-to-end without a human
> mediating between planning stages.

Unit tests cover the mechanical gates. The acceptance probe covers
the claim itself — that a real low-end model, in a real IDE, on a
real brief, goes all the way through.

Run the probe before cutting a new tag.

---

## Setup

1. Create an **empty** directory somewhere outside this repo.

   ```bash
   mkdir ~/probe-$(date +%Y%m%d) && cd ~/probe-$(date +%Y%m%d)
   ```

2. Open an agentic AI chat in that directory. Use the weakest model
   you realistically expect consumers to run — SWE 1.6 on Windsurf is
   the canonical choice, because every field-test failure mode closed
   in v1.0 was discovered under that model.

3. Paste the `QUICK_START.md` prompt verbatim. Do not edit it.

4. Answer the "what do you want to build?" question with one sentence.
   Use a brief that names at least two distinctive keywords the agent
   has to remember all the way through Step 3 — that's what the
   brief-keyword coverage gate is there to catch.

   Known-good probe briefs:

   - _"A music app like Spotify but with crypto payments and
     offline-first playback."_ (tests payment integration +
     connectivity concern + long-lived distinctive keyword
     "offline-first")
   - _"A storage cleaner for Mac that detects duplicates, old
     downloads, and large unused apps, with a liquid-glass UI."_
     (tests local filesystem access + macOS visual keyword
     "liquid-glass")
   - _"A todo app for dental clinics, compliant with HIPAA."_ (tests
     regulatory keyword flowing into privacy + audit-log epics)

5. Walk away for ~30 minutes. The agent should not need you again.

---

## What a pass looks like

At the end of the run, the agent should hand you:

- A list of every file under `prompts/outputs/current/`. Expect:
  `epics.md`, `brief-keywords.md`, `features-*.md`,
  `external-accounts.md`, `tasks-*.md`, `revise-report.md`,
  `execution-log.md`.
- A tree of what got created in the app (`src/`, `backend/`,
  `frontend/`, `android/`, `ios/`, `infrastructure/` — whichever apply).
- One command to start the app locally.
- One command to run the tests.
- A list of external keys/accounts the user still needs (from
  `external-accounts.md` — the agent should NOT re-invent this list).
- A short summary from `execution-log.md`: tasks done, tasks blocked
  on external credentials, test suite state.

The run passes if ALL of the following hold:

- [ ] `prompts/outputs/current/revise-report.md` has
      `executor_gate: pass` in its frontmatter.
- [ ] `prompts/outputs/current/brief-keywords.md` exists, has ≥3
      rows, and every distinctive keyword from the brief appears as
      either `covered` (with an epic reference) or `out-of-scope`
      (with a reason).
- [ ] Every `tasks-*.md` task has: exactly one file path, a
      `change_type`, a `precise_change`, ≥3 acceptance bullets, a
      named `Test`, and a reasoned `Depends on`.
- [ ] `execution-log.md` starts with `---` (YAML envelope), has
      per-task journal entries, and no task is silently skipped.
- [ ] The start command the agent gives you actually runs without
      edits.
- [ ] The test command the agent gives you passes (or the failures
      are ONLY tasks the agent already flagged as `blocked` on
      missing credentials).

---

## What a fail looks like (and what to capture)

A fail is any of:

- The agent asked the user a question between stages other than the
  one Quick Start authorises.
- The agent ended with an A/B/C/D preference menu ("Would you like me
  to: A. Execute critical, B. Execute all, ...") — the
  execute-signal guard should have suppressed this.
- `revise-report.md` has `executor_gate: fail` and the agent did not
  regenerate once before stopping.
- A distinctive brief keyword is absent from `brief-keywords.md`.
- A task collapses multiple files into one (File: `src/`, or File:
  `src/a.ts, src/b.ts`).
- The executor started despite a red gate.
- The user's requested feature silently disappeared somewhere
  between epics → features → tasks.

When a probe fails, capture for the follow-up fix:

1. The full transcript of the agent's output, start to finish.
2. The contents of `prompts/outputs/current/` at the point of
   failure (tar it up).
3. The exact brief you used and the model / IDE / version.
4. Which invariant from the pass list above was violated.

Open an issue with the four pieces above. The fix should land as a
mechanical gate, not a prose instruction — see `CONTRIBUTING.md`.

---

## Probe cadence

- Run the probe before every `vX.Y.0` minor tag.
- Run the probe against at least two distinct brief-shapes
  (consumer-facing app + internal tool, ideally).
- Run the probe on at least two model / IDE combinations when you
  can — the execute-signal guard and the A/B/C/D menu behavior vary
  surprisingly across models.
- Patch releases (`vX.Y.Z` with Z > 0) can skip the probe if the
  patch is narrowly scoped (single validator tweak, docs only) and
  all 735 tests still pass.

---

## Field-test history

Prior probe runs that shaped the v1.0 gate set:

- **MenuMaker** — revealed execute-signal menus, missing
  user-story linkage, and the need for a revise gate that
  regenerates-then-stops rather than warns-and-continues.
- **StorageCleaner** — revealed silent brief-keyword dropout
  ("liquid glass" was implicit only), Step 3 stage-jumping when a
  feature's task file was never written, and hand-written narrative
  look-alikes for `revise-report.md` / `execution-log.md`.

Each closed failure mode has a corresponding commit tagged
`fix(<area>): …` in the history. Before cutting a new tag, skim the
log since the last tag and confirm each new commit is either closing
a new probe-discovered failure or tightening an existing gate — not
broadening surface area without a field-test justification.
