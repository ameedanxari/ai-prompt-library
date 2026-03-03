# Execution Orchestrator

## Purpose
Systematically execute implementation tasks from task lists using prompt-driven development. This orchestrator bridges the gap between planning (Stages 01-06) and actual code implementation by automating task execution, validation, and state management.

**Critical Role**: Transforms task lists into working code through structured, repeatable prompts.

---
## Implementation Patterns

### Pattern 1: Task Queue Processing
Process tasks from queue in order with state tracking.

**Implementation**:
1. Load task list from implementation-tasks.md
2. Filter unblocked tasks (dependencies satisfied)
3. For next unblocked task:
   a. Load task context and specs
   b. Generate task prompt
   c. Execute prompt (generate code)
   d. Validate output (tests, acceptance criteria)
   e. Update state files (task list, progress, log)
   f. Commit to git
4. Repeat until all tasks complete
5. Log queue processing with timings

### Pattern 2: Dependency-Aware Execution
Skip tasks with unmet dependencies, come back later.

**Implementation**:
1. For each task, check dependencies (list of task IDs)
2. Skip if any dependency not yet completed
3. Process other tasks first
4. After task completion, mark in state file
5. On next loop, check if skipped task's dependencies now met
6. If yes, process skipped task
7. Log dependency satisfaction for debugging


## When to Use This Orchestrator

Invoke this orchestrator when:
- User says "Execute the development plan" or "Build the project"
- User says "Continue" and NEXT_ACTION.md shows "Phase: Execution"
- Stage 06 (Implementation Tasks) is complete
- Stage 06.5 (SwiftUI Architecture Review) is complete
- Stage 06.6 (Senior-Level Patterns) is complete
- Task lists exist in `prompts/outputs/task-lists/`

**Do NOT use** when:
- Still in planning phase (Stages 01-06)
- Task lists haven't been generated yet
- User wants to modify specifications (return to appropriate stage)
- SwiftUI architecture review not complete
- Senior-level patterns review not complete

---

## Prerequisites Validation

Before starting execution, verify:

```markdown
## Pre-Execution Checklist

### Planning Stages Complete
- [ ] Stage 01 (Intake) - Requirements specification
- [ ] Stage 02 (Charter) - Project scope and success criteria
- [ ] Stage 03 (Architecture) - Architecture and data models
- [ ] Stage 04 (Features) - Feature specifications
- [ ] Stage 05 (Testing) - Testing strategy
- [ ] Stage 06 (Implementation Tasks) - Atomic tasks
- [ ] **Stage 06.5 (SwiftUI Architecture Review)** - SwiftUI patterns ✅ NEW
- [ ] **Stage 06.6 (Senior-Level Patterns)** - Senior patterns ✅ NEW

### Specifications Complete
- [ ] `prompts/outputs/specifications/requirements.md` exists
- [ ] `prompts/outputs/specifications/architecture.md` exists
- [ ] `prompts/outputs/specifications/features.md` exists
- [ ] `prompts/outputs/specifications/testing.md` exists

### Task Lists Generated
- [ ] `prompts/outputs/task-lists/implementation-tasks.md` exists
- [ ] Tasks have clear acceptance criteria
- [ ] Tasks reference specification files
- [ ] Dependencies between tasks are documented

### Development Environment
- [ ] Project directory structure exists
- [ ] Version control initialized (git)
- [ ] Development tools available (compiler, package manager)

### State Files Ready
- [ ] `NEXT_ACTION.md` exists in project root
- [ ] `PROJECT_STATE.md` exists in prompts/outputs/
- [ ] `DEVELOPMENT_LOG.md` exists in prompts/outputs/

**If any checks fail**: Return to appropriate stage to complete missing items.
```

---

## Orchestrator Workflow

### Phase 1: Initialize Execution

```markdown
## Step 1.1: Create EXECUTION_PROGRESS.md

Create file in project root with this structure:

```markdown
# Execution Progress

**Phase**: Execution (Building from Specifications)
**Started**: [Current Timestamp]
**Last Updated**: [Current Timestamp]
**Mode**: [Normal | Dry-Run]

