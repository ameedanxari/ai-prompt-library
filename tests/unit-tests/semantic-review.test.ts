import { describe, expect, it } from 'vitest';
import {
  SEMANTIC_REVIEW_DIMENSIONS,
  validateSemanticReviewBundle,
  type SemanticFinding,
  type SemanticReviewBundle,
} from '../../src/review/index.js';

const REVISION = 'abc1234';
const NOW = '2026-07-11T12:00:00Z';

function evidence(outcome: 'pass' | 'fail' | 'inconclusive' = 'pass') {
  return [{ kind: 'test' as const, source: 'tests/review.test.ts', locator: 'review gate', outcome }];
}

function validBundle(): SemanticReviewBundle {
  const reports = SEMANTIC_REVIEW_DIMENSIONS.map((dimension, index) => ({
    schemaVersion: 1 as const,
    reviewId: `REVIEW-${index + 1}`,
    dimension,
    sourceRevision: REVISION,
    reviewedAt: NOW,
    reviewer: {
      reviewerId: `perspective-${(index % 3) + 1}`,
      contextId: `context-${index + 1}`,
      promptFile: `prompts/review/${dimension}.md`,
      independentContext: true,
      implementationNarrativeReceived: index !== 0,
    },
    scope: { requirementIds: ['REQ-1'], taskIds: ['tasks-one.md#T1'], files: ['src/index.ts'] },
    claimsReviewed: ['The requested behavior works end to end.'],
    validationScenarios: dimension === 'functional-validation' ? [{
      scenarioId: 'SCENARIO-HAPPY-PATH',
      requirementIds: ['REQ-1'],
      evidenceLevel: 'integration',
      commandOrProcedure: 'npm test',
      expectedBehavior: 'The user workflow succeeds.',
      observedBehavior: 'The user workflow succeeded.',
      outcome: 'pass' as const,
      evidence: evidence(),
    }] : [],
    findings: [],
    verdict: 'pass' as const,
  }));

  return {
    reports,
    synthesis: {
      schemaVersion: 1,
      synthesisId: 'SYNTHESIS-1',
      sourceRevision: REVISION,
      synthesizedAt: NOW,
      includedReviewIds: reports.map((report) => report.reviewId),
      canonicalFindings: [],
      disagreements: [],
      unresolvedFindingIds: [],
      blockingFindingIds: [],
      resolvedFindingIds: [],
      completionRecommendation: 'verified_complete',
      rationale: 'All independent dimensions passed with retained evidence.',
      evidence: evidence(),
    },
    completionDecision: {
      schemaVersion: 1,
      decisionId: 'DECISION-1',
      sourceRevision: REVISION,
      decidedAt: NOW,
      challenger: {
        reviewerId: 'completion-challenger',
        contextId: 'completion-context',
        promptFile: 'prompts/review/completion-challenge.md',
        independentContext: true,
        implementationNarrativeReceived: false,
      },
      decision: 'verified_complete',
      mechanicalGates: [{ id: 'test-suite', status: 'pass', evidence: ['npm test passed'] }],
      semanticReviewPassed: true,
      functionalValidationPassed: true,
      unresolvedFindingIds: [],
      nextTask: null,
      rationale: 'The completion claim survived an independent challenge.',
      evidence: evidence(),
    },
  };
}

function openFinding(): SemanticFinding {
  return {
    findingId: 'FIND-INTENT-1',
    dimension: 'intent-fidelity',
    severity: 'high',
    disposition: 'open',
    claim: 'The implementation satisfies REQ-1.',
    expectedBehavior: 'REQ-1 is observable in the user workflow.',
    observedBehavior: 'The workflow omits REQ-1.',
    evidence: evidence('fail'),
    requirementIds: ['REQ-1'],
    taskIds: ['tasks-one.md#T1'],
    confidence: 0.95,
    validationNeeded: 'Run the end-to-end workflow after remediation.',
    recommendedAction: 'Implement the missing behavior.',
    remediationRequired: true,
  };
}

