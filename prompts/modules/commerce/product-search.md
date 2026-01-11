# Product Search and Discovery Template

## Purpose

This template provides comprehensive patterns for building advanced product search and discovery systems that deliver relevant, fast, and intuitive search experiences. It covers full-text search, faceted filtering, recommendation engines, and AI-powered search capabilities to help customers find products efficiently.

## Context

Effective product search is critical for e-commerce conversion rates and customer satisfaction. This template addresses the complexity of building high-performance search infrastructure, implementing intelligent relevance scoring, providing faceted navigation, and leveraging analytics to continuously optimize search results and product discovery.

## Instructions
1. Analyze search requirements and product discovery needs
2. Design scalable search architecture with appropriate indexing
3. Implement full-text search with relevance scoring and boosting
4. Build faceted search with dynamic filtering capabilities
5. Create intelligent autocomplete and search suggestions
6. Add personalized search results and recommendation integration
7. Implement search analytics and performance optimization
8. Build visual search and AI-powered discovery features
9. Create mobile-optimized search experiences
10. Add search result merchandising and promotional capabilities

## Examples

### Example 1: Advanced Product Search Engine
```typescript
// Comprehensive search with faceting and personalization
class ProductSearchEngine {
  async search(query: SearchQuery): Promise<SearchResult> {
    const searchRequest = {
      textQuery: this.buildMultiFieldQuery(query.query),
      filters: this.buildFilters(query),
      facets: this.buildDynamicFacets(query),
      personalization: await this.getPersonalizationBoosts(query.userId),
      sort: this.buildSortCriteria(query)
    };
    
    const results = await this.searchClient.search(searchRequest);
    return this.enhanceResults(results, query);
  }
}
```

### Example 2: Intelligent Search Suggestions
```typescript
// AI-powered autocomplete with multiple suggestion types
class SearchSuggestionEngine {
  async getSuggestions(partialQuery: string): Promise<SearchSuggestion[]> {
    const [queryCompletions, productSuggestions, categorySuggestions] = await Promise.all([
      this.getQueryCompletions(partialQuery),
      this.getProductSuggestions(partialQuery),
      this.getCategorySuggestions(partialQuery)
    ]);
    
    return this.rankAndMergeSuggestions([
      ...queryCompletions,
      ...productSuggestions,
      ...categorySuggestions
    ]);
  }
}
```

### Example 3: Search Analytics and Optimization
```typescript
// Comprehensive search performance analytics
class SearchAnalyticsEngine {
  async optimizeSearchRankings(): Promise<OptimizationResult> {
    const clickThroughData = await this.getClickThroughRates();
    const conversionData = await this.getSearchConversions();
    
    const optimizations = this.generateRankingOptimizations({
      underperformingProducts: this.findLowCTRProducts(clickThroughData),
      overperformingProducts: this.findHighCTRProducts(clickThroughData),
      conversionPatterns: this.analyzeConversionPatterns(conversionData)
    });
    
    return await this.applyOptimizations(optimizations);
  }
}
```

## Variables
| Variable | Type | Description | Default | Required |
|----------|------|-------------|---------|----------|
| searchEngine | string | Search backend technology | 'elasticsearch' | Yes |
| indexingStrategy | string | Product indexing approach | 'real_time' | No |
| facetedSearch | boolean | Enable faceted filtering | true | Yes |
| autocomplete | boolean | Enable search suggestions | true | No |
| personalization | boolean | Personalize search results | false | No |
| visualSearch | boolean | Enable image-based search | false | No |
| voiceSearch | boolean | Enable voice search | false | No |
| searchAnalytics | boolean | Track search performance | true | No |
| typoTolerance | boolean | Handle search typos | true | No |
| synonymHandling | boolean | Process search synonyms | true | No |

