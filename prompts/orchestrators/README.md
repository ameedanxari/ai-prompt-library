# AI Prompt Library Orchestrators

This directory contains the **automation orchestrators** that enable seamless AI-assisted development without manual setup or routing decisions.

## Purpose
These orchestrators transform the AI Prompt Library from a collection of templates into a **fully automated system** that:
- **Automatically sets up** projects without manual steps
- **Intelligently routes** requests to optimal execution paths
- **Maintains state** across sessions and AI agent handoffs
- **Ensures quality** through automated validation gates
- **Recovers from errors** gracefully and automatically

## Core Orchestrators

### 🛡️ Safeguard Orchestrators (CRITICAL - USE FIRST)
| File | Purpose | When to Use |
|------|---------|-------------|
| **change-impact-guard.md** | **Prevents destructive changes** through mandatory impact assessment | **BEFORE ANY MODIFICATIONS** to codebase |
| **self-healing-monitor.md** | **Continuous system protection** and automatic recovery | Automatic monitoring and healing |

### 🚀 Primary Entry Point
| File | Purpose | When to Use |
|------|---------|-------------|
| **ai-agent-entry-point.md** | **Master orchestrator** - single entry point for all requests | **Always use this first** for any user request |

### 🔧 Setup & Routing
| File | Purpose | When to Use |
|------|---------|-------------|
| **auto-setup-orchestrator.md** | Automatic library initialization and configuration | New projects or missing setup |
| **auto-request-router.md** | Intelligent request classification and routing | Called by entry point automatically |
| **implementation-enforcement-orchestrator.md** | **Enforce use of design artifacts during implementation** | **When users request implementation** |
| **phase-clarification-orchestrator.md** | **Clarify design vs implementation phases** | **When agents misinterpret completed stages** |

### 🏗️ Pipeline Management
| File | Purpose | When to Use |
|------|---------|-------------|
| **stage-pipeline-orchestrator.md** | Execute 10-stage specification pipeline | Complex features requiring structured approach |
| **state-management-orchestrator.md** | Maintain project state across sessions | Automatic state updates and recovery |
| **task-generation-orchestrator.md** | Generate context-agnostic implementation tasks | After Stage 06 completion |

### ✅ Quality & Recovery
| File | Purpose | When to Use |
|------|---------|-------------|
| **quality-gate-orchestrator.md** | Enforce quality standards at each stage | Automatic validation before stage transitions |
| **error-recovery-orchestrator.md** | Detect and recover from errors automatically | When errors or corruption detected |
| **documentation-traceability-orchestrator.md** | Maintain complete project documentation | Generate final documentation and traceability |

### 🎯 Advanced Orchestrators
| File | Purpose | When to Use |
|------|---------|-------------|
| **context-optimization-orchestrator.md** | Optimize content for token efficiency | Large content or token budget constraints |
| **template-composition-orchestrator.md** | Intelligently compose multiple templates | Complex projects requiring multiple domains |
| **output-management-orchestrator.md** | Organize and manage all project outputs | Maintain clean, organized project structure |
| **architecture-guard-orchestrator.md** | Prevent architectural violations and ensure consistency | Before making architectural changes |

### 🧪 Testing & Validation
| File | Purpose | When to Use |
|------|---------|-------------|
| **integration-test.md** | Test orchestrator functionality in AI environments | Validate automation works correctly |

## How It Works

### 1. Single Entry Point
```
User Request → ai-agent-entry-point.md → Automatic routing to appropriate orchestrator
```

### 2. Automatic Flow
```
Setup Needed → auto-setup-orchestrator.md → Ready for development
Simple Task → Direct execution → Complete
Complex Feature → stage-pipeline-orchestrator.md → Full specifications
Continue Work → state-management-orchestrator.md → Resume from exact point
```

### 3. Quality Assurance
```
Every Action → quality-gate-orchestrator.md → Validation → Proceed or Fix
Error Detected → error-recovery-orchestrator.md → Automatic recovery → Continue
```

## Usage for AI Agents

### Primary Usage Pattern
For **any user request**, simply invoke:

```markdown
I'll analyze your request and route it optimally using the AI Prompt Library system.

*Invoking AI Agent Entry Point from prompts/orchestrators/ai-agent-entry-point.md...*
```

### Advanced Usage
For specific orchestration needs:

```markdown
# Setup new project
*Invoking Auto Setup Orchestrator from prompts/orchestrators/auto-setup-orchestrator.md...*

# Execute pipeline stage
*Invoking Stage Pipeline Orchestrator from prompts/orchestrators/stage-pipeline-orchestrator.md...*

# Generate implementation tasks
*Invoking Task Generation Orchestrator from prompts/orchestrators/task-generation-orchestrator.md...*
```

## Benefits

### For Users
- ✅ **Zero setup friction** - Projects initialize automatically
- ✅ **Optimal routing** - Right approach for each request type
- ✅ **Seamless continuation** - Pick up work across sessions
- ✅ **Quality assurance** - Built-in validation and error recovery

### For AI Agents
- ✅ **Single entry point** - No need to remember multiple templates
- ✅ **Automatic decision making** - No manual routing required
- ✅ **State preservation** - Perfect handoffs between agents
- ✅ **Error resilience** - Automatic recovery from failures
- ✅ **Token optimization** - Right-sized approach for each task

