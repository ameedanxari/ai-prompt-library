# Comprehensive Documentation Maintenance Template

## Purpose
Maintain all required project documentation files to ensure complete project context, status tracking, and seamless handoffs between AI agents and team members.

## Instructions
Use this template to systematically maintain all project documentation files including PROJECT_STATUS.md, NEXT_STEPS.md, ARCHITECTURE_DECISIONS.md, COMPLETED_FEATURES.md, KNOWN_ISSUES.md, and DEVELOPMENT_LOG.md. Update documentation daily for immediate actions, weekly for issues and progress, and after major changes for architecture and features. Ensure all files are consistent, cross-referenced properly, and provide complete context for new team members or AI agents. Follow the maintenance schedule and quality standards to keep documentation current and actionable.

## Examples

### Daily Documentation Update
```markdown
# NEXT_STEPS.md Update Example

# Next Steps: Task Management App

**Last Updated**: 2024-02-08
**Current Phase**: Feature Development
**Priority Level**: High

## Immediate Actions (Next 1-3 Days)

### Critical Priority
- [ ] Fix authentication token expiration bug
  - **Why**: Users being logged out unexpectedly
  - **Owner**: Backend Team
  - **Dependencies**: Database migration for token storage
  - **Success Criteria**: No unexpected logouts in 24-hour test period

### High Priority
- [ ] Implement offline sync conflict resolution
  - **Impact**: Users losing data when working offline
  - **Effort**: 2-3 days development + testing
  - **Resources Needed**: Mobile development environment access

## Context for New AI Agents
Currently in feature development phase focusing on offline functionality. 
Authentication system needs immediate attention due to user-reported issues.
```

### Architecture Decision Documentation
```markdown
# ARCHITECTURE_DECISIONS.md Example

### ADR-003: Database Choice for Offline Storage
**Date**: 2024-02-01
**Status**: Accepted
**Deciders**: Development Team, Technical Lead

#### Context
Need to store user data locally for offline functionality while maintaining 
sync capabilities when online.

#### Decision
Use SQLite with Room persistence library for Android and Core Data for iOS, 
with a unified TypeScript interface layer.

#### Consequences
**Positive**: Native performance, reliable offline storage, platform optimization
**Negative**: Platform-specific implementation complexity, sync logic complexity

#### Alternatives Considered
- **Realm Database**: Cross-platform but licensing concerns
- **AsyncStorage**: Too limited for complex data relationships

#### Implementation Notes
- Implement migration scripts for schema changes
- Use foreign key constraints for data integrity
- Implement automatic cleanup for old data

#### Review Date
2024-05-01 (after 3 months of production use)
```

### Feature Completion Tracking
```markdown
# COMPLETED_FEATURES.md Example

## Recently Completed (Last 30 Days)
- **Offline Task Creation** - Completed 2024-02-05
  - **Description**: Users can create tasks without internet connection
  - **Impact**: 40% increase in user engagement during commutes
  - **Testing**: 100+ offline scenarios tested, 95% test coverage
  - **Deployment**: Rolled out to 25% of users, monitoring metrics

### Offline Task Creation
**Completed**: 2024-02-05
**Version**: v2.1.0
**Platforms**: iOS, Android, Web

#### Implementation
- **Architecture**: Event sourcing with local SQLite storage
- **Technologies**: SQLite, Room (Android), Core Data (iOS)
- **Database Changes**: Added offline_operations table
- **API Changes**: New sync endpoints for conflict resolution

#### Performance
- **Metrics**: <100ms task creation time offline
- **Benchmarks**: Handles 10,000+ offline operations
- **Optimizations**: Batch sync operations, intelligent conflict resolution
```

## Context Requirements
- Current project state and recent changes
- All existing documentation files and their status
- Recent development activities and decisions
- Known issues and upcoming work
- Team structure and responsibilities

## Prompt Template

```
You are responsible for maintaining comprehensive project documentation across all required files. Ensure all documentation is current, accurate, and provides complete context for project understanding and continuation.

## Current Context
- **Project**: {project_name}
- **Phase**: {current_phase}
- **Last Documentation Update**: {last_update_date}
- **Recent Changes**: {recent_changes_summary}

## Required Documentation Files

### 1. NEXT_STEPS.md Maintenance
```markdown
# Next Steps: {Project Name}

**Last Updated**: {current_date}
**Current Phase**: {current_phase}
**Priority Level**: {current_priority}

## Immediate Actions (Next 1-3 Days)

### Critical Priority
- [ ] {critical_action_1}
  - **Why**: {reason_for_urgency}
  - **Owner**: {responsible_party}
  - **Dependencies**: {what_needs_to_be_done_first}
  - **Success Criteria**: {how_to_know_its_complete}

### High Priority
- [ ] {high_priority_action_1}
  - **Impact**: {business_or_technical_impact}
  - **Effort**: {estimated_time_or_complexity}
  - **Resources Needed**: {tools_people_or_access_required}

## Short Term (Next 1-2 Weeks)

