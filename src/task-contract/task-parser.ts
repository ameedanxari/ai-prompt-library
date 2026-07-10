import * as fs from 'node:fs';
import * as path from 'node:path';

export const PHASES = ['foundation', 'mvp', 'expand', 'polish'] as const;
export const ARTIFACT_KINDS = [
  'runtime-source',
  'test-source',
  'docs',
  'config',
  'asset',
  'generated-evidence',
  'external-action',
] as const;
export const EVIDENCE_LEVELS = [
  'static',
  'compile',
  'unit',
  'integration',
  'ui-fixture',
  'device',
  'manual-review',
  'external',
] as const;

export type TaskPhase = (typeof PHASES)[number];
export type ArtifactKind = (typeof ARTIFACT_KINDS)[number];
export type EvidenceLevel = (typeof EVIDENCE_LEVELS)[number];
export type TaskSchemaVersion = 2 | 'legacy';
export type PlanFileKind = 'tasks' | 'remediation';

export interface TaskDependencyRef {
  raw: string;
  file?: string;
  localTaskId?: string;
}

export interface ParsedTaskUnit {
  id: string;
  canonicalId: string;
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
  requirementIdsRaw?: string;
  requirementIds: string[];
  evidenceLevel?: EvidenceLevel;
  invalidEvidenceLevel?: string;
  runtimeReachability?: string;
  productionOwner?: string;
}

export interface ParsedPlanFile {
  filename: string;
  filePath?: string;
  kind: PlanFileKind;
  slug: string;
  title?: string;
  units: ParsedTaskUnit[];
}

export interface PlanGraphNode {
  id: string;
  dependencies: string[];
  missingDependencies: string[];
}

export interface PlanGraph {
  nodes: PlanGraphNode[];
  missingDependencies: Record<string, string[]>;
  cycleNodes: string[];
  topologicalOrder: string[];
}

interface Section {
  id: string;
  title: string;
  lineNumber: number;
  lines: string[];
}

const planFileNamePattern = /^(tasks|remediation)-(.+)\.md$/;
const headingPattern = /^##\s+([TR][0-9]+)(?:\s*[·.-]\s*)?(.*)$/;
const fieldPattern = /^\s*[-*]?\s*\*\*([^:*]+):\*\*\s*(.*)$/;
const dependencyFilePattern = /\b(?:tasks|remediation)-[a-z0-9][a-z0-9-]*\.md\b/g;
const localTaskPattern = /\b[TR][0-9]+\b/g;

export function isPlanTaskFilename(filename: string): boolean {
  return planFileNamePattern.test(path.basename(filename));
}

export function inferPlanFileKind(filename: string): PlanFileKind {
  const match = path.basename(filename).match(planFileNamePattern);
  if (!match) {
    throw new Error(`Not a plan task filename: ${filename}`);
  }
  return match[1] as PlanFileKind;
}

export function inferPlanFileSlug(filename: string): string {
  const match = path.basename(filename).match(planFileNamePattern);
  if (!match) {
    throw new Error(`Not a plan task filename: ${filename}`);
  }
  return match[2];
}

