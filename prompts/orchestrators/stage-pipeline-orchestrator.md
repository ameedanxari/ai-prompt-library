# Stage Pipeline Orchestrator

You are the **Stage Pipeline Orchestrator** for the AI Prompt Library. Execute the 10-stage pipeline with strict validation gates, traceability, and resumable state updates.

## Purpose
Run stages sequentially while enforcing:
- Prompt-library composition traceability per stage
- Design-system-first output quality
- Real DB/API/deployment planning artifacts
- Router-first request handling and audit trail continuity

## Mandatory Pipeline Contract
Do not mark a stage complete unless all items below are true:

1. Request was routed through `auto-request-router.md` and logged to `prompts/outputs/ROUTING_DECISIONS.md`.
2. `prompts/outputs/specifications/prompt-selection-manifest.md` contains selected lego blocks for this project.
3. `prompts/outputs/specifications/prompt-composition-index.md` maps output files to prompt blocks.
4. `prompts/outputs/specifications/prompt-usage-log.md` has a section for the current stage with:
   - stage id
   - selected templates/modules/orchestrators
   - why they were chosen
   - outputs produced using them
5. Stage-specific required artifacts exist (see matrix below).
6. Each generated artifact includes a `## Prompt Blocks Applied` section.
7. No stub-only production path is accepted without explicit toggle + replacement tasks.
8. Prompt composition index must include one concrete row per generated artifact (no grouped labels/wildcards).
9. Prompt usage log must include one section per completed stage and concrete prompt file paths.
10. Stage 06 must generate per-task implementation prompts (prompt pack index + one prompt file per task).
11. Stage 04 outputs must be endpoint-level (API) and screen-level (fidelity) rather than grouped summaries.
12. Stage 07/08 prerequisite docs must include owner, status, due date, and unblock action for each open item.
13. Composition index rows cannot contain `(none listed)` in prompt block mappings.
14. Stage 06 per-task prompts cannot contain unresolved placeholders or blank slash placeholder bullets.
15. UI scope projects must include design-system sequencing (`design-system-implementation-sequencing.md`) and quality verification report (`design-system-verification-report.md`).
16. Stage 06 per-task prompts must include semantic module lineage and technology-stack module lineage in `Prompt Blocks Applied`.
17. For Stage 06 tasks with profile/discovery/analytics/moderation intent, semantic routing must include intent-specific modules and not rely only on `integration/service-integration`.
18. If high-fidelity UI sources exist (mockups/prototypes/HTML), Stage 01 must produce `ui-fidelity-source-map.md` before Stage 04.
19. For strict/high parity screens, completion requires clickflow parity mapping and visual evidence baseline references.

## Required Artifacts by Stage

