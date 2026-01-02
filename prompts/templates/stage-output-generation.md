# Stage Output Generation Prompts

## Purpose
Generate comprehensive, platform-specific files for each development stage, ensuring consistency and completeness across all platforms.

## Instructions
Use these prompts to generate platform-specific files (platform-agnostic.md, web.md, mobile.md, backend.md) for each stage. Ensure all required content sections are present and validate completeness before marking stages complete.

## Examples
```markdown
## Example Stage Output Generation

### Stage 04 - Features: Web Platform

**Generated Content**:
```markdown
# Stage 04: Features - Web Platform

## Web-Specific Scope
Feature implementation for React + Next.js web application with server-side rendering and progressive enhancement.

## Web Technology Stack
- Frontend: React 18 + Next.js 14 + TypeScript
- Styling: Tailwind CSS + Headless UI
- State: Zustand for client state, SWR for server state
- Testing: Jest + React Testing Library + Playwright

## Web Architecture Decisions
- **SSR with Hydration**: Server-side rendering for SEO and performance
- **Progressive Enhancement**: Core functionality works without JavaScript
- **Component Architecture**: Atomic design with reusable components

## Web-Specific Requirements
- Core Web Vitals: LCP < 2.5s, FID < 100ms, CLS < 0.1
- Browser Support: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- Responsive Design: Mobile-first approach with breakpoints
- PWA Features: Service worker, offline caching, installable
```

**Validation Result**: ✅ All required sections present, quality gates passed
```

## Platform-Specific File Generation Prompt

You are responsible for generating comprehensive, platform-specific files for each development stage. Each stage must produce files tailored to different platforms while maintaining consistency and completeness.

### Platform File Structure

**Required Platform Files:**
- `platform-agnostic.md` - Universal specifications and requirements
- `web.md` - Web-specific implementations and considerations  
- `mobile.md` - Mobile platform specifications (iOS/Android/Cross-platform)
- `backend.md` - Server-side and API specifications (when applicable)

### Platform-Agnostic File Template

```markdown
# Stage {stage_number}: {stage_name} - Platform Agnostic

## Scope
{define_what_this_stage_covers_universally}

## Assumptions
{list_assumptions_that_apply_across_all_platforms}

## Universal Requirements
{requirements_that_must_be_met_on_all_platforms}

## Acceptance Criteria
{criteria_for_stage_completion_regardless_of_platform}

## Cross-Platform Considerations
{factors_that_affect_multiple_platforms}

## Risks and Mitigation
{universal_risks_and_how_to_address_them}

## Next Steps
{what_needs_to_happen_after_this_stage_completes}
```

### Web Platform File Template

```markdown
# Stage {stage_number}: {stage_name} - Web Platform

## Web-Specific Scope
{what_this_stage_covers_for_web_applications}

## Web Technology Stack
{specific_technologies_frameworks_and_tools_for_web}

## Web Architecture Decisions
{architectural_patterns_spa_ssr_jamstack_headless}

## Web-Specific Requirements
{requirements_unique_to_web_platform}

## Browser Compatibility
{supported_browsers_and_compatibility_requirements}

## Web Performance Considerations
{loading_times_bundle_sizes_optimization_strategies}

## Web Accessibility Requirements
{wcag_compliance_keyboard_navigation_screen_readers}

## Web Security Considerations
{cors_csp_authentication_data_protection}

## Web Deployment Strategy
{hosting_cdn_build_process_deployment_pipeline}

## Web-Specific Risks
{risks_unique_to_web_platform_and_mitigation}

## Web Next Steps
{web_specific_actions_for_next_stage}
```
### Mobile Platform File Template

