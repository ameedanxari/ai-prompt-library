/**
 * User Experience Metrics Validation
 *
 * Validates prompt understanding accuracy, time to production,
 * user satisfaction proxies, learning curve, and feature completeness.
 *
 * Validates: User experience success metrics from design
 */

import { describe, it, expect } from 'vitest';
import { DefaultIntentParser } from '../../src/intent/intent-parser';
import { DialogueManager } from '../../src/intent/dialogue-manager';
import { UserExperienceValidator } from '../../src/validation/user-experience-validator';

describe('User Experience Metrics', () => {
  it('intent parser should correctly classify feature requests', async () => {
    const parser = new DefaultIntentParser();

    const feature = await parser.parseIntent('Build a dashboard with charts');
    expect(feature.category).toBe('feature');

    const fix = await parser.parseIntent('Fix the login bug');
    expect(fix.category).toBe('fix');

    const deploy = await parser.parseIntent('Deploy to production');
    expect(deploy.category).toBe('deployment');
  });

  it('dialogue manager should generate clarifications for low-confidence input', async () => {
    const dm = new DialogueManager();
    const parser = new DefaultIntentParser();

    const intent = await parser.parseIntent('do something');
    // Override confidence to simulate low confidence
    intent.confidence = 0.3;

    const clarifications = await dm.startDialogue(intent);
    expect(clarifications.length).toBeGreaterThan(0);
    expect(clarifications.some(c => c.required)).toBe(true);
  });

  it('UX validator should pass all checks', async () => {
    const validator = new UserExperienceValidator();
    const result = await validator.validate();

    expect(result.passed).toBe(true);
    expect(result.overallScore).toBeGreaterThanOrEqual(80);
  });

  it('dialogue manager should reach ready state after resolving clarifications', async () => {
    const dm = new DialogueManager();
    const parser = new DefaultIntentParser();

    const intent = await parser.parseIntent('Build a social app');
    intent.confidence = 0.75;

    await dm.startDialogue(intent);

    // Should be ready when confidence is high and no required clarifications
    // (the default feature clarification is not required)
    expect(dm.isReady()).toBe(true);
  });
});
