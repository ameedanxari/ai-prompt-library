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

