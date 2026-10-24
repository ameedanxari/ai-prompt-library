import * as fs from 'node:fs';
import * as path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { deliveryDesignReviewBinding, deliveryScopeDigest } from '../../src/delivery/index.js';
import type { DesignComparison, DeliveryDecision } from '../../src/delivery/index.js';
import { createDeliveryFixture as fixture, deliveryFixtureRoots } from './delivery-fixture.js';

afterEach(() => { for (const root of deliveryFixtureRoots.splice(0)) fs.rmSync(root, { recursive: true, force: true }); });
type Fixture = ReturnType<typeof fixture>;
function sourceChanged(f: Fixture) {
  f.manifest.sourceInputs[0] = { id: 'brief-requirements', ...f.write('requirements.json', JSON.stringify(f.requirements)) };
  f.reviewScope();
}
function changeComparison(f: Fixture, mutate: (report: DesignComparison) => void) {
  const e = f.manifest.evidenceRefs.find(e => e.kind === 'design-review')!;
  const report = JSON.parse(fs.readFileSync(path.join(f.root, e.artifact.path), 'utf8')) as DesignComparison;
  mutate(report); e.artifact = f.write(e.artifact.path, JSON.stringify(report));
}

/** Fixture pixels stand for retained captures; semantic aesthetics is the trusted reviewer's duty. */
describe('source-bound early design proof', () => {
  it('fails closed for old visual contracts without design authority/criteria', () => {
    const f = fixture('web'); delete f.requirements.designs; sourceChanged(f);
    expect(f.validate('plan').issues.join(' ')).toContain('needs source-bound design criteria before planning');
  });
  it.each(['intent','composition','hierarchy','responsive'])('rejects omitted %s intent even with token criteria', dimension => {
    const f = fixture('web'); f.requirements.designs![0].criteria.find(c => c.dimension === dimension)!.dimension = 'typography'; sourceChanged(f);
    expect(f.validate('plan').issues.join(' ')).toContain(`missing ${dimension} criterion`);
  });
  it('requires retained original design authority, source locations and phone/desktop contexts', () => {
    const f = fixture('web'); f.requirements.designs![0].sourceRefs = ['not-retained.md']; sourceChanged(f);
    expect(f.validate('execute').valid).toBe(false);
    f.requirements.designs![0].sourceRefs = ['design.md']; f.requirements.designs![0].criteria[0].sourceLocation = ''; sourceChanged(f);
    expect(f.validate().valid).toBe(false);
    f.requirements.designs![0].criteria[0].sourceLocation = 'line 1'; f.requirements.designs![0].contexts = [f.requirements.designs![0].contexts[1]]; sourceChanged(f);
    expect(f.validate().issues.join(' ')).toContain('phone and desktop');
  });
  it('does not merely list an authoritative design document while omitting its criteria', () => {
    const f = fixture('web');
    f.requirements.originalSources.push(f.write('mobile-design.md', 'Keep mobile plan comparisons compact and visibly comparable.'));
    f.requirements.designs![0].sourceRefs.push('mobile-design.md'); sourceChanged(f);
    expect(f.validate('plan').issues.join(' ')).toContain('every declared design source needs a comparison criterion');
    f.requirements.designs![0].criteria.find(c => c.dimension === 'responsive')!.sourceRef = 'mobile-design.md'; sourceChanged(f);
    expect(f.validate('plan').valid).toBe(true);
  });
  it('does not accept valid screenshots and generic approval as doc-to-design comparison', () => {
    const f = fixture('web'); f.reviewScope(); f.evidence(); f.manifest.evidenceRefs = f.manifest.evidenceRefs.filter(e => e.kind !== 'design-review'); f.accept();
    const r = f.validate('advance'); expect(r.completion.technicallyVerifiedOutcomeIds).toEqual(['O1']); expect(r.completion.designAcceptedOutcomeIds).toEqual([]); expect(r.completion.proofAccepted).toBe(false); expect(r.valid).toBe(false);
  });
  it('rejects legacy comparisons until experience and applicability are explicitly migrated', () => {
    const f = fixture('web'); f.reviewScope(); f.evidence();
    changeComparison(f, r => { (r as unknown as { schemaVersion: number }).schemaVersion = 1; });
    f.accept(); expect(f.validate('advance').issues.join(' ')).toContain('explicitly migrate legacy comparisons');
    delete (f.requirements.designs![0].criteria[0] as { applicability?: unknown }).applicability;
    sourceChanged(f); expect(f.validate('plan').issues.join(' ')).toContain('migrate legacy design criteria explicitly');
  });
  it('requires experience review even when every source criterion and token passes', () => {
    const f = fixture('web'); f.reviewScope(); f.evidence();
    changeComparison(f, r => { delete (r as Partial<DesignComparison>).experience; }); f.accept();
    const report = f.validate('advance');
    expect(report.completion.technicallyVerifiedOutcomeIds).toEqual(['O1']);
    expect(report.completion.designAcceptedOutcomeIds).toEqual([]);
    expect(report.issues.join(' ')).toContain('separate composed experience verdict');
  });
  it.each(['fail', 'unverified', 'blocking'])('blocks a generic or uncertain experience despite passing criterion rows: %s', result => {
    const f = fixture('web'); f.reviewScope(); f.evidence();
    changeComparison(f, r => {
      expect(r.comparisons.every(c => c.result === 'pass')).toBe(true);
      const e = r.experience[0];
      e.observedStrengths = ['The declared palette and type scale are present.'];
      e.contraryEvidence = ['The stacked uniform cards obscure the primary comparison and the documented material character.'];
      e.rationale = 'The composed entry reads as a generic dashboard; token matches do not deliver the intended experience.';
      if (result === 'blocking') e.blockingFindings = ['Restore the intended hierarchy and material composition before acceptance.'];
      else e.result = result as 'fail' | 'unverified';
    }); f.accept();
    const report = f.validate('advance');
    expect(report.completion.technicallyVerifiedOutcomeIds).toEqual(['O1']);
    expect(report.completion.designAcceptedOutcomeIds).toEqual([]);
    expect(report.issues.join(' ')).toContain('rejected or unverified composed experience');
  });
  it.each(['missing', 'duplicate', 'unknown', 'no-strengths', 'no-rationale'])('requires complete, specific experience records: %s', mutation => {
    const f = fixture('web'); f.reviewScope(); f.evidence();
    changeComparison(f, r => {
      if (mutation === 'missing') r.experience.pop();
      if (mutation === 'duplicate') r.experience[1] = { ...r.experience[0] };
      if (mutation === 'unknown') r.experience[0].contextId = 'never-captured';
      if (mutation === 'no-strengths') r.experience[0].observedStrengths = [];
      if (mutation === 'no-rationale') r.experience[0].rationale = '';
    }); f.accept(); expect(f.validate('advance').completion.designAcceptedOutcomeIds).toEqual([]);
  });
  it.each(['criterion', 'experience'])('preserves uncaptured %s states as unverified, never accepted proof', area => {
    const f = fixture('web'); f.reviewScope(); f.evidence();
    changeComparison(f, r => {
      const row = area === 'criterion' ? r.comparisons[0] : r.experience[0];
      row.result = 'unverified'; delete row.imageEvidenceId;
    }); f.accept();
    expect(f.validate('advance').completion.designAcceptedOutcomeIds).toEqual([]);
    changeComparison(f, r => { (area === 'criterion' ? r.comparisons[0] : r.experience[0]).result = 'pass'; }); f.accept();
    expect(f.validate('advance').completion.designAcceptedOutcomeIds).toEqual([]);
  });
  it('requires explicit source authority for optional N/A criteria and preserves core applicability', () => {
    const f = fixture('web');
    f.requirements.originalSources[1] = f.write('design.md', 'Warm family-home materials; clear hierarchy, restrained composition and compact mobile comparison.\nO1 is text-only: imagery is not applicable to this comparison.');
    const criterion = { ...f.requirements.designs![0].criteria[0], id: 'imagery', dimension: 'imagery' as const, expectation: 'The documented imagery exception applies only to this text comparison.', applicability: { outcomeIds: [] as string[], exclusions: [{ outcomeId: 'O1', sourceRef: 'design.md', sourceLocation: 'line 2: imagery exception', reason: 'This outcome is explicitly text-only under the documented direction.' }] } };
    f.requirements.designs![0].criteria.push(criterion); sourceChanged(f); f.evidence();
    changeComparison(f, r => { for (const c of r.comparisons.filter(c => c.criterionId === 'imagery')) { c.result = 'not-applicable'; c.observation = criterion.applicability.exclusions[0].reason; delete c.imageEvidenceId; } }); f.accept();
    expect(f.validate('advance').valid).toBe(true);
    criterion.applicability.exclusions[0].sourceLocation = ''; sourceChanged(f);
    expect(f.validate('plan').issues.join(' ')).toContain('exclusion needs retained source authority');
  });
  it.each(['intent','composition','hierarchy','responsive'])('cannot use N/A authority to remove core %s from an applicable outcome', dimension => {
    const f = fixture('web'); const c = f.requirements.designs![0].criteria.find(c => c.dimension === dimension)!;
    c.applicability = { outcomeIds: [], exclusions: [{ outcomeId: 'O1', sourceRef: 'design.md', sourceLocation: 'line 1', reason: 'Claimed applicability exception' }] }; sourceChanged(f);
    expect(f.validate('plan').issues.join(' ')).toContain(`needs applicable ${dimension} criterion`);
  });
  it('does not allow a reviewer to mark an applicable criterion N/A without source authority', () => {
    const f = fixture('web'); f.reviewScope(); f.evidence();
    changeComparison(f, r => { r.comparisons[0].result = 'not-applicable'; delete r.comparisons[0].imageEvidenceId; }); f.accept();
    expect(f.validate('advance').issues.join(' ')).toContain('applicable criteria cannot be marked not-applicable');
  });
  it('requires applicability for every outcome and rejects unknown or contradictory outcome scopes', () => {
    const f = fixture('web');
    f.manifest.outcomes.push({ ...f.manifest.outcomes[0], id: 'O2', entryPoint: '/compare' }); sourceChanged(f);
    expect(f.validate('plan').issues.join(' ')).toContain('needs explicit applicability for outcome O2');
    for (const c of f.requirements.designs![0].criteria) c.applicability.outcomeIds.push('O2'); sourceChanged(f);
    expect(f.validate('plan').valid).toBe(true);
    const c = f.requirements.designs![0].criteria[0]; c.applicability.outcomeIds.push('unknown'); sourceChanged(f);
    expect(f.validate('plan').issues.join(' ')).toContain('unknown/nonapplicable outcome');
    c.applicability.outcomeIds.pop(); c.applicability.exclusions.push({ outcomeId: 'O1', sourceRef: 'design.md', sourceLocation: 'line 1', reason: 'Contradictory exception' }); sourceChanged(f);
    expect(f.validate('plan').issues.join(' ')).toContain('must not overlap');
  });
  it('requires a distinct trusted design decision, not only functional acceptance', () => {
    const f = fixture('web'); f.reviewScope(); f.evidence(); f.accept(); f.manifest.decisionRefs = f.manifest.decisionRefs.filter(d => d.kind !== 'design-review');
    expect(f.validate('advance').completion.designAcceptedOutcomeIds).toEqual([]);
  });
  it.each(['missing-context','duplicate','unknown-criterion','missing-image','rejected','empty-observation'])('rejects incomplete/dishonest comparison: %s', mutation => {
    const f = fixture('web'); f.reviewScope(); f.evidence();
    changeComparison(f, r => {
      if (mutation === 'missing-context') r.comparisons = r.comparisons.filter(c => c.contextId !== 'phone');
      if (mutation === 'duplicate') r.comparisons[1] = { ...r.comparisons[0] };
      if (mutation === 'unknown-criterion') r.comparisons[0].criterionId = 'tokens-look-good';
      if (mutation === 'missing-image') r.comparisons[0].imageEvidenceId = 'not-captured';
      if (mutation === 'rejected') r.comparisons[0].result = 'fail';
      if (mutation === 'empty-observation') r.comparisons[0].observation = '';
    });
    f.accept(); expect(f.validate('advance').valid).toBe(false); expect(f.validate('advance').completion.designAcceptedOutcomeIds).toEqual([]);
  });
  it.each(['route','viewport','theme','composed','surface','state'])('requires the actual intended composition: %s', field => {
    const f = fixture('web'); f.reviewScope(); f.evidence(); const image = f.manifest.evidenceRefs.find(e => e.id.includes('-design-phone-'))!;
    if (field === 'route') image.capture!.route = '/component-gallery';
    if (field === 'viewport') image.capture!.viewport = '1440x900';
    if (field === 'theme') image.capture!.theme = 'dark';
    if (field === 'composed') image.capture!.composed = false;
    if (field === 'surface') image.capture!.surfaceId = 'other';
    if (field === 'state') image.capture!.state = 'success';
    f.accept(); expect(f.validate('advance').valid).toBe(false);
  });
  it('requires authentic independent provenance and rejects implementer self-review', () => {
    const f = fixture('web'); f.reviewScope(); f.evidence(); f.accept();
    expect(f.validate('advance', false).valid).toBe(false);
    const d = f.manifest.decisionRefs.find(d => d.kind === 'design-review')!;
    f.manifest.decisionRefs = f.manifest.decisionRefs.filter(x => x.id !== d.id);
    d.reviewer.contextId = f.manifest.authorization.implementerContextId;
    f.trust(d, deliveryDesignReviewBinding(f.scope(), ['O1']));
    expect(f.validate('advance').completion.designAcceptedOutcomeIds).toEqual([]);
  });
  it('does not erase a trusted current rejection with a generic success or competing approval', () => {
    const f = fixture('web'); f.reviewScope(); f.evidence(); f.accept();
    const binding = deliveryDesignReviewBinding(f.scope(), ['O1']);
    const rejected: DeliveryDecision = { id: 'owner-reject', kind: 'design-review', ...binding, reviewer: { id: 'owner', contextId: 'owner-message', role: 'owner' }, provenance: { kind: 'owner-message', reference: 'trusted://reject' }, result: 'rejected', reason: 'The rendered design misses documented warmth and compact comparison' };
    f.trust(rejected, binding); f.accept();
    expect(f.validate('advance').completion.proofAccepted).toBe(false);
    f.write('runs/current/tasks-proof.md', 'premature-detail '.repeat(1500)); expect(f.validate('plan').issues.join(' ')).toContain('before expanding detailed planning');
  });
  it('unlocks only the bounded journey plan after design proof, without claiming functional success', () => {
    const f = fixture('web'); f.reviewScope(); f.evidence();
    f.manifest.evidenceRefs = f.manifest.evidenceRefs.filter(e => e.kind === 'design-review' || e.capture?.state === 'entry');
    f.write('runs/current/tasks-proof.md', 'work '.repeat(1500));
    expect(f.validate('execute').issues.join(' ')).toContain('exceeds 1200');
    f.acceptDesign(); expect(f.validate('execute').valid).toBe(true);
    f.write('runs/current/tasks-proof.md', 'work '.repeat(1800));
    const r = f.validate('execute'); expect(r.valid).toBe(true); expect(r.completion.designAcceptedOutcomeIds).toEqual(['O1']); expect(r.completion.proofAccepted).toBe(false); expect(r.completion.technicallyVerifiedOutcomeIds).toEqual([]);
    expect(f.validate('advance').valid).toBe(false);
  });
  it('caps pre-design units and refuses budget extensions that bypass the design boundary', () => {
    const f = fixture('web'); f.reviewScope();
    for (let i = 2; i <= 3; i++) f.manifest.slices[0].units.push({ ...f.manifest.slices[0].units[0], id: `tasks-proof.md#T${i}`, affectedPaths: [`part-${i}.ts`] });
    f.manifest.planningBudget.extensionDecisionId = 'extension'; f.reviewScope();
    const binding = { scopeDigest: deliveryScopeDigest(f.manifest), outcomeIds: ['O1'], artifactDigests: [...new Set([...f.manifest.sourceInputs, ...f.requirements.originalSources].map(s => s.sha256))].sort() };
    f.trust({ id: 'extension', kind: 'budget-extension', ...binding, reviewer: { id: 'reviewer', contextId: 'review-context', role: 'independent' }, provenance: { kind: 'review-session', reference: 'trusted://extension' }, result: 'approved', reason: 'A larger implementation dependency needs a bounded exception for this plan', budget: { maxUnits: 9, maxWords: 9000, maxBytes: 72000, maxSlices: 2 } }, binding);
    expect(f.validate('execute').issues.join(' ')).toContain('pending units exceeds 2');
  });
  it('invalidates design acceptance on raw authority, criterion or rendered source changes', () => {
    for (const change of ['raw-doc','criterion','code']) {
      const f = fixture('web'); f.reviewScope(); f.evidence(); f.accept(); expect(f.validate('advance').valid).toBe(true);
      if (change === 'raw-doc') { f.requirements.originalSources[1] = f.write('design.md', 'New authoritative design intent and updated compact mobile comparison.'); sourceChanged(f); }
      if (change === 'criterion') { f.requirements.designs![0].criteria[0].expectation = 'Changed documented expectation'; sourceChanged(f); }
      if (change === 'code') { f.manifest.surfaces[0].target.bindings[0] = f.write('app.ts', 'export const changedComposition = true;'); f.reviewScope(); }
      expect(f.validate('advance').completion.designAcceptedOutcomeIds).toEqual([]);
      expect(f.validate('advance').completion.proofAccepted).toBe(false);
    }
  });
  it('does not carry visual evidence across changed design intent', () => {
    const f = fixture('web'); f.reviewScope(); f.evidence(); f.accept();
    f.requirements.designs![0].criteria[0].expectation = 'New approved direction'; sourceChanged(f);
    // Even new design approval cannot turn old screenshots into a fresh comparison.
    f.acceptDesign(); expect(f.validate('advance').valid).toBe(false);
    f.evidence(); f.accept(); expect(f.validate('release').valid).toBe(true);
  });
  it('accepts current design plus functional proof and preserves headless budgets', () => {
    const f = fixture('web'); f.reviewScope(); f.evidence(); f.accept(); const r = f.validate('release'); expect(r.issues).toEqual([]); expect(r.completion.designAcceptedOutcomeIds).toEqual(['O1']); expect(r.completion.releaseReady).toBe(true);
    const api = fixture('api'); api.write('runs/current/tasks-proof.md', 'headless-work '.repeat(1800)); api.reviewScope(); expect(api.validate('execute').valid).toBe(true); expect(api.validate().completion.designAcceptedOutcomeIds).toEqual([]);
  });
});
