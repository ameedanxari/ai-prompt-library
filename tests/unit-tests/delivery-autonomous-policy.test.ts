import * as fs from 'node:fs';
import { afterEach, describe, expect, it } from 'vitest';
import { canonical, deliveryAuthorizationBinding, getDeliveryExecutionPolicy, validateDelivery } from '../../src/delivery/index.js';
import type { TrustedAuthorizationProvider } from '../../src/delivery/index.js';
import { createDeliveryFixture, deliveryFixtureRoots } from './delivery-fixture.js';

afterEach(() => { for (const root of deliveryFixtureRoots.splice(0)) fs.rmSync(root, { recursive: true, force: true }); });

function authorizedFixture() {
  const f = createDeliveryFixture();
  const source = f.requirements.originalSources[0];
  f.manifest.authorization.instruction = { source: { ...source }, quote: 'Deliver a useful consumer result and reachable recovery.', sourceLocation: 'line 1', messageAt: '2026-01-01T00:00:00Z', reference: 'host://user-message/17', stopAfter: 'none' };
  const instruction = canonical(f.manifest.authorization.instruction);
  const binding = canonical(deliveryAuthorizationBinding(f.scope()));
  const authority: TrustedAuthorizationProvider = { verify: (i, b) => canonical(i) === instruction && canonical(b) === binding };
  f.reviewScope();
  const validate = () => validateDelivery(f.run, { stage: 'execute', trustedReviewProvider: f.provider, trustedAuthorizationProvider: authority });
  return { ...f, authority, validate };
}

describe('source-bound execution policy', () => {
  it('keeps legacy explicit policy backward compatible', () => {
    const f = createDeliveryFixture(); f.reviewScope();
    expect(f.validate('execute').valid).toBe(true);
    expect(getDeliveryExecutionPolicy(f.scope())).toMatchObject({ ordinaryTransitions: true, provenance: 'legacy-explicit' });
  });
  it('allows reversible work and ordinary transitions under authenticated actual user authority', () => {
    const f = authorizedFixture();
    expect(f.validate().valid).toBe(true);
    expect(getDeliveryExecutionPolicy(f.scope(), { trustedAuthorizationProvider: f.authority })).toMatchObject({ provenance: 'host-authenticated', reversibleExecution: true, ordinaryTransitions: true, ownerScopeChange: true, consequentialActions: false });
    expect(f.manifest.authorization.designAcceptance).toBe('independent');
  });
  it('does not turn an unverified local quote into execution authority', () => {
    const f = authorizedFixture();
    const report = validateDelivery(f.run, { stage: 'execute', trustedReviewProvider: f.provider });
    expect(report.issues.join(' ')).toContain('host authentication');
    expect(getDeliveryExecutionPolicy(f.scope()).reversibleExecution).toBe(false);
  });
  it('cannot downgrade a configured host policy by deleting the instruction', () => {
    const f = authorizedFixture(); delete f.manifest.authorization.instruction; f.reviewScope();
    expect(f.validate().issues.join(' ')).toContain('host policy requires an authenticated source-bound');
    expect(getDeliveryExecutionPolicy(f.scope(), { trustedAuthorizationProvider: f.authority })).toMatchObject({ provenance: 'unverified', reversibleExecution: false });
  });
  it('allows the host to require authenticated authority even before its provider is available', () => {
    const f = createDeliveryFixture(); f.reviewScope();
    expect(validateDelivery(f.run, { stage: 'execute', trustedReviewProvider: f.provider, requireAuthenticatedAuthorization: true }).issues.join(' ')).toContain('host policy requires');
  });
  it.each(['policy', 'quote', 'reference', 'source', 'unretained-source'] as const)('rejects changed or forged %s after host authentication', change => {
    const f = authorizedFixture();
    if (change === 'policy') f.manifest.authorization.scopeChange = 'agent-applicability';
    if (change === 'quote') f.manifest.authorization.instruction!.quote = 'invented owner permission';
    if (change === 'reference') f.manifest.authorization.instruction!.reference = 'host://forged';
    if (change === 'source') f.write('brief.md', 'Changed source instruction');
    if (change === 'unretained-source') f.manifest.authorization.instruction!.source = f.write('authority.txt', f.manifest.authorization.instruction!.quote);
    f.save();
    expect(getDeliveryExecutionPolicy(f.scope(), { trustedAuthorizationProvider: f.authority }).reversibleExecution).toBe(false);
    expect(f.validate().valid).toBe(false);
  });
  it('preserves an explicit planning stop even when the host verifies the message', () => {
    const f = authorizedFixture(); f.manifest.authorization.instruction!.stopAfter = 'planning'; f.reviewScope();
    const instruction = canonical(f.manifest.authorization.instruction); const binding = canonical(deliveryAuthorizationBinding(f.scope()));
    const authority = { verify: (i: unknown, b: unknown) => canonical(i) === instruction && canonical(b) === binding };
    expect(getDeliveryExecutionPolicy(f.scope(), { trustedAuthorizationProvider: authority })).toMatchObject({ planningStop: true, reversibleExecution: false, ordinaryTransitions: false });
    expect(validateDelivery(f.run, { stage: 'execute', trustedReviewProvider: f.provider, trustedAuthorizationProvider: authority }).issues.join(' ')).toContain('stop after planning');
  });
});
