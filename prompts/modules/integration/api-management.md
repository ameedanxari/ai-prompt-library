# API Management Template

## Purpose

Provides comprehensive patterns for implementing API gateways, rate limiting, authentication, and API documentation systems. This template covers the full API lifecycle from design to deprecation, including versioning, throttling, security, and developer experience.

## Context

Modern applications require robust API management to handle internal microservices communication, external partner integrations, and public API access. This template addresses API gateway functionality, traffic management, security enforcement, and documentation generation while ensuring scalability, reliability, and developer-friendly experiences.

## Core Components

### API Gateway System

## Examples

```typescript
interface APIGateway {
  // API registration and management
  registerAPI(definition: APIDefinition): Promise<RegisteredAPI>;
  updateAPI(apiId: string, updates: Partial<APIDefinition>): Promise<RegisteredAPI>;
  deprecateAPI(apiId: string, deprecationDate: Date): Promise<void>;
  deleteAPI(apiId: string): Promise<void>;
  
  // Request handling
  routeRequest(request: GatewayRequest): Promise<GatewayResponse>;
  transformRequest(request: GatewayRequest, rules: TransformationRule[]): Promise<GatewayRequest>;
  transformResponse(response: GatewayResponse, rules: TransformationRule[]): Promise<GatewayResponse>;
  
  // Policy enforcement
  applyPolicies(request: GatewayRequest, policies: APIPolicy[]): Promise<PolicyResult>;
  validateRequest(request: GatewayRequest, schema: RequestSchema): ValidationResult;
}

interface APIDefinition {
  id: string;
  name: string;
  version: string;
  basePath: string;
  description: string;
  endpoints: APIEndpoint[];
  authentication: AuthenticationConfig;
  rateLimiting: RateLimitConfig;
  caching: CachingConfig;
  cors: CORSConfig;
  documentation: DocumentationConfig;
  metadata: Record<string, any>;
}

interface APIEndpoint {
  id: string;
  path: string;
  method: HTTPMethod;
  description: string;
  parameters: ParameterDefinition[];
  requestBody?: RequestBodySchema;
  responses: ResponseDefinition[];
  security: SecurityRequirement[];
  rateLimit?: EndpointRateLimit;
  cache?: EndpointCacheConfig;
  timeout: number;
  retryPolicy?: RetryPolicy;
}

interface GatewayRequest {
  id: string;
  method: HTTPMethod;
  path: string;
  headers: Record<string, string>;
  queryParams: Record<string, string>;
  body?: any;
  clientInfo: ClientInfo;
  timestamp: Date;
}

interface GatewayResponse {
  statusCode: number;
  headers: Record<string, string>;
  body: any;
  metadata: ResponseMetadata;
}
```

### Rate Limiting System

```typescript
interface RateLimiter {
  // Rate limit checking
  checkLimit(key: string, config: RateLimitConfig): Promise<RateLimitResult>;
  consumeToken(key: string, tokens?: number): Promise<boolean>;
  getRemainingTokens(key: string): Promise<number>;
  
  // Configuration
  setLimit(key: string, config: RateLimitConfig): Promise<void>;
  removeLimit(key: string): Promise<void>;
  
  // Quota management
  getQuotaUsage(key: string): Promise<QuotaUsage>;
  resetQuota(key: string): Promise<void>;
}

interface RateLimitConfig {
  strategy: RateLimitStrategy;
  limits: RateLimit[];
  keyExtractor: KeyExtractorConfig;
  burstAllowance?: number;
  quotaReset: QuotaResetConfig;
}

enum RateLimitStrategy {
  FIXED_WINDOW = 'fixed_window',
  SLIDING_WINDOW = 'sliding_window',
  TOKEN_BUCKET = 'token_bucket',
  LEAKY_BUCKET = 'leaky_bucket',
  ADAPTIVE = 'adaptive'
}

interface RateLimit {
  tier: string;
  requests: number;
  period: TimePeriod;
  burstLimit?: number;
}

interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetTime: Date;
  retryAfter?: number;
}

interface QuotaUsage {
  used: number;
  limit: number;
  percentage: number;
  resetTime: Date;
  history: UsageHistoryEntry[];
}
```

