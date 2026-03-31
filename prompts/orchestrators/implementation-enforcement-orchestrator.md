# Implementation Enforcement Orchestrator

## Purpose

The Implementation Enforcement Orchestrator ensures that when users request implementation, AI agents MUST follow the generated task lists and prompts from the design phase rather than starting fresh from their own understanding.

**Critical Problem Addressed**: After completing the 10-stage specification pipeline, AI agents often ignore generated task lists and prompts, instead implementing from their own context. This wastes design phase effort and produces subpar results.

**Solution**: Enforces mandatory use of generated design artifacts during implementation and clarifies the distinction between design completion and implementation completion.

## Implementation Patterns

### Pattern 1: Implementation Request Interception

When a user requests implementation (any of these phrases):
- "start implementation"
- "begin development" 
- "build the project"
- "implement the features"
- "start coding"
- "execute the plan"

**IMMEDIATELY** invoke this enforcement protocol:

```markdown
🛡️ **IMPLEMENTATION ENFORCEMENT ACTIVATED**

I notice you're requesting implementation. Before proceeding, I must enforce the use of generated design artifacts to ensure quality and consistency with the design phase.

**Checking for Design Artifacts...**
```

### Step 2: Validate Design Artifacts Exist

```bash
# Check for required design artifacts
validate_design_artifacts() {
    echo "🔍 Validating design artifacts..."
    
    local missing_artifacts=()
    local ui_scope=false
    
    # Check for task lists (modern index-first format or legacy files)
    if [ ! -f "prompts/outputs/task-lists/task-list-index.md" ]; then
      [ ! -f "prompts/outputs/task-lists/frontend-tasks.md" ] && [ ! -f "prompts/outputs/task-lists/mobile-app-tasks.md" ] && missing_artifacts+=("At least one app task list")
      [ ! -f "prompts/outputs/task-lists/backend-tasks.md" ] && [ ! -f "prompts/outputs/task-lists/backend-shared-tasks.md" ] && missing_artifacts+=("At least one backend task list")
      [ ! -f "prompts/outputs/task-lists/deployment-tasks.md" ] && [ ! -f "prompts/outputs/deployment/deployment-plan.md" ] && missing_artifacts+=("Deployment task/plan artifacts")
    fi
    [ ! -f "prompts/outputs/task-lists/implementation-master-plan.md" ] && missing_artifacts+=("Implementation master plan")
    
    # Check for specifications
    [ ! -f "prompts/outputs/specifications/requirements.md" ] && missing_artifacts+=("Requirements specification")
    [ ! -f "prompts/outputs/architecture/architecture.md" ] && [ ! -f "prompts/outputs/specifications/architecture.md" ] && missing_artifacts+=("Architecture specification")
    [ ! -f "prompts/outputs/specifications/features.md" ] && missing_artifacts+=("Feature specifications")
    [ ! -f "prompts/outputs/specifications/design-system-foundation.md" ] && missing_artifacts+=("Design system foundation")
    [ ! -f "prompts/outputs/specifications/integration-contracts.md" ] && missing_artifacts+=("Integration contracts")
    [ ! -f "prompts/outputs/specifications/prompt-selection-manifest.md" ] && missing_artifacts+=("Prompt selection manifest")
    [ ! -f "prompts/outputs/specifications/prompt-usage-log.md" ] && missing_artifacts+=("Prompt usage log")
    [ ! -f "prompts/outputs/specifications/data-architecture.md" ] && missing_artifacts+=("Data architecture")
    [ ! -f "prompts/outputs/specifications/backend-infrastructure.md" ] && missing_artifacts+=("Backend infrastructure plan")
    [ ! -f "prompts/outputs/specifications/design-system-component-catalog.md" ] && missing_artifacts+=("Design system component catalog")
    
    # Check for implementation prompts
    [ ! -d "prompts/outputs/implementation-prompts" ] && missing_artifacts+=("Implementation prompts directory")
    [ ! -f "prompts/outputs/implementation-prompts/prompt-pack-index.md" ] && missing_artifacts+=("Implementation prompt pack index")

    # Detect UI scope and enforce fidelity artifacts
    if [ -f "prompts/outputs/task-lists/implementation-master-plan.md" ] && \
       rg -qi "ui|screen|mobile|web|admin|design-system|dashboard|layout" "prompts/outputs/task-lists/implementation-master-plan.md"; then
        ui_scope=true
    fi
    if [ "$ui_scope" = true ]; then
        [ ! -f "prompts/outputs/specifications/ui-fidelity-source-map.md" ] && missing_artifacts+=("UI fidelity source map")
        [ ! -f "prompts/outputs/specifications/screen-fidelity-matrix.md" ] && missing_artifacts+=("Screen fidelity matrix")
        [ ! -f "prompts/outputs/quality/design-system-verification-report.md" ] && missing_artifacts+=("Design system verification report")
    fi
    
    if [ ${#missing_artifacts[@]} -gt 0 ]; then
        echo "❌ Missing critical design artifacts:"
        printf '%s\n' "${missing_artifacts[@]}"
        echo ""
        echo "🚨 IMPLEMENTATION BLOCKED: Design phase incomplete"
        echo "📋 Please complete the 10-stage specification pipeline first"
        return 1
    fi
    
    echo "✅ All design artifacts present"
    return 0
}
```

