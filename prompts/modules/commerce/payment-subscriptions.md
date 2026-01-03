# Payment Subscriptions and Recurring Billing Template

## Purpose

This template provides comprehensive patterns for implementing subscription-based billing, recurring payments, and subscription lifecycle management for SaaS applications, membership sites, and subscription commerce platforms.

## Context

Subscription and recurring billing systems require sophisticated handling of payment schedules, plan changes, proration, dunning management, and customer lifecycle events. This template addresses the complexity of building reliable subscription systems that handle various billing scenarios and provide excellent customer experience.

## Core Subscription Patterns

### 1. Subscription Data Model

Define comprehensive subscription data structures:

```typescript
interface Subscription {
  id: string;
  customerId: string;
  planId: string;
  status: SubscriptionStatus;
  billingCycle: BillingCycle;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  trialStart?: Date;
  trialEnd?: Date;
  canceledAt?: Date;
  cancelAtPeriodEnd: boolean;
  paymentMethodId: string;
  discounts: SubscriptionDiscount[];
  addOns: SubscriptionAddOn[];
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

enum SubscriptionStatus {
  ACTIVE = 'active',
  TRIALING = 'trialing',
  PAST_DUE = 'past_due',
  CANCELED = 'canceled',
  UNPAID = 'unpaid',
  INCOMPLETE = 'incomplete',
  INCOMPLETE_EXPIRED = 'incomplete_expired',
  PAUSED = 'paused'
}

enum BillingCycle {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  SEMI_ANNUALLY = 'semi_annually',
  ANNUALLY = 'annually',
  CUSTOM = 'custom'
}

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  amount: number;
  currency: string;
  interval: BillingCycle;
  intervalCount: number; // e.g., 2 for "every 2 months"
  trialPeriodDays?: number;
  setupFee?: number;
  features: PlanFeature[];
  limits: PlanLimits;
  active: boolean;
  metadata: Record<string, any>;
}

interface PlanFeature {
  id: string;
  name: string;
  description: string;
  included: boolean;
  limit?: number;
  overage?: OverageConfig;
}

interface OverageConfig {
  enabled: boolean;
  unitPrice: number;
  includedUnits: number;
  billingModel: 'per_unit' | 'tiered' | 'volume';
}
```

### 2. Subscription Creation and Management

Implement subscription lifecycle management:

