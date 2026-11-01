import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import type { CheckResult, EvaluationContext, GateResult, RunAssessment, RunContract, Work } from './workflow/contract.js';
import { evaluateRun } from './workflow/evaluate.js';
import { canonical, digest } from './workflow/evidence.js';
import { allocations, forecastWork, milestoneMissingWork, scopeMissingProducers, scopeWorkIds } from './workflow/forecast.js';
import { projectPath, StoreError } from './store.js';

export interface Projection { runId: string; revision: number; fingerprint: string; assessment: RunAssessment; files: Record<string, string> }
const range = (value: [number, number] | null | undefined): string => value ? `${value[0]}–${value[1]}` : 'unknown';
const prerequisites = (rows: Work['inputs']): string => rows.map(i => `${i.kind}:${i.id}`).join(', ') || 'none';
const cell = (value: unknown): string => String(value).replaceAll('|', '\\|').replaceAll('\n', ' ').replaceAll('<', '&lt;');
// Owner-provided text is content, not Markdown or HTML. Escape entities first.
const literalCell = (value: string): string => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replace(/[\\`*_{}\[\]()#+.!|~:\-]/g, '\\$&').replace(/[\r\n]+/g, ' ');
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
export function renderViews(run: RunContract, context: EvaluationContext): Projection {
  const assessment = evaluateRun(run, context), fingerprint = digest({ run, assessment });
  const header = `<!-- ai-prompt-library generated; run=${run.runId}; revision=${run.revision}; fingerprint=${fingerprint} -->\n`;
  const notes = '\nDerived from run.json. Editing this view changes no authority or readiness. Unknowns remain unknown; a passed structural check does not prove faithful source interpretation or a working product.\n';
  const gates = (items: Record<string, GateResult>) => Object.entries(items).map(([id, g]) => `| ${cell(id)} | ${run.releases.find(r => r.id === id)?.composition === 'actual-target' ? 'Actual declared target' : 'Production composition'} | ${g.status} | ${cell(reasons(g))} |`).join('\n');
  const plannedWork = `\n## Delivery work and estimates\n\nLabor and owner waiting time are separate. Dependencies govern ordering; these ranges are not committed dates. Shared work IDs are counted once in the owner subtotal.\n\n| Work | Outcomes | Prerequisites | Role | Labor hours | Owner wait hours | Owner touchpoints |\n| --- | --- | --- | --- | --- | --- | --- |\n${run.work.map(w => `| ${cell(w.id + ': ' + w.title)} | ${cell(w.outcomeIds.join(', '))} | ${cell(prerequisites(w.inputs))} | ${cell(allocations(w).map(a => a.role).join(', ') || 'unknown')} | ${allocations(w).length === 1 ? range(allocations(w)[0].hours) : allocations(w).length ? allocations(w).map(a => `${cell(a.role)}: ${range(a.hours)}`).join('; ') : 'unknown'} | ${range(w.estimate?.ownerDelayHours)} | ${w.estimate?.ownerTouchpoints ?? 'unknown'} |`).join('\n')}\n`;
  const obligations = `\n## Source obligations and planning assumptions\n\nCanonical requirement descriptions preserve source scope, constraints and forecast assumptions; acceptance still requires the linked criteria.\n\n${run.requirements.map(q => `### ${cell(q.id)}\n\n${cell(q.description)}\n\nSources: ${q.sourceRefs.map(s => `${cell(s.sourceId)} (${cell(s.locator)})`).join('; ')}. Criteria: ${q.criterionIds.map(cell).join(', ')}. Releases: ${q.releaseIds.map(cell).join(', ') || (q.mandatory ? 'all applicable' : 'none specified (optional)')}.\n`).join('\n')}\n`;
  const roadmap = `${header}# Roadmap\n${notes}\n| Outcome | User result | Target | Acceptance |\n| --- | --- | --- | --- |\n${run.outcomes.map(o => `| ${cell(o.id)} | ${cell(o.title)} | ${cell(o.targetId)} | ${assessment.outcomes[o.id]?.status ?? 'unassessed'} |`).join('\n')}\n\n## Release boundaries\n\n| Release | Evidence boundary | Readiness | Remaining checks |\n| --- | --- | --- | --- |\n${gates(assessment.releases)}\n${plannedWork}\n## Success and recovery\n\n${run.outcomes.map(o => `### ${cell(o.id)}\n\n${o.criterionIds.map(id => { const c = run.criteria.find(c => c.id === id); return c ? `- ${cell(c.id)} (${c.scenario}; target ${cell(c.targetId)}): ${cell(c.description)}` : `- Unresolved criterion ${cell(id)}`; }).join('\n')}`).join('\n\n')}\n`;
  const total = forecastWork(run,run.work.map(w => w.id)), capacity = run.capacity;
  const seen = new Set<string>();
  const milestoneView = (run.milestones ?? []).map(m => {
    const ids=scopeWorkIds(run,{kind:'milestone',id:m.id}), summary=forecastWork(run,ids);
    const shared=ids.filter(id => seen.has(id)), incremental=ids.filter(id => !seen.has(id)); ids.forEach(id => seen.add(id));
    const increment=forecastWork(run,incremental), cumulative=forecastWork(run,[...seen]), missing=milestoneMissingWork(run,m.id);
    const deps=ids.map(id => { const w=run.work.find(w => w.id===id)!; return `${id}: ${prerequisites(w.inputs)}`; }).join('; ');
    return `### ${cell(m.id)}: ${cell(m.title)}\n\nResult: ${cell(m.result)}. Recovery: ${cell(m.recovery)}. Outcomes: ${m.outcomeIds.map(cell).join(', ')}.\n\nWork including dependencies: ${ids.map(cell).join(', ') || 'none'}. Shared with earlier milestones: ${shared.map(cell).join(', ') || 'none'}. Incremental: ${incremental.map(cell).join(', ') || 'none'}. Dependencies: ${cell(deps)}. Linked outcome work outside this milestone: ${missing.map(cell).join(', ') || 'none'}.\n\nIncremental labor: ${range(increment.hours)} known, unknown for ${increment.unknown.map(cell).join(', ') || 'none'}. Cumulative union labor: ${range(cumulative.hours)} known, unknown for ${cumulative.unknown.map(cell).join(', ') || 'none'}.\n\nKnown labor: ${range(summary.hours)} hours; unknown for ${summary.unknown.map(cell).join(', ') || 'none'}. Roles: ${Object.entries(summary.roles).map(([role,hours]) => `${cell(role)} ${range(hours)}`).join('; ') || 'unknown'}. Owner wait: ${range(summary.wait)} hours known; unknown for ${summary.unknownWait.map(cell).join(', ') || 'none'}. Owner touchpoints: ${summary.touchpoints} known; unknown for ${summary.unknownTouchpoints.map(cell).join(', ') || 'none'}.\n\nAssumptions: ${cell(m.assumptions)}. Reforecast: ${cell(m.reforecast)}. Sources: ${m.sourceRefs.map(r => `${cell(r.sourceId)} (${cell(r.locator)})`).join('; ')}.`;
  }).join('\n\n');
  const milestoneSection = milestoneView ? `\n## Milestone forecast\n\nWork is counted once per milestone; shared and incremental IDs compare with earlier milestones in listed order. Labor and owner wait are separate, not a calendar schedule.\n\n${milestoneView}\n` : '';
  const capacityTotal = capacity?.scope ? forecastWork(run,scopeWorkIds(run,capacity.scope)) : total;
  const knownEffort = total.unknown.length === run.work.length ? 'Total effort is unknown; no work has a labor estimate.' : `Known effort subtotal: ${range(total.hours)} hours${total.unknown.length ? '; total effort remains unknown' : ''}.`;
  const forecast = `${knownEffort} Unestimated work: ${total.unknown.join(', ') || 'none'}. This is a sum of unique work estimates, not a calendar or resource-levelled forecast. Include review, integration and recovery in disjoint work estimates.\n\n${capacity ? `Declared capacity: ${capacity.hours} hours during ${cell(capacity.period)}; scope: ${capacity.scope ? cell(capacity.scope.kind + ('id' in capacity.scope ? `:${capacity.scope.id}` : '')) : 'unscoped (historical)'}. ${!capacity.scope ? `${total.hours[1] > capacity.hours ? '**Known all-work high estimate is numerically above declared capacity. This signals an overrun only if scope and period align; compare the selected release before committing.** ' : ''}Capacity fit is unknown because capacity has no explicit scope.` : assessment.integrity.status !== 'pass' ? 'Capacity fit is unknown because the contract or a dependency is invalid.' : scopeMissingProducers(run,capacity.scope).length ? 'Capacity fit is unknown because outcome or criterion producers are missing from the scope.' : capacity.scope.kind === 'milestone' && milestoneMissingWork(run,capacity.scope.id).length ? 'Capacity fit is unknown because linked outcome work is outside the milestone.' : capacityTotal.unknown.length ? 'Capacity fit is unknown because work estimates are missing; do not treat the subtotal as the full workload.' : Object.keys(capacityTotal.roles).some(role => !capacity.roles.some(r => r.role === role)) ? 'Capacity fit is unknown because role availability is missing.' : `Scoped known labor is ${range(capacityTotal.hours)} hours; ${capacityTotal.hours[1] > capacity.hours ? 'the high estimate exceeds declared hours' : 'the labor subtotal is within declared hours'}, capacity fit and delivery timing remain unknown without role scheduling, dependencies and owner waiting. This is not a delivery-date commitment.`}\n\n| Role | Estimated hours | Declared hours |\n| --- | --- | --- |\n${Object.entries(capacityTotal.roles).map(([role, hours]) => `| ${cell(role)} | ${range(hours)} | ${capacity.roles.find(r => r.role === role)?.hours ?? 'unknown'} |`).join('\n')}\n\nOwner touchpoints: ${capacityTotal.touchpoints} known, capacity ${capacity.ownerTouchpoints ?? 'unknown'}; unknown for ${capacityTotal.unknownTouchpoints.join(', ') || 'none'}. ${capacity.scope ? `${Object.entries(capacityTotal.roles).filter(([role,hours]) => { const declared=capacity.roles.find(r => r.role===role); return declared && hours[1] > declared.hours; }).map(([role]) => `High estimate exceeds declared ${cell(role)} hours.`).join(' ')} ${capacity.ownerTouchpoints != null && capacityTotal.touchpoints > capacity.ownerTouchpoints ? 'Known owner touchpoints exceed declared capacity.' : ''}` : ''}` : 'Capacity and role availability are unknown; no delivery-date or fixed-fee feasibility claim is supported.'}\n`;

  const ownerTerms = run.requirements.filter(q => q.ownerSummary !== undefined).map(q => `| ${cell(q.id)} | ${literalCell(q.ownerSummary!)} | ${q.sourceRefs.map(s => `${cell(s.sourceId)} (${cell(s.locator)})`).join('; ')} | ${cell(q.criterionIds.join(', '))} | ${cell(q.releaseIds.join(', ') || 'none specified')} |`).join('\n');
  const owner = `${header}# Owner brief\n${notes}\nPlan reviewable: **${assessment.planReviewable.status}**. Plan reviewed: **${assessment.planReviewed.status}**. Proof accepted: **${assessment.proof.status}**.\n\nExecutable now: ${assessment.executableNow.join(', ') || 'none'}. Implementation detail review: ${run.policy.reviews.implementation ? `configured (${run.policy.reviews.implementation.join(', ')})` : 'not configured; scope review does not approve implementation details'}. Execution policy: ${run.policy.execution}; checkpoints: ${run.policy.checkpoints}. These results use actual host verification when configured.\n\n## Source-bound owner terms\n\nSummaries are source-review inputs, not proof of completeness or owner agreement. See the roadmap for all retained obligations.\n\n| Requirement | Owner term or uncertainty | Sources | Criteria | Releases |\n| --- | --- | --- | --- | --- |\n${ownerTerms || '| None recorded | Owner-relevant terms may remain unknown or omitted; inspect original sources. | — | — | — |'}\n\n## Decisions\n\n| Decision | Producer work | Status | Remaining checks |\n| --- | --- | --- | --- |\n${run.decisions.map(d => `| ${cell(d.id + ': ' + d.description)} | ${cell(d.producedBy.join(', ') || 'external input')} | ${assessment.decisions[d.id]?.status ?? 'unassessed'} | ${cell(assessment.decisions[d.id] ? reasons(assessment.decisions[d.id]) : 'unknown')} |`).join('\n')}\n\n## Resources and authority\n\n| Input | Target | Declared state (not proof) |\n| --- | --- | --- |\n${run.resources.map(r => `| ${cell(r.id + ': ' + r.description)} | ${cell(r.targetId)} | ${r.status} |`).join('\n')}\n\n## Forecast limits\n\n${forecast}\n`;
  const work = `${header}# Active work\n${notes}\n${run.activeWorkIds.map(id => { const w = run.work.find(w => w.id === id); const result = assessment.work[id]; return w ? `## ${cell(w.id)}: ${cell(w.title)}\n\nExecution: **${result?.executable.status ?? 'unassessed'}**. ${result ? reasons(result.executable) : 'Unknown work'}\n\nTargets: ${w.targetIds.join(', ')}. Action: ${w.action}.\nInputs: ${w.inputs.map(i => `${i.kind}:${i.id}`).join(', ') || 'none'}.\nOwned files: ${w.files.join(', ') || 'none'}.\n\n${w.instructions}\n\nAcceptance criteria: ${w.criterionIds.join(', ')}. Verification: ${result?.verified.status ?? 'unassessed'}.\n` : `Unknown work ${cell(id)}`; }).join('\n')}\nDeferred work: ${run.work.filter(w => !run.activeWorkIds.includes(w.id)).map(w => w.id).join(', ') || 'none'}. Deferred outcomes are not accepted by completing an active unit.\n`;
  return { runId: run.runId, revision: run.revision, fingerprint, assessment, files: {
    'ROADMAP.md': roadmap + milestoneSection + obligations, 'OWNER-BRIEF.md': owner + milestoneSection + '\nSource obligations and planning assumptions, including any retained milestone forecast: [Roadmap](ROADMAP.md#source-obligations-and-planning-assumptions).\n', 'WORK.md': work,
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
