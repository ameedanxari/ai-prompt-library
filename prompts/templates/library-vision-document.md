# Library Vision Document Template

## Purpose
Maintain a comprehensive vision document that serves as the authoritative reference for evaluating proposed changes to the AI Prompt Library. This template defines the library's core mission, guiding principles, and quality standards that all modifications must align with. It also provides rollback procedures and cross-platform consistency validation to ensure library integrity.

## Instructions
Use this template to create and maintain the library vision document. Reference this document when evaluating any proposed changes to ensure alignment with the library's core mission and principles. When changes are approved, document the rationale thoroughly. If changes negatively impact library functionality, follow the rollback procedures to restore previous state. Regularly validate cross-platform consistency to maintain feature parity.

## Examples

### Example 1: Vision Alignment Check
```markdown
# Vision Alignment Check: Add GraphQL Support

## Proposed Change
Add GraphQL API generation templates to the technology stacks module.

## Vision Alignment Assessment

### Mission Alignment
**Library Mission**: Transform minimal user input into comprehensive, production-ready specifications.

**Assessment**: ✅ ALIGNED
- GraphQL support expands the library's capability to generate specifications
- Maintains the minimal input → comprehensive output paradigm
- Enhances production-readiness for modern API architectures

### Principle Alignment
| Principle | Status | Evidence |
|-----------|--------|----------|
| Modular | ✅ | GraphQL templates are self-contained modules |
| Composable | ✅ | Can be combined with existing REST templates |
| Production-Ready | ✅ | Includes security, caching, and error handling |
| Bite-sized | ✅ | Templates are focused and concise |

### Quality Standard Compliance
- [ ] ✅ Follows template structure guidelines
- [ ] ✅ Includes comprehensive examples
- [ ] ✅ Has clear instructions for AI consumption
- [ ] ✅ Maintains cross-platform consistency

### Decision
**Status**: APPROVED - Fully aligned with library vision
**Rationale**: Enhances library capabilities while maintaining all core principles
```

### Example 2: Rollback Procedure Execution
```markdown
# Rollback Record: Stage Pipeline Restructure

## Rollback Trigger
**Date**: 2024-01-20
**Trigger**: Integration tests failing after stage consolidation
**Impact**: 15% of generated specifications missing required sections

## Rollback Execution

### Step 1: Stop Current Changes
```bash
# Halt any ongoing deployments
git revert HEAD~3..HEAD --no-commit

# Verify revert scope
git diff --stat HEAD
```

### Step 2: Restore Previous State
```bash
# Restore from backup tag
git checkout v2.3.0 -- prompts/stages/

# Verify restoration
npm run test:integration -- --run
```

### Step 3: Validate Restoration
- [x] All integration tests pass
- [x] Cross-platform validation successful
- [x] No missing sections in generated specs
- [x] Performance metrics restored

### Step 4: Document Lessons Learned
**Root Cause**: Stage consolidation removed implicit dependencies
**Prevention**: Add dependency validation to change assessment
**Follow-up**: Schedule architecture review for revised approach

## Rollback Completion
**Duration**: 45 minutes
**Data Loss**: None
**Service Impact**: Minimal (development environment only)
```

### Example 3: Cross-Platform Consistency Validation
```markdown
# Cross-Platform Consistency Report

## Validation Date: 2024-01-15
## Scope: All stage templates

### Platform Coverage Matrix
| Stage | Web | Mobile | Platform-Agnostic | Consistent |
|-------|-----|--------|-------------------|------------|
| Stage 01 - Intake | ✅ | ✅ | ✅ | ✅ |
| Stage 02 - Charter | ✅ | ✅ | ✅ | ✅ |
| Stage 03 - Architecture | ✅ | ✅ | ✅ | ✅ |
| Stage 04 - Features | ✅ | ✅ | ✅ | ✅ |
| Stage 05 - Testing | ✅ | ✅ | ✅ | ✅ |
| Stage 06 - Implementation | ✅ | ✅ | ✅ | ✅ |

### Consistency Issues Found
None - All platforms have equivalent coverage

### Recommendations
- Continue monitoring after template updates
- Add automated consistency checks to CI pipeline
```

## Core Principles
- **Vision Integrity**: All changes must align with the library's core mission
- **Documented Rationale**: Every change must have clear, documented reasoning
- **Safe Rollback**: Procedures must exist to safely revert any change
- **Platform Parity**: Cross-platform consistency must be maintained

### Related Documents
- [Library Change Assessment](./library-change-assessment.md) - Impact assessment for changes
- [Library Dependency Map](./library-dependency-map.md) - Component relationships and dependencies

## Library Vision Framework

