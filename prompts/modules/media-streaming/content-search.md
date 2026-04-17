# Content Search Template

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
This template provides comprehensive patterns for implementing advanced search capabilities in media streaming applications, including full-text search, voice search, visual search, and semantic search powered by AI. It covers search indexing, query processing, result ranking, and multi-modal search experiences.

## Context
Search is a critical feature for content discovery in media streaming platforms. Modern search systems go beyond keyword matching to include voice commands, image recognition, and semantic understanding. This template addresses the complexity of building multi-modal search systems that understand user intent, handle natural language queries, and deliver relevant results across millions of content items.

## Instructions

1. **Setup Search Infrastructure**: Configure search engines and indexing systems
2. **Implement Text Search**: Build full-text search with fuzzy matching and autocomplete
3. **Add Voice Search**: Integrate speech-to-text and natural language processing
4. **Enable Visual Search**: Implement image recognition and visual similarity matching
5. **Configure Semantic Search**: Set up AI-powered contextual and meaning-based search
6. **Optimize Search Ranking**: Implement relevance scoring and personalized results
7. **Add Search Analytics**: Track search performance and user behavior metrics

## Examples

### Example 1: Multi-Modal Search System
```typescript
interface SearchSystem {
  textSearch(query: string, filters?: SearchFilters): Promise<SearchResults>;
  voiceSearch(audioData: ArrayBuffer): Promise<SearchResults>;
  visualSearch(imageData: ImageData): Promise<SearchResults>;
}

const searchSystem = new SearchSystem();
const results = await searchSystem.textSearch('jazz piano', {
  contentTypes: ['music'],
  genres: ['jazz'],
  dateRange: { start: '2020-01-01', end: '2024-01-01' }
});
```

### Example 2: Voice Search Integration
```typescript
const voiceSearchResults = await searchSystem.voiceSearch(audioBuffer);
// Automatically converts speech to text and processes search
// Returns: { query: "play some relaxing music", results: [...] }
```

### Example 3: Semantic Search with AI
```typescript
const semanticResults = await searchSystem.semanticSearch(
  "songs that make me feel nostalgic",
  { userId: "user-123", includePersonalization: true }
);
// Returns contextually relevant results based on meaning, not just keywords
```

## Variables

| Variable | Description | Type | Required | Default |
|----------|-------------|------|----------|---------|
| searchEngine | Primary search engine provider | string | Yes | N/A |
| indexingStrategy | Content indexing approach | string | No | "real-time" |
| enableVoiceSearch | Enable voice search capabilities | boolean | No | false |
| enableVisualSearch | Enable visual search features | boolean | No | false |
| enableSemanticSearch | Enable AI-powered semantic search | boolean | No | false |
| maxResults | Maximum results per search query | number | No | 50 |
| searchTimeout | Search query timeout (ms) | number | No | 5000 |
| enablePersonalization | Enable personalized search results | boolean | No | true |
| enableAutocomplete | Enable search autocomplete | boolean | No | true |

## Expected Output

This template will produce:
- **Multi-Modal Search Engine**: Text, voice, visual, and semantic search capabilities
- **Advanced Query Processing**: Natural language understanding and intent recognition
- **Intelligent Result Ranking**: Personalized and contextually relevant search results
- **Real-Time Indexing**: Automatic content indexing and search optimization
- **Search Analytics**: Comprehensive search performance and user behavior tracking
- **Autocomplete System**: Smart search suggestions and query completion
- **Filter Management**: Advanced filtering and faceted search capabilities
- **Search API**: RESTful API for search integration across platforms

## Implementation Patterns

### Search System Architecture

```typescript
// Search System Core Architecture
interface SearchSystem {
  indexManager: SearchIndexManager;
  queryProcessor: QueryProcessor;
  searchEngines: {
    textSearch: TextSearchEngine;
    voiceSearch: VoiceSearchEngine;
    visualSearch: VisualSearchEngine;
    semanticSearch: SemanticSearchEngine;
  };
  resultRanker: SearchResultRanker;
  searchAnalytics: SearchAnalyticsService;
}

interface SearchRequest {
  query: string;
  type: SearchType;
  userId?: string;
  filters?: SearchFilters;
  pagination?: PaginationOptions;
  context?: SearchContext;
  preferences?: SearchPreferences;
}

enum SearchType {
  TEXT = 'text',
  VOICE = 'voice',
  VISUAL = 'visual',
  SEMANTIC = 'semantic',
  HYBRID = 'hybrid'
}

interface SearchFilters {
  contentTypes?: ContentType[];
  genres?: string[];
  artists?: string[];
  dateRange?: DateRange;
  duration?: DurationRange;
  quality?: QualityLevel[];
  language?: string[];
  mood?: string[];
  activity?: string[];
  explicit?: boolean;
}

interface SearchContext {
  currentPlaylist?: string;
  currentTrack?: string;
  userLocation?: string;
  timeOfDay?: string;
  device?: string;
  sessionHistory?: string[];
}

interface SearchResult {
  items: SearchResultItem[];
  totalCount: number;
  searchTime: number;
  suggestions: SearchSuggestion[];
  facets: SearchFacet[];
  query: ProcessedQuery;
  pagination: PaginationInfo;
}

interface SearchResultItem {
  id: string;
  type: ContentType;
  title: string;
  artist?: string;
  album?: string;
  description?: string;
  duration?: number;
  releaseDate?: Date;
  genres: string[];
  thumbnailUrl?: string;
  score: number;
  rank: number;
  highlights: SearchHighlight[];
  matchReasons: MatchReason[];
}
```

