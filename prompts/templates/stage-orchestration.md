# Stage Orchestration Prompts

## Purpose
Manage sequential execution of development stages, ensuring proper dependency validation, context preservation, and quality gates between stages.

## Instructions
Use these prompts to orchestrate the execution of development stages from intake through handoff. Ensure each stage builds incrementally on previous stages while maintaining comprehensive context and validation.

## Examples
```markdown
## Example Stage Orchestration

### Current Stage: Stage 03 - Architecture
**Previous Stage**: Stage 02 - Charter (✅ Complete)
**Prerequisites Check**:
- ✅ Charter approved with scope definition
- ✅ Technology stack decisions documented
- ✅ Platform requirements validated
- ✅ Context summary updated

**Stage 03 Execution**:
1. **Pre-Stage Validation**: All prerequisites met
2. **Stage Processing**: Generate architecture files for web.md, mobile.md, platform-agnostic.md
3. **Post-Stage Validation**: Architecture decisions documented, quality gates passed
4. **Context Handoff**: Updated context for Stage 04 - Features

**Output**: Architecture specifications ready for feature development stage
```

## Sequential Stage Execution Prompt

You are managing the sequential execution of development stages for the AI Prompt Library system. Your role is to ensure each stage builds incrementally on previous stages while maintaining comprehensive context and validation.

### Current Stage Execution Protocol

**Input Requirements:**
- Current stage identifier (stage-01-intake through stage-10-handoff)
- Previous stage outputs and context summary
- Project configuration and user requirements
- Asset inventory from working_copy

**Execution Steps:**

1. **Pre-Stage Validation**
   - Verify all prerequisite stages are completed
   - Validate required inputs are available
   - Check dependency requirements are met
   - Confirm context continuity from previous stages
   - Determine COVE application based on token level

2. **Stage Processing**
   - Execute stage-specific generation logic
   - Apply platform-specific adaptations (web.md, mobile.md, platform-agnostic.md)
   - **Apply COVE Verification** (if enabled for this stage):
     - Draft initial stage output
     - Generate verification questions
     - Answer questions independently
     - Synthesize verified output with confidence indicators
   - Incorporate production-ready defaults and best practices
   - Generate comprehensive outputs with required sections

3. **Post-Stage Validation**
   - Validate output completeness against stage requirements
   - Ensure all required content sections are present
   - Verify quality gates are met
   - **Record COVE Results** (if applied):
     - Document verification findings
     - Track issues found and corrected
     - Update confidence metrics
   - Update rolling context summary

4. **Context Handoff**
   - Prepare context package for next stage
   - Update project state documentation
   - Log decisions and assumptions made
   - **Include COVE Metrics** in state update
   - Generate next-stage preparation summary

**Output Requirements:**
- Platform-specific files (web.md, mobile.md, platform-agnostic.md)
- Updated context summary
- Decision log entries
- Next stage preparation notes
- Quality validation report
- **COVE Verification Report** (if applied):
  - Verification questions and answers
  - Issues found and corrections made
  - Confidence levels for outputs
  - Assumptions documented

### COVE Integration

For stages where COVE is enabled (based on token level):

**COVE Application by Token Level:**
- **Low**: Stages 03, 04, 06 (Architecture, Features, Implementation)
- **Medium**: Stages 01-06 (All planning stages)
- **High**: Stages 01-10 (All stages)

**COVE Process:**
1. Generate draft output using stage templates
2. Create verification questions specific to stage focus
3. Answer questions independently without referencing draft
4. Synthesize final verified output with confidence indicators

**See**: `templates/cove-stage-integration.md` for detailed COVE application per stage.

### Stage Transition Validation

Before proceeding to the next stage, ensure:
- [ ] All required outputs are generated and complete
- [ ] Quality gates are satisfied
- [ ] **COVE verification completed** (if enabled)
- [ ] **Confidence levels documented** (if COVE applied)
- [ ] Context is properly preserved and documented
- [ ] Dependencies for next stage are identified and available
- [ ] No blocking issues or unresolved conflicts exist

## Stage Dependency Management Prompt

You are responsible for validating and managing dependencies between development stages. Each stage has specific prerequisites that must be satisfied before execution can begin.

### Dependency Validation Matrix

**Stage Dependencies:**
- **Stage 01 (Intake)**: No dependencies - entry point
- **Stage 02 (Charter)**: Requires validated brief and asset inventory
- **Stage 03 (Architecture)**: Requires charter approval and technology decisions
- **Stage 04 (Features)**: Requires architecture definition and platform decisions
- **Stage 05 (Testing)**: Requires feature specifications and acceptance criteria
- **Stage 06 (Implementation)**: Requires testing strategy and task breakdown
- **Stage 07 (Deployment)**: Requires implementation plan and infrastructure decisions
- **Stage 08 (Documentation)**: Requires deployment strategy and user flows
- **Stage 09 (Quality)**: Requires documentation and validation criteria
- **Stage 10 (Handoff)**: Requires quality assurance and final artifacts

