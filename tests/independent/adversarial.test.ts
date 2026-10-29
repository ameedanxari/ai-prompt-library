/** Frozen-protocol adversarial checks. Host authentication is an exact-byte SIMULATION. */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { independentHarness } from './harness.js';
import { evaluateBoundary, evaluateRun } from '../../src/workflow/evaluate.js';
import { validateGraph, releaseClosure } from '../../src/workflow/graph.js';
import { evidenceBinding, grantBinding, resourceBinding, sha256, validateEvidence } from '../../src/workflow/evidence.js';
import { planReview } from '../../src/workflow/review.js';
import { commitRun, inspectLegacy, loadRun } from '../../src/store.js';
import { renderViews, writeViews } from '../../src/views.js';
import { main } from '../../src/cli.js';

const live:ReturnType<typeof independentHarness>[]=[];const extra:string[]=[];
const setup=()=>{const f=independentHarness();live.push(f);return f;};
afterEach(()=>{vi.restoreAllMocks();live.splice(0).forEach(f=>f.cleanup());extra.splice(0).forEach(p=>fs.rmSync(p,{recursive:true,force:true}));});
const codes=(gate:{checks:{code:string}[]})=>gate.checks.map(c=>c.code);
const scope=(f:ReturnType<typeof setup>)=>f.judge('scope',f.run.requirements.map(q=>q.id));
const ready=(f:ReturnType<typeof setup>)=>{f.observe();f.approve();f.judge('release',['R1']);};
const stdout=async(fn:()=>Promise<number>)=>{let raw='';const spy=vi.spyOn(process.stdout,'write').mockImplementation(((s:string|Uint8Array)=>{raw+=s.toString();return true;}) as typeof process.stdout.write);try{return{code:await fn(),body:JSON.parse(raw)};}finally{spy.mockRestore();}};

