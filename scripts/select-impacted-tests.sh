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
#   --json       print {changedPaths, impactedUnits:[{taskId,file,test}], commands, unmappedPaths}
#
# Plain output: unique test commands, one per line, in changed-path order.
# Paths no unit claims are listed on stderr. Documentation or planning output
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


impacted = []
commands = []
unmapped = []
seen_units = set()
for path in changed:
    units = by_path.get(path, [])
    if not units:
        if not is_doc(path):
            unmapped.append(path)
        continue
    for unit in units:
        test = str(unit.get("test", "")).strip()
        task_id = unit.get("canonicalId") or f"{unit.get('file')}#{unit.get('id')}"
        if task_id not in seen_units:
            seen_units.add(task_id)
            impacted.append({"taskId": task_id, "file": path, "test": test})
        if test and test not in commands:
            commands.append(test)

docs_only = all(is_doc(p) for p in changed)
if docs_only:
    # Documentation and planning output declare no tests of their own.
    impacted, commands, unmapped = [], [], []

if as_json:
    print(json.dumps({
        "changedPaths": changed,
        "impactedUnits": impacted,
        "commands": commands,
        "unmappedPaths": unmapped,
    }, indent=2, ensure_ascii=False))
    sys.exit(0)

if docs_only:
    print("no tests impacted")
    sys.exit(0)

for command in commands:
    print(command)
if unmapped:
    print("note: no declared test for these changed paths:", file=sys.stderr)
    for path in unmapped:
        print(f"  {path}", file=sys.stderr)
PY
