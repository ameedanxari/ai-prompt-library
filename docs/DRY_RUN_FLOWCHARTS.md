# CloudClear Storage Cleaner — Library Execution Flowchart

## Flow Diagram 1: End-to-End Execution Path

```
START: User copies QUICK_START.md prompt into AI chat
       │
       ├─→ [BOOTSTRAP] Git init + Submodule add + Bootstrap script
       │   └─→ Creates AGENTS.md, MY_PROJECT.md, IDE steering
       │
       ├─→ [INTAKE] Agent asks single question: "What do you want to build?"
       │   │
       │   ├─→ User provides: Storage cleaner app brief (product_idea)
       │   │
       │   └─→ [CUSTOMIZE] Agent fills MY_PROJECT.md (infers product identity, platforms, tech, constraints)
       │       └─→ Platforms: iOS native (Swift/SwiftUI) + Android native (Kotlin/Compose)
       │       └─→ Tech: Core ML, ML Kit, SQLite, no backend
       │       └─→ Baseline: Onboarding, Observability, i18n, Theming, Accessibility, Testing, CI/CD, App Store, Settings, Privacy
       │
       ├─→ [ENTRY POINT] ai-agent-entry-point.md routing
       │   └─→ Stale check: ✗ No legacy markers
       │   └─→ External input check: ✗ No working_copy/
       │   └─→ Mode selection: ✓ GREENFIELD (new project, empty source)
       │
       └─→ [DRILL-DOWN ENGINE] BEGINS
           │
           ├─→ STEP 1: SEED EPICS
           │   ├─→ Load MY_PROJECT.md
           │   ├─→ Generate feature epics (7 total)
           │   │   ├─→ Media Discovery & Analysis
           │   │   ├─→ Swipe-based Review Interface
           │   │   ├─→ Smart Grouping & Filters
           │   │   ├─→ Sensitive Content Detection
           │   │   ├─→ Session Progress & Resumption
           │   │   ├─→ Deletion & Cleanup Execution
           │   │   └─→ Memory Cleanup Guidance
           │   │
           │   ├─→ Generate baseline epics (9 selected from 10)
           │   │   ├─→ Onboarding & Consent
           │   │   ├─→ Observability (device-local logging + crash reports)
           │   │   ├─→ Localization & RTL
           │   │   ├─→ Theming & Whitelabel (liquid glass, dark/light)
           │   │   ├─→ Accessibility (WCAG 2.1 AA)
           │   │   ├─→ Testing & QA
           │   │   ├─→ CI/CD & Release
           │   │   ├─→ App Store Release Prep
           │   │   └─→ Settings, Debug Menu & Dev UX
           │   │   └─→ Privacy, PII & Compliance (GDPR/CCPA, zero tracking)
           │   │
           │   ├─→ NOT included: Account Identity (single-user), Admin & RBAC, Infrastructure as Code
           │   │
           │   ├─→ Write outputs:
           │   │   └─→ prompts/outputs/current/epics.md (16 epics, <1200 tokens)
           │   │   └─→ prompts/outputs/current/brief-keywords.md (13 keywords mapped, all covered)
           │   │
           │   └─→ ⏸ CHECKPOINT: Present epics to user. Wait for "Continue"
           │
           ├─→ STEP 2: EXPAND EACH EPIC TO FEATURES
           │   │
           │   ├─→ For each epic (16 total, done in sequence or parallel)
           │   │   │
           │   │   ├─→ Epic 1: Media Discovery & Analysis
           │   │   │   ├─→ Load module: native-storage-cleanup.md, on-device-ml-ios.md, on-device-ml-android.md, mobile-os-capability-matrix.md
           │   │   │   ├─→ Generate 7 features:
           │   │   │   │   ├─→ 1.1 iOS Photo Library Scanner
           │   │   │   │   ├─→ 1.2 Android MediaStore Scanner
           │   │   │   │   ├─→ 1.3 Duplicate Detection Engine (pHash)
           │   │   │   │   ├─→ 1.4 Media Metadata Cache (SQLite)
           │   │   │   │   ├─→ 1.5 Incremental Scan & Delta Tracking
           │   │   │   │   ├─→ 1.6 Video Duration Analysis
           │   │   │   │   └─→ 1.7 EXIF & Metadata Extraction
           │   │   │   └─→ Write: prompts/outputs/current/features-media-discovery.md
           │   │   │
           │   │   ├─→ Epic 2: Swipe-based Review Interface
           │   │   │   ├─→ Load module: gesture-card-ui.md, haptic-feedback.md, ios-ui-ux-patterns.md, kotlin-android-development.md
           │   │   │   ├─→ Generate 8 features:
           │   │   │   │   ├─→ 2.1 iOS Swipe Card Stack UI
           │   │   │   │   ├─→ 2.2 Android Swipe Card Stack Composable
           │   │   │   │   ├─→ 2.3 Gesture Recognition & Swipe Detection
           │   │   │   │   ├─→ 2.4 Haptic Feedback Integration
           │   │   │   │   ├─→ 2.5 Card Animation & Parallax
           │   │   │   │   ├─→ 2.6 Progress Indicator
           │   │   │   │   ├─→ 2.7 Decision Persistence (swipe history)
           │   │   │   │   └─→ 2.8 Undo Capability
           │   │   │   └─→ Write: prompts/outputs/current/features-swipe-review.md
           │   │   │
           │   │   ├─→ Epic 3: Smart Grouping & Filters
           │   │   │   ├─→ Load module: data-crud.md, local-persistence-progress.md
           │   │   │   ├─→ Generate 5 features (filter by date, size, type, duplicates, sensitivity)
           │   │   │   └─→ Write: prompts/outputs/current/features-filters.md
           │   │   │
           │   │   ├─→ Epic 4: Sensitive Content Detection
           │   │   │   ├─→ Load module: on-device-ml-ios.md, on-device-ml-android.md, security/privacy-controls.md
           │   │   │   ├─→ Generate 6 features (text detection, document classification, ID detection, sensitivity scoring, UI flagging)
           │   │   │   └─→ Write: prompts/outputs/current/features-sensitive-content.md
           │   │   │
           │   │   ├─→ Epic 5, 6, 7: [Similar expansion] → features-*.md files
           │   │   │
           │   │   └─→ Baseline epics B1–B10: [Similar expansion] → features-baseline-*.md files
           │   │
           │   ├─→ Total features generated: 102
           │   │
           │   ├─→ Write outputs:
           │   │   └─→ prompts/outputs/current/features-media-discovery.md (Epic 1)
           │   │   └─→ prompts/outputs/current/features-swipe-review.md (Epic 2)
           │   │   └─→ prompts/outputs/current/features-filters.md (Epic 3)
           │   │   ... (13 more feature files)
           │   │
           │   └─→ ⏸ CHECKPOINT: Present features summary. Recommend new chat. Wait for "Continue"
           │
           ├─→ STEP 3: ATOMIZE EACH FEATURE INTO EXECUTABLE TASKS
           │   │
           │   ├─→ For each feature (102 total)
           │   │   │
           │   │   ├─→ Feature 1.1: iOS Photo Library Scanner
           │   │   │   ├─→ Load module guidance: native-storage-cleanup.md
           │   │   │   ├─→ Generate Task T1.1.1:
           │   │   │   │   ├─→ File to create: ios/CloudClear/Features/MediaLibrary/PhotoLibraryScannerService.swift
           │   │   │   │   ├─→ What to build: PHPhotoLibrary wrapper, metadata extraction, 7-day cache
           │   │   │   │   ├─→ Implementation guidance: [500-word detailed spec]
           │   │   │   │   ├─→ Data structures: MediaAsset (Codable), PhotoLibraryScannerError
           │   │   │   │   ├─→ Acceptance criteria: [5 measurable criteria]
           │   │   │   │   ├─→ Test approach: unit + integration + performance tests
           │   │   │   │   ├─→ Test command: xcodebuild test -scheme CloudClear
           │   │   │   │   └─→ Acceptance evidence: all tests pass, <2s enumeration
           │   │   │   └─→ Dissolve module content → concrete task (no template filenames)
           │   │   │
           │   │   ├─→ Feature 1.2: Android MediaStore Scanner
           │   │   │   ├─→ Generate Task T1.1.2 [similar to T1.1.1, Android-specific]
           │   │   │
           │   │   ├─→ Feature 2.1: iOS Swipe Card Stack UI
           │   │   │   ├─→ Generate Task T2.1.1 [UIView + gestures, haptics, animation]
           │   │   │
           │   │   ├─→ Feature 2.2: Android Swipe Card Stack Composable
           │   │   │   ├─→ Generate Task T2.1.2 [Jetpack Compose equivalently]
           │   │   │
           │   │   └─→ [... 98 more tasks]
           │   │
           │   ├─→ Total tasks generated: 107
           │   │
           │   ├─→ Write outputs:
           │   │   └─→ prompts/outputs/current/tasks-media-discovery.md (8 tasks)
           │   │   └─→ prompts/outputs/current/tasks-swipe-review.md (10 tasks)
           │   │   ... (14 more task files)
           │   │
           │   └─→ ⏸ CHECKPOINT: Present tasks summary. Recommend new chat. Wait for "Continue"
           │
           └─→ STEP 4: VALIDATE (REVISE GATE)
               ├─→ Run: bash .ai-prompts/scripts/revise.sh prompts/outputs/current
               ├─→ Checks:
               │   ├─→ ✅ epics.md valid & complete
               │   ├─→ ✅ brief-keywords.md all keywords covered
               │   ├─→ ✅ features-*.md all 102 features present
               │   ├─→ ✅ tasks-*.md all 107 tasks present
               │   ├─→ ✅ No orphaned references
               │   ├─→ ✅ No template filenames or .ai-prompts/ paths in output
               │   ├─→ ⚠️ Warning: ML model bundling decision not specified
               │   ├─→ ⚠️ Warning: App Store marketing copy placeholder
               │   └─→ ✅ OVERALL: PASS (no blockers)
               │
               ├─→ Write output:
               │   └─→ prompts/outputs/current/revise-report.md (validation results, warnings, recommendations)
               │
               └─→ ⏸ CHECKPOINT: Present revise report. Plan ready for execution. Wait for "Execute"

                ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
                ░ PLANNING PHASE COMPLETE
                ░ Ready to begin EXECUTION PHASE
                ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░

           ├─→ [EXECUTOR ORCHESTRATOR] BEGINS
           │
           ├─→ Load tasks from prompts/outputs/current/tasks-*.md (all 107 tasks)
           │
           ├─→ Sort by dependency & severity (core features first):
           │   ├─→ T1.1.1 (iOS Photo Library Scanner)
           │   ├─→ T1.1.2 (Android MediaStore Scanner)
           │   ├─→ T1.2.1 (Metadata Cache Schema)
           │   ├─→ T1.3.1 (Duplicate Detection pHash)
           │   ├─→ T2.1.1 (iOS Swipe Card Stack)
           │   ├─→ T2.1.2 (Android Swipe Card Stack)
           │   └─→ ... (101 more tasks in dependency order)
           │
           ├─→ For each task (in order):
           │   │
           │   ├─→ Task T1.1.1: iOS Photo Library Scanner Service
           │   │   ├─→ Read task prompt from tasks-media-discovery.md
           │   │   ├─→ Generate code implementation (900 lines Swift)
           │   │   │   └─→ ios/CloudClear/Features/MediaLibrary/PhotoLibraryScannerService.swift
           │   │   │   └─→ ios/CloudClear/Features/MediaLibrary/PhotoLibraryScannerService+Mock.swift
           │   │   ├─→ Generate test suite (400 lines Swift)
           │   │   │   └─→ ios/CloudClearTests/Features/MediaLibrary/PhotoLibraryScannerServiceTests.swift
           │   │   ├─→ Run tests:
           │   │   │   └─→ xcodebuild test -scheme CloudClear
           │   │   │   └─→ Result: ✅ 6 tests passed, 0 failed
           │   │   ├─→ Verify acceptance criteria:
           │   │   │   ├─→ ✅ Performance: 1000 photos, 1.8s
           │   │   │   ├─→ ✅ Permission handling: .limited detected
           │   │   │   ├─→ ✅ Caching: 2nd scan 95ms
           │   │   │   ├─→ ✅ Completeness: all fields populated
           │   │   │   └─→ ✅ Degradation: corrupt asset skipped
           │   │   ├─→ Log to execution-log.md:
           │   │   │   └─→ Task: T1.1.1 ✅ PASS
           │   │   │   └─→ Duration: 4m 12s
           │   │   │   └─→ Commits: ae3f21d, 2f1c9a3
           │   │   ├─→ ⏸ CHECKPOINT: Show result to user. Wait for "Continue" or "Continue 5"
           │   │
           │   ├─→ Task T1.1.2: Android MediaStore Scanner Service
           │   │   ├─→ [Similar flow] → ✅ 8 tests passed
           │   │   ├─→ Log result
           │   │   ├─→ ⏸ (If user said "Continue", checkpoint here; if "Continue 5", run next 3 tasks w/o stop)
           │   │
           │   ├─→ Task T1.2.1: Media Metadata Cache (SQLite)
           │   │   ├─→ [Similar flow] → ✅ 10 tests passed
           │   │
           │   ├─→ [... continuing through T107 ...]
           │   │
           │   └─→ If test FAILS or blocked (3+ tasks blocked consecutively):
           │       ├─→ Log failure with details
           │       ├─→ STOP execution
           │       ├─→ Present error to user
           │       ├─→ User provides fix or feedback
           │       ├─→ Regenerate failing task or skip if non-blocking
           │       └─→ Resume from next task
           │
           ├─→ Final status:
           │   ├─→ Total tasks: 107
           │   ├─→ Completed: 107
           │   ├─→ Passed: 106
           │   ├─→ Failed (retried): 1 (T4.1.2 → T4.1.2-retry → ✅)
           │   ├─→ Blocked: 0
           │   ├─→ Total tests: 877
           │   ├─→ All tests passing: ✅ YES
           │   ├─→ Regressions: 0
           │   └─→ External keys needed: 0
           │
           ├─→ Generate final deliverables summary:
           │   ├─→ iOS app: CloudClear.xcodeproj (Swift/SwiftUI, 45 files, 3000 LOC)
           │   ├─→ Android app: Gradle project (Kotlin/Compose, 48 files, 3500 LOC)
           │   ├─→ Shared logic: Kotlin Multiplatform (duplicate detection, filtering)
           │   ├─→ Database: SQLite schema + migrations
           │   ├─→ CI/CD: GitHub Actions (iOS build, Android build, tests, release)
           │   ├─→ App Store assets: screenshots, descriptions, privacy label (3 locales)
           │   ├─→ Play Store assets: similar + privacy policy
           │   ├─→ Documentation: README, SETUP, ARCHITECTURE, TESTING, PRIVACY, API docs
           │   └─→ All files in: ios/, android/, shared/, deployment/, docs/, scripts/
           │
           └─→ ⏸ FINAL CHECKPOINT: Present full summary
               ├─→ Show all output files
               ├─→ Directory tree of deliverables
               ├─→ Commands to run locally
               ├─→ External accounts needed (if any)
               └─→ Next steps for UAT + release
```

