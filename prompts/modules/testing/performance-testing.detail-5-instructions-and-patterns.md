## Instructions

### 1. Configure Performance Testing Environment

Set up your performance testing infrastructure with distributed execution capabilities:

```bash
# Install performance testing tools
npm install -g k6 artillery
pip install locust

# Set up monitoring infrastructure
docker-compose up -d prometheus grafana

# Configure test data and environments
export PERFORMANCE_TEST_ENV=staging
export TARGET_BASE_URL=https://api.staging.example.com
export DATADOG_API_KEY=your_api_key
```

### 2. Define Performance Test Strategy

Create comprehensive test scenarios covering different performance aspects:

```typescript
// Define performance objectives
const performanceObjectives = {
  responseTime: { p95: 500, p99: 1000 },
  throughput: { min: 1000 },
  errorRate: { max: 0.01 },
  availability: { min: 99.9 }
};

// Configure test scenarios
const testScenarios = [
  { name: 'load-test', users: 100, duration: '10m' },
  { name: 'stress-test', users: 500, rampUp: '5m' },
  { name: 'spike-test', users: 1000, duration: '2m' },
  { name: 'endurance-test', users: 200, duration: '2h' }
];
```

### 3. Implement AI-Driven Analysis

Configure machine learning models for intelligent performance analysis:

```typescript
// Set up AI analysis configuration
const aiConfig = {
  models: ['anomaly-detection', 'pattern-recognition', 'prediction'],
  features: ['response-time', 'throughput', 'error-rate', 'resource-usage'],
  training: { historicalData: '30d', retraining: 'weekly' }
};

// Enable real-time adaptation
const adaptationConfig = {
  triggers: ['anomaly-detected', 'threshold-exceeded'],
  actions: ['scale-load', 'adjust-parameters', 'enable-circuit-breaker']
};
```

### 4. Execute Distributed Performance Tests

Run coordinated tests across multiple nodes with intelligent orchestration:

```typescript
// Configure distributed execution
const distributedConfig = {
  regions: ['us-east-1', 'eu-west-1', 'ap-southeast-1'],
  nodesPerRegion: 3,
  coordination: 'synchronized',
  loadBalancing: 'intelligent'
};

// Execute performance campaign
const campaign = await performanceOrchestrator.execute({
  strategy: 'adaptive',
  scenarios: testScenarios,
  distribution: distributedConfig,
  monitoring: { realTime: true, aiAnalysis: true }
});
```

### 5. Integrate with Chaos Engineering

Combine performance testing with resilience testing and failure injection:

```typescript
// Configure chaos-performance integration
const chaosConfig = {
  experiments: ['network-latency', 'service-failure', 'resource-exhaustion'],
  timing: 'during-peak-load',
  safetyMechanisms: ['blast-radius-control', 'automatic-rollback']
};

// Execute chaos-performance tests
const chaosResults = await chaosIntegrator.execute({
  performanceBaseline: campaign.results,
  chaosExperiments: chaosConfig.experiments,
  resilience: { testing: true, validation: true }
});
```

### 6. Monitor and Analyze Results

Implement comprehensive monitoring with real-time analysis and automated optimization:

```typescript
// Set up monitoring dashboard
const monitoring = {
  metrics: ['response-time', 'throughput', 'error-rate', 'resource-usage'],
  alerts: { critical: true, predictive: true },
  dashboards: ['real-time', 'historical', 'comparison']
};

// Generate intelligent recommendations
const recommendations = await aiAnalyzer.generateRecommendations({
  results: campaign.results,
  patterns: campaign.patterns,
  predictions: campaign.predictions
});
```

## Implementation Patterns

### K6 Load Test Pattern

```javascript
// k6-load-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

const errorRate = new Rate('errors');
const responseTime = new Trend('response_time');

export const options = {
  stages: [
    { duration: '2m', target: 100 },  // Ramp up
    { duration: '5m', target: 100 },  // Steady state
    { duration: '2m', target: 200 },  // Spike
    { duration: '5m', target: 200 },  // Steady at peak
    { duration: '2m', target: 0 },    // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500', 'p(99)<1000'],
    errors: ['rate<0.01'],
    http_req_failed: ['rate<0.01'],
  },
};

export default function () {
  const baseUrl = __ENV.BASE_URL || 'http://localhost:3000';
  
  // Login scenario
  const loginRes = http.post(`${baseUrl}/api/auth/login`, JSON.stringify({
    email: 'test@example.com',
    password: 'password123'
  }), {
    headers: { 'Content-Type': 'application/json' }
  });

  check(loginRes, {
    'login successful': (r) => r.status === 200,
    'has token': (r) => r.json('token') !== undefined,
  });

  errorRate.add(loginRes.status !== 200);
  responseTime.add(loginRes.timings.duration);

  if (loginRes.status === 200) {
    const token = loginRes.json('token');
    
    // API calls with authentication
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    // Get user profile
    const profileRes = http.get(`${baseUrl}/api/users/me`, { headers });
    check(profileRes, {
      'profile loaded': (r) => r.status === 200,
    });

    // List products
    const productsRes = http.get(`${baseUrl}/api/products?limit=20`, { headers });
    check(productsRes, {
      'products loaded': (r) => r.status === 200,
      'has products': (r) => r.json('data').length > 0,
    });
  }

  sleep(1);
}
```

### Artillery Test Pattern

```yaml
# artillery-config.yaml
config:
  target: "{{ $processEnvironment.BASE_URL }}"
  phases:
    - duration: 120
      arrivalRate: 10
      name: "Warm up"
    - duration: 300
      arrivalRate: 50
      name: "Sustained load"
    - duration: 120
      arrivalRate: 100
      name: "Peak load"
  defaults:
    headers:
      Content-Type: "application/json"
  plugins:
    expect: {}
    metrics-by-endpoint: {}

scenarios:
  - name: "User journey"
    weight: 70
    flow:
      - post:
          url: "/api/auth/login"
          json:
            email: "{{ $randomString(8) }}@test.com"
            password: "password123"
          capture:
            - json: "$.token"
              as: "authToken"
          expect:
            - statusCode: 200
      - get:
          url: "/api/products"
          headers:
            Authorization: "Bearer {{ authToken }}"
          expect:
            - statusCode: 200
      - post:
          url: "/api/cart/items"
          headers:
            Authorization: "Bearer {{ authToken }}"
          json:
            productId: "{{ $randomString(10) }}"
            quantity: 1
          expect:
            - statusCode: 201

  - name: "Browse only"
    weight: 30
    flow:
      - get:
          url: "/api/products"
          expect:
            - statusCode: 200
      - get:
          url: "/api/products/{{ $randomString(10) }}"
          expect:
            - statusCode:
                - 200
                - 404
```


