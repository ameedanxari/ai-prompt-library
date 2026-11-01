import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { check } from '../scripts/coverage.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const fixture = path.join(here, 'fixtures', 'plan-ok');

// Copy the passing fixture, apply one edit, and return the check result.
function variant(file, edit) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'coverage-'));
  fs.cpSync(fixture, dir, { recursive: true });
  if (file) {
    const target = path.join(dir, file);
    fs.writeFileSync(target, edit(fs.readFileSync(target, 'utf8')));
  }
  return check(dir);
}

test('a complete plan passes', () => {
  const result = variant(null);
  assert.deepEqual(result.errors, []);
  assert.deepEqual(result.counts, { requirements: 3, modules: 1, criteria: 3, tasks: 3, placedTasks: 3 });
});

test('a must requirement with no task fails', () => {
  const result = variant('modules/M-01.md', t => t.replace('| R-002 | AC-01-02 |', '| enabler: x | AC-01-02 |'));
  assert.ok(result.errors.some(e => e.startsWith('R-002 (must): no task')), result.errors.join('\n'));
});

test('a should requirement with no criterion only warns', () => {
  const result = variant('modules/M-01.md', t => t.replace(/\| AC-01-03 .*\n/, '').replace('AC-01-01, AC-01-03', 'AC-01-01'));
  assert.deepEqual(result.errors, []);
  assert.ok(result.warnings.some(w => w.startsWith('R-003 (should): no acceptance criterion')));
});

test('a requirement with two owners fails', () => {
  const result = variant('03-MODULES.md', t => t.replace('| R-001 | M-01 | — |', '| R-001 | M-01, M-02 | — |'));
  assert.ok(result.errors.some(e => e.includes('R-001: requirement map needs exactly one owning module')));
});

test('a task that traces to nothing fails', () => {
  const result = variant('modules/M-01.md', t => t.replace('enabler: needed to run tests', '—'));
  assert.ok(result.errors.some(e => e.startsWith('T-01-01: covers no requirement')));
});

test('dangling and duplicate IDs fail', () => {
  const result = variant('modules/M-01.md', t => t.replace('| T-01-03 | Reject conflicts atomically | R-002 |', '| T-01-02 | Reject conflicts atomically | R-009 |'));
  assert.ok(result.errors.some(e => e === 'T-01-02: defined twice'));
  assert.ok(result.errors.some(e => e.includes('unknown R-009')));
});

test('a task missing from the roadmap fails, and mentions outside order rows do not count', () => {
  const result = variant('05-ROADMAP.md', t => t.replace(/\| 3 \| T-01-03.*\n/, ''));
  assert.ok(result.errors.some(e => e === 'T-01-03: placed in the roadmap 0 times (expected 1)'));
  assert.ok(!result.errors.some(e => e.startsWith('T-01-02: placed')));
});

test('the CLI exits nonzero on errors and zero on a pass', () => {
  const script = path.join(here, '..', 'scripts', 'coverage.mjs');
  assert.match(execFileSync('node', [script, fixture], { encoding: 'utf8' }), /PASS/);
  const empty = fs.mkdtempSync(path.join(os.tmpdir(), 'coverage-empty-'));
  assert.throws(() => execFileSync('node', [script, empty], { stdio: 'pipe' }), e => e.status === 1);
});
