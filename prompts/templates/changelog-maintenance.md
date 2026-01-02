# Changelog Maintenance Template

## Purpose
Maintain comprehensive and user-friendly changelogs that document all significant changes, improvements, and fixes in a consistent and accessible format.

## Context Requirements
- Recent commits and pull requests
- Version information and release schedule
- Bug fixes and feature implementations
- Breaking changes and deprecations
- User-facing changes and improvements

## Prompt Template

```
You are responsible for maintaining the project changelog to document all significant changes in a clear, organized, and user-friendly format.

## Current Context
- **Current Version**: {current_version}
- **Last Changelog Update**: {last_update_date}
- **Pending Changes**: {pending_changes_summary}
- **Next Release**: {next_release_version}

## Changelog Maintenance Tasks

### 1. Review Recent Changes
Analyze recent activity:
- Git commits since last changelog update
- Merged pull requests and their descriptions
- Closed issues and bug reports
- New features and enhancements
- Performance improvements and optimizations

### 2. Categorize Changes
Organize changes into standard categories:

#### Added
- New features and capabilities
- New API endpoints or methods
- New configuration options
- New documentation or guides

#### Changed
- Modifications to existing functionality
- Updated dependencies or requirements
- Improved performance or efficiency
- Enhanced user interface or experience

#### Deprecated
- Features marked for future removal
- API methods or endpoints being phased out
- Configuration options being replaced
- Timeline for deprecation

#### Removed
- Deleted features or capabilities
- Removed API endpoints or methods
- Eliminated configuration options
- Cleaned up deprecated functionality

#### Fixed
- Bug fixes and error corrections
- Security vulnerability patches
- Performance issue resolutions
- Compatibility fixes

#### Security
- Security-related changes and improvements
- Vulnerability fixes and patches
- Authentication and authorization updates
- Data protection enhancements

### 3. Format Changelog Entry
Use consistent formatting:

```markdown
## [Version] - YYYY-MM-DD

### Added
- New feature description with brief explanation
- Another addition with context about why it's useful

### Changed
- Description of what changed and why
- Impact on existing users or workflows

### Deprecated
- What's being deprecated and when it will be removed
- Migration path or alternative recommendations

### Removed
- What was removed and why
- Any breaking changes and how to adapt

### Fixed
- Bug fix description with context
- Issue reference numbers if applicable

### Security
- Security improvement description
- CVE numbers if applicable
```

### 4. Write User-Friendly Descriptions
For each change:
- Use clear, non-technical language when possible
- Explain the benefit or impact to users
- Include examples or usage information
- Reference relevant documentation
- Mention any required actions from users

### 5. Maintain Changelog Standards
Ensure consistency:
- Follow semantic versioning principles
- Use consistent date formatting (YYYY-MM-DD)
- Maintain reverse chronological order (newest first)
- Include links to relevant issues or pull requests
- Keep descriptions concise but informative

## Special Considerations

### Breaking Changes
For breaking changes:
- Clearly mark as breaking changes
- Explain what breaks and why
- Provide migration instructions
- Include code examples showing before/after
- Estimate effort required for migration

### Security Updates
For security-related changes:
- Be specific about what was fixed without revealing exploit details
- Include severity level if applicable
- Recommend immediate update if critical
- Reference security advisories if published

### Dependencies
For dependency updates:
- Mention significant dependency changes
- Note any new requirements or compatibility changes
- Highlight security updates in dependencies
- Document any behavior changes from dependency updates

## Output Requirements
- Update CHANGELOG.md file with new entries
- Maintain consistent formatting throughout
- Ensure all significant changes are documented
- Include appropriate links and references
- Verify dates and version numbers are correct
- Keep unreleased changes in "Unreleased" section until release
```

## Validation Checklist
- [ ] All significant changes since last update are included
- [ ] Changes are categorized appropriately
- [ ] Descriptions are clear and user-friendly
- [ ] Breaking changes are clearly marked and explained
- [ ] Version numbers and dates are accurate
- [ ] Links and references are functional
- [ ] Formatting is consistent with existing entries

## Changelog Maintenance Features
This template supports comprehensive changelog maintenance including:
- **Added**: New features and capabilities tracking
- **Changed**: Modifications to existing functionality
- **Deprecated**: Features marked for future removal
- **Removed**: Deleted features and capabilities
- **Fixed**: Bug fixes and error corrections
- **Security**: Security-related changes and improvements
- **semantic versioning**: Following semantic versioning principles
- **migration**: Migration guides and instructions
- **version**: Version management and tracking

