# Shopping Cart Management and Wishlist Features

<!-- INSTANTIATION RULES
When the drill-down engine (or any orchestrator) uses this template:
1. Every placeholder — including {{variables}}, <TBD>, [project name], and generic
   field/function/endpoint names — MUST be replaced with project-specific values
   before output is written to prompts/outputs/current/.
2. The template filename MUST NOT appear in task output. Dissolve the template
   into concrete content; do not reference its source.
3. No strings beginning with ".ai-prompts/prompts/" may appear in the output
   (validated by scripts/validate-instantiation.sh).
4. Outputs must contain real data shapes, real endpoints, real file paths, and
   real function signatures specific to the project.
-->


## Purpose
Comprehensive shopping cart and wishlist management system for e-commerce applications, supporting persistent carts, guest checkout, wishlist functionality, and advanced cart features.

## Instructions

1. **Setup Cart Storage**: Configure persistent cart storage (database, Redis, localStorage)
2. **Implement Cart Operations**: Deploy add, update, remove, and clear cart functionality
3. **Configure Guest Carts**: Set up anonymous cart handling and session management
4. **Setup Wishlist**: Implement wishlist creation, management, and sharing features
5. **Deploy Cart Recovery**: Configure abandoned cart recovery and email campaigns
6. **Implement Discounts**: Set up coupon codes, promotions, and discount calculations
7. **Configure Checkout**: Integrate cart with checkout and payment processing

## Examples

### Example 1: Basic Cart Operations
```typescript
interface CartItem {
  id: string;
  productId: string;
  variantId?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  customizations?: Record<string, any>;
  addedAt: Date;
}

const cartItem = await addToCart({
  cartId: "cart_123",
  productId: "prod_456",
  variantId: "var_789",
  quantity: 2,
  customizations: {
    color: "red",
    size: "medium",
    engraving: "Happy Birthday"
  }
});
```

### Example 2: Wishlist Management
```typescript
interface WishlistItem {
  id: string;
  productId: string;
  variantId?: string;
  addedAt: Date;
  notes?: string;
  priority: 'low' | 'medium' | 'high';
  priceAlert?: {
    enabled: boolean;
    targetPrice: number;
  };
}

const wishlist = await addToWishlist({
  userId: "user_123",
  productId: "prod_456",
  variantId: "var_789",
  notes: "For anniversary gift",
  priority: "high",
  priceAlert: {
    enabled: true,
    targetPrice: 99.99
  }
});
```

### Example 3: Cart Recovery System
```typescript
interface AbandonedCart {
  cartId: string;
  userId?: string;
  email?: string;
  items: CartItem[];
  totalValue: number;
  abandonedAt: Date;
  recoveryAttempts: number;
  lastReminderSent?: Date;
  recovered: boolean;
}

const recovery = await triggerCartRecovery({
  cartId: "cart_123",
  email: "customer@example.com",
  recoveryType: "email_sequence",
  incentive: {
    type: "discount",
    value: 10,
    unit: "percentage"
  }
});
```

## Variables

| Variable | Description | Type | Required | Default |
|----------|-------------|------|----------|---------|
| cartExpiration | Cart expiration time (days) | number | No | 30 |
| guestCartEnabled | Allow guest carts | boolean | Yes | true |
| maxCartItems | Maximum items per cart | number | No | 100 |
| wishlistEnabled | Enable wishlist functionality | boolean | No | true |
| cartRecoveryEnabled | Enable abandoned cart recovery | boolean | No | true |
| recoveryEmailDelay | Hours before first recovery email | number | No | 24 |
| maxRecoveryAttempts | Maximum recovery email attempts | number | No | 3 |
| persistentCart | Enable cross-device cart sync | boolean | No | true |

## Expected Output

This template will produce:
- **Shopping Cart System**: Full-featured cart management with persistence
- **Wishlist Platform**: User wishlist creation, management, and sharing
- **Guest Cart Support**: Anonymous shopping cart functionality
- **Cart Recovery System**: Abandoned cart email campaigns and recovery
- **Discount Engine**: Coupon codes, promotions, and pricing calculations
- **Cross-Device Sync**: Cart synchronization across multiple devices
- **Analytics Dashboard**: Cart abandonment and conversion tracking
- **Mobile Applications**: Mobile-optimized cart and wishlist interfaces

