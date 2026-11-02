import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { status, libraryInfo, older } from '../scripts/status.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const info = { version: '3.2.0', stages: { 1: '3.1.0', 2: '3.2.0', 3: '3.1.0', 4: '3.1.0', 5: '3.1.0', 6: '3.2.0' } };
const files = { 1: ['01-SOURCES.md'], 2: ['02-BRIEF.md'], 3: ['03-ARCHITECTURE.md', '03-MODULES.md'], 4: ['modules/M-01.md', 'modules/M-02.md'], 5: ['05-ROADMAP.md'] };

// A plan folder whose stage files carry the given stamp versions (null = no stamp, undefined = absent).
function plan(versions) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'status-'));
  fs.mkdirSync(path.join(dir, 'modules'));
  for (const [stage, list] of Object.entries(files)) {
    const v = versions[stage];
    if (v === undefined) continue;
    for (const rel of list) {
      const stamp = v === null ? '' : `<!-- ai-prompt-library ${v} · stage ${stage} -->\n`;
      fs.writeFileSync(path.join(dir, rel), `${stamp}# Title\n`);
    }
  }
  return dir;
}

test('a plan stamped with current stage versions is current', () => {
  const result = status(plan({ 1: '3.1.0', 2: '3.2.0', 3: '3.2.0', 4: '3.2.0', 5: '3.2.0' }), info);
  assert.equal(result.state, 'current');
  assert.equal(result.rerunFrom, null);
});

test('a stage changed since the stamp makes the plan stale from that stage', () => {
  const result = status(plan({ 1: '3.1.0', 2: '3.1.0', 3: '3.1.0', 4: '3.1.0', 5: '3.1.0' }), info);
  assert.equal(result.state, 'stale');
  assert.equal(result.rerunFrom, 2);
  assert.equal(result.files.find(f => f.file === '02-BRIEF.md').state, 'stale');
  assert.equal(result.files.find(f => f.file === '01-SOURCES.md').state, 'current');
  assert.equal(result.files.find(f => f.file === '05-ROADMAP.md').state, 'stale');
});

test('unstamped files are treated as 3.0.0', () => {
  const result = status(plan({ 1: null, 2: null, 3: null, 4: null, 5: null }), info);
  assert.equal(result.rerunFrom, 1);
  assert.equal(result.files[0].state, 'unstamped');
});

test('a missing earlier output makes the plan incomplete', () => {
  const result = status(plan({ 1: '3.2.0', 2: '3.2.0', 4: '3.2.0', 5: '3.2.0' }), info);
  assert.equal(result.state, 'incomplete');
  assert.equal(result.rerunFrom, 3);
});

test('a plan partly run is partial, not current', () => {
  const result = status(plan({ 1: '3.2.0', 2: '3.2.0' }), info);
  assert.deepEqual([result.state, result.rerunFrom], ['partial', 3]);
});

test('re-running only the stale stage leaves later stages stale', () => {
  const result = status(plan({ 1: '3.1.0', 2: '3.2.0', 3: '3.1.0', 4: '3.1.0', 5: '3.1.0' }), info);
  assert.deepEqual([result.state, result.rerunFrom], ['stale', 3]);
  assert.equal(result.files.find(f => f.file === '03-MODULES.md').current, '3.2.0');
});

test('prerelease versions compare as their release, and bad versions throw', () => {
  assert.equal(older('3.2.0-rc.1', '3.2.0'), false);
  assert.equal(older('3.1.9', '3.2.0-rc.1'), true);
  assert.throws(() => older('x', '3.2.0'));
});

test('no plan folder means start at stage 1', () => {
  const result = status(path.join(os.tmpdir(), 'no-such-plan-folder'), info);
  assert.deepEqual([result.state, result.rerunFrom], ['none', 1]);
});

test('reviews never force a re-run, and a newer stamp warns', () => {
  const dir = plan({ 1: '3.1.0', 2: '3.2.0', 3: '3.2.0', 4: '3.9.0', 5: '3.2.0' });
  fs.mkdirSync(path.join(dir, 'reviews'));
  fs.writeFileSync(path.join(dir, 'reviews', '02-brief.md'), '<!-- ai-prompt-library 3.0.0 · stage 6 -->\n');
  const result = status(dir, info);
  assert.equal(result.state, 'current');
  assert.ok(result.warnings.some(w => w.includes('newer than the installed')));
});

test('the CLI exits 1 with --check when the plan is stale', () => {
  const dir = plan({ 1: null });
  const script = path.join(here, '..', 'scripts', 'status.mjs');
  assert.throws(() => execFileSync('node', [script, dir, '--check'], { encoding: 'utf8' }));
  assert.match(execFileSync('node', [script, dir], { encoding: 'utf8' }), /Re-run stages 1–5/);
});

test('the CLI also runs when invoked through a symlink', { skip: process.platform === 'win32' }, () => {
  const dir = plan({ 1: null });
  const link = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'status-link-')), 'status.mjs');
  fs.symlinkSync(path.join(here, '..', 'scripts', 'status.mjs'), link);
  assert.throws(() => execFileSync('node', [link, dir, '--check'], { encoding: 'utf8' }));
});

test('stage versions cover stages 1–6 and none is newer than the package', () => {
  const { version, stages } = libraryInfo();
  assert.deepEqual(Object.keys(stages).sort(), ['1', '2', '3', '4', '5', '6']);
  for (const v of Object.values(stages)) {
    assert.match(v, /^\d+\.\d+\.\d+$/);
    assert.ok(!older(version, v), `stage version ${v} is newer than package ${version}`);
  }
});
