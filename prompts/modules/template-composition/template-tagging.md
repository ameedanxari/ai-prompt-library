# Template Tagging System

## Purpose

This template provides comprehensive patterns for implementing a template tagging system that enables domain classification, complexity categorization, platform targeting, and intelligent template discovery across the AI Prompt Library.

## Context

Effective template organization requires a robust tagging system that supports multiple dimensions of classification. This template establishes hierarchical tag structures, tag relationships, and tag-based discovery mechanisms for efficient template selection.

## Core Components

### Tag Schema Definition

## Examples

```typescript
interface Tag {
  id: string;
  name: string;
  displayName: string;
  category: TagCategory;
  description?: string;
  parent?: string;
  children?: string[];
  aliases?: string[];
  color?: string;
  icon?: string;
  metadata?: Record<string, unknown>;
}

enum TagCategory {
  DOMAIN = 'domain',
  COMPLEXITY = 'complexity',
  PLATFORM = 'platform',
  FEATURE = 'feature',
  TECHNOLOGY = 'technology',
  COMPLIANCE = 'compliance',
  MATURITY = 'maturity',
  USE_CASE = 'use-case'
}

interface TagHierarchy {
  root: Tag;
  children: TagHierarchy[];
  depth: number;
}


interface TagRelationship {
  sourceTag: string;
  targetTag: string;
  relationshipType: TagRelationshipType;
  strength?: number;
}

enum TagRelationshipType {
  PARENT_CHILD = 'parent-child',
  RELATED = 'related',
  REQUIRES = 'requires',
  CONFLICTS = 'conflicts',
  SUGGESTS = 'suggests',
  ALTERNATIVE = 'alternative'
}
```

### Tag Manager Service

