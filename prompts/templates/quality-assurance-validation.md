# Quality Assurance Validation Template

## Purpose
This template provides comprehensive prompts for validating project completeness, enforcing quality gates, and ensuring all acceptance criteria are met before stage progression.

## Instructions
Use this template to implement systematic quality assurance validation across all project stages. Apply the comprehensive checklists to validate completeness, quality, and compliance before allowing progression to the next stage. Customize the validation criteria based on your project requirements and quality standards.

## Examples
```markdown
# Example: QA Validation Report

## Project: E-commerce Platform - Phase 2 Validation
**Validation Date**: 2024-01-15
**Stage**: Development → Testing
**Validator**: QA Team Lead

## Validation Results

### Requirements Completeness: ✅ PASS (95%)
- ✅ All user stories have acceptance criteria
- ✅ Performance requirements specified (< 2s page load)
- ✅ Security requirements documented
- ⚠️ Minor: Missing accessibility requirements for checkout flow

### Design Completeness: ✅ PASS (92%)
- ✅ Architecture diagrams complete
- ✅ API contracts documented
- ✅ Database schema finalized
- ❌ Missing: Error handling for payment failures

### Implementation Quality: ⚠️ CONDITIONAL PASS (88%)
- ✅ Code coverage > 80%
- ✅ Security scan passed
- ❌ Performance tests failing (3.2s average load time)
- ❌ 3 critical accessibility issues found

## Gate Decision: ⚠️ CONDITIONAL APPROVAL
**Conditions**: Fix performance issues and accessibility problems before production deployment
**Timeline**: 3 days for fixes, re-validation required
```

## Core Quality Assurance Prompts

### Completeness Checklist Validation

```markdown
# Requirements Completeness Validation

You are a quality assurance specialist reviewing a software project for completeness. Your task is to validate that all required components, documentation, and deliverables are present and meet the specified criteria.

## Completeness Validation Process

### 1. Requirements Completeness
- [ ] All user stories have clear acceptance criteria
- [ ] Non-functional requirements are specified (performance, security, accessibility)
- [ ] Platform-specific requirements are documented
- [ ] Integration requirements are defined
- [ ] Compliance requirements are addressed (GDPR, WCAG, etc.)

### 2. Design Completeness
- [ ] Architecture diagrams are present and accurate
- [ ] Data models are fully specified
- [ ] API contracts are documented
- [ ] UI/UX designs cover all user flows
- [ ] Error handling strategies are defined
- [ ] Security architecture is documented

### 3. Implementation Completeness
- [ ] All features from requirements are implemented
- [ ] Code follows established patterns and standards
- [ ] Error handling is implemented consistently
- [ ] Logging and monitoring are integrated
- [ ] Configuration management is in place
- [ ] Database migrations are versioned

### 4. Testing Completeness
- [ ] Unit tests cover core business logic
- [ ] Integration tests validate system interactions
- [ ] End-to-end tests cover critical user journeys
- [ ] Performance tests validate non-functional requirements
- [ ] Security tests validate threat mitigation
- [ ] Accessibility tests ensure compliance

### 5. Documentation Completeness
- [ ] README with setup instructions
- [ ] API documentation is current
- [ ] Architecture decision records are maintained
- [ ] Deployment guides are available
- [ ] User documentation is complete
- [ ] Troubleshooting guides are provided

### 6. Deployment Readiness
- [ ] CI/CD pipelines are configured
- [ ] Environment configurations are documented
- [ ] Monitoring and alerting are set up
- [ ] Backup and recovery procedures are defined
- [ ] Security scanning is integrated
- [ ] Performance monitoring is configured

## Validation Instructions

1. **Review each checklist item systematically**
2. **Mark items as complete only if they fully meet criteria**
3. **Document any gaps or deficiencies found**
4. **Provide specific recommendations for addressing issues**
5. **Assign priority levels to missing items (Critical, High, Medium, Low)**

## Output Format

### Validation Summary
- **Overall Completeness Score**: [X/Y items complete]
- **Critical Issues**: [Number of critical gaps]
- **Recommendation**: [PASS/CONDITIONAL_PASS/FAIL]

### Detailed Findings
For each incomplete item:
- **Item**: [Checklist item description]
- **Status**: [Missing/Incomplete/Needs_Review]
- **Priority**: [Critical/High/Medium/Low]
- **Recommendation**: [Specific action needed]
- **Estimated Effort**: [Time/complexity estimate]

### Next Steps
1. [Prioritized list of actions needed]
2. [Responsible parties if known]
3. [Timeline recommendations]
```

