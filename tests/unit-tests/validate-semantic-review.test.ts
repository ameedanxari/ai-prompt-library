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
});
