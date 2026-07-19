import { describe, expect, it } from 'vitest';
import { execFileSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';

const REPO_ROOT = path.resolve(__dirname, '..', '..');
const VALIDATOR = path.join(REPO_ROOT, 'scripts', 'validate-content-lint.sh');

// Eval scenarios for the content lint. Scenario A replays the 2026-07
// SignalForge audit defects verbatim so they can never ship silently
// again. Scenario B is a deliberate HOLD-OUT in a different stack
// (static HTML + Vue, different banned vocabulary, different shortcut
// syntax) so the lint generalizes instead of overfitting to the
// SignalForge/Next.js shape.

interface Scenario {
  config?: Record<string, unknown>;
  contentSystem?: string;
  inventory?: Record<string, unknown> | 'omit';
  appFiles?: Record<string, string>;
}

function run(scenario: Scenario) {
  const outputs = fs.mkdtempSync(path.join(os.tmpdir(), 'content-lint-out-'));
  const app = fs.mkdtempSync(path.join(os.tmpdir(), 'content-lint-app-'));
  if (scenario.config) {
    fs.writeFileSync(path.join(outputs, 'content-lint.config.json'), JSON.stringify(scenario.config), 'utf8');
  }
  if (scenario.contentSystem !== undefined) {
    fs.writeFileSync(path.join(outputs, 'content-system.md'), scenario.contentSystem, 'utf8');
  }
  if (scenario.inventory && scenario.inventory !== 'omit') {
    fs.writeFileSync(path.join(outputs, 'content-inventory.json'), JSON.stringify(scenario.inventory), 'utf8');
  }
  for (const [relative, body] of Object.entries(scenario.appFiles ?? {})) {
    const absolute = path.join(app, relative);
    fs.mkdirSync(path.dirname(absolute), { recursive: true });
    fs.writeFileSync(absolute, body, 'utf8');
  }
  let code = 0;
  let out = '';
  try {
    out = execFileSync('/bin/bash', [VALIDATOR, outputs, app], { encoding: 'utf8' });
  } catch (error) {
    const failure = error as { status?: number; stdout?: Buffer; stderr?: Buffer };
    code = failure.status ?? 1;
    out = `${failure.stdout?.toString() ?? ''}${failure.stderr?.toString() ?? ''}`;
  }
  const report = JSON.parse(fs.readFileSync(path.join(outputs, 'content-lint-report.json'), 'utf8'));
  fs.rmSync(outputs, { recursive: true, force: true });
  fs.rmSync(app, { recursive: true, force: true });
  return { code, out, report };
}

const codesOf = (report: { issues: Array<{ code: string }> }) =>
  report.issues.map((issue) => issue.code);

const baseConfig = {
  schemaVersion: 1,
  projectName: 'scenario',
  uiSourceGlobs: ['src/**/*.tsx', 'src/**/*.ts'],
  excludeGlobs: ['**/*.test.*'],
  bannedSurfaceTerms: [
    { term: 'persisted', reason: 'database word', allowedContexts: [] },
    { term: 'server-owned', reason: 'session architecture', allowedContexts: [] },
    { term: 'walking skeleton', reason: 'delivery-stage vocabulary', allowedContexts: [] },
    { term: 'owning feature task', reason: 'delivery-stage vocabulary', allowedContexts: [] },
  ],
};

const contentSystem = '# Content System\n\n| STR-HOME-001 | heading | Welcome back | default | persona-pack |\n| STR-HOME-002 | helper | Pick up where you left off | default | persona-pack |\n';

const validInventory = {
  schemaVersion: 1,
  entries: [
    { stringId: 'STR-HOME-001', screen: 'Home', element: 'heading', copy: 'Welcome back', file: 'src/home.tsx', line: 3 },
  ],
};

describe('content lint — SignalForge regression scenario', () => {
  it('rediscovers every audited defect class from source', () => {
    const { code, report } = run({
      config: baseConfig,
      contentSystem,
      inventory: validInventory,
      appFiles: {
        'src/planned.tsx': [
          'export default function Planned() {',
          '  return (',
          '    <main>',
          '      <p>',
          '        This route is reserved for its owning feature task. The production',
          '        session and draft-only adapter are active in the walking skeleton.',
          '      </p>',
          '    </main>',
          '  );',
          '}',
        ].join('\n'),
        'src/layout.tsx': [
          'const organization = {',
          '  name: `Organization ${session.organization_id.slice(0, 8)}`,',
          '};',
        ].join('\n'),
        'src/nav.tsx': [
          'const links = [',
          '  { href: "/welcome", label: "Welcome", symbol: "W" },',
          '  { href: "/workspaces", label: "Workspaces", symbol: "W" },',
          '];',
        ].join('\n'),
        'src/roster.tsx': [
          'const members = [',
          '  { id: "00000000-0000-4000-8000-000000000401", email: "mira@example.test" },',
          '];',
          'const note = "Progress is stage-based and persisted.";',
        ].join('\n'),
      },
    });
    expect(code).toBe(1);
    expect(report.status).toBe('fail');
    const codes = codesOf(report);
    expect(codes).toContain('banned-surface-term');
    expect(codes).toContain('identifier-derived-display-name');
    expect(codes).toContain('duplicate-shortcut');
    expect(codes).toContain('fixture-data-in-ui-source');
    const bannedTerms = report.issues
      .filter((issue: { code: string }) => issue.code === 'banned-surface-term')
      .map((issue: { term: string }) => issue.term);
    expect(bannedTerms).toEqual(expect.arrayContaining(['owning feature task', 'walking skeleton', 'persisted']));
  });
});

describe('content lint — hold-out generalization scenario (non-SignalForge stack)', () => {
  it('fires on a static-HTML/Vue project with project-specific vocabulary', () => {
    const { report } = run({
      config: {
        ...baseConfig,
        uiSourceGlobs: ['site/**/*.html', 'site/**/*.vue'],
        bannedSurfaceTerms: [
          { term: 'ingestion pipeline', reason: 'internal system noun', allowedContexts: [] },
          { term: 'denormalized', reason: 'database word', allowedContexts: [] },
        ],
        shortcutPattern: 'data-hotkey=["\']([A-Za-z0-9])["\']',
      },
      contentSystem,
      inventory: validInventory,
      appFiles: {
        'site/index.html': [
          '<body>',
          '  <h1>Your library</h1>',
          '  <p>Books arrive through the ingestion pipeline every night.</p>',
          '  <button data-hotkey="J">Journal</button>',
          '  <button data-hotkey="J">Jump</button>',
          '</body>',
        ].join('\n'),
        'site/list.vue': [
          '<template>',
          '  <span>{{ title }}</span>',
          '</template>',
          '<script>',
          'const caption = "Results are denormalized for speed.";',
          '</script>',
        ].join('\n'),
      },
    });
    expect(report.status).toBe('fail');
    const codes = codesOf(report);
    expect(codes).toContain('banned-surface-term');
    expect(codes).toContain('duplicate-shortcut');
    const bannedTerms = report.issues
      .filter((issue: { code: string }) => issue.code === 'banned-surface-term')
      .map((issue: { term: string }) => issue.term);
    expect(bannedTerms).toEqual(expect.arrayContaining(['ingestion pipeline', 'denormalized']));
  });
});

describe('content lint — clean pass and pair integrity', () => {
  it('passes a compliant surface with a valid inventory', () => {
    const { code, report } = run({
      config: baseConfig,
      contentSystem,
      inventory: validInventory,
      appFiles: {
        'src/home.tsx': [
          'export default function Home() {',
          '  return <h1>Welcome back</h1>;',
          '}',
        ].join('\n'),
      },
    });
    expect(report.status).toBe('pass');
    expect(code).toBe(0);
  });

  it('ignores multiword banned terms inside code comments of markup files', () => {
    const { report } = run({
      config: {
        ...baseConfig,
        bannedSurfaceTerms: [
          { term: 'composition root', reason: 'implementation noun', allowedContexts: [] },
          { term: 'walking skeleton', reason: 'delivery vocabulary', allowedContexts: [] },
        ],
      },
      contentSystem,
      inventory: validInventory,
      appFiles: {
        'src/layout.tsx': [
          '// Production composition root for the shell.',
          'export default function Layout() {',
          '  {/* the walking skeleton wired this */}',
          '  const docs = "https://example.com/path"; // composition root note',
          '  return <main>Welcome back</main>;',
          '}',
        ].join('\n'),
      },
    });
    expect(report.status).toBe('pass');
  });

  it('is not-applicable only when neither artifact exists', () => {
    const { code, report } = run({ appFiles: { 'src/a.tsx': 'export {};' } });
    expect(report.status).toBe('not-applicable');
    expect(code).toBe(0);
  });

  it('fails a content system without a lint config instead of skipping', () => {
    const { code, report } = run({ contentSystem });
    expect(report.status).toBe('fail');
    expect(code).toBe(1);
    expect(codesOf(report)).toContain('missing-config');
  });

  it('fails a lint config without a content system', () => {
    const { report } = run({ config: baseConfig });
    expect(codesOf(report)).toContain('missing-content-system');
  });

  it('requires the inventory, valid string IDs, and unique headings', () => {
    const missing = run({ config: baseConfig, contentSystem, inventory: 'omit' });
    expect(codesOf(missing.report)).toContain('missing-content-inventory');

    const bad = run({
      config: baseConfig,
      contentSystem,
      inventory: {
        schemaVersion: 1,
        entries: [
          { stringId: 'STR-UNKNOWN-999', screen: 'Home', element: 'helper', copy: 'x', file: 'src/h.tsx', line: 1 },
          { stringId: 'STR-HOME-001', screen: 'Home', element: 'heading', copy: 'Welcome back', file: 'src/h.tsx', line: 2 },
          { stringId: 'STR-HOME-002', screen: 'Home', element: 'heading', copy: 'Welcome back', file: 'src/h.tsx', line: 9 },
        ],
      },
    });
    const codes = codesOf(bad.report);
    expect(codes).toContain('unknown-string-id');
    expect(codes).toContain('duplicate-heading');
  });
});
