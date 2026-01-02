# Property-Based Testing Template

## Purpose
Generate property-based tests that validate universal correctness properties across all valid inputs, ensuring comprehensive coverage beyond traditional example-based testing.

## Instructions
Use this template to implement property-based testing for your application. Start by identifying the type of property you need to test: invariants (properties that remain constant), round-trip properties (operations with their inverse), idempotence (operations that can be applied multiple times), metamorphic properties (relationships between operations), or error conditions (proper rejection of invalid inputs). Create smart generators that produce realistic test data within your domain constraints. Configure tests to run at least 100 iterations and tag each property test with the requirements it validates. Integrate property tests into your CI/CD pipeline alongside unit tests.

## Examples

### Basic Property Test Setup
```javascript
// Round-trip property example
test('Property: JSON serialization round-trip preserves data', () => {
  fc.assert(fc.property(
    fc.record({
      id: fc.integer({ min: 1 }),
      name: fc.string({ minLength: 1 }),
      email: fc.emailAddress(),
      createdAt: fc.date()
    }),
    (user) => {
      const serialized = JSON.stringify(user);
      const deserialized = JSON.parse(serialized);
      return deepEqual(deserialized, user);
    }
  ), { numRuns: 100 });
});

// Invariant property example
test('Property: Array map preserves length', () => {
  fc.assert(fc.property(
    fc.array(fc.integer()),
    (arr) => {
      const doubled = arr.map(x => x * 2);
      return doubled.length === arr.length;
    }
  ), { numRuns: 100 });
});
```

### Domain-Specific Generators
```javascript
// User data generator with realistic constraints
const userGenerator = fc.record({
  id: fc.integer({ min: 1, max: 1000000 }),
  email: fc.emailAddress(),
  name: fc.string({ minLength: 1, maxLength: 100 }),
  age: fc.integer({ min: 13, max: 120 }),
  roles: fc.array(fc.constantFrom('user', 'admin', 'moderator'), { minLength: 1 }),
  createdAt: fc.date({ min: new Date('2020-01-01'), max: new Date() }),
});

// API request generator
const apiRequestGenerator = fc.record({
  method: fc.constantFrom('GET', 'POST', 'PUT', 'DELETE'),
  path: fc.string({ minLength: 1 }).map(s => `/${s}`),
  headers: fc.dictionary(fc.string(), fc.string()),
  body: fc.oneof(fc.constant(null), fc.object()),
});

// Edge case string generator
const edgeCaseStringGenerator = fc.oneof(
  fc.constant(''),                    // Empty string
  fc.constant(' '),                   // Single space
  fc.string({ minLength: 1000 }),     // Very long string
  fc.constant('🚀🌟💫'),              // Unicode/emoji
  fc.constant('<script>alert("xss")</script>'), // Potential XSS
);
```

### Property Types Implementation
```javascript
// Idempotence property
test('Property: Array deduplication is idempotent', () => {
  fc.assert(fc.property(
    fc.array(fc.integer()),
    (arr) => {
      const deduped1 = [...new Set(arr)];
      const deduped2 = [...new Set(deduped1)];
      return JSON.stringify(deduped1) === JSON.stringify(deduped2);
    }
  ), { numRuns: 100 });
});

// Error condition property
test('Property: Invalid email addresses are properly rejected', () => {
  fc.assert(fc.property(
    fc.string().filter(s => !isValidEmail(s)),
    (invalidEmail) => {
      expect(() => createUser({ email: invalidEmail }))
        .toThrow('Invalid email format');
    }
  ), { numRuns: 100 });
});

// Metamorphic property
test('Property: Filter reduces or maintains array size', () => {
  fc.assert(fc.property(
    fc.array(fc.integer()),
    fc.func(fc.boolean()),
    (arr, predicate) => {
      const filtered = arr.filter(predicate);
      return filtered.length <= arr.length;
    }
  ), { numRuns: 100 });
});
```