## Overall Progress

| Category | Total Tasks | Completed | In Progress | Remaining |
|----------|-------------|-----------|-------------|-----------|
| Implementation | [count] | 0 | 0 | [count] |

## Current Focus

**Active Task**: None (Starting execution)
**Task File**: prompts/outputs/task-lists/implementation-tasks.md
**Status**: Initializing

## Task Execution Log

[Tasks will be logged here as they complete]

## Blocking Issues

None

## For Continuing Agents

1. Read this file to understand current state
2. Check "Current Focus" for active task
3. Continue from last uncompleted step
4. Update this file after each task completion
```

## Step 1.2: Parse Task Lists

Read all task list files and extract:
- Total number of tasks
- Task IDs and titles
- Dependencies between tasks
- Priority levels (P0, P1, P2)
- Estimated time for each task

## Step 1.3: Update NEXT_ACTION.md

```markdown
# NEXT ACTION

**Status**: Execution Phase Active
**Current Phase**: Execution - Building Product
**Current Task**: [First task ID and title]
**Last Updated**: [Timestamp]

## What's Happening

Executing implementation tasks from task lists. Writing actual source code files.

## Current Task Details

**Task**: [Task ID] - [Task Title]
**File**: prompts/outputs/task-lists/implementation-tasks.md#[task-id]
**Priority**: [P0/P1/P2]
**Estimated Time**: [X minutes]

**Files to Create**:
- [List of files from task]

**Acceptance Criteria**:
- [ ] [Criteria 1]
- [ ] [Criteria 2]

## To Continue

Say "Continue" to execute the current task, or "Skip to [task-id]" to jump to a specific task.

## Context Files

- Task Lists: prompts/outputs/task-lists/
- Specifications: prompts/outputs/specifications/
- Execution Progress: EXECUTION_PROGRESS.md
```
```

---

### Phase 2: Task Execution Loop

For each task in the task list (in dependency order):

```markdown
## Step 2.1: Load Task Context

### Read Task Details
From `implementation-tasks.md`:
- Task ID and title
- Description and objectives
- Files to create/modify
- Acceptance criteria
- Dependencies
- References to specifications

### Load Referenced Specifications
For each reference in the task:
- Read architecture.md sections
- Read features.md sections
- Read testing.md sections
- Load any code patterns or examples

### Check Dependencies
- Verify all dependent tasks are complete
- If dependencies not met, skip to next available task
- Log dependency wait in EXECUTION_PROGRESS.md

## Step 2.2: Generate Task Prompt

Use the **Task Prompt Template** (see templates/task-prompt-template.md):

```markdown
# Task Prompt: [Task ID] - [Task Title]

## Context
[Load from specifications and previous tasks]

## Objective
[Task description from task list]

## Files to Create/Modify
[List with full paths]

## Implementation Requirements
[Detailed requirements from task and specs]

## Code Patterns to Follow
[Examples from architecture.md]

## Acceptance Criteria
[Checklist from task list]

## References
- Architecture: [links]
- Features: [links]
- Testing: [links]

## Validation Steps
1. Code compiles without errors
2. Tests pass
3. Acceptance criteria met
4. Integration verified
```

## Step 2.3: Execute Task Prompt

### If Mode: Normal (Full Execution)
1. **Write actual source code files**
   - Create files in correct directories
   - Follow coding standards from architecture
   - Add proper comments and documentation
   
2. **Create tests**
   - Write unit tests for new code
   - Follow testing strategy from Stage 05
   - Ensure tests pass
   
3. **Validate implementation**
   - Run compiler/linter
   - Execute tests
   - Check acceptance criteria
   - Verify integration with existing code

### If Mode: Dry-Run
1. **Show task preview only**
   - List files that would be created
   - Describe implementation approach
   - Estimate token usage
   - Show acceptance criteria
   
2. **Do NOT write actual code**
   - Save ~90% tokens
   - Allow user to review before building
   
3. **Wait for user confirmation**
   - User must say "Build" or "Execute" to proceed

## Step 2.4: Validate Task Completion

```markdown
## Validation Checklist

