# Task Prompt Template

## Purpose
Convert task list entries into executable, context-rich prompts that guide AI agents to write actual code. This template ensures consistent, high-quality code generation by providing all necessary context, requirements, and validation criteria.

**Critical Role**: Transforms abstract task descriptions into concrete, actionable prompts with full context.

---

## When to Use This Template

Use this template when:
- Executing tasks from `implementation-tasks.md`
- Converting task list entries into prompts
- Need to provide full context for code generation
- Want consistent prompt structure across tasks

**Invoked by**: execution-orchestrator.md during Step 2.2 (Generate Task Prompt)

---

## Template Structure

```markdown
# Task Prompt: [Task ID] - [Task Title]

## Metadata
**Task ID**: [e.g., 1.1, 2.3, 5.2]
**Phase**: [e.g., Foundation, Business Logic, UI Screens]
**Priority**: [P0 (Critical) | P1 (High) | P2 (Medium) | P3 (Low)]
**Estimated Time**: [X minutes]
**Dependencies**: [List of task IDs that must be complete first, or "None"]
**Status**: [Not Started | In Progress | Complete]

---

## Context

### Project Overview
[Brief description of the overall project from MY_PROJECT.md]

### Current Phase
[Description of current development phase and what's been built so far]

### Previous Tasks Completed
[List of relevant completed tasks that this task builds upon]
- Task [ID]: [Title] - [Key outputs]
- Task [ID]: [Title] - [Key outputs]

### Architecture Context
[Load from architecture.md - relevant sections]

**Tech Stack**:
- [Language/Framework]
- [Key libraries]
- [Patterns to follow]

**Code Patterns Established**:
- [Pattern 1 with example]
- [Pattern 2 with example]

### Feature Context
[Load from features.md - relevant sections]

**User Story**: [Related user story]
**Acceptance Criteria**: [High-level criteria from features]

---

## Objective

### What to Build
[Clear, specific description of what needs to be implemented]

### Why It's Needed
[Explanation of how this task fits into the larger system]

### Success Criteria
[What "done" looks like for this task]

---

## Files to Create/Modify

### New Files
- `[path]/[filename].[ext]` - [Purpose and description]
- `[path]/[filename].[ext]` - [Purpose and description]

### Files to Modify
- `[path]/[filename].[ext]` - [What changes to make]

### Test Files
- `[test-path]/[filename].test.[ext]` - [Test coverage needed]

---

## Implementation Requirements

### Functional Requirements
1. [Requirement 1 with details]
2. [Requirement 2 with details]
3. [Requirement 3 with details]

### Technical Requirements
1. [Technical constraint or requirement]
2. [Performance requirement]
3. [Security requirement]

### Code Quality Requirements
- Follow [coding standard] from architecture.md
- Add JSDoc/comments for public APIs
- Use [naming convention]
- Handle errors with [error handling pattern]

---

## Detailed Specifications

### Data Structures
[If creating models/types]

```[language]
// Example structure from architecture
interface Example {
  field1: Type;
  field2: Type;
}
```

### API Contracts
[If implementing APIs]

**Endpoint**: `[METHOD] /path`
**Request**: [Structure]
**Response**: [Structure]
**Errors**: [Error codes and meanings]

### Business Logic
[If implementing business rules]

1. [Rule 1 with logic]
2. [Rule 2 with logic]
3. [Edge cases to handle]

### UI Specifications
[If implementing UI]

**Layout**: [Description]
**Components**: [List of components to use]
**Interactions**: [User interactions to implement]
**States**: [Loading, error, empty, success states]

---

## Code Patterns to Follow

### Pattern 1: [Pattern Name]
[Description of pattern from architecture]

```[language]
// Example from existing code or architecture
[code example]
```

### Pattern 2: [Pattern Name]
[Description]

```[language]
[code example]
```

---

## Dependencies

### Required Imports/Packages
```[language]
import { Something } from 'package';
import AnotherThing from './path';
```

### External Services
- [Service name]: [How to use it]
- [API name]: [Endpoint and authentication]

### Internal Dependencies
- [Module name]: [What it provides]
- [Service name]: [How to integrate]

---

## Acceptance Criteria

### Functional Criteria
- [ ] [Specific functional requirement met]
- [ ] [Another functional requirement]
- [ ] [Edge case handled]

### Technical Criteria
- [ ] Code compiles without errors
- [ ] No linting warnings
- [ ] Follows coding standards from architecture
- [ ] Proper error handling implemented

### Testing Criteria
- [ ] Unit tests written and passing
- [ ] Test coverage ≥ [X]%
- [ ] Edge cases tested
- [ ] Integration tests pass (if applicable)

### Documentation Criteria
- [ ] Code comments added where needed
- [ ] Public APIs documented
- [ ] README updated (if applicable)

---

## References

### Specification Documents
- **Requirements**: `prompts/outputs/specifications/requirements.md#[section]`
- **Architecture**: `prompts/outputs/specifications/architecture.md#[section]`
- **Features**: `prompts/outputs/specifications/features.md#[section]`
- **Testing**: `prompts/outputs/specifications/testing.md#[section]`

### Related Tasks
- **Previous Task**: [Task ID] - [Title]
- **Next Task**: [Task ID] - [Title]
- **Related Tasks**: [List of related task IDs]

### External Resources
- [Documentation link]
- [API reference]
- [Tutorial or guide]

---

## Implementation Guidance

