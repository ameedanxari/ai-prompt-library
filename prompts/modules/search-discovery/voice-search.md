# Voice Search Template

## Purpose

This template provides comprehensive patterns for implementing voice search systems that enable users to search using spoken queries. It covers speech recognition, natural language understanding, voice query processing, and conversational search interfaces.

## Context

Voice search allows users to interact with search systems using natural speech instead of typing. Users expect voice interfaces to understand natural language, handle accents and variations, and provide relevant results quickly. This template addresses the complexity of building AI-powered voice search systems that leverage speech recognition, natural language processing, and intelligent query understanding.

## Instructions

1. **Setup Speech Recognition**: Configure speech-to-text processing pipeline
2. **Implement Voice Activity Detection**: Build audio stream processing
3. **Configure Natural Language Understanding**: Set up intent and entity extraction
4. **Add Query Processing**: Implement voice query normalization and enhancement
5. **Build Conversational Interface**: Enable multi-turn voice interactions
6. **Optimize Latency**: Implement streaming recognition for real-time response
7. **Monitor Quality**: Track recognition accuracy and search relevance

## Examples

### Example 1: Voice Search Setup
```typescript
interface VoiceSearchEngine {
  searchByVoice(audio: AudioInput, options?: VoiceSearchOptions): Promise<VoiceSearchResult>;
  transcribe(audio: AudioInput): Promise<TranscriptionResult>;
  processVoiceQuery(transcription: string): Promise<ProcessedQuery>;
}

const result = await voiceSearch.searchByVoice(audioStream, {
  language: 'en-US',
  enableConversation: true
});
```

### Example 2: Streaming Voice Recognition
```typescript
const streamingSearch = voiceSearch.createStreamingSession({
  onPartialResult: (partial) => updateUI(partial),
  onFinalResult: (result) => executeSearch(result),
  language: 'en-US'
});

audioStream.pipe(streamingSearch);
```

### Example 3: Conversational Voice Search
```typescript
const conversation = await voiceSearch.startConversation();

const result1 = await conversation.query('Find Italian restaurants nearby');
// Returns restaurant results

const result2 = await conversation.query('Which ones are open now?');
// Understands context from previous query
```

## Variables

| Variable | Description | Type | Required | Default |
|----------|-------------|------|----------|---------|
| speechRecognitionProvider | Speech-to-text provider | string | Yes | N/A |
| language | Primary recognition language | string | No | "en-US" |
| enableStreaming | Enable streaming recognition | boolean | No | true |
| enableConversation | Enable multi-turn conversations | boolean | No | true |
| vadSensitivity | Voice activity detection sensitivity | number | No | 0.5 |
| maxAudioDuration | Maximum audio duration in seconds | number | No | 60 |
| enablePunctuation | Add punctuation to transcription | boolean | No | true |
| enableProfanityFilter | Filter profanity from results | boolean | No | true |

## Expected Output

This template will produce:
- **Speech Recognition**: Audio-to-text conversion pipeline
- **Voice Activity Detection**: Automatic speech detection
- **Natural Language Understanding**: Intent and entity extraction
- **Query Processing**: Voice query normalization
- **Conversational Interface**: Multi-turn voice interactions
- **Streaming Recognition**: Real-time transcription
- **Error Handling**: Noise and unclear speech handling
- **Quality Metrics**: Recognition accuracy tracking

## Implementation Patterns

### Voice Search Architecture

