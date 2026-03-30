# AI Agent Entry Point

You are an **AI Agent** working with the **AI Prompt Library**. This is your **primary entry point** for handling any user request optimally and automatically.

This entry point now includes **automatic self-stabilization** — it silently checks and fixes library state before processing any request. Users experience seamless operation without seeing setup complexity.

## 🛡️ CRITICAL SAFEGUARDS - MANDATORY FIRST STEPS

### CHANGE IMPACT GUARD - ALWAYS FIRST
Before ANY modifications to this codebase, you MUST:

1. **STOP and Assess**: Never make changes without impact assessment
2. **Understand Architecture**: This library contains test validators (TypeScript) + automation (orchestrators)  
3. **Run Tests First**: Always `npm test` to understand current system state
4. **Validate File Purpose**: Check if files are test validators before considering removal
5. **Maintain Test Success**: Current baseline is 590+ passing tests - never reduce this

```bash
# MANDATORY: Run this before any changes
echo "🛡️ CHANGE IMPACT GUARD: Mandatory pre-change assessment"
npm test 2>&1 | tee current_test_status.log
echo "📊 Current system state recorded - review before proceeding"
echo "❌ NO CHANGES ALLOWED without completing impact assessment"
```

### 🏥 SELF-HEALING MONITOR - CONTINUOUS PROTECTION
The system continuously monitors for:
- Test success rate degradation (must stay >95%)
- Missing critical files  
- Architecture violations
- Regression patterns
- **NEW**: Version updates and configuration drift

## Purpose
This template provides a **single command** that AI agents can use to automatically:
- **Auto-stabilize** library (silent self-healing)
- Handle version upgrades transparently
- Route requests to the optimal execution path
- Handle setup, atomic tasks, and pipeline tasks seamlessly
- Maintain state across sessions and agent handoffs
- Ensure consistent, high-quality outputs
- **PREVENT DESTRUCTIVE CHANGES** through mandatory safeguards

## Operational Contract (Mandatory)
For this and all future requests:
1. Route through `auto-request-router.md` first and log the routing decision.
2. For pipeline work, scan source materials in `working_copy/` and `prompts/working_copy/` (if present).
3. Generate design-system foundation + component catalog artifacts before screen-level implementation prompts.
4. Generate API integration contracts, data architecture, and backend infrastructure plans before implementation task execution.
5. Maintain stage-by-stage prompt traceability in `prompt-usage-log.md`.
6. Maintain output-to-prompt mapping in `prompt-composition-index.md`.
7. Ensure each generated artifact includes `Prompt Blocks Applied`.
8. Require deployment prerequisites package (environment matrix + access/secrets checklist) before Stage 07 completion.
9. Do not treat stub-only paths as production completion.
10. Require concrete traceability: no grouped labels/wildcards in prompt usage or composition artifacts.
11. Require Stage 06 implementation prompt pack generation (index + one prompt file per task).
12. Require Stage 04 endpoint-level API matrix and screen-by-screen fidelity matrix.
13. Require UI tracks to sequence design-system foundation/component-primitives tasks before screen tasks.
14. Reject Stage 06 completion when per-task prompts contain unresolved placeholders or missing prompt lineage.
15. For UI scope projects, require dedicated design-system templates and outputs:
    - `design-system-foundation-template.md`
    - `design-system-component-catalog-template.md`
    - `design-system-implementation-sequencing-template.md`
    - `design-system-verification-report-template.md`
16. For Stage 06 per-task prompts, require:
    - at least one semantic module path (`.ai-prompts/prompts/modules/...`) based on task intent
    - at least one technology-stack module path (`.ai-prompts/prompts/modules/technology-stacks/...`) based on project stack.
    - for `profile`, `discovery/search`, `analytics/reporting`, and `moderation/review` intents, require dedicated semantic modules (not only `integration/service-integration`).
17. For hi-fidelity UI scope, enforce screen-level parity gates before marking tasks complete:
    - source mockup anchors per screen
    - shell composition checks (sidebar/topbar/page chrome)
    - typography/spacing/token/iconography checks
    - no scaffold/placeholder substitutions as final output

