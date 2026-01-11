# Payment Methods and Currency Handling Template

## Purpose

This template provides comprehensive patterns for supporting multiple payment methods, handling various currencies, and creating flexible payment experiences that accommodate diverse customer preferences and international markets.

## Context

Modern e-commerce requires support for diverse payment methods across different regions and customer preferences. This template addresses the complexity of integrating multiple payment providers, digital wallets, alternative payment methods, and multi-currency support to maximize conversion rates and provide seamless checkout experiences globally.

## Instructions
1. Analyze payment method requirements and regional preferences
2. Design flexible payment method registry and configuration system
3. Implement comprehensive card payment validation and processing
4. Integrate digital wallet solutions (Apple Pay, Google Pay, etc.)
5. Add alternative payment methods (BNPL, bank transfers, crypto)
6. Build multi-currency support with real-time exchange rates
7. Create intelligent payment method selection and recommendation
8. Implement payment method security and tokenization
9. Add payment method analytics and performance tracking
10. Ensure mobile-optimized payment experiences

## Examples

### Example 1: Multi-Payment Method Integration
```typescript
// Comprehensive payment method registry
class PaymentMethodRegistry {
  async getAvailablePaymentMethods(context: PaymentContext): Promise<PaymentMethod[]> {
    const methods = await this.getAllPaymentMethods();
    
    return methods
      .filter(method => this.isAvailableInRegion(method, context.country))
      .filter(method => this.supportsAmount(method, context.amount))
      .filter(method => this.supportsCurrency(method, context.currency))
      .sort((a, b) => this.calculatePreferenceScore(b, context) - this.calculatePreferenceScore(a, context));
  }
}
```

### Example 2: Smart Currency Detection and Conversion
```typescript
// Intelligent currency handling
class CurrencyService {
  async detectAndConvertCurrency(amount: number, customerContext: CustomerContext): Promise<CurrencyResult> {
    const detectedCurrency = await this.detectCustomerCurrency(
      customerContext.country, 
      customerContext.ipAddress
    );
    
    const convertedAmount = await this.convertCurrency(
      amount, 
      'USD', 
      detectedCurrency
    );
    
    return {
      originalAmount: amount,
      originalCurrency: 'USD',
      convertedAmount,
      targetCurrency: detectedCurrency,
      exchangeRate: await this.getExchangeRate('USD', detectedCurrency)
    };
  }
}
```

### Example 3: Digital Wallet Integration
```typescript
// Apple Pay and Google Pay integration
class DigitalWalletProcessor {
  async processApplePayPayment(paymentRequest: ApplePayRequest): Promise<PaymentResult> {
    const session = new ApplePaySession(3, {
      countryCode: paymentRequest.countryCode,
      currencyCode: paymentRequest.currency,
      supportedNetworks: ['visa', 'masterCard', 'amex'],
      merchantCapabilities: ['supports3DS'],
      total: { label: 'Total', amount: paymentRequest.amount.toString() }
    });
    
    return await this.processDigitalWalletPayment(session);
  }
}
```

## Variables
| Variable | Type | Description | Default | Required |
|----------|------|-------------|---------|----------|
| supportedMethods | array | List of enabled payment methods | ['card', 'paypal'] | Yes |
| currencies | array | Supported currency codes | ['USD'] | Yes |
| regions | array | Supported country/region codes | ['US'] | Yes |
| cardBrands | array | Accepted credit card brands | ['visa', 'mastercard'] | No |
| digitalWallets | array | Enabled digital wallet options | [] | No |
| alternativePayments | array | BNPL and other alternative methods | [] | No |
| currencyConversion | boolean | Enable real-time currency conversion | false | No |
| paymentMethodSelection | string | Selection algorithm type | 'smart' | No |
| mobileOptimization | boolean | Mobile-first payment experience | true | No |
| securityLevel | string | Payment security level | 'standard' | No |

