# Testing Module

## Purpose

Reusable modules for managing test data, mock services, and testing infrastructure across all platforms. These modules ensure consistent, centralized test data management and enable comprehensive integration testing without network dependencies.

## Instructions

1. **Organize Mock Data**: Use centralized-mock-data.md to organize mock data by API endpoint
2. **Consolidate Platforms**: Use mock-consolidation.md to migrate platform-specific mocks
3. **Validate Contracts**: Use mock-validation.md to ensure API contract compliance
4. **Generate Fake Backend**: Use fake-backend-generator.md to create lightweight test server
5. **Integrate Debug Menu**: Use debug-menu-integration.md for environment switching
6. **Set Up Test Runners**: Configure test automation and CI/CD integration
7. **Monitor Test Coverage**: Track coverage metrics and identify gaps

## Examples

### Example 1: Centralized Mock Data Structure
```json
{
  "mocks": {
    "api": {
      "v1": {
        "users": {
          "GET": {
            "200-success.json": { "users": [...] },
            "401-unauthorized.json": { "error": "Unauthorized" },
            "404-not-found.json": { "error": "Not found" }
          },
          "POST": {
            "201-created.json": { "id": "123", "name": "John" },
            "400-validation-error.json": { "errors": [...] }
          }
        }
      }
    }
  }
}
```

### Example 2: Mock Consolidation
```typescript
// Before: Platform-specific mocks scattered
// web/src/mocks/users.json
// ios/Tests/Mocks/UserMocks.swift
// android/app/src/test/mocks/users.json

// After: Centralized mock data
// mocks/api/v1/users/GET/200-success.json
// All platforms reference the same mock data
const mockData = await loadMock('api/v1/users/GET/200-success.json');
```

### Example 4: Property-Based Testing
```typescript
// Automatically generate test cases
import fc from 'fast-check';

fc.assert(fc.property(
  fc.emailAddress(),
  (email) => {
    const result = validateEmail(email);
    expect(result.isValid).toBe(true);
  }
));

// Test business logic properties
fc.assert(fc.property(
  fc.array(fc.record({ price: fc.float({ min: 0.01, max: 1000 }) })),
  (products) => {
    const cart = new ShoppingCart();
    products.forEach(p => cart.addItem(p));
    
    const expectedTotal = products.reduce((sum, p) => sum + p.price, 0);
    const actualTotal = cart.getTotal();
    
    expect(Math.abs(actualTotal - expectedTotal)).toBeLessThan(0.01);
  }
));
```
```typescript
// Start fake backend server
const server = await startFakeBackend({
  port: 3001,
  mockDataPath: './mocks',
  delay: 100
});

// Use in tests
const response = await fetch('http://localhost:3001/api/v1/users');
const data = await response.json();
```

## Templates

### Example 3: Fake Backend Integration

### Core Mock Data Management
- **centralized-mock-data.md** - Organize mock data by API endpoint and status codes
- **mock-consolidation.md** - Migrate platform-specific mocks to centralized location
- **mock-validation.md** - Validate mock data against API contracts
- **mock-discovery.md** - Mock data indexing and search

### Fake Backend Generation
- **fake-backend-generator.md** - Generate lightweight fake backend server
- **fake-backend-configuration.md** - Configure response delays and behaviors
- **fake-backend-spawn-scripts.md** - Spawn scripts for test runner integration

### Debug and Development Tools
- **debug-menu-integration.md** - Debug menu for environment switching
- **debug-menu-web.md** - Web platform debug menu implementation
- **debug-menu-mobile.md** - Mobile platform debug menu implementation

### Test Infrastructure
- **test-runner-integration.md** - CI/CD and test runner setup
- **test-coverage-tracking.md** - Coverage metrics and reporting
- **test-performance-monitoring.md** - Test execution performance
- **property-based-testing.md** - Automated test case generation and property verification

## Integration

Testing modules ensure:
- Single source of truth for all mock data
- Consistent data contracts across platforms
- No duplicate or conflicting mock data
- Easy mock data discovery and maintenance
- Contract compliance validation
- Automated test infrastructure

## Related Modules
- [Feature Patterns](../feature-patterns/README.md) - Common feature templates
- [Technology Stacks](../technology-stacks/README.md) - Technology-specific implementations
- [Cross-Platform](../cross-platform/README.md) - Cross-platform parity modules
