/**
 * Orchestrator
 *
 * Coordinates the execution of workflow stages with error handling,
 * retry logic, and inter-component communication.
 *
 * Validates: Requirements 4.1, 4.2, 4.3, 11.1
 */

/**
 * A workflow step definition
 */
export interface WorkflowStep {
  id: string;
  name: string;
  execute: () => Promise<any>;
  rollback?: () => Promise<void>;
  retryCount?: number;
  timeoutMs?: number;
}

/**
 * Workflow execution result
 */
export interface WorkflowResult {
  success: boolean;
  completedSteps: string[];
  failedStep?: string;
  error?: string;
  results: Map<string, any>;
}

export class Orchestrator {
  private workflows: Map<string, WorkflowStep[]> = new Map();

  /**
   * Registers a workflow
   */
  public registerWorkflow(name: string, steps: WorkflowStep[]): void {
    this.workflows.set(name, steps);
  }

  /**
   * Executes a registered workflow
   */
  public async execute(workflowName: string): Promise<WorkflowResult> {
    const steps = this.workflows.get(workflowName);
    if (!steps) throw new Error(`Workflow '${workflowName}' not found`);

    const completedSteps: string[] = [];
    const results = new Map<string, any>();

    for (const step of steps) {
      const retries = step.retryCount || 0;
      let lastError: Error | null = null;

      for (let attempt = 0; attempt <= retries; attempt++) {
        try {
          const result = await this.executeWithTimeout(step.execute, step.timeoutMs || 60000);
          results.set(step.id, result);
          completedSteps.push(step.id);
          lastError = null;
          break;
        } catch (error: any) {
          lastError = error;
          if (attempt < retries) {
            console.log(`[Orchestrator] Retrying step ${step.name} (attempt ${attempt + 2}/${retries + 1})`);
          }
        }
      }

      if (lastError) {
        // Rollback completed steps in reverse
        for (const completedId of [...completedSteps].reverse()) {
          const completedStep = steps.find(s => s.id === completedId);
          if (completedStep?.rollback) {
            try { await completedStep.rollback(); } catch { /* swallow rollback errors */ }
          }
        }

        return { success: false, completedSteps, failedStep: step.id, error: lastError.message, results };
      }
    }

    return { success: true, completedSteps, results };
  }

  private executeWithTimeout(fn: () => Promise<any>, timeoutMs: number): Promise<any> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('Step timed out')), timeoutMs);
      fn().then(result => { clearTimeout(timer); resolve(result); })
        .catch(err => { clearTimeout(timer); reject(err); });
    });
  }
}
