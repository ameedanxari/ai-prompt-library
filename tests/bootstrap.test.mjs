import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const script = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'scripts', 'bootstrap.mjs');
const start = '## AI Prompt Library Steering (Auto-Managed — do not edit)';
const end = '<!-- /AI Prompt Library Steering (Auto-Managed) -->';
const run = dir => execFileSync('node', [script, dir], { encoding: 'utf8' });

test('bootstrap adds one managed block and the project brief, and is idempotent', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'bootstrap-'));
  fs.writeFileSync(path.join(dir, 'AGENTS.md'), '# AGENTS\n\nKeep this line.\n');
  run(dir);
  const once = fs.readFileSync(path.join(dir, 'AGENTS.md'), 'utf8');
  assert.match(once, /Keep this line\./);
  assert.match(once, /\.ai-prompts\/prompts\/README\.md/);
  assert.equal(once.split(start).length - 1, 1);
  assert.ok(fs.existsSync(path.join(dir, 'MY_PROJECT.md')));
  run(dir);
  assert.equal(fs.readFileSync(path.join(dir, 'AGENTS.md'), 'utf8'), once);
});

test('bootstrap replaces an older managed block in place', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'bootstrap-'));
  fs.writeFileSync(path.join(dir, 'AGENTS.md'), `# AGENTS\n\nBefore.\n\n${start}\n\nOld v2 steering.\n\n${end}\n\nAfter.\n`);
  run(dir);
  const text = fs.readFileSync(path.join(dir, 'AGENTS.md'), 'utf8');
  assert.doesNotMatch(text, /Old v2 steering/);
  assert.match(text, /Before\.[\s\S]*prompts\/README\.md[\s\S]*After\./);
});

test('bootstrap records the library version and reports the plan status', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'bootstrap-'));
  fs.writeFileSync(path.join(dir, '.ai-prompts-version'), 'a97cada\n');
  fs.mkdirSync(path.join(dir, 'plan'));
  fs.writeFileSync(path.join(dir, 'plan', '01-SOURCES.md'), '# Sources\n');
  const out = JSON.parse(run(dir));
  const version = JSON.parse(fs.readFileSync(path.join(path.dirname(script), '..', 'package.json'), 'utf8')).version;
  assert.equal(fs.readFileSync(path.join(dir, '.ai-prompts-version'), 'utf8'), `${version}\n`);
  assert.equal(out.previousVersion, 'a97cada');
  assert.equal(out.plan.rerunFrom, 1);
  assert.match(out.plan.next, /Re-run stages 1–5/);
  assert.match(fs.readFileSync(path.join(dir, 'AGENTS.md'), 'utf8'), /scripts\/status\.mjs plan/);
});

test('bootstrap warns when MY_PROJECT.md points at version 2 runs', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'bootstrap-'));
  fs.writeFileSync(path.join(dir, 'MY_PROJECT.md'), 'Use prompts/outputs/runs/x/run.json\n');
  const out = JSON.parse(run(dir));
  assert.ok(out.warnings.some(w => w.includes('version 2')));
  assert.match(fs.readFileSync(path.join(dir, 'MY_PROJECT.md'), 'utf8'), /run\.json/);
});

test('bootstrap re-points stale library steering links and leaves others alone', { skip: process.platform === 'win32' }, () => {
  const dir = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'bootstrap-')));
  const rules = path.join(dir, '.cursor', 'rules');
  fs.mkdirSync(rules, { recursive: true });
  fs.symlinkSync(path.join(dir, '.ai-prompts', 'prompts', 'steering', 'library-context.md'), path.join(rules, 'library-context.md'));
  fs.writeFileSync(path.join(dir, 'mine.md'), 'mine\n');
  fs.symlinkSync(path.join(dir, 'mine.md'), path.join(rules, 'mine.md'));
  const out = JSON.parse(run(dir));
  assert.deepEqual(out.repairedLinks, [path.join('.cursor', 'rules', 'library-context.md')]);
  assert.match(fs.readFileSync(path.join(rules, 'library-context.md'), 'utf8'), /status\.mjs plan/);
  assert.equal(fs.readlinkSync(path.join(rules, 'mine.md')), path.join(dir, 'mine.md'));
});

test('bootstrap refuses a dangling AGENTS.md symlink and writes nothing', { skip: process.platform === 'win32' }, () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'bootstrap-'));
  fs.symlinkSync(path.join(dir, 'CLAUDE.md'), path.join(dir, 'AGENTS.md'));
  assert.throws(() => run(dir));
  assert.ok(fs.lstatSync(path.join(dir, 'AGENTS.md')).isSymbolicLink());
  assert.equal(fs.existsSync(path.join(dir, '.ai-prompts-version')), false);
});

test('bootstrap leaves live library links and symlinked steering folders alone', { skip: process.platform === 'win32' }, () => {
  const dir = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'bootstrap-')));
  const library = path.join(path.dirname(script), '..');
  const rules = path.join(dir, '.cursor', 'rules');
  fs.mkdirSync(rules, { recursive: true });
  fs.symlinkSync(path.join(library, 'README.md'), path.join(rules, 'readme.md'));
  const outside = fs.mkdtempSync(path.join(os.tmpdir(), 'outside-'));
  fs.symlinkSync(path.join(dir, '.ai-prompts', 'gone.md'), path.join(outside, 'gone.md'));
  fs.mkdirSync(path.join(dir, '.kiro'));
  fs.symlinkSync(outside, path.join(dir, '.kiro', 'steering'));
  const out = JSON.parse(run(dir));
  assert.deepEqual(out.repairedLinks, []);
  assert.equal(fs.readlinkSync(path.join(rules, 'readme.md')), path.join(library, 'README.md'));
  assert.equal(fs.readlinkSync(path.join(outside, 'gone.md')), path.join(dir, '.ai-prompts', 'gone.md'));
});

test('bootstrap keeps CRLF line endings in AGENTS.md', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'bootstrap-'));
  fs.writeFileSync(path.join(dir, 'AGENTS.md'), '# AGENTS\r\n\r\nKeep.\r\n');
  run(dir);
  const text = fs.readFileSync(path.join(dir, 'AGENTS.md'), 'utf8');
  assert.doesNotMatch(text.replace(/\r\n/g, ''), /\n/);
});
