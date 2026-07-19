#!/usr/bin/env bash
# Validate temporary fixture allowances and production composition isolation.

set -uo pipefail

TARGET_DIR="${1:-prompts/outputs/current}"
CONTRACT="$TARGET_DIR/task-contract.json"
REPORT="$TARGET_DIR/fixture-isolation-report.json"

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
  echo "fixture-isolation prerequisite error: target directory does not exist: $TARGET_DIR" >&2
  exit 2
fi
if [ ! -f "$CONTRACT" ]; then
  echo "fixture-isolation prerequisite error: task contract not found: $CONTRACT" >&2
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
const fixtureMaps = new Set(['test-fixture', 'screenshot', 'preview', 'demo']);
// A unit is fixture-relevant when EITHER signal says so. Keying off the
// composition map alone let a real build (SignalForge, 2026-07) carry
// `Evidence level: ui-fixture` on 47 units while this gate reported
// not-applicable — the two fields must cross-check each other.
const fixtureUnits = units.filter((unit) =>
  fixtureMaps.has(String(unit.compositionMap || '').toLowerCase()) ||
  String(unit.evidenceLevel || '').toLowerCase() === 'ui-fixture');
const issues = [];
const allowances = [];

const value = (input) => input == null ? '' : String(input).trim();
const lower = (input) => value(input).toLowerCase();
const stripTicks = (input) => value(input).replace(/^`|`$/g, '').trim();
const allowanceMetadata = (raw) => Object.fromEntries(value(raw).split(';').flatMap((part) => {
  const index = part.indexOf('=');
  if (index < 0) return [];
  const key = part.slice(0, index).trim().toLowerCase().replace(/[ _]+/g, '-');
  const item = part.slice(index + 1).trim();
  return key && item ? [[key, item]] : [];
}));
const refs = (unit) => (unit?.dependencies || []).flatMap((dependency) => {
  if (typeof dependency === 'string') return [dependency];
  return [dependency.raw, dependency.file, dependency.localTaskId, dependency.canonicalId, dependency.taskId]
    .map(value)
    .filter(Boolean);
});
const references = (source, target) => {
  if (!source || !target) return false;
  const targetRefs = [target.canonicalId, target.file, target.id].map(value).filter(Boolean);
  return refs(source).some((ref) => targetRefs.includes(ref) || targetRefs.some((targetRef) => ref.includes(targetRef)));
};
const findUnit = (rawReference) => {
  const reference = stripTicks(rawReference);
  if (!reference) return undefined;
  return units.find((unit) => [unit.canonicalId, unit.file, `${unit.file}#${unit.id}`, unit.id]
    .map(value)
    .includes(reference));
};
const productionOwned = (unit) => Boolean(value(unit.productionOwner)) ||
  /\b(primary[- ]flow|production|release entry|composition root)\b/.test(lower(unit.runtimeReachability));
const productionIntegration = (unit) => Boolean(unit) &&
  lower(unit.compositionMap) === 'production' &&
  lower(unit.artifactKind) === 'runtime-source' &&
  ['integration', 'device'].includes(lower(unit.evidenceLevel)) &&
  productionOwned(unit);
const addIssue = (code, message, unit) => issues.push({
  code,
  file: unit.file,
  taskId: unit.canonicalId,
  message,
});

if (fixtureUnits.length === 0) {
  fs.writeFileSync(reportPath, JSON.stringify({
    schemaVersion: 1,
    generatedBy: 'scripts/validate-fixture-isolation.sh',
    generatedAt: new Date().toISOString(),
    status: 'not-applicable',
    applicable: false,
    reason: 'task contract declares no fixture, screenshot, preview, or demo composition maps and no ui-fixture evidence levels',
    allowances: [],
    issues: [],
  }, null, 2) + '\n');
  process.exit(0);
}

