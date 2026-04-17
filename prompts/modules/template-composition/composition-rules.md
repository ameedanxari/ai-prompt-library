# Template Composition Rules

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

This template provides comprehensive patterns for defining template compatibility rules, conflict detection and resolution mechanisms, and composition constraints that ensure coherent template combinations across the AI Prompt Library.

## Context

When composing multiple templates, conflicts can arise from incompatible configurations, overlapping functionality, or contradictory requirements. This template establishes rules and mechanisms for detecting and resolving such conflicts.

## Instructions

1. **Define Composition Rules**: Establish rules for template compatibility and conflicts
2. **Configure Rule Engine**: Initialize the rule evaluation pipeline
3. **Set Resolution Strategies**: Define how conflicts should be resolved
4. **Implement Validation**: continuously validate template compositions
5. **Monitor Rule Effectiveness**: Track rule matches and update as needed

## Core Components

### Composition Rule Schema

## Examples

```typescript
interface CompositionRule {
  id: string;
  name: string;
  description: string;
  type: RuleType;
  priority: number;
  condition: RuleCondition;
  action: RuleAction;
  enabled: boolean;
}

enum RuleType {
  COMPATIBILITY = 'compatibility',
  CONFLICT = 'conflict',
  REQUIREMENT = 'requirement',
  ENHANCEMENT = 'enhancement',
  EXCLUSION = 'exclusion',
  ORDERING = 'ordering'
}

interface RuleCondition {
  type: ConditionType;
  templates?: string[];
  tags?: string[];
  domains?: string[];
  expression?: string;
}

enum ConditionType {
  ALL_PRESENT = 'all_present',
  ANY_PRESENT = 'any_present',
  NONE_PRESENT = 'none_present',
  CUSTOM = 'custom'
}


interface RuleAction {
  type: ActionType;
  message?: string;
  suggestion?: string;
  autoResolve?: boolean;
  resolution?: ResolutionStrategy;
}

enum ActionType {
  ALLOW = 'allow',
  DENY = 'deny',
  WARN = 'warn',
  REQUIRE = 'require',
  SUGGEST = 'suggest',
  TRANSFORM = 'transform'
}

interface ResolutionStrategy {
  type: 'prefer_first' | 'prefer_last' | 'merge' | 'custom';
  customResolver?: string;
}
```

### Composition Rules Engine

