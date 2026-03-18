# Project State Files Template

## Purpose
Define the exact state files that must be created and maintained to enable seamless continuation across different chats, IDEs, and AI agents. These files are the "wiring" that allows any AI to pick up exactly where the last one left off with a simple "Continue" or "Resume" command.

## Instructions
When initializing a project with the AI Prompt Library, create these state files in the project root. Update them after every stage completion. Any AI agent reading these files should know exactly what to do next without any additional context.

## Examples
```markdown
## Example: NEXT_ACTION.md after Stage 02 completion

# NEXT ACTION

**Status**: Ready to continue
**Current Stage**: Stage 02 - Charter ✅ COMPLETE
**Next Stage**: Stage 03 - Architecture

## To Continue
Tell your AI: "Continue" or "Resume"

## What Happens Next
The AI will:
1. Read the project state from `prompts/outputs/`
2. Load Stage 03 templates from `.ai-prompts/prompts/stages/stage-03-architecture/`
3. Generate architecture specifications based on the charter
4. Output to `prompts/outputs/specifications/architecture.md`
5. Update this file with Stage 04 as the next action

## Context Files
- Charter: `prompts/outputs/specifications/charter.md`
- Requirements: `prompts/outputs/specifications/requirements.md`
- Project Brief: `MY_PROJECT.md`
```

---

## Required State Files

### 1. NEXT_ACTION.md (Primary Control File)

This is the **single file** any AI agent reads to know what to do. It must be self-contained and actionable.

**Note**: After Stage 10 completion, this file MUST transition to indicate Execution Phase, NOT mark the project as complete.

```markdown
# NEXT ACTION

**Status**: [Ready to continue | Waiting for user input | Blocked | Complete]
**Current Phase**: [Planning | Building | Finishing]
**Mode**: [Standard | Dry-Run]
**Current Stage**: [Stage name] [✅ COMPLETE | 🚧 IN PROGRESS | ⏳ PENDING]
**Next Action**: [Clear one-line instruction]
**Last Updated**: [Timestamp]

## Context Checkpoint
**Last Completed**: [Brief summary of last action]
**Current Goal**: [What we are trying to achieve right now]
**Context State**: [OK | High Usage - Checkpoint Soon]

## To Continue
Tell your AI: "Continue" or "Resume"

## What Happens Next

### If in Specification Phase (Stages 01-10):
The AI will:
1. [Specific stage action]
2. Generate specifications to prompts/outputs/
3. Update this file with the next stage

### If in Execution Phase (Post Stage 10):
The AI will:
1. Read current task from EXECUTION_PROGRESS.md
2. Write actual source code files
3. Create tests and validate
4. Update execution progress
5. Continue to next task

## If Starting Fresh
If this is a new chat/session, the AI should:
1. Read `.ai-prompts/prompts/AGENTS.md` for library instructions
2. Read `MY_PROJECT.md` for project brief
3. Read `prompts/outputs/PROJECT_STATE.md` for current state
4. If in Execution Phase, read `EXECUTION_PROGRESS.md`
5. Execute the next action above

## Context Files (Read These First)
- Project Brief: `MY_PROJECT.md`
- Current State: `prompts/outputs/PROJECT_STATE.md`
- Execution Progress: `EXECUTION_PROGRESS.md` (if in Execution Phase)
- Stage Templates: `.ai-prompts/prompts/stages/[stage-name]/`
- Execution Guide: `.ai-prompts/prompts/templates/execution-phase.md`

## Blocking Issues
[None | List any issues that must be resolved before continuing]
```

### 2. EXECUTION_PROGRESS.md (Execution Phase Tracking)

Located at project root. **Created after Stage 10 completion** to track actual code implementation.

