# Agentic Engineering Runtime – Migration Guide

## Overview

This guide covers migrating from the legacy AI Prompt Library to the Agentic Engineering Runtime.

## Migration Strategy

The migration uses a **hybrid mode** approach – both systems coexist during the transition.

### Phase 1: Prepare (No disruption)
1. Install the new runtime alongside existing prompts
2. Run the compatibility checker:
   ```typescript
   import { CompatibilityChecker } from './src/validation/compatibility-checker';
   const checker = new CompatibilityChecker();
   const result = checker.check(currentApi, previousApi);
   ```
3. Take a snapshot before proceeding:
   ```typescript
   import { RollbackManager } from './src/migration/rollback-manager';
   const rm = new RollbackManager();
   rm.takeSnapshot('pre-migration', 'legacy', [], currentState);
   ```

### Phase 2: Adapt (Hybrid mode)
1. Convert legacy prompts to skills:
   ```typescript
   import { PromptLibraryAdapter } from './src/migration/prompt-library-adapter';
   const adapter = new PromptLibraryAdapter();
   const skills = adapter.adaptAll(legacyPrompts);
   ```
2. Enable hybrid mode:
   ```typescript
   import { HybridModeCoordinator } from './src/migration/hybrid-mode-coordinator';
   const coordinator = new HybridModeCoordinator();
   coordinator.setMode('hybrid');
   coordinator.registerFlag({ name: 'planning', mode: 'modern', enabled: true });
   ```
3. Migrate artifacts:
   ```typescript
   import { ArtifactMigrator } from './src/migration/artifact-migrator';
   const migrator = new ArtifactMigrator(storage);
   const results = await migrator.migrateAll(files);
   console.log(migrator.generateReport(results));
   ```

### Phase 3: Validate
1. Run regression tests against saved baselines
2. Verify confidence scores meet thresholds
3. Check integration consistency

### Phase 4: Cutover
1. Switch to modern mode: `coordinator.setMode('modern')`
2. Monitor for 48 hours
3. If issues arise, roll back: `rm.rollbackToLatest()`

## Compatibility Matrix

| Feature | Legacy | Hybrid | Modern |
|---------|--------|--------|--------|
| Prompt templates | ✅ | ✅ | Via adapter |
| Orchestrator scripts | ✅ | ✅ | Replaced by PlanningAgent |
| Status files | ✅ | ✅ | Replaced by StateManager |
| Skill definitions | ❌ | ✅ | ✅ |
| Quality gates | ❌ | ✅ | ✅ |
| Repair loops | ❌ | ❌ | ✅ |

## Rollback Procedure

If the migration causes issues:

1. `coordinator.setMode('legacy')` – Immediately routes all traffic to legacy
2. `rm.rollbackToLatest()` – Restores pre-migration state
3. Investigate logs via `LogAggregator.search({ since: migrationStart })`
4. File a report and retry after fixes
