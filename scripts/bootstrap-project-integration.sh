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

# Ensure AGENTS.md contains the current steering block. If a previous
# version's block exists (or a hand-rolled file references deleted
# orchestrators), rewrite the managed section cleanly.
STALE_MARKERS='execution-orchestrator|auto-request-router|stage-pipeline-orchestrator|quality-gate-orchestrator|task-generation-orchestrator|10-stage|stage-01-intake'

if [ -f "AGENTS.md" ] && grep -qE "$STALE_MARKERS" AGENTS.md; then
  # Stale content detected — move aside and recreate.
  mv AGENTS.md "AGENTS.md.stale-$(date +%s)"
  echo "ℹ️  Existing AGENTS.md references deprecated orchestrators; moved aside."
fi

if [ ! -f "AGENTS.md" ]; then
  cat > AGENTS.md << 'EOF'
# AGENTS

Steering for AI coding agents working on this project.
EOF
fi

if ! grep -q "AI Prompt Library Steering (Auto-Managed)" AGENTS.md; then
  cat >> AGENTS.md << 'EOF'

## AI Prompt Library Steering (Auto-Managed — do not edit)

Load these files (in order) before handling any non-trivial request:
1. `.ai-prompts/prompts/AGENTS.md` — authoritative instructions.
2. `.ai-prompts/prompts/orchestrators/ai-agent-entry-point.md` — entry point.
3. `.ai-prompts/prompts/orchestrators/drill-down-engine.md` — the 3-step engine.

If `MY_PROJECT.md` lists external material or the project already has
source code, also load:
4. `.ai-prompts/prompts/orchestrators/external-input-handler.md`

Do NOT auto-load anything else under `.ai-prompts/prompts/orchestrators/` 
without following the entry-point routing.

After the handler finishes, proceed IMMEDIATELY to Step 1 of the engine
without waiting for the user. Between engine steps, continue automatically.
<!-- /AI Prompt Library Steering (Auto-Managed) -->
EOF
fi

# MY_PROJECT.md — the brief the drill-down engine reads at Step 1 (Seed).
if [ ! -f "MY_PROJECT.md" ]; then
  if [ -f ".ai-prompts/MY_PROJECT.md.template" ]; then
    cp .ai-prompts/MY_PROJECT.md.template MY_PROJECT.md
  else
    cat > MY_PROJECT.md << 'EOF'
# My Project

## Brief
_2–3 sentences: what is the product, who is it for, what is the most important outcome?_

## Core features
- …
- …

## Users / roles
- …

## Tech preferences (optional)
- Frontend:
- Backend:
- Database:

## External material (optional)
- working_copy/ — designs and mockups
- prompts/working_copy/ — specs / reference code
EOF
  fi
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
