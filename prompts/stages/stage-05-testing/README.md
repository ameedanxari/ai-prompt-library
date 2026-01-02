# Stage 05 - Testing

## Purpose
Define comprehensive testing strategy including unit tests, property-based tests, integration tests, and quality assurance procedures.

## Instructions

### How to Use This Stage

1. **Review Feature Specifications**: Analyze Stage 04 outputs to understand testing requirements
2. **Select Testing Framework**: Choose appropriate testing tools and frameworks for each platform
3. **Define Test Categories**: Establish unit, integration, E2E, and property-based testing strategies
4. **Plan Quality Assurance**: Create QA procedures and acceptance criteria
5. **Set Coverage Targets**: Define code coverage and quality metrics
6. **Create Test Data**: Plan test data management and mock strategies

### Testing Strategy Development

1. **Platform-Agnostic Foundation**: Start with core testing principles and shared strategies
2. **Platform-Specific Adaptations**: Customize testing approaches for web and mobile platforms
3. **Property-Based Testing**: Define property-based tests for critical business logic
4. **Quality Gates**: Establish automated quality checks and manual review processes

## Examples

### Example Testing Strategy

```markdown
# Testing Strategy: Task Management Application

## Core Testing Framework
- **Unit Tests**: Jest + Testing Library (85%+ coverage)
- **Integration Tests**: API contract testing with Pact
- **E2E Tests**: Playwright for critical user journeys
- **Property Tests**: Fast-check for business logic validation

## Quality Gates
- All tests pass in CI/CD pipeline
- Code coverage above 85%
- No high/critical security vulnerabilities
- Performance benchmarks met
- Accessibility compliance validated

## Test Data Strategy
- Factories for consistent test data generation
- Database seeding for integration tests
- Mock external services in development
- Anonymized production data for staging
```

## Inputs
- Feature specifications (Stage 04)
- Architecture design and technology stack
- Quality requirements and compliance needs

## Outputs
- `platform-agnostic.md` - Core testing strategy and framework
- `web.md` - Web-specific testing approaches
- `mobile.md` - Mobile-specific testing strategies
- Property-based testing specifications
- Quality assurance checklists and procedures

## Prerequisites
- Stage 04 (Features) completed
- Quality requirements defined

## Next Stage
Stage 06 - Implementation (Implementation planning and task generation)