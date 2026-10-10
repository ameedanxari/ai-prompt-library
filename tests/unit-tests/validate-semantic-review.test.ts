import { describe, expect, it } from 'vitest';
import { execFileSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { SEMANTIC_REVIEW_DIMENSIONS, SEMANTIC_REVIEW_REPORT_FILES } from '../../src/review/index.js';

const REPO_ROOT = path.resolve(__dirname, '..', '..');
const SCRIPT = path.join(REPO_ROOT, 'scripts', 'validate-semantic-review.sh');
const NOW = '2026-07-11T12:00:00Z';

function run(target: string): { code: number; out: string } {
  try {
    return { code: 0, out: execFileSync('bash', [SCRIPT, target], { encoding: 'utf8' }) };
  } catch (error) {
    const failure = error as { status?: number; stdout?: Buffer; stderr?: Buffer };
    return {
      code: failure.status ?? 1,
      out: `${failure.stdout?.toString() ?? ''}${failure.stderr?.toString() ?? ''}`,
    };
  }
}

function writeJson(directory: string, name: string, value: unknown): void {
  fs.writeFileSync(path.join(directory, name), `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function writeValidReview(root: string, remediation = false): void {
  const review = path.join(root, 'review');
  fs.mkdirSync(review, { recursive: true });
  const finding = {
    findingId: 'FIND-INTENT-1',
    dimension: 'intent-fidelity',
    severity: 'high',
    disposition: 'open',
    claim: 'REQ-1 is complete.',
    expectedBehavior: 'REQ-1 is observable.',
    observedBehavior: 'REQ-1 is absent.',
    evidence: [{ kind: 'test', source: 'tests/e2e.ts', outcome: 'fail' }],
    requirementIds: ['REQ-1'],
    taskIds: ['tasks-one.md#T1'],
    confidence: 0.9,
    validationNeeded: 'Rerun the workflow.',
    recommendedAction: 'Implement REQ-1.',
    remediationRequired: true,
  };
  const reports = SEMANTIC_REVIEW_DIMENSIONS.map((dimension, index) => ({
    schemaVersion: 1,
    reviewId: `REVIEW-${index + 1}`,
    dimension,
    sourceRevision: 'abc1234',
    reviewedAt: NOW,
    reviewer: {
      reviewerId: `perspective-${(index % 3) + 1}`,
      contextId: `context-${index + 1}`,
      promptFile: `prompts/review/${dimension}.md`,
      independentContext: true,
      implementationNarrativeReceived: index !== 0,
    },
    scope: { requirementIds: ['REQ-1'], taskIds: ['tasks-one.md#T1'], files: ['src/index.ts'] },
    claimsReviewed: ['REQ-1 is complete.'],
    validationScenarios: dimension === 'functional-validation' ? [{
      scenarioId: 'SCENARIO-1',
      requirementIds: ['REQ-1'],
      evidenceLevel: 'integration',
      commandOrProcedure: 'npm test',
      expectedBehavior: 'Workflow succeeds.',
      observedBehavior: 'Workflow succeeds.',
      outcome: 'pass',
      evidence: [{ kind: 'test', source: 'tests/e2e.ts', outcome: 'pass' }],
    }] : [],
    findings: remediation && dimension === 'intent-fidelity' ? [finding] : [],
    verdict: remediation && dimension === 'intent-fidelity' ? 'fail' : 'pass',
  }));
  for (const report of reports) {
    writeJson(review, SEMANTIC_REVIEW_REPORT_FILES[report.dimension], report);
  }
  writeJson(review, 'review-synthesis.json', {
    schemaVersion: 1,
    synthesisId: 'SYNTHESIS-1',
    sourceRevision: 'abc1234',
    synthesizedAt: NOW,
    includedReviewIds: reports.map((report) => report.reviewId),
    canonicalFindings: remediation ? [finding] : [],
    disagreements: [],
    unresolvedFindingIds: remediation ? [finding.findingId] : [],
    blockingFindingIds: remediation ? [finding.findingId] : [],
    resolvedFindingIds: [],
    completionRecommendation: remediation ? 'remediation_required' : 'verified_complete',
    rationale: 'All findings and evidence were synthesized.',
    evidence: [{ kind: 'review', source: 'review reports', outcome: remediation ? 'fail' : 'pass' }],
  });
  writeJson(review, 'completion-decision.json', {
    schemaVersion: 1,
    decisionId: 'DECISION-1',
    sourceRevision: 'abc1234',
    decidedAt: NOW,
    challenger: {
      reviewerId: 'challenger',
      contextId: 'challenge-context',
      promptFile: 'prompts/review/completion-challenge.md',
      independentContext: true,
      implementationNarrativeReceived: false,
    },
    decision: remediation ? 'remediation_required' : 'verified_complete',
    mechanicalGates: [{ id: 'tests', status: 'pass', evidence: ['npm test'] }],
    semanticReviewPassed: !remediation,
    functionalValidationPassed: true,
    unresolvedFindingIds: remediation ? [finding.findingId] : [],
    nextTask: remediation ? 'review/remediation-plan.md#R1' : null,
    rationale: remediation ? 'A blocking semantic finding remains.' : 'Completion survived challenge.',
    evidence: [{ kind: 'review', source: 'review-synthesis.json', outcome: remediation ? 'fail' : 'pass' }],
  });
  if (remediation) {
    fs.writeFileSync(path.join(review, 'remediation-plan.md'), [
      '## R1 - Close FIND-INTENT-1',
      '**Artifact kind:** code',
      '**Evidence level:** integration',
      '**File:** src/index.ts',
      '**Acceptance:** REQ-1 is observable.',
      '**Test:** npm test',
    ].join('\n'), 'utf8');
  }
}

describe('validate-semantic-review.sh', () => {
  it('is executable', () => {
    expect(fs.existsSync(SCRIPT)).toBe(true);
    expect((fs.statSync(SCRIPT).mode & 0o111) !== 0).toBe(true);
  });

  it('returns 2 when the review directory is missing', () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'semantic-review-missing-'));
    try {
      expect(run(root)).toMatchObject({ code: 2 });
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });

  it('returns 0 and writes a passing report for verified completion', () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'semantic-review-pass-'));
    try {
      writeValidReview(root);
      const result = run(root);
      const report = JSON.parse(fs.readFileSync(path.join(root, 'review', 'semantic-review-validation.json'), 'utf8'));

      expect(result.code).toBe(0);
      expect(report).toMatchObject({ status: 'pass', valid: true, completionAllowed: true });
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });

  it('returns 1 for a valid remediation handoff', () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'semantic-review-remediation-'));
    try {
      writeValidReview(root, true);
      const result = run(root);
      const report = JSON.parse(fs.readFileSync(path.join(root, 'review', 'semantic-review-validation.json'), 'utf8'));

      expect(result.code).toBe(1);
      expect(report).toMatchObject({ status: 'remediation-required', valid: true, completionAllowed: false });
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });

  it('returns 2 for malformed review artifacts', () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'semantic-review-invalid-'));
    try {
      fs.mkdirSync(path.join(root, 'review'));
      fs.writeFileSync(path.join(root, 'review', 'intent-fidelity-report.json'), '{bad json', 'utf8');
      const result = run(root);
      const report = JSON.parse(fs.readFileSync(path.join(root, 'review', 'semantic-review-validation.json'), 'utf8'));

      expect(result.code).toBe(2);
      expect(report.status).toBe('invalid');
      expect(report.issues.map((issue: { code: string }) => issue.code)).toContain('malformed-review-artifact');
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });

  describe('review-scope.json', () => {
    const BASE = 'base111';
    const NEW = 'new2222';

    function setRevision(review: string, name: string, revision: string): void {
      const file = path.join(review, name);
      const value = JSON.parse(fs.readFileSync(file, 'utf8'));
      value.sourceRevision = revision;
      writeJson(review, name, value);
    }

    // Delta fixture: bundle-level artifacts at NEW; two dimensions re-reviewed at NEW, six carried at BASE.
    function writeDeltaReview(root: string, scope: Record<string, unknown> | string | null, decision?: string): string {
      writeValidReview(root, true);
      const review = path.join(root, 'review');
      const scoped = ['intent-fidelity', 'functional-validation'];
      for (const dimension of SEMANTIC_REVIEW_DIMENSIONS) {
        setRevision(review, SEMANTIC_REVIEW_REPORT_FILES[dimension], scoped.includes(dimension) ? NEW : BASE);
      }
      setRevision(review, 'review-synthesis.json', NEW);
      setRevision(review, 'completion-decision.json', NEW);
      if (typeof scope === 'string') {
        fs.writeFileSync(path.join(review, 'review-scope.json'), scope, 'utf8');
      } else if (scope) {
        writeJson(review, 'review-scope.json', {
          mode: 'delta',
          sourceRevision: NEW,
          baseRevision: BASE,
          dimensions: scoped,
          ...scope,
        });
      }
      if (decision) {
        const file = path.join(review, 'completion-decision.json');
        const value = JSON.parse(fs.readFileSync(file, 'utf8'));
        Object.assign(value, { decision, nextTask: null, semanticReviewPassed: true, unresolvedFindingIds: [] });
        writeJson(review, 'completion-decision.json', value);
      }
      return review;
    }

    function validate(root: string): { code: number; report: { status: string; valid: boolean; reviewMode: string; scopedDimensions: string[]; sourceRevision: string | null; issues: Array<{ code: string; message: string; artifact?: string }> } } {
      const result = run(root);
      const report = JSON.parse(fs.readFileSync(path.join(root, 'review', 'semantic-review-validation.json'), 'utf8'));
      return { code: result.code, report };
    }

    function withRoot(body: (root: string) => void): void {
      const root = fs.mkdtempSync(path.join(os.tmpdir(), 'semantic-review-scope-'));
      try {
        body(root);
      } finally {
        fs.rmSync(root, { recursive: true, force: true });
      }
    }

    const codes = (report: { issues: Array<{ code: string }> }): string[] => report.issues.map((issue) => issue.code);

    it('reports full mode with no scoped dimensions when review-scope.json is absent', () => {
      withRoot((root) => {
        writeValidReview(root);
        const { code, report } = validate(root);
        expect(code).toBe(0);
        expect(report).toMatchObject({ status: 'pass', reviewMode: 'full', scopedDimensions: [] });
      });
    });

    it('treats an explicit full scope exactly like an absent scope', () => {
      withRoot((root) => {
        writeValidReview(root);
        writeJson(path.join(root, 'review'), 'review-scope.json', { mode: 'full', sourceRevision: 'abc1234' });
        const { code, report } = validate(root);
        expect(code).toBe(0);
        expect(report).toMatchObject({ status: 'pass', reviewMode: 'full', scopedDimensions: [] });
      });
    });

    it('still rejects mixed revisions in full mode', () => {
      withRoot((root) => {
        writeValidReview(root);
        setRevision(path.join(root, 'review'), 'implementation-review.json', 'other999');
        const { code, report } = validate(root);
        expect(code).toBe(2);
        expect(codes(report)).toEqual(expect.arrayContaining(['source-revision-disagreement', 'bundle-source-revision-disagreement']));
      });
    });

    it('accepts a delta review with scoped reports at the new revision and carried reports at the base revision', () => {
      withRoot((root) => {
        writeDeltaReview(root, {});
        const { code, report } = validate(root);
        expect(report.issues).toEqual([]);
        expect(code).toBe(1);
        expect(report).toMatchObject({
          status: 'remediation-required',
          valid: true,
          reviewMode: 'delta',
          scopedDimensions: ['functional-validation', 'intent-fidelity'],
          sourceRevision: NEW,
        });
      });
    });

    it('rejects a carried report at a third revision', () => {
      withRoot((root) => {
        const review = writeDeltaReview(root, {});
        setRevision(review, 'adversarial-review.json', 'third333');
        const { code, report } = validate(root);
        expect(code).toBe(2);
        const issue = report.issues.find((item) => item.code === 'delta-report-revision-mismatch');
        expect(issue).toBeDefined();
        expect(issue?.artifact).toBe('adversarial-review.json');
        expect(issue?.message).toContain(BASE);
        expect(issue?.message).toContain(NEW);
      });
    });

    it('rejects a scoped report left at the base revision', () => {
      withRoot((root) => {
        const review = writeDeltaReview(root, {});
        setRevision(review, 'intent-fidelity-report.json', BASE);
        const { code, report } = validate(root);
        expect(code).toBe(2);
        expect(report.issues.filter((item) => item.code === 'delta-report-revision-mismatch').map((item) => item.artifact))
          .toEqual(['intent-fidelity-report.json']);
      });
    });

    it('rejects a stale synthesis revision in delta mode', () => {
      withRoot((root) => {
        const review = writeDeltaReview(root, {});
        setRevision(review, 'review-synthesis.json', BASE);
        const { code, report } = validate(root);
        expect(code).toBe(2);
        expect(codes(report)).toContain('bundle-source-revision-disagreement');
      });
    });

    it('rejects a delta completion decision left at the base revision', () => {
      withRoot((root) => {
        const review = writeDeltaReview(root, {});
        setRevision(review, 'completion-decision.json', BASE);
        const { code, report } = validate(root);
        expect(code).toBe(2);
        expect(report.valid).toBe(false);
        expect(codes(report)).toContain('bundle-source-revision-disagreement');
      });
    });

    it('rejects a full-mode completion decision at a different revision', () => {
      withRoot((root) => {
        writeValidReview(root);
        setRevision(path.join(root, 'review'), 'completion-decision.json', 'other999');
        const { code, report } = validate(root);
        expect(code).toBe(2);
        expect(codes(report)).toContain('bundle-source-revision-disagreement');
      });
    });

    it('accepts a full scope without a sourceRevision', () => {
      withRoot((root) => {
        writeValidReview(root);
        writeJson(path.join(root, 'review'), 'review-scope.json', { mode: 'full' });
        const { code, report } = validate(root);
        expect(code).toBe(0);
        expect(report).toMatchObject({ status: 'pass', reviewMode: 'full' });
      });
    });

    it('still requires a sourceRevision in delta mode', () => {
      withRoot((root) => {
        writeDeltaReview(root, { sourceRevision: undefined });
        expect(codes(validate(root).report)).toContain('invalid-review-scope');
      });
    });

    it('refuses verified_complete in delta mode', () => {
      withRoot((root) => {
        writeDeltaReview(root, {}, 'verified_complete');
        const { code, report } = validate(root);
        expect(code).toBe(2);
        expect(codes(report)).toContain('delta-review-cannot-verify-complete');
        expect(report.issues.find((item) => item.code === 'delta-review-cannot-verify-complete')?.message).toContain('full review');
      });
    });

    it('rejects a malformed scope file', () => {
      withRoot((root) => {
        writeDeltaReview(root, '{not json');
        const { code, report } = validate(root);
        expect(code).toBe(2);
        expect(codes(report)).toContain('invalid-review-scope');
      });
    });

    it('rejects unknown modes, invalid dimension names and a missing sourceRevision', () => {
      withRoot((root) => {
        writeDeltaReview(root, { mode: 'partial' });
        expect(codes(validate(root).report)).toContain('invalid-review-scope');
      });
      withRoot((root) => {
        writeDeltaReview(root, { dimensions: ['intent-fidelity', 'not-a-dimension'] });
        expect(codes(validate(root).report)).toContain('invalid-review-scope');
      });
      withRoot((root) => {
        writeDeltaReview(root, { sourceRevision: '' });
        expect(codes(validate(root).report)).toContain('invalid-review-scope');
      });
    });

    it('rejects a delta scope without a baseRevision', () => {
      withRoot((root) => {
        writeDeltaReview(root, { baseRevision: undefined });
        const { code, report } = validate(root);
        expect(code).toBe(2);
        expect(codes(report)).toContain('delta-scope-missing-base');
      });
    });

    it('rejects a delta scope without dimensions', () => {
      withRoot((root) => {
        writeDeltaReview(root, { dimensions: [] });
        const { code, report } = validate(root);
        expect(code).toBe(2);
        expect(codes(report)).toContain('delta-scope-missing-dimensions');
      });
    });
  });
});
