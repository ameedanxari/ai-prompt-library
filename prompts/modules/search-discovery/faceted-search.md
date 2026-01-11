# Faceted Search Template

## Purpose

This template provides comprehensive patterns for implementing faceted search and filtering systems that enable users to narrow down search results through dynamic, hierarchical filters. It covers facet generation, filter application, count aggregation, and advanced filtering UI patterns.

## Context

Faceted search is essential for helping users navigate large datasets by providing structured filtering options. Users expect dynamic facets that update based on current selections, accurate counts, and intuitive filter interactions. This template addresses the complexity of building performant faceted search systems that handle millions of documents while providing real-time filter updates.

## Instructions

1. **Design Facet Schema**: Define facet types, hierarchies, and configurations
2. **Implement Facet Generation**: Build dynamic facet extraction from search results
3. **Configure Filter Logic**: Set up filter application and combination rules
4. **Add Count Aggregation**: Implement accurate facet counts with selections
5. **Build Filter UI Patterns**: Create intuitive filter interaction components
6. **Optimize Performance**: Configure caching and query optimization
7. **Add Advanced Features**: Implement range filters, hierarchical facets, and saved filters

## Examples

### Example 1: Dynamic Facet Generation
```typescript
interface FacetedSearchEngine {
  search(query: SearchQuery): Promise<FacetedSearchResult>;
  getFacets(query: SearchQuery): Promise<Facet[]>;
  applyFilters(query: SearchQuery, filters: Filter[]): Promise<FacetedSearchResult>;
}

const result = await facetedSearch.search({
  query: 'laptop',
  facets: ['brand', 'price_range', 'screen_size', 'processor'],
  filters: [{ field: 'brand', values: ['Apple', 'Dell'] }]
});
```

### Example 2: Hierarchical Category Facets
```typescript
const categoryFacet = await facetedSearch.getHierarchicalFacet({
  field: 'category',
  depth: 3,
  includeAncestors: true,
  selectedPath: ['Electronics', 'Computers', 'Laptops']
});
// Returns nested category tree with counts at each level
```

### Example 3: Range Facets with Dynamic Buckets
```typescript
const priceFacet = await facetedSearch.getRangeFacet({
  field: 'price',
  type: 'dynamic',
  bucketCount: 5,
  includeStats: true
});
// Returns: { min: 0, max: 5000, buckets: [...], stats: { avg, median } }
```

## Variables

| Variable | Description | Type | Required | Default |
|----------|-------------|------|----------|---------|
| facetFields | Fields to generate facets for | string[] | Yes | N/A |
| maxFacetValues | Maximum values per facet | number | No | 100 |
| enableHierarchical | Enable hierarchical facets | boolean | No | false |
| enableRangeFacets | Enable range-based facets | boolean | No | true |
| facetSortOrder | Facet value sort order | string | No | "count" |
| enableFacetCaching | Cache facet results | boolean | No | true |
| showZeroCounts | Show facets with zero results | boolean | No | false |
| enableMultiSelect | Allow multiple selections per facet | boolean | No | true |

## Expected Output

This template will produce:
- **Dynamic Facet Generation**: Automatic facet extraction from search results
- **Filter Application**: Flexible filter combination and application logic
- **Count Aggregation**: Accurate counts with and without current selections
- **Hierarchical Facets**: Nested category and taxonomy navigation
- **Range Facets**: Numeric and date range filtering with dynamic buckets
- **Filter State Management**: URL-based filter persistence and sharing
- **Performance Optimization**: Facet caching and query optimization
- **Filter UI Components**: Reusable filter interaction patterns

## Implementation Patterns

### Faceted Search Architecture