```typescript
class SubscriptionManager {
  async createSubscription(request: CreateSubscriptionRequest): Promise<Subscription> {
    // 1. Validate customer and payment method
    const customer = await this.customerService.getCustomer(request.customerId);
    const paymentMethod = await this.paymentService.getPaymentMethod(request.paymentMethodId);
    
    if (!customer || !paymentMethod) {
      throw new Error('Invalid customer or payment method');
    }
    
    // 2. Get subscription plan
    const plan = await this.planService.getPlan(request.planId);
    if (!plan || !plan.active) {
      throw new Error('Invalid or inactive plan');
    }
    
    // 3. Calculate trial and billing periods
    const now = new Date();
    const trialEnd = plan.trialPeriodDays 
      ? new Date(now.getTime() + plan.trialPeriodDays * 24 * 60 * 60 * 1000)
      : null;
    
    const billingStart = trialEnd || now;
    const currentPeriodEnd = this.calculateNextBillingDate(billingStart, plan.interval, plan.intervalCount);
    
    // 4. Create subscription
    const subscription: Subscription = {
      id: this.generateSubscriptionId(),
      customerId: request.customerId,
      planId: request.planId,
      status: trialEnd ? SubscriptionStatus.TRIALING : SubscriptionStatus.ACTIVE,
      billingCycle: plan.interval,
      currentPeriodStart: billingStart,
      currentPeriodEnd,
      trialStart: trialEnd ? now : undefined,
      trialEnd,
      cancelAtPeriodEnd: false,
      paymentMethodId: request.paymentMethodId,
      discounts: request.discounts || [],
      addOns: request.addOns || [],
      metadata: request.metadata || {},
      createdAt: now,
      updatedAt: now
    };
    
    // 5. Handle setup fee if applicable
    if (plan.setupFee && plan.setupFee > 0) {
      await this.processSetupFee(subscription, plan.setupFee);
    }
    
    // 6. Schedule first billing (if not in trial)
    if (!trialEnd) {
      await this.scheduleNextBilling(subscription);
    } else {
      await this.scheduleTrialEnd(subscription);
    }
    
    // 7. Save subscription
    await this.subscriptionRepository.save(subscription);
    
    // 8. Send confirmation
    await this.notificationService.sendSubscriptionConfirmation(subscription);
    
    return subscription;
  }
  
  async updateSubscription(subscriptionId: string, updates: UpdateSubscriptionRequest): Promise<Subscription> {
    const subscription = await this.getSubscription(subscriptionId);
    
    // Handle plan changes
    if (updates.planId && updates.planId !== subscription.planId) {
      return await this.changePlan(subscription, updates.planId, updates.prorationBehavior);
    }
    
    // Handle payment method changes
    if (updates.paymentMethodId && updates.paymentMethodId !== subscription.paymentMethodId) {
      await this.changePaymentMethod(subscription, updates.paymentMethodId);
    }
    
    // Handle discount changes
    if (updates.discounts) {
      subscription.discounts = updates.discounts;
    }
    
    // Handle add-on changes
    if (updates.addOns) {
      subscription.addOns = updates.addOns;
    }
    
    subscription.updatedAt = new Date();
    await this.subscriptionRepository.save(subscription);
    
    return subscription;
  }
  
  private calculateNextBillingDate(startDate: Date, interval: BillingCycle, intervalCount: number): Date {
    const date = new Date(startDate);
    
    switch (interval) {
      case BillingCycle.DAILY:
        date.setDate(date.getDate() + intervalCount);
        break;
      case BillingCycle.WEEKLY:
        date.setDate(date.getDate() + (intervalCount * 7));
        break;
      case BillingCycle.MONTHLY:
        date.setMonth(date.getMonth() + intervalCount);
        break;
      case BillingCycle.QUARTERLY:
        date.setMonth(date.getMonth() + (intervalCount * 3));
        break;
      case BillingCycle.SEMI_ANNUALLY:
        date.setMonth(date.getMonth() + (intervalCount * 6));
        break;
      case BillingCycle.ANNUALLY:
        date.setFullYear(date.getFullYear() + intervalCount);
        break;
    }
    
    return date;
  }
}
```

### 3. Plan Changes and Proration

Handle subscription plan changes with proper proration:

```typescript
interface PlanChangeRequest {
  subscriptionId: string;
  newPlanId: string;
  prorationBehavior: ProrationBehavior;
  effectiveDate?: Date;
}

enum ProrationBehavior {
  CREATE_PRORATIONS = 'create_prorations',
  NONE = 'none',
  ALWAYS_INVOICE = 'always_invoice'
}

class PlanChangeManager {
  async changePlan(subscription: Subscription, newPlanId: string, prorationBehavior: ProrationBehavior): Promise<Subscription> {
    const currentPlan = await this.planService.getPlan(subscription.planId);
    const newPlan = await this.planService.getPlan(newPlanId);
    
    if (!newPlan || !newPlan.active) {
      throw new Error('Invalid or inactive plan');
    }
    
    const now = new Date();
    const changeEffectiveDate = now;
    
    // Calculate proration if needed
    let prorationAmount = 0;
    if (prorationBehavior === ProrationBehavior.CREATE_PRORATIONS) {
      prorationAmount = await this.calculateProration(subscription, currentPlan, newPlan, changeEffectiveDate);
    }
    
    // Handle immediate vs end-of-period changes
    const isUpgrade = newPlan.amount > currentPlan.amount;
    const isDowngrade = newPlan.amount < currentPlan.amount;
    
    if (isUpgrade || prorationBehavior === ProrationBehavior.ALWAYS_INVOICE) {
      // Apply change immediately
      await this.applyImmediatePlanChange(subscription, newPlan, prorationAmount);
    } else if (isDowngrade) {
      // Schedule change for end of current period
      await this.schedulePlanChangeAtPeriodEnd(subscription, newPlan);
    }
    
    // Update subscription
    subscription.planId = newPlanId;
    subscription.updatedAt = now;
    
    // Log plan change
    await this.subscriptionEventService.logPlanChange({
      subscriptionId: subscription.id,
      fromPlanId: currentPlan.id,
      toPlanId: newPlan.id,
      prorationAmount,
      effectiveDate: changeEffectiveDate
    });
    
    await this.subscriptionRepository.save(subscription);
    
    // Send notification
    await this.notificationService.sendPlanChangeConfirmation(subscription, currentPlan, newPlan);
    
    return subscription;
  }
  
  private async calculateProration(
    subscription: Subscription,
    currentPlan: SubscriptionPlan,
    newPlan: SubscriptionPlan,
    changeDate: Date
  ): Promise<number> {
    const periodStart = subscription.currentPeriodStart;
    const periodEnd = subscription.currentPeriodEnd;
    const totalPeriodDays = Math.ceil((periodEnd.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24));
    const remainingDays = Math.ceil((periodEnd.getTime() - changeDate.getTime()) / (1000 * 60 * 60 * 24));
    
    // Calculate unused amount from current plan
    const unusedAmount = (currentPlan.amount * remainingDays) / totalPeriodDays;
    
    // Calculate prorated amount for new plan
    const proratedNewAmount = (newPlan.amount * remainingDays) / totalPeriodDays;
    
    // Return the difference (positive for upgrade, negative for downgrade)
    return proratedNewAmount - unusedAmount;
  }
  
  private async applyImmediatePlanChange(
    subscription: Subscription,
    newPlan: SubscriptionPlan,
    prorationAmount: number
  ): Promise<void> {
    if (prorationAmount > 0) {
      // Charge the proration amount immediately
      await this.paymentService.createInvoiceItem({
        customerId: subscription.customerId,
        amount: prorationAmount,
        currency: newPlan.currency,
        description: `Proration for plan change to ${newPlan.name}`,
        subscriptionId: subscription.id
      });
    } else if (prorationAmount < 0) {
      // Create credit for downgrade
      await this.paymentService.createCredit({
        customerId: subscription.customerId,
        amount: Math.abs(prorationAmount),
        currency: newPlan.currency,
        description: `Credit for plan change to ${newPlan.name}`,
        subscriptionId: subscription.id
      });
    }
  }
}
```