export function parsePlanTaskFile(
  filename: string,
  content: string,
  filePath?: string,
): ParsedPlanFile {
  const base = path.basename(filename);
  const kind = inferPlanFileKind(base);
  const slug = inferPlanFileSlug(base);
  const lines = content.split(/\r?\n/);
  const title = lines.find((line) => line.startsWith('# '))?.replace(/^#\s+/, '').trim();
  const sections = splitTaskSections(lines);

  return {
    filename: base,
    filePath,
    kind,
    slug,
    title,
    units: sections.map((section) => parseTaskSection(base, section)),
  };
}

export function parsePlanTaskDirectory(targetDir: string): ParsedPlanFile[] {
  const entries = fs.readdirSync(targetDir)
    .filter(isPlanTaskFilename)
    .sort();

  return entries.map((entry) => {
    const fullPath = path.join(targetDir, entry);
    return parsePlanTaskFile(entry, fs.readFileSync(fullPath, 'utf8'), fullPath);
  });
}

export function buildFileDependencyGraph(files: ParsedPlanFile[]): PlanGraph {
  const ids = new Set(files.map((file) => file.filename));
  const nodes = files.map((file) => {
    const dependencies = unique(
      file.units.flatMap((unit) => unit.dependencies)
        .map((dep) => dep.file)
        .filter((dep): dep is string => Boolean(dep))
        .filter((dep) => dep !== file.filename),
    ).sort();
    const missingDependencies = dependencies.filter((dep) => !ids.has(dep));
    return { id: file.filename, dependencies, missingDependencies };
  });

  return finishGraph(nodes);
}

export function buildTaskUnitDependencyGraph(files: ParsedPlanFile[]): PlanGraph {
  const units = files.flatMap((file) => file.units.map((unit) => ({ file, unit })));
  const ids = new Set(units.map(({ unit }) => unit.canonicalId));
  const unitsByFile = new Map<string, string[]>();
  const unitsByLocalId = new Map<string, string>();

  for (const { file, unit } of units) {
    const byFile = unitsByFile.get(file.filename) ?? [];
    byFile.push(unit.canonicalId);
    unitsByFile.set(file.filename, byFile);
    unitsByLocalId.set(`${file.filename}#${unit.id}`, unit.canonicalId);
  }

  const nodes = units.map(({ file, unit }) => {
    const dependencies = unique(unit.dependencies.flatMap((dep) => {
      if (dep.file) {
        return unitsByFile.get(dep.file) ?? [dep.file];
      }
      if (dep.localTaskId) {
        return [unitsByLocalId.get(`${file.filename}#${dep.localTaskId}`) ?? `${file.filename}#${dep.localTaskId}`];
      }
      return [];
    })).filter((dep) => dep !== unit.canonicalId).sort();

    return {
      id: unit.canonicalId,
      dependencies,
      missingDependencies: dependencies.filter((dep) => !ids.has(dep)),
    };
  });

  return finishGraph(nodes);
}

export function extractFilePaths(raw: string): string[] {
  const trimmed = stripTrailingInlineComment(raw).trim();
  if (!trimmed || /^(none|n\/a|tbd|—)$/i.test(trimmed)) return [];

  const backtickMatches = [...trimmed.matchAll(/`([^`]+)`/g)].map((match) => match[1].trim());
  if (backtickMatches.length > 0) {
    return unique(backtickMatches.flatMap((token) => splitPipeSeparated(token)));
  }

  return unique(splitPipeSeparated(trimmed).filter((part) => !/\s/.test(part)));
}

export function extractDependencyRefs(raw: string): TaskDependencyRef[] {
  const trimmed = raw.trim();
  if (!trimmed || /^none[.\s]*$/i.test(trimmed)) return [];

  const refs: TaskDependencyRef[] = [];
  const seen = new Set<string>();
  for (const match of trimmed.matchAll(dependencyFilePattern)) {
    const dep = match[0];
    if (!seen.has(`file:${dep}`)) {
      refs.push({ raw: dep, file: dep });
      seen.add(`file:${dep}`);
    }
  }
  for (const match of trimmed.matchAll(localTaskPattern)) {
    const dep = match[0];
    if (!seen.has(`local:${dep}`)) {
      refs.push({ raw: dep, localTaskId: dep });
      seen.add(`local:${dep}`);
    }
  }
  return refs;
}

function splitTaskSections(lines: string[]): Section[] {
  const sections: Section[] = [];
  let current: Section | null = null;
  const topLevelLines: string[] = [];
  let topLevelLineNumber = 1;

  lines.forEach((line, index) => {
    const heading = line.match(headingPattern);
    if (heading) {
      if (current) sections.push(current);
      current = {
        id: heading[1],
        title: heading[2]?.trim() || heading[1],
        lineNumber: index + 1,
        lines: [line],
      };
      return;
    }

    if (current) {
      current.lines.push(line);
    } else {
      if (topLevelLines.length === 0 && line.trim()) topLevelLineNumber = index + 1;
      topLevelLines.push(line);
    }
  });

  if (current) sections.push(current);

  const topLevelHasMetadata = topLevelLines.some((line) => fieldPattern.test(line));
  if (topLevelHasMetadata) {
    sections.unshift({
      id: 'TASK',
      title: 'Top-level task',
      lineNumber: topLevelLineNumber,
      lines: topLevelLines,
    });
  }

  return sections;
}

function parseTaskSection(filename: string, section: Section): ParsedTaskUnit {
  const unit: ParsedTaskUnit = {
    id: section.id,
    canonicalId: `${filename}#${section.id}`,
    title: section.title,
    lineNumber: section.lineNumber,
    acceptanceBullets: [],
    filePaths: [],
    dependencies: [],
    schemaVersion: 'legacy',
    requirementIds: [],
  };
  let hasTypedMetadata = false;

  for (let index = 0; index < section.lines.length; index += 1) {
    const line = section.lines[index];
    const field = line.match(fieldPattern);
    if (!field) continue;
    const fieldName = normalizeFieldName(field[1]);
    const value = field[2].trim();

    switch (fieldName) {
      case 'closes user story':
        unit.closesUserStory = value;
        break;
      case 'change type':
        unit.changeType = value.split(/\s+/)[0];
        break;
      case 'precise change':
        unit.preciseChange = value;
        break;
      case 'acceptance':
        unit.acceptanceBullets = extractAcceptanceBullets(section.lines, index + 1);
        break;
      case 'file':
        unit.fileRaw = unit.fileRaw ? `${unit.fileRaw} | ${value}` : value;
        unit.filePaths = unique([...unit.filePaths, ...extractFilePaths(value)]);
        break;
      case 'depends on':
        unit.dependsOnRaw = unit.dependsOnRaw ? `${unit.dependsOnRaw}; ${value}` : value;
        unit.dependencies = uniqueDependencies([
          ...unit.dependencies,
          ...extractDependencyRefs(value),
        ]);
        break;
      case 'test':
        unit.test = value;
        break;
      case 'estimated loc':
        unit.estimatedLoc = value;
        break;
      case 'phase': {
        const phaseValue = value.replace(/[.。]$/, '').trim().toLowerCase();
        if (isTaskPhase(phaseValue)) {
          unit.phase = phaseValue;
        } else {
          unit.invalidPhase = value;
        }
        break;
      }
      case 'artifact kind': {
        hasTypedMetadata = true;
        const artifactKindValue = normalizeEnumValue(value);
        if (isArtifactKind(artifactKindValue)) {
          unit.artifactKind = artifactKindValue;
        } else {
          unit.invalidArtifactKind = value;
        }
        break;
      }
      case 'requirement ids':
        hasTypedMetadata = true;
        unit.requirementIdsRaw = value;
        unit.requirementIds = unique(value
          .split(',')
          .map((requirementId) => requirementId.trim())
          .filter(Boolean));
        break;
      case 'evidence level': {
        hasTypedMetadata = true;
        const evidenceLevelValue = normalizeEnumValue(value);
        if (isEvidenceLevel(evidenceLevelValue)) {
          unit.evidenceLevel = evidenceLevelValue;
        } else {
          unit.invalidEvidenceLevel = value;
        }
        break;
      }
      case 'runtime reachability':
        hasTypedMetadata = true;
        unit.runtimeReachability = value;
        break;
      case 'production owner':
        hasTypedMetadata = true;
        unit.productionOwner = value;
        break;
    }
  }

  unit.schemaVersion = hasTypedMetadata ? 2 : 'legacy';
  return unit;
}

