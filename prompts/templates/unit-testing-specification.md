# Unit Testing Specification Template

## Purpose
Generate comprehensive unit testing specifications that validate individual components, functions, and modules work correctly in isolation with specific examples and edge cases.

## Instructions
Use this template to create detailed unit testing specifications for your codebase. Focus on testing individual components in isolation, define clear test cases for specific examples and edge cases, organize tests logically, and ensure comprehensive coverage of functionality, error conditions, and boundary cases.

## Examples
```markdown
# Example: Unit Test Specification for UserService

## Component: UserService.createUser()

### Test Cases

#### Happy Path Tests
```javascript
describe('UserService.createUser', () => {
  test('should create user with valid data', async () => {
    const userData = {
      email: 'test@example.com',
      password: 'SecurePass123!',
      name: 'John Doe'
    };
    
    const result = await userService.createUser(userData);
    
    expect(result.id).toBeDefined();
    expect(result.email).toBe('test@example.com');
    expect(result.name).toBe('John Doe');
    expect(result.password).toBeUndefined(); // Password should not be returned
  });
});
```

#### Edge Cases
```javascript
test('should handle email with special characters', async () => {
  const userData = {
    email: 'test+tag@sub.example.com',
    password: 'SecurePass123!',
    name: 'Jane Doe'
  };
  
  const result = await userService.createUser(userData);
  expect(result.email).toBe('test+tag@sub.example.com');
});
```

#### Error Cases
```javascript
test('should throw error for duplicate email', async () => {
  const userData = { email: 'existing@example.com', password: 'pass', name: 'Test' };
  
  await expect(userService.createUser(userData))
    .rejects
    .toThrow('Email already exists');
});
```
```

## Unit Testing Philosophy

### What is Unit Testing?
Unit testing validates individual components and functions work correctly with known inputs and expected outputs. Unit tests focus on specific examples, edge cases, and error conditions to ensure code behaves as expected in concrete scenarios.

### Benefits of Unit Testing
```markdown
**Fast Feedback**: Quick execution provides immediate feedback during development
**Regression Prevention**: Catches bugs introduced by code changes
**Documentation**: Tests serve as examples of how code should be used
**Design Improvement**: Writing tests often reveals design issues
**Confidence**: Provides confidence that individual components work correctly
```

## Unit Testing Strategy Framework

### 1. Test Organization and Structure

**File Organization**:
```markdown
**Co-location Strategy** (Recommended):
- Place test files next to source files
- Use naming convention: `[component].test.[ext]`
- Example: `UserService.ts` → `UserService.test.ts`

**Separate Directory Strategy**:
- Mirror source directory structure in test directory
- Maintain same relative paths
- Example: `src/services/UserService.ts` → `tests/services/UserService.test.ts`
```

**Test Structure Pattern (AAA)**:
```javascript
// Arrange-Act-Assert Pattern
describe('UserService', () => {
  describe('createUser', () => {
    test('creates user with valid data', () => {
      // Arrange
      const userData = {
        email: 'user@example.com',
        name: 'John Doe',
        age: 30
      };
      const userService = new UserService();
      
      // Act
      const result = userService.createUser(userData);
      
      // Assert
      expect(result.id).toBeDefined();
      expect(result.email).toBe('user@example.com');
      expect(result.name).toBe('John Doe');
      expect(result.createdAt).toBeInstanceOf(Date);
    });
  });
});
```

### 2. Test Categories and Coverage

**Happy Path Testing**:
```javascript
// Test normal, expected behavior
test('calculateTotal returns correct sum for valid items', () => {
  const items = [
    { price: 10.99, quantity: 2 },
    { price: 5.50, quantity: 1 },
    { price: 15.00, quantity: 3 }
  ];
  
  const total = calculateTotal(items);
  
  expect(total).toBe(71.48); // (10.99*2) + (5.50*1) + (15.00*3)
});
```

