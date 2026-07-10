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

SCRIPT_DIR="$(resolve_script_dir)"
PACKAGE_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
# shellcheck source=scripts/lib/toolchain.sh
source "$SCRIPT_DIR/lib/toolchain.sh"

FAILED_ATTEMPT_REPORT="${AI_PROMPT_TOOLCHAIN_FAILED_ATTEMPT_REPORT:-$TARGET_DIR/task-contract.failed-attempt.json}"
CLI="$PACKAGE_ROOT/dist/task-contract/cli.js"
ATTEMPTED_COMMAND="node $CLI $TARGET_DIR $OUT"

if [ ! -d "$TARGET_DIR" ]; then
  echo "task contract: target directory does not exist: $TARGET_DIR" >&2
  exit 2
fi

if ! require_tool node resolve_node; then
  resolver_decision="$TOOLCHAIN_LAST_DECISION"
  write_toolchain_failure_report \
    "$FAILED_ATTEMPT_REPORT" \
    "scripts/build-task-contract.sh" \
    "$ATTEMPTED_COMMAND" \
    "node" \
    "$resolver_decision" >/dev/null 2>&1 || true
  exit 2
fi

NODE_BIN="$RESOLVED_NODE"
NODE_DECISION="$TOOLCHAIN_LAST_DECISION"
ISOLATED_BUILD_DIR=""

cleanup_isolated_build() {
  if [ -n "$ISOLATED_BUILD_DIR" ] && [ -d "$ISOLATED_BUILD_DIR" ]; then
    rm -rf "$ISOLATED_BUILD_DIR"
  fi
}
trap cleanup_isolated_build EXIT

if [ -d "$PACKAGE_ROOT/src/task-contract" ] && [ -f "$PACKAGE_ROOT/tsconfig.build.json" ]; then
  TYPESCRIPT_CLI="$PACKAGE_ROOT/node_modules/typescript/bin/tsc"
  if [ -f "$TYPESCRIPT_CLI" ]; then
    ISOLATED_BUILD_DIR="$(mktemp -d "${TMPDIR:-/tmp}/ai-prompt-contract.XXXXXX")" || {
      echo "task contract: failed to create isolated build directory" >&2
      exit 2
    }
    ISOLATED_BUILD_DIR="$(cd "$ISOLATED_BUILD_DIR" && pwd -P)"
    printf '{"type":"module"}\n' > "$ISOLATED_BUILD_DIR/package.json"
    if ! "$NODE_BIN" "$TYPESCRIPT_CLI" \
      -p "$PACKAGE_ROOT/tsconfig.build.json" \
      --outDir "$ISOLATED_BUILD_DIR" >/dev/null 2>&1
    then
      echo "task contract: failed to build isolated TypeScript CLI" >&2
      write_toolchain_failure_report \
        "$FAILED_ATTEMPT_REPORT" \
        "scripts/build-task-contract.sh" \
        "node typescript/bin/tsc -p tsconfig.build.json --outDir <isolated>" \
        "node" \
        "$NODE_DECISION" >/dev/null 2>&1 || true
      exit 2
    fi
    CLI="$ISOLATED_BUILD_DIR/task-contract/cli.js"
  elif [ ! -f "$CLI" ]; then
    if ! require_tool npm resolve_npm; then
      resolver_decision="$TOOLCHAIN_LAST_DECISION"
      write_toolchain_failure_report \
        "$FAILED_ATTEMPT_REPORT" \
        "scripts/build-task-contract.sh" \
        "npm run build --silent" \
        "npm" \
        "$resolver_decision" >/dev/null 2>&1 || true
      exit 2
    fi
    NPM_BIN="$RESOLVED_NPM"
    NODE_DIR="$(dirname "$NODE_BIN")"
    (cd "$PACKAGE_ROOT" && PATH="$NODE_DIR:$PATH" "$NPM_BIN" run build --silent) >/dev/null 2>&1 || {
      echo "task contract: failed to build TypeScript CLI" >&2
      write_toolchain_failure_report \
        "$FAILED_ATTEMPT_REPORT" \
        "scripts/build-task-contract.sh" \
        "npm run build --silent" \
        "npm" \
        "$TOOLCHAIN_LAST_DECISION" >/dev/null 2>&1 || true
      exit 2
    }
  fi
fi

if [ ! -f "$CLI" ]; then
  echo "task contract: compiled CLI not found: $CLI" >&2
  echo "   Run npm run build before using this package from source." >&2
  exit 2
fi

generate_task_contract() {
  local temporary_report="$1"
  "$NODE_BIN" "$CLI" "$TARGET_DIR" "$temporary_report"
}

if ! write_atomic_report "$OUT" generate_task_contract; then
  echo "task contract: generation failed; previous report preserved" >&2
  exit 2
fi

printf 'task contract report committed atomically: %s (node: %s; resolver: %s)\n' \
  "$OUT" \
  "$(tool_version "$NODE_BIN")" \
  "$NODE_DECISION"
