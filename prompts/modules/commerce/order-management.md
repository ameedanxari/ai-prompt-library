# Order Management and Fulfillment Tracking

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
Generate comprehensive order management systems that handle the complete order lifecycle from creation to delivery, including inventory allocation, fulfillment tracking, returns processing, subscription management, and customer communication.

## Instructions
1. Analyze order management requirements and fulfillment workflows
2. Design order lifecycle management with status tracking
3. Implement inventory allocation and warehouse management
4. Create fulfillment automation (picking, packing, shipping)
5. Build order tracking and delivery notifications
6. Add subscription and recurring order management
7. Include returns and refunds processing system
8. Implement order analytics and performance metrics
9. Create customer communication and notification systems
10. Add order modification and cancellation capabilities

## Examples

### Example 1: Order Lifecycle Management
```typescript
// Complete order processing with status tracking
class OrderService {
  async processOrder(orderData: CreateOrderRequest): Promise<Order> {
    const order = await this.createOrder({
      ...orderData,
      status: 'pending_payment',
      timeline: [{ type: 'created', timestamp: new Date() }]
    });
    
    // Process payment and confirm order
    const paymentResult = await this.paymentService.processPayment(order);
    if (paymentResult.success) {
      await this.confirmOrder(order.id, paymentResult);
      await this.allocateInventory(order.id);
      await this.startFulfillment(order.id);
    }
    
    return order;
  }
}
```

### Example 2: Subscription Order Management
```typescript
// Recurring subscription order processing
class SubscriptionService {
  async createSubscription(data: SubscriptionData): Promise<Subscription> {
    const subscription = await this.createSubscriptionRecord({
      customerId: data.customerId,
      frequency: data.frequency,
      nextOrderDate: this.calculateNextOrderDate(data.frequency),
      items: data.items
    });
    
    await this.scheduleRecurringOrder(subscription);
    return subscription;
  }
  
  async processRecurringOrder(subscriptionId: string): Promise<Order> {
    const subscription = await this.getSubscription(subscriptionId);
    const order = await this.orderService.createOrder({
      ...subscription.orderTemplate,
      metadata: { isRecurring: true, subscriptionId }
    });
    
    return order;
  }
}
```

### Example 3: Fulfillment Automation
```typescript
// Automated fulfillment workflow
class FulfillmentService {
  async processFulfillment(orderId: string): Promise<FulfillmentResult> {
    const order = await this.orderService.getOrder(orderId);
    
    // Create picking task
    const pickingTask = await this.createPickingTask(order);
    await this.assignToWarehouseWorker(pickingTask);
    
    // Generate shipping label
    const shippingLabel = await this.generateShippingLabel(order);
    
    // Create shipment tracking
    const shipment = await this.createShipment({
      orderId: order.id,
      trackingNumber: shippingLabel.trackingNumber,
      carrier: order.shippingMethod.carrier
    });
    
    return { pickingTask, shippingLabel, shipment };
  }
}
```

## Variables
| Variable | Type | Description | Default | Required |
|----------|------|-------------|---------|----------|
| orderId | string | Unique order identifier | - | Yes |
| fulfillmentMethod | string | Fulfillment approach | 'standard' | No |
| inventoryTracking | boolean | Enable inventory allocation | true | No |
| subscriptionSupport | boolean | Support recurring orders | false | No |
| multiWarehouse | boolean | Multiple warehouse support | false | No |
| trackingNotifications | boolean | Send tracking updates | true | No |
| returnsProcessing | boolean | Enable returns management | true | No |
| orderModification | boolean | Allow order modifications | false | No |
| analyticsTracking | boolean | Enable order analytics | true | No |
| automatedFulfillment | boolean | Automate fulfillment workflow | false | No |

## Expected Output
A complete order management system featuring:
- End-to-end order lifecycle management with status tracking
- Automated inventory allocation and warehouse management
- Fulfillment workflow automation (picking, packing, shipping)
- Real-time order tracking with customer notifications
- Subscription and recurring order management
- Returns and refunds processing system
- Order modification and cancellation capabilities
- Comprehensive order analytics and reporting
- Multi-warehouse and multi-carrier support
- Customer communication and notification systems

## Overview
Comprehensive order management system handling the complete order lifecycle from creation to delivery, including inventory allocation, fulfillment tracking, returns processing, and customer communication.

## Core Order Architecture

### Order Data Models

