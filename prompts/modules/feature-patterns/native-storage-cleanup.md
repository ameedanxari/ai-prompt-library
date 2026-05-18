# Native Storage Cleanup

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

Build native iOS and Android cleanup features that respect OS storage
boundaries, store policies, and user trust. Use this module for phone
storage cleaners, photo/video cleanup, duplicate media review, cache
cleanup guidance, and any feature that claims to free device space.

## Instructions

1. Identify which storage surfaces the product is allowed to inspect:
   Photos, Videos, app-owned cache, downloads, or OS settings guidance.
2. Declare unsupported surfaces as non-goals before task generation.
   General "memory management" claims must be reframed as storage
   cleanup, app-owned cache cleanup, and OS settings guidance only.
   Do not promise system RAM cleanup, other apps' private caches, or
   protected app containers.
3. Pick platform APIs by OS version and permission scope.
4. Generate separate iOS and Android implementation details for every
   platform-specific source task.
5. Add deletion confirmation, local-only privacy constraints, and store
   policy acceptance criteria to every destructive cleanup task.
6. Include an OS capability matrix before implementation for storage,
   memory, media, and cleanup claims. Each row must name iOS support,
   Android support, permissions, OS API, fallback behavior, user-facing
   copy constraints, and store-policy risk.

## Platform Boundaries

### iOS

- Use `Photos` (`PHPhotoLibrary`, `PHAsset`, `PHFetchOptions`) for photo
  and video discovery. Handle `.authorized`, `.limited`, `.denied`,
  `.restricted`, and `.notDetermined`.
- Do not promise deletion outside OS-permitted surfaces. Use
  `PHPhotoLibrary.performChanges` and `PHAssetChangeRequest.deleteAssets`
  for user-selected Photos assets.
- Treat limited library access as a first-class state. Show selected
  asset count, allow the user to update selection, and avoid implying
  the app scanned assets it cannot see.
- Do not claim to clear other apps' caches, system memory, or private
  containers. iOS does not permit general-purpose app-cache deletion.
- If the app offers "general cleanup", scope it to app-owned caches,
  Photos/Videos assets the user authorizes, and guidance screens for OS
  settings where direct deletion is not permitted.

### Android

- Use `MediaStore` for shared photos and videos. Use scoped storage APIs
  and request the narrowest media permissions:
  - Android 13+: `READ_MEDIA_IMAGES`, `READ_MEDIA_VIDEO`.
  - Android 14+: handle selected-photo access and reselection flows.
  - Android 12 and lower: use legacy read permissions only when needed.
- Use `MediaStore.createDeleteRequest` for deletion confirmation on
  Android 11+, and direct resolver deletion only where the OS allows it.
- Do not require `MANAGE_EXTERNAL_STORAGE` for consumer cleanup apps
  unless the product has a policy-valid file-manager use case and Play
  Console declaration. It is not appropriate for ordinary photo cleanup.
- Do not claim to clear other apps' private caches or RAM. Android
  restricts this. Limit app-cache cleanup to the app's own cache
  directory and provide guidance for OS settings where direct action is
  blocked.
- Omit `INTERNET` when the product is explicitly local-only and no
  non-user-data feature requires network access.

## Core Data Shapes

Use concrete project names when instantiating these shapes.

```swift
struct LocalMediaAsset: Identifiable, Codable {
    let id: String
    let localIdentifier: String
    let mediaType: MediaKind
    let createdAt: Date
    let modifiedAt: Date?
    let byteSize: Int64
    let pixelWidth: Int
    let pixelHeight: Int
    let durationSeconds: Double?
    let source: MediaSource
}
```

```kotlin
data class LocalMediaAsset(
    val id: String,
    val contentUri: String,
    val mediaType: MediaKind,
    val createdAtMillis: Long,
    val modifiedAtMillis: Long?,
    val byteSize: Long,
    val pixelWidth: Int,
    val pixelHeight: Int,
    val durationMillis: Long?,
    val source: MediaSource,
)
```

Recommended companion entities:

- `LibrarySnapshot`: scan ID, scanned-at time, visible asset IDs, total
  byte size, authorization state, platform version.
- `DeletionCandidate`: asset ID, reason, confidence, preview-safe
  metadata, selected state.
- `DeletionBatch`: batch ID, candidate IDs, requested bytes, confirmed
  bytes, status, created-at.
- `PermissionState`: authorization status, limited-selection count,
  required action, last checked.

## Implementation Pattern

1. Request the narrowest permission at first run and explain why before
   the OS dialog.
2. Enumerate media incrementally on a background dispatcher/task.
3. Normalize platform metadata into a shared local data model.
4. Persist scan snapshots locally so future scans can identify new
   media without re-reviewing already decided assets.
5. Stage deletion candidates; never delete during scanning or
   classification.
6. Require explicit user confirmation before invoking OS deletion APIs.
7. Re-scan affected IDs after deletion to verify actual freed space.
8. Record local-only deletion history without storing thumbnails or
   sensitive EXIF unless the product explicitly needs them.

## Sensitive-Content Guardrails

Sensitive-data detection in media cleanup should be conservative:

- Make sensitive scanning opt-in or clearly disclosed in onboarding.
- Run detection entirely on device.
- Store labels, confidence, and asset IDs locally; avoid storing full
  thumbnails, OCR text, face embeddings, document numbers, GPS
  coordinates, or other derived sensitive content unless required.
- Use explainable labels such as "possible document", "possible
  screenshot with text", or "possible ID card"; do not present labels as
  certainty.
- Require confidence thresholds by category. Low-confidence items should
  appear in a "review manually" group, not an auto-delete group.
- Never auto-delete sensitive candidates. The user must review each
  asset or explicitly select the group.
- Provide a way to disable sensitive detection and delete local
  sensitive labels.

## Acceptance Rules

Every cleanup task generated from this module must include acceptance
criteria for:

- Permission handling for granted, denied, and limited/scoped access.
- No unsupported claim such as clearing system RAM or other apps'
  private caches.
- No user media upload and no network path for photos, videos,
  thumbnails, OCR output, or ML embeddings.
- Deletion confirmation through OS-supported APIs.
- Verification of freed space or an honest explanation when the OS
  cannot report exact bytes.
- Store-policy-safe permission usage.

## Testing Strategy

- Unit-test metadata normalization with fake Photos / MediaStore records.
- Integration-test scanner behavior with deterministic fixture assets.
- UI-test permission-denied and limited-access flows.
- UI-test deletion staging and confirmation without destructive fixture
  loss.
- Property-test that already-reviewed asset IDs are not reintroduced
  unless the asset changed or the user resets progress.
- Static-check Android manifests for forbidden permissions such as
  `INTERNET` in local-only apps and `MANAGE_EXTERNAL_STORAGE` without an
  explicit policy justification.

## Examples

### Example 1: iOS Photo Deletion Flow

```swift
func deleteAssets(localIdentifiers: [String]) async throws {
    let assets = PHAsset.fetchAssets(withLocalIdentifiers: localIdentifiers, options: nil)
    try await PHPhotoLibrary.shared().performChanges {
        PHAssetChangeRequest.deleteAssets(assets)
    }
}
```

The generated task must wrap this in a user-confirmed deletion batch and
re-scan afterward; it must not delete assets directly from a classifier.

### Example 2: Android Scoped Deletion Flow

```kotlin
val deleteRequest = MediaStore.createDeleteRequest(contentResolver, uris)
launcher.launch(IntentSenderRequest.Builder(deleteRequest.intentSender).build())
```

The generated task must stage selected `content://` URIs first and let
the OS confirmation sheet authorize deletion.
