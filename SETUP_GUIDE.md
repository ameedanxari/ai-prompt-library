# AI Prompt Library Setup Guide

## The Good News: You Don't Need to Set Up Anything

When you add the AI Prompt Library to your project (as a Git submodule or clone), **the library automatically handles everything**. You can start using it immediately.

### What Happens Automatically

On **every AI request**, the library silently:

1. ✅ **Self-stabilizes** — Checks and repairs its own configuration
2. ✅ **Self-heals** — Fixes any broken configurations automatically
3. ✅ **Deploys everywhere** — Puts itself in position to work with any AI tool (Cursor, Windsurf, Kiro, Claude, etc.)
4. ✅ **Handles upgrades** — When you update the submodule, it refreshes automatically

**You don't see any of this** — it just works in the background.

---

## Quick Start: 3 Steps

### Step 1: Add the Library to Your Project

If your project uses Git:

```bash
git submodule add https://github.com/ameedanxari/ai-prompt-library.git .ai-prompts
git submodule update --init --recursive
git add .gitmodules .ai-prompts
git commit -m "Add AI Prompt Library"
```

If it doesn't use Git, or you prefer not to use submodules:

```bash
git clone https://github.com/ameedanxari/ai-prompt-library.git .ai-prompts
echo ".ai-prompts/" >> .gitignore
```

### Step 2: Use Your AI Tool Normally

Open your AI tool (Cursor, Windsurf, Kiro, Claude, etc.) and just ask it to help with your project:

```
I want to build a social media app with real-time collaboration features
```

Or:

```
Fix the authentication flow in the login screen
```

Or:

```
Add file upload functionality to the dashboard
```

### Step 3: Done

The library automatically:
- Sets itself up (if first time)
- Routes your request optimally
- Guides you through the specification/implementation process
- Maintains state between sessions

**That's it.** No configuration needed.

---

## What the Library Does (Behind the Scenes)

### On First Request

The library detects that it's the first time and automatically:
1. ✅ Initializes all configuration folders
2. ✅ Creates NEXT_ACTION.md (tracks where you are in the project)
3. ✅ Creates MY_PROJECT.md (your project brief)
4. ✅ Sets up steering files for your AI tool (Cursor, Windsurf, Kiro, Claude, etc.)
5. ✅ Creates project directories (for specs, tasks, code, tests, docs)
6. ✅ Validates everything works correctly

**Result**: Your AI tool automatically knows how to help with your project.

### On Every Request

The library silently:
1. ✅ Checks library health (is everything in place?)
2. ✅ Repairs broken configs (if something is missing, it adds it back)
3. ✅ Deploys steering files (puts itself in position for your current AI tool)
4. ✅ Detects version updates (if you pulled a new version)
5. ✅ Routes your request correctly (atomic task vs complex feature vs continue work)

**Result**: The library always works, even if something broke or was deleted.

### When Your Submodule Updates

The library detects the version change and:
1. ✅ Refreshes steering files automatically
2. ✅ Validates new version's integrity
3. ✅ Updates integration points
4. ✅ Continues seamlessly with no action from you

**Result**: You get library updates and improvements automatically.

---

## File Structure (What Gets Created)

After first use, your project will have this structure:

```
your-project/
├── .ai-prompts/                      # The library (Git submodule)
├── .ai-steering/                     # Steering files (auto-created)
├── .claude/                          # Claude Code config (auto-updated)
├── .cursor/rules/                    # Cursor rules (auto-created)
├── .kiro/steering/                   # Kiro steering (auto-created)
├── .windsurf/rules/                  # Windsurf rules (auto-created)
├── NEXT_ACTION.md                    # Current status (auto-created)
├── MY_PROJECT.md                     # Your project brief (auto-created)
├── README.md                         # Your project docs
├── src/                              # Your source code
├── tests/                            # Your tests
├── docs/                             # Your documentation
└── prompts/outputs/                  # Library outputs
    ├── specifications/               # Generated specs
    ├── task-lists/                   # Generated tasks
    └── architecture/                 # Generated architecture docs
```

The `.*` folders and files are .gitignored and safe to delete — the library recreates them as needed.

