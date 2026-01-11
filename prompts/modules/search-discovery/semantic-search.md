# Semantic Search Template

## Purpose

This template provides comprehensive patterns for implementing AI-powered semantic search systems that understand natural language queries, user intent, and contextual meaning. It covers embedding generation, vector search, natural language processing, and intelligent query understanding.

## Context

Semantic search goes beyond keyword matching to understand the meaning and intent behind user queries. Users expect search systems to understand natural language, handle synonyms, and return contextually relevant results even when exact keywords don't match. This template addresses the complexity of building AI-powered search systems that leverage embeddings, vector databases, and language models.

## Instructions

1. **Setup Embedding Infrastructure**: Configure embedding models and vector storage
2. **Implement Query Understanding**: Build natural language processing for queries
3. **Configure Vector Search**: Set up similarity search with embeddings
4. **Add Intent Detection**: Implement query intent classification
5. **Build Hybrid Search**: Combine semantic and keyword search
6. **Optimize Relevance**: Fine-tune semantic matching and ranking
7. **Monitor Quality**: Track semantic search performance metrics

## Examples

### Example 1: Semantic Search Setup
```typescript
interface SemanticSearchEngine {
  search(query: string, options?: SemanticSearchOptions): Promise<SemanticSearchResult>;
  generateEmbedding(text: string): Promise<number[]>;
  findSimilar(embedding: number[], limit: number): Promise<SimilarItem[]>;
}

const result = await semanticSearch.search(
  'comfortable shoes for running long distances',
  { includeExplanation: true }
);
// Returns results matching intent, not just keywords
```

### Example 2: Intent Detection
```typescript
const intent = await semanticSearch.detectIntent('show me something like this but cheaper');
// Returns: { type: 'similar_item', modifiers: ['lower_price'], confidence: 0.92 }
```

### Example 3: Hybrid Search
```typescript
const hybridResult = await semanticSearch.hybridSearch({
  query: 'wireless noise cancelling headphones',
  semanticWeight: 0.7,
  keywordWeight: 0.3,
  filters: { category: 'electronics' }
});
```

## Variables

| Variable | Description | Type | Required | Default |
|----------|-------------|------|----------|---------|
| embeddingModel | Embedding model provider | string | Yes | N/A |
| vectorDatabase | Vector storage backend | string | Yes | N/A |
| embeddingDimensions | Embedding vector dimensions | number | No | 384 |
| similarityMetric | Distance metric for similarity | string | No | "cosine" |
| enableIntentDetection | Enable query intent detection | boolean | No | true |
| enableHybridSearch | Enable hybrid semantic+keyword | boolean | No | true |
| semanticWeight | Weight for semantic matching | number | No | 0.7 |
| maxResults | Maximum results to return | number | No | 50 |

## Expected Output

This template will produce:
- **Embedding Generation**: Text-to-vector conversion pipeline
- **Vector Search**: Similarity-based content retrieval
- **Intent Detection**: Query intent classification system
- **Query Understanding**: Natural language query processing
- **Hybrid Search**: Combined semantic and keyword search
- **Contextual Ranking**: Context-aware result ranking
- **Explanation System**: Search result explanations
- **Performance Optimization**: Embedding caching and indexing

## Implementation Patterns

### Semantic Search Architecture

