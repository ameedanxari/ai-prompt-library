import { afterEach, describe, expect, it } from 'vitest';
import { spawnSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import storage from '../../scripts/lib/task-contract.cjs';
import { readTaskContract } from '../../src/task-contract/storage.js';

const root = path.resolve(__dirname, '../..');
const dirs: string[] = [];
function fixture() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'contract-storage-'));
  dirs.push(dir);
  return path.join(dir, 'task-contract.json');
}
function python(filename: string) {
  return spawnSync('python3', ['-c',
    'import json,sys; from task_contract import load_task_contract; print(json.dumps(load_task_contract(sys.argv[1]),ensure_ascii=True))',
    filename], { encoding: 'utf8', env: { ...process.env, PYTHONPATH: path.join(root, 'scripts/lib'), PYTHONDONTWRITEBYTECODE: '1' } });
}
function report() {
  return {
    schemaVersion: 2,
    summary: { blocked: false, taskUnitCount: 30 },
    units: Array.from({ length: 30 }, (_, id) => ({ canonicalId: `tasks-a.md#T${id}`, file: 'tasks-a.md', text: '🌿"\\\n'.repeat(80) })),
    graphs: { taskUnits: { nodes: Array.from({ length: 30 }, (_, id) => ({ id, dependencies: [id - 1] })) } },
    pathClaims: [{ path: 'src/a.ts', owners: [{ canonicalId: 'tasks-a.md#T0' }] }],
    issues: [],
  };
}
afterEach(() => dirs.splice(0).forEach((dir) => fs.rmSync(dir, { recursive: true, force: true })));

