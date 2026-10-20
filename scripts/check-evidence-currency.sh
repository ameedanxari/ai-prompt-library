#!/usr/bin/env bash
# Check that file-bound build evidence in execution-log.md is still current.
#
# Records may bind their buildEvidence to files with coveredPaths (repo-relative)
# and pathsDigest ("sha256:<64 hex>") instead of to the whole-tree revision. The
# digest is sha256 over the UTF-8 text of the sorted coveredPaths, one line per
# path: "<path>\t<blob>\n", where <blob> is `git rev-parse <rev>:<path>` (--rev)
# or `git hash-object -- <path>` of the working-tree file (--worktree), or the
# literal "missing" when the path does not exist at that revision / in the tree.
# A working-tree blob equals the blob the file has once committed, so a digest
# computed with --worktree BEFORE committing stays current after the commit that
# records it (commit the code and execution-log.md together).
#
# Usage:
#   bash .ai-prompts/scripts/check-evidence-currency.sh [TARGET_DIR] [--rev REV | --worktree] [--repo PATH]
#   bash .ai-prompts/scripts/check-evidence-currency.sh --digest [--rev REV | --worktree] [--repo PATH] PATH...
#
# Source of blobs: --rev REV reads committed blobs; --worktree reads the working
# tree (PATH relative to the repo root). The two flags are mutually exclusive.
# Defaults: report mode uses --rev HEAD; --digest uses --worktree when neither
# --rev nor --worktree is given (pass --digest --rev REV for committed blobs).
# --repo defaults to the git toplevel of the current directory; TARGET_DIR to
# prompts/outputs/current. In report mode the authoritative record per taskId
# (the last one in log order) is checked and TARGET_DIR/evidence-currency-report.json
# is written (its "rev" field is "worktree" under --worktree). In --digest mode
# only the digest string is printed.
# Exit 0: no bound record is stale (or --digest succeeded)
# Exit 1: at least one bound record's digest no longer matches
# Exit 2: usage error, missing inputs, or unreadable repository

set -uo pipefail

TARGET_DIR=""
REV=""
WORKTREE=0
REPO=""
DIGEST_MODE=0
POSITIONAL=()

while [ "$#" -gt 0 ]; do
  case "$1" in
    --rev)
      if [ "$#" -lt 2 ]; then echo "evidence currency: --rev needs a value" >&2; exit 2; fi
      REV="$2"; shift 2 ;;
    --worktree)
      WORKTREE=1; shift ;;
    --repo)
      if [ "$#" -lt 2 ]; then echo "evidence currency: --repo needs a value" >&2; exit 2; fi
      REPO="$2"; shift 2 ;;
    --digest)
      DIGEST_MODE=1; shift ;;
    -h|--help)
      sed -n '2,/^[^#]/{/^#/s/^# \{0,1\}//p;}' "$0"
      exit 0 ;;
    --)
      shift
      while [ "$#" -gt 0 ]; do POSITIONAL+=("$1"); shift; done ;;
    -*)
      echo "evidence currency: unknown option: $1" >&2; exit 2 ;;
    *)
      POSITIONAL+=("$1"); shift ;;
  esac
done

if [ "$WORKTREE" -eq 1 ] && [ -n "$REV" ]; then
  echo "evidence currency: --rev and --worktree are mutually exclusive" >&2
  exit 2
fi
if [ "$WORKTREE" -eq 0 ] && [ -z "$REV" ]; then
  if [ "$DIGEST_MODE" -eq 1 ]; then WORKTREE=1; else REV="HEAD"; fi
fi

if ! command -v python3 >/dev/null 2>&1; then
  echo "evidence currency: python3 is required" >&2
  exit 2
fi
if ! command -v git >/dev/null 2>&1; then
  echo "evidence currency: git is required" >&2
  exit 2
fi
if [ -z "$REPO" ]; then
  REPO="$(git rev-parse --show-toplevel 2>/dev/null)" || {
    echo "evidence currency: not inside a git repository (use --repo PATH)" >&2
    exit 2
  }
fi
if ! git -C "$REPO" rev-parse --git-dir >/dev/null 2>&1; then
  echo "evidence currency: not a git repository: $REPO" >&2
  exit 2
fi
if [ "$WORKTREE" -eq 0 ] && ! git -C "$REPO" rev-parse --verify --quiet "$REV^{commit}" >/dev/null 2>&1; then
  echo "evidence currency: revision not found: $REV" >&2
  exit 2
fi

if [ "$DIGEST_MODE" -eq 1 ]; then
  if [ "${#POSITIONAL[@]}" -eq 0 ]; then
    echo "evidence currency: --digest needs at least one PATH" >&2
    exit 2
  fi
  PYTHON_MODE="digest"
  TARGET_DIR=""
else
  if [ "${#POSITIONAL[@]}" -gt 1 ]; then
    echo "evidence currency: expected at most one TARGET_DIR, got ${#POSITIONAL[@]}" >&2
    exit 2
  fi
  TARGET_DIR="${POSITIONAL[0]:-prompts/outputs/current}"
  POSITIONAL=()
  PYTHON_MODE="report"
  LOG="$TARGET_DIR/execution-log.md"
  if [ ! -d "$TARGET_DIR" ]; then
    echo "evidence currency: target directory not found: $TARGET_DIR" >&2
    exit 2
  fi
  if [ ! -f "$LOG" ]; then
    echo "evidence currency: required input not found: $LOG" >&2
    exit 2
  fi
