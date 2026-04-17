# Point Systems Template

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

This template provides comprehensive patterns for implementing point-based gamification systems that track user actions, manage point balances, and create engaging reward mechanisms. It covers point earning rules, spending mechanics, balance management, and point expiration policies to drive user engagement and retention.

## Context

Point systems are fundamental to gamification, providing immediate feedback and tangible rewards for user actions. A well-designed point system creates clear value propositions, encourages desired behaviors, and maintains long-term engagement through balanced earning and spending mechanics. This template addresses the complexity of building scalable point systems that support various earning mechanisms, spending options, and balance management while preventing abuse and maintaining system integrity.

## Instructions

1. **Setup Point System Infrastructure**: Configure point types, earning rules, and balance tracking
2. **Implement Point Earning Mechanics**: Build comprehensive action-to-points mapping
3. **Add Point Spending System**: Enable point redemption and spending workflows
4. **Configure Balance Management**: Implement point tracking, history, and expiration
5. **Enable Point Transfers**: Add peer-to-peer point sharing capabilities
6. **Add Anti-Fraud Protection**: Build abuse prevention and validation systems
7. **Test Point Accuracy**: Validate point calculations and balance integrity

## Examples

### Example 1: Point System Service
```typescript
interface PointSystemService {
  earnPoints(userId: string, action: PointAction): Promise<PointTransaction>;
  spendPoints(userId: string, amount: number, reason: string): Promise<PointTransaction>;
  getBalance(userId: string): Promise<PointBalance>;
  getPointHistory(userId: string, timeRange: TimeRange): Promise<PointTransaction[]>;
  transferPoints(fromUserId: string, toUserId: string, amount: number): Promise<PointTransfer>;
}

const pointSystem = new PointSystemService();
const transaction = await pointSystem.earnPoints('user-123', {
  actionType: 'complete_profile',
  points: 100,
  metadata: {
    profileCompleteness: 100,
    timestamp: new Date()
  }
});
```

### Example 2: Point Earning Rules Engine
```typescript
interface PointEarningEngine {
  defineRule(rule: PointRule): Promise<void>;
  calculatePoints(userId: string, action: UserAction): Promise<number>;
  applyMultipliers(basePoints: number, multipliers: PointMultiplier[]): number;
  validateEarning(userId: string, action: UserAction): Promise<ValidationResult>;
}

const rule: PointRule = {
  id: 'daily-login',
  actionType: 'user_login',
  basePoints: 10,
  conditions: [
    { type: 'daily_limit', value: 1 },
    { type: 'consecutive_days', multiplier: 1.1 }
  ],
  expiration: '365d'
};

await earningEngine.defineRule(rule);
```

### Example 3: Point Spending System
```typescript
interface PointSpendingSystem {
  createSpendingOption(option: SpendingOption): Promise<void>;
  purchaseWithPoints(userId: string, optionId: string): Promise<Purchase>;
  validatePurchase(userId: string, cost: number): Promise<boolean>;
  processRefund(transactionId: string): Promise<PointRefund>;
}

const spendingOption: SpendingOption = {
  id: 'premium-badge',
  name: 'Premium Profile Badge',
  cost: 500,
  category: 'cosmetic',
  availability: {
    startDate: new Date(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    maxPurchases: 1
  }
};
```

## Variables

| Variable | Description | Type | Required | Default |
|----------|-------------|------|----------|---------|
| enablePointSystem | Enable point earning and spending | boolean | No | true |
| enablePointTransfers | Enable peer-to-peer point transfers | boolean | No | false |
| enablePointExpiration | Enable point expiration policies | boolean | No | true |
| defaultExpirationDays | Default days before points expire | number | No | 365 |
| maxDailyEarning | Maximum points earnable per day | number | No | 1000 |
| enableMultipliers | Enable point multipliers and bonuses | boolean | No | true |
| enableFraudDetection | Enable anti-fraud protection | boolean | No | true |
| pointPrecision | Decimal precision for point calculations | number | No | 2 |

## Expected Output

