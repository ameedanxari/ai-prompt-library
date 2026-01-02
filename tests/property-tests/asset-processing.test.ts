import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { AssetProcessor } from '../../src/asset-processor.js';

/**
 * Feature: ai-prompt-library, Property 4: Asset Processing Workflow
 * 
 * For any set of user assets in arbitrary locations, the system should reorganize them 
 * into Working_Copy structure, maintain provenance tracking, create mapping documentation, 
 * and support all specified file types.
 * 
 * Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5
 */

describe('Property-Based Tests: Asset Processing Workflow', () => {
  const processor = new AssetProcessor();

  // Generator for various file paths and types
  const filePathGenerator = fc.record({
    directory: fc.constantFrom('uploads', 'docs', 'assets', 'designs', 'user-files', ''),
    filename: fc.string({ minLength: 3, maxLength: 20 }).map(s => s.replace(/[^a-zA-Z0-9]/g, '')),
    extension: fc.constantFrom('.png', '.jpg', '.svg', '.md', '.pdf', '.json', '.csv', '.yaml', '.ttf', '.mp4')
  }).map(({ directory, filename, extension }) => 
    directory ? `${directory}/${filename}${extension}` : `${filename}${extension}`
  );

  // Generator for sets of asset files
  const assetSetGenerator = fc.array(filePathGenerator, { minLength: 0, maxLength: 20 });

  // Generator for different asset categories
  const designAssetGenerator = fc.record({
    type: fc.constantFrom('wireframe', 'mockup', 'prototype', 'component'),
    platform: fc.constantFrom('web', 'mobile', 'desktop'),
    feature: fc.constantFrom('dashboard', 'login', 'settings', 'profile'),
    version: fc.constantFrom('v1', 'v2', 'final', 'draft')
  }).map(({ type, platform, feature, version }) => 
    `designs/${platform}-${feature}-${type}-${version}.png`
  );

  const specAssetGenerator = fc.record({
    type: fc.constantFrom('requirements', 'api', 'technical', 'business'),
    domain: fc.constantFrom('user', 'payment', 'auth', 'admin'),
    format: fc.constantFrom('.md', '.pdf', '.yaml', '.json')
  }).map(({ type, domain, format }) => 
    `specs/${domain}-${type}${format}`
  );

  const dataAssetGenerator = fc.record({
    type: fc.constantFrom('schema', 'sample', 'config'),
    entity: fc.constantFrom('user', 'product', 'order', 'session'),
    format: fc.constantFrom('.json', '.csv', '.sql', '.yaml')
  }).map(({ type, entity, format }) => 
    `data/${entity}-${type}${format}`
  );

  const brandAssetGenerator = fc.record({
    type: fc.constantFrom('logo', 'icon', 'font', 'image'),
    variant: fc.constantFrom('primary', 'secondary', 'dark', 'light'),
    format: fc.constantFrom('.svg', '.png', '.ttf', '.jpg')
  }).map(({ type, variant, format }) => 
    `brand/${type}-${variant}${format}`
  );

  it('Property 4: Asset Processing Workflow - complete workflow for any asset set', () => {
    fc.assert(
      fc.property(
        assetSetGenerator,
        (assetPaths) => {
          // For any set of asset paths, the complete workflow should work
          const inventory = processor.scanAssets(assetPaths);
          const organizationPlan = processor.organizeAssets(inventory);
          const provenanceRecords = processor.trackProvenance(inventory, organizationPlan);
          const mapping = processor.generateMapping(inventory, organizationPlan, provenanceRecords);
          const validation = processor.validateAssets(inventory);
          const requirements = processor.validateRequirements(assetPaths);

          // Property assertion: Complete workflow processes any asset set
          expect(inventory.totalFiles).toBe(assetPaths.length);
          expect(organizationPlan.fileMovements.length).toBe(assetPaths.length);
          expect(provenanceRecords.length).toBe(assetPaths.length);
          expect(Object.keys(mapping.originalToNew).length).toBe(assetPaths.length);

          // All requirements should be met
          expect(requirements.requirement_2_1).toBe(true); // Accept working_copy files
          expect(requirements.requirement_2_2).toBe(true); // Reorganize into structure
          expect(requirements.requirement_2_3).toBe(true); // Maintain provenance
          expect(requirements.requirement_2_4).toBe(true); // Create mapping documentation
          expect(requirements.requirement_2_5).toBe(true); // Support various file types

          // Validation should always produce results
          expect(validation.passed.length + validation.warnings.length + validation.requiresAttention.length)
            .toBe(assetPaths.length);

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 4: Asset categorization consistency across different inputs', () => {
    fc.assert(
      fc.property(
        fc.oneof(
          designAssetGenerator,
          specAssetGenerator,
          dataAssetGenerator,
          brandAssetGenerator
        ),
        (assetPath) => {
          // For any categorizable asset, categorization should be consistent
          const inventory = processor.scanAssets([assetPath]);
          
          // Property assertion: Categorization is deterministic and consistent
          expect(inventory.totalFiles).toBe(1);
          
          const file = Object.values(inventory.categories).flat()[0];
          expect(file).toBeDefined();
          expect(['designs', 'specifications', 'dataSamples', 'assets']).toContain(file.category);
          expect(file.subcategory).toBeDefined();
          expect(file.subcategory.length).toBeGreaterThan(0);

          // Re-processing same asset should yield identical results
          const inventory2 = processor.scanAssets([assetPath]);
          const file2 = Object.values(inventory2.categories).flat()[0];
          
          expect(file.category).toBe(file2.category);
          expect(file.subcategory).toBe(file2.subcategory);
          expect(file.fileType).toBe(file2.fileType);

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 4: Organization preserves all files and relationships', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.oneof(designAssetGenerator, specAssetGenerator, dataAssetGenerator, brandAssetGenerator),
          { minLength: 2, maxLength: 10 }
        ),
        (assetPaths) => {
          // For any set of related assets, organization should preserve relationships
          const inventory = processor.scanAssets(assetPaths);
          const organizationPlan = processor.organizeAssets(inventory);

          // Property assertion: Organization preserves all files
          expect(organizationPlan.fileMovements.length).toBe(assetPaths.length);
          
          // All original paths should be accounted for
          const originalPaths = organizationPlan.fileMovements.map(m => m.originalPath);
          expect(originalPaths.sort()).toEqual(assetPaths.sort());

          // All relationships should be preserved
          expect(organizationPlan.preservedRelationships).toEqual(inventory.relationships);

          // Directory structure should be valid
          expect(Object.keys(organizationPlan.directoryStructure).length).toBeGreaterThan(0);
          expect(Object.values(organizationPlan.directoryStructure).every(count => count >= 0)).toBe(true);

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 4: Provenance tracking maintains complete history', () => {
    fc.assert(
      fc.property(
        assetSetGenerator,
        (assetPaths) => {
          // For any asset set, provenance should maintain complete history
          const inventory = processor.scanAssets(assetPaths);
          const organizationPlan = processor.organizeAssets(inventory);
          const provenanceRecords = processor.trackProvenance(inventory, organizationPlan);

          // Property assertion: Complete provenance for all assets
          expect(provenanceRecords.length).toBe(assetPaths.length);

          for (const record of provenanceRecords) {
            // Each record should have complete information
            expect(record.assetId).toBeDefined();
            expect(record.originalPath).toBeDefined();
            expect(record.originalName).toBeDefined();
            expect(record.processingHistory.length).toBeGreaterThan(0);
            expect(record.currentLocation).toBeDefined();
            expect(record.integrityHash).toBeDefined();

            // Processing history should include key steps
            const actions = record.processingHistory.map(step => step.action);
            expect(actions).toContain('discovery');
            expect(actions).toContain('organization');
          }

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 4: Mapping documentation provides complete traceability', () => {
    fc.assert(
      fc.property(
        fc.array(filePathGenerator, { minLength: 1, maxLength: 15 }),
        (assetPaths) => {
          // For any asset set, mapping should provide complete traceability
          const inventory = processor.scanAssets(assetPaths);
          const organizationPlan = processor.organizeAssets(inventory);
          const provenanceRecords = processor.trackProvenance(inventory, organizationPlan);
          const mapping = processor.generateMapping(inventory, organizationPlan, provenanceRecords);

          // Property assertion: Complete mapping traceability
          expect(Object.keys(mapping.originalToNew).length).toBe(assetPaths.length);
          expect(Object.keys(mapping.categoryMappings).length).toBe(4); // 4 categories

          // All original paths should be mapped
          for (const originalPath of assetPaths) {
            expect(mapping.originalToNew[originalPath]).toBeDefined();
          }

          // Category mappings should contain all files
          const totalMappedFiles = Object.values(mapping.categoryMappings)
            .reduce((sum, files) => sum + files.length, 0);
          expect(totalMappedFiles).toBe(assetPaths.length);

          // Usage references should be generated for all assets
          expect(Object.keys(mapping.usageInSpecs).length).toBe(assetPaths.length);

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 4: File type support covers all specified formats', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            name: fc.string({ minLength: 1, maxLength: 10 }),
            ext: fc.constantFrom(
              '.png', '.jpg', '.jpeg', '.svg', '.gif', '.sketch', '.fig', '.xd', '.psd', '.ai',
              '.md', '.pdf', '.docx', '.txt', '.html',
              '.json', '.csv', '.xml', '.sql', '.yaml', '.yml',
              '.ico', '.ttf', '.otf', '.woff', '.mp4', '.mp3', '.wav'
            )
          }).map(({ name, ext }) => `${name}${ext}`),
          { minLength: 1, maxLength: 10 }
        ),
        (assetPaths) => {
          // For any set of supported file types, processing should work
          const supportedTypes = processor.supportedFileTypes();
          const requirements = processor.validateRequirements(assetPaths);

          // Property assertion: All specified file types are supported
          expect(requirements.requirement_2_5).toBe(true);

          // All extensions in test should be supported
          for (const path of assetPaths) {
            const ext = path.substring(path.lastIndexOf('.'));
            expect(supportedTypes).toContain(ext);
          }

          // Processing should work for all supported types
          const inventory = processor.scanAssets(assetPaths);
          expect(inventory.totalFiles).toBe(assetPaths.length);

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 4: Asset validation provides comprehensive quality assessment', () => {
    fc.assert(
      fc.property(
        assetSetGenerator,
        (assetPaths) => {
          // For any asset set, validation should provide comprehensive assessment
          const inventory = processor.scanAssets(assetPaths);
          const validation = processor.validateAssets(inventory);

          // Property assertion: Comprehensive validation coverage
          const totalValidated = validation.passed.length + 
                               validation.warnings.length + 
                               validation.requiresAttention.length;
          expect(totalValidated).toBe(assetPaths.length);

          // Validation should always provide analysis and recommendations
          expect(Array.isArray(validation.gapAnalysis)).toBe(true);
          expect(Array.isArray(validation.qualityRecommendations)).toBe(true);

          // Each validation issue should have required fields
          for (const issue of [...validation.warnings, ...validation.requiresAttention]) {
            expect(issue.assetId).toBeDefined();
            expect(issue.issue).toBeDefined();
            expect(issue.impact).toBeDefined();
            expect(issue.recommendation).toBeDefined();
          }

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 4 (Invariant): Asset processing is idempotent', () => {
    fc.assert(
      fc.property(
        fc.array(filePathGenerator, { minLength: 1, maxLength: 5 }),
        (assetPaths) => {
          // Processing the same assets multiple times should yield identical results
          const inventory1 = processor.scanAssets(assetPaths);
          const inventory2 = processor.scanAssets(assetPaths);

          // Invariant: Idempotent processing
          expect(inventory1.totalFiles).toBe(inventory2.totalFiles);
          expect(inventory1.categories.designs.length).toBe(inventory2.categories.designs.length);
          expect(inventory1.categories.specifications.length).toBe(inventory2.categories.specifications.length);
          expect(inventory1.categories.dataSamples.length).toBe(inventory2.categories.dataSamples.length);
          expect(inventory1.categories.assets.length).toBe(inventory2.categories.assets.length);

          // Organization should also be idempotent
          const plan1 = processor.organizeAssets(inventory1);
          const plan2 = processor.organizeAssets(inventory2);

          expect(plan1.fileMovements.length).toBe(plan2.fileMovements.length);
          expect(Object.keys(plan1.directoryStructure)).toEqual(Object.keys(plan2.directoryStructure));

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 4 (Edge Case): Empty and single-file asset sets', () => {
    fc.assert(
      fc.property(
        fc.oneof(
          fc.constant([]), // Empty set
          fc.array(filePathGenerator, { minLength: 1, maxLength: 1 }) // Single file
        ),
        (assetPaths) => {
          // Edge cases should be handled gracefully
          const inventory = processor.scanAssets(assetPaths);
          const organizationPlan = processor.organizeAssets(inventory);
          const provenanceRecords = processor.trackProvenance(inventory, organizationPlan);
          const mapping = processor.generateMapping(inventory, organizationPlan, provenanceRecords);
          const validation = processor.validateAssets(inventory);

          // Property assertion: Edge cases handled gracefully
          expect(inventory.totalFiles).toBe(assetPaths.length);
          expect(organizationPlan.fileMovements.length).toBe(assetPaths.length);
          expect(provenanceRecords.length).toBe(assetPaths.length);
          expect(Object.keys(mapping.originalToNew).length).toBe(assetPaths.length);

          // Validation should work even for empty sets
          expect(validation.passed.length + validation.warnings.length + validation.requiresAttention.length)
            .toBe(assetPaths.length);

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 4 (Round-trip): Asset information integrity through complete workflow', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.oneof(designAssetGenerator, specAssetGenerator, dataAssetGenerator, brandAssetGenerator),
          { minLength: 1, maxLength: 8 }
        ),
        (assetPaths) => {
          // Information should be preserved through the complete workflow
          const inventory = processor.scanAssets(assetPaths);
          const organizationPlan = processor.organizeAssets(inventory);
          const provenanceRecords = processor.trackProvenance(inventory, organizationPlan);

          // Round-trip property: Original information preserved in provenance
          for (let i = 0; i < assetPaths.length; i++) {
            const originalPath = assetPaths[i];
            const provenanceRecord = provenanceRecords.find(r => r.originalPath === originalPath);
            
            expect(provenanceRecord).toBeDefined();
            expect(provenanceRecord!.originalPath).toBe(originalPath);
            
            // Current location should be derivable from organization plan
            const movement = organizationPlan.fileMovements.find(m => m.originalPath === originalPath);
            expect(movement).toBeDefined();
            expect(provenanceRecord!.currentLocation).toBe(movement!.newPath);
          }

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});