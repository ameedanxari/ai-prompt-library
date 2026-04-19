/**
 * Module-selection index — path integrity
 *
 * Every module path listed in
 * prompts/orchestrators/module-selection-index.md must exist on disk.
 * An index entry pointing at a non-existent file would silently skip the
 * module at expansion time, which defeats the point of a deterministic
 * lookup.
 */

import { describe, it, expect } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';

const REPO_ROOT = path.resolve(__dirname, '..', '..');
const INDEX = path.join(
  REPO_ROOT,
  'prompts',
  'orchestrators',
  'module-selection-index.md',
);

describe('module-selection-index', () => {
  const body = fs.readFileSync(INDEX, 'utf8');

  // Match backtick-wrapped paths that look like module references:
  //   `prompts/modules/<dir>/<file>.md`
  const pathRegex = /`(prompts\/modules\/[a-z0-9-]+\/[a-z0-9-]+\.md)`/g;
  const matches = Array.from(body.matchAll(pathRegex), (m) => m[1]);
  const uniquePaths = Array.from(new Set(matches));

  it('index contains at least 30 module references', () => {
    expect(uniquePaths.length).toBeGreaterThanOrEqual(30);
  });

  it('every referenced module path exists on disk', () => {
    const missing = uniquePaths.filter(
      (p) => !fs.existsSync(path.join(REPO_ROOT, p)),
    );
    expect(
      missing,
      `missing modules:\n${missing.join('\n')}`,
    ).toEqual([]);
  });
});