## Expected Output
A comprehensive product search and discovery system featuring:
- High-performance full-text search with relevance scoring and field boosting
- Dynamic faceted search with intelligent filter generation and counts
- Advanced autocomplete with query, product, and category suggestions
- Personalized search results based on user behavior and preferences
- Search analytics with performance optimization and A/B testing
- Mobile-optimized search interface with touch-friendly interactions
- Visual and voice search capabilities for modern discovery experiences
- Search result merchandising with promotional and featured product placement
- Real-time search suggestions with typo tolerance and synonym handling
- Comprehensive search insights and conversion optimization tools

## Core Search and Discovery Patterns

### 1. Search Architecture and Data Model

Define comprehensive search infrastructure:

```typescript
interface SearchIndex {
  productId: string;
  variantId?: string;
  sku: string;
  
  // Basic product information
  name: string;
  description: string;
  shortDescription?: string;
  brand?: string;
  
  // Categorization
  categories: CategoryInfo[];
  tags: string[];
  
  // Pricing
  price: number;
  salePrice?: number;
  currency: string;
  priceRange?: PriceRange;
  
  // Availability
  inStock: boolean;
  stockQuantity: number;
  availableLocations: string[];
  
  // Attributes for filtering
  attributes: SearchableAttribute[];
  
  // Search optimization
  searchKeywords: string[];
  synonyms: string[];
  searchBoost: number;
  
  // Popularity and quality signals
  salesRank: number;
  reviewCount: number;
  averageRating: number;
  viewCount: number;
  conversionRate: number;
  
  // Media
  primaryImage: string;
  imageCount: number;
  hasVideo: boolean;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  lastSoldAt?: Date;
  
  // Computed fields
  popularityScore: number;
  relevanceBoost: number;
}

interface SearchableAttribute {
  id: string;
  name: string;
  type: AttributeType;
  value: any;
  displayValue: string;
  isFilterable: boolean;
  filterGroup?: string;
  sortOrder: number;
}

interface CategoryInfo {
  id: string;
  name: string;
  path: string;
  level: number;
}

interface SearchQuery {
  // Text search
  query?: string;
  
  // Filters
  categoryIds?: string[];
  brandIds?: string[];
  priceRange?: PriceRange;
  attributes?: AttributeFilter[];
  inStock?: boolean;
  hasReviews?: boolean;
  minRating?: number;
  
  // Sorting
  sortBy?: SortOption;
  sortOrder?: 'asc' | 'desc';
  
  // Pagination
  page?: number;
  limit?: number;
  
  // Personalization
  userId?: string;
  sessionId?: string;
  
  // Context
  locationId?: string;
  deviceType?: 'mobile' | 'desktop' | 'tablet';
  
  // Advanced options
  includeOutOfStock?: boolean;
  boostNewProducts?: boolean;
  boostPopularProducts?: boolean;
}

interface SearchResult {
  products: ProductSearchHit[];
  totalCount: number;
  facets: SearchFacet[];
  suggestions: SearchSuggestion[];
  didYouMean?: string;
  relatedQueries: string[];
  pagination: PaginationInfo;
  searchMetadata: SearchMetadata;
}

interface ProductSearchHit {
  product: Product;
  score: number;
  matchedFields: string[];
  highlights: Record<string, string[]>;
  explanation?: string;
}
```

### 2. Full-Text Search Engine

Implement sophisticated text search capabilities:

```typescript
class ProductSearchEngine {
  private searchClient: SearchClient;
  private indexName: string;
  
  constructor(searchClient: SearchClient, indexName: string) {
    this.searchClient = searchClient;
    this.indexName = indexName;
  }
  
  async search(query: SearchQuery): Promise<SearchResult> {
    // Build search request
    const searchRequest = await this.buildSearchRequest(query);
    
    // Execute search
    const rawResults = await this.searchClient.search(this.indexName, searchRequest);
    
    // Process and enhance results
    const processedResults = await this.processSearchResults(rawResults, query);
    
    // Log search analytics
    await this.logSearchEvent(query, processedResults);
    
    return processedResults;
  }
  
  private async buildSearchRequest(query: SearchQuery): Promise<SearchRequest> {
    const request: SearchRequest = {
      query: this.buildTextQuery(query.query),
      filters: this.buildFilters(query),
      sort: this.buildSort(query),
      facets: this.buildFacets(query),
      pagination: {
        offset: ((query.page || 1) - 1) * (query.limit || 20),
        limit: query.limit || 20
      },
      highlight: {
        fields: ['name', 'description', 'brand'],
        fragmentSize: 150,
        numberOfFragments: 3
      }
    };
    
    // Apply personalization
    if (query.userId) {
      request.personalization = await this.buildPersonalization(query.userId);
    }
    
    // Apply location-based boosting
    if (query.locationId) {
      request.locationBoost = await this.buildLocationBoost(query.locationId);
    }
    
    return request;
  }
  
  private buildTextQuery(queryText?: string): TextQuery {
    if (!queryText) {
      return { matchAll: true };
    }
    
    // Clean and normalize query
    const cleanQuery = this.normalizeQuery(queryText);
    
    // Build multi-field query with different weights
    return {
      multiMatch: {
        query: cleanQuery,
        fields: [
          'name^3',           // Highest weight for product name
          'brand^2',          // High weight for brand
          'sku^2',           // High weight for SKU
          'searchKeywords^2', // High weight for search keywords
          'description^1',    // Normal weight for description
          'categories.name^1.5', // Medium weight for category names
          'attributes.value^1'   // Normal weight for attributes
        ],
        type: 'best_fields',
        fuzziness: 'AUTO',
        operator: 'and',
        minimumShouldMatch: '75%'
      }
    };
  }
  
  private buildFilters(query: SearchQuery): Filter[] {
    const filters: Filter[] = [];
    
    // Category filters
    if (query.categoryIds && query.categoryIds.length > 0) {
      filters.push({
        terms: {
          'categories.id': query.categoryIds
        }
      });
    }
    
    // Brand filters
    if (query.brandIds && query.brandIds.length > 0) {
      filters.push({
        terms: {
          'brand.id': query.brandIds
        }
      });
    }
    
    // Price range filter
    if (query.priceRange) {
      const priceFilter: RangeFilter = {
        range: {
          price: {}
        }
      };
      
      if (query.priceRange.min !== undefined) {
        priceFilter.range.price.gte = query.priceRange.min;
      }
      
      if (query.priceRange.max !== undefined) {
        priceFilter.range.price.lte = query.priceRange.max;
      }
      
      filters.push(priceFilter);
    }
    
    // Stock filter
    if (query.inStock !== undefined) {
      filters.push({
        term: {
          inStock: query.inStock
        }
      });
    }
    
    // Rating filter
    if (query.minRating !== undefined) {
      filters.push({
        range: {
          averageRating: {
            gte: query.minRating
          }
        }
      });
    }
    
    // Attribute filters
    if (query.attributes) {
      for (const attrFilter of query.attributes) {
        filters.push({
          terms: {
            [`attributes.${attrFilter.attributeId}`]: attrFilter.values
          }
        });
      }
    }
    
    return filters;
  }
  
  private buildSort(query: SearchQuery): SortClause[] {
    const sort: SortClause[] = [];
    
    if (query.sortBy) {
      switch (query.sortBy) {
        case SortOption.PRICE:
          sort.push({
            field: 'price',
            order: query.sortOrder || 'asc'
          });
          break;
        case SortOption.NAME:
          sort.push({
            field: 'name.keyword',
            order: query.sortOrder || 'asc'
          });
          break;
        case SortOption.RATING:
          sort.push({
            field: 'averageRating',
            order: query.sortOrder || 'desc'
          });
          break;
        case SortOption.POPULARITY:
          sort.push({
            field: 'popularityScore',
            order: query.sortOrder || 'desc'
          });
          break;
        case SortOption.NEWEST:
          sort.push({
            field: 'createdAt',
            order: query.sortOrder || 'desc'
          });
          break;
      }
    } else if (query.query) {
      // Default to relevance for text searches
      sort.push({
        field: '_score',
        order: 'desc'
      });
    } else {
      // Default to popularity for browsing
      sort.push({
        field: 'popularityScore',
        order: 'desc'
      });
    }
    
    // Always add a tie-breaker
    sort.push({
      field: 'productId',
      order: 'asc'
    });
    
    return sort;
  }
  
  private normalizeQuery(query: string): string {
    return query
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, ' ') // Remove special characters except hyphens
      .replace(/\s+/g, ' '); // Normalize whitespace
  }
}
```