## Expected Output
A comprehensive payment methods system featuring:
- Flexible payment method registry with regional configuration
- Complete card payment processing with validation and security
- Digital wallet integrations (Apple Pay, Google Pay, Samsung Pay)
- Alternative payment methods (BNPL, bank transfers, cryptocurrency)
- Multi-currency support with real-time exchange rate conversion
- Intelligent payment method selection and recommendation engine
- Mobile-optimized payment experiences with touch-friendly interfaces
- Payment method analytics and performance tracking
- Security features including tokenization and fraud detection
- Localized payment preferences and regional method support

## Core Payment Method Patterns

### 1. Payment Method Registry

Create a flexible system to manage multiple payment methods:

```typescript
interface PaymentMethod {
  id: string;
  name: string;
  type: PaymentMethodType;
  provider: string;
  supportedCurrencies: string[];
  supportedCountries: string[];
  configuration: PaymentMethodConfig;
  fees: PaymentFees;
  limits: PaymentLimits;
  enabled: boolean;
}

enum PaymentMethodType {
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  DIGITAL_WALLET = 'digital_wallet',
  BANK_TRANSFER = 'bank_transfer',
  BUY_NOW_PAY_LATER = 'buy_now_pay_later',
  CRYPTOCURRENCY = 'cryptocurrency',
  MOBILE_PAYMENT = 'mobile_payment',
  PREPAID_CARD = 'prepaid_card',
  GIFT_CARD = 'gift_card'
}

interface PaymentMethodRegistry {
  registerPaymentMethod(method: PaymentMethod): Promise<void>;
  getAvailablePaymentMethods(country: string, currency: string): Promise<PaymentMethod[]>;
  getPaymentMethod(id: string): Promise<PaymentMethod>;
  updatePaymentMethod(id: string, updates: Partial<PaymentMethod>): Promise<void>;
  disablePaymentMethod(id: string): Promise<void>;
}
```

### 2. Credit and Debit Card Support

Implement comprehensive card payment support:

```typescript
interface CardPaymentMethod extends PaymentMethod {
  supportedCardBrands: CardBrand[];
  requiresCVV: boolean;
  supports3DS: boolean;
  supportsSaveCard: boolean;
  supportedAuthMethods: AuthMethod[];
}

enum CardBrand {
  VISA = 'visa',
  MASTERCARD = 'mastercard',
  AMERICAN_EXPRESS = 'amex',
  DISCOVER = 'discover',
  DINERS_CLUB = 'diners',
  JCB = 'jcb',
  UNIONPAY = 'unionpay',
  MAESTRO = 'maestro'
}

// Card validation and processing
class CardPaymentProcessor {
  async validateCard(cardData: CardData): Promise<CardValidation> {
    const validation: CardValidation = {
      isValid: true,
      errors: []
    };
    
    // Validate card number using Luhn algorithm
    if (!this.validateCardNumber(cardData.cardNumber)) {
      validation.isValid = false;
      validation.errors.push('Invalid card number');
    }
    
    // Validate expiry date
    if (!this.validateExpiryDate(cardData.expiryMonth, cardData.expiryYear)) {
      validation.isValid = false;
      validation.errors.push('Invalid or expired card');
    }
    
    // Validate CVV
    if (!this.validateCVV(cardData.cvv, cardData.cardBrand)) {
      validation.isValid = false;
      validation.errors.push('Invalid security code');
    }
    
    return validation;
  }
  
  private validateCardNumber(cardNumber: string): boolean {
    // Luhn algorithm implementation
    const digits = cardNumber.replace(/\D/g, '');
    let sum = 0;
    let isEven = false;
    
    for (let i = digits.length - 1; i >= 0; i--) {
      let digit = parseInt(digits[i]);
      
      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }
      
      sum += digit;
      isEven = !isEven;
    }
    
    return sum % 10 === 0;
  }
  
  detectCardBrand(cardNumber: string): CardBrand {
    const patterns = {
      [CardBrand.VISA]: /^4[0-9]{12}(?:[0-9]{3})?$/,
      [CardBrand.MASTERCARD]: /^5[1-5][0-9]{14}$/,
      [CardBrand.AMERICAN_EXPRESS]: /^3[47][0-9]{13}$/,
      [CardBrand.DISCOVER]: /^6(?:011|5[0-9]{2})[0-9]{12}$/,
      [CardBrand.DINERS_CLUB]: /^3[0689][0-9]{11}$/,
      [CardBrand.JCB]: /^(?:2131|1800|35\d{3})\d{11}$/
    };
    
    const cleanNumber = cardNumber.replace(/\D/g, '');
    
    for (const [brand, pattern] of Object.entries(patterns)) {
      if (pattern.test(cleanNumber)) {
        return brand as CardBrand;
      }
    }
    
    return CardBrand.VISA; // Default fallback
  }
}
```

