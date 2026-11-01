import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { expect, it } from 'vitest';

it('installs the actual packed library offline and consumes its public API and CLI outside the repository',()=>{
  const root=process.cwd(), temp=fs.mkdtempSync(path.join(os.tmpdir(),'workflow-package-'));
  const npm='npm', npmCli=process.env.npm_execpath;
  if (!npmCli) throw new Error('Run the package consumer test through npm test');
  const execute=(command:string,args:string[],cwd:string)=>spawnSync(command===npm?process.execPath:command,command===npm?[npmCli,...args]:args,{cwd,encoding:'utf8',timeout:25000});
  try{
    const packed=execute(npm,['pack','--ignore-scripts','--json','--pack-destination',temp],root);
    expect(packed.status,packed.stderr).toBe(0);const metadata=JSON.parse(packed.stdout)[0];
    const paths:string[]=metadata.files.map((f:{path:string})=>f.path);
    expect(paths.some(p=>p.startsWith('prompts/modules/')||p.includes('outputs/runs/')||p.startsWith('docs/run-reviews/'))).toBe(false);
    expect(paths).toContain('dist/cli.js');expect(paths).toContain('prompts/orchestrators/ai-agent-entry-point.md');
    const consumer=path.join(temp,'consumer');fs.mkdirSync(consumer);fs.writeFileSync(path.join(consumer,'package.json'),'{"private":true,"type":"module"}');
    const installed=execute(npm,['install','--offline','--ignore-scripts','--no-audit','--no-fund','--package-lock=false',path.join(temp,metadata.filename)],consumer);
    expect(installed.status,installed.stderr).toBe(0);
    const entry=execute(npm,['exec','--offline','--','ai-prompt-workflow','--help'],consumer);
    expect(entry.status,entry.stderr).toBe(0);expect(entry.stdout).toContain('ai-prompt-workflow <command>');
    const api=execute(process.execPath,['--input-type=module','--eval',"import {parseRun, evaluateRun, commitRun, renderViews} from 'ai-prompt-library'; console.log([parseRun,evaluateRun,commitRun,renderViews].every(x=>typeof x==='function'))"],consumer);
    expect(api.status,api.stderr).toBe(0);expect(api.stdout.trim()).toBe('true');
    fs.mkdirSync(path.join(consumer,'docs/examples'),{recursive:true});
    for(const file of ['run.json','request.md'])fs.copyFileSync(path.join(root,'docs/examples',file),path.join(consumer,'docs/examples',file));
    const cli=path.join(consumer,'node_modules/ai-prompt-library/dist/cli.js');
    const structural=execute(process.execPath,[cli,'validate','docs/examples/run.json','--project-root',consumer,'--boundary','plan-reviewable'],temp);
    expect(structural.status,structural.stderr + structural.stdout).toBe(0);expect(JSON.parse(structural.stdout).result.status).toBe('pass');
    const unreviewed=execute(process.execPath,[cli,'validate','docs/examples/run.json','--project-root',consumer],temp);
    expect(unreviewed.status,unreviewed.stderr).toBe(2);expect(JSON.parse(unreviewed.stdout).planReviewed.status).toBe('pending');
  }finally{fs.rmSync(temp,{recursive:true,force:true});}
});
