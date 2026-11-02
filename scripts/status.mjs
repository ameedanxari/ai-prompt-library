#!/usr/bin/env node
// Plan freshness check: reads the stamp each stage writes on the first line of
// its output (<!-- ai-prompt-library 3.2.0 · stage 2 -->) and compares it with
// the version in which that stage last changed (prompts/stage-versions.json).
// Reports which stages are stale or missing and the earliest one to re-run.
// Usage: node scripts/status.mjs [plan-folder] [--json] [--check]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const library = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const STAMP = /<!--\s*ai-prompt-library\s+v?(\d+\.\d+\.\d+)\b[^>]*?stage\s+(\d)\s*-->/i;
// Files without a stamp predate stamping, so they are treated as this version.
const UNSTAMPED = '3.0.0';

export function libraryInfo(dir = library) {
  const version = JSON.parse(fs.readFileSync(path.join(dir, 'package.json'), 'utf8')).version;
  const stages = JSON.parse(fs.readFileSync(path.join(dir, 'prompts', 'stage-versions.json'), 'utf8')).stages;
  return { version, stages };
}

// Release numbers only; a prerelease suffix (3.2.0-rc.1) compares as its release.
function parts(v) {
  const m = /^v?(\d+)\.(\d+)\.(\d+)/.exec(String(v ?? ''));
  if (!m) throw new Error(`not a version: ${v}`);
  return m.slice(1).map(Number);
}
export function older(a, b) {
  const [x, y] = [parts(a), parts(b)];
  for (let i = 0; i < 3; i++) if (x[i] !== y[i]) return x[i] < y[i];
  return false;
}

export function readStamp(file) {
  const head = fs.readFileSync(file, 'utf8').split('\n').slice(0, 5).join('\n');
  const m = STAMP.exec(head);
  return m ? { version: m[1], stage: Number(m[2]) } : null;
}

// Planning outputs per stage, relative to the plan folder.
function outputs(planDir) {
  const list = dir => fs.existsSync(path.join(planDir, dir))
    ? fs.readdirSync(path.join(planDir, dir)).filter(f => f.endsWith('.md')).sort().map(f => `${dir}/${f}`)
    : [];
  return {
    1: ['01-SOURCES.md'],
    2: ['02-BRIEF.md'],
    3: ['03-ARCHITECTURE.md', '03-MODULES.md'],
    4: list('modules').filter(f => /^modules\/M-\d{2}\.md$/.test(f)),
    5: ['05-ROADMAP.md'],
    6: list('reviews'),
  };
}

export function status(planDir, info = libraryInfo()) {
  const result = { library: info.version, plan: planDir, state: 'current', rerunFrom: null, files: [], warnings: [] };
  if (!fs.existsSync(planDir)) {
    result.state = 'none';
    result.rerunFrom = 1;
    return result;
  }
  const byStage = outputs(planDir);
  const exists = rel => fs.existsSync(path.join(planDir, rel));
  // Outputs are missing only below the furthest planning stage already run.
  let furthest = 0;
  for (let stage = 1; stage <= 5; stage++) if (byStage[stage].some(exists)) furthest = stage;
  if (furthest === 0) {
    result.state = 'none';
    result.rerunFrom = 1;
    return result;
  }
  if (furthest > 4 && byStage[4].length === 0) byStage[4] = ['modules/'];
  // A planning stage builds on every earlier one, so its output must be at least as
  // new as the latest change to any stage up to it. Reviews only track stage 6.
  let required = '0.0.0';
  for (let stage = 1; stage <= 6; stage++) {
    const own = info.stages[String(stage)];
    if (!own) throw new Error(`stage-versions.json has no entry for stage ${stage}`);
    if (stage <= 5 && older(required, own)) required = own;
    const current = stage <= 5 ? required : own;
    for (const rel of byStage[stage]) {
      if (!exists(rel) || rel.endsWith('/')) {
        if (stage <= furthest) result.files.push({ file: rel, stage, generatedWith: null, current, state: 'missing' });
        continue;
      }
      const stamp = readStamp(path.join(planDir, rel));
      const generatedWith = stamp?.version ?? null;
      const outdated = older(generatedWith ?? UNSTAMPED, current);
      const state = !outdated ? 'current' : stamp ? 'stale' : 'unstamped';
      if (stamp && stamp.stage !== stage) result.warnings.push(`${rel}: stamp says stage ${stamp.stage}, expected stage ${stage}`);
      if (generatedWith && older(info.version, generatedWith)) result.warnings.push(`${rel}: written by library ${generatedWith}, newer than the installed ${info.version}; update .ai-prompts`);
      result.files.push({ file: rel, stage, generatedWith, current, state });
    }
  }
  // Reviews (stage 6) never force a re-run; once their stage is regenerated they are history.
  const bad = result.files.filter(f => f.stage <= 5 && f.state !== 'current');
  if (bad.length) {
    result.rerunFrom = Math.min(...bad.map(f => f.stage));
    result.state = bad.some(f => f.state === 'missing') ? 'incomplete' : 'stale';
    // Later stages build on the earliest stale one, so they are re-run too.
    for (const f of result.files) if (f.stage > result.rerunFrom && f.stage <= 5 && f.state === 'current') f.state = 'downstream';
  } else if (furthest < 5) {
    result.state = 'partial';
    result.rerunFrom = furthest + 1;
  }
  return result;
}

export function advice(result) {
  if (result.state === 'none') return 'No plan yet: run stages 1–5 in order (see .ai-prompts/prompts/README.md).';
  if (result.state === 'current') return 'Plan is current for this library version.';
  if (result.state === 'partial') return `Plan is current through stage ${result.rerunFrom - 1}; continue with stage ${result.rerunFrom}.`;
  const from = result.rerunFrom;
  const range = from === 5 ? 'stage 5' : `stages ${from}–5 in order`;
  return `Re-run ${range}${from <= 4 ? ' (stage 4 once per module)' : ''}, updating the files in place and keeping their IDs. Then run the coverage check; stage 6 critique is optional.`;
}

const realpath = p => { try { return fs.realpathSync(p); } catch { return path.resolve(p); } };
if (process.argv[1] && realpath(process.argv[1]) === realpath(fileURLToPath(import.meta.url))) {
  const args = process.argv.slice(2);
  const dir = path.resolve(args.find(a => !a.startsWith('--')) ?? 'plan');
  const result = status(dir);
  if (args.includes('--json')) console.log(JSON.stringify({ ...result, advice: advice(result) }, null, 2));
  else {
    console.log(`ai-prompt-library ${result.library} · plan: ${path.relative(process.cwd(), dir) || '.'}`);
    for (const f of result.files.filter(f => f.stage <= 5)) {
      const note = f.state === 'stale' ? ` (stages up to ${f.stage} changed in ${f.current})`
        : f.state === 'unstamped' ? ` (no stamp; treated as ${UNSTAMPED}, stages up to ${f.stage} changed in ${f.current})`
        : f.state === 'downstream' ? ` (builds on stage ${result.rerunFrom}, which is re-run)` : '';
      console.log(`stage ${f.stage}  ${f.file}  ${f.generatedWith ?? '-'}  ${f.state}${note}`);
    }
    const reviews = result.files.filter(f => f.stage === 6);
    if (reviews.length) console.log(`stage 6  reviews/  ${reviews.length} file(s): history, never required (${reviews.filter(f => f.state === 'current').length} written by the current critique)`);
    for (const w of result.warnings) console.log(`warning: ${w}`);
    console.log(advice(result));
  }
  if (args.includes('--check') && result.state !== 'current') process.exitCode = 1;
}