### Design Document Property Mapping
```javascript
// Example mapping from design document
/**
 * Property 1: Template Structure Completeness
 * **Validates: Requirements 1.1, 1.3, 1.5**
 * For any generated template, it should contain exactly one required field 
 * labeled "Brief" and all specified optional fields for power users.
 */
test('Property 1: Template Structure Completeness - **Validates: Requirements 1.1, 1.3, 1.5**', () => {
  fc.assert(fc.property(
    templateConfigGenerator,
    (config) => {
      const template = generateTemplate(config);
      
      // Check required field exists and is labeled "Brief"
      const briefField = template.fields.find(f => f.required);
      if (!briefField || briefField.label !== 'Brief') return false;
      
      // Check all optional fields are present
      const expectedOptionalFields = [
        'platforms', 'technologies', 'deployment', 'localization'
      ];
      const actualOptionalFields = template.fields
        .filter(f => !f.required)
        .map(f => f.name);
      
      return expectedOptionalFields.every(field => 
        actualOptionalFields.includes(field)
      );
    }
  ), { 
    numRuns: 100,
    // Tag format: Feature: ai-prompt-library, Property 1: Template Structure Completeness
  });
});
```

## Property-Based Testing Philosophy

### What is Property-Based Testing?
Property-based testing validates universal properties that should hold true for all valid inputs, rather than testing specific examples. Instead of writing tests like "when I input X, I expect Y", property-based tests express "for all valid inputs of type X, property P should hold true".

### Benefits of Property-Based Testing
```markdown
**Comprehensive Coverage**: Tests thousands of inputs automatically generated
**Bug Discovery**: Finds edge cases that developers typically miss
**Specification Clarity**: Forces clear thinking about what the code should do
**Regression Prevention**: Catches bugs introduced by code changes
**Documentation**: Properties serve as executable specifications
```

## Property Identification Framework

### 1. Invariant Properties
**Definition**: Properties that remain constant despite changes to structure or order

**Examples**:
```javascript
// Collection size invariant
fc.property(fc.array(fc.integer()), (arr) => {
  const mapped = arr.map(x => x * 2);
  return mapped.length === arr.length;
});

// Tree balance invariant
fc.property(validTreeGenerator, (tree) => {
  const withNewNode = tree.insert(fc.sample(fc.integer(), 1)[0]);
  return withNewNode.isBalanced();
});

// Object field invariant
fc.property(userGenerator, (user) => {
  return user.createdAt <= user.updatedAt;
});
```

**Template**:
```javascript
// Invariant Property Template
test('Property: [Invariant Description]', () => {
  fc.assert(fc.property(
    [inputGenerator],
    (input) => {
      const result = performOperation(input);
      return invariantCondition(result, input);
    }
  ), { numRuns: 100 });
});
```

### 2. Round-Trip Properties
**Definition**: Combining an operation with its inverse should return to the original value

**Examples**:
```javascript
// Serialization round-trip
fc.property(fc.record({
  id: fc.integer(),
  name: fc.string(),
  email: fc.emailAddress()
}), (user) => {
  const serialized = JSON.stringify(user);
  const deserialized = JSON.parse(serialized);
  return JSON.stringify(deserialized) === JSON.stringify(user);
});

// Encoding round-trip
fc.property(fc.string(), (text) => {
  const encoded = btoa(text);
  const decoded = atob(encoded);
  return decoded === text;
});

// Database round-trip
fc.property(userGenerator, async (user) => {
  const saved = await userRepository.save(user);
  const retrieved = await userRepository.findById(saved.id);
  return deepEqual(retrieved, saved);
});
```

**Template**:
```javascript
// Round-Trip Property Template
test('Property: [Operation] round-trip preserves data', () => {
  fc.assert(fc.property(
    [dataGenerator],
    (data) => {
      const transformed = forwardOperation(data);
      const restored = reverseOperation(transformed);
      return deepEqual(restored, data);
    }
  ), { numRuns: 100 });
});
```

### 3. Idempotence Properties
**Definition**: Applying an operation multiple times should have the same effect as applying it once

