# Platform Differences Documentation Generator

## Purpose
Generate comprehensive documentation of platform differences, including rationale, user impact, and mitigation strategies for cross-platform applications.

## Examples

### Platform Differences Documentation Example
```markdown
# Platform Differences Documentation: Task Management App

## Executive Summary
This document outlines intentional and unavoidable differences between web and mobile platforms for the Task Management App, ensuring stakeholders understand the rationale and user impact.

## Platform Difference Categories

### 1. Navigation Differences
**Web Platform**:
- Sidebar navigation with collapsible menu
- Breadcrumb navigation for deep pages
- Keyboard shortcuts for power users
- Multi-tab support for parallel workflows

**Mobile Platform**:
- Bottom tab navigation for thumb accessibility
- Swipe gestures for navigation
- Pull-to-refresh for content updates
- Single-task focused interface

**Rationale**: Mobile users prefer thumb-accessible navigation, while web users benefit from persistent navigation and keyboard shortcuts.

**User Impact**: Positive - Each platform optimized for its usage patterns

### 2. Input Method Differences
**Web Platform**:
- Full keyboard input with shortcuts
- Mouse hover states and tooltips
- Drag-and-drop task organization
- Right-click context menus

**Mobile Platform**:
- Touch-optimized input fields
- Voice input for task creation
- Long-press for context actions
- Haptic feedback for interactions

**Rationale**: Input methods are fundamentally different between platforms and should be optimized accordingly.

**User Impact**: Positive - Native input methods feel natural on each platform

### 3. Notification Differences
**Web Platform**:
- Browser notifications (when permitted)
- In-app notification center
- Email notifications as fallback
- Desktop notification integration

**Mobile Platform**:
- Push notifications with rich content
- Badge counts on app icon
- Notification grouping and management
- Background app refresh for updates

**Rationale**: Mobile platforms have superior notification capabilities that should be leveraged.

**User Impact**: Positive - Mobile users get better notification experience

## Mitigation Strategies

### 1. Feature Parity Alternatives
When features can't be identical, provide equivalent functionality:

**Example: File Upload**
- **Web**: Drag-and-drop file upload with progress indicators
- **Mobile**: Camera integration, photo library access, and file picker
- **Equivalent Value**: Both platforms allow easy file attachment with platform-appropriate methods

### 2. Progressive Enhancement
Start with core functionality and enhance based on platform capabilities:

**Example: Task Creation**
- **Core**: Text input for task description (all platforms)
- **Web Enhancement**: Keyboard shortcuts, markdown support, bulk operations
- **Mobile Enhancement**: Voice input, camera for visual tasks, location-based reminders

### 3. Cross-Platform Synchronization
Ensure data and state sync seamlessly between platforms:

**Example: Task Status**
- Real-time synchronization of task updates
- Conflict resolution for simultaneous edits
- Offline capability with sync when reconnected
- Consistent data model across all platforms
```

### Platform Capability Matrix Example
```markdown
# Platform Capability Matrix

## Core Features (100% Parity Required)
| Feature | Web | iOS | Android | Notes |
|---------|-----|-----|---------|-------|
| Task Creation | ✅ | ✅ | ✅ | Identical functionality |
| Task Editing | ✅ | ✅ | ✅ | Same editing capabilities |
| Task Completion | ✅ | ✅ | ✅ | Consistent behavior |
| User Authentication | ✅ | ✅ | ✅ | Same login methods |
| Data Synchronization | ✅ | ✅ | ✅ | Real-time sync |

## Enhanced Features (Platform-Optimized)
| Feature | Web | iOS | Android | Notes |
|---------|-----|-----|---------|-------|
| Keyboard Shortcuts | ✅ | ❌ | ❌ | Web-specific enhancement |
| Voice Input | ❌ | ✅ | ✅ | Mobile-specific feature |
| Push Notifications | ⚠️ | ✅ | ✅ | Limited on web |
| Biometric Auth | ❌ | ✅ | ✅ | Mobile hardware feature |
| Drag & Drop | ✅ | ⚠️ | ⚠️ | Limited mobile support |

## Platform-Specific Features
| Feature | Web | iOS | Android | Notes |
|---------|-----|-----|---------|-------|
| Browser Extensions | ✅ | ❌ | ❌ | Web-only capability |
| Siri Integration | ❌ | ✅ | ❌ | iOS-specific |
| Google Assistant | ❌ | ❌ | ✅ | Android-specific |
| Desktop Notifications | ✅ | ❌ | ❌ | Desktop-specific |
| App Store Features | ❌ | ✅ | ✅ | Mobile app stores |

Legend:
- ✅ Full support
- ⚠️ Limited support
- ❌ Not supported/Not applicable
```

