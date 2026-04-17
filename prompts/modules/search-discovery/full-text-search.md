# Full-Text Search Template

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

This template provides comprehensive patterns for implementing high-performance full-text search systems with advanced indexing, query processing, relevance scoring, and result ranking. It covers search engine integration, index management, query optimization, and search result enhancement.

## Context

Full-text search is fundamental to content discovery in modern applications. Users expect fast, relevant results with intelligent query understanding, typo tolerance, and contextual ranking. This template addresses the complexity of building scalable search infrastructure that handles millions of documents while delivering sub-second response times and highly relevant results.

## Instructions

1. **Setup Search Infrastructure**: Configure search engine and indexing pipeline
2. **Design Index Schema**: Define document mappings and field configurations
3. **Implement Query Processing**: Build query parsing, normalization, and expansion
4. **Configure Relevance Scoring**: Set up field boosting and ranking algorithms
5. **Add Query Features**: Implement fuzzy matching, synonyms, and autocomplete
6. **Optimize Performance**: Configure caching, sharding, and query optimization
7. **Monitor Search Quality**: Track relevance metrics and search performance

## Examples

### Example 1: Search Engine Setup
```typescript
interface SearchEngine {
  index(documents: Document[]): Promise<IndexResult>;
  search(query: SearchQuery): Promise<SearchResult>;
  suggest(prefix: string): Promise<Suggestion[]>;
  delete(documentIds: string[]): Promise<DeleteResult>;
}

const searchEngine = new ElasticsearchEngine({
  nodes: ['http://localhost:9200'],
  indexName: 'content',
  settings: {
    numberOfShards: 3,
    numberOfReplicas: 1
  }
});
```

### Example 2: Multi-Field Search Query
```typescript
const searchResult = await searchEngine.search({
  query: 'machine learning tutorial',
  fields: ['title^3', 'description^2', 'content^1', 'tags^2'],
  filters: { category: 'technology', status: 'published' },
  pagination: { page: 1, limit: 20 },
  highlight: { fields: ['title', 'description'] }
});
```

### Example 3: Relevance Tuning
```typescript
const relevanceConfig = {
  fieldBoosts: { title: 3.0, description: 2.0, content: 1.0 },
  functionScores: [
    { type: 'recency', field: 'publishedAt', scale: '30d', decay: 0.5 },
    { type: 'popularity', field: 'viewCount', modifier: 'log1p' }
  ],
  minimumShouldMatch: '75%'
};
```

## Variables

| Variable | Description | Type | Required | Default |
|----------|-------------|------|----------|---------|
| searchEngine | Search engine provider | string | Yes | N/A |
| indexName | Primary search index name | string | Yes | N/A |
| numberOfShards | Index shard count | number | No | 3 |
| numberOfReplicas | Index replica count | number | No | 1 |
| enableFuzzyMatching | Enable typo tolerance | boolean | No | true |
| enableSynonyms | Enable synonym expansion | boolean | No | true |
| enableAutocomplete | Enable search suggestions | boolean | No | true |
| maxResultWindow | Maximum pagination depth | number | No | 10000 |
| searchTimeout | Query timeout (ms) | number | No | 5000 |
| enableHighlighting | Enable result highlighting | boolean | No | true |

## Expected Output

This template will produce:
- **Search Engine Integration**: Configured search backend with optimized settings
- **Index Management**: Document indexing, updates, and deletion workflows
- **Query Processing**: Advanced query parsing and normalization
- **Relevance Scoring**: Field boosting and custom ranking algorithms
- **Fuzzy Matching**: Typo tolerance and approximate string matching
- **Synonym Handling**: Query expansion with synonyms and related terms
- **Autocomplete System**: Real-time search suggestions
- **Result Highlighting**: Matched term highlighting in results
- **Performance Optimization**: Caching, query optimization, and monitoring

## Implementation Patterns

### Search Engine Architecture