```markdown
# Execution Progress

**Phase**: Execution (Building from Specifications)
**Started**: [Timestamp]
**Last Updated**: [Timestamp]

## Overall Progress

| Category | Total Tasks | Completed | In Progress | Remaining |
|----------|-------------|-----------|-------------|-----------|
| Project Setup | X | X | X | X |
| Frontend | X | X | X | X |
| Backend | X | X | X | X |
| Database | X | X | X | X |
| Testing | X | X | X | X |
| Deployment | X | X | X | X |

## Current Focus

**Active Task**: [Task ID and Title from task-lists]
**Task Source**: prompts/outputs/task-lists/[file].md#task-X
**Status**: [In Progress / Blocked / Complete]
**Expected Deliverable**: [Actual files to be created]

### Completed Steps for Current Task
- [x] Step 1: Description - DONE
- [x] Step 2: Description - DONE
- [ ] Step 3: Description (current)
- [ ] Step 4: Description

### Files Being Created/Modified
| File Path | Status | Action |
|-----------|--------|--------|
| src/components/Example.tsx | Created | New component |
| src/services/api.ts | Modified | Added endpoint |
| tests/Example.test.tsx | Pending | Unit tests |

## Completed Tasks Log

### [Date] - Task 1.1: Initialize Project
- **Duration**: 30 minutes
- **Files Created**: package.json, tsconfig.json, .gitignore
- **Tests**: N/A (setup task)
- **Notes**: Used Next.js with TypeScript

### [Date] - Task 1.2: Set Up Database Connection
- **Duration**: 45 minutes
- **Files Created**: src/db/connection.ts, prisma/schema.prisma
- **Tests**: src/db/__tests__/connection.test.ts
- **Notes**: Using PostgreSQL with Prisma ORM

## Blocking Issues

[None | List issues and required resolution]

## Code Artifacts Summary

```
Project Root/
├── src/
│   ├── components/     [X files created]
│   ├── services/       [X files created]
│   ├── utils/          [X files created]
│   └── pages/          [X files created]
├── tests/              [X test files, X% coverage]
├── config/             [X config files]
└── docs/               [X documentation files]
```

## Validation Checkpoints

- [ ] All unit tests passing
- [ ] Integration tests passing
- [ ] Application builds without errors
- [ ] Core user flows working
- [ ] Deployment validated locally
- [ ] Performance benchmarks met

## For Continuing Agents

**CRITICAL**: You are in EXECUTION PHASE - write ACTUAL CODE, not more specifications.

1. Read "Current Focus" for active task
2. Check "Completed Steps" to see where we are
3. Continue from the first unchecked step
4. Write actual code files (not just descriptions)
5. Run tests to validate
6. Update this file after each significant action
7. Mark task complete when all acceptance criteria met
8. Move to next task from task-lists
```

## If Starting Fresh
If this is a new chat/session, the AI should:
1. Read `.ai-prompts/prompts/AGENTS.md` for library instructions
2. Read `MY_PROJECT.md` for project brief
3. Read `prompts/outputs/PROJECT_STATE.md` for current state
4. Execute the next action above

## Context Files (Read These First)
- Project Brief: `MY_PROJECT.md`
- Current State: `prompts/outputs/PROJECT_STATE.md`
- Stage Templates: `.ai-prompts/prompts/stages/[stage-name]/`

## Blocking Issues
[None | List any issues that must be resolved before continuing]
```

### 2. PROJECT_STATE.md (Comprehensive State)

Located at `prompts/outputs/PROJECT_STATE.md`, this file contains the complete project state.

```markdown
# Project State

**Project**: [Project name from brief]
**Created**: [Timestamp]
**Last Updated**: [Timestamp]
**Library Version**: [AI Prompt Library version]
**COVE Enabled**: [Yes/No]
**Token Level**: [Low/Medium/High]

## Pipeline Progress

| Stage | Status | Completed | Output Files | COVE Applied |
|-------|--------|-----------|--------------|--------------|
| 01 - Intake | ✅ Complete | [Date] | requirements.md | ✅ |
| 02 - Charter | ✅ Complete | [Date] | charter.md | ✅ |
| 03 - Architecture | 🚧 In Progress | - | - | 🚧 |
| 04 - Features | ⏳ Pending | - | - | ⏳ |
| 05 - Testing | ⏳ Pending | - | - | ⏳ |
| 06 - Implementation | ⏳ Pending | - | - | ⏳ |
| 07 - Deployment | ⏳ Pending | - | - | - |
| 08 - Documentation | ⏳ Pending | - | - | - |
| 09 - Quality | ⏳ Pending | - | - | - |
| 10 - Handoff | ⏳ Pending | - | - | - |

