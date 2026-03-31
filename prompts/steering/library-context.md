# AI Prompt Library Context

## CRITICAL: Automatic Request Handling (Self-Stabilizing)

**NEW**: For ANY user request, the AI Prompt Library automatically:
1. ✅ Self-stabilizes configuration (silent background process)
2. ✅ Routes request optimally (setup vs atomic vs pipeline)
3. ✅ Maintains state across sessions (resumable workstreams)
4. ✅ Handles version upgrades transparently (no user action needed)

**You don't need to do anything** — it just works! The library:
- Detects broken configs and auto-fixes them silently
- Deploys steering files to all supported tools
- Validates integration health after library updates
- Routes your request to the optimal execution path

## What This Library Is

The AI Prompt Library is a framework of reusable templates and modules for generating software specifications. It provides building blocks that AI agents compose to transform user requirements into production-ready specifications.

The library is **self-healing and self-improving**:
- **Auto-Setup**: Initializes automatically on first request (no manual script needed)
- **Self-Healing**: Fixes broken configs silently in the background
- **Self-Improving**: Handles version updates automatically
- **Broad Integration**: Deploys to all supported AI tools (Cursor, Windsurf, Kiro, etc.)

## Automatic Workflow Integration (Completely Transparent)

The library now runs invisible auto-stabilization on every AI request:

0. **Auto-Stabilization** (Step 0, silent): Fixes state, deploys configs, handles upgrades
   - Validates library health
   - Repairs broken configurations  
   - Deploys steering files to all tool locations
   - Handles version updates transparently

1. **AI Agent Entry Point** (`orchestrators/ai-agent-entry-point.md`): Primary entry for all requests
   - Auto-stabilization already complete when you read this
   - Routes request: Setup → Atomic → Pipeline → Continue
   - Maintains state for resumable work

2. **Auto Setup Orchestrator** (`orchestrators/auto-setup-orchestrator.md`): Auto-invoked for new projects
   - Triggered automatically if .ai-prompts/ missing
   - Sets up library, state files, directories
   - Returns user to entry point when done

3. **Auto Request Router** (`orchestrators/auto-request-router.md`): Intelligent request classification
   - Determines optimal execution path
   - Routes appropriately without user thinking
   
4. **State Management**: Automatic NEXT_ACTION.md updates for seamless handoffs
   - Persists work across sessions
   - Supports multiple AI agents working sequently
5. **Prompt Traceability**: Maintain `prompts/outputs/specifications/prompt-usage-log.md`
   - One entry per stage/routing decision
   - Record selected lego blocks and produced outputs

## Library Structure

```
prompts/
├── AGENTS.md              # Instructions for AI agents
├── README.md              # Library overview
├── orchestrators/         # Automation orchestrators
│   ├── ai-agent-entry-point.md         # 🚀 PRIMARY ENTRY POINT (auto-stabilizing)
│   ├── auto-setup-orchestrator.md      # Automatic setup
│   ├── auto-request-router.md          # Request routing
│   ├── stage-pipeline-orchestrator.md  # Pipeline execution
│   ├── state-management-orchestrator.md # State management
│   ├── task-generation-orchestrator.md # Task generation
│   ├── quality-gate-orchestrator.md    # Quality validation
│   ├── error-recovery-orchestrator.md  # Error recovery
│   └── documentation-traceability-orchestrator.md # Documentation
├── modules/               # Reusable template modules by domain
│   ├── commerce/          # E-commerce templates
│   ├── social/            # Social features templates
│   ├── healthcare/        # Healthcare templates
│   ├── fintech/           # Financial services templates
│   ├── security/          # Security templates
│   ├── testing/           # Testing templates
│   └── ...                # Other domain modules
├── stages/                # Stage-based workflow templates
│   ├── stage-01-intake/   # User input processing
│   ├── stage-02-charter/  # Project definition
│   └── ...                # Other stages
├── templates/             # Core templates
├── outputs/               # Output format templates
└── steering/              # AI agent steering files (auto-deployed to all tools)
```

## How to Use This Library

### For ANY Request (Completely Automatic)

