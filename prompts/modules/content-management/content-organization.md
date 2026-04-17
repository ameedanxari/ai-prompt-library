# Content Organization Template

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

This template provides comprehensive patterns for implementing content organization systems, covering categorization, tagging, content hierarchies, and content relationships to enable efficient content discovery and management.

## Context

Content organization is essential for managing large volumes of content and enabling users to find relevant information quickly. A well-designed organization system supports multiple taxonomies, flexible tagging, hierarchical structures, and content relationships. This template addresses the complexity of building scalable content organization that adapts to diverse content types and user needs.

## Instructions

1. **Setup Taxonomy System**: Configure categories, tags, and custom taxonomies
2. **Implement Content Hierarchies**: Build parent-child relationships and content trees
3. **Add Tagging System**: Enable flexible tagging with auto-suggestions and tag management
4. **Configure Content Relationships**: Implement related content, cross-references, and linking
5. **Enable Faceted Navigation**: Build multi-dimensional content browsing
6. **Add Search Integration**: Connect organization with search and filtering
7. **Test Organization Workflows**: Validate categorization, navigation, and discovery

## Examples

### Example 1: Taxonomy Management Service
```typescript
interface TaxonomyService {
  createCategory(category: CategoryInput): Promise<Category>;
  createTag(tag: TagInput): Promise<Tag>;
  assignTaxonomy(contentId: string, taxonomyAssignment: TaxonomyAssignment): Promise<void>;
  getCategoryTree(rootId?: string): Promise<CategoryTree>;
  suggestTags(query: string, context?: TagContext): Promise<Tag[]>;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
  level: number;
  path: string;
  sortOrder: number;
  metadata: CategoryMetadata;
}

const taxonomyService = new TaxonomyService();
const category = await taxonomyService.createCategory({
  name: 'Technology',
  slug: 'technology',
  description: 'Articles about technology and innovation',
  parentId: null
});
```


### Example 2: Content Hierarchy Management
```typescript
interface ContentHierarchy {
  id: string;
  contentId: string;
  parentId?: string;
  children: ContentHierarchy[];
  level: number;
  path: string;
  sortOrder: number;
}

const hierarchy = await contentService.createHierarchy({
  contentId: 'guide-001',
  parentId: 'documentation-root',
  sortOrder: 1
});

// Get full content tree
const tree = await contentService.getContentTree('documentation-root');
```

### Example 3: Tagging System
```typescript
interface TaggingService {
  addTags(contentId: string, tags: string[]): Promise<void>;
  removeTags(contentId: string, tags: string[]): Promise<void>;
  getContentByTags(tags: string[], operator: 'AND' | 'OR'): Promise<Content[]>;
  getRelatedTags(tag: string): Promise<Tag[]>;
  mergeTags(sourceTag: string, targetTag: string): Promise<void>;
}

await taggingService.addTags('article-123', ['javascript', 'tutorial', 'beginner']);
const relatedContent = await taggingService.getContentByTags(['javascript', 'tutorial'], 'AND');
```

## Variables

| Variable | Description | Type | Required | Default |
|----------|-------------|------|----------|---------|
| enableCategories | Enable category taxonomy | boolean | No | true |
| enableTags | Enable tagging system | boolean | No | true |
| enableHierarchies | Enable content hierarchies | boolean | No | true |
| maxCategoryDepth | Maximum category hierarchy depth | number | No | 5 |
| maxTagsPerContent | Maximum tags per content item | number | No | 50 |
| enableTagSuggestions | Enable automatic tag suggestions | boolean | No | true |
| enableRelatedContent | Enable related content linking | boolean | No | true |
| enableFacetedNavigation | Enable faceted browsing | boolean | No | true |

## Expected Output

