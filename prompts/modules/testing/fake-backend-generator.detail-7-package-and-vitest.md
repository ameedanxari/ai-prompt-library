### Package.json for Fake Backend
```json
{
  "name": "fake-backend",
  "version": "1.0.0",
  "description": "Lightweight fake backend server for testing",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "start:dev": "nodemon server.js",
    "generate-routes": "node generate-routes.js",
    "health-check": "curl -s http://localhost:3001/health | jq"
  },
  "dependencies": {
    "cors": "^2.8.5",
    "dotenv": "^16.0.0",
    "express": "^4.18.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.0"
  },
  "engines": {
    "node": ">=16.0.0"
  }
}
```


---

## Test Runner Integration

### Automatic Spawn/Shutdown Integration

#### Jest Integration (jest.setup.js)
```javascript
// jest.setup.js - Global setup for Jest with fake backend

const { startServer, waitForReady, stopServer } = require('./scripts/start-fake-backend');

let serverProcess = null;

// Global setup - runs once before all tests
module.exports = async () => {
  console.log('\n🚀 Starting fake backend for tests...');
  
  serverProcess = startServer();
  
  try {
    await waitForReady();
    console.log('✅ Fake backend is ready\n');
    
    // Store server process for teardown
    global.__FAKE_BACKEND_PROCESS__ = serverProcess;
  } catch (error) {
    console.error('❌ Failed to start fake backend:', error.message);
    stopServer();
    process.exit(1);
  }
};
```

#### Jest Teardown (jest.teardown.js)
```javascript
// jest.teardown.js - Global teardown for Jest

const { stopServer } = require('./scripts/start-fake-backend');

module.exports = async () => {
  console.log('\n🛑 Stopping fake backend...');
  stopServer();
  console.log('✅ Fake backend stopped\n');
};
```

#### Jest Configuration (jest.config.js)
```javascript
// jest.config.js

module.exports = {
  // ... other config
  
  // Global setup/teardown for fake backend
  globalSetup: '<rootDir>/jest.setup.js',
  globalTeardown: '<rootDir>/jest.teardown.js',
  
  // Set test environment variables
  testEnvironment: 'node',
  
  // Increase timeout for integration tests
  testTimeout: 30000,
  
  // Setup files that run before each test file
  setupFilesAfterEnv: ['<rootDir>/jest.env.js'],
};
```

#### Jest Environment Setup (jest.env.js)
```javascript
// jest.env.js - Runs before each test file

// Set API base URL to fake backend
process.env.API_BASE_URL = 'http://localhost:3001';
process.env.NODE_ENV = 'test';

// Helper to set mock scenario for a test
global.setMockScenario = (scenario) => {
  process.env.MOCK_SCENARIO = scenario;
};

// Reset scenario after each test
afterEach(() => {
  delete process.env.MOCK_SCENARIO;
});
```

### Vitest Integration

#### Vitest Global Setup (vitest.setup.ts)
```typescript
// vitest.setup.ts

import { spawn, ChildProcess } from 'child_process';
import { beforeAll, afterAll } from 'vitest';

let serverProcess: ChildProcess | null = null;
const FAKE_BACKEND_PORT = 3001;
const HEALTH_CHECK_URL = `http://localhost:${FAKE_BACKEND_PORT}/health`;

async function waitForServer(maxRetries = 30): Promise<void> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(HEALTH_CHECK_URL);
      if (response.ok) {
        return;
      }
    } catch {
      // Server not ready yet
    }
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  throw new Error('Fake backend failed to start');
}

beforeAll(async () => {
  console.log('🚀 Starting fake backend...');
  
  serverProcess = spawn('node', ['fake-backend/server.js'], {
    env: { ...process.env, FAKE_BACKEND_PORT: String(FAKE_BACKEND_PORT) },
    stdio: 'pipe'
  });
  
  serverProcess.stdout?.on('data', (data) => {
    console.log(`[fake-backend] ${data.toString().trim()}`);
  });
  
  await waitForServer();
  console.log('✅ Fake backend ready');
});

afterAll(() => {
  if (serverProcess) {
    console.log('🛑 Stopping fake backend...');
    serverProcess.kill('SIGTERM');
  }
});

// Export helper for setting scenarios
export function setScenario(scenario: string) {
  process.env.MOCK_SCENARIO = scenario;
}
```

#### Vitest Configuration (vitest.config.ts)
```typescript
// vitest.config.ts

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Global setup file
    setupFiles: ['./vitest.setup.ts'],
    
    // Increase timeout for integration tests
    testTimeout: 30000,
    
    // Run tests sequentially to avoid port conflicts
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true
      }
    },
    
    // Environment variables
    env: {
      API_BASE_URL: 'http://localhost:3001',
      NODE_ENV: 'test'
    }
  }
});
```

