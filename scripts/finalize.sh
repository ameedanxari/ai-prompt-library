#!/usr/bin/env bash
#
# finalize.sh — one-command finisher for drill-down Step 3 /
# audit-and-remediate Step 3.
#
# Weak models repeatedly declare "Successfully completed" after Step 3
# without running the Revise Gate. The gate docs are clear and every
# validator error points at the right fix, but the agent never sees
# those errors because it never runs the validator. This wrapper gives
# agents a single post-Step-3 action that:
#
#   1. Applies mechanical auto-fixers (missing-comma user stories).
#   2. Runs the Revise Gate (writes canonical revise-report.md).
#   3. Surfaces the gate verdict so the agent cannot declare done
#      without seeing whether executor_gate is pass or fail.
#
# Idempotent — safe to re-run. Exit code matches revise.sh: 0 when the
# gate passes, non-zero when it does not.
#
# Usage:
#   bash scripts/finalize.sh [target-dir]
#
# If target-dir is omitted, defaults to prompts/outputs/current.

set -euo pipefail

TARGET_DIR=${1:-prompts/outputs/current}

if [ ! -d "$TARGET_DIR" ]; then
  echo "❌ target directory does not exist: $TARGET_DIR"
  echo "usage: bash scripts/finalize.sh [target-dir]"
  exit 1
fi

# Resolve the library root from this script's location so the same
# finalize.sh works when invoked as .ai-prompts/scripts/finalize.sh
# from a consumer project.
SCRIPT_DIR=$(cd "$(dirname "$0")" && pwd)

echo "=== finalize: $TARGET_DIR ==="
echo ""
echo "Step 1/2 — apply mechanical auto-fixers"
echo "----------------------------------------"
bash "$SCRIPT_DIR/fix-user-stories.sh" "$TARGET_DIR" || true
echo ""
echo "Step 2/2 — run the Revise Gate"
echo "------------------------------"
gate_status=0
bash "$SCRIPT_DIR/revise.sh" "$TARGET_DIR" || gate_status=$?

echo ""
echo "=== finalize: done ==="
if [ $gate_status -eq 0 ]; then
  echo "✅ executor_gate: pass"
  echo "The plan is ready for the executor. Report to the user with:"
  echo "  - path: $TARGET_DIR"
  echo "  - gate: pass"
  echo "  - next: executor runs the plan against real code."
  exit 0
else
  echo "❌ executor_gate: fail"
  echo "Do NOT declare the drill-down complete yet."
  echo "Open $TARGET_DIR/revise-report.md and follow its instructions:"
  echo "  1. Regenerate each file listed in failing_files."
  echo "  2. Fill any feature listed in coverage_gap_count."
  echo "  3. Re-run: bash $SCRIPT_DIR/finalize.sh $TARGET_DIR"
  exit $gate_status
fi