```typescript
// Core Faceted Search Architecture
interface FacetedSearchSystem {
  facetGenerator: FacetGenerator;
  filterProcessor: FilterProcessor;
  aggregationEngine: AggregationEngine;
  facetCache: FacetCache;
  filterStateManager: FilterStateManager;
}

interface Facet {
  id: string;
  name: string;
  field: string;
  type: FacetType;
  values: FacetValue[];
  config: FacetConfig;
  metadata?: FacetMetadata;
}

enum FacetType {
  TERMS = 'terms',
  RANGE = 'range',
  DATE_RANGE = 'date_range',
  HIERARCHICAL = 'hierarchical',
  BOOLEAN = 'boolean',
  RATING = 'rating'
}

interface FacetValue {
  value: string | number;
  displayValue: string;
  count: number;
  selected: boolean;
  disabled?: boolean;
  children?: FacetValue[];
  metadata?: Record<string, any>;
}

interface FacetConfig {
  multiSelect: boolean;
  sortOrder: 'count' | 'value' | 'custom';
  sortDirection: 'asc' | 'desc';
  maxValues: number;
  showMoreThreshold: number;
  includeZeroCounts: boolean;
  collapsible: boolean;
  defaultExpanded: boolean;
}

interface Filter {
  field: string;
  type: FilterType;
  values?: (string | number)[];
  range?: { min?: number; max?: number };
  operator?: FilterOperator;
}

enum FilterType {
  TERMS = 'terms',
  RANGE = 'range',
  EXISTS = 'exists',
  PREFIX = 'prefix',
  WILDCARD = 'wildcard'
}

enum FilterOperator {
  AND = 'and',
  OR = 'or',
  NOT = 'not'
}

interface FacetedSearchResult {
  hits: SearchHit[];
  total: number;
  facets: Facet[];
  appliedFilters: Filter[];
  filterSummary: FilterSummary;
  took: number;
}
```

### Facet Generator