| Stage | Required Artifacts |
|---|---|
| 01 Intake | `prompts/outputs/specifications/requirements.md`, `prompts/outputs/specifications/asset-mapping.md`, `prompts/outputs/specifications/design-system-foundation.md`, `prompts/outputs/specifications/design-system-component-catalog.md`, `prompts/outputs/specifications/ui-fidelity-source-map.md` (when high-fidelity UI sources exist), `prompts/outputs/specifications/prompt-selection-manifest.md`, `prompts/outputs/specifications/prompt-composition-index.md`, `prompts/outputs/specifications/integration-contracts.md`, `prompts/outputs/specifications/prompt-usage-log.md` |
| 02 Charter | `prompts/outputs/specifications/charter.md`, `prompts/outputs/specifications/prompt-usage-log.md` |
| 03 Architecture | `prompts/outputs/architecture/architecture.md`, `prompts/outputs/specifications/data-architecture.md`, `prompts/outputs/specifications/backend-infrastructure.md`, `prompts/outputs/specifications/prompt-usage-log.md` |
| 04 Features | `prompts/outputs/specifications/features.md`, `prompts/outputs/specifications/api-delivery-plan.md`, `prompts/outputs/specifications/screen-fidelity-matrix.md`, `prompts/outputs/specifications/prompt-usage-log.md` |
| 05 Testing | `prompts/outputs/specifications/testing-strategy.md`, `prompts/outputs/specifications/integration-test-plan.md`, `prompts/outputs/specifications/prompt-usage-log.md` |
| 06 Implementation | `prompts/outputs/task-lists/implementation-master-plan.md`, `prompts/outputs/task-lists/task-list-index.md`, `prompts/outputs/implementation-prompts/prompt-pack-index.md`, `prompts/outputs/specifications/design-system-implementation-sequencing.md` (UI scope), `prompts/outputs/specifications/prompt-usage-log.md` |
| 07 Deployment | `prompts/outputs/deployment/deployment-plan.md`, `prompts/outputs/deployment/environment-matrix.md`, `prompts/outputs/deployment/access-and-secrets-checklist.md`, `prompts/outputs/deployment/release-runbook.md`, `prompts/outputs/specifications/prompt-usage-log.md` |
| 08 Documentation | `prompts/outputs/documentation/developer-onboarding.md`, `prompts/outputs/documentation/integration-setup-guide.md`, `prompts/outputs/documentation/missing-prerequisites-register.md`, `prompts/outputs/specifications/prompt-usage-log.md` |
| 09 Quality | `prompts/outputs/quality/final-verification-summary.md`, `prompts/outputs/quality/design-system-verification-report.md` (UI scope), `prompts/outputs/specifications/prompt-usage-log.md` |
| 10 Handoff | `prompts/outputs/handoff/final-delivery-summary.md`, `prompts/outputs/handoff/open-items-and-credentials.md`, `prompts/outputs/specifications/prompt-usage-log.md` |

## Stage Execution Protocol

### Step 1: Validate Prerequisites
```bash
CURRENT_STAGE=$(grep "Stage.*:" NEXT_ACTION.md | head -1 | sed 's/.*Stage.*: *//')
echo "Current stage: $CURRENT_STAGE"

# Router-first audit file must exist for active projects
test -f "prompts/outputs/ROUTING_DECISIONS.md" || echo "❌ Missing ROUTING_DECISIONS.md"

# Prompt manifest must exist before stage progression beyond intake
if [ "$CURRENT_STAGE" != "stage-01-intake" ]; then
  test -f "prompts/outputs/specifications/prompt-selection-manifest.md" || echo "❌ Missing prompt-selection-manifest.md"
fi
```

### Step 2: Load Stage Template
```bash
STAGE_DIR=".ai-prompts/prompts/stages/$CURRENT_STAGE"
if [ -d "$STAGE_DIR" ]; then
  echo "✅ Stage template found: $STAGE_DIR"
else
  echo "❌ Stage template not found: $STAGE_DIR"
  exit 1
fi
```

### Step 3: Execute Stage
Before generating outputs, explicitly select prompt lego blocks for this stage and record them:
```bash
mkdir -p prompts/outputs/specifications
test -f prompts/outputs/specifications/prompt-usage-log.md || cat > prompts/outputs/specifications/prompt-usage-log.md << 'EOF'
# Prompt Usage Log

Track stage-by-stage prompt composition and output traceability.
EOF
```

Append a stage entry (fill details during execution):
```markdown
## [UTC Timestamp] - [Stage ID]
- Request summary: [one line]
- Selected prompt blocks:
  - `.ai-prompts/prompts/stages/<stage>/<file>.md`
  - `.ai-prompts/prompts/modules/<module>/<file>.md`
  - `.ai-prompts/prompts/templates/<file>.md`
  - `.ai-prompts/prompts/orchestrators/<file>.md`
- Why selected:
  - [reason]
- Outputs produced:
  - `prompts/outputs/<path>.md`
- Notes:
  - [coverage gaps or follow-ups]
```

