#!/usr/bin/env bash
# safety-check-commit.sh — validate a proposed per-task commit.
#
# The executor calls this after a task's build-gate passes but BEFORE
# `commit-task.sh`. The check prevents two failure modes that turn an
# automated commit cadence from a feature into a hazard:
#
#   1. Scope drift — the task's declared `**File:**` paths are X and Y
#      but the diff also touches Z. Z was likely incidental damage.
#   2. Reverted-logic — the diff deletes far more than it adds, or
#      removes files that aren't named in the task scope. Often a
#      symptom of an AI step that re-wrote a file from scratch and
#      lost prior logic.
#
# The check is non-blocking by default (exit 0 with warnings) so the
# executor can still commit on a warning, but the warnings get logged
# into the commit message + execution-log.md so a human can audit.
# Hard failures (exit 1) require user intervention before committing.
#
# Usage:
#   bash scripts/safety-check-commit.sh \
#       --task <path-to-tasks-*.md> \
#       [--ledger prompts/outputs/current/path-ledger.md] \
#       [--strict]                                  # exit 1 on warnings
#       [--report .ai-prompts/safety-report.json]   # write structured report
#
# Exit codes:
#   0  safe to commit (may have warnings — see report)
#   1  unsafe — diff drifts from scope OR appears to delete prior logic
#   2  preconditions broken (no task file, no git repo, etc.)

set -uo pipefail

TASK=""
LEDGER="prompts/outputs/current/path-ledger.md"
STRICT=0
REPORT=""

while [ $# -gt 0 ]; do
  case "$1" in
    --task)   TASK="$2"; shift 2 ;;
    --ledger) LEDGER="$2"; shift 2 ;;
    --strict) STRICT=1; shift ;;
    --report) REPORT="$2"; shift 2 ;;
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
# Gather declared paths from the task file.
# The task schema requires `- **File:** path/to/file.ext` lines (one or
# more per task; a dual-platform task may write `ios/X | android/Y`).
# Path-ledger is the project-wide canonical list of paths the plan owns.
# ---------------------------------------------------------------------
declared_paths=$(grep -E '^[[:space:]]*-[[:space:]]*\*\*File:\*\*' "$TASK" 2>/dev/null \
  | sed -E 's/^[[:space:]]*-[[:space:]]*\*\*File:\*\*[[:space:]]*//; s/`//g' \
  | tr '|' '\n' \
  | sed 's/^[[:space:]]*//; s/[[:space:]]*$//' \
  | grep -v '^$' || true)

ledger_paths=""
if [ -f "$LEDGER" ]; then
  ledger_paths=$(grep -E '^[[:space:]]*-[[:space:]]*' "$LEDGER" 2>/dev/null \
    | sed -E 's/^[[:space:]]*-[[:space:]]*//; s/`//g' \
    | awk '{print $1}' \
    | grep -v '^$' || true)
fi

# ---------------------------------------------------------------------
# Inspect git state.
# ---------------------------------------------------------------------
modified=$(git diff --name-only HEAD 2>/dev/null; git diff --name-only --cached 2>/dev/null; git ls-files --others --exclude-standard 2>/dev/null)
modified=$(printf '%s\n' "$modified" | sort -u | grep -v '^$' || true)
deleted=$(git diff --diff-filter=D --name-only HEAD 2>/dev/null | sort -u || true)

# Lines added vs deleted across the working tree (cached + unstaged).
added_lines=$(git diff HEAD --numstat 2>/dev/null | awk '{a+=$1} END{print a+0}')
deleted_lines=$(git diff HEAD --numstat 2>/dev/null | awk '{d+=$2} END{print d+0}')

# ---------------------------------------------------------------------
# Heuristics.
# ---------------------------------------------------------------------
out_of_scope=()
while IFS= read -r f; do
  [ -z "$f" ] && continue
  # In scope if matches a declared path OR is anywhere under the
  # ledger. The ledger is intentionally permissive — the plan declared
  # these as project-owned, so any change in them by the executor is
  # plausibly part of the active task's iteration.
  in_scope=0
  while IFS= read -r d; do
    [ -z "$d" ] && continue
    case "$f" in
      "$d"|"$d"*) in_scope=1; break ;;
    esac
  done <<< "$declared_paths"
  if [ "$in_scope" -eq 0 ] && [ -n "$ledger_paths" ]; then
    while IFS= read -r l; do
      [ -z "$l" ] && continue
      case "$f" in
        "$l"|"$l"*) in_scope=1; break ;;
      esac
    done <<< "$ledger_paths"
  fi
  # Always allow engine-output files (modified by automation) and the
  # task spec itself (which lives alongside the change and is part of
  # the natural commit unit).
  case "$f" in
    prompts/outputs/current/execution-log.md|\
    prompts/outputs/current/path-ledger.md|\
    prompts/outputs/current/harness-diagnosis.json|\
    prompts/outputs/current/resumption-checkpoint.md|\
    prompts/outputs/current/revise-report.md)
      in_scope=1 ;;
  esac
  # Allow any tasks-*.md / remediation-*.md (spec files) and the
  # specific task file passed in via --task.
  case "$f" in
    tasks-*.md|remediation-*.md|*/tasks-*.md|*/remediation-*.md)
      in_scope=1 ;;
  esac
  [ "$f" = "$TASK" ] && in_scope=1
  [ "$in_scope" -eq 0 ] && out_of_scope+=("$f")