### 3. Faceted Search and Filtering

Implement dynamic faceted search:

```typescript
class FacetedSearchManager {
  async generateFacets(query: SearchQuery, searchResults: SearchResult): Promise<SearchFacet[]> {
    const facets: SearchFacet[] = [];
    
    // Get facet configuration for the current context
    const facetConfig = await this.getFacetConfiguration(query.categoryIds);
    
    // Generate category facets
    if (facetConfig.includeCategories) {
      const categoryFacet = await this.generateCategoryFacet(query);
      if (categoryFacet.values.length > 0) {
        facets.push(categoryFacet);
      }
    }
    
    // Generate brand facets
    if (facetConfig.includeBrands) {
      const brandFacet = await this.generateBrandFacet(query);
      if (brandFacet.values.length > 0) {
        facets.push(brandFacet);
      }
    }
    
    // Generate price range facets
    if (facetConfig.includePriceRanges) {
      const priceFacet = await this.generatePriceFacet(query);
      if (priceFacet.values.length > 0) {
        facets.push(priceFacet);
      }
    }
    
    // Generate attribute facets
    for (const attributeConfig of facetConfig.attributes) {
      const attributeFacet = await this.generateAttributeFacet(query, attributeConfig);
      if (attributeFacet.values.length > 0) {
        facets.push(attributeFacet);
      }
    }
    
    // Generate rating facet
    if (facetConfig.includeRating) {
      const ratingFacet = await this.generateRatingFacet(query);
      if (ratingFacet.values.length > 0) {
        facets.push(ratingFacet);
      }
    }
    
    // Sort facets by configuration order
    return facets.sort((a, b) => 
      (facetConfig.facetOrder[a.id] || 999) - (facetConfig.facetOrder[b.id] || 999)
    );
  }
  
  private async generateAttributeFacet(query: SearchQuery, attributeConfig: AttributeFacetConfig): Promise<SearchFacet> {
    // Build facet query excluding the current attribute filter
    const facetQuery = this.buildFacetQuery(query, attributeConfig.attributeId);
    
    // Execute aggregation query
    const aggregationResult = await this.searchClient.aggregate(this.indexName, {
      query: facetQuery,
      aggregations: {
        [attributeConfig.attributeId]: {
          terms: {
            field: `attributes.${attributeConfig.attributeId}.keyword`,
            size: attributeConfig.maxValues || 20,
            order: { _count: 'desc' }
          }
        }
      }
    });
    
    // Process aggregation results
    const buckets = aggregationResult.aggregations[attributeConfig.attributeId].buckets;
    const facetValues: FacetValue[] = buckets.map(bucket => ({
      value: bucket.key,
      displayValue: this.getAttributeDisplayValue(attributeConfig.attributeId, bucket.key),
      count: bucket.doc_count,
      selected: this.isAttributeValueSelected(query, attributeConfig.attributeId, bucket.key)
    }));
    
    return {
      id: attributeConfig.attributeId,
      name: attributeConfig.displayName,
      type: attributeConfig.type,
      values: facetValues,
      multiSelect: attributeConfig.multiSelect || false,
      displayType: attributeConfig.displayType || 'list'
    };
  }
  
  private async generatePriceFacet(query: SearchQuery): Promise<SearchFacet> {
    // Get price statistics for dynamic range generation
    const priceStats = await this.getPriceStatistics(query);
    
    // Generate price ranges
    const priceRanges = this.generatePriceRanges(priceStats);
    
    // Get counts for each range
    const facetValues: FacetValue[] = [];
    
    for (const range of priceRanges) {
      const rangeQuery = this.buildPriceRangeQuery(query, range);
      const count = await this.getQueryCount(rangeQuery);
      
      if (count > 0) {
        facetValues.push({
          value: `${range.min}-${range.max}`,
          displayValue: this.formatPriceRange(range),
          count,
          selected: this.isPriceRangeSelected(query, range)
        });
      }
    }
    
    return {
      id: 'price',
      name: 'Price',
      type: 'price_range',
      values: facetValues,
      multiSelect: false,
      displayType: 'range_slider'
    };
  }
  
  private generatePriceRanges(stats: PriceStatistics): PriceRange[] {
    const ranges: PriceRange[] = [];
    const min = stats.min;
    const max = stats.max;
    const rangeCount = 8; // Number of price ranges to generate
    
    // Calculate range size
    const rangeSize = (max - min) / rangeCount;
    
    for (let i = 0; i < rangeCount; i++) {
      const rangeMin = min + (i * rangeSize);
      const rangeMax = i === rangeCount - 1 ? max : min + ((i + 1) * rangeSize);
      
      ranges.push({
        min: Math.round(rangeMin),
        max: Math.round(rangeMax)
      });
    }
    
    return ranges;
  }
  
  private buildFacetQuery(originalQuery: SearchQuery, excludeAttributeId?: string): SearchQuery {
    const facetQuery = { ...originalQuery };
    
    // Remove the specific attribute filter to get accurate facet counts
    if (excludeAttributeId && facetQuery.attributes) {
      facetQuery.attributes = facetQuery.attributes.filter(
        attr => attr.attributeId !== excludeAttributeId
      );
    }
    
    return facetQuery;
  }
}
```

