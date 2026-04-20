/**
 * Active orchestrators — structural integrity
 *
 * Guards the invariant that the four active orchestrators exist, each
 * starts with an H1, and none carries the DEPRECATED banner that marks
 * legacy files. Also verifies cross-references between the active set.
 */

import { describe, it, expect } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';

const REPO_ROOT = path.resolve(__dirname, '..', '..');
const ORCH = path.join(REPO_ROOT, 'prompts', 'orchestrators');

const ACTIVE = [
  'ai-agent-entry-point.md',
  'drill-down-engine.md',
  'audit-and-remediate.md',
  'executor.md',
  'external-input-handler.md',
  'module-selection-index.md',
];

describe('active orchestrators', () => {
  it('exactly the expected set exists (plus README)', () => {
    const present = fs
      .readdirSync(ORCH)
      .filter((f) => f.endsWith('.md'))
      .sort();
    expect(present).toEqual([...ACTIVE, 'README.md'].sort());
  });

  describe.each(ACTIVE)('%s', (name) => {
    const body = fs.readFileSync(path.join(ORCH, name), 'utf8');

    it('starts with an H1 heading', () => {
      expect(body).toMatch(/^# \S/);
    });

    it('does not carry the DEPRECATED banner', () => {
      expect(body).not.toMatch(/DEPRECATED — DO NOT AUTO-LOAD/);
    });
  });

  it('entry point references both engines (drill-down + audit-and-remediate)', () => {
    const body = fs.readFileSync(
      path.join(ORCH, 'ai-agent-entry-point.md'),
      'utf8',
    );
    expect(body).toMatch(/drill-down-engine\.md/);
    expect(body).toMatch(/audit-and-remediate\.md/);
  });

  it('entry point mode selection names all four modes', () => {
    const body = fs.readFileSync(
      path.join(ORCH, 'ai-agent-entry-point.md'),
      'utf8',
    );
    expect(body.toLowerCase()).toMatch(/mode 1 — trivial/);
    expect(body.toLowerCase()).toMatch(/mode 2 — execute/);
    expect(body.toLowerCase()).toMatch(/mode 3 — gap-closure/);
    expect(body.toLowerCase()).toMatch(/mode 4 — greenfield/);
  });

  it('entry point treats explicit reset as unconditional trigger', () => {
    const body = fs.readFileSync(
      path.join(ORCH, 'ai-agent-entry-point.md'),
      'utf8',
    );
    // Must document that explicit user reset runs unconditionally.
    expect(body.toLowerCase()).toMatch(/unconditional/);
    expect(body.toLowerCase()).toMatch(/force reset/);
    expect(body).toMatch(/reset-integration\.sh --yes/);
  });

  it('executor references plan artifacts and log', () => {
    const body = fs.readFileSync(path.join(ORCH, 'executor.md'), 'utf8');
    expect(body).toMatch(/remediation-/);
    expect(body).toMatch(/tasks-/);
    expect(body).toMatch(/execution-log\.md/);
    expect(body).toMatch(/gap-list\.md|epics\.md/);
    // Hard requirement: never execute unvalidated plan.
    expect(body).toMatch(/validate-instantiation\.sh/);
  });

  it('audit-and-remediate references all four required output files', () => {
    const body = fs.readFileSync(
      path.join(ORCH, 'audit-and-remediate.md'),
      'utf8',
    );
    expect(body).toMatch(/audit-report\.md/);
    expect(body).toMatch(/gap-list\.md/);
    expect(body).toMatch(/remediation-/);
    expect(body).toMatch(/project-context\.md/);
  });

  it('audit-and-remediate has a Step 5 that mandatorily chains to executor', () => {
    const body = fs.readFileSync(
      path.join(ORCH, 'audit-and-remediate.md'),
      'utf8',
    );
    expect(body).toMatch(/STEP 5/);
    expect(body.toLowerCase()).toMatch(/chain to execution/);
    // Must name the execute-signal words for the weak model.
    expect(body.toLowerCase()).toMatch(/"fix"/);
    expect(body.toLowerCase()).toMatch(/"implement"/);
    expect(body.toLowerCase()).toMatch(/"close the gaps"/);
    // Must point at executor.md explicitly.
    expect(body).toMatch(/executor\.md/);
    // Must use "IMMEDIATELY" or "mandatory" to signal non-optionality.
    expect(body).toMatch(/IMMEDIATELY|mandatory|MANDATORY/);
  });

  it('audit-report format uses live date, not a static string', () => {
    const body = fs.readFileSync(
      path.join(ORCH, 'audit-and-remediate.md'),
      'utf8',
    );
    // The schema must reference a command that produces today's date.
    expect(body).toMatch(/date \+%Y-%m-%d|today's ISO date/);
    expect(body.toLowerCase()).toMatch(/do not guess/);
  });

  it('drill-down Step 1 emits production-readiness baseline epics', () => {
    const body = fs.readFileSync(
      path.join(ORCH, 'drill-down-engine.md'),
      'utf8',
    );
    // Every baseline epic must be documented by name in Step 1.
    const baselineTopics = [
      /identity.*auth.*onboarding/i,
      /admin.*rbac/i,
      /observability/i,
      /localization.*rtl/i,
      /theming.*whitelabel/i,
      /accessibility/i,
      /testing.*qa/i,
      /ci\/cd.*release/i,
      /infrastructure as code/i,
      /app store release/i,
      /debug menu/i,
      /privacy.*pii.*compliance/i,
    ];
    for (const pat of baselineTopics) {
      expect(
        pat.test(body),
        `drill-down-engine.md is missing baseline topic ${pat}`,
      ).toBe(true);
    }
    // Baseline must be conditional on MY_PROJECT.md Restrict.
    expect(body).toMatch(/Restrict/);
    // Default platforms must be explicit.
    expect(body.toLowerCase()).toMatch(/web \+ android \+ ios/);
  });
});