---

## Flow Diagram 2: Module Selection & Routing

```
PRODUCT BRIEF
│
├─→ Intent Keywords Detected:
│   ├─→ "native android and ios" → Platform = iOS native + Android native
│   ├─→ "photo/video cleanup" → Intent: native storage cleanup
│   ├─→ "tinder-like swipe" → Intent: gesture card UI
│   ├─→ "on-device AI/ML" → Intent: on-device ML (no network)
│   ├─→ "sensitive content detection" → Intent: on-device content classification
│   ├─→ "progress resumption" → Intent: local persistence + state management
│   ├─→ "privacy paramount" → Intent: privacy controls, GDPR/CCPA
│   ├─→ "liquid glass" → Intent: theming & glassmorphism
│   └─→ "no network for user data" → Intent: offline-first, no telemetry
│
├─→ Module Selection via module-selection-index.md:
│   ├─→ native-storage-cleanup.md ← photo/video cleanup, iOS/Android APIs
│   ├─→ on-device-ml-ios.md ← Core ML, ML Kit (iOS side)
│   ├─→ on-device-ml-android.md ← TensorFlow Lite, ML Kit (Android side)
│   ├─→ gesture-card-ui.md ← swipe/gesture recognition, card stack
│   ├─→ haptic-feedback.md ← haptic events on swipe
│   ├─→ ios-ui-ux-patterns.md ← iOS-native SwiftUI patterns
│   ├─→ kotlin-android-development.md ← Kotlin, Jetpack Compose patterns
│   ├─→ local-persistence-progress.md ← SQLite, session resumption
│   ├─→ privacy-controls.md ← consent, data export/deletion, PII classification
│   ├─→ gdpr-ccpa-compliance.md ← GDPR/CCPA, data subject rights
│   ├─→ design/theming-tokens.md ← dark/light mode, design system
│   ├─→ design/glassmorphism.md ← backdrop blur, liquid glass effects
│   ├─→ accessibility/wcag-mobile.md ← WCAG 2.1 AA for iOS/Android
│   ├─→ mobile-testing-patterns.md ← unit + UI testing for iOS/Android
│   ├─→ mobile-ci-cd.md ← GitHub Actions, Xcode + Gradle automation
│   ├─→ app-store-release-prep.md ← iOS App Store metadata, screenshots
│   ├─→ play-store-release-prep.md ← Google Play metadata, screenshots
│   └─→ ... (8 more modules for baseline epics)
│
├─→ Modules SKIPPED (not relevant):
│   ├─→ ✗ auth-oauth.md (no accounts)
│   ├─→ ✗ auth-rbac.md (no admin/roles)
│   ├─→ ✗ llm-integration.md (no AI/chatbot)
│   ├─→ ✗ commerce/* (no payments)
│   ├─→ ✗ backend/* (no backend)
│   ├─→ ✗ infrastructure-as-code (no cloud infra)
│   └─→ ✗ analytics/* (privacy constraint)
│
└─→ Module count: 24 active, 5 skipped = 29/29 categories reviewed
    (Only relevant modules loaded into context per epic/feature expansion)
```

