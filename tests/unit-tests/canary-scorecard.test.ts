import { describe, expect, it } from 'vitest';
import {
  evaluateReleaseGates,
  type ReleaseGate,
  type ReleaseGateKind,
} from '../../src/release/release-gates';

const TIER_ZERO = new Set(['security', 'privacy', 'destructive-action', 'data-integrity']);

interface CanaryScorecard {
  schemaVersion: 1;
  runId: string;
  overallScore: number;
  dimensions: Record<string, number>;
  hardGates: Array<{ id: string; passed: boolean; evidence: string }>;
}

function evidence(id: string, source: string, passed = true) {
  return [{
    id,
    source,
    outcome: passed ? 'pass' as const : 'fail' as const,
    level: 'integration',
  }];
}

function evaluateCanaryScorecard(scorecard: CanaryScorecard) {
  const gates: ReleaseGate[] = [{
    id: 'GATE-CANARY-OVERALL',
    kind: 'canary-promotion',
    dimension: 'overall',
    threshold: 90,
    actualValue: scorecard.overallScore,
    blocking: true,
    owner: 'Canary release owner',
    requirementIds: ['REQ-CANARY-005'],
    taskIds: ['canary-run'],
    requiredEvidence: ['scorecard'],
    actualEvidence: evidence('scorecard', `${scorecard.runId}/scorecard.json`),
  }];

  for (const [dimension, actualValue] of Object.entries(scorecard.dimensions)) {
    const tierZero = TIER_ZERO.has(dimension);
    gates.push({
      id: `GATE-CANARY-DIMENSION-${dimension.toUpperCase()}`,
      kind: (tierZero ? dimension : 'scorecard') as ReleaseGateKind,
      dimension,
      threshold: tierZero ? 100 : 85,
      actualValue,
      blocking: true,
      owner: 'Canary release owner',
      requirementIds: ['REQ-CANARY-006'],
      taskIds: ['canary-run'],
      requiredEvidence: [`dimension-${dimension}`],
      actualEvidence: evidence(
        `dimension-${dimension}`,
        `${scorecard.runId}/evidence/${dimension}.json`,
      ),
    });
  }

  for (const hardGate of scorecard.hardGates) {
    gates.push({
      id: hardGate.id,
      kind: 'production',
      dimension: hardGate.id,
      threshold: 100,
      actualValue: hardGate.passed ? 100 : 0,
      blocking: true,
      owner: 'Canary release owner',
      requirementIds: ['REQ-CANARY-006'],
      taskIds: ['canary-run'],
      requiredEvidence: [`evidence-${hardGate.id}`],
      actualEvidence: evidence(`evidence-${hardGate.id}`, hardGate.evidence, hardGate.passed),
    });
  }

  return evaluateReleaseGates(gates);
}

function scorecard(overrides: Partial<CanaryScorecard> = {}): CanaryScorecard {
  return {
    schemaVersion: 1,
    runId: 'pocket-pantry-run-001',
    overallScore: 94,
    dimensions: {
      'planning-quality': 92,
      'implementation-evidence': 90,
      security: 100,
      privacy: 100,
      'destructive-action': 100,
      'data-integrity': 100,
    },
    hardGates: [{
      id: 'GATE-CANARY-PRODUCTION-FLOW',
      passed: true,
      evidence: 'evidence/production-flow.json',
    }],
    ...overrides,
  };
}

describe('canary scorecard promotion', () => {
  it('promotes a machine-readable scorecard that satisfies every threshold', () => {
    const fixture = JSON.parse(JSON.stringify(scorecard())) as CanaryScorecard;
    const result = evaluateCanaryScorecard(fixture);

    expect(result.promotionAllowed).toBe(true);
    expect(result.blockingGateIds).toEqual([]);
  });

  it('rejects overall 94 when one hard gate fails', () => {
    const result = evaluateCanaryScorecard(scorecard({
      hardGates: [{
        id: 'GATE-CANARY-PRODUCTION-FLOW',
        passed: false,
        evidence: 'evidence/production-flow.json',
      }],
    }));

    expect(result.promotionAllowed).toBe(false);
    expect(result.blockingGateIds).toContain('GATE-CANARY-PRODUCTION-FLOW');
  });

  it('rejects a non-tier-zero dimension at 84', () => {
    const result = evaluateCanaryScorecard(scorecard({
      dimensions: { ...scorecard().dimensions, 'planning-quality': 84 },
    }));

    expect(result.promotionAllowed).toBe(false);
    expect(result.blockingGateIds).toContain('GATE-CANARY-DIMENSION-PLANNING-QUALITY');
  });

  it('rejects privacy at 99 because tier-zero dimensions require 100', () => {
    const result = evaluateCanaryScorecard(scorecard({
      dimensions: { ...scorecard().dimensions, privacy: 99 },
    }));

    const privacy = result.results.find((gate) => gate.dimension === 'privacy');
    expect(privacy).toMatchObject({
      actualValue: 99,
      effectiveThreshold: 100,
      hardGate: true,
      decision: 'fail',
    });
    expect(result.promotionAllowed).toBe(false);
  });
});
