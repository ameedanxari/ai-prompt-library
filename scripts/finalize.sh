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
#   2. Builds path and task-graph ledgers.
#   3. Runs the Revise Gate (writes canonical revise-report.md).
#   4. Surfaces the gate verdict so the agent cannot declare done
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
echo "Step 1/4 — apply mechanical auto-fixers"
echo "----------------------------------------"
bash "$SCRIPT_DIR/fix-user-stories.sh" "$TARGET_DIR" || true
echo ""
echo "Step 2/4 — build the canonical-paths ledger"
echo "-------------------------------------------"
# Emit path-ledger.md so the executor has an authoritative list of
# every File: path the plan owns. Non-fatal: ledger collisions are
# also caught by the revise gate (it surfaces them under failing_files).
ledger_status=0
bash "$SCRIPT_DIR/build-path-ledger.sh" "$TARGET_DIR" || ledger_status=$?
echo ""
echo "Step 3/4 — build the canonical task graph"
echo "-----------------------------------------"
graph_status=0
bash "$SCRIPT_DIR/build-task-graph.sh" "$TARGET_DIR" || graph_status=$?
echo ""
echo "Step 4/4 — run the Revise Gate"
echo "------------------------------"
gate_status=0
bash "$SCRIPT_DIR/revise.sh" "$TARGET_DIR" || gate_status=$?

# Ledger collisions also block the executor. Promote a clean revise
# gate to fail if the ledger is dirty — catching it here is cheaper
# than surfacing duplicate source files mid-execution.
if [ $gate_status -eq 0 ] && [ $ledger_status -ne 0 ]; then
  gate_status=$ledger_status
  echo ""
  echo "ℹ️  revise gate alone passed, but path-ledger.sh found collisions;"
  echo "   promoting overall gate to fail. Open path-ledger.md."
fi

if [ $gate_status -eq 0 ] && [ $graph_status -ne 0 ]; then
  gate_status=$graph_status
  echo ""
  echo "ℹ️  revise gate alone passed, but build-task-graph.sh found"
  echo "   dependency graph problems; promoting overall gate to fail."
fi

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
