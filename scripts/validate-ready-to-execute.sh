#!/usr/bin/env bash
# validate-ready-to-execute.sh — single pre-executor readiness gate.
#
# The executor should not stitch together partial checks from memory.
# This wrapper runs finalize.sh, which rebuilds the path ledger,
# schema-repair report, delivery order, task graph, phase-order report,
# baseline coverage report, user-review checkpoint report, screenshot
# matrix validation when relevant, and revise report, then writes a
# small readiness report that the orchestrator can treat as its handoff
# contract.
#
# Usage:
#   bash scripts/validate-ready-to-execute.sh [target-dir]
#
# Exit codes:
#   0  ready_to_execute: true
#   1  readiness gate failed; inspect ready-to-execute-report.md
#   2  preconditions missing

set -uo pipefail

TARGET_DIR="${1:-prompts/outputs/current}"

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

if [ ! -d "$TARGET_DIR" ]; then
  echo "❌ target directory does not exist: $TARGET_DIR" >&2
  echo "usage: bash scripts/validate-ready-to-execute.sh [target-dir]" >&2
  exit 2
fi

REPORT="$TARGET_DIR/ready-to-execute-report.md"
FINALIZE_OUTPUT="$(mktemp)"
finalize_status=0
ARTIFACTS="task-schema-repair-report.md path-ledger.md delivery-order.md task-contract.json task-graph.json phase-order-report.md baseline-task-coverage.md user-review-checkpoints.md revise-report.md"

bash "$SCRIPT_DIR/finalize.sh" "$TARGET_DIR" > "$FINALIZE_OUTPUT" 2>&1 || finalize_status=$?

ready="false"
if [ "$finalize_status" -eq 0 ]; then
  ready="true"
fi

artifact_state() {
  local artifact="$1"
  if [ -f "$TARGET_DIR/$artifact" ]; then
    printf "present"
  else
    printf "missing"
  fi
}

BLOCKING_ARTIFACTS=""
BLOCKING_ISSUES=""
RECOMMENDED_STEP="execute_task_loop"

append_unique_line() {
  local current="$1"
  local value="$2"

  case "
$current
" in
    *"
$value
"*) printf "%s" "$current" ;;
    *)
      if [ -n "$current" ]; then
        printf "%s
%s" "$current" "$value"
      else
        printf "%s" "$value"
      fi
      ;;
  esac
}

add_blocking_artifact() {
  BLOCKING_ARTIFACTS="$(append_unique_line "$BLOCKING_ARTIFACTS" "$1")"
}

add_blocking_issue() {
  BLOCKING_ISSUES="$(append_unique_line "$BLOCKING_ISSUES" "$1")"
}

emit_yaml_list() {
  local name="$1"
  local values="$2"

  if [ -z "$values" ]; then
    echo "$name: []"
    return
  fi

  echo "$name:"
  printf "%s
" "$values" | while IFS= read -r value; do
    [ -z "$value" ] && continue
    printf "  - \"%s\"
" "$value"
  done
}

if [ "$ready" != "true" ]; then
  RECOMMENDED_STEP="repair_plan_then_rerun_ready_gate"
  add_blocking_issue "finalize exited with code $finalize_status"

  for artifact in $ARTIFACTS; do
    if [ "$(artifact_state "$artifact")" = "missing" ]; then
      add_blocking_artifact "$artifact"
      add_blocking_issue "missing required artifact $artifact"
    fi
  done

  if grep -q "path-ledger.sh found collisions" "$FINALIZE_OUTPUT"; then
    add_blocking_artifact "path-ledger.md"
    add_blocking_issue "path ledger has collisions"
  fi
  if grep -q "build-delivery-order.sh found" "$FINALIZE_OUTPUT"; then
    add_blocking_artifact "delivery-order.md"
    add_blocking_issue "delivery order has phase inversions or dependency cycles"
  fi
  if grep -q "build-task-graph.sh found" "$FINALIZE_OUTPUT"; then
    add_blocking_artifact "task-graph.json"
    add_blocking_issue "task graph has dependency problems"
  fi
  if grep -q "task-contract.json contains" "$FINALIZE_OUTPUT"; then
    add_blocking_artifact "task-contract.json"
    add_blocking_issue "task contract has blocking issues"
  fi
  if grep -q "phase/order validation" "$FINALIZE_OUTPUT"; then
    add_blocking_artifact "phase-order-report.md"
    add_blocking_issue "phase order validation failed"
  fi
  if grep -q "baseline task coverage" "$FINALIZE_OUTPUT"; then
    add_blocking_artifact "baseline-task-coverage.md"
    add_blocking_issue "baseline task coverage has gaps"
  fi
  if grep -q "user-review checkpoints" "$FINALIZE_OUTPUT"; then
    add_blocking_artifact "user-review-checkpoints.md"
    add_blocking_issue "user review checkpoints are missing or unordered"
  fi
  if grep -q "screenshot matrix validation" "$FINALIZE_OUTPUT"; then
    add_blocking_artifact "tasks-*screenshots*.md"
    add_blocking_issue "screenshot matrix validation failed"
  fi
  if grep -q "executor_gate: fail" "$FINALIZE_OUTPUT"; then
    add_blocking_artifact "revise-report.md"
    add_blocking_issue "revise gate failed"
  fi
