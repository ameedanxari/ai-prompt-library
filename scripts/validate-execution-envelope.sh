#!/usr/bin/env bash
# validate-execution-envelope.sh — honest-handoff gate.
#
# Field tests repeatedly produced an execution-log.md that reported
# `next_task: null` (project complete) with 167/167 "done" tasks, while
# the on-disk code had ~90% of the planned T1/T2 implementation files
# missing. The executor had silently skipped the harder tasks and set
# the envelope to "done" without logging them as blocked or deferred.
#
# This script is the final gate the executor runs before declaring a
# run complete. It refuses to let `next_task: null` stand when plan
# tasks have no corresponding file on disk AND no explicit entry in
# `blocked_tasks` / `failed_tasks` / `deferred_tasks`. Those are the
# "silent skips".
#
# Usage:
#   bash scripts/validate-execution-envelope.sh [PLAN_DIR] [PROJECT_ROOT]
#
# PLAN_DIR defaults to prompts/outputs/current (where tasks-*.md and
# execution-log.md live). PROJECT_ROOT defaults to the parent of
# PLAN_DIR's prompts/ ancestor (i.e. where android/ ios/ src/ live).
#
# Exit codes:
#   0  envelope is honest — every plan task is either done-on-disk or
#      explicitly listed in blocked/failed/deferred
#   1  silent skips detected — listed in the output and written to
#      envelope-report.md
#   2  preconditions missing (no plan, no execution-log, etc.)

set -uo pipefail

PLAN_DIR="${1:-prompts/outputs/current}"

# Resolve project root. If the user passed it, use it. Otherwise assume
# PLAN_DIR is .../prompts/outputs/current inside the project — walk up
# until we leave "prompts/".
if [ "${2:-}" != "" ]; then
  PROJECT_ROOT="$2"
else
  abs_plan="$(cd "$PLAN_DIR" && pwd)" 2>/dev/null || abs_plan=""
  if [ -z "$abs_plan" ]; then
    echo "❌ $PLAN_DIR does not exist" >&2
    exit 2
  fi
  # Walk up past "current", "outputs", "prompts".
  PROJECT_ROOT="$abs_plan"
  for _ in 1 2 3; do
    PROJECT_ROOT="$(dirname "$PROJECT_ROOT")"
  done
fi

if [ ! -d "$PLAN_DIR" ]; then
  echo "❌ plan dir not found: $PLAN_DIR" >&2
  exit 2
fi
if [ ! -d "$PROJECT_ROOT" ]; then
  echo "❌ project root not found: $PROJECT_ROOT" >&2
  exit 2
fi

LOG="$PLAN_DIR/execution-log.md"
if [ ! -f "$LOG" ]; then
  echo "❌ no execution-log.md in $PLAN_DIR — nothing to validate" >&2
  exit 2
fi

