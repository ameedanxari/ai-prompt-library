# Stage 06 - Implementation: Platform-Agnostic Implementation Strategy

## Purpose
Define implementation approach, development workflows, and quality standards that apply across all platforms, establishing the foundation for consistent development practices.

This stage establishes the core architecture implementation patterns, data layer development, security implementation standards, and testing frameworks that ensure consistent quality across all platforms.

## Instructions
Use this stage to establish the core implementation strategy that will guide development across all platforms. Focus on development workflows, code quality standards, and implementation patterns that ensure consistency and maintainability.

## Non-Negotiable Implementation Outputs
Stage 06 must produce these artifacts before moving forward:
- `prompts/outputs/task-lists/implementation-master-plan.md`
- `prompts/outputs/task-lists/task-list-index.md`
- Platform task files referenced by the index (for example mobile/admin/backend shared task tracks)
- `prompts/outputs/implementation-prompts/prompt-pack-index.md`
- One prompt file per task under `prompts/outputs/implementation-prompts/`
- `prompts/outputs/specifications/prompt-usage-log.md` (Stage 06 entry)
- `prompts/outputs/specifications/design-system-implementation-sequencing.md` (required when UI scope exists)
- `prompts/outputs/specifications/screen-fidelity-matrix.md` (required when UI scope exists)
- `prompts/outputs/specifications/design-system-verification-report.md` (required when UI scope exists)

Required behavior:
1. Task list index must list every task file and dependency ordering.
2. Include explicit API wiring tasks (not just UI/state tasks) for each app surface.
3. Include database migration and seed/reset tasks where applicable.
4. Include deployment readiness tasks for environment config and secrets handoff.
5. Mark all mock tasks as temporary with replacement tasks and owner.
6. Every task entry must include objective, context references, acceptance criteria, validation commands, and dependency IDs.
7. Generate per-task implementation prompt files using:
   - `.ai-prompts/prompts/templates/task-prompt-template.md`
   - `.ai-prompts/prompts/templates/implementation-prompt-generation.md`
   - `.ai-prompts/prompts/templates/implementation-prompt-pack-template.md`
