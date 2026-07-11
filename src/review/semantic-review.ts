import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

export const SEMANTIC_REVIEW_DIMENSIONS = [
  'intent-fidelity',
  'implementation-correctness',
  'functional-validation',
  'integration-composition',
  'adversarial-edge-cases',
  'evidence-quality',
  'user-outcome',
] as const;

export const SEMANTIC_FINDING_SEVERITIES = [
  'critical',
  'high',
  'medium',
  'low',
  'info',
] as const;

export const SEMANTIC_FINDING_DISPOSITIONS = [
  'open',
  'resolved',
  'accepted-risk',
  'false-positive',
] as const;

export const SEMANTIC_COMPLETION_DECISIONS = [
  'verified_complete',
  'partial',
  'blocked',
  'remediation_required',
] as const;

export type SemanticReviewDimension = (typeof SEMANTIC_REVIEW_DIMENSIONS)[number];
export type SemanticFindingSeverity = (typeof SEMANTIC_FINDING_SEVERITIES)[number];
export type SemanticFindingDisposition = (typeof SEMANTIC_FINDING_DISPOSITIONS)[number];
export type SemanticCompletionDecision = (typeof SEMANTIC_COMPLETION_DECISIONS)[number];

export interface SemanticEvidenceReference {
  kind: 'code' | 'test' | 'runtime' | 'artifact' | 'manual' | 'external' | 'review';
  source: string;
  locator?: string;
  outcome: 'pass' | 'fail' | 'inconclusive';
}

export interface SemanticFinding {
  findingId: string;
  dimension: SemanticReviewDimension;
  severity: SemanticFindingSeverity;
  disposition: SemanticFindingDisposition;
  claim: string;
  expectedBehavior: string;
  observedBehavior: string;
  evidence: SemanticEvidenceReference[];
  requirementIds: string[];
  taskIds: string[];
  confidence: number;
  validationNeeded: string;
  recommendedAction: string;
  remediationRequired: boolean;
}

export interface SemanticReviewerContext {
  reviewerId: string;
  contextId: string;
  promptFile: string;
  independentContext: boolean;
  implementationNarrativeReceived: boolean;
}

export interface FunctionalValidationScenario {
  scenarioId: string;
  requirementIds: string[];
  evidenceLevel: string;
  commandOrProcedure: string;
  expectedBehavior: string;
  observedBehavior: string;
  outcome: 'pass' | 'fail' | 'blocked' | 'not-run';
  evidence: SemanticEvidenceReference[];
}

export interface SemanticDimensionReview {
  schemaVersion: 1;
  reviewId: string;
  dimension: SemanticReviewDimension;
  sourceRevision: string;
  reviewedAt: string;
  reviewer: SemanticReviewerContext;
  scope: {
    requirementIds: string[];
    taskIds: string[];
    files: string[];
  };
  claimsReviewed: string[];
  validationScenarios: FunctionalValidationScenario[];
  findings: SemanticFinding[];
  verdict: 'pass' | 'fail' | 'inconclusive';
}

export interface SemanticReviewDisagreement {
  disagreementId: string;
  findingIds: string[];
  perspectives: string[];
  resolution: string;
  rationale: string;
  dissentPreserved: boolean;
}

export interface SemanticReviewSynthesis {
  schemaVersion: 1;
  synthesisId: string;
  sourceRevision: string;
  synthesizedAt: string;
  includedReviewIds: string[];
  canonicalFindings: SemanticFinding[];
  disagreements: SemanticReviewDisagreement[];
  unresolvedFindingIds: string[];
  blockingFindingIds: string[];
  resolvedFindingIds: string[];
  completionRecommendation: SemanticCompletionDecision;
  rationale: string;
  evidence: SemanticEvidenceReference[];
}

export interface SemanticCompletionGate {
  id: string;
  status: 'pass' | 'fail' | 'not_applicable';
  evidence: string[];
}

export interface SemanticCompletionChallenge {
  schemaVersion: 1;
  decisionId: string;
  sourceRevision: string;
  decidedAt: string;
  challenger: SemanticReviewerContext;
  decision: SemanticCompletionDecision;
  mechanicalGates: SemanticCompletionGate[];
  semanticReviewPassed: boolean;
  functionalValidationPassed: boolean;
  unresolvedFindingIds: string[];
  nextTask: string | null;
  rationale: string;
  evidence: SemanticEvidenceReference[];
}

