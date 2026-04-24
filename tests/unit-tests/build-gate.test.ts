/**
 * build-gate.sh — after-each-task whole-project compile check. Detects
 * Android, iOS, Node/TypeScript, Python, Go stacks and runs the
 * cheapest compile-only command per stack.
 */

import { describe, it, expect } from 'vitest';
import { execSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';

const REPO_ROOT = path.resolve(__dirname, '..', '..');
const SCRIPT = path.join(REPO_ROOT, 'scripts', 'build-gate.sh');

const run = (dir: string): { out: string; code: number } => {
  let out = '';
  let code = 0;
  try {
    out = execSync(`bash "${SCRIPT}" "${dir}"`, { encoding: 'utf8' });
  } catch (e) {
    const err = e as { stdout?: Buffer; stderr?: Buffer; status?: number };
    out = (err.stdout?.toString() ?? '') + (err.stderr?.toString() ?? '');
    code = err.status ?? 0;
  }
  return { out, code };
};

describe('build-gate.sh', () => {
  it('is executable', () => {
    expect(fs.existsSync(SCRIPT)).toBe(true);
    expect((fs.statSync(SCRIPT).mode & 0o111) !== 0).toBe(true);
  });

  it('exits 2 when no buildable stack is detected', () => {
    const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), 'build-gate-empty-'));
    try {
      const { out, code } = run(sandbox);
      expect(code).toBe(2);
      expect(out).toMatch(/no buildable stack detected/);
    } finally {
      fs.rmSync(sandbox, { recursive: true, force: true });
    }
  });

  it('runs the declared typecheck script when package.json has one', () => {
    const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), 'build-gate-typecheck-'));
    try {
      fs.writeFileSync(
        path.join(sandbox, 'package.json'),
        JSON.stringify(
          {
            name: 'sandbox',
            version: '0.0.0',
            scripts: { typecheck: 'node -e "process.exit(0)"' },
          },
          null,
          2,
        ),
      );
      const { out, code } = run(sandbox);
      expect(code).toBe(0);
      expect(out).toMatch(/npm run typecheck/);
      expect(out).toMatch(/build-gate: pass/);
    } finally {
      fs.rmSync(sandbox, { recursive: true, force: true });
    }
  });

  it('fails when the declared typecheck script fails', () => {
    const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), 'build-gate-fail-'));
    try {
      fs.writeFileSync(
        path.join(sandbox, 'package.json'),
        JSON.stringify(
          {
            name: 'sandbox',
            version: '0.0.0',
            scripts: { typecheck: 'node -e "process.exit(1)"' },
          },
          null,
          2,
        ),
      );
      const { out, code } = run(sandbox);
      expect(code).toBe(1);
      expect(out).toMatch(/build-gate: fail/);
      expect(out).toMatch(/npm run typecheck exited 1/);
    } finally {
      fs.rmSync(sandbox, { recursive: true, force: true });
    }
  });

  it('falls back to npm run build when no typecheck is declared', () => {
    const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), 'build-gate-build-'));
    try {
      fs.writeFileSync(
        path.join(sandbox, 'package.json'),
        JSON.stringify(
          {
            name: 'sandbox',
            version: '0.0.0',
            scripts: { build: 'node -e "process.exit(0)"' },
          },
          null,
          2,
        ),
      );
      const { out, code } = run(sandbox);
      expect(code).toBe(0);
      expect(out).toMatch(/npm run build/);
    } finally {
      fs.rmSync(sandbox, { recursive: true, force: true });
    }
  });

  it('skips the Node check gracefully when package.json has no build or typecheck and no tsconfig', () => {
    const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), 'build-gate-plain-js-'));
    try {
      fs.writeFileSync(
        path.join(sandbox, 'package.json'),
        JSON.stringify({ name: 'sandbox', version: '0.0.0' }, null, 2),
      );
      const { code } = run(sandbox);
      // No buildable stack means exit 2, not a false-positive pass.
      expect(code).toBe(2);
    } finally {
      fs.rmSync(sandbox, { recursive: true, force: true });
    }
  });

  it('passes the library own repo (dogfood)', () => {
    const { code } = run(REPO_ROOT);
    expect(code).toBe(0);
  });
});