```typescript
// Core Search System Architecture
interface SearchSystem {
  indexManager: IndexManager;
  queryProcessor: QueryProcessor;
  relevanceScorer: RelevanceScorer;
  resultProcessor: ResultProcessor;
  cacheManager: SearchCacheManager;
  analyticsTracker: SearchAnalyticsTracker;
}

interface SearchQuery {
  query: string;
  fields?: string[];
  filters?: Record<string, any>;
  sort?: SortOption[];
  pagination?: PaginationOptions;
  highlight?: HighlightOptions;
  aggregations?: AggregationOptions[];
  boost?: BoostOptions;
  explain?: boolean;
}

interface SearchResult {
  hits: SearchHit[];
  total: number;
  maxScore: number;
  took: number;
  aggregations?: Record<string, AggregationResult>;
  suggestions?: Suggestion[];
  didYouMean?: string;
}

interface SearchHit {
  id: string;
  score: number;
  source: Record<string, any>;
  highlights?: Record<string, string[]>;
  explanation?: ScoreExplanation;
  matchedQueries?: string[];
}

interface IndexDocument {
  id: string;
  content: Record<string, any>;
  metadata?: DocumentMetadata;
  routing?: string;
}

interface DocumentMetadata {
  createdAt: Date;
  updatedAt: Date;
  version: number;
  source: string;
}
```

### Index Management

```typescript
// Index Management Implementation
class IndexManager {
  private client: SearchClient;
  private indexName: string;
  private settings: IndexSettings;

  async createIndex(schema: IndexSchema): Promise<void> {
    const indexConfig = {
      settings: {
        number_of_shards: this.settings.numberOfShards,
        number_of_replicas: this.settings.numberOfReplicas,
        refresh_interval: this.settings.refreshInterval,
        max_result_window: this.settings.maxResultWindow,
        analysis: this.buildAnalysisConfig()
      },
      mappings: this.buildMappings(schema)
    };

    await this.client.indices.create({
      index: this.indexName,
      body: indexConfig
    });
  }

  private buildAnalysisConfig(): AnalysisConfig {
    return {
      analyzer: {
        default: {
          type: 'custom',
          tokenizer: 'standard',
          filter: ['lowercase', 'asciifolding', 'snowball']
        },
        autocomplete: {
          type: 'custom',
          tokenizer: 'autocomplete_tokenizer',
          filter: ['lowercase', 'asciifolding']
        },
        autocomplete_search: {
          type: 'custom',
          tokenizer: 'standard',
          filter: ['lowercase', 'asciifolding']
        }
      },
      tokenizer: {
        autocomplete_tokenizer: {
          type: 'edge_ngram',
          min_gram: 2,
          max_gram: 20,
          token_chars: ['letter', 'digit']
        }
      },
      filter: {
        snowball: {
          type: 'snowball',
          language: 'English'
        },
        synonym_filter: {
          type: 'synonym',
          synonyms_path: 'synonyms.txt',
          updateable: true
        }
      }
    };
  }

  private buildMappings(schema: IndexSchema): MappingConfig {
    const properties: Record<string, FieldMapping> = {};

    for (const field of schema.fields) {
      properties[field.name] = this.buildFieldMapping(field);
    }

    return {
      dynamic: schema.dynamicMapping || 'strict',
      properties
    };
  }

  private buildFieldMapping(field: FieldDefinition): FieldMapping {
    const mapping: FieldMapping = {
      type: field.type
    };

    if (field.type === 'text') {
      mapping.analyzer = field.analyzer || 'default';
      mapping.search_analyzer = field.searchAnalyzer || 'default';

      if (field.enableAutocomplete) {
        mapping.fields = {
          autocomplete: {
            type: 'text',
            analyzer: 'autocomplete',
            search_analyzer: 'autocomplete_search'
          },
          keyword: {
            type: 'keyword',
            ignore_above: 256
          }
        };
      }
    }

    if (field.boost) {
      mapping.boost = field.boost;
    }

    return mapping;
  }

  async indexDocument(document: IndexDocument): Promise<IndexResult> {
    const result = await this.client.index({
      index: this.indexName,
      id: document.id,
      body: document.content,
      routing: document.routing,
      refresh: 'wait_for'
    });

    return {
      id: result._id,
      version: result._version,
      result: result.result
    };
  }

  async bulkIndex(documents: IndexDocument[]): Promise<BulkIndexResult> {
    const operations = documents.flatMap(doc => [
      { index: { _index: this.indexName, _id: doc.id } },
      doc.content
    ]);

    const result = await this.client.bulk({
      body: operations,
      refresh: 'wait_for'
    });

    return {
      took: result.took,
      errors: result.errors,
      items: result.items.map(item => ({
        id: item.index._id,
        status: item.index.status,
        error: item.index.error
      }))
    };
  }

  async updateDocument(id: string, updates: Partial<Record<string, any>>): Promise<UpdateResult> {
    const result = await this.client.update({
      index: this.indexName,
      id,
      body: { doc: updates },
      refresh: 'wait_for'
    });

    return {
      id: result._id,
      version: result._version,
      result: result.result
    };
  }

  async deleteDocument(id: string): Promise<DeleteResult> {
    const result = await this.client.delete({
      index: this.indexName,
      id,
      refresh: 'wait_for'
    });

    return {
      id: result._id,
      result: result.result
    };
  }
}
```