## How to Use This Template

### For AI Agents (Kiro, Cursor, Windsurf, Claude, etc.)
When you receive **any user request**, simply invoke this template:

```
I'll analyze your request and route it optimally using the AI Prompt Library system.

*Invoking AI Agent Entry Point...*
```

The library will automatically:
1. Check and fix configuration state silently
2. Handle version updates transparently  
3. Route your request optimally
4. Maintain seamless state across sessions

No user setup needed — it just works.

## Automatic Execution Protocol

### Step 0: Auto-Stabilization (Silent - Every Invocation)
**This happens invisibly before processing any request:**

```bash
# Initialize state tracking directory
mkdir -p .ai-prompts/.state 2>/dev/null || true

# === PHASE 1: VERSION TRACKING ===
detect_version_change() {
    if [ ! -d ".ai-prompts" ]; then
        # Library doesn't exist yet, will be created in setup phase
        echo "new"
        return
    fi
    
    CURRENT_VERSION=$(cd .ai-prompts && git rev-parse HEAD 2>/dev/null || echo "0")
    LAST_KNOWN_VERSION=$(cat .ai-prompts/.state/last-version 2>/dev/null || echo "0")
    
    if [ "$CURRENT_VERSION" != "$LAST_KNOWN_VERSION" ]; then
        echo "updated"
        echo "$CURRENT_VERSION" > .ai-prompts/.state/last-version 2>/dev/null || true
        return
    fi
    echo "current"
}

VERSION_STATUS=$(detect_version_change)

# Source centralized library (includes record_actual_prompt, audit_and_log_orchestrator)
# ➤ also overrides `source`/`.` so any later sourcing of an orchestrator file
#    automatically logs and dumps its content.  This enables zero-effort audit
#    wrapping (Phase 3 auto-wrap).
if [ -f ".ai-prompts/.scripts/lib.sh" ]; then
    . ".ai-prompts/.scripts/lib.sh"
fi

# === PHASE 2: STEERING FILE DEPLOYMENT (Broad) ===
# Deploy to ALL tool locations preemptively (not just detected ones)
# Users never see this — it just silently ensures configs exist everywhere
deploy_steering_files() {
    if [ ! -d ".ai-prompts/prompts/steering" ]; then
        return  # Library not initialized yet
    fi
    
    # Kiro IDE (prefer symlinked steering files)
    mkdir -p .kiro/steering 2>/dev/null && \
    ln -sf .ai-prompts/prompts/steering/*.md .kiro/steering/ 2>/dev/null || true

    # Cursor
    mkdir -p .cursor/rules 2>/dev/null && \
    ln -sf .ai-prompts/prompts/steering/*.md .cursor/rules/ 2>/dev/null || true

    # Windsurf
    mkdir -p .windsurf/rules 2>/dev/null && \
    ln -sf .ai-prompts/prompts/steering/*.md .windsurf/rules/ 2>/dev/null || true

    # JetBrains IDEs (Cursor, IntelliJ, etc.)
    mkdir -p .idea/ai-rules 2>/dev/null && \
    ln -sf .ai-prompts/prompts/steering/*.md .idea/ai-rules/ 2>/dev/null || true

    # VS Code: create a dedicated folder and add workspace setting to reference it (symlink the canonical files)
    mkdir -p .vscode/ai-steering 2>/dev/null || true
    ln -sf .ai-prompts/prompts/steering/*.md .vscode/ai-steering/ 2>/dev/null || true
    # Merge steering path into .vscode/settings.json (safe merge using python)
    if command -v python3 >/dev/null 2>&1 || command -v python >/dev/null 2>&1; then
        PY=$(command -v python3 2>/dev/null || command -v python)
        $PY - <<'PY' 2>/dev/null || true
import json,os
settings_path='.vscode/settings.json'
settings={}
if os.path.exists(settings_path):
    try:
        with open(settings_path,'r') as f:
            settings=json.load(f)
    except Exception:
        settings={}
settings_key='aiPromptLibrary.steeringPath'
if settings.get(settings_key)!=(os.path.join('.vscode','ai-steering')):
    settings[settings_key]=os.path.join('.vscode','ai-steering')
    os.makedirs(os.path.dirname(settings_path),exist_ok=True)
    with open(settings_path,'w') as f:
        json.dump(settings,f,indent=2)
PY
    fi

    # Generic fallback
    mkdir -p .ai-steering 2>/dev/null && \
    cp .ai-prompts/prompts/steering/*.md .ai-steering/ 2>/dev/null || true
}

ensure_project_agents_steering() {
    if [ ! -f "AGENTS.md" ]; then
cat > AGENTS.md << 'EOF'
# AGENTS

This file provides project-level instructions for AI coding agents.
EOF
    fi

    if ! grep -q "AI Prompt Library Steering (Auto-Managed)" AGENTS.md; then
cat >> AGENTS.md << 'EOF'

## AI Prompt Library Steering (Auto-Managed)
Always load and follow these files before executing user requests:
- `.ai-prompts/prompts/steering/library-context.md`
- `.ai-prompts/prompts/steering/architecture-guard.md`
- `.ai-prompts/prompts/steering/change-review.md`

Routing requirement:
- Route every request through `.ai-prompts/prompts/orchestrators/ai-agent-entry-point.md`
- Use `.ai-prompts/prompts/orchestrators/auto-request-router.md` before task execution
<!-- /AI Prompt Library Steering (Auto-Managed) -->
EOF
    fi
}

# === PHASE 3: VALIDATION & SELF-HEALING ===
validate_and_repair() {
    HEALTH_SCORE=100
    
    # Check library integrity
    if [ ! -f ".ai-prompts/prompts/AGENTS.md" ]; then
        HEALTH_SCORE=$((HEALTH_SCORE - 30))
    fi
    
    # Check state files
    if [ -f "NEXT_ACTION.md" ]; then
        if ! grep -q "Current Status" NEXT_ACTION.md 2>/dev/null; then
            # Corrupted state file — auto-recreate
            rm NEXT_ACTION.md
            HEALTH_SCORE=$((HEALTH_SCORE - 10))
        fi
    fi
    
    # Check for missing steering files
    STEERING_COUNT=0
    [ -d ".kiro/steering" ] && STEERING_COUNT=$((STEERING_COUNT + 1))
    [ -d ".cursor/rules" ] && STEERING_COUNT=$((STEERING_COUNT + 1))
    [ -d ".windsurf/rules" ] && STEERING_COUNT=$((STEERING_COUNT + 1))
    [ -d ".ai-steering" ] && STEERING_COUNT=$((STEERING_COUNT + 1))
    
    if [ $STEERING_COUNT -eq 0 ] && [ -d ".ai-prompts" ]; then
        HEALTH_SCORE=$((HEALTH_SCORE - 20))
    fi

    # Check project-level AGENTS steering references
    if [ ! -f "AGENTS.md" ] || ! grep -q "AI Prompt Library Steering (Auto-Managed)" AGENTS.md 2>/dev/null; then
        HEALTH_SCORE=$((HEALTH_SCORE - 10))
    fi
    
    # Repair low health
    if [ $HEALTH_SCORE -lt 70 ]; then
        # Silent auto-fix: deploy steering files
        deploy_steering_files
        ensure_project_agents_steering
        HEALTH_SCORE=$((HEALTH_SCORE + 20))
    fi
    
    echo $HEALTH_SCORE
}

# === PHASE 4: VERSION UPGRADE HANDLING ===
handle_version_upgrade() {
    if [ "$VERSION_STATUS" = "updated" ]; then
        # Library was updated (submodule changed)
        # Refresh steering files silently
        deploy_steering_files
        
        # Validate safeguards work with new version
        if [ -f ".ai-prompts/scripts/validate-safeguards.sh" ]; then
            bash .ai-prompts/scripts/validate-safeguards.sh >/dev/null 2>&1 || true
        fi

        # Run project-level integration validation if available (non-blocking)
        if [ -f ".ai-prompts/scripts/validate-project-integration.sh" ]; then
            bash .ai-prompts/scripts/validate-project-integration.sh >/dev/null 2>&1 || true
        fi

            # Run COVE validator if present (non-blocking)
            if [ -f ".ai-prompts/.scripts/validate_cove.sh" ]; then
                bash .ai-prompts/.scripts/validate_cove.sh >/dev/null 2>&1 || true
            fi
        
        # Update integration tracking
        echo "$(date -u +%Y-%m-%dT%H:%M:%SZ)" > .ai-prompts/.state/last-integration-check
    fi
}

# === EXECUTION: Run all stabilization phases ===
HEALTH=$(validate_and_repair)
deploy_steering_files
ensure_project_agents_steering
handle_version_upgrade

# Run COVE validator after deployment if available and record timestamp
if [ -f ".ai-prompts/.scripts/validate_cove.sh" ]; then
    bash .ai-prompts/.scripts/validate_cove.sh >/dev/null 2>&1 || true
    echo "$(date -u +%Y-%m-%dT%H:%M:%SZ)" > .ai-prompts/.state/last-cove-check 2>/dev/null || true
fi

# Store health score for monitoring
echo "$HEALTH" > .ai-prompts/.state/last-health-score 2>/dev/null || true
```