```typescript
// Facet Generation Implementation
class FacetGenerator {
  private client: SearchClient;
  private config: FacetGeneratorConfig;
  private facetCache: FacetCache;

  async generateFacets(
    query: SearchQuery,
    facetConfigs: FacetConfig[]
  ): Promise<Facet[]> {
    const facets: Facet[] = [];

    // Build aggregation queries for all facets
    const aggregations = this.buildAggregations(facetConfigs, query.filters);

    // Execute aggregation query
    const response = await this.client.search({
      index: this.config.indexName,
      body: {
        query: this.buildBaseQuery(query),
        size: 0,
        aggs: aggregations
      }
    });

    // Process aggregation results into facets
    for (const facetConfig of facetConfigs) {
      const facet = this.processAggregation(
        facetConfig,
        response.aggregations[facetConfig.field],
        query.filters
      );
      facets.push(facet);
    }

    return facets;
  }

  private buildAggregations(
    facetConfigs: FacetConfig[],
    currentFilters: Filter[]
  ): Record<string, any> {
    const aggregations: Record<string, any> = {};

    for (const config of facetConfigs) {
      // Build filter that excludes current facet's filter (for accurate counts)
      const otherFilters = currentFilters.filter(f => f.field !== config.field);
      const filterQuery = this.buildFilterQuery(otherFilters);

      switch (config.type) {
        case FacetType.TERMS:
          aggregations[config.field] = this.buildTermsAggregation(config, filterQuery);
          break;
        case FacetType.RANGE:
          aggregations[config.field] = this.buildRangeAggregation(config, filterQuery);
          break;
        case FacetType.HIERARCHICAL:
          aggregations[config.field] = this.buildHierarchicalAggregation(config, filterQuery);
          break;
        case FacetType.DATE_RANGE:
          aggregations[config.field] = this.buildDateRangeAggregation(config, filterQuery);
          break;
      }
    }

    return aggregations;
  }

  private buildTermsAggregation(config: FacetConfig, filterQuery: any): any {
    const agg: any = {
      filter: filterQuery,
      aggs: {
        values: {
          terms: {
            field: `${config.field}.keyword`,
            size: config.maxValues || 100,
            order: this.getAggregationOrder(config)
          }
        }
      }
    };

    return agg;
  }

  private buildRangeAggregation(config: FacetConfig, filterQuery: any): any {
    if (config.ranges) {
      // Predefined ranges
      return {
        filter: filterQuery,
        aggs: {
          values: {
            range: {
              field: config.field,
              ranges: config.ranges
            }
          }
        }
      };
    }

    // Dynamic ranges based on data distribution
    return {
      filter: filterQuery,
      aggs: {
        stats: {
          stats: { field: config.field }
        },
        histogram: {
          histogram: {
            field: config.field,
            interval: config.interval || 'auto'
          }
        }
      }
    };
  }

  private buildHierarchicalAggregation(config: FacetConfig, filterQuery: any): any {
    const depth = config.hierarchyDepth || 3;
    let agg: any = {
      filter: filterQuery,
      aggs: {}
    };

    // Build nested aggregations for each level
    let currentLevel = agg.aggs;
    for (let i = 0; i < depth; i++) {
      const levelField = `${config.field}.level${i}`;
      currentLevel[`level${i}`] = {
        terms: {
          field: `${levelField}.keyword`,
          size: config.maxValues || 50
        },
        aggs: {}
      };
      currentLevel = currentLevel[`level${i}`].aggs;
    }

    return agg;
  }

  private processAggregation(
    config: FacetConfig,
    aggregation: any,
    currentFilters: Filter[]
  ): Facet {
    const currentFilter = currentFilters.find(f => f.field === config.field);
    const selectedValues = new Set(currentFilter?.values || []);

    let values: FacetValue[];

    switch (config.type) {
      case FacetType.TERMS:
        values = this.processTermsAggregation(aggregation, selectedValues, config);
        break;
      case FacetType.RANGE:
        values = this.processRangeAggregation(aggregation, currentFilter, config);
        break;
      case FacetType.HIERARCHICAL:
        values = this.processHierarchicalAggregation(aggregation, selectedValues, config);
        break;
      default:
        values = [];
    }

    return {
      id: config.field,
      name: config.displayName || config.field,
      field: config.field,
      type: config.type,
      values,
      config
    };
  }

  private processTermsAggregation(
    aggregation: any,
    selectedValues: Set<string | number>,
    config: FacetConfig
  ): FacetValue[] {
    const buckets = aggregation.values?.buckets || [];

    return buckets
      .filter(bucket => config.includeZeroCounts || bucket.doc_count > 0)
      .map(bucket => ({
        value: bucket.key,
        displayValue: this.formatDisplayValue(bucket.key, config),
        count: bucket.doc_count,
        selected: selectedValues.has(bucket.key)
      }));
  }

  private processRangeAggregation(
    aggregation: any,
    currentFilter: Filter | undefined,
    config: FacetConfig
  ): FacetValue[] {
    if (aggregation.values?.buckets) {
      // Predefined ranges
      return aggregation.values.buckets.map(bucket => ({
        value: `${bucket.from || '*'}-${bucket.to || '*'}`,
        displayValue: this.formatRangeDisplay(bucket, config),
        count: bucket.doc_count,
        selected: this.isRangeSelected(bucket, currentFilter),
        metadata: { from: bucket.from, to: bucket.to }
      }));
    }

    // Dynamic ranges from histogram
    const stats = aggregation.stats;
    const histogram = aggregation.histogram?.buckets || [];

    return histogram.map(bucket => ({
      value: `${bucket.key}-${bucket.key + (config.interval || 1)}`,
      displayValue: this.formatHistogramDisplay(bucket, config),
      count: bucket.doc_count,
      selected: false,
      metadata: { from: bucket.key, to: bucket.key + (config.interval || 1) }
    }));
  }

  private processHierarchicalAggregation(
    aggregation: any,
    selectedValues: Set<string | number>,
    config: FacetConfig
  ): FacetValue[] {
    const processLevel = (levelAgg: any, depth: number): FacetValue[] => {
      if (!levelAgg?.buckets) return [];

      return levelAgg.buckets.map(bucket => ({
        value: bucket.key,
        displayValue: bucket.key,
        count: bucket.doc_count,
        selected: selectedValues.has(bucket.key),
        children: depth < (config.hierarchyDepth || 3) - 1
          ? processLevel(bucket[`level${depth + 1}`], depth + 1)
          : undefined
      }));
    };

    return processLevel(aggregation.level0, 0);
  }
}
```

### Filter Processor

