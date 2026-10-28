/** Cross-artifact planning checks. No commands are executed and no files are changed. */
import * as fs from 'node:fs';
import * as path from 'node:path';
import { confined, sha256 } from './manifest.js';
import type { FileBinding, DeliveryStage } from './types.js';

export interface PlanningIssue { code: string; target: string; message: string }
export interface PlanningContext {
  projectRoot: string; runDirectory: string; stage: DeliveryStage;
  targetIds?: string[]; knownTargets?: string[]; required?: boolean;
  originalSources?: FileBinding[]; requirementIds?: string[];
  units?: { id: string; nodeIds?: string[]; filePaths: string[]; test?: string }[];
}
export interface PlanningReport { valid: boolean; assessed: boolean; issues: PlanningIssue[]; blockers: PlanningIssue[]; warnings: string[] }
type Row = Record<string, any>;
const object = (v: unknown): v is Row => !!v && typeof v === 'object' && !Array.isArray(v);
const text = (v: unknown): v is string => typeof v === 'string' && v.trim().length > 0 && v.length <= 2000;
const strings = (v: unknown): v is string[] => Array.isArray(v) && v.every(text);
const stages = ['plan', 'execute', 'advance', 'release'];
function shape(v: unknown, fields: string, required: string, label: string): asserts v is Row {
  if (!object(v) || Object.keys(v).some(k => !fields.split(' ').includes(k)) || required.split(' ').filter(Boolean).some(k => !(k in v))) throw new Error(`invalid ${label} fields`);
}
function rows(v: unknown, label: string): Row[] {
  if (!Array.isArray(v) || !v.every(r => object(r) && text(r.id)) || new Set(v.map(r => r.id)).size !== v.length) throw new Error(`invalid or duplicate ${label} IDs`);
  return v;
}
function binding(root: string, value: unknown): FileBinding {
  shape(value, 'path sha256', 'path sha256', 'file binding');
  if (!text(value.path) || typeof value.sha256 !== 'string' || !/^[a-f0-9]{64}$/.test(value.sha256)) throw new Error('invalid file binding');
  const bytes = fs.readFileSync(confined(root, value.path));
  if (!bytes.length || sha256(bytes) !== value.sha256) throw new Error(`stale or empty binding: ${value.path}`);
  return value as FileBinding;
}
function json(file: string): unknown { return JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(fs.readFileSync(file))); }
function paths(value: unknown, root: string): string[] {
  if (!strings(value)) throw new Error('expected relative path list');
  return value.map(p => path.relative(root, confined(root, p, false)).split(path.sep).join('/'));
}
/** Deliberately bounded glob vocabulary; unsupported configuration cannot claim assurance. */
export function matchesPlanningGlob(file: string, glob: string): boolean {
  if (/[\[\]{}!()\\]/.test(glob)) throw new Error(`unsupported runner glob ${glob}; expand braces and explicit excludes`);
  let re = '^';
  for (let i = 0; i < glob.length; i++) {
    const c = glob[i];
    if (c === '*' && glob[i + 1] === '*') { i++; if (glob[i + 1] === '/') { i++; re += '(?:.*/)?'; } else re += '.*'; }
    else if (c === '*') re += '[^/]*';
    else if (c === '?') re += '[^/]';
    else re += c.replace(/[.+^$|]/g, '\\$&');
  }
  return new RegExp(re + '$').test(file);
}

