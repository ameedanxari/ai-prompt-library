import type { DeliveryChangePolicy } from './lifecycle.js';
/** Outcome delivery v1. Paths are relative to projectRoot unless explicitly noted. */
export type DeliveryStage = 'plan' | 'execute' | 'advance' | 'release';
export type EvidenceKind = 'execution' | 'recovery' | 'image' | 'consumer' | 'operation' | 'evaluation' | 'render' | 'production-integration' | 'design-review';
export interface FileBinding { path: string; sha256: string }
export interface SourceInput extends FileBinding { id: string }
/** Stored in a sourceInputs JSON file, not inferred from implementer-supplied gates. */
export interface RequirementRecord {
  id: string;
  description: string;
  sourceRefs: string[];
  explicit: boolean;
  nonWaivable: boolean;
  releaseRequired: boolean;
  /** Optional exact train membership; `*` denotes a shared non-waivable release duty. */
  releaseScopeId?: string;
  surfaceIds: string[];
  checks: { id: string; kind: 'success' | 'recovery'; description: string }[];
}
export interface DesignContract {
  surfaceId: string;
  sourceRefs: string[];
  criteria: {
    id: string;
    dimension: 'intent' | 'composition' | 'hierarchy' | 'responsive' | 'typography' | 'imagery' | 'interaction';
    sourceRef: string;
    sourceLocation: string;
    expectation: string;
    /** Every applicable surface outcome must be covered or explicitly excluded by source. */
    applicability: {
      outcomeIds: string[];
      exclusions: { outcomeId: string; sourceRef: string; sourceLocation: string; reason: string }[];
    };
  }[];
  contexts: { id: string; viewport: string; theme: string }[];
}
export interface DesignComparison {
  schemaVersion: 2;
  comparisons: {
    criterionId: string;
    contextId: string;
    imageEvidenceId?: string;
    observation: string;
    result: 'pass' | 'fail' | 'not-applicable' | 'unverified';
  }[];
  /** A reviewer judges the composed experience separately from criterion/token compliance. */
  experience: {
    contextId: string;
    imageEvidenceId?: string;
    result: 'pass' | 'fail' | 'unverified';
    observedStrengths: string[];
    contraryEvidence: string[];
    rationale: string;
    blockingFindings: string[];
  }[];
}
export interface DeliveryLifecycle {
  stage: 'pre-launch' | 'live';
  dataPolicy: 'disposable' | 'retain';
  sourceRef: string;
  sourceLocation: string;
  /** Explicitly source-authorized disposable targets; never an instruction to perform a reset. */
  resetTargetIds: string[];
}
export interface RequirementDocument { schemaVersion: 1; originalSources: FileBinding[]; requirements: RequirementRecord[]; designs?: DesignContract[]; lifecycle?: DeliveryLifecycle }
export interface DeliveryTarget {
  id: string;
  environment: string;
  providerMode: 'real' | 'controlled' | 'fake';
  bindings: FileBinding[];
  /** Volatile deployment/build identity; never a semantic scope change. */
  revision?: string;
  /** Reviewed shared dependencies. Omit for conservative whole-surface invalidation. */
  sharedPaths?: string[];
  /** Native: OS/device. SDK: consumer/version. Data/ML: input/evaluation set. */
  identity: Record<string, string>;
}
export interface DeliverySurface {
  id: string;
  kind: 'web' | 'native' | 'desktop' | 'api' | 'sdk' | 'cli' | 'automation' | 'data' | 'ml' | 'infrastructure' | 'document' | 'media';
  entryPoint: string;
  target: DeliveryTarget;
}
export interface DeliveryOutcome {
  id: string;
  /** Must match every authoritative requirement when train mapping is used. */
  releaseScopeId?: string;
  /** Reviewed route/consumer dependencies, combined with target.sharedPaths. */
  bindingPaths?: string[];
  requirementIds: string[];
  actor: string;
  entryPoint: string;
  surfaceId: string;
  applicability: 'applicable' | 'excluded';
  applicabilityReason: string;
  releaseRequired: boolean;
  requiredEvidenceKinds: EvidenceKind[];
  checks: { id: string; kind: 'success' | 'recovery'; description: string }[];
  dependencies: { outcomeId: string; kind: 'technical' | 'accepted' }[];
  decisionId?: string;
}
export interface DeliveryUnit {
  id: string;
  /** Version 2: applicable planning nodes, including prerequisite closure. */
  planningNodeIds?: string[];
  outcomeIds: string[];
  acceptance: string;
  affectedPaths: string[];
  dependsOn: string[];
}
export interface DeliverySlice {
  id: string;
  kind: 'proof' | 'delivery';
  outcomeIds: string[];
  /** Version 2 first proof only: retained outcomes awaiting bounded executable detail.
   * These outcomes have no units yet and prevent proof/slice acceptance. */
  deferredOutcomeIds?: string[];
  units: DeliveryUnit[];
  /** Paths relative to runDirectory. Every detailed document must be listed. */
  detailedFiles: string[];
  acceptanceDecisionId?: string;
  /** Cumulative owner and independent duties may require separate receipts. */
  acceptanceDecisionIds?: string[];
}
export interface DeliveryEvidence {
  id: string;
  outcomeId: string;
  checkId: string;
  kind: EvidenceKind;
  targetId: string;
  targetDigest: string;
  /** Immutable target semantics, excluding source file hashes; required for carry-forward. */
  targetContextDigest?: string;
  snapshotDigest: string;
  /** Semantic source/dependency identity, excluding only target.revision. */
  reviewDigest?: string;
  artifact: FileBinding;
  command: string;
  observedResult: string;
  observedAt: string;
  result: 'pass' | 'fail';
  /** UI captures identify the actual composed state, not a component catalogue. */
  capture?: { surfaceId: string; state: 'entry' | 'success' | 'recovery'; viewport: string; theme?: string; route?: string; composed: boolean };
  consumer?: string;
  productionComposition: boolean;
  releaseCandidate?: string;
}
export interface DeliveryDecision {
  id: string;
  /** Present only on a review of a named release train. */
  releaseScopeId?: string;
  kind: 'scope-review' | 'acceptance' | 'scope-change' | 'budget-extension' | 'carry-forward' | 'design-review' | 'release-review' | 'unit-completion';
  /** Budget retirement only; never accepts a slice or outcome. */
  unitId?: string;
  outcomeIds: string[];
  scopeDigest: string;
  /** Raw artifacts, canonical full evidence records and reviewed plan content. */
  artifactDigests: string[];
  reviewer: { id: string; contextId: string; role: 'owner' | 'independent' | 'agent' };
  /** `owner-attested` is a recorded owner chat confirmation, distinct from host
   * authentication; it carries `attestation` and only covers scope review. */
  provenance: { kind: 'owner-message' | 'review-session' | 'external' | 'owner-attested'; reference: string; attestation?: OwnerAttestation };
  result: 'approved' | 'rejected';
  reason: string;
  /** Scope-change: exact requirement IDs excluded. */
  requirementIds?: string[];
  /** Carry-forward: evidence IDs explicitly inspected for reuse. */
  evidenceIds?: string[];
  budget?: { maxUnits: number; maxWords: number; maxBytes: number; maxSlices: number };
}
/** Written only after explicit owner confirmation in chat: the verbatim reply,
 * its timestamp and the scope digest it confirms (the reply repeats its prefix). */
