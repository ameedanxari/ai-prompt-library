import { afterEach, expect, it } from 'vitest';
import { createFixture } from './fixture.js';
import { parseRun } from '../../src/workflow/schema.js';
import { scopeWorkIds, forecastWork } from '../../src/workflow/forecast.js';
import { reviewBinding, scopeFingerprint } from '../../src/workflow/evidence.js';
import { renderViews } from '../../src/views.js';
const fixtures: ReturnType<typeof createFixture>[]=[];
const setup=()=>{ const f=createFixture();fixtures.push(f); const base=f.run.work[0]; f.run.work.push({...structuredClone(base),id:'W-SHARED',files:['shared.mjs'],instructions:'',inputs:[],estimate:{allocations:[{role:'engineer',hours:[2,3]},{role:'reviewer',hours:[1,2]}],ownerDelayHours:[24,48],ownerTouchpoints:1}},{...structuredClone(base),id:'W-LATER',files:['later.mjs'],instructions:'',inputs:[{kind:'work',id:'W-SHARED'}],estimate:undefined}); f.run.work[0].inputs=[{kind:'work',id:'W-SHARED'}]; const ref=[{sourceId:'request',locator:'instruction'}];f.run.milestones=[{id:'M1',title:'Greeting',result:'Receive a greeting',recovery:'Correct invalid input',outcomeIds:['O-GREETING'],workIds:['W-CLI'],assumptions:'Staffing unknown',reforecast:'After proof',sourceRefs:ref},{id:'M2',title:'Later',result:'Complete later work',recovery:'Retry',outcomeIds:['O-GREETING'],workIds:['W-LATER'],assumptions:'Availability unknown',reforecast:'After M1',sourceRefs:ref}];return f;};
afterEach(()=>fixtures.splice(0).forEach(f=>f.cleanup()));
it('counts shared dependencies once, separates roles and owner wait, and exposes incremental milestone scope',()=>{
 const f=setup();const ids=scopeWorkIds(f.run,{kind:'milestone',id:'M1'});expect(ids).toEqual(['W-CLI','W-SHARED']);const sum=forecastWork(f.run,ids);expect(sum.hours).toEqual([4,7]);expect(sum.roles.reviewer).toEqual([1,2]);expect(sum.wait).toEqual([24,48]);expect(sum.touchpoints).toBe(1);
 const view=renderViews(f.run,f.context).files['ROADMAP.md'];expect(view).toContain('Shared with earlier milestones: W-SHARED');expect(view).toContain('Incremental: W-LATER');expect(view).toContain('Cumulative union labor: 4–7 known');expect(view).toContain('Linked outcome work outside this milestone: W-LATER');expect(view).toContain('unknown for W-LATER');expect(view).toContain('not committed dates');
});
it('keeps scope mismatch, unknown allocations and unstaffed roles honest',()=>{
 const f=setup();f.run.capacity={scope:{kind:'milestone',id:'M2'},period:'candidate window',hours:20,roles:[{role:'engineer',hours:20}],ownerTouchpoints:null,sourceRefs:[{sourceId:'request',locator:'capacity'}]};
 expect(renderViews(f.run,f.context).files['OWNER-BRIEF.md']).toContain('Capacity fit is unknown because linked outcome work is outside the milestone');
 f.run.milestones![1].workIds.push('W-CLI');expect(renderViews(f.run,f.context).files['OWNER-BRIEF.md']).toContain('Capacity fit is unknown because work estimates are missing');
 f.run.work[2].estimate={allocations:[{role:'engineer',hours:null}],ownerDelayHours:null,ownerTouchpoints:null};expect(forecastWork(f.run,scopeWorkIds(f.run,{kind:'milestone',id:'M2'})).unknown).toContain('W-LATER');
 f.run.work[2].estimate={hours:[1,1],role:'engineer',ownerDelayHours:null,ownerTouchpoints:null};expect(renderViews(f.run,f.context).files['OWNER-BRIEF.md']).toContain('Capacity fit is unknown because role availability is missing');
});
it('rejects malformed or mixed allocations and invalid scope references',()=>{
 const f=setup();(f.run.work[1].estimate as any).allocations.push({role:'reviewer',hours:[1,2]});expect(()=>parseRun(f.run)).toThrow(/duplicate allocation/);
 (f.run.work[1].estimate as any).allocations.pop();(f.run.work[1].estimate as any).role='engineer';expect(()=>parseRun(f.run)).toThrow(/single-role/);
});
it('binds relevant forecast while unrelated milestone changes leave selected review and scope intact',()=>{
 const f=setup(); f.run.policy.reviews.implementation=['independent'];f.run.milestones=[f.run.milestones![0]];const req={purpose:'implementation' as const,subjectIds:['W-CLI']};const original=reviewBinding(f.run,req).fingerprint,scope=scopeFingerprint(f.run);
 f.run.milestones.push({id:'M-OTHER',title:'Other',result:'Later',recovery:'Retry',outcomeIds:['O-GREETING'],workIds:['W-LATER'],assumptions:'Unknown',reforecast:'Later',sourceRefs:[{sourceId:'request',locator:'source'}]});
 // W-LATER shares W-SHARED but does not contain W-CLI in its closure.
 expect(reviewBinding(f.run,req).fingerprint).toBe(original);expect(scopeFingerprint(f.run)).toBe(scope);
 f.run.milestones[0].assumptions='Changed';expect(reviewBinding(f.run,req).fingerprint).not.toBe(original);expect(scopeFingerprint(f.run)).toBe(scope);
});

