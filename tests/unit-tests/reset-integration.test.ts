/**
 * Reset-integration script
 *
 * Verifies scripts/reset-integration.sh purges stale state files, rewrites
 * AGENTS.md, refreshes steering copies, and clears prompts/outputs/current/.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { execSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';

const REPO_ROOT = path.resolve(__dirname, '..', '..');
const SCRIPT = path.join(REPO_ROOT, 'scripts', 'reset-integration.sh');

describe('reset-integration.sh', () => {
  let sandbox: string;

  beforeEach(() => {
    sandbox = fs.mkdtempSync(path.join(os.tmpdir(), 'reset-test-'));
    // Simulate a consumer project with this checkout installed as its library.
    fs.symlinkSync(REPO_ROOT, path.join(sandbox, '.ai-prompts'), 'dir');
    // Stale state files
    fs.writeFileSync(path.join(sandbox, 'NEXT_ACTION.md'), '# old');
    fs.writeFileSync(path.join(sandbox, 'PROJECT_STATE.md'), '# old');
    fs.writeFileSync(path.join(sandbox, 'IMPLEMENTATION_STATUS.md'), '# old');
    fs.writeFileSync(
      path.join(sandbox, 'AGENTS.md'),
      '# Old\nreferences execution-orchestrator.md and stage-pipeline-orchestrator.md',
    );
    // Stale steering
    fs.mkdirSync(path.join(sandbox, '.kiro', 'steering'), { recursive: true });
    fs.writeFileSync(
      path.join(sandbox, '.kiro', 'steering', 'library-context.md'),
      '# stale 10-stage pipeline content',
    );
    // Existing outputs
    fs.mkdirSync(path.join(sandbox, 'prompts', 'outputs', 'current'), {
      recursive: true,
    });
    fs.writeFileSync(
      path.join(sandbox, 'prompts', 'outputs', 'current', 'epics.md'),
      '# old epics',
    );
    fs.writeFileSync(
      path.join(sandbox, 'prompts', 'outputs', 'current', 'task-graph.json'),
      '{}',
    );
    fs.writeFileSync(
      path.join(sandbox, 'prompts', 'outputs', 'current', 'execution-log.md'),
      '# stale envelope',
    );
    fs.writeFileSync(
      path.join(sandbox, 'prompts', 'outputs', 'current', 'ready-to-execute-report.md'),
      '# stale report',
    );
  });

  afterEach(() => {
    fs.rmSync(sandbox, { recursive: true, force: true });
  });

  it('purges stale state files', () => {
    execSync(`bash "${SCRIPT}" --yes`, { cwd: sandbox });

    expect(fs.existsSync(path.join(sandbox, 'NEXT_ACTION.md'))).toBe(false);
    expect(fs.existsSync(path.join(sandbox, 'PROJECT_STATE.md'))).toBe(false);
    expect(fs.existsSync(path.join(sandbox, 'IMPLEMENTATION_STATUS.md'))).toBe(
      false,
    );
  });

  it('rewrites AGENTS.md with the current Auto-Managed block', () => {
    execSync(`bash "${SCRIPT}" --yes`, { cwd: sandbox });

    const agents = fs.readFileSync(path.join(sandbox, 'AGENTS.md'), 'utf8');
    expect(agents).toMatch(/AI Prompt Library Steering \(Auto-Managed/);
    expect(agents).toMatch(/drill-down-engine\.md/);
    expect(agents).toMatch(/checkpoint protocol/);
    expect(agents).not.toMatch(/continue automatically/);
    expect(agents).not.toMatch(/execution-orchestrator/);
    expect(agents).not.toMatch(/stage-pipeline-orchestrator/);
  });

  it('refreshes IDE steering copies', () => {
    execSync(`bash "${SCRIPT}" --yes`, { cwd: sandbox });

    const steering = fs.readFileSync(
      path.join(sandbox, '.kiro', 'steering', 'library-context.md'),
      'utf8',
    );
    expect(steering).not.toMatch(/stale 10-stage pipeline/);
    expect(steering).toMatch(/drill-down-engine|ai-agent-entry-point/);
  });

  it('clears prompts/outputs/current/', () => {
    execSync(`bash "${SCRIPT}" --yes`, { cwd: sandbox });

    const remaining = fs.readdirSync(
      path.join(sandbox, 'prompts', 'outputs', 'current'),
    );
    expect(remaining.sort()).toEqual([
      'clean-state-preflight.md',
      'execution',
      'logs',
      'planning',
    ]);
    expect(
      fs.existsSync(path.join(sandbox, 'prompts', 'outputs', 'current', 'planning', 'features')),
    ).toBe(true);
    expect(
      fs.existsSync(path.join(sandbox, 'prompts', 'outputs', 'current', 'execution', 'task-results')),
    ).toBe(true);
  });

  it('creates MY_PROJECT.md from template if absent', () => {
    execSync(`bash "${SCRIPT}" --yes`, { cwd: sandbox });
    expect(fs.existsSync(path.join(sandbox, 'MY_PROJECT.md'))).toBe(true);
  });

  it('preserves user-specific content under ## Project-specific', () => {
    fs.writeFileSync(
      path.join(sandbox, 'AGENTS.md'),
      '# Old\nreferences execution-orchestrator.md\n\n## Project-specific\n\nMy custom rules for this app.\n',
    );

    execSync(`bash "${SCRIPT}" --yes`, { cwd: sandbox });

    const agents = fs.readFileSync(path.join(sandbox, 'AGENTS.md'), 'utf8');
    expect(agents).toMatch(/## Project-specific/);
    expect(agents).toMatch(/My custom rules for this app/);
  });

  it('writes a clean-state preflight with provenance, removals, and tool readiness', () => {
    fs.writeFileSync(path.join(sandbox, 'MY_PROJECT.md'), '# Original canary brief\n');

    execSync(`bash "${SCRIPT}" --yes`, { cwd: sandbox });

    const report = fs.readFileSync(
      path.join(sandbox, 'prompts', 'outputs', 'current', 'clean-state-preflight.md'),
      'utf8',
    );
    expect(report).toMatch(/Library version:.*`\d+\.\d+\.\d+`/);
    expect(report).toMatch(/Library revision:.*`[a-f0-9]+`/);
    expect(report).toMatch(/Authoritative Inputs Retained/);
    expect(report).toMatch(/`MY_PROJECT\.md`.*preserved byte-for-byte/);
    expect(report).toMatch(/prompts\/outputs\/current\/task-graph\.json/);
    expect(report).toMatch(/prompts\/outputs\/current\/execution-log\.md/);
    expect(report).toMatch(/prompts\/outputs\/current\/ready-to-execute-report\.md/);
    expect(report).toMatch(/Expected Output Locations/);
    expect(report).toMatch(/Tool Readiness/);
    expect(fs.readFileSync(path.join(sandbox, 'MY_PROJECT.md'), 'utf8'))
      .toBe('# Original canary brief\n');
  });

  it('is idempotent across consecutive resets', () => {
    fs.writeFileSync(path.join(sandbox, 'MY_PROJECT.md'), '# Unchanged brief\n');

    execSync(`bash "${SCRIPT}" --yes`, { cwd: sandbox });
    execSync(`bash "${SCRIPT}" --yes`, { cwd: sandbox });

    const outputRoot = path.join(sandbox, 'prompts', 'outputs', 'current');
    expect(fs.readdirSync(outputRoot).sort()).toEqual([
      'clean-state-preflight.md',
      'execution',
      'logs',
      'planning',
    ]);
    expect(fs.readFileSync(path.join(sandbox, 'MY_PROJECT.md'), 'utf8'))
      .toBe('# Unchanged brief\n');
    expect(fs.readFileSync(path.join(outputRoot, 'clean-state-preflight.md'), 'utf8'))
      .toMatch(/clean-state-preflight\.md/);
  });
});
