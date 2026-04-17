# Property-Based Testing Template

<!-- INSTANTIATION RULES
When the drill-down engine (or any orchestrator) uses this template:
1. Every placeholder — including {{variables}}, <TBD>, [project name], and generic
   field/function/endpoint names — MUST be replaced with project-specific values
   before output is written to prompts/outputs/current/.
2. The template filename MUST NOT appear in task output. Dissolve the template
   into concrete content; do not reference its source.
3. No strings beginning with ".ai-prompts/prompts/" may appear in the output
   (validated by scripts/validate-instantiation.sh).
4. Outputs must contain real data shapes, real endpoints, real file paths, and
   real function signatures specific to the project.
-->


## Purpose

This template provides comprehensive patterns for implementing property-based testing systems that automatically generate test cases, discover edge cases, and verify system properties through randomized inputs. It covers test generation strategies, property definitions, shrinking algorithms, and integration with existing test suites for robust software validation.

## Context

Property-based testing shifts focus from specific examples to general properties that should hold for all valid inputs. This template addresses the complexity of defining meaningful properties, generating diverse test data, and integrating property-based tests with traditional unit tests to achieve comprehensive test coverage and discover unexpected edge cases.

## Examples

### Example 1: User Validation Properties
```typescript
// Property: Valid emails should always pass validation
fc.assert(fc.property(fc.emailAddress(), (email) => {
  const result = validateEmail(email);
  expect(result.isValid).toBe(true);
}));
```

### Example 2: Data Structure Invariants
```python
# Property: Sorting should preserve all elements
@given(st.lists(st.integers()))
def test_sorting_preserves_elements(items):
    sorted_items = sorted(items)
    assert len(sorted_items) == len(items)
    assert all(item in sorted_items for item in items)
```

### Example 3: Business Logic Properties
```java
// Property: Cart total should equal sum of item prices
@Property
void cartTotalShouldEqualSumOfItemPrices(@ForAll List<Product> products) {
    ShoppingCart cart = new ShoppingCart();
    products.forEach(cart::addItem);
    
    BigDecimal expectedTotal = products.stream()
        .map(Product::getPrice)
        .reduce(BigDecimal.ZERO, BigDecimal::add);
    
    assertThat(cart.getTotal()).isEqualByComparingTo(expectedTotal);
}
```

## Instructions

### Framework Selection

Choose the appropriate property-based testing framework:

| Language | Framework | Best For | Maturity |
|----------|-----------|----------|----------|
| **JavaScript/TypeScript** | fast-check | Web applications, Node.js APIs | High |
| **Python** | Hypothesis | Data science, web backends | Very High |
| **Java** | jqwik | Enterprise applications | High |
| **Haskell** | QuickCheck | Functional programming | Very High |
| **Rust** | proptest | Systems programming | High |
| **C#** | FsCheck | .NET applications | High |

### JavaScript/TypeScript Implementation

