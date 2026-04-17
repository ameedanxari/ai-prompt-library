# CRUD Operations Module

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


## Overview
This module provides comprehensive Create, Read, Update, Delete operations with validation, security, accessibility, and offline capabilities for robust data management across all application entities.

## Integration Points

This template integrates with the following v2 templates:
- **Analytics** (`analytics/user-analytics.md`): Track CRUD operation metrics
- **Performance** (`performance/caching-strategies.md`): Optimize read operations
- **Security** (`security/data-encryption.md`): Encrypt sensitive data
- **Search** (`search-discovery/full-text-search.md`): Index data for search
- **Data Processing** (`data-processing/data-quality.md`): Validate data integrity

### Cross-Domain Composition Support

This template supports composition with domain-specific templates:
- **Commerce** (`commerce/product-catalog.md`): Product CRUD operations
- **Healthcare** (`healthcare/patient-data-management.md`): HIPAA-compliant data handling
- **Fintech** (`fintech/transaction-processing.md`): Financial data operations
- **Content Management** (`content-management/content-creation.md`): Content CRUD workflows
- **Social** (`social/user-profiles.md`): Profile data management

## Purpose
Implement comprehensive Create, Read, Update, Delete operations with validation, security, accessibility, and offline capabilities for robust data management across all application entities.

## Instructions
Use this module to implement complete CRUD functionality that handles data operations securely and efficiently. The implementation should provide consistent patterns across all data entities while maintaining security and performance standards.

1. **Design CRUD Architecture**: Define RESTful API patterns and data validation rules
2. **Implement Core Operations**: Build Create, Read, Update, Delete functionality
3. **Add Security Features**: Implement authorization, validation, and audit logging
4. **Enable Offline Support**: Add caching and synchronization capabilities
5. **Test Thoroughly**: Perform comprehensive testing including edge cases

## Examples

### Basic CRUD Implementation Example
```typescript
// Generic CRUD Service
interface CRUDEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

class CRUDService<T extends CRUDEntity> {
  constructor(
    private repository: Repository<T>,
    private validator: EntityValidator<T>,
    private auditLogger: AuditLogger
  ) {}

  // Create Operation
  async create(data: Omit<T, keyof CRUDEntity>, userId: string): Promise<T> {
    // Validate input data
    const validationResult = await this.validator.validate(data);
    if (!validationResult.isValid) {
      throw new ValidationError(validationResult.errors);
    }

    // Check permissions
    await this.checkPermission(userId, 'create', data);

    // Create entity with metadata
    const entity = {
      ...data,
      id: generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: userId,
      updatedBy: userId
    } as T;

    // Save to database
    const savedEntity = await this.repository.save(entity);

    // Log audit trail
    await this.auditLogger.log({
      action: 'CREATE',
      entityType: this.getEntityType(),
      entityId: savedEntity.id,
      userId,
      data: savedEntity
    });

    return savedEntity;
  }

  // Read Operation with Filtering and Pagination
  async findMany(
    filters: Partial<T>,
    pagination: { page: number; limit: number },
    userId: string
  ): Promise<{ data: T[]; total: number; page: number; limit: number }> {
    // Check read permissions
    await this.checkPermission(userId, 'read', filters);

    // Apply user-specific filters (e.g., only show user's own data)
    const secureFilters = await this.applySecurityFilters(filters, userId);

    // Execute query with pagination
    const [data, total] = await this.repository.findAndCount({
      where: secureFilters,
      skip: (pagination.page - 1) * pagination.limit,
      take: pagination.limit,
      order: { updatedAt: 'DESC' }
    });

    return {
      data,
      total,
      page: pagination.page,
      limit: pagination.limit
    };
  }

  // Update Operation with Optimistic Locking
  async update(id: string, data: Partial<T>, userId: string): Promise<T> {
    // Find existing entity
    const existingEntity = await this.repository.findById(id);
    if (!existingEntity) {
      throw new NotFoundError(`Entity with id ${id} not found`);
    }

    // Check permissions
    await this.checkPermission(userId, 'update', existingEntity);

    // Validate update data
    const validationResult = await this.validator.validateUpdate(data, existingEntity);
    if (!validationResult.isValid) {
      throw new ValidationError(validationResult.errors);
    }

    // Update with optimistic locking
    const updatedEntity = {
      ...existingEntity,
      ...data,
      updatedAt: new Date(),
      updatedBy: userId
    };

    const savedEntity = await this.repository.updateWithLock(id, updatedEntity);

    // Log audit trail
    await this.auditLogger.log({
      action: 'UPDATE',
      entityType: this.getEntityType(),
      entityId: id,
      userId,
      oldData: existingEntity,
      newData: savedEntity
    });

    return savedEntity;
  }

  // Soft Delete Operation
  async delete(id: string, userId: string): Promise<void> {
    const entity = await this.repository.findById(id);
    if (!entity) {
      throw new NotFoundError(`Entity with id ${id} not found`);
    }

    // Check permissions
    await this.checkPermission(userId, 'delete', entity);

    // Perform soft delete
    await this.repository.softDelete(id, userId);

    // Log audit trail
    await this.auditLogger.log({
      action: 'DELETE',
      entityType: this.getEntityType(),
      entityId: id,
      userId,
      data: entity
    });
  }
}
```