**Functional Differences**
- Features available on some platforms but not others
- Variations in feature behavior or capabilities
- Platform-specific enhancements or limitations

**User Experience Differences**
- Navigation patterns and conventions
- Interaction methods (touch, mouse, keyboard)
- Visual design adaptations

**Technical Differences**
- API availability and capabilities
- Hardware access and permissions
- Performance characteristics

**Business/Policy Differences**
- App store requirements and restrictions
- Platform-specific monetization options
- Compliance and regulatory requirements

### 2. Documentation Structure

For each identified difference, create a structured entry:

```markdown
## [Difference Name]

### Platforms Affected
- Platform A: [Description of behavior/limitation]
- Platform B: [Description of behavior/limitation]
- Platform C: [Description of behavior/limitation]

### Category
[Functional/UX/Technical/Business]

### Rationale
**Why this difference exists:**
- Technical constraints: [Explanation]
- Platform conventions: [Explanation]
- Business requirements: [Explanation]
- User expectations: [Explanation]

### User Impact Assessment
**Severity:** [Critical/High/Medium/Low]

**Impact Description:**
- Functional impact: [How it affects what users can do]
- Experience impact: [How it affects user satisfaction]
- Adoption impact: [How it affects platform choice]

### Mitigation Strategies

**Primary Strategy:** [Main approach to address the difference]
- Implementation details
- Expected outcomes
- Resource requirements

**Alternative Strategies:**
1. [Alternative approach 1]
2. [Alternative approach 2]
3. [Fallback option]

**Communication Strategy:**
- How to inform users about the difference
- Documentation and help content needed
- Support considerations

### Implementation Status
- Current status: [Not Started/In Progress/Completed]
- Target completion: [Date]
- Dependencies: [List of blockers or prerequisites]
- Assigned team: [Team responsible]

### Success Metrics
- How to measure if mitigation is successful
- User satisfaction indicators
- Technical performance metrics
```

### 3. Analysis Guidelines

**Root Cause Analysis**
- Identify the fundamental reason for each difference
- Distinguish between technical limitations and design choices
- Assess whether differences are permanent or temporary

**Impact Prioritization**
- Evaluate user impact severity and frequency
- Consider business impact and strategic importance
- Assess technical debt and maintenance burden

**Solution Evaluation**
- Compare multiple mitigation approaches
- Consider cost-benefit analysis
- Evaluate long-term sustainability

### 4. Platform-Specific Considerations

**Web Platform**
- Browser compatibility variations
- Progressive Web App limitations
- Desktop vs mobile web differences

**iOS Platform**
- App Store review guidelines
- iOS-specific UI conventions
- Hardware and API limitations

**Android Platform**
- Device fragmentation considerations
- Google Play Store requirements
- Android version compatibility

**Desktop Platform**
- Operating system differences (Windows, macOS, Linux)
- Window management and system integration
- Hardware capability variations

### 5. Stakeholder Communication

**Executive Summary**
- High-level overview of critical differences
- Business impact and risk assessment
- Resource requirements for mitigation

**Development Team Guide**
- Technical implementation details
- Code organization strategies
- Testing considerations

**Product Team Reference**
- Feature planning implications
- User story adaptations
- Release planning considerations

**Support Team Handbook**
- User-facing explanations
- Troubleshooting guides
- Escalation procedures

