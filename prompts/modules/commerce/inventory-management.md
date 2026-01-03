# Inventory Management Template

## Purpose

This template provides comprehensive patterns for building robust inventory management systems that handle stock tracking, automated reordering, multi-location inventory, and real-time availability updates. It addresses the complexities of modern inventory management including reservations, backorders, and supply chain integration.

## Context

Effective inventory management is crucial for e-commerce success, preventing stockouts while minimizing carrying costs. This template covers real-time stock tracking, automated replenishment, multi-warehouse management, and integration with sales channels. It ensures accurate inventory visibility across all touchpoints while optimizing stock levels and fulfillment efficiency.

## Core Inventory Management Patterns

### 1. Inventory Data Model

Define comprehensive inventory tracking structures:

```typescript
interface InventoryItem {
  id: string;
  productId: string;
  variantId?: string;
  sku: string;
  
  // Stock levels
  quantity: number;
  reservedQuantity: number;
  availableQuantity: number; // quantity - reservedQuantity
  committedQuantity: number; // allocated to orders
  
  // Thresholds
  lowStockThreshold: number;
  reorderPoint: number;
  reorderQuantity: number;
  maxStockLevel: number;
  
  // Location tracking
  locationId: string;
  binLocation?: string;
  zone?: string;
  
  // Cost tracking
  unitCost: number;
  averageCost: number;
  lastCost: number;
  totalValue: number;
  
  // Settings
  trackQuantity: boolean;
  allowBackorder: boolean;
  allowPreorder: boolean;
  backorderLimit?: number;
  
  // Timestamps
  lastStockUpdate: Date;
  lastReorderDate?: Date;
  nextReorderDate?: Date;
  
  // Audit trail
  stockMovements: StockMovement[];
  
  createdAt: Date;
  updatedAt: Date;
}

interface StockMovement {
  id: string;
  inventoryItemId: string;
  type: StockMovementType;
  quantity: number;
  previousQuantity: number;
  newQuantity: number;
  reason: string;
  reference?: string; // Order ID, PO ID, etc.
  cost?: number;
  userId?: string;
  timestamp: Date;
  notes?: string;
}

enum StockMovementType {
  SALE = 'sale',
  PURCHASE = 'purchase',
  RETURN = 'return',
  ADJUSTMENT = 'adjustment',
  TRANSFER = 'transfer',
  RESERVATION = 'reservation',
  RELEASE = 'release',
  DAMAGE = 'damage',
  LOSS = 'loss',
  FOUND = 'found',
  RECOUNT = 'recount'
}

interface InventoryLocation {
  id: string;
  name: string;
  type: LocationType;
  address: Address;
  isActive: boolean;
  isPrimary: boolean;
  
  // Capacity
  maxCapacity?: number;
  currentUtilization: number;
  
  // Fulfillment settings
  canFulfillOrders: boolean;
  fulfillmentPriority: number;
  shippingZones: string[];
  
  // Operating hours
  operatingHours: OperatingHours[];
  timezone: string;
  
  // Contact info
  contactInfo: ContactInfo;
  
  createdAt: Date;
  updatedAt: Date;
}

enum LocationType {
  WAREHOUSE = 'warehouse',
  STORE = 'store',
  DROPSHIP = 'dropship',
  SUPPLIER = 'supplier',
  THIRD_PARTY = 'third_party'
}
```

### 2. Real-Time Stock Tracking

Implement accurate, real-time inventory tracking:

```typescript
class InventoryTracker {
  async updateStock(
    productId: string, 
    variantId: string | undefined, 
    locationId: string, 
    quantityChange: number, 
    movementType: StockMovementType, 
    reference?: string,
    reason?: string
  ): Promise<InventoryItem> {
    
    // Get current inventory item
    const inventoryItem = await this.getInventoryItem(productId, variantId, locationId);
    if (!inventoryItem) {
      throw new Error('Inventory item not found');
    }
    
    // Calculate new quantities
    const previousQuantity = inventoryItem.quantity;
    const newQuantity = previousQuantity + quantityChange;
    
    // Validate stock levels
    if (newQuantity < 0 && !inventoryItem.allowBackorder) {
      throw new Error('Insufficient stock and backorders not allowed');
    }
    
    // Create stock movement record
    const stockMovement: StockMovement = {
      id: this.generateMovementId(),
      inventoryItemId: inventoryItem.id,
      type: movementType,
      quantity: Math.abs(quantityChange),
      previousQuantity,
      newQuantity,
      reason: reason || this.getDefaultReason(movementType),
      reference,
      timestamp: new Date()
    };
    
    // Update inventory item
    inventoryItem.quantity = newQuantity;
    inventoryItem.availableQuantity = newQuantity - inventoryItem.reservedQuantity;
    inventoryItem.lastStockUpdate = new Date();
    inventoryItem.updatedAt = new Date();
    
    // Add movement to history
    inventoryItem.stockMovements.push(stockMovement);
    
    // Update average cost for purchases
    if (movementType === StockMovementType.PURCHASE && stockMovement.cost) {
      inventoryItem.averageCost = this.calculateAverageCost(
        inventoryItem.averageCost,
        previousQuantity,
        stockMovement.cost,
        Math.abs(quantityChange)
      );
      inventoryItem.lastCost = stockMovement.cost;
    }
    
    // Update total value
    inventoryItem.totalValue = inventoryItem.quantity * inventoryItem.averageCost;
    
    // Save changes
    await this.inventoryRepository.save(inventoryItem);
    
    // Check for low stock alerts
    await this.checkLowStockAlert(inventoryItem);
    
    // Check for reorder triggers
    await this.checkReorderTrigger(inventoryItem);
    
    // Publish inventory update event
    await this.eventPublisher.publish('inventory.updated', {
      inventoryItem,
      stockMovement,
      previousQuantity,
      newQuantity
    });
    
    return inventoryItem;
  }
  
  async reserveStock(
    productId: string,
    variantId: string | undefined,
    locationId: string,
    quantity: number,
    reservationReference: string,
    expirationTime?: Date
  ): Promise<StockReservation> {
    
    const inventoryItem = await this.getInventoryItem(productId, variantId, locationId);
    if (!inventoryItem) {
      throw new Error('Inventory item not found');
    }
    
    // Check available quantity
    if (inventoryItem.availableQuantity < quantity) {
      throw new Error('Insufficient available stock for reservation');
    }
    
    // Create reservation
    const reservation: StockReservation = {
      id: this.generateReservationId(),
      inventoryItemId: inventoryItem.id,
      quantity,
      reference: reservationReference,
      status: ReservationStatus.ACTIVE,
      expiresAt: expirationTime || new Date(Date.now() + 30 * 60 * 1000), // 30 minutes default
      createdAt: new Date()
    };
    
    // Update inventory quantities
    inventoryItem.reservedQuantity += quantity;
    inventoryItem.availableQuantity -= quantity;
    inventoryItem.updatedAt = new Date();
    
    // Create stock movement
    await this.updateStock(
      productId,
      variantId,
      locationId,
      0, // No quantity change, just reservation
      StockMovementType.RESERVATION,
      reservationReference,
      `Reserved ${quantity} units`
    );
    
    // Save reservation
    await this.reservationRepository.save(reservation);
    await this.inventoryRepository.save(inventoryItem);
    
    // Schedule reservation expiration
    await this.scheduleReservationExpiration(reservation);
    
    return reservation;
  }
  
  async releaseReservation(reservationId: string): Promise<void> {
    const reservation = await this.reservationRepository.findById(reservationId);
    if (!reservation || reservation.status !== ReservationStatus.ACTIVE) {
      throw new Error('Active reservation not found');
    }
    
    const inventoryItem = await this.inventoryRepository.findById(reservation.inventoryItemId);
    if (!inventoryItem) {
      throw new Error('Inventory item not found');
    }
    
    // Update inventory quantities
    inventoryItem.reservedQuantity -= reservation.quantity;
    inventoryItem.availableQuantity += reservation.quantity;
    inventoryItem.updatedAt = new Date();
    
    // Update reservation status
    reservation.status = ReservationStatus.RELEASED;
    reservation.releasedAt = new Date();
    
    // Create stock movement
    await this.updateStock(
      inventoryItem.productId,
      inventoryItem.variantId,
      inventoryItem.locationId,
      0, // No quantity change, just release
      StockMovementType.RELEASE,
      reservation.reference,
      `Released ${reservation.quantity} units from reservation`
    );
    
    // Save changes
    await this.reservationRepository.save(reservation);
    await this.inventoryRepository.save(inventoryItem);
  }
  
  private calculateAverageCost(currentAvgCost: number, currentQuantity: number, newCost: number, newQuantity: number): number {
    if (currentQuantity === 0) {
      return newCost;
    }
    
    const totalValue = (currentAvgCost * currentQuantity) + (newCost * newQuantity);
    const totalQuantity = currentQuantity + newQuantity;
    
    return totalValue / totalQuantity;
  }
}
```

