# Web Harness Recovery (Node + React)

Companion to `web.yaml`. Used by drill-down Step 3 when generating tasks that run vitest, jest, Playwright, or other Node-based test harnesses.

## Crash artifact locations

| Artifact | Path | Parser |
|---|---|---|
| Vitest/Jest JSON | `test-results/results.json` (configurable via `--reporter=json --outputFile=`) | `jq` if present, otherwise grep |
| JUnit XML | `test-results/junit.xml` | grep |
| Playwright trace | `test-results/<spec>/trace.zip` (path also in `playwright-report/`) | listing only — zip parsing is out of scope |
| Node fatal report | `report.<datetime>.<pid>.0.001.json` (when `--report-on-fatalerror` is set) | `jq` if present |

## Classification categories

- `harness_crash` — Port already in use (EADDRINUSE), Vitest worker process crashed, Vite cache corruption, Playwright browser crash, Node native module ABI mismatch.
- `code_crash_known` — Missing dependency in `package.json`, JS heap OOM (needs NODE_OPTIONS tuning).
- `code_crash_unknown` — Snapshot mismatch, uncaught rejection in test code, React error boundary trip. Surface the parsed stack to the user — the AI step must read the implicated source.

## Planning-time guidance

When generating Web test tasks, include in the prompt:

- The exact `**Test:**` command including `--reporter=json --outputFile=test-results/results.json` so the diagnose script has a stable file to parse. If using Playwright, `--reporter=junit`.
- A `NODE_OPTIONS` env hint only when the feature is known-memory-heavy (large fixtures, jsdom for big DOMs). Default tasks should not pre-bump the heap.
- The test should set its own port from an env var so port-conflict recovery doesn't break determinism. Avoid hard-coded ports.

## Hard rules

1. **Never `rm -rf node_modules`** as a harness recovery — it's too expensive and rarely fixes anything that targeted invalidation (`.vite`, `.cache`, `.vitest`) doesn't.
2. **`playwright install --with-deps` is heavy.** Run only when the catalog match is `playwright-browser-crash` and only once per task.
3. **Snapshot mismatches are not flaky.** They never get an auto-recovery — the user/AI must reason about whether the new snapshot is correct.
