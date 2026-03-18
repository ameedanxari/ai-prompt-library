# Generated Outputs

## Purpose
Define the expected output structure for dry-runs and full pipeline execution, with explicit traceability and production-readiness artifacts.

## Required Core Files
- `prompts/outputs/ROUTING_DECISIONS.md`
- `prompts/outputs/PROJECT_STATE.md`
- `prompts/outputs/specifications/prompt-selection-manifest.md`
- `prompts/outputs/specifications/prompt-composition-index.md`
- `prompts/outputs/specifications/prompt-usage-log.md`

## Specifications (`prompts/outputs/specifications/`)
Expected high-value artifacts include:
- `requirements.md`
- `charter.md`
- `design-system-foundation.md`
- `design-system-component-catalog.md`
- `asset-mapping.md`
- `integration-contracts.md`
- `data-architecture.md`
- `backend-infrastructure.md`
- `features.md`
- `api-delivery-plan.md`
- `screen-fidelity-matrix.md`
- `testing-strategy.md`
- `integration-test-plan.md`

## Task Lists (`prompts/outputs/task-lists/`)
Use an index-first approach:
- `implementation-master-plan.md`
- `task-list-index.md`
- one or more platform tracks, for example:
  - `mobile-app-tasks.md`
  - `admin-web-tasks.md`
  - `backend-shared-tasks.md`

Legacy task files (`frontend-tasks.md`, `backend-tasks.md`) may still exist, but new flows should use `task-list-index.md` as the source of truth.

## Deployment (`prompts/outputs/deployment/`)
- `deployment-plan.md`
- `environment-matrix.md`
- `access-and-secrets-checklist.md`
- `release-runbook.md`

## Documentation (`prompts/outputs/documentation/`)
- `developer-onboarding.md`
- `integration-setup-guide.md`
- `missing-prerequisites-register.md`

## Quality/Handoff
- `prompts/outputs/quality/final-verification-summary.md`
- `prompts/outputs/handoff/final-delivery-summary.md`
- `prompts/outputs/handoff/open-items-and-credentials.md`

## Rules
1. Do not mark a stage complete without stage-specific required artifacts.
2. Do not claim production readiness with mock-only integrations.
3. Keep `prompt-usage-log.md` updated for every completed stage.
4. Include `Prompt Blocks Applied` in every generated artifact.
