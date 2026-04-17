# LLM Integration Patterns

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
Comprehensive patterns for integrating Large Language Models into applications, including API management, prompt engineering, context handling, and production deployment strategies.

## Implementation Patterns

### Pattern 1: Prompt Templating with Safety Checks
Generate prompts from templates with validation.

**Implementation**:
1. Define prompt template with [placeholders]
2. Validate all required placeholders provided
3. Validate placeholder values (no injection risk)
4. Render template with validated values
5. Add system prompt + safety constraints
6. Send to LLM
7. Validate response format

### Pattern 2: Response Parsing and Validation
Safely extract structured data from LLM responses.

**Implementation**:
1. Request response in specific format (JSON, XML, code blocks)
2. Capture response
3. Try to parse format
4. If parse fails, re-request with format example
5. Validate parsed data against schema
6. If validation fails, re-request with validation rules
7. Return validated result or error

### Pattern 3: Cost and Rate Limiting
Manage API costs and rate limits for LLM calls.

**Implementation**:
1. Track API cost (tokens * rate)
2. Implement circuit breaker (abort if cost > budget)
3. Batch similar requests to reduce calls
4. Cache responses for identical inputs
5. Implement exponential backoff on rate limit
6. Log cost per operation
7. Alert if cost trending high

## Context
Modern applications increasingly leverage LLMs for natural language understanding, generation, and reasoning. This module provides battle-tested patterns for reliable, cost-effective LLM integration.

## Core Integration Patterns

### 1. API Client Architecture

```typescript
// Unified LLM client with provider abstraction
interface LLMProvider {
  name: string;
  generateCompletion(request: CompletionRequest): Promise<CompletionResponse>;
  generateStream(request: CompletionRequest): AsyncIterator<StreamChunk>;
  estimateTokens(text: string): number;
  getModelCapabilities(): ModelCapabilities;
}

interface CompletionRequest {
  model: string;
  messages: Message[];
  temperature?: number;
  maxTokens?: number;
  stopSequences?: string[];
  systemPrompt?: string;
}

// Multi-provider support with fallback
class LLMClient {
  private providers: Map<string, LLMProvider>;
  private fallbackChain: string[];
  
  async complete(request: CompletionRequest): Promise<CompletionResponse> {
    for (const providerName of this.fallbackChain) {
      try {
        const provider = this.providers.get(providerName);
        return await provider.generateCompletion(request);
      } catch (error) {
        if (this.isRetryable(error)) continue;
        throw error;
      }
    }
    throw new Error('All providers failed');
  }
}
```

### 2. Prompt Engineering System

```typescript
// Structured prompt templates with validation
interface PromptTemplate {
  id: string;
  version: string;
  template: string;
  variables: PromptVariable[];
  examples: PromptExample[];
  validationRules: ValidationRule[];
}

class PromptManager {
  private templates: Map<string, PromptTemplate>;
  private cache: PromptCache;
  
  async render(templateId: string, variables: Record<string, any>): Promise<string> {
    const template = this.templates.get(templateId);
    this.validateVariables(template, variables);
    
    // Apply few-shot examples
    const examples = this.selectExamples(template, variables);
    
    // Render with context optimization
    return this.optimizeForTokens(
      this.interpolate(template.template, variables, examples)
    );
  }
  
  private selectExamples(template: PromptTemplate, context: any): PromptExample[] {
    // Semantic similarity-based example selection
    return template.examples
      .map(ex => ({ example: ex, score: this.similarity(ex, context) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(x => x.example);
  }
}
```

### 3. Context Window Management

```typescript
// Intelligent context truncation and summarization
class ContextManager {
  private maxTokens: number;
  private reservedTokens: number; // For response
  
  async optimizeContext(messages: Message[]): Promise<Message[]> {
    const totalTokens = this.estimateTokens(messages);
    
    if (totalTokens <= this.maxTokens - this.reservedTokens) {
      return messages;
    }
    
    // Strategy 1: Summarize old messages
    const summarized = await this.summarizeOldMessages(messages);
    
    // Strategy 2: Remove least relevant messages
    const pruned = this.pruneByRelevance(summarized);
    
    // Strategy 3: Compress with semantic preservation
    return this.semanticCompress(pruned);
  }
  
  private async summarizeOldMessages(messages: Message[]): Promise<Message[]> {
    const cutoff = messages.length - 10; // Keep last 10 messages
    if (cutoff <= 0) return messages;
    
    const toSummarize = messages.slice(0, cutoff);
    const summary = await this.llm.complete({
      model: 'fast-model',
      messages: [{
        role: 'system',
        content: 'Summarize this conversation concisely, preserving key facts and decisions.'
      }, {
        role: 'user',
        content: JSON.stringify(toSummarize)
      }]
    });
    
    return [
      { role: 'system', content: `Previous conversation summary: ${summary}` },
      ...messages.slice(cutoff)
    ];
  }
}
```