export interface SemanticReviewBundle {
  reports: SemanticDimensionReview[];
  synthesis?: SemanticReviewSynthesis;
  completionDecision?: SemanticCompletionChallenge;
  remediationPlan?: string;
  loadIssues?: SemanticReviewValidationIssue[];
}

export interface SemanticReviewValidationIssue {
  code: string;
  message: string;
  artifact?: string;
  findingId?: string;
}

export interface SemanticReviewValidationReport {
  schemaVersion: 1;
  generatedBy: 'src/review/semantic-review.ts';
  status: 'pass' | 'remediation-required' | 'invalid';
  valid: boolean;
  completionAllowed: boolean;
  decision: SemanticCompletionDecision | null;
  sourceRevision: string | null;
  reportCount: number;
  findingCount: number;
  unresolvedFindingIds: string[];
  blockingFindingIds: string[];
  issues: SemanticReviewValidationIssue[];
}

export const SEMANTIC_REVIEW_REPORT_FILES: Record<SemanticReviewDimension, string> = {
  'intent-fidelity': 'intent-fidelity-report.json',
  'implementation-correctness': 'implementation-review.json',
  'functional-validation': 'functional-validation-report.json',
  'integration-composition': 'integration-review.json',
  'adversarial-edge-cases': 'adversarial-review.json',
  'evidence-quality': 'evidence-audit.json',
  'user-outcome': 'user-outcome-review.json',
};

const BLOCKING_SEVERITIES = new Set<SemanticFindingSeverity>(['critical', 'high']);
const DECISIONS = new Set<string>(SEMANTIC_COMPLETION_DECISIONS);
const DIMENSIONS = new Set<string>(SEMANTIC_REVIEW_DIMENSIONS);
const SEVERITIES = new Set<string>(SEMANTIC_FINDING_SEVERITIES);
const DISPOSITIONS = new Set<string>(SEMANTIC_FINDING_DISPOSITIONS);
const EVIDENCE_KINDS = new Set<string>(['code', 'test', 'runtime', 'artifact', 'manual', 'external', 'review']);

