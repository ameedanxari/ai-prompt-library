# Template Composition Optimization

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

This template provides comprehensive patterns for optimizing template selection, eliminating redundancy, improving composition performance, and ensuring efficient template assembly across the AI Prompt Library.

## Instructions

1. **Analyze Template Set**: Identify redundant and overlapping templates
2. **Eliminate Redundancy**: Remove duplicate or superseded templates
3. **Merge Compatible**: Combine related templates for efficiency
4. **Reorder for Performance**: Arrange templates for optimal processing
5. **Filter by Relevance**: Apply relevance scoring to template selection
6. **Measure Impact**: Track optimization metrics and improvements

## Context

As template libraries grow, efficient selection and composition become critical. This template establishes optimization strategies for template discovery, redundancy elimination, and performance improvement.

## Examples

```typescript
interface OptimizationResult {
  originalTemplates: string[];
  optimizedTemplates: string[];
  removedTemplates: RemovedTemplate[];
  mergedTemplates: MergedTemplate[];
  reorderedTemplates: string[];
  metrics: OptimizationMetrics;
}

interface RemovedTemplate {
  templateId: string;
  reason: RemovalReason;
  replacedBy?: string;
}

enum RemovalReason {
  REDUNDANT = 'redundant',
  SUPERSEDED = 'superseded',
  INCOMPATIBLE = 'incompatible',
  LOW_RELEVANCE = 'low_relevance'
}

interface MergedTemplate {
  sourceTemplates: string[];
  resultTemplate: string;
  mergeStrategy: string;
}


interface OptimizationMetrics {
  originalCount: number;
  optimizedCount: number;
  reductionPercentage: number;
  estimatedSizeReduction: number;
  processingTimeMs: number;
}
```

## Implementation Patterns

### Composition Optimizer Service

