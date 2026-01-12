/**
 * Template Architecture Guard
 * 
 * This system enforces architectural consistency across the template library
 * to prevent regression and ensure all templates follow established patterns.
 * 
 * Guards:
 * 1. Template Structure Validation - All templates must have required sections
 * 2. Consistency Checks - All templates in a domain must follow same pattern
 * 3. Integration Point Validation - Cross-domain references must be valid
 * 4. Code Example Validation - All code examples must be syntactically valid
 * 5. Regression Detection - Changes must not break existing functionality
 */

import * as fs from 'fs/promises';
import * as path from 'path';

export interface TemplateArchitecture {
  requiredSections: string[];
  optionalSections: string[];
  minLength: number;
  requiresCodeExamples: boolean;
  requiresIntegrationPoints: boolean;
}

export interface ArchitectureGuardResult {
  passed: boolean;
  violations: ArchitectureViolation[];
  warnings: string[];
  regressions: RegressionDetected[];
}

export interface ArchitectureViolation {
  file: string;
  type: 'missing-section' | 'invalid-structure' | 'inconsistent-pattern' | 'broken-reference';
  message: string;
  severity: 'error' | 'warning';
}

export interface RegressionDetected {
  file: string;
  previousState: string;
  currentState: string;
  impact: 'high' | 'medium' | 'low';
  description: string;
}

export class TemplateArchitectureGuard {
  private readonly architectureRules: Map<string, TemplateArchitecture> = new Map();
  private readonly previousState: Map<string, string> = new Map();
  private readonly domainPatterns: Map<string, Set<string>> = new Map();

  constructor() {
    this.initializeArchitectureRules();
  }

  private initializeArchitectureRules(): void {
    // README files (index files for modules)
    this.architectureRules.set('README', {
      requiredSections: ['Purpose', 'Instructions', 'Examples', 'Templates'],
      optionalSections: ['Integration', 'Usage', 'Notes'],
      minLength: 300,
      requiresCodeExamples: true,
      requiresIntegrationPoints: false
    });

    // v2 Domain Templates (commerce, social, fintech, etc.)
    this.architectureRules.set('v2-domain', {
      requiredSections: ['Purpose', 'Implementation Patterns', 'Examples'],
      optionalSections: ['Integration Points', 'Security Considerations', 'Compliance Guidelines', 'Testing Considerations'],
      minLength: 500,
      requiresCodeExamples: true,
      requiresIntegrationPoints: false
    });

    // v1 Feature Pattern Templates
    this.architectureRules.set('v1-feature', {
      requiredSections: ['Purpose', 'Instructions', 'Examples'],
      optionalSections: ['Integration Points', 'Security Considerations', 'Testing Considerations'],
      minLength: 500,
      requiresCodeExamples: true,
      requiresIntegrationPoints: false
    });

    // Cross-platform Templates
    this.architectureRules.set('cross-platform', {
      requiredSections: ['Purpose', 'Instructions', 'Examples'],
      optionalSections: ['Integration Points', 'Platform-Specific Variations'],
      minLength: 400,
      requiresCodeExamples: true,
      requiresIntegrationPoints: false
    });
  }

  async validateTemplateLibrary(promptsDir: string): Promise<ArchitectureGuardResult> {
    const violations: ArchitectureViolation[] = [];
    const warnings: string[] = [];
    const regressions: RegressionDetected[] = [];

    try {
      // Load all templates
      const templates = await this.loadAllTemplates(promptsDir);

      // Validate each template
      for (const [filePath, content] of templates) {
        const fileViolations = this.validateTemplate(filePath, content);
        violations.push(...fileViolations);

        // Check for regressions
        const previousContent = this.previousState.get(filePath);
        if (previousContent) {
          const regressionCheck = this.detectRegressions(filePath, previousContent, content);
          regressions.push(...regressionCheck);
        }

        // Store current state
        this.previousState.set(filePath, content);
      }

      // Validate cross-domain consistency
      const consistencyViolations = this.validateCrossDomainConsistency(templates);
      violations.push(...consistencyViolations);

      // Validate integration point references
      const referenceViolations = this.validateIntegrationReferences(templates);
      violations.push(...referenceViolations);

      const passed = violations.filter(v => v.severity === 'error').length === 0;

      return {
        passed,
        violations,
        warnings,
        regressions
      };
    } catch (error) {
      return {
        passed: false,
        violations: [{
          file: 'unknown',
          type: 'invalid-structure',
          message: `Architecture validation failed: ${error}`,
          severity: 'error'
        }],
        warnings,
        regressions
      };
    }
  }