**Result**: Library is always in a healthy, properly-configured state. Users never see any of this.

### Step 1: Auto-Route the Request
**First, determine the optimal path:**

```bash
# Quick context check
echo "🔍 Analyzing request and project context..."

# Check if AI Prompt Library is set up
if [ ! -f ".ai-prompts/prompts/AGENTS.md" ]; then
    echo "📋 ROUTE: Setup needed"
    ROUTE="SETUP"
elif [ ! -f "NEXT_ACTION.md" ]; then
    echo "📋 ROUTE: Setup needed (missing state files)"
    ROUTE="SETUP"
else
    echo "📋 Library initialized, analyzing request type..."
    ROUTE="ANALYZE"
fi
```

### Step 2: Execute Based on Route

# Log request routing audit via centralized dispatcher
audit_and_log_orchestrator ".ai-prompts/prompts/orchestrators/auto-request-router.md" >/dev/null 2>&1 || true

#### If ROUTE="SETUP":

# Log and emit setup orchestrator via centralized dispatcher
# (automatically prints the markdown to the AI agent's output)
invoke_orchestrator_with_audit ".ai-prompts/prompts/orchestrators/auto-setup-orchestrator.md" >/dev/null 2>&1 || true

# (the orchestrator file contains its own instructions and `bash` commands)
```bash
# Initialize library (git submodule or clone)
if [ -d ".git" ]; then
    git submodule add https://github.com/ameedanxari/ai-prompt-library.git .ai-prompts 2>/dev/null || echo "Submodule may already exist"
    git submodule update --init --recursive
else
    git clone https://github.com/ameedanxari/ai-prompt-library.git .ai-prompts
    echo ".ai-prompts/" >> .gitignore 2>/dev/null || true
fi

# Detect and setup steering files
if [ -d ".kiro" ]; then
    mkdir -p .kiro/steering
    cp .ai-prompts/prompts/steering/*.md .kiro/steering/ 2>/dev/null || true
    echo "✅ Configured steering files for Kiro"
elif [ -d ".cursor" ]; then
    mkdir -p .cursor/rules
    cp .ai-prompts/prompts/steering/*.md .cursor/rules/ 2>/dev/null || true
    echo "✅ Configured steering files for Cursor"
elif [ -d ".windsurf" ]; then
    mkdir -p .windsurf/rules
    cp .ai-prompts/prompts/steering/*.md .windsurf/rules/ 2>/dev/null || true
    echo "✅ Configured steering files for Windsurf"
else
    mkdir -p .ai-steering
    cp .ai-prompts/prompts/steering/*.md .ai-steering/ 2>/dev/null || true
    echo "✅ Created generic steering files"
fi

# Create directory structure
mkdir -p prompts/outputs/specifications
mkdir -p prompts/outputs/task-lists
mkdir -p prompts/outputs/architecture
mkdir -p prompts/working_copy
mkdir -p prompts/archive
mkdir -p src tests docs

echo "✅ Directory structure created"

# Ensure project-level AGENTS.md contains steering references
if [ ! -f "AGENTS.md" ]; then
cat > AGENTS.md << 'EOF'
# AGENTS

This file provides project-level instructions for AI coding agents.
EOF
fi

if ! grep -q "AI Prompt Library Steering (Auto-Managed)" AGENTS.md; then
cat >> AGENTS.md << 'EOF'

## AI Prompt Library Steering (Auto-Managed)
Always load and follow these files before executing user requests:
- `.ai-prompts/prompts/steering/library-context.md`
- `.ai-prompts/prompts/steering/architecture-guard.md`
- `.ai-prompts/prompts/steering/change-review.md`

Routing requirement:
- Route every request through `.ai-prompts/prompts/orchestrators/ai-agent-entry-point.md`
- Use `.ai-prompts/prompts/orchestrators/auto-request-router.md` before task execution
<!-- /AI Prompt Library Steering (Auto-Managed) -->
EOF
fi

echo "✅ AGENTS.md steering references ensured"
```