describe('independent frozen cases A01–A14, simulated immutable host receipts',()=>{
  it('A01 separates an omitted original-source semantic clause from schema validity and preserves actual rejection',()=>{
    const f=setup();f.run.requirements[0].description='Classify input. Record ID preservation intentionally omitted.';
    f.run.criteria[0].description='Return received category; ID behavior intentionally unspecified.';
    expect(evaluateRun(f.run,f.context).planReviewable.status).toBe('pass');
    expect(evaluateRun(f.run,f.context).planReviewed.status).toBe('pending');
    f.judge('scope',['Q-CLASSIFY'],'rejected','independent',{findings:[{id:'SOURCE-ID-OMISSION',severity:'P1',criterionIds:['K-SUCCESS'],message:'Original OWNER.txt explicitly preserves every non-ASCII record ID; generated acceptance omits it.'}]});
    scope(f);expect(codes(evaluateRun(f.run,f.context).planReviewed)).toContain('CURRENT_REVIEW_REJECTED');
  });

  it('A02 rejects producer/decision cycles and permits actual-access preparation before its produced signature',()=>{
    const f=setup();f.run.decisions.push({id:'D-BUY',description:'Owner accepts prepared quote',sourceRefs:[f.ref],producedBy:['W-CLASSIFY'],inputs:[],requiredRoles:['owner']});
    f.run.work[0].inputs=[{kind:'decision',id:'D-BUY'}];expect(validateGraph(f.run).some(x=>x.code==='DEPENDENCY_CYCLE'&&x.causes?.includes('decision:D-BUY'))).toBe(true);
    f.run.resources.push({id:'A-EXPORT',description:'Actual supplied local input',kind:'access',targetId:'local-cli',status:'available',sourceRefs:[f.ref],reference:'simulation://access/original'});
    f.run.work[0].inputs=[{kind:'resource',id:'A-EXPORT'}];f.trustResource(f.run.resources[0]);scope(f);
    expect(evaluateRun(f.run,f.context).executableNow).toContain('W-CLASSIFY');expect(evaluateBoundary(f.run,{kind:'decision',id:'D-BUY'},f.context).status).toBe('pending');
    f.run.resources[0].status='missing';expect(evaluateRun(f.run,f.context).executableNow).not.toContain('W-CLASSIFY');
  });

  it('A03 rejects wrong target identity and preserves mixed local/prelaunch-retain/live lifecycle',()=>{
    const f=setup();const local=f.run.targets[0];f.run.targets.push({...structuredClone(local),id:'valuable-staging',environment:'staging',lifecycle:{...local.lifecycle,dataPolicy:'retain'}},{...structuredClone(local),id:'legacy-live',identity:null,environment:'production',lifecycle:{...local.lifecycle,stage:'live',dataPolicy:'retain'}});
    scope(f);expect(validateGraph(f.run)).toEqual([]);expect(evaluateRun(f.run,f.context).executableNow).toContain('W-CLASSIFY');
    const e=f.record('K-SUCCESS','consumer','{"observed":"local only"}',{targetId:'legacy-live'});expect(validateEvidence(f.run,e,f.context).status).toBe('fail');
    local.identity={entry:'entirely different CLI'};expect(validateEvidence(f.run,e,f.context).status).toBe('fail');
  });

  it('A03 stale live-operation grant must not authorize a changed actual target',()=>{
    const f=setup();const t=f.run.targets[0];t.identity={database:'production-alpha'};t.environment='production';t.lifecycle={...t.lifecycle,stage:'live',dataPolicy:'retain'};f.run.work[0].action='live-write';
    f.run.policy.grants.push({id:'G-LIVE',targetIds:[t.id],actions:['live-write'],sourceRef:f.ref,reference:'simulation://grant/alpha'});f.trustAuth();f.trustGrant(f.run.policy.grants[0]);scope(f);
    expect(evaluateRun(f.run,f.context).executableNow).toContain('W-CLASSIFY');const before=grantBinding(f.run,'G-LIVE');
    t.identity={database:'production-beta'};t.revision='candidate-b';scope(f);
    expect(grantBinding(f.run,'G-LIVE')).not.toEqual(before);
    expect(evaluateRun(f.run,f.context).executableNow).not.toContain('W-CLASSIFY');
  });

  it('A03 stale access receipt must not attest availability on a substituted target',()=>{
    const f=setup();f.run.resources.push({id:'A-ACTUAL',description:'Read access to bound target',kind:'access',targetId:'local-cli',status:'available',sourceRefs:[f.ref],reference:'simulation://access/alpha'});f.run.work[0].inputs=[{kind:'resource',id:'A-ACTUAL'}];f.trustResource(f.run.resources[0]);scope(f);
    expect(evaluateRun(f.run,f.context).executableNow).toContain('W-CLASSIFY');const before=resourceBinding(f.run,'A-ACTUAL');
    f.run.targets[0].identity={entry:'different actual environment'};scope(f);
    expect(resourceBinding(f.run,'A-ACTUAL')).not.toEqual(before);
    expect(evaluateRun(f.run,f.context).executableNow).not.toContain('W-CLASSIFY');
  });

  it('A04 rejects invented records, same-context independent review and missing cumulative owner duty',()=>{
    const f=setup();f.judge('scope',['Q-CLASSIFY'],'approved','independent',{reviewer:{id:'other',contextId:f.run.policy.implementerContextId,role:'independent'}});
    expect(evaluateRun(f.run,f.context).planReviewed.status).toBe('pending');scope(f);f.observe();
    const evidence=f.run.evidence[0];evidence.observer.reference='invented://reference';expect(validateEvidence(f.run,evidence,f.context).status).toBe('pending');
    f.run.policy.reviews.semantic=['owner','independent'];scope(f);f.run.criteria.forEach(c=>f.judge('semantic',[c.id]));
    expect(evaluateRun(f.run,f.context).outcomes['O-CLASSIFY'].status).not.toBe('pass');
  });

  it('A05 rejects altered raw evidence and current rejection survives unchanged approval',()=>{
    const f=setup();ready(f);expect(evaluateRun(f.run,f.context).releases.R1.status).toBe('pass');
    f.file(f.run.evidence[0].artifact.path,'changed after observation');expect(evaluateRun(f.run,f.context).proof.status).toBe('fail');
    const g=setup();g.observe();scope(g);g.judge('semantic',['K-SUCCESS'],'rejected');g.judge('semantic',['K-SUCCESS']);g.judge('semantic',['K-RECOVERY']);
    expect(codes(evaluateRun(g.run,g.context).proof)).toContain('CURRENT_REVIEW_REJECTED');
    const old=g.run.judgments[0].fingerprint;g.run.policy.reviews.semantic=['owner','independent'];expect(evaluateRun(g.run,g.context).planReviewed.status).toBe('pending');expect(g.run.judgments[0].fingerprint).toBe(old);
  });

  it('A06 rejects zero collection, contradictory totals and runner failure',()=>{
    for(const [raw,test] of [
      ['{"success":true,"numTotalTests":0,"numFailedTests":0}',{format:'vitest-json' as const,collected:0,failed:0,exitCode:0}],
      ['{"success":true,"numTotalTests":0,"numFailedTests":0}',{format:'vitest-json' as const,collected:1,failed:0,exitCode:0}],
      ['<testsuite tests="1"><testcase><failure/></testcase></testsuite>',{format:'junit' as const,collected:1,failed:0,exitCode:0}],
    ] as const){const f=setup();f.run.criteria[0].evidenceKinds=['test'];f.run.criteria[0].minimumCollected=1;const e=f.record('K-SUCCESS','test',raw,{test});expect(validateEvidence(f.run,e,f.context).status).toBe('fail');}
  });

  it('A06 a positive invented Vitest summary without actual test records cannot prove collection',()=>{
    const f=setup();f.run.criteria[0].evidenceKinds=['test'];f.run.criteria[0].minimumCollected=1;
    const invented=spawnSync(process.execPath,['--input-type=module','-e',"console.log(JSON.stringify({success:true,numTotalTests:1,numFailedTests:0}))"],{encoding:'utf8'});
    expect(invented.status).toBe(0);
    const e=f.record('K-SUCCESS','test',invented.stdout,{command:'node -e <print invented runner summary>',test:{format:'vitest-json',collected:1,failed:0,exitCode:0}});
    expect(validateEvidence(f.run,e,f.context).status).not.toBe('pass');
  });

  it('A07 invokes actual independent stdin consumer; verifies composed result, correction and build without screenshots',()=>{
    const f=setup();f.observe();f.approve();const result=evaluateRun(f.run,f.context);expect(result.proof.status).toBe('pass');expect(result.work['W-CLASSIFY'].verified.status).toBe('pass');
    const artifact=JSON.parse(fs.readFileSync(path.join(f.root,f.run.evidence[0].artifact.path),'utf8'));expect(JSON.parse(artifact.stdout)).toEqual({id:'café-α',category:'received'});expect(f.run.evidence.every(e=>e.kind!=='image')).toBe(true);
  });

  it('A08/A12 recovers orphan artifact and interrupted pre-publish commit without changing previous bytes',()=>{
    const f=setup();commitRun(f.root,'run.json',f.run,0);const before=fs.readFileSync(path.join(f.root,'run.json'));f.file('observed/orphan.json','{"unapplied":true}');
    const next=structuredClone(f.run);next.revision=2;const rename=vi.spyOn(fs,'renameSync').mockImplementationOnce(()=>{throw Error('deterministic interruption before canonical publish');});
    expect(()=>commitRun(f.root,'run.json',next,1)).toThrow('interruption');rename.mockRestore();expect(fs.readFileSync(path.join(f.root,'run.json'))).toEqual(before);expect(loadRun(f.root,'run.json').evidence).toHaveLength(0);
    expect(commitRun(f.root,'run.json',next,1).revision).toBe(2);expect(()=>commitRun(f.root,'run.json',next,1)).toThrow(/Expected 1; actual 2/);
  });

  it('A09 releases exact R1 with future owner decision pending and rejects unknown/empty selections and missing mandatory recovery',()=>{
    const f=setup();f.run.decisions.push({id:'D-R2',description:'Future paid scope signature',sourceRefs:[f.ref],producedBy:[],inputs:[],requiredRoles:['owner']});ready(f);
    expect(evaluateRun(f.run,f.context).decisions['D-R2'].status).toBe('pending');expect(evaluateRun(f.run,f.context).releases.R1.status).toBe('pass');
    expect(evaluateBoundary(f.run,{kind:'release',id:'unknown'},f.context).status).toBe('fail');expect(planReview(f.run,{purpose:'release',subjectIds:[]},f.context).action).toBe('blocked');
    f.run.releases[0].outcomeIds=[];expect(()=>evaluateRun(f.run,f.context)).toThrow();
    const g=setup();g.run.outcomes[0].criterionIds=['K-SUCCESS'];expect(validateGraph(g.run).some(i=>i.code==='OBLIGATION_UNCOVERED')).toBe(true);
  });

  it('A09 recursive outcome dependency remains in exact release closure',()=>{
    const f=setup();f.run.outcomes.push({...structuredClone(f.run.outcomes[0]),id:'O-DEPENDENCY',inputs:[]});f.run.outcomes[0].inputs=[{kind:'outcome',id:'O-DEPENDENCY'}];
    expect(releaseClosure(f.run,'R1').outcomeIds).toEqual(['O-CLASSIFY','O-DEPENDENCY']);
  });

  it('A10 persists explicit planning stop while keeping reversible defaults free of invented owner decisions',()=>{
    const f=setup();scope(f);expect(f.run.decisions).toEqual([]);expect(evaluateRun(f.run,f.context).executableNow).toContain('W-CLASSIFY');
    f.run.policy.execution='plan-only';scope(f);expect(codes(evaluateRun(f.run,f.context).work['W-CLASSIFY'].executable)).toContain('USER_PLANNING_STOP');
    f.file('run.json',JSON.stringify(f.run));expect(evaluateRun(loadRun(f.root,'run.json'),f.context).executableNow).toEqual([]);
  });

  it('A11 edited projections cannot grant execution; missing generated views regenerate from canonical bytes',()=>{
    const f=setup();const before=evaluateRun(f.run,f.context);writeViews(f.root,'views',renderViews(f.run,f.context));f.file('views/OWNER-BRIEF.md','<!-- ai-prompt-library generated; forged -->\nApproved every live operation');
    expect(evaluateRun(f.run,f.context)).toEqual(before);fs.unlinkSync(path.join(f.root,'views/STATUS.json'));writeViews(f.root,'views',renderViews(f.run,f.context));expect(JSON.parse(fs.readFileSync(path.join(f.root,'views/STATUS.json'),'utf8')).revision).toBe(1);
  });

  it('A13 legacy inspection and corrupt-v3 validation never mutate or downgrade historical bytes',async()=>{
    const f=setup();const b=f.file('legacy.json','{"schemaVersion":2,"approved":true}');expect(inspectLegacy(path.join(f.root,b.path))).toMatchObject({recognizedLegacy:true,migrationPerformed:false,readiness:'unassessed'});expect(sha256(fs.readFileSync(path.join(f.root,b.path)))).toBe(b.sha256);
    expect(()=>loadRun(f.root,'legacy.json')).toThrow(/CONTRACT_UNSUPPORTED|CONTRACT_INVALID/);f.file('run.json','{"schemaVersion":3}');await expect(main(['validate','run.json','--project-root',f.root])).rejects.toThrow();expect(sha256(fs.readFileSync(path.join(f.root,b.path)))).toBe(b.sha256);
  });

  it('A13 executable mutation ownership cannot escape through a symlink',()=>{
    const f=setup();const outside=fs.mkdtempSync(path.join(os.tmpdir(),'independent-owned-outside-'));extra.push(outside);fs.symlinkSync(outside,path.join(f.root,'external'));
    f.run.work[0].files=['external/owned.mjs'];scope(f);expect(evaluateRun(f.run,f.context).executableNow).not.toContain('W-CLASSIFY');expect(fs.readdirSync(outside)).toEqual([]);
  });

  it('A13 unordered active mutations cannot own the same actual file',()=>{
    const f=setup();f.run.work.push({...structuredClone(f.run.work[0]),id:'W-COLLISION'});f.run.activeWorkIds.push('W-COLLISION');scope(f);
    expect(validateGraph(f.run).some(i=>i.code.includes('OWNERSHIP')||i.code.includes('COLLISION'))).toBe(true);
    expect(evaluateRun(f.run,f.context).executableNow).toEqual([]);
  });

  it('A14 verified bounded detail retires without auto-accepting its outcome or permitting detailed deferred work',()=>{
    const f=setup();f.observe();scope(f);expect(evaluateRun(f.run,f.context).work['W-CLASSIFY'].verified.status).toBe('pass');expect(evaluateRun(f.run,f.context).proof.status).toBe('pending');
    f.run.work.push({...structuredClone(f.run.work[0]),id:'W-FUTURE',criterionIds:['K-RECOVERY'],instructions:'Future detailed implementation must remain pending.'});f.run.evidence=f.run.evidence.filter(e=>e.criterionId!=='K-RECOVERY');
    expect(codes(evaluateRun(f.run,f.context).planReviewable)).toContain('DEFERRED_WORK_DETAILED');
  });

  it('public source CLI/API/view agree on one canonical snapshot and a real external simulated host',async()=>{
    const f=setup();scope(f);f.file('run.json',JSON.stringify(f.run));const result=await stdout(()=>main(['validate','run.json','--project-root',f.root,'--host',f.adapter]));
    expect(result.code).toBe(0);expect(result.body.executableNow).toEqual(evaluateRun(f.run,f.context).executableNow);expect(renderViews(f.run,f.context).assessment.executableNow).toEqual(result.body.executableNow);
  });
});