### Step 2.5: Educate About Phase Semantics

Before enforcing implementation, educate the agent about phase semantics:

```markdown
🎓 **PHASE EDUCATION**

**Important**: You may see "completed" stages in the project state. This does NOT mean the work is done.

**Correct Interpretation**:
- ✅ Completed Stage = Design blueprint ready for implementation
- ✅ Your job = Implement following these blueprints exactly
- ✅ Use specifications = They are your implementation guide

**Incorrect Interpretation**:
- ❌ Completed Stage = Work is finished, ignore these files
- ❌ Start fresh = Implement based on your own understanding
- ❌ Skip specifications = They're just documentation

**Remember**: Design phase creates the plan, Implementation phase builds the product.

**Analogy**: Think of completed design stages like architectural blueprints for a house:
- ✅ Blueprint complete = Ready to build the house following the blueprint
- ❌ Blueprint complete ≠ House is built and we're done
```

### Step 3: Enforce Task-Based Implementation

If design artifacts exist, enforce their use with phase clarity:

```markdown
✅ **DESIGN ARTIFACTS VALIDATED**

I found your generated design artifacts:
- ✅ Task lists: Index + platform/backlog tracks
- ✅ Specifications: Requirements, Architecture, Features  
- ✅ Implementation prompts: Ready for execution

**🎓 PHASE CLARIFICATION**:
These "completed" design stages are BLUEPRINTS ready for implementation, not finished work.

**🔒 ENFORCEMENT MODE ACTIVATED**

I will now implement by following the generated task lists and prompts EXACTLY, not from my own understanding.

**Implementation Protocol:**
1. Read the first task from the appropriate task list
2. Follow the task's specific instructions and acceptance criteria
3. Use only the context and specifications referenced in the task
4. Validate completion against the task's success criteria
5. Move to the next task only after validation
6. Reject "done" state if implementation is still mock-only without planned replacement
7. For UI tasks, enforce source-mockup parity checks (layout, typography, spacing, color/gradients, iconography, component states)
8. Block task completion if scaffold/placeholder composition is used where hi-fidelity output is required
9. For HTML/CSS or clickable prototypes, enforce source reuse/translation plan before editing implementation code
10. Block task completion if clickflow parity or visual regression gate evidence is missing for strict/high parity screens

**Starting with the first pending task from task-list-index.md...**
```

### Step 3.5: UI Fidelity Hard Gate (Mandatory for UI Tasks)

Before marking any UI task complete, run this gate:

```markdown
🔒 **UI FIDELITY HARD GATE**

For this task, validate against source mockups and `screen-fidelity-matrix.md`:
- [ ] Shell composition matches (sidebar/topbar/page chrome where applicable)
- [ ] Typography family/weight/size hierarchy matches target
- [ ] Spacing rhythm and section placement match target composition
- [ ] Color tokens and gradient treatment match design-system definitions
- [ ] Icon set/style/size usage matches target
- [ ] Interaction states (default/hover/focus/disabled/loading/empty/error) are implemented as specified
- [ ] Clickflow transitions match source flow mapping (`trigger -> destination screen/state`)
- [ ] Source reuse plan is implemented for HTML/CSS-prototype derived screens
- [ ] Visual regression gate passes for strict/high parity screens
- [ ] No scaffold placeholders remain in implemented surfaces

If any check fails: task status stays **In Progress** and a follow-up fix task is created.
```

