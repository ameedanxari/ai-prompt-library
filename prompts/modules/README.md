# Modules

## Purpose
Reusable prompt modules organized by category for composing comprehensive specifications and implementations.

## Instructions
1. Browse the available module categories below to find relevant modules for your project
2. Include modules using the module reference syntax in your prompts
3. Combine multiple modules to build comprehensive feature sets
4. Pass parameters to modules for customization

## Examples
```markdown
## Example: Including Asset Management Modules
#[[module:asset-management/asset-scanner.md]]
#[[module:asset-management/provenance-tracker.md]]

## Example: Combining Feature and Testing Modules
#[[module:feature-patterns/auth-oauth.md|provider=google]]
#[[module:testing/centralized-mock-data.md]]
#[[module:cross-platform/shared-contracts.md]]

## Example: Design System First
#[[module:design-system/token-architecture.md]]
#[[module:design-system/component-system.md]]
#[[module:design-system/screen-fidelity-audit.md]]

## Example: Technology Stack Selection
#[[module:technology-stacks/web-react.md|version=18]]
#[[module:technology-stacks/cloud-aws.md|region=us-east-1]]
```

## Templates

## Available Module Categories

### Asset Management
[asset-management/README.md](./asset-management/README.md)
- Asset scanning and categorization
- File organization and provenance tracking
- Asset validation and mapping

### Best Practices
[best-practices/README.md](./best-practices/README.md)
- Production-ready defaults
- Security guidelines
- Performance optimization

### Cross-Platform
[cross-platform/README.md](./cross-platform/README.md)
- Platform parity management
- Shared contracts and APIs
- Cross-platform validation

### Design System
[design-system/README.md](./design-system/README.md)
- Token architecture and naming
- Component catalog and state variants
- Screen fidelity mapping against mockups

### Feature Patterns
[feature-patterns/README.md](./feature-patterns/README.md)
- Authentication and authorization
- Data management patterns
- UI component templates

### Technology Stacks
[technology-stacks/README.md](./technology-stacks/README.md)
- Web development (React, Next.js)
- Mobile development (React Native)
- Cloud platforms (AWS, GCP, Vercel)

### Testing
[testing/README.md](./testing/README.md)
- Mock data generation
- Fake backend services
- Testing strategy modules

## Usage
Modules are included using the module reference syntax:
```markdown
#[[module:asset-management/asset-scanner.md]]
#[[module:feature-patterns/auth-oauth.md|provider={{auth_provider}}]]
#[[module:technology-stacks/web-react.md|version={{react_version}}]]
```

## Module Composition
Modules can be combined to build comprehensive feature sets:
```markdown
<!-- Authentication feature -->
#[[module:feature-patterns/auth-oauth.md]]
#[[module:testing/centralized-mock-data.md]]
#[[module:cross-platform/shared-contracts.md]]
```
