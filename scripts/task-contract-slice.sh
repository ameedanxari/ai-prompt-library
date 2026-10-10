#!/usr/bin/env bash
# task-contract-slice.sh — print only the contract units for one plan packet.
#
# task-contract.json can exceed 1.5 MB. An agent working on one packet needs
# only that packet's units. Each unit carries `file` (the plan file name, for
# both tasks-*.md and remediation-*.md) and `canonicalId` (`<file>#<id>`).
#
# Usage:
#   task-contract-slice.sh [TARGET_DIR] PLAN_FILE [UNIT_ID]
#
#   TARGET_DIR  directory holding task-contract.json (default prompts/outputs/current)
#   PLAN_FILE   plan packet file name, e.g. remediation-foo.md (a path is reduced to its name)
#   UNIT_ID     optional unit id inside the packet, e.g. R3 (PLAN_FILE#R3 also works)
#
# Output: a JSON array of the matching units, in contract order.
#
# Exit codes: 0 output printed, 1 nothing matched, 2 usage error or missing contract.

set -uo pipefail

usage() {
  echo "usage: $(basename "$0") [TARGET_DIR] PLAN_FILE [UNIT_ID]" >&2
}

POSITIONAL=()
for arg in "$@"; do
  case "$arg" in
    -h|--help) usage; exit 2 ;;
    -*) echo "❌ unknown option: $arg" >&2; usage; exit 2 ;;
    *) POSITIONAL+=("$arg") ;;
  esac
done

TARGET_DIR="prompts/outputs/current"
PLAN_FILE=""
UNIT_ID=""
case "${#POSITIONAL[@]}" in
  1) PLAN_FILE="${POSITIONAL[0]}" ;;
  2)
    if [[ "${POSITIONAL[0]}" == *.md ]]; then
      PLAN_FILE="${POSITIONAL[0]}"
      UNIT_ID="${POSITIONAL[1]}"
    else
      TARGET_DIR="${POSITIONAL[0]}"
      PLAN_FILE="${POSITIONAL[1]}"
    fi
    ;;
  3)
    TARGET_DIR="${POSITIONAL[0]}"
    PLAN_FILE="${POSITIONAL[1]}"
    UNIT_ID="${POSITIONAL[2]}"
    ;;
  *) usage; exit 2 ;;
esac
PLAN_FILE="$(basename "$PLAN_FILE")"
CONTRACT="$TARGET_DIR/task-contract.json"

if [ ! -f "$CONTRACT" ]; then
  echo "❌ task contract not found: $CONTRACT" >&2
  echo "   Run: bash .ai-prompts/scripts/build-task-contract.sh $TARGET_DIR" >&2
  exit 2
fi

python3 - "$CONTRACT" "$PLAN_FILE" "$UNIT_ID" <<'PY'
import json
import sys

contract_path, plan, unit_id = sys.argv[1], sys.argv[2], sys.argv[3]
try:
    contract = json.load(open(contract_path, encoding="utf-8"))
except ValueError as exc:
    print(f"❌ task contract is not valid JSON: {exc}", file=sys.stderr)
    sys.exit(2)

if unit_id.startswith(plan + "#"):
    unit_id = unit_id[len(plan) + 1:]

def belongs(unit):
    canonical = str(unit.get("canonicalId", ""))
    return unit.get("file") == plan or canonical.startswith(plan + "#")

matched = [u for u in contract.get("units", []) if belongs(u)]
if unit_id:
    matched = [u for u in matched if u.get("id") == unit_id]

if not matched:
    target = f"{plan}#{unit_id}" if unit_id else plan
    print(f"no contract units for {target}", file=sys.stderr)
    sys.exit(1)

print(json.dumps(matched, indent=2, ensure_ascii=False))
PY
