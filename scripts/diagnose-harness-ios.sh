#!/usr/bin/env bash
# diagnose-harness-ios.sh — iOS-specific harness diagnosis.
# See scripts/lib/harness-common.sh for the shared catalog parser.

set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_SCRIPT="$(cd "$SCRIPT_DIR/.." && pwd)"
CATALOG="$ROOT_SCRIPT/prompts/modules/harness-recovery/ios.yaml"
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
# iOS-specific evidence gathering: freshest .xcresult, freshest .ips,
# CoreSimulator daemon log.
# ---------------------------------------------------------------------
DD_ROOT="${HOME}/Library/Developer/Xcode/DerivedData"
DR_ROOT="${HOME}/Library/Logs/DiagnosticReports"
SIM_LOG="${HOME}/Library/Logs/CoreSimulator/CoreSimulator.log"

XCRESULT=""
[ -d "$DD_ROOT" ] && XCRESULT="$(find "$DD_ROOT" -name '*.xcresult' -mmin -60 2>/dev/null | head -1)"
IPS=""
[ -d "$DR_ROOT" ] && IPS="$(find "$DR_ROOT" -name '*.ips' -mmin -60 2>/dev/null | head -1)"

evidence_tmp="$(mktemp)"
trap 'rm -f "$evidence_tmp"' EXIT
{
  if [ -n "$XCRESULT" ] && command -v xcrun >/dev/null 2>&1; then
    xcrun xcresulttool get --path "$XCRESULT" --format json 2>/dev/null || true
  fi
  [ -n "$IPS" ] && cat "$IPS" 2>/dev/null
  [ -f "$SIM_LOG" ] && tail -200 "$SIM_LOG" 2>/dev/null
} > "$evidence_tmp" 2>/dev/null

read_catalog_match "$CATALOG" "$STDERR_TEXT" "$evidence_tmp"

report_paths='['
first=1
for p in "$XCRESULT" "$IPS" "$SIM_LOG"; do
  [ -z "$p" ] && continue
  [ -e "$p" ] || continue
  [ $first -eq 1 ] || report_paths="${report_paths},"
  first=0
  report_paths="${report_paths}\"${p}\""
done
report_paths="${report_paths}]"

key_lines='[]'
if [ -n "$STDERR_TEXT" ]; then
  key_lines="$(printf '%s\n' "$STDERR_TEXT" | grep -E 'Crashed|FATAL|error:|Failed to boot|Could not|EXC_' | head -5 | json_array_from_lines)"
fi

write_diagnosis_json "ios" "$TASK" "$EXIT_CODE" "$report_paths" "$key_lines" "$OUTPUT"

recipe_ok=0
if [ "$CLASSIFICATION" = "harness_crash" ]; then
  apply_recipe || recipe_ok=1
fi

decide_exit_code "$recipe_ok"
exit $?
