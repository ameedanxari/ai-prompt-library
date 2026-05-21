#!/usr/bin/env bash
# diagnose-harness-flutter.sh — Flutter-specific harness diagnosis.

set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_SCRIPT="$(cd "$SCRIPT_DIR/.." && pwd)"
CATALOG="$ROOT_SCRIPT/prompts/modules/harness-recovery/flutter.yaml"
# shellcheck disable=SC1091
source "$SCRIPT_DIR/lib/harness-common.sh"

TASK="${TASK:-}"
EXIT_CODE="${EXIT_CODE:-1}"
STDERR_FILE="${STDERR_FILE:-}"
OUTPUT="${OUTPUT:-prompts/outputs/current/harness-diagnosis.json}"
RETRY_COUNT="${RETRY_COUNT:-0}"

STDERR_TEXT=""
[ -n "$STDERR_FILE" ] && [ -f "$STDERR_FILE" ] && STDERR_TEXT="$(cat "$STDERR_FILE")"

# Flutter machine output if the task ran `flutter test --machine`.
TEST_JSON=""
for cand in "$PWD/.flutter-test.json" "$PWD/test/.flutter-test.json"; do
  [ -f "$cand" ] && TEST_JSON="$cand" && break
done

DOCTOR_SNAPSHOT=""
if command -v flutter >/dev/null 2>&1; then
  DOCTOR_SNAPSHOT="$(mktemp)"
  flutter doctor -v >"$DOCTOR_SNAPSHOT" 2>&1 || true
fi

evidence_tmp="$(mktemp)"
trap 'rm -f "$evidence_tmp" "${DOCTOR_SNAPSHOT:-/dev/null}"' EXIT
{
  [ -n "$TEST_JSON" ] && cat "$TEST_JSON" 2>/dev/null
  [ -n "$DOCTOR_SNAPSHOT" ] && cat "$DOCTOR_SNAPSHOT" 2>/dev/null
} > "$evidence_tmp" 2>/dev/null

read_catalog_match "$CATALOG" "$STDERR_TEXT" "$evidence_tmp"

report_paths='['
first=1
for p in "$TEST_JSON" "$DOCTOR_SNAPSHOT"; do
  [ -z "$p" ] && continue
  [ -e "$p" ] || continue
  [ $first -eq 1 ] || report_paths="${report_paths},"
  first=0
  report_paths="${report_paths}\"${p}\""
done
report_paths="${report_paths}]"

key_lines='[]'
if [ -n "$STDERR_TEXT" ]; then
  key_lines="$(printf '%s\n' "$STDERR_TEXT" | grep -E "EXCEPTION|Error:|Lost connection|MissingPluginException|Target of URI doesn't exist|Engine version" | head -5 | json_array_from_lines)"
fi

write_diagnosis_json "flutter" "$TASK" "$EXIT_CODE" "$report_paths" "$key_lines" "$OUTPUT"

recipe_ok=0
if [ "$CLASSIFICATION" = "harness_crash" ]; then
  apply_recipe || recipe_ok=1
fi

decide_exit_code "$recipe_ok"
exit $?
