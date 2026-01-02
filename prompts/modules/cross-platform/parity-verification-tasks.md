# Cross-Platform Parity Verification Task Generator

## Purpose
Generate systematic verification tasks and procedures to ensure cross-platform parity is maintained throughout the development lifecycle and after deployments.

## Instructions
Use this template to create comprehensive verification task lists that ensure cross-platform parity is maintained throughout development and deployment cycles.

1. **Define Verification Scope**: Determine what features and platforms need verification
2. **Create Task Checklists**: Generate systematic verification tasks for each platform combination
3. **Establish Acceptance Criteria**: Define clear success criteria for each verification task
4. **Assign Responsibilities**: Identify team members responsible for each verification area
5. **Set Up Monitoring**: Create ongoing monitoring tasks for post-deployment verification

## Examples

### Example Verification Task List
```markdown
# Cross-Platform Parity Verification: E-commerce App v2.1

## Pre-Deployment Verification Tasks

### Core Feature Parity
- [ ] **Product Search**
  - [ ] Search results are identical across all platforms
  - [ ] Filtering options work consistently
  - [ ] Search performance is within acceptable ranges
  - **Platforms:** Web, iOS, Android
  - **Verification Method:** Automated API tests + Manual UI testing
  - **Acceptance Criteria:** Same results, <2s response time
  - **Responsible:** QA Team + Backend Team

- [ ] **Shopping Cart**
  - [ ] Add/remove items works identically
  - [ ] Cart persistence across sessions
  - [ ] Price calculations are consistent
  - **Platforms:** Web, iOS, Android
  - **Verification Method:** End-to-end automated tests
  - **Acceptance Criteria:** 100% functional equivalence
  - **Responsible:** Frontend Teams + QA

### User Experience Verification
- [ ] **Navigation Patterns**
  - [ ] Core navigation flows are intuitive on each platform
  - [ ] Platform-specific UI conventions are followed
  - [ ] Accessibility features work correctly
  - **Verification Method:** User testing + Accessibility audit
  - **Acceptance Criteria:** Platform conventions followed, WCAG 2.1 AA compliance
```

### Example Monitoring Task Setup
```markdown
# Post-Deployment Monitoring Tasks

## Automated Monitoring
- [ ] **API Response Consistency**
  - Monitor API responses across platforms
  - Alert on response time differences >500ms
  - Track error rate parity across platforms
  - **Tool:** Custom monitoring dashboard
  - **Frequency:** Real-time
  - **Alert Threshold:** >5% difference in error rates

- [ ] **Feature Usage Analytics**
  - Track feature adoption across platforms
  - Monitor conversion funnel consistency
  - Identify platform-specific usage patterns
  - **Tool:** Analytics platform (e.g., Mixpanel, Amplitude)
  - **Frequency:** Daily reports
  - **Review:** Weekly team review
```

### Example Regression Testing Protocol
```markdown
# Regression Testing Protocol

## Automated Test Suite
- [ ] **Cross-Platform API Tests**
  - Run identical API test suite on all platforms
  - Validate response consistency
  - Check error handling uniformity
  - **Execution:** Every deployment
  - **Duration:** 15 minutes
  - **Pass Criteria:** 100% test pass rate

- [ ] **UI Consistency Tests**
  - Screenshot comparison across platforms
  - Layout and styling verification
  - Interactive element testing
  - **Execution:** Weekly
  - **Duration:** 2 hours
  - **Pass Criteria:** <5% visual differences
```

## Context Variables
- `{{target_platforms}}` - List of target platforms (web, ios, android, desktop)
- `{{verification_scope}}` - Scope of verification (feature/release/full)
- `{{project_name}}` - Name of the project for task organization
- `{{release_version}}` - Version being verified (if applicable)
- `{{critical_features}}` - List of critical features requiring verification

## Prompt Template