export interface OwnerAttestation { quote: string; messageAt: string; scopeDigest: string }
/** Exact retained user instruction, authenticated by the configured host. A
 * producer-authored quote or an inferred permission is insufficient. */
export interface DeliveryAuthorizationInstruction {
  source: FileBinding;
  quote: string;
  sourceLocation: string;
  messageAt: string;
  reference: string;
  stopAfter: 'planning' | 'none';
}
export interface AuthorizationBinding {
  runId: string;
  sourceInputs: SourceInput[];
  outcomeIds: string[];
  policy: Omit<DeliveryManifest['authorization'], 'instruction'>;
}
export interface TrustedAuthorizationProvider {
  verify(instruction: Readonly<DeliveryAuthorizationInstruction>, binding: Readonly<AuthorizationBinding>): boolean;
}
export interface DeliveryManifest {
  schemaVersion: 1 | 2;
  kind: 'outcome-delivery';
  runId: string;
  scopeRevision: number;
  /** Relative to the run directory; resolver canonicalizes and confines paths. */
  projectRoot: string;
  sourceInputs: SourceInput[];
  /** Version 2: exact bindings for planning-integrity.json and review-findings.json. */
  planningInputs?: FileBinding[];
  surfaces: DeliverySurface[];
  authorization: {
    execution: boolean;
    checkpoints: 'every-slice' | 'autonomous';
    designAcceptance: 'owner' | 'independent' | 'agent';
    scopeChange: 'owner' | 'agent-applicability';
    independentReview: boolean;
    implementerContextId: string;
    instruction?: DeliveryAuthorizationInstruction;
  };
  planningBudget: {
    /** Scan roots relative to projectRoot; include every location retaining pending detail. */
    corpusRoots: string[];
    /** Concise ledger files only; validator independently caps and inspects them. */
    ledgerFiles: string[];
    extensionDecisionId?: string;
    observedTokens?: number;
    reviewRounds: number;
    reworkUnits: number;
  };
  outcomes: DeliveryOutcome[];
  slices: DeliverySlice[];
  activeSlice: string;
  nextSlice?: string;
  firstProofSlice: string;
  evidenceRefs: DeliveryEvidence[];
  decisionRefs: DeliveryDecision[];
  releaseCandidate?: string;
}
export interface DeliveryScope {
  runDirectory: string;
  projectRoot: string;
  manifest: DeliveryManifest;
  activeFiles: string[];
}
export interface ReviewBinding {
  scopeDigest: string;
  releaseScopeId?: string;
  /** Raw artifacts, canonical full evidence records and reviewed plan content. */
  artifactDigests: string[];
  outcomeIds: string[];
}
/** Host-owned trust boundary. Resolve the receipt in a trusted source and inspect
 * its original actor/context, decision and bindings. Never trust manifest fields
 * or a local model-authored receipt as authentication. CLI has no such provider. */
