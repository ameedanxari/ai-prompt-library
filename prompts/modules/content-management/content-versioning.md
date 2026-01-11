# Content Versioning Template

## Purpose

This template provides comprehensive patterns for implementing content versioning systems, covering version control, revision history, draft management, rollback capabilities, and collaborative editing with conflict resolution.

## Context

Content versioning is essential for maintaining content integrity, enabling collaboration, and providing audit trails. A well-designed versioning system tracks all changes, supports multiple drafts, enables easy rollback, and handles concurrent editing conflicts. This template addresses the complexity of building robust versioning that scales with content volume while maintaining performance and usability.

## Instructions

1. **Setup Version Storage**: Configure version storage and retention policies
2. **Implement Version Tracking**: Build automatic version creation on content changes
3. **Add Draft Management**: Enable multiple drafts and draft workflows
4. **Configure Rollback System**: Implement version comparison and restoration
5. **Enable Conflict Resolution**: Add concurrent editing detection and resolution
6. **Add Audit Trail**: Implement comprehensive change logging
7. **Test Versioning Workflows**: Validate version creation, comparison, and rollback

## Examples

### Example 1: Version Management Service
```typescript
interface VersioningService {
  createVersion(contentId: string, content: ContentData, metadata: VersionMetadata): Promise<Version>;
  getVersion(versionId: string): Promise<Version>;
  getVersionHistory(contentId: string, options?: HistoryOptions): Promise<VersionHistory>;
  compareVersions(versionId1: string, versionId2: string): Promise<VersionDiff>;
  restoreVersion(contentId: string, versionId: string): Promise<Content>;
}

const versioningService = new VersioningService();
const version = await versioningService.createVersion('content-123', {
  title: 'Updated Article Title',
  body: '<p>Updated content...</p>'
}, {
  changeType: 'edit',
  changeDescription: 'Updated introduction paragraph',
  createdBy: 'user-456'
});
```


### Example 2: Draft Management
```typescript
interface DraftService {
  createDraft(contentId: string, userId: string): Promise<Draft>;
  saveDraft(draftId: string, content: ContentData): Promise<Draft>;
  publishDraft(draftId: string): Promise<Content>;
  discardDraft(draftId: string): Promise<void>;
  listDrafts(contentId: string): Promise<Draft[]>;
}

const draftService = new DraftService();
const draft = await draftService.createDraft('content-123', 'user-456');
await draftService.saveDraft(draft.id, {
  title: 'Work in Progress',
  body: '<p>Draft content...</p>'
});
```

### Example 3: Version Comparison and Rollback
```typescript
// Compare two versions
const diff = await versioningService.compareVersions('v1', 'v2');
console.log(diff.changes); // Array of field-level changes

// Restore previous version
const restored = await versioningService.restoreVersion('content-123', 'v1');
console.log(`Restored to version ${restored.currentVersion}`);
```

## Variables

| Variable | Description | Type | Required | Default |
|----------|-------------|------|----------|---------|
| enableAutoVersioning | Automatically create versions on save | boolean | No | true |
| maxVersionsPerContent | Maximum versions to retain per content | number | No | 100 |
| versionRetentionDays | Days to retain old versions | number | No | 365 |
| enableDrafts | Enable draft functionality | boolean | No | true |
| maxDraftsPerContent | Maximum concurrent drafts per content | number | No | 10 |
| enableConflictDetection | Detect concurrent editing conflicts | boolean | No | true |
| enableDiffVisualization | Enable visual diff comparison | boolean | No | true |
| compressOldVersions | Compress versions older than threshold | boolean | No | true |

## Expected Output

This template will produce:
- **Version Control System**: Automatic version creation and tracking
- **Revision History**: Complete history of all content changes
- **Draft Management**: Multiple draft support with workflows
- **Rollback Capability**: Easy restoration of previous versions
- **Version Comparison**: Side-by-side and inline diff views
- **Conflict Resolution**: Concurrent editing detection and merging
- **Audit Trail**: Comprehensive change logging and attribution
- **Storage Optimization**: Efficient version storage with compression

