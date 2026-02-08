# Execution Phase: Comprehensive Guide

## Purpose
This guide provides detailed instructions for AI agents executing the implementation phase after completing the planning stages (01-06). It bridges the gap between specifications and working code through systematic, prompt-driven development.

**Critical Understanding**: The 10-stage pipeline generates PLANS. The execution phase generates CODE.

---

## Table of Contents
1. [When to Enter Execution Phase](#when-to-enter-execution-phase)
2. [Execution Orchestrator Usage](#execution-orchestrator-usage)
3. [Task-by-Task Execution](#task-by-task-execution)
4. [State Management During Execution](#state-management-during-execution)
5. [Quality Gates and Validation](#quality-gates-and-validation)
6. [Common Pitfalls and Solutions](#common-pitfalls-and-solutions)
7. [Agent Handoff During Execution](#agent-handoff-during-execution)

---

## When to Enter Execution Phase

### Prerequisites

Enter execution phase when ALL of these are true:
- [ ] Stage 06 (Implementation Tasks) is complete
- [ ] `prompts/outputs/task-lists/implementation-tasks.md` exists
- [ ] All specifications are complete (requirements, architecture, features, testing)
- [ ] User says "Execute the development plan" or "Build the project"
- [ ] NEXT_ACTION.md shows "Ready to Build" or similar

### User Signals

Users may say:
- "Execute the development plan"
- "Build the project"
- "Start implementing"
- "Write the actual code"
- "Continue" (when NEXT_ACTION.md shows execution phase)

### Do NOT Enter Execution Phase If:
- Still in planning stages (01-06)
- Task lists haven't been generated
- Specifications are incomplete
- User wants to modify requirements (return to appropriate stage)

---

## Execution Orchestrator Usage

### Step 1: Invoke the Orchestrator

When user requests execution, invoke:

```markdown
I'll now execute the development plan using the Execution Orchestrator.

*Invoking Execution Orchestrator from prompts/orchestrators/execution-orchestrator.md...*
```

### Step 2: Orchestrator Initializes

The orchestrator will:
1. **Validate prerequisites** (check all specs exist)
2. **Create EXECUTION_PROGRESS.md** in project root
3. **Parse task lists** to count and organize tasks
4. **Update NEXT_ACTION.md** to show first task
5. **Initialize state tracking**

### Step 3: Orchestrator Executes Tasks

For each task, the orchestrator:
1. **Loads task context** from specifications
2. **Generates task prompt** using task-prompt-template.md
3. **Executes the prompt** (writes actual code)
4. **Validates completion** against acceptance criteria
5. **Updates state files** (checkboxes, progress, logs)
6. **Commits changes** to version control
7. **Moves to next task**

---

## Task-by-Task Execution

### Task Execution Flow

```
┌─────────────────────────────────────┐
│ 1. Load Task from Task List         │
│    - Read task details              │
│    - Check dependencies             │
│    - Load acceptance criteria       │
└──────────────┬──────────────────────┘
               ↓
┌─────────────────────────────────────┐
│ 2. Generate Task Prompt             │
│    - Load context from specs        │
│    - Extract code patterns          │
│    - Build complete prompt          │
└──────────────┬──────────────────────┘
               ↓
┌─────────────────────────────────────┐
│ 3. Execute Task Prompt              │
│    - Write source code files        │
│    - Create test files              │
│    - Follow coding standards        │
└──────────────┬──────────────────────┘
               ↓
┌─────────────────────────────────────┐
│ 4. Validate Implementation          │
│    - Compile check                  │
│    - Run tests                      │
│    - Check acceptance criteria      │
└──────────────┬──────────────────────┘
               ↓
┌─────────────────────────────────────┐
│ 5. Update State Files               │
│    - Mark task complete             │
│    - Update progress tracking       │
│    - Log to development log         │
└──────────────┬──────────────────────┘
               ↓
┌─────────────────────────────────────┐
│ 6. Commit Changes                   │
│    - Stage files                    │
│    - Commit with clear message      │
│    - Push to repository             │
└──────────────┬──────────────────────┘
               ↓
┌─────────────────────────────────────┐
│ 7. Move to Next Task                │
│    - Identify next task             │
│    - Check dependencies             │
│    - Repeat from step 1             │
└─────────────────────────────────────┘
```

### Example: Executing Task 1.1

```markdown
## Task 1.1: Create Data Models

### 1. Load Task Context
Reading from implementation-tasks.md:
- Task ID: 1.1
- Title: Create Data Models
- Phase: Foundation
- Priority: P0 (Critical)
- Estimated Time: 15 minutes
- Dependencies: None
- Files to Create: 7 model files
- Acceptance Criteria: 6 items

Loading referenced specifications:
- architecture.md#data-models
- features.md#product-structure
- working_copy/products.json (for structure)

### 2. Generate Task Prompt
Using task-prompt-template.md:

```markdown
# Task Prompt: 1.1 - Create Data Models

## Context
Building foundation layer for iOS App Clip...
[Full context loaded from specs]

## Files to Create
- AppClip/Models/Product.swift
- AppClip/Models/Price.swift
[...]

## Implementation Requirements
1. All models must conform to Codable
2. Product must have primaryImage computed property
[...]

## Acceptance Criteria
- [ ] All models conform to Codable
- [ ] Product has primaryImage computed property
[...]
```

### 3. Execute Task Prompt
Creating AppClip/Models/Product.swift:
```swift
import Foundation

struct Product: Codable, Identifiable {
    let id: String
    let handle: String
    let title: String
    // ... full implementation
}
```

[Create all 7 files...]

### 4. Validate Implementation
- [x] All files created
- [x] Code compiles without errors
- [x] All acceptance criteria met
- [x] Follows coding standards

### 5. Update State Files
Updating implementation-tasks.md:
```markdown
**Acceptance Criteria**:
- [x] All models conform to Codable
- [x] Product has primaryImage computed property
[...]

**Status**: ✅ COMPLETE
**Completed**: 2026-02-08 10:45
**Duration**: 12 minutes
```

Updating EXECUTION_PROGRESS.md:
```markdown
### 2026-02-08 10:45 - Task 1.1: Create Data Models
**Status**: ✅ Complete
**Duration**: 12 minutes
**Files Created**: 7 files
**Acceptance Criteria**: All met ✅
```

### 6. Commit Changes
```bash
git add AppClip/Models/
git commit -m "feat: Create data models (Task 1.1)

- Added Product, Price, Variant, Image, Option models
- All models conform to Codable
- Added computed properties for convenience

Refs: Task 1.1"
```

### 7. Move to Next Task
Next task: 1.2 - Create Network Service
Dependencies: Task 1.1 (Complete ✅)
Ready to execute: Yes
```

---

## State Management During Execution

### State Files to Maintain

#### 1. EXECUTION_PROGRESS.md (Primary)
**Location**: Project root
**Purpose**: Track execution progress in detail
**Update Frequency**: After each task

**Key Sections**:
- Overall Progress (table with percentages)
- Current Focus (active task details)
- Task Execution Log (completed tasks)
- Upcoming Tasks (next 3 tasks)
- Blocking Issues (if any)
- Statistics (code metrics, time metrics)

#### 2. implementation-tasks.md (Checklist)
**Location**: prompts/outputs/task-lists/
**Purpose**: Master task checklist
**Update Frequency**: After each task

**What to Update**:
- Mark acceptance criteria checkboxes
- Add completion timestamp
- Add actual duration
- Add status (✅ COMPLETE)

#### 3. DEVELOPMENT_LOG.md (Detailed Log)
**Location**: prompts/outputs/
**Purpose**: Comprehensive work trail
**Update Frequency**: After each task

**What to Log**:
- Timestamp and task ID
- Files created/modified
- Key decisions made
- Challenges encountered
- Commit hash

#### 4. NEXT_ACTION.md (Control File)
**Location**: Project root
**Purpose**: What to do next
**Update Frequency**: After each task

**What to Update**:
- Current task ID and title
- Progress percentage
- Next task details
- Context for continuing agents

### Update Order (Critical)

Always update in this order:
1. **EXECUTION_PROGRESS.md** - Add to Task Execution Log
2. **implementation-tasks.md** - Mark checkboxes
3. **DEVELOPMENT_LOG.md** - Add detailed entry
4. **NEXT_ACTION.md** - Point to next task
5. **Commit to git** - Save all changes

**Why this order?** Each file depends on information from the previous one.

---

## Quality Gates and Validation

### Per-Task Validation

Before marking any task complete, validate:

#### Code Quality Gate
- [ ] All files created/modified as specified
- [ ] Code compiles without errors
- [ ] No linting warnings (or documented exceptions)
- [ ] Follows coding standards from architecture
- [ ] Proper comments and documentation added

#### Testing Gate
- [ ] Unit tests written and passing
- [ ] Test coverage meets requirements (typically ≥80%)
- [ ] Edge cases covered
- [ ] Integration tests pass (if applicable)

#### Acceptance Criteria Gate
- [ ] All criteria from task list verified
- [ ] Functionality works as specified
- [ ] Error handling implemented
- [ ] Performance acceptable

#### Documentation Gate
- [ ] Code comments added where needed
- [ ] API documentation updated (if applicable)
- [ ] README updated (if applicable)

### Phase-Level Validation

At major milestones (e.g., Foundation Complete, UI Complete):

#### Integration Validation
- [ ] All components integrate correctly
- [ ] No breaking changes introduced
- [ ] APIs work as expected
- [ ] Data flows correctly

#### System Validation
- [ ] Application builds successfully
- [ ] All tests pass
- [ ] No critical bugs
- [ ] Core user flows work end-to-end

---

## Common Pitfalls and Solutions

### Pitfall 1: Endless Specification Loop

**Problem**: AI keeps generating more plans instead of writing code

**Symptoms**:
- Creating more markdown files in prompts/outputs/
- Generating task lists for task lists
- Outlining what could be built
- No actual source code files created

**Solution**:
```markdown
STOP. You are in EXECUTION PHASE, not planning phase.

Your next action must be:
1. Create actual source code file: src/[path]/[file].[ext]
2. Write the implementation code
3. Create test file: tests/[path]/[file].test.[ext]
4. Run tests and validate

Do NOT:
- Generate more specifications
- Create more planning documents
- Outline approaches

DO:
- Write actual code files
- Create real tests
- Build working functionality
```

### Pitfall 2: Skipping Task Checklist Updates

**Problem**: Tasks completed but checkboxes not marked

**Symptoms**:
- implementation-tasks.md still shows [ ] for completed tasks
- EXECUTION_PROGRESS.md not updated
- Can't track progress
- Hard to resume work

**Solution**:
- Use execution-orchestrator.md (it handles updates automatically)
- If manual execution, always update state files after each task
- Set up a checklist for yourself: "After completing task, update 4 state files"

### Pitfall 3: No Validation Before Moving On

**Problem**: Moving to next task without validating current one

**Symptoms**:
- Code doesn't compile
- Tests not written or failing
- Acceptance criteria not met
- Bugs accumulate

**Solution**:
- Run validation checklist before marking task complete
- Don't proceed to next task until current one passes all gates
- If validation fails, fix issues before continuing

### Pitfall 4: Lost Context Between Sessions

**Problem**: New session doesn't know what was built

**Symptoms**:
- Repeating work already done
- Breaking existing code
- Inconsistent patterns
- Confusion about current state

**Solution**:
- Always read EXECUTION_PROGRESS.md first
- Check "Current Focus" section
- Review "Task Execution Log" for completed work
- Continue from last uncompleted step

### Pitfall 5: Ignoring Dependencies

**Problem**: Executing tasks out of order

**Symptoms**:
- Missing required components
- Compilation errors
- Integration failures
- Rework needed

**Solution**:
- Check task dependencies before starting
- If dependencies not met, skip to next available task
- Return to blocked tasks after dependencies complete
- Use execution-orchestrator.md (it handles dependencies automatically)

---

## Agent Handoff During Execution

### Scenario: Mid-Execution Handoff

**Situation**: Agent A completes Task 2.1, Agent B needs to continue with Task 2.2

#### Agent A's Responsibilities (Before Handoff)
1. **Complete current task fully**
   - All code written
   - All tests passing
   - All validation complete

2. **Update all state files**
   - EXECUTION_PROGRESS.md with task log
   - implementation-tasks.md with checkboxes
   - DEVELOPMENT_LOG.md with details
   - NEXT_ACTION.md with next task

3. **Commit all changes**
   - Stage all files
   - Commit with clear message
   - Push to repository

4. **Verify handoff readiness**
   - All state files consistent
   - No uncommitted changes
   - Build passes
   - Tests pass

#### Agent B's Responsibilities (After Handoff)
1. **Read EXECUTION_PROGRESS.md**
   - Check "Current Focus" for next task
   - Review "Task Execution Log" for context
   - Note any blocking issues

2. **Read NEXT_ACTION.md**
   - Confirm current task
   - Load task details
   - Check dependencies

3. **Load context from specifications**
   - Read referenced architecture sections
   - Review feature specifications
   - Check testing requirements

4. **Continue execution**
   - Generate task prompt
   - Execute task
   - Validate completion
   - Update state files

### Handoff Checklist

Before handing off:
- [ ] Current task 100% complete
- [ ] All state files updated
- [ ] All changes committed
- [ ] Build passes
- [ ] Tests pass
- [ ] NEXT_ACTION.md points to next task

After receiving handoff:
- [ ] Read EXECUTION_PROGRESS.md
- [ ] Read NEXT_ACTION.md
- [ ] Load task context
- [ ] Verify build passes
- [ ] Continue from next task

---

## Dry-Run Mode During Execution

### What is Dry-Run Mode?

**Dry-Run Mode** shows what would be built without actually writing code, saving ~90% of tokens.

### When to Use Dry-Run

Use dry-run when:
- User wants to preview implementation before committing tokens
- Validating approach before full execution
- Estimating token usage for budget planning
- Reviewing task scope before building

### How to Enable Dry-Run

In NEXT_ACTION.md or PROJECT_STATE.md:
```markdown
**Mode**: Dry-Run
```

### Dry-Run Behavior

When dry-run is enabled, for each task show:

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

### Exiting Dry-Run Mode

User can say:
- "Disable dry-run"
- "Full execution mode"
- "Build it for real"
- "Execute [task-id]"

Update NEXT_ACTION.md:
```markdown
**Mode**: Normal
```

Then proceed with actual code generation.

---

## Success Metrics

### Execution Phase Successful When:

#### Completion Metrics
- [ ] All P0 (critical) tasks complete
- [ ] All P1 (high) tasks complete
- [ ] 80%+ of P2 (medium) tasks complete
- [ ] All acceptance criteria met

#### Quality Metrics
- [ ] All tests passing
- [ ] Test coverage ≥ 80%
- [ ] Application builds without errors
- [ ] No critical bugs
- [ ] Code follows standards

#### Functionality Metrics
- [ ] Core user flows work end-to-end
- [ ] All required features implemented
- [ ] Error handling complete
- [ ] Performance acceptable

#### Documentation Metrics
- [ ] All state files updated
- [ ] Git history clean and logical
- [ ] Code comments complete
- [ ] README updated

---

## Quick Reference

### Key Commands for Users

| User Says | AI Should Do |
|-----------|--------------|
| "Execute the development plan" | Invoke execution-orchestrator.md |
| "Continue" (in execution phase) | Execute next task from task list |
| "Skip to task [ID]" | Jump to specific task |
| "Pause" | Stop execution, update state files |
| "Status" | Show EXECUTION_PROGRESS.md summary |
| "Enable dry-run" | Switch to preview mode |
| "Build it" | Execute current task (from dry-run) |

### Key Files Quick Reference

| File | Location | Purpose |
|------|----------|---------|
| EXECUTION_PROGRESS.md | Project root | Detailed progress tracking |
| implementation-tasks.md | prompts/outputs/task-lists/ | Master checklist |
| NEXT_ACTION.md | Project root | What to do next |
| DEVELOPMENT_LOG.md | prompts/outputs/ | Comprehensive log |

### Orchestrator Quick Reference

| Orchestrator | Purpose | When to Use |
|--------------|---------|-------------|
| execution-orchestrator.md | Execute tasks systematically | Start of execution phase |
| task-prompt-template.md | Generate task prompts | For each task |
| quality-gate-orchestrator.md | Validate quality | After each task |
| state-management-orchestrator.md | Update state files | After each task |

---

## Document Control

**Version**: 1.0
**Created**: 2026-02-08
**Purpose**: Comprehensive execution phase guide
**Status**: Production Ready

**Related Documents**:
- orchestrators/execution-orchestrator.md - Main orchestrator
- templates/execution-phase.md - Execution overview
- templates/task-prompt-template.md - Task prompt generation
- templates/execution-progress-template.md - Progress tracking template
- AGENTS.md - Overall agent instructions

**Usage**: Reference this guide when executing implementation tasks after Stage 06 completion.