```typescript
// package.json dependencies
{
  "devDependencies": {
    "fast-check": "^3.13.0",
    "@types/jest": "^29.5.5",
    "jest": "^29.7.0"
  }
}

// Property-based test examples
import fc from 'fast-check';

// User validation properties
describe('User validation properties', () => {
  test('valid email should always pass validation', () => {
    fc.assert(fc.property(
      fc.emailAddress(),
      (email) => {
        const result = validateEmail(email);
        expect(result.isValid).toBe(true);
      }
    ));
  });

  test('user creation should preserve essential properties', () => {
    fc.assert(fc.property(
      fc.record({
        name: fc.string({ minLength: 1, maxLength: 100 }),
        email: fc.emailAddress(),
        age: fc.integer({ min: 13, max: 120 })
      }),
      (userData) => {
        const user = createUser(userData);
        
        // Properties that should always hold
        expect(user.id).toBeDefined();
        expect(user.name).toBe(userData.name);
        expect(user.email.toLowerCase()).toBe(userData.email.toLowerCase());
        expect(user.createdAt).toBeInstanceOf(Date);
        expect(user.isActive).toBe(true);
      }
    ));
  });

  test('password hashing should be deterministic and secure', () => {
    fc.assert(fc.property(
      fc.string({ minLength: 8, maxLength: 128 }),
      fc.string({ minLength: 16, maxLength: 16 }), // salt
      (password, salt) => {
        const hash1 = hashPassword(password, salt);
        const hash2 = hashPassword(password, salt);
        
        // Same input should produce same output
        expect(hash1).toBe(hash2);
        
        // Hash should be different from original password
        expect(hash1).not.toBe(password);
        
        // Hash should have expected length
        expect(hash1.length).toBeGreaterThan(32);
      }
    ));
  });
});

// API endpoint properties
describe('API endpoint properties', () => {
  test('GET requests should be idempotent', () => {
    fc.assert(fc.property(
      fc.integer({ min: 1, max: 1000 }), // user ID
      async (userId) => {
        const response1 = await api.get(`/users/${userId}`);
        const response2 = await api.get(`/users/${userId}`);
        
        // Multiple calls should return same result
        expect(response1.status).toBe(response2.status);
        if (response1.status === 200) {
          expect(response1.data).toEqual(response2.data);
        }
      }
    ));
  });

  test('pagination should maintain total count consistency', () => {
    fc.assert(fc.property(
      fc.integer({ min: 1, max: 50 }), // page size
      fc.integer({ min: 0, max: 10 }), // page number
      async (pageSize, pageNumber) => {
        const response = await api.get('/users', {
          params: { page: pageNumber, limit: pageSize }
        });
        
        if (response.status === 200) {
          const { data, pagination } = response.data;
          
          // Returned items should not exceed page size
          expect(data.length).toBeLessThanOrEqual(pageSize);
          
          // Pagination metadata should be consistent
          expect(pagination.page).toBe(pageNumber);
          expect(pagination.limit).toBe(pageSize);
          expect(pagination.total).toBeGreaterThanOrEqual(data.length);
        }
      }
    ));
  });
});

// Data structure properties
describe('Data structure properties', () => {
  test('array operations should preserve invariants', () => {
    fc.assert(fc.property(
      fc.array(fc.integer()),
      fc.integer(),
      (arr, item) => {
        const originalLength = arr.length;
        const result = addItem(arr, item);
        
        // Length should increase by 1
        expect(result.length).toBe(originalLength + 1);
        
        // New item should be present
        expect(result).toContain(item);
        
        // Original items should still be present
        arr.forEach(originalItem => {
          expect(result).toContain(originalItem);
        });
      }
    ));
  });

  test('sorting should preserve all elements', () => {
    fc.assert(fc.property(
      fc.array(fc.integer()),
      (arr) => {
        const sorted = [...arr].sort((a, b) => a - b);
        
        // Same length
        expect(sorted.length).toBe(arr.length);
        
        // All original elements present
        arr.forEach(item => {
          expect(sorted).toContain(item);
        });
        
        // Should be in ascending order
        for (let i = 1; i < sorted.length; i++) {
          expect(sorted[i]).toBeGreaterThanOrEqual(sorted[i - 1]);
        }
      }
    ));
  });
});

// Custom generators for domain objects
const userGenerator = fc.record({
  id: fc.integer({ min: 1 }),
  name: fc.string({ minLength: 1, maxLength: 50 }),
  email: fc.emailAddress(),
  role: fc.constantFrom('admin', 'user', 'moderator'),
  preferences: fc.record({
    theme: fc.constantFrom('light', 'dark'),
    notifications: fc.boolean(),
    language: fc.constantFrom('en', 'es', 'fr', 'de')
  })
});

const productGenerator = fc.record({
  id: fc.integer({ min: 1 }),
  name: fc.string({ minLength: 1, maxLength: 100 }),
  price: fc.float({ min: 0.01, max: 10000, noNaN: true }),
  category: fc.constantFrom('electronics', 'clothing', 'books', 'home'),
  inStock: fc.boolean(),
  tags: fc.array(fc.string({ minLength: 1, maxLength: 20 }), { maxLength: 10 })
});

// Business logic properties
describe('E-commerce properties', () => {
  test('cart total should equal sum of item prices', () => {
    fc.assert(fc.property(
      fc.array(productGenerator, { minLength: 1, maxLength: 20 }),
      (products) => {
        const cart = new ShoppingCart();
        products.forEach(product => cart.addItem(product));
        
        const expectedTotal = products.reduce((sum, product) => sum + product.price, 0);
        const actualTotal = cart.getTotal();
        
        // Account for floating point precision
        expect(Math.abs(actualTotal - expectedTotal)).toBeLessThan(0.01);
      }
    ));
  });

  test('discount application should never result in negative prices', () => {
    fc.assert(fc.property(
      productGenerator,
      fc.float({ min: 0, max: 1 }), // discount percentage
      (product, discountPercent) => {
        const discountedPrice = applyDiscount(product.price, discountPercent);
        
        expect(discountedPrice).toBeGreaterThanOrEqual(0);
        expect(discountedPrice).toBeLessThanOrEqual(product.price);
      }
    ));
  });
});
```

