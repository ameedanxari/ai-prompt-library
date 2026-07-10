#!/usr/bin/env bash
# Shared deterministic tool resolution and transactional report helpers.

if [ "${AI_PROMPT_TOOLCHAIN_LOADED:-0}" = "1" ]; then
  return 0 2>/dev/null || exit 0
fi
AI_PROMPT_TOOLCHAIN_LOADED=1

TOOLCHAIN_LIB_DIR="$(cd -P "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TOOLCHAIN_PACKAGE_ROOT="${AI_PROMPT_PACKAGE_ROOT:-$(cd "$TOOLCHAIN_LIB_DIR/../.." && pwd)}"
TOOLCHAIN_LAST_DECISION="not attempted"
TOOLCHAIN_PREREQUISITE_ERROR=""
RESOLVED_NODE=""
RESOLVED_NPM=""
ATOMIC_REPORT_STATUS="not attempted"

_toolchain_select() {
  local variable_name="$1"
  local candidate="$2"
  local decision="$3"

  if [ -n "$candidate" ] && [ -f "$candidate" ] && [ -x "$candidate" ]; then
    printf -v "$variable_name" '%s' "$candidate"
    TOOLCHAIN_LAST_DECISION="$decision: $candidate"
    printf '%s\n' "$candidate"
    return 0
  fi
  return 1
}

resolve_node() {
  local candidate=""
  RESOLVED_NODE=""

  for candidate_spec in \
    "AI_PROMPT_NODE_PATH:${AI_PROMPT_NODE_PATH:-}" \
    "AI_PROMPT_BUNDLED_NODE:${AI_PROMPT_BUNDLED_NODE:-}" \
    "AI_PROMPT_BUNDLED_NODE_PATH:${AI_PROMPT_BUNDLED_NODE_PATH:-}" \
    "BUNDLED_NODE_PATH:${BUNDLED_NODE_PATH:-}" \
    "NODE_BINARY:${NODE_BINARY:-}" \
    "CODEX_NODE_BINARY:${CODEX_NODE_BINARY:-}"
  do
    local source_name="${candidate_spec%%:*}"
    candidate="${candidate_spec#*:}"
    if _toolchain_select RESOLVED_NODE "$candidate" "configured $source_name"; then
      return 0
    fi
  done

  for runtime_root_spec in \
    "AI_PROMPT_BUNDLED_RUNTIME:${AI_PROMPT_BUNDLED_RUNTIME:-}" \
    "CODEX_BUNDLED_RUNTIME:${CODEX_BUNDLED_RUNTIME:-}"
  do
    local source_name="${runtime_root_spec%%:*}"
    local runtime_root="${runtime_root_spec#*:}"
    if _toolchain_select RESOLVED_NODE "${runtime_root:+$runtime_root/bin/node}" "bundled $source_name"; then
      return 0
    fi
  done

  if [ "${AI_PROMPT_TOOLCHAIN_LOCAL_LOOKUP:-1}" != "0" ]; then
    for candidate in \
      "$TOOLCHAIN_PACKAGE_ROOT/node_modules/.bin/node" \
      "$TOOLCHAIN_PACKAGE_ROOT/node_modules/node/bin/node"
    do
      if _toolchain_select RESOLVED_NODE "$candidate" "package-local runtime"; then
        return 0
      fi
    done
  fi

  if [ "${AI_PROMPT_TOOLCHAIN_PATH_LOOKUP:-1}" != "0" ]; then
    candidate="$(command -v node 2>/dev/null || true)"
    if _toolchain_select RESOLVED_NODE "$candidate" "ambient PATH fallback"; then
      return 0
    fi
  fi

  TOOLCHAIN_LAST_DECISION="node unresolved after configured, bundled, package-local, and PATH candidates"
  return 1
}

resolve_npm() {
  local candidate=""
  RESOLVED_NPM=""

  for candidate_spec in \
    "AI_PROMPT_NPM_PATH:${AI_PROMPT_NPM_PATH:-}" \
    "AI_PROMPT_BUNDLED_NPM:${AI_PROMPT_BUNDLED_NPM:-}" \
    "AI_PROMPT_BUNDLED_NPM_PATH:${AI_PROMPT_BUNDLED_NPM_PATH:-}" \
    "BUNDLED_NPM_PATH:${BUNDLED_NPM_PATH:-}" \
    "NPM_BINARY:${NPM_BINARY:-}" \
    "CODEX_NPM_BINARY:${CODEX_NPM_BINARY:-}"
  do
    local source_name="${candidate_spec%%:*}"
    candidate="${candidate_spec#*:}"
    if _toolchain_select RESOLVED_NPM "$candidate" "configured $source_name"; then
      return 0
    fi
  done

  if [ -n "$RESOLVED_NODE" ]; then
    candidate="$(cd "$(dirname "$RESOLVED_NODE")" && pwd)/npm"
    if _toolchain_select RESOLVED_NPM "$candidate" "sibling of resolved node"; then
      return 0
    fi
  fi

  for runtime_root_spec in \
    "AI_PROMPT_BUNDLED_RUNTIME:${AI_PROMPT_BUNDLED_RUNTIME:-}" \
    "CODEX_BUNDLED_RUNTIME:${CODEX_BUNDLED_RUNTIME:-}"
  do
    local source_name="${runtime_root_spec%%:*}"
    local runtime_root="${runtime_root_spec#*:}"
    if _toolchain_select RESOLVED_NPM "${runtime_root:+$runtime_root/bin/npm}" "bundled $source_name"; then
      return 0
    fi
  done

  if [ "${AI_PROMPT_TOOLCHAIN_LOCAL_LOOKUP:-1}" != "0" ]; then
    if _toolchain_select RESOLVED_NPM "$TOOLCHAIN_PACKAGE_ROOT/node_modules/.bin/npm" "package-local runtime"; then
      return 0
    fi
  fi

  if [ "${AI_PROMPT_TOOLCHAIN_PATH_LOOKUP:-1}" != "0" ]; then
    candidate="$(command -v npm 2>/dev/null || true)"
    if _toolchain_select RESOLVED_NPM "$candidate" "ambient PATH fallback"; then
      return 0
    fi
  fi

  TOOLCHAIN_LAST_DECISION="npm unresolved after configured, bundled, node-sibling, package-local, and PATH candidates"
  return 1
}