### 4. Search Suggestions and Autocomplete

Implement intelligent search suggestions:

```typescript
interface SearchSuggestion {
  type: SuggestionType;
  text: string;
  displayText: string;
  count?: number;
  category?: string;
  imageUrl?: string;
  url?: string;
}

enum SuggestionType {
  QUERY = 'query',
  PRODUCT = 'product',
  CATEGORY = 'category',
  BRAND = 'brand'
}

class SearchSuggestionEngine {
  async getSuggestions(partialQuery: string, limit: number = 10): Promise<SearchSuggestion[]> {
    const suggestions: SearchSuggestion[] = [];
    const normalizedQuery = this.normalizeQuery(partialQuery);
    
    if (normalizedQuery.length < 2) {
      return suggestions;
    }
    
    // Get query suggestions from search history
    const querySuggestions = await this.getQuerySuggestions(normalizedQuery, Math.ceil(limit * 0.4));
    suggestions.push(...querySuggestions);
    
    // Get product suggestions
    const productSuggestions = await this.getProductSuggestions(normalizedQuery, Math.ceil(limit * 0.3));
    suggestions.push(...productSuggestions);
    
    // Get category suggestions
    const categorySuggestions = await this.getCategorySuggestions(normalizedQuery, Math.ceil(limit * 0.2));
    suggestions.push(...categorySuggestions);
    
    // Get brand suggestions
    const brandSuggestions = await this.getBrandSuggestions(normalizedQuery, Math.ceil(limit * 0.1));
    suggestions.push(...brandSuggestions);
    
    // Sort by relevance and limit results
    return suggestions
      .sort((a, b) => (b.count || 0) - (a.count || 0))
      .slice(0, limit);
  }
  
  private async getQuerySuggestions(query: string, limit: number): Promise<SearchSuggestion[]> {
    // Query the search analytics for popular queries that start with the input
    const popularQueries = await this.searchAnalytics.getPopularQueries({
      prefix: query,
      minCount: 5,
      limit,
      timeframe: '30d'
    });
    
    return popularQueries.map(pq => ({
      type: SuggestionType.QUERY,
      text: pq.query,
      displayText: this.highlightMatch(pq.query, query),
      count: pq.searchCount
    }));
  }
  
  private async getProductSuggestions(query: string, limit: number): Promise<SearchSuggestion[]> {
    // Search for products that match the query
    const searchResults = await this.searchEngine.search({
      query,
      limit,
      sortBy: SortOption.POPULARITY
    });
    
    return searchResults.products.slice(0, limit).map(hit => ({
      type: SuggestionType.PRODUCT,
      text: hit.product.name,
      displayText: this.highlightMatch(hit.product.name, query),
      imageUrl: hit.product.primaryImage,
      url: `/products/${hit.product.slug}`,
      count: hit.product.salesRank
    }));
  }
  
  private async getCategorySuggestions(query: string, limit: number): Promise<SearchSuggestion[]> {
    // Search categories that match the query
    const matchingCategories = await this.categoryRepository.searchByName(query, limit);
    
    return matchingCategories.map(category => ({
      type: SuggestionType.CATEGORY,
      text: category.name,
      displayText: this.highlightMatch(category.name, query),
      url: `/categories/${category.slug}`,
      count: category.productCount
    }));
  }
  
  private async getBrandSuggestions(query: string, limit: number): Promise<SearchSuggestion[]> {
    // Search brands that match the query
    const matchingBrands = await this.brandRepository.searchByName(query, limit);
    
    return matchingBrands.map(brand => ({
      type: SuggestionType.BRAND,
      text: brand.name,
      displayText: this.highlightMatch(brand.name, query),
      url: `/brands/${brand.slug}`,
      count: brand.productCount
    }));
  }
  
  private highlightMatch(text: string, query: string): string {
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  }
  
  async buildSearchSuggestionIndex(): Promise<void> {
    // Build suggestion index from various sources
    const suggestions: SuggestionIndexEntry[] = [];
    
    // Add popular search queries
    const popularQueries = await this.searchAnalytics.getPopularQueries({
      minCount: 10,
      limit: 10000,
      timeframe: '90d'
    });
    
    suggestions.push(...popularQueries.map(pq => ({
      text: pq.query,
      type: SuggestionType.QUERY,
      weight: pq.searchCount,
      metadata: { searchCount: pq.searchCount }
    })));
    
    // Add product names
    const products = await this.productRepository.findAllActive();
    suggestions.push(...products.map(product => ({
      text: product.name,
      type: SuggestionType.PRODUCT,
      weight: product.salesRank,
      metadata: {
        productId: product.id,
        imageUrl: product.primaryImage,
        url: `/products/${product.slug}`
      }
    })));
    
    // Add category names
    const categories = await this.categoryRepository.findAllActive();
    suggestions.push(...categories.map(category => ({
      text: category.name,
      type: SuggestionType.CATEGORY,
      weight: category.productCount,
      metadata: {
        categoryId: category.id,
        url: `/categories/${category.slug}`
      }
    })));
    
    // Add brand names
    const brands = await this.brandRepository.findAllActive();
    suggestions.push(...brands.map(brand => ({
      text: brand.name,
      type: SuggestionType.BRAND,
      weight: brand.productCount,
      metadata: {
        brandId: brand.id,
        url: `/brands/${brand.slug}`
      }
    })));
    
    // Index suggestions for fast retrieval
    await this.suggestionIndex.bulkIndex(suggestions);
  }
}
```

