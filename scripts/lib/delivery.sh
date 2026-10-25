#!/usr/bin/env bash
# Cheap mode detection only. All path/schema/evidence decisions belong to TS.
delivery_requested() {
  local delivery_target="$1" delivery_cursor delivery_checkpoint
  if [ -f "$delivery_target" ]; then
    if grep -qE '^run_directory:|^delivery_mode:[[:space:]]*outcome|^manifest(_path)?:.*delivery-manifest\.json|"kind"[[:space:]]*:[[:space:]]*"outcome-delivery"' "$delivery_target"; then return 0; fi
    delivery_target="$(dirname "$delivery_target")"
  fi
  [ -d "$delivery_target" ] || return 1
  delivery_cursor="$(cd -P "$delivery_target" && pwd)"
  while :; do
    if [ -e "$delivery_cursor/delivery-manifest.json" ] || [ -L "$delivery_cursor/delivery-manifest.json" ]; then return 0; fi
    for delivery_checkpoint in "$delivery_cursor/resumption-checkpoint.md" "$delivery_cursor/prompts/outputs/current/resumption-checkpoint.md"; do
      if [ -f "$delivery_checkpoint" ] && grep -qE '^run_directory:|^delivery_mode:[[:space:]]*outcome|^kind:[[:space:]]*outcome-delivery|^manifest(_path)?:.*delivery-manifest\.json' "$delivery_checkpoint"; then return 0; fi
    done
    if [ -e "$delivery_cursor/.git" ] || [ -f "$delivery_cursor/AGENTS.md" ] || [ "$delivery_cursor" = / ]; then return 1; fi
    delivery_cursor="$(dirname "$delivery_cursor")"
  done
}

delivery_run_gate() {
  local delivery_target="$1" delivery_stage="$2"
  if [ "$(basename "$delivery_target")" = task-contract.json ]; then delivery_target="$(dirname "$delivery_target")"; fi
  local delivery_lib_dir
  delivery_lib_dir="$(cd -P "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
  if [ "$delivery_stage" = resolve ]; then
    bash "$delivery_lib_dir/../validate-delivery.sh" "$delivery_target" --resolve
    return
  fi
  # Review provenance: a host-owned verifier and/or the reference owner-attestation adapter.
  local delivery_review_args=()
  if [ -n "${AI_PROMPT_REVIEW_VERIFIER:-}" ]; then delivery_review_args+=(--review-verifier "$AI_PROMPT_REVIEW_VERIFIER"); fi
  if [ "${AI_PROMPT_OWNER_ATTESTATION:-}" = 1 ]; then delivery_review_args+=(--owner-attestation); fi
  if [ "$delivery_stage" = project ]; then
    bash "$delivery_lib_dir/../validate-delivery.sh" "$delivery_target" --stage plan --project ${delivery_review_args[@]+"${delivery_review_args[@]}"}
  else
    bash "$delivery_lib_dir/../validate-delivery.sh" "$delivery_target" --stage "$delivery_stage" ${delivery_review_args[@]+"${delivery_review_args[@]}"}
  fi
}