### Text Search Engine

```typescript
// Full-Text Search Implementation
class TextSearchEngine {
  private elasticsearchClient: ElasticsearchClient;
  private indexName: string = 'media_content';
  private analyzer: TextAnalyzer;
  
  async search(request: SearchRequest): Promise<SearchResult> {
    // Process and analyze query
    const processedQuery = await this.processQuery(request.query, request.userId);
    
    // Build Elasticsearch query
    const esQuery = this.buildElasticsearchQuery(processedQuery, request.filters);
    
    // Execute search
    const startTime = Date.now();
    const esResponse = await this.elasticsearchClient.search({
      index: this.indexName,
      body: esQuery,
      size: request.pagination?.limit || 20,
      from: request.pagination?.offset || 0
    });
    const searchTime = Date.now() - startTime;
    
    // Process results
    const items = await this.processSearchResults(esResponse.body.hits.hits, processedQuery);
    
    // Generate suggestions and facets
    const [suggestions, facets] = await Promise.all([
      this.generateSearchSuggestions(processedQuery, esResponse),
      this.extractSearchFacets(esResponse.body.aggregations)
    ]);
    
    return {
      items,
      totalCount: esResponse.body.hits.total.value,
      searchTime,
      suggestions,
      facets,
      query: processedQuery,
      pagination: {
        offset: request.pagination?.offset || 0,
        limit: request.pagination?.limit || 20,
        hasMore: esResponse.body.hits.total.value > (request.pagination?.offset || 0) + items.length
      }
    };
  }
  
  private buildElasticsearchQuery(
    query: ProcessedQuery, 
    filters?: SearchFilters
  ): any {
    const esQuery: any = {
      query: {
        bool: {
          must: [],
          filter: [],
          should: [],
          minimum_should_match: 1
        }
      },
      highlight: {
        fields: {
          title: { fragment_size: 150, number_of_fragments: 3 },
          artist: { fragment_size: 150, number_of_fragments: 3 },
          description: { fragment_size: 150, number_of_fragments: 3 },
          lyrics: { fragment_size: 150, number_of_fragments: 3 }
        }
      },
      aggs: this.buildAggregations()
    };
    
    // Main search query
    if (query.terms.length > 0) {
      esQuery.query.bool.should.push({
        multi_match: {
          query: query.original,
          fields: [
            'title^3',
            'artist^2.5',
            'album^2',
            'description^1.5',
            'lyrics^1',
            'tags^1.5'
          ],
          type: 'best_fields',
          fuzziness: 'AUTO'
        }
      });
      
      // Exact phrase matching (higher boost)
      esQuery.query.bool.should.push({
        multi_match: {
          query: query.original,
          fields: ['title^5', 'artist^4'],
          type: 'phrase',
          boost: 2
        }
      });
      
      // Prefix matching for autocomplete
      esQuery.query.bool.should.push({
        multi_match: {
          query: query.original,
          fields: ['title.prefix^2', 'artist.prefix^2'],
          type: 'phrase_prefix'
        }
      });
    }
    
    // Apply filters
    if (filters) {
      this.applyFilters(esQuery.query.bool.filter, filters);
    }
    
    return esQuery;
  }
  
  private async processQuery(query: string, userId?: string): Promise<ProcessedQuery> {
    // Clean and normalize query
    const cleaned = this.analyzer.cleanQuery(query);
    
    // Extract entities (artists, albums, genres)
    const entities = await this.analyzer.extractEntities(cleaned);
    
    // Detect query intent
    const intent = await this.analyzer.detectIntent(cleaned, entities);
    
    // Apply user-specific query expansion
    const expanded = userId ? 
      await this.expandQueryForUser(cleaned, userId) : 
      cleaned;
    
    return {
      original: query,
      cleaned,
      expanded,
      terms: this.analyzer.tokenize(expanded),
      entities,
      intent,
      language: await this.analyzer.detectLanguage(query)
    };
  }
  
  private async expandQueryForUser(query: string, userId: string): Promise<string> {
    // Get user's listening history and preferences
    const userProfile = await this.getUserSearchProfile(userId);
    
    // Add synonyms based on user's music taste
    const synonyms = await this.getUserSpecificSynonyms(query, userProfile);
    
    // Expand query with relevant terms
    let expandedQuery = query;
    if (synonyms.length > 0) {
      expandedQuery += ' ' + synonyms.join(' ');
    }
    
    return expandedQuery;
  }
}
```

### Voice Search Engine

