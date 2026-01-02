# Testing Modules

## Purpose
Reusable modules for managing test data, mock services, and testing infrastructure across all platforms. These modules ensure consistent, centralized test data management and enable comprehensive integration testing without network dependencies.

## Instructions
Use these modules to establish a single source of truth for mock data across all platforms (web, iOS, Android, desktop). Start with centralized-mock-data.md to organize mock data by API endpoint and status codes, then use mock-consolidation.md to migrate platform-specific mocks to the centralized location. Use mock-validation.md to ensure contract compliance.

## Examples
```markdown
## Example Mock Data Management Workflow

### Input: Scattered Platform Mocks
- web/src/mocks/users.json
- ios/Tests/Mocks/UserMocks.swift
- android/app/src/test/mocks/users.json
- desktop/tests/fixtures/users.json

### Processing Steps
1. **Organize Centrally**: Use centralized-mock-data.md to create unified mock structure
2. **Consolidate Platforms**: Use mock-consolidation.md to migrate all platform mocks
3. **Validate Contracts**: Use mock-validation.md to ensure API contract compliance
4. **Generate Index**: Create mock data index for easy discovery

### Result
mocks/
├── api/
│   └── v1/
│       └── users/
│           ├── GET/
│           │   ├── 200-success.json
│           │   ├── 401-unauthorized.json
│           │   └── 404-not-found.json
│           └── POST/
│               ├── 201-created.json
│               ├── 400-validation-error.json
│               └── 409-conflict.json
├── schemas/
│   └── user-response.schema.json
└── index.json
```

## Available Modules

### Core Mock Data Management
- [centralized-mock-data.md](./centralized-mock-data.md) - Organize mock data by API endpoint and status codes
- [mock-consolidation.md](./mock-consolidation.md) - Migrate platform-specific mocks to centralized location
- [mock-validation.md](./mock-validation.md) - Validate mock data against API contracts

### Fake Backend Generation
- [fake-backend-generator.md](./fake-backend-generator.md) - Generate lightweight fake backend server with spawn scripts, configuration, and test runner integration
- [debug-menu-integration.md](./debug-menu-integration.md) - Debug menu for environment switching across web, iOS, and Android platforms

## Usage Pattern
```markdown
#[[module:testing/centralized-mock-data.md]]
#[[module:testing/mock-consolidation.md|platforms={{target_platforms}}]]
#[[module:testing/mock-validation.md|api_spec={{api_spec_path}}]]
```

## Integration Strategy
Testing modules ensure:
- Single source of truth for all mock data
- Consistent data contracts across platforms
- No duplicate or conflicting mock data
- Easy mock data discovery and maintenance
- Contract compliance validation