This template will produce:
- **Category System**: Hierarchical category management with unlimited depth
- **Tagging Engine**: Flexible tagging with suggestions and management tools
- **Content Hierarchies**: Parent-child relationships and content trees
- **Content Relationships**: Related content, cross-references, and linking
- **Faceted Navigation**: Multi-dimensional content browsing and filtering
- **Taxonomy Management**: Tools for managing and organizing taxonomies
- **Search Integration**: Organization-aware search and filtering
- **Navigation Components**: Breadcrumbs, menus, and navigation widgets

## Implementation Patterns

### Category Management System

**Category Data Model**
```typescript
interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
  level: number;
  path: string; // e.g., "/technology/programming/javascript"
  
  // Display settings
  image?: string;
  icon?: string;
  color?: string;
  sortOrder: number;
  isVisible: boolean;
  
  // SEO
  seoTitle?: string;
  seoDescription?: string;
  
  // Metadata
  metadata: CategoryMetadata;
  contentCount: number;
  
  // Relationships
  children?: Category[];
  
  createdAt: Date;
  updatedAt: Date;
}

interface CategoryMetadata {
  allowContent: boolean;
  inheritParentSettings: boolean;
  customFields: Record<string, any>;
  displayTemplate?: string;
}
```

**Category Service Implementation**
```typescript
class CategoryService {
  async createCategory(input: CategoryInput): Promise<Category> {
    // Calculate level and path
    let level = 0;
    let path = `/${input.slug}`;
    
    if (input.parentId) {
      const parent = await this.getCategory(input.parentId);
      if (!parent) {
        throw new Error('Parent category not found');
      }
      level = parent.level + 1;
      path = `${parent.path}/${input.slug}`;
      
      // Check max depth
      if (level > this.config.maxCategoryDepth) {
        throw new Error(`Maximum category depth of ${this.config.maxCategoryDepth} exceeded`);
      }
    }
    
    // Check for duplicate slug at same level
    const existing = await this.findBySlugAndParent(input.slug, input.parentId);
    if (existing) {
      throw new Error('Category with this slug already exists at this level');
    }
    
    const category: Category = {
      id: this.generateId(),
      ...input,
      level,
      path,
      contentCount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    await this.categoryRepository.save(category);
    
    // Update parent's children if applicable
    if (input.parentId) {
      await this.invalidateCategoryCache(input.parentId);
    }
    
    return category;
  }

  async getCategoryTree(rootId?: string): Promise<CategoryTree> {
    const categories = await this.categoryRepository.findAll();
    
    // Build tree structure
    const categoryMap = new Map<string, Category>();
    const rootCategories: Category[] = [];
    
    // First pass: create map
    for (const category of categories) {
      category.children = [];
      categoryMap.set(category.id, category);
    }
    
    // Second pass: build tree
    for (const category of categories) {
      if (category.parentId && categoryMap.has(category.parentId)) {
        const parent = categoryMap.get(category.parentId)!;
        parent.children!.push(category);
      } else if (!category.parentId || category.parentId === rootId) {
        rootCategories.push(category);
      }
    }
    
    // Sort by sortOrder
    this.sortCategoriesRecursively(rootCategories);
    
    return { categories: rootCategories, totalCount: categories.length };
  }

  async moveCategory(categoryId: string, newParentId?: string): Promise<void> {
    const category = await this.getCategory(categoryId);
    
    // Prevent circular reference
    if (newParentId && await this.isDescendant(categoryId, newParentId)) {
      throw new Error('Cannot move category to its own descendant');
    }
    
    const oldPath = category.path;
    
    // Update category
    if (newParentId) {
      const newParent = await this.getCategory(newParentId);
      category.parentId = newParentId;
      category.level = newParent.level + 1;
      category.path = `${newParent.path}/${category.slug}`;
    } else {
      category.parentId = undefined;
      category.level = 0;
      category.path = `/${category.slug}`;
    }
    
    // Update all descendants' paths
    await this.updateDescendantPaths(category, oldPath);
    
    await this.categoryRepository.save(category);
  }

  private sortCategoriesRecursively(categories: Category[]): void {
    categories.sort((a, b) => a.sortOrder - b.sortOrder);
    for (const category of categories) {
      if (category.children && category.children.length > 0) {
        this.sortCategoriesRecursively(category.children);
      }
    }
  }
}
```


