import { describe, expect, it } from 'vitest';
import { execSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';

const REPO_ROOT = path.resolve(__dirname, '..', '..');
const SCRIPT = path.join(REPO_ROOT, 'scripts', 'validate-release-readiness.sh');

function run(root: string): { code: number; out: string } {
  try {
    return {
      code: 0,
      out: execSync(`bash "${SCRIPT}" "${root}"`, {
        encoding: 'utf8',
        env: {
          ...process.env,
          RELEASE_READINESS_SKIP_BUILD: '1',
          RELEASE_READINESS_SKIP_PACK: '1',
        },
      }),
    };
  } catch (error) {
    const err = error as { stdout?: Buffer; stderr?: Buffer; status?: number };
    return {
      code: err.status ?? 1,
      out: `${err.stdout?.toString() ?? ''}${err.stderr?.toString() ?? ''}`,
    };
  }
}

function writeFixtureRoot(dir: string, packageJson: Record<string, unknown>): void {
  fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify(packageJson, null, 2), 'utf8');
  fs.writeFileSync(
    path.join(dir, 'README.md'),
    [
      '# ai-prompt-library',
      '',
      'https://github.com/ameedanxari/ai-prompt-library',
      '',
      'npm install --save-dev ai-prompt-library',
      '',
    ].join('\n'),
    'utf8',
  );
  fs.writeFileSync(
    path.join(dir, 'QUICK_START.md'),
    [
      '# Quick Start',
      '',
      'git submodule add https://github.com/ameedanxari/ai-prompt-library.git .ai-prompts',
      '',
      'npm install --save-dev ai-prompt-library',
      '',
    ].join('\n'),
    'utf8',
  );
  fs.writeFileSync(path.join(dir, 'LICENSE'), 'MIT License\n', 'utf8');
  fs.mkdirSync(path.join(dir, 'scripts'), { recursive: true });
  for (const script of [
    'validate-ready-to-execute.sh',
    'finalize.sh',
    'validate-release-readiness.sh',
    'validate-semantic-review.sh',
  ]) {
    const full = path.join(dir, 'scripts', script);
    fs.writeFileSync(full, '#!/usr/bin/env bash\n', 'utf8');
    fs.chmodSync(full, 0o755);
  }
}

function validPackageJson(): Record<string, unknown> {
  return {
    name: 'ai-prompt-library',
    version: '1.0.0',
    description: 'AI Prompt Library for generating production-ready software specifications',
    license: 'MIT',
    repository: {
      type: 'git',
      url: 'git+https://github.com/ameedanxari/ai-prompt-library.git',
    },
    bugs: {
      url: 'https://github.com/ameedanxari/ai-prompt-library/issues',
    },
    homepage: 'https://github.com/ameedanxari/ai-prompt-library#readme',
    main: './dist/index.js',
    types: './dist/index.d.ts',
    exports: {
      '.': {
        types: './dist/index.d.ts',
        import: './dist/index.js',
      },
      './completion': {
        types: './dist/completion/completion-state.d.ts',
        import: './dist/completion/completion-state.js',
      },
      './execution-status': {
        types: './dist/execution/execution-status.d.ts',
        import: './dist/execution/execution-status.js',
      },
      './release-gates': {
        types: './dist/release/release-gates.d.ts',
        import: './dist/release/release-gates.js',
      },
      './semantic-review': {
        types: './dist/review/index.d.ts',
        import: './dist/review/index.js',
      },
      './task-contract': {
        types: './dist/task-contract/index.d.ts',
        import: './dist/task-contract/index.js',
      },
      './traceability': {
        types: './dist/traceability/traceability-matrix.d.ts',
        import: './dist/traceability/traceability-matrix.js',
      },
    },
    bin: {
      'ai-prompt-ready': './scripts/validate-ready-to-execute.sh',
      'ai-prompt-finalize': './scripts/finalize.sh',
      'ai-prompt-validate-release-readiness': './scripts/validate-release-readiness.sh',
      'ai-prompt-validate-semantic-review': './scripts/validate-semantic-review.sh',
    },
    scripts: {
      clean: 'rm -rf dist',
      build: 'tsc -p tsconfig.build.json',
      prepack: 'npm run clean && npm run build',
      'validate:release': 'bash scripts/validate-release-readiness.sh',
    },
    engines: {
      node: '>=20',
    },
    type: 'module',
  };
}

function writeGates(dir: string, gates: Record<string, unknown>[]): void {
  fs.writeFileSync(path.join(dir, 'release-gates.json'), JSON.stringify({
    schemaVersion: 1,
    gates,
  }, null, 2), 'utf8');
}

