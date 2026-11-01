/** Repair verification and boundary coherence; all host authorizations are SIMULATED. */
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { afterEach, describe, expect, it } from 'vitest';
import { independentHarness } from './harness.js';
import { evaluateBoundary, evaluateRun } from '../../src/workflow/evaluate.js';
import { evidenceBinding, grantBinding, proofFingerprint, resourceBinding, scopeFingerprint, validateEvidence } from '../../src/workflow/evidence.js';
import { validateGraph } from '../../src/workflow/graph.js';
import { planReview } from '../../src/workflow/review.js';
import type { Evidence } from '../../src/workflow/contract.js';

const fixtures:ReturnType<typeof independentHarness>[]=[];
const setup=()=>{const f=independentHarness();fixtures.push(f);return f;};
afterEach(()=>fixtures.splice(0).forEach(f=>f.cleanup()));
const codes=(g:{checks:{code:string}[]})=>g.checks.map(c=>c.code);
const scope=(f:ReturnType<typeof setup>)=>f.judge('scope',f.run.requirements.map(q=>q.id));
function addNext(f:ReturnType<typeof setup>) {
  f.run.criteria.push({...structuredClone(f.run.criteria[0]),id:'K-NEXT-SUCCESS'},{...structuredClone(f.run.criteria[1]),id:'K-NEXT-RECOVERY'});
  f.run.outcomes.push({...structuredClone(f.run.outcomes[0]),id:'O-NEXT',criterionIds:['K-NEXT-SUCCESS','K-NEXT-RECOVERY']});
  f.run.work.push({...structuredClone(f.run.work[0]),id:'W-NEXT',outcomeIds:['O-NEXT'],criterionIds:['K-NEXT-SUCCESS','K-NEXT-RECOVERY'],files:['next.mjs'],instructions:''});
}
function checkpointFixture() {
  const f=setup();f.run.policy.checkpoints='every-proof';addNext(f);f.trustAuth();scope(f);f.observe();f.run.criteria.slice(0,2).forEach(c=>f.judge('semantic',[c.id]));
  f.run.activeWorkIds=['W-NEXT'];f.run.work[1].instructions='Implement the bounded next consumer after actual owner continuation.';
  return f;
}
function success(f:ReturnType<typeof setup>) { f.observe();f.approve(); }
function reviewedRelease(f:ReturnType<typeof setup>) { f.judge('release',['R1']);return evaluateRun(f.run,f.context).releases.R1; }

