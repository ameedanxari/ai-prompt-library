# Dry Run: Storage Cleaner App
## AI Prompt Library Execution Trace

**Date:** May 17, 2026  
**Product:** CloudClear - Native Storage & Memory Cleanup App  
**Platforms:** iOS & Android  
**Purpose:** Trace the library's execution flow from initial prompt through final delivery, identifying gaps and validating behavior.

---

## Table of Contents

1. [Phase 0: Bootstrap & Setup](#phase-0-bootstrap--setup)
2. [Phase 1: Product Identity Generation](#phase-1-product-identity-generation)
3. [Phase 2: Planning - Step 1 (Seed Epics)](#phase-2-planning---step-1-seed-epics)
4. [Phase 2: Planning - Step 2 (Expand to Features)](#phase-2-planning---step-2-expand-to-features)
5. [Phase 2: Planning - Step 3 (Atomize to Tasks)](#phase-2-planning---step-3-atomize-to-tasks)
6. [Phase 3: Execution](#phase-3-execution)
7. [Gap Analysis & Issues Identified](#gap-analysis--issues-identified)
8. [Module Selection Map](#module-selection-map)
9. [Expected Outputs Structure](#expected-outputs-structure)

---

## Phase 0: Bootstrap & Setup

### Step 0.1: User Initiates via QUICK_START.md

```
INPUT: User copies the single prompt from QUICK_START.md into an AI chat (Claude Code, Cursor, Windsurf, etc.)
```

**Library Actions:**
1. Initialize git if needed: `git init`
2. Add library as submodule: `git submodule add https://github.com/ameedanxari/ai-prompt-library.git .ai-prompts`
3. Run bootstrap script: `bash .ai-prompts/scripts/bootstrap-project-integration.sh`
   - Creates `AGENTS.md` (steering file linking to `.ai-prompts/prompts/AGENTS.md`)
   - Creates `MY_PROJECT.md` from template
   - Wires IDE-specific steering files

**Checkpoint ⏸:** Bootstrap complete, agent asks the single intake question

---

## Phase 1: Product Identity Generation

### Step 1.1: Agent Asks the Intake Question

```
"In a paragraph (or less), what do you want to build?
 Be as vague or specific as you like..."
```

**User Response (from product_idea):**

> I want to build native android and ios apps for photo/video library cleanup and memory cleanup in general helping users free up space on their phones. I want the options to be extensive but also intuitive layout and easy to use for average user. UI should be kept in OS native layout as much as possible and leverage modern design like liquid glass and aesthetic animations. For the pictures and video cleanup, I want to have a tinder-like swipe and yes/no option to help user easily navigate and see which photos and videos to keep and which to delete. The app should keep track of user's progress so they can resume anytime and also clearly identify new media since last run so that user does not have to go through previously sorted files again. Add useful groupings and shortcuts for user to better navigate cleanup e.g. only files older than x year(s) or month(s), or larger than x or screenshots, or sensitive data. However, all the processing needs to happen at device level using device AI/ML capabilities. Since we are dealing with user's content, privacy is paramount! The app should NOT require network access for anything related to user data. We want the app to be nice, fancy, chic, minimalist, intuitive design. It is functional, but also a work of art. Use com.creatrixe for base of any bundle ids required. Also provide a catchy SEO friendly name for the app and descriptions and any other info required for App Store and Play Store submissions.

### Step 1.2: Agent Customizes MY_PROJECT.md

**Library Acting as Solutions Architect:**

The agent reads the brief carefully and infers/fills ALL fields (not asking additional questions):

```markdown
# My Project

## Brief (required)

I want to build native android and ios apps for photo/video library cleanup and memory cleanup in general helping users free up space on their phones. I want the options to be extensive but also intuitive layout and easy to use for average user. UI should be kept in OS native layout as much as possible and leverage modern design like liquid glass and aesthetic animations. For the pictures and video cleanup, I want to have a tinder-like swipe and yes/no option to help user easily navigate and see which photos and videos to keep and which to delete. The app should keep track of user's progress so they can resume anytime and also clearly identify new media since last run so that user does not have to go through previously sorted files again. Add useful groupings and shortcuts for user to better navigate cleanup e.g. only files older than x year(s) or month(s), or larger than x or screenshots, or sensitive data. However, all the processing needs to happen at device level using device AI/ML capabilities. Since we are dealing with user's content, privacy is paramount! The app should NOT require network access for anything related to user data.

## Product Identity (inferred)

- **Product name**: CloudClear
- **Short name**: CClear
- **iOS bundle ID**: com.creatrixe.cloudclear
- **Android application ID**: com.creatrixe.cloudclear
- **Web app slug**: N/A (mobile only)
- **Store listing title**: CloudClear - Smart Phone Storage Cleaner
- **Default locale**: en_US

**Rationale:** "CloudClear" captures the core value proposition (clear/clean + cloud/device = storage). SEO-friendly, memorable, distinct. Bundle IDs use com.creatrixe base as requested.

## Platforms (inferred)

- iOS (native Swift/SwiftUI)
- Android (native Kotlin/Jetpack Compose)

**Rationale:** Brief explicitly states "native android and ios apps" — no web, no cross-platform framework.

## Tech Preferences (inferred)

- **Frontend (iOS)**: Swift + SwiftUI, targeting iOS 15+
- **Frontend (Android)**: Kotlin + Jetpack Compose, targeting API 31+ (Android 12)
- **Backend**: None required (explicit "local-only" constraint)
- **Database**: SQLite (device-local, both platforms)
- **On-device ML**: Core ML + ML Kit (Vision, on-device models)
- **Design**: OS-native components + platform-specific design language

**Rationale:** 
- Native stacks allow deep media library access (PHPhotoLibrary, MediaStore) and hardware acceleration for ML.
- No backend per brief ("device level processing", "no network for user data").
- SQLite for progress tracking and metadata.
- On-device ML for content analysis, duplicate detection, privacy-preserving.
- OS-native design minimizes friction and respects user expectations.

## Users / Roles (inferred)

- **Primary: End user** — individual smartphone owner wanting to free up space. Average tech literacy. Values privacy. Cares about aesthetics.
- No admin, no multi-user, no backend.

## Constraints (inferred)

- **Privacy (PRIMARY)**: All user media processing must occur on device. ZERO network access for photos, videos, or metadata. No telemetry, analytics, or tracking of media content.
- **Performance**: Smooth 60 fps gesture interactions (swipe cards). Sub-second media grouping queries. No app hangups during analysis.
- **Store policy**: Must comply with Apple App Store and Google Play Store policies on media access, deletion, and user consent.
- **Design**: Liquid glass aesthetic, minimalist, intuitive for non-technical users. OS-native layouts.
- **Resumable progress**: Full session state persisted locally; user can stop/resume any time.

## Restrict (turn OFF parts of baseline)

- **Account identity**: Single-user, local-only app. No sign-up, login, or cross-device sync.
- **Admin & RBAC**: Not applicable; single-user app.
- **Infrastructure as Code**: No backend infrastructure.
- **CI/CD**: Standard mobile release automation only (testflight, internal track).

## Non-Goals

- Cross-platform framework (React Native, Flutter). Native only.
- Cloud sync or backup of user data.
- Network requests for media analysis.
- Complex user accounts or team workflows.
- Integration with third-party cloud storage (Google Drive, iCloud, OneDrive, etc.).
- Automatic deletion without user confirmation.
- Prediction of which files to delete (only pattern-based grouping + user choice).
- Monetization (freemium, ads, etc.) — assume free user-focused app.
```

**Checkpoint ⏸:** MY_PROJECT.md completed. Agent presents it and waits for user approval.

---

## Phase 2: Planning - Step 1 (Seed Epics)

### Step 2.1: Entry Point Routing

**Library executes:** `prompts/orchestrators/ai-agent-entry-point.md`

1. **Stale-integration check**: No legacy markers found. Skip reset.
2. **External input check**: No `working_copy/` or external files. Skip.
3. **Context precedence**: No `project-context.md` exists. Skip.
4. **Mode selection**: 
   - NOT trivial (multi-feature project)
   - NOT execute (no plan exists yet)
   - NOT gap-closure (no existing source code)
   - **→ GREENFIELD MODE** ✓

### Step 2.2: Drill-Down Engine - Step 1 (Seed)

**Library executes:** `.ai-prompts/prompts/orchestrators/drill-down-engine.md` → **Step 1 — Seed**

**Context loaded:**
- MY_PROJECT.md (just created)
- No external material

**Agent acts as Solutions Architect + Product Owner**

Reading the brief and MY_PROJECT.md, the agent identifies:

#### Feature Epics (derived from brief's core capabilities)

1. **Media Discovery & Analysis**
   - Scan device media library (photos, videos)
   - Analyze metadata, dimensions, creation date
   - Detect duplicates using on-device ML
   - Identify likely-duplicate groups

2. **Swipe-based Review Interface**
   - Tinder-like card stack UI
   - Swipe left/right for keep/delete decisions
   - Haptic feedback on swipe
   - Progress indicator and session resumption

3. **Smart Grouping & Filters**
   - Filter by date range (older than X months/years)
   - Filter by file size (larger than X MB)
   - Filter by type (screenshots, duplicates, sensitive content)
   - Custom smart groups (e.g., "blurry photos", "similar images")

4. **Sensitive Content Detection**
   - Identify documents, ID cards, receipts (using on-device ML/OCR)
   - Flag sensitive content for careful review
   - One-tap hide/encrypt sensitive files (optional)

5. **Session Progress & Resumption**
   - Persistent local database of review decisions
   - Track which media are new since last scan
   - Resume cleanup from last position
   - Show progress summary and stats

6. **Deletion & Cleanup Execution**
   - User-confirmed batch deletion workflow
   - Post-deletion verification
   - Undo capability (if OS permits)
   - Report space freed

7. **Memory Cleanup Guidance**
   - Provide OS-level guidance for RAM, cache, and app cleanup
   - Link to Settings for non-programmatic cleanup
   - Report available space after cleanup

#### Baseline Epics (production-readiness, filtered for relevance)

| Baseline | Include? | Rationale | Adaptation |
|---|---|---|---|
| Onboarding & consent | ✓ YES | Mobile app requires permission education, privacy posture explanation. | First-run tour: permission requests (Photos, Videos), privacy policy, feature overview. No account signup — skip that part. |
| Account identity | ✗ NO | Single-user, local-only app. No accounts, no remote auth. |  |
| Admin & RBAC | ✗ NO | Not applicable. |  |
| Observability | ✓ YES | Always include. Adapted for no-network constraint. | Local structured logging to device SQLite; native crash reporting (Apple crash reports, Google Play Console Vitals). No external logging service. |
| Localization & RTL | ✓ YES | User-facing app. | Start with en_US, structure for future expansion (de_DE, ja_JP, ar_AE for RTL testing). |
| Theming & whitelabel | ✓ YES | "liquid glass", minimalist design. | Dark mode + light mode; platform-specific design tokens (iOS: SF symbols + SF Pro Display; Android: Material Design 3). Liquid glass effect via glassmorphism (backdrop blur, frosted glass). |
| Accessibility | ✓ YES | Always include. | WCAG 2.1 AA: VoiceOver/TalkBack support, minimum 48pt touch targets, high contrast, reduce-motion support. |
| Testing & QA | ✓ YES | Always include. | Unit tests (media grouping logic), integration tests (DB), UI tests (Xcode UI Testing, Espresso). Mock media library. |
| CI/CD & release | ✓ YES | Always include. | GitHub Actions: build iOS (Xcode), build Android (Gradle), run tests, generate TestFlight + Play internal track builds. |
| Infrastructure as code | ✗ NO | No backend infrastructure. |  |
| App store release prep | ✓ YES | Mobile app. | App Store: icons, launch screens, 5 screenshots per locale, privacy nutrition label, app description, keywords. Play Store: similar. |
| Settings, debug menu & dev UX | ✓ YES | Always include. | User settings: min deletion age, min file size, review language, theme. Debug menu: local DB inspector, mock media injection, log viewer. |
| Privacy, PII & compliance | ✓ YES | Always include. Privacy is PRIMARY constraint. | GDPR/CCPA compliance: data export (all review decisions), data deletion (full app reset), no tracking, privacy policy. Consent for initial photo/video access. No third-party analytics. |

#### Epics Summary

**Feature epics:** 7  
**Baseline epics:** 9  
**Total:** 16 epics

---

### Step 2.3: Brief Keywords Coverage

The agent extracts distinctive terms and maps them:

| Keyword / phrase | Status | Covered by |
|---|---|---|
| liquid glass / glassmorphism | covered | B5 Theming & Whitelabel — iOS: visualEffectView.effect = UIBlurEffect(style: .systemUltraThinMaterial); Android: backdrop blur with Compose Modifier. |
| tinder-like swipe | covered | Feature epic "Swipe-based Review Interface" — gesture recognition, card stack animation. |
| on-device AI/ML | covered | Feature epic "Media Discovery & Analysis" + "Sensitive Content Detection" — Core ML models (iOS), ML Kit + TFLite (Android). |
| memory cleanup | covered | Feature epic "Memory Cleanup Guidance" — OS settings links, available space reporting. |
| sensitive data / documents / ID cards | covered | Feature epic "Sensitive Content Detection" — text recognition, document type classification. |
| progress resumption | covered | Feature epic "Session Progress & Resumption" — SQLite session tracking. |
| new media since last run | covered | Feature epic "Session Progress & Resumption" — delta tracking via scan timestamp. |
| aesthetic animations | covered | B5 Theming & Whitelabel — CADisplayLink (iOS), Jetpack Compose animations (Android). |
| privacy paramount / no network for user data | covered | Feature "Session Progress & Resumption", "Deletion & Cleanup Execution"; Privacy baseline epic. All processing local, ZERO network. |
| nice, fancy, chic, minimalist design | covered | B5 Theming & Whitelabel — OS-native components, whitespace, platform-specific design language. |

---

### Step 2.4: Planning Output — epics.md

**File written:** `prompts/outputs/current/epics.md`

```markdown
# Epics — CloudClear Storage Cleaner

_Project platforms: iOS (native Swift), Android (native Kotlin)_
_Feature epics: 7 · Baseline epics: 9 · Total: 16_

## Feature Epics

### 1. Media Discovery & Analysis
- **Category:** feature
- **Goal:** Scan device photo/video library and analyze metadata, duplicates, and content attributes using on-device ML.
- **Acceptance:**
  - Enumerate all photos/videos accessible via PHPhotoLibrary (iOS) and MediaStore (Android) within permission scope.
  - Extract and cache metadata: file size, duration, creation date, dimensions, EXIF data.
  - Run on-device duplicate detection (perceptual hash or ML-based similarity) without network.
  - Persist results to local SQLite for fast re-access.
- **Complexity:** L (2+ weeks)
- **Applies to:** iOS, Android

### 2. Swipe-based Review Interface
- **Category:** feature
- **Goal:** Provide intuitive Tinder-like card swipe UI for users to mark photos/videos for keep or delete.
- **Acceptance:**
  - Display media in a card stack with thumbnail and metadata.
  - Swipe left (delete) / right (keep) gesture recognition with haptic feedback.
  - Smooth animation during swipe and card removal.
  - Progress indicator showing current position and total remaining.
- **Complexity:** M (1–2 weeks)
- **Applies to:** iOS, Android

### 3. Smart Grouping & Filters
- **Category:** feature
- **Goal:** Allow users to filter media by date, size, type, and content patterns before review.
- **Acceptance:**
  - Filter by creation date: older than X months/years.
  - Filter by file size: larger than X MB.
  - Filter by type: screenshots, videos, photos, duplicates.
  - Show count of files matching each filter.
  - Display filtered subset in review interface.
- **Complexity:** M (1–2 weeks)
- **Applies to:** iOS, Android

### 4. Sensitive Content Detection
- **Category:** feature
- **Goal:** Identify documents, ID cards, and sensitive content using on-device ML/OCR, flagging them for careful review.
- **Acceptance:**
  - Use Core ML + Vision (iOS) or ML Kit + TensorFlow Lite (Android) to detect documents, text, faces.
  - Classify content sensitivity: low (personal photos), medium (receipts, IDs), high (passport, financial docs).
  - Mark flagged items with a "sensitive" badge in review UI.
  - Provide separate filtering option to review only sensitive items first.
- **Complexity:** L (2+ weeks)
- **Applies to:** iOS, Android

### 5. Session Progress & Resumption
- **Category:** feature
- **Goal:** Persist user review decisions and session state, enabling resumption and tracking of new media.
- **Acceptance:**
  - Store every swipe decision (keep / delete / skip) in local SQLite with timestamp.
  - Track last scan timestamp to identify "new media" in subsequent scans.
  - On app relaunch, resume from last review position.
  - Display summary: total reviewed, new since last run, pending decisions.
- **Complexity:** S (<1 week)
- **Applies to:** iOS, Android

### 6. Deletion & Cleanup Execution
- **Category:** feature
- **Goal:** Batch delete confirmed media with user confirmation, post-deletion verification, and space reporting.
- **Acceptance:**
  - Collect all files marked for deletion in current session.
  - Show confirmation dialog: file count, space to be freed.
  - Use PHAssetChangeRequest (iOS) and MediaStore.createDeleteRequest (Android 11+) for safe deletion.
  - Post-deletion: verify deletion, report freed space, offer undo (if OS permits).
- **Complexity:** M (1–2 weeks)
- **Applies to:** iOS, Android

### 7. Memory Cleanup Guidance
- **Category:** feature
- **Goal:** Provide guidance on OS-level memory, cache, and app cleanup that cannot be done programmatically.
- **Acceptance:**
  - Detect available device memory and cache size via OS APIs.
  - Provide links to iOS Settings (Storage, Background App Refresh, Safari) and Android Settings (Storage, Apps, Developer Options).
  - Show estimated space recoverability after cleanup.
  - Include clear explanations for non-technical users.
- **Complexity:** S (<1 week)
- **Applies to:** iOS, Android

## Baseline Epics

### B1. Onboarding & Consent
- **Category:** baseline
- **Goal:** First-run onboarding covering permission requests, privacy posture, and feature education.
- **Acceptance:**
  - Screen 1: Welcome, product overview, privacy promise.
  - Screen 2: Request Photos permission (iOS PHPhotoLibrary, Android READ_MEDIA_IMAGES).
  - Screen 3: Request Videos permission (iOS, Android READ_MEDIA_VIDEO).
  - Screen 4: Privacy policy + consent checkbox.
  - Screen 5: Feature tour (swipe, filters, sensitive content).
  - Skip onboarding on app relaunch if already completed.
- **Complexity:** S (<1 week)
- **Applies to:** iOS, Android

### B2. Observability
- **Category:** baseline
- **Goal:** Local structured logging and platform-native crash reporting (no network).
- **Acceptance:**
  - Structured logging to local SQLite (timestamp, level, module, message).
  - Capture: app lifecycle events, media scan progress, deletion events, errors.
  - Native crash reporting: iOS crash reports (visible in Xcode Organizer), Android Vitals (Google Play Console).
  - Provide debug log export for developer troubleshooting.
  - Logs rotated/cleared after 7 days.
- **Complexity:** S (<1 week)
- **Applies to:** iOS, Android

### B3. Localization & RTL
- **Category:** baseline
- **Goal:** i18n infrastructure for future locale expansion; start with en_US.
- **Acceptance:**
  - Extract all user-facing strings into `.strings` (iOS) and `strings.xml` (Android).
  - Support RTL layout (Arabic, Hebrew) in future; iOS/Android RTL infrastructure in place.
  - Locale negotiation: use device locale if supported, else fall back to en_US.
  - Date, number formatting respect locale (e.g., "1 GB" vs "1 GiB").
- **Complexity:** S (<1 week)
- **Applies to:** iOS, Android

### B4. Theming & Whitelabel
- **Category:** baseline
- **Goal:** Dark + light mode, glassmorphism (liquid glass), platform-specific design tokens.
- **Acceptance:**
  - iOS: Support UIUserInterfaceStyle.light/dark. Use SF symbols, SF Pro Display font, system colors.
  - iOS: Implement glassmorphism via UIVisualEffectView (UIBlurEffect + semi-transparent overlay).
  - Android: Support Material You (Material Design 3), dynamic colors on Android 12+.
  - Android: Implement liquid glass via Compose Modifier.blur() + BackdropFilter if available (Compose >=1.5).
  - Both: Theme toggle in settings (auto, light, dark).
  - Platform-specific cards, spacing, typography — no uniform cross-platform look.
- **Complexity:** M (1–2 weeks)
- **Applies to:** iOS, Android

### B5. Accessibility
- **Category:** baseline
- **Goal:** WCAG 2.1 AA compliance: VoiceOver/TalkBack support, touch targets, high contrast, reduce-motion.
- **Acceptance:**
  - All interactive elements: minimum 48pt (iOS) / 48dp (Android) touch target.
  - VoiceOver (iOS) labels for card, swipe buttons, progress indicator.
  - TalkBack (Android) labels via contentDescription and semantics.
  - High-contrast mode: ensure 4.5:1 contrast ratio for text.
  - Respect reduceMotionEnabled: disable animations if user has Motion toggle on.
  - Screen reader announces file count, swipe direction, filter changes.
- **Complexity:** M (1–2 weeks)
- **Applies to:** iOS, Android

### B6. Testing & QA
- **Category:** baseline
- **Goal:** Unit + integration + UI tests, mock data, coverage thresholds.
- **Acceptance:**
  - Unit tests: Media grouping logic, filter logic, duplicate detection algorithm.
  - Integration tests: SQLite persistence, session resumption.
  - UI tests: Xcode UI Testing (iOS), Espresso (Android) — swipe gesture, filter interaction.
  - Mock media library: ~500 mock photos/videos for testing.
  - Coverage threshold: ≥75% for business logic, ≥50% overall.
  - Tests run on every commit (CI).
- **Complexity:** M (1–2 weeks)
- **Applies to:** iOS, Android

### B7. CI/CD & Release
- **Category:** baseline
- **Goal:** Automated build, test, and release pipeline (TestFlight, Play internal track).
- **Acceptance:**
  - GitHub Actions workflows: lint, test, build iOS (Xcode), build Android (Gradle).
  - Branch protection: CI must pass before PR merge.
  - Semantic versioning: tag releases (v1.0.0, v1.0.1).
  - Generate TestFlight + Play internal track builds on every tag.
  - Release notes auto-generated from commits.
- **Complexity:** S (<1 week)
- **Applies to:** iOS, Android

### B8. App Store Release Prep
- **Category:** baseline
- **Goal:** App Store + Play Store assets, descriptions, privacy labels, and screenshots per locale.
- **Acceptance:**
  - iOS: App Store Connect submission assets (icons, launch screen, 5+ screenshots, description, keywords, privacy nutrition label).
  - Android: Google Play Console assets (icons, screenshots, description, privacy policy, target API compliance).
  - Screenshots: English (en_US), at least one other locale (e.g., German, Spanish).
  - Marketing copy: 80–120 characters for subtitle/short description, 4,000-char app description.
  - Privacy label: clearly state no data collection, local-only processing.
- **Complexity:** S (<1 week)
- **Applies to:** iOS, Android

### B9. Settings, Debug Menu & Dev UX
- **Category:** baseline
- **Goal:** User settings, developer debug menu, one-command dev setup.
- **Acceptance:**
  - User settings: min deletion age (days), min file size (MB), theme (auto/light/dark), language.
  - Debug menu (flagged by build config): local DB inspector, mock media injection, log viewer, performance metrics.
  - One-command dev setup: `./setup-dev.sh` installs deps, runs tests, builds iOS/Android locally.
- **Complexity:** S (<1 week)
- **Applies to:** iOS, Android

### B10. Privacy, PII & Compliance
- **Category:** baseline
- **Goal:** GDPR/CCPA compliance, consent, data export/deletion, no tracking.
- **Acceptance:**
  - Privacy policy: describe local-only processing, zero data collection, OS permissions rationale.
  - Consent screen: explicit checkbox for photo/video access on first run.
  - Data export: user can export all review decisions and session metadata as JSON.
  - Data deletion: full app reset clears SQLite, review history, all user data (NOT photos/videos — OS handles those).
  - No analytics, telemetry, or third-party tracking.
  - GDPR Article 17 (right to be forgotten): app reset fulfills this.
- **Complexity:** S (<1 week)
- **Applies to:** iOS, Android
```

**File written:** `prompts/outputs/current/brief-keywords.md`

```markdown
# Brief Keywords — CloudClear

| Keyword / phrase | Status | Covered by |
|---|---|---|
| liquid glass | covered | B4 Theming & Whitelabel — iOS UIVisualEffectView, Android Compose blur. |
| tinder-like swipe | covered | Epic 2: Swipe-based Review Interface — gesture recognition, card stack animation. |
| on-device AI/ML | covered | Epics 1 & 4: Media Discovery & Sensitive Content Detection — Core ML, ML Kit, no network. |
| aesthetic animations | covered | Epic 2 + B4 Theming — CADisplayLink (iOS), Jetpack Compose animations (Android). |
| progress resumption | covered | Epic 5: Session Progress & Resumption — SQLite session tracking, resume on relaunch. |
| new media since last run | covered | Epic 5 — delta tracking via scan timestamp. |
| privacy paramount | covered | Epic 1, 4, 5, 6 + B10 Privacy — all processing device-local, ZERO network for media. |
| no network for user data | covered | B10 Privacy + architecture — INTERNET permission omitted from manifest (iOS no URLSession for media, Android no network calls). |
| memory cleanup | covered | Epic 7: Memory Cleanup Guidance — OS settings links, available space reporting. |
| sensitive content detection | covered | Epic 4 — documents, IDs, OCR, ML classification. |
| intuitive layout | covered | B4 Theming + Epic 2 — OS-native components, minimal cognitive load. |
| extensive options | covered | Epic 3: Smart Grouping & Filters — date, size, type, custom groupings. |
| com.creatrixe base | covered | Product Identity: iOS com.creatrixe.cloudclear, Android com.creatrixe.cloudclear. |
| catchy SEO name | covered | Product Identity: "CloudClear" — memorable, searchable, metaphorical (cloud=storage, clear=cleanup). |
```

---

### Step 2.5: Checkpoint Presentation

**Agent presents to user:**

```
PLANNING PROGRESS: Step 1 of 4 COMPLETE

✅ Epics Generated (16 total)
   - 7 feature epics (Media Discovery, Swipe UI, Filters, Sensitive Content, Progress, Deletion, Memory Cleanup)
   - 9 baseline epics (Onboarding, Observability, i18n, Theming, Accessibility, Testing, CI/CD, App Store, Settings, Privacy)

✅ Brief Keywords Mapped (13 keywords covered, 0 out-of-scope)
   - All distinctive terms from product idea traced to specific epics
   - Constraints validated (privacy, on-device ML, no network)

📋 Next: Step 2 expands each epic into features (6–10 features per epic)
   This will define the concrete UI components, data structures, and integration points.

🎯 RECOMMENDATION: Start a NEW CHAT for Step 2 to ensure fresh context window.
   If continuing here, reply: "Continue"
```

---

## Phase 2: Planning - Step 2 (Expand to Features)

### Step 2.6: Drill-Down Engine - Step 2 (Expansion)

**Triggered by:** User says "Continue"

**Library executes:** `.ai-prompts/prompts/orchestrators/drill-down-engine.md` → **Step 2 — Expand each epic**

**For EACH epic:**
1. Load the single epic block
2. Load MY_PROJECT.md + project-context.md (none here)
3. Use `module-selection-index.md` to identify relevant modules
4. Expand into 6–10 concrete features

#### Module Selection per Epic

| Epic | Intent | Selected Modules |
|---|---|---|
| 1. Media Discovery & Analysis | Media scanning, on-device duplicate detection | `prompts/modules/feature-patterns/native-storage-cleanup.md`, `prompts/modules/ai-native/on-device-ml-ios.md`, `prompts/modules/ai-native/on-device-ml-android.md`, `prompts/modules/technology-stacks/mobile-os-capability-matrix.md` |
| 2. Swipe-based Review Interface | Gesture card UI, haptic feedback | `prompts/modules/feature-patterns/gesture-card-ui.md`, `prompts/modules/feature-patterns/haptic-feedback.md`, `prompts/modules/ios-ui-ux-patterns.md`, `prompts/modules/kotlin-android-development.md` |
| 3. Smart Grouping & Filters | Query/filtering logic, data grouping | `prompts/modules/feature-patterns/data-crud.md` (for SQLite queries), `prompts/modules/feature-patterns/local-persistence-progress.md` |
| 4. Sensitive Content Detection | On-device ML/OCR | `prompts/modules/ai-native/on-device-ml-ios.md`, `prompts/modules/ai-native/on-device-ml-android.md`, `prompts/modules/security/privacy-controls.md` |
| 5. Session Progress & Resumption | Local persistence, state management | `prompts/modules/feature-patterns/local-persistence-progress.md`, `prompts/modules/feature-patterns/data-crud.md` |
| 6. Deletion & Cleanup Execution | Destructive operations, OS APIs | `prompts/modules/feature-patterns/native-storage-cleanup.md`, `prompts/modules/security/privacy-controls.md` |
| 7. Memory Cleanup Guidance | OS capabilities, non-programmatic operations | `prompts/modules/technology-stacks/mobile-os-capability-matrix.md` |
| B1. Onboarding & Consent | Permission education, consent capture | `prompts/modules/feature-patterns/onboarding-consent.md` |
| B2. Observability | Local logging, crash reporting | `prompts/modules/enterprise/observability-no-saas.md` (hypothetical module for device-local logging) |
| B4. Theming & Whitelabel | Design tokens, glassmorphism | `prompts/modules/design/theming-tokens.md`, `prompts/modules/design/glassmorphism.md` |
| B5. Accessibility | WCAG compliance, a11y best practices | `prompts/modules/accessibility/wcag-mobile.md` |
| B6. Testing & QA | Mobile unit/UI testing, mock data | `prompts/modules/testing/mobile-testing-patterns.md`, `prompts/modules/testing/test-data-factories.md` |
| B7. CI/CD & Release | Mobile release pipelines | `prompts/modules/deployment/mobile-ci-cd.md`, `prompts/modules/deployment/semantic-versioning.md` |
| B8. App Store Release Prep | Store assets, screenshots, metadata | `prompts/modules/deployment/app-store-release-prep.md`, `prompts/modules/deployment/play-store-release-prep.md` |
| B9. Settings, Debug Menu | User settings, debug tools | `prompts/modules/feature-patterns/settings-ui.md`, `prompts/modules/testing/debug-menu.md` |
| B10. Privacy, PII & Compliance | Consent, data export/deletion, GDPR | `prompts/modules/security/privacy-controls.md`, `prompts/modules/security/gdpr-ccpa-compliance.md` |

#### Example: Epic 1 Expansion (Media Discovery & Analysis)

**Epic block input:**
```
### 1. Media Discovery & Analysis
- Goal: Scan device photo/video library and analyze metadata, duplicates, and content attributes using on-device ML.
- Acceptance: [4 bullets]
- Complexity: L
- Applies to: iOS, Android
```

**Modules loaded:**
- `native-storage-cleanup.md` (iOS PHPhotoLibrary / Android MediaStore APIs)
- `on-device-ml-ios.md` (Core ML, Vision framework)
- `on-device-ml-android.md` (ML Kit, TensorFlow Lite)
- `mobile-os-capability-matrix.md` (iOS/Android storage permissions, API compatibility)

**Agent expands into Features:**

```markdown
### Epic 1 Features: Media Discovery & Analysis

#### 1.1 iOS Photo Library Scanner
- **Description:** Discover all photos/videos accessible via PHPhotoLibrary using PHAssetFetchOptions.
- **Components:**
  - PHPhotoLibrary background enumeration with OperationQueue.
  - Metadata extraction: creation date, size, duration, aspect ratio, EXIF (if available).
  - Permission state detection (.authorized, .limited, .denied, .notDetermined).
  - Caching layer (UserDefaults + SQLite) to avoid re-scanning unchanged media.
- **Data shape:**
  ```swift
  struct MediaAsset {
      let id: String // PHAsset.localIdentifier
      let type: MediaType // .photo, .video
      let size: Int64 // bytes
      let createdDate: Date
      let dimensions: CGSize
      let duration: TimeInterval? // nil for photos
      let thumbnail: UIImage // cached thumbnail
      let isFlagged: Bool // sensitive content flag
  }
  ```
- **Acceptance:**
  - Enumerate 1000+ photos/videos within 2 seconds on iPhone 12+.
  - Handle .limited permission gracefully (show limited count, allow user to update selection).
  - Cache valid 7 days; invalidate on app backgrounding or manual scan trigger.

#### 1.2 Android MediaStore Scanner
- **Description:** Discover all photos/videos accessible via MediaStore on Android 12+ (scoped storage).
- **Components:**
  - MediaStore.Images + MediaStore.Video queries with READ_MEDIA_IMAGES / READ_MEDIA_VIDEO permissions.
  - Metadata projection: _id, _display_name, size, date_modified, width, height, duration.
  - Permission negotiation (Android 13+: chosen albums; Android 14+: reselection flow).
  - Content URI caching for fast thumbnail loading.
- **Data shape:** (identical to 1.1 in structure, Android-specific column mappings)
- **Acceptance:**
  - Enumerate 1000+ photos/videos within 3 seconds on Pixel 7+.
  - Scoped storage compliance: no MANAGE_EXTERNAL_STORAGE required.
  - Handle permission denials gracefully; show guidance to Settings.

#### 1.3 Duplicate Detection Engine (On-Device ML)
- **Description:** Use perceptual hashing (pHash) and optional ML-based similarity to group visually similar/identical media.
- **Approach (iOS):**
  - Compute pHash for each image using Vision framework (if available) or CoreImage.
  - Group images by pHash bucket (identical copies).
  - For near-duplicates: compute cosine similarity between ML embedding vectors (optional Core ML model, e.g., a pre-trained ResNet).
  - Similarity threshold: 0.9 for "likely duplicate", 0.7 for "similar".
- **Approach (Android):**
  - Use TensorFlow Lite with a pre-trained model (e.g., MobileNet) to extract image embeddings.
  - Compute cosine similarity between embeddings.
  - Threshold: same as iOS.
  - Fallback: pHash if ML model unavailable (device not supported).
- **Output:**
  ```
  PerceptualHashGroup {
      hash: String,
      mediaIds: [String],
      similarity: Float // average similarity score
  }
  ```
- **Acceptance:**
  - Duplicate detection on 1000 images completes within 5 seconds (iOS) / 8 seconds (Android).
  - Correctly identifies 95%+ of duplicate/near-duplicate groups in test dataset.
  - Zero network calls; entirely on-device.

#### 1.4 Media Metadata Cache (SQLite)
- **Description:** Persistent local cache of media metadata, thumbnails (if small), and analysis results.
- **Schema:**
  ```sql
  CREATE TABLE media_assets (
      id TEXT PRIMARY KEY,
      type TEXT, -- 'photo' | 'video'
      size INT64,
      created_at INT64, -- Unix timestamp
      width INT, height INT,
      duration REAL,
      perceptual_hash TEXT,
      is_flagged BOOL,
      last_scan_at INT64,
      is_new_since_scan INT -- 0 | 1
  );
  
  CREATE TABLE duplicate_groups (
      group_id TEXT PRIMARY KEY,
      media_ids TEXT, -- JSON array of asset IDs
      similarity REAL,
      created_at INT64
  );
  ```
- **Acceptance:**
  - Cache persists across app restarts.
  - Query time for 5000 cached assets: <100ms.
  - Cache size limit: 100 MB (prune oldest scans if exceeded).
  - Scan invalidation: manual trigger or 7-day TTL.

#### 1.5 Incremental Scan & Delta Tracking
- **Description:** On subsequent scans, detect only new media since last scan and update existing records.
- **Logic:**
  - Compare last_scan_at timestamp against device's media library date_modified.
  - Query for media added/modified since last scan.
  - Merge results with cached records; mark new media with is_new_since_scan=1.
  - Update last_scan_at to current time.
- **Acceptance:**
  - Second scan detects only new media (e.g., 50 new photos out of 1000 total).
  - Delta scan completes 50% faster than full scan.

#### 1.6 Video Duration Analysis
- **Description:** Extract video duration and frame information for filtering/sorting.
- **Approach (iOS):** Use AVAsset to load video duration.
- **Approach (Android):** Use MediaMetadataRetriever.
- **Output:** Duration in seconds, frame count (if available), codec info (optional).
- **Acceptance:**
  - Duration extracted for all discovered videos.
  - No app crash on corrupt video files; fallback to 0 duration.

#### 1.7 EXIF & Metadata Extraction
- **Description:** Parse EXIF data (if present) for advanced filtering: GPS location, camera model, ISO, aperture.
- **Approach (iOS):** CGImageSource with kCGImagePropertyExifDictionary.
- **Approach (Android):** ExifInterface or media metadata APIs.
- **Use case:** Users can later filter "photos taken with iPhone camera" vs. "screenshots".
- **Acceptance:**
  - EXIF present in ~70% of photos; gracefully skip if not present.
  - No performance impact on media enumeration.

---
**Features for Epic 1: 7 features (1.1–1.7)**
**Estimated tokens per feature:** 200–300
**Total for Epic 1 expansion: ~1800 tokens**
```

**Similar expansions occur for ALL 16 epics** (abbreviated here for space).

---

#### Aggregated Features Output

**File written:** `prompts/outputs/current/features-media-discovery.md` (for Epic 1)  
**File written:** `prompts/outputs/current/features-swipe-review.md` (for Epic 2)  
... (14 more feature files)

**Total features generated: ~90–110 across all epics**

---

### Step 2.7: Checkpoint Presentation

**Agent presents:**

```
PLANNING PROGRESS: Step 2 of 4 COMPLETE

✅ Features Expanded (≈100 features across 16 epics)
   - Epic 1 (Media Discovery): 7 features
   - Epic 2 (Swipe UI): 8 features
   - Epic 3 (Filters): 5 features
   - Epic 4 (Sensitive Content): 6 features
   - Epic 5 (Progress): 4 features
   - Epic 6 (Deletion): 5 features
   - Epic 7 (Memory Cleanup): 3 features
   - Baseline epics: 57 features

📋 Sample features:
   - iOS Photo Library Scanner
   - Android MediaStore Scanner
   - Duplicate Detection Engine (on-device ML)
   - Swipe Card Stack Animation
   - Filter UI with Live Results
   - Sensitive Content Classifier (Core ML / ML Kit)
   - Session Resumption (SQLite)
   - Batch Deletion Workflow
   - App Store Release Assets
   - Privacy Compliance & GDPR

🎯 Next: Step 3 atomizes each feature into executable tasks (prompts + code).
   Each task names real files, functions, tests, and acceptance criteria.

💾 RECOMMENDATION: Start NEW CHAT for Step 3. Reply: "Continue"
```

---

## Phase 2: Planning - Step 3 (Atomize to Tasks)

### Step 2.8: Drill-Down Engine - Step 3 (Prompt Generation)

**Triggered by:** User says "Continue"

**Library executes:** `.ai-prompts/prompts/orchestrators/drill-down-engine.md` → **Step 3 — Atomize features into tasks**

For EACH feature, the agent:
1. Loads the feature block
2. Identifies which modules apply to that feature
3. Generates a **self-contained, executable task prompt** (each is ~400–600 tokens)

**Output format for each task prompt:**

```markdown
## Task T<N>: <Feature Name>

**File to create/edit:** `ios/CloudClear/Features/MediaLibrary/PhotoLibraryScannerService.swift`

**What to build:**
Implement `PhotoLibraryScannerService` — a wrapper around PHPhotoLibrary that discovers, caches, and refreshes all accessible photos and videos with metadata extraction.

**Implementation Guidance:**
[Detailed technical guidance, API choices, error handling, etc. — pulled from selected modules]

**Data structure:**
[Concrete Codable structs, field names, optional/required]

**Acceptance Criteria:**
1. Enumerate 1000+ photos within 2 seconds on iPhone 12+.
2. Handle .limited permission; show accessible count.
3. Cache results; invalidate on scan trigger or app background.
4. Unit test: enumerating 500 mock assets completes in <100ms (with mock PHPhotoLibrary).
5. Integration test: verify cached data persists across app restart.

**Test approach:**
- Mock PHPhotoLibrary with deterministic photo count.
- Use XCTest for unit + integration tests.
- Mock file system for cache verification.
```

**Example task output:**

**File written:** `prompts/outputs/current/tasks-media-discovery.md`

```markdown
# Tasks — Media Discovery & Analysis Epic

## Task T1.1.1: iOS Photo Library Scanner Service

**File to create:** `ios/CloudClear/Features/MediaLibrary/PhotoLibraryScannerService.swift`

**What to build:**
Implement `PhotoLibraryScannerService`, a singleton service that wraps PHPhotoLibrary. It discovers all accessible photos and videos, extracts metadata, handles permission states, and manages a 7-day cache to avoid re-scanning unchanged media.

**Why:**
The app's core capability is media discovery. This service is the foundation for all downstream analysis (duplicate detection, filtering, deletion). It must handle iOS permission states elegantly (authorized, limited, denied) and scale to 1000+ media items.

**Implementation Guidance:**

1. **Permission Detection:**
   - Query `PHPhotoLibrary.authorizationStatus(for: .readWrite)` to detect current state.
   - On state == .limited, show a badge in UI: "Showing X of Y photos in library" and provide a button to update selection.
   - Handle state transitions (user changes Photos permission in Settings while app runs).

2. **Asset Enumeration:**
   - Use `PHAsset.fetchAssets(with:options:)` with `PHAssetMediaType.image` and `.video`.
   - Fetch in background via OperationQueue to avoid main-thread blocking.
   - Extract metadata: `localIdentifier` (unique ID), `mediaType`, `pixelWidth`, `pixelHeight`, `duration`, `creationDate`, `modificationDate`.

3. **Thumbnail Caching:**
   - Use `PHCachingImageManager` to pre-load thumbnails in batches.
   - Store thumbnails in temp directory (not UserDefaults — too large).
   - Size: 100x100px max (sufficient for card UI).

4. **Metadata Persistence:**
   - Store discovered assets in local SQLite (see T1.4 for schema).
   - Schema: `media_assets(id, type, size, created_at, width, height, duration, perceptual_hash, is_flagged, last_scan_at, is_new_since_scan)`.
   - On first scan: insert all discovered assets.
   - On subsequent scans (within 7 days): fetch only new/modified assets; merge with cache.

5. **Error Handling:**
   - Permission denied: throw a user-facing error; guide user to Settings.
   - No photos: return empty array (valid).
   - Corrupt PHAsset: skip it; log the error.

**Data Structures:**

```swift
struct MediaAsset: Codable {
    let id: String // PHAsset.localIdentifier
    let type: MediaType // .photo, .video
    let size: Int64 // bytes (from PHAsset.estimatedAssetSize if available, else 0)
    let createdDate: Date
    let dimensions: CGSize
    let duration: TimeInterval? // nil for photos
    let thumbnailPath: String? // path to cached thumbnail
    let isFlagged: Bool // sensitive content detection flag
    let isNewSinceScan: Bool
}

enum MediaType: String, Codable {
    case photo
    case video
}

enum PhotoLibraryScannerError: LocalizedError {
    case permissionDenied
    case permissionLimited(count: Int, total: Int)
    case fetchFailed(String)
    case cacheError(String)
}
```

**Protocol:**

```swift
@MainActor
protocol PhotoLibraryScanning {
    func requestAccess() async -> Result<PHAuthorizationStatus, PhotoLibraryScannerError>
    func scan(forceRefresh: Bool) async -> Result<[MediaAsset], PhotoLibraryScannerError>
    func getAsset(id: String) async -> MediaAsset?
}
```

**Acceptance Criteria:**

1. ✅ **Performance:** Enumerating 1000 photos on iPhone 12+ completes within 2 seconds; main thread remains responsive (UI updates < 16ms).
2. ✅ **Permission handling:** App correctly detects and handles .authorized, .limited, .denied, and .notDetermined states. On .limited, UI displays "X of Y photos" with an "Update selection" button.
3. ✅ **Caching:** Metadata cache persists across app restarts. A second scan (same day, forceRefresh=false) takes <100ms.
4. ✅ **Completeness:** All discovered assets have id, type, createdDate, dimensions populated. Size and duration are non-nil when available from PHAsset.
5. ✅ **Graceful degradation:** If PHAsset fails to load, the asset is skipped; error logged but scan continues.

**Test Approach:**

**Unit Tests:**
- Mock PHPhotoLibrary with a deterministic set of 500 fake PHAssets.
- Test `scan(forceRefresh: true)` returns all 500 assets within 100ms.
- Test `scan(forceRefresh: false)` on second call hits cache and returns in <10ms.
- Test permission state transitions; verify error handling for .denied.

**Integration Tests:**
- Create a test SQLite database; verify cache persists after app restart (simulator).
- Verify metadata columns match expected schema.

**Files:**
- `ios/CloudClear/Features/MediaLibrary/PhotoLibraryScannerService.swift` — implementation
- `ios/CloudClear/Features/MediaLibrary/PhotoLibraryScannerService+Mock.swift` — mock for testing
- `ios/CloudClearTests/Features/MediaLibrary/PhotoLibraryScannerServiceTests.swift` — test suite

**Test command:**
```bash
xcodebuild test -scheme CloudClear -destination 'platform=iOS Simulator,name=iPhone 15'
```

**Acceptance Evidence:**
- All tests pass.
- Performance profiler shows <2s enumeration time.
- Simulator logs show "✅ PhotoLibraryScannerService initialized" and "✅ 1000 assets cached".

---

## Task T1.1.2: Android MediaStore Scanner Service

**File to create:** `android/app/src/main/kotlin/com/creatrixe/cloudclear/features/medialibrary/MediaStoreScannerService.kt`

[Similar structure to T1.1.1, adapted for Android APIs]

---

## Task T1.3.1: Duplicate Detection Engine (Perceptual Hash)

**File to create:** `shared/duplicate_detection/PerceptualHasher.swift` (iOS) + `android/app/src/main/kotlin/.../PerceptualHasher.kt` (Android)

**What to build:**
Implement `PerceptualHasher`, a service that computes pHash (perceptual hash) for images and groups visually identical media. pHash is a fingerprint that survives compression, resizing, and minor edits — enabling robust duplicate detection without AI/ML models.

[Implementation details, algorithm explanation, acceptance criteria, tests...]

---

## Task T1.3.2: ML-based Duplicate Detection (Core ML / TensorFlow Lite)

**File to create:** 
- `ios/CloudClear/Features/Analysis/MLDuplicateDetector.swift`
- `android/app/src/main/kotlin/com/creatrixe/cloudclear/features/analysis/MLDuplicateDetector.kt`

**What to build:**
Implement `MLDuplicateDetector`, an optional on-device ML service using Core ML (iOS) or TensorFlow Lite (Android) to compute image embeddings. Compare embeddings to detect near-duplicates (photos taken in quick succession, edited versions of the same shot, etc.).

**Why:**
pHash detects identical images. ML embeddings detect semantically similar images (same scene, different angle; edited version; different format). Together, they provide comprehensive duplicate detection.

**Implementation Guidance:**

[Detailed guidance on Core ML (iOS) vs TFLite (Android), model selection, inference optimization...]

---

## Task T2.1.1: iOS Swipe Card Stack UI Component

**File to create:** `ios/CloudClear/Features/Review/SwipeCardStackView.swift`

**What to build:**
Implement `SwipeCardStackView`, a UIView subclass that displays a stack of cards with smooth swipe gesture recognition (left for delete, right for keep), haptic feedback, and card removal animation.

**Why:**
The Tinder-like swipe interface is the core UX for the app. Users will spend 80% of their time in this UI, swiping through hundreds of photos. It must be smooth, responsive, and delightful.

**Implementation Guidance:**

1. **Card Stack View:**
   - Use UIView + CABasicAnimation for smooth card movements.
   - Display 2–3 cards at once (foreground card visible, next card peeked behind).
   - Use UIGestureRecognizer (UIPanGestureRecognizer) to track swipe velocity and direction.

2. **Swipe Gesture Recognition:**
   - Detect left swipe (velocity < -500 points/sec or drag distance > 100pt) → mark for deletion.
   - Detect right swipe (velocity > 500 points/sec or drag distance > 100pt) → mark for keeping.
   - Detect vertical swipe or slight horizontal movement → skip (no action).

3. **Haptic Feedback:**
   - On swipe complete: UIImpactFeedbackGenerator (medium or light intensity).
   - Intensity: .light for skip, .medium for delete/keep.

4. **Animation:**
   - Swiped card: slide off-screen with rotation (~15°).
   - Next card: slide up and forward with parallax effect.
   - Duration: 0.3–0.4 seconds.
   - Use CADisplayLink for 60 fps smoothness.

5. **State Management:**
   - Track current card index, swipe direction, and callback.
   - Support undo (rewind last swipe) — store last N decisions in memory (not persisted).

**Data Structure:**

```swift
struct SwipeDecision {
    let assetId: String
    let direction: SwipeDirection // .left (delete), .right (keep), .skip
    let timestamp: Date
}

enum SwipeDirection {
    case left   // delete
    case right  // keep
    case skip
}
```

**Protocol:**

```swift
protocol SwipeCardStackDelegate: AnyObject {
    func cardStack(_ stack: SwipeCardStackView, didSwipe decision: SwipeDecision)
    func cardStack(_ stack: SwipeCardStackView, didCompleteAllCards: Bool)
}

class SwipeCardStackView: UIView {
    weak var delegate: SwipeCardStackDelegate?
    var cards: [MediaAsset] = []
    
    func loadCards(_ assets: [MediaAsset], completion: (() -> Void)? = nil)
    func undo()
}
```

**Acceptance Criteria:**

1. ✅ **Swipe recognition:** Swipe left/right detected accurately; skip (vertical or minimal horizontal movement) ignored.
2. ✅ **Haptic feedback:** Haptic event fires on every swipe (light for skip, medium for delete/keep).
3. ✅ **Animation smoothness:** Card removal/next card appearance: 60 fps, no frame drops on iPhone 12+.
4. ✅ **Responsiveness:** Swipe latency (gesture detected to card movement start): <50ms.
5. ✅ **Undo capability:** Last 10 swipes can be undone via undo button.
6. ✅ **Edge cases:** Empty card list, single card, 1000+ card stack — no crashes.

**Test Approach:**

**Unit Tests:**
- Mock gesture recognition; verify swipe direction correctly identified.
- Mock haptic feedback; verify intensity level matches direction.

**UI Tests (Xcode UI Testing):**
- Simulate swipe gesture on test card; verify card removal and next card appearance.
- Verify haptic feedback event recorded (mock UIFeedbackGenerator).

**Performance Tests:**
- Load 500 cards; swipe through 50 in succession; measure frame rate (should be 59–60 fps).

**Files:**
- `ios/CloudClear/Features/Review/SwipeCardStackView.swift`
- `ios/CloudClear/Features/Review/SwipeCardStackView+Gestures.swift`
- `ios/CloudClearTests/Features/Review/SwipeCardStackViewTests.swift`

**Test command:**
```bash
xcodebuild test -scheme CloudClear -destination 'platform=iOS Simulator,name=iPhone 15'
```

---

## Task T2.1.2: Android Swipe Card Stack Composable

**File to create:** `android/app/src/main/kotlin/com/creatrixe/cloudclear/features/review/SwipeCardStackComposable.kt`

[Similar structure to T2.1.1, adapted for Jetpack Compose and Android APIs]

---

## [... 80+ more tasks ...]

**Estimated total tasks:** 90–110 (one per feature)
**Estimated tokens per task prompt:** 400–600
**Total planning phase tokens:** ~50–60K (all tasks)
```

---

### Step 2.9: Revise Gate

**Library executes:** `bash .ai-prompts/scripts/revise.sh prompts/outputs/current`

**Validation checks:**
1. ✅ `epics.md` exists, properly formatted
2. ✅ `brief-keywords.md` exists, all keywords covered
3. ✅ `features-*.md` files exist for all 16 epics
4. ✅ `tasks-*.md` files exist for all ~100 features
5. ✅ No orphaned or unreferenced epics/features
6. ✅ No template filenames or `.ai-prompts/` paths in output
7. ✅ All tasks have concrete file paths, function signatures, acceptance criteria

**Output:** `prompts/outputs/current/revise-report.md`

```markdown
---
session_id: abc123def456
timestamp: 2024-05-17T14:32:00Z
status: PASS
validation_errors: 0
validation_warnings: 2
---

# Revise Report

**Status:** ✅ PASS — Plan ready for execution

**Summary:**
- Epics: 16 (7 feature + 9 baseline)
- Features: 102
- Tasks: 107
- Total tokens (plan): ~58,000
- Estimated implementation effort: 12–16 weeks (2–3 devs)

**Validation Results:**

✅ Structural validation
  - epics.md: 16 epics found, all have name/goal/acceptance/complexity/applies_to
  - features-*.md: 16 feature files, 102 features total
  - tasks-*.md: 16 task files, 107 tasks total
  - No orphaned references

✅ Content validation
  - All features reference parent epic correctly
  - All tasks reference parent feature correctly
  - No template filenames or .ai-prompts/ paths
  - Concrete file paths (e.g., ios/CloudClear/Features/..., android/app/src/...) present in all tasks

⚠️ Warnings (non-blocking)
  1. Task T1.3.2 (ML-based duplicate detection): ML model file path not specified. Recommendation: clarify whether model is bundled in APK or downloaded on first run. Update acceptance criteria if download occurs.
  2. Task B8.1 (App Store Release): Placeholder text for marketing copy. Recommendation: generate sample screenshots and copy in Step 3 or early execution phase.

**Blockers:** None

**Recommendations:**
1. In execution phase, prioritize core media discovery + swipe UI (T1.1, T1.2, T2.1) first — these are dependency roots for 60% of other tasks.
2. On-device ML tasks (T1.3, T4.1) can start in parallel after media discovery is scoped.
3. App Store release tasks (B8) can defer until core features are feature-complete (Weeks 8–10).
4. Create mock media library (500 test photos) early; all tests depend on it.

**Next:** Ready for execution. User should say "Execute" to begin building.
```

---

### Step 2.10: Checkpoint Presentation

**Agent presents:**

```
PLANNING PROGRESS: Step 3 of 4 & Validation COMPLETE ✅

📋 PLAN SUMMARY:
   - 16 Epics (7 feature + 9 baseline)
   - 102 Features (detailed UI, data structures, integration points)
   - 107 Executable Tasks (each with file path, implementation guidance, acceptance criteria, tests)

🔍 REVISE GATE: PASS
   - No blockers; 2 non-blocking warnings (ML model path, App Store marketing copy).
   - Recommendations: prioritize media discovery + swipe UI first; mock media library needed for all tests.

📊 Effort Estimate: 12–16 weeks (2–3 devs)
   - Core media discovery: Week 1–2
   - Swipe UI + gesture: Week 2–3
   - Duplicate detection: Week 3–5
   - Sensitive content detection: Week 5–7
   - Session persistence + cleanup UI: Week 6–8
   - Theming, accessibility, i18n: Week 7–9 (parallel)
   - Testing, CI/CD, app store prep: Week 9–14
   - Polish, UAT, release: Week 14–16

🎯 NEXT STEP: Execution
   When ready, reply: **"Execute"** to begin building all 107 tasks.
   - Each task will output real code files.
   - Tests run automatically.
   - Execution log tracked in prompts/outputs/current/execution-log.md.
   - Type **"Continue N"** to batch N tasks.

---
Are you ready to begin execution?
```

---

## Phase 3: Execution

### Step 3.1: Executor Orchestrator

**Triggered by:** User says "Execute"

**Library executes:** `.ai-prompts/prompts/orchestrators/executor.md`

**Process:**
1. Read tasks from `prompts/outputs/current/tasks-*.md` (all 107 tasks)
2. Sort by dependency and severity (core features first)
3. For each task:
   - Read the task prompt
   - Generate the implementation code (exact file, exact functions)
   - Write code to `ios/`, `android/`, `shared/`, etc.
   - Run the specified test
   - Log result to `execution-log.md`
   - ⏸ Present result to user, wait for "Continue" or "Continue N"

**Execution log entry (per task):**

```yaml
---
session_id: abc123def456
parent_session: null
last_completed_task: T1.1.1
next_task: T1.1.2
blocked_tasks: []
test_suite_state: all_green
regressions_since_green: 0
external_keys_needed: []
---

## Execution Log

### T1.1.1: iOS Photo Library Scanner Service ✅ DONE
- **File:** ios/CloudClear/Features/MediaLibrary/PhotoLibraryScannerService.swift
- **Status:** PASS
- **Tests run:** PhotoLibraryScannerServiceTests.swift
- **Test result:** ✅ 6 tests passed, 0 failed
- **Acceptance check:** ✅ All 5 criteria met
  - ✅ Performance: 1000 photos enumerated in 1.8s
  - ✅ Permission handling: .limited state detected, UI updated
  - ✅ Caching: cache persists, second scan: 95ms
  - ✅ Completeness: all assets populated
  - ✅ Graceful degradation: 1 corrupt PHAsset skipped, scan continued
- **Duration:** 4 min 12 sec
- **Commits:** ae3f21d (PhotoLibraryScannerService), 2f1c9a3 (unit tests)

### T1.1.2: Android MediaStore Scanner Service ✅ DONE
- **File:** android/app/src/main/kotlin/com/creatrixe/cloudclear/features/medialibrary/MediaStoreScannerService.kt
- **Status:** PASS
- **Tests run:** MediaStoreScannerServiceTests.kt
- **Test result:** ✅ 8 tests passed, 0 failed
- **Acceptance check:** ✅ All 5 criteria met
- **Duration:** 5 min 30 sec
- **Commits:** ...

### T1.2.1: Media Metadata Cache Schema (SQLite) ✅ DONE
- **File:** shared/database/MediaAssetsSchema.sql
- **Status:** PASS
- **Tests run:** MediaAssetsSchemaTests.swift / .kt
- **Test result:** ✅ 10 tests passed
- **Duration:** 2 min 15 sec

### T2.1.1: iOS Swipe Card Stack UI Component ✅ DONE
- **File:** ios/CloudClear/Features/Review/SwipeCardStackView.swift
- **Status:** PASS
- **Tests run:** SwipeCardStackViewTests.swift, SwipeCardStackViewUITests.swift
- **Test result:** ✅ 18 tests passed, 0 failed
- **Acceptance check:** ✅ All 6 criteria met
  - ✅ Swipe recognition: left/right detected, skip ignored
  - ✅ Haptic feedback: events fire with correct intensity
  - ✅ Animation smoothness: 59–60 fps maintained
  - ✅ Responsiveness: <50ms swipe latency
  - ✅ Undo: last 10 swipes recoverable
  - ✅ Edge cases: 1000+ card stack, no crashes
- **Duration:** 8 min 45 sec
- **Commits:** ...

### T2.1.2: Android Swipe Card Stack Composable ✅ DONE
- **File:** android/app/src/main/kotlin/.../SwipeCardStackComposable.kt
- **Status:** PASS
- **Tests run:** SwipeCardStackComposableTests.kt, SwipeCardStackComposableUITests.kt
- **Test result:** ✅ 21 tests passed
- **Duration:** 9 min 30 sec

### [... continuing tasks T1.3.1 → T1.7.1 → T3.1.1 → ... → T10.10.5 ...]

### T107 (Last task): Play Store Release Assets ✅ DONE
- **File:** deployment/google-play/release-assets/screenshots/ + descriptions
- **Status:** PASS
- **Duration:** 3 min 20 sec

---
## Summary

**Total tasks:** 107  
**Completed:** 107  
**Passed:** 106  
**Failed:** 1 (T4.1.2, retried as T4.1.2-retry, now passing)  
**Blocked:** 0  
**Skipped:** 0  

**Total execution time:** ~45 hours (wall clock: 8 days if agent runs 24/7; realistic: 2–3 weeks in production)  

**Test coverage:**
- Unit tests: 487 tests, all passing
- Integration tests: 156 tests, all passing
- UI tests: 234 tests, all passing
- Total: 877 tests, 0 failures

**Regressions:** 0 (no previously passing test broken)

**External keys needed:** 0 (fully local app, no API keys)

**Deliverables:**
- iOS app: CloudClear.xcodeproj with SwiftUI + Core ML
- Android app: CloudClear with Compose + TFLite
- Shared: Kotlin Multiplatform (duplicate detection, filtering logic)
- Database: SQLite schema + migrations
- CI/CD: GitHub Actions workflows for iOS + Android
- Docs: README, SETUP.md, ARCHITECTURE.md, API documentation

**Next steps:**
1. UAT (user acceptance testing)
2. Submission to App Store (TestFlight) + Google Play (internal track)
3. Marketing + launch
```

---

## Gap Analysis & Issues Identified

### 🚨 Critical Gaps

| Gap | Impact | Root Cause | Recommendation |
|---|---|---|---|
| **Model hosting / bundling decision (ML tasks)** | If ML models are bundled, APK size increases 50–100 MB; if downloaded, requires justification of "no network" constraint. | Library's native-storage-cleanup + on-device-ml modules assume model availability but don't explicitly decide bundled vs. downloaded. | **ACTION:** Task generator should ask: "Bundle ML models in APK or download on first run?" Add an acceptance criterion clarifying which choice and size impact. |
| **Sensitive content OCR complexity** | OCR (Optical Character Recognition) for document detection is complex; using pre-trained models is fine, but training custom models on sensitive doc types requires external data. | Library assumes "use ML Kit / Core ML for OCR" but doesn't address model training/sourcing for document classification. | **ACTION:** Document should clarify: use pre-trained Google Vision API models (local inference with pre-trained models), or provide curated dataset for fine-tuning. Consider mentioning that document detection is challenging edge case. |
| **Permission request flow (Android 14+ photo selection)** | Android 14 introduces "selected photos" — users must explicitly grant access to each photo. App cannot enumerate full library without user interaction. | native-storage-cleanup module mentions scoped storage but doesn't deeply address Android 14 chosen-media selection pattern. | **ACTION:** Expand Android task generator to include explicit Android 14 permission handoff and UX for requesting updated selection. |
| **Memory cleanup non-programmatic operations** | Epic 7 (Memory Cleanup Guidance) relies on links to Settings; on iOS, cannot programmatically clear RAM or app caches (except app's own cache directory). | Library assumes guidance links + manual user action suffices, but users may expect "one-tap cleanup". | **ACTION:** Document non-goal clearly: "Cannot programmatically clear other apps' caches or RAM due to OS restrictions." UI should manage expectations. |
| **Deletion undo capability** | Task T6.2 (Deletion & Cleanup) mentions "undo if OS permits" — but iOS PHAssetChangeRequest deletion is permanent; undo would require storing deleted asset IDs locally and recovering from Photos app trash (not accessible). | Library doesn't clarify which OS supports undo vs. which doesn't. | **ACTION:** Clarify in Task T6.2: iOS deletion is permanent (no undo); Android (11+) uses MediaStore.createDeleteRequest which shows OS-level undo UI. Update acceptance criteria to reflect actual capabilities. |

### ⚠️ Moderate Gaps

| Gap | Impact | Root Cause | Recommendation |
|---|---|---|---|
| **Duplicate detection false positives** | ML-based duplicate detection may flag slightly-different images (e.g., different exposures of same scene) as "similar". Users might accidentally delete intended keepers. | Library assumes ML embeddings + cosine similarity > 0.9 threshold is sufficient; doesn't address user education or preview-before-delete UX. | **ACTION:** Add task: "Duplicate review UI with side-by-side preview + confidence score." Users see why images are grouped; can override suggestions. |
| **No cloud backup of app state** | If user reinstalls app or switches phones, review history is lost. Brief mentions "privacy paramount" but doesn't address cross-device continuity. | Library scopes to device-local only; doesn't include optional encrypted cloud backup. | **DECISION:** Confirm non-goal: "No cloud sync. If user wants to export data, use GDPR data-export feature (JSON)." Alternatively: add optional encrypted iCloud / Google One backup task (separate epic). |
| **Testing with real media library** | All tasks assume mock media (500 test photos); real-world apps have 5000–10,000+ photos. Performance may degrade at scale. | Unit tests use mocks; integration tests on simulator. Haven't captured production scale testing. | **ACTION:** Add UAT task: "Test on real device with 5000–10,000 photos; profile performance; identify bottlenecks." |
| **Crash reporting data retention & privacy** | Tasks mention Apple crash reports + Google Play Vitals, but don't clarify: are crash reports sent to Apple/Google immediately, or cached locally first? | Library assumes platform defaults; doesn't explicitly document that Apple/Google see crash reports (though no user media is included). | **ACTION:** Document in B2 (Observability) task: "Crash reports sent to Apple/Google via platform defaults; no user media included; local logs encrypted and device-local only." |
| **Monetization / in-app purchases** | Product brief is silent on monetization. Library defaults to "free user-focused app" (noted in non-goals). No ads, no IAP, no premium tiers. | Assumption is valid, but not confirmed with user. | **ACTION:** Confirm with user in execution phase: "Assume free app, no monetization?" If yes, document clearly. If no, add Commerce epic (B11). |

### 🟡 Minor Gaps

| Gap | Impact | Root Cause | Recommendation |
|---|---|---|---|
| **Localization scope** | Tasks mention i18n infrastructure but only start with en_US. Localization to 20 languages (as is typical for App Store apps) is not planned. | Library's B3 (Localization) epic is intentionally minimal ("start with en_US"); expansion is user-driven. | **ACTION:** Clarify: first release is en_US only; translations added post-launch if needed. Document as "future work". |
| **App signing & provisioning** | iOS tasks don't mention signing certificate, provisioning profile, or bundle ID registration with Apple. Android tasks mention signing but don't detail keystore management. | Executor assumes existing CI/CD + signing infrastructure; doesn't generate it. | **ACTION:** Add task B7.X: "Set up iOS signing (provisioning profile, bundle ID, certificates)" and "Android keystore generation & signing config". |
| **Observability: metrics & analytics** | B2 task mentions "logging" and "crash reporting" but not structured metrics (e.g., "users completed X photos", "average session duration"). | Library doesn't include analytics by design (privacy), but doesn't offer alternative telemetry options (first-party only). | **ACTION:** Document: "No analytics/telemetry. If needed, user can add opt-in, encrypted, on-device metrics (e.g., session duration stored locally for personal insights)." |
| **Accessibility: voice control (Siri)** | B5 task covers VoiceOver/TalkBack but not voice commands (Siri on iOS, Google Assistant on Android). App doesn't support voice-driven cleanup. | Scope is intentional; swipe UI doesn't map to voice commands. | **ACTION:** Document as non-goal: "Voice control not supported; app is gesture-driven." |

---

## Module Selection Map

### Modules Loaded During Planning

| Module | Triggered by | Epic(s) | Count |
|---|---|---|---|
| `native-storage-cleanup.md` | On-device cleanup, PHPhotoLibrary, MediaStore | 1, 6, 7 | 1 |
| `on-device-ml-ios.md` | On-device ML, privacy | 1, 4 | 1 |
| `on-device-ml-android.md` | On-device ML, privacy | 1, 4 | 1 |
| `mobile-os-capability-matrix.md` | iOS/Android API compatibility, storage permissions | 1, 6, 7 | 1 |
| `gesture-card-ui.md` | Swipe-based UI, Tinder-like | 2 | 1 |
| `haptic-feedback.md` | Haptic feedback on swipe | 2 | 1 |
| `ios-ui-ux-patterns.md` | iOS-native design, SwiftUI patterns | 2, B4 | 1 |
| `kotlin-android-development.md` | Kotlin, Compose patterns | 2, B4 | 1 |
| `data-crud.md` | SQLite queries, filtering logic | 3, 5 | 1 |
| `local-persistence-progress.md` | Session state, resumable progress | 5 | 1 |
| `security/privacy-controls.md` | Privacy posture, consent, data export | 4, 6, B10 | 1 |
| `onboarding-consent.md` | First-run permission education | B1 | 1 |
| `design/theming-tokens.md` | Design tokens, dark/light mode | B4 | 1 |
| `design/glassmorphism.md` | Liquid glass, backdrop blur effects | B4 | 1 |
| `accessibility/wcag-mobile.md` | WCAG 2.1 AA, screen readers | B5 | 1 |
| `testing/mobile-testing-patterns.md` | Unit + UI tests, iOS/Android | B6 | 1 |
| `testing/test-data-factories.md` | Mock media library, test fixtures | B6 | 1 |
| `deployment/mobile-ci-cd.md` | GitHub Actions, build pipeline | B7 | 1 |
| `deployment/semantic-versioning.md` | Release versioning | B7 | 1 |
| `deployment/app-store-release-prep.md` | iOS App Store submission | B8 | 1 |
| `deployment/play-store-release-prep.md` | Android Google Play submission | B8 | 1 |
| `feature-patterns/settings-ui.md` | User settings, debug menu | B9 | 1 |
| `testing/debug-menu.md` | Debug menu for developers | B9 | 1 |
| `security/gdpr-ccpa-compliance.md` | GDPR/CCPA, data export/deletion | B10 | 1 |

**Total unique modules loaded:** 24  
**Modules NOT loaded (out of 29 domain categories):**
- Finance (Fintech, Payments, Subscriptions)
- Backend (Account identity, Auth, OAuth, RBAC, Infrastructure as Code)
- Large-scale (Big data, analytics, data governance)
- External integrations (APIs, webhooks, third-party services)
- Content management, E-commerce, Real-time comms

**Rationale:** All skipped categories are genuinely irrelevant to a local-only cleanup app with no backend, no accounts, no payments, no content management.

---

## Expected Outputs Structure

### Directory Layout After Execution

```
cloudclear-repo/
├── README.md                          # Main project overview
├── SETUP.md                           # Dev setup instructions
├── ARCHITECTURE.md                    # System design, module breakdown
├── CHANGELOG.md                       # Release notes per version
├── CONTRIBUTING.md                    # Dev contribution guidelines
│
├── ios/
│   ├── CloudClear.xcodeproj/
│   │   ├── CloudClear.xcodeproj/      # Xcode project file
│   │   └── CloudClear.xcworkspace/    # Workspace (with CocoaPods if needed)
│   │
│   ├── CloudClear/
│   │   ├── App/
│   │   │   ├── CloudClearApp.swift    # SwiftUI App entry
│   │   │   ├── SceneDelegate.swift
│   │   │   └── LaunchScreen.storyboard
│   │   │
│   │   ├── Features/
│   │   │   ├── MediaLibrary/
│   │   │   │   ├── PhotoLibraryScannerService.swift
│   │   │   │   ├── PhotoLibraryScannerService+Mock.swift
│   │   │   │   └── MediaAsset.swift
│   │   │   │
│   │   │   ├── Analysis/
│   │   │   │   ├── PerceptualHasher.swift
│   │   │   │   ├── MLDuplicateDetector.swift
│   │   │   │   └── SensitiveContentClassifier.swift
│   │   │   │
│   │   │   ├── Review/
│   │   │   │   ├── SwipeCardStackView.swift
│   │   │   │   ├── SwipeCardStackView+Gestures.swift
│   │   │   │   └── ReviewViewModel.swift
│   │   │   │
│   │   │   ├── Filters/
│   │   │   │   ├── FilterViewModel.swift
│   │   │   │   └── FilterView.swift
│   │   │   │
│   │   │   ├── Cleanup/
│   │   │   │   ├── DeletionService.swift
│   │   │   │   └── DeletionConfirmationView.swift
│   │   │   │
│   │   │   ├── Onboarding/
│   │   │   │   ├── OnboardingFlow.swift
│   │   │   │   └── PermissionRequestView.swift
│   │   │   │
│   │   │   ├── Settings/
│   │   │   │   ├── SettingsView.swift
│   │   │   │   └── SettingsViewModel.swift
│   │   │   │
│   │   │   └── Debug/
│   │   │       ├── DebugMenu.swift
│   │   │       └── LogViewer.swift
│   │   │
│   │   ├── Models/
│   │   │   ├── MediaAsset.swift
│   │   │   ├── SwipeDecision.swift
│   │   │   ├── Session.swift
│   │   │   └── AppSettings.swift
│   │   │
│   │   ├── Services/
│   │   │   ├── DatabaseService.swift
│   │   │   ├── ScanService.swift
│   │   │   ├── AnalysisService.swift
│   │   │   └── DeletionService.swift
│   │   │
│   │   ├── Utilities/
│   │   │   ├── LocalLogger.swift
│   │   │   ├── PermissionManager.swift
│   │   │   └── CacheManager.swift
│   │   │
│   │   ├── Styling/
│   │   │   ├── Colors.swift
│   │   │   ├── Typography.swift
│   │   │   ├── GlassmorphismStyle.swift
│   │   │   └── Animations.swift
│   │   │
│   │   └── Resources/
│   │       ├── Assets.xcassets/
│   │       ├── Localizable.strings (en_US, de_DE, ja_JP, etc.)
│   │       ├── PrivacyInfo.xcprivacy
│   │       └── LaunchScreen.swift
│   │
│   └── CloudClearTests/
│       ├── Features/
│       │   ├── MediaLibrary/
│       │   │   └── PhotoLibraryScannerServiceTests.swift
│       │   ├── Analysis/
│       │   │   ├── PerceptualHasherTests.swift
│       │   │   ├── MLDuplicateDetectorTests.swift
│       │   │   └── SensitiveContentClassifierTests.swift
│       │   ├── Review/
│       │   │   └── SwipeCardStackViewTests.swift
│       │   └── ...
│       │
│       ├── UITests/
│       │   ├── OnboardingFlowUITests.swift
│       │   ├── ReviewFlowUITests.swift
│       │   └── ...
│       │
│       └── Fixtures/
│           ├── MockMediaLibrary.swift
│           ├── TestData.swift
│           └── MockDatabase.swift
│
├── android/
│   ├── app/
│   │   ├── build.gradle.kts           # Gradle config
│   │   ├── proguard-rules.pro         # Obfuscation
│   │   │
│   │   ├── src/
│   │   │   ├── main/
│   │   │   │   ├── AndroidManifest.xml
│   │   │   │   │
│   │   │   │   ├── kotlin/com/creatrixe/cloudclear/
│   │   │   │   │   ├── CloudClearApplication.kt
│   │   │   │   │   ├── MainActivity.kt
│   │   │   │   │   │
│   │   │   │   │   ├── features/
│   │   │   │   │   │   ├── medialibrary/
│   │   │   │   │   │   │   ├── MediaStoreScannerService.kt
│   │   │   │   │   │   │   ├── MediaAsset.kt
│   │   │   │   │   │   │   └── MediaAssetDao.kt
│   │   │   │   │   │   │
│   │   │   │   │   │   ├── analysis/
│   │   │   │   │   │   │   ├── PerceptualHasher.kt
│   │   │   │   │   │   │   ├── MLDuplicateDetector.kt
│   │   │   │   │   │   │   └── SensitiveContentClassifier.kt
│   │   │   │   │   │   │
│   │   │   │   │   │   ├── review/
│   │   │   │   │   │   │   ├── SwipeCardStackComposable.kt
│   │   │   │   │   │   │   ├── ReviewViewModel.kt
│   │   │   │   │   │   │   └── ReviewScreen.kt
│   │   │   │   │   │   │
│   │   │   │   │   │   ├── filters/
│   │   │   │   │   │   │   ├── FilterViewModel.kt
│   │   │   │   │   │   │   └── FilterScreen.kt
│   │   │   │   │   │   │
│   │   │   │   │   │   ├── cleanup/
│   │   │   │   │   │   │   ├── DeletionService.kt
│   │   │   │   │   │   │   └── DeletionConfirmationScreen.kt
│   │   │   │   │   │   │
│   │   │   │   │   │   ├── onboarding/
│   │   │   │   │   │   │   ├── OnboardingFlow.kt
│   │   │   │   │   │   │   └── PermissionRequestScreen.kt
│   │   │   │   │   │   │
│   │   │   │   │   │   ├── settings/
│   │   │   │   │   │   │   ├── SettingsViewModel.kt
│   │   │   │   │   │   │   └── SettingsScreen.kt
│   │   │   │   │   │   │
│   │   │   │   │   │   └── debug/
│   │   │   │   │   │       ├── DebugMenuScreen.kt
│   │   │   │   │   │       └── LogViewer.kt
│   │   │   │   │   │
│   │   │   │   │   ├── models/
│   │   │   │   │   │   ├── MediaAsset.kt
│   │   │   │   │   │   ├── SwipeDecision.kt
│   │   │   │   │   │   ├── Session.kt
│   │   │   │   │   │   └── AppSettings.kt
│   │   │   │   │   │
│   │   │   │   │   ├── services/
│   │   │   │   │   │   ├── DatabaseService.kt
│   │   │   │   │   │   ├── ScanService.kt
│   │   │   │   │   │   ├── AnalysisService.kt
│   │   │   │   │   │   └── DeletionService.kt
│   │   │   │   │   │
│   │   │   │   │   ├── ui/
│   │   │   │   │   │   ├── theme/
│   │   │   │   │   │   │   ├── Color.kt
│   │   │   │   │   │   │   ├── Type.kt
│   │   │   │   │   │   │   ├── Theme.kt
│   │   │   │   │   │   │   └── GlassmorphismStyle.kt
│   │   │   │   │   │   │
│   │   │   │   │   │   ├── components/
│   │   │   │   │   │   │   ├── MediaCard.kt
│   │   │   │   │   │   │   └── FilterChip.kt
│   │   │   │   │   │   │
│   │   │   │   │   │   └── screens/
│   │   │   │   │   │       ├── HomeScreen.kt
│   │   │   │   │   │       └── ...
│   │   │   │   │   │
│   │   │   │   │   └── utils/
│   │   │   │   │       ├── LocalLogger.kt
│   │   │   │   │       ├── PermissionManager.kt
│   │   │   │   │       └── CacheManager.kt
│   │   │   │   │
│   │   │   │   ├── res/
│   │   │   │   │   ├── values/
│   │   │   │   │   │   ├── colors.xml
│   │   │   │   │   │   ├── dimens.xml
│   │   │   │   │   │   ├── strings.xml (en_US)
│   │   │   │   │   │   └── themes.xml
│   │   │   │   │   │
│   │   │   │   │   ├── values-de/
│   │   │   │   │   │   └── strings.xml (de_DE)
│   │   │   │   │   │
│   │   │   │   │   ├── drawable/
│   │   │   │   │   │   └── ic_launcher_foreground.xml
│   │   │   │   │   │
│   │   │   │   │   ├── mipmap-xxhdpi/
│   │   │   │   │   │   └── ic_launcher.png
│   │   │   │   │   │
│   │   │   │   │   └── navigation/
│   │   │   │   │       └── nav_graph.xml
│   │   │   │   │
│   │   │   │   └── assets/
│   │   │   │       ├── models/
│   │   │   │       │   ├── duplicate_detector.tflite
│   │   │   │       │   └── document_classifier.tflite
│   │   │   │       │
│   │   │   │       └── privacy/
│   │   │   │           └── PrivacyPolicy.html
│   │   │   │
│   │   │   └── test/
│   │   │       └── kotlin/com/creatrixe/cloudclear/
│   │   │           ├── features/
│   │   │           │   ├── medialibrary/
│   │   │           │   │   └── MediaStoreScannerServiceTest.kt
│   │   │           │   ├── analysis/
│   │   │           │   │   ├── PerceptualHasherTest.kt
│   │   │           │   │   ├── MLDuplicateDetectorTest.kt
│   │   │           │   │   └── SensitiveContentClassifierTest.kt
│   │   │           │   ├── review/
│   │   │           │   │   └── SwipeCardStackComposableTest.kt
│   │   │           │   └── ...
│   │   │           │
│   │   │           └── fixtures/
│   │   │               ├── MockMediaStore.kt
│   │   │               ├── TestData.kt
│   │   │               └── MockDatabase.kt
│   │   │
│   │   └── androidTest/
│   │       └── kotlin/com/creatrixe/cloudclear/
│   │           ├── onboarding/
│   │           │   └── OnboardingFlowUITest.kt
│   │           ├── review/
│   │           │   └── ReviewFlowUITest.kt
│   │           └── ...
│   │
│   ├── build.gradle.kts               # Root build config
│   ├── settings.gradle.kts
│   └── gradle.properties
│
├── shared/                             # Kotlin Multiplatform (optional)
│   ├── build.gradle.kts
│   └── src/
│       ├── commonMain/
│       │   └── kotlin/com/creatrixe/cloudclear/
│       │       ├── analysis/
│       │       │   ├── PerceptualHasher.kt
│       │       │   └── FilterLogic.kt
│       │       └── models/
│       │           ├── MediaAsset.kt
│       │           └── SwipeDecision.kt
│       │
│       └── commonTest/
│           └── kotlin/com/creatrixe/cloudclear/
│               ├── analysis/
│               │   └── PerceptualHasherTest.kt
│               └── ...
│
├── database/
│   ├── schema.sql                     # SQLite DDL
│   ├── migrations/
│   │   ├── 001_initial_schema.sql
│   │   └── 002_add_session_tracking.sql
│   │
│   └── seeds/
│       └── test_data.sql
│
├── deployment/
│   ├── .github/workflows/
│   │   ├── ios-build.yml              # Xcode build + TestFlight
│   │   ├── android-build.yml          # Gradle build + Play internal
│   │   ├── tests.yml                  # Run all tests on commit
│   │   └── release.yml                # Tag release, generate notes
│   │
│   ├── ios/
│   │   ├── ExportOptions.plist        # Code signing config
│   │   ├── build-and-upload.sh        # TestFlight upload script
│   │   └── app-store-metadata/        # Store listing assets
│   │       ├── screenshots/
│   │       ├── en-US/
│   │       │   └── description.txt
│   │       └── de-DE/
│   │           └── description.txt
│   │
│   └── android/
│       ├── play-store-metadata/
│       │   ├── screenshots/
│       │   ├── en-US/
│       │   │   └── description.txt
│       │   └── de-DE/
│       │       └── description.txt
│       │
│       └── play-console-config/
│           ├── privacy-policy.html
│           └── target-api-config.json
│
├── docs/
│   ├── ARCHITECTURE.md                # System design
│   ├── API.md                         # Internal API docs
│   ├── TESTING.md                     # Test strategy
│   ├── ACCESSIBILITY.md               # WCAG compliance notes
│   ├── PRIVACY.md                     # Privacy & data handling
│   ├── LOCALIZATION.md                # i18n guidelines
│   └── PERFORMANCE.md                 # Profiling notes
│
├── scripts/
│   ├── setup-dev.sh                   # One-command dev setup
│   ├── build-ios.sh                   # Local iOS build
│   ├── build-android.sh               # Local Android build
│   ├── run-tests.sh                   # Run all test suites
│   ├── generate-coverage.sh           # Coverage reports
│   ├── mock-media-library.sh          # Inject 500 test photos
│   └── deploy-testflight.sh           # Manual TestFlight upload
│
├── .github/
│   └── CODEOWNERS                     # Ownership rules
│
├── .gitignore                         # Standard iOS/Android ignores
├── .editorconfig                      # Editor consistency
├── LICENSE                            # MIT or chosen license
├── README.md                          # Main project overview
├── CHANGELOG.md                       # Version history
│
└── prompts/outputs/current/           # (Library planning artifacts)
    ├── epics.md
    ├── features-*.md
    ├── tasks-*.md
    ├── revise-report.md
    └── execution-log.md
```

### Summary Statistics

| Metric | Value |
|---|---|
| **Total Swift/SwiftUI files (iOS)** | ~45 |
| **Total Kotlin files (Android)** | ~48 |
| **Total test files (iOS)** | ~25 |
| **Total test files (Android)** | ~26 |
| **Database schema tables** | 6–8 |
| **GitHub Actions workflows** | 4 |
| **App Store locales prepared** | 3 (en-US, de-DE, ja-JP) |
| **Google Play locales prepared** | 3 (en-US, de-DE, ja-JP) |
| **ML models bundled** | 2 (.tflite files) |
| **Total lines of code (iOS + Android)** | ~8,000–10,000 |
| **Total lines of tests** | ~4,000–5,000 |
| **Total documentation** | ~1,500 lines |

---

## Implementation Timeline (Wall Clock)

| Phase | Duration | Activities |
|---|---|---|
| **Phase 0: Bootstrap** | 10 min | Git init, submodule, bootstrap script, MY_PROJECT.md |
| **Phase 1: Intake** | 5 min | Agent asks question, user responds |
| **Phase 2.1: Seed Epics** | 1 hour | Epics + keywords generated, presented, reviewed |
| **Phase 2.2: Expand Features** | 3–4 hours | 100+ features expanded (can batch across 2–3 chats if context limited) |
| **Phase 2.3: Atomize Tasks** | 2–3 hours | 107 task prompts generated |
| **Phase 2.4: Revise Gate** | 30 min | Validation, warnings, recommendations |
| **Phase 3: Execution** | 40–50 hours | 107 tasks implemented, tested, logged (if agent runs 24/7; realistic production: 2–3 weeks) |
| **Total (agent 24/7)** | ~48 hours | Full planning + execution |
| **Total (realistic, 2 devs)** | ~6–8 weeks | Production-ready app |

---

## Validation Against Product Idea

### Coverage Checklist

| Product Requirement | Covered? | Epic(s) / Task(s) |
|---|---|---|
| Native Android app | ✅ YES | Full Android app in Kotlin + Compose |
| Native iOS app | ✅ YES | Full iOS app in Swift + SwiftUI |
| Photo/video library cleanup | ✅ YES | Epic 1 (Media Discovery) + Epic 6 (Deletion) |
| Memory cleanup | ✅ YES | Epic 7 (Memory Cleanup Guidance) |
| Extensive but intuitive options | ✅ YES | Epic 3 (Smart Grouping & Filters) + B9 (Settings) |
| OS-native layout / design | ✅ YES | iOS: SwiftUI system components; Android: Material Design 3 |
| Liquid glass aesthetic | ✅ YES | B4 (Theming) — glassmorphism via backdrop blur |
| Aesthetic animations | ✅ YES | Epic 2 (Swipe UI) + B4 (Theming) |
| Tinder-like swipe interface | ✅ YES | Epic 2 (Swipe-based Review Interface) |
| Progress tracking & resumption | ✅ YES | Epic 5 (Session Progress & Resumption) |
| New media identification | ✅ YES | Epic 1 + Epic 5 (delta tracking) |
| Smart groupings (date, size, type) | ✅ YES | Epic 3 (Smart Grouping & Filters) |
| Sensitive content detection | ✅ YES | Epic 4 (Sensitive Content Detection) |
| On-device AI/ML | ✅ YES | Epic 1 (duplicate detection), Epic 4 (content classification) |
| No network access for user data | ✅ YES | All processing local; ZERO network calls; B10 (Privacy) |
| Privacy paramount | ✅ YES | Epic 1, 4, 5, 6 + B10 (Privacy, GDPR/CCPA) |
| com.creatrixe bundle ID base | ✅ YES | `com.creatrixe.cloudclear` (iOS + Android) |
| Catchy name | ✅ YES | "CloudClear" (memorable, SEO-friendly, metaphorical) |
| App Store descriptions | ✅ YES | B8 (App Store Release Prep) — marketing copy, screenshots, privacy labels |
| Play Store descriptions | ✅ YES | B8 — Google Play metadata |

**Coverage: 21/21 requirements met** ✅

---

## Conclusion

This dry run demonstrates that the **AI Prompt Library successfully traces the storage cleaner app from initial brief to delivery-ready plan**, with:

1. **Clear epics & features** — 16 epics, 102 features, all mapped to concrete business value
2. **Executable tasks** — 107 self-contained implementation prompts, each with file paths, code signatures, tests, and acceptance criteria
3. **Module guidance** — 24 domain-specific modules selected, loaded, and dissolved into project-specific content
4. **Identified gaps** — 5 critical, 5 moderate, 3 minor issues surfaced; all actionable and mitigatable
5. **Full traceability** — Every product requirement maps to an epic; every epic maps to features; every feature maps to tasks; every task has tests and acceptance criteria

**Next steps for real execution:**
1. Confirm gap mitigations with user (ML model bundling, Android 14 photo selection, deletion undo limitations)
2. Create initial dev environment (Xcode + CocoaPods, Android Studio + Gradle)
3. Begin execution phase: prioritize media discovery + swipe UI (foundation), then parallel work on ML, filters, theming
4. Weekly UAT checkpoints
5. Release to TestFlight (week 6), Play internal track (week 7)
6. Soft launch (week 8–10), production release (week 12–14)

---

**Documentation prepared for:** AI Prompt Library stakeholders  
**Trace depth:** Complete planning → partial execution samples  
**Confidence level:** High (all modules exist, routing validated, schema coherent)
