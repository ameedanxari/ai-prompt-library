import { describe, expect, it } from 'vitest';
import { execFileSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';

const REPO_ROOT = path.resolve(__dirname, '..', '..');
const VALIDATOR = path.join(REPO_ROOT, 'scripts', 'validate-execution-status.sh');

function run(planDir: string): { code: number; out: string; report: any } {
  let code = 0;
  let out = '';
  try {
    out = execFileSync('/bin/bash', [VALIDATOR, planDir], { encoding: 'utf8' });
  } catch (error) {
    const failure = error as { status?: number; stdout?: Buffer; stderr?: Buffer };
    code = failure.status ?? 1;
    out = `${failure.stdout?.toString() ?? ''}${failure.stderr?.toString() ?? ''}`;
  }
  const reportPath = path.join(planDir, 'execution-status-report.json');
  return {
    code,
    out,
    report: fs.existsSync(reportPath) ? JSON.parse(fs.readFileSync(reportPath, 'utf8')) : null,
  };
}

function record(overrides: Record<string, unknown> = {}) {
  return {
    taskId: 'tasks-cleanup.md#T1',
    status: 'done',
    requiredEvidenceLevel: 'integration',
    testEvidence: [{
      id: 'integration-test',
      level: 'integration',
      outcome: 'pass',
      command: 'npm test -- cleanup',
      recordedAt: '2026-07-10T00:00:00Z',
    }],
    acceptance: [{ id: 'A1', met: true, evidenceIds: ['integration-test'] }],
    buildEvidence: {
      outcome: 'pass',
      command: 'npm run typecheck',
      recordedAt: '2026-07-10T00:01:00Z',
      current: true,
    },
    risks: ['integration', 'destructive-action'],
    ...overrides,
  };
}

function fixture(options: {
  envelopeBlocked?: string;
  journalStatus?: string;
  journalTestResult?: string;
  executionRecord?: Record<string, unknown>;
  contractEvidence?: string;
  title?: string;
  productionPassed?: boolean;
} = {}) {
  const planDir = fs.mkdtempSync(path.join(os.tmpdir(), 'execution-status-'));
  const executionRecord = options.executionRecord ?? record();
  const journalStatus = options.journalStatus ?? 'done';
  fs.writeFileSync(path.join(planDir, 'execution-log.md'), [
    '---',
    'session_id: 00000000-0000-0000-0000-000000000000',
    'next_task: null',
    `blocked_tasks: ${options.envelopeBlocked ?? '[]'}`,
    'failed_tasks: []',
    'deferred_tasks: []',
    '---',
    '',
    '# Execution Log',
    '',
    `### \`tasks-cleanup.md\` — ${journalStatus}`,
    `- **Test result:** ${options.journalTestResult ?? 'pass'}`,
    '- **Acceptance verified:**',
    '  - ✅ cleanup behavior is verified',
    '- **Status:** ' + journalStatus,
    '',
    '```execution-status-record',
    JSON.stringify(executionRecord, null, 2),
    '```',
    '',
  ].join('\n'), 'utf8');
  fs.writeFileSync(path.join(planDir, 'task-contract.json'), JSON.stringify({
    units: [{
      canonicalId: 'tasks-cleanup.md#T1',
      title: options.title ?? 'integrated cleanup',
      preciseChange: 'delete selected data through the production integration path',
      artifactKind: 'runtime-source',
      evidenceLevel: options.contractEvidence ?? 'integration',
    }],
  }), 'utf8');
  fs.writeFileSync(path.join(planDir, 'task-graph.json'), JSON.stringify({
    nodes: [{ id: 'tasks-cleanup.md', dependencies: [] }],
  }), 'utf8');
  fs.writeFileSync(path.join(planDir, 'envelope-report.md'), [
    '---',
    `  production_verification: ${options.productionPassed === false ? 'fail' : 'pass'}`,
    'release_ready: false',
    '---',
  ].join('\n'), 'utf8');
  return planDir;
}

describe('validate-execution-status.sh', () => {
  it('is executable', () => {
    expect(fs.existsSync(VALIDATOR)).toBe(true);
    expect((fs.statSync(VALIDATOR).mode & 0o111) !== 0).toBe(true);
  });

  it('passes a consistent canonical execution handoff', () => {
    const planDir = fixture();
    try {
      const result = run(planDir);
      expect(result.code).toBe(0);
      expect(result.report).toMatchObject({ valid: true, terminal_state: 'verified_production' });
    } finally {
      fs.rmSync(planDir, { recursive: true, force: true });
    }
  });

  it('rejects a done journal entry with a failing test result', () => {
    const planDir = fixture({ journalTestResult: 'fail' });
    try {
      const result = run(planDir);
      expect(result.code).toBe(1);
      expect(result.report.issues).toContainEqual(expect.objectContaining({
        code: 'journal-done-with-failing-test',
      }));
    } finally {
      fs.rmSync(planDir, { recursive: true, force: true });
    }
  });

  it('rejects a blocked journal and record missing from the envelope', () => {
    const planDir = fixture({
      journalStatus: 'blocked',
      executionRecord: record({ status: 'blocked', reason: 'external approval pending' }),
    });
    try {
      const result = run(planDir);
      expect(result.code).toBe(1);
      expect(result.report.terminal_state).toBe('blocked');
      expect(result.report.issues.map((issue: { code: string }) => issue.code)).toEqual(
        expect.arrayContaining([
          'journal-envelope-status-disagreement',
          'record-envelope-status-disagreement',
        ]),
      );
    } finally {
      fs.rmSync(planDir, { recursive: true, force: true });
    }
  });

  it('accepts an honestly represented blocked handoff without implying completion', () => {
    const planDir = fixture({
      envelopeBlocked: '[tasks-cleanup.md#T1]',
      journalStatus: 'blocked',
      executionRecord: record({ status: 'blocked', reason: 'external approval pending' }),
    });
    try {
      const result = run(planDir);
      expect(result.code).toBe(0);
      expect(result.report).toMatchObject({ valid: true, terminal_state: 'blocked' });
    } finally {
      fs.rmSync(planDir, { recursive: true, force: true });
    }
  });

  it('rejects static-only closure of integration and deletion work', () => {
    const planDir = fixture({
      title: 'safe deletion integration',
      executionRecord: record({
        testEvidence: [{
          id: 'static-check',
          level: 'static',
          outcome: 'pass',
          command: 'rg delete src',
          recordedAt: '2026-07-10T00:00:00Z',
        }],
      }),
    });
    try {
      const result = run(planDir);
      expect(result.code).toBe(1);
      expect(result.report.issues.map((issue: { code: string }) => issue.code)).toEqual(
        expect.arrayContaining([
          'missing-required-evidence',
          'static-only-behavioral-closure',
        ]),
      );
    } finally {
      fs.rmSync(planDir, { recursive: true, force: true });
    }
  });

  it('rejects completion reports that claim production without production evidence', () => {
    const planDir = fixture({ productionPassed: false });
    try {
      fs.writeFileSync(path.join(planDir, 'completion-report.json'), JSON.stringify({
        state: 'verified_production',
      }), 'utf8');
      const result = run(planDir);
      expect(result.code).toBe(1);
      expect(result.report.issues).toContainEqual(expect.objectContaining({
        code: 'completion-production-disagreement',
      }));
    } finally {
      fs.rmSync(planDir, { recursive: true, force: true });
    }
  });

  it('consumes release readiness reports before accepting a release-ready completion claim', () => {
    const planDir = fixture();
    try {
      fs.writeFileSync(path.join(planDir, 'completion-report.json'), JSON.stringify({
        state: 'release_ready',
      }), 'utf8');
      fs.writeFileSync(path.join(planDir, 'release-readiness-report.json'), JSON.stringify({
        release_ready: false,
        blocking_gate_ids: ['GATE-PRIVACY-001'],
      }), 'utf8');

      const result = run(planDir);

      expect(result.code).toBe(1);
      expect(result.report.release_gate_passed).toBe(false);
      expect(result.report.issues).toContainEqual(expect.objectContaining({
        code: 'completion-release-disagreement',
      }));
    } finally {
      fs.rmSync(planDir, { recursive: true, force: true });
    }
  });
});
