# Migration Guide: AI Prompt Library v2.0

## Purpose
Guide for migrating from the previous AI Prompt Library implementation to the corrected v2.0 system with proper 10-stage pipeline, state management, and resumable execution.

## Overview of Changes

### Major Improvements in v2.0
1. **Corrected 10-Stage Pipeline**: Proper stage sequence and validation
2. **Enhanced State Management**: Comprehensive project state tracking
3. **Resumable Execution**: Seamless continuation across sessions
4. **Context-Agnostic Tasks**: Self-contained, executable tasks
5. **Token Optimization**: Efficient content processing
6. **Quality Gates**: Validation at each stage transition
7. **Error Recovery**: Graceful failure handling and recovery
8. **Documentation Traceability**: Complete requirement-to-implementation tracking

### Breaking Changes
- Stage numbering and sequence updated
- State file formats enhanced
- Template selection algorithm improved
- Task generation methodology changed
- Output directory structure reorganized

## Migration Steps

### Step 1: Backup Existing Projects

Before migrating, backup all existing project data:

```bash
# Create backup directory
mkdir -p backups/pre-v2-migration/$(date +%Y%m%d_%H%M%S)

# Backup project files
cp -r prompts/outputs/ backups/pre-v2-migration/$(date +%Y%m%d_%H%M%S)/outputs/
cp NEXT_ACTION.md backups/pre-v2-migration/$(date +%Y%m%d_%H%M%S)/ 2>/dev/null || true
cp MY_PROJECT.md backups/pre-v2-migration/$(date +%Y%m%d_%H%M%S)/ 2>/dev/null || true

# Document current state
echo "Migration started: $(date)" > backups/pre-v2-migration/$(date +%Y%m%d_%H%M%S)/migration.log
```

### Step 2: Analyze Current Project State

Determine the current state of your projects:

```bash
# Check current stage
if [ -f NEXT_ACTION.md ]; then
    echo "Current project state:"
    grep -E "Stage|Status" NEXT_ACTION.md
else
    echo "No NEXT_ACTION.md found - project needs initialization"
fi

# List existing outputs
echo "Existing outputs:"
find prompts/outputs -name "*.md" -type f 2>/dev/null || echo "No outputs directory found"
```

### Step 3: Update System Components

Install the new v2.0 system components:

```bash
# Update core components (if using npm/package manager)
npm install ai-prompt-library@2.0.0

# Or update source files
git pull origin main  # If using git repository
```

### Step 4: Migrate Project Structure

#### 4.1 Update Output Directory Structure

The new system uses an enhanced directory structure:

```bash
# Create new directory structure
mkdir -p prompts/outputs/{specifications,architecture,design,security,implementation,testing,optimization,deployment,handoff}
mkdir -p prompts/outputs/{decisions,logs,features,tasks}

# Migrate existing files to new structure
if [ -d prompts/outputs ]; then
    # Move specifications
    find prompts/outputs -name "*requirements*" -exec mv {} prompts/outputs/specifications/ \; 2>/dev/null || true
    find prompts/outputs -name "*spec*" -exec mv {} prompts/outputs/specifications/ \; 2>/dev/null || true
    
    # Move architecture files
    find prompts/outputs -name "*architecture*" -exec mv {} prompts/outputs/architecture/ \; 2>/dev/null || true
    find prompts/outputs -name "*design*" -exec mv {} prompts/outputs/design/ \; 2>/dev/null || true
fi
```

#### 4.2 Update State Files Format

Convert existing state files to new format:

```bash
# Backup existing state files
cp NEXT_ACTION.md NEXT_ACTION.md.backup 2>/dev/null || true
cp prompts/outputs/PROJECT_STATE.md prompts/outputs/PROJECT_STATE.md.backup 2>/dev/null || true
```

Create migration script for state files:

```bash
#!/bin/bash
# migrate_state_files.sh

# Function to convert old NEXT_ACTION.md to new format
migrate_next_action() {
    if [ -f NEXT_ACTION.md.backup ]; then
        echo "Migrating NEXT_ACTION.md..."
        
        # Extract current stage (update mapping as needed)
        OLD_STAGE=$(grep -E "Stage [0-9]+" NEXT_ACTION.md.backup | head -1)
        
        # Map old stages to new stages
        case "$OLD_STAGE" in
            *"Stage 01"*) NEW_STAGE="Stage 01 - Intake" ;;
            *"Stage 02"*) NEW_STAGE="Stage 02 - Analysis" ;;
            *"Stage 03"*) NEW_STAGE="Stage 03 - Architecture" ;;
            *"Stage 04"*) NEW_STAGE="Stage 04 - Design" ;;
            *"Stage 05"*) NEW_STAGE="Stage 05 - Security" ;;
            *"Stage 06"*) NEW_STAGE="Stage 06 - Implementation" ;;
            *"Stage 07"*) NEW_STAGE="Stage 07 - Testing" ;;
            *"Stage 08"*) NEW_STAGE="Stage 08 - Optimization" ;;
            *"Stage 09"*) NEW_STAGE="Stage 09 - Deployment" ;;
            *"Stage 10"*) NEW_STAGE="Stage 10 - Handoff" ;;
            *) NEW_STAGE="Stage 01 - Intake" ;;
        esac
        
        # Create new NEXT_ACTION.md
        cat > NEXT_ACTION.md << EOF
# Next Action

## Current Status
- **Current Stage**: $NEW_STAGE
- **Status**: IN_PROGRESS
- **Last Updated**: $(date)

## What Happens Next
1. Validate current stage outputs
2. Run quality gates for stage transition
3. Execute next stage with proper templates
4. Update state files with traceability

## Context Files
$(find prompts/outputs -name "*.md" -type f | head -10)

## Prerequisites
- Previous stage outputs validated
- Quality gates passed
- Context loaded successfully

## Migration Notes
- Migrated from v1.0 on $(date)
- Original state preserved in backup files
- May need manual validation of outputs
EOF
        
        echo "NEXT_ACTION.md migrated successfully"
    fi
}

# Function to create new PROJECT_STATE.md
create_project_state() {
    echo "Creating new PROJECT_STATE.md..."
    
    PROJECT_NAME=$(grep -E "project|name" MY_PROJECT.md 2>/dev/null | head -1 | cut -d: -f2 | xargs || echo "Migrated Project")
    
    cat > prompts/outputs/PROJECT_STATE.md << EOF
# Project State

## Project Information
- **Project ID**: migrated-$(date +%Y%m%d_%H%M%S)
- **Project Name**: $PROJECT_NAME
- **Created**: $(date)
- **Last Updated**: $(date)
- **Migration**: v1.0 to v2.0 on $(date)

## Pipeline Progress

| Stage | Status | Completed | Outputs | Notes |
|-------|--------|-----------|---------|-------|
| 01 - Intake | ✅ | $(date) | requirements.md | Migrated |
| 02 - Analysis | 🔄 | - | - | Needs validation |
| 03 - Architecture | ⏳ | - | - | Pending |
| 04 - Design | ⏳ | - | - | Pending |
| 05 - Security | ⏳ | - | - | Pending |
| 06 - Implementation | ⏳ | - | - | Pending |
| 07 - Testing | ⏳ | - | - | Pending |
| 08 - Optimization | ⏳ | - | - | Pending |
| 09 - Deployment | ⏳ | - | - | Pending |
| 10 - Handoff | ⏳ | - | - | Pending |

## Architectural Decisions
- Migration from v1.0 to v2.0 completed
- State files converted to new format
- Output directory structure updated

## Completed Features
- Project migration and state reconstruction

## Known Issues
- Manual validation required for migrated outputs
- Some outputs may need regeneration
- Quality gates need to be run for validation

## Next Steps
1. Validate migrated outputs
2. Run quality gates for current stage
3. Continue with corrected pipeline execution
EOF
    
    echo "PROJECT_STATE.md created successfully"
}

# Execute migration functions
migrate_next_action
create_project_state

echo "State file migration completed"
```

