# Cross-Platform Parity Matrix Generator

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
Generate and maintain a comprehensive capability matrix that tracks feature implementation status and functional equivalence across all target platforms.

## Instructions
Use this template to create and maintain cross-platform parity matrices for your project. Start by identifying all target platforms and features that need tracking. Create the matrix structure using the provided format with clear status indicators (✅/⚠️/❌/🔄). For each feature-platform combination, assess functional equivalence, platform-specific considerations, and implementation complexity. Document any parity gaps with mitigation strategies and maintain the matrix regularly throughout development. Use the dry-run mode to validate matrix structure before full implementation.

## Examples

### Basic Parity Matrix
```markdown
# Cross-Platform Parity Matrix: Task Management App

## Feature Implementation Status

| Feature | Web | iOS | Android | Desktop | Notes |
|---------|-----|-----|---------|---------|-------|
| User Authentication | ✅ | ✅ | ✅ | ✅ | OAuth 2.0 across all platforms |
| Task Creation | ✅ | ✅ | ✅ | ✅ | Full CRUD operations |
| Offline Sync | ✅ | ⚠️ | ⚠️ | ✅ | Mobile: Limited by storage |
| Push Notifications | ❌ | ✅ | ✅ | ⚠️ | Web: No native support, Desktop: System notifications only |
| File Attachments | ✅ | 🔄 | 🔄 | ✅ | Mobile: In development |
| Real-time Collaboration | ✅ | ✅ | ✅ | ✅ | WebSocket implementation |

Legend:
- ✅ Full Implementation
- ⚠️ Partial Implementation / Platform Limitations  
- ❌ Not Implemented / Not Applicable
- 🔄 In Progress
```

### Parity Gap Analysis
```markdown
# Parity Gap Analysis

## Critical Gaps
### Push Notifications on Web
**Impact**: High - Users miss important updates
**Mitigation**: 
- Implement in-app notification system
- Email notifications as fallback
- Progressive Web App notifications where supported

### Offline Storage Limitations on Mobile
**Impact**: Medium - Reduced offline capability
**Mitigation**:
- Implement intelligent data prioritization
- User-configurable sync settings
- Clear storage limit communication

## Platform-Specific Enhancements
### iOS Specific
- Siri Shortcuts integration
- Apple Watch companion app
- iOS 16+ Lock Screen widgets

### Android Specific  
- Android Auto integration
- Adaptive icons and Material You theming
- Wear OS companion app
```

### Platform Capability Assessment
```markdown
# Platform Capabilities Summary

## Web Platform
**Strengths**:
- Universal accessibility
- Rapid deployment and updates
- Rich UI capabilities with modern CSS/JS
- Cross-platform consistency

**Limitations**:
- Limited native device integration
- No native push notifications (except PWA)
- Performance constraints for heavy operations
- Browser compatibility considerations

**Opportunities**:
- Progressive Web App features
- WebAssembly for performance-critical code
- Web Share API integration
- Service Worker capabilities

## iOS Platform
**Strengths**:
- Rich native API access
- Excellent performance and user experience
- Strong security and privacy features
- App Store distribution

**Limitations**:
- Apple ecosystem restrictions
- App Store review process
- Development requires macOS
- Limited customization options

**Opportunities**:
- iOS 16+ features (Live Activities, Lock Screen widgets)
- Siri and Shortcuts integration
- Apple Watch and other ecosystem devices
- ARKit and advanced camera features
```

## Context Variables
- `{{target_platforms}}` - List of target platforms (web, ios, android, desktop)
- `{{features}}` - List of features to track across platforms
- `{{project_name}}` - Name of the project for documentation
- `{{dry_run}}` - Boolean flag for validation-only mode

## Prompt Template

You are tasked with creating a comprehensive cross-platform parity matrix for {{project_name}}. This matrix will track feature implementation status and ensure functional equivalence across all target platforms.