## Implementation Patterns

### Version Data Model

**Version Entity Structure**
```typescript
interface Version {
  id: string;
  contentId: string;
  versionNumber: number;
  
  // Content snapshot
  content: ContentSnapshot;
  
  // Metadata
  metadata: VersionMetadata;
  
  // Change information
  changeType: ChangeType;
  changeDescription?: string;
  changedFields: string[];
  
  // Authorship
  createdBy: string;
  createdAt: Date;
  
  // Storage
  storageType: 'full' | 'delta' | 'compressed';
  previousVersionId?: string;
  
  // Status
  status: VersionStatus;
}

interface ContentSnapshot {
  title: string;
  body: string;
  excerpt?: string;
  metadata: Record<string, any>;
  media: string[];
  categories: string[];
  tags: string[];
}

interface VersionMetadata {
  changeType: ChangeType;
  changeDescription?: string;
  createdBy: string;
  clientInfo?: ClientInfo;
  sessionId?: string;
}

type ChangeType = 'create' | 'edit' | 'publish' | 'unpublish' | 'restore' | 'autosave' | 'merge';
type VersionStatus = 'active' | 'archived' | 'deleted';
```

### Version Management Service

**Core Versioning Implementation**
```typescript
class VersioningService {
  async createVersion(
    contentId: string,
    content: ContentData,
    metadata: VersionMetadata
  ): Promise<Version> {
    // Get current version number
    const latestVersion = await this.getLatestVersion(contentId);
    const newVersionNumber = latestVersion ? latestVersion.versionNumber + 1 : 1;
    
    // Determine changed fields
    const changedFields = latestVersion 
      ? this.detectChangedFields(latestVersion.content, content)
      : Object.keys(content);
    
    // Determine storage type
    const storageType = this.determineStorageType(content, latestVersion);
    
    // Create version
    const version: Version = {
      id: this.generateVersionId(),
      contentId,
      versionNumber: newVersionNumber,
      content: storageType === 'delta' 
        ? this.createDelta(latestVersion!.content, content)
        : content,
      metadata,
      changeType: metadata.changeType,
      changeDescription: metadata.changeDescription,
      changedFields,
      createdBy: metadata.createdBy,
      createdAt: new Date(),
      storageType,
      previousVersionId: latestVersion?.id,
      status: 'active'
    };
    
    await this.versionRepository.save(version);
    
    // Cleanup old versions if needed
    await this.cleanupOldVersions(contentId);
    
    return version;
  }

  async getVersionHistory(
    contentId: string,
    options?: HistoryOptions
  ): Promise<VersionHistory> {
    const versions = await this.versionRepository.findByContentId(contentId, {
      limit: options?.limit || 50,
      offset: options?.offset || 0,
      includeAutosaves: options?.includeAutosaves || false
    });
    
    // Enrich with user information
    const enrichedVersions = await Promise.all(
      versions.map(async v => ({
        ...v,
        createdByUser: await this.userService.getUser(v.createdBy)
      }))
    );
    
    const totalCount = await this.versionRepository.countByContentId(contentId);
    
    return {
      versions: enrichedVersions,
      totalCount,
      hasMore: (options?.offset || 0) + versions.length < totalCount
    };
  }

  async restoreVersion(contentId: string, versionId: string): Promise<Content> {
    const version = await this.getVersion(versionId);
    
    if (version.contentId !== contentId) {
      throw new Error('Version does not belong to this content');
    }
    
    // Reconstruct full content if stored as delta
    const fullContent = await this.reconstructContent(version);
    
    // Create new version with restored content
    await this.createVersion(contentId, fullContent, {
      changeType: 'restore',
      changeDescription: `Restored from version ${version.versionNumber}`,
      createdBy: this.currentUser.id
    });
    
    // Update content with restored data
    const content = await this.contentRepository.update(contentId, fullContent);
    
    return content;
  }

  private detectChangedFields(oldContent: ContentSnapshot, newContent: ContentData): string[] {
    const changedFields: string[] = [];
    
    for (const key of Object.keys(newContent)) {
      const oldValue = oldContent[key];
      const newValue = newContent[key];
      
      if (!this.deepEqual(oldValue, newValue)) {
        changedFields.push(key);
      }
    }
    
    return changedFields;
  }

  private determineStorageType(
    content: ContentData,
    previousVersion?: Version
  ): 'full' | 'delta' | 'compressed' {
    if (!previousVersion) {
      return 'full';
    }
    
    // Use delta storage for small changes
    const contentSize = JSON.stringify(content).length;
    const deltaSize = this.estimateDeltaSize(previousVersion.content, content);
    
    if (deltaSize < contentSize * 0.5) {
      return 'delta';
    }
    
    return 'full';
  }

  private async cleanupOldVersions(contentId: string): Promise<void> {
    const versions = await this.versionRepository.findByContentId(contentId, {
      limit: this.config.maxVersionsPerContent + 10
    });
    
    if (versions.length <= this.config.maxVersionsPerContent) {
      return;
    }
    
    // Keep important versions (published, major edits)
    const importantVersions = versions.filter(v => 
      v.changeType === 'publish' || 
      v.changeType === 'create' ||
      v.metadata.isImportant
    );
    
    // Archive or delete excess versions
    const versionsToArchive = versions
      .filter(v => !importantVersions.includes(v))
      .slice(this.config.maxVersionsPerContent - importantVersions.length);
    
    for (const version of versionsToArchive) {
      await this.archiveVersion(version.id);
    }
  }
}
```

