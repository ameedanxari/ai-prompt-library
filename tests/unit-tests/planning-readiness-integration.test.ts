import { afterEach, describe, expect, it } from 'vitest';
import { spawnSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { writeStreamAStubs } from '../test-helpers/stream-a-stubs.js';
import { sha256 } from '../../src/delivery/manifest.js';

const roots: string[] = [];
const ready = path.resolve(__dirname, '../../scripts/validate-ready-to-execute.sh');
afterEach(() => roots.splice(0).forEach(root => fs.rmSync(root, { recursive: true, force: true })));
function fixture() {
  const root = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'planning-ready-'))); roots.push(root);
  const write = (name: string, content: string) => { fs.writeFileSync(path.join(root, name), content); return { path: name, sha256: sha256(content) }; };
  write('features-alpha.md', '# Features - alpha\n\n## alpha\nx\n');
  write('tasks-alpha.md', [
    '## T1 - alpha',
    '- **Closes user story:** As a user, I want alpha, so that I can use it.',
    '- **Change type:** create-new', '- **File:** `src/alpha.ts`', '- **Depends on:** none',
    '- **Precise change:** add alpha implementation.', '- **Acceptance:**',
    '  - First behavior is present.', '  - Second behavior is present.', '  - Third behavior is present.',
    '- **Test:** `npm test -- alpha`', '- **Estimated LOC:** ~10', '- **Phase:** mvp', '',
  ].join('\n'));
  write('external-accounts.md', '# External Accounts Required\n'); writeStreamAStubs(root);
  const brief = write('brief.md', 'The alpha workflow must preserve request deletion.');
  const audit = write('audit.md', 'P1: deletion recovery is missing and must be verified.');
  const register = { schemaVersion: 1, reviewedInputs: [brief], findings: [] as any[], ownerDecisions: [] };
  const save = () => write('review-findings.json', JSON.stringify(register));
  const run = () => {
    const result = spawnSync('bash', [ready, root], { encoding: 'utf8' });
    const report = fs.readFileSync(path.join(root, 'ready-to-execute-report.md'), 'utf8');
    return { code: result.status, out: result.stdout + result.stderr, report };
  };
  save(); return { root, write, brief, audit, register, save, run };
}

describe('actual legacy readiness wrapper honors independent findings', () => {
  it('starts from a passing plan and blocks an open P1 with its exact diagnostic', () => {
    const f = fixture();
    expect(f.run()).toMatchObject({ code: 0, report: expect.stringContaining('ready_to_execute: true') });
    f.register.findings.push({ id: 'F1', source: f.audit, severity: 'P1', status: 'open', targets: ['*'], blocks: ['execute'] }); f.save();
    const blocked = f.run();
    expect(blocked.code).toBe(1);
    expect(blocked.report).toContain('REVIEW_FINDING_OPEN');
    expect(blocked.report).toContain('F1 blocks execute for *');
    expect(blocked.report).toContain('ready_to_execute: false');
    expect(blocked.report).toContain('resolve_planning_blockers_then_rerun_ready_gate');
  }, 30000);

  it('fails malformed register, requires closure evidence, then accepts verified closure', () => {
    const f = fixture(); expect(f.run().code).toBe(0);
    f.write('review-findings.json', '{');
    const malformed = f.run();
    expect(malformed.code).toBe(1); expect(malformed.report).toContain('REVIEW_REGISTER_INVALID');
    expect(fs.readFileSync(path.join(f.root, 'review-findings.json'), 'utf8')).toBe('{');
    f.register.findings.push({ id: 'F1', source: f.audit, severity: 'P1', status: 'resolved', targets: ['*'], blocks: ['execute'] }); f.save();
    expect(f.run()).toMatchObject({ code: 1, report: expect.stringContaining('REVIEW_REGISTER_INVALID') });
    f.register.findings[0].closure = f.write('closure.md', 'Deletion recovery implemented and independently verified against this brief.'); f.save();
    const closed = f.run(); expect(closed.code).toBe(0); expect(closed.report).toContain('ready_to_execute: true');
    expect(closed.report).not.toContain('REVIEW_REGISTER_INVALID'); expect(closed.report).not.toContain('REVIEW_FINDING_OPEN');
    f.write('closure.md', 'Changed closure bytes without updating the approved binding.');
    expect(f.run()).toMatchObject({ code: 1, report: expect.stringContaining('REVIEW_REGISTER_INVALID') });
  }, 60000);
});
