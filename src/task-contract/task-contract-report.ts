import {
  ARTIFACT_KINDS,
  EVIDENCE_LEVELS,
  PHASES,
  buildFileDependencyGraph,
  buildTaskUnitDependencyGraph,
  parsePlanTaskDirectory,
  type ParsedPlanFile,
  type ParsedTaskUnit,
  type ArtifactKind,
  type EvidenceLevel,
  type PlanGraph,
  type TaskDependencyRef,
  type TaskPhase,
  type TaskSchemaVersion,
} from './task-parser.js';

export type TaskContractIssueSeverity = 'error' | 'warning';

export type TaskContractIssueCode =
  | 'missing-file-dependency'
  | 'file-dependency-cycle'
  | 'missing-task-dependency'
  | 'task-dependency-cycle'
  | 'empty-task-file'
  | 'missing-user-story'
  | 'malformed-user-story'
  | 'missing-change-type'
  | 'invalid-change-type'
  | 'missing-precise-change'
  | 'shallow-acceptance'
  | 'tautological-acceptance'
  | 'missing-depends-on'
  | 'missing-dependency-reason'
  | 'missing-estimated-loc'
  | 'invalid-phase'
  | 'missing-phase'
  | 'missing-file-path'
  | 'missing-test'
  | 'missing-artifact-kind'
  | 'invalid-artifact-kind'
  | 'missing-requirement-ids'
  | 'missing-evidence-level'
  | 'invalid-evidence-level'
  | 'missing-runtime-reachability'
  | 'static-only-behavioral-closure'
  | 'artifact-runtime-path-mismatch'
  | 'legacy-task-schema'
  | 'duplicate-file-path';

export interface TaskContractReportOptions {
  sourceDirectory?: string;
}

export interface TaskContractSummary {
  fileCount: number;
  taskFileCount: number;
  remediationFileCount: number;
  taskUnitCount: number;
  phaseCounts: Record<TaskPhase, number>;
  missingPhaseCount: number;
  invalidPhaseCount: number;
  schemaVersionCounts: Record<'current' | 'legacy', number>;
  artifactKindCounts: Record<ArtifactKind, number>;
  evidenceLevelCounts: Record<EvidenceLevel, number>;
  issueCounts: Record<TaskContractIssueSeverity, number>;
  blocked: boolean;
}

export interface TaskContractIssue {
  code: TaskContractIssueCode;
  severity: TaskContractIssueSeverity;
  message: string;
  file?: string;
  unitId?: string;
  canonicalId?: string;
  dependency?: string;
  path?: string;
  owners?: string[];
}

export interface TaskContractFileEntry {
  filename: string;
  filePath?: string;
  kind: ParsedPlanFile['kind'];
  slug: string;
  title?: string;
  unitCount: number;
  taskUnitIds: string[];
  dependencies: string[];
  missingDependencies: string[];
  filePaths: string[];
  phases: TaskPhase[];
  invalidPhases: string[];
  schemaVersions: TaskSchemaVersion[];
  artifactKinds: ArtifactKind[];
  evidenceLevels: EvidenceLevel[];
}

export interface TaskContractUnitEntry {
  id: string;
  canonicalId: string;
  file: string;
  title: string;
  lineNumber: number;
  closesUserStory?: string;
  changeType?: string;
  preciseChange?: string;
  acceptanceBullets: string[];
  fileRaw?: string;
  filePaths: string[];
  dependsOnRaw?: string;
  dependencies: TaskDependencyRef[];
  test?: string;
  estimatedLoc?: string;
  phase?: TaskPhase;
  invalidPhase?: string;
  schemaVersion: TaskSchemaVersion;
  artifactKind?: ArtifactKind;
  invalidArtifactKind?: string;
  requirementIds: string[];
  evidenceLevel?: EvidenceLevel;
  invalidEvidenceLevel?: string;
  runtimeReachability?: string;
  productionOwner?: string;
}

export interface TaskContractPathOwner {
  file: string;
  unitId: string;
  canonicalId: string;
}

