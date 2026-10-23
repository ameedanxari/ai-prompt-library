import { describe, expect, it } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
const root = path.resolve(__dirname, '..', '..');
const read = (name: string) => fs.readFileSync(path.join(root, 'prompts', 'review', name), 'utf8');
const dimensions = ['intent-fidelity-review.md', 'implementation-correctness-review.md', 'functional-validation-designer.md', 'integration-composition-review.md', 'adversarial-edge-case-review.md', 'evidence-quality-audit.md', 'user-outcome-validation.md', 'content-experience-review.md'];

describe('semantic review source and authority contract', () => {
  it.each(dimensions)('%s remains a specialized on-demand review with an output', name => {
    expect(read(name)).toMatch(/^# \S/);
    expect(read(name)).toMatch(/Output|output/);
  });
  it('retains independent context, dissent and honest completion projections', () => {
    const text = read('README.md');
    expect(text).toMatch(/independent context/i);
    expect(text).toMatch(/implementation narrative/i);
    expect(text).toMatch(/dissent/i);
    expect(text).toContain('verified_complete');
    expect(text).toMatch(/Reports project the manifest/);
    expect(text).toMatch(/self-authored identity\/approval flags are insufficient/);
  });
  it('preserves finding/source lineage in bounded repair rather than per-artifact expansion', () => {
    const audit = fs.readFileSync(path.join(root, 'prompts/orchestrators/audit-and-remediate.md'), 'utf8');
    const planner = read('remediation-planner.md');
    expect(audit).toMatch(/Preserve semantic finding IDs, original requirement IDs and outcome\/check lineage/);
    expect(audit).toMatch(/current post-fix evidence/);
    expect(planner).toMatch(/every finding\/requirement\/outcome/);
    expect(planner).toMatch(/five units\/4,000/);
    expect(planner).toMatch(/eight units\/6,000/);
    expect(planner).toMatch(/runtime, tests, docs, config and assets/);
    expect(planner).toMatch(/Do not materialize.*exhaustive task files/);
  });
  it('does not resolve missing behavior or hard obligations via an owner-decision row', () => {
    const synthesis = read('review-synthesis.md');
    expect(synthesis).toMatch(/cannot prove missing behavior/);
    expect(synthesis).toMatch(/waive non-waivable duties/);
    expect(synthesis).toMatch(/Retain exclusions as exclusions/);
    expect(read('completion-challenge.md')).toMatch(/Owner decisions do not prove behavior/);
  });
  it('loads review dimensions only when selected by semantic review', () => {
    const entry = fs.readFileSync(path.join(root, 'prompts/orchestrators/ai-agent-entry-point.md'), 'utf8');
    expect(entry).toContain('semantic-review-and-validation.md');
    for (const dimension of dimensions) expect(entry).not.toContain(dimension);
  });
});
