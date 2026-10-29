import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, expect, it } from 'vitest';
import { createFixture } from './fixture.js';
import { loadRun, projectPath } from '../../src/store.js';
import { compactAssessment, renderViews } from '../../src/views.js';
import { check, gate, scopeFingerprint } from '../../src/workflow/evidence.js';
import { parseRun } from '../../src/workflow/schema.js';
import { validateGraph } from '../../src/workflow/graph.js';
import type { GateResult, RunAssessment } from '../../src/workflow/contract.js';
const fixtures: ReturnType<typeof createFixture>[] = [];
const extras: string[] = [];
const fixture = () => { const f=createFixture(); fixtures.push(f); return f; };
afterEach(()=>{ for(const f of fixtures.splice(0)) f.cleanup(); for(const d of extras.splice(0)) fs.rmSync(d,{recursive:true,force:true}); });
it('accepts a chosen project-root alias without allowing links below it or outside paths',()=>{
  const f=fixture(), parent=fs.mkdtempSync(path.join(os.tmpdir(),'root-alias-')); extras.push(parent);
  const alias=path.join(parent,'project'); fs.symlinkSync(f.root,alias,process.platform==='win32'?'junction':'dir');
  f.file('run.json',JSON.stringify(f.run));
  expect(loadRun(alias,path.join(alias,'run.json'))).toEqual(f.run);
  expect(projectPath(alias,'new/run.json')).toBe(path.join(fs.realpathSync(f.root),'new/run.json'));
  expect(()=>projectPath(alias,path.join(parent,'outside.json'))).toThrow(/inside the project/);
  fs.symlinkSync(parent,path.join(f.root,'escape'),process.platform==='win32'?'junction':'dir');
  expect(()=>projectPath(alias,path.join(alias,'escape','outside.json'))).toThrow(/Symlink/);
});
it('allows no design review for headless work while requiring it for visual targets',()=>{
  const f=fixture(); f.run.policy.reviews.design=[];
  expect(()=>parseRun(f.run)).not.toThrow();
  expect(validateGraph(f.run).filter(x=>x.subject==='policy.reviews.design')).toEqual([]);
  f.run.targets[0].kind='web';
  expect(validateGraph(f.run)).toContainEqual(expect.objectContaining({code:'INDEPENDENT_REVIEW_REQUIRED',subject:'policy.reviews.design'}));
});
it('deduplicates identical causal paths but retains distinct subjects, status and evidence',()=>{
  const pending=check('pending','INPUT','a','Missing input'), other=check('pending','INPUT','b','Missing input');
  const failed=check('fail','INPUT','a','Missing input'), observed=check('pending','INPUT','a','Missing input',{evidenceIds:['E1']});
  const combined=gate([...Array(1000).fill(pending),other,failed,observed]);
  expect(combined).toEqual({status:'fail',checks:[pending,other,failed,observed]});
});
it('compact reports preserve every boundary and distinct diagnostic without repeated payloads',()=>{
  const f=fixture(), full=renderViews(f.run,f.context).assessment, compact=compactAssessment(full);
  const expand=(g:{status:GateResult['status'];diagnosticIds:string[]}):GateResult=>({status:g.status,checks:g.diagnosticIds.map(id=>compact.diagnostics[id])});
  const collection=(gs:Record<string,Parameters<typeof expand>[0]>)=>Object.fromEntries(Object.entries(gs).map(([id,g])=>[id,expand(g)]));
  const restored:RunAssessment={runId:compact.runId,revision:compact.revision,integrity:expand(compact.integrity),planReviewable:expand(compact.planReviewable),planReviewed:expand(compact.planReviewed),proof:expand(compact.proof),work:Object.fromEntries(Object.entries(compact.work).map(([id,w])=>[id,{executable:expand(w.executable),verified:expand(w.verified)}])),decisions:collection(compact.decisions),outcomes:collection(compact.outcomes),releases:collection(compact.releases),executableNow:compact.executableNow};
  expect(restored).toEqual(full);
  expect(JSON.stringify(compact).length).toBeLessThan(JSON.stringify(full).length);
  const repeated=structuredClone(full); for(let i=0;i<100;i++) repeated.releases[`copy-${i}`]=full.proof;
  expect(Object.keys(compactAssessment(repeated).diagnostics)).toEqual(Object.keys(compact.diagnostics));
});
it('view fingerprints change when implementation instructions change without invalidating scope',()=>{
  const f=fixture(), before=renderViews(f.run,f.context), scope=scopeFingerprint(f.run);
  f.run.work[0].instructions+=' Handle the existing greeting parser carefully.';
  expect(scopeFingerprint(f.run)).toBe(scope);
  expect(renderViews(f.run,f.context).fingerprint).not.toBe(before.fingerprint);
});
