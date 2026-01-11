import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { IoTTemplateValidator } from '../../src/iot-template-validator.js';
import { join } from 'path';

/**
 * Feature: ai-prompt-library-v2, Property 14: IoT Automation Template Coverage
 * 
 * For any IoT data processing and automation requirements, the IoT
 * template collection should provide comprehensive coverage for sensor data
 * processing, automation rules, industrial IoT, and analytics.
 * 
 * Validates: Requirements 14.2, 14.4, 14.10
 */

describe('Property-Based Tests: IoT Automation Template Completeness', () => {
  const iotModulePath = join(process.cwd(), 'prompts/modules/iot');

  it('Property 14: IoT Automation Template Coverage - validates comprehensive IoT automation template collection', () => {
    // Property-based test with 100+ iterations
    fc.assert(
      fc.property(
        // Generator for different validation approaches and scenarios
        fc.record({
          validationAspect: fc.constantFrom('completeness', 'content_quality', 'data_models', 'integration_coverage'),
          checkOrder: fc.array(fc.constantFrom('sensor_data_processing', 'iot_automation', 'industrial_iot', 'iot_analytics'), { minLength: 1, maxLength: 4 }),
          requirementFocus: fc.constantFrom('14.2', '14.4', '14.10', 'all')
        }),
        (testCase) => {
          // For any validation approach, the IoT automation templates should be comprehensive
          const validator = new IoTTemplateValidator(iotModulePath);

          // Test the core property: IoT automation template completeness
          const structure = validator.validateAutomationTemplates();
          const requirements = validator.validateAutomationRequirements();

          // Property assertion: All required IoT automation templates exist
          expect(structure.hasSensorDataProcessingTemplate).toBe(true);
          expect(structure.hasIoTAutomationTemplate).toBe(true);
          expect(structure.hasIndustrialIoTTemplate).toBe(true);
          expect(structure.hasIoTAnalyticsTemplate).toBe(true);

          // Property assertion: All templates have required structural elements
          expect(structure.allTemplatesHaveRequiredSections).toBe(true);
          expect(structure.templatesHaveImplementationPatterns).toBe(true);
          expect(structure.templatesHaveConfigurationExamples).toBe(true);
          expect(structure.templatesHaveIntegrationPoints).toBe(true);
          expect(structure.templatesHaveDataModels).toBe(true);

          // Property assertion: Requirements compliance
          expect(requirements.requirement_14_2).toBe(true); // Sensor data ingestion, validation, real-time processing, storage
          expect(requirements.requirement_14_4).toBe(true); // Rule engines, trigger systems, scene management, scheduling
          expect(requirements.requirement_14_10).toBe(true); // Industrial protocols, safety systems, predictive maintenance, compliance

          // Property invariant: Template collection completeness is consistent
          const allTemplatesExist = structure.hasSensorDataProcessingTemplate &&
            structure.hasIoTAutomationTemplate &&
            structure.hasIndustrialIoTTemplate &&
            structure.hasIoTAnalyticsTemplate;

          expect(allTemplatesExist).toBe(true);

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 14 (Edge Case): IoT automation template content validation with different access patterns', () => {
    // Test property with variations in how we might access and validate template content
    fc.assert(
      fc.property(
        fc.record({
          templateOrder: fc.shuffledSubarray(['sensor-data-processing.md', 'iot-automation.md', 'industrial-iot.md', 'iot-analytics.md'], { minLength: 1, maxLength: 4 }),
          contentValidation: fc.constantFrom('structure', 'data_models', 'patterns', 'integration_points')
        }),
        (testCase) => {
          const validator = new IoTTemplateValidator(iotModulePath);

          // The property should hold regardless of template access order
          for (const templateFile of testCase.templateOrder) {
            const templatePath = join(iotModulePath, templateFile);
            const content = validator.validateTemplateContent(templatePath);

            // Core property: Each IoT automation template has comprehensive content
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

  it('Property 14 (Invariant): IoT automation template collection maintains consistency across validation methods', () => {
    // Test that IoT automation template validation is consistent regardless of validation approach
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 10 }), // Arbitrary test parameter for multiple validation runs
        (_iteration) => {
          const validator = new IoTTemplateValidator(iotModulePath);

          // Run multiple validation methods
          const structure1 = validator.validateAutomationTemplates();
          const structure2 = validator.validateAutomationTemplates();
          const requirements1 = validator.validateAutomationRequirements();
          const requirements2 = validator.validateAutomationRequirements();

          // Invariant: Multiple validation runs should produce identical results
          expect(structure1.hasSensorDataProcessingTemplate).toBe(structure2.hasSensorDataProcessingTemplate);
          expect(structure1.hasIoTAutomationTemplate).toBe(structure2.hasIoTAutomationTemplate);
          expect(structure1.hasIndustrialIoTTemplate).toBe(structure2.hasIndustrialIoTTemplate);
          expect(structure1.hasIoTAnalyticsTemplate).toBe(structure2.hasIoTAnalyticsTemplate);

          expect(requirements1.requirement_14_2).toBe(requirements2.requirement_14_2);
          expect(requirements1.requirement_14_4).toBe(requirements2.requirement_14_4);
          expect(requirements1.requirement_14_10).toBe(requirements2.requirement_14_10);

          // Invariant: Requirements should be consistent with structure validation
          expect(requirements1.requirement_14_2).toBe(structure1.hasSensorDataProcessingTemplate && structure1.templatesHaveImplementationPatterns);
          expect(requirements1.requirement_14_4).toBe(structure1.hasIoTAutomationTemplate && structure1.templatesHaveImplementationPatterns);

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 14 (Completeness): IoT automation template collection covers all IoT automation scenarios', () => {
    // Test that the template collection comprehensively covers IoT automation scenarios
    fc.assert(
      fc.property(
        fc.record({
          automationScenario: fc.constantFrom('sensor_processing', 'rule_automation', 'industrial', 'analytics'),
          applicationDomain: fc.constantFrom('manufacturing', 'energy', 'agriculture', 'smart_building'),
          dataVolume: fc.constantFrom('low', 'medium', 'high', 'extreme')
        }),
        (testCase) => {
          const validator = new IoTTemplateValidator(iotModulePath);
          const structure = validator.validateAutomationTemplates();

          // Property: Template collection should handle any automation scenario
          switch (testCase.automationScenario) {
            case 'sensor_processing':
              expect(structure.hasSensorDataProcessingTemplate).toBe(true);
              break;
            case 'rule_automation':
              expect(structure.hasIoTAutomationTemplate).toBe(true);
              break;
            case 'industrial':
              expect(structure.hasIndustrialIoTTemplate).toBe(true);
              break;
            case 'analytics':
              expect(structure.hasIoTAnalyticsTemplate).toBe(true);
              break;
          }

          // Property: Application domain requirements should be supported
          if (testCase.applicationDomain === 'manufacturing' || testCase.applicationDomain === 'energy') {
            expect(structure.hasIndustrialIoTTemplate).toBe(true);
            expect(structure.hasSensorDataProcessingTemplate).toBe(true);
          }

          if (testCase.applicationDomain === 'smart_building') {
            expect(structure.hasIoTAutomationTemplate).toBe(true);
            expect(structure.hasIoTAnalyticsTemplate).toBe(true);
          }

          // Property: High data volume scenarios should be supported
          if (testCase.dataVolume === 'high' || testCase.dataVolume === 'extreme') {
            expect(structure.hasSensorDataProcessingTemplate).toBe(true);
          }

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 14 (Feature Coverage): IoT automation templates cover essential automation features', () => {
    // Test that IoT automation templates include proper feature coverage
    fc.assert(
      fc.property(
        fc.record({
          automationFeature: fc.constantFrom('data_processing', 'rule_engine', 'industrial_protocols', 'predictive_analytics'),
          implementationDepth: fc.constantFrom('basic', 'intermediate', 'advanced')
        }),
        (testCase) => {
          const validator = new IoTTemplateValidator(iotModulePath);
          const structure = validator.validateAutomationTemplates();
          const features = validator.validateIoTFeatureCoverage();

          // Property: Core automation features should be covered by appropriate templates
          switch (testCase.automationFeature) {
            case 'data_processing':
              expect(structure.hasSensorDataProcessingTemplate).toBe(true);
              expect(features.hasSensorDataProcessing).toBe(true);
              break;
            case 'rule_engine':
              expect(structure.hasIoTAutomationTemplate).toBe(true);
              expect(features.hasIoTAutomation).toBe(true);
              break;
            case 'industrial_protocols':
              expect(structure.hasIndustrialIoTTemplate).toBe(true);
              expect(features.hasIndustrialIoT).toBe(true);
              break;
            case 'predictive_analytics':
              expect(structure.hasIoTAnalyticsTemplate).toBe(true);
              expect(features.hasIoTAnalytics).toBe(true);
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
