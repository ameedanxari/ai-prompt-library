# Regulated Cloud Landing Zone Module

## Purpose

Define landing-zone requirements for production cloud systems that
handle regulated, sensitive, or mission-critical data.

## Context

A regulated cloud plan needs more than compute and database choices. It
needs organizational controls, environment separation, identity,
networking, audit sinks, incident response, backup/restore evidence,
and deployment admission controls.

## Core Components

```typescript
interface RegulatedLandingZone {
  environments: ['development', 'staging', 'production'];
  dataPolicy: {
    nonProductionData: 'synthetic' | 'anonymized-only';
    productionRegion: string;
    crossBorderTransferRequiresApproval: boolean;
  };
  controls: {
    orgPolicy: string[];
    iamConditions: boolean;
    privateNetworking: boolean;
    cmek: boolean;
    centralAuditSinks: boolean;
    deployAdmission: boolean;
  };
}
```

## Implementation Patterns

- Separate production from dev/staging; non-production must not contain
  live PHI/PII unless explicitly approved by governance.
- Apply resource-location policy, public-access prevention, private
  database networking, service-account separation, and central audit
  sinks.
- Use infrastructure as code for projects, IAM, networks, databases,
  buckets, keys, logging sinks, alerts, and deploy gates.
- Require branch protection, provenance, artifact scanning,
  vulnerability scanning, and production deploy admission.
- Define incident roles: security lead, DPO/privacy lead, clinical
  safety lead when applicable, service owner, communications owner.

## Integration Points

- Cloud-provider project/account/folder setup.
- CI/CD pipeline and artifact registry.
- SIEM/SOC exports and security monitoring.
- Pager/incident tooling.
- Backup, restore, and audit-verification jobs.

## Security Considerations

- Least-privilege IAM is a build artifact, not a manual console step.
- Secrets live in managed secret storage.
- Break-glass infrastructure access is privileged, time-boxed,
  approved, and audited.
- Production data access by support or operators requires purpose,
  approval, and immutable audit.

## Testing Considerations

- Policy-as-code tests for public access, region, IAM, and encryption.
- Restore drills and evidence retention.
- Alert routing tests and incident-tabletop evidence.
- Deploy rollback and canary/blue-green validation.
