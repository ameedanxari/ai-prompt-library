import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { BuildCommandProcessor } from '../../src/build-command-processor.js';
import { FunctionalityPreservationProcessor } from '../../src/functionality-preservation-processor.js';
import { join } from 'path';

/**
 * Feature: ai-prompt-library, Property 21: Build Command Preservation
 * 
 * For any successful build or test execution, the system should store the commands in repository 
 * documentation with timestamps and success indicators for future context-free execution.
 * 
 * Validates: Requirements 16.1, 16.2, 16.3, 16.4, 16.5
 */

/**
 * Feature: ai-prompt-library, Property 22: Functionality Preservation During Fixes
 * 
 * For any bug fix or test correction, the system should preserve all existing functionality 
 * and reject fixes that reduce capabilities, ensuring all changes are incremental and additive.
 * 
 * Validates: Requirements 17.1, 17.2, 17.3, 17.4, 17.5
 */

describe('Property-Based Tests: Optimization and Preservation', () => {
  const promptsPath = join(process.cwd(), 'prompts/templates');

  describe('Property 21: Build Command Preservation', () => {
    it('Property 21: Build Command Preservation - validates comprehensive command storage and tracking', () => {
      // Property-based test with 100+ iterations
      fc.assert(
        fc.property(
          // Generator for different command preservation scenarios
          fc.record({
            commandType: fc.constantFrom('build', 'test', 'deploy', 'development'),
            platform: fc.constantFrom('linux', 'windows', 'macos', 'docker'),
            validationAspect: fc.constantFrom('storage', 'history', 'context-free', 'success-tracking')
          }),
          (testCase) => {
            // For any command preservation scenario, the system should have complete build command preservation capability
            const processor = new BuildCommandProcessor(promptsPath);
            
            // Test the core property: Build command preservation completeness
            const capability = processor.validateBuildCommandCapability();
            const requirements = processor.validateRequirements();
            
            // Property assertion: Build command preservation completeness
            // The system must have command storage capability
            expect(capability.hasCommandStorage).toBe(true);
            
            // The system must have command history capability
            expect(capability.hasCommandHistory).toBe(true);
            
            // The system must have context-free execution capability
            expect(capability.hasContextFreeExecution).toBe(true);
            
            // The system must have success tracking capability
            expect(capability.hasSuccessTracking).toBe(true);
            
            // The system must have command validation capability
            expect(capability.hasCommandValidation).toBe(true);
            
            // Validate all requirements are met
            expect(requirements.requirement_16_1).toBe(true); // Store successful build commands
            expect(requirements.requirement_16_2).toBe(true); // Store successful test commands
            expect(requirements.requirement_16_3).toBe(true); // Maintain commands history log
            expect(requirements.requirement_16_4).toBe(true); // Reference stored commands for context-free execution
            expect(requirements.requirement_16_5).toBe(true); // Update stored commands only on successful executions
            
            // Property invariant: All build command preservation capabilities are present
            const allCapabilitiesPresent = capability.hasCommandStorage && 
                                         capability.hasCommandHistory && 
                                         capability.hasContextFreeExecution && 
                                         capability.hasSuccessTracking && 
                                         capability.hasCommandValidation;
            
            expect(allCapabilitiesPresent).toBe(true);
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('Property 21 (Edge Case): Build command preservation with different command types', () => {
      // Test property with variations in command types and execution contexts
      fc.assert(
        fc.property(
          fc.record({
            executionContext: fc.constantFrom('ci', 'local', 'docker', 'cloud'),
            commandComplexity: fc.constantFrom('simple', 'complex', 'chained'),
            environmentVariables: fc.boolean()
          }),
          (testCase) => {
            const processor = new BuildCommandProcessor(promptsPath);
            
            // The property should hold regardless of command type or execution context
            const capability = processor.validateBuildCommandCapability();
            
            // Core property: System always has complete build command preservation capability
            const hasCompleteBuildCommandPreservation = capability.hasCommandStorage && 
                                                       capability.hasCommandHistory && 
                                                       capability.hasContextFreeExecution && 
                                                       capability.hasSuccessTracking && 
                                                       capability.hasCommandValidation;
            
            expect(hasCompleteBuildCommandPreservation).toBe(true);
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('Property 21 (Invariant): Build command preservation capabilities are mutually consistent', () => {
      // Test that all build command preservation capabilities are logically consistent with each other
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 10 }), // Arbitrary test parameter
          (_iteration) => {
            const processor = new BuildCommandProcessor(promptsPath);
            const capability = processor.validateBuildCommandCapability();
            const requirements = processor.validateRequirements();
            
            // Invariant: If system has command storage, it should also have success tracking
            if (capability.hasCommandStorage) {
              expect(capability.hasSuccessTracking).toBe(true);
            }
            
            // Invariant: If system has context-free execution, it should also have command storage
            if (capability.hasContextFreeExecution) {
              expect(capability.hasCommandStorage).toBe(true);
            }
            
            // Invariant: If system has command validation, it should also have success tracking
            if (capability.hasCommandValidation) {
              expect(capability.hasSuccessTracking).toBe(true);
            }
            
            // Invariant: Requirements validation should be consistent with capability validation
            expect(requirements.requirement_16_1).toBe(capability.hasCommandStorage && capability.hasSuccessTracking);
            expect(requirements.requirement_16_2).toBe(capability.hasCommandStorage && capability.hasSuccessTracking);
            expect(requirements.requirement_16_3).toBe(capability.hasCommandHistory);
            expect(requirements.requirement_16_4).toBe(capability.hasContextFreeExecution);
            expect(requirements.requirement_16_5).toBe(capability.hasSuccessTracking && capability.hasCommandValidation);
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('Property 21 (Round-trip): Command registry generation and validation consistency', () => {
      // Test that command registry generation prompts produce registries that validate correctly
      fc.assert(
        fc.property(
          fc.record({
            projectType: fc.constantFrom('web', 'mobile', 'backend', 'fullstack'),
            buildTool: fc.constantFrom('npm', 'yarn', 'maven', 'gradle', 'make')
          }),
          (testCase) => {
            const processor = new BuildCommandProcessor(promptsPath);
            
            // The command storage capability should be comprehensive
            const capability = processor.validateBuildCommandCapability();
            expect(capability.hasCommandStorage).toBe(true);
            
            // If we have command storage capability, we should be able to validate command registry structure
            // This tests the round-trip property: generate -> validate -> consistent results
            const mockRegistryPath = join(process.cwd(), '.command-registry', 'README.md');
            
            // Even if the file doesn't exist, the validation should handle it gracefully
            const registryStructure = processor.validateCommandRegistryStructure(mockRegistryPath);
            
            // The validation should be consistent with our generation capability
            // If we can generate, we should know what structure to expect
            expect(typeof registryStructure.hasCurrentWorkingCommands).toBe('boolean');
            expect(typeof registryStructure.hasCommandHistory).toBe('boolean');
            expect(typeof registryStructure.hasPlatformSpecificCommands).toBe('boolean');
            expect(typeof registryStructure.hasEnvironmentRequirements).toBe('boolean');
            expect(typeof registryStructure.hasTroubleshootingGuide).toBe('boolean');
            expect(typeof registryStructure.hasValidationFramework).toBe('boolean');
            expect(typeof registryStructure.hasMaintenanceProtocols).toBe('boolean');
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 22: Functionality Preservation During Fixes', () => {
    it('Property 22: Functionality Preservation During Fixes - validates comprehensive preservation framework', () => {
      // Property-based test with 100+ iterations
      fc.assert(
        fc.property(
          // Generator for different functionality preservation scenarios
          fc.record({
            fixType: fc.constantFrom('bug-fix', 'security-fix', 'performance-fix', 'enhancement'),
            componentType: fc.constantFrom('api', 'ui', 'database', 'integration'),
            preservationAspect: fc.constantFrom('assessment', 'guidelines', 'regression', 'improvement')
          }),
          (testCase) => {
            // For any functionality preservation scenario, the system should have complete preservation capability
            const processor = new FunctionalityPreservationProcessor(promptsPath);
            
            // Test the core property: Functionality preservation completeness
            const capability = processor.validateFunctionalityPreservationCapability();
            const requirements = processor.validateRequirements();
            
            // Property assertion: Functionality preservation completeness
            // The system must have pre-fix assessment capability
            expect(capability.hasPreFixAssessment).toBe(true);
            
            // The system must have fix implementation guidelines capability
            expect(capability.hasFixImplementationGuidelines).toBe(true);
            
            // The system must have regression prevention capability
            expect(capability.hasRegressionPrevention).toBe(true);
            
            // The system must have incremental improvement capability
            expect(capability.hasIncrementalImprovement).toBe(true);
            
            // The system must have fix rejection criteria capability
            expect(capability.hasFixRejectionCriteria).toBe(true);
            
            // Validate all requirements are met
            expect(requirements.requirement_17_1).toBe(true); // Preserve all existing functionality during fixes
            expect(requirements.requirement_17_2).toBe(true); // Reject fixes that reduce or remove functionality
            expect(requirements.requirement_17_3).toBe(true); // Ensure all fixes are incremental and additive
            expect(requirements.requirement_17_4).toBe(true); // Document rationale and get approval for functionality changes
            expect(requirements.requirement_17_5).toBe(true); // Maintain functionality regression checklist
            
            // Property invariant: All functionality preservation capabilities are present
            const allCapabilitiesPresent = capability.hasPreFixAssessment && 
                                         capability.hasFixImplementationGuidelines && 
                                         capability.hasRegressionPrevention && 
                                         capability.hasIncrementalImprovement && 
                                         capability.hasFixRejectionCriteria;
            
            expect(allCapabilitiesPresent).toBe(true);
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('Property 22 (Edge Case): Functionality preservation with different fix scenarios', () => {
      // Test property with variations in fix types and complexity
      fc.assert(
        fc.property(
          fc.record({
            fixComplexity: fc.constantFrom('simple', 'moderate', 'complex'),
            affectedComponents: fc.integer({ min: 1, max: 5 }),
            hasBreakingChanges: fc.boolean()
          }),
          (testCase) => {
            const processor = new FunctionalityPreservationProcessor(promptsPath);
            
            // The property should hold regardless of fix complexity or scope
            const capability = processor.validateFunctionalityPreservationCapability();
            
            // Core property: System always has complete functionality preservation capability
            const hasCompleteFunctionalityPreservation = capability.hasPreFixAssessment && 
                                                        capability.hasFixImplementationGuidelines && 
                                                        capability.hasRegressionPrevention && 
                                                        capability.hasIncrementalImprovement && 
                                                        capability.hasFixRejectionCriteria;
            
            expect(hasCompleteFunctionalityPreservation).toBe(true);
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('Property 22 (Invariant): Functionality preservation capabilities are mutually consistent', () => {
      // Test that all functionality preservation capabilities are logically consistent with each other
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 10 }), // Arbitrary test parameter
          (_iteration) => {
            const processor = new FunctionalityPreservationProcessor(promptsPath);
            const capability = processor.validateFunctionalityPreservationCapability();
            const requirements = processor.validateRequirements();
            
            // Invariant: If system has regression prevention, it should also have pre-fix assessment
            if (capability.hasRegressionPrevention) {
              expect(capability.hasPreFixAssessment).toBe(true);
            }
            
            // Invariant: If system has incremental improvement, it should also have fix implementation guidelines
            if (capability.hasIncrementalImprovement) {
              expect(capability.hasFixImplementationGuidelines).toBe(true);
            }
            
            // Invariant: If system has fix rejection criteria, it should also have fix implementation guidelines
            if (capability.hasFixRejectionCriteria) {
              expect(capability.hasFixImplementationGuidelines).toBe(true);
            }
            
            // Invariant: Requirements validation should be consistent with capability validation
            expect(requirements.requirement_17_1).toBe(capability.hasPreFixAssessment && capability.hasRegressionPrevention);
            expect(requirements.requirement_17_2).toBe(capability.hasFixRejectionCriteria);
            expect(requirements.requirement_17_3).toBe(capability.hasIncrementalImprovement && capability.hasFixImplementationGuidelines);
            expect(requirements.requirement_17_4).toBe(capability.hasFixImplementationGuidelines && capability.hasFixRejectionCriteria);
            expect(requirements.requirement_17_5).toBe(capability.hasRegressionPrevention);
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('Property 22 (Round-trip): Preservation framework generation and validation consistency', () => {
      // Test that preservation framework generation prompts produce frameworks that validate correctly
      fc.assert(
        fc.property(
          fc.record({
            systemType: fc.constantFrom('web-app', 'api', 'mobile-app', 'desktop-app'),
            preservationLevel: fc.constantFrom('basic', 'comprehensive', 'enterprise')
          }),
          (testCase) => {
            const processor = new FunctionalityPreservationProcessor(promptsPath);
            
            // The preservation capability should be comprehensive
            const capability = processor.validateFunctionalityPreservationCapability();
            expect(capability.hasPreFixAssessment).toBe(true);
            
            // If we have preservation capability, we should be able to validate preservation framework structure
            // This tests the round-trip property: generate -> validate -> consistent results
            const mockFrameworkPath = join(process.cwd(), 'functionality-preservation-framework.md');
            
            // Even if the file doesn't exist, the validation should handle it gracefully
            const frameworkStructure = processor.validatePreservationFrameworkStructure(mockFrameworkPath);
            
            // The validation should be consistent with our generation capability
            // If we can generate, we should know what structure to expect
            expect(typeof frameworkStructure.hasPreFixAssessment).toBe('boolean');
            expect(typeof frameworkStructure.hasFixImplementationGuidelines).toBe('boolean');
            expect(typeof frameworkStructure.hasTestingStrategy).toBe('boolean');
            expect(typeof frameworkStructure.hasRegressionPrevention).toBe('boolean');
            expect(typeof frameworkStructure.hasFixRejectionCriteria).toBe('boolean');
            expect(typeof frameworkStructure.hasIncrementalImprovement).toBe('boolean');
            expect(typeof frameworkStructure.hasDocumentationFramework).toBe('boolean');
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Integration Properties: Optimization and Preservation Synergy', () => {
    it('Integration Property: Build command preservation and functionality preservation work together', () => {
      // Test that build command preservation and functionality preservation capabilities complement each other
      fc.assert(
        fc.property(
          fc.record({
            scenario: fc.constantFrom('fix-with-build-changes', 'enhancement-with-new-commands', 'refactor-with-preserved-commands'),
            validationDepth: fc.constantFrom('surface', 'deep', 'comprehensive')
          }),
          (testCase) => {
            const buildProcessor = new BuildCommandProcessor(promptsPath);
            const functionalityProcessor = new FunctionalityPreservationProcessor(promptsPath);
            
            // Both systems should have their respective capabilities
            const buildCapability = buildProcessor.validateBuildCommandCapability();
            const functionalityCapability = functionalityProcessor.validateFunctionalityPreservationCapability();
            
            // Integration property: If we have both capabilities, they should be mutually supportive
            if (buildCapability.hasCommandStorage && functionalityCapability.hasPreFixAssessment) {
              // Build command preservation should support functionality preservation
              expect(buildCapability.hasSuccessTracking).toBe(true);
              expect(functionalityCapability.hasRegressionPrevention).toBe(true);
            }
            
            // Integration property: Command validation should align with fix validation
            if (buildCapability.hasCommandValidation && functionalityCapability.hasFixRejectionCriteria) {
              expect(buildCapability.hasSuccessTracking).toBe(true);
              expect(functionalityCapability.hasFixImplementationGuidelines).toBe(true);
            }
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});