# Content Creation Template

## Purpose

This template provides comprehensive patterns for implementing content creation systems in content management platforms, covering rich text editors, media upload, content templates, and publishing workflows for user-generated and editorial content.

## Context

Content creation is the foundation of any content management system, enabling users to produce, edit, and publish various types of content. A well-designed creation system balances ease of use with powerful features, supporting everything from simple text posts to complex multimedia content. This template addresses the complexity of building intuitive creation tools, efficient media processing pipelines, and flexible publishing workflows that empower creators while maintaining content quality and consistency.

## Instructions

1. **Setup Content Creation Infrastructure**: Configure content storage, media processing, and editor components
2. **Implement Rich Text Editor**: Build advanced text editing with formatting, media embedding, and collaboration
3. **Add Media Upload System**: Enable photo, video, document, and file upload with processing
4. **Configure Content Templates**: Implement reusable content templates and structured content types
5. **Enable Publishing Workflows**: Add drafts, scheduling, preview, and publication controls
6. **Add Collaboration Features**: Implement co-authoring, comments, and review capabilities
7. **Test Creation Flows**: Validate content creation, editing, and publishing workflows

## Examples

### Example 1: Content Creation Service
```typescript
interface ContentCreationService {
  createContent(userId: string, content: ContentInput): Promise<Content>;
  updateContent(contentId: string, updates: ContentUpdate): Promise<Content>;
  uploadMedia(userId: string, media: MediaFile): Promise<MediaAsset>;
  publishContent(contentId: string, options: PublishOptions): Promise<Content>;
}

interface ContentInput {
  title: string;
  body: string;
  contentType: ContentType;
  templateId?: string;
  media?: string[];
  metadata?: Record<string, any>;
  visibility: ContentVisibility;
}

const contentService = new ContentCreationService();
const content = await contentService.createContent('user-123', {
  title: 'Getting Started with Content Management',
  body: '<p>Welcome to our comprehensive guide...</p>',
  contentType: 'article',
  templateId: 'blog-post',
  visibility: 'draft'
});
```

### Example 2: Rich Text Editor Configuration
```typescript
interface EditorConfig {
  features: EditorFeature[];
  mediaUpload: MediaUploadConfig;
  collaboration: CollaborationConfig;
  autosave: AutosaveConfig;
}

const editorConfig: EditorConfig = {
  features: [
    'bold', 'italic', 'underline', 'strikethrough',
    'headings', 'lists', 'blockquote', 'code',
    'links', 'images', 'videos', 'tables',
    'mentions', 'hashtags', 'embeds'
  ],
  mediaUpload: {
    maxFileSize: 50 * 1024 * 1024, // 50MB
    allowedTypes: ['image/*', 'video/*', 'application/pdf'],
    autoOptimize: true
  },
  collaboration: {
    enabled: true,
    realTimeSync: true,
    showCursors: true
  },
  autosave: {
    enabled: true,
    intervalMs: 30000,
    maxVersions: 10
  }
};
```

### Example 3: Content Template System
```typescript
interface ContentTemplate {
  id: string;
  name: string;
  description: string;
  contentType: ContentType;
  structure: TemplateStructure;
  defaultValues: Record<string, any>;
  validationRules: ValidationRule[];
}

const blogTemplate: ContentTemplate = {
  id: 'blog-post',
  name: 'Blog Post',
  description: 'Standard blog post with featured image and categories',
  contentType: 'article',
  structure: {
    fields: [
      { name: 'title', type: 'text', required: true, maxLength: 200 },
      { name: 'excerpt', type: 'text', required: true, maxLength: 500 },
      { name: 'featuredImage', type: 'media', required: true, mediaType: 'image' },
      { name: 'body', type: 'richtext', required: true },
      { name: 'categories', type: 'taxonomy', required: true, multiple: true },
      { name: 'tags', type: 'tags', required: false }
    ]
  },
  defaultValues: {
    visibility: 'draft',
    commentsEnabled: true
  },
  validationRules: [
    { field: 'title', rule: 'minLength', value: 10 },
    { field: 'body', rule: 'minWords', value: 100 }
  ]
};
```

## Variables

