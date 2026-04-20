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
  'revise-outputs.md',
  'baseline-task-shapes.md',
  'self-maintain.md',
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

  it('executor execution-log schema includes a YAML handoff envelope', () => {
    const body = fs.readFileSync(path.join(ORCH, 'executor.md'), 'utf8');
    // Envelope must name the fields needed for cross-session resume.
    expect(body).toMatch(/session_id/);
    expect(body).toMatch(/parent_session/);
    expect(body).toMatch(/last_completed_task/);
    expect(body).toMatch(/next_task/);
    expect(body).toMatch(/blocked_tasks/);
    expect(body).toMatch(/test_suite_state/);
    expect(body).toMatch(/external_keys_needed/);
    // Must explicitly describe the resumption contract.
    expect(body.toLowerCase()).toMatch(/resumption contract|any new agent/);
  });

  it('revise-outputs enumerates coverage checks', () => {
    const body = fs.readFileSync(
      path.join(ORCH, 'revise-outputs.md'),
      'utf8',
    );
    // Must reference the canonical check numbering.
    expect(body).toMatch(/C1/);
    expect(body).toMatch(/C5/);
    expect(body).toMatch(/baseline-task-shapes\.md/);
    expect(body).toMatch(/validate-instantiation\.sh/);
    expect(body).toMatch(/revise-report\.md/);
    // Iteration is explicitly capped.
    expect(body.toLowerCase()).toMatch(/iteration cap|one regeneration/);
  });

  it('revise-outputs C5 baseline coverage applies to BOTH engines', () => {
    const body = fs.readFileSync(
      path.join(ORCH, 'revise-outputs.md'),
      'utf8',
    );
    // C5 must not be gated to greenfield only — that was the bug.
    expect(body).toMatch(/C5 — Baseline coverage \(BOTH engines/);
    // Must provide a gap-slug → baseline-topic keyword table so a
    // weak model can classify deterministically.
    expect(body.toLowerCase()).toMatch(/app-store.*playstore|playstore.*app-store/);
    expect(body.toLowerCase()).toMatch(/localization|i18n/);
    // Must name the common collapse violations.
    expect(body.toLowerCase()).toMatch(
      /collapse violation.*screenshot|screenshot.*collapse/,
    );
  });

  it('revise-outputs check-applicability table is explicit and machine-parseable', () => {
    const body = fs.readFileSync(
      path.join(ORCH, 'revise-outputs.md'),
      'utf8',
    );
    // Must have a check-applicability table and mark C5 Applies for both.
    expect(body).toMatch(/Check applicability by engine/);
    // C5 applies to both — the string "Applies" (case-sensitive) should
    // appear twice on the C5 line.
    const c5Row = body
      .split('\n')
      .find((l) => l.includes('C5') && l.includes('Baseline'));
    expect(c5Row).toBeDefined();
    const appliesCount = (c5Row!.match(/Applies/g) ?? []).length;
    expect(appliesCount).toBeGreaterThanOrEqual(2);
    // Must declare that dropping an applicable check is itself a defect.
    expect(body).toMatch(/omits an\s+applicable check|itself a defect/);
  });

  it('baseline-task-shapes covers all twelve baseline topics', () => {
    const body = fs.readFileSync(
      path.join(ORCH, 'baseline-task-shapes.md'),
      'utf8',
    );
    const topics = [
      /identity.*auth.*onboarding/i,
      /admin.*rbac/i,
      /observability/i,
      /localization.*rtl/i,
      /theming.*whitelabel/i,
      /accessibility/i,
      /testing.*qa/i,
      /ci\/cd.*release/i,
      /infrastructure as code/i,
      /app store release prep/i,
      /debug menu/i,
      /privacy.*pii.*compliance/i,
    ];
    for (const pat of topics) {
      expect(
        pat.test(body),
        `baseline-task-shapes.md is missing topic ${pat}`,
      ).toBe(true);
    }
    // App-store prep must enforce screenshots per locale × device.
    expect(body).toMatch(/per locale.*per (required )?device/i);
  });

  it('drill-down and audit-remediate both require closes_user_story', () => {
    const drill = fs.readFileSync(
      path.join(ORCH, 'drill-down-engine.md'),
      'utf8',
    );
    const audit = fs.readFileSync(
      path.join(ORCH, 'audit-and-remediate.md'),
      'utf8',
    );
    expect(drill).toMatch(/closes_user_story|Closes user story/);
    expect(audit).toMatch(/Closes user story/);
    // Both must name the canonical form.
    expect(drill).toMatch(/As a.*I want.*so that/);
    expect(audit).toMatch(/As a.*I want.*so that/);
  });

  it('self-maintain writes outputs to a separate directory', () => {
    const body = fs.readFileSync(path.join(ORCH, 'self-maintain.md'), 'utf8');
    // Must NOT write into prompts/outputs/current — collides with user projects.
    expect(body).toMatch(/prompts\/outputs\/self-maintain/);
    expect(body).toMatch(/field-tests/);
  });

  it('drill-down engine runs revise gate after validation, before handoff', () => {
    const body = fs.readFileSync(
      path.join(ORCH, 'drill-down-engine.md'),
      'utf8',
    );
    // Validation Gate and Revise Gate sections must both exist.
    const validateIdx = body.search(/^## Validation Gate/m);
    const reviseIdx = body.search(/^## Revise Gate/m);
    const handoffIdx = body.search(/^## Handing off to an implementer/m);
    expect(validateIdx).toBeGreaterThan(-1);
    expect(reviseIdx).toBeGreaterThan(-1);
    expect(handoffIdx).toBeGreaterThan(-1);
    // Order: validate → revise → handoff.
    expect(validateIdx).toBeLessThan(reviseIdx);
    expect(reviseIdx).toBeLessThan(handoffIdx);
    // Revise gate must be flagged MANDATORY and non-skippable.
    expect(body).toMatch(/Revise Gate \(MANDATORY/);
    // Revise must run on executor_gate:pass only.
    expect(body).toMatch(/executor_gate: fail/);
  });

  it('audit-and-remediate runs revise gate at Step 4.5 before Step 5 chain', () => {
    const body = fs.readFileSync(
      path.join(ORCH, 'audit-and-remediate.md'),
      'utf8',
    );
    const step4 = body.search(/^## STEP 4 — Validate/m);
    const step4_5 = body.search(/^## STEP 4\.5 — Revise outputs/m);
    const step5 = body.search(/^## STEP 5 — Chain to execution/m);
    expect(step4).toBeGreaterThan(-1);
    expect(step4_5).toBeGreaterThan(-1);
    expect(step5).toBeGreaterThan(-1);
    expect(step4).toBeLessThan(step4_5);
    expect(step4_5).toBeLessThan(step5);
    // Step 4.5 must be mandatory and non-skippable.
    expect(body).toMatch(/STEP 4\.5.*MANDATORY/);
    expect(body).toMatch(/revise-outputs\.md/);
  });

  it('entry point explains that engines own the revise gate (not the entry point)', () => {
    const body = fs.readFileSync(
      path.join(ORCH, 'ai-agent-entry-point.md'),
      'utf8',
    );
    // Entry point must NOT re-invoke revise-outputs itself — it just
    // explains what the engines do internally.
    expect(body).toMatch(/revise-outputs|Revise gate/i);
    // Entry point flow must describe that the engines hand off directly
    // to executor (entry point does not re-invoke executor).
    expect(body.toLowerCase()).toMatch(
      /engines hand off|engines do this|engines run their own/,
    );
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