Just use the library naturally:
- **New project?** → Library auto-initializes, auto-routes to setup
- **Simple fix?** → Library auto-routes to atomic task
- **Complex feature?** → Library auto-routes to pipeline
- **Continuing work?** → Library reads NEXT_ACTION.md and continues

**Nothing to remember, nothing to invoke explicitly.**

The library's auto-stabilization (Step 0 in ai-agent-entry-point.md) runs invisibly on every request and handles:
- ✅ Checking if library is initialized
- ✅ Auto-fixing broken configurations
- ✅ Deploying steering files everywhere
- ✅ Handling version upgrades
- ✅ Validating system health

### For Modifications

1. Review architecture-guard.md before making changes
2. Follow established patterns in existing templates
3. Maintain required sections in all templates
4. Update related documentation

## Request Types (Auto-Detected)
- **Setup**: User mentions "setup", "getting started", "first time" → Auto-setup runs
- **Atomic**: User says "fix typo", "change color" → Direct implementation (only if not a hi-fidelity/screen-parity request)  
- **Fidelity-Critical UI**: User asks for pixel-perfect/hi-fidelity/1:1 mockup parity → Always pipeline with screen-fidelity controls
- **Pipeline**: User says "add authentication" → Full 10-stage pipeline
- **Continue**: User says "continue", "next", "resume" → Read state and resume
- **Reset**: User wants new feature while work pending → Archive and restart
- **Version Updated**: Submodule changed → Auto-refresh configs and validate
- **Config Broken**: Steering files missing/corrupted → Auto-repair silently

## Non-Negotiable Output Guardrails
- Design system work must be explicit (`design-system-foundation.md` + component catalog) before screen-level tasks.
- For high-fidelity UI source assets, `ui-fidelity-source-map.md` must be generated before feature/task planning.
- HTML/CSS/clickable prototypes must be treated as source-of-truth for composition/copy/state behavior unless deviations are explicitly approved and tracked.
- API integration contracts and data architecture must be explicit before implementation planning.
- Deployment prerequisites (`environment-matrix.md`, `access-and-secrets-checklist.md`) must be prepared before deployment stage completion.
- Prompt selection must be traceable (`prompt-selection-manifest.md` + `prompt-usage-log.md`).

## Template Types

### Orchestrators (orchestrators/)
**Automation orchestrators that handle:**
- **ai-agent-entry-point.md**: **PRIMARY ENTRY POINT FOR ALL REQUESTS** (now with auto-stabilization)
- auto-setup-orchestrator.md: Automatic library initialization
- auto-request-router.md: Intelligent request classification  
- stage-pipeline-orchestrator.md: Automated pipeline execution
- state-management-orchestrator.md: State management and handoffs
- task-generation-orchestrator.md: Context-agnostic task generation
- quality-gate-orchestrator.md: Quality validation and gates
- error-recovery-orchestrator.md: Automatic error recovery
- documentation-traceability-orchestrator.md: Complete documentation

### Module Templates (modules/)
Domain-specific templates organized by category. Each module has:
- README.md with overview and available templates
- Individual template files with implementation patterns

### Stage Templates (stages/)
Workflow templates for the 10-stage specification process:
- Platform-specific variants (web.md, mobile.md, platform-agnostic.md)
- Stage-specific instructions and outputs

### Core Templates (templates/)
Foundational templates for library operation:
- User input processing, library vision, change assessment

## Key Conventions

### Template Structure
All templates follow this structure:
```markdown
# Template Name

## Purpose
[What this template does]

## Instructions
[How to use this template]

## Examples
[Code examples demonstrating usage]
```

### Module References
Include modules using:
```markdown
#[[module:category/template-name.md]]
#[[module:category/template-name.md|param=value]]
```

### Cross-References
Reference related templates and documentation to maintain context.

## Quality Standards
- **Always use AI Agent Entry Point first** - eliminates manual routing decisions
- Follow the documented 10-stage pipeline for complex features
- Maintain state consistency through NEXT_ACTION.md
- Generate context-agnostic outputs
- Preserve functionality across changes
- Let the system route requests automatically for optimal token usage
