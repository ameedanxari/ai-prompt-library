### Test Helper Utilities

#### Scenario Helper (test-utils/scenarios.ts)
```typescript
// test-utils/scenarios.ts

export type MockScenario = 
  | 'success'
  | 'empty'
  | 'validation_error'
  | 'unauthorized'
  | 'forbidden'
  | 'not_found'
  | 'conflict'
  | 'rate_limited'
  | 'server_error'
  | 'timeout'
  | 'slow';

/**
 * Set the mock scenario for subsequent API calls
 */
export function setScenario(scenario: MockScenario): void {
  process.env.MOCK_SCENARIO = scenario;
}

/**
 * Reset to default success scenario
 */
export function resetScenario(): void {
  delete process.env.MOCK_SCENARIO;
}

/**
 * Run a test with a specific scenario
 */
export async function withScenario<T>(
  scenario: MockScenario,
  fn: () => Promise<T>
): Promise<T> {
  setScenario(scenario);
  try {
    return await fn();
  } finally {
    resetScenario();
  }
}

// Usage example:
// await withScenario('not_found', async () => {
//   await expect(fetchUser('123')).rejects.toThrow();
// });
```

#### Integration Test Example
```typescript
// tests/integration/users.test.ts

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { fetchUsers, fetchUser, createUser } from '../test-utils/api-client';
import { setScenario, resetScenario, withScenario } from '../test-utils/scenarios';

describe('Users API Integration', () => {
  afterEach(() => {
    resetScenario();
  });

  describe('GET /api/v1/users', () => {
    it('returns list of users', async () => {
      const users = await fetchUsers();
      
      expect(users).toBeInstanceOf(Array);
      expect(users.length).toBeGreaterThan(0);
      expect(users[0]).toHaveProperty('id');
      expect(users[0]).toHaveProperty('email');
    });

    it('returns empty list when no users', async () => {
      setScenario('empty');
      
      const users = await fetchUsers();
      
      expect(users).toEqual([]);
    });

    it('handles unauthorized error', async () => {
      setScenario('unauthorized');
      
      await expect(fetchUsers()).rejects.toThrow('Unauthorized');
    });

    it('handles server error', async () => {
      setScenario('server_error');
      
      await expect(fetchUsers()).rejects.toThrow();
    });
  });

  describe('GET /api/v1/users/:id', () => {
    it('returns user by id', async () => {
      const user = await fetchUser('user-001');
      
      expect(user).toHaveProperty('id');
      expect(user).toHaveProperty('email');
      expect(user).toHaveProperty('name');
    });

    it('handles not found error', async () => {
      await withScenario('not_found', async () => {
        await expect(fetchUser('invalid-id')).rejects.toThrow('not found');
      });
    });
  });

  describe('POST /api/v1/users', () => {
    it('creates new user', async () => {
      const newUser = await createUser({
        email: 'test@example.com',
        name: 'Test User'
      });
      
      expect(newUser).toHaveProperty('id');
      expect(newUser.email).toBe('test@example.com');
    });

    it('handles validation error', async () => {
      setScenario('validation_error');
      
      await expect(createUser({
        email: 'invalid',
        name: ''
      })).rejects.toThrow('validation');
    });

    it('handles conflict error', async () => {
      setScenario('conflict');
      
      await expect(createUser({
        email: 'existing@example.com',
        name: 'Existing User'
      })).rejects.toThrow('conflict');
    });
  });
});
```

### CI/CD Integration

#### GitHub Actions Workflow (.github/workflows/test.yml)
```yaml
name: Integration Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Start fake backend
        run: |
          npm run fake-backend:start &
          npx wait-on http://localhost:3001/health --timeout 30000
      
      - name: Run integration tests
        run: npm run test:integration
        env:
          API_BASE_URL: http://localhost:3001
      
      - name: Stop fake backend
        if: always()
        run: npm run fake-backend:stop || true
```

#### Package.json Scripts
```json
{
  "scripts": {
    "fake-backend:start": "node scripts/start-fake-backend.js",
    "fake-backend:stop": "node scripts/stop-fake-backend.js",
    "fake-backend:generate-routes": "node fake-backend/generate-routes.js",
    "test": "vitest run",
    "test:integration": "vitest run --config vitest.integration.config.ts",
    "test:e2e": "playwright test",
    "test:all": "npm run test && npm run test:integration && npm run test:e2e"
  }
}
```