### Tagging System Implementation

**Tag Data Model**
```typescript
interface Tag {
  id: string;
  name: string;
  slug: string;
  description?: string;
  
  // Usage statistics
  usageCount: number;
  lastUsedAt?: Date;
  
  // Relationships
  relatedTags: string[];
  synonyms: string[];
  
  // Metadata
  color?: string;
  icon?: string;
  isSystem: boolean;
  isApproved: boolean;
  
  createdAt: Date;
  updatedAt: Date;
}

interface ContentTag {
  contentId: string;
  tagId: string;
  addedBy: string;
  addedAt: Date;
  relevanceScore?: number;
}
```

**Tagging Service Implementation**
```typescript
class TaggingService {
  async addTags(contentId: string, tagNames: string[]): Promise<void> {
    const content = await this.contentRepository.findById(contentId);
    if (!content) {
      throw new Error('Content not found');
    }
    
    // Check tag limit
    const existingTags = await this.getContentTags(contentId);
    if (existingTags.length + tagNames.length > this.config.maxTagsPerContent) {
      throw new Error(`Maximum of ${this.config.maxTagsPerContent} tags per content exceeded`);
    }
    
    for (const tagName of tagNames) {
      // Find or create tag
      let tag = await this.findTagByName(tagName);
      if (!tag) {
        tag = await this.createTag({
          name: tagName,
          slug: this.slugify(tagName),
          isSystem: false,
          isApproved: this.config.autoApproveTags
        });
      }
      
      // Create content-tag relationship
      await this.contentTagRepository.save({
        contentId,
        tagId: tag.id,
        addedBy: content.authorId,
        addedAt: new Date()
      });
      
      // Update tag usage count
      await this.incrementTagUsage(tag.id);
    }
    
    // Update related tags
    await this.updateRelatedTags(tagNames);
  }

  async suggestTags(query: string, context?: TagContext): Promise<Tag[]> {
    const suggestions: Tag[] = [];
    
    // Search by name prefix
    const prefixMatches = await this.tagRepository.findByPrefix(query, 10);
    suggestions.push(...prefixMatches);
    
    // Search by synonyms
    const synonymMatches = await this.tagRepository.findBySynonym(query, 5);
    suggestions.push(...synonymMatches.filter(t => !suggestions.some(s => s.id === t.id)));
    
    // Context-based suggestions
    if (context?.categoryId) {
      const categoryTags = await this.getPopularTagsForCategory(context.categoryId, 5);
      suggestions.push(...categoryTags.filter(t => !suggestions.some(s => s.id === t.id)));
    }
    
    // Sort by relevance and usage
    return suggestions
      .sort((a, b) => {
        const aScore = this.calculateTagRelevance(a, query);
        const bScore = this.calculateTagRelevance(b, query);
        return bScore - aScore;
      })
      .slice(0, 10);
  }

  async mergeTags(sourceTagId: string, targetTagId: string): Promise<void> {
    const sourceTag = await this.getTag(sourceTagId);
    const targetTag = await this.getTag(targetTagId);
    
    // Move all content associations
    await this.contentTagRepository.updateTagId(sourceTagId, targetTagId);
    
    // Add source as synonym of target
    targetTag.synonyms.push(sourceTag.name);
    targetTag.usageCount += sourceTag.usageCount;
    await this.tagRepository.save(targetTag);
    
    // Delete source tag
    await this.tagRepository.delete(sourceTagId);
  }

  async getRelatedTags(tagId: string, limit: number = 10): Promise<Tag[]> {
    const tag = await this.getTag(tagId);
    
    // Get content with this tag
    const contentIds = await this.contentTagRepository.findContentByTag(tagId);
    
    // Find other tags used with this content
    const coOccurringTags = await this.contentTagRepository.findCoOccurringTags(
      contentIds,
      tagId,
      limit
    );
    
    return coOccurringTags;
  }

  private calculateTagRelevance(tag: Tag, query: string): number {
    let score = 0;
    
    // Exact match
    if (tag.name.toLowerCase() === query.toLowerCase()) {
      score += 100;
    }
    // Prefix match
    else if (tag.name.toLowerCase().startsWith(query.toLowerCase())) {
      score += 50;
    }
    // Contains match
    else if (tag.name.toLowerCase().includes(query.toLowerCase())) {
      score += 25;
    }
    
    // Usage popularity
    score += Math.min(tag.usageCount / 10, 20);
    
    // Recency bonus
    if (tag.lastUsedAt) {
      const daysSinceUse = (Date.now() - tag.lastUsedAt.getTime()) / (1000 * 60 * 60 * 24);
      score += Math.max(0, 10 - daysSinceUse);
    }
    
    return score;
  }
}
```