```typescript
// Voice Search Implementation
class VoiceSearchEngine {
  private speechRecognizer: SpeechRecognizer;
  private nlpProcessor: NLPProcessor;
  private textSearchEngine: TextSearchEngine;
  
  async searchByVoice(audioData: ArrayBuffer, userId?: string): Promise<SearchResult> {
    // Convert speech to text
    const transcription = await this.speechRecognizer.transcribe(audioData, {
      language: 'auto-detect',
      model: 'music-optimized',
      enablePunctuation: true,
      enableWordTimestamps: true
    });
    
    // Process natural language query
    const nlpResult = await this.nlpProcessor.processVoiceQuery(transcription.text);
    
    // Extract search intent and parameters
    const searchIntent = await this.extractSearchIntent(nlpResult);
    
    // Convert to structured search request
    const searchRequest = await this.convertToSearchRequest(searchIntent, userId);
    
    // Execute search using text search engine
    const searchResult = await this.textSearchEngine.search(searchRequest);
    
    // Add voice-specific metadata
    searchResult.voiceMetadata = {
      transcription: transcription.text,
      confidence: transcription.confidence,
      intent: searchIntent,
      processingTime: Date.now() - transcription.startTime
    };
    
    return searchResult;
  }
  
  private async extractSearchIntent(nlpResult: NLPResult): Promise<VoiceSearchIntent> {
    const intent: VoiceSearchIntent = {
      action: 'search',
      entities: {},
      filters: {},
      modifiers: []
    };
    
    // Extract entities
    for (const entity of nlpResult.entities) {
      switch (entity.type) {
        case 'ARTIST':
          intent.entities.artist = entity.value;
          break;
        case 'SONG':
          intent.entities.song = entity.value;
          break;
        case 'ALBUM':
          intent.entities.album = entity.value;
          break;
        case 'GENRE':
          intent.filters.genres = intent.filters.genres || [];
          intent.filters.genres.push(entity.value);
          break;
        case 'MOOD':
          intent.filters.mood = entity.value;
          break;
        case 'YEAR':
          intent.filters.year = parseInt(entity.value);
          break;
      }
    }
    
    // Extract action modifiers
    if (nlpResult.text.includes('play') || nlpResult.text.includes('start')) {
      intent.action = 'play';
    } else if (nlpResult.text.includes('similar') || nlpResult.text.includes('like')) {
      intent.action = 'find_similar';
    } else if (nlpResult.text.includes('popular') || nlpResult.text.includes('trending')) {
      intent.modifiers.push('popular');
    }
    
    return intent;
  }
  
  async enableVoiceCommands(): Promise<void> {
    // Set up continuous voice command recognition
    await this.speechRecognizer.startContinuousRecognition({
      hotwords: ['hey music', 'play music', 'find song'],
      onHotwordDetected: async (hotword) => {
        await this.handleVoiceCommand(hotword);
      },
      onSpeechEnd: async (audioData) => {
        const result = await this.searchByVoice(audioData);
        await this.handleVoiceSearchResult(result);
      }
    });
  }
}
```

### Visual Search Engine

```typescript
// Visual Search Implementation
class VisualSearchEngine {
  private imageProcessor: ImageProcessor;
  private ocrService: OCRService;
  private visualEmbeddingModel: VisualEmbeddingModel;
  private vectorStore: VectorStore;
  
  async searchByImage(imageData: ArrayBuffer, userId?: string): Promise<SearchResult> {
    // Process image
    const processedImage = await this.imageProcessor.processImage(imageData);
    
    // Extract text from image (album covers, posters, etc.)
    const ocrResult = await this.ocrService.extractText(processedImage);
    
    // Generate visual embeddings
    const visualEmbedding = await this.visualEmbeddingModel.generateEmbedding(processedImage);
    
    // Search for similar images in vector store
    const similarImages = await this.vectorStore.searchSimilar(visualEmbedding, 50);
    
    // Combine OCR text search with visual similarity
    const combinedResults = await this.combineVisualAndTextResults(
      ocrResult, 
      similarImages, 
      userId
    );
    
    return combinedResults;
  }
  
  async searchByAlbumCover(imageData: ArrayBuffer): Promise<SearchResult> {
    // Detect if image is an album cover
    const isAlbumCover = await this.imageProcessor.detectAlbumCover(imageData);
    
    if (!isAlbumCover) {
      throw new Error('Image does not appear to be an album cover');
    }
    
    // Extract album cover features
    const coverFeatures = await this.extractAlbumCoverFeatures(imageData);
    
    // Search album cover database
    const matchingAlbums = await this.searchAlbumCoverDatabase(coverFeatures);
    
    // Convert to search results
    const searchResults = await this.convertAlbumMatchesToResults(matchingAlbums);
    
    return {
      items: searchResults,
      totalCount: searchResults.length,
      searchTime: Date.now() - coverFeatures.startTime,
      suggestions: [],
      facets: [],
      query: { original: '[Album Cover Search]', type: 'visual' },
      pagination: { offset: 0, limit: 20, hasMore: false }
    };
  }
  
  async enableCameraSearch(): Promise<void> {
    // Set up real-time camera-based search
    const videoStream = await navigator.mediaDevices.getUserMedia({ 
      video: { facingMode: 'environment' } 
    });
    
    const videoElement = document.createElement('video');
    videoElement.srcObject = videoStream;
    videoElement.play();
    
    // Process frames for real-time recognition
    const processFrame = async () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      canvas.width = videoElement.videoWidth;
      canvas.height = videoElement.videoHeight;
      ctx.drawImage(videoElement, 0, 0);
      
      const imageData = canvas.toDataURL('image/jpeg');
      const result = await this.searchByImage(
        this.dataURLToArrayBuffer(imageData)
      );
      
      if (result.items.length > 0) {
        await this.handleCameraSearchResult(result);
      }
      
      // Continue processing
      requestAnimationFrame(processFrame);
    };
    
    videoElement.addEventListener('loadedmetadata', processFrame);
  }
}
```