### 3. Digital Wallet Integration

Support popular digital wallets:

```typescript
interface DigitalWalletMethod extends PaymentMethod {
  walletType: DigitalWalletType;
  requiresDeviceAuth: boolean;
  supportsBiometric: boolean;
  supportsTokenization: boolean;
}

enum DigitalWalletType {
  APPLE_PAY = 'apple_pay',
  GOOGLE_PAY = 'google_pay',
  SAMSUNG_PAY = 'samsung_pay',
  PAYPAL = 'paypal',
  AMAZON_PAY = 'amazon_pay',
  ALIPAY = 'alipay',
  WECHAT_PAY = 'wechat_pay'
}

// Apple Pay integration
class ApplePayProcessor {
  async initializeApplePay(): Promise<void> {
    if (!window.ApplePaySession || !ApplePaySession.canMakePayments()) {
      throw new Error('Apple Pay not supported');
    }
    
    const merchantCapabilities = ['supports3DS', 'supportsEMV', 'supportsCredit', 'supportsDebit'];
    const supportedNetworks = ['visa', 'masterCard', 'amex', 'discover'];
    
    this.applePaySession = new ApplePaySession(3, {
      countryCode: 'US',
      currencyCode: 'USD',
      supportedNetworks,
      merchantCapabilities,
      total: {
        label: 'Total',
        amount: '0.00'
      }
    });
  }
  
  async processApplePayPayment(paymentRequest: ApplePayPaymentRequest): Promise<PaymentResult> {
    return new Promise((resolve, reject) => {
      const session = new ApplePaySession(3, paymentRequest);
      
      session.onvalidatemerchant = async (event) => {
        try {
          const merchantSession = await this.validateMerchant(event.validationURL);
          session.completeMerchantValidation(merchantSession);
        } catch (error) {
          session.abort();
          reject(error);
        }
      };
      
      session.onpaymentauthorized = async (event) => {
        try {
          const result = await this.processPayment(event.payment);
          session.completePayment(ApplePaySession.STATUS_SUCCESS);
          resolve(result);
        } catch (error) {
          session.completePayment(ApplePaySession.STATUS_FAILURE);
          reject(error);
        }
      };
      
      session.begin();
    });
  }
}

// Google Pay integration
class GooglePayProcessor {
  async initializeGooglePay(): Promise<void> {
    const paymentsClient = new google.payments.api.PaymentsClient({
      environment: 'TEST' // or 'PRODUCTION'
    });
    
    const isReadyToPayRequest = {
      apiVersion: 2,
      apiVersionMinor: 0,
      allowedPaymentMethods: [{
        type: 'CARD',
        parameters: {
          allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
          allowedCardNetworks: ['MASTERCARD', 'VISA']
        }
      }]
    };
    
    const canPay = await paymentsClient.isReadyToPay(isReadyToPayRequest);
    if (!canPay.result) {
      throw new Error('Google Pay not supported');
    }
    
    this.paymentsClient = paymentsClient;
  }
  
  async processGooglePayPayment(paymentRequest: GooglePayPaymentRequest): Promise<PaymentResult> {
    const paymentData = await this.paymentsClient.loadPaymentData(paymentRequest);
    return await this.processPayment(paymentData);
  }
}
```

