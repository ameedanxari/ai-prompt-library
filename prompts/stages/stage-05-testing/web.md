# Stage 05 - Testing: Web Platform Strategy

## Purpose
Define web-specific testing strategies, tools, and approaches that complement the platform-agnostic testing framework with web-focused validation.

## Instructions
Use this stage to implement comprehensive web testing strategies including frontend unit tests, API integration tests, end-to-end user workflows, performance testing, accessibility validation, and security testing. Configure Jest for unit testing, Playwright or Cypress for E2E testing, and integrate Lighthouse for performance monitoring. Set up automated accessibility testing with axe-core and implement cross-browser testing across Chrome, Firefox, and Safari. Ensure all tests run in CI/CD pipeline with appropriate coverage thresholds and quality gates.

## Examples

### Complete Testing Setup
```javascript
// jest.config.js - Unit testing configuration
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.js'],
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};

// Component testing example
import { render, screen, fireEvent } from '@testing-library/react';
import { TaskForm } from './TaskForm';

test('should submit valid task data', async () => {
  const mockOnSubmit = jest.fn();
  render(<TaskForm onSubmit={mockOnSubmit} />);
  
  fireEvent.change(screen.getByLabelText('Task Description'), {
    target: { value: 'New task' }
  });
  fireEvent.click(screen.getByRole('button', { name: 'Add Task' }));
  
  expect(mockOnSubmit).toHaveBeenCalledWith({
    description: 'New task',
    completed: false
  });
});
```

### E2E Testing Implementation
```javascript
// playwright.config.js - E2E testing configuration
module.exports = {
  testDir: './tests/e2e',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
};

// E2E test example
import { test, expect } from '@playwright/test';

test('should complete full task lifecycle', async ({ page }) => {
  await page.goto('/');
  
  // Add task
  await page.fill('[data-testid="task-input"]', 'E2E test task');
  await page.click('[data-testid="add-task-button"]');
  
  // Verify task appears
  await expect(page.locator('[data-testid="task-list"]'))
    .toContainText('E2E test task');
  
  // Complete task
  await page.click('[data-testid="task-checkbox"]');
  await expect(page.locator('[data-testid="completed-tasks"]'))
    .toContainText('E2E test task');
});
```

### Performance and Accessibility Testing
```javascript
// Lighthouse CI configuration
module.exports = {
  ci: {
    collect: {
      url: ['http://localhost:3000'],
      numberOfRuns: 3,
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
      },
    },
  },
};

// Accessibility testing with axe-core
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

test('should not have accessibility violations', async () => {
  const { container } = render(<TaskList tasks={mockTasks} />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

## Web Testing Framework

### Web-Specific Testing Categories
```markdown
## Web Testing Specializations

### 1. Frontend Unit Testing
**Framework**: Jest + React Testing Library / Vitest + Vue Test Utils
**Scope**: Components, hooks, utilities, state management
**Coverage Target**: 90%+ for UI logic

#### Component Testing
```javascript
// Example React component test
import { render, screen, fireEvent } from '@testing-library/react';
import { TaskForm } from './TaskForm';

describe('TaskForm Component', () => {
  it('should submit valid task data', async () => {
    const mockOnSubmit = jest.fn();
    render(<TaskForm onSubmit={mockOnSubmit} />);
    
    const input = screen.getByLabelText('Task Description');
    const submitButton = screen.getByRole('button', { name: 'Add Task' });
    
    fireEvent.change(input, { target: { value: 'New task' } });
    fireEvent.click(submitButton);
    
    expect(mockOnSubmit).toHaveBeenCalledWith({
      description: 'New task',
      completed: false
    });
  });
  
  it('should prevent submission of empty tasks', () => {
    const mockOnSubmit = jest.fn();
    render(<TaskForm onSubmit={mockOnSubmit} />);
    
    const submitButton = screen.getByRole('button', { name: 'Add Task' });
    fireEvent.click(submitButton);
    
    expect(mockOnSubmit).not.toHaveBeenCalled();
    expect(screen.getByText('Task description is required')).toBeInTheDocument();
  });
});
```