export interface TrustedReviewProvider {
  verify(decision: Readonly<DeliveryDecision>, binding: Readonly<ReviewBinding>): boolean;
}
export interface DeliveryValidationOptions {
  stage: DeliveryStage;
  /** Release only; omission validates the complete original union. */
  releaseScopeId?: string;
  trustedReviewProvider?: TrustedReviewProvider;
  trustedAuthorizationProvider?: TrustedAuthorizationProvider;
  /** Host policy, never producer-controlled manifest state. Defaults to true
   * when an authorization provider is configured. */
  requireAuthenticatedAuthorization?: boolean;
  /** Host recomputes canonical task projections from active files and compares exact bytes. */
  trustedProjectionProvider?: { verify(filePath: string, content: Buffer): boolean };
  now?: Date;
}
export interface DeliveryReport {
  releaseScopeId?: string;
  planningIntegrity?: { assessed: boolean; blockers: { code: string; target: string; message: string }[]; warnings: string[] };
  changePolicies?: Record<string, DeliveryChangePolicy>;
  /** How original-source scope approval was established for this report. */
  scopeReview?: { approved: boolean; provenance: 'authenticated' | 'owner-attested' | 'none'; missingRoles: ('owner' | 'independent' | 'agent')[] };
  authorization?: { provenance: 'host-authenticated' | 'legacy-explicit' | 'unverified'; reversibleExecution: boolean; ordinaryTransitions: boolean; planningStop: boolean };
  valid: boolean;
  stage: DeliveryStage;
  issues: string[];
  metrics: { pendingWords: number; pendingBytes: number; pendingUnits: number; pendingSlices: number; reviewRounds: number; reworkUnits: number; observedTokens?: number };
  completion: { planReady: boolean; proofAccepted: boolean; sliceAccepted: boolean; releaseReady: boolean; acceptedOutcomeIds: string[]; designAcceptedOutcomeIds: string[]; technicallyVerifiedOutcomeIds: string[]; excludedOutcomeIds: string[]; staleOutcomeIds: string[] };
}