### Step 4: Task-by-Task Execution Enforcement

For each task, enforce this strict protocol:

```markdown
## 🎯 EXECUTING TASK: [Task ID and Title]

**Source**: `prompts/outputs/task-lists/task-list-index.md` + referenced task file
**Task Section**: [Specific section reference]

### Task Context (from design artifacts)
[Read and display the exact task context from the task list]

### Implementation Requirements (from task)
[Read and display the exact requirements from the task]

### Acceptance Criteria (from task)
[Read and display the exact acceptance criteria from the task]

### Referenced Specifications
[List all specifications referenced in the task]

**🔒 ENFORCEMENT**: I will implement ONLY what is specified in this task, using ONLY the referenced specifications and context.

### Implementation
[Execute exactly as specified in the task]

### Validation Against Task Criteria
[Check each acceptance criterion from the task]
- [ ] [Criterion 1 from task]
- [ ] [Criterion 2 from task]
- [ ] [Criterion 3 from task]

### Task Completion Status
[Mark complete only if ALL criteria met]

**Next Task**: [Reference to next task in the list]
```

### Step 5: Prevent Context Drift

```bash
# Prevent agents from using their own understanding
prevent_context_drift() {
    echo "🚫 CONTEXT DRIFT PREVENTION"
    
    # Remind agent of enforcement
    cat << 'EOF'
⚠️ CRITICAL REMINDER:
- Do NOT implement based on your own understanding
- Do NOT add features not specified in the task
- Do NOT skip steps outlined in the task
- Do NOT use different technologies than specified
- ONLY follow the exact task instructions and referenced specifications
- Do NOT count mock-only behavior as production completion unless explicitly approved and tracked with a replacement task
- Do NOT substitute simplified scaffold layouts for hi-fidelity screen composition requirements

If you find yourself thinking "I should also add..." or "It would be better to..." - STOP.
Follow the task exactly as written.
EOF
}
```

## Task List Structure Enforcement

### Required Task List Format

Each task list MUST contain tasks in this format for enforcement to work:

```markdown
# [Platform] Implementation Tasks

## Project Context
[Full project context from specifications]

## Task List

### Task 1.1: [Task Title]

**Context**: [Complete context needed]
**Specifications Referenced**: 
- `prompts/outputs/specifications/requirements.md` - Section X
- `prompts/outputs/specifications/architecture.md` - Component Y

**Implementation Requirements**:
- [Specific requirement 1]
- [Specific requirement 2]
- [Specific requirement 3]

**Files to Create/Modify**:
- `src/[path]/file.ts` - [Purpose and key content]
- `tests/[path]/file.test.ts` - [Test requirements]

**Acceptance Criteria**:
- [ ] [Testable criterion 1]
- [ ] [Testable criterion 2]
- [ ] [Testable criterion 3]

**Implementation Steps**:
1. [Specific step with expected output]
2. [Next step building on previous]
3. [Validation checkpoint]

**Validation Commands**:
```bash
# Commands to verify task completion
npm test
npm run lint
npm run build
```

---

### Task 1.2: [Next Task Title]
[Same format...]
```

## Implementation Progress Tracking

### Create Enforcement Progress File

```bash
# Create implementation progress tracking
cat > IMPLEMENTATION_ENFORCEMENT.md << 'EOF'
# Implementation Enforcement Progress

**Enforcement Mode**: ACTIVE
**Started**: [Timestamp]
**Last Updated**: [Timestamp]

## Enforcement Status
- ✅ Design artifacts validated
- ✅ Task lists loaded
- ✅ Enforcement protocol active

## Task Execution Progress

### Task Tracks (from task-list-index.md)
- [ ] Track A / Task X.Y: [Title] - Status: [Not Started/In Progress/Complete]
- [ ] Track B / Task X.Y: [Title] - Status: [Not Started/In Progress/Complete]
- [ ] Track C / Task X.Y: [Title] - Status: [Not Started/In Progress/Complete]

## Current Task
**Active Task**: Task X.Y - [Title]
**Source File**: prompts/outputs/task-lists/task-list-index.md + referenced track
**Status**: In Progress
**Started**: [Timestamp]

### Task Progress
- [x] Read task requirements
- [x] Loaded referenced specifications
- [ ] Implementation in progress
- [ ] Validation pending

## Enforcement Violations
[Log any attempts to deviate from task specifications]

## Quality Gates
- [ ] All tasks completed as specified
- [ ] All acceptance criteria met
- [ ] All validation commands pass
- [ ] No unauthorized deviations

---
*Maintained by Implementation Enforcement Orchestrator*
EOF
```