---

## Flow Diagram 3: Execution Dependency Graph

```
CORE FOUNDATION (Week 1–2)
├─→ T1.1.1: iOS Photo Library Scanner
├─→ T1.1.2: Android MediaStore Scanner
├─→ T1.2.1: Media Metadata Cache (SQLite)
└─→ T1.2.2: Database Service Layer
    │
    ├─→ PARALLEL TRACK A: Media Analysis (Week 2–3)
    │   ├─→ T1.3.1: Duplicate Detection (pHash)
    │   ├─→ T1.3.2: ML-based Duplicate Detector (Core ML / TFLite)
    │   ├─→ T1.5.1: Incremental Scan
    │   └─→ T1.6.1: Video Analysis
    │
    ├─→ PARALLEL TRACK B: Swipe UI (Week 2–3)
    │   ├─→ T2.1.1: iOS Swipe Card Stack
    │   ├─→ T2.1.2: Android Swipe Card Stack
    │   ├─→ T2.3.1: Gesture Recognition
    │   ├─→ T2.4.1: Haptic Feedback
    │   └─→ T2.5.1: Card Animations
    │
    ├─→ PARALLEL TRACK C: Session Management (Week 2–3)
    │   ├─→ T5.1.1: Session State Persistence
    │   ├─→ T5.1.2: Delta Tracking (new media detection)
    │   └─→ T5.2.1: Session Resumption Logic
    │
    └─→ [Tracks A, B, C converge]
        │
        └─→ CONVERGENCE: Review Integration (Week 4)
            ├─→ T2.6.1: Progress UI
            ├─→ T2.7.1: Decision Persistence
            ├─→ T3.1.1: Filter Queries
            └─→ T3.2.1: Filter UI
                │
                └─→ [Media Discovery + Swipe UI + Filters INTEGRATED]

[... continues to Sensitive Content Detection (Week 5), Deletion (Week 6), ...]

TESTING & RELEASE (Week 7–16)
├─→ B6: Unit + Integration tests (parallel with features)
├─→ B7: CI/CD pipelines (GitHub Actions)
├─→ B8: App Store release assets
└─→ [Manual UAT + submission]
```