## Overview
Comprehensive shopping cart and wishlist management system for e-commerce applications, supporting persistent carts, guest checkout, wishlist functionality, and advanced cart features.

## Core Cart Management

### Cart Data Models

```typescript
interface CartItem {
  id: string;
  productId: string;
  variantId?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  customizations?: Record<string, any>;
  addedAt: Date;
  lastModified: Date;
}

interface ShoppingCart {
  id: string;
  userId?: string; // null for guest carts
  sessionId: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  discounts: CartDiscount[];
  total: number;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
  expiresAt?: Date;
}

interface CartDiscount {
  id: string;
  type: 'percentage' | 'fixed' | 'shipping' | 'bogo';
  code?: string;
  amount: number;
  description: string;
  appliedTo: string[]; // item IDs
}
```

### Cart Service Implementation

```typescript
class CartService {
  private cartRepository: CartRepository;
  private productService: ProductService;
  private pricingService: PricingService;

  async createCart(userId?: string, sessionId?: string): Promise<ShoppingCart> {
    const cart: ShoppingCart = {
      id: generateId(),
      userId,
      sessionId: sessionId || generateSessionId(),
      items: [],
      subtotal: 0,
      tax: 0,
      shipping: 0,
      discounts: [],
      total: 0,
      currency: 'USD',
      createdAt: new Date(),
      updatedAt: new Date(),
      expiresAt: userId ? undefined : addDays(new Date(), 30)
    };

    return await this.cartRepository.save(cart);
  }

  async addItem(cartId: string, item: Omit<CartItem, 'id' | 'addedAt' | 'lastModified'>): Promise<ShoppingCart> {
    const cart = await this.getCart(cartId);
    const product = await this.productService.getProduct(item.productId);
    
    // Validate product availability and pricing
    await this.validateCartItem(item, product);
    
    const existingItemIndex = cart.items.findIndex(
      existing => existing.productId === item.productId && 
                 existing.variantId === item.variantId
    );

    if (existingItemIndex >= 0) {
      cart.items[existingItemIndex].quantity += item.quantity;
      cart.items[existingItemIndex].totalPrice = 
        cart.items[existingItemIndex].quantity * cart.items[existingItemIndex].unitPrice;
      cart.items[existingItemIndex].lastModified = new Date();
    } else {
      const cartItem: CartItem = {
        ...item,
        id: generateId(),
        totalPrice: item.quantity * item.unitPrice,
        addedAt: new Date(),
        lastModified: new Date()
      };
      cart.items.push(cartItem);
    }

    return await this.recalculateAndSave(cart);
  }

  async updateItemQuantity(cartId: string, itemId: string, quantity: number): Promise<ShoppingCart> {
    const cart = await this.getCart(cartId);
    const itemIndex = cart.items.findIndex(item => item.id === itemId);
    
    if (itemIndex === -1) {
      throw new Error('Item not found in cart');
    }

    if (quantity <= 0) {
      cart.items.splice(itemIndex, 1);
    } else {
      cart.items[itemIndex].quantity = quantity;
      cart.items[itemIndex].totalPrice = quantity * cart.items[itemIndex].unitPrice;
      cart.items[itemIndex].lastModified = new Date();
    }

    return await this.recalculateAndSave(cart);
  }

  async removeItem(cartId: string, itemId: string): Promise<ShoppingCart> {
    const cart = await this.getCart(cartId);
    cart.items = cart.items.filter(item => item.id !== itemId);
    return await this.recalculateAndSave(cart);
  }

  async applyDiscount(cartId: string, discountCode: string): Promise<ShoppingCart> {
    const cart = await this.getCart(cartId);
    const discount = await this.validateDiscountCode(discountCode, cart);
    
    // Remove existing discount of same type
    cart.discounts = cart.discounts.filter(d => d.type !== discount.type);
    cart.discounts.push(discount);
    
    return await this.recalculateAndSave(cart);
  }

  private async recalculateAndSave(cart: ShoppingCart): Promise<ShoppingCart> {
    cart.subtotal = cart.items.reduce((sum, item) => sum + item.totalPrice, 0);
    
    // Apply discounts
    const discountAmount = this.calculateDiscounts(cart);
    const discountedSubtotal = Math.max(0, cart.subtotal - discountAmount);
    
    // Calculate tax and shipping
    cart.tax = await this.pricingService.calculateTax(discountedSubtotal, cart);
    cart.shipping = await this.pricingService.calculateShipping(cart);
    cart.total = discountedSubtotal + cart.tax + cart.shipping;
    
    cart.updatedAt = new Date();
    return await this.cartRepository.save(cart);
  }
}
```

