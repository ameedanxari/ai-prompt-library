import * as fs from 'node:fs';
import * as path from 'node:path';
import type { DeliveryReport, DeliveryScope, DeliveryValidationOptions } from './types.js';
import { confined } from './manifest.js';
import { validateDelivery, deliveryExecutionOutcomeIds, readDeliveryRequirements } from './validation.js';
import { validatePlanningIntegrity } from './planning-integrity.js';
import { deliveryReleaseSelection } from './release.js';
import { buildTaskContractReport } from '../task-contract/task-contract-report.js';
import { parsePlanTaskDirectory, parsePlanTaskFile, isPlanTaskFilename } from '../task-contract/task-parser.js';
import { deliveryProjections } from '../execution/delivery-projections.js';

/** Safe local preflight shared by gates and review dispatch. Task contracts and
 * runner coverage are inspected even while independent scope review is pending.
 * All authority/evidence failures remain in the report; preflight grants none. */
export function preflightDelivery(scope: DeliveryScope, options: DeliveryValidationOptions): DeliveryReport {
  let projections = new Map<string, string>();
  try { projections = deliveryProjections(scope); } catch { /* Canonical task checks report the defect below. */ }
  const report = validateDelivery(scope.runDirectory, {
    ...options,
    trustedProjectionProvider: { verify: (file, bytes) => projections.get(file) === bytes.toString('utf8') },
  });
  let localIssues: string[];
  try {
    const release = deliveryReleaseSelection(scope, readDeliveryRequirements(scope).requirements, options.releaseScopeId);
    const selectedSlices = options.stage === 'release' ? scope.manifest.slices.filter(slice => options.releaseScopeId === undefined || slice.outcomeIds.some(id => release.outcomeIds.includes(id))) : scope.manifest.slices.filter(slice => slice.id === scope.manifest.activeSlice);
    const files = options.stage === 'release' ? [...new Set(selectedSlices.flatMap(slice => slice.detailedFiles).map(file => confined(scope.runDirectory, file)))].filter(file => isPlanTaskFilename(path.basename(file))).sort().map(file => parsePlanTaskFile(path.basename(file), fs.readFileSync(file, 'utf8'), file)) : parsePlanTaskDirectory(scope.runDirectory);
    const contract = buildTaskContractReport(files, { sourceDirectory: scope.runDirectory });
    const issues = contract.issues.filter((issue) => issue.severity === 'error')
      .map((issue) => `task-contract:${issue.code}: ${issue.message}`);
    const slice = scope.manifest.slices.find((item) => item.id === scope.manifest.activeSlice)!;
    const declared = new Map(selectedSlices.flatMap(s => s.units).map((unit) => [unit.id, unit]));
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
      required: scope.manifest.schemaVersion === 2, units: options.stage === 'release' ? scope.manifest.slices.flatMap(s => s.units).map(u => ({ id: u.id, filePaths: u.affectedPaths, test: actual.get(u.id)?.test, nodeIds: u.planningNodeIds })) : [...actual].map(([id, unit]) => ({ id, filePaths: unit.filePaths, test: unit.test, nodeIds: declared.get(id)?.planningNodeIds })),
      targetIds: options.stage === 'release' ? release.planningTargetIds : [slice.id, ...(options.stage === 'execute' ? deliveryExecutionOutcomeIds(scope.manifest, slice) : slice.outcomeIds), ...slice.units.map(u => u.id)],
    });
    for (const problem of planning.issues) issues.push(`${problem.code}: ${problem.target}: ${problem.message}`);
    // A unit cannot hide extra implementation instructions as an unowned task file.
    const names = new Set(files.map((file) => file.filename));
    if (names.size !== files.length) issues.push('Active task filenames must be unique across directories');

    localIssues = issues;
  } catch (error) {
    localIssues = [`preflight: ${error instanceof Error ? error.message : String(error)}`];
  }
  if (!localIssues.length) return report;
  return {
    ...report,
    valid: false,
    issues: [...new Set([...report.issues, ...localIssues])],
    completion: { ...report.completion, planReady: false, sliceAccepted: false, releaseReady: false },
  };
}