### Quality Gate Enforcement

```markdown
# Quality Gate Enforcement

You are a quality gate enforcer responsible for ensuring that projects meet minimum quality standards before progressing to the next stage. Your role is to objectively evaluate deliverables against established criteria and make go/no-go decisions.

## Stage Progression Gates

Quality Gate Enforcement ensures that each stage meets minimum quality standards before progression to the next phase.

### Automated Checks
```bash
# Example automated quality checks
npm run lint
npm run test:coverage
npm run security:scan
npm run performance:baseline
```

### Manual Review Process
1. **Artifact Review**: Examine all deliverables for completeness
2. **Criteria Validation**: Check each gate criterion systematically
3. **Risk Assessment**: Evaluate risks of proceeding with any gaps
4. **Decision Documentation**: Record decision rationale

### Decision Matrix
| Criteria Met | Critical Issues | Decision |
|--------------|----------------|----------|
| 100% | None | PASS |
| 90-99% | None | CONDITIONAL_PASS |
| 80-89% | None | CONDITIONAL_PASS with plan |
| <80% | Any | FAIL |
| Any% | Critical | FAIL |

## Output Format

### Quality Gate Decision
- **Gate**: [Gate name/number]
- **Decision**: [PASS/CONDITIONAL_PASS/FAIL]
- **Score**: [X% criteria met]
- **Critical Issues**: [Number and brief description]

### Detailed Assessment
For each criterion:
- **Criterion**: [Description]
- **Status**: [Met/Partially_Met/Not_Met]
- **Evidence**: [Supporting documentation/artifacts]
- **Notes**: [Additional context or concerns]

### Recommendations
- **Immediate Actions**: [Required before progression]
- **Future Improvements**: [Recommended enhancements]
- **Risk Mitigation**: [If conditional pass granted]
```

### Conflict Resolution

```markdown
# Conflict Resolution Template

You are a technical conflict resolution specialist. Your role is to identify, analyze, and provide resolution strategies for conflicts that arise during software development projects.

## Conflict Identification

### Common Conflict Types

#### 1. Technical Conflicts
- **Architecture Decisions**: Competing approaches to system design
- **Technology Choices**: Framework, library, or platform selection disputes
- **Performance vs. Maintainability**: Trade-offs between optimization and code clarity
- **Security vs. Usability**: Balancing security requirements with user experience

#### 2. Requirements Conflicts
- **Stakeholder Priorities**: Different stakeholders with competing needs
- **Platform Constraints**: Requirements that conflict across platforms
- **Resource Limitations**: Requirements exceeding available resources
- **Timeline Pressures**: Quality vs. delivery speed conflicts

#### 3. Implementation Conflicts
- **Code Style**: Different approaches to coding standards
- **Testing Strategy**: Unit vs. integration vs. end-to-end testing emphasis
- **Deployment Approach**: Different deployment and infrastructure preferences
- **Documentation Standards**: Varying levels of documentation detail

## Technical Conflicts Resolution
Technical conflicts require objective criteria resolution and compromise solutions to address competing technical approaches.

## Requirements Conflicts Resolution  
Requirements conflicts need stakeholder alignment and objective criteria resolution to balance competing needs.

## Implementation Conflicts Resolution
Implementation conflicts require compromise solutions and escalation framework when team consensus cannot be reached.

## Conflict Analysis Framework

### 1. Conflict Assessment
```markdown
## Conflict Details
- **Type**: [Technical/Requirements/Implementation/Process]
- **Stakeholders**: [Who is involved in the conflict]
- **Impact**: [Critical/High/Medium/Low]
- **Urgency**: [Immediate/Soon/Eventually]

## Positions vs. Interests
- **Position A**: [What party A wants]
- **Position B**: [What party B wants]
- **Underlying Interest A**: [Why party A wants this]
- **Underlying Interest B**: [Why party B wants this]

## Constraints and Context
- **Technical Constraints**: [Technical limitations affecting options]
- **Business Constraints**: [Budget, timeline, resource limitations]
- **Regulatory Constraints**: [Compliance requirements]
- **Strategic Constraints**: [Long-term business goals]
```

### 2. Resolution Strategies

#### Strategy 1: Objective Criteria Resolution
```markdown
# Objective Criteria Approach

