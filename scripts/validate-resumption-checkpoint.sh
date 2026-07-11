#!/usr/bin/env bash
# validate-resumption-checkpoint.sh — validate selective-resume state.
#
# Usage:
#   bash scripts/validate-resumption-checkpoint.sh [checkpoint-or-output-dir]
#
# If a directory is passed, validates:
#   <directory>/resumption-checkpoint.md
#
# Exit codes:
#   0  checkpoint is valid
#   1  checkpoint exists but violates the schema
#   2  preconditions missing

set -uo pipefail

TARGET="${1:-prompts/outputs/current/resumption-checkpoint.md}"
if [ -d "$TARGET" ]; then
  CHECKPOINT="$TARGET/resumption-checkpoint.md"
else
  CHECKPOINT="$TARGET"
fi

if [ ! -f "$CHECKPOINT" ]; then
  echo "❌ resumption checkpoint not found: $CHECKPOINT" >&2
  exit 2
fi

if ! command -v python3 >/dev/null 2>&1; then
  echo "❌ python3 not found — required for checkpoint validation" >&2
  exit 2
fi

python3 - "$CHECKPOINT" <<'PY'
from __future__ import annotations

import re
import sys
from pathlib import Path

checkpoint = Path(sys.argv[1])
text = checkpoint.read_text(encoding="utf-8")
lines = text.splitlines()
issues: list[str] = []


def path_exists_for_reload(raw: str, checkpoint_path: Path) -> bool:
    path = Path(raw)
    if path.is_absolute():
        return path.exists()

    candidates = [path]
    if raw.startswith("prompts/outputs/current/"):
        candidates.append(checkpoint_path.parent / Path(raw).name)
    else:
        candidates.append(checkpoint_path.parent / raw)

    return any(candidate.exists() for candidate in candidates)

if not lines or lines[0].strip() != "---":
    print(f"❌ {checkpoint}: missing YAML frontmatter fence on line 1")
    sys.exit(1)

try:
    end = next(index for index, line in enumerate(lines[1:], start=1) if line.strip() == "---")
except StopIteration:
    print(f"❌ {checkpoint}: missing closing YAML frontmatter fence")
    sys.exit(1)

frontmatter = lines[1:end]
scalars: dict[str, str] = {}
lists: dict[str, list[str]] = {}
current_list: str | None = None

for line_number, line in enumerate(frontmatter, start=2):
    if not line.strip():
        continue
    list_item = re.match(r"^\s*-\s+(.+?)\s*$", line)
    if list_item:
        if current_list is None:
            issues.append(f"line {line_number}: list item appears before a list key")
            continue
        lists.setdefault(current_list, []).append(list_item.group(1).strip().strip('"\''))
        continue

    key_value = re.match(r"^([A-Za-z_][A-Za-z0-9_-]*):(?:\s*(.*))?$", line)
    if not key_value:
        issues.append(f"line {line_number}: unsupported YAML shape")
        current_list = None
        continue

    key, raw_value = key_value.group(1), (key_value.group(2) or "").strip()
    if raw_value:
        scalars[key] = raw_value.strip('"\'')
        current_list = None
    else:
        lists.setdefault(key, [])
        current_list = key

required_scalars = ["phase", "engine", "step", "last_completed", "next_action", "updated_at"]
for key in required_scalars:
    if not scalars.get(key):
        issues.append(f"missing required field: {key}")

reload_files = lists.get("re_load_files", [])
if not reload_files:
    issues.append("missing required non-empty list: re_load_files")

phase = scalars.get("phase", "")
engine = scalars.get("engine", "")
next_action = scalars.get("next_action", "")

if phase and phase not in {"planning", "execution"}:
    issues.append(f"phase must be planning or execution, got: {phase}")

allowed_engines = {"drill-down", "drill-down-engine", "audit-and-remediate", "executor"}
if engine and engine not in allowed_engines:
    issues.append(f"engine is not recognized: {engine}")

if phase == "execution" and engine != "executor":
    issues.append("execution checkpoints must use engine: executor")

if phase == "planning" and engine == "executor":
    issues.append("planning checkpoints must not use engine: executor")

if scalars.get("updated_at") and not re.fullmatch(r"\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z", scalars["updated_at"]):
    issues.append("updated_at must be an ISO 8601 UTC timestamp")

placeholder_re = re.compile(r"\{\{[^}]+\}\}|<[^>]+>|\*|\.\.\.|#")
trusted_orchestrators = {
    "prompts/orchestrators/semantic-review-and-validation.md",
    ".ai-prompts/prompts/orchestrators/semantic-review-and-validation.md",
}
seen_reload_files: set[str] = set()
for reload_file in reload_files:
    if reload_file in seen_reload_files:
        issues.append(f"duplicate re_load_files entry: {reload_file}")
    seen_reload_files.add(reload_file)

    if placeholder_re.search(reload_file):
        issues.append(f"re_load_files contains placeholder/comment/glob entry: {reload_file}")
    if not (
        reload_file.startswith("prompts/outputs/current/")
        or Path(reload_file).is_absolute()
        or reload_file in trusted_orchestrators
    ):
        issues.append(f"re_load_files entry must be absolute, under prompts/outputs/current/, or a trusted orchestrator: {reload_file}")
    if not path_exists_for_reload(reload_file, checkpoint):
        issues.append(f"re_load_files entry does not exist on disk: {reload_file}")

if phase == "execution":
    has_log = any(path.endswith("/execution-log.md") or path == "prompts/outputs/current/execution-log.md" for path in reload_files)
    has_task = any(re.search(r"/(?:tasks|remediation)-[a-z0-9][a-z0-9-]*\.md$", path) for path in reload_files)
    is_final = re.search(r"honest-handoff|complete|final", next_action, re.IGNORECASE) is not None
    is_semantic_review = re.search(r"semantic review", next_action, re.IGNORECASE) is not None
    has_semantic_orchestrator = any(path in trusted_orchestrators for path in reload_files)
    if not has_log:
        issues.append("execution checkpoints must reload execution-log.md")
    if is_semantic_review and not has_semantic_orchestrator:
        issues.append("semantic-review checkpoints must reload the trusted semantic-review orchestrator")
    if not has_task and not is_final and not is_semantic_review:
        issues.append("execution checkpoints must reload the next task unless next_action is final or semantic review")

if phase == "planning":
    has_planning_artifact = any(
        re.search(r"/(epics|brief-keywords|features-[^/]+|tasks-[^/]+|remediation-[^/]+|audit-report|gap-list|revise-report|external-accounts|delivery-order|task-contract|task-graph|phase-order-report|user-review-checkpoints)\.(md|json)$", path)
        for path in reload_files
    )
    if not has_planning_artifact:
        issues.append("planning checkpoints must reload at least one planning artifact")

if issues:
    print(f"❌ resumption checkpoint invalid: {checkpoint}")
    for issue in issues:
        print(f"   - {issue}")
    sys.exit(1)

print(f"✅ resumption checkpoint valid: {checkpoint}")
PY
