# Quick Start Guides

## Overview

This document provides quick start guides for building common application types using the AI Prompt Library v2. Each guide includes the essential templates, basic setup, and a minimal implementation path.

---

## Quick Start: E-Commerce Store

### Time to MVP: 2-4 weeks

### Essential Templates
```
commerce/product-catalog.md
commerce/shopping-cart.md
commerce/checkout-workflow.md
commerce/payment-processing.md
commerce/order-management.md
```

### Step-by-Step

**Step 1: Product Catalog (Days 1-3)**
```typescript
// From commerce/product-catalog.md
interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  variants: ProductVariant[];
  inventory: number;
}

// Create product service
const productService = new ProductService(database);
await productService.createProduct(productData);
```

**Step 2: Shopping Cart (Days 4-5)**
```typescript
// From commerce/shopping-cart.md
interface Cart {
  id: string;
  items: CartItem[];
  subtotal: number;
}

// Add to cart
await cartService.addItem(cartId, productId, quantity);
```

**Step 3: Checkout (Days 6-8)**
```typescript
// From commerce/checkout-workflow.md
const checkout = await checkoutService.initiate(cartId);
await checkoutService.setShippingAddress(checkout.id, address);
await checkoutService.setPaymentMethod(checkout.id, paymentMethod);
```

**Step 4: Payment Integration (Days 9-11)**
```typescript
// From commerce/payment-processing.md
const paymentIntent = await stripe.paymentIntents.create({
  amount: checkout.total,
  currency: 'usd',
  metadata: { orderId: checkout.orderId }
});
```

**Step 5: Order Management (Days 12-14)**
```typescript
// From commerce/order-management.md
const order = await orderService.createFromCheckout(checkout);
await notificationService.sendOrderConfirmation(order);
```

### Verification Checklist
- [ ] Products display correctly
- [ ] Cart persists across sessions
- [ ] Checkout flow completes
- [ ] Payments process successfully
- [ ] Order confirmation emails send

---

## Quick Start: Social Network

### Time to MVP: 3-5 weeks

### Essential Templates
```
social/user-profiles.md
social/social-graphs.md
social/content-feeds.md
social/real-time-messaging.md
security/multi-factor-auth.md
```

### Step-by-Step

**Step 1: User Profiles (Days 1-4)**
```typescript
// From social/user-profiles.md
interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  bio: string;
  privacySettings: PrivacySettings;
}

await profileService.createProfile(userId, profileData);
```

**Step 2: Social Graph (Days 5-8)**
```typescript
// From social/social-graphs.md
await socialGraph.sendFriendRequest(fromUserId, toUserId);
await socialGraph.acceptFriendRequest(requestId);
const friends = await socialGraph.getFriends(userId);
```

**Step 3: Content Feed (Days 9-14)**
```typescript
// From social/content-feeds.md
interface Post {
  id: string;
  authorId: string;
  content: string;
  media: Media[];
  createdAt: Date;
}

await feedService.createPost(userId, postData);
const feed = await feedService.getFeed(userId, { limit: 20 });
```

**Step 4: Messaging (Days 15-21)**
```typescript
// From social/real-time-messaging.md
const conversation = await messagingService.createConversation([user1, user2]);
await messagingService.sendMessage(conversationId, senderId, content);

// WebSocket for real-time
ws.on('message', (data) => handleIncomingMessage(data));
```

### Verification Checklist
- [ ] Users can create profiles
- [ ] Friend requests work
- [ ] Feed shows friends' posts
- [ ] Messages deliver in real-time
- [ ] Privacy settings respected

---

## Quick Start: SaaS Platform

### Time to MVP: 4-6 weeks

### Essential Templates
```
enterprise-saas/multi-tenancy.md
enterprise-saas/rbac-enterprise.md
enterprise-saas/enterprise-billing.md
enterprise-saas/sso-integration.md
enterprise-saas/audit-trails.md
```

### Step-by-Step