```markdown
# Stage {stage_number}: {stage_name} - Mobile Platform

## Mobile-Specific Scope
{what_this_stage_covers_for_mobile_applications}

## Mobile Technology Stack
{native_react_native_flutter_xamarin_decisions}

## Mobile Platform Decisions
{ios_android_cross_platform_strategy}

## Mobile-Specific Requirements
{requirements_unique_to_mobile_platforms}

## Device Compatibility
{supported_devices_os_versions_screen_sizes}

## Mobile Performance Considerations
{battery_usage_memory_optimization_offline_capabilities}

## Mobile UX Considerations
{touch_interfaces_navigation_patterns_platform_conventions}

## Mobile Security Considerations
{app_store_requirements_data_encryption_biometric_auth}

## Mobile Deployment Strategy
{app_store_submission_beta_testing_update_mechanisms}

## Mobile-Specific Risks
{risks_unique_to_mobile_platforms_and_mitigation}

## Mobile Next Steps
{mobile_specific_actions_for_next_stage}
```

### Backend Platform File Template

```markdown
# Stage {stage_number}: {stage_name} - Backend Platform

## Backend-Specific Scope
{what_this_stage_covers_for_server_side_components}

## Backend Technology Stack
{languages_frameworks_databases_infrastructure}

## Backend Architecture Decisions
{microservices_monolithic_serverless_patterns}

## Backend-Specific Requirements
{requirements_unique_to_server_side_implementation}

## API Design Specifications
{rest_graphql_websocket_api_patterns}

## Data Management Strategy
{database_design_caching_data_flow}

## Backend Performance Considerations
{scalability_load_handling_optimization}

## Backend Security Considerations
{authentication_authorization_data_protection}

## Backend Deployment Strategy
{cloud_providers_containerization_ci_cd}

## Backend-Specific Risks
{risks_unique_to_backend_implementation_and_mitigation}

## Backend Next Steps
{backend_specific_actions_for_next_stage}
```

## Required Content Sections Validation Prompt

You are responsible for ensuring that every generated stage file contains all required content sections. This validation ensures completeness and consistency across all stage outputs.

### Universal Required Sections

**Every Platform File Must Include:**
1. **Scope** - Clear definition of what the stage covers for this platform
2. **Assumptions** - Documented assumptions made during stage execution
3. **Requirements** - Specific requirements that must be met
4. **Acceptance Criteria** - Measurable criteria for stage completion
5. **Risks and Mitigation** - Identified risks and mitigation strategies
6. **Next Steps** - Clear actions required for the next stage

### Platform-Specific Required Sections

**Web Platform Additional Sections:**
- Technology Stack (frameworks, tools, libraries)
- Architecture Decisions (SPA, SSR, JAMstack, headless)
- Browser Compatibility requirements
- Performance Considerations (loading, optimization)
- Accessibility Requirements (WCAG compliance)
- Security Considerations (CORS, CSP, auth)
- Deployment Strategy (hosting, CDN, build process)

**Mobile Platform Additional Sections:**
- Technology Stack (native, React Native, Flutter)
- Platform Decisions (iOS, Android, cross-platform)
- Device Compatibility (devices, OS versions, screens)
- Performance Considerations (battery, memory, offline)
- UX Considerations (touch, navigation, conventions)
- Security Considerations (app store, encryption, biometrics)
- Deployment Strategy (app stores, beta testing, updates)

**Backend Platform Additional Sections:**
- Technology Stack (languages, frameworks, databases)
- Architecture Decisions (microservices, serverless, patterns)
- API Design Specifications (REST, GraphQL, WebSocket)
- Data Management Strategy (database, caching, flow)
- Performance Considerations (scalability, load, optimization)
- Security Considerations (auth, authorization, protection)
- Deployment Strategy (cloud, containers, CI/CD)
### Content Validation Checklist

**Before Marking Stage Complete, Verify:**