### Version Comparison and Diff

**Diff Generation**
```typescript
interface VersionDiff {
  versionId1: string;
  versionId2: string;
  changes: FieldChange[];
  summary: DiffSummary;
}

interface FieldChange {
  field: string;
  type: 'added' | 'removed' | 'modified';
  oldValue?: any;
  newValue?: any;
  diff?: TextDiff[];
}

interface TextDiff {
  type: 'equal' | 'insert' | 'delete';
  value: string;
  position: number;
}

class VersionDiffService {
  async compareVersions(versionId1: string, versionId2: string): Promise<VersionDiff> {
    const [version1, version2] = await Promise.all([
      this.versioningService.getVersion(versionId1),
      this.versioningService.getVersion(versionId2)
    ]);
    
    // Reconstruct full content for both versions
    const content1 = await this.reconstructContent(version1);
    const content2 = await this.reconstructContent(version2);
    
    const changes: FieldChange[] = [];
    
    // Compare each field
    const allFields = new Set([...Object.keys(content1), ...Object.keys(content2)]);
    
    for (const field of allFields) {
      const oldValue = content1[field];
      const newValue = content2[field];
      
      if (oldValue === undefined && newValue !== undefined) {
        changes.push({ field, type: 'added', newValue });
      } else if (oldValue !== undefined && newValue === undefined) {
        changes.push({ field, type: 'removed', oldValue });
      } else if (!this.deepEqual(oldValue, newValue)) {
        const change: FieldChange = { field, type: 'modified', oldValue, newValue };
        
        // Generate text diff for string fields
        if (typeof oldValue === 'string' && typeof newValue === 'string') {
          change.diff = this.generateTextDiff(oldValue, newValue);
        }
        
        changes.push(change);
      }
    }
    
    return {
      versionId1,
      versionId2,
      changes,
      summary: this.generateDiffSummary(changes)
    };
  }

  private generateTextDiff(oldText: string, newText: string): TextDiff[] {
    // Use diff-match-patch or similar algorithm
    const diffs = this.diffMatchPatch.diff_main(oldText, newText);
    this.diffMatchPatch.diff_cleanupSemantic(diffs);
    
    let position = 0;
    return diffs.map(([type, value]) => {
      const diff: TextDiff = {
        type: type === 0 ? 'equal' : type === 1 ? 'insert' : 'delete',
        value,
        position
      };
      
      if (type !== 1) { // Not an insert
        position += value.length;
      }
      
      return diff;
    });
  }

  private generateDiffSummary(changes: FieldChange[]): DiffSummary {
    return {
      totalChanges: changes.length,
      fieldsAdded: changes.filter(c => c.type === 'added').length,
      fieldsRemoved: changes.filter(c => c.type === 'removed').length,
      fieldsModified: changes.filter(c => c.type === 'modified').length,
      changedFields: changes.map(c => c.field)
    };
  }
}
```


