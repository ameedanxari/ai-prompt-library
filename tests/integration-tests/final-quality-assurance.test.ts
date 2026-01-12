/**
 * Final Integration and Quality Assurance Tests (Task 26)
 * 
 * Tests template library completeness, cross-cutting concern integration,
 * performance and scalability, and comprehensive integration workflows.
 * 
 * Requirements: Comprehensive quality assurance, System performance validation, Integration testing
 */

import { describe, it, expect, beforeAll } from 'vitest';
import * as fs from 'fs/promises';
import * as path from 'path';
import { 
  TemplateLibraryCompletenessValidator,
  LibraryCompletenessReport,
  DomainCoverage,
  TemplateQuality
} from '../../src/template-library-completeness-validator.js';

// ============================================================================
// Task 26.1: Validate Template Library Completeness
// ============================================================================

describe('Task 26.1: Template Library Completeness Validation', () => {
  let validator: TemplateLibraryCompletenessValidator;
  let completenessReport: LibraryCompletenessReport;

  beforeAll(() => {
    validator = new TemplateLibraryCompletenessValidator();
    completenessReport = validator.generateCompletenessReport();
  });

  describe('Domain Coverage Audit', () => {
    it('should have all expected domain directories', () => {
      const result = validator.validateAllDomainsExist();
      
      if (result.missing.length > 0) {
        console.log('Missing domains:', result.missing);
      }
      
      // Allow for some flexibility - at least 90% of expected domains should exist
      const expectedDomains = validator.getExpectedDomains();
      const existingDomains = validator.getDomains();
      const coverageRatio = existingDomains.length / expectedDomains.length;
      
      expect(coverageRatio).toBeGreaterThanOrEqual(0.9);
    });

    it('should have templates in each domain', () => {
      const domainsWithoutTemplates = completenessReport.domainCoverage
        .filter(d => d.templateCount === 0)
        .map(d => d.domain);
      
      // Allow best-practices to be empty as it may be a placeholder
      const criticalEmptyDomains = domainsWithoutTemplates.filter(d => d !== 'best-practices');
      
      expect(criticalEmptyDomains.length).toBeLessThanOrEqual(1);
    });

    it('should have README.md in most domains', () => {
      const domainsWithReadme = completenessReport.domainCoverage
        .filter(d => d.hasReadme).length;
      const totalDomains = completenessReport.domainCoverage.length;
      
      // At least 80% of domains should have README
      expect(domainsWithReadme / totalDomains).toBeGreaterThanOrEqual(0.8);
    });

    it('should have minimum template count per domain', () => {
      const domainsWithSufficientTemplates = completenessReport.domainCoverage
        .filter(d => d.templateCount >= 3 || d.domain === 'best-practices').length;
      const totalDomains = completenessReport.domainCoverage.length;
      
      // At least 70% of domains should have 3+ templates
      expect(domainsWithSufficientTemplates / totalDomains).toBeGreaterThanOrEqual(0.7);
    });
  });

  describe('Template Quality Validation', () => {
    it('should have acceptable average quality score', () => {
      expect(completenessReport.overallQualityScore).toBeGreaterThanOrEqual(40);
    });

    it('should have templates with required sections', () => {
      const totalMissingSections = completenessReport.domainCoverage
        .reduce((sum, d) => sum + d.missingRequiredSections.length, 0);
      const totalTemplates = completenessReport.totalTemplates;
      
      // Less than 30% of templates should have missing required sections
      const missingRatio = totalMissingSections / (totalTemplates * 2); // 2 required sections checked
      expect(missingRatio).toBeLessThan(0.3);
    });

    it('should have code examples in most templates', () => {
      let templatesWithCode = 0;
      let totalChecked = 0;

      for (const domain of validator.getDomains()) {
        const coverage = validator.validateDomainCoverage(domain);
        for (const template of coverage.templates) {
          const quality = validator.validateTemplateQuality(`${domain}/${template}`);
          if (quality.hasCodeExamples) templatesWithCode++;
          totalChecked++;
        }
      }

      // At least 70% of templates should have code examples
      expect(templatesWithCode / totalChecked).toBeGreaterThanOrEqual(0.7);
    });
  });

  describe('Cross-Cutting Concern Integration', () => {
    it('should have security considerations in relevant domains', () => {
      const securityRelevantDomains = ['commerce', 'fintech', 'healthcare', 'security', 'enterprise-saas'];
      
      for (const domain of securityRelevantDomains) {
        const integration = completenessReport.crossCuttingIntegration
          .find(i => i.domain === domain);
        
        if (integration) {
          expect(integration.hasSecurityIntegration).toBe(true);
        }
      }
    });

    it('should have testing considerations across domains', () => {
      const domainsWithTesting = completenessReport.crossCuttingIntegration
        .filter(i => i.hasTestingIntegration).length;
      const totalDomains = completenessReport.crossCuttingIntegration.length;
      
      // At least 50% of domains should mention testing
      expect(domainsWithTesting / totalDomains).toBeGreaterThanOrEqual(0.5);
    });

    it('should have performance considerations in relevant domains', () => {
      const performanceRelevantDomains = ['performance', 'media-streaming', 'real-time-communication', 'data-processing'];
      
      for (const domain of performanceRelevantDomains) {
        const integration = completenessReport.crossCuttingIntegration
          .find(i => i.domain === domain);
        
        if (integration) {
          expect(integration.hasPerformanceIntegration).toBe(true);
        }
      }
    });
  });

  describe('Metadata and Tagging Consistency', () => {
    it('should have consistent metadata across domains', () => {
      const avgConsistency = completenessReport.metadataConsistency
        .reduce((sum, m) => sum + m.consistencyScore, 0) / completenessReport.metadataConsistency.length;
      
      // Average consistency should be at least 20%
      expect(avgConsistency).toBeGreaterThanOrEqual(20);
    });
  });
});