### Query Processing

```typescript
// Query Processing Implementation
class QueryProcessor {
  private analyzer: TextAnalyzer;
  private synonymExpander: SynonymExpander;
  private spellChecker: SpellChecker;

  async processQuery(rawQuery: string): Promise<ProcessedQuery> {
    // Clean and normalize query
    const cleanedQuery = this.cleanQuery(rawQuery);

    // Tokenize query
    const tokens = await this.analyzer.tokenize(cleanedQuery);

    // Detect language
    const language = await this.analyzer.detectLanguage(cleanedQuery);

    // Extract entities and intent
    const entities = await this.extractEntities(tokens);
    const intent = await this.detectIntent(cleanedQuery, entities);

    // Expand with synonyms
    const expandedTokens = await this.synonymExpander.expand(tokens, language);

    // Check spelling and generate suggestions
    const spellingSuggestions = await this.spellChecker.check(tokens);

    return {
      original: rawQuery,
      cleaned: cleanedQuery,
      tokens,
      expandedTokens,
      language,
      entities,
      intent,
      spellingSuggestions,
      isPhrase: this.isPhrase(rawQuery)
    };
  }

  private cleanQuery(query: string): string {
    return query
      .trim()
      .toLowerCase()
      .replace(/[^\w\s\-'"]/g, ' ')
      .replace(/\s+/g, ' ');
  }

  private async extractEntities(tokens: string[]): Promise<QueryEntity[]> {
    const entities: QueryEntity[] = [];

    // Extract quoted phrases
    const phraseMatches = tokens.join(' ').match(/"([^"]+)"/g);
    if (phraseMatches) {
      for (const match of phraseMatches) {
        entities.push({
          type: 'phrase',
          value: match.replace(/"/g, ''),
          confidence: 1.0
        });
      }
    }

    // Extract field-specific queries (field:value)
    for (const token of tokens) {
      const fieldMatch = token.match(/^(\w+):(.+)$/);
      if (fieldMatch) {
        entities.push({
          type: 'field_query',
          field: fieldMatch[1],
          value: fieldMatch[2],
          confidence: 1.0
        });
      }
    }

    return entities;
  }

  private async detectIntent(query: string, entities: QueryEntity[]): Promise<QueryIntent> {
    // Detect if user is looking for specific item or browsing
    const hasSpecificTerms = entities.some(e => e.type === 'phrase' || e.type === 'field_query');

    if (hasSpecificTerms) {
      return { type: 'specific', confidence: 0.9 };
    }

    // Check for question patterns
    const questionPatterns = /^(what|how|where|when|why|who|which)/i;
    if (questionPatterns.test(query)) {
      return { type: 'question', confidence: 0.8 };
    }

    return { type: 'exploratory', confidence: 0.7 };
  }

  private isPhrase(query: string): boolean {
    return query.includes('"') || query.split(' ').length > 3;
  }
}

// Synonym Expansion
class SynonymExpander {
  private synonymMap: Map<string, string[]>;

  async expand(tokens: string[], language: string): Promise<string[]> {
    const expandedTokens: string[] = [...tokens];

    for (const token of tokens) {
      const synonyms = this.synonymMap.get(token.toLowerCase());
      if (synonyms) {
        expandedTokens.push(...synonyms);
      }
    }

    return [...new Set(expandedTokens)];
  }

  async loadSynonyms(synonymsPath: string): Promise<void> {
    // Load synonyms from file or database
    const synonymData = await this.loadSynonymData(synonymsPath);

    this.synonymMap = new Map();
    for (const group of synonymData) {
      for (const term of group) {
        const otherTerms = group.filter(t => t !== term);
        this.synonymMap.set(term.toLowerCase(), otherTerms);
      }
    }
  }
}

// Spell Checker
class SpellChecker {
  private dictionary: Set<string>;
  private frequencyMap: Map<string, number>;

  async check(tokens: string[]): Promise<SpellingSuggestion[]> {
    const suggestions: SpellingSuggestion[] = [];

    for (const token of tokens) {
      if (!this.dictionary.has(token.toLowerCase())) {
        const candidates = this.findCandidates(token);
        if (candidates.length > 0) {
          suggestions.push({
            original: token,
            suggestions: candidates.slice(0, 3),
            confidence: this.calculateConfidence(token, candidates[0])
          });
        }
      }
    }

    return suggestions;
  }

  private findCandidates(word: string): string[] {
    const candidates: Array<{ word: string; distance: number; frequency: number }> = [];

    for (const dictWord of this.dictionary) {
      const distance = this.levenshteinDistance(word.toLowerCase(), dictWord);
      if (distance <= 2) {
        candidates.push({
          word: dictWord,
          distance,
          frequency: this.frequencyMap.get(dictWord) || 0
        });
      }
    }

    return candidates
      .sort((a, b) => {
        if (a.distance !== b.distance) return a.distance - b.distance;
        return b.frequency - a.frequency;
      })
      .map(c => c.word);
  }

  private levenshteinDistance(a: string, b: string): number {
    const matrix: number[][] = [];

    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[b.length][a.length];
  }
}
```

