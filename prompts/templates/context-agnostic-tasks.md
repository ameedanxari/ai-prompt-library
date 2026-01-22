# Context-Agnostic Tasks Template

## Purpose
Generate task lists that are executable by AI agents with no prior context, ensuring complete self-containment and cross-session compatibility.

## Instructions
Use this template to create tasks that can be executed by any AI agent without requiring conversation history or external context. Each task must be completely self-contained with all necessary information embedded or properly referenced.

## Examples
```markdown
## Task: Implement User Authentication API

### Context Block
**Project**: E-commerce Platform
**Feature**: User Authentication System
**Stage**: Backend Implementation
**Dependencies**: Database schema created, API framework configured

### Objective
Create secure user authentication endpoints with JWT token management

### Background Information
**Problem**: Users need secure login/logout functionality
**Solution Approach**: JWT-based authentication with bcrypt password hashing
**Success Criteria**: Users can register, login, logout with proper token validation
```

## Core Principles
- **Zero Context Dependency**: Tasks must be executable without conversation history
- **Complete Reference Inclusion**: All necessary information embedded or linked
- **Agent Handoff Ready**: Any AI agent can pick up and execute tasks
- **Self-Validating**: Built-in checks for task completeness and correctness

---

## LLM Resilience Framework

### Purpose
Ensure tasks can be executed reliably across:
- Different AI models (GPT, Claude, Gemini, local models)
- Different context window sizes (8K to 1M tokens)
- Session interruptions and handoffs
- IDE/tool switches mid-project

### Mandatory Context Summary

Every task MUST begin with a Context Summary block:

```markdown
## Context Summary

**Project**: [Name] - [One sentence description]
**Current Phase**: [Specification | Execution | Finishing]
**This Task**: [Task ID] - [Task title]
**Previous Task**: [Last completed task] ✅
**State Files**: 
- NEXT_ACTION.md: [Key info]
- EXECUTION_PROGRESS.md: [Current status]

### Quick Start for New Session
1. Read this Context Summary
2. Check EXECUTION_PROGRESS.md for detailed state
3. Continue from "Implementation Steps" below
```

### State File Update Triggers

Update state files (NEXT_ACTION.md, EXECUTION_PROGRESS.md) when:
- ✅ A task or sub-task is completed
- 📁 Files are created or significantly modified  
- 🔀 Switching between major implementation phases
- ⚠️ An issue or blocker is encountered
- 🔚 Ending a session (even if task incomplete)

### Graceful Continuation Protocol

When an AI agent starts work on a task:

```markdown
## Continuation Check

1. **Read State Files**
   - NEXT_ACTION.md → Current status and next action
   - EXECUTION_PROGRESS.md → Detailed progress

2. **Verify Context**
   - Check "Previous Task" is marked complete
   - Verify prerequisite files exist
   - Confirm dependencies are met

3. **Resume from Checkpoint**
   - Find last checked item in Implementation Steps
   - Continue from next unchecked item
   - Do NOT restart completed work
```

### Chunk Boundary Markers

For long tasks, include progress markers:

```markdown
### Implementation Steps

1. [x] Set up project structure
   **CHECKPOINT**: Project skeleton complete
   
2. [x] Create database models
   **CHECKPOINT**: Data layer ready

3. [ ] Implement API endpoints  ← RESUME HERE
   **CHECKPOINT**: API layer complete

4. [ ] Add frontend components
   **CHECKPOINT**: UI complete
```

Markers help any AI agent quickly locate the resume point.

## Task Independence Framework