### Mission Statement
```markdown
# AI Prompt Library Mission

## Core Mission
Transform minimal user input into comprehensive, production-ready software specifications and implementation plans through a sophisticated template-driven system.

## Vision
To be the definitive resource for AI-assisted software development, enabling any user—regardless of technical expertise—to generate enterprise-grade specifications that embody industry best practices.

## Key Objectives
1. **Accessibility**: Make professional software specification accessible to non-technical users
2. **Quality**: Ensure all generated outputs meet production-ready standards
3. **Efficiency**: Minimize input requirements while maximizing output comprehensiveness
4. **Consistency**: Maintain uniform quality across all platforms and technologies
5. **Extensibility**: Support continuous evolution without breaking existing functionality

## Success Metrics
- User input reduction: Achieve comprehensive specs from 2-3 sentence briefs
- Quality score: 95%+ of generated specs pass quality validation
- Platform parity: 100% feature consistency across supported platforms
- Adoption: Successful use across diverse project types and scales
```

### Guiding Principles
```markdown
# Library Guiding Principles

## Principle 1: Modular and Composable
**Definition**: All prompts must be like Lego blocks—basic, unit-level components that can build anything while keeping context manageable.

**Implications**:
- Each template should have a single, clear purpose
- Templates should be combinable without modification
- Dependencies should be explicit and minimal
- Changes to one template should not require changes to others

**Evaluation Criteria**:
- Can the template be used independently?
- Does it combine cleanly with other templates?
- Are its dependencies clearly documented?
- Does it avoid hidden coupling?

## Principle 2: Integrated Best Practices
**Definition**: Production-ready features (offline resilience, security, accessibility, etc.) are embedded within feature prompts, not separate stages.

**Implications**:
- Best practices are not optional add-ons
- Security, accessibility, and performance are built-in
- Quality is inherent, not bolted on
- Production-readiness is the default state

**Evaluation Criteria**:
- Does the template include relevant best practices?
- Are security considerations addressed?
- Is accessibility built into the design?
- Does it produce production-ready output?

## Principle 3: Bite-sized Context
**Definition**: Everything must be small enough to avoid context overrun while maintaining trackable state management.

**Implications**:
- Templates should be concise and focused
- Large concepts should be broken into smaller pieces
- State should be explicitly tracked
- Context should be preserved across sessions

**Evaluation Criteria**:
- Is the template concise enough for AI consumption?
- Can state be tracked across multiple sessions?
- Is context preserved without bloat?
- Are large tasks properly decomposed?

## Principle 4: Feature-Module Breakdown
**Definition**: Break requirements into features and modules, flesh out with relevant modular prompt templates.

**Implications**:
- Requirements should be decomposed systematically
- Features should map to specific modules
- Modules should be reusable across features
- The breakdown should be logical and maintainable

**Evaluation Criteria**:
- Is the feature-module mapping clear?
- Are modules appropriately scoped?
- Can modules be reused effectively?
- Is the structure maintainable?

## Principle 5: Dry-run Capability
**Definition**: Include dry-run options to validate complete stage outputs without generating code or consuming excessive tokens.

**Implications**:
- Validation should be possible without full execution
- Token consumption should be optimizable
- Users should be able to preview outputs
- Iterative refinement should be efficient

**Evaluation Criteria**:
- Can outputs be validated without full generation?
- Is token usage optimized?
- Are preview capabilities available?
- Is iterative refinement supported?
```

### Quality Standards
```markdown
# Library Quality Standards

## Template Quality Requirements

### Structure Requirements
- [ ] Clear Purpose section explaining template intent
- [ ] Comprehensive Instructions for AI consumption
- [ ] Practical Examples demonstrating usage
- [ ] Core Principles summarizing key concepts
- [ ] Detailed framework or methodology sections

### Content Requirements
- [ ] Accurate and up-to-date information
- [ ] Clear, unambiguous language
- [ ] Consistent terminology throughout
- [ ] Appropriate level of detail
- [ ] Actionable guidance

### Format Requirements
- [ ] Proper Markdown formatting
- [ ] Consistent heading hierarchy
- [ ] Code blocks with language specification
- [ ] Tables for structured data
- [ ] Mermaid diagrams where appropriate

## Output Quality Requirements

### Specification Quality
- [ ] Complete coverage of requirements
- [ ] Production-ready defaults applied
- [ ] Best practices integrated
- [ ] Cross-platform consistency maintained
- [ ] Clear acceptance criteria defined

### Documentation Quality
- [ ] Self-explanatory content
- [ ] Appropriate examples included
- [ ] Clear navigation and structure
- [ ] Up-to-date with current state
- [ ] Accessible to target audience

## Validation Requirements

### Automated Validation
- [ ] Template structure validation passes
- [ ] Cross-reference validation passes
- [ ] Platform consistency validation passes
- [ ] Integration tests pass

### Manual Validation
- [ ] Peer review completed
- [ ] Example outputs verified
- [ ] User feedback incorporated
- [ ] Documentation reviewed
```

