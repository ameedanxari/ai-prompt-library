import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const protocol = readFileSync(
  resolve(__dirname, '../../docs/canary-promotion-protocol.md'),
  'utf8',
);

describe('canary promotion protocol', () => {
  it('excludes LumaClean and forbids manual output repair', () => {
    expect(protocol).toMatch(/LumaClean is not a canary/);
    expect(protocol).toMatch(/generated output is never repaired by hand/);
  });

  it.each([
    'Local-First Native Mobile',
    'Web / SaaS',
    'Backend / API',
    'Desktop',
    'Regulated / High-Stakes',
  ])('defines the %s profile contract', (profile) => {
    const section = protocol.split(`### ${profile}`)[1]?.split('\n### ')[0] ?? '';
    expect(section).toMatch(/Artifact types/);
    expect(section).toMatch(/Evidence ladder/);
    expect(section).toMatch(/Baseline concerns/);
    expect(section).toMatch(/Composition/);
    expect(section).toMatch(/Release gates/);
  });

  it('defines the initial synthetic canary matrix', () => {
    expect(protocol).toMatch(/Pocket Pantry/);
    expect(protocol).toMatch(/FixFlow/);
    expect(protocol).toMatch(/HookLedger/);
  });

  it('uses canonical GATE identifiers in the scorecard schema', () => {
    expect(protocol).toMatch(/"id": "GATE-PRODUCTION-PRIMARY-FLOW"/);
  });

  it('requires immutable evidence and reruns from an unchanged brief', () => {
    expect(protocol).toMatch(/immutable run ID/);
    expect(protocol).toMatch(/clean reset/);
    expect(protocol).toMatch(/unchanged original brief/);
    expect(protocol).toMatch(/Do not patch generated canary/);
  });

  it('defines CI stages and dev-to-production promotion gates', () => {
    expect(protocol).toMatch(/`lint`, `unit`, `integration`, `e2e`, `build`,\s+and `publish`/);
    expect(protocol).toMatch(/Development/);
    expect(protocol).toMatch(/Staging/);
    expect(protocol).toMatch(/Production \/ npm publish/);
    expect(protocol).toMatch(/Any red hard gate blocks promotion/);
  });
});
