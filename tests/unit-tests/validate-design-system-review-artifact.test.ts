import { describe, expect, it } from 'vitest';
import { execSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';

const REPO_ROOT = path.resolve(__dirname, '..', '..');
const SCRIPT = path.join(REPO_ROOT, 'scripts', 'validate-design-system-review-artifact.sh');
const GENERATE = path.join(REPO_ROOT, 'scripts', 'generate-design-system-review-artifact.sh');

function run(target: string): { code: number; out: string } {
  try {
    return {
      code: 0,
      out: execSync(`bash "${SCRIPT}" "${target}"`, { encoding: 'utf8' }),
    };
  } catch (error) {
    const err = error as { stdout?: Buffer; stderr?: Buffer; status?: number };
    return {
      code: err.status ?? 1,
      out: `${err.stdout?.toString() ?? ''}${err.stderr?.toString() ?? ''}`,
    };
  }
}

function runGenerate(sourceMapPath: string, htmlPath: string): { code: number; out: string } {
  try {
    return {
      code: 0,
      out: execSync(`bash "${GENERATE}" "${sourceMapPath}" "${htmlPath}"`, { encoding: 'utf8' }),
    };
  } catch (error) {
    const err = error as { stdout?: Buffer; stderr?: Buffer; status?: number };
    return {
      code: err.status ?? 1,
      out: `${err.stdout?.toString() ?? ''}${err.stderr?.toString() ?? ''}`,
    };
  }
}

function writeHtml(root: string, html: string): string {
  const htmlPath = path.join(root, 'docs', 'design-system', 'review', 'index.html');
  fs.mkdirSync(path.dirname(htmlPath), { recursive: true });
  fs.writeFileSync(htmlPath, html, 'utf8');
  return htmlPath;
}

function writeSourceMap(root: string): string {
  const sourceMapPath = path.join(root, 'prompts', 'outputs', 'current', 'ui-reference-source-map.md');
  fs.mkdirSync(path.dirname(sourceMapPath), { recursive: true });
  fs.writeFileSync(
    sourceMapPath,
    [
      '# UI Reference Source Map',
      '',
      '## Product Design Direction',
      '- **Existing style authority:** no',
      '- **Design intent:** compact operational dashboard for repeated use',
      '- **Primary surfaces:** web admin dashboard, mobile, tablet, desktop',
      '- **Non-copy rule:** references are pattern inspiration only; do not copy brand assets',
      '',
      '## Reference Evidence',
      '| Row ID | Source Type | Product / File | Flow / Screen | URL / Path / Availability | Inspected At | Evidence Quality | Notes |',
      '|---|---|---|---|---|---|---|---|',
      '| REF-001 | existing-product | src/styles/theme.css | dashboard overview | local file available | 2026-05-30 | inspected | current token source |',
      '| REF-002 | platform-guideline | Apple HIG dashboard layout | responsive layout | https://developer.apple.com/design/ | 2026-05-30 | inspected | platform behavior only |',
      '| REF-003 | platform-guideline | WCAG dashboard guidance | chart summaries | local accessibility checklist | 2026-05-30 | inspected | non-visual chart summary guidance |',
      '',
      '## Reference Map',
      '| Row ID | Evidence Row | Reference Category | Observed Pattern | Product Decision | Non-copy Boundary | Components Affected | Tokens Affected | States Affected | Responsive Notes | Accessibility Notes |',
      '|---|---|---|---|---|---|---|---|---|---|---|',
      '| MAP-001 | REF-001, REF-002, REF-003 | Admin dashboard navigation | KPI cards, filter rail, chart/table rhythm | Use compact dashboard layout with clear scan order | Do not copy brand assets; pattern inspiration only | button, card, tab, modal, toast, KPI card, table row | color, typography, spacing, radius, elevation, motion, semantic aliases | default, loading, empty, error, disabled, success | Mobile stacks cards; tablet uses split layout; desktop grid; large desktop caps line length | Contrast, focus order, touch target size, reduced motion, and screen reader chart summaries |',
      '',
      '## Open Design Risks',
      '- none',
      '',
    ].join('\n'),
    'utf8',
  );
  return sourceMapPath;
}

function validHtml(extraHead = '', extraBody = ''): string {
  return [
    '<!doctype html>',
    '<html lang="en">',
    '<head>',
    '<meta charset="utf-8">',
    '<title>Design System Review</title>',
    '<style>body{font-family:system-ui}.swatch{background:#145c9e}</style>',
    extraHead,
    '</head>',
    '<body>',
    '<main>',
    '<section><h1>Design Direction Summary</h1>',
    '<p>Product surface: admin dashboard. Density: compact. Navigation model: sidebar and topbar. Style authority: existing product tokens. Redesign status: no redesign or rebrand approved.</p></section>',
    '<section><h2>Reference Evidence Panel</h2>',
    '<table><thead><tr><th>Row ID</th><th>Source Type</th><th>Product / File</th><th>Flow / Screen</th><th>URL / Path / Availability</th><th>Inspected At</th><th>Evidence Quality</th><th>Non-copy Boundary</th><th>Design Decision</th></tr></thead>',
    '<tbody><tr><td>REF-001</td><td>existing-product</td><td><a href="../../src/styles/theme.css">src/styles/theme.css</a></td><td>dashboard overview screen</td><td>local path available</td><td>2026-05-30</td><td>inspected</td><td>Do not copy external layouts; pattern inspiration only.</td><td>Use compact card rhythm.</td></tr></tbody></table></section>',
    '<section><h2>Token Swatches</h2>',
    '<div class="swatch">Color semantic token</div>',
    '<p>Color, typography, spacing, radius, elevation, motion, semantic aliases, and platform mapping for web, iOS, and Android.</p></section>',
    '<section><h2>Component Gallery</h2>',
    '<article class="component-card">Button component</article>',
    '<p>Button, card, tab, modal, toast, KPI card, table row, and variants.</p></section>',
    '<section><h2>State Matrix</h2>',
    '<div class="state">Default example</div><div class="state">Loading example</div><div class="state">Empty example</div><div class="state">Error example</div><div class="state">Disabled example</div><div class="state">Success example</div>',
    '<p>Default, loading, empty, error, disabled, and success examples.</p></section>',
    '<section><h2>Responsive Previews</h2>',
    '<p>Mobile, tablet, desktop, and large desktop previews.</p></section>',
    '<section><h2>Accessibility Notes</h2>',
    '<p>Contrast, focus order, touch target sizing, reduced motion, and screen reader labels.</p></section>',
    '<section><h2>Feedback Checklist</h2>',
    '<ul><li>Visual direction approval</li><li>Reference alignment</li><li>Missing states</li><li>Accessibility concerns</li><li>Approval or blocking feedback</li></ul></section>',
    extraBody,
    '</main>',
    '</body>',
    '</html>',
  ].join('\n');
}

describe('validate-design-system-review-artifact.sh', () => {
  it('is executable', () => {
    expect(fs.existsSync(SCRIPT)).toBe(true);
    expect((fs.statSync(SCRIPT).mode & 0o111) !== 0).toBe(true);
    expect(fs.existsSync(GENERATE)).toBe(true);
    expect((fs.statSync(GENERATE).mode & 0o111) !== 0).toBe(true);
  });

  it('accepts a complete static review artifact by project root', () => {
    const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), 'design-review-ok-'));
    try {
      writeHtml(sandbox, validHtml());

      const result = run(sandbox);

      expect(result.code).toBe(0);
      expect(result.out).toMatch(/design-system review artifact valid/);
    } finally {
      fs.rmSync(sandbox, { recursive: true, force: true });
    }
  });

  it('accepts an explicit HTML path', () => {
    const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), 'design-review-path-'));
    try {
      const htmlPath = writeHtml(sandbox, validHtml());

      const result = run(htmlPath);

      expect(result.code).toBe(0);
    } finally {
      fs.rmSync(sandbox, { recursive: true, force: true });
    }
  });

  it('generates a self-contained review artifact from a UI source map', () => {
    const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), 'design-review-generate-'));
    try {
      const sourceMapPath = writeSourceMap(sandbox);
      const htmlPath = path.join(sandbox, 'docs', 'design-system', 'review', 'index.html');

      const generate = runGenerate(sourceMapPath, htmlPath);

      expect(generate.code).toBe(0);
      expect(generate.out).toMatch(/generated design-system review artifact/);
      expect(fs.existsSync(htmlPath)).toBe(true);
      const html = fs.readFileSync(htmlPath, 'utf8');
      expect(html).toMatch(/Reference Evidence Panel/);
      expect(html).toMatch(/REF-001/);
      expect(html).toMatch(/MAP-001/);
      expect(html).toMatch(/State Matrix/);
      expect(html).not.toMatch(/<script\b[^>]+\bsrc=/i);
      expect(run(htmlPath).code).toBe(0);
    } finally {
      fs.rmSync(sandbox, { recursive: true, force: true });
    }
  });

  it('rejects generic artifacts when a source map exists but row decisions are missing', () => {
    const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), 'design-review-source-map-mismatch-'));
    try {
      writeSourceMap(sandbox);
      writeHtml(sandbox, validHtml());

      const result = run(sandbox);

      expect(result.code).toBe(1);
      expect(result.out).toMatch(/source-map evidence row REF-002 is not represented/);
      expect(result.out).toMatch(/source-map decision row MAP-001 is not represented/);
      expect(result.out).toMatch(/source-map row MAP-001 missing product decision/);
    } finally {
      fs.rmSync(sandbox, { recursive: true, force: true });
    }
  });

  it('rejects an artifact that omits required sections and states', () => {
    const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), 'design-review-missing-'));
    try {
      writeHtml(
        sandbox,
        '<!doctype html><html><body><h1>Design Direction Summary</h1><p>Product surface and density only. Default state.</p></body></html>',
      );

      const result = run(sandbox);

      expect(result.code).toBe(1);
      expect(result.out).toMatch(/missing required section: reference evidence panel/);
      expect(result.out).toMatch(/state matrix missing loading/);
      expect(result.out).toMatch(/feedback checklist missing approval or blocking feedback/);
    } finally {
      fs.rmSync(sandbox, { recursive: true, force: true });
    }
  });

  it('rejects keyword-complete artifacts without review structure', () => {
    const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), 'design-review-keywords-'));
    try {
      writeHtml(
        sandbox,
        [
          '<!doctype html><html><body>',
          'Design Direction Summary product surface density navigation model style authority redesign status.',
          'Reference Evidence Panel source type product/file flow/screen URL / Path / Availability inspected at evidence quality non-copy boundary product decision REF-001 research-unavailable.',
          '<a href="./src/styles/theme.css">src/styles/theme.css</a>',
          'Token Swatches color typography spacing radius elevation motion semantic aliases platform mapping web ios android.',
          'Component Gallery component catalog component library button card modal toast.',
          'State Matrix default loading empty error disabled success.',
          'Responsive Previews mobile tablet desktop large desktop.',
          'Accessibility Notes contrast focus touch target reduced motion screen reader.',
          'Feedback Checklist visual direction reference alignment missing states accessibility concerns approval or blocking feedback.',
          '</body></html>',
        ].join('\n'),
      );

      const result = run(sandbox);

      expect(result.code).toBe(1);
      expect(result.out).toMatch(/explicit <section> blocks/);
      expect(result.out).toMatch(/reference evidence panel must render as an HTML table/);
      expect(result.out).toMatch(/visible swatch elements/);
      expect(result.out).toMatch(/component-card examples/);
      expect(result.out).toMatch(/explicit state examples/);
    } finally {
      fs.rmSync(sandbox, { recursive: true, force: true });
    }
  });

  it('rejects external render-time assets while allowing reference links', () => {
    const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), 'design-review-external-'));
    try {
      writeHtml(
        sandbox,
        validHtml('<script src="https://cdn.example.com/runtime.js"></script>'),
      );

      const result = run(sandbox);

      expect(result.code).toBe(1);
      expect(result.out).toMatch(/external render-time assets/);
    } finally {
      fs.rmSync(sandbox, { recursive: true, force: true });
    }
  });

  it('exits 2 when the artifact is missing', () => {
    const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), 'design-review-absent-'));
    try {
      const result = run(sandbox);

      expect(result.code).toBe(2);
      expect(result.out).toMatch(/design-system review artifact not found/);
    } finally {
      fs.rmSync(sandbox, { recursive: true, force: true });
    }
  });
});
