# Tier Zero Data Integrity Module

## Purpose

Define data-loss, ordering, audit, and recovery requirements for
mission-critical workflows where silent loss or unaudited mutation is
unacceptable.

## Context

"Zero data loss" is not a blanket promise. It must be scoped by
workflow, failure mode, jurisdiction, data store, replication model,
and recovery target. Architecture must say which actions are Tier 0,
what fails closed, and what residual regional-outage risk remains.

## Core Components

```typescript
interface TierZeroWorkflow {
  name: string;
  sourceOfTruth: string;
  rpoTarget: string;
  rtoTarget: string;
  failClosedWhen: string[];
  orderingKey: string;
  replayOwner: string;
  restoreEvidence: string;
}
```

## Implementation Patterns

- Name Tier 0 workflows explicitly.
- State, audit intent, and outbox entry commit atomically.
- Consumers are idempotent and replayable.
- Events have ordering keys for workflows where ordering matters.
- DLQs have owners, SLAs, replay runbooks, and audit receipts.
- DR targets distinguish zonal failure, regional outage, vendor outage,
  application bug, data-corruption event, and legal data-residency
  constraint.
- Do not claim zero data loss for catastrophic regional loss unless an
  approved replicated recovery target exists outside the failed region.

## Integration Points

- Transactional database with PITR and backup restore drills.
- Outbox/event catalog.
- Audit evidence and verification jobs.
- Observability for queue lag, audit lag, replication lag, error rates,
  and restore status.

## Security Considerations

- Recovery workflows are privileged and audited.
- Replay tooling requires approval, idempotency keys, and evidence of
  what was replayed.
- Backups and exported manifests are encrypted and retained under the
  same data-classification rules as source data.

## Testing Considerations

- Run restore drills on a fixed schedule.
- Test outbox/replay idempotency.
- Test ordered event consumption and sequence-gap alarms.
- Test audit failure blocks high-risk actions.
- Test regional-outage assumptions through tabletop exercises.
