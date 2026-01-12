# E-Commerce Application Development Guide

## Purpose

This guide provides comprehensive patterns for building production-ready e-commerce applications using the AI Prompt Library v2 templates. It covers template selection, composition strategies, and implementation patterns for common e-commerce scenarios.

## Quick Start

### Essential Templates for E-Commerce

| Feature Area | Primary Templates | Supporting Templates |
|--------------|-------------------|---------------------|
| Payments | `commerce/payment-processing.md` | `commerce/payment-security.md`, `commerce/payment-methods.md` |
| Products | `commerce/product-catalog.md` | `commerce/product-search.md`, `commerce/product-reviews.md` |
| Shopping | `commerce/shopping-cart.md` | `commerce/checkout-workflow.md`, `commerce/order-management.md` |
| Inventory | `commerce/inventory-management.md` | `commerce/marketplace-features.md` |
| Subscriptions | `commerce/payment-subscriptions.md` | `enterprise-saas/enterprise-billing.md` |

## Template Composition Patterns

### Pattern 1: Basic Online Store

For a simple single-vendor e-commerce store:

```markdown
# Template Composition
1. commerce/product-catalog.md       # Product management
2. commerce/shopping-cart.md         # Cart functionality
3. commerce/checkout-workflow.md     # Checkout process
4. commerce/payment-processing.md    # Payment integration
5. commerce/order-management.md      # Order tracking

# Supporting Templates
- security/multi-factor-auth.md      # User authentication
- notifications/notification-channels.md  # Order notifications
- analytics/user-analytics.md        # Shopping behavior tracking
```

### Pattern 2: Marketplace Platform

For multi-vendor marketplace applications:

```markdown
# Core Templates
1. commerce/marketplace-features.md  # Multi-vendor support
2. commerce/product-catalog.md       # Product management
3. commerce/payment-processing.md    # Payment processing
4. commerce/payment-subscriptions.md # Seller subscriptions

# Vendor Management
- enterprise-saas/multi-tenancy.md   # Vendor isolation
- enterprise-saas/rbac-enterprise.md # Vendor permissions
- enterprise-saas/enterprise-billing.md # Commission tracking

# Trust & Safety
- social/content-moderation.md       # Product moderation
- commerce/product-reviews.md        # Review system
```

### Pattern 3: Subscription Commerce

For subscription-based e-commerce:

```markdown
# Subscription Core
1. commerce/payment-subscriptions.md # Recurring billing
2. enterprise-saas/enterprise-billing.md # Usage tracking
3. commerce/payment-processing.md    # Payment handling

# Customer Management
- fintech/account-management.md      # Customer accounts
- notifications/communication-automation.md # Renewal reminders
- analytics/cohort-analysis.md       # Retention analysis
```

## Implementation Examples

### Example 1: Product Catalog with Search

```typescript
// Combining product-catalog.md and product-search.md patterns

interface ProductCatalog {
  // From product-catalog.md
  products: Product[];
  categories: Category[];
  variants: ProductVariant[];
  
  // From product-search.md
  searchIndex: SearchIndex;
  filters: FilterConfiguration;
  recommendations: RecommendationEngine;
}

// Implementation combining both templates
class ECommerceProductService {
  async searchProducts(query: SearchQuery): Promise<SearchResult> {
    // Apply full-text search from product-search.md
    const searchResults = await this.searchEngine.search(query.text);
    
    // Apply category filters from product-catalog.md
    const filteredResults = this.applyFilters(searchResults, query.filters);
    
    // Add recommendations from product-search.md
    const recommendations = await this.recommendationEngine.getRelated(filteredResults);
    
    return {
      products: filteredResults,
      recommendations,
      facets: this.generateFacets(filteredResults),
      totalCount: filteredResults.length
    };
  }
}
```

### Example 2: Checkout with Multiple Payment Providers

```typescript
// Combining checkout-workflow.md and payment-processing.md patterns

interface CheckoutFlow {
  // From checkout-workflow.md
  cart: ShoppingCart;
  shippingAddress: Address;
  billingAddress: Address;
  shippingMethod: ShippingMethod;
  
  // From payment-processing.md
  paymentProvider: PaymentProvider;
  paymentMethod: PaymentMethod;
  paymentIntent: PaymentIntent;
}

class CheckoutService {
  async processCheckout(checkout: CheckoutFlow): Promise<OrderResult> {
    // Validate cart (checkout-workflow.md)
    await this.validateCart(checkout.cart);
    
    // Calculate totals including shipping (checkout-workflow.md)
    const totals = await this.calculateTotals(checkout);
    
    // Process payment (payment-processing.md)
    const paymentResult = await this.paymentService.processPayment({
      amount: totals.grandTotal,
      currency: checkout.cart.currency,
      paymentMethod: checkout.paymentMethod,
      metadata: { orderId: checkout.orderId }
    });
    
    // Create order (order-management.md)
    if (paymentResult.status === 'succeeded') {
      return await this.orderService.createOrder(checkout, paymentResult);
    }
    
    throw new PaymentFailedError(paymentResult.error);
  }
}
```

### Example 3: Inventory Management with Alerts

