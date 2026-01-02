# Fake Backend Generator Module

## Purpose
Generate lightweight fake backend server specifications that serve centralized mock data for local development and testing. This module enables complete integration testing without network mocks, provides realistic API responses for QA testing, and supports scenario simulation including success, errors, timeouts, and slow responses.

## Instructions

### When to Use This Module
- When setting up local development environment that needs API responses
- When implementing integration tests that require realistic backend behavior
- When QA needs to test against various API response scenarios
- When developing offline-first features that need backend simulation
- When eliminating network mocks from test code in favor of real HTTP calls

### Implementation Steps
1. **Define Server Configuration**: Specify port, host, and mock data paths
2. **Configure Routing**: Map API endpoints to mock data files
3. **Set Up Scenarios**: Configure response scenarios (success, errors, timeouts)
4. **Generate Server Code**: Create lightweight server implementation
5. **Add Health Checks**: Include health check endpoints for readiness detection
6. **Configure Logging**: Set up request/response logging for debugging
7. **Create Spawn Scripts**: Generate scripts to start/stop the fake backend

### Key Server Principles
- **Lightweight**: Minimal dependencies, fast startup time
- **Mock Data Driven**: All responses come from centralized mock data files
- **Scenario Support**: Easy switching between success, error, and edge case scenarios
- **Platform Agnostic**: Works with web, iOS, Android, and desktop clients
- **Test Integration**: Designed for seamless test runner integration

### Quality Assurance Guidelines
- Verify server starts within acceptable time (< 5 seconds)
- Ensure all mock data files are accessible via configured routes
- Test scenario switching works correctly via headers or configuration
- Validate health check endpoint responds correctly
- Check logging captures all requests and responses

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

## Usage
```bash
# Generate routes from mock index
node generate-routes.js ../mocks/index.json ./config.json

# Start fake backend with generated routes
node server.js
```
```

### 4. Scenario Simulation Support
```markdown
# Response Scenario Simulation

## Supported Scenarios

### Success Scenarios
| Scenario | Description | Status Code |
|----------|-------------|-------------|
| `success` | Standard success response | 200 |
| `created` | Resource created | 201 |
| `deleted` | Resource deleted (no content) | 204 |
| `empty` | Empty result set | 200 |
| `paginated` | Paginated results | 200 |

### Error Scenarios
| Scenario | Description | Status Code |
|----------|-------------|-------------|
| `validation_error` | Input validation failed | 400 |
| `unauthorized` | Authentication required | 401 |
| `forbidden` | Permission denied | 403 |
| `not_found` | Resource not found | 404 |
| `conflict` | Resource conflict | 409 |
| `rate_limited` | Too many requests | 429 |
| `server_error` | Internal server error | 500 |
| `bad_gateway` | Bad gateway | 502 |
| `service_unavailable` | Service unavailable | 503 |

### Network Simulation Scenarios
| Scenario | Description | Behavior |
|----------|-------------|----------|
| `timeout` | Request timeout | No response sent |
| `slow` | Slow response | 3 second delay |
| `intermittent` | Random failures | 50% chance of error |

## Scenario Selection Methods

### Via HTTP Header
```bash
# Request with specific scenario
curl -H "X-Mock-Scenario: validation_error" http://localhost:3001/api/v1/users

# Request with custom delay
curl -H "X-Mock-Delay: 2000" http://localhost:3001/api/v1/users
```

### Via Query Parameter
```bash
# Request with scenario query param
curl "http://localhost:3001/api/v1/users?_scenario=not_found"
```

### Via Environment Variable
```bash
# Set default scenario for all requests
FAKE_BACKEND_DEFAULT_SCENARIO=error node server.js
```

## Custom Scenario Handler
```javascript
// Add custom scenario handling in server.js
function handleCustomScenario(scenario, req, res, routeConfig) {
  switch (scenario) {
    case 'intermittent':
      // 50% chance of error
      if (Math.random() > 0.5) {
        return sendMockResponse(res, routeConfig.scenarios.error);
      }
      return sendMockResponse(res, routeConfig.scenarios.success);
    
    case 'progressive_failure':
      // Fail after N requests
      const requestCount = incrementRequestCount(req.path);
      if (requestCount > 3) {
        return sendMockResponse(res, routeConfig.scenarios.error);
      }
      return sendMockResponse(res, routeConfig.scenarios.success);
    
    default:
      return null; // Use default handling
  }
}
```
```

### 5. Python/FastAPI Fake Backend Implementation
```markdown
# FastAPI Fake Backend Server

