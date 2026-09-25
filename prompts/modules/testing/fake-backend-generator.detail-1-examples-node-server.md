## Examples

### 1. Basic Fake Backend Configuration
```markdown
# Fake Backend Server Configuration

## Server Settings
```json
{
  "port": 3001,
  "host": "localhost",
  "mockDataPath": "./mocks",
  "cors": {
    "enabled": true,
    "origins": ["http://localhost:3000", "http://localhost:8080"]
  },
  "logging": {
    "enabled": true,
    "level": "info",
    "format": "json"
  }
}
```

## Route Configuration
```json
{
  "routes": [
    {
      "method": "GET",
      "path": "/api/v1/users",
      "mockFile": "api/v1/users/GET/200-success.json",
      "scenarios": {
        "success": "api/v1/users/GET/200-success.json",
        "empty": "api/v1/users/GET/200-success-empty.json",
        "unauthorized": "api/v1/users/GET/401-unauthorized.json",
        "error": "api/v1/users/GET/500-server-error.json"
      }
    },
    {
      "method": "POST",
      "path": "/api/v1/users",
      "mockFile": "api/v1/users/POST/201-created.json",
      "scenarios": {
        "success": "api/v1/users/POST/201-created.json",
        "validation_error": "api/v1/users/POST/400-validation-error.json",
        "conflict": "api/v1/users/POST/409-conflict.json",
        "error": "api/v1/users/POST/500-server-error.json"
      }
    },
    {
      "method": "GET",
      "path": "/api/v1/users/:id",
      "mockFile": "api/v1/users/{id}/GET/200-success.json",
      "scenarios": {
        "success": "api/v1/users/{id}/GET/200-success.json",
        "not_found": "api/v1/users/{id}/GET/404-not-found.json",
        "error": "api/v1/users/{id}/GET/500-server-error.json"
      }
    }
  ]
}
```

## Scenario Selection
- Default scenario: `success`
- Override via header: `X-Mock-Scenario: validation_error`
- Override via query param: `?_scenario=not_found`
```

### 2. Node.js/Express Fake Backend Implementation
```markdown
# Express Fake Backend Server

## Server Implementation (fake-backend/server.js)
```javascript
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const config = require('./config.json');

// Middleware
app.use(cors(config.cors));
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  if (config.logging.enabled) {
    console.log(JSON.stringify({
      timestamp: new Date().toISOString(),
      method: req.method,
      path: req.path,
      scenario: req.headers['x-mock-scenario'] || 'default',
      query: req.query
    }));
  }
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Readiness check endpoint
app.get('/ready', (req, res) => {
  res.json({ ready: true, mockDataPath: config.mockDataPath });
});

// Dynamic route handler
function createRouteHandler(routeConfig) {
  return (req, res) => {
    // Determine scenario
    const scenario = req.headers['x-mock-scenario'] || 
                     req.query._scenario || 
                     'success';
    
    // Get mock file path
    const mockFile = routeConfig.scenarios[scenario] || routeConfig.mockFile;
    const mockPath = path.join(config.mockDataPath, mockFile);
    
    // Check for delay simulation
    const delay = req.headers['x-mock-delay'] || 0;
    
    // Check for timeout simulation
    if (scenario === 'timeout') {
      // Don't respond - simulate timeout
      return;
    }
    
    // Check for slow response simulation
    if (scenario === 'slow') {
      setTimeout(() => sendMockResponse(res, mockPath), 3000);
      return;
    }
    
    // Apply custom delay if specified
    if (delay > 0) {
      setTimeout(() => sendMockResponse(res, mockPath), parseInt(delay));
      return;
    }
    
    sendMockResponse(res, mockPath);
  };
}

function sendMockResponse(res, mockPath) {
  try {
    const mockData = JSON.parse(fs.readFileSync(mockPath, 'utf-8'));
    
    // Extract status code from filename (e.g., 200-success.json -> 200)
    const filename = path.basename(mockPath);
    const statusCode = parseInt(filename.split('-')[0]) || 200;
    
    res.status(statusCode).json(mockData);
  } catch (error) {
    res.status(500).json({ 
      error: 'Mock file not found', 
      path: mockPath,
      message: error.message 
    });
  }
}

// Register routes from configuration
config.routes.forEach(route => {
  const method = route.method.toLowerCase();
  app[method](route.path, createRouteHandler(route));
});

// Start server
const PORT = process.env.FAKE_BACKEND_PORT || config.port;
const server = app.listen(PORT, () => {
  console.log(`Fake backend running on http://localhost:${PORT}`);
  console.log(`Mock data path: ${config.mockDataPath}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});

module.exports = { app, server };
```

## Configuration File (fake-backend/config.json)
```json
{
  "port": 3001,
  "host": "localhost",
  "mockDataPath": "../mocks",
  "cors": {
    "enabled": true,
    "origin": "*",
    "methods": ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"]
  },
  "logging": {
    "enabled": true,
    "level": "info"
  },
  "scenarios": {
    "default": "success",
    "available": ["success", "error", "timeout", "slow", "empty", "validation_error", "unauthorized", "not_found", "conflict", "rate_limited"]
  },
  "timeouts": {
    "slow": 3000,
    "timeout": 30000
  },
  "routes": []
}
```
```

### 3. Route Generation from Mock Data Index
```markdown
# Automatic Route Generation

## Route Generator Script (fake-backend/generate-routes.js)
```javascript
const fs = require('fs');
const path = require('path');

function generateRoutesFromMockIndex(mockIndexPath) {
  const mockIndex = JSON.parse(fs.readFileSync(mockIndexPath, 'utf-8'));
  const routes = [];
  
  for (const endpoint of mockIndex.endpoints) {
    for (const method of endpoint.methods) {
      const mockFiles = endpoint.mockFiles[method];
      
      // Convert path params from {id} to :id format for Express
      const expressPath = endpoint.path.replace(/\{(\w+)\}/g, ':$1');
      
      // Build scenarios from available mock files
      const scenarios = {};
      for (const [statusCode, mockFile] of Object.entries(mockFiles)) {
        const scenarioName = getScenarioName(statusCode, mockFile);
        scenarios[scenarioName] = mockFile;
      }
      
      routes.push({
        method: method,
        path: expressPath,
        mockFile: mockFiles['200'] || mockFiles['201'] || Object.values(mockFiles)[0],
        scenarios: scenarios
      });
    }
  }
  
  return routes;
}

function getScenarioName(statusCode, mockFile) {
  const code = parseInt(statusCode);
  const filename = path.basename(mockFile, '.json');
  const description = filename.split('-').slice(1).join('_');
  
  // Map common status codes to scenario names
  const scenarioMap = {
    200: description || 'success',
    201: 'created',
    204: 'deleted',
    400: description || 'validation_error',
    401: 'unauthorized',
    403: 'forbidden',
    404: 'not_found',
    409: 'conflict',
    429: 'rate_limited',
    500: 'server_error',
    502: 'bad_gateway',
    503: 'service_unavailable'
  };
  
  return scenarioMap[code] || description || `status_${code}`;
}

// Generate routes and update config
const mockIndexPath = process.argv[2] || '../mocks/index.json';
const configPath = process.argv[3] || './config.json';

const routes = generateRoutesFromMockIndex(mockIndexPath);
const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
config.routes = routes;

fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
console.log(`Generated ${routes.length} routes from mock index`);
```

