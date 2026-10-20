#!/usr/bin/env bash
# rotate-execution-log.sh — move superseded journal history out of the
# append-only execution log into numbered archive files.
#
# execution-log.md holds a journal plus an `execution-status-record` fence per
# task unit and can reach many MB, mostly superseded history: a prompt is
# re-run across rounds and gets a new `### `prompt` — done|blocked|...` section
# each time. Rotation moves every journal section that is NOT the latest
# section (in log order) for its prompt, whatever its status, verbatim to
# <TARGET_DIR>/../archive/execution-log-NNN.md. The main log lists the archive
# under `journal_archives:` in its frontmatter, and every consumer
# (validate-execution-status.sh, execution-log-slice.sh, ...) reads archives
# transparently through scripts/lib/execution_log.py: archives (older) first,
# then the main log, so "the last record in log order wins" is preserved.
#
# Usage:
#   rotate-execution-log.sh [TARGET_DIR] [--max-bytes N] [--keep N] [--dry-run]
#
#   TARGET_DIR    directory holding execution-log.md (default prompts/outputs/current)
#   --max-bytes N rotate only when the log is larger than N bytes (default 1048576)
#   --keep N      also keep the last N `done` sections in the main log (default 10)
#   --dry-run     print what would move; write nothing
#
# Eligible: superseded sections (a later section for the same prompt exists)
# and the latest `done` section of a prompt that is not next_task nor listed
# as blocked/failed/deferred. Always stays: the latest non-done section (so next_task and
# blocked/failed/deferred work keep their current entry), the last --keep
# `done` sections, any section a move of which would put it ahead of an earlier
# staying section of the same prompt or an earlier staying record of one of its
# taskIds, and a section holding an unclosed fence. Record fences outside any
# journal section (e.g. a consolidated "Canonical task-unit records" section)
# move only when every taskId in the fence has a later record in the log and no
# staying record of those taskIds precedes the fence.
#
# Exit codes: 0 rotated or not needed, 1 over the limit but nothing eligible,
#             2 usage or precondition error.

set -uo pipefail

usage() {
  echo "usage: $(basename "$0") [TARGET_DIR] [--max-bytes N] [--keep N] [--dry-run]" >&2
}

MAX_BYTES=1048576
KEEP=10
DRY_RUN=0
TARGET_DIR=""
while [ $# -gt 0 ]; do
  case "$1" in
    --max-bytes) [ $# -ge 2 ] || { usage; exit 2; }; MAX_BYTES="$2"; shift 2 ;;
    --keep) [ $# -ge 2 ] || { usage; exit 2; }; KEEP="$2"; shift 2 ;;
    --dry-run) DRY_RUN=1; shift ;;
    -h|--help) usage; exit 2 ;;
    -*) echo "❌ unknown option: $1" >&2; usage; exit 2 ;;
    *)
      if [ -n "$TARGET_DIR" ]; then usage; exit 2; fi
      TARGET_DIR="$1"; shift ;;
  esac
done
TARGET_DIR="${TARGET_DIR:-prompts/outputs/current}"

case "$MAX_BYTES" in ''|*[!0-9]*) echo "❌ --max-bytes needs a non-negative integer" >&2; exit 2 ;; esac
case "$KEEP" in ''|*[!0-9]*) echo "❌ --keep needs a non-negative integer" >&2; exit 2 ;; esac

LOG="$TARGET_DIR/execution-log.md"
if [ ! -d "$TARGET_DIR" ]; then
  echo "❌ target directory not found: $TARGET_DIR" >&2
  exit 2
fi
if [ ! -f "$LOG" ]; then
  echo "❌ execution log not found: $LOG" >&2
  exit 2
fi
if ! command -v python3 >/dev/null 2>&1; then
  echo "❌ python3 is required" >&2
  exit 2
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
EXEC_LOG_LIB="$SCRIPT_DIR/lib" python3 - "$TARGET_DIR" "$MAX_BYTES" "$KEEP" "$DRY_RUN" <<'PY'
import json
import os
import re
import sys
import tempfile
from datetime import datetime, timezone

sys.dont_write_bytecode = True
sys.path.insert(0, os.environ["EXEC_LOG_LIB"])
from execution_log import parse_journal_archives, split_frontmatter  # noqa: E402