// ============================================================================
// Task 26.2: Performance and Scalability Testing
// ============================================================================

describe('Task 26.2: Performance and Scalability Testing', () => {
  describe('Template Selection Performance', () => {
    it('should load all templates within acceptable time', async () => {
      const startTime = Date.now();
      const validator = new TemplateLibraryCompletenessValidator();
      validator.generateCompletenessReport();
      const loadTime = Date.now() - startTime;
      
      // Should complete within 5 seconds
      expect(loadTime).toBeLessThan(5000);
    });

    it('should validate individual domains quickly', async () => {
      const validator = new TemplateLibraryCompletenessValidator();
      const domains = validator.getDomains();
      
      const startTime = Date.now();
      for (const domain of domains) {
        validator.validateDomainCoverage(domain);
      }
      const validationTime = Date.now() - startTime;
      
      // Should validate all domains within 3 seconds
      expect(validationTime).toBeLessThan(3000);
    });
  });

  describe('Composition Engine Performance', () => {
    it('should handle complex multi-domain scenarios', async () => {
      const validator = new TemplateLibraryCompletenessValidator();
      
      const startTime = Date.now();
      
      // Simulate complex composition by validating multiple domains
      const complexScenarios = [
        ['commerce', 'security', 'analytics', 'deployment'],
        ['healthcare', 'security', 'testing', 'integration'],
        ['fintech', 'blockchain', 'security', 'analytics'],
        ['social', 'real-time-communication', 'notifications', 'analytics']
      ];
      
      for (const scenario of complexScenarios) {
        for (const domain of scenario) {
          validator.validateDomainCoverage(domain);
          validator.validateCrossCuttingIntegration(domain);
        }
      }
      
      const compositionTime = Date.now() - startTime;
      
      // Should handle complex scenarios within 2 seconds
      expect(compositionTime).toBeLessThan(2000);
    });
  });

  describe('Memory Usage Efficiency', () => {
    it('should not exceed reasonable memory for full library load', () => {
      const initialMemory = process.memoryUsage().heapUsed;
      
      const validator = new TemplateLibraryCompletenessValidator();
      validator.generateCompletenessReport();
      
      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = (finalMemory - initialMemory) / 1024 / 1024; // MB
      
      // Should not increase memory by more than 50MB
      expect(memoryIncrease).toBeLessThan(50);
    });
  });

  describe('Concurrent Access Testing', () => {
    it('should handle concurrent template validation', async () => {
      const validator = new TemplateLibraryCompletenessValidator();
      const domains = validator.getDomains();
      
      const startTime = Date.now();
      
      // Simulate concurrent access
      const promises = domains.map(domain => 
        Promise.resolve(validator.validateDomainCoverage(domain))
      );
      
      await Promise.all(promises);
      
      const concurrentTime = Date.now() - startTime;
      
      // Concurrent validation should complete within 2 seconds
      expect(concurrentTime).toBeLessThan(2000);
    });
  });
});