#### State Management Testing
```javascript
// Example Redux/Zustand store testing
import { configureStore } from '@reduxjs/toolkit';
import { tasksSlice, addTask, toggleTask } from './tasksSlice';

describe('Tasks Store', () => {
  let store;
  
  beforeEach(() => {
    store = configureStore({
      reducer: { tasks: tasksSlice.reducer }
    });
  });
  
  it('should add new tasks', () => {
    const task = { id: '1', description: 'Test task', completed: false };
    
    store.dispatch(addTask(task));
    
    const state = store.getState();
    expect(state.tasks.items).toContain(task);
  });
  
  it('should toggle task completion', () => {
    const task = { id: '1', description: 'Test task', completed: false };
    store.dispatch(addTask(task));
    
    store.dispatch(toggleTask('1'));
    
    const state = store.getState();
    expect(state.tasks.items[0].completed).toBe(true);
  });
});
```

### 2. API Integration Testing
**Framework**: Supertest + MSW (Mock Service Worker) + Fake Backend
**Scope**: REST APIs, GraphQL endpoints, WebSocket connections
**Coverage Target**: All API endpoints

#### Centralized Mock Data for Web Testing

Web tests should use centralized mock data for consistency with other platforms:

**Mock Data Import Pattern:**
```javascript
// Import centralized mock data
import userListSuccess from '@mocks/api/v1/users/GET/200-success.json';
import userListEmpty from '@mocks/api/v1/users/GET/200-success-empty.json';
import userCreateSuccess from '@mocks/api/v1/users/POST/201-created.json';
import validationError from '@mocks/api/v1/users/POST/400-validation-error.json';

// Use in MSW handlers
import { rest } from 'msw';
import { setupServer } from 'msw/node';

const handlers = [
  rest.get('/api/v1/users', (req, res, ctx) => {
    const scenario = req.headers.get('X-Mock-Scenario') || 'success';
    const mockData = scenario === 'empty' ? userListEmpty : userListSuccess;
    return res(ctx.json(mockData));
  }),
  rest.post('/api/v1/users', (req, res, ctx) => {
    const scenario = req.headers.get('X-Mock-Scenario') || 'success';
    if (scenario === 'validation_error') {
      return res(ctx.status(400), ctx.json(validationError));
    }
    return res(ctx.status(201), ctx.json(userCreateSuccess));
  })
];

export const server = setupServer(...handlers);
```

**Reference Module:** `#[[module:testing/centralized-mock-data.md]]`

#### Fake Backend Integration for Web

For more realistic integration testing, use the fake backend approach instead of network mocks:

**Fake Backend Setup:**
```javascript
// jest.setup.js
const { startFakeBackend, stopFakeBackend } = require('./fake-backend/spawn');

beforeAll(async () => {
  await startFakeBackend({ port: 3001 });
});

afterAll(async () => {
  await stopFakeBackend();
});

// Configure API client to use fake backend
process.env.API_BASE_URL = 'http://localhost:3001';
```

**Integration Test with Fake Backend:**
```javascript
describe('User API Integration with Fake Backend', () => {
  it('should fetch users from fake backend', async () => {
    const response = await fetch('http://localhost:3001/api/v1/users');
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data.data).toBeInstanceOf(Array);
  });
  
  it('should handle error scenarios via scenario header', async () => {
    const response = await fetch('http://localhost:3001/api/v1/users', {
      headers: { 'X-Mock-Scenario': 'server_error' }
    });
    
    expect(response.status).toBe(500);
    expect((await response.json()).error.code).toBe('SERVER_ERROR');
  });
  
  it('should simulate slow responses', async () => {
    const startTime = Date.now();
    const response = await fetch('http://localhost:3001/api/v1/users', {
      headers: { 'X-Mock-Scenario': 'slow' }
    });
    const elapsed = Date.now() - startTime;
    
    expect(response.status).toBe(200);
    expect(elapsed).toBeGreaterThanOrEqual(2900); // ~3 second delay
  });
});
```

**Reference Module:** `#[[module:testing/fake-backend-generator.md]]`

