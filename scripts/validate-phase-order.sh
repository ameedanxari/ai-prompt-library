#!/usr/bin/env bash
# validate-phase-order.sh — deterministic C11 phase/order contract gate.
#
# Reads the task contract and writes phase-order-report.md. This keeps
# phase semantics out of the broad instantiation validator and gives the
# executor a single report for Phase fields, MVP coverage, inversions,
# mixed-phase task files, and dependency cycles.
#
# Usage:
#   bash scripts/validate-phase-order.sh [target-dir]
#
# Exit codes:
#   0  phase/order contract is valid
#   1  blocking phase/order issues found
#   2  preconditions missing

set -uo pipefail

TARGET_DIR="${1:-prompts/outputs/current}"
REPORT="$TARGET_DIR/phase-order-report.md"
CONTRACT="$TARGET_DIR/task-contract.json"

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
  echo "❌ target directory does not exist: $TARGET_DIR" >&2
  echo "usage: bash scripts/validate-phase-order.sh [target-dir]" >&2
  exit 2
fi

if ! command -v python3 >/dev/null 2>&1; then
  echo "❌ python3 not found" >&2
  exit 2
fi

contract_status=0
bash "$SCRIPT_DIR/build-task-contract.sh" "$TARGET_DIR" "$CONTRACT" || contract_status=$?
if [ "$contract_status" -ne 0 ]; then
  echo "❌ task contract could not be built for phase/order validation" >&2
  exit 2
fi

python3 - "$TARGET_DIR" "$CONTRACT" "$REPORT" <<'PY'
import datetime
import json
import os
import sys

target_dir, contract_path, report_path = sys.argv[1], sys.argv[2], sys.argv[3]

PHASES = ["foundation", "mvp", "expand", "polish"]
PHASE_RANK = {phase: index for index, phase in enumerate(PHASES)}


def md_escape(value):
    return str(value).replace("|", r"\|").replace("\n", " ")


def add_issue(issues, code, message, file=None, unit=None, dependency=None, phase=None, dependency_phase=None):
    issues.append({
        "code": code,
        "file": file,
        "unit": unit,
        "dependency": dependency,
        "phase": phase,
        "dependencyPhase": dependency_phase,
        "message": message,
    })


if not os.path.exists(contract_path):
    print(f"❌ task contract not found: {contract_path}", file=sys.stderr)
    sys.exit(2)

with open(contract_path, encoding="utf-8") as handle:
    contract = json.load(handle)

files = contract.get("files", [])
units = contract.get("units", [])
file_graph = contract.get("graphs", {}).get("files", {})
unit_graph = contract.get("graphs", {}).get("taskUnits", {})

files_by_name = {item["filename"]: item for item in files}
units_by_id = {item["canonicalId"]: item for item in units}
task_files = {item["filename"] for item in files if item.get("kind") == "tasks"}
greenfield = os.path.exists(os.path.join(target_dir, "epics.md")) and bool(task_files)
issues = []

phase_counts = {phase: 0 for phase in PHASES}
for unit in units:
    phase = unit.get("phase")
    if phase in PHASE_RANK:
        phase_counts[phase] += 1

for unit in units:
    if unit.get("invalidPhase"):
        add_issue(
            issues,
            "invalid-phase",
            f"{unit['canonicalId']} declares invalid Phase value {unit['invalidPhase']}.",
            file=unit.get("file"),
            unit=unit.get("canonicalId"),
        )
    elif not unit.get("phase"):
        add_issue(
            issues,
            "missing-phase",
            f"{unit['canonicalId']} is missing a Phase field.",
            file=unit.get("file"),
            unit=unit.get("canonicalId"),
        )

for file_entry in files:
    phases = file_entry.get("phases", [])
    if len(phases) > 1:
        add_issue(
            issues,
            "mixed-file-phases",
            f"{file_entry['filename']} contains multiple task phases ({', '.join(phases)}); split it or align phases so file-level delivery order is unambiguous.",
            file=file_entry.get("filename"),
        )


def file_phase(filename):
    entry = files_by_name.get(filename)
    if not entry:
        return None
    phases = entry.get("phases", [])
    invalid = entry.get("invalidPhases", [])
    if len(phases) == 1 and not invalid:
        return phases[0]
    return None