**Create NEXT_ACTION.md:**
```bash
cat > NEXT_ACTION.md << 'EOF'
# Next Action

## Current Status
- **Stage**: Setup Complete
- **Phase**: Ready for Project Brief
- **Mode**: Standard

## Next Action
Fill out MY_PROJECT.md with your project idea, then say "Continue" to start Stage 01 - Intake.

## Prerequisites
- [x] AI Prompt Library initialized
- [x] Steering files configured
- [x] AGENTS.md references steering files
- [x] State files created
- [ ] Project brief completed in MY_PROJECT.md

## Context Files
- MY_PROJECT.md (fill this out next)
- .ai-prompts/prompts/AGENTS.md
- AGENTS.md (project root)

## Instructions
1. Edit MY_PROJECT.md with your project description
2. Say "Continue" or "Start Stage 01" to begin the specification pipeline
3. The AI will automatically guide you through all 10 stages

---
*Generated by AI Agent Entry Point*
EOF
```

**Create MY_PROJECT.md template:**
```bash
cat > MY_PROJECT.md << 'EOF'
# My Project Brief

## Project Description
[Describe your project idea here - even 2-3 sentences is enough!]

Example: "A task management app for remote teams with real-time collaboration, file sharing, and progress tracking. Should work on web and mobile with offline support."

## Platforms
- [ ] Web Application
- [ ] Mobile App (iOS/Android)
- [ ] Desktop Application
- [ ] API/Backend Service
- [ ] Other: ___________

## Domain/Industry
[e.g., Productivity, E-commerce, Healthcare, Education, Finance, etc.]

## Key Requirements
1. [First key requirement]
2. [Second key requirement]
3. [Third key requirement]

## Success Criteria
- [What does success look like?]
- [How will you measure it?]

---

## Instructions for AI Agent
Once you've filled in the above information, say "Continue" or "Start Stage 01" to begin the AI Prompt Library specification pipeline.

---
*Template generated by AI Agent Entry Point*
EOF
```

