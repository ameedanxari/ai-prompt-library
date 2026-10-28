# Planning quality advisory API

`assessPlanningQuality(input)` and `assessPlanningTrial(input)` are pure calculations for the workflow in [planning-quality.md](planning-quality.md). They do not read files, authenticate evidence, authorize execution or change delivery acceptance. Use the package root's exported functions and types.

```ts
import { assessPlanningQuality, type PlanningQualityInput } from 'ai-prompt-library';

const input: PlanningQualityInput = {
  executionAuthorized: false, // true only when actual current authority exists
  nodes: [{
    id: 'manual-response', dependsOn: [], complete: false, authorized: false,
    blockers: ['Client must provide sender identity'],
    elapsedHours: { min: 6, max: 8 }, ownerDelayHours: { min: 1, max: 2 },
    ownerTouchpoints: 1,
  }],
  work: [
    { id: 'build-response', nodeId: 'manual-response', role: 'engineer', kind: 'build', hours: { min: 4, max: 6 } },
    { id: 'review-response', nodeId: 'manual-response', role: 'owner', kind: 'review', hours: { min: 1, max: 1 } },
    { id: 'capture-response', nodeId: 'manual-response', role: 'engineer', kind: 'evidence', hours: { min: 1, max: 1 } },
    { id: 'coordinate-response', nodeId: 'manual-response', role: 'lead', kind: 'coordination', hours: { min: 1, max: 1 } },
    { id: 'integrate-response', nodeId: 'manual-response', role: 'engineer', kind: 'integration', hours: { min: 0, max: 0 } },
    { id: 'recover-response', nodeId: 'manual-response', role: 'engineer', kind: 'recovery', hours: { min: 1, max: 2 } },
  ],
  milestones: [{
    id: 'concierge-demo', nodeIds: ['manual-response'], deadlineHours: 16,
    roleAvailability: { engineer: { min: 8, max: 8 }, owner: { min: 2, max: 2 }, lead: { min: 2, max: 2 } },
    ownerTouchpointAvailability: 2,
  }],
  openDecisionIds: ['sender'],
  ownerBrief: [{
    id: 'sender', question: 'Which office address should customer emails show?',
    options: ['Registered office', 'Operating office'], recommendation: 'Registered office',
    deadline: 'Before customer email', blocks: ['Customer email'],
  }],
  mindmapLeaves: [{ id: 'leaf-response', nodeId: 'manual-response' }],
};
const result = assessPlanningQuality(input);
// valid: true; executableNow: []; blocked includes authority and sender input.
// Milestone labor: engineer 6–9h, owner 1h, lead 1h; elapsed path: 7–10h.
// Engineer labor has an upper-range availability risk, reported in advisories.
```

`valid` means the typed planning relationships/arithmetic declarations pass these checks; it does not mean feasible, approved or ready. Read **both** `issues` and `advisories`. Known capacity/deadline excesses and range risks produce advisories and set `provisional`, rather than changing delivery authority. Unknowns also set that flag; no missing hours become a commitment.

Each distinct activity has one globally unique work ID, one node, one role and one kind. Split multi-role activities into disjoint labor portions with separate IDs. Across each milestone closure, declare build, review, evidence, coordination, integration and recovery once where the work occurs; aggregate process nodes or estimates are allowed. Do not repeat six mechanical zero rows per node. Use an explicit milestone-level zero only when a category is inapplicable. A category absent from the entire closure or containing a null range remains provisional and its total is null. A node with no work estimate at all also remains provisional; known component totals then exclude that unknown contribution. Duplicate activity IDs are invalid, but the API cannot detect the same real work hidden behind two different IDs. Include reserve once as disjoint recovery activity; never add an aggregate reserve that repeats included recovery. Effort is labor, not elapsed time.

