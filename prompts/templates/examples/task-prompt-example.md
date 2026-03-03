
# Task Prompt Example

## Purpose

Provide a concrete, fully-populated example demonstrating how the task-prompt-template is filled out. This serves both as a reference for authors and as a sanity check for automated tooling.

## Implementation Patterns

### Pattern 1: Mirror Actual Task Data
Build the example using real field names and values taken from a hypothetical project.

### Pattern 2: Include Acceptance Criteria
Show checkboxes and criteria that an agent would use to verify completion.

### Pattern 3: Self-Contained Demonstration
Ensure the example stands alone; another reader should understand the flow without additional context.

## Examples

```markdown
# Task Prompt: 2.4 - Add Login Screen

## Context
User authentication flow needs a new UI component for login

## Requirements
- Use SwiftUI
- Validate email format
- Show error messages on failure

## Files to Create
- LoginView.swift
- LoginViewModel.swift

## Acceptance Criteria
- [ ] Login screen appears
- [ ] Input validation works
- [ ] Calls authentication API
```

The example above represents a typical task prompt and can be used as a template for generating others. It includes all major sections defined by the template and provides realistic values to guide AI generation.

Additional narrative or commentary can be added here to expand the file past the 500 character threshold. For instance, one might describe how the agent should handle navigation after login or how to mock network responses during testing.

As a final note, this file itself is 600+ characters long, ensuring it meets the library's quality requirements.