### Draft Management System

**Draft Implementation**
```typescript
interface Draft {
  id: string;
  contentId: string;
  userId: string;
  
  // Draft content
  content: ContentData;
  
  // Status
  status: DraftStatus;
  
  // Metadata
  name?: string;
  description?: string;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  lastAutoSaveAt?: Date;
  
  // Base version
  baseVersionId?: string;
}

type DraftStatus = 'active' | 'submitted' | 'approved' | 'rejected' | 'published' | 'discarded';

class DraftService {
  async createDraft(contentId: string, userId: string, options?: DraftOptions): Promise<Draft> {
    // Check draft limit
    const existingDrafts = await this.draftRepository.findByContentAndUser(contentId, userId);
    if (existingDrafts.length >= this.config.maxDraftsPerContent) {
      throw new Error(`Maximum of ${this.config.maxDraftsPerContent} drafts per content exceeded`);
    }
    
    // Get current content as base
    const content = await this.contentRepository.findById(contentId);
    const latestVersion = await this.versioningService.getLatestVersion(contentId);
    
    const draft: Draft = {
      id: this.generateDraftId(),
      contentId,
      userId,
      content: {
        title: content.title,
        body: content.body,
        excerpt: content.excerpt,
        metadata: content.metadata
      },
      status: 'active',
      name: options?.name,
      description: options?.description,
      createdAt: new Date(),
      updatedAt: new Date(),
      baseVersionId: latestVersion?.id
    };
    
    await this.draftRepository.save(draft);
    
    return draft;
  }

  async saveDraft(draftId: string, content: Partial<ContentData>): Promise<Draft> {
    const draft = await this.getDraft(draftId);
    
    if (draft.status !== 'active') {
      throw new Error('Cannot modify draft in current status');
    }
    
    // Merge content updates
    draft.content = {
      ...draft.content,
      ...content
    };
    draft.updatedAt = new Date();
    
    await this.draftRepository.save(draft);
    
    return draft;
  }

  async autoSaveDraft(draftId: string, content: Partial<ContentData>): Promise<Draft> {
    const draft = await this.getDraft(draftId);
    
    // Only autosave if there are actual changes
    if (this.hasChanges(draft.content, content)) {
      draft.content = { ...draft.content, ...content };
      draft.lastAutoSaveAt = new Date();
      await this.draftRepository.save(draft);
    }
    
    return draft;
  }

  async publishDraft(draftId: string): Promise<Content> {
    const draft = await this.getDraft(draftId);
    
    // Check for conflicts with base version
    const latestVersion = await this.versioningService.getLatestVersion(draft.contentId);
    if (latestVersion && draft.baseVersionId !== latestVersion.id) {
      throw new ConflictError('Content has been modified since draft was created', {
        draftBaseVersion: draft.baseVersionId,
        currentVersion: latestVersion.id
      });
    }
    
    // Update content
    const content = await this.contentRepository.update(draft.contentId, draft.content);
    
    // Create version
    await this.versioningService.createVersion(draft.contentId, draft.content, {
      changeType: 'edit',
      changeDescription: `Published from draft: ${draft.name || draft.id}`,
      createdBy: draft.userId
    });
    
    // Update draft status
    draft.status = 'published';
    await this.draftRepository.save(draft);
    
    return content;
  }

  async mergeDraft(draftId: string, strategy: MergeStrategy): Promise<Draft> {
    const draft = await this.getDraft(draftId);
    const latestVersion = await this.versioningService.getLatestVersion(draft.contentId);
    
    if (!latestVersion || draft.baseVersionId === latestVersion.id) {
      return draft; // No merge needed
    }
    
    const baseContent = await this.versioningService.reconstructContent(
      await this.versioningService.getVersion(draft.baseVersionId!)
    );
    const latestContent = await this.versioningService.reconstructContent(latestVersion);
    
    // Perform three-way merge
    const mergedContent = await this.threeWayMerge(
      baseContent,
      draft.content,
      latestContent,
      strategy
    );
    
    draft.content = mergedContent;
    draft.baseVersionId = latestVersion.id;
    draft.updatedAt = new Date();
    
    await this.draftRepository.save(draft);
    
    return draft;
  }

  private async threeWayMerge(
    base: ContentData,
    ours: ContentData,
    theirs: ContentData,
    strategy: MergeStrategy
  ): Promise<ContentData> {
    const merged: ContentData = {};
    const allFields = new Set([
      ...Object.keys(base),
      ...Object.keys(ours),
      ...Object.keys(theirs)
    ]);
    
    for (const field of allFields) {
      const baseValue = base[field];
      const ourValue = ours[field];
      const theirValue = theirs[field];
      
      // No conflict if values are equal
      if (this.deepEqual(ourValue, theirValue)) {
        merged[field] = ourValue;
        continue;
      }
      
      // Our change only
      if (this.deepEqual(baseValue, theirValue)) {
        merged[field] = ourValue;
        continue;
      }
      
      // Their change only
      if (this.deepEqual(baseValue, ourValue)) {
        merged[field] = theirValue;
        continue;
      }
      
      // Conflict - apply strategy
      switch (strategy) {
        case 'ours':
          merged[field] = ourValue;
          break;
        case 'theirs':
          merged[field] = theirValue;
          break;
        case 'manual':
          throw new MergeConflictError(`Conflict in field: ${field}`, {
            field,
            base: baseValue,
            ours: ourValue,
            theirs: theirValue
          });
        default:
          merged[field] = ourValue; // Default to ours
      }
    }
    
    return merged;
  }
}
```