```typescript
// Core Semantic Search Architecture
interface SemanticSearchSystem {
  embeddingService: EmbeddingService;
  vectorStore: VectorStore;
  intentDetector: IntentDetector;
  queryProcessor: SemanticQueryProcessor;
  hybridSearcher: HybridSearchEngine;
  explanationGenerator: ExplanationGenerator;
}

interface SemanticSearchQuery {
  query: string;
  context?: SearchContext;
  filters?: Record<string, any>;
  options?: SemanticSearchOptions;
}

interface SemanticSearchOptions {
  semanticWeight?: number;
  keywordWeight?: number;
  includeExplanation?: boolean;
  maxResults?: number;
  minSimilarity?: number;
  rerank?: boolean;
}

interface SemanticSearchResult {
  items: SemanticSearchHit[];
  total: number;
  queryUnderstanding: QueryUnderstanding;
  explanation?: SearchExplanation;
  took: number;
}

interface SemanticSearchHit {
  id: string;
  score: number;
  semanticScore: number;
  keywordScore?: number;
  content: Record<string, any>;
  explanation?: HitExplanation;
  matchedConcepts?: string[];
}

interface QueryUnderstanding {
  originalQuery: string;
  normalizedQuery: string;
  intent: QueryIntent;
  entities: ExtractedEntity[];
  concepts: string[];
  embedding: number[];
}

interface QueryIntent {
  type: IntentType;
  confidence: number;
  modifiers: IntentModifier[];
}

enum IntentType {
  SEARCH = 'search',
  NAVIGATE = 'navigate',
  COMPARE = 'compare',
  SIMILAR = 'similar',
  QUESTION = 'question',
  FILTER = 'filter'
}

interface IntentModifier {
  type: string;
  value: string;
  confidence: number;
}
```

### Embedding Service

```typescript
// Embedding Service Implementation
class EmbeddingService {
  private model: EmbeddingModel;
  private cache: EmbeddingCache;
  private config: EmbeddingConfig;

  async generateEmbedding(text: string): Promise<number[]> {
    // Check cache first
    const cacheKey = this.generateCacheKey(text);
    const cached = await this.cache.get(cacheKey);
    if (cached) {
      return cached;
    }

    // Preprocess text
    const processedText = this.preprocessText(text);

    // Generate embedding
    const embedding = await this.model.encode(processedText);

    // Normalize embedding
    const normalizedEmbedding = this.normalizeEmbedding(embedding);

    // Cache result
    await this.cache.set(cacheKey, normalizedEmbedding, this.config.cacheTtl);

    return normalizedEmbedding;
  }

  async generateBatchEmbeddings(texts: string[]): Promise<number[][]> {
    // Check cache for each text
    const results: (number[] | null)[] = await Promise.all(
      texts.map(text => this.cache.get(this.generateCacheKey(text)))
    );

    // Find texts that need embedding
    const uncachedIndices: number[] = [];
    const uncachedTexts: string[] = [];

    results.forEach((result, index) => {
      if (!result) {
        uncachedIndices.push(index);
        uncachedTexts.push(this.preprocessText(texts[index]));
      }
    });

    // Generate embeddings for uncached texts
    if (uncachedTexts.length > 0) {
      const newEmbeddings = await this.model.encodeBatch(uncachedTexts);

      // Cache and fill in results
      for (let i = 0; i < uncachedIndices.length; i++) {
        const normalized = this.normalizeEmbedding(newEmbeddings[i]);
        results[uncachedIndices[i]] = normalized;
        await this.cache.set(
          this.generateCacheKey(texts[uncachedIndices[i]]),
          normalized,
          this.config.cacheTtl
        );
      }
    }

    return results as number[][];
  }

  private preprocessText(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/\s+/g, ' ')
      .substring(0, this.config.maxTextLength);
  }

  private normalizeEmbedding(embedding: number[]): number[] {
    const magnitude = Math.sqrt(
      embedding.reduce((sum, val) => sum + val * val, 0)
    );
    return embedding.map(val => val / magnitude);
  }
}

// Embedding Model Implementations
class OpenAIEmbeddingModel implements EmbeddingModel {
  private client: OpenAI;
  private modelName: string;

  async encode(text: string): Promise<number[]> {
    const response = await this.client.embeddings.create({
      model: this.modelName,
      input: text
    });
    return response.data[0].embedding;
  }

  async encodeBatch(texts: string[]): Promise<number[][]> {
    const response = await this.client.embeddings.create({
      model: this.modelName,
      input: texts
    });
    return response.data.map(d => d.embedding);
  }
}

class SentenceTransformerModel implements EmbeddingModel {
  private model: any; // HuggingFace model

  async encode(text: string): Promise<number[]> {
    const output = await this.model.encode(text);
    return Array.from(output);
  }

  async encodeBatch(texts: string[]): Promise<number[][]> {
    const outputs = await this.model.encode(texts);
    return outputs.map(o => Array.from(o));
  }
}
```

