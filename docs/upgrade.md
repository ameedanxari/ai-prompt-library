# Upgrading an in-flight run to a newer library revision

A run records the library revision its artifacts match in the
`library_revision` field of the `execution-log.md` envelope (the executor
rewrites it at every envelope update from `git -C .ai-prompts rev-parse HEAD`).
On resumption the entry point (`.ai-prompts/prompts/orchestrators/ai-agent-entry-point.md`,
"Guard: Library-revision upgrade check") compares that field with the
checked-out library. When they differ it applies, once and in order, every
section below whose revision is later than the recorded one, then records
the new revision. Runs whose envelope has no `library_revision` (started
before the field existed) get every section.

Rules for this file:

- One section per library revision that changes what an in-flight run must
  look like. Revisions that only add scripts or tighten validators need no
  section; the next run of the validator reports what to fix.
- Section heading: `## <short sha> — <title> (<date>)`, oldest first. The
  sha is the library commit that introduced the change.
- One line per step, with the command to run or the file to write. A step
  must be safe to re-run (it checks whether its work exists before doing it).
- Never a step that rewrites product code or deletes evidence.

Which sections apply to a run:

```bash
git -C .ai-prompts rev-list "$(sed -n 's/^library_revision: *//p' prompts/outputs/current/execution-log.md)"..HEAD
```

A section applies when its sha is in that list. If the recorded value is
missing or cannot be resolved, every section applies.

## b813268 — run economy: owner decisions, bounded records, log rotation (2026-10-20)

Applies to every run started before `library_revision` existed. The
revision added the owner-decision protocol, the evidence-economy rules,
`rotate-execution-log.sh` and the convergence guard (see `CHANGELOG.md`,
"run economy"). An older run has an oversized log, no decisions file,
finished units demoted by acceptance bullets no unit can prove, and
possibly a local patch that lets the log grow past the size check.

1. Rotate the log: `bash .ai-prompts/scripts/rotate-execution-log.sh prompts/outputs/current` (moves older `done` entries to `prompts/outputs/archive/execution-log-NNN.md` and lists them under `journal_archives`; exit 0 with no change when the log is under 1 MiB).
2. If `prompts/outputs/current/owner-decisions.md` is missing, write it from any existing external-decisions table (`development/external-decisions.md` or the plan's "External decisions" section): one `## D-NNN` row per question in the schema of `.ai-prompts/prompts/orchestrators/executor.md` "Owner-decision protocol", with `Class`, priced `Options`, a `Recommendation`, a `Default if unanswered` and `Unblocks`; rows that wait on the same answer collapse into one.
3. Restore units whose only unmet acceptance bullets are unprovable (a second reviewer confirms, the blind re-review at the release commit passes, a failing run is retained before the fix): add one `assumable` row `## D-NNN · Restore units demoted by unprovable acceptance bullets` to `owner-decisions.md`, then append to `execution-log.md` one `execution-status-record` with `"followUp": true` per unit restoring its last proven status and naming that row; the bullets move to the release gate they belong to; run `bash .ai-prompts/scripts/validate-execution-status.sh prompts/outputs/current` afterwards.
4. Set `decision_policy` in the envelope from the owner's standing instruction: `recommend` only when the owner has said "decide on your recommendation", "continue until complete" or pre-authorised with `/goal`; otherwise `ask`. Never infer `recommend`.
5. Remove any local exemption of `execution-log.md` or `task-contract.json` from the oversized-file check: `git -C .ai-prompts log --oneline "$(git -C .ai-prompts merge-base HEAD origin/main)"..HEAD -- scripts/safety-check-commit.sh` lists local commits touching it; if any, `git -C .ai-prompts checkout "$(git -C .ai-prompts merge-base HEAD origin/main)" -- scripts/safety-check-commit.sh` and commit the removal in the library copy.
6. Record the upgrade: set `library_revision: $(git -C .ai-prompts rev-parse HEAD)` in the envelope (the entry point does this after the last applicable section) and commit the migrated files with the next task, not as a docs-only commit.
