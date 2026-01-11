# Enterprise Billing and Subscription Management Template

## Purpose

This template provides comprehensive patterns for implementing enterprise-grade billing and subscription management systems in B2B SaaS applications. It covers complex subscription models, usage-based billing, enterprise invoicing, revenue recognition, tax compliance, and integration with accounting systems while supporting multi-tenant architectures and enterprise sales processes.

## Context

Enterprise billing systems require sophisticated features beyond simple subscription management, including complex pricing models, usage tracking, enterprise contracts, multi-entity billing, compliance with accounting standards, and integration with enterprise procurement systems. This template addresses the complexities of B2B billing cycles, enterprise sales processes, and regulatory requirements.

## Core Components

### Subscription Management System

```typescript
interface SubscriptionManager {
  createSubscription(subscriptionData: SubscriptionCreationRequest): Promise<Subscription>;
  updateSubscription(subscriptionId: string, updates: SubscriptionUpdateRequest): Promise<Subscription>;
  cancelSubscription(subscriptionId: string, cancellationData: CancellationRequest): Promise<void>;
  pauseSubscription(subscriptionId: string, pauseData: PauseRequest): Promise<void>;
  resumeSubscription(subscriptionId: string): Promise<void>;
  getSubscriptions(tenantId: string, filters?: SubscriptionFilters): Promise<Subscription[]>;
  processRenewal(subscriptionId: string): Promise<RenewalResult>;
}

interface Subscription {
  id: string;
  tenantId: string;
  customerId: string;
  planId: string;
  status: SubscriptionStatus;
  billingCycle: BillingCycle;
  pricing: SubscriptionPricing;
  usage: UsageTracking;
  contract: ContractDetails;
  billing: BillingConfiguration;
  addOns: AddOnSubscription[];
  discounts: DiscountApplication[];
  metadata: SubscriptionMetadata;
  createdAt: Date;
  updatedAt: Date;
  nextBillingDate: Date;
  contractEndDate?: Date;
}

enum SubscriptionStatus {
  ACTIVE = 'active',
  PAUSED = 'paused',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
  PENDING = 'pending',
  TRIAL = 'trial',
  PAST_DUE = 'past_due'
}

enum BillingCycle {
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  ANNUALLY = 'annually',
  CUSTOM = 'custom'
}

interface SubscriptionPricing {
  basePrice: number;
  currency: string;
  pricingModel: PricingModel;
  tiers: PricingTier[];
  usageCharges: UsageCharge[];
  minimumCommitment?: number;
  maximumSpend?: number;
}

enum PricingModel {
  FLAT_RATE = 'flat_rate',
  PER_SEAT = 'per_seat',
  USAGE_BASED = 'usage_based',
  TIERED = 'tiered',
  VOLUME = 'volume',
  HYBRID = 'hybrid'
}
```

### Usage-Based Billing Engine

```typescript
interface UsageBillingEngine {
  trackUsage(tenantId: string, usageData: UsageEvent): Promise<void>;
  calculateUsageCharges(subscriptionId: string, period: BillingPeriod): Promise<UsageCharges>;
  getUsageMetrics(subscriptionId: string, period: BillingPeriod): Promise<UsageMetrics>;
  setUsageLimits(subscriptionId: string, limits: UsageLimits): Promise<void>;
  generateUsageReport(subscriptionId: string, period: BillingPeriod): Promise<UsageReport>;
  processOverageCharges(subscriptionId: string, overages: OverageData[]): Promise<void>;
}

interface UsageEvent {
  tenantId: string;
  subscriptionId: string;
  metricName: string;
  value: number;
  timestamp: Date;
  metadata: UsageMetadata;
  aggregationKey?: string;
}

interface UsageMetrics {
  subscriptionId: string;
  period: BillingPeriod;
  metrics: MetricUsage[];
  totalCharges: number;
  currency: string;
  overages: OverageCharge[];
}

interface MetricUsage {
  metricName: string;
  totalUsage: number;
  includedUsage: number;
  overageUsage: number;
  unitPrice: number;
  totalCharge: number;
  tier?: UsageTier;
}

class EnterpriseUsageBillingEngine implements UsageBillingEngine {
  async trackUsage(tenantId: string, usageData: UsageEvent): Promise<void> {
    // Validate usage event
    await this.validateUsageEvent(usageData);
    
    // Store raw usage data
    await this.usageStorage.store(usageData);
    
    // Update real-time aggregations
    await this.updateUsageAggregations(usageData);
    
    // Check usage limits and send alerts if needed
    const limits = await this.getUsageLimits(usageData.subscriptionId);
    if (limits) {
      await this.checkUsageLimits(usageData, limits);
    }
    
    // Update usage cache for real-time billing
    await this.updateUsageCache(usageData);
    
    // Trigger usage-based alerts or workflows
    await this.processUsageTriggers(usageData);
  }

  async calculateUsageCharges(subscriptionId: string, period: BillingPeriod): Promise<UsageCharges> {
    const subscription = await this.subscriptionManager.getSubscription(subscriptionId);
    const usageData = await this.getUsageForPeriod(subscriptionId, period);
    
    const charges: UsageCharges = {
      subscriptionId,
      period,
      charges: [],
      totalAmount: 0,
      currency: subscription.pricing.currency
    };
    
    // Calculate charges for each usage metric
    for (const usageCharge of subscription.pricing.usageCharges) {
      const metricUsage = usageData.find(u => u.metricName === usageCharge.metricName);
      if (!metricUsage) continue;
      
      const charge = await this.calculateMetricCharge(usageCharge, metricUsage);
      charges.charges.push(charge);
      charges.totalAmount += charge.amount;
    }
    
    // Apply usage-based discounts
    const discounts = await this.calculateUsageDiscounts(subscription, charges);
    charges.discounts = discounts;
    charges.totalAmount -= discounts.reduce((sum, d) => sum + d.amount, 0);
    
    return charges;
  }

  private async calculateMetricCharge(usageCharge: UsageCharge, metricUsage: UsageData): Promise<MetricCharge> {
    switch (usageCharge.pricingModel) {
      case UsagePricingModel.PER_UNIT:
        return this.calculatePerUnitCharge(usageCharge, metricUsage);
      
      case UsagePricingModel.TIERED:
        return this.calculateTieredCharge(usageCharge, metricUsage);
      
      case UsagePricingModel.VOLUME:
        return this.calculateVolumeCharge(usageCharge, metricUsage);
      
      case UsagePricingModel.PACKAGE:
        return this.calculatePackageCharge(usageCharge, metricUsage);
      
      default:
        throw new UnsupportedPricingModelError(`Pricing model ${usageCharge.pricingModel} not supported`);
    }
  }
}
```

