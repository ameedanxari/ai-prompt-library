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
#   2. Builds path, delivery-order, task-contract, and task-graph ledgers.
#   3. Validates phase order, baseline coverage, user-review checkpoints,
#      and screenshot matrices when screenshot task files exist.
#   4. Runs the Revise Gate (writes canonical revise-report.md).
#   5. Surfaces the gate verdict so the agent cannot declare done
#      without seeing whether executor_gate is pass or fail.
#
# Idempotent — safe to re-run. Exit code is 0 when the full gate passes
# and non-zero when any blocking report fails.
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

# Resolve the real script directory so npm bin symlinks still find
# sibling scripts in the package's scripts/ directory.
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

echo "=== finalize: $TARGET_DIR ==="
echo ""
echo "Step 1/5 — apply mechanical auto-fixers"
echo "----------------------------------------"
bash "$SCRIPT_DIR/repair-task-schema-fields.sh" "$TARGET_DIR" || true
bash "$SCRIPT_DIR/fix-user-stories.sh" "$TARGET_DIR" || true
echo ""
echo "Step 2/5 — build the canonical-paths ledger"
echo "-------------------------------------------"
# Emit path-ledger.md so the executor has an authoritative list of
# every File: path the plan owns. Non-fatal: ledger collisions are
# also caught by the revise gate (it surfaces them under failing_files).
ledger_status=0
bash "$SCRIPT_DIR/build-path-ledger.sh" "$TARGET_DIR" || ledger_status=$?
echo ""
echo "Step 3/5 — build the delivery-order manifest"
echo "--------------------------------------------"
# Emit delivery-order.md so the executor has a canonical phase-aware
# topological sort. Without this, the executor falls back to filesystem
# listing (alphabetical) and the Phase field has no effect on order.
# Phase inversions / cycles are fatal here — exit 1 or 2 from the
# script flips the gate to fail.
delivery_status=0
bash "$SCRIPT_DIR/build-delivery-order.sh" "$TARGET_DIR" || delivery_status=$?
echo ""
echo "Step 4/5 — build and validate contracts, graph, phase order, baseline, review checkpoints, and screenshot matrices"
echo "----------------------------------------------------------------------------------------------------------------"
graph_status=0
bash "$SCRIPT_DIR/build-task-graph.sh" "$TARGET_DIR" || graph_status=$?
contract_status=0
bash "$SCRIPT_DIR/validate-task-contract.sh" "$TARGET_DIR" || contract_status=$?
phase_order_status=0
bash "$SCRIPT_DIR/validate-phase-order.sh" "$TARGET_DIR" || phase_order_status=$?
baseline_status=0
bash "$SCRIPT_DIR/validate-baseline-task-coverage.sh" "$TARGET_DIR" || baseline_status=$?
review_checkpoint_status=0
bash "$SCRIPT_DIR/validate-user-review-checkpoints.sh" "$TARGET_DIR" || review_checkpoint_status=$?
screenshot_matrix_status=0
screenshot_matrix_file_count=0
while IFS= read -r _screenshot_matrix_file; do
  screenshot_matrix_file_count=$((screenshot_matrix_file_count + 1))
done < <(find "$TARGET_DIR" -maxdepth 1 -type f \( -name "tasks-*screenshots*.md" -o -name "remediation-*screenshots*.md" \) | sort)
if [ "$screenshot_matrix_file_count" -gt 0 ]; then
  bash "$SCRIPT_DIR/validate-screenshot-matrix.sh" "$TARGET_DIR" || screenshot_matrix_status=$?
  if [ $screenshot_matrix_status -ne 0 ]; then
    echo "❌ screenshot matrix validation: fail"
  fi
else
  echo "ℹ️  no screenshot task matrix files found; skipping screenshot matrix validation."
fi
echo ""
echo "Step 5/5 — run the Revise Gate"
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

# Phase inversions / dependency cycles in delivery-order.md are also
# blocking. A plan that cannot be linearly ordered for execution must
# not pass the gate, even if every task individually validates.
if [ $gate_status -eq 0 ] && [ $delivery_status -ne 0 ]; then
  gate_status=$delivery_status
  echo ""
  echo "ℹ️  revise gate alone passed, but build-delivery-order.sh found"
  echo "   phase inversions or a cycle; promoting overall gate to fail."
  echo "   Open delivery-order.md for the specific tasks."
fi

if [ $gate_status -eq 0 ] && [ $graph_status -ne 0 ]; then
  gate_status=$graph_status
  echo ""
  echo "ℹ️  revise gate alone passed, but build-task-graph.sh found"
  echo "   dependency graph problems; promoting overall gate to fail."
fi

if [ $gate_status -eq 0 ] && [ $contract_status -ne 0 ]; then
  gate_status=$contract_status
  echo ""
  echo "ℹ️  revise gate alone passed, but task-contract.json contains"
  echo "   blocking contract issues; promoting overall gate to fail."
fi

if [ $gate_status -eq 0 ] && [ $phase_order_status -ne 0 ]; then
  gate_status=$phase_order_status
  echo ""
  echo "ℹ️  revise gate alone passed, but phase/order validation has"
  echo "   blocking issues; promoting overall gate to fail."
  echo "   Open phase-order-report.md for the specific tasks."
fi

if [ $gate_status -eq 0 ] && [ $baseline_status -ne 0 ]; then
  gate_status=$baseline_status
  echo ""
  echo "ℹ️  revise gate alone passed, but baseline task coverage has"
  echo "   blocking gaps; promoting overall gate to fail."
  echo "   Open baseline-task-coverage.md for the specific topics."
fi

if [ $gate_status -eq 0 ] && [ $review_checkpoint_status -ne 0 ]; then
  gate_status=$review_checkpoint_status
  echo ""
  echo "ℹ️  revise gate alone passed, but user-review checkpoints are"
  echo "   missing or unordered; promoting overall gate to fail."
  echo "   Open user-review-checkpoints.md for the specific tasks."
fi

if [ $gate_status -eq 0 ] && [ $screenshot_matrix_status -ne 0 ]; then
  gate_status=$screenshot_matrix_status
  echo ""
  echo "ℹ️  revise gate alone passed, but screenshot matrix validation has"
  echo "   blocking issues; promoting overall gate to fail."
  echo "   Open tasks-*screenshots*.md / remediation-*screenshots*.md and"
  echo "   run validate-screenshot-matrix for the specific matrix errors."
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