### Relevance Scoring

```typescript
// Relevance Scoring Implementation
class RelevanceScorer {
  private config: RelevanceScoringConfig;

  buildScoringQuery(processedQuery: ProcessedQuery, options: SearchOptions): ScoringQuery {
    const query: ScoringQuery = {
      bool: {
        must: [],
        should: [],
        filter: []
      }
    };

    // Build main text query
    const textQuery = this.buildTextQuery(processedQuery, options);
    query.bool.must.push(textQuery);

    // Add function scores for boosting
    const functionScores = this.buildFunctionScores(options);

    return {
      function_score: {
        query,
        functions: functionScores,
        score_mode: 'sum',
        boost_mode: 'multiply'
      }
    };
  }

  private buildTextQuery(processedQuery: ProcessedQuery, options: SearchOptions): TextQuery {
    const fields = options.fields || this.config.defaultFields;
    const boostedFields = fields.map(field => {
      const boost = this.config.fieldBoosts[field] || 1.0;
      return `${field}^${boost}`;
    });

    if (processedQuery.isPhrase) {
      return {
        multi_match: {
          query: processedQuery.cleaned,
          fields: boostedFields,
          type: 'phrase',
          slop: 2
        }
      };
    }

    return {
      bool: {
        should: [
          // Best fields match
          {
            multi_match: {
              query: processedQuery.cleaned,
              fields: boostedFields,
              type: 'best_fields',
              fuzziness: options.enableFuzzy ? 'AUTO' : '0',
              prefix_length: 2,
              minimum_should_match: '75%'
            }
          },
          // Phrase match with higher boost
          {
            multi_match: {
              query: processedQuery.cleaned,
              fields: boostedFields,
              type: 'phrase',
              boost: 2.0
            }
          },
          // Cross-fields match for multi-word queries
          {
            multi_match: {
              query: processedQuery.cleaned,
              fields: boostedFields,
              type: 'cross_fields',
              operator: 'and'
            }
          }
        ],
        minimum_should_match: 1
      }
    };
  }

  private buildFunctionScores(options: SearchOptions): FunctionScore[] {
    const functions: FunctionScore[] = [];

    // Recency boost
    if (this.config.recencyBoost?.enabled) {
      functions.push({
        gauss: {
          [this.config.recencyBoost.field]: {
            origin: 'now',
            scale: this.config.recencyBoost.scale,
            decay: this.config.recencyBoost.decay
          }
        },
        weight: this.config.recencyBoost.weight
      });
    }

    // Popularity boost
    if (this.config.popularityBoost?.enabled) {
      functions.push({
        field_value_factor: {
          field: this.config.popularityBoost.field,
          modifier: 'log1p',
          factor: this.config.popularityBoost.factor,
          missing: 1
        },
        weight: this.config.popularityBoost.weight
      });
    }

    // Quality score boost
    if (this.config.qualityBoost?.enabled) {
      functions.push({
        field_value_factor: {
          field: this.config.qualityBoost.field,
          modifier: 'sqrt',
          factor: this.config.qualityBoost.factor,
          missing: 0
        },
        weight: this.config.qualityBoost.weight
      });
    }

    return functions;
  }
}

interface RelevanceScoringConfig {
  defaultFields: string[];
  fieldBoosts: Record<string, number>;
  recencyBoost?: {
    enabled: boolean;
    field: string;
    scale: string;
    decay: number;
    weight: number;
  };
  popularityBoost?: {
    enabled: boolean;
    field: string;
    factor: number;
    weight: number;
  };
  qualityBoost?: {
    enabled: boolean;
    field: string;
    factor: number;
    weight: number;
  };
}
```


