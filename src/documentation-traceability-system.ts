import { StageId, ArchitecturalDecision } from './stage-pipeline-controller.js';
import { ProjectState } from './state-manager.js';

/**
 * Documentation and Traceability System
 * 
 * Creates comprehensive decision documentation, implements traceability from requirements
 * through implementation, adds task-to-requirement reference tracking, and generates
 * final project documentation.
 * 
 * Requirements: 10.1, 10.2, 10.3, 10.4, 10.5
 */

export interface TraceabilityLink {
  id: string;
  sourceType: 'requirement' | 'decision' | 'task' | 'output' | 'test';
  sourceId: string;
  targetType: 'requirement' | 'decision' | 'task' | 'output' | 'test';
  targetId: string;
  relationship: 'implements' | 'depends-on' | 'validates' | 'derives-from' | 'conflicts-with';
  stage: StageId;
  timestamp: Date;
}

export interface RequirementTrace {
  requirementId: string;
  description: string;
  stage: StageId;
  implementedBy: string[];
  validatedBy: string[];
  decisions: string[];
  status: 'pending' | 'in-progress' | 'completed' | 'deferred';
}

export interface DecisionDocumentation {
  decision: ArchitecturalDecision;
  context: string;
  consequences: string[];
  relatedRequirements: string[];
  implementationTasks: string[];
  validationCriteria: string[];
  reviewStatus: 'draft' | 'reviewed' | 'approved' | 'deprecated';
}

export interface TaskReference {
  taskId: string;
  title: string;
  stage: StageId;
  requirements: string[];
  decisions: string[];
  outputs: string[];
  dependencies: string[];
  completionStatus: 'not-started' | 'in-progress' | 'completed';
}

export interface ProjectDocumentation {
  projectId: string;
  projectName: string;
  overview: string;
  requirements: RequirementTrace[];
  decisions: DecisionDocumentation[];
  tasks: TaskReference[];
  traceabilityMatrix: TraceabilityLink[];
  completionReport: CompletionReport;
  generatedAt: Date;
}

export interface CompletionReport {
  totalRequirements: number;
  completedRequirements: number;
  totalDecisions: number;
  totalTasks: number;
  completedTasks: number;
  coveragePercentage: number;
  qualityScore: number;
  recommendations: string[];
}

export interface DocumentationTemplate {
  id: string;
  name: string;
  type: 'requirement' | 'decision' | 'task' | 'completion' | 'traceability';
  template: string;
  variables: string[];
}

export class DocumentationTraceabilitySystem {
  private traceabilityLinks: Map<string, TraceabilityLink[]> = new Map();
  private requirementTraces: Map<string, RequirementTrace[]> = new Map();
  private decisionDocs: Map<string, DecisionDocumentation[]> = new Map();
  private taskReferences: Map<string, TaskReference[]> = new Map();
  private templates: Map<string, DocumentationTemplate> = new Map();

  constructor() {
    this.initializeTemplates();
  }