### API Documentation Generator

```typescript
interface APIDocumentationGenerator {
  // Documentation generation
  generateOpenAPISpec(api: APIDefinition): Promise<OpenAPISpec>;
  generateAsyncAPISpec(api: APIDefinition): Promise<AsyncAPISpec>;
  generateMarkdownDocs(api: APIDefinition): Promise<string>;
  
  // Interactive documentation
  generateSwaggerUI(spec: OpenAPISpec): Promise<SwaggerUIConfig>;
  generateRedocConfig(spec: OpenAPISpec): Promise<RedocConfig>;
  
  // SDK generation
  generateSDK(spec: OpenAPISpec, language: SDKLanguage): Promise<SDKPackage>;
  generatePostmanCollection(api: APIDefinition): Promise<PostmanCollection>;
}

interface OpenAPISpec {
  openapi: string;
  info: APIInfo;
  servers: ServerDefinition[];
  paths: Record<string, PathItem>;
  components: ComponentsObject;
  security: SecurityRequirement[];
  tags: TagDefinition[];
}

interface SDKPackage {
  language: SDKLanguage;
  version: string;
  files: GeneratedFile[];
  documentation: string;
  examples: CodeExample[];
  tests: TestFile[];
}

enum SDKLanguage {
  TYPESCRIPT = 'typescript',
  JAVASCRIPT = 'javascript',
  PYTHON = 'python',
  JAVA = 'java',
  GO = 'go',
  CSHARP = 'csharp',
  RUBY = 'ruby',
  PHP = 'php'
}
```

### API Versioning Manager

```typescript
interface APIVersionManager {
  // Version management
  createVersion(apiId: string, version: VersionConfig): Promise<APIVersion>;
  deprecateVersion(apiId: string, version: string, sunset: Date): Promise<void>;
  retireVersion(apiId: string, version: string): Promise<void>;
  
  // Version routing
  resolveVersion(request: GatewayRequest): Promise<string>;
  getActiveVersions(apiId: string): Promise<APIVersion[]>;
  
  // Migration support
  generateMigrationGuide(fromVersion: string, toVersion: string): Promise<MigrationGuide>;
  validateBackwardCompatibility(oldVersion: APIVersion, newVersion: APIVersion): Promise<CompatibilityReport>;
}

interface APIVersion {
  version: string;
  status: VersionStatus;
  releaseDate: Date;
  deprecationDate?: Date;
  sunsetDate?: Date;
  changelog: ChangelogEntry[];
  breakingChanges: BreakingChange[];
}

enum VersionStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  DEPRECATED = 'deprecated',
  RETIRED = 'retired'
}

interface VersionConfig {
  version: string;
  versioningStrategy: VersioningStrategy;
  headerName?: string;
  queryParam?: string;
}

enum VersioningStrategy {
  URL_PATH = 'url_path',
  HEADER = 'header',
  QUERY_PARAM = 'query_param',
  CONTENT_TYPE = 'content_type'
}
```

## Implementation Patterns

### API Gateway Request Processing