### Search Execution

```typescript
// Search Execution Implementation
class SearchExecutor {
  private client: SearchClient;
  private indexName: string;
  private queryProcessor: QueryProcessor;
  private relevanceScorer: RelevanceScorer;
  private cacheManager: SearchCacheManager;

  async search(query: SearchQuery): Promise<SearchResult> {
    // Check cache first
    const cacheKey = this.generateCacheKey(query);
    const cachedResult = await this.cacheManager.get(cacheKey);
    if (cachedResult) {
      return cachedResult;
    }

    // Process query
    const processedQuery = await this.queryProcessor.processQuery(query.query);

    // Build search request
    const searchRequest = this.buildSearchRequest(query, processedQuery);

    // Execute search
    const startTime = Date.now();
    const response = await this.client.search({
      index: this.indexName,
      body: searchRequest
    });
    const took = Date.now() - startTime;

    // Process results
    const result = this.processSearchResponse(response, processedQuery, took);

    // Cache result
    await this.cacheManager.set(cacheKey, result, this.getCacheTTL(query));

    return result;
  }

  private buildSearchRequest(query: SearchQuery, processedQuery: ProcessedQuery): SearchRequest {
    const request: SearchRequest = {
      query: this.relevanceScorer.buildScoringQuery(processedQuery, {
        fields: query.fields,
        enableFuzzy: true
      }),
      from: ((query.pagination?.page || 1) - 1) * (query.pagination?.limit || 20),
      size: query.pagination?.limit || 20,
      track_total_hits: true
    };

    // Add filters
    if (query.filters && Object.keys(query.filters).length > 0) {
      request.query = {
        bool: {
          must: [request.query],
          filter: this.buildFilters(query.filters)
        }
      };
    }

    // Add sorting
    if (query.sort && query.sort.length > 0) {
      request.sort = query.sort.map(s => ({
        [s.field]: { order: s.order }
      }));
    }

    // Add highlighting
    if (query.highlight) {
      request.highlight = {
        fields: query.highlight.fields.reduce((acc, field) => {
          acc[field] = {
            fragment_size: query.highlight.fragmentSize || 150,
            number_of_fragments: query.highlight.numberOfFragments || 3,
            pre_tags: ['<mark>'],
            post_tags: ['</mark>']
          };
          return acc;
        }, {}),
        require_field_match: false
      };
    }

    // Add aggregations
    if (query.aggregations && query.aggregations.length > 0) {
      request.aggs = this.buildAggregations(query.aggregations);
    }

    // Add explain for debugging
    if (query.explain) {
      request.explain = true;
    }

    return request;
  }

  private buildFilters(filters: Record<string, any>): FilterClause[] {
    const filterClauses: FilterClause[] = [];

    for (const [field, value] of Object.entries(filters)) {
      if (Array.isArray(value)) {
        filterClauses.push({ terms: { [field]: value } });
      } else if (typeof value === 'object' && (value.min !== undefined || value.max !== undefined)) {
        const rangeFilter: RangeFilter = { range: { [field]: {} } };
        if (value.min !== undefined) rangeFilter.range[field].gte = value.min;
        if (value.max !== undefined) rangeFilter.range[field].lte = value.max;
        filterClauses.push(rangeFilter);
      } else {
        filterClauses.push({ term: { [field]: value } });
      }
    }

    return filterClauses;
  }

  private buildAggregations(aggregations: AggregationOptions[]): Record<string, any> {
    const aggs: Record<string, any> = {};

    for (const agg of aggregations) {
      switch (agg.type) {
        case 'terms':
          aggs[agg.name] = {
            terms: {
              field: agg.field,
              size: agg.size || 10,
              order: { _count: 'desc' }
            }
          };
          break;
        case 'range':
          aggs[agg.name] = {
            range: {
              field: agg.field,
              ranges: agg.ranges
            }
          };
          break;
        case 'histogram':
          aggs[agg.name] = {
            histogram: {
              field: agg.field,
              interval: agg.interval
            }
          };
          break;
        case 'date_histogram':
          aggs[agg.name] = {
            date_histogram: {
              field: agg.field,
              calendar_interval: agg.interval
            }
          };
          break;
      }
    }

    return aggs;
  }

  private processSearchResponse(
    response: SearchResponse,
    processedQuery: ProcessedQuery,
    took: number
  ): SearchResult {
    const hits: SearchHit[] = response.hits.hits.map(hit => ({
      id: hit._id,
      score: hit._score,
      source: hit._source,
      highlights: hit.highlight,
      explanation: hit._explanation
    }));

    const result: SearchResult = {
      hits,
      total: typeof response.hits.total === 'number' 
        ? response.hits.total 
        : response.hits.total.value,
      maxScore: response.hits.max_score || 0,
      took
    };

    // Add aggregation results
    if (response.aggregations) {
      result.aggregations = this.processAggregations(response.aggregations);
    }

    // Add spelling suggestions if query had issues
    if (processedQuery.spellingSuggestions.length > 0 && hits.length < 5) {
      result.didYouMean = this.buildDidYouMean(processedQuery);
    }

    return result;
  }
}
```

