import { existsSync, readFileSync, readdirSync } from 'fs';
import { join } from 'path';

/**
 * Template Composition Engine
 * 
 * Selects and composes appropriate templates based on project domain and requirements.
 * Implements domain identification, core template selection, and cross-cutting template inclusion.
 * 
 * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5
 */

export enum ApplicationDomain {
  COMMERCE = 'commerce',
  SOCIAL = 'social',
  FINTECH = 'fintech',
  HEALTHCARE = 'healthcare',
  ENTERPRISE_SAAS = 'enterprise-saas',
  IOT = 'iot',
  MEDIA = 'media',
  GAMING = 'gaming',
  GENERAL = 'general'
}

export interface ProjectBrief {
  description: string;
  platforms: string[];
  domain?: string;
  requirements: string[];
  features?: string[];
}

export interface Template {
  id: string;
  name: string;
  path: string;
  domain: ApplicationDomain | 'cross-cutting';
  category: string;
  dependencies: string[];
  tags: string[];
}

export interface Requirements {
  functional: string[];
  nonFunctional: string[];
  compliance?: string[];
  security?: string[];
}

export interface Specification {
  id: string;
  name: string;
  templates: Template[];
  content: string;
  domain: ApplicationDomain;
  crossCuttingConcerns: string[];
}

export interface TemplateIntegrationResult {
  isValid: boolean;
  conflicts: string[];
  missingDependencies: string[];
  warnings: string[];
}

export interface DomainIdentificationResult {
  primaryDomain: ApplicationDomain;
  confidence: number;
  secondaryDomains: ApplicationDomain[];
  keywords: string[];
}

// Domain keywords for identification
const DOMAIN_KEYWORDS: Record<ApplicationDomain, string[]> = {
  [ApplicationDomain.COMMERCE]: [
    'shop', 'store', 'cart', 'checkout', 'payment', 'product', 'catalog',
    'inventory', 'order', 'shipping', 'ecommerce', 'marketplace', 'retail'
  ],
  [ApplicationDomain.SOCIAL]: [
    'social', 'feed', 'post', 'comment', 'like', 'share', 'follow', 'friend',
    'message', 'chat', 'community', 'profile', 'notification', 'timeline'
  ],
  [ApplicationDomain.FINTECH]: [
    'finance', 'bank', 'payment', 'transaction', 'account', 'transfer', 'wallet',
    'investment', 'trading', 'crypto', 'loan', 'credit', 'insurance', 'compliance'
  ],
  [ApplicationDomain.HEALTHCARE]: [
    'health', 'medical', 'patient', 'doctor', 'appointment', 'prescription',
    'diagnosis', 'treatment', 'hospital', 'clinic', 'hipaa', 'ehr', 'telehealth'
  ],
  [ApplicationDomain.ENTERPRISE_SAAS]: [
    'enterprise', 'saas', 'subscription', 'tenant', 'admin', 'dashboard',
    'analytics', 'reporting', 'workflow', 'integration', 'api', 'b2b'
  ],
  [ApplicationDomain.IOT]: [
    'iot', 'device', 'sensor', 'telemetry', 'mqtt', 'embedded', 'firmware',
    'gateway', 'edge', 'smart', 'connected', 'automation'
  ],
  [ApplicationDomain.MEDIA]: [
    'media', 'video', 'audio', 'stream', 'content', 'playlist', 'podcast',
    'broadcast', 'live', 'vod', 'cdn', 'transcoding'
  ],
  [ApplicationDomain.GAMING]: [
    'game', 'player', 'score', 'level', 'achievement', 'leaderboard',
    'multiplayer', 'matchmaking', 'lobby', 'virtual', 'reward'
  ],
  [ApplicationDomain.GENERAL]: []
};

// Cross-cutting template categories
const CROSS_CUTTING_CATEGORIES = [
  'security',
  'analytics',
  'accessibility',
  'performance',
  'testing',
  'deployment',
  'documentation',
  'monitoring'
];

export class TemplateCompositionEngine {
  private templatesPath: string;
  private availableTemplates: Map<string, Template> = new Map();

  constructor(templatesPath: string = 'prompts/modules') {
    this.templatesPath = templatesPath;
    this.loadAvailableTemplates();
  }

