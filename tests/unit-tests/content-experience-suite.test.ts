import { describe, expect, it } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';

const REPO_ROOT = path.resolve(__dirname, '..', '..');
const read = (...segments: string[]) =>
  fs.readFileSync(path.join(REPO_ROOT, ...segments), 'utf8');

// Guard evals for the content-experience layer added after the 2026-07
// SignalForge audit. Each assertion pins a template contract that,
// when absent, produced a shipped defect: spec language as UI copy,
// fixtures as live data, identifier-derived display names, a stub
// route with delivery vocabulary, duplicate shortcuts, and
// compliance-first onboarding.

describe('content-system orchestrator contract', () => {
  const body = read('prompts', 'orchestrators', 'content-system.md');

  it('declares every required artifact section', () => {
    for (const section of [
      '## Persona voice pack',
      '## Voice and tone',
      '## Terminology glossary',
      '## Content model',
      '## First-run experience',
      '## Seed and demo data policy',
    ]) {
      expect(body).toContain(section);
    }
  });

  it('carries the never-display, identity, and demo-policy contracts', () => {
    expect(body).toMatch(/never-display|Never display/);
    expect(body).toMatch(/NEVER derived from identifiers/i);
    expect(body).toMatch(/NEVER receives demo\s+content/);
    expect(body).toMatch(/README documents each demo account/);
    expect(body).toContain('content-lint.config.json');
    expect(body).toContain('activation milestone');
  });
});

describe('planning templates carry the journey and channel contracts', () => {
  it('drill-down enumerates journeys first and separates invariants from copy', () => {
    const body = read('prompts', 'orchestrators', 'drill-down-engine.md');
    expect(body).toContain('Enumerate user journeys FIRST');
    expect(body).toContain('`serves_journeys`');
    expect(body).toContain('`invariants`');
    expect(body).toMatch(/translated, never transcribed|translated.*through the content system|never be transcribed/i);
    expect(body).toContain('Deferred routes');
    expect(body).toContain('STEP 2.9 — Content System');
  });

  it('product vision requires exactly one activation milestone', () => {
    const body = read('prompts', 'orchestrators', 'product-vision.md');
    expect(body).toContain('## Activation milestone (exactly one)');
    expect(body).toMatch(/First value/);
  });

  it('ux blueprint requires journey-first navigation and an activation-first landing', () => {
    const body = read('prompts', 'orchestrators', 'ux-blueprint.md');
    expect(body).toContain('Journey-first grouping');
    expect(body).toContain('Activation-first landing');
    expect(body).toContain('content-system.md');
  });

  it('the revise gate documents C18 for the content system', () => {
    const body = read('prompts', 'orchestrators', 'revise-outputs.md');
    expect(body).toContain('C18 — Content-system schema');
    expect(body).toMatch(/Activation milestone/);
  });
});

describe('execution and release carry the enforcement contracts', () => {
  it('executor rule 6 enforces surface-copy hygiene and the content lint gate', () => {
    const body = read('prompts', 'orchestrators', 'executor.md');
    expect(body).toContain('Surface-copy hygiene');
    expect(body).toContain('validate-content-lint.sh');
    expect(body).toMatch(/never derived from identifiers/i);
  });

  it('release plan ships the fresh-account gate wired to review evidence', () => {
    const body = read('prompts', 'orchestrators', 'release-plan.md');
    expect(body).toContain('GATE-FRESH-ACCOUNT-001');
    expect(body).toContain('"kind": "fresh-account"');
    expect(body).toContain('fresh-account-dry-run');
    expect(body).toMatch(/fresh-account\s*\n?gates always use threshold `100`|fresh-account\ngates always use threshold `100`|data-integrity, and fresh-account/);
  });

  it('the content-experience review owns the fresh-account checklist', () => {
    const body = read('prompts', 'review', 'content-experience-review.md');
    expect(body).toContain('dimension: content-experience');
    expect(body).toMatch(/fresh[- ]account dry-run/i);
    expect(body).toMatch(/signed-in user appears in their own member\s+roster/i);
    expect(body).toMatch(/CRITICAL/);
    expect(body).toContain('GATE-FRESH-ACCOUNT-001');
  });

  it('AGENTS.md advertises the content-system artifacts', () => {
    const body = read('prompts', 'AGENTS.md');
    expect(body).toContain('content-system.md');
    expect(body).toContain('content-lint.config.json');
  });
});