**Edge Case Testing**:
```javascript
// Test boundary conditions and edge cases
describe('Edge Cases', () => {
  test('calculateTotal handles empty array', () => {
    const result = calculateTotal([]);
    expect(result).toBe(0);
  });
  
  test('calculateTotal handles zero quantities', () => {
    const items = [{ price: 10.00, quantity: 0 }];
    const result = calculateTotal(items);
    expect(result).toBe(0);
  });
  
  test('calculateTotal handles very large numbers', () => {
    const items = [{ price: Number.MAX_SAFE_INTEGER, quantity: 1 }];
    const result = calculateTotal(items);
    expect(result).toBe(Number.MAX_SAFE_INTEGER);
  });
});
```

**Error Condition Testing**:
```javascript
// Test error handling and validation
describe('Error Conditions', () => {
  test('createUser throws error for invalid email', () => {
    const invalidUserData = {
      email: 'not-an-email',
      name: 'John Doe'
    };
    
    expect(() => userService.createUser(invalidUserData))
      .toThrow('Invalid email format');
  });
  
  test('calculateTotal throws error for negative prices', () => {
    const items = [{ price: -10.00, quantity: 1 }];
    
    expect(() => calculateTotal(items))
      .toThrow('Price cannot be negative');
  });
});
```

### 3. Mock and Dependency Management

**Dependency Injection Testing**:
```javascript
// Test with mocked dependencies
describe('UserService with mocked dependencies', () => {
  let userService;
  let mockDatabase;
  let mockEmailService;
  
  beforeEach(() => {
    mockDatabase = {
      save: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn()
    };
    
    mockEmailService = {
      sendWelcomeEmail: jest.fn()
    };
    
    userService = new UserService(mockDatabase, mockEmailService);
  });
  
  test('createUser saves to database and sends welcome email', async () => {
    const userData = { email: 'user@example.com', name: 'John Doe' };
    const savedUser = { id: 1, ...userData, createdAt: new Date() };
    
    mockDatabase.save.mockResolvedValue(savedUser);
    mockEmailService.sendWelcomeEmail.mockResolvedValue(true);
    
    const result = await userService.createUser(userData);
    
    expect(mockDatabase.save).toHaveBeenCalledWith(userData);
    expect(mockEmailService.sendWelcomeEmail).toHaveBeenCalledWith(savedUser);
    expect(result).toEqual(savedUser);
  });
});
```

**External Service Mocking**:
```javascript
// Mock external APIs and services
describe('PaymentService', () => {
  let paymentService;
  
  beforeEach(() => {
    // Mock fetch for API calls
    global.fetch = jest.fn();
    paymentService = new PaymentService();
  });
  
  afterEach(() => {
    jest.restoreAllMocks();
  });
  
  test('processPayment handles successful payment', async () => {
    const mockResponse = {
      ok: true,
      json: async () => ({ 
        transactionId: 'txn_123', 
        status: 'completed' 
      })
    };
    
    fetch.mockResolvedValue(mockResponse);
    
    const result = await paymentService.processPayment({
      amount: 100.00,
      cardToken: 'card_token_123'
    });
    
    expect(result.transactionId).toBe('txn_123');
    expect(result.status).toBe('completed');
  });
  
  test('processPayment handles API failure', async () => {
    fetch.mockRejectedValue(new Error('Network error'));
    
    await expect(paymentService.processPayment({
      amount: 100.00,
      cardToken: 'card_token_123'
    })).rejects.toThrow('Payment processing failed');
  });
});
```

### 4. Async Testing Patterns

**Promise-Based Testing**:
```javascript
describe('Async Operations', () => {
  test('fetchUserData returns user data', async () => {
    const userId = 123;
    const expectedUser = { id: 123, name: 'John Doe' };
    
    const userData = await userService.fetchUserData(userId);
    
    expect(userData).toEqual(expectedUser);
  });
  
  test('fetchUserData handles user not found', async () => {
    const nonExistentUserId = 999;
    
    await expect(userService.fetchUserData(nonExistentUserId))
      .rejects.toThrow('User not found');
  });
});
```