export function validateSemanticReviewBundle(
  bundle: SemanticReviewBundle,
): SemanticReviewValidationReport {
  const issues: SemanticReviewValidationIssue[] = [...(bundle.loadIssues ?? [])];
  const reportsByDimension = new Map<string, SemanticDimensionReview[]>();
  const reviewIds = new Set<string>();
  const contextIds = new Set<string>();
  const reviewerIds = new Set<string>();
  const revisions = new Set<string>();
  const sourceFindings = new Map<string, SemanticFinding>();
  let independentCount = 0;
  let blindCount = 0;

  for (const report of bundle.reports) {
    const entries = reportsByDimension.get(report.dimension) ?? [];
    entries.push(report);
    reportsByDimension.set(report.dimension, entries);
    validateDimensionReport(report, issues, reviewIds, contextIds, reviewerIds, revisions, sourceFindings);
    if (report.reviewer?.independentContext) independentCount += 1;
    if (report.reviewer?.implementationNarrativeReceived === false) blindCount += 1;
  }

  for (const dimension of SEMANTIC_REVIEW_DIMENSIONS) {
    const reports = reportsByDimension.get(dimension) ?? [];
    if (reports.length === 0) {
      addIssue(issues, 'missing-dimension-report', `Missing required ${dimension} report.`, SEMANTIC_REVIEW_REPORT_FILES[dimension]);
    } else if (reports.length > 1) {
      addIssue(issues, 'duplicate-dimension-report', `Multiple ${dimension} reports are present.`, SEMANTIC_REVIEW_REPORT_FILES[dimension]);
    }
  }

  if (independentCount !== SEMANTIC_REVIEW_DIMENSIONS.length) {
    addIssue(issues, 'reviewer-independence-missing', 'Every dimension report must use an independent context.');
  }
  if (contextIds.size !== bundle.reports.length) {
    addIssue(issues, 'review-context-reused', 'Dimension reports must use unique context IDs.');
  }
  if (reviewerIds.size < 3) {
    addIssue(issues, 'insufficient-reviewer-perspectives', 'At least three reviewer identities or perspectives are required.');
  }
  if (blindCount < 1) {
    addIssue(issues, 'blind-review-missing', 'At least one reviewer must not receive the implementation narrative.');
  }
  if (revisions.size > 1) {
    addIssue(issues, 'source-revision-disagreement', 'Dimension reports review different source revisions.');
  }

  const synthesis = bundle.synthesis;
  let canonicalFindings = new Map<string, SemanticFinding>();
  let unresolvedFindingIds: string[] = [];
  let blockingFindingIds: string[] = [];
  if (!synthesis) {
    addIssue(issues, 'missing-review-synthesis', 'review-synthesis.json is required.', 'review-synthesis.json');
  } else {
    addRevision(synthesis.sourceRevision, 'review-synthesis.json', issues, revisions);
    validateSchemaVersion(synthesis.schemaVersion, 'review-synthesis.json', issues);
    validateIsoTimestamp(synthesis.synthesizedAt, 'review-synthesis.json', issues);
    canonicalFindings = validateFindings(synthesis.canonicalFindings, issues, 'review-synthesis.json');

    const expectedReviewIds = sorted(reviewIds);
    if (!sameSet(synthesis.includedReviewIds, expectedReviewIds)) {
      addIssue(issues, 'synthesis-review-loss', 'Synthesis must include every dimension review ID.', 'review-synthesis.json');
    }
    if (!sameSet([...canonicalFindings.keys()], [...sourceFindings.keys()])) {
      addIssue(issues, 'synthesis-finding-loss', 'Synthesis must preserve every independent finding ID.', 'review-synthesis.json');
    }
    for (const [findingId, sourceFinding] of sourceFindings) {
      const canonical = canonicalFindings.get(findingId);
      if (canonical && findingFingerprint(canonical) !== findingFingerprint(sourceFinding)) {
        addIssue(issues, 'synthesis-finding-mutated', `Synthesis changed the substance or lifecycle of ${findingId}.`, 'review-synthesis.json', findingId);
      }
    }
    for (const disagreement of synthesis.disagreements ?? []) {
      if (!disagreement
        || typeof disagreement !== 'object'
        || !disagreement.dissentPreserved
        || !nonEmpty(disagreement.rationale)
        || (disagreement.perspectives ?? []).length < 2) {
        addIssue(issues, 'dissent-not-preserved', `Disagreement ${disagreement?.disagreementId || '<unknown>'} does not preserve dissent and rationale.`, 'review-synthesis.json');
      }
    }

    unresolvedFindingIds = sorted([...canonicalFindings.values()]
      .filter(isUnresolvedFinding)
      .map((finding) => finding.findingId));
    blockingFindingIds = sorted([...canonicalFindings.values()]
      .filter((finding) => isUnresolvedFinding(finding) && BLOCKING_SEVERITIES.has(finding.severity))
      .map((finding) => finding.findingId));
    const resolvedFindingIds = sorted([...canonicalFindings.values()]
      .filter((finding) => !isUnresolvedFinding(finding))
      .map((finding) => finding.findingId));

    if (!sameSet(synthesis.unresolvedFindingIds, unresolvedFindingIds)) {
      addIssue(issues, 'synthesis-unresolved-disagreement', 'Synthesis unresolved finding IDs do not match finding dispositions.', 'review-synthesis.json');
    }
    if (!sameSet(synthesis.blockingFindingIds, blockingFindingIds)) {
      addIssue(issues, 'synthesis-blocking-disagreement', 'Synthesis blocking finding IDs do not match open critical/high findings.', 'review-synthesis.json');
    }
    if (!sameSet(synthesis.resolvedFindingIds, resolvedFindingIds)) {
      addIssue(issues, 'synthesis-resolved-disagreement', 'Synthesis resolved finding IDs do not match finding dispositions.', 'review-synthesis.json');
    }
    if (!DECISIONS.has(synthesis.completionRecommendation)) {
      addIssue(issues, 'invalid-completion-recommendation', 'Synthesis has an invalid completion recommendation.', 'review-synthesis.json');
    }
    if (!nonEmpty(synthesis.rationale) || (synthesis.evidence ?? []).length === 0) {
      addIssue(issues, 'synthesis-without-rationale-evidence', 'Synthesis requires rationale and evidence.', 'review-synthesis.json');
    }
  }

  if (revisions.size > 1) {
    addIssue(issues, 'bundle-source-revision-disagreement', 'Review artifacts do not share one source revision.');
  }

  const decision = bundle.completionDecision;
  if (!decision) {
    addIssue(issues, 'missing-completion-decision', 'completion-decision.json is required.', 'completion-decision.json');
  } else {
    addRevision(decision.sourceRevision, 'completion-decision.json', issues, revisions);
    validateCompletionDecision(decision, bundle, canonicalFindings, unresolvedFindingIds, blockingFindingIds, issues);
    if (synthesis && decision.decision !== synthesis.completionRecommendation) {
      addIssue(issues, 'decision-synthesis-disagreement', 'Completion decision disagrees with review synthesis.', 'completion-decision.json');
    }
  }

  const decisionValue = decision && DECISIONS.has(decision.decision) ? decision.decision : null;
  const completionAllowed = issues.length === 0 && decisionValue === 'verified_complete';
  const valid = issues.length === 0;

  return {
    schemaVersion: 1,
    generatedBy: 'src/review/semantic-review.ts',
    status: !valid ? 'invalid' : completionAllowed ? 'pass' : 'remediation-required',
    valid,
    completionAllowed,
    decision: decisionValue,
    sourceRevision: revisions.size === 1 ? [...revisions][0] : null,
    reportCount: bundle.reports.length,
    findingCount: canonicalFindings.size,
    unresolvedFindingIds,
    blockingFindingIds,
    issues: issues.sort(compareIssues),
  };
}