| Variable | Description | Type | Required | Default |
|----------|-------------|------|----------|---------|
| enableRichTextEditor | Enable rich text formatting capabilities | boolean | No | true |
| enableMediaUpload | Enable media file uploads | boolean | No | true |
| enableTemplates | Enable content templates | boolean | No | true |
| enableDrafts | Enable draft saving functionality | boolean | No | true |
| enableScheduling | Enable scheduled publishing | boolean | No | true |
| enableCollaboration | Enable real-time collaboration | boolean | No | false |
| enableAutosave | Enable automatic content saving | boolean | No | true |
| maxMediaSize | Maximum media file size in bytes | number | No | 52428800 |
| supportedMediaTypes | Supported media MIME types | string[] | No | ["image/*", "video/*"] |
| autosaveInterval | Autosave interval in milliseconds | number | No | 30000 |

## Expected Output

This template will produce:
- **Rich Text Editor**: Advanced content editing with formatting, media, and collaboration
- **Media Upload System**: File upload with processing, optimization, and storage
- **Content Templates**: Reusable templates for structured content creation
- **Draft Management**: Save, restore, and manage content drafts
- **Publishing Workflow**: Preview, schedule, and publish content
- **Collaboration Tools**: Real-time co-editing and commenting
- **Content Validation**: Input validation and quality checks
- **Version History**: Track changes and restore previous versions

## Implementation Patterns

### Core Content Creation Components

**Rich Text Editor Implementation**
```typescript
interface RichTextEditor {
  initialize(container: HTMLElement, config: EditorConfig): void;
  getContent(): ContentOutput;
  setContent(content: string): void;
  insertMedia(media: MediaAsset): void;
  onContentChange(callback: (content: ContentOutput) => void): void;
  enableCollaboration(sessionId: string): void;
}

interface ContentOutput {
  html: string;
  plainText: string;
  wordCount: number;
  characterCount: number;
  mediaReferences: string[];
  mentions: string[];
  links: LinkReference[];
}

class ContentEditor implements RichTextEditor {
  private editor: any;
  private config: EditorConfig;
  private collaborationSession?: CollaborationSession;

  initialize(container: HTMLElement, config: EditorConfig): void {
    this.config = config;
    this.editor = this.createEditor(container, config);
    
    if (config.autosave.enabled) {
      this.setupAutosave(config.autosave);
    }
    
    if (config.mediaUpload) {
      this.setupMediaUpload(config.mediaUpload);
    }
  }

  private setupAutosave(config: AutosaveConfig): void {
    setInterval(() => {
      const content = this.getContent();
      this.saveVersion(content);
    }, config.intervalMs);
  }

  private async saveVersion(content: ContentOutput): Promise<void> {
    await this.versionService.saveVersion({
      content: content.html,
      timestamp: new Date(),
      type: 'autosave'
    });
  }
}
```

**Media Upload and Processing**
```typescript
interface MediaUploadService {
  uploadFile(file: File, options: UploadOptions): Promise<MediaAsset>;
  processMedia(assetId: string, operations: MediaOperation[]): Promise<MediaAsset>;
  getUploadProgress(uploadId: string): UploadProgress;
  cancelUpload(uploadId: string): void;
}

interface MediaAsset {
  id: string;
  filename: string;
  mimeType: string;
  size: number;
  url: string;
  thumbnailUrl?: string;
  dimensions?: { width: number; height: number };
  duration?: number;
  metadata: MediaMetadata;
  processingStatus: ProcessingStatus;
  createdAt: Date;
}

class MediaUploader implements MediaUploadService {
  async uploadFile(file: File, options: UploadOptions): Promise<MediaAsset> {
    // Validate file
    this.validateFile(file, options);
    
    // Generate upload URL
    const uploadUrl = await this.getPresignedUploadUrl(file);
    
    // Upload file with progress tracking
    const uploadResult = await this.performUpload(file, uploadUrl, options);
    
    // Process media (resize, transcode, etc.)
    const processedAsset = await this.processMedia(uploadResult.assetId, [
      { type: 'optimize', quality: 85 },
      { type: 'generateThumbnail', size: { width: 300, height: 200 } }
    ]);
    
    return processedAsset;
  }

  private validateFile(file: File, options: UploadOptions): void {
    if (file.size > options.maxSize) {
      throw new Error(`File size exceeds maximum allowed: ${options.maxSize} bytes`);
    }
    
    if (!this.isAllowedType(file.type, options.allowedTypes)) {
      throw new Error(`File type not allowed: ${file.type}`);
    }
  }
}
```

