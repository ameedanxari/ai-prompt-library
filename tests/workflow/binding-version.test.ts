import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { spawnSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';
import { createFixture } from './fixture.js';
import { authorizationBinding, reviewBinding, scopeFingerprint } from '../../src/workflow/evidence.js';
import { evaluateBoundary } from '../../src/workflow/evaluate.js';
import { judgmentGate } from '../../src/workflow/review.js';
import { parseRun } from '../../src/workflow/schema.js';
import { commitRun, loadRun } from '../../src/store.js';
import { authorizeHost, createHost, initHost } from '../../src/host.js';
import type { RunContract } from '../../src/workflow/contract.js';

const cli=(root:string,args:string[])=>spawnSync(process.execPath,[path.resolve('dist/cli.js'),...args,'--project-root',root],{encoding:'utf8'});

describe('explicit scope-binding version',()=>{
  it('retains fixed historical fingerprints from the prior published example',()=>{
    const old=JSON.parse(fs.readFileSync('docs/examples/run.json','utf8')) as RunContract;delete old.policy.reviewBindingVersion;
    expect(scopeFingerprint(old)).toBe('5b99a34829a9ec570a620f6e973d1d1c9b0ec71ad33d27789f6abb2156a332bf');
    expect(reviewBinding(old,{purpose:'scope',subjectIds:['Q1']}).fingerprint).toBe('be5250a4f84180d04d846352d69a5c616502719c70d524eed5afa3fb232484cc');
    expect(authorizationBinding(old).fingerprint).toBe('ed49e172948f2cc56a25e64f9895b17a01a0ab3833b89d637922684bc5f591b0');
  });
  it('excludes only version-2 budgets from scope while enforcing budget and authorization',()=>{
    const f=createFixture();try {
      f.run.policy.reviewBindingVersion=2;f.judge('scope',['R-GREETING']);const before=structuredClone(f.run);
      const scope=scopeFingerprint(before),auth=authorizationBinding(before).fingerprint;
      f.run.policy.budget.maxDetailBytes=7000;
      expect(judgmentGate(f.run,{purpose:'scope',subjectIds:['R-GREETING']},f.context).status).toBe('pass');
      f.run.policy.budget.maxDetailBytes=1;
      expect(scopeFingerprint(f.run)).toBe(scope);expect(authorizationBinding(f.run).fingerprint).not.toBe(auth);
      expect(evaluateBoundary(f.run,{kind:'plan-reviewable'},f.context).checks.some(c=>c.code==='DETAIL_BUDGET_EXCEEDED')).toBe(true);
      // A host with only the original policy authorization cannot approve the changed policy.
      expect(evaluateBoundary(f.run,{kind:'work-executable',id:'W-CLI'},f.context).checks.some(c=>c.code==='EXECUTION_UNAUTHENTICATED')).toBe(true);
      const variants=[(x:RunContract)=>{x.sources[0].inspection='partial';},(x:RunContract)=>{x.targets[0].identity={executable:'other'};},(x:RunContract)=>{x.work[0].action='live-write';},(x:RunContract)=>{x.policy.reviews.scope=['owner'];},(x:RunContract)=>{x.policy.instruction.reference='changed-authority';},(x:RunContract)=>{x.policy.grants.push({id:'G',targetIds:['cli'],actions:['deploy'],sourceRef:{sourceId:'request',locator:'actual'},reference:'host://g'});}];
      for(const mutate of variants){const changed=structuredClone(before);mutate(changed);expect(scopeFingerprint(changed)).not.toBe(scope);}
      const old=structuredClone(before);delete old.policy.reviewBindingVersion;const oldScope=scopeFingerprint(old);old.policy.budget.maxDetailBytes++;expect(scopeFingerprint(old)).not.toBe(oldScope);
    }finally{f.cleanup();}
  });
  it('requires new-run mode and rejects existing transitions and unsupported versions via API and CLI',()=>{
    const f=createFixture();try {
      const legacy=structuredClone(f.run);f.file('legacy.json',JSON.stringify(legacy));const changed=structuredClone(legacy);changed.revision=2;changed.policy.reviewBindingVersion=2;
      expect(()=>commitRun(f.root,'legacy.json',changed,1)).toThrow(/fixed for an existing run/);f.file('candidate.json',JSON.stringify(changed));
      expect(JSON.parse(cli(f.root,['commit','legacy.json','--from','candidate.json','--expect-revision','1']).stderr).code).toBe('REVIEW_BINDING_VERSION_CHANGE');
      const next=structuredClone(legacy);next.revision=2;expect(commitRun(f.root,'legacy.json',next,1).revision).toBe(2);expect(loadRun(f.root,'legacy.json').policy.reviewBindingVersion).toBeUndefined();
      const fresh=structuredClone(f.run);fresh.policy.operationConsistency='declared-targets';fresh.policy.reviews.implementation=['independent'];
      expect(()=>commitRun(f.root,'new.json',fresh,0)).toThrow(/reviewBindingVersion/);fresh.policy.reviewBindingVersion=2;expect(commitRun(f.root,'new.json',fresh,0).revision).toBe(1);
      const drop=structuredClone(fresh);drop.revision=2;delete drop.policy.reviewBindingVersion;expect(()=>commitRun(f.root,'new.json',drop,1)).toThrow(/fixed for an existing run/);f.file('drop.json',JSON.stringify(drop));
      expect(JSON.parse(cli(f.root,['commit','new.json','--from','drop.json','--expect-revision','1']).stderr).code).toBe('REVIEW_BINDING_VERSION_CHANGE');
      const unknown=structuredClone(fresh) as any;unknown.revision=2;unknown.policy.reviewBindingVersion=99;expect(()=>parseRun(unknown)).toThrow(/unsupported review binding version/);expect(()=>scopeFingerprint(unknown)).toThrow(/Unsupported review binding version/);
      expect(()=>commitRun(f.root,'new.json',unknown,1)).toThrow(/unsupported review binding version/);
      f.file('unknown.json',JSON.stringify(unknown));expect(cli(f.root,['validate','unknown.json','--boundary','plan-reviewable']).status).toBe(1);
      expect(JSON.parse(cli(f.root,['commit','new.json','--from','unknown.json','--expect-revision','1']).stderr).code).toBe('CONTRACT_INVALID');
    }finally{f.cleanup();}
  });
  it('a newly initialized pinned host can authenticate version-2 policy',()=>{
    const f=createFixture(),outside=fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(),'versioned-host-')));try {
      f.run.policy.reviewBindingVersion=2;f.run.policy.operationConsistency='declared-targets';f.run.policy.reviews.implementation=['independent'];f.file('run.json',JSON.stringify(f.run));
      const profile={schemaVersion:1,coordinator:{id:'parent',contextId:'parent'},implementer:{id:f.run.policy.implementerId,contextId:f.run.policy.implementerContextId},instruction:{source:f.run.sources[0].binding,quote:f.run.policy.instruction.quote,reference:f.run.policy.instruction.reference,issuedAt:f.run.policy.instruction.issuedAt,execution:'reversible'},provenance:{text:'Fixture parent observed instruction',reference:'fixture://version-2'}};
      const profilePath=path.join(outside,'profile.json'),hostPath=path.join(outside,'host');fs.writeFileSync(profilePath,JSON.stringify(profile));
      initHost(hostPath,fs.realpathSync(f.root),profilePath);authorizeHost(hostPath,'run.json');
      expect(createHost(hostPath).verifyAuthorization(f.run.policy.instruction,authorizationBinding(f.run))).toBe(true);
    }finally{f.cleanup();fs.rmSync(outside,{recursive:true,force:true});}
  });
});