fi

NOW="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
{
  echo "---"
  echo "generated_at: $NOW"
  echo "generated_by: scripts/validate-ready-to-execute.sh"
  echo "target_dir: $TARGET_DIR"
  echo "finalize_exit_code: $finalize_status"
  echo "ready_to_execute: $ready"
  echo "recommended_step: $RECOMMENDED_STEP"
  emit_yaml_list "blocking_artifacts" "$BLOCKING_ARTIFACTS"
  emit_yaml_list "blocking_issues" "$BLOCKING_ISSUES"
  echo "artifacts:"
  for artifact in $ARTIFACTS; do
    echo "  $artifact: $(artifact_state "$artifact")"
  done
  echo "---"
  echo ""
  echo "# Ready To Execute Report"
  echo ""
  echo "_Generated by \`scripts/validate-ready-to-execute.sh\` on $NOW._"
  echo ""
  if [ "$ready" = "true" ]; then
    echo "✅ ready_to_execute: true"
    echo ""
    echo "The plan passed finalize, and the executor may begin the task loop."
    echo ""
    echo "**Recommended step:** \`$RECOMMENDED_STEP\`."
  else
    echo "❌ ready_to_execute: false"
    echo ""
    echo "**Recommended step:** \`$RECOMMENDED_STEP\`."
    echo ""
    echo "The executor MUST NOT begin task execution yet. Open"
    echo "\`revise-report.md\`, \`delivery-order.md\`, \`task-contract.json\`,"
    echo "\`task-graph.json\`, \`phase-order-report.md\`,"
    echo "\`baseline-task-coverage.md\`, \`user-review-checkpoints.md\`,"
    echo "and any \`tasks-*screenshots*.md\` / \`remediation-*screenshots*.md\` files"
    echo "for the blocking contract errors."
  fi
  echo ""
  echo "## Blocking Summary"
  echo ""
  if [ -z "$BLOCKING_ARTIFACTS" ]; then
    echo "- Blocking artifacts: none"
  else
    echo "- Blocking artifacts:"
    printf "%s
" "$BLOCKING_ARTIFACTS" | while IFS= read -r artifact; do
      [ -z "$artifact" ] && continue
      echo "  - \`$artifact\`"
    done
  fi
  if [ -z "$BLOCKING_ISSUES" ]; then
    echo "- Blocking issues: none"
  else
    echo "- Blocking issues:"
    printf "%s
" "$BLOCKING_ISSUES" | while IFS= read -r issue; do
      [ -z "$issue" ] && continue
      echo "  - $issue"
    done
  fi
  echo ""
  echo "## Artifact State"
  echo ""
  echo "| Artifact | State |"
  echo "|---|---|"
  for artifact in $ARTIFACTS; do
    echo "| \`$artifact\` | $(artifact_state "$artifact") |"
  done
  echo ""
  echo "## Finalize Output"
  echo ""
  echo '```text'
  cat "$FINALIZE_OUTPUT"
  echo '```'
} > "$REPORT"

rm -f "$FINALIZE_OUTPUT"

if [ "$ready" = "true" ]; then
  echo "✅ ready-to-execute gate: pass — wrote $REPORT"
  exit 0
fi

echo "❌ ready-to-execute gate: fail — wrote $REPORT"
exit 1