### Vector Store

```typescript
// Vector Store Implementation
class VectorStore {
  private client: VectorDatabaseClient;
  private collectionName: string;
  private config: VectorStoreConfig;

  async search(
    queryEmbedding: number[],
    options: VectorSearchOptions
  ): Promise<VectorSearchResult[]> {
    const searchParams = {
      vector: queryEmbedding,
      topK: options.limit || 50,
      filter: options.filter,
      includeMetadata: true,
      includeVectors: options.includeVectors || false
    };

    const results = await this.client.query(this.collectionName, searchParams);

    return results.matches.map(match => ({
      id: match.id,
      score: match.score,
      metadata: match.metadata,
      vector: match.vector
    }));
  }

  async upsert(items: VectorItem[]): Promise<void> {
    const vectors = items.map(item => ({
      id: item.id,
      values: item.embedding,
      metadata: item.metadata
    }));

    await this.client.upsert(this.collectionName, vectors);
  }

  async delete(ids: string[]): Promise<void> {
    await this.client.delete(this.collectionName, ids);
  }

  async createIndex(config: IndexConfig): Promise<void> {
    await this.client.createIndex(this.collectionName, {
      dimension: config.dimensions,
      metric: config.metric,
      pods: config.pods,
      replicas: config.replicas
    });
  }
}

// Vector Database Implementations
class PineconeVectorStore extends VectorStore {
  private pinecone: Pinecone;

  async search(queryEmbedding: number[], options: VectorSearchOptions): Promise<VectorSearchResult[]> {
    const index = this.pinecone.index(this.collectionName);

    const queryResponse = await index.query({
      vector: queryEmbedding,
      topK: options.limit || 50,
      filter: options.filter,
      includeMetadata: true
    });

    return queryResponse.matches.map(match => ({
      id: match.id,
      score: match.score,
      metadata: match.metadata
    }));
  }
}

class WeaviateVectorStore extends VectorStore {
  private weaviate: WeaviateClient;

  async search(queryEmbedding: number[], options: VectorSearchOptions): Promise<VectorSearchResult[]> {
    const result = await this.weaviate.graphql
      .get()
      .withClassName(this.collectionName)
      .withNearVector({ vector: queryEmbedding })
      .withLimit(options.limit || 50)
      .withFields('_additional { id distance }')
      .do();

    return result.data.Get[this.collectionName].map(item => ({
      id: item._additional.id,
      score: 1 - item._additional.distance,
      metadata: item
    }));
  }
}
```

### Intent Detection

