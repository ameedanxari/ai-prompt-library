#!/usr/bin/env bash
# diagnose-harness.sh — entry point for harness crash diagnosis.
#
# When a per-task test or build-gate fails, the executor invokes this
# script before deciding whether the task is genuinely `failed`. The
# script:
#
#   1. Identifies the stack (from the task file's declared `**File:**`
#      paths, or from `--stack` if passed explicitly).
#   2. Routes to the matching per-stack diagnose script.
#   3. The per-stack script reads on-disk crash artifacts, matches them
#      against `prompts/modules/harness-recovery/<stack>.yaml`, and
#      writes a structured `harness-diagnosis.json`.
#   4. Returns one of four exit codes that tells the executor what to
#      do next.
#
# Exit codes (deterministic contract — also documented in executor.md):
#   0  not_crashed          → the test/build truly failed in logic; the
#                             executor marks the task `failed` as today.
#   1  harness_crash        → the per-stack script applied a recipe and
#                             the harness is now healthy. The executor
#                             must re-run the same task EXACTLY ONCE.
#   2  code_crash_known     → a structured `code_fix` is in the JSON
#                             under `remediation.code_fix`. The executor
#                             passes that to the AI step, applies the
#                             patch with full task context, and re-runs
#                             the task EXACTLY ONCE.
#   3  code_crash_unknown   → no recipe + no known fix. The executor
#                             marks the task `blocked` with the JSON
#                             attached so a human can decide.
#
# One retry per signature per task is the hard cap. The second time
# the same `classification` value appears in `harness_recoveries` for
# the same task in `execution-log.md`, the script must return 3 even
# if the catalog says recipe → forces the executor to block instead
# of looping.
#
# Usage:
#   bash scripts/diagnose-harness.sh \
#       --task <path-to-tasks-*.md> \
#       --exit-code <captured exit code> \
#       --stderr <path-to-captured stderr file> \
#       [--stack ios|android|web|flutter|bash] \
#       [--output prompts/outputs/current/harness-diagnosis.json]

set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

TASK=""
EXIT_CODE=""
STDERR_FILE=""
STACK=""
OUTPUT="prompts/outputs/current/harness-diagnosis.json"

while [ $# -gt 0 ]; do
  case "$1" in
    --task)        TASK="$2"; shift 2 ;;
    --exit-code)   EXIT_CODE="$2"; shift 2 ;;
    --stderr)      STDERR_FILE="$2"; shift 2 ;;
    --stack)       STACK="$2"; shift 2 ;;
    --output)      OUTPUT="$2"; shift 2 ;;
    -h|--help)
      sed -n '2,/^set/p' "${BASH_SOURCE[0]}" | sed 's/^# \{0,1\}//'
      exit 2
      ;;
    *) printf "❌ unknown arg: %s\n" "$1" >&2; exit 2 ;;
  esac
done

if [ -z "$EXIT_CODE" ]; then
  printf "❌ --exit-code is required\n" >&2
  exit 2
fi

