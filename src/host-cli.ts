#!/usr/bin/env node
import fs from 'node:fs';
import { pathToFileURL } from 'node:url';
import { initHost, authorizeHost, registerHost } from './host.js';
const usage = 'ai-prompt-host init --directory ABS --project-root ABS --profile ABS\nai-prompt-host authorize --directory ABS --run RELATIVE\nai-prompt-host register --directory ABS --run RELATIVE --capture ABS';
export function main(args: string[]): number {
  if (!args.length || args[0]==='--help' || args[0]==='help') { process.stdout.write(`${usage}\n`); return 0; }
  const [command,...rest]=args, options: Record<string,string>={};
  for (let i=0;i<rest.length;i+=2) { const key=rest[i]; if (!key?.startsWith('--') || !rest[i+1] || rest[i+1].startsWith('--') || key in options) throw new Error(usage); options[key]=rest[i+1]; }
  const keys=command==='init' ? ['--directory','--project-root','--profile'] : command==='authorize' ? ['--directory','--run'] : command==='register' ? ['--directory','--run','--capture'] : [];
  if (!keys.length || Object.keys(options).length!==keys.length || keys.some(k=>!options[k])) throw new Error(usage);
  const result=command==='init' ? initHost(options['--directory'],options['--project-root'],options['--profile']) : command==='authorize' ? {receipt:authorizeHost(options['--directory'],options['--run'])} : {receipt:registerHost(options['--directory'],options['--run'],options['--capture'])};
  process.stdout.write(`${JSON.stringify(result,null,2)}\n`); return 0;
}
if (process.argv[1] && pathToFileURL(fs.realpathSync(process.argv[1])).href===import.meta.url) { try { process.exitCode=main(process.argv.slice(2)); } catch (error) { process.stderr.write(`${JSON.stringify({error:error instanceof Error ? error.message : String(error)})}\n`); process.exitCode=1; } }
