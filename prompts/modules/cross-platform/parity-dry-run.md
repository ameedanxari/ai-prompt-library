# Cross-Platform Parity Dry-Run Validator

<!-- INSTANTIATION RULES
When the drill-down engine (or any orchestrator) uses this template:
1. Every placeholder — including {{variables}}, <TBD>, [project name], and generic
   field/function/endpoint names — MUST be replaced with project-specific values
   before output is written to prompts/outputs/current/.
2. The template filename MUST NOT appear in task output. Dissolve the template
   into concrete content; do not reference its source.
3. No strings beginning with ".ai-prompts/prompts/" may appear in the output
   (validated by scripts/validate-instantiation.sh).
4. Outputs must contain real data shapes, real endpoints, real file paths, and
   real function signatures specific to the project.
-->


## Purpose
Validate cross-platform parity strategies and documentation without implementing actual code or consuming extensive tokens. This dry-run mode allows for quick validation of parity approaches and identification of potential issues.

## Examples

### Quick Parity Validation Example
```markdown
# Dry-Run Validation: E-commerce Platform Parity

## Validation Summary
**Project**: E-commerce Platform
**Platforms**: Web, iOS, Android
**Scope**: Quick validation
**Duration**: 5 minutes

## Feature Parity Assessment

### ✅ High Parity Features (90-100% identical)
1. **Product Catalog**
   - Same product data and filtering
   - Identical search functionality
   - Consistent product details
   - **Validation**: All platforms can display same product information

2. **Shopping Cart**
   - Same cart operations (add, remove, update)
   - Identical pricing calculations
   - Consistent checkout flow
   - **Validation**: Cart state synchronizes across platforms

3. **User Authentication**
   - Same login methods (email, social)
   - Identical user profiles
   - Consistent session management
   - **Validation**: Users can switch between platforms seamlessly

### ⚠️ Medium Parity Features (70-89% similar)
1. **Navigation**
   - **Web**: Horizontal navigation menu
   - **Mobile**: Bottom tab navigation
   - **Validation**: Different UI patterns but same functionality access

2. **Product Images**
   - **Web**: Hover zoom and gallery view
   - **Mobile**: Pinch zoom and swipe gallery
   - **Validation**: Different interactions but same image viewing capability

### ❌ Low Parity Features (Platform-specific)
1. **Notifications**
   - **Web**: Browser notifications (limited)
   - **Mobile**: Rich push notifications
   - **Validation**: Acceptable difference due to platform capabilities

2. **Payment Methods**
   - **Web**: Credit cards, PayPal, bank transfer
   - **Mobile**: Above plus Apple Pay, Google Pay
   - **Validation**: Mobile has additional native payment options

## Validation Results
- **Overall Parity Score**: 85% (Good)
- **Critical Issues**: None identified
- **Recommendations**: Proceed with current parity strategy
- **Next Steps**: Implement high parity features first
```

### Comprehensive Parity Validation Example
```markdown
# Comprehensive Dry-Run: Task Management App

## Detailed Feature Analysis

### Feature: Task Creation
**Parity Target**: 95% (High)

**Platform Implementations**:
- **Web**: Form with keyboard shortcuts, drag-and-drop file attachment
- **iOS**: Native form with voice input, camera integration
- **Android**: Material Design form with voice input, file picker

**Validation Checks**:
✅ Same core functionality (create task with title, description, due date)
✅ Same data model and validation rules
✅ Same API endpoints and data flow
⚠️ Different input methods (keyboard vs touch vs voice)
✅ Same result (task created with identical data structure)

**Parity Assessment**: 92% - Acceptable variation in input methods

### Feature: Real-time Collaboration
**Parity Target**: 100% (Critical)

**Platform Implementations**:
- **Web**: WebSocket connection with live cursors
- **iOS**: WebSocket with push notifications for updates
- **Android**: WebSocket with background sync

**Validation Checks**:
✅ Same real-time update mechanism
✅ Same conflict resolution strategy
✅ Same collaborative editing features
✅ Same notification system (adapted per platform)
✅ Same data synchronization

**Parity Assessment**: 98% - Excellent parity with platform-appropriate notifications

### Feature: Offline Capability
**Parity Target**: 90% (High)

**Platform Implementations**:
- **Web**: Service Worker with IndexedDB storage
- **iOS**: Core Data with background app refresh
- **Android**: Room database with WorkManager sync

**Validation Checks**:
✅ Same offline functionality (view, edit, create tasks)
✅ Same sync strategy when reconnected
✅ Same conflict resolution
⚠️ Different storage mechanisms (platform-appropriate)
✅ Same user experience during offline/online transitions

**Parity Assessment**: 94% - Excellent offline parity with platform-optimized storage

## Risk Assessment

### Low Risk Issues
- Input method variations (expected and beneficial)
- Storage technology differences (platform-optimized)
- UI pattern differences (platform conventions)

### Medium Risk Issues
- Notification capability differences (mitigated with fallbacks)
- File handling variations (documented alternatives provided)

### High Risk Issues
- None identified in current parity strategy

## Validation Recommendations

### Immediate Actions
1. ✅ Proceed with current parity strategy
2. ✅ Document platform-specific optimizations
3. ✅ Create shared API contracts

### Future Considerations
1. Monitor user feedback on platform differences
2. Consider progressive enhancement for advanced features
3. Plan for platform-specific feature additions

## Overall Assessment
**Parity Strategy**: Excellent (94% average parity)
**Implementation Readiness**: High
**Risk Level**: Low
**Recommendation**: Proceed with implementation
```
{{/each}}