### Autocomplete System

```typescript
// Autocomplete Implementation
class AutocompleteService {
  private client: SearchClient;
  private indexName: string;
  private suggestionIndex: string;

  async getSuggestions(prefix: string, options: AutocompleteOptions = {}): Promise<Suggestion[]> {
    const suggestions: Suggestion[] = [];

    // Get completion suggestions
    const completions = await this.getCompletionSuggestions(prefix, options);
    suggestions.push(...completions);

    // Get phrase suggestions
    const phrases = await this.getPhraseSuggestions(prefix, options);
    suggestions.push(...phrases);

    // Get popular query suggestions
    const popularQueries = await this.getPopularQuerySuggestions(prefix, options);
    suggestions.push(...popularQueries);

    // Deduplicate and rank
    return this.rankSuggestions(suggestions, options.limit || 10);
  }

  private async getCompletionSuggestions(
    prefix: string,
    options: AutocompleteOptions
  ): Promise<Suggestion[]> {
    const response = await this.client.search({
      index: this.indexName,
      body: {
        suggest: {
          text: prefix,
          completion: {
            field: 'title.autocomplete',
            size: options.limit || 10,
            skip_duplicates: true,
            fuzzy: {
              fuzziness: 'AUTO',
              prefix_length: 2
            }
          }
        }
      }
    });

    return response.suggest.completion[0].options.map(opt => ({
      text: opt.text,
      type: 'completion',
      score: opt._score,
      source: opt._source
    }));
  }

  private async getPhraseSuggestions(
    prefix: string,
    options: AutocompleteOptions
  ): Promise<Suggestion[]> {
    const response = await this.client.search({
      index: this.indexName,
      body: {
        query: {
          match_phrase_prefix: {
            title: {
              query: prefix,
              max_expansions: 50
            }
          }
        },
        size: options.limit || 10,
        _source: ['title', 'id']
      }
    });

    return response.hits.hits.map(hit => ({
      text: hit._source.title,
      type: 'phrase',
      score: hit._score,
      source: hit._source
    }));
  }

  private async getPopularQuerySuggestions(
    prefix: string,
    options: AutocompleteOptions
  ): Promise<Suggestion[]> {
    const response = await this.client.search({
      index: this.suggestionIndex,
      body: {
        query: {
          bool: {
            must: [
              { prefix: { query: prefix.toLowerCase() } }
            ],
            filter: [
              { range: { searchCount: { gte: options.minSearchCount || 10 } } }
            ]
          }
        },
        sort: [{ searchCount: 'desc' }],
        size: options.limit || 10
      }
    });

    return response.hits.hits.map(hit => ({
      text: hit._source.query,
      type: 'popular',
      score: hit._source.searchCount,
      metadata: { searchCount: hit._source.searchCount }
    }));
  }

  private rankSuggestions(suggestions: Suggestion[], limit: number): Suggestion[] {
    // Score suggestions based on type and relevance
    const scored = suggestions.map(s => ({
      ...s,
      finalScore: this.calculateSuggestionScore(s)
    }));

    // Sort by final score and deduplicate
    const seen = new Set<string>();
    return scored
      .sort((a, b) => b.finalScore - a.finalScore)
      .filter(s => {
        const normalized = s.text.toLowerCase();
        if (seen.has(normalized)) return false;
        seen.add(normalized);
        return true;
      })
      .slice(0, limit);
  }

  private calculateSuggestionScore(suggestion: Suggestion): number {
    let score = suggestion.score;

    // Boost by type
    switch (suggestion.type) {
      case 'popular':
        score *= 1.5;
        break;
      case 'completion':
        score *= 1.2;
        break;
      case 'phrase':
        score *= 1.0;
        break;
    }

    return score;
  }
}
```

