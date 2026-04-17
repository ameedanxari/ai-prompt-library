# Cross-Platform Parity Validation Test Generator

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
Generate comprehensive test suites that validate functional equivalence and consistent behavior across all target platforms in a cross-platform application.

## Integration Points

This template integrates with the following v2 templates for comprehensive domain testing:

### Domain-Specific Parity Testing
- **Commerce** (`commerce/*.md`): Product, cart, checkout, and payment parity
- **Social** (`social/*.md`): Messaging, feeds, and profile parity
- **Healthcare** (`healthcare/*.md`): HIPAA-compliant data handling parity
- **Fintech** (`fintech/*.md`): Transaction and account parity
- **Media Streaming** (`media-streaming/*.md`): Playback and streaming parity
- **Enterprise SaaS** (`enterprise-saas/*.md`): Multi-tenant feature parity
- **IoT** (`iot/*.md`): Device connectivity and data parity
- **Blockchain** (`blockchain/*.md`): Wallet and transaction parity

### Cross-Cutting Parity Testing
- **Security** (`security/*.md`): Authentication and authorization parity
- **Analytics** (`analytics/*.md`): Event tracking parity
- **Notifications** (`notifications/*.md`): Notification delivery parity
- **Search** (`search-discovery/*.md`): Search functionality parity
- **Real-Time** (`real-time-communication/*.md`): WebSocket and sync parity

## Context Variables
- `{{target_platforms}}` - List of target platforms (web, ios, android, desktop)
- `{{features_to_test}}` - List of features requiring parity validation
- `{{test_framework}}` - Testing framework to use (jest, cypress, detox, etc.)
- `{{project_name}}` - Name of the project for test organization
- `{{api_base_url}}` - Base URL for API testing

## Prompt Template

You are tasked with generating parity validation tests for {{project_name}}. These tests will ensure functional equivalence and consistent behavior across all target platforms.