### Enterprise Invoicing System

```typescript
interface EnterpriseInvoicingSystem {
  generateInvoice(subscriptionId: string, period: BillingPeriod): Promise<Invoice>;
  sendInvoice(invoiceId: string, deliveryOptions: InvoiceDeliveryOptions): Promise<void>;
  processPayment(invoiceId: string, paymentData: PaymentData): Promise<PaymentResult>;
  handlePaymentFailure(invoiceId: string, failureData: PaymentFailureData): Promise<void>;
  generateCreditNote(invoiceId: string, creditData: CreditNoteData): Promise<CreditNote>;
  reconcilePayments(tenantId: string, period: BillingPeriod): Promise<ReconciliationReport>;
}

interface Invoice {
  id: string;
  tenantId: string;
  subscriptionId: string;
  invoiceNumber: string;
  status: InvoiceStatus;
  type: InvoiceType;
  billingPeriod: BillingPeriod;
  lineItems: InvoiceLineItem[];
  subtotal: number;
  taxes: TaxCalculation[];
  discounts: InvoiceDiscount[];
  total: number;
  currency: string;
  dueDate: Date;
  paymentTerms: PaymentTerms;
  billingAddress: Address;
  shippingAddress?: Address;
  purchaseOrder?: string;
  metadata: InvoiceMetadata;
  createdAt: Date;
  sentAt?: Date;
  paidAt?: Date;
}

enum InvoiceStatus {
  DRAFT = 'draft',
  SENT = 'sent',
  VIEWED = 'viewed',
  PAID = 'paid',
  PARTIALLY_PAID = 'partially_paid',
  OVERDUE = 'overdue',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded'
}

enum InvoiceType {
  SUBSCRIPTION = 'subscription',
  USAGE = 'usage',
  ONE_TIME = 'one_time',
  SETUP = 'setup',
  CREDIT_NOTE = 'credit_note',
  PRORATED = 'prorated'
}

interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  taxable: boolean;
  taxRate?: number;
  period?: BillingPeriod;
  metadata: LineItemMetadata;
}

class EnterpriseInvoiceGenerator implements EnterpriseInvoicingSystem {
  async generateInvoice(subscriptionId: string, period: BillingPeriod): Promise<Invoice> {
    const subscription = await this.subscriptionManager.getSubscription(subscriptionId);
    const tenant = await this.tenantManager.getTenant(subscription.tenantId);
    
    // Calculate subscription charges
    const subscriptionCharges = await this.calculateSubscriptionCharges(subscription, period);
    
    // Calculate usage charges
    const usageCharges = await this.usageBillingEngine.calculateUsageCharges(subscriptionId, period);
    
    // Calculate one-time charges
    const oneTimeCharges = await this.calculateOneTimeCharges(subscriptionId, period);
    
    // Create line items
    const lineItems: InvoiceLineItem[] = [];
    
    // Add subscription line items
    lineItems.push(...this.createSubscriptionLineItems(subscriptionCharges));
    
    // Add usage line items
    lineItems.push(...this.createUsageLineItems(usageCharges));
    
    // Add one-time line items
    lineItems.push(...this.createOneTimeLineItems(oneTimeCharges));
    
    // Calculate subtotal
    const subtotal = lineItems.reduce((sum, item) => sum + item.amount, 0);
    
    // Apply discounts
    const discounts = await this.calculateInvoiceDiscounts(subscription, lineItems);
    const discountAmount = discounts.reduce((sum, d) => sum + d.amount, 0);
    
    // Calculate taxes
    const taxes = await this.calculateTaxes(subscription, lineItems, subtotal - discountAmount);
    const taxAmount = taxes.reduce((sum, t) => sum + t.amount, 0);
    
    // Create invoice
    const invoice: Invoice = {
      id: this.generateInvoiceId(),
      tenantId: subscription.tenantId,
      subscriptionId,
      invoiceNumber: await this.generateInvoiceNumber(subscription.tenantId),
      status: InvoiceStatus.DRAFT,
      type: InvoiceType.SUBSCRIPTION,
      billingPeriod: period,
      lineItems,
      subtotal,
      taxes,
      discounts,
      total: subtotal - discountAmount + taxAmount,
      currency: subscription.pricing.currency,
      dueDate: this.calculateDueDate(subscription.billing.paymentTerms),
      paymentTerms: subscription.billing.paymentTerms,
      billingAddress: tenant.billingAddress,
      shippingAddress: tenant.shippingAddress,
      purchaseOrder: subscription.contract.purchaseOrder,
      metadata: {
        generatedBy: 'system',
        generationReason: 'scheduled_billing',
        contractId: subscription.contract.id
      },
      createdAt: new Date()
    };
    
    // Store invoice
    await this.invoiceRepository.create(invoice);
    
    // Generate invoice PDF
    await this.generateInvoicePDF(invoice);
    
    // Trigger invoice generation events
    await this.eventBus.publish('invoice.generated', {
      invoiceId: invoice.id,
      tenantId: invoice.tenantId,
      amount: invoice.total
    });
    
    return invoice;
  }

  async sendInvoice(invoiceId: string, deliveryOptions: InvoiceDeliveryOptions): Promise<void> {
    const invoice = await this.invoiceRepository.findById(invoiceId);
    if (!invoice) {
      throw new InvoiceNotFoundError(`Invoice ${invoiceId} not found`);
    }
    
    // Update invoice status
    invoice.status = InvoiceStatus.SENT;
    invoice.sentAt = new Date();
    await this.invoiceRepository.update(invoice);
    
    // Send via email
    if (deliveryOptions.email) {
      await this.emailService.sendInvoice({
        to: deliveryOptions.email.recipients,
        cc: deliveryOptions.email.cc,
        bcc: deliveryOptions.email.bcc,
        subject: `Invoice ${invoice.invoiceNumber} from ${this.companyName}`,
        template: 'enterprise_invoice',
        attachments: [
          {
            filename: `invoice-${invoice.invoiceNumber}.pdf`,
            content: await this.getInvoicePDF(invoice.id)
          }
        ],
        data: {
          invoice,
          paymentUrl: this.generatePaymentUrl(invoice.id),
          portalUrl: this.generatePortalUrl(invoice.tenantId)
        }
      });
    }
    
    // Send via API webhook
    if (deliveryOptions.webhook) {
      await this.webhookService.sendInvoiceWebhook(invoice, deliveryOptions.webhook);
    }
    
    // Send to accounting system
    if (deliveryOptions.accountingIntegration) {
      await this.accountingIntegration.syncInvoice(invoice);
    }
    
    // Log delivery
    await this.auditService.logInvoiceDelivery(invoice.id, deliveryOptions);
  }
}
```

