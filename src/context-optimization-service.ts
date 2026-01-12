/**
 * Context Optimization Service
 * 
 * Optimizes generated content for token efficiency while maintaining completeness.
 * Implements content chunking, redundancy minimization, and token usage validation.
 * 
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5
 */

export interface ContentChunk {
  id: string;
  content: string;
  tokenCount: number;
  order: number;
  dependencies: string[];
  isComplete: boolean;
}

export interface ExternalReference {
  type: 'file' | 'url' | 'specification';
  path: string;
  description: string;
  tokensSaved: number;
}

export interface OptimizedPrompt {
  content: string;
  tokenCount: number;
  chunks: ContentChunk[];
  references: ExternalReference[];
  optimizationApplied: string[];
  compressionRatio: number;
}

export interface TokenUsage {
  totalTokens: number;
  contentTokens: number;
  metadataTokens: number;
  withinBudget: boolean;
  utilizationPercentage: number;
}

export interface OptimizationResult {
  originalTokens: number;
  optimizedTokens: number;
  tokensSaved: number;
  compressionRatio: number;
  optimizationsApplied: string[];
}

export interface RedundancyAnalysis {
  duplicatePatterns: string[];
  redundantSections: string[];
  potentialSavings: number;
}

const DEFAULT_TOKEN_BUDGET = 4000;
const CHARS_PER_TOKEN = 4;

export class ContextOptimizationService {
  private tokenBudget: number;

  constructor(tokenBudget: number = DEFAULT_TOKEN_BUDGET) {
    this.tokenBudget = tokenBudget;
  }

  /**
   * Optimize a prompt for token efficiency
   */
  optimizePrompt(prompt: string, tokenLimit: number = this.tokenBudget): OptimizedPrompt {
    const originalTokens = this.estimateTokens(prompt);
    const optimizationsApplied: string[] = [];
    let optimizedContent = prompt;

    // Apply optimizations
    optimizedContent = this.removeRedundancy(optimizedContent);
    optimizationsApplied.push('redundancy-removal');

    optimizedContent = this.compressWhitespace(optimizedContent);
    optimizationsApplied.push('whitespace-compression');

    optimizedContent = this.abbreviateCommonPatterns(optimizedContent);
    optimizationsApplied.push('pattern-abbreviation');

    // Extract references for large content
    const references = this.extractReferences(optimizedContent);
    if (references.length > 0) {
      optimizationsApplied.push('reference-extraction');
    }

    // Chunk if still over limit
    const chunks = this.chunkContent(optimizedContent, tokenLimit);
    if (chunks.length > 1) {
      optimizationsApplied.push('content-chunking');
    }

    const optimizedTokens = this.estimateTokens(optimizedContent);
    const compressionRatio = originalTokens > 0 ? optimizedTokens / originalTokens : 1;

    return {
      content: optimizedContent,
      tokenCount: optimizedTokens,
      chunks,
      references,
      optimizationApplied: optimizationsApplied,
      compressionRatio
    };
  }

  /**
   * Chunk large content into smaller pieces
   */
  chunkLargeContent(content: string, maxTokensPerChunk: number = this.tokenBudget): ContentChunk[] {
    return this.chunkContent(content, maxTokensPerChunk);
  }

  /**
   * Minimize redundancy in content
   */
  minimizeRedundancy(content: string): string {
    return this.removeRedundancy(content);
  }

  /**
   * Validate token usage against budget
   */
  validateTokenUsage(content: string, budget: number = this.tokenBudget): TokenUsage {
    const totalTokens = this.estimateTokens(content);
    
    // Estimate metadata overhead (headers, formatting, etc.)
    const metadataTokens = this.estimateMetadataTokens(content);
    const contentTokens = totalTokens - metadataTokens;

    return {
      totalTokens,
      contentTokens,
      metadataTokens,
      withinBudget: totalTokens <= budget,
      utilizationPercentage: (totalTokens / budget) * 100
    };
  }