### Python Implementation with Hypothesis

```python
# requirements.txt
hypothesis==6.88.1
pytest==7.4.2
faker==19.6.1

# Property-based tests with Hypothesis
from hypothesis import given, strategies as st, assume, example
from hypothesis.stateful import RuleBasedStateMachine, rule, invariant
import pytest
from datetime import datetime, timedelta
import json

# Basic property tests
class TestUserValidation:
    @given(st.emails())
    def test_valid_email_validation(self, email):
        """Valid emails should always pass validation"""
        result = validate_email(email)
        assert result.is_valid is True
        assert result.normalized_email is not None

    @given(st.text(min_size=1, max_size=100))
    def test_username_normalization(self, username):
        """Username normalization should be consistent"""
        normalized1 = normalize_username(username)
        normalized2 = normalize_username(username)
        
        assert normalized1 == normalized2
        assert len(normalized1) <= len(username)

    @given(st.text(min_size=8, max_size=128))
    def test_password_hashing_properties(self, password):
        """Password hashing should be secure and deterministic"""
        hash1 = hash_password(password)
        hash2 = hash_password(password)
        
        # Should be deterministic with same salt
        assert hash1 != password  # Never store plain text
        assert len(hash1) >= 60   # Minimum hash length
        assert verify_password(password, hash1) is True

# Data structure properties
class TestDataStructures:
    @given(st.lists(st.integers()))
    def test_list_operations_preserve_elements(self, items):
        """List operations should preserve all elements"""
        original_count = len(items)
        
        # Test append
        items.append(42)
        assert len(items) == original_count + 1
        assert 42 in items
        
        # Test remove
        if items:
            item_to_remove = items[0]
            items.remove(item_to_remove)
            assert len(items) == original_count

    @given(st.lists(st.integers()))
    def test_sorting_preserves_elements(self, items):
        """Sorting should preserve all elements"""
        original_items = items.copy()
        sorted_items = sorted(items)
        
        assert len(sorted_items) == len(original_items)
        assert all(item in sorted_items for item in original_items)
        
        # Check ordering
        for i in range(1, len(sorted_items)):
            assert sorted_items[i] >= sorted_items[i-1]

# Custom strategies for domain objects
user_strategy = st.fixed_dictionaries({
    'id': st.integers(min_value=1),
    'name': st.text(min_size=1, max_size=50),
    'email': st.emails(),
    'age': st.integers(min_value=13, max_value=120),
    'role': st.sampled_from(['admin', 'user', 'moderator']),
    'created_at': st.datetimes(
        min_value=datetime(2020, 1, 1),
        max_value=datetime.now()
    )
})

product_strategy = st.fixed_dictionaries({
    'id': st.integers(min_value=1),
    'name': st.text(min_size=1, max_size=100),
    'price': st.floats(min_value=0.01, max_value=10000, allow_nan=False),
    'category': st.sampled_from(['electronics', 'clothing', 'books']),
    'in_stock': st.booleans(),
    'tags': st.lists(st.text(min_size=1, max_size=20), max_size=10)
})

# Business logic properties
class TestEcommerce:
    @given(st.lists(product_strategy, min_size=1, max_size=20))
    def test_cart_total_calculation(self, products):
        """Cart total should equal sum of product prices"""
        cart = ShoppingCart()
        
        for product in products:
            cart.add_item(product)
        
        expected_total = sum(p['price'] for p in products)
        actual_total = cart.get_total()
        
        # Account for floating point precision
        assert abs(actual_total - expected_total) < 0.01

    @given(product_strategy, st.floats(min_value=0, max_value=1))
    def test_discount_application(self, product, discount_percent):
        """Discounts should never result in negative prices"""
        original_price = product['price']
        discounted_price = apply_discount(original_price, discount_percent)
        
        assert discounted_price >= 0
        assert discounted_price <= original_price

    @given(user_strategy)
    def test_user_creation_invariants(self, user_data):
        """User creation should maintain essential properties"""
        user = create_user(user_data)
        
        assert user.id is not None
        assert user.name == user_data['name']
        assert user.email.lower() == user_data['email'].lower()
        assert user.is_active is True
        assert isinstance(user.created_at, datetime)

# Stateful testing for complex workflows
class ShoppingCartStateMachine(RuleBasedStateMachine):
    def __init__(self):
        super().__init__()
        self.cart = ShoppingCart()
        self.added_products = []

    @rule(product=product_strategy)
    def add_product(self, product):
        """Add a product to the cart"""
        self.cart.add_item(product)
        self.added_products.append(product)

    @rule()
    def remove_random_product(self):
        """Remove a random product from the cart"""
        assume(len(self.added_products) > 0)
        
        product = self.added_products.pop()
        self.cart.remove_item(product['id'])

    @rule()
    def clear_cart(self):
        """Clear all items from the cart"""
        self.cart.clear()
        self.added_products.clear()

    @invariant()
    def cart_total_is_consistent(self):
        """Cart total should always match sum of added products"""
        expected_total = sum(p['price'] for p in self.added_products)
        actual_total = self.cart.get_total()
        
        assert abs(actual_total - expected_total) < 0.01

    @invariant()
    def cart_item_count_is_consistent(self):
        """Cart item count should match number of added products"""
        assert self.cart.item_count() == len(self.added_products)

# Run stateful tests
TestShoppingCart = ShoppingCartStateMachine.TestCase

# API testing with properties
class TestAPIProperties:
    @given(st.integers(min_value=1, max_value=1000))
    def test_get_user_idempotency(self, user_id):
        """GET requests should be idempotent"""
        response1 = api_client.get(f'/users/{user_id}')
        response2 = api_client.get(f'/users/{user_id}')
        
        assert response1.status_code == response2.status_code
        if response1.status_code == 200:
            assert response1.json() == response2.json()

    @given(
        st.integers(min_value=1, max_value=50),  # page_size
        st.integers(min_value=0, max_value=10)   # page_number
    )
    def test_pagination_consistency(self, page_size, page_number):
        """Pagination should maintain consistency"""
        response = api_client.get('/users', params={
            'page': page_number,
            'limit': page_size
        })
        
        if response.status_code == 200:
            data = response.json()
            
            assert len(data['users']) <= page_size
            assert data['pagination']['page'] == page_number
            assert data['pagination']['limit'] == page_size
            assert data['pagination']['total'] >= len(data['users'])

# Performance properties
class TestPerformanceProperties:
    @given(st.lists(st.integers(), min_size=100, max_size=10000))
    def test_sorting_performance_scales_reasonably(self, items):
        """Sorting performance should scale reasonably with input size"""
        import time
        
        start_time = time.time()
        sorted_items = sorted(items)
        end_time = time.time()
        
        # Should complete within reasonable time
        # O(n log n) for n=10000 should be well under 1 second
        assert end_time - start_time < 1.0
        
        # Verify correctness
        assert len(sorted_items) == len(items)
        for i in range(1, len(sorted_items)):
            assert sorted_items[i] >= sorted_items[i-1]
```