function extractAcceptanceBullets(lines: string[], startIndex: number): string[] {
  const bullets: string[] = [];

  for (const line of lines.slice(startIndex)) {
    if (fieldPattern.test(line) || /^##\s+/.test(line)) break;
    const bullet = line.match(/^\s{2,}[-*]\s+(.+?)\s*$/);
    if (bullet) bullets.push(bullet[1].trim());
  }

  return bullets;
}

function finishGraph(nodes: PlanGraphNode[]): PlanGraph {
  const ids = new Set(nodes.map((node) => node.id));
  const dependenciesById = new Map(nodes.map((node) => [node.id, node.dependencies.filter((dep) => ids.has(dep))]));
  const inDegree = new Map<string, number>();
  const dependents = new Map<string, string[]>();

  for (const node of nodes) {
    inDegree.set(node.id, 0);
    dependents.set(node.id, []);
  }

  for (const node of nodes) {
    for (const dep of dependenciesById.get(node.id) ?? []) {
      inDegree.set(node.id, (inDegree.get(node.id) ?? 0) + 1);
      dependents.get(dep)?.push(node.id);
    }
  }

  const ready = [...inDegree.entries()]
    .filter(([, degree]) => degree === 0)
    .map(([id]) => id)
    .sort();
  const topologicalOrder: string[] = [];

  while (ready.length > 0) {
    const id = ready.shift()!;
    topologicalOrder.push(id);
    for (const child of dependents.get(id)?.sort() ?? []) {
      const nextDegree = (inDegree.get(child) ?? 0) - 1;
      inDegree.set(child, nextDegree);
      if (nextDegree === 0) {
        ready.push(child);
        ready.sort();
      }
    }
  }

  const cycleNodes = nodes
    .map((node) => node.id)
    .filter((id) => !topologicalOrder.includes(id))
    .sort();

  return {
    nodes,
    missingDependencies: Object.fromEntries(
      nodes
        .filter((node) => node.missingDependencies.length > 0)
        .map((node) => [node.id, node.missingDependencies]),
    ),
    cycleNodes,
    topologicalOrder,
  };
}

function splitPipeSeparated(raw: string): string[] {
  return raw
    .split(/\s*\|\s*/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function stripTrailingInlineComment(raw: string): string {
  return raw.replace(/\s+#.*$/, '');
}

function normalizeFieldName(raw: string): string {
  return raw.trim().replace(/\s+/g, ' ').toLowerCase();
}

function isTaskPhase(value: string): value is TaskPhase {
  return (PHASES as readonly string[]).includes(value);
}

function isArtifactKind(value: string): value is ArtifactKind {
  return (ARTIFACT_KINDS as readonly string[]).includes(value);
}

function isEvidenceLevel(value: string): value is EvidenceLevel {
  return (EVIDENCE_LEVELS as readonly string[]).includes(value);
}

function normalizeEnumValue(raw: string): string {
  return raw.replace(/[.。]$/, '').trim().toLowerCase();
}

function unique<T>(values: T[]): T[] {
  return [...new Set(values)];
}

function uniqueDependencies(values: TaskDependencyRef[]): TaskDependencyRef[] {
  const seen = new Set<string>();
  const result: TaskDependencyRef[] = [];
  for (const value of values) {
    const key = value.file ? `file:${value.file}` : `local:${value.localTaskId ?? value.raw}`;
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(value);
  }
  return result;
}
