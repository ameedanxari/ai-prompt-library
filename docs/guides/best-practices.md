# Template Composition Best Practices

## Overview

This guide covers best practices for selecting, composing, and optimizing templates from the AI Prompt Library v2 to build production-ready applications.

---

## Template Selection

### 1. Start with Core Domain Templates

Always begin with the primary domain templates that match your application type:

```markdown
# Good: Start with core templates
E-commerce → commerce/product-catalog.md, commerce/shopping-cart.md
Social → social/user-profiles.md, social/content-feeds.md
Fintech → fintech/account-management.md, fintech/transaction-processing.md

# Avoid: Starting with cross-cutting concerns
❌ Don't start with analytics/user-analytics.md before core features
❌ Don't start with security/threat-detection.md before basic auth
```

### 2. Layer Templates Progressively

Build functionality in layers, adding complexity gradually:

```markdown
Layer 1: Core Functionality
├── Domain-specific templates (commerce, social, etc.)
└── Basic authentication

Layer 2: Enhanced Features
├── Search and discovery
├── Notifications
└── Analytics

Layer 3: Advanced Capabilities
├── Real-time features
├── AI/ML integration
└── Advanced security

Layer 4: Enterprise Features
├── Multi-tenancy
├── Compliance
└── Advanced monitoring
```

### 3. Consider Dependencies

Some templates have implicit dependencies:

```markdown
# Template Dependencies

commerce/payment-processing.md
├── Requires: security/data-encryption.md (for PCI compliance)
└── Recommends: enterprise-saas/audit-trails.md

healthcare/patient-data-management.md
├── Requires: healthcare/hipaa-compliance.md
├── Requires: security/data-encryption.md
└── Requires: enterprise-saas/audit-trails.md

real-time-communication/live-streaming.md
├── Requires: media-streaming/cdn-integration.md
└── Recommends: real-time-communication/websocket-management.md
```

---

## Template Composition

### 1. Identify Overlapping Concerns

When combining templates, identify and consolidate overlapping functionality:

```typescript
// Example: Both commerce and fintech templates handle payments
// Consolidate into a single payment service

// ❌ Bad: Duplicate payment handling
class CommercePaymentService { /* ... */ }
class FintechPaymentService { /* ... */ }

// ✅ Good: Unified payment service
class PaymentService {
  async processPayment(request: PaymentRequest): Promise<PaymentResult> {
    // Single implementation used by both domains
  }
}
```

### 2. Use Consistent Data Models

Ensure data models are consistent across composed templates:

```typescript
// Define shared types in a common location
// types/shared.ts

interface User {
  id: string;
  email: string;
  profile: UserProfile;
}

interface Money {
  amount: number;
  currency: string;
}

// Use these types across all templates
// commerce/cart.ts
interface CartItem {
  productId: string;
  price: Money;  // Shared type
}

// fintech/transaction.ts
interface Transaction {
  amount: Money;  // Same shared type
}
```

### 3. Establish Clear Boundaries

Define clear boundaries between template implementations:

```markdown
# Service Boundaries

User Domain (social/user-profiles.md)
├── User creation and management
├── Profile customization
└── Privacy settings

Auth Domain (security/multi-factor-auth.md)
├── Authentication
├── Session management
└── MFA

Content Domain (social/content-feeds.md)
├── Post creation
├── Feed generation
└── Content delivery

# Clear interfaces between domains
UserService → AuthService: validateCredentials()
ContentService → UserService: getAuthorProfile()
```

### 4. Handle Cross-Cutting Concerns Consistently

Apply cross-cutting concerns uniformly:

```typescript
// Logging - apply consistently across all services
class BaseService {
  protected logger: Logger;
  
  protected async executeWithLogging<T>(
    operation: string,
    fn: () => Promise<T>
  ): Promise<T> {
    const startTime = Date.now();
    try {
      const result = await fn();
      this.logger.info(`${operation} completed`, {
        duration: Date.now() - startTime
      });
      return result;
    } catch (error) {
      this.logger.error(`${operation} failed`, { error });
      throw error;
    }
  }
}

// All services extend BaseService
class ProductService extends BaseService {
  async createProduct(data: ProductData): Promise<Product> {
    return this.executeWithLogging('createProduct', async () => {
      // Implementation
    });
  }
}
```

---

## Performance Optimization

### 1. Minimize Template Redundancy

Avoid including redundant templates:

```markdown
# Redundant Templates
❌ Including both:
   - search-discovery/full-text-search.md
   - commerce/product-search.md (which includes search patterns)

# Optimized Selection
✅ Use commerce/product-search.md for e-commerce
   (It already includes relevant search patterns)

✅ Use search-discovery/full-text-search.md for general search
   (When not in e-commerce context)
```

### 2. Lazy Load Optional Features

Don't implement all template features upfront:

```typescript
// ❌ Bad: Loading all features at startup
class AnalyticsService {
  constructor() {
    this.initUserAnalytics();
    this.initCohortAnalysis();
    this.initPredictiveAnalytics();
    this.initABTesting();
  }
}

// ✅ Good: Lazy load based on usage
class AnalyticsService {
  private cohortAnalysis?: CohortAnalysisModule;
  
  async getCohortAnalysis(): Promise<CohortAnalysisModule> {
    if (!this.cohortAnalysis) {
      this.cohortAnalysis = await import('./cohort-analysis');
    }
    return this.cohortAnalysis;
  }
}
```

### 3. Cache Template Outputs

Cache expensive template operations:

```typescript
// Cache search results
class SearchService {
  private cache: Cache;
  
  async search(query: string): Promise<SearchResults> {
    const cacheKey = `search:${hash(query)}`;
    
    const cached = await this.cache.get(cacheKey);
    if (cached) return cached;
    
    const results = await this.performSearch(query);
    await this.cache.set(cacheKey, results, { ttl: 60 });
    
    return results;
  }
}
```

---

## Security Best Practices

### 1. Always Include Security Templates

Never skip security templates for production:

```markdown
# Minimum Security Templates

All Applications:
├── security/multi-factor-auth.md (or auth-oauth.md)
├── security/data-encryption.md
└── enterprise-saas/audit-trails.md

Financial Applications:
├── All above, plus:
├── fintech/fraud-detection.md
└── security/threat-detection.md

Healthcare Applications:
├── All above, plus:
├── healthcare/hipaa-compliance.md
└── healthcare/healthcare-security.md
```

### 2. Apply Defense in Depth

Layer security controls:

```typescript
// Layer 1: Authentication
app.use(authMiddleware);

// Layer 2: Authorization
app.use(authorizationMiddleware);

// Layer 3: Input Validation
app.use(validationMiddleware);

// Layer 4: Rate Limiting
app.use(rateLimitMiddleware);

// Layer 5: Audit Logging
app.use(auditMiddleware);
```

### 3. Encrypt Sensitive Data

Always encrypt sensitive data:

```typescript
// From security/data-encryption.md patterns

// Encrypt at rest
const encryptedData = await encryptionService.encrypt(sensitiveData);
await database.store(encryptedData);

// Encrypt in transit (TLS)
const httpsServer = https.createServer({
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem')
}, app);

// Field-level encryption for PII
const user = {
  id: userId,
  email: await encrypt(email, 'pii'),
  ssn: await encrypt(ssn, 'pii-sensitive')
};
```

---

## Testing Best Practices

### 1. Test Template Integrations

Test how templates work together:

```typescript
describe('Template Integration', () => {
  it('should process order with payment and inventory', async () => {
    // Test commerce templates working together
    const cart = await cartService.create();
    await cartService.addItem(cart.id, productId, 1);
    
    const checkout = await checkoutService.initiate(cart.id);
    const payment = await paymentService.process(checkout);
    
    expect(payment.status).toBe('succeeded');
    
    const inventory = await inventoryService.getStock(productId);
    expect(inventory.available).toBe(initialStock - 1);
  });
});
```

### 2. Use Property-Based Testing

Test template properties:

```typescript
import * as fc from 'fast-check';

describe('Cart Properties', () => {
  it('cart total equals sum of items', () => {
    fc.assert(fc.property(
      fc.array(fc.record({
        price: fc.integer({ min: 1, max: 10000 }),
        quantity: fc.integer({ min: 1, max: 10 })
      })),
      (items) => {
        const cart = new Cart(items);
        const expected = items.reduce(
          (sum, item) => sum + item.price * item.quantity, 
          0
        );
        return cart.total === expected;
      }
    ));
  });
});
```

### 3. Test Error Scenarios

Test template error handling:

```typescript
describe('Payment Error Handling', () => {
  it('should handle declined cards gracefully', async () => {
    const result = await paymentService.process({
      amount: 100,
      cardToken: 'tok_declined'
    });
    
    expect(result.status).toBe('failed');
    expect(result.error.code).toBe('card_declined');
    expect(result.error.userMessage).toBeDefined();
  });
  
  it('should retry on network errors', async () => {
    mockNetwork.failOnce();
    
    const result = await paymentService.process({
      amount: 100,
      cardToken: 'tok_valid'
    });
    
    expect(result.status).toBe('succeeded');
    expect(mockNetwork.attempts).toBe(2);
  });
});
```