```typescript
// Filter Processing Implementation
class FilterProcessor {
  buildFilterQuery(filters: Filter[]): any {
    if (filters.length === 0) {
      return { match_all: {} };
    }

    const filterClauses = filters.map(filter => this.buildFilterClause(filter));

    return {
      bool: {
        filter: filterClauses
      }
    };
  }

  private buildFilterClause(filter: Filter): any {
    switch (filter.type) {
      case FilterType.TERMS:
        return this.buildTermsFilter(filter);
      case FilterType.RANGE:
        return this.buildRangeFilter(filter);
      case FilterType.EXISTS:
        return this.buildExistsFilter(filter);
      case FilterType.PREFIX:
        return this.buildPrefixFilter(filter);
      default:
        throw new Error(`Unknown filter type: ${filter.type}`);
    }
  }

  private buildTermsFilter(filter: Filter): any {
    if (!filter.values || filter.values.length === 0) {
      return { match_all: {} };
    }

    const fieldName = `${filter.field}.keyword`;

    if (filter.operator === FilterOperator.NOT) {
      return {
        bool: {
          must_not: [{ terms: { [fieldName]: filter.values } }]
        }
      };
    }

    if (filter.operator === FilterOperator.AND) {
      return {
        bool: {
          must: filter.values.map(value => ({ term: { [fieldName]: value } }))
        }
      };
    }

    // Default OR behavior
    return { terms: { [fieldName]: filter.values } };
  }

  private buildRangeFilter(filter: Filter): any {
    const rangeQuery: any = {};

    if (filter.range?.min !== undefined) {
      rangeQuery.gte = filter.range.min;
    }

    if (filter.range?.max !== undefined) {
      rangeQuery.lte = filter.range.max;
    }

    return { range: { [filter.field]: rangeQuery } };
  }

  private buildExistsFilter(filter: Filter): any {
    return { exists: { field: filter.field } };
  }

  private buildPrefixFilter(filter: Filter): any {
    return { prefix: { [filter.field]: filter.values?.[0] || '' } };
  }

  combineFilters(existingFilters: Filter[], newFilter: Filter): Filter[] {
    const otherFilters = existingFilters.filter(f => f.field !== newFilter.field);

    if (!newFilter.values || newFilter.values.length === 0) {
      // Remove filter if no values
      return otherFilters;
    }

    return [...otherFilters, newFilter];
  }

  toggleFilterValue(
    existingFilters: Filter[],
    field: string,
    value: string | number,
    multiSelect: boolean
  ): Filter[] {
    const existingFilter = existingFilters.find(f => f.field === field);
    const otherFilters = existingFilters.filter(f => f.field !== field);

    if (!existingFilter) {
      // Add new filter
      return [...otherFilters, {
        field,
        type: FilterType.TERMS,
        values: [value]
      }];
    }

    const currentValues = existingFilter.values || [];
    const valueIndex = currentValues.indexOf(value);

    if (valueIndex >= 0) {
      // Remove value
      const newValues = currentValues.filter((_, i) => i !== valueIndex);
      if (newValues.length === 0) {
        return otherFilters;
      }
      return [...otherFilters, { ...existingFilter, values: newValues }];
    }

    // Add value
    if (multiSelect) {
      return [...otherFilters, { ...existingFilter, values: [...currentValues, value] }];
    }

    // Single select - replace value
    return [...otherFilters, { ...existingFilter, values: [value] }];
  }
}
```

### Filter State Management

