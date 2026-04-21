import { readFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join, basename } from 'path';

export interface DomainCoverage {
  domain: string;
  templateCount: number;
  templates: string[];
  hasReadme: boolean;
  missingRequiredSections: string[];
  qualityScore: number;
}

export interface TemplateQuality {
  path: string;
  hasTitle: boolean;
  hasPurpose: boolean;
  hasContext: boolean;
  hasCoreComponents: boolean;
  hasImplementationPatterns: boolean;
  hasIntegrationPoints: boolean;
  hasSecurityConsiderations: boolean;
  hasTestingConsiderations: boolean;
  hasTypeScriptInterfaces: boolean;
  hasCodeExamples: boolean;
  wordCount: number;
  qualityScore: number;
}

export interface CrossCuttingIntegration {
  domain: string;
  hasSecurityIntegration: boolean;
  hasAnalyticsIntegration: boolean;
  hasTestingIntegration: boolean;
  hasDeploymentIntegration: boolean;
  hasPerformanceIntegration: boolean;
  integrationScore: number;
}

export interface MetadataConsistency {
  domain: string;
  templatesWithMetadata: number;
  templatesWithTags: number;
  templatesWithDependencies: number;
  consistencyScore: number;
}

export interface LibraryCompletenessReport {
  totalDomains: number;
  totalTemplates: number;
  domainCoverage: DomainCoverage[];
  crossCuttingIntegration: CrossCuttingIntegration[];
  metadataConsistency: MetadataConsistency[];
  overallQualityScore: number;
  overallCompletenessScore: number;
  issues: string[];
}

export class TemplateLibraryCompletenessValidator {
  private basePath: string;
  private domains: string[] = [];
  private templateContents: Map<string, string> = new Map();

  constructor(basePath: string = 'prompts/modules') {
    this.basePath = basePath;
    this.loadDomains();
  }

  private loadDomains(): void {
    const fullPath = join(process.cwd(), this.basePath);
    if (!existsSync(fullPath)) return;

    const entries = readdirSync(fullPath, { withFileTypes: true });
    this.domains = entries
      .filter(entry => entry.isDirectory())
      .map(entry => entry.name);
  }

  private loadTemplatesForDomain(domain: string): string[] {
    const domainPath = join(process.cwd(), this.basePath, domain);
    if (!existsSync(domainPath)) return [];

    const entries = readdirSync(domainPath);
    const templates: string[] = [];

    for (const entry of entries) {
      if (entry.endsWith('.md')) {
        const fullPath = join(domainPath, entry);
        if (statSync(fullPath).isFile()) {
          templates.push(entry);
          this.templateContents.set(`${domain}/${entry}`, readFileSync(fullPath, 'utf-8'));
        }
      }
    }

    return templates;
  }

  validateDomainCoverage(domain: string): DomainCoverage {
    const templates = this.loadTemplatesForDomain(domain);
    const missingRequiredSections: string[] = [];
    let totalQuality = 0;

    for (const template of templates) {
      if (template === 'README.md') continue;
      const quality = this.validateTemplateQuality(`${domain}/${template}`);
      totalQuality += quality.qualityScore;
      
      if (!quality.hasPurpose) missingRequiredSections.push(`${template}: Purpose`);
      if (!quality.hasCodeExamples) missingRequiredSections.push(`${template}: Code Examples`);
    }

    const nonReadmeTemplates = templates.filter(t => t !== 'README.md');
    const avgQuality = nonReadmeTemplates.length > 0 ? totalQuality / nonReadmeTemplates.length : 0;

    return {
      domain,
      templateCount: nonReadmeTemplates.length,
      templates: nonReadmeTemplates,
      hasReadme: templates.includes('README.md'),
      missingRequiredSections,
      qualityScore: avgQuality
    };
  }

