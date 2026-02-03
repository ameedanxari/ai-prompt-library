# AI Prompt Library Context

## CRITICAL: Automatic Request Handling
**IMPORTANT**: For ANY user request, first invoke the **AI Agent Entry Point**:

```
I'll analyze your request and route it optimally using the AI Prompt Library system.

*Invoking AI Agent Entry Point from prompts/orchestrators/ai-agent-entry-point.md...*
```

This automatically:
- Sets up the library if needed
- Routes requests optimally (atomic vs pipeline)
- Maintains state across sessions
- Ensures consistent quality

## What This Library Is

The AI Prompt Library is a framework of reusable templates and modules for generating software specifications. It provides building blocks that AI agents compose to transform user requirements into production-ready specifications.

## Automatic Workflow Integration
The library now includes automatic routing and setup:

1. **AI Agent Entry Point** (`orchestrators/ai-agent-entry-point.md`): Primary entry for all requests
2. **Auto Setup Orchestrator** (`orchestrators/auto-setup-orchestrator.md`): Automatic initialization
3. **Auto Request Router** (`orchestrators/auto-request-router.md`): Intelligent request routing
4. **State Management**: Automatic NEXT_ACTION.md updates for seamless handoffs

## Library Structure

```
prompts/
├── AGENTS.md              # Instructions for AI agents
├── README.md              # Library overview
├── orchestrators/         # NEW: Automation orchestrators
│   ├── ai-agent-entry-point.md         # 🚀 PRIMARY ENTRY POINT
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
└── steering/              # AI agent steering files
```

## How to Use This Library

### For ANY Request (NEW WORKFLOW)
1. **Always invoke AI Agent Entry Point first** - handles everything automatically
2. System auto-routes to: Setup, Atomic Task, Pipeline, or Continue
3. State automatically maintained in NEXT_ACTION.md
4. Seamless handoffs between AI agents

### For New Projects (Legacy - Now Automated)
1. ~~Start with AGENTS.md~~ → **Use AI Agent Entry Point**
2. ~~Process user input through stages~~ → **Auto-routed**
3. ~~Select appropriate modules~~ → **Auto-selected**
4. ~~Compose templates~~ → **Auto-composed**

### For Modifications
1. Review architecture-guard.md before making changes
2. Follow established patterns in existing templates
3. Maintain required sections in all templates
4. Update related documentation

## Request Types (Handled Automatically)
- **Setup**: "I want to use the AI Prompt Library" → Auto-setup
- **Atomic**: "Fix typo in README" → Direct execution  
- **Pipeline**: "Add user authentication" → Stage 01 start
- **Continue**: "Continue" → Read NEXT_ACTION.md and proceed
- **Reset**: "New feature" → Archive current work

## Template Types

### Orchestrators (orchestrators/)
**NEW**: Automation orchestrators that handle:
- **ai-agent-entry-point.md**: **PRIMARY ENTRY POINT FOR ALL REQUESTS**
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