```typescript
interface CompositionRulesEngine {
  // Rule Management
  addRule(rule: CompositionRule): void;
  removeRule(ruleId: string): void;
  getRule(ruleId: string): CompositionRule | null;
  getAllRules(): CompositionRule[];
  
  // Rule Evaluation
  evaluateRules(templates: string[]): RuleEvaluationResult;
  checkCompatibility(templateA: string, templateB: string): CompatibilityResult;
  detectConflicts(templates: string[]): ConflictReport[];
  
  // Resolution
  resolveConflicts(conflicts: ConflictReport[]): ConflictResolution[];
  suggestResolutions(conflict: ConflictReport): ResolutionSuggestion[];
}

class TemplateCompositionRulesEngine implements CompositionRulesEngine {
  private rules: Map<string, CompositionRule> = new Map();
  private templateMetadata: Map<string, TemplateMetadata> = new Map();

  constructor() {
    this.initializeDefaultRules();
  }

  private initializeDefaultRules(): void {
    // Domain conflict rules
    this.addRule({
      id: 'healthcare-fintech-conflict',
      name: 'Healthcare-Fintech Compliance Conflict',
      description: 'Healthcare and fintech templates may have conflicting compliance requirements',
      type: RuleType.CONFLICT,
      priority: 100,
      condition: {
        type: ConditionType.ALL_PRESENT,
        domains: ['healthcare', 'fintech']
      },
      action: {
        type: ActionType.WARN,
        message: 'Healthcare and fintech templates have different compliance requirements (HIPAA vs PCI-DSS)',
        suggestion: 'Ensure both compliance frameworks are properly addressed'
      },
      enabled: true
    });

    // Platform compatibility rules
    this.addRule({
      id: 'web-only-mobile-only-conflict',
      name: 'Platform Exclusivity Conflict',
      description: 'Web-only and mobile-only templates cannot be combined',
      type: RuleType.EXCLUSION,
      priority: 200,
      condition: {
        type: ConditionType.ALL_PRESENT,
        tags: ['web-only', 'mobile-only']
      },
      action: {
        type: ActionType.DENY,
        message: 'Cannot combine web-only and mobile-only templates',
        suggestion: 'Choose platform-agnostic templates or select a single platform'
      },
      enabled: true
    });

    // Security requirement rules
    this.addRule({
      id: 'auth-requires-security',
      name: 'Authentication Requires Security',
      description: 'Authentication templates require security templates',
      type: RuleType.REQUIREMENT,
      priority: 150,
      condition: {
        type: ConditionType.ANY_PRESENT,
        tags: ['authentication', 'authorization']
      },
      action: {
        type: ActionType.REQUIRE,
        message: 'Authentication templates require security templates',
        suggestion: 'Add security/encryption or security/data-protection template'
      },
      enabled: true
    });

    // Enhancement rules
    this.addRule({
      id: 'commerce-analytics-enhancement',
      name: 'Commerce Analytics Enhancement',
      description: 'Commerce templates are enhanced by analytics templates',
      type: RuleType.ENHANCEMENT,
      priority: 50,
      condition: {
        type: ConditionType.ANY_PRESENT,
        domains: ['commerce']
      },
      action: {
        type: ActionType.SUGGEST,
        message: 'Consider adding analytics templates for better insights',
        suggestion: 'Add analytics/user-analytics or analytics/business-metrics template'
      },
      enabled: true
    });
  }

  evaluateRules(templates: string[]): RuleEvaluationResult {
    const results: RuleEvaluationDetail[] = [];
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // Get metadata for all templates
    const templateMeta = templates.map(t => this.templateMetadata.get(t)).filter(Boolean);
    const allTags = new Set<string>();
    const allDomains = new Set<string>();

    for (const meta of templateMeta) {
      if (meta) {
        meta.tags?.forEach(t => allTags.add(t));
        if (meta.domain) allDomains.add(meta.domain);
      }
    }

    // Evaluate each rule
    const sortedRules = Array.from(this.rules.values())
      .filter(r => r.enabled)
      .sort((a, b) => b.priority - a.priority);

    for (const rule of sortedRules) {
      const matches = this.evaluateCondition(rule.condition, templates, allTags, allDomains);
      
      if (matches) {
        results.push({
          ruleId: rule.id,
          ruleName: rule.name,
          matched: true,
          action: rule.action
        });

        switch (rule.action.type) {
          case ActionType.DENY:
            errors.push(rule.action.message || rule.description);
            break;
          case ActionType.WARN:
            warnings.push(rule.action.message || rule.description);
            break;
          case ActionType.SUGGEST:
            suggestions.push(rule.action.suggestion || rule.description);
            break;
          case ActionType.REQUIRE:
            // Check if requirement is met
            if (!this.isRequirementMet(rule, templates)) {
              errors.push(rule.action.message || rule.description);
            }
            break;
        }
      }
    }

    return {
      valid: errors.length === 0,
      results,
      errors,
      warnings,
      suggestions
    };
  }

  checkCompatibility(templateA: string, templateB: string): CompatibilityResult {
    const evaluation = this.evaluateRules([templateA, templateB]);
    
    return {
      compatible: evaluation.valid,
      score: this.calculateCompatibilityScore(evaluation),
      issues: evaluation.errors,
      warnings: evaluation.warnings,
      suggestions: evaluation.suggestions
    };
  }

  detectConflicts(templates: string[]): ConflictReport[] {
    const conflicts: ConflictReport[] = [];
    
    // Check pairwise conflicts
    for (let i = 0; i < templates.length; i++) {
      for (let j = i + 1; j < templates.length; j++) {
        const compatibility = this.checkCompatibility(templates[i], templates[j]);
        
        if (!compatibility.compatible) {
          conflicts.push({
            type: 'incompatibility',
            templates: [templates[i], templates[j]],
            severity: 'error',
            message: compatibility.issues.join('; '),
            suggestions: compatibility.suggestions
          });
        } else if (compatibility.warnings.length > 0) {
          conflicts.push({
            type: 'warning',
            templates: [templates[i], templates[j]],
            severity: 'warning',
            message: compatibility.warnings.join('; '),
            suggestions: compatibility.suggestions
          });
        }
      }
    }

    // Check group conflicts
    const groupEvaluation = this.evaluateRules(templates);
    if (!groupEvaluation.valid) {
      conflicts.push({
        type: 'group_conflict',
        templates,
        severity: 'error',
        message: groupEvaluation.errors.join('; '),
        suggestions: groupEvaluation.suggestions
      });
    }

    return conflicts;
  }

  resolveConflicts(conflicts: ConflictReport[]): ConflictResolution[] {
    const resolutions: ConflictResolution[] = [];

    for (const conflict of conflicts) {
      const suggestions = this.suggestResolutions(conflict);
      
      if (suggestions.length > 0) {
        // Auto-resolve if possible
        const autoResolvable = suggestions.find(s => s.autoApplicable);
        
        resolutions.push({
          conflict,
          resolved: autoResolvable !== undefined,
          resolution: autoResolvable,
          alternatives: suggestions.filter(s => s !== autoResolvable)
        });
      } else {
        resolutions.push({
          conflict,
          resolved: false,
          alternatives: []
        });
      }
    }

    return resolutions;
  }

  suggestResolutions(conflict: ConflictReport): ResolutionSuggestion[] {
    const suggestions: ResolutionSuggestion[] = [];

    switch (conflict.type) {
      case 'incompatibility':
        // Suggest removing one of the conflicting templates
        for (const template of conflict.templates) {
          suggestions.push({
            action: 'remove',
            template,
            reason: `Remove '${template}' to resolve incompatibility`,
            autoApplicable: false
          });
        }
        
        // Suggest alternatives
        for (const template of conflict.templates) {
          const alternatives = this.findAlternatives(template);
          for (const alt of alternatives) {
            suggestions.push({
              action: 'replace',
              template,
              replacement: alt,
              reason: `Replace '${template}' with '${alt}'`,
              autoApplicable: false
            });
          }
        }
        break;

      case 'warning':
        // Suggest adding complementary templates
        if (conflict.suggestions) {
          for (const suggestion of conflict.suggestions) {
            suggestions.push({
              action: 'add',
              template: suggestion,
              reason: `Add '${suggestion}' to address warning`,
              autoApplicable: true
            });
          }
        }
        break;
    }

    return suggestions;
  }

  private evaluateCondition(
    condition: RuleCondition,
    templates: string[],
    tags: Set<string>,
    domains: Set<string>
  ): boolean {
    switch (condition.type) {
      case ConditionType.ALL_PRESENT:
        if (condition.templates) {
          return condition.templates.every(t => templates.includes(t));
        }
        if (condition.tags) {
          return condition.tags.every(t => tags.has(t));
        }
        if (condition.domains) {
          return condition.domains.every(d => domains.has(d));
        }
        return false;

      case ConditionType.ANY_PRESENT:
        if (condition.templates) {
          return condition.templates.some(t => templates.includes(t));
        }
        if (condition.tags) {
          return condition.tags.some(t => tags.has(t));
        }
        if (condition.domains) {
          return condition.domains.some(d => domains.has(d));
        }
        return false;

      case ConditionType.NONE_PRESENT:
        if (condition.templates) {
          return !condition.templates.some(t => templates.includes(t));
        }
        if (condition.tags) {
          return !condition.tags.some(t => tags.has(t));
        }
        if (condition.domains) {
          return !condition.domains.some(d => domains.has(d));
        }
        return true;

      case ConditionType.CUSTOM:
        return this.evaluateCustomCondition(condition.expression || '', templates, tags, domains);

      default:
        return false;
    }
  }

  private evaluateCustomCondition(
    expression: string,
    templates: string[],
    tags: Set<string>,
    domains: Set<string>
  ): boolean {
    // Simple expression evaluator
    // Supports: AND, OR, NOT, HAS_TAG(), HAS_DOMAIN(), HAS_TEMPLATE()
    try {
      const context = {
        hasTag: (tag: string) => tags.has(tag),
        hasDomain: (domain: string) => domains.has(domain),
        hasTemplate: (template: string) => templates.includes(template)
      };

      // Replace function calls with context calls
      let evalExpr = expression
        .replace(/HAS_TAG\(["']([^"']+)["']\)/g, (_, tag) => `hasTag("${tag}")`)
        .replace(/HAS_DOMAIN\(["']([^"']+)["']\)/g, (_, domain) => `hasDomain("${domain}")`)
        .replace(/HAS_TEMPLATE\(["']([^"']+)["']\)/g, (_, template) => `hasTemplate("${template}")`);

      // Create function with context
      const fn = new Function('hasTag', 'hasDomain', 'hasTemplate', `return ${evalExpr}`);
      return fn(context.hasTag, context.hasDomain, context.hasTemplate);
    } catch {
      return false;
    }
  }

  private isRequirementMet(rule: CompositionRule, templates: string[]): boolean {
    // Check if required templates/tags are present
    // This is a simplified check - real implementation would be more sophisticated
    return true;
  }

  private calculateCompatibilityScore(evaluation: RuleEvaluationResult): number {
    let score = 100;
    
    score -= evaluation.errors.length * 30;
    score -= evaluation.warnings.length * 10;
    score += evaluation.suggestions.length * 2; // Suggestions indicate enhancement opportunities
    
    return Math.max(0, Math.min(100, score));
  }

  private findAlternatives(templateId: string): string[] {
    // Find templates with similar tags/domain but without conflicts
    const meta = this.templateMetadata.get(templateId);
    if (!meta) return [];

    const alternatives: string[] = [];
    
    for (const [id, otherMeta] of this.templateMetadata) {
      if (id === templateId) continue;
      
      // Same domain, different template
      if (otherMeta.domain === meta.domain) {
        alternatives.push(id);
      }
    }

    return alternatives.slice(0, 3); // Return top 3 alternatives
  }
}

interface RuleEvaluationResult {
  valid: boolean;
  results: RuleEvaluationDetail[];
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

interface RuleEvaluationDetail {
  ruleId: string;
  ruleName: string;
  matched: boolean;
  action: RuleAction;
}

interface CompatibilityResult {
  compatible: boolean;
  score: number;
  issues: string[];
  warnings: string[];
  suggestions: string[];
}

interface ConflictReport {
  type: 'incompatibility' | 'warning' | 'group_conflict';
  templates: string[];
  severity: 'error' | 'warning';
  message: string;
  suggestions?: string[];
}

interface ConflictResolution {
  conflict: ConflictReport;
  resolved: boolean;
  resolution?: ResolutionSuggestion;
  alternatives: ResolutionSuggestion[];
}

interface ResolutionSuggestion {
  action: 'remove' | 'replace' | 'add' | 'configure';
  template: string;
  replacement?: string;
  reason: string;
  autoApplicable: boolean;
}
```