  /**
   * Identify the application domain from a project brief
   */
  identifyDomain(brief: ProjectBrief): DomainIdentificationResult {
    const text = `${brief.description} ${brief.requirements.join(' ')} ${(brief.features || []).join(' ')}`.toLowerCase();
    const scores: Record<ApplicationDomain, number> = {} as Record<ApplicationDomain, number>;
    const matchedKeywords: string[] = [];

    // Calculate scores for each domain
    for (const [domain, keywords] of Object.entries(DOMAIN_KEYWORDS)) {
      scores[domain as ApplicationDomain] = 0;
      for (const keyword of keywords) {
        if (text.includes(keyword.toLowerCase())) {
          scores[domain as ApplicationDomain]++;
          matchedKeywords.push(keyword);
        }
      }
    }

    // Find primary domain
    let primaryDomain = ApplicationDomain.GENERAL;
    let maxScore = 0;
    for (const [domain, score] of Object.entries(scores)) {
      if (score > maxScore) {
        maxScore = score;
        primaryDomain = domain as ApplicationDomain;
      }
    }

    // Find secondary domains (score > 0 and not primary)
    const secondaryDomains = Object.entries(scores)
      .filter(([domain, score]) => score > 0 && domain !== primaryDomain)
      .sort((a, b) => b[1] - a[1])
      .map(([domain]) => domain as ApplicationDomain);

    // Calculate confidence (0-1)
    const totalKeywords = Object.values(DOMAIN_KEYWORDS).flat().length;
    const confidence = maxScore > 0 ? Math.min(maxScore / 5, 1) : 0;

    return {
      primaryDomain,
      confidence,
      secondaryDomains,
      keywords: [...new Set(matchedKeywords)]
    };
  }

  /**
   * Select core templates for a domain
   */
  selectCoreTemplates(domain: ApplicationDomain): Template[] {
    const templates: Template[] = [];

    // Get domain-specific templates
    for (const [id, template] of this.availableTemplates) {
      if (template.domain === domain || template.domain === ApplicationDomain.GENERAL) {
        templates.push(template);
      }
    }

    // If no domain-specific templates, use general templates
    if (templates.length === 0) {
      for (const [id, template] of this.availableTemplates) {
        if (template.domain === 'cross-cutting' || template.category === 'core') {
          templates.push(template);
        }
      }
    }

    return templates;
  }

  /**
   * Add cross-cutting templates based on requirements
   */
  addCrossCuttingTemplates(requirements: Requirements): Template[] {
    const templates: Template[] = [];
    const allRequirements = [
      ...requirements.functional,
      ...requirements.nonFunctional,
      ...(requirements.compliance || []),
      ...(requirements.security || [])
    ].join(' ').toLowerCase();

    // Check for security requirements
    if (allRequirements.includes('security') || allRequirements.includes('auth') || 
        allRequirements.includes('encrypt') || requirements.security?.length) {
      templates.push(...this.getTemplatesByCategory('security'));
    }

    // Check for analytics requirements
    if (allRequirements.includes('analytics') || allRequirements.includes('tracking') ||
        allRequirements.includes('metrics')) {
      templates.push(...this.getTemplatesByCategory('analytics'));
    }

    // Check for accessibility requirements
    if (allRequirements.includes('accessibility') || allRequirements.includes('wcag') ||
        allRequirements.includes('a11y')) {
      templates.push(...this.getTemplatesByCategory('accessibility'));
    }

    // Check for performance requirements
    if (allRequirements.includes('performance') || allRequirements.includes('scalab') ||
        allRequirements.includes('optimi')) {
      templates.push(...this.getTemplatesByCategory('performance'));
    }

    // Check for compliance requirements
    if (requirements.compliance?.length || allRequirements.includes('compliance') ||
        allRequirements.includes('gdpr') || allRequirements.includes('hipaa')) {
      templates.push(...this.getTemplatesByCategory('compliance'));
    }

    // Always include testing templates
    templates.push(...this.getTemplatesByCategory('testing'));

    return [...new Map(templates.map(t => [t.id, t])).values()];
  }

  /**
   * Compose specifications from selected templates
   */
  composeSpecifications(templates: Template[], domain: ApplicationDomain): Specification {
    const crossCuttingConcerns = templates
      .filter(t => t.domain === 'cross-cutting')
      .map(t => t.category);

    const content = this.generateSpecificationContent(templates, domain);

    return {
      id: `spec-${domain}-${Date.now()}`,
      name: `${domain} Application Specification`,
      templates,
      content,
      domain,
      crossCuttingConcerns: [...new Set(crossCuttingConcerns)]
    };
  }