This template will produce:
- **Point Earning System**: Comprehensive action-to-points mapping and calculation
- **Point Balance Management**: Real-time balance tracking and history
- **Point Spending Mechanics**: Redemption system with validation and processing
- **Point Transfer System**: Peer-to-peer point sharing with security controls
- **Expiration Management**: Automated point expiration and notification system
- **Anti-Fraud Protection**: Abuse detection and prevention mechanisms
- **Analytics Dashboard**: Point system performance and user engagement metrics
- **Admin Tools**: Point system management and configuration interfaces

## Implementation Patterns

### Point System Architecture

```typescript
// Core Point System Architecture
interface PointSystemCore {
  earningEngine: PointEarningEngine;
  spendingSystem: PointSpendingSystem;
  balanceManager: PointBalanceManager;
  transferService: PointTransferService;
  expirationManager: PointExpirationManager;
  fraudDetector: PointFraudDetector;
}

interface PointTransaction {
  id: string;
  userId: string;
  type: 'earn' | 'spend' | 'transfer_in' | 'transfer_out' | 'expire' | 'refund';
  amount: number;
  balance: number;
  
  // Transaction details
  reason: string;
  actionType?: string;
  metadata: Record<string, any>;
  
  // Timestamps
  createdAt: Date;
  processedAt: Date;
  expiresAt?: Date;
  
  // References
  relatedTransactionId?: string;
  spendingOptionId?: string;
  transferId?: string;
  
  // Status
  status: 'pending' | 'completed' | 'failed' | 'reversed';
  
  // Audit
  ipAddress?: string;
  userAgent?: string;
  adminUserId?: string;
}

interface PointBalance {
  userId: string;
  totalPoints: number;
  availablePoints: number;
  pendingPoints: number;
  expiredPoints: number;
  
  // Balance breakdown
  earnedPoints: number;
  spentPoints: number;
  transferredIn: number;
  transferredOut: number;
  
  // Expiration tracking
  pointsExpiringIn30Days: number;
  nextExpirationDate?: Date;
  
  // Timestamps
  lastUpdated: Date;
  lastEarned?: Date;
  lastSpent?: Date;
}

interface PointRule {
  id: string;
  name: string;
  description: string;
  actionType: string;
  
  // Point calculation
  basePoints: number;
  multipliers: PointMultiplier[];
  
  // Conditions and limits
  conditions: PointCondition[];
  dailyLimit?: number;
  weeklyLimit?: number;
  monthlyLimit?: number;
  lifetimeLimit?: number;
  
  // Timing
  cooldownPeriod?: number;
  validFrom?: Date;
  validUntil?: Date;
  
  // Point properties
  expirationDays?: number;
  category: string;
  priority: number;
  
  // Status
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

**Point Earning Engine Implementation**
```typescript
class PointEarningEngine {
  private ruleStore: PointRuleStore;
  private balanceManager: PointBalanceManager;
  private fraudDetector: PointFraudDetector;
  private limitTracker: PointLimitTracker;

  async earnPoints(userId: string, action: PointAction): Promise<PointTransaction> {
    // Validate action and user
    const validationResult = await this.validateEarning(userId, action);
    if (!validationResult.valid) {
      throw new Error(`Invalid point earning: ${validationResult.reason}`);
    }

    // Get applicable rules
    const rules = await this.getApplicableRules(action.actionType);
    if (rules.length === 0) {
      throw new Error('No point rules found for action');
    }

    // Calculate points from all applicable rules
    let totalPoints = 0;
    const appliedRules: AppliedRule[] = [];

    for (const rule of rules) {
      const rulePoints = await this.calculateRulePoints(userId, action, rule);
      if (rulePoints > 0) {
        totalPoints += rulePoints;
        appliedRules.push({
          ruleId: rule.id,
          basePoints: rule.basePoints,
          calculatedPoints: rulePoints,
          multipliers: await this.getActiveMultipliers(userId, rule)
        });
      }
    }

    if (totalPoints === 0) {
      throw new Error('No points earned for action');
    }

    // Check limits
    const limitCheck = await this.limitTracker.checkLimits(userId, totalPoints, action);
    if (!limitCheck.allowed) {
      throw new Error(`Point earning limit exceeded: ${limitCheck.reason}`);
    }

    // Create transaction
    const transaction: PointTransaction = {
      id: this.generateTransactionId(),
      userId,
      type: 'earn',
      amount: totalPoints,
      balance: 0, // Will be set by balance manager
      reason: action.reason || `Earned points for ${action.actionType}`,
      actionType: action.actionType,
      metadata: {
        ...action.metadata,
        appliedRules,
        originalAction: action
      },
      createdAt: new Date(),
      processedAt: new Date(),
      expiresAt: this.calculateExpirationDate(rules),
      status: 'completed'
    };

    // Update balance
    const updatedBalance = await this.balanceManager.addPoints(userId, transaction);
    transaction.balance = updatedBalance.totalPoints;

    // Update limits
    await this.limitTracker.recordEarning(userId, totalPoints, action);

    // Log for analytics
    await this.analyticsLogger.logPointEarning(transaction);

    return transaction;
  }

