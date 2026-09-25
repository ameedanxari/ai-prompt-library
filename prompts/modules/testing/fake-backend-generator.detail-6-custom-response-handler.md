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