```typescript
// Core Voice Search Architecture
interface VoiceSearchSystem {
  speechRecognizer: SpeechRecognizer;
  voiceActivityDetector: VoiceActivityDetector;
  naturalLanguageProcessor: NaturalLanguageProcessor;
  queryProcessor: VoiceQueryProcessor;
  conversationManager: ConversationManager;
  searchEngine: SearchEngine;
}

interface VoiceSearchQuery {
  audio: AudioInput;
  options?: VoiceSearchOptions;
  conversationId?: string;
}

interface AudioInput {
  type: 'stream' | 'buffer' | 'file' | 'url';
  data: AudioStream | Buffer | string;
  format?: AudioFormat;
  sampleRate?: number;
}

interface AudioFormat {
  encoding: 'LINEAR16' | 'FLAC' | 'MP3' | 'OGG_OPUS' | 'WEBM_OPUS';
  channels: number;
  sampleRate: number;
}

interface VoiceSearchOptions {
  language?: string;
  alternativeLanguages?: string[];
  enableStreaming?: boolean;
  enableConversation?: boolean;
  maxAlternatives?: number;
  profanityFilter?: boolean;
  enablePunctuation?: boolean;
  speechContext?: SpeechContext[];
}

interface VoiceSearchResult {
  transcription: TranscriptionResult;
  processedQuery: ProcessedQuery;
  searchResults: SearchResult[];
  conversationState?: ConversationState;
  confidence: number;
  processingTime: number;
}

interface TranscriptionResult {
  text: string;
  confidence: number;
  alternatives: TranscriptionAlternative[];
  words: WordInfo[];
  language: string;
  isFinal: boolean;
}

interface WordInfo {
  word: string;
  startTime: number;
  endTime: number;
  confidence: number;
  speakerTag?: number;
}

interface ProcessedQuery {
  originalText: string;
  normalizedText: string;
  intent: QueryIntent;
  entities: ExtractedEntity[];
  searchQuery: string;
}
```

### Speech Recognition

```typescript
// Speech Recognition Implementation
class SpeechRecognizer {
  private provider: SpeechRecognitionProvider;
  private config: SpeechRecognitionConfig;

  async transcribe(audio: AudioInput): Promise<TranscriptionResult> {
    const processedAudio = await this.preprocessAudio(audio);
    const result = await this.provider.recognize(processedAudio, this.config);

    return {
      text: result.transcript,
      confidence: result.confidence,
      alternatives: result.alternatives,
      words: result.words,
      language: result.detectedLanguage || this.config.language,
      isFinal: true
    };
  }

  createStreamingSession(
    options: StreamingOptions
  ): StreamingRecognitionSession {
    return new StreamingRecognitionSession(this.provider, {
      ...this.config,
      ...options
    });
  }

  private async preprocessAudio(audio: AudioInput): Promise<ProcessedAudio> {
    let audioBuffer: Buffer;

    switch (audio.type) {
      case 'stream':
        audioBuffer = await this.streamToBuffer(audio.data as AudioStream);
        break;
      case 'buffer':
        audioBuffer = audio.data as Buffer;
        break;
      case 'file':
        audioBuffer = await this.loadAudioFile(audio.data as string);
        break;
      case 'url':
        audioBuffer = await this.downloadAudio(audio.data as string);
        break;
    }

    // Normalize audio format
    const normalized = await this.normalizeAudio(audioBuffer, audio.format);

    return {
      buffer: normalized,
      format: this.config.targetFormat,
      duration: this.calculateDuration(normalized)
    };
  }

  private async normalizeAudio(
    buffer: Buffer,
    sourceFormat?: AudioFormat
  ): Promise<Buffer> {
    // Convert to target format if needed
    if (sourceFormat && sourceFormat.encoding !== this.config.targetFormat.encoding) {
      return await this.convertAudioFormat(buffer, sourceFormat, this.config.targetFormat);
    }

    // Resample if needed
    if (sourceFormat && sourceFormat.sampleRate !== this.config.targetFormat.sampleRate) {
      return await this.resampleAudio(buffer, sourceFormat.sampleRate, this.config.targetFormat.sampleRate);
    }

    return buffer;
  }
}

// Streaming Recognition Session
class StreamingRecognitionSession {
  private provider: SpeechRecognitionProvider;
  private config: StreamingConfig;
  private stream: RecognitionStream;

  constructor(provider: SpeechRecognitionProvider, config: StreamingConfig) {
    this.provider = provider;
    this.config = config;
    this.stream = this.provider.createStream(config);
  }

  write(audioChunk: Buffer): void {
    this.stream.write(audioChunk);
  }

  onPartialResult(callback: (result: PartialTranscription) => void): void {
    this.stream.on('partial', callback);
  }

  onFinalResult(callback: (result: TranscriptionResult) => void): void {
    this.stream.on('final', callback);
  }

  onError(callback: (error: Error) => void): void {
    this.stream.on('error', callback);
  }

  end(): Promise<TranscriptionResult> {
    return new Promise((resolve, reject) => {
      this.stream.on('final', resolve);
      this.stream.on('error', reject);
      this.stream.end();
    });
  }
}
```

