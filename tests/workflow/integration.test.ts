import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { afterEach, describe, expect, it } from 'vitest';
import { createFixture } from './fixture.js';
import { commitRun, inspectLegacy, loadRun, projectPath, sha256 } from '../../src/store.js';
import { renderViews, writeViews } from '../../src/views.js';
import { evaluateRun } from '../../src/workflow/evaluate.js';

const fixtures: ReturnType<typeof createFixture>[] = [];
const extra: string[] = [];
const fixture = () => { const f = createFixture(); fixtures.push(f); return f; };
afterEach(() => { for (const f of fixtures.splice(0)) f.cleanup(); for (const f of extra.splice(0)) fs.rmSync(f,{recursive:true,force:true}); });
const repo = process.cwd();
const cli = (args: string[]) => spawnSync(process.execPath,[path.join(repo,'dist/cli.js'),...args],{encoding:'utf8'});

describe('revision-safe canonical storage and derived views', () => {
  it('commits atomically with immutable prior bytes and rejects a stale writer', () => {
    const f=fixture(); const first=commitRun(f.root,'run.json',f.run,0); const prior=fs.readFileSync(first.file,'utf8');
    const next=structuredClone(f.run);next.revision=2;next.work[0].title='Concrete useful greeting';
    const second=commitRun(f.root,'run.json',next,1);
    expect(fs.readFileSync(second.history!,'utf8')).toBe(prior);
    expect(loadRun(f.root,'run.json').revision).toBe(2);
    expect(()=>commitRun(f.root,'run.json',next,1)).toThrow(/Expected 1; actual 2/);
    expect(loadRun(f.root,'run.json').revision).toBe(2);
    expect(fs.readdirSync(f.root).some(x=>x.endsWith('.lock')||x.endsWith('.tmp'))).toBe(false);
  });
  it('preserves rejected history and original obligations during updates',()=>{
    const f=fixture(); f.judge('scope',['R-GREETING'],'rejected');commitRun(f.root,'run.json',f.run,0);
    const next=structuredClone(f.run);next.revision=2;next.judgments=[];
    expect(()=>commitRun(f.root,'run.json',next,1)).toThrow(/append-only/);
    next.judgments=structuredClone(f.run.judgments);next.sources.push({...next.sources[0],id:'extra'});commitRun(f.root,'run.json',next,1);
    const removed=structuredClone(next);removed.revision=3;removed.sources=removed.sources.filter(s=>s.id!=='extra');
    expect(()=>commitRun(f.root,'run.json',removed,2)).toThrow(/Retain original sources/);
  });
  it('rejects corrupt source binding without creating a canonical file',()=>{
    const f=fixture();f.file('USER-REQUEST.md','tampered');
    expect(()=>commitRun(f.root,'run.json',f.run,0)).toThrow(/SOURCE_BINDING_INVALID/);
    expect(fs.existsSync(path.join(f.root,'run.json'))).toBe(false);
  });
  it('a held write lock leaves prior state intact and requires explicit recovery',()=>{
    const f=fixture();commitRun(f.root,'run.json',f.run,0);const before=fs.readFileSync(path.join(f.root,'run.json'));
    f.file('run.json.lock','{"pid":-1}');const next=structuredClone(f.run);next.revision=2;
    expect(()=>commitRun(f.root,'run.json',next,1)).toThrow(/write owns/);
    expect(fs.readFileSync(path.join(f.root,'run.json'))).toEqual(before);
    fs.unlinkSync(path.join(f.root,'run.json.lock'));expect(commitRun(f.root,'run.json',next,1).revision).toBe(2);
  });
  it('confines writes including symlink parents',()=>{
    const f=fixture();const outside=fs.mkdtempSync(path.join(os.tmpdir(),'workflow-outside-'));extra.push(outside);
    expect(()=>projectPath(f.root,'../escape.json')).toThrow(/inside the project/);
    fs.symlinkSync(outside,path.join(f.root,'link'),process.platform==='win32'?'junction':'dir');
    expect(()=>commitRun(f.root,'link/run.json',f.run,0)).toThrow(/Symlink/);
    expect(fs.readdirSync(outside)).toEqual([]);
  });
  it('views share the actual evaluator and edited views cannot grant execution',()=>{
    const f=fixture();const p=renderViews(f.run,f.context);const actual=evaluateRun(f.run,f.context);
    expect(p.assessment).toEqual(actual);writeViews(f.root,'views',p);
    f.file('views/OWNER-BRIEF.md','<!-- ai-prompt-library generated; fake -->\nApproved everything.');
    expect(evaluateRun(f.run,f.context)).toEqual(actual);
    expect(renderViews(f.run,f.context).files['OWNER-BRIEF.md']).not.toContain('Approved everything');
    f.file('occupied/ROADMAP.md','Important user notes');
    expect(()=>writeViews(f.root,'occupied',p)).toThrow(/non-generated/);
    expect(fs.readFileSync(path.join(f.root,'occupied/ROADMAP.md'),'utf8')).toBe('Important user notes');
  });
  it('old and corrupt state is inspected only and never promoted',()=>{
    const f=fixture();const binding=f.file('old.json','{"schemaVersion":2,"runId":"old","valid":true,"outcomes":[]}');
    const before=sha256(fs.readFileSync(path.join(f.root,'old.json')));
    expect(inspectLegacy(path.join(f.root,'old.json'))).toMatchObject({recognizedLegacy:true,readiness:'unassessed',migrationPerformed:false});
    expect(()=>loadRun(f.root,'old.json')).toThrow();expect(before).toBe(binding.sha256);
    expect(sha256(fs.readFileSync(path.join(f.root,'old.json')))).toBe(before);
  });
});