### Development Tasks
- [ ] {development_task_1}
- [ ] {development_task_2}

### Testing and Quality
- [ ] {testing_task_1}
- [ ] {quality_task_1}

### Documentation and Communication
- [ ] {documentation_task_1}
- [ ] {communication_task_1}

## Medium Term (Next Month)

### Feature Development
- [ ] {feature_task_1}
- [ ] {feature_task_2}

### Infrastructure and Operations
- [ ] {infrastructure_task_1}
- [ ] {operations_task_1}

## Blocked Items
- [ ] {blocked_item_1}
  - **Blocker**: {what_is_blocking_progress}
  - **Resolution**: {how_to_unblock}
  - **Owner**: {who_can_resolve_blocker}

## Context for New AI Agents
{Brief explanation of current situation and what new agents need to know}
```

### 2. ARCHITECTURE_DECISIONS.md Maintenance
```markdown
# Architecture Decisions: {Project Name}

**Project**: {project_name}
**Last Updated**: {current_date}

## Decision Log

### ADR-{number}: {Decision Title}
**Date**: {decision_date}
**Status**: {proposed_accepted_deprecated_superseded}
**Deciders**: {who_made_the_decision}

#### Context
{Describe the forces at play, including technological, political, social, and project local}

#### Decision
{Describe our response to these forces}

#### Consequences
{Describe the resulting context, after applying the decision}

#### Alternatives Considered
- **Option 1**: {alternative_option_1}
  - **Pros**: {advantages}
  - **Cons**: {disadvantages}
- **Option 2**: {alternative_option_2}
  - **Pros**: {advantages}
  - **Cons**: {disadvantages}

#### Implementation Notes
{Any specific implementation details or considerations}

#### Review Date
{When this decision should be reviewed or reconsidered}
```

### 3. COMPLETED_FEATURES.md Maintenance
```markdown
# Completed Features: {Project Name}

**Last Updated**: {current_date}
**Total Features**: {total_count}
**Completion Rate**: {completion_percentage}%

## Feature Status Overview

### Core Features ✅
| Feature | Completion Date | Version | Platform | Notes |
|---------|----------------|---------|----------|-------|
| {feature_1} | {completion_date} | v{version} | {platform} | {notes} |
| {feature_2} | {completion_date} | v{version} | {platform} | {notes} |

### Secondary Features ✅
| Feature | Completion Date | Version | Platform | Notes |
|---------|----------------|---------|----------|-------|
| {feature_1} | {completion_date} | v{version} | {platform} | {notes} |

### Recently Completed (Last 30 Days)
- **{recent_feature_1}** - Completed {date}
  - **Description**: {feature_description}
  - **Impact**: {user_or_business_impact}
  - **Testing**: {testing_approach_used}
  - **Deployment**: {deployment_details}

## Feature Details

### {Feature Name}
**Completed**: {completion_date}
**Version**: v{version}
**Platforms**: {supported_platforms}

#### Description
{Detailed description of what the feature does}

#### Implementation
- **Architecture**: {architectural_approach}
- **Technologies**: {technologies_used}
- **Database Changes**: {database_modifications}
- **API Changes**: {api_modifications}

#### Testing
- **Unit Tests**: {unit_test_coverage}
- **Integration Tests**: {integration_test_coverage}
- **User Testing**: {user_testing_results}

#### Performance
- **Metrics**: {performance_metrics}
- **Benchmarks**: {benchmark_results}
- **Optimizations**: {optimizations_applied}

#### Documentation
- **User Guide**: {link_to_user_documentation}
- **API Docs**: {link_to_api_documentation}
- **Technical Docs**: {link_to_technical_documentation}
```

### 4. KNOWN_ISSUES.md Maintenance
```markdown
# Known Issues: {Project Name}

**Last Updated**: {current_date}
**Total Issues**: {total_count}
**Critical Issues**: {critical_count}

## Issue Categories

### Critical Issues 🚨
| Issue | Impact | Workaround | ETA | Owner |
|-------|--------|------------|-----|-------|
| {critical_issue_1} | {impact_description} | {workaround_if_any} | {estimated_fix_date} | {responsible_person} |

### High Priority Issues ⚠️
| Issue | Impact | Workaround | ETA | Owner |
|-------|--------|------------|-----|-------|
| {high_issue_1} | {impact_description} | {workaround_if_any} | {estimated_fix_date} | {responsible_person} |

### Medium Priority Issues ℹ️
| Issue | Impact | Workaround | ETA | Owner |
|-------|--------|------------|-----|-------|
| {medium_issue_1} | {impact_description} | {workaround_if_any} | {estimated_fix_date} | {responsible_person} |

## Detailed Issue Descriptions

### {Issue Title}
**ID**: {issue_id}
**Severity**: {critical_high_medium_low}
**Status**: {open_in_progress_blocked}
**Reported**: {report_date}
**Reporter**: {reporter_name}

#### Description
{Detailed description of the issue}

#### Steps to Reproduce
1. {step_1}
2. {step_2}
3. {step_3}

#### Expected Behavior
{What should happen}

