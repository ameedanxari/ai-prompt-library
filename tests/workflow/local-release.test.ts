import { afterEach, expect, it } from 'vitest';
import { createFixture } from './fixture.js';
import { evaluateRun } from '../../src/workflow/evaluate.js';
import { scopeFingerprint } from '../../src/workflow/evidence.js';
import { parseRun } from '../../src/workflow/schema.js';
import { renderViews } from '../../src/views.js';
const fixtures: ReturnType<typeof createFixture>[]=[];
function local() { const f=createFixture();fixtures.push(f);f.run.targets[0].environment='local';f.run.criteria.forEach(c=>c.productionRequired=false);f.run.releases[0].composition='actual-target';return f; }
function observe(f: ReturnType<typeof local>) { f.judge('scope',['R-GREETING']);f.observe('C-OK','consumer',{production:false});f.observe('C-OK','build',{production:false});f.observe('C-RECOVER','consumer',{production:false});f.judge('semantic',['C-OK','C-RECOVER']);f.judge('release',['R1']); }
const codes=(f:ReturnType<typeof local>)=>evaluateRun(f.run,f.context).releases.R1.checks.map(c=>c.code);
afterEach(()=>fixtures.splice(0).forEach(f=>f.cleanup()));
// Actual fixture CLI execution; host receipt identities here are simulated.
it('accepts a real delivered local CLI without claiming a production environment',()=>{const f=local();observe(f);expect(evaluateRun(f.run,f.context).releases.R1.status).toBe('pass');expect(f.run.evidence.every(e=>!e.production)).toBe(true);expect(renderViews(f.run,f.context).files['ROADMAP.md']).toContain('Actual declared target');});
it('retains default production and explicit production-required duties',()=>{const f=local();delete f.run.releases[0].composition;observe(f);expect(codes(f)).toContain('RELEASE_COMPOSITION_REQUIRED');const required=local();required.run.criteria[0].productionRequired=true;observe(required);expect(codes(required)).toContain('PRODUCTION_PROOF_MISSING');});
it('cannot use a controlled provider or missing/stale evidence as actual delivery',()=>{const f=local();f.run.targets[0].providerMode='controlled';observe(f);expect(codes(f)).toContain('REAL_RELEASE_TARGET_REQUIRED');const stale=local();observe(stale);stale.run.targets[0].revision='changed';expect(evaluateRun(stale.run,stale.context).releases.R1.status).not.toBe('pass');const missing=local();observe(missing);missing.run.evidence=[];expect(codes(missing)).toContain('EVIDENCE_MISSING');});
it('retains independent host review and invalidates review on composition changes',()=>{const f=local();observe(f);expect(evaluateRun(f.run,{projectRoot:f.root}).releases.R1.status).not.toBe('pass');const before=scopeFingerprint(f.run);f.run.releases[0].composition='production';expect(scopeFingerprint(f.run)).not.toBe(before);expect(evaluateRun(f.run,f.context).planReviewed.status).toBe('pending');(f.run.releases[0] as {composition?:string}).composition='skip';expect(()=>parseRun(f.run)).toThrow();});
it('a local member never waives production proof for another delivered target',()=>{
 for(const production of [false,true]){
  const f=local();f.run.targets.push({...structuredClone(f.run.targets[0]),id:'PROD',environment:'production'});
  f.run.criteria.push({...structuredClone(f.run.criteria[0]),id:'C-PROD',targetId:'PROD',productionRequired:false,evidenceKinds:['consumer']});f.run.releases[0].sharedCriterionIds.push('C-PROD');
  observe(f);f.observe('C-PROD','consumer',{production});f.judge('semantic',['C-PROD']);f.judge('release',['R1']);
  if(production)expect(evaluateRun(f.run,f.context).releases.R1.status).toBe('pass');
  else {expect(codes(f)).toContain('RELEASE_COMPOSITION_REQUIRED');expect(evaluateRun(f.run,f.context).releases.R1.status).not.toBe('pass');}
 }
});
it('staging and unknown environments cannot become delivered through actual-target mode',()=>{
 for(const environment of ['staging','unknown'] as const){const f=local();f.run.targets[0].environment=environment;observe(f);expect(codes(f)).toContain('DELIVERED_TARGET_ENVIRONMENT_REQUIRED');}
});