  /**
   * Analyze content for redundancy
   */
  analyzeRedundancy(content: string): RedundancyAnalysis {
    const duplicatePatterns = this.findDuplicatePatterns(content);
    const redundantSections = this.findRedundantSections(content);
    const potentialSavings = this.calculatePotentialSavings(duplicatePatterns, redundantSections);

    return {
      duplicatePatterns,
      redundantSections,
      potentialSavings
    };
  }

  /**
   * Get the token budget
   */
  getTokenBudget(): number {
    return this.tokenBudget;
  }

  /**
   * Set the token budget
   */
  setTokenBudget(budget: number): void {
    this.tokenBudget = Math.max(budget, 100);
  }

  /**
   * Estimate tokens for content
   */
  estimateTokens(content: string): number {
    return Math.ceil(content.length / CHARS_PER_TOKEN);
  }

  // Private methods

  private removeRedundancy(content: string): string {
    let result = content;

    // Remove duplicate blank lines
    result = result.replace(/\n{3,}/g, '\n\n');

    // Remove duplicate sentences
    const sentences = result.split(/(?<=[.!?])\s+/);
    const uniqueSentences = [...new Set(sentences)];
    result = uniqueSentences.join(' ');

    // Remove repeated phrases (3+ words repeated)
    const phrases = this.findRepeatedPhrases(result);
    for (const phrase of phrases) {
      const regex = new RegExp(`(${this.escapeRegex(phrase)}\\s*){2,}`, 'gi');
      result = result.replace(regex, phrase + ' ');
    }

    return result;
  }

  private compressWhitespace(content: string): string {
    return content
      .replace(/[ \t]+/g, ' ')  // Multiple spaces/tabs to single space
      .replace(/\n[ \t]+/g, '\n')  // Leading whitespace on lines
      .replace(/[ \t]+\n/g, '\n')  // Trailing whitespace on lines
      .trim();
  }