#### REST API Testing
```javascript
// Example API integration test
import request from 'supertest';
import { app } from '../app';
import { setupTestDatabase, cleanupTestDatabase } from '../test-utils';

describe('Tasks API', () => {
  beforeAll(async () => {
    await setupTestDatabase();
  });
  
  afterAll(async () => {
    await cleanupTestDatabase();
  });
  
  describe('POST /api/tasks', () => {
    it('should create a new task', async () => {
      const taskData = {
        description: 'Test task',
        priority: 'high'
      };
      
      const response = await request(app)
        .post('/api/tasks')
        .send(taskData)
        .expect(201);
      
      expect(response.body).toMatchObject({
        id: expect.any(String),
        description: 'Test task',
        priority: 'high',
        completed: false,
        createdAt: expect.any(String)
      });
    });
    
    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .send({})
        .expect(400);
      
      expect(response.body.errors).toContain('Description is required');
    });
  });
});
```

#### GraphQL Testing
```javascript
// Example GraphQL testing
import { createTestClient } from 'apollo-server-testing';
import { server } from '../graphql/server';
import { CREATE_TASK, GET_TASKS } from '../graphql/queries';

describe('GraphQL Tasks', () => {
  const { query, mutate } = createTestClient(server);
  
  it('should create a task via GraphQL', async () => {
    const result = await mutate({
      mutation: CREATE_TASK,
      variables: {
        input: {
          description: 'GraphQL test task',
          priority: 'medium'
        }
      }
    });
    
    expect(result.data.createTask).toMatchObject({
      id: expect.any(String),
      description: 'GraphQL test task',
      priority: 'medium'
    });
  });
});
```

### 3. End-to-End Web Testing
**Framework**: Playwright / Cypress
**Scope**: User workflows, cross-browser compatibility, responsive design
**Coverage Target**: Critical user journeys

#### User Workflow Testing
```javascript
// Example Playwright E2E test
import { test, expect } from '@playwright/test';

test.describe('Task Management Workflow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });
  
  test('should complete full task lifecycle', async ({ page }) => {
    // Add a new task
    await page.fill('[data-testid="task-input"]', 'E2E test task');
    await page.click('[data-testid="add-task-button"]');
    
    // Verify task appears in list
    await expect(page.locator('[data-testid="task-list"]')).toContainText('E2E test task');
    
    // Mark task as complete
    await page.click('[data-testid="task-checkbox"]:has-text("E2E test task")');
    
    // Verify task is marked complete
    await expect(page.locator('[data-testid="completed-tasks"]')).toContainText('E2E test task');
    
    // Delete task
    await page.click('[data-testid="delete-task"]:has-text("E2E test task")');
    
    // Verify task is removed
    await expect(page.locator('[data-testid="task-list"]')).not.toContainText('E2E test task');
  });
  
  test('should handle offline scenarios', async ({ page, context }) => {
    // Add task while online
    await page.fill('[data-testid="task-input"]', 'Offline test task');
    await page.click('[data-testid="add-task-button"]');
    
    // Go offline
    await context.setOffline(true);
    
    // Try to add another task
    await page.fill('[data-testid="task-input"]', 'Offline task 2');
    await page.click('[data-testid="add-task-button"]');
    
    // Verify offline indicator
    await expect(page.locator('[data-testid="offline-indicator"]')).toBeVisible();
    
    // Go back online
    await context.setOffline(false);
    
    // Verify sync occurs
    await expect(page.locator('[data-testid="task-list"]')).toContainText('Offline task 2');
  });
});
```

#### Cross-Browser Testing
```javascript
// Example cross-browser test configuration
import { devices } from '@playwright/test';

const config = {
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 12'] },
    },
  ],
};
```
```

### Web Performance Testing
```markdown
## Performance Testing Strategy

### 1. Core Web Vitals Testing
**Tools**: Lighthouse, WebPageTest, Chrome DevTools
**Metrics**: LCP, FID, CLS, TTFB, FCP
**Targets**: 
- LCP < 2.5s
- FID < 100ms
- CLS < 0.1

#### Automated Performance Testing
```javascript
// Example Lighthouse CI configuration
module.exports = {
  ci: {
    collect: {
      url: ['http://localhost:3000'],
      numberOfRuns: 3,
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.9 }],
      },
    },
    upload: {
      target: 'lhci',
      serverBaseUrl: 'https://your-lhci-server.com',
    },
  },
};
```

