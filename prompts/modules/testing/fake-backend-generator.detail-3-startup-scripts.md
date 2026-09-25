## Implementation Patterns

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

