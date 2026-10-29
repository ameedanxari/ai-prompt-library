import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { afterEach, describe, expect, it } from 'vitest';
import { createFixture } from './fixture.js';
import { parseRun } from '../../src/workflow/schema.js';
import { evaluateBoundary, evaluateRun } from '../../src/workflow/evaluate.js';
import { planReview } from '../../src/workflow/review.js';
import { evidenceBinding, reviewBinding, scopeFingerprint, validateEvidence } from '../../src/workflow/evidence.js';
import { validateGraph } from '../../src/workflow/graph.js';

const fixtures: ReturnType<typeof createFixture>[] = [];
const fixture = () => { const f = createFixture(); fixtures.push(f); return f; };
afterEach(() => { fixtures.splice(0).forEach(f => f.cleanup()); });
function complete(f: ReturnType<typeof createFixture>) { f.judge('scope',['R-GREETING']); f.observe('C-OK'); f.observe('C-OK','build'); f.observe('C-RECOVER'); f.judge('semantic',['C-OK','C-RECOVER']); }
const codes = (value: { checks: { code: string }[] }) => value.checks.map(c => c.code);

describe('canonical runtime and actual consumer proof', () => {
  it('keeps structural, reviewed, executable, verified, accepted and release states separate', () => {
    const f = fixture(); const parsed = parseRun(f.run);
    let report = evaluateRun(parsed,f.context);
    expect(report.integrity.status).toBe('pass'); expect(report.planReviewable.status).toBe('pass'); expect(report.planReviewed.status).toBe('pending'); expect(report.executableNow).toEqual([]);
    expect(planReview(f.run,{ purpose:'scope',subjectIds:['R-GREETING'] },f.context).action).toBe('review');
    f.judge('scope',['R-GREETING']); report = evaluateRun(f.run,f.context);
    expect(report.executableNow).toEqual(['W-CLI']); expect(report.proof.status).toBe('pending');
    f.observe('C-OK'); f.observe('C-OK','build'); f.observe('C-RECOVER');
    expect(evaluateRun(f.run,f.context).work['W-CLI'].verified.status).toBe('pass');
    expect(evaluateRun(f.run,f.context).outcomes['O-GREETING'].status).toBe('pending');
    f.judge('semantic',['C-OK','C-RECOVER']);
    expect(evaluateRun(f.run,f.context).proof.status).toBe('pass');
    const releaseReview = planReview(f.run,{ purpose:'release',subjectIds:['R1'] },f.context);
    expect(releaseReview.action).toBe('review'); expect(releaseReview.prerequisites.status).toBe('pass');
    expect(evaluateRun(f.run,f.context).releases.R1.status).toBe('pending');
    f.judge('release',['R1']); expect(evaluateRun(f.run,f.context).releases.R1.status).toBe('pass');
  });
  it('honors planning stops and rejects hostless/self-declared receipts', () => {
    const f = fixture(); f.judge('scope',['R-GREETING']); f.run.policy.execution = 'plan-only';
    f.judge('scope',['R-GREETING']);
    expect(codes(evaluateRun(f.run,f.context).work['W-CLI'].executable)).toContain('USER_PLANNING_STOP');
    complete(f); expect(evaluateRun(f.run,{ projectRoot:f.root }).planReviewed.status).toBe('pending');
    expect(evaluateRun(f.run,{ projectRoot:f.root }).proof.status).toBe('pending');
  });
  it('consumes an actual acknowledgment of the named proof while retaining reserved future checkpoints', () => {
    const f = fixture(); f.run.policy.checkpoints = 'every-proof';
    f.run.criteria.push({ ...structuredClone(f.run.criteria[0]),id:'C-NEXT-OK' },{ ...structuredClone(f.run.criteria[1]),id:'C-NEXT-RECOVER' });
    f.run.outcomes.push({ ...structuredClone(f.run.outcomes[0]),id:'O-NEXT',criterionIds:['C-NEXT-OK','C-NEXT-RECOVER'] });
    f.run.work.push({ ...structuredClone(f.run.work[0]),id:'W-NEXT',outcomeIds:['O-NEXT'],criterionIds:['C-NEXT-OK','C-NEXT-RECOVER'],instructions:'' });
    f.authorize(); complete(f);
    f.run.work[1].instructions = 'Implement and demonstrate the next independent consumer.'; f.run.activeWorkIds = ['W-NEXT'];
    expect(codes(evaluateRun(f.run,f.context).work['W-NEXT'].executable)).toContain('USER_CHECKPOINT_REQUIRED');
    const originalScope = scopeFingerprint(f.run); const acknowledgment = f.acknowledge();
    expect(scopeFingerprint(f.run)).toBe(originalScope); expect(evaluateRun(f.run,f.context).work['W-NEXT'].executable.status).toBe('pass');
    expect(f.run.policy.checkpoints).toBe('every-proof');
    const reference = acknowledgment.instruction.reference; acknowledgment.instruction.reference = 'host://forged';
    expect(codes(evaluateRun(f.run,f.context).work['W-NEXT'].executable)).toContain('USER_CHECKPOINT_REQUIRED'); acknowledgment.instruction.reference = reference;
    f.observe('C-OK'); f.judge('semantic',['C-OK','C-RECOVER']);
    expect(codes(evaluateRun(f.run,f.context).work['W-NEXT'].executable)).toContain('USER_CHECKPOINT_REQUIRED');
    f.acknowledge(); expect(evaluateRun(f.run,f.context).work['W-NEXT'].executable.status).toBe('pass');
  });
  it('never lets a later successful judgment conceal a current rejection or P1 finding', () => {
    const f = fixture(); complete(f);
    f.judge('semantic',['C-OK'],'rejected'); f.judge('semantic',['C-OK'],'approved');
    expect(codes(evaluateRun(f.run,f.context).outcomes['O-GREETING'])).toContain('CURRENT_REVIEW_REJECTED');
    const plan = planReview(f.run,{ purpose:'semantic',subjectIds:['C-OK'] },f.context); expect(plan.action).toBe('blocked');
    const other = fixture(); complete(other); other.judge('semantic',['C-OK'],'approved','independent',{ findings:[{ id:'F-WRONG',severity:'P1',criterionIds:['C-OK'],message:'Actual output is a different behavior despite a copied requirement ID.' }] });
    expect(evaluateRun(other.run,other.context).proof.status).toBe('fail');
  });
  it('requires actual distinct independent reviewer identity and cumulative owner duties', () => {
    const f = fixture(); f.run.policy.reviews.scope = ['owner','independent'];
    f.judge('scope',['R-GREETING'],'approved','independent',{ reviewer:{ id:'producer',contextId:'new-context',role:'independent' } });
    f.judge('scope',['R-GREETING'],'approved','owner'); expect(evaluateRun(f.run,f.context).planReviewed.status).toBe('pending');
    f.judge('scope',['R-GREETING']); expect(evaluateRun(f.run,f.context).planReviewed.status).toBe('pass');
  });
  it('keeps actual source bytes, target revision, observer metadata and artifacts bound', () => {
    const f = fixture(); complete(f); const before = evidenceBinding(f.run,'C-OK');
    f.run.targets[0].revision = 'candidate-2'; expect(evidenceBinding(f.run,'C-OK').fingerprint).not.toBe(before.fingerprint);
    expect(evaluateRun(f.run,f.context).proof.status).toBe('pending');
    f.run.targets[0].revision = 'candidate-1'; f.run.evidence[0].production = false;
    expect(codes(evaluateRun(f.run,f.context).proof)).toContain('EVIDENCE_UNAUTHENTICATED');
    fs.writeFileSync(path.join(f.root,'USER-REQUEST.md'),'Changed original instruction'); expect(evaluateRun(f.run,f.context).integrity.status).toBe('fail');
  });
  it('rejects changed raw evidence and symlink escape even when metadata claims current hashes', () => {
    const f = fixture(); complete(f); fs.writeFileSync(path.join(f.root,f.run.evidence[0].artifact.path),'tampered');
    expect(evaluateRun(f.run,f.context).proof.status).toBe('fail');
    const other = fixture(); fs.symlinkSync('/etc/hosts',path.join(other.root,'outside'));
    other.run.sources[0].binding = { path:'outside',sha256:'0'.repeat(64) }; expect(evaluateRun(other.run,other.context).integrity.status).toBe('fail');
  });
  it('retires verified bounded work without accepting unfinished outcome criteria', () => {
    const f = fixture(); f.run.work[0].criterionIds = ['C-OK']; f.judge('scope',['R-GREETING']); f.observe('C-OK'); f.observe('C-OK','build');
    const report = evaluateRun(f.run,f.context); expect(report.work['W-CLI'].verified.status).toBe('pass'); expect(report.proof.status).toBe('pending');
    expect(report.work['W-CLI'].executable.status).toBe('not-applicable');
  });
});