### 4. Response Validation and Safety

```typescript
// Multi-layer output validation
class ResponseValidator {
  async validate(response: string, context: ValidationContext): Promise<ValidationResult> {
    const checks = await Promise.all([
      this.checkContentSafety(response),
      this.checkFactualAccuracy(response, context),
      this.checkFormatCompliance(response, context.expectedFormat),
      this.checkBusinessRules(response, context.rules)
    ]);
    
    return {
      isValid: checks.every(c => c.passed),
      issues: checks.flatMap(c => c.issues),
      confidence: this.calculateConfidence(checks)
    };
  }
  
  private async checkContentSafety(text: string): Promise<CheckResult> {
    // Content moderation API
    const moderation = await this.moderationAPI.check(text);
    
    return {
      passed: !moderation.flagged,
      issues: moderation.categories.filter(c => c.flagged)
    };
  }
  
  private async checkFactualAccuracy(text: string, context: any): Promise<CheckResult> {
    // Extract claims and verify against knowledge base
    const claims = await this.extractClaims(text);
    const verifications = await Promise.all(
      claims.map(claim => this.verifyAgainstKB(claim, context))
    );
    
    return {
      passed: verifications.every(v => v.confidence > 0.7),
      issues: verifications.filter(v => v.confidence < 0.7)
    };
  }
}
```

## Advanced Patterns

### 5. Semantic Caching

```typescript
// Cache responses based on semantic similarity
class SemanticCache {
  private vectorStore: VectorStore;
  private similarityThreshold = 0.95;
  
  async get(prompt: string): Promise<string | null> {
    const embedding = await this.embed(prompt);
    const similar = await this.vectorStore.search(embedding, 1);
    
    if (similar[0]?.score >= this.similarityThreshold) {
      return similar[0].response;
    }
    
    return null;
  }
  
  async set(prompt: string, response: string): Promise<void> {
    const embedding = await this.embed(prompt);
    await this.vectorStore.insert({
      embedding,
      prompt,
      response,
      timestamp: Date.now()
    });
  }
}
```

### 6. Streaming Response Handler

```typescript
// Handle streaming responses with backpressure
class StreamingHandler {
  async *handleStream(
    stream: AsyncIterator<StreamChunk>,
    options: StreamOptions
  ): AsyncIterator<ProcessedChunk> {
    const buffer = new TokenBuffer(options.bufferSize);
    
    for await (const chunk of stream) {
      buffer.add(chunk);
      
      // Yield complete sentences/thoughts
      while (buffer.hasCompleteSentence()) {
        const sentence = buffer.extractSentence();
        
        // Validate incrementally
        if (await this.validateChunk(sentence, options)) {
          yield {
            content: sentence,
            metadata: this.extractMetadata(sentence)
          };
        }
      }
    }
    
    // Flush remaining buffer
    if (buffer.hasContent()) {
      yield { content: buffer.flush(), metadata: {} };
    }
  }
}
```

### 7. Cost Optimization

```typescript
// Intelligent model selection and cost tracking
class CostOptimizer {
  private modelCosts: Map<string, ModelCost>;
  private budget: Budget;
  
  selectModel(request: CompletionRequest): string {
    const candidates = this.getEligibleModels(request);
    
    // Score by cost-performance ratio
    const scored = candidates.map(model => ({
      model,
      score: this.scoreModel(model, request)
    }));
    
    // Select best within budget
    return scored
      .filter(s => this.fitsInBudget(s.model, request))
      .sort((a, b) => b.score - a.score)[0]?.model || 'fallback-model';
  }
  
  private scoreModel(model: string, request: CompletionRequest): number {
    const cost = this.estimateCost(model, request);
    const quality = this.modelQuality.get(model);
    const latency = this.modelLatency.get(model);
    
    // Multi-objective optimization
    return (quality / cost) * (1 / latency);
  }
  
  async trackUsage(model: string, tokens: number): Promise<void> {
    const cost = this.calculateCost(model, tokens);
    await this.budget.deduct(cost);
    
    if (this.budget.remaining < this.budget.threshold) {
      await this.notifyBudgetAlert();
    }
  }
}
```