  private async calculateRulePoints(
    userId: string, 
    action: PointAction, 
    rule: PointRule
  ): Promise<number> {
    // Check rule conditions
    const conditionsValid = await this.checkRuleConditions(userId, action, rule);
    if (!conditionsValid) {
      return 0;
    }

    // Calculate base points
    let points = rule.basePoints;

    // Apply multipliers
    const multipliers = await this.getActiveMultipliers(userId, rule);
    for (const multiplier of multipliers) {
      points = this.applyMultiplier(points, multiplier);
    }

    // Apply action-specific modifiers
    if (action.pointModifier) {
      points *= action.pointModifier;
    }

    // Round to configured precision
    return Math.round(points * Math.pow(10, this.config.pointPrecision)) / Math.pow(10, this.config.pointPrecision);
  }

  private async checkRuleConditions(
    userId: string, 
    action: PointAction, 
    rule: PointRule
  ): Promise<boolean> {
    for (const condition of rule.conditions) {
      const conditionMet = await this.evaluateCondition(userId, action, condition);
      if (!conditionMet) {
        return false;
      }
    }
    return true;
  }

  private async evaluateCondition(
    userId: string, 
    action: PointAction, 
    condition: PointCondition
  ): Promise<boolean> {
    switch (condition.type) {
      case 'daily_limit':
        const dailyEarnings = await this.getTodayEarnings(userId, action.actionType);
        return dailyEarnings < condition.value;
        
      case 'consecutive_days':
        const consecutiveDays = await this.getConsecutiveDays(userId, action.actionType);
        return consecutiveDays >= condition.value;
        
      case 'user_level':
        const userLevel = await this.getUserLevel(userId);
        return userLevel >= condition.value;
        
      case 'time_of_day':
        const currentHour = new Date().getHours();
        return currentHour >= condition.startHour && currentHour <= condition.endHour;
        
      case 'user_segment':
        const userSegments = await this.getUserSegments(userId);
        return userSegments.includes(condition.segment);
        
      default:
        return true;
    }
  }

  private async getActiveMultipliers(userId: string, rule: PointRule): Promise<PointMultiplier[]> {
    const multipliers: PointMultiplier[] = [];

    // Rule-specific multipliers
    multipliers.push(...rule.multipliers);

    // User-specific multipliers
    const userMultipliers = await this.getUserMultipliers(userId);
    multipliers.push(...userMultipliers);

    // Time-based multipliers (happy hour, weekend bonus, etc.)
    const timeMultipliers = await this.getTimeBasedMultipliers();
    multipliers.push(...timeMultipliers);

    // Event-based multipliers
    const eventMultipliers = await this.getEventMultipliers();
    multipliers.push(...eventMultipliers);

    return multipliers.filter(m => m.isActive && this.isMultiplierValid(m));
  }

  private applyMultiplier(points: number, multiplier: PointMultiplier): number {
    switch (multiplier.type) {
      case 'percentage':
        return points * (1 + multiplier.value / 100);
      case 'fixed_bonus':
        return points + multiplier.value;
      case 'multiplier':
        return points * multiplier.value;
      default:
        return points;
    }
  }
}
```

### Point Spending System Implementation

```typescript
class PointSpendingSystem {
  private spendingOptionStore: SpendingOptionStore;
  private balanceManager: PointBalanceManager;
  private purchaseProcessor: PurchaseProcessor;
  private inventoryManager: InventoryManager;