it('compares distinct release scopes and rejects missing producer dependencies',()=>{
 const f=setup(); const outcome=structuredClone(f.run.outcomes[0]);outcome.id='O-LATER';f.run.outcomes.push(outcome);f.run.work[2].outcomeIds=['O-LATER'];f.run.releases.push({id:'R2',title:'Other release',outcomeIds:['O-LATER'],sharedCriterionIds:[],sourceRefs:[{sourceId:'request',locator:'source'}],inputs:[]});
 // Distinct criteria establish independent release boundaries.
 f.run.criteria.push(...f.run.criteria.map(c=>({...structuredClone(c),id:c.id+'-LATER'})));outcome.criterionIds=['C-OK-LATER','C-RECOVER-LATER'];f.run.work[2].criterionIds=outcome.criterionIds;
 const r1=scopeWorkIds(f.run,{kind:'release',id:'R1'}),r2=scopeWorkIds(f.run,{kind:'release',id:'R2'});expect(r1).not.toContain('W-LATER');expect(r2).toContain('W-LATER');expect(r2).toContain('W-SHARED');
 f.run.capacity={scope:{kind:'release',id:'R2'},period:'window',hours:10,roles:[{role:'engineer',hours:10},{role:'reviewer',hours:10}],ownerTouchpoints:null,sourceRefs:[{sourceId:'request',locator:'capacity'}]};
 f.run.work[2].inputs=[{kind:'work',id:'missing'}];expect(renderViews(f.run,f.context).files['OWNER-BRIEF.md']).toContain('Capacity fit is unknown because the contract or a dependency is invalid');
});
it('includes producers of outcome prerequisites in milestone and release forecasts and detail binding',()=>{
 const f=setup(); const prereq=structuredClone(f.run.outcomes[0]);prereq.id='O-PREREQ';prereq.inputs=[];f.run.outcomes.push(prereq);
 const producer=structuredClone(f.run.work[1]);producer.id='W-PRODUCER';producer.outcomeIds=['O-PREREQ'];producer.files=['producer.mjs'];producer.inputs=[];f.run.work.push(producer);
 f.run.work[0].inputs=[{kind:'outcome',id:'O-PREREQ'}];
 expect(scopeWorkIds(f.run,{kind:'milestone',id:'M1'})).toContain('W-PRODUCER');expect(scopeWorkIds(f.run,{kind:'release',id:'R1'})).toContain('W-PRODUCER');
 f.run.policy.reviews.implementation=['independent'];const request={purpose:'implementation' as const,subjectIds:['W-CLI']};const before=reviewBinding(f.run,request).fingerprint;producer.estimate={hours:[20,30],role:'engineer',ownerDelayHours:null,ownerTouchpoints:null};expect(reviewBinding(f.run,request).fingerprint).not.toBe(before);
});
it('does not report fit when a release has no producer',()=>{
 const f=createFixture();fixtures.push(f);f.run.work=[];f.run.activeWorkIds=[];f.run.capacity={scope:{kind:'release',id:'R1'},period:'window',hours:10,roles:[],ownerTouchpoints:null,sourceRefs:[{sourceId:'request',locator:'source'}]};
 const view=renderViews(f.run,f.context).files['OWNER-BRIEF.md'];expect(view).toContain('outcome or criterion producers are missing');expect(view).not.toContain('labor subtotal is within');
 f.run.capacity.scope={kind:'all-work'};expect(renderViews(f.run,f.context).files['OWNER-BRIEF.md']).toContain('outcome or criterion producers are missing');
});
it('reports scoped role and owner excess independently from total hours',()=>{
 const f=setup();f.run.milestones![0].workIds.push('W-LATER');f.run.work[2].estimate={hours:[1,1],role:'engineer',ownerDelayHours:[0,0],ownerTouchpoints:1};
 f.run.capacity={scope:{kind:'milestone',id:'M1'},period:'window',hours:100,roles:[{role:'engineer',hours:1},{role:'reviewer',hours:5}],ownerTouchpoints:1,sourceRefs:[{sourceId:'request',locator:'source'}]};const view=renderViews(f.run,f.context).files['OWNER-BRIEF.md'];expect(view).toContain('High estimate exceeds declared engineer hours');expect(view).toContain('Known owner touchpoints exceed declared capacity');
});

it('shows missing producers for prerequisites declared by a milestone outcome',()=>{
 const f=createFixture();fixtures.push(f);const prereq=structuredClone(f.run.outcomes[0]);prereq.id='O-PREREQ';f.run.outcomes.push(prereq);f.run.outcomes[0].inputs=[{kind:'outcome',id:'O-PREREQ'}];f.run.milestones=[{id:'M',title:'Journey',result:'Result',recovery:'Retry',outcomeIds:['O-GREETING'],workIds:['W-CLI'],assumptions:'Unknown',reforecast:'After proof',sourceRefs:[{sourceId:'request',locator:'source'}]}];f.run.capacity={scope:{kind:'milestone',id:'M'},period:'window',hours:10,roles:[{role:'engineer',hours:10}],ownerTouchpoints:null,sourceRefs:[{sourceId:'request',locator:'source'}]};expect(renderViews(f.run,f.context).files['OWNER-BRIEF.md']).toContain('outcome or criterion producers are missing');
});
