#!/usr/bin/env bash
# harness-common.sh — shared helpers for diagnose-harness-<stack>.sh.
#
# Per-stack scripts gather stack-specific evidence (xcresult paths,
# adb logcat output, vitest report.json, etc.) and call these
# functions to:
#
#   1. read_catalog_match     — walk a YAML catalog, return the first
#                               entry whose signature regex matches the
#                               stderr or the evidence blob.
#   2. write_diagnosis_json   — write the standard harness-diagnosis.json
#                               schema (single source of truth for the
#                               executor's exit-code contract).
#   3. apply_recipe           — run a recipe (array of shell commands)
#                               with retry-budget enforcement.
#
# The diagnose-harness.sh dispatcher already enforces the global retry
# cap (one recovery per task — second crash always blocks). These
# helpers respect $RETRY_COUNT but do not re-enforce the cap themselves.

# ---------------------------------------------------------------------
# read_catalog_match
#   $1 — catalog YAML path
#   $2 — stderr text (may be empty)
#   $3 — evidence blob path (file containing concatenated evidence)
#
# Sets these globals on the calling shell:
#   MATCHED_ID       — entry id, or "__none__"
#   CLASSIFICATION   — harness_crash | code_crash_known | code_crash_unknown
#   REMED_TYPE       — recipe | code_fix | none
#   CONFIDENCE       — high | medium | low
#   RECIPE_STEPS[]   — array of recipe steps (env vars NOT expanded yet)
#   CODE_FIX_KV[]    — array of "k:v" lines for the code_fix object
# ---------------------------------------------------------------------
read_catalog_match() {
  local catalog="$1"
  local stderr_text="$2"
  local evidence_path="$3"
  local evidence_text=""
  [ -f "$evidence_path" ] && evidence_text="$(cat "$evidence_path" 2>/dev/null || true)"
  # BSD awk (default on macOS) rejects multi-line -v values. Collapse
  # newlines to spaces before the awk call. Catalog regexes are written
  # without ^/$ anchors precisely because of this collapse — the goal
  # is "does this substring appear anywhere in the evidence" not
  # "does the evidence line start with X".
  stderr_text="$(printf '%s' "$stderr_text" | tr '\n\r' '  ')"
  evidence_text="$(printf '%s' "$evidence_text" | tr '\n\r' '  ')"

  local parsed
  # Two-pass over each entry: (1) gather all fields, (2) on entry close
  # OR EOF, if any signature matched, emit the captured fields. This
  # avoids the bug where classification/confidence appear AFTER the
  # signature line in the YAML and were therefore empty at match time.
  parsed=$(awk -v stderr_text="$stderr_text" -v evidence_text="$evidence_text" '
    function flush_entry() {
      if (sig_matched && !emitted) {
        print "MATCHED_ID=" id
        print "CLASSIFICATION=" classification
        print "REMED_TYPE=" remediation_type
        print "CONFIDENCE=" conf
        for (i=1;i<=rs_count;i++) print "RECIPE_STEP=" recipe_steps[i]
        for (i=1;i<=cf_count;i++) print "CODE_FIX_LINE=" code_fix_lines[i]
        emitted=1
      }
    }
    function reset_entry() {
      id=""; in_sigs=0; in_remed=0; in_recipe=0; in_code_fix=0
      classification=""; conf=""; remediation_type=""
      rs_count=0; cf_count=0
      sig_matched=0
      delete recipe_steps; delete code_fix_lines
    }
    /^  - id:/ {
      flush_entry()
      if (emitted) exit
      reset_entry()
      id = $0; sub(/^[[:space:]]*-[[:space:]]*id:[[:space:]]*/, "", id)
      next
    }
    /^    signatures:/ { in_sigs=1; in_recipe=0; in_code_fix=0; next }
    /^    evidence_paths:/ { in_sigs=0; next }
    /^    classification:/ {
      classification=$0; sub(/^[[:space:]]*classification:[[:space:]]*/,"",classification)
    }
    /^    remediation:/ { in_remed=1; in_sigs=0; next }
    /^      type:/ {
      remediation_type=$0; sub(/^[[:space:]]*type:[[:space:]]*/,"",remediation_type)
    }
    /^      recipe:/ { in_recipe=1; in_code_fix=0; next }
    /^      code_fix:/ { in_code_fix=1; in_recipe=0; next }
    /^      hint:/ { ; }
    /^    confidence:/ {
      conf=$0; sub(/^[[:space:]]*confidence:[[:space:]]*/,"",conf)
    }
    in_sigs && /regex:/ {
      line=$0
      sub(/^[^"]*"/, "", line)
      sub(/".*/, "", line)
      if (line != "") {
        src="stderr"
        if (match($0, /source:[[:space:]]*[a-z]+/)) {
          src = substr($0, RSTART, RLENGTH)
          sub(/source:[[:space:]]*/, "", src)
        }
        text = (src == "evidence") ? evidence_text : stderr_text
        if (text ~ line) { sig_matched = 1 }
      }
    }
    in_recipe && /^        - / {
      step=$0; sub(/^[[:space:]]*-[[:space:]]*/, "", step)
      sub(/^"/,"",step); sub(/"$/,"",step)
      recipe_steps[++rs_count] = step
    }
    in_code_fix && /^        [a-z_]+:/ {
      kv=$0; sub(/^[[:space:]]*/,"",kv)
      code_fix_lines[++cf_count] = kv
    }
    END {
      flush_entry()
      if (!emitted) print "MATCHED_ID=__none__"
    }
  ' "$catalog")

  MATCHED_ID="$(printf '%s\n' "$parsed" | awk -F= '/^MATCHED_ID=/{print $2}')"
  CLASSIFICATION="$(printf '%s\n' "$parsed" | awk -F= '/^CLASSIFICATION=/{print $2}')"
  REMED_TYPE="$(printf '%s\n' "$parsed" | awk -F= '/^REMED_TYPE=/{print $2}')"
  CONFIDENCE="$(printf '%s\n' "$parsed" | awk -F= '/^CONFIDENCE=/{print $2}')"
  RECIPE_STEPS=()
  while IFS= read -r line; do
    [ -n "$line" ] && RECIPE_STEPS+=("$line")
  done < <(printf '%s\n' "$parsed" | awk -F= '/^RECIPE_STEP=/{sub(/^RECIPE_STEP=/,""); print}')
  CODE_FIX_KV=()
  while IFS= read -r line; do
    [ -n "$line" ] && CODE_FIX_KV+=("$line")
  done < <(printf '%s\n' "$parsed" | awk -F= '/^CODE_FIX_LINE=/{sub(/^CODE_FIX_LINE=/,""); print}')
}

# ---------------------------------------------------------------------
# json_escape — minimal JSON string escape.
# ---------------------------------------------------------------------
json_escape() { printf '%s' "$1" | sed 's/\\/\\\\/g; s/"/\\"/g' | tr -d '\n'; }

# ---------------------------------------------------------------------
# write_diagnosis_json — write the canonical report.
#   $1 stack | $2 task | $3 exit_code | $4 report_paths_json (array)
#   $5 key_lines_json (array) | $6 output_path
# Uses the globals set by read_catalog_match.
# ---------------------------------------------------------------------
write_diagnosis_json() {
  local stack="$1" task="$2" exit_code="$3" report_paths="$4" key_lines="$5" output="$6"
  local harness_status="code_crash_unknown"
  local remediation_json='"remediation": { "type": "none", "recipe": [], "code_fix": null }'
  case "$CLASSIFICATION" in
    harness_crash)
      harness_status="harness_crash"
      local recipe_arr="["
      local first=1
      for s in "${RECIPE_STEPS[@]:-}"; do
        [ -z "$s" ] && continue
        [ $first -eq 1 ] || recipe_arr="${recipe_arr},"
        first=0
        recipe_arr="${recipe_arr}\"$(json_escape "$s")\""
      done
      recipe_arr="${recipe_arr}]"
      remediation_json="\"remediation\": { \"type\": \"recipe\", \"recipe\": ${recipe_arr}, \"code_fix\": null }"
      ;;
    code_crash_known)
      harness_status="code_crash_known"
      local cf="{"
      local first=1
      for kv in "${CODE_FIX_KV[@]:-}"; do
        [ -z "$kv" ] && continue
        local k="${kv%%:*}"
        local v="${kv#*: }"
        v="${v#\"}"; v="${v%\"}"
        [ $first -eq 1 ] || cf="${cf},"
        first=0
        cf="${cf}\"$(json_escape "$k")\": \"$(json_escape "$v")\""
      done
      cf="${cf}}"
      remediation_json="\"remediation\": { \"type\": \"code_fix\", \"recipe\": [], \"code_fix\": ${cf} }"
      ;;
    code_crash_unknown|"")
      harness_status="code_crash_unknown"
      ;;
  esac
  if [ "${MATCHED_ID:-__none__}" = "__none__" ] || [ -z "${MATCHED_ID:-}" ]; then
    MATCHED_ID="unmatched"
    harness_status="code_crash_unknown"
    CONFIDENCE="low"
  fi
  mkdir -p "$(dirname "$output")"
  cat > "$output" <<EOF
{
  "stack": "${stack}",
  "task": "${task}",
  "test_exit_code": ${exit_code},
  "classification": "${MATCHED_ID}",
  "harness_status": "${harness_status}",
  "evidence": {
    "report_paths": ${report_paths},
    "key_lines": ${key_lines},
    "signal": null,
    "top_frame": null,
    "error_class": null
  },
  ${remediation_json},
  "confidence": "${CONFIDENCE:-low}",
  "retry_count_in_task": ${RETRY_COUNT:-0}
}
EOF
}

