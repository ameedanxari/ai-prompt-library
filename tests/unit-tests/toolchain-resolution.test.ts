import { describe, expect, it } from 'vitest';
import { spawnSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';

const REPO_ROOT = path.resolve(__dirname, '..', '..');
const TOOLCHAIN = path.join(REPO_ROOT, 'scripts', 'lib', 'toolchain.sh');

function shell(script: string, env: NodeJS.ProcessEnv = {}): { code: number; out: string } {
  const result = spawnSync('/bin/bash', ['-c', script], {
    encoding: 'utf8',
    env: {
      HOME: os.homedir(),
      PATH: '/usr/bin:/bin',
      ...env,
    },
  });
  return {
    code: result.status ?? 1,
    out: `${result.stdout ?? ''}${result.stderr ?? ''}`,
  };
}

describe('scripts/lib/toolchain.sh', () => {
  it('resolves a configured bundled Node with a sanitized PATH', () => {
    const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), 'toolchain-node-'));
    try {
      const fakeNode = path.join(sandbox, 'runtime', 'bin', 'node');
      fs.mkdirSync(path.dirname(fakeNode), { recursive: true });
      fs.writeFileSync(fakeNode, '#!/bin/sh\nprintf "v-bundled-test\\n"\n', 'utf8');
      fs.chmodSync(fakeNode, 0o755);

      const result = shell(
        `source "${TOOLCHAIN}"; resolve_node >/dev/null; printf '%s|%s|%s\\n' "$RESOLVED_NODE" "$TOOLCHAIN_LAST_DECISION" "$(tool_version "$RESOLVED_NODE")"`,
        {
          AI_PROMPT_BUNDLED_NODE: fakeNode,
          AI_PROMPT_TOOLCHAIN_LOCAL_LOOKUP: '0',
        },
      );

      expect(result.code).toBe(0);
      expect(result.out).toContain(`${fakeNode}|configured AI_PROMPT_BUNDLED_NODE: ${fakeNode}|v-bundled-test`);
    } finally {
      fs.rmSync(sandbox, { recursive: true, force: true });
    }
  });

  it('emits one precise prerequisite error when Node is unavailable', () => {
    const result = shell(
      `source "${TOOLCHAIN}"; require_tool node resolve_node`,
      {
        AI_PROMPT_TOOLCHAIN_LOCAL_LOOKUP: '0',
        AI_PROMPT_TOOLCHAIN_PATH_LOOKUP: '0',
      },
    );

    expect(result.code).toBe(1);
    expect(result.out.match(/toolchain prerequisite error:/g)).toHaveLength(1);
    expect(result.out).toMatch(/required tool 'node' is unavailable/);
    expect(result.out).toMatch(/configured, bundled, package-local, and PATH candidates/);
  });

  it('preserves the prior report when an atomic producer fails', () => {
    const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), 'toolchain-atomic-'));
    try {
      const report = path.join(sandbox, 'report.json');
      fs.writeFileSync(report, '{"state":"valid"}\n', 'utf8');

      const result = shell([
        `source "${TOOLCHAIN}"`,
        'produce_failure() { printf \'{"state":"partial"}\\n\' > "$1"; return 7; }',
        `if write_atomic_report "${report}" produce_failure; then exit 9; fi`,
        'printf "%s\\n" "$ATOMIC_REPORT_STATUS"',
      ].join('; '));

      expect(result.code).toBe(0);
      expect(result.out).toMatch(/producer failed; prior report preserved/);
      expect(fs.readFileSync(report, 'utf8')).toBe('{"state":"valid"}\n');
      expect(fs.readdirSync(sandbox).filter((name) => name.includes('.tmp.'))).toEqual([]);
    } finally {
      fs.rmSync(sandbox, { recursive: true, force: true });
    }
  });
});
