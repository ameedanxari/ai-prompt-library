/**
 * Requirement Extractor
 *
 * Transforms parsed user intent into structured technical requirements,
 * including functional specs, quality attributes, and acceptance criteria.
 *
 * Validates: Requirements 1.1, 1.2, 1.4
 */

import { ParsedIntent } from './intent-parser';

/**
 * Quality attribute dimension for a requirement
 */
export type QualityAttribute =
  | 'performance'
  | 'security'
  | 'reliability'
  | 'scalability'
  | 'maintainability'
  | 'usability'
  | 'accessibility'
  | 'testability';

/**
 * A single extracted technical requirement
 */
export interface TechnicalRequirement {
  id: string;
  title: string;
  description: string;
  category: 'functional' | 'non-functional' | 'constraint';
  priority: 'must-have' | 'should-have' | 'nice-to-have';
  qualityAttributes: QualityAttribute[];
  acceptanceCriteria: string[];
  dependencies: string[];
  estimatedComplexity: 'low' | 'medium' | 'high';
}

/**
 * Full extraction result
 */
export interface ExtractionResult {
  intent: ParsedIntent;
  requirements: TechnicalRequirement[];
  assumptions: string[];
  risks: string[];
  suggestedArchitecture: string;
}

export class RequirementExtractor {
  private requirementCounter = 0;

  /**
   * Extracts a full set of requirements from a parsed intent
   */
  public async extract(intent: ParsedIntent): Promise<ExtractionResult> {
    const requirements: TechnicalRequirement[] = [];
    const assumptions: string[] = [];
    const risks: string[] = [];

    // Functional requirements from entities and intent
    for (const entity of intent.entities) {
      requirements.push(this.createRequirement(
        `Implement ${entity}`,
        `Full implementation of the ${entity} component as described in the user intent`,
        'functional',
        'must-have',
        ['maintainability', 'testability']
      ));
    }

    // Non-functional requirements inferred from category
    if (intent.category === 'feature') {
      requirements.push(this.createRequirement(
        'Test coverage',
        'All new features must have ≥ 80 % unit and integration test coverage',
        'non-functional',
        'must-have',
        ['testability', 'reliability']
      ));
    }

    if (intent.category === 'deployment') {
      requirements.push(this.createRequirement(
        'Zero-downtime deployment',
        'Deployment must support rolling updates with zero downtime',
        'non-functional',
        'should-have',
        ['reliability', 'scalability']
      ));
    }

    // Default assumption and risk
    assumptions.push('The target runtime is Node.js ≥ 18');
    risks.push('Incomplete intent may lead to missing requirements');

    return {
      intent,
      requirements,
      assumptions,
      risks,
      suggestedArchitecture: this.inferArchitecture(intent)
    };
  }

  /**
   * Identifies quality attributes from raw text signals
   */
  public identifyQualityAttributes(text: string): QualityAttribute[] {
    const attrs: QualityAttribute[] = [];
    const lower = text.toLowerCase();
    if (lower.includes('fast') || lower.includes('latency') || lower.includes('performance')) attrs.push('performance');
    if (lower.includes('secure') || lower.includes('auth') || lower.includes('encrypt')) attrs.push('security');
    if (lower.includes('scale') || lower.includes('concurrent')) attrs.push('scalability');
    if (lower.includes('accessible') || lower.includes('a11y')) attrs.push('accessibility');
    if (lower.includes('test') || lower.includes('coverage')) attrs.push('testability');
    if (lower.includes('reliable') || lower.includes('uptime')) attrs.push('reliability');
    return attrs;
  }

  private createRequirement(
    title: string,
    description: string,
    category: TechnicalRequirement['category'],
    priority: TechnicalRequirement['priority'],
    qualityAttributes: QualityAttribute[]
  ): TechnicalRequirement {
    this.requirementCounter++;
    return {
      id: `REQ-${String(this.requirementCounter).padStart(4, '0')}`,
      title,
      description,
      category,
      priority,
      qualityAttributes,
      acceptanceCriteria: [`${title} is implemented and verified`],
      dependencies: [],
      estimatedComplexity: 'medium'
    };
  }

  private inferArchitecture(intent: ParsedIntent): string {
    switch (intent.category) {
      case 'feature': return 'modular-monolith';
      case 'deployment': return 'microservices';
      case 'architecture': return 'event-driven';
      default: return 'layered';
    }
  }
}