### Semantic Search Engine

```typescript
// Semantic Search Implementation
class SemanticSearchEngine {
  private embeddingModel: EmbeddingModel;
  private vectorStore: VectorStore;
  private knowledgeGraph: KnowledgeGraph;
  private contextualizer: ContextualSearchEngine;
  
  async searchSemantic(query: string, userId?: string): Promise<SearchResult> {
    // Generate query embedding
    const queryEmbedding = await this.embeddingModel.generateEmbedding(query);
    
    // Search vector store for semantically similar content
    const semanticMatches = await this.vectorStore.searchSimilar(queryEmbedding, 100);
    
    // Enhance with knowledge graph relationships
    const enhancedMatches = await this.enhanceWithKnowledgeGraph(
      semanticMatches, 
      query
    );
    
    // Apply contextual ranking
    const contextualResults = userId ? 
      await this.contextualizer.rankWithUserContext(enhancedMatches, userId) :
      enhancedMatches;
    
    // Convert to search result format
    const searchResults = await this.convertSemanticMatchesToResults(contextualResults);
    
    return {
      items: searchResults,
      totalCount: searchResults.length,
      searchTime: Date.now() - queryEmbedding.startTime,
      suggestions: await this.generateSemanticSuggestions(query),
      facets: await this.extractSemanticFacets(contextualResults),
      query: { original: query, type: 'semantic' },
      pagination: { offset: 0, limit: 20, hasMore: false }
    };
  }
  
  async searchByMood(mood: string, userId?: string): Promise<SearchResult> {
    // Get mood embedding
    const moodEmbedding = await this.embeddingModel.generateMoodEmbedding(mood);
    
    // Find content with similar mood characteristics
    const moodMatches = await this.vectorStore.searchByMood(moodEmbedding);
    
    // Apply user preferences if available
    const personalizedMatches = userId ?
      await this.personalizeForUser(moodMatches, userId) :
      moodMatches;
    
    return this.convertToSearchResult(personalizedMatches, `mood: ${mood}`);
  }
  
  async searchByActivity(activity: string, userId?: string): Promise<SearchResult> {
    // Map activity to music characteristics
    const activityProfile = await this.getActivityMusicProfile(activity);
    
    // Generate activity-based query
    const activityQuery = this.buildActivityQuery(activityProfile);
    
    // Search using activity-optimized parameters
    const activityMatches = await this.searchWithActivityProfile(
      activityQuery, 
      activityProfile
    );
    
    return this.convertToSearchResult(activityMatches, `activity: ${activity}`);
  }
  
  private async enhanceWithKnowledgeGraph(
    matches: VectorMatch[], 
    query: string
  ): Promise<EnhancedMatch[]> {
    const enhancedMatches: EnhancedMatch[] = [];
    
    for (const match of matches) {
      // Get related entities from knowledge graph
      const relatedEntities = await this.knowledgeGraph.getRelatedEntities(
        match.contentId
      );
      
      // Calculate relationship relevance to query
      const relationshipScore = await this.calculateRelationshipRelevance(
        relatedEntities, 
        query
      );
      
      enhancedMatches.push({
        ...match,
        relatedEntities,
        relationshipScore,
        enhancedScore: match.score * (1 + relationshipScore * 0.3)
      });
    }
    
    return enhancedMatches.sort((a, b) => b.enhancedScore - a.enhancedScore);
  }
  
  async buildContentEmbeddings(): Promise<void> {
    // Build embeddings for all content
    const allContent = await this.getAllContent();
    
    for (const content of allContent) {
      // Generate text embedding from metadata
      const textEmbedding = await this.embeddingModel.generateEmbedding(
        `${content.title} ${content.artist} ${content.description} ${content.genres.join(' ')}`
      );
      
      // Generate audio feature embedding if available
      const audioEmbedding = content.audioFeatures ?
        await this.embeddingModel.generateAudioEmbedding(content.audioFeatures) :
        null;
      
      // Combine embeddings
      const combinedEmbedding = audioEmbedding ?
        this.combineEmbeddings(textEmbedding, audioEmbedding) :
        textEmbedding;
      
      // Store in vector database
      await this.vectorStore.store(content.id, combinedEmbedding, {
        contentType: content.type,
        genres: content.genres,
        mood: content.mood,
        activity: content.activity,
        audioFeatures: content.audioFeatures
      });
    }
  }
}
```

### Search Result Ranking

