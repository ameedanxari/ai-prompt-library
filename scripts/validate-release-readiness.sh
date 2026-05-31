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
if exports.get("./task-contract", {}).get("import") != "./dist/task-contract/index.js":
    issues.append("package task-contract export must point at dist/task-contract/index.js")

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
        "dist/task-contract/index.js",
        "dist/task-contract/index.d.ts",
        "dist/task-contract/cli.js",
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

if issues:
    print("❌ release readiness: fail")
    for issue in issues:
        print(f"   - {issue}")
    sys.exit(1)

print("✅ release readiness: pass")
if pack_json:
    print("npm pack dry-run: checked")
else:
    print("npm pack dry-run: skipped by RELEASE_READINESS_SKIP_PACK=1")
PY
status=$?
rm -f "$PACK_JSON"
exit $status
