import type { DeliveryManifest } from './types.js';
export type ReviewPurpose = 'scope-review' | 'design-review' | 'acceptance' | 'release-review';
export function requiredReviewRoles(authorization: DeliveryManifest['authorization'], kind: ReviewPurpose): ('owner' | 'independent' | 'agent')[] {
  const roles = new Set<'owner' | 'independent' | 'agent'>();
  if (kind === 'scope-review' || kind === 'design-review') roles.add(authorization.designAcceptance);
  if (kind === 'acceptance' && (authorization.checkpoints === 'every-slice' || authorization.designAcceptance === 'owner')) roles.add('owner');
  if (authorization.independentReview || authorization.designAcceptance === 'independent') roles.add('independent');
  if (kind === 'release-review' && authorization.designAcceptance === 'owner') roles.add('owner');
  if (roles.has('independent')) roles.delete('agent');
  if (!roles.size) roles.add('agent');
  return [...roles];
}

export function reviewRoleSatisfies(actual: 'owner' | 'independent' | 'agent', required: 'owner' | 'independent' | 'agent'): boolean {
  return required === 'agent' || actual === required;
}
