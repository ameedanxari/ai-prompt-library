/**
 * Pattern Recognizer
 * 
 * Identifies common design patterns in existing code and suggests
 * appropriate patterns for new requirements.
 * 
 * Validates: Requirements 1.5, 8.1
 */

import { ExecutionContext } from '../execution/execution-runtime';

/**
 * A recognized or suggested design pattern
 */
export interface DesignPattern {
  name: string;
  type: 'creational' | 'structural' | 'behavioral' | 'architectural';
  confidence: number;
  location?: string;
  description: string;
  benefits: string[];
}

export class PatternRecognizer {
  /**
   * Scans code for existing design patterns
   */
  public async recognizePatterns(context: ExecutionContext): Promise<DesignPattern[]> {
    const patterns: DesignPattern[] = [];
    const text = JSON.stringify([context.input, context.output]).toLowerCase();

    if (text.includes('singleton') || text.includes('single instance')) {
      patterns.push({
        name: 'Singleton',
        type: 'creational',
        confidence: 0.8,
        description: 'Detected a single instance management pattern',
        benefits: ['Resource control', 'Global access point']
      });
    }

    if (text.includes('event') || text.includes('publish') || text.includes('subscribe')) {
      patterns.push({
        name: 'Observer',
        type: 'behavioral',
        confidence: 0.85,
        description: 'Detected event-oriented communication',
        benefits: ['Decoupling', 'Extensibility']
      });
    }

    return patterns;
  }

  /**
   * Suggests patterns based on requirements or intent
   */
  public async suggestPatterns(intent: string): Promise<DesignPattern[]> {
    const suggestions: DesignPattern[] = [];

    if (intent.toLowerCase().includes('pub/sub') || intent.toLowerCase().includes('event')) {
      suggestions.push({
        name: 'Observer',
        type: 'behavioral',
        confidence: 0.9,
        description: 'Ideal for decoupled communication between components',
        benefits: ['Decoupling', 'Extensibility']
      });
    }

    if (intent.toLowerCase().includes('abstraction') || intent.toLowerCase().includes('interface')) {
      suggestions.push({
        name: 'Factory Method',
        type: 'creational',
        confidence: 0.85,
        description: 'Provides an interface for creating objects in a superclass',
        benefits: ['Flexibility', 'Consistency']
      });
    }

    return suggestions;
  }
}