export interface TaskContractPathClaim {
  path: string;
  owners: TaskContractPathOwner[];
}

export interface TaskContractReport {
  schemaVersion: 2;
  generatedBy: 'src/task-contract/task-contract-report.ts';
  sourceDirectory?: string;
  summary: TaskContractSummary;
  files: TaskContractFileEntry[];
  units: TaskContractUnitEntry[];
  pathClaims: TaskContractPathClaim[];
  duplicatePathClaims: TaskContractPathClaim[];
  graphs: {
    files: PlanGraph;
    taskUnits: PlanGraph;
  };
  issues: TaskContractIssue[];
}

export function buildTaskContractReport(
  files: ParsedPlanFile[],
  options: TaskContractReportOptions = {},
): TaskContractReport {
  const sortedFiles = [...files].sort((a, b) => a.filename.localeCompare(b.filename));
  const fileGraph = buildFileDependencyGraph(sortedFiles);
  const taskUnitGraph = buildTaskUnitDependencyGraph(sortedFiles);
  const units = sortedFiles.flatMap((file) => file.units.map((unit) => toUnitEntry(file, unit)));
  const pathClaims = buildPathClaims(sortedFiles);
  const duplicatePathClaims = pathClaims.filter((claim) => claim.owners.length > 1);
  const issues = buildIssues(sortedFiles, fileGraph, taskUnitGraph, duplicatePathClaims);

  return {
    schemaVersion: 2,
    generatedBy: 'src/task-contract/task-contract-report.ts',
    sourceDirectory: options.sourceDirectory,
    summary: buildSummary(sortedFiles, issues),
    files: sortedFiles.map((file) => toFileEntry(file, fileGraph)),
    units,
    pathClaims,
    duplicatePathClaims,
    graphs: {
      files: fileGraph,
      taskUnits: taskUnitGraph,
    },
    issues,
  };
}

export function buildTaskContractReportForDirectory(targetDir: string): TaskContractReport {
  return buildTaskContractReport(parsePlanTaskDirectory(targetDir), {
    sourceDirectory: targetDir,
  });
}

function toFileEntry(file: ParsedPlanFile, graph: PlanGraph): TaskContractFileEntry {
  const node = graph.nodes.find((candidate) => candidate.id === file.filename);

  return {
    filename: file.filename,
    filePath: file.filePath,
    kind: file.kind,
    slug: file.slug,
    title: file.title,
    unitCount: file.units.length,
    taskUnitIds: file.units.map((unit) => unit.canonicalId).sort(),
    dependencies: node?.dependencies ?? [],
    missingDependencies: node?.missingDependencies ?? [],
    filePaths: uniqueSorted(file.units.flatMap((unit) => unit.filePaths)),
    phases: uniqueSorted(file.units.map((unit) => unit.phase).filter(isDefined)),
    invalidPhases: uniqueSorted(file.units.map((unit) => unit.invalidPhase).filter(isDefined)),
    schemaVersions: uniqueSchemaVersions(file.units.map((unit) => unit.schemaVersion)),
    artifactKinds: uniqueSorted(file.units.map((unit) => unit.artifactKind).filter(isDefined)),
    evidenceLevels: uniqueSorted(file.units.map((unit) => unit.evidenceLevel).filter(isDefined)),
  };
}

function toUnitEntry(file: ParsedPlanFile, unit: ParsedTaskUnit): TaskContractUnitEntry {
  return {
    id: unit.id,
    canonicalId: unit.canonicalId,
    file: file.filename,
    title: unit.title,
    lineNumber: unit.lineNumber,
    closesUserStory: unit.closesUserStory,
    changeType: unit.changeType,
    preciseChange: unit.preciseChange,
    acceptanceBullets: unit.acceptanceBullets,
    fileRaw: unit.fileRaw,
    filePaths: [...unit.filePaths].sort(),
    dependsOnRaw: unit.dependsOnRaw,
    dependencies: unit.dependencies,
    test: unit.test,
    estimatedLoc: unit.estimatedLoc,
    phase: unit.phase,
    invalidPhase: unit.invalidPhase,
    schemaVersion: unit.schemaVersion,
    artifactKind: unit.artifactKind,
    invalidArtifactKind: unit.invalidArtifactKind,
    requirementIds: [...unit.requirementIds],
    evidenceLevel: unit.evidenceLevel,
    invalidEvidenceLevel: unit.invalidEvidenceLevel,
    runtimeReachability: unit.runtimeReachability,
    productionOwner: unit.productionOwner,
  };
}

