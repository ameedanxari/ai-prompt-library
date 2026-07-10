#!/usr/bin/env bash
# Validate production walking-skeleton coverage from task-contract.json.

set -uo pipefail

TARGET_DIR="${1:-prompts/outputs/current}"
CONTRACT="$TARGET_DIR/task-contract.json"
REPORT="$TARGET_DIR/walking-skeleton-report.json"

resolve_script_dir() {
  local source="${BASH_SOURCE[0]}"
  while [ -L "$source" ]; do
    local dir target
    dir="$(cd -P "$(dirname "$source")" && pwd)"
    target="$(readlink "$source")"
    case "$target" in
      /*) source="$target" ;;
      *) source="$dir/$target" ;;
    esac
  done
  cd -P "$(dirname "$source")" && pwd
}

SCRIPT_DIR="$(resolve_script_dir)"
# shellcheck source=scripts/lib/toolchain.sh
source "$SCRIPT_DIR/lib/toolchain.sh"

if [ ! -d "$TARGET_DIR" ]; then
  echo "walking-skeleton prerequisite error: target directory does not exist: $TARGET_DIR" >&2
  exit 2
fi
if [ ! -f "$CONTRACT" ]; then
  echo "walking-skeleton prerequisite error: task contract not found: $CONTRACT" >&2
  exit 2
fi
if ! require_tool node resolve_node; then
  exit 2
fi

produce_report() {
  local temporary="$1"
  "$RESOLVED_NODE" - "$CONTRACT" "$temporary" <<'NODE'
const fs = require('node:fs');

const [contractPath, reportPath] = process.argv.slice(2);
const contract = JSON.parse(fs.readFileSync(contractPath, 'utf8'));
const units = Array.isArray(contract.units) ? contract.units : [];
const issues = [];

const text = (value) => value == null ? '' : String(value).trim();
const lower = (value) => text(value).toLowerCase();
const unique = (values) => [...new Set(values.filter(Boolean))].sort();
const direct = (unit, ...keys) => {
  for (const key of keys) {
    if (text(unit[key])) return text(unit[key]);
  }
  return '';
};
const metadata = (unit, ...keys) => {
  const reachability = text(unit.runtimeReachability);
  for (const key of keys) {
    const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const match = reachability.match(new RegExp(`(?:^|[;|,])\\s*${escaped}\\s*[:=]\\s*([^;|,]+)`, 'i'));
    if (match) return match[1].trim();
  }
  return '';
};
const surfaceFor = (unit) => {
  const explicit = direct(unit, 'productSurface', 'product_surface', 'surface') ||
    metadata(unit, 'product-surface', 'product_surface', 'surface');
  if (explicit) return lower(explicit);
  for (const filePath of unit.filePaths || []) {
    const normalized = lower(filePath).replace(/^\.\//, '');
    if (/^(ios|android|web|frontend|macos|windows|linux)\//.test(normalized)) {
      const prefix = normalized.split('/')[0];
      return prefix === 'frontend' ? 'web' : prefix;
    }
    if (/^src\/(app|pages|routes)\//.test(normalized)) return 'web';
  }
  return '';
};
const taskType = (unit) => lower(direct(unit, 'taskType', 'task_type') || metadata(unit, 'task-type', 'task_type'));
const releaseGate = (unit) => lower(direct(unit, 'releaseGate', 'release_gate') || metadata(unit, 'release-gate', 'release_gate'));
const markerText = (unit) => lower([
  unit.canonicalId, unit.file, unit.title, unit.preciseChange,
  unit.runtimeReachability, taskType(unit), releaseGate(unit),
].join(' '));
const isSkeleton = (unit) => /mvp[- ]walking[- ]skeleton/.test(markerText(unit));
const isCompositionTask = (unit) => /cross[- ]feature[- ]composition/.test(taskType(unit)) ||
  /task-type\s*[:=]\s*cross[- ]feature[- ]composition/.test(lower(unit.runtimeReachability));
const hasCompositionRoot = (unit) => /production[- ]composition[- ]root\s*[:=]/.test(lower(unit.runtimeReachability)) ||
  Boolean(direct(unit, 'compositionRoot', 'composition_root'));
const hasPrimaryFlow = (unit) => /\bflow-[a-z0-9-]+\b/i.test(text(unit.runtimeReachability)) ||
  Boolean(direct(unit, 'primaryFlowId', 'primary_flow_id'));
const dependencies = (unit) => (unit.dependencies || []).flatMap((dependency) => {
  if (typeof dependency === 'string') return [dependency];
  return [dependency.raw, dependency.file, dependency.canonicalId, dependency.taskId]
    .map(text)
    .filter(Boolean);
});
const addIssue = (code, message, unit, surface) => issues.push({
  code,
  surface: surface || undefined,
  file: unit?.file,
  taskId: unit?.canonicalId,
  message,
});

const declaredSurfaces = [];
for (const entry of contract.productSurfaces || contract.product_surfaces || []) {
  declaredSurfaces.push(lower(typeof entry === 'string' ? entry : entry.id || entry.name));
}
for (const unit of units) {
  const surface = surfaceFor(unit);
  const runtimeCandidate = lower(unit.artifactKind) === 'runtime-source' || isSkeleton(unit) || isCompositionTask(unit);
  if (surface && runtimeCandidate) declaredSurfaces.push(surface);
}
const surfaces = unique(declaredSurfaces);

if (surfaces.length === 0) {
  fs.writeFileSync(reportPath, JSON.stringify({
    schemaVersion: 1,
    generatedBy: 'scripts/validate-walking-skeleton.sh',
    generatedAt: new Date().toISOString(),
    status: 'not-applicable',
    applicable: false,
    reason: 'task contract declares no shipped product surface with production runtime reachability',
    surfaces: [],
    issues: [],
  }, null, 2) + '\n');
  process.exit(0);
}

const skeletons = units.filter(isSkeleton);
const unitsById = new Map(units.map((unit) => [unit.canonicalId, unit]));
const surfaceResults = [];

for (const surface of surfaces) {
  const candidates = skeletons.filter((unit) => surfaceFor(unit) === surface);
  if (candidates.length === 0) {
    addIssue('missing-walking-skeleton', `Product surface ${surface} has no mvp-walking-skeleton task.`, undefined, surface);
    surfaceResults.push({ id: surface, skeletonTaskIds: [], valid: false });
    continue;
  }
  if (candidates.length > 1) {
    addIssue('duplicate-walking-skeleton', `Product surface ${surface} must have exactly one mvp-walking-skeleton task; found ${candidates.length}.`, undefined, surface);
  }

  for (const unit of candidates) {
    const owner = direct(unit, 'productionOwner', 'production_owner');
    const evidence = lower(unit.evidenceLevel);
    const productionArtifact = lower(unit.artifactKind) === 'runtime-source' || isCompositionTask(unit);
    const fixtureOnly = /\b(fixture|preview|mock|demo)[- ]?(only|wiring|composition)?\b/.test(markerText(unit));
    const testOnly = /^(true|yes|1)$/.test(lower(direct(unit, 'testOnly', 'test_only') || metadata(unit, 'test-only', 'test_only')));
    const evidenceTaskId = direct(unit, 'productionWiringEvidenceTaskId', 'production_wiring_evidence_task_id') ||
      metadata(unit, 'production-wiring-evidence', 'production_wiring_evidence');
    const paired = unitsById.get(evidenceTaskId);
    const pairedProduction = paired && lower(paired.artifactKind) === 'runtime-source' &&
      Boolean(direct(paired, 'productionOwner', 'production_owner')) && hasCompositionRoot(paired);

    if (!productionArtifact) addIssue('non-production-skeleton-artifact', 'Walking skeleton must own runtime-source wiring or declare cross-feature-composition metadata.', unit, surface);
    if (!owner) addIssue('missing-production-owner', 'Walking skeleton must name the production composition-root owner.', unit, surface);
    if (!hasCompositionRoot(unit) && !pairedProduction) addIssue('missing-production-composition-root', 'Walking skeleton must name a production composition root.', unit, surface);
    if (!hasPrimaryFlow(unit)) addIssue('missing-primary-flow', 'Walking skeleton must preserve at least one primary FLOW-* identifier.', unit, surface);
    if (!['integration', 'device'].includes(evidence)) addIssue('insufficient-skeleton-evidence', 'Walking skeleton requires integration or device evidence through real production boundaries.', unit, surface);
    if (releaseGate(unit) !== 'mvp-walking-skeleton') addIssue('missing-skeleton-release-gate', 'Walking skeleton must declare release-gate=mvp-walking-skeleton.', unit, surface);
    if (fixtureOnly && !(testOnly && pairedProduction)) {
      addIssue('fixture-only-skeleton', 'Fixture-only skeleton evidence requires test-only=true and a paired production wiring evidence task.', unit, surface);
    }
  }

  surfaceResults.push({
    id: surface,
    skeletonTaskIds: candidates.map((unit) => unit.canonicalId).sort(),
    valid: !issues.some((issue) => issue.surface === surface),
  });
}

for (const unit of units.filter((candidate) => ['expand', 'polish'].includes(lower(candidate.phase)))) {
  const surface = surfaceFor(unit);
  const runtimeExpansion = lower(unit.artifactKind) === 'runtime-source' || Boolean(surface);
  if (!runtimeExpansion) continue;
  if (!surface) {
    addIssue('missing-expansion-surface', 'Runtime expansion task must declare product-surface metadata.', unit);
    continue;
  }
  const skeletonRefs = skeletons
    .filter((skeleton) => surfaceFor(skeleton) === surface)
    .flatMap((skeleton) => [skeleton.canonicalId, skeleton.file]);
  const refs = dependencies(unit);
  if (!skeletonRefs.some((skeletonRef) => refs.includes(skeletonRef))) {
    addIssue('expansion-missing-skeleton-dependency', `Expansion task must depend on the ${surface} walking skeleton.`, unit, surface);
  }
}

issues.sort((a, b) => `${a.surface || ''}:${a.taskId || ''}:${a.code}`.localeCompare(`${b.surface || ''}:${b.taskId || ''}:${b.code}`));
fs.writeFileSync(reportPath, JSON.stringify({
  schemaVersion: 1,
  generatedBy: 'scripts/validate-walking-skeleton.sh',
  generatedAt: new Date().toISOString(),
  status: issues.length === 0 ? 'pass' : 'fail',
  applicable: true,
  reason: issues.length === 0 ? 'every product surface has a production walking skeleton' : 'blocking walking-skeleton inconsistencies found',
  surfaces: surfaceResults,
  issues,
}, null, 2) + '\n');
NODE
}

if ! write_atomic_report "$REPORT" produce_report; then
  echo "walking-skeleton report error: $ATOMIC_REPORT_STATUS" >&2
  exit 2
fi

report_status="$("$RESOLVED_NODE" -e 'const fs=require("node:fs"); process.stdout.write(JSON.parse(fs.readFileSync(process.argv[1], "utf8")).status)' "$REPORT")"
issue_count="$("$RESOLVED_NODE" -e 'const fs=require("node:fs"); process.stdout.write(String(JSON.parse(fs.readFileSync(process.argv[1], "utf8")).issues.length))' "$REPORT")"
echo "Walking-skeleton report: $REPORT (status=$report_status, issues=$issue_count)"
case "$report_status" in
  pass)
    echo "✅ walking-skeleton gate: pass"
    exit 0
    ;;
  not-applicable)
    echo "ℹ️  walking-skeleton gate: not applicable — no shipped product surfaces"
    exit 0
    ;;
  *)
    "$RESOLVED_NODE" -e 'const fs=require("node:fs"); for (const issue of JSON.parse(fs.readFileSync(process.argv[1], "utf8")).issues) console.log(`  - ${issue.code}${issue.surface ? ` [${issue.surface}]` : ""}${issue.taskId ? ` [${issue.taskId}]` : ""}: ${issue.message}`)' "$REPORT"
    echo "❌ walking-skeleton gate: fail"
    exit 1
    ;;
esac
