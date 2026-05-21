#!/usr/bin/env bash
# diagnose-harness-bash.sh — Bash/shell-script harness diagnosis.

set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_SCRIPT="$(cd "$SCRIPT_DIR/.." && pwd)"
CATALOG="$ROOT_SCRIPT/prompts/modules/harness-recovery/bash.yaml"
# shellcheck disable=SC1091
source "$SCRIPT_DIR/lib/harness-common.sh"

TASK="${TASK:-}"
EXIT_CODE="${EXIT_CODE:-1}"
STDERR_FILE="${STDERR_FILE:-}"
OUTPUT="${OUTPUT:-prompts/outputs/current/harness-diagnosis.json}"
RETRY_COUNT="${RETRY_COUNT:-0}"

STDERR_TEXT=""
[ -n "$STDERR_FILE" ] && [ -f "$STDERR_FILE" ] && STDERR_TEXT="$(cat "$STDERR_FILE")"

# Inspect coredumpctl on Linux; macOS bash crashes are usually exit-code only.
COREDUMP_OUT=""
if command -v coredumpctl >/dev/null 2>&1; then
  COREDUMP_OUT="$(coredumpctl list --since '5 minutes ago' --no-pager 2>/dev/null | head -10 || true)"
fi

evidence_tmp="$(mktemp)"
trap 'rm -f "$evidence_tmp"' EXIT
{
  [ -n "$COREDUMP_OUT" ] && printf '%s\n' "$COREDUMP_OUT"
  # Exit code class becomes part of the evidence so catalog regexes can
  # match against e.g. "signal SIGKILL" derived from 137.
  case "$EXIT_CODE" in
    127) echo "exit 127: command not found" ;;
    126) echo "exit 126: cannot execute" ;;
    137) echo "exit 137: received signal 9 (SIGKILL); Killed" ;;
    139) echo "exit 139: Segmentation fault (core dumped); signal SIGSEGV" ;;
  esac
} > "$evidence_tmp"

read_catalog_match "$CATALOG" "$STDERR_TEXT" "$evidence_tmp"

report_paths='[]'

key_lines='[]'
if [ -n "$STDERR_TEXT" ]; then
  key_lines="$(printf '%s\n' "$STDERR_TEXT" | grep -E 'command not found|Permission denied|Killed|Terminated|Segmentation fault|pipefail' | head -5 | json_array_from_lines)"
fi

write_diagnosis_json "bash" "$TASK" "$EXIT_CODE" "$report_paths" "$key_lines" "$OUTPUT"

recipe_ok=0
if [ "$CLASSIFICATION" = "harness_crash" ]; then
  apply_recipe || recipe_ok=1
fi

decide_exit_code "$recipe_ok"
exit $?
