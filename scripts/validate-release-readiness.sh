#!/usr/bin/env bash
# validate-release-readiness.sh — pre-tag / pre-publish package gate.
#
# Usage:
#   bash scripts/validate-release-readiness.sh [repo-root]
#
# By default this runs the package build and an npm pack dry-run, then
# validates package metadata, docs examples, bin executability, and
# publish hygiene. Tests may set RELEASE_READINESS_SKIP_BUILD=1 and/or
# RELEASE_READINESS_SKIP_PACK=1 to exercise static validation fixtures.
#
# Exit codes:
#   0  release metadata and dry-run package are ready for review
#   1  release readiness issues found
#   2  preconditions missing

set -uo pipefail

ROOT="${1:-$(pwd)}"

if [ ! -d "$ROOT" ]; then
  echo "❌ repository root not found: $ROOT" >&2
  exit 2
fi

if [ ! -f "$ROOT/package.json" ]; then
  echo "❌ package.json not found in: $ROOT" >&2
  exit 2
fi

if ! command -v python3 >/dev/null 2>&1; then
  echo "❌ python3 not found — required for release readiness validation" >&2
  exit 2
fi

if [ "${RELEASE_READINESS_SKIP_BUILD:-0}" != "1" ]; then
  if ! command -v npm >/dev/null 2>&1; then
    echo "❌ npm not found — required for release readiness validation" >&2
    exit 2
  fi
  (cd "$ROOT" && npm run clean --silent && npm run build --silent) || {
    echo "❌ release readiness build failed" >&2
    exit 2
  }
fi

PACK_JSON=""
if [ "${RELEASE_READINESS_SKIP_PACK:-0}" != "1" ]; then
  if ! command -v npm >/dev/null 2>&1; then
    echo "❌ npm not found — required for release readiness validation" >&2
    exit 2
  fi
  PACK_JSON="$(mktemp)"
  (cd "$ROOT" && npm pack --dry-run --json --ignore-scripts) > "$PACK_JSON" || {
    rm -f "$PACK_JSON"
    echo "❌ npm pack dry-run failed" >&2
    exit 2
  }
fi

python3 - "$ROOT" "$PACK_JSON" <<'PY'
import json
import math
import os
import re
import stat
import sys
from pathlib import Path

root = Path(sys.argv[1])
pack_json = sys.argv[2]
issues: list[str] = []


def read_text(name: str) -> str:
    path = root / name
    if not path.exists():
        issues.append(f"{name} is missing")
        return ""
    return path.read_text(encoding="utf-8")


def load_json(name: str) -> dict:
    path = root / name
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except Exception as exc:
        issues.append(f"{name} is not valid JSON: {exc}")
        return {}


def normalize_repo_url(raw: str) -> str:
    value = raw.strip()
    if value.startswith("git+"):
        value = value[4:]
    if value.endswith(".git"):
        value = value[:-4]
    return value