Make the script executable and run it:

```bash
chmod +x migrate_state_files.sh
./migrate_state_files.sh
```

### Step 5: Validate Migrated Content

#### 5.1 Content Quality Validation

Check the quality of migrated content:

```bash
# Check for common migration issues
echo "Validating migrated content..."

# Check for broken references
grep -r "TODO\|FIXME\|INCOMPLETE" prompts/outputs/ || echo "No obvious issues found"

# Check file completeness
find prompts/outputs -name "*.md" -size 0 && echo "Warning: Empty files found" || echo "No empty files"

# Validate markdown format
for file in $(find prompts/outputs -name "*.md"); do
    if ! head -1 "$file" | grep -q "^#"; then
        echo "Warning: $file may not have proper markdown header"
    fi
done
```

#### 5.2 State Consistency Check

Verify state consistency:

```bash
# Check state file consistency
if [ -f NEXT_ACTION.md ] && [ -f prompts/outputs/PROJECT_STATE.md ]; then
    echo "State files present - checking consistency..."
    
    # Extract stages from both files
    NEXT_STAGE=$(grep -E "Current Stage" NEXT_ACTION.md | head -1)
    STATE_PROGRESS=$(grep -E "✅|🔄" prompts/outputs/PROJECT_STATE.md | wc -l)
    
    echo "Next action stage: $NEXT_STAGE"
    echo "Completed stages: $STATE_PROGRESS"
else
    echo "Warning: Missing state files"
fi
```

### Step 6: Test New System

#### 6.1 Basic Functionality Test

Test the new system with a simple continuation:

```bash
# Test system responsiveness
echo "Testing new system..."

# Check if system can read state
if [ -f NEXT_ACTION.md ]; then
    echo "✅ NEXT_ACTION.md readable"
else
    echo "❌ NEXT_ACTION.md missing"
fi

# Check output directory structure
if [ -d prompts/outputs/specifications ]; then
    echo "✅ New directory structure in place"
else
    echo "❌ Directory structure needs creation"
fi
```

#### 6.2 Pipeline Continuation Test

Test pipeline continuation with the new system:

1. **Read Current State**: Verify the system can read migrated state
2. **Load Context**: Check context loading from migrated files
3. **Execute Next Stage**: Test stage execution with new templates
4. **Update State**: Verify state updates work correctly

### Step 7: Handle Migration Issues

#### Common Migration Issues and Solutions

##### Issue 1: Incompatible Output Formats
**Problem**: Old outputs don't match new template expectations

**Solution**:
```bash
# Regenerate problematic outputs
echo "Regenerating incompatible outputs..."

# Move old outputs to archive
mkdir -p prompts/outputs/archive/pre-v2
mv prompts/outputs/specifications/*.md prompts/outputs/archive/pre-v2/ 2>/dev/null || true

# Mark for regeneration in NEXT_ACTION.md
echo "
## Migration Notes
- Some outputs archived due to format incompatibility
- Regeneration required for: specifications, architecture
- Use archived content as reference during regeneration
" >> NEXT_ACTION.md
```

##### Issue 2: Missing Context Information
**Problem**: Migrated files lack context needed for new system

**Solution**:
```bash
# Create context reconstruction file
cat > prompts/outputs/MIGRATION_CONTEXT.md << EOF
# Migration Context

## Original Project Information
$(cat MY_PROJECT.md 2>/dev/null || echo "Original project brief not available")

## Pre-Migration State
- Migration Date: $(date)
- Original System: v1.0
- Migrated Files: $(find backups/pre-v2-migration -name "*.md" | wc -l) files

## Context Reconstruction Notes
- Manual review required for architectural decisions
- Some context may need to be recreated
- Reference backup files for original content

## Action Items
- [ ] Review and validate all migrated outputs
- [ ] Regenerate outputs with missing context
- [ ] Update architectural decisions documentation
- [ ] Validate pipeline can continue successfully
EOF
```

