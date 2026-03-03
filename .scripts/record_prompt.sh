#!/usr/bin/env bash
set -euo pipefail

# record_prompt.sh
# Usage:
#   record_prompt.sh --source SOURCE --actor ACTOR --prompt "prompt text"
#   echo "prompt text" | record_prompt.sh --source SOURCE --actor ACTOR

AUDIT_DIR=".ai-prompts/.state"
AUDIT_FILE="$AUDIT_DIR/audit.log"

mkdir -p "$AUDIT_DIR"

# Parse args
SOURCE=""
ACTOR="agent"
PROMPT=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --source)
      SOURCE="$2"; shift 2;;
    --actor)
      ACTOR="$2"; shift 2;;
    --prompt)
      PROMPT="$2"; shift 2;;
    --help)
      echo "Usage: $0 [--source NAME] [--actor NAME] [--prompt 'text']"; exit 0;;
    *) echo "Unknown arg: $1"; exit 2;;
  esac
done

# Read stdin if prompt not provided
if [ -z "$PROMPT" ]; then
  if [ ! -t 0 ]; then
    PROMPT=$(cat -)
  fi
fi

# If still empty, nothing to record
if [ -z "$(echo -n "$PROMPT" | tr -d '[:space:]')" ]; then
  exit 0
fi

# Gather metadata
TS=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
REPO_DIR="$(pwd)"
GIT_SHA=""
if [ -d ".git" ]; then
  GIT_SHA=$(git rev-parse --short HEAD 2>/dev/null || true)
fi
HOSTNAME="$(hostname)"
PROMPT_HASH=$(echo -n "$PROMPT" | shasum -a 256 | awk '{print $1}')

# load library helpers
SCRIPT_DIR="$(dirname "$0")"
. "$SCRIPT_DIR/lib.sh"

# Safe JSON encode using shared helper
PROMPT_JSON=$(json_encode "$PROMPT")

# Write JSONL entry
cat >> "$AUDIT_FILE" <<EOF
{"ts":"$TS","repo":"$REPO_DIR","commit":"$GIT_SHA","host":"$HOSTNAME","actor":"$ACTOR","source":"$SOURCE","prompt_hash":"$PROMPT_HASH","prompt":$PROMPT_JSON}
EOF

# Optionally rotate if bigger than 5MB
rotate_if_large "$AUDIT_FILE" $((5*1024*1024))
