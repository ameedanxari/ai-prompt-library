#!/usr/bin/env bash
set -euo pipefail

# Common library for AI Prompt Library scripts

# steering file constants
CANONICAL_DIR=".ai-prompts/prompts/steering"
STEER_FILES=(architecture-guard.md library-context.md change-review.md README.md)
STEER_TARGETS=(".cursor/rules" ".kiro/steering" ".windsurf/rules" ".ai-steering" ".idea/ai-rules" ".vscode/ai-steering")

# ensure a directory exists (mkdir -p wrapper)
ensure_dir() {
    mkdir -p "$1" 2>/dev/null || true
}

# JSON encode a string safely using python3 if available, otherwise simple escaping
json_encode() {
    local s="$1"
    if command -v python3 >/dev/null 2>&1; then
        printf "%s" "$s" | python3 -c 'import json,sys; print(json.dumps(sys.stdin.read()))'
    else
        # fallback minimal escape for quotes/backslashes
        printf '%s' "\"%s\"" "$(printf "%s" "$s" | sed -e 's/\\/\\\\/g' -e 's/"/\\"/g')"
    fi
}

# rotate file if size exceeds limit (bytes)
rotate_if_large() {
    local file="$1" maxbytes="$2"
    if [ -f "$file" ]; then
        local sz=$(wc -c < "$file" 2>/dev/null || echo 0)
        if [ "$sz" -gt "$maxbytes" ]; then
            mv "$file" "$file.$(date -u +%Y%m%d%H%M%S)"
            gzip -9 "$file."* 2>/dev/null || true
            touch "$file"
        fi
    fi
}

# Core audit recording function (central point for all audit logging)
record_actual_prompt() {
    local prompt_text="$1" source_name="$2" actor_name="${3:-agent}"
    local audit_dir=".ai-prompts/.state"
    local audit_file="$audit_dir/audit.log"
    mkdir -p "$audit_dir"
    
    [ -z "$(echo -n "$prompt_text" | tr -d '[:space:]')" ] && return 0
    
    local ts=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
    local repo_dir="$(pwd)"
    local git_sha=""
    [ -d ".git" ] && git_sha=$(git rev-parse --short HEAD 2>/dev/null || true)
    local hostname="$(hostname)"
    local prompt_hash=$(echo -n "$prompt_text" | shasum -a 256 | awk '{print $1}')
    local prompt_json=$(json_encode "$prompt_text")
    
    printf '%s\n' "{\"ts\":\"$ts\",\"repo\":\"$repo_dir\",\"commit\":\"$git_sha\",\"host\":\"$hostname\",\"actor\":\"$actor_name\",\"source\":\"$source_name\",\"prompt_hash\":\"$prompt_hash\",\"prompt\":$prompt_json}" >> "$audit_file"
    rotate_if_large "$audit_file" $((5*1024*1024))
}

# Centralized orchestrator audit & log: logs orchestrator snippet without executing
audit_and_log_orchestrator() {
    local orch_path="$1"
    if [ -f "$orch_path" ]; then
        local snippet=$(head -n 20 "$orch_path" | tr '\n' ' ' | sed 's/"/\\"/g')
        record_actual_prompt "$snippet" "$orch_path" "agent"
    fi
    echo "$orch_path"  # return path so caller can use it
}

# Centralized orchestrator audit & invoke: logs AND outputs the orchestrator content
# This makes it trivial to run an orchestrator and record it in the audit log with a
# single call. The caller can simply write:
#
#     invoke_orchestrator_with_audit ".ai-prompts/prompts/orchestrators/auto-setup-orchestrator.md"
#
# and the orchestrator markdown will be printed to stdout while an audit entry is
# appended.  In future the function could also execute shell code inside the file
# if needed.
invoke_orchestrator_with_audit() {
    local orch_path="$1"
    # log snippet first; discard the returned path string
    audit_and_log_orchestrator "$orch_path" >/dev/null 2>&1

    # then emit the contents so that callers (or the AI agent) receive the full
    # orchestrator text.  Doing this here centralizes both responsibilities.
    if [ -f "$orch_path" ]; then
        cat "$orch_path"
        return 0
    fi
    return 1
}

