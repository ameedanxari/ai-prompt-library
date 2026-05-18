#!/bin/bash
# AI Prompt Library — library health check.
# Verifies the active orchestrator set + test suite health.

echo "🛡️ AI PROMPT LIBRARY HEALTH CHECK"
echo "=================================="

REQUIRED_FILES=(
    "prompts/AGENTS.md"
    "prompts/orchestrators/ai-agent-entry-point.md"
    "prompts/orchestrators/drill-down-engine.md"
    "prompts/orchestrators/external-input-handler.md"
    "prompts/orchestrators/module-selection-index.md"
    "scripts/validate-instantiation.sh"
    "scripts/validate-review-enforcement.sh"
    ".husky/pre-commit"
)

OPTIONAL_FILES=(
    "docs/optional/PREVENTION_CHECKLIST.md"
    "docs/optional/COMMIT_GUIDELINES.md"
    "docs/optional/SAFEGUARDS.md"
)

missing=0

echo ""
echo "🔹 Active orchestrators & scripts"
echo "---------------------------------"
for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file"
    else
        echo "❌ MISSING: $file"
        missing=$((missing+1))
    fi
done

echo ""
echo "🔸 Optional (load-on-demand) docs"
echo "---------------------------------"
for file in "${OPTIONAL_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file"
    else
        echo "⚠️  $file not present (optional)"
    fi
done

echo ""
echo "📊 TEST HEALTH"
echo "---------------"
if command -v npm >/dev/null 2>&1; then
    if npm test >/tmp/safeguard-test-output.log 2>&1; then
        summary=$(grep -E "Tests.*passed" /tmp/safeguard-test-output.log | tail -1)
        echo "✅ npm test passed"
        [ -n "$summary" ] && echo "   $summary"
    else
        summary=$(grep -E "Tests.*(passed|failed)" /tmp/safeguard-test-output.log | tail -1)
        echo "❌ npm test failed"
        [ -n "$summary" ] && echo "   $summary"
        missing=$((missing+1))
    fi
else
    echo "⚠️  npm not available — skipping test run"
fi

echo ""
if [ "$missing" -eq 0 ]; then
    echo "🟢 Library healthy"
    exit 0
else
    echo "🔴 $missing issue(s) — see above"
    exit 1
fi