### Revenue Recognition Engine

```typescript
interface RevenueRecognitionEngine {
  recognizeRevenue(invoiceId: string): Promise<RevenueRecognition>;
  calculateDeferredRevenue(subscriptionId: string): Promise<DeferredRevenue>;
  processRevenueSchedule(tenantId: string, period: BillingPeriod): Promise<RevenueScheduleResult>;
  generateRevenueReport(tenantId: string, period: ReportingPeriod): Promise<RevenueReport>;
  handleRevenueAdjustments(adjustments: RevenueAdjustment[]): Promise<void>;
}

interface RevenueRecognition {
  invoiceId: string;
  totalAmount: number;
  recognizedAmount: number;
  deferredAmount: number;
  recognitionSchedule: RevenueScheduleEntry[];
  recognitionMethod: RevenueRecognitionMethod;
  contractStartDate: Date;
  contractEndDate: Date;
}

enum RevenueRecognitionMethod {
  IMMEDIATE = 'immediate',
  STRAIGHT_LINE = 'straight_line',
  USAGE_BASED = 'usage_based',
  MILESTONE_BASED = 'milestone_based',
  PERCENTAGE_COMPLETION = 'percentage_completion'
}

interface RevenueScheduleEntry {
  id: string;
  invoiceId: string;
  amount: number;
  recognitionDate: Date;
  period: BillingPeriod;
  status: RevenueStatus;
  journalEntryId?: string;
}

class ASC606RevenueEngine implements RevenueRecognitionEngine {
  async recognizeRevenue(invoiceId: string): Promise<RevenueRecognition> {
    const invoice = await this.invoiceRepository.findById(invoiceId);
    const subscription = await this.subscriptionManager.getSubscription(invoice.subscriptionId);
    
    // Determine recognition method based on contract terms
    const recognitionMethod = this.determineRecognitionMethod(subscription.contract);
    
    // Calculate recognition schedule
    const schedule = await this.calculateRecognitionSchedule(
      invoice,
      subscription,
      recognitionMethod
    );
    
    // Calculate amounts
    const totalAmount = invoice.total;
    const recognizedAmount = schedule
      .filter(entry => entry.recognitionDate <= new Date())
      .reduce((sum, entry) => sum + entry.amount, 0);
    const deferredAmount = totalAmount - recognizedAmount;
    
    const recognition: RevenueRecognition = {
      invoiceId,
      totalAmount,
      recognizedAmount,
      deferredAmount,
      recognitionSchedule: schedule,
      recognitionMethod,
      contractStartDate: subscription.contract.startDate,
      contractEndDate: subscription.contract.endDate
    };
    
    // Store recognition data
    await this.revenueRepository.storeRecognition(recognition);
    
    // Create journal entries for recognized revenue
    await this.createRevenueJournalEntries(recognition);
    
    return recognition;
  }

  private async calculateRecognitionSchedule(
    invoice: Invoice,
    subscription: Subscription,
    method: RevenueRecognitionMethod
  ): Promise<RevenueScheduleEntry[]> {
    switch (method) {
      case RevenueRecognitionMethod.STRAIGHT_LINE:
        return this.calculateStraightLineSchedule(invoice, subscription);
      
      case RevenueRecognitionMethod.USAGE_BASED:
        return this.calculateUsageBasedSchedule(invoice, subscription);
      
      case RevenueRecognitionMethod.IMMEDIATE:
        return this.calculateImmediateSchedule(invoice);
      
      default:
        throw new UnsupportedRecognitionMethodError(`Method ${method} not supported`);
    }
  }

  private async calculateStraightLineSchedule(
    invoice: Invoice,
    subscription: Subscription
  ): Promise<RevenueScheduleEntry[]> {
    const schedule: RevenueScheduleEntry[] = [];
    const contractDuration = this.calculateContractDuration(subscription.contract);
    const monthlyAmount = invoice.total / contractDuration;
    
    let currentDate = new Date(subscription.contract.startDate);
    const endDate = new Date(subscription.contract.endDate);
    
    while (currentDate <= endDate) {
      schedule.push({
        id: this.generateScheduleEntryId(),
        invoiceId: invoice.id,
        amount: monthlyAmount,
        recognitionDate: new Date(currentDate),
        period: {
          startDate: new Date(currentDate),
          endDate: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
        },
        status: currentDate <= new Date() ? RevenueStatus.RECOGNIZED : RevenueStatus.DEFERRED
      });
      
      currentDate.setMonth(currentDate.getMonth() + 1);
    }
    
    return schedule;
  }
}
```