**Content Template Engine**
```typescript
interface ContentTemplateEngine {
  getTemplate(templateId: string): Promise<ContentTemplate>;
  createFromTemplate(templateId: string, data: Record<string, any>): Promise<Content>;
  validateContent(content: Content, template: ContentTemplate): ValidationResult;
  listTemplates(contentType?: ContentType): Promise<ContentTemplate[]>;
}

class TemplateEngine implements ContentTemplateEngine {
  async createFromTemplate(templateId: string, data: Record<string, any>): Promise<Content> {
    const template = await this.getTemplate(templateId);
    
    // Validate data against template structure
    const validation = this.validateContent({ ...data } as Content, template);
    if (!validation.isValid) {
      throw new ValidationError(validation.errors);
    }
    
    // Apply default values
    const contentData = this.applyDefaults(data, template.defaultValues);
    
    // Create content with template reference
    const content = await this.contentService.create({
      ...contentData,
      templateId: template.id,
      contentType: template.contentType
    });
    
    return content;
  }

  validateContent(content: Content, template: ContentTemplate): ValidationResult {
    const errors: ValidationError[] = [];
    
    for (const field of template.structure.fields) {
      const value = content[field.name];
      
      // Check required fields
      if (field.required && !value) {
        errors.push({ field: field.name, message: `${field.name} is required` });
        continue;
      }
      
      // Apply validation rules
      for (const rule of template.validationRules.filter(r => r.field === field.name)) {
        const ruleResult = this.applyValidationRule(value, rule);
        if (!ruleResult.isValid) {
          errors.push({ field: field.name, message: ruleResult.message });
        }
      }
    }
    
    return { isValid: errors.length === 0, errors };
  }
}
```

### Publishing Workflow Implementation

**Draft and Publishing Management**
```typescript
interface PublishingService {
  saveDraft(contentId: string, content: ContentUpdate): Promise<Content>;
  submitForReview(contentId: string): Promise<Content>;
  schedulePublication(contentId: string, publishAt: Date): Promise<Content>;
  publish(contentId: string, options?: PublishOptions): Promise<Content>;
  unpublish(contentId: string): Promise<Content>;
  getPublishingHistory(contentId: string): Promise<PublishingEvent[]>;
}

interface PublishOptions {
  notifySubscribers?: boolean;
  socialShare?: SocialShareConfig[];
  seoSettings?: SEOSettings;
  visibility?: ContentVisibility;
}

type ContentVisibility = 'draft' | 'private' | 'unlisted' | 'public' | 'scheduled';

class PublishingWorkflow implements PublishingService {
  async saveDraft(contentId: string, content: ContentUpdate): Promise<Content> {
    const existingContent = await this.contentRepository.findById(contentId);
    
    // Create draft version
    await this.versionService.createVersion(contentId, {
      content: content,
      type: 'draft',
      createdBy: content.updatedBy
    });
    
    // Update content with draft status
    return this.contentRepository.update(contentId, {
      ...content,
      status: 'draft',
      updatedAt: new Date()
    });
  }

  async schedulePublication(contentId: string, publishAt: Date): Promise<Content> {
    const content = await this.contentRepository.findById(contentId);
    
    // Validate content is ready for publication
    await this.validateForPublication(content);
    
    // Schedule publication job
    await this.scheduler.scheduleJob({
      type: 'publish_content',
      contentId,
      executeAt: publishAt,
      payload: { contentId }
    });
    
    // Update content status
    return this.contentRepository.update(contentId, {
      status: 'scheduled',
      scheduledPublishAt: publishAt
    });
  }

  async publish(contentId: string, options?: PublishOptions): Promise<Content> {
    const content = await this.contentRepository.findById(contentId);
    
    // Validate content
    await this.validateForPublication(content);
    
    // Create published version
    await this.versionService.createVersion(contentId, {
      content: content,
      type: 'published',
      createdBy: options?.publishedBy
    });
    
    // Update content status
    const publishedContent = await this.contentRepository.update(contentId, {
      status: 'published',
      publishedAt: new Date(),
      visibility: options?.visibility || 'public'
    });
    
    // Post-publish actions
    if (options?.notifySubscribers) {
      await this.notificationService.notifySubscribers(publishedContent);
    }
    
    if (options?.socialShare) {
      await this.socialService.shareContent(publishedContent, options.socialShare);
    }
    
    // Index for search
    await this.searchService.indexContent(publishedContent);
    
    return publishedContent;
  }

  private async validateForPublication(content: Content): Promise<void> {
    const errors: string[] = [];
    
    // Check required fields
    if (!content.title || content.title.trim().length === 0) {
      errors.push('Title is required');
    }
    
    if (!content.body || content.body.trim().length === 0) {
      errors.push('Content body is required');
    }
    
    // Check template validation if applicable
    if (content.templateId) {
      const template = await this.templateService.getTemplate(content.templateId);
      const validation = await this.templateService.validateContent(content, template);
      if (!validation.isValid) {
        errors.push(...validation.errors.map(e => e.message));
      }
    }
    
    if (errors.length > 0) {
      throw new ValidationError(errors);
    }
  }
}
```