### Code Quality
- [ ] All files created/modified as specified
- [ ] Code compiles without errors
- [ ] No linting warnings (or documented exceptions)
- [ ] Follows coding standards from architecture

### Testing
- [ ] Unit tests written and passing
- [ ] Test coverage meets requirements
- [ ] Edge cases covered
- [ ] Integration tests pass (if applicable)

### Acceptance Criteria
- [ ] All criteria from task list verified
- [ ] Functionality works as specified
- [ ] Error handling implemented
- [ ] Performance acceptable

### Documentation
- [ ] Code comments added where needed
- [ ] API documentation updated (if applicable)
- [ ] README updated (if applicable)

**If any validation fails**: Fix issues before marking task complete.
```

## Step 2.5: Update State Files

### Update implementation-tasks.md
Mark task as complete:
```markdown
**Acceptance Criteria**:
- [x] All models conform to Codable
- [x] Product has primaryImage computed property
- [x] Price has formattedAmount with currency formatting
[...]

**Status**: ✅ COMPLETE
**Completed**: [Timestamp]
**Duration**: [Actual time taken]
```

### Update EXECUTION_PROGRESS.md
```markdown
## Task Execution Log

### [Timestamp] - Task [ID]: [Title]
**Status**: ✅ Complete
**Duration**: [X minutes]
**Files Created**:
- src/models/Product.swift
- src/models/Price.swift
[...]

**Files Modified**:
- [List if any]

**Tests Added**:
- tests/models/ProductTests.swift (5 tests)

**Notes**:
- [Any important decisions or deviations]

**Acceptance Criteria**: All met ✅
```

### Update DEVELOPMENT_LOG.md
```markdown
## [Timestamp] - Task [ID] Complete

**Action**: Implemented [Task Title]
**Agent**: [AI Agent Name]
**Phase**: Execution
**Duration**: [X minutes]

**What Happened**:
1. Created [X] new files
2. Modified [Y] existing files
3. Added [Z] unit tests
4. All acceptance criteria validated

**Files Created**:
- [List with descriptions]

**Key Decisions**:
- [Any architectural or implementation decisions]

**Commit**: "[Commit message]"
```

### Update NEXT_ACTION.md
```markdown
**Current Task**: [Next task ID and title]
**Progress**: [X/Total] tasks complete ([Y]%)
```

## Step 2.6: Commit Changes (if using version control)

```bash
git add [files]
git commit -m "feat: [Task title]

- [Key change 1]
- [Key change 2]
- [Key change 3]

Refs: [Task ID]"
```

## Step 2.7: Move to Next Task

- Identify next uncompleted task from task list
- Check dependencies are met
- Repeat from Step 2.1
```

---

### Phase 3: Execution Completion

```markdown
## Step 3.1: Verify All Tasks Complete

### Check Task Lists
- [ ] All tasks in implementation-tasks.md marked complete
- [ ] All acceptance criteria validated
- [ ] All tests passing
- [ ] No blocking issues remaining

### Run Integration Tests
- [ ] Full application builds successfully
- [ ] All unit tests pass
- [ ] Integration tests pass
- [ ] End-to-end tests pass (if applicable)

### Verify Deliverables
- [ ] All required files created
- [ ] Documentation complete
- [ ] Configuration files in place
- [ ] Application runs without errors

## Step 3.2: Update Final State

### Update EXECUTION_PROGRESS.md
```markdown
## Execution Complete ✅

**Completed**: [Timestamp]
**Total Duration**: [X hours Y minutes]
**Tasks Completed**: [Total count]
**Files Created**: [Total count]
**Tests Written**: [Total count]
**Test Coverage**: [X%]

## Final Statistics

| Metric | Value |
|--------|-------|
| Total Tasks | [X] |
| Tasks Completed | [X] |
| Files Created | [X] |
| Lines of Code | ~[X] |
| Tests Written | [X] |
| Test Coverage | [X%] |
| Build Status | ✅ Passing |

## Deliverables

- [x] All source code files
- [x] All test files
- [x] Configuration files
- [x] Documentation
- [x] Working application

