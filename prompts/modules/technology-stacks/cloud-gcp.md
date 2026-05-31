# Google Cloud Regulated Architecture Module

## Purpose

Provide Google Cloud Platform architecture guidance for production
systems that handle sensitive data, regulated workflows, high
concurrency, and audit evidence. Use this module when a brief mentions
Google Cloud, GCP, Cloud Run, Cloud SQL, Spanner, Pub/Sub, BigQuery,
VPC Service Controls, CMEK, or UK/EU data residency.

## Context

Generic cloud guidance is not enough for regulated GCP work. The plan
must choose concrete Google Cloud services, name rejected alternatives,
define project boundaries, protect PHI/PII, and separate source-of-truth
state from asynchronous transport and analytics surfaces.

## Core Components

```typescript
interface GcpRegulatedArchitecture {
  organizationPolicy: {
    allowedRegions: string[];
    publicAccessPrevention: boolean;
    restrictedGoogleApis: boolean;
  };
  projects: GcpProjectBoundary[];
  edge: GcpEdgeControls;
  compute: GcpComputeChoice;
  dataStores: GcpDataStoreChoice[];
  auditEvidence: GcpAuditEvidence;
  securityOperations: GcpSecurityOperations;
}

interface GcpProjectBoundary {
  projectId: string;
  purpose: 'public' | 'edge' | 'core' | 'protected' | 'audit' | 'security' | 'nonprod';
  dataClass: 'public' | 'internal' | 'pii' | 'phi' | 'audit-evidence';
  allowedServices: string[];
}

interface GcpAuditEvidence {
  immutableAnchor: 'locked-cloud-logging' | 'locked-cloud-storage' | 'both';
  querySurface: 'bigquery-copy' | 'none';
  verificationJobs: string[];
  retentionYears: number;
}
```

## Implementation Patterns

### Project And Perimeter Layout

- Split public, edge, core, protected, audit, security, and non-production
  workloads into separate projects or folders.
- Restrict production regulated data to approved regions using
  organization policy.
- Use VPC Service Controls for supported Google APIs as a perimeter
  control; do not present VPC-SC as the only network isolation layer.
- Use private connectivity, restricted/private Google access, least
  privilege service accounts, IAM Conditions, and separate KMS key rings.

### Compute Decision

- Prefer Cloud Run for launch APIs and workers when request/worker
  patterns fit serverless containers.
- Use minimum instances, service-specific concurrency limits, ingress
  restrictions, Direct VPC Egress to private resources, and separate
  service accounts.
- Move to GKE only for proven needs: long-lived gateway economics,
  service mesh policy, custom networking, advanced sidecars, or sustained
  high-concurrency cost/control requirements.

### Data Store Decision

- Prefer Cloud SQL for PostgreSQL Enterprise Plus HA for launch
  relational systems of record when relational integrity, tenancy
  guardrails, cost control, and operational familiarity matter.
- Require private IP, PITR, automated backups, restore drills, RLS,
  app-layer tenant enforcement, idempotency keys, and schema ownership
  by bounded context.
- Use Spanner only when write scale, availability posture, multi-region
  consistency, or operational risk justifies the cost and governance.
- Use Cloud Storage regional buckets for documents, scans, evidence
  bundles, and exports. Require CMEK, uniform bucket-level access,
  public access prevention, object versioning where appropriate, and
  retention/object lock for WORM records.
- Use BigQuery as analytics/search/export surface, not as the legal
  immutability anchor.

### Eventing And Ordering

```typescript
interface GcpEventContract {
  eventName: string;
  ownerContext: string;
  sourceOfTruth: 'context-database';
  transport: 'pubsub';
  orderingKey: string;
  idempotencyKey: string;
  deadLetterTopic: string;
  replayRunbook: string;
}
```

Pub/Sub is asynchronous transport. It does not replace transactional
outbox, idempotent consumers, ordering keys, DLQs, replay tooling, or
canonical state in the owning context database.

## Integration Points

- Cloud Armor and External HTTPS Load Balancer for edge protection.
- API gateway/proxy for auth, rate limits, and route ownership.
- Secret Manager for secrets by reference, never source-controlled
  values.
- Cloud KMS CMEK for protected databases, buckets, logs, and evidence.
- Cloud Logging locked buckets or Cloud Storage retention lock for
  immutable audit/evidence.
- BigQuery for append-only analytics copies and compliance query
  surfaces.
- Security Command Center, Cloud Asset Inventory, vulnerability scanning,
  artifact scanning, build provenance, and deploy admission controls.
- Access Approval and Access Transparency where available for regulated
  projects.

## Security Considerations

- Every protected service has its own service account and least-privilege
  IAM.
- Protected databases have no public IP.
- Production and non-production are isolated; non-production uses only
  synthetic or anonymized data.
- Break-glass access is time-boxed, reason-coded, MFA-gated, approved,
  and immutably audited.
- Infrastructure privilege elevation uses governed privileged access,
  not ad hoc IAM mutation.

## Testing Considerations

- Load tests must verify Cloud Run concurrency, cold-start posture,
  queue lag, database connection limits, and autoscaling behavior.
- Restore drills must prove PITR and backup recovery for protected data.
- Audit-verification drills must validate hash chains, sequence gaps,
  manifests, and retention locks.
- Security tests must cover VPC-SC/perimeter gaps, signed URL expiry,
  IAM Conditions, service account separation, and Cloud Armor rules.

## Architecture Output Requirements

When this module is selected, `architecture.md` must include:

- A Google Cloud project/folder map.
- Cloud Run vs GKE decision with evolution trigger.
- Cloud SQL vs Spanner decision with evolution trigger.
- Cloud Storage/Cloud Logging/BigQuery evidence roles.
- VPC-SC, restricted/private access, CMEK, Cloud Armor, SCC, Secret
  Manager, and deploy admission posture.
- DR and data-residency caveats with explicit RPO/RTO by workflow.