for (const unit of fixtureUnits) {
  const map = lower(unit.compositionMap);
  const isProductionOwned = productionOwned(unit);
  if (!map) {
    addIssue('missing-composition-map', 'Unit declares Evidence level: ui-fixture but no Composition map; declare production, test-fixture, screenshot, preview, or demo so fixture isolation can be verified.', unit);
  } else if (!fixtureMaps.has(map) && map !== 'production') {
    addIssue('unknown-composition-map', `Composition map "${map}" is not one of production, test-fixture, screenshot, preview, demo.`, unit);
  } else if (map === 'production' && lower(unit.evidenceLevel) === 'ui-fixture') {
    addIssue('production-map-fixture-evidence', 'A production composition map cannot rest on Evidence level: ui-fixture; provide integration or device evidence, or reclassify the unit as a fixture map with a retirement contract.', unit);
  }
  const metadata = allowanceMetadata(unit.fixtureAllowance);
  const owner = metadata.owner || '';
  const expiry = metadata.expiry || '';
  const expiryTime = Date.parse(`${expiry}T23:59:59Z`);
  const calendarDate = new Date(`${expiry}T00:00:00Z`);
  const validCalendarDate = Number.isFinite(calendarDate.getTime()) && calendarDate.toISOString().slice(0, 10) === expiry;
  const replacementReference = stripTicks(unit.fixtureRetirementTask);
  const exclusionCheck = stripTicks(unit.releaseExclusionCheck);
  const replacement = findUnit(replacementReference);
  const dependencyEdge = Boolean(replacement) && (references(unit, replacement) || references(replacement, unit));
  const hasProductionEvidence = productionIntegration(replacement);
  const missingChecks = [];

  if (lower(unit.evidenceLevel) !== 'ui-fixture') {
    missingChecks.push('ui-fixture-evidence-label');
    addIssue('fixture-evidence-level-mismatch', `${map} composition tests must declare Evidence level: ui-fixture.`, unit);
  }

  if (isProductionOwned) {
    if (!value(unit.fixtureAllowance)) {
      missingChecks.push('fixture-allowance');
      addIssue('missing-fixture-allowance', 'Production-owned fixture wiring requires an explicit Fixture allowance.', unit);
    }
    if (!owner) {
      missingChecks.push('owner');
      addIssue('missing-fixture-owner', 'Fixture allowance must name an owner.', unit);
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(expiry) || !validCalendarDate || !Number.isFinite(expiryTime) || expiryTime <= Date.now()) {
      missingChecks.push('unexpired-expiry');
      addIssue('invalid-fixture-expiry', 'Fixture allowance must have a future expiry in YYYY-MM-DD form.', unit);
    }
    if (!replacementReference || !replacement) {
      missingChecks.push('replacement-task');
      addIssue('missing-fixture-retirement-task', 'Fixture allowance must reference an existing retirement task.', unit);
    }
    if (replacement && !dependencyEdge) {
      missingChecks.push('dependency-edge');
      addIssue('missing-fixture-retirement-dependency', 'Fixture and retirement tasks must have an explicit dependency edge.', unit);
    }
    if (!exclusionCheck || /^(none|n\/a|tbd|todo)$/i.test(exclusionCheck)) {
      missingChecks.push('release-exclusion-check');
      addIssue('missing-release-exclusion-check', 'Fixture allowance must name an executable release-build exclusion check.', unit);
    }
    if (!hasProductionEvidence) {
      missingChecks.push('production-wiring-integration-evidence');
      addIssue('fixture-only-production-verification', 'Fixture evidence cannot satisfy production verification without a production composition-map retirement task using integration or device evidence.', unit);
    }
  }

  allowances.push({
    taskId: unit.canonicalId,
    file: unit.file,
    compositionMap: map,
    productionOwned: isProductionOwned,
    owner: owner || null,
    expiry: expiry || null,
    replacementTask: replacementReference || null,
    replacementResolved: replacement?.canonicalId || null,
    dependencyEdge,
    releaseExclusionCheck: exclusionCheck || null,
    productionWiringEvidenceTask: hasProductionEvidence ? replacement.canonicalId : null,
    missingChecks,
  });
}

issues.sort((a, b) => `${a.taskId}:${a.code}`.localeCompare(`${b.taskId}:${b.code}`));
allowances.sort((a, b) => a.taskId.localeCompare(b.taskId));
fs.writeFileSync(reportPath, JSON.stringify({
  schemaVersion: 1,
  generatedBy: 'scripts/validate-fixture-isolation.sh',
  generatedAt: new Date().toISOString(),
  status: issues.length === 0 ? 'pass' : 'fail',
  applicable: true,
  reason: issues.length === 0 ? 'fixture composition is isolated and retirement-complete' : 'blocking fixture-isolation inconsistencies found',
  allowances,
  issues,
}, null, 2) + '\n');
NODE
}

if ! write_atomic_report "$REPORT" produce_report; then
  echo "fixture-isolation report error: $ATOMIC_REPORT_STATUS" >&2
  exit 2
fi

report_status="$("$RESOLVED_NODE" -e 'const fs=require("node:fs"); process.stdout.write(JSON.parse(fs.readFileSync(process.argv[1], "utf8")).status)' "$REPORT")"
issue_count="$("$RESOLVED_NODE" -e 'const fs=require("node:fs"); process.stdout.write(String(JSON.parse(fs.readFileSync(process.argv[1], "utf8")).issues.length))' "$REPORT")"
echo "Fixture-isolation report: $REPORT (status=$report_status, issues=$issue_count)"
case "$report_status" in
  pass)
    echo "✅ fixture-isolation gate: pass"
    exit 0
    ;;
  not-applicable)
    echo "ℹ️  fixture-isolation gate: not applicable — no fixture composition maps"
    exit 0
    ;;
  *)
    "$RESOLVED_NODE" -e 'const fs=require("node:fs"); for (const issue of JSON.parse(fs.readFileSync(process.argv[1], "utf8")).issues) console.log(`  - ${issue.code} [${issue.taskId}]: ${issue.message}`)' "$REPORT"
    echo "❌ fixture-isolation gate: fail"
    exit 1
    ;;
esac