function buildSummary(
  files: ParsedPlanFile[],
  issues: TaskContractIssue[],
): TaskContractSummary {
  const phaseCounts = Object.fromEntries(PHASES.map((phase) => [phase, 0])) as Record<TaskPhase, number>;
  const artifactKindCounts = Object.fromEntries(
    ARTIFACT_KINDS.map((kind) => [kind, 0]),
  ) as Record<ArtifactKind, number>;
  const evidenceLevelCounts = Object.fromEntries(
    EVIDENCE_LEVELS.map((level) => [level, 0]),
  ) as Record<EvidenceLevel, number>;
  const schemaVersionCounts = { current: 0, legacy: 0 };
  let missingPhaseCount = 0;
  let invalidPhaseCount = 0;

  for (const unit of files.flatMap((file) => file.units)) {
    schemaVersionCounts[unit.schemaVersion === 2 ? 'current' : 'legacy'] += 1;
    if (unit.artifactKind) artifactKindCounts[unit.artifactKind] += 1;
    if (unit.evidenceLevel) evidenceLevelCounts[unit.evidenceLevel] += 1;
    if (unit.phase) {
      phaseCounts[unit.phase] += 1;
    } else if (unit.invalidPhase) {
      invalidPhaseCount += 1;
    } else {
      missingPhaseCount += 1;
    }
  }

  const errorCount = issues.filter((issue) => issue.severity === 'error').length;
  const warningCount = issues.length - errorCount;

  return {
    fileCount: files.length,
    taskFileCount: files.filter((file) => file.kind === 'tasks').length,
    remediationFileCount: files.filter((file) => file.kind === 'remediation').length,
    taskUnitCount: files.reduce((count, file) => count + file.units.length, 0),
    phaseCounts,
    missingPhaseCount,
    invalidPhaseCount,
    schemaVersionCounts,
    artifactKindCounts,
    evidenceLevelCounts,
    issueCounts: {
      error: errorCount,
      warning: warningCount,
    },
    blocked: errorCount > 0,
  };
}

function buildPathClaims(files: ParsedPlanFile[]): TaskContractPathClaim[] {
  const claims = new Map<string, TaskContractPathOwner[]>();

  for (const file of files) {
    for (const unit of file.units) {
      for (const filePath of unit.filePaths) {
        const owners = claims.get(filePath) ?? [];
        owners.push({
          file: file.filename,
          unitId: unit.id,
          canonicalId: unit.canonicalId,
        });
        claims.set(filePath, owners);
      }
    }
  }

  return [...claims.entries()]
    .map(([path, owners]) => ({
      path,
      owners: owners.sort((a, b) => a.canonicalId.localeCompare(b.canonicalId)),
    }))
    .sort((a, b) => a.path.localeCompare(b.path));
}

