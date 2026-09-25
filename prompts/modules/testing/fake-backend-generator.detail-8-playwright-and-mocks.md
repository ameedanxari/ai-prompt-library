### Playwright Integration

#### Playwright Global Setup (playwright.global-setup.ts)
```typescript
// playwright.global-setup.ts

import { spawn, ChildProcess } from 'child_process';
import { FullConfig } from '@playwright/test';

let serverProcess: ChildProcess | null = null;

async function waitForServer(url: string, maxRetries = 30): Promise<void> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      // Not ready yet
    }
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  throw new Error(`Server at ${url} failed to start`);
}

async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting fake backend for E2E tests...');
  
  serverProcess = spawn('node', ['fake-backend/server.js'], {
    env: { ...process.env, FAKE_BACKEND_PORT: '3001' },
    stdio: 'pipe',
    detached: false
  });
  
  // Store PID for teardown
  process.env.FAKE_BACKEND_PID = String(serverProcess.pid);
  
  await waitForServer('http://localhost:3001/health');
  console.log('✅ Fake backend ready for E2E tests');
}

export default globalSetup;
```

#### Playwright Global Teardown (playwright.global-teardown.ts)
```typescript
// playwright.global-teardown.ts

import { FullConfig } from '@playwright/test';

async function globalTeardown(config: FullConfig) {
  const pid = process.env.FAKE_BACKEND_PID;
  
  if (pid) {
    console.log('🛑 Stopping fake backend...');
    try {
      process.kill(parseInt(pid), 'SIGTERM');
    } catch (error) {
      // Process may have already exited
    }
  }
}

export default globalTeardown;
```

#### Playwright Configuration (playwright.config.ts)
```typescript
// playwright.config.ts

import { defineConfig } from '@playwright/test';

export default defineConfig({
  globalSetup: './playwright.global-setup.ts',
  globalTeardown: './playwright.global-teardown.ts',
  
  use: {
    baseURL: 'http://localhost:3000',
    extraHTTPHeaders: {
      // Default to success scenario
      'X-Mock-Scenario': 'success'
    }
  },
  
  webServer: [
    {
      command: 'npm run dev',
      url: 'http://localhost:3000',
      reuseExistingServer: !process.env.CI
    }
  ],
  
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' }
    }
  ]
});
```

### Eliminating Network Mocks

#### Before: Test with Network Mocks
```typescript
// ❌ Old approach with network mocks
import { rest } from 'msw';
import { setupServer } from 'msw/node';

const server = setupServer(
  rest.get('/api/v1/users', (req, res, ctx) => {
    return res(ctx.json({ users: [{ id: 1, name: 'John' }] }));
  }),
  rest.get('/api/v1/users/:id', (req, res, ctx) => {
    return res(ctx.json({ id: req.params.id, name: 'John' }));
  }),
  // ... many more handlers
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

test('fetches users', async () => {
  const users = await fetchUsers();
  expect(users).toHaveLength(1);
});
```

#### After: Test with Fake Backend
```typescript
// ✅ New approach with fake backend
// No mock setup needed - fake backend handles everything

test('fetches users', async () => {
  // Uses real HTTP calls to fake backend
  const users = await fetchUsers();
  expect(users).toHaveLength(2); // Uses centralized mock data
});

test('handles not found error', async () => {
  // Set scenario via header in API client
  process.env.MOCK_SCENARIO = 'not_found';
  
  await expect(fetchUser('invalid-id')).rejects.toThrow('User not found');
});

test('handles server error', async () => {
  process.env.MOCK_SCENARIO = 'server_error';
  
  await expect(fetchUsers()).rejects.toThrow('Server error');
});
```

#### API Client for Tests (test-utils/api-client.ts)
```typescript
// test-utils/api-client.ts

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const scenario = process.env.MOCK_SCENARIO || 'success';
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-Mock-Scenario': scenario,
      ...options.headers
    }
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `HTTP ${response.status}`);
  }
  
  return response.json();
}

// Convenience functions
export const fetchUsers = () => apiRequest<User[]>('/api/v1/users');
export const fetchUser = (id: string) => apiRequest<User>(`/api/v1/users/${id}`);
export const createUser = (data: CreateUserData) => 
  apiRequest<User>('/api/v1/users', { method: 'POST', body: JSON.stringify(data) });
```

