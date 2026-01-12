# Event-Driven Architecture Template

## Purpose

Provides comprehensive patterns for implementing event sourcing, event streaming, saga patterns, and event choreography. This template covers event-driven design principles, event store implementation, and distributed transaction management for building reactive, loosely-coupled systems.

## Context

Event-driven architecture enables building scalable, resilient systems through asynchronous communication and event-based state management. This template addresses event sourcing, CQRS patterns, saga orchestration, and event streaming while ensuring consistency, reliability, and auditability in distributed systems.

## Core Components

### Event Store

## Examples

```typescript
interface EventStore {
  // Event persistence
  appendEvents(streamId: string, events: DomainEvent[], expectedVersion?: number): Promise<AppendResult>;
  readEvents(streamId: string, fromVersion?: number, toVersion?: number): Promise<DomainEvent[]>;
  readAllEvents(fromPosition?: number, maxCount?: number): Promise<DomainEvent[]>;
  
  // Stream management
  getStreamMetadata(streamId: string): Promise<StreamMetadata>;
  setStreamMetadata(streamId: string, metadata: StreamMetadata): Promise<void>;
  deleteStream(streamId: string, expectedVersion: number): Promise<void>;
  
  // Subscriptions
  subscribeToStream(streamId: string, handler: EventHandler): Promise<Subscription>;
  subscribeToAll(handler: EventHandler, fromPosition?: number): Promise<Subscription>;
}

interface DomainEvent {
  id: string;
  type: string;
  streamId: string;
  version: number;
  timestamp: Date;
  data: any;
  metadata: EventMetadata;
}


interface EventMetadata {
  correlationId: string;
  causationId: string;
  userId?: string;
  timestamp: Date;
  schemaVersion: string;
}

interface StreamMetadata {
  streamId: string;
  version: number;
  createdAt: Date;
  updatedAt: Date;
  customMetadata: Record<string, any>;
}

interface AppendResult {
  success: boolean;
  nextExpectedVersion: number;
  position: number;
}
```

### Event Sourcing Aggregate

```typescript
interface EventSourcedAggregate<TState> {
  // State management
  getState(): TState;
  getVersion(): number;
  getUncommittedEvents(): DomainEvent[];
  
  // Event application
  apply(event: DomainEvent): void;
  loadFromHistory(events: DomainEvent[]): void;
  
  // Command handling
  handle(command: Command): void;
  commit(): DomainEvent[];
}

abstract class AggregateRoot<TState> implements EventSourcedAggregate<TState> {
  protected state: TState;
  protected version: number = 0;
  private uncommittedEvents: DomainEvent[] = [];
  
  abstract getInitialState(): TState;
  abstract applyEvent(state: TState, event: DomainEvent): TState;
  
  apply(event: DomainEvent): void {
    this.state = this.applyEvent(this.state, event);
    this.version++;
    this.uncommittedEvents.push(event);
  }
  
  loadFromHistory(events: DomainEvent[]): void {
    for (const event of events) {
      this.state = this.applyEvent(this.state, event);
      this.version++;
    }
  }
  
  commit(): DomainEvent[] {
    const events = [...this.uncommittedEvents];
    this.uncommittedEvents = [];
    return events;
  }
}
```

### Saga Orchestrator

```typescript
interface SagaOrchestrator {
  // Saga management
  startSaga(sagaType: string, initialData: any): Promise<SagaInstance>;
  getSaga(sagaId: string): Promise<SagaInstance>;
  
  // Step execution
  executeStep(sagaId: string, stepName: string): Promise<StepResult>;
  compensateStep(sagaId: string, stepName: string): Promise<CompensationResult>;
  
  // Saga lifecycle
  completeSaga(sagaId: string): Promise<void>;
  failSaga(sagaId: string, error: Error): Promise<void>;
  retrySaga(sagaId: string): Promise<void>;
}

interface SagaInstance {
  id: string;
  type: string;
  status: SagaStatus;
  currentStep: string;
  data: any;
  completedSteps: CompletedStep[];
  failedStep?: FailedStep;
  startedAt: Date;
  completedAt?: Date;
}

enum SagaStatus {
  STARTED = 'started',
  RUNNING = 'running',
  COMPENSATING = 'compensating',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

interface SagaDefinition {
  name: string;
  steps: SagaStep[];
  compensationOrder: string[];
  timeout: number;
  retryPolicy: RetryPolicy;
}

interface SagaStep {
  name: string;
  execute: (data: any) => Promise<StepResult>;
  compensate: (data: any) => Promise<CompensationResult>;
  timeout: number;
  retryable: boolean;
}
```