target_dir = sys.argv[1]
max_bytes, keep, dry_run = int(sys.argv[2]), int(sys.argv[3]), sys.argv[4] == "1"
log_path = os.path.join(target_dir, "execution-log.md")

with open(log_path, encoding="utf-8", newline="") as handle:
    text = handle.read()
size_before = len(text.encode("utf-8"))
if size_before <= max_bytes:
    print(f"execution log: {size_before} bytes, no rotation needed")
    sys.exit(0)

frontmatter_body, _ = split_frontmatter(text)
if not text.startswith("---"):
    print("❌ execution log has no YAML frontmatter", file=sys.stderr)
    sys.exit(2)

# ---- split the log into lines and find journal sections and record fences ----
lines = text.splitlines(keepends=True)
header_re = re.compile(r"^###\s+`([^`]+)`[^\n]*?[—-]\s*(done|blocked|failed|deferred)\s*$", re.I)
any_header_re = re.compile(r"^(###\s+|##\s+)")

sections = []   # {prompt, status, start, end}
fences = []     # {start, end, ids, section index or None}
in_fence = False
fence_start = 0
current = None
body_start = 0
fm = re.match(r"\A---[ \t]*\r?\n.*?\r?\n---[ \t]*(?:\r?\n|\Z)", text, re.S)
if fm:
    body_start = len(text[: fm.end()].splitlines(keepends=True))

for index in range(body_start, len(lines)):
    line = lines[index].rstrip("\r\n")
    if line.startswith("```"):
        if not in_fence:
            in_fence = True
            fence_start = index
            fence_info = line[3:].strip()
        else:
            in_fence = False
            if fence_info == "execution-status-record":
                raw = "".join(lines[fence_start + 1 : index])
                ids = []
                try:
                    parsed = json.loads(raw)
                    ids = [r.get("taskId") for r in (parsed if isinstance(parsed, list) else [parsed]) if isinstance(r, dict) and r.get("taskId")]
                    parsed_ok = True
                except ValueError:
                    parsed_ok = False
                fences.append({"start": fence_start, "end": index + 1, "ids": ids, "ok": parsed_ok, "section": None})
        continue
    if in_fence:
        continue
    if any_header_re.match(line):
        if current is not None:
            current["end"] = index
            current = None
        match = header_re.match(line)
        if match:
            current = {"prompt": match.group(1), "status": match.group(2).lower(), "start": index, "end": len(lines)}
            sections.append(current)
if current is not None:
    current["end"] = len(lines)
unterminated_at = fence_start if in_fence else None  # never move a section holding an unclosed fence

for fence in fences:
    for number, section in enumerate(sections):
        if section["start"] <= fence["start"] < section["end"]:
            fence["section"] = number
            break

# ---- choose what to move ----
# Two kinds of section are eligible:
#   1. superseded history: a later section for the same prompt exists, whatever
#      the status of either. The latest section of every prompt stays, so
#      next_task and blocked/failed/deferred work keep their current entry;
#   2. settled work: the latest section of a prompt whose status is `done`,
#      unless it is one of the last --keep done sections, or the prompt is the
#      envelope's next_task or listed in blocked/failed/deferred_tasks.
def envelope_field(name):
    match = re.search(r"^" + re.escape(name) + r":[ \t]*(.*)$", frontmatter_body, re.M)
    return match.group(1).strip() if match else ""

def envelope_list(name):
    raw = envelope_field(name)
    if raw.startswith("[") and raw.endswith("]"):
        raw = raw[1:-1]
    # entries may be unit-qualified (tasks-b.md#T4) or path-qualified; keep the prompt name
    return {os.path.basename(item.strip().strip("\"'")).split("#", 1)[0] for item in raw.split(",") if item.strip()}

excluded_prompts = envelope_list("blocked_tasks") | envelope_list("failed_tasks") | envelope_list("deferred_tasks")
next_task = envelope_field("next_task").strip("\"'")
if next_task and next_task != "null":
    excluded_prompts.add(next_task)

last_for_prompt = {}
for number, section in enumerate(sections):
    last_for_prompt[section["prompt"]] = number
