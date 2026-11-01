import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const library = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const root = fs.realpathSync(process.argv[2] ?? process.cwd());
const start = '## AI Prompt Library Steering (Auto-Managed — do not edit)';
const end = '<!-- /AI Prompt Library Steering (Auto-Managed) -->';
const block = `${start}\n\nRead \`.ai-prompts/prompts/orchestrators/ai-agent-entry-point.md\` for substantial work.\nUse one versioned \`run.json\` as planning authority; derive summaries and readiness.\nKeep full requested outcomes, detail and prove the next useful journey, and retain\nactual source/target-bound evidence and reviewer provenance. Model each target's\nlifecycle and authority separately. Missing access blocks its consumer, not\nindependent authorized work. Honor explicit planning/review stops and persisted\nauthorization. Existing historical runs stay unchanged; never silently migrate\nor interpret invalid state as legacy.\n\n${end}`;
function writeAtomic(file, text) {
  if (fs.existsSync(file) && fs.lstatSync(file).isSymbolicLink()) throw new Error(`Refusing symlink: ${file}`);
  const temporary = `${file}.${crypto.randomUUID()}.tmp`;
  try { fs.writeFileSync(temporary, text, {flag:'wx'}); fs.renameSync(temporary,file); }
  finally { if (fs.existsSync(temporary)) fs.unlinkSync(temporary); }
}
try {
  const file = path.join(root,'AGENTS.md');
  if (fs.existsSync(file) && fs.lstatSync(file).isSymbolicLink()) throw new Error('AGENTS.md is a symlink; preserve it and integrate deliberately');
  const previous = fs.existsSync(file) ? fs.readFileSync(file,'utf8') : '# AGENTS\n\nProject instructions.\n';
  const occurrences = previous.split(start).length-1;
  if (occurrences>1) throw new Error('Multiple managed blocks; refusing an ambiguous rewrite');
  let next;
  if (occurrences===1) {
    const begin=previous.indexOf(start), finish=previous.indexOf(end,begin);
    if (finish<0) throw new Error('Managed block lacks its end marker; preserve and reconcile the old section explicitly');
    next=previous.slice(0,begin)+block+previous.slice(finish+end.length);
  } else next=previous.replace(/\s*$/,'')+'\n\n'+block+'\n';
  if(next!==previous) writeAtomic(file,next);
  const brief=path.join(root,'MY_PROJECT.md');
  if(!fs.existsSync(brief)) fs.copyFileSync(path.join(library,'MY_PROJECT.md.template'),brief,fs.constants.COPYFILE_EXCL);
  console.log(JSON.stringify({projectRoot:root,steeringUpdated:next!==previous,preserved:'Existing user instructions, IDE settings, plans, approvals and history are not replaced.'}));
} catch(error) { console.error(JSON.stringify({code:'BOOTSTRAP_BLOCKED',message:error.message})); process.exitCode=1; }
