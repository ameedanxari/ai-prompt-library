# Documentation Updates Template

## Purpose
Provide systematic prompts for maintaining and updating project documentation to ensure it remains current, accurate, and useful for all stakeholders.

## Instructions
Use this template to systematically maintain and update project documentation to ensure it remains current, accurate, and useful for all stakeholders.

1. **Assess Current State**: Review existing documentation and identify outdated or missing information
2. **Gather Recent Changes**: Collect information about new features, bug fixes, and system changes
3. **Update Core Documentation**: Refresh README, API docs, user guides, and technical documentation
4. **Verify Accuracy**: Test all code examples, links, and procedures
5. **Maintain Consistency**: Ensure consistent formatting, style, and organization across all docs

## Examples

### Example README.md Update
```markdown
# Project Name

## Overview
Brief description of what the project does and its main value proposition.

## Features
- ✅ User authentication and authorization
- ✅ Real-time data synchronization
- ✅ Mobile-responsive design
- 🚧 Advanced analytics dashboard (in progress)
- 📋 Offline mode support (planned)

## Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL 14+
- Redis 6+

### Installation
```bash
# Clone the repository
git clone https://github.com/username/project-name.git
cd project-name

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Run database migrations
npm run migrate

# Start the development server
npm run dev
```

### Basic Usage
```javascript
import { ProjectAPI } from 'project-name';

const api = new ProjectAPI({
  apiKey: 'your-api-key',
  baseURL: 'https://api.example.com'
});

// Create a new resource
const result = await api.resources.create({
  name: 'Example Resource',
  type: 'document'
});

console.log('Created:', result.id);
```

## Configuration
Key environment variables:
- `DATABASE_URL`: PostgreSQL connection string
- `REDIS_URL`: Redis connection string  
- `JWT_SECRET`: Secret key for JWT tokens
- `API_RATE_LIMIT`: Requests per minute (default: 100)
```

### Example API Documentation Update
```markdown
## Authentication API

### POST /auth/login
Authenticate a user and return access tokens.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response (200 OK):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_in": 3600,
  "user": {
    "id": "123",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

**Error Responses:**
- `400 Bad Request`: Invalid email or password format
- `401 Unauthorized`: Invalid credentials
- `429 Too Many Requests`: Rate limit exceeded

**Example Usage:**
```javascript
const response = await fetch('/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'securepassword123'
  })
});

const data = await response.json();
if (response.ok) {
  localStorage.setItem('access_token', data.access_token);
} else {
  console.error('Login failed:', data.message);
}
```
```

### Example CHANGELOG.md Update
```markdown
# Changelog

All notable changes to this project will be documented in this file.

## [2.1.0] - 2024-01-15

### Added
- Real-time notifications system
- Advanced search with filters
- Export functionality for reports
- Dark mode theme support

### Changed
- Improved API response times by 40%
- Updated user interface with modern design
- Enhanced mobile responsiveness

### Fixed
- Fixed memory leak in WebSocket connections
- Resolved timezone issues in date displays
- Fixed pagination bug in user list

### Security
- Updated all dependencies to latest versions
- Implemented additional rate limiting
- Enhanced input validation and sanitization

## [2.0.1] - 2024-01-01

### Fixed
- Critical security vulnerability in authentication
- Database connection pool exhaustion
- Email notification delivery issues

### Changed
- Improved error messages for better user experience
```

## Context Requirements
- Current project state and recent changes
- Existing documentation structure
- Completed features and implementations
- Known issues and technical decisions
- User feedback and common questions

## Prompt Template

```
You are responsible for updating project documentation to reflect current state and recent changes. Ensure all documentation remains accurate, comprehensive, and useful.

## Current Context
- **Last Update**: {last_update_date}
- **Recent Changes**: {recent_changes_summary}
- **New Features**: {new_features_list}
- **Fixed Issues**: {resolved_issues_list}

## Documentation Update Tasks

### 1. README.md Updates
Review and update:
- Project description and current capabilities
- Installation and setup instructions
- Usage examples and getting started guide
- Feature list and current status
- Known limitations and requirements
- Contributing guidelines and development setup

### 2. API Documentation
Update if applicable:
- Endpoint documentation with current parameters
- Request/response examples
- Authentication requirements
- Rate limiting and usage guidelines
- Error codes and handling
- SDK or client library information

### 3. User Guides and Tutorials
Refresh:
- Step-by-step tutorials for common tasks
- Best practices and recommended workflows
- Troubleshooting guides for common issues
- FAQ section with recent questions
- Screenshots and examples (if applicable)

### 4. Technical Documentation
Maintain:
- Architecture diagrams and system overview
- Database schema and data models
- Configuration options and environment variables
- Deployment procedures and requirements
- Performance considerations and optimization tips

### 5. Change Documentation
Update:
- CHANGELOG.md with recent changes
- Migration guides for breaking changes
- Deprecation notices and timelines
- Version compatibility information

## Update Guidelines

### Content Quality Standards
- Use clear, concise language
- Provide specific examples and code snippets
- Include relevant screenshots or diagrams
- Ensure all links are functional and current
- Maintain consistent formatting and style

### Accuracy Verification
- Test all code examples and procedures
- Verify installation and setup instructions
- Confirm API endpoints and parameters
- Validate configuration examples
- Check external links and references

### User Experience Focus
- Organize information logically
- Use appropriate headings and navigation
- Include search-friendly keywords
- Provide multiple learning paths (quick start, detailed guides)
- Consider different user skill levels

## Output Requirements
- Update existing files rather than replacing them entirely
- Preserve useful historical information
- Add timestamps for significant updates
- Include version information where relevant
- Maintain consistent formatting across all documentation
- Create pull request or commit with clear description of changes
```

## Validation Checklist
- [ ] All documentation files are current and accurate
- [ ] Code examples have been tested and work correctly
- [ ] Links and references are functional
- [ ] Information is organized logically
- [ ] Language is clear and accessible
- [ ] Changes are properly documented and versioned

## Documentation Maintenance Features
This template provides comprehensive documentation maintenance including:
- **README.md Updates**: Project description and setup instructions
- **API Documentation**: Endpoint documentation and examples
- **User Guides and Tutorials**: Step-by-step user guidance
- **Technical Documentation**: Architecture and system documentation
- **Change Documentation**: CHANGELOG.md and migration guides
- **Enhancement**: Continuous improvement of documentation quality
- **improvement**: Ongoing enhancement and optimization of documentation