## Next Steps

- Run final QA checks
- Prepare for deployment
- Update project documentation
- Transition to maintenance phase
```

### Update NEXT_ACTION.md
```markdown
# NEXT ACTION

**Status**: Execution Phase Complete ✅
**Current Phase**: Ready for Deployment/Polish
**Last Updated**: [Timestamp]

## Execution Summary

All implementation tasks have been completed successfully.

**Completed**:
- [X] tasks executed
- [Y] files created
- [Z] tests written
- Application builds and runs

## What's Next

Choose one of:
1. **Deploy**: Set up deployment (if Stage 07 not yet done)
2. **Polish**: Add final touches and optimizations
3. **Document**: Complete user documentation (if Stage 08 not yet done)
4. **QA**: Run final quality checks (if Stage 09 not yet done)
5. **Complete**: Mark project as finished

Say "Continue" to proceed with next phase, or specify which phase to enter.
```

### Update PROJECT_STATE.md
```markdown
## Pipeline Progress

| Stage | Status | Completion Date |
|-------|--------|----------------|
| 01 - Intake | ✅ Complete | [Date] |
| 02 - Charter | ✅ Complete | [Date] |
| 03 - Architecture | ✅ Complete | [Date] |
| 04 - Features | ✅ Complete | [Date] |
| 05 - Testing | ✅ Complete | [Date] |
| 06 - Implementation | ✅ Complete | [Date] |
| **06.5 - SwiftUI Architecture** | **✅ Complete** | **[Date]** |
| **06.6 - Senior Patterns** | **✅ Complete** | **[Date]** |
| **Execution Phase** | **✅ Complete** | **[Date]** |
| 07 - Deployment | ⏳ Pending | - |
| 08 - Documentation | ⏳ Pending | - |
| 09 - Quality | ⏳ Pending | - |
| 10 - Handoff | ⏳ Pending | - |

**Overall Progress**: [X]% ([Y]/[Z] stages complete)
```
```

---

## Error Handling

### Task Execution Fails

```markdown
## Error Recovery Protocol

### If Task Fails Validation
1. **Document the failure**
   - Log error in EXECUTION_PROGRESS.md
   - Note which acceptance criteria failed
   - Capture error messages

2. **Analyze the issue**
   - Review task requirements
   - Check specification references
   - Identify root cause

3. **Attempt fix**
   - Modify code to address issue
   - Re-run validation
   - Update tests if needed

4. **If fix succeeds**
   - Mark task complete
   - Continue to next task

5. **If fix fails after 3 attempts**
   - Mark task as blocked
   - Log blocking issue
   - Skip to next available task
   - Flag for human review

### If Dependencies Not Met
1. Skip to next available task
2. Log dependency wait
3. Return to blocked task later
4. If circular dependency detected, flag for review

### If Specifications Unclear
1. Document ambiguity in EXECUTION_PROGRESS.md
2. Make reasonable assumption
3. Document assumption in code comments
4. Flag for review
5. Continue execution
```

---

## Dry-Run Mode Support

### Enabling Dry-Run

In NEXT_ACTION.md or PROJECT_STATE.md:
```markdown
**Mode**: Dry-Run
```

### Dry-Run Behavior

When dry-run is enabled:

```markdown
## Dry-Run: Task Preview

**Task**: [Task ID] - [Task Title]
**Mode**: Preview Only (No Code Generation)

### Files That Would Be Created
- `src/path/file.ts` - [Description]
- `tests/path/file.test.ts` - [Description]

### Implementation Approach
- [Key approach point 1]
- [Key approach point 2]
- [Pattern/library to use]

### Estimated Scope
- Lines of code: ~[X]
- Token usage: ~[Y]
- Dependencies: [List]

### Acceptance Criteria (from specs)
- [ ] [Criteria 1]
- [ ] [Criteria 2]

---

**To execute this task**: Say "Build [task-id]" or "Execute"
**To skip**: Say "Skip" or "Next task"
**To exit dry-run**: Say "Disable dry-run" or "Full execution mode"
```

