import * as fs from 'node:fs';
import type { AuthorizationBinding, DeliveryScope, DeliveryValidationOptions } from './types.js';
import { confined, sha256 } from './manifest.js';
import { readDeliveryRequirements } from './validation.js';

export function deliveryAuthorizationBinding(scope: DeliveryScope): AuthorizationBinding {
  const { instruction: _instruction, ...policy } = scope.manifest.authorization;
  return { runId: scope.manifest.runId, sourceInputs: scope.manifest.sourceInputs, outcomeIds: scope.manifest.outcomes.map(o => o.id).sort(), policy };
}

/** The host requires authenticated instructions when configured. Without a
 * strict host policy, existing manifests retain explicit legacy authorization;
 * adding an instruction always requires its authentication. */
export function deliveryAuthorizationProblem(scope: DeliveryScope, options: Pick<DeliveryValidationOptions, 'trustedAuthorizationProvider' | 'requireAuthenticatedAuthorization' | 'now'> = {}): string | undefined {
  const instruction = scope.manifest.authorization.instruction;
  if (!instruction) return (options.requireAuthenticatedAuthorization ?? !!options.trustedAuthorizationProvider) ? 'host policy requires an authenticated source-bound user instruction' : undefined;
  try {
    if (!readDeliveryRequirements(scope).originalSources.some(source => source.path === instruction.source.path && source.sha256 === instruction.source.sha256)) return 'user instruction must bind a retained original source';
    const content = fs.readFileSync(confined(scope.projectRoot, instruction.source.path));
    if (sha256(content) !== instruction.source.sha256 || !content.toString('utf8').includes(instruction.quote)) return 'retained user instruction is stale or does not contain the exact quote';
    const at = Date.parse(instruction.messageAt);
    if (!Number.isFinite(at) || at > (options.now ?? new Date()).getTime() + 60_000) return 'user instruction timestamp is invalid or in the future';
    if (options.trustedAuthorizationProvider?.verify(instruction, deliveryAuthorizationBinding(scope)) !== true) return 'actual user instruction and policy require host authentication';
  } catch { return 'actual user instruction and policy require current source and host authentication'; }
  return undefined;
}

/** Workflow permission only. This does not grant scope/design acceptance or
 * authority to publish, spend, reset data, or operate a live system. */
export function getDeliveryExecutionPolicy(scope: DeliveryScope, options: Pick<DeliveryValidationOptions, 'trustedAuthorizationProvider' | 'requireAuthenticatedAuthorization' | 'now'> = {}) {
  const a = scope.manifest.authorization;
  const problem = deliveryAuthorizationProblem(scope, options);
  const planningStop = a.instruction?.stopAfter === 'planning';
  const reversibleExecution = !problem && a.execution && !planningStop;
  return {
    provenance: (problem ? 'unverified' : a.instruction ? 'host-authenticated' : 'legacy-explicit') as 'host-authenticated' | 'legacy-explicit' | 'unverified',
    reversibleExecution,
    ordinaryTransitions: reversibleExecution && a.checkpoints === 'autonomous',
    planningStop,
    ownerDesignAcceptance: a.designAcceptance === 'owner',
    ownerScopeChange: a.scopeChange === 'owner',
    consequentialActions: false as const,
    ...(problem ? { problem } : {}),
  };
}
