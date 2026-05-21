#!/usr/bin/env bash
# commit-task.sh — auto-commit at every successful task checkpoint.
#
# The executor calls this after:
#   1. The task ran successfully (build-gate green, acceptance met).
#   2. safety-check-commit.sh returned 0 (safe or safe_with_warnings).
#
# Goal: every logical checkpoint becomes a commit, so the user is not
# left with a giant blob to commit + push manually after a long
# execution run.
#
# Behavior:
#   - Stages only the declared `**File:**` paths from the task plus
#     the engine output files (execution-log.md, resumption-checkpoint.md,
#     path-ledger.md, harness-diagnosis.json if present). NEVER `git add .`
#     — that risks pulling in secrets or unrelated diffs.
#   - Uses a conventional-commit message inferred from the task category
#     and the "Change made" one-liner the executor wrote into
#     execution-log.md.
#   - Includes a Safety-Check trailer that records the
#     safety-check-commit.sh verdict so the audit trail is in the commit
#     itself, not only in a side file.
#   - Does NOT push by default. Push is configurable per
#     MY_PROJECT.md (`auto_push: true|false`), but the executor wires
#     pushes at gap/epic boundaries, not per task.
#
# Usage:
#   bash scripts/commit-task.sh \
#       --task <path-to-tasks-*.md> \
#       --change-line "<one-liner from execution-log>" \
#       [--safety-report .ai-prompts/safety-report.json] \
#       [--type feat|fix|test|chore|docs|refactor]      # override inferred
#       [--no-verify-hooks]   # only if user explicitly asked
#
# Exit codes:
#   0  commit created
#   1  nothing to commit (no staged changes after path filter)
#   2  precondition failure (no task, not a git repo, etc.)

set -uo pipefail

TASK=""
CHANGE_LINE=""
SAFETY_REPORT=""
TYPE_OVERRIDE=""
NO_VERIFY=0

while [ $# -gt 0 ]; do
  case "$1" in
    --task)              TASK="$2"; shift 2 ;;
    --change-line)       CHANGE_LINE="$2"; shift 2 ;;
    --safety-report)     SAFETY_REPORT="$2"; shift 2 ;;
    --type)              TYPE_OVERRIDE="$2"; shift 2 ;;
    --no-verify-hooks)   NO_VERIFY=1; shift ;;
    -h|--help)
      sed -n '2,/^set/p' "${BASH_SOURCE[0]}" | sed 's/^# \{0,1\}//'
      exit 2
      ;;
    *) printf "❌ unknown arg: %s\n" "$1" >&2; exit 2 ;;
  esac
done

if [ -z "$TASK" ] || [ ! -f "$TASK" ]; then
  printf "❌ --task <path-to-tasks-*.md> is required\n" >&2
  exit 2
fi
if ! git rev-parse --git-dir >/dev/null 2>&1; then
  printf "❌ not in a git repository\n" >&2
  exit 2
fi

# ---------------------------------------------------------------------
# Compute commit type from task slug heuristics.
# Override with --type if the executor knows better.
# ---------------------------------------------------------------------
slug=$(basename "$TASK" .md)
if [ -n "$TYPE_OVERRIDE" ]; then
  type="$TYPE_OVERRIDE"
else
  case "$slug" in
    tasks-*test*|tasks-*qa*|tasks-*regression*) type="test" ;;
    tasks-*docs*|tasks-*documentation*)         type="docs" ;;
    remediation-*)                              type="fix"  ;;
    tasks-*)                                    type="feat" ;;
    *)                                          type="chore" ;;
  esac
fi

# Scope = epic/feature hint extracted from the slug (kebab).
scope=$(printf '%s' "$slug" | sed -E 's/^(tasks|remediation)-//; s/-[a-z]+$//')
scope=$(printf '%s' "$scope" | cut -c1-40)

# Subject = the change line, or fallback to a generic verb + scope.
subject="${CHANGE_LINE:-implement ${scope}}"
subject=$(printf '%s' "$subject" | tr -d '\n' | cut -c1-72)

# ---------------------------------------------------------------------
# Stage only the task's declared file paths + library output artifacts.
# ---------------------------------------------------------------------
declared_paths=$(grep -E '^[[:space:]]*-[[:space:]]*\*\*File:\*\*' "$TASK" 2>/dev/null \
  | sed -E 's/^[[:space:]]*-[[:space:]]*\*\*File:\*\*[[:space:]]*//; s/`//g' \
  | tr '|' '\n' \
  | sed 's/^[[:space:]]*//; s/[[:space:]]*$//' \
  | grep -v '^$' || true)

staged_anything=0
while IFS= read -r p; do
  [ -z "$p" ] && continue
  if git ls-files --error-unmatch -- "$p" >/dev/null 2>&1 || [ -e "$p" ]; then
    git add -- "$p" 2>/dev/null && staged_anything=1
  fi
done <<< "$declared_paths"

# Library state files (always include if modified).
for ARTIFACT in \
  prompts/outputs/current/execution-log.md \
  prompts/outputs/current/resumption-checkpoint.md \
  prompts/outputs/current/path-ledger.md \
  prompts/outputs/current/harness-diagnosis.json \
  prompts/outputs/current/revise-report.md
do
  if [ -e "$ARTIFACT" ]; then
    if git diff --quiet -- "$ARTIFACT" 2>/dev/null && git diff --cached --quiet -- "$ARTIFACT" 2>/dev/null && git ls-files --error-unmatch -- "$ARTIFACT" >/dev/null 2>&1; then
      continue
    fi
    git add -- "$ARTIFACT" 2>/dev/null && staged_anything=1
  fi
done

if [ "$staged_anything" -eq 0 ] || git diff --cached --quiet; then
  printf "ℹ️  no staged changes after path filter — skipping commit\n" >&2
  exit 1
fi

# ---------------------------------------------------------------------
# Compose commit message + trailers.
# ---------------------------------------------------------------------
safety_trailer=""
if [ -n "$SAFETY_REPORT" ] && [ -f "$SAFETY_REPORT" ]; then
  verdict=$(grep -m1 '"verdict"' "$SAFETY_REPORT" | sed 's/.*"verdict": "\([^"]*\)".*/\1/')
  warn_count=$(grep -c '"warnings"' "$SAFETY_REPORT" || true)
  safety_trailer="Safety-Check: ${verdict}"
  if grep -q '"warnings": \[".' "$SAFETY_REPORT" 2>/dev/null; then
    wmsg=$(grep '"warnings"' "$SAFETY_REPORT" | head -1 | sed 's/.*"warnings": \[\([^]]*\)\].*/\1/' | head -c 120)
    safety_trailer="${safety_trailer} (${wmsg})"
  fi
fi

task_trailer="Task: $(basename "$TASK")"

msg_file="$(mktemp)"
trap 'rm -f "$msg_file"' EXIT
{
  printf '%s(%s): %s\n' "$type" "$scope" "$subject"
  printf '\n'
  printf '%s\n' "$task_trailer"
  [ -n "$safety_trailer" ] && printf '%s\n' "$safety_trailer"
} > "$msg_file"

# ---------------------------------------------------------------------
# Commit. Hooks run by default; --no-verify-hooks only if user opted in.
# ---------------------------------------------------------------------
commit_args=()
[ "$NO_VERIFY" -eq 1 ] && commit_args+=(--no-verify)

if git commit "${commit_args[@]}" -F "$msg_file"; then
  printf "✅ committed task %s\n" "$(basename "$TASK")"
  exit 0
else
  printf "❌ git commit failed — leaving changes staged for user review\n" >&2
  exit 2
fi
