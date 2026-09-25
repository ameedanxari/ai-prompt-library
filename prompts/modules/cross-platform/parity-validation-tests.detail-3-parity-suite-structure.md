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