**Examples**:
```javascript
// Array deduplication idempotence
fc.property(fc.array(fc.integer()), (arr) => {
  const deduped1 = [...new Set(arr)];
  const deduped2 = [...new Set(deduped1)];
  return JSON.stringify(deduped1) === JSON.stringify(deduped2);
});

// Database upsert idempotence
fc.property(userGenerator, async (user) => {
  await userRepository.upsert(user);
  const result1 = await userRepository.findById(user.id);
  
  await userRepository.upsert(user);
  const result2 = await userRepository.findById(user.id);
  
  return deepEqual(result1, result2);
});

// Configuration merge idempotence
fc.property(configGenerator, (config) => {
  const merged1 = mergeConfig(defaultConfig, config);
  const merged2 = mergeConfig(merged1, config);
  return deepEqual(merged1, merged2);
});
```

**Template**:
```javascript
// Idempotence Property Template
test('Property: [Operation] is idempotent', () => {
  fc.assert(fc.property(
    [inputGenerator],
    (input) => {
      const result1 = operation(input);
      const result2 = operation(result1);
      return deepEqual(result1, result2);
    }
  ), { numRuns: 100 });
});
```

### 4. Metamorphic Properties
**Definition**: Relationships that should hold between different operations or transformations

**Examples**:
```javascript
// Filter reduces or maintains size
fc.property(
  fc.array(fc.integer()),
  fc.func(fc.boolean()),
  (arr, predicate) => {
    const filtered = arr.filter(predicate);
    return filtered.length <= arr.length;
  }
);

// Sort preserves elements
fc.property(fc.array(fc.integer()), (arr) => {
  const sorted = [...arr].sort((a, b) => a - b);
  return sorted.length === arr.length &&
         arr.every(item => sorted.includes(item));
});

// Map preserves structure
fc.property(
  fc.array(fc.record({ id: fc.integer(), value: fc.string() })),
  fc.func(fc.string()),
  (objects, mapper) => {
    const mapped = objects.map(obj => ({ ...obj, value: mapper(obj.value) }));
    return mapped.length === objects.length &&
           mapped.every((item, index) => item.id === objects[index].id);
  }
);
```

**Template**:
```javascript
// Metamorphic Property Template
test('Property: [Relationship Description]', () => {
  fc.assert(fc.property(
    [inputGenerator1],
    [inputGenerator2],
    (input1, input2) => {
      const result1 = operation1(input1);
      const result2 = operation2(input2);
      return relationshipCondition(result1, result2, input1, input2);
    }
  ), { numRuns: 100 });
});
```

### 5. Error Condition Properties
**Definition**: Invalid inputs should be properly rejected with appropriate error handling

**Examples**:
```javascript
// Invalid email rejection
fc.property(fc.string().filter(s => !isValidEmail(s)), (invalidEmail) => {
  expect(() => createUser({ email: invalidEmail }))
    .toThrow('Invalid email format');
});

// Negative value rejection
fc.property(fc.integer().filter(n => n < 0), (negativeValue) => {
  expect(() => calculateSquareRoot(negativeValue))
    .toThrow('Cannot calculate square root of negative number');
});

// Boundary condition validation
fc.property(fc.integer().filter(n => n > MAX_ALLOWED_VALUE), (largeValue) => {
  const result = processValue(largeValue);
  return result.isError && result.errorType === 'VALUE_TOO_LARGE';
});
```

**Template**:
```javascript
// Error Condition Property Template
test('Property: Invalid [input type] properly rejected', () => {
  fc.assert(fc.property(
    [invalidInputGenerator],
    (invalidInput) => {
      expect(() => operation(invalidInput))
        .toThrow([expectedErrorMessage]);
    }
  ), { numRuns: 100 });
});
```

## Smart Generator Strategies

