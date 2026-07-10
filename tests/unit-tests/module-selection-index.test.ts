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
    expect(body).toMatch(/design-system\/design-system-review-artifact\.md/);
    expect(body).toMatch(/technology-stacks\/tailwind-css\.md/);
    expect(body).toMatch(/technology-stacks\/mobile-os-capability-matrix\.md/);
  });

  it('indexes native gallery-cleanup ML intents', () => {
    expect(body).toMatch(/Blurry photo detection/);
    expect(body).toMatch(/Near-duplicate photo detection/);
    expect(body).toMatch(/Sensitive document detection/);
    expect(body).toMatch(/Duplicate video detection/);
  });

  it('indexes regulated architecture, UK healthcare, and GCP modules', () => {
    expect(body).toMatch(/architecture\/bounded-context-state-ownership\.md/);
    expect(body).toMatch(/architecture\/tier-zero-data-integrity\.md/);
    expect(body).toMatch(/healthcare\/uk-regulated-healthcare\.md/);
    expect(body).toMatch(/healthcare\/controlled-drugs-uk\.md/);
    expect(body).toMatch(/healthcare\/clinical-safety-dcb0129\.md/);
    expect(body).toMatch(/technology-stacks\/cloud-gcp\.md/);
    expect(body).toMatch(/deployment\/regulated-cloud-landing-zone\.md/);
    expect(body).toMatch(/security\/audit-evidence-worm\.md/);
  });

  it('routes artifact kinds before domain modules and splits mixed concerns', () => {
    expect(body).toMatch(/Artifact-kind routing \(run before domain-module lookup\)/);
    expect(body).toMatch(/Policy, privacy inventory.*`docs`/);
    expect(body).toMatch(/App Store \/ Play listing copy.*`docs`/);
    expect(body).toMatch(/Store-console upload.*`external-action`/);
    expect(body).toMatch(/Generated report.*`generated-evidence`/);
    expect(body).toMatch(/Runtime modules are permitted only when the unit names a real in-app/);
    expect(body).toMatch(/split it into separate task\s+units with dependency edges/);
    expect(body).toMatch(/runtime_consumer.*approval.*expiry/s);
  });
});
