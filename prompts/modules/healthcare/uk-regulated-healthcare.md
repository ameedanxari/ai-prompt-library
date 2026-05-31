# UK Regulated Healthcare Module

## Purpose

Generate healthcare plans for UK patient, clinic, pharmacy, and
clinical-administration products that must align with UK governance,
clinical safety, privacy, and audit expectations.

## Context

UK regulated healthcare is not the same as US HIPAA healthcare. HIPAA
may be relevant for future US expansion, but UK-first products need
DTAC/DSPT, DCB0129/DCB0160, CQC, ICO/GDPR, NHS Login/SCR integration
where approved, Caldicott-style access discipline, and clinical safety
governance.

## Core Components

```typescript
interface UkHealthcareGovernance {
  privacy: {
    gdpr: true;
    dpiaRequired: boolean;
    ropaRequired: boolean;
    dsarExportRequired: boolean;
  };
  clinicalSafety: {
    dcb0129HazardLog: boolean;
    dcb0160DeploymentEvidence: boolean;
    clinicalSafetyOfficer: string;
  };
  assurance: {
    dtacEvidencePack: boolean;
    dsptEvidence: boolean;
    cqcGovernanceEvidence: boolean;
  };
  identity: {
    nhsLoginCandidate: boolean;
    mfaForStaff: boolean;
    stepUpForSensitiveActions: boolean;
  };
}
```

## Implementation Patterns

### Governance Evidence

- Produce a DPIA and RoPA skeleton before build for PHI/PII systems.
- Define controller/processor responsibilities for clinics,
  pharmacies, platform operator, couriers, payment providers, AI
  vendors, and support vendors.
- Define retention schedules per data class instead of one global
  retention period.
- DSAR export must include signed manifests and file hashes when
  medical records, prescriptions, documents, or audit evidence are
  exported.

### Clinical Safety

- Create a clinical safety case skeleton for DCB0129 and a deployment
  responsibility handoff for DCB0160.
- Maintain a hazard log for triage, prescribing, dispensing, AI
  recommendations, patient messaging, legal-rights content, and
  controlled-drug workflows.
- Separate deterministic safety gates from AI suggestions.

### Identity And Access

- Use MFA and step-up authentication for staff and high-risk patient
  actions.
- Evaluate NHS Login only where approved by the product scope and
  integration readiness.
- Enforce RBAC plus ABAC checks for tenant, role, purpose, consent,
  device trust, location, and action risk.

## Integration Points

- NHS Login/OIDC when approved.
- Summary Care Record integration only through approved routes and
  lawful basis.
- FHIR UK Core boundaries for interoperable edges.
- SNOMED CT and dm+d terminology services for clinical configuration,
  product references, interactions, and evidence packs.
- Inspector packs for CQC, pharmacy governance, internal clinical
  safety, DSAR, and incident reviews.

## Security Considerations

- Treat PHI, PII, prescription data, controlled-drug records, patient
  legal-rights documents, and clinical recommendations as sensitive.
- Do not expose unnecessary clinical data to pharmacies or third
  parties; apply minimum-necessary access and masking.
- Sensitive access is attributable, tenant-scoped, purpose-coded, and
  auditable.
- Breach response runbooks must include DPO, clinical safety, support,
  and controller notification paths.

## Testing Considerations

- Test DSAR export completeness and manifest verification.
- Test tenant isolation and role/purpose enforcement.
- Test clinical safety hard stops and human approval capture.
- Test evidence pack generation against expected CQC/DTAC/DCB0129
  artifact lists.

## Architecture Output Requirements

When UK healthcare terms are present, outputs must not collapse the
plan into HIPAA-only language. The architecture must name UK-specific
constraints, evidence artifacts, clinical safety responsibilities, and
data-residency posture.