## Configuration

### Search Engine Configuration

```yaml
# search-config.yml
search_engine:
  provider: elasticsearch
  nodes:
    - http://localhost:9200
  
  index:
    name: content
    settings:
      number_of_shards: 3
      number_of_replicas: 1
      refresh_interval: "1s"
      max_result_window: 10000
  
  query:
    default_operator: AND
    minimum_should_match: "75%"
    fuzziness: AUTO
    prefix_length: 2
    max_expansions: 50
  
  relevance:
    field_boosts:
      title: 3.0
      description: 2.0
      content: 1.0
      tags: 2.0
    recency_boost:
      enabled: true
      field: publishedAt
      scale: "30d"
      decay: 0.5
      weight: 1.2
    popularity_boost:
      enabled: true
      field: viewCount
      factor: 0.1
      weight: 1.1
  
  autocomplete:
    enabled: true
    min_prefix_length: 2
    max_suggestions: 10
    fuzzy_enabled: true
  
  cache:
    enabled: true
    ttl_seconds: 300
    max_size_mb: 100
  
  performance:
    timeout_ms: 5000
    max_concurrent_searches: 100
```

## Integration Points

### Search Engine Providers

```typescript
// Elasticsearch Integration
class ElasticsearchProvider implements SearchProvider {
  private client: Client;

  constructor(config: ElasticsearchConfig) {
    this.client = new Client({
      nodes: config.nodes,
      auth: config.auth,
      tls: config.tls
    });
  }

  async search(request: SearchRequest): Promise<SearchResponse> {
    return this.client.search(request);
  }

  async index(document: IndexDocument): Promise<IndexResult> {
    return this.client.index(document);
  }
}

// OpenSearch Integration
class OpenSearchProvider implements SearchProvider {
  private client: OpenSearchClient;

  constructor(config: OpenSearchConfig) {
    this.client = new OpenSearchClient({
      node: config.endpoint,
      auth: config.auth
    });
  }
}

// Algolia Integration
class AlgoliaProvider implements SearchProvider {
  private client: SearchClient;
  private index: SearchIndex;

  constructor(config: AlgoliaConfig) {
    this.client = algoliasearch(config.appId, config.apiKey);
    this.index = this.client.initIndex(config.indexName);
  }
}
```

