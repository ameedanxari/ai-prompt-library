# Canonical run model

Package version 2 uses `schemaVersion: 3`, `kind: "canonical-workflow"`. `run.json` is the only authored delivery authority. Sources and raw artifacts are retained files; ROADMAP.md, OWNER-BRIEF.md, WORK.md and STATUS.json are derived views. There is no second writable task contract or phase checkpoint. Resume an explicit project-relative run path, normally `prompts/outputs/runs/<run-id>/run.json`. Generated state must stay outside `.ai-prompts` and dependency directories; a package symlink is installed library content, not a run location.

[The plan-only example](examples/run.json) binds [its actual example request](examples/request.md). It has no runtime, evidence, judgments or real user approval. Its target identity remains unknown and implementation remains unauthorized. A valid model represents these limits; it does not need invented receipts to look complete.

## Facts to author

| Collection | Meaning and key fields |
| --- | --- |
| `sources` | `id`, file `binding: {path, sha256}`, `authority: user|contract|reference`, and `inspection: complete|partial|unread`. |
| `requirements` | Original obligation `description`, `sourceRefs: [{sourceId, locator}]`, mapped `criterionIds`, `releaseIds` and `mandatory`. |
| `targets` | Actual `kind`, nullable `identity`/`revision`, `environment`, `providerMode`, input `bindings`, and target-specific `lifecycle: {stage, dataPolicy, sourceRef}`. Unknowns stay unknown. |
| `criteria` | Observable `description`, `scenario: success|recovery`, owning `targetId`, required `evidenceKinds`, bound `inputs` and `productionRequired`. Optional composed `captures` declare state/context; substantive tests declare `minimumCollected`. |
| `outcomes` | Useful `title`, `requirementIds`, `criterionIds`, owning `targetId` and typed `inputs`. Include useful success and reachable recovery. |
| `work` | Cohesive `title`, affected outcome/criterion/target IDs, `action`, typed `inputs`, owned `files` and bounded `instructions`. Optional estimate names hours, role, owner delay and touchpoints; unknown estimates stay null. |
| `resources` | Missing/available/unknown `access|input|authority`, actual `targetId`, source references, optional preparation `producedBy` work IDs and binding/host receipt reference. Producer completion does not by itself prove resource availability. Status alone does not authenticate availability. |
| `decisions` | Question `description`, source references, `producedBy` work IDs, typed `inputs` and `requiredRoles`. The decision follows its producers. |
| `releases` | Selected original-scope boundary, `outcomeIds`, `sharedCriterionIds`, source references and typed `inputs`. Never relabel a partial boundary as full completion. |
| `policy` | Retained instruction, execution/checkpoint policy, implementer/context identity, required review roles, explicit grants and active-work/detail budget. Optional `checkpointAcknowledgment` retains a fresh user instruction bound to the exact accepted proof. |
| `evidence` / `judgments` | Append-only observations and assessment records with exact bindings and actual host-verifiable references. See [trust limits](evidence-and-review.md). |

Top-level `runId`, positive `revision`, project-relative `projectRoot`, `proofOutcomeIds` and `activeWorkIds` identify the run and current bounded proof/work. Optional `capacity` holds `period`, total `hours`, role/hour rows, nullable `ownerTouchpoints` and source references. It supplies planning assumptions rather than a guaranteed resource-leveled schedule. Every required collection is present; empty arrays are explicit absence. Unknown fields are rejected. Bindings use SHA-256 of actual nonempty bytes and paths confined to the selected project root. Work file paths name ownership, not proof that files already exist. Do not hash an unrelated document as if it were runtime composition.

A prerequisite such as `{ "kind": "resource", "id": "R1" }` selects one actual resource, decision, work or outcome. Inputs/access enable a producer, then accepted results enable consumers. A quote or inspection's completion decision must not gate its own producer. Cycles are invalid even across decisions and outcomes. Shared state/access/API choices can be retained in bound source/decision documents where needed; do not invent schema fields or maintain contradictory copied policies.