### Target Platforms
{{#each target_platforms}}
- {{this}}
{{/each}}

### Features to Test
{{#each features_to_test}}
- {{this}}
{{/each}}

### Testing Framework: {{test_framework}}

## Instructions

### 1. Test Suite Structure

Create a comprehensive test suite with the following organization:

```
tests/
├── parity/
│   ├── shared/
│   │   ├── test-data.js          # Shared test data and fixtures
│   │   ├── assertions.js         # Common assertion helpers
│   │   └── utilities.js          # Shared test utilities
│   ├── api/
│   │   ├── endpoints.test.js     # API endpoint parity tests
│   │   ├── data-models.test.js   # Data model consistency tests
│   │   └── authentication.test.js # Auth flow parity tests
│   ├── ui/
│   │   ├── components.test.js    # UI component parity tests
│   │   ├── navigation.test.js    # Navigation consistency tests
│   │   └── interactions.test.js  # User interaction parity tests
│   ├── functionality/
│   │   ├── core-features.test.js # Core feature parity tests
│   │   ├── edge-cases.test.js    # Edge case handling tests
│   │   └── error-handling.test.js # Error handling consistency tests
│   └── platform-specific/
│       ├── web.test.js           # Web-specific validation tests
│       ├── ios.test.js           # iOS-specific validation tests
│       ├── android.test.js       # Android-specific validation tests
│       └── desktop.test.js       # Desktop-specific validation tests
```

### 2. API Parity Tests

Generate tests that validate API behavior consistency:

```javascript
describe('API Parity Tests', () => {
  const platforms = ['web', 'ios', 'android', 'desktop'];
  const testData = require('../shared/test-data');
  
  describe('Endpoint Response Consistency', () => {
    platforms.forEach(platform => {
      describe(`Platform: ${platform}`, () => {
        
        test('should return consistent data structure for GET requests', async () => {
          const response = await apiClient.get('/api/v1/users', {
            headers: { 'X-Platform': platform }
          });
          
          expect(response.status).toBe(200);
          expect(response.data).toMatchSchema(testData.schemas.user);
          expect(response.data.meta).toHaveProperty('timestamp');
          expect(response.data.meta).toHaveProperty('request_id');
        });
        
        test('should handle POST requests consistently', async () => {
          const userData = testData.validUser;
          const response = await apiClient.post('/api/v1/users', userData, {
            headers: { 'X-Platform': platform }
          });
          
          expect(response.status).toBe(201);
          expect(response.data.data).toMatchObject(userData);
          expect(response.data.data).toHaveProperty('id');
          expect(response.data.data).toHaveProperty('created_at');
        });
        
        test('should return consistent error responses', async () => {
          const response = await apiClient.post('/api/v1/users', {}, {
            headers: { 'X-Platform': platform },
            validateStatus: () => true
          });
          
          expect(response.status).toBe(400);
          expect(response.data).toHaveProperty('status', 'error');
          expect(response.data.error).toHaveProperty('code');
          expect(response.data.error).toHaveProperty('message');
        });
      });
    });
  });
  
  describe('Cross-Platform Data Synchronization', () => {
    test('should maintain data consistency across platforms', async () => {
      // Create data from one platform
      const createResponse = await apiClient.post('/api/v1/items', testData.validItem, {
        headers: { 'X-Platform': 'web' }
      });
      const itemId = createResponse.data.data.id;
      
      // Verify data is accessible from all platforms
      for (const platform of platforms) {
        const getResponse = await apiClient.get(`/api/v1/items/${itemId}`, {
          headers: { 'X-Platform': platform }
        });
        
        expect(getResponse.status).toBe(200);
        expect(getResponse.data.data).toMatchObject(testData.validItem);
      }
    });
  });
});
```

### 3. UI Component Parity Tests

Generate tests for UI component consistency:

```javascript
describe('UI Component Parity Tests', () => {
  const testScenarios = [
    { name: 'Login Form', selector: '[data-testid="login-form"]' },
    { name: 'Navigation Menu', selector: '[data-testid="nav-menu"]' },
    { name: 'User Profile', selector: '[data-testid="user-profile"]' }
  ];
  
  testScenarios.forEach(scenario => {
    describe(`${scenario.name} Component`, () => {
      
      test('should render with consistent structure', () => {
        // Platform-specific rendering logic
        const component = renderComponent(scenario.selector);
        
        expect(component).toBeVisible();
        expect(component).toHaveAccessibleName();
        expect(component).toMatchSnapshot(`${scenario.name}-structure`);
      });
      
      test('should handle user interactions consistently', async () => {
        const component = renderComponent(scenario.selector);
        
        // Test common interactions
        await userEvent.click(component);
        expect(component).toHaveAttribute('aria-pressed', 'true');
        
        await userEvent.keyboard('{Enter}');
        expect(component).toHaveFocus();
      });
      
      test('should display error states consistently', async () => {
        const component = renderComponent(scenario.selector, { 
          props: { error: 'Test error message' }
        });
        
        expect(component).toHaveAttribute('aria-invalid', 'true');
        expect(screen.getByRole('alert')).toHaveTextContent('Test error message');
      });
    });
  });
});
```

### 4. Functional Parity Tests

Generate tests for feature behavior consistency:

```javascript
describe('Functional Parity Tests', () => {
  
  describe('User Authentication Flow', () => {
    const authScenarios = [
      { method: 'email', credentials: testData.validEmailLogin },
      { method: 'social', credentials: testData.validSocialLogin }
    ];
    
    authScenarios.forEach(scenario => {
      test(`should authenticate via ${scenario.method} consistently across platforms`, async () => {
        // Test authentication flow
        const loginResult = await performLogin(scenario.credentials);
        
        expect(loginResult.success).toBe(true);
        expect(loginResult.token).toBeDefined();
        expect(loginResult.user).toMatchSchema(testData.schemas.user);
        
        // Verify token works across all platform endpoints
        const platforms = ['web', 'ios', 'android', 'desktop'];
        for (const platform of platforms) {
          const profileResponse = await apiClient.get('/api/v1/profile', {
            headers: { 
              'Authorization': `Bearer ${loginResult.token}`,
              'X-Platform': platform 
            }
          });
          
          expect(profileResponse.status).toBe(200);
          expect(profileResponse.data.data.id).toBe(loginResult.user.id);
        }
      });
    });
  });
  
  describe('Data CRUD Operations', () => {
    const crudOperations = ['create', 'read', 'update', 'delete'];
    
    crudOperations.forEach(operation => {
      test(`should perform ${operation} operations consistently`, async () => {
        const testEntity = testData.validEntity;
        let entityId;
        
        switch (operation) {
          case 'create':
            const createResult = await performCreate(testEntity);
            expect(createResult.success).toBe(true);
            expect(createResult.data).toMatchObject(testEntity);
            entityId = createResult.data.id;
            break;
            
          case 'read':
            const readResult = await performRead(entityId);
            expect(readResult.success).toBe(true);
            expect(readResult.data).toMatchObject(testEntity);
            break;
            
          case 'update':
            const updateData = { ...testEntity, name: 'Updated Name' };
            const updateResult = await performUpdate(entityId, updateData);
            expect(updateResult.success).toBe(true);
            expect(updateResult.data.name).toBe('Updated Name');
            break;
            
          case 'delete':
            const deleteResult = await performDelete(entityId);
            expect(deleteResult.success).toBe(true);
            
            // Verify deletion across platforms
            const verifyResult = await performRead(entityId);
            expect(verifyResult.success).toBe(false);
            expect(verifyResult.error.code).toBe('NOT_FOUND');
            break;
        }
      });
    });
  });
});
```

### 5. Platform-Specific Validation Tests

Generate tests for platform-specific behavior validation:

```javascript
describe('Platform-Specific Validation Tests', () => {
  
  describe('Web Platform Validation', () => {
    test('should handle browser-specific features correctly', async () => {
      // Test localStorage functionality
      const testData = { key: 'test', value: 'data' };
      await setLocalStorage(testData.key, testData.value);
      const retrieved = await getLocalStorage(testData.key);
      expect(retrieved).toBe(testData.value);
      
      // Test service worker functionality
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        expect(registration).toBeDefined();
      }
    });
  });
  
  describe('Mobile Platform Validation', () => {
    test('should handle mobile-specific features correctly', async () => {
      // Test device orientation handling
      const orientationSupported = screen.orientation !== undefined;
      if (orientationSupported) {
        expect(screen.orientation.type).toMatch(/portrait|landscape/);
      }
      
      // Test touch gesture support
      const touchSupported = 'ontouchstart' in window;
      expect(touchSupported).toBe(true);
    });
  });
  
  describe('Desktop Platform Validation', () => {
    test('should handle desktop-specific features correctly', async () => {
      // Test keyboard shortcuts
      await userEvent.keyboard('{Control>}s{/Control}');
      expect(screen.getByText('Saved')).toBeVisible();
      
      // Test window management
      const windowFeatures = ['resizable', 'scrollbars', 'status'];
      windowFeatures.forEach(feature => {
        expect(window[feature]).toBeDefined();
      });
    });
  });
});
```

### 6. Performance Parity Tests

Generate tests for performance consistency:

```javascript
describe('Performance Parity Tests', () => {
  
  test('should maintain consistent response times across platforms', async () => {
    const platforms = ['web', 'ios', 'android', 'desktop'];
    const performanceResults = {};
    
    for (const platform of platforms) {
      const startTime = performance.now();
      
      await apiClient.get('/api/v1/dashboard', {
        headers: { 'X-Platform': platform }
      });
      
      const endTime = performance.now();
      performanceResults[platform] = endTime - startTime;
    }
    
    // Verify response times are within acceptable variance
    const responseTimes = Object.values(performanceResults);
    const avgResponseTime = responseTimes.reduce((a, b) => a + b) / responseTimes.length;
    const maxVariance = avgResponseTime * 0.5; // 50% variance allowed
    
    responseTimes.forEach(time => {
      expect(Math.abs(time - avgResponseTime)).toBeLessThan(maxVariance);
    });
  });
  
  test('should handle concurrent requests consistently', async () => {
    const concurrentRequests = 10;
    const platforms = ['web', 'ios', 'android', 'desktop'];
    
    for (const platform of platforms) {
      const requests = Array(concurrentRequests).fill().map(() =>
        apiClient.get('/api/v1/users', {
          headers: { 'X-Platform': platform }
        })
      );
      
      const responses = await Promise.all(requests);
      
      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.data).toHaveProperty('data');
      });
    }
  });
});
```

## Expected Outputs

1. **Parity Test Suite** (`tests/parity/`)
   - Complete test suite with platform coverage
   - Shared utilities and test data
   - Platform-specific validation tests
   - Performance and load tests

2. **Test Configuration** (`parity-test.config.js`)
   - Test framework configuration
   - Platform-specific test settings
   - Coverage requirements
   - Reporting configuration

3. **Test Data and Fixtures** (`tests/shared/`)
   - Shared test data sets
   - Mock data generators
   - Schema validation helpers
   - Common assertion utilities

4. **CI/CD Integration** (`parity-test-pipeline.yml`)
   - Automated test execution
   - Cross-platform test orchestration
   - Results reporting and analysis
   - Failure notification and escalation

## Fake Backend Integration for Parity Testing

This section describes how to use the fake backend approach instead of network mocks for more realistic integration testing across platforms.

### Why Fake Backend Over Network Mocks

**Benefits of Fake Backend Approach:**
- Real HTTP requests provide more realistic testing
- Eliminates mock setup complexity in test code
- Consistent behavior across all platforms
- Supports scenario simulation (success, errors, timeouts)
- Enables debug menu testing for QA workflows

**Migration from Network Mocks:**
```javascript
// ❌ OLD: Network mock approach
import { rest } from 'msw';
import { setupServer } from 'msw/node';

const server = setupServer(
  rest.get('/api/v1/users', (req, res, ctx) => {
    return res(ctx.json({ users: mockUsers }));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// ✅ NEW: Fake backend approach
const { startFakeBackend, stopFakeBackend } = require('../fake-backend/spawn');

beforeAll(async () => {
  await startFakeBackend();
  await waitForFakeBackendReady();
});

afterAll(async () => {
  await stopFakeBackend();
});
```

### Fake Backend Test Configuration

```javascript
// tests/parity/config/fake-backend.config.js
module.exports = {
  fakeBackend: {
    port: 3001,
    host: 'localhost',
    healthCheckUrl: 'http://localhost:3001/health',
    startupTimeout: 10000,
    mockDataPath: './mocks'
  },
  
  scenarios: {
    default: 'success',
    available: [
      'success',
      'empty',
      'validation_error',
      'unauthorized',
      'not_found',
      'server_error',
      'timeout',
      'slow'
    ]
  },
  
  platforms: {
    web: { baseUrl: 'http://localhost:3001' },
    ios: { baseUrl: 'http://localhost:3001' },
    android: { baseUrl: 'http://localhost:3001' }
  }
};
```

### Fake Backend Parity Tests

```javascript
// tests/parity/api/fake-backend-parity.test.js
const { describe, test, expect, beforeAll, afterAll } = require('@jest/globals');
const { startFakeBackend, stopFakeBackend, setScenario } = require('../utils/fake-backend');
const testData = require('../shared/test-data');

describe('API Parity Tests with Fake Backend', () => {
  const platforms = ['web', 'ios', 'android'];
  
  beforeAll(async () => {
    await startFakeBackend();
  });
  
  afterAll(async () => {
    await stopFakeBackend();
  });
  
  describe('Success Scenarios', () => {
    beforeEach(async () => {
      await setScenario('success');
    });
    
    platforms.forEach(platform => {
      test(`should return consistent success response for ${platform}`, async () => {
        const response = await apiClient.get('/api/v1/users', {
          headers: { 'X-Platform': platform }
        });
        
        expect(response.status).toBe(200);
        expect(response.data).toMatchSchema(testData.schemas.userList);
        expect(response.data.data).toBeInstanceOf(Array);
      });
    });
  });
  
  describe('Error Scenarios', () => {
    test('should handle validation errors consistently across platforms', async () => {
      await setScenario('validation_error');
      
      const results = {};
      for (const platform of platforms) {
        const response = await apiClient.post('/api/v1/users', {}, {
          headers: { 'X-Platform': platform },
          validateStatus: () => true
        });
        
        results[platform] = {
          status: response.status,
          errorCode: response.data.error?.code,
          hasDetails: !!response.data.error?.details
        };
      }
      
      // Verify consistent error handling across platforms
      platforms.forEach(platform => {
        expect(results[platform].status).toBe(400);
        expect(results[platform].errorCode).toBe('VALIDATION_ERROR');
        expect(results[platform].hasDetails).toBe(true);
      });
    });
    
    test('should handle unauthorized errors consistently', async () => {
      await setScenario('unauthorized');
      
      for (const platform of platforms) {
        const response = await apiClient.get('/api/v1/protected', {
          headers: { 'X-Platform': platform },
          validateStatus: () => true
        });
        
        expect(response.status).toBe(401);
        expect(response.data.error.code).toBe('UNAUTHORIZED');
      }
    });
    
    test('should handle not found errors consistently', async () => {
      await setScenario('not_found');
      
      for (const platform of platforms) {
        const response = await apiClient.get('/api/v1/users/nonexistent', {
          headers: { 'X-Platform': platform },
          validateStatus: () => true
        });
        
        expect(response.status).toBe(404);
        expect(response.data.error.code).toBe('NOT_FOUND');
      }
    });
  });
  
  describe('Network Simulation Scenarios', () => {
    test('should handle timeout scenarios consistently', async () => {
      await setScenario('timeout');
      
      for (const platform of platforms) {
        const startTime = Date.now();
        
        try {
          await apiClient.get('/api/v1/users', {
            headers: { 'X-Platform': platform },
            timeout: 5000
          });
          fail('Expected timeout error');
        } catch (error) {
          const elapsed = Date.now() - startTime;
          expect(error.code).toBe('ECONNABORTED');
          expect(elapsed).toBeGreaterThanOrEqual(4900);
        }
      }
    });
    
    test('should handle slow response scenarios consistently', async () => {
      await setScenario('slow');
      
      for (const platform of platforms) {
        const startTime = Date.now();
        
        const response = await apiClient.get('/api/v1/users', {
          headers: { 'X-Platform': platform },
          timeout: 10000
        });
        
        const elapsed = Date.now() - startTime;
        expect(response.status).toBe(200);
        expect(elapsed).toBeGreaterThanOrEqual(2900); // ~3 second delay
      }
    });
  });
});
```

### Debug Menu Testing Scenarios

```javascript
// tests/parity/debug-menu/environment-switching.test.js
const { describe, test, expect, beforeEach } = require('@jest/globals');
const { startFakeBackend, stopFakeBackend } = require('../utils/fake-backend');

describe('Debug Menu Environment Switching', () => {
  
  describe('Web Platform Debug Menu', () => {
    test('should switch between environments correctly', async ({ page }) => {
      await page.goto('/');
      
      // Open debug menu
      await page.click('[data-testid="debug-toggle"]');
      await expect(page.locator('[data-testid="debug-panel"]')).toBeVisible();
      
      // Switch to fake backend
      await page.selectOption('[data-testid="environment-select"]', 'fake-backend');
      
      // Verify environment indicator
      await expect(page.locator('[data-testid="debug-toggle"]')).toContainText('Fake Backend');
      
      // Verify API calls go to fake backend
      const response = await page.evaluate(async () => {
        const res = await fetch('/api/v1/users');
        return res.json();
      });
      
      expect(response.data).toBeDefined();
    });
    
    test('should persist environment selection across page reloads', async ({ page }) => {
      await page.goto('/');
      
      // Set environment to fake backend
      await page.click('[data-testid="debug-toggle"]');
      await page.selectOption('[data-testid="environment-select"]', 'fake-backend');
      
      // Reload page
      await page.reload();
      
      // Verify environment is still fake backend
      await page.click('[data-testid="debug-toggle"]');
      const selectedEnv = await page.inputValue('[data-testid="environment-select"]');
      expect(selectedEnv).toBe('fake-backend');
    });
    
    test('should allow scenario selection for fake backend', async ({ page }) => {
      await page.goto('/');
      
      // Switch to fake backend
      await page.click('[data-testid="debug-toggle"]');
      await page.selectOption('[data-testid="environment-select"]', 'fake-backend');
      
      // Select error scenario
      await page.selectOption('[data-testid="scenario-select"]', 'server_error');
      
      // Verify API returns error
      const response = await page.evaluate(async () => {
        const res = await fetch('/api/v1/users');
        return { status: res.status, data: await res.json() };
      });
      
      expect(response.status).toBe(500);
      expect(response.data.error.code).toBe('SERVER_ERROR');
    });
  });
  
  describe('Mobile Debug Menu Testing', () => {
    test('should switch environments on iOS', async () => {
      // Launch app
      await device.launchApp();
      
      // Open debug menu (shake gesture or button)
      await element(by.id('debug-toggle')).tap();
      
      // Select fake backend
      await element(by.id('environment-picker')).tap();
      await element(by.text('Fake Backend')).tap();
      
      // Verify environment changed
      await expect(element(by.id('environment-indicator'))).toHaveText('Fake Backend');
      
      // Test API call with fake backend
      await element(by.id('refresh-button')).tap();
      await expect(element(by.id('data-list'))).toBeVisible();
    });
    
    test('should switch environments on Android', async () => {
      // Launch app
      await device.launchApp();
      
      // Open debug menu
      await element(by.id('debug-toggle')).tap();
      
      // Select fake backend from dropdown
      await element(by.id('environment-dropdown')).tap();
      await element(by.text('Fake Backend')).tap();
      
      // Verify environment indicator
      await expect(element(by.id('debug-toggle'))).toHaveText('🔧 Fake Backend');
      
      // Test scenario selection
      await element(by.id('scenario-dropdown')).tap();
      await element(by.text('Empty Data')).tap();
      
      // Verify empty state is shown
      await element(by.id('refresh-button')).tap();
      await expect(element(by.id('empty-state'))).toBeVisible();
    });
  });
  
  describe('Offline Mode Testing via Debug Menu', () => {
    test('should simulate offline mode correctly', async ({ page }) => {
      await page.goto('/');
      
      // Switch to offline mode via debug menu
      await page.click('[data-testid="debug-toggle"]');
      await page.selectOption('[data-testid="environment-select"]', 'offline');
      
      // Verify offline indicator
      await expect(page.locator('[data-testid="offline-indicator"]')).toBeVisible();
      
      // Verify API calls fail gracefully
      const response = await page.evaluate(async () => {
        try {
          await fetch('/api/v1/users');
          return { success: true };
        } catch (error) {
          return { success: false, error: error.message };
        }
      });
      
      expect(response.success).toBe(false);
    });
    
    test('should queue actions while offline and sync when back online', async ({ page }) => {
      await page.goto('/');
      
      // Go offline
      await page.click('[data-testid="debug-toggle"]');
      await page.selectOption('[data-testid="environment-select"]', 'offline');
      
      // Create task while offline
      await page.fill('[data-testid="task-input"]', 'Offline task');
      await page.click('[data-testid="add-task-button"]');
      
      // Verify task is queued
      await expect(page.locator('[data-testid="pending-sync-indicator"]')).toBeVisible();
      
      // Go back online (switch to fake backend)
      await page.click('[data-testid="debug-toggle"]');
      await page.selectOption('[data-testid="environment-select"]', 'fake-backend');
      
      // Wait for sync
      await page.waitForSelector('[data-testid="sync-complete"]', { timeout: 5000 });
      
      // Verify task was synced
      await expect(page.locator('[data-testid="pending-sync-indicator"]')).not.toBeVisible();
    });
  });
});
```

### Fake Backend Utilities for Tests

```javascript
// tests/parity/utils/fake-backend.js
const { spawn } = require('child_process');
const http = require('http');
const path = require('path');

const config = require('../config/fake-backend.config');

let serverProcess = null;

async function startFakeBackend() {
  if (serverProcess) {
    console.log('Fake backend already running');
    return;
  }
  
  const serverPath = path.join(__dirname, '../../../fake-backend/server.js');
  
  serverProcess = spawn('node', [serverPath], {
    env: { ...process.env, FAKE_BACKEND_PORT: config.fakeBackend.port },
    stdio: ['ignore', 'pipe', 'pipe']
  });
  
  serverProcess.stdout.on('data', (data) => {
    console.log(`[fake-backend] ${data.toString().trim()}`);
  });
  
  serverProcess.stderr.on('data', (data) => {
    console.error(`[fake-backend:error] ${data.toString().trim()}`);
  });
  
  await waitForFakeBackendReady();
  console.log('Fake backend started successfully');
}

async function waitForFakeBackendReady(timeout = config.fakeBackend.startupTimeout) {
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeout) {
    try {
      await new Promise((resolve, reject) => {
        const req = http.get(config.fakeBackend.healthCheckUrl, (res) => {
          if (res.statusCode === 200) resolve();
          else reject(new Error(`Health check returned ${res.statusCode}`));
        });
        req.on('error', reject);
        req.setTimeout(1000, () => {
          req.destroy();
          reject(new Error('Health check timeout'));
        });
      });
      return;
    } catch (error) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
  
  throw new Error(`Fake backend failed to start within ${timeout}ms`);
}

async function stopFakeBackend() {
  if (serverProcess) {
    serverProcess.kill('SIGTERM');
    serverProcess = null;
    console.log('Fake backend stopped');
  }
}

async function setScenario(scenario) {
  // Set scenario via API or environment
  process.env.FAKE_BACKEND_SCENARIO = scenario;
  
  // Or set via header in subsequent requests
  return scenario;
}

function getScenarioHeader(scenario) {
  return { 'X-Mock-Scenario': scenario };
}

module.exports = {
  startFakeBackend,
  stopFakeBackend,
  waitForFakeBackendReady,
  setScenario,
  getScenarioHeader
};
```

### CI/CD Integration with Fake Backend

```yaml
# .github/workflows/parity-tests-with-fake-backend.yml
name: Parity Tests with Fake Backend

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  parity-tests:
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
          npm run fake-backend:wait-ready
      
      - name: Run parity tests
        run: npm run test:parity
        env:
          API_BASE_URL: http://localhost:3001
          FAKE_BACKEND_PORT: 3001
      
      - name: Stop fake backend
        if: always()
        run: npm run fake-backend:stop
      
      - name: Upload test results
        uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: parity-test-results
          path: |
            test-results/
            screenshots/
```

## Success Criteria

- All critical features tested across all platforms
- Consistent test results across platform implementations
- Automated execution in CI/CD pipeline
- Clear reporting of parity violations
- Actionable feedback for development teams
- Regular execution and monitoring established

## Examples

### Complete Parity Validation Test Suite Example

Here's a comprehensive example of implementing parity validation tests for a task management application across web, iOS, and Android platforms:

#### 1. Project Structure
```
tests/parity/
├── shared/
│   ├── test-data.js
│   ├── assertions.js
│   ├── utilities.js
│   └── schemas.js
├── api/
│   ├── tasks-api.test.js
│   ├── users-api.test.js
│   └── sync-api.test.js
├── ui/
│   ├── task-components.test.js
│   ├── navigation.test.js
│   └── forms.test.js
├── functionality/
│   ├── task-management.test.js
│   ├── user-authentication.test.js
│   └── offline-sync.test.js
└── platform-specific/
    ├── web.test.js
    ├── ios.test.js
    └── android.test.js
```

#### 2. Shared Test Data and Utilities
```javascript
// tests/parity/shared/test-data.js
module.exports = {
  validUser: {
    email: 'test@example.com',
    password: 'SecurePass123!',
    name: 'Test User',
    preferences: {
      theme: 'light',
      notifications: true,
      timezone: 'UTC'
    }
  },
  
  validTask: {
    title: 'Complete project documentation',
    description: 'Write comprehensive documentation for the mobile app',
    priority: 'high',
    dueDate: '2024-02-01T10:00:00Z',
    tags: ['work', 'documentation'],
    completed: false
  },
  
  schemas: {
    user: {
      type: 'object',
      required: ['id', 'email', 'name', 'created_at'],
      properties: {
        id: { type: 'string' },
        email: { type: 'string', format: 'email' },
        name: { type: 'string', minLength: 1 },
        created_at: { type: 'string', format: 'date-time' }
      }
    },
    
    task: {
      type: 'object',
      required: ['id', 'title', 'created_at', 'updated_at'],
      properties: {
        id: { type: 'string' },
        title: { type: 'string', minLength: 1 },
        description: { type: 'string' },
        priority: { enum: ['low', 'medium', 'high'] },
        completed: { type: 'boolean' },
        due_date: { type: 'string', format: 'date-time' }
      }
    }
  },
  
  platforms: ['web', 'ios', 'android']
};

// tests/parity/shared/utilities.js
const { expect } = require('@jest/globals');

class ParityTestUtils {
  static async performCrossPlatformTest(testFunction, platforms = ['web', 'ios', 'android']) {
    const results = {};
    
    for (const platform of platforms) {
      try {
        results[platform] = await testFunction(platform);
      } catch (error) {
        results[platform] = { error: error.message };
      }
    }
    
    return results;
  }
  
  static validateCrossPlatformConsistency(results, expectedKeys = []) {
    const platforms = Object.keys(results);
    const firstPlatform = platforms[0];
    const baseResult = results[firstPlatform];
    
    if (baseResult.error) {
      throw new Error(`Base platform ${firstPlatform} failed: ${baseResult.error}`);
    }
    
    platforms.slice(1).forEach(platform => {
      const platformResult = results[platform];
      
      if (platformResult.error) {
        throw new Error(`Platform ${platform} failed: ${platformResult.error}`);
      }
      
      expectedKeys.forEach(key => {
        expect(platformResult[key]).toEqual(baseResult[key]);
      });
    });
  }
  
  static async waitForSync(timeout = 5000) {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      const syncStatus = await this.getSyncStatus();
      if (syncStatus.synced) {
        return true;
      }
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    throw new Error('Sync timeout exceeded');
  }
}

module.exports = ParityTestUtils;
```

#### 3. API Parity Tests
```javascript
// tests/parity/api/tasks-api.test.js
const { describe, test, expect, beforeAll, afterAll } = require('@jest/globals');
const testData = require('../shared/test-data');
const ParityTestUtils = require('../shared/utilities');

describe('Tasks API Parity Tests', () => {
  let authToken;
  
  beforeAll(async () => {
    // Authenticate once for all tests
    const loginResponse = await apiClient.post('/api/auth/login', {
      email: testData.validUser.email,
      password: testData.validUser.password
    });
    authToken = loginResponse.data.token;
  });
  
  describe('Task CRUD Operations', () => {
    test('should create tasks consistently across platforms', async () => {
      const testFunction = async (platform) => {
        const response = await apiClient.post('/api/tasks', testData.validTask, {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'X-Platform': platform
          }
        });
        
        return {
          status: response.status,
          taskId: response.data.data.id,
          title: response.data.data.title,
          priority: response.data.data.priority
        };
      };
      
      const results = await ParityTestUtils.performCrossPlatformTest(testFunction);
      
      ParityTestUtils.validateCrossPlatformConsistency(results, [
        'status', 'title', 'priority'
      ]);
      
      // Verify all platforms return 201 status
      Object.values(results).forEach(result => {
        expect(result.status).toBe(201);
      });
    });
    
    test('should retrieve tasks consistently across platforms', async () => {
      // First create a task
      const createResponse = await apiClient.post('/api/tasks', testData.validTask, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      const taskId = createResponse.data.data.id;
      
      const testFunction = async (platform) => {
        const response = await apiClient.get(`/api/tasks/${taskId}`, {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'X-Platform': platform
          }
        });
        
        return {
          status: response.status,
          task: response.data.data,
          metadata: response.data.meta
        };
      };
      
      const results = await ParityTestUtils.performCrossPlatformTest(testFunction);
      
      // Validate task data consistency
      ParityTestUtils.validateCrossPlatformConsistency(results, ['status']);
      
      Object.values(results).forEach(result => {
        expect(result.status).toBe(200);
        expect(result.task).toMatchSchema(testData.schemas.task);
        expect(result.task.title).toBe(testData.validTask.title);
      });
    });
    
    test('should handle task updates consistently across platforms', async () => {
      // Create a task first
      const createResponse = await apiClient.post('/api/tasks', testData.validTask, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      const taskId = createResponse.data.data.id;
      
      const updateData = {
        title: 'Updated Task Title',
        priority: 'low',
        completed: true
      };
      
      const testFunction = async (platform) => {
        const response = await apiClient.put(`/api/tasks/${taskId}`, updateData, {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'X-Platform': platform
          }
        });
        
        return {
          status: response.status,
          updatedTask: response.data.data,
          timestamp: response.data.meta.updated_at
        };
      };
      
      const results = await ParityTestUtils.performCrossPlatformTest(testFunction);
      
      ParityTestUtils.validateCrossPlatformConsistency(results, ['status']);
      
      Object.values(results).forEach(result => {
        expect(result.status).toBe(200);
        expect(result.updatedTask.title).toBe(updateData.title);
        expect(result.updatedTask.priority).toBe(updateData.priority);
        expect(result.updatedTask.completed).toBe(updateData.completed);
      });
    });
  });
  
  describe('Task Synchronization', () => {
    test('should sync task changes across platforms', async () => {
      // Create task from web platform
      const createResponse = await apiClient.post('/api/tasks', testData.validTask, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'X-Platform': 'web'
        }
      });
      const taskId = createResponse.data.data.id;
      
      // Wait for sync
      await ParityTestUtils.waitForSync();
      
      // Verify task is available on all platforms
      const testFunction = async (platform) => {
        const response = await apiClient.get(`/api/tasks/${taskId}`, {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'X-Platform': platform
          }
        });
        
        return {
          status: response.status,
          task: response.data.data,
          syncStatus: response.data.meta.sync_status
        };
      };
      
      const results = await ParityTestUtils.performCrossPlatformTest(testFunction);
      
      Object.values(results).forEach(result => {
        expect(result.status).toBe(200);
        expect(result.task.id).toBe(taskId);
        expect(result.syncStatus).toBe('synced');
      });
    });
  });
});
```

#### 4. UI Component Parity Tests
```javascript
// tests/parity/ui/task-components.test.js
const { describe, test, expect } = require('@jest/globals');
const { render, screen, userEvent } = require('@testing-library/react-native');
const testData = require('../shared/test-data');

describe('Task Component Parity Tests', () => {
  
  describe('TaskItem Component', () => {
    const mockTask = testData.validTask;
    
    test('should render task information consistently', () => {
      const platforms = ['web', 'ios', 'android'];
      const renderResults = {};
      
      platforms.forEach(platform => {
        const { container } = render(
          <TaskItem task={mockTask} platform={platform} />
        );
        
        renderResults[platform] = {
          title: screen.getByText(mockTask.title),
          priority: screen.getByText(mockTask.priority),
          checkbox: screen.getByRole('checkbox'),
          container: container
        };
      });
      
      // Verify consistent rendering across platforms
      platforms.forEach(platform => {
        const result = renderResults[platform];
        expect(result.title).toBeVisible();
        expect(result.priority).toBeVisible();
        expect(result.checkbox).toBeVisible();
        expect(result.checkbox).not.toBeChecked();
      });
    });
    
    test('should handle interactions consistently', async () => {
      const platforms = ['web', 'ios', 'android'];
      const mockOnToggle = jest.fn();
      
      for (const platform of platforms) {
        mockOnToggle.mockClear();
        
        render(
          <TaskItem 
            task={mockTask} 
            platform={platform}
            onToggle={mockOnToggle}
          />
        );
        
        const checkbox = screen.getByRole('checkbox');
        
        // Test checkbox interaction
        await userEvent.click(checkbox);
        
        expect(mockOnToggle).toHaveBeenCalledWith(mockTask.id);
        expect(mockOnToggle).toHaveBeenCalledTimes(1);
      }
    });
    
    test('should display error states consistently', () => {
      const platforms = ['web', 'ios', 'android'];
      const errorMessage = 'Failed to update task';
      
      platforms.forEach(platform => {
        render(
          <TaskItem 
            task={mockTask} 
            platform={platform}
            error={errorMessage}
          />
        );
        
        const errorElement = screen.getByRole('alert');
        expect(errorElement).toBeVisible();
        expect(errorElement).toHaveTextContent(errorMessage);
        
        // Verify error styling is applied
        expect(errorElement).toHaveClass('error-message');
      });
    });
  });
  
  describe('TaskForm Component', () => {
    test('should validate input consistently across platforms', async () => {
      const platforms = ['web', 'ios', 'android'];
      
      for (const platform of platforms) {
        render(<TaskForm platform={platform} />);
        
        const titleInput = screen.getByLabelText('Task Title');
        const submitButton = screen.getByRole('button', { name: 'Create Task' });
        
        // Test empty form submission
        await userEvent.click(submitButton);
        
        const errorMessage = screen.getByText('Title is required');
        expect(errorMessage).toBeVisible();
        expect(titleInput).toHaveAttribute('aria-invalid', 'true');
        
        // Test valid form submission
        await userEvent.type(titleInput, 'New Task');
        await userEvent.click(submitButton);
        
        expect(screen.queryByText('Title is required')).not.toBeInTheDocument();
        expect(titleInput).toHaveAttribute('aria-invalid', 'false');
      }
    });
  });
});
```

#### 5. Functional Parity Tests
```javascript
// tests/parity/functionality/task-management.test.js
const { describe, test, expect, beforeEach } = require('@jest/globals');
const testData = require('../shared/test-data');
const ParityTestUtils = require('../shared/utilities');

describe('Task Management Functionality Parity', () => {
  let userToken;
  
  beforeEach(async () => {
    // Setup authenticated user for each test
    const loginResponse = await apiClient.post('/api/auth/login', testData.validUser);
    userToken = loginResponse.data.token;
  });
  
  describe('Task Creation Workflow', () => {
    test('should create tasks with same behavior across platforms', async () => {
      const taskData = testData.validTask;
      
      const testFunction = async (platform) => {
        // Simulate platform-specific task creation
        const createResult = await createTask(taskData, platform, userToken);
        
        return {
          success: createResult.success,
          taskId: createResult.data.id,
          validationErrors: createResult.validationErrors || [],
          timestamp: createResult.data.created_at
        };
      };
      
      const results = await ParityTestUtils.performCrossPlatformTest(testFunction);
      
      // Validate consistent behavior
      Object.values(results).forEach(result => {
        expect(result.success).toBe(true);
        expect(result.taskId).toBeDefined();
        expect(result.validationErrors).toHaveLength(0);
        expect(new Date(result.timestamp)).toBeInstanceOf(Date);
      });
      
      // Verify tasks are accessible from all platforms
      const taskIds = Object.values(results).map(r => r.taskId);
      const uniqueTaskIds = [...new Set(taskIds)];
      expect(uniqueTaskIds).toHaveLength(1); // Should be same task across platforms
    });
  });
  
  describe('Task Status Management', () => {
    test('should handle task completion consistently', async () => {
      // Create a task first
      const createResponse = await createTask(testData.validTask, 'web', userToken);
      const taskId = createResponse.data.id;
      
      const testFunction = async (platform) => {
        const completeResult = await completeTask(taskId, platform, userToken);
        
        return {
          success: completeResult.success,
          completed: completeResult.data.completed,
          completedAt: completeResult.data.completed_at
        };
      };
      
      const results = await ParityTestUtils.performCrossPlatformTest(testFunction);
      
      Object.values(results).forEach(result => {
        expect(result.success).toBe(true);
        expect(result.completed).toBe(true);
        expect(result.completedAt).toBeDefined();
      });
    });
  });
  
  describe('Offline Functionality', () => {
    test('should handle offline task creation consistently', async () => {
      const testFunction = async (platform) => {
        // Simulate offline mode
        await setOfflineMode(true, platform);
        
        const offlineResult = await createTask(testData.validTask, platform, userToken);
        
        // Go back online
        await setOfflineMode(false, platform);
        
        // Wait for sync
        await ParityTestUtils.waitForSync();
        
        return {
          offlineSuccess: offlineResult.success,
          queuedForSync: offlineResult.queuedForSync,
          syncedSuccessfully: offlineResult.syncedSuccessfully
        };
      };
      
      const results = await ParityTestUtils.performCrossPlatformTest(testFunction);
      
      Object.values(results).forEach(result => {
        expect(result.offlineSuccess).toBe(true);
        expect(result.queuedForSync).toBe(true);
        expect(result.syncedSuccessfully).toBe(true);
      });
    });
  });
});
```

#### 6. Platform-Specific Validation
```javascript
// tests/parity/platform-specific/web.test.js
const { describe, test, expect } = require('@jest/globals');

describe('Web Platform Specific Validation', () => {
  
  test('should handle browser storage correctly', async () => {
    const testData = { key: 'user_preferences', value: { theme: 'dark' } };
    
    // Test localStorage
    localStorage.setItem(testData.key, JSON.stringify(testData.value));
    const retrieved = JSON.parse(localStorage.getItem(testData.key));
    expect(retrieved).toEqual(testData.value);
    
    // Test sessionStorage
    sessionStorage.setItem(testData.key, JSON.stringify(testData.value));
    const sessionRetrieved = JSON.parse(sessionStorage.getItem(testData.key));
    expect(sessionRetrieved).toEqual(testData.value);
  });
  
  test('should handle keyboard shortcuts', async () => {
    render(<TaskApp />);
    
    // Test Ctrl+N for new task
    await userEvent.keyboard('{Control>}n{/Control}');
    expect(screen.getByRole('dialog', { name: 'New Task' })).toBeVisible();
    
    // Test Escape to close
    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('dialog', { name: 'New Task' })).not.toBeInTheDocument();
  });
});

// tests/parity/platform-specific/ios.test.js
describe('iOS Platform Specific Validation', () => {
  
  test('should handle iOS-specific gestures', async () => {
    render(<TaskList />);
    
    const taskItem = screen.getByTestId('task-item-1');
    
    // Test swipe to delete
    await userEvent.swipe(taskItem, 'left');
    expect(screen.getByText('Delete')).toBeVisible();
    
    // Test long press for context menu
    await userEvent.longPress(taskItem);
    expect(screen.getByRole('menu')).toBeVisible();
  });
  
  test('should integrate with iOS system features', async () => {
    // Test Siri shortcuts integration
    const shortcutResult = await SiriShortcuts.suggestShortcut({
      activityType: 'com.app.create-task',
      title: 'Create New Task'
    });
    expect(shortcutResult.success).toBe(true);
    
    // Test iOS notifications
    const notificationPermission = await Notifications.requestPermissionsAsync();
    expect(notificationPermission.status).toBe('granted');
  });
});

// tests/parity/platform-specific/android.test.js
describe('Android Platform Specific Validation', () => {
  
  test('should handle Android-specific features', async () => {
    // Test back button handling
    await userEvent.press(screen.getByTestId('android-back-button'));
    expect(screen.getByText('Exit App?')).toBeVisible();
    
    // Test share intent
    const shareResult = await Share.share({
      message: 'Check out this task app!',
      url: 'https://taskapp.com'
    });
    expect(shareResult.action).toBe(Share.sharedAction);
  });
  
  test('should integrate with Android system', async () => {
    // Test Google Assistant integration
    const assistantResult = await GoogleAssistant.registerAction({
      intentName: 'CREATE_TASK',
      phrases: ['create a new task', 'add task']
    });
    expect(assistantResult.success).toBe(true);
    
    // Test Android widgets
    const widgetConfig = await AppWidget.configure({
      type: 'task_summary',
      updateInterval: 30000
    });
    expect(widgetConfig.configured).toBe(true);
  });
});
```

This comprehensive example demonstrates how to implement thorough parity validation testing across web, iOS, and Android platforms, ensuring consistent functionality, UI behavior, and platform-specific feature integration while maintaining high test coverage and reliability.


## Integration Points

This parity validation test module integrates with other testing modules:

- **Centralized Mock Data**: [centralized-mock-data.md](../testing/centralized-mock-data.md) - Provides consistent mock data for all platforms
- **Fake Backend Generator**: [fake-backend-generator.md](../testing/fake-backend-generator.md) - Generates the fake backend server for integration testing
- **Debug Menu Integration**: [debug-menu-integration.md](../testing/debug-menu-integration.md) - Enables environment switching for QA testing
- **Shared Contracts**: [shared-contracts.md](./shared-contracts.md) - Defines API contracts that mock data must conform to

## Module References

When implementing parity validation tests, use these related modules:

```markdown
# For centralized mock data organization
#[[module:testing/centralized-mock-data.md]]

# For fake backend server generation
#[[module:testing/fake-backend-generator.md]]

# For debug menu UI implementation
#[[module:testing/debug-menu-integration.md]]
```

## Domain-Specific Parity Test Templates

### Commerce Domain Parity Tests

```javascript
// tests/parity/domains/commerce/product-parity.test.js
describe('Commerce Product Parity Tests', () => {
  const platforms = ['web', 'ios', 'android'];
  
  describe('Product Catalog', () => {
    test('should display products consistently across platforms', async () => {
      const testFunction = async (platform) => {
        const response = await apiClient.get('/api/v1/products', {
          headers: { 'X-Platform': platform }
        });
        
        return {
          status: response.status,
          productCount: response.data.data.length,
          productSchema: validateSchema(response.data.data[0], productSchema)
        };
      };
      
      const results = await ParityTestUtils.performCrossPlatformTest(testFunction);
      ParityTestUtils.validateCrossPlatformConsistency(results, ['status', 'productCount']);
    });
    
    test('should handle product variants consistently', async () => {
      const productId = 'test-product-with-variants';
      
      const testFunction = async (platform) => {
        const response = await apiClient.get(`/api/v1/products/${productId}/variants`, {
          headers: { 'X-Platform': platform }
        });
        
        return {
          variantCount: response.data.data.length,
          variantAttributes: response.data.data.map(v => v.attributes)
        };
      };
      
      const results = await ParityTestUtils.performCrossPlatformTest(testFunction);
      ParityTestUtils.validateCrossPlatformConsistency(results, ['variantCount']);
    });
  });
  
  describe('Shopping Cart', () => {
    test('should calculate cart totals consistently', async () => {
      const cartItems = [
        { product_id: 'prod-1', quantity: 2 },
        { product_id: 'prod-2', quantity: 1 }
      ];
      
      const testFunction = async (platform) => {
        // Add items to cart
        for (const item of cartItems) {
          await apiClient.post('/api/v1/cart/items', item, {
            headers: { 'X-Platform': platform, 'Authorization': `Bearer ${token}` }
          });
        }
        
        // Get cart totals
        const response = await apiClient.get('/api/v1/cart', {
          headers: { 'X-Platform': platform, 'Authorization': `Bearer ${token}` }
        });
        
        return {
          subtotal: response.data.data.subtotal,
          tax: response.data.data.tax,
          total: response.data.data.total,
          itemCount: response.data.data.items.length
        };
      };
      
      const results = await ParityTestUtils.performCrossPlatformTest(testFunction);
      ParityTestUtils.validateCrossPlatformConsistency(results, ['subtotal', 'tax', 'total', 'itemCount']);
    });
  });
  
  describe('Checkout Flow', () => {
    test('should process payments consistently', async () => {
      const paymentData = {
        method: 'card',
        card_token: 'tok_test_visa'
      };
      
      const testFunction = async (platform) => {
        const response = await apiClient.post('/api/v1/checkout/payment', paymentData, {
          headers: { 'X-Platform': platform, 'Authorization': `Bearer ${token}` }
        });
        
        return {
          status: response.status,
          paymentStatus: response.data.data.status,
          orderId: response.data.data.order_id
        };
      };
      
      const results = await ParityTestUtils.performCrossPlatformTest(testFunction);
      ParityTestUtils.validateCrossPlatformConsistency(results, ['status', 'paymentStatus']);
    });
  });
});
```

### Healthcare Domain Parity Tests

```javascript
// tests/parity/domains/healthcare/patient-data-parity.test.js
describe('Healthcare Patient Data Parity Tests', () => {
  const platforms = ['web', 'ios', 'android'];
  
  describe('Patient Records', () => {
    test('should handle PHI consistently with encryption', async () => {
      const testFunction = async (platform) => {
        const response = await apiClient.get('/api/v1/patients/123', {
          headers: { 
            'X-Platform': platform, 
            'Authorization': `Bearer ${hipaaToken}` 
          }
        });
        
        return {
          status: response.status,
          hasEncryptedFields: !!response.data.data.encrypted_fields,
          auditLogged: response.headers['x-audit-logged'] === 'true'
        };
      };
      
      const results = await ParityTestUtils.performCrossPlatformTest(testFunction);
      
      // All platforms must handle PHI with encryption
      Object.values(results).forEach(result => {
        expect(result.hasEncryptedFields).toBe(true);
        expect(result.auditLogged).toBe(true);
      });
    });
    
    test('should enforce session timeout consistently', async () => {
      const testFunction = async (platform) => {
        // Get session info
        const response = await apiClient.get('/api/v1/session', {
          headers: { 'X-Platform': platform, 'Authorization': `Bearer ${hipaaToken}` }
        });
        
        return {
          maxSessionDuration: response.data.data.max_duration,
          inactivityTimeout: response.data.data.inactivity_timeout
        };
      };
      
      const results = await ParityTestUtils.performCrossPlatformTest(testFunction);
      
      // HIPAA requires consistent session management
      ParityTestUtils.validateCrossPlatformConsistency(results, [
        'maxSessionDuration', 
        'inactivityTimeout'
      ]);
    });
  });
  
  describe('Telemedicine', () => {
    test('should handle video consultations consistently', async () => {
      const testFunction = async (platform) => {
        const response = await apiClient.post('/api/v1/consultations', {
          patient_id: 'patient-123',
          provider_id: 'provider-456',
          type: 'video'
        }, {
          headers: { 'X-Platform': platform, 'Authorization': `Bearer ${hipaaToken}` }
        });
        
        return {
          status: response.status,
          hasVideoUrl: !!response.data.data.video_url,
          encryptionEnabled: response.data.data.encryption_enabled
        };
      };
      
      const results = await ParityTestUtils.performCrossPlatformTest(testFunction);
      
      Object.values(results).forEach(result => {
        expect(result.encryptionEnabled).toBe(true);
      });
    });
  });
});
```

### Fintech Domain Parity Tests

```javascript
// tests/parity/domains/fintech/transaction-parity.test.js
describe('Fintech Transaction Parity Tests', () => {
  const platforms = ['web', 'ios', 'android'];
  
  describe('Account Management', () => {
    test('should display account balances consistently', async () => {
      const testFunction = async (platform) => {
        const response = await apiClient.get('/api/v1/accounts', {
          headers: { 'X-Platform': platform, 'Authorization': `Bearer ${fintechToken}` }
        });
        
        return {
          accountCount: response.data.data.length,
          totalBalance: response.data.data.reduce((sum, acc) => sum + acc.balance, 0),
          currencies: [...new Set(response.data.data.map(acc => acc.currency))]
        };
      };
      
      const results = await ParityTestUtils.performCrossPlatformTest(testFunction);
      ParityTestUtils.validateCrossPlatformConsistency(results, ['accountCount', 'totalBalance']);
    });
  });
  
  describe('Transaction Processing', () => {
    test('should process transfers consistently', async () => {
      const transferData = {
        from_account: 'acc-123',
        to_account: 'acc-456',
        amount: 100.00,
        currency: 'USD'
      };
      
      const testFunction = async (platform) => {
        const response = await apiClient.post('/api/v1/transfers', transferData, {
          headers: { 'X-Platform': platform, 'Authorization': `Bearer ${fintechToken}` }
        });
        
        return {
          status: response.status,
          transactionStatus: response.data.data.status,
          hasReferenceId: !!response.data.data.reference_id,
          fraudCheckPassed: response.data.data.fraud_check_status === 'passed'
        };
      };
      
      const results = await ParityTestUtils.performCrossPlatformTest(testFunction);
      ParityTestUtils.validateCrossPlatformConsistency(results, ['status', 'transactionStatus']);
    });
    
    test('should enforce transaction limits consistently', async () => {
      const largeTransfer = {
        from_account: 'acc-123',
        to_account: 'acc-456',
        amount: 1000000.00, // Exceeds limit
        currency: 'USD'
      };
      
      const testFunction = async (platform) => {
        const response = await apiClient.post('/api/v1/transfers', largeTransfer, {
          headers: { 'X-Platform': platform, 'Authorization': `Bearer ${fintechToken}` },
          validateStatus: () => true
        });
        
        return {
          status: response.status,
          errorCode: response.data.error?.code,
          limitExceeded: response.data.error?.code === 'LIMIT_EXCEEDED'
        };
      };
      
      const results = await ParityTestUtils.performCrossPlatformTest(testFunction);
      
      // All platforms must enforce limits consistently
      Object.values(results).forEach(result => {
        expect(result.limitExceeded).toBe(true);
      });
    });
  });
});
```

### Real-Time Communication Parity Tests

```javascript
// tests/parity/domains/realtime/websocket-parity.test.js
describe('Real-Time Communication Parity Tests', () => {
  const platforms = ['web', 'ios', 'android'];
  
  describe('WebSocket Connection', () => {
    test('should establish connections consistently', async () => {
      const testFunction = async (platform) => {
        const ws = await createWebSocketConnection(platform);
        
        return {
          connected: ws.readyState === WebSocket.OPEN,
          protocol: ws.protocol,
          latency: await measureLatency(ws)
        };
      };
      
      const results = await ParityTestUtils.performCrossPlatformTest(testFunction);
      
      Object.values(results).forEach(result => {
        expect(result.connected).toBe(true);
      });
    });
    
    test('should deliver messages consistently', async () => {
      const testMessage = { type: 'chat', content: 'Hello, World!' };
      
      const testFunction = async (platform) => {
        const ws = await createWebSocketConnection(platform);
        
        // Send message
        ws.send(JSON.stringify(testMessage));
        
        // Wait for echo
        const response = await waitForMessage(ws, 5000);
        
        return {
          received: !!response,
          messageType: response?.type,
          contentMatch: response?.content === testMessage.content
        };
      };
      
      const results = await ParityTestUtils.performCrossPlatformTest(testFunction);
      
      Object.values(results).forEach(result => {
        expect(result.received).toBe(true);
        expect(result.contentMatch).toBe(true);
      });
    });
  });
  
  describe('Presence System', () => {
    test('should track online status consistently', async () => {
      const testFunction = async (platform) => {
        // Set user online
        await apiClient.post('/api/v1/presence/online', {}, {
          headers: { 'X-Platform': platform, 'Authorization': `Bearer ${token}` }
        });
        
        // Check presence from another platform
        const response = await apiClient.get('/api/v1/presence/user-123', {
          headers: { 'X-Platform': 'web' }
        });
        
        return {
          isOnline: response.data.data.online,
          lastSeen: response.data.data.last_seen,
          platform: response.data.data.platform
        };
      };
      
      const results = await ParityTestUtils.performCrossPlatformTest(testFunction);
      
      Object.values(results).forEach(result => {
        expect(result.isOnline).toBe(true);
      });
    });
  });
});
```

### IoT Domain Parity Tests

```javascript
// tests/parity/domains/iot/device-parity.test.js
describe('IoT Device Parity Tests', () => {
  const platforms = ['web', 'ios', 'android'];
  
  describe('Device Management', () => {
    test('should list devices consistently', async () => {
      const testFunction = async (platform) => {
        const response = await apiClient.get('/api/v1/devices', {
          headers: { 'X-Platform': platform, 'Authorization': `Bearer ${iotToken}` }
        });
        
        return {
          deviceCount: response.data.data.length,
          deviceTypes: [...new Set(response.data.data.map(d => d.type))],
          onlineCount: response.data.data.filter(d => d.status === 'online').length
        };
      };
      
      const results = await ParityTestUtils.performCrossPlatformTest(testFunction);
      ParityTestUtils.validateCrossPlatformConsistency(results, ['deviceCount', 'onlineCount']);
    });
    
    test('should send commands consistently', async () => {
      const command = {
        device_id: 'device-123',
        command: 'set_temperature',
        parameters: { value: 72, unit: 'fahrenheit' }
      };
      
      const testFunction = async (platform) => {
        const response = await apiClient.post('/api/v1/devices/commands', command, {
          headers: { 'X-Platform': platform, 'Authorization': `Bearer ${iotToken}` }
        });
        
        return {
          status: response.status,
          commandStatus: response.data.data.status,
          acknowledged: response.data.data.acknowledged
        };
      };
      
      const results = await ParityTestUtils.performCrossPlatformTest(testFunction);
      ParityTestUtils.validateCrossPlatformConsistency(results, ['status', 'commandStatus']);
    });
  });
  
  describe('Sensor Data', () => {
    test('should retrieve sensor data consistently', async () => {
      const testFunction = async (platform) => {
        const response = await apiClient.get('/api/v1/devices/device-123/sensors', {
          headers: { 'X-Platform': platform, 'Authorization': `Bearer ${iotToken}` }
        });
        
        return {
          sensorCount: response.data.data.length,
          latestReadings: response.data.data.map(s => ({
            type: s.type,
            value: s.latest_value,
            unit: s.unit
          }))
        };
      };
      
      const results = await ParityTestUtils.performCrossPlatformTest(testFunction);
      ParityTestUtils.validateCrossPlatformConsistency(results, ['sensorCount']);
    });
  });
});
```

## Template Composition Rules for Parity Testing

### Compatible Test Combinations
- Commerce + Analytics: Test purchase event tracking parity
- Healthcare + Security: Test HIPAA authentication parity
- Fintech + Blockchain: Test crypto transaction parity
- Social + Real-Time: Test messaging delivery parity
- IoT + Analytics: Test telemetry collection parity

### Test Priority Guidelines
1. Security-critical features (authentication, encryption) - Highest priority
2. Data consistency features (CRUD, sync) - High priority
3. User experience features (UI, navigation) - Medium priority
4. Platform-specific features - Lower priority (expected differences)