def atomic_write(path: Path, content: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_name(f"{path.name}.tmp.{os.getpid()}")
    temporary.write_text(content, encoding="utf-8")
    os.replace(temporary, path)


def load_release_gates():
    configured = os.environ.get("RELEASE_GATE_FILE", "").strip()
    json_candidates = []
    if configured:
        configured_path = Path(configured)
        json_candidates.append(configured_path if configured_path.is_absolute() else root / configured_path)
    json_candidates.extend([
        root / "release-gates.json",
        root / "prompts" / "outputs" / "current" / "release-gates.json",
    ])
    for candidate in json_candidates:
        if not candidate.exists():
            continue
        try:
            document = json.loads(candidate.read_text(encoding="utf-8"))
            return document, candidate
        except Exception as exc:
            issues.append(f"{candidate} is not valid release-gate JSON: {exc}")
            return {"schemaVersion": 1, "gates": []}, candidate

    plan_candidates = [
        root / "release-plan.md",
        root / "prompts" / "outputs" / "current" / "release-plan.md",
    ]
    for candidate in plan_candidates:
        if not candidate.exists():
            continue
        match = re.search(r"```release-gates\s*(\{.*?\})\s*```", candidate.read_text(encoding="utf-8"), re.S)
        if not match:
            continue
        try:
            return json.loads(match.group(1)), candidate
        except Exception as exc:
            issues.append(f"{candidate} contains invalid release-gates JSON: {exc}")
            return {"schemaVersion": 1, "gates": []}, candidate
    return None, None


def evaluate_release_gates(document: dict) -> dict:
    allowed_kinds = {
        "walking-skeleton", "beta", "production", "store-package",
        "security", "privacy", "destructive-action", "data-integrity",
        "scorecard", "canary-promotion",
    }
    tier_zero = {"security", "privacy", "destructive-action", "data-integrity"}
    raw_gates = document.get("gates") if isinstance(document, dict) else None
    if not isinstance(raw_gates, list) or not raw_gates:
        issues.append("release gate document must contain a non-empty gates array")
        raw_gates = []
    results = []

    for index, raw_gate in enumerate(raw_gates):
        if not isinstance(raw_gate, dict):
            issues.append(f"release gate at index {index} must be an object")
            continue
        gate_id = str(raw_gate.get("id") or f"gate-index-{index}").strip()
        kind = str(raw_gate.get("kind") or "").strip()
        dimension = str(raw_gate.get("dimension") or "").strip()
        owner = str(raw_gate.get("owner") or "").strip()
        blocking = raw_gate.get("blocking") is True
        requirement_ids = raw_gate.get("requirementIds") if isinstance(raw_gate.get("requirementIds"), list) else []
        task_ids = raw_gate.get("taskIds") if isinstance(raw_gate.get("taskIds"), list) else []
        required_evidence = raw_gate.get("requiredEvidence") if isinstance(raw_gate.get("requiredEvidence"), list) else []
        actual_evidence = raw_gate.get("actualEvidence") if isinstance(raw_gate.get("actualEvidence"), list) else []
        evidence_by_id = {
            str(item.get("id")): item
            for item in actual_evidence
            if isinstance(item, dict) and item.get("id")
        }
        missing_evidence = [
            str(evidence_id) for evidence_id in required_evidence
            if evidence_by_id.get(str(evidence_id), {}).get("outcome") != "pass"
            or not str(evidence_by_id.get(str(evidence_id), {}).get("source") or "").strip()
            or not str(evidence_by_id.get(str(evidence_id), {}).get("level") or "").strip()
        ]
        schema_reasons = []

        if not re.fullmatch(r"GATE-[A-Z0-9-]+", gate_id):
            schema_reasons.append("gate ID must match GATE-[A-Z0-9-]+")
        if kind not in allowed_kinds:
            schema_reasons.append(f"unknown gate kind {kind or '<missing>'}")
        if not dimension:
            schema_reasons.append("scorecard dimension is missing")
        if not owner:
            schema_reasons.append("gate owner is missing")
        if not requirement_ids:
            schema_reasons.append("requirement IDs are missing")
        if not task_ids:
            schema_reasons.append("canonical task IDs are missing")
        if not required_evidence:
            schema_reasons.append("required evidence IDs are missing")
        if not isinstance(raw_gate.get("blocking"), bool):
            schema_reasons.append("blocking flag must be boolean")

        threshold = raw_gate.get("threshold")
        actual_value = raw_gate.get("actualValue")
        if (
            not isinstance(threshold, (int, float))
            or isinstance(threshold, bool)
            or not math.isfinite(threshold)
            or not 0 <= threshold <= 100
        ):
            schema_reasons.append("threshold must be numeric and between 0 and 100")
            threshold = 0
        if actual_value is not None and (
            not isinstance(actual_value, (int, float))
            or isinstance(actual_value, bool)
            or not math.isfinite(actual_value)
            or not 0 <= actual_value <= 100
        ):
            schema_reasons.append("actual value must be numeric and between 0 and 100")
            actual_value = None
        schema_valid = not schema_reasons
        hard_gate = blocking or kind in tier_zero or not schema_valid
        reasons = list(schema_reasons)
        if actual_value is None:
            reasons.append("actual value is missing")
        effective_threshold = 100 if kind in tier_zero else threshold
        if actual_value is not None and actual_value < effective_threshold:
            reasons.append(f"actual {actual_value} is below threshold {effective_threshold}")
        if missing_evidence:
            reasons.append(f"missing required evidence: {', '.join(missing_evidence)}")

        decision = "pass" if not reasons else "fail"
        result = {
            "id": gate_id,
            "kind": kind,
            "dimension": dimension,
            "threshold": threshold,
            "effectiveThreshold": effective_threshold,
            "actualValue": actual_value,
            "blocking": blocking,
            "schemaValid": schema_valid,
            "hardGate": hard_gate,
            "owner": owner,
            "requirementIds": requirement_ids,
            "taskIds": task_ids,
            "requiredEvidence": required_evidence,
            "actualEvidence": actual_evidence,
            "missingEvidence": missing_evidence,
            "decision": decision,
            "blockingReason": "; ".join(reasons) if reasons else None,
        }
        results.append(result)
        if decision == "fail" and hard_gate:
            issues.append(f"{gate_id}: {result['blockingReason']}")

    actual_values = [item["actualValue"] for item in results if item["actualValue"] is not None]
    aggregate_score = sum(actual_values) / len(actual_values) if actual_values else None
    blocking_gate_ids = sorted(
        item["id"] for item in results if item["hardGate"] and item["decision"] == "fail"
    )
    promotion_allowed = bool(results) and not blocking_gate_ids
    return {
        "promotion_allowed": promotion_allowed,
        "aggregate_score": aggregate_score,
        "blocking_gate_ids": blocking_gate_ids,
        "gates": results,
    }


def write_release_gate_reports(source_path: Path, evaluation: dict, package_ready: bool) -> tuple[Path, Path]:
    report_dir = source_path.parent
    release_ready = package_ready and evaluation["promotion_allowed"]
    json_report = {
        "schema_version": 1,
        "generated_by": "scripts/validate-release-readiness.sh",
        "package_ready": package_ready,
        "release_ready": release_ready,
        **evaluation,
    }
    json_path = report_dir / "release-readiness-report.json"
    markdown_path = report_dir / "release-gate-report.md"
    rows = []
    for gate in evaluation["gates"]:
        reason = gate["blockingReason"] or "all threshold and evidence checks passed"
        rows.append(
            f"| {gate['id']} | {gate['dimension']} | {gate['effectiveThreshold']} | "
            f"{gate['actualValue'] if gate['actualValue'] is not None else 'missing'} | "
            f"{'yes' if gate['hardGate'] else 'no'} | {gate['decision']} | {reason} |"
        )
    markdown = "\n".join([
        "# Release Gate Report",
        "",
        f"- **Package ready:** {'yes' if package_ready else 'no'}",
        f"- **Product gates allow promotion:** {'yes' if evaluation['promotion_allowed'] else 'no'}",
        f"- **Release ready:** {'yes' if release_ready else 'no'}",
        f"- **Aggregate score:** {evaluation['aggregate_score'] if evaluation['aggregate_score'] is not None else 'not available'}",
        f"- **Blocking gate IDs:** {', '.join(evaluation['blocking_gate_ids']) or 'none'}",
        "",
        "| Gate ID | Dimension | Threshold | Actual | Hard | Decision | Evidence / blocking reason |",
        "|---|---|---:|---:|---|---|---|",
        *rows,
        "",
    ])
    atomic_write(json_path, json.dumps(json_report, indent=2, sort_keys=True) + "\n")
    atomic_write(markdown_path, markdown)
    return markdown_path, json_path


pkg = load_json("package.json")
readme = read_text("README.md")
quick = read_text("QUICK_START.md")
license_text = read_text("LICENSE")

package_name = str(pkg.get("name", "")).strip()
version = str(pkg.get("version", "")).strip()
repository = pkg.get("repository") or {}
repository_url = repository.get("url") if isinstance(repository, dict) else ""
normalized_repo = normalize_repo_url(str(repository_url or ""))

if not package_name or package_name.startswith("<"):
    issues.append("package.json name is required")
if not re.fullmatch(r"\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?", version):
    issues.append("package.json version must be semver-like")
if pkg.get("license") != "MIT":
    issues.append("package.json license must match LICENSE (MIT)")
if not pkg.get("description"):
    issues.append("package.json description is required")
if not repository_url:
    issues.append("package.json repository.url is required")
elif "github.com/ameedanxari/ai-prompt-library" not in normalized_repo:
    issues.append("package.json repository.url must point at the ai-prompt-library repository")
if not str((pkg.get("bugs") or {}).get("url", "")).startswith(normalized_repo):
    issues.append("package.json bugs.url must point at the repository issues URL")
if not str(pkg.get("homepage", "")).startswith(normalized_repo):
    issues.append("package.json homepage must point at the repository README")
if "MIT License" not in license_text:
    issues.append("LICENSE does not look like MIT")

scripts = pkg.get("scripts") or {}
if scripts.get("clean") != "rm -rf dist":
    issues.append("package.json must expose a clean script for dist")
if scripts.get("prepack") != "npm run clean && npm run build":
    issues.append("package.json prepack must clean dist and run the build")
if scripts.get("validate:release") != "bash scripts/validate-release-readiness.sh":
    issues.append("package.json must expose validate:release")

engines = pkg.get("engines") or {}
if engines.get("node") != ">=20":
    issues.append("package.json engines.node must be >=20")

if package_name:
    for doc_name, doc_body in [("README.md", readme), ("QUICK_START.md", quick)]:
        if package_name not in doc_body:
            issues.append(f"{doc_name} must mention package name {package_name}")
        if normalized_repo and normalized_repo not in normalize_repo_url(doc_body):
            issues.append(f"{doc_name} must mention repository URL {normalized_repo}")
        if re.search(r"<(?:package-name|repository-url|repo-url|npm-name)>", doc_body, re.I):
            issues.append(f"{doc_name} contains release placeholder text")

main = pkg.get("main")
types = pkg.get("types")
exports = pkg.get("exports") or {}
if main != "./dist/index.js":
    issues.append("package.json main must be ./dist/index.js")
if types != "./dist/index.d.ts":
    issues.append("package.json types must be ./dist/index.d.ts")
if exports.get(".", {}).get("import") != "./dist/index.js":
    issues.append("package root export must point at dist/index.js")
if exports.get("./completion", {}).get("import") != "./dist/completion/completion-state.js":
    issues.append("package completion export must point at dist/completion/completion-state.js")
if exports.get("./execution-status", {}).get("import") != "./dist/execution/execution-status.js":
    issues.append("package execution-status export must point at dist/execution/execution-status.js")
if exports.get("./release-gates", {}).get("import") != "./dist/release/release-gates.js":
    issues.append("package release-gates export must point at dist/release/release-gates.js")
if exports.get("./task-contract", {}).get("import") != "./dist/task-contract/index.js":
    issues.append("package task-contract export must point at dist/task-contract/index.js")
if exports.get("./traceability", {}).get("import") != "./dist/traceability/traceability-matrix.js":
    issues.append("package traceability export must point at dist/traceability/traceability-matrix.js")

required_bins = {
    "ai-prompt-ready": "./scripts/validate-ready-to-execute.sh",
    "ai-prompt-finalize": "./scripts/finalize.sh",
    "ai-prompt-validate-release-readiness": "./scripts/validate-release-readiness.sh",
}
bins = pkg.get("bin") or {}
for name, expected_path in required_bins.items():
    if bins.get(name) != expected_path:
        issues.append(f"package.json bin {name} must point at {expected_path}")

for name, script_path in sorted(bins.items()):
    full = root / str(script_path)
    if not full.exists():
        issues.append(f"bin {name} target does not exist: {script_path}")
        continue
    mode = full.stat().st_mode
    if not mode & (stat.S_IXUSR | stat.S_IXGRP | stat.S_IXOTH):
        issues.append(f"bin {name} target is not executable: {script_path}")

if pack_json:
    raw_pack = Path(pack_json).read_text(encoding="utf-8")
    start = raw_pack.find("[")
    if start < 0:
        issues.append("npm pack dry-run did not emit JSON")
        packed_paths: set[str] = set()
    else:
        try:
            pack = json.loads(raw_pack[start:])
            packed_paths = {item["path"] for item in pack[0].get("files", [])}
        except Exception as exc:
            issues.append(f"cannot parse npm pack dry-run JSON: {exc}")
            packed_paths = set()

    required_packed = {
        "dist/index.js",
        "dist/index.d.ts",
        "dist/completion/completion-state.js",
        "dist/completion/completion-state.d.ts",
        "dist/execution/execution-status.js",
        "dist/execution/execution-status.d.ts",
        "dist/release/release-gates.js",
        "dist/release/release-gates.d.ts",
        "dist/task-contract/index.js",
        "dist/task-contract/index.d.ts",
        "dist/task-contract/cli.js",
        "dist/traceability/traceability-matrix.js",
        "dist/traceability/traceability-matrix.d.ts",
        "README.md",
        "QUICK_START.md",
        "LICENSE",
        "scripts/validate-release-readiness.sh",
        "scripts/validate-ready-to-execute.sh",
        "scripts/finalize.sh",
        "prompts/orchestrators/ai-agent-entry-point.md",
    }
    for required in sorted(required_packed):
        if required not in packed_paths:
            issues.append(f"npm pack dry-run missing required file: {required}")

    forbidden_patterns = [
        r"(?:^|/)xcuserdata/",
        r"(?:^|/)\.gradle/",
        r"(?:^|/)build/",
        r"\.xcuserstate$",
        r"\.DS_Store$",
        r"\.log$",
        r"\.map$",
        r"^docs/archive/",
        r"^docs/DRY_RUN_",
        r"^docs/dry-runs/",
        r"^docs/rewrite-history/",
        r"^tests/",
        r"^src/(?!task-contract/)",
    ]
    for packed_path in sorted(packed_paths):
        for pattern in forbidden_patterns:
            if re.search(pattern, packed_path):
                issues.append(f"npm pack dry-run includes forbidden file: {packed_path}")
                break

gate_document, gate_source = load_release_gates()
gate_reports = None
if gate_document is not None and gate_source is not None:
    package_issues_before_gates = list(issues)
    gate_evaluation = evaluate_release_gates(gate_document)
    gate_reports = write_release_gate_reports(gate_source, gate_evaluation, not package_issues_before_gates)

if issues:
    print("❌ release readiness: fail")
    for issue in issues:
        print(f"   - {issue}")
    if gate_reports:
        print(f"release gate report: {gate_reports[0]}")
        print(f"release readiness report: {gate_reports[1]}")
    sys.exit(1)

print("✅ release readiness: pass")
if pack_json:
    print("npm pack dry-run: checked")
else:
    print("npm pack dry-run: skipped by RELEASE_READINESS_SKIP_PACK=1")
if gate_reports:
    print(f"release gate report: {gate_reports[0]}")
    print(f"release readiness report: {gate_reports[1]}")
PY
status=$?
rm -f "$PACK_JSON"
exit $status