### Tax Calculation Engine

```typescript
interface TaxCalculationEngine {
  calculateTaxes(invoice: Invoice): Promise<TaxCalculation[]>;
  validateTaxExemption(tenantId: string, exemptionData: TaxExemptionData): Promise<boolean>;
  getTaxRates(address: Address, productTypes: string[]): Promise<TaxRate[]>;
  generateTaxReport(tenantId: string, period: ReportingPeriod): Promise<TaxReport>;
  handleTaxRemittance(tenantId: string, period: ReportingPeriod): Promise<TaxRemittanceResult>;
}

interface TaxCalculation {
  id: string;
  invoiceId: string;
  taxType: TaxType;
  taxRate: number;
  taxableAmount: number;
  taxAmount: number;
  jurisdiction: TaxJurisdiction;
  exemptionApplied: boolean;
  exemptionReason?: string;
}

enum TaxType {
  SALES_TAX = 'sales_tax',
  VAT = 'vat',
  GST = 'gst',
  USE_TAX = 'use_tax',
  WITHHOLDING_TAX = 'withholding_tax'
}

class EnterpriseTaxEngine implements TaxCalculationEngine {
  async calculateTaxes(invoice: Invoice): Promise<TaxCalculation[]> {
    const tenant = await this.tenantManager.getTenant(invoice.tenantId);
    const taxCalculations: TaxCalculation[] = [];
    
    // Check for tax exemptions
    const exemptions = await this.getTaxExemptions(invoice.tenantId);
    
    // Get applicable tax rates
    const taxRates = await this.getTaxRates(
      invoice.billingAddress,
      invoice.lineItems.map(item => item.metadata.productType)
    );
    
    // Calculate taxes for each jurisdiction
    for (const taxRate of taxRates) {
      const exemption = exemptions.find(e => 
        e.jurisdiction === taxRate.jurisdiction && 
        e.taxType === taxRate.taxType
      );
      
      if (exemption && exemption.isValid) {
        // Apply exemption
        taxCalculations.push({
          id: this.generateTaxCalculationId(),
          invoiceId: invoice.id,
          taxType: taxRate.taxType,
          taxRate: taxRate.rate,
          taxableAmount: this.calculateTaxableAmount(invoice.lineItems, taxRate),
          taxAmount: 0,
          jurisdiction: taxRate.jurisdiction,
          exemptionApplied: true,
          exemptionReason: exemption.reason
        });
      } else {
        // Calculate tax
        const taxableAmount = this.calculateTaxableAmount(invoice.lineItems, taxRate);
        const taxAmount = taxableAmount * (taxRate.rate / 100);
        
        taxCalculations.push({
          id: this.generateTaxCalculationId(),
          invoiceId: invoice.id,
          taxType: taxRate.taxType,
          taxRate: taxRate.rate,
          taxableAmount,
          taxAmount,
          jurisdiction: taxRate.jurisdiction,
          exemptionApplied: false
        });
      }
    }
    
    return taxCalculations;
  }

  private calculateTaxableAmount(lineItems: InvoiceLineItem[], taxRate: TaxRate): number {
    return lineItems
      .filter(item => item.taxable && this.isApplicableForTaxRate(item, taxRate))
      .reduce((sum, item) => sum + item.amount, 0);
  }
}
```

## Implementation Patterns

### Subscription Lifecycle Management