### Target Platforms
{{#each target_platforms}}
- {{this}}
{{/each}}

### Features to Track
{{#each features}}
- {{this}}
{{/each}}

## Instructions

### 1. Create Capability Matrix Structure

Generate a matrix table with the following structure:

```markdown
# Cross-Platform Parity Matrix

## Feature Implementation Status

| Feature | Web | iOS | Android | Desktop | Notes |
|---------|-----|-----|---------|---------|-------|
| [Feature Name] | ✅/⚠️/❌ | ✅/⚠️/❌ | ✅/⚠️/❌ | ✅/⚠️/❌ | Implementation notes |

Legend:
- ✅ Full Implementation
- ⚠️ Partial Implementation / Platform Limitations
- ❌ Not Implemented / Not Applicable
- 🔄 In Progress
```

### 2. Feature Analysis Guidelines

For each feature, analyze:

**Functional Equivalence**
- Core functionality availability across platforms
- User experience consistency
- Performance characteristics
- Data synchronization requirements

**Platform-Specific Considerations**
- Native platform capabilities and limitations
- Platform UI/UX conventions
- Technical constraints (API availability, hardware access)
- App store requirements and restrictions

**Implementation Complexity**
- Development effort required per platform
- Shared code opportunities
- Platform-specific code requirements
- Testing complexity

### 3. Parity Assessment Criteria

**Full Parity (✅)**
- Identical functionality across platforms
- Consistent user experience
- Equivalent performance characteristics
- Same data handling and synchronization

**Partial Parity (⚠️)**
- Core functionality present but with platform adaptations
- Minor UX differences due to platform conventions
- Performance variations within acceptable ranges
- Platform-specific feature enhancements

**No Parity (❌)**
- Feature not available on platform
- Significant functionality differences
- Platform technical limitations prevent implementation
- Business decision to exclude from platform

### 4. Documentation Requirements

For each matrix entry, provide:

**Implementation Status**
- Current development status
- Planned implementation timeline
- Dependencies and blockers

**Platform Differences**
- Specific variations in functionality
- Rationale for differences
- User impact assessment

**Mitigation Strategies**
- Alternative approaches for limited platforms
- Graceful degradation strategies
- User communication about limitations

### 5. Maintenance Guidelines

**Regular Updates**
- Review matrix weekly during active development
- Update status as features are implemented
- Track changes in platform capabilities

**Stakeholder Communication**
- Share matrix with product and design teams
- Highlight critical parity gaps
- Propose solutions for identified issues

**Quality Gates**
- Define minimum parity requirements for release
- Establish acceptance criteria for partial implementations
- Create escalation process for parity conflicts

{{#if dry_run}}
### Dry Run Mode

Generate a sample matrix structure with placeholder data to validate:
- Matrix format and completeness
- Feature categorization approach
- Assessment criteria clarity
- Documentation requirements coverage

Do not generate actual implementation details or specific technical analysis.
{{/if}}

## Expected Outputs

1. **Parity Matrix Document** (`PARITY_MATRIX.md`)
   - Complete feature-platform matrix
   - Status indicators and legends
   - Implementation notes and timelines

2. **Parity Gap Analysis** (`PARITY_GAPS.md`)
   - Identified gaps and their impact
   - Mitigation strategies and alternatives
   - Priority recommendations

3. **Platform Capability Summary** (`PLATFORM_CAPABILITIES.md`)
   - Platform-specific strengths and limitations
   - Technical constraint documentation
   - Opportunity identification

4. **Parity Maintenance Plan** (`PARITY_MAINTENANCE.md`)
   - Update schedule and responsibilities
   - Review process and criteria
   - Escalation procedures

## Integration Points

- Link to shared contract specifications
- Reference platform-specific implementation guides
- Connect to testing and validation procedures
- Integrate with project planning and roadmap tools

## Success Criteria

- All features tracked across all platforms
- Clear status indicators for each feature-platform combination
- Documented rationale for all parity decisions
- Actionable mitigation strategies for identified gaps
- Regular maintenance process established