for node in file_graph.get("nodes", []):
    current_phase = file_phase(node.get("id"))
    if current_phase not in PHASE_RANK:
        continue
    for dep in node.get("dependencies", []):
        dep_phase = file_phase(dep)
        if dep_phase not in PHASE_RANK:
            continue
        if PHASE_RANK[dep_phase] > PHASE_RANK[current_phase]:
            add_issue(
                issues,
                "file-phase-inversion",
                f"{node['id']} ({current_phase}) depends on later-phase {dep} ({dep_phase}).",
                file=node.get("id"),
                dependency=dep,
                phase=current_phase,
                dependency_phase=dep_phase,
            )

for node in unit_graph.get("nodes", []):
    unit = units_by_id.get(node.get("id"))
    current_phase = unit.get("phase") if unit else None
    if current_phase not in PHASE_RANK:
        continue
    for dep in node.get("dependencies", []):
        dep_unit = units_by_id.get(dep)
        dep_phase = dep_unit.get("phase") if dep_unit else None
        if dep_phase not in PHASE_RANK:
            continue
        if PHASE_RANK[dep_phase] > PHASE_RANK[current_phase]:
            add_issue(
                issues,
                "task-phase-inversion",
                f"{node['id']} ({current_phase}) depends on later-phase {dep} ({dep_phase}).",
                file=unit.get("file"),
                unit=node.get("id"),
                dependency=dep,
                phase=current_phase,
                dependency_phase=dep_phase,
            )

for cycle_file in file_graph.get("cycleNodes", []):
    add_issue(
        issues,
        "file-dependency-cycle",
        f"{cycle_file} is part of a file-level dependency cycle.",
        file=cycle_file,
    )

for cycle_unit in unit_graph.get("cycleNodes", []):
    unit = units_by_id.get(cycle_unit, {})
    add_issue(
        issues,
        "task-dependency-cycle",
        f"{cycle_unit} is part of a task-unit dependency cycle.",
        file=unit.get("file"),
        unit=cycle_unit,
    )

mvp_task_count = sum(
    1
    for unit in units
    if unit.get("file") in task_files and unit.get("phase") == "mvp"
)
if greenfield and mvp_task_count == 0:
    add_issue(
        issues,
        "zero-mvp-phase",
        "Greenfield plan has zero tasks in the mvp phase.",
    )

issues.sort(key=lambda item: (
    item["code"],
    item.get("file") or "",
    item.get("unit") or "",
    item.get("dependency") or "",
))

now = datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
status = "fail" if issues else "pass"

with open(report_path, "w", encoding="utf-8") as report:
    report.write("---\n")
    report.write(f"generated_at: {now}\n")
    report.write("generated_by: scripts/validate-phase-order.sh\n")
    report.write(f"target_dir: {target_dir}\n")
    report.write(f"source_contract: {contract_path}\n")
    report.write(f"greenfield: {str(greenfield).lower()}\n")
    report.write(f"mvp_task_count: {mvp_task_count}\n")
    report.write(f"issue_count: {len(issues)}\n")
    report.write(f"status: {status}\n")
    report.write("---\n\n")
    report.write("# Phase Order Report\n\n")
    report.write(f"_Generated by `scripts/validate-phase-order.sh` on {now}._\n\n")
    if issues:
        report.write("❌ phase_order: fail\n\n")
        report.write("| Code | Task/File | Dependency | Issue |\n")
        report.write("|---|---|---|---|\n")
        for issue in issues:
            task = issue.get("unit") or issue.get("file") or "plan"
            dependency = issue.get("dependency") or "n/a"
            report.write(f"| `{issue['code']}` | `{task}` | `{dependency}` | {md_escape(issue['message'])} |\n")
        report.write("\n")
    else:
        report.write("✅ phase_order: pass\n\n")

    report.write("## Phase Counts\n\n")
    report.write("| Phase | Task Units |\n")
    report.write("|---|---:|\n")
    for phase in PHASES:
        report.write(f"| `{phase}` | {phase_counts[phase]} |\n")
    report.write("\n")

    report.write("## Machine Summary\n\n")
    report.write("```json\n")
    report.write(json.dumps({
        "status": status,
        "greenfield": greenfield,
        "mvpTaskCount": mvp_task_count,
        "phaseCounts": phase_counts,
        "issueCount": len(issues),
        "issues": issues,
    }, indent=2))
    report.write("\n```\n")

if issues:
    for issue in issues:
        file = issue.get("file")
        if file:
            print(f"❌ {os.path.join(target_dir, file)}: {issue['message']}")
        else:
            print(f"❌ phase-order: {issue['message']}")
    print(f"❌ phase-order: fail — wrote {report_path}")
    sys.exit(1)

print(f"✅ phase-order: pass — wrote {report_path}")
PY