```typescript
interface Order {
  id: string;
  orderNumber: string;
  customerId?: string;
  customerInfo: CustomerInfo;
  status: OrderStatus;
  items: OrderItem[];
  shippingAddress: Address;
  billingAddress: Address;
  shippingMethod: ShippingMethod;
  paymentInfo: PaymentInfo;
  pricing: OrderPricing;
  fulfillment: FulfillmentInfo;
  timeline: OrderEvent[];
  subscriptionInfo?: SubscriptionInfo;
  recurringSchedule?: RecurringSchedule;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

interface SubscriptionInfo {
  id: string;
  planId: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  interval: number;
  nextOrderDate: Date;
  totalOrders: number;
  maxOrders?: number;
  status: 'active' | 'paused' | 'cancelled';
  pausedUntil?: Date;
  cancellationReason?: string;
}

interface RecurringSchedule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  interval: number;
  dayOfWeek?: number;
  dayOfMonth?: number;
  nextExecutionDate: Date;
  lastExecutionDate?: Date;
  isActive: boolean;
}

type OrderStatus = 
  | 'pending_payment'
  | 'payment_failed' 
  | 'confirmed'
  | 'processing'
  | 'partially_fulfilled'
  | 'fulfilled'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded'
  | 'returned'
  | 'subscription_active'
  | 'subscription_paused'
  | 'subscription_cancelled';

interface OrderItem {
  id: string;
  productId: string;
  variantId?: string;
  sku: string;
  name: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  weight?: number;
  dimensions?: Dimensions;
  fulfillmentStatus: FulfillmentStatus;
  trackingInfo?: TrackingInfo;
  customizations?: Record<string, any>;
}

type FulfillmentStatus = 
  | 'pending'
  | 'allocated'
  | 'picked'
  | 'packed'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'returned';

interface FulfillmentInfo {
  warehouseId?: string;
  fulfillmentMethod: 'standard' | 'dropship' | 'digital' | 'pickup';
  allocatedAt?: Date;
  pickedAt?: Date;
  packedAt?: Date;
  shippedAt?: Date;
  deliveredAt?: Date;
  trackingNumber?: string;
  carrier?: string;
  estimatedDelivery?: Date;
  actualDelivery?: Date;
}

interface OrderPricing {
  subtotal: number;
  tax: number;
  shipping: number;
  discounts: number;
  total: number;
  currency: string;
  taxBreakdown: TaxBreakdown[];
  discountBreakdown: DiscountBreakdown[];
}

interface OrderEvent {
  id: string;
  type: OrderEventType;
  description: string;
  data?: any;
  timestamp: Date;
  userId?: string;
  automated: boolean;
}

type OrderEventType = 
  | 'created'
  | 'payment_processed'
  | 'confirmed'
  | 'inventory_allocated'
  | 'fulfillment_started'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded'
  | 'returned'
  | 'note_added';
```

### Order Service Implementation