  private abbreviateCommonPatterns(content: string): string {
    let result = content;

    // Common abbreviations that save tokens
    const abbreviations: [RegExp, string][] = [
      [/implementation/gi, 'impl'],
      [/configuration/gi, 'config'],
      [/documentation/gi, 'docs'],
      [/specification/gi, 'spec'],
      [/requirements/gi, 'reqs'],
      [/dependencies/gi, 'deps'],
      [/authentication/gi, 'auth'],
      [/authorization/gi, 'authz'],
      [/application/gi, 'app'],
      [/development/gi, 'dev'],
      [/production/gi, 'prod'],
      [/environment/gi, 'env']
    ];

    // Only apply abbreviations in code/technical sections
    // to preserve readability in prose
    const technicalSections = result.match(/```[\s\S]*?```|`[^`]+`/g) || [];
    
    for (const section of technicalSections) {
      let abbreviated = section;
      for (const [pattern, replacement] of abbreviations) {
        abbreviated = abbreviated.replace(pattern, replacement);
      }
      result = result.replace(section, abbreviated);
    }

    return result;
  }

  private extractReferences(content: string): ExternalReference[] {
    const references: ExternalReference[] = [];

    // Find file references
    const fileMatches = content.match(/(?:file|path):\s*([^\s,\n]+)/gi) || [];
    for (const match of fileMatches) {
      const path = match.replace(/(?:file|path):\s*/i, '');
      references.push({
        type: 'file',
        path,
        description: `Referenced file: ${path}`,
        tokensSaved: this.estimateTokens(path)
      });
    }

    // Find URL references
    const urlMatches = content.match(/https?:\/\/[^\s)]+/g) || [];
    for (const url of urlMatches) {
      references.push({
        type: 'url',
        path: url,
        description: `External URL reference`,
        tokensSaved: this.estimateTokens(url)
      });
    }

    return references;
  }

  private chunkContent(content: string, maxTokens: number): ContentChunk[] {
    const totalTokens = this.estimateTokens(content);
    
    if (totalTokens <= maxTokens) {
      return [{
        id: 'chunk-1',
        content,
        tokenCount: totalTokens,
        order: 1,
        dependencies: [],
        isComplete: true
      }];
    }

    const chunks: ContentChunk[] = [];
    const lines = content.split('\n');
    let currentChunk = '';
    let chunkIndex = 0;

    for (const line of lines) {
      const potentialChunk = currentChunk + (currentChunk ? '\n' : '') + line;
      const potentialTokens = this.estimateTokens(potentialChunk);

      if (potentialTokens > maxTokens && currentChunk) {
        // Save current chunk
        chunks.push({
          id: `chunk-${chunkIndex + 1}`,
          content: currentChunk,
          tokenCount: this.estimateTokens(currentChunk),
          order: chunkIndex + 1,
          dependencies: chunkIndex > 0 ? [`chunk-${chunkIndex}`] : [],
          isComplete: false
        });
        chunkIndex++;
        currentChunk = line;
      } else {
        currentChunk = potentialChunk;
      }
    }

    // Add final chunk
    if (currentChunk) {
      chunks.push({
        id: `chunk-${chunkIndex + 1}`,
        content: currentChunk,
        tokenCount: this.estimateTokens(currentChunk),
        order: chunkIndex + 1,
        dependencies: chunkIndex > 0 ? [`chunk-${chunkIndex}`] : [],
        isComplete: true
      });
    }

    return chunks;
  }

  private estimateMetadataTokens(content: string): number {
    // Count markdown headers, code blocks, lists as metadata
    const headers = (content.match(/^#+\s/gm) || []).length;
    const codeBlocks = (content.match(/```/g) || []).length / 2;
    const listItems = (content.match(/^[-*]\s/gm) || []).length;

    return Math.ceil((headers * 5) + (codeBlocks * 10) + (listItems * 2));
  }

  private findDuplicatePatterns(content: string): string[] {
    const patterns: string[] = [];
    const words = content.split(/\s+/);
    
    // Find 3-word patterns that repeat
    for (let i = 0; i < words.length - 2; i++) {
      const pattern = `${words[i]} ${words[i + 1]} ${words[i + 2]}`;
      const count = (content.match(new RegExp(this.escapeRegex(pattern), 'gi')) || []).length;
      if (count > 1 && !patterns.includes(pattern)) {
        patterns.push(pattern);
      }
    }

    return patterns.slice(0, 10); // Limit to top 10
  }

  private findRedundantSections(content: string): string[] {
    const sections: string[] = [];
    
    // Find sections that are very similar
    const paragraphs = content.split(/\n\n+/);
    for (let i = 0; i < paragraphs.length; i++) {
      for (let j = i + 1; j < paragraphs.length; j++) {
        if (this.similarity(paragraphs[i], paragraphs[j]) > 0.8) {
          sections.push(paragraphs[j]);
        }
      }
    }

    return sections;
  }

  private calculatePotentialSavings(patterns: string[], sections: string[]): number {
    let savings = 0;
    
    for (const pattern of patterns) {
      savings += this.estimateTokens(pattern);
    }
    
    for (const section of sections) {
      savings += this.estimateTokens(section);
    }

    return savings;
  }

  private findRepeatedPhrases(content: string): string[] {
    const phrases: string[] = [];
    const words = content.split(/\s+/);
    
    for (let len = 3; len <= 5; len++) {
      for (let i = 0; i <= words.length - len; i++) {
        const phrase = words.slice(i, i + len).join(' ');
        const count = (content.match(new RegExp(this.escapeRegex(phrase), 'gi')) || []).length;
        if (count > 1 && !phrases.includes(phrase)) {
          phrases.push(phrase);
        }
      }
    }

    return phrases;
  }

  private similarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  private levenshteinDistance(str1: string, str2: string): number {
    const m = str1.length;
    const n = str2.length;
    const dp: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));

    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (str1[i - 1] === str2[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1];
        } else {
          dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
        }
      }
    }

    return dp[m][n];
  }

  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}
