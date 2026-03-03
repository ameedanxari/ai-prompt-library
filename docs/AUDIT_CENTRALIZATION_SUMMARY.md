# Audit Centralization Summary

## Overview
The audit trail system has been refactored to use **centralized dispatcher functions** in `lib.sh`, eliminating scatter-gun audit calls throughout the codebase.

## Architecture Changes

### Before: Scatter-Gun Approach
- Audit logic was **embedded inline** in orchestrators and entry point
- Each location had **duplicate code** for:
  - Recording actual prompt snippets
  - Building JSONL entries with metadata
  - Rotating audit logs at size limit
- **Maintenance burden**: Changes to audit schema required updates in multiple places
- **Inconsistency risk**: Different logging implementations across files

**Example of old pattern:**
```bash
# In entry point, before each orchestrator
$(audit_orchestrator ".ai-prompts/prompts/orchestrators/continue.md" 2>/dev/null || true)

# Function defined locally with duplicate logic
audit_orchestrator() {
    local path="$1"
    if [ -f "$path" ]; then
        snippet=$(head -n 20 "$path" | tr '\n' ' ' | sed 's/"/\\"/g')
        record_actual_prompt "$snippet" "$path" "agent" || true
    fi
}
```

### After: Centralized Dispatch
- **Single source of truth** for all audit logging in `.ai-prompts/.scripts/lib.sh`
- Three core functions handle all audit scenarios:
  1. `record_actual_prompt()` — Records JSONL entry with metadata
  2. `audit_and_log_orchestrator()` — Extracts snippet + logs
  3. `invoke_orchestrator_with_audit()` — Dispatcher stub for future use

**New pattern:**
```bash
# In entry point, clean one-liner calls
audit_and_log_orchestrator ".ai-prompts/prompts/orchestrators/continue.md" >/dev/null 2>&1 || true

# Function defined centrally in lib.sh, sourced once at startup
. ".ai-prompts/.scripts/lib.sh"
```

## Implementation Details

### Centralized Functions in `lib.sh`

#### 1. `record_actual_prompt(prompt_text, source_name, actor_name)`
**Core logging function**
- **Inputs**: 
  - `prompt_text` — The actual prompt/snippet to log
  - `source_name` — Where this came from (e.g., "continue.md", "setup")
  - `actor_name` — Who executed it (default: "agent")
- **Output**: JSONL entry appended to `.ai-prompts/.state/audit.log`
- **Schema**: timestamp, repo, commit, hostname, actor, source, prompt_hash, prompt
- **Auto-rotation**: Calls `rotate_if_large()` when log exceeds 5MB
- **Usage**:
  ```bash
  record_actual_prompt "user request snippet" "continue.md" "agent"
  ```

#### 2. `audit_and_log_orchestrator(orchestrator_path)`
**Convenience wrapper for orchestrator files**
- **Inputs**: Path to orchestrator template (e.g., `.ai-prompts/prompts/orchestrators/continue.md`)
- **Process**:
  1. Extracts first 20 lines of the orchestrator
  2. Escapes quotes/newlines for JSON safety
  3. Calls `record_actual_prompt()` with snippet
  4. Returns path for caller use
- **Usage**:
  ```bash
  audit_and_log_orchestrator ".ai-prompts/prompts/orchestrators/continue.md"
  ```

#### 3. `invoke_orchestrator_with_audit(orchestrator_path)`
**Dispatcher stub for future execution**
- **Purpose**: Eventually allow sourcing + executing orchestrators while auto-logging
- **Current state**: Calls `audit_and_log_orchestrator()` then returns path
- **Future**: May extend to actually source/execute the orchestrator in-place

## Integration Points

### Entry Point (`ai-agent-entry-point.md`)
**All orchestrator invocations now use centralized audit:**

| Section | Audit Call | Purpose |
|---------|-----------|---------|
| Step 1: Auto-Route | `audit_and_log_orchestrator ".../auto-request-router.md"` | Log routing logic |
| Setup Phase | `audit_and_log_orchestrator ".../auto-setup-orchestrator.md"` | Log setup execution |
| Implementation | `audit_and_log_orchestrator ".../implementation-enforcement-orchestrator.md"` | Log enforcement |
| Continue/Resume | `audit_and_log_orchestrator "NEXT_ACTION.md"` | Log resumed action |
| Pipeline | `audit_and_log_orchestrator ".../stage-pipeline-orchestrator.md"` | Log pipeline stage |

### Script Consolidation
**All utility scripts source `lib.sh` and use centralized helpers:**

| Script | Dependency | Purpose |
|--------|-----------|---------|
| `record_prompt.sh` | `record_actual_prompt()` | Direct audit entry recording |
| `audit_query.sh` | `lib.sh` exports | Query audit log |
| `deploy_steering_symlinks.sh` | `deploy_steering_symlinks()` | Deploy steering files |
| `validate_cove.sh` | `validate_cove_internals()` | Validate symlinks |

## Benefits

### 1. **Eliminates Duplication**
- **Before**: audit code in 5+ locations
- **After**: Single implementation in `lib.sh`
- **Impact**: ~100 lines of duplicate code removed