```typescript
class OrderService {
  private orderRepository: OrderRepository;
  private inventoryService: InventoryService;
  private fulfillmentService: FulfillmentService;
  private paymentService: PaymentService;
  private notificationService: NotificationService;

  async createOrder(orderData: CreateOrderRequest): Promise<Order> {
    const orderNumber = await this.generateOrderNumber();
    
    const order: Order = {
      id: generateId(),
      orderNumber,
      customerId: orderData.customerId,
      customerInfo: orderData.customerInfo,
      status: 'pending_payment',
      items: await this.processOrderItems(orderData.items),
      shippingAddress: orderData.shippingAddress,
      billingAddress: orderData.billingAddress,
      shippingMethod: orderData.shippingMethod,
      paymentInfo: orderData.paymentInfo,
      pricing: orderData.pricing,
      fulfillment: {
        fulfillmentMethod: this.determineFulfillmentMethod(orderData.items),
        warehouseId: await this.selectOptimalWarehouse(orderData.shippingAddress, orderData.items)
      },
      timeline: [{
        id: generateId(),
        type: 'created',
        description: 'Order created',
        timestamp: new Date(),
        automated: true
      }],
      metadata: orderData.metadata || {},
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const savedOrder = await this.orderRepository.save(order);
    
    // Trigger order processing workflow
    await this.processNewOrder(savedOrder);
    
    return savedOrder;
  }

  async confirmOrder(orderId: string, paymentResult: PaymentResult): Promise<Order> {
    const order = await this.getOrder(orderId);
    
    if (order.status !== 'pending_payment') {
      throw new Error('Order cannot be confirmed in current status');
    }

    // Update payment information
    order.paymentInfo.transactionId = paymentResult.transactionId;
    order.paymentInfo.status = 'completed';
    order.status = 'confirmed';
    
    // Add timeline event
    order.timeline.push({
      id: generateId(),
      type: 'payment_processed',
      description: 'Payment processed successfully',
      data: { transactionId: paymentResult.transactionId },
      timestamp: new Date(),
      automated: true
    });

    order.updatedAt = new Date();
    const confirmedOrder = await this.orderRepository.save(order);

    // Start fulfillment process
    await this.startFulfillmentProcess(confirmedOrder);
    
    // Send confirmation email
    await this.notificationService.sendOrderConfirmation(confirmedOrder);
    
    return confirmedOrder;
  }

  async updateOrderStatus(orderId: string, newStatus: OrderStatus, note?: string): Promise<Order> {
    const order = await this.getOrder(orderId);
    const previousStatus = order.status;
    
    // Validate status transition
    this.validateStatusTransition(previousStatus, newStatus);
    
    order.status = newStatus;
    order.timeline.push({
      id: generateId(),
      type: this.getEventTypeForStatus(newStatus),
      description: note || `Order status changed to ${newStatus}`,
      timestamp: new Date(),
      automated: !note
    });

    order.updatedAt = new Date();
    const updatedOrder = await this.orderRepository.save(order);

    // Handle status-specific actions
    await this.handleStatusChange(updatedOrder, previousStatus, newStatus);
    
    return updatedOrder;
  }

  async allocateInventory(orderId: string): Promise<Order> {
    const order = await this.getOrder(orderId);
    
    if (order.status !== 'confirmed') {
      throw new Error('Can only allocate inventory for confirmed orders');
    }

    const allocationResults = await Promise.all(
      order.items.map(item => 
        this.inventoryService.allocateInventory({
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
          warehouseId: order.fulfillment.warehouseId,
          orderId: order.id
        })
      )
    );

    // Check if all items were successfully allocated
    const failedAllocations = allocationResults.filter(result => !result.success);
    
    if (failedAllocations.length > 0) {
      // Handle partial allocation
      await this.handlePartialAllocation(order, allocationResults);
    } else {
      // All items allocated successfully
      order.status = 'processing';
      order.fulfillment.allocatedAt = new Date();
      
      order.timeline.push({
        id: generateId(),
        type: 'inventory_allocated',
        description: 'Inventory allocated for all items',
        timestamp: new Date(),
        automated: true
      });
    }

    order.updatedAt = new Date();
    return await this.orderRepository.save(order);
  }

  async startFulfillmentProcess(order: Order): Promise<void> {
    switch (order.fulfillment.fulfillmentMethod) {
      case 'standard':
        await this.fulfillmentService.createPickingTask(order);
        break;
      case 'dropship':
        await this.fulfillmentService.notifyDropshipVendor(order);
        break;
      case 'digital':
        await this.fulfillmentService.deliverDigitalProducts(order);
        break;
      case 'pickup':
        await this.fulfillmentService.prepareForPickup(order);
        break;
    }
  }

  private async processOrderItems(items: CreateOrderItem[]): Promise<OrderItem[]> {
    return await Promise.all(
      items.map(async (item) => {
        const product = await this.productService.getProduct(item.productId);
        const variant = item.variantId ? 
          await this.productService.getVariant(item.variantId) : null;

        return {
          id: generateId(),
          productId: item.productId,
          variantId: item.variantId,
          sku: variant?.sku || product.sku,
          name: variant?.name || product.name,
          description: product.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.quantity * item.unitPrice,
          weight: variant?.weight || product.weight,
          dimensions: variant?.dimensions || product.dimensions,
          fulfillmentStatus: 'pending',
          customizations: item.customizations
        };
      })
    );
  }
}
```

## Fulfillment Management

### Fulfillment Service Implementation