  async spendPoints(userId: string, optionId: string, quantity: number = 1): Promise<Purchase> {
    // Get spending option
    const option = await this.spendingOptionStore.findById(optionId);
    if (!option) {
      throw new Error('Spending option not found');
    }

    // Validate availability
    const availabilityCheck = await this.checkAvailability(userId, option, quantity);
    if (!availabilityCheck.available) {
      throw new Error(`Purchase not available: ${availabilityCheck.reason}`);
    }

    // Calculate total cost
    const totalCost = option.cost * quantity;

    // Validate user balance
    const balance = await this.balanceManager.getBalance(userId);
    if (balance.availablePoints < totalCost) {
      throw new Error('Insufficient points');
    }

    // Create purchase record
    const purchase: Purchase = {
      id: this.generatePurchaseId(),
      userId,
      optionId,
      quantity,
      totalCost,
      status: 'pending',
      createdAt: new Date(),
      metadata: {
        userBalance: balance.totalPoints,
        optionDetails: option
      }
    };

    try {
      // Reserve points
      await this.balanceManager.reservePoints(userId, totalCost, purchase.id);

      // Process purchase
      const purchaseResult = await this.purchaseProcessor.process(purchase, option);
      
      if (purchaseResult.success) {
        // Deduct points
        const transaction = await this.balanceManager.deductPoints(userId, {
          amount: totalCost,
          reason: `Purchase: ${option.name}`,
          purchaseId: purchase.id,
          spendingOptionId: optionId
        });

        // Update inventory
        await this.inventoryManager.updateStock(optionId, -quantity);

        // Complete purchase
        purchase.status = 'completed';
        purchase.completedAt = new Date();
        purchase.transactionId = transaction.id;
        purchase.deliveryInfo = purchaseResult.deliveryInfo;

        await this.purchaseStore.save(purchase);

        // Log analytics
        await this.analyticsLogger.logPointSpending(purchase, transaction);

        return purchase;
      } else {
        // Release reserved points
        await this.balanceManager.releaseReservedPoints(userId, purchase.id);
        
        purchase.status = 'failed';
        purchase.failureReason = purchaseResult.error;
        await this.purchaseStore.save(purchase);

        throw new Error(`Purchase failed: ${purchaseResult.error}`);
      }
    } catch (error) {
      // Release reserved points on any error
      await this.balanceManager.releaseReservedPoints(userId, purchase.id);
      throw error;
    }
  }

  private async checkAvailability(
    userId: string, 
    option: SpendingOption, 
    quantity: number
  ): Promise<AvailabilityCheck> {
    // Check if option is active
    if (!option.isActive) {
      return { available: false, reason: 'Option is not active' };
    }

    // Check date availability
    const now = new Date();
    if (option.availability.startDate && now < option.availability.startDate) {
      return { available: false, reason: 'Option not yet available' };
    }
    if (option.availability.endDate && now > option.availability.endDate) {
      return { available: false, reason: 'Option no longer available' };
    }

    // Check stock availability
    if (option.stockLimit !== undefined) {
      const currentStock = await this.inventoryManager.getStock(option.id);
      if (currentStock < quantity) {
        return { available: false, reason: 'Insufficient stock' };
      }
    }

    // Check user purchase limits
    if (option.availability.maxPurchasesPerUser !== undefined) {
      const userPurchases = await this.getUserPurchaseCount(userId, option.id);
      if (userPurchases + quantity > option.availability.maxPurchasesPerUser) {
        return { available: false, reason: 'User purchase limit exceeded' };
      }
    }

    // Check user eligibility
    if (option.eligibilityRules) {
      const eligibilityCheck = await this.checkEligibility(userId, option.eligibilityRules);
      if (!eligibilityCheck.eligible) {
        return { available: false, reason: eligibilityCheck.reason };
      }
    }

    return { available: true };
  }

