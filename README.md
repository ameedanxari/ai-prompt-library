# AI Prompt Library

A modular workflow for delivering useful, verified outcomes through bounded implementation slices. Preserve the full requested scope and applicable release duties in a versioned contract; detail and prove the next slice before expanding breadth.

Install in your project root:

```bash
git clone --depth 1 https://github.com/ameedanxari/ai-prompt-library.git .ai-prompts
bash .ai-prompts/scripts/bootstrap-project-integration.sh
```

Keep an existing `.ai-prompts` checkout; do not overwrite it. Alternatively use a Git submodule at the same path, or install `ai-prompt-library` with npm and link `.ai-prompts` to the package. Package/CLI work requires the repository's declared Node/runtime dependencies. Bootstrap wires agent steering and the project brief; inspect changes before committing.

Start with [QUICK_START.md](QUICK_START.md). Agents start at [the entry point](prompts/orchestrators/ai-agent-entry-point.md), which keeps the existing four routing modes: Trivial, Execute, Gap-closure and Greenfield. Specialist modules remain available on demand across product domains.

New runs use `delivery-manifest.json` in isolated `prompts/outputs/runs/<run-id>/`. A root checkpoint selects the active run. The manifest retains original requirements, outcomes, targets, authorization, evidence/reviews and continuation. Existing task machinery projects this contract; historical legacy runs remain explicitly supported without rewriting their evidence.

The first proof reaches a valuable result from the actual entry, including relevant recovery. Before accepted proof, detail at most five units and 4,000 words in one slice. After proof, detail at most eight units and 6,000 words across the active and at most one next slice. Pending scope stays in a concise ledger. Units are useful changes across necessary files, not a mandatory ticket and commit per file.

A schema-valid plan or successful build cannot prove a useful product. Visual surfaces require actual composed-screen captures and inspection; headless systems require real consumer/operational evidence. Targets, sources, provider modes and raw artifacts are bound by digests. Required owner/independent acceptance needs trusted provenance; the agent cannot manufacture approval. Controlled-provider proof leaves production duties pending.

See [delivery-contract.md](docs/delivery-contract.md) for canonical fields, budgets, migration and validation stages. New runs use:

```bash
bash .ai-prompts/scripts/validate-delivery.sh .ai-prompts/prompts/outputs/runs/<run-id> --stage plan
bash .ai-prompts/scripts/validate-delivery.sh .ai-prompts/prompts/outputs/runs/<run-id> --stage execute
# Later, with retained current evidence and required reviews:
bash .ai-prompts/scripts/validate-delivery.sh .ai-prompts/prompts/outputs/runs/<run-id> --stage advance
bash .ai-prompts/scripts/validate-delivery.sh .ai-prompts/prompts/outputs/runs/<run-id> --stage release
```

Replace the run ID with the checkpoint-selected directory. Missing/invalid migrated manifests fail closed. Legacy `finalize.sh`, `revise.sh` and readiness tooling remain for explicit existing legacy contracts; those checks alone do not establish new outcome release readiness.

Execution autonomy and required user checkpoints are recorded separately from design, scope and release acceptance. Explicit instructions persist across chats. Applicable safety, secrets, legal, fixture-isolation and external-action limits remain binding. Missing owner inputs do not prevent independent authorized local work.

The library cannot provision missing accounts, authenticate an invented reviewer receipt or guarantee production quality from templates. Run project checks, inspect the real target, verify integrations and obtain required decisions. Measure actual generated words/bytes and rework; no fixed token-cost savings are promised.

For contributors, consult [CONTRIBUTING.md](CONTRIBUTING.md), [the source map](prompts/README.md) and repository checks. The reviewed change rationale is in [OUTCOME_DELIVERY_DESIGN.md](docs/OUTCOME_DELIVERY_DESIGN.md); its rollout status is distinct from documentation and fixture results.

For the npm layout:

```bash
npm install --save-dev ai-prompt-library
ln -sfn node_modules/ai-prompt-library .ai-prompts
bash .ai-prompts/scripts/bootstrap-project-integration.sh
npx ai-prompt-validate-delivery .ai-prompts/prompts/outputs/runs/<run-id> --stage plan
```

Use Node.js 20+, npm, Python 3 and Bash. Legacy package APIs such as `buildTaskContractReportForDirectory` from `ai-prompt-library/task-contract` remain available for existing records. The new `ai-prompt-library/delivery` export uses the shared outcome gate. Treat `npm test` as the source of truth for test results. Before package release run `npm run validate:release`, inspect package metadata and dry-run package contents, and complete applicable delivery/release evidence; a package check alone does not verify the consumer product.