```markdown
## Platform-Agnostic File Validation
- [ ] Scope clearly defines universal stage coverage
- [ ] Assumptions are documented and reasonable
- [ ] Universal requirements are comprehensive
- [ ] Acceptance criteria are measurable and testable
- [ ] Cross-platform considerations are addressed
- [ ] Risks are identified with mitigation strategies
- [ ] Next steps are clear and actionable

## Web Platform File Validation
- [ ] Web-specific scope is defined
- [ ] Technology stack decisions are documented
- [ ] Architecture pattern is selected and justified
- [ ] Browser compatibility requirements are specified
- [ ] Performance optimization strategies are included
- [ ] Accessibility compliance is addressed (WCAG 2.1 AA)
- [ ] Security considerations are comprehensive
- [ ] Deployment strategy is feasible and detailed

## Mobile Platform File Validation
- [ ] Mobile-specific scope is defined
- [ ] Technology stack decisions are documented
- [ ] Platform strategy is selected (native/cross-platform)
- [ ] Device compatibility matrix is specified
- [ ] Performance optimization for mobile is addressed
- [ ] Mobile UX patterns are considered
- [ ] App store requirements are addressed
- [ ] Mobile deployment strategy is detailed

## Backend Platform File Validation (if applicable)
- [ ] Backend-specific scope is defined
- [ ] Technology stack decisions are documented
- [ ] Architecture pattern is selected and justified
- [ ] API design specifications are complete
- [ ] Data management strategy is comprehensive
- [ ] Scalability considerations are addressed
- [ ] Security implementation is detailed
- [ ] Backend deployment strategy is feasible
```

## Stage Completion Validation Prompt

You are responsible for validating that a development stage is truly complete before allowing progression to the next stage. This validation ensures quality and prevents issues from propagating forward.

### Stage Completion Criteria

**Technical Completeness:**
1. All required platform files are generated and complete
2. All required content sections are present and substantive
3. No placeholder content or "TODO" items remain
4. All decisions are documented with rationale
5. All assumptions are explicitly stated

**Quality Gates:**
1. Requirements are testable and measurable
2. Acceptance criteria can be objectively validated
3. Risks are realistic and mitigation strategies are actionable
4. Technology choices are justified and feasible
5. Platform-specific considerations are appropriate

**Context Continuity:**
1. Stage builds logically on previous stage outputs
2. Context is preserved and enhanced from previous stages
3. Decisions are consistent with earlier architectural choices
4. No conflicts exist with previous stage decisions
5. Rolling context summary is updated

### Validation Process

**Step 1: Content Completeness Check**
```
For each platform file, verify:
- All required sections are present
- Content is substantive, not placeholder
- Technical details are specific and actionable
- Decisions are documented with rationale
```

**Step 2: Quality Assessment**
```
Evaluate each file for:
- Clarity and specificity of requirements
- Feasibility of proposed solutions
- Consistency with project goals and constraints
- Appropriateness of technology choices
- Completeness of risk assessment
```

**Step 3: Integration Validation**
```
Check cross-platform consistency:
- Requirements align across all platforms
- Technology choices are compatible
- Architecture decisions are coherent
- No conflicting specifications exist
```

**Step 4: Context Validation**
```
Ensure proper context management:
- Stage builds on previous outputs
- Context summary is updated
- Decision log is maintained
- Next stage prerequisites are identified
```

### Completion Decision Matrix

**Stage is COMPLETE when:**
- ✅ All platform files exist and are complete
- ✅ All required sections contain substantive content
- ✅ Quality gates are satisfied
- ✅ Context is properly maintained and updated
- ✅ No blocking issues or conflicts exist

**Stage is INCOMPLETE when:**
- ❌ Missing platform files or sections
- ❌ Placeholder content or undefined decisions
- ❌ Quality issues or infeasible specifications
- ❌ Context gaps or inconsistencies
- ❌ Unresolved conflicts or blocking issues

### Remediation Protocol

**When Stage is Incomplete:**
1. Document specific deficiencies found
2. Prioritize issues by impact on next stages
3. Generate additional content to address gaps
4. Re-validate after remediation
5. Only proceed when all criteria are met

**When Conflicts Exist:**
1. Identify the nature and scope of conflicts
2. Present options with trade-offs
3. Apply intelligent defaults or request user input
4. Document resolution rationale
5. Update affected files and context