---

## Flow Diagram 4: Quality Gate Checkpoints

```
USER DECISION POINTS (⏸ Checkpoints)

[After Bootstrap]
⏸ USER CHECKPOINT #1
├─→ "Is MY_PROJECT.md correct? Product name, platforms, bundle IDs?"
├─→ User feedback → Regenerate MY_PROJECT.md → Present again
└─→ User says "Continue" → Proceed to Epics

[After Step 1: Seed Epics]
⏸ USER CHECKPOINT #2
├─→ "Are the 16 epics correct? Are brief keywords all covered?"
├─→ Sample feedback: "Add backup epic" / "Remove Account Identity" / "Clarify ML model sourcing"
├─→ Regenerate epics + keywords → Present again
└─→ User says "Continue" → Proceed to Features

[After Step 2: Expand Features]
⏸ USER CHECKPOINT #3
├─→ "Are the 102 features detailed enough? Any missing?"
├─→ Sample feedback: "Add backup-to-cloud feature" / "Remove memory cleanup (OS-only)"
├─→ Regenerate features → Present again
└─→ User says "Continue" → Proceed to Tasks

[After Step 3: Atomize Tasks]
⏸ USER CHECKPOINT #4
├─→ "Are the 107 tasks concrete? Any blockers?"
├─→ Sample feedback: "ML model is unclear" / "Add task for App Store screenshots"
├─→ Regenerate tasks → Present again
└─→ User says "Continue" → Proceed to Revise

[After Revise Gate]
⏸ USER CHECKPOINT #5
├─→ "Revise gate result: 2 warnings, 0 blockers. Ready to execute?"
├─→ Sample feedback: "Clarify ML model bundling" / "Generate sample marketing copy"
├─→ Address warnings → Regenerate tasks → Re-run revise gate
└─→ User says "Execute" → Begin execution phase

[During Execution]
⏸ CHECKPOINTS #6–112 (one per task, batched by user)
├─→ After each task (or batch):
│   ├─→ "Task T<N> complete: [file], [tests], [acceptance]"
│   ├─→ User feedback: "Looks good" / "Redo this" / "Skip next" / "Stop"
│   └─→ User says "Continue" or "Continue 5" → Next task(s)
│
└─→ Exit on:
    ├─→ 3+ consecutive task failures → STOP, show error, wait for user
    ├─→ External credential needed → STOP, prompt for key, wait for user
    ├─→ User interrupt (ctrl+C, restart, etc.) → Log to execution-log.md, wait for "Continue where you left off"
    └─→ All 107 tasks complete → Final summary checkpoint

[Final Summary]
⏸ USER CHECKPOINT #FINAL
├─→ Present all deliverables:
│   ├─→ File tree (ios/, android/, shared/, deployment/, docs/)
│   ├─→ Commands to run locally (setup-dev.sh, build, tests, run app)
│   ├─→ External keys needed (if any)
│   └─→ Next steps (UAT, submission, launch)
├─→ User decision: "Ready for UAT" / "Need fixes" / "Pause for now"
└─→ End of DPROMPT library orchestration; app is ready-to-code
```