### 4. Alternative Payment Methods

Support regional and alternative payment methods:

```typescript
// Buy Now, Pay Later (BNPL) integration
class BNPLProcessor {
  async initializeKlarna(): Promise<void> {
    // Klarna integration
    window.Klarna.Payments.init({
      client_token: this.klarnaClientToken
    });
  }
  
  async processKlarnaPayment(orderData: OrderData): Promise<PaymentResult> {
    return new Promise((resolve, reject) => {
      window.Klarna.Payments.authorize({
        payment_method_category: 'pay_later'
      }, orderData, (res) => {
        if (res.approved) {
          resolve({
            success: true,
            authorizationToken: res.authorization_token,
            paymentMethod: 'klarna_pay_later'
          });
        } else {
          reject(new Error('Klarna payment not approved'));
        }
      });
    });
  }
  
  async initializeAfterpay(): Promise<void> {
    // Afterpay integration
    window.AfterPay.initialize({
      countryCode: 'US'
    });
  }
  
  async processAfterpayPayment(orderData: OrderData): Promise<PaymentResult> {
    const checkout = await window.AfterPay.redirect({
      token: orderData.token
    });
    
    return {
      success: true,
      checkoutToken: checkout.token,
      paymentMethod: 'afterpay'
    };
  }
}

// Bank transfer and ACH payments
class BankTransferProcessor {
  async initializePlaidACH(): Promise<void> {
    const handler = Plaid.create({
      token: this.plaidLinkToken,
      onSuccess: (public_token, metadata) => {
        this.exchangePublicToken(public_token);
      },
      onExit: (err, metadata) => {
        if (err != null) {
          console.error('Plaid Link error:', err);
        }
      }
    });
    
    this.plaidHandler = handler;
  }
  
  async processACHPayment(bankAccount: BankAccount, amount: number): Promise<PaymentResult> {
    // Process ACH payment through Plaid or Stripe ACH
    const achPayment = await this.achProvider.createPayment({
      amount,
      currency: 'USD',
      source: bankAccount.accountId,
      description: 'ACH Payment'
    });
    
    return {
      success: true,
      transactionId: achPayment.id,
      paymentMethod: 'ach',
      status: 'pending' // ACH payments are typically pending
    };
  }
}
```

### 5. Multi-Currency Support

Implement comprehensive currency handling:

```typescript
interface CurrencyManager {
  getSupportedCurrencies(): Promise<Currency[]>;
  convertCurrency(amount: number, fromCurrency: string, toCurrency: string): Promise<number>;
  getExchangeRate(fromCurrency: string, toCurrency: string): Promise<number>;
  formatCurrency(amount: number, currency: string, locale: string): string;
  detectCustomerCurrency(country: string, ipAddress: string): Promise<string>;
}

interface Currency {
  code: string; // ISO 4217 code
  name: string;
  symbol: string;
  decimalPlaces: number;
  supportedPaymentMethods: PaymentMethodType[];
  countries: string[];
}

class CurrencyService {
  private exchangeRateProvider: ExchangeRateProvider;
  private supportedCurrencies: Map<string, Currency>;
  
  constructor() {
    this.initializeSupportedCurrencies();
  }
  
  private initializeSupportedCurrencies(): void {
    this.supportedCurrencies = new Map([
      ['USD', {
        code: 'USD',
        name: 'US Dollar',
        symbol: '$',
        decimalPlaces: 2,
        supportedPaymentMethods: [
          PaymentMethodType.CREDIT_CARD,
          PaymentMethodType.DIGITAL_WALLET,
          PaymentMethodType.BANK_TRANSFER
        ],
        countries: ['US', 'EC', 'SV']
      }],
      ['EUR', {
        code: 'EUR',
        name: 'Euro',
        symbol: '€',
        decimalPlaces: 2,
        supportedPaymentMethods: [
          PaymentMethodType.CREDIT_CARD,
          PaymentMethodType.DIGITAL_WALLET,
          PaymentMethodType.BANK_TRANSFER
        ],
        countries: ['DE', 'FR', 'IT', 'ES', 'NL']
      }],
      ['GBP', {
        code: 'GBP',
        name: 'British Pound',
        symbol: '£',
        decimalPlaces: 2,
        supportedPaymentMethods: [
          PaymentMethodType.CREDIT_CARD,
          PaymentMethodType.DIGITAL_WALLET
        ],
        countries: ['GB']
      }],
      ['JPY', {
        code: 'JPY',
        name: 'Japanese Yen',
        symbol: '¥',
        decimalPlaces: 0,
        supportedPaymentMethods: [
          PaymentMethodType.CREDIT_CARD,
          PaymentMethodType.DIGITAL_WALLET
        ],
        countries: ['JP']
      }]
    ]);
  }
  
  async convertCurrency(amount: number, fromCurrency: string, toCurrency: string): Promise<number> {
    if (fromCurrency === toCurrency) {
      return amount;
    }
    
    const exchangeRate = await this.getExchangeRate(fromCurrency, toCurrency);
    const convertedAmount = amount * exchangeRate;
    
    const toCurrencyInfo = this.supportedCurrencies.get(toCurrency);
    const decimalPlaces = toCurrencyInfo?.decimalPlaces || 2;
    
    return Math.round(convertedAmount * Math.pow(10, decimalPlaces)) / Math.pow(10, decimalPlaces);
  }
  
  async getExchangeRate(fromCurrency: string, toCurrency: string): Promise<number> {
    // Cache exchange rates for performance
    const cacheKey = `${fromCurrency}_${toCurrency}`;
    const cachedRate = await this.getCachedExchangeRate(cacheKey);
    
    if (cachedRate && !this.isExchangeRateStale(cachedRate)) {
      return cachedRate.rate;
    }
    
    // Fetch fresh exchange rate
    const rate = await this.exchangeRateProvider.getExchangeRate(fromCurrency, toCurrency);
    
    // Cache the rate
    await this.cacheExchangeRate(cacheKey, rate);
    
    return rate;
  }
  
  formatCurrency(amount: number, currency: string, locale: string = 'en-US'): string {
    const currencyInfo = this.supportedCurrencies.get(currency);
    
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: currencyInfo?.decimalPlaces || 2,
      maximumFractionDigits: currencyInfo?.decimalPlaces || 2
    }).format(amount);
  }
  
  async detectCustomerCurrency(country: string, ipAddress?: string): Promise<string> {
    // First, try to detect by country
    for (const [currencyCode, currency] of this.supportedCurrencies) {
      if (currency.countries.includes(country)) {
        return currencyCode;
      }
    }
    
    // If IP address is provided, try geolocation
    if (ipAddress) {
      const geoLocation = await this.getLocationFromIP(ipAddress);
      if (geoLocation?.country) {
        return this.detectCustomerCurrency(geoLocation.country);
      }
    }
    
    // Default to USD
    return 'USD';
  }
}
```

### 6. Payment Method Selection UI

Create intelligent payment method selection:

```typescript
interface PaymentMethodSelector {
  getRecommendedPaymentMethods(context: PaymentContext): Promise<PaymentMethod[]>;
  sortPaymentMethodsByPreference(methods: PaymentMethod[], customer: Customer): PaymentMethod[];
  filterPaymentMethodsByAmount(methods: PaymentMethod[], amount: number): PaymentMethod[];
  getPaymentMethodFees(method: PaymentMethod, amount: number): PaymentFees;
}

interface PaymentContext {
  customerId?: string;
  country: string;
  currency: string;
  amount: number;
  orderType: 'physical' | 'digital' | 'service';
  deviceType: 'mobile' | 'desktop' | 'tablet';
  isRecurring: boolean;
}

class SmartPaymentMethodSelector {
  async getRecommendedPaymentMethods(context: PaymentContext): Promise<PaymentMethod[]> {
    // Get all available payment methods for the region
    let availableMethods = await this.paymentMethodRegistry.getAvailablePaymentMethods(
      context.country,
      context.currency
    );
    
    // Filter by amount limits
    availableMethods = this.filterByAmountLimits(availableMethods, context.amount);
    
    // Filter by order type compatibility
    availableMethods = this.filterByOrderType(availableMethods, context.orderType);
    
    // Sort by customer preference and regional popularity
    availableMethods = await this.sortByPreference(availableMethods, context);
    
    // Add payment method fees and estimated processing time
    for (const method of availableMethods) {
      method.fees = await this.calculateFees(method, context.amount);
      method.estimatedProcessingTime = this.getProcessingTime(method, context);
    }
    
    return availableMethods;
  }
  
  private filterByAmountLimits(methods: PaymentMethod[], amount: number): PaymentMethod[] {
    return methods.filter(method => {
      const limits = method.limits;
      return amount >= limits.minAmount && amount <= limits.maxAmount;
    });
  }
  
  private filterByOrderType(methods: PaymentMethod[], orderType: string): PaymentMethod[] {
    // Some payment methods work better for certain order types
    const orderTypePreferences = {
      'digital': [
        PaymentMethodType.CREDIT_CARD,
        PaymentMethodType.DIGITAL_WALLET,
        PaymentMethodType.CRYPTOCURRENCY
      ],
      'physical': [
        PaymentMethodType.CREDIT_CARD,
        PaymentMethodType.DIGITAL_WALLET,
        PaymentMethodType.BUY_NOW_PAY_LATER,
        PaymentMethodType.BANK_TRANSFER
      ],
      'service': [
        PaymentMethodType.CREDIT_CARD,
        PaymentMethodType.DIGITAL_WALLET,
        PaymentMethodType.BANK_TRANSFER
      ]
    };
    
    const preferredTypes = orderTypePreferences[orderType] || Object.values(PaymentMethodType);
    
    return methods.filter(method => preferredTypes.includes(method.type));
  }
  
  private async sortByPreference(methods: PaymentMethod[], context: PaymentContext): Promise<PaymentMethod[]> {
    // Get customer's payment history if available
    let customerPreferences: PaymentMethodType[] = [];
    if (context.customerId) {
      customerPreferences = await this.getCustomerPaymentPreferences(context.customerId);
    }
    
    // Get regional preferences
    const regionalPreferences = await this.getRegionalPaymentPreferences(context.country);
    
    // Sort by preference score
    return methods.sort((a, b) => {
      const scoreA = this.calculatePreferenceScore(a, customerPreferences, regionalPreferences, context);
      const scoreB = this.calculatePreferenceScore(b, customerPreferences, regionalPreferences, context);
      
      return scoreB - scoreA; // Higher score first
    });
  }
  
  private calculatePreferenceScore(
    method: PaymentMethod,
    customerPreferences: PaymentMethodType[],
    regionalPreferences: PaymentMethodType[],
    context: PaymentContext
  ): number {
    let score = 0;
    
    // Customer preference (highest weight)
    if (customerPreferences.includes(method.type)) {
      score += 100;
    }
    
    // Regional preference
    const regionalIndex = regionalPreferences.indexOf(method.type);
    if (regionalIndex !== -1) {
      score += 50 - (regionalIndex * 5); // Higher score for more popular methods
    }
    
    // Device compatibility
    if (context.deviceType === 'mobile' && this.isMobileFriendly(method)) {
      score += 20;
    }
    
    // Processing speed
    if (method.estimatedProcessingTime === 'instant') {
      score += 15;
    }
    
    // Lower fees
    const feePercentage = (method.fees?.percentage || 0) * 100;
    score += Math.max(0, 10 - feePercentage); // Bonus for lower fees
    
    return score;
  }
}
```

