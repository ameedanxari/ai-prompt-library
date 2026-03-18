# Deployment Prerequisites Package Template

## Purpose
Collect everything required to perform real deployments without hidden blockers.

## Required Outputs
Generate:
- `prompts/outputs/deployment/environment-matrix.md`
- `prompts/outputs/deployment/access-and-secrets-checklist.md`

## Environment Matrix Must Include
- Environment: dev/staging/prod
- Target runtime/hosting
- API endpoint/domain
- Database instance/project
- Deployment owner and approver
- Rollback target
- Release channel (web/admin/mobile)
- Health checks and go/no-go thresholds

## Access/Secrets Checklist Must Include
- Required accounts and roles
- Required service/API keys and certificate artifacts
- Owner + request status for each missing item
- Expected acquisition path (where/how to request)
- Environment each secret applies to
- Storage location (secret manager/vault path)
- Rotation cadence and last-rotated date
- Deadline (must not be `TBD`)

## Guardrails
- Stage 07 is not complete until unresolved critical prerequisites are clearly listed.
- Missing credentials must produce explicit follow-up tasks, not assumptions.
- Each open prerequisite must include: owner, status, due date, unblock action, and dependent milestone.
- `TBD` due dates are not allowed after Stage 08 documentation closeout.