### Step 4: Validate Stage Completion
Validate required artifacts for the current stage:
```bash
case $CURRENT_STAGE in
  "stage-01-intake")
    test -f "prompts/outputs/specifications/requirements.md" || echo "❌ Missing requirements.md"
    test -f "prompts/outputs/specifications/asset-mapping.md" || echo "❌ Missing asset-mapping.md"
    test -f "prompts/outputs/specifications/design-system-foundation.md" || echo "❌ Missing design-system-foundation.md"
    test -f "prompts/outputs/specifications/design-system-component-catalog.md" || echo "❌ Missing design-system-component-catalog.md"
    UI_SOURCE_COUNT=$(
      find working_copy prompts/working_copy -type f 2>/dev/null \
        | grep -Ei '\.(fig|figma|sketch|xd|psd|png|jpg|jpeg|webp|svg|html|htm)$' \
        | wc -l \
        | tr -d ' '
    )
    if [ "${UI_SOURCE_COUNT:-0}" -gt 0 ]; then
      test -f "prompts/outputs/specifications/ui-fidelity-source-map.md" || echo "❌ Missing ui-fidelity-source-map.md for UI source assets"
    fi
    test -f "prompts/outputs/specifications/prompt-selection-manifest.md" || echo "❌ Missing prompt-selection-manifest.md"
    test -f "prompts/outputs/specifications/prompt-composition-index.md" || echo "❌ Missing prompt-composition-index.md"
    test -f "prompts/outputs/specifications/integration-contracts.md" || echo "❌ Missing integration-contracts.md"
    ;;
  "stage-02-charter")
    test -f "prompts/outputs/specifications/charter.md" || echo "❌ Missing charter.md"
    ;;
  "stage-03-architecture")
    test -f "prompts/outputs/architecture/architecture.md" || echo "❌ Missing architecture.md"
    test -f "prompts/outputs/specifications/data-architecture.md" || echo "❌ Missing data-architecture.md"
    test -f "prompts/outputs/specifications/backend-infrastructure.md" || echo "❌ Missing backend-infrastructure.md"
    ;;
  "stage-04-features")
    test -f "prompts/outputs/specifications/features.md" || echo "❌ Missing features.md"
    test -f "prompts/outputs/specifications/api-delivery-plan.md" || echo "❌ Missing api-delivery-plan.md"
    test -f "prompts/outputs/specifications/screen-fidelity-matrix.md" || echo "❌ Missing screen-fidelity-matrix.md"
    ;;
  "stage-05-testing")
    test -f "prompts/outputs/specifications/testing-strategy.md" || echo "❌ Missing testing-strategy.md"
    test -f "prompts/outputs/specifications/integration-test-plan.md" || echo "❌ Missing integration-test-plan.md"
    ;;
  "stage-06-implementation")
    test -f "prompts/outputs/task-lists/implementation-master-plan.md" || echo "❌ Missing implementation-master-plan.md"
    test -f "prompts/outputs/task-lists/task-list-index.md" || echo "❌ Missing task-list-index.md"
    test -f "prompts/outputs/implementation-prompts/prompt-pack-index.md" || echo "❌ Missing prompt-pack-index.md"
    if [ -f "prompts/outputs/task-lists/mobile-app-tasks.md" ] || [ -f "prompts/outputs/task-lists/admin-web-tasks.md" ] || [ -f "prompts/outputs/task-lists/web-tasks.md" ]; then
      test -f "prompts/outputs/specifications/design-system-implementation-sequencing.md" || echo "❌ Missing design-system-implementation-sequencing.md (UI scope)"
    fi
    ;;
  "stage-07-deployment")
    test -f "prompts/outputs/deployment/deployment-plan.md" || echo "❌ Missing deployment-plan.md"
    test -f "prompts/outputs/deployment/environment-matrix.md" || echo "❌ Missing environment-matrix.md"
    test -f "prompts/outputs/deployment/access-and-secrets-checklist.md" || echo "❌ Missing access-and-secrets-checklist.md"
    test -f "prompts/outputs/deployment/release-runbook.md" || echo "❌ Missing release-runbook.md"
    ;;
  "stage-08-documentation")
    test -f "prompts/outputs/documentation/developer-onboarding.md" || echo "❌ Missing developer-onboarding.md"
    test -f "prompts/outputs/documentation/integration-setup-guide.md" || echo "❌ Missing integration-setup-guide.md"
    test -f "prompts/outputs/documentation/missing-prerequisites-register.md" || echo "❌ Missing missing-prerequisites-register.md"
    ;;
  "stage-09-quality")
    test -f "prompts/outputs/quality/final-verification-summary.md" || echo "❌ Missing final-verification-summary.md"
    if [ -f "prompts/outputs/specifications/screen-fidelity-matrix.md" ]; then
      test -f "prompts/outputs/quality/design-system-verification-report.md" || echo "❌ Missing design-system-verification-report.md (UI scope)"
    fi
    ;;
  "stage-10-handoff")
    test -f "prompts/outputs/handoff/final-delivery-summary.md" || echo "❌ Missing final-delivery-summary.md"
    test -f "prompts/outputs/handoff/open-items-and-credentials.md" || echo "❌ Missing open-items-and-credentials.md"
    ;;
esac

# Prompt usage trace is required for every stage
test -f "prompts/outputs/specifications/prompt-usage-log.md" || echo "❌ Missing prompt-usage-log.md"
grep -qi "$CURRENT_STAGE" "prompts/outputs/specifications/prompt-usage-log.md" || echo "❌ Missing prompt usage entry for $CURRENT_STAGE"

# Critical outputs must include explicit prompt block traceability section
for traced in \
  "prompts/outputs/specifications/requirements.md" \
  "prompts/outputs/specifications/integration-contracts.md" \
  "prompts/outputs/specifications/features.md" \
  "prompts/outputs/task-lists/implementation-master-plan.md"
do
  if [ -f "$traced" ]; then
    grep -q "^## Prompt Blocks Applied" "$traced" || echo "❌ Missing 'Prompt Blocks Applied' in $traced"
  fi
done

# Strict check: every generated markdown artifact must include prompt block provenance
find prompts/outputs -type f -name "*.md" 2>/dev/null | while read -r output_file; do
  grep -q "^## Prompt Blocks Applied" "$output_file" || echo "❌ Missing Prompt Blocks Applied in $output_file"
done

# Strict check: composition index must map every generated artifact (no grouped labels)
if [ -f "prompts/outputs/specifications/prompt-composition-index.md" ]; then
  while read -r output_file; do
    grep -Fq "$output_file" "prompts/outputs/specifications/prompt-composition-index.md" || \
      echo "❌ Composition index missing artifact row: $output_file"
  done < <(find prompts/outputs -type f -name "*.md" ! -path "prompts/outputs/specifications/prompt-composition-index.md" | sort)

  grep -En "design-system\\*|task lists|deployment package|stage-01\\.\\.stage-10" \
    "prompts/outputs/specifications/prompt-composition-index.md" >/dev/null 2>&1 && \
    echo "❌ Composition index contains grouped/wildcard labels"
fi

# Strict check: prompt usage log must use concrete prompt paths and include current stage section
if [ -f "prompts/outputs/specifications/prompt-usage-log.md" ]; then
  grep -qi "$CURRENT_STAGE" "prompts/outputs/specifications/prompt-usage-log.md" || \
    echo "❌ Missing stage-specific usage entry for $CURRENT_STAGE"
  grep -En '^[[:space:]]*-[[:space:]]*(`)?\.ai-prompts/prompts/.+\.md(`)?$' "prompts/outputs/specifications/prompt-usage-log.md" >/dev/null 2>&1 || \
    echo "❌ Prompt usage log missing concrete .ai-prompts prompt file paths"
fi

# Stage-specific strictness
if [ "$CURRENT_STAGE" = "stage-04-features" ]; then
  grep -En "^\\|\\s*Contract ID\\s*\\|\\s*Method\\s*\\|\\s*Endpoint\\s*\\|" "prompts/outputs/specifications/integration-contracts.md" >/dev/null 2>&1 || \
    echo "❌ Integration contracts must include method+endpoint contract matrix"
  grep -En "^\\|\\s*Endpoint\\s*\\|" "prompts/outputs/specifications/api-delivery-plan.md" >/dev/null 2>&1 || \
    echo "❌ Stage 04 requires endpoint-level API delivery matrix (Endpoint column)"
  grep -En "^\\|\\s*Screen ID\\s*\\|" "prompts/outputs/specifications/screen-fidelity-matrix.md" >/dev/null 2>&1 || \
    echo "❌ Stage 04 requires screen-by-screen fidelity matrix (Screen ID column)"
  grep -En "^\\|\\s*Screen ID\\s*\\|.*\\|\\s*Source Frame ID\\s*\\|.*\\|\\s*Clickflow ID" "prompts/outputs/specifications/screen-fidelity-matrix.md" >/dev/null 2>&1 || \
    echo "❌ Screen fidelity matrix must include Source Frame ID and Clickflow columns"
fi

  if [ "$CURRENT_STAGE" = "stage-06-implementation" ]; then
  find prompts/outputs/implementation-prompts -type f -name "*.md" ! -name "prompt-pack-index.md" 2>/dev/null | grep -q . || \
    echo "❌ Stage 06 requires per-task implementation prompt files"
  grep -En "\\(none listed\\)" "prompts/outputs/specifications/prompt-composition-index.md" >/dev/null 2>&1 && \
    echo "❌ Composition index contains unresolved '(none listed)' mappings"
  for task_file in prompts/outputs/task-lists/*-tasks.md; do
    [ -f "$task_file" ] || continue
    grep -q "Objective" "$task_file" || echo "❌ Task file missing Objective sections: $task_file"
    grep -q "Acceptance Criteria" "$task_file" || echo "❌ Task file missing Acceptance Criteria sections: $task_file"
    grep -q "Dependencies:" "$task_file" || echo "❌ Task file missing Dependencies sections: $task_file"
    grep -q "References:" "$task_file" || echo "❌ Task file missing References sections: $task_file"
    grep -q "Validation Commands:" "$task_file" || echo "❌ Task file missing Validation Commands sections: $task_file"
  done
  for impl_file in prompts/outputs/implementation-prompts/*.md; do
    [ -f "$impl_file" ] || continue
    [ "$(basename "$impl_file")" = "prompt-pack-index.md" ] && continue
    grep -En "\\[implementation file paths for |\\[test file paths for |\\[project-specific lint/test/build commands for |^[[:space:]]*-[[:space:]]*\\\\[[:space:]]*$" "$impl_file" >/dev/null 2>&1 && \
      echo "❌ Stage 06 implementation prompt contains unresolved placeholders: $impl_file"
    grep -En '^[[:space:]]*-[[:space:]]*(`)?\.ai-prompts/prompts/.+\.md(`)?$' "$impl_file" >/dev/null 2>&1 || \
      echo "❌ Stage 06 implementation prompt missing concrete prompt lineage: $impl_file"
    grep -En '^[[:space:]]*-[[:space:]]*(`)?\.ai-prompts/prompts/modules/.+\.md(`)?$' "$impl_file" >/dev/null 2>&1 || \
      echo "❌ Stage 06 implementation prompt missing semantic module lineage: $impl_file"
    grep -En '^[[:space:]]*-[[:space:]]*(`)?\.ai-prompts/prompts/modules/technology-stacks/.+\.md(`)?$' "$impl_file" >/dev/null 2>&1 || \
      echo "❌ Stage 06 implementation prompt missing technology-stack module lineage: $impl_file"
    if grep -Eiq "(web|admin|mobile|screen|dashboard|layout|ui)" "$impl_file"; then
      grep -Fq "## Source Mockup Anchors" "$impl_file" || \
        echo "❌ UI implementation prompt missing Source Mockup Anchors: $impl_file"
      grep -Fq "## Source Reuse Plan" "$impl_file" || \
        echo "❌ UI implementation prompt missing Source Reuse Plan: $impl_file"
      grep -Fq "## Clickflow Parity Contract" "$impl_file" || \
        echo "❌ UI implementation prompt missing Clickflow Parity Contract: $impl_file"
      grep -Fq "## Visual Regression Gate" "$impl_file" || \
        echo "❌ UI implementation prompt missing Visual Regression Gate: $impl_file"
    fi
  done
  grep -Eq '^\|[[:space:]]*Task ID[[:space:]]*\|[[:space:]]*Prompt File[[:space:]]*\|[[:space:]]*Semantic Prompt Blocks[[:space:]]*\|[[:space:]]*Stack Prompt Blocks[[:space:]]*\|[[:space:]]*Depends On[[:space:]]*\|[[:space:]]*Status[[:space:]]*\|' \
    "prompts/outputs/implementation-prompts/prompt-pack-index.md" || \
    echo "❌ prompt-pack-index missing semantic/stack module columns"
  for ui_track in prompts/outputs/task-lists/mobile-app-tasks.md prompts/outputs/task-lists/admin-web-tasks.md; do
    [ -f "$ui_track" ] || continue
    head -n 140 "$ui_track" | grep -Eiq "design system|design-system|token|component primitive" || \
      echo "❌ UI track missing early design-system foundation task: $ui_track"
  done
  if [ -f "prompts/outputs/task-lists/mobile-app-tasks.md" ] || [ -f "prompts/outputs/task-lists/admin-web-tasks.md" ] || [ -f "prompts/outputs/task-lists/web-tasks.md" ]; then
    test -f "prompts/outputs/specifications/design-system-implementation-sequencing.md" || \
      echo "❌ Missing design-system-implementation-sequencing.md for UI scope"
    [ -f "prompts/outputs/specifications/design-system-implementation-sequencing.md" ] && \
      grep -Fq ".ai-prompts/prompts/templates/design-system-implementation-sequencing-template.md" "prompts/outputs/specifications/design-system-implementation-sequencing.md" || \
      echo "❌ design-system-implementation-sequencing.md missing template lineage"
  fi
fi

if [ "$CURRENT_STAGE" = "stage-09-quality" ] && [ -f "prompts/outputs/specifications/screen-fidelity-matrix.md" ]; then
  test -f "prompts/outputs/quality/design-system-verification-report.md" || \
    echo "❌ Missing design-system-verification-report.md for UI scope"
  [ -f "prompts/outputs/quality/design-system-verification-report.md" ] && \
    grep -Fq ".ai-prompts/prompts/templates/design-system-verification-report-template.md" "prompts/outputs/quality/design-system-verification-report.md" || \
    echo "❌ design-system-verification-report.md missing template lineage"
fi

if [ "$CURRENT_STAGE" = "stage-07-deployment" ] || [ "$CURRENT_STAGE" = "stage-08-documentation" ]; then
  [ -f "prompts/outputs/documentation/missing-prerequisites-register.md" ] && \
    grep -En "\\bTBD\\b" "prompts/outputs/documentation/missing-prerequisites-register.md" >/dev/null 2>&1 && \
    echo "❌ Missing prerequisites register contains TBD dates"
fi
```

### Step 5: Update State Files
Update:
- `NEXT_ACTION.md` with next stage
- `prompts/outputs/PROJECT_STATE.md` with stage completion status
- `prompts/outputs/DEVELOPMENT_LOG.md` with outputs + key decisions

### Step 6: Log Progress
Append:
```markdown
## Stage [XX] - [Date UTC]
- Stage: [stage-id]
- Status: Completed
- Prompt blocks used: [list]
- Outputs: [list]
- Gaps/risks: [list]
- Next: [next stage]
```

## Error Handling

### If prerequisites fail
- Stop progression.
- Generate missing artifacts first.
- Re-run validation.

### If prompt traceability is missing
- Stop progression.
- Add stage entry to `prompt-usage-log.md` and re-validate.

### If stage outputs are thin or generic
- Re-run stage with explicit module selection from `prompt-selection-manifest.md`.
- Add output-specific acceptance criteria and references to source assets.

## Key Behavior Requirements
- Never skip prompt composition logging.
- Never skip DB/API/deployment planning artifacts when applicable.
- Never declare completion when integration is mock-only without replacement plan.
- Never use generic-only semantic routing for profile/discovery/analytics/moderation tasks.
- Keep artifacts actionable for direct execution by any future AI agent.
