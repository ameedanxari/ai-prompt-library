# Brief Validation Template

## Purpose
Validate that the user's project brief contains sufficient information to proceed with comprehensive specification generation.

## Instructions
Use this template to systematically evaluate user briefs for completeness and clarity. Apply the validation criteria to determine if the brief provides sufficient information for specification generation, or if additional clarification is needed.

## Examples
```markdown
## Example Brief Validation

### User Brief: "A task management app for remote teams"

**Validation Assessment**:
- ✅ Clear product type: Task management application
- ✅ Target audience: Remote teams
- ⚠️ Missing: Specific features and functionality
- ⚠️ Missing: Platform preferences (web, mobile, both)
- ❌ Missing: Business context and value proposition

**Validation Result**: NEEDS_CLARIFICATION

**Recommended Questions**:
1. What specific task management features do you need (project boards, time tracking, file sharing)?
2. Which platforms should this support (web browser, mobile app, desktop)?
3. What problem are you solving for remote teams that existing tools don't address?
4. How many team members do you expect to use this system?
```

## Validation Criteria

### Content Sufficiency Check
```markdown
## Brief Content Analysis

### What is being built?
- [ ] Clear description of the product/application type
- [ ] Specific functionality or features mentioned
- [ ] Target user base or audience identified
- [ ] Core value proposition articulated

### Why is it being built?
- [ ] Business problem or user need identified
- [ ] Value proposition or benefits stated
- [ ] Success criteria or goals mentioned
- [ ] Market opportunity or context provided

### Scope Indicators
- [ ] Platform preferences indicated (web, mobile, etc.)
- [ ] Scale or complexity level suggested
- [ ] Integration requirements mentioned
- [ ] Technical constraints or preferences noted
```

### Validation Prompts

#### Sufficiency Assessment
```markdown
Analyze the following project brief for completeness:

**Brief**: [USER_BRIEF]

**Assessment Questions**:
1. Can you clearly identify what type of application is being requested?
2. Is the target user base or audience clear?
3. Are the core features or functionality requirements evident?
4. Is there sufficient context about the business need or problem being solved?
5. Can you infer the appropriate technology stack and architecture?

**Validation Result**: [PASS/NEEDS_CLARIFICATION/INSUFFICIENT]

**If NEEDS_CLARIFICATION or INSUFFICIENT, provide specific questions to ask the user**:
- [List specific clarifying questions]
```

#### Enhancement Suggestions
```markdown
Based on the brief analysis, suggest enhancements to improve specification quality:

**Current Brief Strengths**:
- [List what is well-defined in the brief]

**Recommended Enhancements**:
- [Suggest additional details that would improve specification quality]

**Optional Clarifications** (for power users):
- [Suggest advanced configuration options that might be relevant]
```

### Validation Outcomes

#### PASS - Sufficient Information
```markdown
## Validation: PASSED ✅

The brief provides sufficient information to proceed with specification generation.

**Identified Elements**:
- **Product Type**: [Extracted product type]
- **Target Users**: [Identified user base]
- **Core Features**: [Key functionality identified]
- **Business Context**: [Problem/opportunity identified]

**Recommended Next Steps**:
1. Proceed to asset processing and organization
2. Apply production-quality defaults for unspecified areas
3. Begin Stage 01 - Intake processing
```

#### NEEDS_CLARIFICATION - Additional Information Helpful
```markdown
## Validation: NEEDS CLARIFICATION ⚠️

The brief provides a good foundation but additional information would improve specification quality.

**Current Understanding**:
- [Summarize what is clear from the brief]

**Recommended Clarifications**:
1. [Specific question 1]
2. [Specific question 2]
3. [Specific question 3]

**Options to Proceed**:
- **Option A**: Provide additional clarification for optimal results
- **Option B**: Proceed with intelligent defaults (may require refinement later)
```

#### INSUFFICIENT - More Information Required
```markdown
## Validation: INSUFFICIENT ❌

The brief requires additional information to generate meaningful specifications.

**Missing Critical Elements**:
- [List what essential information is missing]

**Required Information**:
1. [Essential question 1]
2. [Essential question 2]
3. [Essential question 3]

**Cannot Proceed Until**:
- [List minimum requirements to continue]
```

## Brief Enhancement Prompts

### Expansion Prompts
```markdown
## Brief Enhancement Suggestions

Based on your brief: "[USER_BRIEF]"

### Suggested Expansions:

**User Experience Details**:
- Who are your primary users and what are their main goals?
- What key tasks should users be able to accomplish?
- Are there any specific user experience requirements or preferences?

**Technical Context**:
- Do you have any existing systems this needs to integrate with?
- Are there specific performance, security, or compliance requirements?
- Do you have preferences for technology stack or deployment environment?

**Business Context**:
- What does success look like for this project?
- Are there any budget, timeline, or resource constraints?
- Who are the key stakeholders and what are their priorities?

**Feature Prioritization**:
- What features are absolutely essential for launch?
- What features would be nice to have but not critical?
- Are there any features you specifically want to avoid or exclude?
```

### Intelligent Default Application
```markdown
## Applying Intelligent Defaults

When brief information is limited, apply these production-quality defaults:

**Technology Stack Defaults**:
- **Mobile**: React Native for cross-platform efficiency
- **Web**: Headless architecture with modern frontend framework
- **Backend**: Serverless-first approach for cost optimization
- **Database**: Managed database service appropriate for data model

**Feature Defaults**:
- **Authentication**: Comprehensive auth with social login options
- **Admin Portal**: Full-featured admin interface for content management
- **Analytics**: User behavior tracking and business intelligence
- **Monitoring**: Application performance monitoring and alerting

**Quality Defaults**:
- **Security**: Industry-standard security practices and compliance
- **Accessibility**: WCAG 2.1 AA compliance for inclusive design
- **Internationalization**: Multi-language support with RTL capability
- **Performance**: Offline-first design with progressive enhancement

**Deployment Defaults**:
- **Infrastructure**: Cloud-native deployment with auto-scaling
- **CI/CD**: Automated testing and deployment pipelines
- **Monitoring**: Comprehensive logging, metrics, and alerting
- **Backup**: Automated backup and disaster recovery procedures
```

## Integration with Stage Pipeline

### Pre-Stage Validation
```markdown
Before proceeding to Stage 01 - Intake:

1. **Run Brief Validation**: Ensure sufficient information is available
2. **Apply Defaults**: Fill gaps with production-quality defaults
3. **Document Assumptions**: Record all assumptions made during validation
4. **Set Expectations**: Communicate what will be generated based on available information
```

### Validation Results Integration
```markdown
## Integration with Project Configuration

**Validation Results**: [PASS/NEEDS_CLARIFICATION/INSUFFICIENT]

**Extracted Information**:
- **Project Type**: [Identified type]
- **Complexity Level**: [Simple/Medium/Complex]
- **Platform Requirements**: [Web/Mobile/Both/API]
- **User Base**: [Internal/External/B2B/B2C]

**Applied Defaults**:
- [List all defaults applied due to missing information]

**Assumptions Made**:
- [List all assumptions made during validation]

**Confidence Level**: [High/Medium/Low]
- High: Brief provides comprehensive information
- Medium: Brief provides good foundation with some gaps filled by defaults
- Low: Brief provides minimal information, heavy reliance on defaults
```

This validation framework ensures that every project brief is thoroughly analyzed and enhanced before proceeding to specification generation, maximizing the quality and relevance of the generated outputs.