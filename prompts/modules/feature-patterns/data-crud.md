# CRUD Operations Module

## Overview
This module provides comprehensive Create, Read, Update, Delete operations with validation, security, accessibility, and offline capabilities for robust data management across all application entities.

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