shopt -s nullglob
tasks_files=("$PLAN_DIR"/tasks-*.md "$PLAN_DIR"/remediation-*.md)
if [ ${#tasks_files[@]} -eq 0 ]; then
  echo "❌ no tasks-*.md / remediation-*.md in $PLAN_DIR" >&2
  exit 2
fi

# Extract the YAML frontmatter from execution-log.md.
envelope=$(awk 'BEGIN{f=0} /^---$/{f++; next} f==1{print}' "$LOG")

# Parse the fields we care about. Tolerate flat YAML — each key is on
# one line, values may be scalars or [a, b, c] inline lists.
get_field() {
  printf "%s\n" "$envelope" | awk -v k="$1" '
    $0 ~ "^"k":" {
      sub("^"k":[[:space:]]*", "")
      print
      exit
    }
  '
}

next_task=$(get_field next_task)
blocked_raw=$(get_field blocked_tasks)
failed_raw=$(get_field failed_tasks)
deferred_raw=$(get_field deferred_tasks)

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
if [ "$next_task" = "null" ] || [ "$next_task" = "~" ] || [ -z "$next_task" ]; then
  if [ ! -f "$PLAN_DIR/task-graph.json" ]; then
    echo "❌ next_task is null but task-graph.json is missing" >&2
    echo "   Run: bash $SCRIPT_DIR/build-task-graph.sh $PLAN_DIR" >&2
    exit 1
  fi
  "$SCRIPT_DIR/validate-execution-order.sh" "$PLAN_DIR" "$PLAN_DIR/task-graph.json" || exit 1
fi

next_task_semantics="next_task names the next locally runnable task selected by the executor."
if [ "$next_task" = "null" ] || [ "$next_task" = "~" ] || [ -z "$next_task" ]; then
  next_task_semantics="next_task: null means no locally runnable task remains; it does not imply verified production behavior or release readiness."
fi

# Parse a YAML inline list ([a, b, c]) or scalar into a newline-separated
# list. Strips whitespace and surrounding brackets.
parse_list() {
  printf "%s" "$1" \
    | sed -E 's/^\[//;s/\]$//' \
    | tr ',' '\n' \
    | sed -E 's/^[[:space:]]+//;s/[[:space:]]+$//' \
    | grep -v '^$' || true
}

blocked_list=$(parse_list "$blocked_raw")
failed_list=$(parse_list "$failed_raw")
deferred_list=$(parse_list "$deferred_raw")

all_excused=$(printf "%s\n%s\n%s\n" "$blocked_list" "$failed_list" "$deferred_list" | sort -u)

# Derive the task id convention. Greenfield plans use E<n>.T<m>,
# audit-and-remediate uses G<n>.R<m>. We derive per-file task ids from
# each file: the slug goes into a plan-side mapping, and the task
# headings (## T<n> or ## R<n>) provide the second half.
#
# Rather than depending on the engine emitting E/G numbering consistently,
# we build a list of "expected artifacts" from every tasks file: each
# (filename, task-id, file-path) row, where task-id is the T<n>/R<n>
# heading and file-path is that task's **File:** value. If the file-path
# exists on disk under PROJECT_ROOT, the task is satisfied.
#
# A task whose file-path is absent AND that is not listed in
# blocked/failed/deferred (matched by <slug>.<tid>, <slug>:<tid>,
# tasks-<slug>.md:<tid>, or bare <tid>) is a SILENT SKIP.

silent_skips=$(mktemp)
satisfied_count=0
silent_count=0
excused_count=0
total_tasks=0

# Normalise an excuse-id to a comparable form. Accepts any of:
#   "tasks-foo.md:T3"     (filename:tid)
#   "remediation-foo.md:R2"
#   "foo:T3"              (slug:tid — the canonical form)
#   "foo.T3"              (dot-separator — tolerated)
#   "T3"                  (bare tid — wildcarded slug)
# and returns "<slug>:<tid>" or "?:<tid>" for the wildcard case.
normalise_excuse() {
  local raw="$1"
  # Collapse ".md:" into ":" so tasks-foo.md:T3 → tasks-foo:T3.
  raw="${raw/.md:/:}"
  # Drop trailing ".md" if present (e.g. bare filename reference).
  raw="${raw%.md}"
  # Strip engine prefixes.
  raw="${raw#tasks-}"
  raw="${raw#remediation-}"
  # Normalise dot-separator to colon.
  case "$raw" in
    *:*) ;;
    *.*) raw="${raw/\./:}" ;;
  esac
  case "$raw" in
    *:*) printf "%s" "$raw" ;;
    *)   printf "?:%s" "$raw" ;;
  esac
}

# Build a grepable excuse set.
excuse_file=$(mktemp)
if [ -n "$all_excused" ]; then
  while IFS= read -r e; do
    [ -z "$e" ] && continue
    normalise_excuse "$e" >> "$excuse_file"
    echo >> "$excuse_file"
  done <<< "$all_excused"
fi