  /**
   * Create traceability link between two items
   */
  createTraceabilityLink(
    sourceType: string,
    sourceId: string,
    targetType: string,
    targetId: string,
    relationship: string,
    stage: StageId,
    projectId: string
  ): TraceabilityLink {
    const link: TraceabilityLink = {
      id: `trace-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      sourceType: sourceType as any,
      sourceId,
      targetType: targetType as any,
      targetId,
      relationship: relationship as any,
      stage,
      timestamp: new Date()
    };

    if (!this.traceabilityLinks.has(projectId)) {
      this.traceabilityLinks.set(projectId, []);
    }
    this.traceabilityLinks.get(projectId)!.push(link);

    return link;
  }

  /**
   * Track requirement implementation
   */
  trackRequirement(
    requirementId: string,
    description: string,
    stage: StageId,
    projectId: string
  ): RequirementTrace {
    const trace: RequirementTrace = {
      requirementId,
      description,
      stage,
      implementedBy: [],
      validatedBy: [],
      decisions: [],
      status: 'pending'
    };

    if (!this.requirementTraces.has(projectId)) {
      this.requirementTraces.set(projectId, []);
    }
    this.requirementTraces.get(projectId)!.push(trace);

    return trace;
  }

  /**
   * Document architectural decision with full context
   */
  documentDecision(
    decision: ArchitecturalDecision,
    context: string,
    consequences: string[],
    projectId: string
  ): DecisionDocumentation {
    const doc: DecisionDocumentation = {
      decision,
      context,
      consequences,
      relatedRequirements: [],
      implementationTasks: [],
      validationCriteria: [],
      reviewStatus: 'draft'
    };

    if (!this.decisionDocs.has(projectId)) {
      this.decisionDocs.set(projectId, []);
    }
    this.decisionDocs.get(projectId)!.push(doc);

    return doc;
  }

  /**
   * Add task reference with requirement mapping
   */
  addTaskReference(
    taskId: string,
    title: string,
    stage: StageId,
    requirements: string[],
    decisions: string[],
    projectId: string
  ): TaskReference {
    const taskRef: TaskReference = {
      taskId,
      title,
      stage,
      requirements,
      decisions,
      outputs: [],
      dependencies: [],
      completionStatus: 'not-started'
    };

    if (!this.taskReferences.has(projectId)) {
      this.taskReferences.set(projectId, []);
    }
    this.taskReferences.get(projectId)!.push(taskRef);

    // Create traceability links
    for (const reqId of requirements) {
      this.createTraceabilityLink(
        'task', taskId,
        'requirement', reqId,
        'implements',
        stage,
        projectId
      );
    }

    for (const decisionId of decisions) {
      this.createTraceabilityLink(
        'task', taskId,
        'decision', decisionId,
        'implements',
        stage,
        projectId
      );
    }

    return taskRef;
  }

  /**
   * Generate comprehensive project documentation
   */
  generateProjectDocumentation(
    projectState: ProjectState,
    includeTraceability: boolean = true
  ): ProjectDocumentation {
    const projectId = projectState.projectId;
    const requirements = this.requirementTraces.get(projectId) || [];
    const decisions = this.decisionDocs.get(projectId) || [];
    const tasks = this.taskReferences.get(projectId) || [];
    const traceabilityMatrix = includeTraceability 
      ? this.traceabilityLinks.get(projectId) || []
      : [];

    const completionReport = this.generateCompletionReport(
      requirements,
      decisions,
      tasks,
      traceabilityMatrix
    );

    return {
      projectId,
      projectName: projectState.projectName,
      overview: this.generateProjectOverview(projectState),
      requirements,
      decisions,
      tasks,
      traceabilityMatrix,
      completionReport,
      generatedAt: new Date()
    };
  }

  /**
   * Get traceability matrix for a project
   */
  getTraceabilityMatrix(projectId: string): TraceabilityLink[] {
    return this.traceabilityLinks.get(projectId) || [];
  }

  /**
   * Find all items that implement a requirement
   */
  findRequirementImplementations(
    requirementId: string,
    projectId: string
  ): { tasks: TaskReference[], decisions: DecisionDocumentation[] } {
    const links = this.traceabilityLinks.get(projectId) || [];
    const tasks = this.taskReferences.get(projectId) || [];
    const decisions = this.decisionDocs.get(projectId) || [];

    const implementingLinks = links.filter(
      link => link.targetType === 'requirement' && 
              link.targetId === requirementId && 
              link.relationship === 'implements'
    );

    const implementingTasks = tasks.filter(task =>
      implementingLinks.some(link => 
        link.sourceType === 'task' && link.sourceId === task.taskId
      )
    );

    const implementingDecisions = decisions.filter(decision =>
      implementingLinks.some(link =>
        link.sourceType === 'decision' && link.sourceId === decision.decision.id
      )
    );

    return { tasks: implementingTasks, decisions: implementingDecisions };
  }

  /**
   * Generate requirement coverage report
   */
  generateCoverageReport(projectId: string): {
    totalRequirements: number;
    coveredRequirements: number;
    uncoveredRequirements: RequirementTrace[];
    coveragePercentage: number;
  } {
    const requirements = this.requirementTraces.get(projectId) || [];
    const links = this.traceabilityLinks.get(projectId) || [];

    const coveredRequirementIds = new Set(
      links
        .filter(link => link.targetType === 'requirement' && link.relationship === 'implements')
        .map(link => link.targetId)
    );

    const uncoveredRequirements = requirements.filter(
      req => !coveredRequirementIds.has(req.requirementId)
    );

    return {
      totalRequirements: requirements.length,
      coveredRequirements: coveredRequirementIds.size,
      uncoveredRequirements,
      coveragePercentage: requirements.length > 0 
        ? (coveredRequirementIds.size / requirements.length) * 100 
        : 0
    };
  }

  /**
   * Export documentation in markdown format
   */
  exportToMarkdown(documentation: ProjectDocumentation): string {
    const template = this.templates.get('completion-report');
    if (!template) {
      return this.generateDefaultMarkdown(documentation);
    }

    return this.renderTemplate(template, documentation);
  }

  /**
   * Validate documentation completeness
   */
  validateDocumentationCompleteness(projectId: string): {
    isComplete: boolean;
    missingDocumentation: string[];
    recommendations: string[];
  } {
    const requirements = this.requirementTraces.get(projectId) || [];
    const decisions = this.decisionDocs.get(projectId) || [];
    const tasks = this.taskReferences.get(projectId) || [];
    const links = this.traceabilityLinks.get(projectId) || [];

    const missingDocumentation: string[] = [];
    const recommendations: string[] = [];

    // Check for undocumented decisions
    const undocumentedDecisions = decisions.filter(d => d.reviewStatus === 'draft');
    if (undocumentedDecisions.length > 0) {
      missingDocumentation.push(`${undocumentedDecisions.length} decisions need review`);
    }

    // Check for untraced requirements
    const coverage = this.generateCoverageReport(projectId);
    if (coverage.coveragePercentage < 100) {
      missingDocumentation.push(`${coverage.uncoveredRequirements.length} requirements not implemented`);
      recommendations.push('Add implementation tasks for uncovered requirements');
    }

    // Check for orphaned tasks
    const orphanedTasks = tasks.filter(task => task.requirements.length === 0);
    if (orphanedTasks.length > 0) {
      missingDocumentation.push(`${orphanedTasks.length} tasks not linked to requirements`);
      recommendations.push('Link orphaned tasks to requirements or remove if unnecessary');
    }

    return {
      isComplete: missingDocumentation.length === 0,
      missingDocumentation,
      recommendations
    };
  }

  // Private methods

  private initializeTemplates(): void {
    this.templates.set('completion-report', {
      id: 'completion-report',
      name: 'Project Completion Report',
      type: 'completion',
      template: `# {{projectName}} - Project Documentation

## Overview
{{overview}}

## Requirements Coverage
- Total Requirements: {{totalRequirements}}
- Completed Requirements: {{completedRequirements}}
- Coverage: {{coveragePercentage}}%

## Architectural Decisions
{{#decisions}}
### {{decision.title}}
- **Stage**: {{decision.stage}}
- **Status**: {{reviewStatus}}
- **Rationale**: {{decision.rationale}}

{{/decisions}}

## Implementation Tasks
{{#tasks}}
### {{title}}
- **Stage**: {{stage}}
- **Status**: {{completionStatus}}
- **Requirements**: {{requirements}}

{{/tasks}}

## Quality Metrics
- Quality Score: {{qualityScore}}
- Completion Rate: {{coveragePercentage}}%

## Recommendations
{{#recommendations}}
- {{.}}
{{/recommendations}}

Generated on: {{generatedAt}}
`,
      variables: ['projectName', 'overview', 'totalRequirements', 'completedRequirements', 'coveragePercentage', 'decisions', 'tasks', 'qualityScore', 'recommendations', 'generatedAt']
    });

    this.templates.set('traceability-matrix', {
      id: 'traceability-matrix',
      name: 'Traceability Matrix',
      type: 'traceability',
      template: `# Traceability Matrix

| Source | Target | Relationship | Stage |
|--------|--------|--------------|-------|
{{#traceabilityMatrix}}
| {{sourceType}}:{{sourceId}} | {{targetType}}:{{targetId}} | {{relationship}} | {{stage}} |
{{/traceabilityMatrix}}
`,
      variables: ['traceabilityMatrix']
    });
  }

  private generateProjectOverview(projectState: ProjectState): string {
    return `Project ${projectState.projectName} (${projectState.projectId}) is currently in stage ${projectState.currentStage}. 
${projectState.completedStages.length} stages have been completed out of 10 total stages. 
${projectState.decisions.length} architectural decisions have been made.`;
  }

  private generateCompletionReport(
    requirements: RequirementTrace[],
    decisions: DecisionDocumentation[],
    tasks: TaskReference[],
    traceabilityMatrix: TraceabilityLink[]
  ): CompletionReport {
    const completedRequirements = requirements.filter(r => r.status === 'completed').length;
    const completedTasks = tasks.filter(t => t.completionStatus === 'completed').length;
    const coveragePercentage = requirements.length > 0 
      ? (completedRequirements / requirements.length) * 100 
      : 0;

    // Calculate quality score based on various factors
    const qualityScore = this.calculateQualityScore(
      requirements,
      decisions,
      tasks,
      traceabilityMatrix
    );

    const recommendations: string[] = [];
    if (coveragePercentage < 100) {
      recommendations.push('Complete remaining requirements implementation');
    }
    if (completedTasks < tasks.length) {
      recommendations.push('Complete remaining implementation tasks');
    }
    if (decisions.some(d => d.reviewStatus === 'draft')) {
      recommendations.push('Review and approve pending architectural decisions');
    }

    return {
      totalRequirements: requirements.length,
      completedRequirements,
      totalDecisions: decisions.length,
      totalTasks: tasks.length,
      completedTasks,
      coveragePercentage,
      qualityScore,
      recommendations
    };
  }

  private calculateQualityScore(
    requirements: RequirementTrace[],
    decisions: DecisionDocumentation[],
    tasks: TaskReference[],
    traceabilityMatrix: TraceabilityLink[]
  ): number {
    let score = 0;
    let maxScore = 0;

    // Requirements completion (40% of score)
    maxScore += 40;
    const completedReqs = requirements.filter(r => r.status === 'completed').length;
    if (requirements.length > 0) {
      score += (completedReqs / requirements.length) * 40;
    }

    // Decision documentation (30% of score)
    maxScore += 30;
    const approvedDecisions = decisions.filter(d => d.reviewStatus === 'approved').length;
    if (decisions.length > 0) {
      score += (approvedDecisions / decisions.length) * 30;
    }

    // Task completion (20% of score)
    maxScore += 20;
    const completedTasks = tasks.filter(t => t.completionStatus === 'completed').length;
    if (tasks.length > 0) {
      score += (completedTasks / tasks.length) * 20;
    }

    // Traceability coverage (10% of score)
    maxScore += 10;
    if (traceabilityMatrix.length > 0 && requirements.length > 0) {
      const tracedRequirements = new Set(
        traceabilityMatrix
          .filter(link => link.targetType === 'requirement')
          .map(link => link.targetId)
      ).size;
      score += (tracedRequirements / requirements.length) * 10;
    }

    return maxScore > 0 ? Math.round(score) : 0;
  }

  private renderTemplate(template: DocumentationTemplate, data: any): string {
    let rendered = template.template;

    // Simple template rendering (replace variables)
    for (const variable of template.variables) {
      const value = this.getNestedValue(data, variable);
      const placeholder = `{{${variable}}}`;
      // Escape special regex characters in the replacement value
      const escapedValue = String(value || '').replace(/\$/g, '$$$$');
      rendered = rendered.replace(new RegExp(placeholder, 'g'), escapedValue);
    }

    return rendered;
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  private generateDefaultMarkdown(documentation: ProjectDocumentation): string {
    return `# ${documentation.projectName} - Project Documentation

## Overview
${documentation.overview}

## Completion Report
- Total Requirements: ${documentation.completionReport.totalRequirements}
- Completed Requirements: ${documentation.completionReport.completedRequirements}
- Coverage: ${documentation.completionReport.coveragePercentage}%
- Quality Score: ${documentation.completionReport.qualityScore}

## Requirements
${documentation.requirements.map(req => `- ${req.requirementId}: ${req.description} (${req.status})`).join('\n')}

## Architectural Decisions
${documentation.decisions.map(dec => `- ${dec.decision.title}: ${dec.decision.decision}`).join('\n')}

## Tasks
${documentation.tasks.map(task => `- ${task.title} (${task.completionStatus})`).join('\n')}

Generated on: ${documentation.generatedAt.toISOString()}
`;
  }
}