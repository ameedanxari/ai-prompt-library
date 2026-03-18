# API Delivery Plan Template

## Purpose
Plan API rollout in an implementation-ready sequence with measurable gates.

## Required Output
`prompts/outputs/specifications/api-delivery-plan.md`

## Required Sections
1. Delivery phases with contract IDs
2. Endpoint rollout matrix
3. Dependencies and blockers
4. Backward compatibility/versioning plan
5. Contract test and release gates

## Phase Table (Required)
```markdown
| Phase | Contracts | Endpoints Included | Client Consumers | Exit Gates |
|---|---|---|---|---|
| P1 | AUTH-001, USER-001 | /v1/auth/*, /v1/users/me | mobile, admin | contract tests pass, auth smoke tests pass |
```

## Endpoint Rollout Matrix (Required)
```markdown
| Endpoint | Method | Provider Milestone | Client Milestone | Test Suite | Rollback Strategy |
|---|---|---|---|---|---|
| /v1/bookings | POST | backend-m2 | mobile-m2 | BOOKING contract suite | disable route + revert function tag |
```

## Validation Checklist
- [ ] Every endpoint in integration contracts appears in rollout matrix
- [ ] Each row includes provider/client milestone and contract test suite
- [ ] Each phase has explicit exit gates