### 5. Search Analytics and Optimization

Implement comprehensive search analytics:

```typescript
interface SearchAnalytics {
  logSearchEvent(query: SearchQuery, results: SearchResult, userId?: string): Promise<void>;
  logClickEvent(query: string, productId: string, position: number, userId?: string): Promise<void>;
  logConversionEvent(query: string, productId: string, orderId: string, userId?: string): Promise<void>;
  getSearchPerformanceMetrics(timeframe: string): Promise<SearchMetrics>;
  getPopularQueries(options: PopularQueryOptions): Promise<PopularQuery[]>;
  getZeroResultQueries(timeframe: string): Promise<ZeroResultQuery[]>;
  getClickThroughRates(timeframe: string): Promise<ClickThroughRateReport>;
}

interface SearchMetrics {
  totalSearches: number;
  uniqueSearches: number;
  averageResultsPerSearch: number;
  zeroResultRate: number;
  clickThroughRate: number;
  conversionRate: number;
  averageSearchDepth: number;
  topQueries: PopularQuery[];
  topZeroResultQueries: ZeroResultQuery[];
}

interface PopularQuery {
  query: string;
  searchCount: number;
  clickCount: number;
  conversionCount: number;
  clickThroughRate: number;
  conversionRate: number;
}

class SearchAnalyticsEngine {
  async logSearchEvent(query: SearchQuery, results: SearchResult, userId?: string): Promise<void> {
    const searchEvent: SearchEvent = {
      id: this.generateEventId(),
      query: query.query || '',
      filters: this.serializeFilters(query),
      resultCount: results.totalCount,
      userId,
      sessionId: query.sessionId,
      timestamp: new Date(),
      deviceType: query.deviceType,
      locationId: query.locationId
    };
    
    await this.searchEventRepository.save(searchEvent);
    
    // Update real-time metrics
    await this.updateSearchMetrics(searchEvent);
  }
  
  async getSearchPerformanceMetrics(timeframe: string): Promise<SearchMetrics> {
    const endDate = new Date();
    const startDate = this.calculateStartDate(endDate, timeframe);
    
    // Get basic search metrics
    const [
      totalSearches,
      uniqueSearches,
      averageResults,
      zeroResultRate,
      clickThroughRate,
      conversionRate,
      averageDepth
    ] = await Promise.all([
      this.getTotalSearches(startDate, endDate),
      this.getUniqueSearches(startDate, endDate),
      this.getAverageResultsPerSearch(startDate, endDate),
      this.getZeroResultRate(startDate, endDate),
      this.getOverallClickThroughRate(startDate, endDate),
      this.getOverallConversionRate(startDate, endDate),
      this.getAverageSearchDepth(startDate, endDate)
    ]);
    
    // Get top queries
    const topQueries = await this.getPopularQueries({
      timeframe,
      limit: 20,
      minCount: 5
    });
    
    // Get top zero result queries
    const topZeroResultQueries = await this.getZeroResultQueries(timeframe);
    
    return {
      totalSearches,
      uniqueSearches,
      averageResultsPerSearch: averageResults,
      zeroResultRate,
      clickThroughRate,
      conversionRate,
      averageSearchDepth: averageDepth,
      topQueries,
      topZeroResultQueries: topZeroResultQueries.slice(0, 10)
    };
  }
  
  async optimizeSearchRankings(): Promise<void> {
    // Analyze click-through rates by position
    const positionCTRs = await this.getClickThroughRatesByPosition();
    
    // Identify products with low CTR in high positions
    const underperformingProducts = await this.findUnderperformingProducts(positionCTRs);
    
    // Identify products with high CTR in low positions
    const overperformingProducts = await this.findOverperformingProducts(positionCTRs);
    
    // Generate ranking optimization recommendations
    const recommendations = await this.generateRankingRecommendations(
      underperformingProducts,
      overperformingProducts
    );
    
    // Apply automatic optimizations (if enabled)
    if (this.config.autoOptimizeRankings) {
      await this.applyRankingOptimizations(recommendations);
    }
    
    // Log optimization results
    await this.logOptimizationResults(recommendations);
  }
  
  async generateSearchInsights(): Promise<SearchInsights> {
    const timeframe = '30d';
    
    // Analyze search patterns
    const searchPatterns = await this.analyzeSearchPatterns(timeframe);
    
    // Identify trending queries
    const trendingQueries = await this.identifyTrendingQueries(timeframe);
    
    // Analyze seasonal patterns
    const seasonalPatterns = await this.analyzeSeasonalPatterns();
    
    // Identify content gaps
    const contentGaps = await this.identifyContentGaps(timeframe);
    
    // Generate recommendations
    const recommendations = await this.generateSearchRecommendations({
      searchPatterns,
      trendingQueries,
      seasonalPatterns,
      contentGaps
    });
    
    return {
      searchPatterns,
      trendingQueries,
      seasonalPatterns,
      contentGaps,
      recommendations,
      generatedAt: new Date()
    };
  }
  
  private async analyzeSearchPatterns(timeframe: string): Promise<SearchPattern[]> {
    // Analyze common search patterns and user behavior
    const patterns: SearchPattern[] = [];
    
    // Query length patterns
    const queryLengthDistribution = await this.getQueryLengthDistribution(timeframe);
    patterns.push({
      type: 'query_length',
      description: 'Distribution of search query lengths',
      data: queryLengthDistribution
    });
    
    // Filter usage patterns
    const filterUsage = await this.getFilterUsagePatterns(timeframe);
    patterns.push({
      type: 'filter_usage',
      description: 'Most commonly used search filters',
      data: filterUsage
    });
    
    // Search refinement patterns
    const refinementPatterns = await this.getSearchRefinementPatterns(timeframe);
    patterns.push({
      type: 'search_refinement',
      description: 'How users refine their searches',
      data: refinementPatterns
    });
    
    return patterns;
  }
}
```

