/**
 * Performance Testing Suite
 * Tests token usage optimization, file system performance, and memory usage
 * Validates concurrent execution scenarios and optimization effectiveness
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { StagePipelineController, StageId } from '../../src/stage-pipeline-controller.js';
import { StateManager } from '../../src/state-manager.js';
import { OutputDirectoryManager } from '../../src/output-directory-manager.js';
import { TaskGenerationEngine } from '../../src/task-generation-engine.js';
import { ContextOptimizationService } from '../../src/context-optimization-service.js';
import { TemplateCompositionEngine } from '../../src/template-composition-engine.js';
import * as fs from 'fs/promises';
import * as path from 'path';

describe('Performance Testing Suite', () => {
  let pipelineController: StagePipelineController;
  let stateManager: StateManager;
  let outputManager: OutputDirectoryManager;
  let taskGenerator: TaskGenerationEngine;
  let contextOptimizer: ContextOptimizationService;
  let templateComposer: TemplateCompositionEngine;

  const performanceTestProjects = {
    small: {
      projectId: 'perf-test-small',
      projectName: 'Small Test Project',
      description: 'A simple web application with basic features',
      domain: 'web',
      platforms: ['web'],
      features: ['authentication', 'user-profiles', 'basic-crud']
    },
    medium: {
      projectId: 'perf-test-medium',
      projectName: 'Medium Test Project',
      description: 'A moderate complexity e-commerce platform',
      domain: 'commerce',
      platforms: ['web', 'mobile'],
      features: [
        'product-catalog', 'shopping-cart', 'payment-processing',
        'user-authentication', 'order-management', 'inventory-tracking',
        'analytics', 'customer-reviews', 'search-functionality'
      ]
    },
    large: {
      projectId: 'perf-test-large',
      projectName: 'Large Test Project',
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
      ]
    }
  };

  beforeEach(() => {
    pipelineController = new StagePipelineController();
    stateManager = new StateManager();
    outputManager = new OutputDirectoryManager();
    taskGenerator = new TaskGenerationEngine();
    contextOptimizer = new ContextOptimizationService();
    templateComposer = new TemplateCompositionEngine();
  });

  afterEach(async () => {
    // Cleanup test projects
    for (const project of Object.values(performanceTestProjects)) {
      try {
        await stateManager.deleteProject(project.projectId);
      } catch (error) {
        // Ignore cleanup errors
      }
    }
  });

  describe('Token Usage Optimization Tests', () => {
    it('should optimize content to stay within token budgets', async () => {
      const largeProject = performanceTestProjects.large;
      
      // Create large content that would exceed token limits
      const largeContent = {
        ...largeProject,
        detailedDescription: 'A'.repeat(10000), // 10k characters
        requirements: {
          functional: 'B'.repeat(5000),
          nonFunctional: 'C'.repeat(5000),
          technical: 'D'.repeat(5000)
        }
      };
      
      const tasks = await taskGenerator.generateTasks(
        largeContent,
        StageId.IMPLEMENTATION,
        await stateManager.getProjectState(largeProject.projectId)
      );
      
      const optimized = await contextOptimizer.optimizeForStage(
        largeContent,
        StageId.IMPLEMENTATION,
        tasks
      );
      
      // Should stay within token budget
      expect(optimized.tokenCount).toBeLessThan(8000);
      expect(optimized.optimizationApplied).toBe(true);
      expect(optimized.chunks.length).toBeGreaterThan(1);
      
      // Should preserve essential information
      const combinedContent = optimized.chunks.map(c => c.content).join(' ');
      expect(combinedContent.length).toBeGreaterThan(0);
      expect(combinedContent).toContain(largeProject.projectName);
    });

    it('should handle chunking effectively for large tasks', async () => {
      const startTime = Date.now();
      
      // Generate many tasks to test chunking
      const tasks = await taskGenerator.generateTasks(
        performanceTestProjects.large,
        StageId.IMPLEMENTATION,
        await stateManager.getProjectState(performanceTestProjects.large.projectId)
      );
      
      const generationTime = Date.now() - startTime;
      
      // Should generate tasks efficiently
      expect(generationTime).toBeLessThan(2000); // 2 seconds
      expect(tasks.length).toBeGreaterThan(10); // Should generate multiple tasks
      
      // Each task should be properly sized
      for (const task of tasks) {
        expect(task.estimatedTokens).toBeLessThan(2000);
        expect(task.estimatedTokens).toBeGreaterThan(100);
      }
      
      // Test chunking optimization
      const chunkStartTime = Date.now();
      const optimized = await contextOptimizer.optimizeForStage(
        performanceTestProjects.large,
        StageId.IMPLEMENTATION,
        tasks
      );
      const chunkTime = Date.now() - chunkStartTime;
      
      expect(chunkTime).toBeLessThan(1000); // 1 second
      expect(optimized.chunks.length).toBeGreaterThan(1);
    });

    it('should verify optimization doesnt lose essential information', async () => {
      const criticalProject = {
        ...performanceTestProjects.medium,
        criticalFeatures: ['payment-processing', 'security', 'compliance'],
        securityRequirements: 'PCI-DSS compliance required for payment processing with end-to-end encryption',
        performanceRequirements: 'Sub-100ms response times for payment transactions'
      };
      
      const tasks = await taskGenerator.generateTasks(
        criticalProject,
        StageId.SECURITY,
        await stateManager.getProjectState(criticalProject.projectId)
      );
      
      const optimized = await contextOptimizer.optimizeForStage(
        criticalProject,
        StageId.SECURITY,
        tasks
      );
      
      // Should preserve critical information
      const combinedContent = optimized.chunks.map(c => c.content).join(' ').toLowerCase();
      expect(combinedContent).toContain('payment');
      expect(combinedContent).toContain('security');
      expect(combinedContent).toContain('pci');
      expect(combinedContent).toContain('encryption');
      
      // Should maintain task relationships
      expect(optimized.preservedRelationships).toBe(true);
    });

    it('should handle multiple optimization iterations efficiently', async () => {
      const iterations = 10;
      const times: number[] = [];
      
      for (let i = 0; i < iterations; i++) {
        const startTime = Date.now();
        
        const optimized = await contextOptimizer.optimizeForStage(
          performanceTestProjects.medium,
          StageId.IMPLEMENTATION,
          []
        );
        
        const iterationTime = Date.now() - startTime;
        times.push(iterationTime);
        
        expect(optimized.tokenCount).toBeLessThan(8000);
      }
      
      // Average time should be reasonable
      const averageTime = times.reduce((sum, time) => sum + time, 0) / times.length;
      expect(averageTime).toBeLessThan(500); // 500ms average
      
      // Performance should be consistent (no significant degradation)
      const maxTime = Math.max(...times);
      const minTime = Math.min(...times);
      expect(maxTime / minTime).toBeLessThan(3); // Max 3x variation
    });
  });

  describe('File System Performance Tests', () => {
    it('should handle directory creation and file operations efficiently', async () => {
      const testProjects = Object.values(performanceTestProjects);
      const startTime = Date.now();
      
      // Initialize multiple projects simultaneously
      const initPromises = testProjects.map(project =>
        stateManager.initializeProject(project.projectId, project.projectName, project)
      );
      
      await Promise.all(initPromises);
      const initTime = Date.now() - startTime;
      
      // Should initialize projects quickly
      expect(initTime).toBeLessThan(3000); // 3 seconds for all projects
      
      // Verify all projects were created
      for (const project of testProjects) {
        const state = await stateManager.getProjectState(project.projectId);
        expect(state.projectId).toBe(project.projectId);
      }
    });

    it('should handle large file operations efficiently', async () => {
      const projectId = performanceTestProjects.large.projectId;
      
      // Create large outputs to test file system performance
      const largeOutputs = Array.from({ length: 50 }, (_, i) => ({
        type: `large-output-${i}`,
        content: `Large content block ${i}: ${'X'.repeat(1000)}`, // 1KB each
        stage: StageId.IMPLEMENTATION,
        timestamp: new Date()
      }));
      
      const startTime = Date.now();
      await stateManager.updateStage(projectId, StageId.IMPLEMENTATION, largeOutputs);
      const writeTime = Date.now() - startTime;
      
      // Should handle large writes efficiently
      expect(writeTime).toBeLessThan(2000); // 2 seconds
      
      // Verify data integrity
      const readStartTime = Date.now();
      const state = await stateManager.getProjectState(projectId);
      const readTime = Date.now() - readStartTime;
      
      expect(readTime).toBeLessThan(1000); // 1 second
      expect(state.outputs.length).toBe(largeOutputs.length);
    });

    it('should validate directory structure creation performance', async () => {
      const startTime = Date.now();
      
      // Create output directories for multiple projects
      const dirPromises = Object.values(performanceTestProjects).map(project =>
        outputManager.createProjectStructure(project.projectId)
      );
      
      await Promise.all(dirPromises);
      const dirTime = Date.now() - startTime;
      
      // Should create directories quickly
      expect(dirTime).toBeLessThan(1000); // 1 second
      
      // Verify directory structure
      for (const project of Object.values(performanceTestProjects)) {
        const structure = await outputManager.getDirectoryStructure(project.projectId);
        expect(structure.stages.length).toBeGreaterThan(0);
        expect(structure.templates.length).toBeGreaterThan(0);
      }
    });

    it('should handle concurrent file operations safely', async () => {
      const projectId = performanceTestProjects.medium.projectId;
      const concurrentOperations = 20;
      
      // Perform concurrent state updates
      const updatePromises = Array.from({ length: concurrentOperations }, (_, i) =>
        stateManager.updateStage(projectId, StageId.IMPLEMENTATION, [{
          type: `concurrent-output-${i}`,
          content: `Concurrent operation ${i}`,
          stage: StageId.IMPLEMENTATION,
          timestamp: new Date()
        }])
      );
      
      const startTime = Date.now();
      await Promise.all(updatePromises);
      const concurrentTime = Date.now() - startTime;
      
      // Should handle concurrent operations efficiently
      expect(concurrentTime).toBeLessThan(5000); // 5 seconds
      
      // Verify data consistency
      const finalState = await stateManager.getProjectState(projectId);
      expect(finalState.outputs.length).toBe(concurrentOperations);
      
      // All outputs should be unique
      const outputIds = finalState.outputs.map(o => o.type);
      const uniqueIds = new Set(outputIds);
      expect(uniqueIds.size).toBe(concurrentOperations);
    });
  });

  describe('Memory Usage Monitoring', () => {
    it('should monitor memory usage during large pipeline execution', async () => {
      const initialMemory = process.memoryUsage();
      
      // Execute pipeline for large project
      const projectId = performanceTestProjects.large.projectId;
      await stateManager.initializeProject(projectId, performanceTestProjects.large.projectName, performanceTestProjects.large);
      
      const stages = [StageId.INTAKE, StageId.ANALYSIS, StageId.ARCHITECTURE, StageId.DESIGN];
      
      for (const stage of stages) {
        const tasks = await taskGenerator.generateTasks(
          performanceTestProjects.large,
          stage,
          await stateManager.getProjectState(projectId)
        );
        
        const templates = await templateComposer.selectTemplates(
          performanceTestProjects.large.domain,
          stage,
          performanceTestProjects.large.features
        );
        
        const stageResult = await pipelineController.executeStage(
          stage,
          await stateManager.getProjectState(projectId),
          { tasks, templates }
        );
        
        await stateManager.updateStage(projectId, stage, stageResult.outputs);
      }
      
      const finalMemory = process.memoryUsage();
      
      // Memory usage should be reasonable
      const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed;
      const memoryIncreaseMB = memoryIncrease / (1024 * 1024);
      
      expect(memoryIncreaseMB).toBeLessThan(100); // Less than 100MB increase
      
      // RSS should not grow excessively
      const rssIncrease = finalMemory.rss - initialMemory.rss;
      const rssIncreaseMB = rssIncrease / (1024 * 1024);
      
      expect(rssIncreaseMB).toBeLessThan(200); // Less than 200MB RSS increase
    });

    it('should handle memory efficiently during template composition', async () => {
      const memorySnapshots: NodeJS.MemoryUsage[] = [];
      
      // Take initial memory snapshot
      memorySnapshots.push(process.memoryUsage());
      
      // Perform multiple template compositions
      for (let i = 0; i < 10; i++) {
        await templateComposer.selectTemplates(
          performanceTestProjects.large.domain,
          StageId.IMPLEMENTATION,
          performanceTestProjects.large.features
        );
        
        memorySnapshots.push(process.memoryUsage());
      }
      
      // Analyze memory growth
      const heapGrowth = memorySnapshots.map((snapshot, index) => 
        index > 0 ? snapshot.heapUsed - memorySnapshots[0].heapUsed : 0
      );
      
      // Memory growth should be minimal and stable
      const maxGrowth = Math.max(...heapGrowth);
      const maxGrowthMB = maxGrowth / (1024 * 1024);
      
      expect(maxGrowthMB).toBeLessThan(50); // Less than 50MB growth
      
      // Should not have continuous growth (memory leaks)
      const finalGrowth = heapGrowth[heapGrowth.length - 1];
      const midGrowth = heapGrowth[Math.floor(heapGrowth.length / 2)];
      
      expect(finalGrowth / midGrowth).toBeLessThan(2); // Less than 2x growth in second half
    });

    it('should clean up resources properly', async () => {
      const initialMemory = process.memoryUsage();
      
      // Create and destroy multiple projects
      for (let i = 0; i < 5; i++) {
        const tempProject = {
          projectId: `temp-project-${i}`,
          projectName: `Temp Project ${i}`,
          description: 'Temporary project for cleanup testing',
          domain: 'web',
          platforms: ['web'],
          features: ['basic-features']
        };
        
        await stateManager.initializeProject(tempProject.projectId, tempProject.projectName, tempProject);
        
        // Generate some content
        const tasks = await taskGenerator.generateTasks(
          tempProject,
          StageId.IMPLEMENTATION,
          await stateManager.getProjectState(tempProject.projectId)
        );
        
        await stateManager.updateStage(tempProject.projectId, StageId.IMPLEMENTATION, [{
          type: 'test-output',
          content: 'Test content for cleanup',
          stage: StageId.IMPLEMENTATION
        }]);
        
        // Clean up
        await stateManager.deleteProject(tempProject.projectId);
      }
      
      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }
      
      const finalMemory = process.memoryUsage();
      
      // Memory should return close to initial levels
      const memoryDifference = finalMemory.heapUsed - initialMemory.heapUsed;
      const memoryDifferenceMB = memoryDifference / (1024 * 1024);
      
      expect(Math.abs(memoryDifferenceMB)).toBeLessThan(20); // Within 20MB of initial
    });
  });

  describe('Concurrent Execution Scenarios', () => {
    it('should handle multiple pipeline executions concurrently', async () => {
      const concurrentProjects = [
        performanceTestProjects.small,
        performanceTestProjects.medium,
        { ...performanceTestProjects.large, projectId: 'concurrent-large' }
      ];
      
      const startTime = Date.now();
      
      // Execute pipelines concurrently
      const pipelinePromises = concurrentProjects.map(async (project) => {
        await stateManager.initializeProject(project.projectId, project.projectName, project);
        
        const stages = [StageId.INTAKE, StageId.ANALYSIS, StageId.ARCHITECTURE];
        
        for (const stage of stages) {
          const tasks = await taskGenerator.generateTasks(
            project,
            stage,
            await stateManager.getProjectState(project.projectId)
          );
          
          const stageResult = await pipelineController.executeStage(
            stage,
            await stateManager.getProjectState(project.projectId),
            { tasks, templates: [] }
          );
          
          await stateManager.updateStage(project.projectId, stage, stageResult.outputs);
        }
        
        return project.projectId;
      });
      
      const completedProjects = await Promise.all(pipelinePromises);
      const totalTime = Date.now() - startTime;
      
      // Should complete all pipelines efficiently
      expect(totalTime).toBeLessThan(10000); // 10 seconds
      expect(completedProjects.length).toBe(concurrentProjects.length);
      
      // Verify all projects completed successfully
      for (const projectId of completedProjects) {
        const state = await stateManager.getProjectState(projectId);
        expect(state.completedStages.length).toBe(3);
      }
    });

    it('should handle concurrent template selections efficiently', async () => {
      const concurrentSelections = 20;
      const domains = ['web', 'mobile', 'commerce', 'social', 'fintech'];
      const stages = Object.values(StageId);
      
      const startTime = Date.now();
      
      // Perform concurrent template selections
      const selectionPromises = Array.from({ length: concurrentSelections }, (_, i) => {
        const domain = domains[i % domains.length];
        const stage = stages[i % stages.length];
        const features = performanceTestProjects.medium.features;
        
        return templateComposer.selectTemplates(domain, stage, features);
      });
      
      const results = await Promise.all(selectionPromises);
      const selectionTime = Date.now() - startTime;
      
      // Should handle concurrent selections efficiently
      expect(selectionTime).toBeLessThan(5000); // 5 seconds
      expect(results.length).toBe(concurrentSelections);
      
      // All results should be valid
      for (const result of results) {
        expect(result.coreTemplates).toBeDefined();
        expect(result.crossCuttingTemplates).toBeDefined();
      }
    });

    it('should maintain data consistency under concurrent access', async () => {
      const projectId = 'concurrent-consistency-test';
      const concurrentUpdates = 10;
      
      await stateManager.initializeProject(projectId, 'Concurrent Test Project', performanceTestProjects.small);
      
      // Perform concurrent state updates
      const updatePromises = Array.from({ length: concurrentUpdates }, (_, i) =>
        stateManager.updateStage(projectId, StageId.IMPLEMENTATION, [{
          type: `concurrent-update-${i}`,
          content: `Update ${i} at ${Date.now()}`,
          stage: StageId.IMPLEMENTATION,
          timestamp: new Date()
        }])
      );
      
      await Promise.all(updatePromises);
      
      // Verify data consistency
      const finalState = await stateManager.getProjectState(projectId);
      expect(finalState.outputs.length).toBe(concurrentUpdates);
      
      // All updates should be present and unique
      const updateTypes = finalState.outputs.map(o => o.type);
      const uniqueTypes = new Set(updateTypes);
      expect(uniqueTypes.size).toBe(concurrentUpdates);
      
      // Timestamps should be reasonable
      const timestamps = finalState.outputs.map(o => new Date(o.timestamp).getTime());
      const minTimestamp = Math.min(...timestamps);
      const maxTimestamp = Math.max(...timestamps);
      expect(maxTimestamp - minTimestamp).toBeLessThan(5000); // Within 5 seconds
    });
  });

  describe('Optimization Effectiveness Validation', () => {
    it('should demonstrate measurable performance improvements', async () => {
      const largeProject = performanceTestProjects.large;
      
      // Test without optimization
      const unoptimizedStart = Date.now();
      const tasks = await taskGenerator.generateTasks(
        largeProject,
        StageId.IMPLEMENTATION,
        await stateManager.getProjectState(largeProject.projectId)
      );
      
      // Simulate processing without optimization
      let unoptimizedTokens = 0;
      for (const task of tasks) {
        unoptimizedTokens += task.estimatedTokens;
      }
      const unoptimizedTime = Date.now() - unoptimizedStart;
      
      // Test with optimization
      const optimizedStart = Date.now();
      const optimized = await contextOptimizer.optimizeForStage(
        largeProject,
        StageId.IMPLEMENTATION,
        tasks
      );
      const optimizedTime = Date.now() - optimizedStart;
      
      // Optimization should provide benefits
      expect(optimized.tokenCount).toBeLessThan(unoptimizedTokens);
      expect(optimized.optimizationApplied).toBe(true);
      
      // Should show token reduction
      const tokenReduction = (unoptimizedTokens - optimized.tokenCount) / unoptimizedTokens;
      expect(tokenReduction).toBeGreaterThan(0.1); // At least 10% reduction
      
      console.log(`Performance improvement: ${(tokenReduction * 100).toFixed(1)}% token reduction`);
    });

    it('should validate chunking effectiveness for large content', async () => {
      const massiveContent = {
        ...performanceTestProjects.large,
        detailedRequirements: 'Z'.repeat(20000), // 20k characters
        technicalSpecs: 'Y'.repeat(15000), // 15k characters
        businessRules: 'X'.repeat(10000) // 10k characters
      };
      
      const tasks = await taskGenerator.generateTasks(
        massiveContent,
        StageId.IMPLEMENTATION,
        await stateManager.getProjectState(massiveContent.projectId)
      );
      
      const optimized = await contextOptimizer.optimizeForStage(
        massiveContent,
        StageId.IMPLEMENTATION,
        tasks
      );
      
      // Should effectively chunk large content
      expect(optimized.chunks.length).toBeGreaterThan(3);
      expect(optimized.tokenCount).toBeLessThan(8000);
      
      // Each chunk should be reasonably sized
      for (const chunk of optimized.chunks) {
        expect(chunk.tokenCount).toBeLessThan(3000);
        expect(chunk.tokenCount).toBeGreaterThan(500);
      }
      
      // Should maintain content relationships
      expect(optimized.preservedRelationships).toBe(true);
    });

    it('should validate template selection optimization', async () => {
      const complexFeatures = [
        'user-authentication', 'real-time-messaging', 'payment-processing',
        'content-management', 'analytics-dashboard', 'notification-system',
        'search-functionality', 'social-features', 'mobile-optimization',
        'security-compliance', 'performance-monitoring', 'api-management'
      ];
      
      const startTime = Date.now();
      
      // Test template selection with many features
      const templates = await templateComposer.selectTemplates(
        'social',
        StageId.IMPLEMENTATION,
        complexFeatures
      );
      
      const selectionTime = Date.now() - startTime;
      
      // Should select templates efficiently
      expect(selectionTime).toBeLessThan(1000); // 1 second
      expect(templates.coreTemplates.length).toBeGreaterThan(0);
      expect(templates.crossCuttingTemplates.length).toBeGreaterThan(0);
      
      // Should not select duplicate templates
      const allTemplates = [...templates.coreTemplates, ...templates.crossCuttingTemplates];
      const templateNames = allTemplates.map(t => t.name);
      const uniqueNames = new Set(templateNames);
      expect(uniqueNames.size).toBe(templateNames.length);
      
      // Should include relevant templates for features
      const hasAuthTemplate = allTemplates.some(t => t.name.includes('auth'));
      const hasMessagingTemplate = allTemplates.some(t => t.name.includes('messaging') || t.name.includes('real-time'));
      const hasPaymentTemplate = allTemplates.some(t => t.name.includes('payment'));
      
      expect(hasAuthTemplate || hasMessagingTemplate || hasPaymentTemplate).toBe(true);
    });
  });
});