```typescript
interface TagManager {
  // Tag CRUD
  createTag(tag: Tag): Promise<void>;
  getTag(tagId: string): Promise<Tag | null>;
  updateTag(tagId: string, updates: Partial<Tag>): Promise<void>;
  deleteTag(tagId: string): Promise<void>;
  
  // Tag Discovery
  getAllTags(): Promise<Tag[]>;
  getTagsByCategory(category: TagCategory): Promise<Tag[]>;
  searchTags(query: string): Promise<Tag[]>;
  
  // Tag Hierarchy
  getTagHierarchy(rootTagId?: string): Promise<TagHierarchy>;
  getParentTags(tagId: string): Promise<Tag[]>;
  getChildTags(tagId: string): Promise<Tag[]>;
  
  // Tag Relationships
  addRelationship(relationship: TagRelationship): Promise<void>;
  getRelatedTags(tagId: string): Promise<Tag[]>;
  getConflictingTags(tagId: string): Promise<Tag[]>;
  
  // Template Tagging
  tagTemplate(templateId: string, tags: string[]): Promise<void>;
  untagTemplate(templateId: string, tags: string[]): Promise<void>;
  getTemplateTags(templateId: string): Promise<Tag[]>;
  getTemplatesByTag(tagId: string): Promise<string[]>;
}

class TemplateTagManager implements TagManager {
  private tags: Map<string, Tag> = new Map();
  private relationships: TagRelationship[] = [];
  private templateTags: Map<string, Set<string>> = new Map();
  private tagTemplates: Map<string, Set<string>> = new Map();

  async createTag(tag: Tag): Promise<void> {
    // Validate tag
    this.validateTag(tag);
    
    // Generate ID if not provided
    if (!tag.id) {
      tag.id = this.generateTagId(tag.name);
    }

    // Store tag
    this.tags.set(tag.id, tag);

    // Update parent-child relationships
    if (tag.parent) {
      const parent = this.tags.get(tag.parent);
      if (parent) {
        parent.children = parent.children || [];
        parent.children.push(tag.id);
      }
    }
  }

  async searchTags(query: string): Promise<Tag[]> {
    const normalizedQuery = query.toLowerCase();
    const results: Tag[] = [];

    for (const tag of this.tags.values()) {
      // Match by name
      if (tag.name.toLowerCase().includes(normalizedQuery)) {
        results.push(tag);
        continue;
      }

      // Match by display name
      if (tag.displayName.toLowerCase().includes(normalizedQuery)) {
        results.push(tag);
        continue;
      }

      // Match by aliases
      if (tag.aliases?.some(a => a.toLowerCase().includes(normalizedQuery))) {
        results.push(tag);
      }
    }

    return results;
  }

  async getTagHierarchy(rootTagId?: string): Promise<TagHierarchy> {
    const buildHierarchy = (tagId: string, depth: number): TagHierarchy => {
      const tag = this.tags.get(tagId);
      if (!tag) {
        throw new Error(`Tag not found: ${tagId}`);
      }

      return {
        root: tag,
        children: (tag.children || []).map(childId => 
          buildHierarchy(childId, depth + 1)
        ),
        depth
      };
    };

    if (rootTagId) {
      return buildHierarchy(rootTagId, 0);
    }

    // Build hierarchy from all root tags
    const rootTags = Array.from(this.tags.values())
      .filter(t => !t.parent);

    return {
      root: { id: 'root', name: 'root', displayName: 'All Tags', category: TagCategory.DOMAIN },
      children: rootTags.map(t => buildHierarchy(t.id, 1)),
      depth: 0
    };
  }

  async getRelatedTags(tagId: string): Promise<Tag[]> {
    const relatedIds = this.relationships
      .filter(r => 
        (r.sourceTag === tagId || r.targetTag === tagId) &&
        r.relationshipType === TagRelationshipType.RELATED
      )
      .map(r => r.sourceTag === tagId ? r.targetTag : r.sourceTag);

    return relatedIds
      .map(id => this.tags.get(id))
      .filter((t): t is Tag => t !== undefined);
  }

  async tagTemplate(templateId: string, tagIds: string[]): Promise<void> {
    // Get or create template tag set
    if (!this.templateTags.has(templateId)) {
      this.templateTags.set(templateId, new Set());
    }
    const templateTagSet = this.templateTags.get(templateId)!;

    for (const tagId of tagIds) {
      // Validate tag exists
      if (!this.tags.has(tagId)) {
        throw new Error(`Tag not found: ${tagId}`);
      }

      // Add tag to template
      templateTagSet.add(tagId);

      // Add template to tag index
      if (!this.tagTemplates.has(tagId)) {
        this.tagTemplates.set(tagId, new Set());
      }
      this.tagTemplates.get(tagId)!.add(templateId);
    }
  }

  async getTemplatesByTag(tagId: string): Promise<string[]> {
    const templateIds = this.tagTemplates.get(tagId);
    if (!templateIds) return [];

    // Include templates with child tags
    const tag = this.tags.get(tagId);
    if (tag?.children) {
      for (const childId of tag.children) {
        const childTemplates = await this.getTemplatesByTag(childId);
        childTemplates.forEach(id => templateIds.add(id));
      }
    }

    return Array.from(templateIds);
  }

  private validateTag(tag: Tag): void {
    if (!tag.name) {
      throw new Error('Tag name is required');
    }
    if (!tag.category) {
      throw new Error('Tag category is required');
    }
    if (!Object.values(TagCategory).includes(tag.category)) {
      throw new Error(`Invalid tag category: ${tag.category}`);
    }
  }

  private generateTagId(name: string): string {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  }
}
```


### Predefined Tag Hierarchies