## Persistent Cart Features

### Cross-Device Cart Synchronization

```typescript
class CartSyncService {
  async mergeGuestCartWithUserCart(guestCartId: string, userId: string): Promise<ShoppingCart> {
    const guestCart = await this.cartService.getCart(guestCartId);
    const userCart = await this.cartService.getUserCart(userId) || 
                     await this.cartService.createCart(userId);

    // Merge items, handling duplicates intelligently
    for (const guestItem of guestCart.items) {
      const existingItem = userCart.items.find(
        item => item.productId === guestItem.productId && 
               item.variantId === guestItem.variantId
      );

      if (existingItem) {
        // Keep the most recent modification or higher quantity
        if (guestItem.lastModified > existingItem.lastModified || 
            guestItem.quantity > existingItem.quantity) {
          existingItem.quantity = Math.max(existingItem.quantity, guestItem.quantity);
          existingItem.lastModified = new Date();
        }
      } else {
        userCart.items.push({
          ...guestItem,
          id: generateId(),
          addedAt: new Date()
        });
      }
    }

    // Merge applicable discounts
    for (const discount of guestCart.discounts) {
      if (!userCart.discounts.some(d => d.code === discount.code)) {
        userCart.discounts.push(discount);
      }
    }

    await this.cartService.deleteCart(guestCartId);
    return await this.cartService.recalculateAndSave(userCart);
  }

  async syncCartAcrossDevices(userId: string, deviceId: string): Promise<ShoppingCart> {
    const serverCart = await this.cartService.getUserCart(userId);
    const localCart = await this.getLocalCart(deviceId);

    if (!serverCart && !localCart) {
      return await this.cartService.createCart(userId);
    }

    if (!serverCart) {
      return await this.uploadLocalCart(localCart, userId);
    }

    if (!localCart) {
      await this.saveLocalCart(serverCart, deviceId);
      return serverCart;
    }

    // Resolve conflicts based on last modification time
    return await this.resolveCartConflicts(serverCart, localCart, userId);
  }
}
```

### Cart Abandonment Recovery

```typescript
class CartAbandonmentService {
  async scheduleAbandonmentEmails(cartId: string): Promise<void> {
    const cart = await this.cartService.getCart(cartId);
    
    if (!cart.userId || cart.items.length === 0) return;

    const user = await this.userService.getUser(cart.userId);
    
    // Schedule email sequence
    await this.emailScheduler.schedule([
      {
        delay: '1 hour',
        template: 'cart-reminder-1',
        data: { cart, user, items: cart.items.slice(0, 3) }
      },
      {
        delay: '24 hours',
        template: 'cart-reminder-2',
        data: { cart, user, discountCode: await this.generateRecoveryDiscount(cart) }
      },
      {
        delay: '72 hours',
        template: 'cart-final-reminder',
        data: { cart, user, urgencyMessage: 'Items may sell out soon' }
      }
    ]);
  }

  async generateRecoveryDiscount(cart: ShoppingCart): Promise<string> {
    const discountCode = `SAVE${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
    
    await this.discountService.createDiscount({
      code: discountCode,
      type: 'percentage',
      amount: 10,
      expiresAt: addDays(new Date(), 7),
      usageLimit: 1,
      applicableToCart: cart.id
    });

    return discountCode;
  }
}
```

## Wishlist Management

### Wishlist Data Models

```typescript
interface WishlistItem {
  id: string;
  productId: string;
  variantId?: string;
  addedAt: Date;
  notes?: string;
  priority: 'low' | 'medium' | 'high';
  priceAlert?: {
    enabled: boolean;
    targetPrice: number;
    notified: boolean;
  };
}