**Callback Testing**:
```javascript
describe('Callback-based operations', () => {
  test('processFile calls callback with result', (done) => {
    const mockFile = { name: 'test.txt', content: 'Hello World' };
    
    fileProcessor.processFile(mockFile, (error, result) => {
      expect(error).toBeNull();
      expect(result.processedContent).toBe('HELLO WORLD');
      done();
    });
  });
  
  test('processFile calls callback with error for invalid file', (done) => {
    const invalidFile = { name: '', content: '' };
    
    fileProcessor.processFile(invalidFile, (error, result) => {
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe('Invalid file');
      expect(result).toBeUndefined();
      done();
    });
  });
});
```

### 5. State and Side Effect Testing

**Stateful Component Testing**:
```javascript
describe('ShoppingCart', () => {
  let cart;
  
  beforeEach(() => {
    cart = new ShoppingCart();
  });
  
  test('addItem increases item count and total', () => {
    const item = { id: 1, name: 'Widget', price: 10.99 };
    
    cart.addItem(item);
    
    expect(cart.itemCount).toBe(1);
    expect(cart.total).toBe(10.99);
    expect(cart.items).toContain(item);
  });
  
  test('removeItem decreases item count and total', () => {
    const item1 = { id: 1, name: 'Widget', price: 10.99 };
    const item2 = { id: 2, name: 'Gadget', price: 15.50 };
    
    cart.addItem(item1);
    cart.addItem(item2);
    cart.removeItem(item1.id);
    
    expect(cart.itemCount).toBe(1);
    expect(cart.total).toBe(15.50);
    expect(cart.items).not.toContain(item1);
    expect(cart.items).toContain(item2);
  });
});
```

**Side Effect Verification**:
```javascript
describe('Logger', () => {
  let logger;
  let mockConsole;
  
  beforeEach(() => {
    mockConsole = {
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn()
    };
    
    logger = new Logger(mockConsole);
  });
  
  test('info logs message with timestamp', () => {
    const message = 'Test message';
    
    logger.info(message);
    
    expect(mockConsole.log).toHaveBeenCalledWith(
      expect.stringContaining(message)
    );
    expect(mockConsole.log).toHaveBeenCalledWith(
      expect.stringMatching(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
    );
  });
});
```

## Platform-Specific Unit Testing

### JavaScript/TypeScript Unit Testing

**Jest Configuration**:
```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'node', // or 'jsdom' for browser-like environment
  collectCoverageFrom: [
    'src/**/*.{js,ts}',
    '!src/**/*.d.ts',
    '!src/**/*.test.{js,ts}'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts']
};
```

**React Component Testing**:
```javascript
import { render, screen, fireEvent } from '@testing-library/react';
import { UserProfile } from './UserProfile';

describe('UserProfile Component', () => {
  const mockUser = {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    avatar: 'https://example.com/avatar.jpg'
  };
  
  test('renders user information correctly', () => {
    render(<UserProfile user={mockUser} />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
    expect(screen.getByAltText('User avatar')).toHaveAttribute(
      'src', 
      'https://example.com/avatar.jpg'
    );
  });
  
  test('calls onEdit when edit button is clicked', () => {
    const mockOnEdit = jest.fn();
    
    render(<UserProfile user={mockUser} onEdit={mockOnEdit} />);
    
    fireEvent.click(screen.getByRole('button', { name: /edit/i }));
    
    expect(mockOnEdit).toHaveBeenCalledWith(mockUser);
  });
});
```

### Python Unit Testing

**pytest Configuration**:
```python
# pytest.ini
[tool:pytest]
testpaths = tests
python_files = test_*.py *_test.py
python_classes = Test*
python_functions = test_*
addopts = --cov=src --cov-report=html --cov-report=term-missing
```

