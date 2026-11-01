import { afterEach, expect, it } from 'vitest';
import { createFixture } from './fixture.js';
import { evaluateBoundary } from '../../src/workflow/evaluate.js';
import { reviewBinding, scopeFingerprint } from '../../src/workflow/evidence.js';
import { planReview } from '../../src/workflow/review.js';
import { renderViews } from '../../src/views.js';
import { commitRun, loadRun } from '../../src/store.js';

const fixtures: ReturnType<typeof createFixture>[] = [];
const setup = () => { const f = createFixture(); fixtures.push(f); return f; };
afterEach(() => fixtures.splice(0).forEach(f => f.cleanup()));
const request = { purpose:'implementation' as const, subjectIds:['W-CLI'] };
const executable = (f: ReturnType<typeof createFixture>) => evaluateBoundary(f.run,{kind:'work-executable',id:'W-CLI'},f.context);
const configured = () => { const f = setup(); f.run.policy.reviews.implementation = ['independent']; f.authorize(); f.judge('scope',['R-GREETING']); return f; };

it('requires a separate authenticated detail judgment without a review/execution cycle', () => {
  const f = configured();
  expect(planReview(f.run,request,f.context).prerequisites.status).toBe('pass');
  expect(executable(f).status).toBe('pending');
  const j = f.judge('implementation',['W-CLI']);
  j.observations.push('Changed after the host recorded this judgment');
  expect(executable(f).status).toBe('pending');
  f.judge('implementation',['W-CLI']);
  expect(executable(f).status).toBe('pass');
});
it('binds selected detail and authority without binding unrelated deferred instructions', () => {
  const f = configured(); f.judge('implementation',['W-CLI']);
  const base = reviewBinding(f.run,request).fingerprint, scope = scopeFingerprint(f.run);
  f.run.work.push({...structuredClone(f.run.work[0]),id:'W-LATER',files:['later.mjs'],instructions:''});
  const withDeferred = reviewBinding(f.run,request).fingerprint;
  expect(withDeferred).toBe(base);
  f.run.work[1].instructions='Unrelated future work'; expect(reviewBinding(f.run,request).fingerprint).toBe(base);
  f.run.work.pop();
  for (const mutate of [
    () => { f.run.work[0].instructions += ' '; },
    () => { f.run.work[0].files.push('other.mjs'); },
    () => { f.run.work[0].estimate!.hours = [2,3]; },
  ]) {
    const old = structuredClone(f.run.work[0]); mutate();
    expect(reviewBinding(f.run,request).fingerprint).not.toBe(base);
    expect(scopeFingerprint(f.run)).toBe(scope);
    expect(executable(f).status).toBe('pending'); f.run.work[0] = old;
  }
  f.run.targets[0].lifecycle.dataPolicy='retain';
  expect(reviewBinding(f.run,request).fingerprint).not.toBe(base);
});
it('blocks a P1 finding even when it references a criterion, then accepts a genuinely corrected review', () => {
  const f = configured();
  f.judge('implementation',['W-CLI'],'approved','independent',{findings:[{id:'F1',severity:'P1',criterionIds:['C-OK'],message:'The file does not implement the requested result.'}]});
  expect(executable(f).status).toBe('fail');
  f.judge('implementation',['W-CLI']); expect(executable(f).status).toBe('fail');
  f.run.work[0].instructions += ' Correct the missing result.';
  expect(executable(f).status).toBe('pending');
  f.judge('implementation',['W-CLI']); expect(executable(f).status).toBe('pass');
});
it('preserves historical scope and exposes that detail review was not configured', () => {
  const f=setup(); f.judge('scope',['R-GREETING']);
  expect(executable(f).status).toBe('pass');
  expect(planReview(f.run,request,f.context).prerequisites.status).toBe('fail');
  expect(renderViews(f.run,f.context).files['OWNER-BRIEF.md']).toContain('not configured; scope review does not approve implementation details');
  f.run.policy.reviews.implementation=['independent'];
  expect(executable(f).status).toBe('pending');
});

it('prevents an opt-in run from reviving historical approvals by removing or weakening roles', () => {
  const f=setup(); f.file('run.json',JSON.stringify(f.run)); // Pre-existing legacy run, not new creation.
  const legacy=structuredClone(f.run); legacy.revision=2; commitRun(f.root,'run.json',legacy,1);
  const opted=structuredClone(legacy); opted.revision=3; opted.policy.reviews.implementation=['independent','owner']; commitRun(f.root,'run.json',opted,2);
  const downgraded=structuredClone(opted); downgraded.revision=4; delete downgraded.policy.reviews.implementation;
  expect(()=>commitRun(f.root,'run.json',downgraded,3)).toThrow(/cannot be removed/);
  downgraded.policy.reviews.implementation=['independent'];
  expect(()=>commitRun(f.root,'run.json',downgraded,3)).toThrow(/cannot be removed/);
  expect(loadRun(f.root,'run.json').policy.reviews.implementation).toEqual(['independent','owner']);
});