```typescript
class APIGatewayProcessor {
  private rateLimiter: RateLimiter;
  private authenticator: APIAuthenticator;
  private router: APIRouter;
  private transformer: RequestTransformer;
  
  async processRequest(request: GatewayRequest): Promise<GatewayResponse> {
    const context = new RequestContext(request);
    
    try {
      // 1. Route matching
      const route = await this.router.matchRoute(request);
      if (!route) {
        return this.createErrorResponse(404, 'Endpoint not found');
      }
      context.route = route;
      
      // 2. Authentication
      const authResult = await this.authenticator.authenticate(request, route.security);
      if (!authResult.authenticated) {
        return this.createErrorResponse(401, authResult.error || 'Unauthorized');
      }
      context.auth = authResult;
      
      // 3. Rate limiting
      const rateLimitKey = this.extractRateLimitKey(request, authResult);
      const rateLimitResult = await this.rateLimiter.checkLimit(rateLimitKey, route.rateLimit);
      if (!rateLimitResult.allowed) {
        return this.createRateLimitResponse(rateLimitResult);
      }
      
      // 4. Request validation
      const validationResult = await this.validateRequest(request, route.requestSchema);
      if (!validationResult.valid) {
        return this.createErrorResponse(400, 'Validation failed', validationResult.errors);
      }
      
      // 5. Request transformation
      const transformedRequest = await this.transformer.transform(request, route.transformations);
      
      // 6. Backend call with circuit breaker
      const backendResponse = await this.callBackend(transformedRequest, route);
      
      // 7. Response transformation
      const transformedResponse = await this.transformer.transformResponse(
        backendResponse, 
        route.responseTransformations
      );
      
      // 8. Add rate limit headers
      this.addRateLimitHeaders(transformedResponse, rateLimitResult);
      
      return transformedResponse;
      
    } catch (error) {
      return this.handleError(context, error);
    }
  }
  
  private async callBackend(request: GatewayRequest, route: APIRoute): Promise<GatewayResponse> {
    const circuitBreaker = this.getCircuitBreaker(route.backendService);
    
    return circuitBreaker.execute(async () => {
      const startTime = Date.now();
      
      try {
        const response = await this.httpClient.request({
          url: route.backendUrl + request.path,
          method: request.method,
          headers: request.headers,
          body: request.body,
          timeout: route.timeout
        });
        
        this.recordMetrics(route, Date.now() - startTime, response.statusCode);
        return response;
        
      } catch (error) {
        this.recordError(route, error);
        throw error;
      }
    });
  }
  
  private createRateLimitResponse(result: RateLimitResult): GatewayResponse {
    return {
      statusCode: 429,
      headers: {
        'X-RateLimit-Limit': result.limit.toString(),
        'X-RateLimit-Remaining': result.remaining.toString(),
        'X-RateLimit-Reset': result.resetTime.toISOString(),
        'Retry-After': result.retryAfter?.toString() || '60'
      },
      body: { error: 'Rate limit exceeded' },
      metadata: { rateLimited: true }
    };
  }
}
```

### Rate Limiting Implementation

```typescript
class TokenBucketRateLimiter implements RateLimiter {
  private store: RateLimitStore;
  
  async checkLimit(key: string, config: RateLimitConfig): Promise<RateLimitResult> {
    const bucket = await this.store.getBucket(key);
    const now = Date.now();
    
    // Refill tokens based on time elapsed
    const timePassed = now - bucket.lastRefill;
    const refillRate = config.limits[0].requests / this.periodToMs(config.limits[0].period);
    const tokensToAdd = Math.floor(timePassed * refillRate);
    
    bucket.tokens = Math.min(
      bucket.tokens + tokensToAdd,
      config.limits[0].requests + (config.burstAllowance || 0)
    );
    bucket.lastRefill = now;
    
    // Check if request can be allowed
    if (bucket.tokens >= 1) {
      bucket.tokens -= 1;
      await this.store.saveBucket(key, bucket);
      
      return {
        allowed: true,
        limit: config.limits[0].requests,
        remaining: Math.floor(bucket.tokens),
        resetTime: new Date(now + this.periodToMs(config.limits[0].period))
      };
    }
    
    // Calculate retry time
    const timeToNextToken = Math.ceil(1 / refillRate);
    
    return {
      allowed: false,
      limit: config.limits[0].requests,
      remaining: 0,
      resetTime: new Date(now + this.periodToMs(config.limits[0].period)),
      retryAfter: timeToNextToken
    };
  }
  
  private periodToMs(period: TimePeriod): number {
    const multipliers = {
      second: 1000,
      minute: 60000,
      hour: 3600000,
      day: 86400000
    };
    return period.value * multipliers[period.unit];
  }
}

class AdaptiveRateLimiter implements RateLimiter {
  private baseRateLimiter: RateLimiter;
  private metricsCollector: MetricsCollector;
  
  async checkLimit(key: string, config: RateLimitConfig): Promise<RateLimitResult> {
    // Get current system load
    const systemLoad = await this.metricsCollector.getSystemLoad();
    
    // Adjust limits based on load
    const adjustedConfig = this.adjustLimitsForLoad(config, systemLoad);
    
    return this.baseRateLimiter.checkLimit(key, adjustedConfig);
  }
  
  private adjustLimitsForLoad(config: RateLimitConfig, load: SystemLoad): RateLimitConfig {
    const loadFactor = this.calculateLoadFactor(load);
    
    return {
      ...config,
      limits: config.limits.map(limit => ({
        ...limit,
        requests: Math.floor(limit.requests * loadFactor)
      }))
    };
  }
  
  private calculateLoadFactor(load: SystemLoad): number {
    // Reduce limits as load increases
    if (load.cpu > 80 || load.memory > 85) {
      return 0.5; // 50% of normal limits
    } else if (load.cpu > 60 || load.memory > 70) {
      return 0.75; // 75% of normal limits
    }
    return 1.0; // Full limits
  }
}
```

