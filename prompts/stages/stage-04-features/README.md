# Stage 04 - Features

## Purpose
Generate detailed feature specifications with comprehensive requirements, user stories, and acceptance criteria.

## Instructions
Use this stage to transform architectural decisions into detailed feature specifications. Start with the platform-agnostic.md file to define core feature requirements, user stories, and acceptance criteria that apply across all platforms. Then create platform-specific implementations in web.md and mobile.md that adapt the core features to each platform's capabilities and constraints. Ensure feature parity is maintained where possible and document any platform-specific variations with clear rationale. Include comprehensive user story mapping and create a feature parity matrix to track implementation status across platforms.

## Examples

### Feature Specification Structure
```markdown
# Feature: User Task Management

## User Stories
**As a** task manager user
**I want to** create, edit, and organize my tasks
**So that** I can track my work and stay productive

## Acceptance Criteria
1. WHEN a user creates a new task, THE system SHALL save it with title, description, and due date
2. WHEN a user edits a task, THE system SHALL update the task and preserve edit history
3. WHEN a user marks a task complete, THE system SHALL move it to completed status
4. WHEN a user deletes a task, THE system SHALL confirm the action and remove it permanently

## Platform Considerations
- **Web**: Full-featured task editor with rich text support
- **Mobile**: Streamlined interface optimized for touch input
- **Offline**: All operations must work offline with sync when online
```

### Feature Parity Matrix Example
```markdown
| Feature | Web | iOS | Android | Notes |
|---------|-----|-----|---------|-------|
| Task Creation | ✅ | ✅ | ✅ | Full parity |
| Rich Text Editor | ✅ | ⚠️ | ⚠️ | Mobile: Basic formatting only |
| File Attachments | ✅ | ✅ | ✅ | Full parity |
| Offline Sync | ✅ | ✅ | ✅ | Full parity |
```

### User Story Mapping
```markdown
## User Journey: Task Management Workflow

### Epic: Task Lifecycle Management
1. **Create Task** → 2. **Edit Task** → 3. **Complete Task** → 4. **Archive Task**

#### Story Details:
- **Create Task**: User can quickly add new tasks with essential information
- **Edit Task**: User can modify task details and add additional context
- **Complete Task**: User can mark tasks as done and track progress
- **Archive Task**: User can clean up completed tasks while preserving history
```

## Inputs
- System architecture (Stage 03)
- Feature breakdown and prioritization
- Cross-platform requirements and constraints

## Outputs
- `platform-agnostic.md` - Core feature specifications
- `web.md` - Web-specific feature implementations
- `mobile.md` - Mobile-specific feature implementations
- Feature parity matrix and validation requirements
- User story mapping and acceptance criteria

## Prerequisites
- Stage 03 (Architecture) completed
- Feature prioritization defined

## Next Stage
Stage 05 - Testing (Testing strategy and requirements)