describe('task contract storage', () => {
  it('retains the legacy JSON schema and both readers support existing versions', () => {
    const filename = fixture();
    for (const schemaVersion of [1, 2]) {
      const value = { schemaVersion, units: [], summary: { blocked: false } };
      storage.writeTaskContract(filename, value);
      expect(JSON.parse(fs.readFileSync(filename, 'utf8'))).toEqual(value);
      expect(readTaskContract(filename)).toEqual(value);
      expect(JSON.parse(python(filename).stdout)).toEqual(value);
    }
  });

  it('round-trips every field with deterministic bounded shards in Node and Python', () => {
    const filename = fixture();
    const value = report();
    storage.writeTaskContract(filename, value, { maxBytes: 16384 });
    const before = fs.readFileSync(filename, 'utf8');
    expect(JSON.parse(before)).toMatchObject({ storageFormat: 'task-contract-shards/v1', schemaVersion: 2, summary: value.summary });
    expect(readTaskContract(filename)).toEqual(value);
    const loaded = python(filename);
    expect(loaded.status, loaded.stderr).toBe(0);
    expect(JSON.parse(loaded.stdout)).toEqual(value);
    storage.writeTaskContract(filename, value, { maxBytes: 16384 });
    expect(fs.readFileSync(filename, 'utf8')).toBe(before);
    for (const name of fs.readdirSync(path.join(path.dirname(filename), 'task-contract-shards'))) {
      expect(fs.statSync(path.join(path.dirname(filename), 'task-contract-shards', name)).size).toBeLessThanOrEqual(16384);
    }
  });

  it('partitions huge individual Unicode/escaped fields without losing their contents', () => {
    const filename = fixture();
    const value = { schemaVersion: 2, units: [{ text: '🌿"\\\n'.repeat(4000) }], issues: [] };
    storage.writeTaskContract(filename, value, { maxBytes: 16384 });
    expect(readTaskContract(filename)).toEqual(value);
    const loaded = python(filename);
    expect(loaded.status, loaded.stderr).toBe(0);
    expect(JSON.parse(loaded.stdout)).toEqual(value);
  });

  it('prunes obsolete shards after publication, including a return to legacy output', () => {
    const filename = fixture();
    const value = report();
    storage.writeTaskContract(filename, value, { maxBytes: 16384 });
    const oldNames = fs.readdirSync(path.join(path.dirname(filename), 'task-contract-shards'));
    const replacement = { ...value, units: value.units.slice(1) };
    storage.writeTaskContract(filename, replacement, { maxBytes: 16384 });
    storage.pruneTaskContractShards(filename);
    expect(readTaskContract(filename)).toEqual(replacement);
    expect(oldNames.some((name) => !fs.existsSync(path.join(path.dirname(filename), 'task-contract-shards', name)))).toBe(true);
    storage.writeTaskContract(filename, { schemaVersion: 2, units: [] });
    storage.pruneTaskContractShards(filename);
    expect(fs.existsSync(path.join(path.dirname(filename), 'task-contract-shards'))).toBe(false);
  });

  it('preserves the published index and all its shards when generation fails', () => {
    const filename = fixture();
    storage.writeTaskContract(filename, report(), { maxBytes: 16384 });
    const before = fs.readFileSync(filename, 'utf8');
    expect(() => storage.writeTaskContract(`${filename}.tmp`, report(), { maxBytes: 1024 })).toThrow();
    expect(fs.readFileSync(filename, 'utf8')).toBe(before);
    expect(readTaskContract(filename)).toEqual(report());
    storage.pruneTaskContractShards(filename);
    expect(readTaskContract(filename)).toEqual(report());
  });

  it.each(['missing', 'corrupt', 'traversal', 'version'])('fails closed on %s shards in both readers', (failure) => {
    const filename = fixture();
    storage.writeTaskContract(filename, report(), { maxBytes: 16384 });
    const manifest = JSON.parse(fs.readFileSync(filename, 'utf8'));
    const entry = manifest.units.$taskContractShards.shards[0];
    const shard = path.join(path.dirname(filename), entry.path);
    if (failure === 'missing') fs.unlinkSync(shard);
    if (failure === 'corrupt') {
      const data = fs.readFileSync(shard, 'utf8');
      fs.writeFileSync(shard, data.replace('tasks-a', 'tasks-b'));
    }
    if (failure === 'traversal') entry.path = '../outside.json';
    if (failure === 'version') manifest.storageFormat = 'task-contract-shards/v999';
    fs.writeFileSync(filename, JSON.stringify(manifest));
    expect(() => readTaskContract(filename)).toThrow();
    expect(python(filename).status).not.toBe(0);
  });

  it.each(['fixture-isolation', 'walking-skeleton'])('preserves %s gate findings with sharded input', (gate) => {
    const filename = fixture();
    const value = { schemaVersion: 2, padding: 'x'.repeat(6000), units: [{ canonicalId: 'tasks-web.md#T1', file: 'tasks-web.md', evidenceLevel: 'ui-fixture', artifactKind: 'runtime-source', filePaths: ['web/src/app.ts'] }] };
    fs.writeFileSync(filename, JSON.stringify(value));
    const run = () => spawnSync('bash', [path.join(root, `scripts/validate-${gate}.sh`), path.dirname(filename)], { encoding: 'utf8' });
    const inline = run();
    const reportPath = path.join(path.dirname(filename), `${gate}-report.json`);
    const expected = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
    expect(expected.issues.length).toBeGreaterThan(0);
    storage.writeTaskContract(filename, value, { maxBytes: 4096 });
    const sharded = run();
    expect(sharded.status, sharded.stderr).toBe(inline.status);
    expect(JSON.parse(fs.readFileSync(reportPath, 'utf8')).issues).toEqual(expected.issues);
  });

  it('automatically bounds a production-sized contract below the safety limit', () => {
    const filename = fixture();
    const value = { schemaVersion: 2, summary: { taskUnitCount: 12 }, units: Array.from({ length: 12 }, (_, id) => ({ id, text: 'a'.repeat(1024 * 1024) })) };
    storage.writeTaskContract(filename, value);
    expect(readTaskContract(filename)).toEqual(value);
    const directory = path.dirname(filename);
    expect(fs.statSync(filename).size).toBeLessThan(10 * 1024 * 1024);
    for (const name of fs.readdirSync(path.join(directory, 'task-contract-shards'))) {
      expect(fs.statSync(path.join(directory, 'task-contract-shards', name)).size).toBeLessThan(10 * 1024 * 1024);
    }
  });
});