```typescript
// From inventory-management.md patterns

interface InventorySystem {
  stockLevels: Map<string, StockLevel>;
  reorderPoints: Map<string, number>;
  suppliers: Supplier[];
  alerts: InventoryAlert[];
}

class InventoryService {
  async checkAndReorder(productId: string): Promise<ReorderResult | null> {
    const stock = await this.getStockLevel(productId);
    const reorderPoint = await this.getReorderPoint(productId);
    
    if (stock.available <= reorderPoint) {
      // Trigger low stock alert
      await this.alertService.sendLowStockAlert(productId, stock);
      
      // Auto-reorder if configured
      if (this.autoReorderEnabled(productId)) {
        return await this.createPurchaseOrder(productId);
      }
    }
    
    return null;
  }
  
  async reserveInventory(orderId: string, items: OrderItem[]): Promise<ReservationResult> {
    const reservations = [];
    
    for (const item of items) {
      const reservation = await this.createReservation({
        productId: item.productId,
        quantity: item.quantity,
        orderId,
        expiresAt: this.calculateReservationExpiry()
      });
      reservations.push(reservation);
    }
    
    return { orderId, reservations, status: 'reserved' };
  }
}
```

## Security Considerations

### PCI Compliance

When handling payments, always use templates in combination:

```markdown
# Required Template Combination
1. commerce/payment-processing.md    # Core payment handling
2. commerce/payment-security.md      # PCI compliance patterns
3. security/data-encryption.md       # Data protection
4. enterprise-saas/audit-trails.md   # Transaction logging
```

Key security patterns:
- Never store raw card numbers (use tokenization)
- Implement webhook signature verification
- Use TLS for all payment communications
- Log all payment events for audit trails

### Fraud Prevention

```typescript
// Combining payment-security.md and security/threat-detection.md

interface FraudPrevention {
  riskScore: number;
  signals: FraudSignal[];
  decision: 'allow' | 'review' | 'block';
}

async function assessTransactionRisk(transaction: Transaction): Promise<FraudPrevention> {
  const signals = await Promise.all([
    this.checkVelocity(transaction),
    this.checkDeviceFingerprint(transaction),
    this.checkAddressMismatch(transaction),
    this.checkHighRiskIndicators(transaction)
  ]);
  
  const riskScore = this.calculateRiskScore(signals);
  
  return {
    riskScore,
    signals,
    decision: this.makeDecision(riskScore)
  };
}
```

## Performance Optimization

### Caching Strategy

```markdown
# Recommended Cache Layers
1. Product catalog: CDN + Redis (TTL: 5 minutes)
2. Search results: Redis (TTL: 1 minute)
3. Cart data: Redis (TTL: 24 hours)
4. Inventory levels: Redis (TTL: 30 seconds)
```

### Database Optimization

```typescript
// Product search optimization patterns
interface SearchOptimization {
  // Use Elasticsearch for full-text search
  searchEngine: 'elasticsearch' | 'algolia' | 'typesense';
  
  // Denormalize for read performance
  productIndex: {
    id: string;
    name: string;
    description: string;
    category: string;      // Denormalized
    brand: string;         // Denormalized
    price: number;
    inStock: boolean;      // Denormalized from inventory
  };
}
```

## Testing Strategy

### Unit Tests

```typescript
// Test payment processing
describe('PaymentService', () => {
  it('should process valid payment', async () => {
    const result = await paymentService.processPayment({
      amount: 2999,
      currency: 'USD',
      paymentMethodId: 'pm_test_123'
    });
    
    expect(result.status).toBe('succeeded');
  });
  
  it('should handle declined cards', async () => {
    await expect(paymentService.processPayment({
      amount: 2999,
      currency: 'USD',
      paymentMethodId: 'pm_card_declined'
    })).rejects.toThrow('Card declined');
  });
});
```

### Property-Based Tests

```typescript
// Property: Cart total equals sum of item prices
describe('Shopping Cart Properties', () => {
  it('cart total should equal sum of items', () => {
    fc.assert(fc.property(
      fc.array(fc.record({
        price: fc.integer({ min: 1, max: 100000 }),
        quantity: fc.integer({ min: 1, max: 10 })
      })),
      (items) => {
        const cart = new ShoppingCart(items);
        const expectedTotal = items.reduce(
          (sum, item) => sum + (item.price * item.quantity), 
          0
        );
        return cart.total === expectedTotal;
      }
    ));
  });
});
```

## Common Pitfalls

1. **Race conditions in inventory**: Use database transactions or optimistic locking
2. **Cart abandonment**: Implement cart recovery emails and session persistence
3. **Payment webhook handling**: Always verify signatures and handle idempotency
4. **Price consistency**: Lock prices at checkout time, not at cart addition
5. **Tax calculation**: Use dedicated tax services for multi-jurisdiction compliance

## Related Templates

- `analytics/user-analytics.md` - Shopping behavior tracking
- `notifications/notification-channels.md` - Order notifications
- `search-discovery/recommendation-systems.md` - Product recommendations
- `gamification/point-systems.md` - Loyalty programs
- `integration/webhook-systems.md` - Third-party integrations

## Next Steps

1. Review individual template documentation for detailed implementation patterns
2. Set up development environment with sandbox payment providers
3. Implement core product catalog and cart functionality
4. Add payment processing with proper error handling
5. Integrate inventory management and order fulfillment
