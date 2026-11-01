import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { traceabilityPacket } from '../../src/workflow/traceability.js';
import { createFixture } from './fixture.js';

describe('traceability review packet', () => {
  it('the public review command retains changed acceptance bytes from same-run history', () => {
    const f=createFixture();
    try {
      const previous=structuredClone(f.run); previous.criteria[0].description='Retain the original acceptance condition.';
      fs.writeFileSync(path.join(f.root,'before.json'),JSON.stringify(previous));
      fs.writeFileSync(path.join(f.root,'run.json'),JSON.stringify(f.run));
      const result=spawnSync(process.execPath,[path.resolve('dist/cli.js'),'review','run.json','--project-root',f.root,'--purpose','scope','--ids','R-GREETING','--previous','before.json'],{encoding:'utf8'});
      expect(result.status,result.stderr).toBe(0);
      const packet=JSON.parse(result.stdout);
      expect(packet.traceability.changes.criteria[0].before.description).toBe('Retain the original acceptance condition.');
      expect(packet.contract.criteria[0].description).toBe(f.run.criteria[0].description);
      expect(packet.traceability.criteria[0]).not.toHaveProperty('description');
    } finally { f.cleanup(); }
  });
  it('exposes replaced criterion bytes, dropped source links and previous-only obligations', () => {
    const f = createFixture();
    try {
      const previous = structuredClone(f.run);
      previous.sources.push({ ...previous.sources[0], id:'terms' });
      previous.requirements[0].sourceRefs.push({ sourceId:'terms',locator:'Signed terms §2' });
      previous.requirements.push({ id:'OLD',description:'Retain the signed commercial terms.',sourceRefs:[{ sourceId:'terms',locator:'Signed terms §3' }],criterionIds:['C-OK'],releaseIds:['R1'],mandatory:true });
      previous.criteria[0].description = 'The signed commercial terms are accepted in full.';
      f.run.criteria[0].description = 'Forecast the prototype schedule.';
      f.run.sources.push({ ...f.run.sources[0],id:'terms',inspection:'unread' });
      const packet = traceabilityPacket(f.run,previous);
      const criterion = packet.changes!.criteria.find(x => x.id === 'C-OK')!;
      expect(criterion.before).toMatchObject({ description:'The signed commercial terms are accepted in full.' });
      expect(criterion.after).toMatchObject({ description:'Forecast the prototype schedule.' });
      const change = packet.changes!.requirements.find(x => x.id === 'R-GREETING')!;
      expect(change.before!.sourceRefs).toContainEqual({ sourceId:'terms',locator:'Signed terms §2' });
      expect(change.after!.sourceRefs).not.toContainEqual({ sourceId:'terms',locator:'Signed terms §2' });
      expect(packet.changes!.requirements.find(x => x.id === 'OLD')).toMatchObject({ before:{ description:'Retain the signed commercial terms.' },after:null });
      expect(packet.unmappedSourceIds).toContain('terms');
      expect(packet.changes!.sources.find(x => x.id === 'terms')).toMatchObject({ before:{ inspection:'complete' },after:{ inspection:'unread' } });
      expect(() => traceabilityPacket(f.run,{ ...previous,runId:'different' })).toThrow('TRACEABILITY_RUN_MISMATCH');
    } finally { f.cleanup(); }
  });

  it('shows staging versus production, recovery and shared release closure without grading them', () => {
    const f = createFixture();
    try {
      f.run.targets[0].environment = 'staging';
      f.run.targets.push({ ...structuredClone(f.run.targets[0]),id:'production',environment:'production',lifecycle:{ stage:'live',dataPolicy:'retain',sourceRef:null } });
      f.run.criteria.push({ ...structuredClone(f.run.criteria[1]),id:'C-SHARED',description:'Restore the production data.',targetId:'production',productionRequired:true,releaseRole:'supporting' });
      f.run.releases[0].sharedCriterionIds.push('C-SHARED');
      const packet = traceabilityPacket(f.run);
      expect(packet.releases[0].closure.criterionIds).toContain('C-SHARED');
      expect(packet.criteria.find(c => c.id === 'C-RECOVER')).toMatchObject({ scenario:'recovery',effectiveReleaseRole:'delivered',targetId:'cli' });
      expect(packet.targets.find(t => t.id === 'cli')).toMatchObject({ environment:'staging' });
      expect(packet.criteria.find(c => c.id === 'C-SHARED')).toMatchObject({ productionRequired:true,releaseRole:'supporting',targetId:'production' });
      expect(packet.targets.find(t => t.id === 'production')).toMatchObject({ environment:'production',lifecycle:{ stage:'live',dataPolicy:'retain' } });
      expect(packet.reviewerQuestions.join(' ')).toMatch(/staging or rehearsal/);
      expect(packet).not.toHaveProperty('pass');
    } finally { f.cleanup(); }
  });

  it('retains a shared criterion once even across many requirements and releases', () => {
    const f = createFixture();
    try {
      f.run.criteria[0].description = 'UNIQUE SHARED ACCEPTANCE TEXT';
      for (let i = 0; i < 20; i++) {
        f.run.requirements.push({ ...structuredClone(f.run.requirements[0]),id:`REQ-${i}`,criterionIds:['C-OK'] });
        f.run.releases.push({ ...structuredClone(f.run.releases[0]),id:`REL-${i}`,sharedCriterionIds:['C-OK'] });
      }
      const packet = traceabilityPacket(f.run);
      expect(packet.criteria.filter(c => c.id === 'C-OK')).toHaveLength(1);
      expect(JSON.stringify(packet).split('UNIQUE SHARED ACCEPTANCE TEXT')).toHaveLength(2);
      expect(packet.requirements.find(q => q.id === 'REQ-19')!.criterionIds).toContain('C-OK');
      expect(packet.releases.find(r => r.id === 'REL-19')!.closure.criterionIds).toContain('C-OK');
    } finally { f.cleanup(); }
  });
});