### 3. Automated Reordering System

Implement intelligent automated reordering:

```typescript
interface ReorderRule {
  id: string;
  productId: string;
  variantId?: string;
  locationId: string;
  
  // Trigger conditions
  reorderPoint: number;
  reorderQuantity: number;
  maxStockLevel: number;
  
  // Supplier information
  supplierId: string;
  supplierProductCode?: string;
  leadTimeDays: number;
  minimumOrderQuantity: number;
  orderMultiple: number;
  
  // Cost information
  unitCost: number;
  currency: string;
  
  // Settings
  isActive: boolean;
  autoCreatePO: boolean;
  requireApproval: boolean;
  
  // Seasonal adjustments
  seasonalMultipliers: SeasonalMultiplier[];
  
  createdAt: Date;
  updatedAt: Date;
}

interface SeasonalMultiplier {
  month: number;
  multiplier: number;
}

interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplierId: string;
  locationId: string;
  status: POStatus;
  
  // Order details
  orderDate: Date;
  expectedDeliveryDate: Date;
  actualDeliveryDate?: Date;
  
  // Line items
  lineItems: POLineItem[];
  
  // Totals
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  currency: string;
  
  // Approval
  approvedBy?: string;
  approvedAt?: Date;
  
  // Notes
  notes?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

enum POStatus {
  DRAFT = 'draft',
  PENDING_APPROVAL = 'pending_approval',
  APPROVED = 'approved',
  SENT = 'sent',
  PARTIALLY_RECEIVED = 'partially_received',
  RECEIVED = 'received',
  CANCELLED = 'cancelled'
}

class AutoReorderManager {
  async checkReorderTriggers(): Promise<void> {
    // Get all active reorder rules
    const reorderRules = await this.reorderRuleRepository.findActive();
    
    for (const rule of reorderRules) {
      try {
        await this.evaluateReorderRule(rule);
      } catch (error) {
        console.error(`Error evaluating reorder rule ${rule.id}:`, error);
        await this.logReorderError(rule.id, error);
      }
    }
  }
  
  private async evaluateReorderRule(rule: ReorderRule): Promise<void> {
    // Get current inventory
    const inventoryItem = await this.inventoryTracker.getInventoryItem(
      rule.productId,
      rule.variantId,
      rule.locationId
    );
    
    if (!inventoryItem) {
      console.warn(`Inventory item not found for reorder rule ${rule.id}`);
      return;
    }
    
    // Check if reorder is needed
    const effectiveReorderPoint = this.calculateEffectiveReorderPoint(rule);
    const availableStock = inventoryItem.availableQuantity;
    const pendingStock = await this.getPendingStockQuantity(rule.productId, rule.variantId, rule.locationId);
    const totalStock = availableStock + pendingStock;
    
    if (totalStock <= effectiveReorderPoint) {
      await this.triggerReorder(rule, inventoryItem, totalStock);
    }
  }
  
  private calculateEffectiveReorderPoint(rule: ReorderRule): number {
    const currentMonth = new Date().getMonth() + 1;
    const seasonalMultiplier = rule.seasonalMultipliers.find(sm => sm.month === currentMonth);
    
    let effectiveReorderPoint = rule.reorderPoint;
    
    if (seasonalMultiplier) {
      effectiveReorderPoint = Math.round(rule.reorderPoint * seasonalMultiplier.multiplier);
    }
    
    return effectiveReorderPoint;
  }
  
  private async triggerReorder(rule: ReorderRule, inventoryItem: InventoryItem, currentStock: number): Promise<void> {
    // Calculate order quantity
    const targetStock = rule.maxStockLevel;
    const orderQuantity = Math.max(
      targetStock - currentStock,
      rule.minimumOrderQuantity
    );
    
    // Adjust for order multiples
    const adjustedQuantity = Math.ceil(orderQuantity / rule.orderMultiple) * rule.orderMultiple;
    
    // Create purchase order
    const purchaseOrder = await this.createPurchaseOrder(rule, adjustedQuantity);
    
    // Handle approval workflow
    if (rule.requireApproval) {
      await this.submitForApproval(purchaseOrder);
    } else if (rule.autoCreatePO) {
      await this.approvePurchaseOrder(purchaseOrder.id);
    }
    
    // Log reorder event
    await this.logReorderEvent(rule, inventoryItem, purchaseOrder, currentStock);
    
    // Send notifications
    await this.sendReorderNotifications(rule, purchaseOrder);
  }
  
  private async createPurchaseOrder(rule: ReorderRule, quantity: number): Promise<PurchaseOrder> {
    const supplier = await this.supplierRepository.findById(rule.supplierId);
    if (!supplier) {
      throw new Error(`Supplier not found: ${rule.supplierId}`);
    }
    
    const product = await this.productRepository.findById(rule.productId);
    if (!product) {
      throw new Error(`Product not found: ${rule.productId}`);
    }
    
    const lineItem: POLineItem = {
      id: this.generateLineItemId(),
      productId: rule.productId,
      variantId: rule.variantId,
      supplierProductCode: rule.supplierProductCode,
      description: product.name,
      quantity,
      unitCost: rule.unitCost,
      totalCost: quantity * rule.unitCost
    };
    
    const purchaseOrder: PurchaseOrder = {
      id: this.generatePOId(),
      poNumber: await this.generatePONumber(),
      supplierId: rule.supplierId,
      locationId: rule.locationId,
      status: rule.requireApproval ? POStatus.PENDING_APPROVAL : POStatus.DRAFT,
      orderDate: new Date(),
      expectedDeliveryDate: new Date(Date.now() + rule.leadTimeDays * 24 * 60 * 60 * 1000),
      lineItems: [lineItem],
      subtotal: lineItem.totalCost,
      tax: 0, // Calculate based on location and supplier
      shipping: 0, // Calculate based on supplier terms
      total: lineItem.totalCost,
      currency: rule.currency,
      notes: `Auto-generated reorder for ${product.name}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Calculate tax and shipping
    purchaseOrder.tax = await this.calculateTax(purchaseOrder);
    purchaseOrder.shipping = await this.calculateShipping(purchaseOrder);
    purchaseOrder.total = purchaseOrder.subtotal + purchaseOrder.tax + purchaseOrder.shipping;
    
    await this.purchaseOrderRepository.save(purchaseOrder);
    
    return purchaseOrder;
  }
  
  async receivePurchaseOrder(poId: string, receivedItems: ReceivedItem[]): Promise<void> {
    const purchaseOrder = await this.purchaseOrderRepository.findById(poId);
    if (!purchaseOrder) {
      throw new Error('Purchase order not found');
    }
    
    // Process each received item
    for (const receivedItem of receivedItems) {
      const lineItem = purchaseOrder.lineItems.find(li => li.id === receivedItem.lineItemId);
      if (!lineItem) {
        throw new Error(`Line item not found: ${receivedItem.lineItemId}`);
      }
      
      // Update inventory
      await this.inventoryTracker.updateStock(
        lineItem.productId,
        lineItem.variantId,
        purchaseOrder.locationId,
        receivedItem.quantityReceived,
        StockMovementType.PURCHASE,
        purchaseOrder.poNumber,
        `Received from PO ${purchaseOrder.poNumber}`
      );
      
      // Update line item received quantity
      lineItem.quantityReceived = (lineItem.quantityReceived || 0) + receivedItem.quantityReceived;
    }
    
    // Update PO status
    const allItemsReceived = purchaseOrder.lineItems.every(li => 
      (li.quantityReceived || 0) >= li.quantity
    );
    
    const someItemsReceived = purchaseOrder.lineItems.some(li => 
      (li.quantityReceived || 0) > 0
    );
    
    if (allItemsReceived) {
      purchaseOrder.status = POStatus.RECEIVED;
      purchaseOrder.actualDeliveryDate = new Date();
    } else if (someItemsReceived) {
      purchaseOrder.status = POStatus.PARTIALLY_RECEIVED;
    }
    
    purchaseOrder.updatedAt = new Date();
    await this.purchaseOrderRepository.save(purchaseOrder);
    
    // Send receipt notifications
    await this.sendReceiptNotifications(purchaseOrder, receivedItems);
  }
}
```

### 4. Multi-Location Inventory Management

Handle inventory across multiple locations:

```typescript
class MultiLocationInventoryManager {
  async getAvailableQuantityAcrossLocations(productId: string, variantId?: string): Promise<LocationInventory[]> {
    const inventoryItems = await this.inventoryRepository.findByProduct(productId, variantId);
    
    return inventoryItems.map(item => ({
      locationId: item.locationId,
      locationName: item.location?.name || 'Unknown',
      availableQuantity: item.availableQuantity,
      reservedQuantity: item.reservedQuantity,
      totalQuantity: item.quantity,
      canFulfill: item.location?.canFulfillOrders || false
    }));
  }
  