interface Wishlist {
  id: string;
  userId: string;
  name: string;
  description?: string;
  isPublic: boolean;
  items: WishlistItem[];
  shareToken?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Wishlist Service Implementation

```typescript
class WishlistService {
  async createWishlist(userId: string, name: string, isPublic = false): Promise<Wishlist> {
    const wishlist: Wishlist = {
      id: generateId(),
      userId,
      name,
      isPublic,
      items: [],
      shareToken: isPublic ? generateShareToken() : undefined,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    return await this.wishlistRepository.save(wishlist);
  }

  async addToWishlist(wishlistId: string, productId: string, variantId?: string): Promise<Wishlist> {
    const wishlist = await this.getWishlist(wishlistId);
    
    // Check if item already exists
    const existingItem = wishlist.items.find(
      item => item.productId === productId && item.variantId === variantId
    );

    if (existingItem) {
      throw new Error('Item already in wishlist');
    }

    const wishlistItem: WishlistItem = {
      id: generateId(),
      productId,
      variantId,
      addedAt: new Date(),
      priority: 'medium'
    };

    wishlist.items.push(wishlistItem);
    wishlist.updatedAt = new Date();

    return await this.wishlistRepository.save(wishlist);
  }

  async moveToCart(wishlistId: string, itemId: string, quantity = 1): Promise<{ wishlist: Wishlist; cart: ShoppingCart }> {
    const wishlist = await this.getWishlist(wishlistId);
    const item = wishlist.items.find(i => i.id === itemId);
    
    if (!item) {
      throw new Error('Item not found in wishlist');
    }

    const product = await this.productService.getProduct(item.productId);
    const cart = await this.cartService.getUserCart(wishlist.userId) ||
                 await this.cartService.createCart(wishlist.userId);

    // Add to cart
    await this.cartService.addItem(cart.id, {
      productId: item.productId,
      variantId: item.variantId,
      quantity,
      unitPrice: product.price
    });

    // Remove from wishlist
    wishlist.items = wishlist.items.filter(i => i.id !== itemId);
    wishlist.updatedAt = new Date();

    const updatedWishlist = await this.wishlistRepository.save(wishlist);
    const updatedCart = await this.cartService.getCart(cart.id);

    return { wishlist: updatedWishlist, cart: updatedCart };
  }

  async setupPriceAlert(wishlistId: string, itemId: string, targetPrice: number): Promise<Wishlist> {
    const wishlist = await this.getWishlist(wishlistId);
    const item = wishlist.items.find(i => i.id === itemId);
    
    if (!item) {
      throw new Error('Item not found in wishlist');
    }

    item.priceAlert = {
      enabled: true,
      targetPrice,
      notified: false
    };

    wishlist.updatedAt = new Date();
    return await this.wishlistRepository.save(wishlist);
  }
}
```

## Advanced Cart Features

### Save for Later Functionality

```typescript
class SaveForLaterService {
  async moveToSaveForLater(cartId: string, itemId: string): Promise<ShoppingCart> {
    const cart = await this.cartService.getCart(cartId);
    const item = cart.items.find(i => i.id === itemId);
    
    if (!item) {
      throw new Error('Item not found in cart');
    }

    // Create or get user's default wishlist
    const wishlist = await this.wishlistService.getOrCreateDefaultWishlist(cart.userId);
    
    // Add to wishlist
    await this.wishlistService.addToWishlist(wishlist.id, item.productId, item.variantId);
    
    // Remove from cart
    return await this.cartService.removeItem(cartId, itemId);
  }

  async moveFromSaveForLater(wishlistId: string, itemId: string): Promise<{ wishlist: Wishlist; cart: ShoppingCart }> {
    return await this.wishlistService.moveToCart(wishlistId, itemId);
  }
}
```

### Cart Sharing and Collaboration

```typescript
class CartSharingService {
  async shareCart(cartId: string, shareOptions: CartShareOptions): Promise<string> {
    const cart = await this.cartService.getCart(cartId);
    const shareToken = generateShareToken();
    
    const sharedCart = {
      token: shareToken,
      cartId,
      sharedBy: cart.userId,
      permissions: shareOptions.permissions,
      expiresAt: shareOptions.expiresAt || addDays(new Date(), 7),
      createdAt: new Date()
    };

    await this.cartShareRepository.save(sharedCart);

    if (shareOptions.notifyMethod === 'email') {
      await this.emailService.sendCartShare({
        to: shareOptions.recipients,
        shareUrl: `${process.env.APP_URL}/shared-cart/${shareToken}`,
        sharedBy: await this.userService.getUser(cart.userId),
        cart
      });
    }

    return shareToken;
  }

  async getSharedCart(shareToken: string): Promise<ShoppingCart> {
    const share = await this.cartShareRepository.findByToken(shareToken);
    
    if (!share || share.expiresAt < new Date()) {
      throw new Error('Invalid or expired share token');
    }

    return await this.cartService.getCart(share.cartId);
  }
}

interface CartShareOptions {
  recipients: string[];
  permissions: 'view' | 'edit';
  expiresAt?: Date;
  notifyMethod: 'email' | 'link';
}
```

## Cart Analytics and Optimization

### Cart Analytics Service

```typescript
class CartAnalyticsService {
  async trackCartEvent(cartId: string, event: CartEvent): Promise<void> {
    const analytics = {
      cartId,
      event: event.type,
      data: event.data,
      timestamp: new Date(),
      sessionId: event.sessionId,
      userId: event.userId
    };

    await this.analyticsRepository.save(analytics);
  }

  async getCartAbandonmentInsights(timeRange: DateRange): Promise<CartInsights> {
    const abandonedCarts = await this.cartRepository.findAbandoned(timeRange);
    
    return {
      abandonmentRate: this.calculateAbandonmentRate(abandonedCarts),
      commonAbandonmentPoints: this.analyzeAbandonmentPoints(abandonedCarts),
      recoveryOpportunities: this.identifyRecoveryOpportunities(abandonedCarts),
      topAbandonedProducts: this.getTopAbandonedProducts(abandonedCarts)
    };
  }

  async optimizeCartExperience(userId: string): Promise<CartOptimizations> {
    const userBehavior = await this.getUserCartBehavior(userId);
    
    return {
      recommendedProducts: await this.getCartRecommendations(userBehavior),
      suggestedBundles: await this.getBundleSuggestions(userBehavior),
      personalizedDiscounts: await this.getPersonalizedOffers(userBehavior),
      checkoutOptimizations: this.getCheckoutSuggestions(userBehavior)
    };
  }
}

interface CartEvent {
  type: 'item_added' | 'item_removed' | 'quantity_changed' | 'discount_applied' | 'checkout_started';
  data: any;
  sessionId: string;
  userId?: string;
}
```

## Implementation Guidelines

### Performance Optimization
- Implement cart caching with Redis for frequently accessed carts
- Use database indexing on userId, sessionId, and updatedAt fields
- Implement lazy loading for cart item details
- Use event sourcing for cart state changes to enable audit trails

### Security Considerations
- Validate all cart operations against user permissions
- Implement rate limiting for cart modifications
- Sanitize and validate all user inputs
- Use secure session management for guest carts

### Testing Strategy
- Unit tests for all cart operations and calculations
- Integration tests for cart synchronization across devices
- Load testing for high-traffic cart scenarios
- A/B testing for cart abandonment recovery strategies

### Monitoring and Alerts
- Track cart conversion rates and abandonment patterns
- Monitor cart performance metrics and response times
- Set up alerts for unusual cart behavior or errors
- Implement cart health checks and diagnostics

This comprehensive shopping cart and wishlist system provides a robust foundation for e-commerce applications with advanced features for user engagement, conversion optimization, and cross-platform synchronization.