## Implementation Patterns

### Predefined Composition Rules

```typescript
const PREDEFINED_RULES: CompositionRule[] = [
  // Domain-specific rules
  {
    id: 'payment-requires-security',
    name: 'Payment Security Requirement',
    description: 'Payment templates require security templates',
    type: RuleType.REQUIREMENT,
    priority: 200,
    condition: {
      type: ConditionType.ANY_PRESENT,
      tags: ['payment', 'checkout', 'transaction']
    },
    action: {
      type: ActionType.REQUIRE,
      message: 'Payment functionality requires security templates for PCI compliance',
      suggestion: 'Add commerce/payment-security template'
    },
    enabled: true
  },

  {
    id: 'healthcare-hipaa-requirement',
    name: 'Healthcare HIPAA Requirement',
    description: 'Healthcare templates require HIPAA compliance',
    type: RuleType.REQUIREMENT,
    priority: 200,
    condition: {
      type: ConditionType.ANY_PRESENT,
      domains: ['healthcare']
    },
    action: {
      type: ActionType.REQUIRE,
      message: 'Healthcare templates require HIPAA compliance templates',
      suggestion: 'Add healthcare/hipaa-compliance template'
    },
    enabled: true
  },

  // Conflict rules
  {
    id: 'sync-async-conflict',
    name: 'Synchronous-Asynchronous Conflict',
    description: 'Synchronous and asynchronous patterns may conflict',
    type: RuleType.CONFLICT,
    priority: 150,
    condition: {
      type: ConditionType.ALL_PRESENT,
      tags: ['synchronous-only', 'async-required']
    },
    action: {
      type: ActionType.DENY,
      message: 'Cannot combine synchronous-only and async-required templates',
      suggestion: 'Choose either synchronous or asynchronous approach'
    },
    enabled: true
  },

  // Ordering rules
  {
    id: 'auth-before-api',
    name: 'Authentication Before API',
    description: 'Authentication should be configured before API endpoints',
    type: RuleType.ORDERING,
    priority: 100,
    condition: {
      type: ConditionType.ALL_PRESENT,
      tags: ['authentication', 'api']
    },
    action: {
      type: ActionType.TRANSFORM,
      message: 'Authentication templates should be processed before API templates',
      autoResolve: true,
      resolution: {
        type: 'custom',
        customResolver: 'orderAuthBeforeApi'
      }
    },
    enabled: true
  },

  // Enhancement rules
  {
    id: 'realtime-suggests-websocket',
    name: 'Real-time WebSocket Suggestion',
    description: 'Real-time features benefit from WebSocket templates',
    type: RuleType.ENHANCEMENT,
    priority: 50,
    condition: {
      type: ConditionType.ANY_PRESENT,
      tags: ['real-time', 'live-updates', 'streaming']
    },
    action: {
      type: ActionType.SUGGEST,
      message: 'Consider adding WebSocket templates for real-time functionality',
      suggestion: 'Add real-time-communication/websocket-management template'
    },
    enabled: true
  }
];
```