```typescript
class FulfillmentService {
  private warehouseService: WarehouseService;
  private shippingService: ShippingService;
  private inventoryService: InventoryService;

  async createPickingTask(order: Order): Promise<PickingTask> {
    const warehouse = await this.warehouseService.getWarehouse(order.fulfillment.warehouseId!);
    
    const pickingTask: PickingTask = {
      id: generateId(),
      orderId: order.id,
      warehouseId: warehouse.id,
      status: 'pending',
      priority: this.calculatePriority(order),
      items: order.items.map(item => ({
        orderItemId: item.id,
        productId: item.productId,
        variantId: item.variantId,
        sku: item.sku,
        quantity: item.quantity,
        location: warehouse.getItemLocation(item.sku),
        picked: false
      })),
      assignedTo: null,
      createdAt: new Date(),
      dueDate: this.calculateDueDate(order.shippingMethod)
    };

    const savedTask = await this.pickingTaskRepository.save(pickingTask);
    
    // Assign to available picker
    await this.assignPickingTask(savedTask.id);
    
    return savedTask;
  }

  async updatePickingProgress(taskId: string, itemId: string, picked: boolean): Promise<PickingTask> {
    const task = await this.getPickingTask(taskId);
    const item = task.items.find(i => i.orderItemId === itemId);
    
    if (!item) {
      throw new Error('Item not found in picking task');
    }

    item.picked = picked;
    item.pickedAt = picked ? new Date() : undefined;
    
    // Check if all items are picked
    const allPicked = task.items.every(i => i.picked);
    
    if (allPicked) {
      task.status = 'completed';
      task.completedAt = new Date();
      
      // Move to packing stage
      await this.createPackingTask(task.orderId);
    }

    return await this.pickingTaskRepository.save(task);
  }

  async createPackingTask(orderId: string): Promise<PackingTask> {
    const order = await this.orderService.getOrder(orderId);
    
    const packingTask: PackingTask = {
      id: generateId(),
      orderId,
      status: 'pending',
      items: order.items,
      packingInstructions: await this.generatePackingInstructions(order),
      shippingLabel: null,
      trackingNumber: null,
      assignedTo: null,
      createdAt: new Date()
    };

    const savedTask = await this.packingTaskRepository.save(packingTask);
    
    // Generate shipping label
    await this.generateShippingLabel(savedTask);
    
    return savedTask;
  }

  async completePackingTask(taskId: string, packageInfo: PackageInfo): Promise<PackingTask> {
    const task = await this.getPackingTask(taskId);
    
    task.status = 'completed';
    task.completedAt = new Date();
    task.packageInfo = packageInfo;
    
    const completedTask = await this.packingTaskRepository.save(task);
    
    // Create shipment
    await this.createShipment(completedTask);
    
    return completedTask;
  }

  async createShipment(packingTask: PackingTask): Promise<Shipment> {
    const order = await this.orderService.getOrder(packingTask.orderId);
    
    const shipment: Shipment = {
      id: generateId(),
      orderId: order.id,
      trackingNumber: packingTask.trackingNumber!,
      carrier: order.shippingMethod.carrier,
      service: order.shippingMethod.name,
      status: 'created',
      items: packingTask.items,
      packageInfo: packingTask.packageInfo!,
      shippingAddress: order.shippingAddress,
      estimatedDelivery: this.calculateEstimatedDelivery(order.shippingMethod),
      createdAt: new Date()
    };

    const savedShipment = await this.shipmentRepository.save(shipment);
    
    // Update order status
    await this.orderService.updateOrderStatus(order.id, 'shipped');
    
    // Send shipping notification
    await this.notificationService.sendShippingNotification(order, savedShipment);
    
    return savedShipment;
  }

  private async generatePackingInstructions(order: Order): Promise<PackingInstructions> {
    const instructions: PackingInstructions = {
      fragileItems: order.items.filter(item => item.metadata?.fragile),
      specialHandling: order.items.filter(item => item.metadata?.specialHandling),
      giftWrapping: order.metadata.giftWrapping || false,
      giftMessage: order.metadata.giftMessage,
      packingMaterials: await this.selectPackingMaterials(order.items),
      insuranceRequired: order.pricing.total > 100
    };

    return instructions;
  }
}
```

## Tracking and Notifications

### Order Tracking Service

