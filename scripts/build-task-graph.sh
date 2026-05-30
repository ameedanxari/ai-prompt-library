#!/usr/bin/env bash
# build-task-graph.sh — derive a canonical execution DAG from task files.
#
# The executor must not infer execution order from filesystem order,
# epic order, or chat memory. This script turns every tasks-*.md /
# remediation-*.md file into one graph node with dependencies, file
# ownership, and a stable topological order.

set -uo pipefail

TARGET_DIR="${1:-prompts/outputs/current}"

if [ ! -d "$TARGET_DIR" ]; then
  echo "❌ $TARGET_DIR does not exist" >&2
  exit 2
fi

OUT="$TARGET_DIR/task-graph.json"

python3 - "$TARGET_DIR" "$OUT" <<'PY'
import json
import os
import re
import sys
from collections import defaultdict, deque

target_dir, out_path = sys.argv[1], sys.argv[2]

task_files = sorted(
    fn for fn in os.listdir(target_dir)
    if (fn.startswith("tasks-") or fn.startswith("remediation-")) and fn.endswith(".md")
)
if not task_files:
    print(f"❌ no tasks-*.md or remediation-*.md in {target_dir}", file=sys.stderr)
    sys.exit(2)

file_line_re = re.compile(r"\*\*File:\*\*\s*(.*)")
depends_re = re.compile(r"tasks-[a-z0-9][a-z0-9-]*\.md|remediation-[a-z0-9][a-z0-9-]*\.md")
change_re = re.compile(r"\*\*Change type:\*\*\s*([A-Za-z-]+)")
test_re = re.compile(r"\*\*Test:\*\*\s*(.*)")

def extract_paths(raw):
    raw = raw.strip()
    if not raw or raw.lower() in {"none", "n/a", "tbd", "—"}:
        return []
    raw = raw.replace("`", "")
    parts = [p.strip() for p in re.split(r"\s*\|\s*", raw) if p.strip()]
    return [p for p in parts if not re.search(r"\s", p)]

nodes = []
seen = set()
for index, fn in enumerate(task_files):
    path = os.path.join(target_dir, fn)
    text = open(path, encoding="utf-8").read().splitlines()
    deps = []
    files = []
    change_type = None
    tests = []
    for line in text:
        if "**Depends on:**" in line:
            deps.extend(dep for dep in depends_re.findall(line) if dep != fn)
        m = file_line_re.search(line)
        if m:
            files.extend(extract_paths(m.group(1)))
        m = change_re.search(line)
        if m and not change_type:
            change_type = m.group(1)
        m = test_re.search(line)
        if m:
            tests.append(m.group(1).strip())
    deps = sorted(set(deps))
    missing = [dep for dep in deps if dep not in task_files]
    node = {
        "id": fn,
        "path": os.path.join(target_dir, fn),
        "ordinal": index + 1,
        "dependencies": deps,
        "missing_dependencies": missing,
        "files": sorted(set(files)),
        "change_type": change_type or "unknown",
        "tests": tests,
    }
    nodes.append(node)
    seen.add(fn)

all_ids = {node["id"] for node in nodes}
adj = defaultdict(list)
in_degree = defaultdict(int)
for node in nodes:
    for dep in node["dependencies"]:
        if dep in all_ids:
            adj[dep].append(node["id"])
            in_degree[node["id"]] += 1
for node_id in all_ids:
    in_degree[node_id] += 0

queue = deque(sorted(node_id for node_id in all_ids if in_degree[node_id] == 0))
topological_order = []
while queue:
    node_id = queue.popleft()
    topological_order.append(node_id)
    for child in sorted(adj[node_id]):
        in_degree[child] -= 1
        if in_degree[child] == 0:
            queue.append(child)

cycle_nodes = sorted(all_ids - set(topological_order))
for node in nodes:
    node["dependents"] = sorted(adj[node["id"]])
    node["topological_index"] = (
        topological_order.index(node["id"]) + 1
        if node["id"] in topological_order else None
    )

graph = {
    "generated_by": "scripts/build-task-graph.sh",
    "target_dir": target_dir,
    "node_count": len(nodes),
    "topological_order": topological_order,
    "cycle_nodes": cycle_nodes,
    "missing_dependencies": {
        node["id"]: node["missing_dependencies"]
        for node in nodes if node["missing_dependencies"]
    },
    "nodes": nodes,
}

with open(out_path, "w", encoding="utf-8") as fh:
    json.dump(graph, fh, indent=2, sort_keys=True)
    fh.write("\n")

if cycle_nodes:
    print("❌ dependency cycle detected: " + ", ".join(cycle_nodes), file=sys.stderr)
    sys.exit(1)
if graph["missing_dependencies"]:
    for node, missing in graph["missing_dependencies"].items():
        print(f"❌ {node}: missing dependency file(s): {', '.join(missing)}", file=sys.stderr)
    sys.exit(1)

print(f"✅ task graph written: {out_path} ({len(nodes)} nodes)")
PY
