# Troubleshooting Guide

## Overview

This guide helps resolve common issues when working with the AI Prompt Library v2 templates. Issues are organized by category with symptoms, causes, and solutions.

---

## Template Selection Issues

### Issue: Templates Don't Cover My Use Case

**Symptoms:**
- Can't find templates for specific functionality
- Existing templates seem incomplete

**Causes:**
- Looking in wrong domain category
- Need to combine multiple templates
- Custom functionality required

**Solutions:**

1. **Search across domains:**
   ```markdown
   # Example: Looking for "user authentication"
   
   Check these locations:
   - security/multi-factor-auth.md (primary)
   - feature-patterns/auth-oauth.md (OAuth specific)
   - enterprise-saas/sso-integration.md (enterprise SSO)
   ```

2. **Combine templates:**
   ```markdown
   # Example: Building a marketplace
   
   Combine:
   - commerce/product-catalog.md
   - commerce/marketplace-features.md
   - enterprise-saas/multi-tenancy.md (for seller isolation)
   ```

3. **Extend existing templates:**
   ```typescript
   // Extend base template functionality
   class CustomProductService extends ProductService {
     async customFeature(): Promise<void> {
       // Your custom implementation
     }
   }
   ```

---

### Issue: Template Conflicts

**Symptoms:**
- Two templates define similar interfaces differently
- Conflicting recommendations between templates

**Causes:**
- Templates designed for different contexts
- Version mismatches
- Overlapping functionality

**Solutions:**

1. **Identify the primary template:**
   ```markdown
   # When commerce/payment-processing.md conflicts with 
   # fintech/transaction-processing.md
   
   Choose based on context:
   - E-commerce app → Use commerce/payment-processing.md
   - Banking app → Use fintech/transaction-processing.md
   ```

2. **Create adapter layer:**
   ```typescript
   // Adapter to unify different payment interfaces
   interface UnifiedPayment {
     processPayment(amount: Money): Promise<PaymentResult>;
   }
   
   class CommercePaymentAdapter implements UnifiedPayment {
     constructor(private commerceService: CommercePaymentService) {}
     
     async processPayment(amount: Money): Promise<PaymentResult> {
       return this.commerceService.charge(amount);
     }
   }
   ```

3. **Document your choices:**
   ```markdown
   # ADR: Payment Template Selection
   
   Chose commerce/payment-processing.md because:
   - Primary use case is e-commerce
   - Better Stripe integration
   - Simpler for our needs
   ```

---

## Implementation Issues

### Issue: Template Code Doesn't Compile

**Symptoms:**
- TypeScript errors in template examples
- Missing type definitions
- Import errors

**Causes:**
- Template uses pseudocode or simplified examples
- Missing dependencies
- Different TypeScript version

**Solutions:**

1. **Install required dependencies:**
   ```bash
   # Common dependencies for templates
   npm install @types/node typescript
   
   # Domain-specific dependencies
   npm install stripe  # For payment templates
   npm install @aws-sdk/client-s3  # For storage templates
   ```

2. **Create missing types:**
   ```typescript
   // types/template-types.ts
   
   // If template uses Money type
   interface Money {
     amount: number;
     currency: string;
   }
   
   // If template uses Result type
   type Result<T, E = Error> = 
     | { success: true; data: T }
     | { success: false; error: E };
   ```

3. **Adapt pseudocode to real code:**
   ```typescript
   // Template pseudocode:
   // await database.store(user)
   
   // Real implementation:
   await prisma.user.create({ data: user });
   // or
   await userRepository.save(user);
   ```

---

### Issue: Template Patterns Don't Scale

**Symptoms:**
- Performance degrades with more data
- Memory issues with large datasets
- Slow response times

**Causes:**
- Template examples optimized for clarity, not scale
- Missing caching
- N+1 query problems

**Solutions:**

1. **Add caching:**
   ```typescript
   // Template pattern (no caching):
   async getProduct(id: string): Promise<Product> {
     return this.database.findById(id);
   }
   
   // Scaled pattern (with caching):
   async getProduct(id: string): Promise<Product> {
     const cached = await this.cache.get(`product:${id}`);
     if (cached) return cached;
     
     const product = await this.database.findById(id);
     await this.cache.set(`product:${id}`, product, { ttl: 300 });
     return product;
   }
   ```

2. **Fix N+1 queries:**
   ```typescript
   // Template pattern (N+1):
   const orders = await getOrders();
   for (const order of orders) {
     order.items = await getOrderItems(order.id);  // N queries
   }
   
   // Scaled pattern (batch):
   const orders = await getOrders();
   const orderIds = orders.map(o => o.id);
   const allItems = await getOrderItemsBatch(orderIds);  // 1 query
   
   for (const order of orders) {
     order.items = allItems.filter(i => i.orderId === order.id);
   }
   ```

