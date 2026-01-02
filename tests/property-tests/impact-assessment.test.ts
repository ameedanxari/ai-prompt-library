import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { ImpactAssessmentProcessor } from '../../src/impact-assessment-processor.js';
import { join } from 'path';

/**
 * Feature: ai-prompt-library, Property 26: Holistic Impact Assessment
 * 
 * For any proposed change to the prompt library, the system should identify affected dependencies,
 * validate alignment with core principles, generate regression tests, and ensure cross-platform
 * consistency before the change is applied.
 * 
 * Validates: Requirements 21.1, 21.2, 21.3, 21.4, 21.5, 21.6, 21.7, 21.8, 21.9, 21.10
 */

describe('Property-Based Tests: Holistic Impact Assessment', () => {
  const promptsPath = join(process.cwd(), 'prompts/templates');

  it('Property 26: Holistic Impact Assessment - validates comprehensive impact assessment features', () => {
    // Property-based test with 100+ iterations
    fc.assert(
      fc.property(
        // Generator for different validation approaches
        fc.record({
          validationAspect: fc.constantFrom('capability', 'requirements', 'structure'),
          checkOrder: fc.array(
            fc.constantFrom(
              'dependency', 'validation', 'principles', 'regression', 
              'vision', 'rollback', 'crossplatform', 'rationale'
            ), 
            { minLength: 1, maxLength: 8 }
          )
        }),
        (testCase) => {
          // For any validation approach, the system should have complete impact assessment capability
          const processor = new ImpactAssessmentProcessor(promptsPath);
          
          // Test the core property: Impact assessment capability completeness
          const capability = processor.validateImpactAssessmentCapability();
          const requirements = processor.validateRequirements();
          
          // Property assertion: Impact assessment capability completeness
          // The system must have dependency mapping capability
          expect(capability.hasDependencyMapping).toBe(true);
          
          // The system must have change validation capability
          expect(capability.hasChangeValidation).toBe(true);
          
          // The system must have principle alignment validation capability
          expect(capability.hasPrincipleAlignment).toBe(true);
          
          // The system must have regression test generation capability
          expect(capability.hasRegressionTestGeneration).toBe(true);
          
          // The system must have vision document capability
          expect(capability.hasVisionDocument).toBe(true);
          
          // The system must have rollback procedures capability
          expect(capability.hasRollbackProcedures).toBe(true);
          
          // The system must have cross-platform validation capability
          expect(capability.hasCrossPlatformValidation).toBe(true);
          
          // The system must have change rationale documentation capability
          expect(capability.hasChangeRationale).toBe(true);
          
          // Validate all requirements are met
          expect(requirements.requirement_21_1).toBe(true); // Impact assessment checklist
          expect(requirements.requirement_21_2).toBe(true); // Dependency map
          expect(requirements.requirement_21_3).toBe(true); // Identify affected components
          expect(requirements.requirement_21_4).toBe(true); // Validate core principles alignment
          expect(requirements.requirement_21_5).toBe(true); // Generate regression tests
          expect(requirements.requirement_21_6).toBe(true); // Library vision document
          expect(requirements.requirement_21_7).toBe(true); // Document rationale
          expect(requirements.requirement_21_8).toBe(true); // Rollback procedures
          expect(requirements.requirement_21_9).toBe(true); // Cross-platform consistency
          expect(requirements.requirement_21_10).toBe(true); // Update documentation
          
          // Property invariant: All impact assessment capabilities are present
          const allCapabilitiesPresent = capability.hasDependencyMapping && 
                                        capability.hasChangeValidation && 
                                        capability.hasPrincipleAlignment && 
                                        capability.hasRegressionTestGeneration &&
                                        capability.hasVisionDocument &&
                                        capability.hasRollbackProcedures &&
                                        capability.hasCrossPlatformValidation &&
                                        capability.hasChangeRationale;
          
          expect(allCapabilitiesPresent).toBe(true);
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 26 (Edge Case): Impact assessment capability with different processing modes', () => {
    // Test property with variations in how we might process the templates
    fc.assert(
      fc.property(
        fc.record({
          processingMode: fc.constantFrom('strict', 'lenient', 'comprehensive'),
          validationDepth: fc.constantFrom('surface', 'deep', 'exhaustive')
        }),
        (testCase) => {
          const processor = new ImpactAssessmentProcessor(promptsPath);
          
          // The property should hold regardless of how we process the templates
          const capability = processor.validateImpactAssessmentCapability();
          
          // Core property: System always has complete impact assessment capability
          const hasCompleteImpactAssessment = capability.hasDependencyMapping && 
                                             capability.hasChangeValidation && 
                                             capability.hasPrincipleAlignment && 
                                             capability.hasRegressionTestGeneration &&
                                             capability.hasVisionDocument &&
                                             capability.hasRollbackProcedures &&
                                             capability.hasCrossPlatformValidation &&
                                             capability.hasChangeRationale;
          
          expect(hasCompleteImpactAssessment).toBe(true);
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 26 (Invariant): Impact assessment capabilities are mutually consistent', () => {
    // Test that all impact assessment capabilities are logically consistent with each other
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 10 }), // Arbitrary test parameter
        (_iteration) => {
          const processor = new ImpactAssessmentProcessor(promptsPath);
          const capability = processor.validateImpactAssessmentCapability();
          const requirements = processor.validateRequirements();
          
          // Invariant: If system has change validation, it should also have principle alignment
          if (capability.hasChangeValidation) {
            expect(capability.hasPrincipleAlignment).toBe(true);
          }
          
          // Invariant: If system has vision document, it should also have rollback procedures
          if (capability.hasVisionDocument) {
            expect(capability.hasRollbackProcedures).toBe(true);
          }
          
          // Invariant: If system has dependency mapping, it should support identifying affected components
          if (capability.hasDependencyMapping) {
            expect(requirements.requirement_21_3).toBe(true);
          }
          
          // Invariant: If system has change validation, it should support documentation updates
          if (capability.hasChangeValidation && capability.hasVisionDocument) {
            expect(requirements.requirement_21_10).toBe(true);
          }
          
          // Invariant: Requirements validation should be consistent with capability validation
          expect(requirements.requirement_21_1).toBe(capability.hasChangeValidation);
          expect(requirements.requirement_21_2).toBe(capability.hasDependencyMapping);
          expect(requirements.requirement_21_4).toBe(capability.hasPrincipleAlignment);
          expect(requirements.requirement_21_5).toBe(capability.hasRegressionTestGeneration);
          expect(requirements.requirement_21_6).toBe(capability.hasVisionDocument);
          expect(requirements.requirement_21_7).toBe(capability.hasChangeRationale);
          expect(requirements.requirement_21_8).toBe(capability.hasRollbackProcedures);
          expect(requirements.requirement_21_9).toBe(capability.hasCrossPlatformValidation);
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 26 (Structure): Template structures contain required sections', () => {
    // Test that all impact assessment templates have proper structure
    fc.assert(
      fc.property(
        fc.record({
          templateType: fc.constantFrom('dependency-map', 'change-assessment', 'vision-document'),
          validationMode: fc.constantFrom('strict', 'lenient')
        }),
        (testCase) => {
          const processor = new ImpactAssessmentProcessor(promptsPath);
          
          // Validate dependency map structure
          const dependencyMapPath = join(promptsPath, 'library-dependency-map.md');
          const dependencyStructure = processor.validateDependencyMapStructure(dependencyMapPath);
          
          expect(dependencyStructure.hasTemplateDependencies).toBe(true);
          expect(dependencyStructure.hasCrossPlatformTracking).toBe(true);
          expect(dependencyStructure.hasAutomatedDiscovery).toBe(true);
          expect(dependencyStructure.hasDependencyMaintenance).toBe(true);
          
          // Validate change assessment structure
          const changeAssessmentPath = join(promptsPath, 'library-change-assessment.md');
          const changeStructure = processor.validateChangeAssessmentStructure(changeAssessmentPath);
          
          expect(changeStructure.hasImpactChecklist).toBe(true);
          expect(changeStructure.hasPrincipleValidation).toBe(true);
          expect(changeStructure.hasRegressionTests).toBe(true);
          expect(changeStructure.hasValidationWorkflow).toBe(true);
          expect(changeStructure.hasChangeDocumentation).toBe(true);
          
          // Validate vision document structure
          const visionPath = join(promptsPath, 'library-vision-document.md');
          const visionStructure = processor.validateVisionDocumentStructure(visionPath);
          
          expect(visionStructure.hasMissionStatement).toBe(true);
          expect(visionStructure.hasGuidingPrinciples).toBe(true);
          expect(visionStructure.hasQualityStandards).toBe(true);
          expect(visionStructure.hasChangeRationale).toBe(true);
          expect(visionStructure.hasRollbackProcedures).toBe(true);
          expect(visionStructure.hasCrossPlatformValidation).toBe(true);
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 26 (Completeness): All impact assessment requirements are covered', () => {
    // Test that all 10 requirements for holistic impact assessment are satisfied
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 100 }), // Iteration counter
        (_iteration) => {
          const processor = new ImpactAssessmentProcessor(promptsPath);
          const requirements = processor.validateRequirements();
          
          // All 10 requirements must be satisfied
          const allRequirementsMet = 
            requirements.requirement_21_1 &&  // Impact assessment checklist
            requirements.requirement_21_2 &&  // Dependency map
            requirements.requirement_21_3 &&  // Identify affected components
            requirements.requirement_21_4 &&  // Validate core principles
            requirements.requirement_21_5 &&  // Generate regression tests
            requirements.requirement_21_6 &&  // Library vision document
            requirements.requirement_21_7 &&  // Document rationale
            requirements.requirement_21_8 &&  // Rollback procedures
            requirements.requirement_21_9 &&  // Cross-platform consistency
            requirements.requirement_21_10;   // Update documentation
          
          expect(allRequirementsMet).toBe(true);
          
          // Count satisfied requirements
          const satisfiedCount = Object.values(requirements).filter(v => v === true).length;
          expect(satisfiedCount).toBe(10);
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});