## Server Implementation (fake_backend/server.py)
```python
import json
import os
import asyncio
from pathlib import Path
from typing import Optional
from fastapi import FastAPI, Request, Response, Header
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

app = FastAPI(title="Fake Backend Server")

# Load configuration
config_path = Path(__file__).parent / "config.json"
with open(config_path) as f:
    config = json.load(f)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=config.get("cors", {}).get("origins", ["*"]),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mock data base path
MOCK_DATA_PATH = Path(__file__).parent.parent / config.get("mockDataPath", "mocks")


@app.get("/health")
async def health_check():
    """Health check endpoint for readiness detection."""
    return {"status": "healthy", "mock_data_path": str(MOCK_DATA_PATH)}


@app.get("/ready")
async def readiness_check():
    """Readiness check endpoint."""
    return {"ready": True, "routes_loaded": len(config.get("routes", []))}


async def get_mock_response(
    mock_file: str,
    scenario: str,
    delay: int = 0
) -> tuple[dict, int]:
    """Load mock response from file with optional delay."""
    
    # Handle timeout scenario
    if scenario == "timeout":
        await asyncio.sleep(30)  # Simulate timeout
        return {"error": "timeout"}, 504
    
    # Handle slow scenario
    if scenario == "slow":
        await asyncio.sleep(config.get("timeouts", {}).get("slow", 3))
    
    # Apply custom delay
    if delay > 0:
        await asyncio.sleep(delay / 1000)
    
    # Load mock file
    mock_path = MOCK_DATA_PATH / mock_file
    
    try:
        with open(mock_path) as f:
            data = json.load(f)
        
        # Extract status code from filename
        filename = mock_path.name
        status_code = int(filename.split("-")[0])
        
        return data, status_code
    except FileNotFoundError:
        return {"error": "Mock file not found", "path": str(mock_path)}, 500
    except Exception as e:
        return {"error": str(e)}, 500


def create_route_handler(route_config: dict):
    """Create a route handler for the given configuration."""
    
    async def handler(
        request: Request,
        x_mock_scenario: Optional[str] = Header(None),
        x_mock_delay: Optional[int] = Header(0),
        _scenario: Optional[str] = None
    ):
        # Determine scenario
        scenario = x_mock_scenario or _scenario or "success"
        
        # Get mock file for scenario
        scenarios = route_config.get("scenarios", {})
        mock_file = scenarios.get(scenario, route_config.get("mockFile"))
        
        # Get response
        data, status_code = await get_mock_response(mock_file, scenario, x_mock_delay)
        
        return Response(
            content=json.dumps(data),
            status_code=status_code,
            media_type="application/json"
        )
    
    return handler


# Register routes from configuration
for route in config.get("routes", []):
    method = route["method"].lower()
    path = route["path"]
    handler = create_route_handler(route)
    
    # Register route with FastAPI
    getattr(app, method)(path)(handler)


if __name__ == "__main__":
    port = int(os.environ.get("FAKE_BACKEND_PORT", config.get("port", 3001)))
    uvicorn.run(app, host="0.0.0.0", port=port)
```

## Requirements (fake_backend/requirements.txt)
```
fastapi>=0.100.0
uvicorn>=0.23.0
```

## Usage
```bash
# Install dependencies
pip install -r requirements.txt

# Start server
python server.py

# Or with uvicorn directly
uvicorn server:app --port 3001 --reload
```
```

### 6. Docker Configuration for Fake Backend
```markdown
# Docker Configuration

## Dockerfile (fake-backend/Dockerfile)
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy server files
COPY . .

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3001/health || exit 1

# Start server
CMD ["node", "server.js"]
```

## Docker Compose (docker-compose.fake-backend.yml)
```yaml
version: '3.8'

services:
  fake-backend:
    build:
      context: ./fake-backend
      dockerfile: Dockerfile
    ports:
      - "3001:3001"
    volumes:
      - ./mocks:/app/mocks:ro
    environment:
      - FAKE_BACKEND_PORT=3001
      - NODE_ENV=development
    healthcheck:
      test: ["CMD", "wget", "--spider", "http://localhost:3001/health"]
      interval: 10s
      timeout: 5s
      retries: 3
      start_period: 10s

  # Optional: Run with app for local development
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - API_BASE_URL=http://fake-backend:3001
    depends_on:
      fake-backend:
        condition: service_healthy