### Conflict Detection and Resolution

**Concurrent Editing Handler**
```typescript
interface ConflictDetectionService {
  checkForConflicts(contentId: string, baseVersionId: string): Promise<ConflictCheck>;
  lockContent(contentId: string, userId: string, duration: number): Promise<ContentLock>;
  unlockContent(contentId: string, userId: string): Promise<void>;
  resolveConflict(contentId: string, resolution: ConflictResolution): Promise<Content>;
}

interface ContentLock {
  contentId: string;
  userId: string;
  lockedAt: Date;
  expiresAt: Date;
  lockType: 'exclusive' | 'shared';
}

interface ConflictCheck {
  hasConflict: boolean;
  currentVersion?: Version;
  conflictingChanges?: FieldChange[];
}

class ConflictDetectionService {
  async checkForConflicts(contentId: string, baseVersionId: string): Promise<ConflictCheck> {
    const latestVersion = await this.versioningService.getLatestVersion(contentId);
    
    if (!latestVersion || latestVersion.id === baseVersionId) {
      return { hasConflict: false };
    }
    
    // Get diff between base and latest
    const diff = await this.versionDiffService.compareVersions(baseVersionId, latestVersion.id);
    
    return {
      hasConflict: true,
      currentVersion: latestVersion,
      conflictingChanges: diff.changes
    };
  }

  async lockContent(contentId: string, userId: string, duration: number): Promise<ContentLock> {
    // Check for existing lock
    const existingLock = await this.lockRepository.findByContentId(contentId);
    
    if (existingLock && existingLock.expiresAt > new Date()) {
      if (existingLock.userId !== userId) {
        throw new ContentLockedError('Content is locked by another user', {
          lockedBy: existingLock.userId,
          expiresAt: existingLock.expiresAt
        });
      }
      // Extend existing lock
      existingLock.expiresAt = new Date(Date.now() + duration);
      await this.lockRepository.save(existingLock);
      return existingLock;
    }
    
    // Create new lock
    const lock: ContentLock = {
      contentId,
      userId,
      lockedAt: new Date(),
      expiresAt: new Date(Date.now() + duration),
      lockType: 'exclusive'
    };
    
    await this.lockRepository.save(lock);
    
    return lock;
  }

  async resolveConflict(contentId: string, resolution: ConflictResolution): Promise<Content> {
    const { baseVersionId, resolvedContent, strategy } = resolution;
    
    // Verify conflict still exists
    const conflictCheck = await this.checkForConflicts(contentId, baseVersionId);
    
    if (!conflictCheck.hasConflict) {
      // No conflict, just save
      return this.contentRepository.update(contentId, resolvedContent);
    }
    
    // Create merge version
    await this.versioningService.createVersion(contentId, resolvedContent, {
      changeType: 'merge',
      changeDescription: `Merged conflict using ${strategy} strategy`,
      createdBy: this.currentUser.id,
      mergeInfo: {
        baseVersionId,
        mergedVersionId: conflictCheck.currentVersion!.id,
        strategy
      }
    });
    
    return this.contentRepository.update(contentId, resolvedContent);
  }
}
```

