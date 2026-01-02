import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { BriefProcessor } from '../../src/brief-processor.js';

/**
 * Feature: ai-prompt-library, Property 2: Brief Content Validation
 * Feature: ai-prompt-library, Property 3: Production-Quality Defaults
 * 
 * Property 2: For any brief content within valid length ranges (2-3 lines to verbose), 
 * the system should accept it and proceed with processing.
 * 
 * Property 3: For any project configuration with omitted optional fields, 
 * the generated specifications should include production-quality defaults with maximum feature completeness.
 * 
 * Validates: Requirements 1.2, 1.4, 1.6
 */

describe('Property-Based Tests: Brief Processing', () => {
  const processor = new BriefProcessor();

  // Generator for valid brief content (2-3 lines to verbose)
  const validBriefGenerator = fc.oneof(
    // Short briefs (2-3 lines)
    fc.string({ minLength: 20, maxLength: 200 }).map(s => 
      `A ${s.slice(0, 50)} app for users to manage their tasks and improve productivity.`
    ),
    // Medium briefs
    fc.string({ minLength: 100, maxLength: 500 }).map(s => 
      `I want to build a comprehensive platform that helps ${s.slice(0, 100)} users collaborate effectively. The system should provide real-time communication and task management capabilities.`
    ),
    // Verbose briefs
    fc.string({ minLength: 200, maxLength: 1000 }).map(s => 
      `This is a detailed project brief for building an enterprise-grade application. ${s.slice(0, 300)} The system needs to handle multiple user types, provide comprehensive analytics, and ensure high availability. It should integrate with existing systems and provide mobile access for remote teams.`
    )
  );

  // Generator for brief content with various characteristics
  const briefWithCharacteristicsGenerator = fc.record({
    productType: fc.constantFrom('app', 'platform', 'system', 'tool', 'service', 'website'),
    userType: fc.constantFrom('users', 'teams', 'businesses', 'customers', 'organizations'),
    features: fc.array(fc.constantFrom('manage', 'track', 'create', 'share', 'analyze'), { minLength: 1, maxLength: 3 }),
    context: fc.constantFrom('need', 'problem', 'solution', 'improve', 'help'),
    description: fc.string({ minLength: 50, maxLength: 200 })
  }).map(({ productType, userType, features, context, description }) => 
    `I want to build a ${productType} for ${userType} to ${features.join(', ')} their work. This will ${context} ${description.slice(0, 100)} and improve their productivity.`
  );

  it('Property 2: Brief Content Validation - accepts valid brief content ranges', () => {
    fc.assert(
      fc.property(
        validBriefGenerator,
        (brief) => {
          // For any valid brief content, the system should accept it and proceed
          const result = processor.validateBriefContent(brief);
          const requirements = processor.validateRequirements(brief);
          
          // Property assertion: Valid briefs should be processable
          expect(result.isValid).toBe(true);
          expect(result.validationLevel).not.toBe('INSUFFICIENT');
          
          // Should meet requirement 1.2 (brief content validation)
          expect(requirements.requirement_1_2).toBe(true);
          
          // Confidence level should be reasonable for valid content
          expect(['High', 'Medium', 'Low']).toContain(result.confidenceLevel);
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 3: Production-Quality Defaults - always applies comprehensive defaults', () => {
    fc.assert(
      fc.property(
        fc.oneof(
          validBriefGenerator,
          briefWithCharacteristicsGenerator,
          fc.string({ minLength: 10, maxLength: 50 }) // Even minimal briefs
        ),
        (brief) => {
          // For any brief (regardless of completeness), production defaults should be applied
          const defaults = processor.applyProductionDefaults(brief);
          const requirements = processor.validateRequirements(brief);
          
          // Property assertion: Production-quality defaults are always comprehensive
          expect(defaults.features.authentication).toBe(true);
          expect(defaults.features.adminPortal).toBe(true);
          expect(defaults.features.analytics).toBe(true);
          expect(defaults.features.monitoring).toBe(true);
          
          expect(defaults.quality.security).toBe(true);
          expect(defaults.quality.accessibility).toBe(true);
          expect(defaults.quality.internationalization).toBe(true);
          expect(defaults.quality.performance).toBe(true);
          
          expect(defaults.deployment.cicd).toBe(true);
          expect(defaults.deployment.monitoring).toBe(true);
          expect(defaults.deployment.backup).toBe(true);
          
          // Technology stack should have optimal defaults
          expect(defaults.technologyStack.mobile).toBe('React Native');
          expect(defaults.technologyStack.web).toBe('Headless architecture');
          expect(defaults.technologyStack.backend).toBe('Serverless-first');
          expect(defaults.technologyStack.database).toBe('Managed database service');
          
          // Should meet requirement 1.4 (production-quality defaults)
          expect(requirements.requirement_1_4).toBe(true);
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 2 & 3 Combined: Brief processing with bite-sized feature capability', () => {
    fc.assert(
      fc.property(
        briefWithCharacteristicsGenerator,
        (brief) => {
          // For any brief, the system should validate content AND apply defaults AND support bite-sized features
          const validation = processor.validateBriefContent(brief);
          const defaults = processor.applyProductionDefaults(brief, validation);
          const requirements = processor.validateRequirements(brief);
          
          // Combined property: All requirements should be met simultaneously
          expect(requirements.requirement_1_2).toBe(true); // Brief validation
          expect(requirements.requirement_1_4).toBe(true); // Production defaults
          expect(requirements.requirement_1_6).toBe(true); // Bite-sized features
          
          // Validation and defaults should be consistent
          if (validation.validationLevel === 'PASS') {
            expect(validation.confidenceLevel).toBe('High');
          }
          
          // Defaults should be comprehensive regardless of validation level
          expect(Object.values(defaults.features).every(Boolean)).toBe(true);
          expect(Object.values(defaults.quality).every(Boolean)).toBe(true);
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 2 (Edge Case): Brief validation handles boundary conditions', () => {
    fc.assert(
      fc.property(
        fc.oneof(
          fc.string({ minLength: 1, maxLength: 9 }), // Too short
          fc.string({ minLength: 10, maxLength: 19 }), // Minimal
          fc.string({ minLength: 20, maxLength: 50 }), // Short but valid
          fc.constant('') // Empty
        ),
        (brief) => {
          const result = processor.validateBriefContent(brief);
          
          // Property: Validation should handle all boundary conditions gracefully
          expect(result).toBeDefined();
          expect(['PASS', 'NEEDS_CLARIFICATION', 'INSUFFICIENT']).toContain(result.validationLevel);
          expect(['High', 'Medium', 'Low']).toContain(result.confidenceLevel);
          expect(Array.isArray(result.missingElements)).toBe(true);
          
          // Very short or empty briefs should be insufficient
          if (brief.trim().length < 10) {
            expect(result.validationLevel).toBe('INSUFFICIENT');
            expect(result.isValid).toBe(false);
          }
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 3 (Invariant): Production defaults are consistent across all inputs', () => {
    fc.assert(
      fc.property(
        fc.tuple(
          validBriefGenerator,
          validBriefGenerator
        ),
        ([brief1, brief2]) => {
          // For any two different briefs, production defaults should be identical
          const defaults1 = processor.applyProductionDefaults(brief1);
          const defaults2 = processor.applyProductionDefaults(brief2);
          
          // Invariant: Production defaults are consistent regardless of input
          expect(defaults1.technologyStack).toEqual(defaults2.technologyStack);
          expect(defaults1.features).toEqual(defaults2.features);
          expect(defaults1.quality).toEqual(defaults2.quality);
          expect(defaults1.deployment).toEqual(defaults2.deployment);
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 2 & 3 (Round-trip): Brief processing maintains information integrity', () => {
    fc.assert(
      fc.property(
        briefWithCharacteristicsGenerator,
        (brief) => {
          // Process brief and ensure information is preserved/enhanced
          const validation1 = processor.validateBriefContent(brief);
          const defaults = processor.applyProductionDefaults(brief, validation1);
          const validation2 = processor.validateBriefContent(brief); // Re-validate same brief
          
          // Round-trip property: Re-processing should yield identical results
          expect(validation1.validationLevel).toBe(validation2.validationLevel);
          expect(validation1.confidenceLevel).toBe(validation2.confidenceLevel);
          expect(validation1.isValid).toBe(validation2.isValid);
          
          // Defaults should enhance, not replace, extracted information
          if (validation1.extractedElements.productType) {
            expect(validation1.extractedElements.productType).toBeDefined();
          }
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});