### Advanced CRUD with Offline Support Example
```typescript
// Offline-Capable CRUD Service
class OfflineCRUDService<T extends CRUDEntity> extends CRUDService<T> {
  constructor(
    repository: Repository<T>,
    validator: EntityValidator<T>,
    auditLogger: AuditLogger,
    private offlineStorage: OfflineStorage<T>,
    private syncService: SyncService<T>
  ) {
    super(repository, validator, auditLogger);
  }

  // Create with offline support
  async create(data: Omit<T, keyof CRUDEntity>, userId: string): Promise<T> {
    try {
      // Try online creation first
      return await super.create(data, userId);
    } catch (error) {
      if (this.isOfflineError(error)) {
        // Store for later sync
        const offlineEntity = await this.offlineStorage.store({
          ...data,
          id: generateOfflineId(),
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: userId,
          updatedBy: userId,
          _offline: true,
          _action: 'CREATE'
        } as T);

        // Schedule sync when online
        this.syncService.scheduleSync();
        
        return offlineEntity;
      }
      throw error;
    }
  }

  // Sync offline changes when online
  async syncOfflineChanges(): Promise<void> {
    const offlineChanges = await this.offlineStorage.getPendingChanges();
    
    for (const change of offlineChanges) {
      try {
        switch (change._action) {
          case 'CREATE':
            await super.create(change, change.createdBy);
            break;
          case 'UPDATE':
            await super.update(change.id, change, change.updatedBy);
            break;
          case 'DELETE':
            await super.delete(change.id, change.updatedBy);
            break;
        }
        
        // Mark as synced
        await this.offlineStorage.markSynced(change.id);
      } catch (error) {
        // Handle sync conflicts
        await this.handleSyncConflict(change, error);
      }
    }
  }
}
```

## Core Implementation Requirements

### CRUD Architecture
- **RESTful API Design**: Standard HTTP methods with proper status codes
- **Data Validation**: Server-side and client-side validation with consistent rules
- **Transaction Management**: ACID compliance for multi-table operations
- **Optimistic Locking**: Prevent concurrent modification conflicts
- **Soft Deletes**: Implement soft deletes with recovery capabilities

### Security Features
- **Input Sanitization**: Prevent SQL injection and XSS attacks
- **Authorization Checks**: Verify permissions for each CRUD operation
- **Data Encryption**: Encrypt sensitive data at rest and in transit
- **Audit Logging**: Log all data modifications with user attribution
- **Rate Limiting**: Prevent abuse of CRUD endpoints

### Accessibility Implementation
- **Form Accessibility**: Proper labels, fieldsets, and error associations
- **Screen Reader Support**: Announce CRUD operation results
- **Keyboard Navigation**: Full keyboard support for data entry forms
- **Error Messaging**: Clear, accessible error messages with suggestions
- **Loading States**: Accessible loading indicators during operations