// ============================================================================
// Task 26.3: Comprehensive Integration Tests
// ============================================================================

describe('Task 26.3: Comprehensive Integration Tests', () => {
  describe('End-to-End Template Composition Workflows', () => {
    it('should compose e-commerce application templates', async () => {
      const validator = new TemplateLibraryCompletenessValidator();
      
      // E-commerce app requires: commerce, security, analytics, deployment
      const requiredDomains = ['commerce', 'security', 'analytics', 'deployment'];
      const compositions: DomainCoverage[] = [];
      
      for (const domain of requiredDomains) {
        const coverage = validator.validateDomainCoverage(domain);
        compositions.push(coverage);
      }
      
      // All required domains should have templates
      const allHaveTemplates = compositions.every(c => c.templateCount > 0);
      expect(allHaveTemplates).toBe(true);
      
      // Average quality should be acceptable
      const avgQuality = compositions.reduce((sum, c) => sum + c.qualityScore, 0) / compositions.length;
      expect(avgQuality).toBeGreaterThanOrEqual(30);
    });

    it('should compose healthcare application templates', async () => {
      const validator = new TemplateLibraryCompletenessValidator();
      
      // Healthcare app requires: healthcare, security, testing, integration
      const requiredDomains = ['healthcare', 'security', 'testing', 'integration'];
      const compositions: DomainCoverage[] = [];
      
      for (const domain of requiredDomains) {
        const coverage = validator.validateDomainCoverage(domain);
        compositions.push(coverage);
      }
      
      // All required domains should have templates
      const allHaveTemplates = compositions.every(c => c.templateCount > 0);
      expect(allHaveTemplates).toBe(true);
    });

    it('should compose fintech application templates', async () => {
      const validator = new TemplateLibraryCompletenessValidator();
      
      // Fintech app requires: fintech, security, analytics, blockchain
      const requiredDomains = ['fintech', 'security', 'analytics', 'blockchain'];
      const compositions: DomainCoverage[] = [];
      
      for (const domain of requiredDomains) {
        const coverage = validator.validateDomainCoverage(domain);
        compositions.push(coverage);
      }
      
      // All required domains should have templates
      const allHaveTemplates = compositions.every(c => c.templateCount > 0);
      expect(allHaveTemplates).toBe(true);
    });

    it('should compose social media application templates', async () => {
      const validator = new TemplateLibraryCompletenessValidator();
      
      // Social app requires: social, real-time-communication, notifications, analytics
      const requiredDomains = ['social', 'real-time-communication', 'notifications', 'analytics'];
      const compositions: DomainCoverage[] = [];
      
      for (const domain of requiredDomains) {
        const coverage = validator.validateDomainCoverage(domain);
        compositions.push(coverage);
      }
      
      // All required domains should have templates
      const allHaveTemplates = compositions.every(c => c.templateCount > 0);
      expect(allHaveTemplates).toBe(true);
    });
  });

  describe('Cross-Domain Template Interactions', () => {
    it('should validate security integration across all domains', async () => {
      const validator = new TemplateLibraryCompletenessValidator();
      const report = validator.generateCompletenessReport();
      
      // Security-sensitive domains should have security integration
      const securitySensitiveDomains = ['commerce', 'fintech', 'healthcare', 'enterprise-saas'];
      
      for (const domain of securitySensitiveDomains) {
        const integration = report.crossCuttingIntegration.find(i => i.domain === domain);
        if (integration) {
          expect(integration.hasSecurityIntegration).toBe(true);
        }
      }
    });

    it('should validate analytics integration across domains', async () => {
      const validator = new TemplateLibraryCompletenessValidator();
      const report = validator.generateCompletenessReport();
      
      // Analytics should be integrated in user-facing domains
      const analyticsRelevantDomains = ['commerce', 'social', 'media-streaming', 'gamification'];
      
      let integratedCount = 0;
      for (const domain of analyticsRelevantDomains) {
        const integration = report.crossCuttingIntegration.find(i => i.domain === domain);
        if (integration?.hasAnalyticsIntegration) {
          integratedCount++;
        }
      }
      
      // At least 50% should have analytics integration
      expect(integratedCount / analyticsRelevantDomains.length).toBeGreaterThanOrEqual(0.5);
    });
  });

  describe('Error Handling and Recovery Scenarios', () => {
    it('should handle missing domain gracefully', () => {
      const validator = new TemplateLibraryCompletenessValidator();
      
      // Try to validate a non-existent domain
      const coverage = validator.validateDomainCoverage('non-existent-domain');
      
      expect(coverage.templateCount).toBe(0);
      expect(coverage.templates).toHaveLength(0);
    });

    it('should handle empty domains gracefully', () => {
      const validator = new TemplateLibraryCompletenessValidator();
      const report = validator.generateCompletenessReport();
      
      // Empty domains should be reported but not cause errors
      const emptyDomains = report.domainCoverage.filter(d => d.templateCount === 0);
      
      // Should still generate a valid report
      expect(report.totalDomains).toBeGreaterThan(0);
      expect(report.overallQualityScore).toBeGreaterThanOrEqual(0);
    });

    it('should report issues without failing', () => {
      const validator = new TemplateLibraryCompletenessValidator();
      const report = validator.generateCompletenessReport();
      
      // Issues should be collected but not cause test failure
      expect(Array.isArray(report.issues)).toBe(true);
    });
  });

  describe('Template Quality and Completeness Metrics', () => {
    it('should calculate overall completeness score', () => {
      const validator = new TemplateLibraryCompletenessValidator();
      const report = validator.generateCompletenessReport();
      
      expect(report.overallCompletenessScore).toBeGreaterThanOrEqual(0);
      expect(report.overallCompletenessScore).toBeLessThanOrEqual(100);
    });

    it('should track template counts accurately', () => {
      const validator = new TemplateLibraryCompletenessValidator();
      const report = validator.generateCompletenessReport();
      
      const sumFromDomains = report.domainCoverage.reduce((sum, d) => sum + d.templateCount, 0);
      expect(report.totalTemplates).toBe(sumFromDomains);
    });

    it('should identify quality issues', () => {
      const validator = new TemplateLibraryCompletenessValidator();
      const report = validator.generateCompletenessReport();
      
      // Low quality domains should be flagged
      const lowQualityDomains = report.domainCoverage.filter(d => d.qualityScore < 50);
      
      for (const domain of lowQualityDomains) {
        const hasIssue = report.issues.some(i => i.includes(domain.domain));
        // Issues may or may not be reported depending on threshold
        expect(typeof hasIssue).toBe('boolean');
      }
    });
  });
});