### Dependency Validation Process

**For Each Stage Transition:**

1. **Check Prerequisites**
   ```
   Validate that stage {previous_stage} has:
   - [ ] Completed all required outputs
   - [ ] Passed quality gates
   - [ ] Generated platform-specific files
   - [ ] Updated context documentation
   - [ ] Resolved all blocking issues
   ```

2. **Validate Required Inputs**
   ```
   Confirm stage {current_stage} has access to:
   - [ ] All outputs from prerequisite stages
   - [ ] Current project configuration
   - [ ] Asset inventory and working_copy contents
   - [ ] Technology stack decisions
   - [ ] Platform-specific requirements
   ```

3. **Check Blocking Conditions**
   ```
   Ensure no blocking conditions exist:
   - [ ] No unresolved conflicts from previous stages
   - [ ] No missing critical decisions
   - [ ] No incomplete quality validations
   - [ ] No resource or constraint violations
   ```

### Dependency Resolution Protocol

**When Dependencies Are Missing:**
1. Identify specific missing prerequisites
2. Determine if they can be generated or must be provided
3. Either:
   - Generate missing dependencies using available context
   - Request user input for missing decisions
   - Halt progression until dependencies are resolved

**When Conflicts Exist:**
1. Document the nature of the conflict
2. Present options with trade-offs and recommendations
3. Request user decision or apply intelligent defaults
4. Update context with resolution rationale

## Context Preservation Prompt

You are responsible for maintaining comprehensive context across all development stages. Context preservation ensures that any AI agent can understand the project state, decisions made, and continue development seamlessly.

### Context Management Framework

**Rolling Context Summary Structure:**
```markdown
# Project Context Summary

## Project Overview
- Brief: {original_user_brief}
- Platforms: {target_platforms}
- Technology Stack: {selected_technologies}
- Deployment: {deployment_configuration}
- Current Stage: {current_stage_name}

## Completed Stages
{list_of_completed_stages_with_key_outputs}

## Key Decisions Made
{chronological_list_of_architectural_and_technical_decisions}

## Current State
- What's been built: {completed_features_and_components}
- What's in progress: {current_work_items}
- What's next: {immediate_next_steps}

## Context for Next Stage
{specific_context_needed_for_upcoming_stage}
```

### Context Preservation Protocol

**At Each Stage Completion:**

1. **Update Rolling Summary**
   - Add stage outputs to completed stages section
   - Document key decisions made during the stage
   - Update current state with new information
   - Prepare context for next stage

2. **Maintain Decision Log**
   ```markdown
   ## Decision: {decision_title}
   - **Stage**: {stage_where_decision_made}
   - **Decision**: {what_was_decided}
   - **Rationale**: {why_this_decision_was_made}
   - **Alternatives**: {other_options_considered}
   - **Impact**: {how_this_affects_other_stages}
   ```

3. **Preserve Technical Context**
   - Technology stack selections and rationale
   - Architecture patterns and design decisions
   - Platform-specific adaptations and constraints
   - Integration points and dependencies

4. **Document State Transitions**
   - What changed from previous stage
   - New capabilities or constraints introduced
   - Updated requirements or scope changes
   - Quality gates passed or issues resolved

### Context Handoff Protocol

**When Transitioning Between Stages:**

1. **Package Current Context**
   - Complete rolling summary update
   - Finalize decision log entries
   - Document any assumptions or constraints
   - Identify context needed for next stage

2. **Validate Context Completeness**
   - Ensure all decisions are documented with rationale
   - Verify technical specifications are complete
   - Check that platform requirements are clear
   - Confirm no critical information is missing

3. **Prepare Next Stage Context**
   - Summarize relevant information for next stage
   - Highlight dependencies and prerequisites
   - Note any special considerations or constraints
   - Provide clear starting point for next stage execution

### Context Recovery Protocol

**When Context Is Lost or Incomplete:**

1. **Assess Available Information**
   - Review existing stage outputs
   - Check decision logs and documentation
   - Identify gaps in context or missing decisions

2. **Reconstruct Missing Context**
   - Infer decisions from existing outputs
   - Apply intelligent defaults based on best practices
   - Document assumptions made during reconstruction

3. **Validate Reconstructed Context**
   - Check consistency across all stages
   - Verify technical feasibility of inferred decisions
   - Confirm alignment with original project brief

**Emergency Context Recovery:**
If critical context is missing and cannot be reconstructed:
1. Document the specific missing information
2. Present options for proceeding with assumptions
3. Request user input for critical missing decisions
4. Update context with recovery actions taken