### 2. **Single Point Maintenance**
- Keep audit schema, rotation logic, metadata building in **one file**
- Adding new fields (e.g., git branch, user) requires **one edit**
- Testing audit behavior requires **one test**

### 3. **Consistency**
- All audit entries follow **identical schema**
- All timestamps, hashingignore, escaping handled **uniformly**
- No per-location variations

### 4. **Debuggability**
- Easier to trace why an orchestrator was invoked
- Clear audit trail of all system activities
- `audit_query.sh` can reliably parse all entries

### 5. **Extensibility**
- New orchestrators can **reuse** `audit_and_log_orchestrator()` without code duplication
- Adding new metadata fields is **one change** in `lib.sh`
- Future dispatcher features (e.g., `invoke_orchestrator_with_audit()`) remain **centralized**

## Audit Trail Schema

**JSONL Format** stored in `.ai-prompts/.state/audit.log`:

```json
{
  "timestamp": "2025-02-16T18:30:45Z",
  "repo": "/path/to/ShamelaGPT",
  "commit": "a1b2c3d4e5f6g7h8i9j0...",
  "hostname": "MACINTOSH-AIR",
  "actor": "agent",
  "source": "continue.md",
  "prompt_hash": "sha256:abc123...",
  "prompt": "First 20 lines of orchestrator template..."
}
```

## Testing & Validation

### Verify Centralization
```bash
# Count audit function references in codebase
grep -r "audit_and_log_orchestrator" .ai-prompts/ --include="*.md" --include="*.sh"

# Expected: 1 definition in lib.sh + 5-6 calls in entry point + other orchestrators
```

### Validate Audit Logging
```bash
# Check audit log is created
tail -f .ai-prompts/.state/audit.log

# Query by source
.ai-prompts/.scripts/audit_query.sh --source "continue.md"

# Query by actor
.ai-prompts/.scripts/audit_query.sh --actor "agent"
```

### No Regressions
```bash
# Confirm entry point still works
source .ai-prompts/prompts/orchestrators/ai-agent-entry-point.md

# Check lib.sh exports
bash .ai-prompts/.scripts/lib.sh
```

## Migration Notes

### For Existing Orchestrators
If you're adding audit logging to a new orchestrator:

**Option A: Use audit_and_log_orchestrator (recommended)**
```bash
# At start of orchestrator, log its execution
audit_and_log_orchestrator "$(pwd)/my-orchestrator.md"

# Rest of orchestrator logic...
```

**Option B: Record custom prompt via record_actual_prompt**
```bash
# For custom prompts not predefined in a file
CUSTOM_PROMPT="user's actual request"
record_actual_prompt "$CUSTOM_PROMPT" "my-service" "user"

# Rest of orchestrator logic...
```

### Do NOT Embed Audit Code
❌ **Bad:**
```bash
# Don't copy audit logic into orchestrator
PROMPT=$(head -n 20 your-file.md | ...)
echo "${PROMPT}" >> .ai-prompts/.state/audit.log
```

✅ **Good:**
```bash
# Use centralized functions from lib.sh
audit_and_log_orchestrator "your-file.md"
```

## Files Modified

| File | Change | Reason |
|------|--------|--------|
| `.ai-prompts/.scripts/lib.sh` | Added `record_actual_prompt()`, `audit_and_log_orchestrator()`, `invoke_orchestrator_with_audit()` | Central dispatch point |
| `.ai-prompts/prompts/orchestrators/ai-agent-entry-point.md` | Removed inline audit functions, replaced all audit calls with centr dispatcher | Simplify, eliminate duplication |
| All utility scripts | Import `lib.sh`, delegate to centralized helpers | Consolidate shared code |

## Future Work

### Phase 2: Dispatcher Execution
- Extend `invoke_orchestrator_with_audit()` to actually **source and execute** orchestrators
- Allows: `invoke_orchestrator_with_audit "continue.md"` to run the entire orchestrator **and log it**
- Benefits: Single line to run + audit any orchestrator

### Phase 3: Orchestrator Auto-Wrapping
- Automatically wrap **all orchestrators** with audit logging once `.ai-prompts/.scripts/lib.sh` is sourced
- The library overrides the `source` builtin and the `.` shorthand to intercept
  paths under `.ai-prompts/prompts/orchestrators/`
- After sourcing `lib.sh` (the entry point performs this immediately), any
  subsequent `source` or `.` invocation of an orchestrator file will automatically
  record an audit entry and print the file content to stdout
- This requires **no per-orchestrator changes**; just source the file as usual
- Provides zero-effort logging while maintaining backwards compatibility
- Behavior is active for any shell session that has loaded the library

Once the library is initialized, the following sequence occurs automatically:
1. AI agent runs the entry point, sourcing `lib.sh`.
2. `lib.sh` installs wrapper functions for `source`/`.`.
3. Later `source` calls to orchestrators result in audit logging + output,
   meeting Phase‑3 objectives without manual intervention.

### Phase 4: Analytics & Dashboarding
- Query audit log to build dashboards
- Track: most-used orchestrators, patterns, error rates
- Enable: data-driven library improvements

---

**Status**: ✅ Centralization COMPLETE | Codebase is now cleaner, more maintainable, and audit-logging is consistent across all flows.
