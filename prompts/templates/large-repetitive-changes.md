# Large Repetitive Changes Protocol

## Purpose
Provide a safe, repeatable playbook for large, repetitive code changes (e.g., adding coverage to an untested codebase, lint/refactor sweeps, bulk test failure triage, language rewrites, mass renames/upgrades) while avoiding regressions, bloated PRs, and context loss.

## When to Use
- Scope touches many files or test cases with similar edits
- Tasks like coverage backfill, lint/format enforcement, API/typing cleanup, bulk rename/migration, or cascading test failures
- Any change that could tempt a "one giant refactor" approach

## Anti-Patterns to Avoid
- Attempting the entire change in one pass or one PR
- Unscoped renames/refactors that break compilation
- Running the full build/test suite repeatedly without need
- Mixing unrelated changes in the same batch

## Quick-Start Protocol
Use this sequence for default execution; these are the required steps the property tests expect to be present.

## Implementation Patterns (Quick-Start Protocol)
1. **Clarify the goal and guardrails**  
   - What "done" means (e.g., coverage target, rename pattern, lint rules).  
   - Safe scope per batch (default: 3-5 files or one package).  
   - Allowed verification budget (commands, time, tokens).
2. **Inventory and Checklist**  
   - List candidate files/tests first; store as a checklist table.  
   - Mark status per file: `todo | in-progress | done | needs-followup`.  
   - Note the intended change per file (e.g., "add minimal tests", "rename foo→bar").
3. **Work Loop (per file/test)**  
   - Apply the smallest viable change.  
   - Sweep references after renames (`rg`/`find` + targeted edits) to keep code compiling.  
   - Run a local, cheap check: focused test, file-scoped lint/type-check, or narrow build.  
   - Update the checklist and jot outcomes/notes.
4. **Batch Review (every 3-5 files)**  
   - Run a slightly broader guardrail check (e.g., `tsc --noEmit`, `npm test path/to/suite`, `go test ./pkg/...` for touched packages).  
   - Stop if new breakage appears; fix before starting the next batch.
5. **Logging for Tests**  
   - Ensure failing tests emit actionable context (inputs, seed, feature flags).  
   - If logs risk sensitive data, gate them behind a debug flag/env var.
6. **Regression Guard**  
   - Preserve existing behavior; avoid new logic unless a verified bug is uncovered.  
   - If a test failure reveals a real bug, fix it minimally with evidence from existing usage patterns.
7. **Commit/PR Hygiene**  
   - Keep commits small and labeled by batch or file group.  
   - Strip debug artifacts before commit.  
   - Summarize checklist progress and verification commands in the commit message or PR notes.
8. **Handoff/State Updates**  
   - Update `EXECUTION_PROGRESS.md` (or local task log) with: completed files, remaining items, commands used, and any follow-ups.  
   - Leave a clear "resume here" pointer.

## Examples

### Example A: Type-safe rename sweep
```bash
# Batch 1 (3 files)
rg -l \"oldName\" src | head -n 3 | xargs sed -i '' 's/oldName/newName/g'
npm run lint -- src/file1.ts src/file2.ts src/file3.ts
npm run test -- tests/file1.test.ts
# Update checklist (file1.ts, file2.ts, file3.ts → done)
```

### Example B: Coverage backfill on legacy module
```bash
# Identify target files
rg --files-without-match \"describe\\(\" src/legacy | head -n 4 > /tmp/targets.txt
# For each file: add minimal smoke tests + focused assertions
while read file; do
  npm run test -- \"$file\" --runInBand
done < /tmp/targets.txt
# Batch guardrail
npm run test -- tests/legacy-suite
```

## Checklist Template
```markdown
| File/Area | Change | Status | Local Check | Notes |
|-----------|--------|--------|-------------|-------|
| src/foo.ts | rename foo→bar | todo | tsc --noEmit | impacts utils? |
| tests/foo.test.ts | add smoke test | done | npm test tests/foo.test.ts | |
```

## Verification Heuristics (Pick the Smallest That Proves Safety)
- **Renames/Refactors**: Type-check only (`tsc --noEmit`, `mypy`, `go vet`); targeted unit test for touched module.
- **Coverage Additions**: Run the new/modified tests plus nearest suite; avoid full coverage run until final batch.
- **Lint/Format Sweeps**: Lint only the touched files or directory; full lint once per milestone.
- **Bulk Test Failures**: Fix one failing test at a time; re-run only that test file/group; record root cause pattern.

## Decision Rules
- Stop expanding scope if batch checks fail; fix before adding new files.
- If three consecutive batches complete cleanly, optionally widen batch size slightly—but never beyond reviewable units.
- If context is unclear, pause and ask clarifying questions; do not guess on sweeping changes.

## Minimal Logging Snippet (for tests)
```typescript
// Wrap failing assertions with context; guard with DEBUG_TEST_LOGS
if (process.env.DEBUG_TEST_LOGS) {
  console.error('Test context', { scenario, input, featureFlag });
}
```

## Handoff Notes Template
```markdown
### Large Change Work Log
- Batches completed: 2 (files: a.ts, b.ts, c.ts)
- Next files: d.ts, e.ts (rename foo→bar)
- Pending verifications: run `npm run lint src/utils` after next batch
- Known risks: shared helper `baz` still uses old name in /legacy/
```

Follow this protocol whenever the task spans many similar edits. It keeps changes reviewable, compilation-safe, and resilient to handoffs.
