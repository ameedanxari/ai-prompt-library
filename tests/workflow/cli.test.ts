import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { expect, it } from 'vitest';
import { createFixture } from './fixture.js';

it('refreshes sibling review views for the current candidate and refuses to overwrite human files',()=>{
 const f=createFixture();try {
  const runPath='runs/example/run.json';f.file(runPath,JSON.stringify(f.run));
  const review=(ids='R-GREETING')=>spawnSync(process.execPath,[path.resolve('dist/cli.js'),'review',runPath,'--project-root',f.root,'--purpose','scope','--ids',ids],{encoding:'utf8'});
  const first=review();expect(first.status,first.stderr).toBe(0);const a=JSON.parse(first.stdout);expect(a.views.revision).toBe(1);expect(a.views.files).toHaveLength(4);
  const roadmap=path.join(f.root,'runs/example/views/ROADMAP.md');expect(fs.readFileSync(roadmap,'utf8')).toContain('revision=1');
  f.run.revision=2;f.run.requirements[0].description='Updated consumer obligation';f.file(runPath,JSON.stringify(f.run));
  const second=review();expect(second.status,second.stderr).toBe(0);const b=JSON.parse(second.stdout);expect(b.views.revision).toBe(2);expect(b.views.fingerprint).not.toBe(a.views.fingerprint);expect(fs.readFileSync(roadmap,'utf8')).toContain('Updated consumer obligation');
  const before=fs.readFileSync(roadmap,'utf8');const invalid=review('UNKNOWN');expect(invalid.status).toBe(1);expect(fs.readFileSync(roadmap,'utf8')).toBe(before);
  const work=path.join(f.root,'runs/example/views/WORK.md');fs.writeFileSync(work,'Human-owned notes');f.run.revision=3;f.file(runPath,JSON.stringify(f.run));
  const blocked=review();expect(blocked.status).toBe(1);expect(blocked.stderr).toContain('VIEW_PATH_OCCUPIED');expect(fs.readFileSync(work,'utf8')).toBe('Human-owned notes');expect(fs.readFileSync(roadmap,'utf8')).toBe(before);
 } finally {f.cleanup();}
});
it('does not create views for an invalid review request',()=>{
 const f=createFixture();try {f.file('run.json',JSON.stringify(f.run));const result=spawnSync(process.execPath,[path.resolve('dist/cli.js'),'review','run.json','--project-root',f.root,'--purpose','scope','--ids','UNKNOWN'],{encoding:'utf8'});expect(result.status).toBe(1);expect(fs.existsSync(path.join(f.root,'views'))).toBe(false);}finally{f.cleanup();}
});
