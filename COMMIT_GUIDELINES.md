# Commit Guidelines for AI Prompt Library

## Overview
This document outlines best practices for clean, production-ready commits in the AI Prompt Library project and any projects built using this library.

## What Should Be Committed

### ✅ Always Commit
- **Source code**: Core library files, templates, and modules
- **Documentation**: README files, API docs, usage guides
- **Configuration**: Package.json, tsconfig.json, build configs
- **Tests**: Unit tests, integration tests, property-based tests
- **Templates**: Prompt templates in `prompts/modules/`
- **Validators**: Template validation logic in `src/`

### ❌ Never Commit
- **Kiro specs**: `.kiro/` directories (internal development only)
- **Generated outputs**: `prompts/outputs/` (except README.md)
- **Working copies**: `prompts/working_copy/` (except README.md)
- **Environment files**: `.env`, `.env.local`, etc.
- **Dependencies**: `node_modules/`, build artifacts
- **IDE files**: `.vscode/`, `.idea/`, etc.
- **Temporary files**: `*.tmp`, `*.log`, chat transcripts
- **OS files**: `.DS_Store`, `Thumbs.db`

## Commit Message Format

Use conventional commits format:

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### Types
- `feat`: New feature or template
- `fix`: Bug fix or template correction
- `docs`: Documentation changes
- `test`: Adding or fixing tests
- `refactor`: Code refactoring
- `style`: Code style changes
- `chore`: Maintenance tasks

### Examples
```bash
feat(fintech): add security considerations to budgeting templates

- Added comprehensive security sections to budgeting-tools.md
- Added configuration examples for production deployment
- Ensures compliance with financial data protection requirements

Fixes property-based test failure for fintech template completeness
```

```bash
fix(commerce): correct payment processing template validation

- Fixed missing integration examples in payment-processing.md
- Updated validator to handle new template structure
- All commerce template tests now pass
```

## Pre-Commit Checklist

Before committing, ensure:

1. **Tests pass**: `npm test` runs successfully
2. **No .kiro files**: Internal specs are not staged
3. **No temporary files**: Clean working directory
4. **Meaningful commit message**: Follows conventional format
5. **Focused changes**: Each commit addresses one logical change
6. **Documentation updated**: If adding features, update relevant docs

## Automated Checks

The repository includes pre-commit hooks that automatically:

- Run the full test suite
- Check for accidentally staged .kiro files
- Detect temporary or generated files
- Warn about large files (>1MB)
- Ensure clean commit state

## For Projects Using This Library

When building projects that use the AI Prompt Library:

### Recommended .gitignore additions
```gitignore
# AI Prompt Library artifacts
.kiro/
.kiro-*
prompts/outputs/*
!prompts/outputs/README.md
prompts/working_copy/*
!prompts/working_copy/README.md

# Generated specifications
specs/generated/
*.spec.generated.md

# Chat transcripts and development artifacts
chat-transcript.md
raw_chat.txt
development-log.md
```

### Project-specific commit guidelines
1. **Separate library updates**: Commit library template updates separately from application code
2. **Document template usage**: When using library templates, document which templates and versions
3. **Version lock**: Pin library versions in package.json for reproducible builds
4. **Template customizations**: Keep customizations separate from base templates

## Troubleshooting

### Accidentally committed .kiro files
```bash
# Remove from staging
git reset HEAD .kiro/

# Remove from history (if already committed)
git rm -r --cached .kiro/
git commit -m "chore: remove accidentally committed .kiro files"
```

### Large file warnings
```bash
# Check file sizes
find . -type f -size +1M -not -path "./node_modules/*" -not -path "./.git/*"

# Use Git LFS for large assets if needed
git lfs track "*.pdf"
git lfs track "*.zip"
```

### Pre-commit hook issues
```bash
# Make hook executable
chmod +x .husky/pre-commit

# Skip hooks temporarily (use sparingly)
git commit --no-verify -m "emergency fix"
```

## Best Practices Summary

1. **Keep commits atomic**: One logical change per commit
2. **Write clear messages**: Explain what and why, not just what
3. **Test before committing**: Ensure all tests pass
4. **Review changes**: Use `git diff --cached` before committing
5. **Clean working directory**: No untracked files or temporary artifacts
6. **Follow conventions**: Use established patterns and formats
7. **Document breaking changes**: Clearly mark any breaking changes
8. **Separate concerns**: Don't mix feature additions with refactoring

This ensures that every commit is production-ready and maintains the high quality standards of the AI Prompt Library project.