### Content Hierarchy Implementation

**Hierarchy Service**
```typescript
interface ContentHierarchyService {
  createHierarchy(contentId: string, parentId?: string): Promise<ContentHierarchy>;
  moveContent(contentId: string, newParentId?: string, position?: number): Promise<void>;
  getContentTree(rootId: string): Promise<ContentTree>;
  getAncestors(contentId: string): Promise<Content[]>;
  getDescendants(contentId: string): Promise<Content[]>;
  getBreadcrumb(contentId: string): Promise<BreadcrumbItem[]>;
}

class ContentHierarchyService {
  async createHierarchy(contentId: string, parentId?: string): Promise<ContentHierarchy> {
    const content = await this.contentRepository.findById(contentId);
    
    let level = 0;
    let path = `/${contentId}`;
    
    if (parentId) {
      const parent = await this.getHierarchy(parentId);
      level = parent.level + 1;
      path = `${parent.path}/${contentId}`;
    }
    
    const hierarchy: ContentHierarchy = {
      id: this.generateId(),
      contentId,
      parentId,
      level,
      path,
      sortOrder: await this.getNextSortOrder(parentId),
      children: []
    };
    
    await this.hierarchyRepository.save(hierarchy);
    return hierarchy;
  }

  async getContentTree(rootId: string, maxDepth?: number): Promise<ContentTree> {
    const hierarchies = await this.hierarchyRepository.findByRootPath(rootId);
    
    // Filter by depth if specified
    const filtered = maxDepth 
      ? hierarchies.filter(h => h.level <= maxDepth)
      : hierarchies;
    
    // Build tree structure
    const tree = this.buildTree(filtered, rootId);
    
    // Load content for each node
    await this.loadContentForTree(tree);
    
    return tree;
  }

  async getBreadcrumb(contentId: string): Promise<BreadcrumbItem[]> {
    const hierarchy = await this.getHierarchy(contentId);
    const pathParts = hierarchy.path.split('/').filter(Boolean);
    
    const breadcrumb: BreadcrumbItem[] = [];
    
    for (const part of pathParts) {
      const content = await this.contentRepository.findById(part);
      if (content) {
        breadcrumb.push({
          id: content.id,
          title: content.title,
          slug: content.slug,
          url: this.buildContentUrl(content)
        });
      }
    }
    
    return breadcrumb;
  }

  async reorderChildren(parentId: string, orderedChildIds: string[]): Promise<void> {
    for (let i = 0; i < orderedChildIds.length; i++) {
      await this.hierarchyRepository.updateSortOrder(orderedChildIds[i], i);
    }
  }
}
```

### Content Relationships

