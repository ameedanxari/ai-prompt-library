#!/usr/bin/env bash
set -euo pipefail

# Bootstrap project integration defaults for AI Prompt Library.
# Run from project root (where .ai-prompts lives).

ROOT_DIR="$(pwd)"
LIB_DIR="$ROOT_DIR/.ai-prompts"

if [ ! -d "$LIB_DIR" ]; then
  echo "❌ .ai-prompts directory not found. Run setup first."
  exit 1
fi

# shellcheck disable=SC1091
if [ -f "$LIB_DIR/.scripts/lib.sh" ]; then
  . "$LIB_DIR/.scripts/lib.sh"
fi

echo "🔧 Bootstrapping AI Prompt Library integration..."

mkdir -p prompts/outputs/specifications
mkdir -p prompts/outputs/task-lists
mkdir -p prompts/outputs/architecture
mkdir -p prompts/outputs/deployment
mkdir -p prompts/outputs/documentation
mkdir -p prompts/outputs/quality
mkdir -p prompts/outputs/handoff
mkdir -p prompts/outputs/implementation-prompts
mkdir -p prompts/working_copy
mkdir -p prompts/archive

# Deploy steering links if library helper is available.
if command -v deploy_steering_symlinks >/dev/null 2>&1; then
  deploy_steering_symlinks || true
fi

# Ensure VSCode steering path hint exists.
mkdir -p .vscode
if [ ! -f ".vscode/settings.json" ]; then
  cat > .vscode/settings.json << 'EOF'
{
  "aiPromptLibrary.steeringPath": ".vscode/ai-steering"
}
EOF
else
  if ! grep -q "aiPromptLibrary.steeringPath" .vscode/settings.json; then
    tmp_file="$(mktemp)"
    {
      echo "{"
      echo "  \"aiPromptLibrary.steeringPath\": \".vscode/ai-steering\""
      echo "}"
    } > "$tmp_file"
    mv "$tmp_file" .vscode/settings.json
  fi
fi

# Ensure AGENTS.md contains steering block.
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

# Ensure key state files exist.
if [ ! -f "NEXT_ACTION.md" ]; then
  cat > NEXT_ACTION.md << 'EOF'
# Next Action

## Current Status
- **Stage**: stage-01-intake
- **Phase**: Specification
- **Mode**: Dry-Run

## Next Action
Generate Stage 01 intake outputs and prompt traceability artifacts.
EOF
fi

if [ ! -f "MY_PROJECT.md" ]; then
  cat > MY_PROJECT.md << 'EOF'
# My Project

## Project Idea
Describe your product in 2-6 sentences.

## Design + Reference Sources
- `working_copy/`
- `prompts/working_copy/` (if used)
EOF
fi

# Track current library version for update validation.
if [ -d ".git" ]; then
  if (cd "$LIB_DIR" && git rev-parse HEAD >/dev/null 2>&1); then
    (cd "$LIB_DIR" && git rev-parse HEAD) > .ai-prompts-version
  fi
fi

# Install/update project-level integration validator wrapper.
cat > validate-integration.sh << 'EOF'
#!/usr/bin/env bash
set -euo pipefail

if [ ! -x ".ai-prompts/scripts/validate-project-integration.sh" ]; then
  echo "❌ Missing .ai-prompts/scripts/validate-project-integration.sh"
  echo "Run setup again or update the AI Prompt Library."
  exit 1
fi

exec ./.ai-prompts/scripts/validate-project-integration.sh "$@"
EOF
chmod +x validate-integration.sh

echo "✅ Bootstrap complete"
