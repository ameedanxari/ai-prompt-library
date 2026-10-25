/**
 * validate-project-integration.sh
 *
 * Guards the consumer-project wrapper against drifting back to deleted
 * waterfall-era orchestrators/templates.
 */

import { describe, it, expect } from 'vitest';
import { execSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';

const REPO_ROOT = path.resolve(__dirname, '..', '..');
const VALIDATOR = path.join(REPO_ROOT, 'scripts', 'validate-project-integration.sh');
const BOOTSTRAP = path.join(REPO_ROOT, 'scripts', 'bootstrap-project-integration.sh');

describe('validate-project-integration.sh', () => {
  it('bootstraps and validates a consumer project using current active files only', () => {
    const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), 'integration-val-'));
    try {
      fs.symlinkSync(REPO_ROOT, path.join(sandbox, '.ai-prompts'));

      const out = execSync(`bash "${VALIDATOR}"`, {
        cwd: sandbox,
        encoding: 'utf8',
      });

      expect(out).toMatch(/Integration validation passed/);
      expect(out).toMatch(/drill-down-engine\.md/);
      expect(out).not.toMatch(/auto-request-router\.md/);
      expect(out).not.toMatch(/stage-pipeline-orchestrator\.md/);
      expect(out).not.toMatch(/prompt-composition-index-template\.md/);

      const agents = fs.readFileSync(path.join(sandbox, 'AGENTS.md'), 'utf8');
      expect(agents).toMatch(/checkpoint protocol/);
      expect(agents).not.toMatch(/continue automatically/);
    } finally {
      fs.rmSync(sandbox, { recursive: true, force: true });
    }
  });

  it('records npm package version when .ai-prompts is not a git checkout', () => {
    const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), 'integration-npm-version-'));
    try {
      const packageRoot = path.join(sandbox, 'node_modules', 'ai-prompt-library');
      fs.mkdirSync(packageRoot, { recursive: true });
      fs.writeFileSync(
        path.join(packageRoot, 'package.json'),
        JSON.stringify({ name: 'ai-prompt-library', version: '9.8.7' }, null, 2),
        'utf8',
      );
      // A real published package ships MY_PROJECT.md.template; bootstrap
      // refuses to run without it, so the fake package must include one.
      fs.writeFileSync(
        path.join(packageRoot, 'MY_PROJECT.md.template'),
        '# Fake project template\n',
        'utf8',
      );
      fs.symlinkSync(packageRoot, path.join(sandbox, '.ai-prompts'));

      execSync(`bash "${BOOTSTRAP}"`, {
        cwd: sandbox,
        encoding: 'utf8',
      });

      expect(fs.readFileSync(path.join(sandbox, '.ai-prompts-version'), 'utf8').trim())
        .toBe('ai-prompt-library@9.8.7');
    } finally {
      fs.rmSync(sandbox, { recursive: true, force: true });
    }
  });

  // The replacement branch only runs when AGENTS.md already has a block; it
  // must work with BSD awk (macOS), which rejects multi-line -v values.
  const rerunWith = (agents: string) => {
    const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), 'integration-rerun-'));
    try {
      fs.symlinkSync(REPO_ROOT, path.join(sandbox, '.ai-prompts'));
      fs.writeFileSync(path.join(sandbox, 'AGENTS.md'), agents, 'utf8');
      const out = execSync(`bash "${BOOTSTRAP}"`, { cwd: sandbox, encoding: 'utf8' });
      expect(out).toMatch(/Bootstrap complete/);
      return fs.readFileSync(path.join(sandbox, 'AGENTS.md'), 'utf8');
    } finally {
      fs.rmSync(sandbox, { recursive: true, force: true });
    }
  };

  it('replaces an existing managed block and keeps surrounding content', () => {
    const agents = rerunWith([
      '# AGENTS', '', 'Project notes before.', '',
      '## AI Prompt Library Steering (Auto-Managed — do not edit)', '', 'Old steering text.', '',
      '<!-- /AI Prompt Library Steering (Auto-Managed) -->', '', '## Team rules', '', 'Keep this.', '',
    ].join('\n'));
    expect(agents).toMatch(/Project notes before\./);
    expect(agents).toMatch(/## Team rules\n\nKeep this\./);
    expect(agents).not.toMatch(/Old steering text/);
    expect(agents).toMatch(/checkpoint protocol/);
    expect(agents.match(/## AI Prompt Library Steering \(Auto-Managed/g)).toHaveLength(1);
    expect(agents.match(/<!-- \/AI Prompt Library Steering \(Auto-Managed\) -->/g)).toHaveLength(1);
  });

  it('upgrades a legacy block without an end marker up to the next section', () => {
    const agents = rerunWith([
      '# AGENTS', '',
      '## AI Prompt Library Steering (Auto-Managed — do not edit)', '', 'Legacy steering text.', '',
      '## Team rules', '', 'Keep this too.', '',
    ].join('\n'));
    expect(agents).not.toMatch(/Legacy steering text/);
    expect(agents).toMatch(/## Team rules\n\nKeep this too\./);
    expect(agents.match(/## AI Prompt Library Steering \(Auto-Managed/g)).toHaveLength(1);
  });
});