### Rule Evaluation Pipeline

```typescript
class RuleEvaluationPipeline {
  private stages: EvaluationStage[] = [];

  constructor() {
    this.initializeStages();
  }

  private initializeStages(): void {
    this.stages = [
      new PreprocessingStage(),
      new ExclusionRuleStage(),
      new RequirementRuleStage(),
      new ConflictRuleStage(),
      new EnhancementRuleStage(),
      new OrderingRuleStage(),
      new PostprocessingStage()
    ];
  }

  async evaluate(context: EvaluationContext): Promise<PipelineResult> {
    let currentContext = context;
    const stageResults: StageResult[] = [];

    for (const stage of this.stages) {
      const result = await stage.evaluate(currentContext);
      stageResults.push(result);

      if (result.abort) {
        break;
      }

      currentContext = result.updatedContext || currentContext;
    }

    return {
      success: stageResults.every(r => !r.hasErrors),
      stageResults,
      finalContext: currentContext
    };
  }
}

interface EvaluationStage {
  name: string;
  evaluate(context: EvaluationContext): Promise<StageResult>;
}

class ExclusionRuleStage implements EvaluationStage {
  name = 'exclusion';

  async evaluate(context: EvaluationContext): Promise<StageResult> {
    const exclusionRules = context.rules.filter(r => r.type === RuleType.EXCLUSION);
    const violations: RuleViolation[] = [];

    for (const rule of exclusionRules) {
      if (this.ruleMatches(rule, context)) {
        violations.push({
          ruleId: rule.id,
          message: rule.action.message || rule.description,
          severity: 'error'
        });
      }
    }

    return {
      stageName: this.name,
      hasErrors: violations.length > 0,
      violations,
      abort: violations.length > 0 // Abort on exclusion violations
    };
  }

  private ruleMatches(rule: CompositionRule, context: EvaluationContext): boolean {
    // Implementation of rule matching logic
    return false;
  }
}

interface EvaluationContext {
  templates: string[];
  metadata: Map<string, TemplateMetadata>;
  rules: CompositionRule[];
  options: EvaluationOptions;
}

interface StageResult {
  stageName: string;
  hasErrors: boolean;
  violations: RuleViolation[];
  warnings?: string[];
  suggestions?: string[];
  abort?: boolean;
  updatedContext?: EvaluationContext;
}

interface RuleViolation {
  ruleId: string;
  message: string;
  severity: 'error' | 'warning';
}

interface PipelineResult {
  success: boolean;
  stageResults: StageResult[];
  finalContext: EvaluationContext;
}
```