```

## Usage
```bash
# Start fake backend only
docker-compose -f docker-compose.fake-backend.yml up fake-backend

# Start with app
docker-compose -f docker-compose.fake-backend.yml up

# Build and start
docker-compose -f docker-compose.fake-backend.yml up --build
```
```

## Core Functionality

### Server Specification Generation Prompt
```
You are a fake backend server specification generator. Your task is to create a lightweight server that serves centralized mock data for testing and development.

**Generation Process:**

1. **Analyze mock data structure** from mocks/index.json:
   - Identify all API endpoints
   - Map HTTP methods to mock files
   - Catalog available response scenarios

2. **Generate server configuration**:
   ```json
   {
     "port": 3001,
     "host": "localhost",
     "mockDataPath": "./mocks",
     "cors": { "enabled": true, "origins": ["*"] },
     "logging": { "enabled": true, "level": "info" },
     "routes": [/* generated from mock index */]
   }
   ```

3. **Create route handlers** for each endpoint:
   - Map path parameters (e.g., /users/:id)
   - Support scenario selection via headers
   - Load mock data from centralized files
   - Return appropriate status codes

4. **Add infrastructure endpoints**:
   - GET /health - Health check
   - GET /ready - Readiness check
   - GET /scenarios - List available scenarios

5. **Implement scenario simulation**:
   - Success scenarios (2xx responses)
   - Error scenarios (4xx, 5xx responses)
   - Network scenarios (timeout, slow, intermittent)

**Output Format:**
```markdown
# Fake Backend Server Specification

## Configuration
[Server configuration JSON]

## Routes
| Method | Path | Default Mock | Available Scenarios |
|--------|------|--------------|---------------------|
| GET | /api/v1/users | 200-success.json | success, empty, unauthorized, error |

## Implementation
[Server code in target language]

## Startup Script
[Script to start the server]
```
```

### Routing Configuration Prompt
```
You are a routing configuration generator for fake backend servers. Your task is to create route configurations that map API endpoints to mock data files.

**Configuration Process:**

1. **Parse mock data index** to identify endpoints
2. **Generate route entries** with:
   - HTTP method
   - URL path (with parameter placeholders)
   - Default mock file
   - Available scenarios mapped to mock files

3. **Handle path parameters**:
   - Convert `{id}` to `:id` for Express
   - Convert `{id}` to `<id>` for FastAPI
   - Support nested parameters

4. **Map scenarios to mock files**:
   - success → 200-success.json
   - created → 201-created.json
   - validation_error → 400-validation-error.json
   - unauthorized → 401-unauthorized.json
   - not_found → 404-not-found.json
   - error → 500-server-error.json

**Output Format:**
```json
{
  "routes": [
    {
      "method": "GET",
      "path": "/api/v1/users",
      "mockFile": "api/v1/users/GET/200-success.json",
      "scenarios": {
        "success": "api/v1/users/GET/200-success.json",
        "unauthorized": "api/v1/users/GET/401-unauthorized.json"
      }
    }
  ]
}
```
```

### Scenario Simulation Prompt
```
You are a scenario simulation specialist for fake backend servers. Your task is to implement various response scenarios for testing different application behaviors.

**Scenario Categories:**

1. **Success Scenarios**:
   - `success` - Standard 200 response
   - `created` - 201 resource created
   - `empty` - 200 with empty data
   - `paginated` - 200 with pagination

2. **Client Error Scenarios**:
   - `validation_error` - 400 bad request
   - `unauthorized` - 401 authentication required
   - `forbidden` - 403 permission denied
   - `not_found` - 404 resource not found
   - `conflict` - 409 resource conflict
   - `rate_limited` - 429 too many requests

3. **Server Error Scenarios**:
   - `server_error` - 500 internal error
   - `bad_gateway` - 502 bad gateway
   - `service_unavailable` - 503 service unavailable

4. **Network Simulation Scenarios**:
   - `timeout` - No response (simulate timeout)
   - `slow` - Delayed response (3+ seconds)
   - `intermittent` - Random success/failure

**Implementation:**
```javascript
function handleScenario(scenario, routeConfig, res) {
  switch (scenario) {
    case 'timeout':
      // Don't respond - let client timeout
      return;
    case 'slow':
      setTimeout(() => sendResponse(res, routeConfig), 3000);
      return;
    case 'intermittent':
      const shouldFail = Math.random() > 0.5;
      const mockFile = shouldFail 
        ? routeConfig.scenarios.error 
        : routeConfig.scenarios.success;
      sendResponse(res, mockFile);
      return;
    default:
      sendResponse(res, routeConfig.scenarios[scenario]);
  }
}
```
```

