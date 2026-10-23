import { describe, expect, it } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
const root = path.resolve(__dirname, '..', '..');
const read = (...segments: string[]) => fs.readFileSync(path.join(root, ...segments), 'utf8');

describe('content and actual experience safeguards', () => {
  const content = read('prompts', 'orchestrators', 'content-system.md');
  const shared = read('prompts', 'orchestrators', 'rolling-delivery.md');
  it('keeps engineering/spec language and identifiers out of user-facing copy', () => {
    expect(content).toMatch(/Never display internal specification\/invariant\/delivery vocabulary/);
    expect(content).toMatch(/never derived from identifiers/);
    expect(content).toContain('validate-content-lint.sh');
    expect(content).toMatch(/lint alone is insufficient/);
    expect(content).toMatch(/commercial\/legal.*owner input/);
  });
  it('prevents fixture data being presented as a fresh account’s real data', () => {
    expect(content).toMatch(/fresh ordinary account receives no demo content/);
    expect(content).toMatch(/visibly labelled, without publishing secrets/);
    expect(content).toMatch(/real account-specific roster\/workspace data/);
    expect(content).toMatch(/reject fixture data presented as live/);
  });
  it('connects first value, honest navigation and recovery to actual composed output', () => {
    expect(content).toMatch(/activation milestone.*first useful value/);
    expect(content).toMatch(/never expose an unmarked scaffold/);
    expect(content).toMatch(/rendered fresh\/populated\/recovery states/);
    expect(shared).toMatch(/reachable recovery path/);
    expect(shared).toMatch(/component catalogue alone cannot prove a product journey/);
  });
  it('retains a detailed fresh-account review without forcing accounts on unrelated products', () => {
    const review = read('prompts', 'review', 'content-experience-review.md');
    expect(review).toContain('dimension: content-experience');
    expect(review).toMatch(/fresh-account dry-run/i);
    expect(review).toMatch(/signed-in user appears in their own member\s+roster/i);
    expect(review).toContain('CRITICAL');
    expect(review).toMatch(/actual target\/configuration\/provider mode/);
    expect(read('prompts', 'orchestrators', 'baseline-task-shapes.md')).toMatch(/when accounts or protected roles are required/);
  });
  it('evaluates complete release scope rather than an implementer’s content-only score', () => {
    const release = read('prompts', 'orchestrators', 'release-plan.md');
    expect(release).toMatch(/original source requirement documents/);
    expect(release).toMatch(/Required unproved outcomes prevent release-ready claims/);
    expect(release).toMatch(/one consistent candidate/);
    expect(release).toMatch(/owner\/reviewer acceptance needs trusted provenance/);
  });
});