### Conflict Resolution Strategies

```typescript
class ConflictResolver {
  private strategies: Map<string, ResolutionStrategyHandler> = new Map();

  constructor() {
    this.registerDefaultStrategies();
  }

  private registerDefaultStrategies(): void {
    this.strategies.set('prefer_first', {
      resolve: (conflict, templates) => {
        return {
          action: 'keep',
          template: conflict.templates[0],
          remove: conflict.templates.slice(1)
        };
      }
    });

    this.strategies.set('prefer_last', {
      resolve: (conflict, templates) => {
        return {
          action: 'keep',
          template: conflict.templates[conflict.templates.length - 1],
          remove: conflict.templates.slice(0, -1)
        };
      }
    });

    this.strategies.set('merge', {
      resolve: (conflict, templates) => {
        return {
          action: 'merge',
          templates: conflict.templates,
          mergeStrategy: 'deep'
        };
      }
    });
  }

  resolve(conflict: ConflictReport, strategy: string): ResolutionResult {
    const handler = this.strategies.get(strategy);
    if (!handler) {
      throw new Error(`Unknown resolution strategy: ${strategy}`);
    }

    return handler.resolve(conflict, conflict.templates);
  }

  registerStrategy(name: string, handler: ResolutionStrategyHandler): void {
    this.strategies.set(name, handler);
  }
}

interface ResolutionStrategyHandler {
  resolve(conflict: ConflictReport, templates: string[]): ResolutionResult;
}

interface ResolutionResult {
  action: 'keep' | 'remove' | 'merge' | 'replace';
  template?: string;
  templates?: string[];
  remove?: string[];
  replacement?: string;
  mergeStrategy?: string;
}
```

