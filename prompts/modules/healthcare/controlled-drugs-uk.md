# UK Controlled Drugs And CBPM Module

## Purpose

Plan UK controlled-drug and cannabis-based product for medicinal use
(CBPM) workflows for clinics, pharmacies, and patients. Use when the
brief mentions medical cannabis, CBPM, controlled drugs, Schedule 2/3,
FP10CD, CD Register, repeat caps, dispensing, owing, destruction, or
pharmacy inspection.

## Context

Controlled-drug workflows require statutory accuracy, contemporaneous
records, inventory traceability, physical/digital evidence, and
separation between clinical prescribing authority and pharmacy
dispensing operations.

## Core Components

```typescript
interface ControlledDrugWorkflow {
  prescription: {
    prescriptionId: string;
    fp10cdRequired: boolean;
    validityDays: number;
    prescriberSignatureRequired: boolean;
  };
  dispenseGate: {
    physicalScriptVerified: boolean;
    stockReserved: boolean;
    paymentReleaseAllowed: boolean;
    auditIntentCommitted: boolean;
  };
  cdRegisterEntry: {
    entryId: string;
    runningBalanceAfter: number;
    batchId: string;
    witnessedBy?: string;
    immutableSequence: number;
  };
}
```

## Implementation Patterns

- Separate prescription authoring/signing from pharmacy receipt,
  reservation, picking, packing, dispatch, owing, returns, and
  destruction.
- Require hard stops for expired prescriptions, missing FP10CD scan
  where required, negative running balance, recall/expiry conflicts,
  repeat-cap breaches, and missing audit intent.
- Use append-only CD Register entries with running balances, sequence
  numbers, actor attribution, witness fields when applicable, and
  immutable evidence.
- Owing worklists must preserve patient communication, stock
  reservation state, substitution decisions, and audit chain.
- Destruction/returns require witnessed confirmation, reason codes, and
  immutable evidence.

## Integration Points

- Product reference/formulary context for clinic-specific product rules.
- Pharmacy inventory and batch provenance.
- Prescribing context and patient treatment plan caps.
- Fulfilment/courier proof of delivery.
- Audit/evidence context for inspector packs.

## Security Considerations

- Patient-facing portals should expose only patient-safe prescription
  and order state, not internal controlled-drug operating controls.
- Pharmacy users see minimum necessary clinical context for safe
  dispensing.
- Overrides require MFA/step-up, role/purpose checks, reason capture,
  and immutable audit.

## Testing Considerations

- Test no dispatch without required script verification.
- Test no negative CD balance.
- Test repeat-cap hard stops and pharmacy cannot clinically override.
- Test recall/expiry blocking.
- Test inspector pack reconstruction from audit and register entries.

## Architecture Output Requirements

The architecture must identify controlled-drug and CBPM state owners,
Tier 0 workflow status, audit-fail-closed behavior, event ordering keys,
and inspector-pack evidence generation.
