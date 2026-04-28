# AI Agent Prevention Checklist

## 🚨 **MANDATORY - READ BEFORE ANY CHANGES**

This checklist MUST be completed before making ANY modifications to the AI Prompt Library codebase.

---

## **✅ Pre-Change Assessment**

### **1. System Understanding**
- [ ] I understand this is a prompt library with TypeScript test validators
- [ ] I know TypeScript files in `src/` are test infrastructure, NOT implementation code
- [ ] I have identified what the user is actually requesting

### **2. Current State Analysis**
- [ ] I have run `npm test` to check system health
- [ ] Current test success rate: ___/783 tests passing (must be 100%)
- [ ] I have checked `git status` for uncommitted changes

### **3. Impact Assessment**
- [ ] I have validated file purposes before any deletion/modification
- [ ] I have prepared a rollback plan if changes fail
- [ ] I have considered less destructive alternatives

---

## **❌ STOP CONDITIONS**

**DO NOT PROCEED IF:**
- You don't understand what TypeScript files in `src/` do (they're test validators)
- You haven't run tests to see current system state
- You're planning to delete files without proving they're unused
- Current test success rate is below 100% (all 783 tests must pass)

---

## **✅ Safe Change Patterns**

### **Instead of Deleting Files:**
- Create new orchestrators alongside existing files
- Add functionality without removing existing code
- Use git branches for experimental changes

### **Instead of Assuming File Purpose:**
- Read file headers and comments
- Check imports: `grep -r filename tests/`
- Verify actual usage with searches

---

## **🛡️ Required Safeguards**

Before proceeding:

```bash
# 1. Baseline Validation
echo "🛡️ Running test suite..."
npm test

# 2. Record Baseline
npm test > baseline_tests.log 2>&1
echo "📊 Baseline recorded"

# 3. Create Rollback Point
git stash push -m "Pre-change backup $(date)"
echo "💾 Rollback point created"
```

---

## **🎯 Success Criteria**

Changes are successful only if:
- [ ] Test success rate maintained or improved (100% - all 783 tests passing)
- [ ] No critical functionality broken
- [ ] Architecture consistency maintained
- [ ] All safeguards remain functional

---

## **🚨 Emergency Recovery**

If changes cause problems:
```bash
# Immediate rollback
git stash pop
git restore .
npm test  # Verify recovery
```

---

**Key Lesson**: Always understand before changing. The TypeScript files that appear "redundant" are essential test infrastructure validating template quality. Preserve existing functionality while adding new capabilities.