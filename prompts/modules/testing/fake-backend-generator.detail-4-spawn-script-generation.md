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

