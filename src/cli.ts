#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import type { Boundary, EvaluationContext, Evidence, Judgment, ReviewPurpose, RunContract, TrustedHost } from './workflow/contract.js';
import { parseRun } from './workflow/schema.js';
import { evaluateRun, evaluateBoundary } from './workflow/evaluate.js';
import { planReview, requestProblem } from './workflow/review.js';
import { evidenceBinding, reviewBinding, scopeFingerprint } from './workflow/evidence.js';
import { commitRun, inspectLegacy, loadRun, projectPath, readJson, StoreError } from './store.js';
import { compactAssessment, renderViews, writeViews } from './views.js';

const usage = `ai-prompt-workflow <command> <run.json> --project-root <directory> [options]
  validate       Structured integrity/readiness results; no universal ready flag
                 --boundary plan-reviewable|plan-reviewed|proof|work-executable|work-verified|outcome|decision|release [--id ID]
  view           Generate canonical views; optional --output <project-relative directory>
  review         Prepare a real review packet: --purpose scope|semantic|design|decision|release --ids id,id
  commit         Atomic revision-checked update: --from candidate.json --expect-revision N
  record         Append authenticated evidence/judgment: --from receipt.json --expect-revision N --host module.mjs
  inspect-legacy Read-only historical summary; never imports approvals or migrates
Optional --host is an explicitly trusted external module exporting trustedHost.
Exit: 0 requested check passed/action completed; 1 invalid/failed; 2 pending or unassessed.
`;
type Options = Record<string, string>;
function argumentsOf(args: string[]): { command: string; file: string; options: Options } {
  const [command, file, ...rest] = args;
  if (!command || !file || file.startsWith('--')) throw new StoreError('USAGE', usage);
  const options: Options = {};
  const allowed = new Set(['project-root','host','boundary','id','output','purpose','ids','from','expect-revision']);
  for (let i = 0; i < rest.length; i += 2) {
    const key = rest[i]?.replace(/^--/, ''), value = rest[i + 1];
    if (!rest[i]?.startsWith('--') || !allowed.has(key) || !value || value.startsWith('--') || key in options) throw new StoreError('USAGE', `Unknown, repeated or incomplete option ${rest[i]}\n${usage}`);
    options[key] = value;
  }
  return { command, file, options };
}
const print = (value: unknown): void => { process.stdout.write(`${JSON.stringify(value, null, 2)}\n`); };
const exitFor = (status: string): number => status === 'pass' ? 0 : status === 'fail' ? 1 : 2;
async function contextFor(options: Options): Promise<EvaluationContext> {
  const projectRoot = fs.realpathSync(options['project-root'] ?? process.cwd());
  if (!options.host) return { projectRoot };
  const hostFile = fs.realpathSync(path.resolve(options.host));
  const relative = path.relative(projectRoot, hostFile);
  if (!relative.startsWith(`..${path.sep}`) && relative !== '..' && !path.isAbsolute(relative)) throw new StoreError('HOST_INSIDE_PROJECT', 'Trusted host code must be explicitly selected outside the producer project; project-authored approval code is not a trust boundary');
  const module = await import(pathToFileURL(hostFile).href);
  const host = module.trustedHost as TrustedHost | undefined;
  if (!host || ['verifyAuthorization','verifyEvidence','verifyJudgment'].some(key => typeof (host as unknown as Record<string, unknown>)[key] !== 'function')) throw new StoreError('HOST_INTERFACE', 'Module must export trustedHost with synchronous verification methods');
  return { projectRoot, host };
}
function boundaryOf(options: Options): Boundary | undefined {
  if (!options.boundary) { if (options.id) throw new StoreError('USAGE', '--id needs --boundary'); return undefined; }
  if (['plan-reviewable','plan-reviewed','proof'].includes(options.boundary)) {
    if (options.id) throw new StoreError('USAGE', 'This boundary takes no --id');
    return { kind: options.boundary as 'proof' | 'plan-reviewable' | 'plan-reviewed' };
  }
  if (!['work-executable','work-verified','outcome','decision','release'].includes(options.boundary) || !options.id) throw new StoreError('USAGE', 'Named boundary needs a supported --boundary and --id');
  return { kind: options.boundary as 'work-executable' | 'work-verified' | 'outcome' | 'decision' | 'release', id: options.id };
}
const required = (options: Options, key: string): string => { if (!(key in options)) throw new StoreError('USAGE', `Missing --${key}`); return options[key]; };
function revisionOf(options: Options): number {
  const text = required(options, 'expect-revision');
  if (!/^(0|[1-9][0-9]*)$/.test(text) || !Number.isSafeInteger(Number(text))) throw new StoreError('REVISION_REQUIRED', 'Use a nonnegative safe integer expected revision');
  return Number(text);
}
const questions: Record<ReviewPurpose, string[]> = {
  scope: [
    'Read the original source bytes and conflicting editions. Which requested behavior or release duty is missing, narrowed or invented?',
    'Trace a representative success and recovery journey through criteria, targets and prerequisites. Does each operation name its actual target and lifecycle?',
    'Can inspection and quote preparation run before the decisions they produce? Distinguish missing access from acceptance of its result.',
    'Are ordinary reversible choices made, genuine owner inputs scoped to their consumers, and effort/capacity limits honest?',
    'Report specific contrary evidence and unresolved findings. Structural validity or covered IDs are not semantic approval.'
  ],
  semantic: [
    'Inspect original intent, actual consumer actions and raw evidence on the bound target, including recovery and forbidden behavior.',
    'Does the observed behavior preserve actor/permission/state/provider semantics? Challenge a plausible wrong implementation.',
    'Explain what remains unproved; reject any blocking contradiction even when the build and tests pass.'
  ],
  design: ['Inspect composed entry, success and recovery captures for every declared context against source intent.', 'Judge hierarchy, interaction and usability of the complete experience; token matching or isolated component screenshots cannot establish acceptance.'],
  decision: ['Inspect the actual producer output and required authority; do not approve a quote, scope change or owner decision on an invented reply.', 'Distinguish proposed defaults from reserved commercial/live actions and preserve unresolved contrary evidence.'],
  release: ['Inspect the complete selected release and shared obligations against original sources, fresh exact-target evidence and real consumer/operational recovery.', 'Confirm release-specific authority and candidate coherence; unrelated future releases may remain pending, but no required duty may disappear.', 'Readiness is not permission to deploy, send, spend or change live data.']
};
async function record(run: RunContract, file: string, options: Options, context: EvaluationContext): Promise<unknown> {
  if (!context.host) throw new StoreError('HOST_REQUIRED', 'Actual host verification is required to record a receipt');
  const envelope = readJson(projectPath(context.projectRoot, required(options, 'from'))) as {kind?: unknown; value?: unknown};
  if (!envelope || !['evidence','judgment'].includes(String(envelope.kind))) throw new StoreError('RECEIPT_FORMAT', 'Expected {kind: evidence|judgment, value: actualRecord}');
  const next = structuredClone(run); next.revision = run.revision + 1;
  if (envelope.kind === 'evidence') next.evidence.push(envelope.value as Evidence); else next.judgments.push(envelope.value as Judgment);
  parseRun(next);
  if (envelope.kind === 'evidence') {
    const value = next.evidence.at(-1)!; const binding = evidenceBinding(run, value.criterionId);
    if (value.fingerprint !== binding.fingerprint || value.targetId !== binding.targetId || context.host.verifyEvidence(value, binding) !== true) throw new StoreError('RECEIPT_UNVERIFIED', 'Evidence does not have current authenticated provenance');
  } else {
    const value = next.judgments.at(-1)!;
    const problem = requestProblem(run, value); if (problem) throw new StoreError('REVIEW_SUBJECT_INVALID', problem);
    const binding = reviewBinding(run, value);
    if (value.fingerprint !== binding.fingerprint || context.host.verifyJudgment(value, binding) !== true || (value.reviewer.role === 'independent' && (value.reviewer.id === run.policy.implementerId || value.reviewer.contextId === run.policy.implementerContextId))) throw new StoreError('RECEIPT_UNVERIFIED', 'Judgment does not have current independent authenticated provenance');
    // Record contrary judgments too. An additional approval cannot erase a retained rejection.
    if (value.result === 'approved' && planReview(run, value, context).prerequisites.status !== 'pass') throw new StoreError('REVIEW_PREREQUISITE', 'Review prerequisite evidence is not ready; approval cannot bypass it');
  }
  return commitRun(context.projectRoot, file, next, revisionOf(options));
}
export async function main(args: string[]): Promise<number> {
  if (!args.length || args[0] === '--help' || args[0] === 'help') { process.stdout.write(usage); return 0; }
  const {command, file, options} = argumentsOf(args);
  if (command === 'inspect-legacy') { print(inspectLegacy(file)); return 0; }
  const context = await contextFor(options);
  if (command === 'commit') { print(commitRun(context.projectRoot, file, readJson(projectPath(context.projectRoot, required(options,'from'))), revisionOf(options))); return 0; }
  const run = loadRun(context.projectRoot, file);
  if (command === 'validate') {
    const boundary = boundaryOf(options);
    if (boundary) { const result = evaluateBoundary(run, boundary, context); print({runId:run.runId, revision:run.revision, boundary, result}); return exitFor(result.status); }
    const assessment = evaluateRun(run, context); print(compactAssessment(assessment)); return exitFor(assessment.planReviewed.status);
  }
  if (command === 'view') {
    const projection = renderViews(run, context);
    if (options.output) print({runId:run.runId,revision:run.revision,fingerprint:projection.fingerprint,files:writeViews(context.projectRoot,options.output,projection)});
    else print({runId:run.runId,revision:run.revision,fingerprint:projection.fingerprint,assessment:compactAssessment(projection.assessment),ownerBrief:projection.files['OWNER-BRIEF.md']});
    return 0;
  }
  if (command === 'review') {
    const purpose = required(options, 'purpose') as ReviewPurpose;
    if (!(purpose in questions)) throw new StoreError('USAGE', 'Unknown review purpose');
    const subjectIds = required(options,'ids').split(',').map(s=>s.trim()).filter(Boolean);
    const request = {purpose,subjectIds}; const plan = planReview(run,request,context);
    print({ ...plan, questions:questions[purpose], sourceFiles:run.sources, contract:run, scopeFingerprint:scopeFingerprint(run),
      instruction:'A real distinct reviewer must inspect source/consumer evidence and return an authenticated judgment. This packet is not an approval.' });
    return plan.action === 'blocked' ? exitFor(plan.prerequisites.status === 'pass' ? 'fail' : plan.prerequisites.status) : 0;
  }
  if (command === 'record') { print(await record(run,file,options,context)); return 0; }
  throw new StoreError('USAGE', `Unknown command ${command}\n${usage}`);
}
if (process.argv[1] && pathToFileURL(fs.realpathSync(process.argv[1])).href === import.meta.url) {
  main(process.argv.slice(2)).then(code => { process.exitCode = code; }).catch((error: unknown) => {
    const failure = error as {code?:string; message?:string};
    process.stderr.write(`${JSON.stringify({code:failure.code ?? 'WORKFLOW_ERROR',message:failure.message ?? String(error)})}\n`); process.exitCode=1;
  });
}
