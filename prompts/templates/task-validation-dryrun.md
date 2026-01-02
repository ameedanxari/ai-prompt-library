# Task Validation Dry-Run Template

## Purpose
Validate task structure, dependencies, and executability without performing actual implementation, saving tokens and identifying issues early.

## Instructions
Use this template to perform dry-run validation of tasks before implementation. Analyze task structure for completeness, check context independence, validate executability, and identify potential issues without consuming implementation resources. This helps catch problems early and ensures tasks are well-structured for successful execution.

## Examples
```markdown
# Example: Task Validation Report

## Task: "Implement User Authentication API"

### Structure Validation: ✅ PASS
- ✅ Clear, action-oriented title
- ✅ Specific objective defined
- ✅ Prerequisites listed (database setup, JWT library)
- ✅ Resources linked (API spec, security guidelines)
- ✅ Implementation steps concrete
- ✅ Acceptance criteria verifiable

### Context Independence: ⚠️ MINOR ISSUES
- ✅ Task understandable without external context
- ✅ All references are absolute
- ⚠️ Minor: Assumes knowledge of existing user model structure
- ✅ Dependencies explicitly stated

### Executability: ✅ PASS
- ✅ All steps actionable
- ✅ Clear input/output for each step
- ✅ Validation commands provided
- ✅ Error scenarios addressed

## Validation Result: ✅ APPROVED
**Minor Fix Required**: Add user model schema reference
**Estimated Execution Time**: 4-6 hours
**Risk Level**: Low
```

## Dry-Run Validation Process

### 1. Task Structure Analysis
```markdown
## Task Structure Validation

### Completeness Check
- [ ] Task has clear, action-oriented title
- [ ] Objective is specific and measurable
- [ ] Prerequisites are explicitly listed
- [ ] Resources are linked and accessible
- [ ] Implementation steps are concrete
- [ ] Acceptance criteria are verifiable
- [ ] Validation commands are provided

### Context Independence Check
- [ ] Task can be understood without external context
- [ ] All references are absolute, not relative
- [ ] No assumptions about previous conversations
- [ ] All necessary information is included
- [ ] Dependencies are explicitly stated

### Executability Check
- [ ] Implementation steps are actionable
- [ ] Each step has clear input/output
- [ ] Steps build logically on each other
- [ ] Validation is possible at each step
- [ ] Success criteria are measurable
```

### 2. Dependency Validation
```markdown
## Dependency Analysis

### Prerequisite Verification
For each prerequisite:
- **Prerequisite**: [name/description]
- **Verification Method**: [how to check if complete]
- **Availability**: [accessible/missing/unclear]
- **Risk Level**: [low/medium/high if missing]

### Resource Accessibility
For each required resource:
- **Resource**: [file/tool/service]
- **Location**: [path/URL/reference]
- **Accessibility**: [available/missing/restricted]
- **Alternatives**: [backup options if unavailable]

### External Dependencies
- **Tools Required**: [list with version requirements]
- **Services Needed**: [external services or APIs]
- **Permissions Required**: [access levels needed]
- **Network Dependencies**: [internet/intranet requirements]
```

### 3. Effort Estimation
```markdown
## Effort Analysis

### Complexity Assessment
- **Technical Complexity**: [low/medium/high]
- **Integration Complexity**: [low/medium/high]
- **Testing Complexity**: [low/medium/high]
- **Overall Complexity**: [assessment with reasoning]

### Time Estimation
- **Preparation Time**: [setup and context loading]
- **Implementation Time**: [core development work]
- **Validation Time**: [testing and verification]
- **Documentation Time**: [updates and handoff]
- **Total Estimated Time**: [sum with confidence level]

### Risk Factors
- **Technical Risks**: [potential implementation challenges]
- **Dependency Risks**: [external factors that could block progress]
- **Integration Risks**: [potential conflicts with existing code]
- **Timeline Risks**: [factors that could extend duration]
```
## Validation Outputs

### Task Readiness Report
```markdown
## Task Readiness Assessment

### Overall Status: [READY/NEEDS_WORK/BLOCKED]

### Strengths
- [Aspect that is well-defined]
- [Another positive aspect]
- [Clear or well-structured element]

### Issues Identified
- **Issue**: [specific problem]
  - **Impact**: [how this affects execution]
  - **Recommendation**: [suggested fix]
- **Issue**: [another problem]
  - **Impact**: [effect on task completion]
  - **Recommendation**: [how to resolve]

### Recommendations
1. **High Priority**: [critical changes needed]
2. **Medium Priority**: [improvements that would help]
3. **Low Priority**: [nice-to-have enhancements]

### Execution Readiness
- **Can Execute Now**: [yes/no with reasoning]
- **Blockers to Resolve**: [list of blocking issues]
- **Estimated Fix Time**: [time to address issues]
```

### Optimization Suggestions
```markdown
## Task Optimization Recommendations

### Scope Refinement
- **Current Scope**: [what the task currently covers]
- **Suggested Scope**: [recommended adjustments]
- **Rationale**: [why the change would help]

### Dependency Optimization
- **Current Dependencies**: [list of prerequisites]
- **Optimization Options**:
  - Remove dependency: [which ones could be eliminated]
  - Parallel execution: [what could run concurrently]
  - Defer dependency: [what could be delayed]

### Session Structure Optimization
- **Current Structure**: [how task is organized]
- **Suggested Improvements**:
  - Break into smaller tasks: [if too large]
  - Combine with other tasks: [if too small]
  - Reorder steps: [for better flow]
  - Add checkpoints: [for better resumability]
```

## Dry-Run Execution Modes

### Quick Validation Mode
```markdown
## Quick Dry-Run (5-10 minutes)

### Focus Areas
- Task structure completeness
- Critical dependency availability
- Major blocking issues
- Basic executability

### Output
- **Status**: [PASS/FAIL/NEEDS_REVIEW]
- **Critical Issues**: [list of blockers]
- **Quick Fixes**: [immediate improvements needed]
```

### Comprehensive Analysis Mode
```markdown
## Comprehensive Dry-Run (20-30 minutes)

### Full Analysis Includes
- Complete task structure validation
- Detailed dependency analysis
- Effort estimation and risk assessment
- Optimization recommendations
- Alternative approach suggestions

### Output
- **Detailed Report**: [comprehensive assessment]
- **Risk Analysis**: [potential issues and mitigations]
- **Optimization Plan**: [suggested improvements]
- **Execution Strategy**: [recommended approach]
```

### Planning Mode
```markdown
## Planning Dry-Run (10-15 minutes)

### Planning Focus
- Task sequencing and dependencies
- Resource allocation and timing
- Integration points and handoffs
- Quality gates and checkpoints

### Output
- **Execution Plan**: [step-by-step approach]
- **Timeline**: [estimated schedule]
- **Resource Requirements**: [what's needed when]
- **Risk Mitigation**: [contingency plans]
```