## Implementation Checklist

### Payment Method Setup
- [ ] Register all supported payment methods
- [ ] Configure payment provider integrations
- [ ] Set up payment method limits and fees
- [ ] Configure regional availability
- [ ] Test payment method functionality

### Currency Support
- [ ] Implement multi-currency support
- [ ] Set up exchange rate provider
- [ ] Configure currency conversion
- [ ] Implement currency formatting
- [ ] Test currency detection and conversion

### Digital Wallet Integration
- [ ] Implement Apple Pay integration
- [ ] Set up Google Pay integration
- [ ] Configure Samsung Pay (if needed)
- [ ] Test wallet payment flows
- [ ] Implement wallet tokenization

### Alternative Payment Methods
- [ ] Set up Buy Now, Pay Later providers
- [ ] Implement bank transfer/ACH payments
- [ ] Configure cryptocurrency payments (if needed)
- [ ] Set up mobile payment methods
- [ ] Test alternative payment flows

### Payment Method Selection
- [ ] Implement smart payment method selection
- [ ] Create payment method recommendation engine
- [ ] Set up customer preference tracking
- [ ] Implement regional payment preferences
- [ ] Test payment method sorting and filtering

## Configuration Parameters

```yaml
payment_methods:
  credit_cards:
    enabled: true
    supported_brands: ["visa", "mastercard", "amex", "discover"]
    require_cvv: true
    support_3ds: true
    
  digital_wallets:
    apple_pay:
      enabled: true
      merchant_id: "${APPLE_PAY_MERCHANT_ID}"
      supported_networks: ["visa", "mastercard", "amex"]
    google_pay:
      enabled: true
      merchant_id: "${GOOGLE_PAY_MERCHANT_ID}"
      gateway: "stripe"
    
  alternative_payments:
    klarna:
      enabled: true
      client_token: "${KLARNA_CLIENT_TOKEN}"
      supported_countries: ["US", "GB", "DE"]
    afterpay:
      enabled: true
      merchant_id: "${AFTERPAY_MERCHANT_ID}"
      supported_countries: ["US", "AU"]

currencies:
  supported: ["USD", "EUR", "GBP", "CAD", "AUD", "JPY"]
  default: "USD"
  exchange_rate_provider: "fixer.io"
  cache_duration: "1h"
  
payment_limits:
  min_amount: 0.50
  max_amount: 10000.00
  daily_limit: 50000.00
```

## Integration Points

- **Payment Processing**: Core payment processing integration
- **Customer Management**: Customer payment preferences and history
- **Order Management**: Order currency and payment method tracking
- **Fraud Detection**: Payment method risk assessment
- **Analytics**: Payment method performance tracking
- **Localization**: Currency and payment method localization

## Success Metrics

- Payment method adoption rate by region: >80%
- Currency conversion accuracy: 100%
- Payment method recommendation relevance: >90%
- Cross-border payment success rate: >95%
- Customer payment method satisfaction: >4.5/5

## Common Pitfalls to Avoid

1. **Limited payment method support**: Always offer multiple payment options
2. **Poor currency handling**: Implement accurate currency conversion and formatting
3. **Ignoring regional preferences**: Research and support local payment methods
4. **Complex payment flows**: Keep payment processes simple and intuitive
5. **Missing mobile optimization**: Ensure payment methods work well on mobile
6. **Inadequate testing**: Test all payment methods thoroughly
7. **Poor error handling**: Provide clear error messages for payment failures

## Related Templates

- `payment-processing.md` - Core payment processing patterns
- `payment-security.md` - Payment security and compliance
- `payment-subscriptions.md` - Recurring payment handling
- `checkout-workflow.md` - Checkout process integration
- `customer-management.md` - Customer payment preferences