```typescript
interface CompositionOptimizer {
  // Optimization Operations
  optimize(templates: string[], options?: OptimizationOptions): Promise<OptimizationResult>;
  eliminateRedundancy(templates: string[]): Promise<string[]>;
  mergeCompatible(templates: string[]): Promise<MergeResult>;
  reorderForEfficiency(templates: string[]): Promise<string[]>;
  
  // Analysis
  analyzeRedundancy(templates: string[]): Promise<RedundancyAnalysis>;
  calculateRelevanceScores(templates: string[], requirements: string[]): Promise<RelevanceScores>;
  findOptimalSubset(templates: string[], maxCount: number): Promise<string[]>;
}

class TemplateCompositionOptimizer implements CompositionOptimizer {
  private metadataManager: MetadataManager;
  private dependencyManager: DependencyManager;

  async optimize(templates: string[], options?: OptimizationOptions): Promise<OptimizationResult> {
    const startTime = Date.now();
    const originalCount = templates.length;

    let optimized = [...templates];
    const removed: RemovedTemplate[] = [];
    const merged: MergedTemplate[] = [];

    // Step 1: Remove redundant templates
    if (options?.eliminateRedundancy !== false) {
      const redundancyResult = await this.eliminateRedundancyWithTracking(optimized);
      optimized = redundancyResult.remaining;
      removed.push(...redundancyResult.removed);
    }

    // Step 2: Merge compatible templates
    if (options?.mergeCompatible) {
      const mergeResult = await this.mergeCompatible(optimized);
      optimized = mergeResult.templates;
      merged.push(...mergeResult.merged);
    }

    // Step 3: Reorder for efficiency
    if (options?.reorderForEfficiency !== false) {
      optimized = await this.reorderForEfficiency(optimized);
    }

    // Step 4: Apply relevance filtering
    if (options?.relevanceThreshold && options.requirements) {
      const relevanceResult = await this.filterByRelevance(
        optimized,
        options.requirements,
        options.relevanceThreshold
      );
      optimized = relevanceResult.remaining;
      removed.push(...relevanceResult.removed);
    }

    const processingTimeMs = Date.now() - startTime;

    return {
      originalTemplates: templates,
      optimizedTemplates: optimized,
      removedTemplates: removed,
      mergedTemplates: merged,
      reorderedTemplates: optimized,
      metrics: {
        originalCount,
        optimizedCount: optimized.length,
        reductionPercentage: ((originalCount - optimized.length) / originalCount) * 100,
        estimatedSizeReduction: await this.estimateSizeReduction(templates, optimized),
        processingTimeMs
      }
    };
  }

  async eliminateRedundancy(templates: string[]): Promise<string[]> {
    const result = await this.eliminateRedundancyWithTracking(templates);
    return result.remaining;
  }

  private async eliminateRedundancyWithTracking(templates: string[]): Promise<{
    remaining: string[];
    removed: RemovedTemplate[];
  }> {
    const remaining: string[] = [];
    const removed: RemovedTemplate[] = [];
    const seen = new Map<string, string>(); // functionality hash -> template id

    for (const templateId of templates) {
      const metadata = await this.metadataManager.getMetadata(templateId);
      if (!metadata) {
        remaining.push(templateId);
        continue;
      }

      // Check if superseded
      if (metadata.supersededBy) {
        if (templates.includes(metadata.supersededBy)) {
          removed.push({
            templateId,
            reason: RemovalReason.SUPERSEDED,
            replacedBy: metadata.supersededBy
          });
          continue;
        }
      }

      // Check for functional redundancy
      const functionalityHash = this.calculateFunctionalityHash(metadata);
      const existingTemplate = seen.get(functionalityHash);

      if (existingTemplate) {
        // Keep the one with higher maturity/version
        const existingMeta = await this.metadataManager.getMetadata(existingTemplate);
        if (existingMeta && this.shouldPrefer(metadata, existingMeta)) {
          // Replace existing with current
          const existingIndex = remaining.indexOf(existingTemplate);
          if (existingIndex !== -1) {
            remaining.splice(existingIndex, 1);
            removed.push({
              templateId: existingTemplate,
              reason: RemovalReason.REDUNDANT,
              replacedBy: templateId
            });
          }
          remaining.push(templateId);
          seen.set(functionalityHash, templateId);
        } else {
          removed.push({
            templateId,
            reason: RemovalReason.REDUNDANT,
            replacedBy: existingTemplate
          });
        }
      } else {
        remaining.push(templateId);
        seen.set(functionalityHash, templateId);
      }
    }

    return { remaining, removed };
  }

  async mergeCompatible(templates: string[]): Promise<MergeResult> {
    const merged: MergedTemplate[] = [];
    const remaining = [...templates];
    const processed = new Set<string>();

    for (let i = 0; i < remaining.length; i++) {
      if (processed.has(remaining[i])) continue;

      const mergeCandidates: string[] = [remaining[i]];

      for (let j = i + 1; j < remaining.length; j++) {
        if (processed.has(remaining[j])) continue;

        if (await this.canMerge(remaining[i], remaining[j])) {
          mergeCandidates.push(remaining[j]);
        }
      }

      if (mergeCandidates.length > 1) {
        const mergedId = await this.performMerge(mergeCandidates);
        merged.push({
          sourceTemplates: mergeCandidates,
          resultTemplate: mergedId,
          mergeStrategy: 'combine'
        });

        mergeCandidates.forEach(t => processed.add(t));
      }
    }

    // Remove merged templates and add merged results
    const finalTemplates = remaining.filter(t => !processed.has(t));
    merged.forEach(m => finalTemplates.push(m.resultTemplate));

    return {
      templates: finalTemplates,
      merged
    };
  }

  async reorderForEfficiency(templates: string[]): Promise<string[]> {
    // Build dependency graph
    const graph = await this.dependencyManager.buildDependencyGraph(templates);
    
    // Topological sort based on dependencies
    const sorted = this.topologicalSort(templates, graph);
    
    // Group by domain for cache efficiency
    const grouped = this.groupByDomain(sorted);
    
    return grouped;
  }

  async analyzeRedundancy(templates: string[]): Promise<RedundancyAnalysis> {
    const redundantPairs: RedundantPair[] = [];
    const supersededTemplates: SupersededTemplate[] = [];

    for (let i = 0; i < templates.length; i++) {
      const metaI = await this.metadataManager.getMetadata(templates[i]);
      if (!metaI) continue;

      // Check for superseded
      if (metaI.supersededBy && templates.includes(metaI.supersededBy)) {
        supersededTemplates.push({
          templateId: templates[i],
          supersededBy: metaI.supersededBy
        });
      }

      // Check for redundancy with other templates
      for (let j = i + 1; j < templates.length; j++) {
        const metaJ = await this.metadataManager.getMetadata(templates[j]);
        if (!metaJ) continue;

        const similarity = this.calculateSimilarity(metaI, metaJ);
        if (similarity > 0.8) {
          redundantPairs.push({
            templateA: templates[i],
            templateB: templates[j],
            similarity,
            recommendation: this.getRedundancyRecommendation(metaI, metaJ)
          });
        }
      }
    }

    return {
      totalTemplates: templates.length,
      redundantPairs,
      supersededTemplates,
      potentialReduction: redundantPairs.length + supersededTemplates.length
    };
  }

  async calculateRelevanceScores(
    templates: string[],
    requirements: string[]
  ): Promise<RelevanceScores> {
    const scores = new Map<string, number>();

    for (const templateId of templates) {
      const metadata = await this.metadataManager.getMetadata(templateId);
      if (!metadata) {
        scores.set(templateId, 0);
        continue;
      }

      let score = 0;

      // Match against requirements
      for (const requirement of requirements) {
        const reqLower = requirement.toLowerCase();

        // Domain match
        if (metadata.domain.toLowerCase().includes(reqLower)) {
          score += 30;
        }

        // Tag match
        for (const tag of metadata.tags) {
          if (tag.toLowerCase().includes(reqLower)) {
            score += 20;
          }
        }

        // Keyword match
        for (const keyword of metadata.keywords || []) {
          if (keyword.toLowerCase().includes(reqLower)) {
            score += 10;
          }
        }

        // Description match
        if (metadata.description.toLowerCase().includes(reqLower)) {
          score += 5;
        }
      }

      // Normalize score
      scores.set(templateId, Math.min(100, score));
    }

    return {
      scores,
      averageScore: Array.from(scores.values()).reduce((a, b) => a + b, 0) / scores.size,
      highRelevance: Array.from(scores.entries())
        .filter(([_, score]) => score >= 70)
        .map(([id]) => id),
      lowRelevance: Array.from(scores.entries())
        .filter(([_, score]) => score < 30)
        .map(([id]) => id)
    };
  }

  async findOptimalSubset(templates: string[], maxCount: number): Promise<string[]> {
    if (templates.length <= maxCount) {
      return templates;
    }

    // Score each template based on coverage and uniqueness
    const templateScores = new Map<string, number>();

    for (const templateId of templates) {
      const metadata = await this.metadataManager.getMetadata(templateId);
      if (!metadata) continue;

      let score = 0;

      // Base score from maturity
      const maturityScores: Record<string, number> = {
        'mature': 40,
        'stable': 30,
        'beta': 20,
        'experimental': 10,
        'deprecated': 0
      };
      score += maturityScores[metadata.maturityLevel] || 0;

      // Score from uniqueness (fewer similar templates = higher score)
      const similarCount = await this.countSimilarTemplates(templateId, templates);
      score += Math.max(0, 30 - similarCount * 5);

      // Score from dependency importance
      const dependentCount = await this.countDependents(templateId, templates);
      score += dependentCount * 10;

      templateScores.set(templateId, score);
    }

    // Select top templates
    const sorted = Array.from(templateScores.entries())
      .sort((a, b) => b[1] - a[1]);

    const selected: string[] = [];
    const coveredDomains = new Set<string>();

    for (const [templateId, _] of sorted) {
      if (selected.length >= maxCount) break;

      const metadata = await this.metadataManager.getMetadata(templateId);
      if (!metadata) continue;

      // Prefer templates that cover new domains
      if (!coveredDomains.has(metadata.domain)) {
        selected.push(templateId);
        coveredDomains.add(metadata.domain);
      } else if (selected.length < maxCount * 0.8) {
        // Allow some redundancy for important templates
        selected.push(templateId);
      }
    }

    return selected;
  }

  private calculateFunctionalityHash(metadata: TemplateMetadata): string {
    // Create a hash based on domain, category, and primary tags
    const components = [
      metadata.domain,
      metadata.category,
      ...metadata.tags.slice(0, 5).sort()
    ];
    return components.join('|');
  }

  private shouldPrefer(a: TemplateMetadata, b: TemplateMetadata): boolean {
    // Prefer higher maturity
    const maturityOrder = ['deprecated', 'experimental', 'beta', 'stable', 'mature'];
    const aMaturity = maturityOrder.indexOf(a.maturityLevel);
    const bMaturity = maturityOrder.indexOf(b.maturityLevel);
    
    if (aMaturity !== bMaturity) {
      return aMaturity > bMaturity;
    }

    // Prefer newer version
    return a.version > b.version;
  }

  private async canMerge(templateA: string, templateB: string): Promise<boolean> {
    const metaA = await this.metadataManager.getMetadata(templateA);
    const metaB = await this.metadataManager.getMetadata(templateB);

    if (!metaA || !metaB) return false;

    // Same domain and category
    if (metaA.domain !== metaB.domain) return false;
    if (metaA.category !== metaB.category) return false;

    // Similar complexity
    const complexityOrder = ['basic', 'intermediate', 'advanced', 'expert'];
    const complexityDiff = Math.abs(
      complexityOrder.indexOf(metaA.complexity) -
      complexityOrder.indexOf(metaB.complexity)
    );
    
    return complexityDiff <= 1;
  }

  private async performMerge(templates: string[]): Promise<string> {
    // In a real implementation, this would create a merged template
    // For now, return a placeholder
    return `merged-${templates.join('-')}`;
  }

  private topologicalSort(templates: string[], graph: DependencyGraph): string[] {
    const visited = new Set<string>();
    const result: string[] = [];

    const visit = (templateId: string) => {
      if (visited.has(templateId)) return;
      visited.add(templateId);

      const node = graph.nodes.get(templateId);
      if (node) {
        for (const dep of node.dependencies) {
          if (templates.includes(dep.templateId)) {
            visit(dep.templateId);
          }
        }
      }

      result.push(templateId);
    };

    for (const templateId of templates) {
      visit(templateId);
    }

    return result;
  }

  private async groupByDomain(templates: string[]): Promise<string[]> {
    const byDomain = new Map<string, string[]>();

    for (const templateId of templates) {
      const metadata = await this.metadataManager.getMetadata(templateId);
      const domain = metadata?.domain || 'unknown';
      
      if (!byDomain.has(domain)) {
        byDomain.set(domain, []);
      }
      byDomain.get(domain)!.push(templateId);
    }

    // Flatten, keeping domain groups together
    return Array.from(byDomain.values()).flat();
  }

  private calculateSimilarity(a: TemplateMetadata, b: TemplateMetadata): number {
    let score = 0;
    let maxScore = 0;

    // Domain match
    maxScore += 30;
    if (a.domain === b.domain) score += 30;

    // Category match
    maxScore += 20;
    if (a.category === b.category) score += 20;

    // Tag overlap
    maxScore += 30;
    const commonTags = a.tags.filter(t => b.tags.includes(t));
    const tagOverlap = commonTags.length / Math.max(a.tags.length, b.tags.length);
    score += tagOverlap * 30;

    // Complexity match
    maxScore += 20;
    if (a.complexity === b.complexity) score += 20;

    return score / maxScore;
  }

  private getRedundancyRecommendation(a: TemplateMetadata, b: TemplateMetadata): string {
    if (this.shouldPrefer(a, b)) {
      return `Keep '${a.name}', remove '${b.name}'`;
    }
    return `Keep '${b.name}', remove '${a.name}'`;
  }

  private async countSimilarTemplates(templateId: string, allTemplates: string[]): Promise<number> {
    const metadata = await this.metadataManager.getMetadata(templateId);
    if (!metadata) return 0;

    let count = 0;
    for (const otherId of allTemplates) {
      if (otherId === templateId) continue;
      const otherMeta = await this.metadataManager.getMetadata(otherId);
      if (otherMeta && this.calculateSimilarity(metadata, otherMeta) > 0.7) {
        count++;
      }
    }
    return count;
  }

  private async countDependents(templateId: string, allTemplates: string[]): Promise<number> {
    let count = 0;
    for (const otherId of allTemplates) {
      if (otherId === templateId) continue;
      const deps = await this.dependencyManager.getDependencies(otherId);
      if (deps.some(d => d.templateId === templateId)) {
        count++;
      }
    }
    return count;
  }

  private async estimateSizeReduction(original: string[], optimized: string[]): Promise<number> {
    // Estimate based on template count reduction
    const reduction = original.length - optimized.length;
    const avgTemplateSize = 5000; // bytes
    return reduction * avgTemplateSize;
  }

  private async filterByRelevance(
    templates: string[],
    requirements: string[],
    threshold: number
  ): Promise<{ remaining: string[]; removed: RemovedTemplate[] }> {
    const scores = await this.calculateRelevanceScores(templates, requirements);
    const remaining: string[] = [];
    const removed: RemovedTemplate[] = [];

    for (const templateId of templates) {
      const score = scores.scores.get(templateId) || 0;
      if (score >= threshold) {
        remaining.push(templateId);
      } else {
        removed.push({
          templateId,
          reason: RemovalReason.LOW_RELEVANCE
        });
      }
    }

    return { remaining, removed };
  }
}

interface OptimizationOptions {
  eliminateRedundancy?: boolean;
  mergeCompatible?: boolean;
  reorderForEfficiency?: boolean;
  relevanceThreshold?: number;
  requirements?: string[];
}

interface MergeResult {
  templates: string[];
  merged: MergedTemplate[];
}

interface RedundancyAnalysis {
  totalTemplates: number;
  redundantPairs: RedundantPair[];
  supersededTemplates: SupersededTemplate[];
  potentialReduction: number;
}

interface RedundantPair {
  templateA: string;
  templateB: string;
  similarity: number;
  recommendation: string;
}

interface SupersededTemplate {
  templateId: string;
  supersededBy: string;
}

interface RelevanceScores {
  scores: Map<string, number>;
  averageScore: number;
  highRelevance: string[];
  lowRelevance: string[];
}
```

