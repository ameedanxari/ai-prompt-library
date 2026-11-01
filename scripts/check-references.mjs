import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
const tracked = execFileSync('git',['ls-files','-co','--exclude-standard','-z'],{encoding:'utf8'}).split('\0').filter(Boolean);
const files=[...new Set(tracked)].filter(p=>p.endsWith('.md')&&fs.existsSync(p)&&!p.startsWith('node_modules/'));
const errors=[];
for(const file of files){
 const text=fs.readFileSync(file,'utf8');
 for(const match of text.matchAll(/\]\(([^)]+)\)/g)){
  const raw=match[1].split('#')[0].replace(/^<|>$/g,'');
  if(!raw||/^[a-z][a-z0-9+.-]*:/i.test(raw)||raw.includes('${'))continue;
  const target=path.resolve(path.dirname(file),decodeURIComponent(raw));
  if(!fs.existsSync(target))errors.push(`${file}: missing ${raw}`);
 }
}
if(errors.length){console.error(errors.join('\n'));process.exitCode=1;}else console.log(`${files.length} Markdown files: local links resolve`);
