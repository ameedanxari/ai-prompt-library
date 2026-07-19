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
  'research-and-fanout-policy.md',
  'revise-outputs.md',
  'baseline-task-shapes.md',
  'schema-alignment-pass.md',
  'semantic-review-and-validation.md',
  'self-maintain.md',
  // Stream A upstream planning artifacts (run from drill-down-engine):
  'product-vision.md',
  'architecture-blueprint.md',
  'ux-blueprint.md',
  'content-system.md',
  'release-plan.md',
  'store-submission.md',
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
    expect(body).toMatch(/semantic-review-and-validation\.md/);
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
    expect(body).toMatch(/\.ai-prompts\/scripts\/reset-integration\.sh --yes/);
  });

  it('steering guard scopes execute signals to existing validated plans and forbids A/B/C/D menus', () => {
    const body = fs.readFileSync(
      path.resolve(REPO_ROOT, 'prompts', 'steering', 'library-context.md'),
      'utf8',
    );
    // Named guard section.
    expect(body).toMatch(/Execute-signal guard/);
    // Lists the execute-signal words canonically, but only for an existing plan.
    expect(body.toLowerCase()).toMatch(/validated plan already exists/);
    expect(body.toLowerCase()).toMatch(/fix/);
    expect(body.toLowerCase()).toMatch(/implement/);
    expect(body.toLowerCase()).toMatch(/close the gaps/);
    expect(body.toLowerCase()).toMatch(/write the tests/);
    expect(body.toLowerCase()).toMatch(/do not bypass checkpoints/);
    // Forbids the A/B/C/D menu pattern explicitly.
    expect(body.toLowerCase()).toMatch(/menu/);
    expect(body.toLowerCase()).toMatch(/forbidden|do not produce|do not emit/);
    // Keeps the policy short — steering should not bloat.
    // Cap bumped alongside each added guard:
    //   90 → 120 (progress-checklist guard)
    //   120 → 135 (mechanical-fixes helper block)
    //   135 → 150 (finalize.sh mandate)
    //   150 → 180 (harness-recovery + auto-commit pipeline links —
    //              executor-only, advertised here so happy-path planning
    //              sessions know they don't need to load them)
    // Any future bump requires a clear reason.
    const lineCount = body.split('\n').length;
    expect(lineCount).toBeLessThan(180);
  });

  it('audit-remediate Step 5 is a planning hard stop, not an auto-executor chain', () => {
    const body = fs.readFileSync(
      path.join(ORCH, 'audit-and-remediate.md'),
      'utf8',
    );
    // Step 5 must require user review before executor handoff.
    const stepIdx = body.indexOf('## STEP 5');
    const nextSection = body.indexOf('\n## ', stepIdx + 10);
    const step5 = body.slice(stepIdx, nextSection > -1 ? nextSection : undefined);
    expect(step5.toLowerCase()).toMatch(/planning hard stop/);
    expect(step5).toMatch(/Say \*\*Execute\*\*/);
    expect(step5).toMatch(/Do NOT auto-invoke/);
    // Should not inline the full execute-signal bullet list.
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
    expect(drill).toMatch(/bash \.ai-prompts\/scripts\/(finalize|revise)\.sh/);
    expect(audit).toMatch(/bash \.ai-prompts\/scripts\/(finalize|revise)\.sh/);
    // Must tell the agent NOT to hand-edit files — regenerate via engine.
    expect(drill.toLowerCase()).toMatch(
      /do not.*manually|do not hand-edit|regenerate.*via/,
    );
    expect(audit.toLowerCase()).toMatch(/regenerate/);
  });

  it('drill-down blocks expansion until each product surface has a production walking skeleton', () => {
    const body = fs.readFileSync(path.join(ORCH, 'drill-down-engine.md'), 'utf8');
    expect(body).toMatch(/tasks-mvp-walking-skeleton-<surface>\.md/);
    expect(body).toMatch(/production composition root/i);
    expect(body).toMatch(/task-type=cross-feature-composition/);
    expect(body).toMatch(/release-gate=mvp-walking-skeleton/);
    expect(body).toMatch(/primary-flow=FLOW-/);
    expect(body).toMatch(/before any `expand` or\s+`polish` task prompt/);
    expect(body).toMatch(/Fixture evidence\s+never satisfies/);
    expect(body).toMatch(/validate-walking-skeleton\.sh/);
  });

  it('audit remediation turns primary-flow fixtures into expiring retirement contracts', () => {
    const body = fs.readFileSync(path.join(ORCH, 'audit-and-remediate.md'), 'utf8');
    expect(body).toMatch(/Composition map.*production.*test-fixture.*screenshot.*preview.*demo/s);
    expect(body).toMatch(/Fixture allowance.*owner=<team\/person>; expiry=<YYYY-MM-DD>/);
    expect(body).toMatch(/Fixture retirement task/);
    expect(body).toMatch(/Release exclusion check/);
    expect(body).toMatch(/Evidence level: ui-fixture/);
    expect(body).toMatch(/production_verification/);
    expect(body).toMatch(/production-wiring integration evidence/);
    expect(body).toMatch(/validate-fixture-isolation\.sh/);
  });

  it('release-plan emits one machine-readable contract for product and package gates', () => {
    const body = fs.readFileSync(path.join(ORCH, 'release-plan.md'), 'utf8');
    expect(body).toMatch(/```release-gates/);
    expect(body).toMatch(/prompts\/outputs\/current\/release-gates\.json/);
    expect(body).toMatch(/GATE-WALKING-SKELETON-001/);
    expect(body).toMatch(/GATE-BETA-001/);
    expect(body).toMatch(/GATE-PRODUCTION-001/);
    expect(body).toMatch(/GATE-PRIVACY-001/);
    expect(body).toMatch(/GATE-STORE-PACKAGE-001/);
    expect(body).toMatch(/requirement and task\s+IDs/);
    expect(body).toMatch(/threshold `100`/);
    expect(body).toMatch(/unchecked Markdown alone is advisory and is forbidden/);
    expect(body).toMatch(/failed hard gate blocks promotion regardless of aggregate score/);
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

  it('executor preflight uses the ready-to-execute gate', () => {
    const body = fs.readFileSync(path.join(ORCH, 'executor.md'), 'utf8');
    expect(body).toMatch(/bash \.ai-prompts\/scripts\/validate-ready-to-execute\.sh/);
    expect(body).toMatch(/ready-to-execute-report\.md/);
  });

  it('executor has a hard preflight gate that checks companion artifacts', () => {
    const body = fs.readFileSync(path.join(ORCH, 'executor.md'), 'utf8');
    expect(body).toMatch(/## Preflight gate/);
    // Must explicitly refuse without the gate passing.
    expect(body).toMatch(/refuse/i);
    // Must name the single readiness command (wraps finalize + revise +
    // graph/order artifact generation).
    expect(body).toMatch(/bash \.ai-prompts\/scripts\/validate-ready-to-execute\.sh/);
    // Must name the specific failure modes.
    expect(body).toMatch(/external-accounts\.md/);
    expect(body).toMatch(/ready-to-execute-report\.md/);
    expect(body).toMatch(/revise-report\.md/);
    expect(body).toMatch(/user-review-checkpoints\.md/);
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
    // Hard requirement: never execute an unready plan.
    expect(body).toMatch(/validate-ready-to-execute\.sh/);
  });

  it('executor requires semantic review before honest handoff', () => {
    const body = fs.readFileSync(path.join(ORCH, 'executor.md'), 'utf8');
    const gate = body.indexOf('## Semantic-review gate');
    const handoff = body.indexOf('## Honest-handoff gate');

    expect(gate).toBeGreaterThan(-1);
    expect(handoff).toBeGreaterThan(gate);
    expect(body).toMatch(/validate-semantic-review\.sh/);
    expect(body).toMatch(/completion-decision\.json/);
  });

  it('executor surfaces design-system review artifacts for feedback', () => {
    const body = fs.readFileSync(path.join(ORCH, 'executor.md'), 'utf8');
    expect(body).toMatch(/docs\/design-system\/review\/index\.html/);
    expect(body).toMatch(/Design-system review handoff/);
    expect(body).toMatch(/visual-review feedback/);
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

  it('executor fail-closes handoff from canonical execution evidence', () => {
    const body = fs.readFileSync(path.join(ORCH, 'executor.md'), 'utf8');

    expect(body).toMatch(/execution-status-record/);
    expect(body).toMatch(/requiredEvidenceLevel/);
    expect(body).toMatch(/testEvidence/);
    expect(body).toMatch(/buildEvidence/);
    expect(body).toMatch(/validate-execution-status\.sh/);
    expect(body).toMatch(/final handoff is forbidden/i);
    expect(body).toMatch(/File existence and path accounting are\s+necessary, but they are never sufficient/);
    expect(body).toMatch(/next_task: null[\s\S]*never upgrades/);
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

  it('baseline-task-shapes covers all baseline topics', () => {
    const body = fs.readFileSync(
      path.join(ORCH, 'baseline-task-shapes.md'),
      'utf8',
    );
    const topics = [
      /onboarding.*consent/i,
      /account identity/i,
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
    expect(body).toMatch(/## Context/);
    expect(body).toMatch(/## What to build/);
    expect(body).toMatch(/## Implementation guidance/);
    expect(body).toMatch(/## Testing approach/);
    // Precise change must require a concrete delta, not a category of work.
    expect(body.toLowerCase()).toMatch(
      /concrete delta|not a category of work/,
    );
    // Test field must require a named test or testing approach.
    expect(body.toLowerCase()).toMatch(/testing approach/);
  });

  it('drill-down preserves requirement, flow, dependency, and artifact-contract IDs', () => {
    const body = fs.readFileSync(
      path.join(ORCH, 'drill-down-engine.md'),
      'utf8',
    );

    expect(body).toMatch(/Feature ID/);
    expect(body).toMatch(/Requirement IDs/);
    expect(body).toMatch(/Flow IDs/);
    expect(body).toMatch(/Feature dependencies/);
    expect(body).toMatch(/Artifact contract/);
    expect(body).toMatch(/Semantic override/);
    expect(body).toMatch(/source.*old.*new.*rationale.*affected_flows.*compensating_evidence.*approval.*scope.*expiry/s);
    expect(body.toLowerCase()).toMatch(/regenerate[\s\S]*step 2\/3/);
  });

  it('drill-down and audit-remediate both require clear closure references', () => {
    const drill = fs.readFileSync(
      path.join(ORCH, 'drill-down-engine.md'),
      'utf8',
    );
    const audit = fs.readFileSync(
      path.join(ORCH, 'audit-and-remediate.md'),
      'utf8',
    );
    // drill-down uses the feature name; audit uses the gap slug.
    expect(drill).toMatch(/Prompt — <Feature Name>/);
    expect(audit).toMatch(/_Closes gap:_/);
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
    const handoffIdx = body.search(/^## ⏸ HARD STOP — Planning complete/im);
    expect(reviseIdx).toBeGreaterThan(-1);
    expect(handoffIdx).toBeGreaterThan(-1);
    expect(reviseIdx).toBeLessThan(handoffIdx);
    // Revise gate must be flagged MANDATORY and use a concrete command.
    expect(body).toMatch(/Revise Gate \(MANDATORY/);
    // finalize.sh is the preferred one-command wrapper; revise.sh is
    // also acceptable since finalize.sh wraps it.
    expect(body).toMatch(/bash \.ai-prompts\/scripts\/(finalize|revise)\.sh/);
    // Revise must name executor_gate states.
    expect(body).toMatch(/executor_gate: fail/);
  });

  it('audit-and-remediate runs revise gate at Step 4.5 before Step 5 hard stop', () => {
    const body = fs.readFileSync(
      path.join(ORCH, 'audit-and-remediate.md'),
      'utf8',
    );
    const step4 = body.search(/^## STEP 4 — Validate/m);
    const step4_5 = body.search(/^## STEP 4\.5 — (Finalize|Revise)/m);
    const step5 = body.search(/^## STEP 5 — Planning hard stop/m);
    expect(step4).toBeGreaterThan(-1);
    expect(step4_5).toBeGreaterThan(-1);
    expect(step5).toBeGreaterThan(-1);
    expect(step4).toBeLessThan(step4_5);
    expect(step4_5).toBeLessThan(step5);
    // Step 4.5 must be mandatory and use the concrete shell command.
    expect(body).toMatch(/STEP 4\.5.*MANDATORY/);
    expect(body).toMatch(/bash \.ai-prompts\/scripts\/(finalize|revise)\.sh/);
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
      /each engine runs its own|inside each engine|engines own the revise gate/
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

  it('audit-and-remediate has a Step 5 planning hard stop before executor handoff', () => {
    const body = fs.readFileSync(
      path.join(ORCH, 'audit-and-remediate.md'),
      'utf8',
    );
    expect(body).toMatch(/STEP 5/);
    expect(body.toLowerCase()).toMatch(/planning hard stop/);
    expect(body).toMatch(/Say \*\*Execute\*\*/);
    expect(body).toMatch(/Do NOT auto-invoke/);
    expect(body).toMatch(/executor\.md/);
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

  it('external-input-handler extracts Design Context and existing theme authority', () => {
    const body = fs.readFileSync(
      path.join(ORCH, 'external-input-handler.md'),
      'utf8',
    );
    expect(body).toMatch(/## Design Context/);
    expect(body).toMatch(/Existing theme authority/);
    expect(body).toMatch(/Tailwind usage/);
    expect(body).toMatch(/Reference\/research needs/);
    expect(body).toMatch(/Redesign requested/);
    expect(body.toLowerCase()).toMatch(/authoritative/);
    expect(body.toLowerCase()).toMatch(/downstream trigger/);
    expect(body.toLowerCase()).toMatch(/redesign\/rebrand/);
  });

  it('both engines preserve existing UI theme precedence', () => {
    const drill = fs.readFileSync(
      path.join(ORCH, 'drill-down-engine.md'),
      'utf8',
    );
    const audit = fs.readFileSync(
      path.join(ORCH, 'audit-and-remediate.md'),
      'utf8',
    );
    expect(drill).toMatch(/existing theme is authoritative/i);
    expect(drill).toMatch(/redesign or rebrand/i);
    expect(drill).toMatch(/Reference\/research needs/);
    expect(drill).toMatch(/docs\/design-system\/review\/index\.html/);
    expect(audit).toMatch(/Existing theme authority/);
    expect(audit).toMatch(/Reference\/research needs/);
    expect(audit).toMatch(/docs\/design-system\/review\/index\.html/);
    expect(audit).toMatch(/redesign\/rebrand/i);
  });

  it('revise-outputs includes the UI design quality gate', () => {
    const body = fs.readFileSync(
      path.join(ORCH, 'revise-outputs.md'),
      'utf8',
    );
    expect(body).toMatch(/C10 — UI design quality/);
    expect(body).toMatch(/UI reference source map/);
    expect(body).toMatch(/ui-reference-source-map\.md/);
    expect(body).toMatch(/Reference\/research needs/);
    expect(body).toMatch(/docs\/design-system\/review\/index\.html/);
    expect(body).toMatch(/OS capability matrix/);
    expect(body).toMatch(/accept the design shortcut/);
  });

  it('drill-down creates central UI reference source maps for greenfield UI', () => {
    const body = fs.readFileSync(
      path.join(ORCH, 'drill-down-engine.md'),
      'utf8',
    );
    expect(body).toMatch(/ui-reference-source-map\.md/);
    expect(body).toMatch(/Reference Category/);
    expect(body).toMatch(/Non-copy Boundary/);
    expect(body).toMatch(/Mobile OS capability matrix/i);
  });

  it('drill-down Step 1 emits production-readiness baseline epics', () => {
    const body = fs.readFileSync(
      path.join(ORCH, 'drill-down-engine.md'),
      'utf8',
    );
    // Every baseline epic must be documented by name in Step 1.
    const baselineTopics = [
      /onboarding.*consent/i,
      /account identity/i,
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