## Integration Points

### Brief Analysis Integration

```typescript
class OptimizedTemplateSelector {
  private optimizer: CompositionOptimizer;
  private metadataManager: MetadataManager;

  async selectOptimalTemplates(brief: BriefAnalysis): Promise<SelectedTemplates> {
    // Get all potentially relevant templates
    const candidates = await this.findCandidates(brief);

    // Calculate relevance scores
    const requirements = this.extractRequirements(brief);
    const relevanceScores = await this.optimizer.calculateRelevanceScores(
      candidates,
      requirements
    );

    // Filter by relevance
    const relevant = relevanceScores.highRelevance;

    // Optimize the selection
    const optimized = await this.optimizer.optimize(relevant, {
      eliminateRedundancy: true,
      reorderForEfficiency: true,
      relevanceThreshold: 50,
      requirements
    });

    return {
      templates: optimized.optimizedTemplates,
      metrics: optimized.metrics,
      relevanceScores: relevanceScores.scores
    };
  }

  private async findCandidates(brief: BriefAnalysis): Promise<string[]> {
    const candidates: Set<string> = new Set();

    // Find by domain
    for (const domain of brief.domains) {
      const domainTemplates = await this.metadataManager.findByDomain(domain);
      domainTemplates.forEach(t => candidates.add(t.id));
    }

    // Find by features
    for (const feature of brief.features) {
      const featureTemplates = await this.metadataManager.findByTags([feature]);
      featureTemplates.forEach(t => candidates.add(t.id));
    }

    return Array.from(candidates);
  }

  private extractRequirements(brief: BriefAnalysis): string[] {
    return [
      ...brief.domains,
      ...brief.features,
      ...brief.platforms
    ];
  }
}

interface SelectedTemplates {
  templates: string[];
  metrics: OptimizationMetrics;
  relevanceScores: Map<string, number>;
}
```