**Relationship Types and Management**
```typescript
interface ContentRelationship {
  id: string;
  sourceContentId: string;
  targetContentId: string;
  relationshipType: RelationshipType;
  metadata?: Record<string, any>;
  sortOrder?: number;
  createdAt: Date;
}

type RelationshipType = 
  | 'related'
  | 'prerequisite'
  | 'sequel'
  | 'translation'
  | 'version'
  | 'reference'
  | 'cross-reference'
  | 'custom';

class ContentRelationshipService {
  async createRelationship(
    sourceId: string,
    targetId: string,
    type: RelationshipType,
    bidirectional: boolean = false
  ): Promise<ContentRelationship> {
    // Validate both content items exist
    const [source, target] = await Promise.all([
      this.contentRepository.findById(sourceId),
      this.contentRepository.findById(targetId)
    ]);
    
    if (!source || !target) {
      throw new Error('Source or target content not found');
    }
    
    // Check for existing relationship
    const existing = await this.findRelationship(sourceId, targetId, type);
    if (existing) {
      throw new Error('Relationship already exists');
    }
    
    const relationship: ContentRelationship = {
      id: this.generateId(),
      sourceContentId: sourceId,
      targetContentId: targetId,
      relationshipType: type,
      createdAt: new Date()
    };
    
    await this.relationshipRepository.save(relationship);
    
    // Create reverse relationship if bidirectional
    if (bidirectional) {
      await this.relationshipRepository.save({
        ...relationship,
        id: this.generateId(),
        sourceContentId: targetId,
        targetContentId: sourceId
      });
    }
    
    return relationship;
  }

  async getRelatedContent(
    contentId: string,
    types?: RelationshipType[]
  ): Promise<RelatedContent[]> {
    const relationships = await this.relationshipRepository.findBySource(contentId, types);
    
    const relatedContent: RelatedContent[] = [];
    
    for (const rel of relationships) {
      const content = await this.contentRepository.findById(rel.targetContentId);
      if (content && content.status === 'published') {
        relatedContent.push({
          content,
          relationshipType: rel.relationshipType,
          metadata: rel.metadata
        });
      }
    }
    
    return relatedContent;
  }

  async suggestRelatedContent(contentId: string, limit: number = 5): Promise<Content[]> {
    const content = await this.contentRepository.findById(contentId);
    
    // Find content with similar tags
    const tagBasedSuggestions = await this.findBySharedTags(content.tags, contentId, limit);
    
    // Find content in same category
    const categoryBasedSuggestions = await this.findByCategory(content.categories, contentId, limit);
    
    // Combine and deduplicate
    const suggestions = [...tagBasedSuggestions];
    for (const suggestion of categoryBasedSuggestions) {
      if (!suggestions.some(s => s.id === suggestion.id)) {
        suggestions.push(suggestion);
      }
    }
    
    // Sort by relevance score
    return suggestions
      .map(s => ({
        ...s,
        relevanceScore: this.calculateRelevance(content, s)
      }))
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, limit);
  }
}
```


### Faceted Navigation

