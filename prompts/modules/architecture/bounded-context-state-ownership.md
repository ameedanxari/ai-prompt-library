# Bounded Context And State Ownership Module

## Purpose

Prevent portal-centric or screen-centric architectures from becoming
data ownership boundaries. Use this module when a product has multiple
portals, roles, organizations, workflows, or duplicate state across
experiences.

## Context

Portals are user experiences. They compose capabilities, but canonical
domain state needs one write owner. Without ownership, duplicate portal
features create data corruption, ambiguous APIs, unsafe updates, and
unreliable audit trails.

## Core Components

```typescript
interface CanonicalStateOwnership {
  domainState: string;
  writeOwnerContext: string;
  readModels: string[];
  allowedCommands: string[];
  emittedEvents: string[];
  forbiddenWriters: string[];
}

interface ContextContract {
  contextName: string;
  commands: string[];
  queries: string[];
  events: string[];
  projections: string[];
}
```

## Implementation Patterns

- Identify bounded contexts before assigning portal features.
- Each canonical state has exactly one write owner.
- Cross-context integration uses owned APIs, commands, events,
  projections, or exports.
- Shared physical databases are allowed only with schema ownership,
  RLS/tenant guardrails, app-layer authorization, and no cross-context
  mutable table writes.
- Portals may cache/projection-read state but do not own canonical
  writes unless the bounded context explicitly says so.

## Integration Points

- API gateway routes commands to owning contexts.
- Event catalog names owner, schema version, ordering key, retention,
  replay policy, and consumers.
- Analytics/reporting uses append-only copies or projections.
- Audit context records sensitive actions across all contexts.

## Security Considerations

- Tenant, role, purpose, consent, and risk checks are enforced at the
  owning context boundary.
- Cross-tenant reads/writes are tested at database and application
  layers.
- Break-glass and overrides are context-owned workflows, not portal
  shortcuts.

## Testing Considerations

- Contract tests verify non-owner contexts cannot mutate canonical
  state.
- Integration tests verify command routing and projection updates.
- Tenant isolation tests cover every context-owned table.
- Audit tests verify every write owner emits required audit intent.