##### Issue 3: Stage Mapping Conflicts
**Problem**: Old stage numbering doesn't align with new pipeline

**Solution**:
1. **Manual Stage Assessment**: Review current project progress
2. **Conservative Mapping**: Map to earlier stage if uncertain
3. **Validation Required**: Run quality gates to confirm stage readiness

### Step 8: Post-Migration Validation

#### 8.1 Comprehensive System Test

Run a complete system validation:

```bash
# Create validation script
cat > validate_migration.sh << 'EOF'
#!/bin/bash

echo "=== AI Prompt Library v2.0 Migration Validation ==="
echo

# Check system components
echo "1. System Components:"
[ -f prompts/AGENTS.md ] && echo "✅ AGENTS.md updated" || echo "❌ AGENTS.md missing"
[ -d docs/guides ] && echo "✅ Documentation guides present" || echo "❌ Documentation missing"
echo

# Check project state
echo "2. Project State:"
[ -f NEXT_ACTION.md ] && echo "✅ NEXT_ACTION.md present" || echo "❌ NEXT_ACTION.md missing"
[ -f prompts/outputs/PROJECT_STATE.md ] && echo "✅ PROJECT_STATE.md present" || echo "❌ PROJECT_STATE.md missing"
echo

# Check directory structure
echo "3. Directory Structure:"
for dir in specifications architecture design security implementation testing optimization deployment handoff; do
    [ -d "prompts/outputs/$dir" ] && echo "✅ $dir directory" || echo "❌ $dir directory missing"
done
echo

# Check for migration artifacts
echo "4. Migration Artifacts:"
[ -d backups/pre-v2-migration ] && echo "✅ Backup created" || echo "❌ No backup found"
[ -f prompts/outputs/MIGRATION_CONTEXT.md ] && echo "✅ Migration context documented" || echo "ℹ️ No migration context"
echo

# Test basic functionality
echo "5. Basic Functionality:"
if grep -q "Stage.*Intake\|Stage.*Analysis" NEXT_ACTION.md 2>/dev/null; then
    echo "✅ Stage information readable"
else
    echo "❌ Stage information unclear"
fi

echo
echo "=== Migration Validation Complete ==="
EOF

chmod +x validate_migration.sh
./validate_migration.sh
```

#### 8.2 Quality Gate Validation

Run quality gates to ensure system integrity:

```bash
# Test quality gates (conceptual - actual implementation may vary)
echo "Running quality gate validation..."

# Check state consistency
echo "- State consistency: $([ -f NEXT_ACTION.md ] && [ -f prompts/outputs/PROJECT_STATE.md ] && echo "PASS" || echo "FAIL")"

# Check output completeness
OUTPUT_COUNT=$(find prompts/outputs -name "*.md" | wc -l)
echo "- Output files: $OUTPUT_COUNT found"

# Check for critical errors
ERROR_COUNT=$(grep -r "ERROR\|FAILED" prompts/outputs/ 2>/dev/null | wc -l)
echo "- Critical errors: $ERROR_COUNT found"
```

### Step 9: Documentation and Cleanup

#### 9.1 Document Migration

Create comprehensive migration documentation:

```bash
cat > MIGRATION_REPORT.md << EOF
# Migration Report: v1.0 to v2.0

## Migration Summary
- **Date**: $(date)
- **Duration**: [Record actual duration]
- **Status**: [SUCCESS/PARTIAL/FAILED]

## Files Migrated
- Backup Location: backups/pre-v2-migration/$(date +%Y%m%d_%H%M%S)/
- Files Processed: $(find backups/pre-v2-migration -name "*.md" | wc -l)
- New Structure Created: ✅

## Issues Encountered
[Document any issues and their resolutions]

## Manual Actions Required
- [ ] Validate all migrated outputs
- [ ] Run complete pipeline test
- [ ] Update project documentation
- [ ] Train team on new system

## Rollback Plan
If migration fails:
1. Stop current system
2. Restore from backup: \`cp -r backups/pre-v2-migration/latest/* .\`
3. Revert to v1.0 system
4. Document issues for future migration attempt

## Next Steps
1. Complete post-migration validation
2. Run first pipeline continuation test
3. Update team documentation
4. Schedule training on new features
EOF
```

#### 9.2 Cleanup Migration Artifacts

After successful validation, clean up temporary files:

```bash
# Clean up migration scripts (keep backups)
rm -f migrate_state_files.sh validate_migration.sh

# Archive migration logs
mkdir -p logs/migration/
mv MIGRATION_REPORT.md logs/migration/
mv migration.log logs/migration/ 2>/dev/null || true

echo "Migration cleanup completed"
```

## Compatibility Layer

For gradual migration, a compatibility layer can be implemented:

### Compatibility Script

```bash
#!/bin/bash
# compatibility_layer.sh - Provides backward compatibility

# Function to handle old-style commands
handle_legacy_command() {
    local command="$1"
    
    case "$command" in
        "old_stage_*")
            echo "Legacy command detected: $command"
            echo "Mapping to new v2.0 equivalent..."
            # Map old commands to new system
            ;;
        *)
            echo "Command not recognized as legacy"
            ;;
    esac
}

# Check for legacy usage patterns
if grep -q "old_pattern" NEXT_ACTION.md 2>/dev/null; then
    echo "Legacy patterns detected - applying compatibility layer"
    handle_legacy_command "$@"
fi
```

## Rollback Procedures

If migration fails or issues are discovered:

### Emergency Rollback

```bash
#!/bin/bash
# emergency_rollback.sh

echo "Performing emergency rollback to v1.0..."

# Stop current processes
pkill -f "ai-prompt-library" 2>/dev/null || true

# Restore from backup
BACKUP_DIR=$(ls -1t backups/pre-v2-migration/ | head -1)
if [ -n "$BACKUP_DIR" ]; then
    echo "Restoring from: $BACKUP_DIR"
    
    # Restore files
    cp -r "backups/pre-v2-migration/$BACKUP_DIR/"* .
    
    # Restore system version
    # [Version-specific restoration steps]
    
    echo "Rollback completed"
    echo "System restored to pre-migration state"
else
    echo "ERROR: No backup found for rollback"
    exit 1
fi
```

## Training and Adoption

### Team Training Checklist

- [ ] **New Pipeline Overview**: 10-stage corrected pipeline
- [ ] **State Management**: Enhanced state tracking and resumability
- [ ] **Quality Gates**: Validation at each stage transition
- [ ] **Error Recovery**: Graceful failure handling
- [ ] **Documentation**: Traceability and decision recording
- [ ] **Performance**: Token optimization and efficiency
- [ ] **Troubleshooting**: Common issues and solutions

### Gradual Adoption Strategy

1. **Phase 1**: Migrate development projects
2. **Phase 2**: Train team on new features
3. **Phase 3**: Migrate production projects
4. **Phase 4**: Deprecate v1.0 compatibility

## Conclusion

This migration guide provides comprehensive steps for transitioning from the previous AI Prompt Library implementation to the corrected v2.0 system. The migration process includes:

- Complete backup and safety procedures
- Systematic state and content migration
- Comprehensive validation and testing
- Rollback procedures for safety
- Training and adoption strategies

Following this guide ensures a smooth transition to the enhanced v2.0 system with minimal disruption to existing projects.

For additional support during migration, refer to the troubleshooting guide and system documentation.