## Implementation Checklist

### Search Infrastructure
- [ ] Set up search engine (Elasticsearch, Solr, or cloud service)
- [ ] Design and implement search index structure
- [ ] Build product indexing pipeline
- [ ] Implement real-time index updates
- [ ] Set up search result caching

### Text Search
- [ ] Implement multi-field text search
- [ ] Configure search field weights and boosting
- [ ] Add fuzzy matching and typo tolerance
- [ ] Implement synonym handling
- [ ] Set up search result highlighting

### Faceted Search
- [ ] Build dynamic facet generation
- [ ] Implement attribute-based filtering
- [ ] Create price range filtering
- [ ] Set up category and brand filtering
- [ ] Build facet count calculations

### Search Suggestions
- [ ] Implement autocomplete functionality
- [ ] Build suggestion index from multiple sources
- [ ] Create query suggestion engine
- [ ] Add product and category suggestions
- [ ] Implement suggestion ranking

### Analytics and Optimization
- [ ] Set up search event tracking
- [ ] Build search performance dashboards
- [ ] Implement click-through rate tracking
- [ ] Create search optimization tools
- [ ] Set up automated ranking improvements

## Configuration Parameters

```yaml
product_search:
  index_settings:
    shards: 3
    replicas: 1
    refresh_interval: "1s"
    
  search_settings:
    default_page_size: 20
    max_page_size: 100
    fuzzy_distance: 2
    minimum_should_match: "75%"
    
  facets:
    max_facet_values: 50
    price_range_count: 8
    enable_dynamic_facets: true
    
  suggestions:
    min_query_length: 2
    max_suggestions: 10
    cache_duration: "5m"
    
  analytics:
    track_searches: true
    track_clicks: true
    track_conversions: true
    retention_days: 90
```