  async createSpendingOption(option: CreateSpendingOptionRequest): Promise<SpendingOption> {
    const spendingOption: SpendingOption = {
      id: this.generateOptionId(),
      name: option.name,
      description: option.description,
      cost: option.cost,
      category: option.category,
      type: option.type,
      
      // Availability settings
      availability: {
        startDate: option.startDate,
        endDate: option.endDate,
        maxPurchases: option.maxPurchases,
        maxPurchasesPerUser: option.maxPurchasesPerUser
      },
      
      // Stock management
      stockLimit: option.stockLimit,
      currentStock: option.initialStock || option.stockLimit,
      
      // Delivery configuration
      deliveryConfig: option.deliveryConfig,
      
      // Eligibility rules
      eligibilityRules: option.eligibilityRules,
      
      // Metadata
      imageUrl: option.imageUrl,
      tags: option.tags || [],
      priority: option.priority || 0,
      
      // Status
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await this.spendingOptionStore.save(spendingOption);
    
    // Initialize inventory tracking
    if (spendingOption.stockLimit !== undefined) {
      await this.inventoryManager.initializeStock(spendingOption.id, spendingOption.currentStock);
    }

    return spendingOption;
  }
}
```

### Point Balance Management

```typescript
class PointBalanceManager {
  private balanceStore: PointBalanceStore;
  private transactionStore: PointTransactionStore;
  private expirationManager: PointExpirationManager;

  async getBalance(userId: string): Promise<PointBalance> {
    let balance = await this.balanceStore.findByUserId(userId);
    
    if (!balance) {
      // Create initial balance
      balance = await this.createInitialBalance(userId);
    }

    // Check for expired points
    await this.expirationManager.processExpiredPoints(userId);

    // Recalculate balance if needed
    if (this.shouldRecalculateBalance(balance)) {
      balance = await this.recalculateBalance(userId);
    }

    return balance;
  }

  async addPoints(userId: string, transaction: PointTransaction): Promise<PointBalance> {
    const currentBalance = await this.getBalance(userId);
    
    // Calculate new balance
    const newTotalPoints = currentBalance.totalPoints + transaction.amount;
    const newAvailablePoints = currentBalance.availablePoints + transaction.amount;
    const newEarnedPoints = currentBalance.earnedPoints + transaction.amount;

    // Update balance
    const updatedBalance: PointBalance = {
      ...currentBalance,
      totalPoints: newTotalPoints,
      availablePoints: newAvailablePoints,
      earnedPoints: newEarnedPoints,
      lastUpdated: new Date(),
      lastEarned: new Date()
    };

    // Save transaction
    await this.transactionStore.save(transaction);
    
    // Save balance
    await this.balanceStore.save(updatedBalance);

    // Schedule expiration if applicable
    if (transaction.expiresAt) {
      await this.expirationManager.scheduleExpiration(userId, transaction);
    }

    // Trigger balance update events
    await this.eventEmitter.emit('balance.updated', {
      userId,
      previousBalance: currentBalance,
      newBalance: updatedBalance,
      transaction
    });

    return updatedBalance;
  }

  async deductPoints(userId: string, deduction: PointDeduction): Promise<PointTransaction> {
    const currentBalance = await this.getBalance(userId);
    
    if (currentBalance.availablePoints < deduction.amount) {
      throw new Error('Insufficient points');
    }

    // Create deduction transaction
    const transaction: PointTransaction = {
      id: this.generateTransactionId(),
      userId,
      type: 'spend',
      amount: -deduction.amount,
      balance: currentBalance.totalPoints - deduction.amount,
      reason: deduction.reason,
      metadata: deduction.metadata || {},
      createdAt: new Date(),
      processedAt: new Date(),
      status: 'completed',
      spendingOptionId: deduction.spendingOptionId,
      relatedTransactionId: deduction.purchaseId
    };

    // Update balance
    const updatedBalance: PointBalance = {
      ...currentBalance,
      totalPoints: currentBalance.totalPoints - deduction.amount,
      availablePoints: currentBalance.availablePoints - deduction.amount,
      spentPoints: currentBalance.spentPoints + deduction.amount,
      lastUpdated: new Date(),
      lastSpent: new Date()
    };

    // Save transaction and balance atomically
    await this.executeAtomicUpdate(async () => {
      await this.transactionStore.save(transaction);
      await this.balanceStore.save(updatedBalance);
    });

    // Trigger events
    await this.eventEmitter.emit('points.spent', {
      userId,
      amount: deduction.amount,
      transaction,
      newBalance: updatedBalance
    });

    return transaction;
  }

