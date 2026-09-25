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

