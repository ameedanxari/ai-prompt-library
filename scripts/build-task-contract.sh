#!/usr/bin/env bash
# build-task-contract.sh — emit the canonical machine-readable task contract.
#
# This is a thin wrapper around the TypeScript task-contract CLI. Keeping
# the parser/report logic in src/task-contract avoids drift between the
# public API and the shell tools.
#
# Usage:
#   bash scripts/build-task-contract.sh [target-dir] [output-json]
#
# Exit codes:
#   0  contract written
#   2  preconditions missing

set -uo pipefail

TARGET_DIR="${1:-prompts/outputs/current}"
OUT="${2:-$TARGET_DIR/task-contract.json}"

resolve_script_dir() {
  local source="${BASH_SOURCE[0]}"
  while [ -L "$source" ]; do
    local dir
    dir="$(cd -P "$(dirname "$source")" && pwd)"
    local target
    target="$(readlink "$source")"
    case "$target" in
      /*) source="$target" ;;
      *) source="$dir/$target" ;;
    esac
  done
  cd -P "$(dirname "$source")" && pwd
}

if [ ! -d "$TARGET_DIR" ]; then
  echo "task contract: target directory does not exist: $TARGET_DIR" >&2
  exit 2
fi

if ! command -v node >/dev/null 2>&1; then
  echo "task contract: node not found" >&2
  exit 2
fi

SCRIPT_DIR="$(resolve_script_dir)"
PACKAGE_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
CLI="$PACKAGE_ROOT/dist/task-contract/cli.js"
needs_build=0

if [ ! -f "$CLI" ]; then
  needs_build=1
elif [ -d "$PACKAGE_ROOT/src/task-contract" ] \
  && find "$PACKAGE_ROOT/src/task-contract" -type f -newer "$CLI" | grep -q .; then
  needs_build=1
fi

if [ "$needs_build" -eq 1 ] && [ -f "$PACKAGE_ROOT/package.json" ] && [ -f "$PACKAGE_ROOT/tsconfig.build.json" ]; then
  (cd "$PACKAGE_ROOT" && npm run build --silent) >/dev/null 2>&1 || {
    echo "task contract: failed to build TypeScript CLI" >&2
    exit 2
  }
fi

if [ ! -f "$CLI" ]; then
  echo "task contract: compiled CLI not found: $CLI" >&2
  echo "   Run npm run build before using this package from source." >&2
  exit 2
fi

node "$CLI" "$TARGET_DIR" "$OUT"