describe('causal decisions, target lifecycle and scoped blockers', () => {
  it('permits an authorized inspection producer, then reviews its decision, then unlocks its consumer', () => {
    const f = fixture();
    f.run.decisions.push({ id:'D-INSPECTED',description:'Accept completed actual inspection',sourceRefs:[{ sourceId:'request',locator:'CLI scope' }],producedBy:['W-CLI'],inputs:[],requiredRoles:['owner'] });
    f.run.work.push({ ...f.run.work[0],id:'W-CONSUME',title:'Consumer after inspection acceptance',inputs:[{ kind:'decision',id:'D-INSPECTED' }],instructions:'' });
    f.judge('scope',['R-GREETING']);
    expect(evaluateRun(f.run,f.context).executableNow).toEqual(['W-CLI']);
    expect(planReview(f.run,{ purpose:'decision',subjectIds:['D-INSPECTED'] },f.context).action).toBe('blocked');
    f.observe('C-OK'); f.observe('C-OK','build'); f.observe('C-RECOVER');
    expect(planReview(f.run,{ purpose:'decision',subjectIds:['D-INSPECTED'] },f.context).action).toBe('review');
    f.judge('decision',['D-INSPECTED'],'approved','owner');
    expect(evaluateRun(f.run,f.context).decisions['D-INSPECTED'].status).toBe('pass');
  });
  it('detects a completion decision blocking its own producer through producedBy', () => {
    const f = fixture(); f.run.decisions.push({ id:'D-QUOTE',description:'Approve the quote produced by this work',sourceRefs:[{ sourceId:'request',locator:'CLI scope' }],producedBy:['W-CLI'],inputs:[],requiredRoles:['owner'] });
    f.run.work[0].inputs = [{ kind:'decision',id:'D-QUOTE' }];
    expect(validateGraph(f.run).some(d => d.code === 'DEPENDENCY_CYCLE' && d.causes?.includes('decision:D-QUOTE'))).toBe(true);
    expect(evaluateRun(f.run,f.context).integrity.status).toBe('fail');
  });
  it.each(['outcome','work','decision','resource'] as const)('permits %s prerequisite preparation before proof while blocking independent breadth', kind => {
    const f = fixture();
    f.run.criteria.push({ ...structuredClone(f.run.criteria[0]),id:'C-PREP-OK' },{ ...structuredClone(f.run.criteria[1]),id:'C-PREP-RECOVER' });
    f.run.outcomes.push({ ...structuredClone(f.run.outcomes[0]),id:'O-PREP',criterionIds:['C-PREP-OK','C-PREP-RECOVER'] });
    f.run.work.push({ ...structuredClone(f.run.work[0]),id:'W-PREP',outcomeIds:['O-PREP'],criterionIds:['C-PREP-OK','C-PREP-RECOVER'],action:'read' });
    f.run.work.push({ ...structuredClone(f.run.work[0]),id:'W-BREADTH',outcomeIds:['O-PREP'],criterionIds:['C-PREP-OK','C-PREP-RECOVER'],instructions:'' });
    f.run.activeWorkIds = ['W-CLI','W-PREP'];
    if (kind === 'outcome') f.run.outcomes[0].inputs = [{ kind:'outcome',id:'O-PREP' }];
    if (kind === 'work') f.run.work[0].inputs = [{ kind:'work',id:'W-PREP' }];
    if (kind === 'decision') {
      f.run.decisions.push({ id:'D-PREP',description:'Accept actual preparation',sourceRefs:[{ sourceId:'request',locator:'Original request' }],producedBy:['W-PREP'],inputs:[],requiredRoles:['owner'] });
      f.run.work[0].inputs = [{ kind:'decision',id:'D-PREP' }];
    }
    if (kind === 'resource') {
      f.run.resources.push({ id:'RES-PREP',description:'Actual prepared resource',kind:'input',targetId:'cli',status:'missing',sourceRefs:[],producedBy:['W-PREP'] });
      f.run.work[0].inputs = [{ kind:'resource',id:'RES-PREP' }];
    }
    // Keep independent breadth on another outcome, rather than another producer of preparation.
    f.run.outcomes.push({ ...structuredClone(f.run.outcomes[1]),id:'O-BREADTH' }); f.run.work[2].outcomeIds = ['O-BREADTH'];
    f.judge('scope',['R-GREETING']); const report = evaluateRun(f.run,f.context);
    expect(report.work['W-PREP'].executable.status).toBe('pass');
    expect(codes(report.work['W-BREADTH'].executable)).toContain('FIRST_PROOF_REQUIRED');
    // Outcome prerequisites govern acceptance; actual work consumption is explicit.
    expect(report.work['W-CLI'].executable.status).toBe(kind === 'outcome' ? 'pass' : 'pending');
    expect(report.outcomes['O-GREETING'].status).toBe('pending');
  });
  it('retains unknown live targets while independent local work proceeds and actual live action blocks', () => {
    const f = fixture(); f.run.targets.push({ ...structuredClone(f.run.targets[0]),id:'legacy',identity:null,environment:'production',revision:null,lifecycle:{ stage:'live',dataPolicy:'retain',sourceRef:{ sourceId:'request',locator:'Separate historical site' } } });
    f.run.criteria.push({ ...structuredClone(f.run.criteria[0]),id:'C-LIVE-OK',targetId:'legacy',evidenceKinds:['operation'] },{ ...structuredClone(f.run.criteria[1]),id:'C-LIVE-RECOVER',targetId:'legacy',evidenceKinds:['operation'] });
    f.run.outcomes.push({ id:'O-LIVE',title:'Actual old-side cutover',requirementIds:['R-GREETING'],criterionIds:['C-LIVE-OK','C-LIVE-RECOVER'],targetId:'legacy',inputs:[] });
    f.run.work.push({ ...structuredClone(f.run.work[0]),id:'W-LIVE',outcomeIds:['O-LIVE'],criterionIds:['C-LIVE-OK','C-LIVE-RECOVER'],targetIds:['legacy'],action:'live-write',instructions:'' });
    f.judge('scope',['R-GREETING']);
    expect(evaluateRun(f.run,f.context).executableNow).toEqual(['W-CLI']);
    const live = evaluateBoundary(f.run,{ kind:'work-executable',id:'W-LIVE' },f.context);
    expect(codes(live)).toContain('TARGET_UNRESOLVED'); expect(codes(live)).toContain('ACTION_AUTHORITY_REQUIRED');
    const fake = f.observe('C-LIVE-OK','operation',{ targetId:'cli' }); f.authenticateEvidence(fake);
    expect(evaluateRun(f.run,f.context).outcomes['O-LIVE'].status).toBe('fail');
  });
  it('does not expose another graph or mutable booleans as readiness authority', () => {
    const f = fixture(); expect(() => parseRun({ ...f.run,complete:true })).toThrow('unknown field');
    expect(() => parseRun({ ...f.run,schemaVersion:2 })).toThrow('CONTRACT_UNSUPPORTED');
    const fingerprint = scopeFingerprint(f.run); f.run.revision++; f.run.evidence.push({} as never);
    expect(scopeFingerprint(f.run)).toBe(fingerprint);
  });
  it('permits causally ordered cohesive updates to one file while rejecting unordered active writers', () => {
    const f = fixture(); f.run.work.push({ ...structuredClone(f.run.work[0]),id:'W-SECOND' }); f.run.activeWorkIds.push('W-SECOND');
    expect(validateGraph(f.run).some(d => d.code === 'WORK_OWNERSHIP_COLLISION')).toBe(true);
    f.run.work[1].inputs = [{ kind:'work',id:'W-CLI' }];
    expect(validateGraph(f.run).some(d => d.code === 'WORK_OWNERSHIP_COLLISION')).toBe(false);
    f.judge('scope',['R-GREETING']); expect(evaluateRun(f.run,f.context).executableNow).toEqual(['W-CLI']);
  });
  it('does not manufacture a software build obligation for a document-only release', () => {
    const f = fixture(); f.run.targets[0].kind = 'document'; f.run.criteria.forEach(c => c.evidenceKinds = ['document']);
    expect(validateGraph(f.run).some(d => d.code === 'RELEASE_BUILD_MISSING')).toBe(false);
    f.run.targets[0].kind = 'cli'; expect(validateGraph(f.run).some(d => d.code === 'RELEASE_BUILD_MISSING')).toBe(true);
  });
});

