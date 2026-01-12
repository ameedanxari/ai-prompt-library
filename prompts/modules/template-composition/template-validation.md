# Template Validation System

## Purpose

This template provides comprehensive patterns for implementing quality checks, completeness verification, structure validation, and content quality assessment for templates across the AI Prompt Library.

## Context

Template quality directly impacts the effectiveness of generated specifications and implementations. This template establishes validation rules, quality metrics, and automated checking mechanisms to ensure templates meet quality standards.

## Core Components

### Validation Schema

## Examples

```typescript
interface ValidationResult {
  valid: boolean;
  score: number;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  suggestions: ValidationSuggestion[];
  metrics: QualityMetrics;
}

interface ValidationError {
  code: string;
  message: string;
  location?: ValidationLocation;
  severity: 'critical' | 'error';
}

interface ValidationWarning {
  code: string;
  message: string;
  location?: ValidationLocation;
  severity: 'warning';
}

interface ValidationSuggestion {
  code: string;
  message: string;
  improvement: string;
  impact: 'high' | 'medium' | 'low';
}


interface ValidationLocation {
  line?: number;
  column?: number;
  section?: string;
  path?: string;
}

interface QualityMetrics {
  completeness: number;
  clarity: number;
  consistency: number;
  codeQuality: number;
  documentationQuality: number;
  overall: number;
}
```

### Template Validator Service