### Voice Activity Detection

```typescript
// Voice Activity Detection Implementation
class VoiceActivityDetector {
  private config: VADConfig;
  private model: VADModel;

  async detectSpeech(audio: AudioInput): Promise<SpeechSegment[]> {
    const audioBuffer = await this.loadAudio(audio);
    const frames = this.splitIntoFrames(audioBuffer);

    const segments: SpeechSegment[] = [];
    let currentSegment: SpeechSegment | null = null;

    for (let i = 0; i < frames.length; i++) {
      const isSpeech = await this.classifyFrame(frames[i]);
      const timestamp = i * this.config.frameSize / this.config.sampleRate;

      if (isSpeech && !currentSegment) {
        currentSegment = { startTime: timestamp, endTime: timestamp };
      } else if (!isSpeech && currentSegment) {
        currentSegment.endTime = timestamp;
        if (currentSegment.endTime - currentSegment.startTime >= this.config.minSpeechDuration) {
          segments.push(currentSegment);
        }
        currentSegment = null;
      } else if (isSpeech && currentSegment) {
        currentSegment.endTime = timestamp;
      }
    }

    // Handle final segment
    if (currentSegment) {
      segments.push(currentSegment);
    }

    return this.mergeCloseSegments(segments);
  }

  createStreamingVAD(): StreamingVAD {
    return new StreamingVAD(this.config, this.model);
  }

  private async classifyFrame(frame: Float32Array): Promise<boolean> {
    const energy = this.calculateEnergy(frame);
    const zeroCrossings = this.calculateZeroCrossings(frame);

    // Use ML model for more accurate detection
    const prediction = await this.model.predict(frame);

    return prediction > this.config.threshold &&
           energy > this.config.energyThreshold;
  }

  private mergeCloseSegments(segments: SpeechSegment[]): SpeechSegment[] {
    if (segments.length <= 1) return segments;

    const merged: SpeechSegment[] = [segments[0]];

    for (let i = 1; i < segments.length; i++) {
      const last = merged[merged.length - 1];
      const current = segments[i];

      if (current.startTime - last.endTime < this.config.mergeThreshold) {
        last.endTime = current.endTime;
      } else {
        merged.push(current);
      }
    }

    return merged;
  }
}

// Streaming VAD
class StreamingVAD {
  private buffer: Float32Array[] = [];
  private isSpeaking: boolean = false;
  private silenceFrames: number = 0;

  onSpeechStart(callback: () => void): void {
    this.speechStartCallback = callback;
  }

  onSpeechEnd(callback: (audio: Buffer) => void): void {
    this.speechEndCallback = callback;
  }

  processChunk(chunk: Buffer): void {
    const frame = this.bufferToFloat32(chunk);
    const isSpeech = this.detectSpeechInFrame(frame);

    if (isSpeech && !this.isSpeaking) {
      this.isSpeaking = true;
      this.speechStartCallback?.();
    }

    if (this.isSpeaking) {
      this.buffer.push(frame);

      if (!isSpeech) {
        this.silenceFrames++;
        if (this.silenceFrames >= this.config.silenceThreshold) {
          this.isSpeaking = false;
          this.silenceFrames = 0;
          const audio = this.combineBuffer();
          this.buffer = [];
          this.speechEndCallback?.(audio);
        }
      } else {
        this.silenceFrames = 0;
      }
    }
  }
}
```