```typescript
class SubscriptionLifecycleManager {
  async handleSubscriptionUpgrade(subscriptionId: string, newPlanId: string, upgradeDate?: Date): Promise<UpgradeResult> {
    const subscription = await this.subscriptionManager.getSubscription(subscriptionId);
    const newPlan = await this.planManager.getPlan(newPlanId);
    const effectiveDate = upgradeDate || new Date();
    
    // Calculate prorated charges
    const proratedCharges = await this.calculateProratedCharges(
      subscription,
      newPlan,
      effectiveDate
    );
    
    // Create upgrade invoice if there are charges
    let upgradeInvoice: Invoice | null = null;
    if (proratedCharges.amount > 0) {
      upgradeInvoice = await this.invoicingSystem.generateUpgradeInvoice(
        subscription,
        proratedCharges
      );
    }
    
    // Update subscription
    const updatedSubscription = await this.subscriptionManager.updateSubscription(subscriptionId, {
      planId: newPlanId,
      pricing: newPlan.pricing,
      upgradeDate: effectiveDate,
      previousPlanId: subscription.planId
    });
    
    // Handle usage limits and features
    await this.updateUsageLimits(subscriptionId, newPlan.limits);
    await this.updateFeatureAccess(subscription.tenantId, newPlan.features);
    
    // Notify relevant systems
    await this.eventBus.publish('subscription.upgraded', {
      subscriptionId,
      tenantId: subscription.tenantId,
      oldPlanId: subscription.planId,
      newPlanId,
      effectiveDate,
      proratedAmount: proratedCharges.amount
    });
    
    return {
      subscription: updatedSubscription,
      proratedCharges,
      upgradeInvoice,
      effectiveDate
    };
  }

  async handleSubscriptionDowngrade(subscriptionId: string, newPlanId: string, downgradeDate?: Date): Promise<DowngradeResult> {
    const subscription = await this.subscriptionManager.getSubscription(subscriptionId);
    const newPlan = await this.planManager.getPlan(newPlanId);
    const effectiveDate = downgradeDate || this.getNextBillingDate(subscription);
    
    // Calculate credits for unused service
    const credits = await this.calculateDowngradeCredits(
      subscription,
      newPlan,
      effectiveDate
    );
    
    // Create credit note if applicable
    let creditNote: CreditNote | null = null;
    if (credits.amount > 0) {
      creditNote = await this.invoicingSystem.generateCreditNote(
        subscription,
        credits
      );
    }
    
    // Schedule downgrade for next billing cycle
    await this.scheduleSubscriptionChange(subscriptionId, {
      newPlanId,
      effectiveDate,
      changeType: 'downgrade'
    });
    
    // Notify about upcoming changes
    await this.notificationService.sendDowngradeNotification(subscription, {
      newPlan,
      effectiveDate,
      credits
    });
    
    return {
      scheduledChange: true,
      effectiveDate,
      credits,
      creditNote
    };
  }
}
```

### Enterprise Contract Management

```typescript
interface EnterpriseContractManager {
  createContract(contractData: ContractCreationRequest): Promise<Contract>;
  negotiateTerms(contractId: string, proposedTerms: ContractTerms): Promise<NegotiationResult>;
  approveContract(contractId: string, approvalData: ContractApproval): Promise<void>;
  renewContract(contractId: string, renewalTerms: RenewalTerms): Promise<Contract>;
  amendContract(contractId: string, amendments: ContractAmendment[]): Promise<Contract>;
  terminateContract(contractId: string, terminationData: ContractTermination): Promise<void>;
}

interface Contract {
  id: string;
  tenantId: string;
  contractNumber: string;
  type: ContractType;
  status: ContractStatus;
  terms: ContractTerms;
  pricing: ContractPricing;
  commitments: ContractCommitment[];
  milestones: ContractMilestone[];
  sla: ServiceLevelAgreement;
  renewalTerms: RenewalTerms;
  terminationClauses: TerminationClause[];
  signatures: ContractSignature[];
  documents: ContractDocument[];
  metadata: ContractMetadata;
  startDate: Date;
  endDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

enum ContractType {
  SUBSCRIPTION = 'subscription',
  ENTERPRISE_LICENSE = 'enterprise_license',
  PROFESSIONAL_SERVICES = 'professional_services',
  HYBRID = 'hybrid',
  CUSTOM = 'custom'
}

interface ContractCommitment {
  id: string;
  type: CommitmentType;
  amount: number;
  currency: string;
  period: CommitmentPeriod;
  penalties: CommitmentPenalty[];
  trackingMetrics: string[];
}

enum CommitmentType {
  MINIMUM_SPEND = 'minimum_spend',
  MINIMUM_USAGE = 'minimum_usage',
  SEAT_COUNT = 'seat_count',
  VOLUME_COMMITMENT = 'volume_commitment'
}

class EnterpriseContractService implements EnterpriseContractManager {
  async createContract(contractData: ContractCreationRequest): Promise<Contract> {
    // Validate contract data
    await this.validateContractData(contractData);
    
    // Generate contract number
    const contractNumber = await this.generateContractNumber(contractData.tenantId);
    
    // Create contract
    const contract: Contract = {
      id: this.generateContractId(),
      tenantId: contractData.tenantId,
      contractNumber,
      type: contractData.type,
      status: ContractStatus.DRAFT,
      terms: contractData.terms,
      pricing: contractData.pricing,
      commitments: contractData.commitments || [],
      milestones: contractData.milestones || [],
      sla: contractData.sla,
      renewalTerms: contractData.renewalTerms,
      terminationClauses: contractData.terminationClauses || [],
      signatures: [],
      documents: [],
      metadata: contractData.metadata || {},
      startDate: contractData.startDate,
      endDate: contractData.endDate,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Store contract
    await this.contractRepository.create(contract);
    
    // Generate contract documents
    await this.generateContractDocuments(contract);
    
    // Start approval workflow
    await this.approvalWorkflowService.startContractApproval(contract);
    
    return contract;
  }

  async trackCommitments(contractId: string): Promise<CommitmentTrackingResult> {
    const contract = await this.contractRepository.findById(contractId);
    const trackingResults: CommitmentTrackingResult = {
      contractId,
      period: this.getCurrentCommitmentPeriod(contract),
      commitments: []
    };
    
    for (const commitment of contract.commitments) {
      const tracking = await this.trackCommitment(contract, commitment);
      trackingResults.commitments.push(tracking);
      
      // Check for commitment violations
      if (tracking.isViolated) {
        await this.handleCommitmentViolation(contract, commitment, tracking);
      }
    }
    
    return trackingResults;
  }
}
```