Node `elapsedHours` is the elapsed work duration **excluding** separately recorded `ownerDelayHours`; the estimate includes its workload, staffing and parallelism assumptions. Both are required ranges or explicit unknown (`null`); do not derive them mechanically from labor totals. All elapsed durations, deadlines and role availability use one planning horizon starting at kickoff. Completed nodes still count toward original milestone labor/path; this is not a remaining-work forecast. Owner delays belong once on their actual node. A milestone includes the transitive dependency closure of its node IDs; shared work and touchpoints count once. Critical path is maximum predecessor path plus the node duration and owner delay. This is a dependency lower-bound calculation without resource leveling: parallel paths may compete for the same role, so per-role availability is checked independently and staffing assumptions still require review. Milestone budgets are cumulative, not additional intervals to sum across milestones.

Cycles, unknown nodes/dependencies, duplicate IDs, negative/nonfinite/reversed ranges and incomplete decision records are invalid. Invalid input returns no executable list or milestone calculations. An executable unit must be incomplete, explicitly authorized both globally and individually, have no listed blockers, and have every direct dependency recorded complete. The caller supplies truthful authority and completion; this API cannot discover an omitted input or authenticate an approval. `blocked` retains each reason so the owner brief can name the next concrete unblocker. No arbitrary single dependency is falsely presented as the only action required.

Every open decision ID must appear in the owner brief with a question, at least two nonempty options, recommendation, deadline and nonempty affected product areas. IDs may also include decided entries. A small internal-word heuristic emits a wording advisory only; passing it does not prove plain language, source fidelity, sensible options, one-page length or semantic completeness. Each planning node must appear in exactly one mindmap leaf; unknown, duplicate or missing mappings are invalid. The caller renders the milestone-first roadmap; this checks its leaf mapping rather than generating a diagram or judging its meaning.

## Fresh planning trial protocol

Before generation, freeze original sources, owner answers, library revision, starting state, producer prompt, hidden rubric and budget. Retain hash-bound records and timestamps; a frozen library-revision record can contain the actual Git commit rather than pretending its SHA-1 is a SHA-256 file hash. The producer receives original inputs and library instructions in a fresh context. Prior plans/findings, the hidden rubric, or a generator that supplies requirements/estimates/dependencies/scope contaminate the cold start. Generic serialization is allowed. Use a distinct reviewer against the prewritten rubric, retain actual producer invocation/output, and record first-pass failures, repairs, elapsed work and review rounds. See [planning-quality.md](planning-quality.md) for semantic grading and matched delivered comparisons.

```ts
import { assessPlanningTrial, type PlanningTrialInput } from 'ai-prompt-library';

// Each hash below is a SHA-256 of a retained record/file, not its filename.
const trial: PlanningTrialInput = {
  frozenAt: '2026-10-28T08:00:00Z', generatedAt: '2026-10-28T09:00:00Z',
  frozen: {
    sources: sourceRecordHash, ownerAnswers: answerRecordHash,
    libraryRevision: revisionRecordHash, startingState: startingStateRecordHash,
    producerPrompt: promptHash, hiddenRubric: rubricHash, budget: budgetRecordHash,
  },
  producerInvocationHash: invocationHash, outputHash: outputHash,
  producerContextId: 'fresh-producer', reviewerContextId: 'distinct-reviewer',
  priorGeneratedMaterialProvided: false, rubricProvidedToProducer: false,
  generatorSuppliedPlanningContent: false, evaluationStage: 'planning',
};
const trialReport = assessPlanningTrial(trial);
```

The report classifies complete declarations as `cold-start-candidate`, contaminated declarations as `assisted`, and missing/malformed hash records, non-distinct reviewers or invalid freeze order as `invalid`. A candidate is not authenticated provenance: `provenanceAuthenticated` is always false. The timestamps and flags are supplied by the caller; actual records need independent inspection. `evidenceScope` echoes the declared planning/delivered stage, and `superiorityEstablished` is always false, including for a declared delivered trial. A planning-only evaluation supports planning evidence, not time/cost/quality superiority. Follow the existing matched delivered-comparison API for comparative claims; evaluate a materially different second brief before generalizing.

Focused regression command: `npm test -- tests/unit-tests/planning-quality.test.ts`. Run `npm run typecheck` after API changes.