**Display setup completion:**
```markdown
🎉 **AI Prompt Library Setup Complete!**

✅ Library initialized (.ai-prompts/)
✅ Steering files configured for your AI tool
✅ AGENTS.md updated with steering references
✅ State files created (NEXT_ACTION.md, MY_PROJECT.md)
✅ Directory structure ready

## Next Steps:
1. **Edit MY_PROJECT.md** with your project idea
2. **Say "Continue"** to start the specification pipeline
3. The AI will guide you through all 10 stages automatically

## What You'll Get:
- Complete requirements and architecture
- Detailed feature specifications  
- Testing strategy and test cases
- Step-by-step implementation tasks
- Deployment configurations
- Production-ready defaults

**Ready to transform your idea into production-ready specs!**
```

#### If ROUTE="ANALYZE":
**Analyze the request type:**

```bash
# Read current state
echo "📖 Reading current project state..."
if [ -f "NEXT_ACTION.md" ]; then
    echo "Current stage from NEXT_ACTION.md:"
    grep -A 3 "Stage.*:" NEXT_ACTION.md || echo "Stage info not found"
fi

# Check for pending work
PENDING_TASKS=0
if [ -f "EXECUTION_PROGRESS.md" ]; then
    PENDING_TASKS=$(grep -c "\[ \]" EXECUTION_PROGRESS.md 2>/dev/null || echo "0")
fi

echo "Pending tasks: $PENDING_TASKS"
```