**Faceted Search Implementation**
```typescript
interface FacetedNavigationService {
  getFacets(query: ContentQuery): Promise<Facet[]>;
  applyFacets(query: ContentQuery, selectedFacets: FacetSelection[]): Promise<ContentSearchResult>;
  getFacetValues(facetId: string, query: ContentQuery): Promise<FacetValue[]>;
}

interface Facet {
  id: string;
  name: string;
  type: 'category' | 'tag' | 'attribute' | 'date' | 'author';
  values: FacetValue[];
  multiSelect: boolean;
}

interface FacetValue {
  value: string;
  displayValue: string;
  count: number;
  selected: boolean;
}

class FacetedNavigation implements FacetedNavigationService {
  async getFacets(query: ContentQuery): Promise<Facet[]> {
    const facets: Facet[] = [];
    
    // Category facet
    const categoryFacet = await this.buildCategoryFacet(query);
    if (categoryFacet.values.length > 0) {
      facets.push(categoryFacet);
    }
    
    // Tag facet
    const tagFacet = await this.buildTagFacet(query);
    if (tagFacet.values.length > 0) {
      facets.push(tagFacet);
    }
    
    // Date facet
    const dateFacet = await this.buildDateFacet(query);
    if (dateFacet.values.length > 0) {
      facets.push(dateFacet);
    }
    
    // Author facet
    const authorFacet = await this.buildAuthorFacet(query);
    if (authorFacet.values.length > 0) {
      facets.push(authorFacet);
    }
    
    // Custom attribute facets
    const attributeFacets = await this.buildAttributeFacets(query);
    facets.push(...attributeFacets);
    
    return facets;
  }

  private async buildCategoryFacet(query: ContentQuery): Promise<Facet> {
    const categoryCounts = await this.contentRepository.aggregateByCategory(query);
    
    return {
      id: 'category',
      name: 'Category',
      type: 'category',
      multiSelect: true,
      values: categoryCounts.map(cc => ({
        value: cc.categoryId,
        displayValue: cc.categoryName,
        count: cc.count,
        selected: query.categories?.includes(cc.categoryId) || false
      }))
    };
  }

  private async buildTagFacet(query: ContentQuery): Promise<Facet> {
    const tagCounts = await this.contentRepository.aggregateByTag(query, 20);
    
    return {
      id: 'tag',
      name: 'Tags',
      type: 'tag',
      multiSelect: true,
      values: tagCounts.map(tc => ({
        value: tc.tagId,
        displayValue: tc.tagName,
        count: tc.count,
        selected: query.tags?.includes(tc.tagId) || false
      }))
    };
  }

  private async buildDateFacet(query: ContentQuery): Promise<Facet> {
    const dateCounts = await this.contentRepository.aggregateByDateRange(query);
    
    return {
      id: 'date',
      name: 'Date',
      type: 'date',
      multiSelect: false,
      values: dateCounts.map(dc => ({
        value: dc.range,
        displayValue: dc.label,
        count: dc.count,
        selected: query.dateRange === dc.range
      }))
    };
  }
}
```

### Integration Points

**Search Integration**
```typescript
interface SearchIntegration {
  indexContent(content: Content): Promise<void>;
  updateIndex(contentId: string, updates: Partial<Content>): Promise<void>;
  removeFromIndex(contentId: string): Promise<void>;
  searchWithOrganization(query: SearchQuery): Promise<OrganizedSearchResult>;
}

class ContentSearchIntegration implements SearchIntegration {
  async indexContent(content: Content): Promise<void> {
    const searchDocument = {
      id: content.id,
      title: content.title,
      body: this.extractText(content.body),
      excerpt: content.excerpt,
      
      // Organization data
      categories: content.categories,
      categoryPaths: await this.getCategoryPaths(content.categories),
      tags: content.tags,
      
      // Hierarchy data
      parentId: content.parentId,
      hierarchyPath: await this.getHierarchyPath(content.id),
      
      // Metadata
      authorId: content.authorId,
      authorName: await this.getAuthorName(content.authorId),
      publishedAt: content.publishedAt,
      contentType: content.contentType
    };
    
    await this.searchClient.index('content', searchDocument);
  }

  async searchWithOrganization(query: SearchQuery): Promise<OrganizedSearchResult> {
    const searchResult = await this.searchClient.search('content', query);
    
    // Group results by category
    const groupedByCategory = this.groupByCategory(searchResult.hits);
    
    // Get facets
    const facets = await this.facetedNavigation.getFacets(query);
    
    // Get breadcrumbs for each result
    const resultsWithBreadcrumbs = await Promise.all(
      searchResult.hits.map(async hit => ({
        ...hit,
        breadcrumb: await this.hierarchyService.getBreadcrumb(hit.id)
      }))
    );
    
    return {
      results: resultsWithBreadcrumbs,
      groupedResults: groupedByCategory,
      facets,
      totalCount: searchResult.totalCount
    };
  }
}
```

### Security Considerations

