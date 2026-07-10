export type RequirementId = string;
export type FlowId = string;
export type FeatureId = string;
export type TaskId = string;
export type TestId = string;
export type ReleaseGateId = string;

export type TraceabilityGapCode =
  | 'missing-critical-requirement-task-coverage'
  | 'missing-critical-requirement-evidence'
  | 'missing-critical-flow-task-coverage'
  | 'missing-critical-flow-evidence'
  | 'missing-feature-dependency-metadata'
  | 'artifact-contract-changed-without-override'
  | 'invalid-reviewed-override';

export type TraceabilityGapSeverity = 'blocking' | 'warning';

export interface TraceableRequirement {
  id: RequirementId;
  title?: string;
  critical?: boolean;
  flowIds?: FlowId[];
  featureIds?: FeatureId[];
}

export interface TraceableFlow {
  id: FlowId;
  title?: string;
  critical?: boolean;
  requirementIds?: RequirementId[];
  featureIds?: FeatureId[];
}

export interface TraceableFeature {
  id: FeatureId;
  title?: string;
  requirementIds?: RequirementId[];
  flowIds?: FlowId[];
  dependsOnFeatureIds?: FeatureId[];
  artifactContract?: string;
}

export interface TraceableTask {
  id: TaskId;
  title?: string;
  requirementIds?: RequirementId[];
  flowIds?: FlowId[];
  featureIds?: FeatureId[];
  dependsOnFeatureIds?: FeatureId[];
  artifactContract?: string;
  testIds?: TestId[];
  releaseGateIds?: ReleaseGateId[];
}

export interface TraceableTest {
  id: TestId;
  title?: string;
  requirementIds?: RequirementId[];
  flowIds?: FlowId[];
  taskIds?: TaskId[];
}

export interface TraceableReleaseGate {
  id: ReleaseGateId;
  title?: string;
  requirementIds?: RequirementId[];
  flowIds?: FlowId[];
  taskIds?: TaskId[];
}

export interface ReviewedSemanticOverride {
  sourceId: string;
  oldValue: string;
  newValue: string;
  rationale: string;
  affectedFlows: FlowId[];
  compensatingEvidence: string;
  approval: string;
  scope: string;
  expiry: string;
}

export interface TraceabilityMatrixInput {
  requirements?: TraceableRequirement[];
  flows?: TraceableFlow[];
  features?: TraceableFeature[];
  tasks?: TraceableTask[];
  tests?: TraceableTest[];
  releaseGates?: TraceableReleaseGate[];
  overrides?: ReviewedSemanticOverride[];
}

export interface TraceabilityMatrixRow {
  sourceId: string;
  sourceType: 'requirement' | 'flow' | 'feature';
  critical: boolean;
  requirementIds: RequirementId[];
  flowIds: FlowId[];
  featureIds: FeatureId[];
  taskIds: TaskId[];
  testIds: TestId[];
  releaseGateIds: ReleaseGateId[];
  featureDependencyIds: FeatureId[];
  artifactContracts: string[];
  reviewedOverrideIds: string[];
}

export interface TraceabilityGap {
  code: TraceabilityGapCode;
  severity: TraceabilityGapSeverity;
  sourceId: string;
  sourceType: TraceabilityMatrixRow['sourceType'] | 'override';
  message: string;
  missingIds?: string[];
}

export interface TraceabilityMatrix {
  rows: TraceabilityMatrixRow[];
  overrides: ReviewedSemanticOverride[];
}

const REQUIRED_OVERRIDE_FIELDS = [
  'sourceId',
  'oldValue',
  'newValue',
  'rationale',
  'affectedFlows',
  'compensatingEvidence',
  'approval',
  'scope',
  'expiry',
] as const;

export function buildTraceabilityMatrix(
  input: TraceabilityMatrixInput,
): TraceabilityMatrix {
  const requirements = sortedById(input.requirements ?? []);
  const flows = sortedById(input.flows ?? []);
  const features = sortedById(input.features ?? []);
  const tasks = sortedById(input.tasks ?? []);
  const tests = sortedById(input.tests ?? []);
  const releaseGates = sortedById(input.releaseGates ?? []);
  const overrides = sortedBySourceId(input.overrides ?? []);

  return {
    rows: [
      ...requirements.map((requirement) => rowForRequirement(requirement, flows, features, tasks, tests, releaseGates, overrides)),
      ...flows.map((flow) => rowForFlow(flow, features, tasks, tests, releaseGates, overrides)),
      ...features.map((feature) => rowForFeature(feature, tasks, tests, releaseGates, overrides)),
    ].sort(compareRows),
    overrides,
  };
}

