# Baseline Task-Shape Rules

Schema rules that apply when the drill-down engine expands a **baseline
epic** in Step 3, or when audit-and-remediate produces remediation tasks
for a baseline gap. These rules prevent hand-waving on cross-cutting
concerns that weak models routinely under-specify.

Consulted by:
- `drill-down-engine.md` Step 3 (greenfield)
- `audit-and-remediate.md` Step 3 (gap-closure)
- `revise-outputs.md` C5 (baseline coverage check)

The engine MUST read this file when expanding any task whose parent
epic / gap targets one of the topics below.

---

## Universal task-shape invariants (apply to every baseline and feature)

Learned from six field tests. These rules are **mechanically enforced**
by `scripts/validate-instantiation.sh`; violating them fails the gate.

1. **One File field = exactly one file path.** No comma-separated list,
   no two backticked paths in one field. If a change spans two files,
   split into two tasks. Example of rejected:
   `**File:** \`android/app/build.gradle.kts\`, \`ios/Cleaner/Config.xcconfig\``
   **Exception:** Cross-platform pipe-separated paths (see rule 7 below)
   are permitted because they represent the SAME logical file on two
   platforms — not two unrelated files.
2. **Only one task per File may declare `Change type: create-new`.**
   If several tasks all edit the same `.github/workflows/ci.yml` or
   `android/app/build.gradle.kts`, exactly one is the creator
   (`create-new`) and every other is `modify-existing` with an
   explicit `Depends on: <creator task>` entry. The validator rejects
   "six tasks create the same file" outright.
3. **Every `Depends on: tasks-X.md` reference must resolve to an
   actual file on disk.** Referencing the features file name by
   mistake (`tasks-progress-tracking-resume.md` when it's a
   *features* file) fails the gate.
4. **`Test: N/A` and `Signature: N/A` require a parenthetical reason.**
   Accepted: `N/A (image asset)`, `N/A (GitHub UI configuration)`,
   `N/A (text metadata — length asserted in acceptance)`. Rejected:
   bare `N/A`, empty `N/A ()`. Before using N/A, check whether a real
   verifier is feasible: `actionlint` for GitHub workflows,
   `bash -n` for shell scripts, `gh api` for repo settings,
   `wc -c` for metadata length.
5. **Use `scripts/scaffold-screenshot-captures.sh`** to emit the
   screenshot matrix — do not hand-write 15 near-identical tasks.
6. **Run `bash .ai-prompts/scripts/finalize.sh prompts/outputs/current`** as the
   ONLY post-Step-3 action. Do not hand-write `revise-report.md`.
7. **Cross-platform File: field format.** When a project targets
   multiple platforms (e.g. iOS + Android), dual-platform tasks MUST
   use the pipe separator to declare both paths in one File: field:
   `**File:** \`ios/path/Foo.swift\` | \`android/path/Foo.kt\``
   This is NOT a violation of rule 1 — the pipe represents the same
   logical component on two platforms. The path ledger
   (`build-path-ledger.sh`) splits on `|` and registers both paths.
   Files that are inherently single-platform (`.xcprivacy`, `fastlane/`,
   `.github/workflows/`, `AndroidManifest.xml`) are exempt.
8. **All 6 metadata fields are mandatory.** Every task file MUST
   carry: `Closes user story`, `Change type`, `File`, `Depends on`,
   `Test`, and `Estimated LOC`. The validator enforces this as a
   hard gate — files missing any field will fail.

---

## Native Project Initialization (Mobile)

If the project targets native iOS or Android (not React Native/Expo), do **not** instruct the executor to use a CLI tool (e.g., `xcodebuild`, `android init`) to scaffold the project, and do not attempt to write raw `.xcodeproj` or `build.gradle.kts` files from scratch.

Instead, emit a task to copy the generic project templates provided in the library:
- **File:** `ios/AppTemplate.xcodeproj/project.pbxproj` | `android/app/build.gradle.kts`
- **Precise change:**
  1. Copy the entire `project-templates/ios` directory to `ios/` and/or `project-templates/android` to `android/`.
  2. Perform a deep find-and-replace to rename `AppTemplate` and `com.example.app` to the actual project's name and bundle ID.
  3. Rename the directories (e.g. `AppTemplate.xcodeproj` to `<ProjectName>.xcodeproj`) to match.

## Identity, auth & onboarding

- At least one task per supported platform for each of: sign up, sign
  in, password reset, email verification, session refresh, sign out.
- If mobile is in scope, at least one task per mobile platform for
  biometric auth (Face ID / Touch ID / Fingerprint).
- At least one integration test per auth flow that exercises the
  happy path + two failure paths (invalid credentials, account
  locked / rate limited).

## Admin & RBAC

- At least one task that defines the role enum (concrete role list,
  not `[ROLE_A, ROLE_B, …]`).
- At least one task per protected endpoint that wires the authorisation
  check.
- At least one task that creates an admin UI screen for user/role
  management.
- At least one task for an audit log that records role transitions.

## Observability

Adapt to the project's constraints. The goal is: can the team
diagnose crashes, performance issues, and user-facing errors? The
specific tools depend on whether the app has network access.

