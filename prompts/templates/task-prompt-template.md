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

## Hard Requirements (Non-Negotiable)

Generated task prompts MUST satisfy all of the following:
- Use concrete file paths, contract IDs, and validation commands.
- Include concrete references to:
  - `prompts/outputs/specifications/design-system-foundation.md`
  - `prompts/outputs/specifications/integration-contracts.md`
  - `prompts/outputs/specifications/data-architecture.md`
- For UI tasks, explicitly call out reusable design-system components/tokens used by the task.
- Include concrete `.ai-prompts/prompts/...` entries under `## Prompt Blocks Applied`.
- Include at least one task-semantic prompt module in `Prompt Blocks Applied`:
  - `.ai-prompts/prompts/modules/<domain>/<module>.md`
- Include at least one stack-specific module in `Prompt Blocks Applied`:
  - `.ai-prompts/prompts/modules/technology-stacks/<module>.md`
- Select semantic and stack modules from `prompt-selection-manifest.md` and document why they apply to this task.
- For tasks matching profile/discovery/analytics/moderation intent, include intent-specific semantic modules (for example `social/user-profiles`, `search-discovery/*`, `analytics/*`, `content-moderation`/`audit-trails`) and do not rely only on `integration/service-integration`.
- File paths in `Files to Create/Modify` must be rooted in real project directories (no synthetic placeholder roots).
- For UI tasks, include all of the following sections:
  - `## Source Mockup Anchors`
  - `## Exact Composition Requirements`
  - `## Pixel Fidelity Acceptance Checklist`
  - `## Forbidden UI Substitutions`
- UI task prompts must define exact text/copy, placement, and shell composition requirements (for example sidebar/topbar/dashboard chrome) from source mockups.
- UI task prompts must explicitly reject scaffold/placeholder layouts as final output when hi-fidelity match is required.

Forbidden output patterns in generated task prompt files:
- `[implementation file paths for ...]`
- `[test file paths for ...]`
- `[project-specific lint/test/build commands for ...]`
- `- \` placeholder bullet lines
- Generic, non-source-based UI direction like:
  - "match modern dashboard style"
  - "use best judgment for spacing/colors"

If any forbidden pattern remains, the task prompt is invalid and must be regenerated.

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

### Prompt Composition Context
- **Prompt Selection Manifest**: `prompts/outputs/specifications/prompt-selection-manifest.md`
- **Prompt Usage Log**: `prompts/outputs/specifications/prompt-usage-log.md`
- **Selected Lego Blocks for this task**: [List template/orchestrator files used]

### Prompt Routing for This Task
- **Semantic Intent**: [auth/profile/booking/payment/notification/design-system/discovery/analytics/moderation/etc.]
- **Semantic Prompt Modules**:
  - `.ai-prompts/prompts/modules/[domain]/[module].md`
- **Technology Stack Prompt Modules**:
  - `.ai-prompts/prompts/modules/technology-stacks/[module].md`
- **Why These Modules**: [one line per selected module]
- **Routing Guardrail**: If intent is profile/discovery/analytics/moderation, include at least one intent-specific semantic module beyond `integration/service-integration`.

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

### Design + Integration Context
- **Design System Foundation**: `prompts/outputs/specifications/design-system-foundation.md`
- **Integration Contracts**: `prompts/outputs/specifications/integration-contracts.md`
- **Data Architecture**: `prompts/outputs/specifications/data-architecture.md`
- **Backend Infrastructure**: `prompts/outputs/specifications/backend-infrastructure.md`
- **Source Assets**: `working_copy/` and/or `prompts/working_copy/` references used by this task

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
4. [API integration requirement tied to integration-contracts.md]
5. [Design system usage requirement tied to design-system-foundation.md]

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

## Source Mockup Anchors
[Required for UI tasks]
- **Primary Source File(s)**: `[working_copy/... or prompts/working_copy/...]`
- **Frame/Screen IDs**: [Exact IDs or names]
- **Parity Scope**: [Which regions must match 1:1]

## Exact Composition Requirements
[Required for UI tasks]
- **Shell Composition**: [sidebar/topbar/header/footer/navigation requirements]
- **Typography Rhythm**: [font family, size scale, weight hierarchy, line-height]
- **Spacing Rhythm**: [key paddings/margins/gaps with measurable expectations]
- **Color/Gradient Treatment**: [token names + gradient usage constraints]
- **Iconography**: [icon set/style/size rules]
- **Text Copy**: [exact visible strings and placement requirements]

## Forbidden UI Substitutions
[Required for UI tasks]
- No scaffold placeholder cards/blocks where production composition is specified.
- No alternate shell layouts when source mockup defines shell regions.
- No token substitutions outside design-system definitions unless explicitly approved.
- No simplified typography scale when source mockup defines exact hierarchy.

## Pixel Fidelity Acceptance Checklist
[Required for UI tasks]
- [ ] Source mockup anchors are mapped to implemented surfaces
- [ ] Shell composition and section placement match source composition
- [ ] Typography scale and spacing rhythm match source composition
- [ ] Color/gradient/icon usage matches design-system definitions and source
- [ ] Interaction states match target behavior
- [ ] No scaffold/placeholder substitutions remain in parity-required scope

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
- [Mock policy]: [Allowed only behind explicit development toggle, never as final production path]

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
- [ ] Uses design-system tokens/components from design-system-foundation.md
- [ ] Uses real integration contracts or includes explicit replacement task for temporary mocks
- [ ] (UI tasks) Source mockup anchors are implemented with 1:1 composition intent
- [ ] (UI tasks) No scaffold/placeholder substitutions remain in in-scope surfaces

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
- **Architecture**: `prompts/outputs/architecture/architecture.md#[section]`
- **Features**: `prompts/outputs/specifications/features.md#[section]`
- **Testing**: `prompts/outputs/specifications/testing-strategy.md#[section]`