### 2. Load Testing
**Tools**: Artillery, k6, JMeter
**Scope**: API endpoints, WebSocket connections, static assets
**Scenarios**: Normal load, peak load, stress testing

#### API Load Testing
```javascript
// Example k6 load test
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '2m', target: 100 }, // Ramp up
    { duration: '5m', target: 100 }, // Stay at 100 users
    { duration: '2m', target: 200 }, // Ramp up to 200 users
    { duration: '5m', target: 200 }, // Stay at 200 users
    { duration: '2m', target: 0 },   // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests under 500ms
    http_req_failed: ['rate<0.1'],    // Error rate under 10%
  },
};

export default function () {
  const response = http.get('https://api.example.com/tasks');
  
  check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });
  
  sleep(1);
}
```

### 3. Bundle Analysis
**Tools**: webpack-bundle-analyzer, source-map-explorer
**Metrics**: Bundle size, code splitting effectiveness, unused code
**Targets**: Initial bundle < 200KB, lazy loading implemented

#### Bundle Size Monitoring
```javascript
// Example bundle analysis in CI
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

module.exports = {
  plugins: [
    new BundleAnalyzerPlugin({
      analyzerMode: process.env.CI ? 'json' : 'server',
      generateStatsFile: true,
      statsOptions: { source: false },
    }),
  ],
  performance: {
    maxAssetSize: 250000,
    maxEntrypointSize: 250000,
    hints: 'error',
  },
};
```
```

### Web Accessibility Testing
```markdown
## Accessibility Testing Framework

### 1. Automated Accessibility Testing
**Tools**: axe-core, Pa11y, Lighthouse
**Standards**: WCAG 2.1 AA compliance
**Integration**: CI/CD pipeline, development workflow

#### Automated Testing Setup
```javascript
// Example axe-core integration
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

describe('Accessibility Tests', () => {
  it('should not have accessibility violations', async () => {
    const { container } = render(<TaskList tasks={mockTasks} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

// Example Playwright accessibility test
test('should pass accessibility audit', async ({ page }) => {
  await page.goto('/');
  
  const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
  
  expect(accessibilityScanResults.violations).toEqual([]);
});
```

### 2. Manual Accessibility Testing
**Tools**: Screen readers (NVDA, JAWS, VoiceOver), keyboard navigation
**Scope**: Complex interactions, dynamic content, form validation
**Process**: Regular manual testing sessions

#### Accessibility Testing Checklist
- [ ] **Keyboard Navigation**: All interactive elements accessible via keyboard
- [ ] **Screen Reader**: Content properly announced by screen readers
- [ ] **Focus Management**: Logical focus order and visible focus indicators
- [ ] **Color Contrast**: Sufficient contrast ratios (4.5:1 for normal text)
- [ ] **Alternative Text**: Images have appropriate alt text
- [ ] **Form Labels**: All form inputs have associated labels
- [ ] **Headings**: Proper heading hierarchy (h1-h6)
- [ ] **ARIA**: Appropriate ARIA labels and roles for complex components

### 3. Responsive Design Testing
**Tools**: Browser DevTools, BrowserStack, Playwright device emulation
**Scope**: Multiple screen sizes, orientations, touch interactions
**Breakpoints**: Mobile (320px+), Tablet (768px+), Desktop (1024px+)

#### Responsive Testing
```javascript
// Example responsive design tests
test.describe('Responsive Design', () => {
  const viewports = [
    { name: 'mobile', width: 375, height: 667 },
    { name: 'tablet', width: 768, height: 1024 },
    { name: 'desktop', width: 1920, height: 1080 },
  ];
  
  viewports.forEach(({ name, width, height }) => {
    test(`should display correctly on ${name}`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      await page.goto('/');
      
      // Take screenshot for visual regression testing
      await expect(page).toHaveScreenshot(`${name}-homepage.png`);
      
      // Test responsive navigation
      if (width < 768) {
        await expect(page.locator('[data-testid="mobile-menu-button"]')).toBeVisible();
      } else {
        await expect(page.locator('[data-testid="desktop-navigation"]')).toBeVisible();
      }
    });
  });
});
```
```

### Web Security Testing
```markdown
## Security Testing Framework

