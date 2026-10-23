import { readFileSync, existsSync, statSync } from 'fs';
import { join } from 'path';

export interface TemplateStructure {
  hasRequiredBrief: boolean;
  hasOptionalFields: boolean;
  servesAsReadme: boolean;
  hasProjectBriefSection: boolean;
  hasOptionalConfigSection: boolean;
  hasReferenceAssetsSection: boolean;
  hasDryRunOption: boolean;
  hasGettingStartedSection: boolean;
  hasSystemCapabilitiesSection: boolean;
}

/**
 * Shared per-template content shape used by the domain validators.
 *
 * Renamed from the byte-identical `TemplateContent` interfaces that were
 * copy-pasted into fintech-template-validator.ts and healthcare-template-validator.ts
 * (two same-named exports = latent duplicate-identifier crash the moment both
 * modules are re-exported from one barrel). Domain validators that need extra
 * fields declare their own interfaces; the generic ten-field shape lives here.
 */
export interface BaseTemplateContent {
  hasPurposeSection: boolean;
  hasContextSection: boolean;
  hasImplementationPatterns: boolean;
  hasConfigurationParameters: boolean;
  hasIntegrationPoints: boolean;
  hasImplementationChecklist: boolean;
  hasSuccessMetrics: boolean;
  hasCodeExamples: boolean;
  hasSecurityConsiderations: boolean;
  hasComplianceGuidelines: boolean;
}

export class TemplateValidator {
  private templateContent: string;
  /**
   * Module directory this validator operates on. Subclasses pass their
   * `prompts/modules/<domain>` directory to `super()` and use the protected
   * helpers below; the legacy single-file behaviour (validateStructure) is
   * preserved when a file path is given instead.
   */
  protected readonly moduleDir: string;

  constructor(templatePath: string) {
    this.moduleDir = templatePath;
    this.templateContent = '';
    // Historical behaviour: read a single template FILE for validateStructure().
    // A directory path (subclass use) is never read as content.
    try {
      if (templatePath && existsSync(templatePath) && statSync(templatePath).isFile()) {
        this.templateContent = readFileSync(templatePath, 'utf-8');
      }
    } catch {
      this.templateContent = '';
    }
  }

  validateStructure(): TemplateStructure {
    // Ignore illustrative markdown inside code fences when identifying form fields.
    const content = this.templateContent.replace(/```[\s\S]*?```/g, '');
    const headings = [...content.matchAll(/^##[ \t]+(.+?)[ \t]*$/gm)].map(match => match[1].trim());
    const section = (pattern: RegExp): boolean => headings.some(heading => pattern.test(heading));
    const required = headings.filter(heading => /\([^)]*\brequired\b[^)]*\)/i.test(heading));
    const brief = section(/^brief\b/i);
    const optional = /\boptional\b/i.test(content);
    const config = section(/(?:tech(?:nical)? preferences|optional config)/i);
    const references = section(/reference (?:material|assets)|external material|existing source/i);
    const platforms = section(/platforms|delivery targets/i);
    const constraints = section(/constraints/i);
    const roles = section(/users|roles|outcomes/i);
    const exclusions = section(/restrict|scope exclusions|non-goals/i);
    const gettingStarted = /(?:save(?: this file)? as|minimum you must do|getting started|quick start)/i.test(content);
    const proof = section(/first proof|acceptance|dry[- ]run/i) || /\bdry[- ]run\b/i.test(content);
    const capabilities = section(/system capabilities|defaults the library/i) || (platforms && constraints);
    const title = /^#[ \t]+My Project[ \t]*$/mi.test(content);

    return {
      hasRequiredBrief: brief && required.length === 1 && /^brief\b/i.test(required[0]),
      hasOptionalFields: optional && config && references && platforms && constraints && roles && exclusions,
      servesAsReadme: title && gettingStarted && brief && optional,
      hasProjectBriefSection: brief,
      hasOptionalConfigSection: config,
      hasReferenceAssetsSection: references,
      hasDryRunOption: proof,
      hasGettingStartedSection: gettingStarted,
      hasSystemCapabilitiesSection: capabilities,
    };
  }

  /**
   * Matches a `## <name>` markdown heading, case-insensitively.
   *
   * The section name is intentionally treated as a regex fragment: callers
   * pass patterns like `'Core.*Patterns'` to match headings such as
   * `## Core Security Patterns`. This preserves the exact behaviour of the
   * per-validator copies this method replaces.
   *
   * DECISION (item 12a): case-insensitive `## Purpose` / `## Context` matching
   * is now uniform across all 22 domain validators. fintech/healthcare used
   * case-sensitive `content.includes('## Purpose')`; the other 20 used this
   * case-insensitive form. Agent-written markdown varies in case
   * (`## purpose`, `## PURPOSE`), and a case-sensitive check rejects valid
   * templates for a typographic accident, so case-insensitive wins.
   */
  protected hasSection(content: string, sectionName: string): boolean {
    const sectionRegex = new RegExp(`##\\s*${sectionName}`, 'i');
    return sectionRegex.test(content);
  }

