import { describe, expect, it } from 'vitest';
import {
  buildTraceabilityMatrix,
  findTraceabilityGaps,
  type ReviewedSemanticOverride,
  type TraceabilityMatrixInput,
} from '../../src/traceability/traceability-matrix';

const completeOverride = (
  sourceId: string,
  oldValue = 'artifact-only',
  newValue = 'runtime-source',
): ReviewedSemanticOverride => ({
  sourceId,
  oldValue,
  newValue,
  rationale: 'Reviewed change is required for delivery.',
  affectedFlows: ['FLOW-1'],
  compensatingEvidence: 'tests/unit/change.test.ts',
  approval: 'planning-review',
  scope: 'this task only',
  expiry: 'before release readiness',
});

describe('traceability matrix', () => {
  it('blocks a critical requirement without task or evidence coverage', () => {
    const matrix = buildTraceabilityMatrix({
      requirements: [{ id: 'REQ-AUTH-001', critical: true }],
    });

    expect(findTraceabilityGaps(matrix).map((gap) => gap.code)).toEqual([
      'missing-critical-requirement-evidence',
      'missing-critical-requirement-task-coverage',
    ]);
  });

  it('flags feature dependency metadata dropped from covering tasks', () => {
    const matrix = buildTraceabilityMatrix({
      features: [
        { id: 'FEAT-CHECKOUT', dependsOnFeatureIds: ['FEAT-CART'] },
        { id: 'FEAT-CART' },
      ],
      tasks: [
        {
          id: 'tasks-checkout.md#T1',
          featureIds: ['FEAT-CHECKOUT'],
          dependsOnFeatureIds: [],
        },
      ],
    });

    expect(findTraceabilityGaps(matrix)).toMatchObject([
      {
        code: 'missing-feature-dependency-metadata',
        sourceId: 'FEAT-CHECKOUT',
        missingIds: ['FEAT-CART'],
      },
    ]);
  });

  it('requires reviewed overrides for artifact contract changes', () => {
    const input: TraceabilityMatrixInput = {
      features: [
        { id: 'FEAT-EXPORT', artifactContract: 'artifact-only' },
      ],
      tasks: [
        {
          id: 'tasks-export.md#T1',
          featureIds: ['FEAT-EXPORT'],
          artifactContract: 'runtime-source',
        },
      ],
    };

    expect(findTraceabilityGaps(buildTraceabilityMatrix(input))).toMatchObject([
      {
        code: 'artifact-contract-changed-without-override',
        sourceId: 'FEAT-EXPORT',
      },
    ]);

    const reviewed = buildTraceabilityMatrix({
      ...input,
      overrides: [completeOverride('FEAT-EXPORT:artifactContract:artifact-only->runtime-source')],
    });

    expect(findTraceabilityGaps(reviewed)).toEqual([]);
  });

  it('validates reviewed override fields', () => {
    const matrix = buildTraceabilityMatrix({
      overrides: [
        {
          ...completeOverride('FEAT-EXPORT'),
          approval: '',
          affectedFlows: [],
        },
      ],
    });

    expect(findTraceabilityGaps(matrix)).toMatchObject([
      {
        code: 'invalid-reviewed-override',
        sourceId: 'FEAT-EXPORT',
        missingIds: ['affectedFlows', 'approval'],
      },
    ]);
  });

  it('sorts matrix rows deterministically by source ID', () => {
    const matrix = buildTraceabilityMatrix({
      requirements: [{ id: 'REQ-Z' }, { id: 'REQ-A' }],
      flows: [{ id: 'FLOW-B' }],
      features: [{ id: 'FEAT-C' }],
    });

    expect(matrix.rows.map((row) => row.sourceId)).toEqual([
      'FEAT-C',
      'FLOW-B',
      'REQ-A',
      'REQ-Z',
    ]);
  });
});