### Event Bus

```typescript
interface EventBus {
  // Publishing
  publish(event: DomainEvent): Promise<void>;
  publishBatch(events: DomainEvent[]): Promise<void>;
  
  // Subscribing
  subscribe(eventType: string, handler: EventHandler): Subscription;
  subscribeAll(handler: EventHandler): Subscription;
  
  // Filtering
  subscribeWithFilter(filter: EventFilter, handler: EventHandler): Subscription;
}

interface EventHandler {
  handle(event: DomainEvent): Promise<void>;
}

interface EventFilter {
  eventTypes?: string[];
  streamIds?: string[];
  metadata?: Record<string, any>;
}

interface Subscription {
  id: string;
  unsubscribe(): void;
  pause(): void;
  resume(): void;
}
```

## Implementation Patterns

### Event Sourcing Implementation

```typescript
class EventSourcedRepository<T extends AggregateRoot<any>> {
  private eventStore: EventStore;
  private aggregateFactory: () => T;
  
  constructor(eventStore: EventStore, aggregateFactory: () => T) {
    this.eventStore = eventStore;
    this.aggregateFactory = aggregateFactory;
  }
  
  async getById(id: string): Promise<T> {
    const events = await this.eventStore.readEvents(id);
    
    if (events.length === 0) {
      throw new AggregateNotFoundError(`Aggregate ${id} not found`);
    }
    
    const aggregate = this.aggregateFactory();
    aggregate.loadFromHistory(events);
    
    return aggregate;
  }
  
  async save(aggregate: T, expectedVersion?: number): Promise<void> {
    const uncommittedEvents = aggregate.commit();
    
    if (uncommittedEvents.length === 0) {
      return;
    }
    
    const streamId = aggregate.getId();
    
    try {
      await this.eventStore.appendEvents(streamId, uncommittedEvents, expectedVersion);
    } catch (error) {
      if (error instanceof ConcurrencyError) {
        throw new OptimisticConcurrencyError(
          `Concurrency conflict for aggregate ${streamId}`,
          expectedVersion,
          error.actualVersion
        );
      }
      throw error;
    }
  }
}

// Example aggregate implementation
class OrderAggregate extends AggregateRoot<OrderState> {
  private id: string;
  
  getInitialState(): OrderState {
    return {
      id: '',
      status: OrderStatus.DRAFT,
      items: [],
      total: 0
    };
  }
  
  applyEvent(state: OrderState, event: DomainEvent): OrderState {
    switch (event.type) {
      case 'OrderCreated':
        return {
          ...state,
          id: event.data.orderId,
          status: OrderStatus.CREATED,
          customerId: event.data.customerId
        };
        
      case 'ItemAdded':
        return {
          ...state,
          items: [...state.items, event.data.item],
          total: state.total + event.data.item.price * event.data.item.quantity
        };
        
      case 'OrderConfirmed':
        return {
          ...state,
          status: OrderStatus.CONFIRMED
        };
        
      default:
        return state;
    }
  }
  
  createOrder(customerId: string): void {
    if (this.state.status !== OrderStatus.DRAFT) {
      throw new InvalidOperationError('Order already created');
    }
    
    this.apply({
      id: generateEventId(),
      type: 'OrderCreated',
      streamId: this.id,
      version: this.version + 1,
      timestamp: new Date(),
      data: { orderId: this.id, customerId },
      metadata: this.createMetadata()
    });
  }
  
  addItem(item: OrderItem): void {
    if (this.state.status !== OrderStatus.CREATED) {
      throw new InvalidOperationError('Cannot add items to confirmed order');
    }
    
    this.apply({
      id: generateEventId(),
      type: 'ItemAdded',
      streamId: this.id,
      version: this.version + 1,
      timestamp: new Date(),
      data: { item },
      metadata: this.createMetadata()
    });
  }
}
```

### Saga Pattern Implementation