### Java Implementation with jqwik

```java
// build.gradle dependencies
testImplementation 'net.jqwik:jqwik:1.7.4'
testImplementation 'org.junit.jupiter:junit-jupiter:5.10.0'

// Property-based tests with jqwik
import net.jqwik.api.*;
import net.jqwik.api.constraints.*;
import org.junit.jupiter.api.Test;

class UserValidationProperties {
    
    @Property
    void validEmailsShouldPassValidation(@ForAll @Email String email) {
        ValidationResult result = EmailValidator.validate(email);
        Assertions.assertThat(result.isValid()).isTrue();
        Assertions.assertThat(result.getNormalizedEmail()).isNotNull();
    }
    
    @Property
    void passwordHashingShouldBeSecure(
        @ForAll @StringLength(min = 8, max = 128) String password
    ) {
        String hash1 = PasswordHasher.hash(password);
        String hash2 = PasswordHasher.hash(password);
        
        // Should be deterministic with same salt
        Assertions.assertThat(hash1).isNotEqualTo(password);
        Assertions.assertThat(hash1.length()).isGreaterThan(32);
        Assertions.assertThat(PasswordHasher.verify(password, hash1)).isTrue();
    }
    
    @Property
    void userCreationShouldPreserveProperties(@ForAll("validUsers") User userData) {
        User createdUser = UserService.createUser(userData);
        
        Assertions.assertThat(createdUser.getId()).isNotNull();
        Assertions.assertThat(createdUser.getName()).isEqualTo(userData.getName());
        Assertions.assertThat(createdUser.getEmail().toLowerCase())
                 .isEqualTo(userData.getEmail().toLowerCase());
        Assertions.assertThat(createdUser.isActive()).isTrue();
        Assertions.assertThat(createdUser.getCreatedAt()).isNotNull();
    }
    
    @Provide
    Arbitrary<User> validUsers() {
        return Combinators.combine(
            Arbitraries.strings().withCharRange('a', 'z').ofMinLength(1).ofMaxLength(50),
            Arbitraries.emails(),
            Arbitraries.integers().between(13, 120)
        ).as((name, email, age) -> new User(name, email, age));
    }
}

class DataStructureProperties {
    
    @Property
    void listOperationsShouldPreserveElements(@ForAll List<Integer> items) {
        List<Integer> mutableList = new ArrayList<>(items);
        int originalSize = mutableList.size();
        
        // Test add
        mutableList.add(42);
        Assertions.assertThat(mutableList.size()).isEqualTo(originalSize + 1);
        Assertions.assertThat(mutableList).contains(42);
        
        // Test remove
        if (!mutableList.isEmpty()) {
            Integer itemToRemove = mutableList.get(0);
            mutableList.remove(itemToRemove);
            Assertions.assertThat(mutableList.size()).isEqualTo(originalSize);
        }
    }
    
    @Property
    void sortingShouldPreserveElements(@ForAll List<Integer> items) {
        List<Integer> originalItems = new ArrayList<>(items);
        List<Integer> sortedItems = new ArrayList<>(items);
        Collections.sort(sortedItems);
        
        Assertions.assertThat(sortedItems.size()).isEqualTo(originalItems.size());
        
        // All original elements should be present
        for (Integer item : originalItems) {
            Assertions.assertThat(sortedItems).contains(item);
        }
        
        // Should be in ascending order
        for (int i = 1; i < sortedItems.size(); i++) {
            Assertions.assertThat(sortedItems.get(i))
                     .isGreaterThanOrEqualTo(sortedItems.get(i - 1));
        }
    }
}

class EcommerceProperties {
    
    @Property
    void cartTotalShouldEqualSumOfItemPrices(
        @ForAll("products") @Size(min = 1, max = 20) List<Product> products
    ) {
        ShoppingCart cart = new ShoppingCart();
        
        for (Product product : products) {
            cart.addItem(product);
        }
        
        BigDecimal expectedTotal = products.stream()
            .map(Product::getPrice)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        BigDecimal actualTotal = cart.getTotal();
        
        Assertions.assertThat(actualTotal).isEqualByComparingTo(expectedTotal);
    }
    
    @Property
    void discountShouldNeverResultInNegativePrice(
        @ForAll("products") Product product,
        @ForAll @FloatRange(min = 0.0f, max = 1.0f) float discountPercent
    ) {
        BigDecimal originalPrice = product.getPrice();
        BigDecimal discountedPrice = PricingService.applyDiscount(originalPrice, discountPercent);
        
        Assertions.assertThat(discountedPrice).isGreaterThanOrEqualTo(BigDecimal.ZERO);
        Assertions.assertThat(discountedPrice).isLessThanOrEqualTo(originalPrice);
    }
    
    @Provide
    Arbitrary<Product> products() {
        return Combinators.combine(
            Arbitraries.integers().greaterOrEqual(1),
            Arbitraries.strings().withCharRange('a', 'z').ofMinLength(1).ofMaxLength(100),
            Arbitraries.bigDecimals()
                      .between(BigDecimal.valueOf(0.01), BigDecimal.valueOf(10000))
                      .ofScale(2),
            Arbitraries.of("electronics", "clothing", "books", "home"),
            Arbitraries.booleans()
        ).as((id, name, price, category, inStock) -> 
            new Product(id, name, price, category, inStock));
    }
}
```