**Python Unit Test Example**:
```python
import pytest
from unittest.mock import Mock, patch
from src.user_service import UserService
from src.exceptions import ValidationError

class TestUserService:
    def setup_method(self):
        self.mock_db = Mock()
        self.mock_email_service = Mock()
        self.user_service = UserService(self.mock_db, self.mock_email_service)
    
    def test_create_user_with_valid_data(self):
        # Arrange
        user_data = {
            'email': 'user@example.com',
            'name': 'John Doe',
            'age': 30
        }
        expected_user = {'id': 1, **user_data}
        self.mock_db.save.return_value = expected_user
        
        # Act
        result = self.user_service.create_user(user_data)
        
        # Assert
        assert result == expected_user
        self.mock_db.save.assert_called_once_with(user_data)
        self.mock_email_service.send_welcome_email.assert_called_once_with(expected_user)
    
    def test_create_user_with_invalid_email_raises_error(self):
        # Arrange
        invalid_user_data = {
            'email': 'not-an-email',
            'name': 'John Doe'
        }
        
        # Act & Assert
        with pytest.raises(ValidationError, match="Invalid email format"):
            self.user_service.create_user(invalid_user_data)
    
    @patch('src.user_service.datetime')
    def test_create_user_sets_created_at_timestamp(self, mock_datetime):
        # Arrange
        mock_now = Mock()
        mock_datetime.now.return_value = mock_now
        user_data = {'email': 'user@example.com', 'name': 'John Doe'}
        
        # Act
        self.user_service.create_user(user_data)
        
        # Assert
        self.mock_db.save.assert_called_once()
        saved_data = self.mock_db.save.call_args[0][0]
        assert saved_data['created_at'] == mock_now
```

### Java Unit Testing

**JUnit 5 Configuration**:
```xml
<!-- pom.xml -->
<dependency>
    <groupId>org.junit.jupiter</groupId>
    <artifactId>junit-jupiter</artifactId>
    <version>5.9.2</version>
    <scope>test</scope>
</dependency>
<dependency>
    <groupId>org.mockito</groupId>
    <artifactId>mockito-core</artifactId>
    <version>5.1.1</version>
    <scope>test</scope>
</dependency>
```

**Java Unit Test Example**:
```java
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class UserServiceTest {
    
    @Mock
    private UserRepository userRepository;
    
    @Mock
    private EmailService emailService;
    
    private UserService userService;
    
    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        userService = new UserService(userRepository, emailService);
    }
    
    @Test
    @DisplayName("Should create user with valid data")
    void shouldCreateUserWithValidData() {
        // Arrange
        UserData userData = new UserData("user@example.com", "John Doe", 30);
        User expectedUser = new User(1L, "user@example.com", "John Doe", 30);
        when(userRepository.save(any(User.class))).thenReturn(expectedUser);
        
        // Act
        User result = userService.createUser(userData);
        
        // Assert
        assertEquals(expectedUser.getId(), result.getId());
        assertEquals(expectedUser.getEmail(), result.getEmail());
        verify(userRepository).save(any(User.class));
        verify(emailService).sendWelcomeEmail(expectedUser);
    }
    
    @Test
    @DisplayName("Should throw exception for invalid email")
    void shouldThrowExceptionForInvalidEmail() {
        // Arrange
        UserData invalidUserData = new UserData("not-an-email", "John Doe", 30);
        
        // Act & Assert
        ValidationException exception = assertThrows(
            ValidationException.class,
            () -> userService.createUser(invalidUserData)
        );
        
        assertEquals("Invalid email format", exception.getMessage());
        verify(userRepository, never()).save(any(User.class));
    }
}
```

## Test Data Management

