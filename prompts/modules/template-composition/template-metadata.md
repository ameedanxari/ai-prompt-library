# Template Metadata Management

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

This template provides comprehensive patterns for managing template metadata, enabling standardized template information structures, discovery, indexing, and searchability across the AI Prompt Library.

## Context

Effective template management requires consistent metadata that describes template purpose, capabilities, requirements, and relationships. This template establishes the foundation for template organization, discovery, and intelligent selection.

## Core Components

### Template Metadata Schema

## Examples

```typescript
interface TemplateMetadata {
  // Identity
  id: string;
  name: string;
  displayName: string;
  version: string;
  
  // Classification
  domain: ApplicationDomain;
  category: TemplateCategory;
  subcategory?: string;
  
  // Description
  description: string;
  shortDescription: string;
  purpose: string;
  
  // Authorship
  author: string;
  maintainers: string[];
  createdAt: Date;
  updatedAt: Date;
  
  // Technical Details
  platforms: Platform[];
  complexity: ComplexityLevel;
  estimatedEffort: EffortEstimate;
  
  // Relationships
  dependencies: TemplateDependency[];
  relatedTemplates: string[];
  supersedes?: string[];
  supersededBy?: string;
  
  // Discovery
  tags: string[];
  keywords: string[];
  searchTerms: string[];
  
  // Quality
  maturityLevel: MaturityLevel;
  testCoverage: number;
  documentationScore: number;
  
  // Usage
  usageCount?: number;
  lastUsed?: Date;
  popularity?: number;
}

enum ApplicationDomain {
  COMMERCE = 'commerce',
  SOCIAL = 'social',
  LOCATION_SERVICES = 'location-services',
  MEDIA_STREAMING = 'media-streaming',
  FINTECH = 'fintech',
  HEALTHCARE = 'healthcare',
  ENTERPRISE_SAAS = 'enterprise-saas',
  REAL_TIME_COMMUNICATION = 'real-time-communication',
  ANALYTICS = 'analytics',
  CONTENT_MANAGEMENT = 'content-management',
  GAMIFICATION = 'gamification',
  SECURITY = 'security',
  IOT = 'iot',
  BLOCKCHAIN = 'blockchain',
  NOTIFICATIONS = 'notifications',
  DATA_PROCESSING = 'data-processing',
  TESTING = 'testing',
  DEPLOYMENT = 'deployment',
  INTEGRATION = 'integration',
  TEMPLATE_COMPOSITION = 'template-composition'
}

enum TemplateCategory {
  CORE_FEATURE = 'core-feature',
  INTEGRATION = 'integration',
  SECURITY = 'security',
  PERFORMANCE = 'performance',
  COMPLIANCE = 'compliance',
  TESTING = 'testing',
  DEPLOYMENT = 'deployment',
  MONITORING = 'monitoring',
  INFRASTRUCTURE = 'infrastructure',
  CROSS_CUTTING = 'cross-cutting'
}

enum ComplexityLevel {
  BASIC = 'basic',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  EXPERT = 'expert'
}

enum MaturityLevel {
  EXPERIMENTAL = 'experimental',
  BETA = 'beta',
  STABLE = 'stable',
  MATURE = 'mature',
  DEPRECATED = 'deprecated'
}

interface EffortEstimate {
  minimum: number;  // hours
  typical: number;  // hours
  maximum: number;  // hours
  unit: 'hours' | 'days' | 'weeks';
}
```

### Metadata Manager Service