```typescript
// Search Result Ranking Implementation
class SearchResultRanker {
  private userPreferenceService: UserPreferenceService;
  private popularityService: PopularityService;
  private qualityScorer: QualityScorer;
  
  async rankResults(
    results: SearchResultItem[], 
    query: ProcessedQuery, 
    userId?: string
  ): Promise<SearchResultItem[]> {
    // Calculate base relevance scores
    const scoredResults = await this.calculateRelevanceScores(results, query);
    
    // Apply user personalization if available
    const personalizedResults = userId ?
      await this.applyPersonalization(scoredResults, userId) :
      scoredResults;
    
    // Apply popularity boost
    const popularityBoostedResults = await this.applyPopularityBoost(personalizedResults);
    
    // Apply quality scoring
    const qualityAdjustedResults = await this.applyQualityScoring(popularityBoostedResults);
    
    // Apply diversity constraints
    const diversifiedResults = await this.applyDiversification(qualityAdjustedResults);
    
    // Final ranking
    return this.finalRanking(diversifiedResults);
  }
  
  private async calculateRelevanceScores(
    results: SearchResultItem[], 
    query: ProcessedQuery
  ): Promise<ScoredSearchResult[]> {
    const scoredResults: ScoredSearchResult[] = [];
    
    for (const result of results) {
      let relevanceScore = 0;
      
      // Title match score (highest weight)
      relevanceScore += this.calculateTextMatchScore(result.title, query) * 0.4;
      
      // Artist match score
      relevanceScore += this.calculateTextMatchScore(result.artist || '', query) * 0.3;
      
      // Description match score
      relevanceScore += this.calculateTextMatchScore(result.description || '', query) * 0.2;
      
      // Genre/tag match score
      relevanceScore += this.calculateTagMatchScore(result.genres, query) * 0.1;
      
      scoredResults.push({
        ...result,
        relevanceScore,
        totalScore: relevanceScore
      });
    }
    
    return scoredResults;
  }
  
  private async applyPersonalization(
    results: ScoredSearchResult[], 
    userId: string
  ): Promise<ScoredSearchResult[]> {
    const userPreferences = await this.userPreferenceService.getUserPreferences(userId);
    
    return results.map(result => {
      let personalizationScore = 0;
      
      // Genre preference boost
      const genreBoost = this.calculateGenrePreferenceBoost(
        result.genres, 
        userPreferences.preferredGenres
      );
      personalizationScore += genreBoost * 0.3;
      
      // Artist preference boost
      const artistBoost = userPreferences.preferredArtists.includes(result.artist || '') ? 0.2 : 0;
      personalizationScore += artistBoost;
      
      // Historical interaction boost
      const interactionBoost = this.calculateInteractionBoost(result.id, userPreferences.interactions);
      personalizationScore += interactionBoost * 0.5;
      
      return {
        ...result,
        personalizationScore,
        totalScore: result.totalScore + personalizationScore
      };
    });
  }
  
  private async applyDiversification(
    results: ScoredSearchResult[]
  ): Promise<ScoredSearchResult[]> {
    const diversifiedResults: ScoredSearchResult[] = [];
    const selectedGenres = new Set<string>();
    const selectedArtists = new Set<string>();
    
    // Sort by total score first
    const sortedResults = [...results].sort((a, b) => b.totalScore - a.totalScore);
    
    for (const result of sortedResults) {
      let diversityPenalty = 0;
      
      // Penalize if genre is over-represented
      const genreCount = result.genres.filter(g => selectedGenres.has(g)).length;
      if (genreCount > 0) {
        diversityPenalty += genreCount * 0.1;
      }
      
      // Penalize if artist is over-represented
      if (result.artist && selectedArtists.has(result.artist)) {
        diversityPenalty += 0.15;
      }
      
      // Apply penalty
      const diversifiedScore = Math.max(0, result.totalScore - diversityPenalty);
      
      diversifiedResults.push({
        ...result,
        diversityPenalty,
        totalScore: diversifiedScore
      });
      
      // Track selected items for diversity
      result.genres.forEach(g => selectedGenres.add(g));
      if (result.artist) selectedArtists.add(result.artist);
    }
    
    return diversifiedResults;
  }
}
```

## Configuration

### Search Engine Configuration

```yaml
# search-config.yml
search_engine:
  # Core Search Configuration
  core:
    default_results_per_page: 20
    max_results_per_page: 100
    search_timeout_ms: 5000
    enable_fuzzy_matching: true
    fuzzy_threshold: 0.8
    
  # Full-Text Search
  full_text:
    analyzer: "standard"
    min_query_length: 2
    max_query_length: 200
    boost_exact_matches: 2.0
    boost_title_matches: 1.5
    enable_stemming: true
    enable_synonyms: true
    
  # Voice Search
  voice_search:
    enabled: true
    speech_recognition_provider: "google_cloud"
    language_models: ["en-US", "es-ES", "fr-FR"]
    confidence_threshold: 0.7
    max_audio_duration_seconds: 30
    
  # Visual Search
  visual_search:
    enabled: true
    image_recognition_provider: "aws_rekognition"
    supported_formats: ["jpg", "png", "webp"]
    max_image_size_mb: 10
    similarity_threshold: 0.75
    
  # Semantic Search
  semantic_search:
    enabled: true
    embedding_model: "sentence-transformers"
    vector_dimensions: 384
    similarity_metric: "cosine"
    index_refresh_interval_hours: 24
    
  # Search Analytics
  analytics:
    track_queries: true
    track_results_clicked: true
    track_zero_results: true
    session_tracking: true
    retention_period_days: 90
```

### Environment-Specific Configuration