describe('semantic review validation', () => {
  it('permits completion only for a consistent, independently reviewed bundle', () => {
    const report = validateSemanticReviewBundle(validBundle());

    expect(report).toMatchObject({ valid: true, completionAllowed: true, status: 'pass' });
    expect(report.issues).toEqual([]);
  });

  it('rejects missing dimensions, reused contexts, and absent functional scenarios', () => {
    const bundle = validBundle();
    bundle.reports = bundle.reports.filter((report) => report.dimension !== 'user-outcome');
    bundle.reports[1].reviewer.contextId = bundle.reports[0].reviewer.contextId;
    const functional = bundle.reports.find((report) => report.dimension === 'functional-validation');
    if (functional) functional.validationScenarios = [];

    const report = validateSemanticReviewBundle(bundle);
    const codes = report.issues.map((issue) => issue.code);

    expect(report.status).toBe('invalid');
    expect(codes).toEqual(expect.arrayContaining([
      'missing-dimension-report',
      'review-context-reused',
      'functional-scenarios-missing',
    ]));
  });

  it('rejects synthesis that drops an independent finding', () => {
    const bundle = validBundle();
    bundle.reports[0].findings = [openFinding()];
    bundle.reports[0].verdict = 'fail';

    const report = validateSemanticReviewBundle(bundle);

    expect(report.issues.map((issue) => issue.code)).toContain('synthesis-finding-loss');
  });

  it('rejects synthesis that changes an independent finding lifecycle', () => {
    const bundle = validBundle();
    const finding = openFinding();
    bundle.reports[0].findings = [finding];
    bundle.reports[0].verdict = 'fail';
    bundle.synthesis!.canonicalFindings = [{ ...finding, disposition: 'resolved', remediationRequired: false }];
    bundle.synthesis!.resolvedFindingIds = [finding.findingId];

    const report = validateSemanticReviewBundle(bundle);

    expect(report.issues.map((issue) => issue.code)).toContain('synthesis-finding-mutated');
  });

  it('rejects a functional pass claim when any scenario did not pass', () => {
    const bundle = validBundle();
    const functional = bundle.reports.find((report) => report.dimension === 'functional-validation')!;
    functional.validationScenarios[0].outcome = 'blocked';

    const report = validateSemanticReviewBundle(bundle);

    expect(report.issues.map((issue) => issue.code)).toContain('functional-pass-claim-disagreement');
  });

  it('rejects a verified-complete decision with unresolved findings', () => {
    const bundle = validBundle();
    const finding = openFinding();
    bundle.reports[0].findings = [finding];
    bundle.reports[0].verdict = 'fail';
    bundle.synthesis!.canonicalFindings = [finding];
    bundle.synthesis!.unresolvedFindingIds = [finding.findingId];
    bundle.synthesis!.blockingFindingIds = [finding.findingId];
    bundle.completionDecision!.unresolvedFindingIds = [finding.findingId];

    const report = validateSemanticReviewBundle(bundle);

    expect(report.issues.map((issue) => issue.code)).toEqual(expect.arrayContaining([
      'verified-complete-with-findings',
      'verified-complete-with-failed-review',
    ]));
  });

  it('accepts a complete remediation handoff while refusing completion', () => {
    const bundle = validBundle();
    const finding = openFinding();
    bundle.reports[0].findings = [finding];
    bundle.reports[0].verdict = 'fail';
    bundle.synthesis!.canonicalFindings = [finding];
    bundle.synthesis!.unresolvedFindingIds = [finding.findingId];
    bundle.synthesis!.blockingFindingIds = [finding.findingId];
    bundle.synthesis!.completionRecommendation = 'remediation_required';
    bundle.completionDecision!.decision = 'remediation_required';
    bundle.completionDecision!.semanticReviewPassed = false;
    bundle.completionDecision!.functionalValidationPassed = true;
    bundle.completionDecision!.unresolvedFindingIds = [finding.findingId];
    bundle.completionDecision!.nextTask = 'review/remediation-plan.md#R1';
    bundle.remediationPlan = [
      '## R1 - Close FIND-INTENT-1',
      '**Artifact kind:** code',
      '**Evidence level:** integration',
      '**File:** src/index.ts',
      '**Acceptance:** REQ-1 is observable.',
      '**Test:** npm test',
    ].join('\n');

    const report = validateSemanticReviewBundle(bundle);

    expect(report).toMatchObject({ valid: true, completionAllowed: false, status: 'remediation-required' });
    expect(report.issues).toEqual([]);
  });
});