## Integration Points

### Accounting System Integration

```typescript
interface AccountingSystemIntegration {
  syncInvoices(tenantId: string, period: BillingPeriod): Promise<SyncResult>;
  syncPayments(tenantId: string, period: BillingPeriod): Promise<SyncResult>;
  syncRevenueRecognition(tenantId: string, period: BillingPeriod): Promise<SyncResult>;
  createJournalEntries(entries: JournalEntry[]): Promise<void>;
  reconcileAccounts(tenantId: string, accountIds: string[]): Promise<ReconciliationResult>;
}

class QuickBooksIntegration implements AccountingSystemIntegration {
  async syncInvoices(tenantId: string, period: BillingPeriod): Promise<SyncResult> {
    const invoices = await this.invoiceRepository.findByTenantAndPeriod(tenantId, period);
    const syncResult: SyncResult = {
      processed: 0,
      succeeded: 0,
      failed: 0,
      errors: []
    };
    
    for (const invoice of invoices) {
      try {
        // Check if invoice already exists in QuickBooks
        const existingInvoice = await this.quickBooksClient.findInvoice(invoice.invoiceNumber);
        
        if (existingInvoice) {
          // Update existing invoice
          await this.quickBooksClient.updateInvoice(existingInvoice.id, {
            status: this.mapInvoiceStatus(invoice.status),
            amount: invoice.total,
            dueDate: invoice.dueDate,
            paidDate: invoice.paidAt
          });
        } else {
          // Create new invoice
          await this.quickBooksClient.createInvoice({
            invoiceNumber: invoice.invoiceNumber,
            customerId: await this.getQuickBooksCustomerId(invoice.tenantId),
            lineItems: invoice.lineItems.map(item => ({
              description: item.description,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              amount: item.amount
            })),
            subtotal: invoice.subtotal,
            taxAmount: invoice.taxes.reduce((sum, tax) => sum + tax.amount, 0),
            total: invoice.total,
            dueDate: invoice.dueDate,
            terms: invoice.paymentTerms.description
          });
        }
        
        syncResult.succeeded++;
      } catch (error) {
        syncResult.failed++;
        syncResult.errors.push({
          invoiceId: invoice.id,
          error: error.message
        });
      }
      
      syncResult.processed++;
    }
    
    return syncResult;
  }
}
```

### Payment Gateway Integration

```typescript
interface PaymentGatewayIntegration {
  processPayment(paymentData: PaymentRequest): Promise<PaymentResult>;
  setupRecurringPayment(subscriptionId: string, paymentMethod: PaymentMethod): Promise<RecurringPaymentSetup>;
  handleWebhook(webhookData: WebhookData): Promise<void>;
  refundPayment(paymentId: string, refundAmount?: number): Promise<RefundResult>;
  updatePaymentMethod(subscriptionId: string, newPaymentMethod: PaymentMethod): Promise<void>;
}

class StripeEnterpriseIntegration implements PaymentGatewayIntegration {
  async processPayment(paymentData: PaymentRequest): Promise<PaymentResult> {
    try {
      // Create payment intent
      const paymentIntent = await this.stripeClient.paymentIntents.create({
        amount: Math.round(paymentData.amount * 100), // Convert to cents
        currency: paymentData.currency.toLowerCase(),
        customer: paymentData.customerId,
        payment_method: paymentData.paymentMethodId,
        confirmation_method: 'manual',
        confirm: true,
        metadata: {
          invoiceId: paymentData.invoiceId,
          tenantId: paymentData.tenantId,
          subscriptionId: paymentData.subscriptionId
        }
      });
      
      // Handle payment result
      if (paymentIntent.status === 'succeeded') {
        // Payment successful
        await this.handleSuccessfulPayment(paymentData, paymentIntent);
        
        return {
          success: true,
          paymentId: paymentIntent.id,
          amount: paymentData.amount,
          currency: paymentData.currency,
          status: 'completed',
          transactionId: paymentIntent.id
        };
      } else if (paymentIntent.status === 'requires_action') {
        // 3D Secure or other authentication required
        return {
          success: false,
          requiresAction: true,
          clientSecret: paymentIntent.client_secret,
          status: 'requires_action'
        };
      } else {
        // Payment failed
        return {
          success: false,
          error: 'Payment failed',
          status: paymentIntent.status
        };
      }
    } catch (error) {
      // Handle Stripe errors
      if (error.type === 'StripeCardError') {
        return {
          success: false,
          error: error.message,
          errorCode: error.code,
          status: 'failed'
        };
      }
      
      throw error;
    }
  }

  async handleWebhook(webhookData: WebhookData): Promise<void> {
    // Verify webhook signature
    const signature = webhookData.headers['stripe-signature'];
    const event = this.stripeClient.webhooks.constructEvent(
      webhookData.body,
      signature,
      this.webhookSecret
    );
    
    switch (event.type) {
      case 'invoice.payment_succeeded':
        await this.handleInvoicePaymentSucceeded(event.data.object);
        break;
      
      case 'invoice.payment_failed':
        await this.handleInvoicePaymentFailed(event.data.object);
        break;
      
      case 'customer.subscription.updated':
        await this.handleSubscriptionUpdated(event.data.object);
        break;
      
      case 'customer.subscription.deleted':
        await this.handleSubscriptionDeleted(event.data.object);
        break;
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  }
}
```