  async findOptimalFulfillmentLocation(
    productId: string,
    variantId: string | undefined,
    quantity: number,
    shippingAddress: Address
  ): Promise<FulfillmentRecommendation[]> {
    
    // Get all locations with available stock
    const availableLocations = await this.getLocationsWithStock(productId, variantId, quantity);
    
    const recommendations: FulfillmentRecommendation[] = [];
    
    for (const location of availableLocations) {
      // Calculate shipping cost and time
      const shippingInfo = await this.shippingCalculator.calculate(
        location.address,
        shippingAddress,
        { productId, variantId, quantity }
      );
      
      // Calculate fulfillment score
      const score = this.calculateFulfillmentScore(location, shippingInfo);
      
      recommendations.push({
        locationId: location.id,
        locationName: location.name,
        availableQuantity: location.availableQuantity,
        shippingCost: shippingInfo.cost,
        estimatedDeliveryDays: shippingInfo.estimatedDays,
        fulfillmentScore: score,
        canFullyFulfill: location.availableQuantity >= quantity
      });
    }
    
    // Sort by fulfillment score (higher is better)
    return recommendations.sort((a, b) => b.fulfillmentScore - a.fulfillmentScore);
  }
  
  async transferStock(
    productId: string,
    variantId: string | undefined,
    fromLocationId: string,
    toLocationId: string,
    quantity: number,
    reason: string
  ): Promise<StockTransfer> {
    
    // Validate source location has sufficient stock
    const sourceInventory = await this.inventoryTracker.getInventoryItem(productId, variantId, fromLocationId);
    if (!sourceInventory || sourceInventory.availableQuantity < quantity) {
      throw new Error('Insufficient stock at source location');
    }
    
    // Create stock transfer record
    const transfer: StockTransfer = {
      id: this.generateTransferId(),
      productId,
      variantId,
      fromLocationId,
      toLocationId,
      quantity,
      reason,
      status: TransferStatus.PENDING,
      requestedAt: new Date(),
      requestedBy: this.getCurrentUserId()
    };
    
    // Remove stock from source location
    await this.inventoryTracker.updateStock(
      productId,
      variantId,
      fromLocationId,
      -quantity,
      StockMovementType.TRANSFER,
      transfer.id,
      `Transfer to ${toLocationId}: ${reason}`
    );
    
    // Add stock to destination location
    await this.inventoryTracker.updateStock(
      productId,
      variantId,
      toLocationId,
      quantity,
      StockMovementType.TRANSFER,
      transfer.id,
      `Transfer from ${fromLocationId}: ${reason}`
    );
    
    // Update transfer status
    transfer.status = TransferStatus.COMPLETED;
    transfer.completedAt = new Date();
    
    await this.stockTransferRepository.save(transfer);
    
    // Send transfer notifications
    await this.sendTransferNotifications(transfer);
    
    return transfer;
  }
  