## Instructions

### How to Use This Changelog Maintenance Template

1. **Prepare Context Information**
   - Gather current version number and last changelog update date
   - Collect list of recent commits, pull requests, and closed issues
   - Identify upcoming release version and target date
   - Review any pending changes that need documentation

2. **Apply the Template**
   - Replace placeholder variables with actual project information
   - Use the prompt template to generate changelog entries
   - Follow the categorization guidelines (Added, Changed, Deprecated, etc.)
   - Ensure all significant changes are captured and documented

3. **Review and Refine**
   - Check that descriptions are clear and user-friendly
   - Verify that breaking changes are properly highlighted
   - Ensure security updates are appropriately documented
   - Validate that all links and references are functional

4. **Maintain Consistency**
   - Follow the established formatting standards
   - Use consistent date formatting (YYYY-MM-DD)
   - Maintain reverse chronological order
   - Keep the "Unreleased" section for pending changes

5. **Validate and Publish**
   - Use the validation checklist to ensure completeness
   - Review for accuracy and clarity
   - Update the CHANGELOG.md file
   - Coordinate with release process and version tagging

## Examples

### Complete Changelog Entry Example

Here's a comprehensive example of a well-formatted changelog entry:

```markdown
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Dark mode support for improved user experience in low-light environments
- Bulk operations for task management (select multiple tasks for batch actions)
- Export functionality for tasks in CSV and JSON formats

### Changed
- Improved performance of task list rendering by 40% through virtualization
- Updated user interface with more intuitive navigation and clearer visual hierarchy
- Enhanced search functionality with fuzzy matching and filter combinations

## [2.1.0] - 2024-01-15

### Added
- Real-time collaboration features allowing multiple users to work on shared task lists
- Push notifications for task reminders and team updates (mobile app only)
- Integration with popular calendar applications (Google Calendar, Outlook, Apple Calendar)
- Advanced filtering options including date ranges, priority levels, and custom tags
- Offline mode with automatic synchronization when connection is restored

### Changed
- **BREAKING**: API endpoint structure updated for better REST compliance
  - Old: `GET /api/tasks/user/{id}` 
  - New: `GET /api/users/{id}/tasks`
  - Migration: Update all API calls to use new endpoint structure
- Improved mobile app performance with 50% faster startup time
- Enhanced accessibility with better screen reader support and keyboard navigation
- Updated design system with consistent spacing and typography across all platforms

### Deprecated
- Legacy task import format (CSV v1) will be removed in version 3.0.0
  - Please migrate to CSV v2 format using the conversion tool in Settings
  - Migration guide: https://docs.example.com/migration/csv-v2
- Old webhook format for integrations (will be removed in v2.3.0)
  - New webhook format provides better error handling and retry logic

### Fixed
- Resolved issue where completed tasks would occasionally reappear as incomplete
- Fixed memory leak in real-time sync that could cause app slowdown over time
- Corrected timezone handling for users in regions with daylight saving time changes
- Fixed accessibility issue where task priority colors were not distinguishable for colorblind users

### Security
- Updated authentication system to use OAuth 2.1 with PKCE for enhanced security
- Fixed potential XSS vulnerability in task description rendering (CVE-2024-0001)
- Implemented rate limiting on API endpoints to prevent abuse
- Enhanced data encryption for task content stored locally on mobile devices

## [2.0.1] - 2024-01-02

### Fixed
- Critical bug fix for data synchronization that could cause task loss
- Resolved login issues for users with special characters in passwords
- Fixed crash on iOS devices when creating tasks with very long descriptions

### Security
- Emergency patch for authentication bypass vulnerability (CVE-2023-9999)
- **Action Required**: All users must update immediately and re-authenticate

## [2.0.0] - 2023-12-15

### Added
- Complete redesign with modern, intuitive user interface
- Team collaboration features with shared workspaces
- Advanced task organization with projects, labels, and custom fields
- Mobile applications for iOS and Android with full feature parity
- API v2 with comprehensive documentation and SDKs

### Changed
- **BREAKING**: Minimum supported browser versions updated
  - Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **BREAKING**: Database schema migration required
  - Automatic migration will run on first startup
  - Backup your data before upgrading
- Completely rewritten backend for improved performance and scalability

### Removed
- **BREAKING**: Legacy API v1 endpoints (deprecated since v1.5.0)
- **BREAKING**: Internet Explorer support discontinued
- Old task import wizard (replaced with drag-and-drop interface)

### Migration Guide
Upgrading from v1.x to v2.0 requires several steps:

1. **Backup Your Data**
   ```bash
   # Create backup before upgrading
   npm run backup-data
   ```

2. **Update Dependencies**
   ```bash
   # Update to latest version
   npm install task-manager@2.0.0
   ```

3. **Run Migration**
   ```bash
   # Database migration will run automatically
   npm run migrate
   ```

4. **Update API Calls**
   - Replace all v1 API endpoints with v2 equivalents
   - Update authentication to use new OAuth flow
   - See API migration guide: https://docs.example.com/api/v2/migration

5. **Test Integration**
   - Verify all integrations work with new API
   - Test user workflows in staging environment
   - Update any custom scripts or automations
```

