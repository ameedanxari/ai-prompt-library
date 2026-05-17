/**
 * Dialogue Manager
 *
 * Orchestrates structured conversations with the user to refine
 * ambiguous intent, resolve missing information, and confirm decisions.
 *
 * Validates: Requirements 1.3, 13.2, 13.3
 */

import { ParsedIntent } from './intent-parser';

/**
 * A single dialogue turn
 */
export interface DialogueTurn {
  role: 'system' | 'user';
  message: string;
  timestamp: Date;
}

/**
 * A question the system needs answered
 */
export interface ClarificationRequest {
  id: string;
  question: string;
  options?: string[];
  required: boolean;
  context: string;
  response?: string;
}

/**
 * State of the ongoing dialogue
 */
export interface DialogueState {
  turns: DialogueTurn[];
  pendingClarifications: ClarificationRequest[];
  resolvedClarifications: ClarificationRequest[];
  confidence: number;
  complete: boolean;
}

export class DialogueManager {
  private state: DialogueState = {
    turns: [],
    pendingClarifications: [],
    resolvedClarifications: [],
    confidence: 0,
    complete: false
  };

  /**
   * Starts a new dialogue from a parsed intent
   */
  public async startDialogue(intent: ParsedIntent): Promise<ClarificationRequest[]> {
    this.state.turns.push({
      role: 'user',
      message: intent.raw,
      timestamp: new Date()
    });

    const clarifications = this.generateClarifications(intent);
    this.state.pendingClarifications = clarifications;
    this.state.confidence = intent.confidence;

    return clarifications;
  }

  /**
   * Processes a user response to a clarification
   */
  public async processResponse(clarificationId: string, response: string): Promise<ClarificationRequest[]> {
    const idx = this.state.pendingClarifications.findIndex(c => c.id === clarificationId);
    if (idx === -1) throw new Error(`Clarification ${clarificationId} not found`);

    const clarification = this.state.pendingClarifications.splice(idx, 1)[0];
    clarification.response = response;
    this.state.resolvedClarifications.push(clarification);

    this.state.turns.push({ role: 'user', message: response, timestamp: new Date() });
    this.state.confidence = Math.min(1, this.state.confidence + 0.1);

    if (this.state.pendingClarifications.length === 0) {
      this.state.complete = true;
    }

    return this.state.pendingClarifications;
  }

  /**
   * Returns the current dialogue state
   */
  public getState(): DialogueState {
    return { ...this.state };
  }

  /**
   * Checks if the dialogue has enough information to proceed
   */
  public isReady(): boolean {
    const requiredPending = this.state.pendingClarifications.filter(c => c.required);
    return requiredPending.length === 0 && this.state.confidence >= 0.7;
  }

  private generateClarifications(intent: ParsedIntent): ClarificationRequest[] {
    const clarifications: ClarificationRequest[] = [];

    if (intent.confidence < 0.6) {
      clarifications.push({
        id: 'clarify-scope',
        question: 'Can you describe the main features you expect?',
        required: true,
        context: 'Low confidence in intent parsing'
      });
    }

    if (intent.category === 'feature') {
      clarifications.push({
        id: 'clarify-auth',
        question: 'Does this project require user authentication?',
        options: ['Yes – email/password', 'Yes – OAuth / social', 'No'],
        required: false,
        context: 'Authentication strategy'
      });
    }

    return clarifications;
  }
}
