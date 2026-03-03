# Integration Guide for AI Tools and IDEs

This guide explains how AI tools (Cursor, Windsurf, Kiro, Claude Code Extensions, etc.) can integrate with the AI Prompt Library's self-stabilization system.

---

## Overview

The AI Prompt Library is designed to be **transport-agnostic** — it works with any AI tool without the tool needing to do anything special.

**How it works:**

1. User adds library to project (Git submodule or clone)
2. User makes any request to their AI tool
3. **Library auto-detects and initializes itself** (Step 0: Auto-Stabilization)
4. **Library routes and executes the request** (Steps 1-4 in entry point)
5. User gets seamless AI-assisted development experience

**No tool configuration needed.** The library handles everything.

---

## For Tool Developers: Making Library Detection Work

If you're building an AI IDE or chat interface, you can optimize integration with one simple check:

### Recommended: Lightweight Hook on Startup

Add this check when your tool starts or when it detects a project:

```bash
#!/bin/bash
# Simple check: is AI Prompt Library present?
if [ -f ".ai-prompts/prompts/AGENTS.md" ]; then
    # Library is present, enable features
    LIBRARY_READY=true
else
    # Library not present, continue normally
    LIBRARY_READY=false
fi
```

If library is present, users will get enhanced prompts automatically.

### Optional: Steering File Integration

If your tool supports configuration files, you can look for library steering files:

```bash
# Check for steering files in tool-specific location
if [ -f ".your-tool/rules/library-context.md" ]; then
    LOAD_STEERING_FILES=true
fi
```

The library auto-deploys steering files to multiple locations:
- `.cursor/rules/` (for Cursor)
- `.windsurf/rules/` (for Windsurf)
- `.kiro/steering/` (for Kiro)
- `.idea/ai-rules/` (for JetBrains IDEs)
- `.ai-steering/` (fallback for all tools)

Pick whichever matches your tool's convention.

---

## What Gets Deployed (Steering Files)

The library auto-deploys these files to your tool's configuration location:

### `library-context.md`
**Purpose**: Explains what the library is and how to use it
**Use**: Load as system context on project startup
**Size**: ~2KB

### `architecture-guard.md`
**Purpose**: Guidelines for safe modifications
**Use**: Load when user is about to make code changes
**Size**: ~1.5KB

### `change-review.md`
**Purpose**: Checklist for reviewing changes
**Use**: Load when user is reviewing code before commit
**Size**: ~2KB

### How to Load (Example for Cursor)

```bash
# Cursor looks in .cursor/rules/ for rule files
# Library auto-creates and maintains these

# In your tool's startup:
if [ -f ".cursor/rules/library-context.md" ]; then
    SYSTEM_CONTEXT += read_file(".cursor/rules/library-context.md")
fi
```

### How to Load (Generic Tool)

```bash
# Fallback location that library deploys to
if [ -f ".ai-steering/library-context.md" ]; then
    SYSTEM_CONTEXT += read_file(".ai-steering/library-context.md")
fi
```

---

## How the Library Auto-Initializes

You don't need to invoke setup. The library detects its own state via **Step 0: Auto-Stabilization** in `ai-agent-entry-point.md`.

Every request triggers:

```
Step 0: Auto-Stabilization (Silent)
├─ Phase 1: Detect version (new/updated/current)
├─ Phase 2: Deploy steering files to all tool locations
├─ Phase 3: Validate & self-repair
└─ Phase 4: Handle version upgrades
    ↓
Step 1: Auto-Route Request (Visible)
├─ Check if library initialized
├─ Classify request (setup/atomic/pipeline/continue)
└─ Route appropriately
    ↓
Step 2+: Execute (Varies)
└─ Run appropriate orchestrator
```

**From your tool's perspective:** You don't need to do anything. The library routes itself.

---

## Integration Strategies

### Strategy 1: Zero Integration (Recommended for Most Tools)

The library works without any tool-specific integration:

1. User has library in project
2. User makes a request
3. Library detects itself (Step 0)
4. Library routes and executes
5. Done

**Advantages:**
- Zero work for tool developers
- Works with any AI tool immediately
- Transparent to users

**Disadvantages:**
- Steering files loaded after library is detected (not before)
- Slightly less optimized (one extra request cycle)

---

### Strategy 2: Lightweight Integration (Recommended for Pro Tools)

Load steering files on project startup:

```bash
#!/bin/bash
# In your tool's project initialization:

detect_library_and_load_steering() {
    if [ ! -d ".ai-prompts" ]; then
        return  # No library, skip
    fi
    
    # Tool-specific location (example: Cursor)
    STEERING_DIR=".cursor/rules"
    
    # Fallback location
    if [ ! -d "$STEERING_DIR" ]; then
        STEERING_DIR=".ai-steering"
    fi
    
    # Load steering files into system context
    if [ -d "$STEERING_DIR" ]; then
        for file in "$STEERING_DIR"/*.md; do
            [ -f "$file" ] && SYSTEM_CONTEXT+="$(cat "$file")\n"
        done
        return 0
    fi
    return 1
}

# Call on startup
detect_library_and_load_steering
```

**Advantages:**
- Steering loaded before user makes request
- Tool can display "AI Prompt Library detected" UI
- Better UX (users see library is available)

**Disadvantages:**
- Requires tool-specific integration code
- Adds startup latency (minimal - ~50ms)

---

### Strategy 3: Full Integration (For Built-In Assistants)

Integrate entry point invocation:

```bash
#!/bin/bash
# For tools that fully embrace the library

on_user_request() {
    local user_request="$1"
    
    # Check if library is available
    if [ ! -f ".ai-prompts/prompts/AGENTS.md" ]; then
        # Library not present, respond normally
        respond_to_request("$user_request")
        return
    fi
    
    # Library is present, use entry point
    # This could be:
    # 1. Call ai-agent-entry-point.md directly
    # 2. Load it as system context
    # 3. Invoke as subprocess
    
    entry_point=$(cat .ai-prompts/prompts/orchestrators/ai-agent-entry-point.md)
    result=$(invoke_llm_with_context("$entry_point", "$user_request"))
    respond("$result")
}
```

**Advantages:**
- Full library capabilities available
- Entry point already handling setup detection
- Users get all library features automatically

**Disadvantages:**
- Most complex integration
- Requires understanding entry point format
- Tool-specific glue code needed

---

## Adding Your Tool to Library

To add support for your tool in the library's auto-deployment phase:

### Step 1: Identify Tool Configuration Location

Where does your tool look for configuration/rules/context?

Examples:
- Cursor: `.cursor/rules/`
- Windsurf: `.windsurf/rules/`
- Kiro: `.kiro/steering/`
- Continue: `.continue/config.json`
- Custom tool: `.mytool/ai-config/`

### Step 2: Update Library Deployment (Optional)

Post an issue at: https://github.com/ameedanxari/ai-prompt-library/issues

Include:
- Tool name
- Configuration directory convention
- Tool's documentation link

Library maintainers will add automatic deployment for your tool.

### Step 3: Document Integration

