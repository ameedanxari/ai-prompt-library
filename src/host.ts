/** Native coordinator receipts are attestations, not signatures or caller authentication. */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { loadRun, readJson, sha256, stable } from './store.js';
import { parseRun } from './workflow/schema.js';
import { authorizationBinding, checkpointBinding, evidenceBinding, grantBinding, readBinding, resourceBinding, reviewBinding } from './workflow/evidence.js';
import { planReview, requestProblem } from './workflow/review.js';
import type { TrustedHost, RunContract, FileBinding, Evidence, Judgment, AuthorityGrant, Resource, CheckpointAcknowledgment } from './workflow/contract.js';

type Person = { id: string; contextId: string };
export interface HostProfile { schemaVersion: 1; coordinator: Person; implementer: Person; instruction: { source: FileBinding; quote: string; reference: string; issuedAt: string; execution: 'plan-only' | 'reversible' }; provenance: { text: string; reference: string } }
type Kind = 'judgment' | 'evidence' | 'grant' | 'resource' | 'checkpoint';
export interface HostCapture { kind: Kind; value: unknown; origin: Person & { reference: string; observedAt: string }; artifact: FileBinding }
type Receipt = { schemaVersion: 1; configFingerprint: string; kind: Kind | 'authorization'; id: string; value: unknown; binding: unknown; capture?: HostCapture };
const equal = (a: unknown, b: unknown) => stable(a) === stable(b);
const fail = (s: string): never => { throw new Error(s); };
const obj = (v: unknown): v is Record<string, any> => !!v && typeof v === 'object' && !Array.isArray(v);
const exact = (v: unknown, keys: string[]): v is Record<string, any> => obj(v) && equal(Object.keys(v).sort(), [...keys].sort());
const nonempty = (v: unknown): v is string => typeof v === 'string' && !!v.trim();
const person = (v: unknown) => exact(v,['id','contextId']) && nonempty(v.id) && nonempty(v.contextId);
const fileBinding = (v: unknown) => exact(v,['path','sha256']) && nonempty(v.path) && !path.isAbsolute(v.path) && /^[a-f0-9]{64}$/.test(v.sha256);
const validTime = (v: unknown) => nonempty(v) && Number.isFinite(Date.parse(v)) && Date.parse(v) <= Date.now();
function noLinks(file: string): string {
  if (!path.isAbsolute(file)) fail('Expected an absolute path');
  const resolved = path.resolve(file); let cursor = path.parse(resolved).root;
  for (const part of resolved.slice(cursor.length).split(path.sep).filter(Boolean)) { cursor = path.join(cursor, part); try { if (fs.lstatSync(cursor).isSymbolicLink()) fail(`Symlink not allowed: ${cursor}`); } catch (e) { if ((e as NodeJS.ErrnoException).code !== 'ENOENT') throw e; } }
  return resolved;
}
function inside(root: string, file: string): boolean { const rel = path.relative(root,file); return rel === '' || (rel !== '..' && !rel.startsWith(`..${path.sep}`) && !path.isAbsolute(rel)); }
function confined(root: string, rel: string): string { if (!nonempty(rel) || path.isAbsolute(rel)) fail('Expected a relative host path'); const f = noLinks(path.resolve(root,rel)); if (!inside(root,f) || f === root) fail('Path escapes host directory'); return f; }
function validateProfile(v: unknown): asserts v is HostProfile {
  if (!exact(v,['schemaVersion','coordinator','implementer','instruction','provenance']) || v.schemaVersion !== 1 || !person(v.coordinator) || !person(v.implementer) || !exact(v.instruction,['source','quote','reference','issuedAt','execution']) || !fileBinding(v.instruction.source) || !nonempty(v.instruction.quote) || !nonempty(v.instruction.reference) || !validTime(v.instruction.issuedAt) || !['plan-only','reversible'].includes(v.instruction.execution) || !exact(v.provenance,['text','reference']) || !nonempty(v.provenance.text) || !nonempty(v.provenance.reference)) fail('Invalid host profile');
}
function validateCapture(v: unknown): asserts v is HostCapture {
  if (!exact(v,['kind','value','origin','artifact']) || !['judgment','evidence','grant','resource','checkpoint'].includes(v.kind) || !obj(v.value) || !exact(v.origin,['id','contextId','reference','observedAt']) || ![v.origin.id,v.origin.contextId,v.origin.reference].every(nonempty) || !validTime(v.origin.observedAt) || !fileBinding(v.artifact)) fail('Invalid capture');
}
function writeExclusive(file: string, data: string): void { try { fs.writeFileSync(file,data,{flag:'wx',mode:0o600}); } catch (e) { if ((e as NodeJS.ErrnoException).code !== 'EEXIST' || fs.readFileSync(file,'utf8') !== data) throw e; } }
function raw(root: string, binding: FileBinding): Buffer { const f=confined(root,binding.path); if (!fs.statSync(f).isFile()) fail('Capture artifact must be a regular file'); const bytes=fs.readFileSync(f); if (!bytes.length || sha256(bytes)!==binding.sha256) fail('Capture artifact is missing, empty or changed'); return bytes; }
function runtimeSource(): string { return noLinks(fs.existsSync(path.join(import.meta.dirname,'host.js')) ? import.meta.dirname : path.resolve(import.meta.dirname,'../dist')); }
function runtimeFiles(directory: string, onlyJs: boolean): Record<string, Buffer> {
  const files: Record<string, Buffer>={};
  const walk=(base: string, relative='') => {
    for (const name of fs.readdirSync(base).sort()) {
      const rel=relative ? `${relative}/${name}` : name, file=noLinks(path.join(base,name)), stat=fs.lstatSync(file);
      if (stat.isDirectory()) walk(file,rel);
      else if (stat.isFile() && (!onlyJs || name.endsWith('.js'))) files[rel]=fs.readFileSync(file);
      else if (!stat.isFile()) fail('Invalid runtime entry');
    }
  };
  walk(noLinks(directory)); return files;
}
function config(directory: string, expected?: string): { directory: string; projectRoot: string; profile: HostProfile; fingerprint: string; runtimeFingerprint: string } {
  const dir=noLinks(directory), bytes=fs.readFileSync(confined(dir,'config.json'));
  const fingerprint=sha256(bytes), pin=fs.readFileSync(confined(dir,'config.sha256'),'utf8');
  if (pin !== `${fingerprint}\n` || (expected !== undefined && fingerprint !== expected)) fail('Host configuration changed');
  const c=JSON.parse(bytes.toString('utf8')) as Record<string, any>;
  if (!exact(c,['schemaVersion','projectRoot','profile','runtimeFingerprint']) || c.schemaVersion!==1 || !nonempty(c.projectRoot) || typeof c.runtimeFingerprint!=='string' || !/^[a-f0-9]{64}$/.test(c.runtimeFingerprint)) fail('Invalid host configuration');
  validateProfile(c.profile); const projectRoot=noLinks(c.projectRoot);
  if (inside(projectRoot,dir) || inside(dir,projectRoot)) fail('Host and project directories must be separate');
  return {directory:dir,projectRoot,profile:c.profile,fingerprint,runtimeFingerprint:c.runtimeFingerprint};
}
function assertWriter(directory: string): void {
  const c=config(directory), manifestBytes=fs.readFileSync(confined(c.directory,'runtime-manifest.json'));
  if (sha256(manifestBytes)!==c.runtimeFingerprint) fail('Host runtime manifest changed');
  const manifest=JSON.parse(manifestBytes.toString('utf8'));
  if (!exact(manifest,['schemaVersion','files']) || manifest.schemaVersion!==1 || !obj(manifest.files)) fail('Invalid host runtime manifest');
  const hashes=(files: Record<string, Buffer>)=>Object.fromEntries(Object.entries(files).map(([key,value])=>[key,sha256(value)]));
  if (!equal(hashes(runtimeFiles(confined(c.directory,'runtime'),false)),manifest.files)) fail('Host runtime integrity check failed');
  const expected=Object.fromEntries(Object.entries(manifest.files).filter(([key])=>key.endsWith('.js')));
  if (!equal(hashes(runtimeFiles(runtimeSource(),true)),expected)) fail(`Writer runtime differs from host snapshot; use node ${path.join(c.directory,'runtime','host-cli.js')}`);
}
export function initHost(directory: string, projectRoot: string, profilePath: string): { directory: string; adapter: string; captureDirectory: string; cli: string } {
  const dir=noLinks(directory), root=noLinks(projectRoot), profileFile=noLinks(profilePath), source=runtimeSource();
  if (inside(root,dir) || inside(dir,root)) fail('Host and project directories must be separate');
  if (inside(source,dir)) fail('Host directory cannot be inside the runtime being retained');
  if (inside(root,profileFile)) fail('Coordinator profile must be outside the producer project');
  if (!fs.statSync(root).isDirectory()) fail('Project root must be a directory');
  const profile=readJson(profileFile); validateProfile(profile); readBinding(root,profile.instruction.source);
  const sources=runtimeFiles(source,true);
  if (!sources['host.js'] || !sources['host-cli.js'] || !sources['store.js'] || !sources['workflow/evidence.js']) fail('Built runtime is missing; build the package first');
  const packageBytes=Buffer.from('{"type":"module"}\n');
  const files=Object.fromEntries(Object.entries({...sources,'package.json':packageBytes}).map(([key,data])=>[key,sha256(data)]));
  const manifest=`${JSON.stringify({schemaVersion:1,files},null,2)}\n`;
  const configBytes=`${JSON.stringify({schemaVersion:1,projectRoot:root,profile,runtimeFingerprint:sha256(manifest)},null,2)}\n`, fingerprint=sha256(configBytes);
  fs.mkdirSync(dir,{recursive:true,mode:0o700}); noLinks(dir); fs.mkdirSync(confined(dir,'receipts'),{recursive:true,mode:0o700}); fs.mkdirSync(confined(dir,'captures'),{recursive:true,mode:0o700});
  writeExclusive(confined(dir,'config.json'),configBytes); writeExclusive(confined(dir,'config.sha256'),`${fingerprint}\n`);
  const runtimeDir=confined(dir,'runtime'); fs.mkdirSync(runtimeDir,{recursive:true,mode:0o700});
  for (const [rel,data] of Object.entries({...sources,'package.json':packageBytes})) { const dest=confined(runtimeDir,rel); fs.mkdirSync(path.dirname(dest),{recursive:true,mode:0o700}); writeExclusive(dest,data.toString('utf8')); }
  writeExclusive(confined(dir,'runtime-manifest.json'),manifest);
  const adapter=`import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { pathToFileURL } from 'node:url';
const dir=${JSON.stringify(dir)}, runtime=path.join(dir,'runtime');
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const reject=()=>{ throw new Error('Host runtime integrity check failed'); };
const manifestPath=path.join(dir,'runtime-manifest.json');
if (fs.lstatSync(manifestPath).isSymbolicLink()) reject();
const bytes=fs.readFileSync(manifestPath); if (hash(bytes)!==${JSON.stringify(sha256(manifest))}) reject();
const manifest=JSON.parse(bytes), seen=[];
const walk=(base,rel='')=>{ if (fs.lstatSync(base).isSymbolicLink()) reject(); for (const name of fs.readdirSync(base)) { const child=path.join(base,name), key=rel ? rel+'/'+name : name, stat=fs.lstatSync(child); if (stat.isSymbolicLink()) reject(); if (stat.isDirectory()) walk(child,key); else if (stat.isFile()) { if (!(key in manifest.files) || hash(fs.readFileSync(child))!==manifest.files[key]) reject(); seen.push(key); } else reject(); } };
walk(runtime); if (seen.length!==Object.keys(manifest.files).length) reject();
const { createHost }=await import(pathToFileURL(path.join(runtime,'host.js')).href);
export const trustedHost = createHost(dir, ${JSON.stringify(fingerprint)});
`;
  writeExclusive(confined(dir,'adapter.mjs'),adapter);
  assertWriter(dir);
  return {directory:dir,adapter:confined(dir,'adapter.mjs'),captureDirectory:confined(dir,'captures'),cli:confined(runtimeDir,'host-cli.js')};
}
function receiptName(r: Receipt): string {
  if (!obj(r.binding) || !nonempty(r.binding.runId)) fail('Invalid receipt binding');
  const binding=r.binding as Record<string, unknown>;
  const versioned=r.kind==='grant' || r.kind==='resource';
  if (versioned && (typeof binding.fingerprint!=='string' || !/^[a-f0-9]{64}$/.test(binding.fingerprint))) fail('Invalid versioned receipt binding');
  return `${sha256(stable({kind:r.kind,runId:binding.runId,id:r.id,...(versioned ? {fingerprint:binding.fingerprint} : {})}))}.json`;
}
function receipts(dir: string, fingerprint: string): Receipt[] {
  const folder=confined(dir,'receipts'); return fs.readdirSync(folder).sort().map(name=>{
    if (!/^[a-f0-9]{64}\.json$/.test(name)) fail('Invalid receipt registry entry');
    const envelope=readJson(confined(folder,name)) as Record<string, any>;
    if (!exact(envelope,['receipt','sha256']) || !obj(envelope.receipt) || !nonempty(envelope.sha256) || sha256(stable(envelope.receipt))!==envelope.sha256) fail('Receipt registry tampered');
    const r=envelope.receipt as Receipt;
    if (!exact(r,r.capture ? ['schemaVersion','configFingerprint','kind','id','value','binding','capture'] : ['schemaVersion','configFingerprint','kind','id','value','binding']) || r.schemaVersion!==1 || r.configFingerprint!==fingerprint || !nonempty(r.id) || !['authorization','judgment','evidence','grant','resource','checkpoint'].includes(r.kind) || !obj(r.value) || !obj(r.binding) || (r.kind==='authorization') === !!r.capture || receiptName(r)!==name) fail('Invalid receipt registry');
    if (r.capture) { validateCapture(r.capture); if (r.kind!==r.capture.kind || !equal(r.value,r.capture.value)) fail('Invalid receipt capture'); raw(dir,r.capture.artifact); }
    return r;
  });
}
function put(dir: string, input: Omit<Receipt,'configFingerprint'>): string {
  const fingerprint=config(dir).fingerprint; receipts(dir,fingerprint);
  const receipt: Receipt={...input,configFingerprint:fingerprint};
  const bytes=`${JSON.stringify({receipt,sha256:sha256(stable(receipt))},null,2)}\n`;
  const file=confined(dir,`receipts/${receiptName(receipt)}`);
  // Publish a fully written inode atomically to a single identity-key path. A competing
  // writer can never replace it; an interrupted writer leaves no stale lock.
  const temp=confined(dir,`.receipt-${crypto.randomUUID()}.tmp`);
  try {
    fs.writeFileSync(temp,bytes,{flag:'wx',mode:0o600});
    try { fs.linkSync(temp,file); }
    catch (error) {
      if ((error as NodeJS.ErrnoException).code!=='EEXIST') throw error;
      if (fs.readFileSync(file,'utf8')!==bytes) fail('Conflicting receipt ID');
    }
  } finally { if (fs.existsSync(temp)) fs.unlinkSync(temp); }
  return file;
}
function assertRun(root: string, name: string): RunContract { if (path.isAbsolute(name)) fail('Run path must be project relative'); return loadRun(root,name); }
export function authorizeHost(directory: string, runPath: string): string {
  assertWriter(directory);
  const {directory:dir,projectRoot,profile}=config(directory), run=assertRun(projectRoot,runPath), p=run.policy, i=p.instruction, source=run.sources.find(s=>s.id===i.sourceId);
  if (!source || source.authority!=='user' || !equal(source.binding,profile.instruction.source) || i.quote!==profile.instruction.quote || i.reference!==profile.instruction.reference || i.issuedAt!==profile.instruction.issuedAt || p.implementerId!==profile.implementer.id || p.implementerContextId!==profile.implementer.contextId || p.execution!==profile.instruction.execution || !readBinding(projectRoot,source.binding).toString('utf8').includes(i.quote)) fail('Run instruction, producer or execution does not match actual host profile');
  return put(dir,{schemaVersion:1,kind:'authorization',id:authorizationBinding(run).fingerprint,value:i,binding:authorizationBinding(run)});
}
export function createHost(directory: string, expectedFingerprint?: string): TrustedHost {
  const dir=noLinks(directory); const fingerprint=config(dir,expectedFingerprint).fingerprint;
  const verify=(kind: Receipt['kind'], value: unknown, binding: unknown) => { config(dir,fingerprint); return receipts(dir,fingerprint).some(r=>r.kind===kind && equal(r.value,value) && equal(r.binding,binding)); };
  return { verifyAuthorization:(v,b)=>verify('authorization',v,b), verifyEvidence:(v,b)=>verify('evidence',v,b), verifyJudgment:(v,b)=>verify('judgment',v,b), verifyGrant:(v,b)=>verify('grant',v,b), verifyResource:(v,b)=>verify('resource',v,b), verifyCheckpoint:(v,b)=>verify('checkpoint',v,b) };
}
export function registerHost(directory: string, runPath: string, capturePath: string): string {
  assertWriter(directory);
  const {directory:dir,projectRoot,profile}=config(directory), run=assertRun(projectRoot,runPath), absolute=noLinks(capturePath); if (!inside(dir,absolute) || absolute===dir) fail('Capture must be inside host directory');
  if (run.policy.implementerId!==profile.implementer.id || run.policy.implementerContextId!==profile.implementer.contextId) fail('Run producer does not match host profile');
  const capture=readJson(absolute); validateCapture(capture); const bytes=raw(dir,capture.artifact); const value=capture.value as any;
  if (capture.kind==='judgment') { let envelope: unknown; try { envelope=JSON.parse(bytes.toString('utf8')); } catch { fail('Judgment raw artifact must be a reviewer envelope'); } if (!exact(envelope,['kind','value']) || envelope.kind!=='judgment' || !equal(envelope.value,value)) fail('Judgment raw artifact differs from reviewer envelope'); }
  let binding: unknown; let id: string;
  if (capture.kind==='judgment' || capture.kind==='evidence') {
    const next=structuredClone(run); const records = capture.kind==='judgment' ? next.judgments : next.evidence; const prior=records.find(record=>record.id===value.id); if (prior && !equal(prior,value)) fail('Conflicting record ID'); if (!prior) records.push(value); parseRun(next);
    const actor=capture.kind==='judgment' ? (value as Judgment).reviewer : (value as Evidence).observer;
    const reference=capture.kind==='judgment' ? value.reference : value.observer.reference;
    if (capture.origin.id!==actor.id || capture.origin.contextId!==actor.contextId || capture.origin.reference!==reference || capture.origin.observedAt!==value.observedAt) fail('Capture origin does not match actual reviewer or observer');
    if (capture.kind==='judgment') { const j=value as Judgment; const problem=requestProblem(run,j); if (problem) fail(problem); if (j.reviewer.role==='independent' && (actor.id===profile.implementer.id || actor.contextId===profile.implementer.contextId)) fail('Independent reviewer must be distinct from implementer'); binding=reviewBinding(run,j); if (j.result==='approved' && planReview(run,j,{projectRoot,host:createHost(dir)}).prerequisites.status!=='pass') fail('Review prerequisites have not passed'); }
    else { const e=value as Evidence; binding=evidenceBinding(run,e.criterionId); if (e.targetId!==(binding as any).targetId || sha256(bytes)!==e.artifact.sha256) fail('Evidence capture differs from target or actual artifact'); readBinding(projectRoot,e.artifact); }
    if (value.fingerprint!==(binding as any).fingerprint) fail('Stale fingerprint'); id=value.id;
  } else {
    if (capture.origin.id!==profile.coordinator.id || capture.origin.contextId!==profile.coordinator.contextId) fail('Capture origin must match coordinator');
    if (capture.kind==='grant') { const v=value as AuthorityGrant; if (!run.policy.grants.some(x=>equal(x,v)) || capture.origin.reference!==v.reference) fail('Grant capture does not match run'); binding=grantBinding(run,v.id); id=v.id; }
    else if (capture.kind==='resource') { const v=value as Resource; if (!run.resources.some(x=>equal(x,v)) || !v.reference || capture.origin.reference!==v.reference) fail('Resource capture does not match run'); binding=resourceBinding(run,v.id); id=v.id; }
    else { const v=value as CheckpointAcknowledgment; if (!equal(run.policy.checkpointAcknowledgment,v) || capture.origin.reference!==v.instruction.reference) fail('Checkpoint capture does not match run'); binding=checkpointBinding(run); if (v.proofFingerprint!==(binding as any).proofFingerprint) fail('Stale checkpoint'); id=v.proofFingerprint; }
  }
  return put(dir,{schemaVersion:1,kind:capture.kind,id,value,binding,capture});
}
