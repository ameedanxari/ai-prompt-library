#!/usr/bin/env bash
set -euo pipefail

# Validate project-level AI Prompt Library integration.
# Run from a consumer project root that contains .ai-prompts/.

AUTO_FIX=1
STRICT=0

while [ $# -gt 0 ]; do
  case "$1" in
    --no-fix) AUTO_FIX=0 ;;
    --strict) STRICT=1 ;;
    -h|--help)
      cat << 'EOF'
Usage: ./validate-integration.sh [--strict] [--no-fix]

Options:
  --strict   Validate active prompts/outputs/current artifacts if present
  --no-fix   Disable bootstrap auto-heal step
EOF
      exit 0
      ;;
    *)
      echo "Unknown option: $1"
      exit 2
      ;;
  esac
  shift
done

ROOT_DIR="$(pwd)"
LIB_DIR="$ROOT_DIR/.ai-prompts"
FAILURES=0
WARNINGS=0

fail() {
  echo "❌ $1"
  FAILURES=$((FAILURES + 1))
}

warn() {
  echo "⚠️ $1"
  WARNINGS=$((WARNINGS + 1))
}

pass() {
  echo "✅ $1"
}

library_version() {
  if [ -d "$LIB_DIR/.git" ] && (cd "$LIB_DIR" && git rev-parse HEAD >/dev/null 2>&1); then
    (cd "$LIB_DIR" && git rev-parse HEAD)
    return
  fi

  if [ -f "$LIB_DIR/package.json" ]; then
    version="$(awk -F\" '/"version"[[:space:]]*:/ { print $4; exit }' "$LIB_DIR/package.json")"
    if [ -n "$version" ]; then
      echo "ai-prompt-library@$version"
    fi
  fi
}

echo "🔄 AI Prompt Library integration validation"
echo "=========================================="

if [ ! -d "$LIB_DIR" ]; then
  fail ".ai-prompts directory not found"
  echo "Failures: $FAILURES"
  exit 1
fi
pass ".ai-prompts directory exists"

if [ "$AUTO_FIX" -eq 1 ] && [ -x "$LIB_DIR/scripts/bootstrap-project-integration.sh" ]; then
  "$LIB_DIR/scripts/bootstrap-project-integration.sh" >/dev/null 2>&1 || \
    warn "bootstrap auto-fix returned non-zero"
fi

required_lib_files=(
  ".ai-prompts/MY_PROJECT.md.template"
  ".ai-prompts/prompts/AGENTS.md"
  ".ai-prompts/prompts/orchestrators/ai-agent-entry-point.md"
  ".ai-prompts/prompts/orchestrators/drill-down-engine.md"
  ".ai-prompts/prompts/orchestrators/audit-and-remediate.md"
  ".ai-prompts/prompts/orchestrators/executor.md"
  ".ai-prompts/prompts/orchestrators/external-input-handler.md"
  ".ai-prompts/prompts/orchestrators/module-selection-index.md"
  ".ai-prompts/prompts/orchestrators/baseline-task-shapes.md"
  ".ai-prompts/prompts/orchestrators/revise-outputs.md"
  ".ai-prompts/prompts/orchestrators/schema-alignment-pass.md"
  ".ai-prompts/prompts/orchestrators/self-maintain.md"
  ".ai-prompts/prompts/steering/library-context.md"
  ".ai-prompts/scripts/bootstrap-project-integration.sh"
  ".ai-prompts/scripts/reset-integration.sh"
  ".ai-prompts/scripts/validate-project-integration.sh"
  ".ai-prompts/scripts/validate-instantiation.sh"
  ".ai-prompts/scripts/revise.sh"
  ".ai-prompts/scripts/finalize.sh"
  ".ai-prompts/scripts/validate-ready-to-execute.sh"
  ".ai-prompts/scripts/step3-progress.sh"
  ".ai-prompts/scripts/build-path-ledger.sh"
  ".ai-prompts/scripts/build-delivery-order.sh"
  ".ai-prompts/scripts/build-task-contract.sh"
  ".ai-prompts/scripts/build-task-graph.sh"
  ".ai-prompts/scripts/validate-task-contract.sh"
  ".ai-prompts/scripts/validate-phase-order.sh"
  ".ai-prompts/scripts/validate-baseline-task-coverage.sh"
  ".ai-prompts/scripts/validate-user-review-checkpoints.sh"
  ".ai-prompts/scripts/scaffold-screenshot-captures.sh"
  ".ai-prompts/scripts/validate-screenshot-matrix.sh"
  ".ai-prompts/scripts/validate-ui-reference-source-map.sh"
  ".ai-prompts/scripts/generate-design-system-review-artifact.sh"
  ".ai-prompts/scripts/validate-design-system-review-artifact.sh"
  ".ai-prompts/scripts/validate-resumption-checkpoint.sh"
  ".ai-prompts/scripts/repair-task-schema-fields.sh"
  ".ai-prompts/scripts/validate-release-readiness.sh"
  ".ai-prompts/prompts/modules/feature-patterns/native-storage-cleanup.md"
  ".ai-prompts/prompts/modules/feature-patterns/local-persistence-progress.md"
  ".ai-prompts/prompts/modules/feature-patterns/gesture-card-ui.md"
  ".ai-prompts/prompts/modules/ai-native/on-device-ml-ios.md"
  ".ai-prompts/prompts/modules/ai-native/on-device-ml-android.md"
  ".ai-prompts/prompts/modules/technology-stacks/mobile-os-capability-matrix.md"
)