```typescript
// Filter State Management Implementation
class FilterStateManager {
  private serializer: FilterSerializer;

  serializeToUrl(filters: Filter[]): string {
    const params = new URLSearchParams();

    for (const filter of filters) {
      const serialized = this.serializer.serialize(filter);
      params.append(filter.field, serialized);
    }

    return params.toString();
  }

  deserializeFromUrl(urlParams: string): Filter[] {
    const params = new URLSearchParams(urlParams);
    const filters: Filter[] = [];

    for (const [field, value] of params.entries()) {
      const filter = this.serializer.deserialize(field, value);
      if (filter) {
        filters.push(filter);
      }
    }

    return filters;
  }

  generateFilterSummary(filters: Filter[], facets: Facet[]): FilterSummary {
    const items: FilterSummaryItem[] = [];

    for (const filter of filters) {
      const facet = facets.find(f => f.field === filter.field);

      if (filter.type === FilterType.TERMS && filter.values) {
        for (const value of filter.values) {
          const facetValue = facet?.values.find(v => v.value === value);
          items.push({
            field: filter.field,
            fieldLabel: facet?.name || filter.field,
            value: String(value),
            displayValue: facetValue?.displayValue || String(value),
            type: 'term'
          });
        }
      } else if (filter.type === FilterType.RANGE && filter.range) {
        items.push({
          field: filter.field,
          fieldLabel: facet?.name || filter.field,
          value: `${filter.range.min || '*'}-${filter.range.max || '*'}`,
          displayValue: this.formatRangeSummary(filter.range, facet),
          type: 'range'
        });
      }
    }

    return {
      items,
      totalFilters: items.length,
      clearAllUrl: this.serializeToUrl([])
    };
  }
}

class FilterSerializer {
  serialize(filter: Filter): string {
    switch (filter.type) {
      case FilterType.TERMS:
        return (filter.values || []).join(',');
      case FilterType.RANGE:
        return `${filter.range?.min || ''}_${filter.range?.max || ''}`;
      default:
        return JSON.stringify(filter);
    }
  }

  deserialize(field: string, value: string): Filter | null {
    // Detect range format
    if (value.includes('_')) {
      const [min, max] = value.split('_');
      return {
        field,
        type: FilterType.RANGE,
        range: {
          min: min ? parseFloat(min) : undefined,
          max: max ? parseFloat(max) : undefined
        }
      };
    }

    // Terms filter
    const values = value.split(',').filter(v => v.length > 0);
    if (values.length === 0) return null;

    return {
      field,
      type: FilterType.TERMS,
      values
    };
  }
}
```


### Advanced Facet Features

