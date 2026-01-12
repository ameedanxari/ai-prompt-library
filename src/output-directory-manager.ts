import { existsSync, mkdirSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, dirname, basename } from 'path';
import { StageId } from './stage-pipeline-controller.js';

/**
 * Output Directory Manager
 * 
 * Ensures all generated artifacts are placed in the correct standardized locations.
 * Manages the prompts/outputs/ directory structure.
 * 
 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5
 */

export interface OutputStructure {
  base: string;
  specifications: string;
  implementation: string;
  tasks: string;
  stages: string;
  state: string;
}

export const OUTPUT_STRUCTURE: OutputStructure = {
  base: 'prompts/outputs/',
  specifications: 'prompts/outputs/specifications/',
  implementation: 'prompts/outputs/implementation/',
  tasks: 'prompts/outputs/tasks/',
  stages: 'prompts/outputs/stages/',
  state: 'prompts/outputs/state/'
};

export enum OutputType {
  SPECIFICATION = 'specification',
  ARCHITECTURE = 'architecture',
  FEATURES = 'features',
  TASKS = 'tasks',
  IMPLEMENTATION_PROMPT = 'implementation-prompt',
  STATE = 'state',
  DOCUMENTATION = 'documentation'
}

export interface StageOutput {
  type: OutputType;
  filename: string;
  content: string;
  platform?: string;
  references: string[];
}

export interface Specification {
  id: string;
  name: string;
  type: string;
  content: string;
  platform?: string;
  stage: StageId;
}

export interface ImplementationPrompt {
  id: string;
  title: string;
  content: string;
  stage: StageId;
  dependencies: string[];
  estimatedTokens: number;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  stage: StageId;
  dependencies: string[];
  completionCriteria: string[];
}

export interface DirectoryValidationResult {
  isValid: boolean;
  missingDirectories: string[];
  unexpectedFiles: string[];
  structureErrors: string[];
}

export interface SaveResult {
  success: boolean;
  filepath: string;
  error?: string;
}

export class OutputDirectoryManager {
  private basePath: string;
  private structure: OutputStructure;

  constructor(basePath: string = '') {
    this.basePath = basePath;
    this.structure = this.resolveStructure(basePath);
  }

  /**
   * Create the complete directory structure
   */
  createDirectoryStructure(): void {
    const directories = [
      this.structure.base,
      this.structure.specifications,
      this.structure.implementation,
      this.structure.tasks,
      this.structure.stages,
      this.structure.state
    ];

    // Create stage-specific directories
    for (const stageId of Object.values(StageId)) {
      directories.push(join(this.structure.stages, stageId));
    }

    for (const dir of directories) {
      this.ensureDirectory(dir);
    }
  }