```typescript
class OrderSagaOrchestrator implements SagaOrchestrator {
  private sagaStore: SagaStore;
  private eventBus: EventBus;
  
  async startSaga(sagaType: string, initialData: any): Promise<SagaInstance> {
    const sagaDefinition = this.getSagaDefinition(sagaType);
    
    const saga: SagaInstance = {
      id: generateSagaId(),
      type: sagaType,
      status: SagaStatus.STARTED,
      currentStep: sagaDefinition.steps[0].name,
      data: initialData,
      completedSteps: [],
      startedAt: new Date()
    };
    
    await this.sagaStore.save(saga);
    
    // Start executing the saga
    this.executeSaga(saga.id);
    
    return saga;
  }
  
  private async executeSaga(sagaId: string): Promise<void> {
    const saga = await this.sagaStore.get(sagaId);
    const definition = this.getSagaDefinition(saga.type);
    
    saga.status = SagaStatus.RUNNING;
    await this.sagaStore.save(saga);
    
    for (const step of definition.steps) {
      if (this.isStepCompleted(saga, step.name)) {
        continue;
      }
      
      saga.currentStep = step.name;
      await this.sagaStore.save(saga);
      
      try {
        const result = await this.executeStepWithRetry(step, saga.data);
        
        saga.completedSteps.push({
          name: step.name,
          result,
          completedAt: new Date()
        });
        
        // Update saga data with step result
        saga.data = { ...saga.data, ...result.data };
        await this.sagaStore.save(saga);
        
      } catch (error) {
        saga.failedStep = {
          name: step.name,
          error: error.message,
          failedAt: new Date()
        };
        
        // Start compensation
        await this.compensateSaga(saga, definition);
        return;
      }
    }
    
    // All steps completed successfully
    saga.status = SagaStatus.COMPLETED;
    saga.completedAt = new Date();
    await this.sagaStore.save(saga);
    
    // Publish saga completed event
    await this.eventBus.publish({
      id: generateEventId(),
      type: 'SagaCompleted',
      streamId: saga.id,
      version: 1,
      timestamp: new Date(),
      data: { sagaId: saga.id, sagaType: saga.type, result: saga.data },
      metadata: { correlationId: saga.id, causationId: saga.id, schemaVersion: '1.0' }
    });
  }
  
  private async compensateSaga(saga: SagaInstance, definition: SagaDefinition): Promise<void> {
    saga.status = SagaStatus.COMPENSATING;
    await this.sagaStore.save(saga);
    
    // Compensate in reverse order
    const stepsToCompensate = [...saga.completedSteps].reverse();
    
    for (const completedStep of stepsToCompensate) {
      const stepDefinition = definition.steps.find(s => s.name === completedStep.name);
      
      if (stepDefinition) {
        try {
          await stepDefinition.compensate(saga.data);
        } catch (compensationError) {
          // Log compensation failure but continue
          console.error(`Compensation failed for step ${completedStep.name}:`, compensationError);
        }
      }
    }
    
    saga.status = SagaStatus.FAILED;
    await this.sagaStore.save(saga);
    
    // Publish saga failed event
    await this.eventBus.publish({
      id: generateEventId(),
      type: 'SagaFailed',
      streamId: saga.id,
      version: 1,
      timestamp: new Date(),
      data: { sagaId: saga.id, sagaType: saga.type, error: saga.failedStep },
      metadata: { correlationId: saga.id, causationId: saga.id, schemaVersion: '1.0' }
    });
  }
}

// Example saga definition
const orderSagaDefinition: SagaDefinition = {
  name: 'CreateOrderSaga',
  steps: [
    {
      name: 'ReserveInventory',
      execute: async (data) => {
        const result = await inventoryService.reserve(data.items);
        return { success: true, data: { reservationId: result.id } };
      },
      compensate: async (data) => {
        await inventoryService.releaseReservation(data.reservationId);
        return { success: true };
      },
      timeout: 30000,
      retryable: true
    },
    {
      name: 'ProcessPayment',
      execute: async (data) => {
        const result = await paymentService.charge(data.customerId, data.total);
        return { success: true, data: { paymentId: result.id } };
      },
      compensate: async (data) => {
        await paymentService.refund(data.paymentId);
        return { success: true };
      },
      timeout: 60000,
      retryable: false
    },
    {
      name: 'ConfirmOrder',
      execute: async (data) => {
        await orderService.confirm(data.orderId);
        return { success: true, data: {} };
      },
      compensate: async (data) => {
        await orderService.cancel(data.orderId);
        return { success: true };
      },
      timeout: 10000,
      retryable: true
    }
  ],
  compensationOrder: ['ConfirmOrder', 'ProcessPayment', 'ReserveInventory'],
  timeout: 120000,
  retryPolicy: { maxRetries: 3, backoffMs: 1000 }
};
```

