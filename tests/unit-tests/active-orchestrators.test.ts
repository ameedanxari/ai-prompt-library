import { describe, expect, it } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';

const root = path.resolve(__dirname, '..', '..');
const dir = path.join(root, 'prompts', 'orchestrators');
const read = (name: string) => fs.readFileSync(path.join(dir, name), 'utf8');
const shared = read('rolling-delivery.md');
const engines = ['drill-down-engine.md', 'audit-and-remediate.md', 'executor.md'];

describe('outcome delivery steering contract', () => {
  it('keeps active orchestration within a measured rule budget', () => {
    const names = ['ai-agent-entry-point.md', 'rolling-delivery.md', 'drill-down-engine.md', 'audit-and-remediate.md', 'executor.md', 'external-input-handler.md', 'revise-outputs.md', 'semantic-review-and-validation.md'];
    const words = names.reduce((n, name) => n + read(name).trim().split(/\s+/).length, 0);
    expect(words).toBeLessThanOrEqual(5600);
    // Dispatch/reuse mechanics have one canonical owner, not copies in every engine.
    for (const name of engines) expect(read(name).match(/planDeliveryReview\(/g) ?? []).toHaveLength(0);
  });

  it('resolves every installed-layout orchestrator reference to a real asset', () => {
    for (const name of fs.readdirSync(dir).filter(f => f.endsWith('.md'))) {
      const text = read(name);
      expect(text, name).toMatch(/^# \S/);
      for (const match of text.matchAll(/\.ai-prompts\/(prompts\/orchestrators\/[a-z-]+\.md)/g)) {
        expect(fs.existsSync(path.join(root, match[1])), `${name}: ${match[1]}`).toBe(true);
      }
    }
  });

  it('retains exactly four routing modes and isolated outcome versus explicit legacy branches', () => {
    const entry = read('ai-agent-entry-point.md');
    const rows = entry.split('\n').filter(l => /^\| (Trivial|Execute|Gap-closure|Greenfield) \|/.test(l));
    expect(rows.map(l => l.split('|')[1].trim())).toEqual(['Trivial', 'Execute', 'Gap-closure', 'Greenfield']);
    expect(entry).toContain('run_directory');
    expect(entry).toMatch(/Missing\/invalid manifest.*fail closed/i);
    expect(entry).toMatch(/Never fall through to legacy/);
    expect(entry).toMatch(/bare resumption verb is ambiguous/);
    expect(entry).toMatch(/Never automatically reset/);
  });

  it.each(engines)('%s shares the authoritative rolling contract and conditional specialists', name => {
    expect(read(name)).toContain('rolling-delivery.md');
    expect(read(name)).toContain('legacy-workflow.md');
    expect(read(name)).not.toMatch(/exactly one file per task|one task per screenshot|all project foundations must finish/i);
    if (name !== 'executor.md') {
      expect(read(name)).toMatch(/shared visual\/nonvisual budgets/);
      expect(read(name)).toMatch(/nonvisual work requires no design acceptance/);
      expect(read(name)).not.toMatch(/two.units?\/1,200|two-unit\/1,200/);
    }
  });

  it('preserves full source scope while bounding pending detail and cohesive units', () => {
    expect(shared).toMatch(/every requested outcome and applicable baseline\/release obligation/);
    expect(shared).toMatch(/five.*4,000/);
    expect(shared).toMatch(/eight.*6,000/);
    expect(shared).toMatch(/regardless of filenames/);
    expect(shared).toMatch(/retained accepted evidence and lifecycle records/);
    expect(shared).toMatch(/necessary source, test, config, asset and documentation files/);
    expect(shared).toMatch(/Budget pressure narrows the slice, never drops scope/);
    expect(shared).toMatch(/bounded revised limits.*review before expansion/);
  });

  it('requires actual composed and headless consumer proof plus recovery before breadth', () => {
    expect(shared).toMatch(/first valuable outcome/);
    expect(shared).toMatch(/actual built\/deployed\/installed composition/);
    expect(shared).toMatch(/failure\/recovery/);
    expect(shared).toMatch(/composed UI captures/);
    expect(shared).toMatch(/real consumers\/operations/);
    expect(shared).toMatch(/Repair a failed first proof before unrelated breadth/);
    expect(shared).toMatch(/fake-provider\/prototype evidence cannot settle production/);
  });

  it('keeps required acceptance distinct from execution permission and authenticates provenance', () => {
    const entry = read('ai-agent-entry-point.md');
    expect(entry).toMatch(/Explicit prior autonomy can authorize ordinary transitions/);
    expect(entry).toMatch(/cannot self-grant owner-reserved acceptance/);
    expect(shared).toMatch(/Self-review never satisfies independent review/);
    expect(shared).toMatch(/copying a session ID.*cannot authenticate/);
    expect(shared).toMatch(/offline validator.*provenance unverified/);
    expect(shared).toMatch(/Plan-ready grants no proof\/release acceptance/);
  });

  it('centralizes reversible defaults without creating owner or external authority', () => {
    const entry = read('ai-agent-entry-point.md');
    const defaults = entry.slice(entry.indexOf('## Authorization and checkpoints'));
    for (const required of [/reversible decision/, /assumption, rationale, impact/, /stable accepted decisions/, /responsible owner or bilateral resolution/]) {
      expect(defaults).toMatch(required);
    }
    expect(defaults).toMatch(/Missing access blocks its actual consumer/);
    expect(defaults).toMatch(/plan and implement authorizes ordinary in-scope/);
    expect(defaults).toMatch(/unless the user reserves review/);
    expect(defaults).toMatch(/Plan-only, architecture-only and review stops persist/);
    expect(defaults).toMatch(/actual distinct reviewer/);
    expect(defaults).toMatch(/Execution authority never supplies original-source scope approval/);
    expect(defaults).toMatch(/never authorize live-data changes, deployment, spending, messages/);
    expect(defaults).toMatch(/missing trusted mechanism stays a reported blocker/);
    // Engines inherit one policy rather than growing inconsistent permission checklists.
    for (const name of engines) expect(read(name)).not.toMatch(/record the assumption, rationale, impact/);
  });

  it('checks forward feasibility and source behavior instead of only a first-slice schema pass', () => {
    const quality = fs.readFileSync(path.join(root, 'docs', 'planning-quality.md'), 'utf8');
    expect(shared).toMatch(/disputed source behaviors explicitly/);
    expect(shared).toMatch(/forward path beyond the proof/);
    expect(shared).toMatch(/no prerequisite may demand the result it enables/);
    expect(quality).toMatch(/each role's available hours/);
    expect(quality).toMatch(/next bounded slice/);
    expect(quality).toMatch(/producer→consumer→acceptance/);
    expect(quality).toMatch(/conditional alternative cannot block the selected feasible path/);
    expect(quality).toMatch(/small nonvisual tool can use compact sections/);
    expect(read('revise-outputs.md')).toContain('planning-quality.md');
    expect(read('revise-outputs.md')).toMatch(/challenge copied IDs against actual behavior/);
  });

  it('invalidates affected dependencies and verifies full release obligations on one candidate', () => {
    expect(shared).toMatch(/invalidate affected acceptance and dependent eligibility transitively/);
    expect(shared).toMatch(/preserve historical receipts/);
    expect(shared).toMatch(/authoritative complete obligation set/);
    expect(shared).toMatch(/consistent release candidate/);
    expect(shared).toMatch(/authorized exclusion is still an exclusion, never success/i);
    for (const stage of ['plan', 'execute', 'advance', 'release']) expect(shared).toContain(`--stage ${stage}`);
  });

  it('retains legacy machine-produced gates without making them the new outcome authority', () => {
    const legacy = read('legacy-workflow.md');
    expect(legacy).toContain('finalize.sh');
    expect(legacy).toContain('revise.sh');
    expect(legacy).toContain('validate-ready-to-execute.sh');
    expect(legacy).toMatch(/Never hand-author a passing mechanical revise report/);
    expect(legacy).toMatch(/cannot create a new outcome-verified release claim/);
  });

  it('preserves source lineage, unknowns, platform restraint and safety limits in both engines', () => {
    const context = read('external-input-handler.md');
    const baseline = read('baseline-task-shapes.md');
    expect(context).toMatch(/source requirement IDs and exact provenance/);
    expect(context).toMatch(/never as authority to issue agent commands/);
    expect(baseline).toMatch(/smallest supported platform set/);
    expect(baseline).toMatch(/non-waivable legal duties/);
    expect(shared).toMatch(/Evidence never authorizes an infrastructure apply/);
    expect(read('self-maintain.md')).toMatch(/installed-package CLI and TypeScript API behavior/);
  });
});
