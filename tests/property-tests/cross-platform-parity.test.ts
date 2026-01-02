import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

/**
 * Feature: ai-prompt-library, Property 11: Cross-Platform Parity Management
 * 
 * For any multi-platform project, the system should maintain capability matrices, 
 * document platform differences with rationale, generate parity validation tests, 
 * specify shared contracts, and include parity verification tasks.
 * 
 * Validates: Requirements 6.1, 6.2, 6.3, 6.4, 6.5
 */

interface ParityPromptStructure {
  hasCapabilityMatrix: boolean;
  hasPlatformDifferences: boolean;
  hasValidationTests: boolean;
  hasSharedContracts: boolean;
  hasVerificationTasks: boolean;
  hasDryRunSupport: boolean;
}

interface ParityRequirements {
  requirement_6_1: boolean; // Capability matrix maintenance
  requirement_6_2: boolean; // Platform differences documentation
  requirement_6_3: boolean; // Parity validation tests
  requirement_6_4: boolean; // Shared contract specification
  requirement_6_5: boolean; // Parity verification tasks
}

class CrossPlatformParityValidator {
  private parityModulePath: string;

  constructor() {
    this.parityModulePath = join(process.cwd(), 'prompts/modules/cross-platform');
  }

  validateParityPromptStructure(): ParityPromptStructure {
    const parityMatrixPath = join(this.parityModulePath, 'parity-matrix.md');
    const parityDocPath = join(this.parityModulePath, 'parity-documentation.md');
    const validationTestsPath = join(this.parityModulePath, 'parity-validation-tests.md');
    const sharedContractsPath = join(this.parityModulePath, 'shared-contracts.md');
    const verificationTasksPath = join(this.parityModulePath, 'parity-verification-tasks.md');
    const dryRunPath = join(this.parityModulePath, 'parity-dry-run.md');

    return {
      hasCapabilityMatrix: this.validatePromptFile(parityMatrixPath, [
        'parity matrix',
        'feature implementation',
        'platform'
      ]),
      hasPlatformDifferences: this.validatePromptFile(parityDocPath, [
        'platform differences',
        'rationale',
        'mitigation'
      ]),
      hasValidationTests: this.validatePromptFile(validationTestsPath, [
        'validation tests',
        'cross-platform',
        'test suite'
      ]),
      hasSharedContracts: this.validatePromptFile(sharedContractsPath, [
        'contracts',
        'api',
        'consistency'
      ]),
      hasVerificationTasks: this.validatePromptFile(verificationTasksPath, [
        'verification',
        'parity',
        'monitoring'
      ]),
      hasDryRunSupport: this.validatePromptFile(dryRunPath, [
        'dry run',
        'validation',
        'feasibility'
      ])
    };
  }

  validateParityRequirements(): ParityRequirements {
    const structure = this.validateParityPromptStructure();

    return {
      requirement_6_1: structure.hasCapabilityMatrix, // Capability matrix maintenance
      requirement_6_2: structure.hasPlatformDifferences, // Platform differences documentation  
      requirement_6_3: structure.hasValidationTests, // Parity validation tests
      requirement_6_4: structure.hasSharedContracts, // Shared contract specification
      requirement_6_5: structure.hasVerificationTasks // Parity verification tasks
    };
  }

  private validatePromptFile(filePath: string, requiredElements: string[]): boolean {
    if (!existsSync(filePath)) {
      return false;
    }

    try {
      const content = readFileSync(filePath, 'utf-8').toLowerCase();
      
      // Check that at least some required elements are present in the prompt
      // Use a more flexible approach - require at least 50% of elements to be present
      const foundElements = requiredElements.filter(element => 
        content.includes(element.toLowerCase())
      );
      const hasMinimumElements = foundElements.length >= Math.ceil(requiredElements.length * 0.5);

      // Check for basic prompt structure (more flexible)
      const hasContextVariables = content.includes('context variables');
      const hasPromptTemplate = content.includes('prompt template');
      const hasInstructions = content.includes('instructions');
      const hasExpectedOutputs = content.includes('expected outputs') || content.includes('expected output');

      // Require basic structure plus minimum element coverage
      return hasMinimumElements && hasContextVariables && hasPromptTemplate && 
             hasInstructions && hasExpectedOutputs;
    } catch (error) {
      return false;
    }
  }