  private calculateFulfillmentScore(location: InventoryLocation, shippingInfo: ShippingInfo): number {
    let score = 0;
    
    // Priority weight (higher priority = higher score)
    score += location.fulfillmentPriority * 10;
    
    // Shipping cost weight (lower cost = higher score)
    score += Math.max(0, 100 - shippingInfo.cost);
    
    // Delivery time weight (faster delivery = higher score)
    score += Math.max(0, 50 - shippingInfo.estimatedDays * 5);
    
    // Utilization weight (prefer less utilized locations)
    score += Math.max(0, 100 - location.currentUtilization);
    
    return score;
  }
}
```

### 5. Inventory Analytics and Reporting

Implement comprehensive inventory analytics:

```typescript
interface InventoryAnalytics {
  calculateTurnoverRate(productId: string, variantId?: string, periodDays: number = 365): Promise<number>;
  getStockoutFrequency(locationId?: string, periodDays: number = 90): Promise<StockoutReport>;
  calculateCarryingCosts(locationId?: string): Promise<CarryingCostReport>;
  getSlowMovingStock(thresholdDays: number = 90): Promise<SlowMovingItem[]>;
  generateABCAnalysis(locationId?: string): Promise<ABCAnalysisResult>;
  getForecastAccuracy(periodDays: number = 30): Promise<ForecastAccuracyReport>;
}