```typescript
// Intent Detection Implementation
class IntentDetector {
  private classifier: IntentClassifier;
  private entityExtractor: EntityExtractor;
  private modifierDetector: ModifierDetector;

  async detectIntent(query: string): Promise<QueryIntent> {
    // Classify primary intent
    const intentClassification = await this.classifier.classify(query);

    // Extract modifiers
    const modifiers = await this.modifierDetector.detect(query);

    // Combine results
    return {
      type: intentClassification.intent,
      confidence: intentClassification.confidence,
      modifiers
    };
  }

  async extractEntities(query: string): Promise<ExtractedEntity[]> {
    return this.entityExtractor.extract(query);
  }

  async understandQuery(query: string): Promise<QueryUnderstanding> {
    const [intent, entities, concepts] = await Promise.all([
      this.detectIntent(query),
      this.extractEntities(query),
      this.extractConcepts(query)
    ]);

    return {
      originalQuery: query,
      normalizedQuery: this.normalizeQuery(query),
      intent,
      entities,
      concepts,
      embedding: [] // Will be filled by embedding service
    };
  }

  private async extractConcepts(query: string): Promise<string[]> {
    // Extract semantic concepts from query
    const concepts: string[] = [];

    // Use NLP to identify key concepts
    const tokens = this.tokenize(query);
    const nounPhrases = this.extractNounPhrases(tokens);

    for (const phrase of nounPhrases) {
      const concept = await this.mapToConcept(phrase);
      if (concept) {
        concepts.push(concept);
      }
    }

    return concepts;
  }
}

class IntentClassifier {
  private model: ClassificationModel;
  private intents: IntentType[];

  async classify(query: string): Promise<IntentClassification> {
    const predictions = await this.model.predict(query);

    // Find highest confidence intent
    let maxConfidence = 0;
    let predictedIntent = IntentType.SEARCH;

    for (const [intent, confidence] of Object.entries(predictions)) {
      if (confidence > maxConfidence) {
        maxConfidence = confidence;
        predictedIntent = intent as IntentType;
      }
    }

    return {
      intent: predictedIntent,
      confidence: maxConfidence,
      allPredictions: predictions
    };
  }
}

class ModifierDetector {
  private patterns: ModifierPattern[];

  async detect(query: string): Promise<IntentModifier[]> {
    const modifiers: IntentModifier[] = [];
    const queryLower = query.toLowerCase();

    // Check for price modifiers
    if (queryLower.includes('cheap') || queryLower.includes('budget') || queryLower.includes('affordable')) {
      modifiers.push({ type: 'price', value: 'low', confidence: 0.9 });
    } else if (queryLower.includes('premium') || queryLower.includes('luxury') || queryLower.includes('high-end')) {
      modifiers.push({ type: 'price', value: 'high', confidence: 0.9 });
    }

    // Check for comparison modifiers
    if (queryLower.includes('similar') || queryLower.includes('like this') || queryLower.includes('alternatives')) {
      modifiers.push({ type: 'comparison', value: 'similar', confidence: 0.85 });
    }

    // Check for recency modifiers
    if (queryLower.includes('new') || queryLower.includes('latest') || queryLower.includes('recent')) {
      modifiers.push({ type: 'recency', value: 'new', confidence: 0.85 });
    }

    // Check for quality modifiers
    if (queryLower.includes('best') || queryLower.includes('top rated') || queryLower.includes('highly rated')) {
      modifiers.push({ type: 'quality', value: 'high', confidence: 0.85 });
    }

    return modifiers;
  }
}
```


### Hybrid Search Engine

```typescript
// Hybrid Search Implementation
class HybridSearchEngine {
  private semanticSearcher: SemanticSearcher;
  private keywordSearcher: KeywordSearcher;
  private resultMerger: ResultMerger;
  private reranker: Reranker;

  async search(query: SemanticSearchQuery): Promise<SemanticSearchResult> {
    const options = query.options || {};
    const semanticWeight = options.semanticWeight || 0.7;
    const keywordWeight = options.keywordWeight || 0.3;

    // Execute both searches in parallel
    const [semanticResults, keywordResults] = await Promise.all([
      this.semanticSearcher.search(query),
      this.keywordSearcher.search(query)
    ]);

    // Merge results with weighted scoring
    const mergedResults = this.resultMerger.merge(
      semanticResults,
      keywordResults,
      { semanticWeight, keywordWeight }
    );

    // Optionally rerank results
    const finalResults = options.rerank
      ? await this.reranker.rerank(mergedResults, query.query)
      : mergedResults;

    return {
      items: finalResults,
      total: finalResults.length,
      queryUnderstanding: semanticResults.queryUnderstanding,
      took: Date.now() - query.timestamp
    };
  }
}

class ResultMerger {
  merge(
    semanticResults: SemanticSearchHit[],
    keywordResults: SearchHit[],
    weights: { semanticWeight: number; keywordWeight: number }
  ): SemanticSearchHit[] {
    const mergedMap = new Map<string, SemanticSearchHit>();

    // Add semantic results
    for (const result of semanticResults) {
      mergedMap.set(result.id, {
        ...result,
        semanticScore: result.score,
        score: result.score * weights.semanticWeight
      });
    }

    // Merge keyword results
    for (const result of keywordResults) {
      const existing = mergedMap.get(result.id);
      if (existing) {
        existing.keywordScore = result.score;
        existing.score += result.score * weights.keywordWeight;
      } else {
        mergedMap.set(result.id, {
          id: result.id,
          score: result.score * weights.keywordWeight,
          semanticScore: 0,
          keywordScore: result.score,
          content: result.source
        });
      }
    }

    // Sort by combined score
    return Array.from(mergedMap.values())
      .sort((a, b) => b.score - a.score);
  }
}

class Reranker {
  private model: RerankerModel;

  async rerank(results: SemanticSearchHit[], query: string): Promise<SemanticSearchHit[]> {
    if (results.length === 0) return results;

    // Prepare pairs for reranking
    const pairs = results.map(result => ({
      query,
      document: this.extractText(result.content)
    }));

    // Get reranking scores
    const scores = await this.model.score(pairs);

    // Apply reranking scores
    const reranked = results.map((result, index) => ({
      ...result,
      rerankScore: scores[index],
      score: result.score * 0.3 + scores[index] * 0.7
    }));

    return reranked.sort((a, b) => b.score - a.score);
  }

  private extractText(content: Record<string, any>): string {
    const textFields = ['title', 'description', 'content', 'name'];
    const texts: string[] = [];

    for (const field of textFields) {
      if (content[field]) {
        texts.push(String(content[field]));
      }
    }

    return texts.join(' ');
  }
}
```

