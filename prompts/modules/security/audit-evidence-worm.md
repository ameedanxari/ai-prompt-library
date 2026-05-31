# Audit Evidence And WORM Module

## Purpose

Plan tamper-evident audit trails, immutable evidence anchors, retention,
verification, and export surfaces for regulated systems.

## Context

An audit table or analytics warehouse is not enough for regulated
evidence. High-risk workflows must be attributable, immutable,
independently verifiable, and fail closed when required audit intent
cannot be persisted.

## Core Components

```typescript
interface AuditEvent {
  eventId: string;
  sequence: number;
  previousHash: string;
  eventHash: string;
  tenantId: string;
  actorId: string;
  role: string;
  purpose: string;
  action: string;
  objectType: string;
  objectId: string;
  beforeHash?: string;
  afterHash?: string;
  correlationId: string;
  recordedAtUtc: string;
}

interface AuditEvidencePolicy {
  failClosedActions: string[];
  immutableAnchor: 'locked-log-bucket' | 'locked-object-bucket' | 'both';
  querySurface: 'analytics-copy' | 'none';
  verificationCadence: 'nightly' | 'hourly' | 'continuous';
}
```

## Implementation Patterns

- Domain transaction writes state change, audit intent, and outbox entry
  in the same transaction.
- Audit worker publishes immutable events with sequence and hash pointer.
- Legal evidence is anchored in WORM-capable locked storage or locked
  logs; analytics systems receive append-only copies only.
- Verification jobs validate hash chains, sequence gaps, manifests,
  retention policy, export completeness, and replay receipts.
- High-risk clinical, legal, prescribing, payment-release, dispensing,
  controlled-drug, break-glass, and audit actions fail closed if audit
  intent cannot commit.

## Integration Points

- Identity and access context for actor/session/device.
- Tenant context for scope and isolation.
- Domain outbox for event publication.
- Object storage/logging for locked evidence.
- Analytics/search/export surface for compliance queries.
- Incident response for audit lag, sequence gaps, and export failures.

## Security Considerations

- Audit records may contain sensitive metadata; encrypt and minimize.
- Auditors and support users get read access through role/purpose
  checks, masking, and immutable access logging.
- Retention policy changes require governance sign-off and evidence.
- Exports use signed manifests and file hashes.

## Testing Considerations

- Test audit-intent failure blocks high-risk actions.
- Test hash-chain verification.
- Test sequence-gap detection.
- Test WORM retention and deletion denial.
- Test inspector/DSAR export manifest validation.