```typescript
class OrderTrackingService {
  private carrierAPIs: Map<string, CarrierAPI> = new Map();

  constructor() {
    this.carrierAPIs.set('ups', new UPSTrackingAPI());
    this.carrierAPIs.set('fedex', new FedExTrackingAPI());
    this.carrierAPIs.set('usps', new USPSTrackingAPI());
    this.carrierAPIs.set('dhl', new DHLTrackingAPI());
  }

  async updateTrackingInfo(shipmentId: string): Promise<TrackingInfo> {
    const shipment = await this.getShipment(shipmentId);
    const carrierAPI = this.carrierAPIs.get(shipment.carrier.toLowerCase());
    
    if (!carrierAPI) {
      throw new Error(`Tracking not supported for carrier: ${shipment.carrier}`);
    }

    const trackingInfo = await carrierAPI.getTrackingInfo(shipment.trackingNumber);
    
    // Update shipment status
    shipment.status = this.mapCarrierStatusToShipmentStatus(trackingInfo.status);
    shipment.trackingEvents = trackingInfo.events;
    shipment.estimatedDelivery = trackingInfo.estimatedDelivery;
    
    if (trackingInfo.status === 'delivered') {
      shipment.deliveredAt = trackingInfo.deliveredAt;
      await this.orderService.updateOrderStatus(shipment.orderId, 'delivered');
    }

    await this.shipmentRepository.save(shipment);
    
    return trackingInfo;
  }

  async getOrderTrackingInfo(orderId: string): Promise<OrderTrackingInfo> {
    const order = await this.orderService.getOrder(orderId);
    const shipments = await this.getOrderShipments(orderId);
    
    const trackingInfo: OrderTrackingInfo = {
      orderId,
      orderNumber: order.orderNumber,
      status: order.status,
      estimatedDelivery: this.calculateOverallEstimatedDelivery(shipments),
      shipments: await Promise.all(
        shipments.map(async (shipment) => ({
          id: shipment.id,
          trackingNumber: shipment.trackingNumber,
          carrier: shipment.carrier,
          status: shipment.status,
          items: shipment.items,
          trackingEvents: shipment.trackingEvents || [],
          estimatedDelivery: shipment.estimatedDelivery,
          deliveredAt: shipment.deliveredAt
        }))
      ),
      timeline: order.timeline
    };

    return trackingInfo;
  }

  async setupTrackingNotifications(orderId: string, preferences: NotificationPreferences): Promise<void> {
    const order = await this.orderService.getOrder(orderId);
    const shipments = await this.getOrderShipments(orderId);

    for (const shipment of shipments) {
      if (preferences.sms) {
        await this.notificationService.setupSMSTracking(shipment, order.customerInfo.phone);
      }
      
      if (preferences.email) {
        await this.notificationService.setupEmailTracking(shipment, order.customerInfo.email);
      }
      
      if (preferences.push) {
        await this.notificationService.setupPushTracking(shipment, order.customerId);
      }
    }
  }
}
```

### Notification Service

```typescript
class OrderNotificationService {
  async sendOrderConfirmation(order: Order): Promise<void> {
    const template = 'order-confirmation';
    const data = {
      order,
      customer: order.customerInfo,
      items: order.items,
      trackingUrl: `${process.env.APP_URL}/orders/${order.id}/tracking`
    };

    await Promise.all([
      this.emailService.send({
        to: order.customerInfo.email,
        template,
        data
      }),
      order.customerId ? this.pushNotificationService.send({
        userId: order.customerId,
        title: 'Order Confirmed',
        body: `Your order #${order.orderNumber} has been confirmed`,
        data: { orderId: order.id }
      }) : Promise.resolve()
    ]);
  }

  async sendShippingNotification(order: Order, shipment: Shipment): Promise<void> {
    const template = 'order-shipped';
    const data = {
      order,
      shipment,
      trackingUrl: `${process.env.APP_URL}/orders/${order.id}/tracking`
    };

    await Promise.all([
      this.emailService.send({
        to: order.customerInfo.email,
        template,
        data
      }),
      order.customerInfo.phone ? this.smsService.send({
        to: order.customerInfo.phone,
        message: `Your order #${order.orderNumber} has shipped! Track it: ${data.trackingUrl}`
      }) : Promise.resolve(),
      order.customerId ? this.pushNotificationService.send({
        userId: order.customerId,
        title: 'Order Shipped',
        body: `Your order #${order.orderNumber} is on its way`,
        data: { orderId: order.id, trackingNumber: shipment.trackingNumber }
      }) : Promise.resolve()
    ]);
  }

  async sendDeliveryNotification(order: Order): Promise<void> {
    const template = 'order-delivered';
    const data = {
      order,
      reviewUrl: `${process.env.APP_URL}/orders/${order.id}/review`
    };

    await Promise.all([
      this.emailService.send({
        to: order.customerInfo.email,
        template,
        data
      }),
      order.customerId ? this.pushNotificationService.send({
        userId: order.customerId,
        title: 'Order Delivered',
        body: `Your order #${order.orderNumber} has been delivered`,
        data: { orderId: order.id }
      }) : Promise.resolve()
    ]);

    // Schedule review request
    await this.scheduleReviewRequest(order);
  }

  private async scheduleReviewRequest(order: Order): Promise<void> {
    await this.emailScheduler.schedule({
      delay: '3 days',
      template: 'review-request',
      to: order.customerInfo.email,
      data: {
        order,
        reviewUrl: `${process.env.APP_URL}/orders/${order.id}/review`
      }
    });
  }
}
```

## Subscription and Recurring Order Management

### Subscription Order Service

```typescript
class SubscriptionOrderService {
  private subscriptionRepository: SubscriptionRepository;
  private orderService: OrderService;
  private paymentService: PaymentService;
  private notificationService: NotificationService;

