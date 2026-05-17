/**
 * Intent Parser
 * 
 * Parses high-level natural language user intent into structured requirements,
 * constraints, and technical specifications.
 * 
 * Validates: Requirements 1.1, 1.2, 1.4, 1.5
 */

/**
 * Structured result of intent parsing
 */
export interface ParsedIntent {
  raw: string;
  category: 'feature' | 'refactor' | 'fix' | 'architecture' | 'deployment';
  summary: string;
  entities: string[];
  intent: string;
  confidence: number;
}

export interface IntentParser {
  /**
   * Parses raw user input into structured intent
   */
  parseIntent(input: string): Promise<ParsedIntent>;

  /**
   * Extracts high-level technical requirements from the intent
   */
  extractRequirements(intent: ParsedIntent): Promise<string[]>;

  /**
   * Identifies explicit and implicit technical constraints
   */
  identifyConstraints(intent: ParsedIntent): Promise<string[]>;
}

export class DefaultIntentParser implements IntentParser {
  /**
   * Parses intent using basic heuristic analysis
   */
  public async parseIntent(input: string): Promise<ParsedIntent> {
    const lowerInput = input.toLowerCase();
    let category: ParsedIntent['category'] = 'feature';

    if (lowerInput.includes('fix') || lowerInput.includes('bug')) category = 'fix';
    else if (lowerInput.includes('refactor') || lowerInput.includes('clean')) category = 'refactor';
    else if (lowerInput.includes('architect') || lowerInput.includes('design')) category = 'architecture';
    else if (lowerInput.includes('deploy') || lowerInput.includes('setup')) category = 'deployment';

    return {
      raw: input,
      category,
      summary: input.substring(0, 100),
      entities: this.extractEntities(input),
      intent: category,
      confidence: 0.8
    };
  }

  public async extractRequirements(intent: ParsedIntent): Promise<string[]> {
    const requirements = new Set<string>();
    const text = intent.raw.toLowerCase();

    if (/(login|sign in|signup|sign up|auth)/.test(text)) requirements.add('Authentication and account access');
    if (/(profile|user page|account page)/.test(text)) requirements.add('User profile management');
    if (/(feed|timeline|post|comment|like)/.test(text)) requirements.add('Content feed and engagement workflows');
    if (/(stripe|billing|subscription|payment)/.test(text)) requirements.add('Billing and payment integration');
    if (/(gdpr|privacy|consent|delete account|export data)/.test(text)) requirements.add('Privacy, consent, export, and deletion controls');
    if (/(accessibility|wcag|screen reader|keyboard)/.test(text)) requirements.add('Accessibility compliance');
    if (/(deploy|production|hosting|ci|pipeline)/.test(text)) requirements.add('Deployment and operational readiness');

    if (requirements.size === 0) {
      requirements.add(`${intent.category} implementation for: ${intent.summary}`);
    }

    return Array.from(requirements);
  }

  public async identifyConstraints(intent: ParsedIntent): Promise<string[]> {
    const constraints: string[] = [];
    if (intent.raw.includes('fast')) constraints.push('Performance optimization required');
    if (intent.raw.includes('secure')) constraints.push('Security audit required');
    return constraints;
  }

  private extractEntities(input: string): string[] {
    const words = input.split(/\s+/);
    return words.filter(w => w.length > 5 && /^[A-Z]/.test(w)); // Simple heuristic for proper nouns
  }
}
