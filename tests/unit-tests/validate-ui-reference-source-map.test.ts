import { describe, expect, it } from 'vitest';
import { execSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';

const REPO_ROOT = path.resolve(__dirname, '..', '..');
const SCRIPT = path.join(REPO_ROOT, 'scripts', 'validate-ui-reference-source-map.sh');

function run(sourceMapPath: string): { code: number; out: string } {
  try {
    return {
      code: 0,
      out: execSync(`bash "${SCRIPT}" "${sourceMapPath}"`, { encoding: 'utf8' }),
    };
  } catch (error) {
    const err = error as { stdout?: Buffer; stderr?: Buffer; status?: number };
    return {
      code: err.status ?? 1,
      out: `${err.stdout?.toString() ?? ''}${err.stderr?.toString() ?? ''}`,
    };
  }
}

function writeSourceMap(dir: string, lines: string[]): string {
  const sourceMapPath = path.join(dir, 'ui-reference-source-map.md');
  fs.writeFileSync(sourceMapPath, `${lines.join('\n')}\n`, 'utf8');
  return sourceMapPath;
}

function validSourceMap(overrides: Partial<{
  evidenceRows: string[];
  mapRows: string[];
}> = {}): string[] {
  return [
    '# UI Reference Source Map',
    '',
    '## Product Design Direction',
    '- **Existing style authority:** no',
    '- **Design intent:** compact operational dashboard',
    '- **Primary surfaces:** web',
    '- **Non-copy rule:** references are pattern inspiration only',
    '',
    '## Reference Evidence',
    '| Row ID | Source Type | Product / File | Flow / Screen | URL / Path / Availability | Inspected At | Evidence Quality | Notes |',
    '|---|---|---|---|---|---|---|---|',
    ...(overrides.evidenceRows ?? [
      '| REF-001 | existing-product | src/styles/theme.css | design tokens | local file available | 2026-05-30 | inspected | current theme source |',
      '| REF-002 | free-reference-site | Public dashboard reference | dashboard overview | research-unavailable: external catalog unavailable in unit test; fallback to local dashboard patterns | 2026-05-30 | fallback | scan pattern only |',
      '| REF-003 | platform-guideline | WCAG dashboard guidance | chart summaries | local accessibility checklist | 2026-05-30 | inspected | non-visual chart summary guidance |',
    ]),
    '',
    '## Reference Map',
    '| Row ID | Evidence Row | Reference Category | Observed Pattern | Product Decision | Non-copy Boundary | Components Affected | Tokens Affected | States Affected | Responsive Notes | Accessibility Notes |',
    '|---|---|---|---|---|---|---|---|---|---|---|',
    ...(overrides.mapRows ?? [
      '| MAP-001 | REF-001, REF-002, REF-003 | Admin dashboard navigation | KPI/filter/chart/table density | Use compact task-focused layout | Do not copy brand assets or proprietary layouts | sidebar, KPI card, filter bar, chart card, table | surface, text, border, accent, spacing | default, loading, empty, error, disabled, success | Stack cards on mobile | Keyboard focus and screen-reader chart summaries |',
    ]),
    '',
    '## Open Design Risks',
    '- none',
  ];
}

describe('validate-ui-reference-source-map.sh', () => {
  it('is executable', () => {
    expect(fs.existsSync(SCRIPT)).toBe(true);
    expect((fs.statSync(SCRIPT).mode & 0o111) !== 0).toBe(true);
  });

  it('accepts a source map with evidence rows and map rows', () => {
    const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), 'ui-map-ok-'));
    try {
      const sourceMapPath = writeSourceMap(sandbox, validSourceMap());

      const result = run(sourceMapPath);

      expect(result.code).toBe(0);
      expect(result.out).toMatch(/UI reference source map valid/);
    } finally {
      fs.rmSync(sandbox, { recursive: true, force: true });
    }
  });

  it('rejects source maps that omit required schema columns', () => {
    const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), 'ui-map-columns-'));
    try {
      const sourceMapPath = writeSourceMap(sandbox, [
        '# UI Reference Source Map',
        '',
        '## Reference Evidence',
        '| Row ID | Source Type |',
        '|---|---|',
        '| REF-001 | existing-product |',
        '',
        '## Reference Map',
        '| Row ID | Reference Category | Observed Pattern |',
        '|---|---|---|',
        '| MAP-001 | Admin | Compact cards |',
      ]);

      const result = run(sourceMapPath);

      expect(result.code).toBe(1);
      expect(result.out).toMatch(/missing required reference-evidence column/);
      expect(result.out).toMatch(/URL \/ Path \/ Availability/);
      expect(result.out).toMatch(/missing required source-map column/);
      expect(result.out).toMatch(/Product Decision/);
    } finally {
      fs.rmSync(sandbox, { recursive: true, force: true });
    }
  });

  it('rejects source maps that omit required narrative sections', () => {
    const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), 'ui-map-sections-'));
    try {
      const sourceMapPath = writeSourceMap(sandbox, [
        '# UI Reference Source Map',
        '',
        '## Reference Evidence',
        '| Row ID | Source Type | Product / File | Flow / Screen | URL / Path / Availability | Inspected At | Evidence Quality | Notes |',
        '|---|---|---|---|---|---|---|---|',
        '| REF-001 | existing-product | src/styles/theme.css | design tokens | local file available | 2026-05-30 | inspected | current theme source |',
        '| REF-002 | free-reference-site | Public dashboard reference | dashboard overview | research-unavailable: external catalog unavailable in unit test | 2026-05-30 | fallback | scan pattern only |',
        '| REF-003 | platform-guideline | WCAG dashboard guidance | chart summaries | local accessibility checklist | 2026-05-30 | inspected | summary guidance |',
        '',
        '## Reference Map',
        '| Row ID | Evidence Row | Reference Category | Observed Pattern | Product Decision | Non-copy Boundary | Components Affected | Tokens Affected | States Affected | Responsive Notes | Accessibility Notes |',
        '|---|---|---|---|---|---|---|---|---|---|---|',
        '| MAP-001 | REF-001, REF-002, REF-003 | Admin dashboard navigation | KPI density | Use compact layout | Do not copy brand assets | card | surface | default, loading, empty, error, disabled, success | Stack cards | Screen-reader summary |',
      ]);

      const result = run(sourceMapPath);

      expect(result.code).toBe(1);
      expect(result.out).toMatch(/missing required section '## Product Design Direction'/);
      expect(result.out).toMatch(/missing required section '## Open Design Risks'/);
    } finally {
      fs.rmSync(sandbox, { recursive: true, force: true });
    }
  });

  it('rejects greenfield maps with fewer than three evidence rows', () => {
    const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), 'ui-map-evidence-count-'));
    try {
      const sourceMapPath = writeSourceMap(sandbox, validSourceMap({
        evidenceRows: [
          '| REF-001 | existing-product | src/styles/theme.css | design tokens | local file available | 2026-05-30 | inspected | current theme source |',
          '| REF-002 | free-reference-site | Public dashboard reference | dashboard overview | research-unavailable: external catalog unavailable in unit test; fallback to local dashboard patterns | 2026-05-30 | fallback | scan pattern only |',
        ],
      }));

      const result = run(sourceMapPath);

      expect(result.code).toBe(1);
      expect(result.out).toMatch(/at least 3 evidence rows/);
    } finally {
      fs.rmSync(sandbox, { recursive: true, force: true });
    }
  });

  it('rejects table rows whose unescaped pipes shift column counts', () => {
    const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), 'ui-map-row-width-'));
    try {
      const sourceMapPath = writeSourceMap(sandbox, validSourceMap({
        evidenceRows: [
          '| REF-001 | existing-product | src/styles/theme.css | design tokens | local file available | 2026-05-30 | inspected | current theme source |',
          '| REF-002 | free-reference-site | Public dashboard reference | dashboard | research-unavailable: external | catalog unavailable | 2026-05-30 | fallback | extra shifted cell |',
        ],
      }));

      const result = run(sourceMapPath);

      expect(result.code).toBe(1);
      expect(result.out).toMatch(/Reference Evidence table row/);
      expect(result.out).toMatch(/expected 8/);
    } finally {
      fs.rmSync(sandbox, { recursive: true, force: true });
    }
  });

  it('accepts escaped pipes inside table cells', () => {
    const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), 'ui-map-escaped-pipe-'));
    try {
      const sourceMapPath = writeSourceMap(sandbox, validSourceMap({
        evidenceRows: [
          '| REF-001 | existing-product | src/styles/theme.css | design tokens | local file available | 2026-05-30 | inspected | current theme source |',
          '| REF-002 | free-reference-site | Public dashboard reference | dashboard overview \\| detail drill-in | research-unavailable: external catalog unavailable in unit test; fallback to local dashboard patterns | 2026-05-30 | fallback | scan pattern only |',
          '| REF-003 | platform-guideline | WCAG dashboard guidance | chart summaries | local accessibility checklist | 2026-05-30 | inspected | non-visual chart summary guidance |',
        ],
        mapRows: [
          '| MAP-001 | REF-001, REF-002 | Admin dashboard navigation | KPI density \\| filter scan path | Use compact task-focused layout | Do not copy brand assets or proprietary layouts | sidebar, KPI card, filter bar, chart card, table | surface, text, border, accent, spacing | default, loading, empty, error, disabled, success | Stack cards on mobile | Keyboard focus and screen-reader chart summaries |',
        ],
      }));

      const result = run(sourceMapPath);

      expect(result.code).toBe(0);
      expect(result.out).toMatch(/UI reference source map valid/);
    } finally {
      fs.rmSync(sandbox, { recursive: true, force: true });
    }
  });

  it('rejects map rows that cite missing evidence row IDs', () => {
    const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), 'ui-map-missing-ref-'));
    try {
      const sourceMapPath = writeSourceMap(sandbox, validSourceMap({
        mapRows: [
          '| MAP-001 | REF-999 | Admin dashboard navigation | KPI density | Use compact layout | Do not copy brand assets | card | surface | default, loading, empty, error, disabled, success | Stack cards | Screen-reader summary |',
        ],
      }));

      const result = run(sourceMapPath);

      expect(result.code).toBe(1);
      expect(result.out).toMatch(/cites missing evidence row\(s\): REF-999/);
    } finally {
      fs.rmSync(sandbox, { recursive: true, force: true });
    }
  });

  it('rejects map rows that omit required UI states', () => {
    const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), 'ui-map-states-'));
    try {
      const sourceMapPath = writeSourceMap(sandbox, validSourceMap({
        mapRows: [
          '| MAP-001 | REF-001 | Admin dashboard navigation | KPI density | Use compact layout | Do not copy brand assets | card | surface | default, disabled, success | Stack cards | Screen-reader summary |',
        ],
      }));

      const result = run(sourceMapPath);

      expect(result.code).toBe(1);
      expect(result.out).toMatch(/missing required state\(s\): loading, empty, error/);
    } finally {
      fs.rmSync(sandbox, { recursive: true, force: true });
    }
  });

  it('rejects generic reference categories', () => {
    const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), 'ui-map-generic-'));
    try {
      const sourceMapPath = writeSourceMap(sandbox, validSourceMap({
        mapRows: [
          '| MAP-001 | REF-001 | modern apps | Cards look nice | Use modern design | Do not copy brand assets | card | surface | default, loading, empty, error, disabled, success | Stack cards | Screen-reader summary |',
        ],
      }));

      const result = run(sourceMapPath);

      expect(result.code).toBe(1);
      expect(result.out).toMatch(/generic reference category 'modern apps'/);
    } finally {
      fs.rmSync(sandbox, { recursive: true, force: true });
    }
  });

  it('rejects non-specific component and token decisions', () => {
    const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), 'ui-map-nonspecific-values-'));
    try {
      const sourceMapPath = writeSourceMap(sandbox, validSourceMap({
        mapRows: [
          '| MAP-001 | REF-001, REF-002, REF-003 | Admin dashboard navigation | KPI density | Use compact layout | Do not copy brand assets | none | n/a | default, loading, empty, error, disabled, success | Stack cards | Screen-reader summary |',
        ],
      }));

      const result = run(sourceMapPath);

      expect(result.code).toBe(1);
      expect(result.out).toMatch(/non-specific 'Components Affected'/);
      expect(result.out).toMatch(/non-specific 'Tokens Affected'/);
    } finally {
      fs.rmSync(sandbox, { recursive: true, force: true });
    }
  });
});
