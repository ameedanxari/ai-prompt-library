# Quick start

Install the library at `.ai-prompts` and run its bootstrap script as shown in [README](README.md). For an npm installation, use the package's `ai-prompt-workflow` executable. Build repository sources with `npm ci` and `npm run build` before running its CLI locally.

Give the agent an ordinary request, such as “Plan and implement a local tool that reports duplicate invoices; retain the originals and show success plus invalid-input recovery.” Provide relevant original sources and existing code. You can use [the optional brief](MY_PROJECT.md.template), but filling a long form is not a prerequisite.

The agent reads [the entry point](prompts/orchestrators/ai-agent-entry-point.md), inspects existing state and creates one isolated project-relative `prompts/outputs/runs/<run-id>/run.json` for substantial work. Generated runs stay outside `.ai-prompts` and dependency directories. It retains the full concise outcome scope and details only the next useful proof. Missing access/decisions block their actual consumers; reversible defaults and independent work continue within authority. Review/plan-only requests stop at their requested boundary.

Use [the model guide](docs/model.md) for supported fields and command examples. `validate` checks represented structural/evidence conditions; `view` derives the current owner/work summary; `review` prepares a bound question packet for an actual reviewer; `inspect-legacy` reads historical records. These operations do not deploy, authenticate an invented identity or migrate a legacy run.

At each meaningful handoff expect the actual runnable target/artifact, entry and recovery actions, raw observations, remaining limits and next action. A schema-valid model or completed work count is not a product acceptance. Release needs the full selected original scope and current candidate evidence, including applicable operator/handover duties.

To resume, identify the existing run and ask to continue within the authorization already given. Do not create another run because a chat changed. For old checkpoints/manifests follow [upgrade guidance](docs/upgrading.md); preserve them unchanged until an explicitly authorized transition.

From the built library checkout, the bundled plan-only example can be inspected without a host:

```bash
node dist/cli.js validate docs/examples/run.json --project-root . --boundary plan-reviewable
node dist/cli.js view docs/examples/run.json --project-root .
node dist/cli.js review docs/examples/run.json --purpose scope --ids Q1 --project-root .
```

It intentionally has no observed runtime or approvals. Use `--host` only with a real trusted adapter outside the project. Review planning alone does not perform the review. [The command guide](docs/model.md) documents named boundaries, atomic revision-checked updates and verified receipt recording.

From a consumer project, `node .ai-prompts/dist/cli.js` or `bash .ai-prompts/scripts/workflow.sh` accesses the same CLI. The wrapper only checks for built files; it does not install dependencies or run a build. Bootstrap updates its managed AGENTS.md block and creates an absent brief; it does not create a run, rewrite IDE settings or supply approvals.
