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
});