export function validateSemanticReviewDirectory(planDirectory: string): SemanticReviewValidationReport {
  const reviewDirectory = join(planDirectory, 'review');
  const reports: SemanticDimensionReview[] = [];
  const loadIssues: SemanticReviewValidationIssue[] = [];

  for (const [dimension, filename] of Object.entries(SEMANTIC_REVIEW_REPORT_FILES) as Array<[SemanticReviewDimension, string]>) {
    const parsed = readJsonArtifact(join(reviewDirectory, filename), filename, loadIssues);
    if (parsed) {
      if (parsed.dimension !== dimension) {
        addIssue(loadIssues, 'review-file-dimension-disagreement', `${filename} must declare dimension ${dimension}.`, filename);
      }
      reports.push(parsed as unknown as SemanticDimensionReview);
    }
  }

  const synthesis = readJsonArtifact(join(reviewDirectory, 'review-synthesis.json'), 'review-synthesis.json', loadIssues) as SemanticReviewSynthesis | undefined;
  const completionDecision = readJsonArtifact(join(reviewDirectory, 'completion-decision.json'), 'completion-decision.json', loadIssues) as SemanticCompletionChallenge | undefined;
  const remediationPath = join(reviewDirectory, 'remediation-plan.md');
  const remediationPlan = existsSync(remediationPath) ? readFileSync(remediationPath, 'utf8') : undefined;

  return validateSemanticReviewBundle({
    reports,
    synthesis,
    completionDecision,
    remediationPlan,
    loadIssues,
  });
}

