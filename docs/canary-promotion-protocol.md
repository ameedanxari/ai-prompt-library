# Canary Promotion Protocol

This protocol validates a prompt-library revision against synthetic products
before publication. LumaClean is not a canary. It may contribute distilled,
non-identifying fixtures, but its generated product output, task graph, and
historical execution state are never canary inputs.

## Invariants

1. Start every run with `scripts/reset-integration.sh --yes` and retain
   `prompts/outputs/current/clean-state-preflight.md`.
2. Hash and retain the original brief before generation. A rerun uses the
   unchanged brief; generated output is never repaired by hand.
3. Record the library version and Git revision in every evidence bundle.
4. Evaluate predefined dimensions and hard gates. File count is not a quality
   or completion signal.
5. Promote only immutable evidence produced by the documented commands.

## Product Profiles

### Local-First Native Mobile

- **Artifact types:** native source, platform manifests, local persistence,
  permission copy, store metadata, screenshots, and device-test evidence.
- **Evidence ladder:** static, compile, unit, integration, UI fixture, then
  physical-device evidence for permissions, lifecycle, and destructive flows.
- **Baseline concerns:** privacy, offline behavior, storage ownership,
  accessibility, localization, background work, and store policy.
- **Composition:** one production composition root per shipped platform; demo,
  preview, and screenshot roots remain separately classified.
- **Release gates:** walking skeleton, device primary flow, privacy, destructive
  action, data integrity, signing, and store-package validation.

### Web / SaaS

- **Artifact types:** frontend and service source, migrations, infrastructure
  config, browser fixtures, operational docs, and deployment evidence.
- **Evidence ladder:** static, unit, service integration, browser end-to-end,
  staging smoke, then production synthetic checks.
- **Baseline concerns:** identity, tenancy, authorization, accessibility,
  observability, rollback, privacy rights, and browser compatibility.
- **Composition:** the deployed frontend-to-service path must use production
  adapters; Storybook, mocks, and local emulators are fixture-only roots.
- **Release gates:** migration safety, tenant isolation, primary browser flow,
  security, privacy, staging health, rollback, and production readiness.

### Backend / API

- **Artifact types:** service source, API schema, migrations, deployment config,
  runbooks, contract fixtures, and load/recovery evidence.
- **Evidence ladder:** static, unit, contract, datastore integration, end-to-end,
  load, failure injection, and staging verification.
- **Baseline concerns:** authentication, authorization, idempotency, schema
  compatibility, rate limits, observability, recovery, and data integrity.
- **Composition:** the production server root wires real transport, storage,
  queues, and telemetry; in-memory adapters remain test-only.
- **Release gates:** API compatibility, migration/recovery, security, data
  integrity, capacity, staging, and production canary health.

### Desktop

- **Artifact types:** desktop source, installers, update manifests, local data
  migrations, accessibility assets, support docs, and platform test evidence.
- **Evidence ladder:** static, compile, unit, integration, UI automation,
  signed-package install/update, and supported-OS smoke tests.
- **Baseline concerns:** filesystem safety, offline behavior, accessibility,
  update rollback, signing, sandboxing, and OS-version compatibility.
- **Composition:** the signed application root uses production filesystem and
  update adapters; preview and demo roots cannot satisfy release evidence.
- **Release gates:** install/update, migration, destructive action, signing,
  accessibility, data integrity, and supported-platform coverage.

### Regulated / High-Stakes

- **Artifact types:** product source, controls-as-code, traceability records,
  risk files, audit evidence, runbooks, approvals, and validation reports.
- **Evidence ladder:** static, unit, integration, system validation, independent
  review, environment qualification, and controlled production evidence.
- **Baseline concerns:** safety, privacy, security, segregation of duties,
  immutable audit trails, retention, incident response, and regulatory scope.
- **Composition:** every consequential path names its production owner and
  approved adapter; simulations and fixtures are visibly isolated.
- **Release gates:** traceability, safety/security/privacy, data integrity,
  approval, audit evidence, rollback, and environment qualification at 100%.

## Initial Canary Matrix

