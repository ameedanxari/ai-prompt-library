import { afterEach, describe, expect, it } from 'vitest';
import { execFileSync, spawnSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { writeStreamAStubs } from '../test-helpers/stream-a-stubs.js';

const validator = path.resolve(__dirname, '../../scripts/validate-instantiation.sh');
const python = execFileSync('/bin/sh', ['-c', 'command -v python3'], { encoding: 'utf8' }).trim();
const sandboxes: string[] = [];
afterEach(() => {
  for (const dir of sandboxes.splice(0)) fs.rmSync(dir, { recursive: true, force: true });
});

function task(id: number, requirement: string): string {
  return [
    `## T${id} · Requirement implementation`,
    '- **Closes user story:** As a developer, I want explicit requirements, so that all obligations remain covered.',
    `- **Requirement IDs:** ${requirement}`,
    '- **Feature IDs:** FEAT-SHARED',
    '- **Flow IDs:** FLOW-SHARED',
    '- **Change type:** create-new',
    `- **File:** \`src/requirement-${id}.ts\``,
    '- **Precise change:** Add the declared requirement handler.',
    '- **Acceptance:**',
    '  - The declared requirement has a handler.',
    '  - The handler returns the expected value.',
    '  - Invalid values yield a validation error.',
    `- **Test:** \`tests/requirement-${id}.test.ts\``,
    '- **Estimated LOC:** +10',
    '- **Depends on:** none',
    '- **Phase:** mvp',
    '',
  ].join('\n');
}

function fixture(requirements = ['REQ-A', 'REQ-B']): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'instantiation-traceability-'));
  sandboxes.push(dir);
  fs.writeFileSync(path.join(dir, 'features-shared.md'), [
    '## shared',
    '- **Feature ID:** FEAT-SHARED',
    '- **Requirement IDs:** REQ-A, REQ-B',
    '- **Flow IDs:** FLOW-SHARED',
    '- **Critical:** true',
    '',
  ].join('\n'));
  fs.writeFileSync(path.join(dir, 'tasks-shared.md'), requirements.map((id, i) => task(i + 1, id)).join('\n'));
  fs.writeFileSync(path.join(dir, 'external-accounts.md'), '# External accounts\n');
  writeStreamAStubs(dir);
  return dir;
}

function run(dir: string, pathOverride?: string): { code: number | null; out: string } {
  const result = spawnSync('/bin/bash', [validator, dir], {
    encoding: 'utf8',
    env: { ...process.env, VALIDATOR_SKIP_GATE_CHECK: '1', ...(pathOverride ? { PATH: pathOverride } : {}) },
  });
  return { code: result.status, out: result.stdout + result.stderr };
}

function shim(dir: string, check: 'semantic' | 'dag', behavior: string): string {
  const bin = path.join(dir, 'bin');
  fs.mkdirSync(bin);
  const selector = check === 'semantic'
    ? '[ "$1" = - ] && [ "$#" -eq 2 ]'
    : '[ "$1" = -c ] && [[ "$2" == *"Kahn\'s algorithm"* ]]';
  fs.writeFileSync(path.join(bin, 'python3'), [
    '#!/bin/bash',
    `if ${selector}; then`,
    behavior,
    'fi',
    `exec '${python.replace(/'/g, "'\\''")}' "$@"`,
    '',
  ].join('\n'), { mode: 0o755 });
  return `${bin}${path.delimiter}${process.env.PATH}`;
}

describe('instantiation exact requirement coverage', () => {
  it('accepts separate tasks whose explicit requirement links cover the feature in union', () => {
    const result = run(fixture());
    expect(result.out).toContain('all engine outputs are fully instantiated');
    expect(result.code).toBe(0);
  });

  it('accepts one task explicitly covering both requirements', () => {
    expect(run(fixture(['REQ-A, REQ-B'])).code).toBe(0);
  });

  it('rejects a missing requirement even when feature and flow metadata overlap', () => {
    const result = run(fixture(['REQ-A']));
    expect(result.code).toBe(1);
    expect(result.out).toContain('missing-requirement-task-coverage: REQ-B');
    expect(result.out).not.toContain('missing-requirement-task-coverage: REQ-A');
  });

  for (const checker of ['semantic', 'dag'] as const) {
    it(`fails closed when the ${checker} checker crashes`, () => {
      const dir = fixture();
      const result = run(dir, shim(dir, checker, "printf 'ok\\n'\nexit 23"));
      expect(result.code).toBe(1);
      expect(result.out).toContain(checker === 'semantic'
        ? 'semantic-loss: checker-failed:' : 'DAG cycle check: checker-failed:');
      expect(result.out).toContain('error:23');
      expect(result.out).not.toContain('tooling-unavailable');
      expect(result.out).not.toContain('check skipped');
    });

    it(`fails closed when the ${checker} checker returns malformed output`, () => {
      const dir = fixture();
      const result = run(dir, shim(dir, checker, "printf 'unexpected-checker-output\\n'\nexit 0"));
      expect(result.code).toBe(1);
      expect(result.out).toContain(checker === 'semantic'
        ? 'semantic-loss: checker-failed:' : 'DAG cycle check: checker-failed:');
    });
  }

  it('distinguishes a missing interpreter from a checker crash and blocks validation', () => {
    const dir = fixture();
    const bin = path.join(dir, 'bin');
    fs.mkdirSync(bin);
    // Supply normal system tools, deliberately excluding the Python interpreter.
    for (const source of ['/usr/bin', '/bin']) {
      for (const name of fs.readdirSync(source)) {
        if (name === 'python3' || fs.existsSync(path.join(bin, name))) continue;
        fs.symlinkSync(path.join(source, name), path.join(bin, name));
      }
    }
    const result = run(dir, bin);
    expect(result.code).toBe(1);
    expect(result.out).toContain('semantic-loss: tooling-unavailable: python3');
    expect(result.out).toContain('DAG cycle check: tooling-unavailable: python3');
    expect(result.out).not.toContain('checker-failed');
  });

  it('blocks invalid UTF-8 instead of reporting an unavailable interpreter', () => {
    const dir = fixture();
    fs.appendFileSync(path.join(dir, 'tasks-shared.md'), Buffer.from([0xff]));
    const result = run(dir);
    expect(result.code).toBe(1);
    expect(result.out).toContain('semantic-loss: checker-failed:');
    expect(result.out).toContain('DAG cycle check: checker-failed:');
    expect(result.out).not.toContain('tooling-unavailable');
  });

  it('still identifies actual dependency cycles', () => {
    const dir = fixture();
    const file = path.join(dir, 'tasks-shared.md');
    fs.writeFileSync(file, fs.readFileSync(file, 'utf8').replace('- **Depends on:** none', '- **Depends on:** tasks-shared.md (requires the shared handler)'));
    const result = run(dir);
    expect(result.code).toBe(1);
    expect(result.out).toContain('dependency cycle detected in Depends-on graph');
  });
});