**Step 1: Multi-Tenancy (Days 1-5)**
```typescript
// From enterprise-saas/multi-tenancy.md
interface Tenant {
  id: string;
  name: string;
  subdomain: string;
  settings: TenantSettings;
}

// Tenant isolation middleware
app.use((req, res, next) => {
  req.tenantId = extractTenantFromHost(req.hostname);
  next();
});
```

**Step 2: RBAC (Days 6-10)**
```typescript
// From enterprise-saas/rbac-enterprise.md
interface Role {
  id: string;
  name: string;
  permissions: Permission[];
}

await rbacService.assignRole(userId, roleId, tenantId);
const canAccess = await rbacService.checkPermission(userId, 'resource:read');
```

**Step 3: Billing (Days 11-17)**
```typescript
// From enterprise-saas/enterprise-billing.md
const subscription = await billingService.createSubscription({
  tenantId,
  planId: 'pro',
  billingCycle: 'monthly'
});

// Usage tracking
await billingService.recordUsage(tenantId, 'api_calls', 100);
```

**Step 4: SSO (Days 18-24)**
```typescript
// From enterprise-saas/sso-integration.md
// SAML configuration
const samlConfig = {
  entryPoint: tenant.ssoConfig.entryPoint,
  issuer: 'your-app',
  cert: tenant.ssoConfig.certificate
};

passport.use(new SamlStrategy(samlConfig, verifyCallback));
```

**Step 5: Audit Trails (Days 25-28)**
```typescript
// From enterprise-saas/audit-trails.md
await auditService.log({
  tenantId,
  userId,
  action: 'user.created',
  resourceId: newUser.id,
  metadata: { email: newUser.email }
});
```

### Verification Checklist
- [ ] Tenant data isolated
- [ ] Roles and permissions work
- [ ] Billing integrates with Stripe
- [ ] SSO login functional
- [ ] Audit logs capture all actions

---

## Quick Start: Mobile App Backend

### Time to MVP: 2-3 weeks

### Essential Templates
```
security/multi-factor-auth.md
notifications/notification-channels.md
real-time-communication/websocket-management.md
analytics/user-analytics.md
deployment/cloud-deployment.md
```

### Step-by-Step

**Step 1: Authentication (Days 1-3)**
```typescript
// From security/multi-factor-auth.md
const authResult = await authService.login(email, password);
if (authResult.requiresMFA) {
  await authService.sendOTP(authResult.userId);
}
```

**Step 2: Push Notifications (Days 4-6)**
```typescript
// From notifications/notification-channels.md
await notificationService.registerDevice(userId, {
  token: fcmToken,
  platform: 'ios'
});

await notificationService.send(userId, {
  title: 'New Message',
  body: 'You have a new message',
  data: { conversationId }
});
```

**Step 3: Real-Time Updates (Days 7-9)**
```typescript
// From real-time-communication/websocket-management.md
const wss = new WebSocketServer({ port: 8080 });

wss.on('connection', (ws, req) => {
  const userId = authenticateWebSocket(req);
  connectionManager.add(userId, ws);
});
```

**Step 4: Analytics (Days 10-12)**
```typescript
// From analytics/user-analytics.md
await analyticsService.track(userId, 'screen_view', {
  screen: 'home',
  duration: 30
});
```

**Step 5: Deployment (Days 13-14)**
```yaml
# From deployment/cloud-deployment.md
# docker-compose.yml
services:
  api:
    image: your-api:latest
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
```

### Verification Checklist
- [ ] Auth flow works on mobile
- [ ] Push notifications deliver
- [ ] Real-time updates work
- [ ] Analytics events tracked
- [ ] API deployed and accessible

---

## Quick Start: Fintech App

### Time to MVP: 6-8 weeks

### Essential Templates
```
fintech/account-management.md
fintech/transaction-processing.md
fintech/fraud-detection.md
security/data-encryption.md
enterprise-saas/audit-trails.md
```

### Step-by-Step

**Step 1: KYC/Account Setup (Days 1-10)**
```typescript
// From fintech/account-management.md
const verification = await kycService.initiateVerification(userId);
await kycService.submitDocuments(verification.id, documents);
const result = await kycService.processVerification(verification.id);
```