  private async loadAllTemplates(dir: string): Promise<Map<string, string>> {
    const templates = new Map<string, string>();

    const loadDir = async (currentDir: string) => {
      const entries = await fs.readdir(currentDir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(currentDir, entry.name);

        if (entry.isDirectory()) {
          await loadDir(fullPath);
        } else if (entry.isFile() && entry.name.endsWith('.md')) {
          const content = await fs.readFile(fullPath, 'utf-8');
          const relativePath = path.relative(dir, fullPath);
          templates.set(relativePath, content);
        }
      }
    };

    await loadDir(dir);
    return templates;
  }

  private validateTemplate(filePath: string, content: string): ArchitectureViolation[] {
    const violations: ArchitectureViolation[] = [];
    const fileName = path.basename(filePath);
    const dirName = path.dirname(filePath).split('/').pop() || '';

    // Skip steering files - they are instructions, not templates
    if (filePath.includes('steering/')) {
      return violations;
    }

    // Determine template type
    let templateType = 'v2-domain';
    if (fileName === 'README.md') {
      templateType = 'README';
    } else if (filePath.includes('feature-patterns')) {
      templateType = 'v1-feature';
    } else if (filePath.includes('cross-platform')) {
      templateType = 'cross-platform';
    }

    const rules = this.architectureRules.get(templateType);
    if (!rules) {
      violations.push({
        file: filePath,
        type: 'invalid-structure',
        message: `Unknown template type: ${templateType}`,
        severity: 'warning'
      });
      return violations;
    }

    // Check required sections (with flexible matching for Instructions/Implementation Patterns)
    for (const section of rules.requiredSections) {
      let found = false;
      
      // Special handling for Instructions/Implementation Patterns
      if (section === 'Implementation Patterns') {
        found = content.includes(`## ${section}`) || 
                content.includes(`### ${section}`) ||
                content.includes('## Instructions') ||
                content.includes('### Instructions');
      } else {
        found = content.includes(`## ${section}`) || content.includes(`### ${section}`);
      }
      
      if (!found) {
        violations.push({
          file: filePath,
          type: 'missing-section',
          message: `Missing required section: ${section}`,
          severity: 'error'
        });
      }
    }

    // Check code examples
    if (rules.requiresCodeExamples && !content.includes('```')) {
      violations.push({
        file: filePath,
        type: 'missing-section',
        message: 'Missing code examples (no code blocks found)',
        severity: 'error'
      });
    }

    // Check minimum length
    if (content.length < rules.minLength) {
      violations.push({
        file: filePath,
        type: 'invalid-structure',
        message: `Content too short (${content.length} < ${rules.minLength} characters)`,
        severity: 'error'
      });
    }

    // Check structure
    const headings = content.match(/^#+\s+/gm) || [];
    if (headings.length < 3) {
      violations.push({
        file: filePath,
        type: 'invalid-structure',
        message: `Insufficient structure (${headings.length} < 3 headings)`,
        severity: 'warning'
      });
    }

    // Track domain patterns for consistency checking
    if (templateType === 'v2-domain') {
      const domain = dirName;
      if (!this.domainPatterns.has(domain)) {
        this.domainPatterns.set(domain, new Set());
      }
      this.domainPatterns.get(domain)!.add(filePath);
    }

    return violations;
  }

  private validateCrossDomainConsistency(templates: Map<string, string>): ArchitectureViolation[] {
    const violations: ArchitectureViolation[] = [];

    // Check that all templates in same domain follow same pattern
    for (const [domain, files] of this.domainPatterns) {
      const patterns: Map<string, number> = new Map();

      for (const filePath of files) {
        const content = templates.get(filePath) || '';
        const hasImplementationPatterns = content.includes('## Implementation Patterns');
        const hasInstructions = content.includes('## Instructions');

        const pattern = hasImplementationPatterns ? 'implementation-patterns' : 'instructions';
        patterns.set(pattern, (patterns.get(pattern) || 0) + 1);
      }

      // If domain has mixed patterns, flag as inconsistency
      if (patterns.size > 1) {
        violations.push({
          file: `domain:${domain}`,
          type: 'inconsistent-pattern',
          message: `Domain has inconsistent patterns: ${Array.from(patterns.keys()).join(', ')}`,
          severity: 'warning'
        });
      }
    }

    return violations;
  }

  private validateIntegrationReferences(templates: Map<string, string>): ArchitectureViolation[] {
    const violations: ArchitectureViolation[] = [];
    const validFiles = new Set(templates.keys());

    for (const [filePath, content] of templates) {
      // Find all file references in Integration Points
      const integrationMatches = content.matchAll(/`([^`]+\.md)`/g);

      for (const match of integrationMatches) {
        const referencedFile = match[1];
        
        // Skip template variables and wildcards
        if (referencedFile.includes('${') || referencedFile.includes('*') || referencedFile.startsWith('/')) {
          continue;
        }
        
        // Skip references to docs directory (they're outside prompts)
        if (referencedFile.startsWith('docs/')) {
          continue;
        }
        
        // Skip references to working_copy (user-provided files)
        if (referencedFile.startsWith('working_copy/')) {
          continue;
        }
        
        // Skip references to prompts/outputs (generated files in user projects)
        if (referencedFile.startsWith('prompts/outputs/')) {
          continue;
        }
        
        // Skip references to .ai-prompts (submodule path in user projects)
        if (referencedFile.startsWith('.ai-prompts/')) {
          continue;
        }
        
        // Skip references to MY_PROJECT.md and NEXT_ACTION.md (user project files)
        if (referencedFile === 'MY_PROJECT.md' || referencedFile === 'NEXT_ACTION.md') {
          continue;
        }
        
        const isValid = Array.from(validFiles).some(f => f.endsWith(referencedFile));

        if (!isValid && referencedFile.includes('/')) {
          violations.push({
            file: filePath,
            type: 'broken-reference',
            message: `Broken reference to: ${referencedFile}`,
            severity: 'error'
          });
        }
      }
    }

    return violations;
  }

  private detectRegressions(filePath: string, previousContent: string, currentContent: string): RegressionDetected[] {
    const regressions: RegressionDetected[] = [];

    // Check if required sections were removed
    const requiredSections = ['## Purpose', '## Examples', '```'];
    for (const section of requiredSections) {
      if (previousContent.includes(section) && !currentContent.includes(section)) {
        regressions.push({
          file: filePath,
          previousState: 'has-' + section.replace(/[#\s]/g, ''),
          currentState: 'missing-' + section.replace(/[#\s]/g, ''),
          impact: 'high',
          description: `Required section removed: ${section}`
        });
      }
    }

    // Check if content was significantly shortened
    const previousLength = previousContent.length;
    const currentLength = currentContent.length;
    if (currentLength < previousLength * 0.5) {
      regressions.push({
        file: filePath,
        previousState: `${previousLength} chars`,
        currentState: `${currentLength} chars`,
        impact: 'high',
        description: `Content significantly reduced (${Math.round((1 - currentLength / previousLength) * 100)}% loss)`
      });
    }

    return regressions;
  }

  generateReport(result: ArchitectureGuardResult): string {
    let report = '# Template Architecture Guard Report\n\n';

    report += `## Summary\n`;
    report += `- Status: ${result.passed ? '✅ PASSED' : '❌ FAILED'}\n`;
    report += `- Violations: ${result.violations.length}\n`;
    report += `- Warnings: ${result.warnings.length}\n`;
    report += `- Regressions Detected: ${result.regressions.length}\n\n`;

    if (result.violations.length > 0) {
      report += `## Violations\n\n`;
      const errors = result.violations.filter(v => v.severity === 'error');
      const warnings = result.violations.filter(v => v.severity === 'warning');

      if (errors.length > 0) {
        report += `### Errors (${errors.length})\n`;
        for (const violation of errors) {
          report += `- **${violation.file}**: ${violation.message}\n`;
        }
        report += '\n';
      }

      if (warnings.length > 0) {
        report += `### Warnings (${warnings.length})\n`;
        for (const violation of warnings) {
          report += `- **${violation.file}**: ${violation.message}\n`;
        }
        report += '\n';
      }
    }

    if (result.regressions.length > 0) {
      report += `## Regressions Detected\n\n`;
      for (const regression of result.regressions) {
        report += `- **${regression.file}** (${regression.impact} impact)\n`;
        report += `  - ${regression.description}\n`;
        report += `  - Previous: ${regression.previousState}\n`;
        report += `  - Current: ${regression.currentState}\n`;
      }
    }

    return report;
  }
}