```typescript
// Advanced Facet Features Implementation
class AdvancedFacetFeatures {
  // Dynamic Range Buckets
  async generateDynamicRangeBuckets(
    field: string,
    bucketCount: number,
    query: SearchQuery
  ): Promise<RangeBucket[]> {
    // Get field statistics
    const stats = await this.getFieldStats(field, query);

    // Calculate optimal bucket boundaries
    const buckets = this.calculateOptimalBuckets(stats, bucketCount);

    // Get counts for each bucket
    const countsResponse = await this.client.search({
      index: this.indexName,
      body: {
        query: this.buildBaseQuery(query),
        size: 0,
        aggs: {
          ranges: {
            range: {
              field,
              ranges: buckets.map(b => ({ from: b.min, to: b.max }))
            }
          }
        }
      }
    });

    return buckets.map((bucket, i) => ({
      ...bucket,
      count: countsResponse.aggregations.ranges.buckets[i].doc_count
    }));
  }

  private calculateOptimalBuckets(stats: FieldStats, bucketCount: number): RangeBucket[] {
    const { min, max, percentiles } = stats;
    const buckets: RangeBucket[] = [];

    // Use percentiles for more even distribution
    const percentileKeys = Object.keys(percentiles).map(Number).sort((a, b) => a - b);
    const step = 100 / bucketCount;

    for (let i = 0; i < bucketCount; i++) {
      const lowerPercentile = i * step;
      const upperPercentile = (i + 1) * step;

      const lowerValue = i === 0 ? min : this.interpolatePercentile(percentiles, lowerPercentile);
      const upperValue = i === bucketCount - 1 ? max : this.interpolatePercentile(percentiles, upperPercentile);

      buckets.push({
        min: Math.floor(lowerValue),
        max: Math.ceil(upperValue),
        label: this.formatRangeLabel(lowerValue, upperValue)
      });
    }

    return buckets;
  }

  // Hierarchical Category Navigation
  async getHierarchicalFacet(
    config: HierarchicalFacetConfig,
    query: SearchQuery
  ): Promise<HierarchicalFacet> {
    const { field, selectedPath, depth } = config;

    // Build aggregation for current level and children
    const aggs = this.buildHierarchicalAggs(field, selectedPath, depth);

    const response = await this.client.search({
      index: this.indexName,
      body: {
        query: this.buildBaseQuery(query),
        size: 0,
        aggs
      }
    });

    return this.processHierarchicalResponse(response.aggregations, selectedPath);
  }

  private buildHierarchicalAggs(
    field: string,
    selectedPath: string[],
    maxDepth: number
  ): any {
    const aggs: any = {};

    // Root level
    aggs.root = {
      terms: {
        field: `${field}.level0.keyword`,
        size: 50
      }
    };

    // Add nested aggregations for selected path
    let currentAgg = aggs.root;
    for (let i = 0; i < selectedPath.length && i < maxDepth - 1; i++) {
      currentAgg.aggs = {
        children: {
          filter: { term: { [`${field}.level${i}.keyword`]: selectedPath[i] } },
          aggs: {
            values: {
              terms: {
                field: `${field}.level${i + 1}.keyword`,
                size: 50
              }
            }
          }
        }
      };
      currentAgg = currentAgg.aggs.children.aggs.values;
    }

    return aggs;
  }

  // Saved Filters
  async saveFilterPreset(
    userId: string,
    name: string,
    filters: Filter[]
  ): Promise<FilterPreset> {
    const preset: FilterPreset = {
      id: this.generateId(),
      userId,
      name,
      filters,
      createdAt: new Date(),
      usageCount: 0
    };

    await this.filterPresetRepository.save(preset);
    return preset;
  }

  async getUserFilterPresets(userId: string): Promise<FilterPreset[]> {
    return this.filterPresetRepository.findByUserId(userId);
  }

  async applyFilterPreset(presetId: string, query: SearchQuery): Promise<FacetedSearchResult> {
    const preset = await this.filterPresetRepository.findById(presetId);
    if (!preset) {
      throw new Error('Filter preset not found');
    }

    // Increment usage count
    await this.filterPresetRepository.incrementUsage(presetId);

    // Apply preset filters
    return this.search({
      ...query,
      filters: [...(query.filters || []), ...preset.filters]
    });
  }
}

interface HierarchicalFacetConfig {
  field: string;
  selectedPath: string[];
  depth: number;
  includeAncestors: boolean;
  includeSiblings: boolean;
}

interface FilterPreset {
  id: string;
  userId: string;
  name: string;
  filters: Filter[];
  createdAt: Date;
  usageCount: number;
}
```

## Configuration

### Faceted Search Configuration

```yaml
# faceted-search-config.yml
faceted_search:
  default_facets:
    - field: category
      type: hierarchical
      display_name: Category
      max_values: 50
      hierarchy_depth: 3
      multi_select: false
      
    - field: brand
      type: terms
      display_name: Brand
      max_values: 100
      multi_select: true
      sort_order: count
      
    - field: price
      type: range
      display_name: Price
      ranges:
        - { to: 25, label: "Under $25" }
        - { from: 25, to: 50, label: "$25 - $50" }
        - { from: 50, to: 100, label: "$50 - $100" }
        - { from: 100, to: 200, label: "$100 - $200" }
        - { from: 200, label: "Over $200" }
      
    - field: rating
      type: rating
      display_name: Customer Rating
      min_rating: 1
      max_rating: 5
      
    - field: availability
      type: boolean
      display_name: In Stock
      true_label: "In Stock"
      false_label: "Out of Stock"

  performance:
    cache_enabled: true
    cache_ttl_seconds: 300
    max_concurrent_aggregations: 10
    
  ui:
    show_counts: true
    show_zero_counts: false
    collapsible_facets: true
    default_expanded: ["category", "price"]
    show_more_threshold: 5
```

## Integration Points

### Search Engine Integration

