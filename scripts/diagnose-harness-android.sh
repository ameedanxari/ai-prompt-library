#!/usr/bin/env bash
# diagnose-harness-android.sh — Android-specific harness diagnosis.

set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_SCRIPT="$(cd "$SCRIPT_DIR/.." && pwd)"
CATALOG="$ROOT_SCRIPT/prompts/modules/harness-recovery/android.yaml"
# shellcheck disable=SC1091
source "$SCRIPT_DIR/lib/harness-common.sh"

TASK="${TASK:-}"
EXIT_CODE="${EXIT_CODE:-1}"
STDERR_FILE="${STDERR_FILE:-}"
OUTPUT="${OUTPUT:-prompts/outputs/current/harness-diagnosis.json}"
RETRY_COUNT="${RETRY_COUNT:-0}"

STDERR_TEXT=""
[ -n "$STDERR_FILE" ] && [ -f "$STDERR_FILE" ] && STDERR_TEXT="$(cat "$STDERR_FILE")"

# ---------------------------------------------------------------------
# Android-specific evidence: latest JUnit XML, logcat crash buffer,
# Gradle daemon log.
# ---------------------------------------------------------------------
TEST_RESULTS_DIR=""
for d in "$PWD/android/app/build/test-results" "$PWD/app/build/test-results"; do
  [ -d "$d" ] && TEST_RESULTS_DIR="$d" && break
done

GRADLE_DAEMON_LOG=""
for d in "$HOME/.gradle/daemon"/*; do
  [ -d "$d" ] || continue
  cand="$(find "$d" -name 'daemon-*.out.log' -mmin -60 2>/dev/null | head -1)"
  [ -n "$cand" ] && GRADLE_DAEMON_LOG="$cand" && break
done

evidence_tmp="$(mktemp)"
trap 'rm -f "$evidence_tmp"' EXIT
{
  if [ -n "$TEST_RESULTS_DIR" ]; then
    find "$TEST_RESULTS_DIR" -name '*.xml' -mmin -60 2>/dev/null | head -5 | while read -r f; do cat "$f" 2>/dev/null; done
  fi
  if command -v adb >/dev/null 2>&1; then
    adb logcat -d -b crash 2>/dev/null | tail -200 || true
  fi
  [ -n "$GRADLE_DAEMON_LOG" ] && tail -200 "$GRADLE_DAEMON_LOG" 2>/dev/null
} > "$evidence_tmp" 2>/dev/null

read_catalog_match "$CATALOG" "$STDERR_TEXT" "$evidence_tmp"

report_paths='['
first=1
for p in "$TEST_RESULTS_DIR" "$GRADLE_DAEMON_LOG"; do
  [ -z "$p" ] && continue
  [ -e "$p" ] || continue
  [ $first -eq 1 ] || report_paths="${report_paths},"
  first=0
  report_paths="${report_paths}\"${p}\""
done
report_paths="${report_paths}]"

key_lines='[]'
if [ -n "$STDERR_TEXT" ]; then
  key_lines="$(printf '%s\n' "$STDERR_TEXT" | grep -E 'FATAL|Exception|FAILURE|error:|Permission Denial|OutOfMemoryError' | head -5 | json_array_from_lines)"
fi

write_diagnosis_json "android" "$TASK" "$EXIT_CODE" "$report_paths" "$key_lines" "$OUTPUT"

recipe_ok=0
if [ "$CLASSIFICATION" = "harness_crash" ]; then
  apply_recipe || recipe_ok=1
fi

decide_exit_code "$recipe_ok"
exit $?
