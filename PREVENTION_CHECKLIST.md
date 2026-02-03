# AI Agent Prevention Checklist

## 🚨 MANDATORY CHECKLIST - READ BEFORE ANY CHANGES

This checklist MUST be completed before making ANY modifications to the AI Prompt Library codebase.

### ✅ Pre-Change Assessment (MANDATORY)

#### 1. System Understanding
- [ ] I have read and understood the project README
- [ ] I understand this is a prompt library with TypeScript test validators
- [ ] I know the difference between implementation (orchestrators) and validation (TypeScript)
- [ ] I have identified what the user is actually asking for

#### 2. Current State Analysis  
- [ ] I have run `npm test` to understand current system health
- [ ] I have recorded the current test success rate: ___/598 tests passing
- [ ] I have identified any existing failing tests and their causes
- [ ] I have checked `git status` to see any uncommitted changes

#### 3. File Purpose Validation
For each file I plan to modify/remove:
- [ ] I have checked if it's imported by tests: `grep -r filename tests/`
- [ ] I have verified if it's a test validator (contains validation logic)
- [ ] I have confirmed it's not part of core architecture
- [ ] I have alternative solution that doesn't break existing functionality

#### 4. Impact Assessment
- [ ] I have estimated how many tests might be affected
- [ ] I have identified all dependencies of files I plan to change
- [ ] I have prepared a rollback plan if changes fail
- [ ] I have considered less destructive alternatives

### ❌ STOP CONDITIONS - DO NOT PROCEED IF:

- [ ] You don't understand what TypeScript files in `src/` do
- [ ] You haven't run tests to see current system state  
- [ ] You're planning to delete files without proving they're unused
- [ ] You're making assumptions about file purposes
- [ ] You don't have a rollback plan
- [ ] Current test success rate is below 95%

### ✅ Safe Change Patterns

#### Instead of Deleting Files:
- [ ] Create new orchestrators alongside existing files
- [ ] Add functionality without removing existing code
- [ ] Enhance existing templates rather than replacing them
- [ ] Use git branches for experimental changes

#### Instead of Assuming File Purpose:
- [ ] Read file headers and comments
- [ ] Check imports and exports
- [ ] Look for test patterns (describe, it, expect)
- [ ] Verify actual usage with grep searches

#### Instead of Breaking Tests:
- [ ] Understand why tests exist
- [ ] Preserve test infrastructure
- [ ] Add tests for new functionality
- [ ] Maintain or improve test coverage

### 🛡️ Safeguard Activation

Before proceeding with changes:

```bash
# 1. Activate Change Impact Guard
echo "🛡️ Activating Change Impact Guard..."
# Run impact assessment from prompts/orchestrators/change-impact-guard.md

# 2. Enable Self-Healing Monitor  
echo "🏥 Enabling Self-Healing Monitor..."
# Set up monitoring from prompts/orchestrators/self-healing-monitor.md

# 3. Create Rollback Point
git stash push -m "Pre-change backup $(date)"
echo "💾 Rollback point created"

# 4. Record Baseline
npm test > baseline_tests.log 2>&1
echo "📊 Baseline recorded"
```

### 🎯 Success Criteria

Changes are successful only if:
- [ ] Test success rate maintained or improved (≥590 passing tests)
- [ ] No critical functionality broken
- [ ] Architecture consistency maintained
- [ ] All safeguards remain functional
- [ ] Documentation updated appropriately

### 🚨 Emergency Recovery

If changes cause problems:

```bash
# Immediate rollback
git stash pop
git restore .

# Verify recovery
npm test

# If still broken, restore from git
git reset --hard HEAD
```

## 📋 Common Failure Patterns to Avoid

### 1. The "TypeScript Removal" Anti-Pattern
- **Wrong**: "These TypeScript files look redundant, let me remove them"
- **Right**: "Let me understand what these TypeScript files do first"

### 2. The "Assumption" Anti-Pattern  
- **Wrong**: "This must be implementation code"
- **Right**: "Let me check what this code actually does"

### 3. The "Test Ignorance" Anti-Pattern
- **Wrong**: "I'll make changes and see what breaks"
- **Right**: "Let me run tests first to understand the system"

### 4. The "Architecture Violation" Anti-Pattern
- **Wrong**: "I'll restructure everything to match my understanding"
- **Right**: "Let me work within the existing architecture"

## 🎓 Learning from This Incident

The recent regression where TypeScript test validators were nearly deleted demonstrates why this checklist is critical. The files that appeared to be "redundant implementation" were actually essential test infrastructure validating template quality.

**Key Lesson**: Always understand before changing, never assume file purposes, and preserve existing functionality while adding new capabilities.

---

**By completing this checklist, you help ensure the AI Prompt Library remains stable, functional, and self-healing for production use.**