{{#if dry_run}}
### Dry Run Mode

Generate a sample documentation structure with placeholder content to validate:
- Documentation format and completeness
- Analysis depth and coverage
- Stakeholder communication effectiveness
- Maintenance and update procedures

Focus on structure and process rather than specific technical details.
{{/if}}

## Context Variables
- `{{target_platforms}}` - List of target platforms (web, ios, android, desktop)
- `{{platform_differences}}` - List of identified platform differences to document
- `{{project_name}}` - Name of the project for documentation
- `{{difference_categories}}` - Categories of differences (navigation, input, features, etc.)
- `{{dry_run}}` - Boolean flag for validation-only mode

## Prompt Template

You are tasked with generating comprehensive platform differences documentation for {{project_name}}. This documentation will help stakeholders understand intentional and unavoidable differences between platforms.

### Target Platforms
{{#each target_platforms}}
- {{this}}
{{/each}}

### Platform Differences to Document
{{#each platform_differences}}
- {{this}}
{{/each}}

### Difference Categories
{{#each difference_categories}}
- {{this}}
{{/each}}

## Expected Outputs

1. **Platform Differences Register** (`PLATFORM_DIFFERENCES.md`)
   - Comprehensive list of all identified differences
   - Structured documentation for each difference
   - Cross-references and relationships

2. **Mitigation Strategy Guide** (`MITIGATION_STRATEGIES.md`)
   - Detailed implementation plans for each mitigation
   - Resource requirements and timelines
   - Success criteria and measurement approaches

3. **User Communication Plan** (`USER_COMMUNICATION.md`)
   - User-facing explanations of differences
   - Help documentation and FAQs
   - Support process and escalation paths

4. **Platform Capability Comparison** (`PLATFORM_COMPARISON.md`)
   - Side-by-side feature comparison
   - Capability matrices and charts
   - Strategic recommendations

## Maintenance Process

**Regular Reviews**
- Monthly assessment of documented differences
- Quarterly strategic review of mitigation effectiveness
- Annual platform capability reassessment

**Update Triggers**
- New platform versions or capabilities
- Changes in business requirements
- User feedback and support trends
- Competitive landscape changes

**Version Control**
- Track changes to difference documentation
- Maintain historical context for decisions
- Document evolution of mitigation strategies

## Integration Points

- Link to parity matrix and capability tracking
- Connect to user research and feedback systems
- Integrate with product roadmap and planning
- Reference technical architecture documentation

## Success Criteria

- All significant platform differences documented
- Clear rationale provided for each difference
- Actionable mitigation strategies defined
- Stakeholder communication materials created
- Regular maintenance process established
- User impact minimized through effective mitigation

## Instructions

### How to Generate Platform Differences Documentation

1. **Conduct Platform Analysis**
   - Review each platform's capabilities, limitations, and conventions
   - Identify areas where platforms differ in functionality, UX, or technical implementation
   - Categorize differences by type (Functional, UX, Technical, Business/Policy)
   - Assess the impact and severity of each difference

2. **Document Each Difference**
   - Use the structured format provided in the examples
   - Include clear descriptions of how each platform behaves
   - Provide rationale explaining why the difference exists
   - Assess user impact with severity levels (Critical/High/Medium/Low)
   - Define mitigation strategies with implementation details

3. **Create Platform Capability Matrix**
   - Build comprehensive comparison tables showing feature support across platforms
   - Use clear symbols (✅ Full support, ⚠️ Limited support, ❌ Not supported)
   - Include notes explaining limitations or platform-specific behaviors
   - Organize by feature categories (Core Features, Enhanced Features, Platform-Specific)

4. **Develop Mitigation Strategies**
   - For each significant difference, define primary and alternative mitigation approaches
   - Consider progressive enhancement strategies that start with core functionality
   - Plan cross-platform synchronization for data consistency
   - Design equivalent functionality that provides similar value on each platform

5. **Plan Stakeholder Communication**
   - Create executive summaries for business stakeholders
   - Develop technical implementation guides for development teams
   - Prepare user-facing explanations for support teams
   - Design communication strategies to inform users about platform differences

6. **Establish Maintenance Process**
   - Set up regular review schedules (monthly assessments, quarterly strategic reviews)
   - Define update triggers (new platform versions, business requirement changes)
   - Implement version control for documentation changes
   - Create integration points with product roadmap and planning processes

### Integration with Other Modules

- **With Parity Matrix**: Use capability data to identify and document differences
- **With Shared Contracts**: Reference common interfaces when documenting platform variations
- **With Validation Tests**: Coordinate with testing strategies to verify mitigation effectiveness
- **With Product Planning**: Integrate difference documentation into feature planning and roadmap decisions

### Documentation Structure Guidelines

**For Each Platform Difference:**
- Start with clear, descriptive names that indicate the nature of the difference
- Specify which platforms are affected and how they differ
- Categorize the difference type for better organization
- Provide comprehensive rationale explaining technical, business, or UX reasons
- Assess user impact with specific examples and severity ratings
- Define multiple mitigation strategies with implementation details and resource requirements
- Include success metrics to measure mitigation effectiveness

**For Platform Capability Matrices:**
- Organize features into logical categories (Core, Enhanced, Platform-Specific)
- Use consistent symbols and notation across all matrices
- Include detailed notes explaining limitations or special considerations
- Provide context for why certain features are or aren't supported on specific platforms
- Reference related documentation and implementation guides

**For Stakeholder Communication:**
- Tailor content and detail level to audience needs and technical expertise
- Focus on business impact and user experience for executive summaries
- Provide technical implementation details for development teams
- Create user-friendly explanations for customer-facing teams
- Include visual aids like comparison charts and decision trees where helpful