function validateDimensionReport(
  report: SemanticDimensionReview,
  issues: SemanticReviewValidationIssue[],
  reviewIds: Set<string>,
  contextIds: Set<string>,
  reviewerIds: Set<string>,
  revisions: Set<string>,
  sourceFindings: Map<string, SemanticFinding>,
): void {
  const artifact = SEMANTIC_REVIEW_REPORT_FILES[report.dimension] ?? `${report.dimension || 'unknown'}.json`;
  validateSchemaVersion(report.schemaVersion, artifact, issues);
  if (!DIMENSIONS.has(report.dimension)) addIssue(issues, 'invalid-review-dimension', `Invalid review dimension ${report.dimension || '<missing>'}.`, artifact);
  if (!/^REVIEW-[A-Z0-9-]+$/.test(nonEmpty(report.reviewId))) addIssue(issues, 'invalid-review-id', 'Review ID must match REVIEW-[A-Z0-9-]+.', artifact);
  if (reviewIds.has(report.reviewId)) addIssue(issues, 'duplicate-review-id', `Duplicate review ID ${report.reviewId}.`, artifact);
  reviewIds.add(nonEmpty(report.reviewId));
  addRevision(report.sourceRevision, artifact, issues, revisions);
  validateIsoTimestamp(report.reviewedAt, artifact, issues);

  if (!report.reviewer || !nonEmpty(report.reviewer.reviewerId) || !nonEmpty(report.reviewer.contextId) || !nonEmpty(report.reviewer.promptFile)) {
    addIssue(issues, 'incomplete-reviewer-context', 'Reviewer identity, context ID, and prompt file are required.', artifact);
  } else {
    reviewerIds.add(report.reviewer.reviewerId);
    contextIds.add(report.reviewer.contextId);
    if (!report.reviewer.independentContext) addIssue(issues, 'reviewer-not-independent', 'Reviewer context must be independent.', artifact);
  }
  if (!(report.claimsReviewed ?? []).some(nonEmpty)) addIssue(issues, 'review-without-claims', 'Review must name at least one claim reviewed.', artifact);
  if (!['pass', 'fail', 'inconclusive'].includes(report.verdict)) addIssue(issues, 'invalid-review-verdict', 'Review verdict is invalid.', artifact);
  if (report.dimension === 'functional-validation') validateFunctionalScenarios(report.validationScenarios, artifact, issues);

  const reportFindings = validateFindings(report.findings, issues, artifact);
  for (const [findingId, finding] of reportFindings) {
    if (finding.dimension !== report.dimension) addIssue(issues, 'finding-dimension-disagreement', `${findingId} does not match report dimension.`, artifact, findingId);
    if (sourceFindings.has(findingId)) addIssue(issues, 'duplicate-finding-id', `Duplicate finding ID ${findingId}.`, artifact, findingId);
    sourceFindings.set(findingId, finding);
  }
  if (report.verdict === 'pass' && [...reportFindings.values()].some(isUnresolvedFinding)) {
    addIssue(issues, 'passing-review-with-unresolved-findings', 'A passing review cannot retain unresolved findings.', artifact);
  }
}

function validateFindings(
  findings: SemanticFinding[] | undefined,
  issues: SemanticReviewValidationIssue[],
  artifact: string,
): Map<string, SemanticFinding> {
  const result = new Map<string, SemanticFinding>();
  if (!Array.isArray(findings)) {
    addIssue(issues, 'invalid-findings-array', 'Findings must be an array.', artifact);
    return result;
  }
  for (const finding of findings) {
    if (!finding || typeof finding !== 'object' || Array.isArray(finding)) {
      addIssue(issues, 'invalid-finding', 'Each finding must be an object.', artifact);
      continue;
    }
    const id = nonEmpty(finding?.findingId);
    if (!/^FIND-[A-Z0-9-]+$/.test(id)) addIssue(issues, 'invalid-finding-id', 'Finding ID must match FIND-[A-Z0-9-]+.', artifact, id);
    if (result.has(id)) addIssue(issues, 'duplicate-finding-id', `Duplicate finding ID ${id}.`, artifact, id);
    if (!DIMENSIONS.has(finding?.dimension)) addIssue(issues, 'invalid-finding-dimension', `${id} has an invalid dimension.`, artifact, id);
    if (!SEVERITIES.has(finding?.severity)) addIssue(issues, 'invalid-finding-severity', `${id} has an invalid severity.`, artifact, id);
    if (!DISPOSITIONS.has(finding?.disposition)) addIssue(issues, 'invalid-finding-disposition', `${id} has an invalid disposition.`, artifact, id);
    if (![finding?.claim, finding?.expectedBehavior, finding?.observedBehavior, finding?.validationNeeded, finding?.recommendedAction].every(nonEmpty)) {
      addIssue(issues, 'incomplete-finding-narrative', `${id} is missing claim, behavior, validation, or action text.`, artifact, id);
    }
    if (!Number.isFinite(finding?.confidence) || finding.confidence < 0 || finding.confidence > 1) {
      addIssue(issues, 'invalid-finding-confidence', `${id} confidence must be between 0 and 1.`, artifact, id);
    }
    if (!(finding?.evidence ?? []).length || finding.evidence.some((evidence) => !evidence
      || !EVIDENCE_KINDS.has(evidence.kind)
      || !nonEmpty(evidence.source)
      || !['pass', 'fail', 'inconclusive'].includes(evidence.outcome))) {
      addIssue(issues, 'invalid-finding-evidence', `${id} requires sourced evidence with an outcome.`, artifact, id);
    }
    if (finding?.severity === 'critical' && finding.disposition === 'accepted-risk') {
      addIssue(issues, 'critical-risk-cannot-close', `${id} is critical and cannot be closed as accepted risk.`, artifact, id);
    }
    if (finding?.disposition === 'accepted-risk' && !(finding.evidence ?? []).some((item) => item.outcome === 'pass' && (item.kind === 'manual' || item.kind === 'artifact'))) {
      addIssue(issues, 'accepted-risk-without-approval', `${id} accepted risk requires passing manual or artifact approval evidence.`, artifact, id);
    }
    if (finding?.disposition === 'resolved' && finding.remediationRequired) {
      addIssue(issues, 'resolved-finding-still-requires-remediation', `${id} cannot be resolved while remediationRequired is true.`, artifact, id);
    }
    result.set(id, finding);
  }
  return result;
}