### Internationalization Support
- **Localized Validation**: Translate validation messages and field labels
- **Data Formatting**: Locale-appropriate date, number, and currency formatting
- **RTL Support**: Full RTL support for data entry forms
- **Cultural Data Handling**: Respect cultural conventions for names, addresses, etc.

### Offline & Network Resilience
- **Offline Storage**: Cache data locally for offline access
- **Conflict Resolution**: Handle conflicts when syncing offline changes
- **Queue Operations**: Queue CRUD operations when offline
- **Progressive Sync**: Sync data progressively based on priority
- **Optimistic Updates**: Show immediate feedback, sync in background
- **Graceful Degradation**: Provide read-only access when server unavailable
- **Fallback Mechanisms**: Implement fallback strategies for network failures

### Platform-Specific Implementations

#### Backend API Implementation
```typescript
// RESTful CRUD controller with security and validation
class CRUDController<T> {
  constructor(
    private repository: Repository<T>,
    private validator: Validator<T>,
    private auditLogger: AuditLogger
  ) {}
  
  async create(data: Partial<T>, userId: string): Promise<T> {
    // Validate input
    const validationResult = await this.validator.validate(data);
    if (!validationResult.isValid) {
      throw new ValidationError(validationResult.errors);
    }
    
    // Check permissions
    await this.checkPermission(userId, 'create');
    
    // Sanitize input
    const sanitizedData = this.sanitizeInput(data);
    
    // Create with transaction
    const result = await this.repository.transaction(async (trx) => {
      const created = await this.repository.create(sanitizedData, trx);
      
      // Audit log
      await this.auditLogger.log({
        action: 'CREATE',
        entityType: this.getEntityType(),
        entityId: created.id,
        userId,
        data: sanitizedData,
        timestamp: new Date()
      });
      
      return created;
    });
    
    return result;
  }
  
  async read(id: string, userId: string): Promise<T> {
    await this.checkPermission(userId, 'read', id);
    
    const entity = await this.repository.findById(id);
    if (!entity) {
      throw new NotFoundError(`Entity with id ${id} not found`);
    }
    
    // Filter sensitive data based on user permissions
    return this.filterSensitiveData(entity, userId);
  }
  
  async update(id: string, data: Partial<T>, userId: string, version?: number): Promise<T> {
    // Validate input
    const validationResult = await this.validator.validateUpdate(data);
    if (!validationResult.isValid) {
      throw new ValidationError(validationResult.errors);
    }
    
    // Check permissions
    await this.checkPermission(userId, 'update', id);
    
    // Optimistic locking check
    if (version !== undefined) {
      const current = await this.repository.findById(id);
      if (current.version !== version) {
        throw new ConflictError('Entity has been modified by another user');
      }
    }
    
    // Update with transaction
    const result = await this.repository.transaction(async (trx) => {
      const updated = await this.repository.update(id, data, trx);
      
      // Audit log
      await this.auditLogger.log({
        action: 'UPDATE',
        entityType: this.getEntityType(),
        entityId: id,
        userId,
        changes: data,
        timestamp: new Date()
      });
      
      return updated;
    });
    
    return result;
  }
  
  async delete(id: string, userId: string, soft: boolean = true): Promise<void> {
    await this.checkPermission(userId, 'delete', id);
    
    await this.repository.transaction(async (trx) => {
      if (soft) {
        await this.repository.softDelete(id, trx);
      } else {
        await this.repository.hardDelete(id, trx);
      }
      
      // Audit log
      await this.auditLogger.log({
        action: soft ? 'SOFT_DELETE' : 'HARD_DELETE',
        entityType: this.getEntityType(),
        entityId: id,
        userId,
        timestamp: new Date()
      });
    });
  }
}
```

