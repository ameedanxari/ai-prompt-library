# Clinical Safety DCB0129/DCB0160 Module

## Purpose

Plan clinical safety governance for health IT systems where software
can influence triage, prescribing, product selection, dosing, patient
messaging, dispensing, or clinical operations.

## Context

Clinical safety work cannot be bolted on after feature generation.
The plan must identify hazards, deterministic safety gates, human
approval points, evidence records, and deployment responsibilities
before implementation tasks begin.

## Core Components

```typescript
interface ClinicalSafetyCase {
  safetyCaseId: string;
  intendedUse: string;
  hazardLog: Hazard[];
  safetyControls: SafetyControl[];
  deploymentResponsibilities: DeploymentResponsibility[];
}

interface Hazard {
  hazardId: string;
  workflow: string;
  harm: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  controlIds: string[];
}

interface SafetyControl {
  controlId: string;
  type: 'deterministic-rule' | 'human-approval' | 'audit' | 'monitoring' | 'kill-switch';
  verification: string;
}
```

## Implementation Patterns

- Classify intended use for every AI/rules feature.
- AI can assist, extract, summarize, rank, forecast, or explain.
- AI must not perform final clinical, legal, prescribing, dispensing,
  payment-release, cap-override, CD Register, destruction, or witness
  actions without a separately approved safety case and human approval.
- Use deterministic rules for hard exclusions, caps, eligibility blocks,
  interaction hard stops, prescription validity, and dispense release.
- Use `DecisionTrace` and `HumanApproval` contracts for every
  recommendation that influences clinical or operational workflow.

## Integration Points

- Triage and SCR/document extraction.
- Clinical decision support and policy/rule packs.
- Prescribing and treatment-plan approval.
- Pharmacy dispense gates and controlled-drug workflows.
- Patient education, legal-rights content, and messaging escalation.
- AI governance registry, model registry, prompt registry, and
  knowledge-base registry.

## Security Considerations

- Clinical safety evidence contains PHI and governance-sensitive data;
  protect it with the same controls as clinical records.
- Human approvals require actor, role, tenant, purpose, versioned
  recommendation, evidence bundle, reason, and timestamp.
- Kill switches must work by model, workflow, tenant, clinic, and
  feature.

## Testing Considerations

- Verify every high-risk workflow has a hazard entry and control.
- Test deterministic safety gates with failing fixtures.
- Test `DecisionTrace` replay and evidence reconstruction.
- Test kill switches, drift monitoring, override monitoring, and
  post-incident CAPA evidence.

## Architecture Output Requirements

Architecture and task outputs must include clinical safety case
skeleton, hazard log, AI governance plan, human approval boundaries,
and evidence requirements before implementation begins.
