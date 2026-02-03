# Phase Check Template

## Purpose
Quick template for AI agents to verify they understand project phases correctly and are not misinterpreting "completed" stages.

## Implementation Patterns

### Pattern 1: Phase Understanding Verification

### Before Implementation, Ask Yourself:

1. **Am I seeing "completed" stages?**
   - ✅ If YES: These are design blueprints ready for implementation
   - ❌ If I think: These are finished work I can ignore

2. **What phase is the project in?**
   - **Design Phase**: Creating specifications and task lists
   - **Implementation Phase**: Building code following the specifications
   - **Production Phase**: Live system serving users

3. **What should I do with completed design stages?**
   - ✅ **Use them as implementation guides**
   - ✅ **Follow their specifications exactly**
   - ✅ **Reference them continuously during implementation**
   - ❌ **Ignore them because they're "done"**
   - ❌ **Start fresh with my own understanding**

### Phase Interpretation Test

**Scenario**: You see "Stage 03 - Architecture: ✅ Complete" in the project state.

**Question**: What does this mean?

**Correct Answer**: 
- ✅ Architecture design blueprint is complete and ready for implementation
- ✅ I should use this architecture specification to guide my implementation
- ✅ The architecture decisions are ready to be built into code

**Incorrect Answer**:
- ❌ Architecture work is finished and done
- ❌ I don't need to look at the architecture files
- ❌ I should design my own architecture for implementation

### Implementation Readiness Check

Before starting implementation, verify:

```markdown
## Implementation Readiness Checklist

### Design Artifacts Available
- [ ] Requirements specification exists and is complete
- [ ] Architecture specification exists and is complete  
- [ ] Feature specifications exist and are complete
- [ ] Task lists exist and are complete
- [ ] Implementation prompts exist and are complete

### Phase Understanding
- [ ] I understand completed stages are design blueprints
- [ ] I will use specifications as implementation guides
- [ ] I will follow task lists exactly as written
- [ ] I will not start fresh with my own understanding
- [ ] I will reference design artifacts continuously

### Enforcement Compliance
- [ ] I will follow the Implementation Enforcement Orchestrator
- [ ] I will execute tasks one by one from task lists
- [ ] I will validate against task acceptance criteria
- [ ] I will not deviate from task specifications
- [ ] I will update progress tracking after each task
```

## Common Misinterpretation Patterns

### Pattern 1: "It's Already Done"
**Wrong**: "I see the architecture is already complete, so I don't need to worry about it."
**Right**: "I see the architecture design is complete, so I have a blueprint to follow during implementation."

### Pattern 2: "Start Fresh"
**Wrong**: "The design phase is done, now I'll implement based on my understanding."
**Right**: "The design phase is done, now I'll implement exactly following the design specifications."

### Pattern 3: "Ignore Completed Work"
**Wrong**: "These files are marked complete, so they're not relevant anymore."
**Right**: "These files are marked complete, so they're ready to be used as implementation guides."

## Usage Instructions

### For AI Agents
1. **Before any implementation**: Run through this phase check
2. **If confused about phases**: Reference the Phase Clarification Orchestrator
3. **When starting implementation**: Use the Implementation Enforcement Orchestrator
4. **During implementation**: Continuously reference design specifications

### For Users
1. **If agent seems confused**: Point them to this template
2. **If implementation ignores design**: Invoke Implementation Enforcement Orchestrator
3. **If agent starts fresh**: Remind them about phase semantics

## Integration with Other Templates

- **Use with**: Implementation Enforcement Orchestrator
- **Use with**: Phase Clarification Orchestrator  
- **Use before**: Any implementation work
- **Use when**: Agent shows signs of phase misinterpretation

## Examples

### Example 1: Correct Phase Understanding
```
Agent Self-Check: "I see completed design stages"
Agent Response: "✅ These are blueprints ready for implementation"
Agent Action: "I will use specifications to guide my implementation"
```

### Example 2: Incorrect Phase Understanding (Corrected)
```
Agent Initial Thought: "Architecture is complete, so I'll ignore it"
Agent Self-Check: "Wait, let me verify my phase understanding"
Agent Correction: "✅ Architecture complete = blueprint ready for implementation"
Agent Action: "I will follow the architecture specification exactly"
```

### Example 3: Implementation Readiness Check
```
Agent Checklist:
- [ ] ✅ I understand completed stages are design blueprints
- [ ] ✅ I will use specifications as implementation guides  
- [ ] ✅ I will follow task lists exactly as written
- [ ] ✅ I will not start fresh with my own understanding
- [ ] ✅ I will reference design artifacts continuously

Result: "Ready for implementation following design blueprints"
```

This template helps ensure AI agents correctly understand that completed design stages are blueprints for implementation, not finished deliverables to be ignored.