# AI Prompt Library

> **Transform a 3-sentence idea into production-ready software specs** — no coding experience required.

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)
[![Looking for Feedback](https://img.shields.io/badge/🗣️-Looking%20for%20Feedback-blue)](https://github.com/ameedanxari/ai-prompt-library/discussions)
[![Early Contributors Welcome](https://img.shields.io/badge/🌟-Early%20Contributors%20Welcome-orange)](https://github.com/ameedanxari/ai-prompt-library/issues)

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

## What makes this different?

| Feature | Why it matters |
|---------|----------------|
| **Agentic & Resumable** | Any AI agent can pick up where another left off — full state tracking across sessions |
| **Spec-Driven Development** | Requirements → Design → Tasks → Implementation, with quality gates at each stage |
| **Modular & Composable** | Prompts are Lego blocks — combine them for any project type |
| **Production-Ready Defaults** | Security, accessibility, i18n, offline support, and monitoring included by default |
| **Token-Aware** | Choose Low/Medium/High verification depth to balance cost vs thoroughness |
| **Dry-Run Mode** | Validate outputs before committing tokens to full generation |

## 🚀 Get Started for Free (No Credit Card Required)

New to AI-assisted development? We've curated a list of **free AI tools, IDEs, and trials** to help you build your MVP without spending a dime.

👉 **[View Free AI Resources Guide](docs/FREE_RESOURCES.md)**

---

## Quick Start: One-Prompt Setup

Copy this prompt into your AI assistant (Cursor, Windsurf, Kiro, Claude, etc.):

```
I want to use the AI Prompt Library to build my project idea.

**My Project Idea**: [Describe your idea here - even 2-3 sentences is enough!]

Please set up the library and start the specification pipeline:

1. Add the AI Prompt Library to my project:
   - If git repo: `git submodule add https://github.com/ameedanxari/ai-prompt-library.git .ai-prompts`
   - If not git: Clone to `.ai-prompts/` and add to .gitignore

2. Read the library instructions at `.ai-prompts/prompts/AGENTS.md`

3. Set up steering files from `.ai-prompts/prompts/steering/` for my AI tool

4. Create MY_PROJECT.md using `.ai-prompts/prompts/templates/user-input-template.md` with my idea filled in

5. Create the state files for pipeline tracking:
   - Create `NEXT_ACTION.md` in project root (controls what happens next)
   - Create `prompts/outputs/PROJECT_STATE.md` (tracks pipeline progress)
   - Use the templates from `.ai-prompts/prompts/templates/project-state-files.md`

6. Start Stage 01 - Intake:
   - Process my brief using `.ai-prompts/prompts/stages/stage-01-intake/`
   - Generate requirements to `prompts/outputs/specifications/requirements.md`
   - Update NEXT_ACTION.md to point to Stage 02

After this, I can just say "Continue" to progress through each stage.
```

### How It Works

After running the setup prompt:

1. **Your project is configured** with the library and state tracking files
2. **Stage 01 completes** and generates your requirements specification
3. **NEXT_ACTION.md is updated** to show Stage 02 is next

From then on, you just say **"Continue"** or **"Resume"** and the AI:
- Reads NEXT_ACTION.md to know exactly what to do
- Executes the next stage
- Updates the state files
- Sets up the next action

This works across different chats, IDEs, and AI agents - the state files are the "wiring" that keeps everything connected.

### The 10-Stage Pipeline

| Stage | What It Generates |
|-------|-------------------|
| 01 - Intake | Requirements specification |
| 02 - Charter | Project scope and success criteria |
| 03 - Architecture | System design and tech stack |
| 04 - Features | Detailed feature specifications |
| 05 - Testing | Test strategy and test cases |
| 06 - Implementation | Task lists (bite-sized, context-agnostic prompts) |
| 07 - Deployment | CI/CD and infrastructure configs |
| 08 - Documentation | API docs and user guides |
| 09 - Quality | QA checklists and validation |
| 10 - Handoff | Release notes and maintenance guides |

### The Output

After completing all stages, you'll have:

```
prompts/outputs/
├── specifications/
│   ├── requirements.md      # User stories with acceptance criteria
│   ├── charter.md           # Project scope and goals
│   ├── architecture.md      # System design and tech stack
│   └── features.md          # Detailed feature specs
├── task-lists/
│   ├── frontend-tasks.md    # Implementation prompts for frontend
│   ├── backend-tasks.md     # Implementation prompts for backend
│   └── deployment-tasks.md  # Infrastructure setup prompts
└── documentation/
    ├── api-docs.md          # API specifications
    └── user-guides.md       # End-user documentation
```

Each task in the task lists is a **self-contained prompt** that any AI can execute without prior context.

### Updating the Library

```bash
git submodule update --remote .ai-prompts
git add .ai-prompts && git commit -m "Update AI Prompt Library"
```

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
```

This updates your submodule to the latest commit on the main branch. Your project now tracks the new version.

### If Using Clone + .gitignore

```bash
# Remove the old version
rm -rf .ai-prompts

# Clone fresh
git clone https://github.com/ameedanxari/ai-prompt-library.git .ai-prompts
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
│   ├── architecture.md      # React Native + Node.js + PostgreSQL
│   └── features.md          # Streaming, playlists, artist profiles, payments
├── task-lists/
│   ├── frontend-tasks.md    # 23 implementation tasks
│   ├── backend-tasks.md     # 31 API implementation tasks
│   └── deployment-tasks.md  # AWS deployment with CDN for streaming
└── documentation/
    ├── api-docs.md          # OpenAPI specification
    └── artist-onboarding.md # Artist portal documentation
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

### Areas we'd love help with:
- Additional technology stack modules (Vue, Angular, Django, Rails, etc.)
- More feature pattern templates (payments, notifications, search, etc.)
- Translations and i18n improvements
- Testing and validation of generated outputs

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