### Natural Language Understanding

```typescript
// Natural Language Understanding Implementation
class NaturalLanguageProcessor {
  private intentClassifier: IntentClassifier;
  private entityExtractor: EntityExtractor;
  private contextManager: ContextManager;

  async processQuery(
    transcription: string,
    context?: ConversationContext
  ): Promise<ProcessedQuery> {
    // Normalize transcription
    const normalized = this.normalizeText(transcription);

    // Classify intent
    const intent = await this.intentClassifier.classify(normalized, context);

    // Extract entities
    const entities = await this.entityExtractor.extract(normalized, intent);

    // Resolve references using context
    const resolvedEntities = context
      ? await this.resolveReferences(entities, context)
      : entities;

    // Generate search query
    const searchQuery = this.generateSearchQuery(normalized, intent, resolvedEntities);

    return {
      originalText: transcription,
      normalizedText: normalized,
      intent,
      entities: resolvedEntities,
      searchQuery
    };
  }

  private normalizeText(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private async resolveReferences(
    entities: ExtractedEntity[],
    context: ConversationContext
  ): Promise<ExtractedEntity[]> {
    return entities.map(entity => {
      if (entity.type === 'reference') {
        const resolved = this.findReferent(entity.value, context);
        if (resolved) {
          return { ...entity, value: resolved.value, resolvedFrom: entity.value };
        }
      }
      return entity;
    });
  }

  private generateSearchQuery(
    text: string,
    intent: QueryIntent,
    entities: ExtractedEntity[]
  ): string {
    // Build search query based on intent and entities
    let query = text;

    // Add entity-specific query modifications
    for (const entity of entities) {
      if (entity.type === 'filter') {
        query = `${query} ${entity.field}:${entity.value}`;
      }
    }

    return query;
  }
}

// Intent Classifier
class IntentClassifier {
  private model: ClassificationModel;

  async classify(
    text: string,
    context?: ConversationContext
  ): Promise<QueryIntent> {
    const features = this.extractFeatures(text, context);
    const predictions = await this.model.predict(features);

    const topIntent = this.getTopPrediction(predictions);

    return {
      type: topIntent.intent,
      confidence: topIntent.confidence,
      modifiers: this.extractModifiers(text)
    };
  }

  private extractModifiers(text: string): IntentModifier[] {
    const modifiers: IntentModifier[] = [];

    // Check for sorting modifiers
    if (text.includes('best') || text.includes('top')) {
      modifiers.push({ type: 'sort', value: 'rating', order: 'desc' });
    }

    // Check for location modifiers
    if (text.includes('nearby') || text.includes('near me')) {
      modifiers.push({ type: 'location', value: 'current' });
    }

    // Check for time modifiers
    if (text.includes('now') || text.includes('open')) {
      modifiers.push({ type: 'time', value: 'current' });
    }

    return modifiers;
  }
}
```

### Conversation Manager