## Usage Instructions

**Basic Fake Backend Generation:**
```markdown
#[[module:testing/fake-backend-generator.md]]
```

**With Specific Framework:**
```markdown
#[[module:testing/fake-backend-generator.md|framework=express]]
#[[module:testing/fake-backend-generator.md|framework=fastapi]]
```

**Parameters:**
- `framework`: Target framework (express, fastapi, go-chi) - default: express
- `port`: Server port - default: 3001
- `mock_path`: Path to mock data directory - default: ./mocks
- `docker`: Generate Docker configuration - default: true

## Integration Points
- Requires [centralized-mock-data.md](./centralized-mock-data.md) for mock data organization
- Feeds into [debug-menu-integration.md](./debug-menu-integration.md) for app environment switching
- Supports test runner integration for automated testing
- Works with [mock-validation.md](./mock-validation.md) for contract compliance


---

## Spawn Scripts and Configuration

### Spawn Script Generation

#### Node.js Spawn Script (scripts/start-fake-backend.js)
```javascript
#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const http = require('http');

const FAKE_BACKEND_DIR = path.join(__dirname, '..', 'fake-backend');
const PORT = process.env.FAKE_BACKEND_PORT || 3001;
const HEALTH_CHECK_URL = `http://localhost:${PORT}/health`;
const MAX_RETRIES = 30;
const RETRY_INTERVAL = 1000;

let serverProcess = null;

function startServer() {
  console.log('Starting fake backend server...');
  
  serverProcess = spawn('node', ['server.js'], {
    cwd: FAKE_BACKEND_DIR,
    env: { ...process.env, FAKE_BACKEND_PORT: PORT },
    stdio: ['ignore', 'pipe', 'pipe']
  });
  
  serverProcess.stdout.on('data', (data) => {
    console.log(`[fake-backend] ${data.toString().trim()}`);
  });
  
  serverProcess.stderr.on('data', (data) => {
    console.error(`[fake-backend:error] ${data.toString().trim()}`);
  });
  
  serverProcess.on('close', (code) => {
    console.log(`Fake backend exited with code ${code}`);
  });
  
  return serverProcess;
}

async function waitForReady(retries = MAX_RETRIES) {
  for (let i = 0; i < retries; i++) {
    try {
      await new Promise((resolve, reject) => {
        const req = http.get(HEALTH_CHECK_URL, (res) => {
          if (res.statusCode === 200) {
            resolve();
          } else {
            reject(new Error(`Health check returned ${res.statusCode}`));
          }
        });
        req.on('error', reject);
        req.setTimeout(1000, () => {
          req.destroy();
          reject(new Error('Health check timeout'));
        });
      });
      
      console.log(`Fake backend is ready on port ${PORT}`);
      return true;
    } catch (error) {
      if (i < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, RETRY_INTERVAL));
      }
    }
  }
  
  throw new Error(`Fake backend failed to start after ${retries} retries`);
}

function stopServer() {
  if (serverProcess) {
    console.log('Stopping fake backend server...');
    serverProcess.kill('SIGTERM');
    serverProcess = null;
  }
}

// Handle process termination
process.on('SIGINT', () => {
  stopServer();
  process.exit(0);
});

process.on('SIGTERM', () => {
  stopServer();
  process.exit(0);
});

// Export for programmatic use
module.exports = { startServer, waitForReady, stopServer };

// Run if executed directly
if (require.main === module) {
  startServer();
  waitForReady()
    .then(() => console.log('Fake backend started successfully'))
    .catch((error) => {
      console.error('Failed to start fake backend:', error.message);
      stopServer();
      process.exit(1);
    });
}
```

#### Bash Spawn Script (scripts/start-fake-backend.sh)
```bash
#!/bin/bash