done_numbers = [n for n, s in enumerate(sections) if s["status"] == "done"]
kept_done = set(done_numbers[len(done_numbers) - keep:]) if keep > 0 else set()
candidates = set()
for number, section in enumerate(sections):
    if unterminated_at is not None and section["start"] <= unterminated_at < section["end"]:
        continue
    if last_for_prompt[section["prompt"]] != number:
        candidates.add(number)            # superseded history
        continue
    if section["status"] == "done" and number not in kept_done and section["prompt"] not in excluded_prompts:
        candidates.add(number)            # settled work

def unit_ids(number):
    return [i for f in fences if f["section"] == number for i in f["ids"]]

pinned_fences = set()   # outside fences that must stay (order safety)
moved_fences = set()
while True:
    moved_fences = set()
    for number, fence in enumerate(fences):
        if fence["section"] is not None:
            if fence["section"] in candidates:
                moved_fences.add(number)
        elif number not in pinned_fences and fence["ok"] and fence["ids"] and all(
            any(other["start"] > fence["start"] and task_id in other["ids"] for other in fences)
            for task_id in fence["ids"]
        ):
            # superseded: every record in the fence has a later record in the log
            moved_fences.add(number)

    # "Last record in log order wins" must survive: moved chunks end up before
    # everything that stays, so a moved chunk may not originally follow a
    # staying chunk with the same taskId (or a staying section of the same prompt).
    stay_fences = [(f["start"], set(f["ids"])) for n, f in enumerate(fences) if n not in moved_fences]
    stay_sections = [(s["start"], s["prompt"]) for n, s in enumerate(sections) if n not in candidates]
    changed = False
    for number in sorted(candidates):
        start, prompt, ids = sections[number]["start"], sections[number]["prompt"], set(unit_ids(number))
        if any(pos < start and prompt == other for pos, other in stay_sections) or any(
            pos < start and ids & other_ids for pos, other_ids in stay_fences
        ):
            candidates.discard(number)
            changed = True
            break
    if changed:
        continue
    for number in sorted(moved_fences):
        fence = fences[number]
        if fence["section"] is None and any(
            pos < fence["start"] and set(fence["ids"]) & other_ids for pos, other_ids in stay_fences
        ):
            pinned_fences.add(number)
            changed = True
            break
    if not changed:
        break

if not candidates:
    print(f"execution log: {size_before} bytes exceeds {max_bytes} but no journal section is eligible to archive")
    sys.exit(1)

move_ranges = [(sections[n]["start"], sections[n]["end"], "section", n) for n in sorted(candidates)]
for number in sorted(moved_fences):
    fence = fences[number]
    if fence["section"] is None:
        move_ranges.append((fence["start"], fence["end"], "fence", number))
move_ranges.sort()

# Outside fences keep the original line extent; sections own their full extent.
moved_text = []
for start, end, kind, ref in move_ranges:
    chunk = "".join(lines[start:end])
    if chunk and not chunk.endswith("\n"):
        chunk += "\n"
    moved_text.append(chunk)

# ---- archive location ----
archive_dir = os.path.join(os.path.abspath(target_dir), "..", "archive")
archive_dir = os.path.normpath(archive_dir)
project_root = os.path.normpath(os.path.join(os.path.abspath(target_dir), "..", "..", ".."))
existing = []
if os.path.isdir(archive_dir):
    for name in os.listdir(archive_dir):
        match = re.fullmatch(r"execution-log-(\d+)\.md", name)
        if match:
            existing.append(int(match.group(1)))
number = (max(existing) + 1) if existing else 1
archive_name = f"execution-log-{number:03d}.md"
archive_path = os.path.join(archive_dir, archive_name)
archive_rel = os.path.relpath(archive_path, project_root).replace(os.sep, "/")

moved_sections = [sections[n] for n in sorted(candidates)]
print(f"execution log: {size_before} bytes exceeds {max_bytes}; "
      f"{'would move' if dry_run else 'moving'} {len(moved_sections)} section(s) to {archive_rel}")
for section in moved_sections:
    print(f"  - `{section['prompt']}` — {section['status']}")
