import { describe, expect, it } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';

const REPO_ROOT = path.resolve(__dirname, '..', '..');
const REVIEW_DIR = path.join(REPO_ROOT, 'prompts', 'review');
const PROMPTS = [
  'intent-fidelity-review.md',
  'implementation-correctness-review.md',
  'functional-validation-designer.md',
  'integration-composition-review.md',
  'adversarial-edge-case-review.md',
  'evidence-quality-audit.md',
  'user-outcome-validation.md',
  'content-experience-review.md',
  'review-synthesis.md',
  'completion-challenge.md',
  'remediation-planner.md',
];

describe('semantic review prompt suite', () => {
  it('ships the complete specialized prompt set', () => {
    expect(fs.readdirSync(REVIEW_DIR).sort()).toEqual([...PROMPTS, 'README.md'].sort());
    for (const prompt of PROMPTS) {
      const body = fs.readFileSync(path.join(REVIEW_DIR, prompt), 'utf8');
      expect(body, prompt).toMatch(/^# \S/);
      expect(body, prompt).toMatch(/Output|output/);
    }
  });

  it('defines reviewer isolation, finding lifecycle, dissent, and completion rules', () => {
    const contract = fs.readFileSync(path.join(REVIEW_DIR, 'README.md'), 'utf8');

    expect(contract).toMatch(/independent context/i);
    expect(contract).toMatch(/implementation narrative/i);
    expect(contract).toMatch(/critical.*high|high.*critical/is);
    expect(contract).toMatch(/dissent/i);
    expect(contract).toMatch(/verified_complete/);
    expect(contract).toMatch(/remediation-plan\.md/);
  });

  it('keeps specialized prompts on demand rather than startup-loaded', () => {
    const entryPoint = fs.readFileSync(
      path.join(REPO_ROOT, 'prompts', 'orchestrators', 'ai-agent-entry-point.md'),
      'utf8',
    );

    expect(entryPoint).not.toMatch(/prompts\/review\/(?:intent|implementation|functional|integration|adversarial|evidence|user-outcome)/);
    expect(entryPoint).toMatch(/semantic-review-and-validation\.md/);
  });

  it('preserves semantic finding IDs when audit creates remediation work', () => {
    const audit = fs.readFileSync(
      path.join(REPO_ROOT, 'prompts', 'orchestrators', 'audit-and-remediate.md'),
      'utf8',
    );

    expect(audit).toMatch(/finding IDs/i);
    expect(audit).toMatch(/gap-list\.md/);
    expect(audit).toMatch(/remediation-/);
  });
});