# Fake Backend Spawn Script
# Usage: ./start-fake-backend.sh [port]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FAKE_BACKEND_DIR="${SCRIPT_DIR}/../fake-backend"
PORT="${1:-${FAKE_BACKEND_PORT:-3001}}"
HEALTH_CHECK_URL="http://localhost:${PORT}/health"
MAX_RETRIES=30
RETRY_INTERVAL=1

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if server is already running
check_existing() {
    if curl -s "${HEALTH_CHECK_URL}" > /dev/null 2>&1; then
        log_warn "Fake backend already running on port ${PORT}"
        return 0
    fi
    return 1
}

# Start the server
start_server() {
    log_info "Starting fake backend on port ${PORT}..."
    
    cd "${FAKE_BACKEND_DIR}"
    
    # Start server in background
    FAKE_BACKEND_PORT="${PORT}" node server.js &
    SERVER_PID=$!
    
    # Save PID for later cleanup
    echo "${SERVER_PID}" > "${SCRIPT_DIR}/.fake-backend.pid"
    
    log_info "Server started with PID ${SERVER_PID}"
}

# Wait for server to be ready
wait_for_ready() {
    log_info "Waiting for fake backend to be ready..."
    
    for i in $(seq 1 ${MAX_RETRIES}); do
        if curl -s "${HEALTH_CHECK_URL}" > /dev/null 2>&1; then
            log_info "Fake backend is ready!"
            return 0
        fi
        
        if [ $i -lt ${MAX_RETRIES} ]; then
            sleep ${RETRY_INTERVAL}
        fi
    done
    
    log_error "Fake backend failed to start after ${MAX_RETRIES} retries"
    return 1
}

# Stop the server
stop_server() {
    PID_FILE="${SCRIPT_DIR}/.fake-backend.pid"
    
    if [ -f "${PID_FILE}" ]; then
        PID=$(cat "${PID_FILE}")
        if kill -0 "${PID}" 2>/dev/null; then
            log_info "Stopping fake backend (PID ${PID})..."
            kill "${PID}"
            rm -f "${PID_FILE}"
        fi
    fi
}

# Cleanup on exit
cleanup() {
    stop_server
}

trap cleanup EXIT

# Main execution
main() {
    if check_existing; then
        exit 0
    fi
    
    start_server
    
    if wait_for_ready; then
        log_info "Fake backend started successfully on http://localhost:${PORT}"
        log_info "Health check: ${HEALTH_CHECK_URL}"
        
        # Keep script running to maintain server
        wait
    else
        log_error "Failed to start fake backend"
        exit 1
    fi
}

main "$@"
```

### Environment Variable Configuration

#### Environment Configuration Template (.env.fake-backend)
```bash
# Fake Backend Configuration

# Server Settings
FAKE_BACKEND_PORT=3001
FAKE_BACKEND_HOST=localhost

# Mock Data Settings
MOCK_DATA_PATH=./mocks
MOCK_INDEX_FILE=index.json

# Logging Settings
LOG_LEVEL=info
LOG_FORMAT=json
LOG_REQUESTS=true
LOG_RESPONSES=false

# CORS Settings
CORS_ENABLED=true
CORS_ORIGINS=http://localhost:3000,http://localhost:8080
CORS_METHODS=GET,POST,PUT,DELETE,PATCH,OPTIONS

# Scenario Settings
DEFAULT_SCENARIO=success
SLOW_RESPONSE_DELAY=3000
TIMEOUT_DURATION=30000

# Health Check Settings
HEALTH_CHECK_PATH=/health
READY_CHECK_PATH=/ready

# Debug Settings
DEBUG_MODE=false
VERBOSE_ERRORS=true
```

#### Configuration Loader (fake-backend/config-loader.js)
```javascript
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env.fake-backend') });