### 4. Billing and Invoice Generation

Implement automated billing and invoice generation:

```typescript
interface Invoice {
  id: string;
  subscriptionId: string;
  customerId: string;
  amount: number;
  currency: string;
  status: InvoiceStatus;
  periodStart: Date;
  periodEnd: Date;
  dueDate: Date;
  paidAt?: Date;
  lineItems: InvoiceLineItem[];
  discounts: InvoiceDiscount[];
  taxes: InvoiceTax[];
  subtotal: number;
  total: number;
  attemptCount: number;
  nextPaymentAttempt?: Date;
  createdAt: Date;
}

enum InvoiceStatus {
  DRAFT = 'draft',
  OPEN = 'open',
  PAID = 'paid',
  VOID = 'void',
  UNCOLLECTIBLE = 'uncollectible'
}

class BillingEngine {
  async generateInvoice(subscription: Subscription): Promise<Invoice> {
    const plan = await this.planService.getPlan(subscription.planId);
    const customer = await this.customerService.getCustomer(subscription.customerId);
    
    const invoice: Invoice = {
      id: this.generateInvoiceId(),
      subscriptionId: subscription.id,
      customerId: subscription.customerId,
      amount: 0,
      currency: plan.currency,
      status: InvoiceStatus.DRAFT,
      periodStart: subscription.currentPeriodStart,
      periodEnd: subscription.currentPeriodEnd,
      dueDate: subscription.currentPeriodEnd,
      lineItems: [],
      discounts: [],
      taxes: [],
      subtotal: 0,
      total: 0,
      attemptCount: 0,
      createdAt: new Date()
    };
    
    // Add subscription line item
    invoice.lineItems.push({
      id: this.generateLineItemId(),
      description: `${plan.name} (${this.formatPeriod(subscription.currentPeriodStart, subscription.currentPeriodEnd)})`,
      amount: plan.amount,
      quantity: 1,
      unitPrice: plan.amount,
      type: 'subscription'
    });
    
    // Add usage-based charges
    const usageCharges = await this.calculateUsageCharges(subscription);
    invoice.lineItems.push(...usageCharges);
    
    // Add one-time charges
    const oneTimeCharges = await this.getOneTimeCharges(subscription.id);
    invoice.lineItems.push(...oneTimeCharges);
    
    // Apply discounts
    const discounts = await this.calculateDiscounts(subscription, invoice.lineItems);
    invoice.discounts = discounts;
    
    // Calculate taxes
    const taxes = await this.calculateTaxes(customer, invoice.lineItems, discounts);
    invoice.taxes = taxes;
    
    // Calculate totals
    invoice.subtotal = invoice.lineItems.reduce((sum, item) => sum + item.amount, 0);
    const discountAmount = discounts.reduce((sum, discount) => sum + discount.amount, 0);
    const taxAmount = taxes.reduce((sum, tax) => sum + tax.amount, 0);
    invoice.total = invoice.subtotal - discountAmount + taxAmount;
    invoice.amount = invoice.total;
    
    // Save invoice
    await this.invoiceRepository.save(invoice);
    
    return invoice;
  }
  
  async processRecurringBilling(): Promise<void> {
    // Get all subscriptions due for billing
    const dueSubscriptions = await this.subscriptionRepository.findDueForBilling();
    
    for (const subscription of dueSubscriptions) {
      try {
        await this.processBillingForSubscription(subscription);
      } catch (error) {
        console.error(`Failed to process billing for subscription ${subscription.id}:`, error);
        await this.handleBillingError(subscription, error);
      }
    }
  }
  
  private async processBillingForSubscription(subscription: Subscription): Promise<void> {
    // Generate invoice
    const invoice = await this.generateInvoice(subscription);
    
    // Attempt payment
    const paymentResult = await this.attemptPayment(invoice);
    
    if (paymentResult.success) {
      // Payment successful
      await this.handleSuccessfulPayment(subscription, invoice, paymentResult);
    } else {
      // Payment failed
      await this.handleFailedPayment(subscription, invoice, paymentResult);
    }
  }
  
  private async handleSuccessfulPayment(
    subscription: Subscription,
    invoice: Invoice,
    paymentResult: PaymentResult
  ): Promise<void> {
    // Update invoice status
    invoice.status = InvoiceStatus.PAID;
    invoice.paidAt = new Date();
    await this.invoiceRepository.save(invoice);
    
    // Update subscription for next billing period
    const plan = await this.planService.getPlan(subscription.planId);
    subscription.currentPeriodStart = subscription.currentPeriodEnd;
    subscription.currentPeriodEnd = this.calculateNextBillingDate(
      subscription.currentPeriodEnd,
      plan.interval,
      plan.intervalCount
    );
    subscription.status = SubscriptionStatus.ACTIVE;
    subscription.updatedAt = new Date();
    
    await this.subscriptionRepository.save(subscription);
    
    // Schedule next billing
    await this.scheduleNextBilling(subscription);
    
    // Send receipt
    await this.notificationService.sendPaymentReceipt(subscription, invoice, paymentResult);
  }
  
  private async handleFailedPayment(
    subscription: Subscription,
    invoice: Invoice,
    paymentResult: PaymentResult
  ): Promise<void> {
    // Update invoice
    invoice.attemptCount += 1;
    invoice.status = InvoiceStatus.OPEN;
    
    // Start dunning process
    await this.dunningManager.startDunningProcess(subscription, invoice, paymentResult.error);
    
    // Update subscription status
    subscription.status = SubscriptionStatus.PAST_DUE;
    subscription.updatedAt = new Date();
    
    await this.subscriptionRepository.save(subscription);
    await this.invoiceRepository.save(invoice);
    
    // Send payment failed notification
    await this.notificationService.sendPaymentFailedNotification(subscription, invoice, paymentResult.error);
  }
}
```

