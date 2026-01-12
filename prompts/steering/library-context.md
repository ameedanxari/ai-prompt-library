# AI Prompt Library Context

## What This Library Is

The AI Prompt Library is a framework of reusable templates and modules for generating software specifications. It provides building blocks that AI agents compose to transform user requirements into production-ready specifications.

## Library Structure

```
prompts/
├── AGENTS.md              # Instructions for AI agents
├── README.md              # Library overview
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

### For New Projects

1. Start with AGENTS.md for comprehensive agent instructions
2. Process user input through the stage pipeline (stages 01-10)
3. Select appropriate domain modules based on project requirements
4. Compose templates to generate specifications

### For Modifications

1. Review architecture-guard.md before making changes
2. Follow established patterns in existing templates
3. Maintain required sections in all templates
4. Update related documentation

## Template Types

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
- User input processing
- Library vision and principles
- Change assessment

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