describe('independent repair and checkpoint/release boundary verification',()=>{
  it('retains per-proof stop across a valid acknowledgment and rejects forged, stale and altered acknowledgment bytes',()=>{
    const f=checkpointFixture();expect(evaluateRun(f.run,f.context).proof.status).toBe('pass');expect(codes(evaluateRun(f.run,f.context).work['W-NEXT'].executable)).toContain('USER_CHECKPOINT_REQUIRED');
    const before=scopeFingerprint(f.run);const ack=f.acknowledge();expect(scopeFingerprint(f.run)).toBe(before);expect(evaluateRun(f.run,f.context).work['W-NEXT'].executable.status).toBe('pass');expect(f.run.policy.checkpoints).toBe('every-proof');
    ack.instruction.reference='simulation://unregistered';expect(codes(evaluateRun(f.run,f.context).work['W-NEXT'].executable)).toContain('USER_CHECKPOINT_REQUIRED');f.acknowledge();
    f.file(f.run.policy.checkpointAcknowledgment!.instruction.source.path,'A different person gave no continuation');expect(codes(evaluateRun(f.run,f.context).work['W-NEXT'].executable)).toContain('USER_CHECKPOINT_REQUIRED');
    f.acknowledge();f.record('K-SUCCESS','consumer','{"new":"current observation of same program"}');f.judge('semantic',['K-SUCCESS']);expect(evaluateRun(f.run,f.context).proof.status).toBe('pass');expect(codes(evaluateRun(f.run,f.context).work['W-NEXT'].executable)).toContain('USER_CHECKPOINT_REQUIRED');
  });

  it('unrelated future evidence does not silently replace or invalidate the named proof acknowledgment',()=>{
    const f=checkpointFixture();f.acknowledge();const old=proofFingerprint(f.run);f.record('K-NEXT-SUCCESS','consumer','{"future":"unrelated observation"}');
    expect(proofFingerprint(f.run)).toBe(old);expect(evaluateRun(f.run,f.context).work['W-NEXT'].executable.status).toBe('pass');
  });

  it('a checkpoint acknowledgment never grants live-operation authority',()=>{
    const f=checkpointFixture();f.run.work[1].action='send';f.trustAuth();scope(f);f.acknowledge();
    const result=evaluateRun(f.run,f.context).work['W-NEXT'].executable;expect(codes(result)).toContain('ACTION_AUTHORITY_REQUIRED');expect(result.status).not.toBe('pass');
  });

  it('R1 retains shared non-waivable recovery, ignores unrelated R2 and requires its own exact release judgment',()=>{
    const f=setup();addNext(f);f.run.requirements.push({id:'Q-R2',description:'Future paid consumer release',sourceRefs:[f.ref],criterionIds:['K-NEXT-SUCCESS','K-NEXT-RECOVERY'],releaseIds:['R2'],mandatory:true});f.run.outcomes[1].requirementIds=['Q-R2'];f.run.releases.push({id:'R2',title:'Future paid work',outcomeIds:['O-NEXT'],sharedCriterionIds:[],sourceRefs:[f.ref],inputs:[]});
    f.run.releases[0].sharedCriterionIds=['K-RECOVERY'];success(f);expect(reviewedRelease(f).status).toBe('pass');expect(evaluateRun(f.run,f.context).releases.R2.status).not.toBe('pass');
    const named=f.run.judgments.find(j=>j.purpose==='release')!;named.subjectIds=['R2'];expect(evaluateRun(f.run,f.context).releases.R1.status).toBe('pending');named.subjectIds=['R1'];
    f.run.evidence=f.run.evidence.filter(e=>e.criterionId!=='K-RECOVERY');expect(evaluateRun(f.run,f.context).releases.R1.status).not.toBe('pass');
  });

  it('a producer-work dependency cannot omit semantic review of its actual release-closure criterion',()=>{
    const f=setup();addNext(f);f.run.work[1].inputs=[];f.run.outcomes[0].inputs=[{kind:'work',id:'W-NEXT'}];success(f);
    f.record('K-NEXT-SUCCESS','consumer','{"next":"actual producer result"}');f.record('K-NEXT-SUCCESS','build','{"exitCode":0}');f.record('K-NEXT-RECOVERY','consumer','{"next":"producer recovery"}');
    const request={purpose:'release' as const,subjectIds:['R1']};expect(planReview(f.run,request,f.context).action).toBe('blocked');expect(codes(planReview(f.run,request,f.context).prerequisites)).toContain('REVIEW_REQUIRED');
    f.judge('semantic',['K-NEXT-SUCCESS']);f.judge('semantic',['K-NEXT-RECOVERY']);expect(planReview(f.run,request,f.context).action).toBe('review');expect(reviewedRelease(f).status).toBe('pass');
  });

  it('every selected release observation requires production composition; controlled provider and changed target revision fail',()=>{
    const f=setup();success(f);expect(reviewedRelease(f).status).toBe('pass');
    f.record('K-SUCCESS','build','{"exitCode":0,"controlled":true}',{production:false});expect(codes(evaluateRun(f.run,f.context).releases.R1)).toContain('RELEASE_COMPOSITION_REQUIRED');
    f.run.targets[0].providerMode='controlled';scope(f);expect(codes(evaluateRun(f.run,f.context).releases.R1)).toContain('REAL_RELEASE_TARGET_REQUIRED');
    f.run.targets[0].providerMode='real';f.run.targets[0].revision='candidate-new';scope(f);expect(evaluateRun(f.run,f.context).releases.R1.status).not.toBe('pass');
  });

  it('authority target identities and their retained source bytes bind grants/resources while ordinary implementation revision alone does not change operator scope',()=>{
    const f=setup();f.run.policy.grants.push({id:'G',targetIds:['local-cli'],actions:['read'],sourceRef:f.ref,reference:'simulation://grant/stable'});f.run.resources.push({id:'A',description:'Actual access',kind:'access',targetId:'local-cli',status:'available',sourceRefs:[f.ref],reference:'simulation://access/stable'});
    const grant=grantBinding(f.run,'G');const access=resourceBinding(f.run,'A');f.run.targets[0].revision='ordinary-code-rebuild';expect(grantBinding(f.run,'G')).toEqual(grant);expect(resourceBinding(f.run,'A')).toEqual(access);
    const text=fs.readFileSync(path.join(f.root,'OWNER.txt'),'utf8');f.run.sources[0].binding=f.file('OWNER.txt',text+'\nAccess now limited to a different archive.');expect(grantBinding(f.run,'G')).not.toEqual(grant);expect(resourceBinding(f.run,'A')).not.toEqual(access);
  });

  it('safe new paths remain executable; internal aliases and unordered ownership cannot create a second writer',()=>{
    const f=setup();f.run.work[0].files=['safe/new/nested.mjs'];scope(f);expect(evaluateRun(f.run,f.context).executableNow).toContain('W-CLASSIFY');
    fs.symlinkSync(path.join(f.root,'product.mjs'),path.join(f.root,'alias.mjs'));f.run.work[0].files=['product.mjs'];f.run.work.push({...structuredClone(f.run.work[0]),id:'W-SECOND',files:['alias.mjs']});f.run.activeWorkIds.push('W-SECOND');scope(f);expect(codes(evaluateRun(f.run,f.context).integrity)).toContain('WORK_OWNERSHIP_COLLISION');
    f.run.work[1].inputs=[{kind:'work',id:'W-CLASSIFY'}];scope(f);expect(validateGraph(f.run)).toEqual([]);expect(evaluateRun(f.run,f.context).work['W-SECOND'].executable.status).toBe('pending');
  });

  it('malformed and unsupported JUnit/Vitest payloads fail closed under authenticated observation',()=>{
    const payloads=[
      {format:'junit' as const,raw:'<testsuite tests="1"><testcase></testsuite>'},
      {format:'junit' as const,raw:'<testsuite tests="1"><testcase/></testsuite><testsuite/>'},
      {format:'junit' as const,raw:'<!DOCTYPE testsuite [<!ENTITY unsafe "payload">]><testsuite tests="1"><testcase/></testsuite>'},
      {format:'junit' as const,raw:'<testsuite tests="1" tests="1"><testcase/></testsuite>'},
      {format:'junit' as const,raw:'<testsuite tests="1"><failure message="bootstrap failed"/><testcase name="placeholder"/></testsuite>'},
      {format:'vitest-json' as const,raw:'{"success":true,"numTotalTests":1,"numFailedTests":0,"testResults":"unsupported"}'},
      {format:'vitest-json' as const,raw:'{"success":true,"numTotalTests":1,"numFailedTests":0,"numPassedTests":1,"testResults":[{"name":"product.mjs","status":"passed","assertionResults":[{"fullName":"x","status":"passed","failureMessages":["actual failed assertion"]}]}]}'},
    ];
    for(const p of payloads){const f=setup();f.run.criteria[0].inputs=[f.run.targets[0].bindings[0]];f.run.criteria[0].evidenceKinds=['test'];f.run.criteria[0].minimumCollected=1;const e=f.record('K-SUCCESS','test',p.raw,{test:{format:p.format,collected:1,failed:0,exitCode:0}});expect(validateEvidence(f.run,e,f.context).status,p.raw).toBe('fail');}
  });

  it('accepts an actual independent bound Vitest assertion and rejects reuse after the test file changes',()=>{
    const f=setup();const library=process.cwd();const suite=f.file('consumer.test.mjs',`import {test,expect} from ${JSON.stringify(path.join(library,'node_modules/vitest/dist/index.js'))};\nimport {spawnSync} from 'node:child_process';\ntest('external consumer preserves exact Unicode ID',()=>{const r=spawnSync(process.execPath,['product.mjs'],{cwd:${JSON.stringify(f.root)},input:'{"id":"café-α"}',encoding:'utf8'});expect(r.status).toBe(0);expect(JSON.parse(r.stdout).id).toBe('café-α');});\n`);
    const output=path.join(f.root,'actual-vitest.json');const executed=spawnSync(process.execPath,[path.join(library,'node_modules/vitest/vitest.mjs'),'run','consumer.test.mjs','--root',f.root,'--reporter=json','--outputFile',output],{cwd:f.root,encoding:'utf8',timeout:20000});
    expect(executed.status,executed.stderr).toBe(0);const raw=fs.readFileSync(output,'utf8');const result=JSON.parse(raw);expect(result.numTotalTests).toBe(1);
    f.run.criteria[0].evidenceKinds=['test'];f.run.criteria[0].minimumCollected=1;f.run.criteria[0].inputs=[suite];const e=f.record('K-SUCCESS','test',raw,{command:'actual vitest run consumer.test.mjs --reporter=json',test:{format:'vitest-json',collected:1,failed:0,exitCode:0}});expect(validateEvidence(f.run,e,f.context).status).toBe('pass');
    f.file('consumer.test.mjs','throw new Error("suite changed");');expect(validateEvidence(f.run,e,f.context).status).toBe('fail');
  });
});