**Standard (app has network / backend):**
- Structured logging task that names the library (pino, winston,
  structlog, os_log, Timber, etc.), the log level taxonomy, and the
  destination (stdout / file / service).
- Error tracking task that wires a specific service (Sentry, Rollbar,
  Honeybadger, Bugsnag, etc.) with DSN env var called out.
- Metrics task that names the metrics backend (Prometheus,
  CloudWatch, Datadog, etc.) and a concrete list of metrics (request
  count, error rate, p50/p95/p99 latency, active sessions).
- At least one alert routing task (PagerDuty / Slack / email) with
  the specific threshold.

**Local-only / no-network apps (adapt, don't skip):**
- Structured local logging task using platform-native facilities
  (os_log + OSLogStore on iOS, Timber + logcat on Android), with
  log-level taxonomy and local log rotation strategy.
- Crash reporting via platform-native services: Apple crash reports
  (Xcode Organizer) on iOS, Android Vitals (Play Console) on
  Android. These require no runtime network access from the app —
  the OS handles crash report delivery.
- Local diagnostics screen (in debug menu) showing recent logs,
  storage metrics, and app health indicators the user or developer
  can inspect without network.
- Performance profiling using Instruments (iOS) and Android Profiler
  (Android) — task should set up launch arguments and build configs
  to enable profiling in debug builds.

## Localization & RTL

- Task that introduces the i18n framework (i18next, react-intl,
  Android string resources, iOS Localizable.xcstrings, etc.) by name.
- One task per supported locale that seeds the translation file at
  the correct path. Locale list MUST come from `MY_PROJECT.md` or be
  explicitly inferred.
- At least one task per platform that verifies RTL rendering — a
  screenshot diff test or layout assertion against Arabic/Hebrew.
- At least one test that asserts no hard-coded English strings remain
  in user-facing source files.

## Theming & Whitelabel

- Task that introduces the design-token file (CSS variables, Tailwind
  config, iOS Color catalog, Android Material3 dynamic colors,
  etc.) with a concrete token list (primary, secondary, surface,
  onSurface, error, success, plus neutrals).
- Task that implements dark-mode toggle respecting OS preference.
- At least one visual-regression test task covering light + dark for
  at least three screens.
- At least one task that demonstrates whitelabel swap (e.g. loading
  tokens from an env or config so a second brand works without code
  changes).

## Accessibility

- Task that wires an automated a11y linter (axe-core, lighthouse-a11y,
  accessibility-scanner for Android, XCTest accessibility audit for
  iOS).
- At least one task for keyboard navigation tests on web.
- At least one task per mobile platform for touch-target size audit
  (minimum 44×44 pt iOS / 48×48 dp Android).
- At least one task that adds screen-reader labels to the top five
  most-used screens.
- At least one task that audits color contrast against WCAG AA (4.5:1
  normal text, 3:1 large text + UI components).

## Testing & QA

- Unit test setup task per language/framework that names the runner
  (vitest / jest / pytest / XCTest / JUnit) and coverage threshold.
- Integration test setup that names the DB + test doubles strategy
  (in-memory postgres, testcontainers, mswjs, etc.).
- UI test setup per platform (Playwright for web, Espresso for
  Android, XCUITest for iOS).
- E2E smoke test task that exercises one full user journey per role.
- At least one property-based test task for the most critical domain
  invariant.

## CI/CD & Release

- Pipeline definition task (GitHub Actions / GitLab CI / CircleCI /
  etc.) with concrete stages: lint → unit → integration → UI → build
  → deploy.
- Per-environment promotion task (dev → staging → prod) with gate
  requirements named.
- At least one task that publishes the built artefact to the right
  place (container registry / npm / App Store Connect / Play Console).

## Infrastructure as Code

- One IaC module per environment (dev / staging / prod). Same
  Terraform module, different workspace/var file.
- One task per data store declared in features (Postgres, Redis,
  S3-compatible blob, queue, etc.).
- One task that wires secret management (AWS Secrets Manager, Doppler,
  Vault, or environment-file strategy for local dev).
- One task for DNS + TLS.

## When a baseline topic is not applicable

Some baseline topics do not apply to every project. A local-only
offline app does not need an admin console. A client-side tool with
no backend does not need Infrastructure as Code.

**The correct approach: exclude the topic from the plan entirely.**
Do not emit placeholder epics, stub source files, or ADR tasks just
to have "something to do." The library is a superset of all
production concerns — the engine's job is to compose what is relevant
and leave out what isn't. If a topic is excluded, it simply does not
appear in `epics.md` or any downstream artifacts.

The decision to exclude is captured implicitly by its absence from
`epics.md` and can be cross-referenced against the `brief-keywords.md`
file, which documents what was scoped in and what was scoped out.

## App Store Release Prep (mobile only)

- Per mobile platform: one task for app-store listing copy (name,
  subtitle, description, keywords, promotional text, support URL).
- Per mobile platform: tooling tasks that _produce_ screenshots —
  typically a fastlane Snapfile / Fastfile, a UITest / instrumentation
  test harness, and optional organizer / uploader scripts. These write
  **source files** (`.swift`, `.kt`, `.rb`, `.sh`) and may iterate
  over locales and devices internally. One task per source file.
- **Per platform × per locale × per required device class** (iPhone
  6.7" + 6.5" + 5.5" for iOS; phone + 7" tablet + 10" tablet for
  Android): one screenshot **capture** task. The File field is the
  concrete image path (e.g.
  `fastlane/screenshots/en-US/iphone-6.5-inch/1_feature.png`), NOT a
  source file. The precise-change names exactly one locale and one
  device; the test asserts visual-diff against a baseline for that
  specific file. 5 locales × 3 devices = **15 capture tasks per
  platform, not a catch-all "generate screenshots" task**. These
  appear alongside the tooling tasks in the same file.
  **Use the scaffolder instead of writing these by hand.** Run
  `scripts/scaffold-screenshot-captures.sh --target <dir> --platform
  ios --app-name <Name>` (and again with `--platform android`) to
  generate the full matrix with the canonical schema pre-filled; you
  only fill in each task's UITest class / method / expected text.
- One task for privacy nutrition labels (iOS) / data safety form
  (Android).
- One task for signing + distribution (certificates, provisioning
  profiles, keystore, upload to TestFlight / Play internal track).
- One task for App Store Connect / Play Console metadata upload.

### Screenshot task shape — tooling vs. capture

A tooling task looks like this:

```markdown
## T2 · Fastlane Snapfile (Android)
- **Change type:** create-new
- **File:** `fastlane/Snapfile`
- **Signature:** fastlane snapshot config
- **Precise change:** Declare `devices [pixel_7, pixel_tablet_7in, pixel_tablet_10in]`, `languages %w[en-US es-ES fr-FR de-DE ja-JP]`, `output_directory './fastlane/screenshots'`, `scheme 'StorageCleanerUITests'`.
- **Acceptance:**
  - `bundle exec fastlane snapshot` loads this Snapfile without errors.
  - `devices` list has exactly 3 entries.
  - `languages` list has exactly 5 entries.
- **Test:** `bundle exec fastlane snapshot --verify_only` exits 0.
- **Depends on:** none
```

A capture task looks like this:

```markdown
## T6 · Screenshot — en-US phone, frame 1 (Android)
- **Change type:** create-new
- **File:** `fastlane/screenshots/en-US/pixel_7/1_dashboard.png`
- **Signature:** 1440×3088 PNG asset captured from `DashboardUITest.testFirstLaunch`
- **Precise change:** Run `bundle exec fastlane snapshot --devices pixel_7 --languages en-US --only_testing StorageCleanerUITests/DashboardUITest/testFirstLaunch`. Fastlane writes the PNG to the File path above.
- **Acceptance:**
  - File exists at the exact File path above.
  - PNG dimensions are 1440×3088 (Pixel 7).
  - Visible text in the screenshot is English ("Dashboard", "Free space").
- **Test:** `tools/app-store/verify-screenshot.sh fastlane/screenshots/en-US/pixel_7/1_dashboard.png` — checks path exists, dimensions, and visual-diff against `baselines/en-US/pixel_7/1_dashboard.png`.
- **Depends on:** T2 (Snapfile), T3 (DashboardUITest)
```

The capture task MUST name one specific image file path and one
specific locale / device pair. Do not parameterise; do not batch;
do not describe a loop. The validator's collapse detector fires on
**capture** tasks (File is an image extension) that describe
"each/all/every/multiple" devices or locales. Tooling tasks are
exempt because their File is a source file.

## Settings, debug menu & dev UX

- User-facing settings screen task per platform (theme picker, locale
  picker, notifications, account management, sign out).
- Debug menu task per platform, gated to `DEBUG` / dev builds only.
  Must include: API endpoint switcher (dev / staging / prod / mock),
  feature flag overrides, mock-data toggle, locale preview switcher,
  theme preview switcher, a way to trigger a forced crash for
  testing error-tracking integration.
- One-command setup script task that installs dependencies, sets up
  the database, seeds fixtures, and starts the dev server. Name the
  script path explicitly (e.g. `scripts/dev-setup.sh`).

## Privacy, PII & compliance

- Consent capture task on first run (per platform).
- Data export task (GDPR Article 20 / CCPA right to know): an
  endpoint + UI trigger that exports the user's data to JSON.
- Data deletion task (GDPR Article 17 / CCPA right to delete): the
  full cascade, including a task-list that enumerates every table /
  storage location that holds user data.
- Age gate task if the brief mentions consumer / social features.
- Cookie / tracking consent task for web.
- PII classification task: a doc that labels each entity field as
  PII / sensitive / public and the retention period.

---

## Platform-expansion rule (applies to every baseline topic above)

When a baseline task is platform-specific (e.g. "biometric auth"), emit
ONE task per platform in scope. Do not emit a cross-platform task like
"implement biometric auth across all platforms" — the executor cannot
run it atomically.

## Interaction with `revise-outputs.md`

Check C5 (baseline coverage) reads this file to decide whether a
baseline epic's expansion is complete. If any rule above is unmet, the
revise orchestrator flags it and regenerates the affected tasks file.
