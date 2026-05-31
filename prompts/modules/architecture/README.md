# Architecture Module

## Purpose

Architecture modules provide bounded-context, state-ownership, data
integrity, and regulated-system patterns that cut across product
domains and cloud providers.

## Templates

- `bounded-context-state-ownership.md` - single write owner, portal
  composition, API/event contracts, and conflict prevention.
- `tier-zero-data-integrity.md` - Tier 0 workflows, fail-closed
  behavior, RPO/RTO, outbox, ordering, replay, and DR caveats.

## Integration

Use these modules with healthcare, enterprise SaaS, security,
deployment, data-processing, and cloud-provider modules whenever the
brief mentions portals, multiple organizations, data loss, audit,
breach, regulated workflows, or millions of users.
