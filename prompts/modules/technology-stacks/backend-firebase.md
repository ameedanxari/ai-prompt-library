# Firebase Backend Technology Stack Module

## Purpose
Provide production-ready implementation guidance for Firebase backend architecture (Auth, Firestore, Cloud Functions, Messaging, rules, and indexes).

## When to Use
- Backend infrastructure includes Firebase Auth, Firestore, Cloud Functions, or FCM.
- Contracts require webhook processing, idempotency, role claims, and moderation/audit flows.
- Project needs rapid delivery with managed infrastructure and strong security-rule enforcement.

## Implementation Focus
1. Define Firestore schema, composite indexes, and security rules before feature endpoint coding.
2. Implement Cloud Functions with contract-first handlers (request/response/error envelopes).
3. Enforce idempotency and replay safety for payment/webhook and lifecycle transitions.
4. Use role claims + rule checks for least-privilege access boundaries.
5. Add emulator-backed contract/integration tests and staged rollout controls.

## Example Prompt Block Usage
```markdown
## Prompt Blocks Applied
- `.ai-prompts/prompts/templates/task-prompt-template.md`
- `.ai-prompts/prompts/templates/implementation-prompt-generation.md`
- `.ai-prompts/prompts/modules/technology-stacks/backend-firebase.md`
- `.ai-prompts/prompts/modules/integration/service-integration.md`
- `.ai-prompts/prompts/modules/integration/webhook-systems.md`
- `.ai-prompts/prompts/stages/stage-06-implementation/platform-agnostic.md`
```

## Validation Expectations
- `firebase emulators:exec --only firestore \"npm test\"`
- `npm test -- integration`

## Integration Notes
- For payment flows, pair with:
  - `.ai-prompts/prompts/modules/commerce/payment-processing.md`
  - `.ai-prompts/prompts/modules/fintech/transaction-processing.md`