**Token Savings**: ~90% compared to full execution

---

## Integration with Other Orchestrators

### Handoff to Quality Gate Orchestrator
After each task completion:
- Invoke quality-gate-orchestrator.md
- Validate code quality
- Check test coverage
- Verify standards compliance

### Handoff to State Management Orchestrator
After each task completion:
- Invoke state-management-orchestrator.md
- Update all state files
- Ensure consistency
- Prepare for agent handoff

### Handoff to Error Recovery Orchestrator
If task execution fails:
- Invoke error-recovery-orchestrator.md
- Attempt automated recovery
- Log issues
- Provide recovery options

---

## Success Metrics

### Execution Phase Successful When:
- [ ] All P0 (critical) tasks complete
- [ ] All P1 (high) tasks complete
- [ ] 80%+ of P2 (medium) tasks complete
- [ ] All tests passing
- [ ] Application builds without errors
- [ ] Core functionality works end-to-end
- [ ] All state files updated
- [ ] Git history clean and logical

### Quality Indicators:
- Test coverage ≥ 80%
- No critical bugs
- Build time acceptable
- Code follows standards
- Documentation complete

---

## Example Execution Session

```markdown
# User: "Execute the development plan"

## AI Agent Response:

### Initializing Execution Phase

Reading task lists from prompts/outputs/task-lists/...

**Found**:
- implementation-tasks.md: 24 tasks
- Total estimated time: 3-4 hours

**Creating EXECUTION_PROGRESS.md...**
**Updating NEXT_ACTION.md...**

### Starting Task Execution

**Task 1.1**: Create Data Models
**Priority**: P0 (Critical)
**Estimated Time**: 15 minutes

**Loading context**:
- Architecture: prompts/outputs/specifications/architecture.md#data-models
- Features: prompts/outputs/specifications/features.md#product-structure

**Generating task prompt...**

---

# Task Prompt: 1.1 - Create Data Models

## Context
Building foundation layer for iOS App Clip. Need 7 Swift model files with Codable conformance.

## Files to Create
- AppClip/Models/Product.swift
- AppClip/Models/Price.swift
[...]

## Implementation Requirements
1. All models must conform to Codable
2. Product must have primaryImage computed property
[...]

---

**Executing task...**

Creating AppClip/Models/Product.swift...
```swift
import Foundation

struct Product: Codable, Identifiable {
    let id: String
    let handle: String
    [...]
}
```

Creating AppClip/Models/Price.swift...
[...]

**Validating implementation...**
- [x] All files created
- [x] Code compiles
- [x] Acceptance criteria met

**Updating state files...**
- [x] implementation-tasks.md updated
- [x] EXECUTION_PROGRESS.md updated
- [x] DEVELOPMENT_LOG.md updated

**Committing changes...**
```bash
git commit -m "feat: Create data models (Task 1.1)"
```

**Task 1.1 Complete** ✅ (Duration: 12 minutes)

---

**Next Task**: 1.2 - Create Network Service

Say "Continue" to proceed, or "Pause" to stop.
```

---

## Document Control

**Version**: 1.0
**Created**: 2026-02-08
**Purpose**: Bridge gap between planning and execution
**Status**: Production Ready

**Related Documents**:
- templates/execution-phase.md - Execution phase overview
- templates/task-prompt-template.md - Task prompt generation
- orchestrators/state-management-orchestrator.md - State file management
- orchestrators/quality-gate-orchestrator.md - Quality validation

**Usage**: Invoke when transitioning from Stage 06 to actual code implementation.

## Examples

### Example 1: Task Queue Processing
Tasks: [1.1, 1.2, 2.1, 2.2, 3.1]

Execution:
1. Process 1.1 (Data Models) → Complete, commit
2. Process 1.2 (Network Service) - depends on 1.1 ✅ → Complete
3. Process 2.1 (UI Layer) - depends on 1.2 ✅ → Complete
4. Process 2.2 (Features) - depends on 2.1 ✅ → Complete
5. Process 3.1 (Tests) - depends on 2.2 ✅ → Complete
All tasks complete in dependency order ✅