describe('actual test and composed image receipts', () => {
  it.each(['vitest-json','junit'] as const)('accepts actual executed consumer assertions from the supported %s runner', format => {
    const f = fixture();
    const suite = f.file('consumer.test.mjs',"import { spawnSync } from 'node:child_process';\ntest('actual greeting and invalid-input recovery', () => { const ok = spawnSync(process.execPath, ['app.mjs', 'Ada'], {encoding:'utf8'}); expect(ok.status).toBe(0); expect(JSON.parse(ok.stdout).greeting).toBe('Hello Ada'); const invalid = spawnSync(process.execPath, ['app.mjs'], {encoding:'utf8'}); expect(invalid.status).toBe(2); expect(invalid.stderr).toContain('Provide a name'); });\n");
    f.run.criteria[0].inputs.push(suite); f.run.criteria[0].evidenceKinds.push('test'); f.run.criteria[0].minimumCollected = 1;
    const runner = fileURLToPath(new URL('../../node_modules/vitest/vitest.mjs',import.meta.url));
    const output = path.join(f.root,format === 'junit' ? 'results.xml':'results.json');
    const args = [runner,'run','consumer.test.mjs','--root',f.root,'--globals',`--reporter=${format === 'junit' ? 'junit':'json'}`,`--outputFile=${output}`];
    const observed = spawnSync(process.execPath,args,{ cwd:f.root,encoding:'utf8' });
    expect(observed.status,observed.stderr).toBe(0);
    const raw = fs.readFileSync(output); const artifact = f.file(`observed/${path.basename(output)}`,raw);
    const e = f.observe('C-OK','test',{ artifact,command:`node ${args.join(' ')}`,test:{ format,collected:1,failed:0,exitCode:observed.status! } });
    expect(validateEvidence(f.run,e,f.context)).toMatchObject({ status:'pass',code:'EVIDENCE_VERIFIED' });
  },15000);
  it.each(['vitest-json','junit'] as const)('rejects an all-skipped %s report as substantive executed evidence', format => {
    const f = fixture(); f.run.criteria[0].evidenceKinds.push('test'); f.run.criteria[0].minimumCollected = 1;
    f.run.criteria[0].inputs.push(f.file('skipped.test.js','test.skip("skipped", () => {});'));
    const raw = format === 'vitest-json' ? JSON.stringify({ success:true,numTotalTests:1,numPassedTests:0,numFailedTests:0,numPendingTests:1,numTodoTests:0,testResults:[{ name:'skipped.test.js',status:'passed',assertionResults:[{ title:'skipped',fullName:'skipped',status:'skipped',failureMessages:[] }] }] }) : '<testsuite tests="1" skipped="1"><testcase name="skipped"><skipped/></testcase></testsuite>';
    const e = f.observe('C-OK','test',{ artifact:f.file(`skipped.${format === 'junit' ? 'xml':'json'}`,raw),test:{ format,collected:1,failed:0,exitCode:0 } });
    expect(validateEvidence(f.run,e,f.context).status).toBe('fail');
  });
  it('rejects zero collection, forged count totals and a failing raw test report', () => {
    const f = fixture(); f.run.criteria[0].evidenceKinds = ['test','build','consumer']; f.run.criteria[0].minimumCollected = 1;
    // Preserve a consumer contract on recovery, so this exercises receipt validity.
    f.judge('scope',['R-GREETING']);
    const artifact = f.file('test-results.json',JSON.stringify({ success:true,numTotalTests:0,numFailedTests:0 }));
    const e = f.observe('C-OK','test',{ artifact,test:{ format:'vitest-json',collected:0,failed:0,exitCode:0 } });
    expect(codes(evaluateRun(f.run,f.context).work['W-CLI'].verified)).toContain('TEST_RECEIPT_INVALID');
    e.artifact = f.file('test-results.json',JSON.stringify({ success:true,numTotalTests:1,numPassedTests:0,numFailedTests:1,testResults:[{ name:'app.mjs',status:'passed',assertionResults:[{ fullName:'actual failed assertion',status:'failed',failureMessages:['Failure'] }] }] })); e.test = { format:'vitest-json',collected:2,failed:0,exitCode:0 }; f.authenticateEvidence(e);
    expect(codes(evaluateRun(f.run,f.context).work['W-CLI'].verified)).toContain('TEST_RECEIPT_CONTRADICTED');
  });
  it('requires entry/success/recovery composed states and a separate design judgment', () => {
    const f = fixture(); f.run.targets[0].kind = 'web';
    f.run.criteria[0].evidenceKinds = ['image','build']; f.run.criteria[0].captures = [{ state:'entry',context:'phone',composed:true },{ state:'success',context:'phone',composed:true }];
    f.run.criteria[1].evidenceKinds = ['image']; f.run.criteria[1].captures = [{ state:'recovery',context:'phone',composed:true }];
    f.judge('scope',['R-GREETING']);
    const png = f.file('capture.png',Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+j4z8AAAAASUVORK5CYII=','base64'));
    for (const [criterionId,state] of [['C-OK','entry'],['C-OK','success'],['C-RECOVER','recovery']] as const) f.observe(criterionId,'image',{ artifact:png,capture:{ state,context:'phone',composed:true } });
    f.observe('C-OK','build'); f.judge('semantic',['C-OK','C-RECOVER']);
    expect(evaluateRun(f.run,f.context).proof.status).toBe('pending');
    f.judge('design',['C-OK','C-RECOVER']); expect(evaluateRun(f.run,f.context).proof.status).toBe('pass');
    f.run.evidence.find(e => e.capture?.state === 'recovery')!.capture!.composed = false;
    expect(evaluateRun(f.run,f.context).proof.status).not.toBe('pass');
  });
  it('makes review bindings depend on actual observed results, not a model-written passed flag', () => {
    const f = fixture(); complete(f); const first = reviewBinding(f.run,{ purpose:'semantic',subjectIds:['C-OK'] });
    f.run.evidence[0].observer.contextId = 'changed-observer';
    expect(reviewBinding(f.run,{ purpose:'semantic',subjectIds:['C-OK'] }).fingerprint).not.toBe(first.fingerprint);
  });
  it('cannot accept wrong actual consumer behavior through a copied criterion and approving judgment', () => {
    const f = fixture();
    const changed = f.file('app.mjs',"console.log(JSON.stringify({greeting:'Wrong answer'}));\n");
    f.run.targets[0].bindings = [changed]; f.run.criteria.forEach(c => c.inputs = [changed]);
    f.judge('scope',['R-GREETING']); f.observe('C-OK'); f.observe('C-OK','build'); f.observe('C-RECOVER'); f.judge('semantic',['C-OK','C-RECOVER']);
    expect(codes(evaluateRun(f.run,f.context).proof)).toContain('OBSERVED_FAILURE');
  });
  it('does not order contradictory observations by invented IDs or mix release composition claims', () => {
    const f = fixture(); const time = new Date().toISOString();
    f.judge('scope',['R-GREETING']);
    f.observe('C-OK','consumer',{ id:'Z-pass',observedAt:time }); f.observe('C-OK','consumer',{ id:'A-fail',observedAt:time,result:'fail' });
    f.observe('C-OK','build'); f.observe('C-RECOVER'); f.judge('semantic',['C-OK','C-RECOVER']);
    expect(codes(evaluateRun(f.run,f.context).proof)).toContain('OBSERVED_FAILURE');
    const other = fixture(); other.judge('scope',['R-GREETING']); other.observe('C-OK'); other.observe('C-OK','build',{ production:false }); other.observe('C-RECOVER'); other.judge('semantic',['C-OK','C-RECOVER']); other.judge('release',['R1']);
    expect(other.run.evidence.every(e => e.result === 'pass')).toBe(true);
    expect(codes(evaluateRun(other.run,other.context).releases.R1)).toContain('RELEASE_COMPOSITION_REQUIRED');
  });
  it('preserves scope review through bounded refinement and forecasts while invalidating affected evidence', () => {
    const f = fixture(); complete(f);
    const scope = scopeFingerprint(f.run); const evidence = evidenceBinding(f.run,'C-OK');
    f.run.work[0].instructions += ' Keep the error correction concrete.'; f.run.work[0].files.push('runner.mjs');
    f.run.work[0].estimate!.hours = [2,3];
    f.run.capacity = { period:'week 1',hours:3,roles:[{ role:'engineer',hours:3 }],ownerTouchpoints:null,sourceRefs:[{ sourceId:'request',locator:'Local scope' }] };
    expect(scopeFingerprint(f.run)).toBe(scope); expect(evaluateRun(f.run,f.context).planReviewed.status).toBe('pass');
    expect(evidenceBinding(f.run,'C-OK').fingerprint).not.toBe(evidence.fingerprint); expect(evaluateRun(f.run,f.context).proof.status).toBe('pending');
    f.run.work[0].action = 'send'; expect(scopeFingerprint(f.run)).not.toBe(scope); expect(evaluateRun(f.run,f.context).planReviewed.status).toBe('pending');
  });
  it('releases the complete named boundary while another train and its decision remain pending', () => {
    const f = fixture();
    f.run.requirements.push({ ...structuredClone(f.run.requirements[0]),id:'R-EXTRA',description:'Separately scoped optional extension.',criterionIds:['C-EXTRA-OK','C-EXTRA-RECOVER'],releaseIds:['R2'] });
    f.run.criteria.push({ ...structuredClone(f.run.criteria[0]),id:'C-EXTRA-OK' },{ ...structuredClone(f.run.criteria[1]),id:'C-EXTRA-RECOVER' });
    f.run.decisions.push({ id:'D-PRICE',description:'Owner accepts the separately prepared extension price.',sourceRefs:[{ sourceId:'request',locator:'Separate extension' }],producedBy:[],inputs:[],requiredRoles:['owner'] });
    f.run.outcomes.push({ ...structuredClone(f.run.outcomes[0]),id:'O-EXTRA',requirementIds:['R-EXTRA'],criterionIds:['C-EXTRA-OK','C-EXTRA-RECOVER'],inputs:[{ kind:'decision',id:'D-PRICE' }] });
    f.run.releases.push({ ...structuredClone(f.run.releases[0]),id:'R2',outcomeIds:['O-EXTRA'],inputs:[{ kind:'decision',id:'D-PRICE' }] });
    f.judge('scope',['R-GREETING','R-EXTRA']); f.observe('C-OK'); f.observe('C-OK','build'); f.observe('C-RECOVER'); f.judge('semantic',['C-OK','C-RECOVER']); f.judge('release',['R1']);
    const report = evaluateRun(f.run,f.context); expect(report.releases.R1.status).toBe('pass'); expect(report.releases.R2.status).toBe('pending');
    f.run.requirements[1].releaseIds = []; expect(validateGraph(f.run).some(d => d.code === 'RELEASE_OBLIGATION_OMITTED' && d.subject === 'R1')).toBe(true);
  });
});
