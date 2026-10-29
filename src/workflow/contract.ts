/** The only new-run authority. Reports, task files and checkpoints are derived. */
export type Status = 'pass' | 'fail' | 'pending' | 'unassessed' | 'not-applicable';
export type Role = 'owner' | 'independent' | 'agent';
export type Action = 'read' | 'local-write' | 'live-write' | 'deploy' | 'send' | 'spend' | 'delete';
export type EvidenceKind = 'execution' | 'consumer' | 'image' | 'operation' | 'build' | 'test' | 'document';
export type ReviewPurpose = 'scope' | 'semantic' | 'design' | 'decision' | 'release';
export interface FileBinding { path: string; sha256: string }
export interface SourceRef { sourceId: string; locator: string }
export interface Source { id: string; binding: FileBinding; authority: 'user' | 'contract' | 'reference'; inspection: 'complete' | 'partial' | 'unread' }
export interface Requirement { id: string; description: string; sourceRefs: SourceRef[]; criterionIds: string[]; releaseIds: string[]; mandatory: boolean }
export interface Target {
  id: string;
  kind: 'web' | 'native' | 'desktop' | 'api' | 'sdk' | 'cli' | 'automation' | 'data' | 'ml' | 'infrastructure' | 'document' | 'media';
  identity: Record<string, string> | null;
  environment: 'local' | 'staging' | 'production' | 'unknown';
  providerMode: 'real' | 'controlled' | 'fake' | 'unknown';
  revision: string | null;
  bindings: FileBinding[];
  lifecycle: { stage: 'pre-launch' | 'live' | 'unknown'; dataPolicy: 'disposable' | 'retain' | 'unknown'; sourceRef: SourceRef | null };
}
export interface Capture { state: 'entry' | 'success' | 'recovery'; context: string; composed: boolean }
export interface Criterion {
  id: string;
  description: string;
  scenario: 'success' | 'recovery';
  targetId: string;
  evidenceKinds: EvidenceKind[];
  inputs: FileBinding[];
  productionRequired: boolean;
  /** Every declared composed state/context must have an actual image observation. */
  captures?: Capture[];
  /** A substantive test check must collect at least one real test. */
  minimumCollected?: number;
}
export type Prerequisite =
  | { kind: 'resource'; id: string }
  | { kind: 'decision'; id: string }
  | { kind: 'work'; id: string }
  | { kind: 'outcome'; id: string };
