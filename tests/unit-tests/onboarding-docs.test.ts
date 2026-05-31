/**
 * Onboarding-doc invariants
 *
 * The user-facing onboarding docs (README, QUICK_START, MY_PROJECT.md
 * template) have three invariants that must be preserved:
 *
 *   1. MY_PROJECT.md template marks only Brief as required; every other
 *      section is optional with a default documented.
 *   2. QUICK_START has a single copy-paste prompt block and the prompt
 *      asks the user exactly ONE question (the brief).
 *   3. README points users at QUICK_START first.
 */

import { describe, it, expect } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';

const REPO_ROOT = path.resolve(__dirname, '..', '..');
const readRoot = (name: string): string =>
  fs.readFileSync(path.join(REPO_ROOT, name), 'utf8');

describe('MY_PROJECT.md.template', () => {
  const body = readRoot('MY_PROJECT.md.template');

  it('marks exactly one section as required: Brief', () => {
    // Exactly one `## ... (required ...)` heading.
    const requiredHeadings = [...body.matchAll(/^##\s+.*\(required\b/gim)];
    expect(requiredHeadings).toHaveLength(1);
    expect(requiredHeadings[0][0].toLowerCase()).toMatch(/brief/);
  });

  it('documents the default platforms and production-readiness baseline', () => {
    expect(body.toLowerCase()).toMatch(/web \+ android \+ ios|web.*android.*ios/);
    expect(body.toLowerCase()).toMatch(/production[- ]readiness baseline/);
  });

  it('tells users to drop reference material into working_copy/', () => {
    expect(body).toMatch(/working_copy/);
  });

  it('has a Restrict section so users can opt out of baseline topics', () => {
    expect(body).toMatch(/##\s+Restrict/);
  });
});

describe('QUICK_START.md', () => {
  const body = readRoot('QUICK_START.md');

  it('contains a fenced code block with the copy-paste prompt', () => {
    const blocks = body.match(/```[\s\S]*?```/g) ?? [];
    expect(blocks.length).toBeGreaterThanOrEqual(1);
    // The main prompt block should reference all the key steps.
    const main = blocks.find((b) => b.includes('.ai-prompts/'));
    expect(main).toBeDefined();
    expect(main!).toMatch(/git submodule/);
    expect(main!).toMatch(/bootstrap-project-integration/);
    expect(main!).toMatch(/ai-agent-entry-point/);
  });

  it('instructs the agent to ask exactly ONE question to the user', () => {
    // Must say "ONE question" (or equivalent) prominently in the prompt.
    expect(body).toMatch(/exactly ONE question|one question/i);
    // Must NOT instruct the agent to ask multiple questions.
    expect(body).not.toMatch(/ask.*four questions|ask.*four\s+of/i);
  });

  it('covers recovery prompts for stuck and reset cases', () => {
    expect(body.toLowerCase()).toMatch(/continue where you left off/);
    expect(body.toLowerCase()).toMatch(/force reset/);
  });

  it('documents npm install, npx gates, prerequisites, and API usage', () => {
    expect(body).toMatch(/npm install --save-dev ai-prompt-library/);
    expect(body).toMatch(/ln -sfn node_modules\/ai-prompt-library \.ai-prompts/);
    expect(body).toMatch(/npx ai-prompt-ready/);
    expect(body).toMatch(/npx ai-prompt-finalize/);
    expect(body).toMatch(/npx ai-prompt-validate-release-readiness/);
    expect(body).toMatch(/Node\.js 20\+/);
    expect(body).toMatch(/Python 3/);
    expect(body).toMatch(/Bash/);
    expect(body).toMatch(/buildTaskContractReportForDirectory/);
    expect(body).toMatch(/ai-prompt-library\/task-contract/);
  });

  it('lists the readiness artifacts now produced before execution', () => {
    for (const artifact of [
      'task-schema-repair-report.md',
      'path-ledger.md',
      'delivery-order.md',
      'task-contract.json',
      'task-graph.json',
      'phase-order-report.md',
      'baseline-task-coverage.md',
      'user-review-checkpoints.md',
      'ready-to-execute-report.md',
    ]) {
      expect(body, artifact).toMatch(new RegExp(escapeRegExp(artifact)));
    }
  });
});

describe('README.md', () => {
  const body = readRoot('README.md');

  it('points users at QUICK_START.md', () => {
    expect(body).toMatch(/QUICK_START\.md/);
  });

  it('documents the npm package surface and prerequisites', () => {
    expect(body).toMatch(/npm install --save-dev ai-prompt-library/);
    expect(body).toMatch(/ln -sfn node_modules\/ai-prompt-library \.ai-prompts/);
    expect(body).toMatch(/npx ai-prompt-ready/);
    expect(body).toMatch(/npx ai-prompt-validate-task-contract/);
    expect(body).toMatch(/npx ai-prompt-validate-release-readiness/);
    expect(body).toMatch(/npx ai-prompt-generate-design-review/);
    expect(body).toMatch(/Node\.js 20\+/);
    expect(body).toMatch(/npm/);
    expect(body).toMatch(/Python 3/);
    expect(body).toMatch(/Bash/);
  });

  it('shows the public task-contract API example', () => {
    expect(body).toMatch(/import \{ buildTaskContractReportForDirectory \} from 'ai-prompt-library\/task-contract'/);
    expect(body).toMatch(/buildTaskContractReportForDirectory\('prompts\/outputs\/current'\)/);
  });

  it('does not pin a stale exact test count', () => {
    expect(body).not.toMatch(/\b789 tests pass\b/);
    expect(body).toMatch(/Treat `npm test` as the source of truth/);
  });

  it('documents release readiness validation before tags', () => {
    expect(body).toMatch(/npm run validate:release/);
    expect(body).toMatch(/package metadata/);
    expect(body).toMatch(/dry-run package contents|dry-run package/);
  });
});

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
