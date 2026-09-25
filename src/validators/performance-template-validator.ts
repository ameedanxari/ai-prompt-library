import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { TemplateValidator } from '../template-validator.js';

export interface PerformanceTemplateStructure {
  hasCachingStrategiesTemplate: boolean;
  hasPerformanceMonitoringTemplate: boolean;
  hasScalabilityPatternsTemplate: boolean;
  hasResourceOptimizationTemplate: boolean;
  allTemplatesHaveRequiredSections: boolean;
  templatesHaveImplementationPatterns: boolean;
  templatesHaveConfigurationExamples: boolean;
  templatesHaveIntegrationPoints: boolean;
  templatesHaveSecurityConsiderations: boolean;
}

export interface PerformanceTemplateContent {
  hasPurposeSection: boolean;
  hasContextSection: boolean;
  hasImplementationPatterns: boolean;
  hasConfigurationExamples: boolean;
  hasIntegrationPoints: boolean;
  hasSecurityConsiderations: boolean;
  hasTestingConsiderations: boolean;
  hasCodeExamples: boolean;
  hasCoreComponents: boolean;
}

export class PerformanceTemplateValidator extends TemplateValidator {
  constructor(modulePath: string = 'prompts/modules/performance') {
    super(modulePath);
  }

  validatePerformanceTemplates(): PerformanceTemplateStructure {
    const performanceTemplates = [
      'caching-strategies.md',
      'performance-monitoring.md',
      'scalability-patterns.md',
      'resource-optimization.md'
    ];

    const templateExists = (filename: string) =>
      existsSync(join(this.moduleDir, filename));

    const hasCachingStrategiesTemplate = templateExists('caching-strategies.md');
    const hasPerformanceMonitoringTemplate = templateExists('performance-monitoring.md');
    const hasScalabilityPatternsTemplate = templateExists('scalability-patterns.md');
    const hasResourceOptimizationTemplate = templateExists('resource-optimization.md');

    let allTemplatesHaveRequiredSections = true;
    let templatesHaveImplementationPatterns = true;
    let templatesHaveConfigurationExamples = true;
    let templatesHaveIntegrationPoints = true;
    let templatesHaveSecurityConsiderations = true;

    for (const template of performanceTemplates) {
      const templatePath = join(this.moduleDir, template);
      if (existsSync(templatePath)) {
        const content = this.validateTemplateContent(templatePath);

        if (!content.hasPurposeSection || !content.hasContextSection) {
          allTemplatesHaveRequiredSections = false;
        }

        if (!content.hasImplementationPatterns || !content.hasCodeExamples) {
          templatesHaveImplementationPatterns = false;
        }

        if (!content.hasConfigurationExamples) {
          templatesHaveConfigurationExamples = false;
        }

        if (!content.hasIntegrationPoints) {
          templatesHaveIntegrationPoints = false;
        }

        if (!content.hasSecurityConsiderations) {
          templatesHaveSecurityConsiderations = false;
        }
      }
    }

    return {
      hasCachingStrategiesTemplate,
      hasPerformanceMonitoringTemplate,
      hasScalabilityPatternsTemplate,
      hasResourceOptimizationTemplate,
      allTemplatesHaveRequiredSections,
      templatesHaveImplementationPatterns,
      templatesHaveConfigurationExamples,
      templatesHaveIntegrationPoints,
      templatesHaveSecurityConsiderations
    };
  }


  validateTemplateContent(templatePath: string): PerformanceTemplateContent {
    if (!existsSync(templatePath)) {
      return this.getEmptyTemplateContent();
    }

    const content = readFileSync(templatePath, 'utf-8');

    return {
      hasPurposeSection: this.hasSection(content, 'Purpose'),
      hasContextSection: this.hasSection(content, 'Context'),
      hasImplementationPatterns: this.hasSection(content, 'Implementation Patterns') ||
        this.hasSection(content, 'Implementation') ||
        this.hasSection(content, 'Core.*Patterns'),
      hasConfigurationExamples: this.hasSection(content, 'Configuration') ||
        this.hasSection(content, 'Config'),
      hasIntegrationPoints: this.hasSection(content, 'Integration Points') ||
        this.hasSection(content, 'Integration'),
      hasSecurityConsiderations: this.hasSecurityConsiderations(content),
      hasTestingConsiderations: this.hasSection(content, 'Testing Considerations') ||
        this.hasSection(content, 'Testing'),
      hasCodeExamples: this.hasCodeExamples(content),
      hasCoreComponents: this.hasSection(content, 'Core Components') ||
        this.hasSection(content, 'Components')
    };
  }