function validateFunctionalScenarios(
  scenarios: FunctionalValidationScenario[] | undefined,
  artifact: string,
  issues: SemanticReviewValidationIssue[],
): void {
  if (!Array.isArray(scenarios) || scenarios.length === 0) {
    addIssue(issues, 'functional-scenarios-missing', 'Functional validation requires at least one scenario.', artifact);
    return;
  }
  for (const scenario of scenarios) {
    if (!scenario || typeof scenario !== 'object' || Array.isArray(scenario)) {
      addIssue(issues, 'invalid-validation-scenario', 'Each functional scenario must be an object.', artifact);
      continue;
    }
    if (!/^SCENARIO-[A-Z0-9-]+$/.test(nonEmpty(scenario.scenarioId))) addIssue(issues, 'invalid-scenario-id', 'Scenario ID must match SCENARIO-[A-Z0-9-]+.', artifact);
    if (![scenario.evidenceLevel, scenario.commandOrProcedure, scenario.expectedBehavior, scenario.observedBehavior].every(nonEmpty)) {
      addIssue(issues, 'incomplete-validation-scenario', `${scenario.scenarioId || '<unknown>'} is missing validation details.`, artifact);
    }
    if (!['pass', 'fail', 'blocked', 'not-run'].includes(scenario.outcome)) addIssue(issues, 'invalid-scenario-outcome', `${scenario.scenarioId || '<unknown>'} has an invalid outcome.`, artifact);
    if (!(scenario.evidence ?? []).length
      || scenario.evidence.some((item) => !item || !EVIDENCE_KINDS.has(item.kind) || !nonEmpty(item.source) || !['pass', 'fail', 'inconclusive'].includes(item.outcome))) {
      addIssue(issues, 'scenario-evidence-missing', `${scenario.scenarioId || '<unknown>'} has no valid retained evidence.`, artifact);
    }
  }
}