### Event Streaming with Kafka

```typescript
class KafkaEventStreamer {
  private producer: KafkaProducer;
  private consumer: KafkaConsumer;
  
  async publishEvent(topic: string, event: DomainEvent): Promise<void> {
    const message = {
      key: event.streamId,
      value: JSON.stringify(event),
      headers: {
        'event-type': event.type,
        'correlation-id': event.metadata.correlationId,
        'schema-version': event.metadata.schemaVersion
      },
      timestamp: event.timestamp.getTime().toString()
    };
    
    await this.producer.send({
      topic,
      messages: [message]
    });
  }
  
  async subscribeToTopic(
    topic: string,
    groupId: string,
    handler: EventHandler
  ): Promise<void> {
    await this.consumer.subscribe({ topic, fromBeginning: false });
    
    await this.consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        const event = JSON.parse(message.value.toString()) as DomainEvent;
        
        try {
          await handler.handle(event);
        } catch (error) {
          // Handle processing error
          await this.handleProcessingError(event, error);
        }
      }
    });
  }
  
  private async handleProcessingError(event: DomainEvent, error: Error): Promise<void> {
    // Send to dead letter topic
    await this.publishEvent('dead-letter-events', {
      ...event,
      metadata: {
        ...event.metadata,
        error: error.message,
        originalTopic: event.type
      }
    });
  }
}
```

## Integration Points

### CQRS Integration

```typescript
interface CQRSIntegration {
  // Command side
  dispatchCommand(command: Command): Promise<CommandResult>;
  
  // Query side
  executeQuery<T>(query: Query): Promise<T>;
  
  // Projection management
  rebuildProjection(projectionName: string): Promise<void>;
  getProjectionStatus(projectionName: string): Promise<ProjectionStatus>;
}

class CQRSHandler implements CQRSIntegration {
  private commandBus: CommandBus;
  private queryBus: QueryBus;
  private projectionManager: ProjectionManager;
  
  async dispatchCommand(command: Command): Promise<CommandResult> {
    // Validate command
    await this.validateCommand(command);
    
    // Execute command
    const result = await this.commandBus.dispatch(command);
    
    // Wait for projections to update (optional)
    if (command.waitForProjection) {
      await this.projectionManager.waitForProjection(command.correlationId);
    }
    
    return result;
  }
  
  async executeQuery<T>(query: Query): Promise<T> {
    return this.queryBus.execute<T>(query);
  }
}
```

### Event Schema Registry

```typescript
interface EventSchemaRegistry {
  registerSchema(eventType: string, schema: EventSchema): Promise<void>;
  getSchema(eventType: string, version?: string): Promise<EventSchema>;
  validateEvent(event: DomainEvent): Promise<ValidationResult>;
  evolveSchema(eventType: string, newSchema: EventSchema): Promise<SchemaEvolution>;
}

class AvroSchemaRegistry implements EventSchemaRegistry {
  async validateEvent(event: DomainEvent): Promise<ValidationResult> {
    const schema = await this.getSchema(event.type, event.metadata.schemaVersion);
    
    try {
      schema.validate(event.data);
      return { valid: true };
    } catch (error) {
      return { valid: false, errors: [error.message] };
    }
  }
  
  async evolveSchema(eventType: string, newSchema: EventSchema): Promise<SchemaEvolution> {
    const currentSchema = await this.getSchema(eventType);
    
    // Check backward compatibility
    const compatibility = this.checkCompatibility(currentSchema, newSchema);
    
    if (!compatibility.isCompatible) {
      throw new SchemaIncompatibleError(compatibility.issues);
    }
    
    // Register new version
    const newVersion = this.incrementVersion(currentSchema.version);
    await this.registerSchema(eventType, { ...newSchema, version: newVersion });
    
    return {
      previousVersion: currentSchema.version,
      newVersion,
      changes: compatibility.changes
    };
  }
}
```

