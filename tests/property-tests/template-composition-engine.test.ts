import { describe, it, expect, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import {
  TemplateCompositionEngine,
  ApplicationDomain,
  ProjectBrief,
  Requirements,
  Template
} from '../../src/template-composition-engine.js';

/**
 * Property-Based Tests: Template Composition Engine
 * 
 * Property 7: Template Composition Correctness
 * For any project domain, the selected templates should include appropriate core templates
 * for the domain plus necessary cross-cutting templates for security, analytics, and compliance.
 * 
 * Validates: Requirements 6.1, 6.2, 6.3, 6.4, 6.5
 */

describe('Property-Based Tests: Template Composition Engine', () => {
  let engine: TemplateCompositionEngine;

  beforeEach(() => {
    engine = new TemplateCompositionEngine();
  });

  // Arbitrary generators
  const domainArb = fc.constantFrom(...Object.values(ApplicationDomain));

  const projectBriefArb = fc.record({
    description: fc.string({ minLength: 20, maxLength: 500 }),
    platforms: fc.array(fc.constantFrom('web', 'mobile', 'desktop', 'backend'), { minLength: 1, maxLength: 4 }),
    domain: fc.option(domainArb, { nil: undefined }),
    requirements: fc.array(fc.string({ minLength: 10, maxLength: 100 }), { minLength: 1, maxLength: 10 }),
    features: fc.option(fc.array(fc.string({ minLength: 5, maxLength: 50 }), { minLength: 0, maxLength: 5 }), { nil: undefined })
  });

  const requirementsArb = fc.record({
    functional: fc.array(fc.string({ minLength: 10, maxLength: 100 }), { minLength: 1, maxLength: 5 }),
    nonFunctional: fc.array(fc.string({ minLength: 10, maxLength: 100 }), { minLength: 0, maxLength: 5 }),
    compliance: fc.option(fc.array(fc.constantFrom('GDPR', 'HIPAA', 'SOC2', 'PCI-DSS'), { minLength: 0, maxLength: 3 }), { nil: undefined }),
    security: fc.option(fc.array(fc.string({ minLength: 5, maxLength: 50 }), { minLength: 0, maxLength: 3 }), { nil: undefined })
  });

  // Domain-specific brief generators
  const commerceBriefArb = fc.record({
    description: fc.constant('E-commerce platform with shopping cart and checkout'),
    platforms: fc.constant(['web', 'mobile']),
    requirements: fc.constant(['product catalog', 'shopping cart', 'payment processing', 'order management']),
    features: fc.constant(['inventory tracking', 'shipping integration'])
  });

  const healthcareBriefArb = fc.record({
    description: fc.constant('Healthcare patient management system with appointments'),
    platforms: fc.constant(['web', 'mobile']),
    requirements: fc.constant(['patient records', 'appointment scheduling', 'prescription management']),
    features: fc.constant(['telehealth', 'HIPAA compliance'])
  });

  describe('Property 7.1: Domain Identification', () => {
    it('should identify domain from any project brief', () => {
      fc.assert(
        fc.property(
          projectBriefArb,
          (brief) => {
            const result = engine.identifyDomain(brief as ProjectBrief);

            // Should always return a valid result
            expect(result).toHaveProperty('primaryDomain');
            expect(result).toHaveProperty('confidence');
            expect(result).toHaveProperty('secondaryDomains');
            expect(result).toHaveProperty('keywords');

            // Primary domain should be a valid ApplicationDomain
            expect(Object.values(ApplicationDomain)).toContain(result.primaryDomain);

            // Confidence should be between 0 and 1
            expect(result.confidence).toBeGreaterThanOrEqual(0);
            expect(result.confidence).toBeLessThanOrEqual(1);

            // Secondary domains should be valid
            for (const domain of result.secondaryDomains) {
              expect(Object.values(ApplicationDomain)).toContain(domain);
            }

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 7.2: Commerce Domain Detection', () => {
    it('should correctly identify commerce domain', () => {
      fc.assert(
        fc.property(
          commerceBriefArb,
          (brief) => {
            const result = engine.identifyDomain(brief as ProjectBrief);

            // Should identify as commerce with high confidence
            expect(result.primaryDomain).toBe(ApplicationDomain.COMMERCE);
            expect(result.confidence).toBeGreaterThan(0);

            // Should find commerce-related keywords
            expect(result.keywords.length).toBeGreaterThan(0);

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 7.3: Healthcare Domain Detection', () => {
    it('should correctly identify healthcare domain', () => {
      fc.assert(
        fc.property(
          healthcareBriefArb,
          (brief) => {
            const result = engine.identifyDomain(brief as ProjectBrief);

            // Should identify as healthcare with high confidence
            expect(result.primaryDomain).toBe(ApplicationDomain.HEALTHCARE);
            expect(result.confidence).toBeGreaterThan(0);

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 7.4: Core Template Selection', () => {
    it('should select core templates for any domain', () => {
      fc.assert(
        fc.property(
          domainArb,
          (domain) => {
            const templates = engine.selectCoreTemplates(domain);

            // Should return an array
            expect(Array.isArray(templates)).toBe(true);

            // Each template should have required fields
            for (const template of templates) {
              expect(template).toHaveProperty('id');
              expect(template).toHaveProperty('name');
              expect(template).toHaveProperty('domain');
              expect(template).toHaveProperty('category');
            }

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 7.5: Cross-Cutting Template Addition', () => {
    it('should add cross-cutting templates based on requirements', () => {
      fc.assert(
        fc.property(
          requirementsArb,
          (requirements) => {
            const templates = engine.addCrossCuttingTemplates(requirements as Requirements);

            // Should return an array
            expect(Array.isArray(templates)).toBe(true);

            // Should always include testing templates
            const hasTestingTemplate = templates.some(t => t.category === 'testing');
            expect(hasTestingTemplate).toBe(true);

            // If security requirements exist, should include security templates
            if (requirements.security && requirements.security.length > 0) {
              const hasSecurityTemplate = templates.some(t => t.category === 'security');
              expect(hasSecurityTemplate).toBe(true);
            }

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 7.6: Specification Composition', () => {
    it('should compose valid specifications from templates', () => {
      fc.assert(
        fc.property(
          domainArb,
          (domain) => {
            const coreTemplates = engine.selectCoreTemplates(domain);
            const crossCuttingTemplates = engine.addCrossCuttingTemplates({
              functional: ['basic functionality'],
              nonFunctional: ['performance']
            });

            const allTemplates = [...coreTemplates, ...crossCuttingTemplates];
            const spec = engine.composeSpecifications(allTemplates, domain);

            // Specification should have required fields
            expect(spec).toHaveProperty('id');
            expect(spec).toHaveProperty('name');
            expect(spec).toHaveProperty('templates');
            expect(spec).toHaveProperty('content');
            expect(spec).toHaveProperty('domain');
            expect(spec).toHaveProperty('crossCuttingConcerns');

            // Domain should match
            expect(spec.domain).toBe(domain);

            // Content should not be empty
            expect(spec.content.length).toBeGreaterThan(0);

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 7.7: Template Integration Validation', () => {
    it('should validate template integration correctly', () => {
      fc.assert(
        fc.property(
          domainArb,
          (domain) => {
            const templates = engine.selectCoreTemplates(domain);
            const validation = engine.validateTemplateIntegration(templates);

            // Validation should have required fields
            expect(validation).toHaveProperty('isValid');
            expect(validation).toHaveProperty('conflicts');
            expect(validation).toHaveProperty('missingDependencies');
            expect(validation).toHaveProperty('warnings');

            // Arrays should be defined
            expect(Array.isArray(validation.conflicts)).toBe(true);
            expect(Array.isArray(validation.missingDependencies)).toBe(true);
            expect(Array.isArray(validation.warnings)).toBe(true);

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 7.8: Template Retrieval', () => {
    it('should retrieve templates by category and domain', () => {
      fc.assert(
        fc.property(
          domainArb,
          fc.constantFrom('security', 'testing', 'analytics', 'performance'),
          (domain, category) => {
            const byDomain = engine.getTemplatesByDomain(domain);
            const byCategory = engine.getTemplatesByCategory(category);

            // Results should be arrays
            expect(Array.isArray(byDomain)).toBe(true);
            expect(Array.isArray(byCategory)).toBe(true);

            // Templates by domain should have matching domain
            for (const template of byDomain) {
              expect(template.domain).toBe(domain);
            }

            // Templates by category should have matching category
            for (const template of byCategory) {
              expect(template.category).toBe(category);
            }

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 7.9: Complete Workflow', () => {
    it('should complete full template composition workflow', () => {
      fc.assert(
        fc.property(
          projectBriefArb,
          requirementsArb,
          (brief, requirements) => {
            // Step 1: Identify domain
            const domainResult = engine.identifyDomain(brief as ProjectBrief);

            // Step 2: Select core templates
            const coreTemplates = engine.selectCoreTemplates(domainResult.primaryDomain);

            // Step 3: Add cross-cutting templates
            const crossCuttingTemplates = engine.addCrossCuttingTemplates(requirements as Requirements);

            // Step 4: Combine templates
            const allTemplates = [...coreTemplates, ...crossCuttingTemplates];

            // Step 5: Validate integration
            const validation = engine.validateTemplateIntegration(allTemplates);

            // Step 6: Compose specification
            const spec = engine.composeSpecifications(allTemplates, domainResult.primaryDomain);

            // Workflow should complete successfully
            expect(spec).toBeDefined();
            expect(spec.templates.length).toBeGreaterThan(0);

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 7.10: Template Uniqueness', () => {
    it('should not duplicate templates in composition', () => {
      fc.assert(
        fc.property(
          domainArb,
          requirementsArb,
          (domain, requirements) => {
            const coreTemplates = engine.selectCoreTemplates(domain);
            const crossCuttingTemplates = engine.addCrossCuttingTemplates(requirements as Requirements);

            // Cross-cutting templates should be unique
            const crossCuttingIds = crossCuttingTemplates.map(t => t.id);
            const uniqueCrossCuttingIds = [...new Set(crossCuttingIds)];
            expect(crossCuttingIds.length).toBe(uniqueCrossCuttingIds.length);

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