  async createSubscriptionOrder(subscriptionData: CreateSubscriptionData): Promise<Order> {
    const subscriptionInfo: SubscriptionInfo = {
      id: generateId(),
      planId: subscriptionData.planId,
      frequency: subscriptionData.frequency,
      interval: subscriptionData.interval,
      nextOrderDate: this.calculateNextOrderDate(subscriptionData.frequency, subscriptionData.interval),
      totalOrders: 0,
      maxOrders: subscriptionData.maxOrders,
      status: 'active'
    };

    const recurringSchedule: RecurringSchedule = {
      frequency: subscriptionData.frequency,
      interval: subscriptionData.interval,
      dayOfWeek: subscriptionData.dayOfWeek,
      dayOfMonth: subscriptionData.dayOfMonth,
      nextExecutionDate: subscriptionInfo.nextOrderDate,
      isActive: true
    };

    // Create initial order with subscription info
    const order = await this.orderService.createOrder({
      ...subscriptionData.orderData,
      subscriptionInfo,
      recurringSchedule,
      metadata: {
        ...subscriptionData.orderData.metadata,
        isSubscription: true,
        subscriptionId: subscriptionInfo.id
      }
    });

    // Schedule recurring orders
    await this.scheduleRecurringOrders(order);

    return order;
  }

  async processRecurringOrder(subscriptionId: string): Promise<Order> {
    const subscription = await this.getSubscription(subscriptionId);
    const originalOrder = await this.getOriginalSubscriptionOrder(subscriptionId);

    if (subscription.status !== 'active') {
      throw new Error('Subscription is not active');
    }

    // Create new order based on original
    const recurringOrder = await this.orderService.createOrder({
      customerId: originalOrder.customerId,
      customerInfo: originalOrder.customerInfo,
      items: originalOrder.items,
      shippingAddress: originalOrder.shippingAddress,
      billingAddress: originalOrder.billingAddress,
      shippingMethod: originalOrder.shippingMethod,
      paymentInfo: originalOrder.paymentInfo,
      subscriptionInfo: {
        ...subscription,
        totalOrders: subscription.totalOrders + 1
      },
      recurringSchedule: originalOrder.recurringSchedule,
      metadata: {
        ...originalOrder.metadata,
        isRecurringOrder: true,
        originalOrderId: originalOrder.id,
        subscriptionOrderNumber: subscription.totalOrders + 1
      }
    });

    // Update subscription
    subscription.totalOrders += 1;
    subscription.nextOrderDate = this.calculateNextOrderDate(
      subscription.frequency, 
      subscription.interval,
      new Date()
    );

    // Check if subscription should end
    if (subscription.maxOrders && subscription.totalOrders >= subscription.maxOrders) {
      subscription.status = 'cancelled';
      subscription.cancellationReason = 'Maximum orders reached';
    }

    await this.subscriptionRepository.save(subscription);

    // Schedule next recurring order if still active
    if (subscription.status === 'active') {
      await this.scheduleNextRecurringOrder(subscription);
    }

    return recurringOrder;
  }

  async pauseSubscription(subscriptionId: string, pauseUntil?: Date): Promise<SubscriptionInfo> {
    const subscription = await this.getSubscription(subscriptionId);
    
    subscription.status = 'paused';
    subscription.pausedUntil = pauseUntil || addMonths(new Date(), 1);
    
    // Cancel scheduled recurring orders
    await this.cancelScheduledOrders(subscriptionId);
    
    await this.subscriptionRepository.save(subscription);
    
    // Send pause notification
    await this.notificationService.sendSubscriptionPausedNotification(subscription);
    
    return subscription;
  }