```typescript
// Conversation Manager Implementation
class ConversationManager {
  private sessions: Map<string, ConversationSession> = new Map();

  async startConversation(userId: string): Promise<ConversationSession> {
    const sessionId = this.generateSessionId();
    const session = new ConversationSession(sessionId, userId);

    this.sessions.set(sessionId, session);
    return session;
  }

  async processConversationalQuery(
    sessionId: string,
    query: ProcessedQuery
  ): Promise<ConversationalResult> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    // Add query to conversation history
    session.addTurn({
      type: 'user',
      query,
      timestamp: new Date()
    });

    // Resolve references from context
    const resolvedQuery = await this.resolveContextualReferences(query, session);

    // Execute search
    const results = await this.executeSearch(resolvedQuery);

    // Add response to history
    session.addTurn({
      type: 'system',
      results,
      timestamp: new Date()
    });

    return {
      results,
      context: session.getContext(),
      suggestedFollowUps: this.generateFollowUps(results, session)
    };
  }

  private async resolveContextualReferences(
    query: ProcessedQuery,
    session: ConversationSession
  ): Promise<ProcessedQuery> {
    const context = session.getContext();

    // Handle pronouns and references
    let resolvedText = query.normalizedText;

    // "them", "those", "these" -> previous results
    if (/\b(them|those|these|they)\b/.test(resolvedText)) {
      const previousResults = context.lastResults;
      if (previousResults) {
        resolvedText = resolvedText.replace(
          /\b(them|those|these|they)\b/,
          previousResults.category || 'items'
        );
      }
    }

    // "it", "that", "this" -> specific previous item
    if (/\b(it|that|this)\b/.test(resolvedText)) {
      const focusedItem = context.focusedItem;
      if (focusedItem) {
        resolvedText = resolvedText.replace(
          /\b(it|that|this)\b/,
          focusedItem.name
        );
      }
    }

    return {
      ...query,
      normalizedText: resolvedText,
      searchQuery: resolvedText
    };
  }

  private generateFollowUps(
    results: SearchResult[],
    session: ConversationSession
  ): string[] {
    const followUps: string[] = [];

    if (results.length > 0) {
      followUps.push('Tell me more about the first one');
      followUps.push('Show me similar options');

      if (results[0].metadata?.hasReviews) {
        followUps.push('What are the reviews like?');
      }
    }

    return followUps;
  }
}

// Conversation Session
class ConversationSession {
  private history: ConversationTurn[] = [];
  private context: ConversationContext;

  constructor(
    public readonly sessionId: string,
    public readonly userId: string
  ) {
    this.context = {
      entities: new Map(),
      lastResults: null,
      focusedItem: null
    };
  }

  addTurn(turn: ConversationTurn): void {
    this.history.push(turn);
    this.updateContext(turn);
  }

  getContext(): ConversationContext {
    return this.context;
  }

  private updateContext(turn: ConversationTurn): void {
    if (turn.type === 'user' && turn.query) {
      // Update entities from query
      for (const entity of turn.query.entities) {
        this.context.entities.set(entity.type, entity);
      }
    }

    if (turn.type === 'system' && turn.results) {
      this.context.lastResults = {
        items: turn.results,
        category: turn.results[0]?.category
      };

      if (turn.results.length === 1) {
        this.context.focusedItem = turn.results[0];
      }
    }
  }
}
```

## Configuration

### Voice Search Configuration

```yaml
# voice-search-config.yml
voice_search:
  speech_recognition:
    provider: "google"
    language: "en-US"
    alternative_languages: ["es-ES", "fr-FR"]
    model: "latest_long"
    enable_punctuation: true
    enable_word_timestamps: true
    profanity_filter: true
    max_alternatives: 3

  voice_activity_detection:
    enabled: true
    sensitivity: 0.5
    min_speech_duration_ms: 250
    silence_threshold_ms: 500
    energy_threshold: 0.01

  streaming:
    enabled: true
    interim_results: true
    single_utterance: false
    chunk_size_ms: 100

  natural_language:
    intent_model: "voice-search-intent-v2"
    entity_extraction: true
    context_window: 5

  conversation:
    enabled: true
    session_timeout_minutes: 30
    max_turns: 20
    enable_follow_ups: true

  performance:
    timeout_ms: 10000
    max_audio_duration_seconds: 60
    cache_transcriptions: true
```

## Integration Points

### Speech Provider Integration