```typescript
const DOMAIN_TAGS: Tag[] = [
  { id: 'commerce', name: 'commerce', displayName: 'Commerce', category: TagCategory.DOMAIN,
    children: ['payment', 'inventory', 'checkout', 'marketplace'] },
  { id: 'payment', name: 'payment', displayName: 'Payment Processing', category: TagCategory.DOMAIN, parent: 'commerce' },
  { id: 'inventory', name: 'inventory', displayName: 'Inventory Management', category: TagCategory.DOMAIN, parent: 'commerce' },
  { id: 'checkout', name: 'checkout', displayName: 'Checkout', category: TagCategory.DOMAIN, parent: 'commerce' },
  { id: 'marketplace', name: 'marketplace', displayName: 'Marketplace', category: TagCategory.DOMAIN, parent: 'commerce' },
  
  { id: 'social', name: 'social', displayName: 'Social', category: TagCategory.DOMAIN,
    children: ['messaging', 'profiles', 'feeds', 'moderation'] },
  { id: 'messaging', name: 'messaging', displayName: 'Messaging', category: TagCategory.DOMAIN, parent: 'social' },
  { id: 'profiles', name: 'profiles', displayName: 'User Profiles', category: TagCategory.DOMAIN, parent: 'social' },
  { id: 'feeds', name: 'feeds', displayName: 'Content Feeds', category: TagCategory.DOMAIN, parent: 'social' },
  { id: 'moderation', name: 'moderation', displayName: 'Content Moderation', category: TagCategory.DOMAIN, parent: 'social' },
  
  { id: 'security', name: 'security', displayName: 'Security', category: TagCategory.DOMAIN,
    children: ['authentication', 'authorization', 'encryption', 'compliance'] },
  { id: 'authentication', name: 'authentication', displayName: 'Authentication', category: TagCategory.DOMAIN, parent: 'security' },
  { id: 'authorization', name: 'authorization', displayName: 'Authorization', category: TagCategory.DOMAIN, parent: 'security' },
  { id: 'encryption', name: 'encryption', displayName: 'Encryption', category: TagCategory.DOMAIN, parent: 'security' },
  
  { id: 'healthcare', name: 'healthcare', displayName: 'Healthcare', category: TagCategory.DOMAIN,
    children: ['hipaa', 'telemedicine', 'ehr', 'patient-data'] },
  { id: 'fintech', name: 'fintech', displayName: 'Fintech', category: TagCategory.DOMAIN,
    children: ['banking', 'trading', 'lending', 'kyc'] }
];

const COMPLEXITY_TAGS: Tag[] = [
  { id: 'basic', name: 'basic', displayName: 'Basic', category: TagCategory.COMPLEXITY,
    description: 'Simple implementations suitable for beginners' },
  { id: 'intermediate', name: 'intermediate', displayName: 'Intermediate', category: TagCategory.COMPLEXITY,
    description: 'Moderate complexity requiring some experience' },
  { id: 'advanced', name: 'advanced', displayName: 'Advanced', category: TagCategory.COMPLEXITY,
    description: 'Complex implementations for experienced developers' },
  { id: 'expert', name: 'expert', displayName: 'Expert', category: TagCategory.COMPLEXITY,
    description: 'Highly complex enterprise-grade implementations' }
];

const PLATFORM_TAGS: Tag[] = [
  { id: 'web', name: 'web', displayName: 'Web', category: TagCategory.PLATFORM,
    children: ['react', 'vue', 'angular', 'nextjs'] },
  { id: 'mobile', name: 'mobile', displayName: 'Mobile', category: TagCategory.PLATFORM,
    children: ['react-native', 'flutter', 'ios', 'android'] },
  { id: 'server', name: 'server', displayName: 'Server', category: TagCategory.PLATFORM,
    children: ['nodejs', 'python', 'java', 'go'] },
  { id: 'cloud', name: 'cloud', displayName: 'Cloud', category: TagCategory.PLATFORM,
    children: ['aws', 'gcp', 'azure', 'vercel'] }
];

const COMPLIANCE_TAGS: Tag[] = [
  { id: 'hipaa', name: 'hipaa', displayName: 'HIPAA', category: TagCategory.COMPLIANCE },
  { id: 'gdpr', name: 'gdpr', displayName: 'GDPR', category: TagCategory.COMPLIANCE },
  { id: 'pci-dss', name: 'pci-dss', displayName: 'PCI-DSS', category: TagCategory.COMPLIANCE },
  { id: 'soc2', name: 'soc2', displayName: 'SOC 2', category: TagCategory.COMPLIANCE },
  { id: 'ccpa', name: 'ccpa', displayName: 'CCPA', category: TagCategory.COMPLIANCE }
];
```

## Implementation Patterns

### Tag-Based Template Discovery

