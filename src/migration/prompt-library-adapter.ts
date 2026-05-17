/**
 * Prompt Library Adapter
 *
 * Wraps the existing prompt library so that legacy prompts and
 * orchestrators can be consumed by the new skill-based system.
 *
 * Validates: Requirements 12.1, 12.2, 12.3
 */

import { SkillDefinition, createSkillDefinition, SkillCategory } from '../skill-system/skill-definition';

/**
 * A legacy prompt from the original library
 */
export interface LegacyPrompt {
  id: string;
  name: string;
  category: string;
  template: string;
  variables: string[];
  metadata?: Record<string, any>;
}

export class PromptLibraryAdapter {
  /**
   * Converts a legacy prompt into a SkillDefinition
   */
  public adaptPrompt(prompt: LegacyPrompt): SkillDefinition {
    const category = this.mapCategory(prompt.category);

    return createSkillDefinition({
      id: prompt.id,
      name: prompt.name,
      version: '1.0.0',
      description: `Adapted from legacy prompt: ${prompt.name}`,
      category,
      inputSchema: {
        type: 'object',
        properties: Object.fromEntries(prompt.variables.map(v => [v, { type: 'string' }])),
        required: prompt.variables
      },
      outputSchema: { type: 'object', properties: { result: { type: 'string' } } },
      implementation: {
        type: 'prompt-template',
        runtime: 'nodejs',
        entryPoint: 'render',
        source: prompt.template
      },
      keywords: ['legacy', 'adapted', prompt.category]
    });
  }

  /**
   * Batch-converts all legacy prompts
   */
  public adaptAll(prompts: LegacyPrompt[]): SkillDefinition[] {
    return prompts.map(p => this.adaptPrompt(p));
  }

  private mapCategory(legacy: string): SkillCategory {
    const mapping: Record<string, SkillCategory> = {
      'frontend': 'frontend',
      'backend': 'backend',
      'database': 'database',
      'devops': 'deployment',
      'testing': 'testing',
      'security': 'security',
      'monitoring': 'monitoring',
    };
    return mapping[legacy.toLowerCase()] || 'utility';
  }
}