### Test Data Factories
```javascript
// Test data factory pattern
class UserFactory {
  static create(overrides = {}) {
    return {
      id: Math.floor(Math.random() * 1000000),
      email: 'user@example.com',
      name: 'Test User',
      age: 25,
      role: 'user',
      createdAt: new Date(),
      ...overrides
    };
  }
  
  static createAdmin(overrides = {}) {
    return this.create({
      role: 'admin',
      permissions: ['read', 'write', 'delete'],
      ...overrides
    });
  }
  
  static createWithInvalidEmail(overrides = {}) {
    return this.create({
      email: 'invalid-email',
      ...overrides
    });
  }
}

// Usage in tests
test('admin user can delete other users', () => {
  const admin = UserFactory.createAdmin();
  const regularUser = UserFactory.create();
  
  const result = userService.deleteUser(admin, regularUser.id);
  
  expect(result.success).toBe(true);
});
```

### Test Fixtures and Setup
```javascript
// Shared test setup and fixtures
describe('E-commerce System', () => {
  let testDatabase;
  let testProducts;
  let testUsers;
  
  beforeAll(async () => {
    // Setup test database
    testDatabase = await createTestDatabase();
  });
  
  beforeEach(async () => {
    // Reset database state
    await testDatabase.clear();
    
    // Seed with test data
    testProducts = await seedProducts([
      { name: 'Widget', price: 10.99, stock: 100 },
      { name: 'Gadget', price: 15.50, stock: 50 }
    ]);
    
    testUsers = await seedUsers([
      UserFactory.create({ email: 'customer@example.com' }),
      UserFactory.createAdmin({ email: 'admin@example.com' })
    ]);
  });
  
  afterAll(async () => {
    await testDatabase.close();
  });
});
```

## Coverage and Quality Metrics

### Coverage Configuration
```javascript
// Coverage thresholds
module.exports = {
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    },
    './src/core/': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90
    }
  }
};
```

### Quality Gates
```markdown
**Pre-Commit Quality Gates**:
- [ ] All unit tests pass
- [ ] Code coverage meets minimum thresholds
- [ ] No linting errors or warnings
- [ ] No security vulnerabilities in dependencies

**Pre-Merge Quality Gates**:
- [ ] All tests pass including integration tests
- [ ] Coverage reports show no regression
- [ ] Performance tests pass (if applicable)
- [ ] Code review completed and approved
```

## Dry-Run Unit Testing Strategy

When generating abbreviated unit testing strategy for dry-run mode:

```markdown
## Unit Testing Strategy (Dry-Run)

### Core Testing Approach
- **Framework**: [Jest/pytest/JUnit] based on technology stack
- **Coverage Target**: 80% for business logic, 100% for critical functions
- **Test Organization**: Co-located with source files using [naming convention]
- **Mocking Strategy**: Mock external dependencies, test real business logic

### Key Testing Areas
- [ ] Business logic functions with happy path and edge cases
- [ ] Error handling and validation logic
- [ ] State management and data transformations
- [ ] API integration points (with mocked external services)
- [ ] Component interactions and side effects

### Test Categories
1. **Happy Path Tests**: Normal operation with valid inputs
2. **Edge Case Tests**: Boundary conditions and unusual inputs
3. **Error Condition Tests**: Invalid inputs and error scenarios
4. **Integration Tests**: Component interactions with mocked dependencies

### Quality Gates
- Unit test coverage > 80% for all business logic
- All tests pass in CI/CD pipeline
- No flaky or intermittent test failures
- Test execution time < 30 seconds for full suite

### Estimated Effort
- **Test Setup and Configuration**: [X] hours
- **Core Business Logic Tests**: [Y] hours
- **Error Handling and Edge Case Tests**: [Z] hours
- **Integration and Mock Setup**: [W] hours
- **Total Unit Testing Effort**: [Total] hours
```

---

**Unit Testing Best Practices**:
1. Write tests that focus on behavior, not implementation details
2. Use descriptive test names that explain what is being tested
3. Keep tests simple, focused, and independent
4. Use the AAA pattern (Arrange, Act, Assert) for clear test structure
5. Mock external dependencies but test real business logic
6. Include both positive and negative test cases
7. Maintain test code quality with the same standards as production code
8. Run tests frequently and fix failures immediately