```typescript
class TagBasedDiscovery {
  private tagManager: TagManager;
  private metadataManager: MetadataManager;

  async discoverTemplates(criteria: DiscoveryCriteria): Promise<DiscoveryResult> {
    const matchingTemplates: Set<string> = new Set();
    const tagScores: Map<string, number> = new Map();

    // Find templates by required tags (AND logic)
    if (criteria.requiredTags?.length) {
      const templateSets = await Promise.all(
        criteria.requiredTags.map(tag => this.tagManager.getTemplatesByTag(tag))
      );
      
      // Intersection of all sets
      const intersection = templateSets.reduce((acc, set) => {
        const setItems = new Set(set);
        return acc.filter(item => setItems.has(item));
      });
      
      intersection.forEach(id => matchingTemplates.add(id));
    }

    // Find templates by optional tags (OR logic with scoring)
    if (criteria.optionalTags?.length) {
      for (const tag of criteria.optionalTags) {
        const templates = await this.tagManager.getTemplatesByTag(tag);
        for (const templateId of templates) {
          matchingTemplates.add(templateId);
          tagScores.set(templateId, (tagScores.get(templateId) || 0) + 1);
        }
      }
    }

    // Exclude templates with excluded tags
    if (criteria.excludedTags?.length) {
      for (const tag of criteria.excludedTags) {
        const templates = await this.tagManager.getTemplatesByTag(tag);
        templates.forEach(id => matchingTemplates.delete(id));
      }
    }

    // Sort by tag match score
    const sortedTemplates = Array.from(matchingTemplates)
      .sort((a, b) => (tagScores.get(b) || 0) - (tagScores.get(a) || 0));

    return {
      templates: sortedTemplates,
      scores: tagScores,
      totalMatches: sortedTemplates.length
    };
  }

  async suggestTags(templateContent: string): Promise<TagSuggestion[]> {
    const suggestions: TagSuggestion[] = [];
    const allTags = await this.tagManager.getAllTags();

    for (const tag of allTags) {
      const confidence = this.calculateTagConfidence(templateContent, tag);
      if (confidence > 0.3) {
        suggestions.push({ tag, confidence });
      }
    }

    return suggestions.sort((a, b) => b.confidence - a.confidence);
  }

  private calculateTagConfidence(content: string, tag: Tag): number {
    const normalizedContent = content.toLowerCase();
    let score = 0;

    // Check tag name
    if (normalizedContent.includes(tag.name.toLowerCase())) {
      score += 0.5;
    }

    // Check aliases
    if (tag.aliases) {
      for (const alias of tag.aliases) {
        if (normalizedContent.includes(alias.toLowerCase())) {
          score += 0.3;
        }
      }
    }

    // Check related keywords based on category
    const categoryKeywords = this.getCategoryKeywords(tag.category);
    for (const keyword of categoryKeywords) {
      if (normalizedContent.includes(keyword)) {
        score += 0.1;
      }
    }

    return Math.min(score, 1.0);
  }

  private getCategoryKeywords(category: TagCategory): string[] {
    const keywords: Record<TagCategory, string[]> = {
      [TagCategory.DOMAIN]: [],
      [TagCategory.COMPLEXITY]: ['simple', 'complex', 'advanced', 'basic'],
      [TagCategory.PLATFORM]: ['web', 'mobile', 'server', 'cloud'],
      [TagCategory.FEATURE]: ['feature', 'functionality', 'capability'],
      [TagCategory.TECHNOLOGY]: ['framework', 'library', 'tool'],
      [TagCategory.COMPLIANCE]: ['compliance', 'regulation', 'standard'],
      [TagCategory.MATURITY]: ['stable', 'beta', 'experimental'],
      [TagCategory.USE_CASE]: ['use case', 'scenario', 'application']
    };
    return keywords[category] || [];
  }
}

interface DiscoveryCriteria {
  requiredTags?: string[];
  optionalTags?: string[];
  excludedTags?: string[];
  minComplexity?: string;
  maxComplexity?: string;
  platforms?: string[];
}

interface DiscoveryResult {
  templates: string[];
  scores: Map<string, number>;
  totalMatches: number;
}

interface TagSuggestion {
  tag: Tag;
  confidence: number;
}
```

### Tag Conflict Detection

