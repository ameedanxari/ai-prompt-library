import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { MockDataProcessor } from '../../src/mock-data-processor.js';

/**
 * Feature: ai-prompt-library, Property 24: Centralized Mock Data Organization
 * 
 * For any API endpoint in the specification, the system should generate centralized mock data 
 * files organized by endpoint and status code, with all platforms referencing the same shared 
 * mock data and no platform-specific duplicates.
 * 
 * Validates: Requirements 19.1, 19.2, 19.3, 19.4, 19.5, 19.6, 19.7, 19.8
 */

describe('Property-Based Tests: Centralized Mock Data Organization', () => {
  const processor = new MockDataProcessor();

  // Generator for API endpoints
  const apiEndpointGenerator = fc.record({
    version: fc.constantFrom('v1', 'v2'),
    resource: fc.constantFrom('users', 'products', 'orders', 'auth', 'payments', 'notifications'),
    hasId: fc.boolean()
  }).map(({ version, resource, hasId }) => 
    hasId ? `/api/${version}/${resource}/{id}` : `/api/${version}/${resource}`
  );

  // Generator for sets of API endpoints
  const endpointSetGenerator = fc.array(apiEndpointGenerator, { minLength: 1, maxLength: 10 })
    .map(endpoints => [...new Set(endpoints)]); // Remove duplicates

  // Generator for platform mock configurations
  const platformMocksGenerator = fc.record({
    web: fc.array(fc.string({ minLength: 5, maxLength: 50 }), { minLength: 0, maxLength: 5 }),
    ios: fc.array(fc.string({ minLength: 5, maxLength: 50 }), { minLength: 0, maxLength: 5 }),
    android: fc.array(fc.string({ minLength: 5, maxLength: 50 }), { minLength: 0, maxLength: 5 }),
    desktop: fc.array(fc.string({ minLength: 5, maxLength: 50 }), { minLength: 0, maxLength: 5 })
  });

  // Generator for HTTP methods
  const httpMethodGenerator = fc.constantFrom('GET', 'POST', 'PUT', 'DELETE', 'PATCH');

  // Generator for HTTP status codes
  const statusCodeGenerator = fc.oneof(
    fc.constantFrom(200, 201, 204), // Success
    fc.constantFrom(400, 401, 403, 404, 409, 429), // Client errors
    fc.constantFrom(500, 502, 503) // Server errors
  );

  it('Property 24: Centralized Mock Data Organization - validates complete mock data workflow', () => {
    fc.assert(
      fc.property(
        endpointSetGenerator,
        platformMocksGenerator,
        (endpoints, platformMocks) => {
          // For any set of API endpoints and platform mocks, the system should organize them correctly
          const organization = processor.organizeMockData(endpoints);
          const consolidation = processor.consolidatePlatformMocks(platformMocks);
          const validation = processor.validateMockData(organization.mockFiles);
          const requirements = processor.validateRequirements(endpoints, platformMocks);

          // Property assertion: Complete mock data organization workflow
          
          // Requirement 19.1: Centralized directory structure
          expect(organization.directoryStructure.basePath).toBe('mocks/');
          expect(organization.hasIndex).toBe(true);
          expect(organization.hasSchemas).toBe(true);
          expect(requirements.requirement_19_1).toBe(true);

          // Requirement 19.2: Happy flow and error states
          expect(organization.hasHappyPath).toBe(true);
          expect(organization.hasErrorStates).toBe(true);
          expect(requirements.requirement_19_2).toBe(true);

          // Requirement 19.3: All platforms reference shared mocks
          expect(consolidation.allPlatformsReferenceShared).toBe(true);
          expect(requirements.requirement_19_3).toBe(true);

          // Requirement 19.4: No platform-specific duplicates
          expect(consolidation.noPlatformSpecificMocks).toBe(true);
          expect(requirements.requirement_19_4).toBe(true);

          // Requirement 19.5: Validation schemas for contract compliance
          expect(validation.schemaCompliance).toBe(true);
          expect(requirements.requirement_19_5).toBe(true);

          // Requirement 19.6: Naming conventions
          expect(organization.followsNamingConvention).toBe(true);
          expect(requirements.requirement_19_6).toBe(true);

          // Requirement 19.7: Mock data versioning
          expect(organization.hasVersioning).toBe(true);
          expect(requirements.requirement_19_7).toBe(true);

          // Requirement 19.8: Documentation mapping
          expect(validation.documentationMapping.length).toBeGreaterThan(0);
          expect(requirements.requirement_19_8).toBe(true);

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 24: Mock files are organized by endpoint and status code', () => {
    fc.assert(
      fc.property(
        endpointSetGenerator,
        (endpoints) => {
          const organization = processor.organizeMockData(endpoints);

          // Property: Each mock file should be organized by endpoint
          for (const mockFile of organization.mockFiles) {
            // Path should contain the endpoint structure
            expect(mockFile.path).toContain('mocks/');
            expect(mockFile.path).toContain(mockFile.method);
            
            // Status code should be in the filename
            expect(mockFile.path).toContain(`${mockFile.statusCode}-`);
            
            // File should be JSON
            expect(mockFile.path).toMatch(/\.json$/);
          }

          // Property: Status code coverage should be tracked per endpoint
          for (const endpoint of endpoints) {
            expect(organization.statusCodeCoverage[endpoint]).toBeDefined();
            expect(organization.statusCodeCoverage[endpoint].length).toBeGreaterThan(0);
          }

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 24: All platforms reference centralized mock location', () => {
    fc.assert(
      fc.property(
        platformMocksGenerator,
        (platformMocks) => {
          const consolidation = processor.consolidatePlatformMocks(platformMocks);

          // Property: All platform references should point to centralized path
          for (const reference of consolidation.platformReferences) {
            expect(reference.mockDataPath).toBe('mocks/');
            expect(['web', 'ios', 'android', 'desktop']).toContain(reference.platform);
            expect(['direct', 'copy', 'symlink']).toContain(reference.importMethod);
          }

          // Property: Centralized path should be consistent
          expect(consolidation.centralizedPath).toBe('mocks/');

          // Property: All platforms should be accounted for
          const platforms = Object.keys(platformMocks);
          expect(consolidation.platforms.sort()).toEqual(platforms.sort());

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 24: Mock data validation produces documentation mapping', () => {
    fc.assert(
      fc.property(
        endpointSetGenerator,
        (endpoints) => {
          const organization = processor.organizeMockData(endpoints);
          const validation = processor.validateMockData(organization.mockFiles);

          // Property: Every mock file should have a documentation mapping
          expect(validation.documentationMapping.length).toBe(organization.mockFiles.length);

          // Property: Each mapping should have required fields
          for (const mapping of validation.documentationMapping) {
            expect(mapping.mockFile).toBeDefined();
            expect(mapping.apiEndpoint).toBeDefined();
            expect(mapping.apiSpecReference).toBeDefined();
            expect(mapping.statusCode).toBeDefined();
            expect(mapping.description).toBeDefined();

            // API spec reference should follow OpenAPI format
            expect(mapping.apiSpecReference).toContain('openapi.yaml#/paths/');
          }

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 24: Naming conventions are consistently applied', () => {
    fc.assert(
      fc.property(
        endpointSetGenerator,
        (endpoints) => {
          const organization = processor.organizeMockData(endpoints);

          // Property: All mock files should follow naming convention
          const namingPattern = /\d{3}-[a-z0-9-]+\.json$/;
          
          for (const mockFile of organization.mockFiles) {
            const filename = mockFile.path.split('/').pop()!;
            expect(filename).toMatch(namingPattern);
            
            // Status code should be at the start of filename
            expect(filename.startsWith(`${mockFile.statusCode}-`)).toBe(true);
          }

          expect(organization.followsNamingConvention).toBe(true);

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 24: Status code coverage includes success and error states', () => {
    fc.assert(
      fc.property(
        endpointSetGenerator,
        (endpoints) => {
          const organization = processor.organizeMockData(endpoints);

          // Property: Should have both success (2xx) and error (4xx, 5xx) states
          const allStatusCodes = organization.mockFiles.map(m => m.statusCode);
          
          const hasSuccess = allStatusCodes.some(code => code >= 200 && code < 300);
          const hasClientError = allStatusCodes.some(code => code >= 400 && code < 500);
          const hasServerError = allStatusCodes.some(code => code >= 500 && code < 600);

          expect(hasSuccess).toBe(true);
          expect(hasClientError || hasServerError).toBe(true);
          expect(organization.hasHappyPath).toBe(true);
          expect(organization.hasErrorStates).toBe(true);

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 24: Mock index generation includes all endpoints', () => {
    fc.assert(
      fc.property(
        endpointSetGenerator,
        (endpoints) => {
          const organization = processor.organizeMockData(endpoints);
          const index = processor.generateMockIndex(organization.mockFiles) as {
            version: string;
            lastUpdated: string;
            apiVersion: string;
            endpoints: Array<{ path: string; methods: string[]; mockFiles: object }>;
          };

          // Property: Index should have required metadata
          expect(index.version).toBeDefined();
          expect(index.lastUpdated).toBeDefined();
          expect(index.apiVersion).toBeDefined();
          expect(index.endpoints).toBeDefined();

          // Property: All endpoints should be in the index
          const indexedEndpoints = index.endpoints.map(e => e.path);
          for (const endpoint of endpoints) {
            expect(indexedEndpoints).toContain(endpoint);
          }

          // Property: Each endpoint should have methods and mock files
          for (const endpointEntry of index.endpoints) {
            expect(endpointEntry.methods.length).toBeGreaterThan(0);
            expect(Object.keys(endpointEntry.mockFiles).length).toBeGreaterThan(0);
          }

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 24 (Invariant): Mock organization is idempotent', () => {
    fc.assert(
      fc.property(
        endpointSetGenerator,
        (endpoints) => {
          // Processing the same endpoints multiple times should yield identical results
          const organization1 = processor.organizeMockData(endpoints);
          const organization2 = processor.organizeMockData(endpoints);

          // Invariant: Results should be identical
          expect(organization1.mockFiles.length).toBe(organization2.mockFiles.length);
          expect(organization1.endpoints).toEqual(organization2.endpoints);
          expect(organization1.hasHappyPath).toBe(organization2.hasHappyPath);
          expect(organization1.hasErrorStates).toBe(organization2.hasErrorStates);
          expect(organization1.followsNamingConvention).toBe(organization2.followsNamingConvention);
          expect(organization1.hasVersioning).toBe(organization2.hasVersioning);

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 24 (Invariant): Platform consolidation preserves all platforms', () => {
    fc.assert(
      fc.property(
        platformMocksGenerator,
        (platformMocks) => {
          const consolidation = processor.consolidatePlatformMocks(platformMocks);

          // Invariant: All input platforms should be in the output
          const inputPlatforms = Object.keys(platformMocks).sort();
          const outputPlatforms = consolidation.platforms.sort();
          
          expect(outputPlatforms).toEqual(inputPlatforms);

          // Invariant: Each platform should have a reference
          expect(consolidation.platformReferences.length).toBe(inputPlatforms.length);

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 24 (Metamorphic): More endpoints means more mock files', () => {
    fc.assert(
      fc.property(
        fc.tuple(
          fc.array(apiEndpointGenerator, { minLength: 1, maxLength: 3 }),
          fc.array(apiEndpointGenerator, { minLength: 4, maxLength: 8 })
        ),
        ([smallerSet, largerSet]) => {
          // Ensure sets are actually different sizes after deduplication
          const uniqueSmaller = [...new Set(smallerSet)];
          const uniqueLarger = [...new Set(largerSet)];
          
          if (uniqueSmaller.length >= uniqueLarger.length) {
            return true; // Skip if sizes don't differ as expected
          }

          const smallOrg = processor.organizeMockData(uniqueSmaller);
          const largeOrg = processor.organizeMockData(uniqueLarger);

          // Metamorphic property: More endpoints should produce more mock files
          expect(largeOrg.mockFiles.length).toBeGreaterThan(smallOrg.mockFiles.length);
          expect(largeOrg.endpoints.length).toBeGreaterThan(smallOrg.endpoints.length);

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 24: Template structure validation', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('structure', 'content', 'completeness'),
        (validationType) => {
          const templateStructure = processor.validateTemplateStructure();

          // Property: Template should have all required sections
          expect(templateStructure.hasPurpose).toBe(true);
          expect(templateStructure.hasInstructions).toBe(true);
          expect(templateStructure.hasExamples).toBe(true);
          expect(templateStructure.hasDirectoryStructure).toBe(true);
          expect(templateStructure.hasNamingConventions).toBe(true);
          expect(templateStructure.hasVersioning).toBe(true);
          expect(templateStructure.hasIndexGeneration).toBe(true);
          expect(templateStructure.hasSchemaValidation).toBe(true);
          expect(templateStructure.hasPlatformConsolidation).toBe(true);
          expect(templateStructure.hasDocumentationMapping).toBe(true);

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 24: Status code coverage validation', () => {
    fc.assert(
      fc.property(
        fc.array(statusCodeGenerator, { minLength: 1, maxLength: 10 }),
        (statusCodes) => {
          const coverage = processor.validateStatusCodeCoverage(statusCodes);

          // Property: Coverage should be calculated correctly
          expect(typeof coverage.hasSuccess).toBe('boolean');
          expect(typeof coverage.hasClientError).toBe('boolean');
          expect(typeof coverage.hasServerError).toBe('boolean');
          expect(coverage.coverage).toBeGreaterThanOrEqual(0);
          expect(coverage.coverage).toBeLessThanOrEqual(100);

          // Property: Coverage percentage should reflect actual coverage
          const categories = processor.getStatusCodeCategories();
          const hasSuccess = statusCodes.some(code => categories.success.includes(code));
          const hasClientError = statusCodes.some(code => categories.clientError.includes(code));
          const hasServerError = statusCodes.some(code => categories.serverError.includes(code));

          expect(coverage.hasSuccess).toBe(hasSuccess);
          expect(coverage.hasClientError).toBe(hasClientError);
          expect(coverage.hasServerError).toBe(hasServerError);

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 24 (Edge Case): Empty and single endpoint sets', () => {
    fc.assert(
      fc.property(
        fc.oneof(
          fc.constant(['/api/v1/users']), // Single endpoint
          fc.array(apiEndpointGenerator, { minLength: 1, maxLength: 1 }) // Random single
        ),
        (endpoints) => {
          const uniqueEndpoints = [...new Set(endpoints)];
          const organization = processor.organizeMockData(uniqueEndpoints);

          // Edge case: Single endpoint should still produce valid organization
          expect(organization.mockFiles.length).toBeGreaterThan(0);
          expect(organization.endpoints.length).toBe(uniqueEndpoints.length);
          expect(organization.hasHappyPath).toBe(true);
          expect(organization.hasErrorStates).toBe(true);
          expect(organization.followsNamingConvention).toBe(true);

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 24 (Round-trip): Mock validation is consistent', () => {
    fc.assert(
      fc.property(
        endpointSetGenerator,
        (endpoints) => {
          const organization = processor.organizeMockData(endpoints);
          
          // Validate multiple times
          const validation1 = processor.validateMockData(organization.mockFiles);
          const validation2 = processor.validateMockData(organization.mockFiles);

          // Round-trip property: Validation results should be identical
          expect(validation1.totalMocks).toBe(validation2.totalMocks);
          expect(validation1.validMocks).toBe(validation2.validMocks);
          expect(validation1.invalidMocks).toBe(validation2.invalidMocks);
          expect(validation1.schemaCompliance).toBe(validation2.schemaCompliance);
          expect(validation1.contractCompliance).toBe(validation2.contractCompliance);
          expect(validation1.documentationMapping.length).toBe(validation2.documentationMapping.length);

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});