export function findTraceabilityGaps(matrix: TraceabilityMatrix): TraceabilityGap[] {
  const gaps: TraceabilityGap[] = [];

  for (const row of matrix.rows) {
    if (row.sourceType === 'requirement' && row.critical) {
      if (row.taskIds.length === 0) {
        gaps.push({
          code: 'missing-critical-requirement-task-coverage',
          severity: 'blocking',
          sourceId: row.sourceId,
          sourceType: row.sourceType,
          message: `${row.sourceId} is critical but has no task coverage.`,
        });
      }
      if (row.testIds.length === 0 && row.releaseGateIds.length === 0) {
        gaps.push({
          code: 'missing-critical-requirement-evidence',
          severity: 'blocking',
          sourceId: row.sourceId,
          sourceType: row.sourceType,
          message: `${row.sourceId} is critical but has no test or release-gate evidence.`,
        });
      }
    }

    if (row.sourceType === 'flow' && row.critical) {
      if (row.taskIds.length === 0) {
        gaps.push({
          code: 'missing-critical-flow-task-coverage',
          severity: 'blocking',
          sourceId: row.sourceId,
          sourceType: row.sourceType,
          message: `${row.sourceId} is critical but has no task coverage.`,
        });
      }
      if (row.testIds.length === 0 && row.releaseGateIds.length === 0) {
        gaps.push({
          code: 'missing-critical-flow-evidence',
          severity: 'blocking',
          sourceId: row.sourceId,
          sourceType: row.sourceType,
          message: `${row.sourceId} is critical but has no test or release-gate evidence.`,
        });
      }
    }

    if (row.sourceType === 'feature' && row.taskIds.length > 0) {
      const missingDependencies = row.featureDependencyIds.filter(
        (dependencyId) => !rowReviewed(row, `${row.sourceId}:dependsOnFeatureIds:${dependencyId}`),
      );
      if (missingDependencies.length > 0) {
        gaps.push({
          code: 'missing-feature-dependency-metadata',
          severity: 'blocking',
          sourceId: row.sourceId,
          sourceType: row.sourceType,
          message: `${row.sourceId} has feature dependencies missing from covering task metadata.`,
          missingIds: missingDependencies,
        });
      }

      if (row.artifactContracts.length > 1) {
        const [sourceContract] = row.artifactContracts;
        const missingOverride = row.artifactContracts.slice(1).some(
          (taskContract) => !rowReviewed(row, `${row.sourceId}:artifactContract:${sourceContract}->${taskContract}`),
        );
        if (missingOverride) {
          gaps.push({
            code: 'artifact-contract-changed-without-override',
            severity: 'blocking',
            sourceId: row.sourceId,
            sourceType: row.sourceType,
            message: `${row.sourceId} changes artifact contract without a reviewed override.`,
          });
        }
      }
    }
  }

  for (const override of matrix.overrides) {
    const missingFields = missingOverrideFields(override);
    if (missingFields.length > 0) {
      gaps.push({
        code: 'invalid-reviewed-override',
        severity: 'blocking',
        sourceId: override.sourceId || '<unknown>',
        sourceType: 'override',
        message: `Reviewed override ${override.sourceId || '<unknown>'} is missing required fields.`,
        missingIds: missingFields,
      });
    }
  }

  return gaps.sort(compareGaps);
}

function rowForRequirement(
  requirement: TraceableRequirement,
  flows: TraceableFlow[],
  features: TraceableFeature[],
  tasks: TraceableTask[],
  tests: TraceableTest[],
  releaseGates: TraceableReleaseGate[],
  overrides: ReviewedSemanticOverride[],
): TraceabilityMatrixRow {
  const flowIds = uniqueSorted([
    ...(requirement.flowIds ?? []),
    ...flows.filter((flow) => includes(flow.requirementIds, requirement.id)).map((flow) => flow.id),
  ]);
  const featureIds = uniqueSorted([
    ...(requirement.featureIds ?? []),
    ...features.filter((feature) => includes(feature.requirementIds, requirement.id)).map((feature) => feature.id),
  ]);
  const taskIds = tasks
    .filter((task) => includes(task.requirementIds, requirement.id) || intersects(task.featureIds, featureIds))
    .map((task) => task.id);

  return baseRow({
    sourceId: requirement.id,
    sourceType: 'requirement',
    critical: requirement.critical ?? false,
    requirementIds: [requirement.id],
    flowIds,
    featureIds,
    taskIds,
    testIds: evidenceIds(tests, requirement.id, flowIds, taskIds),
    releaseGateIds: evidenceIds(releaseGates, requirement.id, flowIds, taskIds),
    reviewedOverrideIds: overrideIdsFor(overrides, requirement.id),
  });
}

function rowForFlow(
  flow: TraceableFlow,
  features: TraceableFeature[],
  tasks: TraceableTask[],
  tests: TraceableTest[],
  releaseGates: TraceableReleaseGate[],
  overrides: ReviewedSemanticOverride[],
): TraceabilityMatrixRow {
  const featureIds = uniqueSorted([
    ...(flow.featureIds ?? []),
    ...features.filter((feature) => includes(feature.flowIds, flow.id)).map((feature) => feature.id),
  ]);
  const taskIds = tasks
    .filter((task) => includes(task.flowIds, flow.id) || intersects(task.featureIds, featureIds))
    .map((task) => task.id);

  return baseRow({
    sourceId: flow.id,
    sourceType: 'flow',
    critical: flow.critical ?? false,
    requirementIds: flow.requirementIds ?? [],
    flowIds: [flow.id],
    featureIds,
    taskIds,
    testIds: evidenceIds(tests, undefined, [flow.id], taskIds),
    releaseGateIds: evidenceIds(releaseGates, undefined, [flow.id], taskIds),
    reviewedOverrideIds: overrideIdsFor(overrides, flow.id),
  });
}

