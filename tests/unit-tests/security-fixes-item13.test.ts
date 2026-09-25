/**
 * Security fix proofs (item 13).
 *
 * Each test here demonstrates that one of the four item-13 defects is fixed:
 * (a) checkDependency command injection, (b) access-controller wildcard
 *     prefix confusion, (c) encryption-service salt loss, (d) input-validator
 *     path-traversal gaps.
 */
import { describe, it, expect } from 'vitest';
import { existsSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { EnvironmentDetector } from '../../src/environment/environment-detector.js';
import { AccessController } from '../../src/security/access-controller.js';
import { EncryptionService } from '../../src/security/encryption-service.js';
import { InputValidator } from '../../src/security/input-validator.js';

describe('item 13a: checkDependency command injection', () => {
  it('refuses to execute shell metacharacters smuggled in the dependency name', async () => {
    const detector = new EnvironmentDetector();
    const marker = join(tmpdir(), `dprompt-injection-probe-${process.pid}`);
    if (existsSync(marker)) rmSync(marker);

    // Old code interpolated this into sh -lc; a quote-breakout would have
    // created the marker file. The allowlist now rejects the name outright.
    const evil = `node"; touch "${marker}"; echo "`;
    const result = await detector.checkDependency(evil);

    expect(result).toBe(false);
    expect(existsSync(marker)).toBe(false);
  });

  it('still detects real dependencies and rejects unknown ones', async () => {
    const detector = new EnvironmentDetector();
    expect(await detector.checkDependency('node')).toBe(true);
    expect(await detector.checkDependency('definitely-not-a-real-binary-xyz')).toBe(false);
  });
});

describe('item 13b: access-controller wildcard prefix', () => {
  it('src/* does not match srcmalicious or srcfoo', () => {
    const ac = new AccessController();
    ac.grantRole('scoped-dev', [{ resource: 'src/*', actions: ['read'] }]);
    const principal = { id: 'u1', roles: ['scoped-dev'] };

    expect(ac.check(principal, 'src/index.ts', 'read').allowed).toBe(true);
    expect(ac.check(principal, 'src/deep/nested.ts', 'read').allowed).toBe(true);
    // Old code: pattern.slice(0, -2) -> 'src', so 'srcmalicious'.startsWith('src')
    // was true. The prefix must include the trailing '/'.
    expect(ac.check(principal, 'srcmalicious', 'read').allowed).toBe(false);
    expect(ac.check(principal, 'srcfoo/bar.ts', 'read').allowed).toBe(false);
  });
});

describe('item 13c: encryption-service salt round-trip', () => {
  it('returns the salt alongside the key so derivation is reproducible', () => {
    const svc = new EncryptionService();
    const first = svc.deriveKey('correct horse battery staple');
    expect(first.salt).toBeTruthy();
    expect(first.key).toBeInstanceOf(Buffer);

    // Same passphrase + returned salt must reproduce the same key.
    const second = svc.deriveKey('correct horse battery staple', first.salt);
    expect(second.key.equals(first.key)).toBe(true);

    // And an encrypt/decrypt round-trip works with the derived key.
    const payload = svc.encrypt('secret message', first.key);
    expect(svc.decrypt(payload, second.key)).toBe('secret message');
  });
});

describe('item 13d: input-validator path traversal', () => {
  const validator = new InputValidator();

  it.each([
    '../etc/passwd',
    '..',
    '..\\windows\\system32',
    'foo/../../etc/passwd',
    '%2e%2e%2fetc%2fpasswd',
    '%2e%2e\\secret',
  ])('flags traversal input %s', (input) => {
    const result = validator.validate(input);
    expect(result.valid).toBe(false);
    expect(result.threats.some(t => t.includes('path traversal'))).toBe(true);
  });

  it('still accepts benign input', () => {
    const result = validator.validate('hello world, version 2.0');
    expect(result.valid).toBe(true);
  });
});