### 1. Domain-Specific Generators
```javascript
// User data generator
const userGenerator = fc.record({
  id: fc.integer({ min: 1, max: 1000000 }),
  email: fc.emailAddress(),
  name: fc.string({ minLength: 1, maxLength: 100 }),
  age: fc.integer({ min: 13, max: 120 }),
  roles: fc.array(fc.constantFrom('user', 'admin', 'moderator'), { minLength: 1 }),
  createdAt: fc.date({ min: new Date('2020-01-01'), max: new Date() }),
});

// API request generator
const apiRequestGenerator = fc.record({
  method: fc.constantFrom('GET', 'POST', 'PUT', 'DELETE'),
  path: fc.string({ minLength: 1 }).map(s => `/${s}`),
  headers: fc.dictionary(fc.string(), fc.string()),
  body: fc.oneof(fc.constant(null), fc.object()),
});

// Tree structure generator
const treeGenerator = fc.letrec(tie => ({
  leaf: fc.record({ type: fc.constant('leaf'), value: fc.integer() }),
  node: fc.record({
    type: fc.constant('node'),
    value: fc.integer(),
    left: tie('tree'),
    right: tie('tree'),
  }),
  tree: fc.oneof(tie('leaf'), tie('node')),
})).tree;
```

### 2. Constraint-Based Generators
```javascript
// Valid date range generator
const validDateRangeGenerator = fc.tuple(fc.date(), fc.date())
  .map(([date1, date2]) => {
    const start = date1 < date2 ? date1 : date2;
    const end = date1 < date2 ? date2 : date1;
    return { start, end };
  });

// Valid pagination parameters
const paginationGenerator = fc.record({
  page: fc.integer({ min: 1, max: 1000 }),
  limit: fc.integer({ min: 1, max: 100 }),
}).map(({ page, limit }) => ({
  page,
  limit,
  offset: (page - 1) * limit,
}));

// Valid configuration object
const configGenerator = fc.record({
  database: fc.record({
    host: fc.domain(),
    port: fc.integer({ min: 1024, max: 65535 }),
    name: fc.string({ minLength: 1, maxLength: 64 }),
  }),
  cache: fc.record({
    ttl: fc.integer({ min: 60, max: 86400 }), // 1 minute to 1 day
    maxSize: fc.integer({ min: 100, max: 10000 }),
  }),
  features: fc.record({
    enableLogging: fc.boolean(),
    enableMetrics: fc.boolean(),
    enableCache: fc.boolean(),
  }),
});
```

### 3. Edge Case Generators
```javascript
// String edge cases
const edgeCaseStringGenerator = fc.oneof(
  fc.constant(''),                    // Empty string
  fc.constant(' '),                   // Single space
  fc.constant('\n\t\r'),             // Whitespace characters
  fc.string({ minLength: 1000 }),     // Very long string
  fc.constant('🚀🌟💫'),              // Unicode/emoji
  fc.constant('<script>alert("xss")</script>'), // Potential XSS
  fc.constant("'; DROP TABLE users; --"),       // SQL injection attempt
);

// Number edge cases
const edgeCaseNumberGenerator = fc.oneof(
  fc.constant(0),
  fc.constant(-0),
  fc.constant(Number.MAX_SAFE_INTEGER),
  fc.constant(Number.MIN_SAFE_INTEGER),
  fc.constant(Number.POSITIVE_INFINITY),
  fc.constant(Number.NEGATIVE_INFINITY),
  fc.constant(Number.NaN),
);

// Array edge cases
const edgeCaseArrayGenerator = fc.oneof(
  fc.constant([]),                    // Empty array
  fc.array(fc.anything(), { minLength: 1000 }), // Very large array
  fc.array(fc.constant(null)),        // Array of nulls
  fc.array(fc.constant(undefined)),   // Array of undefined
);
```

## Property Test Implementation Patterns

### 1. Async Property Testing
```javascript
// Async operation property test
test('Property: Async operation maintains data integrity', async () => {
  await fc.assert(fc.asyncProperty(
    userGenerator,
    async (user) => {
      const saved = await userService.save(user);
      const retrieved = await userService.findById(saved.id);
      return deepEqual(retrieved.email, user.email);
    }
  ), { numRuns: 50 }); // Fewer runs for async tests
});

// Concurrent operation property test
test('Property: Concurrent operations are thread-safe', async () => {
  await fc.assert(fc.asyncProperty(
    fc.array(userGenerator, { minLength: 10, maxLength: 50 }),
    async (users) => {
      const savePromises = users.map(user => userService.save(user));
      const savedUsers = await Promise.all(savePromises);
      
      const retrievePromises = savedUsers.map(user => 
        userService.findById(user.id)
      );
      const retrievedUsers = await Promise.all(retrievePromises);
      
      return retrievedUsers.length === savedUsers.length &&
             retrievedUsers.every(user => user !== null);
    }
  ), { numRuns: 20 });
});
```

