#!/usr/bin/env bash
# select-impacted-tests.sh — map changed files to the declared Test commands.
#
# Changed paths come from git; each is looked up in task-contract.json (never
# the markdown plans) and mapped to the `test` command of every unit whose
# file list contains that path. The caller runs only those commands instead
# of the full suite.
#
# Usage:
#   select-impacted-tests.sh [TARGET_DIR] [--base REV] [--head REV] [--worktree] [--json]
#
#   TARGET_DIR   directory holding task-contract.json (default prompts/outputs/current);
#                git runs in the repository that contains it
#   --base REV   diff base (default HEAD~1)
#   --head REV   diff head (default HEAD)
#   --worktree   also include uncommitted (staged/unstaged) and untracked changes
#   --json       print {changedPaths, impactedUnits:[{taskId,file,test}], commands,
#                unmappedPaths, changedTests, untestedUnits:[{taskId,file}]}
#
# A changed path maps to the test of every unit whose file list contains it, and
# to every unit whose test command names the path verbatim. Otherwise a path that
# looks like a test file (tests/ or test/ directory, *.test.*, *.spec.*,
# test_*.py, *_test.*) goes to changedTests ("run directly" note on stderr). A
# claimed path whose unit has an empty test goes to untestedUnits (stderr note).
#
# Plain output: unique test commands, one per line, in changed-path order.
# Paths nothing claims are listed on stderr. Documentation or planning output
# (under prompts/outputs/ or ending .md) needs no test: when every changed path
# is such a path, it prints `no tests impacted`. Unclaimed documentation paths
# are not reported as unmapped.
#
# Exit codes: 0 success, 2 usage error, missing contract or git failure.

set -uo pipefail

usage() {
  echo "usage: $(basename "$0") [TARGET_DIR] [--base REV] [--head REV] [--worktree] [--json]" >&2
}

TARGET_DIR="prompts/outputs/current"
BASE="HEAD~1"
HEAD_REV="HEAD"
WORKTREE=0
JSON=0
SEEN_DIR=0
while [ $# -gt 0 ]; do
  case "$1" in
    --base|--head)
      if [ $# -lt 2 ] || [[ "$2" == --* ]]; then
        echo "❌ $1 needs a revision" >&2; usage; exit 2
      fi
      if [ "$1" = "--base" ]; then BASE="$2"; else HEAD_REV="$2"; fi
      shift 2
      ;;
    --worktree) WORKTREE=1; shift ;;
    --json) JSON=1; shift ;;
    -h|--help) usage; exit 2 ;;
    -*) echo "❌ unknown option: $1" >&2; usage; exit 2 ;;
    *)
      if [ "$SEEN_DIR" -eq 1 ]; then usage; exit 2; fi
      TARGET_DIR="$1"; SEEN_DIR=1; shift
      ;;
  esac
done

CONTRACT="$TARGET_DIR/task-contract.json"
if [ ! -f "$CONTRACT" ]; then
  echo "❌ task contract not found: $CONTRACT" >&2
  echo "   Run: bash .ai-prompts/scripts/build-task-contract.sh $TARGET_DIR" >&2
  exit 2
fi

REPO_ROOT="$(git -C "$TARGET_DIR" rev-parse --show-toplevel 2>/dev/null)" || {
  echo "❌ not inside a git repository: $TARGET_DIR" >&2
  exit 2
}

python3 - "$CONTRACT" "$REPO_ROOT" "$BASE" "$HEAD_REV" "$WORKTREE" "$JSON" <<'PY'
import json
import re
import subprocess
import sys

contract_path, repo, base, head, worktree, as_json = sys.argv[1:7]
worktree = worktree == "1"
as_json = as_json == "1"


def git(*args):
    proc = subprocess.run(
        ["git", "-c", "core.quotepath=off", "-C", repo, *args],
        capture_output=True,
        text=True,
    )
    if proc.returncode != 0:
        print(f"❌ git {' '.join(args)} failed: {proc.stderr.strip()}", file=sys.stderr)
        sys.exit(2)
    return [p for p in proc.stdout.split("\0") if p]


changed = set(git("diff", "--name-only", "-z", f"{base}..{head}"))
if worktree:
    changed.update(git("diff", "--name-only", "-z", "HEAD"))
    changed.update(git("ls-files", "--others", "--exclude-standard", "-z"))
changed = sorted(changed)

try:
    contract = json.load(open(contract_path, encoding="utf-8"))
except ValueError as exc:
    print(f"❌ task contract is not valid JSON: {exc}", file=sys.stderr)
    sys.exit(2)

by_path = {}
for unit in contract.get("units", []):
    paths = unit.get("filePaths") or []
    for p in paths:
        by_path.setdefault(p, []).append(unit)


def is_doc(path):
    return path.startswith("prompts/outputs/") or path.endswith(".md")


TEST_NAME = re.compile(r"(^|/)(test_[^/]*\.py|[^/]*_test\.[^/]+|[^/]*\.(test|spec)\.[^/]+)$")


def is_test_file(path):
    parts = path.split("/")
    return "tests" in parts[:-1] or "test" in parts[:-1] or bool(TEST_NAME.search(path))


def unit_id(unit):
    return unit.get("canonicalId") or f"{unit.get('file')}#{unit.get('id')}"


def commands_naming(path):
    """Test commands that mention the path verbatim (token-bounded)."""
    pattern = re.compile(r"(?<![\w./-])" + re.escape(path) + r"(?![\w./-])")
    return [u for u in contract.get("units", []) if pattern.search(str(u.get("test", "")))]


impacted = []
commands = []
unmapped = []
changed_tests = []
untested = []
seen_units = set()
seen_untested = set()


def add_impacted(unit, path):
    test = str(unit.get("test", "")).strip()
    task_id = unit_id(unit)
    if task_id not in seen_units:
        seen_units.add(task_id)
        impacted.append({"taskId": task_id, "file": path, "test": test})
    if test not in commands:
        commands.append(test)


for path in changed:
    found = False
    for unit in by_path.get(path, []):
        found = True
        if str(unit.get("test", "")).strip():
            add_impacted(unit, path)
        elif (unit_id(unit), path) not in seen_untested:
            seen_untested.add((unit_id(unit), path))
            untested.append({"taskId": unit_id(unit), "file": path})
    for unit in commands_naming(path):
        found = True
        add_impacted(unit, path)
    if found or is_doc(path):
        continue
    if is_test_file(path):
        changed_tests.append(path)
    else:
        unmapped.append(path)

docs_only = all(is_doc(p) for p in changed)
if docs_only:
    # Documentation and planning output declare no tests of their own.
    impacted, commands, unmapped, changed_tests, untested = [], [], [], [], []

if as_json:
    print(json.dumps({
        "changedPaths": changed,
        "impactedUnits": impacted,
        "commands": commands,
        "unmappedPaths": unmapped,
        "changedTests": changed_tests,
        "untestedUnits": untested,
    }, indent=2, ensure_ascii=False))
    sys.exit(0)

if docs_only:
    print("no tests impacted")
    sys.exit(0)

for command in commands:
    print(command)
for path in changed_tests:
    print(f"note: run directly: {path}", file=sys.stderr)
for item in untested:
    print(f"note: {item['taskId']} claims {item['file']} but declares no test", file=sys.stderr)
if unmapped:
    print("note: no declared test for these changed paths:", file=sys.stderr)
    for path in unmapped:
        print(f"  {path}", file=sys.stderr)
PY