## Change Rationale Documentation

### Rationale Template
```markdown
# Change Rationale Document

## Change Information
**Change ID**: [Unique identifier]
**Title**: [Brief descriptive title]
**Author**: [Who proposed the change]
**Date**: [Proposal date]

## Change Description
### What is being changed?
[Detailed description of the change]

### Why is this change needed?
[Clear explanation of the motivation]

### What problem does it solve?
[Specific problem or gap being addressed]

### What are the expected benefits?
[List of anticipated improvements]

## Vision Alignment

### Mission Alignment
**How does this change support the library's mission?**
[Explanation of mission alignment]

### Principle Alignment
| Principle | Alignment | Explanation |
|-----------|-----------|-------------|
| Modular | [Yes/Partial/No] | [Explanation] |
| Composable | [Yes/Partial/No] | [Explanation] |
| Production-Ready | [Yes/Partial/No] | [Explanation] |
| Bite-sized | [Yes/Partial/No] | [Explanation] |
| Dry-run | [Yes/Partial/No] | [Explanation] |

### Quality Standard Compliance
[How the change maintains or improves quality standards]

## Alternatives Considered

### Alternative 1: [Name]
**Description**: [What this alternative would involve]
**Pros**: [Benefits of this approach]
**Cons**: [Drawbacks of this approach]
**Why not chosen**: [Reason for rejection]

### Alternative 2: [Name]
**Description**: [What this alternative would involve]
**Pros**: [Benefits of this approach]
**Cons**: [Drawbacks of this approach]
**Why not chosen**: [Reason for rejection]

## Risk Assessment

### Identified Risks
| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| [Risk 1] | [High/Med/Low] | [High/Med/Low] | [Mitigation strategy] |
| [Risk 2] | [High/Med/Low] | [High/Med/Low] | [Mitigation strategy] |

### Rollback Plan
[Brief description of how to rollback if needed]

## Approval

### Required Approvals
- [ ] Technical review
- [ ] Architecture review (if high risk)
- [ ] Documentation review

### Approval Record
| Reviewer | Role | Decision | Date |
|----------|------|----------|------|
| [Name] | [Role] | [Approved/Rejected] | [Date] |
```

## Rollback Procedures

### Rollback Framework
```markdown
# Rollback Procedure Framework

## When to Rollback

### Automatic Rollback Triggers
- Integration tests fail after deployment
- Cross-platform consistency validation fails
- Critical functionality regression detected
- Performance degradation exceeds threshold (>20%)

### Manual Rollback Triggers
- User-reported critical issues
- Security vulnerability discovered
- Data integrity concerns
- Stakeholder escalation

## Rollback Preparation

### Pre-Change Requirements
Before any change, ensure:
- [ ] Current state is tagged/backed up
- [ ] Rollback procedure is documented
- [ ] Rollback has been tested (if high risk)
- [ ] Monitoring is in place to detect issues

### Backup Strategy
```bash
# Create backup tag before changes
git tag -a "pre-change-[change-id]" -m "Backup before [change description]"

# Push backup tag
git push origin "pre-change-[change-id]"

# Document backup location
echo "Backup tag: pre-change-[change-id]" >> .rollback-registry.md
```

## Rollback Execution

### Step 1: Assess Situation
```markdown
## Rollback Assessment

**Trigger**: [What triggered the rollback]
**Severity**: [Critical/High/Medium/Low]
**Scope**: [What needs to be rolled back]
**Impact**: [Current impact of the issue]

### Decision
- [ ] Proceed with rollback
- [ ] Attempt fix first
- [ ] Escalate for decision
```

### Step 2: Execute Rollback
```bash
# Option A: Revert specific commits
git revert [commit-hash] --no-commit
git commit -m "Rollback: [reason]"

# Option B: Restore from backup tag
git checkout pre-change-[change-id] -- [affected-paths]
git commit -m "Rollback: Restore from pre-change-[change-id]"

# Option C: Full branch reset (use with caution)
git reset --hard pre-change-[change-id]
git push --force-with-lease origin [branch]
```

### Step 3: Validate Rollback
```bash
# Run validation tests
npm run test:integration -- --run
npm run test:cross-platform -- --run

# Verify functionality restored
npm run validate:templates -- --run

# Check metrics
npm run metrics:compare -- --baseline pre-change
```

### Step 4: Document and Communicate
```markdown
## Rollback Record