# === AUTO-WRAP SUPPORT ===
# Override the `source` builtin (and `.` if possible) so that any script that
# sources an orchestrator file will automatically have its content audited.
# This allows existing code to use plain `source path` without explicit audit
# calls; the wrapper takes care of logging and emitting the orchestrator.

# Save original builtins under internal names
builtin_source() { builtin source "$@"; }

# Wrapper function
source() {
    for f in "$@"; do
        if [[ "$f" == .ai-prompts/prompts/orchestrators/* ]]; then
            invoke_orchestrator_with_audit "$f"
        else
            builtin source "$f"
        fi
    done
}

# Some scripts may use the dot `.` shorthand.  Define a function named "." to
# intercept those calls. POSIX allows this since "." is a special builtin; the
# shell will prefer the function definition here.
.() {
    for f in "$@"; do
        if [[ "$f" == .ai-prompts/prompts/orchestrators/* ]]; then
            invoke_orchestrator_with_audit "$f"
        else
            builtin . "$f"
        fi
    done
}

# deploy steering symlinks to all known targets
deploy_steering_symlinks() {
    for dir in "${STEER_TARGETS[@]}"; do
        ensure_dir "$dir"
        for f in "${STEER_FILES[@]}"; do
            if [ -e "$dir/$f" ] && [ ! -L "$dir/$f" ]; then
                rm -f "$dir/$f"
            fi
            ln -sf "$(pwd)/$CANONICAL_DIR/$f" "$dir/$f" || true
        done
    done
}

# validate steering symlinks and VS Code settings
validate_cove_internals() {
    local fail=0
    echo "COVE Validation: Starting checks..."
    # canonical files
    for f in "${STEER_FILES[@]}"; do
        if [ ! -f "$CANONICAL_DIR/$f" ]; then
            echo "FAIL: canonical file missing: $CANONICAL_DIR/$f"
            fail=1
        fi
    done
    # targets
    for dir in "${STEER_TARGETS[@]}"; do
        ensure_dir "$dir"
        for f in "${STEER_FILES[@]}"; do
            local target_path="$dir/$f"
            if [ ! -L "$target_path" ]; then
                echo "FAIL: missing symlink: $target_path"
                fail=1; continue
            fi
            local resolved=$(readlink "$target_path" || true)
            if [ -z "$resolved" ]; then
                echo "FAIL: could not resolve symlink: $target_path"
                fail=1; continue
            fi
            local resolved_abs=""
            if [[ "$resolved" != /* ]]; then
                resolved_abs="$(cd "$(dirname "$target_path")" && realpath "$resolved" 2>/dev/null || (cd "$(dirname "$target_path")" && echo "$(pwd)/$resolved"))"
            else
                resolved_abs="$resolved"
            fi
            local canonical_abs="$(realpath "$CANONICAL_DIR/$f" 2>/dev/null || true)"
            if [ "$resolved_abs" != "$canonical_abs" ]; then
                echo "FAIL: symlink target mismatch for $target_path -> $resolved_abs (expected $canonical_abs)"
                fail=1
            else
                echo "OK: $target_path -> $resolved_abs"
            fi
        done
    done
    # vs code settings
    if [ -f ".vscode/settings.json" ]; then
        if grep -q "aiPromptLibrary.steeringPath" .vscode/settings.json; then
            echo "OK: .vscode/settings.json contains aiPromptLibrary.steeringPath"
        else
            echo "FAIL: .vscode/settings.json missing aiPromptLibrary.steeringPath"
            fail=1
        fi
    else
        echo "FAIL: .vscode/settings.json not found"
        fail=1
    fi
    return $fail
}

# export some helpers for scripts
export -f ensure_dir json_encode rotate_if_large deploy_steering_symlinks validate_cove_internals