```typescript
class TagConflictDetector {
  private tagManager: TagManager;
  private conflictRules: ConflictRule[] = [];

  constructor(tagManager: TagManager) {
    this.tagManager = tagManager;
    this.initializeConflictRules();
  }

  private initializeConflictRules(): void {
    this.conflictRules = [
      // Platform conflicts
      { tags: ['ios-only', 'android-only'], message: 'Cannot target both iOS-only and Android-only' },
      { tags: ['web-only', 'mobile-only'], message: 'Cannot be both web-only and mobile-only' },
      
      // Complexity conflicts
      { tags: ['basic', 'expert'], message: 'Complexity cannot be both basic and expert' },
      
      // Maturity conflicts
      { tags: ['stable', 'experimental'], message: 'Cannot be both stable and experimental' },
      { tags: ['deprecated', 'recommended'], message: 'Cannot be both deprecated and recommended' }
    ];
  }

  detectConflicts(tags: string[]): TagConflict[] {
    const conflicts: TagConflict[] = [];
    const tagSet = new Set(tags);

    // Check predefined conflict rules
    for (const rule of this.conflictRules) {
      const matchingTags = rule.tags.filter(t => tagSet.has(t));
      if (matchingTags.length > 1) {
        conflicts.push({
          tags: matchingTags,
          message: rule.message,
          severity: 'error'
        });
      }
    }

    // Check relationship-based conflicts
    for (const tag of tags) {
      const conflictingTags = this.tagManager.getConflictingTags(tag);
      for (const conflicting of conflictingTags) {
        if (tagSet.has(conflicting.id)) {
          conflicts.push({
            tags: [tag, conflicting.id],
            message: `Tag '${tag}' conflicts with '${conflicting.id}'`,
            severity: 'warning'
          });
        }
      }
    }

    return conflicts;
  }

  suggestResolution(conflict: TagConflict): ResolutionSuggestion[] {
    const suggestions: ResolutionSuggestion[] = [];

    for (const tag of conflict.tags) {
      // Suggest removing each conflicting tag
      suggestions.push({
        action: 'remove',
        tag,
        reason: `Remove '${tag}' to resolve conflict`
      });

      // Suggest alternatives
      const alternatives = this.findAlternatives(tag);
      for (const alt of alternatives) {
        suggestions.push({
          action: 'replace',
          tag,
          replacement: alt,
          reason: `Replace '${tag}' with '${alt}' to resolve conflict`
        });
      }
    }

    return suggestions;
  }

  private findAlternatives(tagId: string): string[] {
    const tag = this.tagManager.getTag(tagId);
    if (!tag) return [];

    // Get sibling tags (same parent)
    if (tag.parent) {
      const parent = this.tagManager.getTag(tag.parent);
      if (parent?.children) {
        return parent.children.filter(c => c !== tagId);
      }
    }

    return [];
  }
}

interface ConflictRule {
  tags: string[];
  message: string;
}

interface TagConflict {
  tags: string[];
  message: string;
  severity: 'error' | 'warning';
}

interface ResolutionSuggestion {
  action: 'remove' | 'replace';
  tag: string;
  replacement?: string;
  reason: string;
}
```

## Integration Points

### Brief Analysis Integration

```typescript
class BriefTagAnalyzer {
  private tagManager: TagManager;

  async extractTagsFromBrief(brief: string): Promise<ExtractedTags> {
    const domainTags = await this.extractDomainTags(brief);
    const platformTags = await this.extractPlatformTags(brief);
    const complianceTags = await this.extractComplianceTags(brief);
    const featureTags = await this.extractFeatureTags(brief);

    return {
      domain: domainTags,
      platform: platformTags,
      compliance: complianceTags,
      features: featureTags,
      all: [...domainTags, ...platformTags, ...complianceTags, ...featureTags]
    };
  }

  private async extractDomainTags(brief: string): Promise<string[]> {
    const domainKeywords: Record<string, string[]> = {
      'commerce': ['shop', 'store', 'product', 'cart', 'checkout', 'payment', 'order'],
      'social': ['social', 'friend', 'follow', 'post', 'feed', 'message', 'chat'],
      'healthcare': ['health', 'medical', 'patient', 'doctor', 'appointment', 'prescription'],
      'fintech': ['bank', 'finance', 'payment', 'transaction', 'investment', 'loan']
    };

    const normalizedBrief = brief.toLowerCase();
    const matchedDomains: string[] = [];

    for (const [domain, keywords] of Object.entries(domainKeywords)) {
      if (keywords.some(k => normalizedBrief.includes(k))) {
        matchedDomains.push(domain);
      }
    }

    return matchedDomains;
  }

  private async extractPlatformTags(brief: string): Promise<string[]> {
    const platformKeywords: Record<string, string[]> = {
      'web': ['web', 'website', 'browser', 'react', 'vue', 'angular'],
      'mobile': ['mobile', 'app', 'ios', 'android', 'react native', 'flutter'],
      'server': ['api', 'backend', 'server', 'microservice'],
      'cloud': ['aws', 'azure', 'gcp', 'cloud', 'serverless']
    };

    const normalizedBrief = brief.toLowerCase();
    const matchedPlatforms: string[] = [];

    for (const [platform, keywords] of Object.entries(platformKeywords)) {
      if (keywords.some(k => normalizedBrief.includes(k))) {
        matchedPlatforms.push(platform);
      }
    }

    return matchedPlatforms;
  }

  private async extractComplianceTags(brief: string): Promise<string[]> {
    const complianceKeywords: Record<string, string[]> = {
      'hipaa': ['hipaa', 'healthcare', 'phi', 'medical records'],
      'gdpr': ['gdpr', 'european', 'data protection', 'privacy'],
      'pci-dss': ['pci', 'payment card', 'credit card'],
      'soc2': ['soc2', 'soc 2', 'security audit']
    };

    const normalizedBrief = brief.toLowerCase();
    const matchedCompliance: string[] = [];

    for (const [compliance, keywords] of Object.entries(complianceKeywords)) {
      if (keywords.some(k => normalizedBrief.includes(k))) {
        matchedCompliance.push(compliance);
      }
    }

    return matchedCompliance;
  }

  private async extractFeatureTags(brief: string): Promise<string[]> {
    const featureKeywords: Record<string, string[]> = {
      'authentication': ['login', 'auth', 'sign in', 'oauth', 'sso'],
      'real-time': ['real-time', 'realtime', 'live', 'websocket'],
      'search': ['search', 'filter', 'query'],
      'analytics': ['analytics', 'metrics', 'dashboard', 'reporting']
    };

    const normalizedBrief = brief.toLowerCase();
    const matchedFeatures: string[] = [];

    for (const [feature, keywords] of Object.entries(featureKeywords)) {
      if (keywords.some(k => normalizedBrief.includes(k))) {
        matchedFeatures.push(feature);
      }
    }

    return matchedFeatures;
  }
}

interface ExtractedTags {
  domain: string[];
  platform: string[];
  compliance: string[];
  features: string[];
  all: string[];
}
```