tool_version() {
  local tool_path="${1:-}"
  local version=""
  local node_dir=""

  if [ -z "$tool_path" ] || [ ! -x "$tool_path" ]; then
    printf 'unavailable\n'
    return 1
  fi
  if [ -n "$RESOLVED_NODE" ]; then
    node_dir="$(dirname "$RESOLVED_NODE")"
  fi
  version="$(PATH="${node_dir:+$node_dir:}$PATH" "$tool_path" --version 2>/dev/null)" || {
    printf 'unavailable\n'
    return 1
  }
  printf '%s\n' "${version%%$'\n'*}"
}

require_tool() {
  local tool_name="$1"
  local resolver="$2"

  TOOLCHAIN_PREREQUISITE_ERROR=""
  if "$resolver" >/dev/null; then
    return 0
  fi

  TOOLCHAIN_PREREQUISITE_ERROR="required tool '$tool_name' is unavailable; $TOOLCHAIN_LAST_DECISION"
  printf 'toolchain prerequisite error: %s\n' "$TOOLCHAIN_PREREQUISITE_ERROR" >&2
  return 1
}

write_atomic_report() {
  local target="$1"
  local producer="$2"
  shift 2

  local target_dir="${target%/*}"
  local temporary=""
  if [ "$target_dir" = "$target" ]; then
    target_dir="."
  fi
  if [ ! -d "$target_dir" ]; then
    ATOMIC_REPORT_STATUS="target directory missing: $target_dir"
    return 1
  fi

  temporary="$(mktemp "$target.tmp.XXXXXX")" || {
    ATOMIC_REPORT_STATUS="temporary file creation failed"
    return 1
  }

  if ! "$producer" "$temporary" "$@"; then
    rm -f "$temporary"
    ATOMIC_REPORT_STATUS="producer failed; prior report preserved"
    return 1
  fi
  if [ ! -f "$temporary" ]; then
    rm -f "$temporary"
    ATOMIC_REPORT_STATUS="producer returned without a report"
    return 1
  fi
  if ! mv -f "$temporary" "$target"; then
    rm -f "$temporary"
    ATOMIC_REPORT_STATUS="atomic rename failed; prior report preserved"
    return 1
  fi

  ATOMIC_REPORT_STATUS="success"
  return 0
}

json_escape() {
  local value="${1:-}"
  value="${value//\\/\\\\}"
  value="${value//\"/\\\"}"
  value="${value//$'\n'/\\n}"
  value="${value//$'\r'/\\r}"
  value="${value//$'\t'/\\t}"
  printf '%s' "$value"
}

toolchain_timestamp() {
  date -u +%Y-%m-%dT%H:%M:%SZ 2>/dev/null || printf 'unknown\n'
}

_write_toolchain_failure_file() {
  local temporary="$1"
  local script_name="$2"
  local attempted_command="$3"
  local tool_name="$4"
  local resolver_decision="$5"
  local timestamp="$6"

  {
    printf '{\n'
    printf '  "status": "prerequisite-failed",\n'
    printf '  "script_name": "%s",\n' "$(json_escape "$script_name")"
    printf '  "attempted_command": "%s",\n' "$(json_escape "$attempted_command")"
    printf '  "missing_tool": "%s",\n' "$(json_escape "$tool_name")"
    printf '  "resolver_decision": "%s",\n' "$(json_escape "$resolver_decision")"
    printf '  "timestamp": "%s"\n' "$(json_escape "$timestamp")"
    printf '}\n'
  } > "$temporary"
}

write_toolchain_failure_report() {
  local target="$1"
  local script_name="$2"
  local attempted_command="$3"
  local tool_name="$4"
  local resolver_decision="$5"

  write_atomic_report \
    "$target" \
    _write_toolchain_failure_file \
    "$script_name" \
    "$attempted_command" \
    "$tool_name" \
    "$resolver_decision" \
    "$(toolchain_timestamp)"
}
