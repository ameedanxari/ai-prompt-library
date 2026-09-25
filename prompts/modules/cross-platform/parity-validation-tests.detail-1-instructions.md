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

