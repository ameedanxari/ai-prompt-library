import { afterEach, expect, it } from 'vitest';
import { createFixture } from './fixture.js';
import { renderViews } from '../../src/views.js';
const fixtures: ReturnType<typeof createFixture>[]=[];
const setup=()=>{const f=createFixture();fixtures.push(f);f.run.capacity={period:'Illustrative delivery window',hours:8,roles:[{role:'engineer',hours:8}],ownerTouchpoints:null,sourceRefs:[{sourceId:'request',locator:'Local scope'}]};return f;};
afterEach(()=>fixtures.splice(0).forEach(f=>f.cleanup()));
it('unknown labor never becomes a zero forecast or capacity-fit conclusion',()=>{
 const f=setup();delete f.run.work[0].estimate;
 const owner=renderViews(f.run,f.context).files['OWNER-BRIEF.md'];
 expect(owner).toContain('Total effort is unknown');expect(owner).toContain('Capacity fit is unknown');expect(owner).not.toContain('0–0 hours');expect(owner).not.toContain('subtotal is within');
});
it('a known subtotal is not the full forecast when other required work has no estimate',()=>{
 const f=setup();f.run.work.push({...structuredClone(f.run.work[0]),id:'W-RECOVERY',files:['recovery.mjs'],instructions:'',estimate:undefined});
 const owner=renderViews(f.run,f.context).files['OWNER-BRIEF.md'];
 expect(owner).toContain('Known effort subtotal: 1–2 hours; total effort remains unknown');expect(owner).toContain('Unestimated work: W-RECOVERY');expect(owner).toContain('Capacity fit is unknown');
});
it('the roadmap exposes actual dependencies, labor and owner waiting without adding them together',()=>{
 const f=setup();f.run.work.push({...structuredClone(f.run.work[0]),id:'W-HANDOVER',title:'Operator handover',files:['handbook.md'],inputs:[{kind:'work',id:'W-CLI'}],instructions:'',estimate:{hours:[2,3],role:'operator',ownerDelayHours:[24,48],ownerTouchpoints:2}});
 const views=renderViews(f.run,f.context).files;
 expect(views['ROADMAP.md']).toContain('| W-HANDOVER: Operator handover | O-GREETING | work:W-CLI | operator | 2–3 | 24–48 | 2 |');
 expect(views['OWNER-BRIEF.md']).toContain('Known effort subtotal: 3–5 hours.');expect(views['OWNER-BRIEF.md']).not.toContain('27–53');
});

it('an all-work subtotal does not certify a phase overrun without aligned capacity scope',()=>{
 const f=setup();f.run.capacity!.hours=1;f.run.capacity!.period='One delivery phase';
 const owner=renderViews(f.run,f.context).files['OWNER-BRIEF.md'];
 expect(owner).toContain('Known all-work high estimate is numerically above declared capacity');
 expect(owner).toContain('only if scope and period align');expect(owner).not.toContain('**High estimate exceeds capacity');
});