#### Frontend Implementation
```typescript
// React CRUD component with accessibility
const CRUDForm: React.FC<{
  entity?: T;
  onSave: (data: T) => Promise<void>;
  onCancel: () => void;
}> = ({ entity, onSave, onCancel }) => {
  const [formData, setFormData] = useState(entity || {});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await onSave(formData);
      // Announce success to screen readers
      announceToScreenReader(t('crud.save_success'));
    } catch (error) {
      if (error instanceof ValidationError) {
        setErrors(error.fieldErrors);
        // Focus first error field
        const firstErrorField = Object.keys(error.fieldErrors)[0];
        document.getElementById(firstErrorField)?.focus();
      }
      announceToScreenReader(t('crud.save_error'));
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} noValidate>
      <fieldset disabled={loading}>
        <legend>{entity ? t('crud.edit_entity') : t('crud.create_entity')}</legend>
        
        {Object.entries(formData).map(([field, value]) => (
          <div key={field} className="form-field">
            <label htmlFor={field}>
              {t(`fields.${field}`)}
              {isRequired(field) && <span aria-label={t('required')}>*</span>}
            </label>
            
            <input
              id={field}
              type={getFieldType(field)}
              value={value}
              onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
              aria-invalid={errors[field] ? 'true' : 'false'}
              aria-describedby={errors[field] ? `${field}-error` : undefined}
            />
            
            {errors[field] && (
              <div id={`${field}-error`} role="alert" className="error-message">
                {errors[field]}
              </div>
            )}
          </div>
        ))}
        
        <div className="form-actions">
          <button type="submit" disabled={loading}>
            {loading ? t('crud.saving') : t('crud.save')}
          </button>
          <button type="button" onClick={onCancel}>
            {t('crud.cancel')}
          </button>
        </div>
      </fieldset>
      
      {loading && (
        <div aria-live="polite" className="sr-only">
          {t('crud.saving_progress')}
        </div>
      )}
    </form>
  );
};
```

#### Mobile Implementation
```typescript
// React Native / Flutter offline CRUD service
class OfflineCRUDService<T> {
  private offlineQueue: CRUDOperation[] = [];
  private localCache: Map<string, T> = new Map();
  
  async create(data: Partial<T>): Promise<T> {
    const tempId = generateTempId();
    const entity = { ...data, id: tempId, _isOffline: true } as T;
    
    // Store locally
    this.localCache.set(tempId, entity);
    
    // Queue for sync
    this.offlineQueue.push({
      type: 'CREATE',
      data: entity,
      tempId,
      timestamp: new Date()
    });
    
    // Try immediate sync if online
    if (await this.isOnline()) {
      this.syncQueue();
    }
    
    return entity;
  }
  
  async syncQueue(): Promise<void> {
    const operations = [...this.offlineQueue];
    this.offlineQueue = [];
    
    for (const operation of operations) {
      try {
        switch (operation.type) {
          case 'CREATE':
            const created = await this.api.create(operation.data);
            // Update local cache with server ID
            this.localCache.delete(operation.tempId);
            this.localCache.set(created.id, created);
            break;
            
          case 'UPDATE':
            const updated = await this.api.update(operation.id, operation.data);
            this.localCache.set(operation.id, updated);
            break;
            
          case 'DELETE':
            await this.api.delete(operation.id);
            this.localCache.delete(operation.id);
            break;
        }
      } catch (error) {
        // Handle conflicts
        if (error instanceof ConflictError) {
          await this.resolveConflict(operation, error);
        } else {
          // Re-queue failed operations
          this.offlineQueue.push(operation);
        }
      }
    }
  }
  
  private async resolveConflict(operation: CRUDOperation, error: ConflictError): Promise<void> {
    // Implement conflict resolution strategy
    // Options: last-write-wins, merge, user-choice
    const resolution = await this.conflictResolver.resolve(operation, error.serverData);
    
    if (resolution.strategy === 'merge') {
      const merged = this.mergeData(operation.data, error.serverData);
      await this.api.update(operation.id, merged);
    }
  }
}
```

## Testing Requirements

### Unit Tests
- Test validation logic for all CRUD operations
- Test permission checking for different user roles
- Test optimistic locking and conflict resolution
- Test soft delete and recovery functionality

### Property-Based Tests
- **Data Integrity Property**: For any valid data, CRUD operations should maintain data consistency
- **Permission Enforcement Property**: For any user and operation, permissions should be properly enforced
- **Audit Completeness Property**: For any CRUD operation, it should be properly logged in the audit trail