Policy execution is `plan-only|reversible`; checkpoints are `every-proof|autonomous`. Review purposes are `scope`, `semantic`, `design`, `decision`, `release`; role names are `owner`, `independent`, `agent`. Scope subjects are requirement IDs; semantic/design subjects are criterion IDs; decision/release subjects name their respective IDs. Actual authority and distinct reviewer provenance require the configured host. `plan-reviewed` means the required original-source scope judgment is current; it is neither global readiness nor execution authorization, design acceptance, useful proof or release. Outcome runs require an actual distinct independent duty for scope, semantic and release review; visual targets also require it for design. Owner duties, when declared, remain separate. No role label in JSON grants authority.

Set bounded `maxActiveWork` and `maxDetailBytes` appropriate to a representative proof. Detail only active work; retain future work with empty instructions. Budget pressure narrows current work without erasing required outcomes. Do not use word/category counts as product acceptance.

## Public commands

From an installed package, use `ai-prompt-workflow`. From a source checkout after building, use `node dist/cli.js`. The examples below use the installed executable and run from the library root so the example's paths resolve:

```bash
ai-prompt-workflow validate docs/examples/run.json --project-root . --boundary plan-reviewable
ai-prompt-workflow view docs/examples/run.json --project-root .
ai-prompt-workflow review docs/examples/run.json --purpose scope --ids Q1 --project-root .
```

`view --output <directory>` writes the four derived reports. A generated report cannot grant authority; fix canonical facts and regenerate it. `review` prepares an exact binding/question packet and can report blocked/reusable judgments; it does not run an independent reviewer or manufacture approval. Use actual project tools to implement and capture product behavior.

Supported validation boundaries are `plan-reviewable`, `plan-reviewed`, `proof`, and named `work-executable`, `work-verified`, `outcome`, `decision`, `release`. Named boundaries need `--id <id>`. These distinguish structurally reviewable planning, reviewed planning, permitted work and actually evidenced results. Inspect status and diagnostic causes; do not rename an unassessed result as pass. Without `--boundary`, validate reports the complete assessment and exits according to `plan-reviewed`. Exit 0 means the requested check passed/action completed, 1 means invalid/failed, and 2 means pending/unassessed. The example is plan-reviewable but its default validation exits 2 because no scope judgment exists.

```bash
ai-prompt-workflow validate path/to/run.json --project-root . --boundary work-executable --id W1
ai-prompt-workflow inspect-legacy path/to/historical-run
ai-prompt-workflow commit path/to/run.json --from path/to/candidate.json --expect-revision 1 --project-root .
```

Author an initial candidate with revision 1, then create the chosen run through `commit --from <candidate.json> --expect-revision 0 --project-root <root>`. Parent directories are created only when committing. For later changes, `commit` validates and atomically replaces canonical facts only when the expected revision still matches; it preserves append-only evidence/judgment history. Resolve a conflict against the latest run rather than overwrite another writer.

`--host /absolute/outside-project/host.mjs` loads an explicit trusted adapter for authorization, grants/resources, evidence and judgments. The module must export `trustedHost` with synchronous `verifyAuthorization`, `verifyEvidence` and `verifyJudgment` methods; optional verification methods support grants, resources and checkpoint acknowledgments. The CLI validates the interface and requires explicit selection outside the project. That location is an accidental-trust guard, not OS isolation or proof that the code/receipts are trustworthy. The adapter must resolve actual trusted records; it must not be a product-authored permissive verifier. `record` appends a host-verified receipt using `--from <receipt.json> --expect-revision N --project-root <root> --host <module>`. An evidence envelope has `kind: "evidence"` and `value` containing the evidence record; a judgment envelope uses `kind: "judgment"`. Obtain the record from the actual observer/reviewer and bind it to the current request. Never invent a fingerprint, observer, approval or receipt store to pass a check. Without host access, report the unverified boundary and continue independent authorized work.

The public TypeScript workflow export provides contract types, parsing, assessment, review planning, store and view functions. Treat its actual declarations as the field/API reference; human prose does not define an alternative schema.