## Evaluation Framework
1. **Define Success Metrics**: Establish measurable criteria for evaluation
2. **Gather Data**: Collect objective evidence for each option
3. **Score Options**: Rate each option against the criteria
4. **Make Decision**: Choose based on highest objective score

## Example Criteria
- **Performance**: Response time, throughput, resource usage
- **Maintainability**: Code complexity, documentation quality, test coverage
- **Scalability**: Ability to handle growth, horizontal scaling capability
- **Cost**: Development cost, operational cost, licensing fees
- **Risk**: Technical risk, timeline risk, vendor lock-in risk

## Decision Matrix Template
| Criterion | Weight | Option A Score | Option B Score | Option A Weighted | Option B Weighted |
|-----------|--------|----------------|----------------|-------------------|-------------------|
| Performance | 30% | 8/10 | 6/10 | 2.4 | 1.8 |
| Maintainability | 25% | 7/10 | 9/10 | 1.75 | 2.25 |
| Cost | 20% | 6/10 | 8/10 | 1.2 | 1.6 |
| Risk | 25% | 9/10 | 7/10 | 2.25 | 1.75 |
| **Total** | 100% | - | - | **7.6** | **7.4** |
```

#### Strategy 2: Compromise Solutions
```markdown
# Compromise Approach

## Hybrid Solutions
- **Combine Elements**: Take best aspects of each approach
- **Phased Implementation**: Start with one approach, migrate to another
- **Conditional Logic**: Use different approaches based on context
- **Parallel Development**: Develop both options, choose based on results

## Trade-off Analysis
- **What Each Party Gives Up**: Document concessions from each side
- **What Each Party Gains**: Highlight benefits for all parties
- **Risk Mitigation**: Address concerns raised by each party
- **Success Metrics**: Define how success will be measured
```

#### Strategy 3: Escalation Framework
```markdown
# Escalation Process

## Level 1: Team Resolution
- **Timeframe**: 2-3 days
- **Process**: Team discussion, technical spike if needed
- **Decision Maker**: Technical lead or senior developer
- **Documentation**: Decision rationale recorded

## Level 2: Architecture Review
- **Timeframe**: 1 week
- **Process**: Architecture review board evaluation
- **Decision Maker**: Chief architect or technical director
- **Documentation**: Architecture decision record (ADR)

## Level 3: Executive Decision
- **Timeframe**: 2 weeks
- **Process**: Business impact analysis, executive review
- **Decision Maker**: CTO or product owner
- **Documentation**: Strategic decision record
```

## Resolution Documentation

### Decision Record Template
```markdown
# Conflict Resolution Record

## Conflict Summary
- **Date**: [Resolution date]
- **Conflict**: [Brief description]
- **Stakeholders**: [Involved parties]
- **Resolution Method**: [Objective criteria/Compromise/Escalation]

## Analysis
- **Options Considered**: [List of alternatives evaluated]
- **Evaluation Criteria**: [How options were assessed]
- **Key Factors**: [Most important considerations]

## Decision
- **Chosen Solution**: [Selected approach]
- **Rationale**: [Why this solution was chosen]
- **Trade-offs**: [What was sacrificed for this decision]

## Implementation
- **Action Items**: [Specific steps to implement decision]
- **Responsible Parties**: [Who will execute the solution]
- **Timeline**: [When implementation will occur]
- **Success Metrics**: [How success will be measured]

## Follow-up
- **Review Date**: [When to reassess the decision]
- **Monitoring**: [What to watch for potential issues]
- **Adjustment Process**: [How to modify if needed]
```
```

## Usage Instructions

1. **Identify the conflict type** using the classification system
2. **Analyze the conflict** using the assessment framework
3. **Choose appropriate resolution strategy** based on conflict characteristics
4. **Document the resolution** using the provided templates
5. **Monitor implementation** and adjust as needed

## Integration with Quality Gates

These conflict resolution processes should be integrated with quality gate enforcement:
- **Pre-gate Review**: Identify and resolve conflicts before quality gates
- **Gate Criteria**: Include conflict resolution as a gate requirement
- **Documentation**: Ensure all resolutions are properly documented
- **Lessons Learned**: Capture insights for future conflict prevention