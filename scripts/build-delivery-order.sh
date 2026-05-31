#!/usr/bin/env bash
# build-delivery-order.sh — emit the canonical execution-order manifest.
#
# After Step 3.7 has injected `Phase:` into every task, this script
# walks every tasks-*.md / remediation-*.md, reads Phase + Depends-on,
# performs Kahn's topological sort with `Phase` as the primary tiebreak
# (foundation < mvp < expand < polish) and lexical filename as the
# final tiebreak, and writes delivery-order.md.
#
# Without this manifest, the executor falls back to filesystem listing
# (alphabetical), which is the root cause of plans appearing
# alphabetically ordered rather than delivery-aware. The Phase field
# alone is not enough — the executor must read a canonical sorted list.
#
# Exit codes:
#   0  manifest written; no phase inversions; no cycles.
#   1  phase inversion detected (a task depends on a later-phase task)
#   2  dependency cycle detected
#   3  preconditions missing (no task files, no Phase fields)
#
# Usage:
#   bash scripts/build-delivery-order.sh [target-dir]

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
  exit 3
fi

shopt -s nullglob
task_files=("$TARGET_DIR"/tasks-*.md "$TARGET_DIR"/remediation-*.md)
if [ ${#task_files[@]} -eq 0 ]; then
  echo "ℹ️  no tasks-*.md or remediation-*.md in $TARGET_DIR — nothing to order" >&2
  exit 3
fi

if ! command -v python3 >/dev/null 2>&1; then
  echo "❌ python3 not found — required for topological sort" >&2
  exit 3
fi

OUTPUT_FILE="$TARGET_DIR/delivery-order.md"
CONTRACT_FILE="$TARGET_DIR/task-contract.json"

contract_status=0
bash "$SCRIPT_DIR/build-task-contract.sh" "$TARGET_DIR" "$CONTRACT_FILE" || contract_status=$?
if [ "$contract_status" -ne 0 ]; then
  exit 3
fi

python3 - "$TARGET_DIR" "$OUTPUT_FILE" <<'PYEOF'
import datetime
import heapq
import json
import os
import sys
from collections import defaultdict

target_dir, output_path = sys.argv[1], sys.argv[2]
contract_path = os.path.join(target_dir, "task-contract.json")

PHASE_ORDER = ["foundation", "mvp", "expand", "polish"]
PHASE_RANK = {p: i for i, p in enumerate(PHASE_ORDER)}

if not os.path.exists(contract_path):
    print(f"❌ task contract not found: {contract_path}", file=sys.stderr)
    sys.exit(3)

contract = json.load(open(contract_path, encoding="utf-8"))
units_by_file = defaultdict(list)
for unit in contract["units"]:
    units_by_file[unit["file"]].append(unit)

tasks = {}                # filename -> {phase, depends, raw_phase}
missing_phase = []

for file_meta in sorted(contract["files"], key=lambda item: item["filename"]):
    fn = file_meta["filename"]
    units = units_by_file[fn]
    phase = next((unit.get("phase") for unit in units if unit.get("phase") in PHASE_RANK), None)
    if not phase:
        missing_phase.append(fn)
        phase = "mvp"  # fallback so the sort still runs; revise gate will reject the plan
    elif any((not unit.get("phase")) or unit.get("invalidPhase") for unit in units):
        missing_phase.append(fn)

    deps = next(
        (node["dependencies"] for node in contract["graphs"]["files"]["nodes"] if node["id"] == fn),
        [],
    )

    tasks[fn] = {"phase": phase, "depends": deps}

if not tasks:
    print("ℹ️  no parseable task files found", file=sys.stderr)
    sys.exit(3)

# Phase-inversion detection.
inversions = []
for fn, meta in tasks.items():
    fn_rank = PHASE_RANK[meta["phase"]]
    for dep in meta["depends"]:
        if dep not in tasks:
            continue  # dangling refs are caught by validate-instantiation.sh
        dep_rank = PHASE_RANK[tasks[dep]["phase"]]
        if dep_rank > fn_rank:
            inversions.append({
                "task": fn,
                "task_phase": meta["phase"],
                "dep": dep,
                "dep_phase": tasks[dep]["phase"],
            })

adj = defaultdict(list)
in_deg = defaultdict(int)
for fn, meta in tasks.items():
    in_deg.setdefault(fn, 0)
    for dep in meta["depends"]:
        if dep in tasks:
            adj[dep].append(fn)
            in_deg[fn] += 1

heap = []
for fn, deg in in_deg.items():
    if deg == 0:
        heapq.heappush(heap, (PHASE_RANK[tasks[fn]["phase"]], fn))

ordered = []
while heap:
    _, fn = heapq.heappop(heap)
    ordered.append(fn)
    for nb in adj[fn]:
        in_deg[nb] -= 1
        if in_deg[nb] == 0:
            heapq.heappush(heap, (PHASE_RANK[tasks[nb]["phase"]], nb))

cycle = []
if len(ordered) != len(tasks):
    cycle = sorted(set(tasks.keys()) - set(ordered))

# Bucket by phase for the human-readable section.
buckets = {p: [] for p in PHASE_ORDER}
for fn in ordered:
    buckets[tasks[fn]["phase"]].append(fn)

phase_counts = {p: len(buckets[p]) for p in PHASE_ORDER}
total = sum(phase_counts.values())

now = datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

out = []
out.append("---")
out.append(f"generated_at: {now}")
out.append(f"total_tasks: {total}")
out.append("phase_counts:")
for p in PHASE_ORDER:
    out.append(f"  {p}: {phase_counts[p]}")
if inversions:
    out.append("phase_inversions:")
    for inv in inversions:
        out.append(f"  - task: {inv['task']}")
        out.append(f"    task_phase: {inv['task_phase']}")
        out.append(f"    dep: {inv['dep']}")
        out.append(f"    dep_phase: {inv['dep_phase']}")
else:
    out.append("phase_inversions: []")
if cycle:
    out.append("cycle_tasks:")
    for t in cycle:
        out.append(f"  - {t}")
else:
    out.append("cycle_tasks: []")
if missing_phase:
    out.append("missing_phase_field:")
    for t in missing_phase:
        out.append(f"  - {t}")
else:
    out.append("missing_phase_field: []")
out.append("---")
out.append("")
out.append("# Delivery Order")
out.append("")
out.append("_Canonical execution order. The executor reads this verbatim to pick the next task. Order is:_")
out.append("_1) **Phase** — foundation < mvp < expand < polish_")
out.append("_2) **Topological** — within a phase, Depends-on edges define order_")
out.append("_3) **Lexical** — final tiebreak when two tasks are independent within a phase_")
out.append("")

idx = 0
for p in PHASE_ORDER:
    out.append(f"## Phase — {p}")
    out.append("")
    if not buckets[p]:
        out.append("_(no tasks in this phase)_")
        out.append("")
        continue
    for fn in buckets[p]:
        idx += 1
        deps = tasks[fn]["depends"]
        dep_str = ", ".join(deps) if deps else "none"
        out.append(f"{idx}. `{fn}` (depends on: {dep_str})")
    out.append("")

if missing_phase:
    out.append("## ⚠ Tasks missing Phase field")
    out.append("")
    out.append("_These were sorted as `mvp` by default. The revise gate will fail until they declare a real Phase._")
    out.append("")
    for t in missing_phase:
        out.append(f"- `{t}`")
    out.append("")

if inversions:
    out.append("## 🚨 Phase inversions")
    out.append("")
    out.append("_A task depends on a later-phase task. Fix by re-grading Phase or removing the dependency._")
    out.append("")
    for inv in inversions:
        out.append(f"- `{inv['task']}` ({inv['task_phase']}) → depends on `{inv['dep']}` ({inv['dep_phase']})")
    out.append("")

if cycle:
    out.append("## 🚨 Dependency cycle")
    out.append("")
    out.append("_These tasks form a cycle. The executor cannot determine an order. Remove or reverse one edge._")
    out.append("")
    for t in cycle:
        out.append(f"- `{t}`")
    out.append("")

with open(output_path, "w", encoding="utf-8") as fh:
    fh.write("\n".join(out) + "\n")

# Exit code priorities: cycle > inversion > missing_phase > ok
if cycle:
    print(f"❌ dependency cycle detected ({len(cycle)} tasks)", file=sys.stderr)
    sys.exit(2)
if inversions:
    print(f"❌ phase inversions detected ({len(inversions)} cases)", file=sys.stderr)
    sys.exit(1)
if missing_phase:
    print(f"⚠️  {len(missing_phase)} task(s) missing Phase field (defaulted to mvp)", file=sys.stderr)
    # Still exit 0 — validate-instantiation.sh will reject these and the revise gate
    # will surface them. delivery-order.md exists and is usable in the meantime.

print(f"✅ wrote {output_path} ({total} tasks: " +
      ", ".join(f"{p}={phase_counts[p]}" for p in PHASE_ORDER) + ")")
PYEOF

exit_code=$?
exit $exit_code
