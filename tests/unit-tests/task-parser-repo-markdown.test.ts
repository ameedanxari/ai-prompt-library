/**
 * Task-contract parser robustness on real repository markdown.
 *
 * The parser meets real-world markdown: orchestrator docs and templates
 * containing fenced code blocks. A fenced code block containing a
 * `##`-like line inside a task section must neither terminate
 * acceptance-bullet collection early nor spawn a phantom task unit.
 */
import { describe, expect, it } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { parsePlanTaskFile } from '../../src/task-contract/task-parser';

const REPO_ROOT = path.resolve(__dirname, '..', '..');

function isFenceDelimiter(line: string): boolean {
  return line.trimStart().startsWith('```');
}

/** 1-based line ranges covered by fenced code blocks. */
function fenceRanges(content: string): Array<[number, number]> {
  const ranges: Array<[number, number]> = [];
  let open: number | null = null;
  content.split(/\r?\n/).forEach((line, i) => {
    if (isFenceDelimiter(line)) {
      if (open === null) open = i + 1;
      else {
        ranges.push([open, i + 1]);
        open = null;
      }
    }
  });
  if (open !== null) ranges.push([open, Number.POSITIVE_INFINITY]);
  return ranges;
}

function inFence(ranges: Array<[number, number]>, lineNumber: number): boolean {
  return ranges.some(([s, e]) => lineNumber >= s && lineNumber <= e);
}

describe('task parser on real markdown', () => {
  it.each([
    ['prompts/orchestrators/audit-and-remediate.md', 'tasks-probe.md'],
    ['MY_PROJECT.md.template', 'tasks-probe.md'],
  ])('parses %s without throwing and creates no units inside fences', (rel, filename) => {
    const content = fs.readFileSync(path.join(REPO_ROOT, rel), 'utf8');
    const ranges = fenceRanges(content);
    let parsed;
    expect(() => {
      parsed = parsePlanTaskFile(filename, content, path.join(REPO_ROOT, rel));
    }).not.toThrow();
    for (const unit of parsed!.units) {
      expect(inFence(ranges, unit.lineNumber)).toBe(false);
    }
  });

  it('ignores task-like headings inside fenced code blocks', () => {
    const content = [
      '## T1 · real task',
      '- **Closes user story:** As a dev, I want x, so that y.',
      '- **Change type:** create-new',
      '- **File:** `src/a.ts`',
      '- **Precise change:** add docs.',
      '- **Acceptance:**',
      '  - First bullet is real.',
      '```',
      '## T9 · phantom inside fence',
      '```',
      '  - Third bullet is real.',
      '- **Test:** `src/a.test.ts`',
      '- **Estimated LOC:** +5',
      '- **Depends on:** none',
      '- **Phase:** mvp',
      '',
    ].join('\n');
    const parsed = parsePlanTaskFile('tasks-probe.md', content);
    // No phantom unit from the fenced heading.
    expect(parsed.units.map((u) => u.id)).toEqual(['T1']);
    // All real bullets collected — the fence does not truncate them.
    const t1 = parsed.units.find((u) => u.id === 'T1');
    expect(t1?.acceptanceBullets).toEqual([
      'First bullet is real.',
      'Third bullet is real.',
    ]);
  });
});