```typescript
interface MetadataManager {
  // CRUD Operations
  createMetadata(template: string, metadata: TemplateMetadata): Promise<void>;
  getMetadata(templateId: string): Promise<TemplateMetadata | null>;
  updateMetadata(templateId: string, updates: Partial<TemplateMetadata>): Promise<void>;
  deleteMetadata(templateId: string): Promise<void>;
  
  // Discovery
  searchTemplates(query: MetadataQuery): Promise<TemplateMetadata[]>;
  findByDomain(domain: ApplicationDomain): Promise<TemplateMetadata[]>;
  findByTags(tags: string[]): Promise<TemplateMetadata[]>;
  findRelated(templateId: string): Promise<TemplateMetadata[]>;
  
  // Validation
  validateMetadata(metadata: TemplateMetadata): ValidationResult;
  checkCompleteness(metadata: TemplateMetadata): CompletenessReport;
  
  // Indexing
  indexTemplate(templateId: string): Promise<void>;
  reindexAll(): Promise<void>;
  getIndex(): Promise<MetadataIndex>;
}

class TemplateMetadataManager implements MetadataManager {
  private storage: MetadataStorage;
  private index: SearchIndex;
  private validator: MetadataValidator;

  async createMetadata(templatePath: string, metadata: TemplateMetadata): Promise<void> {
    // Validate metadata completeness
    const validation = this.validateMetadata(metadata);
    if (!validation.valid) {
      throw new MetadataValidationError(validation.errors);
    }

    // Generate ID if not provided
    if (!metadata.id) {
      metadata.id = this.generateTemplateId(templatePath);
    }

    // Set timestamps
    metadata.createdAt = new Date();
    metadata.updatedAt = new Date();

    // Store metadata
    await this.storage.save(metadata.id, metadata);

    // Update search index
    await this.index.add(metadata);
  }

  async searchTemplates(query: MetadataQuery): Promise<TemplateMetadata[]> {
    const results: TemplateMetadata[] = [];

    // Text search
    if (query.text) {
      const textResults = await this.index.search(query.text);
      results.push(...textResults);
    }

    // Filter by domain
    if (query.domain) {
      const domainResults = await this.storage.findByField('domain', query.domain);
      results.push(...domainResults);
    }

    // Filter by tags
    if (query.tags && query.tags.length > 0) {
      const tagResults = await this.storage.findByTags(query.tags);
      results.push(...tagResults);
    }

    // Filter by complexity
    if (query.complexity) {
      const filtered = results.filter(r => r.complexity === query.complexity);
      return this.deduplicateAndRank(filtered, query);
    }

    return this.deduplicateAndRank(results, query);
  }

  validateMetadata(metadata: TemplateMetadata): ValidationResult {
    const errors: ValidationError[] = [];

    // Required fields
    if (!metadata.name) {
      errors.push({ field: 'name', message: 'Name is required' });
    }
    if (!metadata.domain) {
      errors.push({ field: 'domain', message: 'Domain is required' });
    }
    if (!metadata.description) {
      errors.push({ field: 'description', message: 'Description is required' });
    }

    // Version format
    if (metadata.version && !this.isValidSemver(metadata.version)) {
      errors.push({ field: 'version', message: 'Version must be valid semver' });
    }

    // Complexity validation
    if (metadata.complexity && !Object.values(ComplexityLevel).includes(metadata.complexity)) {
      errors.push({ field: 'complexity', message: 'Invalid complexity level' });
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  private generateTemplateId(templatePath: string): string {
    // Generate ID from path: prompts/modules/commerce/payment.md -> commerce-payment
    const parts = templatePath
      .replace(/^prompts\/modules\//, '')
      .replace(/\.md$/, '')
      .split('/');
    return parts.join('-');
  }

  private isValidSemver(version: string): boolean {
    const semverRegex = /^\d+\.\d+\.\d+(-[a-zA-Z0-9]+)?$/;
    return semverRegex.test(version);
  }

  private deduplicateAndRank(
    results: TemplateMetadata[],
    query: MetadataQuery
  ): TemplateMetadata[] {
    // Remove duplicates
    const unique = new Map<string, TemplateMetadata>();
    for (const result of results) {
      if (!unique.has(result.id)) {
        unique.set(result.id, result);
      }
    }

    // Rank by relevance
    const ranked = Array.from(unique.values()).sort((a, b) => {
      // Prioritize exact matches
      if (query.text) {
        const aExact = a.name.toLowerCase().includes(query.text.toLowerCase());
        const bExact = b.name.toLowerCase().includes(query.text.toLowerCase());
        if (aExact && !bExact) return -1;
        if (!aExact && bExact) return 1;
      }

      // Then by maturity
      const maturityOrder = ['mature', 'stable', 'beta', 'experimental', 'deprecated'];
      const aMaturity = maturityOrder.indexOf(a.maturityLevel);
      const bMaturity = maturityOrder.indexOf(b.maturityLevel);
      if (aMaturity !== bMaturity) return aMaturity - bMaturity;

      // Then by popularity
      return (b.popularity || 0) - (a.popularity || 0);
    });

    return ranked;
  }
}
```

### Metadata Query Interface