### API Documentation Generation

```typescript
class OpenAPIDocumentationGenerator implements APIDocumentationGenerator {
  async generateOpenAPISpec(api: APIDefinition): Promise<OpenAPISpec> {
    return {
      openapi: '3.0.3',
      info: {
        title: api.name,
        version: api.version,
        description: api.description,
        contact: api.metadata.contact,
        license: api.metadata.license
      },
      servers: this.generateServers(api),
      paths: this.generatePaths(api.endpoints),
      components: this.generateComponents(api),
      security: this.generateSecurityRequirements(api.authentication),
      tags: this.generateTags(api.endpoints)
    };
  }
  
  private generatePaths(endpoints: APIEndpoint[]): Record<string, PathItem> {
    const paths: Record<string, PathItem> = {};
    
    for (const endpoint of endpoints) {
      if (!paths[endpoint.path]) {
        paths[endpoint.path] = {};
      }
      
      paths[endpoint.path][endpoint.method.toLowerCase()] = {
        operationId: endpoint.id,
        summary: endpoint.description,
        parameters: this.generateParameters(endpoint.parameters),
        requestBody: endpoint.requestBody ? this.generateRequestBody(endpoint.requestBody) : undefined,
        responses: this.generateResponses(endpoint.responses),
        security: endpoint.security,
        tags: endpoint.tags
      };
    }
    
    return paths;
  }
  
  async generateSDK(spec: OpenAPISpec, language: SDKLanguage): Promise<SDKPackage> {
    const generator = this.getSDKGenerator(language);
    
    const files = await generator.generate(spec, {
      packageName: this.generatePackageName(spec.info.title),
      version: spec.info.version,
      includeModels: true,
      includeClient: true,
      includeExamples: true
    });
    
    return {
      language,
      version: spec.info.version,
      files,
      documentation: await this.generateSDKDocumentation(spec, language),
      examples: await this.generateSDKExamples(spec, language),
      tests: await this.generateSDKTests(spec, language)
    };
  }
}
```

## Integration Points

### Authentication Provider Integration

```typescript
interface AuthenticationIntegration {
  // OAuth 2.0 / OIDC
  validateOAuthToken(token: string): Promise<TokenValidationResult>;
  exchangeAuthorizationCode(code: string): Promise<TokenSet>;
  refreshAccessToken(refreshToken: string): Promise<TokenSet>;
  
  // API Key authentication
  validateAPIKey(apiKey: string): Promise<APIKeyValidationResult>;
  createAPIKey(config: APIKeyConfig): Promise<APIKey>;
  revokeAPIKey(keyId: string): Promise<void>;
  
  // JWT authentication
  validateJWT(token: string, options: JWTValidationOptions): Promise<JWTValidationResult>;
  generateJWT(claims: JWTClaims, options: JWTGenerationOptions): Promise<string>;
}

class MultiAuthenticator implements AuthenticationIntegration {
  private providers: Map<string, AuthProvider> = new Map();
  
  async authenticate(request: GatewayRequest, requirements: SecurityRequirement[]): Promise<AuthResult> {
    for (const requirement of requirements) {
      const provider = this.providers.get(requirement.type);
      if (!provider) continue;
      
      const result = await provider.authenticate(request, requirement);
      if (result.authenticated) {
        return result;
      }
    }
    
    return { authenticated: false, error: 'No valid authentication provided' };
  }
}
```