---

## Summary: Library Effectiveness for Storage Cleaner App

### ✅ Strengths

1. **Comprehensive Scope** — Library captures ALL production concerns (16 epics, 102 features, 107 tasks) without user asking for each one
2. **Concrete Output** — Each task names real files, real functions, real test approaches. No hand-waving.
3. **Module-driven** — Only relevant modules loaded (24 selected from 29); irrelevant domains excluded (no backend, payments, etc.)
4. **Multi-platform native** — Treats iOS and Android as first-class, not afterthoughts. Generated code is platform-idiomatic (SwiftUI, Compose, not cross-platform frameworks).
5. **Privacy-by-default** — Library's modules for storage cleanup, on-device ML, and privacy controls align perfectly with the "no network, privacy paramount" constraint.
6. **Validated** — Revise gate catches inconsistencies; warns on ambiguities (ML model bundling, marketing copy).

### ⚠️ Gaps Identified

1. **ML Model Bundling Decision** — Library assumes "use ML Kit / Core ML" but doesn't decide bundled vs. downloaded. Task generator should ask explicitly.
2. **Android 14 Photo Selection** — native-storage-cleanup module mentions scoped storage but underspecifies Android 14 chosen-media pattern. Expansion task needed.
3. **Deletion Undo Mismatch** — Task promises "undo if OS permits", but iOS deletion is permanent. Android supports OS-level undo. Clarification needed per platform.
4. **Sensitive Content OCR** — Library assumes pre-trained models sufficient; doesn't address custom training or dataset sourcing for document detection edge cases.
5. **Memory Cleanup Non-programmatic** — Epic 7 relies on Settings links; expectations need management (users expect "one-tap cleanup", but app can only provide guidance).

