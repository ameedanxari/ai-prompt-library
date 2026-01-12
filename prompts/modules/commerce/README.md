# Commerce Domain Templates

## Purpose
Generate comprehensive e-commerce feature patterns for building production-ready online stores, marketplace platforms, and digital commerce solutions with complete payment processing, product management, and customer experience capabilities.

## Instructions
1. Analyze e-commerce business requirements and customer journey needs
2. Select appropriate commerce templates based on business model (B2C, B2B, marketplace)
3. Implement core commerce functionality (products, cart, checkout, payments)
4. Build advanced features (search, reviews, subscriptions, multi-vendor)
5. Add security and compliance measures (PCI DSS, fraud prevention)
6. Create analytics and reporting capabilities for business insights
7. Implement mobile-optimized commerce experiences
8. Add internationalization support (currencies, languages, regions)
9. Build scalable architecture for high-volume transactions
10. Create comprehensive testing strategies for commerce workflows

## Examples

### Example 1: Complete E-commerce Platform
```typescript
// Full-featured online store implementation
class EcommercePlatform {
  async initializePlatform(config: CommerceConfig): Promise<Platform> {
    const platform = {
      productCatalog: new ProductCatalogService(config.catalog),
      shoppingCart: new ShoppingCartService(config.cart),
      checkoutWorkflow: new CheckoutService(config.checkout),
      paymentProcessing: new PaymentService(config.payments),
      orderManagement: new OrderService(config.orders),
      customerManagement: new CustomerService(config.customers)
    };
    
    await this.setupIntegrations(platform, config);
    return platform;
  }
}
```

### Example 2: Marketplace Platform
```typescript
// Multi-vendor marketplace with commission tracking
class MarketplacePlatform {
  async createMarketplace(config: MarketplaceConfig): Promise<Marketplace> {
    return {
      vendorManagement: new VendorService(config.vendors),
      commissionTracking: new CommissionService(config.commissions),
      multiVendorCheckout: new MarketplaceCheckoutService(config),
      disputeResolution: new DisputeService(config.disputes),
      marketplaceAnalytics: new MarketplaceAnalyticsService(config)
    };
  }
}
```

### Example 3: Subscription Commerce Platform
```typescript
// Subscription-based commerce with recurring billing
class SubscriptionPlatform {
  async setupSubscriptionCommerce(config: SubscriptionConfig): Promise<SubscriptionPlatform> {
    return {
      subscriptionPlans: new PlanManagementService(config.plans),
      recurringBilling: new BillingService(config.billing),
      dunningManagement: new DunningService(config.dunning),
      subscriptionAnalytics: new SubscriptionAnalyticsService(config)
    };
  }
}
```

## Variables
| Variable | Type | Description | Default | Required |
|----------|------|-------------|---------|----------|
| businessModel | string | Commerce model type | 'b2c' | Yes |
| paymentMethods | array | Supported payment options | ['card', 'paypal'] | Yes |
| currencies | array | Supported currencies | ['USD'] | Yes |
| regions | array | Supported geographic regions | ['US'] | Yes |
| productTypes | array | Types of products sold | ['physical'] | Yes |
| subscriptionSupport | boolean | Enable subscription features | false | No |
| marketplaceFeatures | boolean | Enable multi-vendor features | false | No |
| mobileOptimization | boolean | Mobile-first design | true | No |
| internationalSupport | boolean | Multi-region support | false | No |
| analyticsLevel | string | Analytics depth level | 'standard' | No |

## Expected Output
A comprehensive e-commerce solution featuring:
- Complete product catalog management with variants, inventory, and pricing
- Shopping cart and wishlist functionality with persistent storage
- Streamlined checkout workflow with multiple payment options
- Secure payment processing with PCI compliance and fraud prevention
- Order management with fulfillment tracking and customer communication
- Customer account management with purchase history and preferences
- Advanced search and discovery with faceted filtering and recommendations
- Product review and rating system with moderation and analytics
- Multi-currency and multi-language support for international markets
- Comprehensive analytics and reporting for business intelligence

This directory contains comprehensive e-commerce feature pattern templates for building production-ready online stores and marketplace platforms.

## Template Categories

### Payment Processing
- `payment-processing.md` - Core payment integration patterns for Stripe, PayPal, Square
- `payment-security.md` - PCI compliance and fraud prevention patterns
- `payment-methods.md` - Multiple payment options and currency handling
- `payment-subscriptions.md` - Recurring billing and subscription management

### Product Management
- `product-catalog.md` - Product management and variant handling
- `inventory-management.md` - Stock tracking and automated reordering
- `product-search.md` - Search, filtering, and recommendation engines
- `product-reviews.md` - Rating, review collection, and moderation

### Shopping Experience
- `shopping-cart.md` - Cart management and wishlist features
- `checkout-workflow.md` - Streamlined checkout processes
- `order-management.md` - Order processing and fulfillment tracking
- `marketplace-features.md` - Multi-vendor and commission tracking

## Usage

These templates are designed to be modular and composable. They can be combined to create comprehensive e-commerce solutions for various business models:

- **Single Vendor Store**: Use product catalog, shopping cart, payment processing, and order management
- **Marketplace Platform**: Add marketplace features, multi-vendor support, and commission tracking
- **Subscription Service**: Focus on payment subscriptions, recurring billing, and customer management
- **Digital Products**: Emphasize instant delivery, license management, and digital rights

## Templates

This module includes the following templates:

## Integration Points

Commerce templates integrate with cross-cutting concerns:
- **Security**: PCI compliance, fraud prevention, data protection
- **Analytics**: Sales tracking, customer behavior, conversion optimization
- **Testing**: Payment testing, inventory validation, order flow testing
- **Deployment**: Secure payment processing, compliance monitoring

## Requirements Coverage

These templates address Requirements 1.1-1.10 from the AI Prompt Library v2 specification, providing comprehensive e-commerce functionality patterns.