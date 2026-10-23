# Quick start

Install the library as `.ai-prompts/` in your project using the repository's installation instructions. Copy `MY_PROJECT.md.template` to `MY_PROJECT.md` at the project root and describe who the product serves, what they need to do, and the first valuable result. Existing source, specs and references can be listed there or placed in `working_copy/`.

Use this prompt:

```text
Read .ai-prompts/prompts/orchestrators/ai-agent-entry-point.md first.
Use MY_PROJECT.md and existing source/reference material. Preserve the full requested scope and applicable release duties in the delivery contract. Plan a bounded representative proof from the real entry through first value, including recovery; do not expand all future tasks upfront.
```

The agent selects one of Trivial, Execute, Gap-closure or Greenfield. New runs create a versioned `delivery-manifest.json` in an isolated `prompts/outputs/runs/<run-id>/`; the root checkpoint selects it. Existing material is reused when verified and unchanged. New chats do not restart planning.

Unknown preferences choose the smallest platform/capability set consistent with your brief. “Works on phones” may mean a responsive website; it does not automatically request iPhone/Android apps. Accounts, admin, monetization and other features need product justification. Applicable safety/reliability and release duties remain visible even when implementation is deferred.

Before accepted proof the plan is capped at one slice, five useful units and 4,000 detailed words. Afterward it is one active plus at most one next slice, eight units and 6,000 words total. A unit can change its necessary source/tests/config/assets/docs together. Remaining outcomes stay in a concise ledger rather than hundreds of detailed task files.

At a required checkpoint the agent presents a runnable target/artifact, entry/action sequence, relevant captured states, limitations and evidence. Say `Continue` or give feedback. If you explicitly authorize autonomous ordinary transitions, that instruction persists; owner-reserved design, scope, commercial/legal/safety decisions and required reviews still require appropriate provenance. Execution permission alone is not acceptance.

Resume with:

```text
Continue where you left off. Read .ai-prompts/prompts/orchestrators/ai-agent-entry-point.md first.
```

The checkpoint's `run_directory` and bounded reload list identify the active work. Missing or invalid migrated manifests stop safely; historical legacy runs are continued only through the explicit legacy contract. Do not delete output or application state merely to start a new audit.

Planning, execution authorization, advancement and release use the same delivery resolver:

```bash
bash .ai-prompts/scripts/validate-delivery.sh .ai-prompts/prompts/outputs/runs/<run-id> --stage plan
bash .ai-prompts/scripts/validate-delivery.sh .ai-prompts/prompts/outputs/runs/<run-id> --stage execute
bash .ai-prompts/scripts/validate-delivery.sh .ai-prompts/prompts/outputs/runs/<run-id> --stage advance
bash .ai-prompts/scripts/validate-delivery.sh .ai-prompts/prompts/outputs/runs/<run-id> --stage release
```

Replace `<run-id>` with your selected directory. Read [delivery-contract.md](docs/delivery-contract.md) for target/evidence requirements and trusted review provenance. Visual products need captures from the actual composed application; APIs/SDKs, CLI, data/ML, operations and artifacts need their actual consumer/operational proof. Mixed systems combine requirements. A build, component catalogue, generated mockup or fake provider cannot prove release readiness.

Release evaluates every required outcome and applicable obligation against one current candidate. Owner inputs remain explicit and independent authorized work can continue. The agent must not invent legal/commercial values, enable charges, perform destructive drills or publish without authority. The workflow reports measured work and limits; it does not promise fixed token savings or guarantee a deployment from a passing plan.

Installation details and package prerequisites are in [README.md](README.md); the repository is [ameedanxari/ai-prompt-library](https://github.com/ameedanxari/ai-prompt-library). The npm entry point is `npx ai-prompt-validate-delivery <run-directory> --stage plan` (also `advance` and `release`). Existing legacy commands remain available explicitly; never use them to bypass a failed outcome manifest.