# ---------------------------------------------------------------------
# Stack detection — explicit > task file > project layout.
# ---------------------------------------------------------------------
detect_from_task() {
  # The task file declares a real file path under **File:**. Use that
  # path to infer the stack — this is more reliable than scanning the
  # whole repo because mobile projects often have both ios/ and android/.
  [ -f "$TASK" ] || return 1
  local file_line
  file_line=$(grep -m1 -E '^\s*-\s*\*\*File:\*\*' "$TASK" 2>/dev/null || true)
  [ -z "$file_line" ] && return 1
  case "$file_line" in
    *ios/*)             echo "ios"; return 0 ;;
    *android/*)         echo "android"; return 0 ;;
    *lib/*\.dart*|*.dart*) echo "flutter"; return 0 ;;
    *src/*.ts*|*src/*.tsx*|*src/*.js*|*src/*.jsx*) echo "web"; return 0 ;;
    *scripts/*.sh*|*\.sh*) echo "bash"; return 0 ;;
  esac
  return 1
}

detect_from_layout() {
  if   [ -d "$ROOT/ios" ] && [ -f "$ROOT/ios/Podfile" ] || ls "$ROOT/ios"/*.xcodeproj 2>/dev/null | grep -q .; then
    echo "ios"
  elif [ -d "$ROOT/android" ] && [ -f "$ROOT/android/gradlew" ]; then
    echo "android"
  elif [ -f "$ROOT/pubspec.yaml" ] && grep -q "flutter:" "$ROOT/pubspec.yaml" 2>/dev/null; then
    echo "flutter"
  elif [ -f "$ROOT/package.json" ]; then
    echo "web"
  elif [ -d "$ROOT/scripts" ] && ls "$ROOT/scripts"/*.sh 2>/dev/null | grep -q .; then
    echo "bash"
  else
    return 1
  fi
}

if [ -z "$STACK" ]; then
  STACK="$(detect_from_task || detect_from_layout || true)"
fi

if [ -z "$STACK" ]; then
  cat > "$OUTPUT" <<EOF
{
  "stack": "unknown",
  "task": "${TASK}",
  "test_exit_code": ${EXIT_CODE},
  "classification": "stack_undetectable",
  "harness_status": "code_crash_unknown",
  "evidence": { "report_paths": [], "key_lines": [], "signal": null, "top_frame": null, "error_class": null },
  "remediation": { "type": "none", "recipe": [], "code_fix": null },
  "confidence": "low",
  "retry_count_in_task": 0
}
EOF
  printf "⚠️  could not detect stack from --task or repo layout\n" >&2
  exit 3
fi

# ---------------------------------------------------------------------
# Route to per-stack diagnose script.
# ---------------------------------------------------------------------
PER_STACK="$SCRIPT_DIR/diagnose-harness-${STACK}.sh"
if [ ! -x "$PER_STACK" ] && [ -f "$PER_STACK" ]; then
  chmod +x "$PER_STACK" 2>/dev/null || true
fi
if [ ! -f "$PER_STACK" ]; then
  printf "❌ no diagnose script for stack '%s' (expected %s)\n" "$STACK" "$PER_STACK" >&2
  exit 2
fi

# Pre-existing retry-budget check. If `harness_recoveries` in
# execution-log.md already has an entry for this task with any
# `result: recovered` for any classification, we have already retried
# once in this task. A second crash in the same task -> exit 3
# regardless of catalog match (prevents loops).
LOG="prompts/outputs/current/execution-log.md"
RETRY_COUNT=0
if [ -f "$LOG" ] && [ -n "$TASK" ]; then
  TASK_BASENAME="$(basename "$TASK")"
  RETRY_COUNT=$(awk -v t="$TASK_BASENAME" '
    /^harness_recoveries:/ { in_block=1; next }
    in_block && /^[^[:space:]-]/ { in_block=0 }
    in_block && $0 ~ "task: " t { count++ }
    END { print count + 0 }
  ' "$LOG")
fi

export ROOT TASK EXIT_CODE STDERR_FILE OUTPUT RETRY_COUNT
bash "$PER_STACK"
PER_STACK_EXIT=$?

# Force exit 3 if this is the second crash for the same task, regardless
# of what the per-stack script returned. Loop protection is global.
if [ "$RETRY_COUNT" -ge 1 ] && [ "$PER_STACK_EXIT" -ne 0 ] && [ "$PER_STACK_EXIT" -ne 3 ]; then
  # Patch the JSON in place to reflect the forced block.
  if [ -f "$OUTPUT" ]; then
    tmp="$(mktemp)"
    sed 's/"harness_status": "[^"]*"/"harness_status": "blocked_retry_cap"/' "$OUTPUT" > "$tmp"
    mv "$tmp" "$OUTPUT"
  fi
  printf "⚠️  retry cap hit for task %s — blocking instead of looping\n" "$TASK_BASENAME" >&2
  exit 3
fi

exit "$PER_STACK_EXIT"
