import { describe, expect, it } from 'vitest';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { execSync } from 'node:child_process';

const REPO_ROOT = path.resolve(__dirname, '..', '..');
const VALIDATOR = path.join(REPO_ROOT, 'scripts', 'validate-baseline-task-coverage.sh');

function runValidator(targetDir: string): { code: number; out: string } {
  try {
    return {
      code: 0,
      out: execSync(`bash "${VALIDATOR}" "${targetDir}"`, { encoding: 'utf8' }),
    };
  } catch (error) {
    const err = error as { status?: number; stdout?: Buffer; stderr?: Buffer };
    return {
      code: err.status ?? 1,
      out: `${err.stdout?.toString() ?? ''}${err.stderr?.toString() ?? ''}`,
    };
  }
}

function withSandbox(run: (sandbox: string) => void) {
  const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), 'baseline-coverage-'));
  try {
    run(sandbox);
  } finally {
    fs.rmSync(sandbox, { recursive: true, force: true });
  }
}

describe('validate-baseline-task-coverage.sh', () => {
  it('is executable', () => {
    expect(fs.existsSync(VALIDATOR)).toBe(true);
  });

  it('passes when no baseline topic is detected', () => withSandbox((sandbox) => {
    fs.writeFileSync(
      path.join(sandbox, 'tasks-alpha.md'),
      [
        '# Tasks - Alpha',
        '',
        '## T1 - alpha behavior',
        '- **Precise change:** Add the alpha formatter.',
        '- **Acceptance:**',
        '  - Alpha values render.',
        '',
      ].join('\n'),
    );

    const result = runValidator(sandbox);

    expect(result.code).toBe(0);
    expect(result.out).toMatch(/baseline-task coverage: pass/);
    expect(fs.readFileSync(path.join(sandbox, 'baseline-task-coverage.md'), 'utf8'))
      .toMatch(/No baseline topics were detected/);
  }));

  it('rejects localization plans that omit RTL and hard-coded English checks', () => withSandbox((sandbox) => {
    fs.writeFileSync(
      path.join(sandbox, 'tasks-localization.md'),
      [
        '# Tasks - Localization',
        '',
        '## T1 - i18n foundation',
        '- **Precise change:** Add i18next and seed the en-US translation file.',
        '- **Acceptance:**',
        '  - The supported locale list comes from MY_PROJECT.md.',
        '',
      ].join('\n'),
    );

    const result = runValidator(sandbox);

    expect(result.code).toBe(1);
    expect(result.out).toMatch(/Localization & RTL: missing RTL verification/);
    expect(result.out).toMatch(/hard-coded English check/);
  }));

  it('accepts localization coverage with framework, locale, RTL, and string checks', () => withSandbox((sandbox) => {
    fs.writeFileSync(
      path.join(sandbox, 'tasks-localization.md'),
      [
        '# Tasks - Localization',
        '',
        '## T1 - i18n foundation',
        '- **Precise change:** Add i18next, seed the en-US translation file from the supported locale list in MY_PROJECT.md, and wire Localizable strings.',
        '- **Acceptance:**',
        '  - RTL verification uses a screenshot diff against Arabic.',
        '  - A test asserts no hard-coded English strings remain in user-facing source files.',
        '',
      ].join('\n'),
    );

    const result = runValidator(sandbox);

    expect(result.code).toBe(0);
    expect(fs.readFileSync(path.join(sandbox, 'baseline-task-coverage.md'), 'utf8'))
      .toMatch(/Localization & RTL/);
  }));

  it('rejects theme plans that stop at tokens without review, dark mode, visual regression, and whitelabel coverage', () => withSandbox((sandbox) => {
    fs.writeFileSync(
      path.join(sandbox, 'tasks-theme.md'),
      [
        '# Tasks - Theme',
        '',
        '## T1 - design tokens',
        '- **Precise change:** Add design-token CSS variables for primary, secondary, surface, and neutral colors.',
        '- **Acceptance:**',
        '  - Token names are documented.',
        '',
      ].join('\n'),
    );

    const result = runValidator(sandbox);

    expect(result.code).toBe(1);
    expect(result.out).toMatch(/Theming & Whitelabel: missing static design review artifact/);
    expect(result.out).toMatch(/dark mode/);
    expect(result.out).toMatch(/visual regression/);
    expect(result.out).toMatch(/whitelabel swap/);
  }));

  it('accepts local-only observability coverage that adapts without a hosted backend', () => withSandbox((sandbox) => {
    fs.writeFileSync(
      path.join(sandbox, 'tasks-observability.md'),
      [
        '# Tasks - Observability',
        '',
        '## T1 - local diagnostics',
        '- **Precise change:** Add structured logging with os_log and log level taxonomy, crash reporting through Xcode Organizer, a diagnostics screen with storage metrics and app health, and performance profiling with Instruments.',
        '- **Acceptance:**',
        '  - Local logs rotate before export.',
        '',
      ].join('\n'),
    );

    const result = runValidator(sandbox);

    expect(result.code).toBe(0);
    expect(fs.readFileSync(path.join(sandbox, 'baseline-task-coverage.md'), 'utf8'))
      .toMatch(/Observability/);
  }));

  it('uses baseline epics as scope even when task filenames are generic', () => withSandbox((sandbox) => {
    fs.writeFileSync(
      path.join(sandbox, 'epics.md'),
      [
        '# Epics',
        '',
        '## Baseline epics',
        '',
        '### B4. Localization & RTL',
        '- **Category:** baseline',
        '- **Goal:** Prepare user-facing strings for launch.',
        '',
      ].join('\n'),
    );
    fs.writeFileSync(
      path.join(sandbox, 'tasks-strings.md'),
      [
        '# Tasks - Strings',
        '',
        '## T1 - string resources',
        '- **Precise change:** Add a copy catalog for the launch flow.',
        '- **Acceptance:**',
        '  - The first screen loads translated labels.',
        '',
      ].join('\n'),
    );

    const result = runValidator(sandbox);

    expect(result.code).toBe(1);
    expect(result.out).toMatch(/Localization & RTL: missing i18n framework/);
    const report = fs.readFileSync(path.join(sandbox, 'baseline-task-coverage.md'), 'utf8');
    expect(report).toMatch(/epics\.md:B4\. Localization & RTL/);
    expect(report).toMatch(/scopedTopicCount": 1/);
  }));

  it('uses brief-keyword coverage as baseline scope', () => withSandbox((sandbox) => {
    fs.writeFileSync(
      path.join(sandbox, 'brief-keywords.md'),
      [
        '# Brief Keywords',
        '',
        '## Keywords',
        '',
        '| Keyword / phrase | Status | Covered by / reason |',
        '|---|---|---|',
        '| multi-language launch | covered | B4 Localization & RTL |',
        '',
      ].join('\n'),
    );
    fs.writeFileSync(
      path.join(sandbox, 'tasks-copy.md'),
      [
        '# Tasks - Copy',
        '',
        '## T1 - copy catalog',
        '- **Precise change:** Add launch copy.',
        '- **Acceptance:**',
        '  - Copy appears in the app.',
        '',
      ].join('\n'),
    );

    const result = runValidator(sandbox);

    expect(result.code).toBe(1);
    expect(result.out).toMatch(/Localization & RTL: missing i18n framework/);
    expect(fs.readFileSync(path.join(sandbox, 'baseline-task-coverage.md'), 'utf8'))
      .toMatch(/brief-keywords\.md:multi-language launch/);
  }));

  it('does not fail incidental baseline keywords that are explicitly out of scope', () => withSandbox((sandbox) => {
    fs.writeFileSync(
      path.join(sandbox, 'brief-keywords.md'),
      [
        '# Brief Keywords',
        '',
        '## Keywords',
        '',
        '| Keyword / phrase | Status | Covered by / reason |',
        '|---|---|---|',
        '| auth and sign up | out-of-scope | Account identity excluded: local-only app with no accounts |',
        '',
      ].join('\n'),
    );
    fs.writeFileSync(
      path.join(sandbox, 'tasks-local-mode.md'),
      [
        '# Tasks - Local Mode',
        '',
        '## T1 - local mode',
        '- **Precise change:** Document that auth, sign up, and login are not part of this local-only workflow.',
        '- **Acceptance:**',
        '  - Copy explains that there are no accounts.',
        '',
      ].join('\n'),
    );

    const result = runValidator(sandbox);

    expect(result.code).toBe(0);
    const report = fs.readFileSync(path.join(sandbox, 'baseline-task-coverage.md'), 'utf8');
    expect(report).toMatch(/Excluded Baseline Topics/);
    expect(report).toMatch(/Account identity/);
    expect(report).toMatch(/incidentalMatchedFiles/);
  }));
});