### Accessibility Tests
- Test form accessibility with screen readers
- Test keyboard navigation for all CRUD interfaces
- Test error message accessibility and focus management

### Integration Tests
- Test complete CRUD workflows from creation to deletion
- Test offline sync and conflict resolution
- Test cross-platform data consistency

## Monitoring & Observability

### Metrics to Track
- CRUD operation frequency and performance
- Validation error rates by field
- Conflict resolution success rates
- Offline sync performance and failure rates

### Performance Monitoring
- Database query performance for CRUD operations
- API response times for different operation types
- Cache hit/miss ratios for read operations

## Configuration Variables
- `{{entity_type}}` - Type of entity being managed
- `{{validation_rules}}` - Validation rules for entity fields
- `{{soft_delete_enabled}}` - Whether to use soft deletes
- `{{offline_sync_strategy}}` - Strategy for offline synchronization
- `{{conflict_resolution}}` - Conflict resolution strategy

## Dependencies
- Database with ACID compliance
- Validation library (Joi, Yup, etc.)
- Audit logging system
- Offline storage (SQLite, IndexedDB)
- Conflict resolution library
- Internationalization framework

## Documentation Requirements
- API documentation for CRUD endpoints
- Data model documentation
- Validation rules documentation
- Offline sync behavior documentation
- Conflict resolution procedures

## Advanced Data Management Patterns

### Event-Driven CRUD with Event Sourcing

```typescript
// Integration with event-driven architecture
interface EventSourcedCRUDConfig {
  eventStore: EventStore;
  snapshotInterval: number;
  projections: Projection[];
}

class EventSourcedCRUDService<T extends CRUDEntity> {
  private eventStore: EventStore;
  private projectionService: ProjectionService;

  async create(data: Omit<T, keyof CRUDEntity>, userId: string): Promise<T> {
    const entityId = generateId();
    
    // Create event
    const event: DomainEvent = {
      id: generateEventId(),
      aggregateId: entityId,
      type: `${this.entityType}.created`,
      data,
      metadata: {
        userId,
        timestamp: new Date(),
        correlationId: getCorrelationId()
      }
    };

    // Store event
    await this.eventStore.append(entityId, event);

    // Update projections
    await this.projectionService.apply(event);

    // Return current state
    return await this.getById(entityId);
  }

  async update(id: string, data: Partial<T>, userId: string): Promise<T> {
    // Get current state
    const currentState = await this.getById(id);
    
    // Calculate diff
    const changes = this.calculateChanges(currentState, data);

    // Create update event
    const event: DomainEvent = {
      id: generateEventId(),
      aggregateId: id,
      type: `${this.entityType}.updated`,
      data: changes,
      metadata: {
        userId,
        timestamp: new Date(),
        previousVersion: currentState.version
      }
    };

    // Store event with optimistic concurrency
    await this.eventStore.append(id, event, currentState.version);

    // Update projections
    await this.projectionService.apply(event);

    return await this.getById(id);
  }

  async getHistory(id: string): Promise<EntityHistory<T>> {
    const events = await this.eventStore.getEvents(id);
    
    return {
      entityId: id,
      events: events.map(e => ({
        type: e.type,
        timestamp: e.metadata.timestamp,
        userId: e.metadata.userId,
        changes: e.data
      })),
      currentState: await this.getById(id)
    };
  }
}
```

### Real-Time CRUD with WebSocket Sync

