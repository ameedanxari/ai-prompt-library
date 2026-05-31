#!/usr/bin/env bash
# repair-task-schema-fields.sh — conservative task-card schema normalizer.
#
# This is a mechanical helper for Schema Alignment Pass output. It only
# repairs explicit schema evidence already present in a task/remediation
# file: field aliases, common value shorthands, and acceptance bullets
# that immediately follow an Acceptance field. It does not invent missing
# task requirements.
#
# Usage:
#   bash scripts/repair-task-schema-fields.sh [target-dir]
#
# Exit codes:
#   0  files were scanned and task-schema-repair-report.md was written
#   1  target directory missing

set -euo pipefail

TARGET_DIR="${1:-prompts/outputs/current}"
REPORT="$TARGET_DIR/task-schema-repair-report.md"

if [ ! -d "$TARGET_DIR" ]; then
  echo "❌ target directory does not exist: $TARGET_DIR"
  echo "usage: bash scripts/repair-task-schema-fields.sh [target-dir]"
  exit 1
fi

if ! command -v python3 >/dev/null 2>&1; then
  echo "❌ python3 not found — required for schema repair" >&2
  exit 1
fi

python3 - "$TARGET_DIR" "$REPORT" <<'PY'
import datetime
import json
import os
import re
import sys
from pathlib import Path

target_dir = Path(sys.argv[1])
report_path = Path(sys.argv[2])

PLAN_RE = re.compile(r"^(tasks|remediation)-[a-z0-9][a-z0-9-]*\.md$")
FIELD_RE = re.compile(r"^(\s*[-*]\s*)\*\*([^:*]+):\*\*(\s*)(.*)$")
PLAIN_RE = re.compile(r"^(\s*)(User story|Closes story|Closes user story|Change type|Change|Target file|Target files|File path|File paths|File|Files|Path|Paths|Precise change|Precise delta|Implementation|Implementation change|Acceptance|Acceptance criteria|Depends on|Depends|Dependencies|Prerequisite|Prerequisites|Test|Tests|Test command|Verification|Estimated LOC|Estimate LOC|LOC|Lines changed|Phase|Delivery phase|Execution phase):\s*(.*)$", re.I)

CANONICAL = {
    "closes user story": "Closes user story",
    "user story": "Closes user story",
    "closes story": "Closes user story",
    "change type": "Change type",
    "change": "Change type",
    "operation type": "Change type",
    "target file": "File",
    "target files": "File",
    "file path": "File",
    "file paths": "File",
    "file": "File",
    "files": "File",
    "path": "File",
    "paths": "File",
    "precise change": "Precise change",
    "precise delta": "Precise change",
    "implementation": "Precise change",
    "implementation change": "Precise change",
    "acceptance": "Acceptance",
    "acceptance criteria": "Acceptance",
    "acceptance criterion": "Acceptance",
    "acceptance checks": "Acceptance",
    "depends on": "Depends on",
    "depends": "Depends on",
    "dependency": "Depends on",
    "dependencies": "Depends on",
    "prerequisite": "Depends on",
    "prerequisites": "Depends on",
    "test": "Test",
    "tests": "Test",
    "test command": "Test",
    "verification": "Test",
    "verifier": "Test",
    "validation command": "Test",
    "estimated loc": "Estimated LOC",
    "estimate loc": "Estimated LOC",
    "estimated lines": "Estimated LOC",
    "loc": "Estimated LOC",
    "lines changed": "Estimated LOC",
    "phase": "Phase",
    "delivery phase": "Phase",
    "execution phase": "Phase",
}


def normalise_key(raw: str) -> str:
    return re.sub(r"[^a-z0-9]+", " ", raw.strip().lower()).strip()


def normalise_value(field: str, raw: str) -> str:
    value = raw.strip()
    lower = re.sub(r"[\s_.]+", " ", value.lower()).strip(" .")

    if field == "Change type":
        if re.fullmatch(r"(create|create new|new|new file|add|add new|add file)", lower):
            return "create-new"
        if re.fullmatch(r"(modify|modify existing|update|edit|change existing|existing|update existing)", lower):
            return "modify-existing"
        hyphen = lower.replace(" ", "-")
        if hyphen in {"create-new", "modify-existing"}:
            return hyphen

    if field == "Depends on":
        if re.fullmatch(r"(none|no dependencies?|n/a|na|not applicable)", lower):
            return "none"

    if field == "Estimated LOC":
        match = re.fullmatch(r"(?:about|approx(?:imately)?|around|~)?\s*([0-9]+)", lower)
        if match:
            return f"~{match.group(1)}"

    if field == "Phase":
        phase = lower.rstrip(".")
        if phase in {"foundation", "mvp", "expand", "polish"}:
            return phase

    return value