**Taxonomy Access Control**
```typescript
interface TaxonomySecurityService {
  checkCategoryAccess(userId: string, categoryId: string, action: string): Promise<boolean>;
  filterAccessibleCategories(userId: string, categories: Category[]): Promise<Category[]>;
  checkTagPermission(userId: string, action: 'create' | 'edit' | 'delete'): Promise<boolean>;
}

class TaxonomySecurity implements TaxonomySecurityService {
  async checkCategoryAccess(userId: string, categoryId: string, action: string): Promise<boolean> {
    const user = await this.userRepository.findById(userId);
    const category = await this.categoryRepository.findById(categoryId);
    
    // Check category-specific permissions
    if (category.metadata.restrictedTo) {
      return category.metadata.restrictedTo.includes(user.role);
    }
    
    // Check general permissions
    return this.rbacService.checkPermission(user.role, 'category', action);
  }

  async filterAccessibleCategories(userId: string, categories: Category[]): Promise<Category[]> {
    const user = await this.userRepository.findById(userId);
    
    return categories.filter(category => {
      if (!category.metadata.restrictedTo) {
        return true;
      }
      return category.metadata.restrictedTo.includes(user.role);
    });
  }
}
```

### Testing Considerations

**Organization System Testing**
```typescript
describe('TaxonomyService', () => {
  describe('createCategory', () => {
    it('should create root category', async () => {
      const category = await taxonomyService.createCategory({
        name: 'Technology',
        slug: 'technology'
      });
      
      expect(category.level).toBe(0);
      expect(category.path).toBe('/technology');
    });

    it('should create nested category', async () => {
      const parent = await taxonomyService.createCategory({
        name: 'Technology',
        slug: 'technology'
      });
      
      const child = await taxonomyService.createCategory({
        name: 'Programming',
        slug: 'programming',
        parentId: parent.id
      });
      
      expect(child.level).toBe(1);
      expect(child.path).toBe('/technology/programming');
    });

    it('should enforce max depth', async () => {
      // Create categories up to max depth
      let parentId: string | undefined;
      for (let i = 0; i < 5; i++) {
        const cat = await taxonomyService.createCategory({
          name: `Level ${i}`,
          slug: `level-${i}`,
          parentId
        });
        parentId = cat.id;
      }
      
      // Attempt to exceed max depth
      await expect(taxonomyService.createCategory({
        name: 'Too Deep',
        slug: 'too-deep',
        parentId
      })).rejects.toThrow('Maximum category depth');
    });
  });
});

describe('TaggingService', () => {
  describe('suggestTags', () => {
    it('should suggest tags by prefix', async () => {
      await taggingService.createTag({ name: 'javascript' });
      await taggingService.createTag({ name: 'java' });
      await taggingService.createTag({ name: 'python' });
      
      const suggestions = await taggingService.suggestTags('jav');
      
      expect(suggestions).toHaveLength(2);
      expect(suggestions.map(s => s.name)).toContain('javascript');
      expect(suggestions.map(s => s.name)).toContain('java');
    });
  });
});
```

## Real-World Considerations

**Performance Optimization**
- Cache category trees and tag clouds
- Use materialized paths for efficient hierarchy queries
- Implement incremental facet updates
- Optimize tag suggestion queries with indexes

**Scalability**
- Partition large taxonomies by domain
- Use distributed caching for navigation data
- Implement lazy loading for deep hierarchies
- Consider eventual consistency for tag counts

**User Experience**
- Provide intuitive drag-and-drop for hierarchy management
- Implement type-ahead for tag input
- Show content counts in navigation
- Support keyboard navigation in category trees

**Data Integrity**
- Validate slug uniqueness within parent scope
- Prevent orphaned content when deleting categories
- Maintain referential integrity for relationships
- Handle tag merging without data loss

This template provides a comprehensive foundation for implementing flexible, scalable content organization systems that enable efficient content discovery and management across diverse content types and user needs.