function loadConfig() {
  // Load base config from file
  const configPath = path.join(__dirname, 'config.json');
  let config = {};
  
  if (fs.existsSync(configPath)) {
    config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  }
  
  // Override with environment variables
  return {
    port: parseInt(process.env.FAKE_BACKEND_PORT) || config.port || 3001,
    host: process.env.FAKE_BACKEND_HOST || config.host || 'localhost',
    mockDataPath: process.env.MOCK_DATA_PATH || config.mockDataPath || './mocks',
    
    logging: {
      enabled: process.env.LOG_REQUESTS === 'true',
      level: process.env.LOG_LEVEL || config.logging?.level || 'info',
      format: process.env.LOG_FORMAT || config.logging?.format || 'json',
      logResponses: process.env.LOG_RESPONSES === 'true'
    },
    
    cors: {
      enabled: process.env.CORS_ENABLED !== 'false',
      origins: process.env.CORS_ORIGINS?.split(',') || config.cors?.origins || ['*'],
      methods: process.env.CORS_METHODS?.split(',') || config.cors?.methods || ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
    },
    
    scenarios: {
      default: process.env.DEFAULT_SCENARIO || config.scenarios?.default || 'success',
      slowDelay: parseInt(process.env.SLOW_RESPONSE_DELAY) || config.scenarios?.slowDelay || 3000,
      timeoutDuration: parseInt(process.env.TIMEOUT_DURATION) || config.scenarios?.timeoutDuration || 30000
    },
    
    healthCheck: {
      path: process.env.HEALTH_CHECK_PATH || '/health',
      readyPath: process.env.READY_CHECK_PATH || '/ready'
    },
    
    debug: {
      enabled: process.env.DEBUG_MODE === 'true',
      verboseErrors: process.env.VERBOSE_ERRORS !== 'false'
    },
    
    routes: config.routes || []
  };
}

module.exports = { loadConfig };
```

### Health Check and Logging Configuration

#### Health Check Implementation
```javascript
// Health check endpoints for fake-backend/server.js

// Basic health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: require('./package.json').version
  });
});

// Detailed readiness check
app.get('/ready', (req, res) => {
  const mockDataPath = path.resolve(config.mockDataPath);
  const mockIndexPath = path.join(mockDataPath, 'index.json');
  
  const checks = {
    mockDataExists: fs.existsSync(mockDataPath),
    mockIndexExists: fs.existsSync(mockIndexPath),
    routesLoaded: config.routes.length > 0
  };
  
  const isReady = Object.values(checks).every(Boolean);
  
  res.status(isReady ? 200 : 503).json({
    ready: isReady,
    checks,
    mockDataPath,
    routeCount: config.routes.length,
    timestamp: new Date().toISOString()
  });
});

// Metrics endpoint (optional)
app.get('/metrics', (req, res) => {
  res.json({
    requests: {
      total: requestMetrics.total,
      byMethod: requestMetrics.byMethod,
      byScenario: requestMetrics.byScenario,
      byStatusCode: requestMetrics.byStatusCode
    },
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    timestamp: new Date().toISOString()
  });
});
```

#### Logging Middleware
```javascript
// Logging middleware for fake-backend/server.js

const requestMetrics = {
  total: 0,
  byMethod: {},
  byScenario: {},
  byStatusCode: {}
};

function loggingMiddleware(req, res, next) {
  const startTime = Date.now();
  const requestId = generateRequestId();
  
  // Log request
  if (config.logging.enabled) {
    console.log(JSON.stringify({
      type: 'request',
      requestId,
      timestamp: new Date().toISOString(),
      method: req.method,
      path: req.path,
      query: req.query,
      scenario: req.headers['x-mock-scenario'] || 'default',
      userAgent: req.headers['user-agent']
    }));
  }
  
  // Track metrics
  requestMetrics.total++;
  requestMetrics.byMethod[req.method] = (requestMetrics.byMethod[req.method] || 0) + 1;
  
  const scenario = req.headers['x-mock-scenario'] || 'default';
  requestMetrics.byScenario[scenario] = (requestMetrics.byScenario[scenario] || 0) + 1;
  
  // Capture response
  const originalSend = res.send;
  res.send = function(body) {
    const duration = Date.now() - startTime;
    
    // Track status code
    requestMetrics.byStatusCode[res.statusCode] = 
      (requestMetrics.byStatusCode[res.statusCode] || 0) + 1;
    
    // Log response
    if (config.logging.enabled && config.logging.logResponses) {
      console.log(JSON.stringify({
        type: 'response',
        requestId,
        timestamp: new Date().toISOString(),
        statusCode: res.statusCode,
        duration: `${duration}ms`,
        bodySize: body?.length || 0
      }));
    }
    
    return originalSend.call(this, body);
  };
  
  next();
}

