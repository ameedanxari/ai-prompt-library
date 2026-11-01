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