```typescript
// Real-time data synchronization
interface RealTimeCRUDConfig {
  websocketEnabled: boolean;
  broadcastChanges: boolean;
  conflictResolution: 'last_write_wins' | 'merge' | 'manual';
}

class RealTimeCRUDService<T extends CRUDEntity> extends CRUDService<T> {
  private websocketService: WebSocketService;
  private subscriptions: Map<string, Set<string>> = new Map();

  async create(data: Omit<T, keyof CRUDEntity>, userId: string): Promise<T> {
    const entity = await super.create(data, userId);

    // Broadcast to subscribers
    await this.broadcastChange({
      type: 'created',
      entityType: this.entityType,
      entity,
      userId
    });

    return entity;
  }

  async update(id: string, data: Partial<T>, userId: string): Promise<T> {
    const entity = await super.update(id, data, userId);

    // Broadcast to subscribers
    await this.broadcastChange({
      type: 'updated',
      entityType: this.entityType,
      entity,
      changes: data,
      userId
    });

    return entity;
  }

  async subscribeToChanges(
    entityType: string,
    filter: SubscriptionFilter,
    callback: ChangeCallback
  ): Promise<Subscription> {
    const subscriptionId = generateId();
    
    await this.websocketService.subscribe({
      channel: `${entityType}:changes`,
      filter,
      callback: (change) => {
        if (this.matchesFilter(change, filter)) {
          callback(change);
        }
      }
    });

    return {
      id: subscriptionId,
      unsubscribe: () => this.unsubscribe(subscriptionId)
    };
  }

  private async broadcastChange(change: DataChange): Promise<void> {
    await this.websocketService.broadcast({
      channel: `${change.entityType}:changes`,
      data: change
    });
  }
}
```

### Multi-Tenant CRUD

```typescript
// Multi-tenant data isolation
interface MultiTenantCRUDConfig {
  tenantIsolation: 'database' | 'schema' | 'row';
  crossTenantAccess: boolean;
  tenantIdField: string;
}

class MultiTenantCRUDService<T extends CRUDEntity & TenantEntity> extends CRUDService<T> {
  async create(
    data: Omit<T, keyof CRUDEntity>,
    userId: string,
    tenantId: string
  ): Promise<T> {
    // Inject tenant ID
    const tenantData = {
      ...data,
      tenantId
    } as Omit<T, keyof CRUDEntity>;

    return await super.create(tenantData, userId);
  }

  async findMany(
    filters: Partial<T>,
    pagination: PaginationParams,
    userId: string,
    tenantId: string
  ): Promise<PaginatedResult<T>> {
    // Enforce tenant isolation
    const tenantFilters = {
      ...filters,
      tenantId
    } as Partial<T>;

    return await super.findMany(tenantFilters, pagination, userId);
  }

  async update(
    id: string,
    data: Partial<T>,
    userId: string,
    tenantId: string
  ): Promise<T> {
    // Verify entity belongs to tenant
    const entity = await this.repository.findById(id);
    
    if (entity.tenantId !== tenantId) {
      throw new TenantAccessError('Entity does not belong to tenant');
    }

    // Prevent tenant ID modification
    const { tenantId: _, ...safeData } = data as any;
    
    return await super.update(id, safeData, userId);
  }
}
```

### Bulk Operations with Streaming

```typescript
// Efficient bulk CRUD operations
interface BulkOperationConfig {
  batchSize: number;
  parallelism: number;
  errorHandling: 'stop_on_error' | 'continue' | 'rollback';
}

class BulkCRUDService<T extends CRUDEntity> {
  async bulkCreate(
    items: Omit<T, keyof CRUDEntity>[],
    userId: string,
    options: BulkOperationConfig
  ): Promise<BulkOperationResult<T>> {
    const results: BulkItemResult<T>[] = [];
    const batches = this.chunk(items, options.batchSize);

    for (const batch of batches) {
      const batchResults = await Promise.allSettled(
        batch.map(item => this.crudService.create(item, userId))
      );

      for (let i = 0; i < batchResults.length; i++) {
        const result = batchResults[i];
        if (result.status === 'fulfilled') {
          results.push({ success: true, entity: result.value });
        } else {
          results.push({ success: false, error: result.reason, input: batch[i] });
          
          if (options.errorHandling === 'stop_on_error') {
            return this.buildResult(results, 'stopped');
          }
        }
      }
    }

    return this.buildResult(results, 'completed');
  }

  async bulkUpdate(
    updates: Array<{ id: string; data: Partial<T> }>,
    userId: string,
    options: BulkOperationConfig
  ): Promise<BulkOperationResult<T>> {
    // Use streaming for large updates
    if (updates.length > 1000) {
      return await this.streamingBulkUpdate(updates, userId, options);
    }

    const results: BulkItemResult<T>[] = [];
    
    for (const { id, data } of updates) {
      try {
        const entity = await this.crudService.update(id, data, userId);
        results.push({ success: true, entity });
      } catch (error) {
        results.push({ success: false, error, id });
        
        if (options.errorHandling === 'stop_on_error') {
          return this.buildResult(results, 'stopped');
        }
      }
    }

    return this.buildResult(results, 'completed');
  }

  private async streamingBulkUpdate(
    updates: Array<{ id: string; data: Partial<T> }>,
    userId: string,
    options: BulkOperationConfig
  ): Promise<BulkOperationResult<T>> {
    const stream = this.createUpdateStream(updates);
    const results: BulkItemResult<T>[] = [];

    for await (const batch of stream) {
      const batchResults = await this.processBatch(batch, userId);
      results.push(...batchResults);
    }

    return this.buildResult(results, 'completed');
  }
}
```