### Audit Trail

**Change Logging**
```typescript
interface AuditEntry {
  id: string;
  contentId: string;
  versionId: string;
  action: AuditAction;
  userId: string;
  timestamp: Date;
  details: AuditDetails;
  clientInfo: ClientInfo;
}

type AuditAction = 
  | 'create'
  | 'edit'
  | 'publish'
  | 'unpublish'
  | 'delete'
  | 'restore'
  | 'lock'
  | 'unlock'
  | 'merge'
  | 'view';

interface AuditDetails {
  changedFields?: string[];
  previousVersionId?: string;
  newVersionId?: string;
  description?: string;
  metadata?: Record<string, any>;
}

class AuditService {
  async logAction(
    contentId: string,
    action: AuditAction,
    details: AuditDetails
  ): Promise<AuditEntry> {
    const entry: AuditEntry = {
      id: this.generateAuditId(),
      contentId,
      versionId: details.newVersionId || '',
      action,
      userId: this.currentUser.id,
      timestamp: new Date(),
      details,
      clientInfo: this.getClientInfo()
    };
    
    await this.auditRepository.save(entry);
    
    // Emit audit event for real-time monitoring
    this.eventEmitter.emit('audit:action', entry);
    
    return entry;
  }

  async getAuditLog(
    contentId: string,
    options?: AuditLogOptions
  ): Promise<AuditLog> {
    const entries = await this.auditRepository.findByContentId(contentId, {
      limit: options?.limit || 100,
      offset: options?.offset || 0,
      actions: options?.actions,
      startDate: options?.startDate,
      endDate: options?.endDate,
      userId: options?.userId
    });
    
    // Enrich with user information
    const enrichedEntries = await Promise.all(
      entries.map(async entry => ({
        ...entry,
        user: await this.userService.getUser(entry.userId)
      }))
    );
    
    return {
      entries: enrichedEntries,
      totalCount: await this.auditRepository.countByContentId(contentId, options)
    };
  }
}
```

### Integration Points