  validateTemplateQuality(templateKey: string): TemplateQuality {
    const content = this.templateContents.get(templateKey) || '';
    const path = templateKey;

    const hasTitle = /^#\s+.+$/m.test(content);
    const hasPurpose = this.hasSection(content, 'Purpose');
    const hasContext = this.hasSection(content, 'Context');
    const hasCoreComponents = this.hasSection(content, 'Core Components');
    const hasImplementationPatterns = this.hasSection(content, 'Implementation');
    const hasIntegrationPoints = this.hasSection(content, 'Integration');
    const hasSecurityConsiderations = this.hasSection(content, 'Security');
    const hasTestingConsiderations = this.hasSection(content, 'Testing');
    const hasTypeScriptInterfaces = /interface\s+\w+\s*\{/.test(content);
    const hasCodeExamples = /```(typescript|javascript|ts|js|python|java|go|rust)[\s\S]*?```/.test(content);
    const wordCount = content.split(/\s+/).length;

    // Calculate quality score (0-100)
    let score = 0;
    if (hasTitle) score += 10;
    if (hasPurpose) score += 15;
    if (hasContext) score += 10;
    if (hasCoreComponents) score += 10;
    if (hasImplementationPatterns) score += 15;
    if (hasIntegrationPoints) score += 10;
    if (hasSecurityConsiderations) score += 10;
    if (hasTestingConsiderations) score += 5;
    if (hasTypeScriptInterfaces) score += 10;
    if (hasCodeExamples) score += 5;

    return {
      path,
      hasTitle,
      hasPurpose,
      hasContext,
      hasCoreComponents,
      hasImplementationPatterns,
      hasIntegrationPoints,
      hasSecurityConsiderations,
      hasTestingConsiderations,
      hasTypeScriptInterfaces,
      hasCodeExamples,
      wordCount,
      qualityScore: score
    };
  }

  private hasSection(content: string, sectionName: string): boolean {
    const escapedName = sectionName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const sectionRegex = new RegExp(`^##?#?\\s+.*${escapedName}`, 'im');
    return sectionRegex.test(content);
  }

  validateCrossCuttingIntegration(domain: string): CrossCuttingIntegration {
    const templates = this.loadTemplatesForDomain(domain);
    let securityCount = 0;
    let analyticsCount = 0;
    let testingCount = 0;
    let deploymentCount = 0;
    let performanceCount = 0;

    for (const template of templates) {
      if (template === 'README.md') continue;
      const content = this.templateContents.get(`${domain}/${template}`) || '';
      
      if (this.mentionsCrossCutting(content, 'security')) securityCount++;
      if (this.mentionsCrossCutting(content, 'analytics')) analyticsCount++;
      if (this.mentionsCrossCutting(content, 'testing')) testingCount++;
      if (this.mentionsCrossCutting(content, 'deployment')) deploymentCount++;
      if (this.mentionsCrossCutting(content, 'performance')) performanceCount++;
    }

    const nonReadmeCount = templates.filter(t => t !== 'README.md').length;
    const integrationScore = nonReadmeCount > 0 
      ? ((securityCount + analyticsCount + testingCount + deploymentCount + performanceCount) / (nonReadmeCount * 5)) * 100
      : 0;

    return {
      domain,
      hasSecurityIntegration: securityCount > 0,
      hasAnalyticsIntegration: analyticsCount > 0,
      hasTestingIntegration: testingCount > 0,
      hasDeploymentIntegration: deploymentCount > 0,
      hasPerformanceIntegration: performanceCount > 0,
      integrationScore
    };
  }

  private mentionsCrossCutting(content: string, concern: string): boolean {
    const patterns: Record<string, RegExp> = {
      security: /security|authentication|authorization|encryption|access control/i,
      analytics: /analytics|metrics|monitoring|tracking|telemetry/i,
      testing: /testing|test|unit test|integration test|property.?based/i,
      deployment: /deployment|deploy|ci\/cd|kubernetes|docker|container/i,
      performance: /performance|optimization|caching|scalability|latency/i
    };
    return patterns[concern]?.test(content) || false;
  }

  validateMetadataConsistency(domain: string): MetadataConsistency {
    const templates = this.loadTemplatesForDomain(domain);
    let withMetadata = 0;
    let withTags = 0;
    let withDependencies = 0;

    for (const template of templates) {
      if (template === 'README.md') continue;
      const content = this.templateContents.get(`${domain}/${template}`) || '';
      
      if (this.hasMetadata(content)) withMetadata++;
      if (this.hasTags(content)) withTags++;
      if (this.hasDependencies(content)) withDependencies++;
    }

    const nonReadmeCount = templates.filter(t => t !== 'README.md').length;
    const consistencyScore = nonReadmeCount > 0
      ? ((withMetadata + withTags + withDependencies) / (nonReadmeCount * 3)) * 100
      : 0;

    return {
      domain,
      templatesWithMetadata: withMetadata,
      templatesWithTags: withTags,
      templatesWithDependencies: withDependencies,
      consistencyScore
    };
  }

  private hasMetadata(content: string): boolean {
    return /domain:|category:|version:|complexity:/i.test(content);
  }

  private hasTags(content: string): boolean {
    return /tags?:|keywords?:|categories?:/i.test(content);
  }

  private hasDependencies(content: string): boolean {
    return /dependencies?:|requires?:|related templates?:/i.test(content);
  }

  generateCompletenessReport(): LibraryCompletenessReport {
    const domainCoverage: DomainCoverage[] = [];
    const crossCuttingIntegration: CrossCuttingIntegration[] = [];
    const metadataConsistency: MetadataConsistency[] = [];
    const issues: string[] = [];
    let totalTemplates = 0;

    for (const domain of this.domains) {
      const coverage = this.validateDomainCoverage(domain);
      domainCoverage.push(coverage);
      totalTemplates += coverage.templateCount;

      if (!coverage.hasReadme) {
        issues.push(`Domain '${domain}' is missing README.md`);
      }
      if (coverage.templateCount === 0) {
        issues.push(`Domain '${domain}' has no templates`);
      }
      if (coverage.qualityScore < 50) {
        issues.push(`Domain '${domain}' has low quality score: ${coverage.qualityScore.toFixed(1)}`);
      }

      const integration = this.validateCrossCuttingIntegration(domain);
      crossCuttingIntegration.push(integration);

      const metadata = this.validateMetadataConsistency(domain);
      metadataConsistency.push(metadata);
    }

    const avgQuality = domainCoverage.length > 0
      ? domainCoverage.reduce((sum, d) => sum + d.qualityScore, 0) / domainCoverage.length
      : 0;

    const avgIntegration = crossCuttingIntegration.length > 0
      ? crossCuttingIntegration.reduce((sum, i) => sum + i.integrationScore, 0) / crossCuttingIntegration.length
      : 0;

    const overallCompletenessScore = (avgQuality * 0.6 + avgIntegration * 0.4);

    return {
      totalDomains: this.domains.length,
      totalTemplates,
      domainCoverage,
      crossCuttingIntegration,
      metadataConsistency,
      overallQualityScore: avgQuality,
      overallCompletenessScore,
      issues
    };
  }

  getDomains(): string[] {
    return [...this.domains];
  }

  getExpectedDomains(): string[] {
    return [
      'accessibility',
      'analytics',
      'asset-management',
      'blockchain',
      'commerce',
      'content-management',
      'cross-platform',
      'data-processing',
      'deployment',
      'enterprise-saas',
      'feature-patterns',
      'fintech',
      'gamification',
      'healthcare',
      'integration',
      'iot',
      'location-services',
      'media-streaming',
      'notifications',
      'performance',
      'real-time-communication',
      'search-discovery',
      'security',
      'social',
      'technology-stacks',
      'testing'
    ];
  }

  validateAllDomainsExist(): { exists: boolean; missing: string[] } {
    const expected = this.getExpectedDomains();
    const missing = expected.filter(d => !this.domains.includes(d));
    return {
      exists: missing.length === 0,
      missing
    };
  }
}