  async resumeSubscription(subscriptionId: string): Promise<SubscriptionInfo> {
    const subscription = await this.getSubscription(subscriptionId);
    
    if (subscription.status !== 'paused') {
      throw new Error('Subscription is not paused');
    }

    subscription.status = 'active';
    subscription.pausedUntil = undefined;
    subscription.nextOrderDate = this.calculateNextOrderDate(
      subscription.frequency,
      subscription.interval,
      new Date()
    );
    
    await this.subscriptionRepository.save(subscription);
    
    // Reschedule recurring orders
    await this.scheduleNextRecurringOrder(subscription);
    
    // Send resume notification
    await this.notificationService.sendSubscriptionResumedNotification(subscription);
    
    return subscription;
  }

  async cancelSubscription(subscriptionId: string, reason: string): Promise<SubscriptionInfo> {
    const subscription = await this.getSubscription(subscriptionId);
    
    subscription.status = 'cancelled';
    subscription.cancellationReason = reason;
    
    // Cancel all scheduled recurring orders
    await this.cancelScheduledOrders(subscriptionId);
    
    await this.subscriptionRepository.save(subscription);
    
    // Send cancellation notification
    await this.notificationService.sendSubscriptionCancelledNotification(subscription);
    
    return subscription;
  }

  private calculateNextOrderDate(frequency: string, interval: number, fromDate = new Date()): Date {
    switch (frequency) {
      case 'daily':
        return addDays(fromDate, interval);
      case 'weekly':
        return addWeeks(fromDate, interval);
      case 'monthly':
        return addMonths(fromDate, interval);
      case 'quarterly':
        return addMonths(fromDate, interval * 3);
      case 'yearly':
        return addYears(fromDate, interval);
      default:
        throw new Error(`Unsupported frequency: ${frequency}`);
    }
  }

  private async scheduleRecurringOrders(order: Order): Promise<void> {
    if (!order.subscriptionInfo || !order.recurringSchedule) {
      return;
    }

    await this.orderScheduler.schedule({
      subscriptionId: order.subscriptionInfo.id,
      nextExecutionDate: order.subscriptionInfo.nextOrderDate,
      frequency: order.subscriptionInfo.frequency,
      interval: order.subscriptionInfo.interval
    });
  }

  private async scheduleNextRecurringOrder(subscription: SubscriptionInfo): Promise<void> {
    await this.orderScheduler.schedule({
      subscriptionId: subscription.id,
      nextExecutionDate: subscription.nextOrderDate,
      frequency: subscription.frequency,
      interval: subscription.interval
    });
  }
}
```

## Returns and Refunds Management

### Returns Service

```typescript
class ReturnsService {
  async initiateReturn(orderId: string, returnRequest: ReturnRequest): Promise<Return> {
    const order = await this.orderService.getOrder(orderId);
    
    // Validate return eligibility
    await this.validateReturnEligibility(order, returnRequest);
    
    const returnRecord: Return = {
      id: generateId(),
      returnNumber: await this.generateReturnNumber(),
      orderId,
      customerId: order.customerId,
      items: returnRequest.items,
      reason: returnRequest.reason,
      status: 'requested',
      refundAmount: this.calculateRefundAmount(order, returnRequest.items),
      returnMethod: returnRequest.returnMethod || 'ship_back',
      returnAddress: await this.getReturnAddress(order.fulfillment.warehouseId),
      timeline: [{
        id: generateId(),
        type: 'requested',
        description: 'Return requested by customer',
        timestamp: new Date(),
        automated: false
      }],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const savedReturn = await this.returnRepository.save(returnRecord);
    
    // Generate return shipping label if needed
    if (returnRecord.returnMethod === 'ship_back') {
      await this.generateReturnShippingLabel(savedReturn);
    }
    
    // Send return confirmation
    await this.notificationService.sendReturnConfirmation(order, savedReturn);
    
    return savedReturn;
  }

  async processReturnReceived(returnId: string, receivedItems: ReceivedItem[]): Promise<Return> {
    const returnRecord = await this.getReturn(returnId);
    
    returnRecord.status = 'received';
    returnRecord.receivedItems = receivedItems;
    returnRecord.timeline.push({
      id: generateId(),
      type: 'received',
      description: 'Return items received and inspected',
      timestamp: new Date(),
      automated: false
    });

    // Process refund
    const refundAmount = this.calculateActualRefund(returnRecord, receivedItems);
    if (refundAmount > 0) {
      await this.processRefund(returnRecord, refundAmount);
    }

    // Update inventory
    await this.restockReturnedItems(receivedItems);
    
    returnRecord.updatedAt = new Date();
    return await this.returnRepository.save(returnRecord);
  }

  private async processRefund(returnRecord: Return, amount: number): Promise<void> {
    const order = await this.orderService.getOrder(returnRecord.orderId);
    
    const refund = await this.paymentService.processRefund({
      originalTransactionId: order.paymentInfo.transactionId,
      amount,
      reason: `Return for order ${order.orderNumber}`,
      returnId: returnRecord.id
    });

    returnRecord.refundTransactionId = refund.transactionId;
    returnRecord.status = 'refunded';
    returnRecord.timeline.push({
      id: generateId(),
      type: 'refunded',
      description: `Refund of ${amount} processed`,
      data: { refundId: refund.transactionId },
      timestamp: new Date(),
      automated: true
    });

    // Send refund notification
    await this.notificationService.sendRefundNotification(order, returnRecord, refund);
  }
}
```

## Order Analytics and Reporting

### Order Analytics Service

```typescript
class OrderAnalyticsService {
  async getOrderMetrics(timeRange: DateRange): Promise<OrderMetrics> {
    const orders = await this.orderRepository.findByDateRange(timeRange);
    
    return {
      totalOrders: orders.length,
      totalRevenue: orders.reduce((sum, order) => sum + order.pricing.total, 0),
      averageOrderValue: this.calculateAverageOrderValue(orders),
      conversionRate: await this.calculateConversionRate(timeRange),
      fulfillmentMetrics: {
        averageProcessingTime: this.calculateAverageProcessingTime(orders),
        onTimeDeliveryRate: this.calculateOnTimeDeliveryRate(orders),
        returnRate: await this.calculateReturnRate(orders)
      },
      statusDistribution: this.getStatusDistribution(orders),
      topProducts: await this.getTopProducts(orders),
      geographicDistribution: this.getGeographicDistribution(orders)
    };
  }

