/**
 * Task Decomposer
 *
 * Breaks high-level tasks into smaller, atomic units of work with
 * clear skill requirements and dependency relationships.
 *
 * Validates: Requirements 3.1, 3.3
 */

import { TechnicalRequirement } from '../intent/requirement-extractor';

/**
 * An atomic task that a single skill can execute
 */
export interface AtomicTask {
  id: string;
  title: string;
  parentRequirement: string;
  skillRequirements: string[];
  input: Record<string, any>;
  expectedOutput: string;
  dependencies: string[];
  estimatedEffort: 'trivial' | 'small' | 'medium' | 'large';
}

export class TaskDecomposer {
  private counter = 0;

  /**
   * Decomposes a requirement into atomic tasks
   */
  public async decompose(requirement: TechnicalRequirement): Promise<AtomicTask[]> {
    const tasks: AtomicTask[] = [];

    // Every requirement gets at least: scaffold, implement, test, review
    tasks.push(this.createTask(requirement, 'scaffold', 'Set up file structure and boilerplate', 'trivial'));
    tasks.push(this.createTask(requirement, 'implement', `Implement core logic for: ${requirement.title}`, 'medium', [tasks[tasks.length - 1].id]));
    tasks.push(this.createTask(requirement, 'test', `Write tests for: ${requirement.title}`, 'small', [tasks[tasks.length - 1].id]));
    tasks.push(this.createTask(requirement, 'review', `Review and refine: ${requirement.title}`, 'trivial', [tasks[tasks.length - 1].id]));

    return tasks;
  }

  /**
   * Analyses and tags skill requirements for a task
   */
  public identifySkillRequirements(task: AtomicTask): string[] {
    const skills: string[] = ['code-generation'];
    if (task.title.toLowerCase().includes('test')) skills.push('test-generation');
    if (task.title.toLowerCase().includes('review')) skills.push('code-review');
    if (task.title.toLowerCase().includes('scaffold')) skills.push('scaffolding');
    return skills;
  }

  private createTask(
    req: TechnicalRequirement,
    phase: string,
    description: string,
    effort: AtomicTask['estimatedEffort'],
    deps: string[] = []
  ): AtomicTask {
    this.counter++;
    return {
      id: `task-${this.counter}`,
      title: `[${phase}] ${req.title}`,
      parentRequirement: req.id,
      skillRequirements: [],
      input: { requirement: req },
      expectedOutput: `${phase} output for ${req.title}`,
      dependencies: deps,
      estimatedEffort: effort
    };
  }
}
