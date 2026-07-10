export const RELEASE_GATE_KINDS = [
  'walking-skeleton',
  'beta',
  'production',
  'store-package',
  'security',
  'privacy',
  'destructive-action',
  'data-integrity',
  'scorecard',
  'canary-promotion',
] as const;

export type ReleaseGateKind = (typeof RELEASE_GATE_KINDS)[number];
export type ReleaseGateDecision = 'pass' | 'fail';

export interface ReleaseGateEvidence {
  id: string;
  source: string;
  outcome: 'pass' | 'fail' | 'missing';
  level?: string;
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
  const hardGate = gate.blocking || tierZero;
  const effectiveThreshold = tierZero ? 100 : gate.threshold;
  const evidenceById = new Map(gate.actualEvidence.map((evidence) => [evidence.id, evidence]));
  const missingEvidence = gate.requiredEvidence.filter((evidenceId) => (
    evidenceById.get(evidenceId)?.outcome !== 'pass'
    || !evidenceById.get(evidenceId)?.source.trim()
  ));
  const reasons: string[] = [];

  if (!gate.owner.trim()) reasons.push('gate owner is missing');
  if (gate.requirementIds.length === 0) reasons.push('requirement IDs are missing');
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
    hardGate,
    decision: reasons.length === 0 ? 'pass' : 'fail',
    missingEvidence,
    blockingReason: reasons.length === 0 ? null : reasons.join('; '),
  };
}