function buildIssues(
  files: ParsedPlanFile[],
  fileGraph: PlanGraph,
  taskUnitGraph: PlanGraph,
  duplicatePathClaims: TaskContractPathClaim[],
): TaskContractIssue[] {
  const issues: TaskContractIssue[] = [];

  for (const [file, dependencies] of Object.entries(fileGraph.missingDependencies)) {
    for (const dependency of dependencies) {
      issues.push({
        code: 'missing-file-dependency',
        severity: 'error',
        message: `${file} references missing dependency file ${dependency}.`,
        file,
        dependency,
      });
    }
  }

  if (fileGraph.cycleNodes.length > 0) {
    issues.push({
      code: 'file-dependency-cycle',
      severity: 'error',
      message: `File dependency cycle detected: ${fileGraph.cycleNodes.join(', ')}.`,
      owners: fileGraph.cycleNodes,
    });
  }

  for (const [canonicalId, dependencies] of Object.entries(taskUnitGraph.missingDependencies)) {
    const [file, unitId] = splitCanonicalId(canonicalId);
    for (const dependency of dependencies) {
      issues.push({
        code: 'missing-task-dependency',
        severity: 'error',
        message: `${canonicalId} references missing dependency ${dependency}.`,
        file,
        unitId,
        canonicalId,
        dependency,
      });
    }
  }

  if (taskUnitGraph.cycleNodes.length > 0) {
    issues.push({
      code: 'task-dependency-cycle',
      severity: 'error',
      message: `Task-unit dependency cycle detected: ${taskUnitGraph.cycleNodes.join(', ')}.`,
      owners: taskUnitGraph.cycleNodes,
    });
  }

  for (const file of files) {
    if (file.units.length === 0) {
      issues.push({
        code: 'empty-task-file',
        severity: 'error',
        message: `${file.filename} has no parseable task sections or top-level task metadata.`,
        file: file.filename,
      });
    }

    for (const unit of file.units) {
      if (unit.schemaVersion === 'legacy') {
        issues.push(unitIssue(
          file,
          unit,
          'legacy-task-schema',
          'warning',
          `${unit.canonicalId} uses the legacy task schema; add Artifact kind, Requirement IDs, Evidence level, and Runtime reachability to migrate to schema version 2.`,
        ));
      } else {
        if (unit.invalidArtifactKind) {
          issues.push(unitIssue(
            file,
            unit,
            'invalid-artifact-kind',
            'error',
            `${unit.canonicalId} declares invalid Artifact kind ${unit.invalidArtifactKind}.`,
          ));
        } else if (!unit.artifactKind) {
          issues.push(unitIssue(
            file,
            unit,
            'missing-artifact-kind',
            'error',
            `${unit.canonicalId} is missing an Artifact kind field.`,
          ));
        }

        if (unit.requirementIds.length === 0) {
          issues.push(unitIssue(
            file,
            unit,
            'missing-requirement-ids',
            'error',
            `${unit.canonicalId} is missing stable Requirement IDs.`,
          ));
        }

        if (unit.invalidEvidenceLevel) {
          issues.push(unitIssue(
            file,
            unit,
            'invalid-evidence-level',
            'error',
            `${unit.canonicalId} declares invalid Evidence level ${unit.invalidEvidenceLevel}.`,
          ));
        } else if (!unit.evidenceLevel) {
          issues.push(unitIssue(
            file,
            unit,
            'missing-evidence-level',
            'error',
            `${unit.canonicalId} is missing an Evidence level field.`,
          ));
        }

        if (!unit.runtimeReachability?.trim()) {
          issues.push(unitIssue(
            file,
            unit,
            'missing-runtime-reachability',
            'error',
            `${unit.canonicalId} is missing a Runtime reachability field.`,
          ));
        }

        if (
          unit.evidenceLevel === 'static'
          && unit.artifactKind
          && isImplementationArtifact(unit.artifactKind)
          && describesBehavioralClosure(unit)
        ) {
          issues.push(unitIssue(
            file,
            unit,
            'static-only-behavioral-closure',
            'error',
            `${unit.canonicalId} uses static evidence for behavior-heavy work; require compile, unit, integration, UI, device, manual-review, or external evidence.`,
          ));
        }

        if (unit.artifactKind && isNonRuntimeArtifact(unit.artifactKind) && claimsRuntimeSource(unit)) {
          issues.push(unitIssue(
            file,
            unit,
            'artifact-runtime-path-mismatch',
            'error',
            `${unit.canonicalId} classifies non-runtime work as ${unit.artifactKind} but claims a Swift, Kotlin, or production runtime source path.`,
          ));
        }
      }

      if (unit.invalidPhase) {
        issues.push({
          code: 'invalid-phase',
          severity: 'error',
          message: `${unit.canonicalId} declares invalid phase ${unit.invalidPhase}.`,
          file: file.filename,
          unitId: unit.id,
          canonicalId: unit.canonicalId,
        });
      } else if (!unit.phase) {
        issues.push({
          code: 'missing-phase',
          severity: 'error',
          message: `${unit.canonicalId} is missing a Phase field.`,
          file: file.filename,
          unitId: unit.id,
          canonicalId: unit.canonicalId,
        });
      }

      if (!unit.closesUserStory) {
        issues.push({
          code: 'missing-user-story',
          severity: 'error',
          message: `${unit.canonicalId} is missing a Closes user story field.`,
          file: file.filename,
          unitId: unit.id,
          canonicalId: unit.canonicalId,
        });
      } else if (!isWellFormedUserStory(unit.closesUserStory)) {
        issues.push({
          code: 'malformed-user-story',
          severity: 'error',
          message: `${unit.canonicalId} has a malformed Closes user story field.`,
          file: file.filename,
          unitId: unit.id,
          canonicalId: unit.canonicalId,
        });
      }

      if (!unit.changeType) {
        issues.push({
          code: 'missing-change-type',
          severity: 'error',
          message: `${unit.canonicalId} is missing a Change type field.`,
          file: file.filename,
          unitId: unit.id,
          canonicalId: unit.canonicalId,
        });
      } else if (!['create-new', 'modify-existing'].includes(unit.changeType)) {
        issues.push({
          code: 'invalid-change-type',
          severity: 'error',
          message: `${unit.canonicalId} declares invalid Change type ${unit.changeType}.`,
          file: file.filename,
          unitId: unit.id,
          canonicalId: unit.canonicalId,
        });
      }

      if (!unit.preciseChange) {
        issues.push({
          code: 'missing-precise-change',
          severity: 'error',
          message: `${unit.canonicalId} is missing a Precise change field.`,
          file: file.filename,
          unitId: unit.id,
          canonicalId: unit.canonicalId,
        });
      }

      if (unit.acceptanceBullets.length < 3) {
        issues.push({
          code: 'shallow-acceptance',
          severity: 'error',
          message: `${unit.canonicalId} must have at least 3 Acceptance bullets.`,
          file: file.filename,
          unitId: unit.id,
          canonicalId: unit.canonicalId,
        });
      }

      if (unit.acceptanceBullets.some(isTautologicalAcceptance)) {
        issues.push({
          code: 'tautological-acceptance',
          severity: 'error',
          message: `${unit.canonicalId} has tautological Acceptance bullets.`,
          file: file.filename,
          unitId: unit.id,
          canonicalId: unit.canonicalId,
        });
      }

      if (unit.filePaths.length === 0) {
        issues.push({
          code: 'missing-file-path',
          severity: 'error',
          message: `${unit.canonicalId} is missing a parseable File field.`,
          file: file.filename,
          unitId: unit.id,
          canonicalId: unit.canonicalId,
        });
      }

      if (!unit.dependsOnRaw) {
        issues.push({
          code: 'missing-depends-on',
          severity: 'error',
          message: `${unit.canonicalId} is missing a Depends on field.`,
          file: file.filename,
          unitId: unit.id,
          canonicalId: unit.canonicalId,
        });
      } else if (!isNoneDependency(unit.dependsOnRaw) && !hasDependencyReason(unit.dependsOnRaw)) {
        issues.push({
          code: 'missing-dependency-reason',
          severity: 'error',
          message: `${unit.canonicalId} has a non-none Depends on field without a reason.`,
          file: file.filename,
          unitId: unit.id,
          canonicalId: unit.canonicalId,
        });
      }

      if (!unit.test) {
        issues.push({
          code: 'missing-test',
          severity: 'error',
          message: `${unit.canonicalId} is missing a Test field.`,
          file: file.filename,
          unitId: unit.id,
          canonicalId: unit.canonicalId,
        });
      }

      if (!unit.estimatedLoc) {
        issues.push({
          code: 'missing-estimated-loc',
          severity: 'error',
          message: `${unit.canonicalId} is missing an Estimated LOC field.`,
          file: file.filename,
          unitId: unit.id,
          canonicalId: unit.canonicalId,
        });
      }
    }
  }

  for (const claim of duplicatePathClaims) {
    issues.push({
      code: 'duplicate-file-path',
      severity: 'warning',
      message: `${claim.path} is claimed by multiple task units.`,
      path: claim.path,
      owners: claim.owners.map((owner) => owner.canonicalId),
    });
  }

  return issues.sort(compareIssues);
}

