# AI Prompt Library

A prompt library that turns a short project brief into a set of atomic,
implementation-ready tasks — designed to run on **small context windows**
so a lower-end coding model can build production software one task at a
time without needing the whole project in context.

The library does this by replacing the common "one huge planning context"
approach with a **drill-down engine** that expands work in focused,
isolated steps:

1. **Seed** — the user's brief becomes 5–7 epics.
2. **Features** — each epic expands into 6–10 features, with real data
   models and API contracts.
3. **Tasks** — each feature expands into atomic tasks — one file, one
   function, real signatures, real acceptance criteria.

Each step runs in its own context, so token cost stays flat as the
project grows.

---

## Quick start

1. Clone (or submodule) this repo into your project as `.ai-prompts/`:

   ```bash
   git submodule add https://github.com/your-fork/ai-prompt-library .ai-prompts
   ```

2. Create `MY_PROJECT.md` at your project root by copying the template:

   ```bash
   cp .ai-prompts/MY_PROJECT.md.template MY_PROJECT.md
   # then edit MY_PROJECT.md and fill in the brief
   ```

3. Point your coding agent at the entry point:

   ```
   Read .ai-prompts/prompts/AGENTS.md, then
   .ai-prompts/prompts/orchestrators/ai-agent-entry-point.md,
   then follow its routing.
   ```

That is the whole setup. There are no scripts to run, no config to write,
no state files to create by hand.

---

## What the agent will do

Given the brief in `MY_PROJECT.md`, the agent will produce, in
`prompts/outputs/current/`:

- `epics.md` — the 5–7 epics (Step 1).
- `features-<epic>.md` — one per epic, with data model + API contract (Step 2).
- `tasks-<feature>.md` — one per feature, each task naming a real file
  path, a real function signature, a real API shape, and ≥3 independently
  testable acceptance criteria (Step 3).

After Step 3, a validation script (`scripts/validate-instantiation.sh`)
confirms no output contains template references or unreplaced
placeholders. The same check runs in the test suite, so regressions fail
the build.

---

## Who this is for

- A non-technical user who wants to turn an idea into a concrete,
  ordered task list without having to design the architecture themselves.
- A lower-end coding model (SWE 1.6-class) asked to implement one task at
  a time — each task is small enough to fit a modest context window.
- Engineers who want an opinionated scaffold for turning vague briefs
  into atomic work items.

---

## What this is NOT

- Not a code generator. The library produces specs/tasks; the implementing
  model writes the code.
- Not a substitute for code review, security review, or SRE discipline.
  Producing atomic, spec'd tasks does not by itself make the resulting
  software enterprise-grade; a reviewer still needs to check what the
  implementing model actually wrote.
- Not a runtime or a harness. The 3-step isolation is a prompt-level
  contract, not an enforced subprocess boundary.

---

## Key files

| File | Purpose |
|---|---|
| `prompts/AGENTS.md` | Single source of truth for AI agents. Read this first. |
| `prompts/orchestrators/ai-agent-entry-point.md` | Routes every request. |
| `prompts/orchestrators/drill-down-engine.md` | The 3-step engine. |
| `prompts/orchestrators/external-input-handler.md` | Runs when user supplies designs/specs/code. |
| `prompts/orchestrators/module-selection-index.md` | Intent → single-module lookup. |
| `prompts/modules/` | 266 dissolvable templates by domain. |
| `MY_PROJECT.md.template` | Brief template the user fills in. |
| `scripts/validate-instantiation.sh` | Post-Step-3 validator. |
| `docs/optional/` | Load-on-demand safeguard docs. |
| `docs/rewrite-history/` | Historical reports from the rewrite. |

---

## Tests

```bash
npm install
npm test
```

The suite includes property-based tests over all 266 modules, integration
tests for the library's internal structure, and the instantiation
validator. 4 tests are known-failing against the Template Architecture
Guard (pre-existing, unrelated to the new engine).

---

## License

See `LICENSE`.
