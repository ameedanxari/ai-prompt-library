/**
 * Uniform-behavior tests for the 22 template validators (item 12).
 *
 * After the validator collapse, every domain validator extends the shared
 * `TemplateValidator` base and three previously-divergent behaviors are now
 * uniform. These tests pin those decisions with synthetic fixtures so they
 * cannot silently diverge again:
 *
 * (a) `## Purpose` / `## Context` matching is case-insensitive everywhere
 *     (was case-sensitive in fintech, healthcare, location-services).
 * (b) code-fence detection is the majority OR behavior — any fenced block
 *     counts (was fence AND language-keyword in fintech, healthcare,
 *     location-services).
 * (c) blockchain's stray `|| this.hasCodeExamples(content)` on the
 *     `hasConfigurationParameters` check was removed: a template with code
 *     examples but no Configuration/Variables section is NOT a template with
 *     documented configuration parameters.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

import { AccessibilityTemplateValidator } from '../../src/validators/accessibility-template-validator.js';
import { AnalyticsTemplateValidator } from '../../src/validators/analytics-template-validator.js';
import { BlockchainTemplateValidator } from '../../src/validators/blockchain-template-validator.js';
import { CommerceTemplateValidator } from '../../src/validators/commerce-template-validator.js';
import { ContentManagementTemplateValidator } from '../../src/validators/content-management-template-validator.js';
import { DataProcessingTemplateValidator } from '../../src/validators/data-processing-template-validator.js';
import { DeploymentTemplateValidator } from '../../src/validators/deployment-template-validator.js';
import { EnterpriseSaaSTemplateValidator } from '../../src/validators/enterprise-saas-template-validator.js';
import { FintechTemplateValidator } from '../../src/validators/fintech-template-validator.js';
import { GamificationTemplateValidator } from '../../src/validators/gamification-template-validator.js';
import { HealthcareTemplateValidator } from '../../src/validators/healthcare-template-validator.js';
import { IntegrationTemplateValidator } from '../../src/validators/integration-template-validator.js';
import { IoTTemplateValidator } from '../../src/validators/iot-template-validator.js';
import { LocationServicesTemplateValidator } from '../../src/validators/location-services-template-validator.js';
import { MediaStreamingTemplateValidator } from '../../src/validators/media-streaming-template-validator.js';
import { NotificationTemplateValidator } from '../../src/validators/notification-template-validator.js';
import { PerformanceTemplateValidator } from '../../src/validators/performance-template-validator.js';
import { RealTimeCommunicationTemplateValidator } from '../../src/validators/real-time-communication-template-validator.js';
import { SearchTemplateValidator } from '../../src/validators/search-template-validator.js';
import { SecurityTemplateValidator } from '../../src/validators/security-template-validator.js';
import { SocialTemplateValidator } from '../../src/validators/social-template-validator.js';
import { TestingFrameworkTemplateValidator } from '../../src/validators/testing-framework-template-validator.js';

// Every validator exposes validateTemplateContent(fullPath) returning an object
// with hasPurposeSection / hasContextSection / hasCodeExamples booleans.
type ContentProbe = {
  hasPurposeSection: boolean;
  hasContextSection: boolean;
  hasCodeExamples: boolean;
};
type AnyValidator = { validateTemplateContent(templatePath: string): ContentProbe };

const factories: Array<[string, (moduleDir: string) => AnyValidator]> = [
  ['accessibility', d => new AccessibilityTemplateValidator(d)],
  ['analytics', d => new AnalyticsTemplateValidator(d)],
  ['blockchain', d => new BlockchainTemplateValidator(d)],
  ['commerce', d => new CommerceTemplateValidator(d)],
  ['content-management', d => new ContentManagementTemplateValidator(d)],
  ['data-processing', d => new DataProcessingTemplateValidator(d)],
  ['deployment', d => new DeploymentTemplateValidator(d)],
  ['enterprise-saas', d => new EnterpriseSaaSTemplateValidator(d)],
  ['fintech', d => new FintechTemplateValidator(d)],
  ['gamification', d => new GamificationTemplateValidator(d)],
  ['healthcare', d => new HealthcareTemplateValidator(d)],
  ['integration', d => new IntegrationTemplateValidator(d)],
  ['iot', d => new IoTTemplateValidator(d)],
  ['location-services', d => new LocationServicesTemplateValidator(d)],
  ['media-streaming', d => new MediaStreamingTemplateValidator(d)],
  ['notification', d => new NotificationTemplateValidator(d)],
  ['performance', d => new PerformanceTemplateValidator(d)],
  ['real-time-communication', d => new RealTimeCommunicationTemplateValidator(d)],
  ['search', d => new SearchTemplateValidator(d)],
  ['security', d => new SecurityTemplateValidator(d)],
  ['social', d => new SocialTemplateValidator(d)],
  ['testing-framework', d => new TestingFrameworkTemplateValidator(d)],
];

let dir: string;

beforeAll(() => {
  dir = mkdtempSync(join(tmpdir(), 'validators-uniform-'));
  // Mixed-case headings (decision a) + a fenced block with NO language keyword
  // (decision b). Deliberately no Configuration/Variables section (decision c).
  writeFileSync(join(dir, 'mixed.md'), [
    '# Synthetic template',
    '',
    '## purpose',
    '',
    'Lowercase purpose heading.',
    '',
    '## CONTEXT',
    '',
    'Uppercase context heading.',
    '',
    '```',
    '{ "example": true }',
    '```',
    '',
  ].join('\n'));
  // A heading that only matches via the 'Core.*Patterns' regex fragment.
  writeFileSync(join(dir, 'patterns.md'), [
    '# Synthetic template',
    '',
    '## Core Security Patterns',
    '',
    'Content under a pattern-family heading.',
    '',
  ].join('\n'));
  // No headings at all, no fences.
  writeFileSync(join(dir, 'bare.md'), 'Just prose, nothing structural.\n');
});

afterAll(() => {
  rmSync(dir, { recursive: true, force: true });
});

describe('validators uniform behavior (item 12)', () => {
  it('all 22 validators exist in the suite', () => {
    expect(factories).toHaveLength(22);
  });

  it.each(factories)('%s: ## purpose / ## CONTEXT match case-insensitively (decision a)', (_name, make) => {
    const content = make(dir).validateTemplateContent(join(dir, 'mixed.md'));
    expect(content.hasPurposeSection).toBe(true);
    expect(content.hasContextSection).toBe(true);
  });

  it.each(factories)('%s: a fenced block without a language keyword counts as code examples (decision b)', (_name, make) => {
    const content = make(dir).validateTemplateContent(join(dir, 'mixed.md'));
    expect(content.hasCodeExamples).toBe(true);
  });

  it.each(factories)('%s: no fence means no code examples', (_name, make) => {
    const content = make(dir).validateTemplateContent(join(dir, 'bare.md'));
    expect(content.hasCodeExamples).toBe(false);
  });

  it.each(factories)('%s: missing Purpose/Context sections are not reported', (_name, make) => {
    const content = make(dir).validateTemplateContent(join(dir, 'bare.md'));
    expect(content.hasPurposeSection).toBe(false);
    expect(content.hasContextSection).toBe(false);
  });
});

describe('blockchain stray-OR removal (item 12c)', () => {
  it('code examples alone do not count as documented configuration parameters', () => {
    const validator = new BlockchainTemplateValidator(dir);
    const content = validator.validateTemplateContent(join(dir, 'mixed.md'));
    expect(content.hasCodeExamples).toBe(true);
    // The fixture has code examples but no ## Configuration / ## Variables section.
    expect((content as { hasConfigurationParameters: boolean }).hasConfigurationParameters).toBe(false);
  });
});

describe('hasSection treats the section name as a regex fragment (no escaping)', () => {
  // Commerce (and blockchain) deliberately pass patterns like 'Core.*Patterns'
  // to match headings such as `## Core Security Patterns`. The base helper
  // must NOT regex-escape the name, or those checks silently go false
  // (regression caught 2026-09-22: commerce property tests went red).
  it('commerce: ## Core Security Patterns matches the Core.*Patterns fragment', () => {
    const validator = new CommerceTemplateValidator(dir);
    const content = validator.validateTemplateContent(join(dir, 'patterns.md')) as {
      hasImplementationPatterns: boolean;
    };
    expect(content.hasImplementationPatterns).toBe(true);
  });

  it('base hasSection does not escape the section name', async () => {
    const { TemplateValidator } = await import('../../src/template-validator.js');
    class Probe extends TemplateValidator {
      probe(content: string, name: string): boolean {
        return this.hasSection(content, name);
      }
    }
    const probe = new Probe(dir);
    const content = '## Core Security Patterns\n';
    expect(probe.probe(content, 'Core.*Patterns')).toBe(true);
    expect(probe.probe(content, 'Security Patterns')).toBe(false);
    expect(probe.probe(content, 'core security patterns')).toBe(true); // case-insensitive
  });
});
