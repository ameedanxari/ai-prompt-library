# AI Prompt Library

> **Transform a 3-sentence idea into production-ready software specs** — no coding experience required.

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)
[![Looking for Feedback](https://img.shields.io/badge/🗣️-Looking%20for%20Feedback-blue)](https://github.com/ameedanxari/ai-prompt-library/discussions)
[![Early Contributors Welcome](https://img.shields.io/badge/🌟-Early%20Contributors%20Welcome-orange)](https://github.com/ameedanxari/ai-prompt-library/issues)

---

## ✨ **Magic**: Self-Stabilizing Setup (No Configuration Needed)

**You literally don't need to set anything up.** Just add this library to your project:

```bash
git submodule add https://github.com/ameedanxari/ai-prompt-library.git .ai-prompts
```

Then **start using your AI tool normally**. The library automatically:

- ✅ Initializes itself on first request (no manual setup script)
- ✅ Self-heals if configs break (repairs automatically)
- ✅ Handles upgrades invisibly (updates are transparent)
- ✅ Works with any AI tool (Cursor, Windsurf, Kiro, Claude, etc.)
- ✅ Deploys to all supported tools proactively

**No hooks to configure. No environment variables. No manual steps.**

👉 **[SETUP_GUIDE.md](SETUP_GUIDE.md)** - 3-minute quick start guide (just reading, not doing)

---

## 🛡️ CRITICAL: For AI Agents Working on This Codebase

**BEFORE MAKING ANY CHANGES**, you MUST read and complete: **[PREVENTION_CHECKLIST.md](PREVENTION_CHECKLIST.md)**

**BEFORE COMMITTING ANY CHANGES**, you MUST follow: **[COMMIT_GUIDELINES.md](COMMIT_GUIDELINES.md)**

This library includes a comprehensive safeguard system to prevent destructive changes. See **[docs/SAFEGUARDS.md](docs/SAFEGUARDS.md)** for complete protection framework.

**Key Safeguards:**
- 🛡️ **Change Impact Guard**: Mandatory impact assessment before modifications
- 🏥 **Self-Healing Monitor**: Continuous system health monitoring  
- 📊 **Test Success Baseline**: 100% tests must pass (598/598 currently)
- 🔒 **Implementation Enforcement**: Ensures design artifacts are used during implementation
- 📋 **Commit Quality Gates**: Automated validation before commits

---

## What is this?

A **modular, agentic prompt library** that transforms minimal user input into comprehensive, production-ready software specifications. Write a brief, get a complete development roadmap — including architecture, features, testing strategy, deployment configs, and implementation tasks.

**Think of it as a "spec-driven development" framework for AI-assisted coding.**

---

## Who is this for?

| You are... | This helps you... |
|------------|-------------------|
| 🎯 **Non-technical founder** | Turn your product idea into detailed specs any developer (human or AI) can execute |
| 🤖 **AI-assisted developer** | Get structured, context-rich prompts that work with Cursor, Windsurf, Copilot, v0, Devin, or any LLM |
| 🏗️ **Solo builder** | Ship MVPs faster with production-ready defaults (auth, offline, i18n, accessibility) baked in |
| 👥 **Team lead** | Standardize how your team specs out features with resumable, trackable task lists |

---

## 🎯 What makes this different?

| Feature | Why it matters |
|---------|----------------|
| **✨ Self-Stabilizing** 🆕 | Auto-setup on first use, self-heals when configs break, transparent upgrades. Works with any AI tool (Cursor, Windsurf, Kiro, Claude, etc.) |
| **Agentic & Resumable** | Any AI agent can pick up where another left off — full state tracking across sessions |
| **Spec-Driven Development** | Requirements → Design → Tasks → Implementation, with quality gates at each stage |
| **COVE-Enhanced Verification** | Chain-of-Verification reduces AI hallucinations by 40%, ensuring accurate specifications and code |
| **Modular & Composable** | Prompts are Lego blocks — combine them for any project type |
| **Production-Ready Defaults** | Security, accessibility, i18n, offline support, and monitoring included by default |
| **Token-Aware** | Choose Low/Medium/High verification depth to balance cost vs thoroughness |
| **Dry-Run Mode** | Validate outputs before committing tokens to full generation |

## 🚀 Get Started for Free (No Credit Card Required)

New to AI-assisted development? We've curated a list of **free AI tools, IDEs, and trials** to help you build your MVP without spending a dime.

👉 **[View Free AI Resources Guide](docs/FREE_RESOURCES.md)**

---

## 🆕 Chain-of-Verification (COVE) Integration

The AI Prompt Library now includes **COVE (Chain-of-Verification)** templates to reduce AI hallucinations and improve accuracy by up to 40%. COVE is a four-step self-verification process developed by Meta AI that systematically fact-checks AI outputs before delivery.

**Key Benefits**:
- 40% reduction in factual errors
- Higher confidence in generated specifications and code
- Better documentation of assumptions and decisions
- Reduced rework from catching errors early

**Quick Start with COVE**:
- 📖 **[COVE Integration Guide](docs/COVE_INTEGRATION.md)** - Complete integration documentation
- 🎯 **[Quick Reference](prompts/templates/cove-quick-reference.md)** - Fast lookup guide
- 💡 **[Examples](prompts/templates/cove-examples/)** - API specs, code generation, architecture decisions

**When to Use COVE**:
- ✅ Technical specifications (APIs, protocols)
- ✅ Code generation (functions, classes)
- ✅ Architecture decisions (technology choices)
- ✅ Security-critical components
- ✅ Compliance requirements (GDPR, WCAG)

---

## Quick Start: Production Setup Prompt (Recommended)

Paste this into your AI assistant exactly (then replace the project idea):

```markdown
I want to use the AI Prompt Library in this repository.

Library URL: https://github.com/ameedanxari/ai-prompt-library
Project idea: [Describe your idea in 2-6 sentences]

Use `.ai-prompts/prompts/orchestrators/ai-agent-entry-point.md` as the mandatory entry point for this request and every future request in this project.

Before generating specs, do this in order:
1. Run setup automatically if needed.
2. Scan all available design/reference files in `working_copy/` and `prompts/working_copy/` (if present), then generate a complete asset inventory + mapping.
3. Build a design-system foundation first (tokens, typography, spacing, component primitives, state variants, platform mappings) using design-system modules before screen-level implementation.
4. Create a prompt-selection manifest and a stage-by-stage prompt-usage log showing which library templates/orchestrators/modules ("lego blocks") are selected and where each one is applied.
   Also create an output-to-prompt composition index with one concrete row per generated artifact (no grouped labels/wildcards), and include a `Prompt Blocks Applied` section inside every generated artifact.
5. Create backend/API integration contracts (auth, data, payments, notifications, admin) plus explicit data architecture (database choice, schema ownership, migrations, backup) and backend infrastructure plan.
   Integration contracts must include method/path/auth/request schema/response schema/error model/idempotency per endpoint.
6. Enforce no stub-only production paths: mock/fake data is allowed only with explicit toggle and replacement task.
7. Require a deployment prerequisites package (environment matrix + access/secrets checklist) before Stage 07 can be marked complete.
   Missing prerequisites must include owner, status, due date (no TBD), and unblock action.
8. Start the stage pipeline with COVE enabled for architecture, API contracts, and security-critical outputs, and enforce stage completion gates.
9. In Stage 06, generate a per-task implementation prompt pack:
   - `prompts/outputs/implementation-prompts/prompt-pack-index.md`
   - one prompt file per task from the task lists.
10. For Stage 04, require endpoint-level API delivery matrix and screen-by-screen fidelity matrix tied to source mockup files.
11. In Stage 06, enforce design-system-first sequencing for every UI surface:
    - add reusable token/component foundation tasks before screen tasks
    - make downstream UI tasks depend on those foundation tasks.
12. Reject unresolved placeholders in generated per-task prompts (for example `[implementation file paths ...]`, `[project-specific ...]`, `- \`) and require concrete `.ai-prompts/prompts/...` entries in every `Prompt Blocks Applied` section.
13. For UI scope projects, apply these dedicated design-system templates and produce their outputs:
    - `.ai-prompts/prompts/templates/design-system-foundation-template.md` -> `design-system-foundation.md`
    - `.ai-prompts/prompts/templates/design-system-component-catalog-template.md` -> `design-system-component-catalog.md`
    - `.ai-prompts/prompts/templates/design-system-implementation-sequencing-template.md` -> `design-system-implementation-sequencing.md`
    - `.ai-prompts/prompts/templates/design-system-verification-report-template.md` -> `quality/design-system-verification-report.md`
14. For every Stage 06 per-task implementation prompt, require explicit prompt routing:
    - include one semantic module from `.ai-prompts/prompts/modules/...` based on task intent (auth/profile/booking/payment/notification/design-system/discovery/analytics/moderation/etc.)
    - include one stack module from `.ai-prompts/prompts/modules/technology-stacks/...` based on detected stack (for example Flutter, Firebase, React).
    - for profile/discovery/analytics/moderation tasks, require intent-specific semantic modules and do not allow only `integration/service-integration`.

Required early outputs:
- `prompts/outputs/specifications/asset-mapping.md`
- `prompts/outputs/specifications/design-system-foundation.md`
- `prompts/outputs/specifications/design-system-component-catalog.md`
- `prompts/outputs/specifications/prompt-selection-manifest.md`
- `prompts/outputs/specifications/prompt-composition-index.md`
- `prompts/outputs/specifications/prompt-usage-log.md`
- `prompts/outputs/specifications/integration-contracts.md`
- `prompts/outputs/specifications/data-architecture.md`
- `prompts/outputs/specifications/backend-infrastructure.md`
- `prompts/outputs/specifications/screen-fidelity-matrix.md`
- `prompts/outputs/specifications/design-system-implementation-sequencing.md` (Stage 06, UI scope)

UI scope quality output (Stage 09):
- `prompts/outputs/quality/design-system-verification-report.md`

For every new user request after setup, route through the auto-request-router first, record the routing decision, and then execute.
```

The AI will automatically:
1. ✅ Initialize the library (submodule or clone)
2. ✅ Configure steering files for your AI tool (Kiro, Cursor, Windsurf, etc.)
3. ✅ Create/update project root `AGENTS.md` with mandatory steering references
4. ✅ Create all required state files
5. ✅ Set up project structure
6. ✅ Enforce routing + audit trail behavior
7. ✅ Start the specification pipeline with stronger design/API/database/deployment integration defaults

### How It Works (Fully Automated)

The AI Prompt Library now includes **automatic routing and setup**:

#### 1. Automatic Setup (First Time)
- **You say**: "I want to use the AI Prompt Library"
- **AI does**: Detects setup needed → Auto-initializes everything → Creates templates
- **You get**: Ready-to-use library with MY_PROJECT.md template

#### 2. Automatic Request Routing
- **You say**: Any request (feature, fix, continue, etc.)
- **AI does**: Analyzes request via router first → Logs routing decision → Routes optimally (atomic vs pipeline) → Executes
- **You get**: Right-sized approach for each request type

#### 3. Seamless Continuation
- **You say**: "Continue"
- **AI does**: Reads NEXT_ACTION.md → Executes next stage → Updates state
- **You get**: Seamless progression through all 10 stages

#### 1. Planning Phase (Stages 01-06)
**Goal**: Define exactly what to build so there's no guesswork.

- **You say**: "Continue"
- **AI does**: Asks questions, designs the system, and creates a step-by-step build plan.
- **You get**: A complete blueprint (requirements, design, task list) in `prompts/outputs/`.

#### 🚀 OPTIMAL BUILD POINT (After Stage 06)
**Goal**: Start coding while the plan is fresh.

- **You see**: A "Ready to Build" message in `NEXT_ACTION.md`.
- **You say**: "Execute the development plan"
- **AI does**: Switches from planning to coding.

#### 2. Building Phase (The Work Loop)
**Goal**: Turn the plan into working software.

- **You say**: "Continue" (repeatedly)
- **AI does**:
  1. Picks the next task from the plan
  2. Writes the actual code files
  3. Tests the code to make sure it works
  4. Updates the progress tracker
- **You get**: Real source code in `src/`, working tests, and a functional app!

> **💡 Try Dry-Run Mode**: Want to see what the AI *would* build without using up all your tokens? Enable **Dry-Run Mode** in `NEXT_ACTION.md`. The AI will show you a preview of the files and code logic instead of writing everything out.

#### 3. Finishing Phase (Stages 07-10)
**Goal**: Polish, document, and prepare for launch.

- **You say**: "Continue"
- **AI does**: Sets up deployment, writes user manuals, and runs final quality checks.
- **You get**: Deployment scripts, API docs, and a release-ready project.

---

### Key Concepts

| Term | What it means for you |
|------|-----------------------|
| **Stage** | A specific step in the process (e.g., "Architecture", "Testing"). |
| **Task List** | A detailed checklist of small coding jobs the AI will do. |
| **State File** | Files like `NEXT_ACTION.md` that remember where you left off. |
| **Dry-Run** | A "preview mode" that saves cost by skipping code generation. |

### The Two Modes: Specification vs Execution

> ⚠️ **Important**: The Planning Phase (Stages 01-06) creates **PLANS**. The Building Phase creates **CODE**.

**Phase 1: Planning (Specifying)**
- **Output**: Markdown files in `prompts/outputs/`
- **Cost**: Low/Medium token usage
- **Outcome**: A solid plan

**Phase 2: Building (Executing)**
- **Output**: Code files in `src/`, `tests/`, etc.
- **Cost**: Higher token usage (writing code takes more effort)
- **Outcome**: A working product
5. Build the working product

**Output after Execution:**
```
src/                      # ACTUAL code files
├── components/
├── services/
└── ...
tests/                    # ACTUAL test files
package.json              # ACTUAL project config
```

Each task in the task lists is a **self-contained prompt** that guides the AI to write actual code.

### Updating the Library

```bash
git submodule update --remote .ai-prompts
git add .ai-prompts && git commit -m "Update AI Prompt Library"

# NEW: Validate integration health after update
./validate-integration.sh --strict
```

**What the validation does:**
- ✅ Checks if library version changed
- ✅ Runs full safeguard validation
- ✅ Ensures integration health
- ✅ Updates version tracking
- ✅ Reports any issues that need attention
- ✅ Optionally runs strict output checks (`--strict`)

**Validation modes:**
- `./validate-integration.sh` → baseline setup/integration health
- `./validate-integration.sh --strict` → baseline + output traceability quality checks

**If validation fails:**
1. Review the safeguard documentation: `.ai-prompts/docs/SAFEGUARDS.md`
2. Run setup again: Follow the Quick Start process
3. Check for breaking changes in the library updates

---

## 🔁 Developing the Next Feature

Once you've completed a feature or development cycle, you can start the next one with a single prompt. The library includes an **Agentic Orchestrator** that handles state verification, archiving, and task assessment automatically.

### Start Next Feature
Copy this prompt to your AI assistant:

```markdown
I have a new request for my project.

First route this request through `.ai-prompts/prompts/orchestrators/auto-request-router.md` and log the routing decision.

If the request is feature-scale, use the **Next Feature Orchestrator** at `.ai-prompts/prompts/templates/next-feature-orchestrator.md`:

1.  **Assess current state** (check for pending tasks).
2.  **Request my consent** before archiving previous results.
3.  **Route the request** using the Task Router once cleared.

**My New Request**: [Describe your next feature or change here]
```

> [!TIP]
> **Safety First**: The orchestrator will warn you if it detects unfinished work. If you definitely want to start over, you can add "FORCE RESET" to your request.

---

## Manual Setup

### Choosing Your Integration Approach

| Approach | Updates | Contributions | Bloat | Git Required |
|----------|---------|---------------|-------|--------------|
| **Submodule** ⭐ | Single command | Fork workflow | None (reference only) | Yes |
| **Clone + .gitignore** | Manual re-clone | Copy to fork | None (ignored) | No |
| **Fork** | Pull from upstream | Direct PR | Full history | Yes |

### Option 1: Git Submodule (Recommended) ⭐

The cleanest approach — your project tracks a reference to the library, not its contents.

```bash
# Navigate to your project root
cd your-project

# Add the library as a submodule
git submodule add https://github.com/ameedanxari/ai-prompt-library.git .ai-prompts

# Commit the submodule reference
git commit -m "Add AI Prompt Library as submodule"
```

**Why submodules?**
- ✅ No repository bloat — only stores a commit reference
- ✅ Easy updates with `git submodule update --remote`
- ✅ Clear version tracking — see exactly which library version you're using
- ✅ Clean contribution workflow via fork

> **Note:** Do NOT add `.ai-prompts/` to `.gitignore` when using submodules — Git tracks submodules by reference automatically.

### Option 2: Clone + .gitignore (For Non-Git Projects)

Use this if your project isn't a git repository or you prefer simplicity over version tracking.

```bash
# Navigate to your project root
cd your-project

# Clone the library into a hidden folder
git clone https://github.com/ameedanxari/ai-prompt-library.git .ai-prompts

# Add to .gitignore (don't commit the library with your project)
echo ".ai-prompts/" >> .gitignore
```

**Trade-offs:**
- ⚠️ Manual updates — delete and re-clone to get new versions
- ⚠️ No version tracking — can't see which library version you're using
- ⚠️ Harder to contribute — must manually copy changes to a fork

### Option 3: Fork and Customize

Best for teams who want to maintain their own version with custom templates.

1. Fork this repository on GitHub
2. Customize templates for your team's workflow
3. Add your fork as a submodule: `git submodule add https://github.com/YOUR-USERNAME/ai-prompt-library.git .ai-prompts`
4. Pull upstream updates periodically to stay current

---

## Updating the Library

### If Using Submodule (Recommended)

```bash
# Pull the latest version
git submodule update --remote .ai-prompts

# Commit the updated reference
git add .ai-prompts
git commit -m "Update AI Prompt Library to latest version"

# NEW: Validate integration health
./validate-integration.sh --strict
```

This updates your submodule to the latest commit on the main branch and validates that your integration is still healthy with the new version.

### If Using Clone + .gitignore

```bash
# Remove the old version
rm -rf .ai-prompts

# Clone fresh
git clone https://github.com/ameedanxari/ai-prompt-library.git .ai-prompts

# NEW: Validate integration after update
if [ -f "validate-integration.sh" ]; then
    ./validate-integration.sh --strict
else
    echo "⚠️ Integration validation script not found"
    echo "💡 Consider using submodule approach for better update management"
fi
```

### Troubleshooting Updates

**Submodule shows "modified content":**
```bash
# Discard local changes in the submodule
cd .ai-prompts
git checkout .
cd ..
```

**Merge conflicts in .gitmodules:**
```bash
# Accept the incoming changes (usually correct)
git checkout --theirs .gitmodules
git add .gitmodules
```

**Submodule not initialized after clone:**
```bash
# Initialize and update submodules after cloning a project
git submodule init
git submodule update
```

---

## Contributing from Your Project

Made improvements to the library while working on your project? Here's how to contribute them back.

### Step 1: Fork the Repository

1. Go to [github.com/ameedanxari/ai-prompt-library](https://github.com/ameedanxari/ai-prompt-library)
2. Click "Fork" to create your own copy

### Step 2: Point Your Submodule to Your Fork

```bash
# Change the submodule remote to your fork
cd .ai-prompts
git remote set-url origin https://github.com/YOUR-USERNAME/ai-prompt-library.git
git remote add upstream https://github.com/ameedanxari/ai-prompt-library.git
cd ..
```

### Step 3: Make Changes and Push

```bash
cd .ai-prompts

# Create a branch for your changes
git checkout -b feature/my-improvement

# Make your changes, then commit
git add .
git commit -m "Add: description of your improvement"

# Push to your fork
git push origin feature/my-improvement

cd ..
```

### Step 4: Create a Pull Request

1. Go to your fork on GitHub
2. Click "Compare & pull request"
3. Describe your changes and submit

### Switching Back to Upstream

After your PR is merged (or if you want upstream updates):

```bash
cd .ai-prompts

# Switch back to main and pull from upstream
git checkout main
git remote set-url origin https://github.com/ameedanxari/ai-prompt-library.git
git pull origin main

cd ..

# Update your project's submodule reference
git add .ai-prompts
git commit -m "Update AI Prompt Library"
```

### Preserving Local Changes During Updates

If you have local modifications you want to keep:

```bash
cd .ai-prompts

# Stash your changes
git stash

# Pull updates
git pull origin main

# Reapply your changes
git stash pop

cd ..
```

> **New to Git submodules?** Check out the [Git Submodules documentation](https://git-scm.com/book/en/v2/Git-Tools-Submodules) for a deeper dive.

---

## How to Use

### Step 1: Write your brief

Create a file or just tell your AI assistant:

```markdown
**Brief**: "A task management app for remote teams with real-time collaboration, 
offline sync, and Slack integration"
```

That's it. One required field.

### Step 2: Run the stage pipeline

The library processes your brief through 10 stages:

| Stage | Output |
|-------|--------|
| 01 - Intake | Requirements specification, asset mapping |
| 02 - Charter | Project scope, success criteria |
| 03 - Architecture | System design, tech stack decisions |
| 04 - Features | Detailed feature specifications |
| 05 - Testing | Test strategy, property-based tests |
| 06 - Implementation | Task lists, implementation prompts |
| 07 - Deployment | CI/CD configs, infrastructure code |
| 08 - Documentation | API docs, user guides |
| 09 - Quality | QA checklists, security audits |
| 10 - Handoff | Release notes, maintenance guides |

### Step 3: Execute tasks

Each stage generates context-agnostic tasks that any AI agent can execute:

```markdown
## Task 2.3: Implement User Authentication
- Create auth service with OAuth2 support
- Implement JWT token management
- Add role-based access control
- **References**: architecture.md#auth-design, features.md#user-management
- **Acceptance Criteria**: All auth tests pass, RBAC enforced on all endpoints
```

---

## Example: From Brief to MVP

**Input:**
```
Brief: "A Spotify-like music streaming app for indie artists"
Platforms: web, iOS, Android
Token Level: medium
```

**Output (6 prompts later):**
```
outputs/
├── specifications/
│   ├── requirements.md      # 47 user stories with acceptance criteria
│   ├── design-system-foundation.md # Tokens + component primitives
│   ├── integration-contracts.md    # Auth/payments/notifications APIs
│   ├── data-architecture.md        # PostgreSQL + migration strategy
│   └── features.md                 # Streaming, playlists, artist profiles, payments
├── task-lists/
│   ├── implementation-master-plan.md
│   ├── task-list-index.md
│   ├── mobile-app-tasks.md
│   └── backend-shared-tasks.md
├── deployment/
│   ├── deployment-plan.md
│   ├── environment-matrix.md
│   └── access-and-secrets-checklist.md
└── documentation/
    ├── integration-setup-guide.md
    └── artist-onboarding.md
```

---

## Directory Structure

```
prompts/
├── AGENTS.md           # AI agent instructions (start here!)
├── README.md           # Library documentation
├── templates/          # Core prompt templates
├── stages/             # Stage-specific prompts (01-10)
├── modules/            # Reusable prompt modules
│   ├── asset-management/   # Asset processing
│   ├── feature-patterns/   # Auth, CRUD, offline, etc.
│   ├── technology-stacks/  # React, AWS, etc.
│   ├── testing/            # Mock data, fake backends
│   └── cross-platform/     # Platform parity
├── steering/           # AI tool steering files (IDE-agnostic)
├── working_copy/       # Your assets go here
└── outputs/            # Generated specifications
```

---

## Token Usage Levels

| Level | What it does | Best for |
|-------|--------------|----------|
| **Low** | Generate specs, delegate testing to you | Personal projects, prototypes |
| **Medium** | Verify at key checkpoints | Most projects, balanced cost/quality |
| **High** | Comprehensive verification + full test suites | Enterprise, compliance-heavy projects |

---

## AI Tool Integration (Steering Files)

The library includes steering files that guide AI agents to maintain consistency and prevent breaking changes when working on your project.

### What Are Steering Files?

Steering files are instructions that tell AI tools how to work with your project properly. They ensure AI agents:
- Review what's already built before making changes
- Follow the patterns already established in your code
- Don't accidentally break existing features when fixing issues

### Available Steering Files

| File | What It Does |
|------|--------------|
| `architecture-guard.md` | Prevents AI from breaking existing functionality |
| `library-context.md` | Helps AI understand the library structure |
| `change-review.md` | Guides AI through reviewing changes safely |

### How to Set Up

Your AI assistant will set these up automatically when you use the **Quick Start: One-Prompt Setup** above. The AI will copy or link these files to the right location for your specific tool (Cursor, Kiro, Windsurf, etc.).

If you need to set them up manually, see `prompts/steering/README.md` for tool-specific instructions.

---

## Contributing

We're actively looking for feedback and contributions! Here's how you can help:

- 🐛 **Report bugs**: [Open an issue](https://github.com/ameedanxari/ai-prompt-library/issues)
- 💡 **Suggest features**: [Start a discussion](https://github.com/ameedanxari/ai-prompt-library/discussions)
- 🔧 **Submit PRs**: Fork, improve, and submit a pull request
- ⭐ **Star the repo**: Help others discover this project
- 🚀 **Shape the future**: Check out our [Future Roadmap](FUTURE_ROADMAP.md) for expansion opportunities

### Areas we'd love help with:
- Additional technology stack modules (Vue, Angular, Django, Rails, etc.)
- More feature pattern templates (payments, notifications, search, etc.)
- Translations and i18n improvements
- Testing and validation of generated outputs

### 🌟 Future Expansion Opportunities

**Want to help shape the next generation of AI-assisted development?** 

👉 **[View the Future Roadmap](FUTURE_ROADMAP.md)** to see exciting areas for contribution:

- **🔬 Emerging Technologies**: Quantum computing, AR/VR, WebAssembly
- **🌍 New Domains**: Climate tech, space technology, bioinformatics
- **🎨 Creative Paradigms**: AI-native development, artistic code generation
- **🤖 Advanced AI**: Multi-modal interfaces, self-modifying systems
- **🌱 Sustainability**: Carbon-aware computing, green software patterns

**From quantum-classical hybrid systems to consciousness simulation** — there's a place for every interest and expertise level. Join us in building the future of software development!

---

## Support & Contact

**Need help getting started?** 
- 🚀 Check out our [Free AI Resources Guide](docs/FREE_RESOURCES.md) for a $0 build stack
- 📖 Read the [AGENTS.md](prompts/AGENTS.md) for detailed instructions
- 💬 [Open a discussion](https://github.com/ameedanxari/ai-prompt-library/discussions)

**Want professional support or custom development?**
- 🤝 [Contact MatrixTribe](https://matrixtribe.ai/contact-us/) for consulting, custom integrations, or enterprise support

---

## License

MIT License — use it, modify it, share it, build on it. No obligations.

See [LICENSE](LICENSE) for details.

---

## Star History

If this project helps you ship faster, consider giving it a ⭐ — it helps others discover it!

---

<p align="center">
  <b>Built with ❤️ for the AI-assisted development community</b>
  <br>
  <a href="https://matrixtribe.ai">MatrixTribe</a> · 
  <a href="https://github.com/ameedanxari/ai-prompt-library/discussions">Discussions</a> · 
  <a href="https://matrixtribe.ai/contact-us/">Contact Us</a>
</p>
