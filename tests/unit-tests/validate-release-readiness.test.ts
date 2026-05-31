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
      './task-contract': {
        types: './dist/task-contract/index.d.ts',
        import: './dist/task-contract/index.js',
      },
    },
    bin: {
      'ai-prompt-ready': './scripts/validate-ready-to-execute.sh',
      'ai-prompt-finalize': './scripts/finalize.sh',
      'ai-prompt-validate-release-readiness': './scripts/validate-release-readiness.sh',
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
});
