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

1. **Review all changes**: Use `git status` and `git diff --cached` to examine each file
2. **Clean up artifacts**: Remove debugging markers (TODO, FIXME, DEBUG, TEMP, XXX)
3. **Remove empty files**: No files with zero content should be committed
4. **Tests pass**: `npm test` runs successfully (100% pass rate required)
5. **No .kiro files**: Internal specs are not staged
6. **No temporary files**: Clean working directory (.tmp, .bak, etc.)
7. **Meaningful commit message**: Follows conventional format
8. **Focused changes**: Each commit addresses one logical change
9. **Documentation updated**: If adding features, update relevant docs
10. **Production ready**: All content suitable for end users

### Critical Blockers - STOP and Fix
- ❌ **Empty files** in the commit
- ❌ **Debugging markers** (TODO, FIXME, DEBUG, TEMP, XXX)
- ❌ **Temporary files** (.tmp, .bak, etc.)
- ❌ **Broken references** or links
- ❌ **Massive commits** with unrelated changes

### Proper Review Workflow
```bash
# 1. Review what's changed
git status
git diff --cached

# 2. Run the same review-enforcement gates used by CI
npm run validate:review

# 3. Stage files individually after review
git add path/to/reviewed-file.md

# 4. Commit with proper message
git commit -m "feat: descriptive message following conventions"
```

## Automated Checks

The repository includes pre-commit hooks that automatically:

- Run the full test suite
- Run the same review-enforcement gates used by CI
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

### Recovery from Bad Commits
```bash
# If committed locally but not pushed
git reset --soft HEAD~1  # Undo commit, keep changes staged
# Review, clean up, then recommit properly

# If already pushed (use carefully)
git commit -m "fix: Remove debugging artifacts from previous commit"
# Or force push if safe: git push --force-with-lease origin main
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

1. **Review before staging**: Use `git diff` to examine all changes
2. **Clean up artifacts**: Remove debugging markers and temporary files
3. **Keep commits atomic**: One logical change per commit
4. **Write clear messages**: Explain what and why, not just what
5. **Test before committing**: Ensure all tests pass (100% success rate required)
6. **Stage selectively**: Use `git add file` instead of `git add .`
7. **Follow conventions**: Use established patterns and formats
8. **Document breaking changes**: Clearly mark any breaking changes
9. **Separate concerns**: Don't mix feature additions with refactoring
10. **Validate production readiness**: All content suitable for end users

### Learning from Incidents
This enhanced checklist incorporates lessons learned from production incidents where debugging artifacts and empty files were accidentally committed. The key is to **always review before staging** and **never use `git add .` without examination**.

This ensures that every commit is production-ready and maintains the high quality standards of the AI Prompt Library project.