### 5. Dunning Management

Implement sophisticated dunning management for failed payments:

```typescript
interface DunningRule {
  id: string;
  name: string;
  attempts: DunningAttempt[];
  finalAction: DunningFinalAction;
  enabled: boolean;
}

interface DunningAttempt {
  dayOffset: number; // Days after initial failure
  notificationType: 'email' | 'sms' | 'both';
  retryPayment: boolean;
  escalationLevel: 'low' | 'medium' | 'high' | 'critical';
}

enum DunningFinalAction {
  CANCEL_SUBSCRIPTION = 'cancel_subscription',
  PAUSE_SUBSCRIPTION = 'pause_subscription',
  MARK_UNCOLLECTIBLE = 'mark_uncollectible',
  SEND_TO_COLLECTIONS = 'send_to_collections'
}

class DunningManager {
  private defaultDunningRule: DunningRule = {
    id: 'default',
    name: 'Default Dunning Rule',
    attempts: [
      { dayOffset: 1, notificationType: 'email', retryPayment: true, escalationLevel: 'low' },
      { dayOffset: 3, notificationType: 'both', retryPayment: true, escalationLevel: 'medium' },
      { dayOffset: 7, notificationType: 'both', retryPayment: true, escalationLevel: 'high' },
      { dayOffset: 14, notificationType: 'both', retryPayment: true, escalationLevel: 'critical' }
    ],
    finalAction: DunningFinalAction.CANCEL_SUBSCRIPTION,
    enabled: true
  };
  
  async startDunningProcess(subscription: Subscription, invoice: Invoice, error: PaymentError): Promise<void> {
    const dunningRule = await this.getDunningRule(subscription) || this.defaultDunningRule;
    
    const dunningProcess = {
      id: this.generateDunningProcessId(),
      subscriptionId: subscription.id,
      invoiceId: invoice.id,
      ruleId: dunningRule.id,
      currentAttempt: 0,
      startedAt: new Date(),
      status: 'active',
      lastError: error
    };
    
    await this.dunningProcessRepository.save(dunningProcess);
    
    // Schedule first dunning attempt
    await this.scheduleDunningAttempt(dunningProcess, dunningRule.attempts[0]);
  }
  
  async processDunningAttempt(processId: string, attemptIndex: number): Promise<void> {
    const process = await this.dunningProcessRepository.findById(processId);
    const rule = await this.getDunningRule(process.subscriptionId);
    const attempt = rule.attempts[attemptIndex];
    
    if (!attempt) {
      // No more attempts, execute final action
      await this.executeFinalAction(process, rule.finalAction);
      return;
    }
    
    const subscription = await this.subscriptionRepository.findById(process.subscriptionId);
    const invoice = await this.invoiceRepository.findById(process.invoiceId);
    
    // Send dunning notification
    await this.sendDunningNotification(subscription, invoice, attempt);
    
    // Retry payment if configured
    if (attempt.retryPayment) {
      const paymentResult = await this.retryPayment(invoice);
      
      if (paymentResult.success) {
        // Payment successful, end dunning process
        await this.endDunningProcess(process, 'payment_successful');
        await this.handleSuccessfulPayment(subscription, invoice, paymentResult);
        return;
      } else {
        // Payment still failed, update process
        process.lastError = paymentResult.error;
      }
    }
    
    // Update process
    process.currentAttempt = attemptIndex;
    process.updatedAt = new Date();
    await this.dunningProcessRepository.save(process);
    
    // Schedule next attempt
    const nextAttemptIndex = attemptIndex + 1;
    if (nextAttemptIndex < rule.attempts.length) {
      await this.scheduleDunningAttempt(process, rule.attempts[nextAttemptIndex]);
    } else {
      // No more attempts, execute final action
      await this.executeFinalAction(process, rule.finalAction);
    }
  }
  
  private async executeFinalAction(process: DunningProcess, action: DunningFinalAction): Promise<void> {
    const subscription = await this.subscriptionRepository.findById(process.subscriptionId);
    const invoice = await this.invoiceRepository.findById(process.invoiceId);
    
    switch (action) {
      case DunningFinalAction.CANCEL_SUBSCRIPTION:
        await this.subscriptionManager.cancelSubscription(subscription.id, {
          reason: 'payment_failed',
          cancelAtPeriodEnd: false
        });
        break;
        
      case DunningFinalAction.PAUSE_SUBSCRIPTION:
        subscription.status = SubscriptionStatus.PAUSED;
        await this.subscriptionRepository.save(subscription);
        break;
        
      case DunningFinalAction.MARK_UNCOLLECTIBLE:
        invoice.status = InvoiceStatus.UNCOLLECTIBLE;
        await this.invoiceRepository.save(invoice);
        break;
        
      case DunningFinalAction.SEND_TO_COLLECTIONS:
        await this.collectionsService.sendToCollections(subscription, invoice);
        break;
    }
    
    // End dunning process
    await this.endDunningProcess(process, `final_action_${action}`);
    
    // Send final notification
    await this.notificationService.sendDunningFinalNotification(subscription, action);
  }
  
  private async sendDunningNotification(
    subscription: Subscription,
    invoice: Invoice,
    attempt: DunningAttempt
  ): Promise<void> {
    const customer = await this.customerService.getCustomer(subscription.customerId);
    
    const notificationData = {
      customer,
      subscription,
      invoice,
      attemptNumber: attempt.dayOffset,
      escalationLevel: attempt.escalationLevel,
      paymentRetryDate: new Date(Date.now() + 24 * 60 * 60 * 1000) // Tomorrow
    };
    
    if (attempt.notificationType === 'email' || attempt.notificationType === 'both') {
      await this.notificationService.sendDunningEmail(notificationData);
    }
    
    if (attempt.notificationType === 'sms' || attempt.notificationType === 'both') {
      await this.notificationService.sendDunningSMS(notificationData);
    }
  }
}
```

