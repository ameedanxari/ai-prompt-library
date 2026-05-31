#!/usr/bin/env bash
# validate-task-contract.sh — fail when task-contract.json contains
# blocking contract issues.
#
# Usage:
#   bash scripts/validate-task-contract.sh [target-dir-or-task-contract.json]
#
# Exit codes:
#   0  contract exists and has no error-severity issues
#   1  contract has error-severity issues
#   2  preconditions missing or malformed contract

set -uo pipefail

TARGET="${1:-prompts/outputs/current}"

resolve_script_dir() {
  local source="${BASH_SOURCE[0]}"
  while [ -L "$source" ]; do
    local dir
    dir="$(cd -P "$(dirname "$source")" && pwd)"
    local target
    target="$(readlink "$source")"
    case "$target" in
      /*) source="$target" ;;
      *) source="$dir/$target" ;;
    esac
  done
  cd -P "$(dirname "$source")" && pwd
}
SCRIPT_DIR="$(resolve_script_dir)"

if [ -d "$TARGET" ]; then
  CONTRACT="$TARGET/task-contract.json"
  build_status=0
  bash "$SCRIPT_DIR/build-task-contract.sh" "$TARGET" "$CONTRACT" >/dev/null || build_status=$?
  if [ "$build_status" -eq 2 ]; then
    echo "❌ task contract could not be built for: $TARGET" >&2
    exit 2
  fi
else
  CONTRACT="$TARGET"
fi

if [ ! -f "$CONTRACT" ]; then
  echo "❌ task contract not found: $CONTRACT" >&2
  echo "   Run: bash scripts/build-task-contract.sh ${TARGET%/task-contract.json}" >&2
  exit 2
fi

if ! command -v python3 >/dev/null 2>&1; then
  echo "❌ python3 not found — required for task contract validation" >&2
  exit 2
fi

python3 - "$CONTRACT" <<'PY'
import json
import sys

contract_path = sys.argv[1]

try:
    with open(contract_path, encoding="utf-8") as handle:
        contract = json.load(handle)
except Exception as exc:
    print(f"❌ cannot read task contract {contract_path}: {exc}", file=sys.stderr)
    sys.exit(2)

missing = [
    key
    for key in ["schemaVersion", "summary", "files", "units", "graphs", "issues"]
    if key not in contract
]
if missing:
    print(f"❌ malformed task contract: missing {', '.join(missing)}", file=sys.stderr)
    sys.exit(2)

errors = [
    issue
    for issue in contract.get("issues", [])
    if issue.get("severity") == "error"
]
warnings = [
    issue
    for issue in contract.get("issues", [])
    if issue.get("severity") == "warning"
]

if errors:
    print(f"❌ task contract has {len(errors)} blocking issue(s):")
    for issue in errors:
        location = issue.get("canonicalId") or issue.get("file") or issue.get("path") or "contract"
        print(f"   - {issue.get('code', 'unknown')}: {location}: {issue.get('message', '')}")
    sys.exit(1)

if warnings:
    print(f"✅ task contract has no blocking issues ({len(warnings)} warning(s))")
else:
    print("✅ task contract has no blocking issues")
PY