```typescript
// Development Configuration
const developmentConfig: SearchEngineConfig = {
  core: {
    defaultResultsPerPage: 10,
    maxResultsPerPage: 50,
    searchTimeoutMs: 10000, // Longer timeout for development
    enableFuzzyMatching: true,
    fuzzyThreshold: 0.6 // More lenient for development
  },
  fullText: {
    analyzer: "simple",
    minQueryLength: 1,
    boostExactMatches: 1.5,
    enableStemming: false, // Disabled for simpler development
    enableSynonyms: false
  },
  voiceSearch: {
    enabled: false, // Disabled in development
    speechRecognitionProvider: "mock"
  },
  visualSearch: {
    enabled: false, // Disabled in development
    imageRecognitionProvider: "mock"
  },
  semanticSearch: {
    enabled: true,
    embeddingModel: "mini-lm",
    vectorDimensions: 128, // Smaller for development
    indexRefreshIntervalHours: 1
  },
  analytics: {
    trackQueries: true,
    trackResultsClicked: false,
    sessionTracking: false,
    retentionPeriodDays: 7
  }
};

// Production Configuration
const productionConfig: SearchEngineConfig = {
  core: {
    defaultResultsPerPage: 20,
    maxResultsPerPage: 100,
    searchTimeoutMs: 3000,
    enableFuzzyMatching: true,
    fuzzyThreshold: 0.8
  },
  fullText: {
    analyzer: "standard",
    minQueryLength: 2,
    maxQueryLength: 200,
    boostExactMatches: 2.0,
    boostTitleMatches: 1.5,
    enableStemming: true,
    enableSynonyms: true
  },
  voiceSearch: {
    enabled: true,
    speechRecognitionProvider: "google_cloud",
    languageModels: ["en-US", "es-ES", "fr-FR", "de-DE"],
    confidenceThreshold: 0.7,
    maxAudioDurationSeconds: 30
  },
  visualSearch: {
    enabled: true,
    imageRecognitionProvider: "aws_rekognition",
    supportedFormats: ["jpg", "png", "webp"],
    maxImageSizeMb: 10,
    similarityThreshold: 0.75
  },
  semanticSearch: {
    enabled: true,
    embeddingModel: "sentence-transformers",
    vectorDimensions: 384,
    similarityMetric: "cosine",
    indexRefreshIntervalHours: 24
  },
  analytics: {
    trackQueries: true,
    trackResultsClicked: true,
    trackZeroResults: true,
    sessionTracking: true,
    retentionPeriodDays: 90
  }
};
```

### Search Index Configuration

```typescript
// Search Index Configuration
interface SearchIndexConfig {
  // Index Settings
  settings: {
    numberOfShards: number;
    numberOfReplicas: number;
    refreshInterval: string;
    maxResultWindow: number;
  };
  
  // Field Mappings
  mappings: {
    properties: Record<string, FieldMapping>;
  };
  
  // Analysis Configuration
  analysis: {
    analyzers: Record<string, AnalyzerConfig>;
    tokenizers: Record<string, TokenizerConfig>;
    filters: Record<string, FilterConfig>;
  };
}

const searchIndexConfig: SearchIndexConfig = {
  settings: {
    numberOfShards: 3,
    numberOfReplicas: 1,
    refreshInterval: "1s",
    maxResultWindow: 10000
  },
  mappings: {
    properties: {
      title: {
        type: "text",
        analyzer: "title_analyzer",
        boost: 2.0,
        fields: {
          exact: { type: "keyword" },
          suggest: { type: "completion" }
        }
      },
      artist: {
        type: "text",
        analyzer: "artist_analyzer",
        boost: 1.5,
        fields: {
          exact: { type: "keyword" }
        }
      },
      album: {
        type: "text",
        analyzer: "standard",
        fields: {
          exact: { type: "keyword" }
        }
      },
      genre: {
        type: "keyword",
        boost: 1.2
      },
      lyrics: {
        type: "text",
        analyzer: "lyrics_analyzer",
        boost: 0.8
      },
      duration: {
        type: "integer"
      },
      release_date: {
        type: "date"
      },
      popularity_score: {
        type: "float",
        boost: 0.5
      },
      embedding_vector: {
        type: "dense_vector",
        dims: 384
      }
    }
  },
  analysis: {
    analyzers: {
      title_analyzer: {
        type: "custom",
        tokenizer: "standard",
        filters: ["lowercase", "asciifolding", "title_synonym"]
      },
      artist_analyzer: {
        type: "custom",
        tokenizer: "keyword",
        filters: ["lowercase", "asciifolding"]
      },
      lyrics_analyzer: {
        type: "custom",
        tokenizer: "standard",
        filters: ["lowercase", "stop", "stemmer"]
      }
    },
    tokenizers: {
      edge_ngram_tokenizer: {
        type: "edge_ngram",
        min_gram: 2,
        max_gram: 10,
        token_chars: ["letter", "digit"]
      }
    },
    filters: {
      title_synonym: {
        type: "synonym",
        synonyms_path: "synonyms/music_synonyms.txt"
      },
      stemmer: {
        type: "stemmer",
        language: "english"
      }
    }
  }
};
```

### Search Query Configuration

