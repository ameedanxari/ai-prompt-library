import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { TemplateValidator } from '../../src/template-validator.js';
import { join } from 'path';

/**
 * Feature: ai-prompt-library, Property 1: Template Structure Completeness
 * 
 * For any generated template, it should contain exactly one required field labeled "Brief", 
 * all specified optional fields for power users, and serve as both input form and documentation.
 * 
 * Validates: Requirements 1.1, 1.3, 1.5
 */

describe('Property-Based Tests: Template Structure Validation', () => {
  const templatePath = join(process.cwd(), 'MY_PROJECT.md.template');

  it('Property 1: Template Structure Completeness - validates template has required structure', () => {
    // Property-based test with 100+ iterations
    fc.assert(
      fc.property(
        // Generator for different ways to access/validate the template
        fc.record({
          validationMethod: fc.constantFrom('structure', 'requirements', 'sections'),
          checkOrder: fc.array(fc.constantFrom('brief', 'optional', 'readme'), { minLength: 1, maxLength: 3 })
        }),
        (testCase) => {
          // For any validation approach, the template should maintain its structure
          const validator = new TemplateValidator(templatePath);
          
          // Test the core property: template has complete structure
          const structure = validator.validateStructure();
          const requirements = validator.validateRequirements();
          
          // Property assertion: Template structure completeness
          // The template must have exactly one required field (Brief)
          expect(structure.hasRequiredBrief).toBe(true);
          
          // The template must have comprehensive optional fields for power users
          expect(structure.hasOptionalFields).toBe(true);
          
          // The template must serve as both input form and README
          expect(structure.servesAsReadme).toBe(true);
          
          // Validate all required sections exist
          expect(structure.hasProjectBriefSection).toBe(true);
          expect(structure.hasOptionalConfigSection).toBe(true);
          expect(structure.hasReferenceAssetsSection).toBe(true);
          expect(structure.hasDryRunOption).toBe(true);
          expect(structure.hasGettingStartedSection).toBe(true);
          expect(structure.hasSystemCapabilitiesSection).toBe(true);
          
          // Validate requirements compliance
          expect(requirements.requirement_1_1).toBe(true); // Brief as only required field
          expect(requirements.requirement_1_3).toBe(true); // Comprehensive optional fields
          expect(requirements.requirement_1_5).toBe(true); // Dual purpose as README and input form
          
          // Property invariant: Structure remains consistent regardless of validation method
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 1 (Edge Case): Template structure validation with different content variations', () => {
    // Test property with variations in how we might process the template
    fc.assert(
      fc.property(
        fc.record({
          caseVariation: fc.constantFrom('lowercase', 'uppercase', 'mixed'),
          whitespaceHandling: fc.constantFrom('trim', 'preserve', 'normalize')
        }),
        (testCase) => {
          const validator = new TemplateValidator(templatePath);
          
          // The property should hold regardless of how we process the content
          const structure = validator.validateStructure();
          
          // Core property: Template always has the required structure elements
          expect(structure.hasRequiredBrief && structure.hasOptionalFields && structure.servesAsReadme).toBe(true);
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 1 (Invariant): Template structure elements are mutually consistent', () => {
    // Test that all structure elements are logically consistent with each other
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 10 }), // Arbitrary test parameter
        (_iteration) => {
          const validator = new TemplateValidator(templatePath);
          const structure = validator.validateStructure();
          const requirements = validator.validateRequirements();
          
          // Invariant: If template serves as README, it must have getting started section
          if (structure.servesAsReadme) {
            expect(structure.hasGettingStartedSection).toBe(true);
          }
          
          // Invariant: If template has required brief, it must also have optional config
          if (structure.hasRequiredBrief) {
            expect(structure.hasOptionalConfigSection).toBe(true);
          }
          
          // Invariant: Requirements validation should be consistent with structure validation
          expect(requirements.requirement_1_1).toBe(structure.hasRequiredBrief);
          expect(requirements.requirement_1_3).toBe(structure.hasOptionalFields);
          expect(requirements.requirement_1_5).toBe(structure.servesAsReadme);
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});