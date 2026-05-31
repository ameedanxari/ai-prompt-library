import { describe, expect, it } from 'vitest';
import { execFileSync, execSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';

const REPO_ROOT = path.resolve(__dirname, '..', '..');

function readJson(filePath: string) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

describe('package metadata', () => {
  it('points package entrypoints at build output with declarations', () => {
    const pkg = readJson(path.join(REPO_ROOT, 'package.json'));

    expect(pkg.main).toBe('./dist/index.js');
    expect(pkg.types).toBe('./dist/index.d.ts');
    expect(pkg.exports).toMatchObject({
      '.': {
        types: './dist/index.d.ts',
        import: './dist/index.js',
      },
      './task-contract': {
        types: './dist/task-contract/index.d.ts',
        import: './dist/task-contract/index.js',
      },
    });
  });

  it('declares the supported Node runtime for the ESM package', () => {
    const pkg = readJson(path.join(REPO_ROOT, 'package.json'));

    expect(pkg.engines).toMatchObject({
      node: '>=20',
    });
  });

  it('declares release metadata that matches public docs', () => {
    const pkg = readJson(path.join(REPO_ROOT, 'package.json'));
    const readme = fs.readFileSync(path.join(REPO_ROOT, 'README.md'), 'utf8');
    const quickStart = fs.readFileSync(path.join(REPO_ROOT, 'QUICK_START.md'), 'utf8');

    expect(pkg.license).toBe('MIT');
    expect(pkg.repository).toMatchObject({
      type: 'git',
      url: 'git+https://github.com/ameedanxari/ai-prompt-library.git',
    });
    expect(pkg.bugs.url).toBe('https://github.com/ameedanxari/ai-prompt-library/issues');
    expect(pkg.homepage).toBe('https://github.com/ameedanxari/ai-prompt-library#readme');
    expect(readme).toMatch(/https:\/\/github\.com\/ameedanxari\/ai-prompt-library/);
    expect(quickStart).toMatch(/https:\/\/github\.com\/ameedanxari\/ai-prompt-library/);
  });

  it('has a build config that emits dist without compiling tests', () => {
    const buildConfig = readJson(path.join(REPO_ROOT, 'tsconfig.build.json'));

    expect(buildConfig.compilerOptions).toMatchObject({
      declaration: true,
      declarationMap: false,
      noEmit: false,
      outDir: 'dist',
      rootDir: 'src',
      sourceMap: false,
    });
    expect(buildConfig.include).toEqual(['src/index.ts', 'src/task-contract/**/*.ts']);
    expect(buildConfig.exclude).toContain('src/**/*.test.ts');
    expect(fs.readFileSync(path.join(REPO_ROOT, 'src', 'index.ts'), 'utf8'))
      .toMatch(/export \* from '\.\/task-contract\/index\.js'/);
  });

  it('publishes the library assets and executable shell tools', () => {
    const pkg = readJson(path.join(REPO_ROOT, 'package.json'));

    expect(pkg.files).toEqual(expect.arrayContaining([
      'dist/index.*',
      'dist/task-contract',
      'prompts',
      'project-templates',
      'scripts',
      'README.md',
      'LICENSE',
    ]));
    expect(pkg.bin).toMatchObject({
      'ai-prompt-build-task-contract': './scripts/build-task-contract.sh',
      'ai-prompt-finalize': './scripts/finalize.sh',
      'ai-prompt-generate-design-review': './scripts/generate-design-system-review-artifact.sh',
      'ai-prompt-ready': './scripts/validate-ready-to-execute.sh',
      'ai-prompt-repair-task-schema-fields': './scripts/repair-task-schema-fields.sh',
      'ai-prompt-validate-baseline-task-coverage': './scripts/validate-baseline-task-coverage.sh',
      'ai-prompt-validate-design-review': './scripts/validate-design-system-review-artifact.sh',
      'ai-prompt-validate-instantiation': './scripts/validate-instantiation.sh',
      'ai-prompt-validate-phase-order': './scripts/validate-phase-order.sh',
      'ai-prompt-validate-release-readiness': './scripts/validate-release-readiness.sh',
      'ai-prompt-validate-resumption-checkpoint': './scripts/validate-resumption-checkpoint.sh',
      'ai-prompt-validate-screenshot-matrix': './scripts/validate-screenshot-matrix.sh',
      'ai-prompt-validate-task-contract': './scripts/validate-task-contract.sh',
      'ai-prompt-validate-ui-reference-source-map': './scripts/validate-ui-reference-source-map.sh',
      'ai-prompt-validate-user-review-checkpoints': './scripts/validate-user-review-checkpoints.sh',
    });

    for (const scriptPath of Object.values(pkg.bin) as string[]) {
      const fullPath = path.join(REPO_ROOT, scriptPath);
      expect(fs.existsSync(fullPath)).toBe(true);
      expect((fs.statSync(fullPath).mode & 0o111) !== 0).toBe(true);
    }
  });

  it('does not keep package scripts that point at missing TypeScript entrypoints', () => {
    const pkg = readJson(path.join(REPO_ROOT, 'package.json'));

    expect(pkg.scripts.clean).toBe('rm -rf dist');
    expect(pkg.scripts.prepack).toBe('npm run clean && npm run build');

    for (const [name, command] of Object.entries(pkg.scripts) as Array<[string, string]>) {
      const match = command.match(/\b(?:vite-node|tsx|ts-node|node)\s+([^\s]+\.ts)\b/);
      if (!match) continue;
      expect(
        fs.existsSync(path.join(REPO_ROOT, match[1])),
        `${name} references missing ${match[1]}`,
      ).toBe(true);
    }
  });

  it('builds Node-compatible public ESM entrypoints', async () => {
    execSync('npm run build', { cwd: REPO_ROOT, stdio: 'pipe' });

    const root = await import(pathToFileUrl(path.join(REPO_ROOT, 'dist', 'index.js')));
    const taskContract = await import(pathToFileUrl(path.join(REPO_ROOT, 'dist', 'task-contract', 'index.js')));

    expect(root.buildTaskContractReport).toBeTypeOf('function');
    expect(taskContract.parsePlanTaskFile).toBeTypeOf('function');
  });

  it('packs the published docs, declarations, and runnable scripts', () => {
    execSync('npm run build', { cwd: REPO_ROOT, stdio: 'pipe' });

    const raw = execSync('npm pack --dry-run --json --ignore-scripts', {
      cwd: REPO_ROOT,
      encoding: 'utf8',
      stdio: 'pipe',
    });
    const packJsonStart = raw.indexOf('[');
    expect(packJsonStart).toBeGreaterThanOrEqual(0);
    const pack = JSON.parse(raw.slice(packJsonStart)) as Array<{ files: Array<{ path: string }> }>;
    const packedPaths = new Set(pack[0].files.map((file) => file.path));

    for (const expectedPath of [
      'dist/index.js',
      'dist/index.d.ts',
      'dist/task-contract/index.js',
      'dist/task-contract/index.d.ts',
      'dist/task-contract/cli.js',
      'scripts/validate-ready-to-execute.sh',
      'scripts/finalize.sh',
      'scripts/build-task-contract.sh',
      'scripts/validate-task-contract.sh',
      'scripts/validate-phase-order.sh',
      'scripts/validate-baseline-task-coverage.sh',
      'scripts/validate-user-review-checkpoints.sh',
      'scripts/validate-screenshot-matrix.sh',
      'scripts/validate-release-readiness.sh',
      'scripts/validate-regulated-architecture.sh',
      'scripts/validate-ui-reference-source-map.sh',
      'scripts/generate-design-system-review-artifact.sh',
      'scripts/validate-design-system-review-artifact.sh',
      'scripts/validate-resumption-checkpoint.sh',
      'scripts/repair-task-schema-fields.sh',
      'prompts/AGENTS.md',
      'prompts/orchestrators/ai-agent-entry-point.md',
      'README.md',
      'QUICK_START.md',
      'MY_PROJECT.md.template',
      'LICENSE',
    ]) {
      expect(packedPaths, expectedPath).toContain(expectedPath);
    }

    for (const forbiddenPattern of [
      /(?:^|\/)xcuserdata\//,
      /(?:^|\/)\.gradle\//,
      /(?:^|\/)build\//,
      /\.xcuserstate$/,
      /\.DS_Store$/,
      /\.log$/,
      /\.map$/,
      /^docs\/archive\//,
      /^docs\/DRY_RUN_/,
      /^docs\/dry-runs\//,
      /^docs\/rewrite-history\//,
      /^src\/(?!task-contract\/)/,
      /^tests\//,
      /^dist\/accessibility-template-validator\.js$/,
      /^dist\/agentic-runtime\.js$/,
    ]) {
      const offender = [...packedPaths].find((packedPath) => forbiddenPattern.test(packedPath));
      expect(offender, String(forbiddenPattern)).toBeUndefined();
    }
  });

  it('installs the packed tarball and exposes importable package entrypoints', () => {
    execSync('npm run build', { cwd: REPO_ROOT, stdio: 'pipe' });

    const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), 'packed-consumer-'));
    try {
      const packDir = path.join(sandbox, 'pack');
      const consumerDir = path.join(sandbox, 'consumer');
      const outputDir = path.join(consumerDir, 'outputs');
      fs.mkdirSync(packDir, { recursive: true });
      fs.mkdirSync(outputDir, { recursive: true });
      fs.writeFileSync(
        path.join(consumerDir, 'package.json'),
        JSON.stringify({ type: 'module', private: true }, null, 2),
        'utf8',
      );

      const packRaw = execFileSync('npm', [
        'pack',
        '--json',
        '--ignore-scripts',
        '--pack-destination',
        packDir,
      ], {
        cwd: REPO_ROOT,
        encoding: 'utf8',
        stdio: 'pipe',
      });
      const pack = JSON.parse(packRaw.slice(packRaw.indexOf('['))) as Array<{ filename: string }>;
      const tarballPath = path.join(packDir, pack[0].filename);

      execFileSync('npm', [
        'install',
        '--ignore-scripts',
        '--no-audit',
        '--no-fund',
        '--no-package-lock',
        tarballPath,
      ], {
        cwd: consumerDir,
        stdio: 'pipe',
      });

      const importOutput = execFileSync('node', [
        '--input-type=module',
        '-e',
        [
          "const root = await import('ai-prompt-library');",
          "const taskContract = await import('ai-prompt-library/task-contract');",
          'console.log(JSON.stringify({',
          '  rootReport: typeof root.buildTaskContractReport,',
          '  parser: typeof taskContract.parsePlanTaskFile,',
          '  directoryReport: typeof taskContract.buildTaskContractReportForDirectory,',
          '}));',
        ].join('\n'),
      ], {
        cwd: consumerDir,
        encoding: 'utf8',
        stdio: 'pipe',
      });
      expect(JSON.parse(importOutput)).toEqual({
        rootReport: 'function',
        parser: 'function',
        directoryReport: 'function',
      });

      let readyOutput = '';
      try {
        readyOutput = execFileSync(
          path.join(consumerDir, 'node_modules', '.bin', 'ai-prompt-ready'),
          [outputDir],
          {
            cwd: consumerDir,
            encoding: 'utf8',
            stdio: 'pipe',
          },
        );
      } catch (error) {
        const err = error as { stdout?: Buffer; stderr?: Buffer };
        readyOutput = `${err.stdout?.toString() ?? ''}${err.stderr?.toString() ?? ''}`;
      }

      expect(readyOutput).toMatch(/ready-to-execute gate: fail/);
      expect(readyOutput).not.toMatch(/No such file or directory/);
      expect(fs.existsSync(path.join(outputDir, 'ready-to-execute-report.md'))).toBe(true);
    } finally {
      fs.rmSync(sandbox, { recursive: true, force: true });
    }
  });

  it('published bin scripts resolve sibling scripts through npm-style symlinks', () => {
    const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), 'bin-symlink-'));
    try {
      const binDir = path.join(sandbox, 'node_modules', '.bin');
      const outputDir = path.join(sandbox, 'outputs');
      fs.mkdirSync(binDir, { recursive: true });
      fs.mkdirSync(outputDir, { recursive: true });
      fs.symlinkSync(
        path.join(REPO_ROOT, 'scripts', 'validate-ready-to-execute.sh'),
        path.join(binDir, 'ai-prompt-ready'),
      );

      let out = '';
      try {
        out = execSync(`bash "${path.join(binDir, 'ai-prompt-ready')}" "${outputDir}"`, {
          encoding: 'utf8',
          stdio: 'pipe',
        });
      } catch (error) {
        const err = error as { stdout?: Buffer; stderr?: Buffer };
        out = `${err.stdout?.toString() ?? ''}${err.stderr?.toString() ?? ''}`;
      }

      expect(out).not.toMatch(/node_modules\/\.bin\/finalize\.sh/);
      expect(out).not.toMatch(/No such file or directory/);
      expect(out).toMatch(/ready-to-execute gate: fail/);
      expect(fs.existsSync(path.join(outputDir, 'ready-to-execute-report.md'))).toBe(true);
    } finally {
      fs.rmSync(sandbox, { recursive: true, force: true });
    }
  });
});

function pathToFileUrl(filePath: string): string {
  return `file://${filePath.split(path.sep).map(encodeURIComponent).join('/')}`;
}