  async transferPoints(
    fromUserId: string, 
    toUserId: string, 
    amount: number, 
    reason: string
  ): Promise<PointTransfer> {
    if (!this.config.enablePointTransfers) {
      throw new Error('Point transfers are not enabled');
    }

    // Validate transfer
    const validation = await this.validateTransfer(fromUserId, toUserId, amount);
    if (!validation.valid) {
      throw new Error(`Transfer validation failed: ${validation.reason}`);
    }

    const transferId = this.generateTransferId();
    
    try {
      // Create transfer record
      const transfer: PointTransfer = {
        id: transferId,
        fromUserId,
        toUserId,
        amount,
        reason,
        status: 'pending',
        createdAt: new Date()
      };

      await this.transferStore.save(transfer);

      // Execute transfer atomically
      await this.executeAtomicUpdate(async () => {
        // Deduct from sender
        const deductTransaction = await this.deductPoints(fromUserId, {
          amount,
          reason: `Transfer to user ${toUserId}: ${reason}`,
          metadata: { transferId, recipientUserId: toUserId }
        });

        // Add to recipient
        const addTransaction = await this.addPoints(toUserId, {
          id: this.generateTransactionId(),
          userId: toUserId,
          type: 'transfer_in',
          amount,
          balance: 0, // Will be calculated
          reason: `Transfer from user ${fromUserId}: ${reason}`,
          metadata: { transferId, senderUserId: fromUserId },
          createdAt: new Date(),
          processedAt: new Date(),
          status: 'completed'
        });

        // Update transfer record
        transfer.status = 'completed';
        transfer.completedAt = new Date();
        transfer.senderTransactionId = deductTransaction.id;
        transfer.recipientTransactionId = addTransaction.id;
        
        await this.transferStore.save(transfer);
      });

      // Log transfer for analytics
      await this.analyticsLogger.logPointTransfer(transfer);

      return transfer;
    } catch (error) {
      // Mark transfer as failed
      await this.transferStore.updateStatus(transferId, 'failed', error.message);
      throw error;
    }
  }

  private async validateTransfer(
    fromUserId: string, 
    toUserId: string, 
    amount: number
  ): Promise<ValidationResult> {
    // Check if users exist
    const fromUser = await this.userService.findById(fromUserId);
    const toUser = await this.userService.findById(toUserId);
    
    if (!fromUser || !toUser) {
      return { valid: false, reason: 'Invalid user(s)' };
    }

    // Check sender balance
    const senderBalance = await this.getBalance(fromUserId);
    if (senderBalance.availablePoints < amount) {
      return { valid: false, reason: 'Insufficient points' };
    }

    // Check transfer limits
    const dailyTransfers = await this.getDailyTransferAmount(fromUserId);
    if (dailyTransfers + amount > this.config.maxDailyTransferAmount) {
      return { valid: false, reason: 'Daily transfer limit exceeded' };
    }

    // Check minimum transfer amount
    if (amount < this.config.minTransferAmount) {
      return { valid: false, reason: 'Amount below minimum transfer limit' };
    }

    // Check if users can transfer to each other
    const relationshipCheck = await this.checkTransferRelationship(fromUserId, toUserId);
    if (!relationshipCheck.allowed) {
      return { valid: false, reason: relationshipCheck.reason };
    }

    return { valid: true };
  }
}
```

## Integration Points

### User Analytics Integration
```typescript
interface PointAnalyticsIntegration {
  trackPointEarning(transaction: PointTransaction): Promise<void>;
  trackPointSpending(purchase: Purchase): Promise<void>;
  trackPointTransfer(transfer: PointTransfer): Promise<void>;
  generateEngagementMetrics(userId: string): Promise<EngagementMetrics>;
}

class PointAnalyticsService {
  async generatePointsReport(timeRange: TimeRange): Promise<PointsReport> {
    return {
      totalPointsEarned: await this.getTotalPointsEarned(timeRange),
      totalPointsSpent: await this.getTotalPointsSpent(timeRange),
      activeUsers: await this.getActivePointUsers(timeRange),
      topEarningActions: await this.getTopEarningActions(timeRange),
      popularSpendingOptions: await this.getPopularSpendingOptions(timeRange),
      averageBalance: await this.getAverageBalance(),
      pointVelocity: await this.calculatePointVelocity(timeRange)
    };
  }