export function validatePlanningIntegrity(context: PlanningContext): PlanningReport {
  const report: PlanningReport = { valid: true, assessed: false, issues: [], blockers: [], warnings: [] };
  const add = (code: string, target: string, message: string, blocking = false) => {
    const item = { code, target, message }; if (blocking) report.blockers.push(item); else report.issues.push(item);
  };
  const selectedTargets = context.targetIds ? new Set(context.targetIds) : undefined;
  const knownTargets = new Set([...(context.knownTargets ?? []), ...(context.units ?? []).flatMap(u => [u.id, u.id.split('#')[0]])]);
  let rawContract: any;
  try {
    const p = path.join(context.runDirectory, 'planning-integrity.json');
    if (fs.existsSync(p)) rawContract = json(confined(context.runDirectory, 'planning-integrity.json'));
    if (Array.isArray(rawContract?.nodes)) {
      for (const n of rawContract.nodes) if (text(n.id)) knownTargets.add(n.id);
      for (const unit of context.units ?? []) {
        for (const id of unit.nodeIds ?? []) {
          if (!knownTargets.has(id)) add('PLANNING_NODE_UNKNOWN', unit.id, `Unknown planning node ${id}`);
          if (selectedTargets?.has(unit.id)) selectedTargets.add(id);
        }
      }
      // Required resources and reviews block their affected descendants, not unrelated work.
      for (let round = 0; round < rawContract.nodes.length; round++) for (const n of rawContract.nodes) {
        if (selectedTargets?.has(n.id) && strings(n.dependsOn)) for (const id of n.dependsOn) selectedTargets.add(id);
      }
    }
  } catch { /* Canonical parsing below reports the precise malformed-contract error. */ }
  if (knownTargets.size) for (const id of context.targetIds ?? []) if (!knownTargets.has(id)) add('PLANNING_TARGET_UNKNOWN', id, 'Requested validation scope is unknown; refusing an empty selection');
  const applicable = (targets: string[]) => targets.includes('*') || !selectedTargets || targets.some(id => selectedTargets.has(id));
  const reviewFile = path.join(context.runDirectory, 'review-findings.json');
  const contractFile = path.join(context.runDirectory, 'planning-integrity.json');
  if (!fs.existsSync(reviewFile) && context.required) add('REVIEW_REGISTER_MISSING', '*', 'Create the review register; absence is not a clean review.');
  if (fs.existsSync(reviewFile)) try {
    const r = json(confined(context.runDirectory, 'review-findings.json'));
    shape(r, 'schemaVersion reviewedInputs findings ownerDecisions', 'schemaVersion reviewedInputs findings ownerDecisions', 'review register');
    if (r.schemaVersion !== 1 || !Array.isArray(r.reviewedInputs) || !r.reviewedInputs.length) throw new Error('review register requires version 1 and reviewed inputs');
    for (const input of r.reviewedInputs) binding(context.projectRoot, input);
    for (const f of [...rows(r.findings, 'finding'), ...rows(r.ownerDecisions, 'owner decision')]) {
      const decision = r.ownerDecisions.includes(f);
      shape(f, 'id source severity status targets blocks closure resolution', `id source status targets blocks${decision ? '' : ' severity'}`, 'finding/decision');
      binding(context.projectRoot, f.source);
      if (!strings(f.targets) || !f.targets.length || !strings(f.blocks) || !f.blocks.length || f.blocks.some((s: string) => !stages.includes(s)) || ![...(decision ? ['open', 'decided'] : ['open', 'resolved'])].includes(f.status) || !decision && !['P0', 'P1', 'P2', 'P3'].includes(f.severity)) throw new Error(`invalid finding/decision ${f.id}`);
      if (knownTargets.size && f.targets.some((t: string) => t !== '*' && !knownTargets.has(t))) throw new Error(`unknown affected target in ${f.id}`);
      if (f.status !== 'open') binding(context.projectRoot, decision ? f.resolution : f.closure);
      if (f.status === 'open' && (decision || ['P0', 'P1'].includes(f.severity))) {
        const code = decision ? 'OWNER_DECISION_OPEN' : 'REVIEW_FINDING_OPEN';
        const item = { code, target: f.id, message: `${f.id} blocks ${f.blocks.join(', ')} for ${f.targets.join(', ')}` };
        report.blockers.push(item);
        if (f.blocks.includes(context.stage) && applicable(f.targets)) report.issues.push(item);
      }
    }
  } catch (e) { add('REVIEW_REGISTER_INVALID', '*', String(e)); }
  const legacyDecisions = path.join(context.runDirectory, 'owner-decisions.md');
  if (fs.existsSync(legacyDecisions)) try {
    const body = new TextDecoder('utf-8', { fatal: true }).decode(fs.readFileSync(confined(context.runDirectory, 'owner-decisions.md')));
    const sections = body.split(/^##\s+/m).slice(1);
    if (!sections.length && /needs-owner|D-\d{3}/.test(body)) throw new Error('cannot parse legacy owner decision register');
    for (const section of sections) {
      const id = section.match(/^(D-\d+)\b/)?.[1]; if (!id) continue;
      const field = (name: string) => section.match(new RegExp(`^[-*]\\s+\\*\\*${name}:?\\*\\*:?\\s*(.+)$`, 'mi'))?.[1]?.trim();
      const status = field('Status');
      if (!['open','decided'].includes(status ?? '')) throw new Error(`invalid status ${id}`);
      if (status === 'open') {
        const unblocks = field('Unblocks'); if (!unblocks) throw new Error(`missing affected scope ${id}`);
        const targets = [...unblocks.matchAll(/(?:tasks|remediation)-[\w-]+\.md/g)].map(m => m[0]);
        const item = { code: 'OWNER_DECISION_OPEN', target: id, message: `Legacy owner decision ${id} remains open: ${unblocks}` }; report.blockers.push(item);
        if (context.stage !== 'plan' && (!selectedTargets || !targets.length || targets.some(t => [...selectedTargets].some(id => id === t || id.startsWith(t + '#'))))) report.issues.push(item);
      }
    }
  } catch (e) { add('OWNER_REGISTER_INVALID', '*', String(e)); }
  // A legacy Markdown register cannot be silently ignored or interpreted as permission.
  if (fs.existsSync(path.join(context.runDirectory, 'review-findings.md'))) add('REVIEW_REGISTER_MIGRATION_REQUIRED', '*', 'Retain the Markdown review and migrate its findings to review-findings.json before readiness.');
  if (!fs.existsSync(contractFile)) {
    if (context.required) add('PLANNING_CONTRACT_MISSING', '*', 'Version 2 runs require planning-integrity.json.');
    else report.warnings.push('Legacy planning contract is unassessed; no milestone/source/runner/capacity assurance.');
    report.valid = report.issues.length === 0; return report;
  }
  try {
    const c = rawContract ?? json(confined(context.runDirectory, 'planning-integrity.json'));
    shape(c, 'schemaVersion sources clauses facts conflicts nodes milestones runners checks variants capacity releaseScopes', 'schemaVersion sources clauses facts conflicts nodes milestones runners checks variants capacity', 'planning contract');
    if (c.schemaVersion !== 1) throw new Error('unsupported planning contract version');
    const sources = rows(c.sources, 'source'); const clauses = rows(c.clauses, 'clause'); const facts = rows(c.facts, 'fact');
    const conflicts = rows(c.conflicts, 'conflict'); const nodes = rows(c.nodes, 'node'); const milestones = rows(c.milestones, 'milestone');
    const runners = rows(c.runners, 'runner'); const checks = rows(c.checks, 'check'); const variants = rows(c.variants, 'variant');
    for (const s of sources) {
      shape(s, 'id binding status authority', 'id binding status authority', 'source'); binding(context.projectRoot, s.binding);
      if (!['inspected', 'partial', 'unread'].includes(s.status) || !text(s.authority)) throw new Error(`invalid source ${s.id}`);
      if (s.status !== 'inspected') add('SOURCE_COVERAGE_UNKNOWN', s.id, `${s.status} source cannot support full-corpus assurance`);
    }
    for (const s of context.originalSources ?? []) if (!sources.some(row => row.binding.path === s.path && row.binding.sha256 === s.sha256)) add('SOURCE_INVENTORY_MISSING', s.path, 'Original source omitted from intake inventory');
    for (const clause of clauses) {
      shape(clause, 'id sourceId locator requirementIds disposition successor', 'id sourceId locator requirementIds disposition', 'clause');
      if (!sources.some(s => s.id === clause.sourceId) || !text(clause.locator) || !strings(clause.requirementIds) || !['required', 'excluded', 'duplicate', 'superseded', 'unresolved'].includes(clause.disposition)) throw new Error(`invalid clause ${clause.id}`);
      if (clause.disposition === 'unresolved' || clause.disposition === 'required' && !clause.requirementIds.length) add('SOURCE_DISPOSITION_MISSING', clause.id, 'Every obligation needs an explicit disposition and exact requirement mapping');
      const seen = new Set<string>([clause.id]); let at = clause;
      while (['duplicate', 'superseded'].includes(at.disposition)) {
        const next = clauses.find(row => row.id === at.successor);
        if (!next || seen.has(next.id)) { add('SOURCE_DISPOSITION_INVALID', clause.id, 'Missing or cyclic disposition successor'); break; }
        seen.add(next.id); at = next;
      }
    }
    for (const id of context.requirementIds ?? []) if (!clauses.some(row => row.disposition === 'required' && row.requirementIds.includes(id))) add('SOURCE_REQUIREMENT_UNMAPPED', id, 'Requirement lacks source clause disposition');
    for (const f of facts) {
      shape(f, 'id clauseId key value', 'id clauseId key value', 'source fact');
      if (!clauses.some(row => row.id === f.clauseId) || !text(f.key) || !text(f.value)) throw new Error(`invalid source fact ${f.id}`);
      const peers = facts.filter(p => p.key === f.key && p.value !== f.value);
      for (const peer of peers) if (!conflicts.some(x => x.factIds?.includes(f.id) && x.factIds?.includes(peer.id))) add('SOURCE_CONFLICT_UNREGISTERED', f.key, `Conflicting ${f.id} and ${peer.id} need a recorded resolution`);
    }
    for (const conflict of conflicts) {
      shape(conflict, 'id factIds status resolution targets', 'id factIds status targets', 'conflict');
      if (!strings(conflict.factIds) || conflict.factIds.length < 2 || conflict.factIds.some((id: string) => !facts.some(f => f.id === id)) || !['open', 'resolved'].includes(conflict.status) || !strings(conflict.targets) || !conflict.targets.length) throw new Error(`invalid conflict ${conflict.id}`);
      if (knownTargets.size && conflict.targets.some((id: string) => id !== '*' && !knownTargets.has(id))) add('SOURCE_CONFLICT_TARGET_UNKNOWN', conflict.id, 'Conflict names an unknown affected target; refusing an unscoped contradiction');
      if (conflict.status === 'resolved') binding(context.projectRoot, conflict.resolution);
      else { add('SOURCE_CONFLICT_OPEN', conflict.id, 'Commercial/source contradiction requires authorized resolution', true); if (context.stage !== 'plan' && applicable(conflict.targets)) add('SOURCE_CONFLICT_OPEN', conflict.id, 'Affected execution is blocked by unresolved source conflict'); }
    }
    const byId = new Map(nodes.map(n => [n.id, n]));
    const ancestors = (id: string, seen = new Set<string>()): Set<string> => {
      if (seen.has(id)) throw new Error(`cyclic dependency ${id}`);
      const n = byId.get(id); if (!n) throw new Error(`unknown dependency ${id}`);
      const result = new Set<string>(); const next = new Set([...seen, id]);
      for (const dep of n.dependsOn) { result.add(dep); for (const ancestor of ancestors(dep, next)) result.add(ancestor); }
      return result;
    };
    for (const n of nodes) {
      shape(n, 'id stage kind dependsOn provides consumes visual reviewFor origin originRef risk riskReason acceptance effortHours releaseScope', 'id stage kind dependsOn provides consumes visual reviewFor origin originRef risk riskReason acceptance', 'node');
      if (!Number.isInteger(n.stage) || n.stage < 0 || !['work','review','decision','resource','acceptance'].includes(n.kind) || !strings(n.dependsOn) || !strings(n.provides) || !strings(n.consumes) || !strings(n.reviewFor) || typeof n.visual !== 'boolean' || !['required','added'].includes(n.origin) || !text(n.originRef) || !['low','medium','high'].includes(n.risk) || !text(n.riskReason) || !text(n.acceptance)) throw new Error(`invalid node ${n.id}; explicit origin, risk and acceptance required`);
      if (n.effortHours !== undefined && (!Array.isArray(n.effortHours) || n.effortHours.length !== 2 || !n.effortHours.every((v: unknown) => typeof v === 'number' && v >= 0 && Number.isFinite(v)) || n.effortHours[0] > n.effortHours[1])) throw new Error(`invalid effort range ${n.id}`);
    }
    for (const n of nodes) {
      if (!clauses.some(clause => clause.id === n.originRef) && !sources.some(source => source.binding.path === n.originRef)) add('WORK_ORIGIN_UNKNOWN', n.id, 'Work must reference an inventoried source or clause, including approved additions');
      for (const id of n.reviewFor) if (!byId.has(id)) add('REVIEW_TARGET_UNKNOWN', n.id, `Unknown review target ${id}`);
      if (n.risk === 'low' && n.provides.some((p: string) => ['tenant-isolation','account-deletion','destructive-action','production-deployment'].includes(p))) add('RISK_UNDERCLASSIFIED', n.id, 'Consequential capability requires medium/high risk and explicit review');
      const deps = ancestors(n.id);
      for (const dep of deps) if (byId.get(dep)!.stage > n.stage) add('PREREQUISITE_LATE', n.id, `${dep} is later than consumer ${n.id}`);
      for (const capability of n.consumes) if (!nodes.some(p => p.provides.includes(capability) && deps.has(p.id) && p.stage <= n.stage)) add('PREREQUISITE_MISSING', n.id, `No prior declared producer for ${capability}`);
      for (const dep of n.dependsOn) {
        const review = byId.get(dep)!;
        if (review.kind === 'review' && review.visual && (!n.visual || !review.reviewFor.includes(n.id))) add('REVIEW_DEPENDENCY_OVERBROAD', n.id, `Visual review ${dep} does not apply to this work`);
      }
      for (const review of nodes.filter(r => r.kind === 'review' && r.visual && r.reviewFor.includes(n.id))) if (!deps.has(review.id)) add('REVIEW_DEPENDENCY_MISSING', n.id, `Dependent screen requires representative review ${review.id}`);
    }
    for (const milestone of milestones) {
      shape(milestone, 'id stage requires acceptanceNodeId evidenceIds payment releaseScope', 'id stage requires acceptanceNodeId evidenceIds', 'milestone');
      if (!Number.isInteger(milestone.stage) || !strings(milestone.requires) || !strings(milestone.evidenceIds)) throw new Error(`invalid milestone ${milestone.id}`);
      if (milestone.payment !== undefined) {
        shape(milestone.payment, 'amount currency sourceRef', 'amount currency sourceRef', 'milestone payment');
        if (typeof milestone.payment.amount !== 'number' || !Number.isFinite(milestone.payment.amount) || milestone.payment.amount < 0 || !text(milestone.payment.currency) || !text(milestone.payment.sourceRef)) throw new Error(`invalid payment trigger ${milestone.id}`);
      }
      const acceptance = byId.get(milestone.acceptanceNodeId);
      if (!acceptance || acceptance.kind !== 'acceptance' || acceptance.stage > milestone.stage) add('ACCEPTANCE_DEFINED_LATE', milestone.id, 'Acceptance must be defined before milestone implementation');
      for (const capability of milestone.requires) if (!nodes.some(n => n.provides.includes(capability) && n.stage <= milestone.stage && [...ancestors(n.id)].every(id => byId.get(id)!.stage <= milestone.stage))) add('MILESTONE_NOT_CLOSED', milestone.id, `No complete prerequisite path for ${capability}${milestone.payment ? '; payment-trigger deliverable' : ''}`);
      for (const id of milestone.evidenceIds) if (!checks.some(check => check.id === id && byId.get(check.nodeId)?.stage <= milestone.stage)) add('MILESTONE_EVIDENCE_LATE', milestone.id, `Missing or late evidence producer ${id}`);
      if (!milestone.evidenceIds.some((id: string) => checks.some(check => check.id === id && check.kind === 'build'))) add('BUILD_BOUNDARY_MISSING', milestone.id, 'Usable/milestone/release boundary requires actual build evidence');
    }
    // Release trains: the base contract and each change order carry their own milestones and payments.
    const releaseScopes = c.releaseScopes === undefined ? undefined : rows(c.releaseScopes, 'release scope');
    for (const scope of releaseScopes ?? []) {
      shape(scope, 'id kind sourceRef status price decision', 'id kind sourceRef', 'release scope');
      if (!['base-contract', 'change-order'].includes(scope.kind) || !text(scope.sourceRef)) throw new Error(`invalid release scope ${scope.id}`);
      if (scope.kind === 'base-contract' && ['status', 'price', 'decision'].some(k => k in scope)) throw new Error(`base-contract scope ${scope.id} takes no change-order status, price or decision`);
      if (scope.kind === 'change-order') {
        if (!['proposed', 'approved', 'rejected'].includes(scope.status)) throw new Error(`invalid change-order status ${scope.id}`);
        if (scope.price !== undefined) { shape(scope.price, 'amount currency sourceRef', 'amount currency sourceRef', 'change-order price'); if (typeof scope.price.amount !== 'number' || !Number.isFinite(scope.price.amount) || scope.price.amount < 0 || !text(scope.price.currency) || !text(scope.price.sourceRef)) throw new Error(`invalid change-order price ${scope.id}`); }
        if (scope.status === 'approved') { binding(context.projectRoot, scope.decision); if (scope.price === undefined) add('RELEASE_SCOPE_UNPRICED', scope.id, 'Approved change order lacks its agreed price'); }
      }
      if (!clauses.some(clause => clause.id === scope.sourceRef) && !sources.some(source => source.binding.path === scope.sourceRef)) add('RELEASE_SCOPE_ORIGIN_UNKNOWN', scope.id, 'Release scope must reference an inventoried source or clause');
    }
    if (releaseScopes && releaseScopes.filter(scope => scope.kind === 'base-contract').length !== 1) throw new Error('release scopes require exactly one base-contract scope');
    const baseScope = releaseScopes?.find(scope => scope.kind === 'base-contract');
    const scopeOf = (row: Row) => releaseScopes?.find(scope => scope.id === (row.releaseScope ?? baseScope!.id));
    for (const row of [...nodes, ...milestones]) {
      if (row.releaseScope !== undefined && !scopeOf(row)) add('RELEASE_SCOPE_UNKNOWN', row.id, `Unknown release scope ${row.releaseScope}`);
      else if (releaseScopes && row.origin === 'added' && row.releaseScope === undefined) add('RELEASE_SCOPE_UNASSIGNED', row.id, 'Added work must name the base contract or the change order that covers it');
    }
    // Without declared scopes, added work has no proven price or approval inside the base contract.
    const settled = (scope?: Row) => !!scope && (scope.kind === 'base-contract' || scope.status === 'approved' && scope.price !== undefined);
    const unsettled = (id: string) => { const n = byId.get(id)!; return releaseScopes ? !settled(scopeOf(n)) : n.origin === 'added'; };
    for (const milestone of milestones) {
      const scope = releaseScopes ? scopeOf(milestone) : undefined;
      if (milestone.payment !== undefined && scope?.kind === 'change-order' && !settled(scope)) add('RELEASE_SCOPE_UNPRICED', milestone.id, `Payment needs change order ${scope.id} approved and priced`);
      if (milestone.payment === undefined || releaseScopes && scope?.kind !== 'base-contract') continue;
      const coupled = (nodeIds: string[]) => [...new Set(nodeIds.flatMap(id => byId.has(id) ? [id, ...ancestors(id)] : []))].filter(unsettled);
      const what = releaseScopes ? 'unapproved or unpriced change-order work' : 'added work with no declared release scope';
      for (const capability of milestone.requires) {
        const paths = nodes.filter(n => n.provides.includes(capability) && n.stage <= milestone.stage && [...ancestors(n.id)].every(id => byId.get(id)!.stage <= milestone.stage)).map(n => coupled([n.id]));
        if (paths.length && paths.every(p => p.length)) add('RELEASE_TRAIN_COUPLED', milestone.id, `Base-contract payment requires ${capability}, which depends on ${what}: ${[...new Set(paths.flat())].join(', ')}`);
      }
      for (const id of milestone.evidenceIds) {
        const check = checks.find(row => row.id === id); const nodeIds = check ? coupled([check.nodeId]) : [];
        if (nodeIds.length) add('RELEASE_TRAIN_COUPLED', milestone.id, `Base-contract payment evidence ${id} depends on ${what}: ${nodeIds.join(', ')}`);
      }
    }
    for (const runner of runners) {
      shape(runner, 'id root include exclude configBindings environment bootstrapPaths resultFormat', 'id root include exclude configBindings environment bootstrapPaths', 'runner');
      if (!text(runner.root) || !strings(runner.include) || !runner.include.length || !strings(runner.exclude) || !Array.isArray(runner.configBindings) || !runner.configBindings.length || !text(runner.environment)) throw new Error(`invalid runner ${runner.id}`);
      confined(context.projectRoot, runner.root, false); paths(runner.bootstrapPaths, context.projectRoot);
      for (const config of runner.configBindings) binding(context.projectRoot, config);
    }
    for (const check of checks) {
      shape(check, 'id nodeId unitId kind command runnerId targets requiredFiles collection environment bootstrapPaths receipt', 'id nodeId kind command targets requiredFiles collection environment bootstrapPaths', 'evidence check');
      if (!byId.has(check.nodeId) || !['unit','integration','build','manual','operation','review'].includes(check.kind) || !text(check.command) || !['substantive','scaffold'].includes(check.collection) || !text(check.environment)) throw new Error(`invalid check ${check.id}`);
      const targets = paths(check.targets, context.projectRoot); const requiredFiles = paths(check.requiredFiles, context.projectRoot); const bootstrap = paths(check.bootstrapPaths, context.projectRoot);
      const unit = context.units?.find(u => u.id === check.unitId);
      if (check.unitId && context.units && !unit) add('EVIDENCE_UNIT_UNKNOWN', check.id, 'Evidence references no executable unit');
      if (unit) for (const file of new Set([...targets, ...requiredFiles, ...bootstrap])) if (!paths(unit.filePaths, context.projectRoot).includes(file)) add('ARTIFACT_UNDECLARED', check.id, `${file} must appear in the canonical unit File declaration`);
      if (['unit','integration'].includes(check.kind)) {
        const runner = runners.find(r => r.id === check.runnerId);
        if (!runner || !targets.length) add('EVIDENCE_RUNNER_UNKNOWN', check.id, 'Declare runner and concrete test targets');
        else {
          for (const file of targets) {
            const relative = path.posix.relative(runner.root, file);
            if (!runner.include.some((g: string) => matchesPlanningGlob(relative, g)) || runner.exclude.some((g: string) => matchesPlanningGlob(relative, g))) add('EVIDENCE_TARGET_EXCLUDED', check.id, `${file} is not collected by ${runner.id}`);
          }
          if (check.environment !== runner.environment || check.kind === 'integration' && !['real-local','real-staging'].includes(check.environment)) add('EVIDENCE_ENVIRONMENT_MISMATCH', check.id, 'Integration needs its real isolated environment, not unit mocks');
          if (check.kind === 'integration' && (!bootstrap.length || bootstrap.some(p => !runner.bootstrapPaths.includes(p)))) add('EVIDENCE_BOOTSTRAP_MISSING', check.id, 'Initialize integration environment before importing production composition');
        }
        if (check.collection === 'substantive' && /--passWithNoTests\b/.test(check.command)) add('EVIDENCE_EMPTY_ALLOWED', check.id, 'Substantive evidence cannot allow zero collected tests');
      }
      if (check.collection === 'scaffold' && milestones.some(m => m.evidenceIds.includes(check.id))) add('EVIDENCE_SCAFFOLD_NOT_ACCEPTANCE', check.id, 'An empty scaffold check cannot satisfy milestone acceptance');
      if (check.kind === 'build' && !/(?:\bbuild\b|\bcompile-production\b)/.test(check.command)) add('BUILD_BOUNDARY_MISSING', check.id, 'Typecheck is not an actual production build');
      if (check.receipt && !(context.stage === 'release' && selectedTargets && !selectedTargets.has(check.nodeId))) {
        shape(check.receipt, 'artifact inputs exitCode collected environment', 'artifact inputs exitCode collected environment', 'evidence receipt');
        binding(context.projectRoot, check.receipt.artifact);
        if (['unit','integration'].includes(check.kind)) {
          const runner = runners.find(r => r.id === check.runnerId);
          const bytes = fs.readFileSync(confined(context.projectRoot, check.receipt.artifact.path), 'utf8');
          let collected: number; let passed: boolean;
          if (!runner?.resultFormat || runner.resultFormat === 'vitest-json') {
            const result = JSON.parse(bytes);
            if (!Number.isInteger(result.numTotalTests) || result.numTotalTests < 0 || typeof result.success !== 'boolean') throw new Error(`invalid Vitest result ${check.id}`);
            collected = result.numTotalTests; passed = result.success;
          } else if (runner.resultFormat === 'junit') {
            const header = bytes.match(/<testsuites?\b([^>]*)>/);
            if (!header) throw new Error(`invalid JUnit result ${check.id}`);
            const count = (name: string) => { const match = header[1].match(new RegExp(`\\b${name}=["'](\\d+)["']`)); return match ? Number(match[1]) : NaN; };
            collected = count('tests'); passed = count('failures') === 0 && count('errors') === 0;
            if (!Number.isInteger(collected)) throw new Error(`JUnit result has no test count ${check.id}`);
          } else throw new Error(`unsupported result format ${runner.resultFormat}`);
          if (check.collection === 'substantive' && collected < 1) add('EVIDENCE_EMPTY', check.id, 'Retained runner result collected zero tests');
          if (!passed) add('EVIDENCE_FAILED', check.id, 'Retained runner result reports failure');
          if (collected !== check.receipt.collected || passed !== (check.receipt.exitCode === 0)) add('EVIDENCE_RESULT_MISMATCH', check.id, 'Receipt disagrees with retained runner result');
        }

        if (!Array.isArray(check.receipt.inputs) || !check.receipt.inputs.length) throw new Error(`receipt inputs missing ${check.id}`);
        try { for (const input of check.receipt.inputs) binding(context.projectRoot, input); } catch (e) { add('EVIDENCE_STALE', check.id, String(e)); }
        const runnerInputs = runners.find(r => r.id === check.runnerId)?.configBindings.map((b: FileBinding) => b.path) ?? [];
        for (const p of new Set([...targets, ...requiredFiles, ...bootstrap, ...runnerInputs, ...(unit?.filePaths ?? [])])) if (!check.receipt.inputs.some((b: FileBinding) => b.path === p)) add('EVIDENCE_INPUT_UNBOUND', check.id, `Receipt does not bind covered input ${p}`);
        if (check.receipt.exitCode !== 0) add('EVIDENCE_FAILED', check.id, 'Evidence command failed');
        if (['unit','integration'].includes(check.kind) && check.collection === 'substantive' && (!Number.isInteger(check.receipt.collected) || check.receipt.collected < 1)) add('EVIDENCE_EMPTY', check.id, 'No substantive tests collected');
        if (check.receipt.environment !== check.environment) add('EVIDENCE_ENVIRONMENT_MISMATCH', check.id, 'Receipt does not prove the required environment');
      } else if (['advance','release'].includes(context.stage) && (!selectedTargets || selectedTargets.has(check.nodeId))) add('EVIDENCE_NOT_RUN', check.id, 'Planned command is not runtime evidence');
    }
    for (const variant of variants) {
      shape(variant, 'id selected decision obligations', 'id selected decision obligations', 'scope variant');
      if (typeof variant.selected !== 'boolean' || !Array.isArray(variant.obligations) || !variant.obligations.length) throw new Error(`invalid variant ${variant.id}`);
      // Every declared alternative is checked before activation; selection requires authorization.
      if (variant.selected) binding(context.projectRoot, variant.decision);
      for (const obligation of variant.obligations) {
        shape(obligation, 'requirementId nodeIds evidenceIds', 'requirementId nodeIds evidenceIds', 'variant obligation');
        if (!text(obligation.requirementId) || !strings(obligation.nodeIds) || !strings(obligation.evidenceIds)) throw new Error('invalid variant obligation');
        if (context.requirementIds && !context.requirementIds.includes(obligation.requirementId)) add('VARIANT_REQUIREMENT_UNKNOWN', variant.id, `Unknown retained requirement ${obligation.requirementId}`);
        if (!obligation.nodeIds.length || !obligation.evidenceIds.length || obligation.nodeIds.some((id: string) => !byId.has(id)) || obligation.evidenceIds.some((id: string) => !checks.some(check => check.id === id && obligation.nodeIds.includes(check.nodeId)))) add('VARIANT_OBLIGATION_UNSATISFIED', variant.id, `No achievable evidence for retained obligation ${obligation.requirementId}`);
      }
    }
    const capacity = c.capacity; shape(capacity, 'hours reserveHours nodeIds disposition decision', 'hours reserveHours nodeIds disposition', 'capacity');
    if (!(capacity.hours === null || typeof capacity.hours === 'number' && Number.isFinite(capacity.hours) && capacity.hours >= 0) || typeof capacity.reserveHours !== 'number' || !Number.isFinite(capacity.reserveHours) || capacity.reserveHours < 0 || !strings(capacity.nodeIds) || new Set(capacity.nodeIds).size !== capacity.nodeIds.length || capacity.nodeIds.some((id: string) => !byId.has(id)) || !['committed','provisional','change-request'].includes(capacity.disposition)) throw new Error('invalid capacity envelope');
    const missing = nodes.filter(n => n.kind === 'work' && !capacity.nodeIds.includes(n.id));
    const estimated = capacity.nodeIds.map((id: string) => byId.get(id)!);
    if (capacity.hours === null || missing.length || estimated.some((n: Row) => !n.effortHours)) {
      const msg = 'Unknown/missing work estimates; no fixed-envelope feasibility claim';
      if (capacity.disposition === 'committed') add('CAPACITY_UNKNOWN', '*', msg); else report.warnings.push(msg);
    } else {
      const high = estimated.reduce((sum: number, n: Row) => sum + n.effortHours[1], capacity.reserveHours);
      if (high > capacity.hours) { if (capacity.disposition === 'committed') add('CAPACITY_EXCEEDED', '*', `${high} hours exceeds ${capacity.hours}`); else report.warnings.push(`Capacity exceeds envelope: ${high} > ${capacity.hours}; ${capacity.disposition}`); }
    }
    if (capacity.disposition === 'change-request' && context.stage !== 'plan') {
      if (!capacity.decision) add('CAPACITY_APPROVAL_PENDING', '*', 'Affected commitment requires the change-order decision'); else binding(context.projectRoot, capacity.decision);
    }
    report.assessed = true;
  } catch (e) { add('PLANNING_CONTRACT_INVALID', '*', String(e)); }
  report.valid = report.issues.length === 0; return report;
}