function generateRequestId() {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

app.use(loggingMiddleware);
```

### Custom Response Handler Extension

#### Extension Point Template (fake-backend/extensions/custom-handlers.js)
```javascript
/**
 * Custom Response Handlers
 * 
 * Extend fake backend with custom response logic for complex scenarios.
 * These handlers are called before the default mock file response.
 */

const customHandlers = new Map();

/**
 * Register a custom handler for a specific route
 * @param {string} method - HTTP method
 * @param {string} path - Route path
 * @param {Function} handler - Custom handler function
 */
function registerHandler(method, path, handler) {
  const key = `${method.toUpperCase()}:${path}`;
  customHandlers.set(key, handler);
}

/**
 * Get custom handler for a route
 * @param {string} method - HTTP method
 * @param {string} path - Route path
 * @returns {Function|null} Custom handler or null
 */
function getHandler(method, path) {
  const key = `${method.toUpperCase()}:${path}`;
  return customHandlers.get(key) || null;
}

/**
 * Execute custom handler if registered
 * @param {Request} req - Express request
 * @param {Response} res - Express response
 * @param {Object} routeConfig - Route configuration
 * @returns {boolean} True if handled, false to continue with default
 */
async function executeCustomHandler(req, res, routeConfig) {
  const handler = getHandler(req.method, req.path);
  
  if (handler) {
    const result = await handler(req, res, routeConfig);
    return result !== false; // Return true unless handler explicitly returns false
  }
  
  return false; // No custom handler, use default
}

// Example custom handlers

// Dynamic user ID handler
registerHandler('GET', '/api/v1/users/:id', (req, res, routeConfig) => {
  const userId = req.params.id;
  
  // Return 404 for specific test IDs
  if (userId === 'not-found' || userId === '000') {
    return false; // Use default 404 mock
  }
  
  // Generate dynamic response for valid IDs
  if (userId.match(/^[a-f0-9-]{36}$/)) {
    res.json({
      id: userId,
      email: `user-${userId.slice(0, 8)}@example.com`,
      name: `User ${userId.slice(0, 8)}`,
      createdAt: new Date().toISOString()
    });
    return true;
  }
  
  return false; // Use default mock
});

// Stateful cart handler
const cartState = new Map();

registerHandler('POST', '/api/v1/cart', (req, res, routeConfig) => {
  const sessionId = req.headers['x-session-id'] || 'default';
  const cart = cartState.get(sessionId) || { items: [] };
  
  cart.items.push(req.body);
  cartState.set(sessionId, cart);
  
  res.status(200).json({
    success: true,
    cart: cart,
    itemCount: cart.items.length
  });
  
  return true;
});

registerHandler('GET', '/api/v1/cart', (req, res, routeConfig) => {
  const sessionId = req.headers['x-session-id'] || 'default';
  const cart = cartState.get(sessionId) || { items: [] };
  
  res.json(cart);
  return true;
});

// Rate limiting simulation
const rateLimitState = new Map();

registerHandler('POST', '/api/v1/auth/login', (req, res, routeConfig) => {
  const clientIp = req.ip || 'unknown';
  const attempts = rateLimitState.get(clientIp) || 0;
  
  if (attempts >= 5) {
    res.status(429).json({
      error: 'RATE_LIMITED',
      message: 'Too many login attempts',
      retryAfter: 300
    });
    return true;
  }
  
  rateLimitState.set(clientIp, attempts + 1);
  
  // Reset after 1 minute
  setTimeout(() => rateLimitState.delete(clientIp), 60000);
  
  return false; // Use default mock
});

module.exports = {
  registerHandler,
  getHandler,
  executeCustomHandler
};
```

#### Using Custom Handlers in Server
```javascript
// In fake-backend/server.js

const { executeCustomHandler } = require('./extensions/custom-handlers');

function createRouteHandler(routeConfig) {
  return async (req, res) => {
    // Try custom handler first
    const handled = await executeCustomHandler(req, res, routeConfig);
    if (handled) return;
    
    // Fall back to default mock file handling
    const scenario = req.headers['x-mock-scenario'] || 
                     req.query._scenario || 
                     'success';
    
    const mockFile = routeConfig.scenarios[scenario] || routeConfig.mockFile;
    sendMockResponse(res, mockFile);
  };
}
```

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
