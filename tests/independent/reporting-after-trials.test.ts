/** Independent bd5c807 review. Self-contained mixed-target fixtures; hostless checks are honest. */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, expect, it, vi } from 'vitest';
import { independentHarness } from './harness.js';
import { compactAssessment, renderViews } from '../../src/views.js';
import { evaluateRun, evaluateBoundary } from '../../src/workflow/evaluate.js';
import { check, gate, canonical } from '../../src/workflow/evidence.js';
import { loadRun, projectPath } from '../../src/store.js';
import { parseRun } from '../../src/workflow/schema.js';
import { main } from '../../src/cli.js';
import type { GateResult, RunAssessment } from '../../src/workflow/contract.js';
const fixtures:ReturnType<typeof independentHarness>[]=[];const extras:string[]=[];
const setup=()=>{const f=independentHarness();fixtures.push(f);return f;};
afterEach(()=>{vi.restoreAllMocks();fixtures.splice(0).forEach(f=>f.cleanup());extras.splice(0).forEach(p=>fs.rmSync(p,{recursive:true,force:true}));});
it('compacts a branching mixed-target model without losing any boundary cause, subject or receipt',()=>{
 const f=setup();const run=f.run;
 run.targets.push({...structuredClone(run.targets[0]),id:'staging',identity:null,environment:'staging',lifecycle:{...run.targets[0].lifecycle,dataPolicy:'retain'}},{...structuredClone(run.targets[0]),id:'old-live',identity:null,environment:'production',lifecycle:{...run.targets[0].lifecycle,stage:'live',dataPolicy:'retain'}});
 for(let i=1;i<=8;i++){
  const target=i%2?'staging':'old-live';const success=`K-${i}-OK`,recovery=`K-${i}-RECOVERY`,outcome=`O-${i}`,requirement=`Q-${i}`;
  run.criteria.push({...structuredClone(run.criteria[0]),id:success,targetId:target},{...structuredClone(run.criteria[1]),id:recovery,targetId:target});
  run.requirements.push({...structuredClone(run.requirements[0]),id:requirement,criterionIds:[success,recovery]});
  run.resources.push({id:`A-${i}`,description:'Actual target access remains missing',kind:'access',targetId:target,status:'missing',sourceRefs:[f.ref]});
  run.outcomes.push({...structuredClone(run.outcomes[0]),id:outcome,requirementIds:[requirement],criterionIds:[success,recovery],targetId:target,inputs:[{kind:'outcome',id:i===1?'O-CLASSIFY':`O-${i-1}`},{kind:'resource',id:`A-${i}`}]});
  run.work.push({...structuredClone(run.work[0]),id:`W-${i}`,outcomeIds:[outcome],criterionIds:[success,recovery],targetIds:[target],action:'live-write',files:[`owned-${i}.mjs`],instructions:'',inputs:[{kind:'outcome',id:i===1?'O-CLASSIFY':`O-${i-1}`}]});
  run.releases[0].outcomeIds.push(outcome);
 }
 const full=evaluateRun(run,{projectRoot:f.root});const compact=compactAssessment(full);
 const expand=(g:{status:GateResult['status'];diagnosticIds:string[]}):GateResult=>({status:g.status,checks:g.diagnosticIds.map(id=>compact.diagnostics[id])});
 const collection=(rows:Record<string,Parameters<typeof expand>[0]>)=>Object.fromEntries(Object.entries(rows).map(([id,g])=>[id,expand(g)]));
 const restored:RunAssessment={runId:compact.runId,revision:compact.revision,integrity:expand(compact.integrity),planReviewable:expand(compact.planReviewable),planReviewed:expand(compact.planReviewed),proof:expand(compact.proof),work:Object.fromEntries(Object.entries(compact.work).map(([id,w])=>[id,{executable:expand(w.executable),verified:expand(w.verified)}])),decisions:collection(compact.decisions),outcomes:collection(compact.outcomes),releases:collection(compact.releases),executableNow:compact.executableNow};
 expect(restored).toEqual(full);expect(compact.executableNow).toEqual([]);expect(compactAssessment(restored)).toEqual(compact);
 expect(Buffer.byteLength(JSON.stringify(compact))).toBeLessThan(Buffer.byteLength(JSON.stringify(full)));
});
it('deduplication preserves changed severity, complete cause paths and distinct evidence/judgment attribution',()=>{
 const base=check('pending','DEPENDENCY','W','Same message',{causes:['work:W','resource:A'],evidenceIds:['E1'],judgmentIds:['J1']});
 const changes=[base,{...base,status:'fail' as const},{...base,subject:'V'},{...base,causes:['work:W','resource:B']},{...base,evidenceIds:['E2']},{...base,judgmentIds:['J2']}];
 const result=gate([...changes,...changes,...changes]);expect(result.status).toBe('fail');expect(result.checks).toEqual(changes);expect(new Set(result.checks.map(canonical)).size).toBe(changes.length);
});
it('chosen root aliases accept both their absolute path and canonical path while rejecting siblings and below-root links',()=>{
 const f=setup();f.file('run.json',JSON.stringify(f.run));const parent=fs.mkdtempSync(path.join(os.tmpdir(),'independent-root-alias-'));extras.push(parent);const alias=path.join(parent,'chosen-project');fs.symlinkSync(f.root,alias,process.platform==='win32'?'junction':'dir');
 expect(loadRun(alias,path.join(alias,'run.json'))).toEqual(f.run);expect(loadRun(alias,path.join(fs.realpathSync(f.root),'run.json'))).toEqual(f.run);
 expect(()=>projectPath(alias,path.join(parent,'chosen-project-sibling','run.json'))).toThrow();
 fs.symlinkSync(parent,path.join(f.root,'under-root-link'),process.platform==='win32'?'junction':'dir');expect(()=>projectPath(alias,path.join(alias,'under-root-link','sibling.json'))).toThrow();
});
it('headless empty design does not weaken source/semantic duties or visual independence',()=>{
 const f=setup();f.run.policy.reviews.design=[];expect(evaluateRun(f.run,f.context).integrity.status).toBe('pass');
 f.run.policy.reviews.semantic=[];expect(()=>parseRun(f.run)).toThrow();f.run.policy.reviews.semantic=['independent'];f.run.targets[0].kind='web';expect(evaluateRun(f.run,f.context).integrity.checks.some(c=>c.code==='INDEPENDENT_REVIEW_REQUIRED'&&c.subject==='policy.reviews.design')).toBe(true);
});
it('public compact CLI and direct named-boundary API preserve the same statuses and leave canonical bytes unchanged',async()=>{
 const f=setup();f.file('run.json',JSON.stringify(f.run));const before=fs.readFileSync(path.join(f.root,'run.json'));let raw='';const spy=vi.spyOn(process.stdout,'write').mockImplementation(((s:string|Uint8Array)=>{raw+=s.toString();return true;}) as typeof process.stdout.write);
 expect(await main(['validate','run.json','--project-root',f.root])).toBe(2);const compact=JSON.parse(raw);expect(compact).toEqual(compactAssessment(evaluateRun(f.run,{projectRoot:f.root})));raw='';
 expect(await main(['validate','run.json','--project-root',f.root,'--boundary','plan-reviewable'])).toBe(0);expect(JSON.parse(raw).result).toEqual(evaluateBoundary(f.run,{kind:'plan-reviewable'},{projectRoot:f.root}));raw='';
 expect(await main(['view','run.json','--project-root',f.root])).toBe(0);const view=JSON.parse(raw);expect(view.assessment).toEqual(compact);expect(view.ownerBrief).toBe(renderViews(f.run,{projectRoot:f.root}).files['OWNER-BRIEF.md']);expect('files' in view).toBe(false);spy.mockRestore();expect(fs.readFileSync(path.join(f.root,'run.json'))).toEqual(before);
});