function validateCompletionDecision(
  decision: SemanticCompletionChallenge,
  bundle: SemanticReviewBundle,
  canonicalFindings: Map<string, SemanticFinding>,
  unresolvedFindingIds: string[],
  blockingFindingIds: string[],
  issues: SemanticReviewValidationIssue[],
): void {
  const artifact = 'completion-decision.json';
  validateSchemaVersion(decision.schemaVersion, artifact, issues);
  validateIsoTimestamp(decision.decidedAt, artifact, issues);
  if (!/^DECISION-[A-Z0-9-]+$/.test(nonEmpty(decision.decisionId))) addIssue(issues, 'invalid-decision-id', 'Decision ID must match DECISION-[A-Z0-9-]+.', artifact);
  if (!DECISIONS.has(decision.decision)) addIssue(issues, 'invalid-completion-decision', 'Completion decision is invalid.', artifact);
  if (!decision.challenger
    || !nonEmpty(decision.challenger.reviewerId)
    || !nonEmpty(decision.challenger.contextId)
    || !nonEmpty(decision.challenger.promptFile)
    || !decision.challenger.independentContext
    || decision.challenger.implementationNarrativeReceived !== false) {
    addIssue(issues, 'completion-challenger-not-blind', 'Completion challenger must be independent and blind to the implementation narrative.', artifact);
  }
  if (!sameSet(decision.unresolvedFindingIds, unresolvedFindingIds)) addIssue(issues, 'decision-unresolved-disagreement', 'Completion decision unresolved IDs disagree with synthesis.', artifact);
  if (!(decision.mechanicalGates ?? []).length) {
    addIssue(issues, 'mechanical-gates-missing', 'Completion decision must include mechanical gate evidence.', artifact);
  } else {
    for (const gate of decision.mechanicalGates) {
      if (!gate
        || typeof gate !== 'object'
        || !nonEmpty(gate.id)
        || !['pass', 'fail', 'not_applicable'].includes(gate.status)
        || !(gate.evidence ?? []).some(nonEmpty)) {
        addIssue(issues, 'invalid-mechanical-gate', 'Mechanical gates require ID, status, and evidence.', artifact);
      }
    }
  }
  if (!nonEmpty(decision.rationale) || !(decision.evidence ?? []).length) addIssue(issues, 'decision-without-rationale-evidence', 'Completion decision requires rationale and evidence.', artifact);

  const failedReports = bundle.reports.filter((report) => report.verdict !== 'pass').map((report) => report.reviewId);
  const functionalReport = bundle.reports.find((report) => report.dimension === 'functional-validation');
  const functionalPassed = functionalReport?.verdict === 'pass'
    && Array.isArray(functionalReport.validationScenarios)
    && functionalReport.validationScenarios.length > 0
    && functionalReport.validationScenarios.every((scenario) => scenario?.outcome === 'pass');
  if (decision.functionalValidationPassed !== functionalPassed) {
    addIssue(issues, 'functional-pass-claim-disagreement', 'functionalValidationPassed must match the functional report and all scenario outcomes.', artifact);
  }
  const semanticPassed = failedReports.length === 0 && unresolvedFindingIds.length === 0;
  if (decision.semanticReviewPassed !== semanticPassed) {
    addIssue(issues, 'semantic-pass-claim-disagreement', 'semanticReviewPassed must match report verdicts and unresolved findings.', artifact);
  }
  if (decision.decision === 'verified_complete') {
    if (decision.nextTask !== null) addIssue(issues, 'verified-complete-has-next-task', 'verified_complete requires nextTask: null.', artifact);
    if (unresolvedFindingIds.length || blockingFindingIds.length) addIssue(issues, 'verified-complete-with-findings', 'verified_complete cannot retain unresolved findings.', artifact);
    if (!decision.semanticReviewPassed || !decision.functionalValidationPassed) addIssue(issues, 'verified-complete-without-semantic-functional-pass', 'verified_complete requires semantic and functional validation to pass.', artifact);
    if (failedReports.length) addIssue(issues, 'verified-complete-with-failed-review', `verified_complete conflicts with non-passing reviews: ${failedReports.join(', ')}.`, artifact);
    if (decision.mechanicalGates.some((gate) => gate?.status === 'fail')) addIssue(issues, 'verified-complete-with-failed-mechanical-gate', 'verified_complete conflicts with a failed mechanical gate.', artifact);
  } else {
    if (!nonEmpty(decision.nextTask)) addIssue(issues, 'nonterminal-decision-without-next-task', `${decision.decision} requires a non-null nextTask.`, artifact);
    validateRemediationPlan(bundle.remediationPlan, unresolvedFindingIds, issues);
  }
}

