#!/bin/bash
# AI Prompt Library - Safeguard System Validation

echo "🛡️ AI PROMPT LIBRARY SAFEGUARD VALIDATION"
echo "=========================================="

# Check for required safeguard files
REQUIRED_FILES=(
    "PREVENTION_CHECKLIST.md"
    "COMMIT_GUIDELINES.md"
    "docs/SAFEGUARDS.md"
    "prompts/orchestrators/change-impact-guard.md"
    "prompts/orchestrators/self-healing-monitor.md"
    "prompts/orchestrators/implementation-enforcement-orchestrator.md"
    "prompts/orchestrators/ai-agent-entry-point.md"
    ".husky/pre-commit"
)

missing_files=0
for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file"
    else
        echo "❌ MISSING: $file"
        ((missing_files++))
    fi
done

# Check test baseline
echo ""
echo "📊 TEST BASELINE VALIDATION"
echo "----------------------------"
if command -v npm >/dev/null 2>&1; then
    test_output=$(npm test 2>&1)
    # Parse the final summary line that shows "Tests  X failed | Y passed (Z)"
    passing_tests=$(echo "$test_output" | grep -E "Tests.*passed" | tail -1 | grep -o "[0-9]* passed" | grep -o "[0-9]*" || echo "0")
    failed_tests=$(echo "$test_output" | grep -E "Tests.*failed" | tail -1 | grep -o "[0-9]* failed" | grep -o "[0-9]*" || echo "0")
    
    echo "📊 Test Results: $passing_tests passed, $failed_tests failed"
    
    # STRICT REQUIREMENT: 100% test success rate
    if [ "$failed_tests" -eq 0 ]; then
        echo "✅ Test Success: 100% tests passing (REQUIRED)"
    else
        echo "❌ CRITICAL FAILURE: $failed_tests tests failing"
        echo "🚨 SAFEGUARD VIOLATION: 100% test success rate required"
        echo "🔧 REQUIRED ACTION: Fix all failing tests before proceeding"
        ((missing_files++))
    fi
else
    echo "⚠️ npm not available - cannot validate test baseline"
fi

# Check pre-commit hook
echo ""
echo "🪝 PRE-COMMIT HOOK VALIDATION"
echo "------------------------------"
if [ -x ".husky/pre-commit" ]; then
    echo "✅ Pre-commit hook is executable"
else
    echo "❌ Pre-commit hook is not executable"
    echo "🔧 Fix: chmod +x .husky/pre-commit"
    ((missing_files++))
fi

# Check orchestrator integration
echo ""
echo "🤖 ORCHESTRATOR INTEGRATION"
echo "----------------------------"
if grep -q "ai-agent-entry-point" prompts/steering/library-context.md 2>/dev/null; then
    echo "✅ AI Agent Entry Point integrated in steering"
else
    echo "⚠️ AI Agent Entry Point not referenced in steering files"
fi

if grep -q "change-impact-guard" prompts/orchestrators/ai-agent-entry-point.md 2>/dev/null; then
    echo "✅ Change Impact Guard integrated in entry point"
else
    echo "⚠️ Change Impact Guard not integrated in entry point"
fi

# Overall status
echo ""
echo "🎯 OVERALL SAFEGUARD STATUS"
echo "==========================="
if [ "$missing_files" -eq 0 ]; then
    echo "🟢 ALL SAFEGUARDS ACTIVE - System fully protected"
    exit 0
else
    echo "🔴 SAFEGUARDS COMPROMISED - $missing_files issues found"
    echo ""
    echo "🔧 RECOMMENDED ACTIONS:"
    echo "1. Restore missing files from git"
    echo "2. Run npm test to validate system health"
    echo "3. Ensure pre-commit hooks are executable"
    echo "4. Review docs/SAFEGUARDS.md for complete system overview"
    exit 1
fi