### Content Data Models

**Content Entity Structure**
```typescript
interface Content {
  id: string;
  title: string;
  slug: string;
  body: string;
  excerpt?: string;
  contentType: ContentType;
  templateId?: string;
  
  // Status and visibility
  status: ContentStatus;
  visibility: ContentVisibility;
  
  // Media and assets
  featuredImage?: MediaAsset;
  media: MediaAsset[];
  attachments: Attachment[];
  
  // Organization
  categories: string[];
  tags: string[];
  
  // Metadata
  metadata: ContentMetadata;
  seoSettings: SEOSettings;
  
  // Authorship
  authorId: string;
  contributors: Contributor[];
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
  scheduledPublishAt?: Date;
  
  // Settings
  settings: ContentSettings;
}

type ContentStatus = 'draft' | 'pending_review' | 'approved' | 'scheduled' | 'published' | 'archived';

interface ContentMetadata {
  wordCount: number;
  readingTime: number;
  language: string;
  customFields: Record<string, any>;
}

interface SEOSettings {
  metaTitle?: string;
  metaDescription?: string;
  canonicalUrl?: string;
  noIndex?: boolean;
  noFollow?: boolean;
  structuredData?: Record<string, any>;
}

interface ContentSettings {
  commentsEnabled: boolean;
  sharingEnabled: boolean;
  trackingEnabled: boolean;
  passwordProtected: boolean;
  password?: string;
}
```

### Integration Points

**External System Integration**
```typescript
interface ContentIntegration {
  // CMS Integration
  syncWithExternalCMS(contentId: string, cmsConfig: CMSConfig): Promise<SyncResult>;
  
  // Social Media Integration
  shareToSocialMedia(contentId: string, platforms: SocialPlatform[]): Promise<ShareResult[]>;
  
  // Analytics Integration
  trackContentMetrics(contentId: string): Promise<void>;
  
  // Search Integration
  indexContent(content: Content): Promise<void>;
  removeFromIndex(contentId: string): Promise<void>;
}

class ContentIntegrationService implements ContentIntegration {
  async syncWithExternalCMS(contentId: string, cmsConfig: CMSConfig): Promise<SyncResult> {
    const content = await this.contentRepository.findById(contentId);
    
    // Transform content to CMS format
    const cmsContent = this.transformToCMSFormat(content, cmsConfig);
    
    // Push to external CMS
    const result = await this.cmsClient.pushContent(cmsContent, cmsConfig);
    
    // Store sync metadata
    await this.syncMetadataRepository.save({
      contentId,
      cmsId: result.externalId,
      syncedAt: new Date(),
      status: result.status
    });
    
    return result;
  }

  async indexContent(content: Content): Promise<void> {
    const searchDocument = {
      id: content.id,
      title: content.title,
      body: this.stripHtml(content.body),
      excerpt: content.excerpt,
      categories: content.categories,
      tags: content.tags,
      authorId: content.authorId,
      publishedAt: content.publishedAt,
      contentType: content.contentType
    };
    
    await this.searchClient.index('content', searchDocument);
  }
}
```

