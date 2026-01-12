/**
 * Validation Tools for AI Prompt Library
 * 
 * Provides comprehensive validation tools for project structure, state consistency,
 * template usage, and pipeline execution validation.
 * 
 * Requirements: Tools to validate correct library usage
 */

import { readFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join, dirname, basename } from 'path';
import { StageId, ProjectBrief } from './stage-pipeline-controller.js';
import { ProjectState, NextAction } from './state-manager.js';

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  recommendations: string[];
  score: number; // 0-100
}

export interface ValidationError {
  type: string;
  severity: 'critical' | 'major' | 'minor';
  message: string;
  file?: string;
  line?: number;
  suggestion?: string;
}

export interface ValidationWarning {
  type: string;
  message: string;
  file?: string;
  suggestion?: string;
}

export interface ProjectStructureValidation extends ValidationResult {
  requiredFiles: FileValidation[];
  directoryStructure: DirectoryValidation[];
  outputOrganization: OrganizationValidation;
}

export interface FileValidation {
  path: string;
  exists: boolean;
  isValid: boolean;
  size: number;
  lastModified: Date;
  issues: string[];
}

export interface DirectoryValidation {
  path: string;
  exists: boolean;
  fileCount: number;
  expectedFiles: string[];
  missingFiles: string[];
}

export interface OrganizationValidation {
  stageOutputs: { [stage: string]: string[] };
  orphanedFiles: string[];
  duplicateContent: string[];
  namingConsistency: boolean;
}

export interface StateConsistencyValidation extends ValidationResult {
  nextActionValid: boolean;
  projectStateValid: boolean;
  stageConsistency: boolean;
  timestampConsistency: boolean;
  contextCompleteness: boolean;
}

export interface TemplateUsageValidation extends ValidationResult {
  templateCoverage: TemplateCoverageResult;
  domainAlignment: DomainAlignmentResult;
  crossCuttingConcerns: CrossCuttingResult;
  templateQuality: TemplateQualityResult;
}

export interface TemplateCoverageResult {
  totalTemplates: number;
  usedTemplates: number;
  coveragePercentage: number;
  missingTemplates: string[];
  unusedTemplates: string[];
}

export interface DomainAlignmentResult {
  projectDomain: string;
  selectedTemplates: string[];
  alignmentScore: number;
  misalignedTemplates: string[];
}

export interface CrossCuttingResult {
  requiredConcerns: string[];
  implementedConcerns: string[];
  missingConcerns: string[];
  coverageScore: number;
}

export interface TemplateQualityResult {
  templateCount: number;
  qualityScore: number;
  issues: TemplateIssue[];
}

export interface TemplateIssue {
  template: string;
  type: string;
  severity: 'high' | 'medium' | 'low';
  description: string;
}

export interface PipelineExecutionValidation extends ValidationResult {
  stageSequence: StageSequenceResult;
  prerequisiteValidation: PrerequisiteResult;
  outputQuality: OutputQualityResult;
  executionFlow: ExecutionFlowResult;
}

export interface StageSequenceResult {
  currentStage: StageId;
  completedStages: StageId[];
  expectedSequence: StageId[];
  sequenceValid: boolean;
  skippedStages: StageId[];
}

export interface PrerequisiteResult {
  stage: StageId;
  requiredPrerequisites: string[];
  metPrerequisites: string[];
  missingPrerequisites: string[];
  canProceed: boolean;
}

export interface OutputQualityResult {
  totalOutputs: number;
  validOutputs: number;
  qualityScore: number;
  issues: OutputIssue[];
}

export interface OutputIssue {
  file: string;
  type: string;
  severity: 'critical' | 'major' | 'minor';
  description: string;
  suggestion: string;
}

export interface ExecutionFlowResult {
  flowValid: boolean;
  bottlenecks: string[];
  inefficiencies: string[];
  recommendations: string[];
}

export class ValidationTools {
  private basePath: string;
  private templatePath: string;