  private hasSecurityConsiderations(content: string): boolean {
    const securityKeywords = [
      'security', 'encryption', 'authentication', 'authorization',
      'sanitization', 'validation', 'access control', 'vulnerability',
      'secure', 'protection', 'audit', 'rbac', 'tls', 'ssl'
    ];

    const contentLower = content.toLowerCase();
    return securityKeywords.some(keyword => contentLower.includes(keyword));
  }

  private getEmptyTemplateContent(): PerformanceTemplateContent {
    return this.getEmptyContent<PerformanceTemplateContent>(['hasPurposeSection', 'hasContextSection', 'hasImplementationPatterns', 'hasConfigurationExamples', 'hasIntegrationPoints', 'hasSecurityConsiderations', 'hasTestingConsiderations', 'hasCodeExamples', 'hasCoreComponents']);
  }

  // Validate cross-cutting performance requirements
  validatePerformanceRequirements(): {
    caching: boolean;
    monitoring: boolean;
    scalability: boolean;
    resourceOptimization: boolean;
  } {
    const structure = this.validatePerformanceTemplates();

    // Caching requirements
    const caching = structure.hasCachingStrategiesTemplate &&
      structure.templatesHaveImplementationPatterns;

    // Monitoring requirements
    const monitoring = structure.hasPerformanceMonitoringTemplate &&
      structure.templatesHaveImplementationPatterns;

    // Scalability requirements
    const scalability = structure.hasScalabilityPatternsTemplate &&
      structure.templatesHaveImplementationPatterns;

    // Resource optimization requirements
    const resourceOptimization = structure.hasResourceOptimizationTemplate &&
      structure.templatesHaveImplementationPatterns;

    return {
      caching,
      monitoring,
      scalability,
      resourceOptimization
    };
  }

  // Validate performance feature coverage
  validatePerformanceFeatureCoverage(): {
    hasRedisSupport: boolean;
    hasMemcachedSupport: boolean;
    hasCDNCaching: boolean;
    hasAPMSupport: boolean;
    hasPrometheusSupport: boolean;
    hasLoadBalancing: boolean;
    hasAutoScaling: boolean;
    hasSharding: boolean;
    hasMemoryOptimization: boolean;
    hasCPUOptimization: boolean;
    hasCostOptimization: boolean;
  } {
    const cachingPath = join(this.moduleDir, 'caching-strategies.md');
    const monitoringPath = join(this.moduleDir, 'performance-monitoring.md');
    const scalabilityPath = join(this.moduleDir, 'scalability-patterns.md');
    const resourcePath = join(this.moduleDir, 'resource-optimization.md');

    let hasRedisSupport = false;
    let hasMemcachedSupport = false;
    let hasCDNCaching = false;
    let hasAPMSupport = false;
    let hasPrometheusSupport = false;
    let hasLoadBalancing = false;
    let hasAutoScaling = false;
    let hasSharding = false;
    let hasMemoryOptimization = false;
    let hasCPUOptimization = false;
    let hasCostOptimization = false;

    if (existsSync(cachingPath)) {
      const content = readFileSync(cachingPath, 'utf-8').toLowerCase();
      hasRedisSupport = content.includes('redis');
      hasMemcachedSupport = content.includes('memcached');
      hasCDNCaching = content.includes('cdn');
    }

    if (existsSync(monitoringPath)) {
      const content = readFileSync(monitoringPath, 'utf-8').toLowerCase();
      hasAPMSupport = content.includes('apm') || content.includes('application performance');
      hasPrometheusSupport = content.includes('prometheus') || content.includes('metrics');
    }

    if (existsSync(scalabilityPath)) {
      const content = readFileSync(scalabilityPath, 'utf-8').toLowerCase();
      hasLoadBalancing = content.includes('load balanc');
      hasAutoScaling = content.includes('auto-scal') || content.includes('autoscal');
      hasSharding = content.includes('shard');
    }

    if (existsSync(resourcePath)) {
      const content = readFileSync(resourcePath, 'utf-8').toLowerCase();
      hasMemoryOptimization = content.includes('memory') && (content.includes('optim') || content.includes('pool'));
      hasCPUOptimization = content.includes('cpu') && content.includes('optim');
      hasCostOptimization = content.includes('cost') && content.includes('optim');
    }

    return {
      hasRedisSupport,
      hasMemcachedSupport,
      hasCDNCaching,
      hasAPMSupport,
      hasPrometheusSupport,
      hasLoadBalancing,
      hasAutoScaling,
      hasSharding,
      hasMemoryOptimization,
      hasCPUOptimization,
      hasCostOptimization
    };
  }
}
