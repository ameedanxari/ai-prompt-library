# AGENTS.md Generation Template

## Purpose
Generate comprehensive AGENTS.md files that provide clear instructions for future AI interactions with the project, ensuring seamless handoffs and consistent development practices.

## Context Requirements
- Project configuration and technology stack
- Current development stage and completed features
- Established patterns and conventions
- Known issues and technical decisions
- Build and deployment procedures

## Prompt Template

```
You are tasked with generating a comprehensive AGENTS.md file for this project. This file will serve as the primary instruction manual for any AI agent that needs to work on this project in the future.

## Project Context
- **Project Name**: {project_name}
- **Technology Stack**: {technology_stack}
- **Current Stage**: {current_stage}
- **Completion Status**: {completion_percentage}%

## Required Sections

### 1. Project Overview
Write a concise overview that explains:
- What this project does and its primary purpose
- Target platforms and users
- Key business requirements and constraints

### 2. Development Environment Setup
Provide step-by-step instructions for:
- Required tools and dependencies
- Environment configuration
- Database setup (if applicable)
- API keys and configuration files needed

### 3. Architecture and Patterns
Document:
- Overall system architecture
- Key design patterns used
- Important architectural decisions and rationale
- Module/component organization

### 4. Development Workflow
Specify:
- Git workflow and branching strategy
- Code review process
- Testing requirements and procedures
- Build and deployment processes

### 5. AI Agent Guidelines
Include specific instructions for:
- How to approach new feature development
- Testing requirements and standards
- Code style and formatting preferences
- Documentation update procedures
- Quality gates and acceptance criteria

### 6. Known Issues and Limitations
Document:
- Current technical debt
- Known bugs or limitations
- Workarounds for common problems
- Areas requiring special attention

### 7. Useful Commands
List frequently used commands for:
- Building the project
- Running tests
- Starting development servers
- Deployment procedures
- Database migrations (if applicable)

### 8. Contact and Resources
Provide:
- Links to relevant documentation
- API documentation locations
- Design system or style guide references
- External service documentation

## Output Requirements
- Use clear, actionable language
- Include specific examples where helpful
- Organize information logically with proper headings
- Ensure all instructions are testable and verifiable
- Update existing AGENTS.md if it exists, preserving useful content
```

## Validation Checklist
- [ ] All required sections are present and complete
- [ ] Instructions are specific and actionable
- [ ] Technical details are accurate and current
- [ ] Examples are provided where helpful
- [ ] File is well-organized with clear headings
- [ ] Content is accessible to AI agents without prior context

## Instructions

### How to Use This Template

1. **Gather Project Context**: Collect current project information including technology stack, completion status, and architectural decisions
2. **Fill Template Variables**: Replace all `{variable_name}` placeholders with actual project values
3. **Execute Generation Prompt**: Use the provided prompt template to generate the AGENTS.md content
4. **Validate Output**: Check generated content against the validation checklist
5. **Update Existing File**: If AGENTS.md exists, merge new content while preserving valuable existing information
6. **Test Instructions**: Verify that all provided instructions are accurate and executable

### Template Customization

- **Technology-Specific Sections**: Add sections specific to your technology stack (e.g., React components, database schemas)
- **Project-Specific Workflows**: Include any unique development processes or conventions
- **Integration Instructions**: Add details about external service integrations and API usage
- **Deployment Variations**: Customize deployment instructions for your specific infrastructure

## Examples

### Example 1: Web Application AGENTS.md Generation

```markdown
# Project: TaskFlow - Team Collaboration Platform

## Project Overview
TaskFlow is a real-time team collaboration platform built with React, Node.js, and PostgreSQL. It enables remote teams to manage projects, track tasks, and communicate effectively through integrated chat and video features.

**Target Platforms**: Web (responsive), Mobile PWA
**Primary Users**: Remote teams, project managers, developers
**Key Requirements**: Real-time updates, offline capability, enterprise security

## Development Environment Setup
```bash
# Clone repository
git clone https://github.com/company/taskflow.git
cd taskflow

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database and API keys

# Start development servers
npm run dev:frontend  # Starts React dev server on :3000
npm run dev:backend   # Starts Node.js API server on :8000
```

## Architecture and Patterns
- **Frontend**: React + TypeScript + Zustand for state management
- **Backend**: Node.js + Express + Prisma ORM
- **Database**: PostgreSQL with Redis for caching
- **Real-time**: Socket.io for live updates
- **Authentication**: JWT with refresh tokens

## AI Agent Guidelines
When implementing new features:
1. Follow the established component structure in `/src/components`
2. Add TypeScript interfaces in `/src/types`
3. Write unit tests using Jest and React Testing Library
4. Update API documentation in `/docs/api.md`
5. Ensure responsive design works on mobile devices
```

### Example 2: Mobile App AGENTS.md Generation

```markdown
# Project: FitTracker - Personal Fitness Application

## Project Overview
FitTracker is a React Native mobile application for tracking workouts, nutrition, and fitness goals. It integrates with wearable devices and provides personalized coaching recommendations.

**Target Platforms**: iOS, Android
**Primary Users**: Fitness enthusiasts, personal trainers
**Key Requirements**: Offline sync, wearable integration, data privacy

## Development Environment Setup
```bash
# Install React Native CLI
npm install -g react-native-cli

# Clone and setup
git clone https://github.com/company/fittracker.git
cd fittracker
npm install

# iOS setup
cd ios && pod install && cd ..

# Start Metro bundler
npx react-native start

# Run on device/simulator
npx react-native run-ios     # iOS
npx react-native run-android # Android
```

## AI Agent Guidelines
- Use React Native best practices for cross-platform compatibility
- Test on both iOS and Android devices before submitting
- Follow the established navigation structure using React Navigation
- Implement proper error boundaries for crash prevention
- Ensure all user data is encrypted at rest
```

### Example 3: API Service AGENTS.md Generation

```markdown
# Project: PaymentAPI - Secure Payment Processing Service

## Project Overview
PaymentAPI is a RESTful API service built with Python FastAPI for processing secure payments, managing subscriptions, and handling financial transactions with PCI DSS compliance.

**Target Platforms**: Cloud API (AWS Lambda)
**Primary Users**: E-commerce platforms, SaaS applications
**Key Requirements**: PCI compliance, high availability, audit logging

## Development Environment Setup
```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # Linux/Mac
# venv\Scripts\activate   # Windows

# Install dependencies
pip install -r requirements.txt

# Set up database
alembic upgrade head

# Start development server
uvicorn main:app --reload --port 8000
```

## AI Agent Guidelines
- All payment data must be encrypted and logged for audit
- Follow PCI DSS guidelines for sensitive data handling
- Write comprehensive API tests using pytest
- Update OpenAPI documentation for any endpoint changes
- Ensure proper error handling and status codes
```

## Self-Maintenance Features
This template supports comprehensive self-maintenance capabilities including:
- **AGENTS.md generation**: Complete project documentation for AI agents
- **Documentation updates**: Systematic documentation maintenance
- **Changelog maintenance**: Version tracking with semantic versioning principles
- **Gap identification**: Identifying areas for improvement and enhancement, finding gaps in documentation and processes
- **Versioning**: Migration guidance and version management
- **improvements**: Continuous improvement suggestions and recommendations