function compareIssues(a: TaskContractIssue, b: TaskContractIssue): number {
  return (
    severityRank(a.severity) - severityRank(b.severity)
    || a.code.localeCompare(b.code)
    || (a.file ?? '').localeCompare(b.file ?? '')
    || (a.canonicalId ?? '').localeCompare(b.canonicalId ?? '')
    || (a.dependency ?? '').localeCompare(b.dependency ?? '')
    || (a.path ?? '').localeCompare(b.path ?? '')
  );
}

function severityRank(severity: TaskContractIssueSeverity): number {
  return severity === 'error' ? 0 : 1;
}

function splitCanonicalId(canonicalId: string): [string | undefined, string | undefined] {
  const [file, unitId] = canonicalId.split('#');
  return [file, unitId];
}

function isWellFormedUserStory(raw: string): boolean {
  return /^As (a|an|the)\s+.+,\s+I (want|need)\s+.+,\s+so that\s+.+/i.test(raw.trim());
}

function isNoneDependency(raw: string): boolean {
  return /^none[.\s]*$/i.test(raw.trim());
}

function hasDependencyReason(raw: string): boolean {
  return /(reason|because|needs|requires|blocked by|\(|—|-[\s])/i.test(raw);
}

function isTautologicalAcceptance(raw: string): boolean {
  return /^(it\s+(works?|passes?|runs?|builds?)|(the\s+|all\s+)?(tests?|everything)\s+pass(es)?|works?|builds?|runs?|no errors?|success(ful)?|done|functional|complete)\s*\.?$/i
    .test(raw.trim());
}

function unitIssue(
  file: ParsedPlanFile,
  unit: ParsedTaskUnit,
  code: TaskContractIssueCode,
  severity: TaskContractIssueSeverity,
  message: string,
): TaskContractIssue {
  return {
    code,
    severity,
    message,
    file: file.filename,
    unitId: unit.id,
    canonicalId: unit.canonicalId,
  };
}

function describesBehavioralClosure(unit: ParsedTaskUnit): boolean {
  const text = [
    unit.title,
    unit.closesUserStory,
    unit.preciseChange,
    ...unit.acceptanceBullets,
  ].filter(isDefined).join(' ').toLowerCase();

  return /\b(runtime behavior|behaviou?r|persistence|persist(?:s|ed|ence)?|permission|delet(?:e|es|ed|ion)|security|secure|data[ -]integrity|integrity)\b/.test(text);
}

function isNonRuntimeArtifact(kind: ArtifactKind): boolean {
  return !['runtime-source', 'test-source'].includes(kind);
}

function isImplementationArtifact(kind: ArtifactKind): boolean {
  return ['runtime-source', 'test-source', 'config'].includes(kind);
}

function claimsRuntimeSource(unit: ParsedTaskUnit): boolean {
  const reachability = unit.runtimeReachability ?? '';
  return unit.filePaths.some((filePath) => (
    /(?:^|[\/])(?:src[\/]main|Sources)[\/]/i.test(filePath)
    || /\.(?:swift|kt)$/i.test(filePath)
  ))
    || /\b(?:Swift|Kotlin)\b.*\b(?:runtime|source|path)\b/i.test(reachability)
    || /\b(?:runtime|source|path)\b.*\b(?:Swift|Kotlin)\b/i.test(reachability);
}

function uniqueSchemaVersions(values: TaskSchemaVersion[]): TaskSchemaVersion[] {
  return [...new Set(values)].sort((a, b) => String(a).localeCompare(String(b)));
}

function uniqueSorted<T extends string>(values: T[]): T[] {
  return [...new Set(values)].sort();
}

function isDefined<T>(value: T | undefined): value is T {
  return value !== undefined;
}
