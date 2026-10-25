import { confined, resolveDeliveryScope, validateDelivery, validatePlanningIntegrity, deliveryExecutionOutcomeIds } from '../delivery/index.js';
import type { DeliveryReport, DeliveryValidationOptions } from '../delivery/index.js';
import { buildTaskContractReport } from '../task-contract/task-contract-report.js';
import { parsePlanTaskDirectory } from '../task-contract/task-parser.js';

import { deliveryProjections } from './delivery-projections.js';

export * from '../delivery/types.js';
export { validatePlanningIntegrity, matchesPlanningGlob } from '../delivery/planning-integrity.js';
export type { PlanningContext, PlanningIssue, PlanningReport } from '../delivery/planning-integrity.js';
export { planDeliveryReview, getDeliveryChangePolicy } from '../delivery/review-planner.js';
export type { ReviewPlan, ReviewPurpose } from '../delivery/review-planner.js';
export type { DeliveryChangePolicy } from '../delivery/lifecycle.js';
export { parseDeliveryManifest, resolveDeliveryScope } from '../delivery/manifest.js';
export {
  deliveryScopeDigest, deliveryEvidenceBinding, deliveryReviewBinding, deliveryDesignReviewBinding, deliveryReleaseReviewBinding, readDeliveryRequirements,
} from '../delivery/validation.js';

/** One gate for the package API and shell entry points. Outcome metadata does
 * not excuse malformed executable prompts or hide unplanned implementation. */
export function validateDeliveryRun(
  targetDir: string,
  options: DeliveryValidationOptions,
): DeliveryReport {
  let projections = new Map<string, string>();
  try {
    const resolved = resolveDeliveryScope(targetDir, { allowLegacy: false });
    if (resolved) projections = deliveryProjections(resolved);
  } catch { /* The canonical validator reports malformed inputs below. */ }
  const report = validateDelivery(targetDir, {
    ...options,
    trustedProjectionProvider: { verify: (file, bytes) => projections.get(file) === bytes.toString('utf8') },
  });
  if (!report.valid) return report;
  const scope = resolveDeliveryScope(targetDir, { allowLegacy: false });
  if (!scope) throw new Error('Outcome delivery requires a delivery manifest');
  const files = parsePlanTaskDirectory(targetDir);
  const contract = buildTaskContractReport(files, { sourceDirectory: scope.runDirectory });
  const issues = contract.issues.filter((issue) => issue.severity === 'error')
    .map((issue) => `task-contract:${issue.code}: ${issue.message}`);
  const slice = scope.manifest.slices.find((item) => item.id === scope.manifest.activeSlice)!;
  const declared = new Map(slice.units.map((unit) => [unit.id, unit]));
  const actual = new Map(files.flatMap((file) => file.units.map((unit) => [unit.canonicalId, unit] as const)));
  for (const [id, unit] of declared) {
    const parsed = actual.get(id);
    if (!parsed) {
      issues.push(`Active unit ${id} has no executable task section`);
      continue;
    }
    if (scope.manifest.schemaVersion === 2 && (!parsed.risk || !parsed.modelTier || !parsed.turnBudget)) issues.push(`RISK_METADATA_MISSING: ${id} needs explicit risk, suitable model tier and bounded turn budget`);
    let pathsMatch = false;
    try {
      const normalize = (paths: string[]) => [...new Set(paths.map((file) => confined(scope.projectRoot, file, false)))].sort();
      pathsMatch = JSON.stringify(normalize(unit.affectedPaths)) === JSON.stringify(normalize(parsed.filePaths));
    } catch (error) {
      issues.push(`Active unit ${id} has an unsafe affected path: ${String(error)}`);
    }
    if (!pathsMatch) {
      issues.push(`Active unit ${id} affected paths disagree with its executable prompt`);
    }
    const parsedDependencies = contract.graphs.taskUnits.nodes.find((node) => node.id === id)?.dependencies ?? [];
    if (JSON.stringify([...unit.dependsOn].sort()) !== JSON.stringify([...parsedDependencies].sort())) {
      issues.push(`Active unit ${id} dependencies disagree with its executable prompt`);
    }
    const required = new Set(scope.manifest.outcomes
      .filter((outcome) => unit.outcomeIds.includes(outcome.id)).flatMap((outcome) => outcome.requirementIds));
    for (const requirement of required) {
      if (!parsed.requirementIds.includes(requirement)) issues.push(`${id} omits requirement ${requirement}`);
    }
    for (const requirement of parsed.requirementIds) {
      if (!required.has(requirement)) issues.push(`${id} adds unplanned requirement ${requirement}`);
    }
  }
  for (const id of actual.keys()) {
    if (!declared.has(id)) issues.push(`Executable task ${id} is not accounted for in the active slice`);
  }
  const planning = validatePlanningIntegrity({ projectRoot: scope.projectRoot, runDirectory: scope.runDirectory, stage: options.stage,
    knownTargets: [...scope.manifest.outcomes.map(o => o.id), ...scope.manifest.slices.flatMap(s => [s.id, ...s.units.map(u => u.id)])],
    required: scope.manifest.schemaVersion === 2, units: [...actual].map(([id, unit]) => ({ id, filePaths: unit.filePaths, test: unit.test, nodeIds: declared.get(id)?.planningNodeIds })),
    targetIds: options.stage === 'release' ? undefined : [slice.id, ...(options.stage === 'execute' ? deliveryExecutionOutcomeIds(scope.manifest, slice) : slice.outcomeIds), ...slice.units.map(u => u.id)],
  });
  for (const problem of planning.issues) issues.push(`${problem.code}: ${problem.target}: ${problem.message}`);
  // A unit cannot hide extra implementation instructions as an unowned task file.
  const names = new Set(files.map((file) => file.filename));
  if (names.size !== files.length) issues.push('Active task filenames must be unique across directories');
  if (issues.length === 0) return report;
  return {
    ...report,
    valid: false,
    issues: [...report.issues, ...issues],
    completion: { ...report.completion, planReady: false, sliceAccepted: false, releaseReady: false },
  };
}
export * from '../delivery/comparison.js';