  async getFulfillmentPerformance(): Promise<FulfillmentPerformance> {
    const last30Days = {
      start: subDays(new Date(), 30),
      end: new Date()
    };

    return {
      averagePickTime: await this.calculateAveragePickTime(last30Days),
      averagePackTime: await this.calculateAveragePackTime(last30Days),
      averageShipTime: await this.calculateAverageShipTime(last30Days),
      warehousePerformance: await this.getWarehousePerformance(last30Days),
      carrierPerformance: await this.getCarrierPerformance(last30Days),
      inventoryTurnover: await this.calculateInventoryTurnover(last30Days)
    };
  }

  async generateOrderReport(reportType: OrderReportType, timeRange: DateRange): Promise<OrderReport> {
    switch (reportType) {
      case 'sales_summary':
        return await this.generateSalesSummaryReport(timeRange);
      case 'fulfillment_analysis':
        return await this.generateFulfillmentAnalysisReport(timeRange);
      case 'customer_analysis':
        return await this.generateCustomerAnalysisReport(timeRange);
      case 'product_performance':
        return await this.generateProductPerformanceReport(timeRange);
      default:
        throw new Error(`Unknown report type: ${reportType}`);
    }
  }
}
```

## Implementation Guidelines

### Performance Optimization
- Implement order caching for frequently accessed orders
- Use database indexing on order number, customer ID, and status
- Implement pagination for order lists and search results
- Use event sourcing for order state changes and audit trails

### Security Considerations
- Validate all order operations against user permissions
- Implement audit logging for all order modifications
- Secure sensitive order data with encryption
- Use secure communication for payment and fulfillment operations

### Scalability Considerations
- Design for horizontal scaling of order processing
- Implement asynchronous processing for non-critical operations
- Use message queues for order workflow coordination
- Design for multi-warehouse and multi-region support

### Testing Strategy
- Unit tests for all order operations and calculations
- Integration tests for order workflow and fulfillment processes
- Load testing for high-volume order processing
- End-to-end testing for complete order lifecycle

### Monitoring and Alerts
- Monitor order processing performance and bottlenecks
- Set up alerts for failed payments and fulfillment issues
- Track order metrics and KPIs in real-time
- Implement order health checks and diagnostics

This comprehensive order management system provides a robust foundation for handling the complete order lifecycle with advanced tracking, fulfillment automation, and customer communication capabilities.