function validateRemediationPlan(
  plan: string | undefined,
  unresolvedFindingIds: string[],
  issues: SemanticReviewValidationIssue[],
): void {
  const artifact = 'remediation-plan.md';
  const content = nonEmpty(plan);
  if (!content) {
    addIssue(issues, 'remediation-plan-missing', 'A nonterminal review decision requires remediation-plan.md.', artifact);
    return;
  }
  for (const findingId of unresolvedFindingIds) {
    if (!content.includes(findingId)) addIssue(issues, 'remediation-finding-uncovered', `Remediation plan does not cover ${findingId}.`, artifact, findingId);
  }
  for (const marker of ['## R', '**Artifact kind:**', '**Evidence level:**', '**File:**', '**Acceptance:**', '**Test:**']) {
    if (!content.includes(marker)) addIssue(issues, 'remediation-plan-schema-incomplete', `Remediation plan is missing ${marker}.`, artifact);
  }
}

function readJsonArtifact(
  path: string,
  artifact: string,
  issues: SemanticReviewValidationIssue[],
): Record<string, unknown> | undefined {
  if (!existsSync(path)) {
    addIssue(issues, 'missing-review-artifact', `Missing ${artifact}.`, artifact);
    return undefined;
  }
  try {
    const parsed = JSON.parse(readFileSync(path, 'utf8')) as unknown;
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('root must be an object');
    return parsed as Record<string, unknown>;
  } catch (error) {
    addIssue(issues, 'malformed-review-artifact', `${artifact} is not valid JSON: ${(error as Error).message}.`, artifact);
    return undefined;
  }
}

function validateSchemaVersion(
  value: unknown,
  artifact: string,
  issues: SemanticReviewValidationIssue[],
): void {
  if (value !== 1) addIssue(issues, 'invalid-review-schema-version', `${artifact} must use schemaVersion: 1.`, artifact);
}

function validateIsoTimestamp(
  value: unknown,
  artifact: string,
  issues: SemanticReviewValidationIssue[],
): void {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/.test(value) || Number.isNaN(Date.parse(value))) {
    addIssue(issues, 'invalid-review-timestamp', `${artifact} requires an ISO 8601 UTC timestamp.`, artifact);
  }
}

function addRevision(
  value: unknown,
  artifact: string,
  issues: SemanticReviewValidationIssue[],
  revisions: Set<string>,
): void {
  const revision = nonEmpty(value);
  if (!revision) {
    addIssue(issues, 'missing-source-revision', `${artifact} requires a source revision.`, artifact);
    return;
  }
  revisions.add(revision);
}

function isUnresolvedFinding(finding: SemanticFinding): boolean {
  return finding.disposition === 'open'
    || (finding.disposition === 'accepted-risk' && (finding.severity === 'critical' || finding.remediationRequired));
}

function findingFingerprint(finding: SemanticFinding): string {
  return JSON.stringify({
    findingId: finding.findingId,
    dimension: finding.dimension,
    severity: finding.severity,
    disposition: finding.disposition,
    claim: finding.claim,
    expectedBehavior: finding.expectedBehavior,
    observedBehavior: finding.observedBehavior,
    evidence: (finding.evidence ?? []).map((item) => ({
      kind: item.kind,
      source: item.source,
      locator: item.locator ?? '',
      outcome: item.outcome,
    })).sort((left, right) => JSON.stringify(left).localeCompare(JSON.stringify(right))),
    requirementIds: sorted(finding.requirementIds ?? []),
    taskIds: sorted(finding.taskIds ?? []),
    confidence: finding.confidence,
    validationNeeded: finding.validationNeeded,
    recommendedAction: finding.recommendedAction,
    remediationRequired: finding.remediationRequired,
  });
}

function addIssue(
  issues: SemanticReviewValidationIssue[],
  code: string,
  message: string,
  artifact?: string,
  findingId?: string,
): void {
  issues.push({ code, message, artifact, findingId });
}

function nonEmpty(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function sorted(values: Iterable<string>): string[] {
  return [...new Set([...values].filter(Boolean))].sort();
}

function sameSet(left: string[] | undefined, right: string[]): boolean {
  return JSON.stringify(sorted(left ?? [])) === JSON.stringify(sorted(right));
}

function compareIssues(a: SemanticReviewValidationIssue, b: SemanticReviewValidationIssue): number {
  return `${a.code}:${a.artifact ?? ''}:${a.findingId ?? ''}:${a.message}`
    .localeCompare(`${b.code}:${b.artifact ?? ''}:${b.findingId ?? ''}:${b.message}`);
}
