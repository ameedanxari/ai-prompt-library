#!/usr/bin/env node
// Traceability check for a v3 plan folder: every requirement reaches a module,
// an acceptance criterion and a task; every task traces back; no dangling IDs;
// the roadmap places each task once and after its dependencies. Also totals
// task estimates per module so the stage 5 forecast starts from checked sums.
// Usage: node scripts/coverage.mjs <plan-folder> [--json]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REQ = /\bR-\d{3}\b/g;
const MOD = /\bM-\d{2}\b/g;
const AC = /\bAC-\d{2}-\d{2,3}\b/g;
const TASK = /\bT-\d{2}-\d{2,3}\b/g;

// Markdown table rows under a heading, as arrays of trimmed cells.
function rows(text, heading) {
  const lines = text.split('\n');
  const out = [];
  let inside = heading === null;
  let level = 0;
  for (const line of lines) {
    const h = /^(#+)\s+(.*)$/.exec(line);
    if (h) {
      if (heading !== null) {
        if (h[2].trim().toLowerCase().startsWith(heading.toLowerCase())) { inside = true; level = h[1].length; continue; }
        if (inside && h[1].length <= level) inside = false;
      }
      continue;
    }
    if (!inside || !line.trim().startsWith('|')) continue;
    const cells = line.trim().replace(/^\||\|$/g, '').split('|').map(c => c.trim());
    if (cells.every(c => /^:?-{3,}:?$/.test(c) || c === '')) continue;
    out.push(cells);
  }
  return out;
}

const ids = (text, re) => [...new Set(text.match(re) ?? [])];

// Index of the first header cell matching re, or -1.
const column = (header, re) => (header ?? []).findIndex(c => re.test(c));

export function check(planDir) {
  const errors = [];
  const warnings = [];
  const read = name => {
    const file = path.join(planDir, name);
    if (!fs.existsSync(file)) { errors.push(`missing file: ${name}`); return ''; }
    return fs.readFileSync(file, 'utf8');
  };

  // Requirements: rows in the brief's Requirements section whose first cell is an R-ID.
  const brief = read('02-BRIEF.md');
  const requirements = new Map();
  for (const cells of rows(brief, 'Requirements')) {
    if (!/^R-\d{3}$/.test(cells[0])) continue;
    if (requirements.has(cells[0])) errors.push(`${cells[0]}: defined twice in 02-BRIEF.md`);
    const priority = cells.find(c => /^(must|should)$/i.test(c))?.toLowerCase() ?? 'must';
    requirements.set(cells[0], { priority });
  }
  if (requirements.size === 0) errors.push('02-BRIEF.md: no requirement rows found under "Requirements"');

  // Modules and the requirement map.
  const modulesText = read('03-MODULES.md');
  const modules = new Set(rows(modulesText, 'Modules').map(c => c[0]).filter(c => /^M-\d{2}$/.test(c)));
  const owner = new Map();
  for (const cells of rows(modulesText, 'Requirement map')) {
    const [req, own] = cells;
    if (!/^R-\d{3}$/.test(req)) continue;
    const owners = ids(own ?? '', MOD);
    if (owners.length !== 1) errors.push(`${req}: requirement map needs exactly one owning module, found ${owners.length}`);
    else owner.set(req, owners[0]);
    for (const m of ids(cells.join(' '), MOD)) if (!modules.has(m)) errors.push(`${req}: references unknown module ${m}`);
  }

  // Module files: acceptance criteria and tasks.
  const modDir = path.join(planDir, 'modules');
  const criteria = new Map();
  const tasks = new Map();
  const estimates = { unit: null, byModule: {}, total: 0 };
  const files = fs.existsSync(modDir) ? fs.readdirSync(modDir).filter(f => /^M-\d{2}\.md$/.test(f)) : [];
  if (files.length === 0) errors.push('modules/: no M-##.md files');
  for (const m of modules) if (!files.includes(`${m}.md`)) errors.push(`${m}: no modules/${m}.md`);
  for (const file of files) {
    const text = fs.readFileSync(path.join(modDir, file), 'utf8');
    const prefix = file.slice(2, 4);
    for (const cells of rows(text, 'Acceptance criteria')) {
      if (!/^AC-\d{2}-\d{2,3}$/.test(cells[0])) continue;
      if (cells[0].slice(3, 5) !== prefix) errors.push(`${cells[0]}: prefix does not match ${file}`);
      if (criteria.has(cells[0])) errors.push(`${cells[0]}: defined twice`);
      criteria.set(cells[0], { file, reqs: ids(cells.slice(1).join(' '), REQ) });
    }
    const taskRows = rows(text, 'Tasks');
    const header = taskRows.find(c => c[0] === 'ID');
    const estCol = column(header, /^estimate/i);
    const depCol = column(header, /^depends/i);
    if (estCol >= 0) {
      const unit = /\(h|hours?\)/i.test(header[estCol]) ? 'hours' : /days?/i.test(header[estCol]) ? 'days' : null;
      if (estimates.unit && unit && unit !== estimates.unit) warnings.push(`${file}: estimates in ${unit}, other modules use ${estimates.unit}`);
      estimates.unit ??= unit;
    }
    for (const cells of taskRows) {
      if (!/^T-\d{2}-\d{2,3}$/.test(cells[0])) continue;
      if (cells[0].slice(2, 4) !== prefix) errors.push(`${cells[0]}: prefix does not match ${file}`);
      if (tasks.has(cells[0])) errors.push(`${cells[0]}: defined twice`);
      const rest = cells.slice(1).join(' ');
      const deps = depCol >= 0 ? ids(cells[depCol] ?? '', TASK) : [];
      tasks.set(cells[0], { file, reqs: ids(rest, REQ), acs: ids(rest, AC), deps, enabler: /\benabler\b/i.test(rest) });
      if (estCol >= 0) {
        const n = Number.parseFloat((cells[estCol] ?? '').replace(',', '.'));
        if (Number.isFinite(n)) {
          const m = `M-${prefix}`;
          estimates.byModule[m] = (estimates.byModule[m] ?? 0) + n;
          estimates.total += n;
        } else warnings.push(`${cells[0]}: estimate "${cells[estCol] ?? ''}" is not a number`);
      }
    }
  }

  // Requirement coverage.
  for (const [req, { priority }] of requirements) {
    const problems = [];
    if (!owner.has(req)) problems.push('no owning module');
    if (![...criteria.values()].some(c => c.reqs.includes(req))) problems.push('no acceptance criterion');
    if (![...tasks.values()].some(t => t.reqs.includes(req))) problems.push('no task');
    if (problems.length) (priority === 'should' ? warnings : errors).push(`${req} (${priority}): ${problems.join(', ')}`);
  }

  // Back-traceability and dangling references.
  for (const [id, c] of criteria) {
    if (c.reqs.length === 0) errors.push(`${id}: cites no requirement`);
    for (const r of c.reqs) if (!requirements.has(r)) errors.push(`${id}: cites unknown ${r}`);
    if (![...tasks.values()].some(t => t.acs.includes(id))) errors.push(`${id}: no task delivers it`);
  }
  for (const [id, t] of tasks) {
    if (t.reqs.length === 0 && !t.enabler) errors.push(`${id}: covers no requirement and is not marked enabler`);
    for (const r of t.reqs) if (!requirements.has(r)) errors.push(`${id}: covers unknown ${r}`);
    for (const a of t.acs) if (!criteria.has(a)) errors.push(`${id}: refers to unknown ${a}`);
    for (const d of t.deps) if (!tasks.has(d)) errors.push(`${id}: depends on unknown ${d}`);
  }

  // Roadmap: every task placed exactly once, after its dependencies, no unknown tasks.
  // A task's position is (milestone section, order number); sections are level-2 headings.
  const roadmapFile = path.join(planDir, '05-ROADMAP.md');
  let placed = null;
  if (fs.existsSync(roadmapFile)) {
    const roadmap = fs.readFileSync(roadmapFile, 'utf8');
    placed = new Map();
    const position = new Map();
    let section = 0;
    for (const line of roadmap.split('\n')) {
      if (/^##\s/.test(line)) { section++; continue; }
      // Task-order rows only: "| <order number> | <task ID> ... |".
      const cells = line.trim().startsWith('|') ? line.trim().replace(/^\||\|$/g, '').split('|').map(c => c.trim()) : [];
      if (!/^\d+$/.test(cells[0] ?? '')) continue;
      const id = /^T-\d{2}-\d{2,3}\b/.exec(cells[1] ?? '')?.[0];
      if (!id) continue;
      placed.set(id, (placed.get(id) ?? 0) + 1);
      if (!position.has(id)) position.set(id, [section, Number(cells[0])]);
    }
    const before = ([s1, o1], [s2, o2]) => s1 < s2 || (s1 === s2 && o1 < o2);
    for (const [id, t] of tasks) {
      const at = position.get(id);
      if (!at) continue;
      for (const d of t.deps) {
        const dat = position.get(d);
        if (dat && !before(dat, at)) errors.push(`${id}: placed before its dependency ${d}`);
      }
    }
    for (const id of tasks.keys()) {
      const n = placed.get(id) ?? 0;
      if (n !== 1) errors.push(`${id}: placed in the roadmap ${n} times (expected 1)`);
    }
    for (const id of placed.keys()) if (!tasks.has(id)) errors.push(`roadmap: unknown task ${id}`);
  } else warnings.push('05-ROADMAP.md not found: roadmap placement not checked');

  return {
    counts: { requirements: requirements.size, modules: modules.size, criteria: criteria.size, tasks: tasks.size, placedTasks: placed ? placed.size : null },
    estimates,
    errors,
    warnings,
  };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const dir = process.argv[2];
  if (!dir) { console.error('usage: node scripts/coverage.mjs <plan-folder> [--json]'); process.exit(2); }
  const result = check(path.resolve(dir));
  if (process.argv.includes('--json')) console.log(JSON.stringify(result, null, 2));
  else {
    const c = result.counts;
    console.log(`requirements ${c.requirements} · modules ${c.modules} · criteria ${c.criteria} · tasks ${c.tasks}${c.placedTasks === null ? '' : ` · placed ${c.placedTasks}`}`);
    const e = result.estimates;
    if (e.total) console.log(`estimates (${e.unit ?? 'unknown unit'}): ${Object.entries(e.byModule).map(([m, n]) => `${m} ${n}`).join(' · ')} · total ${e.total}`);
    for (const w of result.warnings) console.log(`warning: ${w}`);
    for (const e of result.errors) console.log(`error: ${e}`);
    console.log(result.errors.length ? `FAIL: ${result.errors.length} error(s)` : 'PASS');
  }
  process.exitCode = result.errors.length ? 1 : 0;
}
