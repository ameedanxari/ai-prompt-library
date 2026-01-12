# Architecture Guard Instructions

## Purpose

These instructions ensure AI agents review existing implementation and maintain architectural consistency when making changes to projects using the AI Prompt Library.

## Critical Rules

### Before Making Any Changes

1. **Review Current State**: Always examine existing templates, modules, and patterns before proposing changes
2. **Understand Dependencies**: Check how components relate to each other using the library's structure
3. **Preserve Functionality**: Never reduce existing capabilities to fix issues or add features
4. **Maintain Consistency**: Follow established patterns in the codebase

### When Modifying Templates

1. **Check Required Sections**: All templates must have:
   - `## Purpose` - What the template does
   - `## Instructions` or `## Implementation Patterns` - How to use it
   - `## Examples` - Code examples demonstrating usage

2. **Validate Structure**: Ensure templates follow the established format for their type:
   - README files: Purpose, Instructions, Examples, Templates sections
   - Domain templates: Purpose, Instructions/Implementation Patterns, Examples
   - Feature patterns: Purpose, Instructions, Examples

3. **Preserve Code Examples**: Never remove code examples without replacement

### When Adding New Features

1. **Align with Existing Patterns**: New features should follow conventions established by similar existing features
2. **Include All Required Sections**: New templates must include all required sections
3. **Add Integration Points**: Document how new features integrate with existing modules
4. **Update Related Documentation**: Ensure README files and indexes are updated

### When Fixing Issues

1. **Identify Root Cause**: Understand why the issue exists before fixing
2. **Minimal Changes**: Make the smallest change that fixes the issue
3. **No Functionality Loss**: Fixes must not remove or break existing features
4. **Test Impact**: Consider how the fix affects related components

## Validation Checklist

Before completing any change, verify:

- [ ] Existing functionality is preserved
- [ ] New code follows established patterns
- [ ] Required sections are present in all templates
- [ ] Code examples are included and valid
- [ ] Related documentation is updated
- [ ] Changes align with library's modular design principles

## Library Principles to Maintain

1. **Modular and Composable**: Templates are building blocks that combine to create solutions
2. **Production-Ready Defaults**: Best practices are built-in, not optional
3. **Context-Agnostic**: Each template works independently without requiring prior context
4. **Incremental Development**: Changes build on existing work without breaking it
