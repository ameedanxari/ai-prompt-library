import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { afterEach, describe, expect, it } from 'vitest';
import { createFixture } from './fixture.js';
import { authorizeHost, createHost, initHost, registerHost } from '../../src/host.js';
import { main } from '../../src/host-cli.js';
import { authorizationBinding, reviewBinding, resourceBinding, grantBinding } from '../../src/workflow/evidence.js';
import { sha256 } from '../../src/store.js';

const cleanup: (()=>void)[]=[];
afterEach(()=>{ for (const f of cleanup.splice(0)) f(); });
// Simulated coordinator and independent reviewer records; these do not establish real-world identity.
function setup() {
  const f=createFixture(); cleanup.push(f.cleanup); const root=fs.realpathSync(f.root);
  const dir=fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(),'native-host-'))); cleanup.push(()=>fs.rmSync(dir,{recursive:true,force:true}));
  const profile={schemaVersion:1,coordinator:{id:'coordinator',contextId:'coordinator-context'},implementer:{id:'producer',contextId:'producer-context'},instruction:{source:f.run.sources[0].binding,quote:f.run.policy.instruction.quote,reference:f.run.policy.instruction.reference,issuedAt:f.run.policy.instruction.issuedAt,execution:'reversible'},provenance:{text:'Simulated parent instruction',reference:'fixture://instruction'}};
  const profilePath=path.join(dir,'profile.json');fs.writeFileSync(profilePath,JSON.stringify(profile));
  const hostDir=path.join(dir,'host'); initHost(hostDir,root,profilePath); const save=()=>fs.writeFileSync(path.join(root,'run.json'),JSON.stringify(f.run));save();
  const capture=(value:any, kind='judgment', data=kind==='judgment'?JSON.stringify({kind,value}):'simulated observed tool output')=>{ const artifact=path.join(hostDir,'captures','raw.txt');fs.writeFileSync(artifact,data); const origin=kind==='judgment'?{id:value.reviewer.id,contextId:value.reviewer.contextId,reference:value.reference,observedAt:value.observedAt}:{id:value.observer.id,contextId:value.observer.contextId,reference:value.observer.reference,observedAt:value.observedAt}; const c={kind,value,origin,artifact:{path:'captures/raw.txt',sha256:sha256(data)}}; const file=path.join(hostDir,'captures','capture.json');fs.writeFileSync(file,JSON.stringify(c));return {file,c,artifact}; };
  return {...f,root,dir,hostDir,profile,profilePath,save,capture};
}
describe('native host simulated coordinator',()=>{
  it('initializes the public CLI and authorizes only exact retained instruction and policy',()=>{
    const f=setup(); expect(main(['init','--directory',f.hostDir,'--project-root',f.root,'--profile',f.profilePath])).toBe(0);
    expect(main(['authorize','--directory',f.hostDir,'--run','run.json'])).toBe(0);
    expect(createHost(f.hostDir).verifyAuthorization(f.run.policy.instruction,authorizationBinding(f.run))).toBe(true);
    f.run.policy.execution='plan-only'; f.save();expect(()=>authorizeHost(f.hostDir,'run.json')).toThrow(/does not match/);
    expect(()=>main(['register','--directory',f.hostDir])).toThrow(/ai-prompt-host/);
  });
  it('rejects stale, wrong-origin and missing capture and accepts correction',()=>{
    const f=setup(); const j=f.judge('scope',['R-GREETING']);f.run.judgments=[];f.save();
    const c=f.capture(j);c.c.origin.id='wrong';fs.writeFileSync(c.file,JSON.stringify(c.c));expect(()=>registerHost(f.hostDir,'run.json',c.file)).toThrow(/origin/);
    c.c.origin.id=j.reviewer.id;c.c.value.fingerprint='0'.repeat(64);let raw=JSON.stringify({kind:'judgment',value:c.c.value});fs.writeFileSync(c.artifact,raw);c.c.artifact.sha256=sha256(raw);fs.writeFileSync(c.file,JSON.stringify(c.c));expect(()=>registerHost(f.hostDir,'run.json',c.file)).toThrow(/Stale/);
    c.c.value.fingerprint=reviewBinding(f.run,j).fingerprint;raw=JSON.stringify({kind:'judgment',value:c.c.value});c.c.artifact.sha256=sha256(raw);fs.writeFileSync(c.file,JSON.stringify(c.c));fs.unlinkSync(c.artifact);expect(()=>registerHost(f.hostDir,'run.json',c.file)).toThrow();
    fs.writeFileSync(c.artifact,raw); const receipt=registerHost(f.hostDir,'run.json',c.file); expect(registerHost(f.hostDir,'run.json',c.file)).toBe(receipt);expect(createHost(f.hostDir).verifyJudgment(j,reviewBinding(f.run,j))).toBe(true);
    fs.writeFileSync(c.artifact,'changed');expect(()=>createHost(f.hostDir).verifyJudgment(j,reviewBinding(f.run,j))).toThrow(/changed/);
  });
  it('retains an actual rejected judgment and failed observation',()=>{
    const f=setup(); const j=f.judge('scope',['R-GREETING'],'rejected');f.run.judgments=[];f.save();const jc=f.capture(j);registerHost(f.hostDir,'run.json',jc.file);expect(createHost(f.hostDir).verifyJudgment(j,reviewBinding(f.run,j))).toBe(true);
    const e=f.observe('C-OK','consumer',{result:'fail'});f.run.evidence=[];f.save();const bytes=fs.readFileSync(path.join(f.root,e.artifact.path),'utf8');const ec=f.capture(e,'evidence',bytes);fs.renameSync(ec.artifact,path.join(f.hostDir,'captures','observation.txt'));ec.c.artifact.path='captures/observation.txt';fs.writeFileSync(ec.file,JSON.stringify(ec.c));
    // Restore the review raw artifact: immutable receipts remain verifiable.
    fs.writeFileSync(jc.artifact,JSON.stringify({kind:'judgment',value:j}));registerHost(f.hostDir,'run.json',ec.file);expect(createHost(f.hostDir).verifyEvidence(e,{runId:f.run.runId,criterionId:e.criterionId,targetId:e.targetId,fingerprint:e.fingerprint})).toBe(true);
  });
  it('fails closed on valid configuration drift and malformed receipt registry',()=>{
    const f=setup();authorizeHost(f.hostDir,'run.json');const host=createHost(f.hostDir);
    const configPath=path.join(f.hostDir,'config.json');const config=JSON.parse(fs.readFileSync(configPath,'utf8'));config.profile.provenance.text='changed but valid';const bytes=JSON.stringify(config,null,2)+'\n';fs.writeFileSync(configPath,bytes);
    expect(()=>host.verifyAuthorization(f.run.policy.instruction,authorizationBinding(f.run))).toThrow(/configuration changed/);
    fs.writeFileSync(path.join(f.hostDir,'config.sha256'),sha256(bytes)+'\n');
    expect(()=>host.verifyAuthorization(f.run.policy.instruction,authorizationBinding(f.run))).toThrow(/configuration changed/);
    expect(()=>createHost(f.hostDir).verifyAuthorization(f.run.policy.instruction,authorizationBinding(f.run))).toThrow(/Invalid receipt registry/);
    fs.writeFileSync(path.join(f.hostDir,'receipts','garbage'),'bad');expect(()=>createHost(f.hostDir).verifyAuthorization(f.run.policy.instruction,authorizationBinding(f.run))).toThrow();
  });
  it('rejects project-owned and symlinked host paths, and mismatched instructions',()=>{
    const f=setup();expect(()=>initHost(path.join(f.root,'host'),f.root,f.profilePath)).toThrow(/separate/);
    const link=path.join(f.dir,'link');fs.symlinkSync(f.hostDir,link);expect(()=>createHost(link)).toThrow(/Symlink/);
    const projectProfile=path.join(f.root,'profile.json');fs.writeFileSync(projectProfile,JSON.stringify(f.profile));expect(()=>initHost(path.join(f.dir,'third'),f.root,projectProfile)).toThrow(/outside/);
    f.run.policy.instruction.reference='different';f.save();expect(()=>authorizeHost(f.hostDir,'run.json')).toThrow(/does not match/);
  });
  it('requires raw reviewer output to match captured judgment',()=>{
    const f=setup();const j=f.judge('scope',['R-GREETING'],'approved');f.run.judgments=[];f.save();const c=f.capture(j);
    const rejected=JSON.stringify({kind:'judgment',value:{...j,result:'rejected'}});fs.writeFileSync(c.artifact,rejected);c.c.artifact.sha256=sha256(rejected);fs.writeFileSync(c.file,JSON.stringify(c.c));expect(()=>registerHost(f.hostDir,'run.json',c.file)).toThrow(/differs from reviewer envelope/);
  });
  it('preserves fresh resource and grant observations across binding changes',()=>{
    const f=setup();f.run.resources.push({id:'RES',description:'Observed resource',kind:'access',targetId:'cli',status:'available',sourceRefs:[{sourceId:'request',locator:'instruction'}],reference:'host://resource/1'});f.run.policy.grants.push({id:'GRANT',targetIds:['cli'],actions:['deploy'],sourceRef:{sourceId:'request',locator:'instruction'},reference:'host://grant/1'});f.save();
    const put=(kind:'grant'|'resource',value:any,n:string)=>{const content=`simulated parent observation ${n}`;const artifact=`captures/${n}.txt`;fs.writeFileSync(path.join(f.hostDir,artifact),content);const capture={kind,value,origin:{id:'coordinator',contextId:'coordinator-context',reference:value.reference,observedAt:new Date().toISOString()},artifact:{path:artifact,sha256:sha256(content)}};const file=path.join(f.hostDir,'captures',`${n}.json`);fs.writeFileSync(file,JSON.stringify(capture));return registerHost(f.hostDir,'run.json',file);};
    const oldResource=structuredClone(f.run.resources[0]),oldGrant=structuredClone(f.run.policy.grants[0]),rb=resourceBinding(f.run,'RES'),gb=grantBinding(f.run,'GRANT');const r1=put('resource',oldResource,'r1'),g1=put('grant',oldGrant,'g1');
    f.run.targets[0].environment='staging';f.run.resources[0].reference='host://resource/2';f.run.policy.grants[0].reference='host://grant/2';f.save();const r2=put('resource',f.run.resources[0],'r2'),g2=put('grant',f.run.policy.grants[0],'g2');expect(r1).not.toBe(r2);expect(g1).not.toBe(g2);
    const host=createHost(f.hostDir);expect(host.verifyResource!(oldResource,rb)).toBe(true);expect(host.verifyGrant!(oldGrant,gb)).toBe(true);expect(host.verifyResource!(f.run.resources[0],resourceBinding(f.run,'RES'))).toBe(true);expect(host.verifyGrant!(f.run.policy.grants[0],grantBinding(f.run,'GRANT'))).toBe(true);
  });
  it('runs public CLI initialization and authorization with a loadable pinned adapter',()=>{
    const f=setup(), dir=path.join(f.dir,'public-host'), cli=path.join(process.cwd(),'dist/host-cli.js');
    const init=spawnSync(process.execPath,[cli,'init','--directory',dir,'--project-root',f.root,'--profile',f.profilePath],{encoding:'utf8'});expect(init.status).toBe(0);const output=JSON.parse(init.stdout);expect(output.adapter).toBe(path.join(dir,'adapter.mjs'));
    const auth=spawnSync(process.execPath,[cli,'authorize','--directory',dir,'--run','run.json'],{encoding:'utf8'});expect(auth.status).toBe(0);expect(fs.existsSync(JSON.parse(auth.stdout).receipt)).toBe(true);
    const check=spawnSync(process.execPath,['--input-type=module','-e',`import { trustedHost } from ${JSON.stringify(pathToFileURL(output.adapter).href)}; if (typeof trustedHost.verifyAuthorization !== 'function') process.exit(1);`],{encoding:'utf8'});expect(check.status).toBe(0);
  });
  it('loads host-owned runtime and rejects modified, extra, or symlinked runtime files',()=>{
    const f=setup();const adapter=pathToFileURL(path.join(f.hostDir,'adapter.mjs')).href;
    const invoke=()=>spawnSync(process.execPath,['--input-type=module','-e',`await import(${JSON.stringify(adapter)})`],{encoding:'utf8'});
    expect(invoke().status).toBe(0);const file=path.join(f.hostDir,'runtime','workflow','review.js'), original=fs.readFileSync(file);fs.writeFileSync(file,'// modified');expect(invoke().status).not.toBe(0);expect(()=>authorizeHost(f.hostDir,'run.json')).toThrow(/runtime integrity/);fs.writeFileSync(file,original);
    const extra=path.join(f.hostDir,'runtime','unexpected.js');fs.writeFileSync(extra,'');expect(invoke().status).not.toBe(0);fs.unlinkSync(extra);
    fs.symlinkSync(file,extra);expect(invoke().status).not.toBe(0);fs.unlinkSync(extra);expect(invoke().status).toBe(0);
  });
  it('keeps verification usable after the original package runtime moves',()=>{
    const f=setup(), packageDir=path.join(f.dir,'package'), dist=path.join(packageDir,'dist'), host=path.join(f.dir,'detached-host');fs.mkdirSync(packageDir);fs.cpSync(path.join(process.cwd(),'dist'),dist,{recursive:true});fs.writeFileSync(path.join(packageDir,'package.json'),'{"type":"module"}');const cli=path.join(dist,'host-cli.js');
    const init=spawnSync(process.execPath,[cli,'init','--directory',host,'--project-root',f.root,'--profile',f.profilePath],{encoding:'utf8'});expect(init.status,init.stderr).toBe(0);
    const auth=spawnSync(process.execPath,[cli,'authorize','--directory',host,'--run','run.json'],{encoding:'utf8'});expect(auth.status,auth.stderr).toBe(0);fs.renameSync(dist,path.join(packageDir,'moved-dist'));
    const adapter=pathToFileURL(path.join(host,'adapter.mjs')).href, evidence=pathToFileURL(path.join(host,'runtime','workflow','evidence.js')).href;
    const script=`import fs from 'node:fs'; import {trustedHost} from ${JSON.stringify(adapter)}; import {authorizationBinding} from ${JSON.stringify(evidence)}; const r=JSON.parse(fs.readFileSync(${JSON.stringify(path.join(f.root,'run.json'))})); if(!trustedHost.verifyAuthorization(r.policy.instruction,authorizationBinding(r))) process.exit(2);`;
    const check=spawnSync(process.execPath,['--input-type=module','-e',script],{encoding:'utf8'});expect(check.status,check.stderr).toBe(0);
  });
  it('blocks changed package writers while retained CLI and adapter continue working',()=>{
    const f=setup(), pkg=path.join(f.dir,'writer-package'), dist=path.join(pkg,'dist'), host=path.join(f.dir,'writer-host');fs.mkdirSync(pkg);fs.cpSync(path.join(process.cwd(),'dist'),dist,{recursive:true});fs.writeFileSync(path.join(pkg,'package.json'),'{"type":"module"}');const cli=path.join(dist,'host-cli.js');
    const call=(executable:string,args:string[])=>spawnSync(process.execPath,[executable,...args],{encoding:'utf8'});
    const init=call(cli,['init','--directory',host,'--project-root',f.root,'--profile',f.profilePath]);expect(init.status,init.stderr).toBe(0);const retained=JSON.parse(init.stdout).cli;expect(retained).toBe(path.join(host,'runtime','host-cli.js'));
    fs.appendFileSync(path.join(dist,'workflow','graph.js'),'\n// simulated package upgrade\n');
    const denied=call(cli,['authorize','--directory',host,'--run','run.json']);expect(denied.status).not.toBe(0);expect(denied.stderr).toContain(retained);
    const auth=call(retained,['authorize','--directory',host,'--run','run.json']);expect(auth.status,auth.stderr).toBe(0);
    const j=f.judge('scope',['R-GREETING']);f.run.judgments=[];f.save();const raw=JSON.stringify({kind:'judgment',value:j});fs.writeFileSync(path.join(host,'captures','review.json'),raw);const capture={kind:'judgment',value:j,origin:{id:j.reviewer.id,contextId:j.reviewer.contextId,reference:j.reference,observedAt:j.observedAt},artifact:{path:'captures/review.json',sha256:sha256(raw)}};const cap=path.join(host,'captures','capture.json');fs.writeFileSync(cap,JSON.stringify(capture));
    const deniedRecord=call(cli,['register','--directory',host,'--run','run.json','--capture',cap]);expect(deniedRecord.status).not.toBe(0);const registered=call(retained,['register','--directory',host,'--run','run.json','--capture',cap]);expect(registered.status,registered.stderr).toBe(0);
    const adapter=pathToFileURL(path.join(host,'adapter.mjs')).href,evidence=pathToFileURL(path.join(host,'runtime','workflow','evidence.js')).href;const script=`import fs from 'node:fs'; import {trustedHost} from ${JSON.stringify(adapter)}; import {authorizationBinding} from ${JSON.stringify(evidence)}; const r=JSON.parse(fs.readFileSync(${JSON.stringify(path.join(f.root,'run.json'))})); if(!trustedHost.verifyAuthorization(r.policy.instruction,authorizationBinding(r))) process.exit(2);`;const check=spawnSync(process.execPath,['--input-type=module','-e',script],{encoding:'utf8'});expect(check.status,check.stderr).toBe(0);
  });
  it('rejects a nested runtime destination before creating partial host files',()=>{
    const f=setup(),pkg=path.join(f.dir,'nested-package'),dist=path.join(pkg,'dist');fs.mkdirSync(pkg);fs.cpSync(path.join(process.cwd(),'dist'),dist,{recursive:true});fs.writeFileSync(path.join(pkg,'package.json'),'{"type":"module"}');const dir=path.join(dist,'nested-host');const result=spawnSync(process.execPath,[path.join(dist,'host-cli.js'),'init','--directory',dir,'--project-root',f.root,'--profile',f.profilePath],{encoding:'utf8'});expect(result.status).not.toBe(0);expect(result.stderr).toContain('inside the runtime');expect(fs.existsSync(dir)).toBe(false);
  });
  it('publishes one winner for conflicting concurrent CLI registrations',async()=>{
    const f=setup(); const first=f.judge('scope',['R-GREETING'],'approved');f.run.judgments=[];f.save();
    const second={...first,result:'rejected' as const};
    const make=(name:string,value:typeof first)=>{const content=JSON.stringify({kind:'judgment',value});const artifact=`captures/${name}.txt`;fs.writeFileSync(path.join(f.hostDir,artifact),content);const capture={kind:'judgment',value,origin:{id:value.reviewer.id,contextId:value.reviewer.contextId,reference:value.reference,observedAt:value.observedAt},artifact:{path:artifact,sha256:sha256(content)}};const file=path.join(f.hostDir,'captures',`${name}.json`);fs.writeFileSync(file,JSON.stringify(capture));return file;};
    const a=make('first',first), b=make('second',second);
    const cli=(capture:string)=>new Promise<{code:number|null;out:string}>((resolve,reject)=>{const child=spawn(process.execPath,[path.join(process.cwd(),'dist/host-cli.js'),'register','--directory',f.hostDir,'--run','run.json','--capture',capture]);let out='';child.stdout.on('data',chunk=>out+=chunk);child.stderr.on('data',chunk=>out+=chunk);child.on('error',reject);child.on('close',code=>resolve({code,out}));});
    const results=await Promise.all([cli(a),cli(b)]);expect(results.map(r=>r.code).sort()).toEqual([0,1]);expect(results.find(r=>r.code===1)?.out).toContain('Conflicting receipt ID');
    const host=createHost(f.hostDir), binding=reviewBinding(f.run,first);expect([host.verifyJudgment(first,binding),host.verifyJudgment(second,binding)].filter(Boolean)).toHaveLength(1);
  });
  it('denies a plan-only profile upgrade and producer impersonating an independent reviewer',()=>{
    const f=setup();f.profile.instruction.execution='plan-only';fs.writeFileSync(f.profilePath,JSON.stringify(f.profile));const other=path.join(f.dir,'other');initHost(other,f.root,f.profilePath);expect(()=>authorizeHost(other,'run.json')).toThrow(/does not match/);
    const j=f.judge('scope',['R-GREETING'],'approved','independent',{reviewer:{id:'producer',contextId:'producer-context',role:'independent'}});f.run.judgments=[];f.save();const c=f.capture(j);expect(()=>registerHost(f.hostDir,'run.json',c.file)).toThrow(/distinct/);
  });
});