def canonical_line(field: str, value: str) -> str:
    return f"- **{field}:** {normalise_value(field, value)}"


def repair_file(path: Path) -> dict:
    original = path.read_text(encoding="utf-8")
    lines = original.splitlines()
    repaired: list[str] = []
    in_fence = False
    pending_acceptance = False
    field_repairs = 0
    value_repairs = 0
    bullet_repairs = 0

    for line in lines:
        stripped = line.strip()
        if stripped.startswith("```"):
            in_fence = not in_fence
            repaired.append(line)
            pending_acceptance = False
            continue

        if in_fence:
            repaired.append(line)
            continue

        new_line = line
        field_name = None
        field_value = None

        field_match = FIELD_RE.match(line)
        if field_match:
            key = normalise_key(field_match.group(2))
            canonical = CANONICAL.get(key)
            if canonical:
                field_name = canonical
                field_value = field_match.group(4)
                new_value = normalise_value(canonical, field_value)
                new_line = f"{field_match.group(1)}**{canonical}:** {new_value}"
                if canonical != field_match.group(2).strip():
                    field_repairs += 1
                if new_value != field_value.strip():
                    value_repairs += 1
        else:
            plain_match = PLAIN_RE.match(line)
            if plain_match:
                canonical = CANONICAL.get(normalise_key(plain_match.group(2)))
                if canonical:
                    field_name = canonical
                    field_value = plain_match.group(3)
                    new_line = canonical_line(canonical, field_value)
                    field_repairs += 1
                    if normalise_value(canonical, field_value) != field_value.strip():
                        value_repairs += 1

        if pending_acceptance and re.match(r"^\s*[-*]\s+", line) and not FIELD_RE.match(line):
            if not re.match(r"^\s{2,}[-*]\s+", line):
                new_line = f"  {line.lstrip()}"
                bullet_repairs += 1

        repaired.append(new_line)

        if field_name == "Acceptance":
            pending_acceptance = True
        elif FIELD_RE.match(new_line) or re.match(r"^##\s+", new_line):
            pending_acceptance = False

    next_text = "\n".join(repaired)
    if original.endswith("\n"):
        next_text += "\n"

    changed = next_text != original
    if changed:
        path.write_text(next_text, encoding="utf-8")

    return {
        "file": path.name,
        "changed": changed,
        "fieldRepairs": field_repairs,
        "valueRepairs": value_repairs,
        "acceptanceBulletRepairs": bullet_repairs,
        "totalRepairs": field_repairs + value_repairs + bullet_repairs,
    }


results = [
    repair_file(path)
    for path in sorted(target_dir.iterdir())
    if PLAN_RE.match(path.name)
]

now = datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
changed = [result for result in results if result["changed"]]
total_repairs = sum(result["totalRepairs"] for result in results)

with report_path.open("w", encoding="utf-8") as report:
    report.write("---\n")
    report.write(f"generated_at: {now}\n")
    report.write("generated_by: scripts/repair-task-schema-fields.sh\n")
    report.write(f"target_dir: {target_dir}\n")
    report.write(f"files_scanned: {len(results)}\n")
    report.write(f"files_modified: {len(changed)}\n")
    report.write(f"total_repairs: {total_repairs}\n")
    report.write("---\n\n")
    report.write("# Task Schema Repair Report\n\n")
    report.write(f"_Generated by `scripts/repair-task-schema-fields.sh` on {now}._\n\n")
    if changed:
        report.write("| File | Field Repairs | Value Repairs | Acceptance Bullet Repairs |\n")
        report.write("|---|---:|---:|---:|\n")
        for result in changed:
            report.write(
                f"| `{result['file']}` | {result['fieldRepairs']} | "
                f"{result['valueRepairs']} | {result['acceptanceBulletRepairs']} |\n"
            )
    else:
        report.write("No mechanical schema repairs were needed.\n")
    report.write("\n## Machine Summary\n\n")
    report.write("```json\n")
    report.write(json.dumps({
        "filesScanned": len(results),
        "filesModified": len(changed),
        "totalRepairs": total_repairs,
        "results": results,
    }, indent=2))
    report.write("\n```\n")

for result in changed:
    print(
        f"repaired {result['totalRepairs']} schema item(s) in "
        f"{target_dir / result['file']}"
    )
print(
    "repair-task-schema-fields: "
    f"scanned {len(results)} files, modified {len(changed)}, "
    f"repaired {total_repairs} item(s)"
)
print(f"wrote {report_path}")
PY