### 2. Stateful Property Testing
```javascript
// Stateful system property test
test('Property: Shopping cart operations maintain consistency', () => {
  const commands = [
    fc.record({ type: fc.constant('add'), item: itemGenerator }),
    fc.record({ type: fc.constant('remove'), itemId: fc.string() }),
    fc.record({ type: fc.constant('clear') }),
    fc.record({ type: fc.constant('checkout') }),
  ];
  
  fc.assert(fc.property(
    fc.array(commands, { maxLength: 20 }),
    (commandSequence) => {
      const cart = new ShoppingCart();
      let expectedTotal = 0;
      
      for (const command of commandSequence) {
        switch (command.type) {
          case 'add':
            cart.addItem(command.item);
            expectedTotal += command.item.price;
            break;
          case 'remove':
            const removed = cart.removeItem(command.itemId);
            if (removed) expectedTotal -= removed.price;
            break;
          case 'clear':
            cart.clear();
            expectedTotal = 0;
            break;
          case 'checkout':
            if (cart.items.length > 0) {
              cart.checkout();
              expectedTotal = 0;
            }
            break;
        }
        
        // Invariant: cart total should match expected total
        if (Math.abs(cart.total - expectedTotal) > 0.01) {
          return false;
        }
      }
      
      return true;
    }
  ), { numRuns: 100 });
});
```

### 3. Model-Based Property Testing
```javascript
// Model-based testing with reference implementation
test('Property: Optimized sort matches reference implementation', () => {
  fc.assert(fc.property(
    fc.array(fc.integer()),
    (arr) => {
      const optimizedResult = optimizedSort(arr);
      const referenceResult = [...arr].sort((a, b) => a - b);
      
      return JSON.stringify(optimizedResult) === JSON.stringify(referenceResult);
    }
  ), { numRuns: 100 });
});

// Model-based API testing
test('Property: API responses match specification', () => {
  fc.assert(fc.property(
    apiRequestGenerator,
    (request) => {
      const response = apiHandler(request);
      const expectedResponse = referenceApiHandler(request);
      
      return response.status === expectedResponse.status &&
             deepEqual(response.body, expectedResponse.body);
    }
  ), { numRuns: 100 });
});
```

## Property Test Configuration and Optimization

### 1. Test Configuration Options
```javascript
// Basic configuration
fc.assert(fc.property(
  inputGenerator,
  propertyFunction
), {
  numRuns: 100,           // Number of test cases to generate
  maxSkipsPerRun: 100,    // Max skipped cases before giving up
  timeout: 5000,          // Timeout per test case (ms)
  seed: 42,               // Seed for reproducible tests
  path: "0:1:2",          // Replay specific failing case
  verbose: true,          // Detailed output on failure
});

// Advanced configuration
fc.assert(fc.property(
  inputGenerator,
  propertyFunction
), {
  numRuns: 1000,
  endOnFailure: true,     // Stop on first failure
  skipAllAfterTimeLimit: 10000, // Skip remaining tests after timeout
  interruptAfterTimeLimit: 15000, // Hard stop after timeout
  markInterruptAsFailure: true,   // Treat timeout as failure
});
```

### 2. Shrinking and Debugging
```javascript
// Custom shrinking for complex types
const userGeneratorWithShrinking = fc.record({
  id: fc.integer({ min: 1 }),
  name: fc.string({ minLength: 1 }),
  email: fc.emailAddress(),
}).map(user => new User(user));

// Debugging failing properties
test('Property with debugging', () => {
  fc.assert(fc.property(
    fc.array(fc.integer()),
    (arr) => {
      console.log('Testing array:', arr); // Debug output
      
      const result = processArray(arr);
      
      // Add assertions with helpful messages
      if (result.length !== arr.length) {
        console.log('Length mismatch:', { 
          input: arr.length, 
          output: result.length 
        });
        return false;
      }
      
      return true;
    }
  ), { 
    numRuns: 100,
    verbose: true, // Enable verbose output
  });
});
```

