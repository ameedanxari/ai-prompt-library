# Quick start

Install the library as `.ai-prompts/` in your project using the repository's installation instructions. Copy `MY_PROJECT.md.template` to `MY_PROJECT.md` at the project root and describe who the product serves, what they need to do, and the first valuable result. Existing source, specs and references can be listed there or placed in `working_copy/`.

Use this prompt:

```text
Read .ai-prompts/prompts/orchestrators/ai-agent-entry-point.md first.
Plan and implement MY_PROJECT.md using existing source/reference material. Preserve the full requested scope and applicable release duties. Start with a bounded proof from real entry through first value and recovery, then continue through ordinary in-scope slices.
```

The agent selects one of Trivial, Execute, Gap-closure or Greenfield. New runs create a versioned `delivery-manifest.json` in an isolated `prompts/outputs/runs/<run-id>/`; the root checkpoint selects it. Existing material is reused when verified and unchanged. New chats do not restart planning.

Unspecified reversible decisions use the smallest source-consistent default, with assumption, rationale, impact and revisit trigger recorded. Material source contradictions and reserved owner decisions remain explicit. Missing access blocks its actual consumer; independent local work can proceed. Unknown preferences choose the smallest platform/capability set consistent with your brief. “Works on phones” may mean a responsive website; it does not automatically request iPhone/Android apps. Accounts, admin, monetization and other features need product justification. Applicable safety/reliability and release duties remain visible even when implementation is deferred.

While first-proof visual design is pending the plan is capped at one slice, two useful units and 1,200 detailed words. Nonvisual work or work after that review can use the pre-proof five-unit/4,000-word budget; still-unapproved visual surfaces retain their smaller exploration cap. Afterward it is one active plus at most one next slice, eight units and 6,000 words total. A unit can change its necessary source/tests/config/assets/docs together. Remaining outcomes stay in a concise ledger rather than hundreds of detailed task files.

At a required checkpoint the agent presents a runnable target/artifact, entry/action sequence, relevant captured states, limitations and evidence. A plan-and-implement request authorizes ordinary in-scope transitions and delegated design review without an invented human gate at every slice. Plan-only or explicitly requested review stops persist; at those stops say `Continue` or give feedback. Owner-reserved design, scope, commercial/legal/safety decisions and required independent reviews still need appropriate provenance. An independent reviewer must actually be distinct. Execution permission alone is not acceptance, and never authorizes deployment, live-data changes, spending or messages.

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

Replace `<run-id>` with your selected directory. Read [delivery-contract.md](docs/delivery-contract.md) for target/evidence requirements, source-bound execution authorization and trusted review provenance. Unattended authenticated review requires a configured host that can dispatch an actual distinct reviewer and verify its receipt. Without that integration, report the concrete review blocker and continue independent authorized work; a local approval record cannot authenticate itself. Visual products need captures from the actual composed application; APIs/SDKs, CLI, data/ML, operations and artifacts need their actual consumer/operational proof. Mixed systems combine requirements. A build, component catalogue, generated mockup or fake provider cannot prove release readiness.

Release evaluates every required outcome and applicable obligation against one current candidate. Owner inputs remain explicit and independent authorized work can continue. The agent must not invent legal/commercial values, enable charges, perform destructive drills or publish without authority. The workflow reports measured work and limits; it does not promise fixed token savings or guarantee a deployment from a passing plan.

Installation details and package prerequisites are in [README.md](README.md); the repository is [ameedanxari/ai-prompt-library](https://github.com/ameedanxari/ai-prompt-library). The npm entry point is `npx ai-prompt-validate-delivery <run-directory> --stage plan` (also `advance` and `release`). Existing legacy commands remain available explicitly; never use them to bypass a failed outcome manifest.
