import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import type { CheckResult, EvaluationContext, GateResult, RunAssessment, RunContract, Work } from './workflow/contract.js';
import { evaluateRun } from './workflow/evaluate.js';
import { canonical, digest } from './workflow/evidence.js';
import { projectPath, StoreError } from './store.js';

export interface Projection { runId: string; revision: number; fingerprint: string; assessment: RunAssessment; files: Record<string, string> }
const cell = (value: unknown): string => String(value).replaceAll('|', '\\|').replaceAll('\n', ' ').replaceAll('<', '&lt;');
const reasons = (gate: GateResult): string => {
  const rows = [...new Map(gate.checks.filter(c => !['pass', 'not-applicable'].includes(c.status)).map(c => [`${c.code}: ${c.message}`, c])).entries()];
  return rows.slice(0, 4).map(([message]) => message).join('; ') + (rows.length > 4 ? `; ${rows.length - 4} additional causes in STATUS.json` : '') || 'No remaining check reported for this boundary';
};
/** Factor repeated diagnostics once; all boundary membership and causes remain recoverable. */
export function compactAssessment(assessment: RunAssessment) {
  const diagnostics: Record<string, CheckResult> = {}, ids = new Map<string,string>();
  const compact = (gate: GateResult) => ({ status: gate.status, diagnosticIds: [...new Set(gate.checks.map(c => {
    const key = canonical(c); let id = ids.get(key);
    if (!id) { id = `D${ids.size + 1}`; ids.set(key,id); diagnostics[id] = c; }
    return id;
  }))] });
  const collection = (gates: Record<string,GateResult>) => Object.fromEntries(Object.entries(gates).map(([id,g]) => [id,compact(g)]));
  return { runId:assessment.runId, revision:assessment.revision,
    integrity:compact(assessment.integrity), planReviewable:compact(assessment.planReviewable), planReviewed:compact(assessment.planReviewed), proof:compact(assessment.proof),
    work:Object.fromEntries(Object.entries(assessment.work).map(([id,w])=>[id,{executable:compact(w.executable),verified:compact(w.verified)}])),
    decisions:collection(assessment.decisions), outcomes:collection(assessment.outcomes), releases:collection(assessment.releases),
    executableNow:assessment.executableNow, diagnostics };
}
function effort(work: Work[]): { hours: [number, number]; unestimated: string[]; roles: Record<string, [number, number]>; ownerTouchpoints: number; unknownTouchpoints: string[] } {
  const hours: [number, number] = [0, 0], roles: Record<string, [number, number]> = {}, unestimated: string[] = [], unknownTouchpoints: string[] = [];
  let ownerTouchpoints = 0;
  for (const w of work) {
    if (!w.estimate?.hours) unestimated.push(w.id);
    else {
      hours[0] += w.estimate.hours[0]; hours[1] += w.estimate.hours[1];
      const role = roles[w.estimate.role] ??= [0, 0]; role[0] += w.estimate.hours[0]; role[1] += w.estimate.hours[1];
    }
    if (w.estimate?.ownerTouchpoints == null) unknownTouchpoints.push(w.id); else ownerTouchpoints += w.estimate.ownerTouchpoints;
  }
  return { hours, unestimated, roles, ownerTouchpoints, unknownTouchpoints };
}
export function renderViews(run: RunContract, context: EvaluationContext): Projection {
  const assessment = evaluateRun(run, context), fingerprint = digest({ run, assessment });
  const header = `<!-- ai-prompt-library generated; run=${run.runId}; revision=${run.revision}; fingerprint=${fingerprint} -->\n`;
  const notes = '\nDerived from run.json. Editing this view changes no authority or readiness. Unknowns remain unknown; a passed structural check does not prove faithful source interpretation or a working product.\n';
  const gates = (items: Record<string, GateResult>) => Object.entries(items).map(([id, g]) => `| ${cell(id)} | ${g.status} | ${cell(reasons(g))} |`).join('\n');
  const roadmap = `${header}# Roadmap\n${notes}\n| Outcome | User result | Target | Acceptance |\n| --- | --- | --- | --- |\n${run.outcomes.map(o => `| ${cell(o.id)} | ${cell(o.title)} | ${cell(o.targetId)} | ${assessment.outcomes[o.id]?.status ?? 'unassessed'} |`).join('\n')}\n\n## Release boundaries\n\n| Release | Readiness | Remaining checks |\n| --- | --- | --- |\n${gates(assessment.releases)}\n\n## Success and recovery\n\n${run.outcomes.map(o => `### ${cell(o.id)}\n\n${o.criterionIds.map(id => { const c = run.criteria.find(c => c.id === id); return c ? `- ${cell(c.id)} (${c.scenario}; target ${cell(c.targetId)}): ${cell(c.description)}` : `- Unresolved criterion ${cell(id)}`; }).join('\n')}`).join('\n\n')}\n`;
  const total = effort(run.work), capacity = run.capacity;
  const forecast = `Known effort: ${total.hours[0]}–${total.hours[1]} hours. Unestimated work: ${total.unestimated.join(', ') || 'none'}. This is a sum of unique work estimates, not a calendar or resource-levelled forecast. Include review, integration and recovery in disjoint work estimates.\n\n${capacity ? `Declared capacity: ${capacity.hours} hours during ${cell(capacity.period)}. ${total.hours[1] > capacity.hours ? '**High estimate exceeds capacity; reforecast before committing.**' : 'The represented total fits; missing estimates, role contention and inputs may still prevent delivery.'}\n\n| Role | Estimated hours | Declared hours |\n| --- | --- | --- |\n${Object.entries(total.roles).map(([role, range]) => `| ${cell(role)} | ${range[0]}–${range[1]} | ${capacity.roles.find(r => r.role === role)?.hours ?? 'unknown'} |`).join('\n')}\n\nOwner touchpoints: ${total.ownerTouchpoints} known, capacity ${capacity.ownerTouchpoints ?? 'unknown'}; unknown for ${total.unknownTouchpoints.join(', ') || 'none'}.` : 'Capacity and role availability are unknown; no delivery-date or fixed-fee feasibility claim is supported.'}\n`;
  const owner = `${header}# Owner brief\n${notes}\nPlan reviewable: **${assessment.planReviewable.status}**. Plan reviewed: **${assessment.planReviewed.status}**. Proof accepted: **${assessment.proof.status}**.\n\nExecutable now: ${assessment.executableNow.join(', ') || 'none'}. Execution policy: ${run.policy.execution}; checkpoints: ${run.policy.checkpoints}. These results use actual host verification when configured.\n\n## Decisions\n\n| Decision | Producer work | Status | Remaining checks |\n| --- | --- | --- | --- |\n${run.decisions.map(d => `| ${cell(d.id + ': ' + d.description)} | ${cell(d.producedBy.join(', ') || 'external input')} | ${assessment.decisions[d.id]?.status ?? 'unassessed'} | ${cell(assessment.decisions[d.id] ? reasons(assessment.decisions[d.id]) : 'unknown')} |`).join('\n')}\n\n## Resources and authority\n\n| Input | Target | Declared state (not proof) |\n| --- | --- | --- |\n${run.resources.map(r => `| ${cell(r.id + ': ' + r.description)} | ${cell(r.targetId)} | ${r.status} |`).join('\n')}\n\n## Forecast limits\n\n${forecast}\n`;
  const work = `${header}# Active work\n${notes}\n${run.activeWorkIds.map(id => { const w = run.work.find(w => w.id === id); const result = assessment.work[id]; return w ? `## ${cell(w.id)}: ${cell(w.title)}\n\nExecution: **${result?.executable.status ?? 'unassessed'}**. ${result ? reasons(result.executable) : 'Unknown work'}\n\nTargets: ${w.targetIds.join(', ')}. Action: ${w.action}.\nInputs: ${w.inputs.map(i => `${i.kind}:${i.id}`).join(', ') || 'none'}.\nOwned files: ${w.files.join(', ') || 'none'}.\n\n${w.instructions}\n\nAcceptance criteria: ${w.criterionIds.join(', ')}. Verification: ${result?.verified.status ?? 'unassessed'}.\n` : `Unknown work ${cell(id)}`; }).join('\n')}\nDeferred work: ${run.work.filter(w => !run.activeWorkIds.includes(w.id)).map(w => w.id).join(', ') || 'none'}. Deferred outcomes are not accepted by completing an active unit.\n`;
  return { runId: run.runId, revision: run.revision, fingerprint, assessment, files: {
    'ROADMAP.md': roadmap, 'OWNER-BRIEF.md': owner, 'WORK.md': work,
    'STATUS.json': `${JSON.stringify({ generatedBy: 'ai-prompt-library', runId: run.runId, revision: run.revision, fingerprint, assessment:compactAssessment(assessment) }, null, 2)}\n`,
  } };
}
export function writeViews(root: string, directory: string, projection: Projection): string[] {
  const destination = projectPath(root, directory);
  fs.mkdirSync(destination, { recursive: true });
  const files: string[] = [];
  // Check the entire destination before writing any files. Never clobber an unrelated human document.
  for (const name of Object.keys(projection.files)) {
    const file = projectPath(root, path.join(destination, name));
    if (fs.existsSync(file)) {
      const text = fs.readFileSync(file, 'utf8');
      let owned = text.startsWith('<!-- ai-prompt-library generated;');
      if (name === 'STATUS.json') { try { owned = JSON.parse(text).generatedBy === 'ai-prompt-library'; } catch { owned = false; } }
      if (!owned) throw new StoreError('VIEW_PATH_OCCUPIED', `Refusing to replace a non-generated document: ${file}`);
    }
  }
  for (const [name, contents] of Object.entries(projection.files)) {
    const file = projectPath(root, path.join(destination, name)), temporary = `${file}.${crypto.randomUUID()}.tmp`;
    try { fs.writeFileSync(temporary, contents, { flag: 'wx' }); fs.renameSync(temporary, file); files.push(file); }
    finally { if (fs.existsSync(temporary)) fs.unlinkSync(temporary); }
  }
  return files;
}
