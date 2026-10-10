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
  executionRecords?: Record<string, unknown>[];
  contractEvidence?: string;
  title?: string;
  productionPassed?: boolean;
} = {}) {
  const planDir = fs.mkdtempSync(path.join(os.tmpdir(), 'execution-status-'));
  const executionRecords = options.executionRecords ?? [options.executionRecord ?? record()];
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
    ...executionRecords.flatMap((entry) => [
      '```execution-status-record',
      JSON.stringify(entry, null, 2),
      '```',
      '',
    ]),
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

  describe('follow-up records', () => {
    const codes = (result: { report: any }) =>
      result.report.issues.map((issue: { code: string }) => issue.code);

    it('judges a valid follow-up chain by the last record', () => {
      const planDir = fixture({
        executionRecords: [
          record(),
          record({ followUp: true, buildEvidence: { outcome: 'pass', command: 'npm run typecheck', recordedAt: '2026-08-01T00:00:00Z', current: true } }),
        ],
      });
      try {
        const result = run(planDir);
        expect(result.code).toBe(0);
        expect(result.report).toMatchObject({ valid: true, record_count: 1, follow_up_chain_count: 1 });
      } finally {
        fs.rmSync(planDir, { recursive: true, force: true });
      }
    });

    it('does not validate history: a stale first record is ignored once a follow-up is current', () => {
      const staleFirst = record({
        buildEvidence: { outcome: 'pass', command: 'npm run typecheck', recordedAt: '2026-07-10T00:01:00Z', current: false },
      });
      const planDir = fixture({ executionRecords: [staleFirst, record({ followUp: true })] });
      try {
        const result = run(planDir);
        expect(result.code).toBe(0);
        expect(codes(result)).not.toContain('stale-or-failing-build');
      } finally {
        fs.rmSync(planDir, { recursive: true, force: true });
      }
    });

    it('treats a stale last record as authoritative', () => {
      const planDir = fixture({
        executionRecords: [
          record(),
          record({
            followUp: true,
            buildEvidence: { outcome: 'pass', command: 'npm run typecheck', recordedAt: '2026-08-01T00:00:00Z', current: false },
          }),
        ],
      });
      try {
        const result = run(planDir);
        expect(result.code).toBe(1);
        expect(codes(result)).toContain('stale-or-failing-build');
      } finally {
        fs.rmSync(planDir, { recursive: true, force: true });
      }
    });

    it('still rejects a duplicate record that lacks followUp', () => {
      const planDir = fixture({ executionRecords: [record(), record()] });
      try {
        const result = run(planDir);
        expect(result.code).toBe(1);
        expect(codes(result)).toContain('duplicate-canonical-record');
      } finally {
        fs.rmSync(planDir, { recursive: true, force: true });
      }
    });

    it('rejects a duplicate whose followUp flag is not literally true', () => {
      const planDir = fixture({ executionRecords: [record(), record({ followUp: 'yes' })] });
      try {
        const result = run(planDir);
        expect(result.code).toBe(1);
        expect(codes(result)).toContain('duplicate-canonical-record');
      } finally {
        fs.rmSync(planDir, { recursive: true, force: true });
      }
    });

    it('rejects an orphan follow-up record with no earlier record', () => {
      const planDir = fixture({ executionRecords: [record({ followUp: true })] });
      try {
        const result = run(planDir);
        expect(result.code).toBe(1);
        expect(codes(result)).toContain('orphan-follow-up-record');
      } finally {
        fs.rmSync(planDir, { recursive: true, force: true });
      }
    });

    it('judges a blocked-then-done chain by the done follow-up', () => {
      const planDir = fixture({
        // Envelope no longer lists the unit as blocked, which would be inconsistent for the first record.
        executionRecords: [
          record({ status: 'blocked', reason: 'external approval pending' }),
          record({ followUp: true }),
        ],
      });
      try {
        const result = run(planDir);
        expect(result.code).toBe(0);
        expect(result.report).toMatchObject({ valid: true, terminal_state: 'verified_production' });
      } finally {
        fs.rmSync(planDir, { recursive: true, force: true });
      }
    });

    it('judges a done-then-blocked chain by the blocked follow-up envelope check', () => {
      const planDir = fixture({
        journalStatus: 'blocked',
        executionRecords: [record(), record({ followUp: true, status: 'blocked', reason: 'regressed' })],
      });
      try {
        const result = run(planDir);
        expect(result.code).toBe(1);
        expect(codes(result)).toContain('record-envelope-status-disagreement');
      } finally {
        fs.rmSync(planDir, { recursive: true, force: true });
      }
    });
  });

  describe('file-bound build evidence shape', () => {
    const build = (extra: Record<string, unknown>) => ({
      outcome: 'pass',
      command: 'npm run typecheck',
      recordedAt: '2026-07-10T00:01:00Z',
      current: true,
      ...extra,
    });
    const digest = `sha256:${'a'.repeat(64)}`;

    it('accepts coveredPaths with a well-formed pathsDigest', () => {
      const planDir = fixture({
        executionRecord: record({ buildEvidence: build({ coveredPaths: ['src/a.ts'], pathsDigest: digest }) }),
      });
      try {
        expect(run(planDir).code).toBe(0);
      } finally {
        fs.rmSync(planDir, { recursive: true, force: true });
      }
    });

    it.each([
      ['coveredPaths without pathsDigest', { coveredPaths: ['src/a.ts'] }],
      ['pathsDigest without coveredPaths', { pathsDigest: digest }],
      ['empty coveredPaths', { coveredPaths: [], pathsDigest: digest }],
      ['non-string coveredPaths', { coveredPaths: [1], pathsDigest: digest }],
      ['bad digest format', { coveredPaths: ['src/a.ts'], pathsDigest: 'sha1:abc' }],
    ])('rejects %s', (_label, extra) => {
      const planDir = fixture({ executionRecord: record({ buildEvidence: build(extra) }) });
      try {
        const result = run(planDir);
        expect(result.code).toBe(1);
        expect(result.report.issues).toContainEqual(expect.objectContaining({ code: 'malformed-evidence-binding' }));
      } finally {
        fs.rmSync(planDir, { recursive: true, force: true });
      }
    });
  });
});