  /**
   * Save stage output to appropriate location
   */
  saveStageOutput(stageId: StageId, output: StageOutput): SaveResult {
    const directory = this.getOutputDirectory(output.type, stageId);
    const filename = this.sanitizeFilename(output.filename);
    const filepath = join(directory, filename);

    try {
      this.ensureDirectory(directory);
      writeFileSync(filepath, output.content, 'utf-8');
      return { success: true, filepath };
    } catch (error) {
      return { 
        success: false, 
        filepath, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Save a specification document
   */
  saveSpecification(spec: Specification): SaveResult {
    const directory = this.structure.specifications;
    const filename = this.sanitizeFilename(`${spec.id}-${spec.name}.md`);
    const filepath = join(directory, filename);

    const content = this.formatSpecification(spec);

    try {
      this.ensureDirectory(directory);
      writeFileSync(filepath, content, 'utf-8');
      return { success: true, filepath };
    } catch (error) {
      return { 
        success: false, 
        filepath, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Save an implementation prompt
   */
  saveImplementationPrompt(prompt: ImplementationPrompt): SaveResult {
    const directory = this.structure.implementation;
    const filename = this.sanitizeFilename(`${prompt.id}-${prompt.title}.md`);
    const filepath = join(directory, filename);

    const content = this.formatImplementationPrompt(prompt);

    try {
      this.ensureDirectory(directory);
      writeFileSync(filepath, content, 'utf-8');
      return { success: true, filepath };
    } catch (error) {
      return { 
        success: false, 
        filepath, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Save a task list
   */
  saveTaskList(tasks: Task[], filename: string = 'tasks.md'): SaveResult {
    const directory = this.structure.tasks;
    const filepath = join(directory, this.sanitizeFilename(filename));

    const content = this.formatTaskList(tasks);

    try {
      this.ensureDirectory(directory);
      writeFileSync(filepath, content, 'utf-8');
      return { success: true, filepath };
    } catch (error) {
      return { 
        success: false, 
        filepath, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Save a state file
   */
  saveStateFile(filename: string, content: string): SaveResult {
    const directory = this.structure.state;
    const filepath = join(directory, this.sanitizeFilename(filename));

    try {
      this.ensureDirectory(directory);
      writeFileSync(filepath, content, 'utf-8');
      return { success: true, filepath };
    } catch (error) {
      return { 
        success: false, 
        filepath, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Validate the directory structure
   */
  validateDirectoryStructure(): DirectoryValidationResult {
    const missingDirectories: string[] = [];
    const unexpectedFiles: string[] = [];
    const structureErrors: string[] = [];

    const expectedDirectories = [
      this.structure.base,
      this.structure.specifications,
      this.structure.implementation,
      this.structure.tasks,
      this.structure.stages,
      this.structure.state
    ];

    // Check expected directories exist
    for (const dir of expectedDirectories) {
      if (!existsSync(dir)) {
        missingDirectories.push(dir);
      }
    }

    // Check stage directories
    for (const stageId of Object.values(StageId)) {
      const stageDir = join(this.structure.stages, stageId);
      if (!existsSync(stageDir)) {
        missingDirectories.push(stageDir);
      }
    }

    // Check for files in wrong locations
    if (existsSync(this.structure.base)) {
      const baseFiles = this.listFilesRecursive(this.structure.base);
      for (const file of baseFiles) {
        if (!this.isFileInCorrectLocation(file)) {
          unexpectedFiles.push(file);
        }
      }
    }

    return {
      isValid: missingDirectories.length === 0 && structureErrors.length === 0,
      missingDirectories,
      unexpectedFiles,
      structureErrors
    };
  }

  /**
   * Repair directory structure by creating missing directories
   */
  repairDirectoryStructure(): DirectoryValidationResult {
    const validation = this.validateDirectoryStructure();
    
    for (const dir of validation.missingDirectories) {
      this.ensureDirectory(dir);
    }

    return this.validateDirectoryStructure();
  }

  /**
   * Get the output directory for a specific type and stage
   */
  getOutputDirectory(type: OutputType, stageId?: StageId): string {
    switch (type) {
      case OutputType.SPECIFICATION:
        return this.structure.specifications;
      case OutputType.IMPLEMENTATION_PROMPT:
        return this.structure.implementation;
      case OutputType.TASKS:
        return this.structure.tasks;
      case OutputType.STATE:
        return this.structure.state;
      case OutputType.ARCHITECTURE:
      case OutputType.FEATURES:
      case OutputType.DOCUMENTATION:
      default:
        return stageId 
          ? join(this.structure.stages, stageId)
          : this.structure.stages;
    }
  }

  /**
   * Get the current output structure
   */
  getOutputStructure(): OutputStructure {
    return { ...this.structure };
  }

  /**
   * List all files in a directory
   */
  listOutputFiles(type: OutputType, stageId?: StageId): string[] {
    const directory = this.getOutputDirectory(type, stageId);
    
    if (!existsSync(directory)) {
      return [];
    }

    return readdirSync(directory)
      .filter(file => !file.startsWith('.'))
      .map(file => join(directory, file));
  }

  // Private helper methods

  private resolveStructure(basePath: string): OutputStructure {
    const base = basePath ? join(basePath, OUTPUT_STRUCTURE.base) : OUTPUT_STRUCTURE.base;
    return {
      base,
      specifications: basePath ? join(basePath, OUTPUT_STRUCTURE.specifications) : OUTPUT_STRUCTURE.specifications,
      implementation: basePath ? join(basePath, OUTPUT_STRUCTURE.implementation) : OUTPUT_STRUCTURE.implementation,
      tasks: basePath ? join(basePath, OUTPUT_STRUCTURE.tasks) : OUTPUT_STRUCTURE.tasks,
      stages: basePath ? join(basePath, OUTPUT_STRUCTURE.stages) : OUTPUT_STRUCTURE.stages,
      state: basePath ? join(basePath, OUTPUT_STRUCTURE.state) : OUTPUT_STRUCTURE.state
    };
  }

  private ensureDirectory(dir: string): void {
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
  }

  private sanitizeFilename(filename: string): string {
    return filename
      .replace(/[^a-zA-Z0-9._-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  private formatSpecification(spec: Specification): string {
    return `# ${spec.name}

## Metadata
- **ID**: ${spec.id}
- **Type**: ${spec.type}
- **Stage**: ${spec.stage}
${spec.platform ? `- **Platform**: ${spec.platform}` : ''}

## Content

${spec.content}
`;
  }

  private formatImplementationPrompt(prompt: ImplementationPrompt): string {
    return `# ${prompt.title}

## Metadata
- **ID**: ${prompt.id}
- **Stage**: ${prompt.stage}
- **Estimated Tokens**: ${prompt.estimatedTokens}

## Dependencies
${prompt.dependencies.map(d => `- ${d}`).join('\n') || '- None'}

## Implementation Instructions

${prompt.content}
`;
  }

  private formatTaskList(tasks: Task[]): string {
    return `# Task List

## Overview
Total tasks: ${tasks.length}

## Tasks

${tasks.map((task, index) => `### ${index + 1}. ${task.title}

- **ID**: ${task.id}
- **Stage**: ${task.stage}

#### Description
${task.description}

#### Dependencies
${task.dependencies.map(d => `- ${d}`).join('\n') || '- None'}

#### Completion Criteria
${task.completionCriteria.map(c => `- [ ] ${c}`).join('\n')}

---
`).join('\n')}
`;
  }

  private listFilesRecursive(dir: string): string[] {
    const files: string[] = [];
    
    if (!existsSync(dir)) return files;

    const entries = readdirSync(dir);
    for (const entry of entries) {
      const fullPath = join(dir, entry);
      const stat = statSync(fullPath);
      
      if (stat.isDirectory()) {
        files.push(...this.listFilesRecursive(fullPath));
      } else {
        files.push(fullPath);
      }
    }

    return files;
  }

  private isFileInCorrectLocation(filepath: string): boolean {
    const relativePath = filepath.replace(this.structure.base, '');
    
    // Files should be in subdirectories, not directly in base
    if (!relativePath.includes('/') && !relativePath.includes('\\')) {
      return false;
    }

    // Check if file is in a valid subdirectory
    const validPrefixes = [
      'specifications/',
      'implementation/',
      'tasks/',
      'stages/',
      'state/'
    ];

    return validPrefixes.some(prefix => relativePath.startsWith(prefix));
  }
}