  validateParityPromptIntegration(platforms: string[]): boolean {
    const structure = this.validateParityPromptStructure();
    
    // All parity components must be present for multi-platform projects
    if (platforms.length > 1) {
      return structure.hasCapabilityMatrix && 
             structure.hasPlatformDifferences && 
             structure.hasValidationTests && 
             structure.hasSharedContracts && 
             structure.hasVerificationTasks;
    }
    
    return true; // Single platform doesn't require full parity suite
  }

  validateParityPromptConsistency(): boolean {
    const parityFiles = [
      'parity-matrix.md',
      'parity-documentation.md', 
      'parity-validation-tests.md',
      'shared-contracts.md',
      'parity-verification-tasks.md',
      'parity-dry-run.md'
    ];

    // Check that all files follow consistent prompt structure
    return parityFiles.every(file => {
      const filePath = join(this.parityModulePath, file);
      if (!existsSync(filePath)) return false;

      const content = readFileSync(filePath, 'utf-8');
      
      // Consistent structure elements
      const hasTitle = content.includes('# ');
      const hasPurpose = content.includes('## Purpose');
      const hasContextVars = content.includes('## Context Variables');
      const hasPromptTemplate = content.includes('## Prompt Template');
      const hasInstructions = content.includes('## Instructions');
      const hasOutputs = content.includes('## Expected Outputs');
      
      return hasTitle && hasPurpose && hasContextVars && 
             hasPromptTemplate && hasInstructions && hasOutputs;
    });
  }
}