export interface Work {
  id: string;
  title: string;
  outcomeIds: string[];
  criterionIds: string[];
  targetIds: string[];
  action: Action;
  inputs: Prerequisite[];
  files: string[];
  /** Only active work is detailed. Empty means retained, deferred work. */
  instructions: string;
  estimate?: { hours: [number, number] | null; role: string; ownerDelayHours: [number, number] | null; ownerTouchpoints: number | null };
}
export interface Resource {
  id: string;
  description: string;
  kind: 'access' | 'input' | 'authority';
  targetId: string;
  status: 'available' | 'missing' | 'unknown';
  sourceRefs: SourceRef[];
  /** Optional preparation work; availability still needs an actual host receipt. */
  producedBy?: string[];
  /** Host-owned receipt, not an implementer assertion of access. */
  reference?: string;
  binding?: FileBinding;
}
export interface Decision {
  id: string;
  description: string;
  sourceRefs: SourceRef[];
  producedBy: string[];
  inputs: Prerequisite[];
  requiredRoles: Role[];
}
export interface Outcome { id: string; title: string; requirementIds: string[]; criterionIds: string[]; targetId: string; inputs: Prerequisite[] }
export interface Release { id: string; title: string; outcomeIds: string[]; sharedCriterionIds: string[]; sourceRefs: SourceRef[]; inputs: Prerequisite[] }
export interface Instruction { sourceId: string; locator: string; quote: string; reference: string; issuedAt: string }
export interface AuthorityGrant { id: string; targetIds: string[]; actions: Action[]; sourceRef: SourceRef; reference: string }
export interface CheckpointAcknowledgment {
  proofFingerprint: string;
  instruction: { source: FileBinding; locator: string; quote: string; reference: string; issuedAt: string };
}
export interface Policy {
  instruction: Instruction;
  execution: 'plan-only' | 'reversible';
  checkpoints: 'every-proof' | 'autonomous';
  implementerId: string;
  implementerContextId: string;
  reviews: { scope: Role[]; semantic: Role[]; design: Role[]; release: Role[] };
  grants: AuthorityGrant[];
  budget: { maxActiveWork: number; maxDetailBytes: number };
  checkpointAcknowledgment?: CheckpointAcknowledgment;
}
export interface EvidenceBinding { runId: string; criterionId: string; targetId: string; fingerprint: string }
export interface Evidence {
  id: string;
  criterionId: string;
  targetId: string;
  kind: EvidenceKind;
  fingerprint: string;
  artifact: FileBinding;
  command: string;
  observedAt: string;
  result: 'pass' | 'fail';
  observer: { id: string; contextId: string; reference: string };
  production: boolean;
  consumer?: string;
  capture?: Capture;
  test?: { format: 'vitest-json' | 'junit'; collected: number; failed: number; exitCode: number };
}
export interface ReviewRequest { purpose: ReviewPurpose; subjectIds: string[] }
export interface ReviewBinding extends ReviewRequest { runId: string; fingerprint: string }
export interface Judgment extends ReviewRequest {
  id: string;
  fingerprint: string;
  result: 'approved' | 'rejected';
  reviewer: { id: string; contextId: string; role: Role };
  reference: string;
  observedAt: string;
  observations: string[];
  findings: { id: string; severity: 'P0' | 'P1' | 'P2' | 'P3'; criterionIds: string[]; message: string }[];
}
export interface RunContract {
  schemaVersion: 3;
  kind: 'canonical-workflow';
  runId: string;
  revision: number;
  /** Portable project-relative root, resolved by the caller, never trusted as an absolute path. */
  projectRoot: string;
  sources: Source[];
  requirements: Requirement[];
  targets: Target[];
  criteria: Criterion[];
  outcomes: Outcome[];
  work: Work[];
  resources: Resource[];
  decisions: Decision[];
  releases: Release[];
  policy: Policy;
  proofOutcomeIds: string[];
  activeWorkIds: string[];
  capacity?: { period: string; hours: number; roles: { role: string; hours: number }[]; ownerTouchpoints: number | null; sourceRefs: SourceRef[] };
  evidence: Evidence[];
  judgments: Judgment[];
}
export interface Diagnostic { code: string; subject: string; message: string; causes?: string[] }
export interface CheckResult extends Diagnostic { status: Status; evidenceIds?: string[]; judgmentIds?: string[] }
export interface GateResult { status: Status; checks: CheckResult[] }
export type Boundary =
  | { kind: 'plan-reviewable' | 'plan-reviewed' | 'proof' }
  | { kind: 'work-executable' | 'work-verified' | 'outcome' | 'decision' | 'release'; id: string };
export interface TrustedHost {
  verifyAuthorization(instruction: Readonly<Instruction>, binding: Readonly<{ runId: string; fingerprint: string }>): boolean;
  verifyGrant?(grant: Readonly<AuthorityGrant>, binding: Readonly<{ runId: string; fingerprint: string }>): boolean;
  verifyCheckpoint?(acknowledgment: Readonly<CheckpointAcknowledgment>, binding: Readonly<{ runId: string; proofFingerprint: string; fingerprint: string }>): boolean;
  verifyResource?(resource: Readonly<Resource>, binding: Readonly<{ runId: string; fingerprint: string }>): boolean;
  verifyEvidence(evidence: Readonly<Evidence>, binding: Readonly<EvidenceBinding>): boolean;
  verifyJudgment(judgment: Readonly<Judgment>, binding: Readonly<ReviewBinding>): boolean;
}
export interface EvaluationContext { projectRoot: string; host?: TrustedHost; now?: Date }
export interface RunAssessment {
  runId: string;
  revision: number;
  integrity: GateResult;
  planReviewable: GateResult;
  planReviewed: GateResult;
  proof: GateResult;
  work: Record<string, { executable: GateResult; verified: GateResult }>;
  decisions: Record<string, GateResult>;
  outcomes: Record<string, GateResult>;
  releases: Record<string, GateResult>;
  executableNow: string[];
}
export interface ReviewPlan {
  action: 'review' | 'reuse' | 'blocked';
  binding: ReviewBinding;
  missingRoles: Role[];
  judgmentIds: string[];
  prerequisites: GateResult;
}
