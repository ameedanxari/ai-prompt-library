#!/usr/bin/env bash
set -euo pipefail

# Simple audit query tool: filter by source/actor/last N lines
SCRIPT_DIR="$(dirname "$0")"
. "$SCRIPT_DIR/lib.sh"  # for possible future helpers
AUDIT_FILE=".ai-prompts/.state/audit.log"

if [ ! -f "$AUDIT_FILE" ]; then
  echo "No audit log found at $AUDIT_FILE"
  exit 0
fi

# Defaults
TAIL=50
SOURCE=""
ACTOR=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --tail) TAIL="$2"; shift 2;;
    --source) SOURCE="$2"; shift 2;;
    --actor) ACTOR="$2"; shift 2;;
    --help) echo "Usage: $0 [--tail N] [--source NAME] [--actor NAME]"; exit 0;;
    *) echo "Unknown arg: $1"; exit 2;;
  esac
done

# build jq filter expression
jq_cmd='.'
if [ -n "$SOURCE" ]; then
  jq_cmd="select(.source==\"$SOURCE\")"
fi
if [ -n "$ACTOR" ]; then
  if [ -n "$SOURCE" ]; then
    jq_cmd="$jq_cmd | select(.actor==\"$ACTOR\")"
  else
    jq_cmd="select(.actor==\"$ACTOR\")"
  fi
fi

# Print last N matching entries
if command -v jq >/dev/null 2>&1; then
  tail -n $TAIL "$AUDIT_FILE" | jq -c "$jq_cmd" | tac | jq -s '.'
else
  echo "warning: jq not installed, showing raw last $TAIL lines" >&2
  tail -n $TAIL "$AUDIT_FILE"
fi