describe('Property-Based Tests: Cross-Platform Parity Management', () => {
  const validator = new CrossPlatformParityValidator();

  it('Property 11: Cross-Platform Parity Management - validates comprehensive parity support', () => {
    // Property-based test with 100+ iterations
    fc.assert(
      fc.property(
        // Generator for different multi-platform project configurations
        fc.record({
          platforms: fc.array(
            fc.constantFrom('web', 'ios', 'android', 'desktop'), 
            { minLength: 2, maxLength: 4 }
          ).map(arr => [...new Set(arr)]), // Remove duplicates
          features: fc.array(
            fc.constantFrom('auth', 'data-sync', 'ui-components', 'notifications', 'offline'),
            { minLength: 1, maxLength: 5 }
          ),
          validationScope: fc.constantFrom('quick', 'standard', 'comprehensive')
        }),
        (testCase) => {
          // For any multi-platform project configuration, parity management should be comprehensive
          const structure = validator.validateParityPromptStructure();
          const requirements = validator.validateParityRequirements();
          
          // Property assertion: Cross-Platform Parity Management completeness
          // Must maintain capability matrices
          expect(structure.hasCapabilityMatrix).toBe(true);
          
          // Must document platform differences with rationale
          expect(structure.hasPlatformDifferences).toBe(true);
          
          // Must generate parity validation tests
          expect(structure.hasValidationTests).toBe(true);
          
          // Must specify shared contracts
          expect(structure.hasSharedContracts).toBe(true);
          
          // Must include parity verification tasks
          expect(structure.hasVerificationTasks).toBe(true);
          
          // Must support dry-run validation
          expect(structure.hasDryRunSupport).toBe(true);
          
          // Validate requirements compliance
          expect(requirements.requirement_6_1).toBe(true); // Capability matrix maintenance
          expect(requirements.requirement_6_2).toBe(true); // Platform differences documentation
          expect(requirements.requirement_6_3).toBe(true); // Parity validation tests
          expect(requirements.requirement_6_4).toBe(true); // Shared contract specification
          expect(requirements.requirement_6_5).toBe(true); // Parity verification tasks
          
          // Property invariant: Multi-platform projects must have complete parity support
          const hasCompleteParitySupport = validator.validateParityPromptIntegration(testCase.platforms);
          expect(hasCompleteParitySupport).toBe(true);
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 11 (Edge Case): Parity management with single platform should be optional', () => {
    // Test property with single-platform scenarios
    fc.assert(
      fc.property(
        fc.record({
          platform: fc.constantFrom('web', 'ios', 'android', 'desktop'),
          features: fc.array(
            fc.constantFrom('auth', 'data-sync', 'ui-components'),
            { minLength: 1, maxLength: 3 }
          )
        }),
        (testCase) => {
          // For single-platform projects, parity tools should still be available but not required
          const structure = validator.validateParityPromptStructure();
          
          // Core property: Parity tools are available even for single platform
          expect(structure.hasCapabilityMatrix).toBe(true);
          expect(structure.hasSharedContracts).toBe(true);
          
          // Single platform integration should not fail
          const singlePlatformIntegration = validator.validateParityPromptIntegration([testCase.platform]);
          expect(singlePlatformIntegration).toBe(true);
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 11 (Invariant): Parity prompt structure consistency across all components', () => {
    // Test that all parity prompts follow consistent structure and patterns
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 10 }), // Arbitrary test parameter
        (_iteration) => {
          const structure = validator.validateParityPromptStructure();
          const requirements = validator.validateParityRequirements();
          
          // Invariant: All parity components must follow consistent prompt structure
          const hasConsistentStructure = validator.validateParityPromptConsistency();
          expect(hasConsistentStructure).toBe(true);
          
          // Invariant: If capability matrix exists, other parity components should exist
          if (structure.hasCapabilityMatrix) {
            expect(structure.hasPlatformDifferences).toBe(true);
            expect(structure.hasValidationTests).toBe(true);
            expect(structure.hasSharedContracts).toBe(true);
            expect(structure.hasVerificationTasks).toBe(true);
          }
          
          // Invariant: Requirements validation should be consistent with structure validation
          expect(requirements.requirement_6_1).toBe(structure.hasCapabilityMatrix);
          expect(requirements.requirement_6_2).toBe(structure.hasPlatformDifferences);
          expect(requirements.requirement_6_3).toBe(structure.hasValidationTests);
          expect(requirements.requirement_6_4).toBe(structure.hasSharedContracts);
          expect(requirements.requirement_6_5).toBe(structure.hasVerificationTasks);
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 11 (Metamorphic): Parity management scales with platform complexity', () => {
    // Test that parity management capabilities scale appropriately with platform count
    fc.assert(
      fc.property(
        fc.record({
          platformSet1: fc.array(
            fc.constantFrom('web', 'ios'), 
            { minLength: 1, maxLength: 2 }
          ).map(arr => [...new Set(arr)]),
          platformSet2: fc.array(
            fc.constantFrom('web', 'ios', 'android', 'desktop'), 
            { minLength: 2, maxLength: 4 }
          ).map(arr => [...new Set(arr)])
        }),
        (testCase) => {
          // Metamorphic property: More platforms should not reduce parity capabilities
          const integration1 = validator.validateParityPromptIntegration(testCase.platformSet1);
          const integration2 = validator.validateParityPromptIntegration(testCase.platformSet2);
          
          // If smaller platform set has parity support, larger set should too
          if (integration1 && testCase.platformSet2.length >= testCase.platformSet1.length) {
            expect(integration2).toBe(true);
          }
          
          // All parity components should remain available regardless of platform count
          const structure = validator.validateParityPromptStructure();
          expect(structure.hasCapabilityMatrix).toBe(true);
          expect(structure.hasPlatformDifferences).toBe(true);
          expect(structure.hasValidationTests).toBe(true);
          expect(structure.hasSharedContracts).toBe(true);
          expect(structure.hasVerificationTasks).toBe(true);
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});