8. For each UI track (mobile/web/admin), add a design-system foundation/component-primitives task before screen-level tasks.
9. Per-task implementation prompt files must be fully populated (no unresolved placeholder tokens or `- \` lines).
10. For UI scope projects, generate `design-system-implementation-sequencing.md` using `.ai-prompts/prompts/templates/design-system-implementation-sequencing-template.md`.
11. Every per-task prompt must include semantic module lineage (`.ai-prompts/prompts/modules/...`) selected by task intent.
12. Every per-task prompt must include stack module lineage (`.ai-prompts/prompts/modules/technology-stacks/...`) selected from project stack.
13. `prompt-pack-index.md` rows must include semantic and stack module mappings per task.
14. For tasks with `profile`, `discovery/search`, `analytics/reporting`, or `moderation/review` intent, semantic routing must include at least one intent-specific module (for example `social/user-profiles`, `search-discovery/*`, `analytics/*`, `content-moderation`/`audit-trails`) and must not default to only `integration/service-integration`.
15. UI task prompts must include source mockup anchors (exact file/frame references) and measurable parity checks.
16. UI scope tasks must prohibit scaffold/placeholder substitutions unless explicitly temporary with a linked replacement task ID.
17. UI tracks must define completion gates for shell composition (sidebar/topbar), typography rhythm, spacing, token usage, iconography, and interaction states.

## Examples
```markdown
## Example Implementation Strategy

### Project: Task Management System Implementation
**Development Approach**: Agile with 2-week sprints
**Code Quality**: 85%+ test coverage, automated code review
**Development Workflow**: Feature branches → PR review → CI/CD → deployment
**Implementation Order**: 
1. Core API and data models
2. Authentication and authorization
3. Task management features
4. Project management features
5. Notification system
6. Advanced features

### Quality Gates
- All unit tests pass (85%+ coverage)
- Integration tests validate API contracts
- Security scans pass with no high/critical issues
- Performance benchmarks met
- Accessibility compliance validated
```

## Implementation Framework

### Development Methodology
```markdown
## Agile Development Process

### Sprint Planning
**Sprint Duration**: 2 weeks
**Sprint Goals**: 
- Deliver working features incrementally
- Maintain high code quality standards
- Ensure cross-platform consistency
- Regular stakeholder feedback

### Sprint Structure
**Week 1**:
- Sprint planning and task breakdown
- Feature development and implementation
- Daily standups and progress tracking
- Mid-sprint review and adjustments

**Week 2**:
- Feature completion and testing
- Code review and quality assurance
- Integration testing and bug fixes
- Sprint review and retrospective

### Story Point Estimation
**1 Point**: Simple bug fixes, minor UI updates
**2 Points**: Small features, configuration changes
**3 Points**: Medium features, API endpoints
**5 Points**: Complex features, integrations
**8 Points**: Large features requiring multiple developers
**13 Points**: Epic-level work requiring breakdown

### Definition of Done
- [ ] Feature implemented according to specifications
- [ ] Unit tests written and passing (85%+ coverage)
- [ ] Integration tests validate functionality
- [ ] Code reviewed and approved by team
- [ ] Documentation updated
- [ ] Accessibility requirements met
- [ ] Performance benchmarks satisfied
- [ ] Security review completed
- [ ] Cross-platform compatibility verified
```

### Code Quality Standards
```markdown
## Quality Assurance Framework

### Code Review Process
**Review Requirements**:
- All code changes require peer review
- Minimum 2 approvals for critical changes
- Automated checks must pass before review
- Security-sensitive changes require security review

**Review Checklist**:
- [ ] Code follows established patterns and conventions
- [ ] Business logic is properly tested
- [ ] Error handling is comprehensive
- [ ] Performance implications considered
- [ ] Security best practices followed
- [ ] Documentation is updated
- [ ] Accessibility considerations addressed

### Automated Quality Gates
```yaml
# CI/CD Pipeline Quality Gates
quality_gates:
  code_quality:
    test_coverage: 85%
    complexity_threshold: 10
    duplication_threshold: 3%
    maintainability_index: 70
  
  security:
    vulnerability_scan: "no high/critical"
    dependency_audit: "no known vulnerabilities"
    secret_detection: "no hardcoded secrets"
  
  performance:
    api_response_time: "95th percentile < 200ms"
    database_query_time: "95th percentile < 100ms"
    memory_usage: "< 512MB per service"
  
  accessibility:
    wcag_compliance: "AA level"
    automated_tests: "100% pass rate"
    manual_review: "required for UI changes"
```

### Testing Strategy Implementation
```markdown
## Comprehensive Testing Approach

### Unit Testing Standards
**Coverage Requirements**:
- Business logic: 95% coverage
- API endpoints: 90% coverage
- Utility functions: 100% coverage
- UI components: 80% coverage

**Testing Patterns**:
```typescript
// Example unit test structure
describe('TaskService', () => {
  describe('createTask', () => {
    it('should create task with valid data', async () => {
      const taskData = {
        title: 'Test Task',
        description: 'Test Description',
        priority: 'medium',
      };
      
      const result = await taskService.createTask(taskData);
      
      expect(result).toMatchObject({
        id: expect.any(String),
        title: taskData.title,
        description: taskData.description,
        priority: taskData.priority,
        status: 'todo',
        createdAt: expect.any(Date),
      });
    });
    
    it('should validate required fields', async () => {
      const invalidData = { description: 'Missing title' };
      
      await expect(taskService.createTask(invalidData))
        .rejects.toThrow('Title is required');
    });
    
    it('should handle database errors gracefully', async () => {
      jest.spyOn(database, 'save').mockRejectedValue(new Error('DB Error'));
      
      await expect(taskService.createTask(validTaskData))
        .rejects.toThrow('Failed to create task');
    });
  });
});
```

### Property-Based Testing Implementation
```typescript
// Property-based testing for business logic
import fc from 'fast-check';

describe('Task Management Properties', () => {
  test('Task creation preserves valid input data', () => {
    fc.assert(fc.property(
      fc.record({
        title: fc.string({ minLength: 1, maxLength: 100 }),
        description: fc.option(fc.string({ maxLength: 1000 })),
        priority: fc.constantFrom('low', 'medium', 'high', 'urgent'),
        dueDate: fc.option(fc.date({ min: new Date() })),
      }),
      (taskData) => {
        const task = new Task(taskData);
        expect(task.title).toBe(taskData.title);
        expect(task.description).toBe(taskData.description);
        expect(task.priority).toBe(taskData.priority);
        expect(task.dueDate).toEqual(taskData.dueDate);
        expect(task.status).toBe('todo');
        expect(task.createdAt).toBeInstanceOf(Date);
      }
    ), { numRuns: 100 });
  });
  
  test('Task status transitions follow valid workflow', () => {
    fc.assert(fc.property(
      fc.constantFrom('todo', 'in_progress', 'review', 'completed'),
      fc.constantFrom('todo', 'in_progress', 'review', 'completed'),
      (fromStatus, toStatus) => {
        const task = new Task({ title: 'Test', status: fromStatus });
        const canTransition = task.canTransitionTo(toStatus);
        const validTransitions = getValidTransitions(fromStatus);
        expect(canTransition).toBe(validTransitions.includes(toStatus));
      }
    ), { numRuns: 50 });
  });
});
```

### Integration Testing Framework
```typescript
// API integration testing
describe('Task API Integration', () => {
  beforeEach(async () => {
    await setupTestDatabase();
    await seedTestData();
  });
  
  afterEach(async () => {
    await cleanupTestDatabase();
  });
  
  describe('POST /api/tasks', () => {
    it('should create task and return 201', async () => {
      const taskData = {
        title: 'Integration Test Task',
        description: 'Test Description',
        projectId: testProject.id,
      };
      
      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send(taskData)
        .expect(201);
      
      expect(response.body).toMatchObject({
        id: expect.any(String),
        title: taskData.title,
        description: taskData.description,
        projectId: taskData.projectId,
        status: 'todo',
      });
      
      // Verify task was saved to database
      const savedTask = await Task.findById(response.body.id);
      expect(savedTask).toBeTruthy();
    });
    
    it('should validate authentication', async () => {
      await request(app)
        .post('/api/tasks')
        .send({ title: 'Test Task' })
        .expect(401);
    });
    
    it('should validate input data', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ description: 'Missing title' })
        .expect(400);
      
      expect(response.body.errors).toContain('Title is required');
    });
  });
});
```
```

### Implementation Patterns and Standards

#### Error Handling Strategy
```markdown
## Error Handling Framework

### Error Classification
**Client Errors (4xx)**:
- 400 Bad Request: Invalid input data
- 401 Unauthorized: Authentication required
- 403 Forbidden: Insufficient permissions
- 404 Not Found: Resource not found
- 409 Conflict: Resource conflict
- 422 Unprocessable Entity: Validation errors

**Server Errors (5xx)**:
- 500 Internal Server Error: Unexpected server error
- 502 Bad Gateway: External service error
- 503 Service Unavailable: Service temporarily down
- 504 Gateway Timeout: External service timeout

### Error Response Format
```typescript
interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: any;
    timestamp: string;
    requestId: string;
  };
}

// Example error responses
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "title": "Title is required",
      "dueDate": "Due date cannot be in the past"
    },
    "timestamp": "2024-01-15T10:30:00Z",
    "requestId": "req_123456789"
  }
}
```

### Error Handling Implementation
```typescript
// Global error handler
class ErrorHandler {
  static handle(error: Error, req: Request, res: Response, next: NextFunction) {
    const requestId = req.headers['x-request-id'] as string;
    
    // Log error for monitoring
    logger.error('Request error', {
      error: error.message,
      stack: error.stack,
      requestId,
      url: req.url,
      method: req.method,
      userId: req.user?.id,
    });
    
    if (error instanceof ValidationError) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input data',
          details: error.details,
          timestamp: new Date().toISOString(),
          requestId,
        },
      });
    }
    
    if (error instanceof AuthenticationError) {
      return res.status(401).json({
        error: {
          code: 'AUTHENTICATION_ERROR',
          message: 'Authentication required',
          timestamp: new Date().toISOString(),
          requestId,
        },
      });
    }
    
    if (error instanceof AuthorizationError) {
      return res.status(403).json({
        error: {
          code: 'AUTHORIZATION_ERROR',
          message: 'Insufficient permissions',
          timestamp: new Date().toISOString(),
          requestId,
        },
      });
    }
    
    // Default to 500 for unexpected errors
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred',
        timestamp: new Date().toISOString(),
        requestId,
      },
    });
  }
}

// Service layer error handling
class TaskService {
  async createTask(data: CreateTaskData): Promise<Task> {
    try {
      // Validate input
      const validation = validateTaskData(data);
      if (!validation.valid) {
        throw new ValidationError(validation.errors);
      }
      
      // Check permissions
      if (!await this.canCreateTask(data.userId, data.projectId)) {
        throw new AuthorizationError('Cannot create task in this project');
      }
      
      // Create task
      const task = await this.taskRepository.create(data);
      
      // Send notifications
      await this.notificationService.notifyTaskCreated(task);
      
      return task;
    } catch (error) {
      if (error instanceof ValidationError || 
          error instanceof AuthorizationError) {
        throw error;
      }
      
      // Wrap unexpected errors
      throw new ServiceError('Failed to create task', error);
    }
  }
}
```
```

#### Logging and Monitoring Strategy
```markdown
## Observability Framework

### Structured Logging
```typescript
// Logger configuration
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: {
    service: 'task-api',
    version: process.env.APP_VERSION,
  },
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    }),
  ],
});

// Usage in application
logger.info('Task created', {
  taskId: task.id,
  userId: user.id,
  projectId: task.projectId,
  duration: Date.now() - startTime,
});

logger.error('Database connection failed', {
  error: error.message,
  stack: error.stack,
  database: 'postgresql',
  host: process.env.DB_HOST,
});
```

### Performance Monitoring
```typescript
// Performance tracking middleware
function performanceMiddleware(req: Request, res: Response, next: NextFunction) {
  const startTime = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const route = req.route?.path || req.path;
    
    // Log performance metrics
    logger.info('Request completed', {
      method: req.method,
      route,
      statusCode: res.statusCode,
      duration,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
    });
    
    // Send metrics to monitoring service
    metrics.histogram('http_request_duration', duration, {
      method: req.method,
      route,
      status_code: res.statusCode.toString(),
    });
    
    metrics.counter('http_requests_total', 1, {
      method: req.method,
      route,
      status_code: res.statusCode.toString(),
    });
  });
  
  next();
}

// Database query monitoring
class MonitoredRepository {
  async findById(id: string): Promise<Task | null> {
    const startTime = Date.now();
    
    try {
      const result = await this.database.query(
        'SELECT * FROM tasks WHERE id = $1',
        [id]
      );
      
      const duration = Date.now() - startTime;
      
      metrics.histogram('database_query_duration', duration, {
        operation: 'findById',
        table: 'tasks',
      });
      
      return result.rows[0] || null;
    } catch (error) {
      metrics.counter('database_errors_total', 1, {
        operation: 'findById',
        table: 'tasks',
        error: error.constructor.name,
      });
      
      throw error;
    }
  }
}
```

### Health Checks and Monitoring
```typescript
// Health check endpoints
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.APP_VERSION,
    uptime: process.uptime(),
  });
});

app.get('/health/detailed', async (req, res) => {
  const checks = await Promise.allSettled([
    checkDatabase(),
    checkRedis(),
    checkExternalServices(),
  ]);
  
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.APP_VERSION,
    uptime: process.uptime(),
    checks: {
      database: checks[0].status === 'fulfilled' ? 'healthy' : 'unhealthy',
      redis: checks[1].status === 'fulfilled' ? 'healthy' : 'unhealthy',
      external: checks[2].status === 'fulfilled' ? 'healthy' : 'unhealthy',
    },
  };
  
  const isHealthy = Object.values(health.checks).every(status => status === 'healthy');
  
  res.status(isHealthy ? 200 : 503).json(health);
});

async function checkDatabase(): Promise<void> {
  await database.query('SELECT 1');
}

async function checkRedis(): Promise<void> {
  await redis.ping();
}

async function checkExternalServices(): Promise<void> {
  // Check critical external services
  await Promise.all([
    fetch('/api/auth/health').then(r => r.ok ? Promise.resolve() : Promise.reject()),
    fetch('/api/notifications/health').then(r => r.ok ? Promise.resolve() : Promise.reject()),
  ]);
}
```
```

### Security Implementation Standards
```markdown
## Security Framework

### Authentication Implementation
```typescript
// JWT token management
class AuthService {
  generateTokens(user: User): { accessToken: string; refreshToken: string } {
    const accessToken = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        roles: user.roles,
      },
      process.env.JWT_SECRET!,
      {
        expiresIn: '15m',
        issuer: 'task-app',
        audience: 'task-app-users',
      }
    );
    
    const refreshToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_REFRESH_SECRET!,
      {
        expiresIn: '7d',
        issuer: 'task-app',
        audience: 'task-app-users',
      }
    );
    
    return { accessToken, refreshToken };
  }
  
  verifyAccessToken(token: string): TokenPayload {
    try {
      return jwt.verify(token, process.env.JWT_SECRET!) as TokenPayload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new AuthenticationError('Token expired');
      }
      throw new AuthenticationError('Invalid token');
    }
  }
  
  async refreshAccessToken(refreshToken: string): Promise<string> {
    try {
      const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as { userId: string };
      const user = await this.userService.findById(payload.userId);
      
      if (!user) {
        throw new AuthenticationError('User not found');
      }
      
      const { accessToken } = this.generateTokens(user);
      return accessToken;
    } catch (error) {
      throw new AuthenticationError('Invalid refresh token');
    }
  }
}

// Authentication middleware
function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  
  if (!token) {
    return res.status(401).json({
      error: {
        code: 'MISSING_TOKEN',
        message: 'Authentication token required',
      },
    });
  }
  
  try {
    const payload = authService.verifyAccessToken(token);
    req.user = payload;
    next();
  } catch (error) {
    return res.status(401).json({
      error: {
        code: 'INVALID_TOKEN',
        message: error.message,
      },
    });
  }
}
```

### Authorization Implementation
```typescript
// Role-based access control
class AuthorizationService {
  async checkPermission(
    userId: string,
    resource: string,
    action: string,
    context?: any
  ): Promise<boolean> {
    const user = await this.userService.findById(userId);
    if (!user) return false;
    
    // Check global permissions
    for (const role of user.roles) {
      if (await this.roleHasPermission(role, resource, action)) {
        return true;
      }
    }
    
    // Check context-specific permissions
    if (context) {
      return await this.checkContextPermission(userId, resource, action, context);
    }
    
    return false;
  }
  
  private async roleHasPermission(
    role: Role,
    resource: string,
    action: string
  ): Promise<boolean> {
    return role.permissions.some(permission =>
      permission.resource === resource &&
      permission.actions.includes(action)
    );
  }
  
  private async checkContextPermission(
    userId: string,
    resource: string,
    action: string,
    context: any
  ): Promise<boolean> {
    // Project-level permissions
    if (resource === 'task' && context.projectId) {
      const membership = await this.getProjectMembership(userId, context.projectId);
      return membership && this.membershipAllowsAction(membership, action);
    }
    
    // Resource ownership
    if (context.ownerId === userId) {
      return ['read', 'update'].includes(action);
    }
    
    return false;
  }
}

// Authorization middleware
function requirePermission(resource: string, action: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({
        error: { code: 'AUTHENTICATION_REQUIRED', message: 'Authentication required' },
      });
    }
    
    const hasPermission = await authorizationService.checkPermission(
      userId,
      resource,
      action,
      req.params
    );
    
    if (!hasPermission) {
      return res.status(403).json({
        error: { code: 'INSUFFICIENT_PERMISSIONS', message: 'Insufficient permissions' },
      });
    }
    
    next();
  };
}

// Usage in routes
app.get('/api/tasks/:id', 
  authenticateToken,
  requirePermission('task', 'read'),
  getTaskHandler
);

app.put('/api/tasks/:id',
  authenticateToken,
  requirePermission('task', 'update'),
  updateTaskHandler
);
```

### Input Validation and Sanitization
```typescript
// Input validation schemas
import Joi from 'joi';

const createTaskSchema = Joi.object({
  title: Joi.string().min(1).max(100).required(),
  description: Joi.string().max(1000).optional(),
  priority: Joi.string().valid('low', 'medium', 'high', 'urgent').default('medium'),
  dueDate: Joi.date().min('now').optional(),
  assigneeId: Joi.string().uuid().optional(),
  projectId: Joi.string().uuid().required(),
  tags: Joi.array().items(Joi.string().max(50)).max(10).default([]),
});

// Validation middleware
function validateInput(schema: Joi.Schema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });
    
    if (error) {
      const details = error.details.reduce((acc, detail) => {
        acc[detail.path.join('.')] = detail.message;
        return acc;
      }, {} as Record<string, string>);
      
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input data',
          details,
        },
      });
    }
    
    req.body = value;
    next();
  };
}

// Usage
app.post('/api/tasks',
  authenticateToken,
  validateInput(createTaskSchema),
  requirePermission('task', 'create'),
  createTaskHandler
);
```
```

This platform-agnostic implementation strategy provides a comprehensive foundation for building high-quality, secure, and maintainable applications across all target platforms while ensuring consistent development practices and quality standards.

## Next Steps
- **Stage 07 - Deployment**: Platform-agnostic deployment strategies and infrastructure
- **Code Quality Validation**: Implement automated quality gates and monitoring
- **Security Audit**: Comprehensive security review and penetration testing
- **Performance Baseline**: Establish performance benchmarks and monitoring
