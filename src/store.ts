import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import type { RunContract } from './workflow/contract.js';
import { parseRun } from './workflow/schema.js';
import { validateGraph } from './workflow/graph.js';
import { evaluateRun } from './workflow/evaluate.js';

export class StoreError extends Error {
  constructor(public readonly code: string, message: string) { super(message); this.name = 'StoreError'; }
}
export const stable = (value: unknown): string => JSON.stringify(value, (_, v: unknown) =>
  v && typeof v === 'object' && !Array.isArray(v)
    ? Object.fromEntries(Object.entries(v).sort(([a], [b]) => a.localeCompare(b))) : v);
export const sha256 = (value: string | Buffer): string => crypto.createHash('sha256').update(value).digest('hex');

/** File paths may be absolute at the CLI boundary, but never escape the chosen project. */
export function projectPath(root: string, name: string): string {
  const base = fs.realpathSync(root);
  const file = path.resolve(base, name);
  const rel = path.relative(base, file);
  if (!rel || rel.startsWith(`..${path.sep}`) || rel === '..' || path.isAbsolute(rel))
    throw new StoreError('PATH_OUTSIDE_PROJECT', 'Select a file inside the project root');
  let cursor = base;
  for (const part of rel.split(path.sep)) {
    cursor = path.join(cursor, part);
    if (fs.existsSync(cursor) || isDanglingLink(cursor)) {
      if (fs.lstatSync(cursor).isSymbolicLink()) throw new StoreError('SYMLINK_PATH', `Symlink not allowed: ${rel}`);
    }
  }
  return file;
}
function isDanglingLink(file: string): boolean { try { return fs.lstatSync(file).isSymbolicLink(); } catch { return false; } }
export function readJson(file: string): unknown {
  const size = fs.statSync(file).size;
  if (size > 10 * 1024 * 1024) throw new StoreError('INPUT_TOO_LARGE', 'JSON input exceeds 10 MiB');
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}
export function loadRun(root: string, file: string): RunContract { return parseRun(readJson(projectPath(root, file))); }
function syncDirectory(directory: string): void {
  let fd: number | undefined;
  try { fd = fs.openSync(directory, 'r'); fs.fsyncSync(fd); }
  catch (error) { if (!['EINVAL', 'EPERM', 'EISDIR'].includes((error as NodeJS.ErrnoException).code ?? '')) throw error; }
  finally { if (fd !== undefined) fs.closeSync(fd); }
}
function durableFile(file: string, contents: string): void {
  const fd = fs.openSync(file, 'wx', 0o600);
  try { fs.writeFileSync(fd, contents); fs.fsyncSync(fd); } finally { fs.closeSync(fd); }
}
function preserveRecords(previous: RunContract, next: RunContract): void {
  for (const key of ['evidence', 'judgments'] as const) {
    if (next[key].length < previous[key].length || previous[key].some((record, index) => stable(record) !== stable(next[key][index])))
      throw new StoreError('HISTORY_REWRITE', `${key} are append-only; retain previous records in order`);
  }
  // Scope edits may revise retained obligations, but cannot silently erase their identities.
  for (const key of ['sources', 'requirements'] as const) {
    if (previous[key].some(old => !next[key].some(current => current.id === old.id)))
      throw new StoreError('OBLIGATION_REMOVED', `Retain original ${key} identities and explicitly review any changed disposition`);
  }
}
export interface CommitResult { runId: string; revision: number; file: string; digest: string; history?: string }
export function commitRun(root: string, fileName: string, candidate: unknown, expectedRevision: number): CommitResult {
  if (!Number.isSafeInteger(expectedRevision) || expectedRevision < 0) throw new StoreError('REVISION_REQUIRED', 'Expected revision must be a nonnegative integer');
  const next = parseRun(candidate);
  const issues = validateGraph(next);
  if (issues.length) throw new StoreError('GRAPH_INVALID', issues.map(x => `${x.code}: ${x.message}`).join('\n'));
  const integrity = evaluateRun(next, { projectRoot: root }).integrity;
  if (integrity.status !== 'pass') throw new StoreError('INPUT_INTEGRITY', integrity.checks.filter(c => c.status === 'fail').map(c => `${c.code}: ${c.message}`).join('\n'));
  const file = projectPath(root, fileName);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  projectPath(root, file);
  const lock = `${file}.lock`;
  let lockFd: number;
  try { lockFd = fs.openSync(lock, 'wx', 0o600); }
  catch (error) { if ((error as NodeJS.ErrnoException).code === 'EEXIST') throw new StoreError('WRITE_LOCKED', 'Another write owns this run. A crashed writer leaves a lock for explicit inspection.'); throw error; }
  const temp = `${file}.${crypto.randomUUID()}.tmp`;
  let history: string | undefined;
  try {
    fs.writeFileSync(lockFd, JSON.stringify({ pid: process.pid, createdAt: new Date().toISOString() }));
    const previous = fs.existsSync(file) ? loadRun(root, file) : undefined;
    if ((previous?.revision ?? 0) !== expectedRevision) throw new StoreError('REVISION_CONFLICT', `Expected ${expectedRevision}; actual ${previous?.revision ?? 0}`);
    if (next.revision !== expectedRevision + 1) throw new StoreError('REVISION_SEQUENCE', 'Candidate revision must be expected revision + 1');
    if (previous) {
      if (next.runId !== previous.runId) throw new StoreError('RUN_ID_CHANGED', 'Create a separate run to change identity');
      preserveRecords(previous, next);
      const bytes = fs.readFileSync(file, 'utf8');
      history = projectPath(root, path.join(path.dirname(file), '.history', path.basename(file), `${previous.revision}-${sha256(bytes)}.json`));
      fs.mkdirSync(path.dirname(history), { recursive: true });
      if (fs.existsSync(history)) {
        if (fs.readFileSync(history, 'utf8') !== bytes) throw new StoreError('HISTORY_TAMPERED', 'Retained revision bytes do not match');
      } else durableFile(history, bytes);
      syncDirectory(path.dirname(history));
    }
    const bytes = `${JSON.stringify(next, null, 2)}\n`;
    durableFile(temp, bytes);
    fs.renameSync(temp, file);
    syncDirectory(path.dirname(file));
    return { runId: next.runId, revision: next.revision, file, digest: sha256(bytes), ...(history ? { history } : {}) };
  } finally {
    if (fs.existsSync(temp)) fs.unlinkSync(temp);
    fs.closeSync(lockFd);
    fs.unlinkSync(lock);
  }
}

/** Inspect historical bytes without importing their approvals or mutating any files. */
export function inspectLegacy(file: string): Record<string, unknown> {
  const absolute = path.resolve(file);
  const data = readJson(absolute) as Record<string, unknown>;
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new StoreError('LEGACY_FORMAT', 'Expected a historical JSON object');
  const legacy = data.schemaVersion === 1 || data.schemaVersion === 2;
  return { file: absolute, sha256: sha256(fs.readFileSync(absolute)), schemaVersion: data.schemaVersion ?? null,
    recognizedLegacy: legacy, currentModel: data.schemaVersion === 3 && data.kind === 'canonical-workflow',
    summary: { runId: data.runId ?? null, outcomes: Array.isArray(data.outcomes) ? data.outcomes.length : null },
    readiness: 'unassessed', migrationPerformed: false,
    guidance: 'Historical validity/approval does not establish current readiness. Preserve this run; use its original library version to reproduce old checks.' };
}