  /**
   * A template "has code examples" when it contains a fenced code block OR a
   * TypeScript-ish code signature (interface/class/function).
   *
   * DECISION (item 12b): the majority OR behaviour is now uniform.
   * fintech/healthcare required fence AND (typescript|interface); the other 19
   * accepted fence OR. The AND form was over-strict: a fenced JSON/YAML config
   * example or a bare `interface Foo` declaration is still a code example, so
   * requiring both rejected valid templates.
   */
  protected hasCodeExamples(content: string): boolean {
    const codeBlockRegex = /```[\s\S]*?```/;
    const interfaceRegex = /interface\s+\w+/;
    const classRegex = /class\s+\w+/;
    const functionRegex = /function\s+\w+|async\s+function\s+\w+/;

    return codeBlockRegex.test(content) ||
      interfaceRegex.test(content) ||
      classRegex.test(content) ||
      functionRegex.test(content);
  }

  /**
   * Detects TypeScript data-model declarations (interface/class/enum/type).
   * Identical copies of this helper existed in 13 domain validators.
   */
  protected hasDataModels(content: string): boolean {
    const dataModelPatterns = [
      /interface\s+\w+/g,
      /class\s+\w+/g,
      /enum\s+\w+/g,
      /type\s+\w+\s*=/g
    ];

    return dataModelPatterns.some(pattern => pattern.test(content));
  }

  /**
   * Shared ten-field per-template content check with the three uniform
   * behaviours from item 12 (case-insensitive sections, OR code examples).
   * Used by the fintech/healthcare validators, whose `TemplateContent`
   * interfaces were byte-identical to this shape.
   */
  protected validateBaseTemplateContent(content: string): BaseTemplateContent {
    const lowerContent = content.toLowerCase();

    return {
      hasPurposeSection: this.hasSection(content, 'Purpose'),
      hasContextSection: this.hasSection(content, 'Context'),
      hasImplementationPatterns: lowerContent.includes('implementation') && lowerContent.includes('pattern'),
      hasConfigurationParameters: this.hasSection(content, 'Configuration') ||
        this.hasSection(content, 'Variables'),
      hasIntegrationPoints: lowerContent.includes('integration') && (lowerContent.includes('example') || lowerContent.includes('point')),
      hasImplementationChecklist: lowerContent.includes('checklist') || lowerContent.includes('guideline'),
      hasSuccessMetrics: lowerContent.includes('metric') || lowerContent.includes('monitoring'),
      hasCodeExamples: this.hasCodeExamples(content),
      hasSecurityConsiderations: lowerContent.includes('security') && (lowerContent.includes('consideration') || lowerContent.includes('requirement')),
      hasComplianceGuidelines: lowerContent.includes('compliance') || lowerContent.includes('regulatory')
    };
  }

  /**
   * Reads a template file, returning null when it does not exist or is not a
   * file (replaces the per-validator `readTemplate` copies).
   */
  protected readTemplate(templatePath: string): string | null {
    try {
      if (existsSync(templatePath) && statSync(templatePath).isFile()) {
        return readFileSync(templatePath, 'utf-8');
      }
    } catch {
      // fall through to null
    }
    return null;
  }

  /**
   * File-existence check for a template path (replaces the per-validator
   * `templateExists` copies).
   */
  protected templateExists(templatePath: string): boolean {
    try {
      return existsSync(templatePath) && statSync(templatePath).isFile();
    } catch {
      return false;
    }
  }

  /**
   * Resolves a template filename against this validator's module directory.
   */
  protected resolveTemplate(filename: string): string {
    return join(this.moduleDir, filename);
  }

  /**
   * Template-method: returns true when every template file that exists passes
   * `check` against its content. Replaces the repeated
   * `templates.filter(exists).every(...)` loops in the domain validators.
   */
  protected everyExistingTemplate(templates: string[], check: (content: string) => boolean): boolean {
    return templates
      .filter(template => this.templateExists(this.resolveTemplate(template)))
      .every(template => check(this.readTemplate(this.resolveTemplate(template)) ?? ''));
  }

  /**
   * Generic empty-content factory: an object with every listed field false,
   * typed as the caller's content interface. Replaces the 22 hand-written
   * `getEmptyTemplateContent()` all-false literals.
   */
  protected getEmptyContent<T>(fields: (keyof T & string)[]): T {
    const result: Record<string, boolean> = {};
    for (const field of fields) {
      result[field] = false;
    }
    return result as T;
  }

  // Validate that template meets all requirements from 1.1, 1.3, 1.5
  validateRequirements(): {
    requirement_1_1: boolean; // Brief as only required field
    requirement_1_3: boolean; // Comprehensive optional fields for power users
    requirement_1_5: boolean; // Serves dual purpose as README and input form
  } {
    const structure = this.validateStructure();

    return {
      requirement_1_1: structure.hasRequiredBrief,
      requirement_1_3: structure.hasOptionalFields,
      requirement_1_5: structure.servesAsReadme
    };
  }
}