## Integration Points

### Brief Analysis Integration

```typescript
class BriefCompositionAnalyzer {
  private rulesEngine: CompositionRulesEngine;

  async analyzeComposition(brief: BriefAnalysis): Promise<CompositionAnalysis> {
    const suggestedTemplates = await this.suggestTemplates(brief);
    const evaluation = this.rulesEngine.evaluateRules(suggestedTemplates);
    const conflicts = this.rulesEngine.detectConflicts(suggestedTemplates);

    return {
      suggestedTemplates,
      valid: evaluation.valid,
      conflicts,
      resolutions: this.rulesEngine.resolveConflicts(conflicts),
      warnings: evaluation.warnings,
      suggestions: evaluation.suggestions
    };
  }

  private async suggestTemplates(brief: BriefAnalysis): Promise<string[]> {
    const templates: string[] = [];

    // Add domain-specific templates
    for (const domain of brief.domains) {
      templates.push(...this.getTemplatesForDomain(domain));
    }

    // Add feature-specific templates
    for (const feature of brief.features) {
      templates.push(...this.getTemplatesForFeature(feature));
    }

    return [...new Set(templates)]; // Deduplicate
  }

  private getTemplatesForDomain(domain: string): string[] {
    const domainTemplates: Record<string, string[]> = {
      'commerce': ['commerce/payment-processing', 'commerce/shopping-cart', 'commerce/product-catalog'],
      'healthcare': ['healthcare/patient-data-management', 'healthcare/hipaa-compliance'],
      'fintech': ['fintech/account-management', 'fintech/transaction-processing']
    };
    return domainTemplates[domain] || [];
  }

  private getTemplatesForFeature(feature: string): string[] {
    const featureTemplates: Record<string, string[]> = {
      'authentication': ['security/multi-factor-auth', 'feature-patterns/auth-oauth'],
      'real-time': ['real-time-communication/websocket-management'],
      'search': ['search-discovery/full-text-search']
    };
    return featureTemplates[feature] || [];
  }
}

interface CompositionAnalysis {
  suggestedTemplates: string[];
  valid: boolean;
  conflicts: ConflictReport[];
  resolutions: ConflictResolution[];
  warnings: string[];
  suggestions: string[];
}
```