## Integration Points

- **Product Catalog**: Product data and attributes for indexing
- **Inventory Management**: Stock levels and availability
- **Customer Management**: Personalization and search history
- **Analytics**: Search performance and user behavior
- **Recommendation Engine**: Related products and suggestions
- **Content Management**: Search result presentation

## Success Metrics

- Search result relevance: >90% user satisfaction
- Zero result rate: <5% of searches
- Click-through rate: >25% for top 3 results
- Search-to-purchase conversion: >15%
- Average search time: <2 seconds
- Facet usage rate: >60% of searches

## Common Pitfalls to Avoid

1. **Poor search relevance**: Invest in proper field weighting and boosting
2. **Slow search performance**: Implement proper indexing and caching
3. **Limited facet options**: Provide comprehensive filtering capabilities
4. **Poor mobile search experience**: Optimize for mobile interfaces
5. **Ignoring search analytics**: Use data to continuously improve search
6. **Inadequate synonym handling**: Build comprehensive synonym dictionaries
7. **Missing personalization**: Implement user-specific search improvements

## Related Templates

- `product-catalog.md` - Product data and categorization
- `recommendation-engine.md` - Product recommendations
- `analytics-dashboard.md` - Search analytics and reporting
- `personalization-engine.md` - Personalized search results
- `content-management.md` - Search result presentation