### Self-Contained Task Structure
```markdown
## Task: [Descriptive Action Title]

### Context Block
**Project**: [Project name and brief description]
**Feature**: [Specific feature being implemented]
**Stage**: [Current development stage]
**Dependencies**: [Completed prerequisites with verification]

### Objective
[Single, clear statement of what this task accomplishes]

### Background Information
**Problem**: [What issue this task solves]
**Solution Approach**: [High-level approach being taken]
**Success Criteria**: [How to know the task is complete]

### Required Resources
**Specifications**:
- [Project Requirements](../README.md) - Main project documentation
- [Feature Specifications](../README.md) - Project overview and structure

**Assets**:
- [Asset Name](path/to/asset) - [Purpose and usage]
- [Configuration](path/to/config) - [Settings needed]

**Tools/Dependencies**:
- [Tool Name] - [Version and purpose]
- [Library/Framework] - [Version and usage]

### Implementation Guide
1. **Setup Phase**
   - [Specific setup steps with expected outcomes]
   - [Environment verification commands]
   - [Dependency installation steps]

2. **Core Implementation**
   - [Step-by-step implementation with code examples]
   - [File creation/modification instructions]
   - [Configuration changes needed]

3. **Integration Phase**
   - [How to connect with existing components]
   - [API integration steps]
   - [Data flow verification]

4. **Validation Phase**
   - [Testing procedures]
   - [Quality checks]
   - [Performance verification]

### Acceptance Criteria
- [ ] [Specific, measurable outcome 1]
- [ ] [Testable condition 2]
- [ ] [Quality gate 3]
- [ ] [Integration verification 4]

### Troubleshooting Guide
**Common Issues**:
- **Issue**: [Problem description]
  - **Cause**: [Why this happens]
  - **Solution**: [How to fix it]
  - **Prevention**: [How to avoid it]

### Completion Verification
**Self-Check Questions**:
1. [Question to verify core functionality]
2. [Question to verify integration]
3. [Question to verify quality]

**Automated Checks**:
```bash
# Commands to verify task completion
npm test
npm run build
```

### Handoff Information
**For Next Task**:
- **State**: [Current system state]
- **Outputs**: [Files/components created]
- **Notes**: [Important information for next implementer]
```

## Reference Completeness Checklist

### Specification References
```markdown
**Complete Reference Format**:
- **Document**: [Full document name]
- **Section**: [Specific section number/title]
- **Content**: [Brief summary of relevant content]
- **Link**: [Direct link to section]
- **Last Updated**: [Date of last verification]

**Example**:
- **Document**: Feature Requirements Specification
- **Section**: 3.2 - User Authentication
- **Content**: Multi-factor authentication with social login support
- **Link**: [Project Requirements](../README.md)
- **Last Updated**: 2024-01-15
```

### Asset Inventory
```markdown
**Asset Documentation Format**:
- **Name**: [Asset filename]
- **Type**: [File type and format]
- **Purpose**: [How this asset is used]
- **Location**: [Full path to asset]
- **Dependencies**: [Other assets this depends on]
- **Usage Instructions**: [How to use this asset]

**Example**:
- **Name**: user-flow-diagram.png
- **Type**: PNG image, 1920x1080
- **Purpose**: Visual reference for user authentication flow
- **Location**: [assets/diagrams/user-flow-diagram.png](assets/diagrams/user-flow-diagram.png)
- **Dependencies**: None
- **Usage Instructions**: Reference during UI implementation for flow logic
```

## Cross-Session Compatibility

### Session State Documentation
```markdown
## Session State: [Task Name]

### Current Status
**Phase**: [Setup/Implementation/Integration/Validation/Complete]
**Progress**: [Percentage or milestone completed]
**Last Action**: [Most recent action taken]
**Next Action**: [Immediate next step]

### Work Completed
- [Completed item 1 with verification]
- [Completed item 2 with verification]
- [Completed item 3 with verification]

### Work Remaining
- [Remaining item 1 with priority]
- [Remaining item 2 with priority]
- [Remaining item 3 with priority]

### Environment State
**Files Modified**:
- [filename] - [changes made]
- [filename] - [changes made]

**Configuration Changes**:
- [setting] - [new value]
- [setting] - [new value]

**Dependencies Installed**:
- [package] - [version]
- [package] - [version]

### Issues and Decisions
**Decisions Made**:
- [Decision 1] - [Rationale]
- [Decision 2] - [Rationale]

**Issues Encountered**:
- [Issue 1] - [Resolution or status]
- [Issue 2] - [Resolution or status]

### Handoff Notes
**For Continuing Agent**:
- [Important context for continuation]
- [Gotchas or special considerations]
- [Recommended next steps]
```