## Violation Detection and Correction

### Detect Implementation Violations

```bash
# Monitor for enforcement violations
detect_violations() {
    echo "🔍 Monitoring for enforcement violations..."
    
    # Check if agent is following task specifications
    local violations=()
    
    # Check if files being created match task specifications
    if [ -f "IMPLEMENTATION_ENFORCEMENT.md" ]; then
        local current_task=$(grep "Active Task:" IMPLEMENTATION_ENFORCEMENT.md | cut -d: -f2-)
        echo "Current task: $current_task"
        
        # Validate implementation matches task requirements
        # (This would include more sophisticated checks in practice)
    fi
    
    if [ ${#violations[@]} -gt 0 ]; then
        echo "🚨 ENFORCEMENT VIOLATIONS DETECTED:"
        printf '%s\n' "${violations[@]}"
        return 1
    fi
    
    echo "✅ No violations detected"
    return 0
}
```

### Correct Violations

```markdown
🚨 **ENFORCEMENT VIOLATION DETECTED**

**Violation**: [Description of what the agent did wrong]
**Expected**: [What the task actually specified]
**Correction Required**: [Specific correction needed]

**🔒 ENFORCEMENT ACTION**:
1. Stop current implementation
2. Revert to task specifications
3. Re-implement according to task requirements
4. Validate against task acceptance criteria

**Task Reference**: `prompts/outputs/task-lists/[file].md` - Task [ID]

Please follow the task specifications exactly as written.
```

## Integration with Existing Orchestrators

### Update Auto-Request Router

Add implementation enforcement to the request router:

```bash
# In auto-request-router.md, add this check
if [[ "$user_request" =~ (start implementation|begin development|build|implement|start coding|execute.*plan) ]]; then
    echo "🛡️ Implementation request detected"
    echo "🔄 Routing to Implementation Enforcement Orchestrator"
    # Invoke implementation-enforcement-orchestrator.md
    exit 0
fi
```

### Update AI Agent Entry Point

Add enforcement check to the main entry point:

```markdown
## Implementation Request Handling

If user requests implementation:
1. **MANDATORY**: Invoke Implementation Enforcement Orchestrator
2. Validate design artifacts exist
3. Enforce task-based implementation
4. Track progress with enforcement monitoring

**Never allow free-form implementation without design artifacts.**
```

## Usage Examples

### Example 1: Successful Enforcement

```
User: "Start implementation"

Orchestrator: "🛡️ Implementation Enforcement Activated"
Orchestrator: "🔍 Validating design artifacts..."
Orchestrator: "✅ All design artifacts present"
Orchestrator: "🔒 Enforcement Mode Activated"
Orchestrator: "📋 Starting with first pending task from task-list-index.md"
Orchestrator: "🎯 Executing Task 1.1: Setup React Project Structure"
[Follows exact task specifications]
```

### Example 2: Missing Design Artifacts

```
User: "Start implementation"

Orchestrator: "🛡️ Implementation Enforcement Activated"
Orchestrator: "🔍 Validating design artifacts..."
Orchestrator: "❌ Missing critical design artifacts:"
Orchestrator: "  - Frontend task list"
Orchestrator: "  - Architecture specification"
Orchestrator: "🚨 IMPLEMENTATION BLOCKED: Design phase incomplete"
Orchestrator: "📋 Please complete the 10-stage specification pipeline first"
```

### Example 3: Violation Detection

```
Agent: "I think we should also add a user dashboard..."

Orchestrator: "🚨 ENFORCEMENT VIOLATION DETECTED"
Orchestrator: "Violation: Adding unauthorized feature (user dashboard)"
Orchestrator: "Expected: Follow Task 1.1 specifications exactly"
Orchestrator: "🔒 ENFORCEMENT ACTION: Reverting to task specifications"
Orchestrator: "Task Reference: prompts/outputs/task-lists/task-list-index.md - Task X.Y"
```