**Then classify the request:**

```markdown
**🎯 ANALYZING REQUEST**

Let me determine the optimal approach for your request...
```

**Classification Logic:**
1. **Implementation Request**: User requests implementation/development
   - Indicators: "start implementation", "begin development", "build the project", "implement", "start coding", "execute the plan"
   - Action: **MANDATORY** - Invoke Implementation Enforcement Orchestrator
   
2. **Continue/Resume Request**: User says "continue", "resume", "next", "proceed"
   - Action: Read NEXT_ACTION.md and execute the specified next action
   
3. **Atomic Task**: Simple, focused changes
   - Indicators: "fix", "bug", "typo", "color", "style", "update", "change", "small"
   - Affects 1-2 files, no architecture changes
   - No design-system, cross-platform, or API contract impact
   - Action: Execute directly
   
4. **Pipeline Task**: Complex features requiring structured approach
   - Indicators: "feature", "add", "create", "build", "system", "database", "api", "merge", "consolidate"
   - Multiple components, architectural decisions needed
   - Any design-system changes, cross-platform merges, or backend integration work
   - Action: Start/continue AI Prompt Library pipeline
   
5. **Archive & Reset**: New feature while work is pending
   - User wants to start new feature but has pending work
   - Action: Warn and offer to archive current work

### Step 3: Execute the Determined Action

#### For Implementation Request:

# Log and emit implementation enforcement orchestrator
invoke_orchestrator_with_audit ".ai-prompts/prompts/orchestrators/implementation-enforcement-orchestrator.md" >/dev/null 2>&1 || true

# (the orchestrator file contains its own explanatory text and protocol)

#### For Continue/Resume:
```bash
# Log continue action via centralized dispatcher
NEXT_ACTION_PATH="NEXT_ACTION.md"
if [ -f "$NEXT_ACTION_PATH" ]; then
    audit_and_log_orchestrator "$NEXT_ACTION_PATH" >/dev/null 2>&1 || true
fi

# Read and execute next action
echo "📋 Continuing from NEXT_ACTION.md..."
if [ -f "NEXT_ACTION.md" ]; then
    cat NEXT_ACTION.md
else
    echo "No NEXT_ACTION.md found"
fi
```

Then execute the specific stage or task mentioned in NEXT_ACTION.md.

#### For Atomic Task:
```markdown
**⚡ ATOMIC TASK EXECUTION**

This looks like a focused change I can implement directly.

**Analysis:**
- Estimated files: [1-2]
- Complexity: Low
- Approach: Direct implementation

**Executing...**
```

Then implement the change using available tools.

#### For Pipeline Task:

# Log and emit pipeline stage orchestrator
invoke_orchestrator_with_audit ".ai-prompts/prompts/orchestrators/stage-pipeline-orchestrator.md" >/dev/null 2>&1 || true

```markdown
**🏗️ PIPELINE TASK EXECUTION**

This is a significant feature that will benefit from structured specifications.

**Analysis:**
- Complexity: [Medium/High]
- Multiple components: Yes
- Approach: AI Prompt Library pipeline

**Starting Stage 01 - Intake...**
```

Then load and execute Stage 01 from `.ai-prompts/prompts/stages/stage-01-intake/`.

Before moving to implementation tasks, ensure these outputs exist:
- `prompts/outputs/specifications/asset-mapping.md`
- `prompts/outputs/specifications/design-system-foundation.md`
- `prompts/outputs/specifications/design-system-component-catalog.md`
- `prompts/outputs/specifications/prompt-selection-manifest.md`
- `prompts/outputs/specifications/prompt-composition-index.md`
- `prompts/outputs/specifications/prompt-usage-log.md`
- `prompts/outputs/specifications/integration-contracts.md`
- `prompts/outputs/specifications/data-architecture.md`
- `prompts/outputs/specifications/backend-infrastructure.md`

