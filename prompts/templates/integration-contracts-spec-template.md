# Integration Contracts Spec Template

## Purpose
Define executable API/integration contracts that client and backend teams can implement against without ambiguity.

## Required Output
`prompts/outputs/specifications/integration-contracts.md`

## Required Sections
1. Contract inventory table
2. Endpoint catalog with auth/versioning
3. Request and response schema references
4. Error model
5. Idempotency and concurrency rules
6. Webhook/event contracts
7. Environment differences
8. Contract test mapping

## Contract Inventory Table (Required)
```markdown
| Contract ID | Domain | Consumer(s) | Provider | Version | Status |
|---|---|---|---|---|---|
| AUTH-001 | auth | mobile, admin | backend | v1 | draft |
```

## Endpoint Catalog (Required)
```markdown
| Contract ID | Method | Endpoint | Auth Scope | Request Schema | Response Schema | Error Codes | Idempotency |
|---|---|---|---|---|---|---|---|
| BOOK-001 | POST | /v1/bookings | student.write | booking.create.v1 | booking.read.v1 | 400,401,403,409,500 | required |
```

## Error Model (Required)
Use one canonical shape across contracts:
```json
{
  "error": {
    "code": "BOOKING_CONFLICT",
    "message": "Selected timeslot is unavailable",
    "requestId": "req_123",
    "details": {}
  }
}
```

## Validation Checklist
- [ ] Every in-scope domain has a contract ID
- [ ] Every contract has at least one concrete endpoint row
- [ ] Every endpoint row includes method/path/schema/auth/error/idempotency
- [ ] Contract tests are mapped in `integration-test-plan.md`