| Canary | Profile | Purpose | Required proof |
|---|---|---|---|
| Pocket Pantry | Local-first native mobile | Offline household inventory with barcode/photo inputs and safe deletion | iOS/Android composition, permission and offline tests, local migration, device primary flow |
| FixFlow | Web / SaaS | Multi-tenant maintenance requests with roles and attachment workflows | tenant isolation, migration, browser end-to-end, accessibility, staging and rollback evidence |
| HookLedger | Backend / API | Idempotent webhook ingestion, replay, signatures, and audit history | API contract, real datastore/queue integration, replay/recovery, load, security and data-integrity evidence |

The matrix is intentionally small and cross-profile. Desktop and regulated
profiles remain mandatory protocol profiles and receive dedicated canaries
before a release that materially changes their routing, evidence, or gates.

## Machine-Readable Scorecard

Each run writes `canary-runs/<run-id>/scorecard.json`. The document is JSON,
uses `schemaVersion: 1`, and contains:

```json
{
  "schemaVersion": 1,
  "runId": "pocket-pantry-20260710T160000Z",
  "canary": "Pocket Pantry",
  "profile": "local-first-native-mobile",
  "libraryRevision": "3d36011",
  "briefSha256": "<sha256>",
  "overallScore": 94,
  "dimensions": {
    "planning-quality": 92,
    "implementation-evidence": 90,
    "security": 100,
    "privacy": 100,
    "destructive-action": 100,
    "data-integrity": 100
  },
  "hardGates": [
    {
      "id": "production-primary-flow",
      "passed": true,
      "evidence": "reports/production-primary-flow.json"
    }
  ],
  "evidenceRoot": "canary-runs/pocket-pantry-20260710T160000Z/evidence",
  "decision": "promote"
}
```

Validation rejects a scorecard unless all of these are true:

- `overallScore >= 90`.
- Every dimension is at least `85`.
- `security`, `privacy`, `destructive-action`, and `data-integrity` equal `100`.
- Every hard gate passes and links to retained evidence.
- The original brief hash, library revision, preflight report, and evidence root
  exist and agree with the run manifest.

The evaluator emits gate IDs, effective thresholds, decisions, missing evidence,
and blocking reasons through the canonical release-gate model. A high aggregate
score never overrides a failed hard gate.

## Evidence Retention

Store each attempt under an immutable run ID:

```text
canary-runs/<run-id>/
  original-brief.md
  clean-state-preflight.md
  run-manifest.json
  generated-output/
  evidence/
  scorecard.json
  defects.json
  promotion-decision.json
```

`run-manifest.json` records timestamps, library version/revision, brief hash,
commands, tool versions, profile, and canary name. Evidence files are copied by
the runner, checksummed, and never edited in place. A failed attempt is retained
beside its successor so score changes and regressions remain auditable.

## Defect Feedback Loop

1. A failed dimension or hard gate creates a defect record with gate ID,
   requirement/task IDs, evidence paths, owner, severity, and reproduction.
2. Diagnose the prompt library or validator. Do not patch generated canary
   product output, the scorecard, or retained evidence.
3. Fix and test the library on its own branch.
4. Run a clean reset and verify the new preflight report.
5. Rerun the same canary from the unchanged original brief.
6. Link the successor run to the defect and prior run; close only when the
   original failure passes without weakening thresholds or deleting evidence.

## CI/CD And Promotion

The canary workflow has explicit `lint`, `unit`, `integration`, `e2e`, `build`,
and `publish` stages. `publish` consumes immutable artifacts from `build`; it
does not rebuild or regenerate evidence.

- **Development:** all library tests and focused canary contract fixtures pass.
- **Staging:** all selected canaries start from clean preflights, retain complete
  evidence bundles, score at least 90 overall and 85 per dimension, and pass all
  hard gates.
- **Production / npm publish:** package metadata, dry-run archive, provenance,
  selected-profile canaries, and tier-zero 100% gates pass for the exact commit.

Any red hard gate blocks promotion. Alert output names the run, gate, owner,
evidence path, and blocking reason. No reviewer may waive a red gate by editing
the generated scorecard or promotion decision.