fi

REPORT="${TARGET_DIR:+$TARGET_DIR/evidence-currency-report.json}"
temporary_report=""
if [ "$PYTHON_MODE" = "report" ]; then
  temporary_report="$(mktemp "$REPORT.tmp.XXXXXX")" || exit 2
fi

currency_status=0
EXEC_LOG_LIB="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/lib" python3 - "$PYTHON_MODE" "$REPO" "$REV" "$WORKTREE" "$TARGET_DIR" "$temporary_report" "${POSITIONAL[@]+"${POSITIONAL[@]}"}" <<'PY' || currency_status=$?
import hashlib
import json
import os
import re
import subprocess
import sys

sys.dont_write_bytecode = True
sys.path.insert(0, os.environ["EXEC_LOG_LIB"])
from execution_log import load_logical_log  # noqa: E402

mode, repo, rev, worktree_flag, target_dir, report_path = sys.argv[1:7]
extra_paths = sys.argv[7:]
worktree = worktree_flag == "1"
rev_label = "worktree" if worktree else rev

def blob_for(path):
    if worktree:
        full = os.path.join(repo, path)
        if os.path.islink(full):
            # git stores a symlink as a blob of its target text.
            result = subprocess.run(
                ["git", "-C", repo, "hash-object", "--stdin"],
                input=os.readlink(full).encode("utf-8"), capture_output=True,
            )
            return result.stdout.decode().strip() or "missing"
        if not os.path.isfile(full):
            return "missing"
        result = subprocess.run(
            ["git", "-C", repo, "hash-object", "--", path], capture_output=True, text=True,
        )
        return result.stdout.strip() if result.returncode == 0 and result.stdout.strip() else "missing"
    result = subprocess.run(
        ["git", "-C", repo, "rev-parse", "--verify", "--quiet", f"{rev}:{path}"],
        capture_output=True, text=True,
    )
    value = result.stdout.strip()
    return value if result.returncode == 0 and value else "missing"

def digest_for(paths):
    text = "".join(f"{path}\t{blob_for(path)}\n" for path in sorted(paths))
    return "sha256:" + hashlib.sha256(text.encode("utf-8")).hexdigest()

if mode == "digest":
    print(digest_for(extra_paths))
    sys.exit(0)

log_path = os.path.join(target_dir, "execution-log.md")
try:
    with open(log_path, encoding="utf-8") as handle:
        log_text = handle.read()
except OSError as exc:
    print(f"evidence currency: cannot read {log_path}: {exc}", file=sys.stderr)
    sys.exit(2)
# Rotated entries live in the archives listed under journal_archives (older first).
logical_log = load_logical_log(target_dir, log_text)
if logical_log.missing:
    for name in logical_log.missing:
        print(f"evidence currency: journal archive listed in {log_path} cannot be read: {name}", file=sys.stderr)
    sys.exit(2)
log_text = logical_log.text

authoritative = {}
for raw in re.findall(r"```execution-status-record\s*\n(.*?)```", log_text, re.S):
    try:
        parsed = json.loads(raw)
    except ValueError as exc:
        print(f"evidence currency: cannot parse execution-status-record: {exc}", file=sys.stderr)
        sys.exit(2)
    for record in parsed if isinstance(parsed, list) else [parsed]:
        if isinstance(record, dict) and record.get("taskId"):
            authoritative[record["taskId"]] = record  # last in log order wins

checked = 0
current = 0
revision_bound = 0
stale = []
for task_id in sorted(authoritative):
    build = authoritative[task_id].get("buildEvidence")
    build = build if isinstance(build, dict) else {}
    covered = build.get("coveredPaths")
    recorded = build.get("pathsDigest")
    if not (isinstance(covered, list) and covered and isinstance(recorded, str)
            and all(isinstance(item, str) for item in covered)):
        revision_bound += 1
        continue
    checked += 1
    if digest_for(covered) == recorded:
        current += 1
    else:
        stale.append({"taskId": task_id, "candidatePaths": sorted(covered)})

report = {
    "generated_by": "scripts/check-evidence-currency.sh",
    "rev": rev_label,
    "checked": checked,
    "current": current,
    "stale": stale,
    "revisionBound": revision_bound,
}
with open(report_path, "w", encoding="utf-8") as handle:
    json.dump(report, handle, indent=2, sort_keys=True)
    handle.write("\n")

if stale:
    print(f"evidence currency: {len(stale)} of {checked} file-bound record(s) stale at {rev_label}")
    for entry in stale:
        print(f"  - {entry['taskId']}: candidate paths {', '.join(entry['candidatePaths'])}")
    sys.exit(1)
print(f"evidence currency: {current}/{checked} file-bound record(s) current at {rev_label}, {revision_bound} revision-bound")
PY

if [ "$PYTHON_MODE" = "digest" ]; then
  exit "$currency_status"
fi

if [ -s "$temporary_report" ]; then
  mv -f "$temporary_report" "$REPORT"
else
  rm -f "$temporary_report"
fi

if [ "$currency_status" -eq 0 ]; then
  echo "✅ evidence currency gate: pass — wrote $REPORT"
elif [ "$currency_status" -eq 1 ]; then
  echo "❌ evidence currency gate: stale evidence — wrote $REPORT" >&2
else
  echo "❌ evidence currency gate: prerequisite error" >&2
fi
exit "$currency_status"
