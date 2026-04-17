/**
 * Instantiation Validation
 *
 * Guards the drill-down engine's dissolution rule: task outputs under
 * prompts/outputs/current/tasks-*.md must not reference templates,
 * .ai-prompts/ paths, or leave placeholder tokens.
 */

import { describe, it, expect } from 'vitest';
import { execSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';

const REPO_ROOT = path.resolve(__dirname, '..', '..');
const VALIDATOR = path.join(REPO_ROOT, 'scripts', 'validate-instantiation.sh');
const TASKS_DIR = path.join(REPO_ROOT, 'prompts', 'outputs', 'current');

const FORBIDDEN = [
  /\.ai-prompts\/prompts\//,
  /\{\{[^}]+\}\}/,
  /<TBD>/,
  /\[project name\]/,
];

describe('drill-down engine — instantiation validation', () => {
  it('validator script exists and is executable', () => {
    expect(fs.existsSync(VALIDATOR)).toBe(true);
    const stat = fs.statSync(VALIDATOR);
    expect((stat.mode & 0o111) !== 0).toBe(true);
  });

  it('runs cleanly against current outputs', () => {
    const result = execSync(`bash "${VALIDATOR}" "${TASKS_DIR}"`, {
      cwd: REPO_ROOT,
      encoding: 'utf8',
    });
    expect(result).toMatch(/✅|no tasks-\*\.md files/);
  });

  it('every tasks-*.md output avoids forbidden patterns', () => {
    if (!fs.existsSync(TASKS_DIR)) return;
    const files = fs
      .readdirSync(TASKS_DIR)
      .filter((f) => f.startsWith('tasks-') && f.endsWith('.md'));

    for (const f of files) {
      const body = fs.readFileSync(path.join(TASKS_DIR, f), 'utf8');
      for (const pat of FORBIDDEN) {
        expect(
          pat.test(body),
          `${f} contains forbidden pattern ${pat}`,
        ).toBe(false);
      }
    }
  });
});