done <<< "$modified"

# Net deletion threshold: deleted > added by 2x AND deleted > 80 lines.
# Small refactors often legitimately delete; only flag clear damage.
suspicious_deletion=0
deletion_reason=""
if [ "$deleted_lines" -gt 80 ] && [ "$added_lines" -lt $((deleted_lines / 2)) ]; then
  suspicious_deletion=1
  deletion_reason="deleted ${deleted_lines} lines vs added ${added_lines} lines"
fi

# Deleted files outside scope — never acceptable.
unauthorized_deletes=()
while IFS= read -r f; do
  [ -z "$f" ] && continue
  in_scope=0
  while IFS= read -r d; do
    [ -z "$d" ] && continue
    case "$f" in
      "$d"|"$d"*) in_scope=1; break ;;
    esac
  done <<< "$declared_paths"
  [ "$in_scope" -eq 0 ] && unauthorized_deletes+=("$f")
done <<< "$deleted"

# ---------------------------------------------------------------------
# Compose verdict.
# ---------------------------------------------------------------------
verdict="safe"
warnings=()
errors=()

if [ "${#out_of_scope[@]}" -gt 0 ]; then
  warnings+=("Scope drift: $(printf '%s, ' "${out_of_scope[@]}" | sed 's/, $//')")
fi
if [ "$suspicious_deletion" -eq 1 ]; then
  warnings+=("Suspicious deletion: $deletion_reason")
fi
if [ "${#unauthorized_deletes[@]}" -gt 0 ]; then
  errors+=("Unauthorized deletes: $(printf '%s, ' "${unauthorized_deletes[@]}" | sed 's/, $//')")
fi

if [ "${#errors[@]}" -gt 0 ]; then
  verdict="unsafe"
elif [ "${#warnings[@]}" -gt 0 ] && [ "$STRICT" -eq 1 ]; then
  verdict="unsafe"
elif [ "${#warnings[@]}" -gt 0 ]; then
  verdict="safe_with_warnings"
fi

# ---------------------------------------------------------------------
# Output.
# ---------------------------------------------------------------------
escape_for_json() { printf '%s' "$1" | sed 's/\\/\\\\/g; s/"/\\"/g' | tr -d '\n'; }
json_array_of() {
  local arr=("$@") out="[" first=1
  for item in "${arr[@]:-}"; do
    [ -z "$item" ] && continue
    [ $first -eq 1 ] || out="${out},"
    first=0
    out="${out}\"$(escape_for_json "$item")\""
  done
  printf '%s]' "$out"
}

if [ -n "$REPORT" ]; then
  mkdir -p "$(dirname "$REPORT")"
  cat > "$REPORT" <<EOF
{
  "task": "$(escape_for_json "$TASK")",
  "verdict": "${verdict}",
  "added_lines": ${added_lines},
  "deleted_lines": ${deleted_lines},
  "out_of_scope_files": $(json_array_of "${out_of_scope[@]:-}"),
  "unauthorized_deletes": $(json_array_of "${unauthorized_deletes[@]:-}"),
  "warnings": $(json_array_of "${warnings[@]:-}"),
  "errors": $(json_array_of "${errors[@]:-}")
}
EOF
fi

printf "safety-check verdict: %s\n" "$verdict"
[ ${#warnings[@]} -gt 0 ] && printf "  warnings:\n" && for w in "${warnings[@]}"; do printf "    - %s\n" "$w"; done
[ ${#errors[@]} -gt 0 ]   && printf "  errors:\n"   && for e in "${errors[@]}"; do printf "    - %s\n" "$e"; done

case "$verdict" in
  safe|safe_with_warnings) exit 0 ;;
  unsafe) exit 1 ;;
esac