---

## Documentation Best Practices

### 1. Document Template Choices

Record why specific templates were chosen:

```markdown
# Architecture Decision Record: Template Selection

## Context
Building an e-commerce platform with subscription features.

## Decision
Selected templates:
- commerce/payment-processing.md - Core payment handling
- commerce/payment-subscriptions.md - Recurring billing
- enterprise-saas/enterprise-billing.md - Usage tracking

## Rationale
- payment-subscriptions.md chosen over building custom because:
  - Handles dunning automatically
  - Supports multiple billing cycles
  - Integrates with Stripe Billing

## Consequences
- Dependent on Stripe for subscription management
- Need to implement webhook handlers for subscription events
```

### 2. Document Customizations

Track template customizations:

```typescript
/**
 * Customized from: commerce/shopping-cart.md
 * 
 * Modifications:
 * - Added support for gift cards (not in original template)
 * - Extended CartItem to include customization options
 * - Added cart expiration for guest users
 * 
 * Original template version: 2.0.0
 */
class CustomizedCartService extends CartService {
  // Custom implementation
}
```

### 3. Maintain Integration Maps

Document how templates integrate:

```markdown
# Template Integration Map

```
┌─────────────────┐     ┌─────────────────┐
│  User Service   │────▶│  Auth Service   │
│ (user-profiles) │     │ (multi-factor)  │
└────────┬────────┘     └─────────────────┘
         │
         ▼
┌─────────────────┐     ┌─────────────────┐
│ Content Service │────▶│ Search Service  │
│ (content-feeds) │     │ (full-text)     │
└────────┬────────┘     └─────────────────┘
         │
         ▼
┌─────────────────┐
│ Analytics Svc   │
│ (user-analytics)│
└─────────────────┘
```
```

---

## Common Anti-Patterns

### 1. Over-Engineering

```markdown
❌ Anti-Pattern: Including every possible template
   - 50+ templates for a simple app
   - Features that will never be used
   - Unnecessary complexity

✅ Best Practice: Start minimal, add as needed
   - Core templates only for MVP
   - Add templates when requirements emerge
   - Regular review of unused features
```

### 2. Ignoring Template Boundaries

```markdown
❌ Anti-Pattern: Mixing template concerns
   - Payment logic in user service
   - Auth checks scattered everywhere
   - No clear service boundaries

✅ Best Practice: Respect template boundaries
   - Each template = one service/module
   - Clear interfaces between services
   - Single responsibility principle
```

### 3. Copy-Paste Implementation

```markdown
❌ Anti-Pattern: Copying template code without understanding
   - Duplicated code across services
   - Inconsistent implementations
   - Hard to maintain

✅ Best Practice: Understand then implement
   - Read template documentation fully
   - Adapt patterns to your context
   - Create shared utilities for common patterns
```

### 4. Skipping Security Templates

```markdown
❌ Anti-Pattern: "We'll add security later"
   - No encryption for sensitive data
   - Missing audit trails
   - No input validation

✅ Best Practice: Security from day one
   - Include security templates in initial selection
   - Implement encryption before storing data
   - Add audit logging with first feature
```

---

## Checklist: Template Composition

Use this checklist when composing templates:

### Selection Phase
- [ ] Identified primary domain templates
- [ ] Checked template dependencies
- [ ] Reviewed security requirements
- [ ] Considered compliance needs
- [ ] Evaluated performance requirements

### Design Phase
- [ ] Defined service boundaries
- [ ] Created shared data models
- [ ] Planned integration points
- [ ] Documented architecture decisions
- [ ] Identified cross-cutting concerns

### Implementation Phase
- [ ] Implemented core templates first
- [ ] Added security templates
- [ ] Integrated cross-cutting concerns
- [ ] Created integration tests
- [ ] Documented customizations

### Review Phase
- [ ] Verified template coverage
- [ ] Checked for redundancy
- [ ] Validated security implementation
- [ ] Tested error scenarios
- [ ] Updated documentation

---

## Next Steps

1. Review the [Template Reference](./template-reference.md) for available templates
2. Check [Quick Start Guides](./quick-start-guides.md) for your application type
3. Read domain-specific guides for detailed patterns
4. Set up your development environment
5. Start with core templates and iterate