## Security Considerations

### Financial Data Protection

```typescript
interface FinancialDataSecurity {
  encryptSensitiveData(data: SensitiveFinancialData): Promise<EncryptedData>;
  decryptSensitiveData(encryptedData: EncryptedData): Promise<SensitiveFinancialData>;
  auditFinancialAccess(userId: string, action: string, resourceId: string): Promise<void>;
  validateFinancialPermissions(userId: string, action: string, resource: string): Promise<boolean>;
  detectFraudulentActivity(transactionData: TransactionData): Promise<FraudDetectionResult>;
}

class FinancialSecurityManager implements FinancialDataSecurity {
  async encryptSensitiveData(data: SensitiveFinancialData): Promise<EncryptedData> {
    // Use field-level encryption for sensitive financial data
    const encryptedFields: Record<string, string> = {};
    
    for (const [field, value] of Object.entries(data)) {
      if (this.isSensitiveField(field)) {
        encryptedFields[field] = await this.encryptionService.encrypt(
          JSON.stringify(value),
          {
            keyId: `financial:${field}`,
            algorithm: 'AES-256-GCM'
          }
        );
      } else {
        encryptedFields[field] = value;
      }
    }
    
    return {
      encryptedFields,
      keyIds: this.getKeyIds(data),
      encryptedAt: new Date()
    };
  }

  async detectFraudulentActivity(transactionData: TransactionData): Promise<FraudDetectionResult> {
    const riskFactors: RiskFactor[] = [];
    let riskScore = 0;
    
    // Check for unusual payment amounts
    const averagePayment = await this.getAveragePaymentAmount(transactionData.tenantId);
    if (transactionData.amount > averagePayment * 5) {
      riskFactors.push({
        type: 'unusual_amount',
        severity: 'medium',
        description: 'Payment amount significantly higher than average'
      });
      riskScore += 30;
    }
    
    // Check for rapid successive payments
    const recentPayments = await this.getRecentPayments(transactionData.tenantId, '1h');
    if (recentPayments.length > 5) {
      riskFactors.push({
        type: 'rapid_payments',
        severity: 'high',
        description: 'Multiple payments in short time period'
      });
      riskScore += 50;
    }
    
    // Check for new payment methods
    const paymentMethodAge = await this.getPaymentMethodAge(transactionData.paymentMethodId);
    if (paymentMethodAge < 24 * 60 * 60 * 1000) { // Less than 24 hours
      riskFactors.push({
        type: 'new_payment_method',
        severity: 'low',
        description: 'Payment method added recently'
      });
      riskScore += 15;
    }
    
    // Determine risk level
    let riskLevel: RiskLevel;
    if (riskScore >= 70) {
      riskLevel = RiskLevel.HIGH;
    } else if (riskScore >= 40) {
      riskLevel = RiskLevel.MEDIUM;
    } else {
      riskLevel = RiskLevel.LOW;
    }
    
    return {
      riskLevel,
      riskScore,
      riskFactors,
      recommendedAction: this.getRecommendedAction(riskLevel),
      requiresReview: riskLevel === RiskLevel.HIGH
    };
  }
}
```

## Compliance Requirements

### Revenue Recognition Compliance

