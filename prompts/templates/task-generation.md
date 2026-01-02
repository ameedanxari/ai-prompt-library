# Task Generation Template

## Purpose
Generate self-contained, bite-sized tasks that can be executed by AI agents without requiring previous conversation context or external dependencies.

## Instructions
Use this template to break down complex features into manageable, independent tasks. Each task should be executable with only the information provided and should build incrementally toward the larger goal.

## Examples
```markdown
### Task: Set up React Component Structure

**Objective**: Create reusable component architecture for user interface

**Context**: [Link to project specifications](../README.md)
- Specification References: [Project Overview](../README.md)
- Asset References: [Working Copy Assets](../working_copy/README.md)
- Dependency Management: React 18+, TypeScript, Styled Components

**Prerequisites**: 
- Node.js environment configured
- Project dependencies installed

**Acceptance Criteria**:
1. Component folder structure created
2. Base component interfaces defined
3. Storybook integration working

**Implementation Steps**:
1. Create src/components directory structure
2. Define TypeScript interfaces for props
3. Set up component export index
4. Configure Storybook stories

**Validation**:
- [ ] Components render without errors
- [ ] TypeScript compilation passes
- [ ] Storybook displays components correctly
```

## Core Principles
- **Context Independence**: Each task must be executable with only the information provided
- **Incremental Progress**: Tasks build upon each other with clear dependencies
- **Reference Completeness**: Include all necessary links to specifications and assets
- **Session Boundaries**: Structure tasks for completion across multiple sessions
- **Validation Gates**: Include checkpoints and validation steps

## Task Structure Template

### Task: [Clear, Action-Oriented Title]

**Objective**: [Single sentence describing what this task accomplishes]

**Context**: [Minimal context needed - link to relevant specs/assets]
- Specification References: [Link to relevant section]
- Asset References: [Links to required files/resources]
- Dependency Management: [List of prerequisite tasks]

**Prerequisites**: [Required dependencies and setup]
- [Prerequisite 1]
- [Prerequisite 2]

**Acceptance Criteria**:
1. [Specific, measurable outcome]
2. [Testable condition]
3. [Quality gate or validation step]

**Implementation Steps**:
1. [Concrete action with expected output]
2. [Next step building on previous]
3. [Validation or checkpoint]

**Validation**:
- [ ] [Specific check to confirm completion]
- [ ] [Quality validation step]
- [ ] [Integration verification]

**Session Checkpoint**: [Progress tracking for multi-session work]
**Next Task**: [Link to logical next task]

## Modular Task Types

### Implementation Task
Focus: Writing code, creating files, implementing functionality
Structure: Clear inputs → implementation steps → validation

### Integration Task  
Focus: Connecting components, wiring systems together
Structure: Component identification → integration steps → end-to-end testing

### Validation Task
Focus: Testing, verification, quality assurance
Structure: Test setup → execution → results validation

### Checkpoint Task
Focus: State verification, progress confirmation, decision points
Structure: Status review → validation → next steps determination
## Reference Management

### Specification References
```markdown
**Specification**: [Project Documentation](../README.md)
**Requirements**: [Project Overview](../README.md)
**Design**: [Architecture Guidelines](../README.md)
```

### Asset References
```markdown
**Assets Required**:
- [Asset Name](path/to/asset) - Purpose/Usage
- [Configuration File](path/to/config) - Settings needed
- [Template](path/to/template) - Base structure
```

### Dependency Management
```markdown
**Prerequisites**:
- [ ] Task X.Y must be completed
- [ ] Component Z must be implemented
- [ ] Configuration A must be set up

**Provides For**:
- Task X.Z (depends on this output)
- Integration step Y (uses this component)
```

## Multi-Session Structure

### Session Boundary Markers
```markdown
## Session Checkpoint
**Status**: [In Progress/Completed/Blocked]
**Completed**: [List of finished steps]
**Next Session**: [Clear starting point for continuation]
**Context**: [Brief summary of current state]
```

### State Preservation
```markdown
**Current State**:
- Files modified: [list]
- Configuration changes: [list]
- Dependencies installed: [list]
- Tests passing: [status]

**Handoff Notes**:
- [Key decisions made]
- [Issues encountered]
- [Next steps identified]
```

## Dry-Run Capabilities

### Validation Mode
```markdown
## Dry-Run Validation

**Purpose**: Validate task structure and dependencies without execution

**Checks**:
- [ ] All references are valid and accessible
- [ ] Prerequisites are clearly defined
- [ ] Acceptance criteria are measurable
- [ ] Implementation steps are actionable
- [ ] Validation steps are specific

**Output**: Task readiness assessment with recommendations
```

### Planning Mode
```markdown
## Task Planning Dry-Run

**Scope**: Estimate effort and identify potential issues

**Analysis**:
- Complexity assessment: [Low/Medium/High]
- Estimated duration: [time estimate]
- Risk factors: [list potential issues]
- Resource requirements: [tools, assets, dependencies]

**Recommendations**: [Suggestions for task optimization]
```

## Task Generation Features
This template provides comprehensive task generation capabilities including:
- **Context Independence**: Tasks executable without requiring previous conversation
- **Incremental Progress**: Tasks that build upon each other with clear dependencies
- **Multi-Session**: Structure for completion across multiple sessions
- **Checkpoints**: Built-in validation and progress tracking
- **Dry-Run Capability**: Validation Mode for testing task structure