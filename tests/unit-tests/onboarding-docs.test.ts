import { describe, expect, it } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
const root = path.resolve(__dirname, '..', '..');
const read = (name: string) => fs.readFileSync(path.join(root, name), 'utf8');

describe('outcome onboarding', () => {
  it('asks for only the brief and documents restraint rather than automatic product expansion', () => {
    const body = read('MY_PROJECT.md.template');
    const required = [...body.matchAll(/^##\s+.*\(required\b/gim)];
    expect(required).toHaveLength(1);
    expect(required[0][0]).toMatch(/Brief/);
    expect(body).toMatch(/other fields are optional/);
    expect(body).toMatch(/smallest supported platform\/capability set/);
    expect(body).toContain('working_copy/');
    expect(body).toMatch(/Scope exclusions or deferrals/);
    expect(body).toMatch(/Deferral keeps the requirement visible/);
  });

  it('gives copyable startup and resume prompts without destructive recovery defaults', () => {
    const body = read('QUICK_START.md');
    const blocks = body.match(/```text\n[\s\S]*?```/g) ?? [];
    expect(blocks).toHaveLength(2);
    expect(blocks[0]).toContain('ai-agent-entry-point.md');
    expect(blocks[0]).toMatch(/full requested scope/);
    expect(blocks[0]).toMatch(/first value and recovery/);
    expect(blocks[0]).toMatch(/Plan and implement/);
    expect(blocks[0].trim().split(/\s+/).length).toBeLessThanOrEqual(55);
    expect(body).toMatch(/Plan-only.*review stops persist/);
    expect(body).toMatch(/independent reviewer must actually be distinct/i);
    expect(blocks[1]).toContain('Continue where you left off');
    expect(body).toMatch(/Do not delete output or application state/);
  });

  it.each(['README.md', 'QUICK_START.md'])('%s documents the shared stages and links the canonical contract', name => {
    const body = read(name);
    expect(body).toContain('delivery-contract.md');
    for (const stage of ['plan', 'execute', 'advance', 'release']) expect(body).toContain(`--stage ${stage}`);
    expect(body).toContain('delivery-manifest.json');
    expect(body).toMatch(/legacy/i);
    expect(body).toMatch(/https:\/\/github.com\/ameedanxari\/ai-prompt-library/);
    expect(body).not.toMatch(/token cost stays flat|~85%.?token|maximum defaults/i);
  });

  it('documents reproducible installation and current package entry point without claiming verification', () => {
    const body = read('README.md');
    expect(body).toContain('QUICK_START.md');
    expect(body).toContain('git clone --depth 1');
    expect(body).toContain('npm install --save-dev ai-prompt-library');
    expect(body).toContain('ln -sfn node_modules/ai-prompt-library .ai-prompts');
    expect(body).toContain('npx ai-prompt-validate-delivery');
    expect(body).toContain('Node.js 20+');
    expect(body).toContain('Python 3');
    expect(body).toContain('Bash');
    expect(body).toContain('npm run validate:release');
    expect(body).toContain('dry-run package contents');
    expect(body).toContain('Treat `npm test` as the source of truth');
    expect(body).not.toMatch(/\b\d+ tests pass\b/);
  });

  it('documents required authority, actual target evidence and honest external limitations', () => {
    const body = read('MY_PROJECT.md.template') + read('QUICK_START.md');
    expect(body).toMatch(/Execution permission is separate from design\/release acceptance/);
    expect(body).toMatch(/actual composed-screen captures/);
    expect(body).toMatch(/real consumer\/operational evidence/);
    expect(body).toMatch(/production integration\/release duties open/);
    expect(body).toMatch(/distinct context and trustworthy receipt provenance/);
    expect(body).toMatch(/do not authorize charges, publishing, infrastructure applies or destructive drills/);
  });
});