### Integration with CI/CD

```yaml
# .github/workflows/property-tests.yml
name: Property-Based Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  property-tests:
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        test-type: [quick, thorough]
        
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run quick property tests
      if: matrix.test-type == 'quick'
      run: npm run test:property -- --numRuns=100
      
    - name: Run thorough property tests
      if: matrix.test-type == 'thorough'
      run: npm run test:property -- --numRuns=10000
      timeout-minutes: 30
    
    - name: Upload test results
      uses: actions/upload-artifact@v3
      if: always()
      with:
        name: property-test-results-${{ matrix.test-type }}
        path: |
          coverage/
          test-results/
```

### Configuration and Best Practices

```typescript
// jest.config.js for property tests
module.exports = {
  testMatch: ['**/*.property.test.ts'],
  setupFilesAfterEnv: ['<rootDir>/src/test/property-setup.ts'],
  testTimeout: 30000, // Property tests can take longer
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.test.ts',
    '!src/**/*.property.test.ts'
  ]
};

// property-setup.ts
import fc from 'fast-check';

// Global configuration for property tests
beforeAll(() => {
  // Configure fast-check globally
  fc.configureGlobal({
    numRuns: process.env.CI ? 1000 : 100,
    verbose: process.env.NODE_ENV === 'development',
    seed: process.env.PROPERTY_TEST_SEED ? 
          parseInt(process.env.PROPERTY_TEST_SEED) : 
          Date.now()
  });
});

// Custom matchers for property tests
expect.extend({
  toSatisfyProperty(received, property) {
    try {
      fc.assert(fc.property(fc.constant(received), property));
      return {
        message: () => `Expected ${received} to satisfy property`,
        pass: true
      };
    } catch (error) {
      return {
        message: () => `Expected ${received} to satisfy property: ${error.message}`,
        pass: false
      };
    }
  }
});
```