### Features to Validate
{{#each features}}
- {{this}}
{{/each}}

## Context Variables
- `{{target_platforms}}` - List of target platforms (web, ios, android, desktop)
- `{{features}}` - List of features to validate for parity
- `{{project_name}}` - Name of the project for validation
- `{{validation_scope}}` - Scope of validation (quick, standard, comprehensive)
- `{{dry_run}}` - Boolean flag for validation-only mode

## Prompt Template

You are tasked with performing a dry-run validation of cross-platform parity for {{project_name}}. This validation will assess parity strategies without implementing actual code.

### Target Platforms
{{#each target_platforms}}
- {{this}}
{{/each}}

### Features to Validate
{{#each features}}
- {{this}}
{{/each}}

### Validation Scope: {{validation_scope}}

## Instructions

### 1. Parity Feasibility Assessment

For each feature-platform combination, provide a quick assessment:

```markdown
## Feature: [Feature Name]

### Platform Feasibility Matrix

| Platform | Feasibility | Confidence | Notes |
|----------|-------------|------------|-------|
| Web | ✅ Full / ⚠️ Limited / ❌ Not Feasible | High/Medium/Low | Brief rationale |
| iOS | ✅ Full / ⚠️ Limited / ❌ Not Feasible | High/Medium/Low | Brief rationale |
| Android | ✅ Full / ⚠️ Limited / ❌ Not Feasible | High/Medium/Low | Brief rationale |
| Desktop | ✅ Full / ⚠️ Limited / ❌ Not Feasible | High/Medium/Low | Brief rationale |

### Key Considerations
- **Technical Constraints:** [Primary technical limitations]
- **Platform Conventions:** [UI/UX convention conflicts]
- **Implementation Complexity:** [High/Medium/Low with brief explanation]
- **Maintenance Burden:** [Ongoing maintenance considerations]

### Recommended Approach
- **Strategy:** [Full parity / Adaptive parity / Platform-specific]
- **Rationale:** [Brief explanation of recommendation]
- **Risk Level:** [Low/Medium/High]
```

### 2. Validation Checklist

**Documentation Completeness**
- [ ] Parity matrix structure defined
- [ ] Platform differences documented
- [ ] Shared contracts specified
- [ ] Mitigation strategies outlined
- [ ] Success criteria established

**Technical Feasibility**
- [ ] API compatibility assessed
- [ ] Platform capabilities verified
- [ ] Performance implications considered
- [ ] Security requirements addressed
- [ ] Accessibility compliance planned

**Process Readiness**
- [ ] Maintenance procedures defined
- [ ] Review processes established
- [ ] Update mechanisms planned
- [ ] Stakeholder communication prepared
- [ ] Quality gates identified

### 3. Risk Assessment

**High-Risk Areas**
- Features with significant platform limitations
- Complex integration requirements
- Performance-critical functionality
- Security-sensitive operations

**Medium-Risk Areas**
- UI/UX adaptation requirements
- Platform-specific optimizations
- Third-party service integrations
- Offline functionality variations

**Low-Risk Areas**
- Standard CRUD operations
- Basic UI components
- Simple data display
- Common user interactions

### 4. Resource Estimation

**Development Effort**
- **High Complexity Features:** [Estimated effort range]
- **Medium Complexity Features:** [Estimated effort range]
- **Low Complexity Features:** [Estimated effort range]

**Ongoing Maintenance**
- **Documentation Updates:** [Frequency and effort]
- **Parity Monitoring:** [Resources required]
- **Issue Resolution:** [Expected support burden]

### 5. Validation Outcomes

**Go/No-Go Recommendations**
```markdown
### Feature: [Feature Name]
**Recommendation:** [Proceed / Modify Approach / Defer / Cancel]
**Rationale:** [Brief explanation]
**Conditions:** [Any conditions for proceeding]
**Alternatives:** [Alternative approaches if applicable]
```

**Overall Parity Strategy**
- **Feasibility Score:** [1-10 scale]
- **Risk Level:** [Low/Medium/High]
- **Recommended Approach:** [Strategy summary]
- **Key Success Factors:** [Critical requirements for success]

### 6. Next Steps Validation

**Immediate Actions Required**
1. [Action item with priority]
2. [Action item with priority]
3. [Action item with priority]

**Documentation Needs**
- [Required documentation updates]
- [Missing specifications]
- [Clarification requirements]

**Stakeholder Decisions**
- [Decisions requiring product team input]
- [Technical architecture decisions]
- [Resource allocation decisions]

## Validation Modes

### Quick Validation (5-10 minutes)
- High-level feasibility assessment
- Major risk identification
- Go/no-go recommendations
- Critical decision points

### Standard Validation (15-30 minutes)
- Detailed feasibility analysis
- Comprehensive risk assessment
- Resource estimation
- Implementation strategy validation

### Comprehensive Validation (45-60 minutes)
- In-depth technical analysis
- Detailed documentation review
- Stakeholder impact assessment
- Long-term maintenance planning

## Expected Outputs

1. **Validation Summary** (`PARITY_VALIDATION_SUMMARY.md`)
   - Overall feasibility assessment
   - Key risks and mitigation strategies
   - Go/no-go recommendations
   - Resource requirements

2. **Risk Register** (`PARITY_RISKS.md`)
   - Identified risks with severity ratings
   - Mitigation strategies
   - Contingency plans
   - Monitoring requirements

3. **Action Plan** (`PARITY_ACTION_PLAN.md`)
   - Immediate next steps
   - Decision requirements
   - Documentation needs
   - Timeline recommendations

## Success Criteria

- All features assessed for cross-platform feasibility
- Major risks identified and documented
- Clear recommendations provided for each feature
- Resource requirements estimated
- Next steps clearly defined
- Stakeholder decision points identified

## Integration with Full Implementation

This dry-run validation serves as input for:
- Full parity matrix generation
- Detailed platform difference documentation
- Comprehensive shared contract specification
- Implementation planning and resource allocation