3. **Add pagination:**
   ```typescript
   // Template pattern (load all):
   async getProducts(): Promise<Product[]> {
     return this.database.findAll();
   }
   
   // Scaled pattern (paginated):
   async getProducts(cursor?: string, limit = 20): Promise<{
     products: Product[];
     nextCursor?: string;
   }> {
     const products = await this.database.findMany({
       cursor,
       take: limit + 1
     });
     
     const hasMore = products.length > limit;
     return {
       products: products.slice(0, limit),
       nextCursor: hasMore ? products[limit - 1].id : undefined
     };
   }
   ```

---

## Integration Issues

### Issue: Templates Don't Work Together

**Symptoms:**
- Services can't communicate
- Data format mismatches
- Circular dependencies

**Causes:**
- Missing integration layer
- Incompatible data models
- Poor service boundaries

**Solutions:**

1. **Create shared contracts:**
   ```typescript
   // shared/contracts.ts
   
   // Shared event types
   interface UserCreatedEvent {
     type: 'user.created';
     userId: string;
     email: string;
     timestamp: Date;
   }
   
   // Shared data types
   interface UserReference {
     id: string;
     displayName: string;
   }
   ```

2. **Use event-driven integration:**
   ```typescript
   // User service publishes event
   await eventBus.publish({
     type: 'user.created',
     userId: user.id,
     email: user.email
   });
   
   // Other services subscribe
   eventBus.subscribe('user.created', async (event) => {
     await notificationService.sendWelcomeEmail(event.userId);
     await analyticsService.trackSignup(event.userId);
   });
   ```

3. **Break circular dependencies:**
   ```typescript
   // ❌ Circular: UserService → OrderService → UserService
   
   // ✅ Fixed: Use events or shared interface
   
   // shared/interfaces.ts
   interface UserLookup {
     getUser(id: string): Promise<UserReference>;
   }
   
   // OrderService depends on interface, not UserService
   class OrderService {
     constructor(private userLookup: UserLookup) {}
   }
   ```

---

### Issue: External Service Integration Fails

**Symptoms:**
- API calls to Stripe/PayPal fail
- Webhook handlers don't receive events
- OAuth flows break

**Causes:**
- Missing API keys
- Wrong environment (sandbox vs production)
- Webhook URL not configured

**Solutions:**

1. **Verify environment configuration:**
   ```bash
   # Check environment variables
   echo $STRIPE_SECRET_KEY
   echo $STRIPE_WEBHOOK_SECRET
   
   # Ensure using correct environment
   # Development: sk_test_...
   # Production: sk_live_...
   ```

2. **Test webhooks locally:**
   ```bash
   # Use Stripe CLI for local testing
   stripe listen --forward-to localhost:3000/webhooks/stripe
   
   # Use ngrok for other services
   ngrok http 3000
   ```

3. **Add proper error handling:**
   ```typescript
   async function handleStripeWebhook(req: Request): Promise<void> {
     const sig = req.headers['stripe-signature'];
     
     try {
       const event = stripe.webhooks.constructEvent(
         req.body,
         sig,
         process.env.STRIPE_WEBHOOK_SECRET
       );
       
       await processEvent(event);
     } catch (err) {
       if (err instanceof stripe.errors.SignatureVerificationError) {
         console.error('Invalid webhook signature');
         throw new UnauthorizedError('Invalid signature');
       }
       throw err;
     }
   }
   ```

---

## Security Issues

### Issue: Security Template Not Working

**Symptoms:**
- Authentication bypassed
- Encryption not applied
- Audit logs missing

**Causes:**
- Middleware not applied
- Wrong order of middleware
- Missing configuration

**Solutions:**

1. **Verify middleware order:**
   ```typescript
   // Correct order
   app.use(corsMiddleware);        // 1. CORS first
   app.use(rateLimitMiddleware);   // 2. Rate limiting
   app.use(authMiddleware);        // 3. Authentication
   app.use(authorizationMiddleware); // 4. Authorization
   app.use(auditMiddleware);       // 5. Audit logging
   
   // Routes come after middleware
   app.use('/api', apiRoutes);
   ```

2. **Check encryption configuration:**
   ```typescript
   // Verify encryption key is set
   if (!process.env.ENCRYPTION_KEY) {
     throw new Error('ENCRYPTION_KEY must be set');
   }
   
   // Verify key length (AES-256 requires 32 bytes)
   const key = Buffer.from(process.env.ENCRYPTION_KEY, 'base64');
   if (key.length !== 32) {
     throw new Error('ENCRYPTION_KEY must be 32 bytes');
   }
   ```

3. **Enable audit logging:**
   ```typescript
   // Ensure audit service is initialized
   const auditService = new AuditService({
     storage: new DatabaseAuditStorage(database),
     enabled: true,  // Make sure this is true
     logLevel: 'all' // Log all events
   });
   
   // Verify logs are being written
   auditService.on('logged', (entry) => {
     console.log('Audit entry created:', entry.id);
   });
   ```

---

## Performance Issues

### Issue: Slow Template Operations

**Symptoms:**
- API responses take too long
- Database queries timeout
- High memory usage

**Causes:**
- Missing indexes
- No connection pooling
- Synchronous operations blocking

**Solutions:**

