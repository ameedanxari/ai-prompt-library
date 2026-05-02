# Schema Alignment Pass Orchestrator

This orchestrator is invoked in **Step 3.7** of the `drill-down-engine.md`. Its goal is to take the high-quality narrative implementation prompts produced in Step 3 and augment them with the machine-parseable metadata required for automated execution.

## Context

You have finished generating all `tasks-*.md` files. These files are rich in implementation detail but are missing the "Task Card" metadata (`File:`, `Change type:`, `Depends on:`, etc.) that the DPROMPT validator and executor require.

## Objective

Iterate through every `tasks-*.md` file in `prompts/outputs/current/` and inject a standardized metadata block at the top of each file.

## Hard Rules

1.  **Extract, don't invent:** Read the existing narrative content to determine the correct `File:` path and `Change type:`.
2.  **Cross-platform Awareness (MANDATORY):** If the project targets multiple platforms (e.g. iOS + Android), each task that contains platform-specific source code MUST include paths for BOTH platforms in the `File:` field using the pipe separator: `\`ios/path\` | \`android/path\``. Only files that are inherently single-platform (`.xcprivacy`, `fastlane/`, `.github/workflows/`, `AndroidManifest.xml`) may omit the second platform.
3.  **Dependency Mapping:** Link tasks to their prerequisites. (e.g., UI depends on Service, Service depends on Data Model/Design Tokens). Every non-`none` Depends-on entry MUST include a parenthetical reason.
4.  **No Hallucinations:** Do not add files or features that aren't in the narrative.
5.  **Strict Formatting:** Use the Markdown bullet format shown below.
6.  **All 6 Fields Required:** Every single task file MUST have ALL 6 metadata fields. No field may be omitted. The validator (`validate-instantiation.sh`) enforces this mechanically — missing fields will fail the Revise Gate.

## Output Schema

Inject this block immediately after the `# Prompt — <Name>` title:

```markdown
- **Closes user story:** As a <role>, I <want/need> <action>, so that <value>.
- **Change type:** <create-new | modify-existing>
- **File:** `<ios_path>` | `<android_path>`
- **Depends on:** <tasks-other.md | none> (reason)
- **Test:** <verification command/steps>
- **Estimated LOC:** <+N | -N | ~N>
```

### Cross-platform `File:` field rules

| Scenario | Format | Example |
|----------|--------|---------|
| Dual-platform app logic | `ios/path` \| `android/path` | `\`ios/StorageCleaner/Services/ML/DuplicateDetector.swift\` \| \`android/app/src/main/java/com/creatrixe/storagecleaner/service/ml/DuplicateDetector.kt\`` |
| iOS-only config | `ios/path` only | `\`ios/StorageCleaner/Resources/PrivacyInfo.xcprivacy\`` |
| CI/CD / Fastlane | shared path only | `\`.github/workflows/build.yml\`` |
| Localization resources | `ios/path` \| `android/path` | `\`ios/.../Localizable.xcstrings\` \| \`android/app/src/main/res/values/strings.xml\`` |

## Workflow

1.  **Load the Map:** Read `epics.md` and all `features-*.md` files to understand the high-level dependency graph. Read the `_Project platforms:_` line in `epics.md` to determine whether cross-platform paths are required.
2.  **Batch Process:** Open 5–10 task files at a time.
3.  **Analyze & Inject:** For each file, read the guidance, identify the file path(s) for EACH declared platform, write the metadata, and save.
4.  **Cross-Platform Audit:** After injecting all metadata, run a pass specifically checking that every dual-platform task has both an `ios/` and `android/` path in its `File:` field. Flag any that are missing.
5.  **DAG Validation:** After all metadata is injected, verify the `Depends on:` graph is acyclic (no circular dependencies). The validator does this mechanically, but catching cycles during the alignment pass is faster than waiting for the Revise Gate.
6.  **Final Audit:** Run `bash scripts/finalize.sh` to verify that the dependency graph is acyclic, all paths are unique, and all metadata fields are present.

## Common Defects to Watch For

These patterns were identified in the StorageCleaner field test and are now mechanically checked by the validator:

| Defect | What Happened | Prevention |
|--------|---------------|------------|
| Missing metadata | 9 of 78 files had zero metadata fields | All 6 fields enforced per file |
| iOS-only paths | 69 files had `ios/` path but no `android/` path | Pipe-separator format required |
| Path in wrong directory | `Services/Media/` vs `Services/MediaScanner/` | Cross-reference narrative code blocks |
| Dangling dependency | `Depends on: tasks-foo.md` but `tasks-foo.md` doesn't exist | Validator check 5c-ii |
| Dependency cycle | A→B→C→A deadlocks the executor | DAG validation via Kahn's algorithm |

## Trigger Phrase

Invoke this orchestrator when the user says: **"Perform Schema Alignment Pass"** or after Step 3 of the drill-down engine is complete.
