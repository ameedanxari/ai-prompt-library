import { describe, expect, it } from 'vitest';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { execSync } from 'node:child_process';

const REPO_ROOT = path.resolve(__dirname, '..', '..');
const VALIDATOR = path.join(REPO_ROOT, 'scripts', 'validate-user-review-checkpoints.sh');

function runValidator(targetDir: string): { code: number; out: string } {
  try {
    return {
      code: 0,
      out: execSync(`bash "${VALIDATOR}" "${targetDir}"`, { encoding: 'utf8' }),
    };
  } catch (error) {
    const err = error as { status?: number; stdout?: Buffer };
    return {
      code: err.status ?? 1,
      out: err.stdout?.toString() ?? '',
    };
  }
}

function withSandbox(run: (sandbox: string) => void) {
  const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), 'review-checkpoints-'));
  try {
    run(sandbox);
  } finally {
    fs.rmSync(sandbox, { recursive: true, force: true });
  }
}

function writeReviewTask(dir: string, extras: string[] = []) {
  fs.writeFileSync(
    path.join(dir, 'tasks-design-system.md'),
    [
      '# Tasks — Design System',
      '',
      '## T1 · design-system review artifact',
      '- **Closes user story:** As a product owner, I want a design-system review artifact, so that I can approve the visual foundation.',
      '- **Change type:** create-new',
      '- **File:** `docs/design-system/review/index.html`',
      '- **Precise change:** create the static HTML design-system review artifact.',
      '- **Acceptance:**',
      '  - Reference Evidence: REF-001 from `ui-reference-source-map.md` includes Mobbin/Figma/product/platform reference URLs or file paths and URL / Path / Availability notes.',
      '  - Executor review checkpoint: present `docs/design-system/review/index.html`, the reference URLs and paths, and ask the user for visual-review feedback before dependent screen-level work.',
      '- **Test:** `test -f docs/design-system/review/index.html`',
      '- **Depends on:** none',
      '- **Estimated LOC:** +180',
      '- **Phase:** foundation',
      '',
      ...extras,
      '',
    ].join('\n'),
  );
}

function writeScreenTask(dir: string, dependsOn: string) {
  fs.writeFileSync(
    path.join(dir, 'tasks-dashboard.md'),
    [
      '# Tasks — Dashboard',
      '',
      '## T1 · dashboard screen',
      '- **Closes user story:** As an admin, I want a dashboard screen, so that I can monitor operations.',
      '- **Change type:** create-new',
      '- **File:** `src/app/dashboard/page.tsx`',
      '- **Precise change:** create the dashboard screen with KPI, filter, chart, and table regions.',
      '- **Acceptance:**',
      '  - Screen states cover default, loading, empty, error, disabled, and success.',
      '- **Test:** `npm test -- dashboard`',
      `- **Depends on:** ${dependsOn}`,
      '- **Estimated LOC:** +220',
      '- **Phase:** mvp',
      '',
    ].join('\n'),
  );
}

describe('validate-user-review-checkpoints.sh', () => {
  it('accepts a review artifact with evidence, feedback handoff, and dependent UI ordering', () => withSandbox((sandbox) => {
    writeReviewTask(sandbox);
    writeScreenTask(sandbox, 'tasks-design-system.md because design review must be approved first');

    const result = runValidator(sandbox);

    expect(result.code).toBe(0);
    expect(result.out).toMatch(/user-review checkpoints: pass/);
    expect(fs.readFileSync(path.join(sandbox, 'user-review-checkpoints.md'), 'utf8'))
      .toMatch(/reviewTaskCount": 1/);
  }));

  it('rejects review artifact tasks without reference evidence or feedback handoff', () => withSandbox((sandbox) => {
    fs.writeFileSync(
      path.join(sandbox, 'tasks-design-system.md'),
      [
        '# Tasks — Design System',
        '',
        '## T1 · design-system review artifact',
        '- **Closes user story:** As a product owner, I want a design-system review artifact, so that I can inspect the visual foundation.',
        '- **Change type:** create-new',
        '- **File:** `docs/design-system/review/index.html`',
        '- **Precise change:** create a static HTML review page for design tokens and components.',
        '- **Acceptance:**',
        '  - Token swatches and component gallery are visible.',
        '- **Test:** `test -f docs/design-system/review/index.html`',
        '- **Depends on:** none',
        '- **Estimated LOC:** +180',
        '- **Phase:** foundation',
        '',
      ].join('\n'),
    );

    const result = runValidator(sandbox);

    expect(result.code).not.toBe(0);
    expect(result.out).toMatch(/source-map\/reference evidence/);
    expect(result.out).toMatch(/visual-review feedback checkpoint/);
  }));

  it('rejects downstream UI tasks that do not depend on the review artifact task', () => withSandbox((sandbox) => {
    writeReviewTask(sandbox);
    writeScreenTask(sandbox, 'none');

    const result = runValidator(sandbox);

    expect(result.code).not.toBe(0);
    expect(result.out).toMatch(/downstream UI task does not depend on the design-system review task/);
  }));

  it('passes when no design-system review artifact task exists', () => withSandbox((sandbox) => {
    writeScreenTask(sandbox, 'none');

    const result = runValidator(sandbox);

    expect(result.code).toBe(0);
    expect(fs.readFileSync(path.join(sandbox, 'user-review-checkpoints.md'), 'utf8'))
      .toMatch(/No design-system review artifact tasks were detected/);
  }));
});