### 6. Subscription Analytics and Metrics

Implement comprehensive subscription analytics:

```typescript
interface SubscriptionMetrics {
  mrr: number; // Monthly Recurring Revenue
  arr: number; // Annual Recurring Revenue
  churnRate: number;
  ltv: number; // Customer Lifetime Value
  cac: number; // Customer Acquisition Cost
  activeSubscriptions: number;
  newSubscriptions: number;
  canceledSubscriptions: number;
  upgrades: number;
  downgrades: number;
  reactivations: number;
}

class SubscriptionAnalytics {
  async calculateMRR(date: Date = new Date()): Promise<number> {
    const activeSubscriptions = await this.subscriptionRepository.findActiveSubscriptions(date);
    let mrr = 0;
    
    for (const subscription of activeSubscriptions) {
      const plan = await this.planService.getPlan(subscription.planId);
      const monthlyAmount = this.normalizeToMonthly(plan.amount, plan.interval, plan.intervalCount);
      mrr += monthlyAmount;
    }
    
    return mrr;
  }
  
  async calculateChurnRate(period: 'monthly' | 'annual' = 'monthly'): Promise<number> {
    const endDate = new Date();
    const startDate = new Date();
    
    if (period === 'monthly') {
      startDate.setMonth(startDate.getMonth() - 1);
    } else {
      startDate.setFullYear(startDate.getFullYear() - 1);
    }
    
    const customersAtStart = await this.getActiveCustomerCount(startDate);
    const churnedCustomers = await this.getChurnedCustomerCount(startDate, endDate);
    
    return customersAtStart > 0 ? (churnedCustomers / customersAtStart) * 100 : 0;
  }
  
  async calculateLTV(customerId?: string): Promise<number> {
    let avgMonthlyRevenue: number;
    let avgLifespanMonths: number;
    
    if (customerId) {
      // Calculate for specific customer
      const customer = await this.customerService.getCustomer(customerId);
      const subscriptions = await this.subscriptionRepository.findByCustomerId(customerId);
      
      avgMonthlyRevenue = this.calculateCustomerAvgMonthlyRevenue(subscriptions);
      avgLifespanMonths = this.calculateCustomerLifespan(subscriptions);
    } else {
      // Calculate average across all customers
      avgMonthlyRevenue = await this.calculateAvgMonthlyRevenuePerCustomer();
      avgLifespanMonths = await this.calculateAvgCustomerLifespan();
    }
    
    return avgMonthlyRevenue * avgLifespanMonths;
  }
  
  async generateSubscriptionReport(startDate: Date, endDate: Date): Promise<SubscriptionReport> {
    const [
      mrr,
      arr,
      churnRate,
      ltv,
      activeSubscriptions,
      newSubscriptions,
      canceledSubscriptions,
      upgrades,
      downgrades,
      reactivations
    ] = await Promise.all([
      this.calculateMRR(endDate),
      this.calculateARR(endDate),
      this.calculateChurnRate('monthly'),
      this.calculateLTV(),
      this.getActiveSubscriptionCount(endDate),
      this.getNewSubscriptionCount(startDate, endDate),
      this.getCanceledSubscriptionCount(startDate, endDate),
      this.getUpgradeCount(startDate, endDate),
      this.getDowngradeCount(startDate, endDate),
      this.getReactivationCount(startDate, endDate)
    ]);
    
    return {
      period: { startDate, endDate },
      metrics: {
        mrr,
        arr,
        churnRate,
        ltv,
        cac: 0, // Would need marketing data
        activeSubscriptions,
        newSubscriptions,
        canceledSubscriptions,
        upgrades,
        downgrades,
        reactivations
      },
      trends: await this.calculateTrends(startDate, endDate),
      cohortAnalysis: await this.generateCohortAnalysis(startDate, endDate)
    };
  }
  
  private normalizeToMonthly(amount: number, interval: BillingCycle, intervalCount: number): number {
    switch (interval) {
      case BillingCycle.DAILY:
        return (amount / intervalCount) * 30;
      case BillingCycle.WEEKLY:
        return (amount / intervalCount) * 4.33;
      case BillingCycle.MONTHLY:
        return amount / intervalCount;
      case BillingCycle.QUARTERLY:
        return (amount / intervalCount) / 3;
      case BillingCycle.SEMI_ANNUALLY:
        return (amount / intervalCount) / 6;
      case BillingCycle.ANNUALLY:
        return (amount / intervalCount) / 12;
      default:
        return amount; // Assume monthly for custom intervals
    }
  }
}
```