for file in "${required_lib_files[@]}"; do
  if [ -f "$file" ]; then
    pass "present: $file"
  else
    fail "missing required library file: $file"
  fi
done

if [ -f ".ai-prompts-version" ]; then
  old_version="$(cat .ai-prompts-version || true)"
  new_version="$(library_version)"
  if [ -n "$new_version" ] && [ "$old_version" != "$new_version" ]; then
    warn "library version changed: $old_version -> $new_version"
    if [ "$AUTO_FIX" -eq 1 ]; then
      echo "$new_version" > .ai-prompts-version
      pass "updated .ai-prompts-version"
    fi
  else
    pass "version tracking is current"
  fi
else
  warn ".ai-prompts-version missing"
  current_ver="$(library_version)"
  if [ -n "$current_ver" ] && [ "$AUTO_FIX" -eq 1 ]; then
    echo "$current_ver" > .ai-prompts-version
    pass "created .ai-prompts-version"
  fi
fi

if [ -f "AGENTS.md" ] && grep -q "AI Prompt Library Steering (Auto-Managed)" AGENTS.md; then
  pass "AGENTS.md steering block present"
  if grep -Eiq "continue automatically|stage-pipeline-orchestrator|auto-request-router|execution-orchestrator|quality-gate-orchestrator|task-generation-orchestrator" AGENTS.md; then
    fail "AGENTS.md steering block contains stale auto-advance or legacy orchestrator references"
  else
    pass "AGENTS.md steering block matches checkpoint-driven architecture"
  fi
else
  fail "AGENTS.md steering block missing"
fi

if [ -f ".vscode/settings.json" ] && grep -q "aiPromptLibrary.steeringPath" .vscode/settings.json; then
  pass ".vscode/settings.json steering path present"
else
  warn ".vscode/settings.json steering path missing"
fi

if [ -f "MY_PROJECT.md" ]; then
  if grep -Eiq '^##[[:space:]]+(Reference material|External material|Reference material / External material)' MY_PROJECT.md; then
    pass "MY_PROJECT.md has external/reference material section"
  else
    warn "MY_PROJECT.md missing Reference material / External material section"
  fi
else
  warn "MY_PROJECT.md missing"
fi

for steering_dir in .kiro/steering .cursor/rules .windsurf/rules .continue/rules .vscode/ai-steering .ai-steering; do
  [ -d "$steering_dir" ] || continue
  if grep -REiq "10-stage pipeline|stage-01-intake|COVE|continue automatically" "$steering_dir" 2>/dev/null; then
    fail "stale steering content found in $steering_dir"
  else
    pass "steering content current in $steering_dir"
  fi
done

if [ -f "$LIB_DIR/prompts/orchestrators/module-selection-index.md" ]; then
  missing_modules=0
  while IFS= read -r module_path; do
    [ -z "$module_path" ] && continue
    if [ ! -f "$LIB_DIR/${module_path#prompts/}" ] && [ ! -f "$LIB_DIR/$module_path" ]; then
      fail "module-selection-index references missing module: $module_path"
      missing_modules=$((missing_modules + 1))
    fi
  done < <(grep -Eo 'prompts/modules/[a-z0-9-]+/[a-z0-9-]+\.md' "$LIB_DIR/prompts/orchestrators/module-selection-index.md" | sort -u)
  [ "$missing_modules" -eq 0 ] && pass "module-selection-index paths resolve"
fi

if [ -x "$LIB_DIR/scripts/validate-safeguards.sh" ]; then
  pass "library safeguard validation script present"
else
  warn "validate-safeguards.sh not found/executable"
fi

if [ "$STRICT" -eq 1 ]; then
  echo
  echo "🔎 Strict output checks"
  echo "----------------------"

  CURRENT_OUT="prompts/outputs/current"
  if [ ! -d "$CURRENT_OUT" ]; then
    warn "$CURRENT_OUT not present"
  elif compgen -G "$CURRENT_OUT/tasks-*.md" >/dev/null || \
       compgen -G "$CURRENT_OUT/remediation-*.md" >/dev/null; then
    if "$LIB_DIR/scripts/validate-instantiation.sh" "$CURRENT_OUT"; then
      pass "active output instantiation validation passed"
    else
      fail "active output instantiation validation failed"
    fi
  else
    warn "$CURRENT_OUT has no tasks-*.md or remediation-*.md files"
  fi

  if [ -f "$CURRENT_OUT/epics.md" ] && [ ! -f "$CURRENT_OUT/brief-keywords.md" ]; then
    fail "greenfield output has epics.md but missing brief-keywords.md"
  fi
fi

echo
echo "Validation summary"
echo "------------------"
echo "Failures: $FAILURES"
echo "Warnings: $WARNINGS"

if [ "$FAILURES" -gt 0 ]; then
  exit 1
fi

echo "✅ Integration validation passed"