  async trackUserEngagement(userId: string): Promise<void> {
    const pointActivity = await this.getUserPointActivity(userId);
    
    await this.analyticsService.trackEvent(userId, {
      eventType: 'point_engagement',
      properties: {
        totalPointsEarned: pointActivity.totalEarned,
        totalPointsSpent: pointActivity.totalSpent,
        currentBalance: pointActivity.currentBalance,
        earningFrequency: pointActivity.earningFrequency,
        spendingFrequency: pointActivity.spendingFrequency
      }
    });
  }
}
```

### Notification System Integration
```typescript
interface PointNotificationService {
  notifyPointsEarned(userId: string, transaction: PointTransaction): Promise<void>;
  notifyPointsSpent(userId: string, purchase: Purchase): Promise<void>;
  notifyPointsExpiring(userId: string, expiringPoints: ExpiringPoints): Promise<void>;
  notifyBalanceMilestone(userId: string, milestone: BalanceMilestone): Promise<void>;
}

class PointNotificationHandler {
  async handlePointsEarned(event: PointsEarnedEvent): Promise<void> {
    const { userId, transaction } = event;
    
    // Send immediate notification
    await this.notificationService.send(userId, {
      type: 'points_earned',
      title: 'Points Earned!',
      message: `You earned ${transaction.amount} points for ${transaction.reason}`,
      data: {
        points: transaction.amount,
        newBalance: transaction.balance,
        action: transaction.actionType
      }
    });

    // Check for milestone achievements
    const milestones = await this.checkBalanceMilestones(userId, transaction.balance);
    for (const milestone of milestones) {
      await this.notifyBalanceMilestone(userId, milestone);
    }
  }

  async scheduleExpirationReminders(userId: string): Promise<void> {
    const expiringPoints = await this.getExpiringPoints(userId, { days: 30 });
    
    if (expiringPoints.length > 0) {
      // Schedule 30-day reminder
      await this.scheduledNotificationService.schedule(userId, {
        type: 'points_expiring_30d',
        scheduledFor: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        data: { expiringPoints }
      });

      // Schedule 7-day reminder
      await this.scheduledNotificationService.schedule(userId, {
        type: 'points_expiring_7d',
        scheduledFor: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        data: { expiringPoints }
      });
    }
  }
}
```

## Security Considerations

### Anti-Fraud Protection
```typescript
interface PointFraudDetector {
  validateEarning(userId: string, action: PointAction): Promise<FraudCheckResult>;
  detectSuspiciousActivity(userId: string): Promise<SuspiciousActivity[]>;
  validateTransfer(transfer: PointTransfer): Promise<TransferValidation>;
  monitorPointVelocity(userId: string): Promise<VelocityCheck>;
}

class PointSecurityService {
  async validatePointEarning(userId: string, action: PointAction): Promise<ValidationResult> {
    const checks: Promise<CheckResult>[] = [
      this.checkRateLimit(userId, action),
      this.checkActionAuthenticity(userId, action),
      this.checkUserBehaviorPattern(userId, action),
      this.checkIPReputation(action.ipAddress),
      this.checkDeviceFingerprint(action.deviceFingerprint)
    ];

    const results = await Promise.all(checks);
    const failedChecks = results.filter(r => !r.passed);

    if (failedChecks.length > 0) {
      await this.logSecurityEvent(userId, 'point_earning_blocked', {
        action,
        failedChecks: failedChecks.map(c => c.reason)
      });

      return {
        valid: false,
        reason: 'Security validation failed',
        details: failedChecks
      };
    }

    return { valid: true };
  }