# ---------------------------------------------------------------------
# apply_recipe — run each step, return 0 on full success, 1 otherwise.
# Skips entirely if $RETRY_COUNT >= 1 (loop protection).
# ---------------------------------------------------------------------
apply_recipe() {
  if [ "${RETRY_COUNT:-0}" -ge 1 ]; then return 1; fi
  local rc=0
  for s in "${RECIPE_STEPS[@]:-}"; do
    [ -z "$s" ] && continue
    eval "$s" || rc=1
  done
  return $rc
}

# ---------------------------------------------------------------------
# decide_exit_code — pick the executor-facing exit code based on
# CLASSIFICATION + whether the recipe ran cleanly.
# ---------------------------------------------------------------------
decide_exit_code() {
  local recipe_ok="${1:-0}"
  case "$CLASSIFICATION" in
    harness_crash)
      if [ "${RETRY_COUNT:-0}" -ge 1 ]; then return 3; fi
      [ "$recipe_ok" -eq 0 ] && return 1 || return 3
      ;;
    code_crash_known)    return 2 ;;
    code_crash_unknown|*) return 3 ;;
  esac
}

# ---------------------------------------------------------------------
# json_array_from_lines — turn newline-separated input into a JSON array
# of strings (each line escaped). Empty input → "[]".
# ---------------------------------------------------------------------
json_array_from_lines() {
  awk 'BEGIN{printf "["} { gsub(/\\/,"\\\\"); gsub(/"/,"\\\""); if(NR>1) printf ","; printf "\"%s\"", $0 } END{printf "]"}'
}
