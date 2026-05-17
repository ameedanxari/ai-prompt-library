/**
 * Domain Processor
 *
 * Maps raw user language to domain-specific concepts, applies domain
 * constraints, and enriches the intent with contextual knowledge.
 *
 * Validates: Requirements 1.2, 15.3
 */

import { ParsedIntent } from './intent-parser';

/**
 * A domain concept recognised in the user's intent
 */
export interface DomainConcept {
  name: string;
  domain: string;
  synonyms: string[];
  constraints: string[];
  relatedConcepts: string[];
}

/**
 * Enriched intent after domain processing
 */
export interface DomainEnrichedIntent {
  original: ParsedIntent;
  concepts: DomainConcept[];
  domainConstraints: string[];
  suggestedTechnologies: string[];
}

export class DomainProcessor {
  private domainKnowledge: Map<string, DomainConcept[]> = new Map();

  constructor() {
    this.seedKnowledge();
  }

  /**
   * Processes raw intent through domain-specific knowledge
   */
  public async process(intent: ParsedIntent): Promise<DomainEnrichedIntent> {
    const concepts = this.matchConcepts(intent.raw);
    const domainConstraints = concepts.flatMap(c => c.constraints);
    const suggestedTechnologies = this.suggestTechnologies(concepts);

    return {
      original: intent,
      concepts,
      domainConstraints,
      suggestedTechnologies
    };
  }

  /**
   * Registers new domain knowledge
   */
  public registerDomain(domain: string, concepts: DomainConcept[]): void {
    this.domainKnowledge.set(domain, concepts);
  }

  private matchConcepts(text: string): DomainConcept[] {
    const matches: DomainConcept[] = [];
    const lower = text.toLowerCase();

    for (const concepts of this.domainKnowledge.values()) {
      for (const concept of concepts) {
        const terms = [concept.name, ...concept.synonyms];
        if (terms.some(t => lower.includes(t.toLowerCase()))) {
          matches.push(concept);
        }
      }
    }
    return matches;
  }

  private suggestTechnologies(concepts: DomainConcept[]): string[] {
    const techs = new Set<string>();
    for (const c of concepts) {
      if (c.domain === 'ecommerce') { techs.add('Stripe'); techs.add('PostgreSQL'); }
      if (c.domain === 'auth') { techs.add('OAuth2'); techs.add('JWT'); }
      if (c.domain === 'realtime') { techs.add('WebSocket'); techs.add('Redis'); }
    }
    return Array.from(techs);
  }

  private seedKnowledge(): void {
    this.domainKnowledge.set('auth', [
      {
        name: 'authentication',
        domain: 'auth',
        synonyms: ['login', 'signup', 'sign-in', 'register'],
        constraints: ['Must support MFA', 'Must hash passwords'],
        relatedConcepts: ['authorization', 'session', 'token']
      }
    ]);

    this.domainKnowledge.set('ecommerce', [
      {
        name: 'payment',
        domain: 'ecommerce',
        synonyms: ['checkout', 'billing', 'stripe', 'purchase'],
        constraints: ['PCI-DSS compliance', 'Idempotent transactions'],
        relatedConcepts: ['cart', 'invoice', 'refund']
      }
    ]);

    this.domainKnowledge.set('realtime', [
      {
        name: 'real-time communication',
        domain: 'realtime',
        synonyms: ['chat', 'messaging', 'notifications', 'live'],
        constraints: ['Max latency 200 ms', 'Reconnect on drop'],
        relatedConcepts: ['presence', 'typing-indicator']
      }
    ]);
  }
}