## Production Deployment

### 8. Rate Limiting and Throttling

```typescript
// Adaptive rate limiting with burst handling
class RateLimiter {
  private tokenBucket: TokenBucket;
  private requestQueue: PriorityQueue<Request>;
  
  async execute<T>(
    request: () => Promise<T>,
    priority: number = 0
  ): Promise<T> {
    // Check if we can execute immediately
    if (this.tokenBucket.tryConsume(1)) {
      return await request();
    }
    
    // Queue with priority
    return new Promise((resolve, reject) => {
      this.requestQueue.enqueue({
        execute: request,
        resolve,
        reject,
        priority
      });
    });
  }
  
  private async processQueue(): Promise<void> {
    while (this.requestQueue.size > 0) {
      await this.tokenBucket.waitForToken();
      
      const request = this.requestQueue.dequeue();
      try {
        const result = await request.execute();
        request.resolve(result);
      } catch (error) {
        request.reject(error);
      }
    }
  }
}
```

### 9. Monitoring and Observability

```typescript
// Comprehensive LLM observability
class LLMObservability {
  async trackRequest(request: CompletionRequest, response: CompletionResponse): Promise<void> {
    const metrics = {
      model: request.model,
      promptTokens: response.usage.promptTokens,
      completionTokens: response.usage.completionTokens,
      totalTokens: response.usage.totalTokens,
      latency: response.latency,
      cost: this.calculateCost(request.model, response.usage.totalTokens),
      timestamp: Date.now()
    };
    
    // Send to monitoring system
    await this.metricsCollector.record(metrics);
    
    // Check for anomalies
    if (this.detectAnomaly(metrics)) {
      await this.alerting.notify({
        type: 'llm_anomaly',
        metrics,
        severity: 'warning'
      });
    }
  }
  
  async generateDashboard(): Promise<Dashboard> {
    const stats = await this.metricsCollector.aggregate({
      timeRange: '24h',
      groupBy: ['model', 'endpoint']
    });
    
    return {
      totalRequests: stats.count,
      totalCost: stats.sum('cost'),
      avgLatency: stats.avg('latency'),
      p95Latency: stats.percentile('latency', 95),
      errorRate: stats.errorRate,
      topModels: stats.topN('model', 5)
    };
  }
}
```

## Integration with COVE

Apply COVE verification to LLM outputs:

```typescript
class COVEIntegratedLLM {
  async generateWithVerification(request: CompletionRequest): Promise<VerifiedResponse> {
    // Step 1: Generate initial response
    const draft = await this.llm.complete(request);
    
    // Step 2: Generate verification questions
    const questions = await this.generateVerificationQuestions(draft, request);
    
    // Step 3: Answer questions independently
    const answers = await this.answerVerificationQuestions(questions);
    
    // Step 4: Synthesize verified response
    return await this.synthesizeVerifiedResponse(draft, answers);
  }
}
```

## Best Practices

1. **Always use fallback providers** for reliability
2. **Implement semantic caching** to reduce costs by 60-80%
3. **Validate all outputs** before using in production
4. **Monitor token usage** and set budget alerts
5. **Use streaming** for better user experience
6. **Implement rate limiting** to prevent quota exhaustion
7. **Track all metrics** for optimization and debugging
8. **Version your prompts** for reproducibility
9. **Test with multiple models** to find optimal cost/quality balance
10. **Apply COVE** for critical use cases requiring high accuracy

## Related Modules

- `ai-native/prompt-engineering.md` - Advanced prompt techniques
- `ai-native/context-management.md` - Context window optimization
- `security/ai-security.md` - LLM security patterns
- `performance/ai-optimization.md` - Performance tuning

## Examples

See `examples/llm-integration/` for complete implementations:
- Multi-provider chat application
- Document Q&A with RAG
- Code generation assistant
- Content moderation system