interface StockoutReport {
  totalStockouts: number;
  stockoutsByProduct: ProductStockout[];
  averageStockoutDuration: number;
  stockoutCost: number;
}

interface CarryingCostReport {
  totalInventoryValue: number;
  carryingCostPercentage: number;
  totalCarryingCost: number;
  costByCategory: CategoryCarryingCost[];
}

interface ABCAnalysisResult {
  aItems: InventoryItem[]; // High value, high turnover
  bItems: InventoryItem[]; // Medium value, medium turnover
  cItems: InventoryItem[]; // Low value, low turnover
  analysis: {
    aItemsPercentage: number;
    bItemsPercentage: number;
    cItemsPercentage: number;
    aItemsValuePercentage: number;
    bItemsValuePercentage: number;
    cItemsValuePercentage: number;
  };
}

class InventoryAnalyticsEngine {
  async calculateTurnoverRate(productId: string, variantId?: string, periodDays: number = 365): Promise<number> {
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - periodDays * 24 * 60 * 60 * 1000);
    
    // Get sales quantity for the period
    const salesQuantity = await this.getSalesQuantity(productId, variantId, startDate, endDate);
    
    // Get average inventory for the period
    const averageInventory = await this.getAverageInventory(productId, variantId, startDate, endDate);
    
    if (averageInventory === 0) {
      return 0;
    }
    
    // Calculate turnover rate (annualized)
    const turnoverRate = (salesQuantity / averageInventory) * (365 / periodDays);
    