You are tasked with generating parity verification tasks for {{project_name}}{{#if release_version}} version {{release_version}}{{/if}}. These tasks will ensure cross-platform consistency is maintained and validated.

### Target Platforms
{{#each target_platforms}}
- {{this}}
{{/each}}

### Verification Scope: {{verification_scope}}

{{#if critical_features}}
### Critical Features
{{#each critical_features}}
- {{this}}
{{/each}}
{{/if}}

## Instructions

### 1. Pre-Deployment Verification Tasks

Generate a comprehensive checklist for pre-deployment verification:

```markdown
# Pre-Deployment Parity Verification Checklist

## Feature Functionality Verification

### Core Feature Parity
- [ ] **User Authentication**
  - [ ] Login flow works identically across all platforms
  - [ ] Session management behaves consistently
  - [ ] Logout process is uniform
  - [ ] Password reset functionality is equivalent
  - **Verification Method:** Manual testing + automated tests
  - **Acceptance Criteria:** 100% functional equivalence
  - **Responsible Team:** QA + Platform teams

- [ ] **Data Synchronization**
  - [ ] Create operations sync across platforms within 5 seconds
  - [ ] Update operations reflect consistently
  - [ ] Delete operations propagate correctly
  - [ ] Conflict resolution works uniformly
  - **Verification Method:** Automated sync tests
  - **Acceptance Criteria:** <5s sync time, 0% data loss
  - **Responsible Team:** Backend + Platform teams

- [ ] **User Interface Consistency**
  - [ ] Navigation patterns match platform conventions
  - [ ] Visual hierarchy is consistent
  - [ ] Interactive elements behave similarly
  - [ ] Error states display uniformly
  - **Verification Method:** Visual regression tests + manual review
  - **Acceptance Criteria:** Design system compliance
  - **Responsible Team:** Design + Frontend teams

### Platform-Specific Verification
- [ ] **Web Platform**
  - [ ] Browser compatibility (Chrome, Firefox, Safari, Edge)
  - [ ] Responsive design across screen sizes
  - [ ] Progressive Web App functionality
  - [ ] Accessibility compliance (WCAG 2.1 AA)
  - **Verification Method:** Cross-browser testing suite
  - **Acceptance Criteria:** 100% feature availability
  - **Responsible Team:** Web team

- [ ] **iOS Platform**
  - [ ] iOS version compatibility (iOS 14+)
  - [ ] Device compatibility (iPhone, iPad)
  - [ ] App Store guidelines compliance
  - [ ] iOS-specific features integration
  - **Verification Method:** Device testing + App Store validation
  - **Acceptance Criteria:** App Store approval ready
  - **Responsible Team:** iOS team

- [ ] **Android Platform**
  - [ ] Android version compatibility (API 21+)
  - [ ] Device fragmentation testing
  - [ ] Google Play Store compliance
  - [ ] Android-specific features integration
  - **Verification Method:** Device farm testing + Play Console validation
  - **Acceptance Criteria:** Play Store approval ready
  - **Responsible Team:** Android team

- [ ] **Desktop Platform**
  - [ ] Operating system compatibility (Windows, macOS, Linux)
  - [ ] Window management and system integration
  - [ ] Keyboard shortcuts and accessibility
  - [ ] Performance on various hardware configurations
  - **Verification Method:** Multi-OS testing + performance benchmarks
  - **Acceptance Criteria:** Consistent performance across OS
  - **Responsible Team:** Desktop team

## API and Data Verification

### API Endpoint Consistency
- [ ] **Request/Response Format**
  - [ ] All endpoints return consistent data structures
  - [ ] Error responses follow standard format
  - [ ] HTTP status codes are appropriate
  - [ ] Rate limiting behaves consistently
  - **Verification Method:** API contract tests
  - **Acceptance Criteria:** 100% schema compliance
  - **Responsible Team:** Backend team

- [ ] **Authentication and Authorization**
  - [ ] Token-based auth works across platforms
  - [ ] Permission checks are consistent
  - [ ] Session timeout handling is uniform
  - [ ] Refresh token flow is identical
  - **Verification Method:** Security testing suite
  - **Acceptance Criteria:** Zero security vulnerabilities
  - **Responsible Team:** Security + Backend teams

### Data Model Consistency
- [ ] **Data Validation**
  - [ ] Input validation rules are identical
  - [ ] Data transformation is consistent
  - [ ] Serialization/deserialization works uniformly
  - [ ] Database constraints are enforced equally
  - **Verification Method:** Data validation tests
  - **Acceptance Criteria:** 100% validation consistency
  - **Responsible Team:** Backend + Data teams

## Performance and Reliability Verification

### Performance Benchmarks
- [ ] **Response Time Consistency**
  - [ ] API response times within acceptable variance (<20%)
  - [ ] UI rendering performance is comparable
  - [ ] Data loading times are consistent
  - [ ] Offline/online transition is smooth
  - **Verification Method:** Performance testing suite
  - **Acceptance Criteria:** <20% variance in key metrics
  - **Responsible Team:** Performance + Platform teams

- [ ] **Resource Usage**
  - [ ] Memory usage is within platform norms
  - [ ] CPU usage is optimized for each platform
  - [ ] Network usage is efficient
  - [ ] Battery usage is minimized (mobile)
  - **Verification Method:** Resource monitoring tools
  - **Acceptance Criteria:** Platform-specific benchmarks met
  - **Responsible Team:** Platform teams

### Reliability Testing
- [ ] **Error Handling**
  - [ ] Network failures are handled gracefully
  - [ ] Server errors display consistent messages
  - [ ] Retry mechanisms work uniformly
  - [ ] Fallback behaviors are identical
  - **Verification Method:** Chaos engineering tests
  - **Acceptance Criteria:** Graceful degradation in all scenarios
  - **Responsible Team:** Reliability + Platform teams
```

### 2. Post-Deployment Verification Tasks

Generate ongoing monitoring and verification procedures:

```markdown
# Post-Deployment Parity Monitoring

## Continuous Monitoring Tasks

### Real-Time Parity Monitoring
- [ ] **Set up cross-platform analytics dashboards**
  - Monitor user behavior patterns across platforms
  - Track feature usage consistency
  - Identify platform-specific issues
  - Alert on significant variance (>15%)
  - **Frequency:** Real-time monitoring
  - **Responsible Team:** DevOps + Analytics teams

- [ ] **Implement automated parity checks**
  - Daily API response consistency validation
  - UI screenshot comparison tests
  - Performance benchmark monitoring
  - Data synchronization verification
  - **Frequency:** Daily automated runs
  - **Responsible Team:** QA + DevOps teams

### Weekly Verification Reviews
- [ ] **Platform Performance Review**
  - Compare key performance metrics across platforms
  - Identify performance degradation trends
  - Review user satisfaction scores by platform
  - Analyze support ticket patterns
  - **Deliverable:** Weekly parity report
  - **Responsible Team:** Product + Engineering teams

- [ ] **Feature Parity Assessment**
  - Verify new features work consistently
  - Check for platform-specific regressions
  - Validate user experience consistency
  - Review accessibility compliance
  - **Deliverable:** Feature parity scorecard
  - **Responsible Team:** QA + Product teams

### Monthly Deep-Dive Verification
- [ ] **Comprehensive Parity Audit**
  - Full feature functionality review
  - Cross-platform user journey testing
  - Performance benchmark comparison
  - Security posture assessment
  - **Deliverable:** Monthly parity audit report
  - **Responsible Team:** All teams

- [ ] **User Feedback Analysis**
  - Analyze platform-specific user feedback
  - Identify parity-related user issues
  - Review app store ratings and reviews
  - Conduct user satisfaction surveys
  - **Deliverable:** User feedback parity analysis
  - **Responsible Team:** Product + UX teams

## Issue Resolution Procedures

### Parity Violation Response
1. **Detection and Triage**
   - Automated alerts trigger investigation
   - Severity assessment (Critical/High/Medium/Low)
   - Platform impact analysis
   - User impact estimation

2. **Investigation and Root Cause Analysis**
   - Reproduce issue across affected platforms
   - Identify root cause (code, configuration, infrastructure)
   - Assess fix complexity and timeline
   - Determine temporary mitigation options

3. **Resolution and Validation**
   - Implement fix with cross-platform testing
   - Validate resolution across all platforms
   - Update monitoring to prevent recurrence
   - Document lessons learned

### Escalation Procedures
- **Critical Issues (P0):** Immediate escalation to engineering leadership
- **High Priority (P1):** Escalation within 4 hours
- **Medium Priority (P2):** Escalation within 24 hours
- **Low Priority (P3):** Include in next sprint planning
```

### 3. Verification Automation Tasks

Generate tasks for automating parity verification:

```markdown
# Parity Verification Automation Setup

## Automated Testing Infrastructure

### CI/CD Pipeline Integration
- [ ] **Set up cross-platform test execution**
  - Configure parallel testing across platforms
  - Implement test result aggregation
  - Set up failure notification system
  - Create parity-specific test gates
  - **Timeline:** 2 weeks
  - **Responsible Team:** DevOps team

- [ ] **Implement visual regression testing**
  - Set up screenshot capture across platforms
  - Configure visual diff analysis
  - Create baseline image management
  - Implement approval workflow for changes
  - **Timeline:** 3 weeks
  - **Responsible Team:** QA + DevOps teams

### Monitoring and Alerting
- [ ] **Deploy parity monitoring dashboards**
  - Create real-time parity metrics visualization
  - Set up automated alerting for violations
  - Implement trend analysis and reporting
  - Configure stakeholder notification system
  - **Timeline:** 2 weeks
  - **Responsible Team:** DevOps + Analytics teams

- [ ] **Implement synthetic transaction monitoring**
  - Create cross-platform user journey tests
  - Set up continuous execution schedule
  - Configure performance threshold alerting
  - Implement failure investigation automation
  - **Timeline:** 4 weeks
  - **Responsible Team:** QA + DevOps teams

## Data Collection and Analysis

### Metrics Collection
- [ ] **Set up cross-platform analytics**
  - Implement consistent event tracking
  - Configure platform-specific attribution
  - Set up data warehouse integration
  - Create automated reporting pipelines
  - **Timeline:** 3 weeks
  - **Responsible Team:** Analytics + Data teams

- [ ] **Deploy performance monitoring**
  - Install performance monitoring tools
  - Configure cross-platform benchmarking
  - Set up automated performance reporting
  - Implement performance regression detection
  - **Timeline:** 2 weeks
  - **Responsible Team:** Performance + DevOps teams
```

## Expected Outputs

1. **Verification Task Lists** (`VERIFICATION_TASKS.md`)
   - Comprehensive pre-deployment checklists
   - Post-deployment monitoring procedures
   - Automation setup tasks
   - Responsibility assignments and timelines

2. **Verification Procedures** (`VERIFICATION_PROCEDURES.md`)
   - Step-by-step verification processes
   - Issue resolution workflows
   - Escalation procedures
   - Quality gates and acceptance criteria

3. **Monitoring Configuration** (`MONITORING_CONFIG.md`)
   - Automated monitoring setup instructions
   - Alert configuration and thresholds
   - Dashboard specifications
   - Reporting requirements

4. **Verification Schedule** (`VERIFICATION_SCHEDULE.md`)
   - Daily, weekly, and monthly verification tasks
   - Responsibility matrix
   - Timeline and milestone tracking
   - Review and update procedures

## Success Criteria

- All verification tasks clearly defined and assigned
- Automated verification processes established
- Continuous monitoring and alerting implemented
- Issue resolution procedures documented and tested
- Regular verification schedule maintained
- Stakeholder communication and reporting established