## Domain-Specific CRUD Patterns

### Healthcare CRUD (HIPAA Compliant)

```typescript
// HIPAA-compliant data operations
class HealthcareCRUDService<T extends PHIEntity> extends CRUDService<T> {
  async create(data: Omit<T, keyof CRUDEntity>, userId: string): Promise<T> {
    // Encrypt PHI fields
    const encryptedData = await this.encryptPHI(data);
    
    const entity = await super.create(encryptedData, userId);

    // Log PHI access for HIPAA
    await this.auditService.logPHIAccess({
      action: 'create',
      entityType: this.entityType,
      entityId: entity.id,
      userId,
      timestamp: new Date()
    });

    return entity;
  }

  async findById(id: string, userId: string): Promise<T> {
    const entity = await super.findById(id, userId);

    // Decrypt PHI for authorized access
    const decryptedEntity = await this.decryptPHI(entity);

    // Log PHI access
    await this.auditService.logPHIAccess({
      action: 'read',
      entityType: this.entityType,
      entityId: id,
      userId,
      timestamp: new Date()
    });

    return decryptedEntity;
  }

  async delete(id: string, userId: string): Promise<void> {
    // PHI requires retention, use soft delete with archival
    await this.archiveForRetention(id, userId);
    await super.delete(id, userId);
  }
}
```

### Fintech CRUD (Audit Trail)

```typescript
// Financial data with complete audit trail
class FintechCRUDService<T extends FinancialEntity> extends CRUDService<T> {
  async update(id: string, data: Partial<T>, userId: string): Promise<T> {
    const previousState = await this.findById(id, userId);
    
    const entity = await super.update(id, data, userId);

    // Create immutable audit record
    await this.auditService.createAuditRecord({
      entityType: this.entityType,
      entityId: id,
      action: 'update',
      previousState,
      newState: entity,
      userId,
      timestamp: new Date(),
      ipAddress: getClientIP(),
      signature: await this.signAuditRecord(previousState, entity)
    });

    return entity;
  }

  async delete(id: string, userId: string): Promise<void> {
    // Financial records cannot be deleted, only archived
    throw new OperationNotAllowedError(
      'Financial records cannot be deleted. Use archive instead.'
    );
  }

  async archive(id: string, userId: string, reason: string): Promise<void> {
    const entity = await this.findById(id, userId);
    
    await this.archiveService.archive(entity, {
      reason,
      archivedBy: userId,
      retentionPeriod: this.getRetentionPeriod(entity)
    });

    await super.update(id, { status: 'archived' } as Partial<T>, userId);
  }
}
```

## Template Composition Rules

### Compatible Templates
- `analytics/user-analytics.md` - Track CRUD metrics
- `performance/caching-strategies.md` - Cache read operations
- `search-discovery/full-text-search.md` - Index for search
- `data-processing/data-pipelines.md` - ETL integration
- `integration/webhook-systems.md` - Trigger webhooks on changes

### Conflict Resolution
- When composing with `healthcare/patient-data-management.md`, encryption is mandatory
- When composing with `fintech/transaction-processing.md`, audit trails are required
- When composing with `content-management/content-versioning.md`, version history is maintained
