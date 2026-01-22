# Coding Standards Template

## Purpose
This template provides comprehensive coding standards and best practices for development, ensuring code quality, consistency, and maintainability across the project.

## Instructions
1. **Adhere to Style Guides**: Follow language-specific style guides (e.g., Airbnb for JavaScript/React)
2. **Implement Static Analysis**: Use linters and formatters (ESLint, Prettier)
3. **Write Self-Documenting Code**: Use descriptive naming and JSDoc/TSDoc comments
4. **Follow SOLID Principles**: Apply object-oriented design principles
5. **Practice Defensive Programming**: Handle inputs and edge cases robustly
6. **Maintain Testability**: Write code that is easy to test

## Context
Consistent coding standards are essential for team collaboration and long-term project maintenance. This template covers naming conventions, code structure, error handling, and documentation practices.

## Examples

### Example 1: Type Safety and Documentation
```typescript
/**
 * Processes a user payment with retry logic.
 *
 * @param {string} userId - The ID of the user
 * @param {number} amount - The payment amount in cents
 * @param {PaymentOptions} options - Additional payment options
 * @returns {Promise<PaymentResult>} The result of the payment operation
 * @throws {PaymentError} If payment fails after retries
 */
async function processPayment(
  userId: string,
  amount: number,
  options: PaymentOptions = {}
): Promise<PaymentResult> {
  // Validate inputs
  if (amount <= 0) {
    throw new ValidationError('Payment amount must be positive');
  }

  // Implementation...
}
```

### Example 2: Clean Code Principles
```typescript
// BAD: Unclear naming and rigid dependencies
function proc(d) {
  const db = new Database(); // Tight coupling
  return db.save(d);
}

// GOOD: Dependency injection and descriptive naming
interface DataRepository {
  save(data: unknown): Promise<void>;
}

class DataProcessor {
  constructor(private readonly repository: DataRepository) {}

  async processData(data: ProcessableData): Promise<void> {
    await this.repository.save(data);
  }
}
```

## Implementation Patterns

### Static Analysis Configuration

```javascript
// .eslintrc.js
module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier'
  ],
  rules: {
    'complexity': ['error', 10],
    'max-depth': ['error', 4],
    'no-console': 'warn',
    '@typescript-eslint/explicit-function-return-type': 'error'
  }
};
```

### Clean Architecture Layers

```typescript
// Domain Layer
interface User {
  id: string;
  email: string;
}

// Application Layer
class UserUseCase {
  constructor(private userRepo: UserRepository) {}
  
  async getUser(id: string): Promise<User> {
    return this.userRepo.findById(id);
  }
}

// Infrastructure Layer
class PostgresUserRepository implements UserRepository {
  async findById(id: string): Promise<User> {
    // Database logic
  }
}
```
