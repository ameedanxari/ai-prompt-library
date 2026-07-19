export const RELEASE_GATE_KINDS = [
  'walking-skeleton',
  'beta',
  'production',
  'store-package',
  'security',
  'privacy',
  'destructive-action',
  'data-integrity',
  'fresh-account',
  'scorecard',
  'canary-promotion',
] as const;

export type ReleaseGateKind = (typeof RELEASE_GATE_KINDS)[number];
export type ReleaseGateDecision = 'pass' | 'fail';

export interface ReleaseGateEvidence {
  id: string;
  source: string;
  outcome: 'pass' | 'fail' | 'missing';
  level: string;
}

export interface ReleaseGate {
  id: string;
  kind: ReleaseGateKind;
  dimension: string;
  threshold: number;
  actualValue: number | null;
  blocking: boolean;
  owner: string;
  requirementIds: string[];
  taskIds: string[];
  requiredEvidence: string[];
  actualEvidence: ReleaseGateEvidence[];
}

export interface ReleaseGateResult extends ReleaseGate {
  effectiveThreshold: number;
  schemaValid: boolean;
  hardGate: boolean;
  decision: ReleaseGateDecision;
  missingEvidence: string[];
  blockingReason: string | null;
}

export interface ReleaseGateEvaluation {
  releaseReady: boolean;
  promotionAllowed: boolean;
  aggregateScore: number | null;
  blockingGateIds: string[];
  results: ReleaseGateResult[];
}

const TIER_ZERO_GATE_KINDS = new Set<ReleaseGateKind>([
  'security',
  'privacy',
  'destructive-action',
  'data-integrity',
  'fresh-account',
]);

export function evaluateReleaseGates(gates: ReleaseGate[]): ReleaseGateEvaluation {
  const results = gates.map(evaluateReleaseGate);
  const blockingGateIds = results
    .filter((result) => result.hardGate && result.decision === 'fail')
    .map((result) => result.id)
    .sort();
  const actualValues = results
    .map((result) => result.actualValue)
    .filter((actualValue): actualValue is number => actualValue !== null && Number.isFinite(actualValue));
  const aggregateScore = actualValues.length === 0
    ? null
    : actualValues.reduce((sum, actualValue) => sum + actualValue, 0) / actualValues.length;
  const promotionAllowed = gates.length > 0 && blockingGateIds.length === 0;

  return {
    releaseReady: promotionAllowed,
    promotionAllowed,
    aggregateScore,
    blockingGateIds,
    results,
  };
}

export function evaluateReleaseGate(gate: ReleaseGate): ReleaseGateResult {
  const tierZero = TIER_ZERO_GATE_KINDS.has(gate.kind);
  const effectiveThreshold = tierZero ? 100 : gate.threshold;
  const evidenceById = new Map(gate.actualEvidence.map((evidence) => [evidence.id, evidence]));
  const missingEvidence = gate.requiredEvidence.filter((evidenceId) => (
    evidenceById.get(evidenceId)?.outcome !== 'pass'
    || !evidenceById.get(evidenceId)?.source.trim()
    || !evidenceById.get(evidenceId)?.level.trim()
  ));
  const schemaReasons: string[] = [];

  if (!/^GATE-[A-Z0-9-]+$/.test(gate.id)) schemaReasons.push('gate ID must match GATE-[A-Z0-9-]+');
  if (!gate.dimension.trim()) schemaReasons.push('scorecard dimension is missing');
  if (!gate.owner.trim()) schemaReasons.push('gate owner is missing');
  if (gate.requirementIds.length === 0) schemaReasons.push('requirement IDs are missing');
  if (gate.taskIds.length === 0) schemaReasons.push('canonical task IDs are missing');
  if (gate.requiredEvidence.length === 0) schemaReasons.push('required evidence IDs are missing');
  if (!Number.isFinite(gate.threshold) || gate.threshold < 0 || gate.threshold > 100) {
    schemaReasons.push('threshold must be between 0 and 100');
  }
  if (
    gate.actualValue !== null
    && (!Number.isFinite(gate.actualValue) || gate.actualValue < 0 || gate.actualValue > 100)
  ) {
    schemaReasons.push('actual value must be between 0 and 100');
  }

  const schemaValid = schemaReasons.length === 0;
  const hardGate = gate.blocking || tierZero || !schemaValid;
  const reasons = [...schemaReasons];
  if (gate.actualValue === null || !Number.isFinite(gate.actualValue)) {
    reasons.push('actual value is missing');
  } else if (gate.actualValue < effectiveThreshold) {
    reasons.push(`actual ${gate.actualValue} is below threshold ${effectiveThreshold}`);
  }
  if (missingEvidence.length > 0) {
    reasons.push(`missing required evidence: ${missingEvidence.join(', ')}`);
  }

  return {
    ...gate,
    effectiveThreshold,
    schemaValid,
    hardGate,
    decision: reasons.length === 0 ? 'pass' : 'fail',
    missingEvidence,
    blockingReason: reasons.length === 0 ? null : reasons.join('; '),
  };
}