```typescript
interface RevenueComplianceManager {
  validateASC606Compliance(tenantId: string): Promise<ComplianceValidationResult>;
  generateRevenueDisclosures(tenantId: string, period: ReportingPeriod): Promise<RevenueDisclosure>;
  auditRevenueRecognition(tenantId: string, period: ReportingPeriod): Promise<RevenueAuditResult>;
  handleRevenueRestatement(restatementData: RevenueRestatement): Promise<void>;
}

class ASC606ComplianceValidator implements RevenueComplianceManager {
  async validateASC606Compliance(tenantId: string): Promise<ComplianceValidationResult> {
    const validationResult: ComplianceValidationResult = {
      tenantId,
      framework: 'ASC 606',
      validationDate: new Date(),
      overallStatus: 'compliant',
      findings: [],
      recommendations: []
    };
    
    // Step 1: Identify contracts with customers
    const contractValidation = await this.validateContractIdentification(tenantId);
    if (!contractValidation.compliant) {
      validationResult.findings.push({
        step: 'contract_identification',
        severity: 'high',
        description: 'Contract identification issues found',
        details: contractValidation.issues
      });
      validationResult.overallStatus = 'non_compliant';
    }
    
    // Step 2: Identify performance obligations
    const obligationValidation = await this.validatePerformanceObligations(tenantId);
    if (!obligationValidation.compliant) {
      validationResult.findings.push({
        step: 'performance_obligations',
        severity: 'medium',
        description: 'Performance obligation identification issues',
        details: obligationValidation.issues
      });
    }
    
    // Step 3: Determine transaction price
    const priceValidation = await this.validateTransactionPrice(tenantId);
    if (!priceValidation.compliant) {
      validationResult.findings.push({
        step: 'transaction_price',
        severity: 'high',
        description: 'Transaction price determination issues',
        details: priceValidation.issues
      });
      validationResult.overallStatus = 'non_compliant';
    }
    
    // Step 4: Allocate transaction price
    const allocationValidation = await this.validatePriceAllocation(tenantId);
    if (!allocationValidation.compliant) {
      validationResult.findings.push({
        step: 'price_allocation',
        severity: 'medium',
        description: 'Price allocation issues found',
        details: allocationValidation.issues
      });
    }
    
    // Step 5: Recognize revenue
    const recognitionValidation = await this.validateRevenueRecognition(tenantId);
    if (!recognitionValidation.compliant) {
      validationResult.findings.push({
        step: 'revenue_recognition',
        severity: 'high',
        description: 'Revenue recognition timing issues',
        details: recognitionValidation.issues
      });
      validationResult.overallStatus = 'non_compliant';
    }
    
    return validationResult;
  }
}
```

## Testing Considerations

### Billing System Testing

```typescript
// Subscription billing testing
describe('Enterprise Subscription Billing', () => {
  it('should correctly calculate prorated charges for mid-cycle upgrades', async () => {
    const subscription = await createTestSubscription({
      planId: 'basic-plan',
      billingCycle: BillingCycle.MONTHLY,
      startDate: new Date('2024-01-01')
    });
    
    const upgradeDate = new Date('2024-01-15'); // Mid-cycle
    const newPlan = await createTestPlan({
      id: 'premium-plan',
      monthlyPrice: 200
    });
    
    const result = await subscriptionLifecycleManager.handleSubscriptionUpgrade(
      subscription.id,
      newPlan.id,
      upgradeDate
    );
    
    // Should prorate for remaining 16 days of the month
    const expectedProratedAmount = (200 - 100) * (16 / 31);
    expect(result.proratedCharges.amount).toBeCloseTo(expectedProratedAmount, 2);
    expect(result.upgradeInvoice).toBeDefined();
    expect(result.subscription.planId).toBe(newPlan.id);
  });
  
  it('should handle usage-based billing calculations correctly', async () => {
    const subscription = await createTestSubscription({
      pricingModel: PricingModel.USAGE_BASED,
      usageCharges: [
        {
          metricName: 'api_calls',
          pricingModel: UsagePricingModel.TIERED,
          tiers: [
            { upTo: 1000, price: 0 },
            { upTo: 10000, price: 0.01 },
            { upTo: null, price: 0.005 }
          ]
        }
      ]
    });
    
    // Simulate usage
    await usageBillingEngine.trackUsage(subscription.tenantId, {
      subscriptionId: subscription.id,
      metricName: 'api_calls',
      value: 15000,
      timestamp: new Date()
    });
    
    const charges = await usageBillingEngine.calculateUsageCharges(
      subscription.id,
      { startDate: new Date('2024-01-01'), endDate: new Date('2024-01-31') }
    );
    
    // Expected: 0 (first 1000) + 90 (next 9000 * 0.01) + 25 (remaining 5000 * 0.005)
    expect(charges.totalAmount).toBe(115);
    expect(charges.charges).toHaveLength(1);
    expect(charges.charges[0].metricName).toBe('api_calls');
  });
});

// Revenue recognition testing
describe('Revenue Recognition', () => {
  it('should create correct straight-line recognition schedule', async () => {
    const invoice = await createTestInvoice({
      total: 1200,
      subscriptionId: 'test-subscription'
    });
    
    const subscription = await createTestSubscription({
      contract: {
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31')
      }
    });
    
    const recognition = await revenueEngine.recognizeRevenue(invoice.id);
    
    expect(recognition.recognitionMethod).toBe(RevenueRecognitionMethod.STRAIGHT_LINE);
    expect(recognition.recognitionSchedule).toHaveLength(12);
    expect(recognition.recognitionSchedule[0].amount).toBe(100); // 1200 / 12 months
    expect(recognition.deferredAmount).toBeGreaterThan(0);
  });
});
```

### Performance Testing

- **High-volume billing processing**: Test system performance with thousands of subscriptions
- **Usage data ingestion**: Test real-time usage tracking under load
- **Invoice generation performance**: Test bulk invoice generation and delivery
- **Payment processing throughput**: Test concurrent payment processing
- **Revenue calculation performance**: Test complex revenue recognition calculations

This template provides a comprehensive foundation for implementing enterprise-grade billing and subscription management systems with advanced features, compliance support, and integration capabilities.