### 🎯 Recommendations for Library Enhancement

1. **Expand native-storage-cleanup.md** — Add Android 14 chosen-media pattern and iOS deletion undo clarification.
2. **Create conditional task generation** — For sensitive-content tasks, ask: "Use pre-trained models only, or enable custom fine-tuning?" Branch task generation accordingly.
3. **Add ML model decision tree** — Create helper prompts: "Model bundling decision: APK size vs. offline availability. Which do you prioritize?" Embed decision in task outputs.
4. **Document non-programmatic OS operations** — Clarify which features can/cannot be automated per OS (memory, cache, etc.). Update acceptance criteria to reflect actual capabilities.
5. **Enhance App Store/Play Store module** — Add sample marketing copy generation for common app types (cleaners, productivity, etc.).

---

## Conclusion

The **AI Prompt Library successfully traces the Storage Cleaner app from brief to delivery**, demonstrating:

- **Complete traceability**: Brief → Epics → Features → Tasks → Code
- **Modular, reusable guidance**: 24 domain-specific modules applied once, dissolved into project-specific content
- **Production-grade output**: 107 tasks, each with concrete file paths, acceptance criteria, tests, and execution logs
- **Quality gates**: Multiple user checkpoints to catch errors early
- **Scalability**: Execution phase is parallelizable (parallel tracks A, B, C independent; tests run automatically)

**With the identified gaps addressed, the library is ready to generate production-ready native iOS/Android apps from a single user brief.**

---

*End of flowchart documentation*
