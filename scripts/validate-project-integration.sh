#!/usr/bin/env bash
set -euo pipefail

# Validate project-level AI Prompt Library integration.
# Run from project root.

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
  --strict   Run strict output-quality checks in prompts/outputs if present
  --no-fix   Disable auto-heal bootstrap step
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

echo "🔄 AI Prompt Library integration validation"
echo "=========================================="

if [ ! -d "$LIB_DIR" ]; then
  fail ".ai-prompts directory not found"
  echo "Failures: $FAILURES"
  exit 1
fi
pass ".ai-prompts directory exists"

if [ "$AUTO_FIX" -eq 1 ] && [ -x "$LIB_DIR/scripts/bootstrap-project-integration.sh" ]; then
  "$LIB_DIR/scripts/bootstrap-project-integration.sh" >/dev/null 2>&1 || warn "bootstrap auto-fix returned non-zero"
fi

required_lib_files=(
  ".ai-prompts/prompts/orchestrators/ai-agent-entry-point.md"
  ".ai-prompts/prompts/orchestrators/auto-request-router.md"
  ".ai-prompts/prompts/orchestrators/stage-pipeline-orchestrator.md"
  ".ai-prompts/prompts/templates/prompt-composition-index-template.md"
  ".ai-prompts/prompts/templates/prompt-usage-log-template.md"
  ".ai-prompts/prompts/templates/integration-contracts-spec-template.md"
  ".ai-prompts/prompts/templates/api-delivery-plan-template.md"
  ".ai-prompts/prompts/templates/screen-fidelity-matrix-template.md"
  ".ai-prompts/prompts/templates/implementation-prompt-pack-template.md"
  ".ai-prompts/prompts/templates/design-system-foundation-template.md"
  ".ai-prompts/prompts/templates/design-system-component-catalog-template.md"
  ".ai-prompts/prompts/templates/design-system-implementation-sequencing-template.md"
  ".ai-prompts/prompts/templates/design-system-verification-report-template.md"
  ".ai-prompts/prompts/modules/design-system/component-implementation-sequencing.md"
  ".ai-prompts/prompts/modules/technology-stacks/mobile-flutter.md"
  ".ai-prompts/prompts/modules/technology-stacks/backend-firebase.md"
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
  new_version="$(cd "$LIB_DIR" && git rev-parse HEAD 2>/dev/null || echo "")"
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
  current_ver="$(cd "$LIB_DIR" && git rev-parse HEAD 2>/dev/null || echo "")"
  if [ -n "$current_ver" ] && [ "$AUTO_FIX" -eq 1 ]; then
    echo "$current_ver" > .ai-prompts-version
    pass "created .ai-prompts-version"
  fi
fi

if [ -f "AGENTS.md" ] && grep -q "AI Prompt Library Steering (Auto-Managed)" AGENTS.md; then
  pass "AGENTS.md steering block present"
else
  fail "AGENTS.md steering block missing"
fi

if [ -f ".vscode/settings.json" ] && grep -q "aiPromptLibrary.steeringPath" .vscode/settings.json; then
  pass ".vscode/settings.json steering path present"
else
  warn ".vscode/settings.json steering path missing"
fi

if [ -x "$LIB_DIR/scripts/validate-safeguards.sh" ]; then
  if (cd "$LIB_DIR" && ./scripts/validate-safeguards.sh >/dev/null 2>&1); then
    pass "library safeguard validation passed"
  else
    fail "library safeguard validation failed"
  fi
else
  warn "validate-safeguards.sh not found/executable"
fi

if [ -x "$LIB_DIR/.scripts/validate_cove.sh" ]; then
  if "$LIB_DIR/.scripts/validate_cove.sh" >/dev/null 2>&1; then
    pass "steering/COVE validation passed"
  else
    warn "steering/COVE validation failed"
  fi
fi

if [ "$STRICT" -eq 1 ] && [ -d "prompts/outputs" ]; then
  echo
  echo "🔎 Strict output checks"
  echo "----------------------"

  if [ -f "prompts/outputs/specifications/prompt-composition-index.md" ]; then
    while read -r output_file; do
      [ "$output_file" = "prompts/outputs/specifications/prompt-composition-index.md" ] && continue
      grep -Fq "$output_file" "prompts/outputs/specifications/prompt-composition-index.md" || \
        fail "composition index missing artifact row: $output_file"
    done < <(find prompts/outputs -type f -name "*.md" | sort)

    if grep -En "design-system\\*|task lists|deployment package|stage-01\\.\\.stage-10" \
      "prompts/outputs/specifications/prompt-composition-index.md" >/dev/null 2>&1; then
      fail "composition index contains grouped labels"
    else
      pass "composition index uses concrete artifact rows"
    fi

    if grep -En "\\(none listed\\)" "prompts/outputs/specifications/prompt-composition-index.md" >/dev/null 2>&1; then
      fail "composition index contains unresolved '(none listed)' prompt block rows"
    else
      pass "composition index does not contain unresolved prompt block rows"
    fi

    composition_prompt_path_failures=0
    while IFS= read -r row; do
      prompt_cell="$(printf '%s' "$row" | awk -F'|' '{gsub(/^[[:space:]]+|[[:space:]]+$/, "", $3); print $3}')"
      if ! printf '%s\n' "$prompt_cell" | grep -Eq "\\.ai-prompts/prompts/.+\\.md"; then
        fail "composition index row missing concrete prompt path: $row"
        composition_prompt_path_failures=$((composition_prompt_path_failures + 1))
      fi
    done < <(grep -E '^\|[[:space:]]*`prompts/outputs/.+`[[:space:]]*\|' "prompts/outputs/specifications/prompt-composition-index.md")
    [ "$composition_prompt_path_failures" -eq 0 ] && pass "composition index rows contain concrete prompt paths"
  else
    warn "prompt-composition-index.md not present (strict checks partial)"
  fi

  while read -r output_file; do
    grep -q "^## Prompt Blocks Applied" "$output_file" || fail "missing Prompt Blocks Applied: $output_file"
  done < <(find prompts/outputs -type f -name "*.md" | sort)
  pass "all generated markdown files include Prompt Blocks Applied"

  if [ -f "prompts/outputs/specifications/prompt-usage-log.md" ]; then
    if grep -En '^[[:space:]]*-[[:space:]]*(`)?\.ai-prompts/prompts/.+\.md(`)?$' \
      "prompts/outputs/specifications/prompt-usage-log.md" >/dev/null 2>&1; then
      pass "prompt usage log includes concrete prompt file paths"
    else
      fail "prompt usage log missing concrete prompt file paths"
    fi

    if grep -En '\*\.md|/\*|stage-[0-9]+\.\.|task lists|deployment package' \
      "prompts/outputs/specifications/prompt-usage-log.md" >/dev/null 2>&1; then
      fail "prompt usage log contains grouped/wildcard artifact references"
    else
      pass "prompt usage log uses concrete artifact references"
    fi
  fi

  # Stage 06 quality checks (if implementation prompt pack exists)
  if [ -f "prompts/outputs/implementation-prompts/prompt-pack-index.md" ]; then
    impl_prompt_files=()
    while IFS= read -r f; do
      impl_prompt_files+=("$f")
    done < <(find prompts/outputs/implementation-prompts -type f -name "*.md" ! -name "prompt-pack-index.md" | sort)

    if [ "${#impl_prompt_files[@]}" -eq 0 ]; then
      fail "implementation prompt pack index exists but per-task prompt files are missing"
    fi

    impl_placeholder_failures=0
    impl_prompt_block_failures=0
    impl_semantic_module_failures=0
    impl_stack_module_failures=0
    impl_keyword_semantic_failures=0
    for impl_file in "${impl_prompt_files[@]}"; do
      if grep -En "\\[implementation file paths for " "$impl_file" >/dev/null 2>&1 || \
         grep -En "\\[test file paths for " "$impl_file" >/dev/null 2>&1 || \
         grep -En "\\[project-specific lint/test/build commands for " "$impl_file" >/dev/null 2>&1 || \
         grep -En '^[[:space:]]*-[[:space:]]*\\[[:space:]]*$' "$impl_file" >/dev/null 2>&1; then
        fail "implementation prompt contains unresolved placeholders: $impl_file"
        impl_placeholder_failures=$((impl_placeholder_failures + 1))
      fi
      if ! grep -En '^[[:space:]]*-[[:space:]]*(`)?\.ai-prompts/prompts/.+\.md(`)?$' "$impl_file" >/dev/null 2>&1; then
        fail "implementation prompt missing concrete Prompt Blocks Applied entries: $impl_file"
        impl_prompt_block_failures=$((impl_prompt_block_failures + 1))
      fi

      # Require at least one semantic module lineage entry (non technology-stacks)
      if ! (grep -E '^[[:space:]]*-[[:space:]]*(`)?\.ai-prompts/prompts/modules/.+\.md(`)?$' "$impl_file" | \
        grep -Ev '/technology-stacks/' >/dev/null 2>&1); then
        fail "implementation prompt missing semantic module lineage: $impl_file"
        impl_semantic_module_failures=$((impl_semantic_module_failures + 1))
      fi

      # Require at least one technology-stack module lineage entry
      if ! grep -En '^[[:space:]]*-[[:space:]]*(`)?\.ai-prompts/prompts/modules/technology-stacks/.+\.md(`)?$' "$impl_file" >/dev/null 2>&1; then
        fail "implementation prompt missing technology-stack module lineage: $impl_file"
        impl_stack_module_failures=$((impl_stack_module_failures + 1))
      fi

      # Keyword-aligned semantic routing checks for common intents
      task_header="$(grep -m1 '^# Task Prompt:' "$impl_file" || true)"
      task_header_lc="$(printf '%s' "$task_header" | tr '[:upper:]' '[:lower:]')"

      if printf '%s' "$task_header_lc" | grep -Eq 'payment|checkout|payout|billing|stripe'; then
        if ! grep -En '^[[:space:]]*-[[:space:]]*(`)?\.ai-prompts/prompts/modules/(commerce/payment-processing|fintech/transaction-processing)\.md(`)?$' "$impl_file" >/dev/null 2>&1; then
          fail "implementation prompt missing payment semantic module for payment-like task: $impl_file"
          impl_keyword_semantic_failures=$((impl_keyword_semantic_failures + 1))
        fi
      fi

      if printf '%s' "$task_header_lc" | grep -Eq 'booking|schedule|availability|session'; then
        if ! grep -En '^[[:space:]]*-[[:space:]]*(`)?\.ai-prompts/prompts/modules/(integration/service-integration|integration/event-driven-architecture|location-services/booking-management)\.md(`)?$' "$impl_file" >/dev/null 2>&1; then
          fail "implementation prompt missing scheduling/booking semantic module for booking-like task: $impl_file"
          impl_keyword_semantic_failures=$((impl_keyword_semantic_failures + 1))
        fi
      fi

      if printf '%s' "$task_header_lc" | grep -Eq 'auth|oauth|rbac|role|claims|permission|login|sign[[:space:]-]?in|sign[[:space:]-]?up|access control'; then
        if ! grep -En '^[[:space:]]*-[[:space:]]*(`)?\.ai-prompts/prompts/modules/(feature-patterns/auth-oauth|feature-patterns/auth-rbac|security/advanced-authorization|security/multi-factor-auth|security/identity-federation)\.md(`)?$' "$impl_file" >/dev/null 2>&1; then
          fail "implementation prompt missing auth/authorization semantic module for auth-like task: $impl_file"
          impl_keyword_semantic_failures=$((impl_keyword_semantic_failures + 1))
        fi
      fi

      if printf '%s' "$task_header_lc" | grep -Eq 'profile|((user|student|tutor)[[:space:]-]?onboarding)|verification|avatar|bio|portfolio|certification|kyc'; then
        if ! grep -En '^[[:space:]]*-[[:space:]]*(`)?\.ai-prompts/prompts/modules/(social/user-profiles|social/user-verification)\.md(`)?$' "$impl_file" >/dev/null 2>&1; then
          fail "implementation prompt missing profile semantic module for profile-like task: $impl_file"
          impl_keyword_semantic_failures=$((impl_keyword_semantic_failures + 1))
        fi
      fi

      if printf '%s' "$task_header_lc" | grep -Eq 'discover|discovery|search|browse|catalog|recommend|listing|feed'; then
        if ! grep -En '^[[:space:]]*-[[:space:]]*(`)?\.ai-prompts/prompts/modules/(search-discovery/(full-text-search|semantic-search|recommendation-systems|search-personalization|faceted-search|search-analytics)|social/social-discovery|commerce/product-search)\.md(`)?$' "$impl_file" >/dev/null 2>&1; then
          fail "implementation prompt missing discovery/search semantic module for discovery-like task: $impl_file"
          impl_keyword_semantic_failures=$((impl_keyword_semantic_failures + 1))
        fi
      fi

      if printf '%s' "$task_header_lc" | grep -Eq 'analytics|metric|metrics|dashboard|report|reporting|insight|kpi|cohort'; then
        if ! grep -En '^[[:space:]]*-[[:space:]]*(`)?\.ai-prompts/prompts/modules/(analytics/(business-metrics|custom-reporting|user-analytics|cohort-analysis|real-time-analytics|predictive-analytics|privacy-analytics)|search-discovery/search-analytics|notifications/notification-analytics)\.md(`)?$' "$impl_file" >/dev/null 2>&1; then
          fail "implementation prompt missing analytics semantic module for analytics-like task: $impl_file"
          impl_keyword_semantic_failures=$((impl_keyword_semantic_failures + 1))
        fi
      fi

      if printf '%s' "$task_header_lc" | grep -Eq 'moderation|moderate|approve|reject|audit|compliance|review queue|review-queue|pending review'; then
        if ! grep -En '^[[:space:]]*-[[:space:]]*(`)?\.ai-prompts/prompts/modules/(content-management/content-moderation|social/content-moderation|social/communication-moderation|enterprise-saas/audit-trails)\.md(`)?$' "$impl_file" >/dev/null 2>&1; then
          fail "implementation prompt missing moderation/audit semantic module for moderation-like task: $impl_file"
          impl_keyword_semantic_failures=$((impl_keyword_semantic_failures + 1))
        fi
      fi

      if printf '%s' "$task_header_lc" | grep -Eq 'notification|webhook|dispatch|event'; then
        if ! grep -En '^[[:space:]]*-[[:space:]]*(`)?\.ai-prompts/prompts/modules/(integration/webhook-systems|integration/event-driven-architecture|real-time-communication/real-time-sync)\.md(`)?$' "$impl_file" >/dev/null 2>&1; then
          fail "implementation prompt missing notification/event semantic module for notification-like task: $impl_file"
          impl_keyword_semantic_failures=$((impl_keyword_semantic_failures + 1))
        fi
      fi

      if printf '%s' "$task_header_lc" | grep -Eq 'design-system|component|screen|ui'; then
        if ! grep -En '^[[:space:]]*-[[:space:]]*(`)?\.ai-prompts/prompts/modules/design-system/.+\.md(`)?$' "$impl_file" >/dev/null 2>&1; then
          fail "implementation prompt missing design-system semantic module for UI-like task: $impl_file"
          impl_keyword_semantic_failures=$((impl_keyword_semantic_failures + 1))
        fi
      fi
    done
    [ "$impl_placeholder_failures" -eq 0 ] && pass "implementation prompts contain no unresolved placeholder blocks"
    [ "$impl_prompt_block_failures" -eq 0 ] && pass "implementation prompts include concrete prompt block lineage"
    [ "$impl_semantic_module_failures" -eq 0 ] && pass "implementation prompts include semantic module lineage"
    [ "$impl_stack_module_failures" -eq 0 ] && pass "implementation prompts include technology-stack module lineage"
    [ "$impl_keyword_semantic_failures" -eq 0 ] && pass "implementation prompts include keyword-aligned semantic modules"

    # Prompt-pack index must include semantic + stack columns and concrete prompt paths.
    if ! grep -Eq '^\|[[:space:]]*Task ID[[:space:]]*\|[[:space:]]*Prompt File[[:space:]]*\|[[:space:]]*Semantic Prompt Blocks[[:space:]]*\|[[:space:]]*Stack Prompt Blocks[[:space:]]*\|[[:space:]]*Depends On[[:space:]]*\|[[:space:]]*Status[[:space:]]*\|' \
      "prompts/outputs/implementation-prompts/prompt-pack-index.md"; then
      fail "prompt-pack-index missing required semantic/stack module columns"
    else
      prompt_pack_semantic_stack_failures=0
      while IFS= read -r row; do
        semantic_cell="$(printf '%s' "$row" | awk -F'|' '{gsub(/^[[:space:]]+|[[:space:]]+$/, "", $4); print $4}')"
        stack_cell="$(printf '%s' "$row" | awk -F'|' '{gsub(/^[[:space:]]+|[[:space:]]+$/, "", $5); print $5}')"

        if ! printf '%s\n' "$semantic_cell" | grep -Eq '\.ai-prompts/prompts/modules/.+\.md'; then
          fail "prompt-pack-index row missing concrete semantic module path: $row"
          prompt_pack_semantic_stack_failures=$((prompt_pack_semantic_stack_failures + 1))
        fi
        if ! printf '%s\n' "$stack_cell" | grep -Eq '\.ai-prompts/prompts/modules/technology-stacks/.+\.md'; then
          fail "prompt-pack-index row missing concrete stack module path: $row"
          prompt_pack_semantic_stack_failures=$((prompt_pack_semantic_stack_failures + 1))
        fi
      done < <(grep -E '^\|[[:space:]]*[A-Z]-[0-9]+\.[0-9]+[[:space:]]*\|' "prompts/outputs/implementation-prompts/prompt-pack-index.md")
      [ "${prompt_pack_semantic_stack_failures:-0}" -eq 0 ] && pass "prompt-pack-index includes concrete semantic/stack module mappings"
    fi

    # Every task in task lists must map to a prompt-pack index row.
    prompt_pack_missing_rows=0
    for task_file in prompts/outputs/task-lists/*-tasks.md; do
      [ -f "$task_file" ] || continue
      while IFS= read -r task_id; do
        if ! grep -Eq "^\\|[[:space:]]*${task_id}[[:space:]]*\\|" "prompts/outputs/implementation-prompts/prompt-pack-index.md"; then
          fail "prompt-pack-index missing row for task ID ${task_id} from ${task_file}"
          prompt_pack_missing_rows=$((prompt_pack_missing_rows + 1))
        fi
      done < <(grep -E "^### Task [A-Z]-[0-9]+\\.[0-9]+:" "$task_file" | sed -E 's/^### Task ([A-Z]-[0-9]+\.[0-9]+):.*/\1/')
    done
    [ "$prompt_pack_missing_rows" -eq 0 ] && pass "prompt-pack-index maps task IDs from generated task lists"
  fi

  # Task-list structural checks (if Stage 06 task tracks exist)
  task_list_field_failures=0
  for task_file in prompts/outputs/task-lists/*-tasks.md; do
    [ -f "$task_file" ] || continue
    task_count="$(grep -c '^### Task ' "$task_file" || true)"
    [ "$task_count" -eq 0 ] && continue

    dep_count="$(grep -c '^Dependencies:' "$task_file" || true)"
    ref_count="$(grep -c '^References:' "$task_file" || true)"
    ac_count="$(grep -c '^Acceptance Criteria:' "$task_file" || true)"
    vc_count="$(grep -c '^Validation Commands:' "$task_file" || true)"

    if [ "$dep_count" -lt "$task_count" ]; then
      fail "task file missing Dependencies fields for some tasks: $task_file"
      task_list_field_failures=$((task_list_field_failures + 1))
    fi
    if [ "$ref_count" -lt "$task_count" ]; then
      fail "task file missing References fields for some tasks: $task_file"
      task_list_field_failures=$((task_list_field_failures + 1))
    fi
    if [ "$ac_count" -lt "$task_count" ]; then
      fail "task file missing Acceptance Criteria fields for some tasks: $task_file"
      task_list_field_failures=$((task_list_field_failures + 1))
    fi
    if [ "$vc_count" -lt "$task_count" ]; then
      fail "task file missing Validation Commands fields for some tasks: $task_file"
      task_list_field_failures=$((task_list_field_failures + 1))
    fi
  done
  [ "$task_list_field_failures" -eq 0 ] && pass "task-list files include core fields per task"

  # Design-system-first check for UI task tracks (if present)
  ui_track_failures=0
  ui_scope_detected=0
  if [ -f "prompts/outputs/specifications/screen-fidelity-matrix.md" ] || \
     [ -f "prompts/outputs/task-lists/mobile-app-tasks.md" ] || \
     [ -f "prompts/outputs/task-lists/admin-web-tasks.md" ] || \
     [ -f "prompts/outputs/task-lists/web-tasks.md" ]; then
    ui_scope_detected=1
  fi
  for ui_track in prompts/outputs/task-lists/mobile-app-tasks.md prompts/outputs/task-lists/admin-web-tasks.md; do
    [ -f "$ui_track" ] || continue
    if ! head -n 140 "$ui_track" | grep -Eiq "design system|design-system|token|component primitive"; then
      fail "UI task track does not include early design-system/component foundation tasks: $ui_track"
      ui_track_failures=$((ui_track_failures + 1))
    fi
  done
  [ "$ui_track_failures" -eq 0 ] && pass "UI task tracks include early design-system/component foundation planning"

  # UI scope design-system template utilization and outputs
  if [ "$ui_scope_detected" -eq 1 ]; then
    ds_scope_failures=0
    if [ ! -f "prompts/outputs/specifications/design-system-foundation.md" ]; then
      fail "UI scope requires design-system-foundation.md"
      ds_scope_failures=$((ds_scope_failures + 1))
    fi
    if [ ! -f "prompts/outputs/specifications/design-system-component-catalog.md" ]; then
      fail "UI scope requires design-system-component-catalog.md"
      ds_scope_failures=$((ds_scope_failures + 1))
    fi

    if [ -f "prompts/outputs/specifications/design-system-foundation.md" ] && \
       ! grep -Fq ".ai-prompts/prompts/templates/design-system-foundation-template.md" "prompts/outputs/specifications/design-system-foundation.md"; then
      fail "design-system-foundation.md missing foundation template lineage"
      ds_scope_failures=$((ds_scope_failures + 1))
    fi

    if [ -f "prompts/outputs/specifications/design-system-component-catalog.md" ] && \
       ! grep -Fq ".ai-prompts/prompts/templates/design-system-component-catalog-template.md" "prompts/outputs/specifications/design-system-component-catalog.md"; then
      fail "design-system-component-catalog.md missing component-catalog template lineage"
      ds_scope_failures=$((ds_scope_failures + 1))
    fi

    if [ -f "prompts/outputs/task-lists/mobile-app-tasks.md" ] || \
       [ -f "prompts/outputs/task-lists/admin-web-tasks.md" ] || \
       [ -f "prompts/outputs/task-lists/web-tasks.md" ]; then
      if [ ! -f "prompts/outputs/specifications/design-system-implementation-sequencing.md" ]; then
        fail "UI implementation scope requires design-system-implementation-sequencing.md"
        ds_scope_failures=$((ds_scope_failures + 1))
      fi
      if [ -f "prompts/outputs/specifications/design-system-implementation-sequencing.md" ] && \
         ! grep -Fq ".ai-prompts/prompts/templates/design-system-implementation-sequencing-template.md" "prompts/outputs/specifications/design-system-implementation-sequencing.md"; then
        fail "design-system-implementation-sequencing.md missing sequencing template lineage"
        ds_scope_failures=$((ds_scope_failures + 1))
      fi
    fi

    if [ -f "prompts/outputs/quality/final-verification-summary.md" ]; then
      if [ ! -f "prompts/outputs/quality/design-system-verification-report.md" ]; then
        fail "Stage 09 UI scope requires design-system-verification-report.md"
        ds_scope_failures=$((ds_scope_failures + 1))
      fi
      if [ -f "prompts/outputs/quality/design-system-verification-report.md" ] && \
         ! grep -Fq ".ai-prompts/prompts/templates/design-system-verification-report-template.md" "prompts/outputs/quality/design-system-verification-report.md"; then
        fail "design-system-verification-report.md missing verification template lineage"
        ds_scope_failures=$((ds_scope_failures + 1))
      fi
    fi

    [ "$ds_scope_failures" -eq 0 ] && pass "UI scope design-system outputs and template lineage checks passed"
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
