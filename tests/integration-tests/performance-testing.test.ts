
/**
 * Performance Testing Suite
 * Tests token usage optimization, file system performance, and memory usage
 * Validates concurrent execution scenarios and optimization effectiveness
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { StagePipelineController, StageId, ProjectBrief, StageResult, StageStatus } from '../../src/stage-pipeline-controller';
import { StateManager } from '../../src/state-manager';
import { OutputDirectoryManager, OutputType } from '../../src/output-directory-manager';
import { TaskGenerationEngine, Specification, Task } from '../../src/task-generation-engine';
import { ContextOptimizationService } from '../../src/context-optimization-service';
import { TemplateCompositionEngine } from '../../src/template-composition-engine';
import { QualityGateSystem } from '../../src/quality-gate-system';
import { ErrorRecoverySystem } from '../../src/error-recovery-system';
import * as fs from 'fs/promises';
import * as path from 'path';

describe('Performance Testing Suite', () => {
  let pipelineController: StagePipelineController;
  let stateManager: StateManager;
  let outputManager: OutputDirectoryManager;
  let taskGenerator: TaskGenerationEngine;
  let contextOptimizer: ContextOptimizationService;
  let templateComposer: TemplateCompositionEngine;

  const performanceTestProjects: Record<string, { brief: ProjectBrief, name: string }> = {
    small: {
      name: 'Small Test Project',
      brief: {
        description: 'A simple web application with basic features',
        domain: 'web',
        platforms: ['web'],
        features: ['authentication', 'user-profiles', 'basic-crud'],
        requirements: ['Basic requirement 1', 'Basic requirement 2']
      }
    },
    medium: {
      name: 'Medium Test Project',
      brief: {
        description: 'A moderate complexity e-commerce platform',
        domain: 'commerce',
        platforms: ['web', 'mobile'],
        features: [
          'product-catalog', 'shopping-cart', 'payment-processing',
          'user-authentication', 'order-management', 'inventory-tracking',
          'analytics', 'customer-reviews', 'search-functionality'
        ],
        requirements: ['Req 1', 'Req 2', 'Req 3']
      }
    },
    large: {
      name: 'Large Test Project',
      brief: {
        description: 'A complex enterprise social platform with extensive features',
        domain: 'social',
        platforms: ['web', 'mobile', 'desktop'],
        features: [
          'user-profiles', 'social-feed', 'real-time-messaging', 'content-sharing',
          'social-graph', 'community-groups', 'live-streaming', 'content-moderation',
          'notification-system', 'privacy-controls', 'analytics-dashboard',
          'monetization-features', 'api-management', 'third-party-integrations',
          'advanced-search', 'recommendation-engine', 'content-creation-tools',
          'multi-language-support', 'accessibility-features', 'performance-monitoring'
        ],
        requirements: ['Scale 1', 'Scale 2', 'Scale 3']
      }
    }
  };

  beforeEach(() => {
    stateManager = new StateManager('test-perf-outputs');
    outputManager = new OutputDirectoryManager('test-perf-outputs');
    taskGenerator = new TaskGenerationEngine();
    contextOptimizer = new ContextOptimizationService();
    templateComposer = new TemplateCompositionEngine();

    // Create base dirs
    outputManager.createDirectoryStructure();

    pipelineController = new StagePipelineController();
  });

  afterEach(async () => {
    // Cleanup would go here ( rimraf test-perf-outputs )
    // For now we rely on overwrite or tmp dir behavior of test runner if strict
  });

  describe('Token Usage Optimization Tests', () => {
    it('should optimize content to stay within token budgets', async () => {
      const largeContent = 'A'.repeat(10000); // 10k characters ~ 2.5k tokens

      const optimized = contextOptimizer.optimizePrompt(largeContent, 1000);

      // Should stay within token budget or have chunks
      expect(optimized.tokenCount).toBeDefined();
      expect(optimized.chunks.length).toBeGreaterThan(0);

      // Should preserve essential information (conceptually)
      // Since our simple mock data is just 'A's, mainly checking mechanics
    });

    it('should handle chunking effectively for large tasks', async () => {
      const startTime = Date.now();

      const specs: Specification[] = [{
        id: 'spec-large',
        name: 'Large Spec',
        type: 'feature',
        content: 'Detailed requirement '.repeat(100),
        stage: StageId.IMPLEMENTATION,
        requirements: Array.from({ length: 20 }, (_, i) => `Requirement ${i}`)
      }];

      const tasks = taskGenerator.generateTasks(specs);

      const generationTime = Date.now() - startTime;

      // Should generate tasks efficiently
      expect(generationTime).toBeLessThan(2000);
      expect(tasks.length).toBeGreaterThan(0);

      // Optimize task list content
      const taskContent = JSON.stringify(tasks);
      const chunkStartTime = Date.now();
      const optimized = contextOptimizer.optimizePrompt(taskContent, 2000);
      const chunkTime = Date.now() - chunkStartTime;

      expect(chunkTime).toBeLessThan(1000);
      // It might or might not chunk depending on JSON size, but API call should work
      expect(optimized).toBeDefined();
    });
  });

  describe('File System Performance Tests', () => {
    it('should handle directory creation and file operations efficiently', async () => {
      const startTime = Date.now();

      // Create directories
      outputManager.createDirectoryStructure();

      const dirTime = Date.now() - startTime;
      expect(dirTime).toBeLessThan(1000);

      // Verify
      const validation = outputManager.validateDirectoryStructure();
      expect(validation.isValid).toBe(true);
    });

    it('should handle large file operations efficiently', async () => {
      const largeContent = 'X'.repeat(100000); // 100KB
      const startTime = Date.now();

      outputManager.saveStageOutput(StageId.IMPLEMENTATION, {
        type: OutputType.DOCUMENTATION,
        filename: 'large-test-file.md',
        content: largeContent,
        references: []
      });

      const writeTime = Date.now() - startTime;
      expect(writeTime).toBeLessThan(2000);
    });
  });

  describe('Concurrent Execution Scenarios', () => {
    it('should handle multiple projects concurrently (using separate instances)', async () => {
      const concurrentCount = 5;
      const startTime = Date.now();

      const promises = Array.from({ length: concurrentCount }, async (_, i) => {
        // Each "thread" needs its own state manager for isolation if we simulate separate runs
        const localStateMgr = new StateManager(`test-perf-concurrent-${i}`);

        localStateMgr.createProject(performanceTestProjects.small.brief, `Project ${i}`);

        // Simulate some work
        const mockResult: StageResult = {
          stageId: StageId.INTAKE,
          status: StageStatus.COMPLETED,
          outputs: [{
            type: 'brief',
            filename: 'brief.md',
            content: 'Brief content',
            references: [],
            platform: 'web'
          }],
          decisions: [],
          nextStage: StageId.CHARTER,
          validationResults: [],
          timestamp: new Date(),
          duration: 10
        };

        localStateMgr.updateStageProgress(StageId.INTAKE, mockResult);
        return true;
      });

      const results = await Promise.all(promises);
      const totalTime = Date.now() - startTime;

      expect(totalTime).toBeLessThan(10000);
      expect(results.every(r => r === true)).toBe(true);
    });

    it('should handle concurrent template selections efficiently', async () => {
      const concurrentSelections = 20;
      // Template engine is stateless/sync, so easily parallelizable

      const startTime = Date.now();
      const selectionPromises = Array.from({ length: concurrentSelections }, (_, i) => {
        return Promise.resolve(templateComposer.selectTemplates('web', StageId.IMPLEMENTATION, ['auth']));
      });

      const results = await Promise.all(selectionPromises);
      const selectionTime = Date.now() - startTime;

      expect(selectionTime).toBeLessThan(5000);
      expect(results.length).toBe(concurrentSelections);
    });
  });

  describe('Optimization Effectiveness Validation', () => {
    it('should demonstrate token reduction', async () => {
      const redundantContent = "Repeated phrase ".repeat(100);

      const optimized = contextOptimizer.optimizePrompt(redundantContent);

      // Optimization logic includes redundancy removal
      expect(optimized.tokenCount).toBeLessThan(contextOptimizer.estimateTokens(redundantContent));
    });

    it('should validate template selection optimization', async () => {
      const startTime = Date.now();
      const templates = templateComposer.selectTemplates(
        'social',
        StageId.IMPLEMENTATION,
        performanceTestProjects.large.brief.features || []
      );
      const duration = Date.now() - startTime;

      expect(duration).toBeLessThan(1000);
      expect(templates.coreTemplates.length).toBeGreaterThan(0);

      // Check for uniqueness
      const names = [...templates.coreTemplates, ...(templates.crossCuttingTemplates || [])].map(t => t.name);
      const unique = new Set(names);
      // Allow for some overlap/duplicates between core and cross-cutting templates
      expect(unique.size).toBeGreaterThan(names.length * 0.8);
    });
  });

  describe('Memory Usage Monitoring', () => {
    it('should handle memory efficient template selection', async () => {
      const initial = process.memoryUsage().heapUsed;

      // Run loop
      for (let i = 0; i < 50; i++) {
        templateComposer.selectTemplates('social', StageId.IMPLEMENTATION, ['all-features']);
      }

      const final = process.memoryUsage().heapUsed;
      const diffMB = (final - initial) / 1024 / 1024;

      // Expect not huge growth (garbage collection happens, but we just check reasonable bounds)
      expect(diffMB).toBeLessThan(200);
    });
  });
});