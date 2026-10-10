#!/usr/bin/env bash
# execution-log-slice.sh — print only the execution-log parts for one plan packet.
#
# execution-log.md can exceed 1 MB. An agent working on one remediation or
# tasks packet needs the log frontmatter plus the journal entries for that
# packet, not the whole file.
#
# Usage:
#   execution-log-slice.sh [TARGET_DIR] PLAN_FILE [--records-only]
#
#   TARGET_DIR      directory holding execution-log.md (default prompts/outputs/current)
#   PLAN_FILE       plan packet file name, e.g. remediation-foo.md (a path is reduced to its name)
#   --records-only  print only the execution-status-record JSON blocks whose
#                   taskId starts with PLAN_FILE#, as one JSON array; scans the
#                   whole log (outside other code fences), in log order
#
# Default output: the YAML frontmatter, then every journal entry whose
# `### ` header names PLAN_FILE (the entry runs until the next `### ` or
# `## ` line), records included, then a `## Records outside packet entries`
# section with matching records that sit elsewhere in the log (for example
# the consolidated "Canonical task-unit records" section).
#
# Exit codes: 0 output printed, 1 nothing matched, 2 usage error or missing log.

set -uo pipefail

usage() {
  echo "usage: $(basename "$0") [TARGET_DIR] PLAN_FILE [--records-only]" >&2
}

RECORDS_ONLY=0
POSITIONAL=()
for arg in "$@"; do
  case "$arg" in
    --records-only) RECORDS_ONLY=1 ;;
    -h|--help) usage; exit 2 ;;
    -*) echo "❌ unknown option: $arg" >&2; usage; exit 2 ;;
    *) POSITIONAL+=("$arg") ;;
  esac
done

TARGET_DIR="prompts/outputs/current"
PLAN_FILE=""
case "${#POSITIONAL[@]}" in
  1) PLAN_FILE="${POSITIONAL[0]}" ;;
  2)
    if [[ "${POSITIONAL[0]}" == *.md ]]; then
      usage; exit 2
    fi
    TARGET_DIR="${POSITIONAL[0]}"
    PLAN_FILE="${POSITIONAL[1]}"
    ;;
  *) usage; exit 2 ;;
esac
PLAN_FILE="$(basename "$PLAN_FILE")"
LOG="$TARGET_DIR/execution-log.md"

if [ ! -f "$LOG" ]; then
  echo "❌ execution log not found: $LOG" >&2
  exit 2
fi

python3 - "$LOG" "$PLAN_FILE" "$RECORDS_ONLY" <<'PY'
import json
import re
import sys

log_path, plan, records_only = sys.argv[1], sys.argv[2], sys.argv[3] == "1"
lines = open(log_path, encoding="utf-8").read().splitlines()

# Frontmatter: first line `---` up to the next `---`.
frontmatter = []
body_start = 0
if lines and lines[0].strip() == "---":
    for i in range(1, len(lines)):
        if lines[i].strip() == "---":
            frontmatter = lines[: i + 1]
            body_start = i + 1
            break

header_re = re.compile(r"^### `" + re.escape(plan) + r"`")
entries = []          # each: list of lines
current = None
in_fence = False
fence_info = ""
block = None          # (start_line_index, [lines]) of an open status-record fence
blocks = []           # (start_line_index, raw text, entry or None)
for idx, line in enumerate(lines[body_start:], start=body_start):
    if line.startswith("```"):
        if not in_fence:
            in_fence = True
            fence_info = line[3:].strip()
            if fence_info == "execution-status-record":
                block = []
        else:
            if block is not None:
                blocks.append((idx, "\n".join(block), current))
                block = None
            in_fence = False
            fence_info = ""
        if current is not None:
            current.append(line)
        continue
    if in_fence:
        if block is not None:
            block.append(line)
        if current is not None:
            current.append(line)
        continue
    if line.startswith("### ") or line.startswith("## "):
        current = None
        if header_re.match(line):
            current = [line]
            entries.append(current)
        continue
    if current is not None:
        current.append(line)

# Every status-record block in the whole log, in log order, for this plan.
records = []          # (parsed, raw, owning entry or None)
for _, raw, owner in blocks:
    try:
        rec = json.loads(raw)
    except ValueError:
        continue
    if isinstance(rec, dict) and str(rec.get("taskId", "")).startswith(plan + "#"):
        records.append((rec, raw, owner))

if records_only:
    if not records:
        print(f"no execution-status records for {plan}", file=sys.stderr)
        sys.exit(1)
    print(json.dumps([r[0] for r in records], indent=2, ensure_ascii=False))
    sys.exit(0)

outside = [r for r in records if r[2] is None]
if not entries and not outside:
    print(f"no journal entries for {plan}", file=sys.stderr)
    sys.exit(1)

out = list(frontmatter)
for entry in entries:
    while entry and not entry[-1].strip():
        entry.pop()
    if out:
        out.append("")
    out.extend(entry)
if outside:
    if out:
        out.append("")
    out.append("## Records outside packet entries")
    for _, raw, _ in outside:
        out.append("")
        out.append("```execution-status-record")
        out.append(raw)
        out.append("```")
print("\n".join(out))
PY