function releaseGate(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    id: 'GATE-PRODUCTION-001',
    kind: 'production',
    dimension: 'production-flow',
    threshold: 100,
    actualValue: 100,
    blocking: true,
    owner: 'Release engineering',
    requirementIds: ['REQ-FLOW-001'],
    taskIds: ['tasks-production-flow.md#T1'],
    requiredEvidence: ['production-flow-integration'],
    actualEvidence: [{
      id: 'production-flow-integration',
      source: 'reports/production-flow.json',
      outcome: 'pass',
      level: 'integration',
    }],
    ...overrides,
  };
}

describe('validate-release-readiness.sh', () => {
  it('is executable', () => {
    expect(fs.existsSync(SCRIPT)).toBe(true);
    expect((fs.statSync(SCRIPT).mode & 0o111) !== 0).toBe(true);
  });

  it('passes static release metadata checks for this package', () => {
    const result = run(REPO_ROOT);

    expect(result.code).toBe(0);
    expect(result.out).toMatch(/release readiness: pass/);
  });

  it('rejects missing repository metadata before release', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'release-readiness-bad-'));
    try {
      const pkg = validPackageJson();
      delete pkg.repository;
      writeFixtureRoot(dir, pkg);

      const result = run(dir);

      expect(result.code).toBe(1);
      expect(result.out).toMatch(/repository\.url is required/);
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  it('fails a release-plan gate with a precise missing-evidence message', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'release-readiness-gate-missing-'));
    try {
      writeFixtureRoot(dir, validPackageJson());
      writeGates(dir, [releaseGate({ actualEvidence: [] })]);

      const result = run(dir);

      expect(result.code).toBe(1);
      expect(result.out).toMatch(/GATE-PRODUCTION-001: missing required evidence: production-flow-integration/);
      expect(result.out).toMatch(/release-gate-report\.md/);
      const report = JSON.parse(
        fs.readFileSync(path.join(dir, 'release-readiness-report.json'), 'utf8'),
      );
      expect(report).toMatchObject({
        package_ready: true,
        release_ready: false,
        blocking_gate_ids: ['GATE-PRODUCTION-001'],
      });
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  it('does not let passing package checks override a failed privacy gate', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'release-readiness-privacy-'));
    try {
      writeFixtureRoot(dir, validPackageJson());
      writeGates(dir, [releaseGate({
        id: 'GATE-PRIVACY-001',
        kind: 'privacy',
        threshold: 80,
        actualValue: 99,
        blocking: false,
        requiredEvidence: ['privacy-review'],
        actualEvidence: [{
          id: 'privacy-review',
          source: 'reports/privacy-review.json',
          outcome: 'pass',
          level: 'manual-review',
        }],
      })]);

      const result = run(dir);

      expect(result.code).toBe(1);
      expect(result.out).toMatch(/actual 99 is below threshold 100/);
      const markdown = fs.readFileSync(path.join(dir, 'release-gate-report.md'), 'utf8');
      expect(markdown).toMatch(/GATE-PRIVACY-001.*100.*99.*yes.*fail/);
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  it('blocks malformed non-blocking gates instead of reporting release ready', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'release-readiness-malformed-soft-'));
    try {
      writeFixtureRoot(dir, validPackageJson());
      writeGates(dir, [releaseGate({
        id: 'GATE-SCORE-001',
        kind: 'scorecard',
        blocking: false,
        taskIds: [],
        requiredEvidence: [],
      })]);

      const result = run(dir);

      expect(result.code).toBe(1);
      expect(result.out).toMatch(/canonical task IDs are missing/);
      expect(result.out).toMatch(/required evidence IDs are missing/);
      expect(JSON.parse(
        fs.readFileSync(path.join(dir, 'release-readiness-report.json'), 'utf8'),
      )).toMatchObject({
        promotion_allowed: false,
        release_ready: false,
        blocking_gate_ids: ['GATE-SCORE-001'],
      });
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  it('writes release-ready reports when package and hard gates pass', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'release-readiness-pass-'));
    try {
      writeFixtureRoot(dir, validPackageJson());
      writeGates(dir, [releaseGate()]);

      const result = run(dir);

      expect(result.code).toBe(0);
      expect(result.out).toMatch(/release readiness: pass/);
      expect(JSON.parse(
        fs.readFileSync(path.join(dir, 'release-readiness-report.json'), 'utf8'),
      )).toMatchObject({
        package_ready: true,
        promotion_allowed: true,
        release_ready: true,
        blocking_gate_ids: [],
      });
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });
});