## Testing Considerations

### Property-Based Tests

```typescript
describe('Composition Rules Properties', () => {
  it('should detect conflicts symmetrically', () => {
    fc.assert(fc.property(
      fc.string({ minLength: 1, maxLength: 50 }),
      fc.string({ minLength: 1, maxLength: 50 }),
      async (templateA, templateB) => {
        fc.pre(templateA !== templateB);
        
        const engine = new TemplateCompositionRulesEngine();
        
        const compatAB = engine.checkCompatibility(templateA, templateB);
        const compatBA = engine.checkCompatibility(templateB, templateA);
        
        // Compatibility should be symmetric
        expect(compatAB.compatible).toBe(compatBA.compatible);
      }
    ));
  });

  it('should provide resolutions for all detected conflicts', () => {
    fc.assert(fc.property(
      fc.array(fc.string({ minLength: 1, maxLength: 50 }), { minLength: 2, maxLength: 10 }),
      async (templates) => {
        const engine = new TemplateCompositionRulesEngine();
        
        const conflicts = engine.detectConflicts(templates);
        const resolutions = engine.resolveConflicts(conflicts);
        
        // Every conflict should have a resolution attempt
        expect(resolutions.length).toBe(conflicts.length);
        
        // Each resolution should reference its conflict
        for (let i = 0; i < conflicts.length; i++) {
          expect(resolutions[i].conflict).toBe(conflicts[i]);
        }
      }
    ));
  });
});
```

## Configuration Examples

### Composition Rules Configuration

```yaml
composition_rules:
  evaluation:
    strict_mode: false
    fail_on_warnings: false
    max_conflicts: 10
  
  resolution:
    auto_resolve: true
    default_strategy: "prefer_first"
    require_confirmation: true
  
  custom_rules:
    - id: "custom-domain-rule"
      name: "Custom Domain Rule"
      type: "conflict"
      priority: 100
      condition:
        type: "custom"
        expression: "HAS_DOMAIN('healthcare') AND HAS_TAG('public-api')"
      action:
        type: "warn"
        message: "Healthcare APIs should not be public without additional security"
```

## Related Templates

- `template-metadata.md` - Metadata management
- `template-validation.md` - Validation patterns
- `composition-optimization.md` - Optimization strategies
- `parameter-validation.md` - Parameter validation
