import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { IoTTemplateValidator } from '../../src/iot-template-validator.js';
import { join } from 'path';

/**
 * Feature: ai-prompt-library-v2, Property 14: IoT Connectivity Template Coverage
 * 
 * For any IoT device connectivity and management requirements, the IoT
 * template collection should provide comprehensive coverage for device discovery,
 * pairing, management, security, and edge computing.
 * 
 * Validates: Requirements 14.1, 14.3, 14.6, 14.7
 */

describe('Property-Based Tests: IoT Connectivity Template Completeness', () => {
  const iotModulePath = join(process.cwd(), 'prompts/modules/iot');

  it('Property 14: IoT Connectivity Template Coverage - validates comprehensive IoT connectivity template collection', () => {
    // Property-based test with 100+ iterations
    fc.assert(
      fc.property(
        // Generator for different validation approaches and scenarios
        fc.record({
          validationAspect: fc.constantFrom('completeness', 'content_quality', 'data_models', 'integration_coverage'),
          checkOrder: fc.array(fc.constantFrom('device_connectivity', 'device_management', 'iot_security', 'edge_computing'), { minLength: 1, maxLength: 4 }),
          requirementFocus: fc.constantFrom('14.1', '14.3', '14.6', '14.7', 'all')
        }),
        (testCase) => {
          // For any validation approach, the IoT connectivity templates should be comprehensive
          const validator = new IoTTemplateValidator(iotModulePath);

          // Test the core property: IoT connectivity template completeness
          const structure = validator.validateConnectivityTemplates();
          const requirements = validator.validateConnectivityRequirements();

          // Property assertion: All required IoT connectivity templates exist
          expect(structure.hasDeviceConnectivityTemplate).toBe(true);
          expect(structure.hasDeviceManagementTemplate).toBe(true);
          expect(structure.hasIoTSecurityTemplate).toBe(true);
          expect(structure.hasEdgeComputingTemplate).toBe(true);

          // Property assertion: All templates have required structural elements
          expect(structure.allTemplatesHaveRequiredSections).toBe(true);
          expect(structure.templatesHaveImplementationPatterns).toBe(true);
          expect(structure.templatesHaveConfigurationExamples).toBe(true);
          expect(structure.templatesHaveIntegrationPoints).toBe(true);
          expect(structure.templatesHaveDataModels).toBe(true);

          // Property assertion: Requirements compliance
          expect(requirements.requirement_14_1).toBe(true); // Device discovery, pairing, connection management, authentication
          expect(requirements.requirement_14_3).toBe(true); // Device monitoring, firmware updates, configuration, remote control
          expect(requirements.requirement_14_6).toBe(true); // Edge processing, local storage, offline operation, edge-to-cloud sync
          expect(requirements.requirement_14_7).toBe(true); // Device certificates, secure communication, access controls, monitoring

          // Property invariant: Template collection completeness is consistent
          const allTemplatesExist = structure.hasDeviceConnectivityTemplate &&
            structure.hasDeviceManagementTemplate &&
            structure.hasIoTSecurityTemplate &&
            structure.hasEdgeComputingTemplate;

          expect(allTemplatesExist).toBe(true);

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 14 (Edge Case): IoT connectivity template content validation with different access patterns', () => {
    // Test property with variations in how we might access and validate template content
    fc.assert(
      fc.property(
        fc.record({
          templateOrder: fc.shuffledSubarray(['device-connectivity.md', 'device-management.md', 'iot-security.md', 'edge-computing.md'], { minLength: 1, maxLength: 4 }),
          contentValidation: fc.constantFrom('structure', 'data_models', 'patterns', 'integration_points')
        }),
        (testCase) => {
          const validator = new IoTTemplateValidator(iotModulePath);

          // The property should hold regardless of template access order
          for (const templateFile of testCase.templateOrder) {
            const templatePath = join(iotModulePath, templateFile);
            const content = validator.validateTemplateContent(templatePath);

            // Core property: Each IoT connectivity template has comprehensive content
            expect(content.hasPurposeSection).toBe(true);
            expect(content.hasContextSection).toBe(true);
            expect(content.hasImplementationPatterns).toBe(true);
            expect(content.hasConfigurationParameters).toBe(true);
            expect(content.hasCodeExamples).toBe(true);
          }

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 14 (Invariant): IoT connectivity template collection maintains consistency across validation methods', () => {
    // Test that IoT connectivity template validation is consistent regardless of validation approach
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 10 }), // Arbitrary test parameter for multiple validation runs
        (_iteration) => {
          const validator = new IoTTemplateValidator(iotModulePath);

          // Run multiple validation methods
          const structure1 = validator.validateConnectivityTemplates();
          const structure2 = validator.validateConnectivityTemplates();
          const requirements1 = validator.validateConnectivityRequirements();
          const requirements2 = validator.validateConnectivityRequirements();

          // Invariant: Multiple validation runs should produce identical results
          expect(structure1.hasDeviceConnectivityTemplate).toBe(structure2.hasDeviceConnectivityTemplate);
          expect(structure1.hasDeviceManagementTemplate).toBe(structure2.hasDeviceManagementTemplate);
          expect(structure1.hasIoTSecurityTemplate).toBe(structure2.hasIoTSecurityTemplate);
          expect(structure1.hasEdgeComputingTemplate).toBe(structure2.hasEdgeComputingTemplate);

          expect(requirements1.requirement_14_1).toBe(requirements2.requirement_14_1);
          expect(requirements1.requirement_14_3).toBe(requirements2.requirement_14_3);
          expect(requirements1.requirement_14_6).toBe(requirements2.requirement_14_6);
          expect(requirements1.requirement_14_7).toBe(requirements2.requirement_14_7);

          // Invariant: Requirements should be consistent with structure validation
          expect(requirements1.requirement_14_1).toBe(structure1.hasDeviceConnectivityTemplate && structure1.templatesHaveImplementationPatterns);
          expect(requirements1.requirement_14_3).toBe(structure1.hasDeviceManagementTemplate && structure1.templatesHaveImplementationPatterns);
          expect(requirements1.requirement_14_6).toBe(structure1.hasEdgeComputingTemplate && structure1.templatesHaveImplementationPatterns);
          expect(requirements1.requirement_14_7).toBe(structure1.hasIoTSecurityTemplate && structure1.templatesHaveImplementationPatterns);

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 14 (Completeness): IoT connectivity template collection covers all IoT scenarios', () => {
    // Test that the template collection comprehensively covers IoT connectivity scenarios
    fc.assert(
      fc.property(
        fc.record({
          iotScenario: fc.constantFrom('device_connectivity', 'device_management', 'iot_security', 'edge_computing'),
          applicationDomain: fc.constantFrom('smart_home', 'industrial', 'healthcare', 'agriculture'),
          connectivityProtocol: fc.constantFrom('mqtt', 'bluetooth', 'zigbee', 'wifi')
        }),
        (testCase) => {
          const validator = new IoTTemplateValidator(iotModulePath);
          const structure = validator.validateConnectivityTemplates();

          // Property: Template collection should handle any IoT scenario
          switch (testCase.iotScenario) {
            case 'device_connectivity':
              expect(structure.hasDeviceConnectivityTemplate).toBe(true);
              break;
            case 'device_management':
              expect(structure.hasDeviceManagementTemplate).toBe(true);
              break;
            case 'iot_security':
              expect(structure.hasIoTSecurityTemplate).toBe(true);
              break;
            case 'edge_computing':
              expect(structure.hasEdgeComputingTemplate).toBe(true);
              break;
          }

          // Property: Application domain requirements should be supported
          if (testCase.applicationDomain === 'industrial' || testCase.applicationDomain === 'healthcare') {
            expect(structure.hasIoTSecurityTemplate).toBe(true);
            expect(structure.hasDeviceManagementTemplate).toBe(true);
          }

          if (testCase.applicationDomain === 'smart_home') {
            expect(structure.hasDeviceConnectivityTemplate).toBe(true);
            expect(structure.hasEdgeComputingTemplate).toBe(true);
          }

          // Property: All connectivity protocols should be supported by device connectivity template
          expect(structure.hasDeviceConnectivityTemplate).toBe(true);

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 14 (Feature Coverage): IoT connectivity templates cover essential IoT features', () => {
    // Test that IoT connectivity templates include proper feature coverage
    fc.assert(
      fc.property(
        fc.record({
          iotFeature: fc.constantFrom('connectivity', 'management', 'security', 'edge'),
          implementationDepth: fc.constantFrom('basic', 'intermediate', 'advanced')
        }),
        (testCase) => {
          const validator = new IoTTemplateValidator(iotModulePath);
          const structure = validator.validateConnectivityTemplates();
          const features = validator.validateIoTFeatureCoverage();

          // Property: Core IoT features should be covered by appropriate templates
          switch (testCase.iotFeature) {
            case 'connectivity':
              expect(structure.hasDeviceConnectivityTemplate).toBe(true);
              expect(features.hasDeviceConnectivity).toBe(true);
              break;
            case 'management':
              expect(structure.hasDeviceManagementTemplate).toBe(true);
              expect(features.hasDeviceManagement).toBe(true);
              break;
            case 'security':
              expect(structure.hasIoTSecurityTemplate).toBe(true);
              expect(features.hasIoTSecurity).toBe(true);
              break;
            case 'edge':
              expect(structure.hasEdgeComputingTemplate).toBe(true);
              expect(features.hasEdgeComputing).toBe(true);
              break;
          }

          // Property: All templates should have implementation patterns for any depth
          expect(structure.templatesHaveImplementationPatterns).toBe(true);

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});
