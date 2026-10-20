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

sys.dont_write_bytecode = True
sys.path.insert(0, os.environ["EXEC_LOG_LIB"])
from execution_log import load_logical_log  # noqa: E402

graph_path, log_path, plan_dir = sys.argv[1], sys.argv[2], sys.argv[3]
graph = json.load(open(graph_path, encoding="utf-8"))
# Rotated journal entries are read from journal_archives (older first).
logical = load_logical_log(plan_dir, open(log_path, encoding="utf-8").read())
if logical.missing:
    for name in logical.missing:
        print(f"❌ journal archive listed in {log_path} cannot be read: {name}", file=sys.stderr)
    sys.exit(2)
log = logical.text.splitlines()

order = []
for line in log:
    m = re.match(r"^### `((?:tasks|remediation)-[^`]+\.md)` — done", line)
    if m:
        order.append(m.group(1))

position = {task: i for i, task in enumerate(order)}
violations = []
for node in graph.get("nodes", []):
    node_id = node["id"]
    if node_id not in position:
        continue
    for dep in node.get("dependencies", []):
        if dep in position and position[dep] > position[node_id]:
            violations.append((node_id, dep, position[node_id] + 1, position[dep] + 1))

if violations:
    print("❌ execution order violates declared dependencies")
    for node, dep, node_pos, dep_pos in violations:
        print(f"   - {node} logged at #{node_pos} before dependency {dep} at #{dep_pos}")
    sys.exit(1)

print(f"✅ execution order matches dependency graph ({len(order)} logged tasks checked)")
PY