```typescript
// Google Speech-to-Text Integration
class GoogleSpeechProvider implements SpeechRecognitionProvider {
  private client: SpeechClient;

  async recognize(audio: ProcessedAudio, config: SpeechConfig): Promise<RecognitionResult> {
    const request = {
      audio: { content: audio.buffer.toString('base64') },
      config: {
        encoding: this.mapEncoding(audio.format.encoding),
        sampleRateHertz: audio.format.sampleRate,
        languageCode: config.language,
        enableAutomaticPunctuation: config.enablePunctuation,
        enableWordTimeOffsets: true,
        model: config.model
      }
    };

    const [response] = await this.client.recognize(request);
    return this.mapResponse(response);
  }

  createStream(config: StreamingConfig): RecognitionStream {
    return this.client.streamingRecognize({
      config: {
        encoding: 'LINEAR16',
        sampleRateHertz: config.sampleRate,
        languageCode: config.language
      },
      interimResults: config.interimResults
    });
  }
}

// AWS Transcribe Integration
class AWSTranscribeProvider implements SpeechRecognitionProvider {
  private client: TranscribeStreamingClient;

  async recognize(audio: ProcessedAudio, config: SpeechConfig): Promise<RecognitionResult> {
    const command = new StartStreamTranscriptionCommand({
      LanguageCode: config.language,
      MediaEncoding: this.mapEncoding(audio.format.encoding),
      MediaSampleRateHertz: audio.format.sampleRate,
      AudioStream: this.createAudioStream(audio.buffer)
    });

    const response = await this.client.send(command);
    return this.mapResponse(response);
  }
}
```

## Security Considerations

### Audio Data Protection

```typescript
class VoiceSearchSecurityManager {
  async validateAudioInput(audio: AudioInput): Promise<ValidationResult> {
    const errors: string[] = [];

    // Check audio duration
    const duration = await this.getAudioDuration(audio);
    if (duration > this.config.maxDuration) {
      errors.push('Audio duration exceeds maximum allowed');
    }

    // Validate format
    const format = await this.detectFormat(audio);
    if (!this.config.allowedFormats.includes(format)) {
      errors.push(`Audio format ${format} is not supported`);
    }

    return { valid: errors.length === 0, errors };
  }

  async sanitizeTranscription(transcription: string): Promise<string> {
    // Remove potential PII
    let sanitized = this.removePII(transcription);

    // Apply profanity filter if enabled
    if (this.config.profanityFilter) {
      sanitized = this.filterProfanity(sanitized);
    }

    return sanitized;
  }

  private removePII(text: string): string {
    // Remove phone numbers
    text = text.replace(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, '[PHONE]');

    // Remove email addresses
    text = text.replace(/\b[\w.-]+@[\w.-]+\.\w+\b/g, '[EMAIL]');

    // Remove SSN patterns
    text = text.replace(/\b\d{3}[-]?\d{2}[-]?\d{4}\b/g, '[SSN]');

    return text;
  }
}
```

## Testing Considerations

### Voice Search Testing

```typescript
describe('Voice Search', () => {
  it('should transcribe audio accurately', async () => {
    const result = await voiceSearch.transcribe(testAudio);

    expect(result.text).toBeDefined();
    expect(result.confidence).toBeGreaterThan(0.8);
  });

  it('should detect speech segments', async () => {
    const segments = await vad.detectSpeech(testAudio);

    expect(segments.length).toBeGreaterThan(0);
    expect(segments[0].startTime).toBeDefined();
    expect(segments[0].endTime).toBeGreaterThan(segments[0].startTime);
  });

  it('should process voice queries with intent detection', async () => {
    const transcription = 'Find Italian restaurants nearby';
    const processed = await nlp.processQuery(transcription);

    expect(processed.intent.type).toBe('search');
    expect(processed.entities).toContainEqual(
      expect.objectContaining({ type: 'cuisine', value: 'italian' })
    );
  });

  it('should handle conversational context', async () => {
    const session = await conversationManager.startConversation('user-123');

    await session.query('Find coffee shops');
    const result = await session.query('Which ones are open now?');

    // Should understand "ones" refers to coffee shops
    expect(result.searchQuery).toContain('coffee');
    expect(result.searchQuery).toContain('open');
  });

  it('should handle streaming recognition', async () => {
    const results: string[] = [];

    const session = voiceSearch.createStreamingSession({
      onPartialResult: (partial) => results.push(partial.text),
      onFinalResult: (final) => results.push(final.text)
    });

    await streamAudioChunks(session, testAudioChunks);

    expect(results.length).toBeGreaterThan(0);
  });
});
```
