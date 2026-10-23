#!/usr/bin/env bash
# validate-execution-order.sh — compare execution-log order to task DAG.
#
# A run is not coherent if a task is logged done before one of its
# declared dependencies. Compile/test green does not override a broken
# task graph.

set -uo pipefail

PLAN_DIR="${1:-prompts/outputs/current}"
GRAPH="${2:-$PLAN_DIR/task-graph.json}"
LOG="$PLAN_DIR/execution-log.md"

if [ ! -f "$GRAPH" ]; then
  echo "❌ task graph not found: $GRAPH" >&2
  echo "   Run: bash .ai-prompts/scripts/build-task-graph.sh $PLAN_DIR" >&2
  exit 2
fi
if [ ! -f "$LOG" ]; then
  echo "❌ execution log not found: $LOG" >&2
  exit 2
fi

EXEC_LOG_LIB="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/lib" python3 - "$GRAPH" "$LOG" "$PLAN_DIR" <<'PY'
import json
import os
import re
import sys
from collections import defaultdict

sys.dont_write_bytecode = True
sys.path.insert(0, os.environ["EXEC_LOG_LIB"])
from execution_log import load_logical_log  # noqa: E402
from task_contract import load_task_contract  # noqa: E402

graph_path, log_path, plan_dir = sys.argv[1], sys.argv[2], sys.argv[3]
graph = json.load(open(graph_path, encoding="utf-8"))
# Rotated journal entries are read from journal_archives (older first).
logical = load_logical_log(plan_dir, open(log_path, encoding="utf-8").read())
if logical.missing:
    for name in logical.missing:
        print(f"❌ journal archive listed in {log_path} cannot be read: {name}", file=sys.stderr)
    sys.exit(2)
log = logical.text

order = []
first_done_offset = {}
for match in re.finditer(r"^### `((?:tasks|remediation)-[^`]+\.md)` — done", log, re.M):
    task = match.group(1)
    order.append(task)
    first_done_offset.setdefault(task, match.start())

# A later "done" entry can record a repair or reverification. It does not
# change when the task was first completed relative to its prerequisites.
position = {}
for i, task in enumerate(order):
    position.setdefault(task, i)

# A file dependency can be introduced by a unit added after the file's first
# completion. Use that unit's first canonical done record for the edge, while
# keeping the original file completion for all earlier declarations.
declarations = defaultdict(list)
contract_path = graph.get("source_contract")
if contract_path and os.path.isfile(contract_path):
    try:
        contract = load_task_contract(contract_path)
        units = contract["units"]
        if not isinstance(units, list):
            raise ValueError("units must be an array")
        for unit in units:
            for dep in unit.get("dependencies", []):
                if dep.get("file"):
                    declarations[(unit["file"], dep["file"])].append(unit["canonicalId"])
    except (OSError, ValueError, TypeError, KeyError) as exc:
        print(f"❌ cannot read task contract {contract_path}: {exc}", file=sys.stderr)
        sys.exit(2)

unit_first_done_offset = {}
if declarations:
    for match in re.finditer(r"```execution-status-record\s*\n(.*?)```", log, re.S):
        try:
            record = json.loads(match.group(1))
        except json.JSONDecodeError:
            continue  # Missing canonical evidence keeps the strict file check.
        if isinstance(record, dict) and record.get("status") == "done":
            task_id = record.get("taskId")
            if isinstance(task_id, str):
                unit_first_done_offset.setdefault(task_id, match.start())

violations = []
for node in graph.get("nodes", []):
    node_id = node["id"]
    if node_id not in position:
        continue
    for dep in node.get("dependencies", []):
        if dep in position and position[dep] > position[node_id]:
            declaring_units = declarations.get((node_id, dep), [])
            if (declaring_units
                    and all(unit in unit_first_done_offset for unit in declaring_units)
                    and min(unit_first_done_offset[unit] for unit in declaring_units)
                    > first_done_offset[dep]):
                continue
            violations.append((node_id, dep, position[node_id] + 1, position[dep] + 1))

if violations:
    print("❌ execution order violates declared dependencies")
    for node, dep, node_pos, dep_pos in violations:
        print(f"   - {node} logged at #{node_pos} before dependency {dep} at #{dep_pos}")
    sys.exit(1)

print(f"✅ execution order matches dependency graph ({len(position)} logged tasks checked)")
PY
