# Payment Processing Integration Template

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

This template provides comprehensive patterns for integrating payment processing capabilities into e-commerce applications, supporting major payment providers (Stripe, PayPal, Square) with production-ready implementation patterns.

## Instructions

1. **Setup Payment Provider Accounts**: Register with Stripe, PayPal, and/or Square
2. **Configure API Keys**: Set up secure API key management for payment providers
3. **Implement Payment Abstraction**: Create unified payment interface for multiple providers
4. **Setup Webhook Handling**: Configure secure webhook endpoints for payment events
5. **Implement Security**: Deploy PCI compliance and fraud prevention measures
6. **Configure Testing**: Set up sandbox environments for payment testing
7. **Deploy Monitoring**: Implement payment analytics and error tracking

## Examples

### Example 1: Stripe Payment Integration
```typescript
interface StripePayment {
  paymentIntentId: string;
  amount: number;
  currency: string;
  customerId?: string;
  paymentMethodId: string;
  metadata: Record<string, string>;
}

const payment = await processStripePayment({
  amount: 2999, // $29.99 in cents
  currency: "usd",
  customerId: "cus_12345",
  paymentMethodId: "pm_67890",
  metadata: {
    orderId: "order_123",
    productId: "prod_456"
  }
});
```

### Example 2: PayPal Integration
```typescript
interface PayPalPayment {
  orderId: string;
  amount: {
    currency_code: string;
    value: string;
  };
  purchase_units: Array<{
    reference_id: string;
    amount: PayPalAmount;
    items: PayPalItem[];
  }>;
}

const paypalOrder = await createPayPalOrder({
  intent: "CAPTURE",
  purchase_units: [{
    reference_id: "order_123",
    amount: {
      currency_code: "USD",
      value: "29.99"
    },
    items: [{
      name: "Premium Subscription",
      quantity: "1",
      unit_amount: { currency_code: "USD", value: "29.99" }
    }]
  }]
});
```

### Example 3: Payment Webhook Handling
```typescript
interface PaymentWebhook {
  eventType: 'payment.succeeded' | 'payment.failed' | 'payment.refunded';
  paymentId: string;
  amount: number;
  currency: string;
  customerId: string;
  metadata: Record<string, any>;
  timestamp: Date;
}

const webhookHandler = await handlePaymentWebhook({
  provider: "stripe",
  signature: request.headers["stripe-signature"],
  payload: request.body,
  endpointSecret: process.env.STRIPE_WEBHOOK_SECRET
});
```

## Variables

| Variable | Description | Type | Required | Default |
|----------|-------------|------|----------|---------|
| paymentProviders | Enabled payment providers | string[] | Yes | N/A |
| defaultCurrency | Default payment currency | string | Yes | "USD" |
| webhookSecret | Webhook endpoint secret key | string | Yes | N/A |
| fraudDetection | Enable fraud detection | boolean | No | true |
| pciCompliance | PCI compliance level | string | Yes | "Level 1" |
| refundPolicy | Automatic refund policy | string | No | "manual" |
| paymentTimeout | Payment timeout (seconds) | number | No | 300 |
| retryAttempts | Failed payment retry attempts | number | No | 3 |

## Expected Output

This template will produce:
- **Payment Processing System**: Multi-provider payment integration
- **Secure Payment Forms**: PCI-compliant payment collection interfaces
- **Webhook Management**: Automated payment event handling
- **Fraud Prevention**: Real-time fraud detection and prevention
- **Payment Analytics**: Transaction monitoring and reporting
- **Refund Management**: Automated and manual refund processing
- **Compliance Framework**: PCI DSS compliance implementation
- **Testing Suite**: Comprehensive payment testing infrastructure

## Context

Payment processing is the backbone of any e-commerce application. This template addresses the complexity of handling multiple payment providers, ensuring secure transactions, managing payment states, and providing excellent user experience across different payment methods.

## Core Implementation Patterns

### 1. Payment Provider Abstraction Layer

Create a unified interface for all payment providers to ensure consistency and easy provider switching:

```typescript
interface PaymentProvider {
  name: string;
  initialize(config: PaymentConfig): Promise<void>;
  createPaymentIntent(amount: number, currency: string, metadata?: any): Promise<PaymentIntent>;
  confirmPayment(paymentIntentId: string, paymentMethod: PaymentMethod): Promise<PaymentResult>;
  refundPayment(paymentId: string, amount?: number): Promise<RefundResult>;
  getPaymentStatus(paymentId: string): Promise<PaymentStatus>;
  handleWebhook(payload: any, signature: string): Promise<WebhookResult>;
}
```

### 2. Stripe Integration Pattern

Implement Stripe as the primary payment provider with comprehensive error handling:

```javascript
// Client-side Stripe integration
const stripe = Stripe('pk_test_...');
const elements = stripe.elements();

// Create payment form with proper validation
const cardElement = elements.create('card', {
  style: {
    base: {
      fontSize: '16px',
      color: '#424770',
      '::placeholder': {
        color: '#aab7c4',
      },
    },
  },
});

// Handle payment submission
async function handlePayment(clientSecret) {
  const {error, paymentIntent} = await stripe.confirmCardPayment(clientSecret, {
    payment_method: {
      card: cardElement,
      billing_details: {
        name: customerName,
        email: customerEmail,
      },
    }
  });

  if (error) {
    handlePaymentError(error);
  } else if (paymentIntent.status === 'succeeded') {
    handlePaymentSuccess(paymentIntent);
  }
}
```

### 3. PayPal Integration Pattern

Implement PayPal integration with both Express Checkout and Advanced Credit and Debit Card Payments:

```javascript
// PayPal SDK integration
paypal.Buttons({
  createOrder: function(data, actions) {
    return actions.order.create({
      purchase_units: [{
        amount: {
          value: orderTotal,
          currency_code: 'USD'
        },
        description: orderDescription
      }]
    });
  },
  onApprove: function(data, actions) {
    return actions.order.capture().then(function(details) {
      handlePayPalSuccess(details);
    });
  },
  onError: function(err) {
    handlePayPalError(err);
  }
}).render('#paypal-button-container');
```

### 4. Square Integration Pattern

Implement Square payment processing with proper error handling:

```javascript
// Square Web Payments SDK
const payments = Square.payments(applicationId, locationId);

async function initializeSquare() {
  const card = await payments.card();
  await card.attach('#card-container');
  
  return card;
}

async function handleSquarePayment(card) {
  const tokenResult = await card.tokenize();
  
  if (tokenResult.status === 'OK') {
    const paymentResult = await processSquarePayment(tokenResult.token);
    handlePaymentResult(paymentResult);
  } else {
    handleSquareError(tokenResult.errors);
  }
}
```

### 5. Payment State Management

Implement comprehensive payment state tracking:

```typescript
enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SUCCEEDED = 'succeeded',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
  PARTIALLY_REFUNDED = 'partially_refunded'
}

interface PaymentTransaction {
  id: string;
  orderId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  provider: string;
  providerTransactionId: string;
  paymentMethod: PaymentMethodType;
  createdAt: Date;
  updatedAt: Date;
  metadata: Record<string, any>;
}
```

### 6. Webhook Handling Pattern

Implement secure webhook processing for payment status updates:

```typescript
// Webhook signature verification
function verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload, 'utf8')
    .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature, 'hex'),
    Buffer.from(expectedSignature, 'hex')
  );
}

// Webhook event processing
async function processPaymentWebhook(event: WebhookEvent) {
  switch (event.type) {
    case 'payment_intent.succeeded':
      await handlePaymentSuccess(event.data.object);
      break;
    case 'payment_intent.payment_failed':
      await handlePaymentFailure(event.data.object);
      break;
    case 'charge.dispute.created':
      await handleChargeback(event.data.object);
      break;
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }
}
```

### 7. Error Handling and Recovery

Implement comprehensive error handling with user-friendly messages:

```typescript
interface PaymentError {
  code: string;
  message: string;
  type: 'card_error' | 'validation_error' | 'api_error' | 'authentication_error';
  userMessage: string;
  retryable: boolean;
}

function handlePaymentError(error: any): PaymentError {
  const errorMap = {
    'card_declined': {
      userMessage: 'Your card was declined. Please try a different payment method.',
      retryable: true
    },
    'insufficient_funds': {
      userMessage: 'Your card has insufficient funds. Please try a different card.',
      retryable: true
    },
    'expired_card': {
      userMessage: 'Your card has expired. Please update your payment information.',
      retryable: false
    },
    'processing_error': {
      userMessage: 'There was an error processing your payment. Please try again.',
      retryable: true
    }
  };

  return {
    code: error.code,
    message: error.message,
    type: error.type,
    userMessage: errorMap[error.code]?.userMessage || 'An unexpected error occurred.',
    retryable: errorMap[error.code]?.retryable || false
  };
}
```

## Implementation Checklist

### Setup and Configuration
- [ ] Set up payment provider accounts (Stripe, PayPal, Square)
- [ ] Configure API keys and webhook endpoints
- [ ] Set up SSL certificates for secure payment processing
- [ ] Configure payment provider webhooks

### Core Payment Flow
- [ ] Implement payment provider abstraction layer
- [ ] Create payment intent/order creation endpoints
- [ ] Build payment confirmation handling
- [ ] Implement payment status tracking
- [ ] Add payment method validation

### Security Implementation
- [ ] Implement webhook signature verification
- [ ] Add payment data encryption
- [ ] Set up secure API key management
- [ ] Implement fraud detection integration
- [ ] Add payment audit logging

### Error Handling
- [ ] Create comprehensive error mapping
- [ ] Implement retry mechanisms for failed payments
- [ ] Add user-friendly error messages
- [ ] Set up payment failure notifications
- [ ] Implement payment recovery workflows

### Testing and Validation
- [ ] Set up payment provider test environments
- [ ] Create automated payment flow tests
- [ ] Test webhook handling and signature verification
- [ ] Validate error handling scenarios
- [ ] Test payment provider failover

## Configuration Parameters

```yaml
payment_providers:
  stripe:
    public_key: "${STRIPE_PUBLIC_KEY}"
    secret_key: "${STRIPE_SECRET_KEY}"
    webhook_secret: "${STRIPE_WEBHOOK_SECRET}"
    api_version: "2023-10-16"
  
  paypal:
    client_id: "${PAYPAL_CLIENT_ID}"
    client_secret: "${PAYPAL_CLIENT_SECRET}"
    environment: "sandbox" # or "production"
    webhook_id: "${PAYPAL_WEBHOOK_ID}"
  
  square:
    application_id: "${SQUARE_APPLICATION_ID}"
    access_token: "${SQUARE_ACCESS_TOKEN}"
    location_id: "${SQUARE_LOCATION_ID}"
    environment: "sandbox" # or "production"

payment_settings:
  default_currency: "USD"
  supported_currencies: ["USD", "EUR", "GBP", "CAD"]
  payment_timeout: 300 # seconds
  retry_attempts: 3
  webhook_timeout: 30 # seconds
```

## Integration Points

- **Order Management**: Link payments to order processing workflows
- **Customer Management**: Associate payments with customer accounts
- **Inventory Management**: Reserve inventory during payment processing
- **Notification System**: Send payment confirmations and receipts
- **Analytics**: Track payment success rates and provider performance
- **Security System**: Integrate with fraud detection and PCI compliance

## Success Metrics

- Payment success rate > 95%
- Average payment processing time < 3 seconds
- Webhook processing reliability > 99%
- Payment error recovery rate > 80%
- Customer payment experience satisfaction > 4.5/5

## Common Pitfalls to Avoid

1. **Storing sensitive payment data**: Never store card numbers or CVV codes
2. **Inadequate error handling**: Always provide clear, actionable error messages
3. **Missing webhook verification**: Always verify webhook signatures
4. **Synchronous payment processing**: Use asynchronous processing for better UX
5. **Single provider dependency**: Always have backup payment providers
6. **Insufficient logging**: Log all payment events for debugging and compliance
7. **Missing refund handling**: Implement comprehensive refund workflows

## Related Templates

- `payment-security.md` - PCI compliance and fraud prevention
- `payment-methods.md` - Multiple payment options and currencies
- `payment-subscriptions.md` - Recurring billing patterns
- `order-management.md` - Order processing integration
- `customer-management.md` - Customer account integration