#### Actual Behavior
{What actually happens}

#### Environment
- **Platform**: {platform_details}
- **Version**: {version_information}
- **Browser/OS**: {browser_or_os_details}

#### Impact Assessment
- **Users Affected**: {number_or_percentage_of_users}
- **Business Impact**: {business_impact_description}
- **Technical Impact**: {technical_impact_description}

#### Workaround
{Temporary solution if available}

#### Investigation Notes
{Notes from investigation and debugging}

#### Resolution Plan
{Plan for fixing the issue}
```

### 5. DEVELOPMENT_LOG.md Maintenance
```markdown
# Development Log: {Project Name}

**Last Updated**: {current_date}

## Recent Development Activities

### {Current Date}
- **Development Activities**: {activities_completed}
- **Technical Decisions Made**: {decisions_and_rationale}
- **Problems Solved**: {problems_and_solutions}
- **Architecture Changes**: {architectural_updates}
- **Performance Work**: {performance_improvements}
- **Dependencies**: {dependency_updates}
- **Lessons Learned**: {insights_gained}

### {Previous Date}
- **Development Activities**: {previous_activities}
- **Technical Decisions Made**: {previous_decisions}
- **Problems Solved**: {previous_problems}

## Technical Decision Log

### Architecture Changes
- **Decision**: {architectural_choice}
  - **Context**: {decision_context}
  - **Rationale**: {reasoning}
  - **Alternatives Considered**: {other_options}
  - **Impact**: {expected_impact}

### Performance Work
- **Optimization**: {performance_area}
  - **Before**: {baseline_metrics}
  - **After**: {improved_metrics}
  - **Method**: {optimization_technique}

## Dependencies
- **Dependency**: {dependency_name}
  - **Version**: {old_version} → {new_version}
  - **Reason**: {update_reason}
  - **Impact**: {change_impact}

## Lessons Learned
- **Lesson**: {insight_gained}
  - **Context**: {situation_context}
  - **Application**: {how_to_apply}
```

### 6. Quick-Start Guide for New AI Agents
```markdown
# Quick-Start Guide for AI Agents

**Project**: {project_name}
**Last Updated**: {current_date}

## Project Orientation (5 Minutes)

### What This Project Does
{Brief description of project purpose and goals}

### Current Status
- **Phase**: {current_phase}
- **Progress**: {completion_percentage}%
- **Next Milestone**: {next_milestone}

### Key Files to Read First
1. **README.md** - Project overview and setup
2. **PROJECT_STATUS.md** - Current state and progress
3. **NEXT_STEPS.md** - Immediate actions needed
4. **AGENTS.md** - Detailed AI agent instructions

## Getting Started (15 Minutes)

### Environment Setup
```bash
# Clone and setup commands
{setup_commands}
```

### Key Commands
```bash
# Build
{build_command}

# Test
{test_command}

# Run locally
{run_command}
```

### Project Structure
```
{project_structure_overview}
```

## Understanding the Codebase (30 Minutes)

### Architecture Overview
{Brief architecture description}

### Key Components
- **{component_1}**: {description}
- **{component_2}**: {description}

### Important Patterns
- **{pattern_1}**: {usage_description}
- **{pattern_2}**: {usage_description}

## Common Tasks

### Adding a New Feature
1. {step_1}
2. {step_2}
3. {step_3}

### Fixing a Bug
1. {step_1}
2. {step_2}
3. {step_3}

### Running Tests
{testing_instructions}

### Deploying Changes
{deployment_instructions}

## Getting Help
- **Documentation**: {documentation_links}
- **Code Examples**: {example_locations}
- **Common Issues**: See KNOWN_ISSUES.md

## Quick-Start Guide
This guide provides Project Orientation for new team members and AI agents to quickly understand the project context and get started with development tasks.
```

## Update Guidelines

### Maintenance Schedule
- **Daily**: Update NEXT_STEPS.md and PROJECT_STATUS.md
- **Weekly**: Review and update KNOWN_ISSUES.md
- **After Major Changes**: Update ARCHITECTURE_DECISIONS.md and COMPLETED_FEATURES.md
- **Monthly**: Comprehensive review of all documentation

### Quality Standards
- Keep all information current and accurate
- Use consistent formatting across all files
- Include specific dates and version numbers
- Provide clear, actionable information
- Maintain links and cross-references

### Integration Requirements
- Ensure all files reference each other appropriately
- Maintain consistency in terminology and naming
- Keep version information synchronized
- Update all relevant files when making changes
- Validate that information doesn't contradict between files

## Output Requirements
- Update all specified documentation files
- Maintain consistent formatting and structure
- Include timestamps and version information
- Ensure all links and references are current
- Generate summary of changes made across all files
- Validate cross-file consistency and accuracy
```

## Validation Checklist
- [ ] All required documentation files are present and current
- [ ] Information is consistent across all files
- [ ] Dates, versions, and status information are accurate
- [ ] Links and cross-references work correctly
- [ ] Content is organized logically and accessibly
- [ ] Files provide complete context for project understanding