## Security Considerations

### Query Sanitization

```typescript
class QuerySanitizer {
  sanitize(query: string): string {
    // Remove potentially dangerous characters
    let sanitized = query.replace(/[<>{}[\]\\]/g, '');
    
    // Limit query length
    sanitized = sanitized.substring(0, 500);
    
    // Escape special search characters
    sanitized = this.escapeSpecialChars(sanitized);
    
    return sanitized;
  }

  private escapeSpecialChars(query: string): string {
    const specialChars = /[+\-=&|!(){}[\]^"~*?:\\/]/g;
    return query.replace(specialChars, '\\$&');
  }
}
```

### Access Control

```typescript
class SearchAccessControl {
  async filterResults(
    results: SearchHit[],
    userId: string
  ): Promise<SearchHit[]> {
    const userPermissions = await this.getUserPermissions(userId);
    
    return results.filter(hit => {
      const requiredPermissions = hit.source.requiredPermissions || [];
      return requiredPermissions.every(p => userPermissions.includes(p));
    });
  }

  buildSecurityFilter(userId: string): FilterClause {
    return {
      bool: {
        should: [
          { term: { visibility: 'public' } },
          { term: { ownerId: userId } },
          { terms: { sharedWith: [userId] } }
        ],
        minimum_should_match: 1
      }
    };
  }
}
```

## Testing Considerations

### Search Quality Testing

```typescript
describe('Full-Text Search', () => {
  it('should return relevant results for keyword queries', async () => {
    const result = await searchEngine.search({
      query: 'machine learning',
      limit: 10
    });

    expect(result.hits.length).toBeGreaterThan(0);
    expect(result.hits[0].score).toBeGreaterThan(0);
  });

  it('should handle fuzzy matching for typos', async () => {
    const result = await searchEngine.search({
      query: 'machne lerning', // Intentional typos
      limit: 10
    });

    expect(result.hits.length).toBeGreaterThan(0);
  });

  it('should apply field boosting correctly', async () => {
    const titleMatch = await searchEngine.search({
      query: 'exact title match',
      limit: 1
    });

    const descriptionMatch = await searchEngine.search({
      query: 'description only match',
      limit: 1
    });

    // Title matches should score higher
    expect(titleMatch.hits[0].score).toBeGreaterThan(descriptionMatch.hits[0].score);
  });

  it('should filter results correctly', async () => {
    const result = await searchEngine.search({
      query: 'test',
      filters: { category: 'technology', status: 'published' },
      limit: 10
    });

    result.hits.forEach(hit => {
      expect(hit.source.category).toBe('technology');
      expect(hit.source.status).toBe('published');
    });
  });
});
```