## Implementation Checklist

### Subscription Management
- [ ] Implement subscription data model
- [ ] Create subscription creation workflow
- [ ] Build subscription update and modification system
- [ ] Implement subscription cancellation handling
- [ ] Set up subscription status management

### Billing and Invoicing
- [ ] Build automated billing engine
- [ ] Implement invoice generation
- [ ] Create payment processing for subscriptions
- [ ] Set up proration calculations
- [ ] Implement usage-based billing (if needed)

### Plan Management
- [ ] Create subscription plan management
- [ ] Implement plan change workflows
- [ ] Build proration handling for plan changes
- [ ] Set up plan feature and limit management
- [ ] Create plan pricing and discount system

### Dunning Management
- [ ] Implement failed payment handling
- [ ] Create dunning rule engine
- [ ] Build retry payment mechanisms
- [ ] Set up escalation workflows
- [ ] Implement final action handling

### Analytics and Reporting
- [ ] Build subscription metrics calculation
- [ ] Implement MRR/ARR tracking
- [ ] Create churn rate analysis
- [ ] Build LTV calculations
- [ ] Set up subscription reporting dashboard

## Configuration Parameters

```yaml
subscription_settings:
  default_trial_days: 14
  grace_period_days: 3
  max_retry_attempts: 4
  proration_behavior: "create_prorations"
  
billing_settings:
  invoice_due_days: 0
  late_fee_enabled: false
  late_fee_amount: 25.00
  currency: "USD"
  
dunning_settings:
  enabled: true
  max_attempts: 4
  retry_schedule: [1, 3, 7, 14] # Days after failure
  final_action: "cancel_subscription"
  
notification_settings:
  trial_ending_days: [7, 3, 1]
  payment_failed_immediate: true
  subscription_changes: true
  invoice_reminders: true
```

