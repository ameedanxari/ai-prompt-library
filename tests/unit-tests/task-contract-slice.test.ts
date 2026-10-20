import storage from '../../scripts/lib/task-contract.cjs';
import { afterEach, describe, expect, it } from 'vitest';
import { spawnSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';

const REPO_ROOT = path.resolve(__dirname, '..', '..');
const SCRIPT = path.join(REPO_ROOT, 'scripts', 'task-contract-slice.sh');

const dirs: string[] = [];

function unit(file: string, id: string) {
  return {
    id,
    canonicalId: `${file}#${id}`,
    file,
    title: `Unit ${id}`,
    filePaths: [`src/${id.toLowerCase()}.ts`],
    test: `npm test -- ${id}`,
  };
}

function fixture(): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'contract-slice-'));
  dirs.push(dir);
  const contract = {
    schemaVersion: 2,
    units: [
      unit('remediation-alpha.md', 'R1'),
      unit('remediation-alpha.md', 'R3'),
      unit('tasks-beta.md', 'T1'),
      unit('tasks-beta.md', 'R3'),
    ],
  };
  fs.writeFileSync(path.join(dir, 'task-contract.json'), JSON.stringify(contract));
  return dir;
}

function run(args: string[]): { code: number; out: string; err: string } {
  const result = spawnSync('/bin/bash', [SCRIPT, ...args], { encoding: 'utf8' });
  return { code: result.status ?? -1, out: result.stdout, err: result.stderr };
}

afterEach(() => {
  while (dirs.length) fs.rmSync(dirs.pop()!, { recursive: true, force: true });
});

describe('task-contract-slice.sh', () => {
  it('selects the same packet from a sharded contract', () => {
    const dir = fixture();
    const filename = path.join(dir, 'task-contract.json');
    const value = JSON.parse(fs.readFileSync(filename, 'utf8'));
    value.padding = 'x'.repeat(6000);
    storage.writeTaskContract(filename, value, { maxBytes: 4096 });
    const result = run([dir, 'tasks-beta.md', 'T1']);
    expect(result.code).toBe(0);
    expect(JSON.parse(result.out).map((u: { canonicalId: string }) => u.canonicalId)).toEqual(['tasks-beta.md#T1']);
  });
  it('prints only the units of a remediation packet', () => {
    const dir = fixture();
    const { code, out } = run([dir, 'remediation-alpha.md']);
    expect(code).toBe(0);
    const units = JSON.parse(out);
    expect(units.map((u: { canonicalId: string }) => u.canonicalId)).toEqual([
      'remediation-alpha.md#R1',
      'remediation-alpha.md#R3',
    ]);
  });

  it('prints only the units of a tasks packet', () => {
    const dir = fixture();
    const { code, out } = run([dir, 'tasks-beta.md']);
    expect(code).toBe(0);
    expect(JSON.parse(out)).toHaveLength(2);
  });

  it('filters to one unit id, without leaking the same id from another packet', () => {
    const dir = fixture();
    const { code, out } = run([dir, 'remediation-alpha.md', 'R3']);
    expect(code).toBe(0);
    const units = JSON.parse(out);
    expect(units).toHaveLength(1);
    expect(units[0].canonicalId).toBe('remediation-alpha.md#R3');
  });

  it('accepts PLAN_FILE#UNIT as the unit id', () => {
    const dir = fixture();
    const { code, out } = run([dir, 'tasks-beta.md', 'tasks-beta.md#T1']);
    expect(code).toBe(0);
    expect(JSON.parse(out)[0].id).toBe('T1');
  });

  it('exits 1 when the packet or the unit does not match', () => {
    const dir = fixture();
    expect(run([dir, 'remediation-missing.md']).code).toBe(1);
    const unitMiss = run([dir, 'remediation-alpha.md', 'R99']);
    expect(unitMiss.code).toBe(1);
    expect(unitMiss.out).toBe('');
  });

  it('exits 2 on usage errors', () => {
    const dir = fixture();
    expect(run([]).code).toBe(2);
    expect(run([dir, 'remediation-alpha.md', 'R1', 'extra']).code).toBe(2);
    expect(run([dir, 'remediation-alpha.md', '--bogus']).code).toBe(2);
  });

  it('exits 2 when the contract is missing', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'contract-slice-empty-'));
    dirs.push(dir);
    const { code, err } = run([dir, 'remediation-alpha.md']);
    expect(code).toBe(2);
    expect(err).toContain('task contract not found');
  });
});
