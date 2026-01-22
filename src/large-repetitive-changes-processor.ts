import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

export interface LargeChangeProtocolStructure {
  hasPurpose: boolean;
  hasWhenToUse: boolean;
  hasAntiPatterns: boolean;
  hasQuickStartProtocol: boolean;
  hasChecklistTemplate: boolean;
  hasWorkLoopGuidance: boolean;
  hasVerificationHeuristics: boolean;
  hasDecisionRules: boolean;
  hasLoggingSnippet: boolean;
  hasHandoffNotes: boolean;
}

export interface LargeChangeCapability {
  hasChecklistDrivenFlow: boolean;
  hasSmallBatchGuardrails: boolean;
  hasScopedVerification: boolean;
  hasLoggingGuidance: boolean;
  hasHandoffProtocol: boolean;
  hasBehaviorPreservation: boolean;
}

export class LargeRepetitiveChangesProcessor {
  private promptsPath: string;

  constructor(promptsPath: string = 'prompts/templates') {
    this.promptsPath = promptsPath;
  }

  private getContent(): string {
    const path = join(this.promptsPath, 'large-repetitive-changes.md');
    if (!existsSync(path)) return '';
    return readFileSync(path, 'utf-8');
  }

  validateProtocolStructure(): LargeChangeProtocolStructure {
    const content = this.getContent();

    return {
      hasPurpose: this.hasSection(content, 'Purpose'),
      hasWhenToUse: this.hasSection(content, 'When to Use'),
      hasAntiPatterns: this.hasSection(content, 'Anti-Patterns'),
      hasQuickStartProtocol: this.hasSection(content, 'Quick-Start Protocol'),
      hasChecklistTemplate: content.includes('| File/Area | Change | Status | Local Check | Notes |'),
      hasWorkLoopGuidance: content.includes('Work Loop') || content.includes('Batch Review'),
      hasVerificationHeuristics: this.hasSection(content, 'Verification Heuristics'),
      hasDecisionRules: this.hasSection(content, 'Decision Rules'),
      hasLoggingSnippet: this.hasSection(content, 'Minimal Logging Snippet'),
      hasHandoffNotes: this.hasSection(content, 'Handoff Notes')
    };
  }

  validateCapabilities(): LargeChangeCapability {
    const structure = this.validateProtocolStructure();
    const content = this.getContent().toLowerCase();

    return {
      hasChecklistDrivenFlow: structure.hasChecklistTemplate,
      hasSmallBatchGuardrails: content.includes('3-5') || content.includes('small batch') || content.includes('batch review'),
      hasScopedVerification: structure.hasVerificationHeuristics,
      hasLoggingGuidance: structure.hasLoggingSnippet,
      hasHandoffProtocol: structure.hasHandoffNotes,
      hasBehaviorPreservation: content.includes('preserve existing behavior') || content.includes('avoid new logic')
    };
  }

  validateRequirements(): {
    requirement_24_1: boolean; // Uses checklist and batching to manage large changes safely
    requirement_24_2: boolean; // Keeps changes localized and compiles after renames
    requirement_24_3: boolean; // Minimizes verification cost with scoped checks
    requirement_24_4: boolean; // Preserves existing behavior unless fixing a proven bug
    requirement_24_5: boolean; // Enables resumable, handoff-friendly workflow
  } {
    const structure = this.validateProtocolStructure();
    const capability = this.validateCapabilities();
    const content = this.getContent().toLowerCase();

    return {
      requirement_24_1: capability.hasChecklistDrivenFlow && capability.hasSmallBatchGuardrails,
      requirement_24_2: structure.hasWorkLoopGuidance && content.includes('sweep references'),
      requirement_24_3: capability.hasScopedVerification && (content.includes('cheap check') || content.includes('focused test')),
      requirement_24_4: capability.hasBehaviorPreservation,
      requirement_24_5: capability.hasHandoffProtocol && capability.hasChecklistDrivenFlow
    };
  }

  private hasSection(content: string, sectionName: string): boolean {
    const escapedName = sectionName.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
    const sectionRegex = new RegExp(`^##\\s+${escapedName}`, 'im');
    return sectionRegex.test(content);
  }
}
