import { describe, expect, it } from 'vitest';
import {
  evaluateReleaseGate,
  evaluateReleaseGates,
  type ReleaseGate,
} from '../../src/release/release-gates';

function gate(overrides: Partial<ReleaseGate> = {}): ReleaseGate {
  return {
    id: 'GATE-PRODUCTION-001',
    kind: 'production',
    dimension: 'primary-flow',
    threshold: 95,
    actualValue: 100,
    blocking: true,
    owner: 'Release engineering',
    requirementIds: ['REQ-FLOW-001'],
    taskIds: ['tasks-mvp-walking-skeleton-ios.md#T1'],
    requiredEvidence: ['production-flow-test'],
    actualEvidence: [{
      id: 'production-flow-test',
      source: 'reports/production-flow.json',
      outcome: 'pass',
      level: 'integration',
    }],
    ...overrides,
  };
}

describe('release gate evaluation', () => {
  it('blocks promotion on a hard-gate failure despite a high aggregate score', () => {
    const result = evaluateReleaseGates([
      gate({ id: 'GATE-SCORE-001', kind: 'scorecard', blocking: false, actualValue: 100 }),
      gate({ id: 'GATE-PRODUCTION-001', actualValue: 94 }),
    ]);

    expect(result.aggregateScore).toBe(97);
    expect(result.promotionAllowed).toBe(false);
    expect(result.blockingGateIds).toEqual(['GATE-PRODUCTION-001']);
  });

  it.each(['security', 'privacy', 'destructive-action', 'data-integrity'] as const)(
    'requires 100 percent for the %s dimension',
    (kind) => {
      const result = evaluateReleaseGate(gate({ kind, threshold: 80, actualValue: 99, blocking: false }));

      expect(result).toMatchObject({
        effectiveThreshold: 100,
        hardGate: true,
        decision: 'fail',
      });
    },
  );

  it('reports required and actual evidence with a precise missing-evidence reason', () => {
    const result = evaluateReleaseGate(gate({
      requiredEvidence: ['production-flow-test', 'privacy-review'],
    }));

    expect(result.requiredEvidence).toEqual(['production-flow-test', 'privacy-review']);
    expect(result.actualEvidence).toHaveLength(1);
    expect(result.missingEvidence).toEqual(['privacy-review']);
    expect(result.blockingReason).toContain('missing required evidence: privacy-review');
  });

  it('does not accept a passing evidence label without a source artifact', () => {
    const result = evaluateReleaseGate(gate({
      actualEvidence: [{
        id: 'production-flow-test',
        source: '',
        outcome: 'pass',
        level: 'integration',
      }],
    }));

    expect(result.decision).toBe('fail');
    expect(result.missingEvidence).toEqual(['production-flow-test']);
  });

  it('turns a structurally invalid soft gate into a blocking failure', () => {
    const result = evaluateReleaseGates([
      gate(),
      gate({
        id: 'GATE-SCORE-001',
        kind: 'scorecard',
        blocking: false,
        taskIds: [],
        requiredEvidence: [],
      }),
    ]);

    expect(result.promotionAllowed).toBe(false);
    expect(result.blockingGateIds).toEqual(['GATE-SCORE-001']);
    expect(result.results[1]).toMatchObject({
      schemaValid: false,
      hardGate: true,
      decision: 'fail',
    });
    expect(result.results[1].blockingReason).toContain('canonical task IDs are missing');
    expect(result.results[1].blockingReason).toContain('required evidence IDs are missing');
  });

  it('rejects score values outside the 0 to 100 contract', () => {
    const result = evaluateReleaseGate(gate({ threshold: -1, actualValue: 101 }));

    expect(result).toMatchObject({ schemaValid: false, hardGate: true, decision: 'fail' });
    expect(result.blockingReason).toContain('threshold must be between 0 and 100');
    expect(result.blockingReason).toContain('actual value must be between 0 and 100');
  });

  it('allows a failed non-blocking scorecard dimension without overriding hard gates', () => {
    const result = evaluateReleaseGates([
      gate(),
      gate({
        id: 'GATE-SCORE-001',
        kind: 'scorecard',
        blocking: false,
        threshold: 90,
        actualValue: 70,
      }),
    ]);

    expect(result.results.find((item) => item.id === 'GATE-SCORE-001')?.decision).toBe('fail');
    expect(result.promotionAllowed).toBe(true);
    expect(result.releaseReady).toBe(true);
  });
});
