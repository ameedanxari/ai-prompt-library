import { describe, expect, it } from 'vitest';
import { execSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';

const REPO_ROOT = path.resolve(__dirname, '..', '..');
const REPAIR = path.join(REPO_ROOT, 'scripts', 'repair-task-schema-fields.sh');

function runRepair(dir: string): string {
  return execSync(`bash "${REPAIR}" "${dir}"`, { encoding: 'utf8' });
}

function withSandbox(run: (sandbox: string) => void) {
  const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), 'schema-repair-'));
  try {
    run(sandbox);
  } finally {
    fs.rmSync(sandbox, { recursive: true, force: true });
  }
}

describe('repair-task-schema-fields.sh', () => {
  it('normalizes explicit field aliases and mechanical value shorthands', () => withSandbox((sandbox) => {
    const task = path.join(sandbox, 'tasks-alpha.md');
    fs.writeFileSync(
      task,
      [
        '# Tasks - Alpha',
        '',
        '## T1 - alpha',
        'User story: As a user, I want alpha, so that beta.',
        '- **Change:** create',
        'Target file: `src/alpha.ts`',
        'Implementation: add alpha().',
        'Acceptance criteria:',
        '- Alpha renders.',
        '- Beta persists.',
        '- Gamma logs.',
        'Dependencies: no dependencies',
        'Test command: npm test -- alpha',
        'LOC: 10',
        'Delivery phase: MVP',
        '',
      ].join('\n'),
    );

    const out = runRepair(sandbox);
    const repaired = fs.readFileSync(task, 'utf8');

    expect(out).toMatch(/modified 1/);
    expect(repaired).toContain('- **Closes user story:** As a user, I want alpha, so that beta.');
    expect(repaired).toContain('- **Change type:** create-new');
    expect(repaired).toContain('- **File:** `src/alpha.ts`');
    expect(repaired).toContain('- **Precise change:** add alpha().');
    expect(repaired).toContain('- **Acceptance:**');
    expect(repaired).toContain('  - Alpha renders.');
    expect(repaired).toContain('- **Depends on:** none');
    expect(repaired).toContain('- **Test:** npm test -- alpha');
    expect(repaired).toContain('- **Estimated LOC:** ~10');
    expect(repaired).toContain('- **Phase:** mvp');
  }));

  it('is idempotent after the first repair pass', () => withSandbox((sandbox) => {
    const task = path.join(sandbox, 'tasks-beta.md');
    fs.writeFileSync(
      task,
      [
        '## T1 - beta',
        '- **Change:** update',
        '- **File:** `src/beta.ts`',
        '- **Acceptance criteria:**',
        '- Beta updates.',
        '',
      ].join('\n'),
    );

    runRepair(sandbox);
    const once = fs.readFileSync(task, 'utf8');
    runRepair(sandbox);
    const twice = fs.readFileSync(task, 'utf8');

    expect(twice).toBe(once);
    expect(twice).toContain('- **Change type:** modify-existing');
    expect(twice).toContain('  - Beta updates.');
  }));

  it('does not synthesize missing fields from vague prose', () => withSandbox((sandbox) => {
    const task = path.join(sandbox, 'tasks-gamma.md');
    const original = [
      '## T1 - gamma',
      'Implement the gamma workflow somewhere in the app.',
      'Make sure it is tested.',
      '',
    ].join('\n');
    fs.writeFileSync(task, original);

    runRepair(sandbox);

    expect(fs.readFileSync(task, 'utf8')).toBe(original);
    expect(fs.readFileSync(path.join(sandbox, 'task-schema-repair-report.md'), 'utf8'))
      .toMatch(/No mechanical schema repairs were needed/);
  }));

  it('ignores fenced code blocks and non-plan markdown files', () => withSandbox((sandbox) => {
    const task = path.join(sandbox, 'tasks-delta.md');
    fs.writeFileSync(
      task,
      [
        '```markdown',
        '- **Change:** create',
        'Target file: `src/inside-code.ts`',
        '```',
        '',
        '- **Change:** create',
        '',
      ].join('\n'),
    );
    fs.writeFileSync(
      path.join(sandbox, 'notes.md'),
      '- **Change:** create\n',
    );

    runRepair(sandbox);

    const repaired = fs.readFileSync(task, 'utf8');
    expect(repaired).toContain('- **Change:** create\nTarget file: `src/inside-code.ts`');
    expect(repaired).toContain('- **Change type:** create-new');
    expect(fs.readFileSync(path.join(sandbox, 'notes.md'), 'utf8')).toBe('- **Change:** create\n');
  }));
});