## Quality Assurance

### Enforcement Validation Checklist

Before marking any task complete:

```markdown
## Task Completion Validation

### Specification Compliance
- [ ] Implementation matches task requirements exactly
- [ ] All referenced specifications were used
- [ ] No unauthorized additions or modifications
- [ ] All acceptance criteria met

### File Validation
- [ ] Only specified files created/modified
- [ ] File contents match task specifications
- [ ] No extra files created without task authorization

### Quality Gates
- [ ] All validation commands pass
- [ ] Tests pass as specified in task
- [ ] Code follows standards from specifications
- [ ] Integration points work as specified

### Documentation
- [ ] Task marked complete in IMPLEMENTATION_ENFORCEMENT.md
- [ ] Any decisions logged with rationale
- [ ] Next task identified and ready

**Only mark complete if ALL checks pass.**
```

## Benefits of Implementation Enforcement

### For Users
- ✅ **Design investment protected**: Effort spent in design phase is utilized
- ✅ **Consistent quality**: Implementation follows carefully crafted specifications
- ✅ **Predictable results**: Output matches design phase expectations
- ✅ **Reduced rework**: Less need to fix implementation issues

### For AI Agents
- ✅ **Clear guidance**: Exact instructions to follow
- ✅ **Reduced ambiguity**: No guessing about requirements
- ✅ **Quality validation**: Built-in success criteria
- ✅ **Progress tracking**: Clear completion metrics

### For Development Teams
- ✅ **Specification compliance**: Implementation matches design
- ✅ **Quality assurance**: Built-in validation gates
- ✅ **Traceability**: Clear link from design to implementation
- ✅ **Maintainability**: Code follows architectural decisions

## Integration Instructions

### For AI Agents Working on Implementation

1. **MANDATORY FIRST STEP**: Always check if this is an implementation request
2. **Validation**: Ensure design artifacts exist before proceeding
3. **Enforcement**: Follow task lists exactly, no deviations
4. **Tracking**: Update IMPLEMENTATION_ENFORCEMENT.md after each task
5. **Quality**: Validate against task acceptance criteria before proceeding

### For Users Requesting Implementation

1. **Complete Design First**: Ensure 10-stage pipeline is complete
2. **Request Implementation**: Say "start implementation" or similar
3. **Trust the Process**: Let the orchestrator enforce task-based implementation
4. **Review Progress**: Check IMPLEMENTATION_ENFORCEMENT.md for status
5. **Provide Feedback**: Report any issues with task specifications

## Examples

### Example 1: Successful Implementation Enforcement
```
User: "Start implementation"

Orchestrator: "🛡️ Implementation Enforcement Activated"
Orchestrator: "🔍 Validating design artifacts..."
Orchestrator: "✅ All design artifacts present"
Orchestrator: "🔒 Enforcement Mode Activated"
Orchestrator: "📋 Starting with first pending task from task-list-index.md"
Orchestrator: "🎯 Executing Task 1.1: Setup React Project Structure"
[Follows exact task specifications]
```

### Example 2: Missing Design Artifacts
```
User: "Start implementation"

Orchestrator: "🛡️ Implementation Enforcement Activated"
Orchestrator: "🔍 Validating design artifacts..."
Orchestrator: "❌ Missing critical design artifacts:"
Orchestrator: "  - Frontend task list"
Orchestrator: "  - Architecture specification"
Orchestrator: "🚨 IMPLEMENTATION BLOCKED: Design phase incomplete"
Orchestrator: "📋 Please complete the 10-stage specification pipeline first"
```

### Example 3: Violation Detection and Correction
```
Agent: "I think we should also add a user dashboard..."

Orchestrator: "🚨 ENFORCEMENT VIOLATION DETECTED"
Orchestrator: "Violation: Adding unauthorized feature (user dashboard)"
Orchestrator: "Expected: Follow Task 1.1 specifications exactly"
Orchestrator: "🔒 ENFORCEMENT ACTION: Reverting to task specifications"
Orchestrator: "Task Reference: prompts/outputs/task-lists/task-list-index.md - Task X.Y"
```

This Implementation Enforcement Orchestrator ensures that the valuable work done in the design phase is properly utilized during implementation, preventing the waste of effort and ensuring consistent, high-quality results.