```typescript
// Elasticsearch Faceted Search Integration
class ElasticsearchFacetedSearch implements FacetedSearchProvider {
  async search(query: FacetedSearchQuery): Promise<FacetedSearchResult> {
    const searchBody = {
      query: this.buildQuery(query),
      aggs: this.buildAggregations(query.facetConfigs, query.filters),
      size: query.pagination?.limit || 20,
      from: query.pagination?.offset || 0,
      post_filter: this.buildPostFilter(query.filters)
    };

    const response = await this.client.search({
      index: this.indexName,
      body: searchBody
    });

    return this.processResponse(response, query);
  }

  private buildPostFilter(filters: Filter[]): any {
    // Post filter applies after aggregations for accurate facet counts
    if (filters.length === 0) return undefined;

    return {
      bool: {
        filter: filters.map(f => this.buildFilterClause(f))
      }
    };
  }
}
```

## Security Considerations

### Filter Validation

```typescript
class FilterValidator {
  private allowedFields: Set<string>;
  private fieldTypes: Map<string, string>;

  validate(filters: Filter[]): ValidationResult {
    const errors: ValidationError[] = [];

    for (const filter of filters) {
      // Check field is allowed
      if (!this.allowedFields.has(filter.field)) {
        errors.push({
          field: filter.field,
          message: `Field '${filter.field}' is not filterable`
        });
        continue;
      }

      // Validate filter type matches field type
      const expectedType = this.fieldTypes.get(filter.field);
      if (!this.isValidFilterType(filter.type, expectedType)) {
        errors.push({
          field: filter.field,
          message: `Invalid filter type '${filter.type}' for field type '${expectedType}'`
        });
      }

      // Validate values
      if (filter.values) {
        const valueErrors = this.validateValues(filter.field, filter.values);
        errors.push(...valueErrors);
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  private validateValues(field: string, values: any[]): ValidationError[] {
    const errors: ValidationError[] = [];
    const maxValues = 100;

    if (values.length > maxValues) {
      errors.push({
        field,
        message: `Too many filter values (max ${maxValues})`
      });
    }

    // Sanitize string values
    for (const value of values) {
      if (typeof value === 'string' && value.length > 500) {
        errors.push({
          field,
          message: 'Filter value too long'
        });
      }
    }

    return errors;
  }
}
```

## Testing Considerations

### Faceted Search Testing

```typescript
describe('Faceted Search', () => {
  it('should generate accurate facet counts', async () => {
    const result = await facetedSearch.search({
      query: 'laptop',
      facets: ['brand', 'price_range']
    });

    // Verify facet counts sum correctly
    const brandFacet = result.facets.find(f => f.field === 'brand');
    const totalBrandCount = brandFacet.values.reduce((sum, v) => sum + v.count, 0);
    expect(totalBrandCount).toBeLessThanOrEqual(result.total);
  });

  it('should update facet counts when filters applied', async () => {
    const unfilteredResult = await facetedSearch.search({
      query: 'laptop',
      facets: ['brand']
    });

    const filteredResult = await facetedSearch.search({
      query: 'laptop',
      facets: ['brand'],
      filters: [{ field: 'price', type: 'range', range: { max: 500 } }]
    });

    // Filtered results should have lower or equal counts
    const unfilteredBrand = unfilteredResult.facets.find(f => f.field === 'brand');
    const filteredBrand = filteredResult.facets.find(f => f.field === 'brand');

    for (const value of filteredBrand.values) {
      const unfilteredValue = unfilteredBrand.values.find(v => v.value === value.value);
      expect(value.count).toBeLessThanOrEqual(unfilteredValue?.count || 0);
    }
  });

  it('should handle multi-select filters correctly', async () => {
    const result = await facetedSearch.search({
      query: 'laptop',
      facets: ['brand'],
      filters: [{ field: 'brand', type: 'terms', values: ['Apple', 'Dell'] }]
    });

    // All results should match one of the selected brands
    for (const hit of result.hits) {
      expect(['Apple', 'Dell']).toContain(hit.source.brand);
    }
  });

  it('should generate hierarchical facets correctly', async () => {
    const result = await facetedSearch.getHierarchicalFacet({
      field: 'category',
      selectedPath: ['Electronics', 'Computers'],
      depth: 3
    });

    // Verify hierarchy structure
    expect(result.values).toBeDefined();
    const electronics = result.values.find(v => v.value === 'Electronics');
    expect(electronics?.children).toBeDefined();
  });
});
```