function rowForFeature(
  feature: TraceableFeature,
  tasks: TraceableTask[],
  tests: TraceableTest[],
  releaseGates: TraceableReleaseGate[],
  overrides: ReviewedSemanticOverride[],
): TraceabilityMatrixRow {
  const coveringTasks = tasks.filter((task) => includes(task.featureIds, feature.id));
  const taskIds = coveringTasks.map((task) => task.id);
  const missingDependencyIds = uniqueSorted((feature.dependsOnFeatureIds ?? []).filter(
    (dependencyId) => !coveringTasks.some((task) => includes(task.dependsOnFeatureIds, dependencyId)),
  ));
  const taskContracts = coveringTasks
    .map((task) => task.artifactContract)
    .filter(isString);

  return baseRow({
    sourceId: feature.id,
    sourceType: 'feature',
    critical: false,
    requirementIds: feature.requirementIds ?? [],
    flowIds: feature.flowIds ?? [],
    featureIds: [feature.id],
    taskIds,
    testIds: evidenceIds(tests, undefined, feature.flowIds ?? [], taskIds),
    releaseGateIds: evidenceIds(releaseGates, undefined, feature.flowIds ?? [], taskIds),
    featureDependencyIds: missingDependencyIds,
    artifactContracts: uniqueSorted([feature.artifactContract, ...taskContracts].filter(isString)),
    reviewedOverrideIds: overrideIdsFor(overrides, feature.id),
  });
}

function baseRow(row: Omit<TraceabilityMatrixRow, 'featureDependencyIds' | 'artifactContracts'> & Partial<TraceabilityMatrixRow>): TraceabilityMatrixRow {
  return {
    ...row,
    requirementIds: uniqueSorted(row.requirementIds),
    flowIds: uniqueSorted(row.flowIds),
    featureIds: uniqueSorted(row.featureIds),
    taskIds: uniqueSorted(row.taskIds),
    testIds: uniqueSorted(row.testIds),
    releaseGateIds: uniqueSorted(row.releaseGateIds),
    featureDependencyIds: uniqueSorted(row.featureDependencyIds ?? []),
    artifactContracts: uniqueSorted(row.artifactContracts ?? []),
    reviewedOverrideIds: uniqueSorted(row.reviewedOverrideIds),
  };
}

function evidenceIds(
  evidence: Array<TraceableTest | TraceableReleaseGate>,
  requirementId: string | undefined,
  flowIds: string[],
  taskIds: string[],
): string[] {
  return evidence
    .filter((item) => (
      (requirementId !== undefined && includes(item.requirementIds, requirementId))
      || intersects(item.flowIds, flowIds)
      || intersects(item.taskIds, taskIds)
    ))
    .map((item) => item.id);
}

function missingOverrideFields(override: ReviewedSemanticOverride): string[] {
  return REQUIRED_OVERRIDE_FIELDS.filter((field) => {
    const value = override[field];
    return Array.isArray(value) ? value.length === 0 : !value;
  });
}

function rowReviewed(row: TraceabilityMatrixRow, sourceId: string): boolean {
  return row.reviewedOverrideIds.includes(sourceId);
}

function overrideIdsFor(overrides: ReviewedSemanticOverride[], sourceId: string): string[] {
  return overrides
    .filter((override) => override.sourceId === sourceId || override.sourceId.startsWith(`${sourceId}:`))
    .map((override) => override.sourceId);
}

function sortedById<T extends { id: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => a.id.localeCompare(b.id));
}

function sortedBySourceId<T extends { sourceId: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => a.sourceId.localeCompare(b.sourceId));
}

function uniqueSorted(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))].sort();
}

function includes(values: string[] | undefined, value: string): boolean {
  return values?.includes(value) ?? false;
}

function intersects(left: string[] | undefined, right: string[]): boolean {
  return (left ?? []).some((value) => right.includes(value));
}

function isString(value: string | undefined): value is string {
  return typeof value === 'string' && value.length > 0;
}

function compareRows(a: TraceabilityMatrixRow, b: TraceabilityMatrixRow): number {
  return a.sourceId.localeCompare(b.sourceId) || a.sourceType.localeCompare(b.sourceType);
}

function compareGaps(a: TraceabilityGap, b: TraceabilityGap): number {
  return (
    severityRank(a.severity) - severityRank(b.severity)
    || a.sourceId.localeCompare(b.sourceId)
    || a.code.localeCompare(b.code)
  );
}

function severityRank(severity: TraceabilityGapSeverity): number {
  return severity === 'blocking' ? 0 : 1;
}
