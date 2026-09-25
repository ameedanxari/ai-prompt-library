/**
 * Integration test for the `./validators` package subpath (item 14).
 *
 * Imports every validator through the `src/validators/index.ts` barrel (the
 * same entry the published `./validators` export maps to) and runs each one
 * against its REAL template fixtures under `prompts/modules/<domain>`.
 * This proves the barrel is wired and the validators work end-to-end on real
 * content after the item-12 collapse onto the shared base class.
 */
import { describe, it, expect } from 'vitest';
import { readdirSync } from 'node:fs';
import { join } from 'node:path';

import * as validators from '../../src/validators/index.js';

const domains: Array<[domain: string, moduleDir: string, className: string]> = [
  ['accessibility', 'prompts/modules/accessibility', 'AccessibilityTemplateValidator'],
  ['analytics', 'prompts/modules/analytics', 'AnalyticsTemplateValidator'],
  ['blockchain', 'prompts/modules/blockchain', 'BlockchainTemplateValidator'],
  ['commerce', 'prompts/modules/commerce', 'CommerceTemplateValidator'],
  ['content-management', 'prompts/modules/content-management', 'ContentManagementTemplateValidator'],
  ['data-processing', 'prompts/modules/data-processing', 'DataProcessingTemplateValidator'],
  ['deployment', 'prompts/modules/deployment', 'DeploymentTemplateValidator'],
  ['enterprise-saas', 'prompts/modules/enterprise-saas', 'EnterpriseSaaSTemplateValidator'],
  ['fintech', 'prompts/modules/fintech', 'FintechTemplateValidator'],
  ['gamification', 'prompts/modules/gamification', 'GamificationTemplateValidator'],
  ['healthcare', 'prompts/modules/healthcare', 'HealthcareTemplateValidator'],
  ['integration', 'prompts/modules/integration', 'IntegrationTemplateValidator'],
  ['iot', 'prompts/modules/iot', 'IoTTemplateValidator'],
  ['location-services', 'prompts/modules/location-services', 'LocationServicesTemplateValidator'],
  ['media-streaming', 'prompts/modules/media-streaming', 'MediaStreamingTemplateValidator'],
  ['notification', 'prompts/modules/notifications', 'NotificationTemplateValidator'],
  ['performance', 'prompts/modules/performance', 'PerformanceTemplateValidator'],
  ['real-time-communication', 'prompts/modules/real-time-communication', 'RealTimeCommunicationTemplateValidator'],
  ['search', 'prompts/modules/search-discovery', 'SearchTemplateValidator'],
  ['security', 'prompts/modules/security', 'SecurityTemplateValidator'],
  ['social', 'prompts/modules/social', 'SocialTemplateValidator'],
  ['testing-framework', 'prompts/modules/testing', 'TestingFrameworkTemplateValidator'],
];

const classNames = domains.map(([, , c]) => c);

describe('validators package subpath (item 14)', () => {
  it('the barrel exports all 22 validator classes and the shared base', () => {
    for (const name of classNames) {
      expect((validators as Record<string, unknown>)[name], name).toBeDefined();
    }
    expect((validators as Record<string, unknown>).TemplateValidator).toBeDefined();
    // (BaseTemplateContent is a type-only interface; nothing to assert at runtime.)
  });

  it.each(domains.map(([d]) => d))('%s: validator runs against its real fixtures', (domain) => {
    const [, moduleDir, className] = domains.find(([d]) => d === domain)!;
    const fixtures = readdirSync(moduleDir).filter(f => f.endsWith('.md'));
    expect(fixtures.length).toBeGreaterThan(0);

    const Ctor = (validators as Record<string, new (dir?: string) => {
      validateTemplateContent(p: string): {
        hasPurposeSection: boolean; hasContextSection: boolean; hasCodeExamples: boolean;
      };
    }>)[className];
    const validator = new Ctor(moduleDir);

    let purposeCount = 0;
    for (const fixture of fixtures) {
      const content = validator.validateTemplateContent(join(moduleDir, fixture));
      expect(typeof content.hasPurposeSection).toBe('boolean');
      expect(typeof content.hasContextSection).toBe('boolean');
      expect(typeof content.hasCodeExamples).toBe('boolean');
      if (content.hasPurposeSection) purposeCount++;
    }
    // Every domain ships real templates; at least one must have a purpose section.
    expect(purposeCount).toBeGreaterThan(0);
  });
});