## Integration Points

- **Payment Processing**: Core payment processing for subscriptions
- **Customer Management**: Customer subscription history and preferences
- **Product Catalog**: Subscription plans and pricing
- **Notification System**: Subscription lifecycle notifications
- **Analytics**: Subscription performance and revenue tracking
- **Tax Calculation**: Tax handling for subscription billing

## Success Metrics

- Subscription retention rate: >90%
- Payment success rate: >95%
- Dunning recovery rate: >30%
- MRR growth rate: >10% monthly
- Customer lifetime value: Increasing trend
- Churn rate: <5% monthly

## Common Pitfalls to Avoid

1. **Poor proration handling**: Implement accurate proration calculations
2. **Inadequate dunning management**: Create comprehensive failed payment recovery
3. **Missing subscription lifecycle events**: Track all subscription state changes
4. **Inflexible plan changes**: Allow easy upgrades and downgrades
5. **Poor billing communication**: Send clear invoices and notifications
6. **Missing analytics**: Track key subscription metrics and trends
7. **Inadequate testing**: Test all subscription scenarios thoroughly

## Related Templates

- `payment-processing.md` - Core payment processing integration
- `payment-security.md` - Payment security for subscriptions
- `customer-management.md` - Customer subscription management
- `notification-system.md` - Subscription lifecycle notifications
- `analytics-dashboard.md` - Subscription analytics and reporting