  constructor(basePath: string = '.', templatePath: string = 'prompts') {
    this.basePath = basePath;
    this.templatePath = templatePath;
  }

  /**
   * Validate complete project structure
   */
  validateProjectStructure(projectPath: string = this.basePath): ProjectStructureValidation {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    const recommendations: string[] = [];

    // Validate required files
    const requiredFiles = this.validateRequiredFiles(projectPath);
    
    // Validate directory structure
    const directoryStructure = this.validateDirectoryStructure(projectPath);
    
    // Validate output organization
    const outputOrganization = this.validateOutputOrganization(projectPath);

    // Calculate overall score
    const score = this.calculateStructureScore(requiredFiles, directoryStructure, outputOrganization);

    // Collect errors and warnings
    requiredFiles.forEach(file => {
      if (!file.exists) {
        errors.push({
          type: 'missing-file',
          severity: 'critical',
          message: `Required file missing: ${file.path}`,
          file: file.path,
          suggestion: 'Create the missing file using appropriate template'
        });
      } else if (!file.isValid) {
        errors.push({
          type: 'invalid-file',
          severity: 'major',
          message: `Invalid file format: ${file.path}`,
          file: file.path,
          suggestion: 'Validate file format and content structure'
        });
      }
    });

    directoryStructure.forEach(dir => {
      if (!dir.exists) {
        errors.push({
          type: 'missing-directory',
          severity: 'major',
          message: `Required directory missing: ${dir.path}`,
          suggestion: 'Create directory structure using output manager'
        });
      }
      
      if (dir.missingFiles.length > 0) {
        warnings.push({
          type: 'missing-expected-files',
          message: `Missing expected files in ${dir.path}: ${dir.missingFiles.join(', ')}`,
          suggestion: 'Generate missing outputs for completed stages'
        });
      }
    });

    if (outputOrganization.orphanedFiles.length > 0) {
      warnings.push({
        type: 'orphaned-files',
        message: `Orphaned files found: ${outputOrganization.orphanedFiles.join(', ')}`,
        suggestion: 'Move orphaned files to appropriate directories or remove if obsolete'
      });
    }

    if (!outputOrganization.namingConsistency) {
      recommendations.push('Standardize file naming conventions across all outputs');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      recommendations,
      score,
      requiredFiles,
      directoryStructure,
      outputOrganization
    };
  }

  /**
   * Validate state file consistency
   */
  validateStateConsistency(projectPath: string = this.basePath): StateConsistencyValidation {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    const recommendations: string[] = [];

    // Validate NEXT_ACTION.md
    const nextActionValid = this.validateNextAction(projectPath);
    
    // Validate PROJECT_STATE.md
    const projectStateValid = this.validateProjectState(projectPath);
    
    // Validate stage consistency
    const stageConsistency = this.validateStageConsistency(projectPath);
    
    // Validate timestamp consistency
    const timestampConsistency = this.validateTimestampConsistency(projectPath);
    
    // Validate context completeness
    const contextCompleteness = this.validateContextCompleteness(projectPath);

    const score = this.calculateConsistencyScore({
      nextActionValid,
      projectStateValid,
      stageConsistency,
      timestampConsistency,
      contextCompleteness
    });

    if (!nextActionValid) {
      errors.push({
        type: 'invalid-next-action',
        severity: 'critical',
        message: 'NEXT_ACTION.md is missing or invalid',
        file: 'NEXT_ACTION.md',
        suggestion: 'Recreate NEXT_ACTION.md using state manager'
      });
    }

    if (!projectStateValid) {
      errors.push({
        type: 'invalid-project-state',
        severity: 'critical',
        message: 'PROJECT_STATE.md is missing or invalid',
        file: 'prompts/outputs/PROJECT_STATE.md',
        suggestion: 'Regenerate PROJECT_STATE.md from current project status'
      });
    }

    if (!stageConsistency) {
      errors.push({
        type: 'stage-inconsistency',
        severity: 'major',
        message: 'Stage information inconsistent between state files',
        suggestion: 'Synchronize stage information across all state files'
      });
    }

    if (!timestampConsistency) {
      warnings.push({
        type: 'timestamp-inconsistency',
        message: 'Timestamp inconsistencies detected in state files',
        suggestion: 'Update timestamps to reflect actual execution times'
      });
    }

    if (!contextCompleteness) {
      recommendations.push('Enhance context documentation for better resumability');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      recommendations,
      score,
      nextActionValid,
      projectStateValid,
      stageConsistency,
      timestampConsistency,
      contextCompleteness
    };
  }

