import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';
import { createFixture } from './fixture.js';
import { reviewBinding } from '../../src/workflow/evidence.js';

const cli=(root:string,args:string[])=>spawnSync(process.execPath,[path.resolve('dist/cli.js'),...args,'--project-root',root],{encoding:'utf8'});

describe('source-bound owner projection',()=>{
  it('shows source terms and unknowns without inventing facts, and distinguishes producers from evidence',()=>{
    const f=createFixture();try {
      const source='Contract: base USD 2,400, payable 50% at start and 50% at acceptance. Feedback is not acceptance. Support price is not yet agreed.';
      const original=fs.readFileSync(path.join(f.root,'USER-REQUEST.md'),'utf8');f.run.sources[0].binding=f.file('USER-REQUEST.md',original+'\n'+source);
      f.run.requirements[0].description=source;
      f.run.requirements[0].ownerSummary='USD 2,400: 50% at start, 50% at acceptance; feedback is not acceptance. Support price unknown. <confirm> | owner [details](https://example.invalid/terms) **literal** &lt;owner&gt;';
      f.run.decisions.push({id:'D1',description:'Confirm support price before support work; affected work W-SUPPORT; recommendation: defer pending quote.',sourceRefs:[{sourceId:'request',locator:'Contract'}],producedBy:[],inputs:[],requiredRoles:['owner']});
      f.run.criteria.push({...structuredClone(f.run.criteria[0]),id:'C-EXTERNAL',description:'Independent external observation.'});
      f.run.criteria.push({...structuredClone(f.run.criteria[0]),id:'C-UNSEEN',description:'No observation yet.'});
      f.run.requirements[0].criterionIds.push('C-EXTERNAL','C-UNSEEN');
      f.run.outcomes[0].criterionIds.push('C-EXTERNAL','C-UNSEEN');
      f.observe('C-OK');f.observe('C-EXTERNAL');fs.writeFileSync(path.join(f.root,'run.json'),JSON.stringify(f.run));
      const view=cli(f.root,['view','run.json']);expect(view.status,view.stderr).toBe(0);const brief=JSON.parse(view.stdout).ownerBrief;
      expect(brief).toContain('USD 2,400');expect(brief).toContain('50% at start');expect(brief).toContain('feedback is not acceptance');expect(brief).toContain('Support price unknown');
      expect(brief).toContain('&lt;confirm&gt; \\| owner \\[details\\]\\(https\\://example\\.invalid/terms\\) \\*\\*literal\\*\\* &amp;lt;owner&amp;gt;');expect(brief).toContain('Confirm support price before support work');expect(brief).not.toContain('USD 3,000');
      const review=cli(f.root,['review','run.json','--purpose','scope','--ids','R-GREETING']);expect(review.status,review.stderr || review.stdout).toBe(0);const catalog=JSON.parse(review.stdout).traceability.sourceComparison.acceptance;
      expect(catalog.find((c:any)=>c.id==='C-OK')).toMatchObject({producerWorkIds:['W-CLI'],evidenceIds:['E1']});
      expect(catalog.find((c:any)=>c.id==='C-EXTERNAL')).toMatchObject({producerWorkIds:[],evidenceIds:['E2']});
      expect(catalog.find((c:any)=>c.id==='C-UNSEEN')).toMatchObject({producerWorkIds:[],evidenceIds:[]});
      const binding=reviewBinding(f.run,{purpose:'scope',subjectIds:['R-GREETING']});f.run.requirements[0].ownerSummary='Changed summary';
      expect(reviewBinding(f.run,{purpose:'scope',subjectIds:['R-GREETING']}).fingerprint).not.toBe(binding.fingerprint);
    } finally {f.cleanup();}
  });
  it('leaves historical absent summaries absent and flags no recorded owner terms',()=>{
    const f=createFixture();try {fs.writeFileSync(path.join(f.root,'run.json'),JSON.stringify(f.run));const view=cli(f.root,['view','run.json']);expect(view.status,view.stderr).toBe(0);expect(JSON.parse(view.stdout).ownerBrief).toContain('None recorded');expect(f.run.requirements[0]).not.toHaveProperty('ownerSummary');}finally{f.cleanup();}
  });
});