**Step 2: Transaction Processing (Days 11-20)**
```typescript
// From fintech/transaction-processing.md
const transaction = await transactionService.process({
  fromAccountId,
  toAccountId,
  amount,
  currency: 'USD'
});
```

**Step 3: Fraud Detection (Days 21-28)**
```typescript
// From fintech/fraud-detection.md
const riskScore = await fraudService.analyze(transaction);
if (riskScore > 0.8) {
  await transactionService.block(transaction.id);
  await alertService.notifyFraudTeam(transaction);
}
```

**Step 4: Encryption (Days 29-35)**
```typescript
// From security/data-encryption.md
const encryptedSSN = await encryptionService.encrypt(ssn, 'pii');
const encryptedAccount = await encryptionService.encrypt(accountNumber, 'financial');
```

**Step 5: Compliance (Days 36-42)**
```typescript
// From enterprise-saas/audit-trails.md
await auditService.logFinancialEvent({
  type: 'transaction',
  transactionId: transaction.id,
  amount: transaction.amount,
  parties: [fromAccountId, toAccountId]
});
```

### Verification Checklist
- [ ] KYC verification works
- [ ] Transactions process correctly
- [ ] Fraud detection triggers
- [ ] All PII encrypted
- [ ] Audit trail complete

---

## Quick Start: Healthcare Portal

### Time to MVP: 6-8 weeks

### Essential Templates
```
healthcare/patient-data-management.md
healthcare/hipaa-compliance.md
healthcare/appointment-scheduling.md
healthcare/telemedicine.md
security/multi-factor-auth.md
```

### Step-by-Step

**Step 1: HIPAA Foundation (Days 1-7)**
```typescript
// From healthcare/hipaa-compliance.md
// Audit all PHI access
await auditService.logPHIAccess({
  userId,
  patientId,
  dataTypes: ['demographics', 'medical_history'],
  purpose: 'treatment'
});
```

**Step 2: Patient Records (Days 8-17)**
```typescript
// From healthcare/patient-data-management.md
const patient = await patientService.create({
  demographics: encryptedDemographics,
  medicalHistory: encryptedHistory
});

// Apply minimum necessary
const data = await patientService.getData(patientId, {
  requesterRole: 'nurse',
  purpose: 'treatment'
});
```

**Step 3: Scheduling (Days 18-24)**
```typescript
// From healthcare/appointment-scheduling.md
const appointment = await schedulingService.book({
  patientId,
  providerId,
  dateTime,
  type: 'telemedicine'
});

await notificationService.sendReminder(appointment);
```

**Step 4: Telemedicine (Days 25-35)**
```typescript
// From healthcare/telemedicine.md
const session = await telemedicineService.createSession(appointmentId);
const { patientToken, providerToken } = await session.generateTokens();
```

**Step 5: Authentication (Days 36-42)**
```typescript
// From security/multi-factor-auth.md
// Require MFA for all PHI access
const mfaRequired = await authService.checkMFARequired(userId, 'phi_access');
if (mfaRequired) {
  await authService.sendMFAChallenge(userId);
}
```

### Verification Checklist
- [ ] PHI access logged
- [ ] Encryption at rest/transit
- [ ] Appointments book correctly
- [ ] Video visits work
- [ ] MFA enforced

---

## Common Patterns Across All Apps

### Authentication Setup
```typescript
// Always include
import { authMiddleware } from './middleware/auth';
import { rateLimiter } from './middleware/rateLimit';

app.use(authMiddleware);
app.use(rateLimiter);
```

### Error Handling
```typescript
// Consistent error responses
app.use((err, req, res, next) => {
  logger.error(err);
  res.status(err.status || 500).json({
    error: err.message,
    code: err.code
  });
});
```

### Logging
```typescript
// Structured logging
logger.info('Operation completed', {
  userId: req.userId,
  action: 'create_order',
  resourceId: order.id,
  duration: Date.now() - startTime
});
```

---

## Next Steps

After completing a quick start:

1. **Review domain-specific guides** for deeper implementation patterns
2. **Add security hardening** using security templates
3. **Implement analytics** for user behavior tracking
4. **Set up monitoring** using deployment templates
5. **Add testing** using testing templates