for pf in "${tasks_files[@]}"; do
  base=$(basename "$pf" .md)
  slug="${base#tasks-}"
  slug="${slug#remediation-}"

  # Extract (tid, path) rows per task block. Most modern task files have
  # one metadata block immediately under the H1 and no `## T<n>` section;
  # treat those as a top-level TASK row. Also split pipe-separated
  # cross-platform File fields before rejecting whitespace.
  awk -v slug="$slug" '
    BEGIN { tid = "TASK" }
    /^## [TR][0-9]+/ {
      match($0, /[TR][0-9]+/)
      tid = substr($0, RSTART, RLENGTH)
      path = ""
      next
    }
    /\*\*File:\*\*/ {
      line = $0
      sub(/.*\*\*File:\*\*[[:space:]]*/, "", line)
      gsub(/`/, "", line)
      sub(/[[:space:]]+$/, "", line)
      lower = tolower(line)
      if (line == "" || lower == "n/a" || lower == "none" || lower == "tbd" || line == "—") next
      n = split(line, parts, /[[:space:]]*\|[[:space:]]*/)
      for (i = 1; i <= n; i++) {
        p = parts[i]
        gsub(/^[[:space:]]+|[[:space:]]+$/, "", p)
        if (p == "" || p ~ /[[:space:]]/) continue
        if (tid != "") {
          printf("%s|%s|%s\n", slug, tid, p)
        }
      }
      if (tid != "TASK") tid = ""
    }
  ' "$pf" >> "$silent_skips.rows"
done

if [ ! -s "$silent_skips.rows" ]; then
  echo "❌ no task (tid, File:) rows could be extracted from $PLAN_DIR" >&2
  rm -f "$silent_skips" "$silent_skips.rows" "$excuse_file"
  exit 2
fi

while IFS='|' read -r slug tid path; do
  [ -z "$slug" ] && continue
  total_tasks=$((total_tasks + 1))
  candidate="$PROJECT_ROOT/$path"
  if [ -e "$candidate" ]; then
    satisfied_count=$((satisfied_count + 1))
    continue
  fi
  # Not on disk. Is it excused?
  excused=0
  if [ -s "$excuse_file" ]; then
    if grep -qxE "(\\?|$slug):$tid" "$excuse_file"; then
      excused=1
    fi
  fi
  if [ $excused -eq 1 ]; then
    excused_count=$((excused_count + 1))
  else
    printf "%s|%s|%s\n" "$slug" "$tid" "$path" >> "$silent_skips"
    silent_count=$((silent_count + 1))
  fi
done < "$silent_skips.rows"

# Decide the gate.
REPORT="$PLAN_DIR/envelope-report.md"
NOW=$(date -u +%Y-%m-%dT%H:%M:%SZ)
artifact_accounting_status="fail"
artifact_accounting_reason="$silent_count silent skip(s) detected"
if [ "$silent_count" -eq 0 ]; then
  artifact_accounting_status="pass"
  artifact_accounting_reason="every declared File path exists or is explicitly blocked, failed, or deferred"
fi

partial_blocked_status="pass"
partial_blocked_reason="no blocked, failed, or deferred tasks declared in the envelope"
if [ -n "$all_excused" ]; then
  partial_blocked_status="fail"
  partial_blocked_reason="blocked, failed, or deferred tasks remain in the envelope"
fi

{
  echo "---"
  echo "generated_at: $NOW"
  echo "generated_by: scripts/validate-execution-envelope.sh"
  echo "next_task: ${next_task:-null}"
  echo "next_task_semantics: \"$next_task_semantics\""
  echo "total_plan_tasks: $total_tasks"
  echo "satisfied_on_disk: $satisfied_count"
  echo "excused_blocked_failed_deferred: $excused_count"
  echo "silent_skips: $silent_count"
  echo "completion_dimensions:"
  echo "  planning: pass"
  echo "  artifact_accounting: $artifact_accounting_status"
  echo "  fixture_verification: not_applicable"
  echo "  production_verification: fail"
  echo "  partial_blocked_state: $partial_blocked_status"
  echo "  release_readiness: fail"
  echo "completion_reasons:"
  echo "  artifact_accounting: \"$artifact_accounting_reason\""
  echo "  production_verification: \"not evaluated by the envelope gate; requires product-flow evidence\""
  echo "  partial_blocked_state: \"$partial_blocked_reason\""
  echo "  release_readiness: \"not evaluated by the envelope gate; requires release-gate evidence\""
  echo "release_ready: false"
  if [ "$silent_count" -eq 0 ]; then
    echo "envelope_state: honest"
  else
    echo "envelope_state: silent_skips_detected"
  fi
  echo "---"
  echo ""
  echo "# Envelope Report"
  echo ""
  echo "_Generated by \`scripts/validate-execution-envelope.sh\` on $NOW._"
  echo ""
  echo "## Completion Dimensions"
  echo ""
  echo "| Dimension | Status | Reason |"
  echo "|---|---|---|"
  echo "| Planning | pass | Execution-log envelope and plan files were parseable. |"
  echo "| Artifact accounting | $artifact_accounting_status | $artifact_accounting_reason. |"
  echo "| Fixture verification | not_applicable | This gate does not evaluate fixture behavior. |"
  echo "| Production verification | fail | This gate does not evaluate production product flows. |"
  echo "| Partial / blocked state | $partial_blocked_status | $partial_blocked_reason. |"
  echo "| Release readiness | fail | This gate does not evaluate release gates. |"
  echo ""
  echo "**next_task semantics:** $next_task_semantics"
  echo ""
  echo "**release_ready:** false"
  echo ""
  if [ "$silent_count" -eq 0 ]; then
    echo "✅ every plan task is accounted for — either a file exists on"
    echo "disk at its \`**File:**\` path, or the task id is listed under"
    echo "\`blocked_tasks\` / \`failed_tasks\` / \`deferred_tasks\` in"
    echo "the envelope."
    echo ""
    echo "The executor may set \`next_task: null\` only to mean no"
    echo "locally runnable task remains. It must not report verified"
    echo "production behavior or release readiness from this gate alone."
  else
    echo "❌ silent skips detected."
    echo ""
    echo "These tasks declare a file path in their \`**File:**\` field,"
    echo "but no such file exists on disk under \`$PROJECT_ROOT\`, and"
    echo "the task id is NOT listed in \`blocked_tasks\` / "
    echo "\`failed_tasks\` / \`deferred_tasks\`. That means the executor"
    echo "skipped them without reporting why."
    echo ""
    echo "**The executor MUST NOT set \`next_task: null\` while any of"
    echo "these remain.** Pick each up in turn — either execute it now,"
    echo "or if there is a real reason it cannot proceed, log it as"
    echo "blocked/failed/deferred with a one-line reason."
    echo ""
    echo "## Silent skips ($silent_count)"
    echo ""
    echo '| Task id | Declared file | Source |'
    echo '|---|---|---|'
    sort -t'|' -k1,1 -k2,2 "$silent_skips" | while IFS='|' read -r slug tid path; do
      [ -z "$slug" ] && continue
      echo "| \`$slug:$tid\` | \`$path\` | \`tasks-$slug.md\` |"
    done
    echo ""
    echo "## How to fix"
    echo ""
    echo "1. For each row above, open \`tasks-<slug>.md\` and find the"
    echo "   task block. Either:"
    echo "   - Execute the task now (create the file, run its named"
    echo "     test, log it under its epic in \`execution-log.md\` with"
    echo "     \`Status: done\`), OR"
    echo "   - If it genuinely cannot proceed, add it to"
    echo "     \`blocked_tasks\` / \`failed_tasks\` / \`deferred_tasks\`"
    echo "     in the envelope with a one-line \`Notes:\` explaining"
    echo "     why, and log it with the matching Status."
    echo "2. Rebuild the envelope: re-run \`bash"
    echo "   scripts/validate-execution-envelope.sh\` to confirm this"
    echo "   report now shows \`envelope_state: honest\`."
    echo "3. Only then may \`next_task: null\` be set."
    echo ""
  fi
} > "$REPORT"

rm -f "$silent_skips" "$silent_skips.rows" "$excuse_file"

if [ "$silent_count" -eq 0 ]; then
  echo "✅ envelope gate: honest ($satisfied_count/$total_tasks on disk, $excused_count excused) — wrote $REPORT"
  exit 0
else
  echo "❌ envelope gate: $silent_count silent skip(s) — wrote $REPORT"
  echo ""
  echo "The executor cannot declare this run complete. Open $REPORT"
  echo "for the list of task ids that need to be executed or explicitly"
  echo "marked blocked/failed/deferred."
  exit 1
fi
