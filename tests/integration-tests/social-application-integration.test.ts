/**
 * Integration Tests: Social Media Application Pipeline
 * Tests pipeline execution for social platforms
 * Validates cross-cutting template inclusion and task generation
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { StagePipelineController, StageId } from '../../src/stage-pipeline-controller.js';
import { StateManager } from '../../src/state-manager.js';
import { OutputDirectoryManager } from '../../src/output-directory-manager.js';
import { TaskGenerationEngine } from '../../src/task-generation-engine.js';
import { ContextOptimizationService } from '../../src/context-optimization-service.js';
import { TemplateCompositionEngine } from '../../src/template-composition-engine.js';
import { QualityGateSystem } from '../../src/quality-gate-system.js';
import { ErrorRecoverySystem } from '../../src/error-recovery-system.js';
import { DocumentationTraceabilitySystem } from '../../src/documentation-traceability-system.js';

describe('Social Media Application Integration Tests', () => {
  let pipelineController: StagePipelineController;
  let stateManager: StateManager;
  let outputManager: OutputDirectoryManager;
  let taskGenerator: TaskGenerationEngine;
  let contextOptimizer: ContextOptimizationService;
  let templateComposer: TemplateCompositionEngine;
  let qualityGate: QualityGateSystem;
  let errorRecovery: ErrorRecoverySystem;
  let documentation: DocumentationTraceabilitySystem;

  const socialProjectBrief = {
    projectId: 'social-platform-001',
    projectName: 'Next-Gen Social Media Platform',
    description: 'A modern social media platform with real-time messaging, content sharing, social graphs, and community features',
    domain: 'social',
    platforms: ['web', 'mobile', 'desktop'],
    features: [
      'user-profiles',
      'social-feed',
      'real-time-messaging',
      'content-sharing',
      'social-graph',
      'community-groups',
      'live-streaming',
      'content-moderation',
      'notification-system',
      'privacy-controls',
      'analytics-dashboard',
      'monetization-features'
    ],
    requirements: {
      scalability: 'extreme',
      realTime: 'critical',
      security: 'high',
      privacy: 'critical',
      compliance: ['GDPR', 'COPPA', 'CCPA'],
      integrations: ['oauth-providers', 'media-services', 'analytics', 'push-notifications']
    }
  };

  beforeEach(() => {
    pipelineController = new StagePipelineController();
    stateManager = new StateManager();
    outputManager = new OutputDirectoryManager();
    taskGenerator = new TaskGenerationEngine();
    contextOptimizer = new ContextOptimizationService();
    templateComposer = new TemplateCompositionEngine();
    qualityGate = new QualityGateSystem();
    errorRecovery = new ErrorRecoverySystem();
    documentation = new DocumentationTraceabilitySystem();
  });

  describe('Complete Pipeline Execution', () => {
    it('should execute full pipeline for social media platform', async () => {
      const projectId = socialProjectBrief.projectId;
      
      // Initialize project state
      const initialState = await stateManager.initializeProject(
        projectId,
        socialProjectBrief.projectName,
        socialProjectBrief
      );
      
      expect(initialState.projectId).toBe(projectId);
      expect(initialState.currentStage).toBe(StageId.INTAKE);
      
      // Execute pipeline stages with social-specific validations
      const stages = Object.values(StageId);
      let currentState = initialState;
      
      for (const stage of stages) {
        // Generate social-specific tasks
        const tasks = await taskGenerator.generateTasks(
          socialProjectBrief,
          stage,
          currentState
        );
        
        expect(tasks.length).toBeGreaterThan(0);
        
        // Validate social-specific task characteristics
        if (stage === StageId.IMPLEMENTATION) {
          const taskTitles = tasks.map(t => t.title.toLowerCase());
          expect(taskTitles.some(title => title.includes('real-time') || title.includes('messaging'))).toBe(true);
          expect(taskTitles.some(title => title.includes('social') || title.includes('feed'))).toBe(true);
        }
        
        // Select templates with social cross-cutting concerns
        const templates = await templateComposer.selectTemplates(
          socialProjectBrief.domain,
          stage,
          socialProjectBrief.features
        );
        
        expect(templates.coreTemplates.length).toBeGreaterThan(0);
        
        // Social platforms should include real-time and privacy templates
        if (stage === StageId.ARCHITECTURE) {
          const templateNames = templates.crossCuttingTemplates.map(t => t.name);
          expect(templateNames.some(name => name.includes('real-time') || name.includes('websocket'))).toBe(true);
          expect(templateNames.some(name => name.includes('privacy') || name.includes('security'))).toBe(true);
        }
        
        // Execute stage
        const stageResult = await pipelineController.executeStage(
          stage,
          currentState,
          { tasks, templates }
        );
        
        expect(stageResult.success).toBe(true);
        
        // Update state
        currentState = await stateManager.updateStage(
          projectId,
          stage,
          stageResult.outputs
        );
        
        expect(currentState.completedStages).toContain(stage);
      }
      
      expect(currentState.completedStages.length).toBe(stages.length);
    });

    it('should handle real-time communication requirements', async () => {
      const templates = await templateComposer.selectTemplates(
        'social',
        StageId.ARCHITECTURE,
        ['real-time-messaging', 'live-streaming', 'notification-system']
      );
      
      // Should include real-time communication templates
      const allTemplates = [...templates.coreTemplates, ...templates.crossCuttingTemplates];
      const templateNames = allTemplates.map(t => t.name);
      
      expect(templateNames.some(name => name.includes('websocket') || name.includes('real-time'))).toBe(true);
      expect(templateNames.some(name => name.includes('messaging') || name.includes('chat'))).toBe(true);
      expect(templateNames.some(name => name.includes('notification') || name.includes('push'))).toBe(true);
    });

    it('should generate appropriate social media tasks', async () => {
      const tasks = await taskGenerator.generateTasks(
        socialProjectBrief,
        StageId.IMPLEMENTATION,
        await stateManager.getProjectState(socialProjectBrief.projectId)
      );
      
      // Should generate social-specific implementation tasks
      const taskTitles = tasks.map(t => t.title.toLowerCase());
      expect(taskTitles.some(title => title.includes('feed') || title.includes('timeline'))).toBe(true);
      expect(taskTitles.some(title => title.includes('message') || title.includes('chat'))).toBe(true);
      expect(taskTitles.some(title => title.includes('profile') || title.includes('user'))).toBe(true);
      expect(taskTitles.some(title => title.includes('privacy') || title.includes('security'))).toBe(true);
      
      // Tasks should handle real-time requirements
      const realTimeTasks = tasks.filter(task => 
        task.title.toLowerCase().includes('real-time') ||
        task.description.toLowerCase().includes('real-time') ||
        task.description.toLowerCase().includes('websocket')
      );
      expect(realTimeTasks.length).toBeGreaterThan(0);
    });
  });

  describe('Social-Specific Validations', () => {
    it('should validate privacy compliance requirements', async () => {
      const validation = await qualityGate.validateComplianceRequirements(
        socialProjectBrief,
        ['GDPR', 'COPPA', 'CCPA']
      );
      
      expect(validation.compliant).toBe(true);
      expect(validation.requirements.some(req => req.includes('consent'))).toBe(true);
      expect(validation.requirements.some(req => req.includes('data protection'))).toBe(true);
      expect(validation.requirements.some(req => req.includes('age verification'))).toBe(true);
    });

    it('should validate social graph architecture patterns', async () => {
      const architectureValidation = await qualityGate.validateArchitecturalPatterns(
        socialProjectBrief,
        'social'
      );
      
      expect(architectureValidation.valid).toBe(true);
      expect(architectureValidation.patterns).toContain('event-driven');
      expect(architectureValidation.patterns).toContain('microservices');
      expect(architectureValidation.patterns.some(p => p.includes('graph') || p.includes('social'))).toBe(true);
    });

    it('should validate real-time communication requirements', async () => {
      const realTimeValidation = await qualityGate.validateRealTimeRequirements(
        socialProjectBrief,
        ['messaging', 'notifications', 'live-updates']
      );
      
      expect(realTimeValidation.valid).toBe(true);
      expect(realTimeValidation.technologies.some(tech => tech.includes('websocket'))).toBe(true);
      expect(realTimeValidation.technologies.some(tech => tech.includes('push'))).toBe(true);
    });

    it('should validate content moderation requirements', async () => {
      const moderationValidation = await qualityGate.validateContentModerationRequirements(
        socialProjectBrief
      );
      
      expect(moderationValidation.valid).toBe(true);
      expect(moderationValidation.features).toContain('automated-filtering');
      expect(moderationValidation.features).toContain('user-reporting');
      expect(moderationValidation.features).toContain('admin-review');
    });
  });

  describe('Error Recovery Scenarios', () => {
    it('should recover from real-time messaging failures', async () => {
      const error = {
        type: 'real-time-failure',
        stage: StageId.IMPLEMENTATION,
        component: 'websocket-server',
        message: 'WebSocket connection failures under high load',
        context: socialProjectBrief
      };
      
      const recovery = await errorRecovery.handleError(error);
      
      expect(recovery.canRecover).toBe(true);
      expect(recovery.recoverySteps.some(step => 
        step.includes('fallback') || step.includes('polling') || step.includes('queue')
      )).toBe(true);
      expect(recovery.alternativeApproaches.length).toBeGreaterThan(0);
    });

    it('should recover from social graph scaling issues', async () => {
      const error = {
        type: 'scalability-issue',
        stage: StageId.OPTIMIZATION,
        component: 'social-graph',
        message: 'Social graph queries causing database performance issues',
        context: socialProjectBrief
      };
      
      const recovery = await errorRecovery.handleError(error);
      
      expect(recovery.canRecover).toBe(true);
      expect(recovery.recoverySteps.some(step => 
        step.includes('cache') || step.includes('denormalize') || step.includes('shard')
      )).toBe(true);
    });

    it('should recover from content moderation overload', async () => {
      const error = {
        type: 'capacity-issue',
        stage: StageId.IMPLEMENTATION,
        component: 'content-moderation',
        message: 'Content moderation queue overwhelmed with reports',
        context: socialProjectBrief
      };
      
      const recovery = await errorRecovery.handleError(error);
      
      expect(recovery.canRecover).toBe(true);
      expect(recovery.recoverySteps.some(step => 
        step.includes('priority') || step.includes('automation') || step.includes('scale')
      )).toBe(true);
    });

    it('should recover from privacy compliance violations', async () => {
      const error = {
        type: 'compliance-violation',
        stage: StageId.TESTING,
        component: 'data-handling',
        message: 'GDPR compliance check failed for user data export',
        context: socialProjectBrief
      };
      
      const recovery = await errorRecovery.handleError(error);
      
      expect(recovery.canRecover).toBe(true);
      expect(recovery.recoverySteps.some(step => 
        step.includes('audit') || step.includes('consent') || step.includes('export')
      )).toBe(true);
    });
  });

  describe('Cross-Cutting Template Integration', () => {
    it('should integrate privacy templates across all stages', async () => {
      const stages = [StageId.ANALYSIS, StageId.ARCHITECTURE, StageId.DESIGN, StageId.IMPLEMENTATION];
      
      for (const stage of stages) {
        const templates = await templateComposer.selectTemplates(
          'social',
          stage,
          ['privacy-controls', 'user-profiles', 'data-protection']
        );
        
        const allTemplates = [...templates.coreTemplates, ...templates.crossCuttingTemplates];
        const hasPrivacyTemplate = allTemplates.some(t => 
          t.name.includes('privacy') || 
          t.name.includes('gdpr') || 
          t.name.includes('data-protection')
        );
        
        expect(hasPrivacyTemplate).toBe(true);
      }
    });

    it('should integrate real-time templates across relevant stages', async () => {
      const realTimeStages = [StageId.ARCHITECTURE, StageId.DESIGN, StageId.IMPLEMENTATION];
      
      for (const stage of realTimeStages) {
        const templates = await templateComposer.selectTemplates(
          'social',
          stage,
          ['real-time-messaging', 'live-streaming', 'notification-system']
        );
        
        const allTemplates = [...templates.coreTemplates, ...templates.crossCuttingTemplates];
        const hasRealTimeTemplate = allTemplates.some(t => 
          t.name.includes('real-time') || 
          t.name.includes('websocket') || 
          t.name.includes('messaging')
        );
        
        expect(hasRealTimeTemplate).toBe(true);
      }
    });

    it('should integrate analytics templates for social insights', async () => {
      const templates = await templateComposer.selectTemplates(
        'social',
        StageId.IMPLEMENTATION,
        ['analytics-dashboard', 'user-engagement', 'content-analytics']
      );
      
      const allTemplates = [...templates.coreTemplates, ...templates.crossCuttingTemplates];
      const hasAnalyticsTemplate = allTemplates.some(t => 
        t.name.includes('analytics') || 
        t.name.includes('metrics') || 
        t.name.includes('tracking')
      );
      
      expect(hasAnalyticsTemplate).toBe(true);
    });
  });

  describe('State Management for Social Features', () => {
    it('should handle social-specific state transitions', async () => {
      const projectId = socialProjectBrief.projectId;
      
      // Initialize with social-specific context
      await stateManager.initializeProject(projectId, socialProjectBrief.projectName, socialProjectBrief);
      
      // Simulate architecture stage with social graph outputs
      const architectureOutputs = [
        {
          type: 'social-graph-schema',
          content: 'Graph database schema for user relationships and content connections',
          stage: StageId.ARCHITECTURE
        },
        {
          type: 'real-time-architecture',
          content: 'WebSocket-based real-time communication architecture',
          stage: StageId.ARCHITECTURE
        },
        {
          type: 'privacy-framework',
          content: 'Privacy-by-design framework for GDPR compliance',
          stage: StageId.ARCHITECTURE
        }
      ];
      
      await stateManager.updateStage(projectId, StageId.ARCHITECTURE, architectureOutputs);
      
      const state = await stateManager.getProjectState(projectId);
      expect(state.outputs.length).toBe(architectureOutputs.length);
      
      // Verify social-specific outputs are preserved
      const outputTypes = state.outputs.map(o => o.type);
      expect(outputTypes).toContain('social-graph-schema');
      expect(outputTypes).toContain('real-time-architecture');
      expect(outputTypes).toContain('privacy-framework');
    });

    it('should maintain real-time feature context across stages', async () => {
      const projectId = socialProjectBrief.projectId;
      
      await stateManager.initializeProject(projectId, socialProjectBrief.projectName, socialProjectBrief);
      
      // Execute stages with real-time context
      const stages = [StageId.ANALYSIS, StageId.ARCHITECTURE, StageId.DESIGN];
      
      for (const stage of stages) {
        const tasks = await taskGenerator.generateTasks(
          socialProjectBrief,
          stage,
          await stateManager.getProjectState(projectId)
        );
        
        const stageResult = await pipelineController.executeStage(
          stage,
          await stateManager.getProjectState(projectId),
          { tasks, templates: [] }
        );
        
        await stateManager.updateStage(projectId, stage, stageResult.outputs);
      }
      
      // Verify real-time context is maintained
      const finalState = await stateManager.getProjectState(projectId);
      const allOutputContent = finalState.outputs.map(o => o.content).join(' ').toLowerCase();
      
      expect(allOutputContent.includes('real-time') || allOutputContent.includes('websocket')).toBe(true);
      expect(allOutputContent.includes('messaging') || allOutputContent.includes('chat')).toBe(true);
    });
  });

  describe('Documentation and Traceability', () => {
    it('should maintain traceability for social media requirements', async () => {
      const projectId = socialProjectBrief.projectId;
      
      // Track social-specific requirements
      const requirements = [
        'real-time-messaging',
        'privacy-by-design',
        'content-moderation',
        'social-graph-management',
        'scalable-feed-generation'
      ];
      
      for (const req of requirements) {
        await documentation.trackRequirement(req, `Social platform requirement: ${req}`, StageId.ANALYSIS, projectId);
      }
      
      // Add implementation tasks with cross-cutting concerns
      for (const req of requirements) {
        await documentation.addTaskReference(
          `implement-${req}`,
          `Implement ${req} with privacy and scalability considerations`,
          StageId.IMPLEMENTATION,
          [req],
          [],
          projectId
        );
      }
      
      // Verify complete coverage
      const coverage = await documentation.generateCoverageReport(projectId);
      expect(coverage.totalRequirements).toBe(requirements.length);
      expect(coverage.coveredRequirements).toBe(requirements.length);
      expect(coverage.coveragePercentage).toBe(100);
    });

    it('should document cross-cutting concerns integration', async () => {
      const projectId = socialProjectBrief.projectId;
      
      // Track cross-cutting concerns
      await documentation.trackRequirement('privacy-compliance', 'GDPR and privacy compliance', StageId.ANALYSIS, projectId);
      await documentation.trackRequirement('real-time-performance', 'Real-time messaging performance', StageId.ANALYSIS, projectId);
      
      // Document how they integrate across features
      await documentation.addTaskReference(
        'integrate-privacy-messaging',
        'Integrate privacy controls with real-time messaging',
        StageId.IMPLEMENTATION,
        ['privacy-compliance', 'real-time-performance'],
        [],
        projectId
      );
      
      // Verify cross-cutting integration is documented
      const matrix = await documentation.getTraceabilityMatrix(projectId);
      const integrationLinks = matrix.filter(link => 
        link.sourceId === 'integrate-privacy-messaging'
      );
      
      expect(integrationLinks.length).toBe(2); // Links to both requirements
    });
  });

  describe('Performance and Scalability', () => {
    it('should optimize for social media scale requirements', async () => {
      const scalableContext = {
        ...socialProjectBrief,
        scalabilityRequirements: {
          users: '10M+',
          messages: '1B+ daily',
          realTimeConnections: '1M concurrent'
        }
      };
      
      const tasks = await taskGenerator.generateTasks(
        scalableContext,
        StageId.OPTIMIZATION,
        await stateManager.getProjectState(socialProjectBrief.projectId)
      );
      
      // Should generate scalability-focused tasks
      const taskDescriptions = tasks.map(t => t.description.toLowerCase());
      expect(taskDescriptions.some(desc => 
        desc.includes('scale') || desc.includes('performance') || desc.includes('optimize')
      )).toBe(true);
      
      // Should include real-time optimization tasks
      expect(taskDescriptions.some(desc => 
        desc.includes('real-time') || desc.includes('websocket') || desc.includes('concurrent')
      )).toBe(true);
    });

    it('should handle large social feature sets efficiently', async () => {
      const startTime = Date.now();
      
      const largeFeatureSet = [
        ...socialProjectBrief.features,
        'video-calling', 'screen-sharing', 'file-sharing', 'emoji-reactions',
        'story-features', 'marketplace', 'events', 'polls', 'live-audio',
        'content-creation-tools', 'advanced-search', 'trending-topics'
      ];
      
      const templates = await templateComposer.selectTemplates(
        'social',
        StageId.IMPLEMENTATION,
        largeFeatureSet
      );
      
      const selectionTime = Date.now() - startTime;
      
      // Should handle large feature sets efficiently
      expect(selectionTime).toBeLessThan(2000); // 2 seconds
      expect(templates.coreTemplates.length).toBeGreaterThan(0);
      expect(templates.crossCuttingTemplates.length).toBeGreaterThan(0);
    });
  });
});