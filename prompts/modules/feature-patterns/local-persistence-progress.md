# Local Persistence And Progress

<!-- INSTANTIATION RULES
When the drill-down engine (or any orchestrator) uses this template:
1. Every placeholder — including {{variables}}, <TBD>, [project name], and generic
   field/function/endpoint names — MUST be replaced with project-specific values
   before output is written to prompts/outputs/current/.
2. The template filename MUST NOT appear in task output. Dissolve the template
   into concrete content; do not reference its source.
3. No strings beginning with ".ai-prompts/prompts/" may appear in the output
   (validated by scripts/validate-instantiation.sh).
4. Outputs must contain real data shapes, real file paths, and real function
   signatures specific to the project.
-->

## Purpose

Implement local-only state, resumable progress, scan snapshots, and
user decisions without introducing network sync. Use this module for
apps that must resume long-running workflows, remember reviewed items,
or detect new local content while remaining private and offline.

## Instructions

1. Choose the platform-native local store for queryable state and small
   preferences.
2. Define stable IDs and snapshot hashes before writing UI flow tasks.
3. Persist user decisions before advancing workflow cursors.
4. Compare snapshots to produce added/removed/changed/unchanged groups.
5. Add migration, export, deletion, and no-network acceptance criteria
   to every local persistence task.

## When To Use

- A user can pause and resume a review, cleanup, import, or audit flow.
- The app needs to avoid reprocessing items already reviewed.
- The app compares a previous local snapshot with current device state.
- The product explicitly says no backend, no cloud sync, no network for
  user data, or on-device only.

Do not use an offline sync queue unless the project has a backend and
the user explicitly wants cross-device sync.

## Storage Strategy

Use platform-native local storage:

- iOS: SwiftData or Core Data for queryable entities; UserDefaults only
  for tiny preferences; Keychain for secrets.
- Android: Room for queryable entities; DataStore for preferences;
  Android Keystore for secrets.
- Encrypt or avoid sensitive derived data. Prefer recomputable labels
  over persistent thumbnails, OCR text, or embeddings.
- Store schema versions and migrations from the first implementation.

## Core Data Shapes

Recommended entities:

- `WorkflowSession`: ID, started-at, updated-at, source snapshot ID,
  current cursor, status.
- `ReviewDecision`: item ID, decision (`keep`, `delete`, `skip`),
  decided-at, session ID, reason/source, optional undo deadline.
- `ProgressCheckpoint`: session ID, cursor, reviewed count, remaining
  count, last visible item ID.
- `LibrarySnapshot`: snapshot ID, scanned-at, visible item IDs hash,
  added IDs, removed IDs, changed IDs, authorization scope.
- `ProcessingState`: item ID, state (`pending`, `processing`,
  `processed`, `failed`), retry count, error code.
- `LocalRetentionPolicy`: entity name, retention period, wipe trigger.

## Implementation Pattern

1. Start a session with a stable snapshot of local items.
2. Persist every user decision before advancing the UI cursor.
3. Write checkpoints after small batches and on lifecycle events
   (`scenePhase`, `onStop`, background transitions).
4. On resume, load the latest non-complete session and validate that
   referenced local items still exist.
5. On scan, compare the current snapshot with the last completed
   snapshot to identify new, removed, and changed items.
6. Keep already-reviewed unchanged items out of default review queues.
7. Provide explicit reset controls for progress, decisions, and local
   derived analysis.
8. Keep all state local unless a separate product decision enables sync.

## Concurrency And Integrity

- Use a single writer or transaction boundary for decision + checkpoint
  updates.
- Make writes idempotent by item ID and session ID.
- Use monotonic cursors and stable sort keys so resume order is
  deterministic.
- Treat deleted or inaccessible local items as `removed`, not as
  failures.
- Keep migration tests for every schema version.

## Acceptance Rules

Every task generated from this module must include acceptance criteria
for:

- Resume after process kill or app restart.
- No network calls for progress, decisions, snapshots, or derived local
  analysis in local-only products.
- New item detection based on snapshot comparison.
- Already-reviewed unchanged items staying out of the default queue.
- Local data export and deletion when privacy baseline is in scope.
- Migration safety for existing local state.

## Testing Strategy

- Unit-test snapshot diffing for added, removed, changed, and unchanged
  IDs.
- Property-test that a decision written once is not duplicated by
  repeated resume attempts.
- Integration-test process restart by closing and reopening the
  persistence layer.
- UI-test that the resume entry point returns to the expected item or
  next valid item.
- Migration-test seeded prior schema versions.
- Static-test that no repository in the local-only persistence path
  imports networking clients.

## Examples

### Example 1: Snapshot Diff

```kotlin
data class SnapshotDiff(
    val added: Set<String>,
    val removed: Set<String>,
    val unchanged: Set<String>,
)

fun diff(previous: Set<String>, current: Set<String>) = SnapshotDiff(
    added = current - previous,
    removed = previous - current,
    unchanged = current.intersect(previous),
)
```

### Example 2: Resume Checkpoint

```swift
struct ProgressCheckpoint: Codable {
    let sessionId: UUID
    let cursor: Int
    let reviewedCount: Int
    let updatedAt: Date
}
```

Generated tasks should persist this checkpoint on lifecycle transitions
and validate it against current local items before resuming.