```typescript
interface MetadataQuery {
  text?: string;
  domain?: ApplicationDomain;
  domains?: ApplicationDomain[];
  category?: TemplateCategory;
  tags?: string[];
  complexity?: ComplexityLevel;
  maxComplexity?: ComplexityLevel;
  platforms?: Platform[];
  maturityLevel?: MaturityLevel;
  minMaturityLevel?: MaturityLevel;
  author?: string;
  updatedAfter?: Date;
  limit?: number;
  offset?: number;
  sortBy?: 'relevance' | 'popularity' | 'updated' | 'name';
  sortOrder?: 'asc' | 'desc';
}

interface MetadataQueryBuilder {
  withText(text: string): MetadataQueryBuilder;
  inDomain(domain: ApplicationDomain): MetadataQueryBuilder;
  inDomains(domains: ApplicationDomain[]): MetadataQueryBuilder;
  withTags(tags: string[]): MetadataQueryBuilder;
  withComplexity(level: ComplexityLevel): MetadataQueryBuilder;
  maxComplexity(level: ComplexityLevel): MetadataQueryBuilder;
  forPlatforms(platforms: Platform[]): MetadataQueryBuilder;
  minMaturity(level: MaturityLevel): MetadataQueryBuilder;
  sortBy(field: string, order?: 'asc' | 'desc'): MetadataQueryBuilder;
  limit(count: number): MetadataQueryBuilder;
  offset(count: number): MetadataQueryBuilder;
  build(): MetadataQuery;
}

class QueryBuilder implements MetadataQueryBuilder {
  private query: MetadataQuery = {};

  withText(text: string): MetadataQueryBuilder {
    this.query.text = text;
    return this;
  }

  inDomain(domain: ApplicationDomain): MetadataQueryBuilder {
    this.query.domain = domain;
    return this;
  }

  inDomains(domains: ApplicationDomain[]): MetadataQueryBuilder {
    this.query.domains = domains;
    return this;
  }

  withTags(tags: string[]): MetadataQueryBuilder {
    this.query.tags = tags;
    return this;
  }

  withComplexity(level: ComplexityLevel): MetadataQueryBuilder {
    this.query.complexity = level;
    return this;
  }

  maxComplexity(level: ComplexityLevel): MetadataQueryBuilder {
    this.query.maxComplexity = level;
    return this;
  }

  forPlatforms(platforms: Platform[]): MetadataQueryBuilder {
    this.query.platforms = platforms;
    return this;
  }

  minMaturity(level: MaturityLevel): MetadataQueryBuilder {
    this.query.minMaturityLevel = level;
    return this;
  }

  sortBy(field: string, order: 'asc' | 'desc' = 'desc'): MetadataQueryBuilder {
    this.query.sortBy = field as any;
    this.query.sortOrder = order;
    return this;
  }

  limit(count: number): MetadataQueryBuilder {
    this.query.limit = count;
    return this;
  }

  offset(count: number): MetadataQueryBuilder {
    this.query.offset = count;
    return this;
  }

  build(): MetadataQuery {
    return { ...this.query };
  }
}
```

## Implementation Patterns

### Metadata Extraction from Templates

