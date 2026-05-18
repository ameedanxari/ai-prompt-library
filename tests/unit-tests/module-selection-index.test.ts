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

  it('indexes design research, dashboard, data-viz, and Tailwind modules', () => {
    expect(body).toMatch(/design-research\/mobbin-reference-intake\.md/);
    expect(body).toMatch(/design-research\/ui-reference-source-map\.md/);
    expect(body).toMatch(/design-system\/dashboard-screen-patterns\.md/);
    expect(body).toMatch(/design-system\/data-visualization-system\.md/);
    expect(body).toMatch(/design-system\/native-visual-effects-and-motion\.md/);
    expect(body).toMatch(/technology-stacks\/tailwind-css\.md/);
    expect(body).toMatch(/technology-stacks\/mobile-os-capability-matrix\.md/);
  });

  it('indexes native gallery-cleanup ML intents', () => {
    expect(body).toMatch(/Blurry photo detection/);
    expect(body).toMatch(/Near-duplicate photo detection/);
    expect(body).toMatch(/Sensitive document detection/);
    expect(body).toMatch(/Duplicate video detection/);
  });
});
