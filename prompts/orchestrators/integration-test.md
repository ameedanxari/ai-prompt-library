# Integration Test for Agentic AI Environments

## Purpose
Test that the AI Prompt Library automation works seamlessly in chat-based AI development environments (Kiro, Cursor, Windsurf, Claude, etc.).

## Test Scenarios

### Test 1: New Project Setup
**User Input**: "I want to use the AI Prompt Library to build a todo app"

**Expected AI Response**:
```
I'll analyze your request and route it optimally using the AI Prompt Library system.

*Invoking AI Agent Entry Point...*

🚀 INITIALIZING AI PROMPT LIBRARY

I need to set up everything automatically so you can start building immediately.

*Setting up AI Prompt Library...*
```

**Expected Actions**:
1. Detect no `.ai-prompts/` directory
2. Clone/submodule the library
3. Setup steering files for current AI tool
4. Create NEXT_ACTION.md and MY_PROJECT.md
5. Display setup completion message

**Success Criteria**:
- ✅ Library initialized without manual steps
- ✅ State files created automatically
- ✅ Steering files configured for AI tool
- ✅ User gets clear next steps

### Test 2: Simple Fix Request
**User Input**: "Fix the typo in line 15 of README.md"

**Expected AI Response**:
```
I'll analyze your request and route it optimally using the AI Prompt Library system.

*Invoking AI Agent Entry Point...*

⚡ ATOMIC TASK EXECUTION

This looks like a focused change I can implement directly.

**Analysis:**
- Estimated files: 1
- Complexity: Low
- Approach: Direct implementation

**Executing...**
```

**Expected Actions**:
1. Detect library is initialized
2. Classify as atomic task
3. Execute fix directly
4. No pipeline overhead

**Success Criteria**:
- ✅ Request routed to atomic execution
- ✅ No unnecessary pipeline stages
- ✅ Direct fix applied
- ✅ Optimal token usage

### Test 3: Complex Feature Request
**User Input**: "Add user authentication with OAuth and role-based permissions"

**Expected AI Response**:
```
I'll analyze your request and route it optimally using the AI Prompt Library system.

*Invoking AI Agent Entry Point...*

🏗️ PIPELINE TASK EXECUTION

This is a significant feature that will benefit from structured specifications.

**Analysis:**
- Complexity: High
- Multiple components: Yes
- Approach: AI Prompt Library pipeline

**Starting Stage 01 - Intake...**
```

**Expected Actions**:
1. Detect complex feature request
2. Route to pipeline approach
3. Start Stage 01 - Intake
4. Update NEXT_ACTION.md

**Success Criteria**:
- ✅ Request routed to pipeline
- ✅ Stage 01 executed
- ✅ State files updated
- ✅ Comprehensive approach used

### Test 4: Continue Request
**User Input**: "Continue"

**Expected AI Response**:
```
I'll analyze your request and route it optimally using the AI Prompt Library system.

*Invoking AI Agent Entry Point...*

📋 CONTINUE PIPELINE

Reading current state from NEXT_ACTION.md...

**Current Status:**
- Stage: Stage 02 - Charter
- Phase: Specification
- Next Action: Create project charter

**Action:** Continuing from where we left off...
```

**Expected Actions**:
1. Read NEXT_ACTION.md
2. Execute specified next action
3. Update state after completion
4. Set up next action

**Success Criteria**:
- ✅ State read correctly
- ✅ Next action executed
- ✅ State updated for next agent
- ✅ Seamless continuation

### Test 5: Cross-Agent Handoff
**Scenario**: User starts in Cursor, continues in Kiro

**Expected Behavior**:
1. Cursor agent creates NEXT_ACTION.md with current state
2. User switches to Kiro
3. Kiro agent reads NEXT_ACTION.md
4. Kiro continues seamlessly from exact same point

**Success Criteria**:
- ✅ No context loss between agents
- ✅ State preserved across tools
- ✅ Steering files work in both tools
- ✅ Identical behavior regardless of AI tool

## Running the Tests

### For AI Agents:
1. Copy each test scenario user input
2. Invoke the AI Agent Entry Point
3. Verify expected responses and actions
4. Check that success criteria are met

### For Developers:
1. Test in multiple AI environments (Kiro, Cursor, Windsurf)
2. Verify bash commands execute correctly
3. Check file creation and state management
4. Validate cross-agent compatibility

## Expected Benefits

After implementing the automation:
- ✅ **Zero setup friction**: New users start immediately
- ✅ **Optimal routing**: Right approach for each request type
- ✅ **Token efficiency**: No wasted tokens on wrong approach
- ✅ **State preservation**: Seamless agent handoffs
- ✅ **Tool agnostic**: Works with any AI development environment
- ✅ **Error recovery**: Automatic fallbacks and validation

## Troubleshooting

### If Setup Fails:
- Check git availability for submodule
- Fall back to direct clone
- Verify file permissions for steering files
- Create manual directory structure if needed

### If Routing Fails:
- Default to asking user for clarification
- Provide explicit options (atomic vs pipeline)
- Show confidence scores for transparency

### If State Corruption:
- Offer to recreate NEXT_ACTION.md from template
- Validate state consistency
- Provide recovery options

This integration test ensures the AI Prompt Library works seamlessly in real agentic AI development environments without requiring TypeScript compilation or Node.js execution.
## Implementation Patterns

### Pattern 1: End-to-End Integration Testing
```bash
# Test complete workflow from start to finish
test_end_to_end_integration() {
    echo "🧪 Integration Test: End-to-end workflow"
    
    # Setup test environment
    setup_test_environment
    
    # Execute complete workflow
    execute_complete_workflow
    
    # Validate all outputs
    validate_all_outputs
    
    echo "✅ End-to-end integration test complete"
}
```

### Pattern 2: Component Integration Validation
```bash
# Validate integration between components
validate_component_integration() {
    echo "🔗 Integration Test: Component validation"
    
    # Test orchestrator interactions
    test_orchestrator_interactions
    
    # Validate data flow
    validate_data_flow
    
    # Check state consistency
    check_state_consistency
    
    echo "✅ Component integration validated"
}
```

### Pattern 3: Quality Gate Integration
```bash
# Test quality gates in integration scenarios
test_quality_gate_integration() {
    echo "🚪 Integration Test: Quality gate testing"
    
    # Test quality validation pipeline
    test_quality_validation_pipeline
    
    # Validate gate enforcement
    validate_gate_enforcement
    
    # Test failure recovery
    test_failure_recovery
    
    echo "✅ Quality gate integration tested"
}
```

## Examples

### Example 1: Full Pipeline Integration Test
```
Tester: "🧪 Integration Test: Full pipeline test"
Tester: "🚀 PHASE 1: Setup and initialization"
Tester: "🏗️ PHASE 2: Specification generation"
Tester: "⚡ PHASE 3: Implementation tasks"
Tester: "✅ SUCCESS: All phases integrated successfully"
```

### Example 2: Cross-Orchestrator Communication
```
Tester: "🔗 Integration Test: Orchestrator communication"
Tester: "📊 TEST: Entry Point → Router → Pipeline"
Tester: "🔄 VALIDATION: State management across handoffs"
Tester: "✅ PASS: Seamless orchestrator integration"
```

### Example 3: Error Handling Integration
```
Tester: "🚨 Integration Test: Error handling"
Tester: "💥 INJECT: Simulated failure in Stage 3"
Tester: "🔄 RECOVERY: Error recovery orchestrator activated"
Tester: "✅ SUCCESS: System recovered and continued"
```