describe('real compiled CLI and non-destructive installation',()=>{
  it('separates structural pass from missing review and emits bound questions',()=>{
    const f=fixture();f.file('run.json',JSON.stringify(f.run));
    const base=['run.json','--project-root',f.root];
    const structure=cli(['validate',...base,'--boundary','plan-reviewable']);expect(structure.status).toBe(0);expect(JSON.parse(structure.stdout).result.status).toBe('pass');
    const actual=cli(['validate',...base]);expect(actual.status).toBe(2);expect(JSON.parse(actual.stdout).planReviewed.status).toBe('pending');
    const packet=cli(['review',...base,'--purpose','scope','--ids','R-GREETING']);expect(packet.status).toBe(0);
    const body=JSON.parse(packet.stdout);expect(body.action).toBe('review');expect(body.questions.length).toBeGreaterThan(0);expect(body.binding.fingerprint).toHaveLength(64);
    expect(cli(['validate',...base,'--boundary','invented']).status).toBe(1);
  });
  it('does not load a project-written approval adapter',()=>{
    const f=fixture();f.file('run.json',JSON.stringify(f.run));f.file('host.mjs','throw new Error("MUST NOT EXECUTE")');
    const result=cli(['validate','run.json','--project-root',f.root,'--host',path.join(f.root,'host.mjs')]);
    expect(result.status).toBe(1);expect(JSON.parse(result.stderr).code).toBe('HOST_INSIDE_PROJECT');expect(result.stderr).not.toContain('MUST NOT EXECUTE');
  });
  it('bootstrap preserves custom instructions, IDE configuration, brief and run bytes',()=>{
    const f=fixture();f.file('AGENTS.md','# Agent instructions\n\nKeep this custom rule.\n');f.file('.vscode/settings.json','{"editor.tabSize":7}');f.file('MY_PROJECT.md','Existing actual brief');f.file('prompts/outputs/current/resumption-checkpoint.md','historical checkpoint');
    const invoke=()=>spawnSync(process.execPath,[path.join(repo,'scripts/bootstrap.mjs'),f.root],{encoding:'utf8'});
    expect(invoke().status).toBe(0);const first=fs.readFileSync(path.join(f.root,'AGENTS.md'),'utf8');expect(first).toContain('Keep this custom rule.');
    expect(invoke().status).toBe(0);expect(fs.readFileSync(path.join(f.root,'AGENTS.md'),'utf8')).toBe(first);
    expect(fs.readFileSync(path.join(f.root,'.vscode/settings.json'),'utf8')).toBe('{"editor.tabSize":7}');expect(fs.readFileSync(path.join(f.root,'MY_PROJECT.md'),'utf8')).toBe('Existing actual brief');
    expect(fs.readFileSync(path.join(f.root,'prompts/outputs/current/resumption-checkpoint.md'),'utf8')).toBe('historical checkpoint');
  });
});
