# Change Review Instructions

## Purpose

These instructions guide AI agents through reviewing and validating changes to ensure they don't break existing functionality or diverge from established architecture.

## Before Implementing Changes

### 1. Understand the Request

- What is being changed and why?
- What existing functionality might be affected?
- What patterns already exist for similar features?

### 2. Review Existing Implementation

- Examine current templates in the affected area
- Check how similar features are implemented elsewhere
- Identify dependencies and integration points

### 3. Plan the Change

- Determine minimal changes needed
- Identify all files that need modification
- Plan for documentation updates

## During Implementation

### 1. Follow Established Patterns

- Match the style and structure of existing templates
- Use consistent naming conventions
- Include all required sections

### 2. Preserve Existing Functionality

- Don't remove features to fix issues
- Don't simplify by removing capabilities
- Maintain backward compatibility

### 3. Update Documentation

- Update README files if adding new templates
- Update integration points if changing interfaces
- Add examples for new functionality

## After Implementation

### 1. Validate Changes

- Verify all required sections are present
- Check that code examples are valid
- Ensure cross-references are correct

### 2. Test Impact

- Run existing tests to verify no regression
- Check that related features still work
- Validate integration points

### 3. Document the Change

- Record what was changed and why
- Note any decisions made during implementation
- Update any affected documentation

## Red Flags to Watch For

- Removing sections from templates
- Deleting code examples
- Changing established patterns without clear reason
- Breaking integration points
- Reducing functionality to fix issues

## When in Doubt

1. Ask for clarification before making changes
2. Propose the change and get confirmation
3. Make minimal changes and iterate
4. Preserve existing functionality above all else