### Agent Onboarding Template
```markdown
## Agent Onboarding: [Task Name]

### Quick Start
1. **Read This First**: [Most critical information]
2. **Verify Environment**: [Commands to check setup]
3. **Understand Context**: [Key background information]
4. **Check Dependencies**: [Verification steps]

### Project Context
**What We're Building**: [Brief project description]
**Current Feature**: [Feature being implemented]
**This Task's Role**: [How this task fits in the bigger picture]

### Technical Context
**Architecture**: [Relevant architectural decisions]
**Technology Stack**: [Technologies in use]
**Coding Standards**: [Standards and conventions to follow]
**Testing Approach**: [Testing strategy and tools]

### Immediate Next Steps
1. [First action to take]
2. [Second action to take]
3. [Third action to take]

### Success Indicators
**You'll Know You're On Track When**:
- [Indicator 1]
- [Indicator 2]
- [Indicator 3]

**Red Flags to Watch For**:
- [Warning sign 1]
- [Warning sign 2]
- [Warning sign 3]
```

## Quality Assurance Framework

### Task Completeness Validation
```markdown
## Task Quality Checklist

### Context Independence
- [ ] Task can be understood without external conversation
- [ ] All necessary information is included or linked
- [ ] No assumptions about prior knowledge
- [ ] Clear starting point and end state defined

### Reference Completeness
- [ ] All specification references are valid and accessible
- [ ] Asset links are working and current
- [ ] Dependency information is complete and accurate
- [ ] Version information is specified where relevant

### Implementation Clarity
- [ ] Steps are specific and actionable
- [ ] Expected outcomes are clearly defined
- [ ] Error handling and troubleshooting included
- [ ] Validation steps are comprehensive

### Cross-Session Compatibility
- [ ] State can be preserved between sessions
- [ ] Handoff information is complete
- [ ] Progress can be tracked and verified
- [ ] Any agent can continue the work
```

### Validation Commands
```bash
# Task Reference Validation
find . -name "*.md" -exec grep -l "broken-link" {} \;

# Asset Availability Check
LINK_START='\[.*\]'
LINK_END='(.*\.md)'
PATTERN="${LINK_START}${LINK_END}"
for asset in $(grep -o "$PATTERN" TASK_FILE.md); do
  if [ ! -f "$asset" ]; then
    echo "Missing asset: $asset"
  fi
done

# Dependency Verification
npm list --depth=0 2>/dev/null || echo "Dependencies need verification"
```

## Integration with Project State

### State Synchronization
```markdown
## Project State Integration

### Before Task Execution
1. **Read Current State**: [Command to get current project state]
2. **Verify Prerequisites**: [Commands to check dependencies]
3. **Update Local Context**: [Steps to sync with project state]

### During Task Execution
1. **Log Progress**: [How to update progress tracking]
2. **Document Decisions**: [Where to record decisions made]
3. **Track Changes**: [How to log modifications]

### After Task Completion
1. **Update Project State**: [Commands to update global state]
2. **Document Outcomes**: [What to record about completion]
3. **Prepare Handoff**: [Information for next task]
```

This template ensures that every generated task is completely self-contained, executable by any AI agent without prior context, and maintains full traceability and state management across multiple development sessions.

## Context-Agnostic Task Features
This template provides comprehensive context-agnostic task capabilities including:
- **Context Independence**: Tasks executable without requiring previous conversation
- **self-contained**: Complete task information without external dependencies
- **executable with only the information provided**: No external context needed
- **Multi-Session**: Structure for completion across multiple sessions
- **Checkpoints**: Built-in validation and progress tracking
- **Incremental Progress**: Tasks that build upon each other with clear dependencies
- **Specification References**: Complete reference management
- **Asset References**: Asset inventory and usage instructions
- **Dependency Management**: Prerequisites and dependency tracking
- **Dry-Run Capability**: Validation Mode for testing task structure