### Step-by-Step Approach
1. [Step 1 with details]
2. [Step 2 with details]
3. [Step 3 with details]

### Common Pitfalls to Avoid
- ⚠️ [Pitfall 1 and how to avoid it]
- ⚠️ [Pitfall 2 and how to avoid it]

### Best Practices
- ✅ [Best practice 1]
- ✅ [Best practice 2]

---

## Validation Steps

### Pre-Implementation Validation
- [ ] All dependencies available
- [ ] Required context loaded
- [ ] Specifications understood

### During Implementation
- [ ] Code compiles after each file
- [ ] Tests run after each change
- [ ] Linter passes

### Post-Implementation Validation
1. **Compile Check**
   ```bash
   [command to compile]
   ```
   Expected: No errors

2. **Test Execution**
   ```bash
   [command to run tests]
   ```
   Expected: All tests pass

3. **Linting**
   ```bash
   [command to lint]
   ```
   Expected: No warnings

4. **Integration Check**
   - [ ] Integrates with existing code
   - [ ] No breaking changes
   - [ ] APIs work as expected

5. **Acceptance Criteria Review**
   - [ ] All criteria from above met
   - [ ] Edge cases handled
   - [ ] Error handling complete

---

## Example Implementation

### Example File: [filename]
```[language]
// Example of what the implementation might look like
// This is a guide, not the exact code to copy

[example code showing structure and patterns]
```

### Example Test: [test filename]
```[language]
// Example test structure

describe('[Component/Function]', () => {
  it('should [behavior]', () => {
    // Arrange
    [setup]
    
    // Act
    [execute]
    
    // Assert
    [verify]
  });
});
```

---

## Notes for AI Agents

### Context Loading
- Read all referenced specification sections before implementing
- Review completed tasks to understand existing patterns
- Check architecture decisions for constraints

### Code Generation
- Follow established patterns from architecture
- Use consistent naming conventions
- Add proper error handling
- Include logging where appropriate

### Testing
- Write tests before or alongside implementation
- Cover happy path and edge cases
- Use mocks for external dependencies
- Ensure tests are independent

### State Management
- Update EXECUTION_PROGRESS.md after completion
- Mark task complete in implementation-tasks.md
- Log to DEVELOPMENT_LOG.md
- Commit changes with clear message

---

## Completion Checklist

Before marking this task complete:

### Code Quality
- [ ] All files created/modified as specified
- [ ] Code compiles without errors
- [ ] No linting warnings
- [ ] Follows coding standards
- [ ] Proper comments added

### Functionality
- [ ] All functional requirements met
- [ ] Edge cases handled
- [ ] Error handling implemented
- [ ] Integration verified

### Testing
- [ ] Unit tests written
- [ ] All tests passing
- [ ] Coverage meets requirements
- [ ] Edge cases tested

### Documentation
- [ ] Code comments added
- [ ] API documentation updated
- [ ] README updated (if needed)

### State Management
- [ ] EXECUTION_PROGRESS.md updated
- [ ] implementation-tasks.md checkboxes marked
- [ ] DEVELOPMENT_LOG.md entry added
- [ ] Changes committed to git

---

## Task Status Update

### On Completion
Update implementation-tasks.md:
```markdown
**Status**: ✅ COMPLETE
**Completed**: [Timestamp]
**Duration**: [Actual time]
**Notes**: [Any important notes or deviations]
```

Update EXECUTION_PROGRESS.md:
```markdown
### [Timestamp] - Task [ID]: [Title]
**Status**: ✅ Complete
**Duration**: [X minutes]
**Files Created**: [List]
**Files Modified**: [List]
**Tests Added**: [Count]
**Acceptance Criteria**: All met ✅
```

---

## Template Usage Example

See `examples/task-prompt-example.md` for a complete example of this template filled out for a real task.

---

## Document Control

**Version**: 1.0
**Created**: 2026-02-08
**Purpose**: Standardize task prompt generation
**Status**: Production Ready

**Related Documents**:
- orchestrators/execution-orchestrator.md - Uses this template
- templates/execution-phase.md - Execution phase overview
- templates/context-agnostic-tasks.md - Task list generation

**Usage**: Invoked by execution orchestrator for each task in implementation-tasks.md
```

---

## Quick Reference: Template Variables

| Variable | Source | Example |
|----------|--------|---------|
| [Task ID] | implementation-tasks.md | 1.1, 2.3, 5.2 |
| [Task Title] | implementation-tasks.md | Create Data Models |
| [Phase] | implementation-tasks.md | Foundation, Business Logic |
| [Priority] | implementation-tasks.md | P0, P1, P2, P3 |
| [Estimated Time] | implementation-tasks.md | 15 minutes |
| [Dependencies] | implementation-tasks.md | Task 1.1, Task 2.2 |
| [Project Overview] | MY_PROJECT.md | Brief description |
| [Architecture Context] | architecture.md | Tech stack, patterns |
| [Feature Context] | features.md | User stories, criteria |
| [Code Patterns] | architecture.md | Established patterns |
| [Acceptance Criteria] | implementation-tasks.md | Checklist items |
| [References] | implementation-tasks.md | Spec file links |

---

## Automation Notes

This template can be automated by:
1. Parsing implementation-tasks.md for task details
2. Loading referenced specification sections
3. Extracting code patterns from architecture
4. Generating filled template
5. Passing to AI agent for execution

**Future Enhancement**: Create a script to auto-generate task prompts from task lists.
