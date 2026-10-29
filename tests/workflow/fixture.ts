import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { spawnSync } from 'node:child_process';
import type { Evidence, EvidenceKind, Judgment, ReviewPurpose, Role, RunContract, TrustedHost } from '../../src/workflow/contract.js';
import { authorizationBinding, canonical, checkpointBinding, evidenceBinding, proofFingerprint, reviewBinding, sha256 } from '../../src/workflow/evidence.js';

/** Public tiny real CLI fixture: success and reachable invalid-input recovery. */
export function createFixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(),'canonical-workflow-'));
  const file = (name: string, content: string | Buffer) => { fs.mkdirSync(path.dirname(path.join(root,name)),{ recursive:true }); fs.writeFileSync(path.join(root,name),content); return { path:name,sha256:sha256(content) }; };
  const instruction = 'Plan and implement the greeting CLI, verify a useful response and invalid-input recovery. Continue autonomously within this local scope.';
  const source = file('USER-REQUEST.md',instruction);
  const app = file('app.mjs',"const input = process.argv[2];\nif (!input?.trim()) { console.error('Provide a name. Try: node app.mjs Ada'); process.exit(2); }\nconsole.log(JSON.stringify({greeting:`Hello ${input}`}));\n");
  const now = new Date().toISOString();
  const run: RunContract = {
    schemaVersion:3,kind:'canonical-workflow',runId:'greeting',revision:1,projectRoot:'.',
    sources:[{ id:'request',binding:source,authority:'user',inspection:'complete' }],
    requirements:[{ id:'R-GREETING',description:'A real consumer gets a greeting and a useful correction for invalid input.',sourceRefs:[{ sourceId:'request',locator:'Full instruction' }],criterionIds:['C-OK','C-RECOVER'],releaseIds:['R1'],mandatory:true }],
    targets:[{ id:'cli',kind:'cli',identity:{ executable:'app.mjs',runtime:'node' },environment:'local',providerMode:'real',revision:'candidate-1',bindings:[app],lifecycle:{ stage:'pre-launch',dataPolicy:'disposable',sourceRef:{ sourceId:'request',locator:'Local CLI scope' } } }],
    criteria:[
      { id:'C-OK',description:'The consumer receives Hello Ada from the actual executable and it builds.',scenario:'success',targetId:'cli',evidenceKinds:['consumer','build'],inputs:[app],productionRequired:false },
      { id:'C-RECOVER',description:'Missing input yields a concrete correction and the corrected invocation succeeds.',scenario:'recovery',targetId:'cli',evidenceKinds:['consumer'],inputs:[app],productionRequired:false },
    ],
    outcomes:[{ id:'O-GREETING',title:'Consumer greeting with invalid-input recovery',requirementIds:['R-GREETING'],criterionIds:['C-OK','C-RECOVER'],targetId:'cli',inputs:[] }],
    work:[{ id:'W-CLI',title:'Build the complete greeting CLI',outcomeIds:['O-GREETING'],criterionIds:['C-OK','C-RECOVER'],targetIds:['cli'],action:'local-write',inputs:[],files:['app.mjs'],instructions:'Implement the greeting command; invoke success, invalid input, corrected retry, and the real Node syntax build.',estimate:{ hours:[1,2],role:'engineer',ownerDelayHours:[0,0],ownerTouchpoints:0 } }],
    resources:[],decisions:[],releases:[{ id:'R1',title:'Greeting executable release',outcomeIds:['O-GREETING'],sharedCriterionIds:[],sourceRefs:[{ sourceId:'request',locator:'Complete CLI scope' }],inputs:[] }],
    policy:{ instruction:{ sourceId:'request',locator:'Full instruction',quote:instruction,reference:'host://instruction/1',issuedAt:now },execution:'reversible',checkpoints:'autonomous',implementerId:'producer',implementerContextId:'producer-context',reviews:{ scope:['independent'],semantic:['independent'],design:['independent'],release:['independent'] },grants:[],budget:{ maxActiveWork:2,maxDetailBytes:6000 } },
    proofOutcomeIds:['O-GREETING'],activeWorkIds:['W-CLI'],evidence:[],judgments:[],
  };
  const evidenceReceipts = new Map<string,string>(); const judgmentReceipts = new Map<string,string>(); const checkpointReceipts = new Map<string,string>();
  let authorized = canonical({ instruction:run.policy.instruction,binding:authorizationBinding(run) });
  const host: TrustedHost = {
    verifyAuthorization:(i,b) => canonical({ instruction:i,binding:b }) === authorized,
    verifyEvidence:(e,b) => evidenceReceipts.get(e.observer.reference) === canonical({ evidence:e,binding:b }),
    verifyJudgment:(j,b) => judgmentReceipts.get(j.reference) === canonical({ judgment:j,binding:b }),
    verifyResource:(r) => r.reference === 'host://resource/actual',
    verifyGrant:(g) => g.reference === 'host://grant/actual',
    verifyCheckpoint:(ack,binding) => checkpointReceipts.get(ack.instruction.reference) === canonical({ acknowledgment:ack,binding }),
  };
  let serial = 0;
  const observe = (criterionId: string,kind: EvidenceKind = 'consumer',overrides: Partial<Evidence> = {}): Evidence => {
    const recovery = criterionId.includes('RECOVER');
    const args = kind === 'build' ? ['--check','app.mjs'] : recovery ? ['app.mjs'] : ['app.mjs','Ada'];
    const result = spawnSync(process.execPath,args,{ cwd:root,encoding:'utf8' });
    const retry = recovery ? spawnSync(process.execPath,['app.mjs','Ada'],{ cwd:root,encoding:'utf8' }) : undefined;
    const correct = kind === 'build' ? result.status === 0 : recovery ? result.status === 2 && result.stderr.includes('Provide a name') && retry?.status === 0 && retry.stdout.includes('Hello Ada') : result.status === 0 && result.stdout.includes('Hello Ada');
    const id = `E${++serial}`; const artifact = file(`evidence/${id}.json`,JSON.stringify({ args,exitCode:result.status,stdout:result.stdout,stderr:result.stderr,retry:retry ? { exitCode:retry.status,stdout:retry.stdout,stderr:retry.stderr } : undefined }));
    const binding = evidenceBinding(run,criterionId);
    const evidence: Evidence = { id,criterionId,targetId:binding.targetId,kind,fingerprint:binding.fingerprint,artifact,command:`node ${args.join(' ')}`,observedAt:new Date().toISOString(),result:correct ? 'pass':'fail',observer:{ id:'fixture-observer',contextId:'observer-context',reference:`host://observation/${id}` },production:true,...(kind === 'consumer' ? { consumer:'Independent Node process invocation' } : {}),...overrides };
    run.evidence.push(evidence); evidenceReceipts.set(evidence.observer.reference,canonical({ evidence,binding })); return evidence;
  };
  const authenticateEvidence = (e: Evidence) => evidenceReceipts.set(e.observer.reference,canonical({ evidence:e,binding:evidenceBinding(run,e.criterionId) }));
  const judge = (purpose: ReviewPurpose,subjectIds: string[],result: Judgment['result'] = 'approved',role: Role = 'independent',overrides: Partial<Judgment> = {}): Judgment => {
    const id = `J${++serial}`; const binding = reviewBinding(run,{ purpose,subjectIds });
    const judgment: Judgment = { id,purpose,subjectIds,fingerprint:binding.fingerprint,result,reviewer:{ id:role === 'owner' ? 'owner':'reviewer',contextId:'reviewer-context',role },reference:`host://review/${id}`,observedAt:new Date().toISOString(),observations:['Fixture reviewer inspected the declared source/behavior and contrary case.'],findings:[],...overrides };
    run.judgments.push(judgment); judgmentReceipts.set(judgment.reference,canonical({ judgment,binding })); return judgment;
  };
  const context = { projectRoot:root,host };
  const authorize = () => { authorized = canonical({ instruction:run.policy.instruction,binding:authorizationBinding(run) }); };
  const acknowledge = () => {
    const quote = 'Continue after the demonstrated greeting proof; retain the reserved checkpoint policy for changed proof.';
    run.policy.checkpointAcknowledgment = { proofFingerprint:proofFingerprint(run),instruction:{ source:file('CONTINUE.md',quote),locator:'Actual continuation instruction',quote,reference:`host://checkpoint/${++serial}`,issuedAt:new Date().toISOString() } };
    const acknowledgment = run.policy.checkpointAcknowledgment; checkpointReceipts.set(acknowledgment.instruction.reference,canonical({ acknowledgment,binding:checkpointBinding(run) }));
    return acknowledgment;
  };
  return { root,run,host,context,file,observe,authenticateEvidence,judge,authorize,acknowledge,cleanup:() => fs.rmSync(root,{ recursive:true,force:true }) };
}