```typescript
class MetadataExtractor {
  extractFromMarkdown(content: string, filePath: string): Partial<TemplateMetadata> {
    const metadata: Partial<TemplateMetadata> = {};

    // Extract title from first H1
    const titleMatch = content.match(/^#\s+(.+)$/m);
    if (titleMatch) {
      metadata.name = this.slugify(titleMatch[1]);
      metadata.displayName = titleMatch[1];
    }

    // Extract purpose section
    const purposeMatch = content.match(/##\s+Purpose\s*\n([\s\S]*?)(?=\n##|$)/);
    if (purposeMatch) {
      metadata.purpose = purposeMatch[1].trim();
      metadata.shortDescription = this.truncate(purposeMatch[1].trim(), 200);
    }

    // Extract context section for description
    const contextMatch = content.match(/##\s+Context\s*\n([\s\S]*?)(?=\n##|$)/);
    if (contextMatch) {
      metadata.description = contextMatch[1].trim();
    }

    // Infer domain from file path
    metadata.domain = this.inferDomain(filePath);

    // Extract tags from content
    metadata.tags = this.extractTags(content);

    // Extract keywords
    metadata.keywords = this.extractKeywords(content);

    // Infer complexity from content
    metadata.complexity = this.inferComplexity(content);

    // Extract platforms from content
    metadata.platforms = this.extractPlatforms(content);

    return metadata;
  }

  private inferDomain(filePath: string): ApplicationDomain {
    const domainMap: Record<string, ApplicationDomain> = {
      'commerce': ApplicationDomain.COMMERCE,
      'social': ApplicationDomain.SOCIAL,
      'location-services': ApplicationDomain.LOCATION_SERVICES,
      'media-streaming': ApplicationDomain.MEDIA_STREAMING,
      'fintech': ApplicationDomain.FINTECH,
      'healthcare': ApplicationDomain.HEALTHCARE,
      'enterprise-saas': ApplicationDomain.ENTERPRISE_SAAS,
      'real-time-communication': ApplicationDomain.REAL_TIME_COMMUNICATION,
      'analytics': ApplicationDomain.ANALYTICS,
      'content-management': ApplicationDomain.CONTENT_MANAGEMENT,
      'gamification': ApplicationDomain.GAMIFICATION,
      'security': ApplicationDomain.SECURITY,
      'iot': ApplicationDomain.IOT,
      'blockchain': ApplicationDomain.BLOCKCHAIN,
      'notifications': ApplicationDomain.NOTIFICATIONS,
      'data-processing': ApplicationDomain.DATA_PROCESSING,
      'testing': ApplicationDomain.TESTING,
      'deployment': ApplicationDomain.DEPLOYMENT,
      'integration': ApplicationDomain.INTEGRATION,
      'template-composition': ApplicationDomain.TEMPLATE_COMPOSITION
    };

    for (const [key, domain] of Object.entries(domainMap)) {
      if (filePath.includes(key)) {
        return domain;
      }
    }

    return ApplicationDomain.INTEGRATION; // Default
  }

  private extractTags(content: string): string[] {
    const tags: Set<string> = new Set();

    // Extract from explicit tags section
    const tagsMatch = content.match(/##\s+Tags\s*\n([\s\S]*?)(?=\n##|$)/);
    if (tagsMatch) {
      const tagLines = tagsMatch[1].split('\n');
      for (const line of tagLines) {
        const tag = line.replace(/^[-*]\s*/, '').trim();
        if (tag) tags.add(tag.toLowerCase());
      }
    }

    // Extract from keywords in content
    const keywordPatterns = [
      /\b(authentication|authorization|security)\b/gi,
      /\b(payment|checkout|commerce)\b/gi,
      /\b(real-time|websocket|streaming)\b/gi,
      /\b(api|rest|graphql)\b/gi,
      /\b(database|storage|cache)\b/gi
    ];

    for (const pattern of keywordPatterns) {
      const matches = content.match(pattern);
      if (matches) {
        matches.forEach(m => tags.add(m.toLowerCase()));
      }
    }

    return Array.from(tags);
  }

  private inferComplexity(content: string): ComplexityLevel {
    // Count code blocks
    const codeBlocks = (content.match(/```/g) || []).length / 2;
    
    // Count sections
    const sections = (content.match(/^##/gm) || []).length;
    
    // Count interfaces/types
    const interfaces = (content.match(/interface\s+\w+/g) || []).length;

    const score = codeBlocks * 2 + sections + interfaces * 3;

    if (score > 50) return ComplexityLevel.EXPERT;
    if (score > 30) return ComplexityLevel.ADVANCED;
    if (score > 15) return ComplexityLevel.INTERMEDIATE;
    return ComplexityLevel.BASIC;
  }

  private extractPlatforms(content: string): Platform[] {
    const platforms: Set<Platform> = new Set();

    if (/\b(web|browser|dom)\b/i.test(content)) {
      platforms.add(Platform.WEB);
    }
    if (/\b(mobile|ios|android|react.native)\b/i.test(content)) {
      platforms.add(Platform.MOBILE);
    }
    if (/\b(server|backend|node|api)\b/i.test(content)) {
      platforms.add(Platform.SERVER);
    }
    if (/\b(desktop|electron)\b/i.test(content)) {
      platforms.add(Platform.DESKTOP);
    }

    return Array.from(platforms);
  }

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  private truncate(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
  }

  private extractKeywords(content: string): string[] {
    // Extract significant words from content
    const words = content
      .toLowerCase()
      .replace(/[^a-z\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 4);

    // Count frequency
    const frequency = new Map<string, number>();
    for (const word of words) {
      frequency.set(word, (frequency.get(word) || 0) + 1);
    }

    // Return top keywords
    return Array.from(frequency.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([word]) => word);
  }
}

enum Platform {
  WEB = 'web',
  MOBILE = 'mobile',
  SERVER = 'server',
  DESKTOP = 'desktop'
}
```

### Metadata Index Service

```typescript
interface MetadataIndex {
  templates: Map<string, TemplateMetadata>;
  byDomain: Map<ApplicationDomain, Set<string>>;
  byTag: Map<string, Set<string>>;
  byCategory: Map<TemplateCategory, Set<string>>;
  searchIndex: SearchIndex;
}

class MetadataIndexService {
  private index: MetadataIndex;

  constructor() {
    this.index = {
      templates: new Map(),
      byDomain: new Map(),
      byTag: new Map(),
      byCategory: new Map(),
      searchIndex: new SearchIndex()
    };
  }

  addToIndex(metadata: TemplateMetadata): void {
    // Add to main index
    this.index.templates.set(metadata.id, metadata);

    // Index by domain
    if (!this.index.byDomain.has(metadata.domain)) {
      this.index.byDomain.set(metadata.domain, new Set());
    }
    this.index.byDomain.get(metadata.domain)!.add(metadata.id);

    // Index by tags
    for (const tag of metadata.tags) {
      if (!this.index.byTag.has(tag)) {
        this.index.byTag.set(tag, new Set());
      }
      this.index.byTag.get(tag)!.add(metadata.id);
    }

    // Index by category
    if (!this.index.byCategory.has(metadata.category)) {
      this.index.byCategory.set(metadata.category, new Set());
    }
    this.index.byCategory.get(metadata.category)!.add(metadata.id);

    // Add to search index
    this.index.searchIndex.add({
      id: metadata.id,
      text: [
        metadata.name,
        metadata.displayName,
        metadata.description,
        metadata.purpose,
        ...metadata.tags,
        ...metadata.keywords
      ].join(' ')
    });
  }

  removeFromIndex(templateId: string): void {
    const metadata = this.index.templates.get(templateId);
    if (!metadata) return;

    // Remove from all indices
    this.index.templates.delete(templateId);
    this.index.byDomain.get(metadata.domain)?.delete(templateId);
    
    for (const tag of metadata.tags) {
      this.index.byTag.get(tag)?.delete(templateId);
    }
    
    this.index.byCategory.get(metadata.category)?.delete(templateId);
    this.index.searchIndex.remove(templateId);
  }

  search(query: string): TemplateMetadata[] {
    const results = this.index.searchIndex.search(query);
    return results
      .map(r => this.index.templates.get(r.id))
      .filter((m): m is TemplateMetadata => m !== undefined);
  }

  getByDomain(domain: ApplicationDomain): TemplateMetadata[] {
    const ids = this.index.byDomain.get(domain) || new Set();
    return Array.from(ids)
      .map(id => this.index.templates.get(id))
      .filter((m): m is TemplateMetadata => m !== undefined);
  }

  getByTags(tags: string[]): TemplateMetadata[] {
    const matchingIds = new Set<string>();
    
    for (const tag of tags) {
      const ids = this.index.byTag.get(tag);
      if (ids) {
        ids.forEach(id => matchingIds.add(id));
      }
    }

    return Array.from(matchingIds)
      .map(id => this.index.templates.get(id))
      .filter((m): m is TemplateMetadata => m !== undefined);
  }

  getStatistics(): IndexStatistics {
    return {
      totalTemplates: this.index.templates.size,
      templatesByDomain: Object.fromEntries(
        Array.from(this.index.byDomain.entries())
          .map(([domain, ids]) => [domain, ids.size])
      ),
      templatesByCategory: Object.fromEntries(
        Array.from(this.index.byCategory.entries())
          .map(([category, ids]) => [category, ids.size])
      ),
      uniqueTags: this.index.byTag.size,
      topTags: this.getTopTags(10)
    };
  }

  private getTopTags(count: number): Array<{ tag: string; count: number }> {
    return Array.from(this.index.byTag.entries())
      .map(([tag, ids]) => ({ tag, count: ids.size }))
      .sort((a, b) => b.count - a.count)
      .slice(0, count);
  }
}

interface IndexStatistics {
  totalTemplates: number;
  templatesByDomain: Record<string, number>;
  templatesByCategory: Record<string, number>;
  uniqueTags: number;
  topTags: Array<{ tag: string; count: number }>;
}
```

## Integration Points

### Brief Analysis Integration

```typescript
class BriefMetadataIntegration {
  private metadataManager: MetadataManager;

  async findTemplatesForBrief(brief: BriefAnalysis): Promise<TemplateMetadata[]> {
    const query = new QueryBuilder()
      .inDomains(brief.domains)
      .maxComplexity(this.mapComplexity(brief.complexityLevel))
      .forPlatforms(brief.platforms)
      .minMaturity(MaturityLevel.BETA)
      .sortBy('relevance')
      .build();

    return this.metadataManager.searchTemplates(query);
  }

  private mapComplexity(briefComplexity: string): ComplexityLevel {
    const mapping: Record<string, ComplexityLevel> = {
      'simple': ComplexityLevel.BASIC,
      'moderate': ComplexityLevel.INTERMEDIATE,
      'complex': ComplexityLevel.ADVANCED,
      'enterprise': ComplexityLevel.EXPERT
    };
    return mapping[briefComplexity] || ComplexityLevel.INTERMEDIATE;
  }
}
```

## Security Considerations

### Metadata Validation Security

```typescript
class SecureMetadataValidator {
  validateMetadataInput(metadata: unknown): TemplateMetadata {
    // Sanitize string fields
    if (typeof metadata !== 'object' || metadata === null) {
      throw new ValidationError('Invalid metadata format');
    }

    const sanitized: Partial<TemplateMetadata> = {};
    const input = metadata as Record<string, unknown>;

    // Validate and sanitize each field
    if (typeof input.name === 'string') {
      sanitized.name = this.sanitizeString(input.name, 100);
    }

    if (typeof input.description === 'string') {
      sanitized.description = this.sanitizeString(input.description, 5000);
    }

    // Validate enum fields
    if (input.domain && !Object.values(ApplicationDomain).includes(input.domain as any)) {
      throw new ValidationError('Invalid domain value');
    }

    return sanitized as TemplateMetadata;
  }

  private sanitizeString(value: string, maxLength: number): string {
    return value
      .substring(0, maxLength)
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .trim();
  }
}
```

## Testing Considerations

### Property-Based Tests

```typescript
describe('Template Metadata Properties', () => {
  it('should maintain metadata consistency after save and retrieve', () => {
    fc.assert(fc.property(
      fc.record({
        name: fc.string({ minLength: 1, maxLength: 100 }),
        domain: fc.constantFrom(...Object.values(ApplicationDomain)),
        description: fc.string({ minLength: 1, maxLength: 1000 }),
        tags: fc.array(fc.string({ minLength: 1, maxLength: 50 }), { maxLength: 20 })
      }),
      async (metadataInput) => {
        const manager = new TemplateMetadataManager();
        const metadata = createValidMetadata(metadataInput);
        
        await manager.createMetadata('test/template.md', metadata);
        const retrieved = await manager.getMetadata(metadata.id);
        
        expect(retrieved?.name).toBe(metadata.name);
        expect(retrieved?.domain).toBe(metadata.domain);
        expect(retrieved?.tags).toEqual(metadata.tags);
      }
    ));
  });

  it('should find templates by any of their tags', () => {
    fc.assert(fc.property(
      fc.array(fc.string({ minLength: 1, maxLength: 20 }), { minLength: 1, maxLength: 10 }),
      async (tags) => {
        const manager = new TemplateMetadataManager();
        const metadata = createValidMetadata({ tags });
        
        await manager.createMetadata('test/template.md', metadata);
        
        for (const tag of tags) {
          const results = await manager.findByTags([tag]);
          expect(results.some(r => r.id === metadata.id)).toBe(true);
        }
      }
    ));
  });
});
```

## Configuration Examples

### Metadata Schema Configuration

```yaml
metadata_schema:
  required_fields:
    - name
    - domain
    - description
    - version
  
  optional_fields:
    - tags
    - keywords
    - platforms
    - complexity
    - maturityLevel
  
  validation_rules:
    name:
      min_length: 1
      max_length: 100
      pattern: "^[a-z0-9-]+$"
    
    version:
      pattern: "^\\d+\\.\\d+\\.\\d+(-[a-zA-Z0-9]+)?$"
    
    description:
      min_length: 10
      max_length: 5000
    
    tags:
      max_count: 50
      max_tag_length: 50

  indexing:
    search_fields:
      - name
      - displayName
      - description
      - purpose
      - tags
      - keywords
    
    facet_fields:
      - domain
      - category
      - complexity
      - maturityLevel
      - platforms
```

## Related Templates

- `template-tagging.md` - Tag management and hierarchies
- `template-dependencies.md` - Dependency declaration and resolution
- `template-versioning.md` - Version management
- `template-validation.md` - Quality validation
- `composition-rules.md` - Template composition rules