### Explanation Generator

```typescript
// Explanation Generator Implementation
class ExplanationGenerator {
  async generateExplanation(
    query: QueryUnderstanding,
    results: SemanticSearchHit[]
  ): Promise<SearchExplanation> {
    const queryExplanation = this.explainQuery(query);
    const resultExplanations = results.slice(0, 10).map(result =>
      this.explainResult(query, result)
    );

    return {
      query: queryExplanation,
      results: resultExplanations,
      summary: this.generateSummary(query, results)
    };
  }

  private explainQuery(query: QueryUnderstanding): QueryExplanation {
    return {
      originalQuery: query.originalQuery,
      interpretedAs: this.generateInterpretation(query),
      detectedIntent: query.intent.type,
      intentConfidence: query.intent.confidence,
      extractedConcepts: query.concepts,
      appliedModifiers: query.intent.modifiers.map(m => `${m.type}: ${m.value}`)
    };
  }

  private explainResult(query: QueryUnderstanding, result: SemanticSearchHit): HitExplanation {
    const matchReasons: string[] = [];

    // Explain semantic match
    if (result.semanticScore > 0.7) {
      matchReasons.push('Strong semantic similarity to your query');
    } else if (result.semanticScore > 0.5) {
      matchReasons.push('Moderate semantic similarity to your query');
    }

    // Explain keyword match
    if (result.keywordScore && result.keywordScore > 0.5) {
      matchReasons.push('Contains keywords from your search');
    }

    // Explain concept matches
    if (result.matchedConcepts && result.matchedConcepts.length > 0) {
      matchReasons.push(`Matches concepts: ${result.matchedConcepts.join(', ')}`);
    }

    return {
      id: result.id,
      score: result.score,
      matchReasons,
      semanticSimilarity: result.semanticScore,
      keywordRelevance: result.keywordScore
    };
  }

  private generateInterpretation(query: QueryUnderstanding): string {
    let interpretation = `Looking for "${query.normalizedQuery}"`;

    if (query.concepts.length > 0) {
      interpretation += ` related to ${query.concepts.join(', ')}`;
    }

    if (query.intent.modifiers.length > 0) {
      const modifierDescriptions = query.intent.modifiers.map(m => {
        switch (m.type) {
          case 'price': return m.value === 'low' ? 'budget-friendly' : 'premium';
          case 'recency': return 'recently added';
          case 'quality': return 'highly rated';
          default: return m.value;
        }
      });
      interpretation += ` (${modifierDescriptions.join(', ')})`;
    }

    return interpretation;
  }
}
```

## Configuration

### Semantic Search Configuration

