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

## App Store Release Prep (mobile only)

- Per mobile platform: one task for app-store listing copy (name,
  subtitle, description, keywords, promotional text, support URL).
- **Per platform × per locale × per required device class** (iPhone
  6.7" + 6.5" + 5.5" for iOS; phone + 7" tablet + 10" tablet for
  Android): one screenshot task. If 5 locales × 3 devices = 15
  screenshot tasks per platform. The weak model MUST emit all of
  them, not a catch-all "generate screenshots" task.
- One task for privacy nutrition labels (iOS) / data safety form
  (Android).
- One task for signing + distribution (certificates, provisioning
  profiles, keystore, upload to TestFlight / Play internal track).
- One task for App Store Connect / Play Console metadata upload.

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
