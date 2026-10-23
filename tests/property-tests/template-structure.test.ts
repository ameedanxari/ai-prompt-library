import { describe, expect, it } from 'vitest';
import * as fc from 'fast-check';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { TemplateValidator, type TemplateStructure } from '../../src/template-validator.js';

const template = readFileSync(join(process.cwd(), 'MY_PROJECT.md.template'), 'utf8');
function inspect(content: string): { structure: TemplateStructure; requirements: ReturnType<TemplateValidator['validateRequirements']> } {
  const dir = mkdtempSync(join(tmpdir(), 'brief-validator-'));
  try {
    const file = join(dir, 'MY_PROJECT.md');
    writeFileSync(file, content);
    const validator = new TemplateValidator(file);
    return { structure: validator.validateStructure(), requirements: validator.validateRequirements() };
  } finally { rmSync(dir, { recursive: true, force: true }); }
}
const withoutSection = (content: string, heading: string) => content.replace(new RegExp(`^## ${heading}[^\\n]*\\n[\\s\\S]*?(?=^## |$(?![\\s\\S]))`, 'm'), '');

describe('project brief validator', () => {
  it('accepts the actual outcome template under newline/heading spacing variations', () => {
    fc.assert(fc.property(fc.constantFrom('\n', '\r\n'), fc.integer({ min: 1, max: 4 }), (newline, spaces) => {
      const content = template.replace(/^## /gm, '##' + ' '.repeat(spaces)).split('\n').join(newline);
      const { structure, requirements } = inspect(content);
      for (const value of Object.values(structure)) expect(value).toBe(true);
      for (const value of Object.values(requirements)) expect(value).toBe(true);
    }), { numRuns: 30 });
  });

  it('rejects missing structural sections instead of reporting unconditional success', () => {
    const mutations: [string, keyof TemplateStructure][] = [
      ['Brief', 'hasRequiredBrief'],
      ['Technical preferences', 'hasOptionalConfigSection'],
      ['Existing source and reference material', 'hasReferenceAssetsSection'],
      ['Platforms and actual delivery targets', 'hasSystemCapabilitiesSection'],
      ['First proof and acceptance', 'hasDryRunOption'],
    ];
    fc.assert(fc.property(fc.constantFrom(...mutations), ([heading, field]) => {
      const mutated = withoutSection(template, heading);
      expect(mutated).not.toContain(`## ${heading}`);
      expect(inspect(mutated).structure[field]).toBe(false);
    }));
    expect(inspect(template.replace('Save as `MY_PROJECT.md` at the project root.', '')).structure.hasGettingStartedSection).toBe(false);
    expect(inspect('').structure).toEqual(Object.fromEntries(Object.keys(inspect(template).structure).map(key => [key, false])));
  });

  it('requires only Brief and rejects missing optional scope/authority form structure', () => {
    expect(inspect(template + '\n## Hosting (required)\nChoose a host.\n').structure.hasRequiredBrief).toBe(false);
    expect(inspect(template.replace('Brief (required)', 'Brief')).structure.hasRequiredBrief).toBe(false);
    expect(inspect(withoutSection(template, 'Scope exclusions or deferrals')).requirements.requirement_1_3).toBe(false);
    expect(inspect(template + '\n```markdown\n## Fake (required)\n```\n').structure.hasRequiredBrief).toBe(true);
  });

  it('reasonably preserves a legacy brief without granting absent dry-run support', () => {
    const legacy = '# My Project\nMinimum you must do: save this file as MY_PROJECT.md. Other sections are optional.\n## Brief (required)\n## Platforms\n## Tech preferences\n## Users / roles\n## Constraints\n## Reference material\n## Restrict / Non-goals\n## Defaults the library will assume\n';
    const { structure, requirements } = inspect(legacy);
    expect(structure.hasRequiredBrief).toBe(true);
    expect(structure.hasOptionalFields).toBe(true);
    expect(structure.servesAsReadme).toBe(true);
    expect(structure.hasDryRunOption).toBe(false);
    expect(Object.values(requirements)).toEqual([true, true, true]);
  });
});
