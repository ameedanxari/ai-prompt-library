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

library_version() {
  if [ -d "$LIB_DIR/.git" ] && (cd "$LIB_DIR" && git rev-parse HEAD >/dev/null 2>&1); then
    (cd "$LIB_DIR" && git rev-parse HEAD)
    return
  fi

  if [ -f "$LIB_DIR/package.json" ]; then
    version="$(awk -F\" '/"version"[[:space:]]*:/ { print $4; exit }' "$LIB_DIR/package.json")"
    if [ -n "$version" ]; then
      echo "ai-prompt-library@$version"
    fi
  fi
}

mkdir -p prompts/outputs/current/planning/features
mkdir -p prompts/outputs/current/planning/tasks
mkdir -p prompts/outputs/current/execution/task-results
mkdir -p prompts/outputs/current/logs/build-gate
mkdir -p prompts/outputs/current/logs/harness
mkdir -p prompts/outputs/current/logs/revise
mkdir -p prompts/outputs/current/logs/safety
mkdir -p prompts/outputs/archive
mkdir -p prompts/outputs/field-tests
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

MANAGED_BLOCK=""
read -r -d '' MANAGED_BLOCK <<'EOF' || true
## AI Prompt Library Steering (Auto-Managed — do not edit)

Before handling any non-trivial request, read this one file:
1. `.ai-prompts/prompts/orchestrators/ai-agent-entry-point.md` — entry point.

The entry point's routing logic selects ONE of four modes and then loads
the matching engine on demand:
- **Trivial** (single-file edit) → no engine load.
- **Execute** (validated plan exists) → loads `.ai-prompts/prompts/orchestrators/executor.md`.
- **Gap-closure** (existing codebase, audit/finish requested) → loads `.ai-prompts/prompts/orchestrators/audit-and-remediate.md`.
- **Greenfield** (new project) → loads `.ai-prompts/prompts/orchestrators/drill-down-engine.md`.

If `MY_PROJECT.md` lists external material or the project already has
source code under `working_copy/`, the entry point also reads
`.ai-prompts/prompts/orchestrators/external-input-handler.md` before the
chosen engine.

Do NOT auto-load anything else under `.ai-prompts/prompts/orchestrators/`
without following the entry-point routing.

**Resumption.** If the user says `Continue` (or any resumption verb), the
entry point picks the cheapest valid path automatically: checkpoint
resumption if `prompts/outputs/current/resumption-checkpoint.md` exists,
execution-phase fast path if `execution-log.md` has a non-null `next_task`,
or a full force-reload only when neither shortcut is available (or the
user explicitly asks for `rebuild` / `force reload`). If neither artifact
exists and the user said only `Continue`, the entry point surfaces an
ambiguous-resumption error.

Follow the entry point's checkpoint protocol exactly. At every engine
checkpoint, stop, summarize progress, and wait for the user to say
`Continue` before moving to the next step. Do not auto-advance across
planning checkpoints.
<!-- /AI Prompt Library Steering (Auto-Managed) -->
EOF

if grep -q "AI Prompt Library Steering (Auto-Managed)" AGENTS.md; then
  tmp_file="$(mktemp)"
  awk -v block="$MANAGED_BLOCK" '
    /^## AI Prompt Library Steering \(Auto-Managed/ {
      print block
      in_block = 1
      next
    }
    /<!-- \/AI Prompt Library Steering \(Auto-Managed\) -->/ {
      in_block = 0
      next
    }
    !in_block { print }
  ' AGENTS.md > "$tmp_file"
  mv "$tmp_file" AGENTS.md
else
  {
    echo ""
    printf "%s\n" "$MANAGED_BLOCK"
  } >> AGENTS.md
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

## Reference material / External material (optional)
- working_copy/ — designs and mockups
- prompts/working_copy/ — specs / reference code
EOF
  fi
fi

# Track current library version for update validation.
current_library_version="$(library_version)"
if [ -n "$current_library_version" ]; then
  echo "$current_library_version" > .ai-prompts-version
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