#### For Archive & Reset:
```markdown
**📦 ARCHIVE & RESET REQUIRED**

⚠️ **Warning:** You have $PENDING_TASKS pending tasks that will be archived.

**Options:**
1. **Complete current work first** - Say "continue" to finish pending tasks
2. **Archive and start fresh** - Say "FORCE RESET" to confirm archiving

**Current pending work:**
```

```bash
# Show pending work
if [ -f "EXECUTION_PROGRESS.md" ]; then
    grep "\[ \]" EXECUTION_PROGRESS.md | head -5
fi
```

## State Management

**After any action, update NEXT_ACTION.md:**

```bash
# Update state based on what was just completed
# This ensures seamless handoffs between AI agents
```

## Error Handling

**If any step fails:**
1. **Library clone fails**: Provide manual download instructions
2. **Permission issues**: Use copy instead of symlink for steering files
3. **State file corruption**: Offer to recreate from templates
4. **Unclear request**: Ask for clarification with specific options

## Usage Examples

### Example 1: Brand New Project
```
User: "I want to build a social media app"
Agent: *Invokes AI Agent Entry Point*
Result: Auto-setup → Create MY_PROJECT.md → Ready for Stage 01
```

### Example 2: Simple Fix
```
User: "Fix the typo in line 15 of README.md"
Agent: *Invokes AI Agent Entry Point*
Result: Atomic task → Direct fix → Update complete
```

### Example 3: Continue Work
```
User: "Continue"
Agent: *Invokes AI Agent Entry Point*
Result: Read NEXT_ACTION.md → Execute Stage 03 → Update state
```

### Example 4: Complex Feature
```
User: "Add payment processing with Stripe integration"
Agent: *Invokes AI Agent Entry Point*
Result: Pipeline task → Start Stage 01 → Generate specifications
```

## Benefits for AI Agents

✅ **Single entry point** - No need to remember multiple templates
✅ **Automatic routing** - No manual decision-making required
✅ **State preservation** - Seamless handoffs between agents
✅ **Error recovery** - Built-in fallbacks and validation
✅ **Token optimization** - Right-sized approach for each request
✅ **Consistent quality** - Structured approach for complex features

## Integration with AI Tools

This template works seamlessly with:
- **Kiro IDE**: Automatic steering file setup in `.kiro/steering/`
- **Cursor**: Automatic rules setup in `.cursor/rules/`
- **Windsurf**: Automatic rules setup in `.windsurf/rules/`
- **Claude/ChatGPT**: Generic steering files in `.ai-steering/`
- **Any AI tool**: Bash commands work universally

**Simply invoke this template for any user request and let it handle the complexity automatically.**

## Examples

### Example 1: New Project Setup
```
User: "I want to build a social media app"
Entry Point: "🛡️ CHANGE IMPACT GUARD: Mandatory pre-change assessment"
Entry Point: "📊 System healthy - 592 tests passing"
Entry Point: "🚀 INITIALIZING AI PROMPT Library"
Entry Point: "✅ Setup complete - ready for project brief"
```

### Example 2: Simple Fix (Atomic Task)
```
User: "Fix the typo in line 15 of README.md"
Entry Point: "🔍 Analyzing request and project context..."
Entry Point: "⚡ ATOMIC TASK EXECUTION"
Entry Point: "📝 Direct implementation - no architecture changes"
Entry Point: "✅ Fix applied successfully"
```

### Example 3: Continue Work
```
User: "Continue"
Entry Point: "📖 Reading current project state..."
Entry Point: "📋 Continuing from NEXT_ACTION.md..."
Entry Point: "🏗️ Executing Stage 03 - Architecture"
Entry Point: "✅ Stage completed - updated NEXT_ACTION.md"
```

### Example 4: Complex Feature (Pipeline Task)
```
User: "Add payment processing with Stripe integration"
Entry Point: "🛡️ SAFEGUARDS: Validating change impact..."
Entry Point: "🏗️ PIPELINE TASK EXECUTION"
Entry Point: "📊 Complexity: High - multiple components needed"
Entry Point: "🚀 Starting Stage 01 - Intake..."
```
