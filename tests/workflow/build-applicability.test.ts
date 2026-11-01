import fs from 'node:fs';
import { describe, it, expect } from 'vitest';
import { parseRun } from '../../src/workflow/schema.js';
import { validateGraph } from '../../src/workflow/graph.js';
import { evidenceBinding, reviewBinding, scopeFingerprint, authorizationBinding } from '../../src/workflow/evidence.js';
import type { RunContract } from '../../src/workflow/contract.js';

function fixture(): RunContract {
  const r = JSON.parse(fs.readFileSync('docs/examples/run.json','utf8')) as RunContract;
  r.requirements[0].releaseIds=['R1'];
  r.releases=[{id:'R1',title:'Physical inspection',outcomeIds:['O1'],sharedCriterionIds:[],sourceRefs:[{sourceId:'S1',locator:'Example request, paragraph 1'}],inputs:[],composition:'actual-target'}];
  r.targets[0].kind='physical-operation';
  r.targets[0].buildExemption={reason:'No software artifact is delivered by this physical inspection',sourceRef:{sourceId:'S1',locator:'Example request, paragraph 1'}};
  return r;
}
const codes=(r:RunContract)=>validateGraph(parseRun(r)).map(x=>x.code);
describe('source-bound physical operation',()=>{
  it('permits an explicitly declared operation while preserving software and mixed builds',()=>{
    const r=fixture(); expect(codes(r)).not.toContain('RELEASE_BUILD_MISSING');
    const old=structuredClone(r);old.targets[0].kind='cli';delete old.targets[0].buildExemption;
    expect(codes(old)).toContain('RELEASE_BUILD_MISSING');
    const mixed=structuredClone(r);mixed.targets.push({...structuredClone(old.targets[0]),id:'T2'});
    mixed.criteria.push({...structuredClone(mixed.criteria[0]),id:'C3',targetId:'T2'},{...structuredClone(mixed.criteria[1]),id:'C4',targetId:'T2'});
    mixed.outcomes.push({...structuredClone(mixed.outcomes[0]),id:'O2',targetId:'T2',criterionIds:['C3','C4']});mixed.releases[0].outcomeIds.push('O2');
    expect(codes(mixed)).toContain('RELEASE_BUILD_MISSING');mixed.criteria.find(c=>c.id==='C3')!.evidenceKinds.push('build');expect(codes(mixed)).not.toContain('RELEASE_BUILD_MISSING');
  });
  it('rejects absent or malformed physical rationale, unknown sources, and exemptions on software',()=>{
    const r=fixture();delete r.targets[0].buildExemption;expect(()=>parseRun(r)).toThrow();
    const empty=fixture();empty.targets[0].buildExemption!.reason='';expect(()=>parseRun(empty)).toThrow();
    const invalid=fixture();invalid.targets[0].buildExemption!.sourceRef.sourceId='MISSING';expect(codes(invalid)).toContain('REFERENCE_UNKNOWN');
    const soft=fixture();soft.targets[0].kind='cli';expect(()=>parseRun(soft)).toThrow();
  });
  it('binds an outcome-only physical target and its separate source in implementation review',()=>{
    const r=fixture();
    r.sources.push({...structuredClone(r.sources[0]),id:'S2',binding:{...r.sources[0].binding,sha256:'a'.repeat(64)}});
    const target=structuredClone(r.targets[0]);target.id='T2';target.buildExemption!.sourceRef.sourceId='S2';r.targets.push(target);
    r.criteria.push({...structuredClone(r.criteria[0]),id:'C3',targetId:'T2'},{...structuredClone(r.criteria[1]),id:'C4',targetId:'T2'});
    r.outcomes.push({...structuredClone(r.outcomes[0]),id:'O2',targetId:'T2',criterionIds:['C3','C4']});
    r.work[0].outcomeIds.push('O2');
    expect(codes(r)).toEqual([]);
    const before=reviewBinding(r,{purpose:'implementation',subjectIds:['W1']}).fingerprint;
    r.sources.find(s=>s.id==='S2')!.binding.sha256='b'.repeat(64);
    const changedSource=reviewBinding(r,{purpose:'implementation',subjectIds:['W1']}).fingerprint;expect(changedSource).not.toBe(before);
    r.targets.find(t=>t.id==='T2')!.buildExemption!.reason='Revised physical rationale';
    expect(reviewBinding(r,{purpose:'implementation',subjectIds:['W1']}).fingerprint).not.toBe(changedSource);
  });
  it('binds rationale source even outside requirement references, and preserves historical hashes',()=>{
    const r=fixture();r.sources.push({...structuredClone(r.sources[0]),id:'S2',binding:{...r.sources[0].binding,sha256:'a'.repeat(64)}});r.targets[0].buildExemption!.sourceRef.sourceId='S2';
    const evidence=evidenceBinding(r,'C1').fingerprint,detail=reviewBinding(r,{purpose:'implementation',subjectIds:['W1']}).fingerprint,scope=scopeFingerprint(r);
    r.sources.find(s=>s.id==='S2')!.binding.sha256='b'.repeat(64);expect(evidenceBinding(r,'C1').fingerprint).not.toBe(evidence);expect(reviewBinding(r,{purpose:'implementation',subjectIds:['W1']}).fingerprint).not.toBe(detail);expect(scopeFingerprint(r)).not.toBe(scope);
    const before=evidenceBinding(r,'C1').fingerprint;r.targets[0].buildExemption!.reason='Different source rationale';expect(evidenceBinding(r,'C1').fingerprint).not.toBe(before);
    const legacy=JSON.parse(fs.readFileSync('docs/examples/run.json','utf8')) as RunContract;delete legacy.policy.reviewBindingVersion;
    expect(scopeFingerprint(legacy)).toBe('5b99a34829a9ec570a620f6e973d1d1c9b0ec71ad33d27789f6abb2156a332bf');expect(authorizationBinding(legacy).fingerprint).toBe('ed49e172948f2cc56a25e64f9895b17a01a0ab3833b89d637922684bc5f591b0');
  });
});