---

## Troubleshooting

### What if something breaks?

Just ask your AI tool to fix it. The library's auto-stabilization will detect it on the next request and repair it automatically.

Example:
```
The steering files are missing from .cursor/rules
```

The AI tool will ask the library to self-diagnose, the library will detect the problem, fix it, and continue.

### What if I delete a config folder?

It will be recreated automatically on the next AI request (during auto-stabilization phase).

### What if I update the submodule but things feel weird?

Give the library one full request cycle and it will refresh everything:

```
Continue
```

Or just ask your AI anything normally, and it will detect the version change and auto-adjust.

### What if I want to know what's happening?

The library logs its auto-stabilization to `.ai-prompts/.state/` (hidden from you by default). You can check:

```bash
cat .ai-prompts/.state/last-health-score      # Library health (0-100)
cat .ai-prompts/.state/last-version           # Current library version
cat .ai-prompts/.state/last-integration-check # When last validated
```

#### Audit Trail
All **actual prompts executed** by the library (setup, routing, pipeline, implementation, continue, etc.) are recorded to
`.ai-prompts/.state/audit.log` in JSONL format. This gives you visibility into what the AI agent is sending to the model for each step.

You can review recent entries with the bundled query tool:

```bash
.ai-prompts/.scripts/audit_query.sh --tail 20
.ai-prompts/.scripts/audit_query.sh --source ".ai-prompts/prompts/orchestrators/auto-setup-orchestrator.md"
```

**Audit System Architecture**: The library uses a **centralized audit dispatcher** in `.ai-prompts/.scripts/lib.sh` with three core functions:
- `record_actual_prompt()` — Records JSONL entry with complete metadata
- `audit_and_log_orchestrator()` — Extracts snippet from orchestrator file and logs it
- `invoke_orchestrator_with_audit()` — Combined log+emit helper

> **Auto-Wrapping Note:** After `.ai-prompts/.scripts/lib.sh` is sourced (the
> entry point does this automatically), the shell's `source` and `.` builtins are
> overridden. Any subsequent `source .ai-prompts/prompts/orchestrators/...` call
> will automatically log and print the orchestrator contents. You no longer need
> to add explicit audit calls — just source the file as usual.

This centralized approach eliminates duplicate audit code and ensures all system activities are logged consistently.

For technical details, see [AUDIT_CENTRALIZATION_SUMMARY.md](./docs/AUDIT_CENTRALIZATION_SUMMARY.md).

No configuration is required; the audit log is maintained automatically.

But you don't usually need to read it — the library just works.

---

## For Different AI Tools

No matter which AI tool you use, the setup is identical:

| Tool | What Happens |
|------|--------------|
| **Cursor** | Library deploys to `.cursor/rules/` automatically |
| **Windsurf** | Library deploys to `.windsurf/rules/` automatically |
| **Kiro IDE** | Library deploys to `.kiro/steering/` automatically |
| **Claude/ChatGPT** | Library deploys to `.ai-steering/` automatically |
| **Continue** | Library sets up reference in `.continue/config.json` automatically |
| **Any other tool** | Library deploys to `.ai-steering/` as fallback |

**You don't configure anything** — the library detects your tool and configures itself.

---

## For Advanced Users

If you want to understand how the auto-stabilization works, see:
- `.ai-prompts/prompts/orchestrators/ai-agent-entry-point.md` — Main entry point with Step 0 (auto-stabilization)
- `.ai-prompts/prompts/steering/library-context.md` — How the library integrates with your AI tool
- `.ai-prompts/PREVENTION_CHECKLIST.md` — Safety safeguards that protect your project

---

## Next Steps

1. **Add the library** (3-command clone from Step 1 above)
2. **Ask your AI tool something** — anything will work
3. **The library auto-initializes** and starts helping
4. **Enjoy seamless AI-assisted development**

That's genuinely it. The library handles the rest.

---

**Questions?** See `.ai-prompts/README.md` for comprehensive documentation.

**Issues?** The library's self-healing will detect and fix most problems automatically. If something persists, check `.ai-prompts/docs/SAFEGUARDS.md` for the architectural guarantees the library maintains.