## Integration with Design Document Properties

### Mapping Requirements to Properties
```javascript
// Example mapping from design document properties
/**
 * Property 1: Template Structure Completeness
 * Validates: Requirements 1.1, 1.3, 1.5
 * For any generated template, it should contain exactly one required field 
 * labeled "Brief", all specified optional fields for power users, and serve 
 * as both input form and documentation.
 */
test('Property 1: Template Structure Completeness', () => {
  fc.assert(fc.property(
    templateConfigGenerator,
    (config) => {
      const template = generateTemplate(config);
      
      // Check required field exists and is labeled "Brief"
      const briefField = template.fields.find(f => f.required);
      if (!briefField || briefField.label !== 'Brief') return false;
      
      // Check all optional fields are present
      const expectedOptionalFields = [
        'platforms', 'technologies', 'deployment', 
        'localization', 'design', 'tokenUsage'
      ];
      const actualOptionalFields = template.fields
        .filter(f => !f.required)
        .map(f => f.name);
      
      return expectedOptionalFields.every(field => 
        actualOptionalFields.includes(field)
      );
    }
  ), { 
    numRuns: 100,
    // Tag format as specified in design document
    // Feature: ai-prompt-library, Property 1: Template Structure Completeness
  });
});
```

### Property Test Tagging and Documentation
```javascript
// Standardized property test format
describe('Feature: ai-prompt-library', () => {
  test('Property 2: Brief Content Validation - **Validates: Requirements 1.2, 1.6**', () => {
    fc.assert(fc.property(
      briefContentGenerator,
      (briefContent) => {
        const validationResult = validateBrief(briefContent);
        
        // Brief content within valid length ranges should be accepted
        if (briefContent.length >= 10 && briefContent.length <= 10000) {
          return validationResult.isValid === true;
        }
        
        return true; // Skip invalid length cases
      }
    ), { numRuns: 100 });
  });
  
  test('Property 3: Production-Quality Defaults - **Validates: Requirements 1.4**', () => {
    fc.assert(fc.property(
      projectConfigWithOmittedFields,
      (config) => {
        const specifications = generateSpecifications(config);
        
        // Should include all production-quality defaults
        const requiredDefaults = [
          'rbac', 'adminPortals', 'logging', 'analytics', 
          'monitoring', 'i18n', 'accessibility', 'security'
        ];
        
        return requiredDefaults.every(feature => 
          specifications.features.includes(feature)
        );
      }
    ), { numRuns: 100 });
  });
});
```

## Dry-Run Property Testing Strategy

When generating abbreviated property testing strategy for dry-run mode:

```markdown
## Property-Based Testing Strategy (Dry-Run)

### Core Properties Identified
1. **[Property Name]**: [Brief description]
   - **Validates**: Requirements [X.Y, X.Z]
   - **Pattern**: [Invariant/Round-trip/Idempotence/Metamorphic/Error]
   - **Priority**: [High/Medium/Low]

2. **[Property Name]**: [Brief description]
   - **Validates**: Requirements [X.Y]
   - **Pattern**: [Pattern type]
   - **Priority**: [Priority level]

### Implementation Approach
- **Framework**: [fast-check/Hypothesis/jqwik] based on technology stack
- **Test Configuration**: 100 iterations minimum per property
- **Generator Strategy**: Domain-specific generators with edge case coverage
- **Integration**: Property tests run alongside unit tests in CI/CD pipeline

### Estimated Effort
- **Property Identification**: [X] hours
- **Generator Development**: [Y] hours  
- **Property Implementation**: [Z] hours
- **Total Property Testing Setup**: [Total] hours
```

---

**Property-Based Testing Best Practices**:
1. Start with the most critical business logic and data transformations
2. Use domain-specific generators that reflect real-world data constraints
3. Include edge cases and boundary conditions in generators
4. Keep properties simple and focused on single concerns
5. Use descriptive property names that explain what is being validated
6. Tag properties with requirement references for traceability
7. Run property tests with sufficient iterations (minimum 100)
8. Integrate property tests into CI/CD pipeline alongside unit tests