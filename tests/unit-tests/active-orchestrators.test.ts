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

  it('steering guard centralises the execute-signal list and forbids A/B/C/D menus', () => {
    const body = fs.readFileSync(
      path.resolve(REPO_ROOT, 'prompts', 'steering', 'library-context.md'),
      'utf8',
    );
    // Named guard section.
    expect(body).toMatch(/Execute-signal guard/);
    // Lists the execute-signal words canonically.
    expect(body.toLowerCase()).toMatch(/fix/);
    expect(body.toLowerCase()).toMatch(/implement/);
    expect(body.toLowerCase()).toMatch(/close the gaps/);
    expect(body.toLowerCase()).toMatch(/write the tests/);
    // Forbids the A/B/C/D menu pattern explicitly.
    expect(body.toLowerCase()).toMatch(/menu/);
    expect(body.toLowerCase()).toMatch(/forbidden|do not produce|do not emit/);
    // Keeps the policy short — steering should not bloat.
    // Cap bumped alongside each added guard:
    //   90 → 120 (progress-checklist guard)
    //   120 → 135 (mechanical-fixes helper block)
    //   135 → 150 (finalize.sh mandate)
    // Any future bump requires a clear reason.
    const lineCount = body.split('\n').length;
    expect(lineCount).toBeLessThan(150);
  });

  it('audit-remediate Step 5 delegates to steering guard (no duplicated list)', () => {
    const body = fs.readFileSync(
      path.join(ORCH, 'audit-and-remediate.md'),
      'utf8',
    );
    // Step 5 body must reference the steering guard as authority.
    const stepIdx = body.indexOf('## STEP 5');
    const nextSection = body.indexOf('\n## ', stepIdx + 10);
    const step5 = body.slice(stepIdx, nextSection > -1 ? nextSection : undefined);
    expect(step5).toMatch(/steering\/library-context\.md/);
    // Should no longer inline the full execute-signal bullet list.
    const bulletMatches = step5.match(/^- "/gm) ?? [];
    expect(bulletMatches.length).toBeLessThan(5);
    // Must forbid the A/B/C/D menu pattern too.
    expect(step5.toLowerCase()).toMatch(/menu/);
  });

  it('executor uuidgen template is unambiguous (no literal $(uuidgen) can slip through)', () => {
    const body = fs.readFileSync(path.join(ORCH, 'executor.md'), 'utf8');
    // The template instruction must explicitly say to substitute the value,
    // and must call out the specific anti-pattern.
    expect(body).toMatch(/do NOT write the literal string "\$\(uuidgen\)"/);
  });

  it('drill-down engine shows good/bad acceptance-criteria examples', () => {
    const body = fs.readFileSync(
      path.join(ORCH, 'drill-down-engine.md'),
      'utf8',
    );
    // Must have a dedicated good-vs-bad block for acceptance criteria.
    expect(body).toMatch(/Acceptance criteria — good vs\. bad|Acceptance criteria good vs bad/i);
    // Must show the canonical bullet shape ("  - ") with multiple
    // bullets and explicitly say the validator counts indented bullets.
    expect(body).toMatch(/counts indented bullets|awk script counts/);
    // Must include a BAD one-sentence / paragraph form as a counter-example.
    expect(body.toLowerCase()).toMatch(/one sentence|paragraph|validator counts 0/);
  });

  it('engines explicitly forbid hand-writing revise-report.md', () => {
    const drill = fs.readFileSync(
      path.join(ORCH, 'drill-down-engine.md'),
      'utf8',
    );
    const audit = fs.readFileSync(
      path.join(ORCH, 'audit-and-remediate.md'),
      'utf8',
    );
    // Both engines must call out the canonical-artifact rule.
    expect(drill.toLowerCase()).toMatch(
      /canonical machine-produced|never hand-write|let the script/,
    );
    expect(audit.toLowerCase()).toMatch(
      /canonical machine-produced|never hand-write|let the script/,
    );
    // Both must name the YAML frontmatter requirement.
    expect(drill).toMatch(/YAML frontmatter|line 1/);
    expect(audit).toMatch(/YAML frontmatter|line 1/);
  });

  it('AGENTS.md has a canonical-artifact rule covering both files', () => {
    const body = fs.readFileSync(
      path.resolve(REPO_ROOT, 'prompts', 'AGENTS.md'),
      'utf8',
    );
    expect(body).toMatch(/Canonical artifacts/);
    expect(body).toMatch(/revise-report\.md/);
    expect(body).toMatch(/execution-log\.md/);
    expect(body).toMatch(/scripts\/revise\.sh/);
    expect(body.toLowerCase()).toMatch(/never hand-write|machine-produced/);
  });

  it('engines point at a concrete revise-gate command (finalize.sh or revise.sh)', () => {
    const drill = fs.readFileSync(
      path.join(ORCH, 'drill-down-engine.md'),
      'utf8',
    );
    const audit = fs.readFileSync(
      path.join(ORCH, 'audit-and-remediate.md'),
      'utf8',
    );
    // drill-down engine now names finalize.sh as the single command
    // (it wraps revise.sh + mechanical auto-fixers).
    expect(drill).toMatch(/bash scripts\/(finalize|revise)\.sh/);
    expect(audit).toMatch(/bash scripts\/revise\.sh/);
    // Must tell the agent NOT to hand-edit files — regenerate via engine.
    expect(drill.toLowerCase()).toMatch(
      /do not.*manually|do not hand-edit|regenerate.*via/,
    );
    expect(audit.toLowerCase()).toMatch(/regenerate/);
  });

  it('revise.sh exists, is executable, and writes revise-report.md', () => {
    const script = path.resolve(REPO_ROOT, 'scripts', 'revise.sh');
    expect(fs.existsSync(script)).toBe(true);
    expect((fs.statSync(script).mode & 0o111) !== 0).toBe(true);
    const body = fs.readFileSync(script, 'utf8');
    // Must write revise-report.md explicitly.
    expect(body).toMatch(/revise-report\.md/);
    // Must exit non-zero on validator failure.
    expect(body).toMatch(/exit 1/);
    // Must emit a YAML frontmatter with executor_gate.
    expect(body).toMatch(/executor_gate/);
  });

  it('executor preflight now uses revise.sh (not just the bare validator)', () => {
    const body = fs.readFileSync(path.join(ORCH, 'executor.md'), 'utf8');
    expect(body).toMatch(/bash scripts\/revise\.sh/);
  });

  it('executor has a hard preflight gate that checks companion artifacts', () => {
    const body = fs.readFileSync(path.join(ORCH, 'executor.md'), 'utf8');
    expect(body).toMatch(/## Preflight gate/);
    // Must explicitly refuse without the gate passing.
    expect(body).toMatch(/refuse/i);
    // Must name revise.sh as the preflight command (wraps validator +
    // writes revise-report.md atomically).
    expect(body).toMatch(/bash scripts\/revise\.sh/);
    // Must name the specific failure modes.
    expect(body).toMatch(/external-accounts\.md/);
    expect(body).toMatch(/revise-report\.md/);
    // Must explicitly forbid a "let's just start with what we have" path.
    // Body wraps across lines, so tolerate whitespace-or-newline.
    expect(body.toLowerCase()).toMatch(/let's\s+just\s+start/);
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

  it('revise-outputs regeneration is mandatory and not a user choice', () => {
    const body = fs.readFileSync(
      path.join(ORCH, 'revise-outputs.md'),
      'utf8',
    );
    // The regeneration section must be framed as mandatory/not optional.
    expect(body).toMatch(/Regeneration rules \(MANDATORY/);
    // A revise report that has failed checks but no regens is itself a defect.
    expect(body).toMatch(/regenerations_performed: \[\]/);
    expect(body.toLowerCase()).toMatch(/itself a defect/);
    // When surfacing remaining issues, there must NOT be an
    // "accept the violation" user option.
    expect(body).toMatch(/"accept the violation" option|accept.*collapsed/i);
    // Explicitly says the library cannot proceed.
    expect(body.toLowerCase()).toMatch(
      /library cannot proceed|must not run against|never.*ship the shortcut/,
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

  it('drill-down task schema is aligned with audit-and-remediate (Phase 6a)', () => {
    const body = fs.readFileSync(
      path.join(ORCH, 'drill-down-engine.md'),
      'utf8',
    );
    // Phase 6a schema alignment — drill-down must require the same
    // fields as audit-and-remediate: Change type, Precise change, Test.
    expect(body).toMatch(/`change_type`/);
    expect(body).toMatch(/`precise_change`/);
    expect(body).toMatch(/`test`/);
    // Change-type enum values spelled out.
    expect(body).toMatch(/create-new.*modify-existing.*delete.*refactor/);
    // Precise change must require a concrete delta, not a category of work.
    expect(body.toLowerCase()).toMatch(
      /concrete delta|not a category of work/,
    );
    // Test field must require a named test.
    expect(body.toLowerCase()).toMatch(/every task must ship with a named test/);
    // File field must say "exactly ONE" (prevents multi-file collapse).
    expect(body).toMatch(/\*\*exactly ONE\*\*/);
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
    // Both must name the canonical form. The drill-down engine allows
    // "As the <role>" for infrastructure tasks (no direct end-user); the
    // audit engine sticks to the user-story form.
    expect(drill).toMatch(/As[^.]+I (want|need)[^.]+so that/);
    expect(audit).toMatch(/As a.*I want.*so that/);
  });

  it('self-maintain writes outputs to a separate directory', () => {
    const body = fs.readFileSync(path.join(ORCH, 'self-maintain.md'), 'utf8');
    // Must NOT write into prompts/outputs/current — collides with user projects.
    expect(body).toMatch(/prompts\/outputs\/self-maintain/);
    expect(body).toMatch(/field-tests/);
  });

  it('drill-down engine runs the revise gate before handoff', () => {
    const body = fs.readFileSync(
      path.join(ORCH, 'drill-down-engine.md'),
      'utf8',
    );
    const reviseIdx = body.search(/^## Revise Gate/m);
    const handoffIdx = body.search(/^## Handing off to an implementer/m);
    expect(reviseIdx).toBeGreaterThan(-1);
    expect(handoffIdx).toBeGreaterThan(-1);
    expect(reviseIdx).toBeLessThan(handoffIdx);
    // Revise gate must be flagged MANDATORY and use a concrete command.
    expect(body).toMatch(/Revise Gate \(MANDATORY/);
    // finalize.sh is the preferred one-command wrapper; revise.sh is
    // also acceptable since finalize.sh wraps it.
    expect(body).toMatch(/bash scripts\/(finalize|revise)\.sh/);
    // Revise must name executor_gate states.
    expect(body).toMatch(/executor_gate: fail/);
  });

  it('audit-and-remediate runs revise gate at Step 4.5 before Step 5 chain', () => {
    const body = fs.readFileSync(
      path.join(ORCH, 'audit-and-remediate.md'),
      'utf8',
    );
    const step4 = body.search(/^## STEP 4 — Validate/m);
    const step4_5 = body.search(/^## STEP 4\.5 — Revise/m);
    const step5 = body.search(/^## STEP 5 — Chain to execution/m);
    expect(step4).toBeGreaterThan(-1);
    expect(step4_5).toBeGreaterThan(-1);
    expect(step5).toBeGreaterThan(-1);
    expect(step4).toBeLessThan(step4_5);
    expect(step4_5).toBeLessThan(step5);
    // Step 4.5 must be mandatory and use the concrete shell command.
    expect(body).toMatch(/STEP 4\.5.*MANDATORY/);
    expect(body).toMatch(/bash scripts\/revise\.sh/);
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

  it('audit-and-remediate has a Step 5 that chains to the executor', () => {
    const body = fs.readFileSync(
      path.join(ORCH, 'audit-and-remediate.md'),
      'utf8',
    );
    expect(body).toMatch(/STEP 5/);
    expect(body.toLowerCase()).toMatch(/chain to execution/);
    // The execute-signal word list now lives in steering; Step 5 must
    // reference it rather than duplicate it.
    expect(body).toMatch(/executor\.md/);
    expect(body).toMatch(/steering\/library-context\.md/);
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