## Security Considerations

### Event Security

```typescript
const eventSecurityConfig = {
  // Event encryption
  encryption: {
    enabled: true,
    algorithm: 'AES-256-GCM',
    keyRotationPeriod: 90
  },
  
  // Event signing
  signing: {
    enabled: true,
    algorithm: 'RS256'
  },
  
  // Access control
  accessControl: {
    streamLevelPermissions: true,
    eventTypeLevelPermissions: true
  },
  
  // Audit logging
  auditLogging: {
    logAllEvents: true,
    logAccessAttempts: true,
    retentionPeriod: 365
  }
};

class SecureEventStore implements EventStore {
  async appendEvents(streamId: string, events: DomainEvent[], expectedVersion?: number): Promise<AppendResult> {
    // Verify write permission
    await this.verifyPermission(streamId, 'write');
    
    // Sign events
    const signedEvents = await Promise.all(
      events.map(e => this.signEvent(e))
    );
    
    // Encrypt sensitive data
    const encryptedEvents = await Promise.all(
      signedEvents.map(e => this.encryptSensitiveData(e))
    );
    
    // Append to store
    const result = await this.innerStore.appendEvents(streamId, encryptedEvents, expectedVersion);
    
    // Audit log
    await this.auditLog.log({
      action: 'append_events',
      streamId,
      eventCount: events.length,
      userId: this.getCurrentUserId()
    });
    
    return result;
  }
}
```

## Compliance Requirements

### Event Audit Trail

- **Event Immutability**: Events are append-only and cannot be modified
- **Complete History**: Maintain full event history for audit purposes
- **Correlation Tracking**: Track event causation and correlation chains
- **Access Logging**: Log all access to event streams

### Data Retention

- **Retention Policies**: Implement configurable event retention
- **Archival**: Archive old events to cold storage
- **GDPR Compliance**: Support event redaction for data deletion requests

## Testing Considerations

### Event Sourcing Testing

```typescript
describe('EventSourcedAggregate', () => {
  it('should apply events and update state', () => {
    const order = new OrderAggregate('order-1');
    
    order.createOrder('customer-1');
    order.addItem({ productId: 'prod-1', quantity: 2, price: 100 });
    
    expect(order.getState().status).toBe(OrderStatus.CREATED);
    expect(order.getState().items).toHaveLength(1);
    expect(order.getState().total).toBe(200);
  });
  
  it('should rebuild state from event history', () => {
    const events = [
      { type: 'OrderCreated', data: { orderId: 'order-1', customerId: 'cust-1' } },
      { type: 'ItemAdded', data: { item: { productId: 'prod-1', quantity: 1, price: 50 } } }
    ];
    
    const order = new OrderAggregate('order-1');
    order.loadFromHistory(events);
    
    expect(order.getState().status).toBe(OrderStatus.CREATED);
    expect(order.getVersion()).toBe(2);
  });
});

describe('SagaOrchestrator', () => {
  it('should execute saga steps in order', async () => {
    const orchestrator = new OrderSagaOrchestrator();
    
    const saga = await orchestrator.startSaga('CreateOrderSaga', {
      orderId: 'order-1',
      customerId: 'cust-1',
      items: [{ productId: 'prod-1', quantity: 1 }],
      total: 100
    });
    
    // Wait for saga completion
    await waitForSagaCompletion(saga.id);
    
    const completedSaga = await orchestrator.getSaga(saga.id);
    expect(completedSaga.status).toBe(SagaStatus.COMPLETED);
    expect(completedSaga.completedSteps).toHaveLength(3);
  });
  
  it('should compensate on failure', async () => {
    // Mock payment failure
    paymentService.charge.mockRejectedValue(new Error('Payment failed'));
    
    const saga = await orchestrator.startSaga('CreateOrderSaga', { ... });
    
    await waitForSagaCompletion(saga.id);
    
    const failedSaga = await orchestrator.getSaga(saga.id);
    expect(failedSaga.status).toBe(SagaStatus.FAILED);
    expect(inventoryService.releaseReservation).toHaveBeenCalled();
  });
});
```

This template provides comprehensive patterns for implementing event-driven architectures with event sourcing, saga orchestration, and event streaming capabilities.