### Security Considerations

**Content Security Implementation**
```typescript
interface ContentSecurityService {
  validateContentSecurity(content: Content): SecurityValidationResult;
  sanitizeContent(content: string): string;
  checkPermissions(userId: string, contentId: string, action: ContentAction): Promise<boolean>;
  encryptSensitiveContent(content: Content): Promise<Content>;
}

class ContentSecurity implements ContentSecurityService {
  sanitizeContent(content: string): string {
    // Remove potentially dangerous HTML
    const sanitized = this.htmlSanitizer.sanitize(content, {
      allowedTags: ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
                    'ul', 'ol', 'li', 'blockquote', 'code', 'pre', 'a', 'img', 'table',
                    'thead', 'tbody', 'tr', 'th', 'td'],
      allowedAttributes: {
        'a': ['href', 'title', 'target', 'rel'],
        'img': ['src', 'alt', 'title', 'width', 'height'],
        '*': ['class', 'id']
      },
      allowedSchemes: ['http', 'https', 'mailto']
    });
    
    return sanitized;
  }

  async checkPermissions(userId: string, contentId: string, action: ContentAction): Promise<boolean> {
    const content = await this.contentRepository.findById(contentId);
    const user = await this.userRepository.findById(userId);
    
    // Check ownership
    if (content.authorId === userId) {
      return true;
    }
    
    // Check contributor access
    if (content.contributors.some(c => c.userId === userId)) {
      return this.checkContributorPermission(content, userId, action);
    }
    
    // Check role-based permissions
    return this.rbacService.checkPermission(user.role, 'content', action);
  }
}
```

### Testing Considerations

**Content Creation Testing**
```typescript
describe('ContentCreationService', () => {
  describe('createContent', () => {
    it('should create content with valid input', async () => {
      const input: ContentInput = {
        title: 'Test Article',
        body: '<p>Test content body</p>',
        contentType: 'article',
        visibility: 'draft'
      };
      
      const content = await contentService.createContent('user-123', input);
      
      expect(content.id).toBeDefined();
      expect(content.title).toBe(input.title);
      expect(content.status).toBe('draft');
    });

    it('should validate required fields', async () => {
      const input: ContentInput = {
        title: '',
        body: '',
        contentType: 'article',
        visibility: 'draft'
      };
      
      await expect(contentService.createContent('user-123', input))
        .rejects.toThrow(ValidationError);
    });
  });

  describe('uploadMedia', () => {
    it('should upload and process media files', async () => {
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      
      const asset = await contentService.uploadMedia('user-123', file);
      
      expect(asset.id).toBeDefined();
      expect(asset.url).toBeDefined();
      expect(asset.thumbnailUrl).toBeDefined();
    });

    it('should reject files exceeding size limit', async () => {
      const largeFile = new File([new ArrayBuffer(100 * 1024 * 1024)], 'large.jpg');
      
      await expect(contentService.uploadMedia('user-123', largeFile))
        .rejects.toThrow('File size exceeds maximum');
    });
  });
});
```

## Real-World Considerations

**Performance Optimization**
- Implement lazy loading for media-heavy content
- Use CDN for media delivery
- Cache frequently accessed content
- Optimize editor performance for large documents

**Accessibility**
- Ensure rich text editor is keyboard accessible
- Provide alt text prompts for images
- Support screen readers in content creation interface
- Implement proper heading hierarchy validation

**Mobile Support**
- Responsive editor design for mobile devices
- Touch-friendly media upload interface
- Offline draft saving capability
- Mobile-optimized preview

**Scalability**
- Distributed media storage and processing
- Horizontal scaling for content services
- Efficient content indexing and search
- Rate limiting for upload operations

This template provides a comprehensive foundation for implementing robust content creation systems that empower users to produce high-quality content while maintaining security, performance, and accessibility standards.