  /**
   * Validate template integration
   */
  validateTemplateIntegration(templates: Template[]): TemplateIntegrationResult {
    const conflicts: string[] = [];
    const missingDependencies: string[] = [];
    const warnings: string[] = [];

    const templateIds = new Set(templates.map(t => t.id));

    // Check for missing dependencies
    for (const template of templates) {
      for (const dep of template.dependencies) {
        if (!templateIds.has(dep)) {
          missingDependencies.push(`${template.id} requires ${dep}`);
        }
      }
    }

    // Check for conflicts (templates with same category but different domains)
    const categoryDomains = new Map<string, Set<string>>();
    for (const template of templates) {
      if (!categoryDomains.has(template.category)) {
        categoryDomains.set(template.category, new Set());
      }
      categoryDomains.get(template.category)!.add(template.domain as string);
    }

    for (const [category, domains] of categoryDomains) {
      if (domains.size > 2) { // Allow cross-cutting + one domain
        conflicts.push(`Multiple domain templates for category: ${category}`);
      }
    }

    // Add warnings for large template sets
    if (templates.length > 20) {
      warnings.push('Large number of templates may increase complexity');
    }

    return {
      isValid: conflicts.length === 0 && missingDependencies.length === 0,
      conflicts,
      missingDependencies,
      warnings
    };
  }

  /**
   * Get all available templates
   */
  getAvailableTemplates(): Template[] {
    return Array.from(this.availableTemplates.values());
  }

  /**
   * Get templates by category
   */
  getTemplatesByCategory(category: string): Template[] {
    return Array.from(this.availableTemplates.values())
      .filter(t => t.category === category);
  }

  /**
   * Get templates by domain
   */
  getTemplatesByDomain(domain: ApplicationDomain): Template[] {
    return Array.from(this.availableTemplates.values())
      .filter(t => t.domain === domain);
  }

  // Private methods

  private loadAvailableTemplates(): void {
    // Load templates from the modules directory
    const modulesPath = join(process.cwd(), this.templatesPath);
    
    if (!existsSync(modulesPath)) {
      // Create default templates if path doesn't exist
      this.createDefaultTemplates();
      return;
    }

    try {
      const categories = readdirSync(modulesPath, { withFileTypes: true })
        .filter(d => d.isDirectory())
        .map(d => d.name);

      for (const category of categories) {
        const categoryPath = join(modulesPath, category);
        const files = readdirSync(categoryPath)
          .filter(f => f.endsWith('.md'));

        for (const file of files) {
          const template = this.parseTemplate(categoryPath, file, category);
          if (template) {
            this.availableTemplates.set(template.id, template);
          }
        }
      }
    } catch (error) {
      // Fall back to default templates
      this.createDefaultTemplates();
    }
  }

  private parseTemplate(categoryPath: string, filename: string, category: string): Template | null {
    const id = `${category}/${filename.replace('.md', '')}`;
    const name = filename.replace('.md', '').replace(/-/g, ' ');
    
    // Determine domain from category
    let domain: ApplicationDomain | 'cross-cutting' = 'cross-cutting';
    if (CROSS_CUTTING_CATEGORIES.includes(category)) {
      domain = 'cross-cutting';
    } else if (Object.values(ApplicationDomain).includes(category as ApplicationDomain)) {
      domain = category as ApplicationDomain;
    }

    return {
      id,
      name,
      path: join(categoryPath, filename),
      domain,
      category,
      dependencies: [],
      tags: [category]
    };
  }

  private createDefaultTemplates(): void {
    // Create default templates for each domain and cross-cutting concern
    const domains = Object.values(ApplicationDomain);
    
    for (const domain of domains) {
      this.availableTemplates.set(`${domain}/core`, {
        id: `${domain}/core`,
        name: `${domain} Core Template`,
        path: `${this.templatesPath}/${domain}/core.md`,
        domain,
        category: 'core',
        dependencies: [],
        tags: [domain, 'core']
      });
    }

    for (const category of CROSS_CUTTING_CATEGORIES) {
      this.availableTemplates.set(`cross-cutting/${category}`, {
        id: `cross-cutting/${category}`,
        name: `${category} Template`,
        path: `${this.templatesPath}/cross-cutting/${category}.md`,
        domain: 'cross-cutting',
        category,
        dependencies: [],
        tags: ['cross-cutting', category]
      });
    }
  }

  private generateSpecificationContent(templates: Template[], domain: ApplicationDomain): string {
    const coreTemplates = templates.filter(t => t.domain === domain || t.domain === ApplicationDomain.GENERAL);
    const crossCuttingTemplates = templates.filter(t => t.domain === 'cross-cutting');

    return `# ${domain} Application Specification

## Overview
This specification defines the requirements and architecture for a ${domain} application.

## Core Templates
${coreTemplates.map(t => `- ${t.name} (${t.id})`).join('\n')}

## Cross-Cutting Concerns
${crossCuttingTemplates.map(t => `- ${t.name} (${t.category})`).join('\n')}

## Template Integration
Total templates: ${templates.length}
Core templates: ${coreTemplates.length}
Cross-cutting templates: ${crossCuttingTemplates.length}

## Implementation Notes
- Follow domain-specific patterns for ${domain}
- Ensure all cross-cutting concerns are addressed
- Validate template integration before implementation
`;
  }
}
