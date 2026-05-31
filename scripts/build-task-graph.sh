#!/usr/bin/env bash
# build-task-graph.sh — derive a canonical execution DAG from task files.
#
# The executor must not infer execution order from filesystem order,
# epic order, or chat memory. This script turns every tasks-*.md /
# remediation-*.md file into one graph node with dependencies, file
# ownership, and a stable topological order.

set -uo pipefail

TARGET_DIR="${1:-prompts/outputs/current}"

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

if [ ! -d "$TARGET_DIR" ]; then
  echo "❌ $TARGET_DIR does not exist" >&2
  exit 2
fi

OUT="$TARGET_DIR/task-graph.json"
CONTRACT="$TARGET_DIR/task-contract.json"

contract_status=0
bash "$SCRIPT_DIR/build-task-contract.sh" "$TARGET_DIR" "$CONTRACT" || contract_status=$?
if [ "$contract_status" -eq 2 ]; then
  exit 2
fi

python3 - "$TARGET_DIR" "$OUT" <<'PY'
import json
import os
import sys
from collections import defaultdict

target_dir, out_path = sys.argv[1], sys.argv[2]
contract_path = os.path.join(target_dir, "task-contract.json")

if not os.path.exists(contract_path):
    print(f"❌ task contract not found: {contract_path}", file=sys.stderr)
    sys.exit(2)

contract = json.load(open(contract_path, encoding="utf-8"))
file_graph = contract["graphs"]["files"]
graph_nodes = {node["id"]: node for node in file_graph["nodes"]}
units_by_file = defaultdict(list)
for unit in contract["units"]:
    units_by_file[unit["file"]].append(unit)

dependents = defaultdict(list)
for node in file_graph["nodes"]:
    for dep in node["dependencies"]:
        if dep in graph_nodes:
            dependents[dep].append(node["id"])

topological_order = file_graph["topologicalOrder"]
topological_index = {
    node_id: index + 1
    for index, node_id in enumerate(topological_order)
}

nodes = []
for index, file_meta in enumerate(contract["files"]):
    fn = file_meta["filename"]
    graph_node = graph_nodes[fn]
    units = units_by_file[fn]
    change_type = next((unit.get("changeType") for unit in units if unit.get("changeType")), None)
    tests = [unit["test"] for unit in units if unit.get("test")]
    node = {
        "id": fn,
        "path": file_meta.get("filePath") or os.path.join(target_dir, fn),
        "ordinal": index + 1,
        "dependencies": graph_node["dependencies"],
        "missing_dependencies": graph_node["missingDependencies"],
        "files": file_meta["filePaths"],
        "change_type": change_type or "unknown",
        "tests": tests,
        "dependents": sorted(dependents[fn]),
        "topological_index": topological_index.get(fn),
    }
    nodes.append(node)

cycle_nodes = file_graph["cycleNodes"]
missing_dependencies = {
    node["id"]: node["missing_dependencies"]
    for node in nodes if node["missing_dependencies"]
}

graph = {
    "generated_by": "scripts/build-task-graph.sh",
    "target_dir": target_dir,
    "source_contract": contract_path,
    "node_count": len(nodes),
    "topological_order": topological_order,
    "cycle_nodes": cycle_nodes,
    "missing_dependencies": missing_dependencies,
    "nodes": nodes,
}

with open(out_path, "w", encoding="utf-8") as fh:
    json.dump(graph, fh, indent=2, sort_keys=True)
    fh.write("\n")

if cycle_nodes:
    print("❌ dependency cycle detected: " + ", ".join(cycle_nodes), file=sys.stderr)
    sys.exit(1)
if missing_dependencies:
    for node, missing in missing_dependencies.items():
        print(f"❌ {node}: missing dependency file(s): {', '.join(missing)}", file=sys.stderr)
    sys.exit(1)

print(f"✅ task graph written: {out_path} ({len(nodes)} nodes)")
PY