## COVE Metrics

**Overall Verification Quality**: [High/Medium/Low]

| Metric | Count | Notes |
|--------|-------|-------|
| Verifications Performed | 0 | Total COVE verifications across all stages |
| Issues Found | 0 | Problems discovered through verification |
| Corrections Made | 0 | Changes applied after verification |
| High Confidence Outputs | 0 | Outputs with 90%+ confidence |
| Medium Confidence Outputs | 0 | Outputs with 70-89% confidence |
| Requires User Validation | 0 | Items flagged for user review |

### Issues Found by Type
- Security: 0
- Logic/Correctness: 0
- Completeness: 0
- Performance: 0
- Consistency: 0

### Confidence Improvement
- Average confidence before COVE: N/A
- Average confidence after COVE: N/A
- Improvement: N/A

## Current Stage Details

**Stage**: [Current stage name]
**Status**: [In Progress | Blocked | Waiting]
**Started**: [Timestamp]
**Progress**: [Description of what's done within this stage]
**COVE Status**: [Pending/In Progress/Complete]

### Completed in This Stage
- [Completed item 1]
- [Completed item 2]

### Remaining in This Stage
- [Remaining item 1]
- [Remaining item 2]

### COVE Verification Results (Current Stage)
- ✅ Verified correct: [Count]
- ⚠️ Issues corrected: [Count]
- 📝 Enhancements added: [Count]
- Confidence level: [High/Medium/Low]

## Key Decisions

| Decision | Stage | Rationale |
|----------|-------|-----------|
| [Decision 1] | [Stage] | [Why] |
| [Decision 2] | [Stage] | [Why] |

## Technology Stack

- **Frontend**: [Technology]
- **Backend**: [Technology]
- **Database**: [Technology]
- **Deployment**: [Platform]
- **Authentication**: [Method]

## Output Files Generated

```
prompts/outputs/
├── specifications/
│   ├── requirements.md      [✅ Generated]
│   ├── charter.md           [✅ Generated]
│   ├── architecture.md      [⏳ Pending]
│   └── features.md          [⏳ Pending]
├── task-lists/
│   ├── implementation-master-plan.md [⏳ Pending]
│   ├── task-list-index.md            [⏳ Pending]
│   └── *-tasks.md                    [⏳ Pending]
└── documentation/
    ├── api-docs.md          [⏳ Pending]
    └── user-guides.md       [⏳ Pending]
```

## For New AI Agents

If you're a new AI agent joining this project:

1. **Read the library instructions**: `.ai-prompts/prompts/AGENTS.md`
2. **Read the project brief**: `MY_PROJECT.md`
3. **Read the current stage template**: `.ai-prompts/prompts/stages/[current-stage]/`
4. **Check NEXT_ACTION.md** for what to do next
5. **Continue from where the last agent left off**

You have full context. Just execute the next action.
```

### 3. DECISION_LOG.md (Decision History)

Located at `prompts/outputs/DECISION_LOG.md`:

```markdown
# Decision Log

All architectural and technical decisions made during project specification.

## Decisions

### [Date] - [Decision Title]
**Stage**: [Stage where decision was made]
**Decision**: [What was decided]
**Rationale**: [Why this decision was made]
**Alternatives Considered**: [Other options that were evaluated]
**Impact**: [How this affects the project]

---

### [Date] - [Decision Title]
...
```

---

## State Update Protocol

### After Each Stage Completion

1. **Update NEXT_ACTION.md**:
   - Change current stage to ✅ COMPLETE
   - Set next stage
   - Update "What Happens Next" section
   - Clear any blocking issues

2. **Update PROJECT_STATE.md**:
   - Mark stage as complete in pipeline table
   - Add completion date
   - List output files generated
   - Update "Current Stage Details" to next stage

3. **Update DECISION_LOG.md**:
   - Add any decisions made during the stage

### Example State Transition

**Before Stage 03 completion:**
```markdown
# NEXT_ACTION.md
**Current Stage**: Stage 03 - Architecture 🚧 IN PROGRESS
**Next Stage**: Stage 04 - Features
```

**After Stage 03 completion:**
```markdown
# NEXT_ACTION.md
**Current Stage**: Stage 03 - Architecture ✅ COMPLETE
**Next Stage**: Stage 04 - Features

## What Happens Next
The AI will:
1. Load Stage 04 templates from `.ai-prompts/prompts/stages/stage-04-features/`
2. Read architecture decisions from `prompts/outputs/specifications/architecture.md`
3. Generate detailed feature specifications
4. Output to `prompts/outputs/specifications/features.md`
5. Update this file with Stage 05 as the next action
```

---

## Initialization Template

When a project is first set up, create these initial state files:

### Initial NEXT_ACTION.md
```markdown
# NEXT ACTION

**Status**: Ready to continue
**Current Stage**: Stage 01 - Intake ⏳ PENDING
**Next Stage**: Stage 01 - Intake (Start)
**Last Updated**: [Timestamp]

## To Continue
Tell your AI: "Continue" or "Resume"

## What Happens Next
The AI will:
1. Read your project brief from `MY_PROJECT.md`
2. Load Stage 01 templates from `.ai-prompts/prompts/stages/stage-01-intake/`
3. Process your brief to extract requirements
4. Generate `prompts/outputs/specifications/requirements.md`
5. Update this file with Stage 02 as the next action

## If Starting Fresh
If this is a new chat/session, the AI should:
1. Read `.ai-prompts/prompts/AGENTS.md` for library instructions
2. Read `MY_PROJECT.md` for project brief
3. Execute Stage 01 - Intake

## Context Files
- Project Brief: `MY_PROJECT.md`
- Library Instructions: `.ai-prompts/prompts/AGENTS.md`
- Stage Templates: `.ai-prompts/prompts/stages/stage-01-intake/`

## Blocking Issues
None
```

### Initial PROJECT_STATE.md
```markdown
# Project State

**Project**: [From MY_PROJECT.md brief]
**Created**: [Timestamp]
**Last Updated**: [Timestamp]
**Library Version**: 2.0

## Pipeline Progress

| Stage | Status | Completed | Output Files |
|-------|--------|-----------|--------------|
| 01 - Intake | ⏳ Pending | - | - |
| 02 - Charter | ⏳ Pending | - | - |
| 03 - Architecture | ⏳ Pending | - | - |
| 04 - Features | ⏳ Pending | - | - |
| 05 - Testing | ⏳ Pending | - | - |
| 06 - Implementation | ⏳ Pending | - | - |
| 07 - Deployment | ⏳ Pending | - | - |
| 08 - Documentation | ⏳ Pending | - | - |
| 09 - Quality | ⏳ Pending | - | - |
| 10 - Handoff | ⏳ Pending | - | - |

## Current Stage Details

**Stage**: Stage 01 - Intake
**Status**: Pending
**Started**: -
**Progress**: Not started

## Key Decisions

No decisions made yet.

## Technology Stack

To be determined during Stage 03 - Architecture.

## Output Files Generated

```
prompts/outputs/
└── (empty - will be populated as stages complete)
```

## For New AI Agents

1. Read `.ai-prompts/prompts/AGENTS.md`
2. Read `MY_PROJECT.md`
3. Check `NEXT_ACTION.md` for what to do
4. Execute the next action
```

---

## Resume Protocol

When an AI agent receives "Continue" or "Resume":

1. **Read NEXT_ACTION.md** - This tells you exactly what to do
2. **If context is needed**, read the files listed in "Context Files"
3. **Execute the next action** as described in "What Happens Next"
4. **Update state files** after completion
5. **Set up the next action** for the following stage

This protocol ensures any AI agent can continue the project with minimal user interaction.
