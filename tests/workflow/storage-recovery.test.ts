import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { expect, it } from 'vitest';
import { createFixture } from './fixture.js';
import { commitRun, loadRun } from '../../src/store.js';

function child(args:string[]) {
  return new Promise<{code:number|null;stdout:string;stderr:string}>((resolve,reject)=>{
    const p=spawn(process.execPath,args,{stdio:['ignore','pipe','pipe']});let stdout='',stderr='';
    p.stdout.on('data',d=>stdout+=d);p.stderr.on('data',d=>stderr+=d);p.on('error',reject);p.on('close',code=>resolve({code,stdout,stderr}));
  });
}
it('two real writers cannot both commit the same expected revision',async()=>{
  const f=createFixture();try{
    commitRun(f.root,'run.json',f.run,0);const next=structuredClone(f.run);next.revision=2;f.file('candidate.json',JSON.stringify(next));
    const args=[path.resolve('dist/cli.js'),'commit','run.json','--from','candidate.json','--expect-revision','1','--project-root',f.root];
    const results=await Promise.all([child(args),child(args)]);
    expect(results.map(r=>r.code).sort()).toEqual([0,1]);expect(loadRun(f.root,'run.json').revision).toBe(2);
    expect(fs.readdirSync(path.join(f.root,'.history/run.json'))).toHaveLength(1);
  }finally{f.cleanup();}
});
it('an actual killed writer leaves the previous canonical revision recoverable',async()=>{
  const f=createFixture();let worker:ReturnType<typeof spawn>|undefined;
  try{
    commitRun(f.root,'run.json',f.run,0);const before=fs.readFileSync(path.join(f.root,'run.json'),'utf8');
    const next=structuredClone(f.run);next.revision=2;f.file('candidate.json',JSON.stringify(next));
    // Fault injection is at the filesystem boundary in a separate process, not a production test hook.
    const script=`import fs from 'node:fs';import {commitRun} from ${JSON.stringify(pathToFileURL(path.resolve('dist/store.js')).href)};
const root=${JSON.stringify(f.root)};const original=fs.renameSync;
fs.renameSync=(from,to)=>{if(String(to).endsWith('run.json')){process.stdout.write('ready\\n');Atomics.wait(new Int32Array(new SharedArrayBuffer(4)),0,0);}return original(from,to);};
commitRun(root,'run.json',JSON.parse(fs.readFileSync(root+'/candidate.json','utf8')),1);`;
    worker=spawn(process.execPath,['--input-type=module','--eval',script],{stdio:['ignore','pipe','pipe']});
    const stopped=new Promise<void>((resolve,reject)=>{
      let text='';const timer=setTimeout(()=>reject(new Error('Writer did not reach atomic replace boundary')),10000);
      worker!.stdout!.on('data',d=>{text+=d;if(text.includes('ready')){clearTimeout(timer);worker!.kill('SIGKILL');}});
      worker!.on('error',e=>{clearTimeout(timer);reject(e);});worker!.on('close',()=>{clearTimeout(timer);text.includes('ready')?resolve():reject(new Error('Writer exited before injected boundary'));});
    });
    await stopped;expect(fs.readFileSync(path.join(f.root,'run.json'),'utf8')).toBe(before);
    expect(loadRun(f.root,'run.json').revision).toBe(1);expect(fs.existsSync(path.join(f.root,'run.json.lock'))).toBe(true);
    expect(()=>commitRun(f.root,'run.json',next,1)).toThrow(/write owns/);
    // An operator confirms the stopped writer; only then remove its lock and retry.
    fs.unlinkSync(path.join(f.root,'run.json.lock'));expect(commitRun(f.root,'run.json',next,1).revision).toBe(2);
  }finally{if(worker&&!worker.killed)worker.kill('SIGKILL');f.cleanup();}
});