**Date**: [Rollback date]
**Change ID**: [Original change ID]
**Trigger**: [What caused the rollback]
**Duration**: [Time to complete rollback]

### Actions Taken
1. [Action 1]
2. [Action 2]
3. [Action 3]

### Validation Results
- [ ] Integration tests pass
- [ ] Cross-platform validation pass
- [ ] Functionality restored
- [ ] Performance restored

### Lessons Learned
[What we learned from this incident]

### Follow-up Actions
- [ ] [Action 1]
- [ ] [Action 2]
```

## Post-Rollback Actions

### Immediate Actions
- [ ] Notify stakeholders of rollback
- [ ] Update status documentation
- [ ] Create incident report
- [ ] Schedule post-mortem

### Follow-up Actions
- [ ] Root cause analysis
- [ ] Prevention measures identified
- [ ] Process improvements documented
- [ ] Revised change plan created
```

## Cross-Platform Consistency Validation

### Validation Framework
```markdown
# Cross-Platform Consistency Validation

## Validation Scope

### Platform Coverage
- Web (React, Vue, Angular, etc.)
- Mobile iOS (Swift, React Native)
- Mobile Android (Kotlin, React Native)
- Desktop (Electron, native)
- Platform-Agnostic (shared components)

### Validation Areas
- Template coverage across platforms
- Feature parity in generated outputs
- Consistent quality standards
- Shared component compatibility

## Validation Process

### Step 1: Coverage Analysis
```bash
# Check template coverage
find prompts/stages -name "*.md" | sort > all-templates.txt

# Check platform-specific templates
find prompts/stages -name "web.md" | wc -l
find prompts/stages -name "mobile.md" | wc -l
find prompts/stages -name "platform-agnostic.md" | wc -l
```

### Step 2: Parity Validation
```typescript
// Validate feature parity across platforms
const validateParity = (stage: string) => {
  const webFeatures = extractFeatures(`${stage}/web.md`);
  const mobileFeatures = extractFeatures(`${stage}/mobile.md`);
  const agnosticFeatures = extractFeatures(`${stage}/platform-agnostic.md`);
  
  // Check all platforms have equivalent features
  const allFeatures = new Set([...webFeatures, ...mobileFeatures, ...agnosticFeatures]);
  
  return {
    webCoverage: webFeatures.size / allFeatures.size,
    mobileCoverage: mobileFeatures.size / allFeatures.size,
    agnosticCoverage: agnosticFeatures.size / allFeatures.size,
    missingWeb: [...allFeatures].filter(f => !webFeatures.has(f)),
    missingMobile: [...allFeatures].filter(f => !mobileFeatures.has(f)),
    missingAgnostic: [...allFeatures].filter(f => !agnosticFeatures.has(f))
  };
};
```

### Step 3: Quality Consistency
```markdown
## Quality Consistency Checklist

### Structure Consistency
- [ ] All platforms use same template structure
- [ ] Heading hierarchy is consistent
- [ ] Section ordering is consistent
- [ ] Code example formats are consistent

### Content Consistency
- [ ] Terminology is consistent across platforms
- [ ] Best practices are equally applied
- [ ] Quality standards are uniformly enforced
- [ ] Examples are equivalent in depth

### Output Consistency
- [ ] Generated specs have same sections
- [ ] Quality metrics are comparable
- [ ] Acceptance criteria are equivalent
- [ ] Documentation depth is consistent
```

## Validation Report Template
```markdown
# Cross-Platform Consistency Report

## Report Information
**Date**: [Validation date]
**Scope**: [What was validated]
**Validator**: [Who performed validation]

## Coverage Summary

### Template Coverage
| Stage | Web | Mobile | Agnostic | Status |
|-------|-----|--------|----------|--------|
| [Stage] | [✅/❌] | [✅/❌] | [✅/❌] | [OK/Issue] |

### Feature Parity
| Feature | Web | Mobile | Agnostic | Parity |
|---------|-----|--------|----------|--------|
| [Feature] | [✅/❌] | [✅/❌] | [✅/❌] | [100%/X%] |

## Issues Found

### Critical Issues
[List of critical consistency issues]

### Minor Issues
[List of minor consistency issues]

## Recommendations

### Immediate Actions
1. [Action 1]
2. [Action 2]

### Long-term Improvements
1. [Improvement 1]
2. [Improvement 2]

## Validation Metrics
- **Overall Consistency Score**: [X%]
- **Platform Coverage**: [X%]
- **Feature Parity**: [X%]
- **Quality Consistency**: [X%]
```

This comprehensive library vision document framework ensures that all changes to the AI Prompt Library are evaluated against a clear vision, documented with proper rationale, safely rollbackable, and maintain cross-platform consistency throughout the library's evolution.
