# PROJECT_STATUS.md Maintenance Template

## Purpose
Maintain a comprehensive PROJECT_STATUS.md file that provides real-time visibility into project progress, current state, and immediate next steps for any AI agent or stakeholder.

## Instructions
Use this template to create and maintain a PROJECT_STATUS.md file that serves as the single source of truth for project progress. Update the file regularly to reflect current state, completed work, active tasks, and upcoming milestones. Follow the structured format to ensure consistency and clarity for all stakeholders.

## Examples
```markdown
# Project Status: E-commerce Platform

**Last Updated**: 2024-01-15
**Project Phase**: Development Phase 2
**Overall Progress**: 65%
**Next Milestone**: Beta Release - January 30, 2024

## Quick Summary
Core shopping functionality is complete and tested. Currently implementing payment processing and user account features. On track for beta release with minor adjustments to timeline.

## Development Progress

### Completed Phases
- [x] Phase 1: Foundation & Setup - Completed Dec 15, 2023
- [x] Phase 1.5: Core Architecture - Completed Jan 5, 2024

### Current Phase: Development Phase 2
**Started**: January 6, 2024
**Target Completion**: January 28, 2024
**Progress**: 75%

#### Completed in Current Phase
- [x] Product catalog implementation
- [x] Shopping cart functionality
- [x] Basic user authentication

#### In Progress
- [ ] Payment processing integration - Assigned to: Dev Team A - Due: Jan 20
- [ ] User account management - Assigned to: Dev Team B - Due: Jan 25

#### Upcoming
- [ ] Order management system
- [ ] Admin dashboard
```

## Context Requirements
- Current development stage and milestone progress
- Completed features and implementations
- Active work items and assignments
- Known issues and blockers
- Recent achievements and changes

## Prompt Template

```
You are responsible for updating the PROJECT_STATUS.md file to reflect the current state of the project. This file serves as the single source of truth for project progress and status.

## Current Context
- **Project Phase**: {current_phase}
- **Last Status Update**: {last_update_date}
- **Recent Completions**: {recent_completions}
- **Active Work**: {active_work_items}
- **Upcoming Milestones**: {upcoming_milestones}

## PROJECT_STATUS.md Structure

### 1. Project Overview Section
```markdown
# Project Status: {Project Name}

**Last Updated**: {current_date}
**Project Phase**: {current_phase}
**Overall Progress**: {completion_percentage}%
**Next Milestone**: {next_milestone}

## Quick Summary
{Brief 2-3 sentence summary of current state and immediate focus}
```

### 2. Progress Tracking Section
```markdown
## Development Progress

### Completed Phases
- [x] Phase 1: {phase_name} - Completed {completion_date}
- [x] Phase 2: {phase_name} - Completed {completion_date}

### Current Phase: {current_phase_name}
**Started**: {start_date}
**Target Completion**: {target_date}
**Progress**: {phase_progress}%

#### Completed in Current Phase
- [x] {completed_task_1}
- [x] {completed_task_2}

#### In Progress
- [ ] {active_task_1} - Assigned to: {assignee} - Due: {due_date}
- [ ] {active_task_2} - Assigned to: {assignee} - Due: {due_date}

#### Upcoming
- [ ] {upcoming_task_1}
- [ ] {upcoming_task_2}

### Future Phases
- [ ] Phase N: {phase_name} - Planned start: {planned_date}
```

### 3. Feature Status Section
```markdown
## Feature Implementation Status

### Core Features
| Feature | Status | Progress | Notes |
|---------|--------|----------|-------|
| {feature_1} | ✅ Complete | 100% | Deployed to production |
| {feature_2} | 🚧 In Progress | 75% | Testing phase |
| {feature_3} | 📋 Planned | 0% | Scheduled for next sprint |

### Platform Status
| Platform | Status | Version | Last Deploy |
|----------|--------|---------|-------------|
| Web | ✅ Live | v{version} | {deploy_date} |
| iOS | 🚧 Development | v{version} | {deploy_date} |
| Android | 📋 Planned | - | - |
```

### 4. Technical Status Section
```markdown
## Technical Status

### Architecture
- **Backend**: {backend_status}
- **Database**: {database_status}
- **API**: {api_status}
- **Authentication**: {auth_status}
- **Deployment**: {deployment_status}

### Quality Metrics
- **Test Coverage**: {test_coverage}%
- **Build Status**: {build_status}
- **Performance Score**: {performance_score}
- **Security Scan**: {security_status}

### Technical Debt
- {technical_debt_item_1}
- {technical_debt_item_2}
```

### 5. Issues and Blockers Section
```markdown
## Current Issues and Blockers

### Critical Issues
- **Issue**: {critical_issue_description}
  - **Impact**: {impact_description}
  - **Status**: {resolution_status}
  - **ETA**: {estimated_resolution}

### Known Issues
- {known_issue_1} - {status}
- {known_issue_2} - {status}

### Dependencies and Blockers
- {blocker_1} - Waiting for: {dependency}
- {blocker_2} - Blocked by: {blocking_factor}
```

### 6. Recent Activity Section
```markdown
## Recent Activity (Last 7 Days)

### Completed
- {recent_completion_1}
- {recent_completion_2}

### Started
- {recently_started_1}
- {recently_started_2}

### Decisions Made
- {recent_decision_1}
- {recent_decision_2}
```

### 7. Next Steps Section
```markdown
## Immediate Next Steps (Next 7 Days)

### Priority 1 (Critical)
- [ ] {critical_next_step_1}
- [ ] {critical_next_step_2}

### Priority 2 (Important)
- [ ] {important_next_step_1}
- [ ] {important_next_step_2}

### Priority 3 (Nice to Have)
- [ ] {nice_to_have_1}
- [ ] {nice_to_have_2}

## Upcoming Milestones

| Milestone | Target Date | Status | Dependencies |
|-----------|-------------|--------|--------------|
| {milestone_1} | {date} | {status} | {dependencies} |
| {milestone_2} | {date} | {status} | {dependencies} |
```

## Update Guidelines

### Frequency
- Update at least weekly or after significant changes
- Update immediately after milestone completions
- Update when blockers are resolved or new ones identified
- Update when project scope or timeline changes

### Content Standards
- Use specific, measurable progress indicators
- Include actual dates and concrete deliverables
- Maintain consistent formatting and structure
- Keep language clear and factual
- Include context for decisions and changes

### Stakeholder Communication
- Highlight changes since last update
- Call out risks and mitigation strategies
- Provide realistic timelines and expectations
- Include contact information for questions
- Link to relevant detailed documentation

## Output Requirements
- Update existing PROJECT_STATUS.md file
- Maintain consistent formatting and structure
- Include timestamp of update
- Preserve historical milestone information
- Ensure all links and references are current
- Generate summary of changes made
```

## Validation Checklist
- [ ] All sections are present and current
- [ ] Progress percentages are accurate
- [ ] Dates and timelines are realistic
- [ ] Issues and blockers are clearly documented
- [ ] Next steps are specific and actionable
- [ ] Links and references work correctly