### Usage Scenarios

#### Scenario 1: Regular Release Update
```markdown
# Weekly Release Changelog Update
Context: Regular sprint release with bug fixes and minor features

## Recent Changes to Document:
- 3 bug fixes from user reports
- 1 new feature (task templates)
- 2 performance improvements
- 1 security patch

## Generated Entry:
## [1.4.2] - 2024-01-22

### Added
- Task templates for common workflows (meeting notes, project planning, daily standup)

### Changed
- Improved task list loading performance by 25% through optimized database queries
- Enhanced mobile app responsiveness on older devices

### Fixed
- Resolved issue where task due dates would reset when editing other task properties
- Fixed notification timing bug that caused reminders to fire at incorrect times
- Corrected display issue with long task titles in mobile list view

### Security
- Updated session handling to prevent potential session fixation attacks
```

#### Scenario 2: Major Release with Breaking Changes
```markdown
# Major Version Release Changelog
Context: Version 3.0 with significant architectural changes

## Breaking Changes to Document:
- New authentication system
- Updated API structure
- Removed deprecated features
- Database schema changes

## Generated Entry:
## [3.0.0] - 2024-02-01

### Added
- Multi-tenant architecture supporting enterprise customers
- Advanced analytics dashboard with custom reporting
- Single Sign-On (SSO) integration with SAML and OIDC providers
- Audit logging for compliance and security monitoring

### Changed
- **BREAKING**: Authentication system completely redesigned
  - Old session-based auth replaced with JWT tokens
  - All users must re-authenticate after upgrade
  - API clients must implement new authentication flow
- **BREAKING**: API response format standardized
  - All responses now include metadata wrapper
  - Error responses follow RFC 7807 Problem Details format
  - See migration guide: https://docs.example.com/v3-migration

### Removed
- **BREAKING**: Legacy user preferences system (deprecated in v2.5.0)
- **BREAKING**: Old webhook format (deprecated in v2.8.0)
- Internet Explorer 11 support (end of life reached)

### Migration Timeline
- **Phase 1** (Feb 1-15): Upgrade available, old API still functional
- **Phase 2** (Feb 16-28): Old API deprecated, warnings issued
- **Phase 3** (Mar 1+): Old API disabled, v3 required

### Migration Support
- Automated migration tool: `npm run migrate-to-v3`
- Migration guide: https://docs.example.com/v3-migration
- Support webinars: Every Tuesday in February
- Priority support for enterprise customers
```

#### Scenario 3: Security Update
```markdown
# Emergency Security Update
Context: Critical security vulnerability discovered and patched

## Security Issue to Document:
- SQL injection vulnerability in search function
- Affects versions 2.1.0 through 2.3.4
- Immediate update required

## Generated Entry:
## [2.3.5] - 2024-01-18

### Security
- **CRITICAL**: Fixed SQL injection vulnerability in task search functionality (CVE-2024-0123)
  - **Severity**: High (CVSS 8.1)
  - **Affected Versions**: 2.1.0 through 2.3.4
  - **Action Required**: Update immediately
  - **Workaround**: Disable search functionality until update is applied
- Enhanced input validation across all user-facing forms
- Implemented additional SQL injection prevention measures

### Fixed
- Resolved related input sanitization issues in task creation and editing
- Fixed potential data exposure in error messages

### Immediate Action Required
All users running versions 2.1.0 through 2.3.4 must update immediately:

```bash
# Update to secure version
npm update task-manager@2.3.5

# Verify installation
npm list task-manager
```

**For Enterprise Customers:**
- Contact support for assisted upgrade scheduling
- Security advisory available at: https://security.example.com/CVE-2024-0123
- Incident response team available 24/7 during upgrade period
```

This comprehensive changelog maintenance approach ensures that all changes are properly documented, users understand the impact of updates, and migration paths are clearly provided for breaking changes.