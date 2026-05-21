#!/usr/bin/env bash
# diagnose-harness-web.sh — Web (Node + React) harness diagnosis.

set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_SCRIPT="$(cd "$SCRIPT_DIR/.." && pwd)"
CATALOG="$ROOT_SCRIPT/prompts/modules/harness-recovery/web.yaml"
# shellcheck disable=SC1091
source "$SCRIPT_DIR/lib/harness-common.sh"

TASK="${TASK:-}"
EXIT_CODE="${EXIT_CODE:-1}"
STDERR_FILE="${STDERR_FILE:-}"
OUTPUT="${OUTPUT:-prompts/outputs/current/harness-diagnosis.json}"
RETRY_COUNT="${RETRY_COUNT:-0}"

STDERR_TEXT=""
[ -n "$STDERR_FILE" ] && [ -f "$STDERR_FILE" ] && STDERR_TEXT="$(cat "$STDERR_FILE")"

# Export STDERR_TEXT so catalog recipes that reference it (port extraction) work.
export STDERR_TEXT

# ---------------------------------------------------------------------
# Web-specific evidence: vitest/jest results.json, junit.xml, the
# freshest node fatal report.json, playwright-report listing.
# ---------------------------------------------------------------------
RESULTS_JSON=""
for cand in "$PWD/test-results/results.json" "$PWD/coverage/test-results.json"; do
  [ -f "$cand" ] && RESULTS_JSON="$cand" && break
done
JUNIT_XML=""
[ -f "$PWD/test-results/junit.xml" ] && JUNIT_XML="$PWD/test-results/junit.xml"

NODE_REPORT="$(ls -t "$PWD"/report.*.json 2>/dev/null | head -1 || true)"

PW_REPORT_DIR=""
[ -d "$PWD/playwright-report" ] && PW_REPORT_DIR="$PWD/playwright-report"

evidence_tmp="$(mktemp)"
trap 'rm -f "$evidence_tmp"' EXIT
{
  [ -n "$RESULTS_JSON" ] && cat "$RESULTS_JSON" 2>/dev/null
  [ -n "$JUNIT_XML" ]    && cat "$JUNIT_XML" 2>/dev/null
  [ -n "$NODE_REPORT" ]  && cat "$NODE_REPORT" 2>/dev/null
  [ -n "$PW_REPORT_DIR" ] && find "$PW_REPORT_DIR" -name 'index.html' -mmin -60 2>/dev/null | head -1 | xargs -r cat 2>/dev/null
} > "$evidence_tmp" 2>/dev/null

read_catalog_match "$CATALOG" "$STDERR_TEXT" "$evidence_tmp"

report_paths='['
first=1
for p in "$RESULTS_JSON" "$JUNIT_XML" "$NODE_REPORT" "$PW_REPORT_DIR"; do
  [ -z "$p" ] && continue
  [ -e "$p" ] || continue
  [ $first -eq 1 ] || report_paths="${report_paths},"
  first=0
  report_paths="${report_paths}\"${p}\""
done
report_paths="${report_paths}]"

key_lines='[]'
if [ -n "$STDERR_TEXT" ]; then
  key_lines="$(printf '%s\n' "$STDERR_TEXT" | grep -E 'Error|FATAL|EADDRINUSE|Cannot find module|Worker .* crashed|out of memory' | head -5 | json_array_from_lines)"
fi

write_diagnosis_json "web" "$TASK" "$EXIT_CODE" "$report_paths" "$key_lines" "$OUTPUT"

recipe_ok=0
if [ "$CLASSIFICATION" = "harness_crash" ]; then
  apply_recipe || recipe_ok=1
fi

decide_exit_code "$recipe_ok"
exit $?