### Backend Service Integration

```typescript
interface BackendServiceIntegration {
  // Service registry
  registerService(service: ServiceDefinition): Promise<void>;
  deregisterService(serviceId: string): Promise<void>;
  discoverService(serviceName: string): Promise<ServiceInstance[]>;
  
  // Load balancing
  selectInstance(instances: ServiceInstance[], strategy: LoadBalancingStrategy): ServiceInstance;
  
  // Health checking
  checkHealth(instance: ServiceInstance): Promise<HealthStatus>;
  getHealthyInstances(serviceName: string): Promise<ServiceInstance[]>;
}

class ServiceRouter implements BackendServiceIntegration {
  private registry: ServiceRegistry;
  private healthChecker: HealthChecker;
  
  async routeToBackend(request: GatewayRequest, serviceName: string): Promise<GatewayResponse> {
    // Discover healthy instances
    const instances = await this.getHealthyInstances(serviceName);
    if (instances.length === 0) {
      throw new ServiceUnavailableError(`No healthy instances for ${serviceName}`);
    }
    
    // Select instance using load balancing
    const instance = this.selectInstance(instances, LoadBalancingStrategy.ROUND_ROBIN);
    
    // Route request
    return this.forwardRequest(request, instance);
  }
}
```

## Security Considerations

### API Security Framework

```typescript
interface APISecurityManager {
  // Input validation
  validateInput(request: GatewayRequest, schema: ValidationSchema): ValidationResult;
  sanitizeInput(input: any): any;
  
  // Threat detection
  detectThreats(request: GatewayRequest): Promise<ThreatDetectionResult>;
  blockMaliciousRequest(request: GatewayRequest, reason: string): void;
  
  // Security headers
  applySecurityHeaders(response: GatewayResponse): GatewayResponse;
  
  // Audit logging
  logSecurityEvent(event: SecurityEvent): Promise<void>;
}

const securityConfig = {
  // Input validation
  maxRequestSize: '10mb',
  maxUrlLength: 2048,
  allowedContentTypes: ['application/json', 'application/xml', 'multipart/form-data'],
  
  // Security headers
  headers: {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'Content-Security-Policy': "default-src 'self'"
  },
  
  // Rate limiting for security
  securityRateLimits: {
    authFailures: { limit: 5, window: '15m', action: 'block' },
    suspiciousRequests: { limit: 10, window: '1h', action: 'challenge' }
  }
};
```

### CORS Configuration

```typescript
interface CORSConfig {
  allowedOrigins: string[] | '*';
  allowedMethods: HTTPMethod[];
  allowedHeaders: string[];
  exposedHeaders: string[];
  credentials: boolean;
  maxAge: number;
}

class CORSHandler {
  handlePreflight(request: GatewayRequest, config: CORSConfig): GatewayResponse {
    const origin = request.headers['origin'];
    
    if (!this.isOriginAllowed(origin, config.allowedOrigins)) {
      return { statusCode: 403, headers: {}, body: 'Origin not allowed', metadata: {} };
    }
    
    return {
      statusCode: 204,
      headers: {
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Methods': config.allowedMethods.join(', '),
        'Access-Control-Allow-Headers': config.allowedHeaders.join(', '),
        'Access-Control-Max-Age': config.maxAge.toString(),
        ...(config.credentials && { 'Access-Control-Allow-Credentials': 'true' })
      },
      body: null,
      metadata: {}
    };
  }
}
```