### For Development Teams
- ✅ **Consistent quality** - Standardized processes across all work
- ✅ **Complete traceability** - Full documentation and decision tracking
- ✅ **Resumable work** - Any team member can continue from any point
- ✅ **Automated validation** - Quality gates prevent issues

## Integration with AI Tools

These orchestrators work seamlessly with:
- **Kiro IDE** - Automatic steering file setup
- **Cursor** - Automatic rules configuration
- **Windsurf** - Automatic rules configuration
- **Claude/ChatGPT** - Generic steering files
- **Any AI tool** - Universal bash command compatibility

## File Organization

```
prompts/orchestrators/
├── README.md                                    # This file
├── ai-agent-entry-point.md                     # 🚀 PRIMARY ENTRY POINT
├── auto-setup-orchestrator.md                  # Setup automation
├── auto-request-router.md                      # Request routing
├── stage-pipeline-orchestrator.md              # Pipeline execution
├── state-management-orchestrator.md            # State management
├── task-generation-orchestrator.md             # Task generation
├── quality-gate-orchestrator.md                # Quality validation
├── error-recovery-orchestrator.md              # Error recovery
├── documentation-traceability-orchestrator.md  # Documentation
├── context-optimization-orchestrator.md        # Token/content optimization
├── template-composition-orchestrator.md        # Template composition
├── output-management-orchestrator.md           # Output organization
├── architecture-guard-orchestrator.md          # Architecture validation
└── integration-test.md                         # Testing framework
```

## Migration from Templates

If you were previously using individual templates, the orchestrators provide the same functionality with automation:

| Old Template | New Orchestrator | Benefit |
|-------------|------------------|---------|
| `task-router.md` | `auto-request-router.md` | Automatic routing with context analysis |
| `stage-orchestration.md` | `stage-pipeline-orchestrator.md` | Automated validation and state updates |
| `state-management-orchestration.md` | `state-management-orchestrator.md` | Simplified state management |
| Manual setup steps | `auto-setup-orchestrator.md` | Zero-friction initialization |

## Getting Started

1. **For new projects**: Just say "I want to use the AI Prompt Library"
2. **For existing work**: Say "Continue" and the system will resume automatically
3. **For any request**: The entry point will route optimally

The orchestrators handle all the complexity automatically while maintaining the same high-quality outputs as the manual template approach.
## Examples

### Example 1: Safe Project Enhancement
```
User: "Add new automation features"
System: "🛡️ Change Impact Guard activated"
System: "📊 Baseline: 592 tests passing"
System: "✅ Safe enhancement pattern detected"
System: "🚀 Routing to appropriate orchestrator"
System: "✅ Enhancement complete - 594 tests passing"
```

### Example 2: Preventing Destructive Changes
```
User: "Remove redundant TypeScript files"
System: "🚨 Change Impact Guard: HIGH RISK detected"
System: "🔍 Analysis: Files are test validators"
System: "❌ BLOCKED: Would break 590+ tests"
System: "💡 ALTERNATIVE: Create orchestrators alongside existing files"
```

### Example 3: Automatic Recovery
```
System: "🏥 Self-Healing Monitor: Regression detected"
System: "📊 Test success dropped to 520/598"
System: "🔄 Initiating automatic recovery..."
System: "✅ Recovery successful: 592 tests passing"
```

## Templates

### Template 1: Safe Change Protocol
```bash
# Always start with safeguards
echo "🛡️ Activating Change Impact Guard..."
# Run impact assessment
# Validate file purposes
# Check test dependencies
# Proceed only if safe
```

### Template 2: Orchestrator Integration
```bash
# Route through entry point
echo "🚀 Using AI Agent Entry Point..."
# Automatic routing
# State management
# Quality assurance
# Seamless execution
```

### Template 3: Recovery Protocol
```bash
# Self-healing activation
echo "🏥 Self-Healing Monitor active..."
# Continuous monitoring
# Regression detection
# Automatic recovery
# Learning integration
```

## Instructions

### For AI Agents Working on This Library:

1. **MANDATORY FIRST STEP**: Always consult `change-impact-guard.md` before ANY modifications
2. **Entry Point**: Use `ai-agent-entry-point.md` for all user requests
3. **Monitoring**: `self-healing-monitor.md` runs continuously for protection
4. **State Management**: All orchestrators maintain project state automatically
5. **Quality Assurance**: Built-in validation ensures system integrity

### Enforcement Rules:

- ❌ **Never remove TypeScript files** - they are test validators
- ✅ **Always run impact assessment** before changes
- ✅ **Maintain test success rate** above 95% (590+ tests)
- ✅ **Use orchestrators for automation** - don't duplicate functionality
- ✅ **Follow safe change patterns** - enhance, don't replace

### Integration Patterns:

1. **New Features**: Add orchestrators alongside existing functionality
2. **Bug Fixes**: Use atomic task patterns through entry point
3. **Enhancements**: Follow safe enhancement protocols
4. **Architecture Changes**: Mandatory architecture guard consultation

This orchestrator system ensures the AI Prompt Library remains stable, self-healing, and production-ready while enabling powerful automation capabilities.