    return Math.round(turnoverRate * 100) / 100; // Round to 2 decimal places
  }
  
  async getSlowMovingStock(thresholdDays: number = 90): Promise<SlowMovingItem[]> {
    const cutoffDate = new Date(Date.now() - thresholdDays * 24 * 60 * 60 * 1000);
    
    const slowMovingItems = await this.inventoryRepository.findSlowMoving(cutoffDate);
    
    return slowMovingItems.map(item => ({
      productId: item.productId,
      variantId: item.variantId,
      sku: item.sku,
      quantity: item.quantity,
      value: item.totalValue,
      daysSinceLastSale: this.calculateDaysSinceLastSale(item),
      recommendedAction: this.getRecommendedAction(item, thresholdDays)
    }));
  }
  
  async generateABCAnalysis(locationId?: string): Promise<ABCAnalysisResult> {
    // Get all inventory items with sales data
    const inventoryItems = await this.getInventoryWithSalesData(locationId);
    
    // Calculate annual sales value for each item
    const itemsWithValue = inventoryItems.map(item => ({
      ...item,
      annualSalesValue: item.annualSalesQuantity * item.averageCost
    }));
    
    // Sort by annual sales value (descending)
    itemsWithValue.sort((a, b) => b.annualSalesValue - a.annualSalesValue);
    
    // Calculate cumulative percentages
    const totalValue = itemsWithValue.reduce((sum, item) => sum + item.annualSalesValue, 0);
    let cumulativeValue = 0;
    
    const aItems: InventoryItem[] = [];
    const bItems: InventoryItem[] = [];
    const cItems: InventoryItem[] = [];
    
    for (const item of itemsWithValue) {
      cumulativeValue += item.annualSalesValue;
      const cumulativePercentage = (cumulativeValue / totalValue) * 100;
      
      if (cumulativePercentage <= 80) {
        aItems.push(item);
      } else if (cumulativePercentage <= 95) {
        bItems.push(item);
      } else {
        cItems.push(item);
      }
    }
    
    // Calculate analysis metrics
    const totalItems = itemsWithValue.length;
    const aValue = aItems.reduce((sum, item) => sum + item.annualSalesValue, 0);
    const bValue = bItems.reduce((sum, item) => sum + item.annualSalesValue, 0);
    const cValue = cItems.reduce((sum, item) => sum + item.annualSalesValue, 0);
    
    return {
      aItems,
      bItems,
      cItems,
      analysis: {
        aItemsPercentage: Math.round((aItems.length / totalItems) * 100),
        bItemsPercentage: Math.round((bItems.length / totalItems) * 100),
        cItemsPercentage: Math.round((cItems.length / totalItems) * 100),
        aItemsValuePercentage: Math.round((aValue / totalValue) * 100),
        bItemsValuePercentage: Math.round((bValue / totalValue) * 100),
        cItemsValuePercentage: Math.round((cValue / totalValue) * 100)
      }
    };
  }
  
  async generateInventoryReport(locationId?: string, includeForecasts: boolean = false): Promise<InventoryReport> {
    const report: InventoryReport = {
      generatedAt: new Date(),
      locationId,
      summary: await this.generateInventorySummary(locationId),
      turnoverAnalysis: await this.generateTurnoverAnalysis(locationId),
      stockoutAnalysis: await this.getStockoutFrequency(locationId),
      carryingCosts: await this.calculateCarryingCosts(locationId),
      slowMovingStock: await this.getSlowMovingStock(),
      abcAnalysis: await this.generateABCAnalysis(locationId)
    };
    
    if (includeForecasts) {
      report.forecastAccuracy = await this.getForecastAccuracy();
      report.demandForecasts = await this.generateDemandForecasts(locationId);
    }
    
    return report;
  }
}
```

## Implementation Checklist

### Core Inventory Tracking
- [ ] Implement inventory data model with multi-location support
- [ ] Build real-time stock tracking system
- [ ] Create stock movement audit trail
- [ ] Set up inventory reservations and releases
- [ ] Implement stock level validations

### Automated Reordering
- [ ] Design reorder rule engine
- [ ] Build automated purchase order generation
- [ ] Implement supplier integration
- [ ] Create approval workflows
- [ ] Set up seasonal adjustment calculations

### Multi-Location Management
- [ ] Build location-based inventory tracking
- [ ] Implement stock transfer functionality
- [ ] Create optimal fulfillment location selection
- [ ] Set up location-specific settings and rules
- [ ] Build location performance analytics

### Analytics and Reporting
- [ ] Implement inventory turnover calculations
- [ ] Build ABC analysis functionality
- [ ] Create slow-moving stock identification
- [ ] Set up stockout frequency tracking
- [ ] Build comprehensive inventory reporting

### Integration Points
- [ ] Integrate with product catalog system
- [ ] Connect to order management system
- [ ] Set up supplier and purchase order management
- [ ] Integrate with shipping and fulfillment
- [ ] Connect to analytics and reporting systems

## Configuration Parameters

```yaml
inventory_management:
  default_reorder_point: 10
  default_reorder_quantity: 50
  default_max_stock_level: 200
  reservation_expiry_minutes: 30
  
  analytics:
    turnover_calculation_days: 365
    slow_moving_threshold_days: 90
    abc_analysis_periods: 12
    
  automation:
    enable_auto_reorder: true
    require_approval_threshold: 1000
    max_auto_order_value: 5000
    
  alerts:
    low_stock_enabled: true
    stockout_enabled: true
    overstock_enabled: true
    slow_moving_enabled: true
```

## Integration Points

- **Product Catalog**: Product and variant information
- **Order Management**: Stock reservations and allocations
- **Purchase Orders**: Supplier management and receiving
- **Shipping**: Fulfillment location optimization
- **Analytics**: Inventory performance and forecasting
- **Notifications**: Stock alerts and reorder notifications

## Success Metrics

- Inventory accuracy: >99%
- Stockout frequency: <2% of SKUs per month
- Inventory turnover rate: Industry benchmark +10%
- Carrying cost reduction: 15% year-over-year
- Order fulfillment rate: >98%
- Reorder automation rate: >80%

## Common Pitfalls to Avoid

1. **Inaccurate stock tracking**: Implement proper audit trails and validation
2. **Poor reorder point calculation**: Use historical data and lead times
3. **Ignoring seasonal patterns**: Adjust reorder rules for seasonality
4. **Inadequate reservation management**: Implement proper expiration handling
5. **Missing multi-location optimization**: Consider shipping costs and times
6. **Poor supplier integration**: Automate purchase order processes
7. **Lack of analytics**: Implement comprehensive reporting and insights

## Related Templates

- `product-catalog.md` - Product and variant management
- `order-management.md` - Order processing and fulfillment
- `supplier-management.md` - Supplier relationships and purchasing
- `shipping-fulfillment.md` - Order fulfillment and shipping
- `analytics-dashboard.md` - Inventory analytics and reporting