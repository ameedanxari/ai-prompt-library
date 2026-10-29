# AI Prompt Library

A compact workflow for planning, implementing and reviewing useful outcomes. It keeps original obligations, current work, decisions and evidence in one `run.json`; readiness and owner summaries are derived from that model. It helps organize judgment and verification. It does not guarantee autonomous delivery or production quality.

Install in your project root:

```bash
git clone --depth 1 https://github.com/ameedanxari/ai-prompt-library.git .ai-prompts
(cd .ai-prompts && npm ci && npm run build)
bash .ai-prompts/scripts/bootstrap-project-integration.sh
```

Keep an existing checkout and its consumer outputs when upgrading. [Version 2 changes the public workflow and schema](docs/upgrading.md); no historical run is silently migrated. The CLI needs Node.js 22.12.0+; npm builds/installs the package. Bash is optional: `node .ai-prompts/scripts/bootstrap.mjs` also integrates the project. See [Quick Start](QUICK_START.md) for the actual run commands.

To install a locally built package as a development dependency instead, run `npm pack` in the library checkout, then in the consumer project:

```bash
npm install --save-dev /path/to/ai-prompt-library-2.0.0.tgz
ln -s node_modules/ai-prompt-library .ai-prompts
bash .ai-prompts/scripts/bootstrap-project-integration.sh
```

Create that link only when `.ai-prompts` does not already exist. The installed executable is available through `npx ai-prompt-workflow`; from a consumer project use `node .ai-prompts/dist/cli.js`, or in a built source checkout use `node dist/cli.js`.

This source change does not publish a registry release. Registry installation by version is appropriate only after that version has actually been published.

Keep generated runs at project-relative `prompts/outputs/runs/<run-id>/run.json`, outside the library/dependency directory. Bootstrap changes only its managed AGENTS.md block and creates an absent project brief; it does not create a run or alter IDE configuration.

Agents start at [the entry point](prompts/orchestrators/ai-agent-entry-point.md). Give an ordinary request and relevant original sources. The agent inspects existing state, chooses conservative reversible defaults, preserves missing inputs and owner decisions, then proves a representative useful result and recovery before expanding work. Small changes can be handled directly.

The [version 3 model](docs/model.md) separates source requirements, targets/lifecycle, outcomes, work, resources, decisions, releases, evidence and judgments. A summary is a view of these facts, never a second acceptance contract. Review-only requests stay read-only. Explicit planning stops and owner reservations persist; permission to implement does not authorize publishing, spending or live-data destruction.

Actual consumer behavior matters. Visual products need inspected composed screens; headless products need exercised installation, commands/APIs or operations. Keep mocks and unrun checks labelled. Matching digests identify retained bytes, not an authenticated reviewer or semantic correctness. [Evidence and review](docs/evidence-and-review.md) explains those limits.

The large template catalogue and bundled application scaffolds have been retired. A few [optional references](prompts/README.md) retain specific source, state, visual and recovery mechanisms. [The retirement inventory](docs/retirement.md) preserves decisions and exact Git recovery. We make no token-savings, model-superiority or production-readiness promise from prompt size or structural tests.

Contributors: see [CONTRIBUTING.md](CONTRIBUTING.md). Run repository checks and exercise the public CLI before proposing changes.