## Testing Considerations

### Property-Based Tests

```typescript
describe('Composition Optimization Properties', () => {
  it('should never increase template count', () => {
    fc.assert(fc.property(
      fc.array(fc.string({ minLength: 1, maxLength: 50 }), { minLength: 1, maxLength: 20 }),
      async (templates) => {
        const optimizer = new TemplateCompositionOptimizer();
        const result = await optimizer.optimize(templates);
        
        expect(result.optimizedTemplates.length).toBeLessThanOrEqual(templates.length);
      }
    ));
  });

  it('should preserve all required dependencies', () => {
    fc.assert(fc.property(
      fc.array(fc.string({ minLength: 1, maxLength: 50 }), { minLength: 2, maxLength: 10 }),
      async (templates) => {
        const optimizer = new TemplateCompositionOptimizer();
        const result = await optimizer.optimize(templates);
        
        // All dependencies of remaining templates should be present
        for (const templateId of result.optimizedTemplates) {
          const deps = await optimizer.getDependencies(templateId);
          for (const dep of deps) {
            if (dep.type === 'required') {
              expect(result.optimizedTemplates).toContain(dep.templateId);
            }
          }
        }
      }
    ));
  });
});
```

## Configuration Examples

### Optimization Configuration

```yaml
optimization:
  redundancy:
    enabled: true
    similarity_threshold: 0.8
    prefer_newer_versions: true
  
  merging:
    enabled: false
    same_domain_only: true
    max_complexity_diff: 1
  
  relevance:
    enabled: true
    threshold: 50
    boost_exact_matches: true
  
  ordering:
    enabled: true
    group_by_domain: true
    dependencies_first: true
  
  limits:
    max_templates: 50
    max_per_domain: 10
```

## Related Templates

- `template-metadata.md` - Metadata management
- `composition-rules.md` - Composition rules
- `template-validation.md` - Validation patterns
- `template-dependencies.md` - Dependency management
