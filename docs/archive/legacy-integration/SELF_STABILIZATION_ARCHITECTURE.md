# AI Prompt Library: Self-Stabilization Architecture

## Overview

The AI Prompt Library implements a **continuous self-stabilization system** that runs on every user request. This ensures the library is always in a healthy, properly-configured state — **without requiring manual setup or user intervention**.

This document explains the architecture for developers and tool integrators.

---

## Design Philosophy

**Problem**: Libraries require setup, break when configs are deleted, and need manual fixes when tools change.

**Solution**: Move setup from point-in-time to continuous. The library:
1. Detects all states (new install, broken config, version update)
2. Auto-repairs all states silently
3. Deploys to all tool locations proactively
4. Never surfaces setup friction to users

**Result**: Users experience the library as "just works" — it becomes invisible infrastructure.

---

## Architecture: Four-Phase Stabilization

Every AI request triggers **Step 0: Auto-Stabilization** in `ai-agent-entry-point.md` before any other processing occurs.

### Phase 1: Version Tracking

```bash
detect_version_change() → "new" | "updated" | "current"
```

**Purpose**: Detect when the library was updated (submodule pull, version change, etc.)

**Detection**:
- If `.ai-prompts/` missing → "new"
- If git hash changed → "updated"  
- If git hash same → "current"

**State Tracking**: Stored in `.ai-prompts/.state/last-version`

**When Triggered**: Every invocation (< 1ms overhead)

### Phase 2: Steering File Deployment (Broad)

```bash
deploy_steering_files() → deploys to:
  - .kiro/steering/
  - .cursor/rules/
  - .windsurf/rules/
  - .idea/ai-rules/
  - .ai-steering/
```

**Purpose**: Ensure steering files exist in all supported tool locations preemptively

**Strategy**: Deploy to **all** locations, not just detected ones. This ensures any AI tool that gets added later will find the library ready.

**Files Deployed**: All `.md` files from `.ai-prompts/prompts/steering/`

**Side Effects**: None — copies are idempotent, no overwrite conflicts

**When Triggered**: 
- First invocation (Phase 1 = "new")
- After version update (Phase 1 = "updated")
- If steering health low (Phase 3 score < 70)

### Phase 3: Validation & Self-Healing

```bash
validate_and_repair() → HEALTH_SCORE (0-100)
```

**Health Indicators**:
- Library integrity (AGENTS.md exists) → +30 points
- State files (NEXT_ACTION.md valid) → +10 points
- Steering files deployed (at least 1 location) → +20 points
- Safeguards present (PREVENTION_CHECKLIST.md) → +10 points

**Auto-Repair Triggers**:
- Health < 70 → Deploy steering files again
- Corrupted NEXT_ACTION.md → Delete and recreate from template on next request
- Missing library → Setup triggered in Step 1

**Silent Repairs** (no user notification):
- Steering files redeployed
- State files recreated
- Configuration restored

**Visible Only If**: Health drops below critical threshold (generally not shown)

### Phase 4: Version Upgrade Handling

```bash
handle_version_upgrade() → refreshes and validates
```

**When Triggered**: When `VERSION_STATUS = "updated"`

**Actions**:
1. Calls `deploy_steering_files()` to refresh all configs
2. Runs `.ai-prompts/scripts/validate-safeguards.sh` (silent validation)
3. Updates integration tracking timestamp

**Result**: 
- Users get library improvements automatically
- All configs refresh without being asked
- No manual intervention needed
- Transparent to user

---

## State Management

### State Directory: `.ai-prompts/.state/`

```
.ai-prompts/.state/
├── last-version                    # Git SHA of current library version
├── last-health-score               # Last computed health (0-100)
└── last-integration-check          # Timestamp of last validation
```

**Purpose**: Track library state for diagnostics and upgrade detection

**Lifecycle**: Created during first stabilization, updated on every relevant change

**Privacy**: Files are auto-generated, safe to delete (will be regenerated)

---

## Integration Points

### For AI Tools (Any IDE/Editor)

The library auto-detects and deploys to:

| Tool | Config Location | Detection |
|------|-----------------|-----------|
| **Cursor** | `.cursor/rules/` | Automatic |
| **Windsurf** | `.windsurf/rules/` | Automatic |
| **Kiro IDE** | `.kiro/steering/` | Automatic |
| **Continue** | `.continue/rules/` | Automatic |
| **JetBrains IDEs** | `.idea/ai-rules/` | Automatic |
| **Generic/Unknown** | `.ai-steering/` | Fallback |

**How It Works**:
1. Steering files deployed to all locations in Phase 2
2. Each tool looks in its configured location
3. Tool reads library context automatically
4. Invokes `ai-agent-entry-point.md` on user requests

### For Custom Tools

To integrate a custom AI tool:

1. Add tool-specific path to `deploy_steering_files()` in Step 0
2. Tool should read steering from its configured location
3. Ensure tool can invoke the entry point on user requests
4. Library handles the rest automatically

Example for hypothetical "NewTool":
```bash
# In deploy_steering_files():
mkdir -p .newtool/rules 2>/dev/null && \
cp .ai-prompts/prompts/steering/*.md .newtool/rules/ 2>/dev/null || true
```

---

## Request Flow

Every user request follows this sequence:

```
User Request
    ↓
[Step 0] Auto-Stabilization
    ├─ Phase 1: Detect version change
    ├─ Phase 2: Deploy steering files everywhere
    ├─ Phase 3: Validate and repair
    └─ Phase 4: Handle version upgrades
    ↓
[Step 1] Auto-Route Request
    ├─ Check if library initialized
    └─ Classify request type (setup/atomic/pipeline/continue)
    ↓
[Step 2-N] Execute Appropriate Orchestrator
    ├─ Setup → auto-setup-orchestrator
    ├─ Route → auto-request-router
    ├─ Execute → implementation orchestrator
    └─ Maintain → state management orchestrator
    ↓
Response to User
```

**Key**: Steps 1-N never execute if Step 0 fails. Step 0 ensures preconditions are met.

---

## Error Recovery

### What If Stabilization Fails?

Current behavior: Silently continues with degraded health score.

Future enhancement: Could cache previous healthy state and recover from that if available.

### What If User Deletes Config?

Example: User removes `.cursor/rules/`

**Detection**: Phase 3 validation (next request)

**Recovery**: Phase 2 redeployment (automatically redeploys)

**User Experience**: Completely transparent — configs reappear

### What If Library Is Corrupted?

Example: Submodule clone fails

**Detection**: Phase 1 or Phase 3 (missing AGENTS.md)

**Recovery**: Step 1 triggers setup orchestrator

**User Experience**: Sees "Library initialization needed" and auto-setup runs

---

## Performance

### Stabilization Overhead

- **Phase 1** (version detect): ~1ms (git hash check)
- **Phase 2** (deploy files): ~50-100ms (file copy operations)
- **Phase 3** (validate): ~10ms (grep checks)
- **Phase 4** (upgrade handle): ~50ms (script execution, only if upgraded)

**Total**: 100-200ms on regular invocations, 200-300ms on first invocation or version update.

**Optimization**: All phases have early exit conditions (skip if already healthy).

### Scaling

- Works with projects of any size (steering files are small/static)
- Scales with number of supported tools (separate deploy paths, not exponential)
- State directory minimal (3 small files)

---

## Safeguards

The auto-stabilization system includes safeguards:

1. **Idempotent Deployments**: File copies succeed whether files exist or not
2. **Read-Only Checks**: Version detect doesn't modify unless needed
3. **Repair Scope Limited**: Only repairs library-related state, not project code
4. **Silent by Default**: No output unless health critical
5. **Logged for Diagnostics**: Detailed logs in `.ai-prompts/.state/` if debugging needed

---

## Extension Points

Developers can extend auto-stabilization by:

### Adding New Tool Support

Edit Step 0, Phase 2 in `ai-agent-entry-point.md`:

```bash
# Add support for MyTool (example)
mkdir -p .mytool/ai-config 2>/dev/null && \
cp .ai-prompts/prompts/steering/*.md .mytool/ai-config/ 2>/dev/null || true
```

### Adding Custom Health Checks

Edit Phase 3 in `ai-agent-entry-point.md` to check custom conditions:

```bash
# Check for custom requirement
[ -f "my-required-file" ] || HEALTH_SCORE=$((HEALTH_SCORE - 10))
```

### Adding Upgrade Migrations

Edit Phase 4 in `ai-agent-entry-point.md` to run version-specific migrations:

```bash
# After validating safeguards, run migration
if [ "$old_version" = "v1.0" ] && [ "$new_version" = "v2.0" ]; then
    bash .ai-prompts/.migrations/v1-to-v2.sh
fi
```

---

## Monitoring & Diagnostics

### Health Score

`cat .ai-prompts/.state/last-health-score` returns 0-100 indicating library health.

- **100**: Perfect state, all components present
- **70-99**: Healthy, minor components missing (usually not displayed)
- **50-69**: Degraded but functional (may show warning on next request)
- **<50**: Critical issues (stabilization will repair, may show notice to user)

### Version Tracking

`cat .ai-prompts/.state/last-version` shows current library version (git SHA).

Useful for:
- Detecting when submodule updates
- Tracking which version user is on
- Correlating issues with version changes

### Integration Check Timestamp

`cat .ai-prompts/.state/last-integration-check` shows when library last validated itself.

Useful for:
- Detecting long-running unvalidated sessions
- Identifying when last upgrade cycle completed
- Monitoring integration health over time

---

## Future Enhancements

### Planned Features

1. **Watchdog Process**: Continuous background health monitoring
2. **Repair Notifications**: Inform user only if repair took action
3. **Migration System**: Version-specific upgrade paths
4. **Tool Detection**: Automatic tool capability detection
5. **Telemetry**: Anonymous health metrics (opt-in)

### Research Areas

1. **Distributed State**: Handle multiple AI tools working in parallel
2. **Rollback Support**: Detect incompatible versions and revert gracefully
3. **Self-Optimization**: Learn which tools are used and optimize deployment
4. **Predictive Repair**: Detect issues before they impact user

---

## Summary

The self-stabilization system transforms library management from manual/fragile to automatic/resilient:

- **No setup needed**: Works on first invocation
- **Self-healing**: Repairs broken configs silently
- **Version-aware**: Handles upgrades transparently
- **Tool-agnostic**: Deploys to all supported tools preemptively
- **Low overhead**: < 200ms per request, highly optimized

**Result**: Users experience the library as invisible infrastructure that "just works."