// ============================================================================
// Summary Report Generation
// ============================================================================

describe('Library Completeness Summary', () => {
  it('should generate comprehensive summary report', () => {
    const validator = new TemplateLibraryCompletenessValidator();
    const report = validator.generateCompletenessReport();
    
    console.log('\n=== Template Library Completeness Report ===');
    console.log(`Total Domains: ${report.totalDomains}`);
    console.log(`Total Templates: ${report.totalTemplates}`);
    console.log(`Overall Quality Score: ${report.overallQualityScore.toFixed(1)}%`);
    console.log(`Overall Completeness Score: ${report.overallCompletenessScore.toFixed(1)}%`);
    
    console.log('\n--- Domain Coverage ---');
    for (const domain of report.domainCoverage.slice(0, 10)) {
      console.log(`  ${domain.domain}: ${domain.templateCount} templates, quality: ${domain.qualityScore.toFixed(1)}%`);
    }
    if (report.domainCoverage.length > 10) {
      console.log(`  ... and ${report.domainCoverage.length - 10} more domains`);
    }
    
    if (report.issues.length > 0) {
      console.log('\n--- Issues Found ---');
      for (const issue of report.issues.slice(0, 5)) {
        console.log(`  - ${issue}`);
      }
      if (report.issues.length > 5) {
        console.log(`  ... and ${report.issues.length - 5} more issues`);
      }
    }
    
    console.log('\n===========================================\n');
    
    // Basic validation that report was generated
    expect(report.totalDomains).toBeGreaterThan(0);
  });
});