  private async checkRateLimit(userId: string, action: PointAction): Promise<CheckResult> {
    const recentActions = await this.getRecentActions(userId, action.actionType, { minutes: 5 });
    
    if (recentActions.length > this.config.maxActionsPerMinute) {
      return {
        passed: false,
        reason: 'Rate limit exceeded',
        severity: 'high'
      };
    }

    return { passed: true };
  }

  private async checkActionAuthenticity(userId: string, action: PointAction): Promise<CheckResult> {
    // Verify action came from legitimate user interaction
    const sessionValidation = await this.validateUserSession(userId, action.sessionId);
    if (!sessionValidation.valid) {
      return {
        passed: false,
        reason: 'Invalid session',
        severity: 'high'
      };
    }

    // Check for bot-like behavior patterns
    const behaviorScore = await this.calculateBehaviorScore(userId, action);
    if (behaviorScore < this.config.minBehaviorScore) {
      return {
        passed: false,
        reason: 'Suspicious behavior pattern',
        severity: 'medium'
      };
    }

    return { passed: true };
  }

  async monitorPointBalance(userId: string): Promise<void> {
    const balance = await this.balanceManager.getBalance(userId);
    const historicalAverage = await this.getHistoricalAverageBalance(userId);

    // Check for unusual balance spikes
    if (balance.totalPoints > historicalAverage * 5) {
      await this.flagForReview(userId, 'unusual_balance_spike', {
        currentBalance: balance.totalPoints,
        historicalAverage,
        ratio: balance.totalPoints / historicalAverage
      });
    }

    // Check for rapid point accumulation
    const recentEarnings = await this.getRecentEarnings(userId, { hours: 24 });
    const dailyEarningLimit = this.config.maxDailyEarning;
    
    if (recentEarnings > dailyEarningLimit) {
      await this.flagForReview(userId, 'excessive_daily_earning', {
        dailyEarnings: recentEarnings,
        limit: dailyEarningLimit
      });
    }
  }
}
```

## Testing Considerations

### Point System Testing
```typescript
describe('Point System Accuracy', () => {
  it('should accurately calculate points for actions', async () => {
    const userId = 'test-user-123';
    const action: PointAction = {
      actionType: 'complete_task',
      metadata: { taskDifficulty: 'medium' }
    };

    const transaction = await pointSystem.earnPoints(userId, action);
    
    expect(transaction.amount).toBeGreaterThan(0);
    expect(transaction.userId).toBe(userId);
    expect(transaction.status).toBe('completed');
  });

  it('should maintain balance consistency', async () => {
    const userId = 'test-user-456';
    
    // Earn points
    await pointSystem.earnPoints(userId, { actionType: 'login', points: 100 });
    
    // Spend points
    await pointSystem.spendPoints(userId, 50, 'test purchase');
    
    const balance = await pointSystem.getBalance(userId);
    expect(balance.totalPoints).toBe(50);
    expect(balance.availablePoints).toBe(50);
  });

  it('should prevent double spending', async () => {
    const userId = 'test-user-789';
    await pointSystem.earnPoints(userId, { actionType: 'signup', points: 100 });
    
    // Attempt concurrent spending
    const spendPromises = [
      pointSystem.spendPoints(userId, 60, 'purchase 1'),
      pointSystem.spendPoints(userId, 60, 'purchase 2')
    ];
    
    const results = await Promise.allSettled(spendPromises);
    const successful = results.filter(r => r.status === 'fulfilled');
    
    expect(successful.length).toBe(1);
  });
});
```

## Real-World Considerations

### Scalability
- Use distributed caching for balance lookups (Redis Cluster)
- Implement event sourcing for transaction history
- Use database sharding for large user bases
- Consider eventual consistency for non-critical operations

### Performance Optimization
- Cache frequently accessed balances and rules
- Use batch processing for point calculations
- Implement read replicas for balance queries
- Use message queues for asynchronous processing

### Business Considerations
- Design point economics to encourage desired behaviors
- Monitor point inflation and deflation trends
- Implement point sinks to maintain economic balance
- Consider seasonal and promotional point multipliers

### Compliance and Auditing
- Maintain comprehensive audit trails for all transactions
- Implement point reconciliation processes
- Support regulatory reporting requirements
- Provide user-facing transaction history and statements