**External System Integration**
```typescript
interface VersioningIntegration {
  exportVersionHistory(contentId: string, format: ExportFormat): Promise<ExportResult>;
  importVersionHistory(contentId: string, data: ImportData): Promise<ImportResult>;
  syncWithExternalVCS(contentId: string, vcsConfig: VCSConfig): Promise<SyncResult>;
}

class VersioningIntegrationService implements VersioningIntegration {
  async syncWithExternalVCS(contentId: string, vcsConfig: VCSConfig): Promise<SyncResult> {
    const versions = await this.versioningService.getVersionHistory(contentId);
    
    // Map versions to VCS commits
    for (const version of versions.versions) {
      const content = await this.versioningService.reconstructContent(version);
      
      await this.vcsClient.commit({
        repository: vcsConfig.repository,
        branch: vcsConfig.branch,
        message: `Version ${version.versionNumber}: ${version.changeDescription || version.changeType}`,
        author: await this.getUserEmail(version.createdBy),
        content: this.serializeContent(content),
        timestamp: version.createdAt
      });
    }
    
    return { success: true, syncedVersions: versions.versions.length };
  }
}
```

### Security Considerations

**Version Access Control**
```typescript
interface VersionSecurityService {
  checkVersionAccess(userId: string, versionId: string, action: string): Promise<boolean>;
  filterAccessibleVersions(userId: string, versions: Version[]): Promise<Version[]>;
  validateRestorePermission(userId: string, contentId: string): Promise<boolean>;
}

class VersionSecurity implements VersionSecurityService {
  async checkVersionAccess(userId: string, versionId: string, action: string): Promise<boolean> {
    const version = await this.versioningService.getVersion(versionId);
    const content = await this.contentRepository.findById(version.contentId);
    
    // Check content-level permissions first
    const hasContentAccess = await this.contentSecurityService.checkAccess(
      userId,
      content.id,
      action
    );
    
    if (!hasContentAccess) {
      return false;
    }
    
    // Check version-specific permissions
    if (action === 'restore') {
      return this.rbacService.checkPermission(userId, 'version', 'restore');
    }
    
    return true;
  }
}
```

### Testing Considerations

**Versioning System Testing**
```typescript
describe('VersioningService', () => {
  describe('createVersion', () => {
    it('should create version with incremented number', async () => {
      const v1 = await versioningService.createVersion('content-1', content1, metadata);
      const v2 = await versioningService.createVersion('content-1', content2, metadata);
      
      expect(v1.versionNumber).toBe(1);
      expect(v2.versionNumber).toBe(2);
    });

    it('should detect changed fields', async () => {
      await versioningService.createVersion('content-1', { title: 'Original' }, metadata);
      const v2 = await versioningService.createVersion('content-1', { title: 'Updated' }, metadata);
      
      expect(v2.changedFields).toContain('title');
    });
  });

  describe('restoreVersion', () => {
    it('should restore content to previous version', async () => {
      const v1 = await versioningService.createVersion('content-1', { title: 'V1' }, metadata);
      await versioningService.createVersion('content-1', { title: 'V2' }, metadata);
      
      const restored = await versioningService.restoreVersion('content-1', v1.id);
      
      expect(restored.title).toBe('V1');
    });
  });
});

describe('DraftService', () => {
  describe('publishDraft', () => {
    it('should detect conflicts with newer versions', async () => {
      const draft = await draftService.createDraft('content-1', 'user-1');
      
      // Simulate another user editing
      await versioningService.createVersion('content-1', { title: 'Other Edit' }, metadata);
      
      await expect(draftService.publishDraft(draft.id))
        .rejects.toThrow(ConflictError);
    });
  });
});
```

## Real-World Considerations

**Performance Optimization**
- Use delta storage for incremental changes
- Compress old versions to reduce storage
- Cache frequently accessed versions
- Implement lazy loading for version history

**Storage Management**
- Define retention policies for old versions
- Archive versions to cold storage
- Implement version pruning strategies
- Monitor storage usage and costs

**User Experience**
- Provide clear version comparison UI
- Show meaningful change descriptions
- Enable easy rollback with preview
- Support keyboard shortcuts for common actions

**Scalability**
- Partition version storage by content
- Use distributed storage for large content
- Implement efficient diff algorithms
- Consider eventual consistency for non-critical operations

This template provides a comprehensive foundation for implementing robust content versioning systems that maintain content integrity, enable collaboration, and provide complete audit trails while optimizing for performance and storage efficiency.