### Related Tasks
- **Previous Task**: [Task ID] - [Title]
- **Next Task**: [Task ID] - [Title]
- **Related Tasks**: [List of related task IDs]

### External Resources
- [Documentation link]
- [API reference]
- [Tutorial or guide]

---

## Prompt Blocks Applied
- `.ai-prompts/prompts/templates/task-prompt-template.md`
- `.ai-prompts/prompts/templates/implementation-prompt-generation.md`
- `.ai-prompts/prompts/modules/[domain]/[module].md`
- `.ai-prompts/prompts/modules/technology-stacks/[module].md`
- `.ai-prompts/prompts/stages/stage-06-implementation/[platform].md`

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

6. **UI Fidelity Review (UI tasks only)**
   - [ ] Matches source mockup anchors and frame composition
   - [ ] Shell/topbar/sidebar composition aligns with target
   - [ ] Typography/spacing/token/icon checks pass against screen-fidelity-matrix.md

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


Use this template to generate LLM prompts for individual development tasks.


## Examples

### Example 1: Task Prompt for Creating User Model

```markdown
# Task Prompt: 1.1 - Create Data Models

## Context
Building foundation models from specifications/architecture.md

## Requirements
- [ ] All models conform to Codable
- [ ] Product has computed primaryImage property

## Files to Create
- AppClip/Models/Product.swift
- AppClip/Models/Price.swift
- AppClip/Models/Variant.swift

## Acceptance Criteria
- [ ] All models conform to Codable
- [ ] Product has primaryImage computed property
```

### Example 2: Task Prompt for Network Service

```markdown
# Task Prompt: 1.2 - Create Network Service

## Context
Building network layer on top of data models completed in Task 1.1

## Requirements
- [ ] Handles authentication
- [ ] Implements retry logic
- [ ] Uses centralized API client

## Files to Create
- AppClip/Network/APIClient.swift
- AppClip/Network/Requests.swift

## Acceptance Criteria
- [ ] Network requests retry on transient errors
- [ ] Authentication token refresh implemented
```


## Implementation Patterns

### Pattern 1: Context-Aware Prompting
Include full task context (specifications, requirements, constraints, examples).

### Pattern 2: Acceptance-Criteria-Driven Generation
Generate code that explicitly satisfies all acceptance criteria from task list.

### Pattern 3: Iterative Refinement
If generated code fails validation, re-prompt with specific failure details.


## Template Usage Example

\`\`\`markdown
# Task Prompt: 1.1 - Create Data Models

## Context
Building foundation models from specifications/architecture.md

## Requirements
- [ ] All models conform to Codable
- [ ] Product has computed primaryImage property
[... full template ...]
\`\`\`