outside_moved = [r for r in move_ranges if r[2] == "fence"]
if outside_moved:
    print(f"  - {len(outside_moved)} record fence(s) outside journal sections")
if dry_run:
    print("dry run: nothing written")
    sys.exit(0)

# ---- build the new main log ----
skip = set()
for start, end, _, _ in move_ranges:
    skip.update(range(start, end))
kept = [line for index, line in enumerate(lines) if index not in skip]
new_text = "".join(kept)

def add_archive_to_frontmatter(content):
    match = re.match(r"\A(---[ \t]*\r?\n)(.*?)(\r?\n---[ \t]*(?:\r?\n|\Z))", content, re.S)
    assert match
    head, body, tail = match.group(1), match.group(2), match.group(3)
    body_lines = body.split("\n")
    for position, line in enumerate(body_lines):
        key = re.match(r"^journal_archives:[ \t]*(.*)$", line)
        if not key:
            continue
        inline = key.group(1).strip()
        if inline.startswith("["):
            inner = inline[1:-1] if inline.endswith("]") else inline[1:]
            parts = [p.strip() for p in inner.split(",") if p.strip()]
            parts.append(archive_rel)
            body_lines[position] = "journal_archives: [" + ", ".join(parts) + "]"
        elif inline and inline not in {"null", "~"}:
            body_lines[position] = f"journal_archives: [{inline}, {archive_rel}]"
        else:
            end_item = position
            while end_item + 1 < len(body_lines) and re.match(r"^\s+-\s+", body_lines[end_item + 1]):
                end_item += 1
            if inline in {"null", "~"}:
                body_lines[position] = "journal_archives:"
            body_lines.insert(end_item + 1, f"  - {archive_rel}")
        break
    else:
        body_lines.extend(["journal_archives:", f"  - {archive_rel}"])
    return head + "\n".join(body_lines) + tail + content[match.end():]

new_text = add_archive_to_frontmatter(new_text)

index_lines = [f"- `{s['prompt']}` — {s['status']} → {archive_rel}\n" for s in moved_sections]
all_lines = new_text.splitlines(keepends=True)
heading_at = None
for position, line in enumerate(all_lines):
    if re.match(r"^##\s+Archived entries\s*$", line.rstrip("\r\n")):
        heading_at = position
if heading_at is None:
    if all_lines and not all_lines[-1].endswith("\n"):
        all_lines[-1] += "\n"
    if all_lines and all_lines[-1].strip():
        all_lines.append("\n")
    all_lines.append("## Archived entries\n")
    all_lines.append("\n")
    all_lines.extend(index_lines)
else:
    section_end = len(all_lines)
    for position in range(heading_at + 1, len(all_lines)):
        if re.match(r"^##\s+", all_lines[position]) or re.match(r"^###\s+", all_lines[position]):
            section_end = position
            break
    insert_at = section_end
    while insert_at > heading_at + 1 and not all_lines[insert_at - 1].strip():
        insert_at -= 1
    if insert_at > 0 and not all_lines[insert_at - 1].endswith("\n"):
        all_lines[insert_at - 1] += "\n"
    all_lines[insert_at:insert_at] = index_lines
new_text = "".join(all_lines)

archive_text = (
    "---\n"
    "archived_from: execution-log.md\n"
    f"archived_at: {datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ')}\n"
    f"sections: {len(moved_sections)}\n"
    "---\n"
    + "".join(moved_text)
)

def atomic_write(path, content):
    directory = os.path.dirname(path)
    os.makedirs(directory, exist_ok=True)
    handle, temp_path = tempfile.mkstemp(prefix=".rotate-", dir=directory)
    try:
        with os.fdopen(handle, "w", encoding="utf-8", newline="") as stream:
            stream.write(content)
        os.replace(temp_path, path)
    except BaseException:
        if os.path.exists(temp_path):
            os.unlink(temp_path)
        raise

atomic_write(archive_path, archive_text)
try:
    atomic_write(log_path, new_text)
except BaseException:
    os.unlink(archive_path)
    raise

size_after = len(new_text.encode("utf-8"))
print(f"moved {len(moved_sections)} section(s); log {size_before} -> {size_after} bytes; archive {archive_rel}")
sys.exit(0)
PY
exit $?
