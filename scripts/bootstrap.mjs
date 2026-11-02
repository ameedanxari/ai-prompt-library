// Installs or upgrades the library's footprint in a project: the managed block
// in AGENTS.md, MY_PROJECT.md (only if absent), .ai-prompts-version, and any IDE
// steering links an earlier version left pointing into the library. Then reports
// whether the project's plan is stale for this library version.
// Usage: node .ai-prompts/scripts/bootstrap.mjs [project-root]
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { status, advice, libraryInfo } from './status.mjs';

const library = fs.realpathSync(path.dirname(path.dirname(fileURLToPath(import.meta.url))));
const root = fs.realpathSync(process.argv[2] ?? process.cwd());
const { version } = libraryInfo(library);
const steeringFile = path.join(library, 'prompts', 'steering.md');
const start = '## AI Prompt Library Steering (Auto-Managed — do not edit)';
const end = '<!-- /AI Prompt Library Steering (Auto-Managed) -->';
const block = `${start}\n\n<!-- ai-prompt-library ${version} -->\n${fs.readFileSync(steeringFile, 'utf8').trim()}\n\n${end}`;
// Folders where earlier versions linked steering files for IDE agents.
const steeringDirs = ['.ai-steering', '.cursor/rules', '.windsurf/rules', '.kiro/steering', '.idea/ai-rules', '.vscode/ai-steering'];

// lstat-based, so a dangling symlink counts as present.
const lstat = file => { try { return fs.lstatSync(file); } catch { return null; } };

function writeAtomic(file, text) {
  const existing = lstat(file);
  if (existing?.isSymbolicLink()) throw new Error(`Refusing symlink: ${file}`);
  const temporary = `${file}.${crypto.randomUUID()}.tmp`;
  try {
    fs.writeFileSync(temporary, text, { flag: 'wx' });
    if (existing) fs.chmodSync(temporary, existing.mode & 0o7777);
    fs.renameSync(temporary, file);
  } finally { if (lstat(temporary)) fs.unlinkSync(temporary); }
}

const inside = (target, dir) => target === dir || target.startsWith(dir + path.sep);

// Re-point steering symlinks that an earlier version left dangling inside the
// library at the current steering file. Links that still resolve, links outside
// the library, plain files and symlinked folders are left alone.
function repairSteeringLinks(warnings) {
  const repaired = [];
  const libraryPaths = [library, path.join(root, '.ai-prompts')];
  for (const rel of steeringDirs) {
    const dir = path.join(root, rel);
    const info = lstat(dir);
    if (!info?.isDirectory()) continue;
    for (const name of fs.readdirSync(dir)) {
      const link = path.join(dir, name);
      if (!lstat(link).isSymbolicLink()) continue;
      const target = path.resolve(dir, fs.readlinkSync(link));
      if (!libraryPaths.some(p => inside(target, p)) || fs.existsSync(target)) continue;
      const temporary = `${link}.${crypto.randomUUID()}.tmp`;
      try {
        fs.symlinkSync(path.relative(dir, steeringFile), temporary);
        fs.renameSync(temporary, link);
        repaired.push(path.relative(root, link));
      } catch (error) {
        if (lstat(temporary)) fs.unlinkSync(temporary);
        warnings.push(`could not re-point ${path.relative(root, link)}: ${error.message}`);
      }
    }
  }
  return repaired;
}

try {
  const warnings = [];
  // Read and check everything before writing anything.
  const file = path.join(root, 'AGENTS.md');
  const agents = lstat(file);
  if (agents?.isSymbolicLink()) throw new Error('AGENTS.md is a symlink; preserve it and integrate deliberately');
  const previous = agents ? fs.readFileSync(file, 'utf8') : '# AGENTS\n\nProject instructions.\n';
  const occurrences = previous.split(start).length - 1;
  if (occurrences > 1) throw new Error('Multiple managed blocks; refusing an ambiguous rewrite');
  const managed = previous.includes('\r\n') ? block.replace(/\n/g, '\r\n') : block;
  const eol = previous.includes('\r\n') ? '\r\n' : '\n';
  let next;
  if (occurrences === 1) {
    const begin = previous.indexOf(start), finish = previous.indexOf(end, begin);
    if (finish < 0) throw new Error('Managed block lacks its end marker; preserve and reconcile the old section explicitly');
    next = previous.slice(0, begin) + managed + previous.slice(finish + end.length);
  } else next = previous.replace(/\s*$/, '') + eol + eol + managed + eol;

  const brief = path.join(root, 'MY_PROJECT.md');
  const briefInfo = lstat(brief);
  if (briefInfo && fs.existsSync(brief) && /\brun\.json\b/.test(fs.readFileSync(brief, 'utf8'))) {
    warnings.push('MY_PROJECT.md points at version 2 run files; update it so agents are not sent to a retired plan');
  }

  const versionFile = path.join(root, '.ai-prompts-version');
  const versionInfo = lstat(versionFile);
  if (versionInfo?.isSymbolicLink()) throw new Error('.ai-prompts-version is a symlink; preserve it and integrate deliberately');
  const previousVersion = versionInfo ? fs.readFileSync(versionFile, 'utf8').trim() : null;
  const plan = status(path.join(root, 'plan'), libraryInfo(library));

  if (next !== previous) writeAtomic(file, next);
  if (!briefInfo) fs.copyFileSync(path.join(library, 'MY_PROJECT.md.template'), brief, fs.constants.COPYFILE_EXCL);
  if (previousVersion !== version) writeAtomic(versionFile, `${version}\n`);
  const repairedLinks = repairSteeringLinks(warnings);

  console.log(JSON.stringify({
    projectRoot: root,
    library: version,
    previousVersion,
    steeringUpdated: next !== previous,
    repairedLinks,
    plan: { state: plan.state, rerunFrom: plan.rerunFrom, next: advice(plan) },
    warnings,
    preserved: 'Existing user instructions, IDE settings, plans, approvals and history are not replaced.',
  }));
} catch (error) { console.error(JSON.stringify({ code: 'BOOTSTRAP_BLOCKED', message: error.message })); process.exitCode = 1; }