Add entry to [Tool-Specific Setup](#tool-specific-setup) section below.

---

## Tool-Specific Setup

### Cursor

**Config Location**: `.cursor/rules/`

**Integration Level**: Automatic (library deploys steering files)

**Recommend** to users:
```
The AI Prompt Library works with Cursor automatically. Just add it to your project:

git submodule add https://github.com/ameedanxari/ai-prompt-library.git .ai-prompts
```

**Advanced**: If you want to pre-load library context on project open:
```json
// In .cursor/rules/.cursorignore or custom config
// Library files auto-appear after first request
```

### Windsurf

**Config Location**: `.windsurf/rules/`

**Integration Level**: Automatic (library deploys steering files)

**Recommend** to users:
```
The AI Prompt Library works with Windsurf automatically:

git submodule add https://github.com/ameedanxari/ai-prompt-library.git .ai-prompts
```

### Kiro IDE

**Config Location**: `.kiro/steering/`

**Integration Level**: Automatic (library deploys steering files)

**Recommend** to users:
```
The AI Prompt Library works with Kiro automatically:

git submodule add https://github.com/ameedanxari/ai-prompt-library.git .ai-prompts
```

### Claude Code / Claude Extensions

**Config Location**: `.claude/` (managed by VS Code)

**Integration Level**: Automatic with hooks

**How it works**:
1. Library deploys to `.ai-steering/`
2. VS Code hook detects library
3. Hook invokes entry point
4. Library routes and executes

**Setup**:
```bash
# User runs once (optional, library also does this):
mkdir -p .claude
cp .ai-prompts/prompts/steering/*.md .claude/
```

### Continue (JetBrains IDEs)

**Config Location**: `.continue/rules/`

**Integration Level**: Automatic

**How to reference**:
```json
// In .continue/config.json
{
  "rules": [
    ".continue/rules/library-context.md",
    ".continue/rules/architecture-guard.md"
  ]
}
```

### Aider

**Config Location**: `.aider.conf.yml`

**Integration Level**: Manual reference (for now)

**How to reference**:
```yaml
# In .aider.conf.yml
read:
  - .ai-prompts/prompts/steering/library-context.md
  - .ai-prompts/prompts/steering/architecture-guard.md
```

### ChatGPT / Claude (Web Interface)

**Config Location**: No config needed

**How to use**:
1. Copy library to project: `git clone https://github.com/ameedanxari/ai-prompt-library.git .ai-prompts`
2. In web chat, paste:
```
I want to use the AI Prompt Library to build my project.

Library path: .ai-prompts/

My idea: [description]

Please invoke the entry point and help me build this.
```

---

## Testing Integration

### VS Code (Visual Studio Code)

**Config Location**: `.vscode/ai-steering/` and `.vscode/settings.json`

**Integration Level**: Automatic (library deploys steering files and will write a workspace `settings.json` entry)

**What the library does**:
- Creates `.vscode/ai-steering/` and copies steering `.md` files there
- Writes or merges the workspace setting `"aiPromptLibrary.steeringPath": ".vscode/ai-steering"` into `.vscode/settings.json` (non-destructive merge)
- Falls back to `.ai-steering/` if a tool-specific location is preferred

**How your extension/editor can load steering**:
1. Prefer workspace settings key `aiPromptLibrary.steeringPath` when present.
2. Otherwise look in `.vscode/ai-steering/` or `.ai-steering/`.

**Developer note**: the library uses a small, portable Python JSON merge to avoid depending on external tools. If your environment restricts file writes, consider reading `.ai-steering/` as a fallback.

**Quick check (in project root)**:
```bash
ls -la .vscode/ai-steering/
cat .vscode/settings.json | jq .aiPromptLibrary.steeringPath  # optional
```


To verify library works with your tool:

### Quick Test

```bash
# 1. Create test project
mkdir test-project && cd test-project
git init
git submodule add https://github.com/ameedanxari/ai-prompt-library.git .ai-prompts

# 2. Make a simple request through your tool
# (e.g., "Fix typo in README")

# 3. Check for artifacts
ls -la .ai-steering/          # Should see steering files
ls -la NEXT_ACTION.md        # Should exist after first request
cat NEXT_ACTION.md           # Should be properly formatted
```

### Comprehensive Test

```bash
# 1. Test new project setup
# User: "I want to build a task manager app"
# Expected: MY_PROJECT.md created, library initialized

# 2. Test atomic task
# User: "Fix typo on line 5 of README"
# Expected: Direct execution, no setup needed

# 3. Test continuation
# User: "Continue"
# Expected: NEXT_ACTION.md read, next stage executed

# 4. Test version update
cd .ai-prompts && git pull origin main && cd ..
# User: "Continue"
# Expected: Library detects update, refreshes seamlessly
```

---

## Performance Expectations

### Startup Impact

- **First detection**: ~1-2ms (git check)
- **Steering load**: ~50-100ms (file I/O)
- **Full initialization**: ~100-200ms (first request only)

### Per-Request Impact

- **Stabilization check**: ~100-200ms (minimal on healthy system)
- **Routing**: ~50ms (decision logic)
- **Execution**: Varies (depends on orchestrator)

**Total overhead**: ~150-300ms per request, with most overhead on first request.

---

## Troubleshooting Integration

### Library Not Detected

**Symptom**: Library appears not to initialize

**Check**:
```bash
# Is library present?
ls .ai-prompts/prompts/AGENTS.md

# Are steering files deployed?
ls .cursor/rules/library-context.md  # or tool-specific location
```

**Fix**: User can manually trigger setup by saying "use the AI prompt library"

### Steering Files Not Loading

**Symptom**: Library context not visible in requests

**Check**:
```bash
# Are steering files present?
ls .ai-steering/

# Are they readable?
cat .ai-steering/library-context.md
```

**Fix**: 
- Library will auto-deploy next request
- Or tool can manually load from `.ai-steering/` fallback

### Version Update Issues

**Symptom**: After git pull, library misbehaves

**Check**:
```bash
# What version is running?
cd .ai-prompts && git rev-parse HEAD

# Did library detect update?
cat .ai-prompts/.state/last-version
```

**Fix**: Next user request will trigger validation, or user can say "continue" to refresh

---

## Questions, Issues, Feature Requests?

- **GitHub Issues**: https://github.com/ameedanxari/ai-prompt-library/issues
- **Discussions**: https://github.com/ameedanxari/ai-prompt-library/discussions
- **Feedback**: Tag `@library-integration` in issues

**We want to make this work perfectly with your tool!**