```typescript
// Query Configuration
interface QueryConfig {
  // Query Types and Weights
  queryTypes: {
    multiMatch: {
      enabled: boolean;
      fields: string[];
      type: string;
      tieBreaker: number;
    };
    fuzzy: {
      enabled: boolean;
      fuzziness: string;
      prefixLength: number;
      maxExpansions: number;
    };
    wildcard: {
      enabled: boolean;
      maxExpansions: number;
    };
    semantic: {
      enabled: boolean;
      vectorField: string;
      numCandidates: number;
    };
  };
  
  // Filtering and Sorting
  filters: {
    defaultFilters: Record<string, any>;
    availableFilters: string[];
    maxFilterValues: number;
  };
  
  // Aggregations
  aggregations: {
    enabled: boolean;
    maxBuckets: number;
    availableAggregations: string[];
  };
}

const queryConfig: QueryConfig = {
  queryTypes: {
    multiMatch: {
      enabled: true,
      fields: ["title^2", "artist^1.5", "album", "lyrics^0.8"],
      type: "best_fields",
      tieBreaker: 0.3
    },
    fuzzy: {
      enabled: true,
      fuzziness: "AUTO",
      prefixLength: 2,
      maxExpansions: 50
    },
    wildcard: {
      enabled: true,
      maxExpansions: 100
    },
    semantic: {
      enabled: true,
      vectorField: "embedding_vector",
      numCandidates: 100
    }
  },
  filters: {
    defaultFilters: {},
    availableFilters: [
      "genre", "artist", "album", "release_year", 
      "duration_range", "popularity_range"
    ],
    maxFilterValues: 20
  },
  aggregations: {
    enabled: true,
    maxBuckets: 100,
    availableAggregations: [
      "genres", "artists", "release_years", "duration_ranges"
    ]
  }
};
```

### Performance Configuration

```typescript
// Performance Configuration
interface SearchPerformanceConfig {
  // Caching
  caching: {
    queryCache: {
      enabled: boolean;
      ttlSeconds: number;
      maxSize: number;
    };
    resultCache: {
      enabled: boolean;
      ttlSeconds: number;
      maxSize: number;
    };
  };
  
  // Connection Pooling
  connectionPool: {
    maxConnections: number;
    connectionTimeoutMs: number;
    idleTimeoutMs: number;
  };
  
  // Rate Limiting
  rateLimiting: {
    enabled: boolean;
    requestsPerMinute: number;
    burstLimit: number;
  };
  
  // Monitoring
  monitoring: {
    slowQueryThresholdMs: number;
    enableQueryProfiling: boolean;
    metricsRetentionDays: number;
  };
}

const performanceConfig: SearchPerformanceConfig = {
  caching: {
    queryCache: {
      enabled: true,
      ttlSeconds: 300, // 5 minutes
      maxSize: 1000
    },
    resultCache: {
      enabled: true,
      ttlSeconds: 600, // 10 minutes
      maxSize: 500
    }
  },
  connectionPool: {
    maxConnections: 20,
    connectionTimeoutMs: 5000,
    idleTimeoutMs: 30000
  },
  rateLimiting: {
    enabled: true,
    requestsPerMinute: 100,
    burstLimit: 20
  },
  monitoring: {
    slowQueryThresholdMs: 1000,
    enableQueryProfiling: true,
    metricsRetentionDays: 30
  }
};
```

### Configuration Validation

```typescript
// Configuration Validation Schema
import Joi from 'joi';

const searchConfigSchema = Joi.object({
  core: Joi.object({
    defaultResultsPerPage: Joi.number().min(1).max(100).required(),
    maxResultsPerPage: Joi.number().min(1).max(1000).required(),
    searchTimeoutMs: Joi.number().min(100).max(30000),
    enableFuzzyMatching: Joi.boolean(),
    fuzzyThreshold: Joi.number().min(0).max(1)
  }).required(),
  
  fullText: Joi.object({
    analyzer: Joi.string().valid('standard', 'simple', 'keyword'),
    minQueryLength: Joi.number().min(1).max(10),
    maxQueryLength: Joi.number().min(10).max(1000),
    boostExactMatches: Joi.number().min(0).max(10),
    enableStemming: Joi.boolean(),
    enableSynonyms: Joi.boolean()
  }),
  
  voiceSearch: Joi.object({
    enabled: Joi.boolean(),
    speechRecognitionProvider: Joi.string().when('enabled', {
      is: true,
      then: Joi.required()
    }),
    confidenceThreshold: Joi.number().min(0).max(1),
    maxAudioDurationSeconds: Joi.number().min(1).max(120)
  }),
  
  analytics: Joi.object({
    trackQueries: Joi.boolean(),
    retentionPeriodDays: Joi.number().min(1).max(365)
  })
});

// Configuration Validation Function
function validateSearchConfig(config: any): ValidationResult {
  const { error, value } = searchConfigSchema.validate(config);
  
  if (error) {
    return {
      valid: false,
      errors: error.details.map(detail => detail.message)
    };
  }
  
  // Business logic validation
  if (value.core.defaultResultsPerPage > value.core.maxResultsPerPage) {
    return {
      valid: false,
      errors: ['Default results per page cannot exceed maximum results per page']
    };
  }
  
  if (value.voiceSearch.enabled && !value.voiceSearch.speechRecognitionProvider) {
    return {
      valid: false,
      errors: ['Speech recognition provider is required when voice search is enabled']
    };
  }
  
  return {
    valid: true,
    config: value
  };
}
```