### 1. Client-Side Security
**Focus**: XSS prevention, CSRF protection, secure storage
**Tools**: ESLint security plugins, Snyk, OWASP ZAP
**Scope**: Input validation, authentication, data handling

#### Security Testing Examples
```javascript
// Example XSS prevention test
test('should prevent XSS attacks', async ({ page }) => {
  const maliciousScript = '<script>alert("XSS")</script>';
  
  await page.fill('[data-testid="task-input"]', maliciousScript);
  await page.click('[data-testid="add-task-button"]');
  
  // Verify script is not executed
  const taskText = await page.textContent('[data-testid="task-list"] li:last-child');
  expect(taskText).toBe(maliciousScript); // Should be displayed as text, not executed
  
  // Verify no alert dialog appeared
  page.on('dialog', () => {
    throw new Error('XSS vulnerability detected: script was executed');
  });
});

// Example CSRF protection test
test('should require CSRF token for state-changing operations', async () => {
  const response = await fetch('/api/tasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ description: 'Test task' }),
    // Intentionally omitting CSRF token
  });
  
  expect(response.status).toBe(403);
  expect(await response.json()).toMatchObject({
    error: 'CSRF token required'
  });
});
```

### 2. Authentication and Authorization Testing
**Scope**: Login flows, session management, role-based access
**Tools**: Custom test utilities, JWT validation
**Coverage**: All protected routes and operations

#### Auth Testing Examples
```javascript
// Example authentication flow test
test('should handle complete authentication flow', async ({ page }) => {
  // Test login
  await page.goto('/login');
  await page.fill('[data-testid="email-input"]', 'test@example.com');
  await page.fill('[data-testid="password-input"]', 'password123');
  await page.click('[data-testid="login-button"]');
  
  // Verify redirect to dashboard
  await expect(page).toHaveURL('/dashboard');
  
  // Verify authenticated state
  await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
  
  // Test logout
  await page.click('[data-testid="user-menu"]');
  await page.click('[data-testid="logout-button"]');
  
  // Verify redirect to login
  await expect(page).toHaveURL('/login');
});

// Example authorization test
test('should enforce role-based access control', async ({ page }) => {
  // Login as regular user
  await loginAsUser(page, 'user@example.com');
  
  // Try to access admin page
  await page.goto('/admin');
  
  // Should be redirected or show access denied
  await expect(page).toHaveURL('/dashboard');
  await expect(page.locator('[data-testid="access-denied"]')).toBeVisible();
});
```
```

### Web Testing Tools and Configuration
```markdown
## Testing Tool Configuration

### Jest Configuration
```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.js'],
  moduleNameMapping: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2)$': '<rootDir>/__mocks__/fileMock.js',
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/index.js',
    '!src/serviceWorker.js',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
```

### Playwright Configuration
```javascript
// playwright.config.js
module.exports = {
  testDir: './tests/e2e',
  timeout: 30000,
  expect: {
    timeout: 5000,
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['junit', { outputFile: 'test-results/junit.xml' }],
  ],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
  webServer: {
    command: 'npm run start',
    port: 3000,
    reuseExistingServer: !process.env.CI,
  },
};
```

### Testing Utilities
```javascript
// test-utils.js - Custom testing utilities
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from '../store';

// Custom render function with providers
export function renderWithProviders(ui, options = {}) {
  const { initialEntries = ['/'], ...renderOptions } = options;
  
  function Wrapper({ children }) {
    return (
      <Provider store={store}>
        <BrowserRouter initialEntries={initialEntries}>
          {children}
        </BrowserRouter>
      </Provider>
    );
  }
  
  return render(ui, { wrapper: Wrapper, ...renderOptions });
}

// Mock API responses
export function mockApiResponse(endpoint, response) {
  return jest.spyOn(global, 'fetch').mockResolvedValue({
    ok: true,
    json: async () => response,
  });
}

// Test data factories
export function createMockTask(overrides = {}) {
  return {
    id: Math.random().toString(36),
    description: 'Test task',
    completed: false,
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}
```
```

This web-specific testing strategy ensures comprehensive validation of web applications while leveraging the best tools and practices for frontend, API, performance, accessibility, and security testing.