## Compliance Requirements

### API Governance

- **API Standards**: Enforce consistent API design patterns and naming conventions
- **Version Management**: Implement proper versioning with deprecation policies
- **Documentation Requirements**: Maintain up-to-date API documentation
- **Change Management**: Track and communicate API changes to consumers

### Data Protection

- **Data Minimization**: Only expose necessary data through APIs
- **Encryption**: Enforce TLS for all API communications
- **PII Handling**: Implement proper handling of personally identifiable information
- **Audit Logging**: Log all API access for compliance and security

### Regulatory Compliance

- **GDPR**: Support data subject rights through API endpoints
- **SOC 2**: Implement security controls for API access
- **PCI DSS**: Secure handling of payment data in APIs
- **HIPAA**: Protected health information handling (when applicable)

## Testing Considerations

### API Gateway Testing

```typescript
describe('API Gateway', () => {
  it('should route requests to correct backend', async () => {
    const gateway = new APIGatewayProcessor();
    const request = createTestRequest({ path: '/api/v1/users', method: 'GET' });
    
    const response = await gateway.processRequest(request);
    
    expect(response.statusCode).toBe(200);
    expect(mockBackendService.getUsers).toHaveBeenCalled();
  });
  
  it('should enforce rate limits', async () => {
    const gateway = new APIGatewayProcessor();
    const config = { limits: [{ tier: 'default', requests: 5, period: { value: 1, unit: 'minute' } }] };
    
    // Make requests up to limit
    for (let i = 0; i < 5; i++) {
      const response = await gateway.processRequest(createTestRequest());
      expect(response.statusCode).toBe(200);
    }
    
    // Next request should be rate limited
    const response = await gateway.processRequest(createTestRequest());
    expect(response.statusCode).toBe(429);
  });
  
  it('should validate request schema', async () => {
    const gateway = new APIGatewayProcessor();
    const invalidRequest = createTestRequest({ body: { invalid: 'data' } });
    
    const response = await gateway.processRequest(invalidRequest);
    
    expect(response.statusCode).toBe(400);
    expect(response.body.errors).toBeDefined();
  });
});

describe('Rate Limiter', () => {
  it('should implement token bucket algorithm correctly', async () => {
    const limiter = new TokenBucketRateLimiter();
    const config = { 
      strategy: RateLimitStrategy.TOKEN_BUCKET,
      limits: [{ tier: 'default', requests: 10, period: { value: 1, unit: 'second' } }]
    };
    
    // Consume all tokens
    for (let i = 0; i < 10; i++) {
      const result = await limiter.checkLimit('test-key', config);
      expect(result.allowed).toBe(true);
    }
    
    // Next request should be denied
    const result = await limiter.checkLimit('test-key', config);
    expect(result.allowed).toBe(false);
  });
});
```

### Documentation Generation Testing

```typescript
describe('API Documentation Generator', () => {
  it('should generate valid OpenAPI spec', async () => {
    const generator = new OpenAPIDocumentationGenerator();
    const api = createTestAPIDefinition();
    
    const spec = await generator.generateOpenAPISpec(api);
    
    expect(spec.openapi).toBe('3.0.3');
    expect(spec.paths).toBeDefined();
    expect(Object.keys(spec.paths).length).toBeGreaterThan(0);
  });
  
  it('should generate SDK for specified language', async () => {
    const generator = new OpenAPIDocumentationGenerator();
    const spec = createTestOpenAPISpec();
    
    const sdk = await generator.generateSDK(spec, SDKLanguage.TYPESCRIPT);
    
    expect(sdk.language).toBe(SDKLanguage.TYPESCRIPT);
    expect(sdk.files.length).toBeGreaterThan(0);
    expect(sdk.examples.length).toBeGreaterThan(0);
  });
});
```

This template provides comprehensive patterns for implementing API management systems with gateway functionality, rate limiting, authentication, documentation, and security features.
