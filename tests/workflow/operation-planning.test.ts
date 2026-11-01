import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';
import { createFixture } from './fixture.js';

const cli = (root:string,args:string[]) => spawnSync(process.execPath,[path.resolve('dist/cli.js'),...args,'--project-root',root],{encoding:'utf8'});
const write = (root:string,name:string,value:unknown) => fs.writeFileSync(path.join(root,name),JSON.stringify(value));

describe('new-run operation consistency through the public CLI',()=>{
  it('requires new-run duties, preserves them on update, and resumes historical state unchanged',()=>{
    const f=createFixture();try {
      write(f.root,'candidate.json',f.run);
      const create=()=>cli(f.root,['commit','run.json','--from','candidate.json','--expect-revision','0']);
      expect(JSON.parse(create().stderr).code).toBe('NEW_RUN_OPERATION_CONSISTENCY_REQUIRED');
      f.run.policy.operationConsistency='declared-targets';write(f.root,'candidate.json',f.run);
      expect(JSON.parse(create().stderr).code).toBe('NEW_RUN_IMPLEMENTATION_REVIEW_REQUIRED');
      f.run.policy.reviews.implementation=['independent'];write(f.root,'candidate.json',f.run);
      expect(JSON.parse(create().stderr).code).toBe('NEW_RUN_REVIEW_BINDING_VERSION_REQUIRED');
      f.run.policy.reviewBindingVersion=2;write(f.root,'candidate.json',f.run);
      expect(create().status).toBe(0);
      const downgrade=structuredClone(f.run);downgrade.revision=2;delete downgrade.policy.operationConsistency;write(f.root,'downgrade.json',downgrade);
      expect(JSON.parse(cli(f.root,['commit','run.json','--from','downgrade.json','--expect-revision','1']).stderr).code).toBe('OPERATION_CONSISTENCY_DOWNGRADE');
      downgrade.policy.operationConsistency='declared-targets';delete downgrade.policy.reviews.implementation;write(f.root,'downgrade.json',downgrade);
      expect(JSON.parse(cli(f.root,['commit','run.json','--from','downgrade.json','--expect-revision','1']).stderr).code).toBe('IMPLEMENTATION_REVIEW_DOWNGRADE');
      const legacy=structuredClone(f.run);delete legacy.policy.operationConsistency;delete legacy.policy.reviewBindingVersion;delete legacy.policy.reviews.implementation;write(f.root,'legacy.json',legacy);
      const before=fs.readFileSync(path.join(f.root,'legacy.json'),'utf8');const updated=structuredClone(legacy);updated.revision=2;write(f.root,'legacy-next.json',updated);
      expect(cli(f.root,['validate','legacy.json','--boundary','plan-reviewable']).status).toBe(0);
      expect(fs.readFileSync(path.join(f.root,'legacy.json'),'utf8')).toBe(before);
      expect(cli(f.root,['commit','legacy.json','--from','legacy-next.json','--expect-revision','1']).status).toBe(0);
      expect(JSON.parse(fs.readFileSync(path.join(f.root,'legacy.json'),'utf8')).policy).not.toHaveProperty('operationConsistency');
    } finally {f.cleanup();}
  });
  it('rejects declared live local writes early while permitting independent preparation and ungranted future planning',()=>{
    const f=createFixture();try {
      f.run.policy.operationConsistency='declared-targets';f.run.policy.reviews.implementation=['independent'];
      const live={...structuredClone(f.run.targets[0]),id:'live',environment:'production' as const,lifecycle:{stage:'live' as const,dataPolicy:'retain' as const,sourceRef:{sourceId:'request',locator:'Live system'}}};
      f.run.targets.push(live); f.run.work[0].targetIds=['cli','live'];write(f.root,'run.json',f.run);
      const validate=(boundary:string,id?:string)=>cli(f.root,['validate','run.json','--boundary',boundary,...(id?['--id',id]:[])]);
      let result=validate('plan-reviewable');expect(result.status).toBe(1);expect(JSON.parse(result.stdout).result.checks.some((c:any)=>c.code==='ACTION_TARGET_MISMATCH')).toBe(true);
      const packet=cli(f.root,['review','run.json','--purpose','scope','--ids','R-GREETING']);expect(packet.status).toBe(1);expect(JSON.parse(packet.stdout).action).toBe('blocked');
      f.run.work[0].targetIds=['cli'];f.run.work.push({...structuredClone(f.run.work[0]),id:'W-DEFERRED',targetIds:['cli','live'],instructions:''});write(f.root,'run.json',f.run);
      result=validate('plan-reviewable');expect(result.status).toBe(1);expect(JSON.parse(result.stdout).result.checks.some((c:any)=>c.code==='ACTION_TARGET_MISMATCH' && c.subject==='W-DEFERRED')).toBe(true);
      f.run.work.pop();f.run.work[0].targetIds=['cli','missing'];write(f.root,'run.json',f.run);
      result=validate('plan-reviewable');expect(result.status).toBe(1);expect(result.stderr).not.toContain('WORKFLOW_ERROR');expect(JSON.parse(result.stdout).result.checks.some((c:any)=>c.code==='REFERENCE_UNKNOWN')).toBe(true);
      f.run.work[0].targetIds=['cli'];f.run.work.push({...structuredClone(f.run.work[0]),id:'W-READ',action:'read',targetIds:['cli','live'],files:[],instructions:''});write(f.root,'run.json',f.run);
      expect(validate('plan-reviewable').status).toBe(0);
      f.run.work[0].action='live-write';f.run.work[0].targetIds=['cli','live'];write(f.root,'run.json',f.run);
      expect(validate('plan-reviewable').status).toBe(0);
      result=validate('work-executable','W-CLI');expect(result.status).toBe(2);expect(JSON.parse(result.stdout).result.checks.some((c:any)=>c.code==='ACTION_AUTHORITY_REQUIRED')).toBe(true);
      f.run.targets.find(t=>t.id==='live')!.identity=null;write(f.root,'run.json',f.run);
      expect(JSON.parse(validate('work-executable','W-CLI').stdout).result.checks.some((c:any)=>c.code==='TARGET_UNRESOLVED')).toBe(true);
      delete f.run.policy.operationConsistency;f.run.work[0].action='local-write';write(f.root,'run.json',f.run);
      expect(validate('plan-reviewable').status).toBe(0);
      expect(JSON.parse(validate('work-executable','W-CLI').stdout).result.checks.some((c:any)=>c.code==='ACTION_TARGET_MISMATCH')).toBe(true);
    } finally {f.cleanup();}
  });
});
