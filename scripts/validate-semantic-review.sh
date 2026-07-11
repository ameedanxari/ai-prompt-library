#!/usr/bin/env bash
# Validate AI semantic-review artifacts before honest handoff.
#
# Exit 0: review bundle is valid and permits verified completion.
# Exit 1: review bundle is valid but remediation/blocking work remains.
# Exit 2: review artifacts are missing, malformed, or inconsistent.

set -uo pipefail

PLAN_DIR="${1:-prompts/outputs/current}"
REPORT="${2:-$PLAN_DIR/review/semantic-review-validation.json}"

resolve_script_dir() {
  local source="${BASH_SOURCE[0]}"
  while [ -L "$source" ]; do
    local dir target
    dir="$(cd -P "$(dirname "$source")" && pwd)"
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

if [ ! -d "$PLAN_DIR" ]; then
  echo "semantic review prerequisite error: plan directory does not exist: $PLAN_DIR" >&2
  exit 2
fi
if [ ! -d "$PLAN_DIR/review" ]; then
  echo "semantic review prerequisite error: review directory does not exist: $PLAN_DIR/review" >&2
  exit 2
fi
if ! require_tool node resolve_node; then
  exit 2
fi

NODE_BIN="$RESOLVED_NODE"
CLI="$PACKAGE_ROOT/dist/review/cli.js"
ISOLATED_BUILD_DIR=""

cleanup() {
  if [ -n "$ISOLATED_BUILD_DIR" ] && [ -d "$ISOLATED_BUILD_DIR" ]; then
    rm -rf "$ISOLATED_BUILD_DIR"
  fi
}
trap cleanup EXIT

if [ -f "$PACKAGE_ROOT/node_modules/typescript/bin/tsc" ]; then
  ISOLATED_BUILD_DIR="$(mktemp -d "${TMPDIR:-/tmp}/ai-prompt-semantic-review.XXXXXX")" || exit 2
  printf '{"type":"module"}\n' > "$ISOLATED_BUILD_DIR/package.json"
  if ! "$NODE_BIN" "$PACKAGE_ROOT/node_modules/typescript/bin/tsc" \
    -p "$PACKAGE_ROOT/tsconfig.build.json" \
    --outDir "$ISOLATED_BUILD_DIR" >/dev/null 2>&1
  then
    echo "semantic review prerequisite error: failed to build isolated validator" >&2
    exit 2
  fi
  CLI="$ISOLATED_BUILD_DIR/review/cli.js"
fi

if [ ! -f "$CLI" ]; then
  echo "semantic review prerequisite error: compiled CLI not found: $CLI" >&2
  exit 2
fi

produce_report() {
  local temporary="$1"
  "$NODE_BIN" "$CLI" "$PLAN_DIR" "$temporary"
}

mkdir -p "$(dirname "$REPORT")"
if ! write_atomic_report "$REPORT" produce_report; then
  echo "semantic review report error: $ATOMIC_REPORT_STATUS" >&2
  exit 2
fi

status="$("$NODE_BIN" -e 'const fs=require("node:fs"); process.stdout.write(JSON.parse(fs.readFileSync(process.argv[1], "utf8")).status)' "$REPORT")"
issue_count="$("$NODE_BIN" -e 'const fs=require("node:fs"); process.stdout.write(String(JSON.parse(fs.readFileSync(process.argv[1], "utf8")).issues.length))' "$REPORT")"
echo "Semantic review report: $REPORT (status=$status, issues=$issue_count)"

case "$status" in
  pass)
    echo "✅ semantic review gate: pass"
    exit 0
    ;;
  remediation-required)
    echo "⚠️  semantic review gate: remediation required"
    exit 1
    ;;
  *)
    "$NODE_BIN" -e 'const fs=require("node:fs"); for (const issue of JSON.parse(fs.readFileSync(process.argv[1], "utf8")).issues) console.log(`  - ${issue.code}${issue.artifact ? ` [${issue.artifact}]` : ""}${issue.findingId ? ` [${issue.findingId}]` : ""}: ${issue.message}`)' "$REPORT"
    echo "❌ semantic review gate: invalid"
    exit 2
    ;;
esac