1. **Add database indexes:**
   ```sql
   -- For user lookups
   CREATE INDEX idx_users_email ON users(email);
   
   -- For order queries
   CREATE INDEX idx_orders_user_date ON orders(user_id, created_at);
   
   -- For product search
   CREATE INDEX idx_products_name_gin ON products 
     USING gin(to_tsvector('english', name));
   ```

2. **Configure connection pooling:**
   ```typescript
   // Database connection pool
   const pool = new Pool({
     max: 20,           // Maximum connections
     min: 5,            // Minimum connections
     idleTimeoutMillis: 30000,
     connectionTimeoutMillis: 2000
   });
   
   // Redis connection pool
   const redis = new Redis({
     maxRetriesPerRequest: 3,
     enableReadyCheck: true,
     lazyConnect: true
   });
   ```

3. **Use async operations:**
   ```typescript
   // ❌ Blocking
   const result1 = await service1.getData();
   const result2 = await service2.getData();
   const result3 = await service3.getData();
   
   // ✅ Parallel
   const [result1, result2, result3] = await Promise.all([
     service1.getData(),
     service2.getData(),
     service3.getData()
   ]);
   ```

---

## Testing Issues

### Issue: Template Tests Fail

**Symptoms:**
- Unit tests fail unexpectedly
- Integration tests timeout
- Mocks don't work correctly

**Causes:**
- Missing test setup
- Incorrect mocking
- Test isolation issues

**Solutions:**

1. **Proper test setup:**
   ```typescript
   // test/setup.ts
   import { beforeAll, afterAll, beforeEach } from 'vitest';
   
   beforeAll(async () => {
     // Initialize test database
     await testDatabase.connect();
     await testDatabase.migrate();
   });
   
   afterAll(async () => {
     await testDatabase.disconnect();
   });
   
   beforeEach(async () => {
     // Clean database between tests
     await testDatabase.truncateAll();
   });
   ```

2. **Correct mocking:**
   ```typescript
   // Mock external services
   vi.mock('./stripe', () => ({
     stripe: {
       paymentIntents: {
         create: vi.fn().mockResolvedValue({
           id: 'pi_test',
           status: 'succeeded'
         })
       }
     }
   }));
   
   // Reset mocks between tests
   beforeEach(() => {
     vi.clearAllMocks();
   });
   ```

3. **Isolate tests:**
   ```typescript
   describe('OrderService', () => {
     let orderService: OrderService;
     let mockPaymentService: MockPaymentService;
     
     beforeEach(() => {
       // Create fresh instances for each test
       mockPaymentService = new MockPaymentService();
       orderService = new OrderService(mockPaymentService);
     });
     
     it('should process order', async () => {
       // Test with isolated instance
     });
   });
   ```

---

## Deployment Issues

### Issue: Template Works Locally But Not in Production

**Symptoms:**
- Features work in development
- Errors in production environment
- Missing functionality in deployed app

**Causes:**
- Environment variable differences
- Missing production dependencies
- Different infrastructure

**Solutions:**

1. **Verify environment variables:**
   ```bash
   # Create .env.example with all required variables
   DATABASE_URL=
   REDIS_URL=
   STRIPE_SECRET_KEY=
   ENCRYPTION_KEY=
   
   # Validate on startup
   const requiredEnvVars = [
     'DATABASE_URL',
     'REDIS_URL',
     'STRIPE_SECRET_KEY'
   ];
   
   for (const envVar of requiredEnvVars) {
     if (!process.env[envVar]) {
       throw new Error(`Missing required env var: ${envVar}`);
     }
   }
   ```

2. **Check production dependencies:**
   ```json
   // package.json - ensure dependencies are not in devDependencies
   {
     "dependencies": {
       "stripe": "^12.0.0",  // ✅ In dependencies
       "@prisma/client": "^5.0.0"
     },
     "devDependencies": {
       "typescript": "^5.0.0",  // ✅ Dev only
       "vitest": "^1.0.0"
     }
   }
   ```

3. **Match infrastructure:**
   ```yaml
   # docker-compose.yml for local development
   services:
     app:
       environment:
         - NODE_ENV=development
         - DATABASE_URL=postgres://localhost:5432/dev
     
     db:
       image: postgres:15
   
   # Ensure production has equivalent services
   # - Same Postgres version
   # - Same Redis version
   # - Same Node.js version
   ```

---

## Getting Help

### When to Escalate

Escalate if:
- Issue persists after trying solutions
- Security vulnerability discovered
- Template has incorrect information
- Missing critical functionality

### How to Report Issues

Include in your report:
1. Template name and version
2. Steps to reproduce
3. Expected vs actual behavior
4. Environment details (Node version, OS, etc.)
5. Relevant code snippets
6. Error messages and stack traces

### Resources

- [Template Reference](./template-reference.md) - Complete template catalog
- [Best Practices](./best-practices.md) - Composition guidelines
- [Quick Start Guides](./quick-start-guides.md) - Getting started
- [Domain Guides](./commerce-app-guide.md) - Domain-specific help
