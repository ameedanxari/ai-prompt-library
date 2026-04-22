/**
 * Unit tests for scripts/fix-user-stories.sh.
 *
 * The helper adds the missing comma before "so that" in canonical
 * "Closes user story" lines. It is a mechanical, idempotent fix and
 * must not touch other line shapes.
 */

import { describe, it, expect } from 'vitest';
import { execSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';

const REPO_ROOT = path.resolve(__dirname, '..', '..');
const FIXER = path.join(REPO_ROOT, 'scripts', 'fix-user-stories.sh');

function runFixer(dir: string): string {
  return execSync(`bash "${FIXER}" "${dir}"`, { encoding: 'utf8' });
}

describe('fix-user-stories.sh', () => {
  it('inserts the missing comma before "so that" in canonical user-story lines', () => {
    const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), 'fix-us-'));
    try {
      const task = path.join(sandbox, 'tasks-x.md');
      fs.writeFileSync(
        task,
        [
          '# Tasks — X',
          '',
          '## T1 · example',
          '- **Closes user story:** As a user, I want to cancel so that I can stop the sync.',
          '- **Change type:** create-new',
          '- **File:** `src/cancel.ts`',
          '- **Precise change:** add cancel().',
          '- **Acceptance:**',
          '  - A present.',
          '  - B present.',
          '  - C present.',
          '- **Test:** `src/cancel.test.ts`',
          '',
        ].join('\n'),
      );
      runFixer(sandbox);
      const out = fs.readFileSync(task, 'utf8');
      expect(out).toMatch(
        /- \*\*Closes user story:\*\* As a user, I want to cancel, so that I can stop the sync\./,
      );
    } finally {
      fs.rmSync(sandbox, { recursive: true, force: true });
    }
  });

  it('is idempotent — running twice on a fixed file is a no-op', () => {
    const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), 'fix-us-idem-'));
    try {
      const task = path.join(sandbox, 'tasks-y.md');
      const original = [
        '# Tasks — Y',
        '',
        '## T1 · example',
        '- **Closes user story:** As a user, I want X so that Y.',
        '- **Change type:** create-new',
        '- **File:** `src/y.ts`',
        '- **Precise change:** add.',
        '- **Acceptance:**',
        '  - A present.',
        '  - B present.',
        '  - C present.',
        '- **Test:** `src/y.test.ts`',
        '',
      ].join('\n');
      fs.writeFileSync(task, original);
      runFixer(sandbox);
      const after1 = fs.readFileSync(task, 'utf8');
      runFixer(sandbox);
      const after2 = fs.readFileSync(task, 'utf8');
      expect(after1).toEqual(after2);
      expect(after1).toMatch(/I want X, so that Y/);
    } finally {
      fs.rmSync(sandbox, { recursive: true, force: true });
    }
  });

  it('leaves already-canonical lines alone', () => {
    const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), 'fix-us-noop-'));
    try {
      const task = path.join(sandbox, 'tasks-z.md');
      const canonical = [
        '# Tasks — Z',
        '',
        '## T1 · example',
        '- **Closes user story:** As the app, I need keystore storage, so that credentials are safe at rest.',
        '- **Change type:** create-new',
        '- **File:** `src/z.ts`',
        '- **Precise change:** add.',
        '- **Acceptance:**',
        '  - A present.',
        '  - B present.',
        '  - C present.',
        '- **Test:** `src/z.test.ts`',
        '',
      ].join('\n');
      fs.writeFileSync(task, canonical);
      runFixer(sandbox);
      expect(fs.readFileSync(task, 'utf8')).toEqual(canonical);
    } finally {
      fs.rmSync(sandbox, { recursive: true, force: true });
    }
  });

  it('does not touch non-Closes-user-story lines even if they contain "so that"', () => {
    const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), 'fix-us-unrelated-'));
    try {
      const task = path.join(sandbox, 'tasks-w.md');
      const original = [
        '# Tasks — W',
        '',
        '## T1 · example',
        '- **Closes user story:** As a user, I want w, so that y.',
        '- **Change type:** create-new',
        '- **File:** `src/w.ts`',
        '- **Precise change:** wire the cache so that cold starts stay under 500ms.',
        '- **Acceptance:**',
        '  - A present.',
        '  - B present.',
        '  - C present.',
        '- **Test:** `src/w.test.ts`',
        '',
      ].join('\n');
      fs.writeFileSync(task, original);
      runFixer(sandbox);
      expect(fs.readFileSync(task, 'utf8')).toEqual(original);
    } finally {
      fs.rmSync(sandbox, { recursive: true, force: true });
    }
  });

  it('reports a summary with scanned / modified / fixed counts', () => {
    const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), 'fix-us-summary-'));
    try {
      fs.writeFileSync(
        path.join(sandbox, 'tasks-a.md'),
        '## T1 · x\n- **Closes user story:** As a user, I want a so that b.\n',
      );
      fs.writeFileSync(
        path.join(sandbox, 'tasks-b.md'),
        '## T1 · y\n- **Closes user story:** As a user, I want a, so that b.\n',
      );
      const out = runFixer(sandbox);
      expect(out).toMatch(/scanned 2 files, modified 1, fixed 1 line/);
    } finally {
      fs.rmSync(sandbox, { recursive: true, force: true });
    }
  });
});