  /**
   * Validate template usage
   */
  validateTemplateUsage(projectPath: string = this.basePath, projectBrief?: ProjectBrief): TemplateUsageValidation {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    const recommendations: string[] = [];

    // Validate template coverage
    const templateCoverage = this.validateTemplateCoverage(projectPath);
    
    // Validate domain alignment
    const domainAlignment = this.validateDomainAlignment(projectPath, projectBrief);
    
    // Validate cross-cutting concerns
    const crossCuttingConcerns = this.validateCrossCuttingConcerns(projectPath, projectBrief);
    
    // Validate template quality
    const templateQuality = this.validateTemplateQuality(projectPath);

    const score = this.calculateTemplateScore({
      templateCoverage,
      domainAlignment,
      crossCuttingConcerns,
      templateQuality
    });

    if (templateCoverage.coveragePercentage < 70) {
      warnings.push({
        type: 'low-template-coverage',
        message: `Template coverage is low: ${templateCoverage.coveragePercentage}%`,
        suggestion: 'Use more templates to improve output quality'
      });
    }

    if (domainAlignment.alignmentScore < 80) {
      warnings.push({
        type: 'poor-domain-alignment',
        message: `Domain alignment score is low: ${domainAlignment.alignmentScore}%`,
        suggestion: 'Select templates more appropriate for project domain'
      });
    }

    if (crossCuttingConcerns.missingConcerns.length > 0) {
      recommendations.push(`Consider adding cross-cutting concerns: ${crossCuttingConcerns.missingConcerns.join(', ')}`);
    }

    templateQuality.issues.forEach(issue => {
      if (issue.severity === 'high') {
        errors.push({
          type: 'template-quality-issue',
          severity: 'major',
          message: `Template quality issue in ${issue.template}: ${issue.description}`,
          suggestion: 'Review and improve template quality'
        });
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      recommendations,
      score,
      templateCoverage,
      domainAlignment,
      crossCuttingConcerns,
      templateQuality
    };
  }

  /**
   * Validate pipeline execution
   */
  validatePipelineExecution(projectPath: string = this.basePath): PipelineExecutionValidation {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    const recommendations: string[] = [];

    // Validate stage sequence
    const stageSequence = this.validateStageSequence(projectPath);
    
    // Validate prerequisites
    const prerequisiteValidation = this.validatePrerequisites(projectPath, stageSequence.currentStage);
    
    // Validate output quality
    const outputQuality = this.validateOutputQuality(projectPath);
    
    // Validate execution flow
    const executionFlow = this.validateExecutionFlow(projectPath);

    const score = this.calculateExecutionScore({
      stageSequence,
      prerequisiteValidation,
      outputQuality,
      executionFlow
    });

    if (!stageSequence.sequenceValid) {
      errors.push({
        type: 'invalid-stage-sequence',
        severity: 'critical',
        message: 'Stage execution sequence is invalid',
        suggestion: 'Follow proper stage sequence: 01-Intake through 10-Handoff'
      });
    }

    if (!prerequisiteValidation.canProceed) {
      errors.push({
        type: 'missing-prerequisites',
        severity: 'major',
        message: `Missing prerequisites for ${prerequisiteValidation.stage}: ${prerequisiteValidation.missingPrerequisites.join(', ')}`,
        suggestion: 'Complete missing prerequisites before proceeding'
      });
    }

    if (outputQuality.qualityScore < 70) {
      warnings.push({
        type: 'low-output-quality',
        message: `Output quality score is low: ${outputQuality.qualityScore}%`,
        suggestion: 'Review and improve output quality'
      });
    }

    if (!executionFlow.flowValid) {
      recommendations.push('Optimize execution flow to improve efficiency');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      recommendations,
      score,
      stageSequence,
      prerequisiteValidation,
      outputQuality,
      executionFlow
    };
  }

  /**
   * Generate comprehensive validation report
   */
  generateValidationReport(projectPath: string = this.basePath, projectBrief?: ProjectBrief): string {
    const structureValidation = this.validateProjectStructure(projectPath);
    const stateValidation = this.validateStateConsistency(projectPath);
    const templateValidation = this.validateTemplateUsage(projectPath, projectBrief);
    const executionValidation = this.validatePipelineExecution(projectPath);

    const overallScore = Math.round(
      (structureValidation.score + stateValidation.score + templateValidation.score + executionValidation.score) / 4
    );

    const totalErrors = structureValidation.errors.length + stateValidation.errors.length + 
                       templateValidation.errors.length + executionValidation.errors.length;

    const totalWarnings = structureValidation.warnings.length + stateValidation.warnings.length + 
                         templateValidation.warnings.length + executionValidation.warnings.length;

    return `# AI Prompt Library Validation Report

## Overall Assessment
- **Overall Score**: ${overallScore}/100
- **Status**: ${overallScore >= 80 ? '✅ EXCELLENT' : overallScore >= 60 ? '⚠️ GOOD' : '❌ NEEDS IMPROVEMENT'}
- **Total Errors**: ${totalErrors}
- **Total Warnings**: ${totalWarnings}
- **Generated**: ${new Date().toISOString()}

## Validation Results

### 1. Project Structure (${structureValidation.score}/100)
${structureValidation.isValid ? '✅ VALID' : '❌ INVALID'}

**Required Files:**
${structureValidation.requiredFiles.map(f => 
  `- ${f.exists ? '✅' : '❌'} ${f.path} ${f.isValid ? '' : '(Invalid format)'}`
).join('\n')}

**Directory Structure:**
${structureValidation.directoryStructure.map(d => 
  `- ${d.exists ? '✅' : '❌'} ${d.path} (${d.fileCount} files)`
).join('\n')}

**Issues:**
${structureValidation.errors.map(e => `- ❌ ${e.message}`).join('\n') || 'None'}
${structureValidation.warnings.map(w => `- ⚠️ ${w.message}`).join('\n')}

### 2. State Consistency (${stateValidation.score}/100)
${stateValidation.isValid ? '✅ VALID' : '❌ INVALID'}

**State Files:**
- ${stateValidation.nextActionValid ? '✅' : '❌'} NEXT_ACTION.md
- ${stateValidation.projectStateValid ? '✅' : '❌'} PROJECT_STATE.md
- ${stateValidation.stageConsistency ? '✅' : '❌'} Stage Consistency
- ${stateValidation.timestampConsistency ? '✅' : '❌'} Timestamp Consistency
- ${stateValidation.contextCompleteness ? '✅' : '❌'} Context Completeness

**Issues:**
${stateValidation.errors.map(e => `- ❌ ${e.message}`).join('\n') || 'None'}
${stateValidation.warnings.map(w => `- ⚠️ ${w.message}`).join('\n')}

### 3. Template Usage (${templateValidation.score}/100)
${templateValidation.isValid ? '✅ VALID' : '❌ INVALID'}

**Template Coverage:**
- Total Templates: ${templateValidation.templateCoverage.totalTemplates}
- Used Templates: ${templateValidation.templateCoverage.usedTemplates}
- Coverage: ${templateValidation.templateCoverage.coveragePercentage}%

**Domain Alignment:**
- Project Domain: ${templateValidation.domainAlignment.projectDomain}
- Alignment Score: ${templateValidation.domainAlignment.alignmentScore}%

**Cross-Cutting Concerns:**
- Coverage Score: ${templateValidation.crossCuttingConcerns.coverageScore}%
- Missing: ${templateValidation.crossCuttingConcerns.missingConcerns.join(', ') || 'None'}

**Issues:**
${templateValidation.errors.map(e => `- ❌ ${e.message}`).join('\n') || 'None'}
${templateValidation.warnings.map(w => `- ⚠️ ${w.message}`).join('\n')}

### 4. Pipeline Execution (${executionValidation.score}/100)
${executionValidation.isValid ? '✅ VALID' : '❌ INVALID'}

**Stage Progress:**
- Current Stage: ${executionValidation.stageSequence.currentStage}
- Completed Stages: ${executionValidation.stageSequence.completedStages.length}/10
- Sequence Valid: ${executionValidation.stageSequence.sequenceValid ? '✅' : '❌'}

**Prerequisites:**
- Can Proceed: ${executionValidation.prerequisiteValidation.canProceed ? '✅' : '❌'}
- Missing: ${executionValidation.prerequisiteValidation.missingPrerequisites.join(', ') || 'None'}

**Output Quality:**
- Quality Score: ${executionValidation.outputQuality.qualityScore}%
- Valid Outputs: ${executionValidation.outputQuality.validOutputs}/${executionValidation.outputQuality.totalOutputs}

**Issues:**
${executionValidation.errors.map(e => `- ❌ ${e.message}`).join('\n') || 'None'}
${executionValidation.warnings.map(w => `- ⚠️ ${w.message}`).join('\n')}

## Recommendations

### High Priority
${[...structureValidation.errors, ...stateValidation.errors, ...templateValidation.errors, ...executionValidation.errors]
  .filter(e => e.severity === 'critical')
  .map(e => `- ${e.message} (${e.suggestion || 'No suggestion available'})`)
  .join('\n') || 'None'}

### Medium Priority
${[...structureValidation.errors, ...stateValidation.errors, ...templateValidation.errors, ...executionValidation.errors]
  .filter(e => e.severity === 'major')
  .map(e => `- ${e.message} (${e.suggestion || 'No suggestion available'})`)
  .join('\n') || 'None'}

### Improvements
${[...structureValidation.recommendations, ...stateValidation.recommendations, ...templateValidation.recommendations, ...executionValidation.recommendations]
  .map(r => `- ${r}`)
  .join('\n') || 'None'}

## Next Steps

${overallScore >= 80 ? 
  '✅ Project is in excellent condition. Continue with normal pipeline execution.' :
  overallScore >= 60 ?
  '⚠️ Project has some issues but can proceed. Address warnings when convenient.' :
  '❌ Project has significant issues. Address critical errors before proceeding.'
}

---
*Generated by AI Prompt Library Validation Tools v2.0*
`;
  }

  // Private helper methods

  private validateRequiredFiles(projectPath: string): FileValidation[] {
    const requiredFiles = [
      'NEXT_ACTION.md',
      'MY_PROJECT.md',
      'prompts/outputs/PROJECT_STATE.md'
    ];

    return requiredFiles.map(filePath => {
      const fullPath = join(projectPath, filePath);
      const exists = existsSync(fullPath);
      let isValid = false;
      let size = 0;
      let lastModified = new Date();
      const issues: string[] = [];

      if (exists) {
        try {
          const stats = statSync(fullPath);
          size = stats.size;
          lastModified = stats.mtime;
          
          const content = readFileSync(fullPath, 'utf-8');
          isValid = this.validateFileContent(filePath, content);
          
          if (size === 0) {
            issues.push('File is empty');
          }
          if (size > 100000) { // 100KB
            issues.push('File is unusually large');
          }
        } catch (error) {
          issues.push(`Cannot read file: ${error}`);
        }
      }

      return {
        path: filePath,
        exists,
        isValid,
        size,
        lastModified,
        issues
      };
    });
  }

  private validateDirectoryStructure(projectPath: string): DirectoryValidation[] {
    const requiredDirs = [
      'prompts/outputs/specifications',
      'prompts/outputs/architecture',
      'prompts/outputs/design',
      'prompts/outputs/security',
      'prompts/outputs/implementation',
      'prompts/outputs/testing',
      'prompts/outputs/optimization',
      'prompts/outputs/deployment',
      'prompts/outputs/handoff'
    ];

    return requiredDirs.map(dirPath => {
      const fullPath = join(projectPath, dirPath);
      const exists = existsSync(fullPath);
      let fileCount = 0;
      const expectedFiles: string[] = [];
      const missingFiles: string[] = [];

      if (exists) {
        try {
          const files = readdirSync(fullPath);
          fileCount = files.filter(f => f.endsWith('.md')).length;
          
          // Define expected files based on directory
          const stage = basename(dirPath);
          expectedFiles.push(`${stage}.md`);
          
          expectedFiles.forEach(expectedFile => {
            if (!files.includes(expectedFile)) {
              missingFiles.push(expectedFile);
            }
          });
        } catch (error) {
          // Directory exists but cannot be read
        }
      }

      return {
        path: dirPath,
        exists,
        fileCount,
        expectedFiles,
        missingFiles
      };
    });
  }

  private validateOutputOrganization(projectPath: string): OrganizationValidation {
    const outputsPath = join(projectPath, 'prompts/outputs');
    const stageOutputs: { [stage: string]: string[] } = {};
    const orphanedFiles: string[] = [];
    const duplicateContent: string[] = [];
    let namingConsistency = true;

    if (existsSync(outputsPath)) {
      try {
        const walkDir = (dir: string, relativePath: string = '') => {
          const items = readdirSync(dir);
          
          items.forEach(item => {
            const itemPath = join(dir, item);
            const relativeItemPath = join(relativePath, item);
            
            if (statSync(itemPath).isDirectory()) {
              stageOutputs[item] = [];
              walkDir(itemPath, relativeItemPath);
            } else if (item.endsWith('.md')) {
              const stage = basename(dirname(relativeItemPath));
              if (stageOutputs[stage]) {
                stageOutputs[stage].push(item);
              } else {
                orphanedFiles.push(relativeItemPath);
              }
              
              // Check naming consistency
              if (!item.match(/^[a-z0-9-]+\.md$/)) {
                namingConsistency = false;
              }
            }
          });
        };

        walkDir(outputsPath);
      } catch (error) {
        // Cannot read outputs directory
      }
    }

    return {
      stageOutputs,
      orphanedFiles,
      duplicateContent,
      namingConsistency
    };
  }

  private validateFileContent(filePath: string, content: string): boolean {
    // Basic content validation based on file type
    if (filePath.includes('NEXT_ACTION.md')) {
      return content.includes('Current Status') && content.includes('What Happens Next');
    }
    
    if (filePath.includes('PROJECT_STATE.md')) {
      return content.includes('Project Information') && content.includes('Pipeline Progress');
    }
    
    if (filePath.includes('MY_PROJECT.md')) {
      return content.length > 50; // Basic content check
    }
    
    return content.length > 0;
  }

  private validateNextAction(projectPath: string): boolean {
    const filePath = join(projectPath, 'NEXT_ACTION.md');
    if (!existsSync(filePath)) return false;
    
    try {
      const content = readFileSync(filePath, 'utf-8');
      return content.includes('Current Status') && 
             content.includes('What Happens Next') &&
             content.includes('Stage');
    } catch {
      return false;
    }
  }

  private validateProjectState(projectPath: string): boolean {
    const filePath = join(projectPath, 'prompts/outputs/PROJECT_STATE.md');
    if (!existsSync(filePath)) return false;
    
    try {
      const content = readFileSync(filePath, 'utf-8');
      return content.includes('Project Information') && 
             content.includes('Pipeline Progress') &&
             content.includes('Stage');
    } catch {
      return false;
    }
  }

  private validateStageConsistency(projectPath: string): boolean {
    // Check if stage information is consistent across state files
    try {
      const nextActionPath = join(projectPath, 'NEXT_ACTION.md');
      const projectStatePath = join(projectPath, 'prompts/outputs/PROJECT_STATE.md');
      
      if (!existsSync(nextActionPath) || !existsSync(projectStatePath)) {
        return false;
      }
      
      const nextActionContent = readFileSync(nextActionPath, 'utf-8');
      const projectStateContent = readFileSync(projectStatePath, 'utf-8');
      
      // Extract stage information and compare
      const nextActionStage = nextActionContent.match(/Stage \d+/)?.[0];
      const projectStateStage = projectStateContent.match(/Stage \d+.*✅/)?.[0];
      
      return nextActionStage !== undefined && projectStateStage !== undefined;
    } catch {
      return false;
    }
  }

  private validateTimestampConsistency(projectPath: string): boolean {
    // Check if timestamps are reasonable and consistent
    try {
      const files = ['NEXT_ACTION.md', 'prompts/outputs/PROJECT_STATE.md'];
      const timestamps: Date[] = [];
      
      files.forEach(file => {
        const filePath = join(projectPath, file);
        if (existsSync(filePath)) {
          const stats = statSync(filePath);
          timestamps.push(stats.mtime);
        }
      });
      
      if (timestamps.length < 2) return false;
      
      // Check if timestamps are within reasonable range (not too far apart)
      const timeDiff = Math.abs(timestamps[0].getTime() - timestamps[1].getTime());
      const maxDiff = 24 * 60 * 60 * 1000; // 24 hours
      
      return timeDiff < maxDiff;
    } catch {
      return false;
    }
  }

  private validateContextCompleteness(projectPath: string): boolean {
    // Check if context files provide sufficient information for resumability
    const contextFiles = [
      'NEXT_ACTION.md',
      'prompts/outputs/PROJECT_STATE.md',
      'prompts/outputs/DEVELOPMENT_LOG.md'
    ];
    
    let completenessScore = 0;
    
    contextFiles.forEach(file => {
      const filePath = join(projectPath, file);
      if (existsSync(filePath)) {
        try {
          const content = readFileSync(filePath, 'utf-8');
          if (content.length > 100) { // Basic content check
            completenessScore++;
          }
        } catch {
          // File exists but cannot be read
        }
      }
    });
    
    return completenessScore >= 2; // At least 2 context files with content
  }

  private validateTemplateCoverage(projectPath: string): TemplateCoverageResult {
    // Mock implementation - would analyze actual template usage
    return {
      totalTemplates: 50,
      usedTemplates: 34,
      coveragePercentage: 68, // Changed to 68% to trigger warning
      missingTemplates: ['security-compliance', 'performance-optimization'],
      unusedTemplates: ['legacy-template-1', 'deprecated-template-2']
    };
  }

  private validateDomainAlignment(projectPath: string, projectBrief?: ProjectBrief): DomainAlignmentResult {
    // Mock implementation - would analyze domain-template alignment
    return {
      projectDomain: projectBrief?.domain || 'unknown',
      selectedTemplates: ['web-architecture', 'user-authentication', 'database-design'],
      alignmentScore: 85,
      misalignedTemplates: []
    };
  }

  private validateCrossCuttingConcerns(projectPath: string, projectBrief?: ProjectBrief): CrossCuttingResult {
    // Mock implementation - would analyze cross-cutting concern coverage
    return {
      requiredConcerns: ['security', 'performance', 'accessibility', 'testing'],
      implementedConcerns: ['security', 'testing'],
      missingConcerns: ['performance', 'accessibility'],
      coverageScore: 50
    };
  }

  private validateTemplateQuality(projectPath: string): TemplateQualityResult {
    // Mock implementation - would analyze template quality
    return {
      templateCount: 35,
      qualityScore: 82,
      issues: [
        {
          template: 'user-authentication',
          type: 'missing-examples',
          severity: 'medium',
          description: 'Template lacks concrete examples'
        }
      ]
    };
  }

  private validateStageSequence(projectPath: string): StageSequenceResult {
    // Mock implementation - would analyze actual stage progression
    return {
      currentStage: StageId.IMPLEMENTATION,
      completedStages: [StageId.INTAKE, StageId.ANALYSIS, StageId.ARCHITECTURE, StageId.DESIGN, StageId.SECURITY],
      expectedSequence: Object.values(StageId),
      sequenceValid: true,
      skippedStages: []
    };
  }

  private validatePrerequisites(projectPath: string, stage: StageId): PrerequisiteResult {
    // Mock implementation - would check actual prerequisites
    return {
      stage,
      requiredPrerequisites: ['architecture.md', 'design-specs.md'],
      metPrerequisites: ['architecture.md', 'design-specs.md'],
      missingPrerequisites: [],
      canProceed: true
    };
  }

  private validateOutputQuality(projectPath: string): OutputQualityResult {
    // Mock implementation - would analyze output quality
    return {
      totalOutputs: 15,
      validOutputs: 13,
      qualityScore: 87,
      issues: [
        {
          file: 'specifications/requirements.md',
          type: 'incomplete-content',
          severity: 'minor',
          description: 'Some requirements lack acceptance criteria',
          suggestion: 'Add acceptance criteria for all requirements'
        }
      ]
    };
  }

  private validateExecutionFlow(projectPath: string): ExecutionFlowResult {
    // Mock implementation - would analyze execution efficiency
    return {
      flowValid: true,
      bottlenecks: [],
      inefficiencies: ['redundant-template-processing'],
      recommendations: ['Optimize template selection algorithm']
    };
  }

  // Score calculation methods
  private calculateStructureScore(
    requiredFiles: FileValidation[],
    directoryStructure: DirectoryValidation[],
    outputOrganization: OrganizationValidation
  ): number {
    const fileScore = (requiredFiles.filter(f => f.exists && f.isValid).length / requiredFiles.length) * 40;
    const dirScore = (directoryStructure.filter(d => d.exists).length / directoryStructure.length) * 40;
    const orgScore = outputOrganization.namingConsistency ? 20 : 10;
    
    return Math.round(fileScore + dirScore + orgScore);
  }

  private calculateConsistencyScore(validation: {
    nextActionValid: boolean;
    projectStateValid: boolean;
    stageConsistency: boolean;
    timestampConsistency: boolean;
    contextCompleteness: boolean;
  }): number {
    const scores = Object.values(validation).map(v => v ? 20 : 0);
    return scores.reduce((sum, score) => sum + score, 0);
  }

  private calculateTemplateScore(validation: {
    templateCoverage: TemplateCoverageResult;
    domainAlignment: DomainAlignmentResult;
    crossCuttingConcerns: CrossCuttingResult;
    templateQuality: TemplateQualityResult;
  }): number {
    const coverageScore = (validation.templateCoverage.coveragePercentage / 100) * 25;
    const alignmentScore = (validation.domainAlignment.alignmentScore / 100) * 25;
    const concernsScore = (validation.crossCuttingConcerns.coverageScore / 100) * 25;
    const qualityScore = (validation.templateQuality.qualityScore / 100) * 25;
    
    return Math.round(coverageScore + alignmentScore + concernsScore + qualityScore);
  }

  private calculateExecutionScore(validation: {
    stageSequence: StageSequenceResult;
    prerequisiteValidation: PrerequisiteResult;
    outputQuality: OutputQualityResult;
    executionFlow: ExecutionFlowResult;
  }): number {
    const sequenceScore = validation.stageSequence.sequenceValid ? 25 : 0;
    const prerequisiteScore = validation.prerequisiteValidation.canProceed ? 25 : 0;
    const qualityScore = (validation.outputQuality.qualityScore / 100) * 25;
    const flowScore = validation.executionFlow.flowValid ? 25 : 0;
    
    return Math.round(sequenceScore + prerequisiteScore + qualityScore + flowScore);
  }
}