```yaml
# semantic-search-config.yml
semantic_search:
  embedding:
    provider: openai
    model: text-embedding-3-small
    dimensions: 1536
    max_text_length: 8192
    batch_size: 100
    cache:
      enabled: true
      ttl_seconds: 86400
      max_size_mb: 500

  vector_store:
    provider: pinecone
    index_name: content-embeddings
    metric: cosine
    pods: 1
    replicas: 1

  intent_detection:
    enabled: true
    model: custom-intent-classifier
    confidence_threshold: 0.7

  hybrid_search:
    enabled: true
    semantic_weight: 0.7
    keyword_weight: 0.3
    reranking:
      enabled: true
      model: cross-encoder

  query_processing:
    max_query_length: 500
    enable_spell_correction: true
    enable_query_expansion: true

  performance:
    max_results: 100
    timeout_ms: 5000
    cache_results: true
    cache_ttl_seconds: 300
```

## Integration Points

### Embedding Model Providers

```typescript
// OpenAI Integration
class OpenAIEmbeddings implements EmbeddingProvider {
  async embed(texts: string[]): Promise<number[][]> {
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: texts
    });
    return response.data.map(d => d.embedding);
  }
}

// Cohere Integration
class CohereEmbeddings implements EmbeddingProvider {
  async embed(texts: string[]): Promise<number[][]> {
    const response = await cohere.embed({
      texts,
      model: 'embed-english-v3.0',
      inputType: 'search_query'
    });
    return response.embeddings;
  }
}

// HuggingFace Integration
class HuggingFaceEmbeddings implements EmbeddingProvider {
  async embed(texts: string[]): Promise<number[][]> {
    const response = await hf.featureExtraction({
      model: 'sentence-transformers/all-MiniLM-L6-v2',
      inputs: texts
    });
    return response;
  }
}
```

## Security Considerations

### Query Sanitization

```typescript
class SemanticQuerySanitizer {
  sanitize(query: string): string {
    // Remove potentially harmful content
    let sanitized = query.replace(/<[^>]*>/g, '');

    // Limit query length
    sanitized = sanitized.substring(0, 500);

    // Remove excessive whitespace
    sanitized = sanitized.replace(/\s+/g, ' ').trim();

    return sanitized;
  }

  validateQuery(query: string): ValidationResult {
    const errors: string[] = [];

    if (query.length < 2) {
      errors.push('Query too short');
    }

    if (query.length > 500) {
      errors.push('Query too long');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}
```

## Testing Considerations

### Semantic Search Testing

```typescript
describe('Semantic Search', () => {
  it('should return semantically similar results', async () => {
    const result = await semanticSearch.search('comfortable running shoes');

    expect(result.items.length).toBeGreaterThan(0);
    // Results should include items about athletic footwear
    const hasRelevantResults = result.items.some(item =>
      item.content.category?.includes('shoes') ||
      item.content.category?.includes('footwear')
    );
    expect(hasRelevantResults).toBe(true);
  });

  it('should detect query intent correctly', async () => {
    const intent = await semanticSearch.detectIntent('show me something similar but cheaper');

    expect(intent.type).toBe(IntentType.SIMILAR);
    expect(intent.modifiers).toContainEqual(
      expect.objectContaining({ type: 'price', value: 'low' })
    );
  });

  it('should combine semantic and keyword search effectively', async () => {
    const hybridResult = await semanticSearch.hybridSearch({
      query: 'wireless bluetooth headphones',
      semanticWeight: 0.7,
      keywordWeight: 0.3
    });

    // Results should have both semantic and keyword scores
    expect(hybridResult.items[0].semanticScore).toBeGreaterThan(0);
    expect(hybridResult.items[0].keywordScore).toBeDefined();
  });

  it('should generate meaningful explanations', async () => {
    const result = await semanticSearch.search('laptop for programming', {
      includeExplanation: true
    });

    expect(result.explanation).toBeDefined();
    expect(result.explanation.query.interpretedAs).toContain('laptop');
  });
});
```
