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

Copy and paste this prompt into your AI coding assistant (Cursor, Windsurf, Kiro, Claude, ChatGPT, etc.) to set up the library in your project:

```
I want to integrate the AI Prompt Library into my project for spec-driven development.

Please do the following:

1. Clone the AI Prompt Library into a `.ai-prompts` folder in my project root:
   - Repository: https://github.com/ameedanxari/ai-prompt-library
   - Target folder: .ai-prompts/

2. Set up the library as a prompt pre-processor:
   - If AGENTS.md exists in my project root, append a reference to `.ai-prompts/prompts/AGENTS.md`
   - If AGENTS.md doesn't exist, create one that includes the AI Prompt Library instructions
   - The goal: any chat/prompt I send should be enhanced by the library's templates

3. Update .gitignore to exclude the prompt library from version control:
   - Add `.ai-prompts/` to .gitignore
   - Do NOT overwrite existing .gitignore content — append to it
   - If .gitignore doesn't exist, create one with `.ai-prompts/` and common defaults

4. Create a quick-start file at `.ai-prompts/MY_PROJECT.md` with:
   - A placeholder for my project brief
   - Instructions for how to use the library with my specific project

After setup, show me how to start using the library with a simple example.
```

---

## Manual Setup

### Option 1: Clone into your project

```bash
# Navigate to your project root
cd your-project

# Clone the library into a hidden folder
git clone https://github.com/ameedanxari/ai-prompt-library.git .ai-prompts

# Add to .gitignore (don't commit the library with your project)
echo ".ai-prompts/" >> .gitignore
```

### Option 2: Use as a submodule (for version tracking)

```bash
git submodule add https://github.com/ameedanxari/ai-prompt-library.git .ai-prompts
echo ".ai-prompts/" >> .gitignore
```

### Option 3: Fork and customize

1. Fork this repository
2. Customize templates for your team's workflow
3. Clone your fork into projects

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