## Platform-Specific Implementations

### Web Implementation

```javascript
// Web Search Interface
class WebSearchInterface {
  constructor() {
    this.searchInput = document.getElementById('search-input');
    this.voiceButton = document.getElementById('voice-search');
    this.cameraButton = document.getElementById('camera-search');
    this.setupEventListeners();
  }
  
  setupEventListeners() {
    // Text search with debouncing
    let searchTimeout;
    this.searchInput.addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        this.performSearch(e.target.value);
      }, 300);
    });
    
    // Voice search
    this.voiceButton.addEventListener('click', () => {
      this.startVoiceSearch();
    });
    
    // Camera search
    this.cameraButton.addEventListener('click', () => {
      this.startCameraSearch();
    });
  }
  
  async startVoiceSearch() {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Voice search not supported');
      return;
    }
    
    const recognition = new webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    
    recognition.onresult = async (event) => {
      const transcript = event.results[0][0].transcript;
      await this.performVoiceSearch(transcript);
    };
    
    recognition.start();
  }
}
```

### Mobile Implementation

```swift
// iOS Search Interface
import Speech
import AVFoundation

class iOSSearchInterface: UIViewController {
    @IBOutlet weak var searchBar: UISearchBar!
    @IBOutlet weak var voiceButton: UIButton!
    
    private let speechRecognizer = SFSpeechRecognizer()
    private var recognitionRequest: SFSpeechAudioBufferRecognitionRequest?
    private var recognitionTask: SFSpeechRecognitionTask?
    private let audioEngine = AVAudioEngine()
    
    @IBAction func voiceSearchTapped(_ sender: UIButton) {
        if audioEngine.isRunning {
            stopVoiceSearch()
        } else {
            startVoiceSearch()
        }
    }
    
    private func startVoiceSearch() {
        guard let speechRecognizer = speechRecognizer, speechRecognizer.isAvailable else {
            return
        }
        
        recognitionRequest = SFSpeechAudioBufferRecognitionRequest()
        guard let recognitionRequest = recognitionRequest else { return }
        
        recognitionRequest.shouldReportPartialResults = true
        
        recognitionTask = speechRecognizer.recognitionTask(with: recognitionRequest) { result, error in
            if let result = result {
                let transcript = result.bestTranscription.formattedString
                DispatchQueue.main.async {
                    self.searchBar.text = transcript
                    if result.isFinal {
                        self.performSearch(transcript)
                    }
                }
            }
        }
        
        let inputNode = audioEngine.inputNode
        let recordingFormat = inputNode.outputFormat(forBus: 0)
        
        inputNode.installTap(onBus: 0, bufferSize: 1024, format: recordingFormat) { buffer, _ in
            recognitionRequest.append(buffer)
        }
        
        audioEngine.prepare()
        try? audioEngine.start()
    }
}
```

## Testing Strategy

```typescript
// Search System Tests
describe('Content Search System', () => {
  test('should return relevant results for text search', async () => {
    const searchRequest = {
      query: 'rock music from the 80s',
      type: SearchType.TEXT,
      userId: 'user123'
    };
    
    const result = await textSearchEngine.search(searchRequest);
    
    expect(result.items.length).toBeGreaterThan(0);
    expect(result.items[0].score).toBeGreaterThan(0.5);
    
    // Check that results contain rock music from 80s
    const hasRockGenre = result.items.some(item => 
      item.genres.some(genre => genre.toLowerCase().includes('rock'))
    );
    expect(hasRockGenre).toBe(true);
  });
  
  test('should handle voice search correctly', async () => {
    const audioData = await loadTestAudioFile('voice_query.wav');
    
    const result = await voiceSearchEngine.searchByVoice(audioData, 'user123');
    
    expect(result.voiceMetadata).toBeDefined();
    expect(result.voiceMetadata.confidence).toBeGreaterThan(0.7);
    expect(result.items.length).toBeGreaterThan(0);
  });
  
  test('should provide semantic search results', async () => {
    const query = 'upbeat songs for working out';
    
    const result = await semanticSearchEngine.searchSemantic(query, 'user123');
    
    expect(result.items.length).toBeGreaterThan(0);
    
    // Check that results have high energy characteristics
    const hasHighEnergyContent = result.items.some(item => 
      item.metadata.audioFeatures?.energy > 0.7
    );
    expect(hasHighEnergyContent).toBe(true);
  });
});
```

## Best Practices

1. **Query Processing**: Implement robust query cleaning, entity extraction, and intent detection
2. **Indexing Strategy**: Use appropriate indexing for different content types and search patterns
3. **Personalization**: Balance relevance with personalization without creating filter bubbles
4. **Performance**: Implement caching, pagination, and efficient indexing for fast search
5. **Multi-modal Search**: Provide seamless integration between text, voice, and visual search
6. **Analytics**: Track search patterns to improve ranking algorithms and user experience

## Integration Points

- **Content Service**: Index content metadata and maintain search indices
- **User Service**: Access user preferences and search history for personalization
- **Analytics Service**: Track search queries, results, and user interactions
- **Recommendation Service**: Use search data to improve recommendation algorithms
- **Voice Service**: Integrate with speech recognition and natural language processing

This template provides a comprehensive foundation for implementing advanced search capabilities in media streaming applications.