## Expected Output

This template will produce:

- **Comprehensive Property Tests**: Automated test case generation for all system properties
- **Edge Case Discovery**: Automatic identification of boundary conditions and corner cases
- **Regression Prevention**: Properties that catch regressions across code changes
- **Data Generation**: Custom generators for domain-specific test data
- **Stateful Testing**: Complex workflow validation through state machines
- **Performance Properties**: Scalability and performance characteristic validation
- **Integration Testing**: Property-based API and system integration tests
- **CI/CD Integration**: Automated property test execution in deployment pipelines

## Integration Points

- Connects with existing unit test suites for comprehensive coverage
- Integrates with CI/CD pipelines for automated validation
- Works with performance testing modules for scalability verification
- Supports security testing through property-based security validation
- Compatible with mock data generation for realistic test scenarios

## Security Considerations

- Input validation properties to prevent injection attacks
- Authentication and authorization property verification
- Cryptographic function property validation
- Rate limiting and throttling property tests
- Data sanitization and encoding property verification

## Performance Features

- Configurable test run counts for different environments
- Parallel property test execution for faster feedback
- Shrinking algorithms to find minimal failing cases
- Performance regression detection through timing properties
- Memory usage property validation

## Accessibility & Internationalization

- UI component property validation for accessibility compliance
- Internationalization property tests for text rendering
- Keyboard navigation property verification
- Screen reader compatibility property tests
- Multi-language input handling property validation

This template provides a comprehensive foundation for property-based testing across different programming languages and frameworks, enabling robust software validation through automated test case generation and property verification.
