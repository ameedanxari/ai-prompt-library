/** Independent adversarial harness. All host receipts here are SIMULATED, not real review. */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import type { AuthorityGrant, Evidence, EvidenceKind, Judgment, Resource, ReviewPurpose, Role, RunContract, TrustedHost } from '../../src/workflow/contract.js';
import { authorizationBinding, canonical, checkpointBinding, evidenceBinding, grantBinding, proofFingerprint, resourceBinding, reviewBinding, sha256 } from '../../src/workflow/evidence.js';

export function independentHarness() {
  const root=fs.mkdtempSync(path.join(os.tmpdir(),'independent-project-'));
  const hostRoot=fs.mkdtempSync(path.join(os.tmpdir(),'independent-simulated-host-'));
  const file=(name:string,body:string|Buffer)=>{const p=path.join(root,name);fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,body);return {path:name,sha256:sha256(body)};};
  const quote='Build a local line classifier; classify valid input and reject invalid JSON without changing the retained input. Continue ordinary local work autonomously; never change a remote service.';
  const source=file('OWNER.txt',quote+'\nOriginal obligation: preserve each record ID exactly, including non-ASCII characters.\n');
  const app=file('product.mjs',`import fs from 'node:fs';\nconst raw=fs.readFileSync(0,'utf8');\ntry{const row=JSON.parse(raw);if(typeof row.id!=='string')throw Error('id required');process.stdout.write(JSON.stringify({id:row.id,category:'received'})+'\\n');}catch(e){console.error('Invalid record: '+e.message);process.exitCode=3;}\n`);
  const now=new Date(Date.now()-5000).toISOString();
  const ref={sourceId:'OWNER',locator:'Full original instruction and retained-input clause'};
  const run:RunContract={schemaVersion:3,kind:'canonical-workflow',runId:'independent-line-classifier',revision:1,projectRoot:'.',sources:[{id:'OWNER',binding:source,authority:'user',inspection:'complete'}],
    requirements:[{id:'Q-CLASSIFY',description:'Classify one JSON record and preserve original input and ID.',sourceRefs:[ref],criterionIds:['K-SUCCESS','K-RECOVERY'],releaseIds:['R1'],mandatory:true}],
    targets:[{id:'local-cli',kind:'cli',identity:{entry:'node product.mjs'},environment:'local',providerMode:'real',revision:'candidate-a',bindings:[app],lifecycle:{stage:'pre-launch',dataPolicy:'disposable',sourceRef:ref}}],
    criteria:[{id:'K-SUCCESS',description:'External stdin consumer receives original ID and received category; syntax build succeeds.',scenario:'success',targetId:'local-cli',evidenceKinds:['consumer','build'],inputs:[],productionRequired:false},{id:'K-RECOVERY',description:'Malformed JSON exits 3; corrected invocation succeeds; source input unchanged.',scenario:'recovery',targetId:'local-cli',evidenceKinds:['consumer'],inputs:[],productionRequired:false}],
    outcomes:[{id:'O-CLASSIFY',title:'Local JSON line classification and reachable invalid-input recovery',requirementIds:['Q-CLASSIFY'],criterionIds:['K-SUCCESS','K-RECOVERY'],targetId:'local-cli',inputs:[]}],
    work:[{id:'W-CLASSIFY',title:'Implement local classifier',outcomeIds:['O-CLASSIFY'],criterionIds:['K-SUCCESS','K-RECOVERY'],targetIds:['local-cli'],action:'local-write',inputs:[],files:['product.mjs'],instructions:'Implement classification, preserve IDs and inputs, and demonstrate invalid-JSON correction.'}],
    resources:[],decisions:[],releases:[{id:'R1',title:'Local CLI package',outcomeIds:['O-CLASSIFY'],sharedCriterionIds:[],sourceRefs:[ref],inputs:[]}],
    policy:{instruction:{sourceId:'OWNER',locator:'Original instruction',quote,reference:'simulation://instruction',issuedAt:now},execution:'reversible',checkpoints:'autonomous',implementerId:'fixture-producer',implementerContextId:'fixture-producer-context',reviews:{scope:['independent'],semantic:['independent'],design:['independent'],release:['independent']},grants:[],budget:{maxActiveWork:3,maxDetailBytes:5000}},proofOutcomeIds:['O-CLASSIFY'],activeWorkIds:['W-CLASSIFY'],evidence:[],judgments:[]};
  const registry:Record<string,string>={};let serial=0;
  const save=()=>fs.writeFileSync(path.join(hostRoot,'registry.json'),JSON.stringify(registry));
  const remember=(key:string,value:unknown)=>{registry[key]=canonical(value);save();};
  const host:TrustedHost={
    verifyAuthorization:(instruction,binding)=>registry[instruction.reference]===canonical({instruction,binding}),
    verifyGrant:(grant,binding)=>registry[grant.reference]===canonical({grant,binding}),
    verifyResource:(resource,binding)=>registry[resource.reference??'']===canonical({resource,binding}),
    verifyCheckpoint:(acknowledgment,binding)=>registry[acknowledgment.instruction.reference]===canonical({acknowledgment,binding}),
    verifyEvidence:(evidence,binding)=>registry[evidence.observer.reference]===canonical({evidence,binding}),
    verifyJudgment:(judgment,binding)=>registry[judgment.reference]===canonical({judgment,binding})};
  const trustAuth=()=>remember(run.policy.instruction.reference,{instruction:structuredClone(run.policy.instruction),binding:authorizationBinding(run)});
  const trustGrant=(grant:AuthorityGrant)=>remember(grant.reference,{grant:structuredClone(grant),binding:grantBinding(run,grant.id)});
  const trustResource=(resource:Resource)=>remember(resource.reference!,{resource:structuredClone(resource),binding:resourceBinding(run,resource.id)});
  const judge=(purpose:ReviewPurpose,subjectIds:string[],result:Judgment['result']='approved',role:Role='independent',overrides:Partial<Judgment>={})=>{
    const id=`J-${++serial}`;const binding=reviewBinding(run,{purpose,subjectIds});
    const j:Judgment={id,purpose,subjectIds,fingerprint:binding.fingerprint,result,reviewer:{id:role==='owner'?'fixture-owner':'fixture-assessor',contextId:'distinct-simulated-review-context',role},reference:`simulation://review/${id}`,observedAt:new Date().toISOString(),observations:['SIMULATED protocol receipt; this is not an actual independent semantic approval.'],findings:[],...overrides};
    run.judgments.push(j);remember(j.reference,{judgment:structuredClone(j),binding});return j;
  };
  const acknowledge=(quote='Continue after inspecting the exact accepted proof')=>{
    run.policy.checkpointAcknowledgment={proofFingerprint:proofFingerprint(run),instruction:{source:file(`instructions/continue-${++serial}.txt`,quote+'\n'),locator:'Actual simulated checkpoint instruction',quote,reference:`simulation://checkpoint/${serial}`,issuedAt:new Date().toISOString()}};
    const acknowledgment=run.policy.checkpointAcknowledgment;remember(acknowledgment.instruction.reference,{acknowledgment:structuredClone(acknowledgment),binding:checkpointBinding(run)});return acknowledgment;
  };
  const record=(criterionId:string,kind:EvidenceKind,raw:string,overrides:Partial<Evidence>={})=>{
    const id=`E-${++serial}`;const binding=evidenceBinding(run,criterionId);
    const e:Evidence={id,criterionId,targetId:binding.targetId,kind,fingerprint:binding.fingerprint,artifact:file(`observed/${id}.json`,raw),command:'node product.mjs < retained-input.json',observedAt:new Date().toISOString(),result:'pass',observer:{id:'test-process-observer',contextId:'independent-harness-process',reference:`simulation://observation/${id}`},production:true,...(kind==='consumer'?{consumer:'External Node stdin/stdout process'}:{}),...overrides};
    run.evidence.push(e);remember(e.observer.reference,{evidence:structuredClone(e),binding});return e;
  };
  const observe=()=>{
    const invoke=(input:string)=>spawnSync(process.execPath,['product.mjs'],{cwd:root,input,encoding:'utf8'});
    const success=invoke('{"id":"café-α"}');const bad=invoke('{');const retry=invoke('{"id":"corrected"}');const build=spawnSync(process.execPath,['--check','product.mjs'],{cwd:root,encoding:'utf8'});
    if(success.status!==0||JSON.parse(success.stdout).id!=='café-α'||bad.status!==3||retry.status!==0||build.status!==0)throw Error('Independent real consumer positive control failed');
    record('K-SUCCESS','consumer',JSON.stringify({input:'{"id":"café-α"}',stdout:success.stdout,status:success.status}));
    record('K-SUCCESS','build',JSON.stringify({command:'node --check product.mjs',status:build.status,stderr:build.stderr}));
    record('K-RECOVERY','consumer',JSON.stringify({bad:{status:bad.status,stderr:bad.stderr},retry:{status:retry.status,stdout:retry.stdout}}));
  };
  const approve=()=>{judge('scope',run.requirements.map(q=>q.id));run.criteria.forEach(c=>judge('semantic',[c.id]));};
  fs.writeFileSync(path.join(hostRoot,'adapter.mjs'),`// SIMULATED TEST HOST. No real user/reviewer authentication is established.\nimport fs from 'node:fs';\nconst canonical=${canonical.toString()};\nconst registry=()=>JSON.parse(fs.readFileSync(new URL('./registry.json',import.meta.url),'utf8'));\nexport const trustedHost={verifyAuthorization:(instruction,binding)=>registry()[instruction.reference]===canonical({instruction,binding}),verifyGrant:(grant,binding)=>registry()[grant.reference]===canonical({grant,binding}),verifyResource:(resource,binding)=>registry()[resource.reference]===canonical({resource,binding}),verifyEvidence:(evidence,binding)=>registry()[evidence.observer.reference]===canonical({evidence,binding}),verifyJudgment:(judgment,binding)=>registry()[judgment.reference]===canonical({judgment,binding})};\n`);
  trustAuth();
  return {root,hostRoot,run,ref,file,host,context:{projectRoot:root,host},trustAuth,trustGrant,trustResource,acknowledge,judge,record,observe,approve,adapter:path.join(hostRoot,'adapter.mjs'),cleanup:()=>{fs.rmSync(root,{recursive:true,force:true});fs.rmSync(hostRoot,{recursive:true,force:true});}};
}
