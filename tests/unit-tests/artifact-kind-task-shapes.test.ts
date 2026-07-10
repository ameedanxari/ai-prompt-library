import { describe, expect, it } from 'vitest';
import { buildTaskContractReport } from '../../src/task-contract/task-contract-report';
import { parsePlanTaskFile } from '../../src/task-contract/task-parser';

function task(options: {
  id?: string;
  title?: string;
  artifactKind: string;
  file: string;
  evidenceLevel: string;
  runtimeReachability?: string;
  dependsOn?: string;
}) {
  return [
    `## ${options.id ?? 'T1'} - ${options.title ?? 'artifact task'}`,
    '- **Closes user story:** As a release owner, I want an explicit artifact, so that publication evidence is reviewable.',
    '- **Change type:** create-new',
    `- **File:** \`${options.file}\``,
    '- **Precise change:** Create the named artifact with provenance and content assertions appropriate to its kind.',
    '- **Acceptance:**',
    '  - The artifact uses its canonical path and schema.',
    '  - The named evidence verifies artifact-specific requirements.',
    '  - No unrelated runtime layers are introduced.',
    `- **Depends on:** ${options.dependsOn ?? 'none'}`,
    '- **Test:** `npm test -- artifact-shape`',
    '- **Estimated LOC:** +20',
    '- **Phase:** polish',
    `- **Artifact kind:** ${options.artifactKind}`,
    '- **Requirement IDs:** REQ-ARTIFACT-001',
    `- **Evidence level:** ${options.evidenceLevel}`,
    `- **Runtime reachability:** ${options.runtimeReachability ?? 'not runtime-reachable'}`,
  ].join('\n');
}

function report(content: string) {
  return buildTaskContractReport([
    parsePlanTaskFile('tasks-artifact.md', content),
  ]);
}

describe('artifact-kind task-shape regressions', () => {
  it.each([
    ['store metadata', 'docs', 'docs/store/app-store-listing.md', 'static'],
    ['privacy inventory', 'docs', 'docs/privacy/data-inventory.md', 'manual-review'],
    ['release notes', 'docs', 'docs/releases/1.0.0.md', 'static'],
    ['package config', 'config', 'config/release/package-metadata.json', 'integration'],
    ['generated scorecard', 'generated-evidence', 'reports/release/scorecard.json', 'integration'],
  ])('accepts artifact-only %s at a non-runtime path', (title, artifactKind, file, evidenceLevel) => {
    const result = report(task({ title, artifactKind, file, evidenceLevel }));

    expect(result.summary.blocked).toBe(false);
    expect(result.issues).toEqual([]);
    expect(result.units[0]).toMatchObject({ artifactKind, filePaths: [file] });
  });

  it.each([
    'ios/App/StoreMetadata.swift',
    'android/app/src/main/kotlin/app/PrivacyInventory.kt',
  ])('rejects a docs artifact moved into platform runtime source: %s', (file) => {
    const result = report(task({
      title: 'store policy',
      artifactKind: 'docs',
      file,
      evidenceLevel: 'static',
    }));

    expect(result.summary.blocked).toBe(true);
    expect(result.issues).toContainEqual(expect.objectContaining({
      code: 'artifact-runtime-path-mismatch',
      canonicalId: 'tasks-artifact.md#T1',
    }));
  });

  it('rejects one mixed docs unit that claims both policy and runtime paths', () => {
    const result = report(task({
      title: 'mixed privacy work',
      artifactKind: 'docs',
      file: 'docs/privacy/policy.md` | `ios/App/PrivacyCoordinator.swift',
      evidenceLevel: 'manual-review',
    }));

    expect(result.summary.blocked).toBe(true);
    expect(result.issues.map((issue) => issue.code)).toContain('artifact-runtime-path-mismatch');
  });

  it('accepts mixed concerns after they are split into typed dependent units', () => {
    const parsed = parsePlanTaskFile('tasks-artifact.md', [
      task({
        id: 'T1',
        title: 'privacy policy',
        artifactKind: 'docs',
        file: 'docs/privacy/policy.md',
        evidenceLevel: 'manual-review',
      }),
      '',
      task({
        id: 'T2',
        title: 'privacy runtime consumer',
        artifactKind: 'runtime-source',
        file: 'ios/App/PrivacyCoordinator.swift',
        evidenceLevel: 'unit',
        runtimeReachability: 'production iOS privacy settings flow',
        dependsOn: 'T1 (uses the reviewed policy contract)',
      }),
    ].join('\n'));
    const result = buildTaskContractReport([parsed]);

    expect(result.summary.blocked).toBe(false);
    expect(result.units.map((unit) => unit.artifactKind)).toEqual(['docs', 'runtime-source']);
    expect(result.graphs.taskUnits.nodes.find((node) => node.id.endsWith('#T2'))?.dependencies)
      .toEqual(['tasks-artifact.md#T1']);
  });
});