## Testing Considerations

### Property-Based Tests

```typescript
describe('Template Tagging Properties', () => {
  it('should maintain tag hierarchy consistency', () => {
    fc.assert(fc.property(
      fc.array(fc.record({
        id: fc.string({ minLength: 1, maxLength: 50 }),
        name: fc.string({ minLength: 1, maxLength: 50 }),
        parent: fc.option(fc.string({ minLength: 1, maxLength: 50 }))
      }), { minLength: 1, maxLength: 20 }),
      async (tagInputs) => {
        const manager = new TemplateTagManager();
        
        // Create tags
        for (const input of tagInputs) {
          const tag: Tag = {
            ...input,
            displayName: input.name,
            category: TagCategory.DOMAIN
          };
          await manager.createTag(tag);
        }

        // Verify hierarchy consistency
        for (const input of tagInputs) {
          if (input.parent) {
            const parentTag = await manager.getTag(input.parent);
            if (parentTag) {
              expect(parentTag.children).toContain(input.id);
            }
          }
        }
      }
    ));
  });

  it('should find templates by any assigned tag', () => {
    fc.assert(fc.property(
      fc.array(fc.string({ minLength: 1, maxLength: 20 }), { minLength: 1, maxLength: 10 }),
      async (tagNames) => {
        const manager = new TemplateTagManager();
        const templateId = 'test-template';

        // Create tags and assign to template
        const tagIds: string[] = [];
        for (const name of tagNames) {
          const tag: Tag = {
            id: name.toLowerCase().replace(/\s+/g, '-'),
            name,
            displayName: name,
            category: TagCategory.FEATURE
          };
          await manager.createTag(tag);
          tagIds.push(tag.id);
        }

        await manager.tagTemplate(templateId, tagIds);

        // Verify template is found by each tag
        for (const tagId of tagIds) {
          const templates = await manager.getTemplatesByTag(tagId);
          expect(templates).toContain(templateId);
        }
      }
    ));
  });
});
```

## Configuration Examples

### Tag System Configuration

```yaml
tag_system:
  categories:
    - name: domain
      display_name: Domain
      required: true
      multiple: true
      hierarchical: true
    
    - name: complexity
      display_name: Complexity
      required: true
      multiple: false
      hierarchical: false
    
    - name: platform
      display_name: Platform
      required: false
      multiple: true
      hierarchical: true
    
    - name: compliance
      display_name: Compliance
      required: false
      multiple: true
      hierarchical: false

  conflict_rules:
    - tags: [basic, expert]
      message: "Complexity cannot be both basic and expert"
    
    - tags: [deprecated, recommended]
      message: "Cannot be both deprecated and recommended"

  auto_tagging:
    enabled: true
    confidence_threshold: 0.5
    suggest_only: true
```

## Related Templates

- `template-metadata.md` - Metadata management
- `template-dependencies.md` - Dependency management
- `composition-rules.md` - Composition rules
- `template-validation.md` - Validation patterns