```typescript
interface TemplateValidator {
  // Validation Operations
  validate(templateContent: string, options?: ValidationOptions): Promise<ValidationResult>;
  validateStructure(content: string): Promise<StructureValidationResult>;
  validateContent(content: string): Promise<ContentValidationResult>;
  validateCodeExamples(content: string): Promise<CodeValidationResult>;
  
  // Quality Assessment
  assessQuality(content: string): Promise<QualityAssessment>;
  calculateMetrics(content: string): Promise<QualityMetrics>;
  
  // Completeness Checks
  checkCompleteness(content: string, requirements: TemplateRequirements): Promise<CompletenessReport>;
  getMissingSections(content: string): Promise<string[]>;
}

class MarkdownTemplateValidator implements TemplateValidator {
  private structureRules: StructureRule[] = [];
  private contentRules: ContentRule[] = [];
  private codeRules: CodeRule[] = [];

  constructor() {
    this.initializeRules();
  }

  private initializeRules(): void {
    // Structure rules
    this.structureRules = [
      {
        id: 'has-title',
        name: 'Has Title',
        check: (content) => /^#\s+.+$/m.test(content),
        message: 'Template must have a title (H1 heading)',
        severity: 'critical'
      },
      {
        id: 'has-purpose',
        name: 'Has Purpose Section',
        check: (content) => /^##\s+Purpose/m.test(content),
        message: 'Template must have a Purpose section',
        severity: 'error'
      },
      {
        id: 'has-context',
        name: 'Has Context Section',
        check: (content) => /^##\s+Context/m.test(content),
        message: 'Template should have a Context section',
        severity: 'warning'
      },
      {
        id: 'has-core-components',
        name: 'Has Core Components',
        check: (content) => /^##\s+(Core Components|Implementation Patterns)/m.test(content),
        message: 'Template should have Core Components or Implementation Patterns section',
        severity: 'warning'
      },
      {
        id: 'has-examples',
        name: 'Has Examples',
        check: (content) => /^##\s+Examples/m.test(content) || /```[\s\S]*?```/.test(content),
        message: 'Template should include examples or code blocks',
        severity: 'warning'
      }
    ];

    // Content rules
    this.contentRules = [
      {
        id: 'min-length',
        name: 'Minimum Length',
        check: (content) => content.length >= 500,
        message: 'Template content is too short (minimum 500 characters)',
        severity: 'error'
      },
      {
        id: 'no-placeholder-text',
        name: 'No Placeholder Text',
        check: (content) => !/\[TODO\]|\[PLACEHOLDER\]|\[INSERT\]/i.test(content),
        message: 'Template contains placeholder text that should be replaced',
        severity: 'error'
      },
      {
        id: 'no-broken-links',
        name: 'No Broken Internal Links',
        check: (content) => {
          const links = content.match(/\[([^\]]+)\]\(([^)]+)\)/g) || [];
          return links.every(link => !link.includes('undefined') && !link.includes('null'));
        },
        message: 'Template contains broken internal links',
        severity: 'error'
      }
    ];

    // Code rules
    this.codeRules = [
      {
        id: 'code-has-language',
        name: 'Code Blocks Have Language',
        check: (content) => {
          const codeBlocks = content.match(/```[\s\S]*?```/g) || [];
          return codeBlocks.every(block => /^```[a-z]+/m.test(block));
        },
        message: 'All code blocks should specify a language',
        severity: 'warning'
      },
      {
        id: 'typescript-valid-syntax',
        name: 'TypeScript Valid Syntax',
        check: (content) => {
          const tsBlocks = this.extractCodeBlocks(content, 'typescript');
          return tsBlocks.every(block => this.isValidTypeScript(block));
        },
        message: 'TypeScript code blocks contain syntax errors',
        severity: 'error'
      }
    ];
  }

  async validate(templateContent: string, options?: ValidationOptions): Promise<ValidationResult> {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    const suggestions: ValidationSuggestion[] = [];

    // Structure validation
    const structureResult = await this.validateStructure(templateContent);
    errors.push(...structureResult.errors);
    warnings.push(...structureResult.warnings);

    // Content validation
    const contentResult = await this.validateContent(templateContent);
    errors.push(...contentResult.errors);
    warnings.push(...contentResult.warnings);

    // Code validation
    if (options?.validateCode !== false) {
      const codeResult = await this.validateCodeExamples(templateContent);
      errors.push(...codeResult.errors);
      warnings.push(...codeResult.warnings);
    }

    // Quality assessment
    const metrics = await this.calculateMetrics(templateContent);

    // Generate suggestions
    suggestions.push(...this.generateSuggestions(templateContent, metrics));

    return {
      valid: errors.filter(e => e.severity === 'critical').length === 0,
      score: metrics.overall,
      errors,
      warnings,
      suggestions,
      metrics
    };
  }

  async validateStructure(content: string): Promise<StructureValidationResult> {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    for (const rule of this.structureRules) {
      if (!rule.check(content)) {
        const item = {
          code: rule.id,
          message: rule.message,
          severity: rule.severity as any
        };

        if (rule.severity === 'critical' || rule.severity === 'error') {
          errors.push(item);
        } else {
          warnings.push(item);
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      sections: this.extractSections(content)
    };
  }

  async validateContent(content: string): Promise<ContentValidationResult> {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    for (const rule of this.contentRules) {
      if (!rule.check(content)) {
        const item = {
          code: rule.id,
          message: rule.message,
          severity: rule.severity as any
        };

        if (rule.severity === 'error') {
          errors.push(item);
        } else {
          warnings.push(item);
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      wordCount: this.countWords(content),
      readabilityScore: this.calculateReadability(content)
    };
  }

  async validateCodeExamples(content: string): Promise<CodeValidationResult> {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    const codeBlocks = this.extractAllCodeBlocks(content);

    for (const rule of this.codeRules) {
      if (!rule.check(content)) {
        const item = {
          code: rule.id,
          message: rule.message,
          severity: rule.severity as any
        };

        if (rule.severity === 'error') {
          errors.push(item);
        } else {
          warnings.push(item);
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      codeBlocks: codeBlocks.length,
      languages: [...new Set(codeBlocks.map(b => b.language))]
    };
  }

  async calculateMetrics(content: string): Promise<QualityMetrics> {
    const completeness = this.calculateCompleteness(content);
    const clarity = this.calculateClarity(content);
    const consistency = this.calculateConsistency(content);
    const codeQuality = this.calculateCodeQuality(content);
    const documentationQuality = this.calculateDocumentationQuality(content);

    const overall = (
      completeness * 0.25 +
      clarity * 0.20 +
      consistency * 0.15 +
      codeQuality * 0.25 +
      documentationQuality * 0.15
    );

    return {
      completeness,
      clarity,
      consistency,
      codeQuality,
      documentationQuality,
      overall
    };
  }

  private calculateCompleteness(content: string): number {
    const requiredSections = ['Purpose', 'Context', 'Core Components', 'Implementation Patterns', 'Examples'];
    const presentSections = requiredSections.filter(section => 
      new RegExp(`^##\\s+${section}`, 'm').test(content)
    );
    return (presentSections.length / requiredSections.length) * 100;
  }

  private calculateClarity(content: string): number {
    let score = 100;

    // Penalize very long sentences
    const sentences = content.split(/[.!?]+/);
    const longSentences = sentences.filter(s => s.split(/\s+/).length > 40);
    score -= longSentences.length * 5;

    // Penalize excessive jargon without explanation
    const jargonTerms = content.match(/\b[A-Z]{2,}\b/g) || [];
    const uniqueJargon = new Set(jargonTerms);
    if (uniqueJargon.size > 10) {
      score -= (uniqueJargon.size - 10) * 2;
    }

    return Math.max(0, Math.min(100, score));
  }

  private calculateConsistency(content: string): number {
    let score = 100;

    // Check heading consistency
    const headings = content.match(/^#+\s+.+$/gm) || [];
    const headingStyles = new Set(headings.map(h => {
      if (h.endsWith(':')) return 'colon';
      if (h.match(/[.!?]$/)) return 'punctuated';
      return 'plain';
    }));
    if (headingStyles.size > 1) score -= 10;

    // Check code block consistency
    const codeBlocks = this.extractAllCodeBlocks(content);
    const hasLanguage = codeBlocks.filter(b => b.language).length;
    if (hasLanguage > 0 && hasLanguage < codeBlocks.length) {
      score -= 15; // Inconsistent language specification
    }

    return Math.max(0, Math.min(100, score));
  }

  private calculateCodeQuality(content: string): number {
    const codeBlocks = this.extractAllCodeBlocks(content);
    if (codeBlocks.length === 0) return 50; // No code to evaluate

    let score = 100;

    for (const block of codeBlocks) {
      // Check for comments
      if (!block.code.includes('//') && !block.code.includes('/*')) {
        score -= 5;
      }

      // Check for type annotations (TypeScript)
      if (block.language === 'typescript') {
        const hasTypes = /:\s*(string|number|boolean|any|\w+\[\]|Record|Map|Set)/i.test(block.code);
        if (!hasTypes) score -= 5;
      }

      // Check for error handling
      if (block.code.includes('async') && !block.code.includes('catch') && !block.code.includes('try')) {
        score -= 5;
      }
    }

    return Math.max(0, Math.min(100, score));
  }

  private calculateDocumentationQuality(content: string): number {
    let score = 100;

    // Check for description after headings
    const sections = content.split(/^##/m);
    for (const section of sections) {
      if (section.trim() && !section.match(/^\s*\n\s*\w/)) {
        score -= 5; // Section without description
      }
    }

    // Check for examples
    if (!content.includes('Example') && !content.includes('```')) {
      score -= 20;
    }

    // Check for integration points
    if (!content.includes('Integration') && !content.includes('Related')) {
      score -= 10;
    }

    return Math.max(0, Math.min(100, score));
  }

  private generateSuggestions(content: string, metrics: QualityMetrics): ValidationSuggestion[] {
    const suggestions: ValidationSuggestion[] = [];

    if (metrics.completeness < 80) {
      suggestions.push({
        code: 'add-missing-sections',
        message: 'Template is missing some standard sections',
        improvement: 'Add Purpose, Context, Core Components, and Examples sections',
        impact: 'high'
      });
    }

    if (metrics.codeQuality < 70) {
      suggestions.push({
        code: 'improve-code-quality',
        message: 'Code examples could be improved',
        improvement: 'Add comments, type annotations, and error handling to code examples',
        impact: 'medium'
      });
    }

    if (metrics.clarity < 70) {
      suggestions.push({
        code: 'improve-clarity',
        message: 'Content clarity could be improved',
        improvement: 'Break long sentences, explain technical terms, and add more context',
        impact: 'medium'
      });
    }

    return suggestions;
  }

  private extractSections(content: string): string[] {
    const headings = content.match(/^##\s+(.+)$/gm) || [];
    return headings.map(h => h.replace(/^##\s+/, ''));
  }

  private extractCodeBlocks(content: string, language: string): string[] {
    const regex = new RegExp(`\`\`\`${language}\\n([\\s\\S]*?)\`\`\``, 'g');
    const blocks: string[] = [];
    let match;
    while ((match = regex.exec(content)) !== null) {
      blocks.push(match[1]);
    }
    return blocks;
  }

  private extractAllCodeBlocks(content: string): CodeBlock[] {
    const regex = /```(\w*)\n([\s\S]*?)```/g;
    const blocks: CodeBlock[] = [];
    let match;
    while ((match = regex.exec(content)) !== null) {
      blocks.push({
        language: match[1] || '',
        code: match[2]
      });
    }
    return blocks;
  }

  private countWords(content: string): number {
    return content.split(/\s+/).filter(w => w.length > 0).length;
  }

  private calculateReadability(content: string): number {
    // Simplified Flesch-Kincaid readability
    const words = this.countWords(content);
    const sentences = content.split(/[.!?]+/).length;
    const syllables = this.countSyllables(content);

    if (words === 0 || sentences === 0) return 0;

    const score = 206.835 - 1.015 * (words / sentences) - 84.6 * (syllables / words);
    return Math.max(0, Math.min(100, score));
  }

  private countSyllables(text: string): number {
    const words = text.toLowerCase().match(/\b[a-z]+\b/g) || [];
    return words.reduce((count, word) => {
      return count + this.countWordSyllables(word);
    }, 0);
  }

  private countWordSyllables(word: string): number {
    word = word.toLowerCase();
    if (word.length <= 3) return 1;
    
    word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
    word = word.replace(/^y/, '');
    
    const matches = word.match(/[aeiouy]{1,2}/g);
    return matches ? matches.length : 1;
  }

  private isValidTypeScript(code: string): boolean {
    // Basic syntax validation
    try {
      // Check for balanced braces
      let braceCount = 0;
      let parenCount = 0;
      let bracketCount = 0;

      for (const char of code) {
        if (char === '{') braceCount++;
        if (char === '}') braceCount--;
        if (char === '(') parenCount++;
        if (char === ')') parenCount--;
        if (char === '[') bracketCount++;
        if (char === ']') bracketCount--;

        if (braceCount < 0 || parenCount < 0 || bracketCount < 0) {
          return false;
        }
      }

      return braceCount === 0 && parenCount === 0 && bracketCount === 0;
    } catch {
      return false;
    }
  }
}

interface StructureRule {
  id: string;
  name: string;
  check: (content: string) => boolean;
  message: string;
  severity: 'critical' | 'error' | 'warning';
}

interface ContentRule {
  id: string;
  name: string;
  check: (content: string) => boolean;
  message: string;
  severity: 'error' | 'warning';
}

interface CodeRule {
  id: string;
  name: string;
  check: (content: string) => boolean;
  message: string;
  severity: 'error' | 'warning';
}

interface CodeBlock {
  language: string;
  code: string;
}

interface StructureValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  sections: string[];
}

interface ContentValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  wordCount: number;
  readabilityScore: number;
}

interface CodeValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  codeBlocks: number;
  languages: string[];
}

interface ValidationOptions {
  validateCode?: boolean;
  strictMode?: boolean;
  customRules?: StructureRule[];
}
```


## Implementation Patterns

### Completeness Checker

```typescript
class CompletenessChecker {
  private requirements: TemplateRequirements;

  constructor(requirements: TemplateRequirements) {
    this.requirements = requirements;
  }

  async check(content: string): Promise<CompletenessReport> {
    const missing: string[] = [];
    const present: string[] = [];
    const partial: PartialSection[] = [];

    // Check required sections
    for (const section of this.requirements.requiredSections) {
      const regex = new RegExp(`^##\\s+${section}`, 'm');
      if (regex.test(content)) {
        present.push(section);
        
        // Check section content
        const sectionContent = this.extractSectionContent(content, section);
        if (sectionContent.length < 100) {
          partial.push({
            section,
            reason: 'Section content is too brief',
            minimumLength: 100,
            actualLength: sectionContent.length
          });
        }
      } else {
        missing.push(section);
      }
    }

    // Check required elements
    const elementResults = this.checkRequiredElements(content);

    const completenessScore = this.calculateScore(present, missing, partial);

    return {
      complete: missing.length === 0 && partial.length === 0,
      score: completenessScore,
      present,
      missing,
      partial,
      elements: elementResults
    };
  }

  private extractSectionContent(content: string, sectionName: string): string {
    const regex = new RegExp(`^##\\s+${sectionName}\\s*\\n([\\s\\S]*?)(?=^##|$)`, 'm');
    const match = content.match(regex);
    return match ? match[1].trim() : '';
  }

  private checkRequiredElements(content: string): ElementCheckResult[] {
    const results: ElementCheckResult[] = [];

    // Check for TypeScript interfaces
    if (this.requirements.requiresInterfaces) {
      const interfaces = content.match(/interface\s+\w+/g) || [];
      results.push({
        element: 'TypeScript Interfaces',
        required: true,
        present: interfaces.length > 0,
        count: interfaces.length
      });
    }

    // Check for code examples
    if (this.requirements.requiresCodeExamples) {
      const codeBlocks = content.match(/```[\s\S]*?```/g) || [];
      results.push({
        element: 'Code Examples',
        required: true,
        present: codeBlocks.length > 0,
        count: codeBlocks.length
      });
    }

    // Check for integration points
    if (this.requirements.requiresIntegrationPoints) {
      const hasIntegration = /##\s+(Integration|Related Templates)/m.test(content);
      results.push({
        element: 'Integration Points',
        required: true,
        present: hasIntegration,
        count: hasIntegration ? 1 : 0
      });
    }

    return results;
  }

  private calculateScore(present: string[], missing: string[], partial: PartialSection[]): number {
    const total = present.length + missing.length;
    if (total === 0) return 0;

    const presentScore = present.length;
    const partialScore = partial.length * 0.5;
    
    return ((presentScore - partialScore) / total) * 100;
  }
}

interface TemplateRequirements {
  requiredSections: string[];
  requiresInterfaces: boolean;
  requiresCodeExamples: boolean;
  requiresIntegrationPoints: boolean;
  minimumWordCount: number;
}

interface CompletenessReport {
  complete: boolean;
  score: number;
  present: string[];
  missing: string[];
  partial: PartialSection[];
  elements: ElementCheckResult[];
}

interface PartialSection {
  section: string;
  reason: string;
  minimumLength: number;
  actualLength: number;
}

interface ElementCheckResult {
  element: string;
  required: boolean;
  present: boolean;
  count: number;
}
```

### Quality Assessment Pipeline

```typescript
class QualityAssessmentPipeline {
  private assessors: QualityAssessor[] = [];

  constructor() {
    this.initializeAssessors();
  }

  private initializeAssessors(): void {
    this.assessors = [
      new StructureAssessor(),
      new ContentAssessor(),
      new CodeAssessor(),
      new DocumentationAssessor(),
      new AccessibilityAssessor()
    ];
  }

  async assess(content: string): Promise<QualityAssessment> {
    const assessments: AssessorResult[] = [];

    for (const assessor of this.assessors) {
      const result = await assessor.assess(content);
      assessments.push(result);
    }

    const overallScore = this.calculateOverallScore(assessments);
    const grade = this.determineGrade(overallScore);

    return {
      overallScore,
      grade,
      assessments,
      recommendations: this.generateRecommendations(assessments)
    };
  }

  private calculateOverallScore(assessments: AssessorResult[]): number {
    const weights: Record<string, number> = {
      'structure': 0.20,
      'content': 0.25,
      'code': 0.25,
      'documentation': 0.20,
      'accessibility': 0.10
    };

    let weightedSum = 0;
    let totalWeight = 0;

    for (const assessment of assessments) {
      const weight = weights[assessment.category] || 0.1;
      weightedSum += assessment.score * weight;
      totalWeight += weight;
    }

    return totalWeight > 0 ? weightedSum / totalWeight : 0;
  }

  private determineGrade(score: number): string {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  }

  private generateRecommendations(assessments: AssessorResult[]): Recommendation[] {
    const recommendations: Recommendation[] = [];

    for (const assessment of assessments) {
      if (assessment.score < 70) {
        recommendations.push({
          category: assessment.category,
          priority: assessment.score < 50 ? 'high' : 'medium',
          suggestion: assessment.improvementSuggestion,
          expectedImpact: `+${Math.round((70 - assessment.score) * 0.5)} points`
        });
      }
    }

    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }
}

interface QualityAssessor {
  category: string;
  assess(content: string): Promise<AssessorResult>;
}

interface AssessorResult {
  category: string;
  score: number;
  details: string[];
  improvementSuggestion: string;
}

interface QualityAssessment {
  overallScore: number;
  grade: string;
  assessments: AssessorResult[];
  recommendations: Recommendation[];
}

interface Recommendation {
  category: string;
  priority: 'high' | 'medium' | 'low';
  suggestion: string;
  expectedImpact: string;
}

class StructureAssessor implements QualityAssessor {
  category = 'structure';

  async assess(content: string): Promise<AssessorResult> {
    let score = 100;
    const details: string[] = [];

    // Check heading hierarchy
    const headings = content.match(/^#+\s+.+$/gm) || [];
    const h1Count = headings.filter(h => h.startsWith('# ')).length;
    const h2Count = headings.filter(h => h.startsWith('## ')).length;

    if (h1Count !== 1) {
      score -= 20;
      details.push(`Expected 1 H1 heading, found ${h1Count}`);
    }

    if (h2Count < 3) {
      score -= 15;
      details.push(`Expected at least 3 H2 sections, found ${h2Count}`);
    }

    // Check section ordering
    const expectedOrder = ['Purpose', 'Context', 'Core Components'];
    const actualOrder = this.extractSectionOrder(content);
    if (!this.isCorrectOrder(expectedOrder, actualOrder)) {
      score -= 10;
      details.push('Sections are not in recommended order');
    }

    return {
      category: this.category,
      score: Math.max(0, score),
      details,
      improvementSuggestion: 'Ensure proper heading hierarchy and section ordering'
    };
  }

  private extractSectionOrder(content: string): string[] {
    const headings = content.match(/^##\s+(.+)$/gm) || [];
    return headings.map(h => h.replace(/^##\s+/, ''));
  }

  private isCorrectOrder(expected: string[], actual: string[]): boolean {
    let lastIndex = -1;
    for (const section of expected) {
      const index = actual.indexOf(section);
      if (index !== -1 && index < lastIndex) {
        return false;
      }
      if (index !== -1) {
        lastIndex = index;
      }
    }
    return true;
  }
}
```

## Integration Points

### Composition Engine Integration

```typescript
class ValidationAwareComposition {
  private validator: TemplateValidator;
  private qualityThreshold: number;

  constructor(validator: TemplateValidator, qualityThreshold: number = 70) {
    this.validator = validator;
    this.qualityThreshold = qualityThreshold;
  }

  async composeWithValidation(templates: TemplateContent[]): Promise<CompositionResult> {
    const validationResults: Map<string, ValidationResult> = new Map();
    const failedTemplates: string[] = [];

    // Validate each template
    for (const template of templates) {
      const result = await this.validator.validate(template.content);
      validationResults.set(template.id, result);

      if (!result.valid || result.score < this.qualityThreshold) {
        failedTemplates.push(template.id);
      }
    }

    if (failedTemplates.length > 0) {
      return {
        success: false,
        failedTemplates,
        validationResults,
        message: `${failedTemplates.length} template(s) failed validation`
      };
    }

    // Proceed with composition
    const composed = await this.compose(templates);

    return {
      success: true,
      composed,
      validationResults,
      message: 'All templates validated successfully'
    };
  }

  private async compose(templates: TemplateContent[]): Promise<string> {
    // Composition logic
    return templates.map(t => t.content).join('\n\n---\n\n');
  }
}

interface TemplateContent {
  id: string;
  content: string;
}

interface CompositionResult {
  success: boolean;
  composed?: string;
  failedTemplates?: string[];
  validationResults: Map<string, ValidationResult>;
  message: string;
}
```

## Testing Considerations

### Property-Based Tests

```typescript
describe('Template Validation Properties', () => {
  it('should produce consistent validation results', () => {
    fc.assert(fc.property(
      fc.string({ minLength: 100, maxLength: 10000 }),
      async (content) => {
        const validator = new MarkdownTemplateValidator();
        
        const result1 = await validator.validate(content);
        const result2 = await validator.validate(content);
        
        // Validation should be deterministic
        expect(result1.valid).toBe(result2.valid);
        expect(result1.score).toBe(result2.score);
        expect(result1.errors.length).toBe(result2.errors.length);
      }
    ));
  });

  it('should score valid templates higher than invalid ones', () => {
    fc.assert(fc.property(
      fc.boolean(),
      async (includeRequiredSections) => {
        const validator = new MarkdownTemplateValidator();
        
        const validContent = `# Template Title

## Purpose
This is the purpose section with enough content.

## Context
This is the context section.

## Core Components
\`\`\`typescript
interface Example {
  id: string;
}
\`\`\`
`;

        const invalidContent = `# Title
Some content without proper sections.
`;

        const validResult = await validator.validate(validContent);
        const invalidResult = await validator.validate(invalidContent);
        
        expect(validResult.score).toBeGreaterThan(invalidResult.score);
      }
    ));
  });
});
```

## Configuration Examples

### Validation Configuration

```yaml
validation:
  structure:
    required_sections:
      - Purpose
      - Context
      - Core Components
    optional_sections:
      - Examples
      - Integration Points
      - Testing Considerations
    
  content:
    min_word_count: 200
    max_word_count: 10000
    min_readability_score: 40
    
  code:
    require_language_specification: true
    validate_syntax: true
    supported_languages:
      - typescript
      - javascript
      - python
      - yaml
    
  quality:
    minimum_score: 70
    fail_on_critical_errors: true
    warn_on_suggestions: true
```

## Related Templates

- `template-metadata.md` - Metadata management
- `composition-rules.md` - Composition rules
- `parameter-validation.md` - Parameter validation
- `composition-optimization.md` - Optimization strategies
